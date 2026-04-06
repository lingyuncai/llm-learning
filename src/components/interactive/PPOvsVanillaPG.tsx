import { useState, useRef } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function PPOvsVanillaPG({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'PPO vs Vanilla Policy Gradient 训练对比',
      performance: '性能',
      trainingSteps: '训练步数',
      vpg: 'VPG',
      ppo: 'PPO',
      vpgLabel: 'Vanilla PG（高方差、偶尔崩溃）',
      ppoLabel: 'PPO（稳定上升、clip 保护）',
      start: '开始训练',
      stop: '停止',
      reset: '重置',
      hoverHint: 'Hover 查看每步详情 | VPG 的崩溃来自策略更新过大',
    },
    en: {
      title: 'PPO vs Vanilla Policy Gradient Training Comparison',
      performance: 'Performance',
      trainingSteps: 'Training Steps',
      vpg: 'VPG',
      ppo: 'PPO',
      vpgLabel: 'Vanilla PG (high variance, occasional crashes)',
      ppoLabel: 'PPO (stable climb, clip protection)',
      start: 'Start Training',
      stop: 'Stop',
      reset: 'Reset',
      hoverHint: 'Hover to see step details | VPG crashes from excessive policy updates',
    },
  }[locale];

  const [vpgData, setVpgData] = useState<number[]>([]);
  const [ppoData, setPpoData] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const runRef = useRef(false);

  const simulate = async () => {
    runRef.current = true;
    setRunning(true);
    setVpgData([]);
    setPpoData([]);

    const vpg: number[] = [];
    const ppo: number[] = [];
    let vpgPerf = 0, ppoPerf = 0;

    for (let i = 0; i < 80 && runRef.current; i++) {
      // VPG: high variance, occasional crashes
      const vpgGrad = 0.8 + (Math.random() - 0.5) * 3;
      const vpgCrash = i > 10 && Math.random() < 0.08;
      vpgPerf = vpgCrash ? Math.max(0, vpgPerf - 15 - Math.random() * 20) : Math.min(100, vpgPerf + vpgGrad);
      vpg.push(vpgPerf);

      // PPO: stable, consistent
      const ppoGrad = 0.9 + (Math.random() - 0.5) * 0.8;
      ppoPerf = Math.min(100, ppoPerf + ppoGrad);
      ppo.push(ppoPerf);

      setVpgData([...vpg]);
      setPpoData([...ppo]);
      await new Promise(r => setTimeout(r, 40));
    }
    setRunning(false);
    runRef.current = false;
  };

  const stop = () => { runRef.current = false; setRunning(false); };
  const reset = () => { stop(); setVpgData([]); setPpoData([]); };

  const chartX = 50, chartY = 60, chartW = 480, chartH = 210;

  const drawCurve = (data: number[], color: string) => {
    if (data.length < 2) return null;
    const points = data.map((v, i) => {
      const x = chartX + (i / 79) * chartW;
      const y = chartY + chartH - (v / 100) * chartH;
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

        {/* Chart */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <text x={chartX - 5} y={chartY + 4} textAnchor="end" fontSize={8} fill={COLORS.mid}>100</text>
        <text x={chartX - 5} y={chartY + chartH} textAnchor="end" fontSize={8} fill={COLORS.mid}>0</text>
        <text x={chartX - 20} y={chartY + chartH / 2} textAnchor="middle" fontSize={9} fill={COLORS.mid}
          transform={`rotate(-90, ${chartX - 20}, ${chartY + chartH / 2})`}>{t.performance}</text>

        {drawCurve(vpgData, COLORS.red)}
        {drawCurve(ppoData, COLORS.green)}

        {/* Hover line */}
        {hoverIdx !== null && vpgData.length > hoverIdx && (
          <g>
            <line x1={chartX + (hoverIdx / 79) * chartW} y1={chartY}
              x2={chartX + (hoverIdx / 79) * chartW} y2={chartY + chartH}
              stroke={COLORS.mid} strokeWidth={0.5} strokeDasharray="3 2" />
            <rect x={chartX + (hoverIdx / 79) * chartW + 5} y={chartY + 5} width={110} height={38} rx={4}
              fill="rgba(255,255,255,0.95)" stroke={COLORS.mid} strokeWidth={0.5} />
            <text x={chartX + (hoverIdx / 79) * chartW + 10} y={chartY + 20} fontSize={9} fill={COLORS.red} fontFamily={FONTS.mono}>
              {t.vpg}: {vpgData[hoverIdx]?.toFixed(1)}
            </text>
            <text x={chartX + (hoverIdx / 79) * chartW + 10} y={chartY + 36} fontSize={9} fill={COLORS.green} fontFamily={FONTS.mono}>
              {t.ppo}: {ppoData[hoverIdx]?.toFixed(1)}
            </text>
          </g>
        )}

        {/* Hover detector */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill="transparent"
          onMouseMove={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            setHoverIdx(Math.min(vpgData.length - 1, Math.max(0, Math.round(x * 79))));
          }}
          onMouseLeave={() => setHoverIdx(null)} />

        {/* Legend */}
        <line x1={chartX + 10} y1={chartY + 14} x2={chartX + 30} y2={chartY + 14} stroke={COLORS.red} strokeWidth={2} />
        <text x={chartX + 35} y={chartY + 18} fontSize={10} fill={COLORS.red}>{t.vpgLabel}</text>
        <line x1={chartX + 10} y1={chartY + 30} x2={chartX + 30} y2={chartY + 30} stroke={COLORS.green} strokeWidth={2} />
        <text x={chartX + 35} y={chartY + 34} fontSize={10} fill={COLORS.green}>{t.ppoLabel}</text>

        {/* X axis */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={10} fill={COLORS.mid}>{t.trainingSteps}</text>

        {/* Controls */}
        <g onClick={running ? stop : simulate} style={{ cursor: 'pointer' }}>
          <rect x={50} y={H - 42} width={90} height={28} rx={5} fill={running ? COLORS.red : COLORS.primary} />
          <text x={95} y={H - 24} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {running ? t.stop : t.start}
          </text>
        </g>
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={150} y={H - 42} width={60} height={28} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={180} y={H - 24} textAnchor="middle" fontSize={11} fill={COLORS.dark}>{t.reset}</text>
        </g>

        <text x={W - 20} y={H - 10} textAnchor="end" fontSize={9} fill={COLORS.mid}>
          {t.hoverHint}
        </text>
      </svg>
    </div>
  );
}
