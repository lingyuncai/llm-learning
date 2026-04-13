# SSM 文章深度扩展设计文档

## 概览

将 `state-space-models.mdx` 从"概述级"升级为"深度教学级"。当前 ~130 行 MDX / 5 组件，扩展至 ~450-550 行 MDX / 9-10 组件。确保所有技术细节有论文出处，修正已发现的正确性问题。

- **目标读者**: 已理解 Attention 原理（前置文章），想深入理解 SSM 为何能替代/补充 Attention 的工程师
- **核心原则**: 每个概念按 **直觉→公式→数值例子→可视化** 四层递进讲解
- **双语**: 中英文同步修改

---

## Phase 0: 正确性修复（必须先做）

### 0.1 Δ 解释错误 — 最高优先级

**现有文本（错误）**:
> 对于重要 token（如内容词 "cat", "mat"），模型学会输出大 Δ，让信息**被记住**；对于噪声 token（如 "the", "on"），输出小 Δ，让旧信息**快速遗忘**新输入。

**论文原文（Mamba arXiv:2312.00752, p.9）**:
> "a large Δ resets the state h and focuses on the current input x, while a small Δ persists the state and ignores the current input. SSMs can be interpreted as a continuous system discretized by a step size Δ, so the intuition is that large Δ ∼ ∞ represents the system focusing on the current input for longer (thus 'selecting' it and forgetting its current state) while a small Δ → 0 represents a transient input that is ignored."

**修正后的解释**:

大 Δ 和小 Δ 的真实机制：
- 由于 A 初始化为负值（Mamba 用 S4D-Real，即 $A = -\text{diag}(1,...,N)$，源自 HiPPO 理论的简化），$\bar{A} = e^{\Delta A}$ 的行为：
  - **大 Δ** → $\Delta A$ 是大负数 → $e^{\Delta A} \to 0$ → 旧状态被**大幅衰减**（近乎清零）
  - **小 Δ** → $\Delta A$ 是小负数 → $e^{\Delta A} \approx I$ → 旧状态**几乎完整保留**
- 同时 $\bar{B}$ 也依赖 Δ：大 Δ → $\bar{B}$ 更大（ZOH 下趋近饱和值 $B/|A|$）→ 当前输入被**强烈写入**；小 Δ → $\bar{B} \to 0$ → 当前输入**几乎被忽略**

综合效果：
- **大 Δ = "reset and focus"**: 清空旧状态，聚焦当前 token。当遇到内容词（"cat"、"mat"），模型输出大 Δ，将当前 token 强烈写入状态。
- **小 Δ = "persist and ignore"**: 保留旧状态，忽略当前 token。当遇到功能词（"the"、"on"），模型输出小 Δ，让状态几乎不变。

**类比**: Δ 的作用类似 RNN 的门控机制。Mamba 论文 Theorem 1 证明当 N=1, A=-1, B=1 时，选择性 SSM 精确等价于门控 RNN 递推：$g_t = \sigma(\text{Linear}(x_t))$, $h_t = (1-g_t)h_{t-1} + g_t x_t$。注意这是通用门控 RNN 等价（类似 GRU 的更新门），而非 LSTM 的特定 forget gate。

**影响范围**:
- `state-space-models.mdx` 中文版第 94 行附近
- `state-space-models.mdx` 英文版第 94 行附近
- `SelectiveScanViz.tsx` 第 37 行 legend 文字
- `SelectiveScanViz.tsx` 第 46 行 legend 文字

### 0.2 符号 N 不一致

**现有问题**: N 在第 1 节表示状态维度（$x \in \mathbb{R}^N$），在第 3 节和总结表格中表示序列长度（$O(N^2)$, $O(N \log N)$）。

**修正**: 统一用 $N$ = 状态维度，$L$ = 序列长度。具体：
- 第 3 节："$O(N \log N)$" → "$O(L \log L)$"
- 总结表格：所有 $O(N^2)$, $O(N)$ → $O(L^2)$, $O(L)$

### 0.3 D 项缺解释

**现有问题**: 公式包含 $Du(t)$ 但正文不提。

**修正**: 在第 1 节公式后加一句说明：
> $D$ 项是直接前馈连接（skip connection），在 S4 和 Mamba 的实际实现中通常设为 0 或恒等映射，不影响 SSM 的核心动态，后文省略。

### 0.4 SelectiveScanViz 组件 legend 修正

- "大 Δ = 记住（内容词）" → "大 Δ = reset & focus（聚焦当前输入）"
- "小 Δ = 遗忘（功能词）" → "小 Δ = persist & ignore（保留旧状态）"
- 英文版同步修改

### 0.5 SISO 维度说明

**现有问题**: $B \in \mathbb{R}^{N \times 1}$, $C \in \mathbb{R}^{1 \times N}$ 是 SISO 维度，未说明实际实现是多维度的。

**修正**: 加一句说明：
> 上述是单输入单输出（SISO）的最简形式。实际实现中，SSM 在模型的每个特征维度 $D$ 上独立运行（类似 depth-wise convolution）。在 Mamba 中，$A$ 矩阵是 per-dimension 的，而选择性 $B$、$C$ 从输入投影得到后在各维度间共享。

---

## Phase 1: 内容扩展

### 新增 references

```yaml
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
  # 新增:
  - type: paper
    title: "HiPPO: Recurrent Memory with Optimal Polynomial Projections"
    url: "https://arxiv.org/abs/2008.07669"
  - type: paper
    title: "Hungry Hungry Hippos: Towards Language Modeling with State Space Models (H3)"
    url: "https://arxiv.org/abs/2212.14052"
  - type: paper
    title: "On the Parameterization and Initialization of Diagonal State Space Models (S4D)"
    url: "https://arxiv.org/abs/2206.12037"
```

### 节 0: 引言（扩展现有）

**现有**: 1 段，约 5 行
**扩展至**: 3 段，约 15-20 行

新增内容：
1. Attention $O(L^2)$ 的具体痛点：100K context 时 Attention 矩阵有 10^10 个元素
2. RNN 的问题：虽然 $O(1)$ 推理，但梯度消失/爆炸导致无法学习长距离依赖、训练无法并行
3. SSM 的承诺：**同时解决两个问题** — 训练可并行（convolution mode）+ 推理 $O(1)$（recurrence mode）+ 理论上可学习任意长距离（HiPPO 初始化）
4. SSM 发展简史一句话：HiPPO (2020) → S4 (2021) → H3 (2022) → **Mamba** (2023) → **Mamba-2** (2024)

### 节 1: 连续状态空间模型（扩展现有）

**现有**: 公式 + 1 段直觉 + 组件
**扩展至**: 公式 + 直觉 + SISO 说明 + D 项说明 + 信号处理类比

新增内容：
1. D 项说明（Phase 0.3）
2. SISO→MIMO 说明（Phase 0.5）
3. 信号处理类比：SSM 就像一个"带记忆的 FIR/IIR 滤波器"。输入信号 $u(t)$ 通过系统，状态 $x(t)$ 就像滤波器的内部寄存器，$A$ 控制寄存器间的反馈（极点位置），$B$ 控制输入到寄存器的路径，$C$ 控制从寄存器到输出的路径。
4. 关键问题引出：A 矩阵的初始化决定了"记忆的数学结构"——引出下一节 HiPPO

### 节 1.5: HiPPO — SSM 记忆的数学基础（新增）

**核心要点**（全部已论文验证）：

1. **问题**: 一个 $N$ 维状态向量如何"最优地"压缩一段连续信号的历史？随机初始化的 $A$ 矩阵会导致信息指数衰减，远处信息迅速丢失。

2. **HiPPO 的解法**（Gu et al., NeurIPS 2020, arXiv:2008.07669）：
   - 用 **正交多项式基**（Legendre 多项式）来逼近历史信号
   - 状态向量的第 $n$ 个分量 = 信号在第 $n$ 个 Legendre 多项式上的投影系数
   - 这样 $N$ 维状态 = 信号历史的 $N$ 阶多项式逼近，而非简单的指数衰减

3. **HiPPO-LegS 矩阵**（HiPPO 论文 Section 3.2）:
   - 下三角（$n > k$）：$A_{nk} = (2n+1)^{1/2}(2k+1)^{1/2}$
   - 对角线：$A_{nn} = n+1$
   - 上三角：$A_{nk} = 0$
   - （注意：ODE 中实际使用 $-A$，所以代码里看到的是负值）
   - 这个特定矩阵使得状态更新恰好等价于"在线计算 Legendre 投影系数"
   - ⚠️ **实施建议**：不同来源的归一化方式略有差异，文章中建议只给直觉和大致结构（下三角 + 对角结构），不给完整公式元素值，避免引入错误

4. **为什么关键**: S4 论文实验证明，使用 HiPPO 初始化的 S4 在 Path-X（16384 步序列）任务上达到 SoTA，而随机初始化完全失败。

5. **Mamba 的简化**: Mamba 不使用完整 HiPPO 矩阵，而用更简单的 S4D-Real 初始化。代码实现：`A_log = log([1, 2, ..., N])` 存储为参数，计算时 `A = -exp(A_log) = diag(-1, -2, ..., -N)`。负号确保状态衰减（稳定性），对数存储确保数值稳定。Mamba 论文原文："S4D-Real defines the n-th element of A as -(n+1)"。Mamba 的选择性机制（input-dependent Δ, B, C）弥补了简化初始化的表达力损失。

**可视化**: 新增 `HiPPOMemoryViz` 组件（见组件设计部分）

**篇幅**: ~30-40 行 MDX

### 节 2: 离散化（扩展现有）

**现有**: 公式 + Δ 含义
**扩展至**: 直觉引入 + 公式推导 + Euler vs ZOH 对比 + 数值例子

新增内容：
1. **直觉引入**: 为什么需要离散化？语言模型处理离散 token，但 SSM 的数学是连续时间的。类比：连续信号 → 数字采样，Δ 就是采样间隔。

2. **简要推导**（不用太长，给出关键步骤）:
   - 从 $\dot{x}(t) = Ax(t) + Bu(t)$ 出发
   - 在 $[k\Delta, (k+1)\Delta]$ 区间积分，假设 $u(t)$ 在区间内恒定（ZOH 假设）
   - 得到 $x_{k+1} = e^{A\Delta} x_k + A^{-1}(e^{A\Delta} - I)Bu_k$
   - 简写为 $\bar{A} = e^{A\Delta}$, $\bar{B} = A^{-1}(e^{A\Delta} - I)B$

3. **Euler 近似（最简单的离散化，用于建立直觉）**:
   - 一阶 Euler：$\bar{A} \approx I + \Delta A$, $\bar{B} \approx \Delta B$
   - 简单直观，但精度低
   - **Mamba 和 S4 实际使用 ZOH**（精度更高），部分文献也用双线性 (Tustin) 方法
   - 不同离散化方法产生不同的 $\bar{A}, \bar{B}$，但都将同一个连续系统映射到离散递推

4. **Δ 的采样类比**: 类比音频采样率 — 44.1kHz（小 Δ，高分辨率，细节丰富）vs 8kHz（大 Δ，低分辨率，只保留粗轮廓）
   - ⚠️ **注意**：此类比仅适用于本节讨论的 LTI 离散化语境（Δ 固定，控制时间分辨率）。到第 4 节 Mamba 的选择性 Δ 时，含义不同——大 Δ 意味着"reset & focus"，小 Δ 意味着"persist & ignore"。文章中应明确区分这两个语境。

**篇幅**: 从 ~15 行扩至 ~35 行 MDX

### 节 3: Recurrence-Convolution 对偶性（扩展现有）

**现有**: 两种模式简述 + 组件
**扩展至**: 详细展开 + 卷积核推导 + FFT 直觉 + S4 的贡献

新增内容：
1. **卷积核的推导**:
   - $y_0 = C\bar{B}u_0$
   - $y_1 = C\bar{A}\bar{B}u_0 + C\bar{B}u_1$
   - $y_2 = C\bar{A}^2\bar{B}u_0 + C\bar{A}\bar{B}u_1 + C\bar{B}u_2$
   - 所以 $y_k = \sum_{j=0}^{k} C\bar{A}^{k-j}\bar{B} \cdot u_j$ → 这就是卷积 $y = \bar{K} * u$
   - 卷积核 $\bar{K}_i = C\bar{A}^i\bar{B}$

2. **FFT 加速的直觉**: 时域卷积 = 频域乘法。$y = \bar{K} * u$ 可以用 $y = \text{IFFT}(\text{FFT}(\bar{K}) \cdot \text{FFT}(u))$ 在 $O(L \log L)$ 时间计算。

3. **S4 的核心贡献**:
   - 计算卷积核 $\bar{K}_i = C\bar{A}^i\bar{B}$ 需要 $\bar{A}$ 的高次幂 → 对一般矩阵代价高
   - S4 的 NPLR/DPLR 参数化：将 $A$ 分解为 Diagonal + Low-Rank，使得核计算可以通过 Cauchy 核公式高效完成
   - 简化版 S4D：直接对角化 $A$，则 $\bar{A}^i$ 就是对角元素的 $i$ 次幂，trivial to compute

4. **S4 的标志性成果**（arXiv:2111.00396）:
   - Long Range Arena 全部任务 SoTA，包括此前所有方法失败的 Path-X（16384 步）
   - Sequential CIFAR-10: 91%（无数据增强）
   - 生成速度比同参数 Transformer 快 60×

**篇幅**: 从 ~15 行扩至 ~40 行 MDX

### 节 3.5: 从 S4 到 Mamba 的演进（新增，短节）

**核心要点**:

1. **S4 的根本局限 — LTI**:
   - 所有参数（A, B, C, Δ）固定不变（Linear Time-Invariant）
   - 意味着：SSM 对"the"和"cat"用完全相同的方式处理
   - 从卷积视角：固定卷积核 = 固定滤波器，无法根据内容做选择

2. **Selective Copying 任务的失败**（验证自 Mamba 论文 Section 4.1）:
   - 任务：在噪声 token 中选出有色 token 并按顺序复制
   - S4（LTI）：18.3% 准确率（极差）
   - Mamba（选择性）：99.8% 准确率
   - 原因：spacing 不固定，静态卷积核无法处理

3. **H3 的过渡方案**（arXiv:2212.14052）:
   - Hungry Hungry Hippos：在 SSM 层外加一些 Attention 层来补足检索能力
   - 结论：hybrid 125M H3-Attention 模型超过纯 Transformer
   - 启示：与其加 Attention 来补 SSM，不如让 SSM 自己具备选择性

4. 一句过渡："这个思路直接催生了 Mamba。"

**篇幅**: ~20-25 行 MDX

### 节 4: Mamba 的选择性机制（大幅扩展）

**现有**: 选择性参数简述 + Δ 解释（有误）+ 组件 + parallel scan 一句话
**扩展至**: 修正 Δ 解释 + LSTM 门控类比 + parallel scan 详细解释 + 硬件优化

#### 4a. 选择性参数（修正 + 扩展）

保留 B, C, Δ 的选择性说明，但修正 Δ 的解释（按 Phase 0.1）。新增：
- **数学分析**: 当 A < 0 时，$\bar{A} = e^{\Delta A}$ 和 $\bar{B}$ 随 Δ 变化的具体行为
- **RNN 门控等价**（Mamba 论文 Theorem 1）: 当 $N=1, A=-1, B=1$ 时，选择性 SSM 精确退化为门控 RNN：$g_t = \sigma(\text{Linear}(x_t))$, $h_t = (1-g_t)h_{t-1} + g_t x_t$。$(1-g_t)$ 控制遗忘，$g_t$ 控制写入——两者耦合为同一标量（不同于 LSTM 的独立门）。
- **选择性的本质**: "SSM 的离散化步长 Δ 是 RNN 启发式门控机制的**理论基础**"（论文原话："discretization of SSMs is the principled foundation of heuristic gating mechanisms"）

#### 4b. Parallel Scan 算法（新增小节）

**核心要点**:

1. **问题**: 选择性 SSM 的递推 $x_k = \bar{A}_k x_{k-1} + \bar{B}_k u_k$，参数随 $k$ 变化 → 不是 LTI → 不能用 convolution/FFT

2. **Parallel scan（前缀和）算法**:
   - 关键观察：递推 $(x_k, a_k) = (a_k \cdot x_{k-1} + b_k)$ 是一个**结合律运算**
   - 两个运算 $(a_1, b_1)$ 和 $(a_2, b_2)$ 可以组合为 $(a_2 a_1, a_2 b_1 + b_2)$
   - 结合律 → 可以用并行前缀和（类似 GPU 上的 parallel reduction）
   - **Work**: $O(L)$（与顺序执行相同）
   - **Span**: $O(\log L)$（关键的并行加速）

3. **硬件感知优化**（Mamba 论文 Section 3.3.2）:
   - 朴素做法：在 HBM 中准备 $(\bar{A}, \bar{B})$ 张量 → 尺寸 $(B, L, D, N)$ → 显存爆炸
   - Mamba 做法：将 SSM 参数 $(\Delta, A, B, C)$ 直接从 HBM 加载到 SRAM → 在 SRAM 中完成离散化 + scan → 只将最终输出 $(B, L, D)$ 写回 HBM
   - 反向传播：不存中间状态，反向时重新计算（recomputation，类似 gradient checkpointing）
   - 结果："与使用 FlashAttention 的优化 Transformer 具有相同的显存需求"（论文原话）

**可视化**: 新增 `ParallelScanViz` 组件（见组件设计部分）

**篇幅**: 原 ~20 行扩至 ~60 行 MDX

### 节 4.5: Mamba Block 详解（扩展现有子节）

**现有**: 3 行文字 + 组件
**扩展至**: 完整的架构解析

新增内容：
1. **Conv1d 的作用**: 提供局部上下文（kernel size = 4），让 SSM 在做选择性决策时能"看到"邻近 token。没有 Conv1d，SSM 的 B, C, Δ 只基于单个 token embedding 做决策。
2. **Gating 机制**: 右分支的 SiLU gate 类似 GLU (Gated Linear Unit)。输出 = SSM_output × σ(gate_input)。作用：控制信息流，防止过度激活。
3. **与 Transformer block 的结构对比**:
   - Transformer: LayerNorm → Multi-Head Attention → Residual → LayerNorm → MLP → Residual
   - Mamba: LayerNorm → Linear↑ → (Conv1d → SiLU → SSM) × Gate → Linear↓ → Residual
   - Mamba 将 Attention 和 MLP 的功能融合到了一个 block 中
4. **参数量**: expand factor $E$ 通常为 2，所以 Linear↑ 将 $D \to 2D$，Linear↓ 将 $2D \to D$

**篇幅**: 从 ~5 行扩至 ~20 行 MDX

### 节 5: Mamba-2 SSD（扩展现有）

**现有**: 核心发现 + 组件 + 2-8× 加速
**扩展至**: semiseparable 矩阵直觉 + chunk-wise 算法 + multi-head SSM + 结构化 masked attention 解释

新增内容：
1. **Semiseparable 矩阵的直觉**:
   - 矩阵 $M$ 的下三角部分的任意子矩阵 rank ≤ $N$（状态维度）
   - 直觉：因为每步只有 $N$ 维状态"传递"信息，矩阵的"信息带宽"被限制为 $N$
   - 对比 Attention：$QK^T$ 是全秩的（信息带宽 = head dim），所以更 expressive 但更慢

2. **Chunk-wise 算法**:
   - 将长度 $L$ 序列分成 $L/Q$ 个 chunk，每个 chunk 大小 $Q$
   - Chunk 内：用矩阵乘法（$Q \times Q$ 矩阵），可以利用 tensor core
   - Chunk 间：用 SSM scan（只需传递 $N$ 维状态）
   - 当 $N = Q$ 时，总计算量 $O(LN^2)$ FLOPs, $O(LN)$ 显存
   - 类比 Flash Attention 的分块策略

3. **Multi-head SSM**（Mamba-2 arXiv:2405.21060）:
   - Mamba-1：head dim $P = 1$（每个特征维度独立 SSM）
   - Mamba-2：head dim $P = 64 \text{ or } 128$（多个维度共享 A，类似 multi-head attention）
   - 效果：更大的 head dim 让矩阵乘法更高效（GPU 偏好大矩阵）

4. **结构化 Masked Attention 解释**:
   - SSD 的 dual form: $Y = (M \odot \Lambda) \cdot V$
   - 其中 $\Lambda_{ij} = \prod_{t=j+1}^{i} a_t$（input-dependent 标量的连乘）
   - "$\Lambda$ 可以看作用 data-dependent 的位置 mask 替代了 Transformer 的启发式位置编码"（论文原话）
   - 不用 softmax（省去一个 non-linearity），但加速的主要来源是 semiseparable 结构允许 sub-quadratic chunk-wise 算法，而非仅仅省去 softmax

5. **性能数据**（arXiv:2405.21060 Figure 10）:
   - 核心层速度：比 Mamba-1 fused scan 快 2-8×
   - 与 FlashAttention-2 交叉点：序列长度 ~2K
   - 序列长度 16K 时比 FlashAttention-2 快 ~6×

**篇幅**: 从 ~15 行扩至 ~45 行 MDX

### 节 6: 实战对比与基准测试（新增）

**核心数据**（全部来自 Mamba 论文 arXiv:2312.00752）:

1. **语言模型质量**（Pile 数据集，Table 3）:
   | 模型 | 参数量 | Perplexity |
   |---|---|---|
   | Pythia-1.4B | 1.4B | 7.51 |
   | RWKV-1.5B | 1.5B | 7.70 |
   | **Mamba-1.4B** | 1.4B | **6.80** |
   | Pythia-2.8B | 2.8B | 6.73 |
   | **Mamba-2.8B** | 2.8B | **6.22** |

   **下游任务平均准确率**（Mamba 论文 Table 1）:
   - Mamba-1.4B: **59.7%** vs Pythia-1.4B: 55.2%, Pythia-2.8B: 59.1%
   - Mamba-2.8B: **63.3%** vs Pythia-2.8B: 59.1%, Pythia-6.9B: 61.7%

   关键结论：Mamba-2.8B 的下游准确率（63.3%）超越了参数量 2.5 倍的 Pythia-6.9B（61.7%）。在 1.4B 规模，Mamba 也以微弱优势（59.7% vs 59.1%）超过两倍参数量的 Pythia-2.8B。即 **Mamba 大约以一半参数量匹配同质量 Transformer**。

2. **推理吞吐量**: Mamba 比同参数 Transformer 快 **5×**（A100 80GB，prompt 2048 + gen 128）

3. **SSM 的弱项**:
   - 多查询关联召回（MQAR）：Mamba-1 在此任务上挣扎（Mamba-2 论文 Figure 8）
   - In-context learning：纯 SSM 仍弱于 Attention，Mamba-2 论文建议 hybrid 架构
   - Copying 长序列：固定状态维度限制了精确复制能力

4. **信息论视角**: SSM 的固定 $N$ 维状态 = 有损压缩。当需要从长序列中精确召回某个特定 token 时（如 "第 3000 个 token 是什么？"），$N$ 维向量无法无损存储 $L >> N$ 个 token 的所有信息。这不是 bug，是 feature — SSM 擅长的是**摘要和模式识别**，不是**精确检索**。

**可视化**: 新增 `MambaBenchmarkChart` 组件（见组件设计部分）

**篇幅**: ~30-40 行 MDX

### 节 7: 总结（扩展现有）

扩展对比表，使用修正后的符号（$L$ = 序列长度）:

| | Attention | SSM (LTI, e.g. S4) | SSM (Selective, e.g. Mamba) |
|---|---|---|---|
| 训练复杂度 | $O(L^2)$ | $O(L \log L)$ (FFT) | $O(L)$ (parallel scan) |
| 推理缓存 | $O(L)$ (KV cache) | $O(1)$ (固定状态) | $O(1)$ (固定状态) |
| 历史访问 | 精确（任意 token 对） | 压缩 + 固定模式 | 压缩 + 自适应模式 |
| 内容感知 | 完全（QKV 全依赖输入） | 无（参数固定） | 部分（B, C, Δ 依赖输入） |
| 长序列 ICL | 强 | 弱 | 中等（仍弱于 Attention） |
| 核心优势 | 精确检索 | 并行训练 + 高效推理 | 选择性 + 线性复杂度 |

新增总结段落：SSM 发展路线图 — HiPPO → S4 → H3 → Mamba → Mamba-2 的逻辑链，每一步解决了什么问题。

---

## Phase 2: 组件设计

### 新增组件

#### 2.1 HiPPOMemoryViz（新增）

- **类型**: StepNavigator (3 steps)
- **文件**: `src/components/interactive/HiPPOMemoryViz.tsx`
- **功能**: 直观展示 HiPPO 如何用多项式基压缩信号历史

**Step 1: "随机 A 的遗忘问题"**
- 左侧：一段输入信号（简化为 6 个 token 的 bar chart）
- 右侧：状态向量 4 维，展示随机 A 矩阵下，旧 token 信息指数衰减
- 标注："随机 A → 指数遗忘 → 只记得最近几步"

**Step 2: "HiPPO: 用正交多项式记忆"**
- 左侧：同样的输入信号
- 中间：4 条 Legendre 多项式曲线（P₀, P₁, P₂, P₃），分别是常数、线性、二次、三次
- 右侧：状态向量的每个维度 = 信号在对应多项式上的投影系数
- 标注："状态的第 n 维 = 信号在第 n 阶 Legendre 多项式上的系数"

**Step 3: "HiPPO vs 随机初始化的效果"**
- 两个 bar chart 并排：
  - 左：随机 A → 重建信号（严重失真，只有最近部分正确）
  - 右：HiPPO A → 重建信号（较好保留全局形状）
- 底部标注："S4 在 Path-X (16K步) 上首次突破，关键正是 HiPPO 初始化"

**尺寸**: W=580, H 约 280 per step
**双语**: 是

#### 2.2 ParallelScanViz（新增）

- **类型**: StepNavigator (3 steps)
- **文件**: `src/components/interactive/ParallelScanViz.tsx`
- **功能**: 展示 parallel scan（并行前缀和）如何将 SSM 递推并行化

**Step 1: "顺序递推 — O(L) 步"**
- 一行 8 个节点 x₁...x₈，箭头从左到右依次连接
- 每个箭头标注 Ā·x + B̄·u
- 底部强调："必须等前一步完成才能计算下一步 → 7步"

**Step 2: "并行前缀和 — O(log L) 步"**
- 经典的 parallel prefix sum 树状图
- 第 1 轮：相邻两两组合 (1,2), (3,4), (5,6), (7,8) → 4次并行
- 第 2 轮：间隔 2 组合 → 2次并行
- 第 3 轮：间隔 4 组合 → 1次
- 底部标注："3步完成（log₂ 8 = 3），所有中间结果可用"

**Step 3: "Mamba 的硬件感知优化"**
- 简化的 GPU 内存层级图：HBM (大/慢) → SRAM (小/快)
- 数据流：参数 (Δ, A, B, C) 从 HBM → SRAM → 在 SRAM 中完成离散化 + scan → 输出 (B, L, D) 写回 HBM
- 对比：朴素实现需要在 HBM 中存 (B, L, D, N) 的中间张量 → Mamba 避免了这个
- 底部标注："与 FlashAttention 相同的显存需求"

**尺寸**: W=580, H 约 260 per step
**双语**: 是

#### 2.3 MambaBenchmarkChart（新增）

- **类型**: Interactive (hover + toggle)
- **文件**: `src/components/interactive/MambaBenchmarkChart.tsx`
- **功能**: Mamba vs Transformer 的性能对比可视化

**布局**:
- 上半部分：bar chart 对比 Mamba 和 Pythia（Transformer）在不同参数量下的 Pile perplexity
  - 数据点：370M, 1.4B, 2.8B
  - 两种颜色：蓝色 = Mamba, 橙色 = Pythia/Transformer
  - Hover 显示具体数值
- 下半部分：toggle 切换两个视图
  - 视图 A："推理吞吐量" — Mamba vs Transformer 在不同 batch size 下的 tokens/sec（简化 bar chart）
  - 视图 B："SSM 强项 vs 弱项" — 两列列表，绿色 check / 红色 cross

**数据源（全部来自论文）**:
- Perplexity: Mamba 论文 Table 3
- 推理吞吐量: 5x faster（Mamba 论文 abstract）
- 强项/弱项: 从论文中总结

**尺寸**: W=580, H 约 400
**双语**: 是

### 增强现有组件

#### 2.4 SelectiveScanViz 修正

**修改内容**:
1. Legend 文字修正：
   - 中文："大 Δ = 记住（内容词）" → "大 Δ = reset & focus（写入当前）"
   - 中文："小 Δ = 遗忘（功能词）" → "小 Δ = persist & ignore（保留旧态）"
   - 英文同步
2. 新增 annotation 行：展示 Δ → Ā 衰减的关系
   - 在 delta bar 下方加一行小字："Ā = e^(ΔA) ≈ {value}"，展示大 Δ 时 Ā → 0，小 Δ 时 Ā → 1
3. 状态计算逻辑增强：加入旧状态衰减效果
   - 当前：`stateContrib * delta * decay`
   - 修正：加入 `Ā = exp(-delta * 2)` 模拟旧状态的衰减

#### 2.5 SSMStateRecurrence 增强

**修改内容**:
- Step 4 柱状图：加 Y 轴标签 "相对显存占用"
- 增加一个标注："100K token 时 Attention KV cache ~数 GB，SSM state ~数 KB"

---

## Phase 3: 实施计划

### 步骤 1: 正确性修复（Phase 0）
- 修改 `state-space-models.mdx`（中文 + 英文）: Δ 解释、符号统一、D 项
- 修改 `SelectiveScanViz.tsx`: legend + 计算逻辑
- **测试**: `npm run dev` 验证渲染正确

### 步骤 2: 内容扩展 — 前半部分
- 扩展引言（节 0）
- 扩展连续 SSM（节 1）+ D 项 + SISO
- **新增 HiPPO 节**（节 1.5）+ `HiPPOMemoryViz` 组件
- 扩展离散化（节 2）
- 扩展对偶性（节 3）
- **新增 S4→Mamba 演进**（节 3.5）
- **测试**: 开发服务器验证所有新组件渲染

### 步骤 3: 内容扩展 — 后半部分
- 大幅扩展 Mamba 选择性（节 4）+ LSTM 门控类比
- **新增 parallel scan 小节** + `ParallelScanViz` 组件
- 扩展 Mamba Block 详解（节 4.5）
- 扩展 SSD（节 5）
- **测试**: 开发服务器验证

### 步骤 4: 新增 benchmark 节 + 总结
- **新增实战对比**（节 6）+ `MambaBenchmarkChart` 组件
- 扩展总结表格和段落（节 7）
- **测试**: 完整浏览全文

### 步骤 5: 英文版同步
- 将所有中文版改动同步到英文版
- 所有新增组件的英文 locale 文字

### 步骤 6: 最终验证
- `npm run validate` 通过
- `npm run build` 通过
- 中英文版本逐节对比确认一致性

---

## 风险与注意事项

1. **篇幅控制**: 扩展后约 450-550 行 MDX，需要确保每节有明确的 section break 和小标题，防止变成"论文翻译"。保持教学风格而非论文综述风格。
2. **组件复杂度**: 3 个新组件 + 2 个增强。HiPPOMemoryViz 的 Legendre 多项式渲染需要预计算，ParallelScanViz 的树状图布局需要仔细设计。MambaBenchmarkChart 数据较简单。
3. **事实核查清单**:
   - 不要在 MDX 中写"约"或"大约"——要么给确切数字（带出处），要么不给
   - Mamba 论文引用为 "Gu & Dao, 2023"（arXiv 提交年份，正式发表在 COLM 2024）
   - Mamba-2 引用为 "Dao & Gu, 2024"（注意作者顺序与 Mamba-1 相反）
   - HiPPO 引用为 "Gu et al., 2020"
   - S4 引用为 "Gu et al., 2021"（arXiv）/ ICLR 2022
4. **HiPPO-LegS 矩阵公式**: 不同来源给出的精确形式略有不同（归一化方式）。建议只给直觉和大致结构，不给完整公式，避免细节错误。
5. **Parallel scan 的精确算法**: 文章目标是直觉理解，不需要给出完整的 associative scan 代码。用前缀和类比即可。

---

## 附录: 关键论文引用检查表

| 论文 | arXiv ID | 关键事实 | 已验证 |
|---|---|---|---|
| HiPPO | 2008.07669 | Legendre 多项式基 (A_nn=-(n+1)), 最优在线压缩 | ✓ (公式已修正) |
| S4 | 2111.00396 | NPLR/DPLR, Path-X SoTA, 91% seq-CIFAR, 60× faster gen | ✓ |
| S4D | 2206.12037 | 对角化简化, A = -diag(1,...,N) (负值!) | ✓ (符号已修正) |
| H3 | 2212.14052 | SSM + gating + local conv, hybrid > pure Transformer | ✓ |
| Mamba | 2312.00752 | 选择性 B/C/Δ, parallel scan, 5× throughput, Δ=RNN gate (Thm 1), selective copying 99.8%, 下游: 1.4B→59.7%, 2.8B→63.3% | ✓ (数据已修正) |
| Mamba-2 | 2405.21060 | SSD, semiseparable, chunk-wise, multi-head SSM (P=64/128), 2-8× faster | ✓ |
