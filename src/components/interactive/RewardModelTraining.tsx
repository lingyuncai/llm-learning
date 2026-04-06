import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function RewardModelTraining({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '偏好对收集',
      step1Heading: 'Step 1: 收集人类偏好数据',
      prompt: 'Prompt',
      winner: 'y_w ✓',
      loser: 'y_l ✗',
      pair: '偏好对 (w≻l)',
      dataset: '偏好数据集',
      pairs: '~10K-100K 对',
      humanAnnotated: '人工标注',
      step2Title: 'Bradley-Terry 概率建模',
      step2Heading: 'Step 2: Bradley-Terry 模型',
      formula: 'P(y_w ≻ y_l | x) = σ(r_φ(x, y_w) - r_φ(x, y_l))',
      formulaExplain: 'σ = sigmoid | r_φ = Reward Model 输出的标量分数',
      intuition: '直觉：',
      delta: 'Δ = 2.1',
      probability: 'σ(2.1) = 89%',
      explanation: '分数差越大 → 选择概率越高 → 模型越"自信"这个偏好排序是对的',
      step3Title: 'Ranking Loss 训练',
      step3Heading: 'Step 3: 训练 Reward Model',
      lossFormula: 'L(φ) = -E[log σ(r_φ(x,y_w) - r_φ(x,y_l))]',
      lossExplain: '最大化"赢家比输家分高"的概率 → RM 学会排序',
      sftModel: 'SFT Model',
      initRM: '（初始化 RM）',
      rmTraining: 'RM Training',
      rankingLoss: 'ranking loss',
      rewardModel: 'Reward Model',
      scalarScore: 'r_φ(x, y) → 标量分数',
      keyPoint: '关键点：',
      keyText: 'RM 通常是比 policy LLM 小的模型 | 输出一个标量分数而非文本 | 从 SFT 模型初始化',
    },
    en: {
      step1Title: 'Preference Pair Collection',
      step1Heading: 'Step 1: Collect Human Preference Data',
      prompt: 'Prompt',
      winner: 'y_w ✓',
      loser: 'y_l ✗',
      pair: 'Preference Pair (w≻l)',
      dataset: 'Preference Dataset',
      pairs: '~10K-100K pairs',
      humanAnnotated: 'Human annotated',
      step2Title: 'Bradley-Terry Probability Modeling',
      step2Heading: 'Step 2: Bradley-Terry Model',
      formula: 'P(y_w ≻ y_l | x) = σ(r_φ(x, y_w) - r_φ(x, y_l))',
      formulaExplain: 'σ = sigmoid | r_φ = Reward Model scalar score output',
      intuition: 'Intuition:',
      delta: 'Δ = 2.1',
      probability: 'σ(2.1) = 89%',
      explanation: 'Larger score difference → Higher selection probability → Model is more "confident" this preference ranking is correct',
      step3Title: 'Ranking Loss Training',
      step3Heading: 'Step 3: Train Reward Model',
      lossFormula: 'L(φ) = -E[log σ(r_φ(x,y_w) - r_φ(x,y_l))]',
      lossExplain: 'Maximize probability that "winner scores higher than loser" → RM learns to rank',
      sftModel: 'SFT Model',
      initRM: '(Initialize RM)',
      rmTraining: 'RM Training',
      rankingLoss: 'ranking loss',
      rewardModel: 'Reward Model',
      scalarScore: 'r_φ(x, y) → scalar score',
      keyPoint: 'Key points:',
      keyText: 'RM is usually smaller than policy LLM | Outputs scalar score not text | Initialized from SFT model',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step1Heading}
          </text>

          {/* Data collection flow */}
          {[0, 1, 2].map(i => {
            const y = 45 + i * 50;
            return (
              <g key={i}>
                <rect x={30} y={y} width={80} height={32} rx={4} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
                <text x={70} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.primary}>{t.prompt} {i + 1}</text>

                <rect x={130} y={y} width={70} height={32} rx={4} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
                <text x={165} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.green}>{t.winner}</text>

                <rect x={210} y={y} width={70} height={32} rx={4} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
                <text x={245} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.red}>{t.loser}</text>

                <text x={300} y={y + 20} fontSize={12} fill={COLORS.mid}>→</text>

                <rect x={320} y={y} width={100} height={32} rx={4} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
                <text x={370} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.dark}>{t.pair}</text>
              </g>
            );
          })}

          <rect x={440} y={50} width={120} height={100} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={500} y={85} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.dataset}</text>
          <text x={500} y={103} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.pairs}</text>
          <text x={500} y={118} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.humanAnnotated}</text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step2Heading}
          </text>

          <rect x={30} y={40} width={520} height={55} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={W / 2} y={62} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
            {t.formula}
          </text>
          <text x={W / 2} y={82} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.formulaExplain}
          </text>

          {/* Intuition diagram */}
          <text x={100} y={118} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>{t.intuition}</text>

          <rect x={30} y={125} width={100} height={30} rx={4} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={80} y={144} textAnchor="middle" fontSize={10} fill={COLORS.green}>r(y_w) = 3.2</text>

          <text x={145} y={144} fontSize={14} fill={COLORS.mid}>-</text>

          <rect x={160} y={125} width={100} height={30} rx={4} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={210} y={144} textAnchor="middle" fontSize={10} fill={COLORS.red}>r(y_l) = 1.1</text>

          <text x={275} y={144} fontSize={14} fill={COLORS.mid}>→</text>

          <text x={320} y={144} fontSize={11} fill={COLORS.dark} fontFamily={FONTS.mono}>{t.delta}</text>
          <text x={390} y={144} fontSize={11} fill={COLORS.dark}>→</text>
          <text x={440} y={144} fontSize={11} fontWeight={600} fill={COLORS.green} fontFamily={FONTS.mono}>{t.probability}</text>

          <text x={W / 2} y={180} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.explanation}
          </text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step3Heading}
          </text>

          <rect x={30} y={40} width={520} height={50} rx={8} fill={COLORS.bgAlt} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={W / 2} y={60} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.orange} fontFamily={FONTS.mono}>
            {t.lossFormula}
          </text>
          <text x={W / 2} y={78} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.lossExplain}
          </text>

          {/* Training diagram */}
          <rect x={30} y={105} width={120} height={36} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={90} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.primary}>{t.sftModel}</text>
          <text x={90} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>{t.initRM}</text>

          <text x={165} y={127} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={180} y={105} width={120} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={240} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.rmTraining}</text>
          <text x={240} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>{t.rankingLoss}</text>

          <text x={315} y={127} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={330} y={105} width={120} height={36} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={390} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>{t.rewardModel}</text>
          <text x={390} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>{t.scalarScore}</text>

          <rect x={30} y={155} width={520} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={40} y={172} fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.keyPoint}</text>
          <text x={110} y={172} fontSize={10} fill={COLORS.mid}>
            {t.keyText}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
