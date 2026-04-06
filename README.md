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

Currently contains 16 Chinese articles, 90+ interactive visualization components, organized into learning paths:

### Transformer Core

1. **Transformer Architecture Overview** — Overall structure and components
2. **QKV Data Structures and Intuition** — Geometric meaning of Query/Key/Value
3. **Attention Computation Explained** — Complete derivation of Scaled Dot-Product Attention
4. **Multi-Head Attention** — Parallel computation structure of multi-head attention
5. **MQA and GQA** — Multi-Query and Grouped-Query Attention optimization strategies
6. **KV Cache Principles** — Caching mechanism and memory optimization
7. **Prefill vs Decode** — Computational characteristics of two-phase inference
8. **Flash Attention** — Block computation and IO-aware optimization
9. **Positional Encoding** — Position encoding and RoPE
10. **Sampling and Decoding** — Sampling strategies and decoding algorithms
11. **Speculative Decoding** — Accelerated inference through speculative decoding

### AI Compute Stack

12. **AI Compute Stack Landscape** — Seven-layer structure from inference frameworks to hardware ISA
13. **GPU Architecture** — From transistors to threads, SM internal structure explained
14. **Matrix Acceleration Units** — Tensor Core and XMX, Systolic Array principles
15. **CUDA Programming Model** — From code to hardware, Thread/Block/Grid mapping
16. **GEMM Optimization** — From naive to optimal, Tiling/Thread Tile/Tensor Core

Each article includes interactive visualization components, mathematical derivations, and references.

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

To preview the build locally:

```bash
npm run build
npm run preview
```

## Directory Structure

```
src/
├── content/articles/zh/   # Chinese articles (MDX)
├── content/paths/          # Learning path definitions (YAML)
├── content/resources/      # External resources (YAML)
├── components/
│   ├── interactive/        # Interactive visualization components (90+)
│   ├── primitives/         # Reusable base components
│   ├── layout/             # Layout components
│   └── common/             # Common UI components
├── plugins/                # Custom rehype plugins
├── pages/zh/               # Chinese page routing
└── styles/                 # Global styles
```
