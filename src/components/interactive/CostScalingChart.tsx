import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// Simulated data: quality improvement vs cost with N models
const DATA = [
  { n: 1, quality: 90, cost: 1 },
  { n: 2, quality: 94, cost: 2 },
  { n: 3, quality: 96, cost: 3 },
  { n: 4, quality: 97, cost: 4 },
  { n: 5, quality: 97.5, cost: 5 },
  { n: 6, quality: 97.8, cost: 6 },
  { n: 8, quality: 98, cost: 8 },
  { n: 10, quality: 98.1, cost: 10 },
];

export default function CostScalingChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 580, H = 340;
  const cL = 65, cR = 520, cT = 55, cB = 240;
  const cW = cR - cL, cH = cB - cT;

  const getX = (n: number) => cL + ((n - 1) / 9) * cW;
  const getYQ = (q: number) => cB - ((q - 85) / 15) * cH;
  const getYC = (c: number) => cB - (c / 10) * cH;

  const qualityPath = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(d.n)},${getYQ(d.quality)}`).join(' ');
  const costPath = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(d.n)},${getYC(d.cost)}`).join(' ');

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          模型数量 vs 成本与质量
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          质量提升递减，成本线性增长 — 收益递减曲线
        </text>

        {/* Axes */}
        <line x1={cL} y1={cB} x2={cR} y2={cB} stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={cL} y1={cT} x2={cL} y2={cB} stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={(cL + cR) / 2} y={cB + 28} textAnchor="middle"
              fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>模型数量 →</text>

        {/* Curves */}
        <path d={qualityPath} fill="none" stroke={COLORS.green} strokeWidth="2.5" />
        <path d={costPath} fill="none" stroke={COLORS.red} strokeWidth="2.5" />

        {/* Labels */}
        <text x={cR + 5} y={getYQ(98)} fontFamily={FONTS.sans} fontSize="10" fill={COLORS.green}>质量 %</text>
        <text x={cR + 5} y={getYC(10)} fontFamily={FONTS.sans} fontSize="10" fill={COLORS.red}>成本 ×</text>

        {/* Data points */}
        {DATA.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
             style={{ cursor: 'pointer' }}>
            <circle cx={getX(d.n)} cy={getYQ(d.quality)} r={hovered === i ? 6 : 4}
                    fill={COLORS.green} stroke="#fff" strokeWidth="1.5" />
            <circle cx={getX(d.n)} cy={getYC(d.cost)} r={hovered === i ? 6 : 4}
                    fill={COLORS.red} stroke="#fff" strokeWidth="1.5" />
            <text x={getX(d.n)} y={cB + 15} textAnchor="middle"
                  fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>{d.n}</text>
          </g>
        ))}

        {/* Hover detail */}
        {hovered !== null && (() => {
          const d = DATA[hovered];
          const marginalQ = hovered > 0 ? (d.quality - DATA[hovered - 1].quality).toFixed(1) : '-';
          return (
            <g transform={`translate(${cL + 10}, ${cT + 5})`}>
              <rect x="0" y="0" width="200" height="42" rx="4" fill="#fff" stroke={COLORS.mid} strokeWidth="1" />
              <text x="10" y="16" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
                {d.n} 个模型: 质量 {d.quality}% · 成本 {d.cost}×
              </text>
              <text x="10" y="34" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
                边际质量提升: +{marginalQ}% (收益递减)
              </text>
            </g>
          );
        })()}

        {/* Sweet spot annotation */}
        <g>
          <line x1={getX(3)} y1={cT + 10} x2={getX(3)} y2={cB}
                stroke={COLORS.primary} strokeWidth="1.5" strokeDasharray="5,3" />
          <text x={getX(3)} y={cT + 8} textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="9" fontWeight="600" fill={COLORS.primary}>
            ← sweet spot
          </text>
        </g>

        {/* Insight */}
        <g transform="translate(40, 275)">
          <rect x="0" y="0" width="500" height="48" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="18" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            关键洞察: 2-3 个模型是 sweet spot
          </text>
          <text x="15" y="36" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            从 1→3: 质量 +6%，成本 3×。从 3→10: 质量仅 +2%，成本再 3.3×。收益递减严重。
          </text>
        </g>
      </svg>
    </div>
  );
}
