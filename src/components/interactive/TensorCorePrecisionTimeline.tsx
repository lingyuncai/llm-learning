// src/components/interactive/TensorCorePrecisionTimeline.tsx
// Static SVG: Tensor Core precision support evolution Volta → Blackwell
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

interface GenInfo {
  name: string;
  year: number;
  gen: string;
  newTypes: string[];
  allTypes: string[];
  x: number;
}

const generations: GenInfo[] = [
  {
    name: 'Volta', year: 2017, gen: '1st gen',
    newTypes: ['FP16'],
    allTypes: ['FP16'],
    x: 40,
  },
  {
    name: 'Turing', year: 2018, gen: '2nd gen',
    newTypes: ['INT8', 'INT4', 'INT1'],
    allTypes: ['FP16', 'INT8', 'INT4', 'INT1'],
    x: 150,
  },
  {
    name: 'Ampere', year: 2020, gen: '3rd gen',
    newTypes: ['TF32', 'BF16', 'FP64'],
    allTypes: ['FP16', 'BF16', 'TF32', 'FP64', 'INT8', 'INT4', 'INT1'],
    x: 260,
  },
  {
    name: 'Hopper', year: 2022, gen: '4th gen',
    newTypes: ['FP8'],
    allTypes: ['FP16', 'BF16', 'TF32', 'FP64', 'FP8', 'INT8'],
    x: 370,
  },
  {
    name: 'Blackwell', year: 2024, gen: '5th gen',
    newTypes: ['FP4'],
    allTypes: ['FP16', 'BF16', 'TF32', 'FP64', 'FP8', 'FP4', 'INT8'],
    x: 480,
  },
];

const TYPE_COLORS: Record<string, string> = {
  FP16: '#1565c0',
  BF16: '#0277bd',
  TF32: '#00838f',
  FP64: '#4527a0',
  FP8: '#e65100',
  FP4: '#c62828',
  INT8: '#2e7d32',
  INT4: '#558b2f',
  INT1: '#827717',
};

export default function TensorCorePrecisionTimeline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const lineY = 80;

  const t = {
    zh: {
      title: 'Tensor Core 精度支持演进',
      summary: 'Blackwell (5th gen) 支持全部精度:',
      trend: '趋势: 精度越来越低 → 吞吐量越来越高（每降一级精度，吞吐量约翻倍）',
    },
    en: {
      title: 'Tensor Core Precision Evolution',
      summary: 'Blackwell (5th gen) supports all precisions:',
      trend: 'Trend: Lower precision → Higher throughput (roughly 2x per precision level)',
    },
  }[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Tensor Core precision support timeline from Volta to Blackwell">

      {/* Title */}
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      {/* Timeline line */}
      <line x1={30} y1={lineY} x2={W - 30} y2={lineY}
        stroke="#cbd5e1" strokeWidth={2} />

      {/* Generation nodes */}
      {generations.map((gen, gi) => (
        <g key={gi}>
          {/* Dot on timeline */}
          <circle cx={gen.x} cy={lineY} r={6}
            fill={COLORS.primary} stroke="white" strokeWidth={2} />

          {/* Name + year */}
          <text x={gen.x} y={lineY - 18} textAnchor="middle"
            fontSize="11" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {gen.name}
          </text>
          <text x={gen.x} y={lineY - 6} textAnchor="middle"
            fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
            {gen.year} · {gen.gen}
          </text>

          {/* New types (highlighted) */}
          {gen.newTypes.map((t, ti) => {
            const ty = lineY + 20 + ti * 20;
            return (
              <g key={ti}>
                <rect x={gen.x - 28} y={ty} width={56} height={16} rx={3}
                  fill={TYPE_COLORS[t] || '#666'} opacity={0.15}
                  stroke={TYPE_COLORS[t] || '#666'} strokeWidth={1.5} />
                <text x={gen.x} y={ty + 9} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fontWeight="700" fill={TYPE_COLORS[t] || '#666'}
                  fontFamily={FONTS.mono}>
                  {t}
                </text>
              </g>
            );
          })}

          {/* "NEW" badge for new types */}
          {gen.newTypes.length > 0 && (
            <text x={gen.x + 34} y={lineY + 32} fontSize="6" fontWeight="700"
              fill={COLORS.red} fontFamily={FONTS.sans}>
              NEW
            </text>
          )}
        </g>
      ))}

      {/* Bottom: summary of all types for latest gen */}
      <text x={W / 2} y={H - 50} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.summary}
      </text>
      {(() => {
        const types = generations[generations.length - 1].allTypes;
        const startX = W / 2 - (types.length * 50) / 2;
        return types.map((t, i) => (
          <g key={i}>
            <rect x={startX + i * 50} y={H - 36} width={46} height={18} rx={3}
              fill={TYPE_COLORS[t] || '#666'} opacity={0.12}
              stroke={TYPE_COLORS[t] || '#666'} strokeWidth={1} />
            <text x={startX + i * 50 + 23} y={H - 25} textAnchor="middle"
              fontSize="8" fontWeight="600" fill={TYPE_COLORS[t] || '#666'}
              fontFamily={FONTS.mono}>{t}</text>
          </g>
        ));
      })()}

      {/* Trend arrow annotation */}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="8" fill="#94a3b8"
        fontFamily={FONTS.sans}>
        {t.trend}
      </text>
    </svg>
  );
}
