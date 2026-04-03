# Article Top Navigation Design

## Goal

Add a compact path navigation bar at the top of article pages so readers immediately see where they are in a learning path and can navigate to prev/next articles without scrolling to the bottom.

## Scope

### In scope

1. **Top navigation bar** in `ArticleLayout.astro` — one row per containing learning path, showing prev/next links and progress (e.g., "3/7")
2. **Fix nested `<a>` bug** in `[tag].astro` — same issue already fixed in `[id].astro` and `index.astro`

### Out of scope

- Breadcrumb / "back to" navigation based on browsing history
- Tag-based prev/next navigation
- Sidebar changes
- Bottom navigation changes (keep as-is)

## Design

### Top navigation bar

**Location:** Inside `<article> <header>`, above the difficulty/tags row, above the title.

**Rendering:** For each learning path that contains the current article, render one row:

```
← 上一篇标题    ·  路径名 (3/7)  ·  下一篇标题 →
```

- Left: `← {prev.title}` as a link, or empty if first article
- Center: `{pathTitle} ({index+1}/{total})` as a link to the path page
- Right: `{next.title} →` as a link, or empty if last article

**Style:**
- `text-sm text-gray-500` — small, muted, does not compete with article title
- Links use `text-primary-600 hover:text-primary-800`
- Center path name is also a link to the path page
- `flex justify-between items-center` layout per row
- Multiple paths: stacked vertically with `space-y-1`
- No border, no background — just text

**Edge cases:**
- Article not in any path: nothing rendered
- First article in path: left side empty (`<span />`)
- Last article in path: right side empty (`<span />`)
- Multiple paths: one row per path, all visible

### Nested `<a>` fix in `[tag].astro`

Same pattern as already applied to `[id].astro` and `index.astro`: change inner tag `<a>` elements to `<span>` when nested inside a card `<a>`.

## Files to modify

- `src/components/layout/ArticleLayout.astro` — add top nav rows in header
- `src/pages/zh/tags/[tag].astro` — fix nested `<a>` to `<span>`

## Data flow

No new data needed. `ArticleLayout.astro` already computes `containingPaths` and `getNavigation()` with prev/next/pathTitle. The top nav reuses the same data, just rendered in a different location.
