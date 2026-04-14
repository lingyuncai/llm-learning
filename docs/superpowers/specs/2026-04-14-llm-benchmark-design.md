# LLM 评估与 Benchmark 深度解析 — 设计文档

**日期**: 2026-04-14
**路径 ID**: `llm-evaluation-benchmarks`
**路径标题**: LLM 评估与 Benchmark 深度解析
**难度**: intermediate
**前置要求**: 无
**出口衔接**: 最后一篇 (`leaderboard-model-selection`) 自然过渡到 `model-routing` 路径
**文章数**: 7
**交互组件数**: ~13
**事实性要求**: 所有 benchmark 数据、数字、流程描述必须基于官方文档/论文，执行阶段需网络搜索验证

---

## 总览

### 目标

为读者建立系统化的 LLM 评估知识体系：从理解 benchmark 的设计原理，到具体 benchmark 的深入剖析，到量化优化后的精度评估方法，最终落地到模型选型决策。内容服务于两类需求：

1. **方法论理解**: benchmark 是怎么设计的、测的到底是什么、有什么局限
2. **实践决策**: 如何利用 benchmark 信息做模型选择、评估优化方案的精度代价

### 设计原则

- **问题驱动**: 每篇文章以一个实际问题开头，围绕问题展开
- **浅层全景 + 深层深潜**: 每篇先覆盖该类别的 benchmark 全景，再挑 1-2 个广泛采用的 benchmark 详细讲解（评估框架设计、测试流程、评分方式、已知局限）
- **深潜选择有交代**: 每次深潜前明确说明"为什么选这个"（被引用频率、各家采用率、社区影响力）
- **严格事实**: 所有具体数字标注 [待验证]，执行阶段通过网络搜索确认
- **与现有路径衔接**: 量化原理→quantization 路径；推理框架→intel-igpu-inference 路径；模型选型→model-routing 路径

### 文章顺序与依赖

```
benchmark-landscape           (1) 全景与评估方法论 [入口，无前置]
├── reasoning-benchmarks      (2) 知识与推理 Benchmark [前置: 1]
├── code-benchmarks           (3) 代码 Benchmark [前置: 1]
├── agent-benchmarks          (4) Agent 与 Tool Use Benchmark [前置: 1]
├── benchmark-standard-set    (5) 模型发布 Benchmark 标配解析 [前置: 1, 建议读完 2-4]
├── optimization-accuracy     (6) 优化对精度的影响 [前置: 1]
└── leaderboard-model-selection (7) 排行榜解读与模型选型 [前置: 1, 建议读完 2-6]
                                    └──→ 衔接 model-routing 路径
```

Art.2-4 平行，可按兴趣任意顺序阅读。Art.5 建议在 2-4 之后（需要了解具体 benchmark 才能理解"标配集"的意义）。Art.7 作为收敛篇建议最后阅读。

---

## Art.1 `benchmark-landscape` — Benchmark 全景与评估方法论

**问题驱动**: "面对几十个 benchmark 和各种评分，我该从哪里开始理解？"

### 全景部分

**Benchmark 分类体系**:
- 按能力维度: 知识 / 推理 / 代码 / Agent 与 Tool Use / 对话与偏好
- 按评估方式: 自动评估（exact match、执行验证）/ 人类评估 / LLM-as-Judge
- 按更新策略: 静态（MMLU）/ 动态（LiveBench、LiveCodeBench）

**评估协议详解**:
- Zero-shot vs few-shot: 含义、对分数的影响、为什么 few-shot 设置不统一导致分数不可比
- Chain-of-Thought (CoT): 让模型展示推理过程再给答案，对推理类 benchmark 提升显著
- pass@k: 生成 k 个候选取最优，用于代码评估，pass@1 vs pass@10 代表不同能力维度
- Majority voting / self-consistency: 多次采样取多数答案

**核心度量指标**:
- Accuracy: 最直接，适用于有标准答案的 benchmark
- Perplexity: 语言模型的内在指标，与 task accuracy 不完全线性相关
- ELO rating: 从成对比较中计算全局排名（Chatbot Arena）
- pass@k: 代码评估专用
- F1 / ROUGE: 生成式任务的部分匹配

**LLM-as-Judge（专门小节）**:
- 什么是 LLM-as-Judge: 用强模型（如 GPT-4）作为评估器，判断其他模型输出的质量
- 应用: MT-Bench（多轮对话评分）、AlpacaEval 2.0（胜率评估）、WildBench
- 与人类评估的一致性: 在多数场景下相关性 > 0.8 [待验证]
- 已知偏差: 偏好长回答（verbosity bias）、自我偏好（GPT-4 倾向给 GPT-4 输出更高分）、位置偏差（倾向选择第一个回答）
- 成本优势: 比人类评估便宜约 100x，适合大规模评估 [待验证]

**数据污染（Contamination）专门小节**:
- 什么是 contamination: benchmark 数据泄露到训练集，导致分数虚高
- 如何发生: 大规模网络爬取不可避免地包含公开 benchmark 数据
- 检测方法: n-gram overlap 检测、rephrasing test（换个说法模型就不会了）、canary string
- 动态 benchmark 的应对: LiveBench（每月更新）、LiveCodeBench（持续引入新竞赛题）确保数据不在任何训练集中
- 对读者的实际意义: 为什么静态 benchmark 的高分越来越不可信

### 深潜: lm-evaluation-harness

**选择理由**: EleutherAI 维护的开源评估框架，Open LLM Leaderboard 的底层引擎。几乎所有开源模型的评估数据都经过它产生。理解这个工具就理解了大多数公开评估分数的生产方式。

**框架架构**:
- Task 定义: YAML 配置文件描述 benchmark（数据集来源、prompt 模板、评分方式）
- 评估模式: loglikelihood（计算选项的对数概率，用于多选题）、generate_until（生成式，用于开放回答/代码）
- 模型后端: 支持 HuggingFace Transformers、vLLM、GGUF (llama.cpp)、OpenAI API 等
- 结果输出: 按 task 的分数 breakdown、标准误差、配置信息

**评估流程**:
- 选择模型 + 推理后端 → 选择 task（可组合多个 benchmark）→ 配置参数（few-shot 数、batch_size）→ 运行 → 结果 JSON 分析

**已知局限与陷阱**:
- Prompt 模板敏感性: 同一个 benchmark，换个 prompt 模板分数可差 5-10%
- 版本间不一致: 不同版本的 lm-eval-harness 对同一 benchmark 的实现可能有差异
- batch_size 对生成式 task 的影响
- 与闭源模型评估结果不可直接对比（闭源模型通常自行实现评估）

### 交互组件

1. **BenchmarkTaxonomy**: 分类浏览器。按能力维度 / 评估方式 / 难度三个维度筛选。每个 benchmark 显示为卡片（名称、出处年份、数据量、评估方式、当前 SOTA 分数范围 [待验证]）。点击展开详情。
2. **EvalProtocolFlow**: 评估协议流程动画。用 tab 切换 few-shot / CoT / pass@k / LLM-as-Judge 四种模式，动画展示每种协议从 prompt 构建到评分的完整过程。

---

## Art.2 `reasoning-benchmarks` — 知识与推理 Benchmark

**问题驱动**: "模型说自己推理能力强，到底是怎么测出来的？"

### 全景部分

**知识类 Benchmark**:
- MMLU (2021): 57 学科、4 选 1、长期作为通用知识基准。现已接近饱和（frontier 模型 > 90%）[待验证]
- MMLU-Pro: MMLU 升级版，10 选项降低猜测概率，题目更难
- ARC-Easy / ARC-Challenge: 小学科学题，Challenge 子集需要多步推理

**推理类 Benchmark**:
- GSM8K (2021): 8500 道小学数学应用题。已饱和，frontier 模型 > 95% [待验证]
- MATH / MATH-500: 竞赛级数学，难度远超 GSM8K，MATH-500 是常用子集
- AIME 2024/2025: 美国数学邀请赛真题，frontier 模型的数学推理试金石
- GPQA Diamond: 研究生级科学问答，当前区分度最高
- FrontierMath (Epoch AI): 极高难度数学问题，当前没有模型超过 30% [待验证]

**趋势**: benchmark 饱和是核心问题。GSM8K/HellaSwag 等早期 benchmark 失去区分力 → GPQA、AIME、FrontierMath 等更难的 benchmark 兴起。这本身反映了模型能力的快速进步。

### 深潜 1: MMLU-Pro

**选择理由**: MMLU 的直系继承者，几乎所有模型发布（无论 frontier 还是小模型）都报 MMLU-Pro 分数。它是当前覆盖最广泛的通用知识基准，从 MMLU 的 4 选项升级到 10 选项，显著降低了猜测概率（随机猜测从 25% 降到 10%），提升了区分度。

**数据集构成**:
- 来源: 从原始 MMLU 筛选 + 新增更难的题目
- 学科覆盖: STEM、人文、社科等，保持 MMLU 的广覆盖
- 题目数量: [待验证]
- 选项数: 10（vs MMLU 的 4）

**评估协议**:
- 标准: 5-shot CoT（Chain-of-Thought 对 MMLU-Pro 提升显著，因为题目更需要推理）
- CoT vs direct: CoT 通常提升 10-15% [待验证]
- 与 MMLU 分数的对应关系: MMLU-Pro 分数通常比 MMLU 低 15-25 个百分点 [待验证]

### 深潜 2: GPQA Diamond

**选择理由**: 当前区分 frontier 模型的首选 benchmark。领域专家（PhD 级别）在该 benchmark 上的准确率约 65% [待验证]，说明题目本身就需要深度专业知识。被 Claude、GPT、Gemini 等所有 frontier 模型的技术报告必引。

**数据集构成**:
- 来源: 由各领域 PhD 研究者手写，经过严格的"对抗验证"——确保非专业人士即使搜索互联网也难以回答
- 学科: 物理、化学、生物
- 子集: GPQA 全集 vs GPQA Diamond（最高质量子集，约 198 题 [待验证]）
- 选项: 4 选 1

**为什么难**:
- 需要深度领域专业知识（研究生以上）
- 需要多步推理（不是单纯知识检索）
- 对抗验证确保不能通过简单搜索解答

**评估方式**:
- 0-shot 或 few-shot，有无 CoT 均可
- 报告 Diamond 子集分数是主流

### 交互组件

1. **ReasoningBenchmarkMap**: 推理 benchmark 难度-饱和度散点图。X 轴=发布年份，Y 轴=当前最高模型分数（越高=越饱和），气泡大小=被各家模型报告采用的频率。展示 benchmark 从"有区分力"到"饱和"的生命周期。hover 显示 benchmark 详情。
2. **MMLUProEvalDemo**: MMLU-Pro 10 选项 + CoT 评估流程可视化。展示一道示例题目，对比 direct answer（直接选）vs CoT（先推理再选）的过程和准确率差异。

---

## Art.3 `code-benchmarks` — 代码 Benchmark

**问题驱动**: "模型说自己能写代码，从函数补全到修 GitHub issue，这些能力怎么评估？"

### 全景部分

**演进脉络**:
- HumanEval (2021, OpenAI): 开山之作，164 个 Python 函数补全，定义了 pass@k 范式
- MBPP (2021, Google): 974 个 Python 入门题，覆盖更广但难度类似
- HumanEval+ / MBPP+ (EvalPlus): 大幅增加测试用例，暴露原始 benchmark 的假阳性
- SWE-bench (2024, Princeton): 真实 GitHub issue 修复，代码评估的范式跳跃
- LiveCodeBench (2024): 持续从竞赛平台引入新题，抗 contamination
- BigCodeBench: 复杂库调用和真实 API 使用场景

**评估方式的分化**:
- 匹配式（BLEU / exact match）: 早期方法，已基本淘汰（生成正确但写法不同的代码会被判错）
- 执行验证: 跑测试用例判对错，是当前主流
- pass@k 的含义与计算: 生成 k 个候选，至少一个通过。pass@1 衡量"一次生成对"的能力，pass@10 衡量"在多次尝试中至少一次对"的能力

**多语言覆盖**:
- MultiPL-E: 将 HumanEval/MBPP 翻译到 18+ 语言
- Aider Polyglot: 多语言编码助手能力
- 大多数 benchmark 仍以 Python 为主

### 深潜 1: HumanEval

**选择理由**: 代码评估的开山之作（OpenAI, 2021），定义了 pass@k 评估范式。至今仍是所有模型（包括小模型）的基线必报项。虽然已接近饱和，但其评估框架被后续几乎所有代码 benchmark 继承。理解 HumanEval 就理解了代码评估的基本范式。

**数据集构成**:
- 164 个手写 Python 编程问题
- 每个问题包含: 函数签名 + docstring（描述功能和示例）+ 隐藏测试用例
- 难度: 入门到中等（对标 LeetCode Easy-Medium）

**评估流程**:
- 模型输入: 函数签名 + docstring
- 模型输出: 完成的函数体
- 验证: 在沙箱中执行隐藏测试用例 → pass/fail
- 评分: pass@k（通常报 pass@1）

**已知局限**:
- 题目少（164 道），统计置信区间大
- 只有 Python
- 难度偏低: 当前 frontier 模型 pass@1 > 90% [待验证]，失去区分力
- Contamination 风险高（数据集公开）
- 测试用例不够充分: 某些"通过"的代码在边界条件下其实是错的

**HumanEval+ 的改进**:
- EvalPlus 项目为每道题增加了约 80x 的测试用例 [待验证]
- 暴露出大量原始 HumanEval 的假阳性（原来 pass 的代码在更多测试下 fail）
- HumanEval+ 分数通常比 HumanEval 低 10-15 个百分点 [待验证]

### 深潜 2: SWE-bench

**选择理由**: 当前代码能力的金标准。首次将评估从"写一个函数"提升到"解决真实软件工程问题"——需要理解整个代码库、定位 bug、生成正确 patch。被所有 frontier 模型和 coding agent（SWE-agent、OpenDevin、Aider 等）必报。同时也是衡量 agent 能力的关键 benchmark（交叉引用 Art.4）。

**数据集构成**:
- 来源: 12 个知名 Python 开源项目（Django、Flask、scikit-learn、sympy 等）的真实 GitHub issue + 对应人类 PR [待验证具体项目列表]
- 数据量: 全集 2000+ 题 [待验证]
- 子集:
  - SWE-bench Lite: 约 300 题，筛除歧义和过于简单的 [待验证]
  - SWE-bench Verified: 人工验证的高质量子集，当前最权威的报告标准 [待验证数量]

**评估流程**:
- 输入: issue 描述 + 完整代码仓库
- 模型/Agent: 需要自主定位相关文件 → 理解上下文 → 生成 patch（git diff 格式）
- 验证: 在项目原有测试套件上运行，patch 应用后所有相关测试通过 = 成功
- 评分: resolved rate（成功解决的 issue 占总数的百分比）

**Agent 框架的角色**:
- SWE-bench 分数不仅取决于模型能力，还取决于 agent harness（搜索策略、上下文管理、编辑工具）
- SWE-agent、OpenDevin、Aider 等不同 harness 会产生不同分数
- 因此报告 SWE-bench 分数时必须注明使用的 agent 框架

**已知争议**:
- 不同 harness 导致分数不可比
- 上下文窗口大小对分数影响显著（能看到更多代码 = 更容易定位问题）
- 仅限 Python 项目
- 某些 issue 可以通过模式匹配而非真正理解来解决

### 交互组件

1. **CodeBenchmarkEvolution**: 代码 benchmark 演进时间线（2021→2025）。每个节点: benchmark 名称 + 评估方式 + 当前 SOTA [待验证] + 关键创新。连线展示继承关系（HumanEval → HumanEval+ → SWE-bench 等）。点击展开详情。
2. **SWEbenchFlow**: SWE-bench 评估全流程动画。5 步: issue 描述输入 → agent 搜索定位 → 代码上下文理解 → patch 生成 → 测试验证。每步可暂停查看详情。

---

## Art.4 `agent-benchmarks` — Agent 与 Tool Use Benchmark

**问题驱动**: "模型能调 API、操作浏览器、完成多步骤任务——这些能力怎么系统化评估？"

### 全景部分

**Agent 能力的层级**:
- Level 1 — 单次 function calling: 给定函数定义，正确生成调用（参数类型、值）
- Level 2 — 多轮 tool use: 在对话中多次调用工具，理解工具返回结果
- Level 3 — 自主规划+执行+纠错: 面对开放任务，自主规划步骤、选择工具、处理失败

**评估维度**:
- 调用准确率: 函数名、参数是否正确（AST 匹配或执行验证）
- 任务完成率: 端到端是否达成目标
- 效率: 步骤数、token 消耗、时间
- 鲁棒性: 面对工具返回错误时的恢复能力

**主要 Benchmark 一览**:

Function Calling 类:
- BFCL (Berkeley Function Calling Leaderboard): function calling 评估的事实标准
- Gorilla API Bench: 大规模 API 调用评估
- API-Bank: 工具使用的多轮对话评估

Web Agent 类:
- WebArena: 在真实网站（购物、论坛、代码仓库）上完成任务
- VisualWebArena: 加入视觉理解的 web agent
- BrowserGym: 统一的浏览器 agent 评估框架

通用 Agent 类:
- GAIA (Meta/HuggingFace): 通用 AI 助手多步骤任务
- τ-bench: tool-augmented 任务 benchmark
- AgentBench: 跨环境 agent 能力评估
- SWE-bench: 代码 agent 能力（交叉引用 Art.3）

**趋势**: 从"能不能调对一个 API"快速演进到"能不能自主完成复杂多步骤任务"。Agent benchmark 是当前增长最快的评估品类，各家最新模型发布开始标配报告 agent 能力。

### 深潜 1: BFCL (Berkeley Function Calling Leaderboard)

**选择理由**: Function calling 评估的事实标准，由 UC Berkeley Gorilla 团队持续维护。覆盖了从简单单函数到复杂多步调用的完整谱系。各家模型（包括 Gemma、Qwen 等小模型）都在此排名，是衡量"模型能不能正确调用工具"的首选 benchmark。

**评估框架**:
- 输入: 一组函数定义（JSON schema 格式）+ 用户自然语言指令
- 输出: 模型生成的函数调用（函数名 + 参数）
- 验证: 与 ground truth 对比（AST 匹配 + 可执行验证两种模式）

**测试类别**:
- Simple: 单个函数调用，参数填充
- Multiple: 从多个候选函数中选择正确的
- Parallel: 需要同时调用多个函数
- Nested: 函数调用的嵌套（一个函数的输出作为另一个的输入）[待验证此类别是否存在]
- Relevance Detection: 判断当前指令是否需要调用函数（避免过度调用）

**评分方式**:
- AST 匹配: 比较生成的调用与 ground truth 的抽象语法树
- 可执行验证: 实际执行函数调用，检查结果是否正确
- 分类报告: 按类别（simple/multiple/parallel 等）分别报分

**已知局限**:
- 以合成数据为主，真实场景的复杂度不足
- 函数定义的格式（JSON schema）与实际 API 文档有差距
- 不测试多轮工具使用中的状态管理

### 深潜 2: GAIA

**选择理由**: 由 Meta 和 HuggingFace 联合发起，专门测试"通用 AI 助手"在多步骤任务中的工具使用和推理能力。其设计哲学独特——"对人简单，对 AI 难"：问题本身不需要专业知识，但需要多步骤规划和工具组合（搜索、计算、文件处理等）。人类成功率约 92% 但当前最强 AI 约 75% [待验证]，差距仍然清晰。

**数据集构成**:
- 约 466 个问题 [待验证]
- 3 个难度等级:
  - Level 1: 通常 1-2 步工具使用即可解答
  - Level 2: 需要 3-5 步，涉及多种工具组合
  - Level 3: 需要复杂规划 + 长链工具使用
- 每个问题有唯一明确答案（不是开放式的）

**评估流程**:
- 模型/Agent 可以使用工具: 网页搜索、计算器、代码执行、文件读取等
- 任务类型: 查找特定信息、处理文件数据、多源信息综合推理
- 评分: exact match（答案必须精确匹配）
- 不限制使用的工具数量和步骤数

**设计哲学——为什么"对人简单、对 AI 难"**:
- 人类天然擅长规划（"先搜索 X，再计算 Y"）
- AI 在长链规划中容易累积错误
- 问题不需要专业知识，消除了知识量的干扰，纯粹测试推理和工具使用能力

### 交互组件

1. **AgentCapabilityRadar**: 雷达图对比。维度: function calling 准确率 / 多步任务成功率 / 规划能力 / 纠错能力 / 效率。可选择 2-3 个模型进行对比。数据基于各 benchmark 的公开排行榜 [待验证]。
2. **BFCLEvalFlow**: BFCL 评估流程可视化。展示完整流程: 函数定义（JSON schema）→ 用户指令 → 模型生成调用 → AST 匹配/执行验证 → 分类评分。用 tab 切换 simple / multiple / parallel 不同类别的示例。

---

## Art.5 `benchmark-standard-set` — 模型发布 Benchmark 标配解析

**问题驱动**: "每次新模型发布都贴一堆分数，为什么选这些 benchmark？不同级别的模型报的一样吗？"

**注意**: 本篇是横向对比分析，无单独深潜。深度体现在对各家模型发布报告的交叉分析上。

### 内容结构

**标配集的演进（基于公开技术报告/blog）**:
- 2023 时代: MMLU + HumanEval + GSM8K + HellaSwag（"四大件"）
- 2024 时代: + GPQA + MATH + SWE-bench + Chatbot Arena（推理+代码升级）
- 2025 时代: + AIME + Agent benchmarks + LiveBench（agent 化 + 抗污染）
- 每个阶段的演进驱动力: benchmark 饱和 → 需要更难的替代 → 新能力维度兴起

**Frontier 模型对比（基于各家公开技术报告）**:
- Claude 系列: 报告哪些 benchmark、侧重什么 [执行时需查阅最新技术报告]
- GPT 系列 (OpenAI): 报告哪些 benchmark、侧重什么 [执行时需查阅]
- Gemini 系列 (Google): 报告哪些 benchmark、侧重什么 [执行时需查阅]
- Llama 系列 (Meta): 报告哪些 benchmark、侧重什么 [执行时需查阅]
- 共同必报的 benchmark: 找出交集（大概率是 MMLU-Pro、GPQA、MATH/AIME、HumanEval/SWE-bench、Chatbot Arena）
- "不报什么"的分析: 故意省略的 benchmark 往往暗示弱项

**小模型的评估体系（重点展开）**:

与 frontier 模型的核心差异:
- 同参数量级对比而非绝对分数: "4B 级最强"而非"超越 GPT-4"
- 效率指标更重要: tokens/s、performance-per-parameter、可在消费级硬件运行
- 基础 benchmark 未饱和: MMLU、ARC、HellaSwag 对小模型仍有区分力
- Agent/高难度 benchmark 通常不报: SWE-bench、GPQA 对小模型区分度不足

各家小模型的评估策略（基于公开发布信息）:
- **Gemma 系列 (Google)**: 多语言评估、指令遵循（IFEval）、效率指标 [执行时需查阅最新 Gemma 4 发布]
- **Phi 系列 (Microsoft)**: "小而强"叙事，通常报告与更大模型的对比 [执行时需查阅]
- **Qwen 系列 (Alibaba)**: 中英双语评估体系（C-Eval、CMMLU 等中文 benchmark）[执行时需查阅]
- **Llama 小参数版 (Meta)**: 8B/3B 版本的评估与全尺寸版本的差异 [执行时需查阅]
- **Mistral 系列**: 欧洲视角的评估选择 [执行时需查阅]

**分数可比性问题**:
- 同一个 benchmark，不同报告中的分数为什么可能不可比:
  - Prompt 模板差异（few-shot 格式、系统提示词）
  - Few-shot 数量不一致（5-shot vs 0-shot）
  - 后处理方式（如何从生成文本中提取答案）
  - 评估工具版本差异
- 读者应该关注相对排序而非绝对数值

### 交互组件

1. **ModelBenchmarkMatrix**: 模型×benchmark 矩阵热力图。行=模型（分"Frontier"和"小模型"两组），列=benchmark（按能力维度分组）。颜色编码分数高低（绿=高，红=低），空白格=该模型未报告此 benchmark。可切换"按能力维度分组"或"按模型族分组"视图。hover 显示具体分数和来源链接。数据 [待验证，执行时从各家技术报告收集]。

---

## Art.6 `optimization-accuracy` — 优化对精度的影响

**问题驱动**: "量化、剪枝、KV cache 压缩号称能加速 2-4 倍，精度到底掉多少？怎么自己验证？"

### 全景部分

**优化手段与精度代价全景**:
- Weight-only 量化 (INT8/INT4/GPTQ/AWQ): 典型 degradation 模式
- Weight+Activation 量化 (W8A8, FP8): 精度保持更好但需要校准
- KV cache 量化: 对长上下文任务的特殊影响
- Pruning: 结构化 vs 非结构化，精度-稀疏度曲线
- Knowledge Distillation: 教师→学生的能力传递损失
- 注意: 量化/剪枝的算法原理参见 quantization 路径，本篇聚焦"怎么测量精度损失"

**Degradation 的不均匀性**:
- 不同 benchmark 受影响程度差异大:
  - 知识类（MMLU）: 影响相对小（权重中的知识比较鲁棒）
  - 推理类（MATH、GSM8K）: 影响中等到大（推理链对精度敏感）
  - 代码类（HumanEval）: 对量化敏感（语法精确性要求高）
- 不同模型对量化的鲁棒性差异:
  - 大模型通常比小模型更耐量化（参数冗余度更高）
  - 相同参数量下，不同架构的鲁棒性也不同
- "最后几个点"最难保: FP16→INT8 可能只掉 1%，但 INT8→INT4 可能掉 5-8% [待验证典型数值]

**与已有路径的交叉引用**:
- 量化算法原理 → `quantization` 路径
- Intel 硬件上的优化 → `intel-igpu-inference` 路径
- 本篇聚焦: **测量方法**和**精度-性能 trade-off 决策**

### 深潜 1: lm-evaluation-harness 实测工作流

**选择理由**: 开源社区和 Open LLM Leaderboard 的标准评估工具。当你需要量化前后精度对比时，lm-eval-harness 是最直接的选择——它支持几乎所有模型格式和推理后端，提供标准化的评估结果。

**量化前后对比工作流**:
- 步骤 1: 选择模型和基线后端（如 HuggingFace FP16）
- 步骤 2: 选择 benchmark 组合（建议覆盖知识+推理+代码，因为 degradation 不均匀）
- 步骤 3: 运行基线评估，记录分数
- 步骤 4: 切换到量化后端（如 GPTQ INT4、AWQ INT4），运行相同评估
- 步骤 5: 对比分析——哪些 benchmark 掉分最多？是否超过可接受阈值？

**与不同推理后端的集成**:
- HuggingFace Transformers: 默认后端，支持最多模型格式
- vLLM: 高吞吐后端，支持 AWQ/GPTQ/FP8 量化模型
- GGUF (llama.cpp): 通过 lm-eval-harness 的 gguf backend [待验证是否原生支持]

**结果解读**:
- Score breakdown: 按 benchmark/子任务的分数明细
- 标准误差 (stderr): 评估分数的置信区间，小数据集 stderr 大
- 配置信息: 确保对比实验的配置一致（few-shot 数、prompt 模板）

**常见陷阱**:
- 忘记控制变量: 基线和量化版本的 few-shot 数/prompt 模板不一致
- batch_size 对生成式 task 的影响（某些后端 batch_size > 1 会改变生成结果）
- 过度关注单个 benchmark 的变化，忽略整体趋势

### 深潜 2: OpenVINO 精度评估工具链（重点展开）

**选择理由**: Intel 硬件生态的核心推理框架，集成了从量化到精度验证的完整工具链。对于非 NVIDIA 硬件（Intel CPU、iGPU、Arc GPU）是主要的部署选择。其 accuracy-aware 量化方法和评估集成是 OpenVINO 区别于其他框架的关键特性。与网站已有的 `intel-igpu-inference` 路径直接衔接。

**Optimum Intel 一站式工作流**:
- HuggingFace 的官方 Intel 集成层
- 工作流: HF 模型 → OpenVINO IR 转换 → 量化（INT8/INT4）→ 精度评估 → 部署
- 与 lm-eval-harness 的对接: 通过 optimum-intel 后端，直接在 OpenVINO 推理引擎上运行 lm-eval-harness [待验证具体集成方式]

**NNCF Accuracy-Aware 量化的精度约束**:
- 核心思想: 不讲量化算法本身（见 quantization 路径），聚焦"精度约束如何设置和验证"
- 设定方式: 指定精度下限（如"MMLU 分数不低于 FP16 基线的 99%"）
- 验证循环: NNCF 自动在量化过程中评估精度，若跌破阈值则对敏感层保留更高精度
- 逐层 sensitivity 分析: 哪些层对精度影响最大？这个分析结果帮助理解模型的精度-效率 trade-off

**benchmark_app 性能基准 — 精度+性能联合决策**:
- benchmark_app 测量: 吞吐量 (throughput)、延迟 (latency)
- 联合决策框架: "INT8 掉了 1.5% 精度，但吞吐提升 2.8 倍 → 值得" vs "INT4 掉了 6% 精度，吞吐提升 3.5 倍 → 取决于场景"
- 实际部署中的决策流程: 确定精度底线 → 在满足底线的方案中选最快的

### 深潜 3: llama.cpp 精度评估

**选择理由**: GGUF 是本地部署和边缘场景的主流格式。llama.cpp 内置的 perplexity 测量是 GGUF 量化质量的快速检查手段。社区积累了大量不同量化变体的 perplexity 对比数据，是选择 GGUF 量化方案时的重要参考。

**内置 perplexity 测量**:
- 工作方式: 在标准语料（通常是 WikiText-2）上计算模型的 perplexity
- 含义: perplexity 越低 = 模型对文本的预测越准确
- 用途: 量化前后 perplexity 变化是最快速的质量检查

**GGUF 量化变体的 perplexity 对比数据**:
- 社区维护的对比数据: 不同量化级别（Q2_K → Q8_0）在同一模型上的 perplexity 变化
- 典型模式: Q8_0 几乎无损 → Q6_K 极微损 → Q5_K_M 轻微 → Q4_K_M 可感知 → Q3_K 明显 → Q2_K 严重 [待验证典型数值]
- 怎么读这些数据: 关注相对变化而非绝对值

**KV cache 量化对精度的影响**:
- llama.cpp 支持 KV cache 的量化（Q8_0、Q4_0）
- 对短上下文: 影响微小
- 对长上下文: 影响显著——长上下文任务中的精度损失更大 [待验证]
- 测量方法: 在不同上下文长度下比较 perplexity

**Perplexity 与 task accuracy 的关系**:
- 核心问题: perplexity 降了，实际 benchmark 分数也一定降吗？
- 答案: 不一定线性相关。Perplexity 是全局指标，task accuracy 测特定能力
- 实际意义: perplexity 是快速筛选工具（大幅上升 = 肯定有问题），但不能替代 task-specific 评估
- 建议: 用 perplexity 做初筛，再用 lm-eval-harness 做精确评估

### 交互组件

1. **QuantDegradationExplorer**: 选择模型规模（7B/13B/70B）× 量化方式（FP16/INT8/INT4/FP8）× benchmark 类别（知识/推理/代码）。展示精度变化柱状图 + 热力图模式（行=量化方式，列=benchmark，颜色=degradation 程度）。数据 [待验证，执行时收集典型数据]。
2. **EvalToolchainComparison**: lm-eval-harness vs OpenVINO (Optimum Intel + NNCF) vs llama.cpp perplexity 三种评估工具的对比面板。维度: 适用场景 / 支持模型格式 / 输出指标 / benchmark 覆盖范围 / 硬件要求。以卡片或表格形式展示。
3. **PerplexityVsTaskAccuracy**: 展示同一模型不同量化级别下 perplexity 变化 vs 实际 benchmark 分数变化的双轴图。突出两者不完全线性的关系（某些量化级别 perplexity 变化小但特定 benchmark 掉分明显）。数据 [待验证]。

---

## Art.7 `leaderboard-model-selection` — 排行榜解读与模型选型

**问题驱动**: "排行榜上几十个模型、几十个分数，我的具体场景到底该选哪个？"

### 全景部分

**主流排行榜对比**:
- **Chatbot Arena** (LMSYS): ELO 评分体系、人类盲评机制、分类排行（Coding/Hard Prompts/Longer Query 等）
- **Open LLM Leaderboard** (HuggingFace): 基于 lm-eval-harness、开源模型专属、V1→V2 的 benchmark 更换及原因 [待验证 V2 的具体 benchmark 列表]
- **LiveBench**: 动态更新抗 contamination、每月刷新题库
- **Artificial Analysis**: 兼顾质量+性能+价格的综合排行，API 模型为主
- 各排行榜的定位差异和互补关系

**排行榜的陷阱**:
- 同一个模型在不同排行榜排名差异巨大（因为测不同能力）
- "刷榜"现象: 针对特定 benchmark 过拟合训练
- 排行榜指标与实际使用体验的脱节（"分数高但不好用"）
- Chatbot Arena 的样本偏差（偏技术用户、偏英语、偏对话场景）

**场景化选型框架**:
- 第一步: 明确核心任务（对话 / 推理 / 代码 / Agent / 知识问答 / 翻译）
- 第二步: 确定约束条件（延迟要求 / 成本预算 / 隐私需求→是否本地部署 / 硬件限制）
- 第三步: 根据任务和约束，选择对应的 benchmark 组合来评估候选模型
- 第四步: 在自己的数据上做 mini evaluation 验证（不要完全依赖公开 benchmark）

**小模型选型（重点展开）**:
- 本地部署场景下的模型选择:
  - 消费级 GPU（8-24GB VRAM）: 能跑什么规模的模型？量化后呢？
  - CPU-only: 需要多少 RAM？什么量化级别可用？
  - Intel iGPU / Arc GPU: OpenVINO 支持的模型和量化方案（衔接 intel-igpu-inference 路径）
- 各家小模型的能力特点与适用场景:
  - Gemma (Google): 多语言、指令遵循 [执行时需验证]
  - Phi (Microsoft): 推理能力突出 [执行时需验证]
  - Qwen (Alibaba): 中文场景、工具调用 [执行时需验证]
  - Llama 小参数版 (Meta): 生态最广泛 [执行时需验证]
- 量化方案选择: 什么场景下 7B-Q4 优于 3B-FP16？结合 Art.6 的精度评估方法来决策

**衔接 model-routing 路径**:
- 从"选一个模型"到"动态选模型"的思维跳跃
- Benchmark 数据如何喂给 routing 策略:
  - 任务难度评估 → 选择对应能力级别的模型
  - 成本预算 → 简单任务用小/快模型，复杂任务升级到大模型
  - 质量阈值 → 用 benchmark 数据设定各模型的能力边界
- 引导读者进入 model-routing 路径继续深入

### 深潜: Chatbot Arena

**选择理由**: 被学术界和工业界公认为最可信的人类偏好评估平台。所有 frontier 模型都报 Arena ELO 或排名。其"人类盲评 + ELO 评分"的评估方法论本身就是值得理解的知识——它回答了一个根本问题："当我们说一个模型比另一个更好时，这个判断是怎么来的？"

**评估机制**:
- 用户提交 prompt → 两个匿名模型并排生成回复 → 用户选择更好的（或平局） → ELO 分数更新
- 完全盲评: 用户不知道模型身份，消除品牌偏好
- 众包规模: 累计百万级评估 [待验证]

**ELO 评分系统**:
- 借鉴国际象棋: 初始分数 → 每场对局根据胜负和双方分差更新
- 统计意义: 需要足够多的对局才能稳定排名（新模型上线初期分数波动大）
- 置信区间: Arena 提供 95% 置信区间，排名接近的模型差异可能不显著

**分类排行**:
- Overall / Coding / Hard Prompts / Longer Query / Math / Creative Writing 等
- 不同类别的排名可能显著不同（某模型 Overall 第 3，但 Coding 第 1）
- 对选型的意义: 看与你场景最匹配的类别排名

**已知局限**:
- 用户群体偏差: 偏技术用户、偏英语
- 偏好流畅度而非正确性: 用户可能选择"听起来更好"而非"内容更准确"的回答
- 闭源模型占优: 响应速度和格式优化可能影响判断
- 某些能力维度（长文档处理、复杂工具使用）覆盖不足

### 交互组件

1. **ModelSelectionDecisionTree**: 场景化选型决策流程。用户回答 4-5 个问题（任务类型→延迟要求→是否本地部署→预算→硬件），最终推荐: (a) 应该关注哪些 benchmark 组合，(b) 候选模型范围（按参数量级和部署方式分组）。不推荐具体模型（数据会过时），而是推荐"评估框架"。

---

## 交互组件汇总

| # | 组件名 | 文章 | 类型 | 复杂度 |
|---|--------|------|------|--------|
| 1 | BenchmarkTaxonomy | Art.1 | 分类浏览器 | 高 |
| 2 | EvalProtocolFlow | Art.1 | 流程动画 | 中 |
| 3 | ReasoningBenchmarkMap | Art.2 | 散点图 | 中 |
| 4 | MMLUProEvalDemo | Art.2 | 流程可视化 | 中 |
| 5 | CodeBenchmarkEvolution | Art.3 | 时间线 | 中 |
| 6 | SWEbenchFlow | Art.3 | 流程动画 | 中 |
| 7 | AgentCapabilityRadar | Art.4 | 雷达图 | 中 |
| 8 | BFCLEvalFlow | Art.4 | 流程可视化 | 中 |
| 9 | ModelBenchmarkMatrix | Art.5 | 热力图矩阵 | 高 |
| 10 | QuantDegradationExplorer | Art.6 | 交互图表 | 高 |
| 11 | EvalToolchainComparison | Art.6 | 对比面板 | 低 |
| 12 | PerplexityVsTaskAccuracy | Art.6 | 双轴图 | 中 |
| 13 | ModelSelectionDecisionTree | Art.7 | 决策流程 | 中 |

总计 13 个组件。高复杂度 3 个、中复杂度 8 个、低复杂度 2 个。

---

## 执行要求

### 事实性验证（关键）

所有标注 [待验证] 的数据必须在执行阶段通过网络搜索确认:
- Benchmark 的数据集大小、题目数量
- 模型在各 benchmark 上的分数范围
- 各家模型技术报告中实际报告的 benchmark 列表
- 工具链的具体集成方式和支持情况
- 社区数据（如 GGUF 量化 perplexity 对比）

**原则: 不确定的就搜索验证，验证不到的就标注"截至 YYYY-MM 的信息"，绝不编造。**

### 与现有路径的衔接

- `model-routing` 路径: Art.7 最后自然过渡，需在 model-routing-landscape.mdx 开头添加反向引用
- `quantization` 路径: Art.6 交叉引用量化算法原理
- `intel-igpu-inference` 路径: Art.6 交叉引用 OpenVINO 部署
- 学习路径 YAML: 创建 `llm-evaluation-benchmarks.yaml`

### 组件约定

- React + SVG，使用 `COLORS`/`FONTS` from `./shared/colors`
- Props: `{ locale?: 'zh' | 'en' }` defaulting to `'zh'`
- 内联 i18n 模式
- 动画用 `motion/react`
- MDX 中使用 `client:visible` 指令
