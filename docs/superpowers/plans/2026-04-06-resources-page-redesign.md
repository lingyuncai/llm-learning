# Resources Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static 6-item resource list with an auto-aggregated view that pulls references from article frontmatter, organized by learning path.

**Architecture:** The resources page (`resources.astro`) will use `getAllPaths()` and `getCollection('articles')` to build a per-path list of deduplicated references. No new utilities needed — all data comes from existing sources. The old `resources.ts` utility and `external-resources.yaml` are deleted.

**Tech Stack:** Astro 5 (static page), existing i18n utils (`refTypeLabel`, `t`), existing `getAllPaths()`.

---

### Task 1: Update i18n translations for resource page

The current resource page translations (`resources_title`, `resources_description`) describe "curated external resources". The new page aggregates from articles, so the descriptions need updating. Also, we need new translation keys for "source articles" labels and resource count text.

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Update translation keys**

In `src/i18n/translations.ts`, update the `resources_title`, `resources_description` values and add new keys. Find this block in the `zh` section:

```typescript
    // Resource page text
    resources_title: '外部学习资源',
    resources_description: '精选的 Transformer / LLM 学习资源，涵盖文章、交互式工具、视频和论文。',
```

Replace with:

```typescript
    // Resource page text
    resources_title: '资源推荐',
    resources_description: '按学习路径整理的参考资源，自动聚合自各篇文章的引用。',
    resources_count: '个资源',
    resources_source: '来源',
```

Find the same block in the `en` section:

```typescript
    resources_title: 'External Learning Resources',
    resources_description: 'Curated Transformer / LLM learning resources — articles, interactive tools, videos, and papers.',
```

Replace with:

```typescript
    resources_title: 'Resources',
    resources_description: 'Reference materials organized by learning path, auto-aggregated from article citations.',
    resources_count: 'resources',
    resources_source: 'Source',
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds (no translation keys removed that are used elsewhere — `resources_title` and `resources_description` are only used in `resources.astro` which we'll rewrite in Task 2).

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "feat(resources): update i18n keys for resource page redesign"
```

---

### Task 2: Rewrite resources page

Replace the current `resources.astro` that reads from `external-resources.yaml` with a new version that aggregates references from articles, grouped by learning path.

**Files:**
- Rewrite: `src/pages/[locale]/resources.astro`

**Context the implementer needs:**

- `getAllPaths()` from `src/utils/paths.ts` returns `LearningPath[]` where each has `id`, `title: {zh, en}`, `description: {zh, en}`, `level`, `articles: string[]` (slugs).
- `getCollection('articles')` returns articles with `data.locale`, `data.slug`, `data.title`, `data.references: {type, title, url}[]`.
- `refTypeLabel(locale, type)` from `src/i18n/utils.ts` converts reference type to localized label (e.g., `'paper'` → `'论文'`). Uses `ref_` prefix keys. Covers all 7 types: paper, website, video, repo, book, course, blog.
- `t(locale, key)` for page-level text.
- Type badge colors: `paper: 'bg-yellow-100 text-yellow-800'`, `website: 'bg-blue-100 text-blue-800'`, `video: 'bg-red-100 text-red-800'`, `repo: 'bg-gray-100 text-gray-800'`, `book: 'bg-purple-100 text-purple-800'`, `course: 'bg-indigo-100 text-indigo-800'`, `blog: 'bg-teal-100 text-teal-800'`.

- [ ] **Step 1: Rewrite `src/pages/[locale]/resources.astro`**

Replace the entire file with:

```astro
---
import BaseLayout from '../../components/layout/BaseLayout.astro';
import { getAllPaths } from '../../utils/paths';
import { getCollection } from 'astro:content';
import { t, refTypeLabel, type Locale } from '../../i18n/utils';

export function getStaticPaths() {
  return [
    { params: { locale: 'zh' } },
    { params: { locale: 'en' } },
  ];
}

const locale = Astro.params.locale as Locale;
const paths = getAllPaths();
const allArticles = await getCollection('articles');
const localeArticles = allArticles.filter(a => a.data.locale === locale);

// Build a slug → article map for quick lookup
const articleMap = new Map(localeArticles.map(a => [a.data.slug, a]));

// For each learning path, collect and deduplicate references
const pathResources = paths.map(p => {
  const seen = new Set<string>();
  const resources: { type: string; title: string; url: string; sourceArticles: { slug: string; title: string }[] }[] = [];

  for (const slug of p.articles) {
    const article = articleMap.get(slug);
    if (!article) continue;
    for (const ref of article.data.references) {
      if (seen.has(ref.url)) {
        // Add this article as an additional source
        const existing = resources.find(r => r.url === ref.url);
        if (existing && !existing.sourceArticles.some(s => s.slug === slug)) {
          existing.sourceArticles.push({ slug, title: article.data.title });
        }
        continue;
      }
      seen.add(ref.url);
      resources.push({
        type: ref.type,
        title: ref.title,
        url: ref.url,
        sourceArticles: [{ slug, title: article.data.title }],
      });
    }
  }

  return { path: p, resources };
}).filter(pr => pr.resources.length > 0);

const typeColor: Record<string, string> = {
  paper: 'bg-yellow-100 text-yellow-800',
  website: 'bg-blue-100 text-blue-800',
  video: 'bg-red-100 text-red-800',
  interactive: 'bg-green-100 text-green-800',
  repo: 'bg-gray-100 text-gray-800',
  book: 'bg-purple-100 text-purple-800',
  course: 'bg-indigo-100 text-indigo-800',
  blog: 'bg-teal-100 text-teal-800',
};

const typeEmoji: Record<string, string> = {
  paper: '📄',
  website: '🌐',
  video: '🎬',
  interactive: '🔮',
  repo: '💻',
  book: '📖',
  course: '🎓',
  blog: '📝',
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}
---
<BaseLayout title={t(locale, 'resources_title')} locale={locale}>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-3">{t(locale, 'resources_title')}</h1>
    <p class="text-gray-600 mb-10">{t(locale, 'resources_description')}</p>

    <div class="space-y-12">
      {pathResources.map(({ path: p, resources }) => (
        <section>
          <div class="flex items-center gap-3 mb-4">
            <a href={`${import.meta.env.BASE_URL}${locale}/paths/${p.id}`}
               class="text-2xl font-bold hover:text-primary-600 transition-colors">
              {p.title[locale]}
            </a>
            <span class="text-sm text-gray-400">
              {resources.length} {t(locale, 'resources_count')}
            </span>
          </div>
          <div class="grid gap-3">
            {resources.map(resource => (
              <a href={resource.url} target="_blank" rel="noopener noreferrer"
                 class="block p-4 border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-sm transition-all">
                <div class="flex items-center gap-2 mb-1">
                  <span class={`text-xs px-2 py-0.5 rounded ${typeColor[resource.type] || 'bg-gray-100 text-gray-800'}`}>
                    {typeEmoji[resource.type] || '📎'} {refTypeLabel(locale, resource.type)}
                  </span>
                  <h3 class="font-semibold text-sm">{resource.title}</h3>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                  <span>{getDomain(resource.url)}</span>
                  <span>·</span>
                  <span>
                    {t(locale, 'resources_source')}:
                    {resource.sourceArticles.map((sa, i) => (
                      <>
                        {i > 0 && ', '}
                        <span class="text-gray-500">{sa.title}</span>
                      </>
                    ))}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds. Page count should remain 331 (resources pages already exist for both locales).

- [ ] **Step 3: Verify content**

Run a quick check that the generated page has learning path sections:

```bash
grep -c '<section>' dist/zh/resources/index.html
```

Expected: `9` (one section per learning path, though some might be 0 if they have no locale articles — should be 9 for zh since all articles are zh).

- [ ] **Step 4: Commit**

```bash
git add src/pages/[locale]/resources.astro
git commit -m "feat(resources): rewrite page to aggregate references by learning path"
```

---

### Task 3: Delete old resource files

Remove the now-unused global resource YAML and its utility module.

**Files:**
- Delete: `src/content/resources/external-resources.yaml`
- Delete: `src/utils/resources.ts`

- [ ] **Step 1: Verify no other imports**

Run:

```bash
grep -r "getAllResources\|getResourcesByTag\|external-resources" src/ --include="*.ts" --include="*.astro" --include="*.tsx"
```

Expected: No matches (the old `resources.astro` import was replaced in Task 2).

- [ ] **Step 2: Delete files**

```bash
rm src/content/resources/external-resources.yaml
rm src/utils/resources.ts
rmdir src/content/resources 2>/dev/null || true
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds. No errors about missing files.

- [ ] **Step 4: Commit**

```bash
git add -A src/content/resources/ src/utils/resources.ts
git commit -m "chore: remove unused global resources YAML and utility"
```

---

### Task 4: Update README resource counts

Both READMEs mention the site content. The resource page now works differently, so no specific count change is needed — but verify the descriptions are still accurate. Also, commit the README link fixes (zh/en live site links) that were made earlier in this session.

**Files:**
- Verify: `README.md`
- Verify: `README.zh.md`

- [ ] **Step 1: Check README accuracy**

Read both READMEs and confirm no references to "6 external resources" or similar that would be stale. The current READMEs say "59 Chinese articles (2 English), 130+ interactive visualization components, organized into 9 learning paths" — this is still correct and doesn't mention resource counts.

- [ ] **Step 2: Commit the README link fixes**

The README link changes (adding zh/en live site links) were made before this plan. Commit them:

```bash
git add README.md README.zh.md
git commit -m "fix: add separate zh/en live site links in READMEs"
```

---

### Task 5: Final validation

Full build and visual spot-check.

**Files:** None (validation only)

- [ ] **Step 1: Full build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds with 331 pages.

- [ ] **Step 2: Content validation**

Run: `npm run validate 2>&1`
Expected: All checks pass.

- [ ] **Step 3: Spot-check zh resources page**

```bash
grep -o '<section>' dist/zh/resources/index.html | wc -l
```

Expected: `9` (one per learning path).

```bash
grep -c 'target="_blank"' dist/zh/resources/index.html
```

Expected: A number significantly larger than 6 (the old count), confirming article references are being aggregated.

- [ ] **Step 4: Spot-check en resources page**

```bash
grep -o '<section>' dist/en/resources/index.html | wc -l
```

Expected: `1` (only transformer-core path has en articles — transformer-overview and model-routing-landscape). Possibly `2` if model-routing-landscape is in a different path.

- [ ] **Step 5: Verify no broken imports**

```bash
grep -r "resources\.ts\|getAllResources\|external-resources" src/ || echo "Clean — no stale references"
```

Expected: "Clean — no stale references"
