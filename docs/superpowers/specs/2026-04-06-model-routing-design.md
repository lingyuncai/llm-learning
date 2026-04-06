# LLM Model Routing 学习路径设计文档

**日期**: 2026-04-06
**路径 ID**: `model-routing`
**标题**: "LLM Model Routing：智能模型选择与混合推理"
**难度**: advanced
**文章数**: 6 篇
**交互组件数**: 33 个
**定位**: 与 inference-serving（引擎内部机制）互补——inference-serving 讲"一个模型怎么高效服务"，model-routing 讲"怎么选对模型"

---

## 核心主题

根据任务复杂度自动选择对应的 LLM 模型。覆盖从简单分类器到 RL 在线学习，从 query-level 到 token-level，从"选一个"到"全都用"的完整方法谱系。

### 特别强调

1. **Hybrid LLM（本地 vs 云端路由）单独成篇**：自动判断走本地小模型还是云端大模型，是最贴近实际应用的场景
2. **能力匹配是第一驱动因素**：其他因素（成本、隐私、延迟）只在能力满足时才是附加偏好
3. **延迟 tradeoff 的复杂性**：本地 ≠ 低延迟。本地零网络延迟但计算慢（消费级硬件），云端有网络往返但 A100/H100 计算快

---

## 路径组织：先原理后场景

```
1. 全景综述（问题定义 + 分类框架 + 多维度对比）     ← 鸟瞰图
2. 路由分类器（MF, BERT, Causal LM, Semantic）       ← 算法基础
3. 级联与自验证（FrugalGPT, AutoMix, 置信度）        ← 算法基础
4. Hybrid LLM: 本地与云端                             ← 场景应用（复用2-3的算法）
5. 在线学习与成本优化（Bandit, RL, Pareto）           ← 动态方法
6. 多模型协作（MoA, Council, ensemble）               ← 哲学转变
```

Prerequisite 关系：
- 第1篇无前置
- 第2-6篇都依赖第1篇
- 第4篇建议先读第2、3篇（因为复用算法）

---

## 调研基础

### 关键论文与系统

| 名称 | 年份 | 核心贡献 |
|------|------|----------|
| FrugalGPT | 2023 | 级联方法开山之作，98% 成本降低 |
| AutoMix | 2023/NeurIPS 2024 | POMDP + few-shot 自验证路由 |
| RouteLLM | 2024 | 开源路由框架，MF/BERT/Causal LM/SW 四种 router |
| Confidence-Driven Router | 2025 | 不确定性估计 + LLM-as-Judge |
| ConsRoute | 2026 | Reranker 语义一致性做 cloud-edge-device 路由 |
| HybridFlow | 2025 | Subtask-level DAG 路由 |
| PRISM | 2025/AAAI 2026 | 实体级隐私敏感度路由 |
| Router-free RL | 2025 | 本地模型通过 RL 自学升级决策 |
| Token-level Hybrid | 2024 | 逐 token 置信度判断，调用云端 |
| Small Models as Routers | 2026 | 1-4B 模型做路由，78.3% 准确率 |
| ParetoBandit | 2026 | Cost-aware contextual bandit |
| Agent Q-Mix | 2026 | RL 优化多 agent 拓扑 |
| Council Mode | 2026 | 并行多 LLM + 综合，35.9% 幻觉降低 |
| HieraMAS | 2026 | 层级 MoA 架构 |
| Pyramid MoA | 2026 | 层级 MoA + decision-theoretic router |
| Apple Intelligence | 2024 | 产品化 on-device + Private Cloud Compute |

### 路由机制分类

**按路由粒度**：
- Query-level：整个请求选一个模型
- Subtask-level：拆分子任务，各自路由
- Token-level：生成过程中逐 token 切换

**按决策时机**：
- 静态：部署前确定规则（分类器、语义匹配）
- 动态：运行时持续学习（bandit、RL）

**按模型使用方式**：
- 选一个（routing）
- 先试后验（cascade）
- 全用（ensemble / MoA）

**按路由器类型**：
- Matrix Factorization（偏好数据学评分函数）
- BERT 分类器（微调做二分类）
- Causal LM（小语言模型做判断）
- Semantic Routing（embedding cosine 匹配，无需训练）
- 自验证（模型评估自己的回答）
- LLM-as-Judge（另一个 LLM 评估）
- Bandit/RL（在线学习）
- 规则/基础设施级（负载均衡、fallback）

---

## 文章详细设计

### 第1篇 `model-routing-landscape` — Model Routing 全景：为什么一个模型不够

**难度**: advanced
**目标读者**: 对 LLM 系统架构感兴趣的学习者
**读完收获**: 对所有路由方法建立完整 mental model，理解各方法的适用场景和 tradeoff

**组件（7 个）**：

| 组件名 | 类型 | 交互方式 |
|--------|------|----------|
| `CostQualityTriangle` | SVG 三角图 | 拖动滑块调整"成本预算"，看可选模型区域变化 |
| `RoutingTaxonomyTree` | 交互树状图 | 展开/折叠各分支，点击叶节点看方法摘要 |
| `RoutingGranularityCompare` | 三列对比 | Query-level / Subtask-level / Token-level 动画演示 |
| `AccuracyCostScatter` | Scatter plot | 各方法在精度 vs 成本平面位置，hover 看详情 |
| `LatencyOverheadBar` | 条形图 | 各路由方法引入的额外延迟对比 |
| `ScenarioFitMatrix` | 热力图 | 方法 × 场景适用度矩阵，点击格子看解释 |
| `PaperTimeline` | 时间轴 | 2023-2026 关键论文/系统，可点击展开摘要 |

**内容骨架**：

**简介**：LLM 能力差异巨大（GPT-4 vs Llama-3-8B），价格差 100 倍，但 80% 的 query 不需要最强模型。Model Routing 的核心命题：用最小成本获得足够好的回答。

**§1 为什么需要路由**
- 一个模型无法覆盖所有需求：能力、成本、延迟、隐私
- 真实数据：简单 query 用 GPT-4 是巨大浪费
- `CostQualityTriangle` — 交互探索成本-质量-延迟三角

**§2 路由方法分类框架**
- 按路由粒度：Query-level / Subtask-level / Token-level
- 按决策时机：静态（部署前确定规则）/ 动态（运行时学习）
- 按模型使用方式：选一个（routing）/ 先试后验（cascade）/ 全用（ensemble）
- `RoutingTaxonomyTree` — 完整分类树
- `RoutingGranularityCompare` — 三种粒度动画对比

**§3 各方法核心原理**（每种方法 1-2 段 + 关键直觉）
- 分类器路由：用 preference data 训练 router，query → score → 选模型
- 级联与自验证：cheap model 先生成 → 验证置信度 → 不确定则升级
- Hybrid LLM：本地优先，能力不足才上云端。**能力匹配是第一驱动因素**，**延迟不是简单的本地更快**
- 在线学习：bandit/RL 在运行中持续优化路由策略
- 多模型协作：不选一个，让多个模型协作出更好的答案

**§4 多维度对比**
- `AccuracyCostScatter` — 精度 vs 成本散点图
- `LatencyOverheadBar` — 路由方法自身延迟开销
- `ScenarioFitMatrix` — 方法 × 场景热力图（高吞吐/低延迟/隐私敏感/离线/成本受限）

**§5 论文与系统全景**
- `PaperTimeline` — 2023 FrugalGPT → 2024 RouteLLM → 2025 AutoMix@NeurIPS → 2026 各方向爆发
- 实际系统：RouteLLM（开源框架）、OpenRouter（商业聚合）、LiteLLM（基础设施路由）、Martian（商业路由器）

**参考文献**：RouteLLM paper, FrugalGPT paper, AutoMix paper, LLM routing survey

---

### 第2篇 `routing-classifiers` — 路由分类器：让小模型决定谁来回答

**难度**: advanced
**前置**: model-routing-landscape
**目标**: 理解四种主流分类器路由的原理、训练方法、决策边界差异

**组件（5 个）**：

| 组件名 | 类型 | 交互方式 |
|--------|------|----------|
| `MatrixFactorizationViz` | 矩阵动画 | 偏好矩阵分解过程，拖动 query 看评分变化 |
| `BertRouterFlow` | 流程图 | query → tokenize → BERT → strong/weak 判定 |
| `CausalLMRouter` | 对比流程 | 小 LM 做分类 vs 做生成的区别，step-by-step |
| `SemanticRoutingViz` | 2D embedding 空间 | query 点 + route 模板区域，cosine 相似度可视化 |
| `DecisionBoundaryCompare` | 并排对比 | 4 种 router 在同一组 query 上的决策边界差异 |

**内容骨架**：

**简介**：最直觉的路由方式——训练一个分类器判断"这个 query 需要强模型吗？"。关键挑战：用什么数据训练、怎么表示 query、决策边界在哪。

**§1 偏好数据与 Matrix Factorization**
- Chatbot Arena 人类偏好数据：query × model → win/lose
- MF 将 query 和 model 映射到同一向量空间，内积预测偏好
- RouteLLM 的 MF router 实现：85% 成本降低，95% GPT-4 性能
- `MatrixFactorizationViz` — 矩阵分解过程动画

**§2 BERT Router**
- 微调 BERT 做二分类（strong/weak）
- 训练数据构造：用强弱模型回答同一 query，标注哪个更好
- `BertRouterFlow` — 从 query 到判定的完整流程

**§3 Causal LM Router**
- 用小语言模型（Qwen-2.5-3B 等）做路由判断
- Small Models as Routers：78.3% 路由准确率，zero-marginal-cost
- 优势：语义理解能力强于 BERT，可本地部署
- `CausalLMRouter` — 分类 vs 生成对比

**§4 Semantic Routing**
- 无需训练：预定义 route 模板 + embedding 匹配
- cosine 相似度阈值决策，最快的路由方式
- semantic-router 库：支持 Cohere/OpenAI/HuggingFace encoders
- `SemanticRoutingViz` — 2D embedding 空间

**§5 决策边界对比**
- 同一组 query，四种 router 的判断差异
- 精度/速度/训练成本/部署复杂度 tradeoff
- `DecisionBoundaryCompare` — 并排可视化

**参考文献**：RouteLLM paper, Small Models as Routers paper, semantic-router docs

---

### 第3篇 `cascade-self-verification` — 级联与自验证：先试便宜的，不行再升级

**难度**: advanced
**前置**: model-routing-landscape
**目标**: 理解级联/自验证路由的原理、POMDP 框架、置信度阈值 tradeoff

**组件（5 个）**：

| 组件名 | 类型 | 交互方式 |
|--------|------|----------|
| `CascadeChainFlow` | 级联链动画 | query 从 Model1 → Model2 → Model3，每步看判定逻辑 |
| `SelfVerificationDemo` | Step navigator | AutoMix 自验证过程：生成 → 自评 → 决定升级？ |
| `ConfidenceThresholdSlider` | 滑块交互 | 调整阈值，看成本和质量 tradeoff 曲线实时变化 |
| `POMDPDecisionTree` | 决策树 | AutoMix POMDP 状态转移：观察 → 信念 → 动作 |
| `LLMAsJudgeFlow` | 流程对比 | 自验证 vs LLM-as-Judge vs 人工评估对比 |

**内容骨架**：

**简介**：不预先判断 query 难度，而是"先试再说"——用便宜模型生成，检查质量，不够好就升级。

**§1 FrugalGPT 级联链**
- 模型按成本排序：Model1 → Model2 → Model3
- 每步用 scoring function 判断是否"足够好"
- 98% 成本降低或同成本下更高准确率
- `CascadeChainFlow` — 级联链动画

**§2 AutoMix 自验证**
- Few-shot self-verification：让模型评估自己的回答
- POMDP 框架：观察（自评分数）→ 信念更新 → 动作（接受/升级）
- NeurIPS 2024，五个数据集上 50%+ 成本降低
- `SelfVerificationDemo` — step-by-step 过程
- `POMDPDecisionTree` — 状态转移可视化

**§3 置信度阈值的 tradeoff**
- 阈值太低 → 啥都升级 → 成本高
- 阈值太高 → 不该接受的也接受了 → 质量差
- 最优阈值取决于任务分布和成本约束
- `ConfidenceThresholdSlider` — 实时 tradeoff 曲线

**§4 LLM-as-Judge**
- 用另一个 LLM 评估回答质量
- 比自验证更可靠，但引入额外成本
- Confidence-Driven Router：LLM-as-Judge + 不确定性估计
- `LLMAsJudgeFlow` — 三种评估方式对比

**参考文献**：FrugalGPT paper, AutoMix paper, Confidence-Driven Router paper

---

### 第4篇 `hybrid-local-cloud` — Hybrid LLM：本地与云端的智能路由

**难度**: advanced
**前置**: model-routing-landscape, routing-classifiers, cascade-self-verification
**目标**: 理解 local/cloud 路由的独有挑战，掌握能力匹配优先原则和延迟 tradeoff 的复杂性

**组件（6 个）**：

| 组件名 | 类型 | 交互方式 |
|--------|------|----------|
| `CapabilityMatchDiagram` | 核心图 | query 复杂度 vs 模型能力，超出边界才升级 |
| `LatencyTradeoffAnalysis` | 多因素交互 | 滑块调整 query 复杂度/本地硬件/网络/云端负载，实时对比总延迟 |
| `PrivacyRoutingFlow` | 流程图 | PRISM 实体级敏感度检测 → 路由决策 → 差分隐私 |
| `RouterFreeRL` | 动画 | 本地模型自学"我搞不定"：RL reward → 策略更新 → 升级决策 |
| `HybridArchCompare` | 并排对比 | ConsRoute / HybridFlow / Apple Intelligence 架构对比 |
| `MultiObjectiveRadar` | 雷达图 | 成本/延迟/隐私/质量/离线五维对比，可切换方案 |

**内容骨架**：

**简介**：路由算法的一个关键应用场景——自动判断走本地小模型还是云端大模型。这不只是成本问题，还涉及隐私、离线可用、以及一个常被误解的延迟 tradeoff。本篇将前面学到的路由算法应用到这个具体场景，并探讨其独有的挑战。

**§1 能力匹配是第一驱动因素**
- 核心问题：本地模型能不能胜任这个 task？
- 其他因素（成本、隐私、延迟）只在能力满足时才是附加偏好
- 如果本地模型搞不定，再便宜再隐私也没用
- `CapabilityMatchDiagram` — query 复杂度 vs 模型能力边界

**§2 延迟 tradeoff 的复杂性**
- **打破误区**：本地 ≠ 低延迟
- 本地优势：零网络延迟
- 本地劣势：消费级 CPU/iGPU/NPU 计算慢，prefill 慢
- 云端优势：A100/H100 强算力，大模型也能快速推理
- 云端劣势：网络往返，可能排队
- 总延迟取决于：query 复杂度（生成长度）、本地硬件能力、网络状况、云端负载
- 简单 query 本地可能更快，复杂 query 大概率云端更快
- `LatencyTradeoffAnalysis` — 多因素滑块实时对比

**§3 隐私与离线**
- 隐私敏感数据不出设备（医疗、金融、个人对话）
- PRISM (AAAI 2026)：实体级敏感度检测 + 自适应差分隐私
- 离线场景：断网时本地模型是唯一选择
- `PrivacyRoutingFlow` — 敏感度检测 → 路由决策流程

**§4 路由算法在 local/cloud 的复用**
- 分类器路由（第2篇）→ 判断 local vs cloud
- 自验证/级联（第3篇）→ 本地先生成，不确定就升级
- Router-free RL → 本地模型通过 RL 自己学会"我搞不定"，无需外部 router
- `RouterFreeRL` — RL 训练过程动画

**§5 系统架构对比**
- ConsRoute (2026)：reranker 评估语义一致性，40% 延迟+成本降低
- HybridFlow (2025)：subtask-level DAG 路由，按子任务独立决策
- Apple Intelligence (2024)：on-device 默认 + Private Cloud Compute，产品化标杆
- Token-level Hybrid (2024)：逐 token 置信度，最细粒度
- `HybridArchCompare` — 三种架构并排对比
- `MultiObjectiveRadar` — 五维雷达图

**参考文献**：ConsRoute paper, HybridFlow paper, PRISM paper, Router-free RL paper, Apple Intelligence docs

---

### 第5篇 `online-learning-cost-optimization` — 在线学习与成本优化：路由也需要持续进化

**难度**: advanced
**前置**: model-routing-landscape
**目标**: 理解动态路由方法——bandit/RL 如何在运行中持续优化路由策略

**组件（5 个）**：

| 组件名 | 类型 | 交互方式 |
|--------|------|----------|
| `BanditExploration` | 动画模拟 | Explore vs Exploit：bandit 实时选择模型并更新估计 |
| `RLRewardSignalViz` | 循环图动画 | RL routing 的 state(query) → action(选模型) → reward(质量-成本) 循环 |
| `ParetoFrontierViz` | 散点+前沿线 | 成本 vs 质量 Pareto 前沿，添加/移除模型看变化 |
| `DynamicPriceAdaptation` | 时间序列 | 模拟价格波动，看路由策略动态调整 |
| `BatchVsQueryRouting` | 对比动画 | 逐 query vs batch-level 路由差异和性能对比 |

**内容骨架**：

**简介**：前面的方法在部署后规则固定。但模型在更新、价格在变、用户分布在漂移——路由策略需要持续进化。

**§1 Multi-armed Bandit**
- 经典 explore-exploit：每个模型是一个 arm
- Contextual bandit：用 query 特征作为 context
- ParetoBandit (2026)：cost-aware contextual bandit，多目标平衡
- `BanditExploration` — 动画模拟选择过程

**§2 RL Routing**
- Agent Q-Mix (2026)：RL 优化多 agent 拓扑选择
- 状态=query 特征，动作=选模型，reward=质量-成本
- Reward-Based Online Routing：NeuralUCB 平衡效率和适应性
- `RLRewardSignalViz` — state-action-reward 循环动画

**§3 Pareto 前沿与成本约束**
- 多目标优化：质量和成本不可兼得，找最优前沿
- 添加新模型如何改变 Pareto 前沿
- `ParetoFrontierViz` — 交互操作模型组合
- `DynamicPriceAdaptation` — 价格波动下的策略适应

**§4 Batch-level vs Query-level**
- Robust Batch-Level Routing (2026)：批量优化在对抗条件下优于逐条 24%
- GPU/并发约束下的全局优化
- `BatchVsQueryRouting` — 两种策略对比

**参考文献**：ParetoBandit paper, Agent Q-Mix paper, Robust Batch-Level Routing paper

---

### 第6篇 `mixture-of-agents` — 多模型协作：从选一个到用多个

**难度**: advanced
**前置**: model-routing-landscape
**目标**: 理解 MoA 的哲学转变——从"选最好的一个"到"综合多个的智慧"

**组件（5 个）**：

| 组件名 | 类型 | 交互方式 |
|--------|------|----------|
| `SelectVsSynthesize` | 二选一对比 | "选一个" vs "综合多个" 哲学差异动画 |
| `CouncilModeFlow` | 并行流程图 | query → 多 LLM 并行 → 综合层 → 输出，可切换组合 |
| `MoAHierarchy` | 层级架构图 | HieraMAS / Pyramid MoA 多层结构，可展开 |
| `EnsembleVotingViz` | 投票动画 | Majority / Weighted / Best-of-N 投票过程 |
| `CostScalingChart` | 折线图 | 模型数量 vs 成本 vs 质量提升，展示收益递减 |

**内容骨架**：

**简介**：前面都是"选一个最好的"。Mixture of Agents 的哲学不同——与其选，不如都用，综合出更好的结果。注意区分：MoE (Mixture of Experts) 是单个模型内部的专家路由机制（见 transformer-core 路径的 mixture-of-experts 文章），而 MoA (Mixture of Agents) 是多个完整 LLM 模型之间的协作——粒度完全不同。

**§1 选择 vs 综合**
- Routing 的假设：存在一个"最佳模型"
- MoA 的假设：没有单一最佳，组合才最好
- `SelectVsSynthesize` — 两种哲学对比

**§2 Council Mode**
- 并行调用多个 frontier LLM，综合层合并
- Council Mode (2026)：35.9% hallucination 降低
- `CouncilModeFlow` — 并行 → 综合流程

**§3 层级 MoA**
- HieraMAS (2026)：节点内 LLM 混合 + 节点间通信
- Pyramid MoA (2026)：层级结构 + decision-theoretic router
- `MoAHierarchy` — 多层架构可视化

**§4 Ensemble 与投票**
- Majority vote：多数决
- Weighted vote：按模型能力加权
- Best-of-N：生成 N 个回答选最好的
- `EnsembleVotingViz` — 投票过程动画

**§5 成本与收益递减**
- 用 2 个模型 vs 5 个 vs 10 个：质量提升递减，成本线性增长
- 何时 MoA 值得、何时不值得
- `CostScalingChart` — 收益递减曲线

**参考文献**：Council Mode paper, HieraMAS paper, Pyramid MoA paper

---

## 组件汇总

| 文章 | 组件数 | 组件列表 |
|------|--------|----------|
| 1. model-routing-landscape | 7 | CostQualityTriangle, RoutingTaxonomyTree, RoutingGranularityCompare, AccuracyCostScatter, LatencyOverheadBar, ScenarioFitMatrix, PaperTimeline |
| 2. routing-classifiers | 5 | MatrixFactorizationViz, BertRouterFlow, CausalLMRouter, SemanticRoutingViz, DecisionBoundaryCompare |
| 3. cascade-self-verification | 5 | CascadeChainFlow, SelfVerificationDemo, ConfidenceThresholdSlider, POMDPDecisionTree, LLMAsJudgeFlow |
| 4. hybrid-local-cloud | 6 | CapabilityMatchDiagram, LatencyTradeoffAnalysis, PrivacyRoutingFlow, RouterFreeRL, HybridArchCompare, MultiObjectiveRadar |
| 5. online-learning-cost-optimization | 5 | BanditExploration, RLRewardSignalViz, ParetoFrontierViz, DynamicPriceAdaptation, BatchVsQueryRouting |
| 6. mixture-of-agents | 5 | SelectVsSynthesize, CouncilModeFlow, MoAHierarchy, EnsembleVotingViz, CostScalingChart |
| **合计** | **33** | |

---

## 技术约定

- 所有组件放 `src/components/interactive/`，使用 `COLORS`/`FONTS` 共享设计 token
- SVG 组件使用 `viewBox` + `className="w-full"` 响应式模式
- 需要多步骤的组件使用 `StepNavigator` primitive
- MDX 中 import 组件后加 `client:visible` hydration 指令
- 文章放 `src/content/articles/zh/`
- 路径 YAML 放 `src/content/paths/model-routing.yaml`
