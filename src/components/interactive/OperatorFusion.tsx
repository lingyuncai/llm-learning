import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

type FusionType = 'none' | 'flash_attn' | 'rmsnorm_matmul' | 'glu';

interface FusionInfo {
  label: string;
  desc: string;
  beforeNodes: string[];
  afterNodes: string[];
  savedKernels: number;
}

function getFusions(locale: 'zh' | 'en'): Record<FusionType, FusionInfo> {
  return locale === 'zh' ? {
    none: {
      label: '无融合',
      desc: '所有操作独立执行',
      beforeNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
      afterNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
      savedKernels: 0,
    },
    flash_attn: {
      label: 'FlashAttention',
      desc: 'Q/K/V → 单个融合内核, 减少 HBM 读写',
      beforeNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
      afterNodes: ['FlashAttn(Q,K,V)'],
      savedKernels: 4,
    },
    rmsnorm_matmul: {
      label: 'RMSNorm + MatMul',
      desc: '归一化和线性变换融合, 减少一次全局读写',
      beforeNodes: ['RMSNorm', 'MatMul'],
      afterNodes: ['FusedRMSNormMatMul'],
      savedKernels: 1,
    },
    glu: {
      label: 'SwiGLU Fusion',
      desc: 'Gate/Up/SiLU/Mul 融合为单内核',
      beforeNodes: ['Gate Linear', 'Up Linear', 'SiLU', 'Mul'],
      afterNodes: ['FusedSwiGLU'],
      savedKernels: 3,
    },
  } : {
    none: {
      label: 'No Fusion',
      desc: 'All operations executed independently',
      beforeNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
      afterNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
      savedKernels: 0,
    },
    flash_attn: {
      label: 'FlashAttention',
      desc: 'Q/K/V → single fused kernel, reduces HBM reads/writes',
      beforeNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
      afterNodes: ['FlashAttn(Q,K,V)'],
      savedKernels: 4,
    },
    rmsnorm_matmul: {
      label: 'RMSNorm + MatMul',
      desc: 'Normalization and linear transform fused, reduces one global read/write',
      beforeNodes: ['RMSNorm', 'MatMul'],
      afterNodes: ['FusedRMSNormMatMul'],
      savedKernels: 1,
    },
    glu: {
      label: 'SwiGLU Fusion',
      desc: 'Gate/Up/SiLU/Mul fused into single kernel',
      beforeNodes: ['Gate Linear', 'Up Linear', 'SiLU', 'Mul'],
      afterNodes: ['FusedSwiGLU'],
      savedKernels: 3,
    },
  };
}

const TYPES: FusionType[] = ['none', 'flash_attn', 'rmsnorm_matmul', 'glu'];

function NodeChain({ nodes, x, y, color, label }: {
  nodes: string[]; x: number; y: number; color: string; label: string;
}) {
  const nodeH = 28;
  const gap = 8;
  return (
    <g>
      <text x={x + 60} y={y - 8} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {nodes.map((n, i) => {
        const ny = y + i * (nodeH + gap);
        return (
          <g key={i}>
            <rect x={x} y={ny} width={120} height={nodeH} rx={5}
              fill={color === COLORS.orange ? '#fef3c7' : '#dcfce7'}
              stroke={color} strokeWidth={1.2} />
            <text x={x + 60} y={ny + nodeH / 2 + 3} textAnchor="middle"
              fontSize="7.5" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
              {n}
            </text>
            {i < nodes.length - 1 && (
              <line x1={x + 60} y1={ny + nodeH} x2={x + 60} y2={ny + nodeH + gap}
                stroke="#94a3b8" strokeWidth={0.8} />
            )}
          </g>
        );
      })}
    </g>
  );
}

export default function OperatorFusion({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      operatorFusion: '算子融合',
      before: '融合前',
      after: '融合后',
      savedKernels: '节省',
      kernelCalls: '次内核调用',
      noFusion: '无融合 — 所有节点独立调度',
    },
    en: {
      operatorFusion: 'Operator Fusion',
      before: 'Before',
      after: 'After',
      savedKernels: 'Saved',
      kernelCalls: 'kernel calls',
      noFusion: 'No fusion — all nodes independently scheduled',
    },
  }[locale];

  const [fusion, setFusion] = useState<FusionType>('flash_attn');
  const FUSIONS = getFusions(locale);
  const info = FUSIONS[fusion];

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setFusion(t)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              fusion === t
                ? 'bg-orange-100 border-orange-400 text-orange-700 font-semibold'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {FUSIONS[t].label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.operatorFusion}: {info.label}
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>{info.desc}</text>

        {/* Before (left) */}
        <NodeChain nodes={info.beforeNodes} x={80} y={55} color={COLORS.orange} label={t.before} />

        {/* Arrow */}
        <text x={W / 2} y={140} textAnchor="middle" fontSize="16" fill="#94a3b8">→</text>

        {/* After (right) */}
        <NodeChain nodes={info.afterNodes} x={370} y={55} color={COLORS.green} label={t.after} />

        {/* Stats */}
        <rect x={180} y={H - 50} width={220} height={35} rx={6}
          fill="#f0fdf4" stroke={COLORS.green} strokeWidth={1} />
        <text x={290} y={H - 30} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {info.savedKernels > 0
            ? `${t.savedKernels} ${info.savedKernels} ${t.kernelCalls} (${info.beforeNodes.length} → ${info.afterNodes.length})`
            : t.noFusion}
        </text>
      </svg>
    </div>
  );
}
