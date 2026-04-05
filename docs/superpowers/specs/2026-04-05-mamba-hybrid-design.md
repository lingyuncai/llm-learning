# Mamba / SSM & Hybrid 架构设计文档

## 概览

在 Transformer Core 学习路径末尾新增 2 篇文章，覆盖 SSM/Mamba 原理和 Hybrid 架构实践。不做独立学习路径，作为 Transformer Core 的"超越 Attention"延伸。

- **Article 1**: 状态空间模型与 Mamba (`state-space-models`)
- **Article 2**: Hybrid 架构：Mamba 与 Attention 的融合 (`hybrid-architectures`)
- **交互组件**: 合计 10 个（每篇 5 个）
- **路径变更**: `transformer-core.yaml` 末尾追加两篇

路径叙事线：Transformer 基础 → Attention 优化 → 推理工程 → 稀疏化(MoE) → **替代方案(SSM)** → **融合(Hybrid)**

---

## Article 1: 状态空间模型与 Mamba

### Frontmatter

```yaml
title: "状态空间模型与 Mamba"
slug: "state-space-models"
locale: "zh"
tags: [ssm, mamba, state-space-model, selective-scan, sequence-modeling]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [attention-computation]
references:
  - type: paper
    title: "Efficiently Modeling Long Sequences with Structured State Spaces (S4)"
    url: "https://arxiv.org/abs/2111.00396"
  - type: paper
    title: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces"
    url: "https://arxiv.org/abs/2312.00752"
  - type: paper
    title: "Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality"
    url: "https://arxiv.org/abs/2405.21060"
```

### 内容大纲

#### 1. 引言
- Attention 的 O(n²) 计算和 O(n) 推理缓存瓶颈
- 长序列场景（100K+ tokens）需要线性复杂度方案
- SSM 作为控制论/信号处理领域的经典工具引入 deep learning

#### 2. 连续状态空间模型
- 公式：$\dot{x}(t) = Ax(t) + Bu(t)$, $y(t) = Cx(t) + Du(t)$
- 直觉：状态 $x$ 是"压缩的历史摘要"，A 矩阵控制如何混合历史信息
- 类比：带记忆的滤波器，输入信号经过"有状态的变换"生成输出
- 对比 Attention：Attention 每步回看全部历史，SSM 每步只看压缩状态

#### 3. 离散化：从连续到序列
- ZOH 离散化：$\bar{A} = e^{\Delta A}$, $\bar{B} = (\Delta A)^{-1}(e^{\Delta A} - I) \cdot \Delta B$
- 步长 $\Delta$ 的物理含义：控制"连续时间分辨率"，大 $\Delta$ → 关注远距离，小 $\Delta$ → 关注近距离
- 离散后递推：$x_k = \bar{A}x_{k-1} + \bar{B}u_k$, $y_k = Cx_k$

#### 4. Recurrence vs Convolution 对偶性
- Recurrence 模式：$x_k = \bar{A}x_{k-1} + \bar{B}u_k$，逐步递推，O(1) per step，适合推理
- Convolution 模式：展开递推得到 $y = \bar{K} * u$，其中 $\bar{K}$ 是 SSM 的卷积核，可用 FFT 并行计算，适合训练
- 关键洞察：同一个模型，两种等价计算方式 — 训练用 convolution（并行），推理用 recurrence（增量）

#### 5. Mamba 的选择性机制
- S4 等早期 SSM 的限制：A, B, C 是固定参数，对所有输入一视同仁
- Mamba 的创新：让 B, C, $\Delta$ 依赖输入 token（通过 linear projection）
  - 选择性 B：控制"写入什么到状态"
  - 选择性 C：控制"从状态读出什么"
  - 选择性 $\Delta$：控制"遗忘速度"— 重要 token 大 $\Delta$（记住），噪声 token 小 $\Delta$（遗忘）
- 代价：参数依赖输入后失去时不变性，不能再用 convolution → 用硬件感知 parallel scan 算法替代
- Mamba block 结构：input → linear proj (expand) → conv1d → SSM → output，无 Attention 也无 MLP

#### 6. Mamba-2: State Space Duality
- SSD 框架：证明 SSM 的计算等价于一种 structured semiseparable matrix 乘法
- 与 Attention 的联系：标准 Attention 是 dense 矩阵乘法，SSM 是 semiseparable（低秩结构化）矩阵乘法 — "SSM 是结构化的 Attention"
- 实际意义：可以用类似 Attention 的 chunk-wise 并行算法，比 Mamba-1 的 scan 快 2-8x
- 头结构：Mamba-2 引入 multi-head SSM，类似 multi-head attention

#### 7. 总结
- SSM 优势：线性训练复杂度、常数推理缓存（状态大小固定，不随序列长度增长）、高 throughput
- SSM 局限：固定大小状态无法精确检索任意历史 token → copying/in-context learning 弱
- 引出下篇：Hybrid 架构如何取长补短

### 5 个交互组件

#### SSMStateRecurrence
- **类型**: StepNavigator (4 steps)
- **功能**: 逐步展示 SSM 递推过程
  - Step 1: 初始状态 $x_0 = 0$，展示空状态向量
  - Step 2: 输入 token $u_1$，计算 $x_1 = \bar{B}u_1$，状态开始编码信息
  - Step 3: 输入 token $u_2$，计算 $x_2 = \bar{A}x_1 + \bar{B}u_2$，展示状态如何混合新旧信息
  - Step 4: 对比 Attention（存储所有 token 的 KV）vs SSM（固定大小状态向量），用内存使用柱状图对比
- **交互**: 无额外交互，纯 StepNavigator

#### RecurrenceConvDuality
- **类型**: Interactive (toggle 切换)
- **功能**: 同一个 SSM 的两种计算视角
  - 左侧 Recurrence：逐步箭头链 $x_0 → x_1 → x_2 → ... → x_n$，每步标注 $\bar{A}$ 和 $\bar{B}u_k$
  - 右侧 Convolution：输入序列 $u$ 与 kernel $\bar{K}$ 的卷积，标注 FFT 加速
  - 底部标注复杂度：Recurrence O(1) per step, O(N) total sequential / Convolution O(N log N) parallel
- **交互**: 点击按钮切换两种视图，切换时高亮等价关系

#### SelectiveScanViz
- **类型**: Interactive (click tokens)
- **功能**: 展示 Mamba 的选择性机制
  - 上方：一行输入 tokens（如 "The cat sat on the mat"）
  - 中间：每个 token 对应的 $\Delta$ 值柱状图，颜色编码（大 $\Delta$ = 绿色/记住，小 $\Delta$ = 红色/遗忘）
  - 下方：状态向量热力图，展示哪些信息被保留
  - 预设场景："cat" 和 "mat" 等内容词 $\Delta$ 大，"the" "on" 等功能词 $\Delta$ 小
- **交互**: 点击不同 token 高亮其对状态的影响

#### MambaBlockDiagram
- **类型**: Static SVG
- **功能**: Mamba block 完整架构图
  - 输入 → Linear projection (expand D → ED) → 分支：
    - 上分支: Conv1d → SiLU → SSM → 输出
    - 下分支: SiLU (gate)
  - 两分支相乘 → Linear projection (contract ED → D) → 残差连接
  - 标注每步的 tensor shape 和参数名
  - 底部注释：无 Attention、无传统 MLP，比 Transformer block 更简洁

#### SSDAttentionEquivalence
- **类型**: StepNavigator (3 steps)
- **功能**: Mamba-2 的 SSM-Attention 对偶性可视化
  - Step 1: SSM 递推展开为矩阵形式 $Y = M \cdot U$，其中 $M$ 是 semiseparable matrix
  - Step 2: Attention 计算 $Y = \text{softmax}(QK^T) \cdot V$，展示 $QK^T$ 是 dense matrix
  - Step 3: 并排对比：SSM 的 $M$ 矩阵（带结构的稀疏）vs Attention 的 score matrix（dense），标注"SSM 是加了结构约束的 Attention"，chunk-wise 算法示意

---

## Article 2: Hybrid 架构：Mamba 与 Attention 的融合

### Frontmatter

```yaml
title: "Hybrid 架构：Mamba 与 Attention 的融合"
slug: "hybrid-architectures"
locale: "zh"
tags: [hybrid, mamba, jamba, zamba, hymba, architecture]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [state-space-models, mixture-of-experts]
references:
  - type: paper
    title: "Jamba: A Hybrid Transformer-Mamba Language Model"
    url: "https://arxiv.org/abs/2403.19887"
  - type: website
    title: "Zamba2-Small: A Hybrid SSM-Transformer Model"
    url: "https://www.zyphra.com/post/zamba2-small"
  - type: paper
    title: "Hymba: A Hybrid-head Architecture for Small Language Models"
    url: "https://arxiv.org/abs/2411.13676"
  - type: paper
    title: "An Empirical Study of Mamba-based Language Models"
    url: "https://arxiv.org/abs/2406.07887"
  - type: paper
    title: "Repeat After Me: Transformers are Better than State Space Models at Copying"
    url: "https://arxiv.org/abs/2402.01032"
```

### 内容大纲

#### 1. 引言：纯 SSM 为什么不够
- 固定大小 latent state 的根本限制：N 维状态向量无法精确存储 M 个 token（M >> N 时信息必然丢失）
- 实验证据：Transformer 两层可以 copy 指数长度字符串，SSM 做不到（Jelassi et al. 2024）
- 8B Mamba-2-Hybrid 在 12 个标准 benchmark 上比 8B 纯 Transformer 平均高 2.65 分 — Hybrid 是严格更优解

#### 2. 三种融合范式
- **交替式 (Interleaved)**：Mamba 层和 Attention 层按固定比例交替堆叠
  - 优点：实现简单，可控制 SSM/Attention 比例
  - 缺点：层间交互依赖堆叠顺序
  - 代表：Jamba (7:1 Mamba:Attention)
- **并行式 (Parallel)**：同一层内 SSM heads 和 Attention heads 并行运行，输出融合
  - 优点：每层同时获得精确检索（Attention）和高效摘要（SSM）
  - 缺点：实现复杂，需要协调两种 head 的维度
  - 代表：Hymba
- **共享式 (Shared)**：少量 Attention 层被多个位置的 Mamba 层复用（参数共享）
  - 优点：极致参数效率，少量 Attention 层即可补足 SSM 缺陷
  - 缺点：共享层成为瓶颈，需要额外机制（如 LoRA）做位置特化
  - 代表：Zamba2 (2 个共享 Attention，ABAB 交替)

#### 3. Jamba：大规模交替式 Hybrid
- 架构：80 层，每 8 层中 7 层 Mamba + 1 层 Attention，部分层使用 MoE（16 experts, top-2）
- 设计动机：大部分层用 Mamba 节省 KV cache，少量 Attention 保证 ICL 能力
- 关键数据：256K context，52B 总参/12B active 参，单卡 80GB 可部署
- 对比：同参数纯 Transformer 在 256K context 下 KV cache 爆炸，Jamba 的 KV cache 仅为 1/8

#### 4. Zamba2：参数高效的共享式 Hybrid
- 架构：Mamba2 backbone + 2 个共享 Attention 层（ABAB 模式）+ LoRA projectors
- 核心创新：共享 Attention 参数 + 每个调用位置用 LoRA 做特化，兼得参数效率和层间差异
- 嵌入拼接：原始 embedding 拼接到每个 Attention block 输入，防止深层信息退化
- 关键数据：2.7B 参数，推理效率等于 1-2B Transformer，质量等于 3-4B Transformer
- 比 Phi3-3.8B：2x 更快 TTFT，27% 更少显存，1.29x 更低生成延迟

#### 5. Hymba：并行融合 + Meta Tokens
- 架构：每层内 Attention heads 和 SSM heads 并行，输出相加
- Meta tokens：可学习的 token 前缀，存储全局关键信息，减少 Attention 需要处理的序列长度
- Cross-layer KV sharing + partial sliding window attention：进一步压缩 KV cache
- 关键数据：1.5B 参数，超越 Llama-3.2-3B (+1.32% avg)，KV cache 小 11.67x，throughput 高 3.49x

#### 6. 架构选型指南
- 长上下文 + 大模型 → Jamba 式交替（高 SSM 比例压缩 KV cache）
- 小模型 + 端侧部署 → Zamba2 式共享（参数效率最高）
- 强 ICL 需求 + 精确检索 → Hymba 式并行（每层都有 Attention）
- 通用规则：SSM 比例越高 → 长序列效率越好、ICL 越弱；Attention 比例越高 → 反之

#### 7. 总结与展望
- Hybrid 是当前共识：纯 Attention（太贵）和纯 SSM（太弱）都是极端情况
- 趋势：最优 SSM:Attention 比例因任务/规模而异，目前没有统一答案
- 开放问题：如何自动搜索最优混合策略、SSM 能否通过更大状态突破 copying 限制

### 5 个交互组件

#### CopyTaskComparison
- **类型**: Interactive (toggle)
- **功能**: 对比 Transformer vs SSM 在 copying task 上的行为
  - 显示一个输入序列 "A B C D | ? ? ? ?"（需要 copy 前半段）
  - Transformer 视角：Attention 矩阵直接连线到源 token，精确复制
  - SSM 视角：状态向量随时间衰减，越早的 token 信息越模糊
  - 底部：准确率对比 — Transformer 100% vs SSM 随序列增长下降
- **交互**: toggle 切换 Transformer/SSM 视角

#### HybridPatternCompare
- **类型**: Interactive (3 tabs)
- **功能**: 三种融合范式的 layer stack 可视化
  - Tab 1 交替式：layer stack 中 Mamba 层（蓝色）和 Attention 层（橙色）按比例排列
  - Tab 2 并行式：每层内部左右分栏，左 SSM heads 右 Attention heads
  - Tab 3 共享式：两个 Attention 层用虚线连接多个调用位置，标注 LoRA
  - 每个 tab 底部标注：参数量估算、KV cache 大小、适用场景
- **交互**: 点击 tab 切换，层数可点击查看详情

#### JambaArchDiagram
- **类型**: Static SVG
- **功能**: Jamba 完整架构图
  - 垂直 layer stack：7 个 Mamba 层（蓝色）+ 1 个 Attention 层（橙色）为一组，重复多组
  - MoE 标记：部分层标注 MoE (16E/2A)
  - 右侧注释：KV cache 仅在 Attention 层生成，Mamba 层用固定状态
  - 底部：参数分布饼图 — Mamba 层 vs Attention 层 vs MoE experts

#### HymbaParallelHeads
- **类型**: StepNavigator (3 steps)
- **功能**: Hymba 并行融合流程
  - Step 1: 输入 token embedding + meta tokens 拼接
  - Step 2: 分流到 Attention heads（处理拼接序列）和 SSM heads（只处理 token 序列），并行计算
  - Step 3: 两组 heads 输出相加 → LayerNorm → 下一层，标注 cross-layer KV sharing

#### HybridModelBenchmark
- **类型**: Interactive (hover)
- **功能**: 模型对比表
  - 行：Jamba / Zamba2 / Hymba / 纯 Transformer baseline / 纯 Mamba baseline
  - 列：总参数 / Active 参数 / SSM:Attn 比例 / Throughput (相对) / Avg Benchmark / KV Cache 大小
  - hover 某行时高亮并展示额外信息（发布时间、组织、关键设计选择）
- **交互**: hover 高亮行

---

## 路径变更

### transformer-core.yaml

在 `mixture-of-experts` 之后追加：

```yaml
  - state-space-models
  - hybrid-architectures
```

路径总文章数：13 → 15

---

## 组件约定

所有组件遵循项目既有约定：
- `import { COLORS, FONTS } from './shared/colors'`
- `const W = 580`
- `export default function ComponentName()`
- StepNavigator: `import StepNavigator from '../primitives/StepNavigator'`
- Static SVG 在 MDX 中不加 `client:visible`
- Interactive / StepNavigator 在 MDX 中加 `client:visible`
- Reference types: `'paper' | 'website' | 'video' | 'repo'`
