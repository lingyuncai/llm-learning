import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface ModelRow {
  name: string;
  totalParams: string;
  activeParams: string;
  ssmAttnRatio: string;
  throughput: string;
  avgBench: string;
  kvCache: string;
  org: string;
  year: string;
  keyDesign: string;
}

const MODELS: ModelRow[] = [
  {
    name: 'Jamba',
    totalParams: '52B',
    activeParams: '12B',
    ssmAttnRatio: '7:1',
    throughput: '1.6×',
    avgBench: '72.1',
    kvCache: '1/8',
    org: 'AI21 Labs',
    year: '2024.03',
    keyDesign: '交替式 Hybrid + MoE, 256K context',
  },
  {
    name: 'Zamba2',
    totalParams: '2.7B',
    activeParams: '2.7B',
    ssmAttnRatio: '~6:1',
    throughput: '2.0×',
    avgBench: '68.5',
    kvCache: '1/6',
    org: 'Zyphra',
    year: '2024.08',
    keyDesign: '共享式 Hybrid: 2 shared Attention + LoRA',
  },
  {
    name: 'Hymba',
    totalParams: '1.5B',
    activeParams: '1.5B',
    ssmAttnRatio: '1:1',
    throughput: '3.49×',
    avgBench: '67.3',
    kvCache: '1/12',
    org: 'NVIDIA',
    year: '2024.11',
    keyDesign: '并行式 Hybrid: Attn+SSM heads + Meta tokens',
  },
  {
    name: 'Transformer',
    totalParams: '—',
    activeParams: '—',
    ssmAttnRatio: '0:N',
    throughput: '1.0× (基准)',
    avgBench: '基准',
    kvCache: '1× (基准)',
    org: '—',
    year: '—',
    keyDesign: '纯 Attention，KV cache 随序列线性增长',
  },
  {
    name: 'Mamba',
    totalParams: '—',
    activeParams: '—',
    ssmAttnRatio: 'N:0',
    throughput: '~5×',
    avgBench: '基准-2.65',
    kvCache: 'O(1)',
    org: 'CMU/Princeton',
    year: '2023.12',
    keyDesign: '纯 SSM，Copying/ICL 受限',
  },
];

const COLS = [
  { key: 'name' as const, label: '模型', w: 70 },
  { key: 'totalParams' as const, label: '总参数', w: 55 },
  { key: 'activeParams' as const, label: 'Active', w: 55 },
  { key: 'ssmAttnRatio' as const, label: 'SSM:Attn', w: 60 },
  { key: 'throughput' as const, label: 'Throughput', w: 70 },
  { key: 'avgBench' as const, label: 'Avg Score', w: 65 },
  { key: 'kvCache' as const, label: 'KV Cache', w: 60 },
];

export default function HybridModelBenchmark() {
  const [hovered, setHovered] = useState<number | null>(null);

  const tableX = 20;
  const headerY = 50;
  const rowH = 28;
  const tableW = W - 40;

  // Calculate column positions
  const colPositions = COLS.reduce<number[]>((acc, col, i) => {
    acc.push(i === 0 ? tableX : acc[i - 1] + COLS[i - 1].w);
    return acc;
  }, []);

  const totalRows = MODELS.length;
  const detailY = headerY + (totalRows + 1) * rowH + 10;

  return (
    <svg viewBox={`0 0 ${W} 340`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Hybrid 模型对比
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        Hover 查看模型详细信息
      </text>

      {/* Header row */}
      <rect x={tableX} y={headerY} width={tableW} height={rowH} rx={4}
        fill={COLORS.dark} opacity="0.08" />
      {COLS.map((col, i) => (
        <text key={col.key} x={colPositions[i] + col.w / 2} y={headerY + 18}
          textAnchor="middle" fontSize="9" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {col.label}
        </text>
      ))}

      {/* Data rows */}
      {MODELS.map((model, ri) => {
        const y = headerY + (ri + 1) * rowH;
        const isHovered = hovered === ri;
        return (
          <g key={ri}
            onMouseEnter={() => setHovered(ri)}
            onMouseLeave={() => setHovered(null)}
            cursor="pointer">
            <rect x={tableX} y={y} width={tableW} height={rowH} rx={0}
              fill={isHovered ? COLORS.highlight : ri % 2 === 0 ? '#fafafa' : '#fff'}
              stroke={isHovered ? COLORS.primary : 'none'} strokeWidth={isHovered ? 1.5 : 0} />
            {COLS.map((col, ci) => (
              <text key={col.key}
                x={colPositions[ci] + col.w / 2} y={y + 18}
                textAnchor="middle" fontSize="9"
                fontWeight={ci === 0 ? '600' : '400'}
                fill={isHovered ? COLORS.primary : COLORS.dark}
                fontFamily={ci === 0 ? FONTS.sans : FONTS.mono}>
                {model[col.key]}
              </text>
            ))}
          </g>
        );
      })}

      {/* Hover detail card */}
      {hovered !== null && (
        <g>
          <rect x={40} y={detailY} width={500} height={65} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1" />
          <text x={290} y={detailY + 18} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>
            {MODELS[hovered].name}
          </text>
          <text x={290} y={detailY + 35} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {MODELS[hovered].org} · {MODELS[hovered].year}
          </text>
          <text x={290} y={detailY + 52} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {MODELS[hovered].keyDesign}
          </text>
        </g>
      )}
    </svg>
  );
}
