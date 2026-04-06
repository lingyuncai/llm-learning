import { useState, useRef } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function BaselineEffect({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Baseline 对 Policy Gradient 方差的影响',
      toggleWithBaseline: '✓ 显示有 Baseline',
      toggleNoBaseline: '✗ 显示无 Baseline',
      xAxisLabel: '训练步数',
      legendNoBaseline: '无 Baseline：方差大、抖动剧烈',
      legendWithBaseline: '有 Baseline：方差小、收敛平滑',
      formulaNoBaseline: '无 Baseline: ∇J ≈ ∇log π · G (raw return)',
      formulaWithBaseline: 'Advantage A(s,a) = Q(s,a) - V(s)',
      explainNoBaseline: 'Raw return 包含绝对值大小的信号，即使所有 reward 为正，梯度仍在正方向波动',
      explainWithBaseline: '减去 baseline V(s) 后，梯度反映"比平均好多少"而非"绝对好坏"，方差大幅降低',
      btnRun: '运行模拟',
      btnStop: '停止',
    },
    en: {
      title: 'Effect of Baseline on Policy Gradient Variance',
      toggleWithBaseline: '✓ Show With Baseline',
      toggleNoBaseline: '✗ Show Without Baseline',
      xAxisLabel: 'Training Steps',
      legendNoBaseline: 'No Baseline: high variance, severe oscillation',
      legendWithBaseline: 'With Baseline: low variance, smooth convergence',
      formulaNoBaseline: 'No Baseline: ∇J ≈ ∇log π · G (raw return)',
      formulaWithBaseline: 'Advantage A(s,a) = Q(s,a) - V(s)',
      explainNoBaseline: 'Raw return contains absolute magnitude signal, gradient oscillates in positive direction even when all rewards are positive',
      explainWithBaseline: 'Subtracting baseline V(s) makes gradient reflect "how much better than average" instead of "absolute goodness", drastically reducing variance',
      btnRun: 'Run Simulation',
      btnStop: 'Stop',
    },
  }[locale];
  const [useBaseline, setUseBaseline] = useState(false);
  const [noBaselineData, setNoBaselineData] = useState<number[]>([]);
  const [baselineData, setBaselineData] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const runRef = useRef(false);

  const simulate = async () => {
    runRef.current = true;
    setRunning(true);
    setNoBaselineData([]);
    setBaselineData([]);

    let nbCum = 0, bCum = 0;
    const nbPoints: number[] = [];
    const bPoints: number[] = [];

    for (let i = 0; i < 60 && runRef.current; i++) {
      // No baseline: raw returns, high variance
      const rawReturn = Math.sin(i * 0.1) * 2 + (Math.random() - 0.5) * 4;
      nbCum += rawReturn * 0.05;
      nbPoints.push(nbCum);

      // With baseline: advantage = return - baseline, low variance
      const advantage = Math.sin(i * 0.1) * 2 + (Math.random() - 0.5) * 1.2;
      bCum += advantage * 0.05;
      bPoints.push(bCum);

      setNoBaselineData([...nbPoints]);
      setBaselineData([...bPoints]);

      await new Promise(r => setTimeout(r, 50));
    }
    setRunning(false);
    runRef.current = false;
  };

  const stop = () => { runRef.current = false; setRunning(false); };

  const chartX = 40, chartY = 80, chartW = 500, chartH = 200;

  const drawCurve = (data: number[], color: string) => {
    if (data.length < 2) return null;
    const maxAbs = Math.max(1, ...data.map(Math.abs), ...(useBaseline ? baselineData : noBaselineData).map(Math.abs));
    const points = data.map((v, i) => {
      const x = chartX + (i / 59) * chartW;
      const y = chartY + chartH / 2 - (v / maxAbs) * (chartH / 2 - 10);
      return `${x},${y}`;
    }).join(' ');
    return <polyline points={points} fill="none" stroke={color} strokeWidth={2} />;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Toggle */}
        <g onClick={() => setUseBaseline(!useBaseline)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 80} y={36} width={160} height={26} rx={13}
            fill={useBaseline ? COLORS.green : COLORS.red} opacity={0.9} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {useBaseline ? t.toggleWithBaseline : t.toggleNoBaseline}
          </text>
        </g>

        {/* Chart area */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <line x1={chartX} y1={chartY + chartH / 2} x2={chartX + chartW} y2={chartY + chartH / 2}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4 3" />
        <text x={chartX - 4} y={chartY + chartH / 2 + 4} textAnchor="end" fontSize={9} fill={COLORS.mid}>0</text>

        {/* Labels */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 20} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          {t.xAxisLabel}
        </text>

        {/* Curves */}
        {!useBaseline && drawCurve(noBaselineData, COLORS.red)}
        {useBaseline && drawCurve(baselineData, COLORS.green)}

        {/* Legend */}
        <rect x={chartX + 10} y={chartY + 8} width={160} height={36} rx={4} fill="rgba(255,255,255,0.9)" />
        {!useBaseline ? (
          <>
            <line x1={chartX + 18} y1={chartY + 22} x2={chartX + 38} y2={chartY + 22} stroke={COLORS.red} strokeWidth={2} />
            <text x={chartX + 44} y={chartY + 26} fontSize={10} fill={COLORS.dark}>{t.legendNoBaseline}</text>
          </>
        ) : (
          <>
            <line x1={chartX + 18} y1={chartY + 22} x2={chartX + 38} y2={chartY + 22} stroke={COLORS.green} strokeWidth={2} />
            <text x={chartX + 44} y={chartY + 26} fontSize={10} fill={COLORS.dark}>{t.legendWithBaseline}</text>
          </>
        )}

        {/* Explanation */}
        <rect x={40} y={H - 70} width={500} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 50} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {useBaseline ? t.formulaWithBaseline : t.formulaNoBaseline}
        </text>
        <text x={50} y={H - 34} fontSize={10} fill={COLORS.mid}>
          {useBaseline ? t.explainWithBaseline : t.explainNoBaseline}
        </text>

        {/* Controls */}
        <g onClick={running ? stop : simulate} style={{ cursor: 'pointer' }}>
          <rect x={40} y={H - 14} width={80} height={24} rx={5} fill={running ? COLORS.red : COLORS.primary} />
          <text x={80} y={H + 1} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {running ? t.btnStop : t.btnRun}
          </text>
        </g>
      </svg>
    </div>
  );
}
