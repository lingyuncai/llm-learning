import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Problem {
  difficulty: number;
  strategy: string;
  compute: number;
  color: string;
}

export default function ComputeOptimalInference() {
  const [hovered, setHovered] = useState<number | null>(null);

  const problems: Problem[] = [
    { difficulty: 0.1, strategy: '直接回答', compute: 1, color: COLORS.green },
    { difficulty: 0.2, strategy: '直接回答', compute: 1, color: COLORS.green },
    { difficulty: 0.35, strategy: 'CoT', compute: 3, color: COLORS.primary },
    { difficulty: 0.45, strategy: 'CoT', compute: 4, color: COLORS.primary },
    { difficulty: 0.55, strategy: 'CoT', compute: 5, color: COLORS.primary },
    { difficulty: 0.65, strategy: 'Best-of-4', compute: 8, color: COLORS.orange },
    { difficulty: 0.72, strategy: 'Best-of-8', compute: 16, color: COLORS.orange },
    { difficulty: 0.8, strategy: 'Best-of-16', compute: 24, color: COLORS.orange },
    { difficulty: 0.88, strategy: 'MCTS', compute: 40, color: COLORS.red },
    { difficulty: 0.95, strategy: 'MCTS deep', compute: 60, color: COLORS.red },
  ];

  const chartX = 60, chartY = 60, chartW = 460, chartH = 220;
  const maxCompute = Math.max(...problems.map(p => p.compute));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Compute-Optimal Inference
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          简单问题少想，难问题多想 — 动态分配推理计算
        </text>

        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {problems.map((p, i) => {
          const x = chartX + p.difficulty * chartW;
          const y = chartY + chartH - (p.compute / maxCompute) * (chartH - 20);
          const isHov = hovered === i;
          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>
              <circle cx={x} cy={y} r={isHov ? 10 : 7} fill={p.color} opacity={0.8}
                stroke={isHov ? COLORS.dark : 'none'} strokeWidth={2} />
              {isHov && (
                <g>
                  <rect x={x + 12} y={y - 24} width={120} height={40} rx={4}
                    fill="rgba(255,255,255,0.95)" stroke={COLORS.mid} strokeWidth={0.5} />
                  <text x={x + 18} y={y - 8} fontSize={9} fontWeight={600} fill={p.color}>
                    {p.strategy}
                  </text>
                  <text x={x + 18} y={y + 6} fontSize={9} fill={COLORS.mid} fontFamily={FONTS.mono}>
                    计算量: {p.compute}x | 难度: {(p.difficulty * 100).toFixed(0)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        <path d={`M ${chartX + problems[0].difficulty * chartW},${chartY + chartH - (problems[0].compute / maxCompute) * (chartH - 20)}
          Q ${chartX + 0.5 * chartW},${chartY + chartH - (10 / maxCompute) * (chartH - 20)}
          ${chartX + problems[problems.length - 1].difficulty * chartW},${chartY + chartH - (problems[problems.length - 1].compute / maxCompute) * (chartH - 20)}`}
          fill="none" stroke={COLORS.mid} strokeWidth={1} strokeDasharray="6 3" />

        <text x={chartX + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          问题难度 →
        </text>
        <text x={chartX - 8} y={chartY + chartH / 2} textAnchor="middle" fontSize={10} fill={COLORS.mid}
          transform={`rotate(-90, ${chartX - 8}, ${chartY + chartH / 2})`}>
          推理计算量 →
        </text>

        {[
          { color: COLORS.green, label: '直接回答 (1x)' },
          { color: COLORS.primary, label: 'CoT (3-5x)' },
          { color: COLORS.orange, label: 'Best-of-N (8-24x)' },
          { color: COLORS.red, label: 'MCTS (40-60x)' },
        ].map((item, i) => (
          <g key={i}>
            <circle cx={chartX + 10 + i * 125} cy={chartY + chartH + 32} r={5} fill={item.color} />
            <text x={chartX + 20 + i * 125} y={chartY + chartH + 36} fontSize={9} fill={COLORS.dark}>
              {item.label}
            </text>
          </g>
        ))}

        <rect x={40} y={H - 48} width={500} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 28} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          核心思想：根据问题难度动态选择策略 — "2+2=?" 不需要 MCTS，但 AMC 竞赛题值得深度搜索
        </text>
      </svg>
    </div>
  );
}
