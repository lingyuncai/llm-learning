# i18n Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add internationalization framework to the LLM Learning site — externalize UI strings, add `/en/` routing with Coming Soon fallback, enable language switcher, and create bilingual README.

**Architecture:** Replace hardcoded Chinese UI with a simple `translations.ts` dict + `t(locale, key)` helper. Migrate page routing from `src/pages/zh/` to `src/pages/[locale]/` using Astro's `getStaticPaths` for DRY locale handling. Components receive `locale` as an optional prop (default `'zh'`) for backward compatibility during migration.

**Tech Stack:** Astro 5 (i18n already configured), TypeScript, existing React components (unchanged)

**Spec:** `docs/superpowers/specs/2026-04-06-i18n-framework-design.md`

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/i18n/translations.ts` | All UI string keys with zh/en values |
| Create | `src/i18n/utils.ts` | `t()` helper, `getLocaleFromURL()`, locale-aware label functions |
| Refactor | `src/components/layout/Navigation.astro` | Accept locale, working language switcher |
| Refactor | `src/components/layout/BaseLayout.astro` | Accept locale, dynamic lang/description/disclaimer |
| Refactor | `src/components/layout/ArticleLayout.astro` | Accept locale, dynamic links/labels |
| Refactor | `src/components/common/PrerequisiteHint.astro` | Accept locale, dynamic labels/links |
| Refactor | `src/components/common/ReferenceCard.astro` | Accept locale, dynamic labels |
| Refactor | `src/components/common/TableOfContents.astro` | Accept locale, dynamic label |
| Refactor | `src/utils/constants.ts` | Remove `difficultyLabel` (moved to i18n) |
| Move+Refactor | `src/pages/zh/index.astro` → `src/pages/[locale]/index.astro` | Dynamic locale routing |
| Move+Refactor | `src/pages/zh/articles/[slug].astro` → `src/pages/[locale]/articles/[slug].astro` | Dynamic locale + Coming Soon |
| Move+Refactor | `src/pages/zh/paths/[id].astro` → `src/pages/[locale]/paths/[id].astro` | Dynamic locale routing |
| Move+Refactor | `src/pages/zh/tags/[tag].astro` → `src/pages/[locale]/tags/[tag].astro` | Dynamic locale routing |
| Move+Refactor | `src/pages/zh/resources.astro` → `src/pages/[locale]/resources.astro` | Dynamic locale routing |
| Create | `src/content/articles/en/transformer-overview.mdx` | Sample English article (validation) |
| Create | `src/content/articles/en/model-routing-landscape.mdx` | Sample English article (validation) |
| Rewrite | `README.md` | English version (GitHub default) |
| Create | `README.zh.md` | Chinese version (moved from README.md) |
| Edit | `CLAUDE.md` | Add bilingual sync rule |

---

### Task 1: Create i18n Translation System

**Files:**
- Create: `src/i18n/translations.ts`
- Create: `src/i18n/utils.ts`

- [ ] **Step 1: Create `src/i18n/translations.ts`**

```typescript
export const translations = {
  zh: {
    // Navigation
    nav_home: '首页',
    nav_resources: '资源推荐',
    // BaseLayout
    site_description: 'LLM 技术知识库 — 深入理解 Transformer、Attention、KV Cache 等核心技术',
    ai_disclaimer: '本站内容由 AI 生成，可能存在错误。如发现问题，欢迎到',
    ai_disclaimer_link: 'GitHub Issues',
    ai_disclaimer_suffix: '反馈。',
    // Article
    updated_at: '更新于',
    learning_path_label: '学习路径',
    // Sidebar
    prerequisites: '前置知识',
    further_reading: '延伸阅读',
    toc: '目录',
    // Difficulty
    difficulty_beginner: '入门',
    difficulty_intermediate: '中级',
    difficulty_advanced: '高级',
    // Reference types
    ref_paper: '论文',
    ref_website: '网站',
    ref_video: '视频',
    ref_repo: '代码',
    ref_book: '书籍',
    ref_course: '课程',
    ref_blog: '博客',
    // Resource page types
    resource_website: '网站',
    resource_interactive: '交互式',
    resource_video: '视频',
    resource_paper: '论文',
    resource_repo: '代码仓库',
    // Resource page text
    resources_title: '外部学习资源',
    resources_description: '精选的 Transformer / LLM 学习资源，涵盖文章、交互式工具、视频和论文。',
    // Index page
    learning_paths: '学习路径',
    browse_by_tag: '按标签浏览',
    all_articles: '全部文章',
    articles_count: '篇文章',
    // Tag page
    tag_description_prefix: '标签',
    tag_description_suffix: '下的所有文章 — LLM Learning',
    // Coming Soon
    coming_soon_title: 'Coming Soon',
    coming_soon_body: '这篇文章的英文版本正在准备中。',
    coming_soon_link: '查看中文版 →',
  },
  en: {
    nav_home: 'Home',
    nav_resources: 'Resources',
    site_description: 'LLM Knowledge Base — Deep dive into Transformer, Attention, KV Cache and more',
    ai_disclaimer: 'Content on this site is AI-generated and may contain errors. If you find issues, please report at',
    ai_disclaimer_link: 'GitHub Issues',
    ai_disclaimer_suffix: '.',
    updated_at: 'Updated',
    learning_path_label: 'Learning Path',
    prerequisites: 'Prerequisites',
    further_reading: 'Further Reading',
    toc: 'Table of Contents',
    difficulty_beginner: 'Beginner',
    difficulty_intermediate: 'Intermediate',
    difficulty_advanced: 'Advanced',
    ref_paper: 'Paper',
    ref_website: 'Website',
    ref_video: 'Video',
    ref_repo: 'Code',
    ref_book: 'Book',
    ref_course: 'Course',
    ref_blog: 'Blog',
    resource_website: 'Website',
    resource_interactive: 'Interactive',
    resource_video: 'Video',
    resource_paper: 'Paper',
    resource_repo: 'Repository',
    resources_title: 'External Learning Resources',
    resources_description: 'Curated Transformer / LLM learning resources — articles, interactive tools, videos, and papers.',
    learning_paths: 'Learning Paths',
    browse_by_tag: 'Browse by Tag',
    all_articles: 'All Articles',
    articles_count: 'articles',
    tag_description_prefix: 'Tag',
    tag_description_suffix: '— LLM Learning',
    coming_soon_title: 'Coming Soon',
    coming_soon_body: 'The English version of this article is being prepared.',
    coming_soon_link: 'View Chinese version →',
  },
} as const;

export type Locale = 'zh' | 'en';
export type TranslationKey = keyof typeof translations.zh;
```

- [ ] **Step 2: Create `src/i18n/utils.ts`**

```typescript
import { translations, type Locale, type TranslationKey } from './translations';

export type { Locale, TranslationKey };

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

export function getLocaleFromURL(url: URL): Locale {
  const segment = url.pathname.split('/').find(s => s === 'zh' || s === 'en');
  return (segment as Locale) || 'zh';
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh';
}

export function difficultyLabel(locale: Locale, difficulty: string): string {
  const key = `difficulty_${difficulty}`;
  return (translations[locale] as Record<string, string>)[key] ?? difficulty;
}

export function refTypeLabel(locale: Locale, type: string): string {
  const key = `ref_${type}`;
  return (translations[locale] as Record<string, string>)[key] ?? type;
}

export function resourceTypeLabel(locale: Locale, type: string): string {
  const key = `resource_${type}`;
  return (translations[locale] as Record<string, string>)[key] ?? type;
}
```

- [ ] **Step 3: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds (new files not yet referenced by anything).

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations.ts src/i18n/utils.ts
git commit -m "feat(i18n): add translation system with zh/en UI strings"
```

---

### Task 2: Refactor Layout Components (Navigation + BaseLayout)

**Files:**
- Modify: `src/components/layout/Navigation.astro`
- Modify: `src/components/layout/BaseLayout.astro`

These two components are tightly coupled (BaseLayout renders Navigation), so refactor together.

- [ ] **Step 1: Rewrite `src/components/layout/Navigation.astro`**

Replace the entire file with:

```astro
---
import { t, getOtherLocale, type Locale } from '../../i18n/utils';

interface Props {
  locale?: Locale;
  currentPath?: string;
}

const { locale = 'zh', currentPath = '' } = Astro.props;
const otherLocale = getOtherLocale(locale);

// Compute the other-locale URL by replacing the locale segment
const switchPath = currentPath
  ? currentPath.replace(`/${locale}/`, `/${otherLocale}/`)
  : `${import.meta.env.BASE_URL}${otherLocale}/`;
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
```

- [ ] **Step 2: Rewrite `src/components/layout/BaseLayout.astro`**

Replace the entire file with:

```astro
---
import Navigation from './Navigation.astro';
import { t, type Locale } from '../../i18n/utils';
import '../../styles/global.css';

interface Props {
  title: string;
  description?: string;
  locale?: Locale;
}

const { title, description, locale = 'zh' } = Astro.props;
const desc = description || t(locale, 'site_description');
const fullTitle = `${title} | LLM Learning`;
const siteUrl = Astro.url.href;
const htmlLang = locale === 'zh' ? 'zh-CN' : 'en';
const ogLocale = locale === 'zh' ? 'zh_CN' : 'en_US';
const currentPath = Astro.url.pathname;
---
<html lang={htmlLang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={desc} />
    <title>{fullTitle}</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>" />
    <link rel="canonical" href={siteUrl} />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={desc} />
    <meta property="og:url" content={siteUrl} />
    <meta property="og:locale" content={ogLocale} />
  </head>
  <body class="min-h-screen bg-white">
    <div class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
      {t(locale, 'ai_disclaimer')}
      <a href="https://github.com/jonathanding/llm-learning/issues" class="font-medium text-amber-900 underline hover:text-amber-700" target="_blank" rel="noopener noreferrer">
        {t(locale, 'ai_disclaimer_link')}
      </a>
      {t(locale, 'ai_disclaimer_suffix')}
    </div>
    <Navigation locale={locale} currentPath={currentPath} />
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 3: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds. Existing `zh/` pages don't pass locale prop, so components use default `'zh'` — behavior unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navigation.astro src/components/layout/BaseLayout.astro
git commit -m "feat(i18n): refactor Navigation and BaseLayout to accept locale prop"
```

---

### Task 3: Refactor ArticleLayout + Common Components

**Files:**
- Modify: `src/components/layout/ArticleLayout.astro`
- Modify: `src/components/common/PrerequisiteHint.astro`
- Modify: `src/components/common/ReferenceCard.astro`
- Modify: `src/components/common/TableOfContents.astro`
- Modify: `src/utils/constants.ts`

- [ ] **Step 1: Update `src/utils/constants.ts`**

Remove `difficultyLabel` (now in i18n). Keep `difficultyColor` (locale-independent).

Replace the entire file with:

```typescript
export const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
};
```

- [ ] **Step 2: Rewrite `src/components/common/TableOfContents.astro`**

Replace the entire file with:

```astro
---
import { t, type Locale } from '../../i18n/utils';

interface Props {
  headings: { depth: number; slug: string; text: string }[];
  locale?: Locale;
}

const { headings, locale = 'zh' } = Astro.props;
const toc = headings.filter(h => h.depth >= 2 && h.depth <= 3);
---
<nav class="sticky top-24">
  <h4 class="text-sm font-semibold text-gray-900 mb-3">{t(locale, 'toc')}</h4>
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

- [ ] **Step 3: Rewrite `src/components/common/ReferenceCard.astro`**

Replace the entire file with:

```astro
---
import { t, refTypeLabel, type Locale } from '../../i18n/utils';

interface Props {
  references: { type: string; title: string; url: string }[];
  locale?: Locale;
}

const { references, locale = 'zh' } = Astro.props;

const typeIcon: Record<string, string> = {
  paper: '📄',
  website: '🌐',
  video: '🎬',
  repo: '💻',
  book: '📚',
  course: '🎓',
  blog: '📝',
};
---
<div class="space-y-3">
  <h4 class="text-sm font-semibold text-gray-900">{t(locale, 'further_reading')}</h4>
  {references.map(ref => (
    <a href={ref.url} target="_blank" rel="noopener noreferrer"
       class="block p-3 border border-gray-100 rounded hover:border-primary-300 transition-colors">
      <div class="flex items-center gap-2 text-xs text-gray-500 mb-1">
        <span>{typeIcon[ref.type] || '📎'}</span>
        <span>{refTypeLabel(locale, ref.type)}</span>
      </div>
      <p class="text-sm text-gray-700 leading-snug">{ref.title}</p>
    </a>
  ))}
</div>
```

- [ ] **Step 4: Rewrite `src/components/common/PrerequisiteHint.astro`**

Replace the entire file with:

```astro
---
import { t, type Locale } from '../../i18n/utils';

interface Props {
  prerequisites: string[];
  allArticles: { data: { slug: string; title: string } }[];
  locale?: Locale;
}

const { prerequisites, allArticles, locale = 'zh' } = Astro.props;

const prereqArticles = prerequisites
  .map(slug => allArticles.find(a => a.data.slug === slug))
  .filter(Boolean);
---
{prereqArticles.length > 0 && (
  <div class="mb-4">
    <h4 class="text-sm font-semibold text-gray-900 mb-2">{t(locale, 'prerequisites')}</h4>
    <ul class="space-y-1">
      {prereqArticles.map(article => (
        <li>
          <a href={`${import.meta.env.BASE_URL}${locale}/articles/${article!.data.slug}`}
             class="text-sm text-primary-600 hover:text-primary-800">
            {article!.data.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}
```

- [ ] **Step 5: Rewrite `src/components/layout/ArticleLayout.astro`**

Replace the entire file with:

```astro
---
import BaseLayout from './BaseLayout.astro';
import TableOfContents from '../common/TableOfContents.astro';
import ReferenceCard from '../common/ReferenceCard.astro';
import PrerequisiteHint from '../common/PrerequisiteHint.astro';
import { getCollection } from 'astro:content';
import { getAllPaths } from '../../utils/paths';
import { difficultyLabel, t, type Locale } from '../../i18n/utils';
import { difficultyColor } from '../../utils/constants';

interface Props {
  title: string;
  slug: string;
  difficulty: string;
  tags: string[];
  prerequisites: string[];
  references: { type: string; title: string; url: string }[];
  updated: string;
  headings: { depth: number; slug: string; text: string }[];
  locale?: Locale;
}

const {
  title, slug, difficulty, tags, prerequisites,
  references, updated, headings, locale = 'zh',
} = Astro.props;

const allArticles = (await getCollection('articles')).filter(a => a.data.locale === locale);
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
  return { prev, next, pathTitle: pathObj.title[locale], index: idx, total: pathObj.articles.length };
}
---
<BaseLayout title={title} description={`${title} — LLM Learning`} locale={locale}>
  <div class="flex gap-8">
    <!-- 左侧 TOC -->
    <aside class="hidden lg:block w-56 shrink-0">
      <TableOfContents headings={headings} locale={locale} />
    </aside>

    <!-- 中间正文 -->
    <article class="flex-1 min-w-0">
      <header class="mb-8">
        {containingPaths.length > 0 && (
          <div class={`mb-4 ${containingPaths.length > 1 ? 'space-y-1' : ''}`}>
            {containingPaths.map(p => {
              const nav = getNavigation(p);
              return (
                <div class="flex justify-between items-center text-sm">
                  <span class="w-1/3 truncate">
                    {nav.prev ? (
                      <a href={`${import.meta.env.BASE_URL}${locale}/articles/${nav.prev.data.slug}`}
                         class="text-gray-400 hover:text-primary-600 transition-colors">
                        ← {nav.prev.data.title}
                      </a>
                    ) : <span />}
                  </span>
                  <a href={`${import.meta.env.BASE_URL}${locale}/paths/${p.id}`}
                     class="text-gray-500 hover:text-primary-600 transition-colors">
                    {nav.pathTitle} ({nav.index + 1}/{nav.total})
                  </a>
                  <span class="w-1/3 truncate text-right">
                    {nav.next ? (
                      <a href={`${import.meta.env.BASE_URL}${locale}/articles/${nav.next.data.slug}`}
                         class="text-gray-400 hover:text-primary-600 transition-colors">
                        {nav.next.data.title} →
                      </a>
                    ) : <span />}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div class="flex items-center gap-3 mb-3">
          <span class={`text-xs px-2 py-0.5 rounded ${difficultyColor[difficulty]}`}>
            {difficultyLabel(locale, difficulty)}
          </span>
          {tags.map(tag => (
            <a href={`${import.meta.env.BASE_URL}${locale}/tags/${tag}`} class="text-xs text-gray-500 hover:text-primary-600">#{tag}</a>
          ))}
        </div>
        <h1 class="text-3xl font-bold mb-2">{title}</h1>
        <p class="text-sm text-gray-400">{t(locale, 'updated_at')} {updated}</p>
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
              {t(locale, 'learning_path_label')}：<a href={`${import.meta.env.BASE_URL}${locale}/paths/${p.id}`} class="text-primary-600">{nav.pathTitle}</a>
            </p>
            <div class="flex justify-between">
              {nav.prev ? (
                <a href={`${import.meta.env.BASE_URL}${locale}/articles/${nav.prev.data.slug}`}
                   class="text-sm text-primary-600 hover:text-primary-800">
                  ← {nav.prev.data.title}
                </a>
              ) : <span />}
              {nav.next ? (
                <a href={`${import.meta.env.BASE_URL}${locale}/articles/${nav.next.data.slug}`}
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
    <aside class="hidden 2xl:block w-64 shrink-0">
      <div class="sticky top-24 space-y-6">
        <PrerequisiteHint prerequisites={prerequisites} allArticles={allArticles} locale={locale} />
        <ReferenceCard references={references} locale={locale} />
      </div>
    </aside>
  </div>
</BaseLayout>
```

- [ ] **Step 6: Update zh/ page imports (prevents build breakage)**

The three `zh/` page files still import `difficultyLabel` from `constants.ts`, which was just removed. Update them now so the build doesn't break. These files will be deleted in Task 4, but must compile until then.

**`src/pages/zh/index.astro`** — change line 5:
```typescript
// FROM:
import { difficultyLabel, difficultyColor } from '../../utils/constants';
// TO:
import { difficultyLabel } from '../../i18n/utils';
import { difficultyColor } from '../../utils/constants';
```
Also update usage: change `{difficultyLabel[p.level]}` to `{difficultyLabel('zh', p.level)}` and `{difficultyLabel[article.data.difficulty]}` to `{difficultyLabel('zh', article.data.difficulty)}`.

**`src/pages/zh/paths/[id].astro`** — change line 5:
```typescript
// FROM:
import { difficultyLabel, difficultyColor } from '../../../utils/constants';
// TO:
import { difficultyLabel } from '../../../i18n/utils';
import { difficultyColor } from '../../../utils/constants';
```
Also update usage: change `{difficultyLabel[article!.data.difficulty]}` to `{difficultyLabel('zh', article!.data.difficulty)}`.

**`src/pages/zh/tags/[tag].astro`** — change line 4:
```typescript
// FROM:
import { difficultyLabel, difficultyColor } from '../../../utils/constants';
// TO:
import { difficultyLabel } from '../../../i18n/utils';
import { difficultyColor } from '../../../utils/constants';
```
Also update usage: change `{difficultyLabel[article.data.difficulty]}` to `{difficultyLabel('zh', article.data.difficulty)}`.

- [ ] **Step 7: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds. All components use `locale = 'zh'` default, behavior unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/ArticleLayout.astro src/components/common/PrerequisiteHint.astro src/components/common/ReferenceCard.astro src/components/common/TableOfContents.astro src/utils/constants.ts
git commit -m "feat(i18n): refactor ArticleLayout and common components for locale support"
```

---

### Task 4: Migrate Pages to Dynamic `[locale]` Routing

**Files:**
- Delete: `src/pages/zh/` (entire directory)
- Create: `src/pages/[locale]/index.astro`
- Create: `src/pages/[locale]/articles/[slug].astro` (with Coming Soon logic)
- Create: `src/pages/[locale]/paths/[id].astro`
- Create: `src/pages/[locale]/tags/[tag].astro`
- Create: `src/pages/[locale]/resources.astro`

**Important context:** Astro's `getStaticPaths` generates all locale/slug combinations at build time. For `/en/` articles that don't exist yet, we render a Coming Soon page. The `src/pages/index.astro` root redirect file stays as-is (Astro i18n handles redirect to `/zh/`).

- [ ] **Step 1: Create `src/pages/[locale]/index.astro`**

```astro
---
import BaseLayout from '../../components/layout/BaseLayout.astro';
import { getAllPaths } from '../../utils/paths';
import { getCollection } from 'astro:content';
import { difficultyLabel, t, type Locale } from '../../i18n/utils';
import { difficultyColor } from '../../utils/constants';

export function getStaticPaths() {
  return [
    { params: { locale: 'zh' } },
    { params: { locale: 'en' } },
  ];
}

const locale = Astro.params.locale as Locale;
const paths = getAllPaths();
const allArticles = await getCollection('articles');
const articles = allArticles
  .filter(a => a.data.locale === locale)
  .sort((a, b) => a.data.title.localeCompare(b.data.title, locale));
const allTags = [...new Set(articles.flatMap(a => a.data.tags))].sort();
---
<BaseLayout title={t(locale, 'nav_home')} locale={locale}>
  <!-- 学习路径 -->
  <section class="mb-12">
    <h2 class="text-2xl font-bold mb-6">{t(locale, 'learning_paths')}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {paths.map(p => (
        <a href={`${import.meta.env.BASE_URL}${locale}/paths/${p.id}`}
           class="block p-6 border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold">{p.title[locale]}</h3>
            <span class={`text-xs px-2 py-1 rounded ${difficultyColor[p.level]}`}>
              {difficultyLabel(locale, p.level)}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-3">{p.description[locale]}</p>
          <p class="text-xs text-gray-400">{p.articles.length} {t(locale, 'articles_count')}</p>
        </a>
      ))}
    </div>
  </section>

  <!-- 标签浏览 -->
  <section>
    <h2 class="text-2xl font-bold mb-6">{t(locale, 'browse_by_tag')}</h2>
    <div class="flex flex-wrap gap-2">
      {allTags.map(tag => (
        <a href={`${import.meta.env.BASE_URL}${locale}/tags/${tag}`}
           class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors">
          {tag}
        </a>
      ))}
    </div>
  </section>

  <!-- 全部文章 -->
  <section class="mt-8">
    <h2 class="text-2xl font-bold mb-6">{t(locale, 'all_articles')}</h2>
    <div class="space-y-3">
      {articles.map(article => (
        <a href={`${import.meta.env.BASE_URL}${locale}/articles/${article.data.slug}`}
           class="block p-4 border border-gray-100 rounded hover:border-primary-300 transition-colors">
          <div class="flex items-center gap-3">
            <span class={`text-xs px-2 py-0.5 rounded ${difficultyColor[article.data.difficulty]}`}>
              {difficultyLabel(locale, article.data.difficulty)}
            </span>
            <h3 class="font-medium">{article.data.title}</h3>
          </div>
          <div class="flex gap-2 flex-wrap mt-2">
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

- [ ] **Step 2: Create `src/pages/[locale]/articles/[slug].astro`**

This is the most complex page — it handles both real articles and Coming Soon fallback.

```astro
---
import { getCollection, render } from 'astro:content';
import ArticleLayout from '../../../components/layout/ArticleLayout.astro';
import BaseLayout from '../../../components/layout/BaseLayout.astro';
import { t, type Locale } from '../../../i18n/utils';

export async function getStaticPaths() {
  const allArticles = await getCollection('articles');
  const zhArticles = allArticles.filter(a => a.data.locale === 'zh');
  const enArticles = allArticles.filter(a => a.data.locale === 'en');
  const enSlugs = new Set(enArticles.map(a => a.data.slug));

  // zh articles → /zh/articles/{slug}
  const zhPaths = zhArticles.map(a => ({
    params: { locale: 'zh', slug: a.data.slug },
    props: { article: a, comingSoon: false },
  }));

  // en articles that exist → /en/articles/{slug}
  const enPaths = enArticles.map(a => ({
    params: { locale: 'en', slug: a.data.slug },
    props: { article: a, comingSoon: false },
  }));

  // zh articles without en counterpart → /en/articles/{slug} (Coming Soon)
  const comingSoonPaths = zhArticles
    .filter(a => !enSlugs.has(a.data.slug))
    .map(a => ({
      params: { locale: 'en', slug: a.data.slug },
      props: { article: null, comingSoon: true, zhSlug: a.data.slug, zhTitle: a.data.title },
    }));

  return [...zhPaths, ...enPaths, ...comingSoonPaths];
}

const locale = Astro.params.locale as Locale;
const { article, comingSoon, zhSlug, zhTitle } = Astro.props;

let Content: any = null;
let headings: any[] = [];
if (article) {
  const rendered = await render(article);
  Content = rendered.Content;
  headings = rendered.headings;
}

// For Coming Soon, display the Chinese title (no article-level English title available)
const displayTitle = zhTitle || Astro.params.slug;
---
{article ? (
  <ArticleLayout
    title={article.data.title}
    slug={article.data.slug}
    difficulty={article.data.difficulty}
    tags={article.data.tags}
    prerequisites={article.data.prerequisites}
    references={article.data.references}
    updated={article.data.updated}
    headings={headings}
    locale={locale}
  >
    <Content />
  </ArticleLayout>
) : (
  <BaseLayout title={t(locale, 'coming_soon_title')} locale={locale}>
    <div class="max-w-2xl mx-auto text-center py-20">
      <h1 class="text-3xl font-bold mb-4 text-gray-400">{displayTitle}</h1>
      <div class="text-6xl mb-6">🚧</div>
      <p class="text-lg text-gray-600 mb-8">{t(locale, 'coming_soon_body')}</p>
      <a href={`${import.meta.env.BASE_URL}zh/articles/${zhSlug}`}
         class="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        {t(locale, 'coming_soon_link')}
      </a>
    </div>
  </BaseLayout>
)}
```

- [ ] **Step 3: Create `src/pages/[locale]/paths/[id].astro`**

```astro
---
import BaseLayout from '../../../components/layout/BaseLayout.astro';
import { getAllPaths } from '../../../utils/paths';
import { getCollection } from 'astro:content';
import { difficultyLabel, t, type Locale } from '../../../i18n/utils';
import { difficultyColor } from '../../../utils/constants';

export function getStaticPaths() {
  const paths = getAllPaths();
  const locales: Locale[] = ['zh', 'en'];
  return locales.flatMap(locale =>
    paths.map(p => ({
      params: { locale, id: p.id },
      props: { learningPath: p },
    }))
  );
}

const locale = Astro.params.locale as Locale;
const { learningPath } = Astro.props;
const allArticles = (await getCollection('articles')).filter(a => a.data.locale === locale);

const pathArticles = learningPath.articles
  .map(slug => allArticles.find(a => a.data.slug === slug))
  .filter(Boolean);

// For en locale, some articles may not exist yet — show them as "Coming Soon"
const allZhArticles = locale === 'en'
  ? (await getCollection('articles')).filter(a => a.data.locale === 'zh')
  : [];
---
<BaseLayout title={learningPath.title[locale]} locale={locale}>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-3">{learningPath.title[locale]}</h1>
    <p class="text-gray-600 mb-8">{learningPath.description[locale]}</p>

    <ol class="list-none space-y-4 pl-0">
      {learningPath.articles.map((slug, index) => {
        const article = pathArticles.find(a => a!.data.slug === slug);
        const zhArticle = !article && locale === 'en'
          ? allZhArticles.find(a => a.data.slug === slug)
          : null;
        const title = article ? article.data.title : (zhArticle ? zhArticle.data.title : slug);
        const difficulty = article ? article.data.difficulty : (zhArticle ? zhArticle.data.difficulty : 'intermediate');
        const tags = article ? article.data.tags : (zhArticle ? zhArticle.data.tags : []);
        const isComingSoon = !article && locale === 'en';
        return (
          <li>
            <a href={`${import.meta.env.BASE_URL}${locale}/articles/${slug}`}
               class={`flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-sm transition-all ${isComingSoon ? 'opacity-60' : ''}`}>
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold">{title}</h3>
                  <span class={`text-xs px-2 py-0.5 rounded ${difficultyColor[difficulty]}`}>
                    {difficultyLabel(locale, difficulty)}
                  </span>
                  {isComingSoon && (
                    <span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">Coming Soon</span>
                  )}
                </div>
                <div class="flex gap-2 flex-wrap">
                  {tags.map(tag => (
                    <span class="text-xs text-gray-500">#{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          </li>
        );
      })}
    </ol>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Create `src/pages/[locale]/tags/[tag].astro`**

```astro
---
import BaseLayout from '../../../components/layout/BaseLayout.astro';
import { getCollection } from 'astro:content';
import { difficultyLabel, t, type Locale } from '../../../i18n/utils';
import { difficultyColor } from '../../../utils/constants';

export async function getStaticPaths() {
  const allArticles = await getCollection('articles');
  const locales: Locale[] = ['zh', 'en'];
  return locales.flatMap(locale => {
    const articles = allArticles.filter(a => a.data.locale === locale);
    const tags = [...new Set(articles.flatMap(a => a.data.tags))];
    return tags.map(tag => ({
      params: { locale, tag },
      props: {
        articles: articles.filter(a => a.data.tags.includes(tag)),
      },
    }));
  });
}

const locale = Astro.params.locale as Locale;
const { tag } = Astro.params;
const { articles } = Astro.props;
---
<BaseLayout title={`#${tag}`} description={`${t(locale, 'tag_description_prefix')} #${tag} ${t(locale, 'tag_description_suffix')}`} locale={locale}>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">#{tag}</h1>
    <p class="text-sm text-gray-500 mb-8">{articles.length} {t(locale, 'articles_count')}</p>

    <div class="space-y-3">
      {articles.map(article => (
        <a href={`${import.meta.env.BASE_URL}${locale}/articles/${article.data.slug}`}
           class="block p-4 border border-gray-100 rounded hover:border-primary-300 transition-colors">
          <div class="flex items-center gap-3">
            <span class={`text-xs px-2 py-0.5 rounded ${difficultyColor[article.data.difficulty]}`}>
              {difficultyLabel(locale, article.data.difficulty)}
            </span>
            <h3 class="font-medium">{article.data.title}</h3>
          </div>
          <div class="flex gap-2 flex-wrap mt-2">
            {article.data.tags.map(tagName => (
              <span class={`text-xs ${tagName === tag ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                #{tagName}
              </span>
            ))}
          </div>
        </a>
      ))}
    </div>
  </div>
</BaseLayout>
```

**Note:** The `/en/tags/` pages will only show tags that have at least one English article. During the transition period (few/no English articles), the `/en/` index page may show very few or no tags. This is expected — tags populate as English articles are added.

- [ ] **Step 5: Create `src/pages/[locale]/resources.astro`**

```astro
---
import BaseLayout from '../../components/layout/BaseLayout.astro';
import { getAllResources } from '../../utils/resources';
import { t, resourceTypeLabel, type Locale } from '../../i18n/utils';

export function getStaticPaths() {
  return [
    { params: { locale: 'zh' } },
    { params: { locale: 'en' } },
  ];
}

const locale = Astro.params.locale as Locale;
const resources = getAllResources();

const typeColor: Record<string, string> = {
  website: 'bg-blue-100 text-blue-800',
  interactive: 'bg-green-100 text-green-800',
  video: 'bg-red-100 text-red-800',
  paper: 'bg-yellow-100 text-yellow-800',
  repo: 'bg-gray-100 text-gray-800',
};
---
<BaseLayout title={t(locale, 'resources_title')} locale={locale}>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-3">{t(locale, 'resources_title')}</h1>
    <p class="text-gray-600 mb-8">{t(locale, 'resources_description')}</p>

    <div class="space-y-4">
      {resources.map(resource => (
        <a href={resource.url} target="_blank" rel="noopener noreferrer"
           class="block p-5 border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-sm transition-all">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-semibold">{resource.title}</h3>
            <span class={`text-xs px-2 py-0.5 rounded ${typeColor[resource.type] || 'bg-gray-100'}`}>
              {resourceTypeLabel(locale, resource.type)}
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

- [ ] **Step 6: Delete old `src/pages/zh/` directory**

```bash
rm -rf src/pages/zh
```

- [ ] **Step 7: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. All `/zh/` routes should still work (now generated by `[locale]` pages). New `/en/` routes should also be generated. The root `/` should redirect to `/zh/`.

If build fails, check for:
- Import path issues (relative paths may change with the new directory structure)
- Missing `getStaticPaths` entries
- TypeScript type errors on `Astro.params.locale`

- [ ] **Step 8: Commit**

```bash
git add src/pages/
git commit -m "feat(i18n): migrate pages from zh/ to [locale]/ dynamic routing with Coming Soon fallback"
```

---

### Task 5: Create Sample English Articles

**Files:**
- Create: `src/content/articles/en/transformer-overview.mdx`
- Create: `src/content/articles/en/model-routing-landscape.mdx`

These validate the full i18n pipeline: routing, language switcher, article layout, path navigation, and prerequisite links.

- [ ] **Step 1: Create directory**

```bash
mkdir -p src/content/articles/en
```

- [ ] **Step 2: Create `src/content/articles/en/transformer-overview.mdx`**

Translate the Chinese article at `src/content/articles/zh/transformer-overview.mdx` to English. Key rules:

1. **Frontmatter**: Copy exactly, change `locale: zh` → `locale: en`, change `title` to English, keep same `slug`, `tags`, `prerequisites`, `difficulty`, `references` (references are already in English)
2. **Component imports**: Copy exactly as-is (same components, same paths)
3. **Component usage**: Copy exactly as-is (same props, same `client:visible`)
4. **Body content**: Translate all Chinese text to English. Keep all mathematical notation (`$...$`, `$$...$$`) as-is. Keep English technical terms as-is. Keep markdown tables, headings, lists structure intact.
5. **MDX safety**: Do NOT use `<` before words (use "less than" or similar). Do NOT use unescaped `{var}` in prose (escape as `\{var\}`).

Source file to translate: `src/content/articles/zh/transformer-overview.mdx` (285 lines)

Frontmatter should be:
```yaml
---
title: "Transformer Architecture Overview"
slug: transformer-overview
locale: en
tags: [transformer, architecture]
prerequisites: []
difficulty: intermediate
created: "2026-03-31"
updated: "2026-04-06"
references:
  - type: paper
    title: "Attention Is All You Need"
    url: "https://arxiv.org/abs/1706.03762"
  - type: paper
    title: "Language Models are Unsupervised Multitask Learners (GPT-2)"
    url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"
  - type: website
    title: "The Illustrated Transformer"
    url: "https://jalammar.github.io/illustrated-transformer/"
  - type: website
    title: "LLM Visualization — Brendan Bycroft"
    url: "https://bbycroft.net/llm"
  - type: website
    title: "Transformer Explainer — Georgia Tech / Polo Club"
    url: "https://poloclub.github.io/transformer-explainer/"
---
```

Component imports and usage lines should be copied verbatim from the Chinese version. Only the prose text between components should be translated.

- [ ] **Step 3: Create `src/content/articles/en/model-routing-landscape.mdx`**

Same translation rules as Step 2. Source: `src/content/articles/zh/model-routing-landscape.mdx` (142 lines)

Frontmatter should be:
```yaml
---
title: "Model Routing Landscape: Why One Model Isn't Enough"
slug: model-routing-landscape
locale: en
tags: [model-routing, llm, cost-optimization, system-design]
difficulty: advanced
created: "2026-04-06"
updated: "2026-04-06"
references:
  - type: paper
    title: "RouteLLM: Learning to Route LLMs with Preference Data"
    url: "https://arxiv.org/abs/2406.18665"
  - type: paper
    title: "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance"
    url: "https://arxiv.org/abs/2305.05176"
  - type: paper
    title: "AutoMix: Automatically Mixing Language Models"
    url: "https://arxiv.org/abs/2310.12963"
  - type: website
    title: "RouteLLM GitHub Repository"
    url: "https://github.com/lm-sys/RouteLLM"
---
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. New English articles should generate `/en/articles/transformer-overview` and `/en/articles/model-routing-landscape` pages. All other `/en/articles/*` should show Coming Soon pages.

- [ ] **Step 5: Commit**

```bash
git add src/content/articles/en/
git commit -m "feat(i18n): add sample English translations for transformer-overview and model-routing-landscape"
```

---

### Task 6: Bilingual README

**Files:**
- Create: `README.zh.md` (move current Chinese content)
- Rewrite: `README.md` (English version)

- [ ] **Step 1: Create `README.zh.md`**

Copy the current `README.md` content and add a language toggle at the top:

```markdown
🌐 **中文** | [English](README.md)

# LLM Learning

基于 Astro + MDX + React 构建的 LLM 技术知识库网站，以交互式可视化的方式讲解大语言模型核心概念。

> **注意：本项目的所有内容（文章、交互组件、可视化）均由 AI 生成。** 内容可能存在错误、不准确或过时之处。如果你发现任何问题，欢迎到 [GitHub Issues](https://github.com/jonathanding/llm-learning/issues) 反馈。

**在线访问**: https://jonathanding.github.io/llm-learning/

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
```

- [ ] **Step 2: Rewrite `README.md` in English**

Replace the entire file with:

```markdown
🌐 [中文](README.zh.md) | **English**

# LLM Learning

An interactive knowledge base for LLM technologies, built with Astro + MDX + React. Learn core concepts through interactive visualizations.

> **Note: All content (articles, interactive components, visualizations) on this site is AI-generated.** It may contain errors or inaccuracies. If you find any issues, please report them at [GitHub Issues](https://github.com/jonathanding/llm-learning/issues).

**Live site**: https://jonathanding.github.io/llm-learning/

## Tech Stack

- **Framework**: Astro 5 (Islands Architecture)
- **Content**: MDX (Markdown + JSX)
- **Interactive Components**: React + Motion
- **Math Rendering**: KaTeX (remark-math + rehype-katex)
- **Visualization**: D3.js + custom SVG
- **Styling**: Tailwind CSS + @tailwindcss/typography
- **Language**: TypeScript
- **Deployment**: GitHub Pages + GitHub Actions

## Content

Currently contains 59 Chinese articles (2 English), 130+ interactive visualization components, organized into 9 learning paths.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build static site
npm run build

# Content validation
npm run validate
```

## Deployment

Push to `main` branch and GitHub Actions will automatically build and deploy to GitHub Pages.

## Directory Structure

```
src/
├── content/articles/zh/   # Chinese articles (MDX)
├── content/articles/en/   # English articles (MDX)
├── content/paths/          # Learning path definitions (YAML)
├── content/resources/      # External resources (YAML)
├── components/
│   ├── interactive/        # Interactive visualization components
│   ├── primitives/         # Reusable base components
│   ├── layout/             # Layout components
│   └── common/             # Common UI components
├── i18n/                   # Internationalization
├── pages/[locale]/         # Multi-locale page routing
└── styles/                 # Global styles
```
```

- [ ] **Step 3: Commit**

```bash
git add README.md README.zh.md
git commit -m "docs: add bilingual README (English default + Chinese)"
```

---

### Task 7: CLAUDE.md Sync Rule

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add bilingual sync rule to `CLAUDE.md`**

Add the following section after the "组件约定" section (before "常用命令"):

```markdown
## 双语同步规则
- 修改文章内容时，如果对应语言版本存在，必须同步更新两个版本
- 修改 UI 组件（layout/common）时，确保使用 `t(locale, key)` 而非硬编码文字
- 新增 UI 字符串时，必须同时在 `src/i18n/translations.ts` 中添加 zh 和 en 两个 key
- 如果英文版文章尚未创建，在 commit message 中注明 "zh-only"
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add bilingual sync rule to CLAUDE.md"
```

---

### Task 8: Final Validation

- [ ] **Step 1: Run content validation**

```bash
npm run validate
```

Expected: All validations pass.

- [ ] **Step 2: Run full build**

```bash
npm run build
```

Expected: Build succeeds with more pages than before (both `/zh/` and `/en/` routes generated). Count should be significantly higher than the previous 261 pages.

- [ ] **Step 3: Manual verification checklist**

Start dev server and verify in browser:

```bash
npm run dev
```

Check each of these:

1. **`/zh/`** — Homepage loads with Chinese UI, learning paths, tags, articles
2. **`/en/`** — Homepage loads with English UI, learning paths listed (with English titles from YAML), tags may be empty (OK), articles section shows translated articles only
3. **`/zh/articles/transformer-overview`** — Chinese article renders correctly
4. **`/en/articles/transformer-overview`** — English article renders correctly
5. **`/en/articles/attention-computation`** — Shows Coming Soon page with link to Chinese version
6. **Language switcher** — Clicking EN on a `/zh/` page navigates to the same slug on `/en/`; clicking 中文 on `/en/` navigates back
7. **Path page** — `/en/paths/transformer-core` shows articles with "Coming Soon" badges on untranslated articles
8. **Resources page** — `/en/resources` shows English labels
9. **Root `/`** — Redirects to `/zh/`

- [ ] **Step 4: Commit any fixes found during verification**

If any issues are found during manual verification, fix them and commit:

```bash
git add -A
git commit -m "fix(i18n): address issues found during manual verification"
```
