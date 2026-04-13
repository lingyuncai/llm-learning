# Graph Compilation & Optimization — Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Articles 10-13 of the graph-compilation-optimization learning path — covering Tiling & Memory Hierarchy, Dynamic Shapes, Code Generation (Instruction Selection), and Triton Backend with ~14 interactive components and 8 MDX articles (zh + en).

**Architecture:** Each article gets 3-4 interactive React+SVG components following established Phase 1-2 patterns (locale prop, shared COLORS/FONTS, motion animations). Articles are bilingual MDX with CompilerStackMap navigation. Articles 10-11 are "vertical thematic" articles tracing concepts across compiler layers; Articles 12-13 are "horizontal stage" articles covering the codegen pipeline.

**Tech Stack:** Astro 5, MDX, React, TypeScript, Motion (`motion/react`), SVG, KaTeX

**Design Spec:** `docs/superpowers/specs/2026-04-08-graph-compilation-optimization-design.md`

**Phase 2 Plan (for reference):** `docs/superpowers/plans/2026-04-13-graph-compilation-phase2.md`

---

## Component Pattern Reference

All interactive components follow these conventions (established in Phase 1-2):

```tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

export default function ComponentName({ locale = 'zh' }: Props) {
  const t = {
    zh: { /* Chinese strings */ },
    en: { /* English strings */ },
  }[locale]!;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        {/* SVG content with absolute positioning */}
      </svg>
    </div>
  );
}
```

**Key rules:**
- Props: `{ locale?: 'zh' | 'en' }` defaulting to `'zh'`
- Colors: `COLORS.*` and `HEAD_COLORS[i]` from shared module, never hardcode
- Animation: `motion/react` (NOT `framer-motion`)
- Multi-step flows: `import StepNavigator from '../primitives/StepNavigator'`
- i18n: inline `{ zh: {...}, en: {...} }[locale]!` pattern
- SVG: `<svg viewBox="0 0 W H" className="w-full">` wrapped in `<div className="my-6">`

## MDX Article Pattern Reference

```mdx
---
title: "Article Title"
slug: article-slug
locale: zh
tags: [compiler, ...]
prerequisites: [prerequisite-slug]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "Paper Title"
    url: "https://..."
---

import CompilerStackMap from '../../../components/interactive/CompilerStackMap.tsx';
import Component from '../../../components/interactive/Component.tsx';

<CompilerStackMap mode="compact" currentArticle="article-slug" client:visible />

## Content sections...

<Component client:visible />
```

**Key rules:**
- zh version: no locale prop on components; en version: add `locale="en"`
- Every interactive component gets `client:visible`
- CompilerStackMap always first, with `mode="compact"` and `currentArticle="slug"`
- References must be real, verified URLs

## File Structure

### Components to Create (14 total)

```
src/components/interactive/
├── TilingHierarchyExplorer.tsx      # Art.10 — multi-level tiling visualization
├── MemoryHierarchyFlow.tsx          # Art.10 — HBM → SMEM → Register data flow
├── TileSizeCalculator.tsx           # Art.10 — interactive tile size constraint calculator
├── BankConflictVisualizer.tsx       # Art.10 — shared memory bank conflict demo
├── DynamicShapeImpactTracer.tsx     # Art.11 — static vs dynamic shape comparison per stage
├── GuardRecompilationDemo.tsx       # Art.11 — guard check hit/miss animation
├── BucketingStrategyCompare.tsx     # Art.11 — bucketing strategy comparison
├── InstructionSelectionDemo.tsx     # Art.12 — IR op → GPU instruction mapping
├── RegisterPressureVisualizer.tsx   # Art.12 — register pressure vs occupancy
├── VectorizationDemo.tsx            # Art.12 — scalar → vector transformation
├── TritonCompilationPipeline.tsx    # Art.13 — Triton compile pipeline animation
├── CodegenExplorer.tsx              # Art.13 — FX Graph → Triton kernel demo
├── BackendComparison.tsx            # Art.13 — compiler backend comparison table
└── NumericalAccuracyDemo.tsx        # Art.13 — numerical precision under optimization
```

### Articles to Create (8 total)

```
src/content/articles/
├── zh/
│   ├── tiling-memory-hierarchy.mdx        # Art.10 zh
│   ├── dynamic-shapes-challenge.mdx       # Art.11 zh
│   ├── codegen-instruction-selection.mdx  # Art.12 zh
│   └── codegen-triton-backend.mdx         # Art.13 zh
└── en/
    ├── tiling-memory-hierarchy.mdx        # Art.10 en
    ├── dynamic-shapes-challenge.mdx       # Art.11 en
    ├── codegen-instruction-selection.mdx  # Art.12 en
    └── codegen-triton-backend.mdx         # Art.13 en
```

## Dependency Graph

```
Task 1 (Art.10: Tiling & Memory Hierarchy)
    │
    ├─→ Task 2 (Art.11: Dynamic Shapes) — references tiling concepts from Art.10
    │
    └─→ Task 3 (Art.12: Codegen — Instruction Selection) — references tiling/register concepts
              │
              └─→ Task 4 (Art.13: Codegen — Triton Backend) — builds on Art.12 codegen pipeline
```

Tasks must be executed sequentially due to cross-article references.

---

## Task 1: Article 10 — Tiling 策略与内存层次优化 (tiling-memory-hierarchy)

Trace the complete story of tiling and memory hierarchy optimization from high-level IR to hardware execution. This is a vertical thematic article spanning multiple compilation stages. 4 interactive components + bilingual MDX.

**Files:**
- Create: `src/components/interactive/TilingHierarchyExplorer.tsx`
- Create: `src/components/interactive/MemoryHierarchyFlow.tsx`
- Create: `src/components/interactive/TileSizeCalculator.tsx`
- Create: `src/components/interactive/BankConflictVisualizer.tsx`
- Create: `src/content/articles/zh/tiling-memory-hierarchy.mdx`
- Create: `src/content/articles/en/tiling-memory-hierarchy.mdx`

### Step 1: Implement TilingHierarchyExplorer

Interactive visualization showing the same matmul computation at different tiling levels — from naive single-tile to multi-level tiling with register blocking.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
type TilingLevel = 'naive' | 'thread_block' | 'warp' | 'register';

interface TileConfig {
  level: TilingLevel;
  M: number;      // output tile rows
  N: number;      // output tile cols
  K: number;      // reduction dimension tile
  description: { zh: string; en: string };
  memoryLevel: string;  // 'HBM' | 'Shared Memory' | 'Register'
  color: string;
}

const TILING_LEVELS: TileConfig[] = [
  {
    level: 'naive',
    M: 4096, N: 4096, K: 4096,
    description: {
      zh: 'Naive：整个矩阵在 HBM 中计算，无 tiling',
      en: 'Naive: entire matrix computed in HBM, no tiling',
    },
    memoryLevel: 'HBM',
    color: COLORS.red,
  },
  {
    level: 'thread_block',
    M: 128, N: 128, K: 32,
    description: {
      zh: 'Thread Block Tile：128×128 输出块，K=32 步进，数据暂存 Shared Memory',
      en: 'Thread Block Tile: 128×128 output block, K=32 step, staged in Shared Memory',
    },
    memoryLevel: 'Shared Memory',
    color: COLORS.orange,
  },
  {
    level: 'warp',
    M: 64, N: 64, K: 32,
    description: {
      zh: 'Warp Tile：每个 warp 负责 64×64 子块，从 Shared Memory 读取',
      en: 'Warp Tile: each warp handles 64×64 sub-block, reads from Shared Memory',
    },
    memoryLevel: 'Shared Memory → Register',
    color: COLORS.primary,
  },
  {
    level: 'register',
    M: 16, N: 16, K: 16,
    description: {
      zh: 'Register Tile：16×16×16 MMA 指令，Tensor Core 直接在 Register File 中计算',
      en: 'Register Tile: 16×16×16 MMA instruction, Tensor Core computes directly in Register File',
    },
    memoryLevel: 'Register File',
    color: COLORS.green,
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 520`
- Top: title + 4-button level selector (one per TilingLevel), active button uses level's color
- Left panel (x=20..380): **Matrix view** — draw a large square representing the M×N output matrix. As tiling level changes, animate subdivision grid lines appearing:
  - `naive`: solid color, no grid
  - `thread_block`: 32×32 grid of 128×128 tiles (show ~8×8 subset for visual clarity)
  - `warp`: zoom into one thread_block tile, show 2×2 grid of warp tiles
  - `register`: zoom into one warp tile, show 4×4 grid of register/MMA tiles
- Use `<motion.rect>` for animated tile appearance with `initial={{ opacity: 0, scale: 0.8 }}` → `animate={{ opacity: 1, scale: 1 }}`
- Highlight one tile in each level with the level's color at 0.8 opacity, others at 0.2
- Right panel (x=420..780): **Info card** showing:
  - Tile dimensions: `M×N×K = ...`
  - Memory level: which memory tier data resides in
  - Description text
  - Bandwidth indicator: horizontal bar showing relative memory bandwidth (HBM < L2 < SMEM < Reg)
  - Bandwidth numbers: HBM ~2 TB/s, SMEM ~19 TB/s (A100), Register ~infinite (on-chip)
- Bottom: arrow diagram showing the nesting: `Thread Block → Warp → MMA` with tile sizes annotated

**Key implementation details:**
- Use `AnimatePresence mode="wait"` for smooth transitions between levels
- Each level's matrix subdivision is computed from the tile sizes relative to the parent level
- The bandwidth bar uses `COLORS.red` → `COLORS.orange` → `COLORS.primary` → `COLORS.green` gradient to show fast→fastest

### Step 2: Implement MemoryHierarchyFlow

Animated data flow visualization showing how a tile of data moves through the GPU memory hierarchy: HBM → L2 Cache → Shared Memory → Register File → Tensor Core ALU, with double-buffering pipeline.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
type FlowStage = 'idle' | 'load_hbm' | 'load_smem' | 'compute' | 'double_buffer' | 'store';

interface MemoryTier {
  id: string;
  label: { zh: string; en: string };
  capacity: string;     // e.g., "80 GB"
  bandwidth: string;    // e.g., "2 TB/s"
  latency: string;      // e.g., "~400 cycles"
  color: string;
  y: number;            // vertical position in SVG
}

const MEMORY_TIERS: MemoryTier[] = [
  { id: 'hbm', label: { zh: 'HBM (全局显存)', en: 'HBM (Global Memory)' },
    capacity: '80 GB', bandwidth: '2 TB/s', latency: '~400 cycles', color: COLORS.red, y: 60 },
  { id: 'l2', label: { zh: 'L2 Cache', en: 'L2 Cache' },
    capacity: '40 MB', bandwidth: '~5 TB/s', latency: '~200 cycles', color: COLORS.orange, y: 160 },
  { id: 'smem', label: { zh: 'Shared Memory (SRAM)', en: 'Shared Memory (SRAM)' },
    capacity: '~164 KB/SM', bandwidth: '~19 TB/s', latency: '~30 cycles', color: COLORS.primary, y: 260 },
  { id: 'reg', label: { zh: 'Register File', en: 'Register File' },
    capacity: '256 KB/SM', bandwidth: 'on-chip', latency: '~1 cycle', color: COLORS.green, y: 360 },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 540`
- Top: title + Play/Step/Reset control buttons
- **Left column (x=30..450):** Memory hierarchy diagram — 4 horizontal boxes stacked vertically representing HBM → L2 → SMEM → Reg, each box shows tier name + capacity + bandwidth
  - Boxes are connected by downward arrows
  - Animated data blocks (small colored rectangles) flow downward through the hierarchy when play is active
  - Each data block represents a tile; label it "Tile 0", "Tile 1", etc.
- **Right column (x=480..780):** Pipeline timeline view — shows double buffering:
  - 3 swim lanes: "Load Tile[i+1]", "Compute Tile[i]", "Store Tile[i-1]"
  - Time steps progress left-to-right
  - Colored blocks in each lane show concurrent operations
  - Demonstrates that load and compute overlap (double buffering)
- **Bottom:** Stage description text explaining what's happening at the current step
- State machine: `useState<FlowStage>` controls which animation phase is active
- Step button advances through: idle → load_hbm → load_smem → compute → double_buffer → store
- Play button auto-advances with `useEffect` + `setInterval` (1.5s per step)
- Data blocks animate with `<motion.rect>` moving `y` position between tiers
- Double buffer visualization: two tiles shown in different colors (HEAD_COLORS[0] and HEAD_COLORS[1]), overlapping in the pipeline

**Key implementation details:**
- Use `cp.async` concept: annotate the HBM→SMEM arrow with "cp.async (Ampere+)" label
- Show `__syncthreads()` barrier between load and compute as a thin horizontal dashed line
- Pipeline view should clearly show the overlap: while Tile[i] computes, Tile[i+1] loads

### Step 3: Implement TileSizeCalculator

Interactive calculator: user inputs matrix dimensions and hardware parameters, the component computes feasible tile size ranges and shows the constraint boundaries (shared memory limit, register pressure, occupancy).

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
interface HardwarePreset {
  name: string;
  smem_per_sm: number;     // bytes (e.g., 166912 for A100 ≈ 163 KB runtime-reported; NVIDIA markets as "up to 164 KB")
  regs_per_sm: number;     // 32-bit registers (65536 for A100)
  max_warps_per_sm: number; // 64 for A100
  max_threads_per_block: number; // 1024
  smem_banks: number;      // 32
}

const PRESETS: Record<string, HardwarePreset> = {
  A100: { name: 'A100', smem_per_sm: 166912, regs_per_sm: 65536, max_warps_per_sm: 64, max_threads_per_block: 1024, smem_banks: 32 },
  H100: { name: 'H100', smem_per_sm: 233472, regs_per_sm: 65536, max_warps_per_sm: 64, max_threads_per_block: 1024, smem_banks: 32 },
};

interface TileAnalysis {
  smem_usage: number;       // bytes: (BLOCK_M*BLOCK_K + BLOCK_K*BLOCK_N) * elem_size * num_stages
  regs_per_thread: number;  // estimated: (BLOCK_M*BLOCK_N) / threads_per_block + overhead
  occupancy: number;        // active_warps / max_warps (0..1)
  feasible: boolean;        // smem_usage <= smem_per_sm && regs_per_thread <= 255
  bottleneck: 'smem' | 'register' | 'occupancy' | 'none';
}
```

**Rendering approach:**

- SVG viewBox `0 0 800 500`
- Top: title + hardware preset selector (A100 / H100 dropdown tabs)
- **Left panel (x=20..380): Input controls** — SVG +/- button pairs (NOT sliders; sliders are hard to implement in SVG):
  - **Primary inputs** (always visible):
    - `BLOCK_M`: `[-]` value `[+]`, range 16..256, step 16 (default 128)
    - `BLOCK_N`: `[-]` value `[+]`, range 16..256, step 16 (default 128)
    - `BLOCK_K`: `[-]` value `[+]`, range 8..64, step 8 (default 32)
  - **Advanced inputs** (collapsed by default, toggle via "Advanced ▼" button):
    - `num_stages`: 1..5 (default 2, for double buffering)
    - `elem_size`: FP16 (2B, default) / FP32 (4B) toggle
  - Each +/- pair: `<rect>` button with `<text>` label, onClick handlers
- **Right panel (x=400..780): Analysis results** — 3 horizontal gauge bars:
  1. **Shared Memory**: bar showing `smem_usage / smem_per_sm`, colored green (<50%), orange (50-80%), red (>80%). Show "X KB / Y KB" label.
  2. **Register Pressure**: bar showing estimated `regs_per_thread / 255`, same coloring. Show "X regs / 255 max".
  3. **Occupancy**: bar showing `occupancy` 0..100%, colored inversely (high = green). Show "X warps / Y max".
- Below gauges: **Feasibility verdict** — green checkmark "Feasible" or red X with bottleneck explanation
- Bottom: **Formula display** in monospace font:
  ```
  SMEM = (BLOCK_M×BLOCK_K + BLOCK_K×BLOCK_N) × elem_size × num_stages
       = (128×32 + 32×128) × 2 × 2 = 32,768 bytes = 32 KB
  ```
  Updates live as sliders change.

**Computation logic:**

```tsx
function analyzeTile(hw: HardwarePreset, blockM: number, blockN: number, blockK: number, numStages: number, elemSize: number): TileAnalysis {
  const smem_usage = (blockM * blockK + blockK * blockN) * elemSize * numStages;
  const threads_per_block = Math.min(hw.max_threads_per_block, (blockM * blockN) / 4); // heuristic
  const warps_per_block = Math.ceil(threads_per_block / 32);
  const blocks_per_sm = Math.floor(hw.smem_per_sm / smem_usage);
  const active_warps = Math.min(blocks_per_sm * warps_per_block, hw.max_warps_per_sm);
  const occupancy = active_warps / hw.max_warps_per_sm;
  const regs_per_thread = Math.ceil((blockM * blockN / threads_per_block) + 32); // +32 overhead
  const feasible = smem_usage <= hw.smem_per_sm && regs_per_thread <= 255;
  const bottleneck = smem_usage > hw.smem_per_sm ? 'smem' : regs_per_thread > 255 ? 'register' : occupancy < 0.25 ? 'occupancy' : 'none';
  return { smem_usage, regs_per_thread, occupancy, feasible, bottleneck };
}
```

**Key implementation details:**
- All sliders are SVG `<rect>` + `<circle>` with drag handlers (or simpler: clickable +/- buttons)
- Gauge bars use `<motion.rect>` with `animate={{ width: computed }}` for smooth updates
- Formula section updates reactively via `useMemo`

### Step 4: Implement BankConflictVisualizer

Visualization of shared memory bank conflicts: shows 32 banks, thread access patterns, and how different access strides cause 1-way, 2-way, or N-way bank conflicts. Includes swizzling fix demonstration.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
type AccessPattern = 'no_conflict' | 'stride_1' | 'stride_2' | 'stride_32' | 'swizzled';

interface PatternConfig {
  id: AccessPattern;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  getBank: (threadIdx: number) => number;  // which bank thread i accesses
  conflictDegree: number;  // 1 = no conflict, 2 = 2-way, 32 = full serialization
}

const PATTERNS: PatternConfig[] = [
  {
    id: 'no_conflict',
    label: { zh: '无冲突 (stride=1)', en: 'No conflict (stride=1)' },
    description: {
      zh: '每个线程访问连续的 4 字节，映射到不同 bank。32 线程并行访问。',
      en: 'Each thread accesses consecutive 4 bytes, mapped to different banks. 32 threads access in parallel.',
    },
    getBank: (tid) => tid % 8,
    conflictDegree: 1,
  },
  {
    id: 'stride_2',
    label: { zh: '2-way 冲突 (stride=2)', en: '2-way conflict (stride=2)' },
    description: {
      zh: '线程以 stride=2 访问，偶数 bank 被两个线程同时访问，需要 2 次串行访问。完整 warp (32 线程) 中同理。',
      en: 'Threads access with stride=2, even banks hit by 2 threads simultaneously, requiring 2 serial accesses. Same pattern in full warp (32 threads).',
    },
    getBank: (tid) => (tid * 2) % 8,
    conflictDegree: 2,
  },
  {
    id: 'stride_32',
    label: { zh: '全冲突 (stride=N_banks)', en: 'Full conflict (stride=N_banks)' },
    description: {
      zh: '所有线程访问同一个 bank！完整 warp 中 32 个线程完全串行化，性能下降 32 倍。',
      en: 'All threads access the same bank! In a full warp, 32 threads fully serialized, 32x performance drop.',
    },
    getBank: (_tid) => 0,
    conflictDegree: 32,  // in full warp
  },
  {
    id: 'swizzled',
    label: { zh: 'Swizzle 优化', en: 'Swizzled (fixed)' },
    description: {
      zh: '通过 XOR swizzle 重新映射地址，消除 bank conflict。常用公式: bank = (row ^ col) % N_banks。',
      en: 'XOR swizzle remaps addresses to eliminate bank conflicts. Common formula: bank = (row ^ col) % N_banks.',
    },
    getBank: (tid) => (tid ^ (Math.floor(tid / 8) * 3)) % 8,
    conflictDegree: 1,
  },
];

// Show 8 of 32 threads/banks for visual clarity; pattern repeats for full warp
const NUM_BANKS = 8;
const NUM_THREADS = 8;  // quarter-warp subset (pattern is identical for full 32)
```

**Rendering approach:**

- SVG viewBox `0 0 800 480`
- Top: title + 4-button pattern selector (tab-style)
- **Main area (y=80..380):**
  - Left column (x=20..200): **Threads** — 8 circles in a vertical column, labeled T0..T7, colored with HEAD_COLORS. Add note: "Showing 8 of 32 threads; pattern repeats for full warp"
  - Right column (x=350..780): **Banks** — 8 vertical columns (each 40px wide with 8px gap), labeled B0..B7 at bottom
  - **Connection lines**: From each thread circle to its target bank column. Use `<motion.line>` or `<motion.path>`:
    - No conflict (1-way): all 8 lines are green, each to a different bank
    - 2-way conflict: lines to conflicting banks are orange, pairs highlighted (4 banks hit by 2 threads each)
    - N-way conflict: all 8 lines converge to bank 0, colored red, with a "32x serialization (in full warp)" warning
    - Swizzled: lines are green, evenly distributed (conflict resolved)
  - Banks that receive multiple accesses are highlighted with thicker red stroke (strokeWidth=3) + red fillOpacity=0.2 (consistent with Phase 1-2 visual language — no CSS glow/shadow effects)
- **Bottom (y=390..470):**
  - Performance bar: shows relative access time as horizontal bar (1x for no conflict → 32x for full conflict)
  - Description text explaining current pattern
  - For `swizzled` pattern, show the XOR formula: `bank = (row ⊕ col) % 32`

**Key implementation details:**
- Animate line transitions between patterns using `AnimatePresence mode="wait"` and `<motion.line>` with `initial={{ pathLength: 0 }}` → `animate={{ pathLength: 1 }}`
- Color conflicting banks with `COLORS.red`, non-conflicting with `COLORS.green`
- Show conflict count badge on each bank (small number above bank column)
- Thread circles and bank columns remain static; only connection lines and highlighting animate

### Step 5: Write tiling-memory-hierarchy.mdx (zh)

**Frontmatter:**

```yaml
---
title: "Tiling 策略与内存层次优化"
slug: tiling-memory-hierarchy
locale: zh
tags: [compiler, tiling, memory-hierarchy, gpu, shared-memory, optimization]
prerequisites: [operator-fusion-cost-model]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "Roofline: An Insightful Visual Performance Model for Multicore Architectures"
    url: "https://www2.eecs.berkeley.edu/Pubs/TechRpts/2008/EECS-2008-134.pdf"
  - type: website
    title: "NVIDIA CUDA C++ Programming Guide — Shared Memory"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#shared-memory"
  - type: website
    title: "CUTLASS: CUDA Templates for Linear Algebra Subroutines"
    url: "https://github.com/NVIDIA/cutlass"
  - type: paper
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"
    url: "https://arxiv.org/abs/2205.14135"
  - type: website
    title: "Triton Language Documentation"
    url: "https://triton-lang.org/main/index.html"
  - type: website
    title: "NVIDIA A100 GPU Architecture Whitepaper"
    url: "https://images.nvidia.com/aem-dam/en-zz-Solutions/data-center/nvidia-ampere-architecture-whitepaper.pdf"
---
```

**Content structure** (write full article, minimum 3000 words):

```
import CompilerStackMap
import TilingHierarchyExplorer
import MemoryHierarchyFlow
import TileSizeCalculator
import BankConflictVisualizer

<CompilerStackMap mode="compact" currentArticle="tiling-memory-hierarchy" client:visible />

## 简介
- Why tiling is the most fundamental GPU optimization technique
- Preview: tiling turns memory-bound problems into compute-bound
- Position in compiler stack: bridges Pass/Fusion (Phase 2) with Codegen (Art.12-13)

## 为什么 Tiling 是 GPU 编译的核心
- Roofline model recap: A100 312 TFLOPS vs 2 TB/s → compute-to-bandwidth ratio 156:1
- Most ML ops are memory-bound; tiling increases data reuse → increases arithmetic intensity
- Core idea: split large computation into small tiles that fit in fast on-chip memory
- Analogy: reading a book page-by-page vs loading entire library into RAM

## GPU 内存层次详解
- HBM: ~80 GB, ~2 TB/s, ~400 cycle latency
- L2 Cache: ~40 MB (A100), hardware-managed, transparent
- Shared Memory (SRAM): ~164 KB per SM (A100), explicitly managed by programmer
- Register File: ~256 KB per SM, fastest, per-thread private
- Table comparing all 4 levels with capacity, bandwidth, latency, management model
- Key insight: bandwidth increases ~10x at each level, but capacity decreases ~1000x

<MemoryHierarchyFlow client:visible />

## 多级 Tiling 策略

### Thread Block Level Tiling
- GEMM example: output C[M,N] = A[M,K] × B[K,N]
- Each thread block computes a BLOCK_M × BLOCK_N tile of C
- K dimension processed in steps of BLOCK_K
- Code example showing Triton-style block-level tiling

### Warp Level Tiling
- Within a thread block, each warp computes a sub-tile
- CUTLASS warp-level MMA: 64×64 or 32×32 per warp
- Data flows from shared memory to register file

### Register Level Tiling (MMA Instructions)
- Tensor Core MMA: 16×16×16 (FP16) or 16×8×16 (FP16 on Ampere)
- Fragment concept: each thread holds a fragment of the tile in registers
- WMMA API vs MMA PTX instructions

<TilingHierarchyExplorer client:visible />

## 内存层次优化技术

### Shared Memory Staging
- Pattern: load tile from HBM → shared memory → threads read from shared memory
- Code showing double-loop pattern: outer loop over K tiles, inner loop computes

### cp.async：异步复制
- Ampere+ architecture: cp.async copies HBM → shared memory without going through registers
- Reduces register pressure, enables pipelining
- Code pattern with cp.async and commit_group

### Double Buffering / Multi-Stage Pipelining
- Idea: overlap loading of next tile with computation of current tile
- N-stage pipeline: while computing tile[i], load tile[i+1]..tile[i+N-1]
- Trade-off: more stages = more shared memory usage, better latency hiding
- Code showing 2-stage pipeline pattern

### Memory Coalescing
- Coalesced access: adjacent threads access adjacent memory addresses
- Non-coalesced: threads access scattered addresses → multiple memory transactions
- Impact: 10-32x performance difference
- Common pitfall: column-major access in row-major layout

### Bank Conflict 与 Swizzling
- Shared memory: 32 banks, each 4 bytes wide
- Bank conflict: multiple threads in same warp access same bank → serialization
- stride=1: no conflict; stride=2: 2-way; stride=32: 32-way (worst case)
- Swizzling: XOR-based address remapping to eliminate conflicts

<BankConflictVisualizer client:visible />

## Tile Size 选择的约束分析
- Shared memory capacity constraint: tile too large → doesn't fit
- Register pressure constraint: too many live values → spill to local memory
- Occupancy tradeoff: more resources per block → fewer concurrent blocks → lower occupancy
- The three constraints form a feasibility region; autotuning explores this space
- Heuristic rules of thumb: start with BLOCK_M=BLOCK_N=128, BLOCK_K=32

<TileSizeCalculator client:visible />

## Tiling 贯穿编译器栈
- Pass stage: MLIR bufferization determines memory hierarchy placement
- Tiling stage: tile-and-fuse in MLIR linalg
- Fusion stage: tile boundaries determine fusion opportunities
- Codegen stage: emit shared memory load/store, barriers, async copies
- Scheduling stage: kernel launch configuration based on tile sizes
- Diagram showing how tiling decisions flow through each stage

## 实战：GEMM Kernel 完整 Tiling 分析
- Start: naive matmul (one element per thread, HBM only) → ~2% of peak FLOPS
- Step 1: shared memory tiling (128×128×32) → ~30% of peak
- Step 2: register tiling with Tensor Core MMA → ~60% of peak
- Step 3: double buffering + vectorized loads → ~80% of peak
- Step 4: swizzling + occupancy tuning → ~90% of peak (approaching CUTLASS/cuBLAS)
- Performance table with each step's TFLOPS and % of peak

## 总结
- Tiling is the bridge between high-level optimization and hardware execution
- Multi-level tiling maps to GPU memory hierarchy
- Key techniques: staging, async copy, double buffering, coalescing, swizzling
- Tile size selection is a constraint optimization problem
- Next article preview: dynamic shapes challenge these static tiling strategies

## 延伸阅读
- NVIDIA CUDA Programming Guide — Shared Memory chapter
- CUTLASS documentation — understanding multi-level tiling in practice
- Triton tutorials — block-level programming model
- FlashAttention paper — tiling applied to attention computation
- "Roofline" paper — understanding compute vs memory bottleneck
```

### Step 6: Write tiling-memory-hierarchy.mdx (en)

Same structure as zh version but in English. All component imports identical. Key differences:
- `locale: en` in frontmatter
- `title: "Tiling Strategies & Memory Hierarchy Optimization"`
- All components get `locale="en"` prop
- `<CompilerStackMap mode="compact" currentArticle="tiling-memory-hierarchy" locale="en" client:visible />`
- All prose in English, technical terms same as zh version
- Same references (all English URLs)

### Step 7: Verify Article 10

- [ ] Run `npm run validate` — confirm no content validation errors
- [ ] Run `npm run dev` and visit `/zh/articles/tiling-memory-hierarchy` and `/en/articles/tiling-memory-hierarchy`
- [ ] Verify all 4 components render and are interactive
- [ ] Verify CompilerStackMap highlights correct article
- [ ] Spot-check technical accuracy: A100 specs (164 KB SMEM, 256 KB regs, 2 TB/s HBM, 32 banks)

### Step 8: Commit

```bash
git add src/components/interactive/TilingHierarchyExplorer.tsx \
        src/components/interactive/MemoryHierarchyFlow.tsx \
        src/components/interactive/TileSizeCalculator.tsx \
        src/components/interactive/BankConflictVisualizer.tsx \
        src/content/articles/zh/tiling-memory-hierarchy.mdx \
        src/content/articles/en/tiling-memory-hierarchy.mdx
git commit -m "feat(graph-compilation): add Article 10 — Tiling & Memory Hierarchy with TilingHierarchyExplorer, MemoryHierarchyFlow, TileSizeCalculator, BankConflictVisualizer"
```

---

## Task 2: Article 11 — Dynamic Shapes：从捕获到执行的全链路挑战 (dynamic-shapes-challenge)

Trace how dynamic shapes propagate through every stage of the compiler — the most core practical challenge in LLM inference. This is a vertical thematic article. 3 interactive components + bilingual MDX.

**Files:**
- Create: `src/components/interactive/DynamicShapeImpactTracer.tsx`
- Create: `src/components/interactive/GuardRecompilationDemo.tsx`
- Create: `src/components/interactive/BucketingStrategyCompare.tsx`
- Create: `src/content/articles/zh/dynamic-shapes-challenge.mdx`
- Create: `src/content/articles/en/dynamic-shapes-challenge.mdx`

### Step 1: Implement DynamicShapeImpactTracer

Interactive visualization showing how static vs dynamic shapes affect each compiler stage. User selects a stage (Capture, IR, Passes, Fusion, Tiling, Codegen) and sees side-by-side comparison of what the compiler can do with static vs dynamic shapes.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
type CompilerStage = 'capture' | 'ir' | 'passes' | 'fusion' | 'tiling' | 'codegen';

interface StageComparison {
  stage: CompilerStage;
  label: { zh: string; en: string };
  staticCase: {
    description: { zh: string; en: string };
    capabilities: string[];  // list of enabled optimizations
    codeSnippet: string;     // representative code/IR
    statusColor: string;     // green = fully optimizable
  };
  dynamicCase: {
    description: { zh: string; en: string };
    capabilities: string[];  // list of available optimizations (fewer)
    limitations: string[];   // what can't be done
    codeSnippet: string;
    statusColor: string;     // orange or red = limited
  };
}

const STAGES: StageComparison[] = [
  {
    stage: 'capture',
    label: { zh: '图捕获 (Capture)', en: 'Graph Capture' },
    staticCase: {
      description: { zh: 'FX trace 一次，shape 固定，无 guard', en: 'FX trace once, shape fixed, no guards' },
      capabilities: ['Single trace', 'No recompilation', 'Deterministic graph'],
      codeSnippet: 'tensor<32x512x768xf32>',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: 'SymInt 表示维度，guard 检查 shape 匹配', en: 'SymInt for dimensions, guard checks shape match' },
      capabilities: ['Symbolic tracing', 'Guard-based recompilation'],
      limitations: ['Guard overhead per call', 'Recompilation on shape change'],
      codeSnippet: 'tensor<s0 x s1 x 768xf32>\n# guard: s0 > 0, s1 > 0',
      statusColor: COLORS.orange,
    },
  },
  {
    stage: 'ir',
    label: { zh: 'IR 表示', en: 'IR Representation' },
    staticCase: {
      description: { zh: '所有维度为常量，循环边界固定', en: 'All dims are constants, loop bounds fixed' },
      capabilities: ['Constant loop bounds', 'Precomputed strides', 'Static allocation'],
      codeSnippet: 'linalg.matmul\n  ins(%A: tensor<128x768xf32>,\n      %B: tensor<768x512xf32>)\n  outs(%C: tensor<128x512xf32>)',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: '维度为符号变量，需要运行时间接索引', en: 'Dims are symbolic, require runtime indirect indexing' },
      capabilities: ['Symbolic constraints', 'Rank known'],
      limitations: ['No constant folding of shapes', 'Runtime stride computation'],
      codeSnippet: 'linalg.matmul\n  ins(%A: tensor<?x768xf32>,\n      %B: tensor<768x512xf32>)\n  outs(%C: tensor<?x512xf32>)',
      statusColor: COLORS.orange,
    },
  },
  {
    stage: 'passes',
    label: { zh: '优化 Pass', en: 'Optimization Passes' },
    staticCase: {
      description: { zh: '所有 Pass 正常工作：常量折叠、layout 优化、memory planning', en: 'All passes work: constant folding, layout opt, memory planning' },
      capabilities: ['Constant folding', 'Layout optimization', 'Static memory planning', 'Loop unrolling'],
      codeSnippet: '# buffer = alloc(128 * 512 * 4)\n# layout: NHWC (chosen by cost model)',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: '部分 Pass 失效：shape 相关常量无法折叠，内存无法预分配', en: 'Some passes disabled: shape-dependent constants can\'t fold, memory can\'t preallocate' },
      capabilities: ['DCE', 'CSE (shape-independent)'],
      limitations: ['No constant folding (shape-dependent)', 'No static memory planning', 'Layout choice deferred'],
      codeSnippet: '# buffer = alloc(s0 * 512 * 4)  // runtime\n# layout: deferred to runtime',
      statusColor: COLORS.red,
    },
  },
  {
    stage: 'fusion',
    label: { zh: '算子融合', en: 'Operator Fusion' },
    staticCase: {
      description: { zh: '精确判断融合合法性，SRAM 容量检查确定', en: 'Precise legality check, SRAM capacity check definite' },
      capabilities: ['Exact SRAM budget check', 'Aggressive fusion', 'Shape-based cost model'],
      codeSnippet: '# fuse(relu, matmul): 14 KB < 164 KB ✓',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: '无法确定中间结果大小，融合策略保守', en: 'Cannot determine intermediate sizes, conservative fusion' },
      capabilities: ['Element-wise fusion (safe)', 'Known-rank fusion'],
      limitations: ['Conservative SRAM budget (assume worst case)', 'May miss fusion opportunities'],
      codeSnippet: '# fuse(relu, matmul): s0*512*4 < 164KB ?\n# unknown → skip fusion (conservative)',
      statusColor: COLORS.orange,
    },
  },
  {
    stage: 'tiling',
    label: { zh: 'Tiling', en: 'Tiling' },
    staticCase: {
      description: { zh: '编译时选择最优 tile size，循环完全展开', en: 'Compile-time optimal tile size, loops fully unrolled' },
      capabilities: ['Optimal tile size', 'Full unrolling', 'Perfect occupancy tuning'],
      codeSnippet: 'BLOCK_M=128, BLOCK_N=128, BLOCK_K=32\n# grid = (1, 4, 1)  // precomputed',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: 'Tile size 需要兼顾多种 shape，或运行时决定', en: 'Tile size must accommodate multiple shapes, or decided at runtime' },
      capabilities: ['Conservative tile size', 'Runtime grid computation'],
      limitations: ['Suboptimal tile for some shapes', 'No loop unrolling', 'Runtime overhead for grid calc'],
      codeSnippet: 'BLOCK_M=64  // conservative\n# grid = (ceildiv(s0,64), 4, 1)  // runtime',
      statusColor: COLORS.orange,
    },
  },
  {
    stage: 'codegen',
    label: { zh: '代码生成', en: 'Code Generation' },
    staticCase: {
      description: { zh: '特化 kernel，所有分支消除，向量化最优', en: 'Specialized kernel, all branches eliminated, optimal vectorization' },
      capabilities: ['Specialized kernel', 'Dead branch elimination', 'Optimal vectorization width'],
      codeSnippet: '@triton.jit  # compiled for (32, 512, 768)\ndef kernel_32_512_768(...):\n  # no bounds checks needed',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: '通用 kernel，需要边界检查，可能有 warp divergence', en: 'Generic kernel, needs bounds checks, potential warp divergence' },
      capabilities: ['Generic kernel works for all shapes'],
      limitations: ['Bounds checks (mask)', 'Warp divergence', 'Suboptimal vectorization', 'Compilation cache needed'],
      codeSnippet: '@triton.jit  # generic\ndef kernel(N: tl.constexpr, ...):\n  mask = offs < N  # bounds check\n  x = tl.load(ptr, mask=mask)',
      statusColor: COLORS.red,
    },
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 520`
- Top: title + 6-button stage selector (horizontal tabs)
- **Main area split into two columns:**
  - Left (x=20..385): **Static Shape** card — green-tinted header, shows:
    - Stage-specific description
    - Capability list (checkmarks in green)
    - Code snippet in monospace (light gray background box)
  - Right (x=415..780): **Dynamic Shape** card — orange/red-tinted header, shows:
    - Stage-specific description
    - Capability list (checkmarks in orange)
    - Limitations list (X marks in red)
    - Code snippet in monospace
- Cards animate in/out with `AnimatePresence` when stage changes
- Bottom: progress indicator showing all 6 stages as dots, current highlighted
- Visual emphasis: use `statusColor` as card header background (at 0.15 opacity) and border color

**Key implementation details:**
- Code snippets rendered as `<text>` elements with `FONTS.mono`, line-by-line
- Capability/limitation lists use small SVG circles (✓ green, ✗ red) as bullet points
- Tab transitions use `<motion.g>` with fade + slide animation

### Step 2: Implement GuardRecompilationDemo

Animated simulation of PyTorch's guard system: a sequence of inference calls with different input shapes triggers guard checks, cache hits, and recompilation events. **Important:** This demo models `torch.compile(dynamic=False)` behavior (per-concrete-shape caching). Add a toggle or note explaining that the default `dynamic=None` mode uses `automatic_dynamic_shapes`: after one guard fail on a dimension, it recompiles with that dimension marked symbolic, so subsequent shapes for that dimension all hit cache without further recompilation.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
interface InferenceCall {
  id: number;
  shape: [number, number, number];  // [batch, seq_len, hidden]
  label: string;  // e.g., "Call 1: [1, 128, 768]"
}

interface CacheEntry {
  shapes: string;          // e.g., "[1, 128, 768]"
  compiledAt: number;      // call number when compiled
  hitCount: number;        // how many times cache hit
}

type GuardResult = 'compile' | 'hit' | 'recompile';
type DynamicMode = 'static' | 'auto_dynamic';  // toggle between dynamic=False and dynamic=None

// dynamic=False mode: per-concrete-shape caching
const STATIC_CALL_SEQUENCE: InferenceCall[] = [
  { id: 1, shape: [1, 128, 768], label: 'Call 1' },   // first call → compile
  { id: 2, shape: [1, 128, 768], label: 'Call 2' },   // same shape → cache hit
  { id: 3, shape: [1, 256, 768], label: 'Call 3' },   // new seq_len → recompile
  { id: 4, shape: [1, 128, 768], label: 'Call 4' },   // back to cached → hit
  { id: 5, shape: [1, 256, 768], label: 'Call 5' },   // cached → hit
  { id: 6, shape: [1, 512, 768], label: 'Call 6' },   // new → recompile
  { id: 7, shape: [1, 1024, 768], label: 'Call 7' },  // new → recompile
  { id: 8, shape: [1, 512, 768], label: 'Call 8' },   // cached → hit
];

// dynamic=None (default): automatic_dynamic_shapes
// After first guard fail, seq_len dimension marked symbolic → all subsequent shapes hit
const AUTO_DYNAMIC_CALL_SEQUENCE: InferenceCall[] = [
  { id: 1, shape: [1, 128, 768], label: 'Call 1' },   // first call → compile (static)
  { id: 2, shape: [1, 128, 768], label: 'Call 2' },   // same shape → cache hit
  { id: 3, shape: [1, 256, 768], label: 'Call 3' },   // guard fail → recompile with seq_len=symbolic
  { id: 4, shape: [1, 128, 768], label: 'Call 4' },   // symbolic dim matches → cache hit
  { id: 5, shape: [1, 256, 768], label: 'Call 5' },   // symbolic dim matches → cache hit
  { id: 6, shape: [1, 512, 768], label: 'Call 6' },   // symbolic dim matches → cache hit
  { id: 7, shape: [1, 1024, 768], label: 'Call 7' },  // symbolic dim matches → cache hit
  { id: 8, shape: [1, 512, 768], label: 'Call 8' },   // symbolic dim matches → cache hit
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 500`
- Top: title + **mode toggle** (`dynamic=False` / `dynamic=None (default)`) + Step/Play/Reset buttons
- Mode toggle switches between STATIC_CALL_SEQUENCE and AUTO_DYNAMIC_CALL_SEQUENCE, showing dramatically different recompilation counts (4 vs 1)
- **Left area (x=20..480): Call timeline** — vertical list of inference calls, advancing one at a time:
  - Each call shows as a horizontal row:
    - Shape badge: `[1, 128, 768]` in monospace
    - Guard check animation: a "checking..." spinner → result icon:
      - Compile (first time): blue gear icon + "Compile" label
      - Cache hit: green checkmark + "Cache Hit" label
      - Recompile (new shape): orange gear icon + "Recompile" label
    - Latency indicator: thin bar showing relative latency (compile >> hit)
  - Past calls are dimmed, current call is highlighted, future calls are hidden
- **Right area (x=500..780): Compilation Cache** — shows cached compiled kernels:
  - Each cache entry is a card: shape string + hit count badge
  - New entries animate in with slide-down
  - Hit count increments with a pulse animation
  - Cache size counter at top: "Cache: N entries"
- **Bottom: Statistics** — running totals:
  - Total compilations: N
  - Cache hit rate: X%
  - Avg latency bar (compare with/without caching)

**Key implementation details:**
- `useState<number>(0)` for current call index; Step button increments
- Guard logic: check if current shape matches any cache entry's shapes; if yes → hit, else → compile/recompile
- Use `useEffect` with interval for Play mode: 3s for compile/recompile steps (showing gear animation), 1.5s for cache hits — variable timing makes latency difference visceral
- Compile calls show a brief "compiling..." animation (pulsing gear) for 1s before showing result

### Step 3: Implement BucketingStrategyCompare

Compare different bucketing strategies for handling dynamic sequence lengths: no bucketing, power-of-2, fixed intervals, and padding to multiples. Shows waste (padding overhead) vs compilation count tradeoff.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
type BucketStrategy = 'none' | 'power_of_2' | 'fixed_interval' | 'multiple_of_8';

interface StrategyConfig {
  id: BucketStrategy;
  label: { zh: string; en: string };
  getBucket: (seqLen: number) => number;  // returns the bucket size
  description: { zh: string; en: string };
}

const STRATEGIES: StrategyConfig[] = [
  {
    id: 'none',
    label: { zh: '无 Bucketing', en: 'No Bucketing' },
    getBucket: (s) => s,
    description: {
      zh: '每个独特 seq_len 触发一次编译。零 padding 浪费，但编译次数最多。',
      en: 'Each unique seq_len triggers a compilation. Zero padding waste, but most compilations.',
    },
  },
  {
    id: 'power_of_2',
    label: { zh: 'Power-of-2', en: 'Power-of-2' },
    getBucket: (s) => Math.pow(2, Math.ceil(Math.log2(s))),
    description: {
      zh: '向上取到最近的 2 的幂（64, 128, 256, 512, 1024, 2048）。编译次数少，但短序列浪费大。',
      en: 'Round up to nearest power of 2 (64, 128, 256, ...). Few compilations, but high waste for short sequences.',
    },
  },
  {
    id: 'fixed_interval',
    label: { zh: '固定间隔 (128)', en: 'Fixed Interval (128)' },
    getBucket: (s) => Math.ceil(s / 128) * 128,
    description: {
      zh: '向上取到 128 的整数倍。编译次数和浪费的折中方案。',
      en: 'Round up to nearest multiple of 128. Balance between compilations and waste.',
    },
  },
  {
    id: 'multiple_of_8',
    label: { zh: 'Multiple-of-8', en: 'Multiple-of-8' },
    getBucket: (s) => Math.ceil(s / 8) * 8,
    description: {
      zh: '向上取到 8 的整数倍。最小 padding，但 bucket 数量较多。对 Tensor Core 对齐友好。',
      en: 'Round up to nearest multiple of 8. Minimal padding, but more buckets. Tensor Core alignment friendly.',
    },
  },
];

// Simulated workload: 20 inference requests with varying seq_lens
const WORKLOAD: number[] = [73, 128, 45, 256, 128, 512, 73, 1024, 256, 45, 200, 512, 73, 128, 300, 1024, 150, 64, 256, 800];
```

**Rendering approach:**

- SVG viewBox `0 0 800 500`
- Top: title + 4-button strategy selector
- **Main area:**
  - Upper section (y=80..280): **Bucket visualization** — horizontal bar chart:
    - X-axis: sequence length (0..1024)
    - Each workload item shown as a thin vertical line at its seq_len
    - Bucket boundaries shown as vertical dashed lines
    - Padding waste shown as colored area between actual seq_len and bucket boundary
    - Color: actual data in `COLORS.primary`, padding waste in `COLORS.waste` (light red)
  - Lower section (y=300..480): **Metrics comparison** — 3 horizontal bars:
    1. **Unique compilations**: number of distinct buckets needed (lower = better, green)
    2. **Total padding waste**: sum of (bucket - actual) across all requests (lower = better)
    3. **Worst-case waste %**: max single-request waste percentage
    - Show numeric value next to each bar
- **Bottom:** Current strategy description text

**Key implementation details:**
- `useMemo` to compute metrics per strategy: iterate WORKLOAD, apply `getBucket`, count unique buckets, sum waste
- Bar chart bars use `<motion.rect>` for smooth transition when switching strategies
- Bucket boundaries animate in/out with `AnimatePresence`

### Step 4: Write dynamic-shapes-challenge.mdx (zh)

**Frontmatter:**

```yaml
---
title: "Dynamic Shapes：从捕获到执行的全链路挑战"
slug: dynamic-shapes-challenge
locale: zh
tags: [compiler, dynamic-shapes, symbolic-shapes, guards, bucketing, pytorch]
prerequisites: [tiling-memory-hierarchy]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation and Graph Compilation"
    url: "https://dl.acm.org/doi/10.1145/3620665.3640366"
  - type: website
    title: "torch.compile Dynamic Shapes Documentation"
    url: "https://pytorch.org/docs/stable/torch.compiler_dynamic_shapes.html"
  - type: website
    title: "TorchDynamo Deep Dive"
    url: "https://pytorch.org/docs/stable/torch.compiler_dynamo_deepdive.html"
  - type: website
    title: "MLIR Tensor Type — Dynamic Dimensions"
    url: "https://mlir.llvm.org/docs/Dialects/Builtin/#rankedtensortype"
---
```

**Content structure** (full article, minimum 3000 words):

```
import CompilerStackMap
import DynamicShapeImpactTracer
import GuardRecompilationDemo
import BucketingStrategyCompare

<CompilerStackMap mode="compact" currentArticle="dynamic-shapes-challenge" client:visible />

## 简介
- Dynamic shapes: the most critical practical challenge in LLM inference
- Why: sequence length varies per request, batch size changes with continuous batching
- Core contradiction: compilers want static info for optimization, but ML workloads are inherently dynamic
- This article traces dynamic shapes' impact through every compiler stage

## 问题定义
- LLM inference: seq_len changes per request (10 tokens to 4096 tokens)
- Continuous batching: batch size varies at runtime
- Traditional compilers: types and sizes known at compile time
- ML uniqueness: first-class dynamic dimensions
- Concrete example: GPT model with varying prompt lengths

## PyTorch 的解决方案 — Symbolic Shapes
### SymInt / SymFloat
- Design: represent dimensions with symbolic variables, not concrete values
- torch._dynamo captures symbolic shapes during tracing
- SymInt tracks symbolic expressions (s0 + 1, s0 * 3, etc.)
- Code example showing symbolic tracing

### Guard 系统
- Guard = runtime check: "does current shape match compiled assumption?"
- Guard types: shape guards, value guards, type guards
- Guard check: fast (few integer comparisons)
- Guard failure → recompilation → new cached entry
- torch._dynamo.mark_dynamic() — explicitly mark dimensions as dynamic
- Code example with mark_dynamic

### Symbol Constraint System
- Constraints: s0 > 0, s0 <= 2048, s0 % 8 == 0
- Inferred from model structure and user hints
- Used by compiler to narrow optimization space

<GuardRecompilationDemo client:visible />

## Dynamic Shape 对编译各阶段的影响

<DynamicShapeImpactTracer client:visible />

### 对 IR 层的影响
- Static: tensor<128x768xf32> — all dims concrete
- Dynamic: tensor<?x768xf32> — ? dimension symbolic
- MLIR RankedTensorType with dynamic dims
- Shape constraint propagation through operations

### 对优化 Pass 的影响
- Passes that FAIL: constant folding (shape-dependent), layout optimization, static memory planning
- Passes that WORK: DCE, CSE (shape-independent)
- Shape specialization: compile for specific shape, guard at entry
- Tradeoff: specialization quality vs recompilation count

### 对 Fusion 的影响
- Fusion legality: SRAM budget check needs to know intermediate sizes
- Dynamic → conservative: assume worst case or skip fusion
- Element-wise fusion still works (independent of shape)
- Reduction fusion needs to know reduction dimension

### 对 Tiling/Codegen 的影响
- Static tile size vs runtime tile size selection
- Specialized kernel (one per shape) vs generic kernel
- Generic kernel: bounds checks (mask), warp divergence
- Compilation cache keyed by shape

## 工程策略

### Bucketing
- Assign seq_len to discrete buckets (64, 128, 256, 512, 1024, 2048)
- Each bucket gets a specialized compiled kernel
- Tradeoff: fewer buckets = less compilation, more padding waste

<BucketingStrategyCompare client:visible />

### Padding 策略
- Pad to nearest power of 2: simple, aligned, but high waste for short sequences
- Pad to nearest multiple of 8: minimal waste, Tensor Core alignment
- Pad to nearest multiple of 128: balanced for typical LLM workloads

### Shape Hints
- Tell compiler the expected shape range: min, max, divisibility
- Compiler generates kernel valid for range, with specializations at boundaries
- torch.export with dynamic_shapes argument

### AOT vs JIT 编译
- AOT: compile all shape variants ahead of time (predictable latency)
- JIT: compile on first encounter, cache for later (flexible but cold-start penalty)
- Hybrid: AOT for common shapes, JIT fallback for rare shapes

## 实战分析
- Scenario: LLM inference with seq_len ∈ {32, 64, 128, 256, 512, 1024, 2048}
- torch.compile with default settings: 7 recompilations
- torch.compile with mark_dynamic + bucketing: 4 recompilations (power-of-2 buckets)
- Performance comparison table: compilation time vs inference latency
- Common pitfalls: too many guards, forgetting mark_dynamic, shape-dependent control flow

## 总结
- Dynamic shapes challenge every stage of the compiler
- PyTorch's SymInt/Guard system provides a practical solution
- Engineering strategies (bucketing, padding, hints) bridge the gap
- Future direction: better symbolic reasoning, automatic bucketing
- Next article preview: code generation translates optimized IR to hardware instructions

## 延伸阅读
- PyTorch 2 paper — comprehensive treatment of dynamic compilation
- torch.compile documentation — practical guide for dynamic shapes
- TorchDynamo deep dive — guard system internals
- MLIR documentation — dynamic tensor type representation
```

### Step 5: Write dynamic-shapes-challenge.mdx (en)

Same structure as zh version but in English. All component imports identical. Key differences:
- `locale: en` in frontmatter
- `title: "Dynamic Shapes: The Full-Pipeline Challenge from Capture to Execution"`
- All components get `locale="en"` prop
- `<CompilerStackMap mode="compact" currentArticle="dynamic-shapes-challenge" locale="en" client:visible />`
- All prose in English
- Same references

### Step 6: Verify Article 11

- [ ] Run `npm run validate`
- [ ] Run `npm run dev` and visit `/zh/articles/dynamic-shapes-challenge` and `/en/articles/dynamic-shapes-challenge`
- [ ] Verify all 3 components render and are interactive
- [ ] Verify CompilerStackMap highlights correct article
- [ ] Spot-check technical accuracy: SymInt API, guard system behavior, bucketing math

### Step 7: Commit

```bash
git add src/components/interactive/DynamicShapeImpactTracer.tsx \
        src/components/interactive/GuardRecompilationDemo.tsx \
        src/components/interactive/BucketingStrategyCompare.tsx \
        src/content/articles/zh/dynamic-shapes-challenge.mdx \
        src/content/articles/en/dynamic-shapes-challenge.mdx
git commit -m "feat(graph-compilation): add Article 11 — Dynamic Shapes Challenge with DynamicShapeImpactTracer, GuardRecompilationDemo, BucketingStrategyCompare"
```

---

## Task 3: Article 12 — 代码生成（上）：指令选择、Vectorization 与 Register Allocation (codegen-instruction-selection)

Understand the mapping process from optimized IR to concrete machine instructions. This is a horizontal stage article covering the codegen pipeline's first half. 3 interactive components + bilingual MDX.

**Files:**
- Create: `src/components/interactive/InstructionSelectionDemo.tsx`
- Create: `src/components/interactive/RegisterPressureVisualizer.tsx`
- Create: `src/components/interactive/VectorizationDemo.tsx`
- Create: `src/content/articles/zh/codegen-instruction-selection.mdx`
- Create: `src/content/articles/en/codegen-instruction-selection.mdx`

### Step 1: Implement InstructionSelectionDemo

Step-through demo showing how a simple computation lowers from high-level IR operations to GPU instructions, with multiple possible instruction choices at each step.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
interface IRNode {
  id: string;
  irOp: string;           // e.g., "linalg.matmul", "arith.addf", "math.exp"
  description: { zh: string; en: string };
}

interface InstructionOption {
  id: string;
  instruction: string;    // SASS-level instruction name (e.g., "HMMA.16816.F32")
  ptxEquivalent: string;  // PTX equivalent (e.g., "mma.sync.aligned.m16n8k16.f32.f16")
  unit: string;           // "Tensor Core" | "FP32 ALU" | "SFU" | "FP16 ALU"
  throughput: string;     // e.g., "256 FLOPs/cycle" or "32 ops/cycle"
  latency: string;        // e.g., "16 cycles"
  isPreferred: boolean;   // highlight the compiler's choice
  reason: { zh: string; en: string };  // why chosen or not
}

interface SelectionStep {
  irNode: IRNode;
  options: InstructionOption[];
  selectedId: string;     // which option the compiler picks
}

const STEPS: SelectionStep[] = [
  {
    irNode: {
      id: 'matmul',
      irOp: 'linalg.matmul<f16>',
      description: { zh: 'FP16 矩阵乘法', en: 'FP16 matrix multiplication' },
    },
    options: [
      {
        id: 'hmma',
        instruction: 'HMMA.16816.F32',
        ptxEquivalent: 'mma.sync.aligned.m16n8k16.f32.f16',
        unit: 'Tensor Core',
        throughput: '256 FLOPs/cycle/SM',
        latency: '16 cycles',
        isPreferred: true,
        reason: {
          zh: 'FP16 输入 + FP32 累加，Tensor Core 最佳选择',
          en: 'FP16 input + FP32 accumulation, best choice for Tensor Core',
        },
      },
      {
        id: 'ffma_f16',
        instruction: 'HFMA2 (FP16 FMA)',
        ptxEquivalent: 'fma.rn.f16x2',
        unit: 'FP16 ALU',
        throughput: '128 FLOPs/cycle/SM',
        latency: '4 cycles',
        isPreferred: false,
        reason: {
          zh: '标量 FP16 FMA，吞吐量只有 Tensor Core 的一半',
          en: 'Scalar FP16 FMA, half the throughput of Tensor Core',
        },
      },
    ],
    selectedId: 'hmma',
  },
  {
    irNode: {
      id: 'add',
      irOp: 'arith.addf<f32>',
      description: { zh: 'FP32 加法（bias add）', en: 'FP32 addition (bias add)' },
    },
    options: [
      {
        id: 'fadd',
        instruction: 'FADD',
        ptxEquivalent: 'add.f32',
        unit: 'FP32 ALU',
        throughput: '64 ops/cycle/SM',
        latency: '4 cycles',
        isPreferred: true,
        reason: {
          zh: '标准 FP32 加法指令，直接映射',
          en: 'Standard FP32 add instruction, direct mapping',
        },
      },
      {
        id: 'ffma_bias',
        instruction: 'FFMA (a + b*1.0)',
        ptxEquivalent: 'fma.rn.f32',
        unit: 'FP32 ALU',
        throughput: '64 ops/cycle/SM',
        latency: '4 cycles',
        isPreferred: false,
        reason: {
          zh: '可以用 FMA 模拟加法，但无性能优势',
          en: 'Can emulate add with FMA, but no performance benefit',
        },
      },
    ],
    selectedId: 'fadd',
  },
  {
    irNode: {
      id: 'exp',
      irOp: 'math.exp<f32>',
      description: { zh: 'FP32 指数函数（softmax 组件）', en: 'FP32 exponential (softmax component)' },
    },
    options: [
      {
        id: 'mufu',
        instruction: 'MUFU.EX2 + MUL',
        ptxEquivalent: 'ex2.approx.f32 + mul.f32',
        unit: 'SFU (Special Function Unit)',
        throughput: '16 ops/cycle/SM',
        latency: '~20 cycles',
        isPreferred: true,
        reason: {
          zh: 'SFU 硬件加速 exp2，再乘 log2(e) 系数得到 exp。吞吐量低但延迟可接受。',
          en: 'SFU hardware-accelerated exp2, then multiply by log2(e). Lower throughput but acceptable latency.',
        },
      },
      {
        id: 'poly',
        instruction: 'Polynomial Approx (6 FFMA)',
        ptxEquivalent: '6× fma.rn.f32',
        unit: 'FP32 ALU',
        throughput: '~10 ops/cycle/SM (effective)',
        latency: '~24 cycles',
        isPreferred: false,
        reason: {
          zh: '多项式逼近：更高精度但需要 6 条 FMA 指令，占用更多 ALU',
          en: 'Polynomial approx: higher precision but needs 6 FMA instructions, more ALU pressure',
        },
      },
    ],
    selectedId: 'mufu',
  },
  {
    irNode: {
      id: 'relu',
      irOp: 'arith.maxf(x, 0.0)<f32>',
      description: { zh: 'ReLU 激活', en: 'ReLU activation' },
    },
    options: [
      {
        id: 'fmnmx',
        instruction: 'FMNMX (fused min/max)',
        ptxEquivalent: 'max.f32',
        unit: 'FP32 ALU',
        throughput: '64 ops/cycle/SM',
        latency: '4 cycles',
        isPreferred: true,
        reason: {
          zh: '硬件 min/max 指令，单条指令完成 ReLU',
          en: 'Hardware min/max instruction, single instruction for ReLU',
        },
      },
      {
        id: 'branch',
        instruction: 'FSETP + SEL (branch)',
        ptxEquivalent: 'setp.gt.f32 + selp.f32',
        unit: 'FP32 ALU',
        throughput: '32 ops/cycle/SM',
        latency: '~8 cycles',
        isPreferred: false,
        reason: {
          zh: '条件分支实现：先比较再选择，2 条指令且可能 warp divergence',
          en: 'Conditional branch: compare then select, 2 instructions with potential warp divergence',
        },
      },
    ],
    selectedId: 'fmnmx',
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 520`
- Top: title + step indicator (Step 1/4, 2/4, etc.) with Next/Prev buttons
- **Left panel (x=20..300): IR Operation** — styled card showing:
  - Operation name in monospace: `linalg.matmul<f16>`
  - Description text
  - An icon representing the operation type (matrix icon for matmul, "+" for add, "eˣ" for exp, ramp for relu)
- **Center area (x=310..500): Selection arrow** — animated arrow from IR to chosen instruction, with a "?" icon that resolves to checkmark when selection is made
- **Right panel (x=510..780): Instruction Candidates** — 2 cards stacked vertically:
  - Each card shows: SASS instruction name (primary), PTX equivalent (secondary, smaller text), execution unit, throughput, latency
  - Label convention: instruction names shown are **SASS-level** (native GPU microcode); PTX equivalents shown for portability reference
  - Preferred option: green border + "✓ Selected" badge
  - Non-preferred: gray border + reason why not chosen
  - Cards animate in from right when step changes
- **Bottom (y=440..510):** Execution unit diagram — simplified SM schematic showing Tensor Core, FP32 ALU, SFU units, with the active unit highlighted for current step
- Use StepNavigator primitive for step navigation

**Key implementation details:**
- Step state managed by StepNavigator or manual `useState<number>`
- Each step transition uses `AnimatePresence` for card swap
- The "selection" animation: start with both cards at equal opacity, then after 0.5s delay, preferred card gets full opacity + green border, other fades to 0.4 opacity

### Step 2: Implement RegisterPressureVisualizer

Interactive visualization showing how register usage affects occupancy and performance. User adjusts fusion scope and sees the tradeoff between register pressure, occupancy, and data reuse.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
interface FusionScenario {
  id: string;
  label: { zh: string; en: string };
  ops: string[];          // list of fused operations
  regsPerThread: number;  // registers used per thread
  dataReuse: number;      // relative data reuse factor (1.0 = no reuse)
  description: { zh: string; en: string };
}

const SCENARIOS: FusionScenario[] = [
  {
    id: 'single_relu',
    label: { zh: '单个 ReLU', en: 'Single ReLU' },
    ops: ['relu'],
    regsPerThread: 8,
    dataReuse: 1.0,
    description: { zh: '最少寄存器，最高 occupancy，但无数据复用', en: 'Fewest registers, highest occupancy, but no data reuse' },
  },
  {
    id: 'fused_2',
    label: { zh: 'ReLU + Mul (2-op fusion)', en: 'ReLU + Mul (2-op fusion)' },
    ops: ['relu', 'mul'],
    regsPerThread: 16,
    dataReuse: 1.5,
    description: { zh: '中等寄存器，减少一次 HBM 往返', en: 'Moderate registers, eliminates one HBM round-trip' },
  },
  {
    id: 'fused_4',
    label: { zh: 'ReLU + Mul + Add + Tanh (4-op)', en: 'ReLU + Mul + Add + Tanh (4-op fusion)' },
    ops: ['relu', 'mul', 'add', 'tanh'],
    regsPerThread: 32,
    dataReuse: 2.5,
    description: { zh: '较多寄存器，大幅减少内存访问', en: 'More registers, significantly reduces memory access' },
  },
  {
    id: 'fused_8',
    label: { zh: 'GEMM + Bias + ReLU + ... (8-op)', en: 'GEMM + Bias + ReLU + ... (8-op fusion)' },
    ops: ['gemm', 'bias', 'relu', 'mul', 'add', 'norm', 'scale', 'tanh'],
    regsPerThread: 96,
    dataReuse: 4.0,
    description: { zh: '大量寄存器，最大数据复用，但 occupancy 大幅下降', en: 'Many registers, maximum reuse, but occupancy drops significantly' },
  },
  {
    id: 'fused_overload',
    label: { zh: '过度融合 (register spill)', en: 'Over-fused (register spill)' },
    ops: ['gemm', 'bias', 'relu', 'mul', 'add', 'norm', 'scale', 'tanh', 'dropout', 'residual', 'layernorm'],
    regsPerThread: 200,
    dataReuse: 3.0,
    description: { zh: '寄存器溢出！spill 到 local memory，性能反降', en: 'Register spill! Spills to local memory, performance drops' },
  },
];

const GPU_REGS_PER_SM = 65536;  // A100: 65536 32-bit registers
const GPU_MAX_WARPS = 64;       // A100: 64 warps per SM
const GPU_MAX_REGS_PER_THREAD = 255;
const GPU_THREADS_PER_WARP = 32;
```

**Computation logic:**

```tsx
function computeMetrics(scenario: FusionScenario) {
  const regs = scenario.regsPerThread;
  const threadsPerWarp = GPU_THREADS_PER_WARP;
  const regsPerWarp = regs * threadsPerWarp;
  const maxWarps = Math.min(GPU_MAX_WARPS, Math.floor(GPU_REGS_PER_SM / regsPerWarp));
  const occupancy = maxWarps / GPU_MAX_WARPS;
  const spill = regs > GPU_MAX_REGS_PER_THREAD;
  // Performance model: benefit of reuse vs cost of lower occupancy
  const effectivePerf = spill ? scenario.dataReuse * 0.3 : scenario.dataReuse * Math.max(occupancy, 0.25);
  return { maxWarps, occupancy, spill, effectivePerf };
}
```

**Rendering approach:**

- SVG viewBox `0 0 800 500`
- Top: title + 5-button scenario selector (horizontal tabs)
- **Left panel (x=20..380): Register File visualization** — a tall rectangle representing the SM's register file (65536 registers):
  - Filled area represents registers used by active warps: `maxWarps × regsPerThread × 32` registers
  - Color: green (<50% used), orange (50-80%), red (>80% or spill)
  - If spill: show overflow with a red dashed area extending below the register file box + "Spill → Local Memory" label with warning icon
  - Show "Used: X / 65536 registers" label
  - Show "Active warps: X / 64" label
- **Right panel (x=400..780): Tradeoff chart** — horizontal double-bar chart for each scenario:
  - Top bar: Occupancy (0-100%, green gradient)
  - Bottom bar: Data Reuse factor (1x-4x, blue gradient)
  - Current scenario highlighted, others dimmed
  - Show effective performance score as a composite bar
- **Bottom (y=420..490):** Description text + "Sweet spot" annotation pointing to the optimal scenario (typically fused_4 which balances regs and reuse)
- For `fused_overload`: flash a red warning box "Register Spill! Performance degraded" with `<motion.rect>` pulsing animation

**Key implementation details:**
- Register file visualization: `<rect>` for total capacity (outline), `<motion.rect>` for filled portion (animate height)
- Occupancy bar animate with `<motion.rect>` width transition
- Spill scenario: distinct visual treatment — red background, warning icon, dashed overflow area

### Step 3: Implement VectorizationDemo

Visualization showing how scalar operations are transformed into vectorized operations (float → float4), with memory access pattern comparison.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
type VectorWidth = 1 | 2 | 4;

interface VectorConfig {
  width: VectorWidth;
  label: string;           // "Scalar (float)" | "float2" | "float4"
  bytesPerLoad: number;    // 4, 8, or 16
  loadsNeeded: number;     // load instructions to process 16 elements: 16, 8, or 4
  instrReduction: string;  // "1x" | "2x" | "4x" — reduction in load instruction count
  efficiency: number;      // 0..1 — bandwidth utilization per instruction
}

const CONFIGS: VectorConfig[] = [
  { width: 1, label: 'Scalar (float)', bytesPerLoad: 4, loadsNeeded: 16, instrReduction: '1x (baseline)', efficiency: 0.25 },
  { width: 2, label: 'float2 (8B)', bytesPerLoad: 8, loadsNeeded: 8, instrReduction: '2x fewer loads', efficiency: 0.5 },
  { width: 4, label: 'float4 (16B)', bytesPerLoad: 16, loadsNeeded: 4, instrReduction: '4x fewer loads', efficiency: 1.0 },
];

// Example: 16 elements to process, 16 threads in half-warp
const NUM_ELEMENTS = 16;
const ELEMENT_SIZE = 4;  // bytes (FP32)
```

**Rendering approach:**

- SVG viewBox `0 0 800 460`
- Top: title + 3-button vector width selector (Scalar / float2 / float4)
- **Upper section (y=70..220): Memory Access Pattern** — horizontal memory strip:
  - 16 memory cells (each 4 bytes), colored by which load instruction accesses them
  - Scalar: each cell accessed by a separate load → 16 colors (rainbow)
  - float2: pairs grouped → 8 colors
  - float4: groups of 4 → 4 colors (HEAD_COLORS)
  - Load arrows above the strip showing which instruction loads which cells
  - Animate grouping change when vector width switches
- **Middle section (y=240..340): Code comparison** — side-by-side code boxes:
  - Left: scalar code `x = tl.load(ptr + offset)` with `x * alpha + beta` one element at a time
  - Right: vectorized code `x = tl.load(ptr + offset, width=4)` processing 4 elements
  - Current vector width's code highlighted, others dimmed
- **Lower section (y=360..440): Efficiency metrics** — 3 horizontal bars:
  1. Load instructions needed: 16 → 8 → 4 (fewer = better)
  2. Bytes per instruction: 4B → 8B → 16B (wider = more efficient per instruction)
  3. Bandwidth utilization: 25% → 50% → 100% (higher = better, green)
  - Note: wider loads reduce load instruction count, not 32-byte sector transactions. The key benefit is fewer instructions for the same data volume.

**Key implementation details:**
- Memory cells are `<rect>` elements with colors cycling through HEAD_COLORS grouped by vector width
- Load arrows use `<motion.path>` curving from "Load N" label down to cell group
- Efficiency bars use `<motion.rect>` with smooth width transition
- Code boxes use `<text>` with `FONTS.mono`, background `<rect>` with `COLORS.bgAlt`

### Step 4: Write codegen-instruction-selection.mdx (zh)

**Frontmatter:**

```yaml
---
title: "代码生成（上）：指令选择、Vectorization 与 Register Allocation"
slug: codegen-instruction-selection
locale: zh
tags: [compiler, codegen, instruction-selection, vectorization, register-allocation, gpu]
prerequisites: [dynamic-shapes-challenge]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: website
    title: "NVIDIA CUDA C++ Programming Guide — PTX ISA"
    url: "https://docs.nvidia.com/cuda/parallel-thread-execution/index.html"
  - type: website
    title: "LLVM Code Generator Documentation"
    url: "https://llvm.org/docs/CodeGenerator.html"
  - type: website
    title: "CUTLASS: CUDA Templates for Linear Algebra Subroutines"
    url: "https://github.com/NVIDIA/cutlass"
  - type: website
    title: "NVIDIA GPU Architecture — Execution Units"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#hardware-implementation"
  - type: paper
    title: "Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations"
    url: "https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf"
---
```

**Content structure** (full article, minimum 3000 words):

```
import CompilerStackMap
import InstructionSelectionDemo
import RegisterPressureVisualizer
import VectorizationDemo

<CompilerStackMap mode="compact" currentArticle="codegen-instruction-selection" client:visible />

## 简介
- Codegen is where optimized IR becomes executable hardware instructions
- Not just translation — significant optimization opportunities remain
- This article covers: instruction selection, vectorization, register allocation
- Position: after passes/fusion/tiling, before final assembly

## 代码生成的任务
- Input: optimized IR (after pass, fusion, tiling from previous articles)
- Output: executable GPU instructions (PTX → cubin)
- Key challenge: bridge the semantic gap between high-level ops and hardware instructions
- LLVM as the universal backend: SelectionDAG / GlobalISel

## 指令选择 (Instruction Selection)
### IR Op → Hardware Instruction Mapping
- One-to-many mapping: a single IR op may have multiple valid instruction sequences
- Example: matmul → Tensor Core HMMA or scalar FMA loop
- The compiler must choose the best mapping based on operand types, sizes, hardware features

### GPU-Specific Instruction Selection
- Tensor Core instructions: HMMA.16816.F32 (FP16→FP32), HMMA.16816.F16 (FP16→FP16)
- SFU (Special Function Unit): exp, sin, cos, rsqrt — lower throughput but hardware accelerated
- FP32 ALU: standard arithmetic (FADD, FMUL, FFMA)
- FP16 ALU: HFMA2 — processes 2 FP16 values per instruction
- Selection criteria: throughput, latency, precision, available units

<InstructionSelectionDemo client:visible />

### Peephole Optimization
- Local instruction-level optimization after initial selection
- Strength reduction: mul by power-of-2 → shift; div by constant → mul by reciprocal
- Instruction merging: separate mul + add → FMA (fused multiply-add)
- Dead code elimination at instruction level
- Example: `x * 2.0 + y` → `FFMA(x, 2.0, y)` — one instruction instead of two

## Vectorization
### SIMD 映射
- CPU: explicit SIMD (SSE, AVX, NEON)
- GPU: SIMT model — threads execute same instruction on different data
- GPU "vectorization" = wider memory loads (float4 vs float)

### 向量化内存访问
- Scalar load: 4 bytes, one memory transaction per element
- float2 load: 8 bytes, halves the number of transactions
- float4 load: 16 bytes, quarter the transactions
- Impact: 2-4x improvement in memory bandwidth utilization
- Alignment requirements: float4 needs 16-byte aligned addresses

<VectorizationDemo client:visible />

### Vectorization Legality
- Dependencies: elements in vector must be independent
- Alignment: load/store address must be aligned to vector width
- Stride: only stride-1 access patterns can be vectorized directly
- Non-contiguous patterns: gather/scatter (much slower)

## Register Allocation
### GPU Register File 特性
- A100: 65536 32-bit registers per SM, shared by all warps
- Each thread can use up to 255 registers (hardware limit)
- Register usage directly controls occupancy: more regs per thread → fewer warps → lower occupancy
- GPU vs CPU: GPU reg spill → local memory (through L1/L2 to DRAM), extremely expensive

### Register Pressure vs Occupancy 权衡
- Low register usage: high occupancy → many warps → good latency hiding
- High register usage: low occupancy → few warps → poor latency hiding, BUT more data reuse in registers
- Sweet spot: enough registers for data reuse without crippling occupancy
- Rule of thumb: 32-64 registers per thread is typical sweet spot for compute-bound kernels

<RegisterPressureVisualizer client:visible />

### Fusion 和 Tiling 对 Register Pressure 的影响
- More fusion → more intermediate values in registers → higher pressure
- Larger tiles → more data staged in registers → higher pressure
- Register spill: when pressure exceeds limit, compiler spills to local memory
- Local memory path: register → L1 cache → L2 cache → DRAM (worst case)
- Performance cliff: a few extra registers can cause spill → dramatic slowdown

### 编译器的 Register Allocation 策略
- LLVM's register allocator: graph coloring based
- GPU-specific: balance register count vs occupancy
- Triton: compiler controls register allocation through tile size selection
- User control: `#pragma unroll`, `__launch_bounds__()` in CUDA

## 实际案例：GELU Kernel 的 Codegen
- GELU(x) = 0.5 * x * (1 + tanh(sqrt(2/π) * (x + 0.044715 * x³)))
- Step 1: IR → instruction selection (FFMA for polynomial, MUFU for tanh)
- Step 2: Vectorize loads (float4 for input/output)
- Step 3: Register allocation (12 regs per thread → ~80% occupancy)
- Step 4: Final PTX showing the instruction mix

## 总结
- Instruction selection maps IR to hardware: choose between Tensor Core, ALU, SFU
- Vectorization widens memory access: float4 loads for 4x bandwidth
- Register allocation balances reuse vs occupancy: the key performance tradeoff
- These three work together in the codegen pipeline
- Next article: Triton compilation pipeline and compiler backends

## 延伸阅读
- NVIDIA PTX ISA documentation — complete GPU instruction reference
- LLVM Code Generator documentation — SelectionDAG and GlobalISel
- CUTLASS source code — production multi-level code generation
- NVIDIA programming guide — hardware implementation details
- Triton paper — intermediate language for tiled computations
```

### Step 5: Write codegen-instruction-selection.mdx (en)

Same structure as zh version but in English. Key differences:
- `locale: en` in frontmatter
- `title: "Code Generation (Part I): Instruction Selection, Vectorization & Register Allocation"`
- All components get `locale="en"` prop
- `<CompilerStackMap mode="compact" currentArticle="codegen-instruction-selection" locale="en" client:visible />`
- All prose in English
- Same references

### Step 6: Verify Article 12

- [ ] Run `npm run validate`
- [ ] Run `npm run dev` and visit `/zh/articles/codegen-instruction-selection` and `/en/articles/codegen-instruction-selection`
- [ ] Verify all 3 components render and are interactive
- [ ] Verify CompilerStackMap highlights correct article
- [ ] Spot-check: A100 register counts (65536 per SM, 255 per thread max), instruction names (HMMA, MUFU, FADD)

### Step 7: Commit

```bash
git add src/components/interactive/InstructionSelectionDemo.tsx \
        src/components/interactive/RegisterPressureVisualizer.tsx \
        src/components/interactive/VectorizationDemo.tsx \
        src/content/articles/zh/codegen-instruction-selection.mdx \
        src/content/articles/en/codegen-instruction-selection.mdx
git commit -m "feat(graph-compilation): add Article 12 — Codegen Instruction Selection with InstructionSelectionDemo, RegisterPressureVisualizer, VectorizationDemo"
```

---

## Task 4: Article 13 — 代码生成（下）：Triton Pipeline、编译器后端与数值正确性 (codegen-triton-backend)

Deep dive into Triton's compilation pipeline, different compiler backends, and numerical correctness issues. This is a horizontal stage article completing the codegen pipeline. 4 interactive components + bilingual MDX.

**Files:**
- Create: `src/components/interactive/TritonCompilationPipeline.tsx`
- Create: `src/components/interactive/CodegenExplorer.tsx`
- Create: `src/components/interactive/BackendComparison.tsx`
- Create: `src/components/interactive/NumericalAccuracyDemo.tsx`
- Create: `src/content/articles/zh/codegen-triton-backend.mdx`
- Create: `src/content/articles/en/codegen-triton-backend.mdx`

### Step 1: Implement TritonCompilationPipeline

Animated pipeline visualization showing the Triton compilation flow: Python DSL → Triton IR → Triton GPU IR → LLVM IR → PTX → cubin. Each stage shows a representative code snippet.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
interface PipelineStage {
  id: string;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  codeSnippet: string;  // representative code at this stage
  color: string;
  transform: { zh: string; en: string };  // what transformation happens to reach this stage
}

const STAGES: PipelineStage[] = [
  {
    id: 'python',
    label: { zh: 'Triton Python DSL', en: 'Triton Python DSL' },
    description: {
      zh: '用户编写的 Python 代码，使用 @triton.jit 装饰器和 tl.* API',
      en: 'User-written Python code with @triton.jit decorator and tl.* APIs',
    },
    codeSnippet: `@triton.jit
def add_kernel(x_ptr, y_ptr, out_ptr,
               N, BLOCK: tl.constexpr):
    pid = tl.program_id(0)
    offs = pid * BLOCK + tl.arange(0, BLOCK)
    mask = offs < N
    x = tl.load(x_ptr + offs, mask=mask)
    y = tl.load(y_ptr + offs, mask=mask)
    tl.store(out_ptr + offs, x + y, mask=mask)`,
    color: HEAD_COLORS[0],
    transform: { zh: '', en: '' },
  },
  {
    id: 'triton_ir',
    label: { zh: 'Triton IR', en: 'Triton IR' },
    description: {
      zh: 'SSA 形式的中间表示，保留 block 语义，类型信息完整',
      en: 'SSA-form intermediate representation, retains block semantics, full type info',
    },
    codeSnippet: `tt.func @add_kernel(%x: !tt.ptr<f32>,
                   %y: !tt.ptr<f32>,
                   %out: !tt.ptr<f32>, %N: i32) {
  %pid = tt.get_program_id {axis=0} : i32
  %offs = tt.make_range {start=0, end=1024}
  %x_ptrs = tt.addptr %x, %offs
  %x_val = tt.load %x_ptrs, %mask
  ...
}`,
    color: HEAD_COLORS[1],
    transform: { zh: 'Python AST 解析 + 类型推导', en: 'Python AST parsing + type inference' },
  },
  {
    id: 'triton_gpu_ir',
    label: { zh: 'Triton GPU IR', en: 'Triton GPU IR' },
    description: {
      zh: '硬件映射层：确定 block → warp → thread 的映射，插入共享内存操作',
      en: 'Hardware mapping: determines block → warp → thread mapping, inserts shared memory ops',
    },
    codeSnippet: `tt.func @add_kernel(...)
    attributes {num_warps=4, threads_per_warp=32} {
  %pid = tt.get_program_id {axis=0} : i32
  // Blocked layout: 4 warps × 32 threads
  %x_val = tt.load %x_ptrs, %mask
      {layout = #ttg.blocked<{sizePerThread=[4],
                               threadsPerWarp=[32],
                               warpsPerCTA=[4]}}>
  ...
}`,
    color: HEAD_COLORS[2],
    transform: { zh: 'Layout 分配 + Warp 映射 + Shared Memory 插入', en: 'Layout assignment + Warp mapping + Shared memory insertion' },
  },
  {
    id: 'llvm_ir',
    label: { zh: 'LLVM IR', en: 'LLVM IR' },
    description: {
      zh: '通过 MLIR 转换为 LLVM IR，block 语义完全展开为标量/向量操作',
      en: 'Converted to LLVM IR via MLIR, block semantics fully expanded to scalar/vector ops',
    },
    codeSnippet: `define void @add_kernel(ptr %x, ptr %y,
                        ptr %out, i32 %N) {
  %tid = call i32 @llvm.nvvm.read.ptx.sreg.tid.x()
  %pid = call i32 @llvm.nvvm.read.ptx.sreg.ctaid.x()
  %idx = add i32 %base, %tid
  %xp = getelementptr float, ptr %x, i32 %idx
  %xv = load <4 x float>, ptr %xp
  ...
}`,
    color: HEAD_COLORS[3],
    transform: { zh: 'MLIR Lowering: Triton Dialect → LLVM Dialect', en: 'MLIR Lowering: Triton Dialect → LLVM Dialect' },
  },
  {
    id: 'ptx',
    label: { zh: 'PTX Assembly', en: 'PTX Assembly' },
    description: {
      zh: 'NVIDIA 虚拟指令集，human-readable 汇编，最后一层可移植表示',
      en: 'NVIDIA virtual ISA, human-readable assembly, last portable representation',
    },
    codeSnippet: `.visible .entry add_kernel(
  .param .u64 x_ptr, .param .u64 y_ptr,
  .param .u64 out_ptr, .param .u32 N) {
  mov.u32 %r1, %tid.x;
  mov.u32 %r2, %ctaid.x;
  mad.lo.s32 %r3, %r2, 1024, %r1;
  ld.global.v4.f32 {%f1,%f2,%f3,%f4}, [%rd1];
  add.f32 %f5, %f1, %f9;
  st.global.v4.f32 [%rd3], {%f5,%f6,%f7,%f8};
}`,
    color: HEAD_COLORS[4],
    transform: { zh: 'LLVM Backend: NVPTX CodeGen', en: 'LLVM Backend: NVPTX CodeGen' },
  },
  {
    id: 'cubin',
    label: { zh: 'cubin (机器码)', en: 'cubin (Machine Code)' },
    description: {
      zh: 'GPU 可直接执行的二进制，由 ptxas 汇编器生成',
      en: 'GPU-executable binary, assembled by ptxas',
    },
    codeSnippet: `ELF 64-bit LSB executable
CUDA binary (cubin)
Architecture: sm_80 (A100)
Code size: 1,248 bytes
Registers: 24 per thread
Shared memory: 0 bytes
Max threads: 1024`,
    color: HEAD_COLORS[5],
    transform: { zh: 'ptxas 汇编器: PTX → SASS → cubin', en: 'ptxas assembler: PTX → SASS → cubin' },
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 540`
- Top: title
- **Main layout: horizontal pipeline** — 6 stages arranged left-to-right as boxes connected by arrows:
  - Each stage box: colored header with label, small icon
  - Clicking a stage box selects it and shows its detail below
  - Arrow between stages shows the transformation name
  - Active stage has full opacity + border glow; others at 0.4 opacity
  - Animate arrows with flowing dots (data moving through pipeline)
- **Detail panel (y=200..530):** Expands for selected stage:
  - Left: description text
  - Right: code snippet in monospace, with syntax-highlighted keywords (use bold for keywords like `def`, `func`, `define`, `.entry`)
  - Background: light tint of stage's color
- Auto-advance option: Play button cycles through stages every 3s
- **Navigation:** Use clickable stage boxes as primary navigation (matches pipeline mental model — "click stage to inspect"). Do NOT also add StepNavigator (dual navigation is confusing). Keep Play button for guided auto-advance.

**Key implementation details:**
- Stage boxes are `<g>` with click handlers, arranged horizontally with equal spacing
- Pipeline arrows use `<line>` or `<path>` with arrowhead marker
- Code snippets: split by `\n`, render each line as `<text>` element at incrementing y
- Flowing dots on arrows: small `<motion.circle>` with `animate={{ x: [startX, endX] }}` repeating

### Step 2: Implement CodegenExplorer

Interactive demo showing how TorchInductor generates Triton kernel code from a small FX Graph. User can modify the FX Graph (select from presets) and see the generated Triton code.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
interface CodegenExample {
  id: string;
  label: { zh: string; en: string };
  fxGraph: string;        // FX graph pseudocode
  tritonCode: string;     // generated Triton kernel
  highlights: { line: number; description: { zh: string; en: string } }[];
  stats: {
    kernelCount: number;
    regsPerThread: number;
    sharedMemory: number; // bytes
  };
}

const EXAMPLES: CodegenExample[] = [
  {
    id: 'elementwise',
    label: { zh: 'Element-wise 融合', en: 'Element-wise Fusion' },
    fxGraph: `# FX Graph
x = placeholder('x')    # [1024, 768]
t1 = relu(x)
t2 = mul(t1, 0.5)
y = add(t2, bias)
output(y)`,
    tritonCode: `@triton.jit
def fused_relu_mul_add(
    x_ptr, bias_ptr, out_ptr,
    N, BLOCK: tl.constexpr = 1024
):
    pid = tl.program_id(0)
    offs = pid * BLOCK + tl.arange(0, BLOCK)
    mask = offs < N

    # Load (1 HBM read)
    x = tl.load(x_ptr + offs, mask=mask)
    bias = tl.load(bias_ptr + offs % 768, mask=mask)

    # Fused computation (all in registers)
    t1 = tl.maximum(x, 0.0)   # relu
    t2 = t1 * 0.5              # mul
    y = t2 + bias              # add

    # Store (1 HBM write)
    tl.store(out_ptr + offs, y, mask=mask)`,
    highlights: [
      { line: 10, description: { zh: '单次 HBM 读取，避免中间 tensor 写回', en: 'Single HBM read, avoids intermediate tensor writeback' } },
      { line: 13, description: { zh: '3 个操作在 register 中完成，零额外内存开销', en: '3 ops completed in registers, zero extra memory overhead' } },
    ],
    stats: { kernelCount: 1, regsPerThread: 12, sharedMemory: 0 },
  },
  {
    id: 'reduction',
    label: { zh: 'Reduction (LayerNorm)', en: 'Reduction (LayerNorm)' },
    fxGraph: `# FX Graph
x = placeholder('x')       # [32, 768]
mean = reduce_mean(x, -1)   # [32]
var = reduce_var(x, -1)     # [32]
x_norm = (x - mean) / sqrt(var + eps)
y = x_norm * gamma + beta
output(y)`,
    tritonCode: `@triton.jit
def fused_layernorm(
    x_ptr, gamma_ptr, beta_ptr, out_ptr,
    N, D, eps, BLOCK_D: tl.constexpr = 768
):
    row = tl.program_id(0)
    offs = tl.arange(0, BLOCK_D)
    x_ptrs = x_ptr + row * D + offs

    # Load entire row
    x = tl.load(x_ptrs, mask=offs < D)

    # Compute mean and var (reduction in registers)
    mean = tl.sum(x, axis=0) / D
    x_centered = x - mean
    var = tl.sum(x_centered * x_centered, axis=0) / D

    # Normalize
    x_norm = x_centered / tl.sqrt(var + eps)

    # Scale and shift
    gamma = tl.load(gamma_ptr + offs, mask=offs < D)
    beta = tl.load(beta_ptr + offs, mask=offs < D)
    y = x_norm * gamma + beta

    tl.store(out_ptr + row * D + offs, y, mask=offs < D)`,
    highlights: [
      { line: 11, description: { zh: '整行数据一次性加载到 register', en: 'Entire row loaded into registers at once' } },
      { line: 14, description: { zh: 'Mean 和 Var 在 register 中计算，无需写回 HBM', en: 'Mean and Var computed in registers, no HBM writeback needed' } },
    ],
    stats: { kernelCount: 1, regsPerThread: 48, sharedMemory: 0 },
  },
  {
    id: 'matmul',
    label: { zh: 'MatMul + Bias + ReLU', en: 'MatMul + Bias + ReLU' },
    fxGraph: `# FX Graph
x = placeholder('x')      # [128, 768]
w = placeholder('w')      # [768, 3072]
bias = placeholder('bias') # [3072]
mm = matmul(x, w)
t1 = add(mm, bias)
y = relu(t1)
output(y)`,
    tritonCode: `@triton.jit
def fused_mm_bias_relu(x_ptr, w_ptr,
    bias_ptr, out_ptr, M, N, K, ...):
    pid_m, pid_n = tl.program_id(0), tl.program_id(1)
    acc = tl.zeros((BLOCK_M, BLOCK_N), dtype=tl.float32)
    for k in range(0, K, BLOCK_K):
        a = tl.load(...)  # [BLOCK_M, BLOCK_K]
        b = tl.load(...)  # [BLOCK_K, BLOCK_N]
        acc += tl.dot(a, b)  # Tensor Core MMA
    # Epilogue: bias + relu (fused, in registers)
    bias = tl.load(bias_ptr + n_offs)
    acc = tl.maximum(acc + bias, 0.0)  # relu
    tl.store(out_ptr + ..., acc)`,
    highlights: [
      { line: 13, description: { zh: 'FP32 累加器，避免 FP16 精度损失', en: 'FP32 accumulator, avoids FP16 precision loss' } },
      { line: 18, description: { zh: 'tl.dot 映射到 Tensor Core MMA 指令', en: 'tl.dot maps to Tensor Core MMA instructions' } },
      { line: 21, description: { zh: 'Epilogue fusion: bias + relu 在 register 中完成', en: 'Epilogue fusion: bias + relu completed in registers' } },
    ],
    stats: { kernelCount: 1, regsPerThread: 64, sharedMemory: 32768 },
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 600` (taller to accommodate code panels)
- Top: title + 3-button example selector (Element-wise / Reduction / MatMul)
- **Code length limit:** Cap all code snippets at 15 lines max. Trim boilerplate (parameter declarations, BLOCK definitions) and focus on computation core. If full code is needed, the article text can show the complete version.
- **Split layout:**
  - Left panel (x=20..380): **FX Graph** — code box with light blue background, monospace text, each line numbered
  - Right panel (x=400..780): **Generated Triton Kernel** — code box with light green background, monospace text, each line numbered
    - Highlighted lines (from `highlights` array) get a colored left-border stripe and tooltip showing description
  - Center: animated arrow "TorchInductor Codegen →" connecting left to right
- **Bottom (y=480..550): Stats bar** — 3 inline metrics:
  - Kernel count: N
  - Registers/thread: N
  - Shared memory: N KB
  - Each with a small icon

**Key implementation details:**
- Code rendering: split by `\n`, each line as `<text>` at incrementing y, with line numbers in gray
- Highlighted lines: semi-transparent colored `<rect>` behind the text line
- Click a highlighted line → show description tooltip (positioned next to the line)
- Smooth transitions between examples using `AnimatePresence`

### Step 3: Implement BackendComparison

Interactive comparison table of different compiler backends: TorchInductor+Triton, XLA, TensorRT, IREE, showing their positioning, target hardware, pros/cons.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
interface Backend {
  id: string;
  name: string;
  icon: string;   // emoji or letter for visual distinction
  ecosystem: string;
  target: string;  // "NVIDIA GPU" | "Multi-backend" | etc.
  compilationModel: string;  // "JIT" | "AOT" | "Both"
  fusionStrategy: string;
  strengths: { zh: string[]; en: string[] };
  weaknesses: { zh: string[]; en: string[] };
  bestFor: { zh: string; en: string };
  color: string;
}

const BACKENDS: Backend[] = [
  {
    id: 'inductor',
    name: 'TorchInductor + Triton',
    icon: '🔥',
    ecosystem: 'PyTorch',
    target: 'NVIDIA GPU (primary), CPU',
    compilationModel: 'JIT',
    fusionStrategy: 'Greedy (fast compile)',
    strengths: {
      zh: ['单 kernel 编译速度快 (< 100ms/kernel，整体模型秒级)', 'Python-native，调试友好', '动态 shape 支持好', '与 PyTorch 生态无缝集成'],
      en: ['Fast per-kernel compilation (< 100ms/kernel, full model in seconds)', 'Python-native, debug-friendly', 'Good dynamic shape support', 'Seamless PyTorch ecosystem integration'],
    },
    weaknesses: {
      zh: ['主要支持 NVIDIA GPU', '融合策略非全局最优', '生成代码性能略低于手写 CUDA'],
      en: ['Primarily NVIDIA GPU', 'Fusion strategy not globally optimal', 'Generated code slightly slower than hand-written CUDA'],
    },
    bestFor: { zh: '研发迭代、动态 shape 模型、PyTorch 用户', en: 'R&D iteration, dynamic shape models, PyTorch users' },
    color: HEAD_COLORS[0],
  },
  {
    id: 'xla',
    name: 'XLA',
    icon: 'X',
    ecosystem: 'TensorFlow / JAX',
    target: 'TPU, NVIDIA GPU, CPU',
    compilationModel: 'AOT (primarily)',
    fusionStrategy: 'Graph Coloring (globally optimal)',
    strengths: {
      zh: ['全局最优融合', 'TPU 原生支持', '成熟稳定', 'JAX 生态核心'],
      en: ['Globally optimal fusion', 'Native TPU support', 'Mature and stable', 'Core of JAX ecosystem'],
    },
    weaknesses: {
      zh: ['编译时间长 (> 1s)', '动态 shape 支持有限', 'PyTorch 集成需要额外桥接层'],
      en: ['Long compilation time (> 1s)', 'Limited dynamic shape support', 'PyTorch integration requires bridge layer'],
    },
    bestFor: { zh: '静态 shape 模型、TPU 训练、JAX 用户', en: 'Static shape models, TPU training, JAX users' },
    color: HEAD_COLORS[1],
  },
  {
    id: 'tensorrt',
    name: 'TensorRT',
    icon: 'T',
    ecosystem: 'NVIDIA',
    target: 'NVIDIA GPU only',
    compilationModel: 'AOT',
    fusionStrategy: 'Rule-based + Cost model',
    strengths: {
      zh: ['NVIDIA GPU 上性能最优', '量化支持完善 (INT8/FP8)', '推理延迟极低', '丰富的预优化 kernel 库'],
      en: ['Best performance on NVIDIA GPU', 'Excellent quantization (INT8/FP8)', 'Ultra-low inference latency', 'Rich pre-optimized kernel library'],
    },
    weaknesses: {
      zh: ['仅支持 NVIDIA GPU', '编译时间很长', '动态 shape 支持有限', '不支持训练'],
      en: ['NVIDIA GPU only', 'Very long compilation time', 'Limited dynamic shape support', 'No training support'],
    },
    bestFor: { zh: '生产推理部署、低延迟要求、NVIDIA 硬件', en: 'Production inference, low-latency requirements, NVIDIA hardware' },
    color: HEAD_COLORS[2],
  },
  {
    id: 'iree',
    name: 'IREE',
    icon: 'I',
    ecosystem: 'MLIR-native',
    target: 'CPU, GPU (Vulkan/CUDA/ROCm), mobile',
    compilationModel: 'AOT',
    fusionStrategy: 'MLIR-based (linalg fusion)',
    strengths: {
      zh: ['真正的跨平台 (Vulkan/CUDA/ROCm/CPU)', 'MLIR-native，方言扩展灵活', '轻量级运行时', '适合嵌入式和移动端'],
      en: ['True cross-platform (Vulkan/CUDA/ROCm/CPU)', 'MLIR-native, flexible dialect extension', 'Lightweight runtime', 'Suitable for embedded and mobile'],
    },
    weaknesses: {
      zh: ['NVIDIA GPU 性能不如 TensorRT/Triton', '生态系统较小', '文档和社区相对不成熟'],
      en: ['Lower NVIDIA GPU perf than TensorRT/Triton', 'Smaller ecosystem', 'Documentation and community less mature'],
    },
    bestFor: { zh: '跨平台部署、MLIR 研究、嵌入式推理', en: 'Cross-platform deployment, MLIR research, embedded inference' },
    color: HEAD_COLORS[3],
  },
];
```

**Rendering approach:**

- SVG viewBox `0 0 800 520`
- Top: title
- **Main area: interactive comparison cards** — 4 cards in a 2×2 grid:
  - Each card (approx 370×220): colored header with backend name + icon
  - Body: ecosystem, target hardware, compilation model, fusion strategy (key-value pairs)
  - Click a card to select it → expands to show strengths/weaknesses/bestFor
- **Bottom (y=460..510):** Selected backend's "Best For" summary in a highlighted box
- Only one card expanded at a time; clicking another collapses the current
- Cards use `<motion.g>` for expand/collapse animation (height transition)
- Strengths: green checkmarks; Weaknesses: orange warning icons

**Key implementation details:**
- 2×2 grid layout: card positions computed from index `(i%2 * cardWidth, Math.floor(i/2) * cardHeight)`
- Expanded card overlays others (higher z via SVG ordering — move to end of children)
- Compact view: name + ecosystem + target only; Expanded view: adds strengths, weaknesses, bestFor
- Card border color matches backend's `color`

### Step 4: Implement NumericalAccuracyDemo

Interactive demonstration of how compiler optimizations can change numerical results due to floating-point non-associativity. User can toggle optimizations and see how results diverge.

**Props interface:**

```tsx
interface Props {
  locale?: 'zh' | 'en';
}
```

**Data model:**

```tsx
interface OptimizationToggle {
  id: string;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  enabled: boolean;
  resultDelta: number;  // how much this optimization changes the result (in ULP or absolute)
}

// Demonstrate with a concrete computation: sum of 8 float32 values
// Different reduction orders give different results due to non-associativity
// Use 1e-8: clearly below FP32 ULP at 1.0 (~1.19e-7), so 1.0 + 1e-8 = 1.0 (absorbed)
// This makes the non-associativity unambiguous: order matters dramatically
const VALUES = [1.0, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8];

interface ReductionOrder {
  id: string;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  computeResult: () => number;
  tree: string;  // visual tree representation
}

const REDUCTION_ORDERS: ReductionOrder[] = [
  {
    id: 'left_to_right',
    label: { zh: '顺序求和 (left-to-right)', en: 'Sequential sum (left-to-right)' },
    description: {
      zh: '((((((1.0 + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8',
      en: '((((((1.0 + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8',
    },
    computeResult: () => {
      let sum = VALUES[0];
      for (let i = 1; i < VALUES.length; i++) sum += VALUES[i];
      return sum;  // Many small values lost due to absorption into large value
    },
    tree: 'sequential',
  },
  {
    id: 'pairwise',
    label: { zh: '成对求和 (pairwise)', en: 'Pairwise sum' },
    description: {
      zh: '先将小值两两求和，再与大值合并：((1e-8+1e-8) + (1e-8+1e-8)) + ...',
      en: 'Pair small values first, then combine with large: ((1e-8+1e-8) + (1e-8+1e-8)) + ...',
    },
    computeResult: () => {
      // Pairwise reduction preserves more precision
      const small = VALUES.slice(1);
      let level = [...small];
      while (level.length > 1) {
        const next = [];
        for (let i = 0; i < level.length; i += 2) {
          next.push(level[i] + (level[i + 1] || 0));
        }
        level = next;
      }
      return VALUES[0] + level[0];
    },
    tree: 'pairwise',
  },
  {
    id: 'reversed',
    label: { zh: '反向求和 (small-first)', en: 'Reversed sum (small-first)' },
    description: {
      zh: '先累加所有小值，最后加大值：(1e-8 + 1e-8 + ... + 1e-8) + 1.0',
      en: 'Accumulate small values first, then add large: (1e-8 + 1e-8 + ... + 1e-8) + 1.0',
    },
    computeResult: () => {
      let sum = 0;
      for (let i = VALUES.length - 1; i >= 1; i--) sum += VALUES[i];
      return sum + VALUES[0];  // Best precision: small values don't get absorbed
    },
    tree: 'reversed',
  },
];

// Additional demo: FP16 vs FP32 accumulation
interface PrecisionComparison {
  label: { zh: string; en: string };
  fp16Result: string;   // "approximate" result with FP16 accumulation
  fp32Result: string;   // "correct" result with FP32 accumulation
  ulpDifference: number;
}
```

**Rendering approach:**

- SVG viewBox `0 0 800 520`
- Top: title + 3-button reduction order selector
- **Upper section (y=60..280): Reduction tree visualization**
  - Show the computation as a binary tree of additions
  - Sequential: linear chain (deeply nested left)
  - Pairwise: balanced binary tree
  - Reversed: linear chain (small values first)
  - Each node shows intermediate sum value (truncated to show precision loss)
  - Nodes where precision loss occurs highlighted in orange/red
  - Tree nodes are `<circle>` + `<text>` connected by `<line>`
  - Animate tree structure change when switching order
- **Middle section (y=290..380): Results comparison**
  - 3 horizontal bars showing results from each reduction order
  - Current order highlighted, show exact float value in monospace
  - Difference from "true" value (computed in higher precision) shown as red delta
  - Visual: bars representing the last significant digits, showing where values diverge
- **Lower section (y=390..510): Mixed precision demo**
  - Toggle: "FP16 accumulation" vs "FP32 accumulation" for a matmul
  - Show that FP16 accumulation can lose significant digits in large reductions
  - Display: `FP16 acc: 512.0` vs `FP32 acc: 512.0625` with relative error

**Key implementation details:**
- Tree layout: computed recursively based on reduction order type
- Node positions animated with `<motion.circle>` and `<motion.line>` for smooth transitions
- Precision loss nodes: use `COLORS.orange` or `COLORS.red` based on magnitude of error
- Float values displayed with `toFixed(10)` or scientific notation to show precision differences
- Note: JavaScript uses Float64, so to simulate Float32 behavior use `Math.fround()` for each intermediate result

### Step 5: Write codegen-triton-backend.mdx (zh)

**Frontmatter:**

```yaml
---
title: "代码生成（下）：Triton Pipeline、编译器后端与数值正确性"
slug: codegen-triton-backend
locale: zh
tags: [compiler, codegen, triton, llvm, ptx, numerical-accuracy, backends]
prerequisites: [codegen-instruction-selection]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations"
    url: "https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf"
  - type: website
    title: "Triton Language Documentation"
    url: "https://triton-lang.org/main/index.html"
  - type: website
    title: "MLIR GPU Dialect"
    url: "https://mlir.llvm.org/docs/Dialects/GPU/"
  - type: website
    title: "IREE Compiler and Runtime"
    url: "https://iree.dev/"
  - type: website
    title: "TensorRT Developer Guide"
    url: "https://docs.nvidia.com/deeplearning/tensorrt/developer-guide/index.html"
  - type: website
    title: "What Every Computer Scientist Should Know About Floating-Point Arithmetic"
    url: "https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html"
---
```

**Content structure** (full article, minimum 3000 words):

```
import CompilerStackMap
import TritonCompilationPipeline
import CodegenExplorer
import BackendComparison
import NumericalAccuracyDemo

<CompilerStackMap mode="compact" currentArticle="codegen-triton-backend" client:visible />

## 简介
- This article completes the codegen story: from Triton DSL to executable binary
- Three topics: Triton pipeline, compiler backends, numerical correctness
- Triton is the intersection point of PyTorch and MLIR ecosystems

## Triton 深入剖析
### Triton 的定位
- Between CUDA C and compiler IR: block-level programming
- User writes at block granularity (not thread-level), compiler handles thread mapping
- Key abstraction: tl.load/store (explicit memory), tl.dot (matmul), tl.where (conditional)
- Why Triton matters: democratizes GPU kernel writing

### 编程模型
- @triton.jit decorator → triggers compilation
- tl.program_id(axis) — block index
- tl.arange(start, end) — create index range
- tl.load(ptr, mask) / tl.store(ptr, value, mask) — memory access
- tl.dot(a, b) — maps to Tensor Core MMA
- tl.constexpr — compile-time constants (BLOCK_SIZE)
- Code example: vector addition kernel

### Triton 编译管线

<TritonCompilationPipeline client:visible />

- Stage 1: Python AST → Triton IR (SSA form, block semantics preserved)
- Stage 2: Triton IR → Triton GPU IR (hardware mapping: layout assignment, warp mapping)
- Stage 3: Triton GPU IR → LLVM IR (via MLIR lowering: Triton Dialect → LLVM Dialect)
- Stage 4: LLVM IR → PTX (LLVM NVPTX backend)
- Stage 5: PTX → cubin (ptxas assembler)
- Significance of MLIR migration: enables multi-backend (AMD, Intel) via shared infrastructure

## TorchInductor 的代码生成
### 从 FX Graph 到 Triton Kernel
- FX Graph: Python-level computation graph (after Dynamo capture)
- Inductor's lowering: group fused ops → generate Triton kernel source code
- Template-based vs programmatic codegen
- Wrapper code: scheduler (kernel launch order), memory allocation/free

<CodegenExplorer client:visible />

### 生成代码的可读性与调试
- TORCH_COMPILE_DEBUG=1: dump generated Triton source
- TRITON_INTERPRET=1: run Triton kernels in Python interpreter (slow but debuggable)
- Profile with NSight Compute: correlate generated PTX with hardware metrics
- Common debugging workflow: check generated code → compare with reference → profile

## MLIR 到 LLVM 的 Lowering
### LLVM Dialect 作为 MLIR 的出口
- MLIR's LLVM Dialect: mirrors LLVM IR types and operations
- memref → llvm.ptr conversion (buffer descriptor to raw pointer)
- Control flow lowering: scf.for → llvm branches
- Type conversion: tensor → memref → llvm.ptr + metadata

### 多后端代码生成
- GPU Dialect → NVVM Dialect → PTX (NVIDIA)
- GPU Dialect → ROCDL Dialect → GCN ISA (AMD)
- GPU Dialect → SPIR-V Dialect → SPIR-V binary (Intel / Vulkan)
- Same high-level optimization, different low-level targets

## 编译器后端对比

<BackendComparison client:visible />

### TorchInductor + Triton
- JIT compilation, fast compile, Python-native
- Best for: research, dynamic shapes, PyTorch ecosystem

### XLA
- AOT compilation, global optimization, TPU-native
- Best for: static shapes, TPU training, JAX ecosystem

### TensorRT
- AOT compilation, NVIDIA-optimized, production inference
- Best for: deployment, low latency, INT8/FP8 quantization

### IREE
- MLIR-native, cross-platform (Vulkan/CUDA/ROCm/CPU)
- Best for: edge deployment, MLIR research, portability

## 数值正确性与验证
### 浮点数的非结合性
- IEEE 754: (a + b) + c ≠ a + (b + c) in floating point
- Compiler reordering: fusion, tiling, reduction tree restructuring all change computation order
- Example: summing [1.0, 1e-8, 1e-8, ...] in FP32 — 1e-8 is below ULP at 1.0 (~1.19e-7), so order dramatically affects result

<NumericalAccuracyDemo client:visible />

### Fusion 和 Tiling 对数值的影响
- Fusion changes intermediate precision (e.g., FP16 intermediate vs FP32)
- Tiling changes reduction order (partial sums in tiles vs global sum)
- Mixed precision: FP16 inputs with FP32 accumulator is critical for accuracy

### 测试策略
- torch.compile correctness checking: compare eager vs compiled output
- Tolerance setting: atol (absolute) and rtol (relative)
- Common thresholds: FP32 (atol=1e-5, rtol=1.3e-6), FP16 (atol=1e-5, rtol=1e-3)
- torch.testing.assert_close() for validation
- TORCH_COMPILE_DEBUG for diagnosing numerical divergence

### 常见数值陷阱
- Softmax with large values → overflow in exp → NaN (fix: subtract max first)
- LayerNorm variance → negative due to catastrophic cancellation (fix: use Welford's algorithm)
- Loss scaling in mixed precision → underflow/overflow (fix: dynamic loss scaling)

## 总结
- Triton bridges high-level Python and low-level GPU hardware through 6 compilation stages
- TorchInductor generates readable Triton code from FX Graphs
- Multiple compiler backends serve different use cases (speed vs quality vs portability)
- Numerical correctness is a first-class concern: non-associativity, mixed precision, testing
- This completes the codegen pipeline. Next phase: quantization, distributed, scheduling, autotuning

## 延伸阅读
- Triton paper (Tillet et al., 2019) — original Triton design and implementation
- Triton documentation — tutorials and API reference
- MLIR GPU Dialect documentation — multi-backend lowering
- IREE documentation — MLIR-native compilation and runtime
- TensorRT Developer Guide — NVIDIA inference optimization
- Goldberg's paper — essential floating-point arithmetic reference
```

### Step 6: Write codegen-triton-backend.mdx (en)

Same structure as zh version but in English. Key differences:
- `locale: en` in frontmatter
- `title: "Code Generation (Part II): Triton Pipeline, Compiler Backends & Numerical Correctness"`
- All components get `locale="en"` prop
- `<CompilerStackMap mode="compact" currentArticle="codegen-triton-backend" locale="en" client:visible />`
- All prose in English
- Same references

### Step 7: Verify Article 13

- [ ] Run `npm run validate`
- [ ] Run `npm run dev` and visit `/zh/articles/codegen-triton-backend` and `/en/articles/codegen-triton-backend`
- [ ] Verify all 4 components render and are interactive
- [ ] Verify CompilerStackMap highlights correct article
- [ ] Spot-check: Triton compilation stages, backend comparison accuracy, float non-associativity demo

### Step 8: Commit

```bash
git add src/components/interactive/TritonCompilationPipeline.tsx \
        src/components/interactive/CodegenExplorer.tsx \
        src/components/interactive/BackendComparison.tsx \
        src/components/interactive/NumericalAccuracyDemo.tsx \
        src/content/articles/zh/codegen-triton-backend.mdx \
        src/content/articles/en/codegen-triton-backend.mdx
git commit -m "feat(graph-compilation): add Article 13 — Triton Backend & Numerical Correctness with TritonCompilationPipeline, CodegenExplorer, BackendComparison, NumericalAccuracyDemo"
```
