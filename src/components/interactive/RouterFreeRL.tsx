import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const StepContent = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4">
    <h4 className="text-base font-semibold mb-3" style={{ color: COLORS.dark }}>{title}</h4>
    {children}
  </div>
);

export default function RouterFreeRL({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Step 1: 初始状态',
      step1ContentTitle: '本地模型尝试回答所有 query',
      step1Start: '起点:',
      step1StartDesc: '本地小模型（如 Llama-8B）尝试回答每一个 query',
      step1Problem: '问题:',
      step1ProblemDesc: '很多复杂 query 回答得不好，但模型不知道自己"不行"',
      step1Solution: '传统方案需要外部 router → Router-free RL 让模型自己学会判断',
      step2Title: 'Step 2: RL 训练信号',
      step2ContentTitle: 'Reward = 回答质量 - 升级成本',
      step2State: 'State:',
      step2StateDesc: '当前 query 的特征（embedding）',
      step2Action: 'Action:',
      step2ActionDesc: '自己回答 or 请求升级到云端',
      step2Reward: 'Reward 设计:',
      step2Reward1: '自己回答且质量好 → +1（最优：不花钱且质量高）',
      step2Reward2: '自己回答但质量差 → -1（最差：浪费时间且回答错误）',
      step2Reward3: '请求升级 → +0.5 - cost（次优：质量保证但花了钱）',
      step3Title: 'Step 3: 策略学习',
      step3ContentTitle: '模型逐渐学会 "我搞不定"',
      step3Intro: '经过 RL 训练，本地模型内部形成了"难度评估能力"：',
      step3CanHandle: '学会自己回答的',
      step3CanHandleItems: '• 简单问答 • 翻译 • 知识查询',
      step3NeedEscalate: '学会请求升级的',
      step3NeedEscalateItems: '• 复杂推理 • 代码分析 • 多步数学',
      step3Key: '关键: 无需外部 router，路由能力内化到模型自身',
      step4Title: 'Step 4: 推理部署',
      step4ContentTitle: '自主路由决策',
      step4Benefit: '✓ 部署后无需额外组件',
      step4Flow1: '1. 收到 query → 本地模型先评估',
      step4Flow2: '2. 模型判断"我能搞定" → 直接回答（零额外成本）',
      step4Flow3: '3. 模型判断"我搞不定" → 发送特殊 token 请求云端协助',
      step4Advantages: '优势: 无外部 router 延迟、路由决策与生成共用同一次前向传播、可离线部署',
    },
    en: {
      step1Title: 'Step 1: Initial State',
      step1ContentTitle: 'Local model tries to answer all queries',
      step1Start: 'Starting point:',
      step1StartDesc: 'Local small model (e.g., Llama-8B) attempts to answer every query',
      step1Problem: 'Problem:',
      step1ProblemDesc: 'Many complex queries are poorly answered, but the model doesn\'t know it "can\'t handle" them',
      step1Solution: 'Traditional approach requires external router → Router-free RL lets the model learn to judge itself',
      step2Title: 'Step 2: RL Training Signal',
      step2ContentTitle: 'Reward = Answer Quality - Escalation Cost',
      step2State: 'State:',
      step2StateDesc: 'Features of current query (embedding)',
      step2Action: 'Action:',
      step2ActionDesc: 'Answer locally or escalate to cloud',
      step2Reward: 'Reward Design:',
      step2Reward1: 'Answer locally with high quality → +1 (optimal: no cost & high quality)',
      step2Reward2: 'Answer locally with poor quality → -1 (worst: wasted time & wrong answer)',
      step2Reward3: 'Escalate to cloud → +0.5 - cost (suboptimal: guaranteed quality but costs money)',
      step3Title: 'Step 3: Policy Learning',
      step3ContentTitle: 'Model learns "I can\'t handle this"',
      step3Intro: 'Through RL training, the local model develops internal "difficulty assessment":',
      step3CanHandle: 'Learned to handle locally',
      step3CanHandleItems: '• Simple Q&A • Translation • Knowledge lookup',
      step3NeedEscalate: 'Learned to escalate',
      step3NeedEscalateItems: '• Complex reasoning • Code analysis • Multi-step math',
      step3Key: 'Key: No external router needed, routing capability internalized in model',
      step4Title: 'Step 4: Inference Deployment',
      step4ContentTitle: 'Autonomous Routing Decision',
      step4Benefit: '✓ No extra components after deployment',
      step4Flow1: '1. Receive query → Local model evaluates first',
      step4Flow2: '2. Model decides "I can handle" → Answer directly (zero extra cost)',
      step4Flow3: '3. Model decides "I can\'t handle" → Send special token to request cloud assistance',
      step4Advantages: 'Advantages: No external router latency, routing & generation share same forward pass, offline deployable',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <StepContent title={t.step1ContentTitle}>
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>{t.step1Start}</strong> {t.step1StartDesc}
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>{t.step1Problem}</strong> {t.step1ProblemDesc}
            </p>
            <p className="text-sm" style={{ color: COLORS.mid }}>
              {t.step1Solution}
            </p>
          </div>
        </StepContent>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <StepContent title={t.step2ContentTitle}>
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>{t.step2State}</strong> {t.step2StateDesc}
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>{t.step2Action}</strong> {t.step2ActionDesc}
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>{t.step2Reward}</strong>
            </p>
            <ul className="text-sm ml-4 list-disc" style={{ color: COLORS.dark }}>
              <li>{t.step2Reward1}</li>
              <li>{t.step2Reward2}</li>
              <li>{t.step2Reward3}</li>
            </ul>
          </div>
        </StepContent>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <StepContent title={t.step3ContentTitle}>
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              {t.step3Intro}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-green-50 p-2 rounded border border-green-300">
                <p className="text-xs font-semibold" style={{ color: COLORS.green }}>{t.step3CanHandle}</p>
                <p className="text-xs" style={{ color: COLORS.dark }}>{t.step3CanHandleItems}</p>
              </div>
              <div className="bg-red-50 p-2 rounded border border-red-300">
                <p className="text-xs font-semibold" style={{ color: COLORS.red }}>{t.step3NeedEscalate}</p>
                <p className="text-xs" style={{ color: COLORS.dark }}>{t.step3NeedEscalateItems}</p>
              </div>
            </div>
            <p className="text-sm mt-2" style={{ color: COLORS.mid }}>
              {t.step3Key}
            </p>
          </div>
        </StepContent>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <StepContent title={t.step4ContentTitle}>
          <div className="bg-green-50 p-3 rounded-lg border border-green-300 mb-3">
            <p className="text-sm font-semibold mb-2" style={{ color: COLORS.green }}>
              {t.step4Benefit}
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              {t.step4Flow1}
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              {t.step4Flow2}
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              {t.step4Flow3}
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            {t.step4Advantages}
          </p>
        </StepContent>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
