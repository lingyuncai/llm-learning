# Model Routing 学习路径实现计划 — Part 1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 "LLM Model Routing：智能模型选择与混合推理" 学习路径的前两篇文章（共 12 个交互组件）+ 路径 YAML。

**Architecture:** Astro + MDX + React 交互组件。每篇文章是一个 MDX 文件，交互组件用 React + SVG 实现，通过 `client:visible` 指令在 Astro Islands 中激活。

**Tech Stack:** Astro 5, React 19, TypeScript, SVG, motion/react, Tailwind CSS

**Design reference:** `docs/superpowers/specs/2026-04-06-model-routing-design.md`

---

## Phase 1: 路径 YAML + 第1篇文章（7 个组件）

### Task 1: 创建路径 YAML

**Files:**
- Create: `src/content/paths/model-routing.yaml`

- [ ] **Step 1: 创建路径定义文件**

```yaml
id: model-routing
title:
  zh: "LLM Model Routing：智能模型选择与混合推理"
  en: "LLM Model Routing: Intelligent Model Selection and Hybrid Inference"
description:
  zh: "根据任务复杂度自动选择对应的 LLM 模型。覆盖从简单分类器到 RL 在线学习，从 query-level 到 token-level，从"选一个"到"全都用"的完整方法谱系。"
  en: "Automatically select the right LLM based on task complexity. Covers the full spectrum from simple classifiers to RL-based online learning, query-level to token-level routing, and single-model selection to multi-model collaboration."
level: advanced
articles:
  - model-routing-landscape
  - routing-classifiers
  - cascade-self-verification
  - hybrid-local-cloud
  - online-learning-cost-optimization
  - mixture-of-agents
```

- [ ] **Step 2: 运行验证**

Run: `npm run validate`
Expected: PASS（新路径被识别，文章 slug 暂时找不到但不应阻断）

- [ ] **Step 3: 提交**

```bash
git add src/content/paths/model-routing.yaml
git commit -m "feat: add model-routing learning path YAML"
```

---

### Task 2: CostQualityTriangle 组件

**Files:**
- Create: `src/components/interactive/CostQualityTriangle.tsx`

- [ ] **Step 1: 创建组件文件**

SVG 三角图，展示成本-质量-延迟三角关系。用户拖动"成本预算"滑块，看可选模型区域变化。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// 模型数据：name, quality (0-100), cost (0-100), latency (0-100)
const MODELS = [
  { name: 'GPT-4o', quality: 95, cost: 95, latency: 60, color: '#6a1b9a' },
  { name: 'Claude 3.5 Sonnet', quality: 90, cost: 80, latency: 50, color: '#1565c0' },
  { name: 'Llama-3-70B', quality: 82, cost: 40, latency: 70, color: '#2e7d32' },
  { name: 'Llama-3-8B', quality: 60, cost: 10, latency: 30, color: '#e65100' },
  { name: 'Mixtral-8x7B', quality: 75, cost: 25, latency: 45, color: '#00838f' },
  { name: 'GPT-4o-mini', quality: 78, cost: 15, latency: 25, color: '#4527a0' },
  { name: 'Phi-3-mini', quality: 55, cost: 5, latency: 20, color: '#ef6c00' },
];

export default function CostQualityTriangle() {
  const [budget, setBudget] = useState(50);

  const W = 580, H = 400;
  const plotL = 80, plotR = 540, plotT = 60, plotB = 320;
  const plotW = plotR - plotL, plotH = plotB - plotT;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Title */}
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          成本预算 vs 模型质量
        </text>

        {/* Budget slider label */}
        <text x={W / 2} y="48" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="12" fill={COLORS.mid}>
          拖动滑块调整成本预算上限：{budget}%
        </text>

        {/* Axes */}
        <line x1={plotL} y1={plotB} x2={plotR} y2={plotB}
              stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={plotL} y1={plotT} x2={plotL} y2={plotB}
              stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={W / 2} y={plotB + 35} textAnchor="middle"
              fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>
          相对成本 →
        </text>
        <text x={plotL - 15} y={(plotT + plotB) / 2} textAnchor="middle"
              fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}
              transform={`rotate(-90, ${plotL - 15}, ${(plotT + plotB) / 2})`}>
          质量 →
        </text>

        {/* Budget line */}
        {(() => {
          const bx = plotL + (budget / 100) * plotW;
          return (
            <>
              <line x1={bx} y1={plotT} x2={bx} y2={plotB}
                    stroke={COLORS.red} strokeWidth="2" strokeDasharray="6,4" />
              <rect x={bx - 30} y={plotT - 5} width="60" height="18" rx="3"
                    fill={COLORS.red} />
              <text x={bx} y={plotT + 8} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10" fill="#fff">
                预算线
              </text>
              {/* Affordable zone */}
              <rect x={plotL} y={plotT} width={bx - plotL} height={plotH}
                    fill={COLORS.valid} opacity="0.3" />
            </>
          );
        })()}

        {/* Model dots */}
        {MODELS.map((m) => {
          const cx = plotL + (m.cost / 100) * plotW;
          const cy = plotB - (m.quality / 100) * plotH;
          const affordable = m.cost <= budget;
          return (
            <g key={m.name} opacity={affordable ? 1 : 0.3}>
              <circle cx={cx} cy={cy} r="8"
                      fill={affordable ? m.color : COLORS.light}
                      stroke={m.color} strokeWidth="2" />
              <text x={cx + 12} y={cy + 4}
                    fontFamily={FONTS.sans} fontSize="10"
                    fill={affordable ? COLORS.dark : COLORS.mid}>
                {m.name}
                {affordable ? ` (质量 ${m.quality}%)` : ''}
              </text>
            </g>
          );
        })}

        {/* Summary */}
        {(() => {
          const affordable = MODELS.filter(m => m.cost <= budget);
          const best = affordable.length > 0
            ? affordable.reduce((a, b) => a.quality > b.quality ? a : b)
            : null;
          return (
            <g>
              <rect x={plotL} y={plotB + 45} width={plotW} height="32" rx="4"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x={W / 2} y={plotB + 65} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>
                {best
                  ? `预算内最优：${best.name}（质量 ${best.quality}%，成本 ${best.cost}%）— 共 ${affordable.length} 个可选模型`
                  : '预算过低，无可用模型'}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* HTML slider for better UX */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500 font-mono">0%</span>
        <input type="range" min="0" max="100" value={budget}
               onChange={e => setBudget(Number(e.target.value))}
               className="w-64 accent-blue-700" />
        <span className="text-sm text-gray-500 font-mono">100%</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 本地验证**

Run: `npm run dev`
Expected: 组件可渲染，滑块拖动时模型点和预算线实时更新

- [ ] **Step 3: 提交**

```bash
git add src/components/interactive/CostQualityTriangle.tsx
git commit -m "feat: add CostQualityTriangle interactive component"
```

---

### Task 3: RoutingTaxonomyTree 组件

**Files:**
- Create: `src/components/interactive/RoutingTaxonomyTree.tsx`

- [ ] **Step 1: 创建组件文件**

交互式树状图，展示路由方法分类体系。可展开/折叠各分支，点击叶节点看方法摘要。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  summary?: string;
}

const TREE: TreeNode = {
  id: 'root',
  label: 'Model Routing',
  children: [
    {
      id: 'by-granularity',
      label: '按路由粒度',
      children: [
        { id: 'query-level', label: 'Query-level', summary: '整个请求选一个模型。最简单，适用大多数场景。代表：RouteLLM, FrugalGPT。' },
        { id: 'subtask-level', label: 'Subtask-level', summary: '拆分子任务，各自路由。适合复杂 agent 任务。代表：HybridFlow (DAG 路由)。' },
        { id: 'token-level', label: 'Token-level', summary: '生成过程中逐 token 切换模型。最细粒度，额外开销大。代表：Token-level Hybrid (2024)。' },
      ],
    },
    {
      id: 'by-timing',
      label: '按决策时机',
      children: [
        { id: 'static', label: '静态路由', summary: '部署前确定规则。分类器、语义匹配等方法。预测成本低，但无法适应分布漂移。' },
        { id: 'dynamic', label: '动态路由', summary: '运行时持续学习。Bandit / RL 方法。能适应变化，但需要 reward 信号和探索机制。' },
      ],
    },
    {
      id: 'by-usage',
      label: '按模型使用方式',
      children: [
        { id: 'select-one', label: '选一个 (Routing)', summary: '为每个 query 选择一个最合适的模型。最高效，依赖 router 准确性。' },
        { id: 'try-verify', label: '先试后验 (Cascade)', summary: '先用便宜模型，质量不够再升级。无需预判难度，但可能增加延迟。代表：FrugalGPT, AutoMix。' },
        { id: 'use-all', label: '全用 (Ensemble/MoA)', summary: '多模型并行生成，综合最优答案。质量最高，但成本线性增长。代表：Council Mode, MoA。' },
      ],
    },
    {
      id: 'by-router',
      label: '按路由器类型',
      children: [
        { id: 'mf', label: 'Matrix Factorization', summary: '偏好数据学评分函数。RouteLLM 的核心方法之一，用 Chatbot Arena 数据训练。' },
        { id: 'bert', label: 'BERT 分类器', summary: '微调 BERT 做强/弱模型二分类。需要训练数据，但推理成本低。' },
        { id: 'causal-lm', label: 'Causal LM', summary: '用小语言模型（如 Qwen-2.5-3B）做路由判断。语义理解能力强于 BERT。' },
        { id: 'semantic', label: 'Semantic Routing', summary: 'Embedding cosine 匹配，无需训练。最快的路由方式，但粒度粗。' },
        { id: 'self-verify', label: '自验证', summary: '模型评估自己的回答质量。AutoMix 的核心机制。' },
        { id: 'llm-judge', label: 'LLM-as-Judge', summary: '用另一个 LLM 评估回答。比自验证更可靠，但有额外成本。' },
        { id: 'bandit-rl', label: 'Bandit / RL', summary: '在线学习持续优化。ParetoBandit 做 cost-aware 多目标平衡。' },
        { id: 'infra', label: '基础设施级', summary: '负载均衡、fallback、rate-limit。LiteLLM 等工具提供。' },
      ],
    },
  ],
};

export default function RoutingTaxonomyTree() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNode = (node: TreeNode, depth: number, yRef: { y: number }): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    const x = 30 + depth * 28;
    const y = yRef.y;
    const isLeaf = !node.children;
    const isExpanded = expanded.has(node.id);
    const hasChildren = !!node.children && node.children.length > 0;

    // Toggle icon for branches
    if (hasChildren) {
      elements.push(
        <text key={`icon-${node.id}`} x={x - 16} y={y + 5}
              fontFamily={FONTS.mono} fontSize="14" fill={COLORS.primary}
              style={{ cursor: 'pointer' }} onClick={() => toggle(node.id)}>
          {isExpanded ? '▾' : '▸'}
        </text>
      );
    }

    // Node label
    elements.push(
      <text key={`label-${node.id}`} x={x} y={y + 5}
            fontFamily={FONTS.sans} fontSize={depth === 0 ? "14" : "12"}
            fontWeight={depth === 0 ? "700" : isLeaf ? "400" : "600"}
            fill={isLeaf ? COLORS.primary : COLORS.dark}
            style={{ cursor: isLeaf ? 'pointer' : hasChildren ? 'pointer' : 'default' }}
            onClick={() => {
              if (isLeaf && node.summary) {
                setSelectedSummary(node.summary);
                setSelectedLabel(node.label);
              } else if (hasChildren) {
                toggle(node.id);
              }
            }}>
        {node.label}
      </text>
    );

    yRef.y += 24;

    // Recurse children if expanded
    if (hasChildren && isExpanded) {
      for (const child of node.children!) {
        elements.push(...renderNode(child, depth + 1, yRef));
      }
    }

    return elements;
  };

  // Pre-calculate height
  const calcHeight = (node: TreeNode): number => {
    let h = 24;
    if (node.children && expanded.has(node.id)) {
      for (const child of node.children) h += calcHeight(child);
    }
    return h;
  };

  const treeH = calcHeight(TREE);
  const summaryH = selectedSummary ? 60 : 0;
  const totalH = treeH + 40 + summaryH + 20;
  const yRef = { y: 40 };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 580 ${totalH}`} className="w-full">
        <text x="290" y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          路由方法分类体系
        </text>
        <text x="290" y="36" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          点击分支展开/折叠 · 点击叶节点查看摘要
        </text>

        {renderNode(TREE, 0, yRef)}

        {/* Summary box */}
        {selectedSummary && (
          <g transform={`translate(30, ${treeH + 45})`}>
            <rect x="0" y="0" width="520" height="50" rx="4"
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="10" y="18" fontFamily={FONTS.sans} fontSize="12"
                  fontWeight="600" fill={COLORS.primary}>
              {selectedLabel}
            </text>
            <text x="10" y="36" fontFamily={FONTS.sans} fontSize="11"
                  fill={COLORS.dark}>
              {selectedSummary.length > 80 ? selectedSummary.slice(0, 80) + '…' : selectedSummary}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/interactive/RoutingTaxonomyTree.tsx
git commit -m "feat: add RoutingTaxonomyTree interactive component"
```

---

### Task 4: RoutingGranularityCompare 组件

**Files:**
- Create: `src/components/interactive/RoutingGranularityCompare.tsx`

- [ ] **Step 1: 创建组件文件**

三列对比组件，展示 Query-level / Subtask-level / Token-level 三种路由粒度。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Granularity = 'query' | 'subtask' | 'token';

const MODES: { id: Granularity; label: string; desc: string; pros: string; cons: string }[] = [
  {
    id: 'query',
    label: 'Query-level',
    desc: '整个请求选一个模型',
    pros: '简单高效、低延迟开销',
    cons: '无法处理 query 内部复杂度差异',
  },
  {
    id: 'subtask',
    label: 'Subtask-level',
    desc: '拆分子任务，各自路由',
    pros: '每个子任务最优匹配',
    cons: '需要任务分解能力',
  },
  {
    id: 'token',
    label: 'Token-level',
    desc: '逐 token 决定用哪个模型',
    pros: '最细粒度，理论最优',
    cons: '开销大，实现复杂',
  },
];

export default function RoutingGranularityCompare() {
  const [active, setActive] = useState<Granularity>('query');

  const W = 580, H = 380;
  const colW = 160, gap = 20;
  const startX = (W - (colW * 3 + gap * 2)) / 2;

  // Tokens for animation
  const tokens = ['请', '帮', '我', '翻', '译', '这', '段', '代', '码'];

  const getTokenColor = (idx: number, mode: Granularity) => {
    if (mode === 'query') return COLORS.primary; // all same model
    if (mode === 'subtask') return idx < 4 ? COLORS.green : COLORS.purple; // 2 subtasks
    // token-level: alternating based on "difficulty"
    return [COLORS.green, COLORS.green, COLORS.primary, COLORS.green, COLORS.primary, COLORS.green, COLORS.green, COLORS.purple, COLORS.purple][idx];
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          路由粒度对比
        </text>

        {/* Mode tabs */}
        <g transform="translate(130, 40)">
          {MODES.map((m, i) => (
            <g key={m.id}>
              <rect x={i * 110} y="0" width="100" height="28" rx="4"
                    fill={active === m.id ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActive(m.id)} />
              <text x={i * 110 + 50} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={active === m.id ? "700" : "400"}
                    fill={active === m.id ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {m.label}
              </text>
            </g>
          ))}
        </g>

        {/* Token flow visualization */}
        <g transform="translate(40, 90)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12"
                fontWeight="600" fill={COLORS.dark}>
            输入 Query
          </text>
          <g transform="translate(0, 10)">
            {tokens.map((t, i) => (
              <g key={i}>
                <rect x={i * 55} y="0" width="48" height="32" rx="4"
                      fill={getTokenColor(i, active)}
                      opacity="0.15" stroke={getTokenColor(i, active)} strokeWidth="1.5" />
                <text x={i * 55 + 24} y="21" textAnchor="middle"
                      fontFamily={FONTS.sans} fontSize="13" fill={getTokenColor(i, active)}>
                  {t}
                </text>
              </g>
            ))}
          </g>

          {/* Legend */}
          <g transform="translate(0, 55)">
            {active === 'query' && (
              <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
                ● 所有 token → 同一个模型（{COLORS.primary === '#1565c0' ? '蓝色' : ''}）
              </text>
            )}
            {active === 'subtask' && (
              <>
                <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
                  ● 子任务1 "请帮我翻译" → 模型A（绿色） · 子任务2 "这段代码" → 模型B（紫色）
                </text>
              </>
            )}
            {active === 'token' && (
              <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
                ● 每个 token 独立判断：绿=本地模型 · 蓝=中等模型 · 紫=云端强模型
              </text>
            )}
          </g>
        </g>

        {/* Detail card */}
        {(() => {
          const m = MODES.find(m => m.id === active)!;
          return (
            <g transform="translate(40, 220)">
              <rect x="0" y="0" width="500" height="140" rx="6"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x="20" y="28" fontFamily={FONTS.sans} fontSize="14"
                    fontWeight="700" fill={COLORS.dark}>
                {m.label}
              </text>
              <text x="20" y="50" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>
                {m.desc}
              </text>
              <text x="20" y="80" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.green}>
                ✓ 优势：{m.pros}
              </text>
              <text x="20" y="105" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.red}>
                ✗ 劣势：{m.cons}
              </text>
              <text x="20" y="128" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                {active === 'query' ? '代表：RouteLLM, FrugalGPT, 大多数路由系统'
                  : active === 'subtask' ? '代表：HybridFlow (2025), Agent 任务编排'
                  : '代表：Token-level Hybrid (2024), Speculative Decoding 变体'}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/interactive/RoutingGranularityCompare.tsx
git commit -m "feat: add RoutingGranularityCompare interactive component"
```

---

### Task 5: AccuracyCostScatter 组件

**Files:**
- Create: `src/components/interactive/AccuracyCostScatter.tsx`

- [ ] **Step 1: 创建组件文件**

散点图组件，展示各路由方法在精度 vs 成本平面上的位置。hover 显示详情。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface MethodPoint {
  name: string;
  accuracy: number; // 0-100, % of GPT-4 quality
  costSaving: number; // 0-100, % cost reduction
  category: 'classifier' | 'cascade' | 'hybrid' | 'online' | 'ensemble';
  detail: string;
}

const METHODS: MethodPoint[] = [
  { name: 'No Routing\n(always GPT-4)', accuracy: 100, costSaving: 0, category: 'classifier', detail: '始终使用最强模型。质量最高，成本最高。' },
  { name: 'MF Router', accuracy: 95, costSaving: 85, category: 'classifier', detail: 'RouteLLM Matrix Factorization。偏好数据学评分，85% 成本降低。' },
  { name: 'BERT Router', accuracy: 93, costSaving: 80, category: 'classifier', detail: '微调 BERT 二分类器。训练简单，推理快。' },
  { name: 'Causal LM Router', accuracy: 92, costSaving: 75, category: 'classifier', detail: '小语言模型做路由。78.3% 准确率，zero-marginal-cost。' },
  { name: 'Semantic Router', accuracy: 85, costSaving: 90, category: 'classifier', detail: 'Embedding cosine 匹配。无需训练，最快路由。' },
  { name: 'FrugalGPT', accuracy: 96, costSaving: 98, category: 'cascade', detail: '级联链：便宜模型先试，不行再升级。98% 成本降低。' },
  { name: 'AutoMix', accuracy: 94, costSaving: 50, category: 'cascade', detail: 'POMDP + 自验证。NeurIPS 2024，50%+ 成本降低。' },
  { name: 'ConsRoute', accuracy: 91, costSaving: 40, category: 'hybrid', detail: 'Reranker 语义一致性。40% 延迟+成本降低。' },
  { name: 'Router-free RL', accuracy: 88, costSaving: 60, category: 'hybrid', detail: '本地模型自学升级决策。无需外部 router。' },
  { name: 'ParetoBandit', accuracy: 90, costSaving: 70, category: 'online', detail: 'Cost-aware contextual bandit。Pareto 前沿优化。' },
  { name: 'Council Mode', accuracy: 98, costSaving: -50, category: 'ensemble', detail: '多 LLM 并行 + 综合。35.9% 幻觉降低，但成本增加。' },
];

const CATEGORY_COLORS: Record<string, string> = {
  classifier: '#1565c0',
  cascade: '#2e7d32',
  hybrid: '#e65100',
  online: '#6a1b9a',
  ensemble: '#c62828',
};
const CATEGORY_LABELS: Record<string, string> = {
  classifier: '分类器路由',
  cascade: '级联/自验证',
  hybrid: 'Hybrid LLM',
  online: '在线学习',
  ensemble: '多模型协作',
};

export default function AccuracyCostScatter() {
  const [hovered, setHovered] = useState<string | null>(null);

  const W = 580, H = 420;
  const pL = 70, pR = 530, pT = 50, pB = 310;
  const pW = pR - pL, pH = pB - pT;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          路由方法：精度 vs 成本节省
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          Hover 查看方法详情
        </text>

        {/* Axes */}
        <line x1={pL} y1={pB} x2={pR} y2={pB} stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={pL} y1={pT} x2={pL} y2={pB} stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={W / 2} y={pB + 30} textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>
          成本节省 (%) →
        </text>
        <text x={pL - 15} y={(pT + pB) / 2} textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}
              transform={`rotate(-90, ${pL - 15}, ${(pT + pB) / 2})`}>
          质量保持 (% of GPT-4) →
        </text>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={`grid-${v}`}>
            <line x1={pL + (v / 100) * pW} y1={pT} x2={pL + (v / 100) * pW} y2={pB}
                  stroke={COLORS.light} strokeWidth="0.5" />
            <text x={pL + (v / 100) * pW} y={pB + 15} textAnchor="middle"
                  fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>{v}</text>
          </g>
        ))}
        {[80, 85, 90, 95, 100].map(v => (
          <g key={`grid-y-${v}`}>
            <line x1={pL} y1={pB - ((v - 80) / 25) * pH} x2={pR} y2={pB - ((v - 80) / 25) * pH}
                  stroke={COLORS.light} strokeWidth="0.5" />
            <text x={pL - 8} y={pB - ((v - 80) / 25) * pH + 4} textAnchor="end"
                  fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>{v}</text>
          </g>
        ))}

        {/* Data points */}
        {METHODS.map(m => {
          const cx = pL + (Math.max(0, m.costSaving) / 100) * pW;
          const cy = pB - ((Math.min(100, Math.max(80, m.accuracy)) - 80) / 25) * pH;
          const isHovered = hovered === m.name;
          return (
            <g key={m.name}
               onMouseEnter={() => setHovered(m.name)}
               onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              <circle cx={cx} cy={cy} r={isHovered ? 10 : 7}
                      fill={CATEGORY_COLORS[m.category]} opacity={isHovered ? 1 : 0.8}
                      stroke="#fff" strokeWidth="2" />
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${pL}, ${pB + 40})`}>
          {Object.entries(CATEGORY_LABELS).map(([key, label], i) => (
            <g key={key} transform={`translate(${i * 100}, 0)`}>
              <circle cx="6" cy="6" r="5" fill={CATEGORY_COLORS[key]} />
              <text x="16" y="10" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{label}</text>
            </g>
          ))}
        </g>

        {/* Hover detail */}
        {hovered && (() => {
          const m = METHODS.find(m => m.name === hovered)!;
          return (
            <g transform={`translate(70, ${pB + 60})`}>
              <rect x="0" y="0" width="460" height="42" rx="4"
                    fill={COLORS.bgAlt} stroke={CATEGORY_COLORS[m.category]} strokeWidth="1.5" />
              <text x="10" y="17" fontFamily={FONTS.sans} fontSize="12" fontWeight="700"
                    fill={CATEGORY_COLORS[m.category]}>
                {m.name.replace('\n', ' ')} — 质量 {m.accuracy}% · 成本节省 {m.costSaving}%
              </text>
              <text x="10" y="34" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {m.detail}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/interactive/AccuracyCostScatter.tsx
git commit -m "feat: add AccuracyCostScatter interactive component"
```

---

### Task 6: LatencyOverheadBar + ScenarioFitMatrix + PaperTimeline 组件

**Files:**
- Create: `src/components/interactive/LatencyOverheadBar.tsx`
- Create: `src/components/interactive/ScenarioFitMatrix.tsx`
- Create: `src/components/interactive/PaperTimeline.tsx`

- [ ] **Step 1: 创建 LatencyOverheadBar**

条形图，展示各路由方法引入的额外延迟。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface MethodLatency {
  name: string;
  overhead_ms: number; // additional latency in ms
  detail: string;
  category: string;
}

const DATA: MethodLatency[] = [
  { name: 'Semantic Router', overhead_ms: 5, detail: 'Embedding cosine 匹配，几乎无额外延迟', category: '分类器' },
  { name: 'BERT Router', overhead_ms: 15, detail: 'BERT 推理 ~15ms，可在 CPU 上运行', category: '分类器' },
  { name: 'MF Router', overhead_ms: 10, detail: '矩阵乘法 + 阈值判断', category: '分类器' },
  { name: 'Causal LM Router', overhead_ms: 50, detail: '小 LM 推理 ~50ms，需要 GPU', category: '分类器' },
  { name: 'Self-Verification', overhead_ms: 200, detail: '需要生成 + 自评，可能多次调用', category: '级联' },
  { name: 'LLM-as-Judge', overhead_ms: 500, detail: '额外一次 LLM 调用评估质量', category: '级联' },
  { name: 'Council Mode', overhead_ms: 0, detail: '并行调用，延迟 = 最慢模型（非额外开销）', category: 'MoA' },
  { name: 'Token-level Hybrid', overhead_ms: 30, detail: '每 token 置信度判断，累积开销', category: '混合' },
];

const MAX_MS = 600;

export default function LatencyOverheadBar() {
  const [hovered, setHovered] = useState<string | null>(null);

  const W = 580, barH = 28, gap = 6;
  const labelW = 140, barL = 155, barR = 530, barW = barR - barL;
  const H = 60 + DATA.length * (barH + gap) + 60;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          路由方法额外延迟开销
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          不含模型推理时间，仅路由决策本身的延迟
        </text>

        {DATA.map((d, i) => {
          const y = 60 + i * (barH + gap);
          const w = (d.overhead_ms / MAX_MS) * barW;
          const isHovered = hovered === d.name;
          const barColor = d.overhead_ms < 20 ? COLORS.green
            : d.overhead_ms < 100 ? COLORS.orange : COLORS.red;

          return (
            <g key={d.name}
               onMouseEnter={() => setHovered(d.name)}
               onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              <text x={labelW} y={y + barH / 2 + 4} textAnchor="end"
                    fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {d.name}
              </text>
              <rect x={barL} y={y} width={barW} height={barH} rx="3"
                    fill={COLORS.light} />
              <rect x={barL} y={y} width={Math.max(w, 4)} height={barH} rx="3"
                    fill={barColor} opacity={isHovered ? 1 : 0.8} />
              <text x={barL + Math.max(w, 4) + 6} y={y + barH / 2 + 4}
                    fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>
                {d.overhead_ms === 0 ? '0ms (并行)' : `~${d.overhead_ms}ms`}
              </text>
            </g>
          );
        })}

        {/* Hover detail */}
        {hovered && (() => {
          const d = DATA.find(d => d.name === hovered)!;
          const y = 60 + DATA.length * (barH + gap) + 10;
          return (
            <g>
              <rect x="40" y={y} width="500" height="32" rx="4"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x="50" y={y + 20} fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {d.name}：{d.detail}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 ScenarioFitMatrix**

热力图，展示方法 × 场景适用度矩阵。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const METHODS = ['分类器路由', '级联/自验证', 'Hybrid LLM', '在线学习', '多模型协作'];
const SCENARIOS = ['高吞吐', '低延迟', '隐私敏感', '离线场景', '成本受限'];

// Fit scores: 0=不适合, 1=一般, 2=适合, 3=非常适合
const FIT: number[][] = [
  [3, 3, 1, 2, 3], // 分类器
  [2, 1, 1, 1, 3], // 级联
  [2, 2, 3, 3, 2], // Hybrid
  [3, 2, 1, 0, 3], // 在线学习
  [0, 0, 2, 1, 0], // MoA
];

const FIT_COLORS = ['#fee2e2', '#fef3c7', '#dbeafe', '#bbf7d0'];
const FIT_LABELS = ['不适合', '一般', '适合', '非常适合'];

const EXPLANATIONS: string[][] = [
  ['轻量 router 不影响吞吐', '几ms 延迟极低', '数据仍需发送到模型', '可配合本地模型', '大幅降低 API 调用'],
  ['多次调用影响吞吐', '可能需多次生成', '数据可能经过多个模型', '需要多个模型可用', '逐步升级节省成本'],
  ['需要本地+云端协调', '取决于本地硬件', '敏感数据留本地', '本地模型可离线', '本地模型成本低'],
  ['持续学习需要反馈', 'Bandit 决策快', '需要收集 reward', '需要在线环境', 'Pareto 优化成本'],
  ['成本线性增长', '并行延迟叠加', '可选择安全模型', '需要多模型可用', '成本最高'],
];

export default function ScenarioFitMatrix() {
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);

  const W = 580, H = 360;
  const labelW = 100, labelH = 50;
  const cellW = 80, cellH = 40;
  const startX = labelW + 20, startY = labelH + 20;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          方法 × 场景适用度矩阵
        </text>
        <text x={W / 2} y="38" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          点击格子查看解释
        </text>

        {/* Column headers */}
        {SCENARIOS.map((s, c) => (
          <text key={`col-${c}`} x={startX + c * cellW + cellW / 2} y={startY - 8}
                textAnchor="middle" fontFamily={FONTS.sans} fontSize="11"
                fontWeight="600" fill={COLORS.dark}>
            {s}
          </text>
        ))}

        {/* Rows */}
        {METHODS.map((m, r) => (
          <g key={`row-${r}`}>
            <text x={startX - 10} y={startY + r * cellH + cellH / 2 + 4}
                  textAnchor="end" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {m}
            </text>
            {SCENARIOS.map((_, c) => {
              const fit = FIT[r][c];
              const isSelected = selected?.r === r && selected?.c === c;
              return (
                <g key={`cell-${r}-${c}`}
                   onClick={() => setSelected({ r, c })}
                   style={{ cursor: 'pointer' }}>
                  <rect x={startX + c * cellW} y={startY + r * cellH}
                        width={cellW - 2} height={cellH - 2} rx="4"
                        fill={FIT_COLORS[fit]}
                        stroke={isSelected ? COLORS.primary : 'transparent'}
                        strokeWidth={isSelected ? 2 : 0} />
                  <text x={startX + c * cellW + cellW / 2 - 1}
                        y={startY + r * cellH + cellH / 2 + 4}
                        textAnchor="middle" fontFamily={FONTS.sans} fontSize="11"
                        fill={COLORS.dark}>
                    {FIT_LABELS[fit]}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(${startX}, ${startY + METHODS.length * cellH + 15})`}>
          {FIT_LABELS.map((label, i) => (
            <g key={label} transform={`translate(${i * 110}, 0)`}>
              <rect x="0" y="0" width="16" height="16" rx="2" fill={FIT_COLORS[i]} stroke={COLORS.mid} strokeWidth="0.5" />
              <text x="22" y="12" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{label}</text>
            </g>
          ))}
        </g>

        {/* Explanation box */}
        {selected && (
          <g transform={`translate(40, ${startY + METHODS.length * cellH + 42})`}>
            <rect x="0" y="0" width="500" height="36" rx="4"
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
            <text x="10" y="14" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.primary}>
              {METHODS[selected.r]} × {SCENARIOS[selected.c]}
            </text>
            <text x="10" y="29" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {EXPLANATIONS[selected.r][selected.c]}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: 创建 PaperTimeline**

时间轴组件，展示 2023-2026 关键论文和系统的发展历程。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Paper {
  year: number;
  month: number;
  name: string;
  venue?: string;
  contribution: string;
  category: 'classifier' | 'cascade' | 'hybrid' | 'online' | 'ensemble' | 'system';
}

const PAPERS: Paper[] = [
  { year: 2023, month: 5, name: 'FrugalGPT', venue: 'arXiv', contribution: '级联方法开山之作，98% 成本降低', category: 'cascade' },
  { year: 2023, month: 10, name: 'AutoMix', venue: 'arXiv → NeurIPS 2024', contribution: 'POMDP + few-shot 自验证路由', category: 'cascade' },
  { year: 2024, month: 6, name: 'RouteLLM', venue: 'arXiv', contribution: '开源路由框架，MF/BERT/Causal LM/SW 四种 router', category: 'system' },
  { year: 2024, month: 6, name: 'Apple Intelligence', venue: 'WWDC', contribution: 'On-device + Private Cloud Compute，产品化标杆', category: 'hybrid' },
  { year: 2024, month: 9, name: 'Token-level Hybrid', venue: 'arXiv', contribution: '逐 token 置信度判断，最细粒度', category: 'hybrid' },
  { year: 2025, month: 2, name: 'Confidence-Driven Router', venue: 'arXiv', contribution: 'LLM-as-Judge + 不确定性估计', category: 'cascade' },
  { year: 2025, month: 9, name: 'Router-free RL', venue: 'arXiv', contribution: '本地模型通过 RL 自学升级决策', category: 'hybrid' },
  { year: 2025, month: 11, name: 'PRISM', venue: 'AAAI 2026', contribution: '实体级隐私敏感度路由', category: 'hybrid' },
  { year: 2025, month: 12, name: 'HybridFlow', venue: 'arXiv', contribution: 'Subtask-level DAG 路由', category: 'hybrid' },
  { year: 2026, month: 3, name: 'ConsRoute', venue: 'arXiv', contribution: 'Reranker 语义一致性做 cloud-edge-device 路由', category: 'hybrid' },
  { year: 2026, month: 3, name: 'Robust Batch Routing', venue: 'arXiv', contribution: '批量优化在对抗条件下优于逐条 24%', category: 'online' },
  { year: 2026, month: 4, name: 'Small Models as Routers', venue: 'arXiv', contribution: '1-4B 模型做路由，78.3% 准确率', category: 'classifier' },
  { year: 2026, month: 4, name: 'Council Mode', venue: 'arXiv', contribution: '并行多 LLM + 综合，35.9% 幻觉降低', category: 'ensemble' },
];

const CAT_COLORS: Record<string, string> = {
  classifier: '#1565c0', cascade: '#2e7d32', hybrid: '#e65100',
  online: '#6a1b9a', ensemble: '#c62828', system: '#00838f',
};
const CAT_LABELS: Record<string, string> = {
  classifier: '分类器', cascade: '级联', hybrid: '混合路由',
  online: '在线学习', ensemble: '多模型', system: '系统/框架',
};

export default function PaperTimeline() {
  const [selected, setSelected] = useState<string | null>(null);

  const W = 580, H = 520;
  const timelineL = 100, timelineR = 540;
  const timelineW = timelineR - timelineL;
  const startDate = 2023.0, endDate = 2026.5;
  const range = endDate - startDate;

  const getX = (year: number, month: number) =>
    timelineL + ((year + month / 12 - startDate) / range) * timelineW;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Model Routing 论文与系统时间线 (2023-2026)
        </text>

        {/* Timeline axis */}
        <line x1={timelineL} y1="60" x2={timelineR} y2="60"
              stroke={COLORS.dark} strokeWidth="2" />
        {[2023, 2024, 2025, 2026].map(y => (
          <g key={y}>
            <line x1={getX(y, 0)} y1="55" x2={getX(y, 0)} y2="65"
                  stroke={COLORS.dark} strokeWidth="2" />
            <text x={getX(y, 0)} y="80" textAnchor="middle"
                  fontFamily={FONTS.mono} fontSize="12" fontWeight="600" fill={COLORS.dark}>
              {y}
            </text>
          </g>
        ))}

        {/* Paper dots */}
        {PAPERS.map((p, i) => {
          const x = getX(p.year, p.month);
          const row = i % 2 === 0 ? 0 : 1; // alternate rows to avoid overlap
          const dotY = 60;
          const labelY = row === 0 ? 100 + (i % 4) * 30 : 100 + ((i + 2) % 4) * 30;
          const isSelected = selected === p.name;
          return (
            <g key={p.name} style={{ cursor: 'pointer' }}
               onClick={() => setSelected(isSelected ? null : p.name)}>
              <circle cx={x} cy={dotY} r={isSelected ? 7 : 5}
                      fill={CAT_COLORS[p.category]}
                      stroke={isSelected ? COLORS.dark : '#fff'}
                      strokeWidth={isSelected ? 2 : 1.5} />
              <line x1={x} y1={dotY + 6} x2={x} y2={labelY - 10}
                    stroke={CAT_COLORS[p.category]} strokeWidth="1"
                    strokeDasharray="2,2" opacity="0.5" />
              <text x={x} y={labelY}
                    textAnchor="middle" fontFamily={FONTS.sans} fontSize="9"
                    fontWeight={isSelected ? "700" : "400"}
                    fill={CAT_COLORS[p.category]}>
                {p.name}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(80, 340)">
          {Object.entries(CAT_LABELS).map(([key, label], i) => (
            <g key={key} transform={`translate(${(i % 3) * 160}, ${Math.floor(i / 3) * 20})`}>
              <circle cx="6" cy="6" r="5" fill={CAT_COLORS[key]} />
              <text x="16" y="10" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{label}</text>
            </g>
          ))}
        </g>

        {/* Selected detail */}
        {selected && (() => {
          const p = PAPERS.find(p => p.name === selected)!;
          return (
            <g transform="translate(40, 390)">
              <rect x="0" y="0" width="500" height="55" rx="4"
                    fill={COLORS.bgAlt} stroke={CAT_COLORS[p.category]} strokeWidth="1.5" />
              <text x="10" y="18" fontFamily={FONTS.sans} fontSize="12" fontWeight="700"
                    fill={CAT_COLORS[p.category]}>
                {p.name} ({p.year}.{String(p.month).padStart(2, '0')})
                {p.venue ? ` — ${p.venue}` : ''}
              </text>
              <text x="10" y="38" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {p.contribution}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: 提交全部三个组件**

```bash
git add src/components/interactive/LatencyOverheadBar.tsx src/components/interactive/ScenarioFitMatrix.tsx src/components/interactive/PaperTimeline.tsx
git commit -m "feat: add LatencyOverheadBar, ScenarioFitMatrix, PaperTimeline components"
```

---

### Task 7: 第1篇文章 MDX — model-routing-landscape

**Files:**
- Create: `src/content/articles/zh/model-routing-landscape.mdx`

- [ ] **Step 1: 创建文章文件**

按照设计文档的内容骨架，写完整的第1篇文章。包含 7 个交互组件的引用。

frontmatter:
```yaml
---
title: "Model Routing 全景：为什么一个模型不够"
slug: model-routing-landscape
locale: zh
tags: [model-routing, llm, cost-optimization, system-design]
difficulty: advanced
created: "2026-04-06"
updated: "2026-04-06"
references:
  - type: paper
    title: "RouteLLM: Learning to Route LLMs with Preference Data"
    url: "https://arxiv.org/abs/2406.18665"
  - type: paper
    title: "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance"
    url: "https://arxiv.org/abs/2305.05176"
  - type: paper
    title: "AutoMix: Automatically Mixing Language Models"
    url: "https://arxiv.org/abs/2310.12963"
  - type: website
    title: "RouteLLM GitHub Repository"
    url: "https://github.com/lm-sys/RouteLLM"
---
```

imports (after frontmatter):
```mdx
import CostQualityTriangle from '../../../components/interactive/CostQualityTriangle.tsx';
import RoutingTaxonomyTree from '../../../components/interactive/RoutingTaxonomyTree.tsx';
import RoutingGranularityCompare from '../../../components/interactive/RoutingGranularityCompare.tsx';
import AccuracyCostScatter from '../../../components/interactive/AccuracyCostScatter.tsx';
import LatencyOverheadBar from '../../../components/interactive/LatencyOverheadBar.tsx';
import ScenarioFitMatrix from '../../../components/interactive/ScenarioFitMatrix.tsx';
import PaperTimeline from '../../../components/interactive/PaperTimeline.tsx';
```

文章需要覆盖以下内容（**严格按设计文档**）：

**简介**：LLM 能力差异巨大（GPT-4 vs Llama-3-8B），价格差 100 倍，但 80% 的 query 不需要最强模型。Model Routing 的核心命题。

**§1 为什么需要路由**
- 一个模型无法覆盖所有需求
- `<CostQualityTriangle client:visible />`

**§2 路由方法分类框架**
- 按粒度、按时机、按使用方式三维分类
- `<RoutingTaxonomyTree client:visible />`
- `<RoutingGranularityCompare client:visible />`

**§3 各方法核心原理**（每种 1-2 段 + 关键直觉）
- 分类器路由
- 级联与自验证
- Hybrid LLM（**能力匹配第一驱动因素 + 延迟 tradeoff 复杂性**）
- 在线学习
- 多模型协作

**§4 多维度对比**
- `<AccuracyCostScatter client:visible />`
- `<LatencyOverheadBar client:visible />`
- `<ScenarioFitMatrix client:visible />`

**§5 论文与系统全景**
- `<PaperTimeline client:visible />`
- 实际系统：RouteLLM, OpenRouter, LiteLLM, Martian

**写作要求**：
- 中英混合（术语英文，解释中文）
- 严格事实，引用论文
- 每种方法 1-2 段 + 核心直觉（不是一句话摘要）
- 公式用 KaTeX（如有）
- 总字数约 3000-4000 字

- [ ] **Step 2: 运行验证**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: 本地预览**

Run: `npm run dev`
浏览 http://localhost:4321/zh/articles/model-routing-landscape 确认渲染正确

- [ ] **Step 4: 提交**

```bash
git add src/content/articles/zh/model-routing-landscape.mdx
git commit -m "feat: add Article 1 - Model Routing landscape overview"
```

---

## Phase 2: 第2篇文章（5 个组件）

### Task 8: MatrixFactorizationViz + BertRouterFlow 组件

**Files:**
- Create: `src/components/interactive/MatrixFactorizationViz.tsx`
- Create: `src/components/interactive/BertRouterFlow.tsx`

- [ ] **Step 1: 创建 MatrixFactorizationViz**

矩阵动画组件，展示偏好矩阵分解过程。query × model → 低秩向量空间 → 内积评分。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const QUERIES = ['写一首诗', '解释量子力学', '翻译这段话', '写排序算法', '总结这篇论文'];
const MODELS = ['GPT-4', 'Llama-70B', 'Llama-8B'];

// Simulated preference scores (higher = prefers strong model)
const PREFERENCES: number[][] = [
  [0.3, 0.6, 0.8],  // 写诗 → weak model ok
  [0.9, 0.5, 0.1],  // 量子力学 → needs strong
  [0.2, 0.7, 0.9],  // 翻译 → weak model ok
  [0.7, 0.6, 0.3],  // 排序 → medium
  [0.8, 0.4, 0.2],  // 总结论文 → needs strong
];

// Simulated latent vectors (2D for visualization)
const QUERY_VECS: [number, number][] = [
  [0.2, 0.8], [0.9, 0.3], [0.1, 0.9], [0.6, 0.5], [0.8, 0.4],
];
const MODEL_VECS: [number, number][] = [
  [0.9, 0.2], [0.5, 0.6], [0.2, 0.9],
];

type ViewMode = 'matrix' | 'vectors' | 'scoring';

export default function MatrixFactorizationViz() {
  const [mode, setMode] = useState<ViewMode>('matrix');
  const [hoveredQuery, setHoveredQuery] = useState<number | null>(null);

  const W = 580, H = 380;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Matrix Factorization 路由
        </text>

        {/* Mode tabs */}
        <g transform="translate(140, 40)">
          {(['matrix', 'vectors', 'scoring'] as ViewMode[]).map((m, i) => {
            const labels = { matrix: '偏好矩阵', vectors: '向量空间', scoring: '评分预测' };
            return (
              <g key={m}>
                <rect x={i * 105} y="0" width="95" height="28" rx="4"
                      fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                      stroke={COLORS.primary} strokeWidth="1.5"
                      style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
                <text x={i * 105 + 47.5} y="19" textAnchor="middle"
                      fontFamily={FONTS.sans} fontSize="11"
                      fontWeight={mode === m ? "700" : "400"}
                      fill={mode === m ? '#fff' : COLORS.dark}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                  {labels[m]}
                </text>
              </g>
            );
          })}
        </g>

        {mode === 'matrix' && (
          <g transform="translate(100, 90)">
            {/* Column headers */}
            {MODELS.map((m, c) => (
              <text key={`h-${c}`} x={120 + c * 80 + 40} y="0" textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="11" fontWeight="600" fill={COLORS.dark}>
                {m}
              </text>
            ))}
            {/* Matrix cells */}
            {QUERIES.map((q, r) => (
              <g key={`row-${r}`}>
                <text x="110" y={20 + r * 40 + 25} textAnchor="end"
                      fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>{q}</text>
                {MODELS.map((_, c) => {
                  const val = PREFERENCES[r][c];
                  const intensity = Math.round(val * 255);
                  return (
                    <g key={`cell-${r}-${c}`}>
                      <rect x={120 + c * 80} y={20 + r * 40} width="70" height="32" rx="3"
                            fill={`rgba(21, 101, 192, ${val * 0.6})`}
                            stroke={COLORS.mid} strokeWidth="0.5" />
                      <text x={120 + c * 80 + 35} y={20 + r * 40 + 21} textAnchor="middle"
                            fontFamily={FONTS.mono} fontSize="12" fill={val > 0.5 ? '#fff' : COLORS.dark}>
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}
            <text x="200" y="240" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
              高分 → 偏好强模型 · 低分 → 弱模型即可胜任
            </text>
          </g>
        )}

        {mode === 'vectors' && (
          <g transform="translate(100, 85)">
            {/* 2D space */}
            <rect x="0" y="0" width="250" height="250" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
            <text x="125" y="-5" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
              潜在向量空间 (2D 投影)
            </text>
            {/* Query points */}
            {QUERY_VECS.map(([x, y], i) => (
              <g key={`qv-${i}`} onMouseEnter={() => setHoveredQuery(i)} onMouseLeave={() => setHoveredQuery(null)}>
                <circle cx={x * 230 + 10} cy={(1 - y) * 230 + 10} r="8"
                        fill={COLORS.green} stroke="#fff" strokeWidth="2" style={{ cursor: 'pointer' }} />
                <text x={x * 230 + 22} y={(1 - y) * 230 + 14}
                      fontFamily={FONTS.sans} fontSize="9" fill={COLORS.green}>
                  Q{i}
                </text>
              </g>
            ))}
            {/* Model points */}
            {MODEL_VECS.map(([x, y], i) => (
              <g key={`mv-${i}`}>
                <rect x={x * 230 + 10 - 6} y={(1 - y) * 230 + 10 - 6} width="12" height="12" rx="2"
                      fill={COLORS.primary} stroke="#fff" strokeWidth="2" />
                <text x={x * 230 + 28} y={(1 - y) * 230 + 14}
                      fontFamily={FONTS.mono} fontSize="9" fontWeight="600" fill={COLORS.primary}>
                  {MODELS[i]}
                </text>
              </g>
            ))}
            {/* Legend */}
            <g transform="translate(270, 20)">
              <circle cx="8" cy="8" r="6" fill={COLORS.green} />
              <text x="20" y="12" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>Query 向量</text>
              <rect x="2" y="25" width="12" height="12" rx="2" fill={COLORS.primary} />
              <text x="20" y="35" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>Model 向量</text>
              <text x="0" y="60" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
                距离近 = 偏好匹配
              </text>
              <text x="0" y="75" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
                内积越大 = 越偏好
              </text>
            </g>
            {/* Hover query details */}
            {hoveredQuery !== null && (
              <g transform="translate(270, 120)">
                <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
                  {QUERIES[hoveredQuery]}
                </text>
                {MODELS.map((m, mi) => (
                  <text key={mi} x="0" y={18 + mi * 16} fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
                    → {m}: {PREFERENCES[hoveredQuery][mi].toFixed(1)}
                  </text>
                ))}
              </g>
            )}
          </g>
        )}

        {mode === 'scoring' && (
          <g transform="translate(40, 90)">
            <text x="250" y="0" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>
              评分过程：query_vec · model_vec → score → 选模型
            </text>
            {QUERIES.map((q, i) => {
              const scores = MODELS.map((_, mi) => {
                const [qx, qy] = QUERY_VECS[i];
                const [mx, my] = MODEL_VECS[mi];
                return qx * mx + qy * my;
              });
              const maxIdx = scores.indexOf(Math.max(...scores));
              return (
                <g key={i} transform={`translate(0, ${20 + i * 48})`}>
                  <text x="0" y="15" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>{q}</text>
                  <text x="0" y="30" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                    → {MODELS.map((m, mi) => `${m}: ${scores[mi].toFixed(2)}`).join(' | ')}
                  </text>
                  <text x="430" y="22" fontFamily={FONTS.sans} fontSize="11" fontWeight="700"
                        fill={maxIdx === 2 ? COLORS.green : maxIdx === 1 ? COLORS.orange : COLORS.red}>
                    → {MODELS[maxIdx]}
                  </text>
                </g>
              );
            })}
            <text x="250" y="270" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              高分 query 路由到 GPT-4（红），低分 query 路由到 Llama-8B（绿）节省成本
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 BertRouterFlow**

流程图组件，展示 query → tokenize → BERT → strong/weak 判定流程。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const STEPS = [
  { label: 'Query 输入', detail: '用户的原始问题', icon: '📝' },
  { label: 'Tokenize', detail: 'BERT WordPiece 分词', icon: '✂️' },
  { label: 'BERT Encoder', detail: '提取 [CLS] 语义向量', icon: '🧠' },
  { label: 'Linear + Sigmoid', detail: '二分类: P(需要强模型)', icon: '📊' },
  { label: '阈值判断', detail: 'P > τ ? 强模型 : 弱模型', icon: '⚖️' },
];

const EXAMPLES = [
  { query: '"帮我翻译 hello world"', prob: 0.12, result: 'weak', reason: '简单翻译任务' },
  { query: '"比较康德和黑格尔的哲学"', prob: 0.91, result: 'strong', reason: '需要深度推理' },
  { query: '"1+1等于几"', prob: 0.05, result: 'weak', reason: '极简数学问题' },
  { query: '"分析这段代码的安全漏洞"', prob: 0.85, result: 'strong', reason: '复杂代码分析' },
];

export default function BertRouterFlow() {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [threshold, setThreshold] = useState(0.5);

  const W = 580, H = 360;
  const ex = EXAMPLES[exampleIdx];
  const decision = ex.prob > threshold ? 'strong' : 'weak';

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          BERT Router 流程
        </text>

        {/* Flow steps */}
        {STEPS.map((s, i) => {
          const x = 30 + i * 108;
          return (
            <g key={i} transform={`translate(${x}, 50)`}>
              <rect x="0" y="0" width="95" height="55" rx="6"
                    fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
              <text x="47.5" y="22" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="11" fontWeight="600" fill={COLORS.dark}>
                {s.label}
              </text>
              <text x="47.5" y="40" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={COLORS.mid}>
                {s.detail}
              </text>
              {i < STEPS.length - 1 && (
                <text x="100" y="28" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>
              )}
            </g>
          );
        })}

        {/* Example selector */}
        <g transform="translate(30, 125)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            示例 Query:
          </text>
          {EXAMPLES.map((e, i) => (
            <g key={i} transform={`translate(${i * 135}, 10)`}
               onClick={() => setExampleIdx(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="125" height="26" rx="4"
                    fill={exampleIdx === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="62.5" y="17" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="9"
                    fill={exampleIdx === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {e.query.length > 16 ? e.query.slice(0, 16) + '…' : e.query}
              </text>
            </g>
          ))}
        </g>

        {/* Probability bar */}
        <g transform="translate(30, 175)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            P(需要强模型) = {ex.prob.toFixed(2)}
          </text>
          <rect x="0" y="10" width="520" height="24" rx="4" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="1" />
          <rect x="0" y="10" width={ex.prob * 520} height="24" rx="4"
                fill={ex.prob > threshold ? COLORS.red : COLORS.green} />
          {/* Threshold marker */}
          <line x1={threshold * 520} y1="8" x2={threshold * 520} y2="36"
                stroke={COLORS.dark} strokeWidth="2" strokeDasharray="4,2" />
          <text x={threshold * 520} y="50" textAnchor="middle"
                fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
            τ = {threshold.toFixed(2)}
          </text>
        </g>

        {/* Decision result */}
        <g transform="translate(30, 240)">
          <rect x="0" y="0" width="250" height="50" rx="6"
                fill={decision === 'strong' ? COLORS.waste : COLORS.valid}
                stroke={decision === 'strong' ? COLORS.red : COLORS.green} strokeWidth="2" />
          <text x="125" y="22" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="14" fontWeight="700"
                fill={decision === 'strong' ? COLORS.red : COLORS.green}>
            → {decision === 'strong' ? '🔴 强模型 (GPT-4)' : '🟢 弱模型 (Llama-8B)'}
          </text>
          <text x="125" y="40" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="10" fill={COLORS.mid}>
            {ex.reason}
          </text>

          {/* Cost indicator */}
          <rect x="280" y="0" width="240" height="50" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="400" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="11" fill={COLORS.dark}>
            {decision === 'strong' ? '成本: $0.03/1K tokens' : '成本: $0.0002/1K tokens'}
          </text>
          <text x="400" y="38" textAnchor="middle" fontFamily={FONTS.mono}
                fontSize="10" fill={COLORS.mid}>
            {decision === 'weak' ? '节省 99.3% 💰' : '使用最高质量 ⭐'}
          </text>
        </g>

        {/* Note about threshold */}
        <g transform="translate(30, 305)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            阈值 τ 可调：降低 τ → 更多 query 用强模型（质量↑ 成本↑）· 提高 τ → 更多用弱模型（质量↓ 成本↓）
          </text>
        </g>
      </svg>

      {/* Threshold slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">阈值 τ:</span>
        <input type="range" min="0" max="100" value={threshold * 100}
               onChange={e => setThreshold(Number(e.target.value) / 100)}
               className="w-48 accent-blue-700" />
        <span className="text-sm font-mono text-gray-600">{threshold.toFixed(2)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/interactive/MatrixFactorizationViz.tsx src/components/interactive/BertRouterFlow.tsx
git commit -m "feat: add MatrixFactorizationViz and BertRouterFlow components"
```

---

### Task 9: CausalLMRouter + SemanticRoutingViz + DecisionBoundaryCompare 组件

**Files:**
- Create: `src/components/interactive/CausalLMRouter.tsx`
- Create: `src/components/interactive/SemanticRoutingViz.tsx`
- Create: `src/components/interactive/DecisionBoundaryCompare.tsx`

- [ ] **Step 1: 创建 CausalLMRouter**

对比流程组件，展示小 LM 做分类 vs 做生成的区别。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'classify' | 'generate';

export default function CausalLMRouter() {
  const [mode, setMode] = useState<Mode>('classify');

  const W = 580, H = 340;

  const classifySteps = [
    { label: 'Query', text: '"解释量子纠缠"', x: 20 },
    { label: 'Prompt 模板', text: '"判断此 query 需要\n强模型还是弱模型: "', x: 135 },
    { label: 'Qwen-2.5-3B', text: '小 LM 做分类', x: 270 },
    { label: '输出: "strong"', text: 'P(strong)=0.87', x: 400 },
  ];

  const generateSteps = [
    { label: 'Query', text: '"解释量子纠缠"', x: 20 },
    { label: '直接输入', text: '"解释量子纠缠"', x: 135 },
    { label: 'Qwen-2.5-3B', text: '小 LM 做生成', x: 270 },
    { label: '输出: 回答', text: '可能质量不足...', x: 400 },
  ];

  const steps = mode === 'classify' ? classifySteps : generateSteps;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Causal LM Router: 分类 vs 生成
        </text>

        {/* Mode toggle */}
        <g transform="translate(180, 40)">
          {(['classify', 'generate'] as Mode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 120} y="0" width="110" height="28" rx="4"
                    fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
              <text x={i * 120 + 55} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="12"
                    fontWeight={mode === m ? "700" : "400"}
                    fill={mode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {m === 'classify' ? '✓ 做路由分类' : '✗ 直接生成'}
              </text>
            </g>
          ))}
        </g>

        {/* Flow */}
        {steps.map((s, i) => (
          <g key={i} transform={`translate(${s.x}, 90)`}>
            <rect x="0" y="0" width="105" height="60" rx="6"
                  fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="52.5" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {s.label}
            </text>
            <text x="52.5" y="42" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="9" fill={COLORS.mid}>
              {s.text.split('\n')[0]}
            </text>
            {s.text.split('\n')[1] && (
              <text x="52.5" y="54" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={COLORS.mid}>
                {s.text.split('\n')[1]}
              </text>
            )}
            {i < steps.length - 1 && (
              <text x="110" y="30" fontFamily={FONTS.sans} fontSize="18" fill={COLORS.primary}>→</text>
            )}
          </g>
        ))}

        {/* Comparison box */}
        <g transform="translate(30, 170)">
          <rect x="0" y="0" width="520" height="150" rx="6"
                fill={mode === 'classify' ? COLORS.valid : COLORS.waste}
                stroke={mode === 'classify' ? COLORS.green : COLORS.red}
                strokeWidth="2" />
          {mode === 'classify' ? (
            <>
              <text x="20" y="25" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.green}>
                ✓ 分类模式 — Small Models as Routers (2026)
              </text>
              <text x="20" y="48" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 用 1-4B 参数小模型做路由判断，78.3% 准确率
              </text>
              <text x="20" y="66" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 推理成本极低（zero-marginal-cost：已部署的模型顺便做分类）
              </text>
              <text x="20" y="84" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 语义理解能力远强于 BERT，可理解复杂 query 结构
              </text>
              <text x="20" y="102" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 可本地部署，无需额外 API 调用
              </text>
              <text x="20" y="125" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                关键优势：把 "路由判断" 转化为 "文本分类"，复用 LM 的语言理解能力
              </text>
            </>
          ) : (
            <>
              <text x="20" y="25" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.red}>
                ✗ 生成模式 — 直接用小模型回答
              </text>
              <text x="20" y="48" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 小模型（3B）直接回答复杂问题，质量可能不够
              </text>
              <text x="20" y="66" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 无法知道自己"不够好"——缺乏自我评估能力
              </text>
              <text x="20" y="84" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 生成成本高于分类（需要完整回答 vs 一个 token 判断）
              </text>
              <text x="20" y="102" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 如果错了，用户得到低质量回答，还浪费了时间
              </text>
              <text x="20" y="125" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                核心问题：小模型擅长"判断难度"而非"解决难题"
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 SemanticRoutingViz**

2D embedding 空间组件，展示 query 点与 route 模板区域的 cosine 相似度。

```tsx
import React, { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Route {
  name: string;
  templates: string[];
  center: [number, number]; // 2D position
  radius: number;
  color: string;
  model: string;
}

const ROUTES: Route[] = [
  { name: '简单问答', templates: ['"什么是..."', '"...是什么意思"', '"定义..."'], center: [0.2, 0.8], radius: 0.15, color: COLORS.green, model: 'Llama-8B' },
  { name: '翻译任务', templates: ['"翻译..."', '"translate..."', '"...怎么说"'], center: [0.15, 0.35], radius: 0.12, color: '#00838f', model: 'Llama-8B' },
  { name: '代码生成', templates: ['"写一个..."', '"实现..."', '"...代码"'], center: [0.6, 0.6], radius: 0.14, color: COLORS.orange, model: 'Llama-70B' },
  { name: '深度分析', templates: ['"分析..."', '"比较..."', '"评估..."'], center: [0.8, 0.3], radius: 0.16, color: COLORS.red, model: 'GPT-4' },
];

const TEST_QUERIES = [
  { text: '"HTTP 是什么"', pos: [0.22, 0.78] as [number, number] },
  { text: '"写一个排序算法"', pos: [0.58, 0.55] as [number, number] },
  { text: '"分析中美贸易关系"', pos: [0.75, 0.28] as [number, number] },
  { text: '"翻译这段话"', pos: [0.17, 0.38] as [number, number] },
];

export default function SemanticRoutingViz() {
  const [activeQuery, setActiveQuery] = useState(0);

  const W = 580, H = 400;
  const plotL = 30, plotT = 60, plotSize = 300;

  const q = TEST_QUERIES[activeQuery];
  // Find closest route
  const distances = ROUTES.map(r => {
    const dx = q.pos[0] - r.center[0];
    const dy = q.pos[1] - r.center[1];
    return Math.sqrt(dx * dx + dy * dy);
  });
  const closestIdx = distances.indexOf(Math.min(...distances));
  const closestRoute = ROUTES[closestIdx];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Semantic Routing: Embedding 空间匹配
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          无需训练：预定义 route 模板 + cosine 相似度匹配
        </text>

        {/* 2D embedding space */}
        <rect x={plotL} y={plotT} width={plotSize} height={plotSize}
              fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

        {/* Route regions */}
        {ROUTES.map((r, i) => (
          <g key={r.name}>
            <circle cx={plotL + r.center[0] * plotSize}
                    cy={plotT + (1 - r.center[1]) * plotSize}
                    r={r.radius * plotSize}
                    fill={r.color} opacity="0.12"
                    stroke={r.color} strokeWidth="1.5" strokeDasharray="4,3" />
            <text x={plotL + r.center[0] * plotSize}
                  y={plotT + (1 - r.center[1]) * plotSize + 4}
                  textAnchor="middle" fontFamily={FONTS.sans} fontSize="10"
                  fontWeight="600" fill={r.color}>
              {r.name}
            </text>
          </g>
        ))}

        {/* Query point */}
        <circle cx={plotL + q.pos[0] * plotSize}
                cy={plotT + (1 - q.pos[1]) * plotSize}
                r="8" fill={COLORS.dark} stroke="#fff" strokeWidth="2" />
        <text x={plotL + q.pos[0] * plotSize + 12}
              y={plotT + (1 - q.pos[1]) * plotSize + 4}
              fontFamily={FONTS.sans} fontSize="9" fontWeight="700" fill={COLORS.dark}>
          Query
        </text>

        {/* Connection to matched route */}
        <line x1={plotL + q.pos[0] * plotSize}
              y1={plotT + (1 - q.pos[1]) * plotSize}
              x2={plotL + closestRoute.center[0] * plotSize}
              y2={plotT + (1 - closestRoute.center[1]) * plotSize}
              stroke={closestRoute.color} strokeWidth="2" strokeDasharray="5,3" />

        {/* Query selector */}
        <g transform={`translate(350, 65)`}>
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            选择 Query:
          </text>
          {TEST_QUERIES.map((tq, i) => (
            <g key={i} transform={`translate(0, ${10 + i * 30})`}
               onClick={() => setActiveQuery(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="200" height="24" rx="4"
                    fill={activeQuery === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="100" y="16" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10"
                    fill={activeQuery === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {tq.text}
              </text>
            </g>
          ))}

          {/* Route result */}
          <g transform="translate(0, 145)">
            <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
              匹配结果:
            </text>
            <rect x="0" y="8" width="200" height="48" rx="4"
                  fill={COLORS.valid} stroke={closestRoute.color} strokeWidth="1.5" />
            <text x="10" y="28" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={closestRoute.color}>
              {closestRoute.name} → {closestRoute.model}
            </text>
            <text x="10" y="46" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
              cosine distance: {distances[closestIdx].toFixed(3)}
            </text>
          </g>

          {/* Advantages */}
          <g transform="translate(0, 220)">
            <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.green}>✓ 无需训练数据</text>
            <text x="0" y="16" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.green}>✓ ~5ms 延迟</text>
            <text x="0" y="32" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.red}>✗ 粒度粗，依赖模板</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: 创建 DecisionBoundaryCompare**

并排对比组件，展示 4 种 router 在同一组 query 上的决策边界差异。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// Test queries with "difficulty" and "specificity" as 2D axes
const QUERIES = [
  { label: '翻译 hello', diff: 10, spec: 80, expected: 'weak' },
  { label: '写诗', diff: 30, spec: 40, expected: 'weak' },
  { label: '解释 GAN', diff: 60, spec: 70, expected: 'strong' },
  { label: '分析论文', diff: 80, spec: 50, expected: 'strong' },
  { label: '代码优化', diff: 70, spec: 90, expected: 'strong' },
  { label: '聊天问候', diff: 5, spec: 20, expected: 'weak' },
  { label: '数学证明', diff: 95, spec: 85, expected: 'strong' },
  { label: '总结新闻', diff: 40, spec: 60, expected: 'weak' },
];

// Simulated decision boundaries (threshold on "difficulty" axis, varies by method)
const ROUTERS = [
  { name: 'MF Router', threshold: 50, accuracy: '95%', note: '偏好数据学评分', color: '#1565c0' },
  { name: 'BERT Router', threshold: 55, accuracy: '93%', note: '固定决策边界', color: '#2e7d32' },
  { name: 'Causal LM', threshold: 45, accuracy: '92%', note: '更保守（倾向强模型）', color: '#e65100' },
  { name: 'Semantic', threshold: 60, accuracy: '85%', note: '更激进（倾向弱模型）', color: '#6a1b9a' },
];

export default function DecisionBoundaryCompare() {
  const [hoveredRouter, setHoveredRouter] = useState<number | null>(null);

  const W = 580, H = 380;
  const cellW = 125, cellH = 260;
  const startX = 30, startY = 50;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          四种 Router 决策边界对比
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          相同 query 集，不同 router 的强/弱模型判定差异
        </text>

        {ROUTERS.map((router, ri) => {
          const rx = startX + ri * (cellW + 10);
          return (
            <g key={router.name} transform={`translate(${rx}, ${startY})`}
               onMouseEnter={() => setHoveredRouter(ri)}
               onMouseLeave={() => setHoveredRouter(null)}>
              {/* Router header */}
              <rect x="0" y="0" width={cellW} height="30" rx="4"
                    fill={router.color} />
              <text x={cellW / 2} y="20" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill="#fff">
                {router.name}
              </text>

              {/* Query decisions */}
              {QUERIES.map((q, qi) => {
                const decision = q.diff > router.threshold ? 'strong' : 'weak';
                const correct = decision === q.expected;
                return (
                  <g key={qi} transform={`translate(0, ${35 + qi * 27})`}>
                    <rect x="0" y="0" width={cellW} height="23" rx="3"
                          fill={decision === 'strong' ? COLORS.waste : COLORS.valid}
                          stroke={correct ? 'transparent' : COLORS.red}
                          strokeWidth={correct ? 0 : 2} />
                    <text x="5" y="15" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.dark}>
                      {q.label}
                    </text>
                    <text x={cellW - 5} y="15" textAnchor="end"
                          fontFamily={FONTS.mono} fontSize="9"
                          fill={decision === 'strong' ? COLORS.red : COLORS.green}>
                      {decision === 'strong' ? '强' : '弱'}
                    </text>
                  </g>
                );
              })}

              {/* Accuracy */}
              <text x={cellW / 2} y={35 + QUERIES.length * 27 + 15} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10" fontWeight="600" fill={router.color}>
                准确率: {router.accuracy}
              </text>
            </g>
          );
        })}

        {/* Hover detail */}
        {hoveredRouter !== null && (
          <g transform={`translate(30, ${startY + cellH + 25})`}>
            <rect x="0" y="0" width="520" height="28" rx="4"
                  fill={COLORS.bgAlt} stroke={ROUTERS[hoveredRouter].color} strokeWidth="1" />
            <text x="10" y="18" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {ROUTERS[hoveredRouter].name}: {ROUTERS[hoveredRouter].note}
              · 阈值={ROUTERS[hoveredRouter].threshold} · 红色边框=判断错误
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add src/components/interactive/CausalLMRouter.tsx src/components/interactive/SemanticRoutingViz.tsx src/components/interactive/DecisionBoundaryCompare.tsx
git commit -m "feat: add CausalLMRouter, SemanticRoutingViz, DecisionBoundaryCompare components"
```

---

### Task 10: 第2篇文章 MDX — routing-classifiers

**Files:**
- Create: `src/content/articles/zh/routing-classifiers.mdx`

- [ ] **Step 1: 创建文章文件**

按照设计文档的内容骨架，写完整的第2篇文章。

frontmatter:
```yaml
---
title: "路由分类器：让小模型决定谁来回答"
slug: routing-classifiers
locale: zh
tags: [model-routing, classifier, matrix-factorization, bert, semantic-routing]
difficulty: advanced
prerequisites: [model-routing-landscape]
created: "2026-04-06"
updated: "2026-04-06"
references:
  - type: paper
    title: "RouteLLM: Learning to Route LLMs with Preference Data"
    url: "https://arxiv.org/abs/2406.18665"
  - type: paper
    title: "Small Models, Big Decisions: Language Models as Routers"
    url: "https://arxiv.org/abs/2604.02367"
  - type: website
    title: "semantic-router: Superfast Decision-Making Layer"
    url: "https://github.com/aurelio-labs/semantic-router"
---
```

imports:
```mdx
import MatrixFactorizationViz from '../../../components/interactive/MatrixFactorizationViz.tsx';
import BertRouterFlow from '../../../components/interactive/BertRouterFlow.tsx';
import CausalLMRouter from '../../../components/interactive/CausalLMRouter.tsx';
import SemanticRoutingViz from '../../../components/interactive/SemanticRoutingViz.tsx';
import DecisionBoundaryCompare from '../../../components/interactive/DecisionBoundaryCompare.tsx';
```

**内容骨架**（按设计文档 §1-§5）：

**简介**：分类器路由——训练一个分类器判断"这个 query 需要强模型吗？"

**§1 偏好数据与 Matrix Factorization**
- Chatbot Arena 人类偏好数据
- MF 将 query 和 model 映射到同一向量空间
- RouteLLM 的 MF router：85% 成本降低
- `<MatrixFactorizationViz client:visible />`

**§2 BERT Router**
- 微调 BERT 做二分类
- 训练数据构造
- `<BertRouterFlow client:visible />`

**§3 Causal LM Router**
- Small Models as Routers (2026)
- 78.3% 路由准确率
- `<CausalLMRouter client:visible />`

**§4 Semantic Routing**
- 无需训练
- `<SemanticRoutingViz client:visible />`

**§5 决策边界对比**
- `<DecisionBoundaryCompare client:visible />`

- [ ] **Step 2: 运行验证 + 预览**

Run: `npm run validate && npm run dev`

- [ ] **Step 3: 提交**

```bash
git add src/content/articles/zh/routing-classifiers.mdx
git commit -m "feat: add Article 2 - Routing classifiers"
```
