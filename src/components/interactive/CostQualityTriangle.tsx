import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// 模型数据：name, quality (0-100), cost (0-100), latency (0-100)
const MODELS = [
  { name: 'GPT-4o', quality: 95, cost: 95, latency: 60, color: '#6a1b9a' },
  { name: 'Claude 3.5 Sonnet', quality: 90, cost: 80, latency: 50, color: '#1565c0' },
  { name: 'Llama-3-70B', quality: 82, cost: 40, latency: 70, color: '#2e7d32' },
  { name: 'Llama-3-8B', quality: 60, cost: 10, latency: 30, color: '#e65100' },
  { name: 'Mixtral-8x7B', quality: 75, cost: 25, latency: 45, color: '#00838f' },
  { name: 'GPT-4o-mini', quality: 78, cost: 15, latency: 25, color: '#4527a0' },
  { name: 'Phi-3-mini', quality: 55, cost: 5, latency: 20, color: '#ef6c00' },
];

export default function CostQualityTriangle() {
  const [budget, setBudget] = useState(50);

  const W = 580, H = 400;
  const plotL = 80, plotR = 540, plotT = 60, plotB = 320;
  const plotW = plotR - plotL, plotH = plotB - plotT;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Title */}
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          成本预算 vs 模型质量
        </text>

        {/* Budget slider label */}
        <text x={W / 2} y="48" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="12" fill={COLORS.mid}>
          拖动滑块调整成本预算上限：{budget}%
        </text>

        {/* Axes */}
        <line x1={plotL} y1={plotB} x2={plotR} y2={plotB}
              stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={plotL} y1={plotT} x2={plotL} y2={plotB}
              stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={W / 2} y={plotB + 35} textAnchor="middle"
              fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>
          相对成本 →
        </text>
        <text x={plotL - 15} y={(plotT + plotB) / 2} textAnchor="middle"
              fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}
              transform={`rotate(-90, ${plotL - 15}, ${(plotT + plotB) / 2})`}>
          质量 →
        </text>

        {/* Budget line */}
        {(() => {
          const bx = plotL + (budget / 100) * plotW;
          return (
            <>
              <line x1={bx} y1={plotT} x2={bx} y2={plotB}
                    stroke={COLORS.red} strokeWidth="2" strokeDasharray="6,4" />
              <rect x={bx - 30} y={plotT - 5} width="60" height="18" rx="3"
                    fill={COLORS.red} />
              <text x={bx} y={plotT + 8} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10" fill="#fff">
                预算线
              </text>
              {/* Affordable zone */}
              <rect x={plotL} y={plotT} width={bx - plotL} height={plotH}
                    fill={COLORS.valid} opacity="0.3" />
            </>
          );
        })()}

        {/* Model dots */}
        {MODELS.map((m) => {
          const cx = plotL + (m.cost / 100) * plotW;
          const cy = plotB - (m.quality / 100) * plotH;
          const affordable = m.cost <= budget;
          return (
            <g key={m.name} opacity={affordable ? 1 : 0.3}>
              <circle cx={cx} cy={cy} r="8"
                      fill={affordable ? m.color : COLORS.light}
                      stroke={m.color} strokeWidth="2" />
              <text x={cx + 12} y={cy + 4}
                    fontFamily={FONTS.sans} fontSize="10"
                    fill={affordable ? COLORS.dark : COLORS.mid}>
                {m.name}
                {affordable ? ` (质量 ${m.quality}%)` : ''}
              </text>
            </g>
          );
        })}

        {/* Summary */}
        {(() => {
          const affordable = MODELS.filter(m => m.cost <= budget);
          const best = affordable.length > 0
            ? affordable.reduce((a, b) => a.quality > b.quality ? a : b)
            : null;
          return (
            <g>
              <rect x={plotL} y={plotB + 45} width={plotW} height="32" rx="4"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x={W / 2} y={plotB + 65} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>
                {best
                  ? `预算内最优：${best.name}（质量 ${best.quality}%，成本 ${best.cost}%）— 共 ${affordable.length} 个可选模型`
                  : '预算过低，无可用模型'}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* HTML slider for better UX */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500 font-mono">0%</span>
        <input type="range" min="0" max="100" value={budget}
               onChange={e => setBudget(Number(e.target.value))}
               className="w-64 accent-blue-700" />
        <span className="text-sm text-gray-500 font-mono">100%</span>
      </div>
    </div>
  );
}
