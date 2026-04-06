import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function DeepSeekR1Pipeline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Step 1: 少量高质量 CoT 数据冷启动',
      step1Label: '冷启动数据：',
      step1Desc: '少量 (prompt, long CoT answer) 对 → 教模型"思考的格式"（用 {\'<think>\'} 标签包裹推理过程）',
      step1Purpose: '目的：不是教模型"如何正确推理"，而是教模型"输出推理过程的格式"',
      step1Note: '实际的推理能力来自下一步的 RL 训练',
      step2Title: 'Step 2: GRPO + 规则 Reward → 涌现 Thinking',
      step2Training: 'GRPO 训练',
      step2Sampling: '组采样 + 相对 Advantage',
      step2Reward: 'Reward = 答案正确性（规则判断）',
      step2Output: 'R1-Zero',
      step2Behavior: '涌现行为：自我验证、回溯',
      step2Reasoning: '分步推理、反思重试',
      step2Discovery: '关键发现：',
      step2Insight: '没有人教模型"如何思考"，只给了正确性 reward → 模型自发涌现了复杂的推理策略！',
      step3Title: 'Step 3: 收集高质量 CoT → SFT 蒸馏',
      step3Generate: 'R1-Zero 生成',
      step3Rejection: 'Rejection',
      step3Sampling: 'Sampling',
      step3Quality: '高质量 CoT 数据',
      step3Filter: '只保留答案正确的 trajectory',
      step3Distill: '蒸馏过程：',
      step3Desc: '用 R1-Zero 的高质量 CoT 数据对更小的模型做 SFT → 让小模型也具备 thinking 能力',
      step4Title: 'Step 4: 最终 RL 精调 → DeepSeek-R1',
      step4Input: 'SFT 后的模型',
      step4Training: 'GRPO',
      step4Reward: '+ 多类型 reward',
      step4Output: 'DeepSeek-R1',
      step4Performance: '数学/代码 SOTA',
      step4Pipeline: '完整 Pipeline：',
      step4Full: '冷启动 → GRPO (涌现 thinking) → Rejection Sampling → SFT 蒸馏 → GRPO 精调 → R1',
      navColdStart: '冷启动数据',
      navGRPO: 'GRPO 训练 (R1-Zero)',
      navRejection: 'Rejection Sampling + SFT',
      navFinalRL: '最终 RL 精调 (R1)',
    },
    en: {
      step1Title: 'Step 1: Cold-start with small high-quality CoT data',
      step1Label: 'Cold-start data:',
      step1Desc: 'Small set of (prompt, long CoT answer) pairs → Teach model "thinking format" (wrap reasoning with {\'<think>\'} tags)',
      step1Purpose: 'Purpose: Not teaching "how to reason correctly", but teaching "how to output reasoning format"',
      step1Note: 'Actual reasoning capability comes from next RL training step',
      step2Title: 'Step 2: GRPO + Rule Reward → Emergent Thinking',
      step2Training: 'GRPO Training',
      step2Sampling: 'Group sampling + Relative Advantage',
      step2Reward: 'Reward = Answer correctness (rule-based)',
      step2Output: 'R1-Zero',
      step2Behavior: 'Emergent behavior: Self-verification, backtracking',
      step2Reasoning: 'Step-by-step reasoning, reflective retry',
      step2Discovery: 'Key finding:',
      step2Insight: 'No one taught the model "how to think", only gave correctness reward → Model spontaneously emerged complex reasoning strategies!',
      step3Title: 'Step 3: Collect high-quality CoT → SFT distillation',
      step3Generate: 'R1-Zero generation',
      step3Rejection: 'Rejection',
      step3Sampling: 'Sampling',
      step3Quality: 'High-quality CoT data',
      step3Filter: 'Keep only correct-answer trajectories',
      step3Distill: 'Distillation process:',
      step3Desc: 'Use R1-Zero high-quality CoT data to SFT smaller models → Give small models thinking capability',
      step4Title: 'Step 4: Final RL fine-tuning → DeepSeek-R1',
      step4Input: 'SFT model',
      step4Training: 'GRPO',
      step4Reward: '+ Multi-type reward',
      step4Output: 'DeepSeek-R1',
      step4Performance: 'Math/Code SOTA',
      step4Pipeline: 'Full Pipeline:',
      step4Full: 'Cold-start → GRPO (emergent thinking) → Rejection Sampling → SFT distillation → GRPO fine-tuning → R1',
      navColdStart: 'Cold-start data',
      navGRPO: 'GRPO Training (R1-Zero)',
      navRejection: 'Rejection Sampling + SFT',
      navFinalRL: 'Final RL fine-tuning (R1)',
    },
  }[locale];

  const steps = [
    {
      title: t.navColdStart,
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step1Title}
          </text>
          <rect x={30} y={40} width={520} height={40} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={40} y={58} fontSize={10} fontWeight={600} fill={COLORS.primary}>{t.step1Label}</text>
          <text x={40} y={72} fontSize={10} fill={COLORS.mid}>
            {t.step1Desc}
          </text>
          <rect x={30} y={95} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={115} fontSize={10} fill={COLORS.dark}>
            {t.step1Purpose}
          </text>
          <text x={40} y={133} fontSize={10} fill={COLORS.mid}>
            {t.step1Note}
          </text>
        </svg>
      ),
    },
    {
      title: t.navGRPO,
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step2Title}
          </text>
          <rect x={30} y={40} width={250} height={60} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={155} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.step2Training}</text>
          <text x={155} y={76} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.step2Sampling}</text>
          <text x={155} y={92} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.step2Reward}</text>

          <text x={295} y={70} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={310} y={40} width={240} height={60} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={430} y={58} textAnchor="middle" fontSize={10} fontWeight={700} fill={COLORS.green}>{t.step2Output}</text>
          <text x={430} y={76} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.step2Behavior}</text>
          <text x={430} y={92} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.step2Reasoning}</text>

          <rect x={30} y={110} width={520} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={40} y={128} fontSize={10} fontWeight={600} fill={COLORS.red}>{t.step2Discovery}</text>
          <text x={40} y={144} fontSize={10} fill={COLORS.dark}>
            {t.step2Insight}
          </text>
        </svg>
      ),
    },
    {
      title: t.navRejection,
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step3Title}
          </text>
          <rect x={30} y={40} width={160} height={45} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={110} y={66} textAnchor="middle" fontSize={10} fill={COLORS.dark}>{t.step3Generate}</text>

          <text x={200} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={210} y={40} width={130} height={45} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={275} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.step3Rejection}</text>
          <text x={275} y={74} textAnchor="middle" fontSize={10} fill={COLORS.orange}>{t.step3Sampling}</text>

          <text x={350} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={360} y={40} width={190} height={45} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={455} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>{t.step3Quality}</text>
          <text x={455} y={74} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.step3Filter}</text>

          <rect x={30} y={100} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.dark}>{t.step3Distill}</text>
          <text x={40} y={136} fontSize={10} fill={COLORS.mid}>
            {t.step3Desc}
          </text>
        </svg>
      ),
    },
    {
      title: t.navFinalRL,
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step4Title}
          </text>
          <rect x={30} y={40} width={160} height={45} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={110} y={66} textAnchor="middle" fontSize={10} fill={COLORS.dark}>{t.step4Input}</text>

          <text x={200} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={210} y={40} width={130} height={45} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={275} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.step4Training}</text>
          <text x={275} y={74} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.step4Reward}</text>

          <text x={350} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={360} y={40} width={190} height={45} rx={6} fill={COLORS.purple} stroke={COLORS.purple} strokeWidth={1.5} />
          <text x={455} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{t.step4Output}</text>
          <text x={455} y={74} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.8)">{t.step4Performance}</text>

          <rect x={30} y={100} width={520} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.purple}>{t.step4Pipeline}</text>
          <text x={40} y={136} fontSize={10} fill={COLORS.dark}>
            {t.step4Full}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
