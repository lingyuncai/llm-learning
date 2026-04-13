import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface TensorInfo {
  id: string;
  name: string;
  shape: string;
  sizeKB: number;
  lastUse: string;
}

interface BufferAllocation {
  bufferId: string;
  tensors: string[];
  sizeKB: number;
  reason: { zh: string; en: string };
  isInPlace: boolean;
}

/* ─── Data ─── */

const TENSORS: TensorInfo[] = [
  { id: 'x', name: 'input x', shape: '[128, 768]', sizeKB: 384, lastUse: 'matmul' },
  { id: 'w', name: 'weight w', shape: '[768, 768]', sizeKB: 2304, lastUse: 'matmul' },
  { id: 'matmul_out', name: 'matmul result', shape: '[128, 768]', sizeKB: 384, lastUse: 'relu' },
  { id: 'relu_out', name: 'relu result', shape: '[128, 768]', sizeKB: 384, lastUse: 'output' },
];

const BUFFERS: BufferAllocation[] = [
  {
    bufferId: 'buf_0', tensors: ['x'], sizeKB: 384,
    reason: { zh: '输入参数，独立 buffer', en: 'Input parameter, separate buffer' },
    isInPlace: false,
  },
  {
    bufferId: 'buf_1', tensors: ['w'], sizeKB: 2304,
    reason: { zh: '权重参数，独立 buffer', en: 'Weight parameter, separate buffer' },
    isInPlace: false,
  },
  {
    bufferId: 'buf_2', tensors: ['matmul_out', 'relu_out'], sizeKB: 384,
    reason: { zh: 'relu 可以 in-place：matmul_out 在 relu 后不再使用', en: 'relu can be in-place: matmul_out not used after relu' },
    isInPlace: true,
  },
];

/* ─── Tensor Colors ─── */

const TENSOR_COLORS: Record<string, string> = {
  x: '#1565c0',
  w: '#00838f',
  matmul_out: '#e65100',
  relu_out: '#6a1b9a',
};

/* ─── Constants ─── */

const W = 800;
const H = 450;

/* ─── Phases ─── */

type Phase = 'graph' | 'lifetime' | 'allocate' | 'result';
const PHASES: Phase[] = ['graph', 'lifetime', 'allocate', 'result'];

/* ─── Props ─── */

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Main Component ─── */

export default function BufferizationVisualizer({ locale = 'zh' }: Props) {
  const [phase, setPhase] = useState<Phase>('graph');
  const phaseIndex = PHASES.indexOf(phase);

  const t = {
    zh: {
      phases: ['计算图', '生命周期分析', '分配 Buffer', '最终结果'],
      tensorGraph: 'Tensor 计算图',
      memoryLayout: '内存 Buffer 布局',
      naiveTotal: '朴素分配',
      optimizedTotal: '优化后',
      saved: '节省',
      inPlace: 'In-Place',
      lifetime: '生命周期',
      lastUseLabel: '最后使用于',
      bufferLabel: 'Buffer',
      reason: '原因',
    },
    en: {
      phases: ['Compute Graph', 'Lifetime Analysis', 'Allocate Buffers', 'Final Result'],
      tensorGraph: 'Tensor Compute Graph',
      memoryLayout: 'Memory Buffer Layout',
      naiveTotal: 'Naive allocation',
      optimizedTotal: 'Optimized',
      saved: 'Saved',
      inPlace: 'In-Place',
      lifetime: 'Lifetime',
      lastUseLabel: 'Last used in',
      bufferLabel: 'Buffer',
      reason: 'Reason',
    },
  }[locale];

  const naiveTotal = TENSORS.reduce((s, t) => s + t.sizeKB, 0);
  const optimizedTotal = BUFFERS.reduce((s, b) => s + b.sizeKB, 0);

  /* ─── Computation graph layout ─── */
  const graphNodes = [
    { id: 'x', x: 60, y: 80, label: 'input x', color: TENSOR_COLORS.x },
    { id: 'w', x: 60, y: 200, label: 'weight w', color: TENSOR_COLORS.w },
    { id: 'matmul', x: 200, y: 140, label: 'matmul', color: COLORS.mid, isOp: true },
    { id: 'matmul_out', x: 320, y: 140, label: 'matmul_out', color: TENSOR_COLORS.matmul_out },
    { id: 'relu', x: 420, y: 140, label: 'relu', color: COLORS.mid, isOp: true },
    { id: 'relu_out', x: 530, y: 140, label: 'relu_out', color: TENSOR_COLORS.relu_out },
  ];
  const graphEdges = [
    { from: 'x', to: 'matmul' },
    { from: 'w', to: 'matmul' },
    { from: 'matmul', to: 'matmul_out' },
    { from: 'matmul_out', to: 'relu' },
    { from: 'relu', to: 'relu_out' },
  ];

  function nodePos(id: string) {
    const n = graphNodes.find(n => n.id === id)!;
    return { x: n.x, y: n.y };
  }

  /* ─── Lifetime bars ─── */
  const steps = ['input', 'matmul', 'relu', 'output'];
  const lifetimeMap: Record<string, { start: number; end: number }> = {
    x: { start: 0, end: 1 },
    w: { start: 0, end: 1 },
    matmul_out: { start: 1, end: 2 },
    relu_out: { start: 2, end: 3 },
  };

  /* ─── Buffer rects ─── */
  const bufferMaxKB = Math.max(...BUFFERS.map(b => b.sizeKB));
  const bufBarMaxW = 200;

  return (
    <div className="my-6">
      {/* Phase stepper */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {PHASES.map((p, i) => {
          const phaseColors = [COLORS.primary, '#00838f', COLORS.orange, COLORS.green];
          return (
            <button
              key={p}
              onClick={() => setPhase(p)}
              style={{
                flex: 1, padding: '6px 8px', fontSize: '11px', fontWeight: 600,
                color: phase === p ? '#fff' : COLORS.dark,
                background: phase === p ? phaseColors[i]
                  : i <= phaseIndex ? `${phaseColors[i]}15` : `${COLORS.light}80`,
                border: `1px solid ${phase === p ? 'transparent' : COLORS.light}`,
                borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                textAlign: 'center',
              }}
            >
              {t.phases[i]}
            </button>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* ─── Phase: graph ─── */}
        {phase === 'graph' && (
          <g>
            <text x={W / 2} y={30} textAnchor="middle" fontSize="13" fontWeight="700"
              fill={COLORS.dark}>{t.tensorGraph}</text>

            {/* Edges */}
            {graphEdges.map((e, i) => {
              const from = nodePos(e.from);
              const to = nodePos(e.to);
              return (
                <motion.line
                  key={i}
                  x1={from.x + 40} y1={from.y}
                  x2={to.x - 40} y2={to.y}
                  stroke={COLORS.mid} strokeWidth={1.5}
                  markerEnd="url(#arrowGray)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                />
              );
            })}

            {/* Arrow marker */}
            <defs>
              <marker id="arrowGray" viewBox="0 0 10 10" refX="10" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} opacity={0.6} />
              </marker>
            </defs>

            {/* Nodes */}
            {graphNodes.map((node) => {
              const isOp = (node as any).isOp;
              const rw = isOp ? 36 : 50;
              const rh = isOp ? 24 : 28;
              return (
                <motion.g key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <rect
                    x={node.x - rw} y={node.y - rh}
                    width={rw * 2} height={rh * 2}
                    rx={isOp ? rh : 6}
                    fill={isOp ? `${COLORS.mid}10` : `${node.color}12`}
                    stroke={node.color}
                    strokeWidth={isOp ? 1 : 1.5}
                    strokeDasharray={isOp ? '4 2' : 'none'}
                  />
                  <text x={node.x} y={node.y - 2} textAnchor="middle" fontSize="10"
                    fontWeight="600" fill={node.color}>
                    {node.label}
                  </text>
                  {!isOp && (
                    <text x={node.x} y={node.y + 12} textAnchor="middle" fontSize="8"
                      fill={COLORS.mid} fontFamily={FONTS.mono}>
                      {TENSORS.find(t => t.id === node.id)?.shape || ''}
                    </text>
                  )}
                </motion.g>
              );
            })}

            {/* Tensor table */}
            <g transform="translate(30, 260)">
              {TENSORS.map((tensor, i) => (
                <g key={tensor.id} transform={`translate(0, ${i * 36})`}>
                  <rect x={0} y={0} width={16} height={16} rx={3}
                    fill={TENSOR_COLORS[tensor.id]} opacity={0.7} />
                  <text x={24} y={12} fontSize="10" fill={COLORS.dark} fontWeight="600">
                    {tensor.name}
                  </text>
                  <text x={160} y={12} fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>
                    {tensor.shape}
                  </text>
                  <text x={280} y={12} fontSize="9" fill={COLORS.mid}>
                    {tensor.sizeKB} KB
                  </text>
                </g>
              ))}
            </g>
          </g>
        )}

        {/* ─── Phase: lifetime ─── */}
        {phase === 'lifetime' && (
          <g>
            <text x={W / 2} y={30} textAnchor="middle" fontSize="13" fontWeight="700"
              fill={COLORS.dark}>{t.lifetime}</text>

            {/* Timeline header */}
            <g transform="translate(200, 60)">
              {steps.map((step, i) => {
                const sx = i * 130;
                return (
                  <g key={step}>
                    <rect x={sx} y={0} width={120} height={24} rx={4}
                      fill={`${COLORS.primary}10`} stroke={COLORS.light} strokeWidth={1} />
                    <text x={sx + 60} y={16} textAnchor="middle" fontSize="10"
                      fontWeight="600" fill={COLORS.dark}>
                      {step}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Tensor lifetime bars */}
            {TENSORS.map((tensor, ti) => {
              const yBase = 110 + ti * 60;
              const lifetime = lifetimeMap[tensor.id];
              const barX = 200 + lifetime.start * 130;
              const barW = (lifetime.end - lifetime.start + 1) * 130 - 10;

              return (
                <motion.g key={tensor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ti * 0.15 }}
                >
                  {/* Label */}
                  <rect x={20} y={yBase} width={14} height={14} rx={3}
                    fill={TENSOR_COLORS[tensor.id]} opacity={0.8} />
                  <text x={42} y={yBase + 11} fontSize="10" fontWeight="600"
                    fill={COLORS.dark}>{tensor.name}</text>
                  <text x={42} y={yBase + 26} fontSize="8" fill={COLORS.mid}>
                    {t.lastUseLabel}: {tensor.lastUse}
                  </text>

                  {/* Lifetime bar */}
                  <rect x={barX} y={yBase - 2} width={barW} height={20} rx={4}
                    fill={`${TENSOR_COLORS[tensor.id]}20`}
                    stroke={TENSOR_COLORS[tensor.id]}
                    strokeWidth={1.5} />
                  <text x={barX + barW / 2} y={yBase + 12} textAnchor="middle"
                    fontSize="8" fontWeight="600" fill={TENSOR_COLORS[tensor.id]}>
                    {tensor.sizeKB} KB
                  </text>

                  {/* Dead marker after lastUse */}
                  {lifetime.end < steps.length - 1 && (
                    <text x={barX + barW + 8} y={yBase + 12} fontSize="9" fill={COLORS.red}>
                      {locale === 'zh' ? '不再使用' : 'dead'}
                    </text>
                  )}
                </motion.g>
              );
            })}

            {/* Key insight */}
            <g transform="translate(200, 370)">
              <rect x={0} y={0} width={400} height={32} rx={6}
                fill={`${COLORS.green}10`} stroke={COLORS.green} strokeWidth={1} />
              <text x={200} y={20} textAnchor="middle" fontSize="10" fontWeight="600"
                fill={COLORS.green}>
                {locale === 'zh'
                  ? 'matmul_out 在 relu 之后不再使用 → relu_out 可以复用同一 buffer'
                  : 'matmul_out is dead after relu → relu_out can reuse the same buffer'}
              </text>
            </g>
          </g>
        )}

        {/* ─── Phase: allocate ─── */}
        {phase === 'allocate' && (
          <g>
            <text x={W / 2} y={30} textAnchor="middle" fontSize="13" fontWeight="700"
              fill={COLORS.dark}>{t.memoryLayout}</text>

            {/* Left: tensors */}
            <g transform="translate(30, 60)">
              <text x={0} y={0} fontSize="11" fontWeight="700" fill={COLORS.dark}>
                Tensors
              </text>
              {TENSORS.map((tensor, i) => {
                const ty = 20 + i * 80;
                return (
                  <motion.g key={tensor.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <rect x={0} y={ty} width={180} height={60} rx={6}
                      fill={`${TENSOR_COLORS[tensor.id]}10`}
                      stroke={TENSOR_COLORS[tensor.id]}
                      strokeWidth={1.5} />
                    <text x={90} y={ty + 20} textAnchor="middle" fontSize="10"
                      fontWeight="600" fill={TENSOR_COLORS[tensor.id]}>
                      {tensor.name}
                    </text>
                    <text x={90} y={ty + 35} textAnchor="middle" fontSize="9"
                      fill={COLORS.mid} fontFamily={FONTS.mono}>
                      {tensor.shape}
                    </text>
                    <text x={90} y={ty + 50} textAnchor="middle" fontSize="9"
                      fill={COLORS.mid}>
                      {tensor.sizeKB} KB
                    </text>
                  </motion.g>
                );
              })}
            </g>

            {/* Right: buffers */}
            <g transform="translate(450, 60)">
              <text x={0} y={0} fontSize="11" fontWeight="700" fill={COLORS.dark}>
                Buffers (memref)
              </text>
              {BUFFERS.map((buf, i) => {
                const by = 20 + i * 110;
                const barW = (buf.sizeKB / bufferMaxKB) * bufBarMaxW;
                const color = buf.isInPlace ? COLORS.green : COLORS.primary;

                return (
                  <motion.g key={buf.bufferId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                  >
                    <rect x={0} y={by} width={310} height={90} rx={6}
                      fill={`${color}06`} stroke={color} strokeWidth={1.5}
                      strokeDasharray={buf.isInPlace ? '6 3' : 'none'} />
                    <text x={10} y={by + 18} fontSize="10" fontWeight="700" fill={color}>
                      {buf.bufferId}
                      {buf.isInPlace && (
                        <tspan fill={COLORS.green} fontSize="9"> [{t.inPlace}]</tspan>
                      )}
                    </text>

                    {/* Size bar */}
                    <rect x={10} y={by + 26} width={barW} height={12} rx={3}
                      fill={`${color}30`} stroke={color} strokeWidth={0.5} />
                    <text x={barW + 16} y={by + 36} fontSize="9" fill={COLORS.mid}>
                      {buf.sizeKB} KB
                    </text>

                    {/* Tensor mapping */}
                    <text x={10} y={by + 55} fontSize="9" fill={COLORS.mid}>
                      tensors: {buf.tensors.join(', ')}
                    </text>

                    {/* Reason */}
                    <text x={10} y={by + 72} fontSize="8.5" fill={COLORS.mid} fontStyle="italic">
                      {buf.reason[locale]}
                    </text>
                  </motion.g>
                );
              })}
            </g>

            {/* Arrows from tensors to buffers */}
            {BUFFERS.map((buf, bi) => {
              const bx = 450;
              const by = 60 + 20 + bi * 110 + 45;
              return buf.tensors.map((tid, ti) => {
                const tensorIdx = TENSORS.findIndex(t => t.id === tid);
                const tx = 210;
                const ty = 60 + 20 + tensorIdx * 80 + 30;
                return (
                  <motion.path
                    key={`${buf.bufferId}-${tid}`}
                    d={`M ${tx} ${ty} C ${tx + 80} ${ty}, ${bx - 80} ${by}, ${bx} ${by}`}
                    stroke={TENSOR_COLORS[tid]}
                    strokeWidth={1.5}
                    fill="none"
                    opacity={0.5}
                    strokeDasharray={buf.isInPlace ? '4 2' : 'none'}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5 + bi * 0.1 + ti * 0.05, duration: 0.4 }}
                  />
                );
              });
            })}
          </g>
        )}

        {/* ─── Phase: result ─── */}
        {phase === 'result' && (
          <g>
            <text x={W / 2} y={30} textAnchor="middle" fontSize="13" fontWeight="700"
              fill={COLORS.dark}>
              {locale === 'zh' ? '内存对比' : 'Memory Comparison'}
            </text>

            {/* Naive allocation */}
            <g transform="translate(50, 70)">
              <text x={0} y={0} fontSize="12" fontWeight="700" fill={COLORS.red}>
                {t.naiveTotal}: {naiveTotal} KB
              </text>
              <text x={0} y={18} fontSize="9" fill={COLORS.mid}>
                {locale === 'zh' ? '每个 tensor 独立分配一个 buffer' : 'One buffer per tensor'}
              </text>

              {TENSORS.map((tensor, i) => {
                const barW = (tensor.sizeKB / naiveTotal) * 600;
                const yOff = 35 + i * 38;
                return (
                  <motion.g key={tensor.id}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    style={{ originX: '0px' }}
                  >
                    <rect x={0} y={yOff} width={barW} height={22} rx={4}
                      fill={`${TENSOR_COLORS[tensor.id]}25`}
                      stroke={TENSOR_COLORS[tensor.id]} strokeWidth={1} />
                    <text x={6} y={yOff + 15} fontSize="9" fontWeight="600"
                      fill={TENSOR_COLORS[tensor.id]}>
                      {tensor.name} ({tensor.sizeKB} KB)
                    </text>
                  </motion.g>
                );
              })}
            </g>

            {/* Optimized allocation */}
            <g transform="translate(50, 270)">
              <text x={0} y={0} fontSize="12" fontWeight="700" fill={COLORS.green}>
                {t.optimizedTotal}: {optimizedTotal} KB
              </text>
              <text x={0} y={18} fontSize="9" fill={COLORS.mid}>
                {locale === 'zh' ? 'In-place 分析后的 buffer 复用' : 'Buffer reuse after in-place analysis'}
              </text>

              {BUFFERS.map((buf, i) => {
                const barW = (buf.sizeKB / naiveTotal) * 600;
                const yOff = 35 + i * 42;
                const color = buf.isInPlace ? COLORS.green : COLORS.primary;
                return (
                  <motion.g key={buf.bufferId}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                    style={{ originX: '0px' }}
                  >
                    <rect x={0} y={yOff} width={barW} height={26} rx={4}
                      fill={`${color}15`}
                      stroke={color} strokeWidth={1.5}
                      strokeDasharray={buf.isInPlace ? '6 3' : 'none'} />
                    <text x={6} y={yOff + 16} fontSize="9" fontWeight="600" fill={color}>
                      {buf.bufferId}: {buf.tensors.join(' + ')} ({buf.sizeKB} KB)
                      {buf.isInPlace ? ` [${t.inPlace}]` : ''}
                    </text>
                  </motion.g>
                );
              })}
            </g>

            {/* Savings badge */}
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <rect x={550} y={270} width={200} height={70} rx={10}
                fill={`${COLORS.green}10`} stroke={COLORS.green} strokeWidth={2} />
              <text x={650} y={298} textAnchor="middle" fontSize="11" fontWeight="700"
                fill={COLORS.green}>
                {t.saved}: {naiveTotal - optimizedTotal} KB
              </text>
              <text x={650} y={318} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
                ({Math.round((1 - optimizedTotal / naiveTotal) * 100)}%{' '}
                {locale === 'zh' ? '内存减少' : 'memory reduction'})
              </text>
            </motion.g>
          </g>
        )}
      </svg>
    </div>
  );
}
