# Graph Compilation & Optimization 学习路径设计

> **路径 ID**: `graph-compilation-optimization`
> **难度**: advanced
> **前置路径**: ai-compute-stack
> **文章数**: 17 篇
> **Phase 数**: 4（每 phase 一个独立 implementation plan）

## 1. 路径定位

### 1.1 解决什么问题

现代 ML 推理/训练的性能瓶颈不在单个算子，而在算子之间的协调：

- **Eager execution 的代价**：逐算子执行带来 kernel launch overhead、冗余内存读写、无法跨算子优化
- **编译优化的价值**：编译器看到全局计算图后，可以做算子融合、内存规划、并行调度、硬件适配

本路径覆盖 ML 编译器的**软件编译/优化中间层** — 从计算图捕获到优化执行的完整流程。

### 1.2 与已有路径的关系

```
ai-compute-stack（硬件层：GPU 架构 → CUDA → GEMM）
        ↑ 前置路径，链接引用不重复
graph-compilation-optimization（编译层：图 IR → 优化 Pass → 融合 → 编译 → 调度）
        ↔ 互补引用
ollama-internals / openvino-graph-pipeline（框架层：具体实现视角）
```

- **ai-compute-stack**：讲硬件底层（GPU 架构、CUDA 编程、GEMM 优化）。本路径假设读者已学完，直接从计算图层开始。
- **ollama-compute-graph**：讲 GGML 计算图的具体实现，有 OperatorFusion 组件展示 3 种融合模式。本路径讲通用原理，引用其作为"具体框架实现"的参考。
- **openvino-graph-pipeline**：讲 OpenVINO 的图优化 pass。同上，本路径从编译器通用视角讲 pass 设计，引用其作为推理框架实现案例。

### 1.3 双主线设计

本路径采用 **PyTorch 2.0 + MLIR 双主线**：

| 维度 | PyTorch 2.0 | MLIR |
|------|-------------|------|
| 定位 | 应用级编译器（从用户代码到优化执行的端到端方案） | 编译器基础设施（提供构建 IR、Pass、Lowering 的通用框架） |
| 覆盖 | TorchDynamo → AOTAutograd → TorchInductor → Triton | Dialect 体系 → Progressive Lowering → Pass Infrastructure |
| 优势 | 最实用，LLM 从业者使用率最高 | 最深刻，理解编译器架构设计的最佳载体 |
| 交汇点 | Triton（PyTorch 用它生成 kernel，Triton 自身正迁移到 MLIR） | |

**设计原则**：不是人为分开再合并，而是每个阶段"谁讲得更好谁来讲"。读者会自然形成"PyTorch 管上层捕获和端到端流程，MLIR 管底层基础设施设计"的心智模型。

**防混淆措施**：
- 文章 1（全景图）用层级图清晰标注两者的定位和关系
- 每篇文章顶部的 `CompilerStackMap` 组件标注当前文章主要使用哪条主线
- 涉及两条主线的文章内用视觉标记（颜色/图标）区分 PyTorch 视角 vs MLIR 视角

### 1.4 三类文章结构

| 类型 | 文章 | 作用 |
|------|------|------|
| 横向阶段 | 1-9, 12-13, 16-17 | 沿编译栈逐层推进，回答"编译器的每个阶段做什么" |
| 纵向专题 | 10-11 | 贯穿多层的核心优化，回答"这个优化为什么出现在每个阶段" |
| 进阶专题 | 14-15 | 在基础编译流程之上的扩展，回答"实际部署还要解决什么问题" |

### 1.5 ML 编译器与传统编译器的关系

本路径涉及的技术大致可分为三类，这一分类将在全景图（文章 1）中较为详细地阐述，帮助不同背景的读者定位：

**直接继承自传统编译器（~40%）**：
- SSA 形式、use-def chain、dominance analysis
- DCE、CSE、Constant Folding 等经典优化 pass
- 数据流分析基础（lattice theory、worklist algorithm）
- Register allocation、instruction selection
- Polyhedral 优化、loop tiling/permutation/unrolling
- Vectorization (SIMD)
- Pass manager 架构、progressive lowering
- Pattern matching rewrite

**传统概念但为 ML 显著改造（~30%）**：
- 算子融合：传统有 loop fusion，但 ML 以 memory bandwidth 为核心驱动力，融合粒度是算子而非循环
- Tiling：传统有 loop tiling，但 GPU 的 HBM → Shared Mem → Register 三级显式管理是新的
- Cost model：传统有指令 cost model，但 ML 的 roofline-based、bandwidth-focused model 是适配
- 调度：传统有 instruction scheduling，但多 kernel 跨 GPU stream 调度是新场景
- Layout 优化：传统有 data layout，但 NCHW/NHWC/blocked 是 tensor 特有的
- Autotuning：HPC 有 ATLAS (1990s)，但 ML 的搜索空间和 transfer learning 是新的
- Tensor-level IR：传统 IR 操作标量/数组，ML 的 linalg.matmul 等 tensor-level 抽象是新的

**AI/ML 领域原创或显著创新（~30%）**：
- TorchDynamo（字节码级 tracing）：从 Python 动态语言中捕获计算图
- AOTAutograd：编译时 trace 微分图，自动微分与编译的交叉
- Functionalization：ML 框架大量 in-place 操作，需转为 functional 形式才能优化
- MLIR Dialect 体系：可扩展的多层 IR 框架设计
- FlashAttention：domain-specific 的算法级重写
- Dynamic Shapes / SymInt：ML 工作负载的动态维度挑战
- 量化编译（INT4/FP8 混合精度）：ML 特有的精度-性能权衡
- 分布式图分割 / GSPMD：tensor parallelism、pipeline parallelism

### 1.6 详尽度要求

- 每篇文章以**讲透为标准，不设字数上限**。3000 字起步，需要多少写多少。
- 每篇至少 **2-3 个交互组件/可视化**
- 每个概念附**具体例子**（如"这段代码经过这个 pass 后变成什么样"）
- 算法讲解附**伪代码 + 动画演示**
- 每篇文章顶部有 `CompilerStackMap` 缩略版，标注"你在这里"

## 2. 文章详细设计

### 文章 1：全景图 — ML 编译器的世界

**Slug**: `ml-compiler-landscape`
**主讲**: 双主线
**难度**: intermediate（作为路径入口，门槛略低）

**目标**：建立完整心智模型，理解"为什么需要图编译器"、PyTorch 2.0 / MLIR 各自的定位、以及本路径的学习结构。

**内容大纲**：

1. **从性能瓶颈出发**
   - Eager execution（逐算子执行）的问题：kernel launch overhead、冗余内存读写（每个 op 都从 HBM 读写中间结果）、无法跨算子优化
   - 定量说明：一个简单的 LayerNorm + Linear，eager 模式下需要 4 次 HBM 读写，融合后只需 2 次
   - 引出问题："如果编译器能看到整张计算图，它能做什么？"

2. **图编译器的价值**
   - 看到全局 → 跨算子优化、内存规划、并行调度
   - 编译栈分层：用户代码 → Graph Capture → High-Level IR → Optimization Passes → Fusion → Low-Level IR → Codegen → Hardware
   - 与传统 ahead-of-time 编译器（GCC/LLVM）的类比和区别

3. **ML 编译器与传统编译器的关系**（较为详细的专节）
   - 三分类详解：直接继承（~40%）/ 显著改造（~30%）/ ML 原创（~30%）
   - 每类列出代表性技术，附简短解释
   - 帮有编译器背景的读者快速定位"哪些已知，哪些新"
   - 帮 ML 背景的读者理解"这些优化背后有几十年的 CS 理论"
   - 时间线可视化：传统编译器里程碑 → HPC 优化 → ML 编译器兴起

4. **双主线定位**（核心图）
   - PyTorch 2.0 = 应用级编译器
   - MLIR = 编译器基础设施
   - Triton = 交汇点
   - 层级图清晰标注两者在编译栈上的覆盖范围
   - FX IR 与 MLIR Dialect 的关系预告

5. **与已有路径/内容的关系**
   - 链接到 ai-compute-stack（硬件层）、ollama-compute-graph（GGML 视角）、openvino-graph-pipeline（推理框架视角）
   - 说明本路径聚焦"中间的编译层"

6. **学习路径导览**
   - 三类文章结构说明（横向阶段 / 纵向专题 / 进阶专题）
   - 17 篇文章的逻辑关系图，每篇一句话预告
   - 建议的阅读顺序（顺序 vs 按兴趣跳读的指引）

**交互组件**：
- `CompilerStackMap` — 可复用的编译栈全景图组件。展示从用户代码到硬件执行的完整层级，高亮当前文章所在层。后续每篇文章顶部复用此组件（以缩略模式），标注"你在这里"。支持点击跳转到对应文章。
- `EagerVsCompiled` — 动画对比：eager 模式逐算子执行 vs 编译模式整图优化后执行。展示中间 kernel launch、HBM 读写的差异，附性能数据标注。用户可切换不同模型片段（LayerNorm+Linear、Attention block 等）查看差异。
- `CompilerTimelineChart` — ML 编译器与传统编译器的技术演进时间线：标注关键里程碑（SSA 1986、LLVM 2003、TVM 2018、MLIR 2019、torch.compile 2022 等），三种颜色区分继承/改造/原创技术。

---

### 文章 2：计算图捕获 — TorchDynamo、AOTAutograd 与 Functionalization

**Slug**: `graph-capture-dynamo`
**主讲**: PyTorch
**难度**: advanced

**目标**：理解"编译器怎么拿到计算图"这个第一步，深入 TorchDynamo 的设计，以及 AOTAutograd 如何在编译时处理自动微分。

**内容大纲**：

1. **问题定义**
   - Python 是动态语言，控制流随时变化
   - 挑战：如何从动态代码中提取静态（或半静态）计算图？

2. **Tracing 策略对比**
   - torch.jit.trace（值 tracing，丢失控制流）
   - torch.jit.script（AST 解析，语法受限，用户体验差）
   - TorchDynamo（字节码级 tracing，PEP 523 frame evaluation API）— 为什么这是"正确答案"
   - JAX 的 jit（functional tracing）、TensorFlow 的 tf.function（AutoGraph）作为对比

3. **TorchDynamo 深入**
   - CPython frame evaluation hook 机制（PEP 523）
   - 字节码分析与 symbolic execution
   - Guard 系统：什么条件下图失效需要重新 trace（shape guard、type guard、value guard）
   - Graph Break：遇到不支持的操作怎么办（部分图 + Python fallback）
   - FX Graph 的结构：Graph、Node（placeholder、call_function、call_method、output）

4. **AOTAutograd**
   - 问题：传统 autograd 在运行时动态构建反向图，无法提前优化
   - AOTAutograd 的方案：编译时 trace 前向 + 反向图
   - Joint graph（前向+反向合并图）的构造
   - 为什么这对优化至关重要：编译器可以同时优化前向和反向的内存使用

5. **Functionalization**
   - ML 框架大量 in-place 操作（add_、relu_ 等）
   - 编译器需要 functional 形式才能安全做优化（CSE、reordering 等）
   - Functionalization pass：将 mutation 转为 copy + pure function
   - 与 AOTAutograd 的关系

6. **torch.compile 端到端流程**
   - 一行 `torch.compile(model)` 背后发生了什么
   - TorchDynamo → AOTAutograd → Functionalization → Backend (TorchInductor)
   - 完整的 pipeline 图

**交互组件**：
- `DynamoTracingFlow` — 动画演示：一段 Python 代码 → 字节码 → TorchDynamo 捕获 → FX Graph 输出。可以切换不同的代码示例（纯计算、带 if/else、带 data-dependent 控制流）看 Graph Break 发生的位置。
- `FXGraphExplorer` — 交互式 FX Graph 可视化：展示 Node 结构，点击节点查看 op 类型、shape 信息、依赖关系。
- `GuardSystemDemo` — 展示 Guard 如何工作：改变输入 shape/dtype → Guard 失效 → 重新 trace 的动画过程。
- `AOTAutogradFlow` — 展示 AOTAutograd 如何将前向图和反向图合并为 joint graph，标注哪些中间 tensor 需要为反向保留。

---

### 文章 3：IR 设计（上）— SSA、FX IR 与 MLIR Dialect

**Slug**: `ir-design-basics`
**主讲**: 双主线
**难度**: advanced

**目标**：理解 IR 是什么、为什么需要多层 IR、SSA 的重要性、FX IR 和 MLIR Dialect 的设计哲学对比。

**内容大纲**：

1. **IR 基础概念**
   - 什么是中间表示：源码和机器码之间的桥梁
   - 为什么不直接从源码到机器码：关注点分离、可复用的优化
   - 好的 IR 设计原则：可分析性、可变换性、层级适配

2. **SSA 形式（Static Single Assignment）**
   - 为什么 SSA 是现代编译器 IR 的基础
   - 核心规则：每个变量只被赋值一次
   - Phi 节点：控制流汇合点的值选择
   - Use-def chain：快速找到值的定义和使用
   - SSA 如何简化优化：DCE 变成"删除无 use 的 def"、constant propagation 变成"沿 def-use chain 传播"
   - FX IR 的 SSA 特性 vs MLIR 的 SSA 特性

3. **FX IR 详解**
   - Graph + Node 的 Python 级 IR
   - Node 类型：placeholder、call_function、call_method、call_module、get_attr、output
   - 优势：Python 原生，易于操作、打印、调试
   - 局限：单层 IR，缺乏丰富类型系统和硬件抽象
   - 代码示例：一个简单模型的 FX Graph 打印输出

4. **MLIR 的设计哲学**
   - 问题背景：ML 编译器碎片化，每个框架造自己的 IR（TVM Relay、XLA HLO、Glow IR...）
   - MLIR 的回答：提供一个**构建 IR 的框架**，而不是一个固定 IR
   - **Dialect 体系**：每个 dialect = 一层抽象
     - 常见 dialect：linalg（线性代数）、tensor、memref（内存引用）、scf（结构化控制流）、arith（算术运算）、llvm
     - 每个 dialect 的设计目标和抽象层级
   - **Operation / Region / Block**：MLIR 的三级结构
   - 类型系统：Tensor types、Memref types、Index type
   - 可扩展性：任何人可以定义新 dialect

5. **FX IR vs MLIR Dialect 对比**
   - 设计目标：快速原型 vs 工业级编译器基础设施
   - 表达能力：Python 子集 vs 任意抽象层级
   - 可扩展性：有限 vs 无限（dialect 机制）
   - 类型系统：弱 vs 强
   - 生态：PyTorch 专用 vs 跨框架

**交互组件**：
- `IRLayerVisualizer` — 展示同一段计算在不同 IR 层级的表示：Python 代码 → FX Graph → MLIR (linalg) → MLIR (memref) → LLVM IR。点击每一层查看对应的 IR 文本，高亮层与层之间的对应关系。
- `DialectExplorer` — MLIR Dialect 层级图：展示常见 dialect 的包含关系和 lowering 方向，点击某个 dialect 查看它的 Operation 示例和设计目标。
- `SSAVisualizer` — SSA 形式可视化：展示一段代码从非 SSA 到 SSA 的转换过程，高亮 phi 节点和 use-def chain。

---

### 文章 4：IR 设计（下）— Progressive Lowering 与多层 IR

**Slug**: `ir-progressive-lowering`
**主讲**: MLIR
**难度**: advanced

**目标**：深入 MLIR 最核心的设计理念 — progressive lowering，理解为什么"逐层下降"比"一步到底"好。

**内容大纲**：

1. **Progressive Lowering 核心思想**
   - 每一步 lowering 只做一件事：将高层抽象替换为低层实现
   - 保留尽可能多的高层信息，越晚丢失越好
   - 类比：从"炒一道菜"逐步分解为"切菜→热锅→翻炒→调味"，而不是直接跳到"手部肌肉运动序列"
   - 为什么这比一步到底好：每层都可以做该层最适合的优化

2. **Lowering 路径示例**
   - `linalg.matmul` → `scf.for` + `memref.load/store` → `llvm.load/store` + `llvm.fadd/fmul`
   - 每步的信息损失和获得分析
   - 另一条路径：`linalg.matmul` → `gpu.launch` + tiled loops → `nvvm` intrinsics → PTX

3. **Dialect Conversion 框架**
   - ConversionTarget：声明哪些 op 合法、哪些需要 lower
   - RewritePattern：如何匹配并替换 op
   - TypeConverter：类型如何跟着 lower（tensor → memref 的 bufferization）
   - 部分 lowering：一次 conversion 只 lower 部分 op

4. **Bufferization 深入**
   - tensor（值语义，不可变）→ memref（引用语义，可变）的转换
   - 为什么这是 MLIR 中最复杂的 lowering 之一
   - One-shot bufferization vs 传统逐 op bufferization
   - 内存分配决策：哪些 tensor 需要独立 buffer，哪些可以 in-place

5. **实战案例：torch-mlir 的 Lowering Pipeline**
   - Torch dialect → TCP dialect → Linalg-on-Tensors → Linalg-on-Buffers → LLVM
   - 每层解决什么问题

6. **对比单层 IR 的局限**
   - TVM 从 Relay（单层高级 IR）演进到 Relay + TIR（双层）的历史
   - XLA HLO 作为"相对扁平"的 IR 的优劣

**交互组件**：
- `ProgressiveLoweringAnimation` — 核心组件：选择一个简单计算（矩阵乘法或 LayerNorm），逐步展示 5-6 层 lowering 过程的动画，每层高亮变化的部分，附文字解释"这一步做了什么、丢失了什么信息、获得了什么"。
- `DialectConversionDemo` — 展示一个 RewritePattern 的匹配-替换过程：左边是 pattern template，右边是 IR，动画演示 pattern match → replace。
- `BufferizationVisualizer` — 展示 tensor → memref 的 bufferization 过程：哪些 tensor 共享 buffer、哪些需要新分配、in-place 判定逻辑。

---

### 文章 5：图优化 Pass（上）— 数据流分析基础与通用 Pass 模式

**Slug**: `graph-passes-foundations`
**主讲**: 双主线
**难度**: advanced

**目标**：理解数据流分析的理论基础，以及图优化 pass 的通用设计模式。

**内容大纲**：

1. **什么是 Pass**
   - 接收 IR → 分析/变换 → 输出优化后的 IR
   - Analysis pass（只读）vs Transform pass（读写）
   - Local pass（单 op）vs Global pass（整图）

2. **数据流分析基础**
   - **Lattice theory**：半格、偏序、meet/join 操作
   - **Transfer function**：每个 op 对数据流状态的影响
   - **Worklist algorithm**：迭代求解直到不动点
   - **方向**：forward analysis（constant propagation）vs backward analysis（liveness）
   - 这些概念如何映射到图优化

3. **经典 Pass 深入讲解**
   - **Dead Code Elimination (DCE)**：从输出反向标记活跃节点，删除未标记节点。算法伪代码 + 示例。
   - **Common Subexpression Elimination (CSE)**：哈希每个节点（op + 输入），发现重复计算。可交换运算（a+b = b+a）的处理。
   - **Constant Folding**：编译时求值。Constant propagation 的传播逻辑。
   - 每个 pass 附动画演示前后对比

4. **Pass 管理基础设施**
   - **PyTorch FX passes**：如何写一个 FX pass（pattern + replacement），FX 的 subgraph_rewriter API
   - **MLIR Pass Manager**：PassManager 层级结构（Module pass、Function pass、Op pass）、pass pipeline 组合、pass 间的 analysis preservation 声明
   - Pass ordering 问题：为什么顺序很重要（CSE before DCE vs DCE before CSE）

5. **不动点迭代**
   - 为什么有些 pass 需要反复运行直到 IR 不再变化
   - Canonicalization 在 MLIR 中的角色（持续简化 IR 到 canonical form）
   - 收敛性保证：如何确保迭代会终止

**交互组件**：
- `PassPipelineSimulator` — 核心组件：给定一个小型计算图，让用户选择并排列 pass（DCE、CSE、constant folding 等），点击"运行"后逐步展示每个 pass 对图的变换效果。用户可以尝试不同顺序，观察结果差异。
- `DCEAnimation` — Dead Code Elimination 动画：标记活跃节点（从输出反向遍历），灰化未标记节点，然后移除。
- `CSEAnimation` — Common Subexpression Elimination 动画：哈希每个节点，高亮重复计算，用箭头合并为单一节点。
- `DataFlowAnalysisDemo` — 数据流分析可视化：选择 constant propagation 或 liveness analysis，逐步展示 worklist 算法在图上的迭代过程，每步更新节点的数据流状态。

---

### 文章 6：图优化 Pass（中）— 高级优化与 Pattern Matching

**Slug**: `graph-passes-advanced`
**主讲**: 双主线
**难度**: advanced

**目标**：讲解更高级的图优化技术，深入 pattern matching 机制。

**内容大纲**：

1. **Layout Optimization**
   - 数据布局对性能的影响（NCHW vs NHWC vs blocked layout）
   - 为什么不同硬件偏好不同 layout（GPU 偏好 NHWC for Tensor Core）
   - Layout propagation 算法：最小化 transpose/reorder 插入
   - 全图 layout 分配问题的建模

2. **Shape 推导与 Specialization**
   - 静态 shape vs 动态 shape 对优化的影响
   - Shape specialization：固定 shape 后能解锁哪些优化
   - Shape propagation：op 的输出 shape 如何从输入 shape 推导

3. **Memory Planning**
   - Tensor 生命周期分析（从定义到最后使用）
   - In-place operation 检测
   - Memory pool 分配策略
   - 执行顺序对 peak memory 的影响

4. **Pattern Matching 深入**
   - 图上的 subgraph matching 算法
   - **MLIR 的 DRR (Declarative Rewrite Rules)**：用 TableGen 声明 pattern → replacement
   - **PDL (Pattern Description Language)**：更灵活的 pattern 描述
   - **FX 的 subgraph_rewriter**：Python 级别的 pattern matching
   - Pattern matching 的性能：大图上的高效匹配

5. **实战分析**
   - 一个 Transformer Attention Block 经过完整 pass pipeline 的变化过程
   - 每个 pass 的贡献量化

**交互组件**：
- `LayoutOptimizationDemo` — 展示 NCHW → NHWC 的 layout transformation：数据在内存中的排列变化，以及对 Tensor Core 利用率的影响。
- `PatternMatchingDemo` — 交互式 pattern matching：左边定义 pattern（如 matmul + bias_add），右边是计算图，动画展示匹配过程和替换结果。
- `TransformerPassPipeline` — 核心组件：以一个 Attention 计算图为例，逐步展示 constant folding → CSE → layout optimization → memory planning 的完整变换过程，每步可展开查看图的变化和性能影响估算。

---

### 文章 7：图优化 Pass（下）— Polyhedral 优化与循环变换

**Slug**: `graph-passes-polyhedral`
**主讲**: MLIR
**难度**: advanced

**目标**：理解 polyhedral 优化模型——循环变换的数学框架，以及它在 ML 编译器中的应用。

**内容大纲**：

1. **为什么需要循环变换**
   - 大多数算子最终展开为嵌套循环（matmul = 三重循环）
   - 循环顺序、tiling、并行化直接影响性能
   - 手工调优组合爆炸，需要系统化方法

2. **Polyhedral Model 基础**
   - 迭代空间（iteration domain）：循环的整数点集合
   - 访问函数（access function）：每次迭代访问哪些数据
   - 依赖关系（dependence）：哪些迭代必须按顺序执行
   - 用整数线性规划（ILP）表达这些约束

3. **循环变换的数学表示**
   - Affine transformation：循环变换 = 整数矩阵乘法
   - Tiling = strip-mining + interchange
   - Permutation、skewing、fusion、fission 的矩阵表示
   - 合法性判定：变换后依赖关系是否仍被满足

4. **MLIR 的 Affine Dialect**
   - affine.for、affine.load/store
   - Affine map：用仿射函数描述内存访问模式
   - 基于 affine 的 dependence analysis
   - Affine 优化 pass：loop tiling、loop fusion、loop permutation

5. **Polyhedral 在 ML 中的应用与局限**
   - 适用场景：规则的密集计算（GEMM、Convolution）
   - 局限：动态 shape、不规则访问模式（sparse、ragged tensor）不好建模
   - 与 ML 编译器实际做法的对比：大多数 ML 编译器用启发式而非完整 polyhedral

6. **MLIR Transform Dialect 预览**
   - 另一种思路：不用数学模型自动搜索，而是让用户/编译器用 IR 描述变换策略
   - 与 polyhedral 的互补关系

**交互组件**：
- `PolyhedralVisualizer` — 核心组件：可视化一个双重循环的迭代空间（2D 点阵），展示不同变换（tiling、permutation、skewing）如何改变执行顺序和数据访问模式。用户可以拖动变换矩阵参数，实时看到迭代空间的变化。
- `LoopTransformationDemo` — 展示具体的循环变换：原始嵌套循环 → tiled 循环 → permuted 循环，每步高亮代码变化和数据局部性的影响。
- `DependenceAnalysisDemo` — 依赖分析可视化：在迭代空间中用箭头展示数据依赖，验证某个变换是否合法（变换后依赖箭头方向是否一致）。

---

### 文章 8：算子融合（上）— 融合类型学与判定算法

**Slug**: `operator-fusion-taxonomy`
**主讲**: 双主线
**难度**: advanced

**目标**：系统化理解算子融合的分类、合法性条件、以及判定算法。

**内容大纲**：

1. **为什么融合是最重要的优化**
   - 内存带宽节省的定量分析
   - Roofline model 视角：融合将 memory-bound 计算转化为 compute-bound
   - 链接 ai-compute-stack 的 roofline 相关内容
   - 链接 ollama-compute-graph 的 OperatorFusion 组件作为直观入门

2. **融合类型学（系统分类）**
   - **Element-wise fusion**：任意 element-wise op 可串联。最简单、最常见。
   - **Reduction fusion**：reduce op（sum、mean）与前后 op 的融合条件。
   - **Broadcast fusion**：广播操作与计算的融合。
   - **Transpose/reshape fusion**：data movement op 与计算的融合条件。
   - **Complex pattern fusion**：
     - FlashAttention（softmax + matmul 的算法级重写）
     - Fused MHA（Multi-Head Attention 整体融合）
     - RMSNorm + MatMul（归一化 + 矩阵乘的融合）
   - 每种类型附图解，展示输入输出 tensor 的数据流和依赖关系

3. **融合合法性分析**
   - **Producer-consumer 关系**：只有直接数据依赖的 op 才能融合
   - **循环依赖检测**：融合后是否会在图中产生环
   - **Shape compatibility**：融合的 op 是否 shape 兼容（element-wise 要求 shape 完全匹配或可广播）
   - **Side effect 检查**：有副作用的 op（random、print）不能随意移动或融合
   - **Memory 约束**：融合后的 kernel 是否超出 shared memory / register 限制

4. **融合判定算法**
   - **贪心算法**：从 producer 向 consumer 扩展 fusion group
   - **图着色方法**：将兼容的 op 分配到同一颜色组
   - **TorchInductor 的 fusion 算法详解**：
     - Group fusion（将整个子图融合为一个 kernel）
     - Pointwise fusion（element-wise op 链融合）
     - Reduction fusion（reduction + surrounding ops）
     - 融合决策的优先级排序
   - **XLA 的 HLO fusion 策略对比**：producer-consumer fusion、sibling fusion、multi-output fusion
   - 算法伪代码 + 逐步动画

**交互组件**：
- `FusionTaxonomy` — 融合类型学交互图：点击每种融合类型，展示 before/after 计算图 + 内存访问模式变化 + 性能增益估算。
- `FusionLegalityChecker` — 给定一个小计算图，用户选择两个 op 尝试融合，系统自动检查合法性（数据依赖、shape 兼容性、循环检测），展示判定过程和结果。
- `FusionAlgorithmStepper` — 贪心融合算法逐步动画：在一个中等大小的计算图上展示算法如何逐步选择 fusion group，每步解释决策理由。

---

### 文章 9：算子融合（下）— Cost Model 与融合实战

**Slug**: `operator-fusion-cost-model`
**主讲**: 双主线
**难度**: advanced

**目标**：理解编译器如何决定"值不值得融合"，以及实际系统中的融合实现。

**内容大纲**：

1. **Cost Model 设计**
   - 为什么不是"能融就融"：融合也有代价
     - Register pressure 增加（融合后的 kernel 需要更多 register）
     - 编译时间增加（更大的 kernel 编译更慢）
     - Code size 增加
     - Occupancy 下降（register 用多了，SM 上能跑的 warp 就少了）
   - 硬件约束：shared memory 大小、register 数量、warp 数量
   - Cost model 的输入：每个 op 的 FLOPs、内存读写量、数据 locality
   - Cost model 的输出：预估执行时间、内存使用、occupancy

2. **TorchInductor 的 Cost Model 实战**
   - Pointwise kernel fusion 的决策逻辑
   - Reduction kernel 的 split-reduction 决策
   - 何时 fusion 反而变慢（实际案例分析）
   - Heuristic vs analytical cost model

3. **MLIR 级别的 Fusion**
   - Linalg fusion on tensors：producer-consumer fusion 的 MLIR 实现
   - Tile and fuse 策略：先 tile 再 fuse，确保 tile 后的工作集装进 shared memory
   - Affine fusion：基于 polyhedral 分析的 loop fusion

4. **FlashAttention 深度剖析**
   - 标准 Attention 的内存瓶颈分析：Q×K^T 产生 N×N 矩阵，必须写回 HBM
   - FlashAttention 的 tiling 策略：分块计算 softmax，避免 N×N 矩阵具现化
   - I/O 复杂度分析：O(N²d) → O(N²d²/M)，M = SRAM 大小
   - 为什么这不是简单的 op fusion 而是**算法级重写**
   - FlashAttention 2 的改进：减少非 matmul FLOPs、更好的 warp 间工作分配
   - FlashAttention 3 的改进：利用 Hopper 架构的异步特性

5. **融合效果实战对比**
   - 同一个 Transformer layer，不同融合策略的性能差异
   - 无融合 vs element-wise 融合 vs 完整融合 vs FlashAttention 的吞吐量/延迟/显存对比

**交互组件**：
- `CostModelCalculator` — 交互式 cost model：用户选择一组 op，调整硬件参数（shared memory size、bandwidth、register count），计算融合 vs 不融合的预估性能差异，展示 occupancy 变化。
- `FlashAttentionDeepDive` — FlashAttention 动画：展示标准 attention 的内存读写模式（Q×K^T 全量写 HBM）vs FlashAttention 的 tiled 读写模式（分块计算、在 SRAM 中完成 softmax），量化内存节省。支持调整 sequence length 和 SRAM 大小查看影响。
- `FusionBenchmarkChart` — 展示不同融合策略的性能对比图表，基于典型 Transformer 配置（GPT-2、LLaMA 7B 等）的数据。

---

### 文章 10（纵向专题）：Tiling 策略与内存层次优化

**Slug**: `tiling-memory-hierarchy`
**主讲**: 双主线（纵向贯穿）
**难度**: advanced

**目标**：追踪 tiling 和内存层次优化从高层 IR 到硬件执行的完整故事——这是一个贯穿多个编译阶段的纵向主题。

**内容大纲**：

1. **为什么 Tiling 是 GPU 编译的核心优化**
   - Roofline model 回顾：大部分 ML 计算是 memory-bound
   - Tiling 的核心思想：将大计算拆成小块，使工作集装进快速存储
   - 引用 ai-compute-stack 的 GPU 内存层次相关内容

2. **GPU 内存层次详解**
   ```
   HBM (全局显存, ~2 TB/s, 几十 GB)
     ↕  全局内存 load/store — 带宽瓶颈的根源
   L2 Cache (~数 MB, 硬件自动管理)
     ↕  tiling 大小影响 hit rate
   Shared Memory / SRAM (~几百 KB per SM, 显式管理)
     ↕  cp.async, double buffering
   Register File (~256 KB per SM)
     ↕  register tiling → Tensor Core MMA
   ```
   - 每一级的容量、带宽、延迟
   - 显式管理 vs 隐式管理

3. **多层 Tiling 策略**
   - **MLIR linalg tile-and-fuse**：在 tensor 抽象层决定 tile 划分，保持高层语义
   - **Polyhedral tiling**：数学上如何选择最优 tile size（最大化数据复用）
   - **Triton 的 block-level tiling**：BLOCK_M、BLOCK_N、BLOCK_K 的选择与 shared memory 的映射
   - **Register tiling**：Tensor Core 的 warp-level MMA (Matrix Multiply-Accumulate) 映射
   - 各层 tiling 之间的关系：high-level tile 拆分为多个 low-level tile

4. **内存层次优化技术**
   - **Shared Memory staging**：从 HBM 加载 tile 到 shared memory 的模式
   - **cp.async（异步拷贝）**：Ampere+ 架构的异步全局→共享内存拷贝
   - **Double buffering / Multi-stage pipelining**：计算当前 tile 的同时预取下一个 tile
   - **Memory coalescing**：线程访问模式对 HBM 带宽利用率的影响
   - **Swizzling**：重排 shared memory 地址以减少 bank conflict
   - **Bank conflict 分析**：什么访问模式导致 bank conflict，如何避免

5. **Tile Size 选择的约束分析**
   - Shared memory 容量限制（tile 太大装不下）
   - Register pressure 限制（tile 内计算需要的 register 数量）
   - Occupancy 权衡（SM 上活跃 warp 数 vs 每个 warp 的资源需求）
   - 三者的 trade-off 如何量化
   - 启发式 vs autotuning 的选择

6. **Tiling 在编译栈各层的体现**（纵向串联）
   - Pass 阶段：MLIR bufferization pass 决定内存层级
   - Tiling 阶段：tile size 决定数据在内存层次中的流动
   - Fusion 阶段：tile-and-fuse 将 tiling 和 fusion 结合
   - Codegen 阶段：生成 shared memory load/store、async copy、barrier
   - 调度阶段：多 kernel 间的 memory reuse

7. **实战案例：GEMM kernel 的完整 tiling 分析**
   - 从 naive matmul → shared memory tiling → register tiling → Tensor Core mapping
   - 每步的性能提升和资源消耗分析

**交互组件**：
- `TilingHierarchyExplorer` — 核心组件：展示同一个 matmul 在不同 tiling 层级的视图，从全局矩阵 → thread block tile → warp tile → instruction tile (MMA)，每层对应内存层级。点击每层查看数据流和资源消耗。
- `MemoryHierarchyFlow` — 数据搬运动画：一个 tile 从 HBM 到 shared memory 到 register 到 Tensor Core 的完整流程，标注每步的延迟和带宽。支持切换 single buffer / double buffer 模式查看 pipeline 效果。
- `TileSizeCalculator` — 交互式计算器：输入矩阵尺寸和硬件参数（shared mem size、register count、warp count），计算可行的 tile size 范围，显示 occupancy / performance trade-off 曲线。
- `BankConflictVisualizer` — Shared memory bank conflict 可视化：展示不同线程访问模式下的 bank 使用情况，对比有 conflict vs 无 conflict 的性能差异。

---

### 文章 11（纵向专题）：Dynamic Shapes — 从捕获到执行的全链路挑战

**Slug**: `dynamic-shapes-challenge`
**主讲**: 双主线（纵向贯穿）
**难度**: advanced

**目标**：追踪 dynamic shapes 问题如何贯穿编译器的每一个阶段——这是 LLM 推理中最核心的实际挑战。

**内容大纲**：

1. **问题定义**
   - LLM 推理的 sequence length 时刻变化
   - Batch size 也可能动态变化（continuous batching）
   - 传统编译器通常假设静态类型和大小，ML 的动态维度是独特挑战
   - 核心矛盾：编译器在编译时需要尽可能多的静态信息来优化，但 ML 工作负载天然是动态的

2. **PyTorch 的方案 — Symbolic Shapes**
   - SymInt / SymFloat 的设计：用符号变量而非具体数值表示维度
   - Symbol 的约束系统（s0 > 0、s0 <= 2048、s0 % 8 == 0）
   - Guard 系统与 Symbolic Shapes 的关系：什么时候 guard 触发重编译
   - `torch._dynamo.mark_dynamic()` 的使用
   - 实际例子：dynamic batch size + dynamic seq_len 的 tracing

3. **对 IR 层的影响**
   - Symbolic shape 如何在 FX Graph 中表示
   - MLIR 中的 dynamic dimension（`tensor<?x768xf32>` vs `tensor<128x768xf32>`）
   - Shape constraint propagation：一个维度的约束如何传播到下游 op

4. **对优化 Pass 的影响**
   - 哪些 pass 在 dynamic shape 下失效：
     - Constant folding：shape-dependent 的常量无法折叠
     - 某些 layout optimization：需要知道维度大小才能选择最优 layout
     - Static memory planning：不知道 tensor 大小就无法预分配
   - 哪些 pass 仍然有效：DCE、CSE（与 shape 无关）
   - Shape specialization vs generalization 的 trade-off

5. **对融合的影响**
   - Shape-dependent fusion decisions：reduction dimension 未知时能否融合？
   - 动态 shape 下的 fusion group 大小限制
   - 保守策略 vs 激进策略

6. **对 Tiling / Codegen 的影响**
   - 静态 tile size vs runtime tile size selection
   - 特化 kernel（每种 shape 编译一个）vs 通用 kernel（一个 kernel 处理所有 shape）
   - Compilation cache：按 shape bucket 缓存编译结果
   - JIT 编译的延迟问题

7. **工程策略**
   - Bucketing：将 sequence length 归入几个桶（64, 128, 256, 512, 1024...）
   - Padding to nearest power of 2 / multiple of 8
   - Shape hint：告诉编译器 shape 的范围
   - 预编译（ahead-of-time）vs 首次运行编译（JIT）

8. **实战分析**
   - LLM 推理场景：不同 sequence length 下 torch.compile 的表现
   - 重编译次数 vs 性能的 trade-off
   - 常见 pitfall 和 workaround

**交互组件**：
- `DynamicShapeImpactTracer` — 选择一个编译阶段（Pass / Fusion / Tiling / Codegen），展示 static shape vs dynamic shape 下编译器行为的差异。用对比面板呈现。
- `GuardRecompilationDemo` — 动画演示：连续输入不同 shape 的 tensor → guard check → hit（复用缓存）或 miss（触发重编译）。展示 compilation cache 的行为和重编译开销。
- `BucketingStrategyCompare` — 对比不同 bucketing 策略的效果：横轴是 sequence length 分布，纵轴是总编译次数和平均性能。用户可以调整 bucket 数量和边界，看对整体性能的影响。

---

### 文章 12：代码生成（上）— 指令选择、Vectorization 与 Register Allocation

**Slug**: `codegen-instruction-selection`
**主讲**: 双主线
**难度**: advanced

**目标**：理解从优化后的 IR 到具体机器指令的映射过程。

**内容大纲**：

1. **Codegen 的任务**
   - 从优化后的高层 IR（已经过 pass、fusion、tiling）→ 可在硬件上执行的指令
   - Codegen 不是简单的翻译，仍然有大量优化空间

2. **指令选择（Instruction Selection）**
   - 从 IR op 到硬件指令的映射
   - 一对多映射：一个高层 op 可能有多种实现方式
   - LLVM 的 SelectionDAG / GlobalISel 方法
   - GPU 特有的指令选择：Tensor Core MMA 指令、特殊函数单元（SFU）

3. **Vectorization**
   - SIMD 映射：将标量操作映射到向量指令
   - GPU 上的向量化：warp 级别的 SIMT 模型
   - 向量化合法性分析：依赖关系、对齐要求
   - 向量宽度选择：float4 vs float2 vs scalar 的 trade-off

4. **Register Allocation**
   - GPU register allocation 的特殊性：
     - GPU 的 register file 很大（每个 SM 256KB）但被所有 warp 共享
     - Register 使用量直接影响 occupancy
     - 与 CPU 不同：没有 register spilling 到 stack（spill 到 local memory 很慢）
   - Register pressure 分析：fusion 和 tiling 如何影响 register 使用量
   - Trade-off：少用 register → 高 occupancy → 更多并行 vs 多用 register → 低 occupancy → 更多数据复用

5. **Peephole Optimization**
   - 指令级的局部优化
   - 强度削减（strength reduction）：乘法 → 移位
   - 指令合并：多个小操作合并为一个宽操作

**交互组件**：
- `InstructionSelectionDemo` — 展示一个简单计算从 IR op 到 GPU 指令的选择过程：同一个 matmul 可以选择 FFMA（标量）、HMMA（Tensor Core FP16）、IMMA（Tensor Core INT8）等不同指令路径，展示各路径的性能特征。
- `RegisterPressureVisualizer` — 交互式 register pressure 分析：调整 fusion 策略（融合更多 op）和 tiling（更大的 tile），实时显示 register 使用量和 occupancy 的变化。
- `VectorizationDemo` — 展示标量代码到向量化代码的转换：原始标量循环 → 向量化后的代码，高亮并行执行的数据通道。

---

### 文章 13：代码生成（下）— Triton Pipeline、编译器后端与数值正确性

**Slug**: `codegen-triton-backend`
**主讲**: 交汇（Triton 连接 PyTorch 和 MLIR）
**难度**: advanced

**目标**：深入 Triton 的编译 pipeline，理解不同编译器后端，以及编译优化的数值正确性问题。

**内容大纲**：

1. **Triton 深入**
   - Triton 的定位：介于 CUDA C 和编译器 IR 之间的 DSL
   - 编程模型：block-level programming（不写 thread-level 代码）
   - 核心 API：tl.load/store（显式内存管理）、tl.dot（matmul）、tl.where（条件）
   - Triton 的编译 pipeline：
     - Triton Python DSL → Triton IR
     - Triton IR → Triton GPU IR（硬件映射）
     - Triton GPU IR → LLVM IR（via MLIR）
     - LLVM IR → PTX → cubin
   - Triton 迁移到 MLIR 的意义和进展

2. **TorchInductor 的 Codegen**
   - 从 FX Graph 到 Triton kernel 的生成过程
   - Template-based codegen vs programmatic codegen
   - Wrapper codegen：kernel 之间的调度代码、内存分配代码
   - 生成代码的可读性和调试

3. **MLIR 到 LLVM 的 Lowering**
   - LLVM Dialect 作为 MLIR 的出口
   - memref → llvm.ptr 的转换
   - GPU Dialect → NVVM Dialect → PTX
   - GPU Dialect → ROCDL Dialect → GCN（AMD）
   - GPU Dialect → SPIR-V Dialect（Intel / Vulkan）

4. **其他后端对比**
   - IREE（MLIR 原生运行时 + 编译器）
   - TensorRT（NVIDIA 的推理优化器）
   - 各后端的定位、优劣势和适用场景

5. **数值正确性与验证**
   - 浮点运算的非结合性：编译器重排计算顺序可能改变数值结果
   - Fusion 和 tiling 对数值结果的影响
   - 混合精度（FP32 accumulation for FP16 inputs）的正确性
   - 测试策略：编译前后结果对比、tolerance 设定
   - torch.compile 的 correctness checking 工具

**交互组件**：
- `TritonCompilationPipeline` — Triton 编译管线动画：一段 Triton kernel 代码（如 vector_add 或 matmul）→ Triton IR → Triton GPU IR → LLVM IR → PTX 的逐层变换，每层高亮关键变化。
- `CodegenExplorer` — TorchInductor codegen 示例：给定一个小 FX Graph（如 LayerNorm），展示 TorchInductor 生成的 Triton kernel 代码，高亮 IR 节点和生成代码的对应关系。
- `BackendComparison` — 不同编译器后端的交互式对比表：选择两个后端，展示它们在编译速度、运行时性能、支持的硬件、生态成熟度等维度的对比。
- `NumericalAccuracyDemo` — 展示相同计算在不同优化策略下的数值差异：eager mode vs compiled mode vs compiled+fusion，显示误差分布。

---

### 文章 14（进阶专题）：量化编译与混合精度优化

**Slug**: `quantization-compilation`
**主讲**: 双主线
**难度**: advanced

**目标**：理解编译器如何处理量化后的计算图——这是 LLM 推理性能优化的关键环节，与独立的 quantization 学习路径互补。

**内容大纲**：

1. **量化与编译的交叉**
   - quantization 学习路径讲"怎么量化"，本文讲"编译器怎么处理量化后的图"
   - 量化图的特点：mixed-precision op（INT4 weight × FP16 activation）、频繁的 cast / dequant 操作

2. **量化图的编译挑战**
   - Dequantize → Compute → Quantize 的链路：大量类型转换 op
   - 混合精度图：同一个模型中不同 op 使用不同精度（FP32、FP16、INT8、INT4）
   - 编译器需要的信息：量化参数（scale、zero_point）、精度策略

3. **量化感知的融合（Quantization-Aware Fusion）**
   - Dequant → MatMul → Quant 融合为单一量化 matmul kernel
   - Dequant → LayerNorm → Quant 的融合
   - 融合判定：哪些 quant/dequant 可以被吸收到计算 kernel 中
   - 减少类型转换开销

4. **混合精度编译策略**
   - Precision propagation：如何决定每个 op 的精度
   - Loss-sensitive op（LayerNorm、Softmax 通常保持高精度）
   - 编译器级 auto-mixed-precision（vs 用户手动指定）

5. **量化 kernel 生成**
   - INT4/INT8 GEMM 的特殊 kernel
   - Weight-only quantization 的 kernel 特点（on-the-fly dequantization）
   - FP8 (E4M3/E5M2) 在 Hopper 架构上的支持
   - Triton 对量化 kernel 的支持

6. **实战案例**
   - LLaMA 7B 的 INT4 量化推理：编译器级优化带来的加速
   - 对比不同量化编译策略的性能

**交互组件**：
- `QuantFusionVisualizer` — 展示量化图的融合过程：原始量化图（充满 dequant/quant 节点）→ 融合后的图（quant/dequant 被吸收进计算 kernel），对比节点数量和预期性能。
- `MixedPrecisionGraph` — 交互式混合精度图：一个 Transformer layer 的计算图，每个 op 用颜色标注精度（FP32=蓝、FP16=绿、INT8=橙、INT4=红），用户可以调整各 op 的精度查看对模型质量和性能的影响。
- `QuantKernelComparison` — 对比不同量化格式的 kernel 性能：FP16 vs INT8 vs INT4 的 matmul throughput，不同硬件（A100/H100）上的表现。

---

### 文章 15（进阶专题）：分布式编译与图分割

**Slug**: `distributed-compilation`
**主讲**: 双主线
**难度**: advanced

**目标**：理解大模型时代编译器如何参与多设备分割决策。

**内容大纲**：

1. **为什么编译器需要参与分布式**
   - 单卡装不下大模型（LLaMA 70B 需要 ~140GB FP16）
   - 手动分割效率低，组合空间大
   - 编译器有全局计算图信息，可以做更优分割

2. **并行策略回顾**
   - Data parallelism（DP）：简单但内存不省
   - Tensor parallelism（TP）：按 tensor 维度切分算子
   - Pipeline parallelism（PP）：按层切分模型
   - 专家并行（EP）：MoE 模型的特殊需求
   - 实际系统通常混合使用多种策略

3. **GSPMD — Google 的自动分割系统**
   - 核心思想：用户标注少量 tensor 的分割方式，编译器自动推导全图
   - Sharding propagation 算法：从用户标注出发，沿计算图传播分割决策
   - 通信算子的自动插入（all-gather、reduce-scatter、all-to-all）
   - Cost model：通信开销 vs 计算负载均衡

4. **torch.compile 与分布式的交互**
   - torch.compile + FSDP（Fully Sharded Data Parallel）
   - torch.compile + Tensor Parallel
   - 编译器如何处理通信算子（all_reduce 等）
   - 通信-计算重叠优化

5. **通信优化**
   - All-reduce fusion：合并多个小 all-reduce 为一个大的
   - Compute-communication overlap：在通信时做其他计算
   - 通信调度：最优化通信顺序以减少等待
   - 拓扑感知：考虑 NVLink/NVSwitch/InfiniBand 的拓扑结构

6. **图分割算法**
   - 问题建模：加权图分割（节点 = 计算量，边 = 通信量）
   - 贪心策略 vs 动态规划 vs ILP 求解
   - Pipeline parallelism 的 stage 划分：如何均衡每个 stage 的计算量
   - 实际系统的分割策略

**交互组件**：
- `ShardingPropagationDemo` — GSPMD 风格的 sharding propagation 动画：给定一个小计算图，用户标注输入 tensor 的分割方式，系统自动传播并显示每个中间 tensor 的分割、需要插入的通信算子。
- `ParallelStrategyExplorer` — 对比不同并行策略：选择模型大小和 GPU 数量，展示 DP / TP / PP 各自的内存使用、通信量、计算效率。
- `CommunicationOverlapTimeline` — 时间轴视图展示通信与计算的重叠：无重叠（串行）vs 有重叠（pipeline）的性能差异。

---

### 文章 16：调度与执行优化

**Slug**: `scheduling-execution`
**主讲**: 双主线
**难度**: advanced

**目标**：理解编译好的 kernel 如何被调度执行，以及执行层面的优化。

**内容大纲**：

1. **Kernel 调度策略**
   - 算子间依赖分析与拓扑排序
   - 关键路径分析：最长路径决定最短执行时间
   - CUDA Stream 并行：无依赖 kernel 在不同 stream 上并发
   - Compute 与 memory transfer 重叠（异步拷贝、prefetch）
   - CUDA Graph：将多个 kernel launch 录制为一个图，减少 launch overhead

2. **TorchInductor Scheduler 设计**
   - 融合决策与调度决策的关系
   - Scheduler 的输入：fusion group + 依赖图
   - 调度目标：最小化总执行时间 + 最小化 peak memory
   - 调度启发式

3. **Memory 调度优化**
   - Tensor 生命周期分析
   - Recompute vs Store 决策：
     - 激活值保存（用内存换计算）vs 激活值重算（用计算换内存）
     - Activation checkpointing 的编译器自动化
   - In-place operation 与 buffer 复用
   - Peak memory 优化：执行顺序对显存峰值的影响（相同的计算图，不同调度顺序可能有 2-3x 的 peak memory 差异）

4. **多 Backend 支持**
   - 编译器的硬件抽象层设计
   - TorchInductor 的 backend 体系：Triton（NVIDIA GPU）、C++/OpenMP（CPU）、XPU backend
   - MLIR 的多 backend 路径：GPU Dialect → NVVM / ROCDL / SPIR-V
   - Intel XPU 生态：oneAPI、Level Zero、SYCL 与编译器的集成
   - AMD ROCm 与 Triton 的适配

5. **Backend 选择与分发**
   - 同一模型中不同 op 分派到不同硬件
   - Fallback 机制：不支持的 op 回退到 CPU
   - 异构调度的挑战：跨设备数据传输开销
   - 何时值得 offload 到加速器 vs 留在 CPU

**交互组件**：
- `KernelSchedulerDemo` — 时间轴视图展示 kernel 在多 CUDA stream 上的调度。对比串行执行 vs 多 stream 并行 vs CUDA Graph 的执行时间。可以拖动 kernel 查看调度变化。
- `MemoryScheduleVisualizer` — 展示不同执行顺序对 peak memory 的影响：同一个计算图的两种拓扑排序，实时显示 memory timeline 和峰值差异。支持切换 recompute 策略查看 memory 节省。
- `MultiBackendDispatch` — 展示一个模型的 op 如何被分派到不同 backend（GPU/CPU/XPU），以及各 backend 的执行时间和数据传输开销。

---

### 文章 17：自动调优与端到端实战

**Slug**: `autotuning-end-to-end`
**主讲**: 双主线
**难度**: advanced

**目标**：理解自动调优的原理和策略，并通过端到端实战串联全路径。

**内容大纲**：

1. **为什么需要 Autotuning**
   - 硬件太复杂，静态 cost model 不够准确
   - 同一 kernel 在不同 GPU 上最优配置不同
   - 手工调优组合爆炸：tile size × num_warps × num_stages × ...

2. **Triton 的 Autotune 机制**
   - 可调参数：BLOCK_SIZE_M/N/K、num_warps、num_stages
   - @triton.autotune decorator 的使用
   - Grid search 的实现
   - Compilation cache 与 warmup 开销
   - 实际例子：matmul kernel 的 autotune 配置

3. **搜索策略深入**
   - **Grid search**：穷举，简单但慢
   - **Random search**：在大搜索空间中比 grid search 更高效
   - **Bayesian optimization**：用 surrogate model 指导搜索
   - **Cost model guided search**：用预估模型减少搜索空间
   - **Transfer learning**：跨 workload / 跨硬件的调优知识迁移
   - **TVM 的 AutoScheduler / MetaSchedule**：对比参考

4. **MLIR Transform Dialect**
   - Programmable scheduling 的理念
   - Schedule script：用 IR 描述优化策略（tiling、fusion、vectorization 等）
   - 与传统 autotune 的区别：编译器工程师指定策略框架，autotune 只搜索参数
   - 与 polyhedral 的互补

5. **编译调试实战**
   - 如何调试 torch.compile 问题
   - `TORCH_LOGS`：查看 TorchDynamo、TorchInductor 的调试日志
   - `torch._dynamo.explain()`：分析 graph break 原因
   - 常见 pitfall：
     - Graph break 导致性能下降
     - Dynamic shape 导致过多重编译
     - 编译时间过长
   - 调试工具链总结

6. **端到端实战：torch.compile 一个 Transformer Layer**
   - 完整旅程串联：
     - `torch.compile(model)` 调用
     - TorchDynamo 捕获 FX Graph（文章 2）
     - AOTAutograd 构建 joint graph（文章 2）
     - FX IR 表示（文章 3-4）
     - 优化 pass 执行（文章 5-7）
     - 算子融合（文章 8-9）
     - Tiling 与内存优化（文章 10）
     - Dynamic shape 处理（文章 11）
     - Codegen 生成 Triton kernel（文章 12-13）
     - Kernel 调度与执行（文章 16）
     - Autotuning 选择最优配置（本文）
   - 实际性能数据：编译前 vs 编译后的吞吐量、延迟、显存对比
   - 使用 GPT-2 / LLaMA 7B 等真实模型的 benchmark

**交互组件**：
- `AutotuneExplorer` — 交互式 autotune 模拟：选择一个 kernel（matmul 或 attention），调整参数（block size、warps、stages），实时显示预估性能曲面。用户可以手动搜索，也可以点击"自动搜索"看不同搜索策略的行为。
- `TransformDialectDemo` — MLIR Transform Dialect 示例：展示 schedule script 如何指导 tiling、fusion、vectorization，对比不同 schedule 策略的效果。
- `CompileJourneyRecap` — 端到端回顾动画：串联全路径 17 篇文章的核心概念。以 `torch.compile(model)` 为起点，每个编译阶段用一个小卡片展示关键变换，点击可跳转到对应文章。最终展示从 Python 代码到 GPU kernel 的完整旅程。

## 3. 共享组件设计

### 3.1 CompilerStackMap（核心共享组件）

**用途**：出现在每篇文章顶部，作为"你在这里"导航。

**设计**：
- 完整模式（文章 1）：全尺寸编译栈层级图，展示所有 17 篇文章的位置和关系
- 缩略模式（文章 2-17）：紧凑版层级图，当前文章高亮，其他文章灰显
- 支持三种颜色区分文章类型：横向阶段 / 纵向专题 / 进阶专题
- 支持点击跳转到对应文章
- Props：`currentArticle: string`（当前文章 slug）、`mode: 'full' | 'compact'`、`locale: 'zh' | 'en'`

### 3.2 组件汇总

共 **~40 个交互组件**，按文章分布：

| 文章 | 组件数 | 关键组件 |
|------|--------|----------|
| 1 | 3 | CompilerStackMap, EagerVsCompiled, CompilerTimelineChart |
| 2 | 4 | DynamoTracingFlow, FXGraphExplorer, GuardSystemDemo, AOTAutogradFlow |
| 3 | 3 | IRLayerVisualizer, DialectExplorer, SSAVisualizer |
| 4 | 3 | ProgressiveLoweringAnimation, DialectConversionDemo, BufferizationVisualizer |
| 5 | 4 | PassPipelineSimulator, DCEAnimation, CSEAnimation, DataFlowAnalysisDemo |
| 6 | 3 | LayoutOptimizationDemo, PatternMatchingDemo, TransformerPassPipeline |
| 7 | 3 | PolyhedralVisualizer, LoopTransformationDemo, DependenceAnalysisDemo |
| 8 | 3 | FusionTaxonomy, FusionLegalityChecker, FusionAlgorithmStepper |
| 9 | 3 | CostModelCalculator, FlashAttentionDeepDive, FusionBenchmarkChart |
| 10 | 4 | TilingHierarchyExplorer, MemoryHierarchyFlow, TileSizeCalculator, BankConflictVisualizer |
| 11 | 3 | DynamicShapeImpactTracer, GuardRecompilationDemo, BucketingStrategyCompare |
| 12 | 3 | InstructionSelectionDemo, RegisterPressureVisualizer, VectorizationDemo |
| 13 | 4 | TritonCompilationPipeline, CodegenExplorer, BackendComparison, NumericalAccuracyDemo |
| 14 | 3 | QuantFusionVisualizer, MixedPrecisionGraph, QuantKernelComparison |
| 15 | 3 | ShardingPropagationDemo, ParallelStrategyExplorer, CommunicationOverlapTimeline |
| 16 | 3 | KernelSchedulerDemo, MemoryScheduleVisualizer, MultiBackendDispatch |
| 17 | 3 | AutotuneExplorer, TransformDialectDemo, CompileJourneyRecap |

### 3.3 组件设计原则

- 所有组件使用现有项目的技术栈：React + Motion + SVG + COLORS/FONTS 共享常量
- 支持 `locale: 'zh' | 'en'` prop，双语文本内置
- 遵循项目已有的交互模式：StepNavigator 用于多步骤流程，SVG viewBox 标准尺寸
- 动画使用 `motion/react`，数据可视化用自定义 SVG
- 组件文件放在 `src/components/interactive/` 下，命名用 PascalCase

## 4. 学习路径 YAML 定义

```yaml
id: graph-compilation-optimization
title:
  zh: 图编译与优化
  en: Graph Compilation & Optimization
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

## 5. Phase 划分

实现分 4 个 Phase，每个 Phase 一个独立 implementation plan。

### Phase 1：基础设施 + 全景图 + 图捕获 + IR 设计（文章 1-4 + 共享组件）

**产出**：路径 YAML、CompilerStackMap 共享组件、文章 1-4 的 MDX + 交互组件
**文章数**：4 篇，~13 个组件
**依赖**：无（路径起点）
**完成标志**：读者可以理解 ML 编译器的全景、图捕获机制、IR 设计哲学

**包含任务**：
1. 创建路径 YAML (`src/content/paths/graph-compilation-optimization.yaml`)
2. 实现 CompilerStackMap 共享组件（full + compact 模式）
3. 文章 1：全景图 — MDX + EagerVsCompiled + CompilerTimelineChart
4. 文章 2：图捕获 — MDX + DynamoTracingFlow + FXGraphExplorer + GuardSystemDemo + AOTAutogradFlow
5. 文章 3：IR 设计（上）— MDX + IRLayerVisualizer + DialectExplorer + SSAVisualizer
6. 文章 4：IR 设计（下）— MDX + ProgressiveLoweringAnimation + DialectConversionDemo + BufferizationVisualizer

### Phase 2：Pass + 融合（文章 5-9）

**产出**：文章 5-9 的 MDX + 交互组件
**文章数**：5 篇，~16 个组件
**依赖**：Phase 1（需要 CompilerStackMap、IR 概念已建立）
**完成标志**：读者理解图优化 pass 的理论和实践、算子融合的完整故事

**包含任务**：
1. 文章 5：Pass 基础 — MDX + PassPipelineSimulator + DCEAnimation + CSEAnimation + DataFlowAnalysisDemo
2. 文章 6：高级 Pass — MDX + LayoutOptimizationDemo + PatternMatchingDemo + TransformerPassPipeline
3. 文章 7：Polyhedral — MDX + PolyhedralVisualizer + LoopTransformationDemo + DependenceAnalysisDemo
4. 文章 8：融合类型学 — MDX + FusionTaxonomy + FusionLegalityChecker + FusionAlgorithmStepper
5. 文章 9：融合 Cost Model — MDX + CostModelCalculator + FlashAttentionDeepDive + FusionBenchmarkChart

### Phase 3：纵向专题 + Codegen（文章 10-13）

**产出**：文章 10-13 的 MDX + 交互组件
**文章数**：4 篇，~14 个组件
**依赖**：Phase 2（需要 Pass/Fusion 概念已建立，Tiling 专题引用 fusion 内容）
**完成标志**：读者理解 tiling/内存层次、dynamic shapes 的纵向影响、代码生成的完整流程

**包含任务**：
1. 文章 10：Tiling 与内存层次 — MDX + TilingHierarchyExplorer + MemoryHierarchyFlow + TileSizeCalculator + BankConflictVisualizer
2. 文章 11：Dynamic Shapes — MDX + DynamicShapeImpactTracer + GuardRecompilationDemo + BucketingStrategyCompare
3. 文章 12：Codegen（上）— MDX + InstructionSelectionDemo + RegisterPressureVisualizer + VectorizationDemo
4. 文章 13：Codegen（下）— MDX + TritonCompilationPipeline + CodegenExplorer + BackendComparison + NumericalAccuracyDemo

### Phase 4：进阶专题 + 调度 + 收束（文章 14-17）

**产出**：文章 14-17 的 MDX + 交互组件
**文章数**：4 篇，~12 个组件
**依赖**：Phase 3（需要 codegen 概念已建立，进阶专题引用基础流程）
**完成标志**：完整学习路径可用，读者可以从头到尾走完 ML 编译器的全部内容

**包含任务**：
1. 文章 14：量化编译 — MDX + QuantFusionVisualizer + MixedPrecisionGraph + QuantKernelComparison
2. 文章 15：分布式编译 — MDX + ShardingPropagationDemo + ParallelStrategyExplorer + CommunicationOverlapTimeline
3. 文章 16：调度与执行 — MDX + KernelSchedulerDemo + MemoryScheduleVisualizer + MultiBackendDispatch
4. 文章 17：自动调优与端到端 — MDX + AutotuneExplorer + TransformDialectDemo + CompileJourneyRecap

## 6. 双语策略

- 每篇文章同步创建 zh 和 en 版本
- 交互组件内置双语支持（`locale` prop）
- 技术术语保持英文原文，首次出现附中文翻译
- 文章写作顺序：先 zh，再 en（zh 版作为主版本）

## 7. 参考资源要求

每篇文章的 frontmatter references 必须包含真实、可验证的来源：

**核心参考**：
- PyTorch 2.0 官方文档和博客
- MLIR 官方文档 (mlir.llvm.org)
- Triton 官方文档和论文
- FlashAttention 论文 (Dao et al.)
- GSPMD 论文 (Xu et al.)
- TVM 论文 (Chen et al.)

**学术参考**：
- 编译器经典教材（龙书/虎书/鲸书）中的相关章节
- Polyhedral model 相关论文
- SSA 相关论文

**验证要求**：所有 reference URL 必须在写作时验证可访问。
