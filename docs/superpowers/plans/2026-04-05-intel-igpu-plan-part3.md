# Intel iGPU 推理深度解析 Implementation Plan (Part 3: Tasks 32-46)

> Continuation of Part 2. Covers Articles 6-8 (OpenVINO + Performance Analysis + NPU) + TODO update + validation.

---

## Article 6: OpenVINO 图优化 Pipeline (Tasks 32-37)

### Task 32: OpenVINOArchOverview component

**Files:**
- Create: `src/components/interactive/OpenVINOArchOverview.tsx`

- [ ] **Step 1: Create the component**

OpenVINO three-stage architecture: Frontend → Core → Plugin. Click each stage to expand internal modules.

Requirements:
- `useState<'frontend' | 'core' | 'plugin' | null>` for expanded stage
- Three large boxes in a row with arrows between them
- Frontend (collapsed): "Model Import". Expanded: ONNX Reader, PaddlePaddle Reader, TF Reader, Model Optimizer (legacy)
- Core (collapsed): "ov::Model IR". Expanded: Operations graph, Tensor descriptors, Dynamic shape support, Common optimizations
- Plugin (collapsed): "Device Execution". Expanded: GPU Plugin (oneDNN + OpenCL), CPU Plugin (oneDNN + ACL), NPU Plugin, AUTO/MULTI/HETERO
- Click to expand/collapse each stage, showing internal modules
- Data flow arrows: "ONNX/TF/PaddlePaddle" → Frontend → "ov::Model" → Core optimizations → "Optimized Model" → Plugin → "Device-specific binary"
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 33: GraphOptPasses component (StepNavigator)

**Files:**
- Create: `src/components/interactive/GraphOptPasses.tsx`

- [ ] **Step 1: Create the component**

StepNavigator-based: graph optimization passes step-by-step.

Requirements:
- Import `StepNavigator` from `'../primitives/StepNavigator'`
- 5 steps:
  1. "原始计算图" — show a small graph: Input → Conv → BatchNorm → ReLU → MatMul → Add → Output (7 nodes). Node count displayed
  2. "常量折叠 (Constant Folding)" — BatchNorm weights pre-computed, BN node merged into Conv weights. Graph: Input → Conv(with BN) → ReLU → MatMul → Add → Output (6 nodes). Highlight removed node in `COLORS.waste`
  3. "死节点消除 (DCE)" — remove any unreachable nodes (show a dangling node being removed). Graph stays at 6 nodes or goes to 5
  4. "算子融合 (Fusion)" — Conv+ReLU fused into single ConvReLU kernel, MatMul+Add fused. Graph: Input → ConvReLU → MatMulAdd → Output (4 nodes). Show dramatic node reduction
  5. "Layout 插入" — insert Reorder nodes where GPU needs blocked format (nChw16c). Graph: Input → Reorder(NCHW→nChw16c) → ConvReLU → MatMulAdd → Reorder(nChw16c→NCHW) → Output. Note: "Reorder 开销在首次推理时发生"
- Each step: `<svg viewBox="0 0 580 160">` with graph nodes and edges
- `const W = 580;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 34: PluginKernelSelection component

**Files:**
- Create: `src/components/interactive/PluginKernelSelection.tsx`

- [ ] **Step 1: Create the component**

GPU Plugin kernel selection flow for a given operator.

Requirements:
- `useState<'matmul' | 'softmax' | 'layernorm'>` for operator selection
- Three buttons to pick operator
- Flowchart for each operator:
  - MatMul: "Check oneDNN MatMul primitive" → "Available with XMX?" → Yes → "Use oneDNN (SPIR-V kernel)" / No → "Fallback to OpenCL custom kernel"
  - Softmax: "Check oneDNN Softmax" → "GPU optimized?" → Yes → "Use oneDNN" / Limited → "Use OpenCL reference kernel"
  - LayerNorm: similar flow
- Each path shows: kernel source, expected performance tier (★★★ / ★★ / ★)
- Key insight: "oneDNN primitives 是首选，OpenCL kernels 是 fallback"
- `const W = 580; const H = 340;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 35: ModelCacheFlow component

**Files:**
- Create: `src/components/interactive/ModelCacheFlow.tsx`

- [ ] **Step 1: Create the component**

Model cache workflow: first load vs cached load comparison.

Requirements:
- `useState<'first' | 'cached'>` for scenario toggle
- Timeline visualization (horizontal):
  - First load: [Read Model 50ms] → [Graph Optimize 100ms] → [Compile Kernels 2000ms] → [Serialize Cache 200ms] → [Ready]. Total ~2350ms, `COLORS.red` tint
  - Cached load: [Read Model 50ms] → [Load Cache 100ms] → [Ready]. Total ~150ms, `COLORS.green` tint
- Speedup callout: "缓存加速 ~15x 启动时间"
- Bottom info: cache key components (model hash, device ID, driver version, compiler version)
- `const W = 580; const H = 300;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 36: AsyncPipeline component

**Files:**
- Create: `src/components/interactive/AsyncPipeline.tsx`

- [ ] **Step 1: Create the component**

Async inference pipeline: Gantt chart comparing sync vs async modes.

Requirements:
- `useState<'sync' | 'async'>` for mode toggle
- Gantt chart with time axis (horizontal), rows for CPU and GPU
- Sync mode: CPU submits request → waits → GPU processes → CPU gets result → CPU submits next. Show idle gaps on both CPU and GPU
- Async mode: CPU submits request 1 → immediately submits request 2 → GPU processes request 1 while CPU prepares request 3. Pipeline overlaps, minimal idle time
- Show throughput metric: sync "100 infer/s" vs async "280 infer/s"
- Color: active=`COLORS.primary` (CPU) / `COLORS.green` (GPU), idle=`COLORS.masked`
- `const W = 580; const H = 300;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 37: Article 6 MDX + commit

**Files:**
- Create: `src/content/articles/zh/openvino-graph-pipeline.mdx`

- [ ] **Step 1: Create the MDX article**

Frontmatter:
```yaml
title: "OpenVINO 图优化 Pipeline"
slug: openvino-graph-pipeline
locale: zh
tags: [intel, openvino, graph-optimization, model-compilation, plugin]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [onednn-primitives]
references:
  - type: website
    title: "OpenVINO Architecture — Intel"
    url: "https://docs.openvino.ai/2024/documentation/openvino-ir-format.html"
  - type: website
    title: "OpenVINO GPU Plugin — Intel"
    url: "https://docs.openvino.ai/2024/openvino-workflow/running-inference/inference-devices-and-modes/gpu-device.html"
  - type: repo
    title: "OpenVINO Toolkit — GitHub"
    url: "https://github.com/openvinotoolkit/openvino"
```

Content sections:
1. OpenVINO 的整体架构 + `<OpenVINOArchOverview client:visible />`
2. 模型表示：ov::Model
3. 通用图优化 Pass + `<GraphOptPasses client:visible />`
4. GPU Plugin 的设备特定优化 + `<PluginKernelSelection client:visible />`
5. 模型缓存机制 + `<ModelCacheFlow client:visible />`
6. 推理请求与异步执行 + `<AsyncPipeline client:visible />`
7. 总结

- [ ] **Step 2: Validate and build**

Run: `npm run validate && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/OpenVINOArchOverview.tsx src/components/interactive/GraphOptPasses.tsx src/components/interactive/PluginKernelSelection.tsx src/components/interactive/ModelCacheFlow.tsx src/components/interactive/AsyncPipeline.tsx src/content/articles/zh/openvino-graph-pipeline.mdx
git commit -m "feat(intel-igpu): add article 6 — OpenVINO graph pipeline (5 components)"
```

---

## Article 7: 性能分析与瓶颈诊断 (Tasks 38-42)

### Task 38: IGpuRoofline component

**Files:**
- Create: `src/components/interactive/IGpuRoofline.tsx`

- [ ] **Step 1: Create the component**

Xe2 iGPU Roofline chart with interactive kernel data points.

Requirements:
- `useState` for selected kernel(s) to display
- Log-log roofline plot: X-axis = arithmetic intensity (FLOP/Byte), Y-axis = performance (GFLOPS or TOPS)
- Two roofline ceilings: XMX peak (higher, for matrix ops) and Vector peak (lower, for non-matrix ops)
- Memory bandwidth slope: LPDDR5x ~90 GB/s
- Ridge point (intersection) highlighted
- Pre-defined kernel data points (toggleable): MatMul-large (high AI, compute-bound), MatMul-small (low AI, memory-bound), Softmax (very low AI, memory-bound), LayerNorm (low AI), Conv (medium AI)
- Click to add/remove kernels from the chart
- Color: compute-bound region `COLORS.green`, memory-bound region `COLORS.orange`
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 39: BottleneckDiagnosisTree component

**Files:**
- Create: `src/components/interactive/BottleneckDiagnosisTree.tsx`

- [ ] **Step 1: Create the component**

Interactive bottleneck diagnosis decision tree.

Requirements:
- `useState<number>` for current node in the tree
- Decision tree structure (nodes):
  - Root: "性能不达标" → "GPU 利用率高吗？"
  - If GPU utilization high: → "Arithmetic Intensity 高吗？" → Yes: "Compute-bound: 降低精度/用 XMX" / No: "Memory-bound: 减少数据搬运/用 blocked format"
  - If GPU utilization low: → "CPU 占比高吗？" → Yes: "Host-bound: 减少 CPU↔GPU 同步/用异步推理" / No: "Throttling? 检查功耗/温度限制"
- Each node: question/diagnosis box, two branches
- Active path highlighted, inactive paths dimmed
- Leaf nodes show specific optimization recommendations
- `const W = 580; const H = 400;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 40: VTuneGpuProfile component (static)

**Files:**
- Create: `src/components/interactive/VTuneGpuProfile.tsx`

- [ ] **Step 1: Create the component**

Static VTune GPU profiling view annotation guide.

Requirements:
- No state (static SVG)
- Simulated VTune GPU timeline view with labeled regions:
  - Top bar: "GPU Elapsed Time" with segments for different kernels
  - Metrics row 1: "EU Active: 72%" (green bar), "EU Stall: 18%" (orange bar), "EU Idle: 10%" (gray bar)
  - Metrics row 2: "L3 Bandwidth: 45 GB/s" with bar relative to peak
  - Metrics row 3: "SLM Usage: 32KB/64KB" with fill indicator
  - Metrics row 4: "XMX Busy: 65%" with bar
- Annotation arrows pointing to each metric with explanation text:
  - EU Active: "越高越好，目标 >80%"
  - EU Stall: "高 stall 表示等待数据或同步"
  - EU Idle: "高 idle 表示 occupancy 不足"
  - L3 BW: "接近峰值说明 memory-bound"
- `const W = 580; const H = 360;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 41: BenchmarkDashboard component (static)

**Files:**
- Create: `src/components/interactive/BenchmarkDashboard.tsx`

- [ ] **Step 1: Create the component**

Static OpenVINO benchmark_app output annotation.

Requirements:
- No state (static SVG)
- Simulated benchmark_app output as styled text block (mono font):
  ```
  [Step 10/11] Measuring performance
  [ INFO ] Count:      1000 iterations
  [ INFO ] Duration:   10023.45 ms
  [ INFO ] Latency:
  [ INFO ]    Median:   9.82 ms
  [ INFO ]    Average:  10.02 ms
  [ INFO ]    Min:      8.15 ms
  [ INFO ]    Max:      25.67 ms
  [ INFO ]    P99:      15.23 ms
  [ INFO ] Throughput: 99.77 FPS
  ```
- Annotation arrows from key lines:
  - Median latency: "最稳定的延迟指标，受异常值影响最小"
  - P99 latency: "99th percentile，用于 SLA 保证"
  - Max latency: "首次推理通常最慢（kernel 编译），使用 model cache 消除"
  - Throughput: "FPS = 1000 / avg_latency × nireq"
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 42: Article 7 MDX + commit

**Files:**
- Create: `src/content/articles/zh/igpu-performance-analysis.mdx`

- [ ] **Step 1: Create the MDX article**

Frontmatter:
```yaml
title: "性能分析与瓶颈诊断"
slug: igpu-performance-analysis
locale: zh
tags: [intel, performance, profiling, roofline, vtune, bottleneck]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [onednn-gpu-optimization, openvino-graph-pipeline]
references:
  - type: website
    title: "Intel VTune Profiler — GPU Analysis — Intel"
    url: "https://www.intel.com/content/www/us/en/docs/vtune-profiler/user-guide/current/gpu-compute-media-hotspots-analysis.html"
  - type: website
    title: "OpenVINO Benchmark Tool — Intel"
    url: "https://docs.openvino.ai/2024/learn-openvino/openvino-samples/benchmark-tool.html"
  - type: website
    title: "Intel GPU Top — intel_gpu_top man page"
    url: "https://manpages.ubuntu.com/manpages/noble/man1/intel_gpu_top.1.html"
```

Content sections:
1. iGPU 性能分析的特殊挑战
2. 工具链概览
3. Roofline 分析在 iGPU 上的应用 + `<IGpuRoofline client:visible />`
4. 常见瓶颈模式 + `<BottleneckDiagnosisTree client:visible />`
5. 优化决策树
6. VTune GPU 分析实操 + `<VTuneGpuProfile />`（静态）
7. OpenVINO Benchmark 实操 + `<BenchmarkDashboard />`（静态）
8. 总结

- [ ] **Step 2: Validate and build**

Run: `npm run validate && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/IGpuRoofline.tsx src/components/interactive/BottleneckDiagnosisTree.tsx src/components/interactive/VTuneGpuProfile.tsx src/components/interactive/BenchmarkDashboard.tsx src/content/articles/zh/igpu-performance-analysis.mdx
git commit -m "feat(intel-igpu): add article 7 — performance analysis (4 components)"
```

---

## Article 8: NPU 架构与 GPU+NPU 协同推理 (Tasks 43-47)

### Task 43: NpuVsIgpu component

**Files:**
- Create: `src/components/interactive/NpuVsIgpu.tsx`

- [ ] **Step 1: Create the component**

NPU vs iGPU radar chart comparison.

Requirements:
- `useState<'npu' | 'igpu' | 'both'>` for display mode
- Five-axis radar chart: 吞吐 (Throughput), 延迟 (Latency), 功耗 (Power efficiency), 灵活性 (Flexibility), 模型支持 (Model support breadth)
- NPU profile: high power efficiency, good throughput for fixed models, low latency, limited flexibility, limited model support (fixed ops)
- iGPU profile: moderate power efficiency, high throughput for large models, moderate latency, high flexibility, broad model support
- Hover axis label to show explanation tooltip
- Three toggle buttons: "NPU", "iGPU", "对比" (overlay both)
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 44: DevicePluginSelector component (StepNavigator)

**Files:**
- Create: `src/components/interactive/DevicePluginSelector.tsx`

- [ ] **Step 1: Create the component**

StepNavigator-based: OpenVINO device selection flow for AUTO/MULTI/HETERO.

Requirements:
- Import `StepNavigator` from `'../primitives/StepNavigator'`
- 4 steps:
  1. "设备发现" — OpenVINO scans available devices: GPU (Xe2 iGPU), NPU (Intel AI Boost), CPU. Visual: three device icons discovered
  2. "AUTO 模式" — automatic device selection: query each device's capability → benchmark short run → pick fastest. Visual: decision flowchart ending at "GPU selected (best throughput)" or "NPU selected (best efficiency)"
  3. "MULTI 模式" — parallel execution across devices: requests distributed round-robin or by performance ratio. Visual: request stream splitting into GPU queue and NPU queue, both executing simultaneously, results merged
  4. "HETERO 模式" — heterogeneous fallback: model graph partitioned — supported ops on primary device (NPU), unsupported ops fallback to secondary (GPU). Visual: model graph with colored nodes (NPU=blue, GPU=green), partition line between them
- Each step: `<svg viewBox="0 0 580 180">`
- `const W = 580;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 45: HeteroSubgraphSplit component

**Files:**
- Create: `src/components/interactive/HeteroSubgraphSplit.tsx`

- [ ] **Step 1: Create the component**

Heterogeneous subgraph split visualization with adjustable GPU/NPU boundary.

Requirements:
- `useState<number>` for split point (0-100%, representing how many layers run on NPU vs GPU)
- Simplified Transformer model as vertical layer stack (12 layers): Embedding → Attention×10 → FFN×10 → Output
- Slider to adjust split: top layers on NPU, bottom layers on GPU (or vice versa)
- Left side: layer stack with color coding (NPU layers in `COLORS.primary`, GPU layers in `COLORS.green`)
- Right side: metrics that update with slider:
  - NPU load: X%
  - GPU load: Y%
  - Communication overhead: data transfer between devices at split point
  - Estimated latency: increases with more cross-device transfers
- Key insight: "切分点越少，设备间数据传输开销越低"
- `const W = 580; const H = 380;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 46: PowerPerfTradeoff component

**Files:**
- Create: `src/components/interactive/PowerPerfTradeoff.tsx`

- [ ] **Step 1: Create the component**

Power-performance tradeoff scatter plot.

Requirements:
- `useState<'small' | 'medium' | 'large'>` for model size selector
- Scatter plot: X-axis = Power consumption (Watts), Y-axis = Throughput (inferences/sec)
- Three data points per model size:
  - "纯 GPU" (`COLORS.green`): highest throughput, highest power
  - "纯 NPU" (`COLORS.primary`): lowest power, moderate throughput (limited by model support)
  - "GPU+NPU 混合" (`COLORS.orange`): between the two, best throughput-per-watt
- Model size buttons change the data points (larger models → GPU advantage grows, NPU may not support)
- Efficiency frontier line connecting optimal points
- Info box: "笔记本续航场景 → NPU 优先; 插电性能场景 → GPU 或混合"
- `const W = 580; const H = 360;`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

### Task 47: Article 8 MDX + commit

**Files:**
- Create: `src/content/articles/zh/npu-gpu-co-inference.mdx`

- [ ] **Step 1: Create the MDX article**

Frontmatter:
```yaml
title: "NPU 架构与 GPU+NPU 协同推理"
slug: npu-gpu-co-inference
locale: zh
tags: [intel, npu, openvino, hetero, multi-device, co-inference]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [openvino-graph-pipeline, igpu-performance-analysis]
references:
  - type: website
    title: "OpenVINO Multi-Device Execution — Intel"
    url: "https://docs.openvino.ai/2024/openvino-workflow/running-inference/inference-devices-and-modes/multi-device.html"
  - type: website
    title: "OpenVINO AUTO Device — Intel"
    url: "https://docs.openvino.ai/2024/openvino-workflow/running-inference/inference-devices-and-modes/auto-device-selection.html"
  - type: website
    title: "Intel NPU Device — OpenVINO Documentation"
    url: "https://docs.openvino.ai/2024/openvino-workflow/running-inference/inference-devices-and-modes/npu-device.html"
```

Content sections:
1. Intel NPU 架构概览
2. NPU vs iGPU 适用场景 + `<NpuVsIgpu client:visible />`
3. OpenVINO Device Plugin 体系 + `<DevicePluginSelector client:visible />`
4. AUTO Plugin 详解
5. GPU+NPU 混合推理 Pipeline + `<HeteroSubgraphSplit client:visible />`
6. 功耗与性能权衡 + `<PowerPerfTradeoff client:visible />`
7. 总结

- [ ] **Step 2: Validate and build**

Run: `npm run validate && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/NpuVsIgpu.tsx src/components/interactive/DevicePluginSelector.tsx src/components/interactive/HeteroSubgraphSplit.tsx src/components/interactive/PowerPerfTradeoff.tsx src/content/articles/zh/npu-gpu-co-inference.mdx
git commit -m "feat(intel-igpu): add article 8 — NPU & GPU+NPU co-inference (4 components)"
```

---

## Finalization (Task 48)

### Task 48: Update TODO + final validation

**Files:**
- Modify: `docs/TODO.md`

- [ ] **Step 1: Update TODO.md**

Mark OpenVINO and oneDNN items as completed:
```
- [x] OpenVINO 推理优化路径 (来源: 2026-04-05) — 完成: intel-igpu-inference 路径 (8 篇文章, 38 组件)
- [x] oneDNN 底层计算库路径 (来源: 2026-04-05) — 完成: 合并入 intel-igpu-inference 路径
```

- [ ] **Step 2: Final validation**

Run: `npm run validate && npm run build`
Expected: PASS, all pages built successfully

- [ ] **Step 3: Commit**

```bash
git add docs/TODO.md
git commit -m "docs: mark OpenVINO + oneDNN paths as completed in TODO"
```

- [ ] **Step 4: Push**

```bash
git push
```

---

**End of Part 3 (Tasks 32-48): Articles 6-8 (13 components) + TODO + validation**

## Summary

| Part | Tasks | Articles | Components |
|------|-------|----------|------------|
| Part 1 | 1-19 | YAML + Articles 1-3 | 15 |
| Part 2 | 20-31 | Articles 4-5 | 10 |
| Part 3 | 32-48 | Articles 6-8 + TODO | 13 |
| **Total** | **48** | **8 articles + 1 YAML** | **38 components** |
