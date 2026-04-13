# Graph Compilation & Optimization — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of the `graph-compilation-optimization` learning path: path YAML, the shared CompilerStackMap navigation component, and Articles 1–4 (panorama, graph capture, IR design upper/lower) with 13 interactive components.

**Architecture:** Each article follows the existing MDX + React interactive component pattern. Components use SVG rendering with Motion animations and the shared `COLORS`/`FONTS` system. The CompilerStackMap shared component appears at the top of every article (full mode in Article 1, compact mode in Articles 2–17). Articles are bilingual (zh primary, en secondary).

**Tech Stack:** Astro 5, MDX, React 18, TypeScript, Motion (`motion/react`), SVG, Tailwind CSS

**Design Spec:** `docs/superpowers/specs/2026-04-12-graph-compilation-optimization-design.md`

---

## Component Pattern Reference

All 13 interactive components follow this established pattern. Subagents MUST reference this section.

```tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500; // SVG viewBox dimensions (adjust per component)

export default function ComponentName({ locale = 'zh' }: Props) {
  const t = { zh: { /* ... */ }, en: { /* ... */ } }[locale]!;
  const [state, setState] = useState(/* initial */);

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        {/* SVG content with <motion.g>, <motion.rect>, etc. */}
      </svg>
      {/* Optional: slider/button controls below SVG */}
    </div>
  );
}
```

**Key rules:**
- Import Motion as `import { motion, AnimatePresence } from 'motion/react'` (NOT `framer-motion`)
- Import colors as `import { COLORS, FONTS } from './shared/colors'`
- Props: only `locale?: 'zh' | 'en'`, default `'zh'`
- i18n: inline `{ zh: {...}, en: {...} }[locale]!` pattern
- Animations: `<motion.g>` with `initial`/`animate`/`transition`
- Never hardcode colors — always use `COLORS.*`
- For multi-step flows: use `StepNavigator` from `../primitives/StepNavigator`

## MDX Article Pattern Reference

```mdx
---
title: "标题"
slug: article-slug
locale: zh
tags: [tag1, tag2]
prerequisites: [dep-slug]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "Paper Title"
    url: "https://arxiv.org/abs/..."
---

import Component1 from '../../../components/interactive/Component1.tsx';
import Component2 from '../../../components/interactive/Component2.tsx';

## 简介

{/* ... */}

<Component1 client:visible />

## 技术细节

{/* ... */}

<Component2 client:visible />
```

**Key rules:**
- `client:visible` on ALL interactive components (required for React hydration in Astro)
- Import path: `'../../../components/interactive/ComponentName.tsx'`
- English version: same structure, `locale: en`, English content, components get `locale="en"` prop
- References must be real, verified URLs
- Every technical claim needs a source — web-search to verify during writing
- Minimum 3000 words per article, no upper limit
- Chinese text with English technical terms (首次出现附中文翻译)

---

## File Structure

### New files to create

```
src/content/paths/graph-compilation-optimization.yaml          # Learning path definition
src/components/interactive/CompilerStackMap.tsx                 # Shared: compilation stack navigator
src/components/interactive/EagerVsCompiled.tsx                  # Art.1: eager vs compiled comparison
src/components/interactive/CompilerTimelineChart.tsx            # Art.1: compiler history timeline
src/components/interactive/DynamoTracingFlow.tsx                # Art.2: TorchDynamo tracing animation
src/components/interactive/FXGraphExplorer.tsx                  # Art.2: FX Graph node inspector
src/components/interactive/GuardSystemDemo.tsx                  # Art.2: guard check / recompile demo
src/components/interactive/AOTAutogradFlow.tsx                  # Art.2: forward+backward joint graph
src/components/interactive/IRLayerVisualizer.tsx                # Art.3: multi-level IR comparison
src/components/interactive/DialectExplorer.tsx                  # Art.3: MLIR dialect hierarchy
src/components/interactive/SSAVisualizer.tsx                    # Art.3: SSA form + phi nodes
src/components/interactive/ProgressiveLoweringAnimation.tsx     # Art.4: lowering step animation
src/components/interactive/DialectConversionDemo.tsx            # Art.4: pattern match → replace
src/components/interactive/BufferizationVisualizer.tsx          # Art.4: tensor → memref mapping
src/content/articles/zh/ml-compiler-landscape.mdx              # Art.1 Chinese
src/content/articles/en/ml-compiler-landscape.mdx              # Art.1 English
src/content/articles/zh/graph-capture-dynamo.mdx               # Art.2 Chinese
src/content/articles/en/graph-capture-dynamo.mdx               # Art.2 English
src/content/articles/zh/ir-design-basics.mdx                   # Art.3 Chinese
src/content/articles/en/ir-design-basics.mdx                   # Art.3 English
src/content/articles/zh/ir-progressive-lowering.mdx            # Art.4 Chinese
src/content/articles/en/ir-progressive-lowering.mdx            # Art.4 English
```

### No existing files need modification

---

## Dependency Graph

```
Phase A (parallel):   Task 1 (YAML)  |  Task 2 (CompilerStackMap)
Phase B (parallel):   Task 3 (Art.1) |  Task 4 (Art.2) |  Task 5 (Art.3) |  Task 6 (Art.4)
Phase C:              Task 7 (full build validation)
```

- Tasks 1 & 2 have no dependencies — run in parallel
- Tasks 3–6 depend on Tasks 1 & 2 (need YAML + CompilerStackMap) — run in parallel after Phase A
- Task 7 depends on all above

---

## Task 1: Create Learning Path YAML

**Files:**
- Create: `src/content/paths/graph-compilation-optimization.yaml`

- [ ] **Step 1: Create the YAML file**

```yaml
id: graph-compilation-optimization
title:
  zh: "图编译与优化"
  en: "Graph Compilation & Optimization"
description:
  zh: >-
    深入 ML 编译器的核心：从计算图捕获到优化执行的完整旅程。
    双主线覆盖 PyTorch 2.0（torch.compile / TorchInductor / Triton）和 MLIR（Dialect 体系 / Progressive Lowering）。
    前置路径：AI 计算栈。
  en: >-
    Deep dive into ML compiler internals: the complete journey from graph capture to optimized execution.
    Dual-track coverage of PyTorch 2.0 (torch.compile / TorchInductor / Triton) and MLIR (Dialect system / Progressive Lowering).
    Prerequisite: AI Compute Stack.
level: advanced
prerequisites:
  - ai-compute-stack
articles:
  - ml-compiler-landscape
  - graph-capture-dynamo
  - ir-design-basics
  - ir-progressive-lowering
  - graph-passes-foundations
  - graph-passes-advanced
  - graph-passes-polyhedral
  - operator-fusion-taxonomy
  - operator-fusion-cost-model
  - tiling-memory-hierarchy
  - dynamic-shapes-challenge
  - codegen-instruction-selection
  - codegen-triton-backend
  - quantization-compilation
  - distributed-compilation
  - scheduling-execution
  - autotuning-end-to-end
```

Note: The YAML lists all 17 articles. Articles 5–17 don't exist yet (they're in Phases 2–4), but listing them now is fine — the path page only renders articles that exist.

- [ ] **Step 2: Verify path loads**

Run: `npm run dev`

Navigate to the paths page and confirm the new path appears with correct title and description. Articles that don't exist yet should either not appear or show gracefully.

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/graph-compilation-optimization.yaml
git commit -m "feat(graph-compilation): add learning path YAML with 17 article slugs"
```

---

## Task 2: CompilerStackMap Shared Component

The most important shared component — appears at the top of every article in this path. Full mode in Article 1, compact mode in Articles 2–17.

**Files:**
- Create: `src/components/interactive/CompilerStackMap.tsx`

- [ ] **Step 1: Implement CompilerStackMap**

This component visualizes the ML compilation stack as a vertical layer diagram. Each layer corresponds to one or more articles. The current article is highlighted.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
  currentArticle?: string;   // slug of current article, e.g. 'ir-design-basics'
  mode?: 'full' | 'compact'; // full = Art.1 panorama, compact = Art.2-17 header
}
```

**Data model — the compilation stack layers and article mapping:**

```tsx
interface StackLayer {
  id: string;
  label: { zh: string; en: string };
  track: 'pytorch' | 'mlir' | 'both' | 'convergence';
  articles: { slug: string; title: { zh: string; en: string }; type: 'horizontal' | 'vertical' | 'advanced' }[];
  color: string; // from COLORS
}

const STACK_LAYERS: StackLayer[] = [
  {
    id: 'user-code',
    label: { zh: '用户代码', en: 'User Code' },
    track: 'both',
    articles: [],
    color: COLORS.bgAlt,
  },
  {
    id: 'panorama',
    label: { zh: '全景图', en: 'Panorama' },
    track: 'both',
    articles: [
      { slug: 'ml-compiler-landscape', title: { zh: '1. ML 编译器的世界', en: '1. ML Compiler Landscape' }, type: 'horizontal' },
    ],
    color: COLORS.primary,
  },
  {
    id: 'graph-capture',
    label: { zh: '计算图捕获', en: 'Graph Capture' },
    track: 'pytorch',
    articles: [
      { slug: 'graph-capture-dynamo', title: { zh: '2. TorchDynamo & AOTAutograd', en: '2. TorchDynamo & AOTAutograd' }, type: 'horizontal' },
    ],
    color: '#1976d2', // PyTorch blue
  },
  {
    id: 'ir-design',
    label: { zh: 'IR 设计', en: 'IR Design' },
    track: 'both',
    articles: [
      { slug: 'ir-design-basics', title: { zh: '3. SSA, FX IR & MLIR Dialect', en: '3. SSA, FX IR & MLIR Dialect' }, type: 'horizontal' },
      { slug: 'ir-progressive-lowering', title: { zh: '4. Progressive Lowering', en: '4. Progressive Lowering' }, type: 'horizontal' },
    ],
    color: '#7b1fa2', // purple blend
  },
  {
    id: 'optimization-passes',
    label: { zh: '优化 Pass', en: 'Optimization Passes' },
    track: 'both',
    articles: [
      { slug: 'graph-passes-foundations', title: { zh: '5. 数据流分析 & Pass 基础', en: '5. Dataflow Analysis & Pass Basics' }, type: 'horizontal' },
      { slug: 'graph-passes-advanced', title: { zh: '6. 高级优化 & Pattern Matching', en: '6. Advanced Optimization' }, type: 'horizontal' },
      { slug: 'graph-passes-polyhedral', title: { zh: '7. Polyhedral 优化', en: '7. Polyhedral Optimization' }, type: 'horizontal' },
    ],
    color: '#00838f', // teal
  },
  {
    id: 'operator-fusion',
    label: { zh: '算子融合', en: 'Operator Fusion' },
    track: 'both',
    articles: [
      { slug: 'operator-fusion-taxonomy', title: { zh: '8. 融合类型学', en: '8. Fusion Taxonomy' }, type: 'horizontal' },
      { slug: 'operator-fusion-cost-model', title: { zh: '9. Cost Model', en: '9. Cost Model' }, type: 'horizontal' },
    ],
    color: '#e65100', // orange
  },
  {
    id: 'codegen',
    label: { zh: '代码生成', en: 'Code Generation' },
    track: 'both',
    articles: [
      { slug: 'codegen-instruction-selection', title: { zh: '12. 指令选择 & Vectorization', en: '12. Instruction Selection' }, type: 'horizontal' },
      { slug: 'codegen-triton-backend', title: { zh: '13. Triton & 编译器后端', en: '13. Triton & Backends' }, type: 'horizontal' },
    ],
    color: '#2e7d32', // green
  },
  {
    id: 'scheduling',
    label: { zh: '调度与执行', en: 'Scheduling & Execution' },
    track: 'both',
    articles: [
      { slug: 'scheduling-execution', title: { zh: '16. 调度与执行优化', en: '16. Scheduling' }, type: 'horizontal' },
      { slug: 'autotuning-end-to-end', title: { zh: '17. 自动调优 & 端到端', en: '17. Autotuning & E2E' }, type: 'horizontal' },
    ],
    color: '#c62828', // red
  },
  {
    id: 'hardware',
    label: { zh: '硬件执行', en: 'Hardware Execution' },
    track: 'both',
    articles: [],
    color: COLORS.mid,
  },
];

// Vertical/advanced articles rendered as side annotations
const CROSS_CUTTING: { slug: string; title: { zh: string; en: string }; type: 'vertical' | 'advanced'; layers: string[] }[] = [
  { slug: 'tiling-memory-hierarchy', title: { zh: '10. Tiling & 内存层次', en: '10. Tiling & Memory' }, type: 'vertical', layers: ['optimization-passes', 'operator-fusion', 'codegen', 'scheduling'] },
  { slug: 'dynamic-shapes-challenge', title: { zh: '11. Dynamic Shapes', en: '11. Dynamic Shapes' }, type: 'vertical', layers: ['graph-capture', 'ir-design', 'optimization-passes', 'operator-fusion', 'codegen'] },
  { slug: 'quantization-compilation', title: { zh: '14. 量化编译', en: '14. Quantization Compilation' }, type: 'advanced', layers: ['operator-fusion', 'codegen'] },
  { slug: 'distributed-compilation', title: { zh: '15. 分布式编译', en: '15. Distributed Compilation' }, type: 'advanced', layers: ['optimization-passes', 'scheduling'] },
];
```

**Rendering approach:**

- **Full mode (`mode='full'`)**: Height ~600px. Vertical stack of layers, each a rounded rect. Articles listed inside each layer. Cross-cutting articles shown as vertical bars on the right side spanning their layers. Track indicators (PyTorch blue / MLIR purple / both) on the left edge. Current article (if any) highlighted with border + glow.
- **Compact mode (`mode='compact'`)**: Height ~120px. Same layer structure but minimal (just colored bars with layer labels, no article names). Current article's layer is highlighted and expanded slightly to show the article name. A small "你在这里 / You are here" indicator.

**Key implementation details:**

- Article links: use `<a href={/${locale}/articles/${slug}}>`  for navigation
- Current article highlight: bright border + subtle pulse animation via `motion.rect`
- Track colors: PyTorch = `#1976d2` (blue), MLIR = `#7b1fa2` (purple), Both = gradient, Convergence = `#00838f` (teal)
- Article type badge: horizontal = no badge, vertical = "纵向" badge, advanced = "进阶" badge
- Responsive: SVG viewBox `0 0 800 600` (full) or `0 0 800 120` (compact)

Reference existing component `StackLayerDiagram.tsx` for the layered SVG rendering pattern.

- [ ] **Step 2: Test in dev server**

Create a temporary test page or embed in an existing article to verify both `full` and `compact` modes render correctly:
- Full mode shows all layers with article names
- Compact mode highlights current article
- Click navigation works
- zh/en switching works

Run: `npm run dev`

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/CompilerStackMap.tsx
git commit -m "feat(graph-compilation): add CompilerStackMap shared component (full + compact modes)"
```

---

## Task 3: Article 1 — ML 编译器的世界 (Panorama)

The opening article establishes the mental model for the entire learning path. It uses CompilerStackMap in full mode and introduces two new components.

**Files:**
- Create: `src/components/interactive/EagerVsCompiled.tsx`
- Create: `src/components/interactive/CompilerTimelineChart.tsx`
- Create: `src/content/articles/zh/ml-compiler-landscape.mdx`
- Create: `src/content/articles/en/ml-compiler-landscape.mdx`

### Step Group A: EagerVsCompiled Component

- [ ] **Step 1: Implement EagerVsCompiled**

An animated comparison showing eager execution vs compiled execution of the same computation.

**Data model:**

```tsx
interface OpStep {
  name: string;
  flops: number;       // in MFLOPs
  hbmReads: number;    // in MB
  hbmWrites: number;   // in MB
}

interface Scenario {
  label: { zh: string; en: string };
  eagerSteps: OpStep[];     // each op executes independently
  compiledSteps: OpStep[];  // fused ops, fewer HBM round-trips
  speedup: string;          // e.g. "2.1x"
}

const SCENARIOS: Scenario[] = [
  {
    label: { zh: 'LayerNorm + Linear', en: 'LayerNorm + Linear' },
    eagerSteps: [
      { name: 'LayerNorm: read', flops: 0, hbmReads: 4, hbmWrites: 0 },
      { name: 'LayerNorm: compute', flops: 2, hbmReads: 0, hbmWrites: 0 },
      { name: 'LayerNorm: write', flops: 0, hbmReads: 0, hbmWrites: 4 },
      { name: 'Linear: read', flops: 0, hbmReads: 4, hbmWrites: 0 },
      { name: 'Linear: compute', flops: 8, hbmReads: 0, hbmWrites: 0 },
      { name: 'Linear: write', flops: 0, hbmReads: 0, hbmWrites: 4 },
    ],
    compiledSteps: [
      { name: 'Fused: read', flops: 0, hbmReads: 4, hbmWrites: 0 },
      { name: 'Fused: compute all', flops: 10, hbmReads: 0, hbmWrites: 0 },
      { name: 'Fused: write', flops: 0, hbmReads: 0, hbmWrites: 4 },
    ],
    speedup: '~2x',
  },
  {
    label: { zh: 'Attention Block', en: 'Attention Block' },
    eagerSteps: [
      { name: 'Q projection: read+compute+write', flops: 16, hbmReads: 8, hbmWrites: 4 },
      { name: 'K projection', flops: 16, hbmReads: 8, hbmWrites: 4 },
      { name: 'V projection', flops: 16, hbmReads: 8, hbmWrites: 4 },
      { name: 'Q×Kᵀ', flops: 32, hbmReads: 8, hbmWrites: 16 },
      { name: 'Softmax', flops: 4, hbmReads: 16, hbmWrites: 16 },
      { name: 'Attn×V', flops: 32, hbmReads: 20, hbmWrites: 4 },
    ],
    compiledSteps: [
      { name: 'Fused QKV projection', flops: 48, hbmReads: 8, hbmWrites: 12 },
      { name: 'FlashAttention (tiled)', flops: 68, hbmReads: 12, hbmWrites: 4 },
    ],
    speedup: '~3-4x',
  },
];
```

**Rendering approach:**

- Split view: left = Eager, right = Compiled
- Each side shows a vertical timeline of steps as colored bars
  - Blue bars = HBM read, Red bars = HBM write, Green bars = compute
  - Bar width proportional to data volume / FLOPs
- Animation: steps execute sequentially top-to-bottom with `motion.rect` growing
- Bottom: summary stats — total HBM reads, writes, and speedup badge
- Top: scenario selector buttons to switch between LayerNorm+Linear and Attention Block
- Timing: each step animates over 0.5s, staggered with 0.3s delay

**SVG layout:** viewBox `0 0 800 500`, left half (0–380) = Eager, right half (420–800) = Compiled.

- [ ] **Step 2: Implement CompilerTimelineChart**

A horizontal timeline chart showing the evolution of compiler technologies, color-coded by the three categories (inherited / adapted / ML-original).

**Data model:**

```tsx
interface Milestone {
  year: number;
  label: string;
  category: 'inherited' | 'adapted' | 'original';
  description: { zh: string; en: string };
}

const MILESTONES: Milestone[] = [
  { year: 1986, label: 'SSA Form', category: 'inherited', description: { zh: 'IBM 研究员提出 Static Single Assignment', en: 'IBM researchers propose Static Single Assignment' } },
  { year: 1991, label: 'Cytron et al.', category: 'inherited', description: { zh: 'SSA 高效构造算法发表', en: 'Efficient SSA construction algorithm published' } },
  { year: 1996, label: 'ATLAS', category: 'adapted', description: { zh: 'HPC autotuning 先驱', en: 'HPC autotuning pioneer' } },
  { year: 2000, label: 'Polyhedral', category: 'inherited', description: { zh: 'Polyhedral 编译框架成熟', en: 'Polyhedral compilation framework matures' } },
  { year: 2003, label: 'LLVM', category: 'inherited', description: { zh: 'LLVM 发布，模块化编译器基础设施', en: 'LLVM released: modular compiler infrastructure' } },
  { year: 2016, label: 'XLA', category: 'original', description: { zh: 'Google 为 TensorFlow 构建 ML 编译器', en: 'Google builds ML compiler for TensorFlow' } },
  { year: 2018, label: 'TVM', category: 'original', description: { zh: '端到端 ML 编译框架', en: 'End-to-end ML compilation framework' } },
  { year: 2019, label: 'MLIR', category: 'original', description: { zh: 'Google 提出可扩展多层 IR 框架', en: 'Google proposes extensible multi-level IR framework' } },
  { year: 2020, label: 'Triton', category: 'original', description: { zh: 'Block-level GPU 编程 DSL', en: 'Block-level GPU programming DSL' } },
  { year: 2022, label: 'torch.compile', category: 'original', description: { zh: 'PyTorch 2.0 发布，TorchDynamo + TorchInductor', en: 'PyTorch 2.0: TorchDynamo + TorchInductor' } },
  { year: 2022, label: 'FlashAttention', category: 'original', description: { zh: 'IO-aware attention 算法', en: 'IO-aware attention algorithm' } },
  { year: 2023, label: 'FlashAttention-2', category: 'original', description: { zh: '优化 warp 分配和非 matmul FLOPs', en: 'Optimized warp partitioning' } },
];
```

**Rendering approach:**

- Horizontal timeline (SVG viewBox `0 0 800 400`)
- X-axis = years (1986–2024), Y-axis = stacked milestones
- Each milestone = a circle on the timeline + label above/below (alternating)
- Color by category: inherited = `COLORS.primary` (blue), adapted = `COLORS.orange`, original = `COLORS.green`
- Hover/click a milestone → show description tooltip with `AnimatePresence`
- Legend at top: three colored dots with category labels
- Connection lines between related milestones (e.g., LLVM → MLIR)

- [ ] **Step 3: Verify both components render**

Run: `npm run dev`, embed in a test page or directly test in the Article 1 MDX (next step).

### Step Group B: Article 1 MDX (zh + en)

- [ ] **Step 4: Write Article 1 Chinese version**

Create `src/content/articles/zh/ml-compiler-landscape.mdx`.

**Frontmatter:**

```yaml
---
title: "全景图：ML 编译器的世界"
slug: ml-compiler-landscape
locale: zh
tags: [compiler, pytorch, mlir, triton, optimization]
difficulty: intermediate
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: blog
    title: "PyTorch 2.0: Our next generation release"
    url: "https://pytorch.org/blog/pytorch-2.0-release/"
  - type: website
    title: "MLIR: Multi-Level Intermediate Representation"
    url: "https://mlir.llvm.org/"
  - type: website
    title: "Triton Language and Compiler"
    url: "https://triton-lang.org/"
  - type: paper
    title: "TVM: An Automated End-to-End Optimizing Compiler for Deep Learning"
    url: "https://arxiv.org/abs/1802.04799"
  - type: paper
    title: "MLIR: Scaling Compiler Infrastructure for Domain Specific Computation"
    url: "https://arxiv.org/abs/2002.11054"
  - type: blog
    title: "TorchDynamo: An Experiment in Dynamic Python Bytecode Transformation"
    url: "https://dev-discuss.pytorch.org/t/torchdynamo-an-experiment-in-dynamic-python-bytecode-transformation/361"
---
```

**Imports:**

```tsx
import CompilerStackMap from '../../../components/interactive/CompilerStackMap.tsx';
import EagerVsCompiled from '../../../components/interactive/EagerVsCompiled.tsx';
import CompilerTimelineChart from '../../../components/interactive/CompilerTimelineChart.tsx';
```

**Content structure** (refer to spec Section 2, Article 1 for detailed outlines):

1. `## 简介` — Why this learning path exists. One paragraph framing the problem.
2. `<CompilerStackMap mode="full" client:visible />` — Full compilation stack panorama
3. `## 从性能瓶颈出发` — Eager execution overhead, quantitative example (LayerNorm + Linear HBM reads)
4. `<EagerVsCompiled client:visible />` — Animated eager vs compiled comparison
5. `## 图编译器的价值` — Global view → cross-op optimization, compilation stack layers, GCC/LLVM analogy
6. `## ML 编译器与传统编译器的关系` — Three-way split (40% inherited / 30% adapted / 30% original), table of representative techniques per category
7. `<CompilerTimelineChart client:visible />` — Evolution timeline
8. `## 双主线：PyTorch 2.0 与 MLIR` — Application-level vs infrastructure, Triton as convergence point, layer diagram
9. `## 学习路径导览` — Three article types (横向/纵向/进阶), 17-article roadmap, reading order guidance
10. `## 总结` — Key takeaways, next article preview

**Writing requirements:**
- Minimum 3000 words
- Every technical claim backed by reference
- Web-search to verify all reference URLs are live
- Chinese text, English terms on first appearance with translation
- This is the entry point — difficulty is intermediate, be accessible

- [ ] **Step 5: Write Article 1 English version**

Create `src/content/articles/en/ml-compiler-landscape.mdx`. Same structure and components as zh version, with `locale: en` in frontmatter and all components getting `locale="en"` prop. English content, not a direct translation — adapt explanations for English-reading audience.

- [ ] **Step 6: Verify article renders correctly**

Run: `npm run dev`

- Navigate to `/zh/articles/ml-compiler-landscape` — verify all 3 components render, text flows correctly
- Navigate to `/en/articles/ml-compiler-landscape` — verify English version
- Run: `npm run validate` — verify frontmatter passes validation

- [ ] **Step 7: Commit**

```bash
git add src/components/interactive/EagerVsCompiled.tsx \
        src/components/interactive/CompilerTimelineChart.tsx \
        src/content/articles/zh/ml-compiler-landscape.mdx \
        src/content/articles/en/ml-compiler-landscape.mdx
git commit -m "feat(graph-compilation): add Article 1 — ML compiler panorama with EagerVsCompiled and CompilerTimelineChart"
```

---

## Task 4: Article 2 — 计算图捕获 (Graph Capture)

This article is PyTorch-focused — covers TorchDynamo, AOTAutograd, and Functionalization. Four interactive components.

**Files:**
- Create: `src/components/interactive/DynamoTracingFlow.tsx`
- Create: `src/components/interactive/FXGraphExplorer.tsx`
- Create: `src/components/interactive/GuardSystemDemo.tsx`
- Create: `src/components/interactive/AOTAutogradFlow.tsx`
- Create: `src/content/articles/zh/graph-capture-dynamo.mdx`
- Create: `src/content/articles/en/graph-capture-dynamo.mdx`

### Step Group A: Components

- [ ] **Step 1: Implement DynamoTracingFlow**

Animated step-by-step visualization of TorchDynamo tracing Python code into FX Graph.

**Data model:**

```tsx
interface CodeExample {
  label: { zh: string; en: string };
  pythonCode: string;     // source code (displayed on left)
  bytecodeOps: string[];  // simplified bytecode sequence
  fxNodes: { op: string; target: string; args: string[] }[];  // resulting FX graph nodes
  graphBreaks: number[];  // indices in bytecodeOps where graph break occurs
  breakReason?: { zh: string; en: string };
}

const EXAMPLES: CodeExample[] = [
  {
    label: { zh: '纯计算（无 Graph Break）', en: 'Pure Computation (No Graph Break)' },
    pythonCode: `def fn(x, w):\n    y = x @ w\n    y = y + 1\n    return y.relu()`,
    bytecodeOps: ['LOAD_FAST x', 'LOAD_FAST w', 'BINARY_MATMUL', 'LOAD_CONST 1', 'BINARY_ADD', 'CALL_METHOD relu', 'RETURN_VALUE'],
    fxNodes: [
      { op: 'placeholder', target: 'x', args: [] },
      { op: 'placeholder', target: 'w', args: [] },
      { op: 'call_function', target: 'torch.matmul', args: ['x', 'w'] },
      { op: 'call_function', target: 'torch.add', args: ['matmul', '1'] },
      { op: 'call_method', target: 'relu', args: ['add'] },
      { op: 'output', target: 'output', args: ['relu'] },
    ],
    graphBreaks: [],
  },
  {
    label: { zh: '带 if/else 控制流', en: 'With if/else Control Flow' },
    pythonCode: `def fn(x, flag):\n    y = x * 2\n    if flag:\n        y = y + 1\n    else:\n        y = y - 1\n    return y`,
    bytecodeOps: ['LOAD_FAST x', 'LOAD_CONST 2', 'BINARY_MUL', 'LOAD_FAST flag', 'POP_JUMP_IF_FALSE', '→ GRAPH BREAK', 'LOAD_CONST 1', 'BINARY_ADD/SUB', 'RETURN_VALUE'],
    fxNodes: [
      { op: 'placeholder', target: 'x', args: [] },
      { op: 'call_function', target: 'torch.mul', args: ['x', '2'] },
      { op: 'output', target: 'output', args: ['mul'] },
    ],
    graphBreaks: [5],
    breakReason: { zh: 'data-dependent 控制流无法在编译时确定', en: 'Data-dependent control flow cannot be resolved at compile time' },
  },
  {
    label: { zh: 'Data-Dependent 控制流', en: 'Data-Dependent Control Flow' },
    pythonCode: `def fn(x):\n    if x.sum() > 0:\n        return x * 2\n    return x * 3`,
    bytecodeOps: ['LOAD_FAST x', 'CALL_METHOD sum', 'LOAD_CONST 0', 'COMPARE_OP >', '→ GRAPH BREAK (data-dep)', 'LOAD_FAST x', 'BINARY_MUL'],
    fxNodes: [
      { op: 'placeholder', target: 'x', args: [] },
      { op: 'call_method', target: 'sum', args: ['x'] },
      { op: 'output', target: 'output', args: ['sum'] },
    ],
    graphBreaks: [4],
    breakReason: { zh: 'x.sum() > 0 取决于运行时的 tensor 值', en: 'x.sum() > 0 depends on runtime tensor values' },
  },
];
```

**Rendering approach:**

- Three-column layout: Python Code (left) → Bytecode (center) → FX Graph (right)
- Animation flow: highlight current bytecode op → show corresponding FX node appearing on the right
- Graph breaks shown as red divider line in the bytecode column with explanation tooltip
- Top: example selector tabs
- SVG viewBox `0 0 900 500`
- Use `StepNavigator` pattern for step-through: each step highlights one bytecode→FX mapping

- [ ] **Step 2: Implement FXGraphExplorer**

Interactive FX Graph node inspector — click a node to see its details.

**Data model:**

```tsx
interface FXNode {
  id: string;
  op: 'placeholder' | 'call_function' | 'call_method' | 'call_module' | 'get_attr' | 'output';
  target: string;
  args: string[];       // references to other node ids
  shape: string;        // e.g. '[B, 768]'
  dtype: string;        // e.g. 'float32'
  description: { zh: string; en: string };
  x: number; y: number; // position in graph layout
}
```

**Rendering:**

- DAG layout: nodes as rounded rects connected by arrows
- Node color by op type (placeholder=blue, call_function=green, call_method=teal, output=orange)
- Click a node → detail panel slides in from right showing op, target, shape, dtype, args, description
- Hover → highlight connected edges
- Use a sample Transformer attention graph: `x → linear_q → linear_k → linear_v → matmul → softmax → matmul → linear_out → output`
- SVG viewBox `0 0 800 450`

- [ ] **Step 3: Implement GuardSystemDemo**

Demonstrates how guards work — changing input properties triggers recompilation.

**Data model:**

```tsx
interface GuardCheck {
  type: 'shape' | 'dtype' | 'value';
  condition: string;      // e.g. 'x.shape[0] == 4'
  passes: boolean;
}

interface InputAttempt {
  label: string;          // e.g. 'Attempt 1: shape=[4, 768]'
  shape: string;
  dtype: string;
  guards: GuardCheck[];
  result: 'cache_hit' | 'recompile';
}
```

**Rendering:**

- Left: "Compiled Graph" box (stays static after first compile)
- Center: "Guard Checks" panel showing each guard as a checklist item (✓ green / ✗ red)
- Right: "Result" — either "Cache Hit ✓" (green) or "Recompile ⟳" (orange animation)
- Bottom: sequence of input attempts as buttons, each changing shape/dtype
- Animation: when guard fails, shake animation on the failed guard, then "recompile" spinner
- SVG viewBox `0 0 800 400`

- [ ] **Step 4: Implement AOTAutogradFlow**

Shows how AOTAutograd creates a joint forward+backward graph.

**Data model:**

```tsx
// Two representations of the same computation:
// 1. Forward-only graph (what you'd normally see)
// 2. Joint graph (forward + backward merged) — what AOTAutograd produces

interface GraphNode {
  id: string;
  label: string;
  phase: 'forward' | 'backward' | 'saved';  // saved = tensors kept for backward
  x: number; y: number;
}
```

**Rendering:**

- Two-panel view with animated transition between them
- Panel 1 "Before AOTAutograd": forward graph only, backward computed at runtime
- Panel 2 "After AOTAutograd": joint graph with forward nodes (blue), backward nodes (red), saved tensors (yellow, connecting forward to backward)
- Toggle button or auto-playing step animation
- Key callout: "Saved tensors" highlighted with annotation explaining memory implications
- SVG viewBox `0 0 800 500`

- [ ] **Step 5: Verify all 4 components render**

Run: `npm run dev`, test each component in isolation.

### Step Group B: Article 2 MDX (zh + en)

- [ ] **Step 6: Write Article 2 Chinese version**

Create `src/content/articles/zh/graph-capture-dynamo.mdx`.

**Frontmatter:**

```yaml
---
title: "计算图捕获：TorchDynamo、AOTAutograd 与 Functionalization"
slug: graph-capture-dynamo
locale: zh
tags: [compiler, pytorch, torchdynamo, aotautograd, fx-graph]
prerequisites: [ml-compiler-landscape]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: blog
    title: "TorchDynamo: An Experiment in Dynamic Python Bytecode Transformation"
    url: "https://dev-discuss.pytorch.org/t/torchdynamo-an-experiment-in-dynamic-python-bytecode-transformation/361"
  - type: website
    title: "PEP 523 – Adding a frame evaluation API to CPython"
    url: "https://peps.python.org/pep-0523/"
  - type: blog
    title: "PyTorch 2.0: Our next generation release"
    url: "https://pytorch.org/blog/pytorch-2.0-release/"
  - type: website
    title: "torch.compiler — PyTorch Documentation"
    url: "https://pytorch.org/docs/stable/torch.compiler.html"
  - type: blog
    title: "AOTAutograd: Ahead-of-Time Autograd for PyTorch 2.0"
    url: "https://dev-discuss.pytorch.org/t/functorch-primitives-aotautograd-and-functionalize/707"
---
```

**Imports:**

```tsx
import CompilerStackMap from '../../../components/interactive/CompilerStackMap.tsx';
import DynamoTracingFlow from '../../../components/interactive/DynamoTracingFlow.tsx';
import FXGraphExplorer from '../../../components/interactive/FXGraphExplorer.tsx';
import GuardSystemDemo from '../../../components/interactive/GuardSystemDemo.tsx';
import AOTAutogradFlow from '../../../components/interactive/AOTAutogradFlow.tsx';
```

**Content structure** (refer to spec Section 2, Article 2 for detailed outlines):

1. `<CompilerStackMap mode="compact" currentArticle="graph-capture-dynamo" client:visible />`
2. `## 简介` — Problem: how to get a computational graph from dynamic Python code?
3. `## 问题定义` — Python's dynamic nature, the challenge of graph extraction
4. `## Tracing 策略对比` — torch.jit.trace vs torch.jit.script vs TorchDynamo vs JAX jit vs tf.function. Table comparison. Why TorchDynamo wins.
5. `## TorchDynamo 深入`
   - `### CPython Frame Evaluation Hook (PEP 523)` — How Dynamo hooks into the interpreter
   - `### 字节码分析与符号执行` — Symbolic execution of bytecodes
   - `### Guard 系统` — Shape/type/value guards, guard invalidation
   - `<GuardSystemDemo client:visible />`
   - `### Graph Break` — When Dynamo can't trace, partial graph + Python fallback
   - `<DynamoTracingFlow client:visible />`
   - `### FX Graph 结构` — Graph, Node types, how to print and inspect
   - `<FXGraphExplorer client:visible />`
6. `## AOTAutograd` — Ahead-of-time autograd, joint graph construction
   - `<AOTAutogradFlow client:visible />`
7. `## Functionalization` — In-place op elimination, relationship with AOTAutograd
8. `## torch.compile 端到端流程` — One-line `torch.compile(model)` → full pipeline
9. `## 总结` — Key takeaways

**Writing requirements:**
- Deep technical detail on PEP 523, bytecode tracing, guard system
- Code examples showing FX Graph output (use `torch.fx.symbolic_trace` or `torch.compile` debug output)
- Web-search to verify all reference URLs

- [ ] **Step 7: Write Article 2 English version**

Create `src/content/articles/en/graph-capture-dynamo.mdx`. Same structure, English content, `locale: en`, components get `locale="en"`.

- [ ] **Step 8: Verify and commit**

Run: `npm run validate && npm run dev`
- Navigate to `/zh/articles/graph-capture-dynamo`
- Navigate to `/en/articles/graph-capture-dynamo`
- Verify all 4 components render and interact correctly

```bash
git add src/components/interactive/DynamoTracingFlow.tsx \
        src/components/interactive/FXGraphExplorer.tsx \
        src/components/interactive/GuardSystemDemo.tsx \
        src/components/interactive/AOTAutogradFlow.tsx \
        src/content/articles/zh/graph-capture-dynamo.mdx \
        src/content/articles/en/graph-capture-dynamo.mdx
git commit -m "feat(graph-compilation): add Article 2 — graph capture with DynamoTracingFlow, FXGraphExplorer, GuardSystemDemo, AOTAutogradFlow"
```

---

## Task 5: Article 3 — IR 设计（上）(IR Design Basics)

This article covers both main lines — FX IR (PyTorch) and MLIR Dialect system. Three components focusing on IR concepts.

**Files:**
- Create: `src/components/interactive/IRLayerVisualizer.tsx`
- Create: `src/components/interactive/DialectExplorer.tsx`
- Create: `src/components/interactive/SSAVisualizer.tsx`
- Create: `src/content/articles/zh/ir-design-basics.mdx`
- Create: `src/content/articles/en/ir-design-basics.mdx`

### Step Group A: Components

- [ ] **Step 1: Implement IRLayerVisualizer**

Shows the same computation represented at different IR levels — from Python down to LLVM IR.

**Data model:**

```tsx
interface IRLevel {
  id: string;
  label: { zh: string; en: string };
  track: 'pytorch' | 'mlir' | 'llvm';
  code: string;   // the IR text representation
  highlights: { line: number; color: string; note: { zh: string; en: string } }[];
}

// Example: simple matmul + relu
const IR_LEVELS: IRLevel[] = [
  {
    id: 'python',
    label: { zh: 'Python 源码', en: 'Python Source' },
    track: 'pytorch',
    code: `def fn(x, w):\n    y = torch.matmul(x, w)\n    return torch.relu(y)`,
    highlights: [],
  },
  {
    id: 'fx',
    label: { zh: 'FX Graph (PyTorch)', en: 'FX Graph (PyTorch)' },
    track: 'pytorch',
    code: `graph():\n    %x : [#users=1] = placeholder[target=x]\n    %w : [#users=1] = placeholder[target=w]\n    %matmul : [#users=1] = call_function[target=torch.matmul](x, w)\n    %relu : [#users=1] = call_function[target=torch.relu](matmul)\n    return (relu,)`,
    highlights: [
      { line: 1, color: COLORS.primary, note: { zh: 'placeholder = 函数参数', en: 'placeholder = function arguments' } },
      { line: 3, color: COLORS.green, note: { zh: 'call_function = 算子调用', en: 'call_function = operator call' } },
    ],
  },
  {
    id: 'linalg',
    label: { zh: 'MLIR Linalg Dialect', en: 'MLIR Linalg Dialect' },
    track: 'mlir',
    code: `func.func @fn(%x: tensor<128x768xf32>, %w: tensor<768x768xf32>) -> tensor<128x768xf32> {\n  %c0 = arith.constant 0.0 : f32\n  %init = tensor.empty() : tensor<128x768xf32>\n  %fill = linalg.fill ins(%c0) outs(%init) -> tensor<128x768xf32>\n  %matmul = linalg.matmul ins(%x, %w) outs(%fill) -> tensor<128x768xf32>\n  %relu = linalg.generic {\n    indexing_maps = [...], iterator_types = ["parallel", "parallel"]\n  } ins(%matmul) {\n    ^bb0(%in: f32):\n      %zero = arith.constant 0.0 : f32\n      %res = arith.maximumf %in, %zero : f32\n      linalg.yield %res : f32\n  } -> tensor<128x768xf32>\n  return %relu : tensor<128x768xf32>\n}`,
    highlights: [
      { line: 0, color: COLORS.purple, note: { zh: 'tensor 类型 = 值语义', en: 'tensor type = value semantics' } },
      { line: 4, color: COLORS.green, note: { zh: 'linalg.matmul = tensor-level 算子', en: 'linalg.matmul = tensor-level op' } },
    ],
  },
  {
    id: 'memref',
    label: { zh: 'MLIR Memref (Bufferized)', en: 'MLIR Memref (Bufferized)' },
    track: 'mlir',
    code: `func.func @fn(%x: memref<128x768xf32>, %w: memref<768x768xf32>, %out: memref<128x768xf32>) {\n  linalg.matmul ins(%x, %w : memref<128x768xf32>, memref<768x768xf32>)\n               outs(%out : memref<128x768xf32>)\n  linalg.generic {...} ins(%out) outs(%out)\n  return\n}`,
    highlights: [
      { line: 0, color: COLORS.orange, note: { zh: 'memref = 引用语义，指向内存 buffer', en: 'memref = reference semantics, points to memory buffer' } },
    ],
  },
  {
    id: 'llvm',
    label: { zh: 'LLVM IR', en: 'LLVM IR' },
    track: 'llvm',
    code: `define void @fn(float* %x, float* %w, float* %out) {\nentry:\n  ; nested loops for matmul\n  br label %loop.i\nloop.i:\n  %i = phi i64 [0, %entry], [%i.next, %loop.i.end]\n  ...\n  %val = fmul float %a, %b\n  %acc = fadd float %prev, %val\n  ...\n  ; relu: max(val, 0.0)\n  %relu = call float @llvm.maximum.f32(float %acc, float 0.0)\n  store float %relu, float* %out.ptr\n  ...\n}`,
    highlights: [
      { line: 5, color: COLORS.red, note: { zh: 'phi = SSA 控制流汇合', en: 'phi = SSA control flow merge' } },
    ],
  },
];
```

**Rendering approach:**

- Vertical tab selector on the left: click a level to view its IR code
- Right side: code panel with syntax highlighting (monospace text, colored keywords)
- Highlighted lines have colored left border + tooltip on hover
- Transition: `AnimatePresence` fade between IR levels
- Between adjacent levels: arrow with annotation "lowering: 这一步做了什么" / "lowering: what this step does"
- SVG viewBox `0 0 800 500` or HTML-based layout with Tailwind

- [ ] **Step 2: Implement DialectExplorer**

Interactive MLIR dialect hierarchy — shows dialects at different abstraction levels and their lowering relationships.

**Data model:**

```tsx
interface Dialect {
  id: string;
  name: string;
  level: 'high' | 'mid' | 'low' | 'hardware';
  description: { zh: string; en: string };
  exampleOps: string[];   // e.g. ['linalg.matmul', 'linalg.generic']
  lowerTo: string[];      // dialect ids it can lower to
  color: string;
}

const DIALECTS: Dialect[] = [
  { id: 'linalg', name: 'Linalg', level: 'high', description: { zh: '线性代数运算的 tensor-level 抽象', en: 'Tensor-level linear algebra abstractions' }, exampleOps: ['linalg.matmul', 'linalg.generic', 'linalg.fill'], lowerTo: ['scf', 'memref'], color: '#1565c0' },
  { id: 'tensor', name: 'Tensor', level: 'high', description: { zh: 'Tensor 类型操作（值语义）', en: 'Tensor type operations (value semantics)' }, exampleOps: ['tensor.empty', 'tensor.extract_slice', 'tensor.insert_slice'], lowerTo: ['memref'], color: '#1976d2' },
  { id: 'scf', name: 'SCF', level: 'mid', description: { zh: '结构化控制流（for、while、if）', en: 'Structured Control Flow (for, while, if)' }, exampleOps: ['scf.for', 'scf.while', 'scf.if', 'scf.yield'], lowerTo: ['cf'], color: '#7b1fa2' },
  { id: 'memref', name: 'MemRef', level: 'mid', description: { zh: '内存引用（引用语义，指向 buffer）', en: 'Memory references (reference semantics)' }, exampleOps: ['memref.alloc', 'memref.load', 'memref.store', 'memref.dealloc'], lowerTo: ['llvm'], color: '#00838f' },
  { id: 'arith', name: 'Arith', level: 'mid', description: { zh: '标量算术运算', en: 'Scalar arithmetic operations' }, exampleOps: ['arith.addf', 'arith.mulf', 'arith.constant', 'arith.cmpf'], lowerTo: ['llvm'], color: '#e65100' },
  { id: 'cf', name: 'CF', level: 'low', description: { zh: '非结构化控制流（br、cond_br）', en: 'Unstructured control flow (br, cond_br)' }, exampleOps: ['cf.br', 'cf.cond_br'], lowerTo: ['llvm'], color: '#6a1b9a' },
  { id: 'gpu', name: 'GPU', level: 'mid', description: { zh: 'GPU 抽象（launch、barrier）', en: 'GPU abstractions (launch, barrier)' }, exampleOps: ['gpu.launch', 'gpu.barrier', 'gpu.thread_id'], lowerTo: ['nvvm', 'rocdl', 'spirv'], color: '#2e7d32' },
  { id: 'llvm', name: 'LLVM', level: 'low', description: { zh: 'LLVM IR 的 MLIR 表示', en: 'LLVM IR representation in MLIR' }, exampleOps: ['llvm.load', 'llvm.store', 'llvm.fadd', 'llvm.call'], lowerTo: [], color: '#c62828' },
  { id: 'nvvm', name: 'NVVM', level: 'hardware', description: { zh: 'NVIDIA GPU 特定指令', en: 'NVIDIA GPU specific instructions' }, exampleOps: ['nvvm.read.ptx.sreg.tid.x', 'nvvm.barrier0'], lowerTo: [], color: '#76b900' },
];
```

**Rendering approach:**

- Layered layout: high-level dialects at top, low-level at bottom, hardware at very bottom
- Each dialect = a card with name and colored badge
- Arrows between dialects showing lowering direction
- Click a dialect → detail panel expands showing description + example ops
- Hover on arrow → tooltip "lowering: what transforms happen"
- SVG viewBox `0 0 800 550`

- [ ] **Step 3: Implement SSAVisualizer**

Shows conversion from non-SSA to SSA form with phi nodes.

**Data model:**

```tsx
interface CodeLine {
  text: string;
  variable?: string;     // variable being assigned
  version?: number;       // SSA version (x_1, x_2, etc.)
  isPhi?: boolean;
  phiSources?: string[]; // e.g. ['x_1 from if-branch', 'x_2 from else-branch']
}

// Example: if-else with variable reassignment
const NON_SSA: CodeLine[] = [
  { text: 'x = input', variable: 'x' },
  { text: 'if condition:' },
  { text: '  x = x + 1', variable: 'x' },   // reassigns x!
  { text: 'else:' },
  { text: '  x = x * 2', variable: 'x' },   // reassigns x again!
  { text: 'return x' },
];

const SSA: CodeLine[] = [
  { text: 'x_0 = input', variable: 'x', version: 0 },
  { text: 'if condition:' },
  { text: '  x_1 = x_0 + 1', variable: 'x', version: 1 },
  { text: 'else:' },
  { text: '  x_2 = x_0 * 2', variable: 'x', version: 2 },
  { text: 'x_3 = φ(x_1, x_2)', variable: 'x', version: 3, isPhi: true, phiSources: ['x_1 (if-branch)', 'x_2 (else-branch)'] },
  { text: 'return x_3' },
];
```

**Rendering approach:**

- Two-panel layout: left = "Before SSA", right = "After SSA"
- Code as monospace text with line numbers
- Variable assignments color-coded: each version of `x` gets a different shade
- SSA panel: phi node highlighted with special icon (φ) and arrows from both branches
- Below: use-def chain visualization — arrows from each use of `x_i` back to its unique definition
- Animation: step through the conversion — first show non-SSA, then animate each variable getting renamed, then phi node appearing
- SVG viewBox `0 0 800 450`

- [ ] **Step 4: Verify all 3 components render**

Run: `npm run dev`, test each component.

### Step Group B: Article 3 MDX (zh + en)

- [ ] **Step 5: Write Article 3 Chinese version**

Create `src/content/articles/zh/ir-design-basics.mdx`.

**Frontmatter:**

```yaml
---
title: "IR 设计（上）：SSA、FX IR 与 MLIR Dialect"
slug: ir-design-basics
locale: zh
tags: [compiler, ir, ssa, pytorch, mlir, fx-graph, dialect]
prerequisites: [graph-capture-dynamo]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "Efficiently Computing Static Single Assignment Form and the Control Dependence Graph"
    url: "https://dl.acm.org/doi/10.1145/115372.115320"
  - type: website
    title: "torch.fx — PyTorch Documentation"
    url: "https://pytorch.org/docs/stable/fx.html"
  - type: paper
    title: "MLIR: Scaling Compiler Infrastructure for Domain Specific Computation"
    url: "https://arxiv.org/abs/2002.11054"
  - type: website
    title: "MLIR Language Reference"
    url: "https://mlir.llvm.org/docs/LangRef/"
  - type: website
    title: "MLIR Dialects"
    url: "https://mlir.llvm.org/docs/Dialects/"
---
```

**Imports:**

```tsx
import CompilerStackMap from '../../../components/interactive/CompilerStackMap.tsx';
import IRLayerVisualizer from '../../../components/interactive/IRLayerVisualizer.tsx';
import DialectExplorer from '../../../components/interactive/DialectExplorer.tsx';
import SSAVisualizer from '../../../components/interactive/SSAVisualizer.tsx';
```

**Content structure** (refer to spec Section 2, Article 3):

1. `<CompilerStackMap mode="compact" currentArticle="ir-design-basics" client:visible />`
2. `## 简介` — What is IR, why do we need it?
3. `## IR 基础概念` — Source→IR→Machine code, separation of concerns, good IR design principles
4. `## SSA 形式 (Static Single Assignment)` — Why SSA is foundational, core rule (single assignment), phi nodes, use-def chains, how SSA simplifies DCE/constant propagation
   - `<SSAVisualizer client:visible />`
5. `## FX IR 详解` — Graph + Node structure, node types, Python-level IR, advantages and limitations
6. `## MLIR 的设计哲学` — Problem: IR fragmentation, MLIR's answer: framework for building IRs, Dialect system, Operation/Region/Block, type system
   - `<DialectExplorer client:visible />`
7. `## 多层 IR 对比` — Same computation across IR levels
   - `<IRLayerVisualizer client:visible />`
8. `## FX IR vs MLIR Dialect 对比` — Table: design goals, expressiveness, extensibility, type system, ecosystem
9. `## 总结` — Key takeaways, preview of Article 4 (Progressive Lowering)

- [ ] **Step 6: Write Article 3 English version**

Create `src/content/articles/en/ir-design-basics.mdx`. Same structure, English content, `locale: en`.

- [ ] **Step 7: Verify and commit**

Run: `npm run validate && npm run dev`

```bash
git add src/components/interactive/IRLayerVisualizer.tsx \
        src/components/interactive/DialectExplorer.tsx \
        src/components/interactive/SSAVisualizer.tsx \
        src/content/articles/zh/ir-design-basics.mdx \
        src/content/articles/en/ir-design-basics.mdx
git commit -m "feat(graph-compilation): add Article 3 — IR design basics with IRLayerVisualizer, DialectExplorer, SSAVisualizer"
```

---

## Task 6: Article 4 — IR 设计（下）(Progressive Lowering)

This article is MLIR-focused — progressive lowering, dialect conversion framework, bufferization. Three components.

**Files:**
- Create: `src/components/interactive/ProgressiveLoweringAnimation.tsx`
- Create: `src/components/interactive/DialectConversionDemo.tsx`
- Create: `src/components/interactive/BufferizationVisualizer.tsx`
- Create: `src/content/articles/zh/ir-progressive-lowering.mdx`
- Create: `src/content/articles/en/ir-progressive-lowering.mdx`

### Step Group A: Components

- [ ] **Step 1: Implement ProgressiveLoweringAnimation**

The core component of this article — animates 5–6 levels of lowering from high-level linalg down to LLVM IR.

**Data model:**

```tsx
interface LoweringLevel {
  id: string;
  label: { zh: string; en: string };
  dialect: string;                  // e.g. 'linalg', 'scf+memref', 'llvm'
  irSnippet: string;                // the IR at this level
  whatChanged: { zh: string; en: string };  // explanation of this lowering step
  whatLost: { zh: string; en: string };     // what high-level info was lost
  whatGained: { zh: string; en: string };   // what low-level detail was gained
}

interface LoweringExample {
  label: { zh: string; en: string };
  levels: LoweringLevel[];
}

const EXAMPLES: LoweringExample[] = [
  {
    label: { zh: '矩阵乘法 (matmul)', en: 'Matrix Multiplication (matmul)' },
    levels: [
      {
        id: 'linalg-tensor',
        label: { zh: 'Linalg on Tensors', en: 'Linalg on Tensors' },
        dialect: 'linalg + tensor',
        irSnippet: `%result = linalg.matmul\n    ins(%A, %B : tensor<128x768xf32>, tensor<768x768xf32>)\n    outs(%C : tensor<128x768xf32>) -> tensor<128x768xf32>`,
        whatChanged: { zh: '起点：tensor-level 的矩阵乘法', en: 'Starting point: tensor-level matmul' },
        whatLost: { zh: '（起点，无损失）', en: '(starting point, nothing lost)' },
        whatGained: { zh: '高层语义：编译器知道这是 matmul', en: 'High-level semantics: compiler knows this is matmul' },
      },
      {
        id: 'linalg-buffer',
        label: { zh: 'Linalg on Buffers', en: 'Linalg on Buffers' },
        dialect: 'linalg + memref',
        irSnippet: `%A_buf = memref.alloc() : memref<128x768xf32>\nmemref.copy %A_tensor, %A_buf\nlinalg.matmul\n    ins(%A_buf, %B_buf : memref<128x768xf32>, memref<768x768xf32>)\n    outs(%C_buf : memref<128x768xf32>)`,
        whatChanged: { zh: 'Bufferization: tensor → memref', en: 'Bufferization: tensor → memref' },
        whatLost: { zh: '值语义（不可变性）', en: 'Value semantics (immutability)' },
        whatGained: { zh: '具体的内存 buffer 分配', en: 'Concrete memory buffer allocation' },
      },
      {
        id: 'scf-loops',
        label: { zh: 'SCF Loops', en: 'SCF Loops' },
        dialect: 'scf + memref + arith',
        irSnippet: `scf.for %i = 0 to 128 step 1 {\n  scf.for %j = 0 to 768 step 1 {\n    scf.for %k = 0 to 768 step 1 {\n      %a = memref.load %A_buf[%i, %k] : memref<128x768xf32>\n      %b = memref.load %B_buf[%k, %j] : memref<768x768xf32>\n      %prev = memref.load %C_buf[%i, %j] : memref<128x768xf32>\n      %prod = arith.mulf %a, %b : f32\n      %sum = arith.addf %prev, %prod : f32\n      memref.store %sum, %C_buf[%i, %j] : memref<128x768xf32>\n    }\n  }\n}`,
        whatChanged: { zh: 'linalg.matmul → 三重嵌套循环', en: 'linalg.matmul → triple nested loop' },
        whatLost: { zh: '"这是 matmul" 的语义信息', en: '"This is matmul" semantic information' },
        whatGained: { zh: '循环结构，可以做 tiling/unrolling', en: 'Loop structure, enabling tiling/unrolling' },
      },
      {
        id: 'gpu-launch',
        label: { zh: 'GPU Launch', en: 'GPU Launch' },
        dialect: 'gpu + scf + memref',
        irSnippet: `gpu.launch blocks(%bx, %by) in (%gx = 4, %gy = 24)\n    threads(%tx, %ty) in (%bdx = 32, %bdy = 32) {\n  // tiled loop inside thread block\n  %i = %bx * 32 + %tx\n  %j = %by * 32 + %ty\n  scf.for %k = 0 to 768 step 1 {\n    %a = memref.load %A_buf[%i, %k]\n    %b = memref.load %B_buf[%k, %j]\n    ...\n  }\n  gpu.terminator\n}`,
        whatChanged: { zh: '循环 → GPU grid/block/thread 映射', en: 'Loops → GPU grid/block/thread mapping' },
        whatLost: { zh: '硬件无关性', en: 'Hardware independence' },
        whatGained: { zh: 'GPU 并行执行模型', en: 'GPU parallel execution model' },
      },
      {
        id: 'llvm',
        label: { zh: 'LLVM IR', en: 'LLVM IR' },
        dialect: 'llvm',
        irSnippet: `define void @matmul_kernel(float* %A, float* %B, float* %C) {\n  %tid.x = call i32 @llvm.nvvm.read.ptx.sreg.tid.x()\n  %bid.x = call i32 @llvm.nvvm.read.ptx.sreg.ctaid.x()\n  %i = add i32 %tid.x, ...\n  %a_ptr = getelementptr float, float* %A, i64 %idx\n  %a = load float, float* %a_ptr\n  %prod = fmul float %a, %b\n  %acc = fadd float %prev, %prod\n  store float %acc, float* %c_ptr\n  ret void\n}`,
        whatChanged: { zh: 'GPU dialect → LLVM + NVVM intrinsics', en: 'GPU dialect → LLVM + NVVM intrinsics' },
        whatLost: { zh: 'GPU 抽象（变成 NVVM intrinsic call）', en: 'GPU abstraction (becomes NVVM intrinsic calls)' },
        whatGained: { zh: '可以直接生成 PTX', en: 'Can directly generate PTX' },
      },
    ],
  },
  // Second example: LayerNorm (simpler, different lowering path)
  {
    label: { zh: 'LayerNorm', en: 'LayerNorm' },
    levels: [
      {
        id: 'linalg-tensor',
        label: { zh: 'Linalg Generic', en: 'Linalg Generic' },
        dialect: 'linalg',
        irSnippet: `// mean = reduce_sum(x) / N\n%sum = linalg.generic {iterator_types = ["reduction"]} ins(%x) ...\n%mean = arith.divf %sum, %N\n// var = reduce_sum((x - mean)^2) / N\n%var = linalg.generic {...} ins(%x, %mean) ...\n// result = (x - mean) / sqrt(var + eps) * gamma + beta\n%norm = linalg.generic {iterator_types = ["parallel"]} ins(%x, %mean, %var, %gamma, %beta) ...`,
        whatChanged: { zh: '起点：LayerNorm 分解为 reduce + elementwise', en: 'Start: LayerNorm decomposed to reduce + elementwise' },
        whatLost: { zh: '（起点）', en: '(starting point)' },
        whatGained: { zh: '可以分别优化 reduce 和 elementwise 部分', en: 'Can optimize reduce and elementwise parts separately' },
      },
      {
        id: 'fused',
        label: { zh: 'Fused Kernel', en: 'Fused Kernel' },
        dialect: 'scf + memref',
        irSnippet: `// All operations fused into single loop\nscf.for %i = 0 to %batch {\n  // Pass 1: compute mean and variance\n  %sum = 0.0, %sq_sum = 0.0\n  scf.for %j = 0 to %hidden {\n    %val = memref.load %x[%i, %j]\n    %sum += %val\n    %sq_sum += %val * %val\n  }\n  %mean = %sum / %hidden\n  %var = %sq_sum / %hidden - %mean * %mean\n  // Pass 2: normalize\n  scf.for %j = 0 to %hidden {\n    %val = memref.load %x[%i, %j]\n    %norm = (%val - %mean) / sqrt(%var + %eps)\n    %out = %norm * %gamma[%j] + %beta[%j]\n    memref.store %out, %result[%i, %j]\n  }\n}`,
        whatChanged: { zh: '多个 linalg op → 融合为单循环', en: 'Multiple linalg ops → fused into single loop' },
        whatLost: { zh: '独立算子的模块性', en: 'Individual operator modularity' },
        whatGained: { zh: '只读一次 HBM，性能大幅提升', en: 'Single HBM read, major performance gain' },
      },
    ],
  },
];
```

**Rendering approach:**

- Example selector tabs at top (matmul / LayerNorm)
- Vertical stepper: each level is a "step" with its IR code panel
- Step-through animation: click "Next" to lower one level, highlights the changed parts
- Right side panel: "这一步做了什么 / 丢失了什么 / 获得了什么" info card
- Color gradient from top (blue = high-level) to bottom (red = low-level)
- Use `StepNavigator` as the step-through mechanism
- Each step shows the IR code in a monospace box with keyword highlighting

- [ ] **Step 2: Implement DialectConversionDemo**

Shows a single RewritePattern matching and replacing IR operations.

**Data model:**

```tsx
interface PatternDemo {
  label: { zh: string; en: string };
  patternTemplate: string;     // the pattern to match (left side)
  replacementTemplate: string; // the replacement (right side)
  beforeIR: string;            // IR before the pattern is applied
  afterIR: string;             // IR after
  matchedRegion: { startLine: number; endLine: number }; // lines matched in beforeIR
}

const PATTERNS: PatternDemo[] = [
  {
    label: { zh: 'linalg.matmul → scf.for 循环', en: 'linalg.matmul → scf.for loops' },
    patternTemplate: `// Pattern: match linalg.matmul\nlinalg.matmul\n  ins(%A, %B : memref<?x?xf32>, memref<?x?xf32>)\n  outs(%C : memref<?x?xf32>)`,
    replacementTemplate: `// Replacement: expand to triple loop\nscf.for %i = 0 to %M step 1 {\n  scf.for %j = 0 to %N step 1 {\n    scf.for %k = 0 to %K step 1 {\n      %a = memref.load %A[%i, %k]\n      %b = memref.load %B[%k, %j]\n      %c = memref.load %C[%i, %j]\n      %prod = arith.mulf %a, %b\n      %sum = arith.addf %c, %prod\n      memref.store %sum, %C[%i, %j]\n    }\n  }\n}`,
    beforeIR: `func.func @fn(%A: memref<128x768xf32>, %B: memref<768x768xf32>, %C: memref<128x768xf32>) {\n  linalg.matmul ins(%A, %B) outs(%C)\n  return\n}`,
    afterIR: `func.func @fn(%A: memref<128x768xf32>, %B: memref<768x768xf32>, %C: memref<128x768xf32>) {\n  scf.for %i = 0 to 128 {\n    scf.for %j = 0 to 768 {\n      scf.for %k = 0 to 768 {\n        // load, mul, add, store\n      }\n    }\n  }\n  return\n}`,
    matchedRegion: { startLine: 1, endLine: 1 },
  },
];
```

**Rendering approach:**

- Three-panel animation:
  1. Left panel: "Pattern" template (what to find)
  2. Center panel: "IR Before" with the matched region highlighted
  3. Animation: matched region glows → slides out → replacement slides in
  4. Result: "IR After" with replacement highlighted in green
- Step-through: "Match" button → "Replace" button → show final result
- SVG viewBox `0 0 800 400`

- [ ] **Step 3: Implement BufferizationVisualizer**

Shows how tensors map to memory buffers during bufferization.

**Data model:**

```tsx
interface TensorInfo {
  id: string;
  name: string;
  shape: string;         // e.g. '[128, 768]'
  sizeBytes: number;     // in KB
  lastUse: string;       // op name where last used
}

interface BufferAllocation {
  bufferId: string;
  tensors: string[];     // tensor ids sharing this buffer
  sizeKB: number;
  reason: { zh: string; en: string }; // why these tensors share / don't share
  isInPlace: boolean;
}

// Example: a small computation graph
const TENSORS: TensorInfo[] = [
  { id: 'x', name: 'input x', shape: '[128, 768]', sizeBytes: 384, lastUse: 'matmul' },
  { id: 'w', name: 'weight w', shape: '[768, 768]', sizeBytes: 2304, lastUse: 'matmul' },
  { id: 'matmul_out', name: 'matmul result', shape: '[128, 768]', sizeBytes: 384, lastUse: 'relu' },
  { id: 'relu_out', name: 'relu result', shape: '[128, 768]', sizeBytes: 384, lastUse: 'output' },
];

const BUFFERS: BufferAllocation[] = [
  { bufferId: 'buf_0', tensors: ['x'], sizeKB: 384, reason: { zh: '输入参数，独立 buffer', en: 'Input parameter, separate buffer' }, isInPlace: false },
  { bufferId: 'buf_1', tensors: ['w'], sizeKB: 2304, reason: { zh: '权重参数，独立 buffer', en: 'Weight parameter, separate buffer' }, isInPlace: false },
  { bufferId: 'buf_2', tensors: ['matmul_out', 'relu_out'], sizeKB: 384, reason: { zh: 'relu 可以 in-place：matmul_out 在 relu 后不再使用', en: 'relu can be in-place: matmul_out not used after relu' }, isInPlace: true },
];
```

**Rendering approach:**

- Left side: tensor computation graph (nodes with tensor names and shapes)
- Right side: memory buffer layout (colored blocks representing buffers)
- Arrows from tensors to their assigned buffers
- In-place buffers highlighted with special "in-place" badge
- Animation: start with all tensors → analyze lifetimes → merge compatible tensors → show final buffer layout
- Total memory comparison: naive (one buffer per tensor) vs optimized (with sharing)
- SVG viewBox `0 0 800 450`

- [ ] **Step 4: Verify all 3 components render**

Run: `npm run dev`, test each component.

### Step Group B: Article 4 MDX (zh + en)

- [ ] **Step 5: Write Article 4 Chinese version**

Create `src/content/articles/zh/ir-progressive-lowering.mdx`.

**Frontmatter:**

```yaml
---
title: "IR 设计（下）：Progressive Lowering 与多层 IR"
slug: ir-progressive-lowering
locale: zh
tags: [compiler, mlir, progressive-lowering, dialect-conversion, bufferization]
prerequisites: [ir-design-basics]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "MLIR: Scaling Compiler Infrastructure for Domain Specific Computation"
    url: "https://arxiv.org/abs/2002.11054"
  - type: website
    title: "MLIR Dialect Conversion"
    url: "https://mlir.llvm.org/docs/DialectConversion/"
  - type: website
    title: "MLIR Bufferization"
    url: "https://mlir.llvm.org/docs/Bufferization/"
  - type: website
    title: "MLIR Pass Infrastructure"
    url: "https://mlir.llvm.org/docs/PassManagement/"
  - type: repo
    title: "torch-mlir: PyTorch to MLIR compiler"
    url: "https://github.com/llvm/torch-mlir"
---
```

**Imports:**

```tsx
import CompilerStackMap from '../../../components/interactive/CompilerStackMap.tsx';
import ProgressiveLoweringAnimation from '../../../components/interactive/ProgressiveLoweringAnimation.tsx';
import DialectConversionDemo from '../../../components/interactive/DialectConversionDemo.tsx';
import BufferizationVisualizer from '../../../components/interactive/BufferizationVisualizer.tsx';
```

**Content structure** (refer to spec Section 2, Article 4):

1. `<CompilerStackMap mode="compact" currentArticle="ir-progressive-lowering" client:visible />`
2. `## 简介` — Progressive lowering is MLIR's core design principle
3. `## Progressive Lowering 核心思想` — One lowering step = one concern, preserve high-level info as long as possible, analogy (cooking steps)
   - `<ProgressiveLoweringAnimation client:visible />`
4. `## Lowering 路径示例` — matmul lowering through 5 levels, information loss/gain analysis at each step
5. `## Dialect Conversion 框架` — ConversionTarget, RewritePattern, TypeConverter, partial lowering
   - `<DialectConversionDemo client:visible />`
6. `## Bufferization 深入` — tensor→memref, why it's complex, one-shot bufferization, in-place analysis
   - `<BufferizationVisualizer client:visible />`
7. `## 实战：torch-mlir 的 Lowering Pipeline` — Torch dialect → Linalg/Arith → Bufferization → LLVM (note: verify against latest version)
8. `## 对比单层 IR 的局限` — TVM Relay→TIR evolution, XLA HLO as "relatively flat" IR
9. `## 总结` — Key takeaways, preview Phase 2 topics (optimization passes)

- [ ] **Step 6: Write Article 4 English version**

Create `src/content/articles/en/ir-progressive-lowering.mdx`. Same structure, English content, `locale: en`.

- [ ] **Step 7: Verify and commit**

Run: `npm run validate && npm run dev`

```bash
git add src/components/interactive/ProgressiveLoweringAnimation.tsx \
        src/components/interactive/DialectConversionDemo.tsx \
        src/components/interactive/BufferizationVisualizer.tsx \
        src/content/articles/zh/ir-progressive-lowering.mdx \
        src/content/articles/en/ir-progressive-lowering.mdx
git commit -m "feat(graph-compilation): add Article 4 — progressive lowering with ProgressiveLoweringAnimation, DialectConversionDemo, BufferizationVisualizer"
```

---

## Task 7: Full Build Validation & Integration Test

**Dependencies:** All Tasks 1–6 must be complete.

- [ ] **Step 1: Run content validation**

```bash
npm run validate
```

Expected: All 8 new MDX files (4 zh + 4 en) pass frontmatter validation. No errors.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors. All new pages are generated.

- [ ] **Step 3: Visual verification checklist**

Run `npm run dev` and verify each page:

| Page | Checks |
|------|--------|
| `/zh/articles/ml-compiler-landscape` | CompilerStackMap (full), EagerVsCompiled, CompilerTimelineChart all render; text is readable; components are interactive |
| `/en/articles/ml-compiler-landscape` | Same components with English text |
| `/zh/articles/graph-capture-dynamo` | CompilerStackMap (compact, highlights Art.2), DynamoTracingFlow, FXGraphExplorer, GuardSystemDemo, AOTAutogradFlow all render |
| `/en/articles/graph-capture-dynamo` | English version |
| `/zh/articles/ir-design-basics` | CompilerStackMap (compact, highlights Art.3), IRLayerVisualizer, DialectExplorer, SSAVisualizer all render |
| `/en/articles/ir-design-basics` | English version |
| `/zh/articles/ir-progressive-lowering` | CompilerStackMap (compact, highlights Art.4), ProgressiveLoweringAnimation, DialectConversionDemo, BufferizationVisualizer all render |
| `/en/articles/ir-progressive-lowering` | English version |
| Learning path page | `graph-compilation-optimization` path shows up; Articles 1–4 are listed and linked |

- [ ] **Step 4: Cross-article navigation**

- CompilerStackMap links between articles work
- `prerequisites` links in frontmatter render correctly (Art.2 → Art.1, Art.3 → Art.2, Art.4 → Art.3)
- Path page lists articles in correct order

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(graph-compilation): Phase 1 integration fixes"
```

---

## Self-Review Checklist

### 1. Spec Coverage

| Spec Requirement | Plan Task |
|-----------------|-----------|
| Path YAML (`graph-compilation-optimization.yaml`) | Task 1 |
| CompilerStackMap (full + compact modes) | Task 2 |
| Article 1: ML Compiler Panorama + 3 components | Task 3 |
| Article 2: Graph Capture + 4 components | Task 4 |
| Article 3: IR Design Basics + 3 components | Task 5 |
| Article 4: Progressive Lowering + 3 components | Task 6 |
| Build validation | Task 7 |
| Bilingual (zh + en) for all articles | Tasks 3–6 (each has zh + en steps) |
| `CompilerStackMap` at top of every article | Tasks 3–6 (each article imports it) |
| Dual main line (PyTorch + MLIR) | Art.1 both, Art.2 PyTorch, Art.3 both, Art.4 MLIR — matches spec |
| 13 interactive components total | 1 shared + 2 (Art.1) + 4 (Art.2) + 3 (Art.3) + 3 (Art.4) = 13 ✓ |
| References verified | Each article's frontmatter includes real URLs; subagent must web-search to verify |

### 2. Placeholder Scan

- No "TBD", "TODO", "fill in later" found
- All component data models include concrete data (scenarios, examples, milestones)
- All article content structures specify section requirements
- All commit commands are complete with exact file lists

### 3. Type Consistency

- `CompilerStackMap` props: `locale`, `currentArticle`, `mode` — used consistently across all article imports
- Component `locale` prop: `'zh' | 'en'` with default `'zh'` — consistent across all 13 components
- Article slugs match between YAML (Task 1) and MDX frontmatter (Tasks 3–6)
- `client:visible` directive on all component embeds — verified in all content structures
