# i18n Framework Design Spec

**Date**: 2026-04-06
**Scope**: Internationalization framework for the LLM Learning site — UI string extraction, `/en/` routing, language switcher, bilingual README, and CLAUDE.md sync rule. Does NOT include article translation (separate future effort).

## Context

The site currently has 59 Chinese articles, 9 learning paths, and all UI hardcoded in Chinese. However, the i18n **infrastructure is already partially in place**:

- `astro.config.mjs`: `i18n.locales: ['zh', 'en']`, `prefixDefaultLocale: true`
- `content.config.ts`: schema supports `locale: z.enum(['zh', 'en'])`
- Path YAML files: already have `title.zh` / `title.en` and `description.zh` / `description.en`
- Navigation: has a disabled zh/EN toggle placeholder

What's missing: UI string externalization, `/en/` routes, language switching logic, Coming Soon fallback, and bilingual README.

## Design

### 1. Translation System

**Approach**: Single TypeScript dict + helper function. Two languages, ~70 keys — no need for external i18n libraries.

**New files**:
- `src/i18n/translations.ts` — all UI string keys with zh/en values
- `src/i18n/utils.ts` — `t(locale, key)` helper and `getLocaleFromURL()` utility

**`translations.ts` structure**:
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
    learning_path: '学习路径',
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
    // Resource types
    resource_website: '网站',
    resource_interactive: '交互式',
    resource_video: '视频',
    resource_paper: '论文',
    resource_repo: '代码仓库',
    // Index page
    learning_paths: '学习路径',
    browse_by_tag: '按标签浏览',
    all_articles: '全部文章',
    articles_count: '篇文章',
    // Tag page
    tag_articles_count: '篇文章',
    // Coming Soon
    coming_soon_title: 'Coming Soon',
    coming_soon_body: '这篇文章的英文版本正在准备中。',
    coming_soon_link: '查看中文版',
  },
  en: {
    nav_home: 'Home',
    nav_resources: 'Resources',
    site_description: 'LLM Knowledge Base — Deep dive into Transformer, Attention, KV Cache and more',
    ai_disclaimer: 'Content on this site is AI-generated and may contain errors. If you find issues, please report them at',
    ai_disclaimer_link: 'GitHub Issues',
    ai_disclaimer_suffix: '.',
    updated_at: 'Updated',
    learning_path: 'Learning Path',
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
    learning_paths: 'Learning Paths',
    browse_by_tag: 'Browse by Tag',
    all_articles: 'All Articles',
    articles_count: 'articles',
    tag_articles_count: 'articles',
    coming_soon_title: 'Coming Soon',
    coming_soon_body: 'The English version of this article is being prepared.',
    coming_soon_link: 'View Chinese version',
  },
} as const;

export type Locale = 'zh' | 'en';
export type TranslationKey = keyof typeof translations.zh;
```

**`utils.ts`**:
```typescript
import { translations, type Locale, type TranslationKey } from './translations';

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
  const key = `difficulty_${difficulty}` as TranslationKey;
  return t(locale, key);
}

export function refTypeLabel(locale: Locale, type: string): string {
  const key = `ref_${type}` as TranslationKey;
  return translations[locale][key] ?? type;
}
```

### 2. Dynamic Locale Routing

**Approach**: Replace `src/pages/zh/` with `src/pages/[locale]/` using Astro's `getStaticPaths`. This is DRYer than maintaining two copies of every page file.

**Migration**:
- Move `src/pages/zh/index.astro` → `src/pages/[locale]/index.astro`
- Move `src/pages/zh/articles/[slug].astro` → `src/pages/[locale]/articles/[slug].astro`
- Move `src/pages/zh/paths/[id].astro` → `src/pages/[locale]/paths/[id].astro`
- Move `src/pages/zh/tags/[tag].astro` → `src/pages/[locale]/tags/[tag].astro`
- Move `src/pages/zh/resources.astro` → `src/pages/[locale]/resources.astro`
- Delete `src/pages/zh/` directory
- Keep `src/pages/index.astro` as root redirect (already handled by Astro i18n)

**Each page's `getStaticPaths`** generates paths for both `zh` and `en` locales. Example for `[locale]/index.astro`:

```typescript
export function getStaticPaths() {
  return [
    { params: { locale: 'zh' } },
    { params: { locale: 'en' } },
  ];
}
```

For `[locale]/articles/[slug].astro`:

```typescript
export async function getStaticPaths() {
  const allArticles = await getCollection('articles');

  // All zh articles get zh paths
  const zhPaths = allArticles
    .filter(a => a.data.locale === 'zh')
    .map(a => ({ params: { locale: 'zh', slug: a.data.slug }, props: { article: a } }));

  // en articles that exist get en paths
  const enArticles = allArticles.filter(a => a.data.locale === 'en');
  const enPaths = enArticles
    .map(a => ({ params: { locale: 'en', slug: a.data.slug }, props: { article: a } }));

  // zh articles WITHOUT en counterpart get en "coming soon" paths
  const enSlugs = new Set(enArticles.map(a => a.data.slug));
  const comingSoonPaths = allArticles
    .filter(a => a.data.locale === 'zh' && !enSlugs.has(a.data.slug))
    .map(a => ({ params: { locale: 'en', slug: a.data.slug }, props: { article: null, zhArticle: a } }));

  return [...zhPaths, ...enPaths, ...comingSoonPaths];
}
```

When `article` is `null`, the page renders the Coming Soon template.

Similar logic for tags and paths pages: generate both locales, show empty states if no en content.

### 3. Component Locale Refactoring

All layout and common components receive `locale` as a prop (passed down from pages). Changes required:

**`Navigation.astro`**:
- Accept `locale` prop
- Replace hardcoded Chinese text with `t(locale, key)` calls
- Replace disabled EN toggle with working link: current locale highlighted, other links to same page in other locale
- Logo links to `/${locale}/`

**`BaseLayout.astro`**:
- Accept `locale` prop, pass to `Navigation`
- Set `<html lang={locale === 'zh' ? 'zh-CN' : 'en'}>` dynamically
- Set `<meta property="og:locale">` dynamically
- Replace hardcoded disclaimer text with `t()` calls
- Replace hardcoded default description with `t(locale, 'site_description')`

**`ArticleLayout.astro`**:
- Accept `locale` prop, pass to `BaseLayout`, `PrerequisiteHint`, `ReferenceCard`, `TableOfContents`
- Filter articles by current locale: `.filter(a => a.data.locale === locale)`
- Use `pathObj.title[locale]` instead of `pathObj.title.zh`
- Replace all hardcoded `/zh/` links with `/${locale}/`
- Replace hardcoded UI strings with `t()` calls

**`PrerequisiteHint.astro`**:
- Accept `locale` prop
- Replace "前置知识" with `t(locale, 'prerequisites')`
- Replace hardcoded `/zh/articles/` with `/${locale}/articles/`

**`ReferenceCard.astro`**:
- Accept `locale` prop
- Replace "延伸阅读" with `t(locale, 'further_reading')`
- Replace Chinese type labels with `refTypeLabel(locale, type)`

**`TableOfContents.astro`**:
- Accept `locale` prop
- Replace "目录" with `t(locale, 'toc')`

**`src/utils/constants.ts`**:
- Remove `difficultyLabel` (moved to i18n utils)
- Keep `difficultyColor` (locale-independent)

**`src/pages/[locale]/resources.astro`** (formerly `zh/resources.astro`):
- Replace inline `typeLabel` dict with `t()` calls using `resource_*` keys
- Replace hardcoded Chinese text ("外部学习资源", "精选的...") with `t()` calls
- Add missing translation keys to `translations.ts` if needed

### 4. Coming Soon Page

When `/en/articles/{slug}` is requested but no English article exists, render a Coming Soon layout:

- Use `ArticleLayout` (or a simplified version via `BaseLayout`)
- Show: article title from path YAML `title.en` if available, otherwise the slug formatted as title
- Body: "The English version of this article is being prepared."
- Link: "View Chinese version →" pointing to `/zh/articles/{slug}`
- Same approach for paths and tag pages with zero en articles

### 5. Language Switcher (Navigation)

Replace the current disabled placeholder with a working toggle:

```html
<!-- When viewing zh -->
<span class="text-sm font-medium text-gray-900">中文</span>
<span class="text-sm text-gray-400">/</span>
<a href="/en/..." class="text-sm text-gray-500 hover:text-gray-900">EN</a>

<!-- When viewing en -->
<a href="/zh/..." class="text-sm text-gray-500 hover:text-gray-900">中文</a>
<span class="text-sm text-gray-400">/</span>
<span class="text-sm font-medium text-gray-900">EN</span>
```

The link target is computed by replacing the locale segment in the current URL path. Navigation receives `locale` and `currentPath` as props.

### 6. Bilingual README

**`README.md`** (English, GitHub default):
- Translate current README content to English
- Add language toggle at top: `🌐 [中文](README.zh.md) | **English**`
- Update article count and path list to reflect current state (59 articles, 9 learning paths)

**`README.zh.md`** (Chinese, current content moved here):
- Move current README.md content here
- Add language toggle at top: `🌐 **中文** | [English](README.md)`
- Update article count and path list to reflect current state

### 7. CLAUDE.md Sync Rule

Add to `CLAUDE.md` under a new section:

```markdown
## 双语同步规则
- 修改文章内容时，如果对应语言版本存在，必须同步更新两个版本
- 修改 UI 组件（layout/common）时，确保使用 `t(locale, key)` 而非硬编码文字
- 新增 UI 字符串时，必须同时在 `src/i18n/translations.ts` 中添加 zh 和 en 两个 key
- 如果英文版文章尚未创建，在 commit message 中注明 "zh-only"
```

### 8. Verification

Create 2 sample English article translations to validate the full pipeline:
- `src/content/articles/en/model-routing-landscape.mdx` — from the most recent learning path
- `src/content/articles/en/transformer-overview.mdx` — from the first learning path

These articles validate: routing works, language switcher works, Coming Soon fallback works (for the other 57 untranslated articles), prerequisites link correctly, path navigation works.

## Files Changed Summary

| Action | Files |
|--------|-------|
| **New** | `src/i18n/translations.ts`, `src/i18n/utils.ts` |
| **New** | `src/content/articles/en/model-routing-landscape.mdx`, `src/content/articles/en/transformer-overview.mdx` |
| **New** | `README.zh.md` |
| **Move+Refactor** | `src/pages/zh/*` → `src/pages/[locale]/*` (5 files) |
| **Refactor** | `Navigation.astro`, `BaseLayout.astro`, `ArticleLayout.astro` |
| **Refactor** | `PrerequisiteHint.astro`, `ReferenceCard.astro`, `TableOfContents.astro` |
| **Refactor** | `src/utils/constants.ts` (remove `difficultyLabel`) |
| **Rewrite** | `README.md` (English version) |
| **Edit** | `CLAUDE.md` (add sync rule) |

**Total**: ~17 files (2 new i18n, 5 page moves, 6 component refactors, 2 sample articles, 2 READMEs, 1 CLAUDE.md edit, 1 constants cleanup)

## Out of Scope

- Full translation of all 59 articles (separate future effort, per learning path)
- Resource YAML bilingual content (resources page UI will be localized, but resource entries themselves stay as-is since they're mostly English links)
- Search functionality changes (no search feature currently exists)
- SEO hreflang tags (nice-to-have, can add later)
