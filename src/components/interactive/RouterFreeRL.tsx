import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const StepContent = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4">
    <h4 className="text-base font-semibold mb-3" style={{ color: COLORS.dark }}>{title}</h4>
    {children}
  </div>
);

export default function RouterFreeRL() {
  const steps = [
    {
      title: 'Step 1: 初始状态',
      content: (
        <StepContent title="本地模型尝试回答所有 query">
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>起点:</strong> 本地小模型（如 Llama-8B）尝试回答每一个 query
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>问题:</strong> 很多复杂 query 回答得不好，但模型不知道自己"不行"
            </p>
            <p className="text-sm" style={{ color: COLORS.mid }}>
              传统方案需要外部 router → Router-free RL 让模型自己学会判断
            </p>
          </div>
        </StepContent>
      ),
    },
    {
      title: 'Step 2: RL 训练信号',
      content: (
        <StepContent title="Reward = 回答质量 - 升级成本">
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>State:</strong> 当前 query 的特征（embedding）
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>Action:</strong> 自己回答 or 请求升级到云端
            </p>
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              <strong>Reward 设计:</strong>
            </p>
            <ul className="text-sm ml-4 list-disc" style={{ color: COLORS.dark }}>
              <li>自己回答且质量好 → +1（最优：不花钱且质量高）</li>
              <li>自己回答但质量差 → -1（最差：浪费时间且回答错误）</li>
              <li>请求升级 → +0.5 - cost（次优：质量保证但花了钱）</li>
            </ul>
          </div>
        </StepContent>
      ),
    },
    {
      title: 'Step 3: 策略学习',
      content: (
        <StepContent title="模型逐渐学会 &quot;我搞不定&quot;">
          <div className="bg-gray-50 p-3 rounded-lg border mb-3">
            <p className="text-sm mb-2" style={{ color: COLORS.dark }}>
              经过 RL 训练，本地模型内部形成了"难度评估能力"：
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-green-50 p-2 rounded border border-green-300">
                <p className="text-xs font-semibold" style={{ color: COLORS.green }}>学会自己回答的</p>
                <p className="text-xs" style={{ color: COLORS.dark }}>• 简单问答 • 翻译 • 知识查询</p>
              </div>
              <div className="bg-red-50 p-2 rounded border border-red-300">
                <p className="text-xs font-semibold" style={{ color: COLORS.red }}>学会请求升级的</p>
                <p className="text-xs" style={{ color: COLORS.dark }}>• 复杂推理 • 代码分析 • 多步数学</p>
              </div>
            </div>
            <p className="text-sm mt-2" style={{ color: COLORS.mid }}>
              关键: 无需外部 router，路由能力内化到模型自身
            </p>
          </div>
        </StepContent>
      ),
    },
    {
      title: 'Step 4: 推理部署',
      content: (
        <StepContent title="自主路由决策">
          <div className="bg-green-50 p-3 rounded-lg border border-green-300 mb-3">
            <p className="text-sm font-semibold mb-2" style={{ color: COLORS.green }}>
              ✓ 部署后无需额外组件
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              1. 收到 query → 本地模型先评估
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              2. 模型判断"我能搞定" → 直接回答（零额外成本）
            </p>
            <p className="text-sm mb-1" style={{ color: COLORS.dark }}>
              3. 模型判断"我搞不定" → 发送特殊 token 请求云端协助
            </p>
          </div>
          <p className="text-sm" style={{ color: COLORS.mid }}>
            优势: 无外部 router 延迟、路由决策与生成共用同一次前向传播、可离线部署
          </p>
        </StepContent>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
