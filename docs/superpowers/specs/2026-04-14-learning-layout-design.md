# 首页布局优化与全局搜索设计

**日期**: 2026-04-14
**状态**: Draft

## 概述

随着内容增长（11 条学习路径、数十篇文章），首页需要优化信息密度和内容发现能力。本设计覆盖三个独立改动：学习路径排序、网格布局优化、全局搜索功能。

## 一、学习路径排序

### 变更

给每条学习路径 YAML 新增 `order: number` 字段，首页按 `order` 升序排列。TypeScript 接口 `LearningPath`（`src/utils/paths.ts`）同步增加该字段。

### 排序方案

按主题关联性分四个梯队：

| order | 路径 ID | 标题 | 梯队 |
|-------|---------|------|------|
| 1 | transformer-core | Transformer Core Mechanisms | 基础理论 |
| 2 | transformer-across-modalities | Transformer Across Modalities | 基础理论 |
| 3 | quantization | LLM Quantization Techniques | 推理部署 |
| 4 | inference-engineering | LLM Inference Engineering | 推理部署 |
| 5 | inference-serving | vLLM + SGLang Inference Engine Deep Dive | 推理部署 |
| 6 | model-routing | LLM Model Routing | 推理部署 |
| 7 | ollama-internals | Ollama + llama.cpp Deep Dive | 推理部署 |
| 8 | ai-compute-stack | AI Compute Stack | 硬件系统 |
| 9 | graph-compilation-optimization | Graph Compilation & Optimization | 硬件系统 |
| 10 | reinforcement-learning | Reinforcement Learning | 训练方法 |
| 11 | intel-igpu-inference | Intel iGPU Inference Deep Dive | 特定硬件 |

### 涉及文件

- `src/content/paths/*.yaml`：每个文件新增 `order` 字段
- `src/utils/paths.ts`：`LearningPath` 接口新增 `order: number`
- `src/pages/[locale]/index.astro`：加载路径后按 `order` 排序

## 二、网格布局优化

### 变更

首页学习路径卡片网格从 `grid-cols-1 md:grid-cols-2` 改为响应式三档：

```
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

- 手机（<768px）：1 列
- 中屏（≥768px）：2 列
- 大屏（≥1024px）：3 列

卡片内容保持不变：标题、难度标签、描述文本、文章数量。

### 涉及文件

- `src/pages/[locale]/index.astro`：修改网格 class

## 三、全局搜索

### 入口

顶部导航栏（`Navigation.astro`）右侧新增搜索图标（放大镜 icon），点击弹出搜索面板（overlay 遮罩层）。支持 `Ctrl+K`（Windows/Linux）/ `Cmd+K`（macOS）快捷键唤起。

### 搜索实现

- **数据来源**：`Navigation.astro` 在 frontmatter 中直接调用 `getCollection('articles')` + `getAllPaths()` 获取数据。Tags 列表从文章集合中提取去重得到（与 `index.astro` 中 `allTags` 逻辑一致）。构造搜索数据后通过 props 传给 React 搜索组件
- **Hydration**：SearchDialog 必须使用 `client:load`（不是 `client:visible`），因为需要在页面加载后立即注册 `Ctrl+K` 全局键盘监听器
- **搜索引擎**：客户端使用 Fuse.js 进行模糊匹配
- **语言范围**：只搜索当前 locale 的内容

### 面板交互

- 输入即搜，实时过滤，无需按回车
- 上下箭头键在候选项之间移动，默认选中第一条结果
- 回车跳转到当前选中项
- 关闭方式：Esc 键、点击遮罩区域

### 结果展示

分三组展示，每组带图标区分：

1. 📚 **学习路径**——全部展示匹配结果，匹配范围：路径标题。点击跳转到路径页面。
2. 🏷️ **Tags**——全部展示匹配结果，匹配范围：tag 名称。点击跳转到对应 tag 页面。
3. 📄 **文章**——最多展示 10 条，匹配范围：文章标题和 tags。点击跳转到文章页面。

无匹配结果时显示空状态提示文字。

### 新增组件

- `src/components/common/SearchDialog.tsx`：React 搜索面板组件（含输入框、结果列表、键盘导航逻辑）。搜索按钮（放大镜图标）直接内联在 `Navigation.astro` 中，不单独建组件

### 涉及文件

- `src/components/layout/Navigation.astro`：新增搜索按钮，在 frontmatter 中获取搜索数据并传递给 React 组件
- `src/components/common/SearchDialog.tsx`：新建
- `src/i18n/translations.ts`：新增搜索相关 i18n key（placeholder、空状态文案等）
- `package.json`：新增 `fuse.js` 依赖

## 新增依赖

- `fuse.js`：轻量级客户端模糊搜索库（~5KB gzip）
