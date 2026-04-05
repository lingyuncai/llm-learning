import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function KLPenaltyViz() {
  const [beta, setBeta] = useState(0.1);

  const data = useMemo(() => {
    const points = 50;
    const result: { step: number; rmScore: number; klDiv: number; totalReward: number }[] = [];

    for (let i = 0; i < points; i++) {
      const t = i / points;
      // RM score increases then plateaus as model optimizes
      const rmScore = 3 * (1 - Math.exp(-t * 5)) + Math.random() * 0.3;
      // KL divergence grows as model drifts from reference
      const klDiv = t * t * 20 + Math.random() * 0.5;
      const totalReward = rmScore - beta * klDiv;
      result.push({ step: i, rmScore, klDiv, totalReward });
    }
    return result;
  }, [beta]);

  const chartX = 50, chartY = 90, chartW = 480, chartH = 200;

  const maxRM = Math.max(...data.map(d => d.rmScore));
  const maxKL = Math.max(...data.map(d => d.klDiv));
  const maxTotal = Math.max(...data.map(d => Math.abs(d.totalReward)));

  const toY = (val: number, max: number) => chartY + chartH / 2 - (val / max) * (chartH / 2 - 10);

  const drawLine = (getData: (d: typeof data[0]) => number, max: number, color: string) => {
    const points = data.map((d, i) => {
      const x = chartX + (i / (data.length - 1)) * chartW;
      const y = toY(getData(d), max);
      return `${x},${y}`;
    }).join(' ');
    return <polyline points={points} fill="none" stroke={color} strokeWidth={2} />;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          KL 惩罚系数 β 的影响
        </text>

        {/* Beta slider */}
        <text x={W / 2} y={48} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          β = {beta.toFixed(2)}
        </text>
        <text x={50} y={68} fontSize={9} fill={COLORS.mid}>β=0 (无惩罚→reward hacking)</text>
        <text x={W - 50} y={68} textAnchor="end" fontSize={9} fill={COLORS.mid}>β=0.5 (强约束→几乎没优化)</text>
        <rect x={50} y={74} width={480} height={6} rx={3} fill={COLORS.light} />
        <circle cx={50 + (beta / 0.5) * 480} cy={77} r={7} fill={COLORS.primary} stroke="#fff" strokeWidth={2} />
        <rect x={50} y={64} width={480} height={26} fill="transparent" style={{ cursor: 'pointer' }}
          onMouseDown={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const update = (clientX: number) => {
              const x = (clientX - rect.left) / rect.width;
              setBeta(Math.max(0, Math.min(0.5, x * 0.5)));
            };
            update(e.clientX);
            const onMove = (ev: MouseEvent) => update(ev.clientX);
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        />

        {/* Chart */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <line x1={chartX} y1={chartY + chartH / 2} x2={chartX + chartW} y2={chartY + chartH / 2}
          stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4 3" />

        {drawLine(d => d.rmScore, maxRM, COLORS.green)}
        {drawLine(d => -d.klDiv * beta, maxTotal, COLORS.red)}
        {drawLine(d => d.totalReward, maxTotal, COLORS.primary)}

        {/* Legend */}
        {[
          { color: COLORS.green, label: 'RM Score (质量)' },
          { color: COLORS.red, label: '-β·KL (惩罚)' },
          { color: COLORS.primary, label: 'Total Reward (实际优化目标)' },
        ].map((item, i) => (
          <g key={i}>
            <line x1={chartX + 8} y1={chartY + 12 + i * 16} x2={chartX + 24} y2={chartY + 12 + i * 16}
              stroke={item.color} strokeWidth={2} />
            <text x={chartX + 30} y={chartY + 16 + i * 16} fontSize={9} fill={COLORS.dark}>{item.label}</text>
          </g>
        ))}

        {/* X axis */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          训练步数
        </text>

        {/* Insight */}
        <rect x={40} y={H - 52} width={500} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 34} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {beta < 0.05 ? '⚠️ β 太小：KL 几乎无惩罚 → 模型会 reward hack（RM score 高但实际质量下降）' :
           beta < 0.2 ? '✓ β 适中：RM score 和 KL 惩罚平衡 → 稳定的对齐效果' :
           '⚠️ β 太大：KL 惩罚过强 → 模型几乎不变，等于白训练'}
        </text>
      </svg>
    </div>
  );
}
