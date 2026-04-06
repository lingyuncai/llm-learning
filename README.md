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
