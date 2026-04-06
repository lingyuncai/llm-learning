import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;
const D_MODEL = 64; // total dims → 32 dim pairs
const NUM_PAIRS = D_MODEL / 2;
const BASE = 10000;

export default function RoPEFrequencyBands({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      position: '位置',
      title: 'RoPE 各维度对的旋转角度热力图 (d_model={d})',
      dimPairIndex: '维度对 index i →',
      positionAxis: '位置 pos →',
      highFreq: '高频 (变化快)',
      lowFreq: '低频 (变化慢)',
      anglesAt: 'pos={pos} 时各维度对的角度 mθᵢ (mod 2π)',
      angleChangeLarge: 'i=0: 角度变化大',
      angleChangeSmall: 'i={max}: 角度变化小',
    },
    en: {
      position: 'Position',
      title: 'RoPE Rotation Angle Heatmap per Dim Pair (d_model={d})',
      dimPairIndex: 'Dim pair index i →',
      positionAxis: 'Position pos →',
      highFreq: 'High freq (changes fast)',
      lowFreq: 'Low freq (changes slow)',
      anglesAt: 'Angles mθᵢ (mod 2π) at pos={pos}',
      angleChangeLarge: 'i=0: large angle change',
      angleChangeSmall: 'i={max}: small angle change',
    },
  }[locale];

  const [pos, setPos] = useState(10);
  const maxPos = 128;

  // Compute theta_i for each dimension pair
  const thetas = useMemo(() =>
    Array.from({ length: NUM_PAIRS }, (_, i) =>
      Math.pow(BASE, -2 * i / D_MODEL)
    ), []);

  // Heatmap: rows = positions, cols = dim pairs
  const numPosDisplay = 64;
  const cellW = Math.floor((W - 80) / NUM_PAIRS);
  const cellH = Math.floor((H - 120) / numPosDisplay);
  const heatmapX = 60;
  const heatmapY = 55;

  // Angle for highlighted position
  const angles = thetas.map(t => ((pos * t) % (2 * Math.PI)));

  return (
    <div className="my-6">
      <div className="flex items-center justify-center gap-4 mb-3">
        <label className="text-xs text-gray-500">
          {t.position} pos = {pos}
          <input type="range" min={0} max={maxPos} step={1} value={pos}
            onChange={e => setPos(Number(e.target.value))} className="ml-2 w-48" />
        </label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.title.replace('{d}', D_MODEL.toString())}
        </text>

        {/* Axis labels */}
        <text x={heatmapX + (NUM_PAIRS * cellW) / 2} y={heatmapY - 8}
          textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {t.dimPairIndex}
        </text>
        <text x={heatmapX - 8} y={heatmapY + (numPosDisplay * cellH) / 2}
          textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}
          transform={`rotate(-90, ${heatmapX - 8}, ${heatmapY + (numPosDisplay * cellH) / 2})`}>
          {t.positionAxis}
        </text>

        {/* Frequency band labels */}
        <text x={heatmapX + 2} y={heatmapY - 18} fontSize="7" fill={COLORS.red}
          fontFamily={FONTS.sans} fontWeight="600">{t.highFreq}</text>
        <text x={heatmapX + NUM_PAIRS * cellW - 2} y={heatmapY - 18}
          textAnchor="end" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans} fontWeight="600">{t.lowFreq}</text>

        {/* Heatmap cells */}
        {Array.from({ length: numPosDisplay }, (_, pi) => {
          const rowY = heatmapY + pi * cellH;
          return Array.from({ length: NUM_PAIRS }, (_, di) => {
            const angle = (pi * thetas[di]) % (2 * Math.PI);
            const normalizedAngle = angle / (2 * Math.PI);
            // Color: interpolate from blue (0) → yellow (0.5) → red (1)
            const r = Math.floor(255 * Math.min(1, normalizedAngle * 2));
            const g = Math.floor(255 * Math.max(0, 1 - Math.abs(normalizedAngle - 0.5) * 2));
            const b = Math.floor(255 * Math.max(0, 1 - normalizedAngle * 2));
            return (
              <rect key={`${pi}-${di}`}
                x={heatmapX + di * cellW} y={rowY}
                width={cellW} height={cellH}
                fill={`rgb(${r},${g},${b})`} opacity={0.8} />
            );
          });
        })}

        {/* Highlight current position row */}
        {pos < numPosDisplay && (
          <rect x={heatmapX - 1} y={heatmapY + pos * cellH - 1}
            width={NUM_PAIRS * cellW + 2} height={cellH + 2}
            fill="none" stroke={COLORS.dark} strokeWidth={1.5} />
        )}

        {/* Bottom: angle values for selected pos */}
        {(() => {
          const barY = heatmapY + numPosDisplay * cellH + 15;
          return (
            <g>
              <text x={W / 2} y={barY} textAnchor="middle" fontSize="8" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>
                {t.anglesAt.replace('{pos}', pos.toString())}
              </text>
              {angles.map((a, i) => {
                const bx = heatmapX + i * cellW;
                const barH = (a / (2 * Math.PI)) * 30;
                return (
                  <rect key={i} x={bx} y={barY + 35 - barH}
                    width={cellW - 1} height={barH} rx={1}
                    fill={i < NUM_PAIRS / 3 ? COLORS.red : i < 2 * NUM_PAIRS / 3 ? COLORS.orange : COLORS.primary}
                    opacity={0.7} />
                );
              })}
              <text x={heatmapX} y={barY + 45} fontSize="6"
                fill={COLORS.red} fontFamily={FONTS.sans}>{t.angleChangeLarge}</text>
              <text x={heatmapX + NUM_PAIRS * cellW} y={barY + 45}
                textAnchor="end" fontSize="6"
                fill={COLORS.primary} fontFamily={FONTS.sans}>{t.angleChangeSmall.replace('{max}', (NUM_PAIRS - 1).toString())}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
