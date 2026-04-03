# GPU Deep Dive — 设计文档

> Phase 1 of 2. Phase 2 (非 CUDA 路线 + 矩阵加速指令进阶) 后续再做。

## 概述

在 AI Compute Stack 全景文章的基础上，新增 4 篇深入文章，形成 **"全景 → 硬件架构 → 矩阵加速 → 编程模型 → 优化实战"** 的递进路径。

**目标读者**：已读过 AI Compute Stack 全景文章，想深入理解 GPU 硬件和编程的开发者。

**风格**：混合型 — 交互动画建立直觉 + 关键处给真实 CUDA 代码片段。图要多（静态结构图 + 动态拆解动画），不怕数量多。

**硬件主线**：NVIDIA 为主（SM、Tensor Core、CUDA），Intel 客户端 iGPU (Xe2, Lunar Lake/Panther Lake) 详讲，AMD 简要提及。

**学习路径**：归入现有 `ai-compute-stack` 路径，排在全景文章之后。

## 文章列表

| # | slug | 标题 | 定位 |
|---|------|------|------|
| 1 | `gpu-architecture` | GPU Architecture — 从晶体管到线程 | 硬件基础 |
| 2 | `matrix-acceleration` | 矩阵加速单元 — Tensor Core 与 XMX | 专用硬件 |
| 3 | `cuda-programming-model` | CUDA 编程模型 — 从代码到硬件 | 编程抽象 |
| 4 | `gemm-optimization` | GEMM 优化 — 从 Naive 到极致 | 实战优化 |

---

## 文章 1: GPU Architecture — 从晶体管到线程

**slug**: `gpu-architecture`
**difficulty**: intermediate
**tags**: [gpu, architecture, hardware, nvidia, intel]
**prerequisites**: [ai-compute-stack]

### Section 1: GPU vs CPU — 两种设计哲学

**内容**：
- CPU 优化单线程延迟（大缓存、乱序执行、分支预测），GPU 优化总吞吐量（数千个小核心、硬件线程切换隐藏延迟）
- 晶体管预算分配：CPU 把大量晶体管给控制逻辑，GPU 把大量晶体管给 ALU
- "延迟隐藏"核心思想：CPU 靠缓存减少等待，GPU 靠切换线程填满等待

**组件**：
1. **CpuGpuTransistorCompare** (静态) — 芯片面积分配对比图：CPU 的大缓存+复杂控制 vs GPU 的 ALU 阵列。用面积块表达晶体管预算比例
2. **LatencyHidingCompare** (动画) — 左：CPU 单线程遇到 cache miss 时 stall（空白时间段）；右：GPU 在同一时间轴上切换 warp 填满空闲周期（无空白）

### Section 2: NVIDIA GPU 全局结构

**内容**：
- 从芯片级到计算单元的层级：GPU → GPC (Graphics Processing Cluster) → TPC (Texture Processing Cluster) → SM
- L2 Cache 的位置和作用（所有 SM 共享）
- Memory Controller → HBM
- 以具体芯片为例（如 H100: 132 SM vs RTX 4090: 128 SM）展示不同定位

**组件**：
3. **GpuChipTopology** (静态+交互) — 芯片层级结构图。展示 GPC → TPC → SM 的嵌套层级，点击 SM 展开看内部概览（链接到 Section 3）。标注 L2 cache 和 HBM 位置

### Section 3: SM 内部解剖

**内容**：
- SM 的四个 sub-partition（Processing Block），每个有自己的 warp scheduler
- 各功能单元：FP32 core、INT32 core、FP64 core、SFU（特殊函数）、Load/Store Unit、Tensor Core
- Register File（每 SM 256KB）和 Shared Memory / L1 Cache（可配置分配比例）
- 具体数字以 Hopper SM 为例

**组件**：
4. **SmInternalDiagram** (静态) — SM 内部结构图，标注每个子分区内的单元类型和数量。用颜色区分计算单元（蓝）、存储（绿）、控制（橙）
5. **SmResourceTable** (静态) — Ampere → Hopper → Blackwell SM 资源对比表

### Section 4: Warp — GPU 的最小执行单位

**内容**：
- Warp = 32 个线程，硬件级锁步执行（SIMT 的具体体现）
- Warp scheduler 每个周期为一个 ready warp 选择一条指令发射
- Warp divergence：if/else 分支导致部分线程被 mask 掉，两个分支串行执行
- Warp 数量与延迟隐藏的关系：更多 active warp = 更好地隐藏内存延迟

**组件**：
6. **WarpExecutionAnimation** (动画) — 32 个线程执行同一指令的可视化；然后 if/else 分支时部分线程 inactive（灰显），两条路径串行执行
7. **WarpSchedulerTimeline** (动画) — 时间轴上 warp scheduler 在多个 warp 间切换：warp A 等内存 → 切到 warp B → warp B 等内存 → 切到 warp C → warp A 数据到了 → 切回执行

### Section 5: 内存层次

**内容**：
- 四级层次：Register (最快、私有) → Shared Memory / L1 (SM 内共享) → L2 (全局共享) → HBM (全局，最慢)
- 每级的带宽、延迟、容量具体数字（以 H100 为例）
- 引用 flash-attention 文章的 GPUMemoryHierarchy 组件和讨论

**组件**：
8. **MemoryHierarchyDetailed** (静态) — 扩展版内存金字塔：标注每级的容量/带宽/延迟数字，用面积或宽度表达带宽差异。比 flash-attention 的 GPUMemoryHierarchy 更详细（那个侧重 SRAM vs HBM 二分，这个展示完整四级层次）

### 组件总计: 8 (3 静态 + 3 动画 + 1 静态+交互 + 1 对比表)

---

## 文章 2: 矩阵加速单元 — Tensor Core 与 XMX

**slug**: `matrix-acceleration`
**difficulty**: intermediate
**tags**: [gpu, tensor-core, xmx, systolic-array, nvidia, intel]
**prerequisites**: [gpu-architecture]

### Section 1: 为什么需要专用矩阵单元

**内容**：
- 传统 CUDA Core 做矩阵乘法是逐元素标量乘加：一个 4×4 矩阵乘需要 64 次乘法 + 48 次加法 = 112 条指令
- Tensor Core / XMX 一条指令完成整块矩阵乘累加 D = A·B + C
- 吞吐量差一个数量级：H100 FP16 Tensor Core ~990 TFLOPS vs FP32 CUDA Core ~67 TFLOPS
- AI 训练/推理 90%+ 计算量是矩阵乘法 — 值得用专用硬件加速

**组件**：
1. **TensorCoreVsCudaCore** (动画) — 同一个 4×4 矩阵乘：左边 CUDA Core 逐元素做 112 次操作（快进显示，计数器飞涨），右边 Tensor Core 一拍完成。直观展示吞吐差异

### Section 2: Systolic Array — 数据在阵列中脉动流动

**内容**：
- Systolic array 基本概念：一个 PE（Processing Element）网格，数据从边缘流入，每个 PE 做 multiply-accumulate 并将数据/结果传给邻居
- 详细动画拆解：输入矩阵 A 从左侧逐行流入，B 从顶部逐列流入，每个 PE 做一次乘加，部分和向下传递（weight-stationary 变体则不同）
- 为什么高效：极高数据复用率 — 每个输入元素被多个 PE 使用，避免反复从内存读取
- Dataflow 分类简述：output-stationary、weight-stationary、input-stationary — 决定哪个矩阵"固定"在 PE 内，哪个"流动"
- 局限：固定尺寸阵列，矩阵不匹配时有利用率损失；只能做矩阵乘，其他操作仍走传统 core

**组件**：
2. **SystolicArrayAnimation** (动画，核心组件) — 脉动阵列工作过程：一个 4×4 PE 网格，数据从两个方向按时钟节拍流入。每拍：高亮活跃 PE、显示乘加计算、部分和累加。用颜色追踪每个数据元素的流动轨迹。支持逐拍步进和自动播放
3. **SystolicDataflowCompare** (静态) — Output-stationary vs Weight-stationary 的示意图对比：哪个矩阵固定、哪个流动、部分和如何累加

### Section 3: NVIDIA Tensor Core

**内容**：
- 每周期执行 D(4×4) = A(4×4) · B(4×4) + C(4×4)（原始概念尺寸，实际较新架构用 16×8×16 等更大块）
- 精度支持演进：Volta (FP16) → Turing (+INT8, INT4) → Ampere (+TF32, BF16) → Hopper (+FP8)
- 每 SM 的 Tensor Core 数量（Hopper: 4th gen, 每 SM 4 个 Tensor Core）
- Warp 级操作：一个 Tensor Core 操作由一个 warp 的 32 个线程协作发起
- MMA (Matrix Multiply-Accumulate) PTX 指令：`mma.sync.aligned.m16n8k16.row.col.f32.f16.f16.f32`

**组件**：
4. **TensorCorePrecisionTimeline** (静态) — Volta → Turing → Ampere → Hopper → Blackwell 的精度支持演进时间线
5. **TensorCoreMmaFlow** (动画) — 一个 warp 发起 MMA 操作的数据流：32 个线程各持有 fragment 的一部分 → 发射到 Tensor Core → 输出 fragment 分布回 32 个线程

### Section 4: Intel XMX

**内容**：
- XMX (Xe Matrix eXtensions) — Intel Xe2 的矩阵引擎
- 内部也是 systolic array，但尺寸和数据流与 Tensor Core 不同
- 每 Xe-Core 的 XMX 单元数、支持精度（FP16、BF16、INT8、TF32）
- Lunar Lake / Panther Lake 的 XMX 规格
- 编程接口预览：SYCL `joint_matrix`（详细编程留到文章 3）

**组件**：
6. **XmxArchitectureDiagram** (静态) — XMX 内部结构图：systolic array 尺寸、输入/输出数据流、在 Xe-Core 中的位置

### Section 5: Tensor Core vs XMX 详细对比

**内容**：
- 矩阵块尺寸对比
- 精度支持对比
- 吞吐量对比（TOPS/TFLOPS）
- 编程接口对比（wmma/mma.sync vs joint_matrix/ESIMD）
- 相似点：都是 systolic array 变体，都做 D=A·B+C，都只能做特定尺寸/精度

**组件**：
7. **TensorCoreXmxCompare** (静态) — 结构对照图 + 详细参数对比表

### Section 6: Dual-Pipe — 同时利用两种计算单元

**内容**：
- Tensor Core 和 CUDA Core 可以同时工作 — 它们是 SM 内不同的功能单元，有独立的执行通道
- 传统做法：矩阵乘（Tensor Core）完成后，element-wise 操作（CUDA Core）才开始
- Dual-pipe 优化：让 Tensor Core 做当前层矩阵乘的同时，CUDA Core 做上一层的 activation/normalization
- DeepSeek V3/R1 的实践：FP8 训练中利用 dual-pipe 重叠 GEMM（Tensor Core）和 element-wise（CUDA Core），提高 SM 利用率
- 条件：两组操作之间没有数据依赖；需要精心安排执行顺序

**组件**：
8. **DualPipeOverlap** (动画) — 时间轴对比：上方传统串行（Tensor Core → CUDA Core → Tensor Core → ...），下方 dual-pipe 重叠执行。标注哪些操作重叠、总时间缩短比例

### 组件总计: 8 (3 静态 + 4 动画 + 1 对比表)

---

## 文章 3: CUDA 编程模型 — 从代码到硬件

**slug**: `cuda-programming-model`
**difficulty**: intermediate
**tags**: [gpu, cuda, programming, simt, simd, intel, sycl]
**prerequisites**: [gpu-architecture]

### Section 1: SIMD vs SIMT — 两种并行执行模型

**内容**：
- **SIMD** (Single Instruction Multiple Data)：编程时显式写向量宽度。Intel iGPU/CPU 的方式 — 一条指令操作一个 8-wide 或 16-wide 向量，程序员必须知道向量宽度并用 intrinsic 或让编译器向量化
- **SIMT** (Single Instruction Multiple Threads)：NVIDIA 的方式 — 程序员写标量代码（看起来像单线程），硬件自动把 32 个线程打包成 warp 一起执行。程序员不需要管向量宽度
- **关键区别**：SIMT 对分支更友好（divergence 只是效率损失，不是错误），SIMD 分支需要 mask 显式处理
- **Intel iGPU 的实际模型**：EU 内部是 SIMD 驱动，但 SYCL/OpenCL 在编程层面用 work-item 抽象接近 SIMT 体验。sub-group 暴露了底层 SIMD 宽度

**组件**：
1. **SimdVsSimtAnimation** (动画，核心组件) — 同一个 `a[i] = b[i] + c[i]` 操作：左边 SIMD 一条宽向量指令处理 8 个元素（显式向量），右边 SIMT 32 个线程各自处理一个元素（标量代码，硬件并行）。然后演示 if/else 分支下两种模型的行为差异
2. **ExecutionModelCompare** (静态) — SIMD / SIMT / Intel iGPU 三栏对比表：编程视角、硬件执行方式、分支处理、向量宽度可见性

### Section 2: Thread → Block → Grid

**内容**：
- CUDA 的三级线程层级：Thread（最小单元）→ Block（线程组，共享 shared memory）→ Grid（所有 block 的集合）
- threadIdx、blockIdx、blockDim 的含义和用法
- 一维/二维/三维的 block 和 grid（为什么需要多维 — 映射到矩阵等数据结构更自然）
- 代码示例：一个简单的向量加法 kernel，标注每个 index 如何计算全局位置

**组件**：
3. **ThreadBlockGridViz** (动画) — 3D 网格可视化：展示一个 2D grid of 2D blocks，点击某个 block 展开看内部 thread 排列。标注 threadIdx 和 blockIdx 的值
4. **IndexCalculation** (交互) — 输入 blockDim 和 gridDim，选中任意一个 thread，实时显示 `threadIdx.x + blockIdx.x * blockDim.x` 的计算过程和结果值

### Section 3: 逻辑到物理映射

**内容**：
- Block 被 runtime 分配到 SM（顺序不确定、不可控）
- 一个 SM 可以同时容纳多个 Block（受资源限制）
- Block 内的 thread 被硬件打包成 warp（thread 0-31 = warp 0, thread 32-63 = warp 1, ...）
- 这解释了为什么 block size 应该是 32 的倍数

**组件**：
5. **BlockToSmMapping** (动画) — 左侧逻辑 grid 中的 block 列表，右侧物理 SM 阵列。动画展示 block 被分配到 SM 的过程（有的 SM 分到多个 block），然后某个 SM 内部展示 thread → warp 的打包

### Section 4: Shared Memory

**内容**：
- `__shared__` 声明和生命周期（block 级别，block 结束时释放）
- 用途：block 内线程间通信、数据预加载（从 HBM 加载一次到 shared memory，多次复用）
- Bank 结构：32 个 bank，连续 4 字节映射到连续 bank
- Bank conflict：同一 warp 中多个线程访问同一 bank 的不同地址 → 串行化
- Conflict-free 访问模式：stride=1（顺序访问）天然无冲突

**组件**：
6. **SharedMemoryBanks** (动画) — 32 个 bank 的可视化。演示两种访问模式：(a) stride=1 无冲突 — 32 线程各访问一个 bank，一拍完成；(b) stride=2 有冲突 — 两个线程撞同一 bank，高亮冲突并显示串行化

### Section 5: Memory Coalescing

**内容**：
- 全局内存访问以 32/128 字节 transaction 为单位
- Coalesced：一个 warp 的 32 个线程访问连续地址 → 合并为 1-4 个 transaction
- Uncoalesced：线程访问不连续地址 → 需要更多 transaction，浪费带宽
- 典型场景：行优先访问矩阵 vs 列优先访问矩阵

**组件**：
7. **MemoryCoalescingDemo** (动画) — 32 个线程的地址可视化：(a) 连续访问 → 合并为 1 个 128B transaction（绿色高效）；(b) stride 访问 → 多个 transaction（红色低效）。显示实际传输数据量 vs 有用数据量

### Section 6: 同步与 Barrier

**内容**：
- `__syncthreads()` — block 内所有线程到达 barrier 后才继续
- 为什么需要：典型场景是先写 shared memory，sync，再读 shared memory
- 注意事项：所有线程必须执行到同一个 `__syncthreads()`（不能在分支中不对称调用）
- Warp 内隐式同步 vs `__syncwarp()`

**组件**：
8. **BarrierTimeline** (静态) — 流程图：多个 warp 的时间轴，写 shared memory → barrier 对齐 → 读 shared memory。标注没有 barrier 时的 race condition

### Section 7: Occupancy

**内容**：
- Occupancy = active warps / SM 最大 warp 数
- 受三个因素限制：每 block 的 register 使用量、shared memory 使用量、block size
- 高 occupancy 不总是更好（有时低 occupancy + 高数据复用更快），但通常是好的起点
- `--ptxas-options=-v` 查看 register 使用

**组件**：
9. **OccupancyCalculator** (交互) — 输入：block size、registers per thread、shared memory per block。输出：active blocks per SM、active warps、occupancy 百分比。用进度条可视化，标注瓶颈因素

### Section 8: Intel iGPU 编程要点

**内容**：
- SYCL / DPC++ 基本模型：kernel → `parallel_for` / `nd_range`
- 术语映射：work-item ≈ thread、work-group ≈ block、sub-group ≈ warp（但宽度可能是 8/16/32）
- Sub-group 是 Intel 编程的关键 — 暴露了 SIMD 宽度，sub-group shuffle/broadcast 对应 warp shuffle
- SLM (Shared Local Memory) ≈ CUDA shared memory，用法类似
- XMX 编程接口：SYCL `joint_matrix` / ESIMD，与 NVIDIA `wmma` / `mma.sync` 代码对比
- 代码对比：同一个向量加法的 CUDA 版 vs SYCL 版

**组件**：
10. **CudaSyclCodeCompare** (静态) — 左右对照代码：CUDA kernel vs SYCL kernel，用颜色标注对应概念（threadIdx ↔ get_local_id, blockIdx ↔ get_group_id, __shared__ ↔ local accessor 等）

### 组件总计: 10 (2 静态 + 6 动画 + 2 交互)

---

## 文章 4: GEMM 优化 — 从 Naive 到极致

**slug**: `gemm-optimization`
**difficulty**: advanced
**tags**: [gpu, gemm, cuda, optimization, tensor-core, xmx, intel]
**prerequisites**: [cuda-programming-model, matrix-acceleration]

### Section 1: 为什么 GEMM 是 LLM 的核心

**内容**：
- Transformer 中的 GEMM：QKV 投影、Attention score、FFN — 90%+ 的计算量是矩阵乘法
- 计算量公式：C(M×N) = A(M×K) · B(K×N) 需要 2MNK FLOPs
- Arithmetic Intensity（计算密度）分析：GEMM 是 compute-bound（引用 prefill-vs-decode 文章的 Roofline Model）
- 目标：理解 cuBLAS 级别性能是怎么达到的

**组件**：
1. **GemmInTransformer** (静态) — Transformer block 示意图，高亮所有 GEMM 操作（QKV projection、attention、FFN），标注每个的 M/N/K 维度
2. **ArithmeticIntensityCalc** (交互) — 输入 M、N、K，计算 FLOPs、内存访问量、arithmetic intensity，在 Roofline 图上标注位置

### Section 2: Naive 实现 — 基线

**内容**：
- 最简单的实现：一个线程算一个输出元素 C[i][j]，内循环沿 K 维做乘加
- CUDA 代码（真实可读）
- 性能分析：每个输出元素需要读 A 的一行 + B 的一列 = 2K 次全局内存访问。总访问 = 2MNK 次，严重 memory-bound
- 和理论峰值的差距（通常 < 1% 利用率）

**组件**：
3. **NaiveGemmAnimation** (动画) — 小规模矩阵（如 4×4），逐元素演示计算过程。高亮当前线程正在读 A 的哪一行、B 的哪一列。旁边显示全局内存访问计数器

### Section 3: 优化 1 — Tiling + Shared Memory

**内容**：
- 核心思想：把大矩阵切成 BLOCK_SIZE × BLOCK_SIZE 的 tile，每次从 HBM 加载一对 tile 到 shared memory，在 shared memory 中计算
- 内存访问从 O(MNK) 降到 O(MNK / BLOCK_SIZE)
- 具体代码：双层循环（外层遍历 tile、内层在 tile 内计算）+ `__syncthreads()`
- 为什么 shared memory 有效：同一 tile 被 block 内所有线程复用

**组件**：
4. **TilingAnimation** (动画，核心组件) — 分步动画：
  - Step 1: 大矩阵 A 和 B 被切成 tile 网格
  - Step 2: 选中一对 tile，高亮从 HBM 加载到 shared memory
  - Step 3: 在 shared memory 中，每个线程做部分乘加
  - Step 4: 加载下一对 tile，累加到之前的结果上
  - Step 5: 所有 tile 处理完，写回 HBM
  - 旁边对比：内存访问量 before/after tiling

### Section 4: 优化 2 — Thread Tiling（每线程多元素）

**内容**：
- Naive tiling 每个线程算 1 个输出元素 → 计算/访存比 = 1 次乘加 / 2 次 shared memory 读
- Thread tiling：每个线程算 TM×TN 的小块（如 4×4 = 16 个元素）→ 数据加载到寄存器后被复用 TM+TN 次
- 寄存器是最快的存储 — 把 tile 从 shared memory 进一步加载到寄存器
- 计算/访存比从 1 提升到 TM×TN/(TM+TN)

**组件**：
5. **ThreadTileAnimation** (动画) — 从 1×1 thread tile 到 4×4 thread tile 的对比：显示每个线程负责的输出区域变大，寄存器中缓存的 A 行片段和 B 列片段被多次复用
6. **ComputeToLoadRatio** (交互) — 输入 TM、TN，实时计算和显示计算/访存比，带公式推导

### Section 5: 优化 3 — 向量化访存

**内容**：
- GPU 内存总线支持 32/64/128 bit 一次性加载（`float4` = 128 bit = 4 个 float）
- 单次加载 4 个 float 比 4 次加载 1 个 float 效率高（更少指令、更好带宽利用）
- 要求数据地址 128-bit 对齐
- 代码示例：`float4 tmp = *reinterpret_cast<float4*>(&A[row][k])`

**组件**：
7. **VectorLoadCompare** (静态) — 左：4 次标量 load；右：1 次 float4 load。带宽利用率对比条

### Section 6: 优化 4 — 双缓冲 Prefetch

**内容**：
- 当前 tile 计算时，同时预加载下一个 tile 到另一块 shared memory（或寄存器）
- 隐藏内存延迟：计算和加载重叠
- 需要 2 倍 shared memory（或用寄存器做中转）

**组件**：
8. **DoubleBufPipeline** (动画) — 流水线时序图：两条轨道（buffer A / buffer B），展示 load tile N+1 和 compute tile N 的重叠。对比无双缓冲的串行时序

### Section 7: 优化 5 — Tensor Core GEMM

**内容**：
- 从 CUDA Core 切到 Tensor Core：`wmma` API（`wmma::load_matrix_sync`、`wmma::mma_sync`、`wmma::store_matrix_sync`）
- Fragment 概念：16×16 矩阵片段分布在一个 warp 的 32 个线程中
- 仍然需要 tiling — 最内层计算单元从标量乘加变成矩阵块乘加
- 精度选择：FP16 输入 + FP32 累加
- 性能跳跃（纯 CUDA core 的 4-8 倍）
- 引用文章 2 的 systolic array 动画

**组件**：
9. **WmmaTilingDiagram** (静态) — Tensor Core GEMM 的 tiling 层次：Grid tile → Block tile → Warp tile (16×16×16) → Tensor Core 操作。每层标注尺寸
10. **TensorCoreGemmFlow** (动画) — 一个 warp 执行 WMMA 的流程：load fragment → mma_sync → 累加 → store fragment。配合代码片段

### Section 8: 性能阶梯总结

**内容**：
- 每步优化的 GFLOPS（以 H100 上 4096×4096 SGEMM 为例）
- 对比 cuBLAS 理论峰值
- 总结优化核心思想：减少内存访问 → 提高数据复用 → 利用专用硬件

**组件**：
11. **PerformanceLadder** (交互) — 柱状图，每根柱子对应一个优化阶段。hover 显示该阶段的关键变化和 GFLOPS。顶部标注 cuBLAS 性能作为参照线

### Section 9: Intel iGPU 上的 GEMM

**内容**：
- Intel 的 tiling 策略：SLM tiling 类似 CUDA 的 shared memory tiling
- XMX 指令替代 Tensor Core 做矩阵块乘
- Sub-group 协作：`joint_matrix` API (SYCL) / cooperative matrix (SPIR-V)
- nGen 怎么为 GEMM 生成 XMX 序列（引用 AI Compute Stack 文章）
- 和 CUDA GEMM 的关键差异：SIMD 宽度显式、sub-group 替代 warp

**组件**：
12. **IntelGemmCompare** (静态) — CUDA GEMM vs Intel GEMM 的 tiling 层级对照图

### 组件总计: 12 (3 静态 + 6 动画 + 3 交互)

---

## 学习路径更新

`src/content/paths/ai-compute-stack.yaml` 的 articles 列表更新为：

```yaml
articles:
  - ai-compute-stack
  - gpu-architecture
  - matrix-acceleration
  - cuda-programming-model
  - gemm-optimization
```

## Phase 1 总览

| 文章 | 组件数 | 难度 |
|------|--------|------|
| 1. GPU Architecture 基础 | 8 | intermediate |
| 2. 矩阵加速单元 | 8 | intermediate |
| 3. CUDA 编程模型 | 10 | intermediate |
| 4. GEMM 优化实战 | 12 | advanced |
| **合计** | **38** | |

## Phase 2 预告（后续 spec）

| # | 标题 | 内容概要 |
|---|------|---------|
| 5 | 非 CUDA 路线 | llama.cpp Vulkan backend 实现算子；OpenCL C / GLSL compute shader vs CUDA C |
| 6 | 矩阵加速指令进阶 | Cooperative Matrix (Vulkan/SPIR-V)、WMMA vs mma.sync vs CUTLASS、跨厂商编程 |
