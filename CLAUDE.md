# LLM Learning 项目约定

## 项目概述
基于 Astro + MDX + React 的 LLM 技术知识库网站。设计文档见 `docs/superpowers/specs/2026-03-31-llm-learning-site-design.md`。

## 技术栈
- 框架：Astro 5 (Islands 架构)
- 内容：MDX (Markdown + JSX)
- 交互组件：React + Motion (原 Framer Motion, `import { motion } from 'motion/react'`)
- 公式：KaTeX (remark-math + rehype-katex)
- 可视化：D3.js + 自定义 SVG
- 样式：Tailwind CSS + @tailwindcss/typography
- 语言：TypeScript

## 目录结构
- `src/content/articles/zh/` — 中文文章 (MDX)
- `src/content/articles/en/` — 英文文章 (MDX)
- `src/content/paths/` — 学习路径定义 (YAML)
- `src/content/resources/` — 外部资源定义 (YAML)
- `src/components/primitives/` — 通用可复用基础组件 (MatrixGrid, StepNavigator, TensorShape)
- `src/components/interactive/` — 特定主题交互动画组件
- `src/components/layout/` — Astro 布局组件
- `src/components/common/` — 通用 UI 组件
- `src/i18n/` — 国际化翻译系统 (translations.ts, utils.ts)
- `src/pages/[locale]/` — 多语言页面路由（zh/en）
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
- **在 MDX 中使用组件时，必须在 frontmatter 下方 import，并加 `client:visible` 指令**：
  ```mdx
  import MyComponent from '../../../components/interactive/MyComponent.tsx';
  <MyComponent client:visible />
  ```
  不加 `client:visible`，组件的 React 交互逻辑（useState、onClick 等）不会工作。
- 纯展示型组件（无交互状态）可以不加 `client:` 指令
- 动画用 Motion (`import { motion } from 'motion/react'`)，数据可视化用 D3 或自定义 SVG

## 双语同步规则
- 修改文章内容时，如果对应语言版本存在，必须同步更新两个版本
- 修改 UI 组件（layout/common）时，确保使用 `t(locale, key)` 而非硬编码文字
- 新增 UI 字符串时，必须同时在 `src/i18n/translations.ts` 中添加 zh 和 en 两个 key
- 如果英文版文章尚未创建，在 commit message 中注明 "zh-only"

## 常用命令
- `npm run dev` — 启动开发服务器
- `npm run build` — 构建静态站点
- `npm run validate` — 运行内容校验
