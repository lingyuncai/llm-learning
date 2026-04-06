import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function RewardScalingChart({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Reward Model Scaling：更大的 RM 更难被 Hack',
      subtitle: 'RM 参数量 vs 对齐效果 / Hack 成功率',
      alignmentEffect: '对齐效果',
      hackRate: 'Hack 率',
      legendAlignment: '对齐效果 ↑',
      legendHack: 'Hack 成功率 ↓',
      xAxisLabel: 'Reward Model 参数量',
      scalingLaw: 'Scaling Law for RM: 更大的 RM → 更好的对齐 + 更难被 hack (Gao et al., 2022)',
    },
    en: {
      title: 'Reward Model Scaling: Larger RM is Harder to Hack',
      subtitle: 'RM parameter count vs alignment effect / hack success rate',
      alignmentEffect: 'Alignment Effect',
      hackRate: 'Hack Rate',
      legendAlignment: 'Alignment Effect ↑',
      legendHack: 'Hack Success Rate ↓',
      xAxisLabel: 'Reward Model Parameter Count',
      scalingLaw: 'Scaling Law for RM: Larger RM → Better alignment + Harder to hack (Gao et al., 2022)',
    },
  }[locale];

  const [hovered, setHovered] = useState<number | null>(null);

  const chartX = 70, chartY = 60, chartW = 440, chartH = 210;
  const dataPoints = [
    { size: '125M', alignment: 0.35, hackRate: 0.82 },
    { size: '350M', alignment: 0.48, hackRate: 0.68 },
    { size: '1.3B', alignment: 0.62, hackRate: 0.52 },
    { size: '6.7B', alignment: 0.75, hackRate: 0.35 },
    { size: '13B', alignment: 0.83, hackRate: 0.22 },
    { size: '70B', alignment: 0.91, hackRate: 0.12 },
  ];

  const toX = (i: number) => chartX + (i / (dataPoints.length - 1)) * chartW;
  const toY = (v: number) => chartY + chartH - v * chartH;

  const alignmentPath = dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(d.alignment)}`).join(' ');
  const hackPath = dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(d.hackRate)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle}
        </text>

        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {[0.25, 0.5, 0.75].map(v => (
          <line key={v} x1={chartX} y1={toY(v)} x2={chartX + chartW} y2={toY(v)}
            stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4 3" />
        ))}

        <path d={alignmentPath} fill="none" stroke={COLORS.green} strokeWidth={2.5} />
        <path d={hackPath} fill="none" stroke={COLORS.red} strokeWidth={2.5} />

        {dataPoints.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <circle cx={toX(i)} cy={toY(d.alignment)} r={hovered === i ? 6 : 4} fill={COLORS.green} />
            <circle cx={toX(i)} cy={toY(d.hackRate)} r={hovered === i ? 6 : 4} fill={COLORS.red} />
            <text x={toX(i)} y={chartY + chartH + 14} textAnchor="middle" fontSize={8} fill={COLORS.dark} fontFamily={FONTS.mono}>
              {d.size}
            </text>
            {hovered === i && (
              <g>
                <rect x={toX(i) + 8} y={toY(d.alignment) - 20} width={100} height={36} rx={4}
                  fill="rgba(255,255,255,0.95)" stroke={COLORS.mid} strokeWidth={0.5} />
                <text x={toX(i) + 14} y={toY(d.alignment) - 6} fontSize={9} fill={COLORS.green} fontFamily={FONTS.mono}>
                  {t.alignmentEffect}: {(d.alignment * 100).toFixed(0)}%
                </text>
                <text x={toX(i) + 14} y={toY(d.alignment) + 8} fontSize={9} fill={COLORS.red} fontFamily={FONTS.mono}>
                  {t.hackRate}: {(d.hackRate * 100).toFixed(0)}%
                </text>
              </g>
            )}
          </g>
        ))}

        <line x1={chartX + 10} y1={chartY + 14} x2={chartX + 30} y2={chartY + 14} stroke={COLORS.green} strokeWidth={2.5} />
        <text x={chartX + 35} y={chartY + 18} fontSize={10} fill={COLORS.green}>{t.legendAlignment}</text>
        <line x1={chartX + 150} y1={chartY + 14} x2={chartX + 170} y2={chartY + 14} stroke={COLORS.red} strokeWidth={2.5} />
        <text x={chartX + 175} y={chartY + 18} fontSize={10} fill={COLORS.red}>{t.legendHack}</text>

        <text x={chartX + chartW / 2} y={chartY + chartH + 30} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          {t.xAxisLabel}
        </text>

        <rect x={40} y={H - 48} width={500} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 28} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {t.scalingLaw}
        </text>
      </svg>
    </div>
  );
}
