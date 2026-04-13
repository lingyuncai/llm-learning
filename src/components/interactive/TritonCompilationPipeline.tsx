import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface PipelineStage {
  id: string;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  codeSnippet: string;
  color: string;
  transform: { zh: string; en: string };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const STAGES: PipelineStage[] = [
  {
    id: 'python',
    label: { zh: 'Triton Python DSL', en: 'Triton Python DSL' },
    description: {
      zh: '用户编写的 Python 代码，使用 @triton.jit 装饰器和 tl.* API',
      en: 'User-written Python code with @triton.jit decorator and tl.* APIs',
    },
    codeSnippet: `@triton.jit
def add_kernel(x_ptr, y_ptr, out_ptr,
               N, BLOCK: tl.constexpr):
    pid = tl.program_id(0)
    offs = pid * BLOCK + tl.arange(0, BLOCK)
    mask = offs < N
    x = tl.load(x_ptr + offs, mask=mask)
    y = tl.load(y_ptr + offs, mask=mask)
    tl.store(out_ptr + offs, x + y, mask=mask)`,
    color: HEAD_COLORS[0],
    transform: { zh: '', en: '' },
  },
  {
    id: 'triton_ir',
    label: { zh: 'Triton IR', en: 'Triton IR' },
    description: {
      zh: 'SSA 形式的中间表示，保留 block 语义，类型信息完整',
      en: 'SSA-form intermediate representation, retains block semantics, full type info',
    },
    codeSnippet: `tt.func @add_kernel(%x: !tt.ptr<f32>,
                   %y: !tt.ptr<f32>,
                   %out: !tt.ptr<f32>, %N: i32) {
  %pid = tt.get_program_id {axis=0} : i32
  %offs = tt.make_range {start=0, end=1024}
  %x_ptrs = tt.addptr %x, %offs
  %x_val = tt.load %x_ptrs, %mask
  ...
}`,
    color: HEAD_COLORS[1],
    transform: { zh: 'Python AST 解析 + 类型推导', en: 'Python AST parsing + type inference' },
  },
  {
    id: 'triton_gpu_ir',
    label: { zh: 'Triton GPU IR', en: 'Triton GPU IR' },
    description: {
      zh: '硬件映射层：确定 block \u2192 warp \u2192 thread 的映射，插入共享内存操作',
      en: 'Hardware mapping: determines block \u2192 warp \u2192 thread mapping, inserts shared memory ops',
    },
    codeSnippet: `tt.func @add_kernel(...)
    attributes {num_warps=4, threads_per_warp=32} {
  %pid = tt.get_program_id {axis=0} : i32
  // Blocked layout: 4 warps x 32 threads
  %x_val = tt.load %x_ptrs, %mask
      {layout = #ttg.blocked<{sizePerThread=[4],
                               threadsPerWarp=[32],
                               warpsPerCTA=[4]}}>
  ...
}`,
    color: HEAD_COLORS[2],
    transform: { zh: 'Layout 分配 + Warp 映射 + Shared Memory 插入', en: 'Layout assignment + Warp mapping + Shared memory insertion' },
  },
  {
    id: 'llvm_ir',
    label: { zh: 'LLVM IR', en: 'LLVM IR' },
    description: {
      zh: '通过 MLIR 转换为 LLVM IR，block 语义完全展开为标量/向量操作',
      en: 'Converted to LLVM IR via MLIR, block semantics fully expanded to scalar/vector ops',
    },
    codeSnippet: `define void @add_kernel(ptr %x, ptr %y,
                        ptr %out, i32 %N) {
  %tid = call i32 @llvm.nvvm.read.ptx.sreg.tid.x()
  %pid = call i32 @llvm.nvvm.read.ptx.sreg.ctaid.x()
  %idx = add i32 %base, %tid
  %xp = getelementptr float, ptr %x, i32 %idx
  %xv = load <4 x float>, ptr %xp
  ...
}`,
    color: HEAD_COLORS[3],
    transform: { zh: 'MLIR Lowering: Triton Dialect \u2192 LLVM Dialect', en: 'MLIR Lowering: Triton Dialect \u2192 LLVM Dialect' },
  },
  {
    id: 'ptx',
    label: { zh: 'PTX Assembly', en: 'PTX Assembly' },
    description: {
      zh: 'NVIDIA 虚拟指令集，human-readable 汇编，最后一层可移植表示',
      en: 'NVIDIA virtual ISA, human-readable assembly, last portable representation',
    },
    codeSnippet: `.visible .entry add_kernel(
  .param .u64 x_ptr, .param .u64 y_ptr,
  .param .u64 out_ptr, .param .u32 N) {
  mov.u32 %r1, %tid.x;
  mov.u32 %r2, %ctaid.x;
  mad.lo.s32 %r3, %r2, 1024, %r1;
  ld.global.v4.f32 {%f1,%f2,%f3,%f4}, [%rd1];
  add.f32 %f5, %f1, %f9;
  st.global.v4.f32 [%rd3], {%f5,%f6,%f7,%f8};
}`,
    color: HEAD_COLORS[4],
    transform: { zh: 'LLVM Backend: NVPTX CodeGen', en: 'LLVM Backend: NVPTX CodeGen' },
  },
  {
    id: 'cubin',
    label: { zh: 'cubin (机器码)', en: 'cubin (Machine Code)' },
    description: {
      zh: 'GPU 可直接执行的二进制，由 ptxas 汇编器生成',
      en: 'GPU-executable binary, assembled by ptxas',
    },
    codeSnippet: `ELF 64-bit LSB executable
CUDA binary (cubin)
Architecture: sm_80 (A100)
Code size: 1,248 bytes
Registers: 24 per thread
Shared memory: 0 bytes
Max threads: 1024`,
    color: HEAD_COLORS[5],
    transform: { zh: 'ptxas 汇编器: PTX \u2192 SASS \u2192 cubin', en: 'ptxas assembler: PTX \u2192 SASS \u2192 cubin' },
  },
];

/* ─── Keywords for syntax highlighting ─── */

const KEYWORDS = [
  'def', 'func', 'define', '.entry', '.visible', '.param', 'void',
  'call', 'return', 'for', 'if', 'else', 'attributes',
  '@triton.jit', 'tl.constexpr',
];

const TYPE_KEYWORDS = [
  'i32', 'f32', 'ptr', 'float', 'u32', 'u64',
  '!tt.ptr<f32>',
];

/* ─── Component ─── */

export default function TritonCompilationPipeline({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Triton 编译管线',
      play: '自动播放',
      pause: '暂停',
      transformLabel: '转换：',
      codeLabel: '代码表示',
    },
    en: {
      title: 'Triton Compilation Pipeline',
      play: 'Auto-play',
      pause: 'Pause',
      transformLabel: 'Transform: ',
      codeLabel: 'Code Representation',
    },
  }[locale]!;

  const [activeStage, setActiveStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveStage(prev => {
          if (prev >= STAGES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const stage = STAGES[activeStage];
  const codeLines = stage.codeSnippet.split('\n');

  // Stage box dimensions
  const boxW = 105;
  const boxH = 44;
  const gap = 18;
  const startX = 20;
  const stageY = 50;
  const arrowLen = gap;

  function renderCodeLine(line: string, y: number, idx: number) {
    // Tokenize for syntax highlighting
    const parts: { text: string; bold: boolean; color: string }[] = [];
    let remaining = line;

    while (remaining.length > 0) {
      let earliest = remaining.length;
      let matchedKw = '';
      let kwType: 'keyword' | 'type' = 'keyword';

      for (const kw of KEYWORDS) {
        const idx = remaining.indexOf(kw);
        if (idx !== -1 && idx < earliest) {
          earliest = idx;
          matchedKw = kw;
          kwType = 'keyword';
        }
      }
      for (const kw of TYPE_KEYWORDS) {
        const idx = remaining.indexOf(kw);
        if (idx !== -1 && idx < earliest) {
          earliest = idx;
          matchedKw = kw;
          kwType = 'type';
        }
      }

      if (matchedKw) {
        if (earliest > 0) {
          parts.push({ text: remaining.slice(0, earliest), bold: false, color: COLORS.dark });
        }
        parts.push({
          text: matchedKw,
          bold: kwType === 'keyword',
          color: kwType === 'keyword' ? '#7c3aed' : '#0369a1',
        });
        remaining = remaining.slice(earliest + matchedKw.length);
      } else {
        parts.push({ text: remaining, bold: false, color: COLORS.dark });
        remaining = '';
      }
    }

    let xOff = 40;
    return (
      <g key={idx}>
        <text x={30} y={y} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono} textAnchor="end">
          {idx + 1}
        </text>
        {parts.map((p, pi) => {
          const el = (
            <text
              key={pi}
              x={xOff}
              y={y}
              fontSize="10.5"
              fontFamily={FONTS.mono}
              fill={p.color}
              fontWeight={p.bold ? 700 : 400}
            >
              {p.text}
            </text>
          );
          // Approximate char width for monospace
          xOff += p.text.length * 6.3;
          return el;
        })}
      </g>
    );
  }

  return (
    <div className="my-6">
      <svg viewBox="0 0 800 540" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Arrow marker */}
        <defs>
          <marker
            id="pipeArrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.mid} fillOpacity="0.5" />
          </marker>
        </defs>

        {/* Title */}
        <text x={400} y={24} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Play button */}
        <g
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false);
            } else {
              if (activeStage >= STAGES.length - 1) setActiveStage(0);
              setIsPlaying(true);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <rect x={680} y={10} width={100} height={24} rx={12} fill={isPlaying ? COLORS.red : COLORS.primary} fillOpacity={0.12} stroke={isPlaying ? COLORS.red : COLORS.primary} strokeWidth={1} />
          <text x={730} y={26} textAnchor="middle" fontSize="10" fontWeight="600" fill={isPlaying ? COLORS.red : COLORS.primary}>
            {isPlaying ? t.pause : t.play}
          </text>
        </g>

        {/* Pipeline stages */}
        {STAGES.map((s, i) => {
          const x = startX + i * (boxW + arrowLen);
          const isActive = i === activeStage;

          return (
            <g key={s.id}>
              {/* Arrow between stages */}
              {i > 0 && (
                <>
                  <line
                    x1={x - arrowLen + 2}
                    y1={stageY + boxH / 2}
                    x2={x - 3}
                    y2={stageY + boxH / 2}
                    stroke={COLORS.mid}
                    strokeWidth={1.2}
                    strokeOpacity={0.4}
                    markerEnd="url(#pipeArrow)"
                  />
                  {/* Flowing dot on arrow */}
                  <motion.circle
                    cx={x - arrowLen + 2}
                    cy={stageY + boxH / 2}
                    r={2.5}
                    fill={s.color}
                    animate={{ cx: [x - arrowLen + 2, x - 3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    opacity={0.6}
                  />
                </>
              )}

              {/* Stage box */}
              <motion.g
                onClick={() => { setActiveStage(i); setIsPlaying(false); }}
                style={{ cursor: 'pointer' }}
                animate={{
                  opacity: isActive ? 1 : 0.45,
                }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x={x}
                  y={stageY}
                  width={boxW}
                  height={boxH}
                  rx={6}
                  fill={s.color}
                  fillOpacity={isActive ? 0.15 : 0.06}
                  stroke={s.color}
                  strokeWidth={isActive ? 2 : 1}
                  strokeOpacity={isActive ? 1 : 0.4}
                />
                <text
                  x={x + boxW / 2}
                  y={stageY + (boxH / 2) - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={s.color}
                >
                  {s.label[locale]}
                </text>
                <text
                  x={x + boxW / 2}
                  y={stageY + (boxH / 2) + 8}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill={COLORS.mid}
                  fillOpacity={0.7}
                >
                  Stage {i + 1}
                </text>
              </motion.g>
            </g>
          );
        })}

        {/* Transform label between previous and current stage */}
        {activeStage > 0 && stage.transform[locale] && (
          <motion.text
            key={`transform-${activeStage}`}
            x={400}
            y={stageY + boxH + 25}
            textAnchor="middle"
            fontSize="10.5"
            fill={stage.color}
            fontWeight="600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {t.transformLabel}{stage.transform[locale]}
          </motion.text>
        )}

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.g
            key={stage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Panel background */}
            <rect
              x={20}
              y={140}
              width={760}
              height={390}
              rx={10}
              fill={stage.color}
              fillOpacity={0.03}
              stroke={stage.color}
              strokeWidth={1}
              strokeOpacity={0.2}
            />

            {/* Description section */}
            <text x={40} y={168} fontSize="12" fontWeight="700" fill={stage.color}>
              {stage.label[locale]}
            </text>
            <text x={40} y={188} fontSize="10.5" fill={COLORS.mid} style={{ maxWidth: 300 }}>
              {stage.description[locale]}
            </text>

            {/* Code section */}
            <text x={40} y={218} fontSize="10" fontWeight="600" fill={COLORS.dark}>
              {t.codeLabel}
            </text>

            {/* Code background */}
            <rect
              x={25}
              y={226}
              width={750}
              height={codeLines.length * 16 + 16}
              rx={6}
              fill={COLORS.dark}
              fillOpacity={0.04}
            />

            {/* Code lines */}
            {codeLines.map((line, idx) => renderCodeLine(line, 244 + idx * 16, idx))}
          </motion.g>
        </AnimatePresence>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setActiveStage(i); setIsPlaying(false); }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-colors"
            style={{
              backgroundColor: i === activeStage ? s.color : 'transparent',
              color: i === activeStage ? '#fff' : COLORS.mid,
              border: `1px solid ${i === activeStage ? s.color : COLORS.light}`,
            }}
          >
            <span className="font-mono text-[10px]">{i + 1}</span>
            {s.label[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
