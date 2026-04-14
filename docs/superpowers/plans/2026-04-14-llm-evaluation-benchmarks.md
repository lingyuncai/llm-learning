# LLM 评估与 Benchmark 深度解析 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a 7-article learning path with 13 interactive components covering LLM benchmark methodology, specific benchmark deep dives, optimization accuracy measurement, and model selection.

**Architecture:** Each article follows "问题驱动 → 全景概览 → 深潜 1-2 个 benchmark → 实践要点 → 过渡" pattern. Components use React + SVG with Motion animations, inline i18n, shared color tokens from `./shared/colors`. All benchmark data marked [待验证] in the spec requires web search verification during implementation.

**Tech Stack:** Astro 5 + MDX, React, TypeScript, Motion (`motion/react`), D3.js, SVG, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-14-llm-benchmark-design.md`

---

## File Structure

### New Files (21)

**Learning Path:**
- `src/content/paths/llm-evaluation-benchmarks.yaml` — path definition with 7 article slugs

**Components (13):**

| # | File | Art. | Type |
|---|------|------|------|
| 1 | `src/components/interactive/BenchmarkTaxonomy.tsx` | 1 | Filterable card browser (高) |
| 2 | `src/components/interactive/EvalProtocolFlow.tsx` | 1 | Tabbed horizontal pipeline (中) |
| 3 | `src/components/interactive/ReasoningBenchmarkMap.tsx` | 2 | Scatter plot (中) |
| 4 | `src/components/interactive/MMLUProEvalDemo.tsx` | 2 | Card-based flow (中) |
| 5 | `src/components/interactive/CodeBenchmarkEvolution.tsx` | 3 | Timeline (中) |
| 6 | `src/components/interactive/SWEbenchFlow.tsx` | 3 | Vertical waterfall (中) |
| 7 | `src/components/interactive/AgentCapabilityRadar.tsx` | 4 | Radar chart (中) |
| 8 | `src/components/interactive/BFCLEvalFlow.tsx` | 4 | Left-right panels (中) |
| 9 | `src/components/interactive/ModelBenchmarkMatrix.tsx` | 5 | Heatmap matrix (高) |
| 10 | `src/components/interactive/QuantDegradationExplorer.tsx` | 6 | Bar + heatmap (高) |
| 11 | `src/components/interactive/EvalToolchainComparison.tsx` | 6 | Comparison cards (低) |
| 12 | `src/components/interactive/PerplexityVsTaskAccuracy.tsx` | 6 | Dual-axis chart (中) |
| 13 | `src/components/interactive/ModelSelectionDecisionTree.tsx` | 7 | Decision flow (中) |

**Articles (7):**

| # | File | Slug |
|---|------|------|
| 1 | `src/content/articles/zh/benchmark-landscape.mdx` | `benchmark-landscape` |
| 2 | `src/content/articles/zh/reasoning-benchmarks.mdx` | `reasoning-benchmarks` |
| 3 | `src/content/articles/zh/code-benchmarks.mdx` | `code-benchmarks` |
| 4 | `src/content/articles/zh/agent-benchmarks.mdx` | `agent-benchmarks` |
| 5 | `src/content/articles/zh/benchmark-standard-set.mdx` | `benchmark-standard-set` |
| 6 | `src/content/articles/zh/optimization-accuracy.mdx` | `optimization-accuracy` |
| 7 | `src/content/articles/zh/leaderboard-model-selection.mdx` | `leaderboard-model-selection` |

### Modified Files (1)

- `src/content/articles/zh/model-routing-landscape.mdx` — add opening reference to this learning path

---

## Component Conventions

All 13 components follow these patterns (from CLAUDE.md + existing codebase):

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

export default function ComponentName({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  // inline i18n
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  // state, data, rendering...
}
```

- SVG dimensions: use const `W` / `H` at top of file
- Colors: import from `./shared/colors`, use `COLORS.primary`, `COLORS.green`, etc.
- Animation: `import { motion } from 'motion/react'`
- In MDX: `<ComponentName client:visible />`
- No external state dependencies — all data inline

---

## Task 1: Foundation — Learning Path YAML

**Files:**
- Create: `src/content/paths/llm-evaluation-benchmarks.yaml`

- [ ] **Step 1: Create learning path YAML**

```yaml
id: llm-evaluation-benchmarks
order: 7
title:
  zh: "LLM 评估与 Benchmark 深度解析"
  en: "LLM Evaluation and Benchmarks Deep Dive"
description:
  zh: >-
    系统化理解 LLM 评估体系：从 benchmark 设计原理到具体 benchmark 深入剖析，
    从量化优化的精度评估方法到模型选型决策。覆盖知识推理、代码、Agent 与 Tool Use
    等维度，重点关注 OpenVINO 工具链和小模型评估。
  en: >-
    Systematic understanding of LLM evaluation: from benchmark design principles
    to specific benchmark deep dives, from optimization accuracy assessment to
    model selection decisions. Covers knowledge, reasoning, code, and agent
    evaluation with focus on OpenVINO toolchain and small model assessment.
level: intermediate
articles:
  - benchmark-landscape
  - reasoning-benchmarks
  - code-benchmarks
  - agent-benchmarks
  - benchmark-standard-set
  - optimization-accuracy
  - leaderboard-model-selection
```

- [ ] **Step 2: Validate**

```bash
npm run validate
```

Expected: validation may produce warnings about missing article slugs (articles aren't created yet). The YAML itself should parse correctly. Warnings about unresolved article references are expected and will resolve as Tasks 2-8 create the articles.

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/llm-evaluation-benchmarks.yaml
git commit -m "feat(eval-benchmarks): add learning path YAML definition"
```

---

## Task 2: Art.1 — Benchmark 全景与评估方法论

**Files:**
- Create: `src/components/interactive/BenchmarkTaxonomy.tsx`
- Create: `src/components/interactive/EvalProtocolFlow.tsx`
- Create: `src/content/articles/zh/benchmark-landscape.mdx`

### Component 2a: BenchmarkTaxonomy

**What it does:** Filterable benchmark card browser. Three filter dimensions: 能力维度 (knowledge/reasoning/code/agent/preference), 评估方式 (exact_match/execution/llm_judge/human_eval), 更新策略 (static/dynamic). Each benchmark renders as a card showing name, year, dataset size, eval method, SOTA score range. Click to expand details.

**[🔍 WEB SEARCH]** Before implementing, verify for each benchmark listed in the spec Art.1:
- Dataset size (number of questions/problems)
- Current SOTA score range
- Paper publication year
- Original paper URL

- [ ] **Step 1: Create BenchmarkTaxonomy.tsx**

```tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type Category = 'knowledge' | 'reasoning' | 'code' | 'agent' | 'preference';
type EvalMethod = 'exact_match' | 'execution' | 'llm_judge' | 'human_eval' | 'elo';
type UpdateStrategy = 'static' | 'dynamic';

interface BenchmarkCard {
  name: string;
  year: number;
  category: Category;
  evalMethod: EvalMethod;
  updateStrategy: UpdateStrategy;
  datasetSize: string;       // e.g. "57 subjects, ~15k questions"
  sotaRange: string;         // e.g. ">90% (frontier)"
  description: { zh: string; en: string };
  keyFeature: { zh: string; en: string };
  paperUrl?: string;
}

// [🔍 WEB SEARCH] All data below must be verified against official sources
const BENCHMARKS: BenchmarkCard[] = [
  {
    name: 'MMLU',
    year: 2021,
    category: 'knowledge',
    evalMethod: 'exact_match',
    updateStrategy: 'static',
    datasetSize: '57 subjects, ~15,000 questions',  // [verify]
    sotaRange: '>90%',                                // [verify]
    description: {
      zh: '57 学科知识多选题，长期作为通用知识基准。已接近饱和。',
      en: '57-subject multiple choice. Long-standing knowledge benchmark, now near saturation.',
    },
    keyFeature: { zh: '4 选 1，zero/few-shot', en: '4-choice, zero/few-shot' },
  },
  // Implement ALL of the following (same structure as MMLU above):
  // Knowledge: MMLU-Pro (2024, knowledge, exact_match, static)
  // Reasoning: GSM8K (2021, reasoning, exact_match, static),
  //   MATH/MATH-500 (2021, reasoning, exact_match, static),
  //   AIME 2024 (2024, reasoning, exact_match, static),
  //   BBH (2022, reasoning, exact_match, static),
  //   GPQA Diamond (2023, reasoning, exact_match, static),
  //   FrontierMath (2024, reasoning, exact_match, static),
  //   ARC-Challenge (2018, reasoning, exact_match, static),
  //   HellaSwag (2019, reasoning, exact_match, static)
  // Code: HumanEval (2021, code, execution, static),
  //   HumanEval+ (2023, code, execution, static),
  //   SWE-bench (2024, code, execution, static),
  //   LiveCodeBench (2024, code, execution, dynamic),
  //   BigCodeBench (2024, code, execution, static),
  //   MBPP (2021, code, execution, static)
  // Agent: BFCL (2024, agent, execution, dynamic),
  //   GAIA (2023, agent, execution, static),
  //   WebArena (2024, agent, execution, static)
  // Preference: Chatbot Arena (2023, preference, elo, dynamic),
  //   AlpacaEval (2023, preference, llm_judge, static),
  //   MT-Bench (2023, preference, llm_judge, static)
  // Dynamic: LiveBench (2024, reasoning, exact_match, dynamic)
  // Total: ~22 benchmark entries
];

const CATEGORY_LABELS: Record<Category, { zh: string; en: string }> = {
  knowledge: { zh: '知识', en: 'Knowledge' },
  reasoning: { zh: '推理', en: 'Reasoning' },
  code:      { zh: '代码', en: 'Code' },
  agent:     { zh: 'Agent', en: 'Agent' },
  preference:{ zh: '偏好', en: 'Preference' },
};

const EVAL_LABELS: Record<EvalMethod, { zh: string; en: string }> = {
  exact_match: { zh: '精确匹配', en: 'Exact Match' },
  execution:   { zh: '执行验证', en: 'Execution' },
  llm_judge:   { zh: 'LLM-as-Judge', en: 'LLM-as-Judge' },
  human_eval:  { zh: '人类评估', en: 'Human Eval' },
  elo:         { zh: 'ELO 评分', en: 'ELO Rating' },
};

export default function BenchmarkTaxonomy({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedEval, setSelectedEval] = useState<EvalMethod | 'all'>('all');
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateStrategy | 'all'>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return BENCHMARKS.filter(b =>
      (selectedCategory === 'all' || b.category === selectedCategory) &&
      (selectedEval === 'all' || b.evalMethod === selectedEval) &&
      (selectedUpdate === 'all' || b.updateStrategy === selectedUpdate)
    );
  }, [selectedCategory, selectedEval, selectedUpdate]);

  // Render: 3 filter rows (buttons for each dimension) + card grid
  // Each card: colored left border by category, name+year header, badges for eval method
  //            and update strategy, dataset size, SOTA range
  // Expanded card: full description + key feature + paper link
  // Use COLORS.primary for selected filter, COLORS.light for unselected
  // Use motion.div with layout animation for card expand/collapse
  // Total ~200-280 lines
}
```

### Component 2b: EvalProtocolFlow

**What it does:** Horizontal pipeline animation showing evaluation protocols. Tab switcher for: few-shot, CoT, pass@k, LLM-as-Judge. Each tab shows a left-to-right flow: prompt construction → model processing → output → scoring. Animated step-by-step with pause/play.

**Visual style:** Horizontal pipeline (水平 pipeline 风格) — distinguishes from other flow components.

- [ ] **Step 2: Create EvalProtocolFlow.tsx**

```tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type Protocol = 'few-shot' | 'cot' | 'pass-k' | 'llm-judge';

interface FlowStep {
  label: { zh: string; en: string };
  detail: { zh: string; en: string };
  icon: string; // emoji or SVG path
}

const PROTOCOLS: Record<Protocol, { title: { zh: string; en: string }; steps: FlowStep[] }> = {
  'few-shot': {
    title: { zh: 'Few-Shot 评估', en: 'Few-Shot Evaluation' },
    steps: [
      { label: { zh: '构建 Prompt', en: 'Build Prompt' },
        detail: { zh: '将 k 个示例 + 测试问题拼接', en: 'Concatenate k examples + test question' },
        icon: '📝' },
      { label: { zh: '模型推理', en: 'Model Inference' },
        detail: { zh: '模型根据示例模式生成答案', en: 'Model generates answer following example pattern' },
        icon: '🤖' },
      { label: { zh: '提取答案', en: 'Extract Answer' },
        detail: { zh: '从生成文本中解析出最终答案', en: 'Parse final answer from generated text' },
        icon: '🔍' },
      { label: { zh: '评分', en: 'Score' },
        detail: { zh: '与 ground truth 精确匹配', en: 'Exact match against ground truth' },
        icon: '✅' },
    ],
  },
  'cot': {
    title: { zh: 'Chain-of-Thought', en: 'Chain-of-Thought' },
    steps: [
      { label: { zh: '构建 CoT Prompt', en: 'Build CoT Prompt' },
        detail: { zh: '添加 "Let\'s think step by step" 或示例推理链', en: 'Add "Let\'s think step by step" or example reasoning chains' },
        icon: '📝' },
      { label: { zh: '模型推理', en: 'Model Reasoning' },
        detail: { zh: '模型先输出推理过程，再给出答案', en: 'Model outputs reasoning process, then answer' },
        icon: '💭' },
      { label: { zh: '提取最终答案', en: 'Extract Final Answer' },
        detail: { zh: '从推理链末尾提取答案（忽略中间步骤）', en: 'Extract answer from end of reasoning chain' },
        icon: '🔍' },
      { label: { zh: '评分', en: 'Score' },
        detail: { zh: '与 ground truth 匹配', en: 'Match against ground truth' },
        icon: '✅' },
    ],
  },
  'pass-k': {
    title: { zh: 'pass@k (代码评估)', en: 'pass@k (Code Eval)' },
    steps: [
      { label: { zh: '输入函数签名', en: 'Input Signature' },
        detail: { zh: '函数签名 + docstring 作为 prompt', en: 'Function signature + docstring as prompt' },
        icon: '📝' },
      { label: { zh: '生成 k 个候选', en: 'Generate k Samples' },
        detail: { zh: '采样 k 次，每次生成一个完整函数体', en: 'Sample k times, each generating a complete function body' },
        icon: '🔄' },
      { label: { zh: '沙箱执行', en: 'Sandbox Execution' },
        detail: { zh: '每个候选在隔离环境中运行测试用例', en: 'Run test cases for each candidate in sandbox' },
        icon: '🧪' },
      { label: { zh: '计算 pass@k', en: 'Compute pass@k' },
        detail: { zh: 'k 个中至少 1 个通过所有测试 = pass', en: 'At least 1 of k passes all tests = pass' },
        icon: '📊' },
    ],
  },
  'llm-judge': {
    title: { zh: 'LLM-as-Judge', en: 'LLM-as-Judge' },
    steps: [
      { label: { zh: '收集模型输出', en: 'Collect Outputs' },
        detail: { zh: '被评估模型对 prompt 生成回答', en: 'Evaluated model generates response to prompt' },
        icon: '📝' },
      { label: { zh: '构建评估 Prompt', en: 'Build Eval Prompt' },
        detail: { zh: '将原始问题 + 模型回答 + 评分标准发给 Judge 模型', en: 'Send question + response + rubric to judge model' },
        icon: '📋' },
      { label: { zh: 'Judge 评分', en: 'Judge Scoring' },
        detail: { zh: '强模型（如 GPT-4）评估回答质量，给出分数或排名', en: 'Strong model (e.g. GPT-4) evaluates quality, gives score or ranking' },
        icon: '⚖️' },
      { label: { zh: '汇总', en: 'Aggregate' },
        detail: { zh: '多次评估取平均 / 计算胜率', en: 'Average multiple evaluations / compute win rate' },
        icon: '📊' },
    ],
  },
};

export default function EvalProtocolFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [activeProtocol, setActiveProtocol] = useState<Protocol>('few-shot');
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Render: tab bar at top → horizontal pipeline below
  // Pipeline: boxes connected by arrows, left to right
  // Active step highlighted with COLORS.highlight, completed steps with COLORS.green
  // Each step box shows icon + label, detail appears below on hover/active
  // Auto-play advances steps every 2s, pause button
  // SVG-based with motion animations for step transitions
  // Total ~180-240 lines
}
```

### Article 2c: benchmark-landscape.mdx

**[🔍 WEB SEARCH]** Before writing, verify:
- lm-eval-harness GitHub stars count, supported task count
- LLM-as-Judge correlation with human eval (>0.8 claim)
- LLM-as-Judge cost advantage (~100x claim)
- Specific LiveBench/LiveCodeBench update frequencies

- [ ] **Step 3: Create benchmark-landscape.mdx**

Frontmatter:

```yaml
---
title: "Benchmark 全景与评估方法论"
slug: benchmark-landscape
locale: zh
tags: [benchmark, evaluation, methodology, llm-as-judge, contamination]
difficulty: intermediate
created: "2026-04-14"
updated: "2026-04-14"
references:
  # [🔍 WEB SEARCH] verify all URLs during implementation
  - type: paper
    title: "Measuring Massive Multitask Language Understanding (MMLU)"
    url: "https://arxiv.org/abs/2009.03300"
  - type: website
    title: "lm-evaluation-harness"
    url: "https://github.com/EleutherAI/lm-evaluation-harness"
  - type: paper
    title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"
    url: "https://arxiv.org/abs/2306.05685"
  - type: website
    title: "LiveBench"
    url: "[🔍 verify URL]"
---
```

Imports:

```mdx
import BenchmarkTaxonomy from '../../../components/interactive/BenchmarkTaxonomy.tsx';
import EvalProtocolFlow from '../../../components/interactive/EvalProtocolFlow.tsx';
```

**Content outline** (follow spec Art.1 section by section):

1. **开篇问题**: "面对几十个 benchmark 和各种评分，我该从哪里开始理解？"
2. **Benchmark 分类体系**: 三个维度 (能力/评估方式/更新策略)，插入 `<BenchmarkTaxonomy client:visible />`
3. **评估协议详解**: Zero-shot vs few-shot, CoT, pass@k, Majority voting — 插入 `<EvalProtocolFlow client:visible />`
4. **核心度量指标**: Accuracy, Perplexity, ELO, pass@k, F1/ROUGE
5. **LLM-as-Judge 专节**: 什么是、应用场景、与人类评估一致性、已知偏差、成本优势
6. **数据污染专节**: 什么是 contamination、如何发生、检测方法、动态 benchmark 的应对
7. **关键工具简介 lm-eval-harness**: 定位、重要性、核心概念、关键认知 (简要，详见 Art.6)
8. **推荐学习资源**: 经典论文（MMLU 原始论文、Judging LLM-as-a-Judge）/ 课程（Stanford CS324 Evaluation 章节）/ 工具（lm-eval-harness GitHub、Open LLM Leaderboard）/ 社区资源（与现有 7 条路径首篇格式一致）
9. **过渡**: 引导读者根据兴趣选择 Art.2 (推理)、Art.3 (代码)、Art.4 (Agent)

- [ ] **Step 4: Validate and verify**

```bash
npm run validate
npm run dev
# Open browser → navigate to /zh/articles/benchmark-landscape
# Verify: article renders, components interactive, no console errors
```

- [ ] **Step 5: Commit**

```bash
git add src/components/interactive/BenchmarkTaxonomy.tsx \
        src/components/interactive/EvalProtocolFlow.tsx \
        src/content/articles/zh/benchmark-landscape.mdx
git commit -m "feat(eval-benchmarks): add Art.1 benchmark landscape with 2 components"
```

---

## Task 3: Art.2 — 知识与推理 Benchmark

**Files:**
- Create: `src/components/interactive/ReasoningBenchmarkMap.tsx`
- Create: `src/components/interactive/MMLUProEvalDemo.tsx`
- Create: `src/content/articles/zh/reasoning-benchmarks.mdx`

### Component 3a: ReasoningBenchmarkMap

**What it does:** Scatter plot showing reasoning benchmarks' difficulty vs saturation lifecycle. X-axis = publication year, Y-axis = current best model score (higher = more saturated), bubble size = adoption frequency (how many model releases report it). Hover shows benchmark details.

**[🔍 WEB SEARCH]** Before implementing, verify for each reasoning benchmark:
- Publication year
- Current frontier model best score
- Approximate number of recent model releases reporting this benchmark

- [ ] **Step 1: Create ReasoningBenchmarkMap.tsx**

```tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface ReasoningBenchmark {
  name: string;
  year: number;
  bestScore: number;        // 0-100, current frontier SOTA
  adoptionFreq: number;     // 1-10 scale, how widely reported
  category: 'knowledge' | 'reasoning' | 'math';
  description: { zh: string; en: string };
  status: { zh: string; en: string }; // e.g. "已饱和" / "高区分度"
}

// [🔍 WEB SEARCH] All scores must be verified
const BENCHMARKS: ReasoningBenchmark[] = [
  { name: 'MMLU', year: 2021, bestScore: 92, adoptionFreq: 10,
    category: 'knowledge',
    description: { zh: '57 学科通用知识，4 选 1', en: '57-subject knowledge, 4-choice' },
    status: { zh: '已饱和', en: 'Saturated' } },
  { name: 'MMLU-Pro', year: 2024, bestScore: 78, adoptionFreq: 9,
    category: 'knowledge',
    description: { zh: 'MMLU 升级版，10 选项', en: 'MMLU upgrade, 10 choices' },
    status: { zh: '主力基准', en: 'Primary benchmark' } },
  { name: 'GSM8K', year: 2021, bestScore: 97, adoptionFreq: 8,
    category: 'math',
    description: { zh: '小学数学应用题', en: 'Grade school math' },
    status: { zh: '已饱和', en: 'Saturated' } },
  { name: 'MATH-500', year: 2021, bestScore: 85, adoptionFreq: 7,
    category: 'math',
    description: { zh: '竞赛级数学', en: 'Competition-level math' },
    status: { zh: '仍有区分力', en: 'Still discriminative' } },
  { name: 'AIME 2024', year: 2024, bestScore: 65, adoptionFreq: 8,
    category: 'math',
    description: { zh: '美国数学邀请赛真题', en: 'AMC Invitational Exam' },
    status: { zh: '高区分度', en: 'Highly discriminative' } },
  { name: 'GPQA Diamond', year: 2023, bestScore: 60, adoptionFreq: 9,
    category: 'reasoning',
    description: { zh: '研究生级科学问答', en: 'Graduate-level science QA' },
    status: { zh: '高区分度', en: 'Highly discriminative' } },
  { name: 'BBH', year: 2022, bestScore: 88, adoptionFreq: 6,
    category: 'reasoning',
    description: { zh: '23 个困难推理任务', en: '23 hard reasoning tasks' },
    status: { zh: '仍有区分力', en: 'Still discriminative' } },
  { name: 'FrontierMath', year: 2024, bestScore: 25, adoptionFreq: 3,
    category: 'math',
    description: { zh: '极难数学，目前无模型超 30%', en: 'Extremely hard math, no model >30%' },
    status: { zh: '远未饱和', en: 'Far from saturated' } },
  { name: 'ARC-Challenge', year: 2018, bestScore: 96, adoptionFreq: 5,
    category: 'reasoning',
    description: { zh: '小学科学多步推理', en: 'Grade school science reasoning' },
    status: { zh: '已饱和', en: 'Saturated' } },
  { name: 'HellaSwag', year: 2019, bestScore: 97, adoptionFreq: 4,
    category: 'reasoning',
    description: { zh: '常识推理补全', en: 'Commonsense completion' },
    status: { zh: '已饱和', en: 'Saturated' } },
  // [verify all scores]
];

const CATEGORY_COLORS: Record<string, string> = {
  knowledge: COLORS.primary,
  reasoning: COLORS.purple,
  math: COLORS.orange,
};

export default function ReasoningBenchmarkMap({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [hoveredBenchmark, setHoveredBenchmark] = useState<string | null>(null);

  const W = 600, H = 400;
  const margin = { top: 30, right: 30, bottom: 50, left: 50 };
  // X scale: year 2018-2025, Y scale: 0-100 (best score)
  // Bubble radius: adoptionFreq * 3 + 5
  // Color by category
  // Horizontal dashed line at y=90 labeled "饱和线"
  // Hover tooltip: name, score, description, status
  // Legend for categories
  // Axis labels: X="发布年份", Y="当前最高分 (%)"
  // Total ~180-220 lines
}
```

### Component 3b: MMLUProEvalDemo

**What it does:** Card-based visualization showing an MMLU-Pro 10-choice question with CoT evaluation. Upper section: example question with 10 options (A-J). Lower section: side-by-side comparison of "Direct Answer" path vs "CoT" path, showing how CoT improves accuracy.

**Visual style:** Card-based题目展示 — distinguishes from pipeline-style flows.

- [ ] **Step 2: Create MMLUProEvalDemo.tsx**

```tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Question {
  subject: { zh: string; en: string };
  question: { zh: string; en: string };
  options: string[]; // 10 options A-J
  correctIndex: number;
  directAnswer: {
    selectedIndex: number;
    confidence: number;
  };
  cotReasoning: {
    steps: { zh: string; en: string }[];
    selectedIndex: number;
    confidence: number;
  };
}

// [🔍 WEB SEARCH] Use a representative example (not from actual MMLU-Pro to avoid contamination concerns)
// Create a plausible 10-choice question illustrating the format
const EXAMPLE_QUESTION: Question = {
  subject: { zh: '物理学', en: 'Physics' },
  question: {
    zh: '在自由落体运动中，一个物体从静止开始下落。忽略空气阻力，2秒后物体的速度最接近以下哪个值？',
    en: 'In free fall from rest, ignoring air resistance, which value best approximates the velocity after 2 seconds?',
  },
  options: [
    'A. 5 m/s', 'B. 10 m/s', 'C. 15 m/s', 'D. 20 m/s', 'E. 25 m/s',
    'F. 30 m/s', 'G. 35 m/s', 'H. 40 m/s', 'I. 45 m/s', 'J. 50 m/s',
  ],
  correctIndex: 3, // D. 20 m/s (g ≈ 9.8, v = gt ≈ 19.6 ≈ 20)
  directAnswer: { selectedIndex: 1, confidence: 0.18 }, // wrong — model guesses B
  cotReasoning: {
    steps: [
      { zh: 'g ≈ 9.8 m/s²', en: 'g ≈ 9.8 m/s²' },
      { zh: 'v = g × t = 9.8 × 2 = 19.6 m/s', en: 'v = g × t = 9.8 × 2 = 19.6 m/s' },
      { zh: '19.6 ≈ 20，选 D', en: '19.6 ≈ 20, choose D' },
    ],
    selectedIndex: 3, // correct
    confidence: 0.82,
  },
};

export default function MMLUProEvalDemo({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [showCot, setShowCot] = useState(false);
  const [step, setStep] = useState(0); // 0=question, 1=direct, 2=cot reasoning, 3=cot answer

  // Layout:
  // Top: Question card with subject badge, question text, 10 option buttons
  // Bottom: Two columns — "Direct Answer" | "Chain-of-Thought"
  // Direct: shows selected option (wrong, red border) + low confidence bar
  // CoT: animated step-by-step reasoning, then selected option (correct, green border) + high confidence bar
  // Toggle button to switch between direct and CoT views
  // Confidence shown as horizontal bar (width = confidence %)
  // MMLU-Pro format callout: "10 选项 → 随机猜测概率仅 10%（vs MMLU 的 25%）"
  // Total ~200-250 lines
}
```

### Article 3c: reasoning-benchmarks.mdx

**[🔍 WEB SEARCH]** Before writing, verify:
- MMLU-Pro: exact dataset size, number of subjects, CoT vs direct score gap
- GPQA Diamond: exact question count (~198?), expert human accuracy (~65%?)
- AIME 2024/2025: frontier model scores
- FrontierMath: current best model score (<30%?)
- BBH: number of tasks (23?)

- [ ] **Step 3: Create reasoning-benchmarks.mdx**

Frontmatter:

```yaml
---
title: "知识与推理 Benchmark"
slug: reasoning-benchmarks
locale: zh
tags: [benchmark, reasoning, mmlu, gpqa, math]
prerequisites: [benchmark-landscape]
difficulty: intermediate
created: "2026-04-14"
updated: "2026-04-14"
references:
  # [🔍 WEB SEARCH] verify all URLs
  - type: paper
    title: "MMLU-Pro: A More Robust and Challenging Multi-Task Language Understanding Benchmark"
    url: "[verify]"
  - type: paper
    title: "GPQA: A Graduate-Level Google-Proof Q&A Benchmark"
    url: "[verify]"
  - type: paper
    title: "Measuring Mathematical Problem Solving With the MATH Dataset"
    url: "[verify]"
---
```

Imports:

```mdx
import ReasoningBenchmarkMap from '../../../components/interactive/ReasoningBenchmarkMap.tsx';
import MMLUProEvalDemo from '../../../components/interactive/MMLUProEvalDemo.tsx';
```

**Content outline** (follow spec Art.2):

1. **开篇问题**: "模型说自己推理能力强，到底是怎么测出来的？"
2. **知识类 Benchmark 全景**: MMLU → MMLU-Pro → ARC，各自定位和饱和状态
3. **推理类 Benchmark 全景**: GSM8K → MATH → AIME → BBH → GPQA → FrontierMath，插入 `<ReasoningBenchmarkMap client:visible />`
4. **趋势分析**: benchmark 饱和现象，从简单到困难的演进驱动力
5. **深潜 1: MMLU-Pro** — 选择理由 → 数据集构成 → 评估协议 (5-shot CoT) → CoT vs direct 差异，插入 `<MMLUProEvalDemo client:visible />`
6. **深潜 2: GPQA Diamond** — 选择理由 → 数据集构成 → "为什么难"(对抗验证) → 评估方式
7. **过渡**: 引导到 Art.3 (代码) 或 Art.4 (Agent)

- [ ] **Step 4: Validate and verify**

```bash
npm run validate
npm run dev
# Verify: scatter plot renders with correct data, MMLU-Pro demo interaction works
```

- [ ] **Step 5: Commit**

```bash
git add src/components/interactive/ReasoningBenchmarkMap.tsx \
        src/components/interactive/MMLUProEvalDemo.tsx \
        src/content/articles/zh/reasoning-benchmarks.mdx
git commit -m "feat(eval-benchmarks): add Art.2 reasoning benchmarks with 2 components"
```

---

## Task 4: Art.3 — 代码 Benchmark

**Files:**
- Create: `src/components/interactive/CodeBenchmarkEvolution.tsx`
- Create: `src/components/interactive/SWEbenchFlow.tsx`
- Create: `src/content/articles/zh/code-benchmarks.mdx`

### Component 4a: CodeBenchmarkEvolution

**What it does:** Timeline showing code benchmark evolution from 2021 to 2025. Each node: benchmark name, evaluation method, current SOTA, key innovation. Connections show inheritance relationships (HumanEval → HumanEval+ → EvalPlus, HumanEval → MBPP → BigCodeBench, separate branch for SWE-bench → SWE-bench Verified). Click node to expand details.

**[🔍 WEB SEARCH]** Verify: HumanEval+ test case multiplier (~80x?), SWE-bench Lite/Verified sizes, LiveCodeBench source platforms

- [ ] **Step 1: Create CodeBenchmarkEvolution.tsx**

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface BenchmarkNode {
  id: string;
  name: string;
  year: number;
  evalMethod: { zh: string; en: string };
  sota: string; // e.g. "pass@1 >90%" [verify]
  innovation: { zh: string; en: string };
  details: { zh: string; en: string };
  parentIds: string[]; // predecessor benchmarks
}

// [🔍 WEB SEARCH] verify all SOTA scores and details
const NODES: BenchmarkNode[] = [
  {
    id: 'humaneval',
    name: 'HumanEval',
    year: 2021,
    evalMethod: { zh: '执行验证 (pass@k)', en: 'Execution (pass@k)' },
    sota: 'pass@1 >90%', // [verify]
    innovation: { zh: '定义了 pass@k 范式', en: 'Defined pass@k paradigm' },
    details: { zh: '164 个 Python 函数补全题，OpenAI 2021', en: '164 Python function completions, OpenAI 2021' },
    parentIds: [],
  },
  {
    id: 'mbpp',
    name: 'MBPP',
    year: 2021,
    evalMethod: { zh: '执行验证', en: 'Execution' },
    sota: 'pass@1 >85%', // [verify]
    innovation: { zh: '更广覆盖 (974 题)', en: 'Broader coverage (974 problems)' },
    details: { zh: 'Google 2021，974 个 Python 入门题', en: 'Google 2021, 974 Python beginner problems' },
    parentIds: [],
  },
  {
    id: 'humaneval-plus',
    name: 'HumanEval+',
    year: 2023,
    evalMethod: { zh: '增强执行验证', en: 'Enhanced execution' },
    sota: 'pass@1 ~80%', // [verify]
    innovation: { zh: '~80x 测试用例，暴露假阳性', en: '~80x test cases, exposes false positives' },
    details: { zh: 'EvalPlus 项目，大幅增加测试用例', en: 'EvalPlus project, massively increased test cases' },
    parentIds: ['humaneval'],
  },
  {
    id: 'swe-bench',
    name: 'SWE-bench',
    year: 2024,
    evalMethod: { zh: '真实 repo 测试验证', en: 'Real repo test validation' },
    sota: 'resolved ~50%', // [verify]
    innovation: { zh: '从函数补全到真实 issue 修复', en: 'From function completion to real issue fixing' },
    details: { zh: 'Princeton 2024，真实 GitHub issue 修复', en: 'Princeton 2024, real GitHub issue fixes' },
    parentIds: [],
  },
  {
    id: 'swe-bench-verified',
    name: 'SWE-bench Verified',
    year: 2024,
    evalMethod: { zh: '人工验证子集', en: 'Human-verified subset' },
    sota: 'resolved ~55%', // [verify]
    innovation: { zh: '最权威报告标准', en: 'Most authoritative reporting standard' },
    details: { zh: '人工验证的高质量子集', en: 'Human-verified high-quality subset' },
    parentIds: ['swe-bench'],
  },
  {
    id: 'livecodebench',
    name: 'LiveCodeBench',
    year: 2024,
    evalMethod: { zh: '执行验证 + 动态更新', en: 'Execution + dynamic updates' },
    sota: '[verify]',
    innovation: { zh: '持续引入新竞赛题，抗 contamination', en: 'Continuously adds new competition problems, anti-contamination' },
    details: { zh: '从 LeetCode/Codeforces 等持续引入新题', en: 'Continuously imports from LeetCode/Codeforces' },
    parentIds: [],
  },
  {
    id: 'bigcodebench',
    name: 'BigCodeBench',
    year: 2024,
    evalMethod: { zh: '执行验证', en: 'Execution' },
    sota: '[verify]',
    innovation: { zh: '复杂库调用和 API 场景', en: 'Complex library calls and API scenarios' },
    details: { zh: '真实 API 使用场景，比 HumanEval 更复杂', en: 'Real API usage, more complex than HumanEval' },
    parentIds: ['mbpp'],
  },
];

export default function CodeBenchmarkEvolution({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Layout: horizontal timeline, year markers at top
  // Nodes positioned by year (x) and grouped in rows to avoid overlap
  // Connection lines (SVG paths) from parent to child
  // Each node: rounded rect with name, small eval method badge, SOTA score
  // Selected node expands to show full details + innovation description
  // Color: primary for "active" benchmarks, light gray for "saturated"
  // Total ~200-250 lines
}
```

### Component 4b: SWEbenchFlow

**What it does:** Vertical waterfall/timeline showing SWE-bench evaluation in 5 steps: Issue description → Agent search/locate → Code context understanding → Patch generation → Test validation. Each step expandable for details.

**Visual style:** 垂直瀑布流/时间线 — distinguishes from horizontal pipeline and card-based styles.

- [ ] **Step 2: Create SWEbenchFlow.tsx**

```tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface FlowStep {
  title: { zh: string; en: string };
  subtitle: { zh: string; en: string };
  detail: { zh: string; en: string };
  icon: string;
  color: string;
}

const STEPS: FlowStep[] = [
  {
    title: { zh: '1. Issue 描述输入', en: '1. Issue Description Input' },
    subtitle: { zh: '来自真实 GitHub issue', en: 'From real GitHub issue' },
    detail: {
      zh: 'Agent 接收 issue 标题和描述。不提供代码位置提示——需要自主定位问题。输入还包含完整代码仓库的访问权限。',
      en: 'Agent receives issue title and description. No code location hints — must locate the problem autonomously. Also has access to the full code repository.',
    },
    icon: '📋',
    color: COLORS.primary,
  },
  {
    title: { zh: '2. 搜索与定位', en: '2. Search & Locate' },
    subtitle: { zh: 'Agent 自主探索代码库', en: 'Agent explores codebase autonomously' },
    detail: {
      zh: 'Agent 使用工具（文件搜索、grep、目录浏览等）在仓库中定位相关文件。不同 agent 框架（SWE-agent、OpenDevin、Aider）使用不同搜索策略，这也是分数差异的重要来源。',
      en: 'Agent uses tools (file search, grep, directory listing) to locate relevant files. Different agent harnesses (SWE-agent, OpenDevin, Aider) use different search strategies, which is a major source of score differences.',
    },
    icon: '🔍',
    color: COLORS.orange,
  },
  {
    title: { zh: '3. 代码上下文理解', en: '3. Code Context Understanding' },
    subtitle: { zh: '理解相关代码的逻辑', en: 'Understand the logic of relevant code' },
    detail: {
      zh: '读取相关文件，理解函数调用关系、类继承、数据流。上下文窗口大小在这一步影响显著——能看到更多代码 = 更容易理解问题。',
      en: 'Read relevant files, understand function calls, class inheritance, data flow. Context window size matters significantly here — more visible code = easier to understand the problem.',
    },
    icon: '🧠',
    color: COLORS.purple,
  },
  {
    title: { zh: '4. Patch 生成', en: '4. Patch Generation' },
    subtitle: { zh: '生成 git diff 格式的修复', en: 'Generate fix in git diff format' },
    detail: {
      zh: '生成一个或多个文件的修改（git diff 格式）。需要精确到行号和缩进。可能需要修改多个文件来完成修复。',
      en: 'Generate modifications to one or more files (git diff format). Must be precise to line numbers and indentation. May need to modify multiple files.',
    },
    icon: '🔧',
    color: COLORS.green,
  },
  {
    title: { zh: '5. 测试验证', en: '5. Test Validation' },
    subtitle: { zh: '运行项目原有测试套件', en: 'Run original project test suite' },
    detail: {
      zh: 'Patch 应用到代码库后，运行相关测试。所有测试通过 = resolved。评分指标: resolved rate（成功解决的 issue 占比）。',
      en: 'After applying patch, run relevant tests. All tests pass = resolved. Metric: resolved rate (percentage of successfully resolved issues).',
    },
    icon: '✅',
    color: COLORS.green,
  },
];

export default function SWEbenchFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Layout: vertical timeline, center line with nodes
  // Each step: circle icon on timeline + card to the side
  // Card shows title + subtitle; expands to show detail on click
  // Active step highlighted, completed steps have checkmark
  // Auto-play button advances through steps
  // Connection: vertical line between steps with animated dot traveling down
  // Total ~180-220 lines
}
```

### Article 4c: code-benchmarks.mdx

**[🔍 WEB SEARCH]** Before writing, verify:
- HumanEval: exact number of problems (164), current frontier pass@1
- HumanEval+ test case multiplier, score drop vs HumanEval
- SWE-bench: exact project list (Django, Flask, scikit-learn...), dataset sizes for full/Lite/Verified
- SWE-bench Verified: frontier model resolved rates
- MultiPL-E: number of languages supported
- LiveCodeBench: source platforms and update frequency

- [ ] **Step 3: Create code-benchmarks.mdx**

Frontmatter:

```yaml
---
title: "代码 Benchmark"
slug: code-benchmarks
locale: zh
tags: [benchmark, code, humaneval, swe-bench, pass-at-k]
prerequisites: [benchmark-landscape]
difficulty: intermediate
created: "2026-04-14"
updated: "2026-04-14"
references:
  # [🔍 WEB SEARCH] verify all URLs
  - type: paper
    title: "Evaluating Large Language Models Trained on Code"
    url: "https://arxiv.org/abs/2107.03374"
  - type: paper
    title: "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?"
    url: "[verify]"
  - type: paper
    title: "Is Your Code Generated by ChatGPT Really Correct? (EvalPlus)"
    url: "[verify]"
---
```

Imports:

```mdx
import CodeBenchmarkEvolution from '../../../components/interactive/CodeBenchmarkEvolution.tsx';
import SWEbenchFlow from '../../../components/interactive/SWEbenchFlow.tsx';
```

**Content outline** (follow spec Art.3):

1. **开篇问题**: "模型说自己能写代码，从函数补全到修 GitHub issue，这些能力怎么评估？"
2. **演进脉络**: HumanEval → MBPP → HumanEval+ → SWE-bench → LiveCodeBench → BigCodeBench，插入 `<CodeBenchmarkEvolution client:visible />`
3. **评估方式的分化**: 匹配式 (已淘汰) → 执行验证 (主流) → pass@k 含义与计算
4. **多语言覆盖**: MultiPL-E, Aider Polyglot
5. **深潜 1: HumanEval** — 选择理由 (开山之作+pass@k 范式) → 数据集构成 → 评估流程 → 已知局限 → HumanEval+ 改进
6. **深潜 2: SWE-bench** — 选择理由 (金标准) → 数据集构成 (全集/Lite/Verified) → 评估流程 (插入 `<SWEbenchFlow client:visible />`) → Agent 框架角色 → 已知争议
7. **过渡**: 代码评估与 Agent 评估的交叉 → 引导到 Art.4

- [ ] **Step 4: Validate and verify**

```bash
npm run validate
npm run dev
# Verify: timeline interaction, SWE-bench flow animation, article content
```

- [ ] **Step 5: Commit**

```bash
git add src/components/interactive/CodeBenchmarkEvolution.tsx \
        src/components/interactive/SWEbenchFlow.tsx \
        src/content/articles/zh/code-benchmarks.mdx
git commit -m "feat(eval-benchmarks): add Art.3 code benchmarks with 2 components"
```

---

## Task 5: Art.4 — Agent 与 Tool Use Benchmark

**Files:**
- Create: `src/components/interactive/AgentCapabilityRadar.tsx`
- Create: `src/components/interactive/BFCLEvalFlow.tsx`
- Create: `src/content/articles/zh/agent-benchmarks.mdx`

### Component 5a: AgentCapabilityRadar

**What it does:** Radar chart comparing 2-3 models across agent capability dimensions: function calling accuracy, multi-step task success, planning ability, error recovery, efficiency. Model selector lets user pick which models to compare. Data sourced from public leaderboards.

**[🔍 WEB SEARCH]** Before implementing, verify model scores across BFCL, GAIA, WebArena, τ-bench for representative models (GPT-4o, Claude 3.5, Gemini 1.5, Llama 3.1, Qwen 2.5)

- [ ] **Step 1: Create AgentCapabilityRadar.tsx**

```tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface ModelScores {
  name: string;
  color: string;
  scores: Record<Dimension, number>; // 0-100 normalized
}

type Dimension = 'functionCalling' | 'multiStep' | 'planning' | 'errorRecovery' | 'efficiency';

// Use string[] for multi-line labels — render each item as a <tspan> in SVG <text>
const DIMENSION_LABELS: Record<Dimension, { zh: string[]; en: string[] }> = {
  functionCalling: { zh: ['Function Calling', '准确率'], en: ['Function Calling', 'Accuracy'] },
  multiStep:       { zh: ['多步任务', '成功率'], en: ['Multi-Step', 'Success Rate'] },
  planning:        { zh: ['规划能力'], en: ['Planning', 'Ability'] },
  errorRecovery:   { zh: ['纠错恢复'], en: ['Error', 'Recovery'] },
  efficiency:      { zh: ['效率', '(步骤/token)'], en: ['Efficiency', '(Steps/Tokens)'] },
};

const DIMENSIONS: Dimension[] = ['functionCalling', 'multiStep', 'planning', 'errorRecovery', 'efficiency'];

// [🔍 WEB SEARCH] All scores must be verified from BFCL, GAIA, τ-bench leaderboards
// Dimension mapping to benchmarks:
//   functionCalling → BFCL overall accuracy
//   multiStep → GAIA Level 2-3 success rate
//   planning → Derived from GAIA + τ-bench (no single benchmark; use weighted average)
//   errorRecovery → τ-bench recovery rate (if available) or approximate from GAIA step retries
//   efficiency → Inverse of average steps/tokens in GAIA (lower = better → normalize)
// NOTE: "planning" and "errorRecovery" have no direct 1:1 benchmark source.
// Use best available data and note the approximation in component tooltips.
// Scores are normalized 0-100 for visualization; include source in tooltip
const ALL_MODELS: ModelScores[] = [
  { name: 'GPT-4o', color: '#10a37f',
    scores: { functionCalling: 88, multiStep: 72, planning: 78, errorRecovery: 75, efficiency: 65 } },
  { name: 'Claude 3.5 Sonnet', color: '#d4a574',
    scores: { functionCalling: 85, multiStep: 75, planning: 80, errorRecovery: 78, efficiency: 70 } },
  { name: 'Gemini 1.5 Pro', color: '#4285f4',
    scores: { functionCalling: 82, multiStep: 70, planning: 76, errorRecovery: 72, efficiency: 68 } },
  { name: 'Llama 3.1 70B', color: '#0467df',
    scores: { functionCalling: 75, multiStep: 55, planning: 60, errorRecovery: 58, efficiency: 72 } },
  { name: 'Qwen 2.5 72B', color: '#6f42c1',
    scores: { functionCalling: 78, multiStep: 58, planning: 62, errorRecovery: 55, efficiency: 70 } },
  // [verify all scores — these are illustrative placeholders]
];

export default function AgentCapabilityRadar({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [selectedModels, setSelectedModels] = useState<string[]>(['GPT-4o', 'Claude 3.5 Sonnet']);

  const W = 500, H = 450;
  // Radar chart: 5 axes from center, concentric pentagons for 20/40/60/80/100 levels
  // Each model: filled polygon with semi-transparent fill + solid stroke
  // Model selector: checkboxes above chart (max 3 selected)
  // Hover on axis label: show dimension explanation
  // Hover on polygon vertex: show exact score + source benchmark
  // Legend below chart
  // Total ~220-280 lines
}
```

### Component 5b: BFCLEvalFlow

**What it does:** Left-right comparison panel showing BFCL evaluation flow. Left: input (function definitions in JSON schema + user instruction). Right: output (model-generated function call + verification). Tab switcher for different call categories: simple, multiple, parallel, relevance detection.

**Visual style:** 左右对比面板 — distinguishes from pipeline and waterfall styles.

- [ ] **Step 2: Create BFCLEvalFlow.tsx**

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type CallCategory = 'simple' | 'multiple' | 'parallel' | 'relevance';

interface BFCLExample {
  category: CallCategory;
  categoryLabel: { zh: string; en: string };
  categoryDesc: { zh: string; en: string };
  functions: string; // JSON schema snippet (display as code)
  userQuery: { zh: string; en: string };
  modelOutput: string; // generated function call
  verification: { zh: string; en: string }; // AST match result
  isCorrect: boolean;
}

const EXAMPLES: BFCLExample[] = [
  {
    category: 'simple',
    categoryLabel: { zh: '单函数调用', en: 'Simple Call' },
    categoryDesc: { zh: '给定一个函数，正确填充参数', en: 'Given one function, correctly fill parameters' },
    functions: `{
  "name": "get_weather",
  "parameters": {
    "location": { "type": "string" },
    "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
  }
}`,
    userQuery: { zh: '北京今天天气怎么样？用摄氏度', en: 'What is the weather in Beijing? Use Celsius' },
    modelOutput: `get_weather(location="Beijing", unit="celsius")`,
    verification: { zh: '✅ AST 匹配: 函数名正确，参数类型和值正确', en: '✅ AST match: correct function name, parameter types and values' },
    isCorrect: true,
  },
  {
    category: 'multiple',
    categoryLabel: { zh: '多函数选择', en: 'Multiple Functions' },
    categoryDesc: { zh: '从多个候选函数中选择正确的', en: 'Select correct function from multiple candidates' },
    functions: `[
  { "name": "get_weather", "parameters": { "location": "string" } },
  { "name": "search_flights", "parameters": { "from": "string", "to": "string", "date": "string" } },
  { "name": "book_hotel", "parameters": { "city": "string", "checkin": "string" } }
]`,
    userQuery: { zh: '帮我搜一下明天从北京到上海的航班', en: 'Search flights from Beijing to Shanghai tomorrow' },
    modelOutput: `search_flights(from="Beijing", to="Shanghai", date="2025-01-16")`,
    verification: { zh: '✅ 正确选择 search_flights，参数填充正确', en: '✅ Correctly selected search_flights, parameters correct' },
    isCorrect: true,
  },
  {
    category: 'parallel',
    categoryLabel: { zh: '并行调用', en: 'Parallel Calls' },
    categoryDesc: { zh: '同时调用多个函数', en: 'Call multiple functions simultaneously' },
    functions: `[
  { "name": "get_weather", "parameters": { "location": "string" } },
  { "name": "get_time", "parameters": { "timezone": "string" } }
]`,
    userQuery: { zh: '告诉我东京的天气和当前时间', en: 'Tell me the weather and current time in Tokyo' },
    modelOutput: `[get_weather(location="Tokyo"), get_time(timezone="Asia/Tokyo")]`,
    verification: { zh: '✅ 正确识别需要并行调用两个函数', en: '✅ Correctly identified need for parallel calls' },
    isCorrect: true,
  },
  {
    category: 'relevance',
    categoryLabel: { zh: '相关性检测', en: 'Relevance Detection' },
    categoryDesc: { zh: '判断是否需要调用函数', en: 'Determine whether function call is needed' },
    functions: `{ "name": "get_weather", "parameters": { "location": "string" } }`,
    userQuery: { zh: '给我讲个笑话', en: 'Tell me a joke' },
    modelOutput: `// No function call — respond directly`,
    verification: { zh: '✅ 正确判断无需调用函数（避免过度调用）', en: '✅ Correctly determined no function call needed (avoid over-calling)' },
    isCorrect: true,
  },
];

export default function BFCLEvalFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [activeCategory, setActiveCategory] = useState<CallCategory>('simple');

  // Layout: tabs at top for category selection
  // Below tabs: left-right split panel
  // Left panel: "Input" — function definitions (code block) + user query
  // Right panel: "Output" — model response (code block) + verification result
  // Arrow animation from left to right (→) showing the evaluation flow
  // Category description below tabs
  // Color: green border for correct, red for incorrect
  // Code blocks styled with FONTS.mono, dark background
  // Total ~180-220 lines
}
```

### Article 5c: agent-benchmarks.mdx

**[🔍 WEB SEARCH]** Before writing, verify:
- BFCL: test categories (verify "nested" category exists or not), number of test cases, top model scores
- GAIA: exact question count (~466?), human success rate (~92%?), best AI score (~75%?)
- τ-bench: what it tests exactly, dataset details
- WebArena: website types and task count
- AgentBench: environments covered

- [ ] **Step 3: Create agent-benchmarks.mdx**

Frontmatter:

```yaml
---
title: "Agent 与 Tool Use Benchmark"
slug: agent-benchmarks
locale: zh
tags: [benchmark, agent, function-calling, tool-use, bfcl, gaia]
prerequisites: [benchmark-landscape]
difficulty: intermediate
created: "2026-04-14"
updated: "2026-04-14"
references:
  # [🔍 WEB SEARCH] verify all URLs
  - type: website
    title: "Berkeley Function Calling Leaderboard (BFCL)"
    url: "[verify — gorilla.cs.berkeley.edu]"
  - type: paper
    title: "GAIA: A Benchmark for General AI Assistants"
    url: "[verify]"
  - type: paper
    title: "WebArena: A Realistic Web Environment for Building Autonomous Agents"
    url: "[verify]"
---
```

Imports:

```mdx
import AgentCapabilityRadar from '../../../components/interactive/AgentCapabilityRadar.tsx';
import BFCLEvalFlow from '../../../components/interactive/BFCLEvalFlow.tsx';
```

**Content outline** (follow spec Art.4):

1. **开篇问题**: "模型能调 API、操作浏览器、完成多步骤任务——这些能力怎么系统化评估？"
2. **Agent 能力的层级**: Level 1 (单次 function calling) → Level 2 (多轮 tool use) → Level 3 (自主规划+执行+纠错)
3. **评估维度**: 调用准确率、任务完成率、效率、鲁棒性
4. **主要 Benchmark 一览**: Function Calling 类 (BFCL, Gorilla) / Web Agent 类 (WebArena, VisualWebArena) / 通用 Agent 类 (GAIA, τ-bench, AgentBench, SWE-bench 交叉引用)，插入 `<AgentCapabilityRadar client:visible />`
5. **趋势**: 从"能不能调对一个 API"到"能不能自主完成复杂任务"
6. **深潜 1: BFCL** — 选择理由 → 评估框架 → 测试类别 (simple/multiple/parallel/relevance) → 评分方式 → 已知局限，插入 `<BFCLEvalFlow client:visible />`
7. **深潜 2: GAIA** — 选择理由 → 数据集构成 (3 level) → 评估流程 → "对人简单、对 AI 难"的设计哲学
8. **过渡**: 引导到 Art.5 (模型发布标配) 或 Art.6 (优化精度)

- [ ] **Step 4: Validate and verify**

```bash
npm run validate
npm run dev
# Verify: radar chart renders, BFCL flow panels work, tab switching
```

- [ ] **Step 5: Commit**

```bash
git add src/components/interactive/AgentCapabilityRadar.tsx \
        src/components/interactive/BFCLEvalFlow.tsx \
        src/content/articles/zh/agent-benchmarks.mdx
git commit -m "feat(eval-benchmarks): add Art.4 agent benchmarks with 2 components"
```

---

## Task 6: Art.5 — 模型发布 Benchmark 标配解析

**Files:**
- Create: `src/components/interactive/ModelBenchmarkMatrix.tsx`
- Create: `src/content/articles/zh/benchmark-standard-set.mdx`

### Component 6a: ModelBenchmarkMatrix

**What it does:** Heatmap matrix. Rows = models (grouped into "Frontier" and "小模型" sections), columns = benchmarks (grouped by capability dimension). Color encodes score (green=high, red=low), blank cells = model didn't report this benchmark. Hover shows exact score + source. Toggle between "by capability" and "by model family" views.

**[🔍 WEB SEARCH]** This component requires extensive data collection. Before implementing, gather from each model's official technical report/blog:
- Claude 3.5/4 reported benchmarks and scores
- GPT-4o/o1 reported benchmarks and scores
- Gemini 1.5/2 reported benchmarks and scores
- Llama 3.1/3.3 reported benchmarks and scores
- Gemma 2/4 reported benchmarks and scores
- Phi-3/4 reported benchmarks and scores
- Qwen 2.5/3 reported benchmarks and scores
- Mistral latest reported benchmarks and scores

- [ ] **Step 1: Create ModelBenchmarkMatrix.tsx**

```tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type ModelTier = 'frontier' | 'small';
type BenchCategory = 'knowledge' | 'reasoning' | 'code' | 'agent' | 'preference';

interface BenchmarkColumn {
  id: string;
  name: string;
  category: BenchCategory;
}

interface ModelRow {
  name: string;
  tier: ModelTier;
  family: string; // e.g. 'Claude', 'GPT', 'Gemma'
  params?: string; // e.g. '70B', '9B'
  scores: Record<string, number | null>; // benchmark id → score (null = not reported)
  source: string; // technical report URL
}

const BENCHMARKS: BenchmarkColumn[] = [
  // Knowledge & Reasoning
  { id: 'mmlu-pro', name: 'MMLU-Pro', category: 'knowledge' },
  { id: 'gpqa', name: 'GPQA Diamond', category: 'reasoning' },
  { id: 'math500', name: 'MATH-500', category: 'reasoning' },
  { id: 'aime', name: 'AIME 2024', category: 'reasoning' },
  { id: 'bbh', name: 'BBH', category: 'reasoning' },
  // Code
  { id: 'humaneval', name: 'HumanEval', category: 'code' },
  { id: 'swe-bench', name: 'SWE-bench Verified', category: 'code' },
  { id: 'livecodebench', name: 'LiveCodeBench', category: 'code' },
  // Agent
  { id: 'bfcl', name: 'BFCL', category: 'agent' },
  { id: 'gaia', name: 'GAIA', category: 'agent' },
  // Preference
  { id: 'arena-elo', name: 'Chatbot Arena ELO', category: 'preference' },
  // Small model specific
  { id: 'mmlu', name: 'MMLU', category: 'knowledge' },
  { id: 'arc', name: 'ARC-C', category: 'reasoning' },
  { id: 'ifeval', name: 'IFEval', category: 'knowledge' },
];

// [🔍 WEB SEARCH] ALL data below must be verified from official technical reports
// Values below are approximate plan guidance — executor MUST verify each score
// null = model did not report this benchmark (important heatmap signal)
const MODELS: ModelRow[] = [
  // Frontier models
  { name: 'GPT-4o', tier: 'frontier', family: 'GPT',
    scores: {
      'mmlu-pro': 72, 'gpqa': 53, 'math500': 76, 'aime': 13, 'bbh': 83,
      'humaneval': 90, 'swe-bench': 38, 'livecodebench': null, 'bfcl': 88,
      'gaia': 40, 'arena-elo': 1280, 'mmlu': 88, 'arc': 96, 'ifeval': 83,
    }, source: '[verify — OpenAI blog/system card]' },
  { name: 'Claude 3.5 Sonnet', tier: 'frontier', family: 'Claude',
    scores: {
      'mmlu-pro': 68, 'gpqa': 60, 'math500': 78, 'aime': 16, 'bbh': 82,
      'humaneval': 92, 'swe-bench': 49, 'livecodebench': null, 'bfcl': 85,
      'gaia': 43, 'arena-elo': 1270, 'mmlu': 89, 'arc': 95, 'ifeval': 88,
    }, source: '[verify — Anthropic blog]' },
  { name: 'Gemini 1.5 Pro', tier: 'frontier', family: 'Gemini',
    scores: {
      'mmlu-pro': 70, 'gpqa': 50, 'math500': 74, 'aime': null, 'bbh': 80,
      'humaneval': 84, 'swe-bench': null, 'livecodebench': null, 'bfcl': 82,
      'gaia': null, 'arena-elo': 1260, 'mmlu': 86, 'arc': 94, 'ifeval': 80,
    }, source: '[verify — Google DeepMind blog]' },
  { name: 'Llama 3.1 405B', tier: 'frontier', family: 'Llama', params: '405B',
    scores: {
      'mmlu-pro': 66, 'gpqa': 46, 'math500': 73, 'aime': null, 'bbh': 80,
      'humaneval': 89, 'swe-bench': null, 'livecodebench': null, 'bfcl': 75,
      'gaia': null, 'arena-elo': 1200, 'mmlu': 87, 'arc': 95, 'ifeval': 80,
    }, source: '[verify — Meta Llama 3.1 blog]' },
  // Small models — null for benchmarks they typically don't report
  { name: 'Gemma 2 9B', tier: 'small', family: 'Gemma', params: '9B',
    scores: {
      'mmlu-pro': 38, 'gpqa': null, 'math500': null, 'aime': null, 'bbh': null,
      'humaneval': 55, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': null, 'mmlu': 72, 'arc': 89, 'ifeval': 70,
    }, source: '[verify — Google Gemma 2 tech report]' },
  { name: 'Phi-3 Mini', tier: 'small', family: 'Phi', params: '3.8B',
    scores: {
      'mmlu-pro': 35, 'gpqa': null, 'math500': null, 'aime': null, 'bbh': null,
      'humaneval': 58, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': null, 'mmlu': 69, 'arc': 85, 'ifeval': null,
    }, source: '[verify — Microsoft Phi-3 tech report]' },
  { name: 'Qwen 2.5 7B', tier: 'small', family: 'Qwen', params: '7B',
    scores: {
      'mmlu-pro': 42, 'gpqa': null, 'math500': null, 'aime': null, 'bbh': null,
      'humaneval': 65, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': null, 'mmlu': 74, 'arc': 90, 'ifeval': 72,
    }, source: '[verify — Alibaba Qwen 2.5 tech report]' },
  { name: 'Llama 3.1 8B', tier: 'small', family: 'Llama', params: '8B',
    scores: {
      'mmlu-pro': 36, 'gpqa': null, 'math500': null, 'aime': null, 'bbh': null,
      'humaneval': 60, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': null, 'mmlu': 68, 'arc': 83, 'ifeval': 76,
    }, source: '[verify — Meta Llama 3.1 blog]' },
  { name: 'Mistral 7B', tier: 'small', family: 'Mistral', params: '7B',
    scores: {
      'mmlu-pro': 30, 'gpqa': null, 'math500': null, 'aime': null, 'bbh': null,
      'humaneval': 48, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': null, 'mmlu': 63, 'arc': 82, 'ifeval': null,
    }, source: '[verify — Mistral AI blog]' },
];

const CATEGORY_LABELS: Record<BenchCategory, { zh: string; en: string }> = {
  knowledge:  { zh: '知识', en: 'Knowledge' },
  reasoning:  { zh: '推理', en: 'Reasoning' },
  code:       { zh: '代码', en: 'Code' },
  agent:      { zh: 'Agent', en: 'Agent' },
  preference: { zh: '偏好', en: 'Preference' },
};

export default function ModelBenchmarkMatrix({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [groupBy, setGroupBy] = useState<'capability' | 'family'>('capability');
  const [hoveredCell, setHoveredCell] = useState<{ model: string; bench: string } | null>(null);

  // Layout: table with sticky header row and first column
  // Header: benchmark names (rotated 45° for space), grouped by category with colored sub-headers
  // Rows: model names, separated into "Frontier" and "小模型" groups with section headers
  // Cells: colored squares — green gradient for high scores, red gradient for low, gray for null
  // Hover: tooltip showing exact score, source link
  // Toggle: "按能力分组" / "按模型族分组" buttons
  // In "by family" view: columns stay same, rows grouped by family (Claude → GPT → Gemini → ...)
  // Note: null cells (not reported) are visually distinct (gray with pattern) — "不报什么暗示弱项"
  // Total ~280-350 lines
}
```

### Article 6b: benchmark-standard-set.mdx

**[🔍 WEB SEARCH]** Before writing — this article requires the MOST web search of all articles:
- Pull each model family's latest technical report and list exactly which benchmarks they report
- Verify the "四大件" (2023) → expanded set (2024) → latest set (2025) evolution
- Small model specific: Gemma 4, Phi-4, Qwen 2.5/3, Llama 3.3 small variants — what they report
- IFEval: what it measures exactly
- C-Eval, CMMLU: what they measure (Chinese benchmarks)
- Verify which benchmarks are the "共同必报交集"

- [ ] **Step 2: Create benchmark-standard-set.mdx**

Frontmatter:

```yaml
---
title: "模型发布 Benchmark 标配解析"
slug: benchmark-standard-set
locale: zh
tags: [benchmark, model-release, standard-set, small-models, gemma, phi, qwen]
prerequisites: [benchmark-landscape]
difficulty: intermediate
created: "2026-04-14"
updated: "2026-04-14"
references:
  # [🔍 WEB SEARCH] verify all URLs — need links to each model's tech report
  - type: website
    title: "Google Gemma Technical Report"
    url: "[verify — latest Gemma release]"
  - type: website
    title: "Microsoft Phi Technical Report"
    url: "[verify — latest Phi release]"
  - type: website
    title: "Alibaba Qwen Technical Report"
    url: "[verify — latest Qwen release]"
  - type: website
    title: "Open LLM Leaderboard"
    url: "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"
---
```

Imports:

```mdx
import ModelBenchmarkMatrix from '../../../components/interactive/ModelBenchmarkMatrix.tsx';
```

**Content outline** (follow spec Art.5):

1. **开篇问题**: "每次新模型发布都贴一堆分数，为什么选这些 benchmark？不同级别的模型报的一样吗？"
2. **时效性声明**: 提醒内容基于截至发布日期的信息
3. **标配集的演进**: 2023 "四大件" → 2024 扩展 → 2025 最新，每个阶段的驱动力
4. **Frontier 模型对比**: Claude / GPT / Gemini / Llama 各报什么，共同必报的交集，"不报什么"的分析
5. **小模型评估体系**: 与 frontier 的核心差异 (同量级对比 / 效率指标 / 基础 benchmark 未饱和)
6. **各家小模型**: Gemma (多语言+IFEval) / Phi ("小而强") / Qwen (中英双语+C-Eval/CMMLU) / Llama 小版 / Mistral，插入 `<ModelBenchmarkMatrix client:visible />`
7. **分数可比性问题**: prompt 模板差异、few-shot 数不一致、后处理差异、工具版本
8. **过渡**: 引导到 Art.6 (优化对精度的影响)

- [ ] **Step 3: Validate and verify**

```bash
npm run validate
npm run dev
# Verify: heatmap matrix renders, hover tooltips work, grouping toggle works
```

- [ ] **Step 4: Commit**

```bash
git add src/components/interactive/ModelBenchmarkMatrix.tsx \
        src/content/articles/zh/benchmark-standard-set.mdx
git commit -m "feat(eval-benchmarks): add Art.5 benchmark standard set with matrix component"
```

---

## Task 7: Art.6 — 优化对精度的影响

**Files:**
- Create: `src/components/interactive/QuantDegradationExplorer.tsx`
- Create: `src/components/interactive/EvalToolchainComparison.tsx`
- Create: `src/components/interactive/PerplexityVsTaskAccuracy.tsx`
- Create: `src/content/articles/zh/optimization-accuracy.mdx`

**Note:** Art.6 has 3 deep dives (lm-eval-harness workflow, OpenVINO toolchain, llama.cpp perplexity) and 3 components. This is the heaviest task. Scope reminder: focus on "怎么测量精度损失", NOT "怎么量化" (quantization algorithms belong to the quantization path).

### Component 7a: QuantDegradationExplorer

**What it does:** Interactive chart exploring quantization degradation. Selectors: model scale (7B/13B/70B) × quantization method (FP16/INT8/INT4/FP8) × benchmark category (knowledge/reasoning/code). Shows degradation as bar chart + heatmap mode toggle. Bar chart: side-by-side bars per benchmark. Heatmap: rows=quant method, cols=benchmark, color=degradation %.

**[🔍 WEB SEARCH]** Before implementing, collect typical degradation data:
- Representative models at each scale: accuracy drop from FP16→INT8, FP16→INT4, FP16→FP8
- Per benchmark category: MMLU, MATH/GSM8K, HumanEval degradation patterns
- Sources: academic papers on quantization quality, community benchmarks (e.g. TheBloke, unsloth)

- [ ] **Step 1: Create QuantDegradationExplorer.tsx**

```tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type ModelScale = '7B' | '13B' | '70B';
type QuantMethod = 'FP16' | 'INT8' | 'INT4' | 'FP8';
type BenchCategory = 'knowledge' | 'reasoning' | 'code';
type ViewMode = 'bar' | 'heatmap';

interface DegradationData {
  scale: ModelScale;
  quant: QuantMethod;
  benchmarks: Record<string, {
    score: number;       // absolute score
    baselineScore: number; // FP16 score
    degradation: number;  // percentage drop
  }>;
}

// [🔍 WEB SEARCH] ALL data below must be verified from papers/community benchmarks
// Structure: for each (scale, quant), show per-benchmark scores
const DATA: DegradationData[] = [
  // 7B models
  {
    scale: '7B', quant: 'FP16',
    benchmarks: {
      'MMLU': { score: 64, baselineScore: 64, degradation: 0 },
      'MMLU-Pro': { score: 35, baselineScore: 35, degradation: 0 },
      'GSM8K': { score: 52, baselineScore: 52, degradation: 0 },
      'MATH': { score: 18, baselineScore: 18, degradation: 0 },
      'HumanEval': { score: 62, baselineScore: 62, degradation: 0 },
    },
  },
  {
    scale: '7B', quant: 'INT8',
    benchmarks: {
      'MMLU': { score: 63.5, baselineScore: 64, degradation: 0.8 },
      'MMLU-Pro': { score: 34.5, baselineScore: 35, degradation: 1.4 },
      'GSM8K': { score: 51, baselineScore: 52, degradation: 1.9 },
      'MATH': { score: 17, baselineScore: 18, degradation: 5.6 },
      'HumanEval': { score: 60, baselineScore: 62, degradation: 3.2 },
    },
  },
  // Complete ALL of these entries (same structure as above):
  // 7B × INT4: expect larger drops — MMLU ~2-4%, GSM8K ~5-8%, HumanEval ~6-10%
  // 7B × FP8: expect drops between INT8 and FP16 — MMLU ~0.5%, GSM8K ~1%, HumanEval ~1.5%
  // 13B × FP16: baseline (higher absolute scores than 7B)
  // 13B × INT8: smaller % drops than 7B (more parameter redundancy)
  // 13B × INT4: moderate drops
  // 13B × FP8: minimal drops
  // 70B × FP16: baseline (highest absolute scores)
  // 70B × INT8: very small drops (~0.3-0.8%)
  // 70B × INT4: small drops (~1-3%) — key insight: "大模型更耐量化"
  // 70B × FP8: near-lossless
  // Total: 12 entries (3 scales × 4 quant methods)
  // [🔍 WEB SEARCH] verify all with actual published data
];

const BENCH_LABELS: Record<string, { zh: string; en: string }> = {
  'MMLU':      { zh: 'MMLU (知识)', en: 'MMLU (Knowledge)' },
  'MMLU-Pro':  { zh: 'MMLU-Pro (知识)', en: 'MMLU-Pro (Knowledge)' },
  'GSM8K':     { zh: 'GSM8K (数学)', en: 'GSM8K (Math)' },
  'MATH':      { zh: 'MATH (数学)', en: 'MATH (Math)' },
  'HumanEval': { zh: 'HumanEval (代码)', en: 'HumanEval (Code)' },
};

const QUANT_COLORS: Record<QuantMethod, string> = {
  FP16: COLORS.primary,
  INT8: COLORS.green,
  INT4: COLORS.orange,
  FP8: COLORS.purple,
};

export default function QuantDegradationExplorer({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [scale, setScale] = useState<ModelScale>('7B');
  const [viewMode, setViewMode] = useState<ViewMode>('bar');
  const [selectedQuants, setSelectedQuants] = useState<QuantMethod[]>(['FP16', 'INT8', 'INT4']);

  const W = 620, H = 400;

  // Bar mode:
  //   X-axis: benchmark names, grouped
  //   Y-axis: score (0-100)
  //   Bars: side-by-side per quant method, colored by QUANT_COLORS
  //   Labels on bars: degradation % (e.g. "-1.4%")
  //   Key insight highlighted: "代码类 > 推理类 > 知识类" sensitivity
  //
  // Heatmap mode:
  //   Rows: quant methods (FP16/INT8/INT4/FP8)
  //   Cols: benchmarks
  //   Cell color: white (0%) → yellow (1-3%) → orange (3-5%) → red (>5%)
  //   Cell text: degradation %
  //
  // Scale selector: 7B / 13B / 70B buttons (top-left)
  // View toggle: Bar / Heatmap buttons (top-right)
  // Quant checkboxes: select which methods to show (bar mode)
  // Callout: "大模型比小模型更耐量化"
  // Total ~300-380 lines
}
```

### Component 7b: EvalToolchainComparison

**What it does:** Side-by-side comparison of 3 evaluation tools: lm-eval-harness, OpenVINO (Optimum Intel + NNCF), llama.cpp perplexity. Card layout with dimensions: 适用场景, 支持模型格式, 输出指标, benchmark 覆盖范围, 硬件要求.

**Complexity: Low** — primarily static comparison display.

- [ ] **Step 2: Create EvalToolchainComparison.tsx**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Toolchain {
  name: string;
  icon: string;
  color: string;
  dimensions: Record<string, { zh: string; en: string }>;
}

const TOOLCHAINS: Toolchain[] = [
  {
    name: 'lm-evaluation-harness',
    icon: '📊',
    color: COLORS.primary,
    dimensions: {
      scenario:  { zh: '通用模型评估，量化前后对比', en: 'General model evaluation, pre/post quantization comparison' },
      formats:   { zh: 'HuggingFace, vLLM, GGUF (有限支持)', en: 'HuggingFace, vLLM, GGUF (limited support)' },
      metrics:   { zh: '所有 benchmark 分数 (accuracy, F1, pass@k 等)', en: 'All benchmark scores (accuracy, F1, pass@k, etc.)' },
      coverage:  { zh: '最广：几乎所有主流 benchmark', en: 'Broadest: nearly all mainstream benchmarks' },
      hardware:  { zh: '主要 GPU (NVIDIA)，CPU 可用但慢', en: 'Primarily GPU (NVIDIA), CPU usable but slow' },
    },
  },
  {
    name: 'OpenVINO (Optimum Intel + NNCF)',
    icon: '🔧',
    color: '#0071c5', // Intel blue
    dimensions: {
      scenario:  { zh: 'Intel 硬件部署评估，accuracy-aware 量化', en: 'Intel hardware deployment evaluation, accuracy-aware quantization' },
      formats:   { zh: 'OpenVINO IR (从 HuggingFace 转换)', en: 'OpenVINO IR (converted from HuggingFace)' },
      metrics:   { zh: 'benchmark 分数 + 吞吐/延迟 (benchmark_app)', en: 'Benchmark scores + throughput/latency (benchmark_app)' },
      coverage:  { zh: '通过 lm-eval-harness 集成覆盖', en: 'Coverage through lm-eval-harness integration' },
      hardware:  { zh: 'Intel CPU / iGPU / Arc GPU（核心优势）', en: 'Intel CPU / iGPU / Arc GPU (core advantage)' },
    },
  },
  {
    name: 'llama.cpp perplexity',
    icon: '🦙',
    color: COLORS.green,
    dimensions: {
      scenario:  { zh: 'GGUF 量化质量快速检查', en: 'GGUF quantization quality quick check' },
      formats:   { zh: '仅 GGUF', en: 'GGUF only' },
      metrics:   { zh: 'Perplexity (WikiText-2 等)', en: 'Perplexity (WikiText-2, etc.)' },
      coverage:  { zh: '仅 perplexity — 不含 task-specific benchmark', en: 'Perplexity only — no task-specific benchmarks' },
      hardware:  { zh: 'CPU / GPU / Apple Silicon（跨平台）', en: 'CPU / GPU / Apple Silicon (cross-platform)' },
    },
  },
];

const DIMENSION_LABELS: Record<string, { zh: string; en: string }> = {
  scenario: { zh: '适用场景', en: 'Use Case' },
  formats:  { zh: '支持模型格式', en: 'Model Formats' },
  metrics:  { zh: '输出指标', en: 'Output Metrics' },
  coverage: { zh: 'Benchmark 覆盖', en: 'Benchmark Coverage' },
  hardware: { zh: '硬件要求', en: 'Hardware Requirements' },
};

export default function EvalToolchainComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [highlightedTool, setHighlightedTool] = useState<string | null>(null);

  // Layout: 3 vertical cards side by side (or stacked on mobile)
  // Each card: colored top border (tool color), icon + tool name header
  // Below: dimension labels on left, values on right (or table rows)
  // Hover on card: highlight that card, dim others
  // Bottom: decision guide callout:
  //   "全面评估 → lm-eval-harness; Intel 部署 → OpenVINO; GGUF 快速检查 → llama.cpp"
  // Total ~120-160 lines (低复杂度)
}
```

### Component 7c: PerplexityVsTaskAccuracy

**What it does:** Dual-axis chart showing perplexity change (left Y-axis) vs task benchmark score change (right Y-axis) across quantization levels (X-axis). Demonstrates that perplexity and task accuracy are NOT perfectly correlated — some quantization levels show small perplexity changes but significant task score drops.

**[🔍 WEB SEARCH]** Before implementing, collect data from community GGUF comparison posts (Reddit, HuggingFace discussions) showing both perplexity and task accuracy for different quantization levels of the same model.

- [ ] **Step 3: Create PerplexityVsTaskAccuracy.tsx**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface QuantLevel {
  name: string;        // e.g. "Q8_0", "Q6_K", "Q4_K_M"
  perplexity: number;  // absolute value on WikiText-2
  pplChange: number;   // % increase from FP16 baseline
  taskScores: Record<string, {
    score: number;
    change: number; // % change from FP16
  }>;
}

// [🔍 WEB SEARCH] All data must be from actual community benchmarks
// Use a specific model (e.g., Llama 3.1 8B) for consistency
const MODEL_NAME = 'Llama 3.1 8B'; // [or whatever model has the most complete community data]
const QUANT_LEVELS: QuantLevel[] = [
  {
    name: 'FP16',
    perplexity: 6.24, // [verify]
    pplChange: 0,
    taskScores: {
      'MMLU': { score: 66.2, change: 0 },
      'GSM8K': { score: 54.1, change: 0 },
      'HumanEval': { score: 62.8, change: 0 },
    },
  },
  {
    name: 'Q8_0',
    perplexity: 6.25, // [verify]
    pplChange: 0.16,
    taskScores: {
      'MMLU': { score: 66.0, change: -0.3 },
      'GSM8K': { score: 53.8, change: -0.6 },
      'HumanEval': { score: 62.2, change: -1.0 },
    },
  },
  // Complete ALL of these entries (same structure as above):
  // Q6_K:   ppl ~6.26, pplChange ~0.3%,  MMLU ~-0.5%, GSM8K ~-0.8%, HumanEval ~-1.5%
  // Q5_K_M: ppl ~6.30, pplChange ~1.0%,  MMLU ~-0.8%, GSM8K ~-1.5%, HumanEval ~-2.5%
  // Q4_K_M: ppl ~6.38, pplChange ~2.2%,  MMLU ~-1.2%, GSM8K ~-3.0%, HumanEval ~-5.0%  ← KEY: ppl small but HumanEval drops
  // Q3_K_M: ppl ~6.55, pplChange ~5.0%,  MMLU ~-2.5%, GSM8K ~-6.0%, HumanEval ~-10%
  // Q2_K:   ppl ~7.20, pplChange ~15.4%, MMLU ~-8.0%, GSM8K ~-15%, HumanEval ~-20%
  // Total: 7 quant levels (FP16 through Q2_K)
  // [🔍 WEB SEARCH] verify all values — above are rough estimates for plan guidance only
];

export default function PerplexityVsTaskAccuracy({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('MMLU');

  const W = 580, H = 380;
  // Dual-axis chart:
  // X-axis: quantization levels (Q8_0 → Q2_K, left to right = more aggressive)
  // Left Y-axis (blue): perplexity change % (line chart)
  // Right Y-axis (orange): task score change % (line chart, for selected benchmark)
  // Benchmark selector: buttons for MMLU / GSM8K / HumanEval
  // Highlight region: where lines diverge significantly
  //   Annotation: "Perplexity 变化小但 HumanEval 掉分明显 → 代码任务对量化更敏感"
  // Key insight callout: "perplexity 是快速筛选工具，不能替代 task-specific 评估"
  // Total ~200-250 lines
}
```

### Article 7d: optimization-accuracy.mdx

**[🔍 WEB SEARCH]** Before writing — extensive verification needed:
- lm-eval-harness: verify supported backends (HF, vLLM, GGUF), exact command syntax
- OpenVINO NNCF: verify accuracy-aware quantization API, Optimum Intel integration method
- benchmark_app: verify command syntax and output format
- llama.cpp perplexity: verify command syntax, default evaluation corpus (WikiText-2?)
- GGUF quant variant ordering (Q2_K → Q8_0) and typical perplexity differences
- KV cache quantization support in llama.cpp and impact data
- Typical degradation patterns: knowledge vs reasoning vs code sensitivity

- [ ] **Step 4: Create optimization-accuracy.mdx**

Frontmatter:

```yaml
---
title: "优化对精度的影响"
slug: optimization-accuracy
locale: zh
tags: [benchmark, quantization, accuracy, perplexity, openvino, lm-eval-harness, llama-cpp]
prerequisites: [benchmark-landscape]
difficulty: intermediate
created: "2026-04-14"
updated: "2026-04-14"
references:
  # [🔍 WEB SEARCH] verify all URLs
  - type: website
    title: "lm-evaluation-harness"
    url: "https://github.com/EleutherAI/lm-evaluation-harness"
  - type: website
    title: "OpenVINO Neural Network Compression Framework (NNCF)"
    url: "[verify]"
  - type: website
    title: "Optimum Intel"
    url: "[verify — huggingface optimum-intel]"
  - type: website
    title: "llama.cpp"
    url: "https://github.com/ggerganov/llama.cpp"
---
```

Imports:

```mdx
import QuantDegradationExplorer from '../../../components/interactive/QuantDegradationExplorer.tsx';
import EvalToolchainComparison from '../../../components/interactive/EvalToolchainComparison.tsx';
import PerplexityVsTaskAccuracy from '../../../components/interactive/PerplexityVsTaskAccuracy.tsx';
```

**Content outline** (follow spec Art.6 — remember: "怎么测量" not "怎么量化"):

1. **开篇问题**: "量化、剪枝、KV cache 压缩号称能加速 2-4 倍，精度到底掉多少？怎么自己验证？"
2. **优化手段与精度代价全景**: 各优化类型 + 典型 degradation 模式（注明算法原理见 quantization 路径）
3. **Degradation 不均匀性**: 不同 benchmark 受影响程度差异大，插入 `<QuantDegradationExplorer client:visible />`
4. **深潜 1: lm-eval-harness 实测工作流**: 量化前后对比 5 步流程 → 后端集成 → 结果解读 → 常见陷阱
5. **深潜 2: OpenVINO 精度评估工具链**: Optimum Intel 一站式工作流 → NNCF accuracy-aware 量化的精度约束设置 → 逐层 sensitivity → benchmark_app 联合决策
6. **深潜 3: llama.cpp 精度评估**: 内置 perplexity 测量 → GGUF 量化变体 perplexity 对比 → KV cache 量化影响
7. **Perplexity vs task accuracy**: 不线性相关的关系，插入 `<PerplexityVsTaskAccuracy client:visible />`
8. **工具链对比汇总**: 插入 `<EvalToolchainComparison client:visible />`
9. **过渡**: 引导到 Art.7 (排行榜与选型)

- [ ] **Step 5: Validate and verify**

```bash
npm run validate
npm run dev
# Verify: all 3 components render, degradation explorer scale/view switching works,
#         dual-axis chart benchmark selector works, toolchain cards display correctly
```

- [ ] **Step 6: Commit**

```bash
git add src/components/interactive/QuantDegradationExplorer.tsx \
        src/components/interactive/EvalToolchainComparison.tsx \
        src/components/interactive/PerplexityVsTaskAccuracy.tsx \
        src/content/articles/zh/optimization-accuracy.mdx
git commit -m "feat(eval-benchmarks): add Art.6 optimization accuracy with 3 components"
```

---

## Task 8: Art.7 — 排行榜解读与模型选型

**Files:**
- Create: `src/components/interactive/ModelSelectionDecisionTree.tsx`
- Create: `src/content/articles/zh/leaderboard-model-selection.mdx`

### Component 8a: ModelSelectionDecisionTree

**What it does:** Interactive decision flow. User answers 4-5 sequential questions (task type → latency requirements → local deployment? → budget → hardware). Based on answers, recommends: (a) which benchmark combination to focus on, (b) candidate model range (by parameter scale and deployment method). Does NOT recommend specific models (data ages too fast) — recommends an "evaluation framework".

- [ ] **Step 1: Create ModelSelectionDecisionTree.tsx**

```tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Question {
  id: string;
  text: { zh: string; en: string };
  options: {
    label: { zh: string; en: string };
    value: string;
    description?: { zh: string; en: string };
  }[];
}

interface Recommendation {
  benchmarks: { zh: string; en: string }[];
  modelRange: { zh: string; en: string };
  rationale: { zh: string; en: string };
  nextPath?: { zh: string; en: string }; // link to model-routing if applicable
}

const QUESTIONS: Question[] = [
  {
    id: 'task',
    text: { zh: '你的核心任务是什么？', en: 'What is your core task?' },
    options: [
      { label: { zh: '对话/问答', en: 'Chat/QA' }, value: 'chat',
        description: { zh: '通用对话、知识问答', en: 'General conversation, knowledge QA' } },
      { label: { zh: '代码生成/辅助', en: 'Code Generation' }, value: 'code',
        description: { zh: '代码补全、bug 修复、代码审查', en: 'Code completion, bug fixing, review' } },
      { label: { zh: '推理/数学', en: 'Reasoning/Math' }, value: 'reasoning',
        description: { zh: '数学证明、逻辑推理、科学问题', en: 'Math proofs, logical reasoning, science' } },
      { label: { zh: 'Agent/工具调用', en: 'Agent/Tool Use' }, value: 'agent',
        description: { zh: 'API 调用、多步骤任务自动化', en: 'API calls, multi-step task automation' } },
    ],
  },
  {
    id: 'latency',
    text: { zh: '延迟要求？', en: 'Latency requirements?' },
    options: [
      { label: { zh: '实时 (<1s)', en: 'Real-time (<1s)' }, value: 'realtime' },
      { label: { zh: '交互式 (1-10s)', en: 'Interactive (1-10s)' }, value: 'interactive' },
      { label: { zh: '批处理 (无限制)', en: 'Batch (no limit)' }, value: 'batch' },
    ],
  },
  {
    id: 'deployment',
    text: { zh: '部署方式？', en: 'Deployment method?' },
    options: [
      { label: { zh: '云端 API', en: 'Cloud API' }, value: 'cloud',
        description: { zh: 'OpenAI/Anthropic/Google API', en: 'OpenAI/Anthropic/Google API' } },
      { label: { zh: '本地部署', en: 'Local Deployment' }, value: 'local',
        description: { zh: '自有服务器或消费级硬件', en: 'Own server or consumer hardware' } },
      { label: { zh: '混合 (大小模型协同)', en: 'Hybrid (Large+Small)' }, value: 'hybrid',
        description: { zh: '简单任务本地、复杂任务云端', en: 'Simple tasks local, complex tasks cloud' } },
    ],
  },
  {
    id: 'hardware',
    text: { zh: '本地硬件配置？', en: 'Local hardware?' },
    // Only shown if deployment=local or hybrid
    options: [
      { label: { zh: 'NVIDIA GPU (≥16GB)', en: 'NVIDIA GPU (≥16GB)' }, value: 'nvidia-gpu' },
      { label: { zh: 'NVIDIA GPU (8-12GB)', en: 'NVIDIA GPU (8-12GB)' }, value: 'nvidia-gpu-small' },
      { label: { zh: 'Intel Arc / iGPU', en: 'Intel Arc / iGPU' }, value: 'intel-gpu' },
      { label: { zh: '仅 CPU', en: 'CPU Only' }, value: 'cpu-only' },
      { label: { zh: 'Apple Silicon', en: 'Apple Silicon' }, value: 'apple' },
    ],
  },
  {
    id: 'budget',
    text: { zh: '月度 API 预算？', en: 'Monthly API budget?' },
    // Only shown if deployment=cloud or hybrid
    options: [
      { label: { zh: '不限', en: 'Unlimited' }, value: 'unlimited' },
      { label: { zh: '$100-500/月', en: '$100-500/mo' }, value: 'medium' },
      { label: { zh: '<$100/月', en: '<$100/mo' }, value: 'low' },
    ],
  },
];

// Decision logic: based on combination of answers, produce recommendation
function getRecommendation(answers: Record<string, string>): Recommendation {
  const task = answers['task'];
  const deploy = answers['deployment'];
  const latency = answers['latency'];
  const budget = answers['budget'];

  // Build benchmark recommendations based on task type
  const benchmarks: { zh: string; en: string }[] = [];

  if (task === 'chat') {
    benchmarks.push(
      { zh: 'Chatbot Arena (对话偏好)', en: 'Chatbot Arena (conversation preference)' },
      { zh: 'MMLU-Pro (知识广度)', en: 'MMLU-Pro (knowledge breadth)' },
      { zh: 'IFEval (指令遵循)', en: 'IFEval (instruction following)' },
    );
  } else if (task === 'code') {
    benchmarks.push(
      { zh: 'SWE-bench Verified (真实代码能力)', en: 'SWE-bench Verified (real coding ability)' },
      { zh: 'HumanEval/LiveCodeBench (函数生成)', en: 'HumanEval/LiveCodeBench (function generation)' },
      { zh: 'Chatbot Arena — Coding (代码偏好)', en: 'Chatbot Arena — Coding (code preference)' },
    );
  } else if (task === 'reasoning') {
    benchmarks.push(
      { zh: 'GPQA Diamond (研究生级推理)', en: 'GPQA Diamond (graduate-level reasoning)' },
      { zh: 'MATH-500 / AIME (数学推理)', en: 'MATH-500 / AIME (mathematical reasoning)' },
      { zh: 'BBH (多步推理)', en: 'BBH (multi-step reasoning)' },
    );
  } else if (task === 'agent') {
    benchmarks.push(
      { zh: 'BFCL (function calling 准确率)', en: 'BFCL (function calling accuracy)' },
      { zh: 'GAIA (多步骤 agent 任务)', en: 'GAIA (multi-step agent tasks)' },
      { zh: 'τ-bench (tool-augmented 能力)', en: 'τ-bench (tool-augmented ability)' },
    );
  }

  // Model range based on deployment + hardware
  let modelRange: { zh: string; en: string };
  if (deploy === 'cloud') {
    modelRange = { zh: 'Frontier 模型 (GPT-4o / Claude 3.5 / Gemini 1.5)', en: 'Frontier models (GPT-4o / Claude 3.5 / Gemini 1.5)' };
  } else if (deploy === 'local') {
    const hw = answers['hardware'];
    if (hw === 'nvidia-gpu') {
      modelRange = { zh: '7B-70B (FP16/INT8)，取决于 VRAM', en: '7B-70B (FP16/INT8), depends on VRAM' };
    } else if (hw === 'nvidia-gpu-small') {
      modelRange = { zh: '7B-13B (INT4/INT8 量化)', en: '7B-13B (INT4/INT8 quantized)' };
    } else if (hw === 'intel-gpu') {
      modelRange = { zh: '7B-13B (OpenVINO INT4/INT8) — 见 intel-igpu-inference 路径', en: '7B-13B (OpenVINO INT4/INT8) — see intel-igpu-inference path' };
    } else if (hw === 'apple') {
      modelRange = { zh: '7B-30B (GGUF Q4-Q8，MLX)', en: '7B-30B (GGUF Q4-Q8, MLX)' };
    } else {
      modelRange = { zh: '3B-7B (GGUF Q4-Q5，CPU 推理)', en: '3B-7B (GGUF Q4-Q5, CPU inference)' };
    }
  } else {
    modelRange = { zh: '混合: 本地 7B + 云端 Frontier → 见 model-routing 路径', en: 'Hybrid: local 7B + cloud Frontier → see model-routing path' };
  }

  // Adjust modelRange based on latency constraints
  if (latency === 'realtime') {
    if (deploy === 'local') {
      const hw = answers['hardware'];
      if (hw === 'nvidia-gpu') {
        modelRange = { zh: '7B-13B (INT4/INT8 量化，确保低延迟)', en: '7B-13B (INT4/INT8 quantized for low latency)' };
      }
      // Other hardware options already recommend small models — no override needed
    } else if (deploy === 'cloud') {
      benchmarks.push({ zh: '关注 TTFT 和 tokens/s 指标 (Artificial Analysis)', en: 'Focus on TTFT and tokens/s metrics (Artificial Analysis)' });
    }
  }

  // Adjust based on budget constraints
  if (budget === 'low') {
    if (deploy === 'cloud') {
      modelRange = { zh: '轻量 API (GPT-4o-mini / Gemini Flash / Claude Haiku) 或考虑本地部署',
                     en: 'Lightweight API (GPT-4o-mini / Gemini Flash / Claude Haiku) or consider local deployment' };
    } else if (deploy === 'hybrid') {
      modelRange = { zh: '本地为主 (7B INT4) + 低成本 API 兜底 → 见 model-routing 路径',
                     en: 'Local-first (7B INT4) + low-cost API fallback → see model-routing path' };
    }
  }

  // Build rationale incorporating all factors
  let rationaleBase = deploy === 'hybrid'
    ? { zh: '混合部署的关键是确定 routing 策略——什么任务走本地，什么走云端。这正是 model-routing 路径的内容。',
        en: 'The key to hybrid deployment is determining routing strategy — which tasks go local vs cloud. This is exactly what the model-routing path covers.' }
    : { zh: '根据你的任务和部署条件，建议关注以上 benchmark 组合来评估候选模型。不要只看总分——关注与你场景最匹配的类别分数。',
        en: 'Based on your task and deployment, focus on the benchmark combination above. Don\'t just look at overall scores — focus on category scores most relevant to your scenario.' };

  if (latency === 'realtime') {
    rationaleBase = {
      zh: rationaleBase.zh + ' ⚡ 实时场景下，还需关注 TTFT（首 token 延迟）和吞吐量——量化模型通常是必要的。',
      en: rationaleBase.en + ' ⚡ For real-time use, also monitor TTFT (time to first token) and throughput — quantized models are usually necessary.',
    };
  }
  if (budget === 'low') {
    rationaleBase = {
      zh: rationaleBase.zh + ' 💰 预算有限时，优先评估轻量模型（Haiku/Flash/mini 系列），或用本地部署替代 API 调用。',
      en: rationaleBase.en + ' 💰 On a tight budget, prioritize lightweight models (Haiku/Flash/mini series) or replace API calls with local deployment.',
    };
  }

  return { benchmarks, modelRange, rationale: rationaleBase, nextPath: deploy === 'hybrid' ? { zh: '→ 继续阅读 Model Routing 路径', en: '→ Continue to Model Routing path' } : undefined };
}

export default function ModelSelectionDecisionTree({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Determine which questions to show (skip hardware if cloud, skip budget if local)
  const visibleQuestions = useMemo(() => {
    return QUESTIONS.filter(q => {
      if (q.id === 'hardware') return answers['deployment'] === 'local' || answers['deployment'] === 'hybrid';
      if (q.id === 'budget') return answers['deployment'] === 'cloud' || answers['deployment'] === 'hybrid';
      return true;
    });
  }, [answers]);

  // Layout:
  // Progress bar at top (step N of M)
  // Current question: large text + option cards (click to select)
  // Selected options shown as breadcrumb trail above question
  // After all questions: recommendation panel with:
  //   - "关注这些 Benchmark" section (list)
  //   - "候选模型范围" section
  //   - "建议" text
  //   - "重新选择" button
  //   - Optional: model-routing path link
  // Use motion for step transitions (slide left/right)
  // Total ~250-320 lines
}
```

### Article 8b: leaderboard-model-selection.mdx

**[🔍 WEB SEARCH]** Before writing, verify:
- Chatbot Arena: current total evaluation count (百万级?), ELO score range, category list
- Open LLM Leaderboard V2: which benchmarks it uses, when V1→V2 transition happened
- LiveBench: update frequency (monthly?), benchmark mix
- Artificial Analysis: what dimensions it covers, URL
- Small model deployment: VRAM requirements for 7B/13B at different quantization levels

- [ ] **Step 2: Create leaderboard-model-selection.mdx**

Frontmatter:

```yaml
---
title: "排行榜解读与模型选型"
slug: leaderboard-model-selection
locale: zh
tags: [benchmark, leaderboard, model-selection, chatbot-arena, deployment]
prerequisites: [benchmark-landscape]
difficulty: intermediate
created: "2026-04-14"
updated: "2026-04-14"
references:
  # [🔍 WEB SEARCH] verify all URLs
  - type: website
    title: "Chatbot Arena (LMSYS)"
    url: "[verify — lmsys.org or arena.lmsys.org]"
  - type: website
    title: "Open LLM Leaderboard V2"
    url: "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"
  - type: website
    title: "LiveBench"
    url: "[verify]"
  - type: website
    title: "Artificial Analysis LLM Leaderboard"
    url: "[verify]"
---
```

Imports:

```mdx
import ModelSelectionDecisionTree from '../../../components/interactive/ModelSelectionDecisionTree.tsx';
```

**Content outline** (follow spec Art.7):

1. **开篇问题**: "排行榜上几十个模型、几十个分数，我的具体场景到底该选哪个？"
2. **主流排行榜对比**: Chatbot Arena (ELO + 盲评) / Open LLM Leaderboard (lm-eval-harness + 开源) / LiveBench (动态抗污染) / Artificial Analysis (质量+性能+价格)
3. **排行榜的陷阱**: 不同排行榜排名差异、刷榜、指标与体验脱节、Arena 样本偏差
4. **场景化选型框架**: 4 步法 (明确任务 → 确定约束 → 选 benchmark 组合 → mini eval)
5. **深潜: Chatbot Arena** — 选择理由 → 评估机制 (盲评) → ELO 系统 → 分类排行 → 已知局限
6. **小模型选型**: 本地部署场景 (消费级 GPU/CPU-only/Intel iGPU) / 各家特点 (Gemma/Phi/Qwen/Llama/Mistral) / 量化方案选择
7. **交互决策**: 插入 `<ModelSelectionDecisionTree client:visible />`
8. **衔接 model-routing**: 从"选一个"到"动态选" → benchmark 数据如何喂给 routing 策略 → 引导进入 model-routing 路径

- [ ] **Step 3: Validate and verify**

```bash
npm run validate
npm run dev
# Verify: decision tree interaction works through all paths,
#         recommendation panel shows correctly, model-routing link works
```

- [ ] **Step 4: Commit**

```bash
git add src/components/interactive/ModelSelectionDecisionTree.tsx \
        src/content/articles/zh/leaderboard-model-selection.mdx
git commit -m "feat(eval-benchmarks): add Art.7 leaderboard and model selection with decision tree"
```

---

## Task 9: Cross-References + Final Validation

**Files:**
- Modify: `src/content/articles/zh/model-routing-landscape.mdx`

- [ ] **Step 1: Add back-reference in model-routing-landscape.mdx**

After the imports section, before the first heading, add a callout box:

```mdx
> **前置推荐**: 如果你还不熟悉 LLM benchmark 的评估体系和各排行榜的解读方法，建议先阅读 [LLM 评估与 Benchmark 深度解析](/zh/paths/llm-evaluation-benchmarks) 路径，特别是最后一篇 [排行榜解读与模型选型](/zh/articles/leaderboard-model-selection)。
```

This project uses standard markdown blockquotes (`> **Bold label**: text`) for callouts.

- [ ] **Step 2: Run full validation**

```bash
npm run validate
```

Expected: all 7 articles pass validation (correct frontmatter, valid references, prerequisites exist).

- [ ] **Step 3: Run build check**

```bash
npm run build
```

Expected: build succeeds without errors. All articles render. All components compile.

- [ ] **Step 4: Full visual review**

```bash
npm run dev
```

Open browser and verify each article in order:
1. `/zh/articles/benchmark-landscape` — BenchmarkTaxonomy filtering, EvalProtocolFlow tabs
2. `/zh/articles/reasoning-benchmarks` — ReasoningBenchmarkMap hover, MMLUProEvalDemo CoT toggle
3. `/zh/articles/code-benchmarks` — CodeBenchmarkEvolution timeline, SWEbenchFlow steps
4. `/zh/articles/agent-benchmarks` — AgentCapabilityRadar model selection, BFCLEvalFlow tabs
5. `/zh/articles/benchmark-standard-set` — ModelBenchmarkMatrix heatmap, grouping toggle
6. `/zh/articles/optimization-accuracy` — QuantDegradationExplorer, PerplexityVsTaskAccuracy, EvalToolchainComparison
7. `/zh/articles/leaderboard-model-selection` — ModelSelectionDecisionTree full flow
8. `/zh/paths/llm-evaluation-benchmarks` — path page shows all 7 articles in order
9. `/zh/articles/model-routing-landscape` — back-reference callout visible

- [ ] **Step 5: Commit cross-reference update**

```bash
git add src/content/articles/zh/model-routing-landscape.mdx
git commit -m "feat(eval-benchmarks): add cross-reference from model-routing to eval-benchmarks path"
```

---

## Execution Notes

### Web Search Strategy

Tasks 2-8 all require web search verification. Prioritize:
1. **High priority**: benchmark dataset sizes, current SOTA scores, paper URLs — these appear in articles
2. **Medium priority**: model-specific scores for ModelBenchmarkMatrix and QuantDegradationExplorer — component data
3. **Low priority**: tool command syntax, community perplexity data — can use approximate values with [截至 YYYY-MM] notes

### Task Dependencies

```
Task 1 (YAML) → no dependencies
Tasks 2-8 → Task 1 must be done first (YAML must exist for validation)
Tasks 2-4 → independent of each other (can parallelize)
Task 5 → ideally after 2-4 (references their benchmarks)
Task 6 → after 2-4 (some data overlap)
Task 7 → independent (but conceptually after understanding Art.1-4)
Task 8 → after all articles exist (cross-references all previous)
Task 9 → after all articles exist
```

**Recommended execution order:** 1 → 2 → 3 → 4 (parallel if possible) → 5 → 6 → 7 → 8 → 9

### Component Size Estimates

| Component | Est. Lines | Notes |
|-----------|-----------|-------|
| BenchmarkTaxonomy | 250-300 | Many benchmark entries |
| EvalProtocolFlow | 200-250 | 4 protocol tabs |
| ReasoningBenchmarkMap | 200-240 | SVG scatter plot |
| MMLUProEvalDemo | 220-260 | Card layout + animation |
| CodeBenchmarkEvolution | 220-260 | Timeline with connections |
| SWEbenchFlow | 200-240 | Vertical waterfall |
| AgentCapabilityRadar | 250-300 | SVG radar chart |
| BFCLEvalFlow | 200-240 | Left-right panels |
| ModelBenchmarkMatrix | 300-380 | Complex heatmap |
| QuantDegradationExplorer | 320-400 | Dual view mode |
| EvalToolchainComparison | 130-170 | Static cards |
| PerplexityVsTaskAccuracy | 220-260 | Dual-axis chart |
| ModelSelectionDecisionTree | 280-340 | Multi-step flow |
