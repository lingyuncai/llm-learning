# llama.cpp 源码精读系列 — 设计文档

> 日期: 2026-04-15
> 状态: Draft
> 草稿来源: `docs/llama_cpp_deep_dive.md`（2277 行，15 章，基于 llama.cpp 2026-04 master）
> 源码位置: `c:/workspace/llama.cpp`

---

## 1. 项目概述

### 1.1 目标

将现有的 llama.cpp deep dive 草稿转化为 llm-learning 网站上的一个**系列文章**（8 篇 MDX + 1 个学习路径），以源码级精度追踪 llama.cpp 的完整执行流程。

### 1.2 定位：与 ollama-internals 系列的关系

| 维度 | ollama-internals（现有） | llama.cpp 源码精读（本系列） |
|------|--------------------------|------------------------------|
| 视角 | 从 `ollama run` 出发，向下追踪到 llama.cpp 边界 | 从 llama.cpp `main()` 出发，沿 C/C++ 调用链逐函数追踪 |
| 深度 | 概念 + Ollama Go 封装层 | C/C++ 源码实现细节 |
| 读者 | 想理解原理的开发者 | 想阅读/修改/贡献 llama.cpp 的 C/C++ 开发者 |
| 代码 | 概念性伪代码为主 | 真实源码片段（经过多次校对） |

两者形成**概念层 → 源码层**的递进关系，不是竞争关系。

### 1.3 核心约束

**源码校对要求**：草稿中的所有代码片段、结构体字段、函数调用路径都经过源码级多次审核。实施时必须：
1. 先 Read 草稿对应章节原文
2. 对引用的每个函数/结构体，去 llama.cpp 源码中确认当前代码仍然一致
3. 代码片段直接从草稿复制，不重写或"改善"措辞

---

## 2. 学习路径

### 2.1 路径定义

```yaml
id: llama-cpp-source-walkthrough
order: 9
title:
  zh: "llama.cpp 源码精读"
  en: "llama.cpp Source Code Walkthrough"
description:
  zh: "逐函数追踪 llama.cpp 的 C/C++ 执行流程。本路径是「Ollama + llama.cpp 深度解析」的源码级延伸——前者讲概念和架构设计，本系列讲 C++ 实现细节。适合想阅读、修改或贡献 llama.cpp 的开发者。"
  en: "Trace llama.cpp's complete C/C++ execution flow function by function. This path extends the 'Ollama + llama.cpp Deep Dive' from concepts to source-level implementation details."
level: advanced
articles:
  - llama-cpp-overview
  - llama-cpp-tools-gguf
  - llama-cpp-model-loading
  - llama-cpp-warmup-tokenization
  - llama-cpp-batch-ubatch
  - llama-cpp-build-graph
  - llama-cpp-scheduling-memory
  - llama-cpp-execution-sampling
```

### 2.2 现有路径 order 调整

| 路径 | 原 order | 新 order |
|------|----------|----------|
| ollama-internals | 8 | 8（不变） |
| **llama-cpp-source-walkthrough** | — | **9（新增）** |
| ai-compute-stack | 9 | 10 |
| graph-compilation-optimization | 10 | 11 |
| reinforcement-learning | 11 | 12 |
| intel-igpu-inference | 12 | 13 |

---

## 3. 文章清单与内容设计

### 3.0 #0 — llama-cpp-overview（执行流程总览）

**草稿来源**: Ch.15 端到端流程回顾 + 性能特征表

**Frontmatter**:
- title: "llama.cpp 执行流程总览"
- slug: llama-cpp-overview
- tags: [llama-cpp, inference-engine, architecture, source-code]
- difficulty: advanced
- prerequisites: [ollama-architecture]

**定位**: 系列地图。不深入代码，让读者建立完整 mental model。

**内容结构**:
1. 开篇定位：与 ollama-inference-journey 的关系——"那篇讲 Ollama 如何调用 llama.cpp，本系列讲调用之后发生了什么"
2. llama.cpp 项目概况：定位（C/C++ 推理引擎）、规模（125 种架构、多 backend）、核心设计哲学
3. **端到端流程全景图**（草稿 Ch.15 的大流程图 → React 组件 `ExecutionPipelineOverview`）
4. 四个阶段的性能特征表（启动 → prefill → decode → 采样）
5. 系列导航：每篇一句话介绍 + 链接

**组件**: `ExecutionPipelineOverview`（interactive/，静态全景图，高亮各阶段对应文章链接）

**预估**: ~200-250 行 MDX

---

### 3.1 #1 — llama-cpp-tools-gguf（工具全景与 GGUF 二进制解析）

**草稿来源**: Ch.0 + Ch.1

**Frontmatter**:
- title: "工具全景与 GGUF 二进制解析"
- slug: llama-cpp-tools-gguf
- tags: [llama-cpp, gguf, quantization, binary-format]
- difficulty: advanced
- prerequisites: [llama-cpp-overview, gguf-format]

**内容结构**:

**Part A: 工具全景**（Ch.0）
- llama-completion / llama-cli / llama-bench 三者架构差异（`FlowDiagram` 组件）
- 功能对比表（MDX table，直接复用草稿表格）
- 选择建议

**Part B: GGUF 逐字段解析**（Ch.1 前半）
- 文件物理布局（Header → KV Metadata → Tensor Info → Padding → Data Blob）
- `gguf_init_from_file_ptr()` 解析流程，逐步骤代码
- Tensor Info 结构体（`gguf_tensor_info` + `ggml_tensor`）
- KV Metadata 常见 key 表

**Part C: 量化 Block 结构**（Ch.1 后半）
- Q4_0 / Q4_K / Q8_0 的 struct 定义 + 反量化公式
- Q4_K 两层量化结构图
- Dot product pairing 表 + `type_traits_cpu` 查表机制

**组件**:
- 复用/扩展 `GGUFFileStructure`（加入量化 block 内部展开视图）
- `FlowDiagram`（原语，工具架构对比图）

**预估**: ~450-500 行 MDX

---

### 3.2 #2 — llama-cpp-model-loading（模型加载：从文件到设备）

**草稿来源**: Ch.2 + Ch.3

**Frontmatter**:
- title: "模型加载：从文件到设备"
- slug: llama-cpp-model-loading
- tags: [llama-cpp, model-loading, mmap, gpu-offload, backend]
- difficulty: advanced
- prerequisites: [llama-cpp-tools-gguf, ollama-hardware-backends]

**内容结构**:

**Part A: 模型加载**（Ch.2）
- 加载总览流程图（`ModelLoadingPipeline` 组件）
- 阶段 1: `no_alloc = true` 解析——内存开销分析（400KB vs 数 GB）
- 阶段 2: weights_map 构建——遍历 tensor info 建立名称索引，tensor 状态分析
- 阶段 3: 架构识别——`llm_arch_from_string()` 映射
- 阶段 4: mmap vs read——两种加载路径代码 + 适用场景 + 异步上传流水线（4 个 pinned staging buffer）
- 阶段 5: 分片模型——split 文件的统一 weights_map

**Part B: Backend 初始化与设备分配**（Ch.3）
- GPU / ACCEL / CPU backend 发现与初始化顺序
- `n_gpu_layers` 计算：`i_gpu_start = max(n_layer + 1 - ngl, 0)`
- 层分配示意（`GPULayerSplit` 交互组件）
- 多 GPU tensor_split 算法（归一化累积分布 + upper_bound 二分）
- Buffer type 选择：`select_buft()` 遍历候选 + GPU fallback CPU
- Auto-fit 逻辑：缩减 ctx_size → 减少 n_gpu_layers

**组件**:
- `ModelLoadingPipeline`（interactive/，加载总览流程图，静态）
- `GPULayerSplit`（interactive/，交互：输入 n_layer / n_gpu_layers / GPU 数量，展示层分配）

**预估**: ~500-550 行 MDX

---

### 3.3 #3 — llama-cpp-warmup-tokenization（Warmup、Tokenization 与 Chat Template）

**草稿来源**: Ch.4 + Ch.5

**Frontmatter**:
- title: "Warmup、Tokenization 与 Chat Template"
- slug: llama-cpp-warmup-tokenization
- tags: [llama-cpp, warmup, tokenization, chat-template, jinja2, multimodal]
- difficulty: advanced
- prerequisites: [llama-cpp-overview]

**内容结构**:

**Part A: Warmup 机制**（Ch.4）
- warmup 做了什么：BOS+EOS → decode → 清除 KV cache → 重置 sampler RNG
- 为什么需要：GPU 预分配、shader/kernel 编译、KV cache 初始化
- encoder-decoder 模型（T5）的 warmup 特殊处理
- `--no-warmup` 适用场景

**Part B: Tokenization**（Ch.5 前半）
- `llama_tokenize()` 代理函数
- `add_special` / `parse_special` 参数含义
- tokenizer 实现由模型 GGUF KV metadata 决定
- 反向 detokenize：`llama_token_to_piece()` / `llama_detokenize()`

**Part C: Chat Template**（Ch.5 中段）
- 为什么不能直接拼接 prompt——ChatML vs Llama-3 格式对比
- Chat template = Jinja2 模板字符串，嵌入 GGUF KV metadata
- 加载流程：`common_chat_templates_init()` → `llama_model_chat_template()` → fallback 逻辑
- 渲染流程：`common_chat_templates_apply()` + `ChatTemplateRenderer` 交互组件

**Part D: 多模态 Token 注入**（Ch.5 后段）
- `mtmd_tokenize()` 流程：文本 token + vision token 合并为 `mtmd_input_chunks`
- `mtmd_encode_chunk()`：vision encoder（CLIP / mmproj）编码图片
- vision token 在 LLM 中的处理方式

**组件**:
- `ChatTemplateRenderer`（interactive/，交互：选择模板类型 ChatML/Llama-3，展示同一 messages 列表的不同渲染结果）

**预估**: ~400-450 行 MDX

---

### 3.4 #4 — llama-cpp-batch-ubatch（Batch、Ubatch 与解码主循环）

**草稿来源**: Ch.6

**Frontmatter**:
- title: "Batch、Ubatch 与解码主循环"
- slug: llama-cpp-batch-ubatch
- tags: [llama-cpp, batch, ubatch, decoding, parallel-sequences, kv-cache]
- difficulty: advanced
- prerequisites: [llama-cpp-overview, kv-cache]

**内容结构**:

**Part A: llama_batch 用户侧接口**
- 结构体定义（`include/llama.h`）
- 各字段含义表（token/embd/pos/n_seq_id/seq_id/logits）
- `llama_batch_get_one()` 和 `llama_batch_init()` 两个工厂函数

**Part B: llama_ubatch 内部微批次**
- 结构体定义（`src/llama-batch.h`）
- 与 batch 的关键区别：`n_seq_tokens` / `n_seqs` / `seq_id_unq` / `seq_idx`
- 两级批次参数：`--batch-size`（n_batch=2048）/ `--ubatch-size`（n_ubatch=512）
- 约束：n_ubatch ≤ n_batch

**Part C: 三种切分算法**
- `split_simple(n_ubatch)`：顺序切分，单序列 prefill
- `split_equal(n_ubatch, sequential)`：等长切分，多序列均衡
- `split_seq(n_ubatch)`：按序列隔离，自回归解码
- 策略选择逻辑：KV cache `init_batch()` 中 `n_stream == 1 ? split_simple : split_equal`
- `BatchSplitVisualizer` 交互组件

**Part D: Prompt prefill 分块示例**
- 1500 token → n_ubatch=512 → 3 个 ubatch（512+512+476）
- 各 ubatch 共享 KV cache

**Part E: 并行序列解码**
- `seq_id` 共享前缀机制
- Prefill 阶段：一个 token 属于多个序列 → KV cache 只存一份
- Decode 阶段：各序列独立生成，写入各自 KV slot
- `examples/batched/batched.cpp` 代码示例

**Part F: llama_decode 主循环**
- `llama_context::decode()` 简化代码：balloc.init → memory.init_batch → output_reserve → 逐 ubatch process_ubatch → 提取 logits

**组件**:
- `BatchSplitVisualizer`（interactive/，交互：输入 n_tokens / n_ubatch / n_sequences，可视化三种切分算法的不同结果）

**预估**: ~450-500 行 MDX

---

### 3.5 #5 — llama-cpp-build-graph（计算图构建与架构分发）

**草稿来源**: Ch.7

**Frontmatter**:
- title: "计算图构建与架构分发"
- slug: llama-cpp-build-graph
- tags: [llama-cpp, compute-graph, architecture, ggml, graph-reuse]
- difficulty: advanced
- prerequisites: [llama-cpp-overview, ollama-compute-graph]

**开头 callout**: "llama.cpp 的计算图基于 GGML 的惰性求值模型。如果你对这个模型还不熟悉，建议先阅读[计算图与推理引擎](/zh/ollama-compute-graph)。本文直接进入 `build_graph()` 的 C++ 实现。"

**内容结构**:

**Part A: 125 种架构，一个入口**
- `llm_arch` 枚举（`src/llama-arch.h`）
- `src/models/` 目录：113 个 .cpp 文件
- `llama_model::build_graph()` 的 switch 分发 + 后处理（pooling/sampling/dense_out）

**Part B: llm_graph_context 积木接口**
- 继承关系示意（`FlowDiagram`）
- 核心方法表：build_inp_embd / build_inp_pos / build_norm / build_attn / build_ffn / build_moe_ffn / build_lora_mm / build_cvec / build_pooling / build_sampling
- build_norm 变体：LLM_NORM / LLM_NORM_RMS
- build_attn 变体：KV cache / 无 cache / ISWA / cross-attention
- build_ffn 变体：SiLU/GELU/ReLU + 并行/顺序 gate

**Part C: 实例对比——Llama vs GPT-2**
- `llm_build_llama` 构造函数代码（草稿原文）
- `llm_build_gpt2` 构造函数代码（草稿原文）
- 差异对比表：归一化/位置编码/QKV 投影/FFN 激活/偏置
- `ArchitectureComparison` 交互组件

**Part D: 图复用机制**
- `process_ubatch()` 中 `can_reuse()` 的判断逻辑
- 复用条件列表（ubatch 形状、输入模式、序列 ID、输出数量、模型配置）
- 自回归解码阶段的高复用率分析

**组件**:
- `ArchitectureComparison`（interactive/，交互：选择两种架构，对比积木使用差异）
- `FlowDiagram`（原语复用，继承关系示意）

**预估**: ~450-500 行 MDX

---

### 3.6 #6 — llama-cpp-scheduling-memory（Backend 调度、Op Fusion 与内存分配）

**草稿来源**: Ch.8 + Ch.9 + Ch.10

**Frontmatter**:
- title: "Backend 调度、Op Fusion 与内存分配"
- slug: llama-cpp-scheduling-memory
- tags: [llama-cpp, backend-scheduling, op-fusion, memory-allocation, pipeline-parallelism]
- difficulty: advanced
- prerequisites: [llama-cpp-build-graph]

**内容结构**:

**Part A: Backend Scheduling**（Ch.8）
- `ggml_backend_sched` 数据结构
- **五遍扫描算法**（`ggml_backend_sched_split_graph()`）：
  - Pass 1: 初始分配——根据 tensor buffer 确定 backend
  - Pass 2: 传播扩展——GPU 双向传播（4 个子遍历）
  - Pass 3: 升级优化——低优先级 → 高优先级
  - Pass 4: 源 tensor 分配——view 继承、consumer 继承
  - Pass 5: 图切分 + 拷贝插入
- `SchedulerPassVisualizer` 交互组件
- `ggml_backend_sched_split` 结构体
- 切分示例：32 层模型，ngl=24，split 0 (CPU) → copy → split 1 (GPU)
- 跨 backend 数据拷贝：异步优先 → 同步 fallback
- Pipeline parallelism：4 组副本轮转 + Gantt 示意（`FlowDiagram`）

**Part B: Op Fusion 与图优化**（Ch.9）
- 优化时机：split 之后、graph copy 之前
- 每个 split 独立优化，由 backend 的 `graph_optimize` 回调执行
- 典型融合模式：
  - RMSNorm + Scale 融合（Vulkan/Metal/OpenCL）
  - Vulkan 扩展：RMS_NORM + MUL + ROPE 三级融合
  - Flash Attention：算法级优化，`GGML_OP_FLASH_ATTN_EXT`
  - Flash Attention 可用性自动探测（context 初始化阶段）
  - CUDA QKV 重排序（fork-join 模式识别）
  - Gated Delta Net 融合
- `ggml_can_fuse()` 安全性检查（依赖图、输出限制、view 完整性）

**Part C: Tensor 内存分配**（Ch.10）
- 三类 tensor 生命周期对比表
- 权重 tensor：mmap 零拷贝 / backend buffer + 异步上传流水线（4 个 pinned staging buffer）
- KV cache：会话级 3D tensor（`[n_embd_k_gqa, kv_size, n_stream]`），按层分配到设备
- 中间激活 tensor：
  - `ggml_gallocr` 图分配器
  - 引用计数 + 立即释放
  - 就地操作（in-place）优化：ADD/MUL/SCALE/RMS_NORM/SOFT_MAX/ROPE
  - `ggml_dyn_tallocr` best-fit 内存池
- `ggml_backend_sched_alloc_graph()` 入口流程：split → 检查变化 → reserve 或复用

**组件**:
- `SchedulerPassVisualizer`（interactive/，交互：小型计算图，step-by-step 展示五遍扫描每遍后 node 着色变化——**系列核心组件**）
- `FlowDiagram`（原语复用，pipeline parallelism Gantt 示意）

**预估**: ~550-600 行 MDX（本系列最重的一篇）

---

### 3.7 #7 — llama-cpp-execution-sampling（执行、采样与上下文管理）

**草稿来源**: Ch.11 + Ch.12 + Ch.13 + Ch.14

**Frontmatter**:
- title: "执行、采样与上下文管理"
- slug: llama-cpp-execution-sampling
- tags: [llama-cpp, execution, sampling, speculative-decoding, kv-cache, context-management]
- difficulty: advanced
- prerequisites: [llama-cpp-scheduling-memory, sampling-and-decoding]

**内容结构**:

**Part A: 执行**（Ch.11）
- `process_ubatch()` 全景流程（apply KV → can_reuse? → build/alloc → set_inputs → compute）
- `set_inputs()` 各输入类型处理器表（embd/pos/attn_kv/attn_no_cache/out_ids）
- `compute_splits()`：逐 split 执行——输入拷贝 → 异步计算 → 事件记录
- MoE expert 按需加载：
  - 检测 `GGML_OP_MUL_MAT_ID` + CPU host buffer
  - 读取 gate 输出 → bitset 标记 → 分组连续 expert → 异步拷贝 + 512B padding
  - 8 选 2 → 减少 ~75% 传输量
- dtype 分发：`type_traits_cpu` 查表（Q4_0→Q8_0, Q4_K→Q8_K, F16→F16）+ 运行时量化
- Prefill vs decode 线程策略：`n_threads_batch` vs `n_threads`

**Part B: 采样**（Ch.12）
- 默认 sampler chain 构造顺序：logit_bias → penalties → DRY → top-n-sigma → top-k → typical-p → top-p → min-p → XTC → temperature → dist
- 核心采样器简介表（8 种 sampler + 关键参数）
- `common_sampler_sample()` 执行流程代码
- Grammar 约束：
  - 工作原理（解析栈 + token 可行性检查）
  - 两种策略：grammar-first vs rejection sampling（流程图）
  - JSON Schema → BNF 转换
  - Lazy grammar：触发模式激活
- Token → 文本：`common_token_to_piece()` + 多字节字符处理
- `SamplerChainVisualizer` 交互组件

**Part C: Speculative Decoding**（Ch.13）
- 核心思想：小模型快速猜测 → 大模型一次验证
- Draft-Verify 循环代码（`speculative-simple.cpp`）
- 验证算法：greedy（直接比较）vs 随机（acceptance test: `r ≤ p_target/p_draft`）
- 7 种 draft 策略表（draft model / eagle3 / 5 种 ngram 变体）
- 置信度控制：`top_1_prob < p_min` 时早停
- 关键参数表（--draft / --draft-min / --draft-p-min / --model-draft / --gpu-layers-draft）

**Part D: 上下文管理**（Ch.14）
- KV cache 内部结构：`llama_kv_cells`（pos/shift/seq/used）
- KV cache 量化：`--cache-type-k/v`，支持 f32/f16/bf16/q8_0/q4_0 等
- Context shift 机制：
  - 保留 n_keep 个初始 token + 丢弃 n_discard 个中间 token + 剩余前移
  - `seq_rm()` + `seq_add()` 实现
  - K-shift：量化 K cache 的 RoPE 逆旋转 + 重旋转
- Prompt cache：`llama_state_save_file()` / `llama_state_load_file()`
- 序列操作 API 表（seq_rm / seq_cp / seq_keep / seq_add）

**组件**:
- `SamplerChainVisualizer`（interactive/，交互：logits 经过各 sampler 后的分布变化。复用/扩展现有 `TemperatureDistribution` 思路）

**预估**: ~550-600 行 MDX

---

## 4. 组件清单

### 4.1 新建原语组件（primitives/）

| 组件 | 说明 | 使用文章 |
|------|------|---------|
| `FlowDiagram` | 通用流程图组件。通过 props 传入节点/连线数据，用 flex/grid + SVG 箭头渲染。替代草稿中大部分简单 mermaid 流程图。 | 多篇复用 |

### 4.2 新建交互组件（interactive/）

| 组件 | 交互方式 | 使用文章 |
|------|---------|---------|
| `ExecutionPipelineOverview` | 静态全景图，高亮各阶段，点击区块跳转对应文章 | #0 |
| `GPULayerSplit` | 输入 n_layer / n_gpu_layers / GPU 数量 + 显存比例，动态展示层分配结果 | #2 |
| `ChatTemplateRenderer` | 选择模板类型（ChatML / Llama-3），展示同一 messages 列表的不同渲染结果 | #3 |
| `BatchSplitVisualizer` | 输入 n_tokens / n_ubatch / n_sequences，可视化三种切分算法（simple/equal/seq）的不同结果 | #4 |
| `ArchitectureComparison` | 选择两种架构（Llama/GPT-2/Qwen2），并排展示积木使用差异，高亮不同点 | #5 |
| `SchedulerPassVisualizer` | 小型计算图，step-by-step 播放五遍扫描，每遍后 node 颜色变化表示 backend 分配 | #6 |
| `SamplerChainVisualizer` | logits 柱状图 → 经过各 sampler 后的分布变化动画（扩展 `TemperatureDistribution` 思路） | #7 |

### 4.3 复用/扩展现有组件

| 现有组件 | 位置 | 复用方式 |
|----------|------|---------|
| `GGUFFileStructure` | interactive/ | #1 中扩展：加入量化 block 内部结构展开视图 |
| `StepNavigator` | primitives/ | 多篇复用：代码解析分步展示 |

### 4.4 技术方案

- **不引入 mermaid 依赖**。所有草稿中的 mermaid 图转为 React 组件或 MDX table。
- 交互组件用 React + Motion (`motion/react`) + Tailwind CSS，遵循现有项目风格。
- `FlowDiagram` 原语用 SVG 绘制箭头/连线，节点用 Tailwind styled div。
- 代码片段直接从草稿复制到 MDX 的 ` ```cpp ` 代码块中，不做改写。
- 表格直接用 MDX 原生 markdown table（功能对比、参数表等）。

---

## 5. 交叉指引设计

### 5.1 三层指引机制

| 层次 | 机制 | 方向 | 说明 |
|------|------|------|------|
| 结构层 | Prerequisites（frontmatter） | 源码系列 → 概念文章 | 硬性前置：跳过则看不懂本文关键概念 |
| 内容层 | 文内 callout（自然语言） | **双向** | 上下文精准指引，在正文中自然引用 |
| 路径层 | 学习路径 description | 路径级别 | 在路径列表页说明两个系列的递进关系 |

### 5.2 Prerequisites 完整映射

| 源码系列文章 | Prerequisites |
|-------------|---------------|
| #0 llama-cpp-overview | `ollama-architecture` |
| #1 llama-cpp-tools-gguf | `llama-cpp-overview`, `gguf-format` |
| #2 llama-cpp-model-loading | `llama-cpp-tools-gguf`, `ollama-hardware-backends` |
| #3 llama-cpp-warmup-tokenization | `llama-cpp-overview` |
| #4 llama-cpp-batch-ubatch | `llama-cpp-overview`, `kv-cache` |
| #5 llama-cpp-build-graph | `llama-cpp-overview`, `ollama-compute-graph` |
| #6 llama-cpp-scheduling-memory | `llama-cpp-build-graph` |
| #7 llama-cpp-execution-sampling | `llama-cpp-scheduling-memory`, `sampling-and-decoding` |

### 5.3 Ollama 系列反向 callout（4 篇）

在以下现有文章中添加简短 callout，指向对应的源码篇：

| 现有文章 | 添加位置 | callout 内容 |
|---------|---------|-------------|
| `gguf-format` | GGUF 结构体讲解后 | → #1 "GGUF 解析的 C++ 实现细节（逐字段解析 + 量化 block 结构），详见 [工具全景与 GGUF 二进制解析]" |
| `ollama-compute-graph` | 计算图概念讲解后 | → #5 "125 种架构如何共享积木接口 + 图复用机制，详见 [计算图构建与架构分发]" |
| `ollama-hardware-backends` | 多后端架构讲解后 | → #2, #6 "n_gpu_layers 层分配算法详见 [模型加载]；五遍扫描调度算法详见 [Backend 调度]" |
| `ollama-kv-cache-scheduling` | KV cache/batch 讲解后 | → #4, #7 "Ubatch 三种切分算法详见 [Batch 与 Ubatch]；context shift 实现详见 [执行与采样]" |

### 5.4 文内 callout 示例

**源码系列 → 概念文章**（每篇开头）：

> 本文是 llama.cpp 源码精读系列的一部分。如果你想了解计算图的**概念和设计动机**，请先阅读 [计算图与推理引擎](/zh/ollama-compute-graph)。本文聚焦于 llama.cpp 的 **C++ 实现细节**：125 种架构如何通过同一个入口分发、积木方法的具体接口、以及图复用的判断条件。

---

## 6. 实施要求

### 6.1 源码校对流程（关键约束）

草稿（`docs/llama_cpp_deep_dive.md`）中的**所有内容**——代码片段、解释性文字、技术分析、设计动机——都经过多轮源码级审核和打磨。实施时草稿是权威来源，不得凭记忆改写任何部分。

每篇文章实施时必须执行以下步骤：

1. **Read 草稿原文**：打开 `docs/llama_cpp_deep_dive.md` 对应章节，逐行阅读
2. **Read llama.cpp 源码**：对每个引用的函数名、结构体字段、枚举值，去 `c:/workspace/llama.cpp` 中 Grep/Read 确认
3. **代码片段直接复制**：从草稿复制到 MDX，不重写、不"改善"措辞、不合并/拆分代码块
4. **解释性文字忠实保留**：草稿中的技术分析、设计动机、优劣对比等文字同样是经过验证的内容。转写到 MDX 时保持原意和措辞，仅做 MDX 格式适配（如 mermaid → 组件引用）。不凭理解重新组织或换一种方式表述
5. **表格校对**：功能对比表、参数表的每个单元格都要与草稿一致
6. **如有差异**：如果 llama.cpp 源码已更新导致与草稿不一致，标记并告知用户决定如何处理

### 6.2 文件命名与路径

- 文章：`src/content/articles/zh/llama-cpp-{slug}.mdx`
- 组件：`src/components/interactive/LlamaCpp{ComponentName}.tsx`（PascalCase，加 LlamaCpp 前缀避免命名冲突）
- 原语：`src/components/primitives/FlowDiagram.tsx`
- 学习路径：`src/content/paths/llama-cpp-source-walkthrough.yaml`

### 6.3 Frontmatter 规范

所有文章遵循项目 CLAUDE.md 中定义的必填字段：
```yaml
title: string
slug: string
locale: "zh"
tags: string[]
prerequisites: string[]
difficulty: "advanced"
created: "2026-04-15"
updated: "2026-04-15"
references:
  - type: "repo"
    title: "llama.cpp GitHub"
    url: "https://github.com/ggerganov/llama.cpp"
```
每篇文章至少引用 llama.cpp 仓库作为 reference。涉及特定论文（如 Flash Attention、speculative decoding）的章节需追加对应 paper reference。

### 6.4 双语说明

本系列首先实现中文版（zh）。英文版暂不创建，commit message 中标注 "zh-only"。

### 6.5 验证

每篇文章完成后：
1. 运行 `npm run validate` 确认内容校验通过
2. 运行 `npm run dev` 本地预览确认渲染正确
3. 确认组件 `client:visible` 指令正确添加
4. 确认交叉指引链接有效

---

## 7. 总量估算

| 类别 | 数量 |
|------|------|
| 新文章（MDX） | 8 篇（总计 ~3500-4000 行 MDX） |
| 新交互组件 | 7 个 |
| 新原语组件 | 1 个（FlowDiagram） |
| 复用/扩展组件 | 2 个 |
| 新学习路径 | 1 个 |
| 现有路径 order 调整 | 5 个 |
| 现有文章反向 callout | 4 篇 |
