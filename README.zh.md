🌐 **中文** | [English](README.md)

# LLM Learning

基于 Astro + MDX + React 构建的 LLM 技术知识库网站，以交互式可视化的方式讲解大语言模型核心概念。

> **注意：本项目的所有内容（文章、交互组件、可视化）均由 AI 生成。** 内容可能存在错误、不准确或过时之处。如果你发现任何问题，欢迎到 [GitHub Issues](https://github.com/jonathanding/llm-learning/issues) 反馈。

**在线访问**: [中文](https://jonathanding.github.io/llm-learning/zh/) | [English](https://jonathanding.github.io/llm-learning/en/)

## 技术栈

- **框架**: Astro 5 (Islands 架构)
- **内容**: MDX (Markdown + JSX)
- **交互组件**: React + Motion
- **数学公式**: KaTeX (remark-math + rehype-katex)
- **可视化**: D3.js + 自定义 SVG
- **样式**: Tailwind CSS + @tailwindcss/typography
- **语言**: TypeScript
- **部署**: GitHub Pages + GitHub Actions

## 内容

目前包含 59 篇中文文章（2 篇英文）、130+ 个交互式可视化组件，按 9 个学习路径组织。

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建静态站点
npm run build

# 内容校验
npm run validate
```

## 部署

Push 到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

## 目录结构

```
src/
├── content/articles/zh/   # 中文文章 (MDX)
├── content/articles/en/   # 英文文章 (MDX)
├── content/paths/          # 学习路径定义 (YAML)
├── content/resources/      # 外部资源 (YAML)
├── components/
│   ├── interactive/        # 交互式可视化组件
│   ├── primitives/         # 通用基础组件
│   ├── layout/             # 布局组件
│   └── common/             # 通用 UI 组件
├── i18n/                   # 国际化翻译
├── pages/[locale]/         # 多语言页面路由
└── styles/                 # 全局样式
```
