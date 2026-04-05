import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

export default function PPOClipExplainer() {
  const [epsilon, setEpsilon] = useState(0.2);
  const [advPositive, setAdvPositive] = useState(true);

  const chartX = 60, chartY = 100, chartW = 460, chartH = 220;
  const ratioMin = 0, ratioMax = 2.5;

  const toChartX = (ratio: number) => chartX + ((ratio - ratioMin) / (ratioMax - ratioMin)) * chartW;
  const toChartY = (val: number) => chartY + chartH / 2 - (val / 2) * (chartH / 2);

  // PPO objective: L = min(ratio * A, clip(ratio, 1-eps, 1+eps) * A)
  const getObjective = (ratio: number): { unclipped: number; clipped: number; final: number } => {
    const A = advPositive ? 1 : -1;
    const unclipped = ratio * A;
    const clippedRatio = Math.max(1 - epsilon, Math.min(1 + epsilon, ratio));
    const clipped = clippedRatio * A;
    const final = Math.min(unclipped, clipped);
    return { unclipped, clipped, final };
  };

  const numPoints = 100;
  const ratios = Array.from({ length: numPoints }, (_, i) => ratioMin + (i / (numPoints - 1)) * (ratioMax - ratioMin));

  const makePath = (getValue: (r: number) => number, color: string, dashed?: boolean) => {
    const points = ratios.map(r => `${toChartX(r)},${toChartY(getValue(r))}`).join(' ');
    return <polyline points={points} fill="none" stroke={color} strokeWidth={2}
      strokeDasharray={dashed ? '6 3' : undefined} />;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          PPO Clipped Surrogate Objective
        </text>

        {/* Controls */}
        <text x={80} y={52} fontSize={11} fill={COLORS.dark} fontFamily={FONTS.mono}>
          ε = {epsilon.toFixed(2)}
        </text>
        {[0.1, 0.2, 0.3, 0.4].map((e, i) => (
          <g key={e} onClick={() => setEpsilon(e)} style={{ cursor: 'pointer' }}>
            <rect x={160 + i * 50} y={40} width={40} height={22} rx={4}
              fill={epsilon === e ? COLORS.primary : COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={180 + i * 50} y={55} textAnchor="middle" fontSize={10}
              fill={epsilon === e ? '#fff' : COLORS.dark}>{e}</text>
          </g>
        ))}

        {/* Advantage toggle */}
        <g onClick={() => setAdvPositive(!advPositive)} style={{ cursor: 'pointer' }}>
          <rect x={380} y={40} width={170} height={22} rx={4}
            fill={advPositive ? COLORS.green : COLORS.red} />
          <text x={465} y={55} textAnchor="middle" fontSize={10} fontWeight={600} fill="#fff">
            A {advPositive ? '> 0 (好动作)' : '< 0 (坏动作)'}
          </text>
        </g>

        {/* Chart area */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {/* Axes */}
        <line x1={chartX} y1={chartY + chartH / 2} x2={chartX + chartW} y2={chartY + chartH / 2}
          stroke={COLORS.mid} strokeWidth={0.5} />
        <text x={chartX + chartW + 5} y={chartY + chartH / 2 + 4} fontSize={9} fill={COLORS.mid}>0</text>

        {/* ratio = 1 line */}
        <line x1={toChartX(1)} y1={chartY} x2={toChartX(1)} y2={chartY + chartH}
          stroke={COLORS.mid} strokeWidth={0.5} strokeDasharray="4 3" />
        <text x={toChartX(1)} y={chartY + chartH + 14} textAnchor="middle" fontSize={9} fill={COLORS.dark}>
          ratio=1
        </text>

        {/* Clip boundaries */}
        <line x1={toChartX(1 - epsilon)} y1={chartY} x2={toChartX(1 - epsilon)} y2={chartY + chartH}
          stroke={COLORS.orange} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <line x1={toChartX(1 + epsilon)} y1={chartY} x2={toChartX(1 + epsilon)} y2={chartY + chartH}
          stroke={COLORS.orange} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <text x={toChartX(1 - epsilon)} y={chartY - 4} textAnchor="middle" fontSize={8} fill={COLORS.orange}>1-ε</text>
        <text x={toChartX(1 + epsilon)} y={chartY - 4} textAnchor="middle" fontSize={8} fill={COLORS.orange}>1+ε</text>

        {/* Clip region shading */}
        <rect x={toChartX(1 - epsilon)} y={chartY}
          width={toChartX(1 + epsilon) - toChartX(1 - epsilon)} height={chartH}
          fill={COLORS.orange} opacity={0.06} />

        {/* Curves */}
        {makePath(r => getObjective(r).unclipped, COLORS.mid, true)}
        {makePath(r => getObjective(r).final, COLORS.primary)}

        {/* Legend */}
        <line x1={chartX + 10} y1={chartY + 14} x2={chartX + 30} y2={chartY + 14}
          stroke={COLORS.mid} strokeWidth={2} strokeDasharray="6 3" />
        <text x={chartX + 35} y={chartY + 18} fontSize={9} fill={COLORS.mid}>ratio × A (无 clip)</text>
        <line x1={chartX + 10} y1={chartY + 30} x2={chartX + 30} y2={chartY + 30}
          stroke={COLORS.primary} strokeWidth={2} />
        <text x={chartX + 35} y={chartY + 34} fontSize={9} fill={COLORS.primary}>L_CLIP = min(...) (PPO)</text>

        {/* X axis label */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 28} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          ratio = π_new(a|s) / π_old(a|s)
        </text>

        {/* Explanation */}
        <rect x={40} y={H - 56} width={500} height={44} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 38} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          L_CLIP = min(ratio·A, clip(ratio, 1-ε, 1+ε)·A)
        </text>
        <text x={50} y={H - 22} fontSize={10} fill={COLORS.mid}>
          {advPositive
            ? 'A>0 时：ratio 超过 1+ε 后 objective 不再增长 → 阻止过度增大好动作概率'
            : 'A<0 时：ratio 低于 1-ε 后 objective 不再减小 → 阻止过度减小坏动作概率'}
        </text>
      </svg>
    </div>
  );
}
