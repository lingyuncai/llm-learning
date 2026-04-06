import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

export default function GRPOGroupSampling({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'GRPO 组采样机制',
      subtitle: '同一 Prompt → 采样 G 个回答 → 组内相对排序 → 计算 Advantage',
      promptText: '同一个 Prompt → 采样',
      responses: '个回答',
      sortLabel: 'score 排序 | 绿色=比平均好(A>0) | 红色=比平均差(A<0)',
      formulaTitle: 'A_i = (r_i - mean(r)) / std(r)',
      formulaDesc: 'G 越大 → Advantage 估计越准（方差越小）→ 但计算成本线性增长 | 实践中 G=8~64',
    },
    en: {
      title: 'GRPO Group Sampling Mechanism',
      subtitle: 'Same Prompt → Sample G responses → Rank within group → Compute Advantage',
      promptText: 'Same Prompt → Sample',
      responses: 'responses',
      sortLabel: 'score sorted | green=better than avg (A>0) | red=worse than avg (A<0)',
      formulaTitle: 'A_i = (r_i - mean(r)) / std(r)',
      formulaDesc: 'Larger G → More accurate Advantage (lower variance) → But linear cost increase | In practice G=8~64',
    },
  }[locale];

  const [groupSize, setGroupSize] = useState(8);

  const samples = useMemo(() => {
    const result: { score: number; advantage: number }[] = [];
    for (let i = 0; i < groupSize; i++) {
      result.push({ score: Math.round((Math.random() * 4 + 3) * 100) / 100, advantage: 0 });
    }
    const mean = result.reduce((s, r) => s + r.score, 0) / result.length;
    const std = Math.sqrt(result.reduce((s, r) => s + (r.score - mean) ** 2, 0) / result.length) || 1;
    result.forEach(r => { r.advantage = Math.round(((r.score - mean) / std) * 100) / 100; });
    result.sort((a, b) => b.score - a.score);
    return result;
  }, [groupSize]);

  const barX = 40, barY = 110, barW = 440, barH = 200;
  const maxScore = Math.max(...samples.map(s => s.score));
  const itemW = barW / groupSize;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Group size slider */}
        <text x={W / 2} y={64} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          G = {groupSize}
        </text>
        {[4, 8, 16, 32].map((g, i) => (
          <g key={g} onClick={() => setGroupSize(g)} style={{ cursor: 'pointer' }}>
            <rect x={180 + i * 60} y={72} width={48} height={22} rx={4}
              fill={groupSize === g ? COLORS.primary : COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={204 + i * 60} y={87} textAnchor="middle" fontSize={10}
              fill={groupSize === g ? '#fff' : COLORS.dark}>G={g}</text>
          </g>
        ))}

        {/* Prompt */}
        <rect x={barX} y={barY - 14} width={barW} height={14} rx={3} fill={COLORS.valid} />
        <text x={barX + barW / 2} y={barY - 3} textAnchor="middle" fontSize={8} fill={COLORS.primary}>
          {t.promptText} {groupSize} {t.responses}
        </text>

        {/* Bars */}
        {samples.map((s, i) => {
          const x = barX + i * itemW;
          const h = (s.score / maxScore) * (barH - 30);
          const isPos = s.advantage > 0;
          return (
            <g key={i}>
              <rect x={x + 2} y={barY + barH - h} width={itemW - 4} height={h} rx={3}
                fill={isPos ? COLORS.green : COLORS.red} opacity={0.6 + Math.abs(s.advantage) * 0.15} />
              <text x={x + itemW / 2} y={barY + barH - h - 4} textAnchor="middle" fontSize={8}
                fill={COLORS.dark} fontFamily={FONTS.mono}>{s.score.toFixed(1)}</text>
              <text x={x + itemW / 2} y={barY + barH + 14} textAnchor="middle" fontSize={7}
                fill={isPos ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
                A={s.advantage > 0 ? '+' : ''}{s.advantage.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Mean line */}
        {(() => {
          const mean = samples.reduce((s, r) => s + r.score, 0) / samples.length;
          const meanY = barY + barH - (mean / maxScore) * (barH - 30);
          return (
            <>
              <line x1={barX} y1={meanY} x2={barX + barW} y2={meanY}
                stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="6 3" />
              <text x={barX + barW + 5} y={meanY + 4} fontSize={9} fill={COLORS.orange}>
                mean={mean.toFixed(2)}
              </text>
            </>
          );
        })()}

        {/* Labels */}
        <text x={barX + barW / 2} y={barY + barH + 28} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {t.sortLabel}
        </text>

        {/* Formula */}
        <rect x={30} y={H - 66} width={520} height={52} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={40} y={H - 48} fontSize={10} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          {t.formulaTitle}
        </text>
        <text x={40} y={H - 30} fontSize={10} fill={COLORS.mid}>
          {t.formulaDesc}
        </text>
      </svg>
    </div>
  );
}
