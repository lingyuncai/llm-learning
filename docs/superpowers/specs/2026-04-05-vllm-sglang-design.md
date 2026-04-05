# vLLM + SGLang 推理引擎深度解析 — 设计文档

## 路径定义

- **路径 ID**: `inference-serving`
- **标题**: "vLLM + SGLang 推理引擎深度解析"
- **英文标题**: "vLLM + SGLang Inference Engine Deep Dive"
- **级别**: advanced
- **描述**: 从 PagedAttention 到 RadixAttention，从调度抢占到结构化输出，系统理解现代 LLM 推理引擎的核心算法与设计哲学。

## 设计哲学

- **原理为主，不深入源码**：讲算法思想和设计 trade-off，不追踪具体代码实现（vLLM/SGLang 迭代极快，源码细节容易过时）
- **交互动画驱动理解**：每篇 5-6 个组件，28 个总计，用可视化让抽象概念具象化
- **对比贯穿始终**：vLLM vs SGLang 不是孤立讲解，而是在每个技术点上做对比

## 文章依赖关系

```
1. inference-engine-landscape (无前置)
   ↓
2. paged-attention (前置: kv-cache)
   ↓
3. inference-scheduling (前置: paged-attention)
   ↓
4. prefix-caching (前置: paged-attention)
   ↓
5. sglang-programming-model (前置: prefix-caching)
```

文章 3 和 4 都依赖文章 2，但彼此独立；文章 5 依赖文章 4。

---

## 文章 1：推理引擎全景

- **slug**: `inference-engine-landscape`
- **difficulty**: intermediate
- **tags**: `inference`, `vllm`, `sglang`, `ollama`, `tensorrt-llm`
- **prerequisites**: 无

### 内容结构

1. **为什么需要推理引擎** — 裸 transformers.generate() 的瓶颈：内存浪费、无并发、吞吐低
2. **四大引擎定位**
   - vLLM：吞吐优先的云端 serving（PagedAttention 起家）
   - SGLang：可编程 + 高性能（RadixAttention + 结构化输出）
   - Ollama/llama.cpp：本地优先、易用、CPU/量化友好
   - TensorRT-LLM：NVIDIA 生态极致优化（FP8、inflight batching）
3. **设计哲学三分法** — 吞吐型 vs 可编程型 vs 易用型
4. **关键技术概览** — PagedAttention、Continuous Batching、RadixAttention、Constrained Decoding（后续文章详解）
5. **技术演进时间线** — 2023.06 vLLM → 2023.10 SGLang → 2024 各引擎竞争融合
6. **选型指南** — 不同场景该选哪个

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| InferenceEngineRadar | 交互 | 点击切换 4 个引擎的雷达图（吞吐/延迟/易用性/生态/灵活性） |
| DesignPhilosophyMap | 静态 SVG | 三角形定位图：三个顶点（吞吐/可编程/易用），引擎标在不同位置 |
| RequestLifecycleCompare | StepNavigator | 3 步：云端 serving 流程 vs 本地推理流程 vs 可编程管道流程 |
| StaticVsDynamicBatching | 交互 | 时间线动画：静态批处理（等全部完成）vs 动态（逐个释放） |
| TechEvolutionTimeline | 交互 | 可滚动时间线，hover 显示每个里程碑详情 |
| EngineDecisionTree | 交互 | 交互式决策树：回答 3-4 个问题 → 推荐引擎 |

### References

- Kwon et al. "Efficient Memory Management for Large Language Model Serving with PagedAttention" (SOSP 2023)
- Zheng et al. "SGLang: Efficient Execution of Structured Language Model Programs" (2023)
- NVIDIA TensorRT-LLM documentation
- Ollama GitHub / llama.cpp GitHub

---

## 文章 2：PagedAttention 与 Continuous Batching

- **slug**: `paged-attention`
- **difficulty**: advanced
- **tags**: `paged-attention`, `continuous-batching`, `vllm`, `memory-management`, `kv-cache`
- **prerequisites**: `kv-cache`

### 内容结构

1. **KV Cache 的内存困境** — 预分配 max_seq_len 导致 60-80% 内存浪费、内部碎片、外部碎片
2. **操作系统的启示** — 虚拟内存 → 分页 → PagedAttention 的类比
3. **PagedAttention 核心机制** — 逻辑块/物理块、Block Table、按需分配、最后一块内部碎片 < 4%
4. **Copy-on-Write** — beam search / parallel sampling 场景下的块共享与延迟复制
5. **Continuous Batching** — 从静态批处理到 iteration-level scheduling 的演进
6. **性能分析** — 内存利用率提升、吞吐量对比、不同并发下的表现

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| MemoryWasteComparison | 交互 | 左右对比：预分配（大段灰色浪费）vs PagedAttention（紧凑分页），滑块调 seq_len 看浪费率变化 |
| BlockTableMapping | 交互 | 点击 token 序列，高亮对应逻辑块 → 箭头 → 物理块，动态增长过程 |
| FragmentationAnalysis | 交互 | 柱状图对比：连续分配 vs 分页的内部/外部碎片率，可切换不同请求数 |
| CopyOnWriteBeam | StepNavigator | 4 步：初始共享 → beam 分叉 → CoW 触发复制 → 最终各自独立 |
| ContinuousBatchingTimeline | 交互 | 时间线动画：多个请求动态进出，完成的请求立即释放、新请求立即填入，对比静态批等全部完成 |
| ThroughputBenchmark | 交互 | 折线图：不同并发数下 static/dynamic/continuous batching 的吞吐量对比，hover 显示数值 |

### References

- Kwon et al. "Efficient Memory Management for Large Language Model Serving with PagedAttention" (SOSP 2023)
- Yu et al. "Orca: A Distributed Serving System for Transformer-Based Generative Models" (OSDI 2022)
- vLLM blog: "vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention"

---

## 文章 3：调度与抢占

- **slug**: `inference-scheduling`
- **difficulty**: advanced
- **tags**: `scheduling`, `preemption`, `chunked-prefill`, `vllm`, `inference`
- **prerequisites**: `paged-attention`

### 内容结构

1. **Scheduler 的角色** — 推理引擎的"大脑"：决定哪些请求跑、哪些等、哪些被抢占
2. **请求状态机** — waiting → running → swapped → finished，状态转换条件
3. **调度策略** — FCFS 基础策略、优先级调度（VIP 请求、SLA 约束）、公平性问题
4. **抢占机制** — 为什么需要抢占（GPU 显存不够时），两种策略：
   - Swap：KV Cache 搬到 CPU 内存，恢复时搬回
   - Recompute：丢弃 KV Cache，恢复时重算 prefill
   - 权衡：swap 开销 = PCIe 带宽，recompute 开销 = 计算量
5. **Chunked Prefill** — 长 prompt 的问题（prefill 独占 GPU 阻塞 decode）、分块策略、prefill 和 decode 混合调度
6. **调度的 trade-off** — 吞吐 vs 延迟 vs 公平性三角

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| SchedulerStateMachine | 交互 | 请求状态机可视化：点击触发事件（新请求到达、显存不足、swap 完成），看状态转换动画 |
| SchedulingPolicyGantt | 交互 | 甘特图：切换 FCFS / 优先级 / 公平调度，看同一批请求的执行顺序和完成时间差异 |
| PreemptionCompare | StepNavigator | 3 步：触发抢占 → Swap 路径（KV 搬到 CPU + 搬回）vs Recompute 路径（丢弃 + 重算）→ 开销对比 |
| ChunkedPrefillTimeline | 交互 | 时间线：上方是不分块的长 prefill（阻塞所有 decode），下方是分块后 prefill chunk 与 decode 交替执行 |
| SchedulingTradeoffSlider | 交互 | 三角滑块：拖动在吞吐/延迟/公平性之间取舍，动态显示对应策略配置和效果指标 |

### References

- Kwon et al. "Efficient Memory Management for Large Language Model Serving with PagedAttention" (SOSP 2023)
- Agrawal et al. "Sarathi: Efficient LLM Inference by Piggybacking Decodes with Chunked Prefills" (2023)
- Agrawal et al. "Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve" (OSDI 2024)

---

## 文章 4：前缀缓存与 RadixAttention

- **slug**: `prefix-caching`
- **difficulty**: advanced
- **tags**: `prefix-caching`, `radix-attention`, `sglang`, `vllm`, `kv-cache`
- **prerequisites**: `paged-attention`

### 内容结构

1. **前缀复用的动机** — 多轮对话、few-shot prompting、system prompt 共享，重复 prefill 计算浪费巨大
2. **vLLM 的 Automatic Prefix Caching** — hash-based 方案：对 token block 计算 hash → 查表 → 命中则复用物理块，缺点：只匹配精确前缀、无法处理非前缀共享
3. **RadixAttention 核心思想** — 用 Radix Tree（基数树）管理所有已计算的 KV Cache 前缀
4. **Radix Tree 操作** — 插入新序列、前缀查找（最长匹配）、LRU 淘汰、分叉与合并
5. **多场景复用** — 多轮对话链、few-shot 共享、self-consistency 并行采样、tree-of-thought 分支
6. **vLLM vs SGLang 缓存对比** — hash 精确匹配 vs 树结构灵活匹配，命中粒度、淘汰策略、适用场景

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| PrefixReuseMotivation | 交互 | 多轮对话场景：显示 3 轮对话共享的 system prompt + history，高亮重复计算部分，toggle 开关"启用缓存"看节省量 |
| HashPrefixCaching | StepNavigator | 3 步：token 序列分块 → 每块计算 hash → 查表命中/未命中 → 复用物理块 |
| RadixTreeViz | 交互 | Radix Tree 可视化：点击"插入序列"按钮添加新对话，树动态生长，高亮共享前缀节点，点击节点查看存储的 KV 块 |
| RadixTreeEviction | 交互 | LRU 淘汰动画：树节点带访问时间戳，显存满时从最久未用叶节点开始淘汰，被淘汰节点渐隐 |
| CacheHitHeatmap | 交互 | 热力图：行=不同对话模式（单轮/多轮/few-shot/tree-of-thought），列=请求序号，颜色=缓存命中率 |
| PrefixCachingCompare | 交互 | 左右对比表：vLLM hash-based vs SGLang RadixAttention，维度（匹配方式/粒度/淘汰/非前缀共享/overhead），hover 展开详细说明 |

### References

- Zheng et al. "SGLang: Efficient Execution of Structured Language Model Programs" (2023)
- vLLM docs: "Automatic Prefix Caching"
- Fredkin, E. "Trie Memory" (1960) — Radix Tree 基础

---

## 文章 5：SGLang 编程模型

- **slug**: `sglang-programming-model`
- **difficulty**: advanced
- **tags**: `sglang`, `structured-output`, `constrained-decoding`, `fsm`, `dsl`
- **prerequisites**: `prefix-caching`

### 内容结构

1. **为什么需要编程模型** — 复杂 LLM 应用不是单次 generate：多轮依赖、并行分支、格式约束，传统 API 需要多次调用+手动拼接
2. **SGLang DSL 核心原语** — gen（生成）、select（选择）、fork/join（并行分支与汇合）、append（拼接上下文）
3. **执行引擎如何优化 DSL** — 将 DSL 编排转化为 RadixAttention 友好的执行计划，最大化前缀复用
4. **约束解码的问题** — 自由生成的 JSON 经常格式错误、字段缺失、类型不对
5. **FSM-Guided Generation** — JSON Schema → 正则 → FSM，每一步只允许合法 token 子集
6. **Jump-Forward 优化** — FSM 中确定性片段（如 `{"name": "`）不需要逐 token 采样，直接跳过，加速 2-5x
7. **实际应用** — 结构化 API 输出、多步推理链、批量评估

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| SGLangExecutionFlow | 交互 | DSL 代码片段在左侧，右侧可视化执行流：gen 产出 token 流、fork 分出并行分支、join 汇合，动态高亮当前执行位置 |
| FSMConstrainedDecoding | 交互 | FSM 状态图：当前状态高亮，显示合法转移边，下方 token 词表灰显非法 token、高亮合法 token，点击合法 token 推进状态 |
| JumpForwardCompare | StepNavigator | 3 步：普通逐 token 生成 JSON（慢）→ FSM 约束逐 token（正确但仍慢）→ Jump-forward 跳过确定性片段（快+正确） |
| TokenMaskGeneration | 交互 | 输入一个 JSON Schema，展示 FSM 当前状态 → 合法字符集 → 对应 token mask 的转换过程，逐步点击推进 |
| StructuredOutputAccuracy | 交互 | 柱状图对比：无约束 / regex-guided / FSM-guided / jump-forward 四种模式的输出合规率和生成速度，hover 显示详细数值 |

### References

- Zheng et al. "SGLang: Efficient Execution of Structured Language Model Programs" (2023)
- Willard & Louf "Efficient Guided Generation for Large Language Models" (2023) — Outlines FSM 方法
- LMSYS blog: "Fast JSON Decoding for Local LLMs with Compressed Finite State Machine"

---

## 总计

- **5 篇文章**，28 个交互组件
- **新路径**: `inference-serving.yaml`
- 文章 1 为 intermediate，文章 2-5 为 advanced
