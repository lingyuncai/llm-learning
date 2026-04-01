# LLM Learning

基于 Astro + MDX + React 构建的 LLM 技术知识库网站，以交互式可视化的方式讲解大语言模型核心概念。

## 技术栈

- **框架**: Astro 5 (Islands 架构)
- **内容**: MDX (Markdown + JSX)
- **交互组件**: React + Motion
- **数学公式**: KaTeX (remark-math + rehype-katex)
- **可视化**: D3.js + 自定义 SVG
- **样式**: Tailwind CSS + @tailwindcss/typography
- **语言**: TypeScript

## 内容

目前包含 8 篇中文文章，覆盖 Transformer 推理核心主题：

1. **Transformer 网络结构总览** — 整体架构与组件介绍
2. **QKV 的数据结构与直觉** — Query/Key/Value 的几何意义
3. **Attention 计算详解** — Scaled Dot-Product Attention 的完整推导
4. **Multi-Head Attention** — 多头注意力的并行计算结构
5. **MQA 与 GQA** — 多查询/分组查询注意力的优化策略
6. **KV Cache 原理** — 缓存机制与内存优化
7. **Prefill vs Decode** — 两阶段推理的计算特性分析
8. **Flash Attention** — 分块计算与 IO 感知优化

每篇文章包含交互式可视化组件、数学公式推导和参考文献。

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

## 目录结构

```
src/
├── content/articles/zh/   # 中文文章 (MDX)
├── content/paths/          # 学习路径定义 (YAML)
├── content/resources/      # 外部资源 (YAML)
├── components/
│   ├── interactive/        # 交互式可视化组件
│   ├── primitives/         # 通用基础组件
│   ├── layout/             # 布局组件
│   └── common/             # 通用 UI 组件
├── pages/zh/               # 中文页面路由
└── styles/                 # 全局样式
```
