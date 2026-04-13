# Graph Compilation & Optimization — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Articles 5–9 of the `graph-compilation-optimization` learning path: optimization passes (dataflow analysis, pattern matching, polyhedral), operator fusion (taxonomy, cost model), with 16 interactive components.

**Architecture:** Same as Phase 1 — each article follows the existing MDX + React interactive component pattern. Components use SVG rendering with Motion animations and the shared `COLORS`/`FONTS` system. The `CompilerStackMap` (compact mode) appears at the top of every article. Articles are bilingual (zh primary, en secondary). Phase 1 delivered Articles 1–4 and the shared CompilerStackMap — Phase 2 builds on this foundation.

**Tech Stack:** Astro 5, MDX, React 18, TypeScript, Motion (`motion/react`), SVG, Tailwind CSS

**Design Spec:** `docs/superpowers/specs/2026-04-12-graph-compilation-optimization-design.md`

**Phase 1 Plan (for reference):** `docs/superpowers/plans/2026-04-13-graph-compilation-phase1.md`

---

## Component Pattern Reference

All 16 interactive components follow this established pattern (same as Phase 1).

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
- Existing COLORS tokens: `primary` (#1565c0), `dark` (#1a1a2e), `mid` (#666), `light` (#e2e8f0), `bg` (#fff), `bgAlt` (#f8fafc), `green` (#2e7d32), `red` (#c62828), `orange` (#e65100), `purple` (#6a1b9a), `masked` (#f3f4f6), `valid` (#dbeafe), `highlight` (#fef3c7), `waste` (#fee2e2)
- HEAD_COLORS array available for multi-category color coding

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

import CompilerStackMap from '../../../components/interactive/CompilerStackMap.tsx';
import Component1 from '../../../components/interactive/Component1.tsx';

<CompilerStackMap mode="compact" currentArticle="article-slug" client:visible />

## 简介

{/* ... */}

<Component1 client:visible />
```

**Key rules:**
- `client:visible` on ALL interactive components (required for React hydration in Astro)
- Import path: `'../../../components/interactive/ComponentName.tsx'`
- **Every article starts with `<CompilerStackMap mode="compact" currentArticle="slug" client:visible />`**
- English version: same structure, `locale: en`, English content, components get `locale="en"` prop
- References must be real, verified URLs — web-search to verify during writing
- Minimum 3000 words per article, no upper limit ("宁可多，不可少")
- Chinese text with English technical terms (首次出现附中文翻译)

---

## File Structure

### New files to create

```
src/components/interactive/PassPipelineSimulator.tsx        # Art.5: pass ordering & execution
src/components/interactive/DCEAnimation.tsx                 # Art.5: dead code elimination
src/components/interactive/CSEAnimation.tsx                 # Art.5: common subexpression elimination
src/components/interactive/DataFlowAnalysisDemo.tsx         # Art.5: worklist algorithm visualization
src/components/interactive/LayoutOptimizationDemo.tsx       # Art.6: NCHW vs NHWC layout
src/components/interactive/PatternMatchingDemo.tsx          # Art.6: subgraph pattern matching
src/components/interactive/TransformerPassPipeline.tsx      # Art.6: full pass pipeline on attention
src/components/interactive/PolyhedralVisualizer.tsx         # Art.7: iteration space visualization
src/components/interactive/LoopTransformationDemo.tsx       # Art.7: loop transform before/after
src/components/interactive/DependenceAnalysisDemo.tsx       # Art.7: dependency arrows in iteration space
src/components/interactive/FusionTaxonomy.tsx               # Art.8: fusion type classification
src/components/interactive/FusionLegalityChecker.tsx        # Art.8: can these ops fuse?
src/components/interactive/FusionAlgorithmStepper.tsx       # Art.8: greedy fusion animation
src/components/interactive/CostModelCalculator.tsx          # Art.9: interactive cost model
src/components/interactive/FlashAttentionDeepDive.tsx       # Art.9: standard vs flash attention
src/components/interactive/FusionBenchmarkChart.tsx         # Art.9: performance comparison chart
src/content/articles/zh/graph-passes-foundations.mdx        # Art.5 Chinese
src/content/articles/en/graph-passes-foundations.mdx        # Art.5 English
src/content/articles/zh/graph-passes-advanced.mdx           # Art.6 Chinese
src/content/articles/en/graph-passes-advanced.mdx           # Art.6 English
src/content/articles/zh/graph-passes-polyhedral.mdx         # Art.7 Chinese
src/content/articles/en/graph-passes-polyhedral.mdx         # Art.7 English
src/content/articles/zh/operator-fusion-taxonomy.mdx        # Art.8 Chinese
src/content/articles/en/operator-fusion-taxonomy.mdx        # Art.8 English
src/content/articles/zh/operator-fusion-cost-model.mdx      # Art.9 Chinese
src/content/articles/en/operator-fusion-cost-model.mdx      # Art.9 English
```

### No existing files need modification

---

## Dependency Graph

```
Phase A (parallel):   Task 1 (Art.5)  |  Task 2 (Art.6)  |  Task 3 (Art.7)  |  Task 4 (Art.8)
Phase B:              Task 5 (Art.9) — depends on Task 4 (fusion taxonomy concepts referenced)
Phase C:              Task 6 (full build validation)
```

- Tasks 1–4 have no inter-dependencies — run in parallel
- Task 5 (Art.9 Cost Model) references fusion concepts from Task 4 (Art.8 Fusion Taxonomy) — run after Task 4
- Task 6 depends on all above

**Note:** Although Art.6 has prerequisite Art.5 and Art.9 has prerequisite Art.8 in the learning path, the *implementation* can proceed in parallel because each task is self-contained (components + MDX). The prerequisite chain is for readers, not for implementers.

**Exception:** Task 5 (Art.9) genuinely references Art.8's component `FusionTaxonomy` in its content and links to fusion type concepts. To avoid inconsistency, implement Task 5 after Task 4.

---

## Task 1: Article 5 — 数据流分析 & Pass 基础 (graph-passes-foundations)

This article covers the theoretical foundations of compiler optimization passes: dataflow analysis, lattice theory, worklist algorithm, and the three classic passes (DCE, CSE, Constant Folding). Dual main-line (PyTorch FX passes + MLIR Pass Manager).

**Files:**
- Create: `src/components/interactive/PassPipelineSimulator.tsx`
- Create: `src/components/interactive/DCEAnimation.tsx`
- Create: `src/components/interactive/CSEAnimation.tsx`
- Create: `src/components/interactive/DataFlowAnalysisDemo.tsx`
- Create: `src/content/articles/zh/graph-passes-foundations.mdx`
- Create: `src/content/articles/en/graph-passes-foundations.mdx`

### Step Group A: Components

- [ ] **Step 1: Implement PassPipelineSimulator**

The core component for this article. Users select and reorder optimization passes, then run them on a small computation graph to see the effect of each pass.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
// A node in the computation graph
interface GraphNode {
  id: string;
  op: string;                    // e.g. 'add', 'mul', 'const', 'input', 'relu'
  inputs: string[];              // IDs of input nodes
  value?: number;                // for constant nodes
  label: string;                 // display label
  dead?: boolean;                // marked dead by DCE
  cseMergedTo?: string;          // merged to this node by CSE
  foldedValue?: number;          // result of constant folding
}

// Available passes
type PassType = 'dce' | 'cse' | 'constant_folding' | 'canonicalize';

interface PassResult {
  pass: PassType;
  nodesRemoved: string[];        // IDs of removed nodes
  nodesMerged: [string, string][]; // [from, to] pairs for CSE
  nodesFolded: [string, number][]; // [id, value] pairs for constant folding
  description: { zh: string; en: string };
}

// Initial computation graph — a small DAG with optimization opportunities
// Example: input x → (x + 0) → relu → output
//          input y → (y * 1) → relu → output
//          (x + 0) also computed redundantly elsewhere
//          dead branch: x * 2 (unused)
const INITIAL_GRAPH: GraphNode[] = [
  { id: 'x', op: 'input', inputs: [], label: 'x' },
  { id: 'y', op: 'input', inputs: [], label: 'y' },
  { id: 'c0', op: 'const', inputs: [], value: 0, label: '0' },
  { id: 'c1', op: 'const', inputs: [], value: 1, label: '1' },
  { id: 'add1', op: 'add', inputs: ['x', 'c0'], label: 'x + 0' },      // constant fold → x
  { id: 'mul1', op: 'mul', inputs: ['y', 'c1'], label: 'y × 1' },      // constant fold → y
  { id: 'add2', op: 'add', inputs: ['x', 'c0'], label: 'x + 0' },      // CSE duplicate of add1
  { id: 'dead', op: 'mul', inputs: ['x', 'x'], label: 'x × x' },       // dead code (unused)
  { id: 'relu1', op: 'relu', inputs: ['add1'], label: 'relu' },
  { id: 'relu2', op: 'relu', inputs: ['mul1'], label: 'relu' },
  { id: 'out', op: 'add', inputs: ['relu1', 'relu2'], label: 'output' },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 550`
- **Top area (y: 0–350):** DAG visualization. Nodes as rounded rects, edges as lines with arrowheads. Layout: topological order, left-to-right with levels. Active nodes use `COLORS.primary`, dead nodes use `COLORS.masked`, CSE-merged nodes use `COLORS.highlight`, folded nodes use `COLORS.green`.
- **Bottom area (y: 370–550):** Pass pipeline controls.
  - A row of draggable pass "chips" (DCE, CSE, Constant Folding, Canonicalize) that user can reorder
  - "Run Pipeline" button: animates each pass in order with 1s delay between passes
  - "Reset" button: restore initial graph
  - Current pass indicator + description of what it did
- When a pass runs: affected nodes animate (flash highlight → fade out for removal, merge animation for CSE, color change for folding). A brief text description appears showing what happened.
- After all passes: show summary — "N nodes removed, M expressions merged, K constants folded"

- [ ] **Step 2: Implement DCEAnimation**

Focused animation showing Dead Code Elimination on a small graph.

**Data model:**

```tsx
// A small graph with clear dead code
// Graph: input a, b → c = a + b → d = c * 2 → output d
//        e = a - b (DEAD — not connected to output)
//        f = e * 3 (DEAD — depends on dead node e)
interface DCENode {
  id: string;
  op: string;
  inputs: string[];
  label: string;
}

const DCE_GRAPH: DCENode[] = [
  { id: 'a', op: 'input', inputs: [], label: 'a' },
  { id: 'b', op: 'input', inputs: [], label: 'b' },
  { id: 'c', op: 'add', inputs: ['a', 'b'], label: 'a + b' },
  { id: 'd', op: 'mul', inputs: ['c', 'const2'], label: 'c × 2' },
  { id: 'const2', op: 'const', inputs: [], label: '2' },
  { id: 'e', op: 'sub', inputs: ['a', 'b'], label: 'a − b' },  // DEAD
  { id: 'f', op: 'mul', inputs: ['e', 'const3'], label: 'e × 3' },  // DEAD
  { id: 'const3', op: 'const', inputs: [], label: '3' },  // DEAD (only used by f)
  { id: 'out', op: 'output', inputs: ['d'], label: 'output' },
];

// Algorithm steps:
// Step 1: Mark output as live
// Step 2: Backward traversal — mark d as live
// Step 3: Mark c, const2 as live
// Step 4: Mark a, b as live
// Step 5: e, f, const3 remain unmarked → remove
```

**Rendering approach:**

- SVG viewBox `0 0 800 450`
- DAG layout similar to PassPipelineSimulator but simpler
- Uses `StepNavigator` from `../primitives/StepNavigator`
- Steps:
  1. "初始图" — all nodes shown, output node highlighted green
  2. "标记输出节点" — output marked with green border
  3. "反向遍历" — d, c, const2, a, b progressively marked green (live)
  4. "识别死代码" — e, f, const3 turn red/gray (dead)
  5. "删除死代码" — dead nodes fade out with `motion.g` opacity animation
  6. "结果" — clean graph with only live nodes

- [ ] **Step 3: Implement CSEAnimation**

Focused animation showing Common Subexpression Elimination.

**Data model:**

```tsx
// Graph with redundant computations
// a, b → c1 = a + b → relu1(c1) → out1
//       → c2 = a + b → relu2(c2) → combined with out1
// c1 and c2 are identical: same op + same inputs

const CSE_GRAPH = [
  { id: 'a', op: 'input', inputs: [], label: 'a' },
  { id: 'b', op: 'input', inputs: [], label: 'b' },
  { id: 'c1', op: 'add', inputs: ['a', 'b'], label: 'a + b', hash: 'add(a,b)' },
  { id: 'c2', op: 'add', inputs: ['a', 'b'], label: 'a + b', hash: 'add(a,b)' },  // duplicate!
  { id: 'relu1', op: 'relu', inputs: ['c1'], label: 'relu' },
  { id: 'relu2', op: 'relu', inputs: ['c2'], label: 'relu' },
  { id: 'out', op: 'mul', inputs: ['relu1', 'relu2'], label: 'output' },
];

// Steps:
// 1. Hash each node: op + sorted inputs
// 2. Scan for duplicate hashes → c1 and c2 both hash to "add(a,b)"
// 3. Merge: redirect c2's users to c1, remove c2
// 4. Now relu1 and relu2 both take c1 → they also hash identically → merge
```

**Rendering approach:**

- SVG viewBox `0 0 800 450`
- Uses `StepNavigator`
- Steps:
  1. "初始图" — full graph
  2. "计算哈希" — each node shows its hash value in a small badge
  3. "发现重复" — c1 and c2 highlighted yellow (same hash), pulsing
  4. "合并 c2 → c1" — c2 fades, its outgoing edges redirect to c1 with animation
  5. "传播: relu 也重复了" — relu1 and relu2 now identical (same input) → highlight
  6. "合并 relu2 → relu1" — relu2 fades, edges redirect
  7. "结果" — simplified graph

- [ ] **Step 4: Implement DataFlowAnalysisDemo**

Visualizes the worklist algorithm for either constant propagation (forward) or liveness analysis (backward).

**Data model:**

```tsx
type AnalysisType = 'constant_propagation' | 'liveness';

// Control flow graph for the demo (basic blocks with instructions)
interface BasicBlock {
  id: string;
  label: string;
  instructions: string[];    // e.g. ["x = 3", "y = x + 1"]
  successors: string[];      // IDs of successor blocks
  predecessors: string[];    // IDs of predecessor blocks
}

// For constant propagation: each variable maps to ⊤ (unknown), a constant, or ⊥ (non-constant)
type LatticeValue = '⊤' | number | '⊥';

interface CPState {
  [variable: string]: LatticeValue;
}

// For liveness: set of live variables at entry/exit of each block
interface LivenessState {
  liveIn: Set<string>;
  liveOut: Set<string>;
}

// Example CFG for constant propagation:
// B0: entry, x = 3, y = 5
// B1: z = x + y (should fold to 8)
// B2: if (z > 0) goto B3 else B4
// B3: w = z * 2 (should fold to 16)
// B4: w = z - 1 (should fold to 7)
// B5: output w (phi: 16 or 7 → ⊥)

const CP_CFG: BasicBlock[] = [
  { id: 'B0', label: 'B0 (entry)', instructions: ['x = 3', 'y = 5'], successors: ['B1'], predecessors: [] },
  { id: 'B1', label: 'B1', instructions: ['z = x + y'], successors: ['B2'], predecessors: ['B0'] },
  { id: 'B2', label: 'B2', instructions: ['if z > 0'], successors: ['B3', 'B4'], predecessors: ['B1'] },
  { id: 'B3', label: 'B3', instructions: ['w = z × 2'], successors: ['B5'], predecessors: ['B2'] },
  { id: 'B4', label: 'B4', instructions: ['w = z − 1'], successors: ['B5'], predecessors: ['B2'] },
  { id: 'B5', label: 'B5 (exit)', instructions: ['return w'], successors: [], predecessors: ['B3', 'B4'] },
];

// Worklist algorithm steps for constant propagation:
// Iteration 1: Process B0 → {x: 3, y: 5}. Add B1 to worklist.
// Iteration 2: Process B1 → z = 3 + 5 = 8. {x: 3, y: 5, z: 8}. Add B2.
// Iteration 3: Process B2 → z > 0 is true (z=8). Add B3, B4.
// Iteration 4: Process B3 → w = 8 × 2 = 16. Add B5.
// Iteration 5: Process B4 → w = 8 − 1 = 7. Add B5.
// Iteration 6: Process B5 → w = meet(16, 7) = ⊥. No change propagates. Done.
```

**Rendering approach:**

- SVG viewBox `0 0 800 550`
- **Left area (0–500):** CFG diagram. Blocks as rounded rects arranged vertically with edges. Each block shows its instructions and current dataflow state (colored badges for each variable's lattice value).
- **Right area (520–800):** Worklist panel. Shows current worklist contents, current block being processed, and iteration counter.
- **Bottom:** Toggle between "Constant Propagation" and "Liveness Analysis" modes.
- Uses `StepNavigator` for step-by-step iteration.
- Color coding for lattice values: `⊤` = `COLORS.masked` (gray), constant = `COLORS.green`, `⊥` = `COLORS.red`
- When processing a block: block border pulses, variables being updated flash, changed states animate from old to new value.

- [ ] **Step 5: Verify all 4 components render**

Run: `npm run dev`, create a temporary test page or embed in Article 5 MDX (next step). Verify:
- PassPipelineSimulator: passes can be run in different orders with visible graph changes
- DCEAnimation: step-through works, dead nodes properly removed
- CSEAnimation: hash badges appear, merge animations work
- DataFlowAnalysisDemo: worklist iteration proceeds correctly in both modes

### Step Group B: Article 5 MDX (zh + en)

- [ ] **Step 6: Write Article 5 Chinese version**

Create `src/content/articles/zh/graph-passes-foundations.mdx`.

**Frontmatter:**

```yaml
---
title: "图优化 Pass（上）：数据流分析基础与通用 Pass 模式"
slug: graph-passes-foundations
locale: zh
tags: [compiler, optimization, pass, dataflow-analysis, dce, cse]
prerequisites: [ir-design-basics]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "Efficiently Computing Static Single Assignment Form and the Control Dependence Graph"
    url: "https://dl.acm.org/doi/10.1145/115372.115320"
  - type: website
    title: "MLIR Pass Infrastructure"
    url: "https://mlir.llvm.org/docs/PassManagement/"
  - type: website
    title: "torch.fx — Graph Manipulation"
    url: "https://pytorch.org/docs/stable/fx.html"
  - type: paper
    title: "A Unified Approach to Global Program Optimization"
    url: "https://dl.acm.org/doi/10.1145/512927.512945"
  - type: website
    title: "MLIR Canonicalization"
    url: "https://mlir.llvm.org/docs/Canonicalization/"
---
```

**Imports:**

```tsx
import CompilerStackMap from '../../../components/interactive/CompilerStackMap.tsx';
import PassPipelineSimulator from '../../../components/interactive/PassPipelineSimulator.tsx';
import DCEAnimation from '../../../components/interactive/DCEAnimation.tsx';
import CSEAnimation from '../../../components/interactive/CSEAnimation.tsx';
import DataFlowAnalysisDemo from '../../../components/interactive/DataFlowAnalysisDemo.tsx';
```

**Content structure:**

1. `<CompilerStackMap mode="compact" currentArticle="graph-passes-foundations" client:visible />`
2. `## 简介` — What is a pass? Why do we need systematic optimization? Link back to IR articles (3, 4). Explain the article covers "foundations" while Art.6 covers advanced topics.
3. `## 什么是 Pass` — Pass as function: IR → IR. Analysis pass (read-only, produces analysis result) vs Transform pass (modifies IR). Local (single op) vs Global (whole graph). Show a simple FX pass example in Python.
4. `## 数据流分析基础` — Theoretical framework for understanding what passes do.
   - **Lattice theory**: semi-lattice, partial order, meet/join operations. Concrete example: constant propagation lattice where ⊤ = "not yet analyzed", constant = known value, ⊥ = "cannot determine".
   - **Transfer function**: how each op transforms the dataflow state. Example: `z = x + y` with x=3, y=5 → z=8.
   - **Worklist algorithm**: iterative algorithm that processes blocks until no state changes (fixed point). Pseudocode.
   - **Forward vs backward analysis**: constant propagation flows forward, liveness flows backward.
   - `<DataFlowAnalysisDemo client:visible />`
5. `## 经典 Pass 深入讲解`
   - **Dead Code Elimination (DCE)**: Mark live nodes backward from output, remove unmarked. Algorithm pseudocode + complexity analysis. In FX: `node.users` is empty → dead. In MLIR: `isMemoryEffectFree` + no users → dead.
   - `<DCEAnimation client:visible />`
   - **Common Subexpression Elimination (CSE)**: Hash each node (opcode + input operands), find duplicates, merge. Handle commutative ops (a+b = b+a by sorting operands before hashing). Complexity: O(n) with hash table.
   - `<CSEAnimation client:visible />`
   - **Constant Folding**: Evaluate ops with all-constant inputs at compile time. Propagation: results feed into downstream ops, enabling cascading folds. Interaction with CSE and DCE.
6. `<PassPipelineSimulator client:visible />`
7. `## Pass 管理基础设施`
   - **PyTorch FX passes**: `subgraph_rewriter` API — define pattern + replacement. Example: rewrite matmul+relu to fused op. Show actual Python code.
   - **MLIR Pass Manager**: hierarchical pass management. Module pass → Function pass → Op pass. Pipeline composition. `mlir-opt` command-line pass pipeline specification. Analysis preservation — when a transform invalidates a previous analysis.
   - Pass ordering: why order matters. Example: running CSE first may expose new DCE opportunities. Canonicalize as "cleanup" pass between transforms.
8. `## 不动点迭代` — Some passes need to run repeatedly. Example: constant folding produces new constants that enable more folding. Canonicalization in MLIR: runs patterns until no more match (convergence guarantee: each pattern strictly simplifies). Fixed-point termination proof sketch.
9. `## 总结` — Key takeaways. Preview of Art.6 (pattern matching, layout optimization, Transformer pipeline).
10. `## 延伸阅读` — Links to references.

**Writing requirements:**
- Minimum 3000 words
- Every technical claim backed by reference
- Web-search to verify all reference URLs are live
- The lattice theory section should include a diagram in text (ASCII art or describe what the DataFlowAnalysisDemo shows)
- Algorithm pseudocode for DCE, CSE, and worklist — use code blocks
- FX pass example should be real, working Python code pattern
- MLIR pass examples should use correct `mlir-opt` syntax

- [ ] **Step 7: Write Article 5 English version**

Create `src/content/articles/en/graph-passes-foundations.mdx`. Same structure and components as zh version, with `locale: en`. Components get `locale="en"` prop. English content adapted for English-reading audience.

- [ ] **Step 8: Verify article renders correctly**

Run: `npm run dev`
- Navigate to `/zh/articles/graph-passes-foundations` — verify all 4 components render, text flows correctly
- Navigate to `/en/articles/graph-passes-foundations` — verify English version
- Run: `npm run validate`

- [ ] **Step 9: Commit**

```bash
git add src/components/interactive/PassPipelineSimulator.tsx \
        src/components/interactive/DCEAnimation.tsx \
        src/components/interactive/CSEAnimation.tsx \
        src/components/interactive/DataFlowAnalysisDemo.tsx \
        src/content/articles/zh/graph-passes-foundations.mdx \
        src/content/articles/en/graph-passes-foundations.mdx
git commit -m "feat(graph-compilation): add Article 5 — dataflow analysis and pass foundations with PassPipelineSimulator, DCEAnimation, CSEAnimation, DataFlowAnalysisDemo"
```

---

## Task 2: Article 6 — 高级优化 & Pattern Matching (graph-passes-advanced)

This article covers advanced graph optimization: layout optimization, shape propagation, memory planning, and deep-dive into pattern matching (MLIR DRR/PDL + FX subgraph_rewriter). Dual main-line.

**Files:**
- Create: `src/components/interactive/LayoutOptimizationDemo.tsx`
- Create: `src/components/interactive/PatternMatchingDemo.tsx`
- Create: `src/components/interactive/TransformerPassPipeline.tsx`
- Create: `src/content/articles/zh/graph-passes-advanced.mdx`
- Create: `src/content/articles/en/graph-passes-advanced.mdx`

### Step Group A: Components

- [ ] **Step 1: Implement LayoutOptimizationDemo**

Shows how data layout (NCHW vs NHWC) affects memory access patterns and Tensor Core utilization.

**Data model:**

```tsx
type Layout = 'NCHW' | 'NHWC';

interface TensorConfig {
  N: number;  // batch
  C: number;  // channels
  H: number;  // height
  W: number;  // width
}

// Example: a small 1×4×2×2 tensor
const EXAMPLE: TensorConfig = { N: 1, C: 4, H: 2, W: 2 };

// For each layout, show how elements are arranged in linear memory
// NCHW: [c0h0w0, c0h0w1, c0h1w0, c0h1w1, c1h0w0, c1h0w1, ...]  — channels are outer
// NHWC: [c0h0w0, c1h0w0, c2h0w0, c3h0w0, c0h0w1, c1h0w1, ...]  — channels are inner

// Also show: a Conv2D operation reading a 3x3 patch
// In NHWC: all channels for one spatial position are contiguous → good for Tensor Core (which operates on channel dimension)
// In NCHW: channels are strided → scattered memory access for channel-wise operations
```

**Rendering approach:**

- SVG viewBox `0 0 800 500`
- **Top:** Layout toggle buttons (NCHW / NHWC)
- **Left (0–380):** 3D tensor visualization. Show the 4D tensor as a stack of 2D feature maps (one per channel). Color-code each channel differently using `HEAD_COLORS`.
- **Right (420–800):** Linear memory view. A horizontal bar of colored cells showing how elements map to 1D memory. Highlight a "read window" (e.g., a 1×1×H×W slice for NCHW or a N×H×W×1 slice for NHWC) to show which memory locations are accessed together.
- **Bottom:** Stats panel showing:
  - "Cache-line utilization for conv2d read": percentage of useful data per cache line fetch
  - "Tensor Core compatibility": NHWC = ✅ native, NCHW = ⚠️ needs transpose
- When switching layouts: elements animate to their new positions in the linear memory bar.
- Highlight "contiguous read" regions in green, "strided read" in orange.

- [ ] **Step 2: Implement PatternMatchingDemo**

Interactive pattern matching: define a pattern (left panel), view a computation graph (right panel), see matches highlighted and replacement applied.

**Data model:**

```tsx
interface Pattern {
  id: string;
  name: { zh: string; en: string };
  // Pattern graph: nodes that must match
  patternNodes: { id: string; op: string; label: string }[];
  patternEdges: { from: string; to: string }[];
  // Replacement graph: what to substitute
  replacementNodes: { id: string; op: string; label: string }[];
  replacementEdges: { from: string; to: string }[];
  description: { zh: string; en: string };
}

// Predefined patterns
const PATTERNS: Pattern[] = [
  {
    id: 'matmul_bias',
    name: { zh: 'MatMul + BiasAdd → FusedLinear', en: 'MatMul + BiasAdd → FusedLinear' },
    patternNodes: [
      { id: 'p_mm', op: 'matmul', label: 'matmul' },
      { id: 'p_bias', op: 'add', label: 'bias_add' },
    ],
    patternEdges: [{ from: 'p_mm', to: 'p_bias' }],
    replacementNodes: [
      { id: 'r_linear', op: 'fused_linear', label: 'FusedLinear' },
    ],
    replacementEdges: [],
    description: { zh: '将 matmul + bias add 融合为单个 FusedLinear 算子', en: 'Fuse matmul + bias add into a single FusedLinear op' },
  },
  {
    id: 'mul_add_relu',
    name: { zh: 'Mul + Add + ReLU → FusedMulAddReLU', en: 'Mul + Add + ReLU → FusedMulAddReLU' },
    patternNodes: [
      { id: 'p_mul', op: 'mul', label: 'mul' },
      { id: 'p_add', op: 'add', label: 'add' },
      { id: 'p_relu', op: 'relu', label: 'relu' },
    ],
    patternEdges: [{ from: 'p_mul', to: 'p_add' }, { from: 'p_add', to: 'p_relu' }],
    replacementNodes: [
      { id: 'r_fma_relu', op: 'fused_mul_add_relu', label: 'FusedMulAddReLU' },
    ],
    replacementEdges: [],
    description: { zh: '将乘-加-ReLU 序列融合为单个 kernel', en: 'Fuse mul-add-ReLU sequence into single kernel' },
  },
  {
    id: 'identity_removal',
    name: { zh: 'X + 0 → X (恒等消除)', en: 'X + 0 → X (Identity Removal)' },
    patternNodes: [
      { id: 'p_x', op: 'any', label: 'X' },
      { id: 'p_zero', op: 'const_zero', label: '0' },
      { id: 'p_add', op: 'add', label: 'X + 0' },
    ],
    patternEdges: [{ from: 'p_x', to: 'p_add' }, { from: 'p_zero', to: 'p_add' }],
    replacementNodes: [], // Just rewire: users of p_add now use p_x
    replacementEdges: [],
    description: { zh: '消除加 0 的冗余操作', en: 'Remove redundant add-zero operations' },
  },
];

// Target computation graph: a small Transformer-like subgraph
// Contains multiple instances that match different patterns
const TARGET_GRAPH = [
  { id: 'x', op: 'input', inputs: [], label: 'x' },
  { id: 'w', op: 'param', inputs: [], label: 'W' },
  { id: 'b', op: 'param', inputs: [], label: 'bias' },
  { id: 'mm', op: 'matmul', inputs: ['x', 'w'], label: 'matmul' },
  { id: 'bias_add', op: 'add', inputs: ['mm', 'b'], label: '+ bias' },      // matches matmul_bias
  { id: 'scale', op: 'param', inputs: [], label: 'scale' },
  { id: 'shift', op: 'param', inputs: [], label: 'shift' },
  { id: 'mul', op: 'mul', inputs: ['bias_add', 'scale'], label: '× scale' },
  { id: 'add', op: 'add', inputs: ['mul', 'shift'], label: '+ shift' },
  { id: 'relu', op: 'relu', inputs: ['add'], label: 'relu' },               // mul+add+relu matches
  { id: 'zero', op: 'const', inputs: [], label: '0' },
  { id: 'add_zero', op: 'add', inputs: ['relu', 'zero'], label: '+ 0' },   // matches identity
  { id: 'out', op: 'output', inputs: ['add_zero'], label: 'output' },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 550`
- **Left panel (0–220):** Pattern selector. List of pattern cards, click to select. Selected pattern shows its pattern graph (small DAG) and replacement.
- **Right panel (240–800):** Target computation graph as DAG.
- When a pattern is selected: matching subgraph(s) in the target graph are highlighted with a colored border. A "Apply" button appears.
- Click "Apply": matched nodes animate → contract into the replacement node(s). Edges re-route. Brief flash effect.
- Multiple patterns can be applied sequentially. "Reset" button to restore original graph.
- Show MLIR DRR syntax and FX `subgraph_rewriter` code below the graph for the selected pattern (as read-only code blocks in the component).

- [ ] **Step 3: Implement TransformerPassPipeline**

The centerpiece component: shows a Transformer attention block going through a full optimization pass pipeline, with each pass's effect visible.

**Data model:**

```tsx
interface PipelineStage {
  name: { zh: string; en: string };
  passType: string;                    // e.g. 'constant_folding', 'cse', 'layout_opt', 'memory_planning'
  // Simplified graph state after this pass
  nodes: { id: string; op: string; label: string; highlight?: 'removed' | 'modified' | 'added' }[];
  edges: { from: string; to: string }[];
  stats: {
    nodeCount: number;
    estimatedHBMAccess: string;        // e.g. "48 MB"
    estimatedFLOPs: string;           // e.g. "2.1 GFLOPs"
  };
  description: { zh: string; en: string };
}

// A simplified Transformer attention subgraph and its transformation through passes
const PIPELINE_STAGES: PipelineStage[] = [
  {
    name: { zh: '原始图 (初始状态)', en: 'Original Graph (Initial)' },
    passType: 'none',
    nodes: [
      { id: 'x', op: 'input', label: 'x' },
      { id: 'wq', op: 'param', label: 'W_Q' },
      { id: 'wk', op: 'param', label: 'W_K' },
      { id: 'wv', op: 'param', label: 'W_V' },
      { id: 'q', op: 'matmul', label: 'Q = x @ W_Q' },
      { id: 'k', op: 'matmul', label: 'K = x @ W_K' },
      { id: 'v', op: 'matmul', label: 'V = x @ W_V' },
      { id: 'dk', op: 'const', label: '√d_k' },
      { id: 'scores', op: 'matmul', label: 'Q × Kᵀ' },
      { id: 'scale', op: 'div', label: '÷ √d_k' },
      { id: 'softmax', op: 'softmax', label: 'softmax' },
      { id: 'attn', op: 'matmul', label: 'attn × V' },
      { id: 'wo', op: 'param', label: 'W_O' },
      { id: 'proj', op: 'matmul', label: 'out @ W_O' },
      { id: 'out', op: 'output', label: 'output' },
    ],
    edges: [
      { from: 'x', to: 'q' }, { from: 'wq', to: 'q' },
      { from: 'x', to: 'k' }, { from: 'wk', to: 'k' },
      { from: 'x', to: 'v' }, { from: 'wv', to: 'v' },
      { from: 'q', to: 'scores' }, { from: 'k', to: 'scores' },
      { from: 'scores', to: 'scale' }, { from: 'dk', to: 'scale' },
      { from: 'scale', to: 'softmax' },
      { from: 'softmax', to: 'attn' }, { from: 'v', to: 'attn' },
      { from: 'attn', to: 'proj' }, { from: 'wo', to: 'proj' },
      { from: 'proj', to: 'out' },
    ],
    stats: { nodeCount: 15, estimatedHBMAccess: '96 MB', estimatedFLOPs: '2.1 GFLOP' },
    description: { zh: 'Self-Attention 的原始计算图：5 个 matmul + softmax + scale', en: 'Original Self-Attention graph: 5 matmuls + softmax + scale' },
  },
  {
    name: { zh: 'Constant Folding', en: 'Constant Folding' },
    passType: 'constant_folding',
    nodes: [
      // √d_k is now a scalar constant, folded into the scale op
      { id: 'x', op: 'input', label: 'x' },
      { id: 'wq', op: 'param', label: 'W_Q' },
      { id: 'wk', op: 'param', label: 'W_K' },
      { id: 'wv', op: 'param', label: 'W_V' },
      { id: 'q', op: 'matmul', label: 'Q = x @ W_Q' },
      { id: 'k', op: 'matmul', label: 'K = x @ W_K' },
      { id: 'v', op: 'matmul', label: 'V = x @ W_V' },
      { id: 'scores', op: 'matmul', label: 'Q × Kᵀ' },
      { id: 'scale', op: 'mul', label: '× (1/√d_k)', highlight: 'modified' },  // div → mul by reciprocal
      { id: 'softmax', op: 'softmax', label: 'softmax' },
      { id: 'attn', op: 'matmul', label: 'attn × V' },
      { id: 'wo', op: 'param', label: 'W_O' },
      { id: 'proj', op: 'matmul', label: 'out @ W_O' },
      { id: 'out', op: 'output', label: 'output' },
    ],
    edges: [
      { from: 'x', to: 'q' }, { from: 'wq', to: 'q' },
      { from: 'x', to: 'k' }, { from: 'wk', to: 'k' },
      { from: 'x', to: 'v' }, { from: 'wv', to: 'v' },
      { from: 'q', to: 'scores' }, { from: 'k', to: 'scores' },
      { from: 'scores', to: 'scale' },
      { from: 'scale', to: 'softmax' },
      { from: 'softmax', to: 'attn' }, { from: 'v', to: 'attn' },
      { from: 'attn', to: 'proj' }, { from: 'wo', to: 'proj' },
      { from: 'proj', to: 'out' },
    ],
    stats: { nodeCount: 14, estimatedHBMAccess: '96 MB', estimatedFLOPs: '2.1 GFLOP' },
    description: { zh: '√d_k 是编译期常量，div 优化为 mul（乘以倒数更快）。节点数 15→14。', en: '√d_k is a compile-time constant, div optimized to mul (multiply by reciprocal is faster). Nodes 15→14.' },
  },
  {
    name: { zh: 'QKV Projection 融合', en: 'QKV Projection Fusion' },
    passType: 'pattern_matching',
    nodes: [
      { id: 'x', op: 'input', label: 'x' },
      { id: 'wqkv', op: 'param', label: 'W_QKV', highlight: 'added' },
      { id: 'qkv', op: 'matmul', label: 'QKV = x @ W_QKV', highlight: 'added' },
      { id: 'split', op: 'split', label: 'split → Q,K,V', highlight: 'added' },
      { id: 'scores', op: 'matmul', label: 'Q × Kᵀ' },
      { id: 'scale', op: 'mul', label: '× (1/√d_k)' },
      { id: 'softmax', op: 'softmax', label: 'softmax' },
      { id: 'attn', op: 'matmul', label: 'attn × V' },
      { id: 'wo', op: 'param', label: 'W_O' },
      { id: 'proj', op: 'matmul', label: 'out @ W_O' },
      { id: 'out', op: 'output', label: 'output' },
    ],
    edges: [
      { from: 'x', to: 'qkv' }, { from: 'wqkv', to: 'qkv' },
      { from: 'qkv', to: 'split' },
      { from: 'split', to: 'scores' }, { from: 'split', to: 'scores' },
      { from: 'split', to: 'attn' },
      { from: 'scores', to: 'scale' },
      { from: 'scale', to: 'softmax' },
      { from: 'softmax', to: 'attn' },
      { from: 'attn', to: 'proj' }, { from: 'wo', to: 'proj' },
      { from: 'proj', to: 'out' },
    ],
    stats: { nodeCount: 11, estimatedHBMAccess: '64 MB', estimatedFLOPs: '2.1 GFLOP' },
    description: { zh: '三个独立的 Q/K/V matmul 合并为一次 QKV 联合投影。减少 HBM 读取（x 只读一次而非三次）。', en: 'Three separate Q/K/V matmuls merged into one QKV joint projection. Reduced HBM reads (x read once, not thrice).' },
  },
  {
    name: { zh: 'Layout Optimization (B,S,H,D → B,H,S,D)', en: 'Layout Optimization (B,S,H,D → B,H,S,D)' },
    passType: 'layout_optimization',
    // Same topology, but annotated with layout info
    // Note: Attention uses [B,H,S,D] vs [B,S,H,D] (not NCHW/NHWC which are CNN-specific)
    nodes: [
      { id: 'x', op: 'input', label: 'x [B,S,HD]', highlight: 'modified' },
      { id: 'wqkv', op: 'param', label: 'W_QKV', highlight: 'modified' },
      { id: 'qkv', op: 'matmul', label: 'QKV [B,S,3HD]' },
      { id: 'split', op: 'split', label: 'split → [B,H,S,D]', highlight: 'modified' },
      { id: 'scores', op: 'matmul', label: 'Q × Kᵀ [B,H,S,S]' },
      { id: 'scale', op: 'mul', label: '× (1/√d_k)' },
      { id: 'softmax', op: 'softmax', label: 'softmax' },
      { id: 'attn', op: 'matmul', label: 'attn × V [B,H,S,D]' },
      { id: 'wo', op: 'param', label: 'W_O' },
      { id: 'proj', op: 'matmul', label: 'out @ W_O [B,S,HD]', highlight: 'modified' },
      { id: 'out', op: 'output', label: 'output [B,S,HD]' },
    ],
    edges: [
      { from: 'x', to: 'qkv' }, { from: 'wqkv', to: 'qkv' },
      { from: 'qkv', to: 'split' },
      { from: 'split', to: 'scores' }, { from: 'split', to: 'scores' },
      { from: 'split', to: 'attn' },
      { from: 'scores', to: 'scale' },
      { from: 'scale', to: 'softmax' },
      { from: 'softmax', to: 'attn' },
      { from: 'attn', to: 'proj' }, { from: 'wo', to: 'proj' },
      { from: 'proj', to: 'out' },
    ],
    stats: { nodeCount: 11, estimatedHBMAccess: '64 MB', estimatedFLOPs: '2.1 GFLOP' },
    description: { zh: 'QKV split 后 reshape 为 [B,H,S,D]，使 head 维度连续，匹配 Tensor Core 的 matmul 对齐要求。输出通过 reshape 回 [B,S,HD]。全图统一 layout，无额外 transpose 节点。', en: 'After QKV split, reshape to [B,H,S,D] for contiguous head dimension matching Tensor Core matmul alignment. Output reshaped back to [B,S,HD]. Uniform layout across graph, no extra transpose nodes.' },
  },
  {
    name: { zh: 'Memory Planning', en: 'Memory Planning' },
    passType: 'memory_planning',
    nodes: [
      { id: 'x', op: 'input', label: 'x' },
      { id: 'wqkv', op: 'param', label: 'W_QKV' },
      { id: 'qkv', op: 'matmul', label: 'QKV [buf0]', highlight: 'modified' },
      { id: 'split', op: 'split', label: 'split [buf0]' },
      { id: 'scores', op: 'matmul', label: 'Q × Kᵀ [buf1]', highlight: 'modified' },
      { id: 'scale', op: 'mul', label: '× scale [buf1]' },
      { id: 'softmax', op: 'softmax', label: 'softmax [buf1]' },
      { id: 'attn', op: 'matmul', label: 'attn×V [buf0]', highlight: 'modified' },  // reuses buf0 (qkv no longer needed)
      { id: 'wo', op: 'param', label: 'W_O' },
      { id: 'proj', op: 'matmul', label: 'out@W_O [buf1]', highlight: 'modified' },  // reuses buf1
      { id: 'out', op: 'output', label: 'output' },
    ],
    edges: [
      { from: 'x', to: 'qkv' }, { from: 'wqkv', to: 'qkv' },
      { from: 'qkv', to: 'split' },
      { from: 'split', to: 'scores' }, { from: 'split', to: 'scores' },
      { from: 'split', to: 'attn' },
      { from: 'scores', to: 'scale' },
      { from: 'scale', to: 'softmax' },
      { from: 'softmax', to: 'attn' },
      { from: 'attn', to: 'proj' }, { from: 'wo', to: 'proj' },
      { from: 'proj', to: 'out' },
    ],
    stats: { nodeCount: 11, estimatedHBMAccess: '64 MB', estimatedFLOPs: '2.1 GFLOP' },
    description: { zh: 'Buffer 复用分析：QKV buffer 在 attention 计算后不再需要，可被 attn×V 结果复用。Peak memory 从 4 buffers 降到 2 buffers。', en: 'Buffer reuse analysis: QKV buffer no longer needed after attention, reused by attn×V result. Peak memory reduced from 4 buffers to 2.' },
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 550`
- Uses `StepNavigator` to walk through pipeline stages
- Each stage: renders the computation graph as a DAG at that point. Nodes with `highlight: 'removed'` shown in gray with strikethrough. `'modified'` shown with yellow border. `'added'` shown with green border.
- **Bottom panel:** Stats comparison bar. Shows nodeCount, estimatedHBMAccess, estimatedFLOPs for current stage vs original. Use horizontal bar chart for visual comparison.
- Pass name and description shown prominently at each step.

- [ ] **Step 4: Verify all 3 components render**

Run: `npm run dev`. Verify:
- LayoutOptimizationDemo: toggle between NCHW/NHWC, memory layout animates
- PatternMatchingDemo: select patterns, see matches highlighted, apply replacements
- TransformerPassPipeline: step through all 5 stages, graph changes visible

### Step Group B: Article 6 MDX (zh + en)

- [ ] **Step 5: Write Article 6 Chinese version**

Create `src/content/articles/zh/graph-passes-advanced.mdx`.

**Frontmatter:**

```yaml
---
title: "图优化 Pass（中）：高级优化与 Pattern Matching"
slug: graph-passes-advanced
locale: zh
tags: [compiler, optimization, layout, pattern-matching, memory-planning]
prerequisites: [graph-passes-foundations]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: website
    title: "MLIR Declarative Rewrite Rules (DRR)"
    url: "https://mlir.llvm.org/docs/DeclarativeRewrites/"
  - type: website
    title: "MLIR PDL — Pattern Description Language"
    url: "https://mlir.llvm.org/docs/Dialects/PDLOps/"
  - type: website
    title: "torch.fx — Subgraph Rewriting"
    url: "https://pytorch.org/docs/stable/fx.html#torch.fx.replace_pattern"
  - type: paper
    title: "Tensor Comprehensions: Framework-Agnostic High-Performance Machine Learning Abstractions"
    url: "https://arxiv.org/abs/1802.04730"
  - type: website
    title: "NVIDIA Tensor Core Programming"
    url: "https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html"
---
```

**Content structure:**

1. `<CompilerStackMap mode="compact" currentArticle="graph-passes-advanced" client:visible />`
2. `## 简介` — Building on Art.5's foundations. This article covers "the hard parts" of graph optimization: layout, shape, memory, and the pattern matching machinery that powers it all.
3. `## Layout Optimization`
   - Why layout matters: NCHW (PyTorch default) vs NHWC (Tensor Core native). Quantitative difference: NHWC enables 2-4x better Tensor Core utilization for conv2d.
   - Layout propagation algorithm: BFS from hardware-preferred ops (matmul, conv2d), propagate NHWC outward, insert transposes only at boundaries where layout must differ.
   - Global vs local optimization: sometimes inserting a transpose is cheaper than running the whole graph in a suboptimal layout.
   - `<LayoutOptimizationDemo client:visible />`
4. `## Shape 推导与 Specialization`
   - Static shape: compiler knows exact dimensions → can compute buffer sizes, unroll loops, choose tile sizes at compile time.
   - Dynamic shape: dimensions are symbolic → must generate code that handles any value. Limits: can't statically decide tile sizes, can't do loop unrolling with known trip count.
   - Shape specialization: fix shapes to unlock optimizations, with guard + recompile for new shapes (links back to TorchDynamo guards in Art.2).
   - Shape propagation rules: how output shapes are computed from input shapes (example: matmul shape rules).
5. `## Memory Planning`
   - Tensor lifetime analysis: from definition (creation) to last use. Simple algorithm: scan execution order, record first-use and last-use for each tensor.
   - In-place detection: if an op's output has the same shape as its input, and the input is never used again → can overwrite in-place. Links to bufferization concepts from Art.4.
   - Memory pool allocation: pre-allocate a large pool, assign offsets. Bin-packing / first-fit algorithms. Goal: minimize peak memory.
   - Execution order impact: reordering ops can change peak memory (earlier deallocation of large tensors). NP-hard in general, heuristics used.
6. `## Pattern Matching 深入`
   - Subgraph matching as a graph isomorphism problem (NP-hard in general, but patterns are small → practical).
   - **MLIR DRR (Declarative Rewrite Rules)**: TableGen-based. Show real DRR syntax example. Pros: concise, auto-verified. Cons: limited expressiveness.
   - **MLIR PDL (Pattern Description Language)**: IR-level pattern description. More flexible than DRR: can express constraints, multi-root patterns. Show PDL example.
   - **FX `replace_pattern`**: Python-level. Define pattern as a Python function, replacement as another function. Show real Python code.
   - Performance: for large graphs (10K+ nodes), naive matching is slow. Hash-based pre-filtering: hash each node, only attempt full match when hash matches.
   - `<PatternMatchingDemo client:visible />`
7. `## 实战：Transformer Attention Block 的完整 Pass Pipeline`
   - Walk through a concrete attention block being optimized: original → constant folding → QKV fusion → layout optimization → memory planning.
   - Quantify each pass's contribution to performance.
   - `<TransformerPassPipeline client:visible />`
8. `## 总结` — Key takeaways. Preview: Art.7 (polyhedral optimization for loops).
9. `## 延伸阅读`

- [ ] **Step 6: Write Article 6 English version**

Create `src/content/articles/en/graph-passes-advanced.mdx`. Same structure, `locale: en`, English content.

- [ ] **Step 7: Verify article renders correctly**

Run: `npm run dev`
- Navigate to `/zh/articles/graph-passes-advanced`
- Navigate to `/en/articles/graph-passes-advanced`
- Run: `npm run validate`

- [ ] **Step 8: Commit**

```bash
git add src/components/interactive/LayoutOptimizationDemo.tsx \
        src/components/interactive/PatternMatchingDemo.tsx \
        src/components/interactive/TransformerPassPipeline.tsx \
        src/content/articles/zh/graph-passes-advanced.mdx \
        src/content/articles/en/graph-passes-advanced.mdx
git commit -m "feat(graph-compilation): add Article 6 — advanced optimization and pattern matching with LayoutOptimizationDemo, PatternMatchingDemo, TransformerPassPipeline"
```

---

## Task 3: Article 7 — Polyhedral 优化 (graph-passes-polyhedral)

This article is MLIR-focused. It covers the polyhedral model for loop optimization: iteration spaces, dependence analysis, affine transformations, and MLIR's Affine dialect. Three interactive components.

**Files:**
- Create: `src/components/interactive/PolyhedralVisualizer.tsx`
- Create: `src/components/interactive/LoopTransformationDemo.tsx`
- Create: `src/components/interactive/DependenceAnalysisDemo.tsx`
- Create: `src/content/articles/zh/graph-passes-polyhedral.mdx`
- Create: `src/content/articles/en/graph-passes-polyhedral.mdx`

### Step Group A: Components

- [ ] **Step 1: Implement PolyhedralVisualizer**

The core component: visualizes a 2D iteration space (integer point lattice) and shows how loop transformations change the execution order.

**Data model:**

```tsx
type TransformType = 'original' | 'tiling' | 'permutation' | 'skewing';

interface IterationPoint {
  i: number;
  j: number;
  executionOrder: number;     // when this point is executed (used for animation)
  tileId?: number;            // which tile this point belongs to (for tiling view)
}

interface Transform {
  type: TransformType;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  // The affine transformation matrix [a, b; c, d] that maps (i, j) → (a*i+b*j, c*i+d*j)
  matrix: [number, number, number, number];  // [a, b, c, d]
  // For tiling: tile sizes
  tileSizes?: [number, number];
}

// Iteration space: i ∈ [0, 7], j ∈ [0, 7] — an 8×8 grid
const SPACE_SIZE = 8;

const TRANSFORMS: Transform[] = [
  {
    type: 'original',
    label: { zh: '原始顺序 (i, j)', en: 'Original Order (i, j)' },
    description: { zh: '按行优先顺序执行：外层循环 i，内层循环 j。对列方向内存访问不友好。', en: 'Row-major execution: outer loop i, inner loop j. Poor locality for column-wise memory access.' },
    matrix: [1, 0, 0, 1],  // identity
  },
  {
    type: 'permutation',
    label: { zh: '循环交换 (j, i)', en: 'Loop Interchange (j, i)' },
    description: { zh: '交换内外循环：外层 j，内层 i。如果数据按列存储（column-major），这会大幅改善 cache locality。', en: 'Swap inner/outer loop: outer j, inner i. If data is column-major, this greatly improves cache locality.' },
    matrix: [0, 1, 1, 0],  // swap i and j
  },
  {
    type: 'tiling',
    label: { zh: 'Tiling (4×4)', en: 'Tiling (4×4)' },
    description: { zh: '将 8×8 迭代空间切分为 4 个 4×4 tile。每个 tile 的工作集更小，能放入 L1 cache / shared memory。', en: 'Partition 8×8 space into 4 tiles of 4×4. Each tile has a smaller working set that fits in L1 cache / shared memory.' },
    matrix: [1, 0, 0, 1],  // same space, different execution grouping
    tileSizes: [4, 4],
  },
  {
    type: 'skewing',
    label: { zh: 'Skewing (i, i+j)', en: 'Skewing (i, i+j)' },
    description: { zh: '斜切变换：将原始空间的反对角线映射为新空间的水平行。同一反对角线上的迭代（i+j=常数）在新坐标中拥有相同的 j\' 值，可以并行执行。常用于 wavefront parallelism。', en: 'Skew transform: maps anti-diagonals in original space to horizontal rows in new space. Iterations on the same anti-diagonal (i+j=const) share the same j\' value in new coordinates, enabling parallel execution. Used for wavefront parallelism.' },
    matrix: [1, 0, 1, 1],  // (i, j) → (i, i+j)
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 550`
- **Main area (0–600):** 8×8 grid of circles (iteration points). X-axis = j, Y-axis = i (top to bottom). Grid lines in `COLORS.light`.
- Each point is a `motion.circle` that can animate position and color.
- **Execution order animation:** When user clicks "Play", points light up sequentially according to `executionOrder`. Speed slider controls animation speed.
- **Transform selector:** 4 buttons at top for each transform type.
- When switching transforms:
  - `original` → `permutation`: points stay in same position but execution order changes (shown by numbered labels or color gradient)
  - `original` → `tiling`: tile boundaries appear as thick dashed lines, points colored by tile using `HEAD_COLORS[tileId]`
  - `original` → `skewing`: points animate to new positions in the skewed coordinate system. The grid transforms with a `motion.g` transform animation.
- **Data access arrows:** Show which memory locations are accessed consecutively. In original (i,j) order with row-major data: consecutive j-values = contiguous memory (green arrows). In permuted (j,i) order with row-major data: consecutive i-values = strided memory (red arrows).
- **Right panel (620–800):** Show the loop code for current transform, highlighting the loop bounds and iteration variables.

```
// Original:
for (i = 0; i < 8; i++)
  for (j = 0; j < 8; j++)
    C[i][j] += A[i][k] * B[k][j];

// Tiled:
for (ii = 0; ii < 8; ii += 4)
  for (jj = 0; jj < 8; jj += 4)
    for (i = ii; i < ii+4; i++)
      for (j = jj; j < jj+4; j++)
        C[i][j] += A[i][k] * B[k][j];
```

- [ ] **Step 2: Implement LoopTransformationDemo**

Shows concrete loop transformations with before/after code and their effects on data locality.

**Data model:**

```tsx
interface LoopTransform {
  id: string;
  name: { zh: string; en: string };
  before: string;              // Loop code before transformation
  after: string;               // Loop code after transformation
  description: { zh: string; en: string };
  localityEffect: {
    before: { l1Hits: number; l1Misses: number };  // simplified cache model
    after: { l1Hits: number; l1Misses: number };
  };
  category: 'reorder' | 'partition' | 'restructure';
}

const TRANSFORMS: LoopTransform[] = [
  {
    id: 'interchange',
    name: { zh: '循环交换 (Loop Interchange)', en: 'Loop Interchange' },
    before: `for (i = 0; i < M; i++)
  for (j = 0; j < N; j++)
    B[j][i] = A[j][i] * 2;  // stride-N access`,
    after: `for (j = 0; j < N; j++)
  for (i = 0; i < M; i++)
    B[j][i] = A[j][i] * 2;  // stride-1 access`,
    description: {
      zh: '交换 i 和 j 循环。原始顺序中 A[j][i] 和 B[j][i] 的 j 维度在外层不变，i 在内层变化——但 C 语言行优先存储中 [j][i] 意味着 i 是列索引，连续迭代访问不连续内存。交换后 j 在内层连续变化，访问连续内存。',
      en: 'Swap i and j loops. Original order has stride-N access pattern for row-major arrays. After interchange, inner loop iterates over contiguous memory.',
    },
    localityEffect: {
      before: { l1Hits: 25, l1Misses: 75 },
      after: { l1Hits: 90, l1Misses: 10 },
    },
    category: 'reorder',
  },
  {
    id: 'tiling',
    name: { zh: 'Tiling (Loop Blocking)', en: 'Tiling (Loop Blocking)' },
    before: `for (i = 0; i < 1024; i++)
  for (j = 0; j < 1024; j++)
    C[i][j] += A[i][k] * B[k][j];
// Working set: entire rows of A and B`,
    after: `for (ii = 0; ii < 1024; ii += 32)
  for (jj = 0; jj < 1024; jj += 32)
    for (i = ii; i < ii+32; i++)
      for (j = jj; j < jj+32; j++)
        C[i][j] += A[i][k] * B[k][j];
// Working set: 32×32 tiles fit in L1`,
    description: {
      zh: 'Strip-mining + interchange 的组合。将 1024×1024 的工作集分解为 32×32 的 tile。每个 tile 的数据（32×32 × 4B = 4KB）可以放入 L1 cache（通常 32-64KB），避免反复从 L2/L3/DRAM 读取。',
      en: 'Strip-mining + interchange. Decomposes 1024×1024 working set into 32×32 tiles. Each tile (4KB) fits in L1 cache, avoiding repeated L2/DRAM accesses.',
    },
    localityEffect: {
      before: { l1Hits: 10, l1Misses: 90 },
      after: { l1Hits: 85, l1Misses: 15 },
    },
    category: 'partition',
  },
  {
    id: 'unroll',
    name: { zh: '循环展开 (Loop Unrolling)', en: 'Loop Unrolling' },
    before: `for (i = 0; i < N; i++)
  sum += a[i];
// 4 iterations = 4 loop overhead cycles`,
    after: `for (i = 0; i < N; i += 4) {
  sum += a[i];
  sum += a[i+1];
  sum += a[i+2];
  sum += a[i+3];
}
// 4 iterations = 1 loop overhead cycle`,
    description: {
      zh: '减少循环控制开销（branch prediction、counter increment）。同时增加指令级并行（ILP）：CPU 可以同时执行多条独立的加载和运算指令。展开因子通常选 4-8。',
      en: 'Reduces loop control overhead (branch, counter). Also increases ILP: CPU can execute multiple independent load+compute instructions simultaneously. Unroll factor typically 4-8.',
    },
    localityEffect: {
      before: { l1Hits: 95, l1Misses: 5 },
      after: { l1Hits: 98, l1Misses: 2 },
    },
    category: 'restructure',
  },
  {
    id: 'fusion',
    name: { zh: '循环融合 (Loop Fusion)', en: 'Loop Fusion' },
    before: `for (i = 0; i < N; i++)
  B[i] = A[i] * 2;
for (i = 0; i < N; i++)
  C[i] = B[i] + 1;
// B[] written to memory, then read back`,
    after: `for (i = 0; i < N; i++) {
  B[i] = A[i] * 2;
  C[i] = B[i] + 1;  // B[i] still in register
}
// B[i] stays in register, no memory round-trip`,
    description: {
      zh: '将两个具有相同迭代空间的循环合并。B[i] 在第一个循环写入后立即被第二个循环使用——融合后 B[i] 可以留在寄存器中，无需写回内存再读取。这是 kernel fusion 在循环层面的体现。',
      en: 'Merge two loops with same iteration space. B[i] stays in register after write, eliminating memory round-trip. This is kernel fusion at the loop level.',
    },
    localityEffect: {
      before: { l1Hits: 50, l1Misses: 50 },
      after: { l1Hits: 95, l1Misses: 5 },
    },
    category: 'restructure',
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 500`
- **Top:** Category tabs (reorder / partition / restructure) + transform selector within each category
- **Main area split:**
  - Left (0–380): "Before" code block with syntax highlighting (use `<text>` elements with `FONTS.mono`, colored keywords)
  - Right (420–800): "After" code block, same style
  - Changed lines highlighted with `COLORS.highlight` background
- **Bottom panel:** Cache locality bar chart comparison:
  - Two horizontal stacked bars (before/after)
  - Green segment = L1 hits, Red segment = L1 misses
  - Percentage labels
- **Animation:** When switching transforms, code blocks cross-fade, cache bars animate width change.

- [ ] **Step 3: Implement DependenceAnalysisDemo**

Visualizes data dependencies in a 2D iteration space and validates whether a proposed transformation is legal.

**Data model:**

```tsx
interface DependenceVector {
  di: number;   // dependence distance in i dimension
  dj: number;   // dependence distance in j dimension
  label: string; // e.g. "(1, 0)" meaning iteration (i+1, j) depends on (i, j)
}

interface DependenceScenario {
  id: string;
  name: { zh: string; en: string };
  code: string;                          // Loop code
  dependences: DependenceVector[];       // dependence vectors
  description: { zh: string; en: string };
}

const SCENARIOS: DependenceScenario[] = [
  {
    id: 'no_dep',
    name: { zh: '无依赖（完全并行）', en: 'No Dependence (Fully Parallel)' },
    code: `for (i = 0..7)
  for (j = 0..7)
    C[i][j] = A[i][j] + B[i][j];`,
    dependences: [],
    description: {
      zh: '每次迭代读写独立的内存位置。所有迭代可以任意顺序执行，甚至完全并行。任何循环变换都合法。',
      en: 'Each iteration reads/writes independent locations. All iterations can execute in any order or fully in parallel. Any loop transformation is legal.',
    },
  },
  {
    id: 'flow_i',
    name: { zh: '流依赖（i 方向）', en: 'Flow Dependence (i direction)' },
    code: `for (i = 1..7)
  for (j = 0..7)
    A[i][j] = A[i-1][j] + 1;`,
    dependences: [{ di: 1, dj: 0, label: '(1, 0)' }],
    description: {
      zh: '迭代 (i, j) 读取 A[i-1][j]，即依赖迭代 (i-1, j) 的写入。依赖向量 (1, 0) 表示 i 方向必须顺序执行，但 j 方向可以并行。',
      en: 'Iteration (i,j) reads A[i-1][j], depending on write from (i-1,j). Dependence vector (1,0) means i must be sequential, but j can be parallelized.',
    },
  },
  {
    id: 'flow_diag',
    name: { zh: '对角线依赖', en: 'Diagonal Dependence' },
    code: `for (i = 1..7)
  for (j = 1..7)
    A[i][j] = A[i-1][j-1] * 2;`,
    dependences: [{ di: 1, dj: 1, label: '(1, 1)' }],
    description: {
      zh: '迭代 (i, j) 依赖 (i-1, j-1)——沿对角线方向。通过 skewing 变换 (i, j) → (i, i+j)，可以将对角线依赖转化为垂直依赖，使得每个"反对角线"上的迭代可以并行。',
      en: 'Iteration (i,j) depends on (i-1,j-1) — diagonal direction. Skewing (i,j)→(i,i+j) converts this to vertical dependence, enabling parallel execution along anti-diagonals.',
    },
  },
  {
    id: 'anti_dep',
    name: { zh: '反依赖', en: 'Anti-dependence' },
    code: `for (i = 0..6)
  for (j = 0..7)
    A[i][j] = A[i+1][j] + 1;`,
    dependences: [{ di: 1, dj: 0, label: '(1, 0)' }],
    description: {
      zh: '迭代 (i, j) 读 A[i+1][j]，迭代 (i+1, j) 写 A[i+1][j]——读必须在写之前完成（WAR 反依赖）。依赖向量 (1, 0) 为正，意味着正向遍历（i 从小到大）自然满足依赖；反向遍历会导致错误。',
      en: 'Iteration (i,j) reads A[i+1][j], iteration (i+1,j) writes A[i+1][j] — read must precede write (WAR anti-dependence). Positive vector (1,0) means normal forward traversal satisfies the dependence; reverse traversal would violate it.',
    },
  },
];

// Legality check: a transformation T (represented as a matrix) is legal if
// for every dependence vector d, T·d is lexicographically non-negative (first non-zero component ≥ 0).
// The component allows users to try transformations and see if they're legal.
```

**Rendering approach:**

- SVG viewBox `0 0 800 550`
- **Left area (0–500):** 8×8 iteration space grid (same style as PolyhedralVisualizer)
  - Dependence arrows drawn between points: from (i,j) to (i+di, j+dj). Arrow color: flow dep = `COLORS.primary`, anti dep = `COLORS.red`, output dep = `COLORS.orange`.
  - If a proposed transform is illegal, highlight violating arrows in red with "✗" badge.
- **Right area (520–800):**
  - Scenario selector (radio buttons)
  - Current code snippet
  - Dependence vector list with visual labels
  - "Try Transform" buttons: interchange, tiling, skewing, reverse
  - Legality result: ✅ Legal (green) or ❌ Illegal (red) with explanation
- **Bottom:** Description text for the current scenario + selected transform.
- When user selects a transform: the iteration space shows the new execution order (numbered/colored), and legality is checked. If legal, a green badge appears. If illegal, the specific violating dependence arrow pulses red.

- [ ] **Step 4: Verify all 3 components render**

Run: `npm run dev`. Verify:
- PolyhedralVisualizer: all 4 transforms work, animation plays, tile colors visible
- LoopTransformationDemo: code blocks render, cache bars animate
- DependenceAnalysisDemo: arrows render, legality checks work for all scenarios

### Step Group B: Article 7 MDX (zh + en)

- [ ] **Step 5: Write Article 7 Chinese version**

Create `src/content/articles/zh/graph-passes-polyhedral.mdx`.

**Frontmatter:**

```yaml
---
title: "图优化 Pass（下）：Polyhedral 优化与循环变换"
slug: graph-passes-polyhedral
locale: zh
tags: [compiler, polyhedral, loop-optimization, affine, mlir, tiling]
prerequisites: [graph-passes-foundations]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "A Practical Automatic Polyhedral Parallelizer and Locality Optimizer"
    url: "https://dl.acm.org/doi/10.1145/1375581.1375595"
  - type: website
    title: "MLIR Affine Dialect"
    url: "https://mlir.llvm.org/docs/Dialects/Affine/"
  - type: paper
    title: "Polyhedral Compilation as a Design Pattern for Compiler Construction"
    url: "https://link.springer.com/chapter/10.1007/978-3-030-35225-7_1"
  - type: website
    title: "MLIR Transform Dialect"
    url: "https://mlir.llvm.org/docs/Dialects/Transform/"
  - type: paper
    title: "Optimizing Compilers for Modern Architectures"
    url: "https://www.elsevier.com/books/optimizing-compilers-for-modern-architectures/allen/978-0-08-051324-9"
---
```

**Content structure:**

1. `<CompilerStackMap mode="compact" currentArticle="graph-passes-polyhedral" client:visible />`
2. `## 简介` — Why loop transformations matter for ML. Most ops eventually become nested loops (matmul = 3 loops, conv2d = 7 loops). Loop order and tiling directly determine performance.
3. `## 为什么需要循环变换` — Motivating example: naive matmul vs tiled matmul. Quantitative analysis of cache misses. Combinatorial explosion of possible loop orderings (N! for N loops) → need systematic framework.
4. `## Polyhedral Model 基础`
   - **Iteration domain**: the set of integer points in a loop nest. For `for (i=0; i<M) for (j=0; j<N)`, domain = `{(i,j) : 0 ≤ i < M, 0 ≤ j < N}`. Show as 2D grid.
   - **Access function**: how each iteration accesses memory. `A[i][k]` → affine function (i, k) from iteration variables. `B[k][j]` → affine function (k, j).
   - **Dependence relation**: which iteration must execute before which. Formal definition: iteration S1(i1) depends on S0(i0) if they access the same location and at least one is a write.
   - Use `$...$` math notation for formal definitions.
   - **ILP formulation**: loop transformations as integer linear programming problems.
5. `## 循环变换的数学表示`
   - Affine transformation: `(i', j') = T · (i, j)` where T is an integer matrix.
   - Tiling = strip-mining + interchange. Mathematical representation.
   - Permutation, skewing, fusion, fission — all as matrix operations.
   - **Legality**: transformation is legal iff for every dependence vector d, `T·d` is lexicographically non-negative (first non-zero component ≥ 0).
   - `<PolyhedralVisualizer client:visible />`
   - `<DependenceAnalysisDemo client:visible />`
6. `## MLIR 的 Affine Dialect`
   - `affine.for`, `affine.load`, `affine.store` — structured loop ops with affine bounds
   - Affine map: `#map = affine_map<(d0, d1) -> (d0, d1)>` — describe access patterns
   - Built-in affine analysis passes: dependence analysis, loop tiling, loop fusion, loop permutation
   - Example: `mlir-opt --affine-loop-tile="tile-size=32"` applied to matmul
   - Show actual MLIR IR before and after tiling
7. `## 具体循环变换实战`
   - `<LoopTransformationDemo client:visible />`
   - Walk through each transform with code + performance analysis
8. `## Polyhedral 在 ML 中的应用与局限`
   - Works well for: dense GEMM, conv2d, depthwise conv, pooling — regular access patterns
   - Works poorly for: sparse operations, ragged tensors, dynamic shapes, attention (data-dependent access patterns in softmax)
   - Reality: most ML compilers use heuristic tiling (Inductor, XLA) rather than full polyhedral analysis. MLIR Affine is the exception.
   - Comparison: polyhedral auto-optimizer vs TVM's schedule search vs Inductor's heuristics
9. `## MLIR Transform Dialect 预览` — Alternative approach: instead of mathematical auto-optimization, describe transform strategies in IR itself. User or compiler specifies "tile this loop by 32, then vectorize inner loop". Complementary to polyhedral.
10. `## 总结` — Key takeaways. Preview: Art.8 (operator fusion taxonomy).
11. `## 延伸阅读`

- [ ] **Step 6: Write Article 7 English version**

Create `src/content/articles/en/graph-passes-polyhedral.mdx`. Same structure, `locale: en`.

- [ ] **Step 7: Verify article renders**

Run: `npm run dev`, check both `/zh/` and `/en/` versions. Run: `npm run validate`.

- [ ] **Step 8: Commit**

```bash
git add src/components/interactive/PolyhedralVisualizer.tsx \
        src/components/interactive/LoopTransformationDemo.tsx \
        src/components/interactive/DependenceAnalysisDemo.tsx \
        src/content/articles/zh/graph-passes-polyhedral.mdx \
        src/content/articles/en/graph-passes-polyhedral.mdx
git commit -m "feat(graph-compilation): add Article 7 — polyhedral optimization with PolyhedralVisualizer, LoopTransformationDemo, DependenceAnalysisDemo"
```

---

## Task 4: Article 8 — 融合类型学 (operator-fusion-taxonomy)

This is the first of two operator fusion articles. It covers fusion types, legality analysis, and fusion algorithms. Dual main-line. Three interactive components.

**Files:**
- Create: `src/components/interactive/FusionTaxonomy.tsx`
- Create: `src/components/interactive/FusionLegalityChecker.tsx`
- Create: `src/components/interactive/FusionAlgorithmStepper.tsx`
- Create: `src/content/articles/zh/operator-fusion-taxonomy.mdx`
- Create: `src/content/articles/en/operator-fusion-taxonomy.mdx`

### Step Group A: Components

- [ ] **Step 1: Implement FusionTaxonomy**

Interactive classification of fusion types. Click each type to see before/after computation graphs and memory access patterns.

**Data model:**

```tsx
interface FusionType {
  id: string;
  name: { zh: string; en: string };
  category: 'simple' | 'complex';  // simple = standard patterns, complex = algorithmic rewrites
  // Before fusion: separate ops
  beforeOps: { id: string; op: string; label: string; memReads: number; memWrites: number }[];
  beforeEdges: { from: string; to: string }[];
  // After fusion: fused kernel
  afterOps: { id: string; op: string; label: string; memReads: number; memWrites: number }[];
  afterEdges: { from: string; to: string }[];
  description: { zh: string; en: string };
  savings: { zh: string; en: string };  // e.g. "节省 2 次 HBM 读写"
}

const FUSION_TYPES: FusionType[] = [
  {
    id: 'elementwise',
    name: { zh: 'Element-wise 融合', en: 'Element-wise Fusion' },
    category: 'simple',
    beforeOps: [
      { id: 'x', op: 'input', label: 'x', memReads: 0, memWrites: 0 },
      { id: 'relu', op: 'relu', label: 'relu(x)', memReads: 4, memWrites: 4 },
      { id: 'mul', op: 'mul', label: '× 2', memReads: 4, memWrites: 4 },
      { id: 'add', op: 'add', label: '+ bias', memReads: 4, memWrites: 4 },
    ],
    beforeEdges: [
      { from: 'x', to: 'relu' }, { from: 'relu', to: 'mul' }, { from: 'mul', to: 'add' },
    ],
    afterOps: [
      { id: 'x', op: 'input', label: 'x', memReads: 0, memWrites: 0 },
      { id: 'fused', op: 'fused', label: 'relu(x)×2+bias', memReads: 4, memWrites: 4 },
    ],
    afterEdges: [{ from: 'x', to: 'fused' }],
    description: {
      zh: '最简单的融合类型。多个 element-wise 操作串联（relu → mul → add），每个元素独立处理，无跨元素依赖。融合后所有操作在一次 HBM 读写中完成。',
      en: 'Simplest fusion type. Multiple element-wise ops chained (relu → mul → add). Each element processed independently. After fusion, all ops complete in one HBM read-write.',
    },
    savings: { zh: 'HBM 读写从 12+12=24 MB 降到 4+4=8 MB (节省 67%)', en: 'HBM access reduced from 24 MB to 8 MB (67% savings)' },
  },
  {
    id: 'reduction',
    name: { zh: 'Reduction 融合', en: 'Reduction Fusion' },
    category: 'simple',
    beforeOps: [
      { id: 'x', op: 'input', label: 'x [N×D]', memReads: 0, memWrites: 0 },
      { id: 'square', op: 'mul', label: 'x²', memReads: 4, memWrites: 4 },
      { id: 'sum', op: 'reduce_sum', label: 'Σ(x²)', memReads: 4, memWrites: 1 },
      { id: 'sqrt', op: 'sqrt', label: '√Σ', memReads: 1, memWrites: 1 },
    ],
    beforeEdges: [
      { from: 'x', to: 'square' }, { from: 'square', to: 'sum' }, { from: 'sum', to: 'sqrt' },
    ],
    afterOps: [
      { id: 'x', op: 'input', label: 'x [N×D]', memReads: 0, memWrites: 0 },
      { id: 'fused', op: 'fused', label: '√Σ(x²)', memReads: 4, memWrites: 1 },
    ],
    afterEdges: [{ from: 'x', to: 'fused' }],
    description: {
      zh: 'Reduction 操作（sum, mean, max）与前后的 element-wise 操作融合。关键约束：reduction 维度决定了 kernel 的并行策略。融合后 x² 在 reduction 循环内完成，无需中间 buffer。',
      en: 'Reduction ops (sum, mean, max) fused with surrounding element-wise ops. Key constraint: reduction dimension determines kernel parallelism. After fusion, x² computed within reduction loop, no intermediate buffer.',
    },
    savings: { zh: '消除 x² 的 4 MB 中间 buffer 写入+读取', en: 'Eliminates 4 MB intermediate buffer write+read for x²' },
  },
  {
    id: 'broadcast',
    name: { zh: 'Broadcast 融合', en: 'Broadcast Fusion' },
    category: 'simple',
    beforeOps: [
      { id: 'x', op: 'input', label: 'x [N×D]', memReads: 0, memWrites: 0 },
      { id: 'mean', op: 'reduce_mean', label: 'mean [N×1]', memReads: 4, memWrites: 1 },
      { id: 'bcast', op: 'broadcast', label: 'broadcast [N×D]', memReads: 1, memWrites: 4 },
      { id: 'sub', op: 'sub', label: 'x − mean', memReads: 8, memWrites: 4 },
    ],
    beforeEdges: [
      { from: 'x', to: 'mean' }, { from: 'mean', to: 'bcast' },
      { from: 'x', to: 'sub' }, { from: 'bcast', to: 'sub' },
    ],
    afterOps: [
      { id: 'x', op: 'input', label: 'x [N×D]', memReads: 0, memWrites: 0 },
      { id: 'fused', op: 'fused', label: 'x − mean(x)', memReads: 4, memWrites: 4 },
    ],
    afterEdges: [{ from: 'x', to: 'fused' }],
    description: {
      zh: 'Broadcast 操作将低维结果扩展到高维，然后与高维 tensor 做 element-wise 操作。融合后 broadcast 是隐式的——reduction 结果直接在内层循环中复用，无需物化为完整 tensor。这是 LayerNorm/RMSNorm 融合的核心 pattern。',
      en: 'Broadcast expands low-dim result to high-dim, then element-wise with high-dim tensor. After fusion, broadcast is implicit — reduction result reused directly in inner loop. Core pattern for LayerNorm/RMSNorm fusion.',
    },
    savings: { zh: '消除 broadcast 物化的 4 MB 中间 tensor', en: 'Eliminates 4 MB materialized broadcast tensor' },
  },
  {
    id: 'transpose_fusion',
    name: { zh: 'Transpose/Reshape 融合', en: 'Transpose/Reshape Fusion' },
    category: 'simple',
    beforeOps: [
      { id: 'x', op: 'input', label: 'x [B×H×S×D]', memReads: 0, memWrites: 0 },
      { id: 'transpose', op: 'transpose', label: 'transpose [B×S×H×D]', memReads: 4, memWrites: 4 },
      { id: 'reshape', op: 'reshape', label: 'reshape [BS×HD]', memReads: 4, memWrites: 4 },
      { id: 'linear', op: 'matmul', label: 'matmul', memReads: 8, memWrites: 4 },
    ],
    beforeEdges: [
      { from: 'x', to: 'transpose' }, { from: 'transpose', to: 'reshape' }, { from: 'reshape', to: 'linear' },
    ],
    afterOps: [
      { id: 'x', op: 'input', label: 'x [B×H×S×D]', memReads: 0, memWrites: 0 },
      { id: 'fused', op: 'fused', label: 'matmul (custom index)', memReads: 4, memWrites: 4 },
    ],
    afterEdges: [{ from: 'x', to: 'fused' }],
    description: {
      zh: 'Transpose 和 reshape 不做计算，只重排数据。融合后通过修改后续 op 的 index 计算公式（stride manipulation）来隐式完成重排，避免实际的数据搬移。限制：不是所有 transpose+op 组合都能融合——取决于后续 op 是否支持自定义 stride。',
      en: 'Transpose/reshape only rearrange data. After fusion, rearrangement absorbed into subsequent op via stride manipulation, avoiding actual data movement. Limitation: not all transpose+op combos can fuse — depends on whether the op supports custom strides.',
    },
    savings: { zh: '消除 transpose 和 reshape 的 8+8=16 MB 数据搬移', en: 'Eliminates 16 MB data movement from transpose+reshape' },
  },
  {
    id: 'flash_attention',
    name: { zh: 'FlashAttention（算法级重写）', en: 'FlashAttention (Algorithmic Rewrite)' },
    category: 'complex',
    beforeOps: [
      { id: 'q', op: 'input', label: 'Q', memReads: 0, memWrites: 0 },
      { id: 'k', op: 'input', label: 'K', memReads: 0, memWrites: 0 },
      { id: 'v', op: 'input', label: 'V', memReads: 0, memWrites: 0 },
      { id: 'scores', op: 'matmul', label: 'Q×Kᵀ [N×N]', memReads: 8, memWrites: 16 },
      { id: 'softmax', op: 'softmax', label: 'softmax [N×N]', memReads: 16, memWrites: 16 },
      { id: 'attn', op: 'matmul', label: 'attn×V', memReads: 20, memWrites: 4 },
    ],
    beforeEdges: [
      { from: 'q', to: 'scores' }, { from: 'k', to: 'scores' },
      { from: 'scores', to: 'softmax' },
      { from: 'softmax', to: 'attn' }, { from: 'v', to: 'attn' },
    ],
    afterOps: [
      { id: 'q', op: 'input', label: 'Q', memReads: 0, memWrites: 0 },
      { id: 'k', op: 'input', label: 'K', memReads: 0, memWrites: 0 },
      { id: 'v', op: 'input', label: 'V', memReads: 0, memWrites: 0 },
      { id: 'flash', op: 'flash_attn', label: 'FlashAttention (tiled)', memReads: 8, memWrites: 4 },
    ],
    afterEdges: [
      { from: 'q', to: 'flash' }, { from: 'k', to: 'flash' }, { from: 'v', to: 'flash' },
    ],
    description: {
      zh: '不是简单的 op 融合，而是算法级重写。标准 attention 物化 N×N 的 score 矩阵到 HBM（对于 N=4096，这是 32MB FP16）。FlashAttention 通过 tiled 计算 + online softmax 避免了 N×N 矩阵的物化。这需要重写 softmax 算法（incremental max + rescaling），不是通用融合框架能自动发现的。',
      en: 'Not simple op fusion, but algorithmic rewrite. Standard attention materializes N×N score matrix to HBM (32MB FP16 for N=4096). FlashAttention avoids this via tiled computation + online softmax. Requires rewriting the softmax algorithm (incremental max + rescaling) — cannot be auto-discovered by generic fusion frameworks.',
    },
    savings: { zh: 'HBM 访问从 O(N²) 降到 O(N²d²/M)，N=4096 时约节省 90%', en: 'HBM access reduced from O(N²) to O(N²d²/M), ~90% savings at N=4096' },
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 600`
- **Left panel (0–200):** Category list. "Simple" section with 4 fusion types, "Complex" section with FlashAttention. Click to select.
- **Right panel (220–800):** Two sub-panels:
  - **Top (220–800, 0–280):** Before/After graph comparison. Left = before (separate ops as DAG), right = after (fused ops). Animated transition when switching fusion types.
  - Each node shows its `memReads`/`memWrites` as small badges. Fused nodes show reduced values in green.
  - **Bottom (220–800, 300–600):** Description text + savings badge (green box with savings text).
- Color coding: `simple` category uses `COLORS.primary` for fused nodes, `complex` uses `COLORS.purple` (indicating algorithmic rewrite).
- Memory savings visualization: horizontal bar comparing total before vs after HBM access.

- [ ] **Step 2: Implement FusionLegalityChecker**

Interactive tool where users select two adjacent ops and the system checks if fusion is legal.

**Data model:**

```tsx
interface LegalityCheck {
  producerConsumer: boolean;      // are they in producer-consumer relationship?
  noCyclicDependency: boolean;    // would fusion create a cycle in the graph?
  shapeCompatible: boolean;       // compatible shapes for fusion?
  noSideEffects: boolean;         // neither op has side effects?
  memoryFits: boolean;            // fused kernel fits in shared memory / registers?
}

// A medium-sized computation graph for the checker
interface CheckerNode {
  id: string;
  op: string;
  label: string;
  inputs: string[];
  shape: string;                  // e.g. "[128, 768]"
  hasSideEffect: boolean;
  memoryEstimate: number;         // MB for kernel
}

const CHECKER_GRAPH: CheckerNode[] = [
  { id: 'x', op: 'input', label: 'x', inputs: [], shape: '[128, 768]', hasSideEffect: false, memoryEstimate: 0 },
  { id: 'w1', op: 'param', label: 'W₁', inputs: [], shape: '[768, 3072]', hasSideEffect: false, memoryEstimate: 0 },
  { id: 'mm1', op: 'matmul', label: 'x @ W₁', inputs: ['x', 'w1'], shape: '[128, 3072]', hasSideEffect: false, memoryEstimate: 12 },
  { id: 'gelu', op: 'gelu', label: 'GELU', inputs: ['mm1'], shape: '[128, 3072]', hasSideEffect: false, memoryEstimate: 2 },
  { id: 'w2', op: 'param', label: 'W₂', inputs: [], shape: '[3072, 768]', hasSideEffect: false, memoryEstimate: 0 },
  { id: 'mm2', op: 'matmul', label: 'GELU @ W₂', inputs: ['gelu', 'w2'], shape: '[128, 768]', hasSideEffect: false, memoryEstimate: 12 },
  { id: 'dropout', op: 'dropout', label: 'dropout', inputs: ['mm2'], shape: '[128, 768]', hasSideEffect: true, memoryEstimate: 1 },  // side effect: random state
  { id: 'add', op: 'add', label: 'residual add', inputs: ['dropout', 'x'], shape: '[128, 768]', hasSideEffect: false, memoryEstimate: 1 },
  { id: 'ln', op: 'layer_norm', label: 'LayerNorm', inputs: ['add'], shape: '[128, 768]', hasSideEffect: false, memoryEstimate: 2 },
  { id: 'out', op: 'output', label: 'output', inputs: ['ln'], shape: '[128, 768]', hasSideEffect: false, memoryEstimate: 0 },
];

// Example fusion attempts and their outcomes:
// mm1 + gelu → ✅ legal (producer-consumer, compatible shape, no side effects)
// gelu + mm2 → ✅ legal (producer-consumer, shape changes but matmul handles it)
// mm2 + dropout → ⚠️ legal but risky (dropout has side effect: random number generation)
// dropout + add → ❌ illegal: add also depends on x (skip connection), fusing dropout+add
//                 would not form a simple linear chain — but it's actually legal if we handle
//                 the multiple inputs correctly. More precisely: it IS legal because there's no
//                 cycle. The real issue is: mm1 + mm2 → ❌ not producer-consumer (gelu in between)
// x + ln → ❌ not producer-consumer (multiple ops in between)
```

**Rendering approach:**

- SVG viewBox `0 0 800 500`
- **Main area:** DAG of the computation graph. Nodes as rounded rects, edges as arrows.
- **Interaction:** User clicks two nodes to select them (first click = producer, second = consumer). Selected nodes get thick border.
- **After selection:** A checklist panel slides in from the right showing:
  - ✅/❌ Producer-consumer? (are they directly connected?)
  - ✅/❌ No cyclic dependency? (would fusing create a cycle in the remaining graph?)
  - ✅/❌ Shape compatible?
  - ✅/❌ No side effects?
  - ✅/❌ Memory fits? (combined kernel < 48KB shared memory)
  - **Overall verdict:** ✅ Fusible / ❌ Not fusible / ⚠️ Fusible with caveats
- Color: selected pair highlighted with `COLORS.highlight`. If fusible → nodes glow green. If not → nodes glow red.
- "Clear" button to reset selection.

- [ ] **Step 3: Implement FusionAlgorithmStepper**

Greedy fusion algorithm visualization on a medium-sized graph.

**Data model:**

```tsx
interface FusionGroup {
  id: number;
  nodeIds: string[];
  color: string;  // from HEAD_COLORS
  type: 'pointwise' | 'reduction' | 'matmul';  // kernel type
}

// Algorithm steps
interface AlgorithmStep {
  description: { zh: string; en: string };
  groups: FusionGroup[];           // current fusion groups
  currentEdge?: [string, string];  // edge being evaluated
  decision?: 'fuse' | 'skip';
  reason?: { zh: string; en: string };
}

// A Transformer FFN subgraph for the algorithm to work on
const FFN_GRAPH = [
  { id: 'x', op: 'input', label: 'x [128×768]' },
  { id: 'ln', op: 'layer_norm', label: 'LayerNorm' },
  { id: 'w1', op: 'param', label: 'W₁ [768×3072]' },
  { id: 'mm1', op: 'matmul', label: 'x @ W₁' },
  { id: 'gelu', op: 'gelu', label: 'GELU' },
  { id: 'w2', op: 'param', label: 'W₂ [3072×768]' },
  { id: 'mm2', op: 'matmul', label: 'GELU @ W₂' },
  { id: 'add', op: 'add', label: '+ residual' },
  { id: 'out', op: 'output', label: 'output' },
];

const FFN_EDGES = [
  { from: 'x', to: 'ln' },
  { from: 'ln', to: 'mm1' }, { from: 'w1', to: 'mm1' },
  { from: 'mm1', to: 'gelu' },
  { from: 'gelu', to: 'mm2' }, { from: 'w2', to: 'mm2' },
  { from: 'mm2', to: 'add' }, { from: 'x', to: 'add' },  // skip connection
  { from: 'add', to: 'out' },
];

// Greedy algorithm steps (TorchInductor-style):
// 1. Initialize: each node is its own fusion group
// 2. Scan edges in topological order
// 3. For each edge (A → B): can A's group merge with B's group?
//    - Check: no cycle, shape compatibility, kernel type compatibility
// 4. If yes → merge groups
// 5. Result: fusion groups = kernel boundaries

const ALGORITHM_STEPS: AlgorithmStep[] = [
  {
    description: { zh: '初始化：每个节点是独立的 fusion group', en: 'Initialize: each node is its own fusion group' },
    groups: [
      { id: 0, nodeIds: ['x'], color: HEAD_COLORS[0], type: 'pointwise' },
      { id: 1, nodeIds: ['ln'], color: HEAD_COLORS[1], type: 'reduction' },
      { id: 2, nodeIds: ['w1'], color: HEAD_COLORS[2], type: 'pointwise' },
      { id: 3, nodeIds: ['mm1'], color: HEAD_COLORS[3], type: 'matmul' },
      { id: 4, nodeIds: ['gelu'], color: HEAD_COLORS[4], type: 'pointwise' },
      { id: 5, nodeIds: ['w2'], color: HEAD_COLORS[5], type: 'pointwise' },
      { id: 6, nodeIds: ['mm2'], color: HEAD_COLORS[6], type: 'matmul' },
      { id: 7, nodeIds: ['add'], color: HEAD_COLORS[7], type: 'pointwise' },
      { id: 8, nodeIds: ['out'], color: HEAD_COLORS[0], type: 'pointwise' },
    ],
  },
  {
    description: { zh: '评估 x → LayerNorm：input 不参与 fusion', en: 'Evaluate x → LayerNorm: input nodes don\'t participate in fusion' },
    currentEdge: ['x', 'ln'],
    decision: 'skip',
    reason: { zh: 'x 是 input placeholder，不生成 kernel', en: 'x is input placeholder, no kernel generated' },
    groups: [/* same as step 0 */],
  },
  {
    description: { zh: '评估 LayerNorm → mm1：reduction + matmul，不同 kernel type', en: 'Evaluate LayerNorm → mm1: reduction + matmul, different kernel types' },
    currentEdge: ['ln', 'mm1'],
    decision: 'skip',
    reason: { zh: 'LayerNorm 是 reduction kernel，matmul 是 GEMM kernel，不能融合（不同的并行策略）', en: 'LayerNorm is reduction kernel, matmul is GEMM kernel — cannot fuse (different parallelism)' },
    groups: [/* same */],
  },
  {
    description: { zh: '评估 mm1 → GELU：matmul 的 epilogue 可以融合 pointwise op', en: 'Evaluate mm1 → GELU: matmul epilogue can fuse pointwise op' },
    currentEdge: ['mm1', 'gelu'],
    decision: 'fuse',
    reason: { zh: 'GELU 是 pointwise op，可以作为 matmul 的 epilogue fusion（在写回 HBM 之前直接计算 GELU）', en: 'GELU is pointwise, can be fused as matmul epilogue (compute GELU before writing back to HBM)' },
    groups: [
      // mm1 + gelu merged
      { id: 3, nodeIds: ['mm1', 'gelu'], color: HEAD_COLORS[3], type: 'matmul' },
      // others unchanged
    ],
  },
  {
    description: { zh: '评估 GELU → mm2：GELU 已融入 mm1 group。mm1_group → mm2 是 matmul → matmul', en: 'Evaluate GELU → mm2: GELU now in mm1 group. mm1_group → mm2 is matmul → matmul' },
    currentEdge: ['gelu', 'mm2'],
    decision: 'skip',
    reason: { zh: '两个 matmul 不能融合为一个 kernel（各自需要独立的 GEMM tile 策略）', en: 'Two matmuls cannot fuse into one kernel (each needs independent GEMM tiling strategy)' },
    groups: [/* same as step 3 */],
  },
  {
    description: { zh: '评估 mm2 → add：matmul epilogue 可以融合 add', en: 'Evaluate mm2 → add: matmul epilogue can fuse add' },
    currentEdge: ['mm2', 'add'],
    decision: 'fuse',
    reason: { zh: 'residual add 是 pointwise op，可以作为 mm2 的 epilogue fusion。x 的 skip connection 作为额外输入。', en: 'Residual add is pointwise, can be mm2 epilogue. x skip connection is an extra input.' },
    groups: [
      { id: 6, nodeIds: ['mm2', 'add'], color: HEAD_COLORS[6], type: 'matmul' },
    ],
  },
  {
    description: { zh: '最终结果：3 个 kernel', en: 'Final result: 3 kernels' },
    groups: [
      { id: 1, nodeIds: ['ln'], color: HEAD_COLORS[1], type: 'reduction' },
      { id: 3, nodeIds: ['mm1', 'gelu'], color: HEAD_COLORS[3], type: 'matmul' },
      { id: 6, nodeIds: ['mm2', 'add'], color: HEAD_COLORS[6], type: 'matmul' },
    ],
    decision: undefined,
    reason: { zh: 'Kernel 1: LayerNorm (reduction)。Kernel 2: MatMul₁ + GELU (matmul with epilogue)。Kernel 3: MatMul₂ + ResidualAdd (matmul with epilogue)。原始 9 个 op → 3 个 kernel launch。', en: 'Kernel 1: LayerNorm (reduction). Kernel 2: MatMul₁+GELU (epilogue). Kernel 3: MatMul₂+ResidualAdd (epilogue). 9 ops → 3 kernel launches.' },
  },
];
```

**Note:** The `groups` arrays in intermediate steps should be reconstructed by the implementer to reflect the correct state at each step. The above shows the key steps — fill in the complete groups for each step so every node is always in exactly one group.

**Rendering approach:**

- SVG viewBox `0 0 800 550`
- Uses `StepNavigator`
- **Main area:** DAG with nodes colored by their fusion group (`HEAD_COLORS[group.id % 8]`). Nodes in the same group have the same background color + a dashed border connecting them.
- **Current edge being evaluated:** highlighted with thick line + pulsing animation.
- **Decision badge:** ✅ Fuse (green) or ❌ Skip (red) appears next to the edge.
- **Reason text:** shown below the graph for each step.
- **Final step:** groups are visually enclosed in rounded-rect "kernel boundaries" with labels (Kernel 1, 2, 3).

- [ ] **Step 4: Verify all 3 components render**

Run: `npm run dev`. Verify:
- FusionTaxonomy: all 5 fusion types clickable, before/after graphs animate
- FusionLegalityChecker: node selection works, legality checks display correctly
- FusionAlgorithmStepper: step-through works, groups color correctly

### Step Group B: Article 8 MDX (zh + en)

- [ ] **Step 5: Write Article 8 Chinese version**

Create `src/content/articles/zh/operator-fusion-taxonomy.mdx`.

**Frontmatter:**

```yaml
---
title: "算子融合（上）：融合类型学与判定算法"
slug: operator-fusion-taxonomy
locale: zh
tags: [compiler, fusion, operator-fusion, kernel-fusion, optimization]
prerequisites: [graph-passes-foundations]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"
    url: "https://arxiv.org/abs/2205.14135"
  - type: paper
    title: "PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation and Graph Compilation"
    url: "https://dl.acm.org/doi/10.1145/3620665.3640366"
  - type: website
    title: "TorchInductor: a PyTorch-native Compiler"
    url: "https://dev-discuss.pytorch.org/t/torchinductor-a-pytorch-native-compiler-with-define-by-run-ir-and-target-aware-code-generation/747"
  - type: paper
    title: "XLA: Optimizing Compiler for Machine Learning"
    url: "https://www.tensorflow.org/xla"
  - type: website
    title: "Roofline Model"
    url: "https://docs.nersc.gov/tools/performance/roofline/"
---
```

**Content structure:**

1. `<CompilerStackMap mode="compact" currentArticle="operator-fusion-taxonomy" client:visible />`
2. `## 简介` — Operator fusion is the single most impactful optimization in ML compilers. Link to memory bandwidth discussion from Art.1. This article provides a systematic taxonomy.
3. `## 为什么融合是最重要的优化`
   - Quantitative analysis: memory bandwidth bottleneck revisited (A100: 312 TFLOPS but only 2 TB/s).
   - Roofline model perspective: fusion transforms memory-bound ops into compute-bound.
   - Concrete example: 3-op chain (layernorm → linear → gelu) eager vs fused memory access.
4. `## 融合类型学（系统分类）`
   - Element-wise fusion — the simplest and most common
   - Reduction fusion — sum, mean, max with surrounding ops
   - Broadcast fusion — the pattern behind LayerNorm, RMSNorm, BatchNorm fusion
   - Transpose/Reshape fusion — eliminating data movement
   - Complex pattern fusion (FlashAttention, FusedMHA) — algorithmic rewrites
   - `<FusionTaxonomy client:visible />`
5. `## 融合合法性分析`
   - Producer-consumer relationship requirement
   - Cycle detection: why fusing two nodes that share a common dependency can create cycles
   - Shape compatibility: element-wise requires matching shapes, reduction changes shapes
   - Side effect handling: random ops, print, assertions
   - Memory constraints: fused kernel must fit in shared memory + registers
   - `<FusionLegalityChecker client:visible />`
6. `## 融合判定算法`
   - Greedy algorithm: TorchInductor's approach. Scan edges in topological order, greedily merge compatible groups.
   - Graph coloring: alternative formulation where same-color nodes form one kernel.
   - **TorchInductor fusion 详解**: pointwise fusion, reduction fusion, matmul epilogue fusion. Priority ordering.
   - **XLA HLO fusion 对比**: producer-consumer fusion, sibling fusion, multi-output fusion. Different heuristics from Inductor.
   - `<FusionAlgorithmStepper client:visible />`
7. `## 总结` — Fusion is critical but has limits. Not everything should be fused. Preview: Art.9 (cost model — when NOT to fuse).
8. `## 延伸阅读`

- [ ] **Step 6: Write Article 8 English version**

Create `src/content/articles/en/operator-fusion-taxonomy.mdx`. Same structure, `locale: en`.

- [ ] **Step 7: Verify article renders**

Run: `npm run dev`, check both versions. Run: `npm run validate`.

- [ ] **Step 8: Commit**

```bash
git add src/components/interactive/FusionTaxonomy.tsx \
        src/components/interactive/FusionLegalityChecker.tsx \
        src/components/interactive/FusionAlgorithmStepper.tsx \
        src/content/articles/zh/operator-fusion-taxonomy.mdx \
        src/content/articles/en/operator-fusion-taxonomy.mdx
git commit -m "feat(graph-compilation): add Article 8 — operator fusion taxonomy with FusionTaxonomy, FusionLegalityChecker, FusionAlgorithmStepper"
```

---

## Task 5: Article 9 — Cost Model & 融合实战 (operator-fusion-cost-model)

This article covers why "fuse everything" is wrong, how cost models work, FlashAttention deep dive, and practical fusion benchmarks. Dual main-line. Three interactive components. **Depends on Task 4 (Art.8)** — references fusion taxonomy concepts.

**Files:**
- Create: `src/components/interactive/CostModelCalculator.tsx`
- Create: `src/components/interactive/FlashAttentionDeepDive.tsx`
- Create: `src/components/interactive/FusionBenchmarkChart.tsx`
- Create: `src/content/articles/zh/operator-fusion-cost-model.mdx`
- Create: `src/content/articles/en/operator-fusion-cost-model.mdx`

### Step Group A: Components

- [ ] **Step 1: Implement CostModelCalculator**

Interactive cost model where users can adjust hardware parameters and see the impact on fusion decisions.

**Data model:**

```tsx
interface HardwareConfig {
  sharedMemoryKB: number;       // typical: 96 KB (V100), 164 KB (A100), 228 KB (H100)
  registersPerSM: number;       // typical: 65536 (all recent GPUs)
  maxWarpsPerSM: number;        // typical: 64 (all recent GPUs)
  hbmBandwidthTBs: number;     // TB/s: 0.9 (V100), 2.0 (A100), 3.35 (H100)
  computeTFLOPS: number;        // FP16 TFLOPS: 125 (V100), 312 (A100), 990 (H100)
}

interface KernelConfig {
  name: { zh: string; en: string };
  flops: number;                 // total FLOPs (in millions)
  hbmReads: number;             // MB
  hbmWrites: number;            // MB
  registersPerThread: number;   // registers needed per thread
  sharedMemoryKB: number;       // shared memory needed per block
  blockSize: number;            // threads per block
}

// Preset hardware configs
const HW_PRESETS: { [key: string]: HardwareConfig } = {
  V100: { sharedMemoryKB: 96, registersPerSM: 65536, maxWarpsPerSM: 64, hbmBandwidthTBs: 0.9, computeTFLOPS: 125 },
  A100: { sharedMemoryKB: 164, registersPerSM: 65536, maxWarpsPerSM: 64, hbmBandwidthTBs: 2.0, computeTFLOPS: 312 },
  H100: { sharedMemoryKB: 228, registersPerSM: 65536, maxWarpsPerSM: 64, hbmBandwidthTBs: 3.35, computeTFLOPS: 990 },
};

// Two scenarios to compare: unfused (2 separate kernels) vs fused (1 kernel)
interface FusionScenario {
  id: string;
  name: { zh: string; en: string };
  unfused: KernelConfig[];
  fused: KernelConfig;
  description: { zh: string; en: string };
}

const SCENARIOS: FusionScenario[] = [
  {
    id: 'beneficial',
    name: { zh: 'GELU + Dropout（融合有利）', en: 'GELU + Dropout (Fusion Beneficial)' },
    unfused: [
      { name: { zh: 'GELU', en: 'GELU' }, flops: 2, hbmReads: 4, hbmWrites: 4, registersPerThread: 16, sharedMemoryKB: 0, blockSize: 256 },
      { name: { zh: 'Dropout', en: 'Dropout' }, flops: 1, hbmReads: 4, hbmWrites: 4, registersPerThread: 12, sharedMemoryKB: 0, blockSize: 256 },
    ],
    fused: { name: { zh: 'GELU+Dropout', en: 'GELU+Dropout' }, flops: 3, hbmReads: 4, hbmWrites: 4, registersPerThread: 24, sharedMemoryKB: 0, blockSize: 256 },
    description: {
      zh: '两个 memory-bound pointwise op。融合后消除中间 tensor 的 HBM 读写（4+4=8 MB），FLOPs 不变。总是值得融合。',
      en: 'Two memory-bound pointwise ops. Fusion eliminates intermediate tensor HBM read+write (8 MB). FLOPs unchanged. Always beneficial.',
    },
  },
  {
    id: 'harmful',
    name: { zh: '大 Reduction + 小 Pointwise（融合有害）', en: 'Large Reduction + Small Pointwise (Fusion Harmful)' },
    unfused: [
      { name: { zh: 'LayerNorm', en: 'LayerNorm' }, flops: 10, hbmReads: 4, hbmWrites: 4, registersPerThread: 32, sharedMemoryKB: 8, blockSize: 256 },
      { name: { zh: 'Scale', en: 'Scale' }, flops: 0.5, hbmReads: 4, hbmWrites: 4, registersPerThread: 8, sharedMemoryKB: 0, blockSize: 256 },
    ],
    fused: { name: { zh: 'LayerNorm+Scale', en: 'LayerNorm+Scale' }, flops: 10.5, hbmReads: 4, hbmWrites: 4, registersPerThread: 40, sharedMemoryKB: 8, blockSize: 256 },
    description: {
      zh: '融合后 register pressure 增加（32+8→40），可能导致 occupancy 下降。LayerNorm 需要 shared memory 做 cross-thread reduction，而 Scale 不需要——融合后整个 kernel 都被 shared memory 约束了。在某些 GPU 上融合反而更慢（occupancy 从 4 blocks/SM 降到 3）。',
      en: 'Fusion increases register pressure (32+8→40), potentially reducing occupancy. LayerNorm needs shared memory for cross-thread reduction; Scale doesn\'t — fusion constrains the entire kernel by shared memory. On some GPUs, fusion is actually slower (occupancy drops from 4 to 3 blocks/SM).',
    },
  },
  {
    id: 'tradeoff',
    name: { zh: 'MatMul + BiasAdd + ReLU（权衡）', en: 'MatMul + BiasAdd + ReLU (Tradeoff)' },
    unfused: [
      { name: { zh: 'MatMul', en: 'MatMul' }, flops: 200, hbmReads: 20, hbmWrites: 4, registersPerThread: 40, sharedMemoryKB: 32, blockSize: 128 },
      { name: { zh: 'BiasAdd', en: 'BiasAdd' }, flops: 0.5, hbmReads: 4, hbmWrites: 4, registersPerThread: 8, sharedMemoryKB: 0, blockSize: 256 },
      { name: { zh: 'ReLU', en: 'ReLU' }, flops: 0.5, hbmReads: 4, hbmWrites: 4, registersPerThread: 8, sharedMemoryKB: 0, blockSize: 256 },
    ],
    fused: { name: { zh: 'MatMul+BiasAdd+ReLU', en: 'MatMul+BiasAdd+ReLU' }, flops: 201, hbmReads: 20, hbmWrites: 4, registersPerThread: 48, sharedMemoryKB: 32, blockSize: 128 },
    description: {
      zh: 'BiasAdd 和 ReLU 作为 MatMul 的 epilogue fusion——在 GEMM tile 写回 HBM 之前做 bias+relu。这是最有价值的融合之一：消除 8+8=16 MB 中间读写，register 增加可控（cuBLAS 已为 epilogue 预留了 register 空间）。',
      en: 'BiasAdd + ReLU as MatMul epilogue — compute bias+relu before GEMM tile writes to HBM. One of the most valuable fusions: eliminates 16 MB intermediate access, register increase manageable (cuBLAS reserves register space for epilogues).',
    },
  },
];

// Cost model calculations:
// executionTime = max(computeTime, memoryTime)  (roofline model)
// computeTime = totalFLOPs / computeThroughput
// memoryTime = totalHBMBytes / hbmBandwidth
// occupancy = min(maxWarps, registersPerSM / (registersPerThread * blockSize/32), sharedMem / sharedMemPerBlock)
// actualThroughput = baseThroughput * (occupancy / maxOccupancy)
```

**Rendering approach:**

- SVG viewBox `0 0 800 600`
- **Top row:** Hardware preset selector (V100 / A100 / H100 buttons) + optional sliders to tweak individual params (bandwidth, shared memory)
- **Scenario selector:** Tab bar for 3 scenarios
- **Main area:** Split view:
  - Left: "Unfused" — vertical stack of kernel cards, each showing: name, FLOPs, HBM access, registers, estimated time (computed from cost model)
  - Right: "Fused" — single kernel card with same metrics
  - Middle: comparison arrows showing differences (green = improvement, red = regression)
- **Bottom panel:** Key metrics comparison:
  - Execution time bar (fused vs sum of unfused)
  - Occupancy percentage (fused vs individual kernels)
  - HBM access total
  - Verdict: "✅ Fusion beneficial: X% faster" or "❌ Fusion harmful: Y% slower" or "⚠️ Tradeoff: Z% faster but W% less occupancy"
- Numbers update when hardware config changes.

- [ ] **Step 2: Implement FlashAttentionDeepDive**

The signature component: animated comparison of standard attention vs FlashAttention memory access patterns.

**Data model:**

```tsx
interface AttentionConfig {
  seqLen: number;     // N: sequence length (slider: 512, 1024, 2048, 4096, 8192)
  headDim: number;    // d: head dimension (fixed at 64 or 128)
  sramSizeKB: number; // M: SRAM/shared memory size (slider: 48-228 KB)
}

// Standard attention memory flow:
// Step 1: Load Q [N×d] from HBM (N×d×2 bytes for FP16)
// Step 2: Load K [N×d] from HBM
// Step 3: Compute S = Q × Kᵀ → S [N×N] in HBM (huge! N²×2 bytes)
// Step 4: Load S [N×N] for softmax
// Step 5: Write softmax(S) [N×N] back to HBM
// Step 6: Load softmax(S) + V, compute output
// Total HBM access: O(N² + Nd)

// FlashAttention memory flow:
// Tile Q into blocks of size Br × d (Br = M / (4d))
// Tile K, V into blocks of size Bc × d (Bc = M / (4d))
// For each Q tile:
//   For each K, V tile:
//     Load Q_tile, K_tile, V_tile from HBM to SRAM
//     Compute local S_tile = Q_tile × K_tile^T in SRAM (Br × Bc, fits in SRAM!)
//     Compute local softmax with online rescaling
//     Update output accumulator in SRAM
//   Write output tile back to HBM
// Total HBM access: O(N²d² / M) — much less!

// For visualization, we'll show a simplified N×N grid where:
// Standard: entire grid is written to HBM (red), then read back (red)
// Flash: only tile-sized blocks ever exist in memory at once (green SRAM blocks, no full N×N)

const DEFAULT_CONFIG: AttentionConfig = {
  seqLen: 2048,
  headDim: 64,
  sramSizeKB: 164,  // A100
};

// Computed values:
// standardHBMAccess(N, d) = 2 * (N*d + N*d + N*N + N*N + N*d) * 2  // FP16 bytes
// flashHBMAccess(N, d, M) = O(N^2 * d^2 / M) * 2  // approximate
// tileSize = floor(M / (4 * d * 2))  // number of rows per tile
```

**Rendering approach:**

- SVG viewBox `0 0 800 600`
- **Top controls:** Sequence length slider (512–8192), SRAM size slider (48–228 KB)
- **Main area - two panels:**
  - Left (0–380): "Standard Attention"
    - Show N×N score matrix as a grid. All cells are red (in HBM).
    - Below: memory access timeline showing Read Q → Read K → Write S → Read S → Write softmax(S) → Read V → Write output.
    - Total HBM access in MB (computed from config).
  - Right (420–800): "FlashAttention"
    - Show N×N grid but only a small tile (Br × Bc) is highlighted in green (in SRAM) at any time. Rest of grid is empty/gray.
    - Animated: the green tile sweeps across the grid (row by row, column by column within each row), showing the tiling pattern.
    - Below: memory access showing only tile loads/stores.
    - Total HBM access in MB (much smaller).
- **Bottom:** Comparison bar chart: Standard vs Flash HBM access (in MB). Speedup badge.
- As user changes sequence length, the N×N grid resizes (use representative size, not actual pixels), and the numbers update. Longer sequences → more dramatic savings.

- [ ] **Step 3: Implement FusionBenchmarkChart**

Performance comparison chart showing different fusion strategies on typical Transformer configurations.

**Data model:**

```tsx
interface BenchmarkConfig {
  name: string;                    // e.g. "GPT-2 Small", "LLaMA 7B"
  seqLen: number;
  hiddenDim: number;
  numHeads: number;
  batchSize: number;
}

interface BenchmarkResult {
  config: string;                  // BenchmarkConfig.name
  strategy: string;                // fusion strategy name
  throughputTFLOPS: number;        // effective TFLOPS
  latencyMs: number;               // per-layer latency in ms
  peakMemoryMB: number;           // peak GPU memory in MB
  hbmAccessGB: number;            // total HBM access per layer
}

const CONFIGS: BenchmarkConfig[] = [
  { name: 'GPT-2 Small', seqLen: 1024, hiddenDim: 768, numHeads: 12, batchSize: 16 },
  { name: 'LLaMA 7B', seqLen: 2048, hiddenDim: 4096, numHeads: 32, batchSize: 1 },
  { name: 'LLaMA 70B', seqLen: 4096, hiddenDim: 8192, numHeads: 64, batchSize: 1 },
];

// Strategies: no fusion, elementwise-only, full Inductor, full + FlashAttention
// Note: these are illustrative/approximate numbers for educational purposes, not real benchmarks.
// The article text should clearly state these are approximate.
const RESULTS: BenchmarkResult[] = [
  // GPT-2 Small
  { config: 'GPT-2 Small', strategy: 'No Fusion', throughputTFLOPS: 15, latencyMs: 8.5, peakMemoryMB: 320, hbmAccessGB: 0.8 },
  { config: 'GPT-2 Small', strategy: 'Element-wise Only', throughputTFLOPS: 28, latencyMs: 4.5, peakMemoryMB: 280, hbmAccessGB: 0.5 },
  { config: 'GPT-2 Small', strategy: 'Full Inductor', throughputTFLOPS: 42, latencyMs: 3.0, peakMemoryMB: 240, hbmAccessGB: 0.35 },
  { config: 'GPT-2 Small', strategy: 'Inductor + FlashAttn', throughputTFLOPS: 55, latencyMs: 2.3, peakMemoryMB: 200, hbmAccessGB: 0.25 },

  // LLaMA 7B
  { config: 'LLaMA 7B', strategy: 'No Fusion', throughputTFLOPS: 45, latencyMs: 42, peakMemoryMB: 4800, hbmAccessGB: 6.2 },
  { config: 'LLaMA 7B', strategy: 'Element-wise Only', throughputTFLOPS: 85, latencyMs: 22, peakMemoryMB: 3800, hbmAccessGB: 3.8 },
  { config: 'LLaMA 7B', strategy: 'Full Inductor', throughputTFLOPS: 130, latencyMs: 14.5, peakMemoryMB: 3200, hbmAccessGB: 2.5 },
  { config: 'LLaMA 7B', strategy: 'Inductor + FlashAttn', throughputTFLOPS: 175, latencyMs: 10.8, peakMemoryMB: 2400, hbmAccessGB: 1.8 },

  // LLaMA 70B
  { config: 'LLaMA 70B', strategy: 'No Fusion', throughputTFLOPS: 80, latencyMs: 180, peakMemoryMB: 38000, hbmAccessGB: 48 },
  { config: 'LLaMA 70B', strategy: 'Element-wise Only', throughputTFLOPS: 150, latencyMs: 96, peakMemoryMB: 30000, hbmAccessGB: 28 },
  { config: 'LLaMA 70B', strategy: 'Full Inductor', throughputTFLOPS: 220, latencyMs: 65, peakMemoryMB: 26000, hbmAccessGB: 18 },
  { config: 'LLaMA 70B', strategy: 'Inductor + FlashAttn', throughputTFLOPS: 310, latencyMs: 46, peakMemoryMB: 20000, hbmAccessGB: 12 },
];

// Strategy colors
const STRATEGY_COLORS: { [key: string]: string } = {
  'No Fusion': COLORS.mid,
  'Element-wise Only': COLORS.orange,
  'Full Inductor': COLORS.primary,
  'Inductor + FlashAttn': COLORS.green,
};
```

**Rendering approach:**

- SVG viewBox `0 0 800 500`
- **Top:** Config selector tabs (GPT-2 Small / LLaMA 7B / LLaMA 70B)
- **Main area:** 4-metric grouped bar chart:
  - X-axis: 4 metrics (Throughput, Latency, Peak Memory, HBM Access)
  - For each metric: 4 bars side-by-side (one per strategy), colored by strategy
  - Y-axis: metric value with unit label
  - Bars animate in from height=0 when switching configs
- **Legend:** Below chart, showing 4 strategies with color dots
- **Key insight callout:** A text box highlighting the most interesting finding for each config. E.g., for LLaMA 70B: "FlashAttention alone accounts for 40% of the speedup from No Fusion to full optimization."
- **Note:** Display a small disclaimer: "数据为教学用估算值 / Approximate values for educational purposes"

- [ ] **Step 4: Verify all 3 components render**

Run: `npm run dev`. Verify:
- CostModelCalculator: hardware presets switch, numbers update, fused vs unfused comparison visible
- FlashAttentionDeepDive: tile animation plays, sliders change metrics, N×N grid scales
- FusionBenchmarkChart: config tabs switch, bars animate, all 4 metrics display

### Step Group B: Article 9 MDX (zh + en)

- [ ] **Step 5: Write Article 9 Chinese version**

Create `src/content/articles/zh/operator-fusion-cost-model.mdx`.

**Frontmatter:**

```yaml
---
title: "算子融合（下）：Cost Model 与融合实战"
slug: operator-fusion-cost-model
locale: zh
tags: [compiler, fusion, cost-model, flash-attention, inductor, optimization]
prerequisites: [operator-fusion-taxonomy]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"
    url: "https://arxiv.org/abs/2205.14135"
  - type: paper
    title: "FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning"
    url: "https://arxiv.org/abs/2307.08691"
  - type: paper
    title: "FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision"
    url: "https://arxiv.org/abs/2407.08608"
  - type: paper
    title: "PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation and Graph Compilation"
    url: "https://dl.acm.org/doi/10.1145/3620665.3640366"
  - type: website
    title: "Roofline Model"
    url: "https://docs.nersc.gov/tools/performance/roofline/"
  - type: website
    title: "MLIR Linalg Dialect — Fusion"
    url: "https://mlir.llvm.org/docs/Dialects/Linalg/"
---
```

**Content structure:**

1. `<CompilerStackMap mode="compact" currentArticle="operator-fusion-cost-model" client:visible />`
2. `## 简介` — Art.8 covered WHAT fusion types exist and WHEN fusion is legal. This article covers WHETHER fusion is beneficial (cost model) and HOW to implement it in practice.
3. `## Cost Model 设计` — Why not "fuse everything that's legal"?
   - **Register pressure**: fused kernel needs more registers → fewer warps per SM → lower occupancy → lower throughput. Quantitative example.
   - **Compilation time**: larger kernels take longer to compile (Triton compilation is O(n²) in kernel size). This matters for JIT compilation.
   - **Code size**: fused kernel has more instructions → instruction cache pressure.
   - **Occupancy**: the key metric. Define occupancy = active warps / max warps per SM. Show how register usage affects occupancy.
   - Hardware constraints: shared memory limits, register file limits, max threads per block.
   - `<CostModelCalculator client:visible />`
4. `## TorchInductor 的 Cost Model 实战`
   - Inductor's cost model is heuristic-based (not analytical). Key heuristics:
     - Pointwise ops: always fuse (almost always beneficial)
     - Reduction + pointwise: fuse if reduction is small enough
     - MatMul + epilogue: fuse via CUTLASS/Triton epilogue mechanism
     - When fusion harms: case study of LayerNorm + large epilogue
   - `torch._inductor.config.max_fusion_size` control
   - Real-world debugging: `TORCHINDUCTOR_TRACE=1` to see fusion decisions
5. `## MLIR 级别的 Fusion`
   - Linalg fusion on tensors: producer-consumer fusion using `linalg.fuse_into_containing_op`
   - Tile and fuse: the key MLIR strategy. First tile the consumer, then fuse producer into the tile. This ensures the fused working set fits in target memory level.
   - Affine fusion: polyhedral-based loop fusion for perfect affine nests
   - Comparison: MLIR's approach is more principled (tile-and-fuse with memory model) vs Inductor's pragmatic heuristics
6. `## FlashAttention 深度剖析`
   - **Standard attention 的内存瓶颈**: $S = QK^T$ produces N×N matrix. For N=4096, d=64, FP16: S is 32 MB. Must write to HBM, read back for softmax, write again. Total: ~128 MB HBM access for score matrix alone.
   - **FlashAttention 的核心思路**: tile Q, K, V so that each tile's score sub-matrix fits in SRAM. But softmax is global (needs max over entire row) → **online softmax** trick: track running max and running sum, rescale incrementally.
   - **I/O complexity analysis**: Standard = $\Theta(Nd + N^2)$. FlashAttention = $O(N^2 d^2 / M)$ where M = SRAM size. When $M = \Theta(Nd)$, this simplifies to $O(Nd)$ — linear in N!
   - **FlashAttention 2 improvements**: Reduce non-matmul FLOPs (move rescaling out of inner loop), better warp partitioning (split across N dimension not d dimension).
   - **FlashAttention 3 improvements**: Exploit Hopper's async features (warp-specialized pipeline, FP8 support).
   - Why this is NOT op fusion: it's an algorithmic rewrite. No generic fusion framework would discover online softmax. It requires domain knowledge about attention semantics.
   - `<FlashAttentionDeepDive client:visible />`
7. `## 融合效果实战对比`
   - Show benchmark data across different model sizes and fusion strategies
   - Analysis: where does each fusion level contribute most?
   - `<FusionBenchmarkChart client:visible />`
8. `## 总结` — Cost model is essential. Fusion is not free. The best ML compilers combine heuristic fusion (Inductor), principled tile-and-fuse (MLIR), and algorithmic rewrites (FlashAttention). Preview: Phase 2 complete, next articles cover tiling/memory hierarchy (Art.10) and dynamic shapes (Art.11).
9. `## 延伸阅读`

**Writing requirements:**
- FlashAttention section should be the most detailed — it's the signature topic of this article
- I/O complexity math should use proper $...$ notation
- All benchmark numbers should be clearly labeled as approximate/educational
- Verify all arxiv URLs are correct for FlashAttention 1/2/3 papers

- [ ] **Step 6: Write Article 9 English version**

Create `src/content/articles/en/operator-fusion-cost-model.mdx`. Same structure, `locale: en`.

- [ ] **Step 7: Verify article renders**

Run: `npm run dev`, check both versions. Run: `npm run validate`.

- [ ] **Step 8: Commit**

```bash
git add src/components/interactive/CostModelCalculator.tsx \
        src/components/interactive/FlashAttentionDeepDive.tsx \
        src/components/interactive/FusionBenchmarkChart.tsx \
        src/content/articles/zh/operator-fusion-cost-model.mdx \
        src/content/articles/en/operator-fusion-cost-model.mdx
git commit -m "feat(graph-compilation): add Article 9 — cost model and fusion practice with CostModelCalculator, FlashAttentionDeepDive, FusionBenchmarkChart"
```

---

## Task 6: Full Build Validation

After all 5 articles are implemented, validate the entire site builds correctly.

**Dependencies:** Tasks 1–5 all complete.

- [ ] **Step 1: Run content validation**

```bash
npm run validate
```

Expected: All validation passes. The 13 slugs from Phase 3+4 (Art.10-17) will still show as warnings (articles not yet created) — that's expected.

- [ ] **Step 2: Run full build**

```bash
npm run build
```

Expected: Build succeeds with ~670+ pages (660 existing + ~10 new article pages). No errors.

- [ ] **Step 3: Visual verification**

Run: `npm run dev`

Navigate to each new article page and verify:
1. `/zh/articles/graph-passes-foundations` — 4 components render, CompilerStackMap highlights correct layer
2. `/zh/articles/graph-passes-advanced` — 3 components render
3. `/zh/articles/graph-passes-polyhedral` — 3 components render
4. `/zh/articles/operator-fusion-taxonomy` — 3 components render
5. `/zh/articles/operator-fusion-cost-model` — 3 components render
6. English versions of all 5 articles — components get `locale="en"` and display English text
7. Learning path page shows all 9 articles (4 from Phase 1 + 5 from Phase 2)
8. CompilerStackMap compact mode correctly highlights each article's layer
9. Prerequisites chain renders correctly (Art.5 → Art.6, Art.5 → Art.7, Art.5 → Art.8, Art.8 → Art.9)

- [ ] **Step 4: Cross-article link verification**

Verify that cross-references work:
- Art.5 links to Art.3 (IR design) and Art.4 (progressive lowering) in its intro
- Art.6 links to Art.2 (TorchDynamo guards) in shape specialization section
- Art.7 links to Art.4 (MLIR dialects) in Affine dialect section
- Art.8 links to Art.1 (roofline model discussion) in its intro
- Art.9 links to Art.8 (fusion taxonomy) throughout
