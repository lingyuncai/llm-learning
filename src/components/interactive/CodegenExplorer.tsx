import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface CodegenExample {
  id: string;
  label: { zh: string; en: string };
  fxGraph: string;
  tritonCode: string;
  highlights: { line: number; description: { zh: string; en: string } }[];
  stats: {
    kernelCount: number;
    regsPerThread: number;
    sharedMemory: number;
  };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const EXAMPLES: CodegenExample[] = [
  {
    id: 'elementwise',
    label: { zh: 'Element-wise 融合', en: 'Element-wise Fusion' },
    fxGraph: `# FX Graph
x = placeholder('x')    # [1024, 768]
t1 = relu(x)
t2 = mul(t1, 0.5)
y = add(t2, bias)
output(y)`,
    tritonCode: `@triton.jit
def fused_relu_mul_add(
    x_ptr, bias_ptr, out_ptr,
    N, BLOCK: tl.constexpr = 1024):
  pid = tl.program_id(0)
  offs = pid * BLOCK + tl.arange(0, BLOCK)
  mask = offs < N
  # Load (1 HBM read)
  x = tl.load(x_ptr + offs, mask=mask)
  bias = tl.load(bias_ptr + offs % 768)
  # Fused computation (all in registers)
  t1 = tl.maximum(x, 0.0)   # relu
  t2 = t1 * 0.5              # mul
  y = t2 + bias              # add
  tl.store(out_ptr + offs, y, mask=mask)`,
    highlights: [
      { line: 9, description: { zh: '单次 HBM 读取，避免中间 tensor 写回', en: 'Single HBM read, avoids intermediate tensor writeback' } },
      { line: 12, description: { zh: '3 个操作在 register 中完成，零额外内存开销', en: '3 ops completed in registers, zero extra memory overhead' } },
    ],
    stats: { kernelCount: 1, regsPerThread: 12, sharedMemory: 0 },
  },
  {
    id: 'reduction',
    label: { zh: 'Reduction (LayerNorm)', en: 'Reduction (LayerNorm)' },
    fxGraph: `# FX Graph
x = placeholder('x')       # [32, 768]
mean = reduce_mean(x, -1)   # [32]
var = reduce_var(x, -1)     # [32]
x_norm = (x - mean) / sqrt(var + eps)
y = x_norm * gamma + beta
output(y)`,
    tritonCode: `@triton.jit
def fused_layernorm(
    x_ptr, gamma_ptr, beta_ptr, out_ptr,
    N, D, eps, BLOCK_D: tl.constexpr = 768):
  row = tl.program_id(0)
  offs = tl.arange(0, BLOCK_D)
  x = tl.load(x_ptr + row * D + offs)
  # Reduction in registers
  mean = tl.sum(x, axis=0) / D
  x_centered = x - mean
  var = tl.sum(x_centered * x_centered, 0) / D
  x_norm = x_centered / tl.sqrt(var + eps)
  gamma = tl.load(gamma_ptr + offs)
  beta = tl.load(beta_ptr + offs)
  y = x_norm * gamma + beta`,
    highlights: [
      { line: 7, description: { zh: '整行数据一次性加载到 register', en: 'Entire row loaded into registers at once' } },
      { line: 9, description: { zh: 'Mean 和 Var 在 register 中计算，无需写回 HBM', en: 'Mean and Var computed in registers, no HBM writeback needed' } },
    ],
    stats: { kernelCount: 1, regsPerThread: 48, sharedMemory: 0 },
  },
  {
    id: 'matmul',
    label: { zh: 'MatMul + Bias + ReLU', en: 'MatMul + Bias + ReLU' },
    fxGraph: `# FX Graph
x = placeholder('x')      # [128, 768]
w = placeholder('w')      # [768, 3072]
bias = placeholder('bias') # [3072]
mm = matmul(x, w)
t1 = add(mm, bias)
y = relu(t1)
output(y)`,
    tritonCode: `@triton.jit
def fused_mm_bias_relu(x_ptr, w_ptr,
    bias_ptr, out_ptr, M, N, K, ...):
  pid_m = tl.program_id(0)
  pid_n = tl.program_id(1)
  acc = tl.zeros((BM, BN), dtype=tl.float32)
  for k in range(0, K, BK):
    a = tl.load(...)  # [BM, BK]
    b = tl.load(...)  # [BK, BN]
    acc += tl.dot(a, b)  # Tensor Core
  # Epilogue: bias + relu (fused)
  bias = tl.load(bias_ptr + n_offs)
  acc = tl.maximum(acc + bias, 0.0)
  tl.store(out_ptr + ..., acc)`,
    highlights: [
      { line: 6, description: { zh: 'FP32 累加器，避免 FP16 精度损失', en: 'FP32 accumulator, avoids FP16 precision loss' } },
      { line: 10, description: { zh: 'tl.dot 映射到 Tensor Core MMA 指令', en: 'tl.dot maps to Tensor Core MMA instructions' } },
      { line: 13, description: { zh: 'Epilogue fusion: bias + relu 在 register 中完成', en: 'Epilogue fusion: bias + relu completed in registers' } },
    ],
    stats: { kernelCount: 1, regsPerThread: 64, sharedMemory: 32768 },
  },
];

/* ─── Helpers ─── */

const PANEL_W = 360;
const CODE_Y_START = 140;
const LINE_HEIGHT = 15;

/* ─── Component ─── */

export default function CodegenExplorer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'TorchInductor 代码生成',
      fxGraphLabel: 'FX Graph (输入)',
      tritonLabel: 'Triton Kernel (输出)',
      arrowLabel: 'TorchInductor\nCodegen',
      kernels: 'Kernel 数量',
      regs: 'Registers/线程',
      smem: '共享内存',
    },
    en: {
      title: 'TorchInductor Code Generation',
      fxGraphLabel: 'FX Graph (Input)',
      tritonLabel: 'Triton Kernel (Output)',
      arrowLabel: 'TorchInductor\nCodegen',
      kernels: 'Kernel Count',
      regs: 'Registers/Thread',
      smem: 'Shared Memory',
    },
  }[locale]!;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const example = EXAMPLES[selectedIdx];
  const fxLines = example.fxGraph.split('\n');
  const tritonLines = example.tritonCode.split('\n');

  const highlightLineSet = new Set(example.highlights.map(h => h.line));

  function renderCodePanel(
    lines: string[],
    x: number,
    bgColor: string,
    borderColor: string,
    highlights?: Set<number>,
    onHoverLine?: (line: number | null) => void,
  ) {
    const panelH = Math.max(lines.length * LINE_HEIGHT + 20, 200);
    return (
      <g>
        {/* Panel background */}
        <rect
          x={x}
          y={CODE_Y_START}
          width={PANEL_W}
          height={panelH}
          rx={6}
          fill={bgColor}
          fillOpacity={0.5}
          stroke={borderColor}
          strokeWidth={1}
          strokeOpacity={0.3}
        />
        {/* Code lines */}
        {lines.map((line, idx) => {
          const lineY = CODE_Y_START + 18 + idx * LINE_HEIGHT;
          const isHighlighted = highlights?.has(idx + 1);
          return (
            <g
              key={idx}
              onMouseEnter={() => onHoverLine?.(idx + 1)}
              onMouseLeave={() => onHoverLine?.(null)}
              style={{ cursor: isHighlighted ? 'pointer' : 'default' }}
            >
              {/* Highlight background */}
              {isHighlighted && (
                <rect
                  x={x}
                  y={lineY - 10.5}
                  width={PANEL_W}
                  height={LINE_HEIGHT}
                  fill={HEAD_COLORS[2]}
                  fillOpacity={0.12}
                />
              )}
              {/* Highlight left stripe */}
              {isHighlighted && (
                <rect
                  x={x}
                  y={lineY - 10.5}
                  width={3}
                  height={LINE_HEIGHT}
                  fill={HEAD_COLORS[2]}
                  rx={1}
                />
              )}
              {/* Line number */}
              <text
                x={x + 16}
                y={lineY}
                fontSize="9"
                fontFamily={FONTS.mono}
                fill={COLORS.mid}
                fillOpacity={0.5}
                textAnchor="end"
              >
                {idx + 1}
              </text>
              {/* Code text */}
              <text
                x={x + 22}
                y={lineY}
                fontSize="9.5"
                fontFamily={FONTS.mono}
                fill={line.startsWith('#') ? COLORS.mid : COLORS.dark}
                fontWeight={isHighlighted ? 600 : 400}
              >
                {line.length > 55 ? line.slice(0, 55) + '…' : line}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  // Find the hovered highlight description
  const hoveredHighlight = hoveredLine
    ? example.highlights.find(h => h.line === hoveredLine)
    : null;

  const codeAreaH = Math.max(fxLines.length, tritonLines.length) * LINE_HEIGHT + 20;
  const svgH = CODE_Y_START + codeAreaH + 90;

  return (
    <div className="my-6">
      {/* Example selector buttons */}
      <div className="flex gap-2 mb-3">
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.id}
            onClick={() => { setSelectedIdx(i); setHoveredLine(null); }}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: i === selectedIdx ? COLORS.primary : COLORS.bgAlt,
              color: i === selectedIdx ? '#fff' : COLORS.dark,
              border: `1px solid ${i === selectedIdx ? COLORS.primary : COLORS.light}`,
            }}
          >
            {ex.label[locale]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={example.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <svg viewBox={`0 0 800 ${svgH}`} className="w-full">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>

            {/* Arrow marker */}
            <defs>
              <marker
                id="codegenArrow"
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.primary} fillOpacity="0.6" />
              </marker>
            </defs>

            {/* Title */}
            <text x={400} y={24} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
              {t.title}
            </text>

            {/* Panel labels */}
            <text x={20} y={CODE_Y_START - 14} fontSize="11" fontWeight="600" fill={COLORS.primary}>
              {t.fxGraphLabel}
            </text>
            <text x={420} y={CODE_Y_START - 14} fontSize="11" fontWeight="600" fill={COLORS.green}>
              {t.tritonLabel}
            </text>

            {/* Left panel: FX Graph */}
            {renderCodePanel(fxLines, 16, '#dbeafe', COLORS.primary)}

            {/* Center arrow */}
            <line
              x1={382}
              y1={CODE_Y_START + codeAreaH / 2}
              x2={412}
              y2={CODE_Y_START + codeAreaH / 2}
              stroke={COLORS.primary}
              strokeWidth={1.5}
              strokeOpacity={0.5}
              markerEnd="url(#codegenArrow)"
            />
            <text
              x={397}
              y={CODE_Y_START + codeAreaH / 2 - 14}
              textAnchor="middle"
              fontSize="8"
              fontWeight="600"
              fill={COLORS.primary}
              fillOpacity={0.7}
            >
              TorchInductor
            </text>
            <text
              x={397}
              y={CODE_Y_START + codeAreaH / 2 - 4}
              textAnchor="middle"
              fontSize="8"
              fontWeight="600"
              fill={COLORS.primary}
              fillOpacity={0.7}
            >
              Codegen
            </text>

            {/* Right panel: Triton Kernel */}
            {renderCodePanel(tritonLines, 418, '#dcfce7', COLORS.green, highlightLineSet, setHoveredLine)}

            {/* Tooltip for hovered highlight */}
            {hoveredHighlight && (
              <g>
                <rect
                  x={420}
                  y={CODE_Y_START + codeAreaH + 6}
                  width={PANEL_W}
                  height={28}
                  rx={4}
                  fill={HEAD_COLORS[2]}
                  fillOpacity={0.1}
                  stroke={HEAD_COLORS[2]}
                  strokeWidth={1}
                  strokeOpacity={0.3}
                />
                <text
                  x={430}
                  y={CODE_Y_START + codeAreaH + 24}
                  fontSize="9.5"
                  fill={COLORS.dark}
                  fontWeight="500"
                >
                  {hoveredHighlight.description[locale]}
                </text>
              </g>
            )}

            {/* Stats bar */}
            <rect
              x={16}
              y={svgH - 55}
              width={768}
              height={40}
              rx={6}
              fill={COLORS.bgAlt}
              stroke={COLORS.light}
              strokeWidth={1}
            />
            {/* Kernel count */}
            <text x={80} y={svgH - 30} textAnchor="middle" fontSize="18" fontWeight="700" fill={COLORS.primary}>
              {example.stats.kernelCount}
            </text>
            <text x={80} y={svgH - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
              {t.kernels}
            </text>

            {/* Registers */}
            <text x={320} y={svgH - 30} textAnchor="middle" fontSize="18" fontWeight="700" fill={COLORS.orange}>
              {example.stats.regsPerThread}
            </text>
            <text x={320} y={svgH - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
              {t.regs}
            </text>

            {/* Shared memory */}
            <text x={570} y={svgH - 30} textAnchor="middle" fontSize="18" fontWeight="700" fill={COLORS.green}>
              {example.stats.sharedMemory > 0 ? `${(example.stats.sharedMemory / 1024).toFixed(0)} KB` : '0'}
            </text>
            <text x={570} y={svgH - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
              {t.smem}
            </text>
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
