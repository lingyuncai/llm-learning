# Intel iGPU 推理深度解析 Implementation Plan (Part 1: Tasks 1-16)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create "Intel iGPU 推理深度解析：Xe2 架构、oneDNN 与 OpenVINO" learning path with 8 articles, 38 interactive components, 1 path YAML.

**Architecture:** Astro + MDX articles with React interactive components (SVG-based). Each article has 4-5 components in `src/components/interactive/`, MDX in `src/content/articles/zh/`. Path defined in YAML.

**Tech Stack:** Astro 5, React, TypeScript, SVG, Motion (framer-motion), StepNavigator primitive

---

### Task 1: Create path YAML

**Files:**
- Create: `src/content/paths/intel-igpu-inference.yaml`

- [ ] **Step 1: Create the path YAML file**

```yaml
id: intel-igpu-inference
title:
  zh: "Intel iGPU 推理深度解析：Xe2 架构、oneDNN 与 OpenVINO"
  en: "Intel iGPU Inference Deep Dive: Xe2 Architecture, oneDNN & OpenVINO"
description:
  zh: "从 Xe2 微架构到 oneDNN primitive 体系，从 SPIR-V 编译管线到 OpenVINO 图优化，从性能瓶颈诊断到 GPU+NPU 协同推理，系统理解 Intel iGPU 上的 AI 推理优化全栈。"
  en: "From Xe2 microarchitecture to oneDNN primitives, from SPIR-V compilation to OpenVINO graph optimization, from performance analysis to GPU+NPU co-inference — a systematic deep dive into AI inference on Intel iGPU."
level: advanced
articles:
  - xe2-gpu-architecture
  - xe2-execution-model
  - spirv-level-zero
  - onednn-primitives
  - onednn-gpu-optimization
  - openvino-graph-pipeline
  - igpu-performance-analysis
  - npu-gpu-co-inference
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/intel-igpu-inference.yaml
git commit -m "feat(intel-igpu): add learning path YAML"
```

---

## Article 1: Xe2 GPU 架构 (Tasks 2-7)

### Task 2: Xe2HierarchyDiagram component

**Files:**
- Create: `src/components/interactive/Xe2HierarchyDiagram.tsx`

- [ ] **Step 1: Create the component**

Interactive Xe2 architecture hierarchy: GPU → Slice → Xe-core → EU. Click each level to expand internal structure, show resource counts and functions.

Requirements:
- `useState` to track which level is expanded (`'gpu' | 'slice' | 'xecore' | 'eu' | null`)
- Top-down layout: GPU box at top, click to reveal Slices, click Slice to reveal Xe-cores, click Xe-core to reveal EUs
- Each level shows: name, count, key specs (e.g., "8 Xe-cores per Slice", "16 EUs per Xe-core")
- Color coding: GPU=`COLORS.dark`, Slice=`COLORS.primary`, Xe-core=`COLORS.green`, EU=`COLORS.purple`
- Lunar Lake specs: 1 Slice → 4 Xe-cores → 16 EUs per Xe-core (128 EUs total)
- `const W = 580; const H = 420;`
- SVG viewBox, COLORS, FONTS imports as per convention

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 3: EUInternalView component

**Files:**
- Create: `src/components/interactive/EUInternalView.tsx`

- [ ] **Step 1: Create the component**

EU internal structure diagram: Vector Engine, XMX unit, GRF, thread slots. Hover to show throughput specs for each part.

Requirements:
- `useState<string | null>` for hovered part ID
- Layout: EU as outer box, internal blocks for Vector Engine (SIMD8 ALU), XMX (matrix engine), GRF (register file), Thread Slots (8 threads)
- Hover tooltip shows specs: Vector Engine "FP32: 8 ops/cycle", XMX "INT8: 128 ops/cycle, BF16: 64 ops/cycle", GRF "128 × 32B registers per thread", Thread Slots "8 concurrent threads"
- `const W = 580; const H = 360;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 4: MemoryHierarchyStack component

**Files:**
- Create: `src/components/interactive/MemoryHierarchyStack.tsx`

- [ ] **Step 1: Create the component**

Memory hierarchy waterfall: GRF → SLM → L1 → L2 → System Memory. Each level shows capacity/bandwidth/latency. Toggle iGPU vs discrete GPU comparison.

Requirements:
- `useState<'igpu' | 'dgpu'>` for mode toggle
- Vertical stack of rectangles, widest at bottom (system memory), narrowest at top (GRF)
- iGPU data: GRF (128×32B/thread, ~TB/s), SLM (64KB/Xe-core, ~2TB/s), L1 (variable), L2 (4MB, ~1TB/s), LPDDR5x (shared, ~90GB/s)
- dGPU comparison data: similar hierarchy but HBM/GDDR at bottom (~1TB/s+), dedicated VRAM
- Key insight highlighted: iGPU shares system memory bandwidth with CPU
- `const W = 580; const H = 400;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 5: XeVsCudaMapping component

**Files:**
- Create: `src/components/interactive/XeVsCudaMapping.tsx`

- [ ] **Step 1: Create the component**

Static mapping table: Xe2 concepts ↔ CUDA concepts.

Requirements:
- No state needed (static SVG)
- Two-column table with connecting lines between corresponding concepts
- Mappings: EU ↔ CUDA Core, Xe-core ↔ SM, SLM ↔ Shared Memory, Sub-group ↔ Warp, Work-group ↔ Thread Block, Work-item ↔ Thread, GRF ↔ Register File, XMX ↔ Tensor Core, Level Zero ↔ CUDA Runtime, SPIR-V ↔ PTX
- Left column (Intel blue `COLORS.primary`), right column (NVIDIA green `COLORS.green`)
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 6: GenSpecCompare component

**Files:**
- Create: `src/components/interactive/GenSpecCompare.tsx`

- [ ] **Step 1: Create the component**

Lunar Lake vs Panther Lake spec comparison with sliding toggle.

Requirements:
- `useState<'lunar' | 'panther'>` for generation selection
- Side-by-side or toggle between two spec cards
- Specs to compare: EU count (128 vs ~160), XMX TOPS (INT8/BF16), SLM per Xe-core, L2 cache, Memory type & bandwidth (LPDDR5x), AI inference peak TOPS
- Bar chart visualization for key metrics with animated transitions
- Highlight which specs improved in Panther Lake
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 7: Article 1 MDX + commit

**Files:**
- Create: `src/content/articles/zh/xe2-gpu-architecture.mdx`

- [ ] **Step 1: Create the MDX article**

Frontmatter:
```yaml
title: "Xe2 GPU 架构"
slug: xe2-gpu-architecture
locale: zh
tags: [intel, xe2, gpu-architecture, igpu, lunar-lake, panther-lake]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [ai-compute-stack]
references:
  - type: website
    title: "Intel Xe2 Architecture — Intel"
    url: "https://www.intel.com/content/www/us/en/docs/oneapi/optimization-guide-gpu/2025-0/intel-xe2-gpu-architecture.html"
  - type: website
    title: "Intel Data Center GPU Max Series Architecture — Intel"
    url: "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-data-center-gpu-max-series-overview.html"
  - type: website
    title: "oneAPI GPU Optimization Guide — Intel"
    url: "https://www.intel.com/content/www/us/en/docs/oneapi/optimization-guide-gpu/2025-0/overview.html"
```

Content sections:
1. 从 Xe 到 Xe2 的演进 + `<Xe2HierarchyDiagram client:visible />`
2. Xe2 微架构层次
3. EU 内部结构 + `<EUInternalView client:visible />`
4. 内存层次 + `<MemoryHierarchyStack client:visible />`
5. 概念映射 + `<XeVsCudaMapping />`（静态，无 client:visible）
6. Lunar Lake vs Panther Lake + `<GenSpecCompare client:visible />`
7. 推荐学习资源
8. 总结

- [ ] **Step 2: Validate and build**

Run: `npm run validate && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/Xe2HierarchyDiagram.tsx src/components/interactive/EUInternalView.tsx src/components/interactive/MemoryHierarchyStack.tsx src/components/interactive/XeVsCudaMapping.tsx src/components/interactive/GenSpecCompare.tsx src/content/articles/zh/xe2-gpu-architecture.mdx
git commit -m "feat(intel-igpu): add article 1 — Xe2 GPU architecture (5 components)"
```

---

## Article 2: Xe2 执行模型与编程抽象 (Tasks 8-13)

### Task 8: SimtVsSimd component (StepNavigator)

**Files:**
- Create: `src/components/interactive/SimtVsSimd.tsx`

- [ ] **Step 1: Create the component**

StepNavigator-based: step-by-step comparison of SIMT (CUDA) vs SIMD (Xe2) execution models.

Requirements:
- Import `StepNavigator` from `'../primitives/StepNavigator'`
- 4 steps:
  1. "SIMT 模型 (CUDA)" — show 32 threads (warp) each with independent PC, executing same instruction but can diverge. Visual: grid of 32 small boxes each with a tiny arrow (PC), all pointing same direction
  2. "SIMD 模型 (Xe2)" — show compiler-vectorized execution: one instruction operates on SIMD8/16 lanes. Visual: one big instruction box with 8/16 data lanes flowing through
  3. "分支处理差异" — SIMT: divergent threads masked (some boxes grayed). SIMD: compiler generates predicated instructions, no runtime penalty for uniform branches
  4. "对编程的影响" — SIMT: "think in threads", SIMD: "think in vectors". Summary table of key differences
- Each step: `<svg viewBox="0 0 580 160">` with visual content
- `const W = 580;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 9: ThreadHierarchyMap component

**Files:**
- Create: `src/components/interactive/ThreadHierarchyMap.tsx`

- [ ] **Step 1: Create the component**

Thread hierarchy mapping: left side software abstractions, right side hardware resources, connecting lines.

Requirements:
- `useState<string | null>` for hovered level
- Left column (software): ND-Range → Work-group → Sub-group → Work-item (top to bottom)
- Right column (hardware): GPU → Xe-core → EU → Thread Slot (top to bottom)
- Connecting lines between corresponding levels with arrows
- Hover on any level highlights the corresponding pair and the connecting line
- Color: software side `COLORS.primary`, hardware side `COLORS.green`, active line `COLORS.orange`
- Show counts: "1 Work-group → 1 Xe-core", "1 Sub-group = 8/16/32 Work-items → 1 EU SIMD lane group"
- `const W = 580; const H = 340;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 10: SubgroupOps component

**Files:**
- Create: `src/components/interactive/SubgroupOps.tsx`

- [ ] **Step 1: Create the component**

Sub-group operation visualization: select shuffle/broadcast/reduce, animate data flow between lanes.

Requirements:
- `useState<'shuffle' | 'broadcast' | 'reduce'>` for operation mode
- Display 8 lanes (SIMD8) as colored boxes with values
- Three buttons to switch operation
- shuffle: lanes exchange values with configurable offset (visual: arrows crossing between lanes)
- broadcast: one lane's value copies to all others (visual: one highlighted box, arrows fan out)
- reduce: all values accumulate into one (visual: arrows converge, sum shown)
- Animated transitions using SVG + state changes (no motion library needed, use CSS transitions or simple state)
- `const W = 580; const H = 300;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 11: OccupancyCalculator component

**Files:**
- Create: `src/components/interactive/OccupancyCalculator.tsx`

- [ ] **Step 1: Create the component**

Occupancy calculator: input GRF usage, SLM size, work-group size → compute occupancy.

Requirements:
- `useState` for three sliders: GRF per thread (32-128 registers), SLM per work-group (0-64KB), work-group size (8-512)
- Xe2 constraints: 128 GRF registers per thread × 8 threads per EU = 1024 total GRF, 64KB SLM per Xe-core, 16 EUs per Xe-core
- Calculate: max concurrent threads per Xe-core based on GRF and SLM limits
- Display: occupancy bar (percentage), limiting factor highlighted (GRF-limited vs SLM-limited vs thread-limited)
- Visual: stacked bar showing used vs available resources
- `const W = 580; const H = 360;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 12: SyclToHardware component

**Files:**
- Create: `src/components/interactive/SyclToHardware.tsx`

- [ ] **Step 1: Create the component**

SYCL code to hardware mapping: left shows SYCL kernel code, right highlights activated hardware resources.

Requirements:
- `useState<number | null>` for hovered code line index
- Left panel: simplified SYCL kernel code (6-8 lines), styled as code block with mono font
- Right panel: Xe2 hardware diagram (simplified Xe-core with EUs, SLM, GRF)
- Code lines mapping: `nd_range` → GPU dispatch, `local_accessor` → SLM allocation, `sub_group sg` → EU SIMD lanes, `sg.shuffle()` → EU shuffle unit, `barrier()` → SLM sync
- Hover code line → right side highlights corresponding hardware resource with glow effect
- `const W = 580; const H = 340;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 13: Article 2 MDX + commit

**Files:**
- Create: `src/content/articles/zh/xe2-execution-model.mdx`

- [ ] **Step 1: Create the MDX article**

Frontmatter:
```yaml
title: "Xe2 执行模型与编程抽象"
slug: xe2-execution-model
locale: zh
tags: [intel, xe2, simd, sycl, execution-model, workgroup]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [xe2-gpu-architecture]
references:
  - type: website
    title: "oneAPI GPU Optimization Guide — Thread Hierarchy — Intel"
    url: "https://www.intel.com/content/www/us/en/docs/oneapi/optimization-guide-gpu/2025-0/thread-mapping.html"
  - type: website
    title: "SYCL 2020 Specification — Khronos Group"
    url: "https://registry.khronos.org/SYCL/specs/sycl-2020/html/sycl-2020.html"
  - type: website
    title: "Intel GPU Occupancy Calculator — Intel"
    url: "https://www.intel.com/content/www/us/en/docs/oneapi/optimization-guide-gpu/2025-0/occupancy.html"
```

Content sections:
1. SIMT vs SIMD 的本质差异 + `<SimtVsSimd client:visible />`
2. 线程层次 + `<ThreadHierarchyMap client:visible />`
3. Sub-group 的核心地位 + `<SubgroupOps client:visible />`
4. 同步与 Barrier
5. Occupancy 与资源平衡 + `<OccupancyCalculator client:visible />`
6. SYCL/DPC++ 编程映射 + `<SyclToHardware client:visible />`
7. 总结

- [ ] **Step 2: Validate and build**

Run: `npm run validate && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SimtVsSimd.tsx src/components/interactive/ThreadHierarchyMap.tsx src/components/interactive/SubgroupOps.tsx src/components/interactive/OccupancyCalculator.tsx src/components/interactive/SyclToHardware.tsx src/content/articles/zh/xe2-execution-model.mdx
git commit -m "feat(intel-igpu): add article 2 — Xe2 execution model (5 components)"
```

---

## Article 3: SPIR-V 编译与 Level Zero 运行时 (Tasks 14-19)

### Task 14: CompilationPipeline component (StepNavigator)

**Files:**
- Create: `src/components/interactive/CompilationPipeline.tsx`

- [ ] **Step 1: Create the component**

StepNavigator-based: DPC++ → SPIR-V → Xe2 ISA compilation pipeline step-by-step.

Requirements:
- Import `StepNavigator` from `'../primitives/StepNavigator'`
- 5 steps:
  1. "DPC++ 源码" — show SYCL kernel code snippet, highlight: high-level C++ with parallel constructs
  2. "LLVM IR" — show intermediate: DPC++ compiler frontend → LLVM IR. Visual: code → box labeled "DPC++ Frontend (clang)" → LLVM IR block
  3. "SPIR-V" — LLVM IR → SPIR-V backend. Visual: LLVM IR → "SPIR-V Backend" → SPIR-V binary. Note: platform-independent, can be distributed
  4. "Xe2 ISA (JIT)" — SPIR-V → Intel GPU Compiler (IGC) → native Xe2 instructions. Visual: SPIR-V → "IGC JIT Compiler" → Xe2 binary. Note: happens at runtime, target-specific optimizations
  5. "GPU 执行" — Xe2 binary dispatched to EUs via Level Zero. Visual: binary → "Level Zero Submit" → EU grid executing
- Each step: `<svg viewBox="0 0 580 160">` with pipeline boxes and arrows
- `const W = 580;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 15: SpirvVsPtx component (static)

**Files:**
- Create: `src/components/interactive/SpirvVsPtx.tsx`

- [ ] **Step 1: Create the component**

Static comparison: SPIR-V vs PTX/CUDA compilation chains side by side.

Requirements:
- No state (static SVG)
- Two parallel vertical pipelines:
  - Left (Intel, `COLORS.primary`): DPC++/SYCL → clang → LLVM IR → SPIR-V → IGC → Xe2 ISA
  - Right (NVIDIA, `COLORS.green`): CUDA C++ → nvcc → LLVM IR → PTX → ptxas → SASS
- Horizontal dashed lines connecting equivalent stages
- Labels for each stage indicating: "Source", "Compiler Frontend", "IR", "Target-Independent IR", "Target Compiler", "Native ISA"
- Key difference callout box: "SPIR-V is standardized (Khronos) & multi-vendor; PTX is NVIDIA-proprietary"
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 16: JitVsAot component

**Files:**
- Create: `src/components/interactive/JitVsAot.tsx`

- [ ] **Step 1: Create the component**

JIT vs AOT comparison with toggle.

Requirements:
- `useState<'jit' | 'aot'>` for mode selection
- Two toggle buttons at top
- Comparison dimensions displayed as horizontal bars or cards:
  - 编译时机: JIT="运行时（首次执行前）" / AOT="构建时（部署前）"
  - 启动延迟: JIT=high (bar long, `COLORS.red`) / AOT=low (bar short, `COLORS.green`)
  - 优化程度: JIT=high ("针对具体硬件") / AOT=medium ("通用优化")
  - 二进制大小: JIT=small ("只含 SPIR-V") / AOT=large ("含所有目标 ISA")
  - 使用者: JIT="oneDNN (runtime kernel generation)" / AOT="OpenVINO model cache"
- Highlight active mode's column, dim the other
- `const W = 580; const H = 340;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 17: LevelZeroDispatch component (StepNavigator)

**Files:**
- Create: `src/components/interactive/LevelZeroDispatch.tsx`

- [ ] **Step 1: Create the component**

StepNavigator-based: kernel dispatch flow through Level Zero API.

Requirements:
- Import `StepNavigator` from `'../primitives/StepNavigator'`
- 6 steps:
  1. "创建 Context" — zeContextCreate: logical container for resources. Visual: box labeled "Context" containing empty space
  2. "创建 Module" — zeModuleCreate: load SPIR-V binary, JIT compile. Visual: SPIR-V binary → compiler → Module (contains compiled kernels)
  3. "创建 Kernel" — zeKernelCreate: extract specific kernel from module, set group size. Visual: Module → extract → Kernel object with parameters
  4. "创建 Command List" — zeCommandListCreate: record GPU commands. Visual: empty command list (like a tape)
  5. "Append & Submit" — zeCommandListAppendLaunchKernel + zeCommandQueueExecuteCommandLists. Visual: kernel appended to command list → submitted to queue → GPU starts executing
  6. "同步等待" — zeFenceHostSynchronize: CPU waits for GPU completion. Visual: CPU waiting → fence signal → results ready
- Each step: highlight the API object being created/used
- `const W = 580;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 18: MemoryModelViz component

**Files:**
- Create: `src/components/interactive/MemoryModelViz.tsx`

- [ ] **Step 1: Create the component**

iGPU unified memory model: Host/Device/Shared allocation modes.

Requirements:
- `useState<'host' | 'device' | 'shared'>` for allocation mode
- Three toggle buttons
- Visual: CPU box (left) and GPU box (right) with system memory (LPDDR5x) bar at bottom spanning both
- Host mode: allocation in CPU-visible region, GPU access needs cache coherency. Arrow: CPU → Memory (solid), GPU → Memory (dashed, "cache coherent")
- Device mode: allocation in GPU-preferred region, CPU access slow. Arrow: GPU → Memory (solid), CPU → Memory (dashed, "slow path")
- Shared mode (USM): both CPU and GPU access same virtual address. Arrow: both solid, "zero-copy on iGPU!" highlighted
- Key insight box: "iGPU 与 CPU 共享物理内存 → Shared (USM) 实现真正零拷贝，这是 iGPU 相比独显的独特优势"
- `const W = 580; const H = 340;`

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

### Task 19: Article 3 MDX + commit

**Files:**
- Create: `src/content/articles/zh/spirv-level-zero.mdx`

- [ ] **Step 1: Create the MDX article**

Frontmatter:
```yaml
title: "SPIR-V 编译与 Level Zero 运行时"
slug: spirv-level-zero
locale: zh
tags: [intel, spirv, level-zero, compiler, runtime, jit, aot]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [xe2-execution-model]
references:
  - type: website
    title: "SPIR-V Specification — Khronos Group"
    url: "https://registry.khronos.org/SPIR-V/specs/unified1/SPIRV.html"
  - type: website
    title: "oneAPI Level Zero Specification — Intel"
    url: "https://spec.oneapi.io/level-zero/latest/index.html"
  - type: repo
    title: "Intel Graphics Compiler (IGC) — GitHub"
    url: "https://github.com/intel/intel-graphics-compiler"
```

Content sections:
1. 从源码到 GPU 执行的全链路 + `<CompilationPipeline client:visible />`
2. SPIR-V 的设计哲学 + `<SpirvVsPtx />`（静态）
3. 编译策略：JIT vs AOT + `<JitVsAot client:visible />`
4. Level Zero API 核心抽象
5. Kernel Dispatch 流程 + `<LevelZeroDispatch client:visible />`
6. 内存管理 + `<MemoryModelViz client:visible />`
7. 总结

- [ ] **Step 2: Validate and build**

Run: `npm run validate && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/CompilationPipeline.tsx src/components/interactive/SpirvVsPtx.tsx src/components/interactive/JitVsAot.tsx src/components/interactive/LevelZeroDispatch.tsx src/components/interactive/MemoryModelViz.tsx src/content/articles/zh/spirv-level-zero.mdx
git commit -m "feat(intel-igpu): add article 3 — SPIR-V & Level Zero (5 components)"
```

--- 

**End of Part 1 (Tasks 1-19): Path YAML + Articles 1-3 (15 components)**
