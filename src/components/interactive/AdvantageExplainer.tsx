import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function AdvantageExplainer({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Raw Return G',
      step1Heading: '原始 Return：绝对好坏',
      step1Issue: '问题：所有 Return 为正 → 所有动作概率都增加 → 梯度方向不稳定',
      step2Title: '减去 Baseline b(s)',
      step2Heading: '减去 Baseline b(s) = V(s) ≈ 5.67',
      step2Result: '现在有正有负 → 好动作推高，坏动作压低 → 梯度方向清晰！',
      step3Title: 'Advantage 定义',
      step3Heading: 'Advantage Function A(s,a) = Q(s,a) - V(s)',
      step3QDesc: 'Q(s,a) = 执行动作 a 的价值 | V(s) = 所有动作的平均价值',
      step3Positive: 'A > 0：比平均好',
      step3PositiveAction: '→ 增加该动作概率',
      step3Negative: 'A < 0：比平均差',
      step3NegativeAction: '→ 减少该动作概率',
      step3Summary: 'Advantage 是相对评价：不是"好不好"，而是"比平均好多少"',
      step4Title: '为什么 Advantage 更有效',
      step4Heading: 'Advantage 的数学保证',
      step4NoBaseline: '无 Baseline',
      step4NoBaselineVar: '方差 ∝ E[G²] — 很大',
      step4NoBaselineEffect: '所有为正的 G 都推高概率',
      step4WithBaseline: '有 Baseline (Advantage)',
      step4WithBaselineVar: '方差 ∝ E[A²] — 小得多',
      step4WithBaselineEffect: '只有比平均好的才推高概率',
      step4KeyProperty: '关键性质：E[A(s,a)] = 0 → 梯度无偏 + 低方差 → 这是 Actor-Critic 的基础',
      actionA: 'action A',
      actionB: 'action B',
      actionC: 'action C',
      baseline: 'baseline',
    },
    en: {
      step1Title: 'Raw Return G',
      step1Heading: 'Raw Return: Absolute Value',
      step1Issue: 'Issue: All positive returns → all action probs increase → unstable gradient',
      step2Title: 'Subtract Baseline b(s)',
      step2Heading: 'Subtract Baseline b(s) = V(s) ≈ 5.67',
      step2Result: 'Now mixed signs → good actions up, bad actions down → clear gradient!',
      step3Title: 'Advantage Definition',
      step3Heading: 'Advantage Function A(s,a) = Q(s,a) - V(s)',
      step3QDesc: 'Q(s,a) = value of action a | V(s) = average value of all actions',
      step3Positive: 'A > 0: better than average',
      step3PositiveAction: '→ increase action probability',
      step3Negative: 'A < 0: worse than average',
      step3NegativeAction: '→ decrease action probability',
      step3Summary: 'Advantage is relative: not "good or bad", but "how much better than average"',
      step4Title: 'Why Advantage Works Better',
      step4Heading: 'Mathematical Guarantees of Advantage',
      step4NoBaseline: 'No Baseline',
      step4NoBaselineVar: 'variance ∝ E[G²] — large',
      step4NoBaselineEffect: 'all positive G increase probability',
      step4WithBaseline: 'With Baseline (Advantage)',
      step4WithBaselineVar: 'variance ∝ E[A²] — much smaller',
      step4WithBaselineEffect: 'only better-than-average increase prob',
      step4KeyProperty: 'Key property: E[A(s,a)] = 0 → unbiased gradient + low variance → foundation of Actor-Critic',
      actionA: 'action A',
      actionB: 'action B',
      actionC: 'action C',
      baseline: 'baseline',
    },
  }[locale];
  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step1Heading}
          </text>
          {/* Bar chart showing raw returns */}
          {[
            { label: t.actionA, value: 8, color: COLORS.green },
            { label: t.actionB, value: 6, color: COLORS.green },
            { label: t.actionC, value: 3, color: COLORS.green },
          ].map((item, i) => {
            const x = 80 + i * 160;
            const h = item.value * 12;
            return (
              <g key={i}>
                <rect x={x} y={120 - h} width={100} height={h} rx={4} fill={item.color} opacity={0.7} />
                <text x={x + 50} y={138} textAnchor="middle" fontSize={11} fill={COLORS.dark}>{item.label}</text>
                <text x={x + 50} y={120 - h - 6} textAnchor="middle" fontSize={11} fontWeight={600}
                  fill={COLORS.dark} fontFamily={FONTS.mono}>G = {item.value}</text>
              </g>
            );
          })}
          <text x={W / 2} y={165} textAnchor="middle" fontSize={11} fill={COLORS.red}>
            {t.step1Issue}
          </text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step2Heading}
          </text>
          {/* Bar chart showing centered values */}
          {[
            { label: t.actionA, raw: 8, adj: 2.33, color: COLORS.green },
            { label: t.actionB, raw: 6, adj: 0.33, color: COLORS.green },
            { label: t.actionC, raw: 3, adj: -2.67, color: COLORS.red },
          ].map((item, i) => {
            const x = 80 + i * 160;
            const baseline_y = 100;
            const h = Math.abs(item.adj) * 16;
            const isPos = item.adj > 0;
            return (
              <g key={i}>
                <rect x={x} y={isPos ? baseline_y - h : baseline_y}
                  width={100} height={h} rx={4}
                  fill={item.color} opacity={0.7} />
                <text x={x + 50} y={138} textAnchor="middle" fontSize={11} fill={COLORS.dark}>{item.label}</text>
                <text x={x + 50} y={isPos ? baseline_y - h - 6 : baseline_y + h + 14}
                  textAnchor="middle" fontSize={11} fontWeight={600}
                  fill={isPos ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
                  {item.adj > 0 ? '+' : ''}{item.adj.toFixed(2)}
                </text>
              </g>
            );
          })}
          <line x1={60} y1={100} x2={520} y2={100} stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="6 3" />
          <text x={530} y={104} fontSize={10} fill={COLORS.orange}>{t.baseline}</text>
          <text x={W / 2} y={168} textAnchor="middle" fontSize={11} fill={COLORS.green}>
            {t.step2Result}
          </text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step3Heading}
          </text>
          <rect x={40} y={40} width={500} height={60} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={W / 2} y={62} textAnchor="middle" fontSize={12} fontFamily={FONTS.mono} fill={COLORS.primary}>
            A(s,a) = Q(s,a) - V(s)
          </text>
          <text x={W / 2} y={82} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
            {t.step3QDesc}
          </text>

          <rect x={60} y={115} width={200} height={40} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={160} y={133} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.green}>
            {t.step3Positive}
          </text>
          <text x={160} y={148} textAnchor="middle" fontSize={10} fill={COLORS.mid}>{t.step3PositiveAction}</text>

          <rect x={320} y={115} width={200} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={420} y={133} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.red}>
            {t.step3Negative}
          </text>
          <text x={420} y={148} textAnchor="middle" fontSize={10} fill={COLORS.mid}>{t.step3NegativeAction}</text>

          <text x={W / 2} y={175} textAnchor="middle" fontSize={11} fill={COLORS.orange} fontWeight={600}>
            {t.step3Summary}
          </text>
        </svg>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step4Heading}
          </text>

          <rect x={30} y={40} width={240} height={90} rx={8} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={150} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.red}>
            {t.step4NoBaseline}
          </text>
          <text x={150} y={76} textAnchor="middle" fontSize={10} fill={COLORS.dark}>
            ∇J = E[∇log π · G]
          </text>
          <text x={150} y={94} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.step4NoBaselineVar}
          </text>
          <text x={150} y={112} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.step4NoBaselineEffect}
          </text>

          <rect x={310} y={40} width={240} height={90} rx={8} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={430} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.green}>
            {t.step4WithBaseline}
          </text>
          <text x={430} y={76} textAnchor="middle" fontSize={10} fill={COLORS.dark}>
            ∇J = E[∇log π · A]
          </text>
          <text x={430} y={94} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.step4WithBaselineVar}
          </text>
          <text x={430} y={112} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.step4WithBaselineEffect}
          </text>

          <rect x={80} y={145} width={420} height={28} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={W / 2} y={163} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.orange}>
            {t.step4KeyProperty}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
