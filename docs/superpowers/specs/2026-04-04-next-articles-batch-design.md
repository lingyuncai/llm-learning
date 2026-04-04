# Next Articles Batch — 设计文档

> 日期：2026-04-04
> 状态：Approved

## 概述

在 Transformer Core 学习路径基础上，新增 2 篇文章 + 扩充 2 篇现有文章，共 20 个新交互组件 + 1 个组件更新。

**范围：**
1. Speculative Decoding 扩充（EAGLE3 + Draft Tree 详解）
2. Attention 变体（新文章：SWA、MLA、Hybrid、Cross）
3. MoE（新文章：Sparse MoE 全链路）
4. Positional Encoding 扩充（RoPE 详细动画）

**风格：** 延续 GPU deep-dive 的模式 — 交互动画建立直觉，每个变体配实际采用的模型。

**学习路径更新：** 全部归入 Transformer Core，Attention 变体插在 MQA-GQA 之后，MoE 放末尾。

---

## 文章 1: Speculative Decoding 扩充

**目标文件：** `src/content/articles/zh/speculative-decoding.mdx`（现有文章）
**插入位置：** Lookahead Decoding 之后、对比总结之前

### Section A: Draft Tree 详解（新 section）

**内容：**
- 从 Medusa 的 tree attention 引出：为什么树比序列好（多候选路径并行验证）
- Tree structure 详解：每个节点是一个 token 候选，分支代表不同的预测
- Tree attention mask 的构造（因果关系 + 树结构的组合）
- 验证过程：一次 forward pass 验证整棵树，选最长被接受路径
- Token budget 概念：固定验证 token 数下，树结构 vs 链结构的效率差异

**组件：**
1. **DraftTreeStructure** (交互) — 可视化一棵 draft tree，点击节点展开/折叠分支，标注 accept/reject 状态。展示树形扩展 vs 链式扩展在同一 token budget 下的覆盖差异
2. **TreeAttentionMask** (静态) — 树形 attention mask 矩阵，和标准因果 mask 对比。标注哪些位置可以互相 attend（因果 + 树结构约束）

### Section B: EAGLE-3 详解（新 section）

**内容：**
- EAGLE 1→2→3 的演进线
  - EAGLE-1: feature-level drafting，用 target model hidden state 做 draft 输入
  - EAGLE-2: context-aware dynamic draft tree，根据置信度动态调整树结构
  - EAGLE-3: 从 feature prediction 转为 direct token prediction，multi-layer feature fusion via training-time test
- EAGLE-3 核心改进：从 feature prediction 转为 direct token prediction + multi-layer feature fusion（training-time test 技术）
- 为什么这很重要：EAGLE 1/2 预测 feature 向量再映射到 token，EAGLE-3 直接预测 token 并融合多层特征，更好地利用训练数据 scaling
- 性能对比：EAGLE-3 达到 6.5x 加速比，比 EAGLE-2 提升约 1.4x；SGLang 框架 batch=64 时吞吐提升 1.38x

**组件：**
3. **EagleEvolution** (StepNavigator, 3 步) — EAGLE 1→2→3 架构对比：
   - Step 1: EAGLE-1 — hidden state + token embedding → draft head
   - Step 2: EAGLE-2 — 加上 dynamic draft tree（置信度剪枝）
   - Step 3: EAGLE-3 — direct token prediction + multi-layer feature fusion
4. **DraftVerifyPipeline** (StepNavigator, 2 步) — 
   - Step 1: EAGLE 1/2 feature prediction 流程（hidden state → feature → token）
   - Step 2: EAGLE-3 direct token prediction + multi-layer fusion 流程

### 更新现有组件

5. **SpecMethodComparison** (更新) — 在现有对比表中加入 EAGLE-3 行

### 新增 References

- EAGLE-3: "Scaling up Inference Acceleration of Large Language Models via Training-Time Test" (https://arxiv.org/abs/2503.01840)

---

## 文章 2: Attention 变体

**slug:** `attention-variants`
**difficulty:** advanced
**tags:** [transformer, attention, mla, sliding-window, cross-attention]
**prerequisites:** [multi-head-attention, mqa-gqa, flash-attention]
**归入路径：** Transformer Core（插在 mqa-gqa 之后）

### Section 1: 为什么需要 Attention 变体

**内容：**
- 标准 Multi-Head Attention 的三大瓶颈：$O(n^2)$ 计算复杂度、KV cache 显存占用、长上下文处理
- 三个优化方向：稀疏化（减少计算量）、压缩 KV（减少显存）、混合架构（取长补短）
- GQA 回顾：简短总结 + 链接到已有独立文章（不重复讲）

### Section 2: Sliding Window Attention

**内容：**
- 固定窗口 $w$，每个 token 只 attend 前 $w$ 个 token
- $O(nw)$ 复杂度（vs 标准 $O(n^2)$）
- 多层堆叠后的感受野扩展：$L$ 层 x 窗口 $w$ = 有效上下文 $Lw$
- 和 Flash Attention 的结合（窗口内用 Flash Attention 高效计算）
- **采用者：** Mistral 7B (w=4096), Mixtral 8x7B (w=4096), Gemma 2 (交替层使用)

**组件：**
6. **SlidingWindowVsFullMask** (交互) — 左右对比 full attention mask 和 sliding window mask，可调窗口大小 w，实时显示 $O(n^2)$ vs $O(nw)$ 计算量比。下方标注感受野扩展公式

### Section 3: Hybrid Attention

**内容：**
- 核心思想：不是所有层都需要 full attention — 混合不同类型的 attention 层
- Gemma 2 做法：偶数层 full attention + 奇数层 sliding window attention
- Jamba 做法：Attention 层 + Mamba 层（SSM）交替
- Command-R 做法：部分层 full + 部分层 local
- 设计选择讨论：full 层放哪里？比例怎么定？对模型能力的影响
- **采用者：** Gemma 2, Jamba (AI21), Command-R (Cohere)

**组件：**
7. **HybridLayerStack** (静态) — 纵向 layer stack 图，颜色区分 full/sliding window/Mamba 层，标注 Gemma 2 和 Jamba 的不同配置方案

### Section 4: Cross Attention

**内容：**
- 核心区别：Q 来自一个序列，KV 来自另一个序列
- 数据流：decoder token 作为 Q，encoder output（或图像 token）作为 KV
- Encoder-Decoder 场景：T5, BART（翻译、摘要）
- 多模态场景：图像 token → vision encoder → cross attention → 文本 decoder
- 和 Self-Attention 的对比：参数、计算量、KV cache 行为
- **采用者：** T5, BART, Flamingo, LLaVA (多模态 vision-language)

**组件：**
8. **CrossVsSelfAttention** (StepNavigator, 2 步) —
   - Step 1: Self-Attention — Q/K/V 都来自同一序列，标注数据流
   - Step 2: Cross-Attention — Q 来自 decoder，KV 来自 encoder/vision，标注不同源

### Section 5: Multi-Latent Attention (MLA)

**内容：**
- 核心思想：对 KV cache 做低秩压缩，存 compressed latent $c_{KV}$ 而非完整 K 和 V
- 数学：
  - 压缩：$c_{KV} = W_{DKV} \cdot h$（h 是 hidden state）
  - 解压：$K = W_{UK} \cdot c_{KV}$，$V = W_{UV} \cdot c_{KV}$
  - 只缓存 $c_{KV}$，维度远小于 K+V
- 和 GQA 的对比：GQA 靠共享 KV head 减少缓存，MLA 靠低秩压缩（更激进的压缩比）
- KV cache 节省量计算：标准 MHA vs GQA vs MLA 在相同模型规模下的具体数字
- 实现细节：推理时可以把 $W_{UK}$ 吸收进 $W_Q$，避免显式解压
- **采用者：** DeepSeek-V2, DeepSeek-V3, DeepSeek-R1

**组件：**
9. **MLACompression** (交互) — 可调 d_model、num_heads、latent_dim，实时计算并对比 KV cache 大小：标准 MHA vs GQA (num_kv_heads 可调) vs MLA。柱状图 + 具体数字
10. **MLADataFlow** (静态) — 数据流图：hidden state → $W_{DKV}$ compress → cache $c_{KV}$ → $W_{UK}$/$W_{UV}$ decompress → K, V → attention

### Section 6: 对比总结

**内容：**
- 全景对比表：方法、计算复杂度、KV cache 大小、外推能力、核心思想、代表模型
- 选型指南：场景 → 推荐方案

**组件：**
11. **AttentionVariantComparison** (交互) — 对比表，hover 每个方法展示详情（核心思想、代表模型、关键指标）

### References

- Mistral 7B: https://arxiv.org/abs/2310.06825
- Gemma 2 Technical Report: https://arxiv.org/abs/2408.00118
- Jamba (AI21): https://arxiv.org/abs/2403.19887
- T5: https://arxiv.org/abs/1910.10683
- Flamingo: https://arxiv.org/abs/2204.14198
- DeepSeek-V2: https://arxiv.org/abs/2405.04434

---

## 文章 3: Mixture of Experts (MoE)

**slug:** `mixture-of-experts`
**difficulty:** advanced
**tags:** [transformer, moe, routing, deepseek, mixtral]
**prerequisites:** [transformer-overview]
**归入路径：** Transformer Core（放末尾）

### Section 1: 为什么需要 MoE

**内容：**
- Dense model 的问题：参数量和计算量线性绑定
- MoE 核心思想：参数量大但每个 token 只激活一小部分 → 解耦参数量和计算量
- 关键数字对比：Mixtral 8x7B 有 47B 总参数但每 token 只用 ~13B active 参数的计算量

### Section 2: Sparse MoE 基本原理

**内容：**
- FFN 替换：标准 Transformer 的 FFN 层换成 N 个并行 expert（每个 expert 就是一个 FFN）
- Gating/Router：一个小网络决定每个 token 送给哪些 expert
- Top-K selection：每个 token 选 K 个 expert（通常 K=1 或 K=2），输出加权求和
- 数学：$y = \sum_{i \in \text{TopK}} g_i \cdot E_i(x)$，$g = \text{softmax}(W_g \cdot x)$

**组件：**
12. **MoEBasicFlow** (StepNavigator, 3 步) —
    - Step 1: Token 进入，router 网络对所有 expert 打分
    - Step 2: Top-K 选择（高亮被选中的 expert，灰显其余）
    - Step 3: 选中 expert 并行计算，输出加权合并
13. **DenseVsMoECompare** (静态) — 左右对比 Dense FFN (单个大 FFN) vs MoE FFN (N 个小 expert + router)，标注总参数量和 active 参数量

### Section 3: Router 机制

**内容：**
- Token-choice routing：每个 token 选 top-K expert（主流做法：Mixtral, DeepSeek）
- Expert-choice routing：每个 expert 选 top-K token（Switch Transformer 变体）
- Trade-off：token-choice 简单但 load 不均，expert-choice 均匀但 token 可能被丢弃
- **采用者：** Mixtral (token-choice, top-2), Switch Transformer (token-choice, top-1), DeepSeek-V3 (token-choice, top-8)

**组件：**
14. **RoutingStrategyCompare** (StepNavigator, 2 步) —
    - Step 1: Token-choice — 每个 token 视角，选 top-K expert
    - Step 2: Expert-choice — 每个 expert 视角，选 top-K token

### Section 4: Load Balancing

**内容：**
- 问题：没有约束时 router 倾向于集中到少数 expert（rich-get-richer / expert collapse）
- Auxiliary loss：额外的 loss 项鼓励 expert 负载均匀，$L_{aux} = \alpha \cdot N \sum_i f_i \cdot P_i$（$f_i$ = expert 实际接收比例，$P_i$ = router 分配概率均值）
- Expert capacity：限定每个 expert 每 batch 最多处理 $C$ 个 token，溢出的走 residual
- $\alpha$ 的影响：太大影响模型质量（强制均匀但不自然），太小不够均衡

**组件：**
15. **LoadBalanceViz** (交互) — 可调 aux loss 系数 $\alpha$（0 到 0.1），展示 8 个 expert 的负载分布柱状图。$\alpha=0$ 时极端不均（1-2 个 expert 承担大部分），逐渐增大趋于均匀

### Section 5: DeepSeek 的创新

**内容：**
- Shared Expert：部分 expert 所有 token 必经（不经过 routing），保证基础能力不丢失
- Fine-grained Expert：更多但更小的 expert，更细粒度的专业化
- 为什么这样更好：shared expert 兜底通用知识 + fine-grained expert 精准专业化
- 具体配置：
  - DeepSeek-V2: 160 routed expert + 2 shared expert, top-6
  - DeepSeek-V3: 256 routed expert + 1 shared expert, top-8
- **采用者：** DeepSeek-V2, DeepSeek-V3, DeepSeek-R1

**组件：**
16. **DeepSeekMoEArchitecture** (静态) — DeepSeek 的 shared + routed expert 结构图。标注 shared expert（所有 token 必经）+ routed expert（top-K 选择），标注 DeepSeek-V3 的具体数量

### Section 6: Expert Parallelism

**内容：**
- 部署挑战：256 个 expert 放不进一张卡
- Expert Parallelism (EP)：不同 expert 分布在不同 GPU 上
- All-to-All 通信：每个 GPU 上的 token 需要发送到对应 expert 所在 GPU，计算完再发回
- 和 Tensor Parallelism (TP) / Pipeline Parallelism (PP) 的关系和组合
- 通信开销：expert 越多、GPU 越多 → all-to-all 通信越重

**组件：**
17. **ExpertParallelismDiagram** (静态) — 4 个 GPU 上 expert 的分布，箭头标注 token 的 all-to-all 通信路径（dispatch → compute → combine）

### Section 7: 模型对比总结

**内容：**
- 主流 MoE 模型的配置对比

**组件：**
18. **MoEModelComparison** (静态) — 对比表：模型名、total params、active params、expert 数量、top-K、shared expert、发布时间

### References

- Switch Transformer: https://arxiv.org/abs/2101.03961
- Mixtral 8x7B: https://arxiv.org/abs/2401.04088
- DeepSeek-V2: https://arxiv.org/abs/2405.04434
- DeepSeek-V3: https://arxiv.org/abs/2412.19437
- GShard: https://arxiv.org/abs/2006.16668

---

## 文章 4: Positional Encoding 扩充

**目标文件：** `src/content/articles/zh/positional-encoding.mdx`（现有文章）

### 4a. 维度对频率分解（插入位置：RoPE "核心直觉" 之后，"数学推导" 之前）

**内容：**
- 每对维度 $(d_{2i}, d_{2i+1})$ 对应基础角度 $\theta_i = 10000^{-2i/d}$
- 低维度（小 $i$）= 高频旋转（位置变化一点角度就大变，捕捉局部关系）
- 高维度（大 $i$）= 低频旋转（位置变化很多角度才明显变，捕捉远距离关系）
- 类比 Sinusoidal 的多频率思想，但用旋转实现

**组件：**
19. **RoPEFrequencyBands** (交互) — 可调位置 pos（slider），展示各维度对的旋转角度 $m\theta_i$。热力图：x 轴 = 维度对 index $i$，y 轴 = 位置 pos，颜色 = 角度值。标注高频（左侧变化快）和低频（右侧变化慢）

### 4b. 复数视角（插入位置：数学推导之后）

**内容：**
- RoPE 的等价复数表示：把每对维度 $(q_{2i}, q_{2i+1})$ 看作复数 $q_{2i} + q_{2i+1} \cdot j$
- 旋转 = 复数乘法：$\tilde{q} = q \cdot e^{im\theta}$
- 关键推导：$\tilde{q}_m \cdot \overline{\tilde{k}_n} = q \cdot \bar{k} \cdot e^{i(m-n)\theta}$ → 内积只依赖 $m-n$
- 实现层面：不需要矩阵乘法，只需 element-wise 的 cos/sin 操作（高效）

**组件：**
20. **RoPEComplexPlane** (StepNavigator, 3 步) —
    - Step 1: Q 向量的一对维度在复平面上表示为一个点/向量
    - Step 2: 乘以 $e^{im\theta}$，向量旋转 $m\theta$ 角度（动画展示旋转过程）
    - Step 3: Q 和 K 都旋转后，内积只取决于旋转角度差 $\Delta\theta = (m-n)\theta$

### 4c. 长度外推可视化（扩充现有"长度外推问题"段落）

**内容：**
- 可视化训练范围内 vs 训练范围外的角度分布
- 超出训练长度后：高频分量的角度值超出训练时见过的范围 → attention score 异常
- NTK-aware scaling：修改基数 $b' = b \cdot s^{d/(d-2)}$，压缩高频角度
- YaRN：对不同频率分量使用不同缩放因子（混合策略）

**组件：**
21. **RoPEExtrapolation** (交互) — 可调参数：序列长度 (slider, 从训练长度到 4x 训练长度)、scaling 方法 (None / NTK / YaRN)。展示各维度对的角度覆盖范围，标注训练范围（绿色区域）和外推区域（红色区域）。NTK/YaRN 时显示角度被压缩回训练范围

---

## 学习路径更新

**文件：** `src/content/paths/transformer-core.yaml`

更新后的文章顺序：
```yaml
articles:
  - transformer-overview
  - qkv-intuition
  - attention-mechanism
  - multi-head-attention
  - mqa-gqa
  - attention-variants          # 新增
  - kv-cache
  - prefill-vs-decode
  - flash-attention
  - positional-encoding         # 扩充
  - sampling-and-decoding
  - speculative-decoding        # 扩充
  - mixture-of-experts          # 新增
```

---

## 组件清单

| # | 组件名 | 类型 | 文章 |
|---|--------|------|------|
| 1 | DraftTreeStructure | 交互 | Spec Dec |
| 2 | TreeAttentionMask | 静态 | Spec Dec |
| 3 | EagleEvolution | StepNavigator (3步) | Spec Dec |
| 4 | DraftVerifyPipeline | StepNavigator (2步) | Spec Dec |
| 5 | SpecMethodComparison | 更新现有 | Spec Dec |
| 6 | SlidingWindowVsFullMask | 交互 | Attention 变体 |
| 7 | HybridLayerStack | 静态 | Attention 变体 |
| 8 | CrossVsSelfAttention | StepNavigator (2步) | Attention 变体 |
| 9 | MLACompression | 交互 | Attention 变体 |
| 10 | MLADataFlow | 静态 | Attention 变体 |
| 11 | AttentionVariantComparison | 交互 | Attention 变体 |
| 12 | MoEBasicFlow | StepNavigator (3步) | MoE |
| 13 | DenseVsMoECompare | 静态 | MoE |
| 14 | RoutingStrategyCompare | StepNavigator (2步) | MoE |
| 15 | LoadBalanceViz | 交互 | MoE |
| 16 | DeepSeekMoEArchitecture | 静态 | MoE |
| 17 | ExpertParallelismDiagram | 静态 | MoE |
| 18 | MoEModelComparison | 静态 | MoE |
| 19 | RoPEFrequencyBands | 交互 | Pos Encoding |
| 20 | RoPEComplexPlane | StepNavigator (3步) | Pos Encoding |
| 21 | RoPEExtrapolation | 交互 | Pos Encoding |

**总计：21 个新组件 + 1 个更新 = 22 个组件任务**
