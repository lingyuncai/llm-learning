# 文章翻译指南（中文 → 英文）

本指南面向执行翻译任务的 subagent，包含完整流程、已知陷阱和 review 标准。

## 核心安全原则

**绝不修改中文 MDX 文件。** 翻译任务只创建 en 文件和修改共享组件。修改组件时 `locale` prop 默认值必须为 `'zh'`，确保所有未传 locale 的中文文章行为不变。

---

## 翻译一篇文章的完整流程

### Step 1: 创建英文 MDX 文件

复制 `src/content/articles/zh/<slug>.mdx` 到 `src/content/articles/en/<slug>.mdx`。

### Step 2: 修改 Frontmatter

```yaml
# 必须修改
locale: en              # zh → en
title: "English Title"  # 翻译为英文
updated: "YYYY-MM-DD"   # 改为今天日期

# 必须保持不变
slug: xxx               # 与中文版完全相同！（i18n 路由的核心）
tags: [...]             # 保持不变（tags 本身是英文）
difficulty: xxx         # 保持不变
created: "..."          # 保持不变
prerequisites: [...]    # 保持不变（slug 引用）
references: [...]       # 保持不变（URL 和标题通常已是英文）
```

**slug 必须与中文版完全一致。** 否则 Coming Soon 机制和语言切换会断裂。

### Step 3: 翻译正文

- 正文全部翻译为地道英文
- 技术术语保持英文原文（Transformer, Attention, KV Cache 等）
- 公式保持不变（`$...$` 和 `$$...$$`）
- 代码块保持不变
- Heading 层级必须与中文版一致（h2, h3 对应）——TOC 和页面结构依赖
- import 语句保持不变（组件路径相同）

### Step 4: 处理交互组件

**这是最易出错的环节。** 每个组件都可能包含硬编码中文字符串。

#### 4a. 检查组件是否包含中文

```bash
# 列出文章用到的所有组件
grep "^import" src/content/articles/en/<slug>.mdx

# 逐个检查组件是否有中文字符
grep -P '[\x{4e00}-\x{9fff}]' src/components/interactive/<Name>.tsx
```

三种情况：

| 情况 | 组件有中文？ | 已有 locale prop？ | 操作 |
|------|-------------|-------------------|------|
| A | 无 | — | 无需任何修改，en MDX 中照常使用 |
| B | 有 | 已有 | en MDX 中加 `locale="en"` |
| C | 有 | 没有 | 先给组件加 locale 支持，再在 en MDX 中加 `locale="en"` |

#### 4b. 给组件加 locale 支持（情况 C）

```tsx
// 1. 添加 locale prop，默认 'zh'（保护中文不受影响）
export default function MyComponent({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  // 2. 创建翻译对象
  const t = {
    zh: { title: '中文标题', label: '标签' },
    en: { title: 'English Title', label: 'Label' },
  }[locale];

  // 3. 使用 t.xxx 替换所有硬编码字符串
  return <h2>{t.title}</h2>;
}
```

**关键约束：**
- `locale` 参数的默认值**必须**是 `'zh'`。所有中文 MDX 不传 locale，靠默认值保证行为不变。
- 不要改变组件的视觉布局、样式或交互行为，只替换文字。
- 如果组件有 data 数组包含中文（如 timeline items、表格数据），改为 locale-based 工厂函数。

#### 4c. TensorShape / StepNavigator 等 props 传入文字的组件

这些组件通过 props 接收标签，不需要修改组件本身。直接在 en MDX 中翻译 prop 值：

```mdx
<!-- 中文版 -->
<TensorShape client:visible dims={[...]} label="输入" />

<!-- 英文版 -->
<TensorShape client:visible dims={[...]} label="Input" />
```

#### 4d. en MDX 中添加 locale="en"

对所有包含中文且已有（或刚加了）locale 支持的组件：

```mdx
<MyComponent client:visible locale="en" />
```

**不要遗漏 `client:visible`**——没有它 React 交互不工作。

### Step 5: 验证

```bash
npm run build 2>&1 | tail -5    # 确保 build 通过
npm run validate                  # 确保内容校验通过
```

### Step 6: Commit

```bash
git add src/content/articles/en/<slug>.mdx
# 如果修改了组件，也要 add
git add src/components/interactive/<Name>.tsx
git commit -m "feat(i18n): add English translation for <slug>"
```

---

## Review 标准

翻译完成后，按以下标准 review：

### 1. 中文回归检查（最重要）

```bash
# 确认没有修改任何中文 MDX 文件
git diff --name-only | grep "articles/zh/" && echo "❌ 中文文件被修改！" || echo "✅ 中文文件未动"

# 确认修改的组件默认值是 'zh'
grep "locale = " src/components/interactive/<modified>.tsx
# 每个都应该是 locale = 'zh'
```

- 所有修改过的组件：`locale` prop 默认值必须是 `'zh'`
- build 后抽查 2-3 个中文文章页面，确认渲染正常（文字没变英文）

### 2. 翻译完整性检查

- [ ] en MDX frontmatter：`locale: en` 存在，`slug` 与 zh 版一致
- [ ] 正文翻译完整——没有遗留的中文段落
- [ ] Heading 结构与 zh 版一致（h2/h3 层级对应）
- [ ] import 语句完整（与 zh 版组件列表一致）

### 3. 组件国际化检查

```bash
# 列出 en 文章使用的所有组件
grep "^import" src/content/articles/en/<slug>.mdx

# 对每个组件，检查是否还有中文残留
grep -P '[\x{4e00}-\x{9fff}]' src/components/interactive/<Name>.tsx
# 如果有输出，说明中文字符串没有被 locale 化——只要这些字符串在 t.zh 对象里就是正确的
# 如果中文字符串出现在 t/labels 对象之外，则是遗漏

# 检查 en MDX 中是否对有中文的组件传了 locale="en"
grep "client:visible" src/content/articles/en/<slug>.mdx
# 有中文的组件必须有 locale="en"
```

### 4. Build 验证

```bash
npm run build 2>&1 | tail -5    # 页数应增加（每篇新 en 文章 +1 页）
npm run validate                  # 内容校验通过
```

### 5. 翻译质量抽查

- 技术术语是否准确（对照原文关键概念）
- 公式、代码块是否保持不变
- 链接和 references 是否完整

---

## 已知陷阱

### 陷阱 1: Astro 内容缓存（仅本地开发）

Astro 5 在两个位置持久化内容数据：
- `.astro/` （项目根目录）
- `node_modules/.astro/data-store.json`

新增 en 文章后**本地 build 可能看不到新文件**。

**解决方法：**
```bash
rm -r .astro node_modules/.astro
npm run build
```

**CI/CD 不受影响**（每次从头构建）。

### 陷阱 2: Content Collection ID 冲突

`src/content.config.ts` 使用 `generateId: ({ data }) => \`${data.locale}/${data.slug}\`` 生成唯一 ID。

**如果 frontmatter 缺少 `locale: en`，默认值是 `'zh'`，会与中文版 ID 冲突，导致中文文章被覆盖！**

### 陷阱 3: 组件中文残留

即使正文翻译了，交互组件内的硬编码中文不会自动翻译。必须显式检查每个组件并传 `locale="en"`。

### 陷阱 4: 组件修改破坏中文版

给组件加 `locale` prop 时，如果：
- 忘记设默认值 `'zh'` → 中文版可能看到 undefined 错误
- 重构了翻译对象但拼错了 zh 的值 → 中文版文字显示错误
- 删除或重命名了现有 props → 中文 MDX 调用处报错

**防范：** locale prop 必须是 optional 且默认 `'zh'`。不删除任何现有 prop。

---

## 批量翻译的并行策略

### 两阶段执行

**阶段 1：组件国际化（串行，一次性完成）**

1. 扫描所有 57 篇待翻译文章使用的组件
2. 识别包含中文字符串且尚未有 locale 支持的组件
3. 批量给这些组件加 locale 支持
4. Build 验证 + 中文回归测试
5. Commit

**阶段 2：MDX 翻译（可并行）**

组件已就绪后，每个 subagent 只需要：
- 创建 en MDX 文件
- 翻译正文
- 在组件调用处加 `locale="en"`
- **不需要修改任何 .tsx 组件文件**

### 并行分组

按学习路径分组，每个 subagent 负责一个路径：

```
subagent-1: transformer-core (15 articles)
subagent-2: quantization (5 articles)
subagent-3: inference-engineering (5 articles)
...
```

**并行安全的前提：**
- 阶段 1 已完成（所有组件已有 locale 支持）
- 每个 subagent 只创建 `src/content/articles/en/` 下的新文件
- 每个 subagent 不修改任何 .tsx / .astro / zh/ 下的文件
- 每个 subagent 使用 git worktree 隔离工作区，避免 build 冲突

### 如果阶段 1 不完整

如果某篇文章用到了阶段 1 遗漏的组件（仍有中文且无 locale 支持），该 subagent 必须：
1. 停止翻译
2. 报告 NEEDS_CONTEXT：列出需要 locale 化的组件
3. 由控制器统一处理组件修改后，再恢复翻译

**绝不允许 subagent 在并行阶段修改共享组件文件**——这会产生 git 冲突。

---

## 翻译质量原则

- 技术准确性优先——不确定的术语保持英文原文
- 保持原文的信息密度和结构，不增不减
- 公式、代码、URL 不翻译
- References 的 title 如果是英文论文标题，保持不变
- Heading 层级必须与中文版一致（SEO 和 TOC 依赖）

---

## 已支持 locale 的组件清单

截至 2026-04-06，以下 12 个组件已有 `locale?: 'zh' | 'en'` prop：

```
src/components/interactive/CostQualityTriangle.tsx
src/components/interactive/RoutingTaxonomyTree.tsx
src/components/interactive/RoutingGranularityCompare.tsx
src/components/interactive/AccuracyCostScatter.tsx
src/components/interactive/LatencyOverheadBar.tsx
src/components/interactive/ScenarioFitMatrix.tsx
src/components/interactive/PaperTimeline.tsx
src/components/interactive/TransformerArchDiagram.tsx
src/components/interactive/AttentionMaskVisualization.tsx
src/components/interactive/PrePostLNComparison.tsx
src/components/interactive/PositionalEncodingComparison.tsx
src/components/interactive/FFNBottleneck.tsx
```

其余 287 个 interactive + 3 个 primitives 组件尚未支持。翻译新文章前需检查。

---

## Checklist（每篇文章）

### 翻译者
- [ ] en MDX 文件创建于 `src/content/articles/en/<slug>.mdx`
- [ ] Frontmatter: `locale: en`，slug 与 zh 版一致，title 已翻译
- [ ] 正文已完整翻译，无中文残留段落
- [ ] 所有交互组件已检查中文字符串
- [ ] 有中文的组件在 en MDX 中传了 `locale="en"`
- [ ] TensorShape 等 props 文字已翻译
- [ ] `npm run build` 通过

### Reviewer
- [ ] 中文 MDX 文件未被修改
- [ ] 修改的组件 locale 默认值为 `'zh'`
- [ ] 抽查 zh 文章页面渲染正常
- [ ] en 文章 heading 结构与 zh 版一致
- [ ] 组件无中文残留（在 t/labels 对象外）
- [ ] `npm run build` 页数正确（+N 页）
- [ ] `npm run validate` 通过
