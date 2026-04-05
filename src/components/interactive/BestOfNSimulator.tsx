import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function BestOfNSimulator() {
  const [n, setN] = useState(8);

  const data = useMemo(() => {
    const results: { n: number; accuracy: number; cost: number }[] = [];
    for (let ni = 1; ni <= 64; ni *= 2) {
      const baseAccuracy = 0.4;
      const accuracy = 1 - Math.pow(1 - baseAccuracy, ni);
      results.push({ n: ni, accuracy, cost: ni });
    }
    return results;
  }, []);

  const currentData = data.find(d => d.n === n) || data[0];

  const chartX = 60, chartY = 80, chartW = 220, chartH = 180;
  const chart2X = 330, chart2W = 210;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Best-of-N Sampling
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          生成 N 个回答 → 用 Verifier 选最好的
        </text>

        <text x={W / 2} y={64} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          N = {n}
        </text>
        {[1, 2, 4, 8, 16, 32, 64].map((ni, i) => (
          <g key={ni} onClick={() => setN(ni)} style={{ cursor: 'pointer' }}>
            <rect x={100 + i * 56} y={70} width={48} height={20} rx={4}
              fill={n === ni ? COLORS.primary : COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={124 + i * 56} y={84} textAnchor="middle" fontSize={9}
              fill={n === ni ? '#fff' : COLORS.dark}>{ni}</text>
          </g>
        ))}

        <text x={chartX + chartW / 2} y={chartY - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          正确率 vs N
        </text>
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        {data.map((d, i) => {
          const x = chartX + (i / (data.length - 1)) * chartW;
          const barH = d.accuracy * (chartH - 20);
          const isCurrent = d.n === n;
          return (
            <g key={i}>
              <rect x={x - 12} y={chartY + chartH - barH - 5} width={24} height={barH}
                rx={3} fill={isCurrent ? COLORS.green : COLORS.primary} opacity={isCurrent ? 1 : 0.4} />
              <text x={x} y={chartY + chartH + 12} textAnchor="middle" fontSize={8} fill={COLORS.dark} fontFamily={FONTS.mono}>
                {d.n}
              </text>
              <text x={x} y={chartY + chartH - barH - 10} textAnchor="middle" fontSize={8} fontWeight={600}
                fill={isCurrent ? COLORS.green : COLORS.mid} fontFamily={FONTS.mono}>
                {(d.accuracy * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        <text x={chart2X + chart2W / 2} y={chartY - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          计算成本 (相对)
        </text>
        <rect x={chart2X} y={chartY} width={chart2W} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        {data.map((d, i) => {
          const x = chart2X + (i / (data.length - 1)) * chart2W;
          const barH = (d.cost / 64) * (chartH - 20);
          const isCurrent = d.n === n;
          return (
            <g key={i}>
              <rect x={x - 12} y={chartY + chartH - barH - 5} width={24} height={barH}
                rx={3} fill={isCurrent ? COLORS.red : COLORS.orange} opacity={isCurrent ? 1 : 0.4} />
              <text x={x} y={chartY + chartH + 12} textAnchor="middle" fontSize={8} fill={COLORS.dark} fontFamily={FONTS.mono}>
                {d.n}
              </text>
              <text x={x} y={chartY + chartH - barH - 10} textAnchor="middle" fontSize={8} fontWeight={600}
                fill={isCurrent ? COLORS.red : COLORS.mid} fontFamily={FONTS.mono}>
                {d.cost}x
              </text>
            </g>
          );
        })}

        <rect x={40} y={H - 62} width={500} height={48} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 42} fontSize={11} fontWeight={600} fill={COLORS.orange}>
          N={n}: 正确率 {(currentData.accuracy * 100).toFixed(1)}% | 成本 {currentData.cost}x
        </text>
        <text x={50} y={H - 24} fontSize={10} fill={COLORS.mid}>
          {n <= 2 ? '提升有限，样本太少' :
           n <= 16 ? '性价比较好，准确率显著提升而成本可控' :
           'N 继续增大收益递减，但成本线性增长 — 需要 compute-optimal 策略'}
        </text>
      </svg>
    </div>
  );
}
