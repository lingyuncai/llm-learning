import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function ScalingParadigmCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Train-Time vs Test-Time Scaling',
      subtitle: '两种不同的"投入更多计算"策略',
      trainTimeLabel: 'Train-Time Scaling',
      testTimeLabel: 'Test-Time Scaling',
      xAxisTrain: '模型参数量 / 训练数据量',
      xAxisTest: '推理时计算量（采样次数 / 搜索深度）',
      yAxis: '性能',
      trendSlow: '趋缓 ↗',
      trendUp: '持续提升 ↑',
      trainBoxTitle: 'Train-Time',
      trainBoxDesc1: '增大模型/数据 → 性能提升但趋缓',
      trainBoxDesc2: '成本：训练一次，推理无额外开销',
      testBoxTitle: 'Test-Time',
      testBoxDesc1: '固定模型，推理投入更多计算',
      testBoxDesc2: '成本：每次推理都额外消耗计算',
    },
    en: {
      title: 'Train-Time vs Test-Time Scaling',
      subtitle: 'Two strategies for "scaling up compute"',
      trainTimeLabel: 'Train-Time Scaling',
      testTimeLabel: 'Test-Time Scaling',
      xAxisTrain: 'Model params / Training data',
      xAxisTest: 'Inference compute (samples / search depth)',
      yAxis: 'Performance',
      trendSlow: 'Slowing ↗',
      trendUp: 'Continues ↑',
      trainBoxTitle: 'Train-Time',
      trainBoxDesc1: 'Scale model/data → performance ↑ but saturates',
      trainBoxDesc2: 'Cost: train once, no inference overhead',
      testBoxTitle: 'Test-Time',
      testBoxDesc1: 'Fixed model, invest more compute at inference',
      testBoxDesc2: 'Cost: extra compute per inference',
    },
  }[locale];

  const [hovered, setHovered] = useState<'train' | 'test' | null>(null);

  const chartX = 60, chartY = 70, chartW = 200, chartH = 220;
  const chart2X = 320;

  const trainData = Array.from({ length: 20 }, (_, i) => {
    const x = (i + 1) / 20;
    return { x, y: 1 - Math.exp(-x * 3) };
  });

  const testData = Array.from({ length: 20 }, (_, i) => {
    const x = (i + 1) / 20;
    return { x, y: 0.4 + 0.5 * (1 - Math.exp(-x * 4)) };
  });

  const toPath = (data: { x: number; y: number }[], cx: number) =>
    data.map((d, i) => {
      const px = cx + d.x * chartW;
      const py = chartY + chartH - d.y * chartH;
      return `${i === 0 ? 'M' : 'L'} ${px},${py}`;
    }).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle}
        </text>

        <text x={chartX + chartW / 2} y={chartY - 8} textAnchor="middle" fontSize={11} fontWeight={600}
          fill={hovered === 'train' ? COLORS.primary : COLORS.dark}>
          {t.trainTimeLabel}
        </text>
        <rect x={chartX} y={chartY} width={chartW} height={chartH}
          fill={COLORS.bgAlt} stroke={hovered === 'train' ? COLORS.primary : COLORS.light} strokeWidth={hovered === 'train' ? 2 : 1} rx={4}
          onMouseEnter={() => setHovered('train')} onMouseLeave={() => setHovered(null)} />
        <path d={toPath(trainData, chartX)} fill="none" stroke={COLORS.primary} strokeWidth={2.5} />
        <text x={chartX + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {t.xAxisTrain}
        </text>
        <text x={chartX + chartW - 30} y={chartY + 30} fontSize={9} fill={COLORS.red}>{t.trendSlow}</text>

        <text x={chart2X + chartW / 2} y={chartY - 8} textAnchor="middle" fontSize={11} fontWeight={600}
          fill={hovered === 'test' ? COLORS.green : COLORS.dark}>
          {t.testTimeLabel}
        </text>
        <rect x={chart2X} y={chartY} width={chartW} height={chartH}
          fill={COLORS.bgAlt} stroke={hovered === 'test' ? COLORS.green : COLORS.light} strokeWidth={hovered === 'test' ? 2 : 1} rx={4}
          onMouseEnter={() => setHovered('test')} onMouseLeave={() => setHovered(null)} />
        <path d={toPath(testData, chart2X)} fill="none" stroke={COLORS.green} strokeWidth={2.5} />
        <text x={chart2X + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {t.xAxisTest}
        </text>
        <text x={chart2X + chartW - 20} y={chartY + 30} fontSize={9} fill={COLORS.green}>{t.trendUp}</text>

        <text x={chartX - 12} y={chartY + chartH / 2} textAnchor="middle" fontSize={9} fill={COLORS.mid}
          transform={`rotate(-90, ${chartX - 12}, ${chartY + chartH / 2})`}>{t.yAxis}</text>

        <rect x={30} y={H - 68} width={250} height={54} rx={6} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
        <text x={40} y={H - 50} fontSize={10} fontWeight={600} fill={COLORS.primary}>{t.trainBoxTitle}</text>
        <text x={40} y={H - 34} fontSize={9} fill={COLORS.mid}>{t.trainBoxDesc1}</text>
        <text x={40} y={H - 20} fontSize={9} fill={COLORS.mid}>{t.trainBoxDesc2}</text>

        <rect x={300} y={H - 68} width={250} height={54} rx={6} fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1} />
        <text x={310} y={H - 50} fontSize={10} fontWeight={600} fill={COLORS.green}>{t.testBoxTitle}</text>
        <text x={310} y={H - 34} fontSize={9} fill={COLORS.mid}>{t.testBoxDesc1}</text>
        <text x={310} y={H - 20} fontSize={9} fill={COLORS.mid}>{t.testBoxDesc2}</text>
      </svg>
    </div>
  );
}
