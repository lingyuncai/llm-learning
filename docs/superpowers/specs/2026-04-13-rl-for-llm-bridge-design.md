# 设计文档：当 RL 遇上 LLM — 桥梁文章

**日期**: 2026-04-13
**状态**: Draft

## 1. 背景与动机

RL 学习路径现有 7 篇文章：

```
rl-foundations → policy-gradient → ppo-actor-critic → rlhf → direct-preference-optimization → reward-modeling → test-time-scaling
```

前 3 篇讲经典 RL（MDP、PG、PPO），后 4 篇讲 LLM 对齐应用。问题在于：**两者之间缺乏正式的桥梁**。现有文章只在零散位置用一两句话提到 LLM 映射（rl-foundations 第 155-163 行、policy-gradient 第 43 行、ppo-actor-critic 第 98-108 行），读者无法建立"LLM 生成过程 = RL 决策过程"的完整心智模型。

核心问题：
- MDP 五元组从未正式映射到 LLM 生成过程
- "为什么不能直接用最优数据做 SFT"这个根本问题没有回答
- LLM RL 特有的技术挑战（sparse reward, credit assignment, KL penalty）缺乏铺垫

## 2. 文章定位

- **slug**: `rl-for-llm`
- **title**: "当 RL 遇上 LLM：从语言生成到策略优化"
- **position**: 学习路径第 4 篇（ppo-actor-critic 之后，rlhf 之前）
- **difficulty**: intermediate
- **prerequisites**: `[rl-foundations, policy-gradient, ppo-actor-critic]`

新学习路径：
```
rl-foundations → policy-gradient → ppo-actor-critic → rl-for-llm → rlhf → direct-preference-optimization → reward-modeling → test-time-scaling
```

**核心使命**：
1. 为读者建立"LLM 生成过程 = RL 决策过程"的完整心智模型
2. 深入解释为什么 SFT/behavioral cloning 不够，RL 不可替代
3. 把前 3 篇学的 PG/Advantage/PPO 全部"翻译"到 LLM 语境
4. 铺垫 LLM RL 特有的技术挑战，为 RLHF/DPO 做好入口
5. 提供 post-training 全景路线图

## 3. 文章结构

### §1 SFT 的天花板：为什么 Behavioral Cloning 不够

全文的核心论证，需要讲透。用 SFT vs RL 对比驱动叙事。

**覆盖的论点**：

**1) Distribution Shift / Exposure Bias**
- SFT 在训练时看到的是人类写的"完美轨迹"，但推理时模型自己生成 token
- 一旦某步生成了训练数据中没见过的 token，模型进入陌生状态，后续错误 compound
- 类比：只看老司机开车录像学开车，一旦偏离录像中的路线就不知道怎么修正
- RL 的解决：模型从自己的生成中学习，天然覆盖自己会犯的错误

**2) Ceiling Problem（上限问题）**
- SFT 最好也只能模仿训练数据的水平，无法超越
- RL 可以通过 exploration 发现数据中没有的更好策略
- 具体例子：DeepSeek-R1-Zero 证明了纯 RL（无任何 SFT 数据）即可让模型自发产生 chain-of-thought、self-verification 等推理行为；最终的 DeepSeek-R1 在此基础上加入 cold-start SFT + 多轮 RL 以提升可读性和稳定性。关键在于：RL 阶段产生的推理能力超越了 SFT 数据所能教授的上限

**3) Sequence-Level 目标无法通过离散采样反向传播**
- "有帮助"、"安全"、"推理正确"这些目标是在 **整个 response 层面** 定义的
- 即使 Reward Model 本身是可微的，中间的 **token 离散采样过程**（从概率分布中选一个 token）是不可微的——你无法对 argmax / categorical sampling 求导
- SFT 绕过了这个问题（直接用 teacher forcing + cross-entropy），但代价是只能优化 token 级别的模仿目标，无法优化 sequence-level 的质量目标
- Policy Gradient 正是为此而生：它不需要通过采样过程反向传播，而是用 REINFORCE 估计梯度

**4) On-policy 自我进化**（与 point 1 的 distribution shift 互补）
- Point 1 描述了问题（训练分布 ≠ 推理分布），这里解释 RL 为什么天然不存在这个问题
- RL 是 on-policy 的：训练数据由模型自己生成，天然覆盖模型当前会犯的错误
- 随着模型改进，生成的数据质量也在提升——形成"自我进化"的正循环
- SFT 的训练数据是固定的，无论模型训练到什么水平，数据不会跟着变

**交互组件**: `SFTvsRLComparison` — 左右对比动画，左侧展示 SFT 学习过程（只看示范，遇到偏离就崩溃），右侧展示 RL 学习过程（自己尝试，从 reward 中学习修正）。使用简化的文本生成场景。

### §2 语言生成的马尔可夫决策过程

**1) 完整的 MDP 五元组映射**

用正式的数学定义把 LLM 生成建模为 MDP：

| MDP 元素 | 形式化定义 | LLM 中的含义 |
|----------|-----------|-------------|
| State $s_t$ | $s_t = (x, y_{<t})$ | prompt $x$ + 已生成的 token 序列 $y_1, ..., y_{t-1}$ |
| Action $a_t$ | $a_t \in \mathcal{V}$ | 从词汇表中选一个 token |
| Policy $\pi_\theta(a_t \| s_t)$ | softmax 输出层 | LLM 本身：给定 context 输出 token 概率分布 |
| Transition $P(s_{t+1} \| s_t, a_t)$ | 确定性：$s_{t+1} = (x, y_{<t}, a_t)$ | 把选中的 token 拼接到序列后面 |
| Reward $R(s_t, a_t)$ | 取决于任务设计 | 可以是 RM score、规则判定、人类评分 |
| Terminal state | 生成 EOS token 或达到最大长度 | 一个完整 response 结束 |
| Episode | 一轮完整生成 $(s_0, a_0, r_0, ..., s_T)$ | 从 prompt 到生成完整回答的全过程 |
| $\gamma$ | 通常为 1 | response 是有限长的，不需要折扣 |

**2) LLM MDP 的特殊性**（与经典 RL 对比）

- **确定性转移**：经典 RL 的环境有随机性，LLM 的状态转移是确定的（拼接 token）
- **巨大动作空间**：32K-128K 个可能的 token，远超一般游戏的几十个动作
- **变长 episode**：生成长度不固定
- **Reward 的特殊结构**：通常只在 episode 结束时给一个 reward（sparse），中间步骤 reward 为 0

**3) 具体 Walkthrough 示例**

用一个真实的简短 prompt（如"中国的首都是"）逐步展示完整的 state→action→transition→reward 流程，让抽象映射变成具体过程。

**4) 马尔可夫性讨论**

简要说明：Transformer 的 attention 机制让每步都能看到完整历史，所以 state 定义为完整序列 $(x, y_{<t})$ 时是满足马尔可夫性的——因为 state 本身就包含了所有历史信息。

**交互组件**: `LLMasMDP` — 给定一个 prompt，逐 token 动画展示 state 变化、概率分布柱状图、action 选择过程。用户可以手动点"下一步"或自动播放。

**5) Token-level vs Response-level：两种建模粒度**

上述 MDP 是 token-level 的（每个 token 是一个 action），这是最基础的视角。但后续文章中不同方法使用不同粒度：

- **Token-level MDP**（PPO in RLHF）：每个 token 计算 advantage，逐 token 优化策略
- **Response-level / Bandit-like 视角**（DPO, GRPO）：把整个 response 当作一个"action"，在 response pairs 之间做对比优化

两种视角数学上等价（response-level 的 log probability 就是 token-level log probabilities 的求和），但操作粒度不同。Token-level 更细致但计算更复杂；response-level 更简洁，是 DPO/GRPO 等方法能简化训练的关键。

在后续文章中遇到不同粒度时会明确标注，这里只需建立意识：**同一个 MDP 可以在不同粒度上操作**。

### §3 从 PG 到 PPO：在 LLM 语境下重新理解

把前 3 篇学过的核心公式逐一"翻译"到 LLM 场景。不重复推导，而是标注每个符号在 LLM 中的具体含义。

**Policy Gradient → LLM 微调梯度**
- $\nabla_\theta J = \mathbb{E}[\nabla_\theta \log \pi_\theta(y_t | x, y_{<t}) \cdot A_t]$
- 直觉翻译："如果生成的 token $y_t$ 对应的 advantage 为正（这个 token 让整体回答变好了），就增大它的概率"

**Advantage → token 级别的"好坏判断"**
- 在 LLM 中，advantage $A_t$ 回答的是："在已经生成了 $y_{<t}$ 的前提下，选择 token $y_t$ 比平均选择好多少？"
- 这个概念对后续理解 RLHF 中 PPO 如何调整每个 token 概率至关重要

**PPO Clip → 防止 LLM 单次更新突变**
- ratio $r_t = \frac{\pi_\theta(y_t|x,y_{<t})}{\pi_{old}(y_t|x,y_{<t})}$ 就是"新模型和旧模型对同一个 token 给出的概率之比"
- clip 的含义：不允许任何单个 token 的生成概率变化太剧烈

不配独立交互组件，用公式 + 文字与第二节自然衔接。

### §4 LLM 强化学习的独特挑战

讲 LLM RL 特有的、经典 RL 中不存在或不突出的问题。

**1) Sparse Reward 与 Credit Assignment**
- 典型设置：整个 response 生成完后才得到一个 reward（比如 RM 给一个分数）
- 问题：response 有几百个 token，到底是哪些 token 的"功劳/过错"？
- 这就是 credit assignment 问题，直接影响学习效率
- 引出两种 reward 粒度：
  - **Outcome Reward (ORM)**：整个回答一个分 → sparse，credit assignment 难
  - **Process Reward (PRM)**：每步推理打分 → dense，但标注成本高
- 预告：这个问题在 reward-modeling 那篇文章会深入展开

**2) KL Penalty 的角色**
- 为什么需要：没有 KL 约束，模型会 exploit reward 信号（reward hacking）
- 直觉：KL penalty 让 LLM"不要忘记预训练学到的语言能力"
- 公式：$R_{total} = R_{task}(y|x) - \beta \cdot KL(\pi_\theta \| \pi_{ref})$
- 在 token 级别：$r_t = r_{task,t} - \beta \cdot [\log \pi_\theta(y_t|s_t) - \log \pi_{ref}(y_t|s_t)]$
- **关键细节**：$r_{task,t} = 0$ 对所有中间 token（$t < T$），只有最后一个 token $r_{task,T} = R_{RM}(x, y)$ 才携带任务 reward。因此中间步骤的 reward 信号完全来自 KL penalty——这也是 KL penalty 在 credit assignment 中起到意外重要作用的原因
- 参数 $\beta$ 的 trade-off：太大 → 学不动，太小 → reward hacking

**3) 生成即采样：on-policy 的代价**
- RL 优化需要 on-policy 数据（模型自己生成的 response）
- 每次参数更新后，之前采集的数据就"过期"了
- 这是 RLHF 训练成本高的根本原因之一
- 也是 DPO（offline，不需要采样）有吸引力的原因

**交互组件**: `TokenRewardAssignment` — 可视化一个 response 的 token 序列，展示 sparse reward（只有最后一个 token 有分）vs dense reward（每个 token 有分）下的 credit 分配对比。用户可以切换两种模式。

### §5 Post-Training 全景：从 SFT 到推理强化

全文收束，自顶向下给一张完整地图：

```
Pretrained LLM
    ↓
SFT (监督微调) — 学会遵循指令的格式和基本能力
    ↓
┌─────────────────────────────────────────────┐
│  RL 对齐与优化（本学习路径的后续文章）          │
│                                             │
│  RLHF  — SFT + RM + PPO，完整但复杂          │
│  DPO   — 跳过 RM，直接从偏好数据优化（offline） │
│  GRPO  — 无 Critic，组内相对排名（DeepSeek）   │
│  ...更多变体持续涌现                          │
└─────────────────────────────────────────────┘
    ↓
Reward 设计 — ORM vs PRM, reward hacking 防御
    ↓
Test-Time Scaling — Best-of-N, MCTS, 推理时计算换质量
```

每个阶段用 1-2 句话说明它**解决什么问题**和**对应哪篇后续文章**，让读者带着路线图进入后半程。

**交互组件**: `PostTrainingPipeline` — 可交互的全景 pipeline 图。每个阶段可点击展开，展示该阶段的核心 RL 概念、优化目标、和前文的对应关系。

## 4. 交互组件汇总

| 组件名 | 所在节 | 功能 |
|--------|--------|------|
| `SFTvsRLComparison` | §1 SFT 的天花板 | 左右对比 SFT 和 RL 的学习过程，展示 distribution shift 和 exploration 差异 |
| `LLMasMDP` | §2 语言生成的 MDP | 逐 token 动画展示 state→action→transition→reward 全过程 |
| `TokenRewardAssignment` | §4 独特挑战 | sparse vs dense reward 下的 credit assignment 可视化对比 |
| `PostTrainingPipeline` | §5 全景图 | 可点击展开的 post-training pipeline 全览 |

共 4 个交互组件，每个承担核心教学功能。

## 5. 对现有文章的改动

### rl-foundations.mdx

在 MDP 五元组讲完后加 1 段 LLM 锚点：

> "在后续文章中我们会看到，LLM 的文本生成过程可以完美地建模为 MDP——state 是已生成的 token 序列，action 是选择下一个 token。这里先建立直觉，详细映射见《当 RL 遇上 LLM》。"

"从 Value 到 Policy"那一节现有内容已经提到了 LLM，保持不变。

### reinforcement-learning.yaml

学习路径中在 ppo-actor-critic 之后插入 rl-for-llm：

```yaml
articles:
  - rl-foundations
  - policy-gradient
  - ppo-actor-critic
  - rl-for-llm          # 新增
  - rlhf
  - direct-preference-optimization
  - reward-modeling
  - test-time-scaling
```

### ppo-actor-critic.mdx

第 96-111 行的"PPO 在 LLM 中的角色"映射表保留，因为读者到 PPO 那篇已经对算法有深入理解，再看映射是一种回顾和预告。但加一句引导语指向新文章："下一篇《当 RL 遇上 LLM》将完整展开这个映射。"

## 6. References（候选）

- Ouyang et al., 2022 — "Training language models to follow instructions with human feedback" (InstructGPT)
- Rafailov et al., 2023 — "Direct Preference Optimization" (DPO)
- Shao et al., 2024 — "DeepSeekMath" (GRPO)
- DeepSeek-R1, 2025 — RL 驱动推理能力涌现
- Ross et al., 2011 — "A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning" (DAgger, distribution shift 的经典论文)
- Ranzato et al., 2016 — "Sequence Level Training with Recurrent Neural Networks" (MIXER, 早期将 RL 用于 seq2seq)
- Stiennon et al., 2020 — "Learning to summarize from human feedback" (RLHF 早期工作)
- Ziegler et al., 2019 — "Fine-Tuning Language Models from Human Preferences"
- Lilian Weng blog — Policy Gradient / RLHF 系列
