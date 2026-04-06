import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function OfflineVsOnline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      dpoTitle: 'DPO: Offline — 固定数据集',
      fixedDataset: '固定偏好数据集',
      dpoTraining: 'DPO 训练',
      oneTime: '一次性',
      alignedModel: '对齐模型',
      features: '特点：',
      dpoFeatures: '✓ 训练简单 ✓ 不需要在线生成 ✗ 数据分布偏移 ✗ 容易过拟合',
      dpoNote: '数据在训练前收集好，模型看不到自己新策略产生的回答',
      onlineTitle: 'Online DPO: 迭代采样新数据',
      currentModel: '当前模型',
      genResponse: '生成回答',
      labelPref: '标注偏好',
      dpoUpdate: 'DPO 更新',
      iterLoop: '迭代循环',
      onlineNote: '用当前策略采样 → 标注 → 训练 → 缓解分布偏移，但增加计算成本',
      grpoTitle: 'GRPO: 在线 + 组内相对排序',
      prompt: 'Prompt',
      sampleG: '采样 G 个回答',
      groupRank: '组内排序',
      relAdvantage: '相对 Advantage',
      update: '更新',
      keyInnovation: '关键创新：去掉 Critic',
      grpoNote: '用组内相对排序替代 Critic 网络估计 Advantage → 减少一个大模型 → 降低 GPU 需求',
      step1: 'DPO (Offline)',
      step2: 'Online DPO',
      step3: 'GRPO (在线组采样)',
    },
    en: {
      dpoTitle: 'DPO: Offline — Fixed Dataset',
      fixedDataset: 'Fixed Preference Dataset',
      dpoTraining: 'DPO Training',
      oneTime: 'One-time',
      alignedModel: 'Aligned Model',
      features: 'Features:',
      dpoFeatures: '✓ Simple training ✓ No online sampling ✗ Distribution shift ✗ Easy to overfit',
      dpoNote: 'Data collected before training, model cannot see responses from its new policy',
      onlineTitle: 'Online DPO: Iterative Sampling',
      currentModel: 'Current Model',
      genResponse: 'Generate Response',
      labelPref: 'Label Preference',
      dpoUpdate: 'DPO Update',
      iterLoop: 'Iteration Loop',
      onlineNote: 'Sample with current policy → Label → Train → Mitigate shift, but higher cost',
      grpoTitle: 'GRPO: Online + Group Relative Ranking',
      prompt: 'Prompt',
      sampleG: 'Sample G Responses',
      groupRank: 'Group Ranking',
      relAdvantage: 'Relative Advantage',
      update: 'Update',
      keyInnovation: 'Key Innovation: Remove Critic',
      grpoNote: 'Use group ranking instead of Critic to estimate Advantage → Remove one LLM → Reduce GPU needs',
      step1: 'DPO (Offline)',
      step2: 'Online DPO',
      step3: 'GRPO (Online Group Sampling)',
    },
  }[locale];

  const steps = [
    {
      title: t.step1,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.dpoTitle}
          </text>
          <rect x={30} y={40} width={130} height={40} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={95} y={64} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.primary}>
            {t.fixedDataset}
          </text>
          <line x1={165} y1={60} x2={220} y2={60} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrowOO)" />
          <rect x={225} y={40} width={100} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={275} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.dpoTraining}</text>
          <text x={275} y={72} textAnchor="middle" fontSize={8} fill={COLORS.mid}>{t.oneTime}</text>
          <line x1={330} y1={60} x2={385} y2={60} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowOO)" />
          <rect x={390} y={40} width={100} height={40} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={440} y={64} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>{t.alignedModel}</text>

          <defs>
            <marker id="arrowOO" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
            </marker>
          </defs>

          <rect x={30} y={100} width={460} height={60} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.dark}>{t.features}</text>
          <text x={40} y={136} fontSize={10} fill={COLORS.mid}>{t.dpoFeatures}</text>
          <text x={40} y={152} fontSize={10} fill={COLORS.mid}>{t.dpoNote}</text>
        </svg>
      ),
    },
    {
      title: t.step2,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.onlineTitle}
          </text>
          {[
            { label: t.currentModel, x: 80, y: 80, color: COLORS.primary },
            { label: t.genResponse, x: 210, y: 80, color: COLORS.orange },
            { label: t.labelPref, x: 340, y: 80, color: COLORS.green },
            { label: t.dpoUpdate, x: 470, y: 80, color: COLORS.purple },
          ].map((item, i) => (
            <g key={i}>
              <rect x={item.x - 50} y={item.y - 18} width={100} height={36} rx={6}
                fill={COLORS.bgAlt} stroke={item.color} strokeWidth={1.5} />
              <text x={item.x} y={item.y + 4} textAnchor="middle" fontSize={10} fontWeight={600} fill={item.color}>
                {item.label}
              </text>
              {i < 3 && (
                <line x1={item.x + 55} y1={item.y} x2={item.x + 75} y2={item.y}
                  stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowOO)" />
              )}
            </g>
          ))}
          <path d="M 470 100 Q 470 140 275 140 Q 80 140 80 100"
            fill="none" stroke={COLORS.primary} strokeWidth={1.5} strokeDasharray="6 3" markerEnd="url(#arrowOO)" />
          <text x={275} y={138} textAnchor="middle" fontSize={9} fill={COLORS.primary}>{t.iterLoop}</text>

          <rect x={30} y={155} width={520} height={20} rx={4} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={W / 2} y={169} textAnchor="middle" fontSize={10} fill={COLORS.orange}>
            {t.onlineNote}
          </text>
        </svg>
      ),
    },
    {
      title: t.step3,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.grpoTitle}
          </text>
          <rect x={30} y={40} width={80} height={36} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={70} y={62} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.primary}>{t.prompt}</text>

          <line x1={115} y1={58} x2={145} y2={58} stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowOO)" />

          <rect x={150} y={35} width={150} height={90} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={225} y={52} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.sampleG}</text>
          {Array.from({ length: 4 }, (_, i) => (
            <rect key={i} x={162} y={58 + i * 15} width={126} height={12} rx={3}
              fill={i === 0 ? '#d4edda' : i === 3 ? COLORS.waste : COLORS.bgAlt}
              stroke={COLORS.mid} strokeWidth={0.5} />
          ))}

          <line x1={305} y1={58} x2={335} y2={58} stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowOO)" />

          <rect x={340} y={35} width={110} height={46} rx={6} fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1.5} />
          <text x={395} y={55} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>{t.groupRank}</text>
          <text x={395} y={72} textAnchor="middle" fontSize={8} fill={COLORS.mid}>{t.relAdvantage}</text>

          <line x1={455} y1={58} x2={485} y2={58} stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowOO)" />

          <rect x={490} y={40} width={70} height={36} rx={6} fill={COLORS.purple} stroke={COLORS.purple} strokeWidth={1.5} />
          <text x={525} y={62} textAnchor="middle" fontSize={10} fontWeight={600} fill="#fff">{t.update}</text>

          <rect x={30} y={135} width={520} height={40} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={152} fontSize={10} fontWeight={600} fill={COLORS.red}>{t.keyInnovation}</text>
          <text x={40} y={168} fontSize={10} fill={COLORS.mid}>
            {t.grpoNote}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
