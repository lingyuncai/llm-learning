import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function ConstitutionalAIFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Step 1: 人类定义宪法原则',
      principle1: '原则 1: 回答应该是有帮助的、诚实的、无害的',
      principle2: '原则 2: 不要帮助用户做危险或非法的事情',
      principle3: '原则 3: 承认不确定性，不要编造事实',
      principle4: '原则 4: 尊重用户隐私和个人信息',
      step1Note: '人类只需要定义高层原则，不需要逐条标注偏好对',
      step2Title: 'Step 2: LLM 根据原则评判自己的回答',
      originalAnswer: '原始回答：',
      dangerousExample: '"这里是如何制作炸弹的步骤..."',
      critiqueLabel: 'Critique：',
      critiqueExample: '"违反原则 2：帮助危险行为"',
      keyPoint: '关键：LLM 自己当评判者',
      keyDescription: '给 LLM 原则 + 自己的回答 → 让它判断是否违反原则 → 自动生成"critique"',
      step3Title: 'Step 3: LLM 根据 critique 修改回答',
      harmfulAnswer: '原始回答 (有害)',
      safeAnswer: '修改后回答 (安全)',
      outputLabel: '产出：',
      outputDesc1: '(原始回答, 修改后回答) 构成偏好对 → 可以用来训练 RM 或直接做 DPO',
      outputDesc2: '这就是 RLAIF (RL from AI Feedback) — AI 替代人类做标注',
      step4Title: 'Step 4: Constitutional AI 的意义',
      rlhfTitle: 'RLHF',
      rlhfSource: '标注来源：人类标注者',
      rlhfCost: '成本：高（需要大量人工）',
      rlhfScale: '可扩展性：有限',
      rlaifTitle: 'RLAIF (Constitutional AI)',
      rlaifSource: '标注来源：LLM 自身',
      rlaifCost: '成本：低（自动化）',
      rlaifScale: '可扩展性：高',
      coreIdea: '核心思路：用少量人类定义的原则 + LLM 的判断能力 → 大规模自动生成对齐数据',
      anthropicNote: 'Anthropic (Claude) 使用 Constitutional AI 作为其对齐策略的核心',
      stepTitle1: '人类写 Principles',
      stepTitle2: 'LLM 自我评判 (Critique)',
      stepTitle3: '生成改进版本 (Revision)',
      stepTitle4: 'RLAIF vs RLHF 对比',
    },
    en: {
      step1Title: 'Step 1: Define Constitutional Principles',
      principle1: 'Principle 1: Responses should be helpful, honest, and harmless',
      principle2: 'Principle 2: Do not help users with dangerous or illegal activities',
      principle3: 'Principle 3: Acknowledge uncertainty and avoid fabricating facts',
      principle4: 'Principle 4: Respect user privacy and personal information',
      step1Note: 'Humans only need to define high-level principles, not annotate preference pairs',
      step2Title: 'Step 2: LLM Critiques Its Own Response',
      originalAnswer: 'Original Response:',
      dangerousExample: '"Here are the steps to make a bomb..."',
      critiqueLabel: 'Critique:',
      critiqueExample: '"Violates Principle 2: Assists dangerous behavior"',
      keyPoint: 'Key: LLM as Self-Critic',
      keyDescription: 'Give LLM principles + its response → It judges violations → Auto-generates "critique"',
      step3Title: 'Step 3: LLM Revises Based on Critique',
      harmfulAnswer: 'Original (Harmful)',
      safeAnswer: 'Revised (Safe)',
      outputLabel: 'Output:',
      outputDesc1: '(Original, Revised) forms preference pair → Can train RM or use for DPO',
      outputDesc2: 'This is RLAIF (RL from AI Feedback) — AI replaces human annotation',
      step4Title: 'Step 4: Significance of Constitutional AI',
      rlhfTitle: 'RLHF',
      rlhfSource: 'Annotation Source: Human annotators',
      rlhfCost: 'Cost: High (requires extensive labor)',
      rlhfScale: 'Scalability: Limited',
      rlaifTitle: 'RLAIF (Constitutional AI)',
      rlaifSource: 'Annotation Source: LLM itself',
      rlaifCost: 'Cost: Low (automated)',
      rlaifScale: 'Scalability: High',
      coreIdea: 'Core Idea: Few human-defined principles + LLM judgment → Large-scale automated alignment data',
      anthropicNote: 'Anthropic (Claude) uses Constitutional AI as core alignment strategy',
      stepTitle1: 'Write Principles',
      stepTitle2: 'LLM Self-Critique',
      stepTitle3: 'Generate Revision',
      stepTitle4: 'RLAIF vs RLHF',
    },
  }[locale];
  const steps = [
    {
      title: t.stepTitle1,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step1Title}
          </text>
          {[
            t.principle1,
            t.principle2,
            t.principle3,
            t.principle4,
          ].map((p, i) => (
            <g key={i}>
              <rect x={40} y={35 + i * 32} width={500} height={26} rx={4} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
              <text x={50} y={52 + i * 32} fontSize={10} fill={COLORS.primary}>{p}</text>
            </g>
          ))}
          <text x={W / 2} y={170} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.step1Note}
          </text>
        </svg>
      ),
    },
    {
      title: t.stepTitle2,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step2Title}
          </text>
          <rect x={30} y={40} width={240} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={58} fontSize={10} fontWeight={600} fill={COLORS.dark}>{t.originalAnswer}</text>
          <text x={40} y={76} fontSize={10} fill={COLORS.mid}>{t.dangerousExample}</text>

          <line x1={275} y1={65} x2={310} y2={65} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowCAI)" />
          <defs>
            <marker id="arrowCAI" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.orange} />
            </marker>
          </defs>

          <rect x={315} y={40} width={240} height={50} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1.5} />
          <text x={325} y={58} fontSize={10} fontWeight={600} fill={COLORS.red}>{t.critiqueLabel}</text>
          <text x={325} y={76} fontSize={10} fill={COLORS.dark}>{t.critiqueExample}</text>

          <rect x={30} y={110} width={520} height={55} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={40} y={128} fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.keyPoint}</text>
          <text x={40} y={146} fontSize={10} fill={COLORS.mid}>
            {t.keyDescription}
          </text>
        </svg>
      ),
    },
    {
      title: t.stepTitle3,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step3Title}
          </text>
          <rect x={30} y={40} width={160} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={110} y={64} textAnchor="middle" fontSize={10} fill={COLORS.red}>{t.harmfulAnswer}</text>

          <text x={200} y={64} fontSize={12} fill={COLORS.mid}>+</text>

          <rect x={215} y={40} width={120} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={275} y={64} textAnchor="middle" fontSize={10} fill={COLORS.orange}>Critique</text>

          <line x1={340} y1={60} x2={385} y2={60} stroke={COLORS.green} strokeWidth={2} markerEnd="url(#arrowCAI)" />

          <rect x={390} y={40} width={160} height={40} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={470} y={64} textAnchor="middle" fontSize={10} fill={COLORS.green}>{t.safeAnswer}</text>

          <rect x={30} y={100} width={520} height={60} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.dark}>{t.outputLabel}</text>
          <text x={40} y={138} fontSize={10} fill={COLORS.mid}>
            {t.outputDesc1}
          </text>
          <text x={40} y={154} fontSize={10} fill={COLORS.mid}>
            {t.outputDesc2}
          </text>
        </svg>
      ),
    },
    {
      title: t.stepTitle4,
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step4Title}
          </text>

          <rect x={30} y={40} width={250} height={80} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={155} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.primary}>{t.rlhfTitle}</text>
          <text x={40} y={78} fontSize={10} fill={COLORS.mid}>{t.rlhfSource}</text>
          <text x={40} y={94} fontSize={10} fill={COLORS.mid}>{t.rlhfCost}</text>
          <text x={40} y={110} fontSize={10} fill={COLORS.mid}>{t.rlhfScale}</text>

          <rect x={300} y={40} width={250} height={80} rx={8} fill={COLORS.highlight} stroke={COLORS.green} strokeWidth={1} />
          <text x={425} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.green}>{t.rlaifTitle}</text>
          <text x={310} y={78} fontSize={10} fill={COLORS.mid}>{t.rlaifSource}</text>
          <text x={310} y={94} fontSize={10} fill={COLORS.mid}>{t.rlaifCost}</text>
          <text x={310} y={110} fontSize={10} fill={COLORS.mid}>{t.rlaifScale}</text>

          <rect x={30} y={135} width={520} height={36} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={152} fontSize={10} fontWeight={600} fill={COLORS.orange}>
            {t.coreIdea}
          </text>
          <text x={40} y={166} fontSize={10} fill={COLORS.mid}>
            {t.anthropicNote}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
