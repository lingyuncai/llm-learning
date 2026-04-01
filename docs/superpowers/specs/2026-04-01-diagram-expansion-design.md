# 图表扩展设计文档 — 第一批

**日期**: 2026-04-01
**状态**: Review
**关联**: V1 review 反馈第 4 项 — "整体图的数量太少"

## 1. 背景与目标

当前 8 篇文章各仅有 1-4 个图表，公式推导和抽象概念主要依赖文字描述。目标是大幅增加图表数量，帮助形象化讲解概念和公式。

### 1.1 现状

| 文章 | 当前图表 | 类型 |
|------|---------|------|
| Transformer 总览 | TransformerArchDiagram + TensorShape x2 | React 组件 |
| QKV 直觉 | QKVLinearProjection + TensorShape x2 | React 组件 |
| Attention 计算 | AttentionStepAnimation | React 组件 |
| Multi-Head Attention | 内联 SVG（计算结构图） | MDX 内联 |
| GQA/MQA | 内联 SVG（三列结构对比） | MDX 内联 |
| KV Cache | KVCacheDemo | React 组件 |
| Prefill vs Decode | 内联 SVG（两阶段对比） | MDX 内联 |
| Flash Attention | FlashAttentionTiling | React 组件 |

### 1.2 目标

- 第一批新增 **25 个图表**，覆盖所有 8 篇文章
- 后续根据效果和反馈决定是否追加第二批

## 2. 设计决策

| 决策项 | 结论 | 理由 |
|--------|------|------|
| 推进节奏 | 分批推进，第一批 25 个 | 可根据第一批效果调整方向 |
| 交互性级别 | 混合策略 | 按概念复杂度：简单对比用静态图，公式推导用逐步动画，性能/参数用交互计算器 |
| 实现方式 | 全部 React 组件 | 规避 Astro MDX 的 SVG 属性 bug（camelCase 被错误 lowercase），不再依赖 CSS hack |
| 公式呈现 | 推导逐步展开 + 最终结果动态参数 | 推导有序，结论适合自由探索 |
| 视觉风格 | 简洁学术风 | 白底、细线条、蓝灰主色调，与 KaTeX 和 Tailwind typography 协调 |
| 选取策略 | 按学习路径优先 | 前期基础文章多配图建立直觉，后期进阶文章解决理解瓶颈 |

## 3. 视觉规范

所有新增图表遵循统一的简洁学术风格：

- **底色**: 白色 (`#ffffff`)，可选浅灰背景区域 (`#f8fafc`)
- **主色调**: 蓝灰系 — 主蓝 `#1565c0`、深灰 `#1a1a2e`、中灰 `#666`、浅灰 `#e2e8f0`
- **强调色**: 绿 `#2e7d32`（正面/Prefill）、红 `#c62828`（警告/Decode）、橙 `#e65100`（中性强调）、紫 `#6a1b9a`（输出/结果）
- **线条**: 1-2px 实线，圆角矩形 `rx=6`
- **字体**: 系统无衬线字体，代码用等宽体
- **动画**: Motion (`motion/react`)，缓动 `easeInOut`，时长 300-500ms
- **交互控件**: Tailwind 样式的滑块/按钮/输入框，与站点整体风格一致
- **响应式**: 最小宽度 320px，SVG viewBox 自适应

### 3.2 局部功能色（图表内部元素状态）

全局语义色（3.1）用于跨图表的概念标识，以下局部功能色用于单图内的元素状态，不与全局语义冲突：

- **遮罩/无效**: 灰色 `#f3f4f6`（如 Causal Mask 的上三角）
- **有效/归一化**: 浅蓝 `#dbeafe`（如 softmax 后的有效权重）
- **高亮/当前步**: 黄色 `#fef3c7`（如逐步动画中当前计算的元素）
- **浪费/冗余**: 浅红 `#fee2e2`（如重复计算的标记，区别于全局红色的"警告"语义）
- **复制品/引用**: 原色半透明 `opacity: 0.4` + 虚线边框（如 GQA 的 KV 复制）

### 3.3 共享基础设施

多个组件复用相同的参数类型和预设值，抽取为共享模块：

- **`src/components/interactive/shared/types.ts`** — `ModelConfig` 接口、`HardwareConfig` 接口
- **`src/components/interactive/shared/presets.ts`** — 预设模型配置（LLaMA-2 7B/13B/70B、Mistral 7B）、预设硬件配置（A100、H100）
- **`src/components/interactive/shared/colors.ts`** — 全局语义色 + 局部功能色常量导出
- **`src/components/interactive/shared/hooks.ts`** — 共用 hooks（如 `useStepNavigation`、`useDebouncedSlider`）

## 4. 图表清单 — 文章 1-4

### 4.1 Transformer 网络结构总览（4 个新增）

#### 图 1.1 — Attention 掩码矩阵可视化
- **文件**: `src/components/interactive/AttentionMaskVisualization.tsx`
- **类型**: 静态热力图 + hover 交互
- **内容**: 并排展示三种 Attention 掩码矩阵：
  - 双向（Encoder）：全绿，所有位置互相可见
  - 因果（Decoder-only）：下三角绿 + 上三角红，每个 token 只能看到自己和之前的
  - 交叉（Encoder-Decoder）：矩形绿，Decoder 可看到所有 Encoder 位置
- **交互**: Hover 某个格子高亮对应的 Query token 行和 Key token 列
- **尺寸**: 6x6 或 8x8 矩阵，带 token 标签

#### 图 1.2 — Pre-LN vs Post-LN 梯度流对比
- **文件**: `src/components/interactive/PrePostLNComparison.tsx`
- **类型**: 静态流程图
- **内容**: 左右并排两个 Transformer block：
  - Post-LN：Input → Attention → Add → LN → FFN → Add → LN，梯度必须穿过 LN
  - Pre-LN：Input → LN → Attention → Add → LN → FFN → Add，残差连接提供梯度直通路径
- **视觉**: 用线条粗细表示梯度强度，Pre-LN 的残差路径用粗蓝线标注"梯度高速公路"

#### 图 1.3 — 位置编码方案直观对比
- **文件**: `src/components/interactive/PositionalEncodingComparison.tsx`
- **类型**: 静态对比图
- **内容**: 三列对比：
  - 正弦/余弦：固定波形图案，每个维度不同频率的波
  - 可学习绝对：参数矩阵示意，标注"训练时学习，外推能力差"
  - RoPE：旋转向量示意，相邻 token 的向量旋转小角度，远距离旋转大角度
- **重点**: 概念级直觉，不深入 RoPE 数学（详细内容留给未来专题文章）

#### 图 1.4 — FFN 扩维-压缩结构图
- **文件**: `src/components/interactive/FFNBottleneck.tsx`
- **类型**: 静态流程图
- **内容**: 数据流：`(B,S,H)` → Linear₁ 扩维 → `(B,S,4H)` → 激活函数(GELU) → Linear₂ 压缩 → `(B,S,H)`
- **视觉**: 用矩形宽度表示维度大小，中间 4H 明显比两端 H 宽，形成"菱形"瓶颈结构

### 4.2 QKV 的数据结构与直觉（2 个新增）

#### 图 2.1 — Q/K/V 向量空间语义对比
- **文件**: `src/components/interactive/QKVSemanticSpaces.tsx`
- **类型**: 静态图 + hover 交互
- **内容**: 以"猫坐在垫子上"为例，三个并排的 2D 散点空间：
  - Q 空间（标注"我在找什么"）：各 token 的 query 向量位置
  - K 空间（标注"我能提供什么"）：各 token 的 key 向量位置
  - V 空间（标注"我的实际内容"）：各 token 的 value 向量位置
- **交互**: Hover 某个 token 高亮它在三个空间中的位置，连线标注"同一个词，不同的表示"
- **重点**: 让读者理解 W_Q, W_K, W_V 将同一个输入映射到不同的语义空间

#### 图 2.2 — 多头分割 reshape/transpose 3D 可视化
- **文件**: `src/components/interactive/ReshapeTransposeAnimation.tsx`
- **类型**: 逐步动画（3 步）
- **内容**: 用彩色方块表示张量元素：
  - Step 1: `(B,S,H)` 平铺矩阵，所有元素同色
  - Step 2: reshape 为 `(B,S,h,d_k)`，按 head 分组着色（h 种颜色）
  - Step 3: transpose 为 `(B,h,S,d_k)`，方块动画移动到新位置
- **交互**: 点击"下一步"推进，可回退。简化模式不带 B 维度

### 4.3 Attention 计算详解（3 个新增）

#### 图 3.1 — 端到端张量形状追踪图
- **文件**: `src/components/interactive/TensorShapeTracker.tsx`
- **类型**: 逐步动画 + 模式切换
- **内容**: 从输入 X 到最终输出的完整 SDPA 数据流，每步标注张量形状：
  - 投影: X × W_Q/W_K/W_V → Q, K, V
  - reshape + transpose（多头分割）
  - Q × K^T → scores
  - scores / √d_k → scaled scores
  - mask → masked scores
  - softmax → attention weights
  - weights × V → context
  - concat（transpose + reshape）
  - × W_O → output
- **模式切换**:
  - 简化模式: `(S,H) → (S,d_k) → (S,S) → (S,d_k) → (S,H)`，不带 batch/多头
  - 完整模式: `(B,S,H) → (B,h,S,d_k) → (B,h,S,S) → (B,h,S,d_k) → (B,S,H)`
- **交互**: 切换按钮选模式，点击逐步推进，每步高亮当前计算环节
- **定位**: 贯穿 QKV→Attention→MHA 的核心参考图
- **使用位置**: 主要放在 Attention 计算详解，QKV 直觉和 MHA 文章可通过链接引用

#### 图 3.2 — Scaling 因子对 Softmax 分布的影响
- **文件**: `src/components/interactive/ScalingFactorDemo.tsx`
- **类型**: 交互式（滑块调 d_k）
- **内容**:
  - 左侧: attention scores 的直方图（随机生成的点积值）
  - 右侧: softmax 后的概率分布柱状图
  - 底部: 滑块控制 d_k（范围 8→128）
- **演示逻辑**: d_k 小时 scores 方差小 → softmax 输出均匀分布；d_k 大时 scores 方差大 → softmax 趋向 one-hot；除以 √d_k 后恢复均匀
- **额外**: 显示当前的方差值和 softmax 熵值，数字随滑块实时更新

#### 图 3.3 — Causal Mask 逐步应用演示
- **文件**: `src/components/interactive/CausalMaskDemo.tsx`
- **类型**: 逐步动画（3 步）
- **内容**:
  - Step 1: 原始 Q×K^T 分数矩阵，所有格子填充随机数值（蓝色色调表示大小）
  - Step 2: 上三角位置设为 -∞，标红 + 划掉原数值
  - Step 3: softmax 后上三角变为 0.00（灰色），下三角归一化为概率（绿色深浅表示权重大小），每行和为 1.0
- **标注**: "每个 token 只能看到自己和前面的 token"

### 4.4 Multi-Head Attention（2 个新增）

#### 图 4.1 — 单头 vs 多头 Attention 权重对比
- **文件**: `src/components/interactive/SingleVsMultiHeadAttention.tsx`
- **类型**: 静态热力图 + hover
- **内容**: 以 "The cat sat on the mat because it was tired" 为例：
  - 左侧: 单头 attention 权重热力图（10×10），所有语义关系混在一起
  - 右侧: h=4 个小热力图，每个 head 捕捉不同模式：
    - Head 1: 关注相邻词（局部模式）
    - Head 2: 关注动词-主语关系（sat→cat）
    - Head 3: 关注代词指代（it→cat）
    - Head 4: 关注介词短语结构（on→mat）
- **交互**: Hover 某个 head 放大显示，高亮其最强的 attention 连线
- **注意**: 使用预设的示例权重值，非真实模型输出（标注"示意图，非真实模型权重"）

#### 图 4.2 — 输出投影 W_O 的融合过程
- **文件**: `src/components/interactive/OutputProjectionFusion.tsx`
- **类型**: 逐步动画（3 步）
- **内容**:
  - Step 1: h 个 head 各自的输出 `(d_k)` 向量，用不同颜色区分
  - Step 2: transpose + reshape 拼接为 `(H)` 向量，颜色条拼接在一起
  - Step 3: 通过 W_O `(H,H)` 线性投影，颜色混合表示多头信息融合，输出 `(H)` 向量变为统一色
- **视觉**: 强调 W_O 不是简单拼接，而是学习到的线性组合

## 5. 图表清单 — 文章 5-8

### 5.1 MQA 与 GQA（4 个新增）

#### 图 5.1 — KV Cache 大小随序列长度的增长曲线
- **文件**: `src/components/interactive/KVCacheGrowthChart.tsx`
- **类型**: 交互式折线图（滑块调参数）
- **内容**: 三条曲线 MHA / GQA / MQA：
  - X 轴: 序列长度（0 → 128K，对数刻度可选）
  - Y 轴: KV Cache 内存占用（MB/GB）
  - 可调参数: 模型维度 H、head 数 h、GQA 组数 g、数据精度（FP16/FP32/INT8）
- **重点**: 长序列下 MHA 的内存爆炸 vs GQA/MQA 的可控增长
- **预设**: 一键切换常见模型配置（LLaMA-2 7B/70B、Mistral 7B）

#### 图 5.2 — Query-KV Head 映射关系动画
- **文件**: `src/components/interactive/QueryKVMapping.tsx`
- **类型**: 逐步动画（3 步对比）
- **内容**: 并排三列，展示 Query head 如何找到对应的 KV head：
  - MHA: 4 个 Q → 4 个独立 KV，一对一连线
  - GQA: 4 个 Q → 2 个 KV，两对一连线，KV 节点标注 `repeat_interleave` 复制
  - MQA: 4 个 Q → 1 个 KV，四对一连线，KV 节点标注"全共享"
- **动画**: 连线逐步绘制，GQA 步骤中 KV 节点先闪烁，然后"分裂"成 h/g 个半透明副本，副本沿连线飞向对应的 Q head，最终每个 Q 旁显示自己的 KV 副本
- **`repeat_interleave` 可视化**: GQA 列中，KV₁ 分裂为 [KV₁, KV₁] 配给 Q₁和Q₂，KV₂ 分裂为 [KV₂, KV₂] 配给 Q₃和Q₄。副本用虚线边框 + 原色半透明表示"这是复制品"
- **注意**: 此图替换现有的内联 SVG 结构对比图（解决 Astro SVG bug 依赖）

#### 图 5.3 — Uptraining 参数池化过程
- **文件**: `src/components/interactive/UptrainingPooling.tsx`
- **类型**: 逐步动画
- **内容**: 展示从 MHA 预训练模型转换到 GQA 的过程：
  - Step 1: h 个 KV head 的权重矩阵排列（如 h=8）
  - Step 2: 分组（如 g=2，每组 4 个 head）
  - Step 3: 组内取均值池化，8 个矩阵 → 2 个矩阵
  - Step 4: Uptraining — 用少量数据微调恢复质量
- **视觉**: 矩阵用热力图表示权重值，池化时多个热力图渐变合并为一个

#### 图 5.4 — 批处理并发能力对比
- **文件**: `src/components/interactive/ConcurrencyComparison.tsx`
- **类型**: 交互式柱状图
- **内容**: 固定 GPU 显存（默认 80GB A100），展示三种方案能同时服务的并发请求数：
  - MHA: ~3 个请求（大部分显存被 KV Cache 占用）
  - GQA: ~30 个请求
  - MQA: ~235 个请求
- **可调参数**: GPU 显存大小、模型大小、序列长度
- **视觉**: 柱状图 + 每个柱子上方标注"同时服务 N 个用户"

### 5.2 KV Cache 原理（4 个新增）

#### 图 6.1 — 无 Cache 时的重复计算可视化
- **文件**: `src/components/interactive/RedundantComputationViz.tsx`
- **类型**: 逐步动画
- **内容**: 以 5 个 token 的自回归生成为例：
  - Step 1 (生成 token 2): 计算 1 行 attention
  - Step 2 (生成 token 3): 重新计算 2 行（第 1 行标红 = 浪费）
  - Step 3 (生成 token 4): 重新计算 3 行（前 2 行标红）
  - Step 4 (生成 token 5): 重新计算 4 行（前 3 行标红）
  - 最终: 累积显示被浪费的计算量，标注"总计 O(N²) 次重复计算"
- **视觉**: 矩阵格子逐步填充，红色格子逐步累积，右侧计数器实时更新浪费量

#### 图 6.2 — KV Cache 内存公式交互计算器
- **文件**: `src/components/interactive/KVCacheCalculator.tsx`
- **类型**: 交互式计算器
- **内容**: 输入参数面板：
  - 层数 L（滑块 1-128）
  - 隐藏维度 d（下拉：2048/4096/5120/8192）
  - Head 数 h（下拉：8/16/32/64）
  - GQA 组数 g（下拉：1/2/4/8/h，默认 h = MHA）
  - 序列长度 S（滑块 256-128K）
  - 精度（FP32/FP16/INT8/INT4）
- **实时输出**:
  - 单请求 KV Cache 大小
  - N 个并发的总占用（N 可调）
  - 占 GPU 显存的百分比（进度条）
- **预设按钮**: LLaMA-2 7B / 13B / 70B、Mistral 7B 一键填入

#### 图 6.3 — PagedAttention vs 预分配的显存碎片对比
- **文件**: `src/components/interactive/PagedAttentionComparison.tsx`
- **类型**: 动画演示
- **内容**: 左右并排的显存条：
  - 左侧（传统预分配）: 请求 A 预分配 2048 token 的连续空间但只用了 500 → 内部碎片；请求 A 完成后留下间隙 → 外部碎片；新请求 B 需要的空间放不进间隙
  - 右侧（PagedAttention）: 请求 A 按需分配页面（每页如 16 token）；用完即释放；新请求 B 可以使用任意空闲页面
- **动画**: 请求生命周期的时间流：分配 → 使用 → 释放 → 新请求复用

#### 图 6.4 — Continuous Batching 请求调度时间轴
- **文件**: `src/components/interactive/ContinuousBatchingTimeline.tsx`
- **类型**: 动画时间轴
- **内容**: 上下两行对比：
  - Static Batching: 3 个请求同时开始，最短的完成后闲等，必须等最长的完成才能接新请求
  - Continuous Batching: 3 个请求同时开始，任一完成立即插入新请求填补空位
- **动画**: 时间轴从左向右推进，请求用不同颜色的条表示，完成时缩短并让位
- **标注**: 标注 GPU 利用率百分比，Continuous Batching 明显更高

### 5.3 Prefill vs Decode 阶段（2 个新增）

#### 图 7.1 — Roofline 模型交互图
- **文件**: `src/components/interactive/RooflineModel.tsx`
- **类型**: 交互式（滑块调 batch size）
- **内容**: 经典 Roofline 图：
  - X 轴: Arithmetic Intensity（FLOP/Byte，对数刻度）
  - Y 轴: 吞吐量（TFLOPS，对数刻度）
  - 硬件上限: A100 的 312 TFLOPS 算力天花板（水平线）+ 2TB/s 带宽斜坡（斜线）
  - 两个标注点: Prefill（AI 高，位于天花板区 = compute-bound）和 Decode（AI 低，位于斜坡区 = memory-bound）
- **交互**: 拖动 batch size 滑块（1→256），Decode 的点沿 X 轴右移（AI = 2B/sizeof），当 AI 越过拐点时点变绿 = compute-bound
- **标注**: 拐点位置标注 $I^* = \text{peak FLOPS} / \text{bandwidth}$
- **硬件选择**: 下拉框切换硬件配置（A100/H100），参数从 `shared/presets.ts` 读取，默认 A100

#### 图 7.2 — GEMM vs GEMV 并排对比
- **文件**: `src/components/interactive/GEMMvsGEMV.tsx`
- **类型**: 逐步动画
- **内容**: 左右并排：
  - 左侧 Prefill（GEMM）: `(n×d) × (d×d)` 矩阵乘矩阵
    - 权重矩阵的每列被 n 个输入行复用 → 数据复用率高
    - GPU 核心网格大部分亮起（忙碌）
  - 右侧 Decode（GEMV）: `(1×d) × (d×d)` 向量乘矩阵
    - 权重矩阵的每列只被 1 个输入向量用一次 → 加载即丢弃
    - GPU 核心网格大部分灰色（闲置）
- **动画**: 逐列计算，高亮当前参与计算的元素，Prefill 多行并行 vs Decode 单行
- **视觉**: 用色块密度和 GPU 利用率进度条直观展示差异

### 5.4 Flash Attention 分块原理（4 个新增）

#### 图 8.1 — GPU 内存层次与数据搬运对比
- **文件**: `src/components/interactive/GPUMemoryHierarchy.tsx`
- **类型**: 静态图 + 动画
- **内容**:
  - 上方: GPU 内存层次图 — HBM（大矩形，标注"80GB, 2TB/s"）和 SRAM（小矩形，标注"20MB, 19TB/s"），用宽窄不同的管道连接表示带宽差异
  - 下方并排两个动画:
    - 标准 Attention: Q,K 从 HBM→SRAM 算 S=QK^T → S 写回 HBM → S 读回 SRAM 算 P=softmax(S) → P 写回 HBM → P 读回 SRAM 算 O=PV → O 写回 HBM。箭头频繁来回
    - Flash Attention: Q,K,V 分块加载到 SRAM → 在 SRAM 内完成 QK^T、scale、mask、softmax、×V 全部计算 → 只写最终 O 回 HBM。箭头极少
- **视觉**: 箭头数量和粗细直观表示 IO 量差异

#### 图 8.2 — Online Softmax 递推更新逐步演示
- **文件**: `src/components/interactive/OnlineSoftmaxDemo.tsx`
- **类型**: 逐步动画 + 数值示例
- **内容**: 以 3 个块为例，逐步展示递推更新：
  - **Block 1**: 计算局部分数 s₁ → m₁ = max(s₁) = 3.2 → l₁ = Σexp(s₁-m₁) → O₁ = softmax₁ × V₁
  - **Block 2**: 计算局部分数 s₂ → m₂_new = max(m₁, max(s₂)) = 4.1 → 修正因子 α = e^(3.2-4.1) ≈ 0.407 → l₂ = α·l₁ + Σexp(s₂-m₂_new) → O₂ = α·O₁ + softmax₂ × V₂
  - **Block 3**: 同理继续更新
- **视觉**: 每步高亮当前计算的变量，修正因子用橙色强调，已更新的值用绿色标记
- **关键标注**: "无需存储完整的 N×N 矩阵，只需维护 m, l, O 三个累积量"

#### 图 8.3 — 标准 vs Flash v1 vs v2 的 IO 复杂度对比
- **文件**: `src/components/interactive/IOComplexityChart.tsx`
- **类型**: 交互式折线图
- **内容**: 三条曲线：
  - X 轴: 序列长度 N（256 → 64K）
  - Y 轴: HBM 访问量（字节）
  - 标准 Attention: $\Theta(Nd + N^2)$ — 二次增长
  - Flash Attention v1: $\Theta(N^2 d^2 M^{-1})$ — 受 SRAM 大小 M 调节
  - Flash Attention v2: $\Theta(N^2 d M^{-1})$ — 减少非 matmul FLOPs，外循环遍历 Q 块而非 K/V 块
- **可调参数**: head 维度 d（64/128）、SRAM 大小 M
- **重点**: 长序列下标准方案的 IO 爆炸 vs Flash Attention 的亚二次增长

#### 图 8.4 — 分块大小与 SRAM 容量的关系
- **文件**: `src/components/interactive/BlockSizeCalculator.tsx`
- **类型**: 交互式
- **内容**:
  - 滑块调节: SRAM 大小 M（10KB → 200KB）、head 维度 d（32 → 128）
  - 实时计算: $B_c = \lceil M/(4d) \rceil$ 和 $B_r = \min(B_c, d)$
  - 可视化: 左侧 Q 矩阵被水平切成 $\lceil N/B_r \rceil$ 个块，右侧 K/V 矩阵被水平切成 $\lceil N/B_c \rceil$ 个块，块大小随参数变化实时更新
- **标注**: "SRAM 越大 → 块越大 → 外循环次数越少 → HBM 访问越少"

## 6. 现有内联 SVG 的处理

第一批完成后，以下现有内联 SVG 将被对应的 React 组件替换：

| 文章 | 现有内联 SVG | 替换为 |
|------|-------------|--------|
| MHA | 多头并行计算结构图 | 将内联 SVG 转为 React 组件 `MultiHeadParallelDiagram.tsx`，保留原有的 h 个 head 并行框布局和内部 4 步标注，但用 React 重写以规避 Astro SVG bug。图 3.1（端到端追踪）作为补充而非替代 |
| GQA/MQA | 三列结构对比图 | 图 5.2（Query-KV 映射动画）替换 |
| Prefill vs Decode | 两阶段对比图 | 图 7.1 + 7.2 覆盖其内容 |

替换后可以移除 `global.css` 中的 SVG 属性 CSS hack（如果确认无其他内联 SVG 依赖）。

## 7. 技术实现注意事项

1. **全部使用 React 组件**: 放在 `src/components/interactive/`，在 MDX 中 import 并加 `client:visible` 指令
2. **动画库**: Motion (`import { motion, AnimatePresence } from 'motion/react'`)
3. **图表库**: 交互式折线图/柱状图考虑轻量方案（自定义 SVG + D3 scale），避免引入重型图表库
4. **复用基础组件**: 可从 `src/components/primitives/` 复用 StepNavigator（逐步动画）、TensorShape（形状标注）等
5. **响应式**: 所有组件需在移动端可用，SVG viewBox 自适应容器宽度
6. **无障碍**: 图表需有 aria-label，动画可通过 `prefers-reduced-motion` 禁用
7. **性能**: `client:visible` 确保组件仅在进入视口时加载，避免首屏性能问题

## 8. 性能优化策略

1. **懒加载**: 所有组件使用 `client:visible`，仅进入视口时加载
2. **滑块防抖**: 交互式计算器（6.2、5.1、8.4）的滑块输入用 debounce 150ms，避免高频重算
3. **动画优先 CSS**: 简单过渡用 CSS transition，仅复杂编排用 Motion 的 `animate`
4. **矩阵渲染上限**: 热力图/矩阵可视化限制最大 16×16 展示尺寸，超过时缩略或分页

## 9. 成功标准

- 每篇文章至少有 3 个可视化元素（图表 + 已有组件）
- 公式推导环节都有对应的逐步可视化或交互演示
- 所有图表在移动端正常显示
- 新增组件不显著影响页面加载速度（Lighthouse Performance > 90）
