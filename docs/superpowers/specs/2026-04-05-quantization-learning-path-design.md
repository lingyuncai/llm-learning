# Quantization Learning Path — Design Spec

**Date:** 2026-04-05
**Status:** Draft
**Scope:** 4 new articles + 1 rename/expand + 1 learning path YAML + 16 new components

## Overview

新建「量化（Quantization）」学习路径，涵盖 LLM 量化从理论基础到工程实践的完整知识体系。路径包含 5 篇文章，从 intermediate 到 advanced 递进，配合 16 个交互/静态组件提供原理性示意图。

现有 `ollama-quantization.mdx` 重命名为 `llama-cpp-quantization`，同时出现在 ollama-internals 和新量化路径中。

## Learning Path Definition

```yaml
id: quantization
title:
  zh: "LLM 量化技术"
  en: "LLM Quantization Techniques"
description:
  zh: "从数据类型基础到前沿量化算法，系统掌握 LLM 权重量化、KV Cache 量化和推理时量化的理论与实践"
  en: "From data type fundamentals to cutting-edge quantization algorithms — weight quantization, KV cache quantization, and inference-time quantization"
level: intermediate
articles:
  - quantization-fundamentals
  - ptq-weight-quantization
  - quantization-aware-training
  - inference-time-quantization
  - llama-cpp-quantization
```

## Design Decisions

1. **混合难度**: 文章 1 intermediate（入门友好），文章 2-5 advanced（假设读者已掌握基础）
2. **组件侧重原理示意**: 每个组件都要传达一个核心概念的直觉，不是数据展示表格
3. **llama.cpp 文章跨两个路径**: 通过 slug 引用出现在 quantization 和 ollama-internals 两个学习路径中
4. **重命名而非新建**: `ollama-quantization` → `llama-cpp-quantization`，因为文章内容本就是 llama.cpp 视角，与 Ollama 无直接关系
5. **KV Cache 量化独立于 ollama-internals**: KV Cache 量化是通用量化话题，不是 llama.cpp 特有实现，llama.cpp 文章仅简短提及并链接

## Rename: ollama-quantization → llama-cpp-quantization

**涉及改动：**
- `src/content/articles/zh/ollama-quantization.mdx` → `src/content/articles/zh/llama-cpp-quantization.mdx`
- frontmatter: `slug: "ollama-quantization"` → `slug: "llama-cpp-quantization"`
- frontmatter: `title: "量化方案"` → `title: "llama.cpp 量化方案"`
- `src/content/paths/ollama-internals.yaml`: `ollama-quantization` → `llama-cpp-quantization`
- `src/content/articles/zh/ollama-compute-graph.mdx`: prerequisites 中 `ollama-quantization` → `llama-cpp-quantization`
- 注意：`docs/superpowers/` 下的 design spec 和 plan 文档中的引用保持原样（历史记录）

---

## Article 1: 量化基础

- **slug:** `quantization-fundamentals`
- **difficulty:** intermediate
- **tags:** `["quantization", "data-types", "mixed-precision", "inference-optimization"]`
- **prerequisites:** none
- **references:** (实现时搜索验证)
  - "A Survey of Quantization Methods for Efficient Neural Network Inference" (https://arxiv.org/abs/2103.13630)
  - "Integer Quantization for Deep Learning Inference: Principles and Empirical Evaluation" (https://arxiv.org/abs/2004.09602)

### Content Structure

#### 1. 数据类型全景
FP32/FP16/BF16/INT8/INT4/FP8 (E4M3/E5M2) 的 bit 布局。每种类型的表示范围（dynamic range）和精度（precision）。关键对比：FP16 vs BF16（BF16 牺牲 mantissa 精度换取与 FP32 相同的 exponent 范围）。FP8 的两种格式分工。

#### 2. 量化的数学本质
将连续浮点值映射到离散整数的过程。公式：
$$q = \text{clip}\left(\text{round}\left(\frac{x}{s}\right) + z, \; q_{\min}, \; q_{\max}\right)$$
其中 $s$ 是 scale factor，$z$ 是 zero-point。反量化：$\hat{x} = s \cdot (q - z)$。量化误差的来源：rounding error + clipping error。

#### 3. 对称 vs 非对称量化
- 对称：$z = 0$，$s = \max(|x|) / q_{\max}$，映射关于零对称
- 非对称：$z \neq 0$，$s = (\max(x) - \min(x)) / (q_{\max} - q_{\min})$，映射可偏移
- 何时用哪种：权重通常近似对称（用对称），activation 常有偏移（用非对称）

#### 4. 量化粒度
per-tensor → per-channel → per-group → per-block 的递进。粒度越细，每组权重有独立的 scale/zero-point，量化误差越小，但 metadata 存储开销增大。llama.cpp 的 block size = 32 是精度与开销的经验折衷。

#### 5. 反量化 vs 原生低精度计算
关键区分，两条硬件路径：
- **Dequant 路径**：存储 INT4/INT8 → 推理时 dequant to FP16 → FP16 GEMM → FP16 output。大多数 CPU 和老 GPU 走这条路。优点是兼容性好，缺点是 dequant 有开销。
- **原生低精度路径**：INT8 weight × INT8 activation → INT32 accumulate → FP16 output。NVIDIA Tensor Core (INT8/FP8)、Apple ANE、Intel VNNI/AMX 支持。无需 dequant，吞吐量翻倍。
- 关键点：量化的收益不仅是"存储变小"，在有原生支持的硬件上还能直接加速计算。

#### 6. 混合精度实践
真实部署中不同层/不同操作用不同精度。典型配置：Embedding FP16/FP32（词表查找不是瓶颈）、Attention QKV projection INT8、Attention score computation FP16（softmax 对精度敏感）、FFN weight INT4/INT8、LayerNorm FP32。决策依据：每层对量化误差的敏感度不同，通过 sensitivity analysis 确定。

#### 7. PTQ vs QAT 概览
两条路线的总览图，为后续文章做铺垫：
- PTQ：训练后直接量化，不改模型。包括 round-to-nearest、GPTQ、AWQ、SmoothQuant。
- QAT：训练时模拟量化，模型学会适应低精度。包括 fake quant + STE、LoRA-QAT、BitNet。

### Components (4)

#### DataTypeBitLayout
- **文件:** `src/components/interactive/DataTypeBitLayout.tsx`
- **类型:** 交互（useState, client:visible）
- **交互:** 点击/选择不同数据类型（FP32, FP16, BF16, INT8, INT4, FP8-E4M3, FP8-E5M2）
- **视觉:** 横向 bit 方格，sign bit 红色，exponent bits 蓝色，mantissa bits 绿色。下方显示：表示范围、精度、一个示例值的编码过程。切换类型时动画过渡 bit 数量变化。BF16 vs FP16 对比时高亮 exponent 位数差异。
- **SVG viewBox:** `0 0 580 320`

#### QuantizationMapping
- **文件:** `src/components/interactive/QuantizationMapping.tsx`
- **类型:** StepNavigator（4 步）
- **步骤:**
  1. 原始 FP16 权重分布（钟形曲线 + 散点）
  2. 计算 scale/zero-point，画出量化网格线（水平虚线表示整数级别）
  3. 每个权重 snap 到最近的网格线（动画），显示 rounding
  4. 反量化还原 + 误差可视化（原始值 vs 还原值的差，红色标注大误差点）
- **额外交互:** 顶部切换按钮：对称 / 非对称模式，影响步骤 2 的网格布局
- **SVG viewBox:** `0 0 580 400`

#### GranularityCompare
- **文件:** `src/components/interactive/GranularityCompare.tsx`
- **类型:** 交互（useState, client:visible）
- **交互:** 三栏并排：per-tensor / per-channel / per-group。每栏显示同一组权重矩阵（8×8）的量化结果热力图（颜色 = 量化误差大小）。底部滑块控制 group size（2/4/8/16/32）。每栏下方显示 MSE（均方误差）数值。
- **视觉:** 矩阵格子，每个格子颜色编码误差：绿 = 低误差，黄 = 中等，红 = 高误差。per-tensor 明显更红（误差大），per-group 最绿。
- **SVG viewBox:** `0 0 580 350`

#### HardwareComputePath
- **文件:** `src/components/interactive/HardwareComputePath.tsx`
- **类型:** 静态 SVG（无 client:visible）
- **视觉:** 左右两条纵向数据流管道：
  - 左："Dequant 路径" — INT4 weight box → "dequant" 箭头 → FP16 box → "FP16 GEMM" → FP16 output。旁注：CPU, 老 GPU, Metal
  - 右："原生低精度路径" — INT8 weight box + INT8 activation box → "INT8 GEMM (Tensor Core)" → INT32 accumulate → FP16 output。旁注：H100, A100, Apple ANE, Intel AMX
- **颜色:** 左路径用 COLORS.mid（灰色调，表示兼容但非最优），右路径用 COLORS.primary（蓝色调，表示原生加速）
- **SVG viewBox:** `0 0 580 380`

---

## Article 2: PTQ 权重量化方法

- **slug:** `ptq-weight-quantization`
- **difficulty:** advanced
- **tags:** `["quantization", "ptq", "gptq", "awq", "smoothquant"]`
- **prerequisites:** `["quantization-fundamentals"]`
- **references:**
  - "GPTQ: Accurate Post-Training Quantization for Generative Pre-Trained Transformers" (https://arxiv.org/abs/2210.17323)
  - "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration" (https://arxiv.org/abs/2306.00978)
  - "SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models" (https://arxiv.org/abs/2211.10438)

### Content Structure

#### 1. Round-to-Nearest 的局限
最朴素的 PTQ：对每个权重直接 round 到最近的量化级别。在 8-bit 时 perplexity 增加 < 0.1，可接受。但在 4-bit 时 perplexity 崩溃（增加 > 1.0），因为 rounding error 累积效应在低 bit-width 时被放大。引出核心问题：如何在不重新训练的前提下，减小量化误差？

#### 2. GPTQ — Hessian 误差补偿
**背景:** OBQ (Optimal Brain Quantization) 的思路 — 利用 Hessian 矩阵的二阶信息指导量化。GPTQ 是 OBQ 的高效版本。

**核心算法:**
- 逐列（column-wise）量化权重矩阵 $W$
- 量化第 $i$ 列时，计算量化误差 $\delta_i = w_i - \text{quant}(w_i)$
- 利用 Hessian 逆矩阵 $H^{-1}$ 将误差分散到尚未量化的列：$W_{:, i+1:} \mathrel{+}= \delta_i \cdot (H^{-1})_{i, i+1:} / (H^{-1})_{i,i}$
- 关键优化：lazy batch updates（每 128 列批量更新一次，减少内存访问）

**校准:** 128-512 个文本样本的前向传播，用于估计 Hessian 矩阵。

**实践:** AutoGPTQ 库、量化一个 7B 模型约 5-10 分钟（单 GPU）、支持 2/3/4/8 bit。

#### 3. AWQ — 激活感知量化
**核心观察:** 不是所有权重同等重要。1% 的 "salient channels"（与大 activation 值相乘的权重列）贡献了大部分输出。保护这些 channel 可以显著降低量化误差。

**方法:**
- 用少量校准数据的前向传播，统计每个 channel 的 activation magnitude
- 对 salient channels 应用 per-channel scaling：$s_j$ 放大重要 channel 的权重（使量化粒度更细），同时缩小对应 activation（保持数学等价：$Y = XW = (X \cdot \text{diag}(s)^{-1}) \cdot (\text{diag}(s) \cdot W)$）
- 搜索最优 $s$ 使得量化后输出误差最小

**与 GPTQ 的区别:** GPTQ 在量化过程中修改未量化权重来补偿误差（"事后补救"），AWQ 在量化前调整权重分布使其更易量化（"事前预防"）。两者可以组合使用。

#### 4. SmoothQuant — 平滑激活
**问题:** W8A8（weight 8-bit + activation 8-bit）是推理加速的理想目标（INT8 Tensor Core），但 activation 的 outlier channels 使 activation 量化困难。某些 channel 的值域达到 [-100, 100]，而其他 channel 在 [-1, 1]，per-tensor 量化会把正常值的精度压垮。

**核心思想:** 将 activation 的量化困难"平滑"转移到 weight 侧：
$$Y = (X \cdot \text{diag}(s)^{-1}) \cdot (\text{diag}(s) \cdot W)$$
其中 $s_j = \max(|X_j|)^\alpha / \max(|W_j|)^{1-\alpha}$，$\alpha \in [0, 1]$ 控制平滑程度。

**效果:** 平滑后 activation 的 channel 间动态范围差异大幅减小，per-tensor INT8 量化变得可行。Weight 侧的动态范围略增，但 weight 本身分布更规律，容易吸收。

**实践:** $\alpha = 0.5$ 是大多数模型的合理默认值。SmoothQuant 是目前 W8A8 部署的标准方案，被 TensorRT-LLM、vLLM 等广泛采用。

#### 5. 方法对比与选型
全维度对比表：校准需求、量化时间、支持 bit-width、典型 perplexity（以 Llama 2 7B 为例）、推理速度、支持框架/硬件。选型建议：
- W4A16（weight 4-bit, activation FP16）：GPTQ 或 AWQ，适合显存受限场景
- W8A8：SmoothQuant，适合有 INT8 Tensor Core 的硬件
- 极致压缩（2-3 bit）：GPTQ + grouping，但 QAT 可能更好

### Components (4)

#### GPTQErrorPropagation
- **文件:** `src/components/interactive/GPTQErrorPropagation.tsx`
- **类型:** StepNavigator（5 步）
- **步骤:**
  1. 显示 4×4 权重矩阵（FP16 值），标注 Hessian 矩阵 $H^{-1}$
  2. 量化第 1 列：值 snap 到量化级别，计算误差 $\delta_1$（红色标注）
  3. 误差传播：箭头从第 1 列指向第 2-4 列，补偿值叠加到未量化列（绿色 + 值）
  4. 量化第 2 列：重复过程，误差继续传播到第 3-4 列
  5. 全部完成：显示最终量化矩阵 vs 原始矩阵的总误差（MSE），与 round-to-nearest 的 MSE 对比
- **视觉:** 矩阵格子，已量化列灰色背景，当前列黄色高亮，箭头动画表示误差传播
- **SVG viewBox:** `0 0 580 400`

#### AWQSalientChannels
- **文件:** `src/components/interactive/AWQSalientChannels.tsx`
- **类型:** 交互（useState, client:visible）
- **交互:** 左侧：activation 矩阵热力图（8×8），颜色深度表示 magnitude，1% salient channels 高亮边框。右侧：对应权重列的 scaling 前后分布对比（柱状图）。点击不同 channel 查看该 channel 的 activation 统计和 scale factor $s_j$ 的效果。底部显示：量化误差（scaling 前 vs 后）。
- **SVG viewBox:** `0 0 580 380`

#### SmoothQuantTransform
- **文件:** `src/components/interactive/SmoothQuantTransform.tsx`
- **类型:** StepNavigator（4 步）
- **步骤:**
  1. 原始 activation 矩阵，颜色编码 per-channel 动态范围（outlier channels 鲜红）
  2. 计算平滑因子 $s_j$，显示公式和每个 channel 的 $s_j$ 值
  3. 平滑后：activation $X' = X \cdot \text{diag}(s)^{-1}$（outlier 消失，颜色趋均匀）；weight $W' = \text{diag}(s) \cdot W$（略微变化）
  4. 验证：$X' \cdot W' = X \cdot W$（数值相等），标注平滑后 activation 和 weight 都可以用 INT8 per-tensor 量化
- **SVG viewBox:** `0 0 580 400`

#### PTQMethodComparison
- **文件:** `src/components/interactive/PTQMethodComparison.tsx`
- **类型:** 交互（useState, client:visible）
- **交互:** 表格布局，行 = 方法（RTN / GPTQ / AWQ / SmoothQuant），列 = 维度。hover 单元格展开该方法在该维度的详细说明。顶部按钮可按不同维度排序。
- **维度:** 校准样本数、量化时间、支持 bit-width、Llama2-7B perplexity (4-bit)、推理框架支持、目标场景
- **SVG viewBox:** `0 0 580 350`

---

## Article 3: QAT 量化感知训练

- **slug:** `quantization-aware-training`
- **difficulty:** advanced
- **tags:** `["quantization", "qat", "ste", "lora-qat", "bitnet"]`
- **prerequisites:** `["quantization-fundamentals"]`
- **references:**
  - "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference" (https://arxiv.org/abs/1712.05877)
  - "QLoRA: Efficient Finetuning of Quantized LLMs" (https://arxiv.org/abs/2305.14314)
  - "The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits" (https://arxiv.org/abs/2402.17764)
  - "BitNet: Scaling 1-bit Transformers for Large Language Models" (https://arxiv.org/abs/2310.11453)

### Content Structure

#### 1. QAT 的核心思想
在前向传播中插入 fake quantization 节点模拟量化误差，反向传播时用 STE（Straight-Through Estimator）绕过不可导的 round 操作，让模型"适应"低精度。与 PTQ 的本质区别：PTQ 是固定权重后量化（误差只能缩小不能消除），QAT 是在量化约束下优化权重（模型主动学习应对误差）。

#### 2. 伪量化节点与 STE
fake quant 的位置：weight 之后、activation 之后。前向传播中 fake quant 执行完整的 quant→dequant 过程，引入量化噪声但保持 FP32 计算图。STE 的定义：前向 $y = \text{round}(x)$，反向 $\frac{\partial y}{\partial x} = 1$（假装 round 不存在）。直觉："梯度穿过 round 操作，就像穿过一扇玻璃门"。STE 为什么有效：虽然数学上不精确，但在实践中梯度的方向信息大致正确，足以指导优化。

#### 3. LoRA-QAT
全量 QAT 的成本问题：需要完整的训练数据和计算资源，对于 7B+ 模型不现实。LoRA-QAT 的思路：冻结量化后的低精度权重，只训练低秩适配器 (LoRA) 来补偿量化损失。训练量级：几千步，几个小时，消费级 GPU。

QLoRA 的区分：QLoRA 是 "量化基座模型 + LoRA 微调"，目的是省显存做 fine-tuning，不是为了改善量化质量。LoRA-QAT 是 "用 LoRA 补偿量化损失"，目的是用低成本获得接近 QAT 的量化质量。

#### 4. BitNet — 极端量化
BitNet b1.58 的设计：三值权重 {-1, 0, 1}，1.58 bits per weight ($\log_2 3 \approx 1.58$)。训练方法：从头训练，使用特殊的权重参数化和梯度估计。

数学意义：矩阵乘法退化为加减法。$Y = XW$ 中 $W_{ij} \in \{-1, 0, 1\}$，所以 $Y_{ik} = \sum_j X_{ij} \cdot W_{jk}$ 变成 "加 $X_{ij}$、减 $X_{ij}$、或跳过"。不需要乘法器，能量效率提升 10x+。

对硬件的意义：专用 BitNet 芯片可以去掉乘法单元，只保留加法器和路由逻辑，面积和功耗大幅降低。这是量化的终极形态——不是"用更少 bit 近似浮点运算"，而是"改变运算本身"。

#### 5. QAT vs PTQ 的边界
经验法则：
- 8-bit：PTQ（RTN）足够，无需 QAT
- 4-bit：PTQ（GPTQ/AWQ）优先，QAT 提升有限不值得成本
- 3-bit：QAT 开始显著优于 PTQ
- 2-bit 及以下：必须 QAT 或从头训练（BitNet）
- 特殊场景：activation 量化（W8A8）时，QAT 对某些模型比 SmoothQuant 更好

### Components (3)

#### FakeQuantForwardBackward
- **文件:** `src/components/interactive/FakeQuantForwardBackward.tsx`
- **类型:** StepNavigator（5 步）
- **步骤:**
  1. FP32 master weight 矩阵
  2. 前向：通过 fake quant 节点（quant → dequant），产生量化后权重（标注量化噪声）
  3. 前向传播继续：用量化后权重计算 loss
  4. 反向传播：梯度到达 fake quant 节点，STE 生效（箭头"穿过" round 操作，用虚线表示 identity gradient）
  5. 权重更新：FP32 master weight 用梯度更新（标注：master weight 始终是 FP32，只在前向时模拟量化）
- **视觉:** 数据流图，节点 = 操作（weight / fake quant / matmul / loss），箭头 = 数据流。前向蓝色，反向橙色。STE 节点用虚线边框标注。
- **SVG viewBox:** `0 0 580 400`

#### BitNetArithmetic
- **文件:** `src/components/interactive/BitNetArithmetic.tsx`
- **类型:** 交互（useState, client:visible）
- **交互:** 左右对比面板。左侧：传统 FP16 矩阵乘法（2×2 × 2×2），显示每步 multiply-add 操作，标注 FLOPs。右侧：BitNet 三值矩阵（{-1, 0, 1}），显示每步变为 add/subtract/skip。点击不同的权重元素，高亮该元素参与的运算路径。底部统计：传统方法 N 次乘法 + M 次加法，BitNet 0 次乘法 + K 次加减法。
- **SVG viewBox:** `0 0 580 350`

#### QATvsPTQBoundary
- **文件:** `src/components/interactive/QATvsPTQBoundary.tsx`
- **类型:** 静态 SVG（无 client:visible）
- **视觉:** 折线图。横轴：bit-width (1, 2, 3, 4, 5, 6, 7, 8)。纵轴：perplexity 相对增加值。两条曲线：PTQ（4-bit 以下急剧上升）、QAT（平缓上升）。交叉点约在 3 bit 处，标注文字"QAT 值得的分界线"。曲线上标注典型方法：8-bit RTN、4-bit GPTQ、4-bit AWQ、3-bit QAT、1.58-bit BitNet。
- **SVG viewBox:** `0 0 580 300`

---

## Article 4: KV Cache 与推理时量化

- **slug:** `inference-time-quantization`
- **difficulty:** advanced
- **tags:** `["quantization", "kv-cache", "activation-quantization", "fp8", "inference-optimization"]`
- **prerequisites:** `["quantization-fundamentals", "kv-cache"]`
- **references:**
  - "KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization" (https://arxiv.org/abs/2401.18079)
  - "KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache" (https://arxiv.org/abs/2402.02750)
  - "FP8 Formats for Deep Learning" (https://arxiv.org/abs/2209.05433)

### Content Structure

#### 1. KV Cache 的显存瓶颈
回顾 KV Cache 显存公式：$\text{KV size} = 2 \times L \times n_h \times d_h \times S \times \text{bytes\_per\_element}$。以 Llama 3 70B (80 layers, 64 heads, d_head=128) + 128K context 为例：FP16 下 KV cache = 2 × 80 × 64 × 128 × 131072 × 2 bytes ≈ 160 GB，远超模型权重（~140 GB FP16）。即使 4K context 也需 ~5 GB。长上下文推理中 KV cache 是显存主要瓶颈。

#### 2. KV Cache 量化方法
KV cache 的特殊性：值是推理时动态生成的，不能离线校准。
- **per-token quantization:** 每个 token 的 KV vector 独立量化。简单但精度受限——不同 token 的值域差异大。
- **per-channel quantization:** 每个 head dimension 独立量化。更精确但需要收集统计信息。
- **Key vs Value 的不对称性:** Key 参与 $QK^T$ 点积运算，量化误差被放大（两个量化值相乘）；Value 参与加权求和 $\text{softmax} \cdot V$，误差被平均。因此 Key 需要更高精度（如 Key INT8 + Value INT4）。

#### 3. TurboQuant 与前沿方法
- **TurboQuant:** 混合精度 KV cache 策略，根据 layer 重要性分配不同精度
- **KVQuant:** per-channel Key quantization + per-token Value quantization + 非均匀量化 (NUQ) 处理 outlier + dense-and-sparse 混合方案（少量 outlier 保留 FP16）
- **KIVI:** 2-bit KV cache 方案。Key per-channel + Value per-token，利用 Key 和 Value 的分布差异性选择最优量化粒度
- 与 weight 量化的关键区别：KV cache 是 "在线量化"（runtime 即时量化新生成的 KV），不能用 GPTQ 那样的离线优化

#### 4. Activation 量化
为什么 activation 比 weight 难量化：
- **Outlier channels:** 某些 channel 的值域是其他 channel 的 100 倍，per-tensor 量化时正常值精度崩溃
- **动态范围:** 每个 batch/token 的 activation 分布不同，不能用固定 scale
- **per-token vs per-tensor:** per-token 量化为每个 token 独立计算 scale，精度好但开销大；per-tensor 用全局 scale，开销小但受 outlier 影响
- W8A8 vs W4A16：W8A8（SmoothQuant）在有 INT8 Tensor Core 时速度最优；W4A16 在显存受限但没 INT8 加速时更实用

#### 5. FP8 推理实践
- **E4M3 vs E5M2 分工:** E4M3（4 bit exponent, 3 bit mantissa）精度更高，用于 weight 和 forward activation；E5M2（5 bit exponent, 2 bit mantissa）范围更大，用于 backward gradient
- **硬件支持:** NVIDIA H100/H200 的 FP8 Tensor Core（吞吐量 = 2× FP16）；AMD MI300X；Intel Gaudi 2
- **推理框架支持:** vLLM 的 FP8 weight + FP8 KV cache；TensorRT-LLM 的 FP8 全栈量化
- FP8 vs INT8 的权衡：FP8 保留动态范围更适合非均匀分布，INT8 在均匀分布时精度更高且硬件支持更广

#### 6. 端到端量化部署
真实部署中的全栈量化选择，典型配置举例：
- **显存优先:** W4A16 + KV INT8（GPTQ/AWQ weight, per-token KV quant）
- **速度优先:** W8A8 + KV FP8（SmoothQuant, H100 FP8 Tensor Core）
- **平衡方案:** W4A16 + KV INT4（AWQ weight, KIVI KV cache）
- 关键：量化不是单一决策，是 weight/activation/KV cache 三个维度的联合优化

### Components (4)

#### KVCacheMemoryCalculator
- **文件:** `src/components/interactive/KVCacheMemoryCalculator.tsx`（新建，不复用现有 `KVCacheCalculator.tsx`）
- **说明:** 现有 `KVCacheCalculator.tsx` 是通用 KV cache 计算器（单精度选择 + 并发数 + 硬件预设），服务于 kv-cache 文章。本组件专为量化文章设计，核心差异是 **同时对比多种精度的 KV cache 大小**，侧重量化带来的显存节省。
- **类型:** 交互（useState, client:visible）
- **交互:** 输入区域选择模型预设（Llama 3 8B / 70B / Qwen3 72B）或自定义参数（layers, heads, d_head）。序列长度滑块（512 → 128K，对数刻度）。显示区域：堆叠柱状图，**同时展示** FP16/INT8/FP8/INT4 四种精度的 KV cache 大小。拖动 seq_len 看柱子实时增长。标注线："模型权重大小"作为参考基准。
- **SVG viewBox:** `0 0 580 380`

#### KVQuantSensitivity
- **文件:** `src/components/interactive/KVQuantSensitivity.tsx`
- **类型:** StepNavigator（4 步）
- **步骤:**
  1. 原始 attention score 矩阵 $S = QK^T / \sqrt{d}$（颜色编码值大小）
  2. 量化 Key 后重算 score：$S' = Q \cdot \text{dequant}(\text{quant}(K))^T / \sqrt{d}$，叠加误差热力图（点积放大了误差）
  3. 量化 Value 后重算 output：$O' = \text{softmax}(S) \cdot \text{dequant}(\text{quant}(V))$，叠加误差热力图（加权求和有平均效应，误差小）
  4. 结论面板：Key 误差 >> Value 误差，标注"Key 需要更高精度"
- **SVG viewBox:** `0 0 580 400`

#### ActivationOutlierViz
- **文件:** `src/components/interactive/ActivationOutlierViz.tsx`
- **类型:** 交互（useState, client:visible）
- **交互:** 上半部分：activation 矩阵（tokens × channels）的热力图，2-3 个 outlier channels 颜色极深。下半部分切换按钮：per-tensor / per-channel 量化。per-tensor 模式下显示单一 scale 和量化误差热力图（outlier 拉大 scale，正常值精度崩溃，大片红色）。per-channel 模式下显示每个 channel 的独立 scale 和误差热力图（误差均匀且小，大片绿色）。
- **SVG viewBox:** `0 0 580 400`

#### E2EQuantStackDiagram
- **文件:** `src/components/interactive/E2EQuantStackDiagram.tsx`
- **类型:** 静态 SVG（无 client:visible）
- **视觉:** 纵向 pipeline 流程图，每层一个横向方块：
  - Input Tokens → Embedding (FP16)
  - → Attention QKV Projection (INT4 weight → dequant → FP16 compute)
  - → Attention Score (FP16, softmax 需要高精度)
  - → KV Cache (INT8/FP8)
  - → Attention Output (FP16)
  - → FFN (INT4 weight → dequant → FP16 compute)
  - → LayerNorm (FP32)
  - → Output Logits (FP16)
  每个方块标注数据类型，转换点用小三角标注 "quant" 或 "dequant"。
- **SVG viewBox:** `0 0 580 500`

---

## Article 5: llama.cpp 量化（现有文章重命名 + 扩写）

- **slug:** `llama-cpp-quantization` (renamed from `ollama-quantization`)
- **difficulty:** advanced
- **tags:** `["quantization", "llama-cpp", "gguf", "inference-optimization"]`
- **prerequisites:** `["quantization-fundamentals", "gguf-format"]`
- **references:** (保留现有 references)

### Existing Content (preserved)
- 为什么量化
- 基本量化 Q8_0/Q4_0/Q4_1
- K-quant 混合精度（概述）
- I-quant 重要性量化
- 精度-性能-显存三角
- 为什么不一样（GPTQ/AWQ/FP8 对比）
- 延伸阅读

### Existing Components (preserved, 3)
- QuantizationProcess
- KQuantMixedPrecision
- QuantizationTradeoff

### New/Expanded Content

#### K-quant 节扩写：Q4_K_M 深度解析
在现有 K-quant 节之后插入，深入 Q4_K_M 的具体实现：

**Super-block 结构:**
- 256 个权重值组成一个 super-block
- super-block 分为 8 个 sub-block（每个 32 权重值）
- super-block 头部：FP16 super-scale (d) + FP16 super-min (dmin)

**Q4_K 编码细节:**
- 每个 sub-block 存储：32 个 4-bit 量化值（16 bytes）+ 6-bit scale + 6-bit min
- 8 个 sub-block 的 scale 和 min 各 6-bit，打包在 super-block 头部的 12 bytes 中
- 反量化：$w_i = d \cdot s_b \cdot q_i - dmin \cdot m_b$，其中 $s_b$ 和 $m_b$ 是 sub-block 级别的 scale 和 min

**混合精度分配规则（Q4_K_M）:**
- Attention Q/K/V projections → Q6_K（6.56 bpw）— 对输出最敏感
- Attention output projection → Q4_K（4.5 bpw）
- FFN gate/up/down projections → Q4_K（4.5 bpw）— SwiGLU 有平滑效应
- 整体平均 ~4.84 bpw
- 为什么 Q4_K_M 是 sweet spot：比 Q4_K_S 多 ~0.3 bpw 的预算，但 perplexity 改善 ~0.05，边际收益最大

#### 新增一小节：KV Cache 量化
llama.cpp 支持通过 `--cache-type-k` 和 `--cache-type-v` 参数量化 KV cache（如 `--cache-type-k q8_0 --cache-type-v q4_0`）。简述效果：长上下文推理时显存节省明显（128K context 从 ~20GB 降到 ~5GB），精度损失在可接受范围。链接到 `inference-time-quantization` 文章了解更多 KV cache 量化的理论和前沿方法。

#### 对比节末尾添加链接
在"为什么不一样"节末尾添加：
- 想深入了解 GPTQ/AWQ/SmoothQuant 的算法原理？→ 链接到 `ptq-weight-quantization`
- 想了解量化感知训练和 BitNet？→ 链接到 `quantization-aware-training`

### New Component (1)

#### Q4KMBitPacking
- **文件:** `src/components/interactive/Q4KMBitPacking.tsx`
- **类型:** 交互（useState, client:visible）
- **交互:** 展示一个 Q4_K_M super-block 的完整内存布局。
  - 顶部：原始 256 个 FP16 权重值（横向排列，颜色编码值大小）
  - 中部：打包后的字节流（每个 byte 一个小方格），区域着色：super-scale (d) 蓝色、super-min (dmin) 蓝色、sub-block scales 橙色、sub-block mins 橙色、quantized values 灰色
  - 点击任一区域，上下同时高亮对应的原始值和编码字段，连线显示映射关系
  - 右侧面板：显示选中区域的详细信息（字段名、bit 数、值的含义）
- **SVG viewBox:** `0 0 580 420`

---

## Component Summary

| # | Component | Article | Type | Key Principle Illustrated |
|---|-----------|---------|------|--------------------------|
| 1 | DataTypeBitLayout | quantization-fundamentals | Interactive | Bit-level structure of FP16/BF16/FP8/INT8/INT4 |
| 2 | QuantizationMapping | quantization-fundamentals | StepNavigator | Quant → dequant process, symmetric vs asymmetric |
| 3 | GranularityCompare | quantization-fundamentals | Interactive | Per-tensor/channel/group error tradeoff |
| 4 | HardwareComputePath | quantization-fundamentals | Static | Dequant path vs native low-precision path |
| 5 | GPTQErrorPropagation | ptq-weight-quantization | StepNavigator | GPTQ column-wise error compensation |
| 6 | AWQSalientChannels | ptq-weight-quantization | Interactive | Activation-aware channel scaling |
| 7 | SmoothQuantTransform | ptq-weight-quantization | StepNavigator | Activation smoothing transform |
| 8 | PTQMethodComparison | ptq-weight-quantization | Interactive | PTQ methods comparison table |
| 9 | FakeQuantForwardBackward | quantization-aware-training | StepNavigator | QAT training loop with STE |
| 10 | BitNetArithmetic | quantization-aware-training | Interactive | Ternary weight eliminates multiplication |
| 11 | QATvsPTQBoundary | quantization-aware-training | Static | Bit-width threshold for QAT vs PTQ |
| 12 | KVCacheMemoryCalculator | inference-time-quantization | Interactive | KV cache memory scaling with sequence length |
| 13 | KVQuantSensitivity | inference-time-quantization | StepNavigator | Key vs Value quantization sensitivity |
| 14 | ActivationOutlierViz | inference-time-quantization | Interactive | Activation outlier impact on quantization |
| 15 | E2EQuantStackDiagram | inference-time-quantization | Static | Full-stack quantization pipeline |
| 16 | Q4KMBitPacking | llama-cpp-quantization | Interactive | Q4_K_M super-block memory layout |
