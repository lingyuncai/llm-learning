# Intel iGPU 推理深度解析 Implementation Plan (Part 2: Tasks 20-31)

> Continuation of Part 1. Covers Articles 4-5 (oneDNN Primitives + GPU Kernel Optimization).

---

## Article 4: oneDNN Primitive 体系 (Tasks 20-25)

### Task 20: PrimitiveLifecycle component (StepNavigator)

**Files:**
- Create: `src/components/interactive/PrimitiveLifecycle.tsx`

- [ ] **Step 1: Create the component**

StepNavigator-based: oneDNN primitive lifecycle step-by-step.

Requirements:
- Import `StepNavigator` from `'../primitives/StepNavigator'`
- 5 steps:
  1. "创建 Engine" — `dnnl::engine(gpu, 0)`: represents a GPU device. Visual: box labeled "Engine (GPU)" with device icon
  2. "创建 Primitive Descriptor" — describes WHAT to compute: operation type (matmul), input/output shapes, data types. Visual: form-like card with fields (op=MatMul, src=[M,K], dst=[M,N], dtype=FP16). Note: "此时 oneDNN 查询所有可用实现，选择最优"
  3. "创建 Primitive" — compiles the actual GPU kernel based on descriptor. Visual: descriptor → "Kernel Compilation" gear icon → Primitive object. Note: "这一步最慢，涉及 SPIR-V/OpenCL kernel 编译"
  4. "Execute" — submit to GPU stream with bound memory. Visual: Primitive + Input buffers → GPU execution → Output buffer. Note: "实际 GPU 执行，异步返回"
  5. "结果与复用" — output ready, primitive can be reused for same-shape inputs. Visual: results + primitive cache icon. Note: "Primitive 对象可缓存复用，避免重复编译"
- Each step: `<svg viewBox="0 0 580 160">`
- `const W = 580;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 21: MemoryFormatViz component

**Files:**
- Create: `src/components/interactive/MemoryFormatViz.tsx`

- [ ] **Step 1: Create the component**

Memory layout visualization: toggle between NCHW / nChw16c / nChw32c, show physical memory arrangement.

Requirements:
- `useState<'nchw' | 'nchw16c' | 'nchw32c'>` for format selection
- Visualize a small 4D tensor (e.g., N=1, C=32, H=4, W=4)
- NCHW: show channels laid out sequentially — C0 row, C1 row, ..., C31 row. Highlight that channel dimension is outermost
- nChw16c: show 2 channel groups (C0-C15, C16-C31), within each group H×W×16 interleaved. Highlight: "16 channels packed together → SIMD16 friendly"
- nChw32c: show 1 group of 32 channels packed. Highlight: "32 channels packed → SIMD32 / XMX friendly"
- Use colored grid cells: each cell = one element, color intensity by channel index
- Callout: "Blocked format 让连续内存地址对应连续 SIMD lanes，向量化效率最高"
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 22: PostOpFusion component

**Files:**
- Create: `src/components/interactive/PostOpFusion.tsx`

- [ ] **Step 1: Create the component**

Post-op fusion comparison: unfused vs fused kernel chain.

Requirements:
- `useState<'unfused' | 'fused'>` toggle
- Unfused view: 3 separate kernel boxes (Conv → ReLU → Sum) connected by arrows, each with "Read from memory" input and "Write to memory" output. Show: 3 kernel launches, 6 memory transactions
- Fused view: 1 merged kernel box (Conv+ReLU+Sum) with single input read and single output write. Show: 1 kernel launch, 2 memory transactions
- Metrics comparison bar: kernel launches (3 vs 1), memory reads/writes (6 vs 2), estimated speedup
- Highlight savings in `COLORS.green`, waste in `COLORS.waste`
- `const W = 580; const H = 320;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 23: PrimitiveCacheFlow component

**Files:**
- Create: `src/components/interactive/PrimitiveCacheFlow.tsx`

- [ ] **Step 1: Create the component**

Primitive cache workflow: request → cache lookup → hit/miss paths.

Requirements:
- `useState<'hit' | 'miss'>` to toggle scenario
- Flowchart-style layout:
  - Start: "New request (MatMul, [512,768], FP16)"
  - Decision: "Cache lookup" diamond
  - Hit path (`COLORS.green`): → "Cached Primitive found" → "Execute immediately" → show latency "~0.1ms"
  - Miss path (`COLORS.red`): → "No cached primitive" → "Compile kernel (~50-200ms)" → "Store in cache (LRU)" → "Execute" → show latency "~100ms"
- Bottom: cache stats display — "Cache size: 128 entries, Hit rate: 95%, LRU eviction"
- Animated highlight along the active path
- `const W = 580; const H = 340;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 24: OpDataTypeMatrix component (static)

**Files:**
- Create: `src/components/interactive/OpDataTypeMatrix.tsx`

- [ ] **Step 1: Create the component**

Static operation × data type support matrix for Xe2 iGPU.

Requirements:
- No state (static SVG)
- Table: rows = operations (MatMul, Convolution, Softmax, LayerNorm, Pooling, Eltwise, Reorder), columns = data types (FP32, FP16, BF16, INT8)
- Cell values: ✓ (supported, `COLORS.green`), △ (partial/emulated, `COLORS.orange`), ✗ (unsupported, `COLORS.red`)
- Xe2 iGPU specifics: MatMul/Conv support all types with XMX acceleration for INT8/BF16; Softmax/LayerNorm typically FP32/FP16; Eltwise supports all
- Recommended column: highlight BF16 for MatMul/Conv (best throughput/precision tradeoff on Xe2)
- `const W = 580; const H = 300;`

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: PASS

### Task 25: Article 4 MDX + commit

**Files:**
- Create: `src/content/articles/zh/onednn-primitives.mdx`

- [ ] **Step 1: Create the MDX article**

Frontmatter:
```yaml
title: "oneDNN Primitive 体系"
slug: onednn-primitives
locale: zh
tags: [intel, onednn, primitive, memory-format, operator-library]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [spirv-level-zero]
references:
  - type: website
    title: "oneDNN Developer Guide — Intel"
    url: "https://oneapi-src.github.io/oneDNN/"
  - type: repo
    title: "oneAPI Deep Neural Network Library (oneDNN) — GitHub"
    url: "https://github.com/oneapi-src/oneDNN"
  - type: website
    title: "oneDNN Programming Model — Intel"
    url: "https://oneapi-src.github.io/oneDNN/dev_guide_basic_concepts.html"
```

Content sections:
1. oneDNN 的定位与设计目标
2. Primitive 生命周期 + `<PrimitiveLifecycle client:visible />`
3. Memory 与 Format Tag + `<MemoryFormatViz client:visible />`
4. Propagation Kind 与 Fusion + `<PostOpFusion client:visible />`
5. Primitive Cache 机制 + `<PrimitiveCacheFlow client:visible />`
6. 支持的操作与数据类型 + `<OpDataTypeMatrix />`（静态）
7. 总结

- [ ] **Step 2: Validate and build**

Run: `npm run validate && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/PrimitiveLifecycle.tsx src/components/interactive/MemoryFormatViz.tsx src/components/interactive/PostOpFusion.tsx src/components/interactive/PrimitiveCacheFlow.tsx src/components/interactive/OpDataTypeMatrix.tsx src/content/articles/zh/onednn-primitives.mdx
git commit -m "feat(intel-igpu): add article 4 — oneDNN primitives (5 components)"
```

---

## Article 5: oneDNN GPU Kernel 优化 (Tasks 26-31)

### Task 26: GemmTilingHierarchy component (StepNavigator)

**Files:**
- Create: `src/components/interactive/GemmTilingHierarchy.tsx`

- [ ] **Step 1: Create the component**

StepNavigator-based: GEMM multi-level tiling step-by-step.

Requirements:
- Import `StepNavigator` from `'../primitives/StepNavigator'`
- 5 steps:
  1. "完整矩阵" — show full M×N output matrix C = A×B. Visual: two large matrices A[M,K] and B[K,N] with multiply sign, result C[M,N]
  2. "Global Tile 划分" — partition C into large tiles (e.g., 256×256). Visual: grid overlay on C matrix, each tile assigned to a work-group. Note: "每个 tile → 一个 work-group"
  3. "Work-group Tile" — zoom into one global tile, subdivide into sub-group tiles (e.g., 32×64). Visual: zoomed tile with sub-partitions. Note: "每个子 tile → 一个 sub-group"
  4. "Sub-group Tile → Register Tile" — zoom further: each sub-group tile broken into register-level tiles (e.g., 8×16). Visual: tiny tiles fitting in GRF. Note: "每个 register tile → 一次 XMX 操作"
  5. "数据流总结" — show the full hierarchy with arrows: Global Memory → SLM (work-group tile) → GRF (register tile) → XMX (compute). Visual: waterfall with memory levels and tile sizes
- Each step: `<svg viewBox="0 0 580 180">`
- `const W = 580;`

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: PASS

### Task 27: XmxUtilization component

**Files:**
- Create: `src/components/interactive/XmxUtilization.tsx`

- [ ] **Step 1: Create the component**

XMX utilization calculator: input matrix dims and data type, show utilization.

Requirements:
- `useState` for: M (32-4096, slider), K (32-4096), N (32-4096), dtype (`'fp16' | 'bf16' | 'int8'`)
- XMX specs per dtype: INT8 systolic depth=8, ops/cycle=128; BF16 depth=8, ops/cycle=64; FP16 depth=8, ops/cycle=64
- Calculate: alignment requirements (M,N,K must be multiples of certain values), actual ops vs theoretical peak, utilization percentage
- Display: utilization bar, alignment waste percentage, "理论吞吐" vs "实际吞吐" comparison
- Color: high utilization (`COLORS.green`), medium (`COLORS.orange`), low (`COLORS.red`)
- `const W = 580; const H = 360;`

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: PASS

### Task 28: SlmBankConflict component

**Files:**
- Create: `src/components/interactive/SlmBankConflict.tsx`

- [ ] **Step 1: Create the component**

SLM bank conflict visualization.

Requirements:
- `useState<'no-conflict' | 'conflict'>` for access pattern toggle
- Display 16 SLM banks as vertical columns
- No-conflict mode: 16 threads each access different banks (arrows from thread to unique bank, all `COLORS.green`)
- Conflict mode: multiple threads access same bank (some arrows converge on same bank, conflicts highlighted in `COLORS.red`, serial access shown)
- Bottom: latency comparison — "无冲突: 1 cycle" vs "4-way 冲突: 4 cycles"
- Middle: show stride-based access pattern that causes conflicts (stride = 16 = bank count → all hit same bank)
- `const W = 580; const H = 360;`

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: PASS

### Task 29: MixedPrecisionCompare component

**Files:**
- Create: `src/components/interactive/MixedPrecisionCompare.tsx`

- [ ] **Step 1: Create the component**

Mixed precision performance comparison on Xe2.

Requirements:
- `useState<'fp32' | 'fp16' | 'bf16' | 'int8'>` for selected data type
- Four clickable buttons for data type selection
- For each type show (as horizontal bars):
  - Compute throughput (TOPS): FP32=baseline(1x), FP16=2x, BF16=2x, INT8=4x
  - Memory bandwidth savings: FP32=1x, FP16=2x, BF16=2x, INT8=4x
  - Precision: FP32=highest, FP16=good, BF16=good for training, INT8=needs calibration
  - XMX acceleration: FP32=no, FP16=yes, BF16=yes, INT8=yes
- Recommendation box that changes with selection
- `const W = 580; const H = 360;`

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: PASS

### Task 30: MemoryAccessPattern component

**Files:**
- Create: `src/components/interactive/MemoryAccessPattern.tsx`

- [ ] **Step 1: Create the component**

Memory access pattern: coalesced vs non-coalesced.

Requirements:
- `useState<'coalesced' | 'scattered'>` for pattern toggle
- Top: row of 8 EU threads (T0-T7)
- Bottom: row of memory addresses (cache lines)
- Coalesced: T0→addr0, T1→addr1, ..., T7→addr7 (adjacent). One cache line fetch. "100% bandwidth utilization" (`COLORS.green`)
- Scattered: random addresses. Multiple cache line fetches. "12.5% bandwidth utilization" (`COLORS.red`)
- `const W = 580; const H = 320;`

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: PASS

### Task 31: Article 5 MDX + commit

**Files:**
- Create: `src/content/articles/zh/onednn-gpu-optimization.mdx`

- [ ] **Step 1: Create the MDX article**

Frontmatter:
```yaml
title: "oneDNN GPU Kernel 优化"
slug: onednn-gpu-optimization
locale: zh
tags: [intel, onednn, kernel-optimization, gemm, xmx, mixed-precision]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [onednn-primitives]
references:
  - type: website
    title: "oneDNN Performance Profiling and Inspection — Intel"
    url: "https://oneapi-src.github.io/oneDNN/dev_guide_profiling.html"
  - type: website
    title: "oneAPI GPU Optimization Guide — GEMM — Intel"
    url: "https://www.intel.com/content/www/us/en/docs/oneapi/optimization-guide-gpu/2025-0/general-matrix-multiply.html"
  - type: website
    title: "XMX and XVE Architecture — Intel"
    url: "https://www.intel.com/content/www/us/en/docs/oneapi/optimization-guide-gpu/2025-0/xe-matrix-extensions-xmx.html"
```

Content sections:
1. GEMM 在 AI 推理中的核心地位
2. Xe2 GEMM Tiling 策略 + `<GemmTilingHierarchy client:visible />`
3. XMX 利用率优化 + `<XmxUtilization client:visible />`
4. SLM 使用模式 + `<SlmBankConflict client:visible />`
5. 混合精度推理 + `<MixedPrecisionCompare client:visible />`
6. 内存访问优化 + `<MemoryAccessPattern client:visible />`
7. 总结

- [ ] **Step 2: Validate and build**

Run: `npm run validate && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/GemmTilingHierarchy.tsx src/components/interactive/XmxUtilization.tsx src/components/interactive/SlmBankConflict.tsx src/components/interactive/MixedPrecisionCompare.tsx src/components/interactive/MemoryAccessPattern.tsx src/content/articles/zh/onednn-gpu-optimization.mdx
git commit -m "feat(intel-igpu): add article 5 — oneDNN GPU kernel optimization (5 components)"
```

---

**End of Part 2 (Tasks 20-31): Articles 4-5 (10 components)**
