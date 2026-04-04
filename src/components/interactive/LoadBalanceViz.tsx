import { useState, useMemo } from 'react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

const W = 580;
const H = 260;
const NUM_EXPERTS = 8;

// Simulated load distribution based on aux loss coefficient
function getLoadDistribution(alpha: number): number[] {
  // At alpha=0: highly skewed (power law). At alpha=0.1: nearly uniform.
  // Use a simple exponential decay model
  const raw = Array.from({ length: NUM_EXPERTS }, (_, i) => {
    const skew = Math.exp(-i * 0.8); // natural skew
    const uniform = 1 / NUM_EXPERTS;
    return skew * (1 - alpha * 10) + uniform * (alpha * 10);
  });
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map(v => v / total);
}

export default function LoadBalanceViz() {
  const [alpha, setAlpha] = useState(0);

  const loads = useMemo(() => getLoadDistribution(alpha), [alpha]);
  const maxLoad = Math.max(...loads);

  const barStartX = 80;
  const barMaxW = 400;
  const barH = 22;
  const barGap = 6;
  const barStartY = 75;
  const idealLoad = 1 / NUM_EXPERTS;

  return (
    <div className="my-6">
      <div className="flex items-center justify-center gap-4 mb-3">
        <label className="text-xs text-gray-500">
          Aux Loss 系数 α = {alpha.toFixed(3)}
          <input type="range" min={0} max={0.1} step={0.005} value={alpha}
            onChange={e => setAlpha(Number(e.target.value))} className="ml-2 w-40" />
        </label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Expert 负载分布 (α = {alpha.toFixed(3)})
        </text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {alpha === 0
            ? '无 aux loss: 少数 expert 承担大部分 token（expert collapse）'
            : alpha >= 0.08
              ? 'aux loss 足够大: 负载接近均匀'
              : 'aux loss 逐渐增大: 负载趋于均衡'}
        </text>

        {/* Ideal load line */}
        {(() => {
          const idealX = barStartX + (idealLoad / maxLoad) * barMaxW;
          return (
            <g>
              <line x1={idealX} y1={barStartY - 5} x2={idealX}
                y2={barStartY + NUM_EXPERTS * (barH + barGap)}
                stroke={COLORS.green} strokeWidth={1} strokeDasharray="4,3" />
              <text x={idealX} y={barStartY - 8} textAnchor="middle"
                fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
                ideal = {(idealLoad * 100).toFixed(1)}%
              </text>
            </g>
          );
        })()}

        {loads.map((load, i) => {
          const y = barStartY + i * (barH + barGap);
          const barW = (load / maxLoad) * barMaxW;
          const overloaded = load > idealLoad * 1.5;
          const color = overloaded ? COLORS.red : HEAD_COLORS[i % HEAD_COLORS.length];
          return (
            <g key={i}>
              <text x={barStartX - 8} y={y + barH / 2 + 1} textAnchor="end"
                dominantBaseline="middle" fontSize="8" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>E{i}</text>
              <rect x={barStartX} y={y} width={barMaxW} height={barH} rx={3}
                fill="#f1f5f9" />
              <rect x={barStartX} y={y} width={barW} height={barH} rx={3}
                fill={color} opacity={0.7} />
              <text x={barStartX + barW + 5} y={y + barH / 2 + 1}
                dominantBaseline="middle" fontSize="7" fontWeight="600"
                fill={color} fontFamily={FONTS.mono}>
                {(load * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Formula */}
        <text x={W / 2} y={H - 18} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily={FONTS.mono}>
          L_aux = α · N · Σᵢ fᵢ · Pᵢ （fᵢ = 实际接收比例, Pᵢ = router 分配概率均值）
        </text>
      </svg>
    </div>
  );
}
