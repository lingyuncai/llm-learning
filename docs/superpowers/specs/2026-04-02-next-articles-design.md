# Next Articles Batch Design Spec

**Status:** Approved
**Date:** 2026-04-02
**Scope:** 3 new articles, 13 interactive components

## 1. Overview

Add 3 articles to fill gaps in existing learning paths:

| # | Article | Slug | Difficulty | Path | Position |
|---|---------|------|-----------|------|----------|
| 1 | Positional Encoding | `positional-encoding` | intermediate | Transformer Core | #6 (after gqa-mqa) |
| 2 | Sampling & Decoding + Perplexity | `sampling-and-decoding` | intermediate | Inference Engineering | #4 (after flash-attention) |
| 3 | Speculative Decoding | `speculative-decoding` | advanced | Inference Engineering | #5 (after sampling-and-decoding) |

**Path changes:**
- Transformer Core: 5 → 6 articles
- Inference Engineering: 3 → 5 articles

**Dependencies:**
- Article 1 has no dependency on Articles 2/3
- Article 2 depends on transformer-overview (already exists)
- Article 3 depends on Article 2 (sampling concepts) + prefill-vs-decode (already exists)

**Shared infrastructure:** Reuse existing `src/components/interactive/shared/` (colors, types, presets, hooks). No new shared files needed.

---

## 2. Article 1: Positional Encoding

**File:** `src/content/articles/zh/positional-encoding.mdx`
**Prerequisites:** `transformer-overview`
**Tags:** `transformer`, `attention`, `positional-encoding`
**Design principle:** 注重图形解释，RoPE 旋转向量的直觉要用动画讲清楚

### 2.1 Content Structure

#### Section 1: 为什么需要位置编码
- Attention 的置换不变性（Permutation Invariance）：打乱 token 顺序，Attention 输出不变
- 直觉：没有位置编码的 Transformer 分不清 "狗咬人" 和 "人咬狗"
- 引出：必须显式注入位置信息

#### Section 2: 绝对位置编码

**Sinusoidal（Vaswani et al. 2017）**
- 公式：$PE_{(pos,2i)} = \sin(pos / 10000^{2i/d})$，$PE_{(pos,2i+1)} = \cos(pos / 10000^{2i/d})$
- 直觉：不同维度对应不同频率的正弦波，每个位置有唯一"频率指纹"
- 优点：无训练参数，理论上可外推
- 缺点：实际外推效果有限

**Learned Embedding**
- 可训练的位置向量表 $E \in \mathbb{R}^{L_{max} \times d}$
- 优点：简单，效果好
- 缺点：序列长度被训练时的 $L_{max}$ 限死

#### Section 3: 相对位置编码

**Shaw et al. 2018**
- 核心转变：关注 token 间的距离，而非绝对位置
- 在 Attention score 中加入 $a_{ij}^K$（相对位置偏置）
- 优点：天然支持变长序列

**ALiBi（Press et al. 2022）**
- 更极端的简化：不加位置 embedding，直接在 Attention score 上减去线性距离惩罚
- $\text{score}_{ij} = q_i \cdot k_j - m \cdot |i - j|$，m 是每头不同的斜率
- 优点：零参数、外推能力强、实现简单

#### Section 4: RoPE — Rotary Position Embedding（重点，~40% 篇幅）

**直觉构建**
- 把每对相邻维度 $(d_{2i}, d_{2i+1})$ 看作二维平面上的一个向量
- 位置 $m$ 对应旋转角度 $m\theta_i$，不同维度对的 $\theta_i$ 不同（类似 sinusoidal 的多频率）
- 两个 token 旋转后做内积 → 内积只依赖相对距离 $m - n$，不依赖绝对位置

**数学**
- 旋转矩阵：$R_\theta(m) = \begin{pmatrix} \cos m\theta & -\sin m\theta \\ \sin m\theta & \cos m\theta \end{pmatrix}$
- 对 Q 和 K 分别旋转：$\tilde{q}_m = R_\theta(m) q_m$，$\tilde{k}_n = R_\theta(n) k_n$
- 关键性质：$\tilde{q}_m^T \tilde{k}_n = q_m^T R_\theta(n-m) k_n$（只依赖 $n-m$）

**长度外推问题**
- 训练长度外的位置角度超出训练分布 → 性能下降
- 简介 NTK-aware scaling（修改频率基数）和 YaRN（混合策略）的思路
- 不深入推导，提及作为延伸阅读

#### Section 5: 对比总结
- 横向对比表：Sinusoidal / Learned / Shaw / ALiBi / RoPE
- 维度：是否需要训练参数、绝对/相对、外推能力、计算开销、主流采用情况

### 2.2 Interactive Components (4)

#### Component 1: PermutationInvariance
- **File:** `src/components/interactive/PermutationInvariance.tsx`
- **Type:** StepNavigator 动画
- **Steps:**
  1. 展示一个 4-token 序列 "The cat sat here" 和简化的 Attention 分数矩阵
  2. 打乱顺序为 "sat here The cat"，显示 Attention 分数矩阵行列对应调整后数值不变
  3. 加入位置编码后，重新计算分数矩阵，数值发生变化，高亮差异
- **交互:** StepNavigator 3 步切换
- **技术:** 简化的 4×4 矩阵，固定数值演示概念，不需要真实计算

#### Component 2: SinusoidalHeatmap
- **File:** `src/components/interactive/SinusoidalHeatmap.tsx`
- **Type:** 交互热力图
- **展示:** position (y-axis, 0~63) × dimension (x-axis, 0~63) 的 sinusoidal PE 值
- **交互:**
  - 鼠标 hover 显示具体位置/维度/值
  - 可切换 sin 和 cos 通道
  - 高亮一行显示"某位置的完整编码向量"
- **技术:** Canvas 或 SVG rect 网格，颜色映射 [-1, 1] → 蓝白红

#### Component 3: RoPERotationAnimation
- **File:** `src/components/interactive/RoPERotationAnimation.tsx`
- **Type:** StepNavigator 核心动画
- **Steps:**
  1. 展示一个二维平面，Q 向量在原点，标注为 position 0
  2. Position 1: Q 向量旋转 θ 角度，K 向量旋转 θ 角度（同步），标注旋转角
  3. Position 3 vs Position 5: 两个向量分别旋转 3θ 和 5θ，展示内积只依赖差值 2θ
  4. 展示多个维度对（不同频率 θ₁, θ₂, θ₃），低频慢旋转 + 高频快旋转
- **交互:** StepNavigator 4 步，SVG 动画展示向量旋转
- **技术:** SVG 极坐标向量 + motion 动画平滑旋转

#### Component 4: EncodingComparison
- **File:** `src/components/interactive/EncodingComparison.tsx`
- **Type:** 交互对比表
- **展示:** 5 种编码方案的横向对比
- **列:** 方案名 | 类型（绝对/相对） | 训练参数 | 外推能力 | 计算开销 | 代表模型
- **交互:** hover 高亮行，点击展开每种方案的一句话总结
- **技术:** HTML table + CSS hover，简单交互

### 2.3 References
- Vaswani et al. 2017 "Attention Is All You Need"
- Shaw et al. 2018 "Self-Attention with Relative Position Representations"
- Su et al. 2021 "RoFormer: Enhanced Transformer with Rotary Position Embedding"
- Press et al. 2022 "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation"

---

## 3. Article 2: Sampling & Decoding + Perplexity

**File:** `src/content/articles/zh/sampling-and-decoding.mdx`
**Prerequisites:** `transformer-overview`
**Tags:** `inference`, `sampling`, `decoding`, `perplexity`
**Design principle:** Perplexity 前置作为评估主线，贯穿各 Sampling 策略的对比

### 3.1 Content Structure

#### Section 1: Perplexity — 语言模型的"困惑度"

**信息论基础**
- 熵 $H(p) = -\sum p(x) \log_2 p(x)$：衡量不确定性
- 交叉熵 $H(p,q) = -\sum p(x) \log_2 q(x)$：模型 q 对真实分布 p 的近似程度

**Perplexity 定义**
- $\text{PPL} = 2^{H(p,q)}$
- 直觉："模型在每个位置平均要从多少个 token 中做选择"
- PPL = 1 表示完全确定，PPL = |V| 表示均匀猜测
- 实际计算：对一段文本 $w_1, \ldots, w_N$，$\text{PPL} = \exp\left(-\frac{1}{N}\sum_{i=1}^{N} \ln p(w_i | w_{<i})\right)$

**PPL 的局限**
- PPL 低不等于生成质量高（可能过于保守/重复）
- 不同 tokenizer 的 PPL 不可直接比较

**引出 Sampling**
- 模型输出了每个 token 的概率分布，接下来怎么选？

#### Section 2: Greedy Decoding
- 每步选概率最高的 token：$w_t = \arg\max p(w | w_{<t})$
- 优点：确定性、速度快
- 问题：局部最优陷阱、容易产生重复（"the the the..."）、缺乏多样性
- 适用：分类、提取式任务

#### Section 3: Temperature Scaling
- 公式：$p_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$
- T < 1：分布更尖锐（更确定），接近 Greedy
- T > 1：分布更平坦（更随机）
- T → 0：退化为 Greedy；T → ∞：退化为均匀分布
- 和 Perplexity 的关系：T↑ → 选择更分散 → 生成文本的 PPL↑

#### Section 4: Top-k Sampling（Fan et al. 2018）
- 只保留概率最高的 k 个 token，其余概率设为 0，重新归一化后采样
- k 的选择困境：
  - k 太小 → 遗漏合理选项（"I ate a ___" 可能的食物很多）
  - k 太大 → 包含不合理选项（概率极低的噪声 token）
- 问题：k 是固定的，无法适应不同上下文的确定性程度

#### Section 5: Top-p / Nucleus Sampling（Holtzman et al. 2020）
- 动态截断：选最小的 token 集合 $V_p$，使得 $\sum_{w \in V_p} p(w) \geq p$
- 确定性上下文（如 "the capital of France is"）→ 集合很小（1-2 个 token）
- 不确定上下文（如 "I like to eat"）→ 集合较大
- 比 Top-k 更自适应，实际效果更好
- 通常 p = 0.9~0.95

#### Section 6: Beam Search
- 维护 B 条候选序列（beam），每步扩展所有可能的下一 token，保留分数最高的 B 条
- 分数：对数概率之和 $\sum \log p(w_t | w_{<t})$，通常加 length penalty
- 优点：全局搜索比 Greedy 更优
- 缺点：计算量 B 倍、生成文本偏"安全"/无聊、不适合开放式生成
- 适用：翻译、摘要等需要高准确性的任务

#### Section 7: Repetition Penalty 与其他技巧
- Frequency Penalty：已生成 token 的概率按出现次数衰减
- Presence Penalty：已出现过的 token 统一减去固定值
- Min-P Sampling（近期方法）：简要提及
- 组合使用：实际部署中通常 Temperature + Top-p + Repetition Penalty 联合使用

#### Section 8: 策略选择指南
- 代码生成 → 低 Temperature + Greedy/Top-p(0.9)
- 创意写作 → 高 Temperature + Top-p(0.95)
- 翻译/摘要 → Beam Search
- 对话 → Temperature(0.7) + Top-p(0.9) + Repetition Penalty

### 3.2 Interactive Components (4)

#### Component 1: PerplexityIntuition
- **File:** `src/components/interactive/PerplexityIntuition.tsx`
- **Type:** 交互演示
- **展示:** 一个 6-8 token 的短句（如 "The cat sat on the mat"），逐 token 显示模型预测概率
- **交互:**
  - 两个模式切换："好模型"（高概率预测，PPL 低）vs "差模型"（概率分散，PPL 高）
  - 每个 token 上方显示预测概率柱状图（top-5 candidates）
  - 底部实时计算并显示整句的 PPL 值
- **技术:** 固定数据（预计算好的概率分布），不需要真实模型推理

#### Component 2: TemperatureDistribution
- **File:** `src/components/interactive/TemperatureDistribution.tsx`
- **Type:** 滑块 + 柱状图
- **展示:** 固定一组 logits（约 10 个 token），显示 softmax 后的概率分布柱状图
- **交互:**
  - Temperature 滑块（0.1 ~ 3.0）
  - 实时重新计算 softmax(z/T) 并更新柱状图
  - 标注当前分布的熵和对应 PPL 值
  - 标注 Greedy 选择（最高柱）和采样可能落在的范围
- **技术:** SVG 柱状图 + motion 动画平滑过渡

#### Component 3: SamplingStrategyComparison
- **File:** `src/components/interactive/SamplingStrategyComparison.tsx`
- **Type:** 核心交互组件
- **展示:** 同一组 logits（约 15 个 token），三列并排展示 Greedy / Top-k / Top-p 的筛选效果
- **交互:**
  - k 滑块（1~15）控制 Top-k 的截断点
  - p 滑块（0.5~1.0）控制 Top-p 的累积概率阈值
  - 被筛掉的 token 变灰/缩小，保留的高亮
  - 每列底部显示保留的 token 数量和归一化后的概率分布
- **技术:** SVG 柱状图 × 3 列，灰色/高亮状态切换

#### Component 4: BeamSearchTree
- **File:** `src/components/interactive/BeamSearchTree.tsx`
- **Type:** StepNavigator 步骤动画
- **展示:** Beam Search 过程（beam width = 2，3 步生成）
- **Steps:**
  1. 初始：起始 token "[START]"，展开 top-B 候选
  2. Step 1：每条 beam 各展开 top-B，共 B² 候选，保留分数最高的 B 条（剪枝动画）
  3. Step 2：重复展开 + 剪枝
  4. 最终：选择总分数最高的完整序列
- **交互:** StepNavigator 4 步，树形结构从左到右生长
- **技术:** SVG 树形布局，被剪枝的节点用虚线/灰色标记

### 3.3 References
- Holtzman et al. 2020 "The Curious Case of Neural Text Degeneration"
- Fan et al. 2018 "Hierarchical Neural Story Generation"
- Jelinek et al. 1977 "Perplexity — a Measure of the Difficulty of Speech Recognition Tasks"
- Radford et al. 2019 "Language Models are Unsupervised Multitask Learners" (GPT-2, temperature/top-k usage)

---

## 4. Article 3: Speculative Decoding

**File:** `src/content/articles/zh/speculative-decoding.mdx`
**Prerequisites:** `sampling-and-decoding`, `prefill-vs-decode`
**Tags:** `inference`, `optimization`, `speculative-decoding`
**Design principle:** 扩展对比型，覆盖经典方案 + Medusa + MTP + Eagle + Lookahead，Eagle 和 MTP 配专门的架构图

### 4.1 Content Structure

#### Section 1: 动机 — 为什么 Decode 很慢
- 回顾 prefill-vs-decode 的结论：Decode 阶段是 memory-bound，每步只产 1 token
- GPU 算力大量空闲（GEMV 的低算术强度）
- 核心问题：自回归生成的顺序依赖 — 每个 token 依赖前一个
- 核心思路：能否"猜多个 token，一次验证"？用并行验证代替顺序生成

#### Section 2: Draft-then-Verify（经典方案）

**Leviathan et al. 2023 / Chen et al. 2023**

**Draft 阶段**
- 用一个小的 draft model（如 7B 对应的 68M 模型）自回归生成 K 个候选 token
- Draft model 快（模型小）但不够准确

**Verify 阶段**
- Target model（大模型）对 K 个候选 token 做一次 forward pass
- 一次 forward 同时得到所有位置的概率分布（类似 Prefill）
- 逐位置比对 draft 和 target 的概率

**Rejection Sampling — 保证分布一致性**
- 对每个位置 i，比较 $p_{\text{target}}(x_i)$ 和 $q_{\text{draft}}(x_i)$
- 如果 $q(x) \leq p(x)$：接受（draft 保守的猜测是安全的）
- 如果 $q(x) > p(x)$：以概率 $1 - p(x)/q(x)$ 拒绝
- 被拒绝后，从修正分布 $\text{norm}(\max(0, p(x) - q(x)))$ 重新采样
- 关键保证：最终输出的分布和只用 target model 生成完全一致（无损加速）

**加速比分析**
- acceptance rate $\alpha$：draft 被接受的平均概率
- 期望每轮生成的 token 数：$\frac{1 - \alpha^{K+1}}{1 - \alpha}$
- α 越高、K 越大 → 加速比越高
- 实际加速：2-3x（取决于 draft model 质量）

#### Section 3: Medusa（Cai et al. 2024）— 推理时加多头

**核心改进**
- 不需要独立的 draft model
- 在 target model 的最后一层 hidden state 上接多个 prediction heads
- Head 1 预测下一个 token，Head 2 预测再下一个，...，Head K 预测第 K 个

**Tree Attention 验证**
- 多个 head 的预测组合成一棵候选树（而非单一序列）
- 用 tree attention mask 一次 forward pass 验证所有候选路径
- 选择最长的被接受路径

**训练**
- 冻结 target model，只训练额外的 prediction heads
- 训练成本低（只需要少量数据 + 小参数量）

**优劣**
- 优点：不需要额外模型、部署简单、训练成本低
- 缺点：heads 未经联合训练，预测质量有限 → 接受率不如 Eagle

#### Section 4: Multi-Token Prediction / MTP — 训练时加多头

**核心思想**
- 训练时就让模型同时预测未来第 1, 2, ..., K 个 token
- 每个预测头共享主干网络，各有独立的输出层
- 训练 loss = 各头 loss 之和（或加权和）

**和 Medusa 的关键区别**
- Medusa：推理时冻结主模型，单独训练 heads → heads 未见过主模型的训练过程
- MTP：联合训练，heads 和主干一起优化 → 预测质量更高
- 类比：Medusa 像"临时加装的猜测器"，MTP 像"出厂自带的多步预测能力"

**训练到推理的桥梁**
- 训练时的多头预测 → 推理时直接复用这些头做 speculative draft
- 不需要额外的 draft model，模型自身就是 drafter + verifier（self-speculative）

**实际应用**
- DeepSeek-V3：训练时使用 MTP，推理时利用 MTP heads 做 speculative decoding
- Meta 2024 "Better & Faster LLMs via Multi-Token Prediction"

#### Section 5: Eagle（Li et al. 2024）— Feature-Level Drafting

**核心洞察**
- Draft 不需要从 token embedding 开始预测
- Target model 最后一层的 hidden state 已编码了丰富的上下文语义信息
- 直接用 hidden state feature 做 draft，信息量远大于 token-level → 准确率更高

**架构**
- Eagle 的 "auto-regression head"：一个轻量 decoder 层
- 输入：target model 的 top-layer hidden state + 当前 token embedding
- 输出：下一位置的 feature 向量 → 通过 target model 的 LM head 映射到 token 概率
- 可以自回归地用自己的输出继续预测更远的位置

**为什么接受率更高**
- Feature-level 信息量 >> token-level：hidden state 包含了完整上下文、语义关系、语法模式
- Token embedding 只有 token 本身的信息，丢失了上下文
- 实验：Eagle 的 acceptance rate 比 Medusa 高约 10-15%

**Eagle-2 改进**
- 引入 context-aware dynamic draft tree
- 根据每个节点的置信度动态调整树结构
- 高置信度分支 → 展开更深（更多候选）
- 低置信度分支 → 提前剪枝（不浪费验证计算）
- 结果：比 Eagle-1 进一步提升加速比

**训练**
- 冻结 target model，只训练轻量 decoder（类似 Medusa）
- 但因为输入是 feature 而非 token，同等训练量下效果更好

#### Section 6: Lookahead Decoding（Fu et al. 2024）— 无 Draft Model

**完全不同的思路**
- 不需要任何 draft model 或额外 head
- 基于 Jacobi 迭代：同时猜测多个未来位置的 token，并行验证，不断迭代直到收敛

**工作原理**
- 初始：随机猜测位置 t+1, t+2, ..., t+K 的 token
- 每步：用 target model 对所有位置并行做 forward pass
- 如果某位置的预测和猜测一致 → 该位置"收敛"
- 未收敛的位置用新预测替换，继续迭代
- 通常 2-3 轮迭代就能收敛

**优劣**
- 优点：零额外参数、零训练成本、任何模型即插即用
- 缺点：加速比通常低于 Medusa/Eagle（因为迭代次数不可控）

#### Section 7: 对比总结

横向对比表：

| 方法 | 额外模型/参数 | 训练成本 | 典型加速比 | 分布一致性 | 适用场景 |
|------|-------------|---------|-----------|-----------|---------|
| Draft-then-Verify | 独立 draft model | 需要训练 draft model | 2-3x | 精确一致 | 有配套小模型时 |
| Medusa | 多个轻量 head | 低（冻结主模型） | 2-3x | 精确一致 | 快速部署 |
| MTP | 训练时内置 | 高（需要预训练） | 2-3x | 精确一致 | 新模型从头训练时 |
| Eagle | 轻量 decoder | 低（冻结主模型） | 3-4x | 精确一致 | 追求最高加速比 |
| Lookahead | 无 | 零 | 1.5-2x | 精确一致 | 即插即用 |

选择指南：
- 已有配套小模型 → Draft-then-Verify
- 从头训新模型 → MTP
- 已有大模型、想快速加速 → Eagle > Medusa > Lookahead

### 4.2 Interactive Components (6)

#### Component 1: DraftVerifyAnimation
- **File:** `src/components/interactive/DraftVerifyAnimation.tsx`
- **Type:** StepNavigator 核心动画
- **Steps:**
  1. Draft model 自回归生成 K=4 个 token（逐个出现，速度快，标注概率）
  2. Target model 一次 forward pass 并行验证所有 4 个（并行箭头动画）
  3. Rejection sampling：逐位置显示 accept/reject 判定（绿色✓/红色✗），第 3 个位置被拒绝
  4. 从拒绝位置重新采样 1 个 token，最终生成序列（被拒绝后的 token 替换为新采样）
- **技术:** SVG token 序列 + motion 动画

#### Component 2: AcceptanceRateCalculator
- **File:** `src/components/interactive/AcceptanceRateCalculator.tsx`
- **Type:** 交互计算器
- **展示:** acceptance rate α 和 draft length K 对加速比的影响
- **交互:**
  - α 滑块（0.5 ~ 0.99）
  - K 滑块（1 ~ 10）
  - 实时显示期望 token 数公式 $(1 - \alpha^{K+1}) / (1 - \alpha)$
  - 折线图：x 轴 = K，y 轴 = 期望 token 数，不同 α 对应不同曲线
  - 标注当前参数下的加速比
- **技术:** SVG 折线图 + 滑块

#### Component 3: MedusaTreeViz
- **File:** `src/components/interactive/MedusaTreeViz.tsx`
- **Type:** 树形可视化
- **展示:** Medusa 的多头预测树
  - 根节点：当前 token
  - Head 1 产生 top-2 候选 → 每个候选下 Head 2 再产生 top-2 → 形成树
  - Tree attention 一次验证，高亮最长被接受路径
- **交互:** 点击"验证"按钮，动画展示 tree attention 逐层检查，被拒绝的分支变灰
- **技术:** SVG 树形布局 + motion 动画

#### Component 4: MTPTrainInferBridge
- **File:** `src/components/interactive/MTPTrainInferBridge.tsx`
- **Type:** 架构对比图
- **展示:** 左右两栏并排
  - 左 "训练时"：主干网络（竖向层堆叠）→ 顶部扇形展开多个预测头 → 每头指向对应的 loss（"next token"、"next+1 token"...）
  - 右 "推理时"：同样的主干 + 头 → 头变成 draft 源产出候选 token → target head 做验证
  - 中间：虚线箭头连接左右对应的头，标注"训练的头 = 推理的 drafter"
- **交互:** hover 高亮对应的左右头部连接
- **技术:** SVG 架构图，左右对称布局

#### Component 5: EagleArchitecture
- **File:** `src/components/interactive/EagleArchitecture.tsx`
- **Type:** 架构对比图
- **展示:** 上下两栏
  - 上 "传统 Draft Model"：独立小模型，输入 = token embedding → 多层 → 输出 draft tokens。标注：信息来源仅有 token 本身
  - 下 "Eagle"：Target model hidden states → 轻量 decoder → 输出 draft tokens。标注：信息来源 = 完整上下文语义。高亮 hidden state 的丰富信息流
  - 关键视觉差异：传统方案的输入箭头细（信息少），Eagle 的输入箭头粗（信息丰富）
- **交互:** hover 切换高亮不同信息流路径，显示信息量对比文字
- **技术:** SVG 架构图 + hover 交互

#### Component 6: SpecMethodComparison
- **File:** `src/components/interactive/SpecMethodComparison.tsx`
- **Type:** 交互对比表
- **展示:** 5 种方法的横向对比
- **列:** 方法 | 额外参数 | 训练成本 | 加速比 | 适用场景
- **交互:** hover 高亮行，点击展开每种方法的一句话摘要
- **技术:** HTML table + hover/click 交互（和 EncodingComparison 同模式）

### 4.3 References
- Leviathan et al. 2023 "Fast Inference from Transformers via Speculative Decoding"
- Chen et al. 2023 "Accelerating Large Language Model Decoding with Speculative Sampling"
- Cai et al. 2024 "Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads"
- Gloeckle et al. 2024 "Better & Faster Large Language Models via Multi-Token Prediction"
- Li et al. 2024 "EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty"
- Li et al. 2024 "EAGLE-2: Faster Inference of Language Models with Dynamic Draft Trees"
- Fu et al. 2024 "Break the Sequential Dependency of LLM Inference Using Lookahead Decoding"
- DeepSeek-AI 2024 "DeepSeek-V3 Technical Report" (MTP in practice)

---

## 5. Learning Path Changes

### Transformer Core (`src/content/paths/transformer-core.yaml`)
```yaml
articles:
  - transformer-overview
  - qkv-intuition
  - attention-computation
  - multi-head-attention
  - gqa-mqa
  - positional-encoding  # NEW — #6
```

### Inference Engineering (`src/content/paths/inference-engineering.yaml`)
```yaml
articles:
  - prefill-vs-decode
  - kv-cache
  - flash-attention
  - sampling-and-decoding   # NEW — #4
  - speculative-decoding     # NEW — #5
```

---

## 6. Component Summary

| # | Component | Article | Type |
|---|-----------|---------|------|
| 1 | PermutationInvariance | positional-encoding | StepNavigator 动画 |
| 2 | SinusoidalHeatmap | positional-encoding | 交互热力图 |
| 3 | RoPERotationAnimation | positional-encoding | StepNavigator 核心动画 |
| 4 | EncodingComparison | positional-encoding | 交互对比表 |
| 5 | PerplexityIntuition | sampling-and-decoding | 交互演示 |
| 6 | TemperatureDistribution | sampling-and-decoding | 滑块+柱状图 |
| 7 | SamplingStrategyComparison | sampling-and-decoding | 核心交互 |
| 8 | BeamSearchTree | sampling-and-decoding | StepNavigator 树形动画 |
| 9 | DraftVerifyAnimation | speculative-decoding | StepNavigator 核心动画 |
| 10 | AcceptanceRateCalculator | speculative-decoding | 交互计算器 |
| 11 | MedusaTreeViz | speculative-decoding | 树形可视化 |
| 12 | MTPTrainInferBridge | speculative-decoding | 架构对比图 |
| 13 | EagleArchitecture | speculative-decoding | 架构对比图 |
| 14 | SpecMethodComparison | speculative-decoding | 交互对比表 |

Total: **3 articles, 14 interactive components** (4 + 4 + 6)
