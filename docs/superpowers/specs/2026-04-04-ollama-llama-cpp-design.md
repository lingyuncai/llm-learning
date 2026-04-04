# Ollama + llama.cpp 学习路径 — 设计文档

> 日期：2026-04-04
> 状态：Approved

## 概述

新增一条完整的学习路径 "Ollama + llama.cpp"，深入讲解 Ollama 和 llama.cpp 的内部实现、架构设计和优化原理。共 9 篇文章、25 个交互/静态组件。

**目标读者：** 需要深入理解 Ollama/llama.cpp 内部实现的开发者（如优化研究、贡献源码、或深度使用者）。从零开始系统学习，无需预先阅读源码。

**风格：** 延续站点现有模式 — 交互动画建立直觉，概念级为主，关键核心处贴代码片段或伪代码辅助理解。

---

## 创作准则

以下准则贯穿整条学习路径的所有文章和组件创作，**跨 session 和 compact 必须遵守**：

### 1. 双项目区分原则

所有内容必须明确标注归属 **Ollama (Go)** 还是 **llama.cpp / GGML (C/C++)**。

- **视觉标识：** 蓝色系 = Ollama，橙色系 = llama.cpp/GGML。混合/边界层用渐变或分割色标注
- **文章内分区：** 涉及两侧实现的文章（如 KV Cache、计算图），内容明确分成 "Ollama 侧" 和 "llama.cpp 侧"，讲清各自的实现及为什么存在两套
- **组件配色：** 所有架构图、流程图统一用蓝/橙双色系区分归属，边界切换处明确标注
- **文字标注：** 首次提及某模块时标注归属，如 "Scheduler（Ollama）" 或 "GGML 计算图（llama.cpp）"

### 2. 差异化对比原则

每篇文章在相关处和主流推理框架（vLLM、TensorRT-LLM、TGI 等）对比：

- 用 callout / 专门小节形式呈现，标题统一为 **"为什么不一样"**
- 不单开对比文章，分散到各模块更自然
- 重点对比维度：设计哲学、技术选型、性能特征、适用场景
- 关键差异点：CPU-first vs GPU-first、GGUF vs safetensors、K-quant vs GPTQ/AWQ、无 PagedAttention、单二进制多后端、Go+C++ 混合技术栈

### 3. 深度原则

- **概念级为主：** 用架构图、流程图、对比表建立心智模型
- **关键处贴代码：** 核心算法（量化公式、cache 管理逻辑等）用伪代码或简化代码片段辅助理解
- **不贴源码路径：** 文章中不引用具体的文件路径或行号（如 `server/routes.go:123`），保持内容独立于源码版本

### 4. 源码参考

- 组件和内容设计可参考 `c:/workspace/daop-ollama` 的实际代码验证准确性
- `docs/internals/` 目录是之前探索产生的笔记，大部分正确但不保证完全准确，关键信息需与实际源码交叉验证
- 文章中的数字、配置、API 等需以源码为准

### 5. 视觉风格

- 延续站点现有模式：SVG viewBox 宽 580、shared COLORS/FONTS（`src/components/interactive/shared/colors.ts`）、StepNavigator primitive
- 蓝/橙双色系贯穿整个路径（可在 COLORS 中扩展 ollama/llamacpp 专用色）
- 交互组件加 `client:visible`，纯静态 SVG 不加

### 6. 事实准确性

- 所有技术细节必须准确，不确定的内容必须搜索验证或查阅源码
- 量化精度数字、性能数据等尽量引用 llama.cpp 官方 benchmark 或 paper
- 每篇文章的 references 必须真实有效

---

## 学习路径定义

**路径 ID：** `ollama-internals`
**路径名：**
- zh: "Ollama + llama.cpp 深度解析"
- en: "Ollama + llama.cpp Deep Dive"

**文章顺序：**
```yaml
articles:
  - ollama-architecture
  - ollama-inference-journey
  - gguf-format
  - ollama-quantization
  - ollama-compute-graph
  - ollama-kv-cache-scheduling
  - ollama-hardware-backends
  - ollama-server-scheduling
  - ollama-model-ecosystem
```

---

## 文章 1: Ollama + llama.cpp 架构总览

**slug:** `ollama-architecture`
**difficulty:** intermediate
**tags:** [ollama, llama-cpp, architecture, inference]
**prerequisites:** 无（路径入口）

### Section 1: 为什么需要 Ollama + llama.cpp

**内容：**
- 本地推理的需求：隐私、离线、低延迟、成本
- 和云端 API（OpenAI、Claude）的对比：trade-off
- Ollama 的定位：让本地运行大模型像 Docker 运行容器一样简单

### Section 2: 双层架构

**内容：**
- Ollama (Go) = 服务层：模型管理、API、调度、用户交互
- llama.cpp / GGML (C/C++) = 推理引擎：计算图、量化、GPU 内核
- 为什么分两层：Go 擅长网络服务和并发，C/C++ 擅长底层计算和硬件访问
- 两层通过子进程 + HTTP 通信（而非 in-process 调用）

### Section 3: 核心组件地图

**内容：**
- Server → Scheduler → LLM (runner manager) → Runner (子进程) → Model → GGML Backend
- 每个组件的职责一句话总结
- 数据流和控制流的区分

### Section 4: 双引擎设计

**内容：**
- ollamarunner：纯 Go 实现，~21 种架构，新的发展方向
- llamarunner：llama.cpp CGo 绑定，~120+ 种架构，兼容性后备
- 选择逻辑：尝试创建 tokenizer → 成功用 ollamarunner → 失败回退 llamarunner
- 为什么要重写一套 Go 引擎：性能优化（pipeline 执行）、减少 CGo 开销、更好的集成

### Section 5: 和主流推理框架的对比

**内容：**
- vs vLLM：GPU-first / Python / PagedAttention / 服务器部署
- vs TensorRT-LLM：NVIDIA 专用 / 编译优化 / 最高性能但最不灵活
- vs TGI (HuggingFace)：Python / 丰富模型支持 / 云端服务
- Ollama + llama.cpp 的独特定位：桌面/边缘、多后端、单二进制、CPU 也能跑

### Section 6: 技术选型

**内容：**
- Go + C/C++ 的混合：为什么不纯 C++ 或纯 Python
- mmap 模型加载：为什么不完整加载到内存
- 单二进制分发：为什么不像 Python 框架需要一堆依赖

**组件：**

1. **OllamaArchitectureOverview** (交互) — 双层架构图，蓝色=Ollama 各模块，橙色=llama.cpp/GGML 各模块，点击模块展开简介和职责说明。底部标注 Go / C/C++ 语言边界
2. **DualEngineSelector** (交互) — Runner 选择逻辑的决策流程：模型输入 → tokenizer 检测 → 分支到 ollamarunner（标注支持架构数）/ llamarunner（标注支持架构数），标注各自的优劣
3. **FrameworkComparison** (交互) — 对比表，行=框架（Ollama、vLLM、TensorRT-LLM、TGI），列=维度（语言、部署、格式、量化、后端、KV管理），hover 展示详情

### References

- Ollama GitHub: https://github.com/ollama/ollama
- llama.cpp GitHub: https://github.com/ggerganov/llama.cpp
- GGML GitHub: https://github.com/ggerganov/ggml

---

## 文章 2: 一次推理的完整旅程

**slug:** `ollama-inference-journey`
**difficulty:** intermediate
**tags:** [ollama, llama-cpp, inference, pipeline]
**prerequisites:** [ollama-architecture]

**核心设计：** 用 Qwen3 模型为例，追踪 `ollama run qwen3 "解释量子计算"` 从输入到输出的完整链路。类似 AI Compute Stack 的 MatMul Journey，用一个具体例子串联所有模块。

### Section 1: Prompt 输入

**内容：**
- CLI 解析 → 构造 HTTP 请求 → Server 路由到 `/api/chat`
- 归属标注：全部 Ollama (Go)

### Section 2: 模型加载

**内容：**
- 模型 GGUF 文件定位（本地 blob 存储）
- mmap 映射文件到内存
- Tensor 按 layer 分配到 GPU / CPU（根据显存预算）
- 归属标注：Ollama 定位文件 → llama.cpp/GGML 加载 tensor

### Section 3: Runner 启动

**内容：**
- Ollama 启动 runner 子进程（ollamarunner 或 llamarunner）
- 子进程启动内部 HTTP server
- 模型初始化：构建计算图模板、分配 KV cache
- 归属标注：Ollama 启动子进程 → Runner 内部初始化（Go 或 C++）

### Section 4: Prefill 阶段

**内容：**
- Prompt tokenize（"解释量子计算" → token IDs）
- 组装 batch（所有 prompt token 一次性输入）
- 构建计算图 → 算子融合 → 后端执行（GPU forward pass）
- 输出所有位置的 logits，KV cache 被填充
- 归属标注：tokenize（Ollama/llama.cpp 各有实现）→ 计算（GGML）

### Section 5: Decode 阶段

**内容：**
- 从 Prefill 的最后一个 logits 做 sampling → 得到第一个生成 token
- 用该 token 做 decode step：batch size=1 → 计算图 → 仅新 token 的 KV 追加
- Sampling → 流式返回给 CLI 显示
- 循环直到 EOS 或达到 max tokens
- 归属标注：sampling（Go/C++ 各有）→ 计算（GGML）→ 流式输出（Ollama HTTP）

### Section 6: Prefix Cache 命中

**内容：**
- 用户再次输入 "解释量子纠缠"（前缀 "解释量子" 相同）
- KV cache 中匹配已有前缀 → 跳过已计算的 token
- 只从不同的位置开始 prefill 新 token
- 节省的计算量和延迟

**组件：**

4. **InferenceJourney** (StepNavigator, 6 步) — 全链路追踪动画，每步对应上述一个 section。每步内用蓝/橙色标注当前阶段在 Ollama 还是 llama.cpp 中执行，数据跨越边界时明确标注切换点
5. **PrefillVsDecode** (静态) — 左右对比：Prefill（N 个 token 并行处理，宽 batch）vs Decode（1 个 token 串行，窄 batch），标注 Qwen3 的具体参数（hidden_dim, num_heads 等）

### References

- Ollama GitHub: https://github.com/ollama/ollama
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388

---

## 文章 3: GGUF 模型格式

**slug:** `gguf-format`
**difficulty:** intermediate
**tags:** [gguf, llama-cpp, model-format, serialization]
**prerequisites:** [ollama-architecture]

### Section 1: 为什么需要 GGUF

**内容：**
- 格式演进：GGML → GGMF → GGJTv3 → GGUF，每次解决了什么问题
- 为什么不用 safetensors/ONNX：GGUF 内嵌 tokenizer + 模型配置 + prompt template，单文件自包含
- 设计目标：mmap 友好、单文件部署、支持多种量化格式

### Section 2: 文件结构

**内容：**
- Header：magic number (`GGUF`) + version (3) + tensor count + metadata KV count
- Metadata KV 区：类型化的 key-value 对（string, uint32, float32, array 等）
- Tensor Info 区：每个 tensor 的 name, shape, type, offset
- Tensor Data 区：按 alignment 对齐的原始 tensor 数据
- 伪代码展示读取流程

### Section 3: Metadata 系统

**内容：**
- 标准化的 key 命名规范（如 `general.architecture`, `tokenizer.ggml.model`）
- 模型架构信息：层数、hidden size、head 数量等
- Tokenizer 信息：vocab、merges、special tokens
- Prompt template：chat 格式模板
- 自定义 metadata：量化信息、训练参数等

### Section 4: Tensor 存储布局

**内容：**
- Alignment 设计：默认 32 字节对齐，为什么（mmap + SIMD 友好）
- Data types：F32, F16, Q4_0, Q4_K_M 等在文件中的实际存储方式
- 内存映射的工作方式：不把整个文件读到内存，按需访问页面

### Section 5: 双解析器

**内容：**
- llama.cpp 的 C 解析器：原始实现，直接操作内存指针
- Ollama 的 Go 解析器（`fs/gguf/`）：为 ollamarunner 服务，纯 Go 实现
- 为什么要两套：ollamarunner 不走 CGo，需要原生 Go 读取能力
- 差异：Go 版本支持的功能子集

### Section 6: "为什么不一样"

**内容：**
- vs safetensors (HuggingFace)：只存 tensor 数据 + 最小 metadata，模型配置在外部 JSON，需要整个 HF repo
- vs ONNX：计算图 + 权重 + 运行时配置，更复杂但更通用
- GGUF 的 sweet spot：单文件自包含 + mmap 优化 + 内嵌量化支持

**组件：**

6. **GGUFFileStructure** (交互) — GGUF 文件分层结构图，点击各区域展开详情（header 各字段、metadata entries 列表、tensor layout）。标注实际 Qwen3-4B 模型的具体数字（文件大小、tensor 数量、metadata 数量）
7. **GGUFvsOtherFormats** (静态) — GGUF vs safetensors vs ONNX 三列对比：包含内容（tensor/metadata/tokenizer/template/graph）、设计目标、加载方式、文件数量

### References

- GGUF Specification: https://github.com/ggerganov/ggml/blob/master/docs/gguf.md
- Safetensors: https://huggingface.co/docs/safetensors/
- ONNX: https://onnx.ai/

---

## 文章 4: 量化方案

**slug:** `ollama-quantization`
**difficulty:** advanced
**tags:** [quantization, llama-cpp, gguf, inference-optimization]
**prerequisites:** [gguf-format]
**归属：** 主要 llama.cpp (C/C++)，Ollama 提供上层调用入口

### Section 1: 为什么量化

**内容：**
- FP16 模型的显存瓶颈：7B 模型 = ~14GB FP16
- 量化的目标：减显存、减带宽、提速度，同时尽量保持精度
- 三角 trade-off：精度 vs 速度 vs 显存

### Section 2: 基本量化 (Q8_0, Q4_0, Q4_1)

**内容：**
- Per-block 量化设计：每 32 个权重为一组，计算一个 scale（和可选 zero-point）
- Q8_0：8-bit 对称量化，scale only，公式和伪代码
- Q4_0：4-bit 对称量化，更激进的压缩
- Q4_1：4-bit 非对称量化，增加 min value 提升精度
- 量化和反量化的伪代码展示

### Section 3: K-quant 混合精度

**内容：**
- 核心思想：不是所有层对量化同样敏感 — attention 层保高精度，FFN 层降精度
- Q4_K_M：attention Q/K/V 用 Q6_K，FFN 用 Q4_K，M = medium quality
- Q4_K_S：更激进，attention 也用 Q4_K，S = small size
- Q5_K_M, Q5_K_S, Q6_K：不同精度-大小平衡点
- Super-block 结构：嵌套的 block 设计，外层 super-block 管理内层 sub-block 的 scale
- 为什么 K-quant 不需要校准数据（纯统计方法）

### Section 4: I-quant (重要性量化)

**内容：**
- IQ2_XXS, IQ2_XS, IQ3_XXS 等超低比特量化
- Importance matrix：基于权重重要性的非均匀量化
- 码本 (codebook) 设计：预定义的量化值集合，权重映射到最近的码本项
- 极端压缩下的精度保持技巧

### Section 5: 精度-性能-显存 三角

**内容：**
- 各量化方案在 Qwen3-8B 上的实测对比：
  - Perplexity delta（vs FP16 baseline）
  - Tokens/s（CUDA / Metal / CPU）
  - VRAM 占用
- 选型指南：什么场景用什么量化

### Section 6: "为什么不一样"

**内容：**
- vs GPTQ：基于 Hessian 矩阵的 layer-wise 最优量化，需要校准数据集，通常更精确但量化过程慢
- vs AWQ：激活感知量化，保护高激活通道，也需要校准数据
- vs FP8 (TensorRT-LLM)：硬件原生支持的 8-bit 浮点，需要 Hopper+ GPU
- llama.cpp K-quant 的优势：不需要校准数据、支持 CPU、格式紧凑、量化速度快

**组件：**

8. **QuantizationProcess** (StepNavigator, 3 步) —
   - Step 1: FP16 原始权重 block（32 个值）可视化
   - Step 2: 计算 scale = max(abs) / 7，每个值除以 scale 四舍五入
   - Step 3: 存储 INT4 值 + scale，展示反量化结果和误差
9. **KQuantMixedPrecision** (交互) — 一个 Transformer block 的子模块图（Q/K/V proj, O proj, Gate, Up, Down），可切换 K-quant 方案（Q4_K_S / Q4_K_M / Q5_K_M / Q6_K），每个子模块标注分配的精度和 bit 数，底部实时计算总大小
10. **QuantizationTradeoff** (交互) — 可选量化方案（dropdown 或按钮），以 Qwen3-8B 为例实时显示三个指标的柱状图：perplexity delta、tokens/s、VRAM 占用

### References

- llama.cpp Quantization Types: https://github.com/ggerganov/llama.cpp/blob/master/ggml/include/ggml.h
- K-quant PR: https://github.com/ggerganov/llama.cpp/pull/1684
- GPTQ: https://arxiv.org/abs/2210.17323
- AWQ: https://arxiv.org/abs/2306.00978

---

## 文章 5: 计算图与推理引擎

**slug:** `ollama-compute-graph`
**difficulty:** advanced
**tags:** [ggml, compute-graph, inference-engine, operator-fusion]
**prerequisites:** [ollama-quantization]
**归属：** GGML 计算图 = llama.cpp (C/C++)；图构建前端 = ollamarunner (Go) / llamarunner (C++)

### Section 1: GGML 计算图

**内容：**
- GGML 是什么：轻量级 tensor 库，纯 C 实现，为推理设计（非训练）
- 核心概念：ggml_tensor（多维数组 + 类型 + 操作记录）、ggml_context（内存池）、ggml_cgraph（计算图）
- 惰性求值：操作不立即执行，而是记录到图中，最后一次性提交后端执行
- 和 PyTorch 的根本区别：静态图 vs 动态图

### Section 2: 图构建过程

**内容：**
- 以 Qwen3 的一个 Transformer block 为例，图构建的完整过程：
  - input → RMSNorm → Q/K/V Linear → RoPE → Attention → O Linear → Residual → RMSNorm → Gate/Up Linear → SiLU → Down Linear → Residual
- 每个节点是一个 ggml_tensor 操作
- 伪代码展示图构建
- 图的拓扑结构和依赖关系

### Section 3: 算子融合

**内容：**
- 为什么需要融合：减少内核启动开销、减少中间结果的内存读写
- FlashAttention fusion：Q/K/V → 单个融合内核（而非分步 matmul + softmax + matmul）
- RMSNorm + MatMul fusion
- GLU fusion (SiLU(Gate * x) * Up → 单内核)
- 融合的决策逻辑：`graph_optimize()` 中的模式匹配
- 伪代码展示融合前后的图差异

### Section 4: ollamarunner vs llamarunner

**内容：**
- ollamarunner (Go)：
  - 用 Go 代码构建图：`model.Forward(ctx, batch) → tensor`
  - 每个架构有对应的 Go 实现（如 llama、mistral3、gemma3 等）
  - Pipeline 执行：forward 和 compute 可以重叠（async）
- llamarunner (C++)：
  - 用 llama.cpp 的 C API：`llama_decode()` 内部构建图
  - 同步执行
  - 支持 ~120+ 架构（更广泛的兼容性）
- 两者最终都提交给同一个 GGML 后端执行

### Section 5: 后端调度

**内容：**
- GGML scheduler：接收计算图 → 决定每个 tensor 在哪个设备上计算
- 设备分配逻辑：前 N 层在 GPU，剩余在 CPU（根据显存预算）
- 跨设备数据传输：GPU 和 CPU 之间的 tensor 搬运
- Multi-GPU 支持：多 GPU 之间的 tensor 分片

### Section 6: "为什么不一样"

**内容：**
- vs PyTorch：动态图 eager execution，灵活但开销大；GGML 静态图更轻量
- vs TensorRT：静态图 + 编译优化，最高性能但需要离线编译步骤；GGML 无编译步骤，图在运行时构建
- vs ONNX Runtime：通用图格式 + 后端优化；GGML 专注推理、更轻量
- GGML 的 sweet spot：零编译开销 + 运行时图优化 + 多后端

**组件：**

11. **GGMLGraphBuilder** (StepNavigator, 4 步) —
    - Step 1: 空图 + 输入 tensor（标注 shape）
    - Step 2: 添加 RMSNorm + QKV projection 节点
    - Step 3: 添加 RoPE + Attention + Output projection 节点
    - Step 4: 添加 FFN 节点（Gate/Up/Down + 激活函数）→ 完整 block 图
12. **OperatorFusion** (交互) — 左右对比：左边未融合的节点序列（10+ 节点），右边融合后的版本（更少节点），可 toggle 不同融合策略（FlashAttention / RMSNorm+MatMul / GLU），标注每种融合节省的内核调用次数
13. **DualRunnerComparison** (静态) — 并列架构图：左蓝色 ollamarunner（Go 图构建 → pipeline async → GGML）、右橙色 llamarunner（C++ 图构建 → sync → GGML），底部汇聚到共享的 GGML backend

### References

- GGML: https://github.com/ggerganov/ggml
- llama.cpp: https://github.com/ggerganov/llama.cpp

---

## 文章 6: KV Cache 与 Batch 调度

**slug:** `ollama-kv-cache-scheduling`
**difficulty:** advanced
**tags:** [kv-cache, batch-scheduling, continuous-batching, prefix-cache]
**prerequisites:** [ollama-compute-graph, kv-cache]
**归属：** 两边都有实现 — ollamarunner (Go) 和 llamarunner (C++) 各自管理 KV cache

### Section 1: llama.cpp 的 KV Cache 实现

**内容：**
- Slot-based 管理：预分配固定大小的 KV cache，分成多个 slot
- 每个 slot 对应一个并发请求的 KV 状态
- 内存布局：连续内存块，每个 slot 占固定的 token 容量
- 和 Transformer Core 路径中 KV Cache 概念文章的关联（基础概念不重复）

### Section 2: Ollama 的 Go KV Cache

**内容：**
- `kvcache/` 包：统一接口，两种实现
- Causal cache：标准 Transformer 模型的 KV 缓存
- Recurrent cache：Mamba/RWKV 等循环模型的状态缓存
- 为什么 Ollama 重新实现：ollamarunner 不经过 llama.cpp，需要原生 Go 管理

### Section 3: Prefix Cache / Prompt Cache

**内容：**
- 工作原理：hash prompt token 序列 → 在已有 KV cache 中查找最长前缀匹配
- 匹配后：只需从不匹配位置开始做 prefill，前面的 KV 直接复用
- 典型场景：system prompt 复用、多轮对话的历史复用
- 伪代码展示匹配逻辑

### Section 4: Continuous Batching

**内容：**
- 传统 static batching 的问题：所有请求等最长的完成才能开始新 batch
- Continuous batching：请求完成就移出 batch，新请求立即插入
- Ollama 中的实现：runner 内部管理 batch 组装，动态调整 batch 大小
- Prefill 和 decode 的混合 batch：新请求做 prefill，已有请求继续 decode

### Section 5: 上下文管理

**内容：**
- 最大上下文长度限制：模型训练时的 max_position 和 KV cache 内存限制
- Context shifting：当 KV cache 满了，丢弃最早的部分 token，窗口滑动
- 长对话的处理策略：Ollama 如何决定保留哪些上下文

### Section 6: "为什么不一样"

**内容：**
- vs vLLM PagedAttention：虚拟内存分页管理 KV cache，可以不连续存储，减少碎片
- llama.cpp 用连续内存 slot：更简单，但可能浪费空间（slot 大小固定）
- Trade-off：PagedAttention 更高效利用显存，但实现复杂度更高
- 各自适用场景：PagedAttention 适合大规模并发服务，llama.cpp slot 适合少量并发本地部署

**组件：**

14. **KVCacheSlotManager** (交互) — 可视化 KV cache 内存条：分成多个 slot（不同颜色代表不同请求），可添加新请求（分配 slot）、完成请求（释放 slot），实时显示内存利用率和碎片
15. **PrefixCacheHit** (StepNavigator, 3 步) —
    - Step 1: 首次请求 "解释量子计算"，完整 prefill，KV cache 被填充
    - Step 2: 新请求 "解释量子纠缠" 到来，hash 匹配找到前缀 "解释量子"
    - Step 3: 只 prefill "纠缠" 部分，前缀 KV 直接复用，标注节省的计算量
16. **ContinuousBatchingTimeline** (交互) — 时间线动画：多个请求的 prefill/decode 阶段用蓝/绿色条表示，可添加新请求，展示 batch 动态变化。对比 static batching（灰色虚线）vs continuous batching（实际时间线）

### References

- vLLM PagedAttention: https://arxiv.org/abs/2309.06180
- Ollama GitHub: https://github.com/ollama/ollama

---

## 文章 7: 硬件后端

**slug:** `ollama-hardware-backends`
**difficulty:** advanced
**tags:** [ggml, cuda, metal, vulkan, hardware-backend]
**prerequisites:** [ollama-compute-graph]
**归属：** 主要 llama.cpp / GGML (C/C++)

### Section 1: 多后端架构

**内容：**
- GGML backend 抽象层：统一的 `ggml_backend` 接口，屏蔽硬件差异
- 一套计算图 → 多后端执行：编译时选择包含哪些后端，运行时自动检测可用设备
- 为什么能单二进制多后端：条件编译 + 运行时分派
- 后端注册和优先级机制

### Section 2: CUDA 后端

**内容：**
- 关键内核：quantized matmul（不解量化直接计算）、FlashAttention、RoPE、RMSNorm
- 显存管理：buffer pool、内存复用策略
- Stream 调度：计算流和数据传输流的重叠
- Tensor Core 利用：FP16 matmul 加速

### Section 3: Metal 后端

**内容：**
- Apple Silicon 统一内存优势：CPU 和 GPU 共享同一物理内存，无需 PCIe 传输
- Metal shader 实现：compute pipeline、threadgroup 配置
- 和 CUDA 后端的差异：线程模型、内存模型、可用优化
- 为什么 Mac 上的 llama.cpp 性能出乎意料地好

### Section 4: Vulkan 后端

**内容：**
- 跨平台 GPU 计算：Windows / Linux / Android，不依赖 CUDA
- Compute shader 实现：SPIR-V 编译、descriptor set 管理
- 和 CUDA/Metal 的性能差距及原因：生态成熟度、优化深度
- 适用场景：非 NVIDIA GPU (AMD, Intel)

### Section 5: CPU 后端

**内容：**
- SIMD 优化：AVX2 / AVX-512 / ARM NEON 的自动检测和分派
- 为什么 llama.cpp 的 CPU 推理比其他框架快：quantized matmul 直接用 SIMD 处理 INT4/INT8
- 多线程调度：OpenMP / pthread，线程数对性能的影响
- 在无 GPU 环境下的可用性

### Section 6: 设备分割

**内容：**
- 模型太大放不进单 GPU：layer offloading 策略
- GPU/CPU split：前 N 层在 GPU，剩余在 CPU
- 分割点的选择：GGML scheduler 根据显存预算自动决定
- 跨设备的性能损失：PCIe 带宽瓶颈
- 伪代码展示分割逻辑

### Section 7: "为什么不一样"

**内容：**
- vs vLLM / TensorRT-LLM：CUDA only，最大化 NVIDIA GPU 性能但无法跨平台
- llama.cpp 是唯一同时支持 CUDA + Metal + Vulkan + CPU 的主流推理引擎
- Trade-off：每个后端都不是"最优"实现，但覆盖面最广

**组件：**

17. **BackendArchitecture** (交互) — 上方是统一的 GGML 计算图，下方分叉为 4 个后端（CUDA/Metal/Vulkan/CPU），点击各后端展开关键特性和适用场景。颜色区分：全部橙色系（都属于 llama.cpp/GGML）
18. **DeviceSplitVisualizer** (交互) — 可调 GPU VRAM 大小 (slider, 4-24 GB)，输入模型大小，展示 Transformer 各层的分配：GPU 层（绿色）vs CPU 层（灰色），实时标注预估 tokens/s 的影响
19. **BackendPerformanceCompare** (静态) — 柱状图，同一模型（Qwen3-8B Q4_K_M）在 4 个后端的 tokens/s 对比，标注各自的硬件条件和瓶颈因素

### References

- GGML Backend API: https://github.com/ggerganov/ggml
- CUDA Programming Guide: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- Metal Shading Language: https://developer.apple.com/metal/
- Vulkan Compute: https://www.khronos.org/vulkan/

---

## 文章 8: 服务层与调度

**slug:** `ollama-server-scheduling`
**difficulty:** advanced
**tags:** [ollama, scheduler, runner, model-management]
**prerequisites:** [ollama-architecture, ollama-kv-cache-scheduling]
**归属：** 全部 Ollama (Go)

### Section 1: Ollama Server 架构

**内容：**
- Gin HTTP server：路由结构、中间件、请求处理流程
- 主要 API 端点：`/api/chat`, `/api/generate`, `/api/embeddings`, `/api/pull`, `/api/create`
- OpenAI 兼容层：`/v1/chat/completions` 的转译
- 请求-响应的完整路径

### Section 2: Scheduler 调度器

**内容：**
- 调度器的职责：管理哪些模型当前加载、请求排队、资源分配
- 请求队列：先到先服务 + 模型亲和性（已加载的模型优先）
- 并发控制：`OLLAMA_NUM_PARALLEL` 参数，限制同一模型的并发请求数
- 多模型调度：不同请求需要不同模型时的调度策略

### Section 3: Runner 生命周期

**内容：**
- 5 个状态：Idle → Loading → Ready → Busy → Unloading
- 启动：Scheduler 决定加载模型 → 启动 runner 子进程 → 健康检查
- 服务：接收推理请求 → 返回结果
- 空闲超时：`OLLAMA_KEEP_ALIVE`（默认 5 分钟）→ 超时卸载释放资源
- 错误处理：runner crash → 重启策略
- 伪代码展示状态机

### Section 4: 模型热加载/卸载

**内容：**
- 多模型并存场景：用户先用 llama3，再用 qwen3
- 内存预算检查：加载新模型前，检查 GPU + CPU 是否有足够空间
- LRU 淘汰：空间不足时，卸载最久未使用的模型
- 预加载优化：常用模型保持 warm 状态

### Section 5: 内存管理

**内容：**
- 双层内存预算：GPU VRAM + 系统 RAM
- 模型内存估算：根据 GGUF metadata 计算模型大小 + KV cache 大小 + scratch buffer
- Fit check：加载前验证是否放得下，放不下则降级（减少 GPU 层数，更多 offload 到 CPU）
- `OLLAMA_GPU_OVERHEAD` 等配置参数

### Section 6: "为什么不一样"

**内容：**
- vs vLLM：单进程 Python，模型常驻显存，面向服务器 24/7 运行
- vs TGI：类似的服务层，但 Python + Rust 混合
- Ollama 的独特设计：多进程（主进程 + runner 子进程）、动态加载/卸载、面向桌面/边缘的资源管理
- 多进程的优势：runner 崩溃不影响主进程、不同模型可以用不同引擎

**组件：**

20. **RunnerLifecycle** (StepNavigator, 5 步) —
    - Step 1: Idle — 无 runner，等待请求
    - Step 2: Loading — Scheduler 触发加载，启动子进程，mmap GGUF
    - Step 3: Ready — 健康检查通过，等待推理请求
    - Step 4: Busy — 处理推理请求，KV cache 活跃
    - Step 5: Unloading — 空闲超时，释放 GPU 显存，终止子进程
    每步标注资源占用变化（显存、内存、CPU）
21. **MemoryBudgetCalculator** (交互) — 输入 GPU VRAM (slider) + 系统 RAM (slider)，选择模型列表（checkboxes），实时计算：每个模型的显存需求、KV cache 需求、哪些在 GPU / CPU / 排队，总占用柱状图
22. **MultiModelScheduler** (交互) — 时间线动画：模拟 3 个用户请求不同模型（llama3 → qwen3 → llama3），展示 scheduler 的决策过程：加载、卸载、复用、排队。标注每个决策的原因

### References

- Ollama GitHub: https://github.com/ollama/ollama
- Ollama FAQ: https://github.com/ollama/ollama/blob/main/docs/faq.md

---

## 文章 9: 模型生态

**slug:** `ollama-model-ecosystem`
**difficulty:** intermediate
**tags:** [ollama, registry, modelfile, lora, multimodal]
**prerequisites:** [ollama-architecture, gguf-format]
**归属：** 全部 Ollama (Go)，部分涉及 llama.cpp 模型架构支持

### Section 1: Ollama Registry

**内容：**
- 类 Docker Registry 的设计：模型名 = `library/model:tag`
- Manifest：模型的描述文件，指向多个 layer（GGUF 权重、license、template 等）
- Layer 存储：content-addressable（SHA256 hash），blob 存储
- 拉取流程：resolve manifest → 检查本地 blob → 下载缺失 layer

### Section 2: Layer 去重与增量更新

**内容：**
- 同一 base model 不同量化版本共享大部分 layer（如 tokenizer、template）
- 模型更新时只下载变化的 layer
- 本地存储的 blob 去重：不同模型共享相同的 layer blob
- 对比 Docker image layer 的类似设计

### Section 3: Modelfile

**内容：**
- 语法概览：FROM, PARAMETER, TEMPLATE, SYSTEM, ADAPTER, LICENSE
- FROM：基于已有模型创建定制版本（类比 Dockerfile 的 FROM）
- PARAMETER：设置 temperature, top_p, num_ctx 等推理参数
- TEMPLATE：定义 chat prompt 格式
- SYSTEM：设置 system prompt
- 模型继承链：FROM → 参数覆盖 → 创建新模型

### Section 4: Prompt Template 系统

**内容：**
- Go template 引擎：`{{ .System }}`, `{{ .Prompt }}`, `{{ range .Messages }}` 等
- Chat 格式自动化：不同模型的不同格式（ChatML、Llama、Mistral 等）
- Template 存储在 GGUF metadata 中（`tokenizer.chat_template`）或 Modelfile 中覆盖
- 为什么 template 很重要：错误的 format 导致模型输出质量大幅下降

### Section 5: LoRA / Adapter 支持

**内容：**
- ADAPTER 指令：在 Modelfile 中指定 LoRA 权重文件
- 加载机制：base model + LoRA 权重合并（可以在加载时合并，也可以在推理时动态应用）
- 多 adapter 切换：Ollama 如何管理不同定制版本
- 限制：目前的支持程度和已知限制

### Section 6: 多模态支持

**内容：**
- 图像输入处理流程：图像文件 → 预处理（resize, normalize）→ vision encoder → image embedding
- Vision encoder 的执行：在 GGML 后端运行（和文本模型共用基础设施）
- Image token 注入：embedding 插入到 text token 序列中的对应位置
- 支持的多模态架构：LLaVA, Qwen-VL 等
- 归属标注：图像预处理（Go/Ollama）→ vision encoder（GGML/llama.cpp）

### Section 7: 新架构支持

**内容：**
- `model.Model` 接口：定义 `Forward()` 方法
- 添加新架构的步骤概述：实现接口 → 注册 → GGUF metadata 识别
- ollamarunner (~21 架构) vs llamarunner (~120+ 架构) 的差距和追赶
- 社区贡献模式

**组件：**

23. **RegistryPullFlow** (StepNavigator, 4 步) —
    - Step 1: `ollama pull qwen3` → 解析模型名，请求 Registry API
    - Step 2: 获取 manifest — 包含 layers 列表（GGUF 权重、tokenizer、template、license）
    - Step 3: 检查本地 blob 缓存 — 已有的 layer 跳过（标注节省的下载量）
    - Step 4: 下载缺失 layer → 存入本地 blob store → 验证 SHA256
24. **ModelfileBuilder** (交互) — 左侧选择/输入 Modelfile 指令（FROM model 选择、PARAMETER 滑块、TEMPLATE 编辑、SYSTEM 文本框），右侧实时预览生成的 Modelfile 文本和最终的 prompt 渲染效果
25. **MultimodalPipeline** (静态) — 数据流图：图像（蓝色/Ollama 预处理）→ Vision Encoder（橙色/GGML）→ Image Embedding → 合并到 Text Token Sequence → Transformer Decoder（橙色/GGML）→ 输出文本

### References

- Ollama Modelfile: https://github.com/ollama/ollama/blob/main/docs/modelfile.md
- Ollama API: https://github.com/ollama/ollama/blob/main/docs/api.md
- LLaVA: https://arxiv.org/abs/2304.08485

---

## 组件清单

| # | 组件名 | 类型 | 文章 | 归属色 |
|---|--------|------|------|--------|
| 1 | OllamaArchitectureOverview | 交互 | 架构总览 | 蓝+橙 |
| 2 | DualEngineSelector | 交互 | 架构总览 | 蓝+橙 |
| 3 | FrameworkComparison | 交互 | 架构总览 | 蓝+橙 |
| 4 | InferenceJourney | StepNavigator (6步) | 推理旅程 | 蓝+橙 |
| 5 | PrefillVsDecode | 静态 | 推理旅程 | 蓝+橙 |
| 6 | GGUFFileStructure | 交互 | GGUF 格式 | 橙 |
| 7 | GGUFvsOtherFormats | 静态 | GGUF 格式 | 橙 |
| 8 | QuantizationProcess | StepNavigator (3步) | 量化方案 | 橙 |
| 9 | KQuantMixedPrecision | 交互 | 量化方案 | 橙 |
| 10 | QuantizationTradeoff | 交互 | 量化方案 | 橙 |
| 11 | GGMLGraphBuilder | StepNavigator (4步) | 计算图 | 橙 |
| 12 | OperatorFusion | 交互 | 计算图 | 橙 |
| 13 | DualRunnerComparison | 静态 | 计算图 | 蓝+橙 |
| 14 | KVCacheSlotManager | 交互 | KV Cache | 蓝+橙 |
| 15 | PrefixCacheHit | StepNavigator (3步) | KV Cache | 蓝+橙 |
| 16 | ContinuousBatchingTimeline | 交互 | KV Cache | 蓝+橙 |
| 17 | BackendArchitecture | 交互 | 硬件后端 | 橙 |
| 18 | DeviceSplitVisualizer | 交互 | 硬件后端 | 橙 |
| 19 | BackendPerformanceCompare | 静态 | 硬件后端 | 橙 |
| 20 | RunnerLifecycle | StepNavigator (5步) | 服务层 | 蓝 |
| 21 | MemoryBudgetCalculator | 交互 | 服务层 | 蓝 |
| 22 | MultiModelScheduler | 交互 | 服务层 | 蓝 |
| 23 | RegistryPullFlow | StepNavigator (4步) | 模型生态 | 蓝 |
| 24 | ModelfileBuilder | 交互 | 模型生态 | 蓝 |
| 25 | MultimodalPipeline | 静态 | 模型生态 | 蓝+橙 |

**总计：25 个组件（13 交互 + 6 StepNavigator + 6 静态）**
