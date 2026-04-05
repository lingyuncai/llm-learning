# 强化学习：从基础到 LLM 对齐与推理 — 设计文档

## 路径定义

- **路径 ID**: `reinforcement-learning`
- **标题**: "强化学习：从基础到 LLM 对齐与推理"
- **英文标题**: "Reinforcement Learning: From Foundations to LLM Alignment & Reasoning"
- **级别**: 混合（基础层 intermediate，应用层/前沿层 advanced）
- **描述**: 从 MDP 到 Policy Gradient，从 RLHF 到 GRPO，从 Reward 设计到 Test-Time Scaling，系统理解强化学习如何驱动大语言模型的对齐、优化与推理能力。

## 设计哲学

- **原理为主，不深入框架代码**：讲算法思想和数学直觉，不追踪具体框架实现（trl、OpenRLHF 等迭代太快）
- **交互动画驱动理解**：每篇 5-6 个组件，41 个总计，用可视化让抽象概念具象化
- **从经典到前沿的完整链条**：RL 基础 → Policy Gradient → PPO → RLHF → DPO/GRPO → Reward Modeling → Test-Time Scaling
- **目标读者**：有深度学习基础（假设完成 transformer-core 路径），但 RL 零基础

## 文章依赖关系

```
1. rl-foundations (无前置)
   ↓
2. policy-gradient (前置: rl-foundations)
   ↓
3. ppo-actor-critic (前置: policy-gradient)
   ↓
4. rlhf (前置: ppo-actor-critic)
   ↓         ↓
5. direct-preference-optimization (前置: rlhf)
6. reward-modeling (前置: rlhf)
                    ↓
7. test-time-scaling (前置: reward-modeling)
```

文章 5 和 6 都依赖文章 4，但彼此独立；文章 7 依赖文章 6。

---

## 文章 1：强化学习基础

- **slug**: `rl-foundations`
- **difficulty**: intermediate
- **tags**: `reinforcement-learning`, `mdp`, `bellman-equation`, `value-function`
- **prerequisites**: 无

### 内容结构

1. **什么是强化学习** — Agent-Environment 交互循环，与监督学习的本质区别（无标签、延迟奖励、探索-利用）
2. **马尔可夫决策过程 (MDP)** — 状态、动作、转移概率、奖励函数、折扣因子 γ 的数学定义
3. **策略与价值函数** — Policy π(a|s)、State Value V(s)、Action Value Q(s,a) 的关系
4. **Bellman 方程** — 递推关系的直觉：当前价值 = 即时奖励 + 折扣未来价值
5. **Value-Based 方法** — Q-Learning、DQN 的核心思路（表格法 → 神经网络近似）
6. **从 Value 到 Policy** — 为什么 LLM 不用 Q-Learning（连续/巨大动作空间），引出 Policy Gradient
7. **推荐学习资源** — 教材、视频课程、博客、交互教程的汇总推荐（无额外组件，MDX 列表）

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| AgentEnvironmentLoop | 交互 | Agent-Environment 交互动画：点击 action，环境返回 state + reward，累积 trajectory |
| MDPGridWorld | 交互 | 经典 Grid World：可设置奖励/障碍，显示状态转移，支持手动走或自动策略执行 |
| BellmanBackup | StepNavigator | 3 步：单步 backup 直觉 → 递推展开 → 收敛到最优值 |
| ValuePolicyViz | 交互 | 左右对比：Value Function 热力图 vs Policy 箭头图，修改一个观察另一个变化 |
| QLearningDemo | 交互 | Q-Table 实时更新动画：Agent 在 Grid World 中探索，Q 值逐步收敛，颜色深浅反映学到的价值 |
| RLTaxonomy | 交互 | RL 方法分类树：Value-based / Policy-based / Actor-Critic，点击展开各方法说明，高亮 LLM 相关路径 |

### References

- Sutton & Barto "Reinforcement Learning: An Introduction" (2018)
- David Silver UCL RL Course Lectures 1-3
- OpenAI Spinning Up: Introduction to RL
- Hugging Face Deep RL Course (huggingface.co/learn/deep-rl-course)
- Lilian Weng "A (Long) Peek into Reinforcement Learning" (lilianweng.github.io)
- Sergey Levine CS285 (UC Berkeley)
- Andrej Karpathy "Deep Reinforcement Learning: Pong from Pixels" (karpathy.github.io)

---

## 文章 2：Policy Gradient

- **slug**: `policy-gradient`
- **difficulty**: intermediate
- **tags**: `policy-gradient`, `reinforce`, `baseline`, `variance-reduction`
- **prerequisites**: `rl-foundations`

### 内容结构

1. **为什么直接优化策略** — Value-based 的局限（离散动作、无法处理随机策略），Policy Gradient 的动机
2. **策略梯度定理** — ∇J(θ) = E[∇log π(a|s) · R] 的推导直觉：好 action 的概率上升，坏 action 的概率下降
3. **REINFORCE 算法** — 最简单的 PG：采样 trajectory → 计算 return → 更新参数，完整伪代码
4. **高方差问题** — 为什么 REINFORCE 学得慢：reward 的绝对值影响梯度方向，同一 trajectory 可能偶然获得高/低 reward
5. **Baseline 与 Advantage** — 引入 baseline b(s) 降低方差，Advantage A(s,a) = Q(s,a) - V(s) 的直觉：不是"好不好"而是"比平均好多少"
6. **从 REINFORCE 到 Actor-Critic** — 用神经网络近似 V(s) 作为 baseline → 自然过渡到 Actor-Critic 架构

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| PolicyGradientIntuition | 交互 | 2D 概率分布可视化：策略参数 θ 控制动作概率分布，正 reward 推高选中 action 概率，负 reward 压低，拖动观察分布变化 |
| REINFORCETrajectory | 交互 | 采样 trajectory 动画：Agent 走一条路径 → 计算每步 return → 显示梯度更新方向，可多次采样观察方差 |
| VarianceProblem | 交互 | 对比实验：同一策略多次采样，显示梯度估计的散布（高方差），统计图展示梯度方向的不一致性 |
| BaselineEffect | 交互 | 左右对比：无 baseline（梯度方差大、收敛曲线抖动）vs 有 baseline（方差小、收敛平滑），toggle 切换 |
| AdvantageExplainer | StepNavigator | 4 步：raw return → 减去 baseline → Advantage 定义 → 为什么 "比平均好多少" 比 "绝对好坏" 更有效 |
| PGAlgorithmFamily | 交互 | 算法演进图：REINFORCE → REINFORCE+baseline → Actor-Critic → A2C → PPO，点击节点展开核心改进点 |

### References

- Sutton et al. "Policy Gradient Methods for Reinforcement Learning with Function Approximation" (1999)
- Williams "Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning" (1992) — REINFORCE 原始论文
- Lilian Weng "Policy Gradient Algorithms" (lilianweng.github.io)
- Sergey Levine CS285 Lectures 5-6: Policy Gradient
- OpenAI Spinning Up: Policy Gradient

---

## 文章 3：Actor-Critic 与 PPO

- **slug**: `ppo-actor-critic`
- **difficulty**: advanced
- **tags**: `actor-critic`, `ppo`, `gae`, `advantage`, `clipping`
- **prerequisites**: `policy-gradient`

### 内容结构

1. **Actor-Critic 架构** — Actor（策略网络）产出动作，Critic（价值网络）评估好坏，两个网络协同训练
2. **Temporal Difference 与 Advantage 估计** — TD(0) 的 bootstrap 直觉，n-step return，为什么不用 Monte Carlo
3. **GAE (Generalized Advantage Estimation)** — λ 参数平衡偏差与方差：λ=0 → 高偏差低方差（TD），λ=1 → 低偏差高方差（MC），实际取 λ=0.95
4. **Trust Region 问题** — Policy Gradient 的致命缺陷：步长太大策略崩溃、太小收敛太慢；TRPO 的思路（KL 约束）
5. **PPO 核心机制** — Clipped Surrogate Objective 的直觉：ratio = π_new/π_old，clip 到 [1-ε, 1+ε] 限制更新幅度；为什么比 TRPO 简单有效
6. **PPO 在 LLM 中的角色** — 从游戏 RL 到 RLHF：token 生成 = action 序列，reward model score = reward，PPO 优化策略使 LLM 输出符合人类偏好

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| ActorCriticArchitecture | 交互 | 双网络架构图：Actor 输出 action 概率 → 环境返回 reward → Critic 估计 V(s) → 计算 Advantage → 分别更新两个网络，动画高亮数据流 |
| GAELambdaSlider | 交互 | 滑块调 λ（0→1），实时显示 advantage 估计的偏差-方差 trade-off：左图显示估计值散布，右图显示收敛曲线 |
| TrustRegionViz | 交互 | 2D 策略空间：当前策略为圆心，trust region 为圆圈，显示 gradient step 可能跳出安全区域导致性能崩溃，对比有/无 trust region |
| PPOClipExplainer | 交互 | PPO 核心图：x 轴 ratio (π_new/π_old)，y 轴 objective，显示 clip 区间 [1-ε, 1+ε]，Advantage>0 和 Advantage<0 两种情况的 clip 行为，拖动 ε 观察变化 |
| PPOvsVanillaPG | 交互 | 训练曲线对比：Vanilla PG（抖动大、偶尔崩溃）vs PPO（稳定上升），hover 显示每步的 ratio 和 clip 状态 |
| PPOForLLM | StepNavigator | 4 步：LLM 生成回答 → Reward Model 评分 → 计算 Advantage → PPO 更新策略，对比游戏 RL 和 LLM RL 的对应关系 |

### References

- Schulman et al. "Proximal Policy Optimization Algorithms" (2017)
- Schulman et al. "High-Dimensional Continuous Control Using Generalized Advantage Estimation" (2016) — GAE
- Schulman et al. "Trust Region Policy Optimization" (2015) — TRPO
- Lilian Weng "Policy Gradient Algorithms" (lilianweng.github.io)
- Sergey Levine CS285 Lectures 7-9
- Hugging Face Deep RL Course: PPO

---

## 文章 4：RLHF — 从人类反馈中学习

- **slug**: `rlhf`
- **difficulty**: advanced
- **tags**: `rlhf`, `reward-model`, `alignment`, `instruct-gpt`, `kl-divergence`
- **prerequisites**: `ppo-actor-critic`

### 内容结构

1. **为什么需要对齐** — Pretrained LLM 会说有害内容、不遵循指令、编造事实；loss function 无法直接编码"有帮助且安全"
2. **RLHF 三阶段流程** — SFT (Supervised Fine-Tuning) → Reward Model 训练 → PPO 策略优化，InstructGPT 的完整 pipeline
3. **Reward Model 训练** — 人类标注偏好对 (y_w ≻ y_l)，Bradley-Terry 模型，pairwise ranking loss
4. **PPO 对齐优化** — LLM 作为 policy，token 生成作为 action 序列，reward = RM score - β·KL(π∥π_ref)
5. **KL 约束的重要性** — 没有 KL 惩罚会怎样：reward hacking（LLM 学会 hack RM 而非真正变好），KL 散度作为"不要偏离太远"的锚
6. **RLHF 的局限** — reward model 是瓶颈（人类偏好不一致、标注成本高、RM 易被 exploit），引出 DPO/GRPO 的动机

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| RLHFPipeline | 交互 | 三阶段流水线全景：SFT → RM → PPO，点击每个阶段展开详细数据流（输入/输出/loss），高亮当前阶段 |
| PreferenceLabeling | 交互 | 模拟人类标注：给定 prompt + 两个回答，用户点选偏好，积累标注数据后显示 RM 如何从偏好对中学习排序 |
| RewardModelTraining | StepNavigator | 3 步：偏好对收集 → Bradley-Terry 概率建模 → Ranking Loss 训练，每步显示数学公式 + 直觉图 |
| KLPenaltyViz | 交互 | 滑块调 β（KL 惩罚系数），观察 reward vs KL divergence 的 trade-off：β 太小 → reward hacking，β 太大 → 几乎没有优化 |
| RewardHackingDemo | 交互 | 对比展示：无 KL 约束时 LLM 的退化过程（reward 上升但输出质量下降的例子），有 KL 约束时的平衡 |
| AlignmentMethodTimeline | 交互 | 时间线：InstructGPT(2022) → ChatGPT(2022) → Llama2-RLHF(2023) → DPO(2023) → GRPO(2024)，hover 显示每个里程碑的技术改进 |

### References

- Ouyang et al. "Training language models to follow instructions with human feedback" (2022) — InstructGPT
- Christiano et al. "Deep Reinforcement Learning from Human Preferences" (2017) — RLHF 原始论文
- Ziegler et al. "Fine-Tuning Language Models from Human Preferences" (2019)
- Chip Huyen "RLHF: Reinforcement Learning from Human Feedback"
- Nathan Lambert (interconnects.ai) RLHF 系列
- Lilian Weng "Reward Hacking in Reinforcement Learning" (lilianweng.github.io)

---

## 文章 5：从 DPO 到 GRPO — 直接偏好优化

- **slug**: `direct-preference-optimization`
- **difficulty**: advanced
- **tags**: `dpo`, `grpo`, `ipo`, `preference-optimization`, `offline-rl`
- **prerequisites**: `rlhf`

### 内容结构

1. **RLHF 的痛点** — Reward Model 训练成本高、RM 质量是瓶颈、PPO 训练不稳定（4 个模型同时跑：policy, ref, RM, critic）
2. **DPO 核心推导** — 关键洞察：最优策略和 reward function 之间有 closed-form 关系，可以把 RM 消掉，直接从偏好数据优化策略；DPO loss 的直觉：让 preferred 回答的概率上升、rejected 的下降，隐式学习 reward
3. **DPO 的优势与问题** — 优势：去掉 RM 和 PPO、训练简单如 SFT；问题：offline 数据分布偏移、对偏好数据质量敏感、容易过拟合
4. **IPO 与 KTO** — IPO：解决 DPO 的过拟合问题（加正则）；KTO：不需要配对偏好，只需要"好/坏"标签
5. **GRPO (Group Relative Policy Optimization)** — DeepSeek 的方案：去掉 Critic 网络，从同一 prompt 采样一组回答 → 组内相对排序作为 advantage → 减少训练资源需求；数学推导和与 PPO 的对比
6. **方法选型** — RLHF vs DPO vs GRPO 的 trade-off 三角：训练稳定性 / 数据效率 / 计算成本

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| RLHFvsDPOArchitecture | 交互 | 左右架构对比：RLHF（4 模型：policy+ref+RM+critic）vs DPO（2 模型：policy+ref），高亮被消除的组件，显示训练 GPU 占用对比 |
| DPOLossViz | 交互 | DPO loss 函数可视化：x 轴 log(π/π_ref) 差值，y 轴 loss，拖动 β 参数观察 loss 曲线变化，标注 preferred 和 rejected 的梯度方向 |
| OfflineVsOnline | StepNavigator | 3 步：DPO (offline, 固定数据集) → Online DPO (迭代采样新数据) → GRPO (在线组采样)，对比数据新鲜度和训练成本 |
| GRPOGroupSampling | 交互 | GRPO 核心机制动画：一个 prompt → 采样 G 个回答 → 各自打分 → 计算组内相对 advantage → 更新策略，滑块调 G 大小观察方差变化 |
| MethodEvolution | 交互 | 方法演进图谱：RLHF → DPO → IPO → KTO → GRPO，每个节点点击展开"解决了什么问题 / 引入了什么问题" |
| TrainingCostCompare | 交互 | 柱状图对比：RLHF / DPO / GRPO 三种方案的训练资源需求（GPU 数、模型数、数据需求、训练时长），hover 显示详细数值 |

### References

- Rafailov et al. "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (2023) — DPO
- Azar et al. "A General Theoretical Paradigm to Understand Learning from Human Feedback" (2023) — IPO
- Ethayarajh et al. "KTO: Model Alignment as Prospect Theoretic Optimization" (2024)
- Shao et al. "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models" (2024) — GRPO
- Hugging Face TRL Documentation: DPO Trainer, GRPO Trainer
- Lilian Weng "Preference Tuning LLMs" (lilianweng.github.io)

---

## 文章 6：Reward 设计与 Scaling

- **slug**: `reward-modeling`
- **difficulty**: advanced
- **tags**: `reward-model`, `reward-hacking`, `process-reward`, `outcome-reward`, `reward-shaping`
- **prerequisites**: `rlhf`

### 内容结构

1. **Reward Model 是对齐的核心** — 无论 RLHF/DPO/GRPO，最终都依赖某种形式的 reward 信号；RM 的质量直接决定对齐效果的天花板
2. **Outcome Reward vs Process Reward** — ORM：只看最终答案对不对；PRM：对推理过程的每一步打分。PRM 的优势：更细粒度的信号、能识别"碰巧对但推理错"的情况
3. **Reward Hacking 深度分析** — Goodhart's Law 在 RL 中的体现：模型学会 exploit RM 的弱点而非真正变好；常见 pattern（冗长回答、讨好措辞、格式 hack）
4. **Reward Model Scaling** — RM 的 scaling law：更大的 RM 更难被 hack；RM 的数据 scaling：更多样化的偏好数据减少盲区
5. **Constitutional AI 与自动 Reward** — Anthropic 的 RLAIF 思路：用 LLM 自己生成偏好判断，减少人工标注；self-play 和 iterative RM refinement
6. **从 Reward 到 Verifier** — reward model 的进化：从打分器到验证器 (verifier)，为 test-time scaling 铺路

### 组件（5 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| ORMvsPRM | 交互 | 左右对比：一道数学题的推理过程，ORM 只标注最终答案 ✓/✗，PRM 对每一步标注 ✓/✗，高亮 PRM 捕捉到的"过程错但结果碰巧对"的情况 |
| RewardHackingGallery | 交互 | Reward Hacking 案例展：3-4 个真实案例（冗长回答、讨好措辞、格式 exploit），每个案例显示 RM score（高）vs 真实质量（低），toggle 查看详情 |
| RewardScalingChart | 交互 | 双轴折线图：x 轴 RM 参数量，y 轴 1=对齐效果 2=hack 成功率，展示更大 RM 更难 hack 的 scaling 趋势，hover 显示数据点 |
| ConstitutionalAIFlow | StepNavigator | 4 步：人类写 principles → LLM 自我评判 (critique) → 生成改进版本 (revision) → 用改进对训练 RM (RLAIF)，对比 RLHF 和 RLAIF 的标注来源 |
| RewardToVerifier | 交互 | 演进图：Reward Model (标量打分) → Process Reward Model (逐步打分) → Verifier (验证推理正确性) → 引出 test-time scaling，点击每个阶段展开能力对比 |

### References

- Lightman et al. "Let's Verify Step by Step" (2023) — Process Reward Model
- Cobbe et al. "Training Verifiers to Solve Math Word Problems" (2021) — Verifier
- Bai et al. "Constitutional AI: Harmlessness from AI Feedback" (2022) — Anthropic RLAIF
- Gao et al. "Scaling Laws for Reward Model Overoptimization" (2022) — Reward Hacking
- Lilian Weng "Reward Hacking in Reinforcement Learning" (lilianweng.github.io)
- Nathan Lambert (interconnects.ai) Reward Model 系列

---

## 文章 7：Test-Time Scaling 与思维强化

- **slug**: `test-time-scaling`
- **difficulty**: advanced
- **tags**: `test-time-scaling`, `chain-of-thought`, `mcts`, `deepseek-r1`, `thinking`, `verifier`
- **prerequisites**: `reward-modeling`

### 内容结构

1. **Train-Time vs Test-Time Scaling** — 传统 scaling law 靠增大模型/数据（train-time）；新范式：固定模型，推理时投入更多计算来提升质量（test-time）
2. **Chain-of-Thought 的 RL 视角** — CoT 不只是 prompting 技巧：每一步推理 = 一个 action，思维链 = trajectory，可以用 RL 优化"如何思考"
3. **Best-of-N 与 Rejection Sampling** — 最简单的 test-time scaling：生成 N 个回答 → 用 verifier 选最好的；N 越大结果越好但成本线性增长
4. **MCTS + LLM** — 把推理过程建模为树搜索：每个节点是一个推理步骤，用 PRM 评估节点价值，MCTS 策略探索最优推理路径
5. **DeepSeek-R1 式 Thinking** — 用 RL 直接训练 LLM 学会"思考"：GRPO + 规则 reward → 模型自发涌现 CoT、自我验证、回溯等行为；从 R1-Zero 到 R1 的蒸馏
6. **Compute-Optimal Inference** — 什么时候该用 test-time scaling：简单问题不需要、难问题收益大；动态分配推理预算的策略

### 组件（6 个）

| 组件名 | 类型 | 说明 |
|--------|------|------|
| ScalingParadigmCompare | 交互 | 左右对比：Train-Time Scaling（增大模型 → 性能提升曲线趋缓）vs Test-Time Scaling（增加推理计算 → 性能继续提升），两条 scaling curve 交叉 |
| BestOfNSimulator | 交互 | 滑块调 N（1→64），模拟 N 次采样 + verifier 选最优，显示正确率随 N 增长的曲线和计算成本对比 |
| MCTSReasoningTree | 交互 | 推理树可视化：根节点是问题，每层展开是推理步骤，节点颜色反映 PRM 分数，MCTS 的 select→expand→evaluate→backpropagate 四步动画 |
| DeepSeekR1Pipeline | StepNavigator | 4 步：冷启动数据 → GRPO 训练 (R1-Zero，涌现 thinking) → Rejection Sampling 收集高质量 CoT → SFT+RL 蒸馏到小模型 (R1) |
| EmergentThinking | 交互 | R1-Zero 涌现行为展示：给定一个数学问题，显示模型的 thinking 过程（自我验证、回溯、分步推理），高亮涌现行为标签，toggle 对比有/无 RL 训练的输出 |
| ComputeOptimalInference | 交互 | 散点图：x 轴问题难度，y 轴最优推理计算量，颜色标注使用的策略（直接回答/CoT/Best-of-N/MCTS），展示"简单题少想、难题多想"的动态分配 |

### References

- Snell et al. "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters" (2024)
- DeepSeek-AI "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning" (2025)
- Lightman et al. "Let's Verify Step by Step" (2023) — PRM
- Feng et al. "AlphaZero-like Tree-Search can Guide Large Language Model Decoding and Training" (2024) — MCTS+LLM
- Noam Brown talks on test-time compute scaling
- Andrej Karpathy "Deep Reinforcement Learning: Pong from Pixels" (karpathy.github.io)
- Hugging Face Deep RL Course

---

## 总计

- **7 篇文章**，41 个交互组件
- **新路径**: `reinforcement-learning.yaml`
- 文章 1-2 为 intermediate，文章 3-7 为 advanced
