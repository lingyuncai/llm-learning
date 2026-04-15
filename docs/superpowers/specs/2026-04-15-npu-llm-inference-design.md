# NPU LLM 推理专题设计文档

> 日期: 2026-04-15
> 状态: Draft
> 路径: intel-igpu-inference (扩展)

## 概述

在现有 `intel-igpu-inference` 学习路径（8 篇）末尾新增 2 篇文章，并扩充修正现有的 `npu-gpu-co-inference`，形成 3 篇 NPU 相关文章的递进结构。聚焦 Intel 40xx（Lunar Lake）及之后的 NPU 架构。

核心问题：LLM 的 KV cache 天然是动态的，NPU 只能执行静态 shape 的计算图——这个矛盾怎么解决？从软件栈管理到硬件执行到编程模型的边界，给读者完整的认知链条。

## 信息来源与正确性原则

- 主要参考：微信文章"Intel NPU 为什么可以跑大语言模型？"（覆盖 37xx/40xx 的 KV cache 管理、软件栈、硬件执行、编程模型反思）
- 架构验证：通过 `npu_compiler` 源码（openvinotoolkit/npu_compiler）确认 40xx 仍使用 DPU + SHAVE 执行单元
- 正确性原则：
  - 所有硬件细节必须标注信息来源（源码文件/官方文档/固件头文件）
  - 对 40xx 不确定的参数（如 CMX 精确容量）标注"待确认"而非断言
  - 描述基于 40xx，37xx 差异（管理核 Leon→RISC-V）简要提及

## 学习路径结构

`intel-igpu-inference` 修改后（10 篇）：

```
1.  xe2-gpu-architecture
2.  xe2-execution-model
3.  spirv-level-zero
4.  onednn-primitives
5.  onednn-gpu-optimization
6.  openvino-graph-pipeline
7.  igpu-performance-analysis
8.  npu-gpu-co-inference          ← 扩充修正
9.  npu-llm-kvcache               ← 新增
10. npu-execution-programming     ← 新增
```

前置依赖链：
- `npu-llm-kvcache` 依赖 `npu-gpu-co-inference`
- `npu-execution-programming` 依赖 `npu-llm-kvcache`
- `npu-execution-programming` 跨路径关联 `cuda-programming-model`、`graph-compilation-optimization` 路径（非硬前置）

## 三篇文章定位

| 文章 | 标题 | 核心问题 | 难度 |
|------|------|----------|------|
| `npu-gpu-co-inference` | NPU 架构与 GPU+NPU 协同推理 | NPU 硬件长什么样？和 iGPU 怎么配合？ | advanced |
| `npu-llm-kvcache` | NPU 上的 LLM 推理：KV Cache 与软件栈 | LLM 的动态 KV cache 怎么在静态 NPU 上跑？ | advanced |
| `npu-execution-programming` | NPU 执行模型与编程模型的边界 | NPU 硬件怎么执行？编程模型的天花板在哪？ | advanced |

---

## 文章 0：`npu-gpu-co-inference` 扩充修正

> slug 保持不变，避免 breaking links。标题保持"NPU 架构与 GPU+NPU 协同推理"。

### 保留的现有内容

- NPU vs iGPU 雷达图对比（NpuVsIgpu 组件）
- OpenVINO 设备插件体系（DevicePluginSelector 组件）
- 异构子图切分（HeteroSubgraphSplit 组件）
- 功耗性能权衡（PowerPerfTradeoff 组件）

### 需要修正的内容

**错误描述（当前第 51 行）：**
> "早期 Intel Movidius 架构使用了 SHAVE DSP 核心，但在 Core Ultra 的现代 NPU 中已被 NCE 阵列取代"

**修正为：** NCE（Neural Compute Engine）不是 SHAVE 的替代品，而是包含 DPU 和 SHAVE 的父级计算集群。这一架构从 37xx（Meteor Lake）延续到 40xx（Lunar Lake）和 50xx（Panther Lake）。

验证来源：`npu_compiler` 源码中 `Config_ExecutorKind` 枚举定义了 DMA_NN、NCE、DPU、SHAVE_NN、SHAVE_ACT 五种执行器类型；`NPU40XX/shave_kernel_info.cpp` 和 `NPUReg40XX/ops/act_shave_rt.cpp` 明确存在。

### 需要扩充的内容

**1. NCE 集群的正确架构层次**

```
NPU Tile (NCE Cluster)
├── DPU — 固定功能硬件（卷积、矩阵乘法）
│   ├── IDU (Input Data Unit) — 输入数据读取
│   ├── MPE (Matrix Processing Element) — 矩阵计算核心
│   ├── PPE (Post-Processing Engine) — 后处理（缩放、加偏置）
│   └── ODU (Output Data Unit) — 输出数据写入
├── SHAVE_NN — 可编程向量处理器（神经网络算子：softmax、RoPE、attention kernel）
├── SHAVE_ACT — 可编程向量处理器（激活函数：ReLU、GELU、SiLU）
└── DMA — 数据搬运引擎（DDR ↔ CMX）
```

DPU 是专才（固定操作、极快），SHAVE 是通才（可编程、灵活）。编译器逐层判断每个 op 的执行目标：优先 DPU → DMA → SHAVE。

**2. DPU 内部四单元简述**

- IDU：从 CMX 读取输入 tensor，按 DPU 要求的格式（如 NHWC blocked layout）对齐
- MPE：执行实际的 MAC（Multiply-Accumulate）计算，支持 INT8/FP16
- PPE：矩阵乘法后紧接做缩放（乘常数）和加偏置，不需要额外任务
- ODU：将计算结果写回 CMX，支持输出格式转换

**3. CMX/DDR 两层内存架构（概念引入）**

- DDR（系统内存）：容量大（GB 级），访问慢。模型权重、KV cache、输入/输出 tensor 存放位置
- CMX（Connection Matrix）：NPU 片上高速 SRAM，每个 NPU tile 有自己的 CMX，容量小（KB~MB 级），访问极快。DPU 和 SHAVE 计算时数据必须在 CMX 中
- DMA 引擎负责 DDR ↔ CMX 搬运，搬运计划在编译时确定

**4. 40xx 管理核（简要提及）**

- 40xx（Lunar Lake）使用 RISC-V 管理核（37xx 使用 Leon/SPARC）
- 管理核负责：接收 host 命令、读取任务列表、调度 DMA/DPU/SHAVE、管理 barrier 同步
- 来源：`vpu_jsm_job_cmd_api.h` 中提到 "RISC-V facilitates cache-bypass, memory access"

**5. NPU 硬件全景图**

```
x86 CPU (host)
  │
  │  DRM ioctl / Level Zero API
  │
NPU 芯片 (40xx Lunar Lake)
  ├── RISC-V 管理核 — 接收 host 命令，读取任务列表，调度执行
  ├── DMA 引擎      — DDR ↔ CMX 数据搬运
  ├── NCE Cluster(s)
  │   ├── DPU       — 矩阵乘法、卷积（固定功能）
  │   └── SHAVE     — softmax、RoPE、激活函数（可编程）
  └── CMX           — 片上高速 SRAM
```

### 不扩充的内容

- 不加入 LLM 相关内容（文章 1 的范围）
- 不深入 DMA 调度细节（文章 2 的范围）
- 不展开 SHAVE 的 VLIW 指令集细节（公开资料有限，且对目标读者价值不高）

---

## 文章 1：`npu-llm-kvcache`

> 标题: NPU 上的 LLM 推理：KV Cache 与软件栈
> 难度: advanced
> 前置: npu-gpu-co-inference
> 核心叙事: "LLM 的 KV cache 天然是动态的，NPU 只能执行静态 shape——怎么办？"

### §1 KV Cache 回顾与 NPU 上的矛盾

- KV cache 的作用简要回顾（跨引用 `prefill-vs-decode` 文章，不重复推导 Q/K/V 和 attention 公式）
- 重点放在 NPU 特有的矛盾：
  - NPU 的 blob 执行模型：编译时确定所有 tensor 的精确 shape、内存地址、DMA 搬运计划
  - blob 格式是标准 ELF，包含权重、DPU 任务描述、DMA 指令、SHAVE kernel 机器码、barrier 配置
  - 运行时不可改变 tensor shape，唯一例外是输入/输出 tensor 的地址（通过 ELF 重定位）
  - 所以 `[batch, heads, seq_len, head_dim]` 中的 seq_len 必须是编译时常量
- 与 GPU 的对比：GPU 可运行时动态分配内存（vLLM PagedAttention 按需分页），NPU 不行
- 核心矛盾一句话：KV cache 天然是动态的，但 NPU 只能执行静态 shape 的计算图

### §2 解决方案：预分配 + Attention Mask

- 思路：预分配固定大小缓冲区，"动态增长"变成"在固定空间内移动写入位置"
- NPUW 的两个参数：MAX_PROMPT_LEN（默认 1024）、MIN_RESPONSE_LEN（默认 128），总容量 1152
- Attention mask：与序列长度等长的 0/1 向量，标记有效数据位置
- Softmax 中 mask=0 的位置设为负无穷，经 softmax 后权重为零 → 完全忽略 padding
- 具体示例（"什么是NPU"，4 token prompt，容量 1152）：
  - 生成第 1 个 token：KV cache [K1 K2 K3 K4 0 0 ... 0]，mask [1 1 1 1 0 0 ... 0]
  - 生成第 100 个 token：KV cache [K1...K103 0 ... 0]，mask [1...1 0 ... 0]
- 关键洞察：物理大小从未改变（始终 1152），变化的只是有效边界和 mask 中 1 的个数。NPU 每次执行的 blob 完全相同，只有输入数据不同

**交互组件 1：KVCacheGrowthAnimation**

- 类型：流程动画
- 功能：可视化固定大小的 KV cache 缓冲区，随着 token 生成：
  - 写入位置指针逐步前移
  - 有效区域（彩色）逐步扩大，padding 区域（灰色）逐步缩小
  - 底部同步显示 attention mask 的 1/0 变化
  - 可调参数：缓冲区总容量、prompt 长度
- 交互：步进按钮（逐 token 前进）、自动播放、重置
- 目的：帮助读者直觉理解"大小不变但有效边界在移动"

### §3 三层软件栈的分工

- openvino.genai（最上层）：面向用户的应用框架
  - StatefulLLMPipeline：分词、采样策略（贪心/top-k/top-p）、聊天历史管理
  - 决定何时做 prefill、何时做 decode、何时截断过长历史
- openvino / NPUW（中间层）：NPU Wrapper，核心调度器
  - 把动态 shape LLM 模型拆成 prefill 和 generate 两个静态 shape 子模型
  - 分别编译成 NPU blob
  - 管理 KV cache 缓冲区：分配、清零、prefill→generate 搬运
  - 处理 chunked prefill
  - 通过 Level Zero API 向 NPU 提交推理任务
- npu_compiler（最底层）：编译器
  - 把 OpenVINO IR 编译成 NPU blob
  - 不知道什么是 KV cache——只看到标记为"有状态"的 tensor
  - 把它们转换成 blob 的普通输入/输出
- 一句话总结：genai 决定何时推理，NPUW 决定怎么推理，compiler 决定硬件执行什么

### §4 NPUW 的核心设计：两个模型，一份 KV Cache

- 为什么两个模型？input_ids 的 seq_len 不同——prefill 可能几百上千，decode 固定为 1。NPU blob 的 shape 是固定的，不能一个 blob 兼容两种 seq_len
- Prefill 模型：input_ids seq_len = 1024，KV cache 输出 [batch, heads, 1024, head_dim]
- Generate 模型：input_ids seq_len = 1，KV cache 输入和输出 [batch, heads, 1152, head_dim]
- 推理流程：
  1. 用户输入 prompt
  2. 调用 prefill blob → 输出第一个 token + KV cache
  3. copy_kvcache()：64 个 tensor 并行拷贝（32 层 × K + V），切片对齐（prefill present[0:N] → generate past[0:N]）
  4. 循环调用 generate blob：每次 1 个 token → 下一个 token + 更新 KV cache
  5. 遇到 EOS 或达到最大长度
- KV cache 更新：update_kvcache_for() 只复制新增一行，num_stored_tokens 计数器递增

**交互组件 2：PrefillGenerateSwitch**

- 类型：流程动画
- 功能：可视化两个 blob 之间的 KV cache 数据流：
  - 左侧：Prefill blob 的输出（present tensors，shape 1024）
  - 右侧：Generate blob 的输入（past tensors，shape 1152）
  - 动画展示 copy_kvcache 的切片拷贝过程：从 present[0:N] 对应写入 past[0:N]
  - 展示 generate 循环中 update_kvcache_for 只更新一行的过程
- 交互：可切换展示 prefill→generate 切换阶段 和 generate 循环阶段
- 目的：帮助读者理解两个 shape 不同的 blob 之间如何共享一份 KV cache 数据

### §5 应对现实：Generate 变体与 Chunked Prefill

**Generate 变体：**
- 问题：KV cache 容量 1152，但 prompt 只有 20 个 token → 每次 decode 遍历完整 1152 长度，浪费
- 方案：编译多个 generate 变体（如 256/512/1024/1152），运行时 select_generate_request() 选最小够用的
  - prompt 20 + 预留 128 = 148 → 选 256
  - prompt 400 + 预留 128 = 528 → 选 1024
- 内存优化：所有变体共享同一块内存缓冲区，最大变体分配整块，小变体是前缀切片
- 代价：编译时间（每个变体单独编译 blob），EXPORT_BLOB 缓存到磁盘缓解

**交互组件 3：GenerateVariantSelector**

- 类型：参数化模拟
- 功能：
  - 输入：prompt 长度（滑块，0-2048）
  - 显示：选中的变体、KV cache 总容量、有效利用率、padding 浪费比例
  - 可视化内存布局：一块连续内存中各变体作为前缀切片的关系
- 目的：让读者感受"多变体策略"的实际效果和资源利用率

**Chunked Prefill：**
- 问题：prompt 超过 MAX_PROMPT_LEN（1024）时，prefill blob 塞不下
- 方案：分块处理
  - 2048 个 token → 第一轮 prefill token[0:1024]，KV 写入 past → 第二轮 prefill token[1024:2048]，读 past + 写 present → 全部完成后 copy_kvcache 到 generate
  - 每轮结束后 present 追加到 past，积累 KV 状态

### §6 编译器：有状态变成无状态

- OpenVINO IR 中的有状态机制：ReadValue / Assign 操作对
  - ReadValue("kv_k_layer0")：从"变量"读取上次推理保存的 K cache
  - Assign("kv_k_layer0", new_value)：把新 K cache 写回"变量"
- 编译器 pass ConvertAssignReadValueToReturnsAndInputs：
  - ReadValue → 函数输入参数
  - Assign → 函数输出值
  - 转换后 blob 是纯函数：KV cache 从输入进来，更新后从输出出去
- "记住状态"交给 NPUW 的 ZeroVariableState：
  - 持有 Level Zero 内存（NPU 可访问的设备内存）
  - set_state() / get_state() / reset()（新对话时 memset(0) 清零）
- 与编译原理的关联：本质上是 SSA（静态单赋值）思想——消除可变状态，让数据流显式化。有状态模型中"隐式的跨调用持久化"变成了"显式的函数输入/输出参数"，编译器和运行时各管各的

### §7 从 Host 到 NPU：一次推理调用

**Blob 加载（一次性）：**
- 驱动中的 ELF Parser 解析 blob，创建 HostParsedInference (HPI) 对象
- 为不同类型数据分配不同属性的 NPU 内存：
  - 可执行代码（SHAVE kernel）→ WriteCombineFw 内存
  - SHAVE 数据段 → WriteCombineShave 内存
  - DMA 描述符 → WriteCombineDma 内存
- 执行静态重定位：修补 blob 内部的交叉引用（相对偏移 → 实际 NPU 设备地址）
- 提取元数据：输入/输出 tensor 的名称、shape、数据类型
- EXPORT_BLOB 缓存：编译结果存磁盘，下次启动跳过编译

**每次推理路径：**
1. NPUW 准备输入 tensor（input_ids、attention_mask、position_ids、past KV cache）
2. JIT 重定位（applyInputOutput）：遍历标记为 VPU_SHF_USERINPUT 的重定位项，把 KV cache 缓冲区的 NPU 虚拟地址写入 blob 中 DMA 任务描述符的对应位置
3. 提交 command list 到 NPU 命令队列（底层 DRM_IVPU_CMDQ_SUBMIT ioctl）
4. 管理核读取任务列表，调度 DMA/DPU/SHAVE → 所有任务完成 → 写 fence value
5. Host 检测完成：中断等待（DRM_IVPU_BO_WAIT，省电）或轮询等待（UMONITOR/UMWAIT，低延迟）
6. NPUW 读取输出（logits + present KV cache），update_kvcache_for() 追加到 past

**Mutable Command Lists 优化：**
- Level Zero 扩展特性（驱动版本 >= 1.0）
- 首次推理创建 command list，后续只 updateMutableCommands() 更新 tensor 指针
- 类比：在已录好的"脚本"上只改几个参数，不重新录

### §8 端到端流程走读

用具体例子（"Hello" → 1 个 token [15496]，KV cache 容量 1152，generate 变体 256/1152）串联所有概念：

1. **初始化**：NPUW 克隆模型为 prefill（seq_len=1024）和 generate（seq_len=1），npu_compiler 编译 blob × 3（1 prefill + 2 generate 变体），ELF 解析 + 静态重定位
2. **新对话**：memset(0) 清零 KV cache，select_generate_request(1) → 需要 1+128=129 → 选 256 变体
3. **Prefill**：input_ids=[15496, 0, ..., 0]，mask=[1, 0, ..., 0]，NPU 执行 32 层（DMA 搬权重 → DPU 投影 → SHAVE RoPE → SHAVE SDPA → DPU FFN），输出第一个 token + KV cache
4. **切换**：copy_kvcache() 把 prefill present[0:1] → generate(256) past[0:1]
5. **Generate 循环**：input_ids=[0,...,0,token]（右对齐），position_ids=[0,...,0,N]，mask 中 1 的个数递增，每次 update_kvcache_for() 只写一行
6. **结束**：EOS 或达到 256 容量上限 → detokenize → 返回文本

### §9 总结与前瞻

- 核心思路回顾：把"动态增长"变成"固定空间内移动写入位置"
- 当前限制：固定容量（超出则截断重新 prefill）、batch=1、KV cache 搬运开销（512MB 级别）
- 引出文章 2：这些 blob 在 NPU 硬件上到底怎么执行？编译器做了哪些调度决策？编程模型的天花板在哪？

---

## 文章 2：`npu-execution-programming`

> 标题: NPU 执行模型与编程模型的边界
> 难度: advanced
> 前置: npu-llm-kvcache
> 跨路径关联: cuda-programming-model, graph-compilation-optimization（非硬前置）
> 核心叙事: "NPU 硬件怎么高效执行 32 层 Transformer？编程模型的天花板在哪里？"

### §1 32 层 Transformer 的执行：一个 blob，没有循环

- CMX 容量有限（KB~MB 级），放不下一层的权重 → 逐层从 DDR 搬入 CMX → 计算 → 写回
- 与 GPU 的关键对比：GPU 把所有权重一次性加载到显存直接访问；NPU 没有大容量本地存储，必须流式处理
- 编译器把 32 层 unroll 成一个扁平任务列表（几千条 DMA + DPU + SHAVE 任务），层与层之间无明确分界
- 没有 host 端 for 循环：任务描述符和权重都在 DDR 中，host 只提交一个指针（MappedInference 结构体）
- 管理核（40xx RISC-V）逐条读取任务、检查 barrier 的 producer/consumer 计数、派发到对应执行单元
- 与 GPU kernel launch 模型的对比：GPU 每个 kernel 是一次 host→device 调度；NPU 是一次提交后完全自治

### §2 DMA/计算流水重叠

- 核心性能优化：DMA 搬第 N+1 层权重时，DPU 正在计算第 N 层
- 三条流水线并行：DMA（数据搬运）、DPU（矩阵计算）、SHAVE（激活/归一化）
- 通过 barrier 同步：管理核检查 barrier 的 producer/consumer 计数，前置任务完成后才派发后续任务

**交互组件 4：PipelineTimeline**

- 类型：流程动画
- 功能：
  - 三行时间线：DMA / DPU / SHAVE，展示多层 Transformer 的流水并行执行
  - barrier 同步点用竖线标注，显示依赖关系
  - 动画展示 prefetch 如何隐藏搬运延迟（DMA 提前开始搬运后续层数据）
  - 可切换显示：无重叠（串行执行）vs 有重叠（流水并行），对比性能差异
- 交互：播放/暂停、步进、切换重叠模式
- 目的：让读者直观看到"三条流水线通过 barrier 协作"的过程

**FeasibleMemoryScheduler 编译时规划（四个核心决策）：**
1. CMX 容量管理：线性扫描算法追踪 CMX 使用量，确保同一时刻不超容
2. Prefetch 提前量（prefetchingLevelLimit）：控制 DMA 提前几步开始搬运
3. 动态溢出（Spilling）：CMX 满时，不急用的数据暂时写回 DDR 腾出空间
4. Ping-Pong 缓冲：两块 CMX buffer 交替使用——一块供计算读，另一块让 DMA 写新数据

**与 GPU 的对比（关联 `cuda-programming-model`）：**
- 概念相同：都是隐藏内存延迟（GPU 用 stream + async memcpy，NPU 用 DMA prefetch）
- 机制相反：GPU 是运行时动态调度（warp scheduler），NPU 是编译时全规划好（运行时零决策）
- 类比：GPU 像即兴乐队（指挥在现场协调），NPU 像播放一张已经录好的唱片（编曲时就定好了每个乐器的进出时机）

### §3 Attention 在 NPU 上的三条路径

**路径 1：分解路径（Decompose SDPA）**
- 适用：目标硬件不支持专用 attention 算子时的 fallback
- 分解为独立操作序列：
  1. Q × K^T → DPU (NCE MatMul)
  2. × scale → DPU (PPE, 融合在 MatMul 后)
  3. + attention_mask → DPU (NCE Eltwise) 或 SHAVE（PPE 只能加逐 channel 常数，不能加 2D mask）
  4. Softmax → SHAVE（没有对应 DPU 硬件）
  5. × V → DPU (NCE MatMul)
- 中间结果需要在 CMX/DDR 间搬运（除非 Vertical Fusion 生效）

**路径 2：Flash SDPA 路径**
- 适用：prefill 阶段，长序列
- 整个 attention 作为一个 SHAVE kernel，mask 处理融合在内部
- KV cache 沿 seq_len 切 tile，每个 tile 独立计算局部 attention
- 维护三个滚动状态：running_output、running_max（数值稳定）、running_sum（归一化分母）
- UnrollFlashSDPA pass 把一个 FlashSDPA op 展开为 tile 链
- 与 Flash Attention 论文的关系：相同的在线 softmax 算法，但 NPU 实现的 tiling 约束不同（受 CMX 容量而非 GPU shared memory 限制）

**路径 3：Incremental SDPA 路径**
- 适用：decode 阶段，query 只有 1 个 token
- Q × K^T 从矩阵乘法退化为向量-矩阵乘法
- 专门优化的 SHAVE kernel，mask 在内部处理
- 演进轨迹：先有通用 sdpa → decode 专用 incremental_sdpa → prefill 专用 flash_sdpa

**交互组件 5：AttentionPathDecisionTree**

- 类型：对比/决策树
- 功能：
  - 根节点：推理阶段（prefill / decode）
  - 分支条件：序列长度、硬件能力（是否支持专用 kernel）
  - 叶节点：三条路径，各自展示操作分解和执行单元分配
  - 点击叶节点展开详细的数据流（哪些步骤走 DPU，哪些走 SHAVE）
- 关联：graph-compilation-optimization 路径中的融合决策树采用类似的 pattern matching + cost model 思路
- 目的：让读者理解编译器如何为不同场景选择最优 attention 实现

### §4 Tiling 与 Vertical Fusion

**DPU Tiling：**
- 大操作沿 H（高度）或 C（通道）维度切成 CMX 放得下的 tile
- 每个 tile 是一个 DPUVariant（同一 DPUInvariant 下的不同工作负载）
- DpuTiler 根据 CMX 容量和对齐要求自动决定切分方式

**SHAVE Tiling：**
- TileActShaveKernelTask 负责切分
- 优先选不产生 strided memory access 的维度（strided access 需额外 DMA 重排，代价高）

**Vertical Fusion（关联 `graph-compilation-optimization`）：**
- PipeliningVFScheduling pass 把连续操作（如 MatMul → RoPE → SDPA）融合为一个"垂直融合区域"
- 融合后中间结果留 CMX，不写回 DDR 再读回
- 对 attention 块特别有用：QKV 投影输出直接在 CMX 中被 RoPE 和 SDPA 消费
- **与 GPU 算子融合的关键区别：**
  - GPU 上融合主要省 kernel launch 开销（微秒级）
  - NPU 上融合省的是 DDR 往返搬运（可能节省 MB 级数据搬运）
  - 约束也不同：GPU 看 shared memory + register 压力，NPU 看 CMX 容量
- 关联：这就是 graph-compilation-optimization 路径中"算子融合"在 NPU 上的具体形态

### §5 RoPE 与 Position IDs（简述）

- Attention 不感知 token 顺序，position_ids 编码位置信息
- RoPE 是专门的 SHAVE kernel，编译器 fuse_rope pass 识别 Sin/Cos/Multiply 模式并融合
- 静态 shape 下的处理：position_ids 右对齐填充，值 = attention_mask 中 1 的个数
- 跨引用 `positional-encoding` 文章（RoPE 数学细节）

### §6 实际优化与当前限制

**与静态执行模型直接相关的优化：**
- DynamicDataMask：padding 区域的垃圾数据会污染 LayerNorm/reduction 的计算（它们不感知 mask），编译器在这些操作前插入清零
- LM Head 分离：vocab 维度大矩阵乘（hidden_size × vocab_size），NPU 不如 CPU 快时切出来跑 CPU

**简述其他优化：**
- Prefix Caching：多轮对话共享 system prompt 的 KV cache，跳过重复 prefill
- Speculative Decoding 支持：被拒 token 的 KV cache 截断（trim_kvcache_for_speculative_decoding）

**当前限制汇总（全部源于静态执行模型）：**
- 固定 KV cache 容量：超出则截断历史重新 prefill，GPU 上 PagedAttention 无此限制
- batch_size = 1：不支持 continuous batching，无法同时处理多个请求
- KV cache 搬运开销：prefill→generate 的 copy_kvcache 可达 512MB（32 层 × 2 × 32 heads × 1024 seq × 128 dim × 2 bytes FP16）
- 多次编译：多个 generate 变体 = 更长冷启动，需 blob 缓存缓解

### §7 编程模型的反思：ONNX 的边界与 cuTile 的启示

**"编译器包揽一切"的四条裂缝：**
1. 每种 attention 变体需要手写新 SHAVE kernel（sdpa → incremental_sdpa → flash_sdpa）。新变体（Sliding Window、Cross Attention、Linear Attention）需等编译器团队实现，周期以月计
2. 静态 shape 的每个副作用需要专门补丁（DynamicDataMask）。换 KV cache 管理策略可能需要新补丁
3. Generate 变体是蛮力枚举运行时动态性。参数空间更大（batch size、beam width）时排列组合爆炸
4. KV cache 搬运是架构约束的代价，不是算法需要。如果算子作者能控制内存布局，拷贝可能可避免

**ONNX 能表达什么、不能表达什么：**
- 能表达：计算图（做什么操作、操作间的依赖）
- 不能表达：
  - Tiling 策略：Flash Attention 的核心不是 Q×K×V，而是怎么切 tile、tile 间传递 running_max/sum
  - 内存布局偏好：KV cache 的 [batch, heads, seq_len, dim] vs [batch, seq_len, heads, dim] 对 DMA 效率影响巨大
  - 哪些中间结果留片上：Vertical Fusion 是巨大优化，但 ONNX 不描述融合决策

**交互组件 6：NpuVsGpuExecution**

- 类型：对比探索
- 功能：
  - 左右分栏对比 NPU 和 GPU 的执行模型
  - NPU 侧：编译时全确定 → blob（ELF）→ 管理核按序执行 → 运行时零决策
  - GPU 侧：运行时动态调度 → kernel launch → warp scheduler → 动态资源分配
  - 底部概念映射表：CMX↔Shared Memory、DMA prefetch↔async memcpy、barrier↔stream event、blob↔kernel binary
  - 可切换维度：调度模型 / 内存层次 / 编程接口
- 关联：关联 cuda-programming-model 和 spirv-level-zero 文章的概念
- 目的：让读者形成跨硬件的系统性理解

**cuTile 的启示（第三条路）：**
- 当前三个层次：ONNX（不表达 tiling）→ ? → raw SHAVE ASM（表达一切）
- cuTile 在 GPU 上开辟中间层：算子作者控制 tile 大小和循环结构，编译器负责 DMA 和硬件映射
- 假设 NPU 有 cuTile 式 DSL：
  - Flash SDPA 不需要编译器团队手写 SHAVE kernel，算子作者直接写 tiled attention
  - Tiling 策略可根据模型特点调整（长上下文 → 大 KV tile，小模型 → 不需要 tiling）
  - 新算法验证周期从月缩短到天

**ONNX vs cuTile 式 DSL 对比表：**

| 维度 | ONNX | cuTile 式 DSL |
|------|------|---------------|
| 表达内容 | 计算图（做什么） | Tiled 算法（怎么切、怎么传状态） |
| Tiling | 不表达，引擎自动 | 算子作者指定 tile shape |
| DMA/内存搬运 | 不表达，引擎自动 | 不表达，编译器自动 |
| 新算子 | 等引擎支持（月级） | 算子作者直接写（天级） |
| 调优空间 | 几乎为零 | tile 大小、循环顺序、分区策略 |
| 可移植性 | 极好（跨硬件） | 好（跨同厂商硬件代际） |
| 开发门槛 | 极低（导出模型） | 中等（需理解 tiling 概念） |

**关键洞察：** cuTile 和 ONNX 都隐藏了 DMA，但 cuTile 暴露了 tiling。Tiling 是算法和硬件之间的接口——往上依赖算法知识（只有算法作者知道 tile 间怎么传状态），往下依赖硬件知识（只有编译器知道 CMX 容量和 DMA 带宽）。

**平衡观点：**
- ONNX 对 99% 用户是正确选择，标准操作的优化路径已经足够好
- cuTile 面向 1% 的算子作者——他们的生产力决定了推理引擎内部的优化速度
- 两者互补而非替代：ONNX 用户什么都不用改，但享受到更快的 SDPA 实现

**对 NPU 生态的启示：**
- 当前算子创新速度被编译器团队人力瓶颈卡住（全世界能写 SHAVE kernel + npu_compiler pass 的人可能不超过几十个）
- 模型作者不能试验新 attention 模式在 NPU 上的效果——只能用编译器已支持的
- NPU 的定位（笔记本低功耗 AI 助手）使这些限制暂时可接受，但如果要支持更广泛的模型生态，某种形式的算子可编程性可能是绕不开的

### §8 总结

- 从硬件执行到编程模型的完整弧线回顾
- NPU 的定位：笔记本低功耗单用户 LLM 推理——batch=1 是常态，固定容量覆盖大多数对话，优势在于低功耗和不占 GPU 资源
- 硬件天花板不只是算力和带宽，也是编程模型允许多少人为它写高效代码

---

## 交互组件汇总

| # | 组件名 | 文章 | 类型 | 复杂度 |
|---|--------|------|------|--------|
| 1 | KVCacheGrowthAnimation | npu-llm-kvcache §2 | 流程动画 | 中 |
| 2 | PrefillGenerateSwitch | npu-llm-kvcache §4 | 流程动画 | 中高 |
| 3 | GenerateVariantSelector | npu-llm-kvcache §5 | 参数化模拟 | 中 |
| 4 | PipelineTimeline | npu-execution-programming §2 | 流程动画 | 高 |
| 5 | AttentionPathDecisionTree | npu-execution-programming §3 | 决策树 | 中 |
| 6 | NpuVsGpuExecution | npu-execution-programming §7 | 对比探索 | 中高 |

所有组件放置于 `src/components/interactive/`，命名 PascalCase，在 MDX 中使用 `client:visible` 指令。

## 跨文章引用关系

```
现有文章（跨引用，非修改）          新增/修改文章
─────────────────────              ────────────────
prefill-vs-decode        ←─────── npu-llm-kvcache §1
cuda-programming-model   ←─────── npu-execution-programming §1, §2, §7
graph-compilation-optimization ←── npu-execution-programming §3, §4
positional-encoding      ←─────── npu-execution-programming §5
spirv-level-zero         ←─────── npu-execution-programming §7 (Level Zero API)
openvino-graph-pipeline  ←─────── npu-llm-kvcache §3 (OpenVINO IR)
```

## 双语处理

- 先完成中文版（zh），英文版（en）在中文版稳定后同步
- commit message 注明 "zh-only"
