# 首页布局优化与全局搜索 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化首页学习路径的排序和布局密度，并为全站添加模糊搜索功能。

**Architecture:** 三个独立模块——(1) 学习路径 YAML 新增 `order` 字段并排序展示；(2) 首页网格从 2 列改为响应式 1/2/3 列；(3) 导航栏新增搜索按钮，弹出 React 搜索面板，使用 Fuse.js 客户端模糊匹配，结果分学习路径/Tags/文章三组展示。

**Tech Stack:** Astro 5, React, TypeScript, Tailwind CSS, Fuse.js

**Spec:** `docs/superpowers/specs/2026-04-14-learning-layout-design.md`

---

## File Structure

**修改:**
- `src/content/paths/*.yaml`（11 个文件）— 每个新增 `order` 字段
- `src/utils/paths.ts` — `LearningPath` 接口新增 `order`，`getAllPaths()` 返回按 order 排序的结果
- `src/pages/[locale]/index.astro` — 网格 class 改为 3 列响应式
- `src/components/layout/Navigation.astro` — 新增搜索按钮 + 获取搜索数据 + 渲染 SearchDialog
- `src/i18n/translations.ts` — 新增搜索相关 i18n key
- `package.json` — 新增 `fuse.js` 依赖

**新建:**
- `src/components/common/SearchDialog.tsx` — React 搜索面板组件

---

## Task 1: 学习路径排序 — YAML + TypeScript 接口

**Files:**
- Modify: `src/content/paths/transformer-core.yaml` (+ 其余 10 个 YAML)
- Modify: `src/utils/paths.ts`

- [ ] **Step 1: 给 11 个 YAML 文件添加 `order` 字段**

在每个 YAML 文件的 `id:` 行下方添加 `order:` 字段（放在 `title:` 之前）：

| 文件 | order |
|------|-------|
| `transformer-core.yaml` | `order: 1` |
| `transformer-across-modalities.yaml` | `order: 2` |
| `quantization.yaml` | `order: 3` |
| `inference-engineering.yaml` | `order: 4` |
| `inference-serving.yaml` | `order: 5` |
| `model-routing.yaml` | `order: 6` |
| `ollama-internals.yaml` | `order: 7` |
| `ai-compute-stack.yaml` | `order: 8` |
| `graph-compilation-optimization.yaml` | `order: 9` |
| `reinforcement-learning.yaml` | `order: 10` |
| `intel-igpu-inference.yaml` | `order: 11` |

示例（`transformer-core.yaml`）：
```yaml
id: transformer-core
order: 1
title:
  zh: "Transformer 核心机制"
  en: "Transformer Core Mechanisms"
```

- [ ] **Step 2: 更新 `LearningPath` 接口并在 `getAllPaths()` 中排序**

修改 `src/utils/paths.ts`：

```typescript
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface LearningPath {
  id: string;
  order: number;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  level: 'beginner' | 'intermediate' | 'advanced';
  articles: string[];
}

const PATHS_DIR = path.join(process.cwd(), 'src/content/paths');

export function getAllPaths(): LearningPath[] {
  const pathsDir = PATHS_DIR;
  const files = fs.readdirSync(pathsDir).filter(f => f.endsWith('.yaml'));
  const paths = files.map(file => {
    const content = fs.readFileSync(path.join(pathsDir, file), 'utf-8');
    return yaml.load(content) as LearningPath;
  });
  return paths.sort((a, b) => a.order - b.order);
}

export function getPathById(id: string): LearningPath | undefined {
  return getAllPaths().find(p => p.id === id);
}
```

- [ ] **Step 3: 验证构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 4: Commit**

```bash
git add src/content/paths/*.yaml src/utils/paths.ts
git commit -m "feat: add order field to learning paths and sort by order"
```

---

## Task 2: 首页网格布局优化

**Files:**
- Modify: `src/pages/[locale]/index.astro:40`

- [ ] **Step 1: 修改网格 class**

在 `src/pages/[locale]/index.astro` 第 40 行，将：

```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
```

改为：

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

- [ ] **Step 2: 启动 dev server 验证**

Run: `npm run dev`

验证：
1. 窗口 ≥1024px 时显示 3 列
2. 768px–1023px 显示 2 列
3. <768px 显示 1 列
4. 卡片内容（标题、难度标签、描述、文章数）完整显示

- [ ] **Step 3: Commit**

```bash
git add src/pages/[locale]/index.astro
git commit -m "feat: responsive 3-column grid for learning path cards"
```

---

## Task 3: 安装 Fuse.js + 添加搜索 i18n key

**Files:**
- Modify: `package.json`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: 安装 fuse.js**

Run: `npm install fuse.js`

- [ ] **Step 2: 添加搜索相关 i18n key**

在 `src/i18n/translations.ts` 的 `zh` 和 `en` 对象中分别添加：

zh 部分（在 `coming_soon_link` 之后）：
```typescript
    // Search
    search_placeholder: '搜索学习路径、文章、标签...',
    search_no_results: '没有找到匹配的结果',
    search_group_paths: '学习路径',
    search_group_tags: '标签',
    search_group_articles: '文章',
    search_shortcut: '搜索',
```

en 部分（在 `coming_soon_link` 之后）：
```typescript
    // Search
    search_placeholder: 'Search paths, articles, tags...',
    search_no_results: 'No matching results found',
    search_group_paths: 'Learning Paths',
    search_group_tags: 'Tags',
    search_group_articles: 'Articles',
    search_shortcut: 'Search',
```

- [ ] **Step 3: 验证构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/i18n/translations.ts
git commit -m "feat: install fuse.js and add search i18n keys"
```

---

## Task 4: 创建 SearchDialog React 组件

**Files:**
- Create: `src/components/common/SearchDialog.tsx`

- [ ] **Step 1: 创建 SearchDialog.tsx**

创建 `src/components/common/SearchDialog.tsx`，完整代码如下：

```tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

// --- Types ---

interface PathItem {
  type: 'path';
  id: string;
  title: string;
  url: string;
}

interface TagItem {
  type: 'tag';
  name: string;
  url: string;
}

interface ArticleItem {
  type: 'article';
  slug: string;
  title: string;
  tags: string[];
  url: string;
}

type SearchItem = PathItem | TagItem | ArticleItem;

interface SearchData {
  paths: PathItem[];
  tags: TagItem[];
  articles: ArticleItem[];
}

interface Translations {
  search_placeholder: string;
  search_no_results: string;
  search_group_paths: string;
  search_group_tags: string;
  search_group_articles: string;
}

interface Props {
  data: SearchData;
  translations: Translations;
}

// --- Constants ---

const MAX_ARTICLES = 10;

// --- Component ---

export default function SearchDialog({ data, translations }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build Fuse instances once
  const fusePaths = useMemo(
    () => new Fuse(data.paths, { keys: ['title'], threshold: 0.4 }),
    [data.paths]
  );
  const fuseTags = useMemo(
    () => new Fuse(data.tags, { keys: ['name'], threshold: 0.4 }),
    [data.tags]
  );
  const fuseArticles = useMemo(
    () => new Fuse(data.articles, { keys: ['title', 'tags'], threshold: 0.4 }),
    [data.articles]
  );

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return { paths: [], tags: [], articles: [], flat: [] };

    const paths = fusePaths.search(query).map(r => r.item);
    const tags = fuseTags.search(query).map(r => r.item);
    const articles = fuseArticles.search(query).map(r => r.item).slice(0, MAX_ARTICLES);

    const flat: SearchItem[] = [
      ...paths,
      ...tags,
      ...articles,
    ];

    return { paths, tags, articles, flat };
  }, [query, fusePaths, fuseTags, fuseArticles]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.flat.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-search-item]');
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    }
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Navigate to selected item
  const navigateTo = useCallback((item: SearchItem) => {
    window.location.href = item.url;
  }, []);

  // Dialog keyboard navigation
  function handleDialogKey(e: React.KeyboardEvent) {
    const total = results.flat.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(total, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + Math.max(total, 1)) % Math.max(total, 1));
    } else if (e.key === 'Enter' && total > 0) {
      e.preventDefault();
      navigateTo(results.flat[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  // Render a result group
  function renderGroup(
    icon: string,
    label: string,
    items: SearchItem[],
    startIndex: number
  ) {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {icon} {label}
        </div>
        {items.map((item, i) => {
          const globalIndex = startIndex + i;
          const isSelected = globalIndex === selectedIndex;
          const title = item.type === 'tag' ? item.name : item.title;
          return (
            <a
              key={item.type === 'tag' ? item.name : item.type === 'path' ? item.id : item.slug}
              href={item.url}
              data-search-item
              className={`block px-3 py-2 text-sm cursor-pointer ${
                isSelected
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onMouseEnter={() => setSelectedIndex(globalIndex)}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(item);
              }}
            >
              {title}
              {item.type === 'article' && item.tags.length > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                  {item.tags.map(t => `#${t}`).join(' ')}
                </span>
              )}
            </a>
          );
        })}
      </div>
    );
  }

  if (!isOpen) return null;

  const hasResults = results.flat.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={() => setIsOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleDialogKey}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-gray-200 px-3">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={translations.search_placeholder}
            className="w-full px-3 py-3 text-sm outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {hasQuery && !hasResults && (
            <div className="px-3 py-8 text-center text-sm text-gray-500">
              {translations.search_no_results}
            </div>
          )}

          {hasResults && (
            <>
              {renderGroup('📚', translations.search_group_paths, results.paths, 0)}
              {renderGroup('🏷️', translations.search_group_tags, results.tags, results.paths.length)}
              {renderGroup('📄', translations.search_group_articles, results.articles, results.paths.length + results.tags.length)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证构建**

Run: `npm run build`
Expected: 构建成功（组件尚未被引用，但 TypeScript 编译应通过）

- [ ] **Step 3: Commit**

```bash
git add src/components/common/SearchDialog.tsx
git commit -m "feat: create SearchDialog React component with Fuse.js"
```

---

## Task 5: 集成搜索到 Navigation

**Files:**
- Modify: `src/components/layout/Navigation.astro`

- [ ] **Step 1: 修改 Navigation.astro**

将 `src/components/layout/Navigation.astro` 替换为以下完整内容：

```astro
---
import { t, getOtherLocale, type Locale } from '../../i18n/utils';
import { getCollection } from 'astro:content';
import { getAllPaths } from '../../utils/paths';
import SearchDialog from '../common/SearchDialog.tsx';

interface Props {
  locale?: Locale;
  currentPath?: string;
}

const { locale = 'zh', currentPath = '' } = Astro.props;
const otherLocale = getOtherLocale(locale);

const switchPath = currentPath
  ? currentPath.replace(`/${locale}/`, `/${otherLocale}/`)
  : `${import.meta.env.BASE_URL}${otherLocale}/`;

// Prepare search data
const allPaths = getAllPaths();
const allArticles = await getCollection('articles');
const localeArticles = allArticles.filter(a => a.data.locale === locale);
const allTags = [...new Set(localeArticles.flatMap(a => a.data.tags))].sort();

const searchData = {
  paths: allPaths.map(p => ({
    type: 'path' as const,
    id: p.id,
    title: p.title[locale],
    url: `${import.meta.env.BASE_URL}${locale}/paths/${p.id}`,
  })),
  tags: allTags.map(tag => ({
    type: 'tag' as const,
    name: tag,
    url: `${import.meta.env.BASE_URL}${locale}/tags/${tag}`,
  })),
  articles: localeArticles.map(a => ({
    type: 'article' as const,
    slug: a.data.slug,
    title: a.data.title,
    tags: a.data.tags,
    url: `${import.meta.env.BASE_URL}${locale}/articles/${a.data.slug}`,
  })),
};

const searchTranslations = {
  search_placeholder: t(locale, 'search_placeholder'),
  search_no_results: t(locale, 'search_no_results'),
  search_group_paths: t(locale, 'search_group_paths'),
  search_group_tags: t(locale, 'search_group_tags'),
  search_group_articles: t(locale, 'search_group_articles'),
};
---
<nav class="border-b border-gray-200 bg-white sticky top-0 z-50">
  <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <a href={`${import.meta.env.BASE_URL}${locale}/`} class="text-xl font-bold text-gray-900">
        LLM Learning
      </a>
      <div class="flex items-center gap-6">
        <a href={`${import.meta.env.BASE_URL}${locale}/`} class="text-sm text-gray-600 hover:text-gray-900">
          {t(locale, 'nav_home')}
        </a>
        <a href={`${import.meta.env.BASE_URL}${locale}/resources`} class="text-sm text-gray-600 hover:text-gray-900">
          {t(locale, 'nav_resources')}
        </a>
        <button
          id="search-trigger"
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          aria-label={t(locale, 'search_shortcut')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
            Ctrl K
          </kbd>
        </button>
        <span class="text-sm">
          {locale === 'zh' ? (
            <>
              <span class="font-medium text-gray-900">中文</span>
              <span class="text-gray-400 mx-1">/</span>
              <a href={switchPath} class="text-gray-500 hover:text-gray-900">EN</a>
            </>
          ) : (
            <>
              <a href={switchPath} class="text-gray-500 hover:text-gray-900">中文</a>
              <span class="text-gray-400 mx-1">/</span>
              <span class="font-medium text-gray-900">EN</span>
            </>
          )}
        </span>
      </div>
    </div>
  </div>
</nav>

<SearchDialog client:load data={searchData} translations={searchTranslations} />

<script>
  // Wire up the search trigger button to open the dialog
  // The SearchDialog listens for Ctrl+K globally, but we also need the button click
  document.getElementById('search-trigger')?.addEventListener('click', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  });
</script>
```

注意要点：
- `SearchDialog` 使用 `client:load`（不是 `client:visible`），确保 `Ctrl+K` 快捷键立即可用
- 搜索按钮通过 dispatch 一个 `Ctrl+K` KeyboardEvent 来触发 SearchDialog 打开
- 搜索数据在 Astro 构建时准备好，通过 props 传给 React 组件

- [ ] **Step 2: 验证构建**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navigation.astro
git commit -m "feat: integrate search into navigation bar"
```

---

## Task 6: 端到端验证

**Files:** 无新改动，纯验证

- [ ] **Step 1: 构建验证**

Run: `npm run build`
Expected: 构建成功，无错误和警告

- [ ] **Step 2: 启动 dev server 并手动验证**

Run: `npm run dev`

逐项验证：

**学习路径排序：**
- 首页学习路径按梯队顺序排列：Transformer Core → Transformer Across Modalities → Quantization → ... → Intel iGPU
- 第一个卡片是 Transformer Core，最后一个是 Intel iGPU

**网格布局：**
- 浏览器窗口 ≥1024px：3 列
- 768px–1023px：2 列
- <768px：1 列
- 卡片内容完整无截断

**搜索功能：**
- 导航栏右侧可见搜索图标和 `Ctrl K` 快捷键提示
- 点击搜索图标弹出搜索面板
- `Ctrl+K`（或 macOS 上 `Cmd+K`）可唤起/关闭面板
- 输入 "transformer" 应匹配到学习路径（Transformer Core、Transformer Across Modalities）和相关文章
- 输入 "attention" 应匹配到相关文章和 tag
- 结果分三组显示：📚 学习路径 → 🏷️ 标签 → 📄 文章
- 上下键移动高亮选项，回车跳转
- 鼠标 hover 切换高亮，点击跳转
- Esc 或点击遮罩关闭面板
- 输入无匹配内容时显示"没有找到匹配的结果"
- 切换到英文版 (`/en/`) 验证搜索结果为英文

- [ ] **Step 3: 内容校验**

Run: `npm run validate`
Expected: 校验通过
