import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

const MAX_SEQ = 2048;
const BLOCK_SIZE = 16;

export default function MemoryWasteComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '内存分配对比：预分配 vs PagedAttention',
      subtitle: '拖动滑块调整实际序列长度，观察内存浪费率变化',
      tokens: 'tokens',
      preAllocTitle: '预分配 (max=',
      pagedTitle: 'PagedAttention (block=',
      waste: '浪费',
      used: '使用',
      seqLenLabel: '序列长度',
      max: 'max',
      blocks: '个块',
      slots: 'slots',
      stats: '— PagedAttention 使用',
      summary: '预分配浪费',
      vs: 'vs PagedAttention 浪费',
      savings: '— 节省',
      memory: '内存',
    },
    en: {
      title: 'Memory Allocation: Pre-allocated vs PagedAttention',
      subtitle: 'Drag slider to adjust actual sequence length and observe waste rate changes',
      tokens: 'tokens',
      preAllocTitle: 'Pre-allocated (max=',
      pagedTitle: 'PagedAttention (block=',
      waste: 'Waste',
      used: 'Used',
      seqLenLabel: 'Sequence length',
      max: 'max',
      blocks: 'blocks',
      slots: 'slots',
      stats: '— PagedAttention uses',
      summary: 'Pre-allocated waste',
      vs: 'vs PagedAttention waste',
      savings: '— saved',
      memory: 'memory',
    },
  }[locale];

  const [seqLen, setSeqLen] = useState(512);

  const chartY = 80;
  const chartH = 200;
  const barW = 180;

  // Pre-allocated: always reserves max_seq_len
  const preAllocUsed = seqLen / MAX_SEQ;
  const preAllocWaste = 1 - preAllocUsed;

  // PagedAttention: allocates blocks on demand
  const blocksNeeded = Math.ceil(seqLen / BLOCK_SIZE);
  const totalSlots = blocksNeeded * BLOCK_SIZE;
  const pagedUsed = seqLen / totalSlots;
  const pagedWaste = 1 - pagedUsed; // only last-block internal fragmentation

  const wastePercent = (v: number) => `${(v * 100).toFixed(1)}%`;

  // Slider step positions (5 values)
  const sliderValues = [128, 256, 512, 1024, 1536];
  const sliderX = 120;
  const sliderW = 340;

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

      {/* Slider */}
      <line x1={sliderX} y1={58} x2={sliderX + sliderW} y2={58}
        stroke={COLORS.light} strokeWidth="4" strokeLinecap="round" />
      {sliderValues.map((v, i) => {
        const x = sliderX + (i / (sliderValues.length - 1)) * sliderW;
        const isActive = seqLen === v;
        return (
          <g key={v} onClick={() => setSeqLen(v)} cursor="pointer">
            <circle cx={x} cy={58} r={isActive ? 8 : 5}
              fill={isActive ? COLORS.primary : COLORS.bgAlt}
              stroke={isActive ? COLORS.primary : COLORS.mid} strokeWidth="1.5" />
            <text x={x} y={74} textAnchor="middle" fontSize="8"
              fontWeight={isActive ? '700' : '400'}
              fill={isActive ? COLORS.primary : COLORS.mid} fontFamily={FONTS.mono}>
              {v}
            </text>
          </g>
        );
      })}
      <text x={sliderX + sliderW + 30} y={62} fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{t.tokens}</text>

      {/* Left bar: Pre-allocated */}
      {(() => {
        const x = W / 2 - barW - 30;
        const usedH = chartH * preAllocUsed;
        const wasteH = chartH * preAllocWaste;
        return (
          <g>
            <text x={x + barW / 2} y={chartY - 5} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.preAllocTitle}{MAX_SEQ})
            </text>
            {/* Waste */}
            <rect x={x} y={chartY} width={barW} height={wasteH} rx={4}
              fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" />
            <text x={x + barW / 2} y={chartY + wasteH / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="600" fill={COLORS.red} fontFamily={FONTS.sans}>
              {t.waste} {wastePercent(preAllocWaste)}
            </text>
            {/* Used */}
            <rect x={x} y={chartY + wasteH} width={barW} height={usedH} rx={4}
              fill={COLORS.primary} opacity={0.7} />
            <text x={x + barW / 2} y={chartY + wasteH + usedH / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
              {t.used} {wastePercent(preAllocUsed)}
            </text>
          </g>
        );
      })()}

      {/* Right bar: PagedAttention */}
      {(() => {
        const x = W / 2 + 30;
        const usedH = chartH * pagedUsed;
        const wasteH = chartH * pagedWaste;
        return (
          <g>
            <text x={x + barW / 2} y={chartY - 5} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.pagedTitle}{BLOCK_SIZE})
            </text>
            {/* Tiny waste (last block) */}
            {wasteH > 2 && (
              <>
                <rect x={x} y={chartY + chartH - wasteH - usedH} width={barW} height={wasteH} rx={4}
                  fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" />
                <text x={x + barW / 2} y={chartY + chartH - usedH - wasteH / 2 + 4}
                  textAnchor="middle" fontSize="9" fontWeight="600"
                  fill={COLORS.red} fontFamily={FONTS.sans}>
                  {wastePercent(pagedWaste)}
                </text>
              </>
            )}
            {/* Used — almost the entire bar */}
            <rect x={x} y={chartY + chartH - usedH} width={barW} height={usedH} rx={4}
              fill={COLORS.green} opacity={0.7} />
            <text x={x + barW / 2} y={chartY + chartH - usedH / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
              {t.used} {wastePercent(pagedUsed)}
            </text>
          </g>
        );
      })()}

      {/* Stats row */}
      <text x={W / 2} y={chartY + chartH + 30} textAnchor="middle" fontSize="10"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.seqLenLabel} {seqLen} / {t.max} {MAX_SEQ} {t.stats} {blocksNeeded} {t.blocks}（{totalSlots} {t.slots}）
      </text>

      {/* Summary */}
      <rect x={60} y={H - 55} width={W - 120} height={40} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 31} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.summary} {wastePercent(preAllocWaste)} {t.vs} {wastePercent(pagedWaste)}
        {t.savings} {wastePercent(preAllocWaste - pagedWaste)} {t.memory}
      </text>
    </svg>
  );
}
