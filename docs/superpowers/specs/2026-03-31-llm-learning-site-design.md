# LLM Learning 网站设计文档

> 日期：2026-03-31
> 状态：Draft

## 1. 项目定位

**LLM Learning** —— 一个可持续扩展的、中英双语（V1 仅中文）的 LLM 技术知识库网站。

**核心特点：**
- 融合深入浅出的直觉解释与硬核技术细节（公式、数据结构、张量形状）
- 关键概念配以分步动画和交互式可视化
- 三层内容架构（文章 → 学习路径 → 导航），支持持续扩展
- 严格引用外部资源（论文、优质教程），禁止臆造内容

**目标受众：** 有扎实 ML 基础的高级工程师（首先是作者本人），未来开放给更广泛的工程师/研究者群体。

## 2. 技术栈

| 层面 | 选型 | 理由 |
|------|------|------|
| 框架 | Astro | 内容优先，Islands 架构，MDX 原生支持 |
| 内容格式 | MDX | Markdown + JSX，公式/文字/组件无缝混排 |
| 交互组件 | React | 生态丰富，动画库支持好 |
| 动画 | Framer Motion | 分步动画，声明式 API |
| 数据可视化 | D3.js + 自定义 SVG | 矩阵、数据流、架构图 |
| 公式渲染 | KaTeX | 快速、轻量 |
| 样式 | Tailwind CSS 3 | 实用优先，快速迭代，@astrojs/tailwind 集成成熟 |
| i18n | Astro 内置 i18n 路由 | `/zh/...`，未来扩展 `/en/...` |
| 运行方式 | 本地 `astro dev` | localhost 访问，未来可 `astro build` 生成静态文件部署到自有服务器 |

## 3. 三层内容架构

### 3.1 第一层：文章（原子单元）

每篇文章是独立自包含的 MDX 文件，通过 frontmatter 声明元数据。

**Frontmatter 规范：**

```yaml
---
title: "Flash Attention 分块原理"        # 必填
slug: flash-attention                     # 必填，URL 标识符
tags: [attention, hardware-optimization]  # 必填，用于分类和筛选
prerequisites: [attention-basics, softmax] # 可选，指向其他文章的 slug
difficulty: advanced                      # 必填：beginner | intermediate | advanced
created: 2026-03-31                       # 必填
updated: 2026-03-31                       # 必填，每次修改时更新
references:                               # 必填，至少一个
  - type: paper                           # paper | website | video | repo
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention"
    url: "https://arxiv.org/abs/2205.14135"
  - type: website
    title: "Jay Alammar - The Illustrated Transformer"
    url: "https://jalammar.github.io/illustrated-transformer/"
---
```

**文章内容结构约定：**
1. 开头简介（一段话说清这篇文章讲什么、为什么重要）
2. 直觉/High-level 解释（类比、图示）
3. 技术细节（公式推导、数据结构、张量形状变化）
4. 分步动画/可视化（嵌入 React 组件）
5. 总结与关键要点
6. 延伸阅读（自动从 frontmatter references 渲染）

### 3.2 第二层：学习路径（策展层）

学习路径是独立的 YAML 配置文件，把文章串成有序学习序列。

```yaml
# src/content/paths/transformer-core.yaml
id: transformer-core
title:
  zh: "Transformer 核心机制"
  en: "Transformer Core Mechanisms"
description:
  zh: "从网络结构到注意力机制，深入理解 Transformer 的每一个组件"
  en: "Deep dive into every component of the Transformer, from architecture to attention"
level: intermediate
articles:
  - transformer-overview
  - qkv-intuition
  - attention-computation
  - multi-head-attention
  - gqa-mqa
```

**路径操作规则：**
- 新增文章后，将其加入对应路径（可选）
- 同一篇文章可出现在多条路径中
- 调整学习顺序只需改 YAML，不动文章本身

### 3.3 第三层：首页导航

- 学习路径卡片入口（推荐学习方式）
- 按 tag 浏览全部文章（自由探索）
- 搜索功能（文章标题和 tag）
- 全局资源推荐页入口

## 4. 项目目录结构

```
llm-learning/
├── CLAUDE.md                          # Claude Code 项目约定
├── docs/
│   └── TODO.md                        # 延迟任务追踪
├── src/
│   ├── content/
│   │   ├── articles/
│   │   │   └── zh/                    # V1 仅中文
│   │   │       ├── transformer-overview.mdx
│   │   │       ├── qkv-intuition.mdx
│   │   │       ├── attention-computation.mdx
│   │   │       ├── multi-head-attention.mdx
│   │   │       ├── gqa-mqa.mdx
│   │   │       ├── prefill-vs-decode.mdx
│   │   │       ├── kv-cache.mdx
│   │   │       └── flash-attention.mdx
│   │   ├── paths/
│   │   │   ├── transformer-core.yaml
│   │   │   └── inference-engineering.yaml
│   │   └── resources/                 # 全局外部资源定义
│   │       └── external-resources.yaml
│   ├── components/
│   │   ├── primitives/                # 通用可复用基础组件
│   │   │   ├── MatrixGrid.tsx         # 矩阵网格可视化
│   │   │   ├── StepNavigator.tsx      # 分步导航控制器
│   │   │   ├── TensorShape.tsx        # 张量形状标注
│   │   │   └── CodeBlock.tsx          # 代码块增强
│   │   ├── interactive/               # 特定主题交互动画
│   │   │   ├── AttentionStepAnimation.tsx
│   │   │   ├── MatrixMultiplyViewer.tsx
│   │   │   ├── KVCacheDemo.tsx
│   │   │   ├── FlashAttentionTiling.tsx
│   │   │   └── SoftmaxVisualization.tsx
│   │   ├── layout/                    # 页面布局
│   │   │   ├── ArticleLayout.astro
│   │   │   ├── PathLayout.astro
│   │   │   └── Navigation.astro
│   │   └── common/                    # 通用 UI 组件
│   │       ├── ReferenceCard.astro    # 外部引用卡片
│   │       ├── PrerequisiteHint.astro # 前置知识提示
│   │       └── LanguageSwitch.astro   # 语言切换（预留）
│   ├── pages/
│   │   ├── zh/
│   │   │   ├── index.astro            # 中文首页
│   │   │   ├── articles/[slug].astro  # 文章页
│   │   │   ├── paths/[id].astro       # 路径页
│   │   │   └── resources.astro        # 资源推荐页
│   │   └── en/                        # 预留英文路由
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── content-validation.ts      # 构建时内容校验
│   └── templates/
│       └── article-template.mdx       # 新文章模板
├── scripts/
│   └── validate-content.ts            # 校验脚本：frontmatter 完整性、prerequisites 有效性
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## 5. 页面设计

### 5.1 首页
- 顶部导航栏：Logo、搜索、语言切换（V1 灰显）、资源页链接
- 主体区域：学习路径卡片（标题 + 描述 + 难度 + 文章数量）
- 底部区域：按 tag 云浏览全部文章

### 5.2 文章页
- 左侧：文章目录（TOC，自动从标题生成）
- 中间主体：文章内容（文字 + 公式 + 嵌入交互组件）
- 右侧边栏：
  - 前置知识链接（从 prerequisites 自动渲染）
  - 延伸阅读 / 外部资源链接（从 references 自动渲染）
  - 所属学习路径（含上一篇/下一篇导航）

### 5.3 路径页
- 路径标题和描述
- 有序文章列表，每项显示标题、难度、简介
- 当前文章高亮（如果从文章页跳转过来）

### 5.4 资源推荐页
- 分类展示外部学习资源
- 每个资源含：名称、链接、简评、覆盖主题、推荐理由

## 6. 外部资源引用机制

### 6.1 全局资源页
`src/content/resources/external-resources.yaml` 定义所有推荐资源：

```yaml
- id: illustrated-transformer
  title: "The Illustrated Transformer"
  author: "Jay Alammar"
  url: "https://jalammar.github.io/illustrated-transformer/"
  type: website
  tags: [transformer, attention, beginner-friendly]
  description: "最经典的 Transformer 图解，静态图片 + 文字，适合初次理解"

- id: transformer-explainer
  title: "Transformer Explainer"
  author: "Georgia Tech / Polo Club"
  url: "https://poloclub.github.io/transformer-explainer/"
  type: interactive
  tags: [transformer, attention, interactive]
  description: "浏览器内运行 GPT-2，实时观察内部计算，IEEE VIS 2024"

- id: llm-visualization
  title: "LLM Visualization"
  author: "Brendan Bycroft"
  url: "https://bbycroft.net/llm"
  type: interactive
  tags: [transformer, 3d-visualization]
  description: "GPT 网络推理的 3D 交互可视化"

- id: 3blue1brown-transformers
  title: "3Blue1Brown - Attention in Transformers"
  author: "Grant Sanderson"
  url: "https://www.3blue1brown.com/topics/neural-networks"
  type: video
  tags: [transformer, attention, intuition]
  description: "高质量动画视频，直觉解释出色"

- id: nn-zero-to-hero
  title: "Neural Networks: Zero to Hero"
  author: "Andrej Karpathy"
  url: "https://github.com/karpathy/nn-zero-to-hero"
  type: video
  tags: [transformer, implementation, from-scratch]
  description: "从零手写，YouTube + Jupyter Notebook"
```

### 6.2 文章内联引用
文章 frontmatter 的 `references` 字段自动渲染为右侧边栏的"延伸阅读"卡片，用户一键跳转外部资源。

## 7. 交互动画设计原则

### 7.1 三级动画体系
| 级别 | 描述 | 使用场景 | 实现方式 |
|------|------|----------|----------|
| A 级 | 静态分步图解 | 大部分概念说明 | SVG + CSS，多帧切换 |
| B 级 | 点击逐步推进 | 核心计算过程（Attention 计算、矩阵乘法） | React + Framer Motion + StepNavigator |
| C 级 | 完全交互参数化 | 按需，最核心概念 | React + D3 + 自定义状态管理 |

### 7.2 可复用基础组件
- **MatrixGrid**：通用矩阵网格，支持单元格高亮、数值展示、形状标注
- **StepNavigator**：步骤控制器（上一步/下一步/重置），管理动画状态
- **TensorShape**：张量形状标注组件，展示 `(B, S, H)` 等维度信息

### 7.3 组件开发约定
- 每个交互组件独立、自包含，通过 props 接收配置
- 组件内数据硬编码或通过 props 传入，不依赖外部状态
- 支持 `client:visible` 指令（进入视口时才加载，优化性能）

## 8. i18n 策略

- **V1**：仅中文（`/zh/...`），路由结构和组件预留英文支持
- **未来**：添加 `/en/...` 路由，文章放在 `articles/en/` 目录
- 语言切换组件 V1 显示但灰显，表明功能规划中
- 路径 YAML 的 title/description 从 V1 开始就写双语（成本低），方便未来直接启用

## 9. Claude Code 工作流支持

### 9.1 CLAUDE.md 项目约定
项目根目录的 `CLAUDE.md` 包含：
- 项目结构说明和技术栈
- 新增文章 checklist
- frontmatter 规范
- 组件命名规范
- 内容写作原则（严谨事实、引用来源、中英混合）
- TODO.md 使用规则

### 9.2 新增文章 Checklist
```
1. 从 src/templates/article-template.mdx 复制模板
2. 填写完整 frontmatter（特别是 references，必须验证 URL 有效）
3. 编写内容，遵循内容结构约定
4. 如需交互组件，在 components/interactive/ 创建
5. 将文章 slug 加入对应的学习路径 YAML
6. 运行 validate-content 脚本确认无错误
7. 本地 astro dev 预览确认渲染正确
```

### 9.3 TODO.md
- 位于 `docs/TODO.md`
- 捕捉讨论中延迟执行的想法
- 格式：`- [ ] 描述 (来源: YYYY-MM-DD)`
- 用户指定高优先级时标记 `[HIGH]`
- 按主题分组，随内容增长定期整理

## 10. 构建时内容校验

`scripts/validate-content.ts` 在构建时执行以下检查：
- frontmatter 必填字段完整性
- `prerequisites` 引用的 slug 是否存在
- `references` URL 格式是否有效
- 路径 YAML 中引用的文章 slug 是否存在
- 标签一致性检查（提示拼写接近的 tag）

## 11. V1 初始内容范围

### 路径 1：Transformer 核心机制
| # | 文章 | 难度 | 动画级别 |
|---|------|------|----------|
| 1 | Transformer 网络结构总览 | intermediate | A（架构图）|
| 2 | QKV 的数据结构与直觉 | intermediate | B（矩阵映射动画）|
| 3 | Attention 计算详解 | intermediate | B（分步矩阵运算）|
| 4 | Multi-Head Attention | intermediate | A（空间切分图）|
| 5 | MQA 与 GQA | advanced | A（结构对比图）|

### 路径 2：LLM 推理工程
| # | 文章 | 难度 | 动画级别 |
|---|------|------|----------|
| 6 | Prefill vs Decode 阶段 | intermediate | A（对比图）|
| 7 | KV Cache 原理 | advanced | B（缓存过程动画）|
| 8 | Flash Attention 分块原理 | advanced | B（Tiling + Online Softmax 动画）|

## 12. 参考项目

| 项目 | URL | 借鉴点 |
|------|-----|--------|
| The Illustrated Transformer | jalammar.github.io/illustrated-transformer/ | 图解风格、由浅入深的叙述方式 |
| Transformer Explainer | poloclub.github.io/transformer-explainer/ | 交互式组件设计 |
| LLM Visualization | bbycroft.net/llm | 3D 可视化思路 |
| 3Blue1Brown | 3blue1brown.com/topics/neural-networks | 动画叙事手法 |
| nn-zero-to-hero | github.com/karpathy/nn-zero-to-hero | 从零构建的教学思路 |
| FT Visual Storytelling | ig.ft.com/generative-ai/ | 数据新闻式的可视化叙事 |
