import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

export default function SlidingWindowVsFullMask({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      seqLength: '序列长度',
      windowSize: '窗口大小',
      fullCausal: 'Full Causal Mask',
      slidingWindow: 'Sliding Window Mask (w={w})',
      keyPosition: 'Key position',
      comparison: '计算量对比',
      full: 'Full',
      swa: 'SWA',
      less: 'less',
    },
    en: {
      seqLength: 'Sequence length',
      windowSize: 'Window size',
      fullCausal: 'Full Causal Mask',
      slidingWindow: 'Sliding Window Mask (w={w})',
      keyPosition: 'Key position',
      comparison: 'Computation Comparison',
      full: 'Full',
      swa: 'SWA',
      less: 'less',
    },
  }[locale];

  const [seqLen, setSeqLen] = useState(8);
  const [windowSize, setWindowSize] = useState(3);

  const { fullOps, swOps } = useMemo(() => ({
    fullOps: seqLen * (seqLen + 1) / 2,
    swOps: Array.from({ length: seqLen }, (_, i) => Math.min(i + 1, windowSize))
      .reduce((a, b) => a + b, 0),
  }), [seqLen, windowSize]);

  const cellSize = Math.min(24, Math.floor(240 / seqLen));
  const gridW = seqLen * cellSize;
  const leftX = (W / 2 - gridW) / 2;
  const rightX = W / 2 + (W / 2 - gridW) / 2;

  const renderMask = (ox: number, isSW: boolean) => {
    const cells: JSX.Element[] = [];
    for (let row = 0; row < seqLen; row++) {
      for (let col = 0; col < seqLen; col++) {
        const causal = col <= row;
        const inWindow = isSW ? (row - col < windowSize) : true;
        const active = causal && inWindow;
        cells.push(
          <rect key={`${row}-${col}`}
            x={ox + col * cellSize} y={50 + row * cellSize}
            width={cellSize - 1} height={cellSize - 1} rx={2}
            fill={active ? (isSW ? COLORS.primary : '#93c5fd') : COLORS.masked}
            opacity={active ? 0.8 : 0.4}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="my-6">
      <div className="flex gap-4 mb-3 items-center justify-center">
        <label className="text-xs text-gray-500">
          {t.seqLength} n={seqLen}
          <input type="range" min={4} max={16} step={1} value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="ml-2 w-24" />
        </label>
        <label className="text-xs text-gray-500">
          {t.windowSize} w={windowSize}
          <input type="range" min={1} max={seqLen} step={1} value={windowSize}
            onChange={e => setWindowSize(Number(e.target.value))} className="ml-2 w-24" />
        </label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 4} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.fullCausal}</text>
        <text x={3 * W / 4} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.slidingWindow.replace('{w}', String(windowSize))}</text>

        <text x={leftX + gridW / 2} y={42} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily={FONTS.sans}>{t.keyPosition}</text>
        <text x={rightX + gridW / 2} y={42} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily={FONTS.sans}>{t.keyPosition}</text>

        {renderMask(leftX, false)}
        {renderMask(rightX, true)}

        <line x1={W / 2} y1={35} x2={W / 2} y2={50 + seqLen * cellSize + 5}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />

        {(() => {
          const barY = 50 + seqLen * cellSize + 20;
          const maxBarW = 200;
          const fullBarW = maxBarW;
          const swBarW = (swOps / fullOps) * maxBarW;
          const saving = ((1 - swOps / fullOps) * 100).toFixed(0);
          return (
            <g>
              <text x={W / 2} y={barY} textAnchor="middle" fontSize="10" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>
                {t.comparison}
              </text>
              <text x={W / 2 - maxBarW / 2 - 5} y={barY + 20} textAnchor="end" fontSize="8"
                fill={COLORS.mid} fontFamily={FONTS.sans}>{t.full}</text>
              <rect x={W / 2 - maxBarW / 2} y={barY + 12} width={fullBarW} height={12} rx={3}
                fill="#93c5fd" opacity={0.6} />
              <text x={W / 2 + maxBarW / 2 + 4} y={barY + 22} fontSize="8" fontWeight="600"
                fill={COLORS.mid} fontFamily={FONTS.mono}>
                O(n²) = {fullOps}
              </text>

              <text x={W / 2 - maxBarW / 2 - 5} y={barY + 38} textAnchor="end" fontSize="8"
                fill={COLORS.mid} fontFamily={FONTS.sans}>{t.swa}</text>
              <rect x={W / 2 - maxBarW / 2} y={barY + 30} width={swBarW} height={12} rx={3}
                fill={COLORS.primary} opacity={0.7} />
              <text x={W / 2 - maxBarW / 2 + swBarW + 4} y={barY + 40} fontSize="8" fontWeight="600"
                fill={COLORS.primary} fontFamily={FONTS.mono}>
                O(nw) = {swOps} ({saving}% {t.less})
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
