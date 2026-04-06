import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const StepContent = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4">
    <h4 className="text-base font-semibold mb-3" style={{ color: COLORS.dark }}>{title}</h4>
    {children}
  </div>
);

export default function SelfVerificationDemo() {
  const steps = [
    {
      title: 'Step 1: 小模型生成回答',
      content: (
        <StepContent title="Llama-8B 生成初始回答">
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm font-mono mb-1" style={{ color: COLORS.mid }}>Query: "解释 RLHF 的三个阶段"</p>
            <p className="text-sm" style={{ color: COLORS.dark }}>
              Llama-8B 回答: "RLHF 包括三个阶段：1) 监督微调 (SFT)，在人类演示数据上训练；
              2) 奖励模型训练，学习人类偏好；3) PPO 优化，用奖励信号强化模型..."
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            成本: $0.0002/1K tokens · 用最便宜的模型先生成回答
          </p>
        </StepContent>
      ),
    },
    {
      title: 'Step 2: 自验证 (Few-shot)',
      content: (
        <StepContent title="模型自我评估回答质量">
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm font-mono mb-2" style={{ color: COLORS.mid }}>Few-shot self-verification prompt:</p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              "以下回答是否准确完整地回答了问题？"
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              [示例1: 好回答 → 评分 0.9]
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              [示例2: 差回答 → 评分 0.3]
            </p>
            <p className="text-sm font-semibold" style={{ color: COLORS.orange }}>
              自评分数: 0.65 (中等置信度)
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            关键: 用 few-shot 示例校准自评能力，避免模型盲目自信
          </p>
        </StepContent>
      ),
    },
    {
      title: 'Step 3: POMDP 信念更新',
      content: (
        <StepContent title="POMDP 框架决策">
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>观察:</strong> 自评分 = 0.65
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>信念更新:</strong> P(回答正确) = 0.65 → 低于阈值 0.75
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>动作空间:</strong> [接受, 升级到 Llama-70B, 升级到 GPT-4]
            </p>
            <p className="text-sm font-semibold" style={{ color: COLORS.red }}>
              决策: 升级到 Llama-70B (次强模型)
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            POMDP 考虑: 升级成本 vs 回答质量改善的期望收益
          </p>
        </StepContent>
      ),
    },
    {
      title: 'Step 4: 升级模型回答',
      content: (
        <StepContent title="Llama-70B 重新回答">
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              Llama-70B 回答: "RLHF (Reinforcement Learning from Human Feedback) 包含三个核心阶段:
              1) <strong>SFT</strong>: 在高质量人类演示上微调... (更详细、更准确)
              2) <strong>Reward Model</strong>: 使用 Bradley-Terry 模型学习偏好排序...
              3) <strong>PPO</strong>: 在 KL 约束下优化..."
            </p>
            <p className="text-sm font-semibold" style={{ color: COLORS.green }}>
              自评分数: 0.92 → 超过阈值 → 接受
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            总成本: Llama-8B ($0.0002) + Llama-70B ($0.005) = $0.0052 (vs GPT-4: $0.03)
          </p>
        </StepContent>
      ),
    },
    {
      title: 'Step 5: 结果总结',
      content: (
        <StepContent title="AutoMix 效果">
          <div className="bg-green-50 p-3 rounded-lg border border-green-300 mb-3">
            <p className="text-sm font-semibold mb-2" style={{ color: COLORS.green }}>✓ 成功节省成本</p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>• 最终用 Llama-70B 回答，质量满足要求</p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>• 成本 $0.0052 vs GPT-4 $0.03 → 节省 83%</p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>• AutoMix (NeurIPS 2024) 在五个数据集上平均 50%+ 成本降低</p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            核心思想: "不预判难度，让模型自己评估自己" — 比外部分类器更灵活
          </p>
        </StepContent>
      ),
    },
  ];

  return (
    <StepNavigator steps={steps} />
  );
}
