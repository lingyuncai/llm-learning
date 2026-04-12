# Transformer 跨模态应用 — 学习路径设计

> Created: 2026-04-12

## 概述

新建学习路径 `transformer-across-modalities`，覆盖 Transformer 在文本、视觉、音频、视频等模态的应用。以"同一个 Transformer，不同的 tokenization 和 embedding 策略"为主线，从文本表征基础讲到多模态生成。

## 设计决策

| 决策项 | 选择 |
|--------|------|
| 目标读者 | 混合：前 3 篇 beginner 友好，后面假设有 Transformer 基础 |
| 技术深度 | 架构级：直觉优先 + 关键公式，不贴代码 |
| 扩散模型 | 拆两篇：diffusion-fundamentals + diffusion-transformer |
| 音频 | 全面覆盖（识别、合成、音乐），拆两篇 |
| 交互组件 | 每篇做足 4-6 个 |
| 双语 | 中英文同步 |
| 叙事结构 | 线性递进（方案 A） |
| 实施顺序 | 按依赖关系 + 并行度优化 |

## 路径定义

- **路径 ID**: `transformer-across-modalities`
- **路径级别**: intermediate
- **前置路径**: `transformer-core`（文章 4/5/7/8/9/10 直接或间接依赖 `transformer-overview`，前 3 篇和文章 6 可独立阅读）

### 文章列表（10 篇）

| # | slug | 标题 (zh) | 标题 (en) | 难度 |
|---|------|-----------|-----------|------|
| 1 | `text-representation` | 从文本到向量：Tokenization 与词嵌入 | From Text to Vectors: Tokenization and Word Embeddings | beginner |
| 2 | `bert-and-gpt` | BERT 与 GPT：理解与生成的两条路线 | BERT and GPT: Two Paths — Understanding vs Generation | intermediate |
| 3 | `sentence-embeddings` | 句子嵌入：从 Token 级到语义检索 | Sentence Embeddings: From Token-Level to Semantic Retrieval | intermediate |
| 4 | `vision-transformer` | Vision Transformer：当图像变成 Token 序列 | Vision Transformer: When Images Become Token Sequences | intermediate |
| 5 | `multimodal-alignment` | 多模态对齐：CLIP 与跨模态嵌入空间 | Multimodal Alignment: CLIP and Cross-Modal Embedding Spaces | intermediate |
| 6 | `diffusion-fundamentals` | 扩散模型基础：从噪声中生成 | Diffusion Model Fundamentals: Generating from Noise | intermediate |
| 7 | `diffusion-transformer` | Diffusion Transformer：用 Transformer 做图像生成 | Diffusion Transformer: Image Generation with Transformers | advanced |
| 8 | `video-generation` | 视频生成：时空注意力与 Sora 架构 | Video Generation: Spatiotemporal Attention and Sora Architecture | advanced |
| 9 | `audio-speech-models` | 语音与 Transformer：从 Whisper 到 VALL-E | Speech and Transformers: From Whisper to VALL-E | advanced |
| 10 | `audio-music-generation` | 音乐生成：当 Transformer 学会作曲 | Music Generation: When Transformers Learn to Compose | advanced |

### 文章间依赖关系

```
text-representation (1)
  → bert-and-gpt (2)
    → sentence-embeddings (3) ──┐
                                ├→ multimodal-alignment (5)
vision-transformer (4) ─────────┘

diffusion-fundamentals (6)
  → diffusion-transformer (7)
    → video-generation (8)

audio-speech-models (9)
  → audio-music-generation (10)
```

每篇 MDX 的 `prerequisites` 字段精确指定依赖的 slug，非线性的读者可以按需跳读。

> **注意**：现有路径 YAML schema 无 `prerequisites` 字段，路径级前置关系通过 `description` 文字说明（如"建议先完成 Transformer 核心机制路径"），具体依赖由各文章 frontmatter 的 `prerequisites` 承载。

## 各文章详细设计

---

### 文章 1: `text-representation`

**核心问题**：一句话怎么变成模型能处理的数字？

**难度**: beginner | **prerequisites**: 无

**内容结构**：

1. **为什么需要 tokenization**：字符级（太细，序列太长）vs 词级（太粗，OOV 问题）→ subword 的折中
2. **BPE 算法**：从字符开始，统计相邻 pair 频率，逐步合并。merge 规则、vocab size 的 trade-off（小词表 = 长序列，大词表 = 大 embedding 矩阵）
3. **其他方案对比**：WordPiece（BERT，基于似然而非频率）、SentencePiece（语言无关，直接处理 raw text）、Tiktoken（GPT 系列，byte-level BPE）
4. **从 token 到向量**：one-hot 的维度灾难 → 分布式假说（"You shall know a word by the company it keeps"）
5. **Word2Vec**：Skip-gram（给中心词预测上下文）和 CBOW（给上下文预测中心词），向量空间的类比关系（king - man + woman ≈ queen）
6. **GloVe**：全局共现矩阵分解 + 局部窗口的结合，与 Word2Vec 的互补
7. **静态嵌入的局限**：一词多义（bank = 银行/河岸），嵌入不随上下文变化 → 引出下篇

**交互组件（5 个）**：

| 组件 | 功能 |
|------|------|
| `BPEMergeVisualization` | 输入文本，逐步展示 BPE merge 过程（频率统计 → 合并 → 新 vocab） |
| `TokenizerComparison` | 同一句话在 BPE / WordPiece / SentencePiece 下的不同切分结果对比 |
| `WordEmbeddingSpace` | 2D t-SNE/PCA 投影展示词向量空间，可交互探索 analogy 关系 |
| `SkipgramTraining` | 动画展示 Skip-gram 的滑动窗口：中心词高亮 → 上下文窗口 → 训练目标 |
| `StaticVsContextual` | 同一个词在不同句子中：静态嵌入（相同点）vs 上下文嵌入（不同点），为下篇埋伏笔 |

**参考文献**：
- Mikolov et al. 2013 — "Efficient Estimation of Word Representations in Vector Space"
- Sennrich et al. 2016 — "Neural Machine Translation of Rare Words with Subword Units"
- Pennington et al. 2014 — "GloVe: Global Vectors for Word Representation"
- Kudo & Richardson 2018 — "SentencePiece: A simple and language independent subword tokenizer"
- Jay Alammar — "The Illustrated Word2Vec"
- Hugging Face — Tokenizer Summary

---

### 文章 2: `bert-and-gpt`

**核心问题**：同一个 Transformer，为什么分化出"理解"和"生成"两条路线？

**难度**: intermediate | **prerequisites**: `text-representation`

**内容结构**：

1. **从静态到上下文**：ELMo 的双向 LSTM → 为什么 Transformer 更好（并行 + 全局注意力）
2. **BERT：理解派**
   - 预训练：MLM（随机 mask 15% tokens，预测被 mask 的词）+ NSP（Next Sentence Prediction）
   - `[CLS]` token 的设计：整句表征的汇聚点
   - Fine-tuning 范式：预训练权重 + task-specific head，少量标注数据即可适配
   - **实战：NLU 联合模型**
     - 意图识别：`[CLS]` → intent classification head（softmax over intent labels）
     - 槽位填充：每个 token → BIO 标注 head（B-city, I-city, O...）
     - 联合 loss：$\mathcal{L} = \alpha \mathcal{L}_{\text{intent}} + (1-\alpha) \mathcal{L}_{\text{slot}}$
     - 为什么联合训练优于分开训练：共享表征使意图和槽位互相增强
3. **GPT：生成派**
   - 自回归 next-token prediction + causal mask
   - GPT-1（fine-tune）→ GPT-2（zero-shot emergent）→ GPT-3（in-context learning）
   - Scaling law：模型越大，涌现能力越强
4. **Classification vs Generation 范式对比**
   - 同一任务两种解法：情感分析（BERT: `[CLS]` → softmax / GPT: "这句话的情感是" → 生成 "正面"）
   - 意图识别：BERT joint model vs GPT function calling / structured output
   - Trade-off：分类（快、确定性高、需标注训练） vs 生成（灵活、零样本、慢且不确定）
   - 行业趋势：从专用小模型到通用大模型的迁移
5. **殊途同归**：为什么 decoder-only 最终成为主流（scaling law 视角）+ BERT 的遗产仍活跃在嵌入、检索、理解类任务中

**交互组件（5 个）**：

| 组件 | 功能 |
|------|------|
| `MLMDemo` | 给一句话随机 mask，用户点击猜词 → 揭示 BERT 的训练目标 |
| `BERTNLUPipeline` | 动画：输入句子 → BERT 编码 → `[CLS]` 进 intent head + token 输出进 BIO head → 联合结果 |
| `AutoregressiveGeneration` | 逐 token 生成动画，causal mask 可视化（每步只能看到左侧 token） |
| `ClassificationVsGeneration` | 左右分屏对比：同一个任务的分类解法 vs 生成解法，输入/模型/输出全流程 |
| `ScalingLawChart` | GPT-1/2/3 的参数量、数据量、性能曲线，标注关键里程碑 |

**参考文献**：
- Devlin et al. 2019 — "BERT: Pre-training of Deep Bidirectional Transformers"
- Radford et al. 2018 — "Improving Language Understanding by Generative Pre-Training" (GPT-1)
- Radford et al. 2019 — "Language Models are Unsupervised Multitask Learners" (GPT-2)
- Brown et al. 2020 — "Language Models are Few-Shot Learners" (GPT-3)
- Chen & Cao 2019 — "BERT for Joint Intent Classification and Slot Filling"
- Kaplan et al. 2020 — "Scaling Laws for Neural Language Models"

---

### 文章 3: `sentence-embeddings`

**核心问题**：怎么把整个句子/段落变成一个可以用来检索的向量？

**难度**: intermediate | **prerequisites**: `bert-and-gpt`

**内容结构**：

1. **为什么 token 级不够**：检索、语义相似度、聚类需要固定维度的句子级表征
2. **朴素方法的问题**：平均 token 嵌入 → anisotropy（向量集中在高维锥形区域，余弦相似度区分度低）
3. **Sentence-BERT**：Siamese 网络结构，两句话分别过 BERT → pooling → 对比 cosine similarity
4. **对比学习核心**：正例对（同义句）vs 负例对（随机配对），InfoNCE loss，hard negative mining
5. **现代句子嵌入**：E5（弱监督 + 指令微调）、BGE（中文友好）、OpenAI Embeddings API
6. **应用：RAG 的基石**：query embedding → ANN 检索 → top-k 上下文注入 → LLM 生成

**交互组件（4 个）**：

| 组件 | 功能 |
|------|------|
| `SentenceSimilarityDemo` | 输入两句话，可视化余弦相似度计算过程（向量 → 点积 → 角度） |
| `SiameseNetworkFlow` | Sentence-BERT Siamese 架构动画：两路 BERT → pooling → 相似度 |
| `ContrastiveLearningViz` | 批内正负例对的训练过程：正例拉近、负例推远的动画 |
| `RAGPipelineFlow` | 完整 RAG 流程动画：query → embedding → 向量库检索 → context 注入 → 生成 |

**参考文献**：
- Reimers & Gurevych 2019 — "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks"
- Wang et al. 2022 — "Text Embeddings by Weakly-Supervised Contrastive Pre-training" (E5)
- Xiao et al. 2023 — "C-Pack: Packaged Resources To Advance General Chinese Embedding" (BGE)
- Lewis et al. 2020 — "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"

---

### 文章 4: `vision-transformer`

**核心问题**：图像没有"词"，怎么变成 token 序列喂给 Transformer？

**难度**: intermediate | **prerequisites**: `transformer-overview`

**内容结构**：

1. **从 CNN 到 ViT 的动机**：CNN 的局部归纳偏置 vs Transformer 的全局注意力
2. **Patch Embedding**：图像切成 16×16 patch → 展平 → 线性投影 → 这就是"token"。类比文本 tokenization
3. **位置编码**：2D 位置信息如何编码（可学习绝对位置编码，1D 化后的 2D 语义）
4. **`[CLS]` token**：和 BERT 一样，插入可学习 class token 做分类
5. **完整前向流程**：image → patches → embedding + pos → Transformer Encoder → `[CLS]` → classification
6. **与 CNN 的核心对比**：数据效率（ViT 需更多数据/预训练）、scaling 特性（大数据下 ViT 超越 CNN）
7. **后续变体**：DeiT（数据高效蒸馏训练）、Swin Transformer（层级窗口注意力，计算更高效）

**交互组件（5 个）**：

| 组件 | 功能 |
|------|------|
| `PatchEmbeddingDemo` | 选择一张图，动画展示切 patch → 展平 → 线性投影的过程 |
| `PatchPositionEncoding` | 可视化 patch 的位置编码相似度矩阵，展示 2D 空间结构 |
| `ViTForwardFlow` | 完整前向流程动画：图像 → patches → Transformer → `[CLS]` → 分类 |
| `CNNvsViTComparison` | 左右对比：CNN 感受野逐层扩大 vs ViT 全局注意力一步到位 |
| `ViTScalingChart` | 不同规模 × 不同数据量下 ViT vs CNN 的性能曲线 |

**参考文献**：
- Dosovitskiy et al. 2021 — "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"
- Touvron et al. 2021 — "Training data-efficient image transformers & distillation through attention" (DeiT)
- Liu et al. 2021 — "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows"

---

### 文章 5: `multimodal-alignment`

**核心问题**：怎么让"一张猫的图片"和"a photo of a cat"落在向量空间的同一个位置？

**难度**: intermediate | **prerequisites**: `vision-transformer`, `sentence-embeddings`

**内容结构**：

1. **为什么需要跨模态对齐**：图文检索、zero-shot 分类、文生图的前提
2. **CLIP 架构**：双塔结构
   - Image encoder：ViT（或 ResNet 变体）
   - Text encoder：Transformer
   - 训练目标：batch 内 image-text 配对的对比学习，对角线相似度最大化
   - InfoNCE loss with learnable temperature
3. **Zero-shot 分类**：text prompt 作为"分类器权重"，无需 fine-tune
4. **CLIP 的下游影响**：
   - Stable Diffusion：CLIP text encoder 做条件输入
   - LLaVA：CLIP vision encoder 提取视觉 token → LLM
   - 检索系统：跨模态语义搜索
5. **局限与演进**：ALIGN（noisy data at scale）、SigLIP（sigmoid 替代 softmax，更高效）、EVA-CLIP

**交互组件（5 个）**：

| 组件 | 功能 |
|------|------|
| `DualEncoderArchitecture` | CLIP 双塔动画：image 和 text 分别编码后在共享空间相遇 |
| `ContrastiveMatrix` | batch 内对比矩阵可视化：对角线为正例，其余为负例 |
| `ZeroShotClassification` | 选择图片 + 输入候选 label → 展示 CLIP zero-shot 分类流程 |
| `CLIPDownstream` | CLIP 三大下游应用流程图：文生图 / 多模态 LLM / 检索 |
| `EmbeddingSpaceProjection` | 2D 投影：训练前后 image 和 text embedding 的对齐程度变化 |

**参考文献**：
- Radford et al. 2021 — "Learning Transferable Visual Models From Natural Language Supervision" (CLIP)
- Jia et al. 2021 — "Scaling Up Visual and Vision-Language Representation Learning With Noisy Text Supervision" (ALIGN)
- Zhai et al. 2023 — "Sigmoid Loss for Language Image Pre-Training" (SigLIP)
- Liu et al. 2023 — "Visual Instruction Tuning" (LLaVA)

---

### 文章 6: `diffusion-fundamentals`

**核心问题**：扩散模型怎么从纯噪声中"变"出一张图像？

**难度**: intermediate | **prerequisites**: 无（独立入口，不需要 Transformer 前置知识）

**内容结构**：

1. **生成模型家族**：GAN（对抗训练）、VAE（变分推断）、Flow（可逆变换）、Diffusion（迭代去噪）— 简要对比不同哲学
2. **前向扩散过程**：逐步加高斯噪声 $q(x_t | x_{t-1})$，经过 $T$ 步后变成纯噪声。噪声调度（linear vs cosine schedule）
3. **反向去噪过程**：学习 $p_\theta(x_{t-1} | x_t)$，从噪声逐步恢复图像
4. **DDPM 核心洞察**：不直接预测 $x_0$，而是预测噪声 $\epsilon$。训练目标简化为 $\mathcal{L} = \| \epsilon - \epsilon_\theta(x_t, t) \|^2$
5. **U-Net 骨干网络**：为什么 U-Net 是默认选择（多尺度特征 + skip connection），下采样→中间层→上采样的结构
6. **条件生成**：Classifier guidance → Classifier-free guidance（CFG），guidance scale 的效果
7. **加速采样**：DDIM（非马尔可夫，可跳步）、步数 vs 质量的 trade-off
8. **Latent Diffusion**：在 VAE 的潜空间中做扩散（Stable Diffusion 的核心思路），大幅降低计算量

**交互组件（5 个）**：

| 组件 | 功能 |
|------|------|
| `ForwardDiffusionProcess` | 动画展示一张图逐步加噪的过程（$t=0$ 到 $t=T$），可拖动时间步 |
| `ReverseDenoisingSteps` | 从纯噪声逐步去噪恢复图像的动画，展示每步的细节逐渐浮现 |
| `NoiseScheduleComparison` | 对比 linear 和 cosine noise schedule 的噪声量曲线 |
| `UNetArchitecture` | U-Net 结构示意：下采样路径 → bottleneck → 上采样路径 + skip connections |
| `GuidanceScaleDemo` | 拖动 guidance scale 滑块，展示生成图像从"多样但模糊"到"精确但单一"的变化 |

**参考文献**：
- Ho et al. 2020 — "Denoising Diffusion Probabilistic Models" (DDPM)
- Song et al. 2021 — "Denoising Diffusion Implicit Models" (DDIM)
- Rombach et al. 2022 — "High-Resolution Image Synthesis with Latent Diffusion Models" (Stable Diffusion)
- Ho & Salimans 2022 — "Classifier-Free Diffusion Guidance"

---

### 文章 7: `diffusion-transformer`

**核心问题**：为什么要用 Transformer 替代 U-Net 做扩散模型的骨干？

**难度**: advanced | **prerequisites**: `diffusion-fundamentals`, `transformer-overview`

**内容结构**：

1. **U-Net 的瓶颈**：固定分辨率假设、归纳偏置限制 scaling、架构搜索空间有限
2. **DiT 核心设计**：
   - Patchify：图像（或 latent）切成 patch → 线性投影为 token（和 ViT 一样的思路）
   - Transformer blocks 替代 U-Net 的 down/up sampling
   - Unpatchify：最终 token 重组为图像
3. **条件注入方式**：timestep $t$ 和 class $c$ 如何注入
   - In-context conditioning（拼接为额外 token）
   - Cross-attention conditioning
   - **adaLN-Zero**（胜出方案）：用 $t$ 和 $c$ 预测 LayerNorm 的 $\gamma, \beta$ 和 gate 参数
4. **Scaling 特性**：DiT-S/B/L/XL 的 FID 随 compute 下降的曲线，验证 Transformer 的 scaling law 在生成任务上也成立
5. **实际影响**：
   - Stable Diffusion 3 / Flux 的 MM-DiT（多模态双流 DiT）
   - DALL-E 3 的骨干
   - 为什么 DiT 成为图像生成新范式

**交互组件（5 个）**：

| 组件 | 功能 |
|------|------|
| `UNetVsDiTArchitecture` | 左右对比 U-Net 和 DiT 的架构：相同的输入输出，不同的中间处理 |
| `DiTPatchifyProcess` | 动画：latent → patch 切分 → 线性投影 → Transformer blocks → unpatchify → 输出 |
| `AdaLNZeroMechanism` | adaLN-Zero 的工作原理：timestep/class → MLP → 预测 γ, β, α → 调制 LayerNorm |
| `DiTScalingChart` | FID vs GFLOPs 曲线，标注 DiT-S/B/L/XL 各点 |
| `MMDiTFlow` | Stable Diffusion 3 的 MM-DiT：text stream 和 image stream 的双流交互 |

**参考文献**：
- Peebles & Xie 2023 — "Scalable Diffusion Models with Transformers" (DiT)
- Esser et al. 2024 — "Scaling Rectified Flow Transformers for High-Resolution Image Synthesis" (SD3 / MM-DiT)

---

### 文章 8: `video-generation`

**核心问题**：如何从图像生成扩展到视频生成？时间维度带来了什么新挑战？

**难度**: advanced | **prerequisites**: `diffusion-transformer`

**内容结构**：

1. **视频 = 图像 + 时间**：额外的时间维度带来的计算和一致性挑战
2. **视频 tokenization**：3D patch（空间 $H \times W$ + 时间 $T$），类比 ViT 的 2D patch
3. **时空注意力设计**：
   - 完全 3D 注意力（计算量爆炸）
   - 分解方案：空间注意力（帧内） + 时间注意力（跨帧），交替或并行
   - 因果时间注意力 vs 双向时间注意力
4. **Sora 架构解析**（基于技术报告和公开信息）：
   - "Visual patches" 作为通用视觉表征
   - 可变时长、分辨率、宽高比的处理
   - 联合图像-视频训练
   - 文本条件注入
5. **关键挑战**：
   - 时间一致性（物体不闪烁、不变形）
   - 长视频生成（几秒 vs 几分钟）
   - 计算成本（比图像高 10-100 倍）
6. **其他方案**：Make-A-Video（text→image→video pipeline）、VideoLDM（temporal layer 插入 latent diffusion）、Runway Gen 系列

**交互组件（5 个）**：

| 组件 | 功能 |
|------|------|
| `SpatiotemporalPatchDemo` | 3D 可视化：视频帧序列如何被切成 (x, y, t) 的 3D patch |
| `SpatialVsTemporalAttention` | 动画对比：空间注意力（帧内 token 互连）vs 时间注意力（跨帧同位置互连） |
| `VideoConsistencyChallenge` | 展示时间不一致的典型问题：闪烁、变形、消失，解释为什么视频比图像难 |
| `VariableResolutionDemo` | Sora 的灵活性：同一模型处理不同宽高比和时长的视频 |
| `VideoGenTimeline` | 视频生成发展时间线：2022-2025 的关键模型和里程碑 |

**参考文献**：
- Brooks et al. 2024 — "Video generation models as world simulators" (Sora technical report)
- Singer et al. 2023 — "Make-A-Video: Text-to-Video Generation without Text-Video Data"
- Blattmann et al. 2023 — "Align your Latents: High-Resolution Video Synthesis with Latent Diffusion Models"

---

### 文章 9: `audio-speech-models`

**核心问题**：语音信号怎么 token 化？Transformer 如何做语音识别和合成？

**难度**: advanced | **prerequisites**: `transformer-overview`

**内容结构**：

1. **音频 tokenization 的两条路**：
   - 频谱方案：原始波形 → STFT → Mel spectrogram → 2D "图像"（Whisper 的输入）
   - 神经编解码方案：原始波形 → EnCodec / SoundStream → 离散 codec token 序列（VALL-E 的输入）
   - 对比：连续频谱（保留细节，计算量大）vs 离散 token（压缩率高，信息有损）
2. **Whisper：通用语音识别**
   - Encoder-decoder 架构（不是 decoder-only）
   - 输入：30 秒 log-Mel spectrogram → CNN stem → Transformer encoder
   - 输出：自回归解码文本（含语言标记、时间戳等特殊 token）
   - 多任务设计：一个模型同时做语音识别、翻译、语言检测、VAD
   - 68 万小时弱监督数据的力量
3. **VALL-E：语音合成的 GPT 时刻**
   - 把 TTS 重新定义为"语言模型问题"：给文本 + 3 秒语音 prompt → 生成完整语音
   - EnCodec 的 8 层 residual vector quantization (RVQ)
   - 两阶段生成：AR 模型生成第 1 层 codec → NAR 模型生成剩余层
   - Zero-shot voice cloning 能力
4. **Bark 与其他 TTS**：纯 GPT 风格的语音生成，支持笑声、停顿等非语言元素

**交互组件（5 个）**：

| 组件 | 功能 |
|------|------|
| `AudioTokenizationComparison` | 对比两条路：波形 → Mel spectrogram vs 波形 → EnCodec tokens，展示各自的表示形式 |
| `MelSpectrogramVisualization` | 可视化一段音频的 Mel 频谱图，标注时间轴和频率轴 |
| `WhisperArchitecture` | Whisper 完整流程动画：音频 → Mel → CNN → Encoder → Decoder → 文本 |
| `VALLEPipeline` | VALL-E 流程：文本 + 语音 prompt → EnCodec → AR 生成 → NAR 补全 → 解码 |
| `RVQLayerVisualization` | EnCodec 的 RVQ 分层：每层依次细化，从粗粒度到精细音质 |

**参考文献**：
- Radford et al. 2023 — "Robust Speech Recognition via Large-Scale Weak Supervision" (Whisper)
- Wang et al. 2023 — "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers" (VALL-E)
- Défossez et al. 2023 — "High Fidelity Neural Audio Compression" (EnCodec)

---

### 文章 10: `audio-music-generation`

**核心问题**：Transformer 怎么生成音乐？和语音生成有什么不同？

**难度**: advanced | **prerequisites**: `audio-speech-models`

**内容结构**：

1. **音乐 vs 语音的区别**：
   - 更长的时间跨度（几分钟 vs 几秒）
   - 多声道/多乐器的复调结构
   - 节奏、和声、曲式等音乐结构
   - 更主观的质量评价
2. **MusicGen**：
   - 单阶段 Transformer decoder，直接建模多层 codec token
   - Codebook interleaving patterns：delay pattern 实现多 codebook 的高效建模
   - 文本/旋律条件输入（text description 或 melody conditioning）
   - 与 VALL-E 两阶段方案的对比
3. **Jukebox**（OpenAI）：
   - VQ-VAE 多尺度压缩：raw audio → 3 层离散 token
   - 自上而下生成：从最粗粒度到最细粒度
   - 歌词对齐：文本和音乐的时间对齐
   - 局限：生成速度极慢，质量有限
4. **Stable Audio / MusicLM**：
   - Latent diffusion 在音乐生成中的应用
   - MusicLM（Google）：音频 token（MuLan + SoundStream）→ 层级生成
5. **前沿与挑战**：长程结构建模、多轨编排、实时生成、版权与伦理

**交互组件（4 个）**：

| 组件 | 功能 |
|------|------|
| `MusicVsSpeechComparison` | 对比音乐和语音的信号特征：频谱复杂度、时间跨度、结构层次 |
| `CodebookInterleaving` | MusicGen 的 delay pattern 动画：多层 codebook 如何交织成单一序列 |
| `MusicGenPipeline` | MusicGen 完整流程：text prompt → Transformer → interleaved tokens → EnCodec decode |
| `MusicGenTimeline` | 音乐生成发展时间线：Jukebox → MusicLM → MusicGen → Stable Audio |

**参考文献**：
- Copet et al. 2023 — "Simple and Controllable Music Generation" (MusicGen)
- Dhariwal et al. 2020 — "Jukebox: A Generative Model for Music" (Jukebox)
- Agostinelli et al. 2023 — "MusicLM: Generating Music From Text"
- Evans et al. 2024 — "Stable Audio: Fast Timing-Conditioned Latent Audio Diffusion"

## 实施计划概要

### 并行分组（基于依赖关系）

```
Phase 1（4 篇并行启动）:
  ├── text-representation (1)     — 文本链起点
  ├── vision-transformer (4)      — 视觉链起点
  ├── diffusion-fundamentals (6)  — 生成链起点
  └── audio-speech-models (9)     — 音频链起点

Phase 2（3 篇，依赖 Phase 1）:
  ├── bert-and-gpt (2)            — 依赖 1
  ├── diffusion-transformer (7)   — 依赖 6
  └── audio-music-generation (10) — 依赖 9

Phase 3（2 篇，依赖 Phase 2）:
  ├── sentence-embeddings (3)     — 依赖 2
  └── video-generation (8)        — 依赖 7

Phase 4（1 篇，依赖 Phase 1+3）:
  └── multimodal-alignment (5)    — 依赖 3 + 4
```

### 每篇文章的交付物

- `src/content/articles/zh/<slug>.mdx` — 中文文章
- `src/content/articles/en/<slug>.mdx` — 英文文章
- `src/components/interactive/<ComponentName>.tsx` — 4-6 个交互组件
- 学习路径 YAML 更新

### 总工作量估算

- 10 篇文章 × 2 语言 = 20 个 MDX 文件
- ~49 个交互组件（每篇 4-5 个平均）
- 1 个学习路径 YAML
- 文章约 160 行/篇，组件约 150-250 行/个
