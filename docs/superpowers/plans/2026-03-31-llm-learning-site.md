# LLM Learning 网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零构建一个基于 Astro + MDX + React 的 LLM 技术知识库网站，包含三层内容架构、交互动画组件、中文 V1 内容（8 篇文章 + 2 条学习路径）。

**Architecture:** Astro Islands 架构，MDX 作为内容格式，React 组件作为交互岛。内容通过 Astro Content Collections 管理，学习路径通过 YAML 配置。首页展示路径卡片 + 标签浏览，文章页三栏布局（TOC / 正文 / 侧边栏）。

**Tech Stack:** Astro 5, React 19, MDX, Tailwind CSS 3, Framer Motion, KaTeX, D3.js, TypeScript

**设计文档:** `docs/superpowers/specs/2026-03-31-llm-learning-site-design.md`

---

## Phase 1: 项目脚手架

### Task 1: 初始化 Astro 项目

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `tailwind.config.mjs`
- Create: `src/styles/global.css`

- [ ] **Step 1: 创建 Astro 项目**

```bash
cd C:/workspace/llm-learning
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict
```

- [ ] **Step 2: 安装核心依赖**

```bash
npm install @astrojs/react @astrojs/mdx @astrojs/tailwind react react-dom framer-motion katex d3
npm install -D @types/react @types/react-dom @types/katex @types/d3 tailwindcss@3 @tailwindcss/typography tsx
```

- [ ] **Step 3: 配置 astro.config.mjs**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  integrations: [
    react(),
    mdx(),
    tailwind(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
```

- [ ] **Step 4: 安装 remark/rehype 数学插件**

```bash
npm install remark-math rehype-katex
```

- [ ] **Step 5: 配置 Tailwind**

```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            code: {
              backgroundColor: '#f1f5f9',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

- [ ] **Step 6: 创建全局样式**

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* KaTeX 样式 */
@import 'katex/dist/katex.min.css';

/* 自定义全局样式 */
@layer base {
  body {
    @apply bg-white text-gray-900 antialiased;
  }
}

/* 文章内 KaTeX 公式样式微调 */
.katex-display {
  @apply my-6 overflow-x-auto;
}
```

- [ ] **Step 7: 创建最小首页验证构建**

```astro
---
// src/pages/zh/index.astro
---
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>LLM Learning</title>
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body>
    <h1 class="text-3xl font-bold p-8">LLM Learning - 构建中</h1>
  </body>
</html>
```

- [ ] **Step 8: 验证构建和开发服务器**

```bash
npx astro dev
```

Expected: 浏览器访问 `http://localhost:4321/zh/` 可看到页面。

- [ ] **Step 9: 提交**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json tailwind.config.mjs src/styles/global.css src/pages/zh/index.astro
git commit -m "feat: initialize Astro project with React, MDX, Tailwind, KaTeX"
```

---

### Task 2: 创建项目约定文件

**Files:**
- Create: `CLAUDE.md`
- Create: `docs/TODO.md`
- Create: `.gitignore`

- [ ] **Step 1: 创建 .gitignore**

```gitignore
# .gitignore
node_modules/
dist/
.astro/
.superpowers/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

- [ ] **Step 2: 创建 CLAUDE.md**

```markdown
# LLM Learning 项目约定

## 项目概述
基于 Astro + MDX + React 的 LLM 技术知识库网站。设计文档见 `docs/superpowers/specs/2026-03-31-llm-learning-site-design.md`。

## 技术栈
- 框架：Astro 5 (Islands 架构)
- 内容：MDX (Markdown + JSX)
- 交互组件：React + Framer Motion
- 公式：KaTeX (remark-math + rehype-katex)
- 可视化：D3.js + 自定义 SVG
- 样式：Tailwind CSS + @tailwindcss/typography
- 语言：TypeScript

## 目录结构
- `src/content/articles/zh/` — 中文文章 (MDX)
- `src/content/paths/` — 学习路径定义 (YAML)
- `src/content/resources/` — 外部资源定义 (YAML)
- `src/components/primitives/` — 通用可复用基础组件 (MatrixGrid, StepNavigator, TensorShape)
- `src/components/interactive/` — 特定主题交互动画组件
- `src/components/layout/` — Astro 布局组件
- `src/components/common/` — 通用 UI 组件
- `src/pages/zh/` — 中文页面路由
- `src/templates/` — 文章模板

## 新增文章 Checklist
1. 复制 `src/templates/article-template.mdx` 到 `src/content/articles/zh/<slug>.mdx`
2. 填写完整 frontmatter（所有必填字段，特别是 references 必须真实有效）
3. 编写内容：简介 → 直觉解释 → 技术细节 → 动画/可视化 → 总结 → 延伸阅读
4. 如需交互组件，在 `src/components/interactive/` 创建，命名用 PascalCase
5. 将文章 slug 加入对应的学习路径 YAML (`src/content/paths/`)
6. 运行 `npm run validate` 确认内容校验通过
7. 运行 `npm run dev` 本地预览确认渲染正确

## Frontmatter 必填字段
```yaml
title: string       # 文章标题
slug: string        # URL 标识符，kebab-case
locale: string      # zh | en
tags: string[]      # 分类标签
difficulty: string  # beginner | intermediate | advanced
created: string     # YYYY-MM-DD
updated: string     # YYYY-MM-DD
references: array   # 至少一个 {type, title, url}
```
可选字段：`prerequisites: string[]`（其他文章的 slug）

## 内容写作原则
- **严格事实**：所有技术细节必须准确，禁止猜测和臆造
- **必须引用**：每个技术点都要有 paper/website 来源
- **主动验证**：不确定的内容必须搜索网络验证
- **中英混合**：解释用中文，术语保持英文原文（首次出现附中文翻译）
- **公式规范**：行内用 `$...$`，独立块用 `$$...$$`，变量定义要清晰

## 组件约定
- 基础组件放 `primitives/`，特定主题放 `interactive/`
- 组件通过 props 配置，不依赖外部状态
- 在 MDX 中使用 `client:visible` 指令延迟加载交互组件
- 动画用 Framer Motion，数据可视化用 D3 或自定义 SVG

## 常用命令
- `npm run dev` — 启动开发服务器
- `npm run build` — 构建静态站点
- `npm run validate` — 运行内容校验
```

- [ ] **Step 3: 创建 TODO.md**

```markdown
# TODO

## 未来功能
- [ ] 英文版内容 (来源: 2026-03-31)
- [ ] C 级全交互参数化动画，按需加入 (来源: 2026-03-31)
- [ ] 部署到自有服务器 (来源: 2026-03-31)

## 未来内容
- [ ] MoE (Mixture of Experts) 专题 (来源: 2026-03-31)
- [ ] Mamba / 状态空间模型专题 (来源: 2026-03-31)
- [ ] MTP (Multi-Token Prediction) 专题 (来源: 2026-03-31)
- [ ] GPU 编程实现 LLM 专题 (来源: 2026-03-31)
- [ ] Ollama 相关内容 (来源: 2026-03-31)
```

- [ ] **Step 4: 提交**

```bash
git add CLAUDE.md docs/TODO.md .gitignore
git commit -m "docs: add CLAUDE.md project conventions, TODO.md, and .gitignore"
```

---

## Phase 2: 内容系统

### Task 3: 配置 Astro Content Collections

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/articles/zh/_placeholder.mdx` (验证用)

- [ ] **Step 1: 定义 Content Collections schema**

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    locale: z.enum(['zh', 'en']).default('zh'),
    tags: z.array(z.string()),
    prerequisites: z.array(z.string()).optional().default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    created: z.string(),
    updated: z.string(),
    references: z.array(z.object({
      type: z.enum(['paper', 'website', 'video', 'repo']),
      title: z.string(),
      url: z.string().url(),
    })).min(1),
  }),
});

export const collections = { articles };
```

- [ ] **Step 2: 创建文章模板**

```mdx
---
// src/templates/article-template.mdx
title: "文章标题"
slug: article-slug
locale: zh
tags: [tag1, tag2]
prerequisites: []
difficulty: intermediate
created: "2026-03-31"
updated: "2026-03-31"
references:
  - type: paper
    title: "参考论文/资源标题"
    url: "https://example.com"
---

{/* 简介：一段话说清这篇文章讲什么、为什么重要 */}

## 直觉理解

{/* High-level 解释，类比、图示 */}

## 技术细节

{/* 公式推导、数据结构、张量形状变化 */}

## 可视化

{/* 嵌入交互组件 */}

## 总结

{/* 关键要点 */}

{/* 延伸阅读：自动从 frontmatter references 渲染，无需手写 */}
```

- [ ] **Step 3: 创建占位文章验证 schema 生效**

```mdx
---
title: "Transformer 网络结构总览"
slug: transformer-overview
locale: zh
tags: [transformer, architecture]
prerequisites: []
difficulty: intermediate
created: "2026-03-31"
updated: "2026-03-31"
references:
  - type: paper
    title: "Attention Is All You Need"
    url: "https://arxiv.org/abs/1706.03762"
---

占位内容，待后续补充。
```

保存为 `src/content/articles/zh/transformer-overview.mdx`。

- [ ] **Step 4: 验证 Content Collection 工作**

```bash
npx astro build
```

Expected: 构建成功，无 schema validation 报错。

- [ ] **Step 5: 提交**

```bash
git add src/content.config.ts src/templates/article-template.mdx src/content/articles/zh/transformer-overview.mdx
git commit -m "feat: configure Astro Content Collections with article schema and template"
```

---

### Task 4: 学习路径和外部资源数据加载

**Files:**
- Create: `src/content/paths/transformer-core.yaml`
- Create: `src/content/paths/inference-engineering.yaml`
- Create: `src/content/resources/external-resources.yaml`
- Create: `src/utils/paths.ts`
- Create: `src/utils/resources.ts`

- [ ] **Step 1: 创建学习路径 YAML 文件**

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

```yaml
# src/content/paths/inference-engineering.yaml
id: inference-engineering
title:
  zh: "LLM 推理工程"
  en: "LLM Inference Engineering"
description:
  zh: "从 Prefill/Decode 到 KV Cache 再到 Flash Attention，理解大模型推理的工程优化"
  en: "Understanding engineering optimizations for LLM inference, from KV Cache to Flash Attention"
level: advanced
articles:
  - prefill-vs-decode
  - kv-cache
  - flash-attention
```

- [ ] **Step 2: 创建外部资源 YAML**

```yaml
# src/content/resources/external-resources.yaml
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

- id: ft-generative-ai
  title: "Generative AI Explained"
  author: "Financial Times"
  url: "https://ig.ft.com/generative-ai/"
  type: website
  tags: [llm, visualization, storytelling]
  description: "FT 数据新闻团队的可视化叙事，展示 LLM 工作原理"
```

- [ ] **Step 3: 创建路径数据加载工具**

```typescript
// src/utils/paths.ts
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface LearningPath {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  level: 'beginner' | 'intermediate' | 'advanced';
  articles: string[];
}

const PATHS_DIR = path.join(process.cwd(), 'src/content/paths');

export function getAllPaths(): LearningPath[] {
  const pathsDir = PATHS_DIR;
  const files = fs.readdirSync(pathsDir).filter(f => f.endsWith('.yaml'));
  return files.map(file => {
    const content = fs.readFileSync(path.join(pathsDir, file), 'utf-8');
    return yaml.load(content) as LearningPath;
  });
}

export function getPathById(id: string): LearningPath | undefined {
  return getAllPaths().find(p => p.id === id);
}
```

- [ ] **Step 4: 创建资源数据加载工具**

```typescript
// src/utils/resources.ts
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface ExternalResource {
  id: string;
  title: string;
  author: string;
  url: string;
  type: 'website' | 'interactive' | 'video' | 'paper' | 'repo';
  tags: string[];
  description: string;
}

const RESOURCES_FILE = path.join(process.cwd(), 'src/content/resources/external-resources.yaml');

export function getAllResources(): ExternalResource[] {
  const content = fs.readFileSync(path.resolve(RESOURCES_FILE), 'utf-8');
  return yaml.load(content) as ExternalResource[];
}

export function getResourcesByTag(tag: string): ExternalResource[] {
  return getAllResources().filter(r => r.tags.includes(tag));
}
```

- [ ] **Step 5: 安装 YAML 解析依赖**

```bash
npm install js-yaml
npm install -D @types/js-yaml
```

- [ ] **Step 6: 验证数据加载**

创建临时测试脚本验证：

```bash
npx astro build
```

Expected: 构建成功。

- [ ] **Step 7: 提交**

```bash
git add src/content/paths/ src/content/resources/ src/utils/paths.ts src/utils/resources.ts
git commit -m "feat: add learning path and external resource data loading"
```

---

## Phase 3: 布局与页面

### Task 5: 导航栏和基础布局

**Files:**
- Create: `src/components/layout/Navigation.astro`
- Create: `src/components/layout/BaseLayout.astro`
- Create: `src/components/common/LanguageSwitch.astro`

- [ ] **Step 1: 创建基础布局组件**

```astro
---
// src/components/layout/BaseLayout.astro
import Navigation from './Navigation.astro';
import '../../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'LLM 技术知识库' } = Astro.props;
---
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title} | LLM Learning</title>
  </head>
  <body class="min-h-screen bg-white">
    <Navigation />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </body>
</html>
```

```astro
---
// src/components/layout/Navigation.astro
---
<nav class="border-b border-gray-200 bg-white sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <a href="/zh/" class="text-xl font-bold text-gray-900">
        LLM Learning
      </a>
      <div class="flex items-center gap-6">
        <a href="/zh/" class="text-sm text-gray-600 hover:text-gray-900">首页</a>
        <a href="/zh/resources" class="text-sm text-gray-600 hover:text-gray-900">资源推荐</a>
        <span class="text-sm text-gray-400 cursor-not-allowed" title="Coming soon">
          中文 / <span class="opacity-50">EN</span>
        </span>
      </div>
    </div>
  </div>
</nav>
```

- [ ] **Step 2: 创建根路由重定向和共享工具**

```astro
---
// src/pages/index.astro — 根路由重定向到 /zh/
return Astro.redirect('/zh/');
---
```

```typescript
// src/utils/constants.ts — 共享的标签/难度映射，避免多处重复定义
export const difficultyLabel: Record<string, string> = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
};

export const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
};
```

- [ ] **Step 3: 更新首页使用基础布局**

```astro
---
// src/pages/zh/index.astro
import BaseLayout from '../../components/layout/BaseLayout.astro';
import { getAllPaths } from '../../utils/paths';
import { getCollection } from 'astro:content';

const paths = getAllPaths();
const articles = await getCollection('articles');
const allTags = [...new Set(articles.flatMap(a => a.data.tags))].sort();

const difficultyLabel = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
};

const difficultyColor = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
};
---
<BaseLayout title="首页">
  <!-- 学习路径 -->
  <section class="mb-12">
    <h2 class="text-2xl font-bold mb-6">学习路径</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {paths.map(p => (
        <a href={`/zh/paths/${p.id}`}
           class="block p-6 border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold">{p.title.zh}</h3>
            <span class={`text-xs px-2 py-1 rounded ${difficultyColor[p.level]}`}>
              {difficultyLabel[p.level]}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-3">{p.description.zh}</p>
          <p class="text-xs text-gray-400">{p.articles.length} 篇文章</p>
        </a>
      ))}
    </div>
  </section>

  <!-- 标签浏览 -->
  <section>
    <h2 class="text-2xl font-bold mb-6">按标签浏览</h2>
    <div class="flex flex-wrap gap-2">
      {allTags.map(tag => (
        <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 cursor-pointer">
          {tag}
        </span>
      ))}
    </div>
  </section>

  <!-- 全部文章 -->
  <section class="mt-8">
    <h2 class="text-2xl font-bold mb-6">全部文章</h2>
    <div class="space-y-3">
      {articles.map(article => (
        <a href={`/zh/articles/${article.data.slug}`}
           class="block p-4 border border-gray-100 rounded hover:border-primary-300 transition-colors">
          <div class="flex items-center gap-3">
            <span class={`text-xs px-2 py-0.5 rounded ${difficultyColor[article.data.difficulty]}`}>
              {difficultyLabel[article.data.difficulty]}
            </span>
            <h3 class="font-medium">{article.data.title}</h3>
          </div>
          <div class="flex gap-2 mt-2">
            {article.data.tags.map(tag => (
              <span class="text-xs text-gray-500">#{tag}</span>
            ))}
          </div>
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: 验证首页渲染**

```bash
npx astro dev
```

Expected: 首页显示学习路径卡片和文章列表。

- [ ] **Step 4: 提交**

```bash
git add src/components/layout/ src/pages/zh/index.astro
git commit -m "feat: add navigation, base layout, and homepage with path cards"
```

---

### Task 6: 文章页布局（三栏）

**Files:**
- Create: `src/components/layout/ArticleLayout.astro`
- Create: `src/components/common/ReferenceCard.astro`
- Create: `src/components/common/PrerequisiteHint.astro`
- Create: `src/components/common/TableOfContents.astro`
- Create: `src/pages/zh/articles/[slug].astro`

- [ ] **Step 1: 创建 TOC 组件**

```astro
---
// src/components/common/TableOfContents.astro
interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

const { headings } = Astro.props;
const toc = headings.filter(h => h.depth >= 2 && h.depth <= 3);
---
<nav class="sticky top-24">
  <h4 class="text-sm font-semibold text-gray-900 mb-3">目录</h4>
  <ul class="space-y-2 text-sm">
    {toc.map(heading => (
      <li class={heading.depth === 3 ? 'ml-4' : ''}>
        <a href={`#${heading.slug}`}
           class="text-gray-500 hover:text-primary-600 transition-colors">
          {heading.text}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

- [ ] **Step 2: 创建引用卡片和前置知识组件**

```astro
---
// src/components/common/ReferenceCard.astro
interface Props {
  references: { type: string; title: string; url: string }[];
}

const { references } = Astro.props;

const typeIcon: Record<string, string> = {
  paper: '📄',
  website: '🌐',
  video: '🎬',
  repo: '💻',
};

const typeLabel: Record<string, string> = {
  paper: '论文',
  website: '网站',
  video: '视频',
  repo: '代码',
};
---
<div class="space-y-3">
  <h4 class="text-sm font-semibold text-gray-900">延伸阅读</h4>
  {references.map(ref => (
    <a href={ref.url} target="_blank" rel="noopener noreferrer"
       class="block p-3 border border-gray-100 rounded hover:border-primary-300 transition-colors">
      <div class="flex items-center gap-2 text-xs text-gray-500 mb-1">
        <span>{typeIcon[ref.type] || '📎'}</span>
        <span>{typeLabel[ref.type] || ref.type}</span>
      </div>
      <p class="text-sm text-gray-700 leading-snug">{ref.title}</p>
    </a>
  ))}
</div>
```

```astro
---
// src/components/common/PrerequisiteHint.astro
interface Props {
  prerequisites: string[];
  allArticles: { data: { slug: string; title: string } }[];
}

const { prerequisites, allArticles } = Astro.props;

const prereqArticles = prerequisites
  .map(slug => allArticles.find(a => a.data.slug === slug))
  .filter(Boolean);
---
{prereqArticles.length > 0 && (
  <div class="mb-4">
    <h4 class="text-sm font-semibold text-gray-900 mb-2">前置知识</h4>
    <ul class="space-y-1">
      {prereqArticles.map(article => (
        <li>
          <a href={`/zh/articles/${article!.data.slug}`}
             class="text-sm text-primary-600 hover:text-primary-800">
            {article!.data.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}
```

- [ ] **Step 3: 创建文章布局组件**

```astro
---
// src/components/layout/ArticleLayout.astro
import BaseLayout from './BaseLayout.astro';
import TableOfContents from '../common/TableOfContents.astro';
import ReferenceCard from '../common/ReferenceCard.astro';
import PrerequisiteHint from '../common/PrerequisiteHint.astro';
import { getCollection } from 'astro:content';
import { getAllPaths } from '../../utils/paths';

interface Props {
  title: string;
  slug: string;
  difficulty: string;
  tags: string[];
  prerequisites: string[];
  references: { type: string; title: string; url: string }[];
  updated: string;
  headings: { depth: number; slug: string; text: string }[];
}

const {
  title, slug, difficulty, tags, prerequisites,
  references, updated, headings,
} = Astro.props;

const allArticles = await getCollection('articles');
const paths = getAllPaths();

// 找到包含当前文章的路径
const containingPaths = paths.filter(p => p.articles.includes(slug));

// 计算上一篇/下一篇
function getNavigation(pathObj: typeof paths[0]) {
  const idx = pathObj.articles.indexOf(slug);
  const prevSlug = idx > 0 ? pathObj.articles[idx - 1] : null;
  const nextSlug = idx < pathObj.articles.length - 1 ? pathObj.articles[idx + 1] : null;
  const prev = prevSlug ? allArticles.find(a => a.data.slug === prevSlug) : null;
  const next = nextSlug ? allArticles.find(a => a.data.slug === nextSlug) : null;
  return { prev, next, pathTitle: pathObj.title.zh };
}

const difficultyLabel: Record<string, string> = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
};
---
<BaseLayout title={title}>
  <div class="flex gap-8">
    <!-- 左侧 TOC -->
    <aside class="hidden lg:block w-56 shrink-0">
      <TableOfContents headings={headings} />
    </aside>

    <!-- 中间正文 -->
    <article class="flex-1 min-w-0">
      <header class="mb-8">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            {difficultyLabel[difficulty] || difficulty}
          </span>
          {tags.map(tag => (
            <span class="text-xs text-gray-500">#{tag}</span>
          ))}
        </div>
        <h1 class="text-3xl font-bold mb-2">{title}</h1>
        <p class="text-sm text-gray-400">更新于 {updated}</p>
      </header>

      <div class="prose prose-lg max-w-none">
        <slot />
      </div>

      <!-- 路径导航（上一篇/下一篇） -->
      {containingPaths.map(p => {
        const nav = getNavigation(p);
        return (
          <div class="mt-12 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-500 mb-3">
              学习路径：<a href={`/zh/paths/${p.id}`} class="text-primary-600">{nav.pathTitle}</a>
            </p>
            <div class="flex justify-between">
              {nav.prev ? (
                <a href={`/zh/articles/${nav.prev.data.slug}`}
                   class="text-sm text-primary-600 hover:text-primary-800">
                  ← {nav.prev.data.title}
                </a>
              ) : <span />}
              {nav.next ? (
                <a href={`/zh/articles/${nav.next.data.slug}`}
                   class="text-sm text-primary-600 hover:text-primary-800">
                  {nav.next.data.title} →
                </a>
              ) : <span />}
            </div>
          </div>
        );
      })}
    </article>

    <!-- 右侧边栏 -->
    <aside class="hidden xl:block w-64 shrink-0">
      <div class="sticky top-24 space-y-6">
        <PrerequisiteHint prerequisites={prerequisites} allArticles={allArticles} />
        <ReferenceCard references={references} />
      </div>
    </aside>
  </div>
</BaseLayout>
```

- [ ] **Step 4: 创建文章动态路由页**

```astro
---
// src/pages/zh/articles/[slug].astro
import { getCollection } from 'astro:content';
import ArticleLayout from '../../../components/layout/ArticleLayout.astro';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map(article => ({
    params: { slug: article.data.slug },
    props: { article },
  }));
}

const { article } = Astro.props;
const { Content, headings } = await article.render();
---
<ArticleLayout
  title={article.data.title}
  slug={article.data.slug}
  difficulty={article.data.difficulty}
  tags={article.data.tags}
  prerequisites={article.data.prerequisites}
  references={article.data.references}
  updated={article.data.updated}
  headings={headings}
>
  <Content />
</ArticleLayout>
```

- [ ] **Step 5: 验证文章页渲染**

```bash
npx astro dev
```

Expected: 访问 `http://localhost:4321/zh/articles/transformer-overview` 可看到三栏布局文章页。

- [ ] **Step 6: 提交**

```bash
git add src/components/common/ src/components/layout/ArticleLayout.astro src/pages/zh/articles/
git commit -m "feat: add three-column article layout with TOC, references, and path navigation"
```

---

### Task 7: 学习路径页和资源推荐页

**Files:**
- Create: `src/pages/zh/paths/[id].astro`
- Create: `src/pages/zh/resources.astro`

- [ ] **Step 1: 创建学习路径页**

```astro
---
// src/pages/zh/paths/[id].astro
import BaseLayout from '../../../components/layout/BaseLayout.astro';
import { getAllPaths } from '../../../utils/paths';
import { getCollection } from 'astro:content';

export function getStaticPaths() {
  const paths = getAllPaths();
  return paths.map(p => ({
    params: { id: p.id },
    props: { learningPath: p },
  }));
}

const { learningPath } = Astro.props;
const allArticles = await getCollection('articles');

const pathArticles = learningPath.articles
  .map(slug => allArticles.find(a => a.data.slug === slug))
  .filter(Boolean);

const difficultyLabel: Record<string, string> = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
};

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
};
---
<BaseLayout title={learningPath.title.zh}>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-3">{learningPath.title.zh}</h1>
    <p class="text-gray-600 mb-8">{learningPath.description.zh}</p>

    <ol class="space-y-4">
      {pathArticles.map((article, index) => (
        <li>
          <a href={`/zh/articles/${article!.data.slug}`}
             class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-sm transition-all">
            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold shrink-0">
              {index + 1}
            </span>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold">{article!.data.title}</h3>
                <span class={`text-xs px-2 py-0.5 rounded ${difficultyColor[article!.data.difficulty]}`}>
                  {difficultyLabel[article!.data.difficulty]}
                </span>
              </div>
              <div class="flex gap-2">
                {article!.data.tags.map(tag => (
                  <span class="text-xs text-gray-500">#{tag}</span>
                ))}
              </div>
            </div>
          </a>
        </li>
      ))}
    </ol>
  </div>
</BaseLayout>
```

- [ ] **Step 2: 创建资源推荐页**

```astro
---
// src/pages/zh/resources.astro
import BaseLayout from '../../components/layout/BaseLayout.astro';
import { getAllResources } from '../../utils/resources';

const resources = getAllResources();

const typeLabel: Record<string, string> = {
  website: '网站',
  interactive: '交互式',
  video: '视频',
  paper: '论文',
  repo: '代码仓库',
};

const typeColor: Record<string, string> = {
  website: 'bg-blue-100 text-blue-800',
  interactive: 'bg-green-100 text-green-800',
  video: 'bg-red-100 text-red-800',
  paper: 'bg-yellow-100 text-yellow-800',
  repo: 'bg-gray-100 text-gray-800',
};
---
<BaseLayout title="资源推荐">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-3">外部学习资源</h1>
    <p class="text-gray-600 mb-8">
      精选的 Transformer / LLM 学习资源，涵盖文章、交互式工具、视频和论文。
    </p>

    <div class="space-y-4">
      {resources.map(resource => (
        <a href={resource.url} target="_blank" rel="noopener noreferrer"
           class="block p-5 border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-sm transition-all">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-semibold">{resource.title}</h3>
            <span class={`text-xs px-2 py-0.5 rounded ${typeColor[resource.type] || 'bg-gray-100'}`}>
              {typeLabel[resource.type] || resource.type}
            </span>
          </div>
          <p class="text-sm text-gray-500 mb-1">by {resource.author}</p>
          <p class="text-sm text-gray-700">{resource.description}</p>
          <div class="flex gap-2 mt-2">
            {resource.tags.map(tag => (
              <span class="text-xs text-gray-500">#{tag}</span>
            ))}
          </div>
        </a>
      ))}
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 3: 验证所有页面**

```bash
npx astro dev
```

Expected: 首页路径卡片点击进入路径页，路径页文章列表点击进入文章页，导航栏资源推荐链接工作。

- [ ] **Step 4: 提交**

```bash
git add src/pages/zh/paths/ src/pages/zh/resources.astro
git commit -m "feat: add learning path page and external resources page"
```

---

## Phase 4: 基础交互组件

### Task 8: StepNavigator 分步控制器

**Files:**
- Create: `src/components/primitives/StepNavigator.tsx`

- [ ] **Step 1: 实现 StepNavigator**

```tsx
// src/components/primitives/StepNavigator.tsx
import { useState, type ReactNode } from 'react';

interface StepNavigatorProps {
  steps: {
    title: string;
    content: ReactNode;
  }[];
  className?: string;
}

export default function StepNavigator({ steps, className = '' }: StepNavigatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 0));
  const goReset = () => setCurrentStep(0);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* 步骤指示器 */}
      <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
              i === currentStep
                ? 'bg-primary-600 text-white'
                : i < currentStep
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <span className="ml-3 text-sm text-gray-600 font-medium">
          {steps[currentStep].title}
        </span>
      </div>

      {/* 步骤内容 */}
      <div className="p-4">
        {steps[currentStep].content}
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={goReset}
          disabled={currentStep === 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
        >
          重置
        </button>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            上一步
          </button>
          <button
            onClick={goNext}
            disabled={currentStep === steps.length - 1}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-30"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/primitives/StepNavigator.tsx
git commit -m "feat: add StepNavigator primitive component for step-by-step animations"
```

---

### Task 9: MatrixGrid 矩阵网格组件

**Files:**
- Create: `src/components/primitives/MatrixGrid.tsx`

- [ ] **Step 1: 实现 MatrixGrid**

```tsx
// src/components/primitives/MatrixGrid.tsx
interface MatrixGridProps {
  data: number[][];
  label?: string;
  shape?: string; // 如 "(4, 3)" 显示在右下角
  highlightCells?: [number, number][]; // [row, col] 要高亮的单元格
  highlightRows?: number[];
  highlightCols?: number[];
  highlightColor?: string;
  rowLabels?: string[];
  colLabels?: string[];
  className?: string;
  compact?: boolean;
}

export default function MatrixGrid({
  data,
  label,
  shape,
  highlightCells = [],
  highlightRows = [],
  highlightCols = [],
  highlightColor = '#dbeafe',
  rowLabels,
  colLabels,
  className = '',
  compact = false,
}: MatrixGridProps) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  const isHighlighted = (r: number, c: number) =>
    highlightCells.some(([hr, hc]) => hr === r && hc === c) ||
    highlightRows.includes(r) ||
    highlightCols.includes(c);

  const cellSize = compact ? 'w-10 h-8 text-xs' : 'w-14 h-10 text-sm';

  return (
    <div className={`inline-block ${className}`}>
      {label && (
        <div className="text-sm font-semibold text-gray-700 mb-2">{label}</div>
      )}
      <div className="inline-flex flex-col">
        {/* 列标签 */}
        {colLabels && (
          <div className="flex" style={{ marginLeft: rowLabels ? '2rem' : 0 }}>
            {colLabels.map((cl, i) => (
              <div key={i} className={`${cellSize} flex items-end justify-center pb-1 text-xs text-gray-400`}>
                {cl}
              </div>
            ))}
          </div>
        )}

        {data.map((row, r) => (
          <div key={r} className="flex items-center">
            {/* 行标签 */}
            {rowLabels && (
              <div className="w-8 text-xs text-gray-400 text-right pr-2">
                {rowLabels[r]}
              </div>
            )}
            {row.map((val, c) => (
              <div
                key={c}
                className={`${cellSize} flex items-center justify-center border border-gray-200 font-mono`}
                style={{
                  backgroundColor: isHighlighted(r, c) ? highlightColor : 'white',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {typeof val === 'number' ? val.toFixed(val % 1 === 0 ? 0 : 2) : val}
              </div>
            ))}
          </div>
        ))}
      </div>

      {shape && (
        <div className="text-xs text-gray-400 mt-1 text-right">{shape}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/primitives/MatrixGrid.tsx
git commit -m "feat: add MatrixGrid primitive component for matrix visualization"
```

---

### Task 10: TensorShape 张量形状标注组件

**Files:**
- Create: `src/components/primitives/TensorShape.tsx`

- [ ] **Step 1: 实现 TensorShape**

```tsx
// src/components/primitives/TensorShape.tsx
interface TensorShapeProps {
  dims: { name: string; size: number | string }[];
  label?: string;
  className?: string;
}

export default function TensorShape({ dims, label, className = '' }: TensorShapeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-sm ${className}`}>
      {label && <span className="text-gray-600 mr-1">{label}:</span>}
      <span className="text-gray-500">(</span>
      {dims.map((dim, i) => (
        <span key={i} className="inline-flex items-center">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700"
            title={dim.name}
          >
            {dim.name}={dim.size}
          </span>
          {i < dims.length - 1 && <span className="text-gray-400 mx-0.5">,</span>}
        </span>
      ))}
      <span className="text-gray-500">)</span>
    </span>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/primitives/TensorShape.tsx
git commit -m "feat: add TensorShape primitive component for dimension annotation"
```

---

## Phase 5: 第一篇示范文章（端到端验证）

### Task 11: 编写 "Transformer 网络结构总览" 文章

**这是第一篇完整文章，用于端到端验证整个系统：MDX 渲染、KaTeX 公式、React 组件嵌入、三栏布局、路径导航全部跑通。**

**Files:**
- Modify: `src/content/articles/zh/transformer-overview.mdx` (替换占位内容)
- Create: `src/components/interactive/TransformerArchDiagram.tsx`

- [ ] **Step 1: 调研内容**

在编写前，必须搜索验证以下事实：
- 标准 Transformer Block 的组成顺序（Pre-LayerNorm vs Post-LayerNorm）
- GPT 系列（Decoder-only）与原始 Encoder-Decoder 的结构差异
- 典型超参数（如 GPT-2: H=768, L=12, A=12; LLaMA-7B: H=4096, L=32, A=32）

来源：原始论文 "Attention Is All You Need"，GPT-2 paper，LLaMA paper。

- [ ] **Step 2: 创建 Transformer 架构 SVG 图组件**

```tsx
// src/components/interactive/TransformerArchDiagram.tsx
// A级动画：静态架构图，展示单个 Transformer Block 的组成
// 显示：Input → LayerNorm → Self-Attention → Residual Add → LayerNorm → MLP → Residual Add → Output
// 每个模块标注张量形状变化

export default function TransformerArchDiagram() {
  const blocks = [
    { name: 'Input Embeddings', shape: '(B, S, H)', color: '#e0f2fe' },
    { name: 'Positional Encoding', shape: '(B, S, H)', color: '#e0f2fe' },
    { name: 'LayerNorm', shape: '(B, S, H)', color: '#fef3c7' },
    { name: 'Multi-Head\nSelf-Attention', shape: '(B, S, H)', color: '#dbeafe', highlight: true },
    { name: '+ Residual', shape: '(B, S, H)', color: '#f0fdf4' },
    { name: 'LayerNorm', shape: '(B, S, H)', color: '#fef3c7' },
    { name: 'Feed-Forward\n(MLP)', shape: '(B, S, 4H) → (B, S, H)', color: '#ede9fe', highlight: true },
    { name: '+ Residual', shape: '(B, S, H)', color: '#f0fdf4' },
  ];

  const blockHeight = 56;
  const blockWidth = 220;
  const gap = 8;
  const startY = 20;
  const centerX = 160;

  return (
    <div className="flex justify-center my-6">
      <svg
        viewBox={`0 0 380 ${blocks.length * (blockHeight + gap) + 60}`}
        className="max-w-md"
      >
        {/* 标题 */}
        <text x={centerX} y={12} textAnchor="middle" className="text-xs" fill="#6b7280">
          Single Transformer Block (Pre-LayerNorm)
        </text>

        {blocks.map((block, i) => {
          const y = startY + i * (blockHeight + gap);
          const x = centerX - blockWidth / 2;

          return (
            <g key={i}>
              {/* 连接线 */}
              {i > 0 && (
                <line
                  x1={centerX} y1={y - gap}
                  x2={centerX} y2={y}
                  stroke="#d1d5db" strokeWidth={1.5}
                  markerEnd="url(#arrowhead)"
                />
              )}

              {/* 模块块 */}
              <rect
                x={x} y={y}
                width={blockWidth} height={blockHeight}
                rx={6}
                fill={block.color}
                stroke={block.highlight ? '#3b82f6' : '#d1d5db'}
                strokeWidth={block.highlight ? 2 : 1}
              />

              {/* 模块名 */}
              {block.name.split('\n').map((line, li) => (
                <text
                  key={li}
                  x={centerX} y={y + 22 + li * 16}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={block.highlight ? 600 : 400}
                  fill="#1f2937"
                >
                  {line}
                </text>
              ))}

              {/* 张量形状 */}
              <text
                x={x + blockWidth + 8} y={y + blockHeight / 2 + 4}
                fontSize={10} fill="#9ca3af" fontFamily="monospace"
              >
                {block.shape}
              </text>
            </g>
          );
        })}

        {/* 箭头定义 */}
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#d1d5db" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: 编写完整文章内容**

将 `src/content/articles/zh/transformer-overview.mdx` 替换为完整内容。文章结构：

1. **简介**：Transformer 是什么，为什么重要
2. **直觉理解**：从 RNN 的序列瓶颈到并行化的 Attention
3. **架构总览**：嵌入 `<TransformerArchDiagram />` 组件
4. **各组件详解**：
   - Input Embedding + Positional Encoding
   - LayerNorm (Pre-LN vs Post-LN)
   - Self-Attention（概述，详细在后续文章）
   - Feed-Forward Network (MLP)：$FFN(x) = \text{GELU}(xW_1 + b_1)W_2 + b_2$
   - Residual Connection
5. **张量形状追踪**：使用 `<TensorShape />` 标注每一步的维度变化
6. **Encoder-Decoder vs Decoder-only**：架构对比
7. **典型模型超参数对比表**
8. **总结**

**重要**：所有技术细节必须经过搜索验证，references 中至少包含原始论文。

- [ ] **Step 4: 验证端到端渲染**

```bash
npx astro dev
```

Expected:
- 文章页：三栏布局正确，公式渲染正确，SVG 架构图显示，TOC 自动生成
- 首页：文章出现在列表中
- 路径页：文章出现在 Transformer 核心机制路径中
- 侧边栏：references 渲染为延伸阅读卡片

- [ ] **Step 5: 提交**

```bash
git add src/content/articles/zh/transformer-overview.mdx src/components/interactive/TransformerArchDiagram.tsx
git commit -m "content: add Transformer architecture overview article with arch diagram"
```

---

## Phase 6: 内容校验脚本

### Task 12: 构建时内容校验

**Files:**
- Create: `scripts/validate-content.ts`
- Modify: `package.json` (添加 validate 脚本)

- [ ] **Step 1: 实现校验脚本**

```typescript
// scripts/validate-content.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const ARTICLES_DIR = 'src/content/articles';
const PATHS_DIR = 'src/content/paths';

interface ValidationError {
  file: string;
  field: string;
  message: string;
}

const errors: ValidationError[] = [];
const warnings: string[] = [];

// 收集所有文章 slug
const articleSlugs = new Set<string>();
const allTags = new Map<string, string[]>(); // tag -> files using it

function validateArticles() {
  const zhDir = path.join(ARTICLES_DIR, 'zh');
  if (!fs.existsSync(zhDir)) return;

  const files = fs.readdirSync(zhDir).filter(f => f.endsWith('.mdx'));

  for (const file of files) {
    const filePath = path.join(zhDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    const requiredFields = ['title', 'slug', 'tags', 'difficulty', 'created', 'updated', 'references'];

    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push({ file: filePath, field, message: `Missing required field: ${field}` });
      }
    }

    if (data.slug) {
      if (articleSlugs.has(data.slug)) {
        errors.push({ file: filePath, field: 'slug', message: `Duplicate slug: ${data.slug}` });
      }
      articleSlugs.add(data.slug);
    }

    if (data.difficulty && !['beginner', 'intermediate', 'advanced'].includes(data.difficulty)) {
      errors.push({ file: filePath, field: 'difficulty', message: `Invalid difficulty: ${data.difficulty}` });
    }

    if (data.references && Array.isArray(data.references)) {
      for (const ref of data.references) {
        if (!ref.url || !ref.title || !ref.type) {
          errors.push({ file: filePath, field: 'references', message: 'Each reference must have type, title, and url' });
        }
        if (ref.url && !/^https?:\/\//.test(ref.url)) {
          errors.push({ file: filePath, field: 'references', message: `Invalid URL: ${ref.url}` });
        }
      }
    } else if (data.references !== undefined) {
      errors.push({ file: filePath, field: 'references', message: 'references must be an array with at least one entry' });
    }

    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        if (!allTags.has(tag)) allTags.set(tag, []);
        allTags.get(tag)!.push(filePath);
      }
    }
  }

  // 第二遍：检查 prerequisites 引用有效性
  for (const file of files) {
    const filePath = path.join(zhDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    if (data.prerequisites && Array.isArray(data.prerequisites)) {
      for (const prereq of data.prerequisites) {
        if (!articleSlugs.has(prereq)) {
          errors.push({ file: filePath, field: 'prerequisites', message: `Referenced slug not found: ${prereq}` });
        }
      }
    }
  }
}

function validatePaths() {
  if (!fs.existsSync(PATHS_DIR)) return;

  const files = fs.readdirSync(PATHS_DIR).filter(f => f.endsWith('.yaml'));

  for (const file of files) {
    const filePath = path.join(PATHS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = yaml.load(content) as any;

    if (!data.id || !data.title || !data.articles) {
      errors.push({ file: filePath, field: 'structure', message: 'Path must have id, title, and articles' });
      continue;
    }

    for (const slug of data.articles) {
      if (!articleSlugs.has(slug)) {
        warnings.push(`[${filePath}] Path references article slug "${slug}" which does not exist yet`);
      }
    }
  }
}

// Run
console.log('Validating content...\n');
validateArticles();
validatePaths();

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  for (const w of warnings) console.log(`   ${w}`);
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  for (const e of errors) {
    console.log(`   [${e.file}] ${e.field}: ${e.message}`);
  }
  console.log(`\n${errors.length} error(s) found.`);
  process.exit(1);
} else {
  console.log('✅ All content validation passed.');
}
```

- [ ] **Step 2: 安装依赖并添加 npm script**

```bash
npm install gray-matter
```

在 `package.json` 的 `scripts` 中添加：

```json
{
  "scripts": {
    "validate": "npx tsx scripts/validate-content.ts"
  }
}
```

- [ ] **Step 3: 运行校验验证**

```bash
npm run validate
```

Expected: 因为路径 YAML 中引用了尚不存在的文章 slug，应显示 warnings（不是 errors），校验通过。

- [ ] **Step 4: 提交**

```bash
git add scripts/validate-content.ts package.json
git commit -m "feat: add content validation script for frontmatter and path integrity"
```

---

## Phase 7: 剩余 7 篇文章

> **重要说明**：以下每篇文章都是一个独立的 Task，需要：
> 1. 先搜索调研验证技术事实
> 2. 编写 MDX 内容（遵循文章模板结构）
> 3. 如需 B 级动画，创建对应的 React 交互组件
> 4. 验证渲染效果
> 5. 提交
>
> 每篇文章的内容必须严格基于论文和权威来源，禁止猜测。下面列出每篇文章的要点和需要的组件。

### Task 13: QKV 的数据结构与直觉

**Files:**
- Create: `src/content/articles/zh/qkv-intuition.mdx`
- Create: `src/components/interactive/QKVLinearProjection.tsx` (B级: 分步展示输入如何通过线性层投影为 Q, K, V)

**内容要点（需调研验证）：**
- 直觉：Query-Key-Value 的图书馆检索类比
- 数据结构：输入 $X \in \mathbb{R}^{S \times H}$，权重矩阵 $W_Q, W_K, W_V \in \mathbb{R}^{H \times d_k}$
- 线性投影过程：$Q = XW_Q$, $K = XW_K$, $V = XW_V$
- 张量形状追踪：每一步的维度变化
- **References**: "Attention Is All You Need" (Vaswani et al., 2017)

**交互组件 QKVLinearProjection.tsx：**
- B级动画：使用 StepNavigator
- Step 1: 展示输入矩阵 X
- Step 2: 展示 W_Q 权重矩阵，高亮矩阵乘法
- Step 3: 结果 Q 矩阵出现
- Step 4: 同理 K
- Step 5: 同理 V
- 使用 MatrixGrid 组件渲染矩阵，用小规模数值举例（如 S=4, H=6, d_k=3）

- [ ] **Step 1: 调研并验证技术细节**
- [ ] **Step 2: 实现 QKVLinearProjection 交互组件**
- [ ] **Step 3: 编写完整 MDX 文章**
- [ ] **Step 4: 验证渲染**
- [ ] **Step 5: 提交**

---

### Task 14: Attention 计算详解

**Files:**
- Create: `src/content/articles/zh/attention-computation.mdx`
- Create: `src/components/interactive/AttentionStepAnimation.tsx` (B级: 逐步展示完整 Attention 计算)

**内容要点（需调研验证）：**
- 完整公式推导：$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$
- 分步拆解：
  1. $QK^T$：每个 query 与所有 key 的点积 → 得到 attention scores $(S \times S)$
  2. Scale by $\frac{1}{\sqrt{d_k}}$：为什么需要 scaling（防止 softmax 梯度消失）
  3. Mask（causal mask 用于 decoder）
  4. Softmax：逐行归一化
  5. 乘以 V：加权求和
- 矩阵分块计算：大矩阵如何分块处理
- **References**: "Attention Is All You Need", 相关数值稳定性分析

**交互组件 AttentionStepAnimation.tsx：**
- B级动画：6个步骤，每步展示矩阵运算和中间结果
- 使用 MatrixGrid 展示小规模例子（S=4, d_k=3）
- 每步高亮正在计算的行/列

- [ ] **Step 1: 调研并验证技术细节**
- [ ] **Step 2: 实现 AttentionStepAnimation 交互组件**
- [ ] **Step 3: 编写完整 MDX 文章**
- [ ] **Step 4: 验证渲染**
- [ ] **Step 5: 提交**

---

### Task 15: Multi-Head Attention

**Files:**
- Create: `src/content/articles/zh/multi-head-attention.mdx`

**内容要点（需调研验证）：**
- 为什么需要多头：单头只能关注一种关系模式，多头让不同头关注不同子空间
- 数学表达：$\text{MultiHead}(Q,K,V) = \text{Concat}(head_1, ..., head_h)W^O$
- 空间切分：$H = h \times d_k$，每头操作 $d_k = H/h$ 维子空间
- 张量形状：$(B, S, H) \to (B, h, S, d_k) \to$ attention $\to (B, S, H)$
- A级图：多头并行计算的结构示意图（SVG）
- **References**: "Attention Is All You Need"

- [ ] **Step 1: 调研并验证技术细节**
- [ ] **Step 2: 编写完整 MDX 文章（含 SVG 图）**
- [ ] **Step 3: 验证渲染**
- [ ] **Step 4: 提交**

---

### Task 16: MQA 与 GQA

**Files:**
- Create: `src/content/articles/zh/gqa-mqa.mdx`

**内容要点（需调研验证）：**
- MHA 的内存瓶颈：KV cache 随 head 数线性增长
- MQA (Multi-Query Attention)：所有 query head 共享同一组 KV → KV cache 缩小 $h$ 倍
- GQA (Grouped-Query Attention)：query head 分组，每组共享一组 KV → MHA 和 MQA 的折中
- 结构对比图（A级 SVG）：MHA vs MQA vs GQA 并列展示 head 和 KV 的对应关系
- 性能和质量的 trade-off
- **References**: "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints" (Ainslie et al., 2023), "Fast Transformer Decoding: One Write-Head is All You Need" (Shazeer, 2019)

- [ ] **Step 1: 调研并验证技术细节**
- [ ] **Step 2: 编写完整 MDX 文章（含结构对比 SVG）**
- [ ] **Step 3: 验证渲染**
- [ ] **Step 4: 提交**

---

### Task 17: Prefill vs Decode 阶段

**Files:**
- Create: `src/content/articles/zh/prefill-vs-decode.mdx`

**内容要点（需调研验证）：**
- LLM 推理的两个阶段
- Prefill（预填充）：处理完整 prompt，计算密集型（compute-bound），利用并行性
- Decode（解码）：自回归生成，每次一个 token，访存密集型（memory-bound）
- 为什么 decode 是瓶颈：每步只做 $(1 \times d)$ 的计算但需要加载完整 KV cache
- Arithmetic Intensity 分析：prefill vs decode 的 FLOPs/Byte 对比
- A级图：两阶段的计算流程对比
- **References**: 相关推理优化论文

- [ ] **Step 1: 调研并验证技术细节**
- [ ] **Step 2: 编写完整 MDX 文章（含对比图）**
- [ ] **Step 3: 验证渲染**
- [ ] **Step 4: 提交**

---

### Task 18: KV Cache 原理

**Files:**
- Create: `src/content/articles/zh/kv-cache.mdx`
- Create: `src/components/interactive/KVCacheDemo.tsx` (B级: 逐 token 展示缓存增长和复用过程)

**内容要点（需调研验证）：**
- 问题：无 cache 时 decode 每步需重算所有 KV → $O(N^2)$ 计算量
- KV Cache 机制：缓存已计算的 K, V 向量，每步只算新 token 的 K, V 并追加
- 内存占用：$2 \times L \times H \times S \times \text{dtype\_size}$（L=层数）
- Cache 管理：连续 batch、PagedAttention 概念（简要提及）
- **References**: 相关 KV cache 分析文章/论文

**交互组件 KVCacheDemo.tsx：**
- B级动画：模拟 5 个 token 的 decode 过程
- 每步展示：新 token 的 Q 与已缓存 K 的注意力计算，然后 K, V cache 增长一行
- 使用 MatrixGrid 高亮新增行

- [ ] **Step 1: 调研并验证技术细节**
- [ ] **Step 2: 实现 KVCacheDemo 交互组件**
- [ ] **Step 3: 编写完整 MDX 文章**
- [ ] **Step 4: 验证渲染**
- [ ] **Step 5: 提交**

---

### Task 19: Flash Attention 分块原理

**Files:**
- Create: `src/content/articles/zh/flash-attention.mdx`
- Create: `src/components/interactive/FlashAttentionTiling.tsx` (B级: 展示分块计算和 Online Softmax)

**内容要点（需调研验证）：**
- 问题：标准 Attention 需要 $O(N^2)$ 内存存储注意力矩阵
- GPU 内存层次：SRAM (on-chip, 快但小) vs HBM (off-chip, 大但慢)
- Tiling（分块）策略：将 Q, K, V 分成块，在 SRAM 中计算局部注意力
- Online Softmax：如何在只看到部分数据时正确计算 softmax
  - 关键公式：$m_{new} = \max(m_{old}, m_{block})$，然后修正已有的 softmax 部分和
- 内存从 $O(N^2)$ 降到 $O(N)$ 的推导
- Flash Attention v1 vs v2 的改进（简要）
- **References**: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness" (Dao et al., 2022), "FlashAttention-2" (Dao, 2023)

**交互组件 FlashAttentionTiling.tsx：**
- B级动画：展示 Q, K, V 被分成块后的处理流程
- Step 1: 展示完整 Q, K, V 矩阵和分块边界
- Step 2: 加载第一块 K, V 到 SRAM
- Step 3: 计算局部注意力分数
- Step 4: Online Softmax 更新
- Step 5: 加载第二块，重复
- Step 6: 最终结果合并
- 高亮当前在 SRAM 中的数据块

- [ ] **Step 1: 调研并验证技术细节（特别是 Online Softmax 公式）**
- [ ] **Step 2: 实现 FlashAttentionTiling 交互组件**
- [ ] **Step 3: 编写完整 MDX 文章**
- [ ] **Step 4: 验证渲染**
- [ ] **Step 5: 提交**

---

## Phase 8: 收尾

### Task 20: 最终校验与清理

**Files:**
- Modify: 各文件按需修复

- [ ] **Step 1: 运行内容校验**

```bash
npm run validate
```

Expected: 全部通过，无 errors。Warnings 应该也清零（所有路径引用的文章都已存在）。

- [ ] **Step 2: 完整构建测试**

```bash
npx astro build
```

Expected: 构建成功，无 TypeScript 或渲染错误。

- [ ] **Step 3: 全站浏览验证**

```bash
npx astro dev
```

手动检查：
- 首页：学习路径卡片 × 2，标签浏览，全部 8 篇文章
- 每条路径页：文章列表和编号正确
- 每篇文章页：三栏布局、公式渲染、交互组件工作、TOC、延伸阅读、路径导航（上一篇/下一篇）
- 资源推荐页：6 个外部资源展示

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: final validation and cleanup for V1"
```
