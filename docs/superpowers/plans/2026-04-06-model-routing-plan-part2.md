# Model Routing 学习路径实现计划 — Part 2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现第3篇（级联与自验证，5 组件）和第4篇（Hybrid LLM，6 组件）文章。

**Design reference:** `docs/superpowers/specs/2026-04-06-model-routing-design.md`

---

## Phase 3: 第3篇文章（5 个组件）

### Task 11: CascadeChainFlow + SelfVerificationDemo 组件

**Files:**
- Create: `src/components/interactive/CascadeChainFlow.tsx`
- Create: `src/components/interactive/SelfVerificationDemo.tsx`

- [ ] **Step 1: 创建 CascadeChainFlow**

级联链动画，展示 query 从 Model1 → Model2 → Model3 的逐级升级过程。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface CascadeStep {
  model: string;
  cost: string;
  quality: string;
  color: string;
}

const CHAIN: CascadeStep[] = [
  { model: 'Llama-8B', cost: '$0.0002/1K', quality: '60%', color: COLORS.green },
  { model: 'Llama-70B', cost: '$0.005/1K', quality: '82%', color: COLORS.orange },
  { model: 'GPT-4o', cost: '$0.03/1K', quality: '95%', color: COLORS.red },
];

const QUERIES = [
  { text: '"1+1等于几"', stopAt: 0, score: 0.95, reason: '简单数学，Llama-8B 置信度高' },
  { text: '"解释 transformer attention"', stopAt: 1, score: 0.82, reason: '中等难度，Llama-70B 能力足够' },
  { text: '"证明 P≠NP 的可能路径"', stopAt: 2, score: 0.45, reason: '极难问题，需要最强模型' },
];

export default function CascadeChainFlow() {
  const [queryIdx, setQueryIdx] = useState(0);

  const W = 580, H = 380;
  const q = QUERIES[queryIdx];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          FrugalGPT 级联链
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          先试便宜模型，质量不够再升级
        </text>

        {/* Query selector */}
        <g transform="translate(30, 55)">
          {QUERIES.map((qu, i) => (
            <g key={i} transform={`translate(${i * 180}, 0)`}
               onClick={() => setQueryIdx(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="170" height="26" rx="4"
                    fill={queryIdx === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="85" y="17" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="10" fill={queryIdx === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {qu.text}
              </text>
            </g>
          ))}
        </g>

        {/* Cascade chain */}
        {CHAIN.map((step, i) => {
          const x = 50 + i * 180;
          const y = 110;
          const isActive = i <= q.stopAt;
          const isStop = i === q.stopAt;

          return (
            <g key={i}>
              {/* Model box */}
              <rect x={x} y={y} width="140" height="70" rx="6"
                    fill={isActive ? step.color : COLORS.light}
                    opacity={isActive ? 0.15 : 0.3}
                    stroke={isActive ? step.color : COLORS.mid}
                    strokeWidth={isStop ? 3 : 1.5} />
              <text x={x + 70} y={y + 22} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="13" fontWeight="700"
                    fill={isActive ? step.color : COLORS.mid}>
                {step.model}
              </text>
              <text x={x + 70} y={y + 40} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10"
                    fill={isActive ? COLORS.dark : COLORS.mid}>
                {step.cost} · 质量 {step.quality}
              </text>
              {isStop && (
                <text x={x + 70} y={y + 58} textAnchor="middle"
                      fontFamily={FONTS.sans} fontSize="10" fontWeight="700" fill={step.color}>
                  ✓ 在此停止
                </text>
              )}
              {!isStop && isActive && (
                <text x={x + 70} y={y + 58} textAnchor="middle"
                      fontFamily={FONTS.sans} fontSize="10" fill={COLORS.red}>
                  ✗ 置信度不足，升级
                </text>
              )}

              {/* Arrow */}
              {i < CHAIN.length - 1 && (
                <text x={x + 150} y={y + 35} fontFamily={FONTS.sans} fontSize="20"
                      fill={i < q.stopAt ? COLORS.red : COLORS.light}>
                  →
                </text>
              )}
            </g>
          );
        })}

        {/* Scoring function explanation */}
        <g transform="translate(30, 200)">
          <rect x="0" y="0" width="520" height="55" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            Scoring Function 判断
          </text>
          <text x="15" y="40" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {`Score = ${q.score.toFixed(2)} ${q.score > 0.7 ? '> 0.7 → 接受当前回答' : '< 0.7 → 升级到下一级模型'}`}
          </text>
        </g>

        {/* Result summary */}
        <g transform="translate(30, 270)">
          <rect x="0" y="0" width="520" height="90" rx="6"
                fill={COLORS.valid} stroke={COLORS.green} strokeWidth="2" />
          <text x="20" y="25" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.dark}>
            结果：{q.text}
          </text>
          <text x="20" y="48" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            停止模型: {CHAIN[q.stopAt].model} · 实际成本: {CHAIN[q.stopAt].cost}
          </text>
          <text x="20" y="68" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
            {q.reason}
          </text>
          <text x="20" y="84" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.green}>
            vs 始终用 GPT-4: 成本节省 {q.stopAt === 0 ? '99.3%' : q.stopAt === 1 ? '83%' : '0%'}
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 SelfVerificationDemo**

Step navigator 组件，展示 AutoMix 自验证过程。

```tsx
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
```

- [ ] **Step 3: 提交**

```bash
git add src/components/interactive/CascadeChainFlow.tsx src/components/interactive/SelfVerificationDemo.tsx
git commit -m "feat: add CascadeChainFlow and SelfVerificationDemo components"
```

---

### Task 12: ConfidenceThresholdSlider + POMDPDecisionTree + LLMAsJudgeFlow 组件

**Files:**
- Create: `src/components/interactive/ConfidenceThresholdSlider.tsx`
- Create: `src/components/interactive/POMDPDecisionTree.tsx`
- Create: `src/components/interactive/LLMAsJudgeFlow.tsx`

- [ ] **Step 1: 创建 ConfidenceThresholdSlider**

滑块交互组件，调整阈值实时看成本和质量 tradeoff 曲线。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// Simulated data: at each threshold, what's the cost and quality
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i * 5); // 0, 5, 10, ..., 100
const QUALITY = [100, 99, 98, 97, 96, 95, 94, 92, 90, 87, 83, 80, 76, 72, 68, 63, 58, 52, 45, 38, 30];
const COST = [100, 95, 88, 80, 72, 63, 55, 48, 40, 34, 28, 23, 19, 16, 13, 11, 9, 7, 6, 5, 4];
// % queries sent to strong model
const STRONG_PCT = [100, 92, 84, 75, 67, 58, 50, 42, 35, 28, 22, 17, 13, 10, 8, 6, 5, 4, 3, 2, 1];

export default function ConfidenceThresholdSlider() {
  const [thresholdIdx, setThresholdIdx] = useState(10); // default 50%

  const W = 580, H = 380;
  const chartL = 60, chartR = 530, chartT = 70, chartB = 250;
  const chartW = chartR - chartL, chartH = chartB - chartT;

  const getX = (idx: number) => chartL + (idx / 20) * chartW;
  const getYQ = (val: number) => chartB - (val / 100) * chartH;
  const getYC = (val: number) => chartB - (val / 100) * chartH;

  const qualityPath = QUALITY.map((v, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getYQ(v)}`).join(' ');
  const costPath = COST.map((v, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getYC(v)}`).join(' ');

  const t = THRESHOLDS[thresholdIdx];
  const q = QUALITY[thresholdIdx];
  const c = COST[thresholdIdx];
  const s = STRONG_PCT[thresholdIdx];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          置信度阈值 Tradeoff
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="11" fill={COLORS.mid}>
          阈值 τ = {t}% — 自评分 {'>'} τ 则接受，否则升级
        </text>

        {/* Axes */}
        <line x1={chartL} y1={chartB} x2={chartR} y2={chartB} stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={chartL} y1={chartT} x2={chartL} y2={chartB} stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={W / 2} y={chartB + 28} textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
          置信度阈值 (%)
        </text>

        {/* Grid */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <text x={chartL - 8} y={getYQ(v) + 4} textAnchor="end" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>{v}</text>
            <line x1={chartL} y1={getYQ(v)} x2={chartR} y2={getYQ(v)} stroke={COLORS.light} strokeWidth="0.5" />
          </g>
        ))}
        {[0, 25, 50, 75, 100].map(v => (
          <text key={`x-${v}`} x={getX(v / 5)} y={chartB + 15} textAnchor="middle"
                fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>{v}</text>
        ))}

        {/* Quality curve */}
        <path d={qualityPath} fill="none" stroke={COLORS.green} strokeWidth="2.5" />
        <text x={chartR + 5} y={getYQ(QUALITY[20]) + 4} fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.green}>质量</text>

        {/* Cost curve */}
        <path d={costPath} fill="none" stroke={COLORS.red} strokeWidth="2.5" />
        <text x={chartR + 5} y={getYC(COST[20]) + 4} fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.red}>成本</text>

        {/* Current threshold indicator */}
        <line x1={getX(thresholdIdx)} y1={chartT} x2={getX(thresholdIdx)} y2={chartB}
              stroke={COLORS.primary} strokeWidth="2" strokeDasharray="6,4" />
        <circle cx={getX(thresholdIdx)} cy={getYQ(q)} r="6" fill={COLORS.green} stroke="#fff" strokeWidth="2" />
        <circle cx={getX(thresholdIdx)} cy={getYC(c)} r="6" fill={COLORS.red} stroke="#fff" strokeWidth="2" />

        {/* Summary box */}
        <g transform="translate(40, 275)">
          <rect x="0" y="0" width="500" height="80" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="20" y="22" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            阈值 τ = {t}%
          </text>
          <text x="20" y="42" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green}>
            质量保持: {q}% of GPT-4 · 成本: 相当于 GPT-4 的 {c}%
          </text>
          <text x="20" y="60" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {s}% 的 query 被发送到强模型 · {100 - s}% 由弱模型直接回答
          </text>
          <text x="20" y="75" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
            {t < 30 ? '⚠️ 阈值太低：大多数 query 升级，成本接近 GPT-4' :
             t > 70 ? '⚠️ 阈值太高：多数 query 不升级，质量可能下降' :
             '✓ 平衡区间：合理的成本-质量 tradeoff'}
          </text>
        </g>
      </svg>

      {/* Slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">低阈值 (质量优先)</span>
        <input type="range" min="0" max="20" value={thresholdIdx}
               onChange={e => setThresholdIdx(Number(e.target.value))}
               className="w-48 accent-blue-700" />
        <span className="text-sm text-gray-500">高阈值 (成本优先)</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 POMDPDecisionTree**

决策树组件，展示 AutoMix POMDP 的状态转移过程。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type NodeType = 'state' | 'observation' | 'action';

interface TreeNode {
  id: string;
  type: NodeType;
  label: string;
  detail: string;
  x: number;
  y: number;
  children?: string[];
}

const NODES: TreeNode[] = [
  { id: 's0', type: 'state', label: '初始状态', detail: '收到 query，选择最小模型', x: 290, y: 30 },
  { id: 'a1', type: 'action', label: '调用 Model-S', detail: '小模型生成回答', x: 290, y: 90 },
  { id: 'o1', type: 'observation', label: '自评分 = 0.65', detail: 'Few-shot 自验证', x: 290, y: 150 },
  { id: 's1-accept', type: 'state', label: '接受回答', detail: 'score > τ → 输出', x: 120, y: 220 },
  { id: 's1-upgrade', type: 'state', label: '信念: 需升级', detail: 'score < τ → 选下一级', x: 430, y: 220 },
  { id: 'a2', type: 'action', label: '调用 Model-M', detail: '中等模型重新回答', x: 430, y: 280 },
  { id: 'o2', type: 'observation', label: '自评分 = 0.92', detail: '第二轮验证', x: 430, y: 340 },
  { id: 's2-accept', type: 'state', label: '接受回答', detail: 'score > τ → 输出', x: 310, y: 400 },
  { id: 's2-upgrade', type: 'state', label: '继续升级', detail: '→ Model-L', x: 530, y: 400 },
];

const EDGES: [string, string, string][] = [
  ['s0', 'a1', ''],
  ['a1', 'o1', '生成 + 自评'],
  ['o1', 's1-accept', 'score > τ'],
  ['o1', 's1-upgrade', 'score < τ'],
  ['s1-upgrade', 'a2', ''],
  ['a2', 'o2', '生成 + 自评'],
  ['o2', 's2-accept', 'score > τ'],
  ['o2', 's2-upgrade', 'score < τ'],
];

const TYPE_COLORS: Record<NodeType, string> = {
  state: COLORS.primary,
  observation: COLORS.orange,
  action: COLORS.green,
};
const TYPE_SHAPES: Record<NodeType, string> = {
  state: '状态',
  observation: '观察',
  action: '动作',
};

export default function POMDPDecisionTree() {
  const [selected, setSelected] = useState<string | null>(null);

  const W = 580, H = 480;

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="20" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="14" fontWeight="600" fill={COLORS.dark}>
          AutoMix POMDP 决策过程
        </text>

        {/* Edges */}
        {EDGES.map(([from, to, label], i) => {
          const f = nodeMap[from], t = nodeMap[to];
          const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
          return (
            <g key={i}>
              <line x1={f.x} y1={f.y + 18} x2={t.x} y2={t.y - 12}
                    stroke={COLORS.mid} strokeWidth="1.5"
                    markerEnd="url(#arrow-pomdp)" />
              {label && (
                <text x={mx + 5} y={my} fontFamily={FONTS.sans}
                      fontSize="9" fill={COLORS.mid}>{label}</text>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="arrow-pomdp" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Nodes */}
        {NODES.map(n => {
          const isSelected = selected === n.id;
          const color = TYPE_COLORS[n.type];
          return (
            <g key={n.id} onClick={() => setSelected(isSelected ? null : n.id)}
               style={{ cursor: 'pointer' }}>
              <rect x={n.x - 55} y={n.y - 12} width="110" height="24" rx={n.type === 'observation' ? 12 : 4}
                    fill={isSelected ? color : COLORS.bgAlt}
                    stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
              <text x={n.x} y={n.y + 4} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10" fontWeight="600"
                    fill={isSelected ? '#fff' : color}
                    style={{ pointerEvents: 'none' }}>
                {n.label}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(30, 435)">
          {Object.entries(TYPE_SHAPES).map(([type, label], i) => (
            <g key={type} transform={`translate(${i * 100}, 0)`}>
              <rect x="0" y="0" width="14" height="14" rx={type === 'observation' ? 7 : 2}
                    fill={TYPE_COLORS[type as NodeType]} />
              <text x="20" y="11" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{label}</text>
            </g>
          ))}
          {/* Selected detail */}
          {selected && (
            <text x="320" y="11" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
              {nodeMap[selected]?.detail}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: 创建 LLMAsJudgeFlow**

流程对比组件，展示自验证 vs LLM-as-Judge vs 人工评估三种方式。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Method = 'self' | 'judge' | 'human';

const METHODS: { id: Method; label: string; cost: string; latency: string; accuracy: string; detail: string }[] = [
  { id: 'self', label: '自验证', cost: '极低 (~$0)', latency: '~50ms', accuracy: '中等', detail: '模型评估自己的回答。便宜快速，但可能"盲目自信"。AutoMix 用 few-shot 校准缓解此问题。' },
  { id: 'judge', label: 'LLM-as-Judge', cost: '中等 ($0.01-0.03)', latency: '~500ms', accuracy: '高', detail: '用另一个 LLM 评估。更客观，但引入额外成本和延迟。Confidence-Driven Router (2025) 结合不确定性估计。' },
  { id: 'human', label: '人工评估', cost: '极高 ($0.5-2)', latency: '分钟级', accuracy: '最高', detail: '人类专家评估。金标准，但无法用于实时路由。通常用于离线校准 router。' },
];

export default function LLMAsJudgeFlow() {
  const [active, setActive] = useState<Method>('self');

  const W = 580, H = 320;
  const m = METHODS.find(m => m.id === active)!;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          三种回答质量评估方式
        </text>

        {/* Method tabs */}
        <g transform="translate(115, 42)">
          {METHODS.map((me, i) => (
            <g key={me.id}>
              <rect x={i * 125} y="0" width="115" height="28" rx="4"
                    fill={active === me.id ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setActive(me.id)} />
              <text x={i * 125 + 57.5} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={active === me.id ? "700" : "400"}
                    fill={active === me.id ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {me.label}
              </text>
            </g>
          ))}
        </g>

        {/* Flow diagram */}
        <g transform="translate(30, 85)">
          {/* Query → Model → Answer */}
          <rect x="0" y="0" width="90" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="45" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Query</text>

          <text x="95" y="25" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

          <rect x="110" y="0" width="100" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
          <text x="160" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Model 生成</text>

          <text x="215" y="25" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

          <rect x="230" y="0" width="90" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="275" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Answer</text>

          <text x="325" y="25" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

          {/* Evaluator */}
          <rect x="340" y="0" width="110" height="40" rx="4"
                fill={active === 'self' ? COLORS.valid : active === 'judge' ? '#fef3c7' : '#fee2e2'}
                stroke={active === 'self' ? COLORS.green : active === 'judge' ? COLORS.orange : COLORS.red}
                strokeWidth="2" />
          <text x="395" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11"
                fontWeight="600" fill={COLORS.dark}>
            {active === 'self' ? '自我评估' : active === 'judge' ? 'Judge LLM' : '人类专家'}
          </text>

          <text x="455" y="25" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

          <rect x="470" y="0" width="50" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="495" y="25" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>Score</text>
        </g>

        {/* Metrics */}
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="520" height="60" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="90" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            成本: {m.cost}
          </text>
          <text x="260" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            延迟: {m.latency}
          </text>
          <text x="430" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            准确度: {m.accuracy}
          </text>

          {/* Bar comparison */}
          {(() => {
            const costs = { self: 2, judge: 40, human: 100 };
            const lats = { self: 10, judge: 50, human: 100 };
            const accs = { self: 60, judge: 85, human: 100 };
            return (
              <>
                <rect x="40" y="32" width={costs[active] * 1.2} height="8" rx="2" fill={COLORS.red} />
                <rect x="210" y="32" width={lats[active] * 1.2} height="8" rx="2" fill={COLORS.orange} />
                <rect x="380" y="32" width={accs[active] * 1.2} height="8" rx="2" fill={COLORS.green} />
              </>
            );
          })()}
        </g>

        {/* Detail */}
        <g transform="translate(30, 225)">
          <rect x="0" y="0" width="520" height="72" rx="6"
                fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.primary}>
            {m.label}
          </text>
          <text x="15" y="42" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {m.detail.length > 75 ? m.detail.slice(0, 75) : m.detail}
          </text>
          {m.detail.length > 75 && (
            <text x="15" y="60" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {m.detail.slice(75)}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add src/components/interactive/ConfidenceThresholdSlider.tsx src/components/interactive/POMDPDecisionTree.tsx src/components/interactive/LLMAsJudgeFlow.tsx
git commit -m "feat: add ConfidenceThresholdSlider, POMDPDecisionTree, LLMAsJudgeFlow components"
```

---

### Task 13: 第3篇文章 MDX — cascade-self-verification

**Files:**
- Create: `src/content/articles/zh/cascade-self-verification.mdx`

- [ ] **Step 1: 创建文章文件**

frontmatter:
```yaml
---
title: "级联与自验证：先试便宜的，不行再升级"
slug: cascade-self-verification
locale: zh
tags: [model-routing, cascade, self-verification, pomdp, frugalgpt, automix]
difficulty: advanced
prerequisites: [model-routing-landscape]
created: "2026-04-06"
updated: "2026-04-06"
references:
  - type: paper
    title: "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance"
    url: "https://arxiv.org/abs/2305.05176"
  - type: paper
    title: "AutoMix: Automatically Mixing Language Models"
    url: "https://arxiv.org/abs/2310.12963"
  - type: paper
    title: "Confidence-Driven LLM Router"
    url: "https://arxiv.org/abs/2502.11021"
---
```

imports:
```mdx
import CascadeChainFlow from '../../../components/interactive/CascadeChainFlow.tsx';
import SelfVerificationDemo from '../../../components/interactive/SelfVerificationDemo.tsx';
import ConfidenceThresholdSlider from '../../../components/interactive/ConfidenceThresholdSlider.tsx';
import POMDPDecisionTree from '../../../components/interactive/POMDPDecisionTree.tsx';
import LLMAsJudgeFlow from '../../../components/interactive/LLMAsJudgeFlow.tsx';
```

**内容骨架**（按设计文档 §1-§4）：
- §1 FrugalGPT 级联链 + `<CascadeChainFlow client:visible />`
- §2 AutoMix 自验证 + `<SelfVerificationDemo client:visible />` + `<POMDPDecisionTree client:visible />`
- §3 置信度阈值 tradeoff + `<ConfidenceThresholdSlider client:visible />`
- §4 LLM-as-Judge + `<LLMAsJudgeFlow client:visible />`

- [ ] **Step 2: 验证 + 提交**

```bash
npm run validate
git add src/content/articles/zh/cascade-self-verification.mdx
git commit -m "feat: add Article 3 - Cascade and self-verification"
```

---

## Phase 4: 第4篇文章（6 个组件）— Hybrid LLM

### Task 14: CapabilityMatchDiagram + LatencyTradeoffAnalysis 组件

**Files:**
- Create: `src/components/interactive/CapabilityMatchDiagram.tsx`
- Create: `src/components/interactive/LatencyTradeoffAnalysis.tsx`

- [ ] **Step 1: 创建 CapabilityMatchDiagram**

核心图组件，展示 query 复杂度 vs 模型能力，超出边界才升级。**能力匹配是第一驱动因素**。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface QueryExample {
  label: string;
  complexity: number; // 0-100
  category: string;
}

const QUERIES: QueryExample[] = [
  { label: '日常问候', complexity: 10, category: '简单' },
  { label: '翻译短句', complexity: 20, category: '简单' },
  { label: '知识问答', complexity: 35, category: '中等' },
  { label: '代码补全', complexity: 50, category: '中等' },
  { label: '逻辑推理', complexity: 65, category: '较难' },
  { label: '多步数学', complexity: 75, category: '较难' },
  { label: '复杂分析', complexity: 85, category: '困难' },
  { label: '创意写作', complexity: 45, category: '中等' },
];

export default function CapabilityMatchDiagram() {
  const [localCapability, setLocalCapability] = useState(55);
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 580, H = 420;
  const barL = 120, barR = 520, barW = barR - barL;
  const barTop = 80;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          能力匹配：第一驱动因素
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="11" fill={COLORS.mid}>
          本地模型能力 = {localCapability}% — 超出能力边界的 query 必须上云端
        </text>

        {/* Capability boundary */}
        {(() => {
          const bx = barL + (localCapability / 100) * barW;
          return (
            <>
              {/* Local zone */}
              <rect x={barL} y={barTop - 5} width={bx - barL} height={QUERIES.length * 36 + 10}
                    fill={COLORS.valid} opacity="0.3" rx="4" />
              <text x={(barL + bx) / 2} y={barTop - 12} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.green}>
                🟢 本地模型能力范围
              </text>

              {/* Cloud zone */}
              <rect x={bx} y={barTop - 5} width={barR - bx} height={QUERIES.length * 36 + 10}
                    fill={COLORS.waste} opacity="0.2" rx="4" />
              <text x={(bx + barR) / 2} y={barTop - 12} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.red}>
                🔴 需要云端模型
              </text>

              {/* Boundary line */}
              <line x1={bx} y1={barTop - 20} x2={bx} y2={barTop + QUERIES.length * 36 + 5}
                    stroke={COLORS.dark} strokeWidth="2.5" strokeDasharray="8,4" />
              <text x={bx} y={barTop + QUERIES.length * 36 + 22} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10" fontWeight="700" fill={COLORS.dark}>
                能力边界 ({localCapability}%)
              </text>
            </>
          );
        })()}

        {/* Query bars */}
        {QUERIES.map((q, i) => {
          const y = barTop + i * 36;
          const w = (q.complexity / 100) * barW;
          const isLocal = q.complexity <= localCapability;
          const isHov = hovered === i;

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              <text x={barL - 5} y={y + 20} textAnchor="end"
                    fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {q.label}
              </text>
              <rect x={barL} y={y + 5} width={barW} height="24" rx="3"
                    fill={COLORS.light} />
              <rect x={barL} y={y + 5} width={w} height="24" rx="3"
                    fill={isLocal ? COLORS.green : COLORS.red}
                    opacity={isHov ? 1 : 0.7} />
              <text x={barL + w + 6} y={y + 22}
                    fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
                {q.complexity}% {isLocal ? '→ 本地' : '→ 云端'}
              </text>
            </g>
          );
        })}

        {/* Key insight box */}
        <g transform="translate(40, 370)">
          <rect x="0" y="0" width="500" height="38" rx="4"
                fill="#fef3c7" stroke={COLORS.orange} strokeWidth="2" />
          <text x="250" y="16" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="12" fontWeight="700" fill={COLORS.dark}>
            ⚠️ 核心原则：能力匹配是第一驱动因素
          </text>
          <text x="250" y="32" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="10" fill={COLORS.dark}>
            如果本地模型搞不定，再便宜、再隐私也没用 — 成本/隐私/延迟只是能力满足后的附加偏好
          </text>
        </g>
      </svg>

      {/* Slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">本地模型能力:</span>
        <input type="range" min="10" max="90" value={localCapability}
               onChange={e => setLocalCapability(Number(e.target.value))}
               className="w-48 accent-blue-700" />
        <span className="text-sm font-mono text-gray-600">{localCapability}%</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 LatencyTradeoffAnalysis**

多因素交互组件，展示延迟 tradeoff 的复杂性。**打破"本地=低延迟"误区**。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

export default function LatencyTradeoffAnalysis() {
  const [queryComplexity, setQueryComplexity] = useState(50); // tokens to generate
  const [localHardware, setLocalHardware] = useState(50); // 0=weak CPU, 100=M4 Max
  const [networkLatency, setNetworkLatency] = useState(30); // ms round trip
  const [cloudLoad, setCloudLoad] = useState(20); // 0=idle, 100=overloaded

  // Calculate latencies
  // Local: no network, but slower compute
  const localTPS = 5 + (localHardware / 100) * 45; // 5-50 tokens/sec
  const localPrefill = 50 + (100 - localHardware) * 2; // prefill ms
  const localGenerate = (queryComplexity * 3) / localTPS * 1000; // generation ms
  const localTotal = localPrefill + localGenerate;

  // Cloud: network overhead, but fast compute
  const cloudTPS = 80; // A100/H100 always fast
  const cloudPrefill = 20; // fast GPU
  const cloudNetwork = networkLatency * 2; // round trip
  const cloudQueue = cloudLoad * 5; // queuing delay
  const cloudGenerate = (queryComplexity * 3) / cloudTPS * 1000;
  const cloudTotal = cloudNetwork + cloudQueue + cloudPrefill + cloudGenerate;

  const maxLatency = Math.max(localTotal, cloudTotal, 500);
  const winner = localTotal < cloudTotal ? 'local' : 'cloud';

  const W = 580, H = 440;
  const barL = 130, barR = 520, barW = barR - barL;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          延迟 Tradeoff 分析
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="11" fill={COLORS.mid}>
          ⚠️ 本地 ≠ 低延迟 — 总延迟取决于多个因素
        </text>

        {/* Local breakdown */}
        <g transform="translate(0, 60)">
          <text x="20" y="15" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.green}>
            本地 ({Math.round(localTotal)}ms)
          </text>

          {/* Stacked bar */}
          <rect x={barL} y="2" width={barW} height="24" rx="3" fill={COLORS.light} />
          <rect x={barL} y="2" width={Math.min((localPrefill / maxLatency) * barW, barW)} height="24" rx="3" fill="#81c784" />
          <rect x={barL + (localPrefill / maxLatency) * barW} y="2"
                width={Math.min((localGenerate / maxLatency) * barW, barW - (localPrefill / maxLatency) * barW)} height="24" rx="3" fill="#4caf50" />

          <text x={barL + 5} y="18" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>
            Prefill {Math.round(localPrefill)}ms
          </text>
          <text x={barL + (localPrefill / maxLatency) * barW + 5} y="18"
                fontFamily={FONTS.mono} fontSize="9" fill="#fff">
            Generate {Math.round(localGenerate)}ms ({localTPS.toFixed(0)} tok/s)
          </text>

          <text x={barL} y="42" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            ✓ 零网络延迟 · ✗ 消费级硬件 prefill 慢、生成慢
          </text>
        </g>

        {/* Cloud breakdown */}
        <g transform="translate(0, 120)">
          <text x="20" y="15" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.primary}>
            云端 ({Math.round(cloudTotal)}ms)
          </text>

          <rect x={barL} y="2" width={barW} height="24" rx="3" fill={COLORS.light} />
          {/* Network */}
          <rect x={barL} y="2" width={(cloudNetwork / maxLatency) * barW} height="24" rx="3" fill="#e57373" />
          {/* Queue */}
          <rect x={barL + (cloudNetwork / maxLatency) * barW} y="2"
                width={(cloudQueue / maxLatency) * barW} height="24" rx="3" fill="#ef9a9a" />
          {/* Prefill */}
          <rect x={barL + ((cloudNetwork + cloudQueue) / maxLatency) * barW} y="2"
                width={(cloudPrefill / maxLatency) * barW} height="24" rx="3" fill="#64b5f6" />
          {/* Generate */}
          <rect x={barL + ((cloudNetwork + cloudQueue + cloudPrefill) / maxLatency) * barW} y="2"
                width={(cloudGenerate / maxLatency) * barW} height="24" rx="3" fill="#42a5f5" />

          <text x={barL + 3} y="18" fontFamily={FONTS.mono} fontSize="8" fill="#fff">
            Net {Math.round(cloudNetwork)}ms
          </text>
          <text x={barL + ((cloudNetwork + cloudQueue + cloudPrefill) / maxLatency) * barW + 3} y="18"
                fontFamily={FONTS.mono} fontSize="8" fill="#fff">
            Gen {Math.round(cloudGenerate)}ms ({cloudTPS} tok/s)
          </text>

          <text x={barL} y="42" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            ✗ 网络往返 + 排队 · ✓ A100/H100 快速计算
          </text>
        </g>

        {/* Winner */}
        <g transform="translate(40, 185)">
          <rect x="0" y="0" width="500" height="32" rx="4"
                fill={winner === 'local' ? COLORS.valid : '#dbeafe'}
                stroke={winner === 'local' ? COLORS.green : COLORS.primary} strokeWidth="2" />
          <text x="250" y="21" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="13" fontWeight="700"
                fill={winner === 'local' ? COLORS.green : COLORS.primary}>
            {winner === 'local'
              ? `🟢 本地更快 (${Math.round(localTotal)}ms vs ${Math.round(cloudTotal)}ms)`
              : `🔵 云端更快 (${Math.round(cloudTotal)}ms vs ${Math.round(localTotal)}ms)`}
          </text>
        </g>

        {/* Insight */}
        <g transform="translate(40, 228)">
          <rect x="0" y="0" width="500" height="52" rx="4"
                fill="#fef3c7" stroke={COLORS.orange} strokeWidth="1.5" />
          <text x="15" y="18" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            关键洞察
          </text>
          <text x="15" y="36" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            简短 query + 强本地硬件 → 本地可能更快。长生成 + 弱硬件 → 云端大概率更快。
          </text>
          <text x="15" y="48" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            延迟路由需要实时估算两端总延迟，不能简单假设"本地更快"。
          </text>
        </g>
      </svg>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-24">Query 复杂度:</span>
          <input type="range" min="5" max="100" value={queryComplexity}
                 onChange={e => setQueryComplexity(Number(e.target.value))}
                 className="flex-1 accent-blue-700" />
          <span className="font-mono text-gray-500 w-16">{queryComplexity * 3} tok</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-24">本地硬件:</span>
          <input type="range" min="0" max="100" value={localHardware}
                 onChange={e => setLocalHardware(Number(e.target.value))}
                 className="flex-1 accent-green-700" />
          <span className="font-mono text-gray-500 w-16">{localTPS.toFixed(0)} t/s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-24">网络延迟:</span>
          <input type="range" min="5" max="200" value={networkLatency}
                 onChange={e => setNetworkLatency(Number(e.target.value))}
                 className="flex-1 accent-red-700" />
          <span className="font-mono text-gray-500 w-16">{networkLatency}ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-24">云端负载:</span>
          <input type="range" min="0" max="100" value={cloudLoad}
                 onChange={e => setCloudLoad(Number(e.target.value))}
                 className="flex-1 accent-orange-700" />
          <span className="font-mono text-gray-500 w-16">{cloudLoad}%</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/interactive/CapabilityMatchDiagram.tsx src/components/interactive/LatencyTradeoffAnalysis.tsx
git commit -m "feat: add CapabilityMatchDiagram and LatencyTradeoffAnalysis components"
```

---

### Task 15: PrivacyRoutingFlow + RouterFreeRL 组件

**Files:**
- Create: `src/components/interactive/PrivacyRoutingFlow.tsx`
- Create: `src/components/interactive/RouterFreeRL.tsx`

- [ ] **Step 1: 创建 PrivacyRoutingFlow**

流程图组件，展示 PRISM 实体级敏感度检测 → 路由决策 → 差分隐私。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const EXAMPLES = [
  {
    query: '我的社保号码是 xxx-xx-xxxx，帮我查余额',
    entities: [{ text: 'xxx-xx-xxxx', type: 'SSN', sensitivity: 'high' }],
    route: 'local',
    reason: '包含高敏感 PII (SSN)，必须留在本地',
  },
  {
    query: '北京今天天气怎么样',
    entities: [{ text: '北京', type: '地点', sensitivity: 'low' }],
    route: 'cloud',
    reason: '无敏感信息，可安全上云获取更好回答',
  },
  {
    query: '我在 Acme Corp 的工资是多少',
    entities: [
      { text: 'Acme Corp', type: '公司', sensitivity: 'medium' },
      { text: '工资', type: '财务', sensitivity: 'high' },
    ],
    route: 'local-dp',
    reason: '含中/高敏感信息，本地处理 + 差分隐私保护',
  },
];

export default function PrivacyRoutingFlow() {
  const [exIdx, setExIdx] = useState(0);
  const ex = EXAMPLES[exIdx];

  const W = 580, H = 380;

  const routeColors = { local: COLORS.green, cloud: COLORS.primary, 'local-dp': COLORS.orange };
  const routeLabels = { local: '🔒 本地处理', cloud: '☁️ 云端处理', 'local-dp': '🔒+DP 本地+差分隐私' };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          PRISM: 隐私敏感度路由
        </text>

        {/* Example selector */}
        <g transform="translate(30, 40)">
          {EXAMPLES.map((e, i) => (
            <g key={i} transform={`translate(${i * 185}, 0)`}
               onClick={() => setExIdx(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="175" height="28" rx="4"
                    fill={exIdx === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="87.5" y="18" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={exIdx === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {e.query.length > 22 ? e.query.slice(0, 22) + '…' : e.query}
              </text>
            </g>
          ))}
        </g>

        {/* Flow: Query → Entity Detection → Sensitivity Score → Route Decision */}
        <g transform="translate(20, 85)">
          {/* Step 1: Query */}
          <rect x="0" y="0" width="120" height="45" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="60" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>Query</text>
          <text x="60" y="35" textAnchor="middle" fontFamily={FONTS.sans} fontSize="8" fill={COLORS.mid}>
            {ex.query.length > 18 ? ex.query.slice(0, 18) + '…' : ex.query}
          </text>

          <text x="125" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

          {/* Step 2: Entity Detection */}
          <rect x="140" y="0" width="120" height="45" rx="4" fill={COLORS.bgAlt} stroke={COLORS.orange} strokeWidth="1.5" />
          <text x="200" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>实体检测</text>
          <text x="200" y="35" textAnchor="middle" fontFamily={FONTS.mono} fontSize="8" fill={COLORS.orange}>
            {ex.entities.length} 个实体
          </text>

          <text x="265" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

          {/* Step 3: Sensitivity Scoring */}
          <rect x="280" y="0" width="120" height="45" rx="4" fill={COLORS.bgAlt} stroke={COLORS.red} strokeWidth="1.5" />
          <text x="340" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>敏感度评分</text>
          <text x="340" y="35" textAnchor="middle" fontFamily={FONTS.mono} fontSize="8" fill={COLORS.red}>
            max: {ex.entities.reduce((a, e) => e.sensitivity === 'high' ? 'high' : a, ex.entities[0].sensitivity)}
          </text>

          <text x="405" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

          {/* Step 4: Route Decision */}
          <rect x="420" y="0" width="120" height="45" rx="4"
                fill={routeColors[ex.route as keyof typeof routeColors]} opacity="0.15"
                stroke={routeColors[ex.route as keyof typeof routeColors]} strokeWidth="2" />
          <text x="480" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="700"
                fill={routeColors[ex.route as keyof typeof routeColors]}>
            {routeLabels[ex.route as keyof typeof routeLabels]}
          </text>
        </g>

        {/* Entity details */}
        <g transform="translate(30, 150)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            检测到的实体:
          </text>
          {ex.entities.map((ent, i) => {
            const sensColor = ent.sensitivity === 'high' ? COLORS.red : ent.sensitivity === 'medium' ? COLORS.orange : COLORS.green;
            return (
              <g key={i} transform={`translate(${i * 200}, 10)`}>
                <rect x="0" y="0" width="185" height="35" rx="4"
                      fill={sensColor} opacity="0.1" stroke={sensColor} strokeWidth="1" />
                <text x="10" y="15" fontFamily={FONTS.mono} fontSize="10" fontWeight="600" fill={sensColor}>
                  {ent.text}
                </text>
                <text x="10" y="28" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.dark}>
                  类型: {ent.type} · 敏感度: {ent.sensitivity}
                </text>
              </g>
            );
          })}
        </g>

        {/* Route explanation */}
        <g transform="translate(30, 210)">
          <rect x="0" y="0" width="520" height="48" rx="6"
                fill={routeColors[ex.route as keyof typeof routeColors]} opacity="0.1"
                stroke={routeColors[ex.route as keyof typeof routeColors]} strokeWidth="2" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="700"
                fill={routeColors[ex.route as keyof typeof routeColors]}>
            路由决策: {routeLabels[ex.route as keyof typeof routeLabels]}
          </text>
          <text x="15" y="38" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {ex.reason}
          </text>
        </g>

        {/* PRISM info */}
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="520" height="85" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            PRISM (AAAI 2026) 核心机制
          </text>
          <text x="15" y="38" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            1. 实体级敏感度检测 — 不是整个 query 判断，而是精确到每个实体
          </text>
          <text x="15" y="54" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            2. 自适应差分隐私 — 对必须上云的敏感数据添加 ε-DP 噪声保护
          </text>
          <text x="15" y="70" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            3. 离线场景自动降级 — 断网时本地模型是唯一选择
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 RouterFreeRL**

动画组件，展示本地模型通过 RL 自学"我搞不定"的过程。

```tsx
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
```

- [ ] **Step 3: 提交**

```bash
git add src/components/interactive/PrivacyRoutingFlow.tsx src/components/interactive/RouterFreeRL.tsx
git commit -m "feat: add PrivacyRoutingFlow and RouterFreeRL components"
```

---

### Task 16: HybridArchCompare + MultiObjectiveRadar 组件

**Files:**
- Create: `src/components/interactive/HybridArchCompare.tsx`
- Create: `src/components/interactive/MultiObjectiveRadar.tsx`

- [ ] **Step 1: 创建 HybridArchCompare**

并排对比组件，展示 ConsRoute / HybridFlow / Apple Intelligence 三种架构。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Arch = 'consroute' | 'hybridflow' | 'apple';

const ARCHS: { id: Arch; name: string; year: string; approach: string; granularity: string; keyFeature: string; result: string; color: string }[] = [
  {
    id: 'consroute', name: 'ConsRoute', year: '2026',
    approach: 'Reranker 评估语义一致性',
    granularity: 'Query-level',
    keyFeature: '用 reranker 判断本地回答是否与 query 一致，不一致则升级到 cloud',
    result: '40% 延迟+成本降低，cloud-edge-device 三级路由',
    color: COLORS.green,
  },
  {
    id: 'hybridflow', name: 'HybridFlow', year: '2025',
    approach: 'Subtask-level DAG 路由',
    granularity: 'Subtask-level',
    keyFeature: '将复杂任务拆解为 DAG，每个子任务独立决定 local/cloud',
    result: '适合多步 agent 任务，每步独立路由',
    color: COLORS.primary,
  },
  {
    id: 'apple', name: 'Apple Intelligence', year: '2024',
    approach: 'On-device 默认 + Private Cloud Compute',
    granularity: 'Query-level',
    keyFeature: '小模型 on-device 优先，超出能力走 PCC（苹果自有安全云）',
    result: '产品化标杆：10 亿+ 设备部署，隐私保证',
    color: COLORS.orange,
  },
];

export default function HybridArchCompare() {
  const [active, setActive] = useState<Arch>('consroute');

  const W = 580, H = 380;
  const a = ARCHS.find(a => a.id === active)!;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Hybrid LLM 架构对比
        </text>

        {/* Tabs */}
        <g transform="translate(95, 38)">
          {ARCHS.map((ar, i) => (
            <g key={ar.id}>
              <rect x={i * 140} y="0" width="130" height="28" rx="4"
                    fill={active === ar.id ? ar.color : COLORS.bgAlt}
                    stroke={ar.color} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setActive(ar.id)} />
              <text x={i * 140 + 65} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={active === ar.id ? "700" : "400"}
                    fill={active === ar.id ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {ar.name} ({ar.year})
              </text>
            </g>
          ))}
        </g>

        {/* Architecture flow */}
        <g transform="translate(30, 80)">
          {/* Common: Query → Router/Evaluator → Local or Cloud */}
          <rect x="0" y="10" width="80" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="40" y="35" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Query</text>

          <text x="85" y="35" fontFamily={FONTS.sans} fontSize="16" fill={a.color}>→</text>

          <rect x="100" y="0" width="130" height="60" rx="6"
                fill={a.color} opacity="0.12" stroke={a.color} strokeWidth="2" />
          <text x="165" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={a.color}>
            {a.id === 'consroute' ? 'Reranker' : a.id === 'hybridflow' ? 'DAG Planner' : 'On-device Model'}
          </text>
          <text x="165" y="42" textAnchor="middle" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            {a.approach}
          </text>

          {/* Split */}
          <line x1="235" y1="20" x2="280" y2="0" stroke={COLORS.green} strokeWidth="1.5" />
          <line x1="235" y1="40" x2="280" y2="60" stroke={COLORS.red} strokeWidth="1.5" />

          {/* Local */}
          <rect x="280" y="-10" width="100" height="35" rx="4"
                fill={COLORS.valid} stroke={COLORS.green} strokeWidth="1.5" />
          <text x="330" y="12" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.green}>
            🟢 本地模型
          </text>

          {/* Cloud */}
          <rect x="280" y="40" width="100" height="35" rx="4"
                fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1.5" />
          <text x="330" y="62" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.red}>
            🔴 云端模型
          </text>

          <text x="385" y="12" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.green}>→</text>
          <text x="385" y="62" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.red}>→</text>

          <rect x="400" y="15" width="100" height="35" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="450" y="38" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Response</text>
        </g>

        {/* Detail card */}
        <g transform="translate(30, 165)">
          <rect x="0" y="0" width="520" height="190" rx="6"
                fill={COLORS.bgAlt} stroke={a.color} strokeWidth="1.5" />

          <text x="20" y="25" fontFamily={FONTS.sans} fontSize="14" fontWeight="700" fill={a.color}>
            {a.name} ({a.year})
          </text>

          <text x="20" y="50" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            <tspan fontWeight="600">路由粒度:</tspan> {a.granularity}
          </text>
          <text x="20" y="72" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            <tspan fontWeight="600">核心机制:</tspan>
          </text>
          <text x="20" y="90" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {a.keyFeature.length > 65 ? a.keyFeature.slice(0, 65) : a.keyFeature}
          </text>
          {a.keyFeature.length > 65 && (
            <text x="20" y="106" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {a.keyFeature.slice(65)}
            </text>
          )}

          <text x="20" y="130" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            <tspan fontWeight="600">效果:</tspan> {a.result}
          </text>

          {/* Unique features */}
          <text x="20" y="155" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>
            特色:
          </text>
          <text x="20" y="172" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {a.id === 'consroute' ? '三级路由: device → edge → cloud · 语义一致性评分无需标注数据'
            : a.id === 'hybridflow' ? 'DAG 拓扑自动规划 · 子任务级别精确路由 · 适合复杂 agent 工作流'
            : '10 亿+ 部署 · Private Cloud Compute 硬件安全 · 端到端加密 · 第三方审计'}
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 MultiObjectiveRadar**

雷达图组件，展示成本/延迟/隐私/质量/离线五维对比。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Approach {
  name: string;
  scores: number[]; // [cost, latency, privacy, quality, offline] 0-100
  color: string;
}

const DIMS = ['低成本', '低延迟', '隐私保护', '回答质量', '离线可用'];

const APPROACHES: Approach[] = [
  { name: '纯本地', scores: [95, 60, 100, 50, 100], color: COLORS.green },
  { name: '纯云端', scores: [20, 70, 20, 95, 0], color: COLORS.red },
  { name: 'ConsRoute', scores: [75, 70, 70, 85, 60], color: COLORS.primary },
  { name: 'Apple Intelligence', scores: [80, 75, 95, 80, 70], color: COLORS.orange },
];

export default function MultiObjectiveRadar() {
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2]));

  const W = 580, H = 420;
  const cx = 240, cy = 200, R = 140;

  const toggle = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getPoint = (dimIdx: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * dimIdx) / DIMS.length - Math.PI / 2;
    const r = (value / 100) * R;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          多目标雷达图
        </text>

        {/* Grid circles */}
        {[20, 40, 60, 80, 100].map(v => (
          <circle key={v} cx={cx} cy={cy} r={(v / 100) * R}
                  fill="none" stroke={COLORS.light} strokeWidth="1" />
        ))}

        {/* Axis lines and labels */}
        {DIMS.map((dim, i) => {
          const [x, y] = getPoint(i, 100);
          const [lx, ly] = getPoint(i, 115);
          return (
            <g key={dim}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={COLORS.mid} strokeWidth="0.5" />
              <text x={lx} y={ly + 4} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
                {dim}
              </text>
            </g>
          );
        })}

        {/* Approach polygons */}
        {APPROACHES.map((a, ai) => {
          if (!selected.has(ai)) return null;
          const points = DIMS.map((_, di) => getPoint(di, a.scores[di]).join(',')).join(' ');
          return (
            <g key={a.name}>
              <polygon points={points}
                       fill={a.color} fillOpacity="0.12"
                       stroke={a.color} strokeWidth="2" />
              {/* Dots */}
              {DIMS.map((_, di) => {
                const [x, y] = getPoint(di, a.scores[di]);
                return <circle key={di} cx={x} cy={y} r="4" fill={a.color} stroke="#fff" strokeWidth="1.5" />;
              })}
            </g>
          );
        })}

        {/* Toggle buttons */}
        <g transform="translate(420, 80)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            方案选择:
          </text>
          {APPROACHES.map((a, i) => (
            <g key={a.name} transform={`translate(0, ${10 + i * 32})`}
               onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="140" height="26" rx="4"
                    fill={selected.has(i) ? a.color : COLORS.bgAlt}
                    opacity={selected.has(i) ? 0.15 : 1}
                    stroke={a.color} strokeWidth={selected.has(i) ? 2 : 1} />
              <circle cx="14" cy="13" r="5" fill={selected.has(i) ? a.color : COLORS.light} />
              <text x="26" y="17" fontFamily={FONTS.sans} fontSize="10"
                    fill={COLORS.dark} style={{ pointerEvents: 'none' }}>
                {a.name}
              </text>
            </g>
          ))}

          {/* Score table for selected */}
          <g transform="translate(0, 150)">
            <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>
              评分 (0-100)
            </text>
            {Array.from(selected).map((ai, si) => (
              <text key={ai} x="0" y={16 + si * 14} fontFamily={FONTS.mono} fontSize="9" fill={APPROACHES[ai].color}>
                {APPROACHES[ai].name}: {APPROACHES[ai].scores.join(' / ')}
              </text>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/interactive/HybridArchCompare.tsx src/components/interactive/MultiObjectiveRadar.tsx
git commit -m "feat: add HybridArchCompare and MultiObjectiveRadar components"
```

---

### Task 17: 第4篇文章 MDX — hybrid-local-cloud

**Files:**
- Create: `src/content/articles/zh/hybrid-local-cloud.mdx`

- [ ] **Step 1: 创建文章文件**

**这是用户最重视的一篇。** 按设计文档内容骨架，特别强调：
1. 能力匹配是第一驱动因素
2. 延迟 tradeoff 的复杂性

frontmatter:
```yaml
---
title: "Hybrid LLM：本地与云端的智能路由"
slug: hybrid-local-cloud
locale: zh
tags: [model-routing, hybrid-llm, local-cloud, privacy, latency]
difficulty: advanced
prerequisites: [model-routing-landscape, routing-classifiers, cascade-self-verification]
created: "2026-04-06"
updated: "2026-04-06"
references:
  - type: paper
    title: "ConsRoute: Consistency-Driven LLM Routing for Cloud-Edge-Device"
    url: "https://arxiv.org/abs/2603.21237"
  - type: paper
    title: "HybridFlow: Subtask-level DAG Routing"
    url: "https://arxiv.org/abs/2512.22137"
  - type: paper
    title: "PRISM: Privacy-Sensitive Entity-Level LLM Routing"
    url: "https://arxiv.org/abs/2511.22788"
  - type: paper
    title: "Router-free RL for Local-Cloud Routing"
    url: "https://arxiv.org/abs/2509.24050"
---
```

imports:
```mdx
import CapabilityMatchDiagram from '../../../components/interactive/CapabilityMatchDiagram.tsx';
import LatencyTradeoffAnalysis from '../../../components/interactive/LatencyTradeoffAnalysis.tsx';
import PrivacyRoutingFlow from '../../../components/interactive/PrivacyRoutingFlow.tsx';
import RouterFreeRL from '../../../components/interactive/RouterFreeRL.tsx';
import HybridArchCompare from '../../../components/interactive/HybridArchCompare.tsx';
import MultiObjectiveRadar from '../../../components/interactive/MultiObjectiveRadar.tsx';
```

**内容骨架**（按设计文档 §1-§5）：
- §1 能力匹配是第一驱动因素 + `<CapabilityMatchDiagram client:visible />`
- §2 延迟 tradeoff 的复杂性 + `<LatencyTradeoffAnalysis client:visible />`
- §3 隐私与离线 + `<PrivacyRoutingFlow client:visible />`
- §4 路由算法在 local/cloud 的复用 + `<RouterFreeRL client:visible />`
- §5 系统架构对比 + `<HybridArchCompare client:visible />` + `<MultiObjectiveRadar client:visible />`

- [ ] **Step 2: 验证 + 提交**

```bash
npm run validate
git add src/content/articles/zh/hybrid-local-cloud.mdx
git commit -m "feat: add Article 4 - Hybrid LLM local-cloud routing"
```