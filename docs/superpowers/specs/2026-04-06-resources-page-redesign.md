# Resources Page Redesign

## Goal

Replace the static 6-item global resource list with an auto-aggregated view that pulls references from all article frontmatter, organized by learning path.

## Current State

- `src/pages/[locale]/resources.astro` renders 6 hand-curated resources from `src/content/resources/external-resources.yaml`
- Every article (59 zh + 2 en) has a `references` field in frontmatter with `{type, title, url}` entries
- 9 learning paths each define an ordered list of article slugs
- The current 6 global resources already appear in article references (redundant)

## Design

### Data Flow

```
getAllPaths()                          → 9 learning paths with article slug lists
getCollection('articles')             → all articles filtered by locale
For each path:
  path.articles → match to articles → extract references → dedup by URL within path
```

### Page Structure

```
<h1>资源推荐 / Resources</h1>
<p>描述文字</p>

For each learning path:
  <h2>学习路径名 (N 个资源)</h2>
  <div class="grid">
    For each unique resource:
      <ResourceCard>
        - Type badge (emoji + label + color): 📄 Paper / 🌐 Website / 🎬 Video / 📖 Book / 🎓 Course / 📝 Blog / 💻 Repo / 🔮 Interactive
        - Title (linked to URL, opens new tab)
        - Domain name extracted from URL (gray small text)
        - Source articles: "来源: article1, article2" (clickable links to articles)
      </ResourceCard>
  </div>
```

### Resource Card Design

Each card is an `<a>` linking to the resource URL (`target="_blank"`). Below the main content, source article names are shown as small gray links to `/${locale}/articles/${slug}`.

Type badge colors (reuse existing pattern):
- `paper`: `bg-yellow-100 text-yellow-800`
- `website`: `bg-blue-100 text-blue-800`
- `video`: `bg-red-100 text-red-800`
- `interactive`: `bg-green-100 text-green-800`
- `repo`: `bg-gray-100 text-gray-800`
- `book`: `bg-purple-100 text-purple-800`
- `course`: `bg-indigo-100 text-indigo-800`
- `blog`: `bg-teal-100 text-teal-800`

### Deduplication Rules

- **Within a learning path**: Deduplicate by URL. When the same URL appears in multiple articles within the same path, show it once but list all source articles.
- **Across learning paths**: No deduplication. The same resource may appear under multiple paths. This is intentional — each path should be self-contained.

### Locale Handling

- Filter articles by current locale (`a.data.locale === locale`)
- For English locale: only show references from articles that actually exist in English (the 2 current en articles). Do NOT show references from zh articles for Coming Soon articles — the resources page should reflect what's actually available in that locale.
- Learning path titles use `path.title[locale]`
- Type labels use existing `resourceTypeLabel(locale, type)`
- Page title/description use existing `t(locale, 'resources_title')` and `t(locale, 'resources_description')`

### Files to Delete

- `src/content/resources/external-resources.yaml` — replaced by article references
- `src/utils/resources.ts` — `getAllResources()` and `getResourcesByTag()` no longer needed

### Files to Modify

- `src/pages/[locale]/resources.astro` — complete rewrite with new data flow and rendering

### Files NOT Changed

- `src/content.config.ts` — article schema already has `references` with correct types
- `src/i18n/translations.ts` — existing keys sufficient (`resources_title`, `resources_description`, `resourceTypeLabel`)
- `src/utils/paths.ts` — `getAllPaths()` already returns what we need
- Learning path YAMLs — no changes needed

### Edge Cases

- **Article not found for slug**: Skip silently (defensive `.filter(Boolean)`)
- **Empty references for a path**: If all articles in a path have references that are identical (fully deduped), still show them. If a path somehow has zero articles in the current locale, skip the path section entirely.
- **New reference types**: The schema allows `paper | website | video | repo | book | course | blog`. The `typeColor` map and `resourceTypeLabel` must cover all 7 types plus `interactive` (from the old system, though articles don't use it currently).

## Out of Scope

- Search/filter functionality
- Sorting options
- Bookmark/favorite resources
- Resource descriptions (articles don't have description in their references, just type/title/url)
- Changing the article frontmatter schema
