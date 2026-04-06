import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Model {
  name: string;
  quality: number; // 0-100
  cost: number; // 0-100
  color: string;
}

const ALL_MODELS: Model[] = [
  { name: 'Phi-3-mini', quality: 55, cost: 5, color: '#ef6c00' },
  { name: 'Llama-8B', quality: 62, cost: 10, color: COLORS.green },
  { name: 'GPT-4o-mini', quality: 78, cost: 15, color: '#4527a0' },
  { name: 'Mixtral-8x7B', quality: 75, cost: 25, color: '#00838f' },
  { name: 'Llama-70B', quality: 82, cost: 40, color: '#2e7d32' },
  { name: 'Claude Sonnet', quality: 90, cost: 60, color: '#1565c0' },
  { name: 'GPT-4o', quality: 95, cost: 95, color: '#6a1b9a' },
];

function computePareto(models: Model[]): Model[] {
  const sorted = [...models].sort((a, b) => a.cost - b.cost);
  const pareto: Model[] = [];
  let maxQuality = -1;
  for (const m of sorted) {
    if (m.quality > maxQuality) {
      pareto.push(m);
      maxQuality = m.quality;
    }
  }
  return pareto;
}

export default function ParetoFrontierViz() {
  const [enabled, setEnabled] = useState(new Set(ALL_MODELS.map((_, i) => i)));

  const toggle = (idx: number) => {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const activeModels = ALL_MODELS.filter((_, i) => enabled.has(i));
  const pareto = computePareto(activeModels);
  const paretoNames = new Set(pareto.map(p => p.name));

  const W = 580, H = 380;
  const pL = 70, pR = 420, pT = 55, pB = 280;
  const pW = pR - pL, pH = pB - pT;

  const getX = (cost: number) => pL + (cost / 100) * pW;
  const getY = (quality: number) => pB - (quality / 100) * pH;

  // Pareto frontier path
  const paretoPath = pareto.length > 0
    ? pareto.map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(p.cost)},${getY(p.quality)}`).join(' ')
    : '';

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={290} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Pareto 前沿：成本 vs 质量
        </text>
        <text x={290} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          点击右侧列表添加/移除模型，观察 Pareto 前沿变化
        </text>

        {/* Axes */}
        <line x1={pL} y1={pB} x2={pR} y2={pB} stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={pL} y1={pT} x2={pL} y2={pB} stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={(pL + pR) / 2} y={pB + 28} textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>成本 →</text>
        <text x={pL - 12} y={(pT + pB) / 2} textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}
              transform={`rotate(-90, ${pL - 12}, ${(pT + pB) / 2})`}>质量 →</text>

        {/* Pareto frontier line */}
        {paretoPath && (
          <path d={paretoPath} fill="none" stroke={COLORS.primary} strokeWidth="2.5" strokeDasharray="6,3" />
        )}

        {/* Model dots */}
        {activeModels.map(m => {
          const isPareto = paretoNames.has(m.name);
          return (
            <g key={m.name}>
              <circle cx={getX(m.cost)} cy={getY(m.quality)} r={isPareto ? 8 : 6}
                      fill={isPareto ? m.color : COLORS.light}
                      stroke={m.color} strokeWidth="2" />
              <text x={getX(m.cost)} y={getY(m.quality) - 12} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="9"
                    fontWeight={isPareto ? "700" : "400"} fill={m.color}>
                {m.name}
              </text>
            </g>
          );
        })}

        {/* Model toggle list */}
        <g transform="translate(435, 55)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            模型列表:
          </text>
          {ALL_MODELS.map((m, i) => {
            const isOn = enabled.has(i);
            const isPareto = isOn && paretoNames.has(m.name);
            return (
              <g key={m.name} transform={`translate(0, ${10 + i * 28})`}
                 onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
                <rect x="0" y="0" width="130" height="22" rx="3"
                      fill={isOn ? (isPareto ? COLORS.valid : COLORS.bgAlt) : COLORS.light}
                      stroke={isOn ? m.color : COLORS.mid} strokeWidth={isOn ? 1.5 : 0.5} />
                <circle cx="12" cy="11" r="4" fill={isOn ? m.color : COLORS.mid} />
                <text x="22" y="15" fontFamily={FONTS.sans} fontSize="9"
                      fill={isOn ? COLORS.dark : COLORS.mid}
                      style={{ pointerEvents: 'none' }}>
                  {m.name} {isPareto ? '⭐' : ''}
                </text>
              </g>
            );
          })}

          <text x="0" y={10 + ALL_MODELS.length * 28 + 10} fontFamily={FONTS.sans}
                fontSize="9" fill={COLORS.mid}>
            ⭐ = Pareto 最优
          </text>
          <text x="0" y={10 + ALL_MODELS.length * 28 + 24} fontFamily={FONTS.sans}
                fontSize="9" fill={COLORS.mid}>
            前沿上的模型在其成本下质量最高
          </text>
        </g>

        {/* Info */}
        <g transform="translate(40, 300)">
          <rect x="0" y="0" width="390" height="55" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="18" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            Pareto 前沿: {pareto.length} 个模型
          </text>
          <text x="15" y="36" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {pareto.map(p => p.name).join(' → ')}
          </text>
          <text x="15" y="50" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            添加新模型可能改变前沿 · ParetoBandit (2026) 在此基础上做 cost-aware 选择
          </text>
        </g>
      </svg>
    </div>
  );
}
