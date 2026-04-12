# Transformer 跨模态应用 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a 10-article bilingual learning path covering Transformer applications across text, vision, audio, and video modalities, with ~49 interactive React components.

**Architecture:** Each article follows existing MDX + React interactive component pattern. Components use SVG rendering, Motion animations, and the shared `COLORS`/`FONTS` system. Articles are bilingual (zh + en), organized in a linear learning path with per-article prerequisites.

**Tech Stack:** Astro 5, MDX, React 18, TypeScript, Motion (`motion/react`), SVG, Tailwind CSS, D3.js (where needed for complex visualizations)

**Design Spec:** `docs/superpowers/specs/2026-04-12-transformer-across-modalities-design.md`

---

## Component Pattern Reference

All 49 interactive components follow this established pattern. Subagents MUST reference this section.

```tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500; // SVG viewBox dimensions (adjust per component)

export default function ComponentName({ locale = 'zh' }: Props) {
  const t = { zh: { /* ... */ }, en: { /* ... */ } }[locale]!;
  const [state, setState] = useState(/* initial */);

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        {/* SVG content with <motion.g>, <motion.rect>, etc. */}
      </svg>
      {/* Optional: slider/button controls below SVG */}
    </div>
  );
}
```

**Key rules:**
- Import Motion as `import { motion } from 'motion/react'` (NOT `framer-motion`)
- Import colors as `import { COLORS, FONTS } from './shared/colors'`
- Props: only `locale?: 'zh' | 'en'`, default `'zh'`
- i18n: inline `{ zh: {...}, en: {...} }[locale]!` pattern
- Animations: `<motion.g>` with `initial`/`animate`/`transition`
- Never hardcode colors — always use `COLORS.*`

## MDX Article Pattern Reference

```mdx
---
title: "标题"
slug: article-slug
locale: zh
tags: [tag1, tag2]
prerequisites: [dep-slug]
difficulty: beginner | intermediate | advanced
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Paper Title"
    url: "https://arxiv.org/abs/..."
---

import Component1 from '../../../components/interactive/Component1.tsx';
import Component2 from '../../../components/interactive/Component2.tsx';

## 简介

{/* One paragraph: what and why */}

## 直觉理解

{/* High-level explanation with analogies */}

<Component1 client:visible />

## 技术细节

{/* Formulas, architecture, data flow */}

<Component2 client:visible />

## 总结

{/* Key takeaways */}
```

**Key rules:**
- `client:visible` on ALL interactive components (required for React hydration in Astro)
- Import path: `'../../../components/interactive/ComponentName.tsx'`
- English version: same structure, `locale: en`, English content, components get `locale="en"` prop via wrapper or directly
- References must be real papers/URLs (verified in spec)

## Dependency Graph & Phase Plan

```
Phase 1 (parallel):  Task 1 (YAML) | Task 2 (art.1) | Task 3 (art.4) | Task 4 (art.6) | Task 5 (art.9)
Phase 2 (parallel):  Task 6 (art.2) | Task 7 (art.7) | Task 8 (art.10)
Phase 3 (parallel):  Task 9 (art.3) | Task 10 (art.8)
Phase 4:             Task 11 (art.5)
Final:               Task 12 (full build validation)
```

---

## Task 1: Create Learning Path YAML

**Files:**
- Create: `src/content/paths/transformer-across-modalities.yaml`

- [ ] **Step 1: Create the learning path YAML**

```yaml
id: transformer-across-modalities
title:
  zh: "Transformer 跨模态应用"
  en: "Transformer Across Modalities"
description:
  zh: "从文本表征到多模态生成，理解 Transformer 如何适配文本、图像、音频和视频等不同模态的输入与输出。建议先完成「Transformer 核心机制」路径。"
  en: "From text representation to multimodal generation — understand how Transformers adapt to text, image, audio, and video modalities. Recommended: complete the Transformer Core Mechanisms path first."
level: intermediate
articles:
  - text-representation
  - bert-and-gpt
  - sentence-embeddings
  - vision-transformer
  - multimodal-alignment
  - diffusion-fundamentals
  - diffusion-transformer
  - video-generation
  - audio-speech-models
  - audio-music-generation
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS (articles don't exist yet, but YAML structure should be valid)

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/transformer-across-modalities.yaml
git commit -m "feat: add transformer-across-modalities learning path definition"
```

---

## Phase 1: Independent Starting Points (4 articles, parallel)

### Task 2: Article 1 — `text-representation`

**Files:**
- Create: `src/components/interactive/BPEMergeVisualization.tsx`
- Create: `src/components/interactive/TokenizerComparison.tsx`
- Create: `src/components/interactive/WordEmbeddingSpace.tsx`
- Create: `src/components/interactive/SkipgramTraining.tsx`
- Create: `src/components/interactive/StaticVsContextual.tsx`
- Create: `src/content/articles/zh/text-representation.mdx`
- Create: `src/content/articles/en/text-representation.mdx`

#### Components

- [ ] **Step 1: Create `BPEMergeVisualization.tsx`**

Interactive BPE tokenization demo. User sees a text input, and the component shows step-by-step BPE merge operations: initial character split → count pair frequencies → merge most frequent pair → repeat.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: currentStep (number), inputText (string)
// Visualization: SVG showing token sequence as colored boxes,
//   with a "Next Merge" button that highlights the most frequent pair,
//   merges them, and updates the token sequence.
// Side panel: shows merge table (pair → frequency → new token)
// Dimensions: W=800, H=400
```

- [ ] **Step 2: Create `TokenizerComparison.tsx`**

Side-by-side comparison of how the same sentence gets tokenized by different algorithms.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedSentence (from preset list), activeTokenizer ('bpe' | 'wordpiece' | 'sentencepiece')
// Visualization: 3 rows showing the same sentence tokenized differently.
//   Each token is a colored box with its ID.
//   Highlight differences between tokenizers.
//   Show vocab size and token count stats below each row.
// Preset sentences: one English, one Chinese, one mixed, one with rare words
// Dimensions: W=800, H=350
```

- [ ] **Step 3: Create `WordEmbeddingSpace.tsx`**

2D scatter plot of word vectors showing semantic relationships and analogy operations.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedAnalogy (preset king-queen, man-woman, etc.), hoveredWord
// Data: pre-computed 2D coordinates for ~50 words (PCA-reduced),
//   grouped by semantic clusters (royalty, gender, country-capital, etc.)
// Visualization: SVG scatter plot with labeled dots.
//   Clicking an analogy highlights the 4 words and draws the parallelogram.
//   Arrow vectors show the relationship (king→queen ≈ man→woman).
// Dimensions: W=800, H=500
```

- [ ] **Step 4: Create `SkipgramTraining.tsx`**

Animated visualization of the Skip-gram sliding window and training objective.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: currentPosition (center word index), windowSize (1-3 slider)
// Data: a sample sentence (~10 words)
// Visualization: sentence as a horizontal row of word boxes.
//   Center word highlighted in primary color.
//   Context window highlighted in secondary color.
//   Arrows from center word to each context word showing training pairs.
//   Below: a simplified neural network diagram showing input→hidden→output.
//   "Next" button advances the center word position with animation.
// Dimensions: W=800, H=400
```

- [ ] **Step 5: Create `StaticVsContextual.tsx`**

Shows how the same word gets identical static embeddings but different contextual embeddings across sentences.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedWord ('bank', 'apple', etc.)
// Data: 2-3 sentences per word with different meanings
//   e.g., "I went to the bank to deposit money" vs "I sat on the river bank"
// Visualization: Left panel shows 2 sentences with the target word highlighted.
//   Right panel shows a 2D embedding space:
//     - Static: both instances map to the SAME point (one dot)
//     - Contextual: instances map to DIFFERENT points (two dots, near their semantic neighbors)
//   Toggle between "Static (Word2Vec)" and "Contextual (BERT)" views.
// Dimensions: W=800, H=450
```

#### Article Content

- [ ] **Step 6: Write `src/content/articles/zh/text-representation.mdx`**

Frontmatter:

```yaml
title: "从文本到向量：Tokenization 与词嵌入"
slug: text-representation
locale: zh
tags: [tokenization, embedding, word2vec, nlp]
prerequisites: []
difficulty: beginner
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Efficient Estimation of Word Representations in Vector Space"
    url: "https://arxiv.org/abs/1301.3781"
  - type: paper
    title: "Neural Machine Translation of Rare Words with Subword Units"
    url: "https://arxiv.org/abs/1508.07909"
  - type: paper
    title: "GloVe: Global Vectors for Word Representation"
    url: "https://nlp.stanford.edu/pubs/glove.pdf"
  - type: paper
    title: "SentencePiece: A simple and language independent subword tokenizer"
    url: "https://arxiv.org/abs/1808.06226"
  - type: website
    title: "The Illustrated Word2Vec"
    url: "https://jalammar.github.io/illustrated-word2vec/"
  - type: website
    title: "Hugging Face Tokenizer Summary"
    url: "https://huggingface.co/docs/transformers/tokenizer_summary"
```

Content sections (follow spec Article 1 outline):
1. 简介 — NLP 的第一个问题：文本怎么变成数字
2. 直觉理解：字符 vs 词 vs 子词 — 用 `<BPEMergeVisualization client:visible />`
3. Tokenizer 家族 — BPE/WordPiece/SentencePiece/Tiktoken 对比，用 `<TokenizerComparison client:visible />`
4. 从 Token 到向量 — one-hot 维度灾难 → 分布式假说
5. Word2Vec — Skip-gram/CBOW 训练，用 `<SkipgramTraining client:visible />` + `<WordEmbeddingSpace client:visible />`
6. GloVe — 全局共现矩阵，与 Word2Vec 互补
7. 静态嵌入的局限 — 一词多义问题，用 `<StaticVsContextual client:visible />`
8. 总结

Key formulas to include:
- Skip-gram objective: $\max \frac{1}{T}\sum_{t=1}^{T} \sum_{-c \le j \le c, j \ne 0} \log p(w_{t+j} | w_t)$
- Softmax: $p(w_O | w_I) = \frac{\exp(\mathbf{v}_{w_O}' \cdot \mathbf{v}_{w_I})}{\sum_{w=1}^{W} \exp(\mathbf{v}_w' \cdot \mathbf{v}_{w_I})}$
- GloVe objective: $J = \sum_{i,j=1}^{V} f(X_{ij})(w_i^T \tilde{w}_j + b_i + \tilde{b}_j - \log X_{ij})^2$

- [ ] **Step 7: Write `src/content/articles/en/text-representation.mdx`**

Same structure as zh version. Translate all content to English. Components get `locale="en"`:
```mdx
<BPEMergeVisualization client:visible locale="en" />
```

- [ ] **Step 8: Validate and build**

```bash
npm run validate && npm run build
```

Expected: PASS for both commands.

- [ ] **Step 9: Commit**

```bash
git add src/components/interactive/BPEMergeVisualization.tsx \
        src/components/interactive/TokenizerComparison.tsx \
        src/components/interactive/WordEmbeddingSpace.tsx \
        src/components/interactive/SkipgramTraining.tsx \
        src/components/interactive/StaticVsContextual.tsx \
        src/content/articles/zh/text-representation.mdx \
        src/content/articles/en/text-representation.mdx
git commit -m "feat: add text-representation article with 5 interactive components (zh+en)"
```

---

### Task 3: Article 4 — `vision-transformer`

**Files:**
- Create: `src/components/interactive/PatchEmbeddingDemo.tsx`
- Create: `src/components/interactive/PatchPositionEncoding.tsx`
- Create: `src/components/interactive/ViTForwardFlow.tsx`
- Create: `src/components/interactive/CNNvsViTComparison.tsx`
- Create: `src/components/interactive/ViTScalingChart.tsx`
- Create: `src/content/articles/zh/vision-transformer.mdx`
- Create: `src/content/articles/en/vision-transformer.mdx`

#### Components

- [ ] **Step 1: Create `PatchEmbeddingDemo.tsx`**

Shows how an image gets cut into patches and projected into token embeddings.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: patchSize (16 | 32 dropdown), showProjection (boolean)
// Visualization: Left side shows a sample image (drawn as colored grid pixels in SVG)
//   with a grid overlay showing patch boundaries.
//   Animation: patches lift off the image one by one → flatten into 1D strips → pass through
//   a "Linear Projection" box → become colored embedding vectors in a sequence.
//   Below: shows the resulting token count: "224×224 image / 16×16 patches = 196 tokens"
// Dimensions: W=800, H=500
```

- [ ] **Step 2: Create `PatchPositionEncoding.tsx`**

Visualizes the learned position embeddings' similarity structure, showing they capture 2D spatial layout.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedPatch (index, click to select)
// Data: pre-computed 14×14 similarity matrix (cosine similarity between position embeddings)
// Visualization: Left: 14×14 grid of patches. Click one to select.
//   Right: heatmap showing cosine similarity of selected patch's position embedding
//   with all other patches. Should reveal that nearby patches have higher similarity,
//   and the 2D spatial structure is preserved even though positions are 1D.
// Dimensions: W=800, H=400
```

- [ ] **Step 3: Create `ViTForwardFlow.tsx`**

End-to-end ViT forward pass animation using StepNavigator.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Uses StepNavigator primitive with 5 steps:
//   1. Input image (224×224)
//   2. Patch extraction + [CLS] token prepend → 197 tokens
//   3. Linear projection + position encoding → (197, D) tensor
//   4. Transformer Encoder (L layers of self-attention + FFN)
//   5. [CLS] output → classification head → class prediction
// Each step shows tensor shape annotation using TensorShape primitive if available
// Dimensions: W=800, H=500
```

- [ ] **Step 4: Create `CNNvsViTComparison.tsx`**

Side-by-side comparison of how CNN and ViT "see" an image.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: currentLayer (slider, 1-6)
// Visualization: Two panels side by side.
//   Left (CNN): shows a receptive field that grows with each layer.
//     Layer 1: 3×3 local patches highlighted.
//     Layer 2: 5×5. Layer 3: larger, etc.
//     Key message: "local → global, gradually"
//   Right (ViT): shows full self-attention from layer 1.
//     Every patch can attend to every other patch.
//     Attention lines drawn from one patch to all others.
//     Key message: "global from the start"
// Dimensions: W=800, H=400
```

- [ ] **Step 5: Create `ViTScalingChart.tsx`**

Line chart showing ViT vs CNN performance at different data/model scales.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Data: pre-defined data points from ViT paper Figure 3/5
//   x-axis: pre-training dataset size (ImageNet-1k, ImageNet-21k, JFT-300M)
//   y-axis: ImageNet accuracy
//   Lines: ResNet-152, ViT-B/16, ViT-L/16, ViT-H/14
// Visualization: SVG line chart with labeled axes.
//   Key insight highlighted: "CNN wins at small data, ViT wins at large data"
//   Annotation arrows pointing to crossover region.
// Dimensions: W=800, H=450
```

#### Article Content

- [ ] **Step 6: Write `src/content/articles/zh/vision-transformer.mdx`**

Frontmatter:

```yaml
title: "Vision Transformer：当图像变成 Token 序列"
slug: vision-transformer
locale: zh
tags: [vision-transformer, vit, image-recognition, computer-vision]
prerequisites: [transformer-overview]
difficulty: intermediate
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"
    url: "https://arxiv.org/abs/2010.11929"
  - type: paper
    title: "Training data-efficient image transformers & distillation through attention"
    url: "https://arxiv.org/abs/2012.12877"
  - type: paper
    title: "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows"
    url: "https://arxiv.org/abs/2103.14030"
```

Content sections (follow spec Article 4 outline):
1. 简介 — Transformer 不只能处理文本
2. 直觉理解：图像的"词"是什么 — patch = token 类比 + `<PatchEmbeddingDemo client:visible />`
3. 位置编码 — 2D 空间信息如何编入 1D 序列 + `<PatchPositionEncoding client:visible />`
4. 完整前向流程 — `<ViTForwardFlow client:visible />`
5. 与 CNN 的对比 — `<CNNvsViTComparison client:visible />`
6. Scaling 特性 — `<ViTScalingChart client:visible />`
7. 后续变体 — DeiT, Swin (text only, no component)
8. 总结

Key formulas:
- Patch embedding: $\mathbf{z}_0 = [\mathbf{x}_{\text{class}}; \mathbf{x}_p^1 E; \mathbf{x}_p^2 E; \cdots; \mathbf{x}_p^N E] + \mathbf{E}_{\text{pos}}$
  where $E \in \mathbb{R}^{(P^2 \cdot C) \times D}$, $N = HW/P^2$

- [ ] **Step 7: Write `src/content/articles/en/vision-transformer.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 8: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/PatchEmbeddingDemo.tsx \
        src/components/interactive/PatchPositionEncoding.tsx \
        src/components/interactive/ViTForwardFlow.tsx \
        src/components/interactive/CNNvsViTComparison.tsx \
        src/components/interactive/ViTScalingChart.tsx \
        src/content/articles/zh/vision-transformer.mdx \
        src/content/articles/en/vision-transformer.mdx
git commit -m "feat: add vision-transformer article with 5 interactive components (zh+en)"
```

---

### Task 4: Article 6 — `diffusion-fundamentals`

**Files:**
- Create: `src/components/interactive/ForwardDiffusionProcess.tsx`
- Create: `src/components/interactive/ReverseDenoisingSteps.tsx`
- Create: `src/components/interactive/NoiseScheduleComparison.tsx`
- Create: `src/components/interactive/UNetArchitecture.tsx`
- Create: `src/components/interactive/GuidanceScaleDemo.tsx`
- Create: `src/content/articles/zh/diffusion-fundamentals.mdx`
- Create: `src/content/articles/en/diffusion-fundamentals.mdx`

#### Components

- [ ] **Step 1: Create `ForwardDiffusionProcess.tsx`**

Interactive slider showing progressive noise addition on an image.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: timestep (0 to T, slider)
// Visualization: A simplified "image" (8×8 colored pixel grid in SVG).
//   As timestep slider moves right, pixels progressively blend toward Gaussian noise.
//   Each pixel: color = (1-α_t) * original_color + α_t * random_gray
//   Pre-compute noise for reproducibility (seeded random).
//   Below slider: show α_t value, "signal %" and "noise %" bars.
//   Labels: t=0 "Original image", t=T "Pure noise"
// Dimensions: W=800, H=400
```

- [ ] **Step 2: Create `ReverseDenoisingSteps.tsx`**

Step-by-step denoising animation from noise to image.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: currentStep (0 to ~10, button-driven)
// Visualization: Shows a sequence of 8×8 grids at different denoising steps.
//   Starts from pure noise, each step reveals more structure.
//   Use StepNavigator or simple "Previous/Next" buttons.
//   Each step shows: the grid, the predicted noise (separate small grid),
//   and the formula: x_{t-1} = f(x_t, ε_θ(x_t, t))
//   Highlight that the model predicts the noise, not the image directly.
// Dimensions: W=800, H=450
```

- [ ] **Step 3: Create `NoiseScheduleComparison.tsx`**

Line chart comparing linear vs cosine noise schedules.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: none (static comparison, hover for details)
// Data: compute α_bar_t for both schedules across T=1000 steps
//   Linear: β_t linearly from 0.0001 to 0.02
//   Cosine: α_bar_t = cos((t/T + s)/(1+s) * π/2)^2
// Visualization: SVG line chart.
//   x-axis: timestep (0 to T), y-axis: α_bar_t (signal retention)
//   Two curves: linear (drops fast early) vs cosine (drops uniformly).
//   Annotation: "Linear wastes steps in low-noise region"
//   Hover shows exact values.
// Dimensions: W=800, H=350
```

- [ ] **Step 4: Create `UNetArchitecture.tsx`**

Structural diagram of U-Net showing the encoder-decoder with skip connections.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: hoveredBlock (string | null)
// Visualization: U-shape SVG diagram.
//   Left arm (encoder): 4 blocks descending, each showing spatial resolution shrinking
//     (64→32→16→8) and channels growing (64→128→256→512).
//   Bottom: bottleneck block with timestep embedding injection.
//   Right arm (decoder): 4 blocks ascending, resolution growing back.
//   Skip connections: horizontal arrows from encoder to decoder at each level.
//   Hover a block to highlight it and show details.
//   Timestep t and class c injection points marked with special icons.
// Dimensions: W=800, H=500
```

- [ ] **Step 5: Create `GuidanceScaleDemo.tsx`**

Slider showing the effect of classifier-free guidance scale on generation diversity vs fidelity.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: guidanceScale (1.0 to 15.0, slider)
// Visualization: conceptual illustration (not real images).
//   Top: a row of 4 "generated samples" represented as abstract colored shapes.
//   At low guidance (1-2): shapes are diverse but blurry/random.
//   At medium guidance (7-8): shapes match the prompt well, still varied.
//   At high guidance (12-15): shapes are very similar, sharp but repetitive.
//   Below: formula ε = ε_uncond + s * (ε_cond - ε_uncond)
//   Annotations: "diversity ←→ fidelity" spectrum bar.
// Dimensions: W=800, H=400
```

#### Article Content

- [ ] **Step 6: Write `src/content/articles/zh/diffusion-fundamentals.mdx`**

Frontmatter:

```yaml
title: "扩散模型基础：从噪声中生成"
slug: diffusion-fundamentals
locale: zh
tags: [diffusion, ddpm, generative-model, image-generation]
prerequisites: []
difficulty: intermediate
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Denoising Diffusion Probabilistic Models"
    url: "https://arxiv.org/abs/2006.11239"
  - type: paper
    title: "Denoising Diffusion Implicit Models"
    url: "https://arxiv.org/abs/2010.02502"
  - type: paper
    title: "High-Resolution Image Synthesis with Latent Diffusion Models"
    url: "https://arxiv.org/abs/2112.10752"
  - type: paper
    title: "Classifier-Free Diffusion Guidance"
    url: "https://arxiv.org/abs/2207.12598"
```

Content sections (follow spec Article 6 outline):
1. 简介 — 生成模型的新范式
2. 生成模型家族 — GAN/VAE/Flow/Diffusion 简要对比 (text only)
3. 前向扩散 — 逐步加噪 + `<ForwardDiffusionProcess client:visible />`
4. 反向去噪 — 学习从噪声恢复 + `<ReverseDenoisingSteps client:visible />`
5. 噪声调度 — `<NoiseScheduleComparison client:visible />`
6. U-Net 骨干 — `<UNetArchitecture client:visible />`
7. 条件生成与 CFG — `<GuidanceScaleDemo client:visible />`
8. 加速采样 — DDIM (text only)
9. Latent Diffusion — Stable Diffusion 的核心 (text only)
10. 总结

Key formulas:
- Forward: $q(x_t | x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} x_0, (1 - \bar{\alpha}_t) I)$
- Training loss: $\mathcal{L} = \mathbb{E}_{t, x_0, \epsilon}[\| \epsilon - \epsilon_\theta(x_t, t) \|^2]$
- CFG: $\tilde{\epsilon}_\theta = \epsilon_\theta(x_t, \varnothing) + s \cdot (\epsilon_\theta(x_t, c) - \epsilon_\theta(x_t, \varnothing))$

- [ ] **Step 7: Write `src/content/articles/en/diffusion-fundamentals.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 8: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/ForwardDiffusionProcess.tsx \
        src/components/interactive/ReverseDenoisingSteps.tsx \
        src/components/interactive/NoiseScheduleComparison.tsx \
        src/components/interactive/UNetArchitecture.tsx \
        src/components/interactive/GuidanceScaleDemo.tsx \
        src/content/articles/zh/diffusion-fundamentals.mdx \
        src/content/articles/en/diffusion-fundamentals.mdx
git commit -m "feat: add diffusion-fundamentals article with 5 interactive components (zh+en)"
```

---

### Task 5: Article 9 — `audio-speech-models`

**Files:**
- Create: `src/components/interactive/AudioTokenizationComparison.tsx`
- Create: `src/components/interactive/MelSpectrogramVisualization.tsx`
- Create: `src/components/interactive/WhisperArchitecture.tsx`
- Create: `src/components/interactive/VALLEPipeline.tsx`
- Create: `src/components/interactive/RVQLayerVisualization.tsx`
- Create: `src/content/articles/zh/audio-speech-models.mdx`
- Create: `src/content/articles/en/audio-speech-models.mdx`

#### Components

- [ ] **Step 1: Create `AudioTokenizationComparison.tsx`**

Side-by-side comparison of spectrogram vs codec token approaches to audio tokenization.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: activeTab ('spectrogram' | 'codec')
// Visualization: Two-panel comparison.
//   Left path: Waveform → STFT → Mel filterbank → 2D Mel spectrogram
//     Show each stage as a diagram block with arrow connections.
//     The Mel spectrogram is a heatmap-style grid (time × freq).
//   Right path: Waveform → EnCodec encoder → RVQ → Discrete token grid
//     Show the codec tokens as a matrix (codebook layers × time steps).
//   Bottom: comparison table — continuous vs discrete, resolution, compression ratio
// Dimensions: W=800, H=500
```

- [ ] **Step 2: Create `MelSpectrogramVisualization.tsx`**

Visualizes a Mel spectrogram with labeled axes.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: none (or hover to show frequency/time values)
// Data: pre-computed Mel spectrogram data for a short utterance (~2 sec)
//   Represented as a 2D grid of energy values (80 mel bins × 200 time frames).
//   Use synthetic data that mimics real speech patterns:
//     - Harmonics visible as horizontal bands
//     - Formants visible as brighter regions
//     - Silence gaps between words
// Visualization: SVG heatmap grid.
//   x-axis: Time (0-2s), y-axis: Mel frequency (0-8kHz).
//   Color: intensity mapped to COLORS palette (dark=low energy, bright=high energy).
//   Annotations: "Whisper 输入: 30秒 × 80 mel bins = (3000, 80)"
// Dimensions: W=800, H=350
```

- [ ] **Step 3: Create `WhisperArchitecture.tsx`**

End-to-end Whisper architecture flow using StepNavigator.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Uses StepNavigator with 5 steps:
//   1. Audio input → 30-second segments (pad/truncate)
//   2. Log-Mel spectrogram (80 bins × 3000 frames)
//   3. CNN stem (2 conv layers) → feature sequence
//   4. Transformer Encoder (multi-head attention over audio features)
//   5. Transformer Decoder (autoregressive: generates text tokens including
//      special tokens: <|startoftranscript|>, <|en|>, <|transcribe|>, timestamps)
// Show multitask design: same model does ASR, translation, language detection
// Dimensions: W=800, H=500
```

- [ ] **Step 4: Create `VALLEPipeline.tsx`**

VALL-E two-stage generation pipeline.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Uses StepNavigator with 4 steps:
//   1. Input: text phonemes + 3-second audio prompt → EnCodec → 8-layer codec tokens
//   2. AR stage: Transformer predicts codec layer 1 tokens (coarse structure)
//      Show autoregressive left-to-right generation on layer 1
//   3. NAR stage: Transformer predicts layers 2-8 in parallel (fine details)
//      Show all remaining layers filled in simultaneously
//   4. EnCodec decoder: all 8 layers → reconstructed waveform
// Highlight: "TTS redefined as a language modeling problem"
// Dimensions: W=800, H=500
```

- [ ] **Step 5: Create `RVQLayerVisualization.tsx`**

Shows how Residual Vector Quantization progressively refines audio quality.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: visibleLayers (1-8, slider)
// Visualization: A column of 8 horizontal bars, each representing one RVQ codebook layer.
//   Layer 1 (top): coarse features — show a very blocky/pixelated waveform representation
//   Each subsequent layer: adds detail — waveform gets smoother.
//   Slider controls how many layers are "active".
//   Right side: show residual at each level getting smaller.
//   Bottom: "Layer 1: speech structure, Layer 2-3: speaker identity, Layer 4-8: acoustic details"
// Dimensions: W=800, H=450
```

#### Article Content

- [ ] **Step 6: Write `src/content/articles/zh/audio-speech-models.mdx`**

Frontmatter:

```yaml
title: "语音与 Transformer：从 Whisper 到 VALL-E"
slug: audio-speech-models
locale: zh
tags: [audio, speech, whisper, vall-e, tts, transformer]
prerequisites: [transformer-overview]
difficulty: advanced
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Robust Speech Recognition via Large-Scale Weak Supervision"
    url: "https://arxiv.org/abs/2212.04356"
  - type: paper
    title: "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers"
    url: "https://arxiv.org/abs/2301.02111"
  - type: paper
    title: "High Fidelity Neural Audio Compression"
    url: "https://arxiv.org/abs/2210.13438"
```

Content sections (follow spec Article 9 outline):
1. 简介 — 音频是另一种"序列"
2. 音频 Tokenization 的两条路 — `<AudioTokenizationComparison client:visible />`
3. Mel 频谱图详解 — `<MelSpectrogramVisualization client:visible />`
4. Whisper — `<WhisperArchitecture client:visible />`
5. VALL-E — `<VALLEPipeline client:visible />` + `<RVQLayerVisualization client:visible />`
6. Bark 与其他 TTS — text only
7. 总结

- [ ] **Step 7: Write `src/content/articles/en/audio-speech-models.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 8: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/AudioTokenizationComparison.tsx \
        src/components/interactive/MelSpectrogramVisualization.tsx \
        src/components/interactive/WhisperArchitecture.tsx \
        src/components/interactive/VALLEPipeline.tsx \
        src/components/interactive/RVQLayerVisualization.tsx \
        src/content/articles/zh/audio-speech-models.mdx \
        src/content/articles/en/audio-speech-models.mdx
git commit -m "feat: add audio-speech-models article with 5 interactive components (zh+en)"
```

---

## Phase 2: Second Wave (3 articles, parallel, depends on Phase 1)

### Task 6: Article 2 — `bert-and-gpt`

**Depends on:** Task 2 (text-representation)

**Files:**
- Create: `src/components/interactive/MLMDemo.tsx`
- Create: `src/components/interactive/BERTNLUPipeline.tsx`
- Create: `src/components/interactive/AutoregressiveGeneration.tsx`
- Create: `src/components/interactive/ClassificationVsGeneration.tsx`
- Create: `src/components/interactive/ScalingLawChart.tsx`
- Create: `src/content/articles/zh/bert-and-gpt.mdx`
- Create: `src/content/articles/en/bert-and-gpt.mdx`

#### Components

- [ ] **Step 1: Create `MLMDemo.tsx`**

Interactive Masked Language Model demo where users guess masked tokens.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: maskedPositions (Set<number>), revealedPositions (Set<number>)
// Data: 2-3 preset sentences. For each sentence, ~15% of tokens are masked.
//   Each masked position has a "correct" answer and 3 distractors.
// Visualization:
//   Sentence displayed as token boxes. Masked tokens show [MASK] in red.
//   Click a [MASK] → dropdown with 4 choices. Correct choice turns green.
//   After all revealed: "This is exactly how BERT learns — predict the masked tokens"
//   Show the training objective: P(w_mask | context)
// Dimensions: W=800, H=300
```

- [ ] **Step 2: Create `BERTNLUPipeline.tsx`**

Animated BERT joint intent+slot NLU pipeline using StepNavigator.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Uses StepNavigator with 5 steps:
//   1. Input: "Book a flight from Beijing to Shanghai tomorrow"
//      Show tokenization: [CLS] Book a flight from Beijing to Shanghai tomorrow [SEP]
//   2. BERT encoding: all tokens pass through Transformer encoder layers.
//      Animated arrows showing bidirectional attention.
//   3. Intent head: [CLS] output → linear layer → softmax → "BookFlight" intent
//      Show the [CLS] vector being extracted and classified.
//   4. Slot head: each token output → linear layer → BIO tags
//      Show: Book→O, a→O, flight→O, from→O, Beijing→B-depart, to→O, Shanghai→B-arrive, tomorrow→B-date
//   5. Joint result: Intent = BookFlight, Slots highlighted on original sentence.
//      Show loss formula: L = α·L_intent + (1-α)·L_slot
// Dimensions: W=800, H=500
```

- [ ] **Step 3: Create `AutoregressiveGeneration.tsx`**

Step-by-step autoregressive text generation with causal mask visualization.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: generatedTokens (string[]), isGenerating (boolean)
// Data: a prompt "The capital of France is" → generates " Paris", ".", " It", ...
// Visualization:
//   Top: token sequence growing left to right. Each new token appears with fade-in animation.
//   Bottom: causal attention mask matrix.
//     Lower triangular matrix where row i can only see columns 0..i.
//     Current generation step highlighted. Newly generated token column fills in.
//   "Generate Next" button or auto-play mode.
//   Each step: show P(next | previous tokens) as a small bar chart of top-5 candidates.
// Dimensions: W=800, H=500
```

- [ ] **Step 4: Create `ClassificationVsGeneration.tsx`**

Split-screen comparison of the same task solved by classification vs generation.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedTask ('sentiment' | 'intent' | 'ner'), activeView ('classification' | 'generation')
// Visualization: Two columns side by side.
//   Left (Classification / BERT):
//     Input → BERT → [CLS]/token outputs → task head → structured output
//     Show: specific label set, softmax probabilities, deterministic result
//     Metrics: fast inference, high accuracy, needs labeled data
//   Right (Generation / GPT):
//     Input + instruction prompt → GPT → generated text → parse answer
//     Show: free-form output, sampled token by token
//     Metrics: flexible, zero-shot capable, slower, non-deterministic
//   Toggle between 3 tasks to see different examples.
//   Bottom: trade-off summary bar (speed, accuracy, flexibility, data needs)
// Dimensions: W=800, H=500
```

- [ ] **Step 5: Create `ScalingLawChart.tsx`**

Chart showing GPT scaling progression and emergent capabilities.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Data: pre-defined data points
//   x-axis: parameters (log scale): GPT-1 (117M), GPT-2 (1.5B), GPT-3 (175B)
//   y-axis: performance metrics (validation loss, benchmark accuracy)
//   Additional annotations: key capabilities at each scale
//     GPT-1: basic language understanding, fine-tune required
//     GPT-2: zero-shot task transfer begins
//     GPT-3: in-context learning, few-shot emerges
// Visualization: SVG log-scale scatter/line chart.
//   Milestones as labeled points with annotation cards.
//   Trend line showing power law relationship.
//   Kaplan et al. formula annotation: L(N) ∝ N^{-α}
// Dimensions: W=800, H=450
```

#### Article Content

- [ ] **Step 6: Write `src/content/articles/zh/bert-and-gpt.mdx`**

Frontmatter:

```yaml
title: "BERT 与 GPT：理解与生成的两条路线"
slug: bert-and-gpt
locale: zh
tags: [bert, gpt, pretraining, nlp, nlu, classification, generation]
prerequisites: [text-representation]
difficulty: intermediate
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"
    url: "https://arxiv.org/abs/1810.04805"
  - type: paper
    title: "Improving Language Understanding by Generative Pre-Training"
    url: "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf"
  - type: paper
    title: "Language Models are Unsupervised Multitask Learners"
    url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"
  - type: paper
    title: "Language Models are Few-Shot Learners"
    url: "https://arxiv.org/abs/2005.14165"
  - type: paper
    title: "BERT for Joint Intent Classification and Slot Filling"
    url: "https://arxiv.org/abs/1902.10909"
  - type: paper
    title: "Scaling Laws for Neural Language Models"
    url: "https://arxiv.org/abs/2001.08361"
```

Content sections (follow spec Article 2 outline):
1. 简介 — 同一个 Transformer 的两种用法
2. 从静态到上下文 — ELMo → Transformer (text only)
3. BERT：理解派 — MLM + NSP + `<MLMDemo client:visible />`
4. BERT 实战：NLU 联合模型 — intent + slot + BIO + `<BERTNLUPipeline client:visible />`
5. GPT：生成派 — 自回归 + scaling + `<AutoregressiveGeneration client:visible />` + `<ScalingLawChart client:visible />`
6. Classification vs Generation — `<ClassificationVsGeneration client:visible />`
7. 殊途同归 — decoder-only 为何胜出 + BERT 遗产 (text only)
8. 总结

Key formulas:
- MLM: $\mathcal{L}_{\text{MLM}} = -\mathbb{E}\left[\sum_{i \in \mathcal{M}} \log p(x_i | x_{\backslash\mathcal{M}})\right]$
- Joint NLU loss: $\mathcal{L} = \alpha \mathcal{L}_{\text{intent}} + (1-\alpha) \mathcal{L}_{\text{slot}}$
- Scaling law: $L(N) = (N_c / N)^{\alpha_N}$ where $\alpha_N \approx 0.076$

- [ ] **Step 7: Write `src/content/articles/en/bert-and-gpt.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 8: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/MLMDemo.tsx \
        src/components/interactive/BERTNLUPipeline.tsx \
        src/components/interactive/AutoregressiveGeneration.tsx \
        src/components/interactive/ClassificationVsGeneration.tsx \
        src/components/interactive/ScalingLawChart.tsx \
        src/content/articles/zh/bert-and-gpt.mdx \
        src/content/articles/en/bert-and-gpt.mdx
git commit -m "feat: add bert-and-gpt article with 5 interactive components (zh+en)"
```

---

### Task 7: Article 7 — `diffusion-transformer`

**Depends on:** Task 4 (diffusion-fundamentals)

**Files:**
- Create: `src/components/interactive/UNetVsDiTArchitecture.tsx`
- Create: `src/components/interactive/DiTPatchifyProcess.tsx`
- Create: `src/components/interactive/AdaLNZeroMechanism.tsx`
- Create: `src/components/interactive/DiTScalingChart.tsx`
- Create: `src/components/interactive/MMDiTFlow.tsx`
- Create: `src/content/articles/zh/diffusion-transformer.mdx`
- Create: `src/content/articles/en/diffusion-transformer.mdx`

#### Components

- [ ] **Step 1: Create `UNetVsDiTArchitecture.tsx`**

Side-by-side architectural comparison of U-Net and DiT.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: activeHighlight ('input' | 'backbone' | 'output' | null)
// Visualization: Two columns.
//   Left (U-Net): U-shaped encoder-decoder with skip connections (reuse UNetArchitecture style)
//     Label: "CNN-based, fixed resolution, limited scaling"
//   Right (DiT): linear pipeline: patchify → N × Transformer blocks → unpatchify
//     Label: "Transformer-based, flexible, scales with compute"
//   Shared: same input (noisy latent) and output (predicted noise) at top and bottom.
//   Hover on a section (input/backbone/output) highlights both sides.
//   Bottom: comparison table (params, FLOPs, scaling behavior)
// Dimensions: W=800, H=500
```

- [ ] **Step 2: Create `DiTPatchifyProcess.tsx`**

Animation of the DiT patchify → process → unpatchify pipeline.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Uses StepNavigator with 4 steps:
//   1. Input: noisy latent (32×32×4 grid, from VAE encoder)
//   2. Patchify: divide into 2×2 patches → flatten → linear project → 256 tokens of dim D
//      Show tensor shape: (256, D). Add [t, c] conditioning tokens.
//   3. Transformer: N layers of self-attention + FFN with adaLN-Zero conditioning.
//      Show the blocks as a vertical stack.
//   4. Unpatchify: tokens → reshape back to 32×32×4 → predicted noise
//      Show the final output overlaid on the input to show the denoising effect.
// Dimensions: W=800, H=500
```

- [ ] **Step 3: Create `AdaLNZeroMechanism.tsx`**

Detailed visualization of adaptive Layer Norm with zero initialization.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: none (animated walkthrough)
// Visualization: Single Transformer block with adaLN-Zero detailed.
//   Left: timestep t and class c → concatenate → MLP → output 6 parameters (γ1, β1, α1, γ2, β2, α2)
//   Center: Transformer block with annotations:
//     - Before attention: LayerNorm with (γ1, β1) applied → adaLN
//     - After attention: multiply output by α1 (gate) → residual add
//     - Before FFN: LayerNorm with (γ2, β2) applied
//     - After FFN: multiply output by α2 (gate) → residual add
//   Key insight annotation: "α initialized to 0 → at init, each block is an identity function"
//   Formula: adaLN(h, y) = γ(y) ⊙ LayerNorm(h) + β(y)
// Dimensions: W=800, H=500
```

- [ ] **Step 4: Create `DiTScalingChart.tsx`**

FID vs compute chart for DiT model sizes.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Data: from DiT paper Table 1 / Figure 5
//   DiT-S/2: 33M params, ~FID 68 (400K steps)
//   DiT-B/2: 130M params, ~FID 43
//   DiT-L/2: 458M params, ~FID 23
//   DiT-XL/2: 675M params, ~FID 9.62 (with CFG)
//   x-axis: GFLOPs (log scale), y-axis: FID (lower is better, log scale)
// Visualization: SVG scatter + line chart.
//   Each point labeled with model size.
//   Trend line showing consistent FID improvement with compute.
//   Annotation: "Scaling law holds: more compute → better FID"
//   Compare with U-Net baselines (ADM, LDM) as reference points.
// Dimensions: W=800, H=400
```

- [ ] **Step 5: Create `MMDiTFlow.tsx`**

Stable Diffusion 3's dual-stream MM-DiT architecture.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: currentStep (StepNavigator, 3 steps)
//   1. Input streams: text tokens (from T5/CLIP) and image latent tokens (from VAE)
//      Two parallel token sequences shown.
//   2. Joint attention: both streams attend to each other via shared attention layers.
//      Show arrows crossing between text tokens and image tokens.
//      Unlike CLIP's separate encoders, here they interact inside the model.
//   3. Output: image stream produces predicted noise, text stream is discarded.
//      Final image after denoising shown.
// Key insight: "Two modalities, one shared attention space"
// Dimensions: W=800, H=500
```

#### Article Content

- [ ] **Step 6: Write `src/content/articles/zh/diffusion-transformer.mdx`**

Frontmatter:

```yaml
title: "Diffusion Transformer：用 Transformer 做图像生成"
slug: diffusion-transformer
locale: zh
tags: [dit, diffusion, transformer, image-generation, stable-diffusion]
prerequisites: [diffusion-fundamentals, transformer-overview]
difficulty: advanced
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Scalable Diffusion Models with Transformers"
    url: "https://arxiv.org/abs/2212.09748"
  - type: paper
    title: "Scaling Rectified Flow Transformers for High-Resolution Image Synthesis"
    url: "https://arxiv.org/abs/2403.03206"
```

Content sections (follow spec Article 7 outline):
1. 简介 — 从 U-Net 到 Transformer
2. U-Net 的瓶颈 — 为什么需要替换 (text only)
3. DiT 架构 — patchify/unpatchify + `<UNetVsDiTArchitecture client:visible />` + `<DiTPatchifyProcess client:visible />`
4. 条件注入：adaLN-Zero — `<AdaLNZeroMechanism client:visible />`
5. Scaling 特性 — `<DiTScalingChart client:visible />`
6. MM-DiT — `<MMDiTFlow client:visible />`
7. 总结

Key formulas:
- adaLN: $\text{adaLN}(h, y) = \gamma(y) \odot \text{LayerNorm}(h) + \beta(y)$
- Gate: $h \leftarrow h + \alpha(y) \odot \text{Attention}(\text{adaLN}(h, y))$

- [ ] **Step 7: Write `src/content/articles/en/diffusion-transformer.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 8: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/UNetVsDiTArchitecture.tsx \
        src/components/interactive/DiTPatchifyProcess.tsx \
        src/components/interactive/AdaLNZeroMechanism.tsx \
        src/components/interactive/DiTScalingChart.tsx \
        src/components/interactive/MMDiTFlow.tsx \
        src/content/articles/zh/diffusion-transformer.mdx \
        src/content/articles/en/diffusion-transformer.mdx
git commit -m "feat: add diffusion-transformer article with 5 interactive components (zh+en)"
```

---

### Task 8: Article 10 — `audio-music-generation`

**Depends on:** Task 5 (audio-speech-models)

**Files:**
- Create: `src/components/interactive/MusicVsSpeechComparison.tsx`
- Create: `src/components/interactive/CodebookInterleaving.tsx`
- Create: `src/components/interactive/MusicGenPipeline.tsx`
- Create: `src/components/interactive/MusicGenTimeline.tsx`
- Create: `src/content/articles/zh/audio-music-generation.mdx`
- Create: `src/content/articles/en/audio-music-generation.mdx`

#### Components

- [ ] **Step 1: Create `MusicVsSpeechComparison.tsx`**

Comparison of music vs speech signal characteristics.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: activeTab ('speech' | 'music')
// Visualization: Two-column comparison.
//   Speech side: simple waveform, narrow frequency range, short duration (~5s),
//     single source, linguistic structure (phonemes → words → sentences)
//   Music side: complex waveform, wide frequency range, long duration (~3min),
//     multiple instruments, musical structure (beats → bars → sections → song)
//   Both rendered as stylized SVG waveforms + spectrograms.
//   Bottom: comparison table (duration, complexity, structure, evaluation)
// Dimensions: W=800, H=450
```

- [ ] **Step 2: Create `CodebookInterleaving.tsx`**

MusicGen's delay pattern for multi-codebook token interleaving.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: patternType ('flat' | 'delay'), currentTimestep (animated or slider)
// Visualization: A grid where rows = codebook layers (1-4), columns = time steps.
//   "Flat" pattern: all layers at timestep t must be generated before timestep t+1.
//     This is slow — each column fully filled before moving right.
//   "Delay" pattern: each layer is offset by 1 step.
//     Layer 1: generates t=0 at step 0, t=1 at step 1, ...
//     Layer 2: generates t=0 at step 1, t=1 at step 2, ...
//     This allows parallel generation with a single Transformer.
//   Animation: tokens fill in step by step, color-coded by codebook layer.
//   Highlight the diagonal pattern in delay mode.
// Dimensions: W=800, H=400
```

- [ ] **Step 3: Create `MusicGenPipeline.tsx`**

End-to-end MusicGen generation pipeline.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Uses StepNavigator with 4 steps:
//   1. Input: text description ("upbeat electronic dance music with heavy bass")
//      Optional: melody conditioning (audio input → chromagram extraction)
//   2. Text encoding: T5 encoder → text embeddings (used as cross-attention conditioning)
//   3. Transformer decoder: generates interleaved codec tokens autoregressively.
//      Show the delay pattern grid being filled step by step.
//   4. EnCodec decoder: codec tokens → waveform → audio output
//      Show the final waveform with musical structure annotations.
// Dimensions: W=800, H=500
```

- [ ] **Step 4: Create `MusicGenTimeline.tsx`**

Timeline of music generation model evolution.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Data: timeline entries
//   2020-04: Jukebox (OpenAI) — VQ-VAE + Transformer, raw audio, very slow
//   2023-01: MusicLM (Google) — MuLan + SoundStream, hierarchical tokens
//   2023-06: MusicGen (Meta) — single-stage, delay pattern, text/melody conditioning
//   2024-01: Stable Audio (Stability) — latent diffusion for audio, timing-conditioned
//   2024+: Udio, Suno — commercial music AI
// Visualization: horizontal timeline with labeled milestones.
//   Each entry: model name, company, key innovation in one line.
//   Hover for more details. Color-coded by approach (AR vs diffusion).
// Dimensions: W=800, H=300
```

#### Article Content

- [ ] **Step 5: Write `src/content/articles/zh/audio-music-generation.mdx`**

Frontmatter:

```yaml
title: "音乐生成：当 Transformer 学会作曲"
slug: audio-music-generation
locale: zh
tags: [music-generation, musicgen, jukebox, transformer, audio]
prerequisites: [audio-speech-models]
difficulty: advanced
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Simple and Controllable Music Generation"
    url: "https://arxiv.org/abs/2306.05284"
  - type: paper
    title: "Jukebox: A Generative Model for Music"
    url: "https://arxiv.org/abs/2005.00341"
  - type: paper
    title: "MusicLM: Generating Music From Text"
    url: "https://arxiv.org/abs/2301.11325"
  - type: paper
    title: "Fast Timing-Conditioned Latent Audio Diffusion"
    url: "https://arxiv.org/abs/2402.04825"
```

Content sections (follow spec Article 10 outline):
1. 简介 — 音乐生成的独特挑战
2. 音乐 vs 语音 — `<MusicVsSpeechComparison client:visible />`
3. MusicGen — delay pattern + `<CodebookInterleaving client:visible />` + `<MusicGenPipeline client:visible />`
4. Jukebox — VQ-VAE 多尺度 (text only)
5. Stable Audio / MusicLM — latent diffusion + 层级生成 (text only)
6. 发展历程 — `<MusicGenTimeline client:visible />`
7. 前沿与挑战 — 长程结构、多轨、实时、伦理 (text only)
8. 总结

- [ ] **Step 6: Write `src/content/articles/en/audio-music-generation.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 7: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/MusicVsSpeechComparison.tsx \
        src/components/interactive/CodebookInterleaving.tsx \
        src/components/interactive/MusicGenPipeline.tsx \
        src/components/interactive/MusicGenTimeline.tsx \
        src/content/articles/zh/audio-music-generation.mdx \
        src/content/articles/en/audio-music-generation.mdx
git commit -m "feat: add audio-music-generation article with 4 interactive components (zh+en)"
```

---

## Phase 3: Third Wave (2 articles, parallel, depends on Phase 2)

### Task 9: Article 3 — `sentence-embeddings`

**Depends on:** Task 6 (bert-and-gpt)

**Files:**
- Create: `src/components/interactive/SentenceSimilarityDemo.tsx`
- Create: `src/components/interactive/SiameseNetworkFlow.tsx`
- Create: `src/components/interactive/ContrastiveLearningViz.tsx`
- Create: `src/components/interactive/RAGPipelineFlow.tsx`
- Create: `src/content/articles/zh/sentence-embeddings.mdx`
- Create: `src/content/articles/en/sentence-embeddings.mdx`

#### Components

- [ ] **Step 1: Create `SentenceSimilarityDemo.tsx`**

Interactive cosine similarity calculator between two sentences.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedPair (index into preset list)
// Data: 5-6 preset sentence pairs with pre-computed similarity scores.
//   High similarity: "The cat sat on the mat" / "A cat was sitting on a mat" → 0.92
//   Medium: "I love programming" / "Coding is my passion" → 0.78
//   Low: "The weather is nice today" / "Stock prices fell sharply" → 0.12
// Visualization:
//   Top: two sentence text boxes (selectable from presets).
//   Middle: two vector arrows in 2D (stylized), showing the angle between them.
//     Angle visually represents cosine similarity. Small angle = high similarity.
//   Bottom: formula cos(θ) = (A·B)/(|A||B|), with computed value shown.
//   Color gradient from red (low) to green (high) based on similarity score.
// Dimensions: W=800, H=400
```

- [ ] **Step 2: Create `SiameseNetworkFlow.tsx`**

Sentence-BERT's Siamese architecture animation.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: currentStep (StepNavigator, 4 steps)
//   1. Input: two sentences enter at top.
//   2. Encoding: both sentences pass through SHARED BERT (weight-tied).
//      Two parallel pipelines, shared weights indicated by dashed connection.
//   3. Pooling: each BERT output sequence → mean pooling → single fixed-size vector.
//      Show: (seq_len, 768) → mean → (768,) for each sentence.
//   4. Comparison: cosine similarity between the two pooled vectors.
//      Show the similarity score and training objective:
//      "Maximize similarity for paraphrases, minimize for unrelated pairs"
// Dimensions: W=800, H=500
```

- [ ] **Step 3: Create `ContrastiveLearningViz.tsx`**

Animated batch contrastive learning process.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: trainingStep (0-5, auto-advance with pause)
// Visualization: 2D embedding space (SVG scatter plot).
//   Show 8 sentence embeddings as labeled dots.
//   4 positive pairs (connected by green lines).
//   Negative pairs (connected by red dashed lines).
//   Animation over training steps:
//     Step 0: random positions.
//     Step 1-5: positive pairs gradually move closer, negative pairs move apart.
//   Each step shows the InfoNCE loss value decreasing.
//   Formula: L = -log(exp(sim(z_i,z_j)/τ) / Σ_k exp(sim(z_i,z_k)/τ))
// Dimensions: W=800, H=450
```

- [ ] **Step 4: Create `RAGPipelineFlow.tsx`**

End-to-end Retrieval-Augmented Generation pipeline.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Uses StepNavigator with 5 steps:
//   1. User query: "What is the capital of France?"
//      → sentence embedding model → query vector (768-dim)
//   2. Vector database: pre-indexed document chunks as vectors.
//      Show ANN search: query vector compared to stored vectors.
//      Highlight top-3 nearest neighbors.
//   3. Retrieved context: top-3 document chunks shown as text cards.
//      "Paris is the capital and most populous city of France..."
//   4. Prompt construction: query + retrieved context assembled into LLM prompt.
//      Show the template: "Context: {chunks}\n\nQuestion: {query}\n\nAnswer:"
//   5. LLM generation: prompt → LLM → "The capital of France is Paris."
//      Highlight that the answer is grounded in retrieved context.
// Dimensions: W=800, H=500
```

#### Article Content

- [ ] **Step 5: Write `src/content/articles/zh/sentence-embeddings.mdx`**

Frontmatter:

```yaml
title: "句子嵌入：从 Token 级到语义检索"
slug: sentence-embeddings
locale: zh
tags: [sentence-embeddings, contrastive-learning, rag, retrieval, sbert]
prerequisites: [bert-and-gpt]
difficulty: intermediate
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks"
    url: "https://arxiv.org/abs/1908.10084"
  - type: paper
    title: "Text Embeddings by Weakly-Supervised Contrastive Pre-training"
    url: "https://arxiv.org/abs/2212.03533"
  - type: paper
    title: "C-Pack: Packaged Resources To Advance General Chinese Embedding"
    url: "https://arxiv.org/abs/2309.07597"
  - type: paper
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
    url: "https://arxiv.org/abs/2005.11401"
```

Content sections (follow spec Article 3 outline):
1. 简介 — 从 token 到句子
2. 为什么朴素平均不够 — anisotropy 问题 (text only)
3. Sentence-BERT — `<SiameseNetworkFlow client:visible />`
4. 对比学习 — `<ContrastiveLearningViz client:visible />`
5. 语义相似度 — `<SentenceSimilarityDemo client:visible />`
6. 现代句子嵌入 — E5, BGE, OpenAI (text only)
7. 应用：RAG — `<RAGPipelineFlow client:visible />`
8. 总结

Key formulas:
- Cosine similarity: $\text{sim}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$
- InfoNCE loss: $\mathcal{L}_i = -\log \frac{\exp(\text{sim}(\mathbf{z}_i, \mathbf{z}_j) / \tau)}{\sum_{k=1}^{2N} \mathbb{1}_{[k \ne i]} \exp(\text{sim}(\mathbf{z}_i, \mathbf{z}_k) / \tau)}$

- [ ] **Step 6: Write `src/content/articles/en/sentence-embeddings.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 7: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/SentenceSimilarityDemo.tsx \
        src/components/interactive/SiameseNetworkFlow.tsx \
        src/components/interactive/ContrastiveLearningViz.tsx \
        src/components/interactive/RAGPipelineFlow.tsx \
        src/content/articles/zh/sentence-embeddings.mdx \
        src/content/articles/en/sentence-embeddings.mdx
git commit -m "feat: add sentence-embeddings article with 4 interactive components (zh+en)"
```

---

### Task 10: Article 8 — `video-generation`

**Depends on:** Task 7 (diffusion-transformer)

**Files:**
- Create: `src/components/interactive/SpatiotemporalPatchDemo.tsx`
- Create: `src/components/interactive/SpatialVsTemporalAttention.tsx`
- Create: `src/components/interactive/VideoConsistencyChallenge.tsx`
- Create: `src/components/interactive/VariableResolutionDemo.tsx`
- Create: `src/components/interactive/VideoGenTimeline.tsx`
- Create: `src/content/articles/zh/video-generation.mdx`
- Create: `src/content/articles/en/video-generation.mdx`

#### Components

- [ ] **Step 1: Create `SpatiotemporalPatchDemo.tsx`**

3D visualization of how video frames are divided into spatiotemporal patches.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: patchSizeT (1 | 2 | 4), viewAngle (slider for 3D rotation)
// Visualization: Isometric/3D-ish SVG showing a stack of video frames (4-8 frames).
//   x,y = spatial dimensions, z = time.
//   Grid overlay shows how patches are cut: each patch is (p_h × p_w × p_t).
//   Color-code patches to show grouping.
//   One patch highlighted: "This 3D patch becomes one token"
//   Below: calculation "H/p_h × W/p_w × T/p_t = N tokens"
//   e.g., "256×256×16 video / 16×16×4 patches = 256 spatial × 4 temporal = 1024 tokens"
// Dimensions: W=800, H=500
```

- [ ] **Step 2: Create `SpatialVsTemporalAttention.tsx`**

Animated comparison of spatial and temporal attention patterns.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: mode ('spatial' | 'temporal' | 'full3d')
// Visualization: 3×3 grid of frames (3 rows = time, 3×3 = spatial positions).
//   Spatial mode: within a single frame, all positions attend to each other.
//     Draw arrows between all tokens in one frame. Other frames grayed out.
//     Label: "O(N_s²) per frame"
//   Temporal mode: same spatial position across all frames attends to each other.
//     Draw arrows between the same position across 3 frames. Label: "O(T²) per position"
//   Full 3D mode: all tokens attend to all tokens (all arrows).
//     Label: "O((N_s·T)²) — prohibitive!"
//   Toggle between modes with buttons.
// Dimensions: W=800, H=450
```

- [ ] **Step 3: Create `VideoConsistencyChallenge.tsx`**

Illustrates temporal consistency challenges in video generation.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedIssue ('flicker' | 'morph' | 'disappear')
// Visualization: For each issue, show 4 "frames" (simplified colored shape sequences):
//   Flicker: a circle changes color/brightness randomly between frames
//   Morph: a square gradually deforms into an irregular shape
//   Disappear: an object present in frame 1-2 vanishes in frame 3-4
//   Each shown as 4 side-by-side boxes (frame 1, 2, 3, 4) with the issue highlighted.
//   Below: explanation of why this happens (each frame denoised semi-independently)
//   and how it's addressed (temporal attention, shared noise)
// Dimensions: W=800, H=400
```

- [ ] **Step 4: Create `VariableResolutionDemo.tsx`**

Shows Sora's ability to handle variable aspect ratios and durations.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedConfig (index)
// Data: 4-5 preset configurations:
//   1080p landscape (1920×1080, 10s)
//   720p portrait (720×1280, 5s)
//   Square (1080×1080, 15s)
//   Widescreen (2560×1080, 8s)
//   Short vertical (720×1280, 3s)
// Visualization: A central rectangle that changes aspect ratio with animation.
//   Inside: shows the token grid layout (patches × frames).
//   Below: "All configurations use the same model — no cropping or resizing needed"
//   Token count calculation shown for each config.
// Dimensions: W=800, H=450
```

- [ ] **Step 5: Create `VideoGenTimeline.tsx`**

Timeline of video generation model milestones.

```tsx
interface Props { locale?: 'zh' | 'en' }
// Data: timeline entries
//   2022-09: Make-A-Video (Meta) — text→image→video, no text-video pairs
//   2023-04: Runway Gen-1 — video-to-video with text guidance
//   2023-06: VideoLDM — temporal layers inserted into Stable Diffusion
//   2023-11: Runway Gen-2 — text-to-video, major quality jump
//   2024-02: Sora (OpenAI) — DiT-based, minute-long, variable resolution
//   2024-06: Runway Gen-3 Alpha — improved temporal consistency
//   2024-12: Sora public release
// Visualization: horizontal timeline, styled consistently with MusicGenTimeline.
//   Each entry: model, company, key innovation.
//   Color-coded by approach (U-Net vs DiT backbone).
// Dimensions: W=800, H=300
```

#### Article Content

- [ ] **Step 6: Write `src/content/articles/zh/video-generation.mdx`**

Frontmatter:

```yaml
title: "视频生成：时空注意力与 Sora 架构"
slug: video-generation
locale: zh
tags: [video-generation, sora, spatiotemporal-attention, dit, diffusion]
prerequisites: [diffusion-transformer]
difficulty: advanced
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Video generation models as world simulators"
    url: "https://openai.com/index/video-generation-models-as-world-simulators/"
  - type: paper
    title: "Make-A-Video: Text-to-Video Generation without Text-Video Data"
    url: "https://arxiv.org/abs/2209.14792"
  - type: paper
    title: "Align your Latents: High-Resolution Video Synthesis with Latent Diffusion Models"
    url: "https://arxiv.org/abs/2304.08818"
```

Content sections (follow spec Article 8 outline):
1. 简介 — 从图像到视频
2. 视频 Tokenization — 3D patch + `<SpatiotemporalPatchDemo client:visible />`
3. 时空注意力 — `<SpatialVsTemporalAttention client:visible />`
4. 时间一致性挑战 — `<VideoConsistencyChallenge client:visible />`
5. Sora 架构 — variable resolution + `<VariableResolutionDemo client:visible />`
6. 其他方案 — Make-A-Video, VideoLDM (text only)
7. 发展历程 — `<VideoGenTimeline client:visible />`
8. 总结

- [ ] **Step 7: Write `src/content/articles/en/video-generation.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 8: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/SpatiotemporalPatchDemo.tsx \
        src/components/interactive/SpatialVsTemporalAttention.tsx \
        src/components/interactive/VideoConsistencyChallenge.tsx \
        src/components/interactive/VariableResolutionDemo.tsx \
        src/components/interactive/VideoGenTimeline.tsx \
        src/content/articles/zh/video-generation.mdx \
        src/content/articles/en/video-generation.mdx
git commit -m "feat: add video-generation article with 5 interactive components (zh+en)"
```

---

## Phase 4: Final Article (depends on Phase 1 + Phase 3)

### Task 11: Article 5 — `multimodal-alignment`

**Depends on:** Task 3 (vision-transformer) + Task 9 (sentence-embeddings)

**Files:**
- Create: `src/components/interactive/DualEncoderArchitecture.tsx`
- Create: `src/components/interactive/ContrastiveMatrix.tsx`
- Create: `src/components/interactive/ZeroShotClassification.tsx`
- Create: `src/components/interactive/CLIPDownstream.tsx`
- Create: `src/components/interactive/EmbeddingSpaceProjection.tsx`
- Create: `src/content/articles/zh/multimodal-alignment.mdx`
- Create: `src/content/articles/en/multimodal-alignment.mdx`

#### Components

- [ ] **Step 1: Create `DualEncoderArchitecture.tsx`**

CLIP dual-encoder architecture diagram with animation.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: currentStep (StepNavigator, 3 steps)
//   1. Two towers: left = Image Encoder (ViT), right = Text Encoder (Transformer).
//      Show an image entering the left tower, text entering the right tower.
//   2. Encoding: both towers process their inputs independently.
//      Image → patch embedding → Transformer layers → [CLS] → project to shared dim D
//      Text → token embedding → Transformer layers → [EOS] → project to shared dim D
//   3. Shared space: both output vectors meet in a shared embedding space.
//      Show two vectors converging to the same region of a 2D space.
//      Label: "Trained so matching pairs are close, non-matching pairs are far"
// Dimensions: W=800, H=500
```

- [ ] **Step 2: Create `ContrastiveMatrix.tsx`**

Interactive batch contrastive learning matrix for CLIP.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: batchSize (4 | 8, toggle), hoveredCell ({row, col} | null)
// Visualization: N×N matrix where rows = images, columns = texts.
//   Diagonal cells (positive pairs) colored green.
//   Off-diagonal cells (negative pairs) colored red, intensity = similarity.
//   Hover a cell: show "Image: {description}" + "Text: {description}" + similarity score.
//   Side labels: images shown as small icons, texts shown as truncated strings.
//   Below matrix: "Training objective: maximize diagonal, minimize off-diagonal"
//   Formula: L = -1/N Σ_i [log(exp(sim(I_i,T_i)/τ) / Σ_j exp(sim(I_i,T_j)/τ))]
// Dimensions: W=800, H=500
```

- [ ] **Step 3: Create `ZeroShotClassification.tsx`**

Interactive demo of CLIP zero-shot image classification.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: selectedImage (index), customLabels (string[])
// Data: 3-4 preset images (described as SVG icons: cat, car, flower, building).
//   Preset label sets: animals, vehicles, nature, objects.
// Visualization:
//   Left: selected image (SVG icon).
//   Right: text labels as horizontal bars.
//     Each label: "a photo of a {label}" → encode with text encoder → cosine similarity.
//     Bar length = similarity score. Highest bar highlighted.
//   Bottom: "No training needed — CLIP uses text prompts as classifier weights"
//   Step-by-step flow: image → image encoder → img_emb
//                      labels → text encoder → [txt_emb_1, txt_emb_2, ...]
//                      argmax(cosine_sim(img_emb, txt_emb_i))
// Dimensions: W=800, H=450
```

- [ ] **Step 4: Create `CLIPDownstream.tsx`**

Three downstream applications of CLIP shown as selectable tabs.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: activeApp ('text2img' | 'multimodal_llm' | 'retrieval')
// Visualization: Three tabs at top. Each shows a different pipeline:
//   text2img (Stable Diffusion):
//     "A sunset over mountains" → CLIP text encoder → text embeddings → U-Net/DiT → image
//   multimodal_llm (LLaVA):
//     Image → CLIP vision encoder → visual tokens → [concat with text tokens] → LLM → response
//   retrieval:
//     Query image → CLIP image encoder → vector → ANN search in text/image database → results
//   Each pipeline shown as a horizontal flow diagram with labeled blocks.
// Dimensions: W=800, H=400
```

- [ ] **Step 5: Create `EmbeddingSpaceProjection.tsx`**

Before/after training: how image and text embeddings align.

```tsx
interface Props { locale?: 'zh' | 'en' }
// State: trainingProgress (0 to 100, slider or animated)
// Data: 8 image-text pairs, each with pre-computed 2D coordinates at start and end.
//   Before training: images clustered on left, texts clustered on right (separate).
//   After training: matching pairs are close together, forming mixed clusters.
// Visualization: 2D scatter plot.
//   Images as circle dots (blue), texts as square dots (orange).
//   Matching pairs connected by thin lines.
//   Slider moves from "Before training" to "After training".
//   As slider moves, dots smoothly interpolate between their before/after positions.
//   Lines between matching pairs get shorter (converging).
// Dimensions: W=800, H=450
```

#### Article Content

- [ ] **Step 6: Write `src/content/articles/zh/multimodal-alignment.mdx`**

Frontmatter:

```yaml
title: "多模态对齐：CLIP 与跨模态嵌入空间"
slug: multimodal-alignment
locale: zh
tags: [clip, multimodal, contrastive-learning, zero-shot, vision-language]
prerequisites: [vision-transformer, sentence-embeddings]
difficulty: intermediate
created: "2026-04-12"
updated: "2026-04-12"
references:
  - type: paper
    title: "Learning Transferable Visual Models From Natural Language Supervision"
    url: "https://arxiv.org/abs/2103.00020"
  - type: paper
    title: "Scaling Up Visual and Vision-Language Representation Learning With Noisy Text Supervision"
    url: "https://arxiv.org/abs/2102.05918"
  - type: paper
    title: "Sigmoid Loss for Language Image Pre-Training"
    url: "https://arxiv.org/abs/2303.15343"
  - type: paper
    title: "Visual Instruction Tuning"
    url: "https://arxiv.org/abs/2304.08485"
```

Content sections (follow spec Article 5 outline):
1. 简介 — 让文本和图像"说同一种语言"
2. CLIP 架构 — `<DualEncoderArchitecture client:visible />`
3. 对比训练 — `<ContrastiveMatrix client:visible />` + `<EmbeddingSpaceProjection client:visible />`
4. Zero-shot 分类 — `<ZeroShotClassification client:visible />`
5. CLIP 的下游影响 — `<CLIPDownstream client:visible />`
6. 局限与演进 — ALIGN, SigLIP, EVA-CLIP (text only)
7. 总结

Key formulas:
- CLIP loss (symmetric): $\mathcal{L} = \frac{1}{2}(\mathcal{L}_{i \to t} + \mathcal{L}_{t \to i})$
- Per-direction: $\mathcal{L}_{i \to t} = -\frac{1}{N}\sum_i \log \frac{\exp(\text{sim}(I_i, T_i)/\tau)}{\sum_j \exp(\text{sim}(I_i, T_j)/\tau)}$

- [ ] **Step 7: Write `src/content/articles/en/multimodal-alignment.mdx`**

Translate zh version. All components get `locale="en"`.

- [ ] **Step 8: Validate and commit**

```bash
npm run validate && npm run build
git add src/components/interactive/DualEncoderArchitecture.tsx \
        src/components/interactive/ContrastiveMatrix.tsx \
        src/components/interactive/ZeroShotClassification.tsx \
        src/components/interactive/CLIPDownstream.tsx \
        src/components/interactive/EmbeddingSpaceProjection.tsx \
        src/content/articles/zh/multimodal-alignment.mdx \
        src/content/articles/en/multimodal-alignment.mdx
git commit -m "feat: add multimodal-alignment article with 5 interactive components (zh+en)"
```

---

## Final Validation

### Task 12: Full Build & Cross-Article Validation

**Depends on:** All previous tasks

- [ ] **Step 1: Run full content validation**

```bash
npm run validate
```

Expected: all 10 new articles pass validation (frontmatter, references, required fields).

- [ ] **Step 2: Run full site build**

```bash
npm run build
```

Expected: clean build with no errors. All 10 articles render correctly.

- [ ] **Step 3: Verify learning path YAML**

Check `src/content/paths/transformer-across-modalities.yaml` — all 10 slugs match actual article files.

- [ ] **Step 4: Spot-check article links**

Run dev server and manually check:
- `http://localhost:4321/zh/articles/text-representation` — loads, components interactive
- `http://localhost:4321/en/articles/bert-and-gpt` — loads, locale="en" on all components
- Learning path page shows all 10 articles in order

```bash
npm run dev
```

- [ ] **Step 5: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "fix: post-build validation fixes for transformer-across-modalities path"
```
