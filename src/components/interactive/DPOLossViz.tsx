import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function DPOLossViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [beta, setBeta] = useState(0.1);

  const t = {
    zh: {
      title: 'DPO Loss 函数可视化',
      preferredLower: 'preferred 概率 < rejected',
      preferredHigher: 'preferred 概率 > rejected',
      gradientLabel: '梯度 → 推高 preferred',
      formula: 'L_DPO = -log σ(β · margin)',
      explanation: 'β 越大 → loss 曲线越陡 → 对偏好差异更敏感 | β 越小 → 更平缓 → 容忍更大偏差',
    },
    en: {
      title: 'DPO Loss Function Visualization',
      preferredLower: 'preferred prob < rejected',
      preferredHigher: 'preferred prob > rejected',
      gradientLabel: 'gradient → push up preferred',
      formula: 'L_DPO = -log σ(β · margin)',
      explanation: 'Higher β → steeper loss curve → more sensitive to preference gap | Lower β → smoother → tolerates larger deviation',
    },
  }[locale];

  const chartX = 60, chartY = 90, chartW = 460, chartH = 200;
  const xMin = -4, xMax = 4;

  const toChartX = (v: number) => chartX + ((v - xMin) / (xMax - xMin)) * chartW;
  const toChartY = (v: number) => chartY + chartH - ((v + 0.5) / 5) * chartH;

  // DPO loss: L = -log σ(β * (log_ratio_w - log_ratio_l))
  const sigma = (x: number) => 1 / (1 + Math.exp(-x));
  const dpoLoss = (margin: number) => -Math.log(sigma(beta * margin) + 1e-8);

  const numPoints = 100;
  const margins = Array.from({ length: numPoints }, (_, i) => xMin + (i / (numPoints - 1)) * (xMax - xMin));

  const lossPoints = margins.map(m => ({
    x: toChartX(m),
    y: toChartY(dpoLoss(m)),
  }));

  const pathStr = lossPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Beta selector */}
        <text x={W / 2} y={48} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          β = {beta.toFixed(2)}
        </text>
        {[0.05, 0.1, 0.2, 0.5].map((b, i) => (
          <g key={b} onClick={() => setBeta(b)} style={{ cursor: 'pointer' }}>
            <rect x={180 + i * 60} y={56} width={48} height={22} rx={4}
              fill={beta === b ? COLORS.primary : COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={204 + i * 60} y={71} textAnchor="middle" fontSize={10}
              fill={beta === b ? '#fff' : COLORS.dark}>{b}</text>
          </g>
        ))}

        {/* Chart */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {/* Zero line */}
        <line x1={toChartX(0)} y1={chartY} x2={toChartX(0)} y2={chartY + chartH}
          stroke={COLORS.mid} strokeWidth={0.5} strokeDasharray="4 3" />
        <text x={toChartX(0)} y={chartY + chartH + 14} textAnchor="middle" fontSize={9} fill={COLORS.dark}>0</text>

        {/* Regions */}
        <rect x={chartX} y={chartY} width={toChartX(0) - chartX} height={chartH}
          fill={COLORS.red} opacity={0.04} />
        <rect x={toChartX(0)} y={chartY} width={chartX + chartW - toChartX(0)} height={chartH}
          fill={COLORS.green} opacity={0.04} />

        <text x={toChartX(-2)} y={chartY + 16} textAnchor="middle" fontSize={9} fill={COLORS.red}>
          {t.preferredLower}
        </text>
        <text x={toChartX(2)} y={chartY + 16} textAnchor="middle" fontSize={9} fill={COLORS.green}>
          {t.preferredHigher}
        </text>

        {/* Loss curve */}
        <path d={pathStr} fill="none" stroke={COLORS.primary} strokeWidth={2.5} />

        {/* Gradient arrows */}
        <line x1={toChartX(-2)} y1={toChartY(dpoLoss(-2))} x2={toChartX(-1)} y2={toChartY(dpoLoss(-2))}
          stroke={COLORS.green} strokeWidth={2} markerEnd="url(#arrowDPO)" />
        <text x={toChartX(-1.5)} y={toChartY(dpoLoss(-2)) - 8} textAnchor="middle" fontSize={8} fill={COLORS.green}>
          {t.gradientLabel}
        </text>

        <defs>
          <marker id="arrowDPO" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
          </marker>
        </defs>

        {/* Axes labels */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 28} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          margin = log(π/π_ref)(y_w) - log(π/π_ref)(y_l)
        </text>
        <text x={chartX - 8} y={chartY + chartH / 2} textAnchor="end" fontSize={10} fill={COLORS.mid}
          transform={`rotate(-90, ${chartX - 8}, ${chartY + chartH / 2})`}>Loss</text>

        {/* Explanation */}
        <rect x={40} y={H - 52} width={500} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 34} fontSize={10} fontWeight={600} fill={COLORS.orange} fontFamily={FONTS.mono}>
          {t.formula}
        </text>
        <text x={50} y={H - 18} fontSize={10} fill={COLORS.mid}>
          {t.explanation}
        </text>
      </svg>
    </div>
  );
}
