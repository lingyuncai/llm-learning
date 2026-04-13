import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface OpDispatch {
  opId: string;
  opName: string;
  opType: 'matmul' | 'attention' | 'norm' | 'activation' | 'custom';
  backend: 'triton' | 'cublas' | 'cpu' | 'flash_attention' | 'tensorrt';
  computeTimeMs: number;
  transferTimeMs: number;
}

interface DispatchStrategy {
  id: string;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  dispatches: OpDispatch[];
  totalTimeMs: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Constants ─── */

const W = 800;
const H = 480;

const BACKEND_COLORS: Record<string, string> = {
  triton: COLORS.primary,
  cublas: COLORS.green,
  cpu: COLORS.orange,
  flash_attention: HEAD_COLORS[5],
  tensorrt: COLORS.purple,
};

const BACKEND_LABELS: Record<string, { zh: string; en: string }> = {
  triton: { zh: 'GPU/Triton', en: 'GPU/Triton' },
  cublas: { zh: 'GPU/cuBLAS', en: 'GPU/cuBLAS' },
  cpu: { zh: 'CPU Fallback', en: 'CPU Fallback' },
  flash_attention: { zh: 'FlashAttention', en: 'FlashAttention' },
  tensorrt: { zh: 'GPU/TensorRT', en: 'GPU/TensorRT' },
};

/* ─── Strategies ─── */

const STRATEGIES: DispatchStrategy[] = [
  {
    id: 'inductor',
    label: { zh: 'TorchInductor 默认', en: 'TorchInductor Default' },
    description: {
      zh: 'MatMul→cuBLAS, 逐元素→Triton, Norm→Triton, Attention→FlashAttention',
      en: 'MatMul→cuBLAS, Element-wise→Triton, Norm→Triton, Attention→FlashAttention',
    },
    dispatches: [
      { opId: 'qkv', opName: 'QKV Proj', opType: 'matmul', backend: 'cublas', computeTimeMs: 0.42, transferTimeMs: 0 },
      { opId: 'attn', opName: 'Attention', opType: 'attention', backend: 'flash_attention', computeTimeMs: 0.35, transferTimeMs: 0 },
      { opId: 'proj', opName: 'Out Proj', opType: 'matmul', backend: 'cublas', computeTimeMs: 0.38, transferTimeMs: 0 },
      { opId: 'ln1', opName: 'LayerNorm', opType: 'norm', backend: 'triton', computeTimeMs: 0.08, transferTimeMs: 0 },
      { opId: 'ffn_up', opName: 'FFN Up', opType: 'matmul', backend: 'cublas', computeTimeMs: 0.45, transferTimeMs: 0 },
      { opId: 'gelu', opName: 'GeLU', opType: 'activation', backend: 'triton', computeTimeMs: 0.05, transferTimeMs: 0 },
      { opId: 'ffn_down', opName: 'FFN Down', opType: 'matmul', backend: 'cublas', computeTimeMs: 0.42, transferTimeMs: 0 },
      { opId: 'ln2', opName: 'LayerNorm', opType: 'norm', backend: 'triton', computeTimeMs: 0.08, transferTimeMs: 0 },
    ],
    totalTimeMs: 2.23,
  },
  {
    id: 'all_triton',
    label: { zh: '全 Triton', en: 'All Triton' },
    description: {
      zh: '所有 op 通过 Triton 生成 — Triton MatMul 对标准 shape 可能慢于 cuBLAS',
      en: 'All ops via Triton — Triton matmul may be slower than cuBLAS for standard shapes',
    },
    dispatches: [
      { opId: 'qkv', opName: 'QKV Proj', opType: 'matmul', backend: 'triton', computeTimeMs: 0.55, transferTimeMs: 0 },
      { opId: 'attn', opName: 'Attention', opType: 'attention', backend: 'triton', computeTimeMs: 0.48, transferTimeMs: 0 },
      { opId: 'proj', opName: 'Out Proj', opType: 'matmul', backend: 'triton', computeTimeMs: 0.50, transferTimeMs: 0 },
      { opId: 'ln1', opName: 'LayerNorm', opType: 'norm', backend: 'triton', computeTimeMs: 0.08, transferTimeMs: 0 },
      { opId: 'ffn_up', opName: 'FFN Up', opType: 'matmul', backend: 'triton', computeTimeMs: 0.58, transferTimeMs: 0 },
      { opId: 'gelu', opName: 'GeLU', opType: 'activation', backend: 'triton', computeTimeMs: 0.05, transferTimeMs: 0 },
      { opId: 'ffn_down', opName: 'FFN Down', opType: 'matmul', backend: 'triton', computeTimeMs: 0.55, transferTimeMs: 0 },
      { opId: 'ln2', opName: 'LayerNorm', opType: 'norm', backend: 'triton', computeTimeMs: 0.08, transferTimeMs: 0 },
    ],
    totalTimeMs: 2.87,
  },
  {
    id: 'mixed_cpu',
    label: { zh: '混合 + CPU Fallback', en: 'Mixed + CPU Fallback' },
    description: {
      zh: '大部分在 GPU，一个自定义 op 回退到 CPU — GPU→CPU→GPU 传输成为瓶颈',
      en: 'Mostly GPU, one custom op falls back to CPU — GPU→CPU→GPU transfer becomes bottleneck',
    },
    dispatches: [
      { opId: 'qkv', opName: 'QKV Proj', opType: 'matmul', backend: 'cublas', computeTimeMs: 0.42, transferTimeMs: 0 },
      { opId: 'attn', opName: 'Attention', opType: 'attention', backend: 'flash_attention', computeTimeMs: 0.35, transferTimeMs: 0 },
      { opId: 'proj', opName: 'Out Proj', opType: 'matmul', backend: 'cublas', computeTimeMs: 0.38, transferTimeMs: 0 },
      { opId: 'ln1', opName: 'Custom Norm', opType: 'custom', backend: 'cpu', computeTimeMs: 1.8, transferTimeMs: 0.5 },
      { opId: 'ffn_up', opName: 'FFN Up', opType: 'matmul', backend: 'cublas', computeTimeMs: 0.45, transferTimeMs: 0 },
      { opId: 'gelu', opName: 'GeLU', opType: 'activation', backend: 'triton', computeTimeMs: 0.05, transferTimeMs: 0 },
      { opId: 'ffn_down', opName: 'FFN Down', opType: 'matmul', backend: 'cublas', computeTimeMs: 0.42, transferTimeMs: 0 },
      { opId: 'ln2', opName: 'LayerNorm', opType: 'norm', backend: 'triton', computeTimeMs: 0.08, transferTimeMs: 0 },
    ],
    totalTimeMs: 4.45,
  },
];

/* ─── Component ─── */

export default function MultiBackendDispatch({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '多 Backend 分发',
      strategy: '分发策略',
      totalTime: '总时间',
      compute: '计算',
      transfer: '传输',
      warning: '一次 CPU 回退可能主导整体执行时间',
      legend: '图例',
      opGraph: 'Transformer Layer 算子',
      perfBreakdown: '性能分解',
      transferLabel: 'GPU↔CPU 传输',
      slowdown: '减速',
      vs: '对比默认',
    },
    en: {
      title: 'Multi-Backend Dispatch',
      strategy: 'Dispatch Strategy',
      totalTime: 'Total Time',
      compute: 'Compute',
      transfer: 'Transfer',
      warning: 'One CPU fallback can dominate total execution time',
      legend: 'Legend',
      opGraph: 'Transformer Layer Ops',
      perfBreakdown: 'Performance Breakdown',
      transferLabel: 'GPU↔CPU Transfer',
      slowdown: 'Slowdown',
      vs: 'vs Default',
    },
  }[locale]!;

  const [strategyId, setStrategyId] = useState('inductor');

  const strategy = STRATEGIES.find(s => s.id === strategyId)!;
  const defaultTotal = STRATEGIES[0].totalTimeMs;
  const maxTime = Math.max(...STRATEGIES.map(s => s.totalTimeMs));

  // Layout
  const opGraphTop = 65;
  const opNodeW = 78;
  const opNodeH = 42;
  const opGap = 10;
  const totalOpW = strategy.dispatches.length * (opNodeW + opGap) - opGap;
  const opStartX = (W - totalOpW) / 2;

  // Performance bar
  const perfTop = 280;
  const perfBarMaxW = W - 160;
  const perfBarH = 26;
  const perfGap = 6;

  const timeScale = (ms: number) => (ms / maxTime) * perfBarMaxW;

  return (
    <div className="my-6">
      {/* Strategy selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {STRATEGIES.map(s => (
          <button
            key={s.id}
            onClick={() => setStrategyId(s.id)}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              background: strategyId === s.id ? COLORS.primary : COLORS.bgAlt,
              color: strategyId === s.id ? '#fff' : COLORS.dark,
              border: `1px solid ${strategyId === s.id ? COLORS.primary : COLORS.light}`,
            }}
          >
            {s.label[locale]}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <rect width={W} height={H} fill={COLORS.bg} rx="8" />

        {/* Strategy description */}
        <text x={W / 2} y="22" fontSize="11" fill={COLORS.mid} textAnchor="middle">
          {strategy.description[locale]}
        </text>

        {/* Legend */}
        <g transform="translate(30, 36)">
          <text x="0" y="0" fontSize="10" fill={COLORS.mid} fontWeight="600">{t.legend}:</text>
          {Object.entries(BACKEND_LABELS).map(([key, label], i) => (
            <g key={key} transform={`translate(${i * 130 + 45}, -8)`}>
              <rect width="10" height="10" fill={BACKEND_COLORS[key]} rx="2" />
              <text x="14" y="9" fontSize="9" fill={COLORS.mid}>{label[locale]}</text>
            </g>
          ))}
          <g transform={`translate(${5 * 130 + 45}, -8)`}>
            <rect width="10" height="10" fill={COLORS.waste} rx="2" />
            <text x="14" y="9" fontSize="9" fill={COLORS.mid}>{t.transferLabel}</text>
          </g>
        </g>

        {/* Op graph - horizontal flow */}
        <g transform={`translate(0, ${opGraphTop})`}>
          <text x="25" y="-3" fontSize="11" fill={COLORS.dark} fontWeight="600">{t.opGraph}</text>

          {strategy.dispatches.map((op, i) => {
            const x = opStartX + i * (opNodeW + opGap);
            const backendColor = BACKEND_COLORS[op.backend];
            const isCpu = op.backend === 'cpu';

            return (
              <g key={`${strategyId}-${op.opId}`}>
                {/* Connection arrow */}
                {i > 0 && (
                  <line
                    x1={x - opGap}
                    y1={opNodeH / 2}
                    x2={x}
                    y2={opNodeH / 2}
                    stroke={COLORS.light}
                    strokeWidth="1.5"
                    markerEnd="url(#dispatch-arrow)"
                  />
                )}

                {/* Op node */}
                <motion.rect
                  x={x}
                  y={0}
                  width={opNodeW}
                  height={opNodeH}
                  fill={backendColor}
                  rx="5"
                  opacity={0.88}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.88, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                />

                {/* Op name */}
                <text x={x + opNodeW / 2} y={17} fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600">
                  {op.opName}
                </text>

                {/* Backend label */}
                <text x={x + opNodeW / 2} y={32} fontSize="8" fill="rgba(255,255,255,0.85)" textAnchor="middle">
                  {BACKEND_LABELS[op.backend][locale]}
                </text>

                {/* CPU warning */}
                {isCpu && (
                  <g>
                    <text x={x + opNodeW / 2} y={opNodeH + 16} fontSize="14" textAnchor="middle">
                      ⚠
                    </text>
                    {/* Transfer arrows */}
                    {i > 0 && (
                      <g>
                        <text x={x - 5} y={opNodeH + 14} fontSize="7" fill={COLORS.red} textAnchor="end">
                          GPU→CPU
                        </text>
                      </g>
                    )}
                    {i < strategy.dispatches.length - 1 && (
                      <g>
                        <text x={x + opNodeW + 5} y={opNodeH + 14} fontSize="7" fill={COLORS.red}>
                          CPU→GPU
                        </text>
                      </g>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Separator */}
        <line x1="30" y1={perfTop - 25} x2={W - 30} y2={perfTop - 25} stroke={COLORS.light} strokeWidth="1" />
        <text x="25" y={perfTop - 8} fontSize="11" fill={COLORS.dark} fontWeight="600">{t.perfBreakdown}</text>

        {/* Performance breakdown bars */}
        <g transform={`translate(120, ${perfTop})`}>
          {strategy.dispatches.map((op, i) => {
            const y = i * (perfBarH + perfGap);
            const computeW = timeScale(op.computeTimeMs);
            const transferW = timeScale(op.transferTimeMs);
            const isCpu = op.backend === 'cpu';

            return (
              <g key={`perf-${strategyId}-${op.opId}`}>
                {/* Op label */}
                <text x="-8" y={y + perfBarH / 2 + 4} fontSize="10" fill={COLORS.dark} textAnchor="end" fontWeight="500">
                  {op.opName}
                </text>

                {/* Compute bar */}
                <motion.rect
                  x={0}
                  y={y}
                  width={Math.max(computeW, 2)}
                  height={perfBarH}
                  fill={BACKEND_COLORS[op.backend]}
                  rx="3"
                  opacity={0.85}
                  initial={{ width: 0 }}
                  animate={{ width: Math.max(computeW, 2) }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                />

                {/* Transfer bar (if any) */}
                {transferW > 0 && (
                  <motion.rect
                    x={computeW}
                    y={y}
                    width={transferW}
                    height={perfBarH}
                    fill={COLORS.waste}
                    rx="0"
                    initial={{ width: 0 }}
                    animate={{ width: transferW }}
                    transition={{ duration: 0.4, delay: i * 0.04 + 0.1 }}
                  />
                )}

                {/* Time label */}
                <text
                  x={computeW + transferW + 6}
                  y={y + perfBarH / 2 + 4}
                  fontSize="9"
                  fill={isCpu ? COLORS.red : COLORS.mid}
                  fontWeight={isCpu ? '600' : '400'}
                >
                  {op.computeTimeMs.toFixed(2)}ms
                  {op.transferTimeMs > 0 ? ` + ${op.transferTimeMs.toFixed(2)}ms ${t.transfer}` : ''}
                </text>
              </g>
            );
          })}

          {/* Total time bar */}
          {(() => {
            const y = strategy.dispatches.length * (perfBarH + perfGap) + 8;
            return (
              <g>
                <line x1={-100} y1={y - 4} x2={perfBarMaxW} y2={y - 4} stroke={COLORS.light} strokeWidth="1" />
                <text x={-8} y={y + 14} fontSize="11" fill={COLORS.dark} textAnchor="end" fontWeight="700">
                  {t.totalTime}
                </text>
                <rect x={0} y={y} width={timeScale(strategy.totalTimeMs)} height={20} fill={COLORS.dark} rx="3" opacity={0.15} />
                <text x={timeScale(strategy.totalTimeMs) + 8} y={y + 14} fontSize="12" fill={COLORS.dark} fontWeight="700">
                  {strategy.totalTimeMs.toFixed(2)} ms
                  {strategyId !== 'inductor' && (
                    <tspan fill={COLORS.red} fontSize="11">
                      {' '}({t.slowdown}: {(strategy.totalTimeMs / defaultTotal).toFixed(2)}× {t.vs})
                    </tspan>
                  )}
                </text>
              </g>
            );
          })()}
        </g>

        {/* CPU fallback warning */}
        {strategyId === 'mixed_cpu' && (
          <g transform={`translate(${W / 2}, ${H - 22})`}>
            <rect x={-200} y={-14} width={400} height={24} fill={COLORS.waste} rx="4" />
            <text x={0} y={2} fontSize="11" fill={COLORS.red} textAnchor="middle" fontWeight="600">
              ⚠ {t.warning}
            </text>
          </g>
        )}

        {/* Arrow defs */}
        <defs>
          <marker id="dispatch-arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 6 2.5, 0 5" fill={COLORS.light} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
