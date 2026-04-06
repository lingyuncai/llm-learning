import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const StepContent = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4">
    <h4 className="text-base font-semibold mb-3" style={{ color: COLORS.dark }}>{title}</h4>
    {children}
  </div>
);

export default function SelfVerificationDemo({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Step 1: 小模型生成回答',
      step1Header: 'Llama-8B 生成初始回答',
      step1Query: 'Query: "解释 RLHF 的三个阶段"',
      step1Answer: 'Llama-8B 回答: "RLHF 包括三个阶段：1) 监督微调 (SFT)，在人类演示数据上训练；2) 奖励模型训练，学习人类偏好；3) PPO 优化，用奖励信号强化模型..."',
      step1Cost: '成本: $0.0002/1K tokens · 用最便宜的模型先生成回答',
      step2Title: 'Step 2: 自验证 (Few-shot)',
      step2Header: '模型自我评估回答质量',
      step2Prompt: 'Few-shot self-verification prompt:',
      step2Question: '"以下回答是否准确完整地回答了问题？"',
      step2Example1: '[示例1: 好回答 → 评分 0.9]',
      step2Example2: '[示例2: 差回答 → 评分 0.3]',
      step2Score: '自评分数: 0.65 (中等置信度)',
      step2Key: '关键: 用 few-shot 示例校准自评能力，避免模型盲目自信',
      step3Title: 'Step 3: POMDP 信念更新',
      step3Header: 'POMDP 框架决策',
      step3Observation: '观察:',
      step3ObservationVal: '自评分 = 0.65',
      step3Belief: '信念更新:',
      step3BeliefVal: 'P(回答正确) = 0.65 → 低于阈值 0.75',
      step3Actions: '动作空间:',
      step3ActionsVal: '[接受, 升级到 Llama-70B, 升级到 GPT-4]',
      step3Decision: '决策:',
      step3DecisionVal: '升级到 Llama-70B (次强模型)',
      step3Note: 'POMDP 考虑: 升级成本 vs 回答质量改善的期望收益',
      step4Title: 'Step 4: 升级模型回答',
      step4Header: 'Llama-70B 重新回答',
      step4Answer: 'Llama-70B 回答: "RLHF (Reinforcement Learning from Human Feedback) 包含三个核心阶段: 1) SFT: 在高质量人类演示上微调... (更详细、更准确) 2) Reward Model: 使用 Bradley-Terry 模型学习偏好排序... 3) PPO: 在 KL 约束下优化..."',
      step4Score: '自评分数: 0.92 → 超过阈值 → 接受',
      step4Cost: '总成本: Llama-8B ($0.0002) + Llama-70B ($0.005) = $0.0052 (vs GPT-4: $0.03)',
      step5Title: 'Step 5: 结果总结',
      step5Header: 'AutoMix 效果',
      step5Success: '✓ 成功节省成本',
      step5Point1: '• 最终用 Llama-70B 回答，质量满足要求',
      step5Point2: '• 成本 $0.0052 vs GPT-4 $0.03 → 节省 83%',
      step5Point3: '• AutoMix (NeurIPS 2024) 在五个数据集上平均 50%+ 成本降低',
      step5Key: '核心思想: "不预判难度，让模型自己评估自己" — 比外部分类器更灵活',
    },
    en: {
      step1Title: 'Step 1: Small Model Generates Answer',
      step1Header: 'Llama-8B generates initial answer',
      step1Query: 'Query: "Explain the three stages of RLHF"',
      step1Answer: 'Llama-8B answer: "RLHF includes three stages: 1) Supervised Fine-Tuning (SFT) on human demonstrations; 2) Reward model training to learn human preferences; 3) PPO optimization using reward signals..."',
      step1Cost: 'Cost: $0.0002/1K tokens · Use cheapest model to generate first',
      step2Title: 'Step 2: Self-Verification (Few-shot)',
      step2Header: 'Model self-evaluates answer quality',
      step2Prompt: 'Few-shot self-verification prompt:',
      step2Question: '"Does the answer accurately and completely answer the question?"',
      step2Example1: '[Example 1: Good answer → Score 0.9]',
      step2Example2: '[Example 2: Poor answer → Score 0.3]',
      step2Score: 'Self-score: 0.65 (medium confidence)',
      step2Key: 'Key: Use few-shot examples to calibrate self-evaluation, avoid overconfidence',
      step3Title: 'Step 3: POMDP Belief Update',
      step3Header: 'POMDP Framework Decision',
      step3Observation: 'Observation:',
      step3ObservationVal: 'Self-score = 0.65',
      step3Belief: 'Belief update:',
      step3BeliefVal: 'P(answer correct) = 0.65 → below threshold 0.75',
      step3Actions: 'Action space:',
      step3ActionsVal: '[Accept, Upgrade to Llama-70B, Upgrade to GPT-4]',
      step3Decision: 'Decision:',
      step3DecisionVal: 'Upgrade to Llama-70B (2nd strongest)',
      step3Note: 'POMDP considers: Upgrade cost vs expected quality improvement',
      step4Title: 'Step 4: Upgraded Model Answers',
      step4Header: 'Llama-70B re-answers',
      step4Answer: 'Llama-70B answer: "RLHF (Reinforcement Learning from Human Feedback) has three core stages: 1) SFT: Fine-tune on high-quality human demonstrations... (more detailed & accurate) 2) Reward Model: Learn preference ranking using Bradley-Terry model... 3) PPO: Optimize under KL constraint..."',
      step4Score: 'Self-score: 0.92 → exceeds threshold → Accept',
      step4Cost: 'Total cost: Llama-8B ($0.0002) + Llama-70B ($0.005) = $0.0052 (vs GPT-4: $0.03)',
      step5Title: 'Step 5: Results Summary',
      step5Header: 'AutoMix Performance',
      step5Success: '✓ Successfully saved cost',
      step5Point1: '• Final answer from Llama-70B meets quality requirements',
      step5Point2: '• Cost $0.0052 vs GPT-4 $0.03 → 83% savings',
      step5Point3: '• AutoMix (NeurIPS 2024) achieves 50%+ cost reduction on 5 datasets',
      step5Key: 'Core idea: "Don\'t prejudge difficulty, let model evaluate itself" — more flexible than external classifiers',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <StepContent title={t.step1Header}>
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm font-mono mb-1" style={{ color: COLORS.mid }}>{t.step1Query}</p>
            <p className="text-sm" style={{ color: COLORS.dark }}>
              {t.step1Answer}
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            {t.step1Cost}
          </p>
        </StepContent>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <StepContent title={t.step2Header}>
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm font-mono mb-2" style={{ color: COLORS.mid }}>{t.step2Prompt}</p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              {t.step2Question}
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              {t.step2Example1}
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              {t.step2Example2}
            </p>
            <p className="text-sm font-semibold" style={{ color: COLORS.orange }}>
              {t.step2Score}
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            {t.step2Key}
          </p>
        </StepContent>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <StepContent title={t.step3Header}>
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>{t.step3Observation}</strong> {t.step3ObservationVal}
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>{t.step3Belief}</strong> {t.step3BeliefVal}
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>{t.step3Actions}</strong> {t.step3ActionsVal}
            </p>
            <p className="text-sm font-semibold" style={{ color: COLORS.red }}>
              {t.step3Decision} {t.step3DecisionVal}
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            {t.step3Note}
          </p>
        </StepContent>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <StepContent title={t.step4Header}>
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              {t.step4Answer}
            </p>
            <p className="text-sm font-semibold" style={{ color: COLORS.green }}>
              {t.step4Score}
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            {t.step4Cost}
          </p>
        </StepContent>
      ),
    },
    {
      title: t.step5Title,
      content: (
        <StepContent title={t.step5Header}>
          <div className="bg-green-50 p-3 rounded-lg border border-green-300 mb-3">
            <p className="text-sm font-semibold mb-2" style={{ color: COLORS.green }}>{t.step5Success}</p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>{t.step5Point1}</p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>{t.step5Point2}</p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>{t.step5Point3}</p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            {t.step5Key}
          </p>
        </StepContent>
      ),
    },
  ];

  return (
    <StepNavigator steps={steps} />
  );
}
