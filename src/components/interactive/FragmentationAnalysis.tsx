import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Scenario {
  label: string;
  requests: number;
  contiguousInternal: number;
  contiguousExternal: number;
  pagedInternal: number;
  pagedExternal: number;
}

const SCENARIOS: Scenario[] = [
  { label: '4 请求', requests: 4,  contiguousInternal: 35, contiguousExternal: 20, pagedInternal: 3, pagedExternal: 0 },
  { label: '16 请求', requests: 16, contiguousInternal: 40, contiguousExternal: 30, pagedInternal: 3, pagedExternal: 0 },
  { label: '64 请求', requests: 64, contiguousInternal: 45, contiguousExternal: 38, pagedInternal: 4, pagedExternal: 0 },
];

export default function FragmentationAnalysis({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '内存碎片率对比',
      subtitle: '切换不同并发请求数，观察碎片率变化',
      scenario_4: '4 请求',
      scenario_16: '16 请求',
      scenario_64: '64 请求',
      internal_frag: '内部碎片',
      internal_frag_desc: '预分配 max_len 导致的未使用空间',
      external_frag: '外部碎片',
      external_frag_desc: '请求间内存间隙无法利用',
      contiguous: '连续分配',
      paged: 'PagedAttention',
      total_waste: '总浪费率',
      summary: 'PagedAttention 将外部碎片降为 0%，内部碎片仅来自最后一个块（< block_size tokens）',
    },
    en: {
      title: 'Memory Fragmentation Comparison',
      subtitle: 'Switch between different concurrent requests to observe fragmentation changes',
      scenario_4: '4 requests',
      scenario_16: '16 requests',
      scenario_64: '64 requests',
      internal_frag: 'Internal Fragmentation',
      internal_frag_desc: 'Unused space from max_len pre-allocation',
      external_frag: 'External Fragmentation',
      external_frag_desc: 'Memory gaps between requests that cannot be utilized',
      contiguous: 'Contiguous',
      paged: 'PagedAttention',
      total_waste: 'Total Waste',
      summary: 'PagedAttention reduces external fragmentation to 0%, internal fragmentation only from last block (< block_size tokens)',
    },
  }[locale];
  const [scenarioIdx, setScenarioIdx] = useState(1);
  const s = SCENARIOS[scenarioIdx];

  const scenarioLabels = [t.scenario_4, t.scenario_16, t.scenario_64];

  const chartX = 80;
  const chartW = 420;
  const chartY = 100;
  const barH = 36;
  const groupGap = 60;

  const bars = [
    { label: t.internal_frag, contiguous: s.contiguousInternal, paged: s.pagedInternal, desc: t.internal_frag_desc },
    { label: t.external_frag, contiguous: s.contiguousExternal, paged: s.pagedExternal, desc: t.external_frag_desc },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {/* Scenario selector */}
      {SCENARIOS.map((sc, i) => (
        <g key={i} onClick={() => setScenarioIdx(i)} cursor="pointer">
          <rect x={160 + i * 100} y={52} width={85} height={24} rx={12}
            fill={scenarioIdx === i ? COLORS.primary : COLORS.bgAlt}
            stroke={scenarioIdx === i ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={202 + i * 100} y={68} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={scenarioIdx === i ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {scenarioLabels[i]}
          </text>
        </g>
      ))}

      {/* Bars */}
      {bars.map((bar, gi) => {
        const baseY = chartY + gi * groupGap;
        const maxVal = 60; // max percentage for scale
        const scale = chartW / maxVal;

        return (
          <g key={bar.label}>
            <text x={chartX - 5} y={baseY + 10} textAnchor="end" fontSize="10"
              fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{bar.label}</text>
            <text x={chartX - 5} y={baseY + 24} textAnchor="end" fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>{bar.desc}</text>

            {/* Contiguous bar */}
            <rect x={chartX} y={baseY} width={bar.contiguous * scale} height={barH / 2 - 1} rx={3}
              fill={COLORS.red} opacity={0.7} />
            <text x={chartX + bar.contiguous * scale + 5} y={baseY + 12}
              fontSize="9" fontWeight="600" fill={COLORS.red} fontFamily={FONTS.mono}>
              {bar.contiguous}%
            </text>
            <text x={chartX + bar.contiguous * scale + 35} y={baseY + 12}
              fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>{t.contiguous}</text>

            {/* Paged bar */}
            <rect x={chartX} y={baseY + barH / 2 + 1}
              width={Math.max(bar.paged * scale, 2)} height={barH / 2 - 1} rx={3}
              fill={COLORS.green} opacity={0.7} />
            <text x={chartX + Math.max(bar.paged * scale, 2) + 5} y={baseY + barH - 2}
              fontSize="9" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.mono}>
              {bar.paged}%
            </text>
            <text x={chartX + Math.max(bar.paged * scale, 2) + 30} y={baseY + barH - 2}
              fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>{t.paged}</text>
          </g>
        );
      })}

      {/* Total waste comparison */}
      {(() => {
        const totalContiguous = s.contiguousInternal + s.contiguousExternal;
        const totalPaged = s.pagedInternal + s.pagedExternal;
        const y = chartY + 2 * groupGap + 20;
        const barMaxW = 300;
        return (
          <g>
            <text x={W / 2} y={y} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.total_waste}
            </text>
            {/* Contiguous */}
            <rect x={W / 2 - barMaxW / 2} y={y + 10}
              width={barMaxW * totalContiguous / 100} height={20} rx={4}
              fill={COLORS.red} opacity={0.6} />
            <text x={W / 2 + barMaxW / 2 + 10} y={y + 25}
              fontSize="10" fontWeight="700" fill={COLORS.red} fontFamily={FONTS.mono}>
              {totalContiguous}%
            </text>
            {/* Paged */}
            <rect x={W / 2 - barMaxW / 2} y={y + 34}
              width={Math.max(barMaxW * totalPaged / 100, 3)} height={20} rx={4}
              fill={COLORS.green} opacity={0.6} />
            <text x={W / 2 + barMaxW / 2 + 10} y={y + 49}
              fontSize="10" fontWeight="700" fill={COLORS.green} fontFamily={FONTS.mono}>
              {totalPaged}%
            </text>
          </g>
        );
      })()}

      {/* Summary */}
      <rect x={60} y={H - 45} width={W - 120} height={32} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 25} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.summary}
      </text>
    </svg>
  );
}
