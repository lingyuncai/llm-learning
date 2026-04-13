# Graph Compilation & Optimization — Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Articles 14-17 of the graph-compilation-optimization learning path — covering Quantization Compilation, Distributed Compilation, Scheduling & Execution, and Autotuning & End-to-End with 12 interactive components and 8 MDX articles (zh + en).

**Architecture:** Each article gets 3 interactive React+SVG components following established Phase 1-3 patterns (locale prop, shared COLORS/FONTS, motion animations). Articles are bilingual MDX with CompilerStackMap navigation. Articles 14-15 are "进阶专题" (advanced topics) building on the core compilation pipeline; Articles 16-17 are "收束" articles covering execution-level concerns and full-path recap.

**Tech Stack:** Astro 5, MDX, React, TypeScript, Motion (`motion/react`), SVG, KaTeX

**Design Spec:** `docs/superpowers/specs/2026-04-12-graph-compilation-optimization-design.md`

**Phase 3 Plan (for reference):** `docs/superpowers/plans/2026-04-13-graph-compilation-phase3.md`

---

## Component Pattern Reference

All interactive components follow these conventions (established in Phase 1-3):

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
- Text wrapping: CJK splits at punctuation, English splits at word boundaries
- +/- buttons for numeric inputs (NOT SVG sliders)
- No CSS glow/shadow effects in SVG; use stroke/fill opacity instead

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
- Internal links use absolute paths: `/zh/articles/slug`
- Minimum 3000 words per article

## File Structure

### Components to Create (12 total)

```
src/components/interactive/
├── QuantFusionVisualizer.tsx        # Art.14 — quantization-aware fusion pipeline
├── MixedPrecisionGraph.tsx          # Art.14 — interactive mixed-precision Transformer layer
├── QuantKernelComparison.tsx        # Art.14 — quantized kernel performance comparison
├── ShardingPropagationDemo.tsx      # Art.15 — GSPMD-style sharding propagation animation
├── ParallelStrategyExplorer.tsx     # Art.15 — DP/TP/PP strategy comparison
├── CommunicationOverlapTimeline.tsx # Art.15 — compute-communication overlap visualization
├── KernelSchedulerDemo.tsx          # Art.16 — multi-stream kernel scheduling timeline
├── MemoryScheduleVisualizer.tsx     # Art.16 — execution order vs peak memory visualization
├── MultiBackendDispatch.tsx         # Art.16 — op dispatch to different backends
├── AutotuneExplorer.tsx             # Art.17 — interactive autotune parameter search
├── TransformDialectDemo.tsx         # Art.17 — MLIR Transform Dialect schedule scripting
└── CompileJourneyRecap.tsx          # Art.17 — end-to-end compilation journey recap
```

### Articles to Create (8 total)

```
src/content/articles/
├── zh/
│   ├── quantization-compilation.mdx       # Art.14 zh
│   ├── distributed-compilation.mdx        # Art.15 zh
│   ├── scheduling-execution.mdx           # Art.16 zh
│   └── autotuning-end-to-end.mdx          # Art.17 zh
└── en/
    ├── quantization-compilation.mdx       # Art.14 en
    ├── distributed-compilation.mdx        # Art.15 en
    ├── scheduling-execution.mdx           # Art.16 en
    └── autotuning-end-to-end.mdx          # Art.17 en
```

## Dependency Graph

```
Task 1 (Art.14: Quantization Compilation)     Task 2 (Art.15: Distributed Compilation)
    │                                              │
    └──────────────┬───────────────────────────────┘
                   ↓
          Task 3 (Art.16: Scheduling & Execution)
                   │  — references quantization kernels from Art.14
                   │  — references communication scheduling from Art.15
                   ↓
          Task 4 (Art.17: Autotuning & End-to-End)
                   — references ALL prior articles (recap)
```

Tasks 1 and 2 can run in **parallel** (no cross-references). Tasks 3 and 4 are sequential.

---

## Task 1: Article 14 — 量化编译与混合精度优化 (quantization-compilation)

Explain how compilers handle quantized computation graphs — the bridge between "how to quantize" (covered in the quantization learning path) and "how the compiler optimizes the quantized graph." 3 interactive components + bilingual MDX.

**Files:**
- Create: `src/components/interactive/QuantFusionVisualizer.tsx`
- Create: `src/components/interactive/MixedPrecisionGraph.tsx`
- Create: `src/components/interactive/QuantKernelComparison.tsx`
- Create: `src/content/articles/zh/quantization-compilation.mdx`
- Create: `src/content/articles/en/quantization-compilation.mdx`

**Prerequisites (existing articles this references):**
- `codegen-triton-backend` (Art.13 — kernel generation, Triton pipeline)
- `operator-fusion-cost-model` (Art.9 — fusion decisions)
- `quantization-fundamentals` (quantization learning path — data types, mapping)
- `ptq-weight-quantization` (quantization learning path — weight-only quantization)
- `inference-time-quantization` (quantization learning path — KV cache, activation quantization)

### Component 1: QuantFusionVisualizer

**Purpose:** Visualize how quantization-aware fusion absorbs dequant/quant nodes into compute kernels, dramatically reducing type conversion overhead.

**Layout:** SVG 800×520. Two-panel before/after view with animated transition.

**Left panel — "Before Fusion" (原始量化图):**
- A computation graph showing a typical quantized inference pattern:
  - `Dequant(W)` → `MatMul(X, W)` → `Quant(Y)` → `Dequant(Y)` → `LayerNorm` → `Quant` → `Dequant` → `ReLU` → `Quant`
- Each node is a rounded rect with:
  - Color coding: compute ops (COLORS.primary), dequant ops (COLORS.orange), quant ops (COLORS.red)
  - Precision label: "INT4", "FP16", "FP32" next to each edge
  - Node count badge: "9 ops, 4 type conversions"
- Edges show data flow with precision annotations

**Right panel — "After Fusion" (融合后):**
- Same computation condensed:
  - `QuantMatMul(X, W_int4)` — one fused kernel that does dequant+matmul+quant internally
  - `FusedLayerNorm_ReLU` — fused with quant/dequant absorbed
- Fused kernels shown with dashed inner boundaries indicating absorbed ops
- Node count badge: "3 ops, 0 external type conversions"
- Performance annotation: "~2.5x fewer memory round-trips"

**Interaction:**
- Toggle button to switch between 3 fusion patterns:
  1. "MatMul Fusion" — `Dequant → MatMul → Quant` → `QuantMatMul`
  2. "Epilogue Fusion" — `MatMul → Bias → ReLU → Quant` → `QuantMatMul_BiasReLU`
  3. "Full Layer Fusion" — entire Transformer sublayer
- Animated transition when toggling (nodes slide and merge)
- Hover on fused kernel → tooltip shows what ops were absorbed

**Data model:**
```tsx
interface FusionPattern {
  id: string;
  label: { zh: string; en: string };
  beforeNodes: GraphNode[];  // original graph nodes
  afterNodes: GraphNode[];   // fused graph nodes
  savings: { ops: string; conversions: string; memoryTrips: string };
}

interface GraphNode {
  id: string;
  label: string;
  type: 'compute' | 'quant' | 'dequant' | 'fused';
  precision: 'INT4' | 'INT8' | 'FP16' | 'FP32';
  x: number; y: number;
  absorbedOps?: string[];  // for fused nodes
}
```

**SVG structure:**
- Background rect for each panel
- Nodes: rounded rects with labels, color-coded by type
- Edges: paths with arrowheads, precision labels on midpoints
- Transition: `AnimatePresence` + `motion.g` for node position morphing
- Stats bar at bottom showing before/after metrics

### Component 2: MixedPrecisionGraph

**Purpose:** Interactive visualization of a Transformer layer's computation graph where each op is colored by its precision, and users can adjust precision policies to see the impact on quality and performance.

**Layout:** SVG 800×560. Main graph area + controls panel.

**Graph area (top, 800×380):**
- A simplified Transformer layer graph (one attention head + FFN):
  - QKV Projection (3 MatMuls) → Attention Score → Softmax → Attention Output → Output Projection → LayerNorm → FFN Up → GeLU → FFN Down → LayerNorm
- Each node is a rounded rect colored by precision:
  - FP32: COLORS.primary (blue)
  - FP16: COLORS.green
  - INT8: COLORS.orange
  - INT4: COLORS.red
- Edges show data flow, colored by the tensor precision on that edge
- Small precision badge ("FP16", "INT4") on each node

**Controls area (bottom, 800×160):**
- Three preset strategy buttons:
  1. "全 FP16" / "All FP16" — baseline, all nodes FP16
  2. "W4A16" — weight INT4, activation FP16 (weight-only quantization)
  3. "W8A8" — weight INT8, activation INT8
  4. "自定义" / "Custom" — enables per-op precision selection
- In custom mode: click a node to cycle its precision (FP32 → FP16 → INT8 → INT4)
- Metrics bar showing:
  - **Memory**: estimated relative memory usage (normalized to FP16 baseline = 100%)
  - **Throughput**: estimated relative throughput (higher = better)
  - **Quality Risk**: low/medium/high indicator based on which ops are quantized
    - Loss-sensitive ops (Softmax, LayerNorm) at low precision → high risk
    - MatMul at INT4 → medium risk
    - FFN at INT8 → low risk

**Quality risk rules (simplified model):**
```
Softmax at <FP16 → HIGH risk
LayerNorm at <FP16 → HIGH risk
Attention score at <FP16 → MEDIUM risk
MatMul at INT4 → MEDIUM risk (acceptable with good calibration)
MatMul at INT8 → LOW risk
FFN at INT8/INT4 → LOW risk
GeLU at <FP16 → MEDIUM risk
```

**Data model:**
```tsx
interface OpNode {
  id: string;
  label: string;
  category: 'matmul' | 'attention' | 'norm' | 'activation' | 'projection';
  precision: Precision;
  x: number; y: number;
  sensitivityLevel: 'high' | 'medium' | 'low'; // how sensitive to quantization
}

type Precision = 'FP32' | 'FP16' | 'INT8' | 'INT4';

interface StrategyPreset {
  id: string;
  label: { zh: string; en: string };
  precisions: Record<string, Precision>; // opId → precision
}
```

**SVG structure:**
- Nodes: rounded rects with `motion.rect` for color transitions when precision changes
- Edges: polyline paths
- Precision badges: small rects with text labels
- Metrics bar: three horizontal bars (memory, throughput, quality) with animated widths
- Color transition animation: `motion.rect` fill changes with `transition={{ duration: 0.3 }}`

### Component 3: QuantKernelComparison

**Purpose:** Compare quantized kernel performance across different precision formats and hardware targets. Shows that quantization's benefit is heavily hardware-dependent.

**Layout:** SVG 800×480. Bar chart with hardware/precision selector.

**Selector row (top):**
- Operation selector: `MatMul (4096×4096)` | `MatMul (1024×4096)` | `Attention (batch=32, seq=512, d=64)`
- Hardware buttons: `A100` | `H100`

**Main chart area:**
- Grouped bar chart comparing kernel performance:
  - X-axis: Precision formats — FP32, FP16, INT8, INT4, FP8 (E4M3)
  - Y-axis: Throughput (TFLOPS or effective TFLOPS)
  - For each precision, show:
    - Bar height = throughput
    - Label on bar: absolute value
    - Speedup annotation: "2.1x vs FP16" etc.
- Color: each precision gets a distinct color from HEAD_COLORS
- H100 adds FP8 bar (not available on A100)

**Key insight annotations:**
- "INT4 weight-only: throughput limited by dequant overhead" (for small batch sizes)
- "INT8: near-peak throughput with Tensor Core native support"
- "FP8 on H100: best throughput-accuracy tradeoff"

**Bottom stats panel:**
- For selected config: Memory bandwidth utilization %, Tensor Core utilization %, Memory savings vs FP16

**Data model:**
```tsx
interface KernelBenchmark {
  operation: string;
  hardware: 'A100' | 'H100';
  results: {
    precision: string;
    throughputTFLOPS: number;
    memoryBandwidthUtil: number;  // 0-100%
    tensorCoreUtil: number;       // 0-100%
    memorySavingsVsFP16: number;  // percentage
  }[];
}
```

**Benchmark data (peak theoretical specs, without sparsity, from NVIDIA datasheets):**

Values in TFLOPS (or TOPS for integer formats). Component should use these peaks with a note that achieved throughput is typically 60-80% of peak for large MatMuls.

| Format | A100 SXM | H100 SXM5 | Notes |
|--------|----------|-----------|-------|
| FP32 (non-TC) | 19.5 | 67 | Scalar CUDA cores only |
| TF32 (TC) | 156 | 989 | Tensor Core, reduced mantissa |
| FP16/BF16 (TC) | 312 | 1,979 | Tensor Core standard |
| INT8 (TC) | 624 | 1,979 | Tensor Core, INT32 accumulator |
| FP8 (TC) | — | 1,979 | H100+ only, E4M3/E5M2 |
| INT4 (effective)* | ~200-300 | ~600-800 | Weight-only, includes dequant overhead |

*INT4 weight-only quantization: no native INT4 Tensor Core op — kernel performs on-the-fly dequant to FP16, so effective throughput is bounded by memory bandwidth (weight loading) rather than compute peak. The exact throughput depends heavily on batch size and is typically lower than INT8.

**Key ratios to highlight in the component:**
- FP16 TC ≈ 16× FP32 (non-TC) — the "Tensor Core advantage"
- INT8 TC ≈ 2× FP16 TC — doubling from lower precision
- FP8 on H100 ≈ INT8 throughput, but with better numerical accuracy
- INT4 (weight-only) < INT8 despite lower bit-width, due to dequant overhead

**SVG structure:**
- Grouped bars with `motion.rect` for animated height on config change
- Axis labels, grid lines
- Speedup annotations as floating text above bars
- Bottom panel: three metric bars with labels

---

### MDX Article Content: quantization-compilation

**zh version — `src/content/articles/zh/quantization-compilation.mdx`**

**Frontmatter:**
```yaml
title: "量化编译与混合精度优化"
slug: quantization-compilation
locale: zh
tags: [compiler, quantization, mixed-precision, kernel-generation, fusion]
prerequisites: [codegen-triton-backend]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "A Survey of Quantization Methods for Efficient Neural Network Inference"
    url: "https://arxiv.org/abs/2103.13630"
  - type: paper
    title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-Trained Transformers"
    url: "https://arxiv.org/abs/2210.17323"
  - type: paper
    title: "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration"
    url: "https://arxiv.org/abs/2306.00978"
  - type: paper
    title: "FP8 Formats for Deep Learning"
    url: "https://arxiv.org/abs/2209.05433"
  - type: website
    title: "PyTorch Quantization Documentation"
    url: "https://pytorch.org/docs/stable/quantization.html"
  - type: website
    title: "TensorRT Quantization Toolkit"
    url: "https://docs.nvidia.com/deeplearning/tensorrt/developer-guide/index.html#working-with-int8"
```

**Content outline (minimum 3000 words):**

1. **简介** (~300 words)
   - 量化学习路径讲"怎么量化"（数据类型、PTQ、QAT），本文讲"编译器怎么处理量化后的计算图"
   - 关键问题：量化引入了大量 dequant/quant 类型转换 op，如果不优化，反而可能变慢
   - 编译器在量化推理中的三重角色：消除冗余转换（fusion）、选择最优精度策略（mixed-precision）、生成高效量化 kernel
   - 交叉引用：[量化基础](/zh/articles/quantization-fundamentals)（数据类型）、[PTQ](/zh/articles/ptq-weight-quantization)（权重量化方法）、[推理时量化](/zh/articles/inference-time-quantization)（KV cache/activation quantization）

2. **量化图的编译挑战** (~500 words)
   - 量化后的计算图长什么样：充满 `dequant → compute → quant` 的三明治结构
   - 混合精度的复杂性：同一模型中 FP32（loss-sensitive ops）+ FP16（general compute）+ INT8（matmul）+ INT4（weights）共存
   - 类型转换开销：每次 dequant/quant 都是一次额外的内存读写
   - 编译器需要的额外信息：scale/zero_point 参数、量化粒度（per-tensor vs per-channel vs per-group）、精度策略

3. **量化感知融合 (Quantization-Aware Fusion)** (~800 words)
   - 核心思想：将 dequant/quant 操作"吸收"进计算 kernel，消除中间类型转换
   - **Pattern 1: Weight Dequant Fusion**
     - `Dequant(W_int4) → MatMul(X_fp16, W_fp16)` → `QuantMatMul(X_fp16, W_int4)` with on-the-fly dequantization
     - Kernel 内部：加载 INT4 权重 → 在 register 中 dequant 到 FP16 → 直接参与 Tensor Core 计算
     - 省去的开销：一次完整的 FP16 weight tensor 写回 HBM
   - **Pattern 2: Epilogue Quant Fusion**
     - `MatMul → Bias → ReLU → Quant` → 单个 kernel 在 epilogue 阶段完成 bias+relu+quantize
     - 与 [算子融合](/zh/articles/operator-fusion-cost-model) 中的 epilogue fusion 原理相同，但加入了量化逻辑
   - **Pattern 3: Full Dequant-Compute-Quant Fusion**
     - 整条 `Dequant → Compute Chain → Quant` 融合为一个 kernel
     - 所有中间计算在 FP16/FP32 accumulator 中完成，只在 kernel 边界做精度转换

   <QuantFusionVisualizer client:visible />

4. **混合精度编译策略** (~600 words)
   - **Precision Propagation 算法**
     - 编译器遍历计算图，为每个 op 决定最优精度
     - 约束传播：Tensor Core 要求特定精度对齐（FP16×FP16→FP32、INT8×INT8→INT32）
     - Loss-sensitive ops 自动保持高精度：Softmax、LayerNorm、Residual Add
   - **Auto-Mixed-Precision (AMP) 的编译器视角**
     - 用户级 AMP（`torch.autocast`）：粗粒度，按 op 类型分配精度
     - 编译器级 AMP：细粒度，考虑数据流中的精度需求传播
     - TensorRT 的层级精度选择：profiling-based calibration
   - **精度-性能-质量三角**
     - 更低精度 → 更高吞吐 + 更低内存，但质量风险增加
     - 编译器的角色：在用户指定的质量约束下自动找最优精度配置

   <MixedPrecisionGraph client:visible />

5. **量化 Kernel 生成** (~600 words)
   - **Weight-Only Quantization Kernel**
     - INT4 weight, FP16 activation → 核心是 on-the-fly dequantization
     - CUDA kernel 结构：加载 packed INT4 → unpack → scale/zero_point → FP16 → Tensor Core
     - Memory-bound 特性：weight loading 是瓶颈，dequant 计算"几乎免费"
   - **Weight-Activation Quantization Kernel (W8A8)**
     - INT8 weight × INT8 activation → INT32 accumulator → FP16 output
     - Tensor Core 原生 INT8 支持（A100/H100）
     - 比 weight-only 更高吞吐，但需要 activation calibration
   - **FP8 Kernel (Hopper 架构)**
     - E4M3 (inference) vs E5M2 (training) 的不同用途
     - H100 的 FP8 Tensor Core：与 INT8 相同吞吐，但精度更好
     - Per-tensor vs per-channel scaling 的 kernel 差异
   - **Triton 对量化 kernel 的支持**
     - `tl.load` with packed format
     - Custom dequantization 在 Triton 中的实现
     - 与手写 CUDA kernel 的性能对比

   <QuantKernelComparison client:visible />

6. **实战：LLaMA 7B 量化推理的编译优化** (~400 words)
   - 端到端流程：模型量化（GPTQ/AWQ）→ 量化图构建 → 编译器优化 → 执行
   - 编译器优化带来的具体加速：
     - Quant fusion: ~1.5x
     - Mixed-precision optimization: ~1.2x
     - Kernel specialization: ~1.3x
     - 组合效果: ~2-3x vs naive quantized execution
   - 不同量化方案的编译器支持矩阵

7. **总结与展望** (~200 words)
   - 量化编译是模型压缩和编译优化的交叉领域
   - 趋势：更多硬件原生支持低精度（FP4、MX formats）→ 编译器需要跟进
   - 下一篇：[分布式编译](/zh/articles/distributed-compilation)——当模型太大装不下一张卡时，编译器如何参与分割决策

**en version — `src/content/articles/en/quantization-compilation.mdx`**
Same structure and content, translated to English. Components use `locale="en"`. Internal links use `/en/articles/` prefix.

---

## Task 2: Article 15 — 分布式编译与图分割 (distributed-compilation)

Explain how compilers participate in multi-device model partitioning — from GSPMD-style sharding propagation to communication-computation overlap. 3 interactive components + bilingual MDX.

**Files:**
- Create: `src/components/interactive/ShardingPropagationDemo.tsx`
- Create: `src/components/interactive/ParallelStrategyExplorer.tsx`
- Create: `src/components/interactive/CommunicationOverlapTimeline.tsx`
- Create: `src/content/articles/zh/distributed-compilation.mdx`
- Create: `src/content/articles/en/distributed-compilation.mdx`

**Prerequisites (existing articles this references):**
- `codegen-triton-backend` (Art.13 — backend compilation)
- `operator-fusion-cost-model` (Art.9 — fusion and cost model concepts)
- `graph-passes-foundations` (Art.5 — pass infrastructure)

### Component 1: ShardingPropagationDemo

**Purpose:** Animate GSPMD-style sharding propagation: user annotates a few tensors, compiler automatically propagates sharding decisions and inserts communication ops.

**Layout:** SVG 800×540. Computation graph with sharding annotations.

**Graph layout:**
- A simplified 4-op computation graph representing a Transformer layer fragment:
  - `Input X [B, S, D]` → `MatMul(X, W1)` → `ReLU` → `MatMul(_, W2)` → `Output Y`
  - Weight tensors `W1 [D, 4D]` and `W2 [4D, D]` shown as side inputs
- Each tensor (node output / input) is a small rectangle showing its shape and sharding annotation
- Sharding annotation format: e.g., `[B, S, D]` with highlighted shard dimension: `[B, S, D/2]` means D dimension split across 2 devices

**Interaction flow (3 steps, use StepNavigator):**

**Step 1: "User Annotation"**
- User clicks on `W1` to annotate it as "column-parallel" (shard along output dim: `[D, 4D/N]`)
- Visual: W1 gets a colored border + shard indicator showing it's split across N devices
- All other tensors show "?" (unresolved)

**Step 2: "Propagation"**
- Animated propagation wave:
  - `W1 [D, 4D/N]` → MatMul output must be `[B, S, 4D/N]` (propagated)
  - ReLU output: `[B, S, 4D/N]` (element-wise, same sharding)
  - `W2` must accept `[4D/N, D]` → also column-sharded (propagated)
  - But MatMul(_, W2) produces partial results → needs all-reduce
- Each step of propagation highlights the edge being resolved with a pulse animation
- Sharding annotations update one by one with `motion.text`

**Step 3: "Communication Insertion"**
- An `AllReduce` communication node is automatically inserted after the second MatMul
- The AllReduce node is colored differently (COLORS.orange) with a communication icon
- Final annotated graph shows: all tensor shardings resolved + communication ops placed
- Cost annotation: "Compute: 2× MatMul (local) | Communication: 1× AllReduce(D)"

**Device count selector:** Buttons for N = 2, 4, 8 — changes sharding fractions and communication volume.

**Data model:**
```tsx
interface TensorAnnotation {
  id: string;
  shape: string;         // e.g., "[B, S, 4D/N]"
  shardDim: number | null;  // which dimension is sharded, null = replicated
  status: 'unresolved' | 'user_annotated' | 'propagated';
}

interface CommOp {
  id: string;
  type: 'all_reduce' | 'all_gather' | 'reduce_scatter' | 'all_to_all';
  position: { afterNodeId: string };
  volume: string;  // e.g., "B×S×D × sizeof(FP16)"
}
```

### Component 2: ParallelStrategyExplorer

**Purpose:** Compare DP/TP/PP strategies for different model sizes and GPU counts, showing memory, communication, and compute efficiency tradeoffs.

**Layout:** SVG 800×520. Configuration panel + comparison visualization.

**Configuration panel (top, 800×80):**
- Model size selector: `7B` | `13B` | `70B` | `175B`
- GPU count selector: `1` | `2` | `4` | `8` | `16`
- Memory per GPU: fixed at "80 GB" (A100 reference)

**Main visualization (three columns, each showing a strategy):**

**Column 1: Data Parallel (DP)**
- Visual: N identical model copies, each processing different data
- Memory bar: full model on each GPU (may exceed capacity for large models → red "OOM" warning)
- Communication: gradient AllReduce after each step
- Compute efficiency: ~95-100% (near 100% when gradient AllReduce is fully overlapped with backward pass; in practice 85-95% at scale due to sync overhead)
- Works/doesn't work indicator based on model size vs GPU memory

**Column 2: Tensor Parallel (TP)**
- Visual: model layers split horizontally — each GPU holds a slice of every layer
- Memory bar: model memory / N per GPU
- Communication: AllReduce within each layer (high frequency, small volume)
- Compute efficiency: ~90-95% (communication overhead)
- NVLink requirement annotation

**Column 3: Pipeline Parallel (PP)**
- Visual: model layers split vertically — each GPU holds a contiguous block of layers
- Memory bar: model memory / N per GPU (plus pipeline bubble overhead)
- Communication: point-to-point between adjacent stages
- Compute efficiency: with M micro-batches and N stages, efficiency ≈ (M - N + 1) / M; approaches (N-1)/N asymptotically as M >> N. Example: N=4, M=8 → 62.5%
- Micro-batch visualization showing bubble

**For each strategy, show three metric bars:**
1. Memory per GPU (green if fits, red if OOM)
2. Communication volume (relative)
3. Compute efficiency (%)

**Bottom row:** "实际方案" / "Real-world" annotation showing that production systems use hybrid strategies (e.g., "LLaMA 70B: TP=8 within node, PP=2 across nodes, DP=4 for data")

**Data model:**
```tsx
interface ModelConfig {
  name: string;
  paramsBillion: number;
  memoryFP16GB: number;        // model weight memory in FP16
  layerCount: number;
  hiddenDim: number;
}

interface StrategyResult {
  strategy: 'DP' | 'TP' | 'PP';
  memoryPerGPU: number;        // GB
  fitsInMemory: boolean;
  commVolumeRelative: number;  // normalized 0-1
  computeEfficiency: number;   // 0-100%
  description: { zh: string; en: string };
}

const MODELS: ModelConfig[] = [
  { name: '7B',   paramsBillion: 7,   memoryFP16GB: 14,  layerCount: 32,  hiddenDim: 4096 },
  { name: '13B',  paramsBillion: 13,  memoryFP16GB: 26,  layerCount: 40,  hiddenDim: 5120 },
  { name: '70B',  paramsBillion: 70,  memoryFP16GB: 140, layerCount: 80,  hiddenDim: 8192 },
  { name: '175B', paramsBillion: 175, memoryFP16GB: 350, layerCount: 96,  hiddenDim: 12288 },
];
```

### Component 3: CommunicationOverlapTimeline

**Purpose:** Timeline visualization showing how communication and computation can be overlapped to hide latency, comparing serial vs pipelined execution.

**Layout:** SVG 800×440. Two timeline rows + metrics.

**Top timeline: "Serial Execution" (串行执行)**
- Horizontal timeline with blocks:
  - `Compute Layer 1` → `AllReduce 1` → `Compute Layer 2` → `AllReduce 2` → ...
- Compute blocks: COLORS.primary
- Communication blocks: COLORS.orange
- GPU utilization bar below: shows idle periods during communication (striped/hatched)
- Total time label

**Bottom timeline: "Overlapped Execution" (重叠执行)**
- Two rows within the timeline:
  - Row 1 (Compute stream): `Compute L1` → `Compute L2` → `Compute L3` → ...
  - Row 2 (Communication stream): starts `AllReduce L1` as soon as L1 compute finishes, overlaps with L2 compute
- Overlap regions highlighted with a semi-transparent overlay
- GPU utilization bar: much higher (less idle time)
- Total time label (visibly shorter)

**Interaction:**
- Layer count selector: 4 | 6 | 8 layers
- Communication-to-compute ratio slider: buttons for 10%, 25%, 50% — shows how overlap benefit changes with ratio
  - At 10% comm: overlap saves little
  - At 50% comm: overlap saves dramatically
- Speedup annotation: "串行: X ms | 重叠: Y ms | 加速: Z%"

**Additional technique tabs (toggle between three overlap strategies):**
1. "Compute-Comm Overlap" — basic overlap as described above
2. "AllReduce Fusion" — merge multiple small AllReduces into one large one (fewer launches, but delayed start)
3. "Bucket AllReduce" — gradient bucketing (accumulate gradients, then communicate in chunks)

Each tab shows a different timeline pattern with the same metrics.

**Data model:**
```tsx
interface TimelineBlock {
  id: string;
  type: 'compute' | 'communication';
  layer: number;
  startTime: number;
  duration: number;
  stream: number;  // 0 = compute stream, 1 = comm stream
}

interface OverlapConfig {
  layerCount: number;
  computeTimePerLayer: number;  // ms
  commTimePerLayer: number;     // ms
  strategy: 'serial' | 'overlap' | 'fusion' | 'bucket';
}
```

---

### MDX Article Content: distributed-compilation

**zh version — `src/content/articles/zh/distributed-compilation.mdx`**

**Frontmatter:**
```yaml
title: "分布式编译与图分割"
slug: distributed-compilation
locale: zh
tags: [compiler, distributed, tensor-parallel, pipeline-parallel, gspmd, sharding, communication]
prerequisites: [codegen-triton-backend]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "GSPMD: General and Scalable Parallelization for ML Computation Graphs"
    url: "https://arxiv.org/abs/2105.04663"
  - type: paper
    title: "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism"
    url: "https://arxiv.org/abs/1909.08053"
  - type: paper
    title: "GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism"
    url: "https://arxiv.org/abs/1811.06965"
  - type: paper
    title: "PyTorch FSDP: Experiences on Scaling Fully Sharded Data Parallel"
    url: "https://arxiv.org/abs/2304.11277"
  - type: website
    title: "PyTorch Distributed Overview"
    url: "https://pytorch.org/docs/stable/distributed.html"
  - type: website
    title: "XLA SPMD Partitioner"
    url: "https://openxla.org/xla/operation_semantics#spmd_partitioner"
```

**Content outline (minimum 3000 words):**

1. **简介** (~300 words)
   - 单卡时代结束：LLaMA 70B 需要 ~140GB FP16，一张 A100 (80GB) 装不下
   - 手动分割效率低、组合空间大，编译器有全局计算图信息可以做更优分割
   - 本文讲编译器如何参与分布式决策，不讲分布式训练本身的细节
   - 三个核心问题：怎么分割（sharding）、怎么通信（collective ops）、怎么藏延迟（overlap）

2. **并行策略回顾** (~500 words)
   - **Data Parallelism (DP)**：每张卡完整模型 + 不同数据，gradient AllReduce 同步
   - **Tensor Parallelism (TP)**：按 tensor 维度切分——Megatron-LM 的 column/row parallel
   - **Pipeline Parallelism (PP)**：按层切分——GPipe 的 micro-batch pipeline
   - **Expert Parallelism (EP)**：MoE 模型的 expert 分布
   - **FSDP (Fully Sharded Data Parallel)**：ZeRO-3 的 PyTorch 实现，parameter/gradient/optimizer state 全部分片
   - 实际部署通常是混合策略：TP within node (NVLink) + PP across nodes (InfiniBand) + DP for data

3. **GSPMD：编译器驱动的自动分割** (~700 words)
   - **核心思想**：用户标注少量 tensor 的 sharding spec → 编译器自动推导全图
   - **Sharding Specification**：`{devices=[2,4], dims=[0,1]}` 描述如何在设备网格上分割 tensor 维度
   - **Propagation 算法**：
     - 从用户标注出发，沿计算图正向和反向传播 sharding 决策
     - MatMul 的 sharding 规则：`A[M,K] × B[K,N]` → 可以 split M (batch parallel), split N (output parallel), split K (reduce parallel)
     - Element-wise ops：输入输出 sharding 相同
     - Reduce ops：reduce 维度不能被 shard（或需要 AllReduce）
   - **通信算子自动插入**：
     - sharding 不兼容时自动插入 AllGather / ReduceScatter / AllToAll
     - 编译器选择最优 collective 类型（e.g., AllGather vs Reduce-Scatter 取决于后续 op 的 sharding 需求）
   - **Cost Model**：通信开销 vs 计算负载均衡 vs 内存约束的多目标优化

   <ShardingPropagationDemo client:visible />

4. **torch.compile 与分布式** (~500 words)
   - **torch.compile + FSDP**：
     - FSDP 的通信 op（AllGather parameter, ReduceScatter gradient）对编译器可见
     - 编译器可以将 AllGather 与后续计算融合 / 重叠
     - `torch.compile(model)` 对 FSDP wrapped model 的支持现状
   - **torch.compile + Tensor Parallel**：
     - `torch.distributed.tensor.parallel` API
     - 编译器看到 all_reduce / all_gather 作为图中的 op
     - 跨通信算子的融合限制
   - **DTensor abstraction**：
     - PyTorch 的 Distributed Tensor 抽象：每个 tensor 带 sharding placement 信息
     - 编译器可以利用 placement 信息做 sharding-aware optimization

   <ParallelStrategyExplorer client:visible />

5. **通信优化** (~600 words)
   - **AllReduce Fusion**：
     - 问题：每层一个小 AllReduce → launch overhead 大
     - 解决：合并相邻层的 AllReduce 为一个大的（增加延迟但减少 overhead）
     - Bucket 策略：accumulate 到 N MB 再发送
   - **Compute-Communication Overlap**：
     - 核心思想：在通信等待时做下一层的计算
     - 实现：CUDA stream 并行——compute stream + communication stream
     - 调度约束：communication 的输入必须在该层 compute 完成后才能开始
     - 理论加速上限：`max(compute, comm)` vs `compute + comm`
   - **拓扑感知优化**：
     - 带宽差异（以 A100/H100 为例）：NVLink Gen4 (~900 GB/s, H100) / NVLink Gen3 (~600 GB/s, A100) vs PCIe Gen4 (~32 GB/s) vs InfiniBand NDR (~50 GB/s, 即 400 Gb/s)
     - 编译器选择 TP (高通信) 放在 NVLink 连接的 GPU 之间
     - Ring AllReduce vs Tree AllReduce 的选择

   <CommunicationOverlapTimeline client:visible />

6. **图分割算法** (~400 words)
   - 问题建模：加权图分割（节点 = 计算量，边 = 通信量，约束 = 内存）
   - Pipeline Parallelism 的 stage 划分：目标是均衡每个 stage 的计算量
   - 贪心策略：按层顺序分组，维持每组计算量接近 total/N
   - DP 策略：`dp[i][j]` = 前 i 层分到 j 个设备的最优通信开销
   - ILP 求解：精确最优但计算量大，适合离线分析
   - 实际系统（如 Alpa）的混合策略：TP-PP 联合搜索

7. **总结** (~200 words)
   - 分布式编译是"编译器 + 系统"的交叉领域
   - GSPMD 代表了"编译器驱动"的方向，torch.compile + FSDP/TP 代表了"框架集成"的方向
   - 下一篇：[调度与执行](/zh/articles/scheduling-execution)

**en version — `src/content/articles/en/distributed-compilation.mdx`**
Same structure and content, translated to English. Components use `locale="en"`. Internal links use `/en/articles/` prefix.

---

## Task 3: Article 16 — 调度与执行优化 (scheduling-execution)

Explain how compiled kernels are scheduled and executed — from multi-stream parallelism to memory scheduling, activation checkpointing, and multi-backend dispatch. 3 interactive components + bilingual MDX.

**Files:**
- Create: `src/components/interactive/KernelSchedulerDemo.tsx`
- Create: `src/components/interactive/MemoryScheduleVisualizer.tsx`
- Create: `src/components/interactive/MultiBackendDispatch.tsx`
- Create: `src/content/articles/zh/scheduling-execution.mdx`
- Create: `src/content/articles/en/scheduling-execution.mdx`

**Prerequisites (existing articles this references):**
- `quantization-compilation` (Art.14 — quantized kernel scheduling)
- `distributed-compilation` (Art.15 — communication scheduling)
- `operator-fusion-cost-model` (Art.9 — fusion groups as scheduler inputs)
- `codegen-triton-backend` (Art.13 — compiler backends)

### Component 1: KernelSchedulerDemo

**Purpose:** Timeline visualization showing kernel scheduling across multiple CUDA streams. Compare serial execution, multi-stream parallel, and CUDA Graph modes.

**Layout:** SVG 800×500. Mode selector + timeline area + metrics.

**Mode selector (top):**
Three buttons: `串行执行` / `Serial` | `多 Stream 并行` / `Multi-Stream` | `CUDA Graph`

**Timeline area (main, 800×320):**

**Serial mode:**
- Single horizontal timeline (one stream)
- Kernel blocks laid out sequentially: `K1` → `K2` → `K3` → `K4` → `K5` → `K6`
- Each kernel has:
  - Color: based on kernel type (COLORS.primary for MatMul, COLORS.green for element-wise, COLORS.orange for reduction)
  - Width proportional to compute time
  - Small gap between kernels = launch overhead (highlighted in COLORS.waste)
- Total time = sum of all kernel times + launch overheads
- Launch overhead highlighted with "↓ launch overhead" annotations

**Multi-Stream mode:**
- Three horizontal timelines (Stream 0, Stream 1, Stream 2)
- Independent kernels dispatched to different streams:
  - Stream 0: K1 (MatMul) → K4 (MatMul)
  - Stream 1: K2 (LayerNorm) → K5 (GeLU)
  - Stream 2: K3 (Bias+ReLU) → K6 (Residual)
- Dependency arrows: K1→K4 (same stream, sequential), K1→K2 (cross-stream sync event)
- Sync points shown as vertical dashed lines with "Event" labels
- Total time < serial (parallel portions overlap)

**CUDA Graph mode:**
- Single "graph launch" block that encapsulates all 6 kernels
- Internal structure shown with dashed outlines (same as multi-stream but pre-recorded)
- Single launch overhead for the entire graph
- "Replay" arrow showing the graph can be re-executed with minimal overhead
- Annotation: "Launch overhead: 1× (vs 6× serial)" and "Pre-Hopper: fixed structure; Hopper+: conditional nodes for limited dynamism"

**Interaction:**
- Workload selector: `Attention Block` | `FFN Block` | `Full Transformer Layer`
- Each workload defines different kernel counts and dependencies
- Hover on kernel block → tooltip with kernel name, duration, stream assignment

**Data model:**
```tsx
interface KernelBlock {
  id: string;
  name: string;
  type: 'matmul' | 'elementwise' | 'reduction' | 'norm' | 'activation';
  durationMs: number;
  dependencies: string[];  // IDs of kernels that must complete first
}

interface ScheduleResult {
  mode: 'serial' | 'multistream' | 'cudagraph';
  streams: { streamId: number; blocks: ScheduledBlock[] }[];
  totalTimeMs: number;
  launchOverheadMs: number;
}

interface ScheduledBlock {
  kernelId: string;
  startMs: number;
  endMs: number;
}
```

**Scheduling algorithm (for multi-stream):**
- Build dependency DAG
- Topological sort
- Assign to streams using greedy list scheduling: pick the stream with earliest available time
- Mark sync events where cross-stream dependencies exist

### Component 2: MemoryScheduleVisualizer

**Purpose:** Show how different execution orderings of the same computation graph affect peak memory usage. Demonstrates that scheduling order is a key lever for memory optimization.

**Layout:** SVG 800×520. Graph + two memory timeline comparisons.

**Top section — Computation graph (800×150):**
- A DAG of 6 operations with tensor lifetimes:
  - Op A → tensors t1, t2 (t1 used by B, C; t2 used by D)
  - Op B (uses t1) → tensor t3 (used by E)
  - Op C (uses t1) → tensor t4 (used by E)
  - Op D (uses t2) → tensor t5 (used by F)
  - Op E (uses t3, t4) → tensor t6 (used by F)
  - Op F (uses t5, t6) → output
- Each tensor labeled with its size (e.g., "t1: 256 MB", "t2: 128 MB", etc.)
- Highlight which tensors are alive at each point

**Bottom section — Two memory timelines side by side (2 × 380×160):**

**Left: "BFS 调度" / "BFS Schedule" (breadth-first)**
- Execution order: A → B → C → D → E → F
- Memory timeline: stacked area chart showing tensor lifetimes
  - After A: t1 + t2 alive (384 MB)
  - After B: t1 + t2 + t3 alive (512 MB) — peak!
  - After C: t2 + t3 + t4 alive (t1 freed) (448 MB)
  - ...continues
- Peak memory highlighted with red dashed line and label
- Color each tensor differently using HEAD_COLORS

**Right: "DFS 调度" / "DFS Schedule" (depth-first)**
- Execution order: A → B → C → E → D → F (process left subtree first)
- Memory timeline: different peak due to different tensor lifetime overlaps
  - After A: t1 + t2 (384 MB)
  - After B: t1 + t2 + t3 (512 MB)
  - After C: t2 + t3 + t4, t1 freed (448 MB)
  - After E: t2 + t6, t3+t4 freed (256 MB) — freed earlier!
  - After D: t2 + t5 + t6 (384 MB)
  - Peak lower than BFS
- Peak memory highlighted

**Metrics bar at bottom:**
- "BFS peak: X MB | DFS peak: Y MB | 节省: Z%" with comparison bars
- Toggle: "启用 Activation Checkpointing" / "Enable Activation Checkpointing"
  - When enabled: some tensors marked as "recompute" (striped pattern), peak memory reduced further
  - Recomputed tensors shown with a ↻ icon
  - Additional "Recompute overhead: +N%" annotation

**Data model:**
```tsx
interface OpNode {
  id: string;
  label: string;
  outputTensors: { id: string; sizeMB: number }[];
  inputTensorIds: string[];
}

interface ScheduleOrder {
  name: { zh: string; en: string };
  order: string[];  // op IDs in execution order
}

interface MemorySnapshot {
  afterOp: string;
  aliveTensors: { id: string; sizeMB: number }[];
  totalMB: number;
}
```

### Component 3: MultiBackendDispatch

**Purpose:** Show how a model's ops get dispatched to different hardware backends, with performance implications of each dispatch decision.

**Layout:** SVG 800×480. Model graph + backend assignment + performance breakdown.

**Top section — Model op graph (800×180):**
- A linear chain of 8 ops representing a Transformer layer:
  - `QKV Proj (MatMul)` → `Attention (FlashAttn)` → `Proj (MatMul)` → `LayerNorm` → `FFN Up (MatMul)` → `GeLU` → `FFN Down (MatMul)` → `LayerNorm`
- Each op is a rounded rect with label

**Backend assignment:**
- Each op is colored by its assigned backend:
  - GPU/Triton: COLORS.primary (blue)
  - GPU/cuBLAS: COLORS.green
  - CPU fallback: COLORS.orange
  - GPU/TensorRT: COLORS.purple (when selected)
- Below each op: small backend badge

**Backend selector (buttons):**
Three dispatch strategies:
1. **"TorchInductor 默认"** / **"TorchInductor Default"**
   - MatMuls → cuBLAS, Element-wise → Triton, Norms → Triton, Attention → FlashAttention (extern kernel)
2. **"全 Triton"** / **"All Triton"**
   - Everything via Triton-generated kernels (including matmul via Triton autotuned)
   - Annotation: "Triton matmul may be slower than cuBLAS for standard shapes"
3. **"混合 + CPU Fallback"** / **"Mixed + CPU Fallback"**
   - Most ops on GPU, but one unsupported custom op falls back to CPU
   - Shows the CPU op with a "⚠ fallback" warning and data transfer arrows (GPU→CPU→GPU)
   - Data transfer blocks shown in COLORS.waste

**Bottom section — Performance breakdown (800×160):**
- Horizontal stacked bar showing time breakdown per op:
  - Each segment colored by backend
  - CPU fallback segments much wider (slower) + extra "Transfer" segments
- Total time comparison between strategies
- Annotation for CPU fallback: "GPU→CPU transfer: X ms | CPU compute: Y ms | CPU→GPU transfer: Z ms"
- Key insight: "One CPU fallback can dominate total execution time"

**Data model:**
```tsx
interface OpDispatch {
  opId: string;
  opName: string;
  opType: 'matmul' | 'attention' | 'norm' | 'activation' | 'custom';
  backend: 'triton' | 'cublas' | 'cpu' | 'flash_attention' | 'tensorrt';
  computeTimeMs: number;
  transferTimeMs: number;  // 0 for GPU backends, >0 for CPU fallback
}

interface DispatchStrategy {
  id: string;
  label: { zh: string; en: string };
  dispatches: OpDispatch[];
  totalTimeMs: number;
}
```

---

### MDX Article Content: scheduling-execution

**zh version — `src/content/articles/zh/scheduling-execution.mdx`**

**Frontmatter:**
```yaml
title: "调度与执行优化"
slug: scheduling-execution
locale: zh
tags: [compiler, scheduling, cuda-stream, cuda-graph, memory-planning, activation-checkpointing, multi-backend]
prerequisites: [codegen-triton-backend, quantization-compilation, distributed-compilation]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: website
    title: "CUDA C++ Programming Guide — Streams"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#streams"
  - type: website
    title: "CUDA Graphs"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#cuda-graphs"
  - type: paper
    title: "Checkmate: Breaking the Memory Wall with Optimal Tensor Rematerialization"
    url: "https://arxiv.org/abs/1910.02653"
  - type: paper
    title: "Dynamic Tensor Rematerialization"
    url: "https://arxiv.org/abs/2006.09616"
  - type: website
    title: "TorchInductor: A PyTorch Native Compiler"
    url: "https://dev-discuss.pytorch.org/t/torchinductor-a-pytorch-native-compiler-with-define-by-run-ir-and-target-agnostic-codegen/747"
  - type: website
    title: "PyTorch Activation Checkpointing"
    url: "https://pytorch.org/docs/stable/checkpoint.html"
```

**Content outline (minimum 3000 words):**

1. **简介** (~300 words)
   - 前面 13 篇文章讲了"编译器怎么把计算图变成优化过的 kernel"——但 kernel 生成出来后，还需要被**调度执行**
   - 调度层关心：kernel 之间的并行性、内存峰值控制、多设备/多 backend 分发
   - 本文聚焦"编译到执行"的最后一环，与前面的 pass 阶段优化互补

2. **Kernel 调度策略** (~600 words)
   - **依赖分析与拓扑排序**
     - 编译器输出的 fusion group 形成 DAG
     - 拓扑排序确定合法执行顺序，但合法顺序可能有很多种
     - 关键路径分析：最长路径决定理论最短执行时间
   - **CUDA Stream 并行**
     - 无依赖的 kernel 可以在不同 stream 上并发执行
     - Event-based synchronization：stream A 的 kernel 完成后通知 stream B
     - 实际并行度受限于 GPU SM 数量和 kernel 占用率
   - **CUDA Graph**
     - 将整个 kernel 序列录制为一个图，一次 launch 执行全部
     - 消除逐 kernel 的 CPU-side launch overhead（每次 launch 约数微秒）
     - 限制：传统 CUDA Graph 要求图结构固定；Hopper 架构 (CC 9.0+) 引入 Conditional Nodes (IF/WHILE/SWITCH)，支持有限动态控制流
     - torch.compile 与 CUDA Graph 的集成：`torch._inductor.cudagraph_trees`

   <KernelSchedulerDemo client:visible />

3. **TorchInductor Scheduler 设计** (~500 words)
   - **输入**：fusion group DAG + 每个 group 的 kernel 代码
   - **调度目标**：最小化总执行时间 + 最小化 peak memory（双目标）
   - **调度启发式**：
     - 优先调度关键路径上的 kernel（减少总时间）
     - 优先调度能释放大 tensor 的 kernel（减少 peak memory）
     - 两个目标冲突时的权衡策略
   - **与融合决策的交互**：
     - 融合越多 → kernel 越少 → 调度越简单
     - 但融合过度 → 单个 kernel 内部 register pressure 过高 → 反而变慢
     - Scheduler 和 Fusion 是协作关系，不是先后关系

4. **Memory 调度优化** (~700 words)
   - **Tensor 生命周期分析**
     - 每个 intermediate tensor 有明确的"出生"（产生它的 op）和"死亡"（最后一个消费者）
     - 执行顺序决定了哪些 tensor 同时存活，进而决定 peak memory
     - 同一个 DAG 的不同拓扑排序可能产生 2-3x 的 peak memory 差异
   - **Recompute vs Store 决策**
     - 保存：用内存换计算——保留 activation 供反向使用
     - 重算：用计算换内存——丢弃 activation，反向时重新计算
     - Activation Checkpointing：标记部分层为 checkpoint，反向时只需从 checkpoint 重算
     - 编译器自动化：Checkmate 等系统用 ILP 求解最优 checkpoint 策略
   - **In-place Operation 与 Buffer 复用**
     - 编译器检测可以原地执行的 op（输出 shape 和 dtype 与输入相同，且输入无其他消费者）
     - Buffer 复用：生命周期不重叠的 tensor 共享同一块内存
     - 与 [Graph Passes 基础](/zh/articles/graph-passes-foundations) 中的 memory planning pass 互补——pass 阶段做静态规划，调度阶段做动态决策

   <MemoryScheduleVisualizer client:visible />

5. **多 Backend 支持** (~600 words)
   - **TorchInductor 的 Backend 体系**
     - Triton backend：NVIDIA GPU 上的 element-wise、reduction、小 matmul
     - cuBLAS/cuDNN：标准 GEMM、Conv（成熟库，性能稳定）
     - FlashAttention：外部 kernel for attention（专用优化）
     - C++/OpenMP backend：CPU 端执行
     - 选择逻辑：根据 op 类型 + 硬件 + 性能数据自动分发
   - **MLIR 的多 Backend 路径**
     - GPU Dialect → NVVM (NVIDIA) / ROCDL (AMD) / SPIR-V (Intel)
     - 同一个 linalg-level IR 可以 lower 到不同硬件后端
     - IREE 的 HAL (Hardware Abstraction Layer) 设计
   - **CPU Fallback 的代价**
     - 不支持的 op 回退到 CPU：GPU→CPU 数据传输 + CPU 计算 + CPU→GPU 回传
     - 一个 CPU fallback 可能让整体性能下降 10-100x
     - 编译器策略：尽量避免 fallback（op decomposition、custom kernel 等）
   - **异构调度**
     - 同一模型中不同 op 分派到不同设备
     - 何时值得 offload 到加速器 vs 留在 CPU：取决于 compute/transfer ratio

   <MultiBackendDispatch client:visible />

6. **CUDA Graph 深入** (~400 words)
   - CUDA Graph 的录制与重放机制
   - 传统限制：图结构固定，不支持动态控制流；Hopper (CC 9.0+) Conditional Nodes 的突破
   - Dynamic shape 的挑战：shape 变化需要重建/切换 graph
   - TorchInductor 的 CUDA Graph Trees：支持 guard-based graph switching
   - 与 torch.compile 的集成：`mode="reduce-overhead"` 自动启用 CUDA Graph
   - 性能收益：batch inference 场景下显著减少 kernel launch overhead

7. **总结** (~200 words)
   - 调度与执行是编译优化的"最后一公里"
   - 好的调度 = 充分利用硬件并行性 + 最小化内存峰值 + 最小化 host-side overhead
   - 下一篇（也是最后一篇）：[自动调优与端到端实战](/zh/articles/autotuning-end-to-end)

**en version — `src/content/articles/en/scheduling-execution.mdx`**
Same structure and content, translated to English. Components use `locale="en"`. Internal links use `/en/articles/` prefix.

---

## Task 4: Article 17 — 自动调优与端到端实战 (autotuning-end-to-end)

The capstone article: explain autotuning principles, MLIR Transform Dialect, and provide a full end-to-end compilation journey recap linking all 17 articles. 3 interactive components + bilingual MDX.

**Files:**
- Create: `src/components/interactive/AutotuneExplorer.tsx`
- Create: `src/components/interactive/TransformDialectDemo.tsx`
- Create: `src/components/interactive/CompileJourneyRecap.tsx`
- Create: `src/content/articles/zh/autotuning-end-to-end.mdx`
- Create: `src/content/articles/en/autotuning-end-to-end.mdx`

**Prerequisites (existing articles this references):**
- `scheduling-execution` (Art.16 — scheduling, backends)
- ALL prior articles (this is the recap article that links the complete journey)

### Component 1: AutotuneExplorer

**Purpose:** Interactive autotune simulation where users explore a kernel's parameter search space, seeing how different configurations affect performance, and comparing manual search vs algorithmic search strategies.

**Layout:** SVG 800×560. Parameter controls + performance surface + search visualization.

**Kernel selector (top):**
Buttons: `MatMul (M=4096, N=4096, K=4096)` | `Attention (B=32, S=512, D=64)`

**Parameter panel (left side, 200×300):**
For MatMul kernel, three tunable parameters:
1. **BLOCK_M**: 32 | 64 | 128 | 256 (buttons with +/-)
2. **BLOCK_N**: 32 | 64 | 128 | 256
3. **BLOCK_K**: 16 | 32 | 64
4. **num_warps**: 2 | 4 | 8
5. **num_stages**: 2 | 3 | 4 | 5

Current config shown as `(BLOCK_M=128, BLOCK_N=128, BLOCK_K=32, warps=4, stages=3)`

**Performance heatmap (center, 400×300):**
- 2D heatmap with BLOCK_M on X-axis, BLOCK_N on Y-axis (fixing BLOCK_K, warps, stages at current values)
- Color: green (fast) → yellow → red (slow)
- Each cell shows estimated throughput (TFLOPS)
- Current config highlighted with a border
- Best config in the slice marked with a star ★

**Performance data model (simplified analytical model):**
```
Throughput = min(peak_compute, data_delivered / compute_time)
where:
  peak_compute depends on Tensor Core utilization (warps × stages)
  occupancy = min(SM_count, grid_size) / SM_count
  grid_size = ceil(M/BLOCK_M) * ceil(N/BLOCK_N)
  shared_memory_per_block = (BLOCK_M*BLOCK_K + BLOCK_K*BLOCK_N) * sizeof(FP16)
  if shared_memory_per_block > MAX_SMEM: throughput = 0 (infeasible)
  register_pressure = f(BLOCK_M, BLOCK_N, num_stages) → if too high, occupancy drops
```

Use realistic-looking but precomputed lookup tables rather than a full analytical model. Key patterns to capture:
- Sweet spot around BLOCK_M=128, BLOCK_N=128 for 4096×4096
- Too-small blocks → low Tensor Core utilization
- Too-large blocks → low occupancy or SMEM overflow
- num_stages > 3 helps if memory-bound, hurts if compute-bound (register pressure)

**Search strategy panel (right side, 200×300):**
Three buttons to run automated search:
1. **Grid Search**: exhaustively tries all combinations, highlights each tested config on heatmap sequentially with animation, finds global optimum
2. **Random Search**: randomly samples N points, shows sampled points on heatmap, likely finds near-optimal faster
3. **Bayesian Optimization**: samples a few initial points, then focuses sampling near promising regions (show the "zoom in" behavior)

Each strategy shows:
- Number of configurations tested
- Best throughput found
- Time to find best (relative)

After running a search, show the search path on the heatmap as numbered dots.

**Bottom metrics bar:**
- Current config throughput
- Best found throughput
- % of peak theoretical throughput
- "Configurations tested: N / Total: M"

**Data model:**
```tsx
interface AutotuneConfig {
  blockM: number;
  blockN: number;
  blockK: number;
  numWarps: number;
  numStages: number;
}

interface AutotuneResult {
  config: AutotuneConfig;
  throughputTFLOPS: number;
  occupancy: number;
  sharedMemBytes: number;
  feasible: boolean;
}

// Precomputed lookup table
const MATMUL_RESULTS: Map<string, AutotuneResult>;
```

### Component 2: TransformDialectDemo

**Purpose:** Demonstrate MLIR Transform Dialect concepts — how schedule scripts declaratively specify optimization strategies (tiling, fusion, vectorization) and how different schedules produce different code.

**Layout:** SVG 800×500. Three-panel view: Schedule Script | Input IR | Output IR.

**Schedule selector (top):**
Three preset schedules:
1. **"Tile Only"** — just apply tiling to the matmul
2. **"Tile + Fuse"** — tile then fuse with element-wise epilogue
3. **"Tile + Fuse + Vectorize"** — full optimization pipeline

**Three panels:**

**Left panel (240px) — "Schedule Script":**
```mlir
// Schedule 1: Tile Only
transform.sequence failures(propagate) {
^bb0(%arg0: !transform.any_op):
  %matmul = transform.match @linalg.matmul in %arg0
  %tiled, %loops = transform.tile_using_for %matmul
    tile_sizes [128, 128, 32]
}
```

For each schedule, show the MLIR transform operations as styled code lines:
- `transform.match` — find the target op
- `transform.tile_using_for` — apply tiling
- `transform.fuse_into_containing_op` — fuse operations
- `transform.vectorize` — vectorize

Highlighted keywords: transform ops in COLORS.primary, parameters in COLORS.orange

**Center panel (260px) — "Input IR":**
```mlir
func @matmul_relu(%A: tensor<512x512xf32>,
                   %B: tensor<512x512xf32>) {
  %C = linalg.matmul ins(%A, %B)
              outs(%init)
  %D = linalg.elemwise_unary {relu} ins(%C)
  return %D
}
```

Static display, highlighted to show which ops are targets.

**Right panel (260px) — "Output IR" (changes per schedule):**

Schedule 1 output:
```mlir
scf.for %i = 0 to 512 step 128 {
  scf.for %j = 0 to 512 step 128 {
    scf.for %k = 0 to 512 step 32 {
      %tile = linalg.matmul ...
    }
  }
}
%D = linalg.elemwise_unary {relu} // NOT fused
```

Schedule 2 output: tiled matmul with relu fused inside the loop nest
Schedule 3 output: tiled + fused + vectorized (vector.contract ops)

**Animated transition:**
When switching schedules, the output panel content animates (fade out old → fade in new).

**Bottom annotation area:**
For each schedule, show:
- Strategy description: what optimizations are applied
- Performance estimate: "Tile only: ~60% peak | Tile+Fuse: ~75% peak | Full: ~90% peak"
- Key insight: "Transform Dialect separates **what** to optimize from **how** to optimize — schedule scripts are reusable across different workloads"

**Data model:**
```tsx
interface TransformSchedule {
  id: string;
  label: { zh: string; en: string };
  scheduleCode: string;      // MLIR transform dialect code
  inputIR: string;           // input MLIR
  outputIR: string;          // transformed MLIR
  performanceEstimate: string;
  description: { zh: string; en: string };
}
```

### Component 3: CompileJourneyRecap

**Purpose:** End-to-end compilation journey visualization linking all 17 articles. Shows `torch.compile(model)` → each compilation stage → GPU kernel execution, with each stage card linking to its article.

**Layout:** SVG 800×600. Vertical pipeline of compilation stages.

**Design:**
A vertical flow of 8 stage cards, each representing a major compilation phase. Connected by downward arrows. Each card has:
- Stage number (1-8)
- Stage name (bilingual)
- Key transformation description (one line)
- Article references (clickable links to 1-2 articles)
- A small icon/visual cue for the stage

**Stages:**

1. **用户代码 → 计算图** / **User Code → Computation Graph**
   - "torch.compile(model) 触发 TorchDynamo 字节码分析"
   - Articles: [全景图](/zh/articles/ml-compiler-landscape) (Art.1), [图捕获](/zh/articles/graph-capture-dynamo) (Art.2)
   - Icon: Python logo → FX Graph

2. **IR 表示与 Lowering** / **IR Representation & Lowering**
   - "FX Graph / MLIR Dialect → 逐层下降到更接近硬件的表示"
   - Articles: [IR 设计基础](/zh/articles/ir-design-basics) (Art.3), [Progressive Lowering](/zh/articles/ir-progressive-lowering) (Art.4)
   - Icon: Multi-layer IR stack

3. **优化 Pass** / **Optimization Passes**
   - "DCE、CSE、常量折叠、Layout 优化、Memory Planning"
   - Articles: [Pass 基础](/zh/articles/graph-passes-foundations) (Art.5), [Pass 进阶](/zh/articles/graph-passes-advanced) (Art.6), [Polyhedral](/zh/articles/graph-passes-polyhedral) (Art.7)
   - Icon: Filter/funnel

4. **算子融合** / **Operator Fusion**
   - "识别融合机会，合并 kernel 以减少内存往返"
   - Articles: [融合分类](/zh/articles/operator-fusion-taxonomy) (Art.8), [融合代价模型](/zh/articles/operator-fusion-cost-model) (Art.9)
   - Icon: Multiple boxes merging into one

5. **Tiling 与内存优化** / **Tiling & Memory Optimization**
   - "HBM → SMEM → Register 的多级 tiling 策略"
   - Articles: [Tiling 与内存层次](/zh/articles/tiling-memory-hierarchy) (Art.10), [Dynamic Shapes](/zh/articles/dynamic-shapes-challenge) (Art.11)
   - Icon: Grid with hierarchy levels

6. **代码生成** / **Code Generation**
   - "指令选择、向量化、Triton Pipeline → PTX → cubin"
   - Articles: [Codegen 上](/zh/articles/codegen-instruction-selection) (Art.12), [Codegen 下](/zh/articles/codegen-triton-backend) (Art.13)
   - Icon: Code brackets → binary

7. **进阶优化** / **Advanced Optimizations**
   - "量化编译、分布式图分割、调度与执行"
   - Articles: [量化编译](/zh/articles/quantization-compilation) (Art.14), [分布式编译](/zh/articles/distributed-compilation) (Art.15), [调度与执行](/zh/articles/scheduling-execution) (Art.16)
   - Icon: Scale/distribution graph

8. **自动调优与执行** / **Autotuning & Execution**
   - "搜索最优配置 → CUDA Graph 执行 → GPU 上高效运行"
   - Articles: [自动调优](/zh/articles/autotuning-end-to-end) (Art.17, 本文)
   - Icon: Tuning dial → GPU chip

**Interaction:**
- Hover on a stage card → card expands slightly, shows a 2-line description of the key transformation
- Click on article link → navigates to that article (using `<a href="/zh/articles/slug">` in SVG foreignObject, or construct href in event handler)
- Animated entrance: cards appear sequentially from top to bottom with staggered delay

**Current article highlight:**
- Stage 8 (autotuning) has a special highlight border since it's the current article
- A "YOU ARE HERE" badge on stage 8

**Left side: input/output annotations**
- Top: `torch.compile(model)` → Python code
- Bottom: `Optimized GPU Kernel(s)` → hardware execution
- Estimated end-to-end speedup: "Typical: 1.5-3x throughput improvement"

**Data model:**
```tsx
interface CompileStage {
  id: number;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  articles: { slug: string; label: { zh: string; en: string } }[];
  icon: string;  // SVG path or emoji
  isCurrent: boolean;
}
```

---

### MDX Article Content: autotuning-end-to-end

**zh version — `src/content/articles/zh/autotuning-end-to-end.mdx`**

**Frontmatter:**
```yaml
title: "自动调优与端到端实战"
slug: autotuning-end-to-end
locale: zh
tags: [compiler, autotuning, triton, mlir, transform-dialect, end-to-end, torch-compile]
prerequisites: [scheduling-execution]
difficulty: advanced
created: "2026-04-13"
updated: "2026-04-13"
references:
  - type: paper
    title: "Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations"
    url: "https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf"
  - type: paper
    title: "Ansor: Generating High-Performance Tensor Programs for Deep Learning"
    url: "https://arxiv.org/abs/2006.06762"
  - type: paper
    title: "Learning to Optimize Tensor Programs"
    url: "https://arxiv.org/abs/1805.08166"
  - type: website
    title: "Triton Autotune Documentation"
    url: "https://triton-lang.org/main/python-api/generated/triton.autotune.html"
  - type: website
    title: "MLIR Transform Dialect"
    url: "https://mlir.llvm.org/docs/Dialects/Transform/"
  - type: website
    title: "torch.compile Troubleshooting"
    url: "https://pytorch.org/docs/stable/torch.compiler_troubleshooting.html"
```

**Content outline (minimum 3000 words):**

1. **简介** (~300 words)
   - 编译器的最后一个大问题：硬件太复杂，静态 cost model 不够精确
   - 同一个 kernel 在不同 GPU、不同 batch size、不同 shape 下最优配置不同
   - Autotuning 通过实际测量找最优配置，是编译器优化的"最后一公里"
   - 本文同时作为整个 17 篇学习路径的收束总结

2. **为什么需要 Autotuning** (~400 words)
   - **组合爆炸**：一个 matmul kernel 的配置空间
     - BLOCK_M × BLOCK_N × BLOCK_K × num_warps × num_stages = 数千种组合
     - 加上 layout、pipeline 策略，搜索空间可达数万
   - **硬件差异**：A100 vs H100 vs AMD MI300 的最优配置完全不同
   - **Workload 差异**：batch=1 的 inference vs batch=256 的 training，最优 tile size 不同
   - **Cost model 的局限**：
     - 静态 model 无法准确预测 cache 行为、bank conflict、warp scheduling
     - 实际测量是唯一可靠方法（但编译时间成本高）

3. **Triton 的 Autotune 机制** (~600 words)
   - **@triton.autotune decorator**：声明可调参数和候选值
     ```python
     @triton.autotune(
       configs=[
         triton.Config({'BLOCK_M': 128, 'BLOCK_N': 128, 'BLOCK_K': 32}, num_warps=4, num_stages=3),
         triton.Config({'BLOCK_M': 64, 'BLOCK_N': 256, 'BLOCK_K': 32}, num_warps=8, num_stages=3),
         # ...more configs
       ],
       key=['M', 'N', 'K'],  # cache key: re-tune when these change
     )
     def matmul_kernel(...):
     ```
   - **Warmup 与 benchmarking**：每个 config 运行 N 次取中位数
   - **Cache 机制**：结果按 key 缓存，避免重复 tuning
   - **编译开销**：每个 config 需要独立编译 → N configs = N 次编译时间
   - **与 torch.compile 的集成**：TorchInductor 使用固定的 autotune 配置列表

   <AutotuneExplorer client:visible />

4. **搜索策略** (~500 words)
   - **Grid Search**：穷举所有组合
     - 优点：保证找到最优
     - 缺点：搜索空间大时不可行（10000 configs × 100ms/config = 1000s）
   - **Random Search**：随机采样 N 个点
     - Bergstra & Bengio (2012): random search 在高维空间中比 grid search 更高效
     - 直觉：高维空间中大部分维度对性能影响小，random search 更好地覆盖重要维度
   - **Bayesian Optimization**：
     - Surrogate model (GP / TPE) 预测未探索配置的性能
     - Acquisition function (EI / UCB) 决定下一个采样点
     - 在少量采样后快速收敛到近最优
   - **Cost Model Guided Search**：
     - 用分析模型（roofline、occupancy calculator）预筛候选
     - 只对 top-K 候选做实际 benchmark
     - 大幅减少搜索时间
   - **Transfer Learning**：
     - 跨 workload：相似 shape 的 kernel 最优配置接近
     - 跨硬件：同代 GPU 的最优配置高度相关
     - TVM MetaSchedule 的 tune log 迁移

5. **MLIR Transform Dialect** (~600 words)
   - **Programmable Scheduling 的理念**
     - 传统方式：优化策略 hardcode 在编译器 pass 中
     - Transform Dialect：用 IR 本身描述优化策略（"schedule script"）
     - 分离"做什么优化"（人类知识）和"具体参数"（autotuning）
   - **核心 Operations**
     - `transform.match`：在 IR 中找到目标 op
     - `transform.tile_using_for`：对目标 op 应用 tiling
     - `transform.fuse_into_containing_op`：将 op 融合到已有的循环结构中
     - `transform.vectorize`：向量化
     - `transform.bufferization.one_shot_bufferize`：tensor → memref 转换
   - **与 Polyhedral 的互补**
     - Polyhedral model（[文章 7](/zh/articles/graph-passes-polyhedral)）自动寻找最优循环变换
     - Transform Dialect 让编译器工程师手动指定策略框架
     - 两者可以结合：polyhedral 分析 → Transform Dialect 应用
   - **实际用例**
     - IREE 使用 Transform Dialect 定义 GPU codegen 策略
     - 不同 GPU 架构使用不同的 schedule script

   <TransformDialectDemo client:visible />

6. **编译调试实战** (~500 words)
   - **torch.compile 调试工具链**
     - `TORCH_LOGS="dynamo"`: TorchDynamo 跟踪日志
     - `TORCH_LOGS="inductor"`: TorchInductor codegen 日志
     - `TORCH_LOGS="guards"`: guard 触发和 recompilation 日志
     - `torch._dynamo.explain(model, *args)`: 分析 graph break 原因
     - `torch.compiler.disable()`: 逐段排除法
   - **常见 Pitfall 与解决**
     - Graph Break 导致性能下降 → `explain()` 找到 break 原因，重构代码避免
     - Dynamic shape 导致过多 recompilation → 设置 `dynamic=True` 或使用 bucketing
     - 编译时间过长 → 减少 autotune 候选、使用 cache
     - 数值精度问题 → 对比 eager vs compiled 输出，使用 `torch.testing.assert_close`
   - **性能分析工具**
     - `torch.profiler` + Chrome trace
     - `triton.testing.do_bench()` for kernel-level benchmarking
     - nsight-compute for GPU-level analysis

7. **端到端实战：torch.compile 一个 Transformer Layer** (~500 words)
   - 完整旅程串联（每步引用对应文章）：
     1. `torch.compile(model)` → TorchDynamo 捕获 FX Graph (Art.2)
     2. AOTAutograd 构建 joint graph (Art.2)
     3. FX IR 表示 (Art.3-4)
     4. 优化 pass：DCE, CSE, constant folding (Art.5-7)
     5. 算子融合：识别 fusion group (Art.8-9)
     6. Tiling + memory optimization (Art.10-11)
     7. Codegen：Triton kernel generation (Art.12-13)
     8. 量化优化（如适用）(Art.14)
     9. 分布式分割（如多卡）(Art.15)
     10. Kernel 调度与执行 (Art.16)
     11. Autotune 选择最优配置 (Art.17, 本文)
   - 实际性能数据参考：
     - GPT-2 (117M): ~1.5x throughput improvement
     - LLaMA 7B: ~1.8x inference throughput
     - LLaMA 70B (with quantization): ~2.5-3x
   - 编译前 vs 编译后的对比：throughput, latency, memory

   <CompileJourneyRecap client:visible />

8. **总结与展望** (~300 words)
   - 17 篇文章的旅程回顾：从 Python 代码到 GPU kernel 的完整编译流程
   - ML 编译器的未来趋势：
     - 更智能的 autotuning（LLM-guided search、learned cost models）
     - 更深的硬件-编译器协同设计
     - 统一 IR 生态（MLIR 的影响力扩大）
     - 新硬件支持（NPU、TPU、custom accelerators）
   - 鼓励读者：回到 [全景图](/zh/articles/ml-compiler-landscape)，用全新视角重读

**en version — `src/content/articles/en/autotuning-end-to-end.mdx`**
Same structure and content, translated to English. Components use `locale="en"`. Internal links use `/en/articles/` prefix.

---

## Execution Notes

### Parallel Execution Strategy

Tasks 1 and 2 have **no cross-references** and can be dispatched to subagents simultaneously:
- Subagent A: Task 1 (Art.14 — quantization-compilation) — 3 components + 2 MDX
- Subagent B: Task 2 (Art.15 — distributed-compilation) — 3 components + 2 MDX

After both complete:
- Subagent C: Task 3 (Art.16 — scheduling-execution) — 3 components + 2 MDX (references Art.14, Art.15)

After Task 3 completes:
- Subagent D: Task 4 (Art.17 — autotuning-end-to-end) — 3 components + 2 MDX (references ALL prior articles)

### Post-Execution Review

After all 4 tasks complete, run a 5-agent parallel review (same pattern as Phase 3):
1. **Quantization Expert** — review Art.14 for quantization accuracy (INT4/INT8/FP8 throughput numbers, kernel characteristics)
2. **Distributed Systems Expert** — review Art.15 for distributed correctness (GSPMD algorithm, communication patterns, bandwidth numbers)
3. **Systems/Scheduling Expert** — review Art.16 for scheduling correctness (CUDA stream semantics, CUDA Graph limitations, memory scheduling)
4. **Component Code Quality Reviewer** — review all 12 components for code quality, i18n, accessibility
5. **MDX Cross-Article Consistency** — review all 8 MDX files for locale props, internal links, CompilerStackMap usage

### Validation

After review fixes:
```bash
npm run validate   # content validation
npx astro build    # full build (should produce ~752+ pages)
```
