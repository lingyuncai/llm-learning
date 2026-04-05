# Intel iGPU 推理深度解析：Xe2 架构、oneDNN 与 OpenVINO — 设计文档

## 路径定义

- **路径 ID**: `intel-igpu-inference`
- **标题**: "Intel iGPU 推理深度解析：Xe2 架构、oneDNN 与 OpenVINO"
- **英文标题**: "Intel iGPU Inference Deep Dive: Xe2 Architecture, oneDNN & OpenVINO"
- **级别**: advanced
- **前置路径**: `ai-compute-stack`（7 层模型、CUDA/OpenCL/SYCL 对比）
- **描述**: 从 Xe2 微架构到 oneDNN primitive 体系，从 SPIR-V 编译管线到 OpenVINO 图优化，从性能瓶颈诊断到 GPU+NPU 协同推理，系统理解 Intel iGPU 上的 AI 推理优化全栈。

## 设计哲学

- **原理为主，辅以优化方法论**：讲架构模型和设计决策背后的 why，不逐行分析源码。但在性能分析部分提供实操诊断方法。
- **聚焦 Xe2 架构**：以 Lunar Lake / Panther Lake 的 Xe2-LPG 为主要讨论对象，必要时对比 Xe-LPG（Meteor Lake）说明代际演进。
- **自底向上的完整链条**：硬件架构 → 编程模型 → 编译运行时 → 算子库 → 推理框架 → 性能分析 → NPU 协同
- **目标读者**：系统工程师，想理解并优化 OpenVINO/oneDNN 在 iGPU 上的执行。假设已读 ai-compute-stack（了解 7 层模型和 Intel oneAPI 生态定位）。
- **交互动画驱动理解**：每篇 4-6 个组件，共约 38 个，用可视化让硬件架构和执行流程具象化。

## 文章依赖关系

```
1. xe2-gpu-architecture (无前置，路径起点)
   ↓
2. xe2-execution-model (前置: 1)
   ↓
3. spirv-level-zero (前置: 2)
   ↓
4. onednn-primitives (前置: 3)
   ↓
5. onednn-gpu-optimization (前置: 4)
   ↓
6. openvino-graph-pipeline (前置: 4)
   ↓
7. igpu-performance-analysis (前置: 5, 6)
   ↓
8. npu-gpu-co-inference (前置: 6, 7)
```

文章 5 和 6 都依赖文章 4，但彼此独立。文章 7 同时需要 5（底层优化知识）和 6（图优化知识）。文章 8 需要 6（OpenVINO plugin 概念）和 7（性能分析方法）。

---

## 文章 1：Xe2 GPU 架构

- **slug**: `xe2-gpu-architecture`
- **difficulty**: advanced
- **tags**: `intel`, `xe2`, `gpu-architecture`, `igpu`, `lunar-lake`, `panther-lake`
- **prerequisites**: `ai-compute-stack`

### 内容结构

1. **从 Xe 到 Xe2 的演进** — 代际对比（Xe-LPG vs Xe2-LPG），核心改进点：EU 数量、XMX 单元、cache 层次、内存带宽
2. **Xe2 微架构层次** — GPU → Slice → Xe-core（Dual Subslice）→ EU（ALU + XMX）。每层的角色和资源分配
3. **EU 内部结构** — Vector Engine（SIMD ALU）、XMX（矩阵加速）、寄存器文件（GRF）、线程槽位。与 CUDA core / SM 的概念映射
4. **内存层次** — GRF → SLM（Shared Local Memory）→ L1 → L2 → 系统内存（LPDDR5x）。带宽和延迟特征，与独显的关键差异（统一内存 vs VRAM）
5. **Lunar Lake 与 Panther Lake 规格对比** — 具体规格表（EU 数、XMX 吞吐、SLM 大小、内存带宽），对 AI 推理负载的影响

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| Xe2HierarchyDiagram | 交互 | Xe2 架构层次图：GPU → Slice → Xe-core → EU，点击每层展开内部结构，显示资源数量和功能 |
| EUInternalView | 交互 | EU 内部结构详图：Vector Engine、XMX 单元、GRF、线程槽位，hover 显示各部件的吞吐规格 |
| MemoryHierarchyStack | 交互 | 内存层次瀑布图：从 GRF 到系统内存，每层显示容量/带宽/延迟，可切换 iGPU vs 独显模式对比 |
| XeVsCudaMapping | 静态 | Xe2 与 CUDA 概念映射表：EU↔CUDA Core、Xe-core↔SM、SLM↔Shared Memory、Subgroup↔Warp 等 |
| GenSpecCompare | 交互 | Lunar Lake vs Panther Lake 规格对比：滑动对比两代 iGPU 的 EU 数、XMX TOPS、内存带宽、AI 推理理论峰值 |

---

## 文章 2：Xe2 执行模型与编程抽象

- **slug**: `xe2-execution-model`
- **difficulty**: advanced
- **tags**: `intel`, `xe2`, `simd`, `sycl`, `execution-model`, `workgroup`
- **prerequisites**: `xe2-gpu-architecture`

### 内容结构

1. **SIMT vs SIMD 的本质差异** — CUDA 的 SIMT 模型（每线程独立 PC）vs Intel 的显式 SIMD（编译器向量化）。对编程心智模型的影响
2. **线程层次** — Work-item → Sub-group → Work-group → ND-Range。每层对应的硬件资源（EU 线程槽 → EU → Xe-core → GPU）
3. **Sub-group 的核心地位** — 为什么 sub-group 是 Xe2 编程的关键抽象（类似 warp）：shuffle、broadcast、reduce 操作，sub-group size 选择（8/16/32）
4. **同步与 Barrier** — Work-group 内 barrier（SLM 同步）、sub-group 内隐式同步、跨 work-group 无硬件同步。对算法设计的约束
5. **Occupancy 与资源平衡** — 寄存器压力、SLM 使用量、线程数的三角关系。occupancy 对隐藏延迟的作用
6. **SYCL/DPC++ 编程映射** — SYCL kernel 如何映射到 Xe2 硬件：nd_range → 线程层次，local_accessor → SLM，sub_group API → EU SIMD 操作

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| SimtVsSimd | StepNavigator | 分步对比 SIMT（CUDA）和 SIMD（Xe2）执行模型：同一个 kernel 在两种模型下的线程执行方式差异 |
| ThreadHierarchyMap | 交互 | 线程层次映射图：左侧软件抽象（work-item/sub-group/work-group），右侧硬件资源（线程槽/EU/Xe-core），连线显示映射关系 |
| SubgroupOps | 交互 | Sub-group 操作可视化：选择 shuffle/broadcast/reduce，动画展示数据在 sub-group 内 lanes 之间的流动 |
| OccupancyCalculator | 交互 | Occupancy 计算器：输入 GRF 使用量、SLM 大小、work-group 大小，计算并显示每 Xe-core 可并发的线程数和 occupancy 比率 |
| SyclToHardware | 交互 | SYCL 代码到硬件映射：左侧显示 SYCL kernel 代码片段，右侧高亮对应的硬件资源被激活，hover 代码行显示硬件操作 |

---

## 文章 3：SPIR-V 编译与 Level Zero 运行时

- **slug**: `spirv-level-zero`
- **difficulty**: advanced
- **tags**: `intel`, `spirv`, `level-zero`, `compiler`, `runtime`, `jit`, `aot`
- **prerequisites**: `xe2-execution-model`

### 内容结构

1. **从源码到 GPU 执行的全链路** — DPC++ source → LLVM IR → SPIR-V → Xe2 ISA → 执行。每步的角色和产物
2. **SPIR-V 的设计哲学** — 为什么需要中间表示：平台无关性、离线编译、验证层。SPIR-V vs PTX 的定位差异
3. **编译策略：JIT vs AOT** — JIT（运行时编译，适应具体硬件）vs AOT（预编译，减少启动延迟）。OpenVINO 和 oneDNN 分别采用哪种策略及原因
4. **Level Zero API 核心抽象** — Driver → Device → Context → Command Queue/List → Fence/Event。与 CUDA Runtime API 的概念对照
5. **Kernel Dispatch 流程** — 从 API 调用到 GPU 执行的完整流程：创建 module → 创建 kernel → 设置参数 → append 到 command list → 提交 → 同步
6. **内存管理** — Host/Device/Shared 内存分配、统一虚拟地址（USM）、iGPU 统一内存的特殊优势（零拷贝）

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| CompilationPipeline | StepNavigator | DPC++ → SPIR-V → Xe2 ISA 编译管线分步展示：每步显示输入/输出格式和关键转换 |
| SpirvVsPtx | 静态 | SPIR-V 与 PTX/CUDA 编译链对比图：两条并行的编译管线，标注对应阶段和产物 |
| JitVsAot | 交互 | JIT vs AOT 决策对比：滑动切换两种模式，分别显示编译时机、启动延迟、优化程度、二进制大小的权衡 |
| LevelZeroDispatch | StepNavigator | Kernel dispatch 完整流程动画：从创建 context 到提交 command list 到 GPU 执行完成，每步高亮涉及的 API 对象 |
| MemoryModelViz | 交互 | iGPU 统一内存模型：Host/Device/Shared 三种分配方式，动画展示数据在 CPU↔GPU 之间的可见性和拷贝行为（iGPU 的零拷贝优势） |

---

## 文章 4：oneDNN Primitive 体系

- **slug**: `onednn-primitives`
- **difficulty**: advanced
- **tags**: `intel`, `onednn`, `primitive`, `memory-format`, `operator-library`
- **prerequisites**: `spirv-level-zero`

### 内容结构

1. **oneDNN 的定位与设计目标** — 跨平台算子库（CPU/GPU/跨厂商），为什么不直接用 cuDNN 的 API 模式：primitive 抽象 vs eager execution
2. **Primitive 生命周期** — Engine → Primitive Descriptor → Primitive → Execute。每步的角色：描述"要做什么"→ 选择"怎么做"→ "执行"
3. **Memory 与 Format Tag** — 逻辑布局（NCHW）vs 物理布局（nChw16c blocked format）。为什么 blocked format 对 GPU 性能至关重要（向量化对齐、cache 友好）
4. **Propagation Kind 与 Fusion** — Forward/Backward inference/training、post-op fusion（conv + relu + sum）、primitive attributes。如何减少 kernel launch 和内存读写
5. **Primitive Cache 机制** — 为什么需要缓存（创建 primitive 开销大，涉及 kernel 编译）、cache key 的构成、LRU 策略
6. **支持的操作与数据类型** — Convolution、MatMul、Softmax、LayerNorm 等核心操作。FP32/FP16/BF16/INT8 数据类型支持矩阵

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| PrimitiveLifecycle | StepNavigator | Primitive 完整生命周期分步动画：Engine 创建 → Primitive Descriptor（查询最优实现）→ Primitive（编译 kernel）→ Execute（提交执行）→ 结果 |
| MemoryFormatViz | 交互 | 内存布局可视化：输入一个 4D tensor，切换 NCHW / nChw16c / nChw32c 布局，动画展示物理内存排列差异和向量化对齐 |
| PostOpFusion | 交互 | Post-op fusion 效果演示：左侧显示未融合的独立 kernel 链（conv→relu→sum），右侧显示融合后的单 kernel，对比内存读写次数和 kernel launch 数量 |
| PrimitiveCacheFlow | 交互 | Primitive cache 工作流：请求到来 → 查 cache → hit（直接执行）/ miss（编译 kernel → 入 cache → 执行）。显示 cache hit rate 和延迟对比 |
| OpDataTypeMatrix | 静态 | 操作×数据类型支持矩阵：行为操作类型（MatMul/Conv/Softmax…），列为数据类型（FP32/FP16/BF16/INT8），标注 Xe2 iGPU 上的支持状态和推荐精度 |

---

## 文章 5：oneDNN GPU Kernel 优化

- **slug**: `onednn-gpu-optimization`
- **difficulty**: advanced
- **tags**: `intel`, `onednn`, `kernel-optimization`, `gemm`, `xmx`, `mixed-precision`
- **prerequisites**: `onednn-primitives`

### 内容结构

1. **GEMM 在 AI 推理中的核心地位** — 为什么 MatMul/GEMM 是优化焦点：Transformer 中 GEMM 占比、roofline 分析定位
2. **Xe2 GEMM Tiling 策略** — 多层分块：全局 tile → work-group tile → sub-group tile → register tile。每层对应的硬件资源和数据流
3. **XMX 利用率优化** — XMX（矩阵加速引擎）的输入约束（数据类型、维度对齐）、如何最大化 XMX 吞吐、与 Vector Engine 的协同
4. **SLM 使用模式** — 数据预取到 SLM → 计算 → 写回。SLM bank conflict 的成因和避免方法。SLM 大小对 tiling 选择的约束
5. **混合精度推理** — FP16/BF16/INT8 在 Xe2 上的硬件支持与吞吐对比。混合精度策略：哪些层用低精度、哪些保持高精度。量化+oneDNN 的配合
6. **内存访问优化** — 合并访问（coalesced access）、prefetch 指令、L1/L2 cache blocking。iGPU 共享系统内存的带宽争抢问题

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| GemmTilingHierarchy | StepNavigator | GEMM 多层 tiling 分步展示：从完整矩阵 → 全局 tile 划分 → work-group tile → sub-group tile → register tile，每步显示数据大小和硬件映射 |
| XmxUtilization | 交互 | XMX 利用率计算器：输入矩阵维度和数据类型，显示 XMX 的利用率百分比、对齐浪费、理论 vs 实际吞吐 |
| SlmBankConflict | 交互 | SLM bank conflict 可视化：显示 SLM bank 布局，模拟不同访问模式下的 conflict 情况，对比有/无 conflict 的延迟差异 |
| MixedPrecisionCompare | 交互 | 混合精度性能对比：选择数据类型组合（FP32/FP16/BF16/INT8），显示 Xe2 上的理论吞吐（TOPS）、内存带宽需求、精度-性能 tradeoff |
| MemoryAccessPattern | 交互 | 内存访问模式可视化：切换合并/非合并访问模式，动画展示 EU 线程的内存请求如何合并为 cache line 读取，显示带宽利用率 |

---

## 文章 6：OpenVINO 图优化 Pipeline

- **slug**: `openvino-graph-pipeline`
- **difficulty**: advanced
- **tags**: `intel`, `openvino`, `graph-optimization`, `model-compilation`, `plugin`
- **prerequisites**: `onednn-primitives`

### 内容结构

1. **OpenVINO 的整体架构** — 前端（Model Optimizer / ONNX 导入）→ Core（ov::Model IR）→ Plugin（设备特定编译+执行）。三段式设计的 why
2. **模型表示：ov::Model** — 计算图结构（Operations + Tensors）、与 ONNX 的关系、动态 shape 支持
3. **通用图优化 Pass** — 常量折叠（Constant Folding）、死节点消除、算子融合（Conv+BN、MatMul+Add）、layout 传播（插入 Reorder 算子）。每种优化的原理和收益
4. **GPU Plugin 的设备特定优化** — GPU plugin 如何选择最优 kernel（通过 oneDNN primitive 或自定义 OpenCL kernel）、kernel 选择策略、layout 选择（为什么 GPU 偏好 blocked format）
5. **模型缓存机制** — 首次编译（慢）→ 序列化缓存 → 后续加载（快）。缓存 key 的构成、cache 失效条件。对 iGPU 部署的实际意义（避免每次启动都重新编译）
6. **推理请求与异步执行** — InferRequest 的同步/异步模式、pipeline 化（多 request 重叠执行）、吞吐 vs 延迟的调优

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| OpenVINOArchOverview | 交互 | OpenVINO 三段式架构图：前端→Core→Plugin，点击每段展开内部模块，hover 显示数据流和格式转换 |
| GraphOptPasses | StepNavigator | 图优化 pass 逐步动画：原始计算图 → 常量折叠 → 死节点消除 → 算子融合 → layout 插入，每步显示图的变化和节点数量减少 |
| PluginKernelSelection | 交互 | GPU Plugin kernel 选择流程：给定一个算子（如 MatMul），展示 plugin 如何查询 oneDNN primitive、评估 OpenCL kernel、选择最优实现 |
| ModelCacheFlow | 交互 | 模型缓存工作流对比：首次加载（编译全流程）vs 缓存命中（跳过编译），时间线对比显示启动延迟差异 |
| AsyncPipeline | 交互 | 异步推理 pipeline 时间线：多个 InferRequest 在 GPU 上重叠执行的甘特图，对比同步 vs 异步模式的吞吐差异 |

---

## 文章 7：性能分析与瓶颈诊断

- **slug**: `igpu-performance-analysis`
- **difficulty**: advanced
- **tags**: `intel`, `performance`, `profiling`, `roofline`, `vtune`, `bottleneck`
- **prerequisites**: `onednn-gpu-optimization`, `openvino-graph-pipeline`

### 内容结构

1. **iGPU 性能分析的特殊挑战** — 与独显的差异：共享内存带宽、CPU↔GPU 争抢、功耗/温控限制（TDP 共享）、驱动开销占比更大
2. **工具链概览** — Intel VTune Profiler（GPU 性能分析）、Intel GPU Top（实时监控）、OpenVINO Benchmark Tool（端到端 benchmark）、oneAPI Level Zero Metrics
3. **Roofline 分析在 iGPU 上的应用** — 构建 Xe2 iGPU 的 roofline 模型：计算峰值（XMX TOPS + Vector GFLOPS）、内存带宽（LPDDR5x 共享），定位 kernel 是 compute-bound 还是 memory-bound
4. **常见瓶颈模式** — (a) 内存带宽瓶颈（小 batch、大 KV cache）、(b) 计算瓶颈（大 GEMM、高 occupancy）、(c) 延迟瓶颈（kernel launch overhead、CPU↔GPU 同步）、(d) 功耗限制（throttling）
5. **优化决策树** — 根据瓶颈类型选择优化策略的系统方法：诊断→定位→优化→验证循环
6. **OpenVINO Benchmark 实操** — benchmark_app 的关键参数、如何解读输出、latency vs throughput 模式选择

### 组件（4 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| IGpuRoofline | 交互 | Xe2 iGPU Roofline 图：横轴 arithmetic intensity，纵轴性能。可添加不同 kernel 的数据点（MatMul/Conv/Softmax），显示其位于 roofline 的什么位置 |
| BottleneckPatterns | 交互 | 瓶颈模式识别：选择一种症状（高延迟/低吞吐/GPU 利用率低…），显示对应的瓶颈类型、诊断方法和优化建议 |
| OptimizationDecisionTree | 交互 | 优化决策树：从"性能不达标"开始，逐步回答诊断问题（GPU 利用率？内存带宽？kernel 延迟？），引导到具体优化策略 |
| BenchmarkDashboard | 静态 | OpenVINO benchmark_app 输出解读图：标注输出中的关键指标（latency percentiles、throughput、first inference time），说明每个数字的含义和优化方向 |

---

## 文章 8：NPU 架构与 GPU+NPU 协同推理

- **slug**: `npu-gpu-co-inference`
- **difficulty**: advanced
- **tags**: `intel`, `npu`, `openvino`, `hetero`, `multi-device`, `co-inference`
- **prerequisites**: `openvino-graph-pipeline`, `igpu-performance-analysis`

### 内容结构

1. **Intel NPU 架构概览** — NPU 的硬件结构（Neural Compute Engine、DMA、SHAVE DSP）、与 iGPU 的定位差异：NPU 专注推理效率（低功耗、固定功能），iGPU 通用计算
2. **NPU vs iGPU 适用场景** — NPU 擅长：持续推理、低功耗、固定模型。iGPU 擅长：灵活计算、大模型、动态 shape。两者的吞吐/延迟/功耗特征对比
3. **OpenVINO Device Plugin 体系** — AUTO（自动选设备）、MULTI（多设备并行）、HETERO（异构 fallback）。每种模式的调度逻辑和适用场景
4. **AUTO Plugin 详解** — 设备发现 → 能力查询 → 模型兼容性检查 → 性能 benchmark → 设备选择。如何处理 NPU 不支持的算子（fallback 到 GPU）
5. **GPU+NPU 混合推理 Pipeline** — MULTI 模式下的请求调度：负载均衡、流水线化、两设备吞吐聚合。HETERO 模式下的子图切分：哪些层跑 NPU、哪些跑 GPU
6. **功耗与性能权衡** — 纯 GPU vs 纯 NPU vs GPU+NPU 混合的功耗-性能-延迟三角关系。笔记本续航场景下的策略选择

### 组件（4 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| NpuVsIgpu | 交互 | NPU vs iGPU 特征雷达图：吞吐、延迟、功耗、灵活性、模型支持广度五个维度对比，hover 显示具体数值和典型用例 |
| DevicePluginSelector | StepNavigator | OpenVINO 设备选择分步流程：AUTO/MULTI/HETERO 三种模式，每步显示调度决策和设备分配结果 |
| HeteroSubgraphSplit | 交互 | 异构子图切分可视化：一个 Transformer 模型的计算图，可拖拽调整 GPU/NPU 边界线，实时显示每个设备的负载和通信开销 |
| PowerPerfTradeoff | 交互 | 功耗-性能权衡图：三种模式（纯 GPU / 纯 NPU / 混合）在散点图上的位置，X 轴功耗 Y 轴吞吐，可选择不同模型大小观察变化 |

---

## 组件总览

共 **38 个组件**（5+5+5+5+5+5+4+4），其中：
- StepNavigator 类型：7 个（SimtVsSimd、CompilationPipeline、LevelZeroDispatch、PrimitiveLifecycle、GemmTilingHierarchy、GraphOptPasses、DevicePluginSelector）
- 交互组件：27 个
- 静态组件：4 个（XeVsCudaMapping、OpDataTypeMatrix、SpirvVsPtx、BenchmarkDashboard）

### 组件设计约定

沿用项目现有规范：
- `import { COLORS, FONTS } from './shared/colors'`
- `const W = 580`，SVG 使用 `viewBox` + `className="w-full"`
- StepNavigator：`import StepNavigator from '../primitives/StepNavigator'`
- MDX 中交互组件：`<Foo client:visible />`，纯静态 SVG：`<Foo />`
- 导出：`export default function ComponentName()`

## References 规范

每篇文章的 frontmatter references 需包含真实有效的引用，类型使用：
- `paper`：学术论文（arxiv/conference）
- `website`：官方文档、技术规范
- `blog`：技术博文
- `video`：视频课程/演讲
- `repo`：GitHub 仓库
- `book`：书籍
- `course`：在线课程

关键参考来源：
- Intel Xe2 Architecture White Paper / ISA Guide
- Intel oneAPI DPC++/SYCL 文档
- SPIR-V 规范（Khronos）
- Level Zero API 规范（oneapi-spec）
- oneDNN 开发者指南（官方文档）
- OpenVINO 架构文档与 GPU Plugin 文档
- Intel VTune / GPU Top 文档
- Intel NPU 架构文档
