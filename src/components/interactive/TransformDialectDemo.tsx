import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
}

type ScheduleKey = 'tile' | 'tileFuse' | 'tileFuseVec';

interface ScheduleInfo {
  label: { zh: string; en: string };
  script: string;
  output: string;
  perfEstimate: string;
  description: { zh: string; en: string };
  insight: { zh: string; en: string };
}

/* ─── Constants ─── */

const W = 800;
const H = 500;

const INPUT_IR = `func @matmul_relu(
    %A: tensor<512x512xf32>,
    %B: tensor<512x512xf32>)
    -> tensor<512x512xf32> {
  %init = linalg.init_tensor [512, 512]
      : tensor<512x512xf32>
  %C = linalg.matmul
      ins(%A, %B : tensor<512x512xf32>,
                   tensor<512x512xf32>)
      outs(%init : tensor<512x512xf32>)
      -> tensor<512x512xf32>
  %D = linalg.elemwise_unary {fun = relu}
      ins(%C : tensor<512x512xf32>)
      -> tensor<512x512xf32>
  return %D : tensor<512x512xf32>
}`;

const SCHEDULES: Record<ScheduleKey, ScheduleInfo> = {
  tile: {
    label: { zh: '仅 Tiling', en: 'Tile Only' },
    script: `// Schedule 1: Tile Only
transform.sequence failures(propagate) {
^bb0(%arg0: !transform.any_op):
  %matmul = transform.structured
    .match ops{["linalg.matmul"]}
    in %arg0 : (!transform.any_op)
    -> !transform.any_op
  %tiled, %loop0, %loop1, %loop2 =
    transform.structured.tile_using_for
    %matmul
    tile_sizes [128, 128, 32]
    : (!transform.any_op) -> (
      !transform.any_op,
      !transform.op<"scf.for">,
      !transform.op<"scf.for">,
      !transform.op<"scf.for">)
}`,
    output: `func @matmul_relu(%A, %B) {
  // Tiled matmul (NOT fused)
  scf.for %i = 0 to 512 step 128 {
    scf.for %j = 0 to 512 step 128 {
      scf.for %k = 0 to 512 step 32 {
        %a_tile = tensor.extract_slice
            %A[%i, %k] [128, 32]
        %b_tile = tensor.extract_slice
            %B[%k, %j] [32, 128]
        %c_partial = linalg.matmul
            ins(%a_tile, %b_tile)
            outs(%c_acc)
      }
    }
  }
  // relu is SEPARATE (not fused)
  %D = linalg.elemwise_unary {relu}
      ins(%C) -> tensor<512x512xf32>
  return %D
}`,
    perfEstimate: '~60%',
    description: {
      zh: '仅对 matmul 进行 128×128×32 的 tiling，relu 保持独立。数据从 HBM 写出再读回。',
      en: 'Only tiles the matmul at 128x128x32. ReLU stays separate. Data round-trips through HBM.',
    },
    insight: {
      zh: '关键瓶颈：C 矩阵写入 HBM 后，relu 再读回，带宽浪费 2x',
      en: 'Key bottleneck: C written to HBM then re-read by relu, wasting 2x bandwidth',
    },
  },
  tileFuse: {
    label: { zh: 'Tile + Fuse', en: 'Tile + Fuse' },
    script: `// Schedule 2: Tile + Fuse
transform.sequence failures(propagate) {
^bb0(%arg0: !transform.any_op):
  %relu = transform.structured
    .match ops{["linalg.elemwise_unary"]}
    in %arg0 : (!transform.any_op)
    -> !transform.any_op
  %tiled_relu, %loop0, %loop1 =
    transform.structured.tile_using_for
    %relu tile_sizes [128, 128]
    : (!transform.any_op) -> (
      !transform.any_op,
      !transform.op<"scf.for">,
      !transform.op<"scf.for">)
  %matmul = transform.structured
    .match ops{["linalg.matmul"]}
    in %arg0 : (!transform.any_op)
    -> !transform.any_op
  %fused, %containing =
    transform.structured
    .fuse_into_containing_op
    %matmul into %loop0
    : (!transform.any_op,
       !transform.op<"scf.for">)
    -> (!transform.any_op,
        !transform.op<"scf.for">)
}`,
    output: `func @matmul_relu(%A, %B) {
  // Tiled + Fused: relu inside loop
  scf.for %i = 0 to 512 step 128 {
    scf.for %j = 0 to 512 step 128 {
      // matmul tile (fused into loop)
      %c_tile = scf.for %k = 0 to 512
                         step 32 {
        %a_tile = tensor.extract_slice
            %A[%i, %k] [128, 32]
        %b_tile = tensor.extract_slice
            %B[%k, %j] [32, 128]
        %partial = linalg.matmul
            ins(%a_tile, %b_tile)
            outs(%c_acc)
      }
      // relu FUSED — operates on tile
      %d_tile = linalg.elemwise_unary
          {relu} ins(%c_tile)
      // tile stays in cache/registers
      tensor.insert_slice %d_tile
          into %D[%i, %j] [128, 128]
    }
  }
  return %D
}`,
    perfEstimate: '~75%',
    description: {
      zh: 'Tile relu，然后将 matmul fuse 进 relu 的循环。C tile 在 SMEM/寄存器中直接被 relu 消费。',
      en: 'Tile relu, then fuse matmul into relu loops. C tile consumed by relu directly from SMEM/registers.',
    },
    insight: {
      zh: '消除了 C 矩阵的 HBM round-trip，带宽节省约 50%',
      en: 'Eliminates C matrix HBM round-trip, saving ~50% bandwidth',
    },
  },
  tileFuseVec: {
    label: { zh: 'Tile + Fuse + Vectorize', en: 'Tile + Fuse + Vectorize' },
    script: `// Schedule 3: Tile + Fuse + Vectorize
transform.sequence failures(propagate) {
^bb0(%arg0: !transform.any_op):
  // Step 1: Tile + Fuse (same as above)
  %relu = transform.structured
    .match ops{["linalg.elemwise_unary"]}
    in %arg0 : (!transform.any_op)
    -> !transform.any_op
  %tiled, %l0, %l1 =
    transform.structured.tile_using_for
    %relu tile_sizes [128, 128]
  %matmul = transform.structured
    .match ops{["linalg.matmul"]}
    in %arg0
  %fused, %cont =
    transform.structured
    .fuse_into_containing_op
    %matmul into %l0

  // Step 2: Vectorize both ops
  transform.structured.vectorize
    %fused {vectorize_padding}
  transform.structured.vectorize
    %tiled {vectorize_padding}

  // Step 3: Bufferize
  %func = transform.structured
    .match ops{["func.func"]} in %arg0
  transform.bufferization
    .one_shot_bufferize %func
    {bufferize_function_boundaries}
}`,
    output: `func @matmul_relu(%A, %B) {
  // Tiled + Fused + Vectorized
  scf.for %i = 0 to 512 step 128 {
    scf.for %j = 0 to 512 step 128 {
      scf.for %k = 0 to 512 step 32 {
        // Vectorized matmul tile
        %av = vector.transfer_read
            %A[%i, %k] : vector<128x32xf32>
        %bv = vector.transfer_read
            %B[%k, %j] : vector<32x128xf32>
        %cv = vector.contract
            {indexing_maps = [...],
             iterator_types =
               ["parallel","parallel",
                "reduction"]}
            %av, %bv, %c_acc
            : vector<128x32xf32>,
              vector<32x128xf32>
              into vector<128x128xf32>
      }
      // Vectorized fused relu
      %zero = arith.constant
          dense<0.0> : vector<128x128xf32>
      %dv = arith.maximumf %cv, %zero
          : vector<128x128xf32>
      vector.transfer_write
          %dv, %D[%i, %j]
    }
  }
  return %D
}`,
    perfEstimate: '~90%',
    description: {
      zh: '完整优化流水线：Tile → Fuse → Vectorize → Bufferize。利用 vector.contract 映射到 Tensor Core。',
      en: 'Full pipeline: Tile -> Fuse -> Vectorize -> Bufferize. vector.contract maps to Tensor Cores.',
    },
    insight: {
      zh: 'vector.contract 直接映射到 GPU Tensor Core 的 MMA 指令，实现接近峰值性能',
      en: 'vector.contract maps directly to GPU Tensor Core MMA instructions, achieving near-peak performance',
    },
  },
};

const SCHEDULE_KEYS: ScheduleKey[] = ['tile', 'tileFuse', 'tileFuseVec'];

/* ─── Helpers ─── */

function renderCodeBlock(
  code: string,
  x: number,
  y: number,
  width: number,
  maxLines: number,
  fontSize: number = 8.5,
): React.ReactNode[] {
  const lines = code.split('\n').slice(0, maxLines);
  return lines.map((line, i) => (
    <text key={i} x={x + 6} y={y + 14 + i * (fontSize + 2.5)}
      fontSize={fontSize} fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
      {line}
    </text>
  ));
}

/* ─── Component ─── */

export default function TransformDialectDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'MLIR Transform Dialect 演示',
      scheduleScript: '调度脚本 (Schedule)',
      inputIR: '输入 IR',
      outputIR: '输出 IR',
      perf: '预估性能',
      insight: '关键洞察',
      selectSchedule: '选择调度策略:',
    },
    en: {
      title: 'MLIR Transform Dialect Demo',
      scheduleScript: 'Schedule Script',
      inputIR: 'Input IR',
      outputIR: 'Output IR',
      perf: 'Est. Performance',
      insight: 'Key Insight',
      selectSchedule: 'Select schedule:',
    },
  }[locale]!;

  const [selected, setSelected] = useState<ScheduleKey>('tile');
  const schedule = SCHEDULES[selected];

  const panelY = 78;
  const panelH = 340;
  const scriptX = 15;
  const scriptW = 255;
  const inputX = 278;
  const inputW = 242;
  const outputX = 528;
  const outputW = 258;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; } .code { font-family: ${FONTS.mono}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* ─── Schedule Selector ─── */}
        <text x={20} y={46} fontSize="11" fontWeight="600" fill={COLORS.mid}>
          {t.selectSchedule}
        </text>
        {SCHEDULE_KEYS.map((key, i) => {
          const bx = 155 + i * 210;
          const isActive = selected === key;
          const colors = [COLORS.primary, COLORS.green, COLORS.purple];
          return (
            <g key={key} onClick={() => setSelected(key)} style={{ cursor: 'pointer' }}>
              <rect x={bx} y={32} width={200} height={28} rx={5}
                fill={isActive ? colors[i] : 'white'}
                stroke={colors[i]} strokeWidth={1.5} />
              <text x={bx + 100} y={50} textAnchor="middle" fontSize="11" fontWeight="700"
                fill={isActive ? 'white' : colors[i]}>
                {SCHEDULES[key].label[locale]}
              </text>
            </g>
          );
        })}

        {/* Performance bar */}
        <rect x={15} y={64} width={W - 30} height={10} rx={3} fill={COLORS.masked} />
        <motion.rect
          x={15} y={64} height={10} rx={3}
          fill={selected === 'tile' ? COLORS.primary : selected === 'tileFuse' ? COLORS.green : COLORS.purple}
          initial={false}
          animate={{ width: (W - 30) * parseFloat(schedule.perfEstimate) / 100 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <text x={W - 20} y={73} textAnchor="end" fontSize="9" fontWeight="700" fill={COLORS.dark}>
          {t.perf}: {schedule.perfEstimate}
        </text>

        {/* ─── Three Code Panels ─── */}

        {/* Panel 1: Schedule Script */}
        <rect x={scriptX} y={panelY} width={scriptW} height={panelH} rx={6}
          fill="#1e1e2e" stroke={COLORS.mid} strokeWidth={0.5} />
        <rect x={scriptX} y={panelY} width={scriptW} height={22} rx={6} fill={COLORS.primary} />
        <rect x={scriptX} y={panelY + 16} width={scriptW} height={6} fill={COLORS.primary} />
        <text x={scriptX + scriptW / 2} y={panelY + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
          {t.scheduleScript}
        </text>
        <AnimatePresence mode="wait">
          <motion.g
            key={selected + '-script'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {schedule.script.split('\n').slice(0, 30).map((line, i) => {
              const isComment = line.trimStart().startsWith('//');
              return (
                <text key={i} x={scriptX + 6} y={panelY + 36 + i * 10.2}
                  fontSize="7.8" fill={isComment ? '#6a9955' : '#d4d4d4'}
                  style={{ fontFamily: FONTS.mono }}>
                  {line}
                </text>
              );
            })}
          </motion.g>
        </AnimatePresence>

        {/* Panel 2: Input IR */}
        <rect x={inputX} y={panelY} width={inputW} height={panelH} rx={6}
          fill="#1e1e2e" stroke={COLORS.mid} strokeWidth={0.5} />
        <rect x={inputX} y={panelY} width={inputW} height={22} rx={6} fill={COLORS.orange} />
        <rect x={inputX} y={panelY + 16} width={inputW} height={6} fill={COLORS.orange} />
        <text x={inputX + inputW / 2} y={panelY + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
          {t.inputIR}
        </text>
        {INPUT_IR.split('\n').map((line, i) => {
          const isComment = line.trimStart().startsWith('//');
          const isKeyword = /\b(func|linalg|tensor|return)\b/.test(line);
          return (
            <text key={i} x={inputX + 6} y={panelY + 36 + i * 11}
              fontSize="8" fill={isComment ? '#6a9955' : isKeyword ? '#569cd6' : '#d4d4d4'}
              style={{ fontFamily: FONTS.mono }}>
              {line}
            </text>
          );
        })}

        {/* Arrows between panels */}
        <polygon points={`${inputX - 10},${panelY + panelH / 2 - 6} ${inputX - 2},${panelY + panelH / 2} ${inputX - 10},${panelY + panelH / 2 + 6}`}
          fill={COLORS.primary} />
        <polygon points={`${outputX - 10},${panelY + panelH / 2 - 6} ${outputX - 2},${panelY + panelH / 2} ${outputX - 10},${panelY + panelH / 2 + 6}`}
          fill={COLORS.green} />

        {/* Panel 3: Output IR */}
        <rect x={outputX} y={panelY} width={outputW} height={panelH} rx={6}
          fill="#1e1e2e" stroke={COLORS.mid} strokeWidth={0.5} />
        <rect x={outputX} y={panelY} width={outputW} height={22} rx={6} fill={COLORS.green} />
        <rect x={outputX} y={panelY + 16} width={outputW} height={6} fill={COLORS.green} />
        <text x={outputX + outputW / 2} y={panelY + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
          {t.outputIR}
        </text>
        <AnimatePresence mode="wait">
          <motion.g
            key={selected + '-output'}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {schedule.output.split('\n').slice(0, 32).map((line, i) => {
              const isComment = line.trimStart().startsWith('//');
              const isKeyword = /\b(func|scf\.for|linalg|tensor|vector|arith|return)\b/.test(line);
              const isHighlight = /\b(vector\.contract|vector\.transfer_read|vector\.transfer_write|fuse|relu|FUSED|SEPARATE|Vectorized|Fused)\b/i.test(line);
              return (
                <text key={i} x={outputX + 6} y={panelY + 36 + i * 9.8}
                  fontSize="7.8"
                  fill={isComment ? '#6a9955' : isHighlight ? '#dcdcaa' : isKeyword ? '#569cd6' : '#d4d4d4'}
                  fontWeight={isHighlight ? '700' : '400'}
                  style={{ fontFamily: FONTS.mono }}>
                  {line}
                </text>
              );
            })}
          </motion.g>
        </AnimatePresence>

        {/* ─── Bottom: Description + Insight ─── */}
        <rect x={15} y={panelY + panelH + 10} width={W - 30} height={62} rx={6}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

        <text x={25} y={panelY + panelH + 30} fontSize="11" fill={COLORS.dark} fontWeight="600">
          {schedule.description[locale]}
        </text>

        <text x={25} y={panelY + panelH + 50} fontSize="10" fill={COLORS.orange} fontWeight="600">
          {t.insight}: {schedule.insight[locale]}
        </text>

        <text x={W - 25} y={panelY + panelH + 30} textAnchor="end" fontSize="22" fontWeight="700"
          fill={selected === 'tile' ? COLORS.primary : selected === 'tileFuse' ? COLORS.green : COLORS.purple}
          fillOpacity={0.3}>
          {schedule.perfEstimate}
        </text>
      </svg>
    </div>
  );
}
