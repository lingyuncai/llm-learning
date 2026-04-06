# 文章翻译指南（中文 → 英文）

本指南面向执行翻译任务的 subagent，包含所有注意点和已知陷阱。

## 翻译一篇文章的完整流程

### Step 1: 创建英文 MDX 文件

复制 `src/content/articles/zh/<slug>.mdx` 到 `src/content/articles/en/<slug>.mdx`。

### Step 2: 修改 Frontmatter

```yaml
# 必须改的字段
locale: en          # zh → en
updated: "YYYY-MM-DD"  # 改为今天日期

# 保持不变的字段
title: "英文标题"    # 翻译标题
slug: xxx           # 保持与中文版完全相同的 slug！
tags: [...]         # 保持不变（tags 是英文）
difficulty: xxx     # 保持不变
created: "..."      # 保持不变
prerequisites: [...] # 保持不变（slug 引用）
references: [...]   # 保持不变（URL 和英文标题通常不需要翻译）
```

**关键：slug 必须与中文版完全一致。** 这是 i18n 路由和 Coming Soon 机制的核心。

### Step 3: 翻译正文

- 正文全部翻译为英文
- 技术术语保持英文原文（Transformer, Attention, KV Cache 等）
- 公式保持不变（`$...$` 和 `$$...$$`）
- 代码块保持不变
- 保持 MDX 的 heading 结构一致（h2, h3 层级对应）

### Step 4: 处理交互组件（最易出错的环节）

#### 4a. 检查组件是否已有 locale 支持

已支持 locale 的组件（可直接加 `locale="en"`）：
- CostQualityTriangle
- RoutingTaxonomyTree
- RoutingGranularityCompare
- AccuracyCostScatter
- LatencyOverheadBar
- ScenarioFitMatrix
- PaperTimeline
- TransformerArchDiagram
- AttentionMaskVisualization
- PrePostLNComparison
- PositionalEncodingComparison
- FFNBottleneck

对这些组件，只需在 en MDX 中加 `locale="en"`：
```mdx
<!-- 中文版 -->
<MyComponent client:visible />

<!-- 英文版 -->
<MyComponent client:visible locale="en" />
```

#### 4b. 组件没有 locale 支持

**绝大多数组件（287/299）还没有 locale 支持。** 如果文章用到了这些组件，你需要：

1. 打开组件源码（`src/components/interactive/<Name>.tsx`）
2. 搜索所有中文字符串
3. 添加 `locale?: 'zh' | 'en'` prop（默认 `'zh'`）
4. 创建 `t` 翻译对象：

```tsx
export default function MyComponent({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: { title: '中文标题', label: '标签' },
    en: { title: 'English Title', label: 'Label' },
  }[locale];

  return <h2>{t.title}</h2>;
}
```

5. 在 en MDX 中加 `locale="en"`

**注意：** 有些组件可能完全没有中文字符串（纯数据可视化），则不需要修改。先 grep 检查：
```bash
grep -P '[\x{4e00}-\x{9fff}]' src/components/interactive/ComponentName.tsx
```

#### 4c. TensorShape 组件特殊处理

`TensorShape` 通过 props 传入标签文字，不需要修改组件本身。直接在 MDX 中翻译 label：

```mdx
<!-- 中文版 -->
<TensorShape client:visible dims={[...]} label="输入" />

<!-- 英文版 -->
<TensorShape client:visible dims={[...]} label="Input" />
```

### Step 5: 验证

```bash
npm run build 2>&1 | tail -5    # 确保 build 通过
npm run validate                  # 确保内容校验通过
```

## 已知陷阱

### 陷阱 1: Astro 内容缓存

Astro 5 在 `node_modules/.astro/data-store.json` 持久化内容数据。新增 en 文章后**本地 build 可能看不到新文件**。

**解决方法：** 清除两个缓存目录：
```bash
rm -r .astro node_modules/.astro
npm run build
```

**注意：** CI/CD（GitHub Actions）每次从头构建，不受此影响。这只影响本地开发。

### 陷阱 2: Content Collection ID

`src/content.config.ts` 使用 `generateId: ({ data }) => \`${data.locale}/${data.slug}\`` 生成唯一 ID。如果 slug 不一致或 locale 字段缺失，会导致文章覆盖。

**确保每篇 en 文章的 frontmatter 必须有 `locale: en`。**

### 陷阱 3: 组件中文字符串

即使文章正文翻译了，交互组件内的中文标签不会自动翻译。必须显式检查每个组件。

**快速检查方法：**
```bash
# 列出文章用到的所有组件
grep "^import" src/content/articles/en/<slug>.mdx

# 检查每个组件是否有中文
grep -P '[\x{4e00}-\x{9fff}]' src/components/interactive/<Name>.tsx
```

### 陷阱 4: client:visible 指令

所有交互组件在 MDX 中必须有 `client:visible`（或其他 `client:*` 指令），否则 React 交互不工作。翻译时不要遗漏。

## 批量翻译的并行策略

按学习路径分组，每个学习路径可以分配一个 subagent。同一学习路径内的文章可能共享组件，所以放在一个 subagent 内处理避免冲突。

**可并行的条件：** 两个 subagent 修改的文件没有交集。

- 不同学习路径的 MDX 文件天然不冲突
- **组件文件是共享的**——如果两篇文章用到同一个组件且都需要加 locale 支持，必须串行处理

**推荐流程：**
1. 先扫描所有待翻译文章使用的组件
2. 批量给需要的组件加 locale 支持（一次性完成）
3. 然后按学习路径并行翻译 MDX 文件（此时组件已就绪，subagent 只需改 MDX）

## 翻译质量原则

- 技术准确性优先——不确定的术语保持英文原文
- 保持原文的信息密度和结构
- 公式、代码、URL 不翻译
- References 的 title 如果是英文论文标题，保持不变
- Heading 层级必须与中文版一致（SEO 和 TOC 依赖）

## Checklist（每篇文章）

- [ ] en MDX 文件创建于 `src/content/articles/en/<slug>.mdx`
- [ ] Frontmatter: `locale: en`, slug 与 zh 版一致
- [ ] 正文已翻译
- [ ] 所有交互组件已检查中文字符串
- [ ] 需要 locale 支持的组件已修改
- [ ] en MDX 中组件调用加了 `locale="en"`
- [ ] TensorShape 等 props 文字已翻译
- [ ] `npm run build` 通过
- [ ] `npm run validate` 通过
