# Diagram Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 25 new interactive diagram components + convert 3 inline SVGs to React components across all 8 articles, plus 4 shared infrastructure files.

**Architecture:** Each diagram is a standalone React component in `src/components/interactive/`. Components use existing primitives (StepNavigator, MatrixGrid, TensorShape, mathUtils) and new shared infrastructure (colors, types, presets, hooks). Components are integrated into MDX articles via `import` + `client:visible`.

**Tech Stack:** React 19 + TypeScript, Motion (motion/react), D3 scales (optional), Tailwind CSS, Astro Islands (client:visible)

**Spec:** `docs/superpowers/specs/2026-04-01-diagram-expansion-design.md`

---

## File Structure

### New Shared Infrastructure (4 files)

| File | Responsibility |
|------|---------------|
| `src/components/interactive/shared/colors.ts` | Global semantic colors + local functional colors |
| `src/components/interactive/shared/types.ts` | ModelConfig, HardwareConfig interfaces |
| `src/components/interactive/shared/presets.ts` | Preset model/hardware configs (LLaMA-2, Mistral, A100, H100) |
| `src/components/interactive/shared/hooks.ts` | useDebouncedValue hook |

### New Components (25 files)

| # | File | Article | Type |
|---|------|---------|------|
| 1.1 | `AttentionMaskVisualization.tsx` | transformer-overview | Static + hover |
| 1.2 | `PrePostLNComparison.tsx` | transformer-overview | Static SVG |
| 1.3 | `PositionalEncodingComparison.tsx` | transformer-overview | Static SVG |
| 1.4 | `FFNBottleneck.tsx` | transformer-overview | Static SVG |
| 2.1 | `QKVSemanticSpaces.tsx` | qkv-intuition | Static + hover |
| 2.2 | `ReshapeTransposeAnimation.tsx` | qkv-intuition | Step animation |
| 3.1 | `TensorShapeTracker.tsx` | attention-computation | Step animation + mode switch |
| 3.2 | `ScalingFactorDemo.tsx` | attention-computation | Interactive slider |
| 3.3 | `CausalMaskDemo.tsx` | attention-computation | Step animation |
| 4.1 | `SingleVsMultiHeadAttention.tsx` | multi-head-attention | Static heatmap + hover |
| 4.2 | `OutputProjectionFusion.tsx` | multi-head-attention | Step animation |
| 5.1 | `KVCacheGrowthChart.tsx` | gqa-mqa | Interactive line chart |
| 5.2 | `QueryKVMapping.tsx` | gqa-mqa | Step animation (also replaces inline SVG) |
| 5.3 | `UptrainingPooling.tsx` | gqa-mqa | Step animation |
| 5.4 | `ConcurrencyComparison.tsx` | gqa-mqa | Interactive bar chart |
| 6.1 | `RedundantComputationViz.tsx` | kv-cache | Step animation |
| 6.2 | `KVCacheCalculator.tsx` | kv-cache | Interactive calculator |
| 6.3 | `PagedAttentionComparison.tsx` | kv-cache | Animation |
| 6.4 | `ContinuousBatchingTimeline.tsx` | kv-cache | Animation timeline |
| 7.1 | `RooflineModel.tsx` | prefill-vs-decode | Interactive chart |
| 7.2 | `GEMMvsGEMV.tsx` | prefill-vs-decode | Step animation |
| 8.1 | `GPUMemoryHierarchy.tsx` | flash-attention | Static + animation |
| 8.2 | `OnlineSoftmaxDemo.tsx` | flash-attention | Step animation |
| 8.3 | `IOComplexityChart.tsx` | flash-attention | Interactive line chart |
| 8.4 | `BlockSizeCalculator.tsx` | flash-attention | Interactive calculator |

### Inline SVG Conversions (3 files)

| File | Source | Article |
|------|--------|---------|
| `MultiHeadParallelDiagram.tsx` | multi-head-attention.mdx lines 180-293 | multi-head-attention |
| `PrefillDecodeOverview.tsx` | prefill-vs-decode.mdx lines 170-284 | prefill-vs-decode |
| (QueryKVMapping.tsx serves double duty) | gqa-mqa.mdx lines 130-277 | gqa-mqa |

### MDX Files Modified (8 files)

All in `src/content/articles/zh/`:
- `transformer-overview.mdx` — add 4 new imports
- `qkv-intuition.mdx` — add 2 new imports
- `attention-computation.mdx` — add 3 new imports
- `multi-head-attention.mdx` — add 2 new imports + replace inline SVG with MultiHeadParallelDiagram
- `gqa-mqa.mdx` — add 4 new imports + replace inline SVG with QueryKVMapping
- `kv-cache.mdx` — add 4 new imports
- `prefill-vs-decode.mdx` — add 2 new imports + replace inline SVG with PrefillDecodeOverview
- `flash-attention.mdx` — add 4 new imports

---

## Task Dependency Order

```
Task 1 (shared infra) → Tasks 2-32 (all components, independent of each other)
Each component task includes its own MDX integration step.
Task 33 (CSS cleanup) → after all SVG conversions are done
Task 34 (final validation) → after everything
```

---

### Task 1: Shared Infrastructure

**Files:**
- Create: `src/components/interactive/shared/colors.ts`
- Create: `src/components/interactive/shared/types.ts`
- Create: `src/components/interactive/shared/presets.ts`
- Create: `src/components/interactive/shared/hooks.ts`

- [ ] **Step 1: Create colors.ts**

```typescript
// src/components/interactive/shared/colors.ts

// Global semantic colors (consistent across all diagrams)
export const COLORS = {
  // Primary palette
  primary: '#1565c0',
  dark: '#1a1a2e',
  mid: '#666666',
  light: '#e2e8f0',
  bg: '#ffffff',
  bgAlt: '#f8fafc',

  // Semantic accents
  green: '#2e7d32',   // positive / Prefill
  red: '#c62828',     // warning / Decode
  orange: '#e65100',  // neutral emphasis
  purple: '#6a1b9a',  // output / result

  // Functional colors (per-element state within a diagram)
  masked: '#f3f4f6',     // masked / invalid cells
  valid: '#dbeafe',      // valid / normalized
  highlight: '#fef3c7',  // current step highlight
  waste: '#fee2e2',      // redundant / wasted computation
} as const;

// Head colors for multi-head visualizations
export const HEAD_COLORS = [
  '#1565c0', // blue
  '#2e7d32', // green
  '#e65100', // orange
  '#6a1b9a', // purple
  '#c62828', // red
  '#00838f', // teal
  '#4527a0', // deep purple
  '#ef6c00', // dark orange
] as const;

export type ColorKey = keyof typeof COLORS;
```

- [ ] **Step 2: Create types.ts**

```typescript
// src/components/interactive/shared/types.ts

export interface ModelConfig {
  name: string;
  layers: number;        // L
  hiddenDim: number;     // d (or H in some notations)
  heads: number;         // h (query heads)
  kvHeads: number;       // h_kv (KV heads, = h for MHA, < h for GQA, = 1 for MQA)
  headDim: number;       // d_k = hiddenDim / heads
  intermediateDim: number; // FFN intermediate dimension (typically 4*hiddenDim)
}

export interface HardwareConfig {
  name: string;
  peakTFLOPS: number;    // FP16 peak compute (TFLOPS)
  memoryGB: number;      // HBM capacity (GB)
  bandwidthTBs: number;  // HBM bandwidth (TB/s)
  sramKB: number;        // SRAM per SM (KB)
}

export type Precision = 'FP32' | 'FP16' | 'INT8' | 'INT4';

export const BYTES_PER_PARAM: Record<Precision, number> = {
  FP32: 4,
  FP16: 2,
  INT8: 1,
  INT4: 0.5,
};
```

- [ ] **Step 3: Create presets.ts**

```typescript
// src/components/interactive/shared/presets.ts
import type { ModelConfig, HardwareConfig } from './types';

export const MODEL_PRESETS: Record<string, ModelConfig> = {
  'LLaMA-2 7B': {
    name: 'LLaMA-2 7B',
    layers: 32,
    hiddenDim: 4096,
    heads: 32,
    kvHeads: 32,  // MHA
    headDim: 128,
    intermediateDim: 11008,
  },
  'LLaMA-2 13B': {
    name: 'LLaMA-2 13B',
    layers: 40,
    hiddenDim: 5120,
    heads: 40,
    kvHeads: 40,
    headDim: 128,
    intermediateDim: 13824,
  },
  'LLaMA-2 70B': {
    name: 'LLaMA-2 70B',
    layers: 80,
    hiddenDim: 8192,
    heads: 64,
    kvHeads: 8,   // GQA with 8 KV heads
    headDim: 128,
    intermediateDim: 28672,
  },
  'Mistral 7B': {
    name: 'Mistral 7B',
    layers: 32,
    hiddenDim: 4096,
    heads: 32,
    kvHeads: 8,   // GQA with 8 KV heads
    headDim: 128,
    intermediateDim: 14336,
  },
};

export const HARDWARE_PRESETS: Record<string, HardwareConfig> = {
  'A100 80GB': {
    name: 'A100 80GB',
    peakTFLOPS: 312,
    memoryGB: 80,
    bandwidthTBs: 2.0,
    sramKB: 192,  // 192KB per SM
  },
  'H100 80GB': {
    name: 'H100 80GB',
    peakTFLOPS: 989,
    memoryGB: 80,
    bandwidthTBs: 3.35,
    sramKB: 256,
  },
};
```

- [ ] **Step 4: Create hooks.ts**

```typescript
// src/components/interactive/shared/hooks.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Debounce a value by `delay` ms. Used for slider inputs in calculators
 * to avoid expensive re-renders on every pixel of slider movement.
 */
export function useDebouncedValue<T>(value: T, delay: number = 150): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

- [ ] **Step 5: Verify shared infrastructure compiles**

Run: `npm run dev`
Expected: Dev server starts without errors. No visible changes on site (no components use shared infra yet).

- [ ] **Step 6: Commit**

```bash
git add src/components/interactive/shared/
git commit -m "feat: add shared infrastructure for diagram expansion (colors, types, presets, hooks)"
```

---

### Task 2: AttentionMaskVisualization (Diagram 1.1)

**Spec ref:** Section 4.1, Diagram 1.1 — Attention 掩码矩阵可视化
**Files:**
- Create: `src/components/interactive/AttentionMaskVisualization.tsx`
- Modify: `src/content/articles/zh/transformer-overview.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/AttentionMaskVisualization.tsx
import { useState } from 'react';
import { COLORS } from './shared/colors';

const TOKENS = ['I', 'love', 'NLP', 'and', 'ML', '!'];
const N = TOKENS.length;

type MaskType = 'bidirectional' | 'causal' | 'cross';

function getMask(type: MaskType): boolean[][] {
  if (type === 'bidirectional') {
    return Array.from({ length: N }, () => Array(N).fill(true));
  }
  if (type === 'causal') {
    return Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (_, j) => j <= i)
    );
  }
  // cross: decoder tokens (rows) attend to all encoder tokens (cols)
  return Array.from({ length: N }, () => Array(N).fill(true));
}

const MASK_INFO: Record<MaskType, { title: string; desc: string }> = {
  bidirectional: {
    title: '双向 (Encoder)',
    desc: '所有位置互相可见 — BERT 等 Encoder 模型使用',
  },
  causal: {
    title: '因果 (Decoder-only)',
    desc: '每个 token 只能看到自己和之前的位置 — GPT、LLaMA 等使用',
  },
  cross: {
    title: '交叉 (Encoder-Decoder)',
    desc: 'Decoder 可看到所有 Encoder 位置 — 原始 Transformer、T5 使用',
  },
};

const CELL_SIZE = 40;
const LABEL_WIDTH = 48;
const LABEL_HEIGHT = 28;

function MaskGrid({ type, hoveredCell, onHover }: {
  type: MaskType;
  hoveredCell: [number, number] | null;
  onHover: (cell: [number, number] | null) => void;
}) {
  const mask = getMask(type);
  const info = MASK_INFO[type];
  const svgW = LABEL_WIDTH + N * CELL_SIZE;
  const svgH = LABEL_HEIGHT + N * CELL_SIZE;
  const rowLabels = type === 'cross' ? TOKENS.map(t => t + '→') : TOKENS;
  const colLabels = TOKENS;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold text-gray-700 mb-1">{info.title}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[260px]">
        {/* Column labels */}
        {colLabels.map((t, j) => (
          <text key={`cl-${j}`} x={LABEL_WIDTH + j * CELL_SIZE + CELL_SIZE / 2} y={LABEL_HEIGHT - 6}
            textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily="system-ui">
            {t}
          </text>
        ))}
        {/* Row labels */}
        {rowLabels.map((t, i) => (
          <text key={`rl-${i}`} x={LABEL_WIDTH - 6} y={LABEL_HEIGHT + i * CELL_SIZE + CELL_SIZE / 2 + 4}
            textAnchor="end" fontSize="10" fill={COLORS.mid} fontFamily="system-ui">
            {t}
          </text>
        ))}
        {/* Grid cells */}
        {mask.map((row, i) =>
          row.map((visible, j) => {
            const isHoveredRow = hoveredCell && hoveredCell[0] === i;
            const isHoveredCol = hoveredCell && hoveredCell[1] === j;
            const isExactCell = isHoveredRow && isHoveredCol;
            let fill = visible ? COLORS.valid : COLORS.masked;
            if (isExactCell) fill = COLORS.highlight;
            else if (isHoveredRow || isHoveredCol) fill = visible ? '#bfdbfe' : '#e5e7eb';

            return (
              <rect
                key={`${i}-${j}`}
                x={LABEL_WIDTH + j * CELL_SIZE}
                y={LABEL_HEIGHT + i * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={fill}
                stroke="#d1d5db"
                strokeWidth="0.5"
                onMouseEnter={() => onHover([i, j])}
                onMouseLeave={() => onHover(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          })
        )}
      </svg>
      <div className="text-xs text-gray-500 mt-1 text-center max-w-[260px]">{info.desc}</div>
    </div>
  );
}

export default function AttentionMaskVisualization() {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['bidirectional', 'causal', 'cross'] as MaskType[]).map(type => (
          <MaskGrid key={type} type={type} hoveredCell={hoveredCell} onHover={setHoveredCell} />
        ))}
      </div>
      {hoveredCell && (
        <div className="text-center text-xs text-gray-500 mt-2">
          Query: <strong>{TOKENS[hoveredCell[0]]}</strong> → Key: <strong>{TOKENS[hoveredCell[1]]}</strong>
        </div>
      )}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: COLORS.valid }} /> 可见
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: COLORS.masked }} /> 遮罩
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to transformer-overview.mdx**

Add the import after existing imports (line 29), and add the component after the Attention types comparison table (after line 216):

```mdx
// After line 29 (existing imports):
import AttentionMaskVisualization from '../../../components/interactive/AttentionMaskVisualization.tsx';

// After line 216 (after the Encoder-Decoder/Encoder-only/Decoder-only comparison table):
<AttentionMaskVisualization client:visible />
```

- [ ] **Step 3: Verify**

Run: `npm run dev`
Navigate to transformer-overview article. Verify:
- Three mask grids appear side by side on desktop, stacked on mobile
- Hover highlights the query row and key column
- Causal mask shows lower triangle

- [ ] **Step 4: Commit**

```bash
git add src/components/interactive/AttentionMaskVisualization.tsx src/content/articles/zh/transformer-overview.mdx
git commit -m "feat: add attention mask visualization (diagram 1.1)"
```

---

### Task 3: PrePostLNComparison (Diagram 1.2)

**Spec ref:** Section 4.1, Diagram 1.2 — Pre-LN vs Post-LN 梯度流对比
**Files:**
- Create: `src/components/interactive/PrePostLNComparison.tsx`
- Modify: `src/content/articles/zh/transformer-overview.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/PrePostLNComparison.tsx
import { COLORS } from './shared/colors';

// A simple block node for the flow diagram
function Block({ x, y, width, height, label, fill = COLORS.bgAlt }: {
  x: number; y: number; width: number; height: number; label: string; fill?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6}
        fill={fill} stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle"
        fontSize="11" fill={COLORS.dark} fontFamily="system-ui" fontWeight="500">
        {label}
      </text>
    </g>
  );
}

// Arrow from (x1,y1) to (x2,y2)
function Arrow({ x1, y1, x2, y2, thick = false, color = COLORS.mid, label }: {
  x1: number; y1: number; x2: number; y2: number;
  thick?: boolean; color?: string; label?: string;
}) {
  const id = `arrow-${x1}-${y1}-${x2}-${y2}`;
  return (
    <g>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={thick ? 3 : 1.5} markerEnd={`url(#${id})`} />
      {label && (
        <text x={(x1 + x2) / 2 + 8} y={(y1 + y2) / 2 + 4}
          fontSize="9" fill={color} fontFamily="system-ui" fontWeight="600">
          {label}
        </text>
      )}
    </g>
  );
}

// A circle for the Add node
function AddNode({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill="#fff" stroke={COLORS.mid} strokeWidth={1.5} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fill={COLORS.dark} fontFamily="system-ui">+</text>
    </g>
  );
}

export default function PrePostLNComparison() {
  const W = 800;
  const H = 380;
  const bw = 90; // block width
  const bh = 32; // block height
  const gap = 50; // vertical gap between blocks

  // Post-LN layout (left side)
  const lx = 60; // center x for left diagram
  // Pre-LN layout (right side)
  const rx = 480;

  return (
    <div className="my-6 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl mx-auto">
        {/* Labels */}
        <text x={lx + bw / 2} y={20} textAnchor="middle" fontSize="14" fill={COLORS.dark}
          fontFamily="system-ui" fontWeight="700">Post-LN (原始)</text>
        <text x={rx + bw / 2} y={20} textAnchor="middle" fontSize="14" fill={COLORS.dark}
          fontFamily="system-ui" fontWeight="700">Pre-LN (现代)</text>

        {/* === Post-LN (left) === */}
        {/* Input → Attn → Add → LN → FFN → Add → LN */}
        <Block x={lx} y={40} width={bw} height={bh} label="Input" />
        <Arrow x1={lx + bw / 2} y1={40 + bh} x2={lx + bw / 2} y2={40 + bh + gap - 14} />
        <Block x={lx} y={40 + gap + bh / 2 - bh / 2} width={bw} height={bh} label="Attention" fill="#dbeafe" />
        <Arrow x1={lx + bw / 2} y1={40 + gap + bh} x2={lx + bw / 2} y2={40 + 2 * gap - 14} />
        <AddNode cx={lx + bw / 2} cy={40 + 2 * gap} />
        <Arrow x1={lx + bw / 2} y1={40 + 2 * gap + 14} x2={lx + bw / 2} y2={40 + 2.6 * gap} />
        <Block x={lx} y={40 + 2.6 * gap} width={bw} height={bh} label="LayerNorm" fill="#fef3c7" />
        <Arrow x1={lx + bw / 2} y1={40 + 2.6 * gap + bh} x2={lx + bw / 2} y2={40 + 3.4 * gap} />
        <Block x={lx} y={40 + 3.4 * gap} width={bw} height={bh} label="FFN" fill="#dbeafe" />
        <Arrow x1={lx + bw / 2} y1={40 + 3.4 * gap + bh} x2={lx + bw / 2} y2={40 + 4.2 * gap - 14} />
        <AddNode cx={lx + bw / 2} cy={40 + 4.2 * gap} />
        <Arrow x1={lx + bw / 2} y1={40 + 4.2 * gap + 14} x2={lx + bw / 2} y2={40 + 4.8 * gap} />
        <Block x={lx} y={40 + 4.8 * gap} width={bw} height={bh} label="LayerNorm" fill="#fef3c7" />
        <Arrow x1={lx + bw / 2} y1={40 + 4.8 * gap + bh} x2={lx + bw / 2} y2={H - 10} />

        {/* Post-LN residual connections (thin lines) */}
        <path d={`M ${lx - 15} ${40 + bh / 2} L ${lx - 15} ${40 + 2 * gap} L ${lx + bw / 2 - 14} ${40 + 2 * gap}`}
          fill="none" stroke={COLORS.mid} strokeWidth={1} strokeDasharray="4,3" />
        <path d={`M ${lx - 15} ${40 + 2.6 * gap + bh / 2} L ${lx - 15} ${40 + 4.2 * gap} L ${lx + bw / 2 - 14} ${40 + 4.2 * gap}`}
          fill="none" stroke={COLORS.mid} strokeWidth={1} strokeDasharray="4,3" />

        {/* Post-LN annotation */}
        <text x={lx + bw + 10} y={40 + 2.6 * gap + 18} fontSize="9" fill={COLORS.red} fontFamily="system-ui">
          梯度必须穿过 LN
        </text>

        {/* === Pre-LN (right) === */}
        {/* Input → LN → Attn → Add → LN → FFN → Add */}
        <Block x={rx} y={40} width={bw} height={bh} label="Input" />
        <Arrow x1={rx + bw / 2} y1={40 + bh} x2={rx + bw / 2} y2={40 + gap} />
        <Block x={rx} y={40 + gap} width={bw} height={bh} label="LayerNorm" fill="#fef3c7" />
        <Arrow x1={rx + bw / 2} y1={40 + gap + bh} x2={rx + bw / 2} y2={40 + 2 * gap} />
        <Block x={rx} y={40 + 2 * gap} width={bw} height={bh} label="Attention" fill="#dbeafe" />
        <Arrow x1={rx + bw / 2} y1={40 + 2 * gap + bh} x2={rx + bw / 2} y2={40 + 2.8 * gap - 14} />
        <AddNode cx={rx + bw / 2} cy={40 + 2.8 * gap} />
        <Arrow x1={rx + bw / 2} y1={40 + 2.8 * gap + 14} x2={rx + bw / 2} y2={40 + 3.4 * gap} />
        <Block x={rx} y={40 + 3.4 * gap} width={bw} height={bh} label="LayerNorm" fill="#fef3c7" />
        <Arrow x1={rx + bw / 2} y1={40 + 3.4 * gap + bh} x2={rx + bw / 2} y2={40 + 4.2 * gap} />
        <Block x={rx} y={40 + 4.2 * gap} width={bw} height={bh} label="FFN" fill="#dbeafe" />
        <Arrow x1={rx + bw / 2} y1={40 + 4.2 * gap + bh} x2={rx + bw / 2} y2={40 + 4.8 * gap - 14} />
        <AddNode cx={rx + bw / 2} cy={40 + 4.8 * gap} />
        <Arrow x1={rx + bw / 2} y1={40 + 4.8 * gap + 14} x2={rx + bw / 2} y2={H - 10} />

        {/* Pre-LN residual connections (thick blue = gradient highway) */}
        <path d={`M ${rx - 15} ${40 + bh / 2} L ${rx - 15} ${40 + 2.8 * gap} L ${rx + bw / 2 - 14} ${40 + 2.8 * gap}`}
          fill="none" stroke={COLORS.primary} strokeWidth={3} />
        <path d={`M ${rx - 15} ${40 + 2.8 * gap} L ${rx - 15} ${40 + 4.8 * gap} L ${rx + bw / 2 - 14} ${40 + 4.8 * gap}`}
          fill="none" stroke={COLORS.primary} strokeWidth={3} />

        {/* Pre-LN annotation */}
        <text x={rx + bw + 10} y={40 + 3.6 * gap} fontSize="9" fill={COLORS.primary} fontFamily="system-ui" fontWeight="600">
          梯度高速公路
        </text>
        <text x={rx + bw + 10} y={40 + 3.6 * gap + 14} fontSize="9" fill={COLORS.primary} fontFamily="system-ui">
          (残差直通路径)
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Add to transformer-overview.mdx**

```mdx
// Add import after existing imports:
import PrePostLNComparison from '../../../components/interactive/PrePostLNComparison.tsx';

// Add after line 111 (after "Pre-LN 训练更稳定" paragraph, before ### Self-Attention):
<PrePostLNComparison client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev  # verify the diagram renders correctly
git add src/components/interactive/PrePostLNComparison.tsx src/content/articles/zh/transformer-overview.mdx
git commit -m "feat: add Pre-LN vs Post-LN comparison diagram (diagram 1.2)"
```

---

### Task 4: PositionalEncodingComparison (Diagram 1.3)

**Spec ref:** Section 4.1, Diagram 1.3 — 位置编码方案直观对比
**Files:**
- Create: `src/components/interactive/PositionalEncodingComparison.tsx`
- Modify: `src/content/articles/zh/transformer-overview.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/PositionalEncodingComparison.tsx
import { useMemo } from 'react';
import { COLORS } from './shared/colors';

// Generate sinusoidal PE values for visualization
function sinusoidalPE(maxPos: number, dModel: number): number[][] {
  return Array.from({ length: maxPos }, (_, pos) =>
    Array.from({ length: dModel }, (_, i) => {
      const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / dModel);
      return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
    })
  );
}

const POS = 8;
const DIM = 16;

function HeatmapColumn({ title, data, note }: {
  title: string;
  data: number[][] | null; // null for learnable (show ? pattern)
  note: string;
}) {
  const cellW = 14;
  const cellH = 18;
  const svgW = DIM * cellW + 40;
  const svgH = POS * cellH + 30;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold text-gray-700 mb-2">{title}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[280px]">
        {/* Position labels */}
        {Array.from({ length: POS }, (_, p) => (
          <text key={p} x={28} y={10 + p * cellH + cellH / 2 + 4} textAnchor="end"
            fontSize="9" fill={COLORS.mid} fontFamily="system-ui">
            pos {p}
          </text>
        ))}
        {/* Cells */}
        {Array.from({ length: POS }, (_, p) =>
          Array.from({ length: DIM }, (_, d) => {
            let fill: string;
            if (data) {
              const val = data[p][d];
              // Map [-1, 1] to blue-white-red
              const t = (val + 1) / 2; // [0, 1]
              const r = Math.round(59 + t * (198 - 59));
              const g = Math.round(130 + (1 - Math.abs(t - 0.5) * 2) * 125);
              const b = Math.round(246 - t * (246 - 40));
              fill = `rgb(${r},${g},${b})`;
            } else {
              // Learnable: random-looking but deterministic pattern
              const seed = (p * 31 + d * 17) % 255;
              fill = `rgb(${seed}, ${(seed * 3) % 255}, ${(seed * 7) % 255})`;
            }
            return (
              <rect key={`${p}-${d}`} x={32 + d * cellW} y={10 + p * cellH}
                width={cellW - 1} height={cellH - 1} rx={2} fill={fill} />
            );
          })
        )}
      </svg>
      <div className="text-xs text-gray-500 mt-1 text-center max-w-[280px]">{note}</div>
    </div>
  );
}

export default function PositionalEncodingComparison() {
  const sinPE = useMemo(() => sinusoidalPE(POS, DIM), []);

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HeatmapColumn
          title="正弦/余弦 (固定)"
          data={sinPE}
          note="每个维度不同频率的波，固定不可学习，支持外推到更长序列"
        />
        <HeatmapColumn
          title="可学习绝对位置"
          data={null}
          note="训练时学习每个位置的向量，简单直接但外推能力差"
        />
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold text-gray-700 mb-2">RoPE (旋转)</div>
          <svg viewBox="0 0 260 180" className="w-full max-w-[260px]">
            {/* Show rotation concept */}
            <circle cx={130} cy={90} r={60} fill="none" stroke={COLORS.light} strokeWidth={1} />
            {/* Position 0 - small rotation */}
            {[0, 1, 2, 3, 4].map(p => {
              const angle = (p * 25 * Math.PI) / 180; // increasing rotation
              const x = 130 + 50 * Math.cos(angle - Math.PI / 2);
              const y = 90 + 50 * Math.sin(angle - Math.PI / 2);
              const opacity = 1 - p * 0.15;
              return (
                <g key={p}>
                  <line x1={130} y1={90} x2={x} y2={y} stroke={COLORS.primary}
                    strokeWidth={2} opacity={opacity} />
                  <circle cx={x} cy={y} r={4} fill={COLORS.primary} opacity={opacity} />
                  <text x={x + 8} y={y + 4} fontSize="9" fill={COLORS.dark} fontFamily="system-ui">
                    pos {p}
                  </text>
                </g>
              );
            })}
            {/* Angle arc */}
            <text x={130} y={170} textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily="system-ui">
              相邻 token 旋转 θ 角度
            </text>
          </svg>
          <div className="text-xs text-gray-500 mt-1 text-center max-w-[260px]">
            在 Attention 计算中通过旋转编码相对位置，兼顾绝对位置和相对距离
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to transformer-overview.mdx**

```mdx
// Add import:
import PositionalEncodingComparison from '../../../components/interactive/PositionalEncodingComparison.tsx';

// Add after line 89 (after the position encoding comparison table, before ### LayerNorm):
<PositionalEncodingComparison client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev  # verify three columns render
git add src/components/interactive/PositionalEncodingComparison.tsx src/content/articles/zh/transformer-overview.mdx
git commit -m "feat: add positional encoding comparison diagram (diagram 1.3)"
```

---

### Task 5: FFNBottleneck (Diagram 1.4)

**Spec ref:** Section 4.1, Diagram 1.4 — FFN 扩维-压缩结构图
**Files:**
- Create: `src/components/interactive/FFNBottleneck.tsx`
- Modify: `src/content/articles/zh/transformer-overview.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/FFNBottleneck.tsx
import { COLORS } from './shared/colors';

export default function FFNBottleneck() {
  // Dimensions for visual representation
  const H = 4096;
  const fourH = H * 4;

  // Visual widths proportional to dimension
  const minW = 60;
  const maxW = 200;
  const blockH = 50;
  const gap = 70;

  const stages = [
    { label: '输入', dim: `(B, S, H)`, w: minW, color: COLORS.bgAlt },
    { label: 'Linear₁', dim: `(B, S, 4H)`, w: maxW, color: '#dbeafe' },
    { label: 'GELU', dim: `(B, S, 4H)`, w: maxW, color: '#dbeafe' },
    { label: 'Linear₂', dim: `(B, S, H)`, w: minW, color: COLORS.bgAlt },
  ];

  const totalW = 700;
  const totalH = 200;
  const centerY = totalH / 2;

  // Calculate x positions
  const startX = 50;
  const spacing = (totalW - 100) / (stages.length - 1);

  return (
    <div className="my-6 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full max-w-2xl mx-auto">
        {stages.map((stage, i) => {
          const cx = startX + i * spacing;
          const w = stage.w;
          const h = blockH;
          const x = cx - w / 2;
          const y = centerY - h / 2;

          return (
            <g key={i}>
              {/* Block */}
              <rect x={x} y={y} width={w} height={h} rx={6}
                fill={stage.color} stroke={COLORS.primary} strokeWidth={1.5} />
              <text x={cx} y={centerY + 1} textAnchor="middle" fontSize="12"
                fill={COLORS.dark} fontFamily="system-ui" fontWeight="600">
                {stage.label}
              </text>
              {/* Dimension label below */}
              <text x={cx} y={centerY + h / 2 + 18} textAnchor="middle"
                fontSize="10" fill={COLORS.mid} fontFamily="monospace">
                {stage.dim}
              </text>

              {/* Arrow to next */}
              {i < stages.length - 1 && (
                <>
                  <defs>
                    <marker id={`ffn-arr-${i}`} viewBox="0 0 10 10" refX="10" refY="5"
                      markerWidth="5" markerHeight="5" orient="auto-start-auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
                    </marker>
                  </defs>
                  <line
                    x1={x + w} y1={centerY}
                    x2={startX + (i + 1) * spacing - stages[i + 1].w / 2 - 2} y2={centerY}
                    stroke={COLORS.mid} strokeWidth={1.5} markerEnd={`url(#ffn-arr-${i})`}
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Diamond shape annotation */}
        <text x={totalW / 2} y={22} textAnchor="middle" fontSize="11" fill={COLORS.orange}
          fontFamily="system-ui" fontWeight="600">
          ↑ "菱形"结构：先扩维再压缩 ↑
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Add to transformer-overview.mdx**

```mdx
// Add import:
import FFNBottleneck from '../../../components/interactive/FFNBottleneck.tsx';

// Add after line 154 (after the TensorShape chain showing FFN dimension flow, before ### Residual Connection):
<FFNBottleneck client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/FFNBottleneck.tsx src/content/articles/zh/transformer-overview.mdx
git commit -m "feat: add FFN bottleneck diagram (diagram 1.4)"
```

---

### Task 6: QKVSemanticSpaces (Diagram 2.1)

**Spec ref:** Section 4.2, Diagram 2.1 — Q/K/V 向量空间语义对比
**Files:**
- Create: `src/components/interactive/QKVSemanticSpaces.tsx`
- Modify: `src/content/articles/zh/qkv-intuition.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/QKVSemanticSpaces.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';

const TOKENS = ['猫', '坐', '在', '垫子', '上'];
const TOKEN_COLORS = ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a', '#c62828'];

// Deterministic pseudo-random 2D positions for each token in each space
function genPositions(seed: number): [number, number][] {
  let s = seed;
  const next = () => {
    s = (s * 16807 + 11) % 2147483647;
    return (s % 160) + 20; // range [20, 180] in a 200x200 space
  };
  return TOKENS.map(() => [next(), next()]);
}

function SpacePanel({ title, subtitle, positions, hoveredIdx, onHover }: {
  title: string;
  subtitle: string;
  positions: [number, number][];
  hoveredIdx: number | null;
  onHover: (idx: number | null) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      <div className="text-xs text-gray-400 mb-1">{subtitle}</div>
      <svg viewBox="0 0 200 200" className="w-full max-w-[200px] border border-gray-200 rounded bg-white">
        {/* Grid lines */}
        {[50, 100, 150].map(v => (
          <g key={v}>
            <line x1={v} y1={0} x2={v} y2={200} stroke="#f0f0f0" strokeWidth={0.5} />
            <line x1={0} y1={v} x2={200} y2={v} stroke="#f0f0f0" strokeWidth={0.5} />
          </g>
        ))}
        {/* Points */}
        {positions.map(([x, y], i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g key={i}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={isHovered ? 8 : 6}
                fill={TOKEN_COLORS[i]}
                opacity={hoveredIdx !== null && !isHovered ? 0.3 : 1}
                stroke={isHovered ? COLORS.highlight : 'none'}
                strokeWidth={3} />
              <text x={x + 10} y={y + 4} fontSize="10"
                fill={TOKEN_COLORS[i]} fontFamily="system-ui" fontWeight={isHovered ? '700' : '500'}
                opacity={hoveredIdx !== null && !isHovered ? 0.3 : 1}>
                {TOKENS[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function QKVSemanticSpaces() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const qPos = useMemo(() => genPositions(42), []);
  const kPos = useMemo(() => genPositions(137), []);
  const vPos = useMemo(() => genPositions(256), []);

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SpacePanel title="Q 空间" subtitle='"我在找什么"'
          positions={qPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
        <SpacePanel title="K 空间" subtitle='"我能提供什么"'
          positions={kPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
        <SpacePanel title="V 空间" subtitle='"我的实际内容"'
          positions={vPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
      </div>
      {hoveredIdx !== null && (
        <p className="text-center text-xs text-gray-500 mt-2">
          同一个词 "<strong>{TOKENS[hoveredIdx]}</strong>" 在三个空间中有不同的位置 —
          W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> 将同一输入映射到不同的语义空间
        </p>
      )}
      <div className="flex justify-center gap-3 mt-3 flex-wrap">
        {TOKENS.map((t, i) => (
          <span key={i} className="flex items-center gap-1 text-xs">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: TOKEN_COLORS[i] }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to qkv-intuition.mdx**

```mdx
// Add import after existing imports (line 26):
import QKVSemanticSpaces from '../../../components/interactive/QKVSemanticSpaces.tsx';

// Add after line 104 (after "投影前每个 token... 承担不同的功能。" paragraph, before ## 分步可视化):
<QKVSemanticSpaces client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/QKVSemanticSpaces.tsx src/content/articles/zh/qkv-intuition.mdx
git commit -m "feat: add QKV semantic spaces diagram (diagram 2.1)"
```

---

### Task 7: ReshapeTransposeAnimation (Diagram 2.2)

**Spec ref:** Section 4.2, Diagram 2.2 — 多头分割 reshape/transpose 3D 可视化
**Files:**
- Create: `src/components/interactive/ReshapeTransposeAnimation.tsx`
- Modify: `src/content/articles/zh/qkv-intuition.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/ReshapeTransposeAnimation.tsx
import StepNavigator from '../primitives/StepNavigator';
import { HEAD_COLORS } from './shared/colors';

const S = 4; // sequence length
const H = 8; // hidden dim
const h = 2; // number of heads
const dk = H / h; // head dim = 4

const tokenLabels = ['t₁', 't₂', 't₃', 't₄'];

function ColorCell({ color, value, size = 28 }: { color: string; value: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center border border-gray-300 text-[9px] font-mono"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      {value}
    </div>
  );
}

// Generate consistent cell labels
function cellLabel(row: number, col: number): string {
  return `${row},${col}`;
}

function Step1Flat() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        投影后的矩阵 <code className="bg-gray-100 px-1 rounded">(S, H) = (4, 8)</code>，
        所有元素未区分 head，统一颜色。
      </p>
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs text-gray-500 mb-1">Q ∈ (4, 8)</div>
        {Array.from({ length: S }, (_, r) => (
          <div key={r} className="flex items-center gap-0">
            <span className="w-6 text-right text-xs text-gray-400 mr-1">{tokenLabels[r]}</span>
            {Array.from({ length: H }, (_, c) => (
              <ColorCell key={c} color="#e2e8f0" value={cellLabel(r, c)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2Reshape() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        <code className="bg-gray-100 px-1 rounded">reshape(S, h, d_k) = (4, 2, 4)</code> —
        按 head 分组着色，每组 d_k=4 个元素属于同一个 head。
      </p>
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs text-gray-500 mb-1">Q.reshape(4, 2, 4)</div>
        {Array.from({ length: S }, (_, r) => (
          <div key={r} className="flex items-center gap-0">
            <span className="w-6 text-right text-xs text-gray-400 mr-1">{tokenLabels[r]}</span>
            {Array.from({ length: h }, (_, headIdx) =>
              Array.from({ length: dk }, (_, d) => (
                <ColorCell
                  key={`${headIdx}-${d}`}
                  color={HEAD_COLORS[headIdx] + '33'} // 20% opacity
                  value={cellLabel(r, headIdx * dk + d)}
                />
              ))
            )}
          </div>
        ))}
        <div className="flex mt-1">
          <span className="w-6" />
          {Array.from({ length: h }, (_, headIdx) => (
            <div key={headIdx} className="flex items-center justify-center text-[10px] font-semibold"
              style={{ width: dk * 28, color: HEAD_COLORS[headIdx] }}>
              Head {headIdx}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Transpose() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        <code className="bg-gray-100 px-1 rounded">transpose(0, 1) → (h, S, d_k) = (2, 4, 4)</code> —
        每个 head 获得自己的 (S, d_k) 矩阵，可以独立计算 Attention。
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        {Array.from({ length: h }, (_, headIdx) => (
          <div key={headIdx} className="flex flex-col items-center">
            <div className="text-xs font-semibold mb-1" style={{ color: HEAD_COLORS[headIdx] }}>
              Head {headIdx} · (4, 4)
            </div>
            {Array.from({ length: S }, (_, r) => (
              <div key={r} className="flex items-center gap-0">
                <span className="w-6 text-right text-xs text-gray-400 mr-1">{tokenLabels[r]}</span>
                {Array.from({ length: dk }, (_, d) => (
                  <ColorCell
                    key={d}
                    color={HEAD_COLORS[headIdx] + '33'}
                    value={cellLabel(r, headIdx * dk + d)}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <strong>关键：</strong>数据没有被复制，只是重新排列了维度顺序。每个 Head 现在拥有所有 token
        的子空间表示，可以独立执行 Scaled Dot-Product Attention。
      </div>
    </div>
  );
}

export default function ReshapeTransposeAnimation() {
  const steps = [
    { title: '(S, H) 原始投影结果', content: <Step1Flat /> },
    { title: 'reshape → (S, h, d_k)', content: <Step2Reshape /> },
    { title: 'transpose → (h, S, d_k)', content: <Step3Transpose /> },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Add to qkv-intuition.mdx**

```mdx
// Add import:
import ReshapeTransposeAnimation from '../../../components/interactive/ReshapeTransposeAnimation.tsx';

// Add after line 167 (after the reshape/transpose formula, before > Multi-Head Attention 的完整机制...):
<ReshapeTransposeAnimation client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/ReshapeTransposeAnimation.tsx src/content/articles/zh/qkv-intuition.mdx
git commit -m "feat: add reshape/transpose animation (diagram 2.2)"
```

---

### Task 8: TensorShapeTracker (Diagram 3.1)

**Spec ref:** Section 4.3, Diagram 3.1 — 端到端张量形状追踪图
**Files:**
- Create: `src/components/interactive/TensorShapeTracker.tsx`
- Modify: `src/content/articles/zh/attention-computation.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/TensorShapeTracker.tsx
import { useState } from 'react';
import { COLORS } from './shared/colors';

type Mode = 'simple' | 'full';

interface Stage {
  label: string;
  simpleShape: string;
  fullShape: string;
  desc: string;
}

const STAGES: Stage[] = [
  { label: 'Input X', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '输入序列的隐藏表示' },
  { label: 'Q = X·Wq', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '线性投影得到所有头的 Q' },
  { label: 'K = X·Wk', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '线性投影得到所有头的 K' },
  { label: 'V = X·Wv', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '线性投影得到所有头的 V' },
  { label: 'reshape', simpleShape: '(S, d_k)', fullShape: '(B, h, S, d_k)', desc: 'reshape + transpose 拆分多头' },
  { label: 'Q·Kᵀ', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: '计算注意力分数矩阵' },
  { label: '÷ √d_k', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: '缩放防止梯度消失' },
  { label: '+ mask', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: '因果遮罩 (可选)' },
  { label: 'softmax', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: '归一化为注意力权重' },
  { label: '× V', simpleShape: '(S, d_k)', fullShape: '(B, h, S, d_k)', desc: '加权求和 Value' },
  { label: 'concat', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: 'transpose + reshape 拼接多头' },
  { label: '× Wo', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '输出投影' },
];

function StageBox({ stage, index, isActive, mode, onClick }: {
  stage: Stage; index: number; isActive: boolean; mode: Mode;
  onClick: () => void;
}) {
  const shape = mode === 'simple' ? stage.simpleShape : stage.fullShape;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect x={0} y={index * 38} width={280} height={32} rx={6}
        fill={isActive ? COLORS.highlight : COLORS.bgAlt}
        stroke={isActive ? COLORS.primary : COLORS.light}
        strokeWidth={isActive ? 2 : 1} />
      <text x={10} y={index * 38 + 20} fontSize="11" fill={COLORS.dark}
        fontFamily="system-ui" fontWeight={isActive ? '700' : '400'}>
        {stage.label}
      </text>
      <text x={270} y={index * 38 + 20} textAnchor="end" fontSize="10"
        fill={COLORS.primary} fontFamily="monospace" fontWeight="600">
        {shape}
      </text>
    </g>
  );
}

export default function TensorShapeTracker() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [mode, setMode] = useState<Mode>('simple');

  const svgH = STAGES.length * 38 + 10;

  return (
    <div className="my-6">
      {/* Mode toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setMode('simple')}
          className={`px-3 py-1 text-sm rounded border ${mode === 'simple'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
        >
          简化模式 (单头)
        </button>
        <button
          onClick={() => setMode('full')}
          className={`px-3 py-1 text-sm rounded border ${mode === 'full'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
        >
          完整模式 (多头+batch)
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start justify-center">
        {/* Pipeline */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 290 ${svgH}`} className="w-full max-w-xs">
            {STAGES.map((stage, i) => (
              <g key={i}>
                <StageBox stage={stage} index={i} isActive={i === activeIdx}
                  mode={mode} onClick={() => setActiveIdx(i)} />
                {/* Arrow to next */}
                {i < STAGES.length - 1 && (
                  <line x1={140} y1={i * 38 + 32} x2={140} y2={(i + 1) * 38}
                    stroke={COLORS.light} strokeWidth={1} />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-sm">
          <div className="text-sm font-semibold text-gray-700 mb-1">
            {STAGES[activeIdx].label}
          </div>
          <div className="text-lg font-mono text-blue-700 mb-2">
            {mode === 'simple' ? STAGES[activeIdx].simpleShape : STAGES[activeIdx].fullShape}
          </div>
          <p className="text-sm text-gray-600">
            {STAGES[activeIdx].desc}
          </p>
          {mode === 'simple' && (
            <p className="text-xs text-gray-400 mt-2">
              简化模式省略了 batch (B) 和 多头 (h) 维度
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to attention-computation.mdx**

```mdx
// Add import after existing import (line 25):
import TensorShapeTracker from '../../../components/interactive/TensorShapeTracker.tsx';

// Add before ## 分步拆解 (line 50), after the formula section:
<TensorShapeTracker client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/TensorShapeTracker.tsx src/content/articles/zh/attention-computation.mdx
git commit -m "feat: add tensor shape tracker (diagram 3.1)"
```

---

### Task 9: ScalingFactorDemo (Diagram 3.2)

**Spec ref:** Section 4.3, Diagram 3.2 — Scaling 因子对 Softmax 分布的影响
**Files:**
- Create: `src/components/interactive/ScalingFactorDemo.tsx`
- Modify: `src/content/articles/zh/attention-computation.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/ScalingFactorDemo.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';

// Generate deterministic scores based on d_k
function generateScores(dk: number, seed: number = 42): number[] {
  let s = seed;
  const next = () => {
    s = (s * 16807 + 11) % 2147483647;
    return ((s % 2000) - 1000) / 1000; // [-1, 1]
  };
  // Raw dot products: scale as sqrt(dk) to simulate variance = dk
  return Array.from({ length: 8 }, () => {
    let sum = 0;
    for (let i = 0; i < dk; i++) sum += next() * next();
    return parseFloat(sum.toFixed(2));
  });
}

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function entropy(probs: number[]): number {
  return -probs.reduce((acc, p) => acc + (p > 1e-10 ? p * Math.log2(p) : 0), 0);
}

function variance(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((acc, v) => acc + (v - mean) ** 2, 0) / arr.length;
}

function BarChart({ values, maxVal, color, labels, height = 120, width = 280 }: {
  values: number[]; maxVal: number; color: string;
  labels?: string[]; height?: number; width?: number;
}) {
  const barW = width / values.length - 4;
  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full">
      {values.map((v, i) => {
        const barH = maxVal > 0 ? (Math.abs(v) / maxVal) * height : 0;
        const y = v >= 0 ? height - barH : height;
        return (
          <g key={i}>
            <rect x={i * (barW + 4) + 2} y={y} width={barW} height={barH}
              fill={color} rx={2} opacity={0.8} />
            {labels && (
              <text x={i * (barW + 4) + 2 + barW / 2} y={height + 14}
                textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
      {/* Zero line */}
      <line x1={0} y1={height} x2={width} y2={height} stroke={COLORS.light} strokeWidth={0.5} />
    </svg>
  );
}

export default function ScalingFactorDemo() {
  const [dk, setDk] = useState(64);

  const rawScores = useMemo(() => generateScores(dk), [dk]);
  const scaledScores = useMemo(() => rawScores.map(s => s / Math.sqrt(dk)), [rawScores, dk]);
  const rawProbs = useMemo(() => softmax(rawScores), [rawScores]);
  const scaledProbs = useMemo(() => softmax(scaledScores), [scaledScores]);

  const rawVar = variance(rawScores);
  const scaledVar = variance(scaledScores);
  const rawEntropy = entropy(rawProbs);
  const scaledEntropy = entropy(scaledProbs);

  const labels = Array.from({ length: 8 }, (_, i) => `k${i + 1}`);
  const maxScore = Math.max(...rawScores.map(Math.abs));

  return (
    <div className="my-6 p-4 border rounded-lg">
      {/* Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Head 维度 d<sub>k</sub>: <strong>{dk}</strong>
        </label>
        <input type="range" min={8} max={128} step={8} value={dk}
          onChange={e => setDk(Number(e.target.value))}
          className="w-full max-w-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Raw scores → softmax */}
        <div>
          <div className="text-sm font-semibold text-red-700 mb-1">未缩放: QK<sup>T</sup></div>
          <BarChart values={rawScores} maxVal={maxScore} color={COLORS.red} labels={labels} />
          <div className="text-xs text-gray-500 mt-1">
            方差: {rawVar.toFixed(2)} · Softmax 熵: {rawEntropy.toFixed(3)} bits
          </div>
          <div className="text-xs font-semibold text-gray-600 mt-2">→ Softmax 输出</div>
          <BarChart values={rawProbs} maxVal={1} color={COLORS.red} labels={labels} />
        </div>

        {/* Scaled scores → softmax */}
        <div>
          <div className="text-sm font-semibold text-blue-700 mb-1">缩放后: QK<sup>T</sup> / √d<sub>k</sub></div>
          <BarChart values={scaledScores} maxVal={maxScore} color={COLORS.primary} labels={labels} />
          <div className="text-xs text-gray-500 mt-1">
            方差: {scaledVar.toFixed(2)} · Softmax 熵: {scaledEntropy.toFixed(3)} bits
          </div>
          <div className="text-xs font-semibold text-gray-600 mt-2">→ Softmax 输出</div>
          <BarChart values={scaledProbs} maxVal={1} color={COLORS.primary} labels={labels} />
        </div>
      </div>

      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <strong>观察：</strong>d<sub>k</sub> 越大 → 未缩放分数的方差越大 → Softmax 输出越接近 one-hot（熵趋近 0）。
        除以 √d<sub>k</sub> 后方差恢复到 ~1，Softmax 输出保持均匀分布（熵接近 {Math.log2(8).toFixed(1)} bits）。
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to attention-computation.mdx**

```mdx
// Add import:
import ScalingFactorDemo from '../../../components/interactive/ScalingFactorDemo.tsx';

// Add after line 147 (after "梯度流畅，训练稳定。" and before the > 原论文原话):
<ScalingFactorDemo client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/ScalingFactorDemo.tsx src/content/articles/zh/attention-computation.mdx
git commit -m "feat: add scaling factor demo (diagram 3.2)"
```

---

### Task 10: CausalMaskDemo (Diagram 3.3)

**Spec ref:** Section 4.3, Diagram 3.3 — Causal Mask 逐步应用演示
**Files:**
- Create: `src/components/interactive/CausalMaskDemo.tsx`
- Modify: `src/content/articles/zh/attention-computation.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/CausalMaskDemo.tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { seededValuesSigned } from '../primitives/mathUtils';
import { COLORS } from './shared/colors';

const N = 5;
const TOKENS = ['The', 'cat', 'sat', 'on', 'it'];

function Grid({ data, format, colorFn, label }: {
  data: (number | string)[][];
  format?: (v: number | string) => string;
  colorFn: (r: number, c: number, v: number | string) => string;
  label: string;
}) {
  const cellSize = 44;
  const labelW = 36;
  const labelH = 24;
  const svgW = labelW + N * cellSize;
  const svgH = labelH + N * cellSize;
  const fmt = format || ((v: number | string) => typeof v === 'number' ? v.toFixed(2) : String(v));

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[280px]">
        {/* Column labels */}
        {TOKENS.map((t, j) => (
          <text key={`c${j}`} x={labelW + j * cellSize + cellSize / 2} y={labelH - 4}
            textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
        ))}
        {/* Row labels */}
        {TOKENS.map((t, i) => (
          <text key={`r${i}`} x={labelW - 4} y={labelH + i * cellSize + cellSize / 2 + 3}
            textAnchor="end" fontSize="9" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
        ))}
        {/* Cells */}
        {data.map((row, i) =>
          row.map((v, j) => (
            <g key={`${i}-${j}`}>
              <rect x={labelW + j * cellSize} y={labelH + i * cellSize}
                width={cellSize} height={cellSize}
                fill={colorFn(i, j, v)} stroke="#d1d5db" strokeWidth={0.5} />
              <text x={labelW + j * cellSize + cellSize / 2} y={labelH + i * cellSize + cellSize / 2 + 4}
                textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily="monospace">
                {fmt(v)}
              </text>
            </g>
          ))
        )}
      </svg>
    </div>
  );
}

export default function CausalMaskDemo() {
  // Generate raw scores (5x5)
  const rawScores = useMemo(() => {
    const flat = seededValuesSigned(N, N, 77);
    return flat.map(row => row.map(v => parseFloat((v * 3).toFixed(2)))); // scale up for effect
  }, []);

  // Step 2: masked scores (-inf for upper triangle)
  const maskedScores = useMemo(() =>
    rawScores.map((row, i) =>
      row.map((v, j) => j <= i ? v : '-∞')
    ), [rawScores]);

  // Step 3: softmax per row (only on valid positions)
  const softmaxResult = useMemo(() =>
    rawScores.map((row, i) => {
      const validScores = row.slice(0, i + 1);
      const max = Math.max(...validScores);
      const exps = validScores.map(v => Math.exp(v - max));
      const sum = exps.reduce((a, b) => a + b, 0);
      const probs = exps.map(e => parseFloat((e / sum).toFixed(2)));
      // Pad with zeros for masked positions
      return [...probs, ...Array(N - i - 1).fill(0)];
    }), [rawScores]);

  const steps = [
    {
      title: '原始 QKᵀ 分数矩阵',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            原始点积分数 — 每个格子表示 token i 对 token j 的原始相关性。
          </p>
          <Grid data={rawScores} label="Scores = QKᵀ/√d_k"
            colorFn={(r, c, v) => {
              const val = typeof v === 'number' ? v : 0;
              const t = (val + 3) / 6; // normalize to [0,1]
              return `rgba(59, 130, 246, ${0.1 + t * 0.5})`;
            }}
          />
        </div>
      ),
    },
    {
      title: '应用因果遮罩 (上三角 → -∞)',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            上三角位置（未来 token）设为 <code className="bg-gray-100 px-1 rounded">-∞</code>，
            用浅红标记被遮罩的位置。
          </p>
          <Grid data={maskedScores} label="Masked Scores"
            format={v => typeof v === 'number' ? v.toFixed(2) : String(v)}
            colorFn={(r, c, v) => {
              if (c > r) return COLORS.waste; // masked = light red
              const val = typeof v === 'number' ? v : 0;
              const t = (val + 3) / 6;
              return `rgba(59, 130, 246, ${0.1 + t * 0.5})`;
            }}
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            每个 token 只能看到自己和之前的 token
          </p>
        </div>
      ),
    },
    {
      title: 'Softmax → 注意力权重',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Softmax 后：上三角变为 <strong>0.00</strong>（灰色），
            下三角归一化为概率（每行和为 1.0）。
          </p>
          <Grid data={softmaxResult} label="Attention Weights"
            colorFn={(r, c, v) => {
              const val = typeof v === 'number' ? v : 0;
              if (c > r) return COLORS.masked; // gray for zero
              return `rgba(59, 130, 246, ${0.1 + val * 0.7})`;
            }}
          />
          <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-500">
            {softmaxResult.map((row, i) => (
              <span key={i}>行{i + 1}总和: {row.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0).toFixed(2)}</span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Add to attention-computation.mdx**

```mdx
// Add import:
import CausalMaskDemo from '../../../components/interactive/CausalMaskDemo.tsx';

// Add after line 175 (after the mask matrix, before ### 不同场景的遮罩策略):
<CausalMaskDemo client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/CausalMaskDemo.tsx src/content/articles/zh/attention-computation.mdx
git commit -m "feat: add causal mask demo (diagram 3.3)"
```

---

### Task 11: SingleVsMultiHeadAttention (Diagram 4.1)

**Spec ref:** Section 4.4, Diagram 4.1 — 单头 vs 多头 Attention 权重对比
**Files:**
- Create: `src/components/interactive/SingleVsMultiHeadAttention.tsx`
- Modify: `src/content/articles/zh/multi-head-attention.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/SingleVsMultiHeadAttention.tsx
import { useState } from 'react';
import { COLORS, HEAD_COLORS } from './shared/colors';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'tired'];
const N = TOKENS.length;

// Pre-designed attention patterns for each head (illustrative, not from a real model)
// Each pattern is NxN with values 0-1 (row-softmaxed)
function generateSingleHead(): number[][] {
  // Mixed pattern: everything blended together
  return Array.from({ length: N }, (_, i) => {
    const row = Array(N).fill(0.05);
    // Adjacent bias
    if (i > 0) row[i - 1] += 0.15;
    if (i < N - 1) row[i + 1] += 0.1;
    // Self attention
    row[i] += 0.2;
    // Some semantic connections
    if (i === 7) { row[1] += 0.15; row[8] += 0.1; } // it → cat, was
    if (i === 2) row[1] += 0.15; // sat → cat
    // Normalize
    const sum = row.reduce((a, b) => a + b, 0);
    return row.map(v => parseFloat((v / sum).toFixed(3)));
  });
}

function generateHeadPatterns(): number[][][] {
  return [
    // Head 0: local/adjacent
    Array.from({ length: N }, (_, i) => {
      const row = Array(N).fill(0.02);
      row[i] += 0.35;
      if (i > 0) row[i - 1] += 0.35;
      if (i > 1) row[i - 2] += 0.1;
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(v => parseFloat((v / sum).toFixed(3)));
    }),
    // Head 1: verb-subject (sat→cat)
    Array.from({ length: N }, (_, i) => {
      const row = Array(N).fill(0.03);
      row[i] += 0.2;
      if (i === 2) row[1] += 0.5; // sat→cat
      if (i === 8) row[7] += 0.4; // was→it
      if (i === 9) row[8] += 0.4; // tired→was
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(v => parseFloat((v / sum).toFixed(3)));
    }),
    // Head 2: coreference (it→cat)
    Array.from({ length: N }, (_, i) => {
      const row = Array(N).fill(0.03);
      row[i] += 0.2;
      if (i === 7) row[1] += 0.55; // it→cat
      if (i === 6) row[2] += 0.3;  // because→sat
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(v => parseFloat((v / sum).toFixed(3)));
    }),
    // Head 3: prepositional (on→mat)
    Array.from({ length: N }, (_, i) => {
      const row = Array(N).fill(0.03);
      row[i] += 0.2;
      if (i === 3) row[5] += 0.5;  // on→mat
      if (i === 5) row[3] += 0.4;  // mat→on
      if (i === 6) row[5] += 0.25; // because→mat
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(v => parseFloat((v / sum).toFixed(3)));
    }),
  ];
}

function Heatmap({ data, size = 160, label, color }: {
  data: number[][]; size?: number; label: string; color?: string;
}) {
  const cellSize = size / N;
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold mb-1" style={{ color: color || COLORS.dark }}>{label}</div>
      <svg viewBox={`0 0 ${size + 30} ${size + 20}`} className="w-full" style={{ maxWidth: size + 30 }}>
        {/* Row/col labels */}
        {TOKENS.map((t, i) => (
          <g key={i}>
            <text x={28 + i * cellSize + cellSize / 2} y={10}
              textAnchor="middle" fontSize="5" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
            <text x={26} y={18 + i * cellSize + cellSize / 2 + 2}
              textAnchor="end" fontSize="5" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
          </g>
        ))}
        {/* Cells */}
        {data.map((row, i) =>
          row.map((v, j) => (
            <rect key={`${i}-${j}`}
              x={30 + j * cellSize} y={14 + i * cellSize}
              width={cellSize - 0.5} height={cellSize - 0.5}
              fill={color || COLORS.primary}
              opacity={v * 0.9 + 0.05}
              rx={1}
            />
          ))
        )}
      </svg>
    </div>
  );
}

const HEAD_LABELS = ['Head 1: 局部模式', 'Head 2: 动词-主语', 'Head 3: 代词指代', 'Head 4: 介词短语'];

export default function SingleVsMultiHeadAttention() {
  const [hoveredHead, setHoveredHead] = useState<number | null>(null);
  const singleHead = generateSingleHead();
  const headPatterns = generateHeadPatterns();

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single head */}
        <div>
          <Heatmap data={singleHead} size={240} label="单头 Attention — 所有模式混在一起" />
        </div>

        {/* Multi head */}
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-2 text-center">
            多头 Attention (h=4) — 每个 head 关注不同模式
          </div>
          <div className="grid grid-cols-2 gap-2">
            {headPatterns.map((pattern, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredHead(i)}
                onMouseLeave={() => setHoveredHead(null)}
                className={`rounded p-1 transition-shadow ${hoveredHead === i ? 'shadow-lg ring-2' : ''}`}
                style={{ ringColor: HEAD_COLORS[i] }}>
                <Heatmap data={pattern} size={140} label={HEAD_LABELS[i]} color={HEAD_COLORS[i]} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">
        示意图，非真实模型权重 — 展示多头如何让不同 head 专注于不同关系模式
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add to multi-head-attention.mdx**

```mdx
// Add import at top (after ---):
import SingleVsMultiHeadAttention from '../../../components/interactive/SingleVsMultiHeadAttention.tsx';

// Add after line 93 (after the head type table, before ## 维度分析):
<SingleVsMultiHeadAttention client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/SingleVsMultiHeadAttention.tsx src/content/articles/zh/multi-head-attention.mdx
git commit -m "feat: add single vs multi-head attention comparison (diagram 4.1)"
```

---

### Task 12: OutputProjectionFusion (Diagram 4.2)

**Spec ref:** Section 4.4, Diagram 4.2 — 输出投影 W_O 的融合过程
**Files:**
- Create: `src/components/interactive/OutputProjectionFusion.tsx`
- Modify: `src/content/articles/zh/multi-head-attention.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/OutputProjectionFusion.tsx
import StepNavigator from '../primitives/StepNavigator';
import { HEAD_COLORS, COLORS } from './shared/colors';

const h = 4;
const dk = 3; // simplified head dim
const H = h * dk; // total hidden dim

function ColorBar({ segments, label }: {
  segments: { color: string; width: number; values?: string[] }[];
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="flex border border-gray-300 rounded overflow-hidden">
        {segments.map((seg, i) => (
          <div key={i} className="flex" style={{ backgroundColor: seg.color + '44' }}>
            {(seg.values || Array(seg.width).fill('')).map((v, j) => (
              <div key={j}
                className="w-8 h-8 flex items-center justify-center text-[8px] font-mono border-r border-gray-200"
                style={{ backgroundColor: seg.color + '33' }}>
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OutputProjectionFusion() {
  const steps = [
    {
      title: '各 Head 独立输出',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {h} 个 head 各自计算 Attention 后得到 (d<sub>k</sub>={dk}) 维的输出向量，
            每个 head 用不同颜色标识。
          </p>
          <div className="flex flex-col gap-3 items-center">
            {Array.from({ length: h }, (_, i) => (
              <ColorBar key={i}
                label={`Head ${i} output (d_k=${dk})`}
                segments={[{
                  color: HEAD_COLORS[i],
                  width: dk,
                  values: Array.from({ length: dk }, (_, d) => `h${i}d${d}`),
                }]}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Concat — 拼接为 (H) 向量',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            transpose + reshape：将 {h} 个 head 的输出拼接成一个 H={H} 维向量。
            颜色条拼在一起，每段仍可辨识来源 head。
          </p>
          <ColorBar
            label={`Concat output (H=${H})`}
            segments={Array.from({ length: h }, (_, i) => ({
              color: HEAD_COLORS[i],
              width: dk,
              values: Array.from({ length: dk }, (_, d) => `h${i}d${d}`),
            }))}
          />
          <div className="mt-2 text-xs text-gray-500 text-center">
            此时各 head 信息只是简单堆叠，尚未交互
          </div>
        </div>
      ),
    },
    {
      title: 'W_O 投影 — 信息融合',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            通过 W<sup>O</sup> ∈ ℝ<sup>(H×H)</sup> 线性投影，不同 head 的信息发生混合。
            输出向量变为统一颜色 — 多头信息已被融合。
          </p>
          <div className="flex flex-col items-center gap-3">
            <ColorBar
              label="拼接输入"
              segments={Array.from({ length: h }, (_, i) => ({
                color: HEAD_COLORS[i],
                width: dk,
              }))}
            />
            <div className="text-lg text-gray-400">↓ × W<sup>O</sup></div>
            <ColorBar
              label={`融合输出 (H=${H})`}
              segments={[{
                color: COLORS.purple,
                width: H,
                values: Array.from({ length: H }, (_, d) => `o${d}`),
              }]}
            />
          </div>
          <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-800">
            <strong>关键：</strong>W<sup>O</sup> 不是简单拼接 — 它是一个学习到的线性组合，
            让各 head 的专家意见融合为最终决策。输出的每个维度都包含了所有 head 的信息。
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Add to multi-head-attention.mdx**

```mdx
// Add import:
import OutputProjectionFusion from '../../../components/interactive/OutputProjectionFusion.tsx';

// Add after line 309 (after the W_O residual compatibility explanation, before ### 参数量分析):
<OutputProjectionFusion client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/OutputProjectionFusion.tsx src/content/articles/zh/multi-head-attention.mdx
git commit -m "feat: add output projection fusion animation (diagram 4.2)"
```

---

### Task 13: MultiHeadParallelDiagram (Inline SVG → React conversion)

**Spec ref:** Section 6, MHA inline SVG → React component
**Files:**
- Create: `src/components/interactive/MultiHeadParallelDiagram.tsx`
- Modify: `src/content/articles/zh/multi-head-attention.mdx` (replace lines 180-293)

- [ ] **Step 1: Create the component**

Convert the existing inline SVG (multi-head-attention.mdx lines 180-293) to a React component. Preserve the exact same visual layout: input → linear projections → reshape → h parallel heads → concat → W_O → output.

```typescript
// src/components/interactive/MultiHeadParallelDiagram.tsx
import { COLORS } from './shared/colors';

export default function MultiHeadParallelDiagram() {
  return (
    <div className="my-6 w-full overflow-x-auto">
      <svg viewBox="0 0 800 620" className="w-full max-w-3xl mx-auto" style={{ height: 'auto' }}>
        <rect width="800" height="620" fill="#fafafa" rx="8" />

        <text x="400" y="35" textAnchor="middle" fontSize="18" fontWeight="bold" fill={COLORS.dark}>
          Multi-Head Attention 计算结构
        </text>

        {/* Input */}
        <rect x="300" y="55" width="200" height="36" rx="6" fill="#e8eaf6" stroke="#3f51b5" strokeWidth="1.5" />
        <text x="400" y="78" textAnchor="middle" fontSize="13" fill={COLORS.dark}>输入 X: (B, S, H)</text>

        {/* Arrow marker */}
        <defs>
          <marker id="mhpa-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#666" />
          </marker>
        </defs>

        {/* Arrows from input to linear projections */}
        <line x1="340" y1="91" x2="140" y2="130" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="400" y1="91" x2="400" y2="130" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="460" y1="91" x2="660" y2="130" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        {/* Linear Projections */}
        <rect x="60" y="130" width="160" height="32" rx="6" fill="#fff3e0" stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="140" y="151" textAnchor="middle" fontSize="12" fill={COLORS.dark}>Linear W_Q: (H, H)</text>

        <rect x="320" y="130" width="160" height="32" rx="6" fill="#fff3e0" stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="400" y="151" textAnchor="middle" fontSize="12" fill={COLORS.dark}>Linear W_K: (H, H)</text>

        <rect x="580" y="130" width="160" height="32" rx="6" fill="#fff3e0" stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="660" y="151" textAnchor="middle" fontSize="12" fill={COLORS.dark}>Linear W_V: (H, H)</text>

        {/* Arrows to reshape */}
        <line x1="140" y1="162" x2="140" y2="195" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="400" y1="162" x2="400" y2="195" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="660" y1="162" x2="660" y2="195" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        {/* Reshape + Transpose */}
        <rect x="40" y="195" width="200" height="32" rx="6" fill="#e0f2f1" stroke="#00695c" strokeWidth="1.5" />
        <text x="140" y="216" textAnchor="middle" fontSize="9" fill={COLORS.dark}>reshape + transpose → (B,h,S,d_k)</text>

        <rect x="300" y="195" width="200" height="32" rx="6" fill="#e0f2f1" stroke="#00695c" strokeWidth="1.5" />
        <text x="400" y="216" textAnchor="middle" fontSize="9" fill={COLORS.dark}>reshape + transpose → (B,h,S,d_k)</text>

        <rect x="560" y="195" width="200" height="32" rx="6" fill="#e0f2f1" stroke="#00695c" strokeWidth="1.5" />
        <text x="660" y="216" textAnchor="middle" fontSize="9" fill={COLORS.dark}>reshape + transpose → (B,h,S,d_k)</text>

        {/* Arrows to head split area */}
        <line x1="140" y1="227" x2="140" y2="260" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="400" y1="227" x2="400" y2="260" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="660" y1="227" x2="660" y2="260" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        {/* Parallel Heads Area */}
        <rect x="30" y="255" width="740" height="200" rx="10" fill="none" stroke="#9e9e9e" strokeWidth="1" strokeDasharray="6,3" />
        <text x="55" y="275" fontSize="12" fill="#666" fontStyle="italic">h 个 Head 并行计算</text>

        {/* Head 1 */}
        <rect x="55" y="290" width="150" height="80" rx="8" fill="#e3f2fd" stroke={COLORS.primary} strokeWidth="1.5" />
        <text x="130" y="315" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.primary}>Head 1</text>
        <text x="130" y="335" textAnchor="middle" fontSize="10" fill="#333">Attention(Q₁,K₁,V₁)</text>
        <text x="130" y="355" textAnchor="middle" fontSize="10" fill="#666">(B, 1, S, d_k)</text>

        {/* Head 2 */}
        <rect x="225" y="290" width="150" height="80" rx="8" fill="#e3f2fd" stroke={COLORS.primary} strokeWidth="1.5" />
        <text x="300" y="315" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.primary}>Head 2</text>
        <text x="300" y="335" textAnchor="middle" fontSize="10" fill="#333">Attention(Q₂,K₂,V₂)</text>
        <text x="300" y="355" textAnchor="middle" fontSize="10" fill="#666">(B, 1, S, d_k)</text>

        {/* Dots */}
        <text x="425" y="335" textAnchor="middle" fontSize="20" fill="#666">...</text>

        {/* Head h */}
        <rect x="475" y="290" width="150" height="80" rx="8" fill="#e3f2fd" stroke={COLORS.primary} strokeWidth="1.5" />
        <text x="550" y="315" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.primary}>Head h</text>
        <text x="550" y="335" textAnchor="middle" fontSize="10" fill="#333">Attention(Q_h,K_h,V_h)</text>
        <text x="550" y="355" textAnchor="middle" fontSize="10" fill="#666">(B, 1, S, d_k)</text>

        {/* Detail box */}
        <rect x="645" y="285" width="115" height="90" rx="6" fill="#fff8e1" stroke="#f9a825" strokeWidth="1" />
        <text x="702" y="305" textAnchor="middle" fontSize="9" fill="#333" fontWeight="bold">每个 Head 内部:</text>
        <text x="702" y="322" textAnchor="middle" fontSize="9" fill="#555">1. QK^T / √d_k</text>
        <text x="702" y="337" textAnchor="middle" fontSize="9" fill="#555">2. + Mask</text>
        <text x="702" y="352" textAnchor="middle" fontSize="9" fill="#555">3. Softmax</text>
        <text x="702" y="367" textAnchor="middle" fontSize="9" fill="#555">4. × V</text>

        {/* Arrows from heads to concat */}
        <line x1="130" y1="370" x2="130" y2="400" stroke="#666" strokeWidth="1.2" />
        <line x1="300" y1="370" x2="300" y2="400" stroke="#666" strokeWidth="1.2" />
        <line x1="550" y1="370" x2="550" y2="400" stroke="#666" strokeWidth="1.2" />

        <line x1="130" y1="400" x2="370" y2="475" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="300" y1="400" x2="380" y2="475" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="550" y1="400" x2="420" y2="475" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        {/* Concat */}
        <rect x="290" y="475" width="220" height="36" rx="6" fill="#f3e5f5" stroke="#7b1fa2" strokeWidth="1.5" />
        <text x="400" y="498" textAnchor="middle" fontSize="11" fill={COLORS.dark}>Concat → reshape: (B, S, H)</text>

        <line x1="400" y1="511" x2="400" y2="540" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        {/* Output Projection */}
        <rect x="290" y="540" width="220" height="32" rx="6" fill="#fff3e0" stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="400" y="561" textAnchor="middle" fontSize="12" fill={COLORS.dark}>Linear W_O: (H, H)</text>

        <line x1="400" y1="572" x2="400" y2="595" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        {/* Output */}
        <rect x="300" y="575" width="200" height="36" rx="6" fill="#e8f5e9" stroke={COLORS.green} strokeWidth="1.5" />
        <text x="400" y="598" textAnchor="middle" fontSize="13" fill={COLORS.dark}>输出: (B, S, H)</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Replace inline SVG in multi-head-attention.mdx**

Replace lines 180-293 (the entire inline `<svg>...</svg>` block) with:

```mdx
// Add import:
import MultiHeadParallelDiagram from '../../../components/interactive/MultiHeadParallelDiagram.tsx';

// Replace the inline SVG with:
<MultiHeadParallelDiagram client:visible />
```

- [ ] **Step 3: Verify and commit**

Verify the diagram looks identical to the original inline SVG.

```bash
npm run dev
git add src/components/interactive/MultiHeadParallelDiagram.tsx src/content/articles/zh/multi-head-attention.mdx
git commit -m "refactor: convert MHA inline SVG to React component (MultiHeadParallelDiagram)"
```

---

### Task 14: KVCacheGrowthChart (Diagram 5.1)

**Spec ref:** Section 5.1, Diagram 5.1 — KV Cache 大小随序列长度的增长曲线
**Files:**
- Create: `src/components/interactive/KVCacheGrowthChart.tsx`
- Modify: `src/content/articles/zh/gqa-mqa.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/KVCacheGrowthChart.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';
import { MODEL_PRESETS } from './shared/presets';
import { BYTES_PER_PARAM, type Precision } from './shared/types';

const SEQ_LENGTHS = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

function kvCacheGB(layers: number, kvHeads: number, headDim: number, seqLen: number, bytesPerParam: number): number {
  return (2 * layers * kvHeads * seqLen * headDim * bytesPerParam) / (1024 ** 3);
}

export default function KVCacheGrowthChart() {
  const [preset, setPreset] = useState('LLaMA-2 70B');
  const [precision, setPrecision] = useState<Precision>('FP16');
  const model = MODEL_PRESETS[preset];
  const bpp = BYTES_PER_PARAM[precision];

  const curves = useMemo(() => {
    const mha = SEQ_LENGTHS.map(s => kvCacheGB(model.layers, model.heads, model.headDim, s, bpp));
    const gqa = SEQ_LENGTHS.map(s => kvCacheGB(model.layers, model.kvHeads, model.headDim, s, bpp));
    const mqa = SEQ_LENGTHS.map(s => kvCacheGB(model.layers, 1, model.headDim, s, bpp));
    return { mha, gqa, mqa };
  }, [model, bpp]);

  const maxVal = Math.max(...curves.mha);
  const chartW = 500;
  const chartH = 250;
  const padL = 60;
  const padB = 30;
  const padT = 10;
  const padR = 10;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  function toX(i: number) { return padL + (i / (SEQ_LENGTHS.length - 1)) * plotW; }
  function toY(v: number) { return padT + plotH - (v / maxVal) * plotH; }

  function Line({ data, color, label }: { data: number[]; color: string; label: string }) {
    const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
    return (
      <g>
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
        {data.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={2.5} fill={color} />
        ))}
      </g>
    );
  }

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="flex flex-wrap gap-4 mb-3">
        <div>
          <label className="text-xs text-gray-500 block">模型预设</label>
          <select value={preset} onChange={e => setPreset(e.target.value)}
            className="text-sm border rounded px-2 py-1">
            {Object.keys(MODEL_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">精度</label>
          <select value={precision} onChange={e => setPrecision(e.target.value as Precision)}
            className="text-sm border rounded px-2 py-1">
            {(['FP32', 'FP16', 'INT8', 'INT4'] as Precision[]).map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="text-xs text-gray-400 self-end">
          h={model.heads}, kv_heads={model.kvHeads}, L={model.layers}, d_k={model.headDim}
        </div>
      </div>

      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-lg">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={padL} y1={toY(f * maxVal)} x2={chartW - padR} y2={toY(f * maxVal)}
              stroke="#f0f0f0" strokeWidth={0.5} />
            <text x={padL - 4} y={toY(f * maxVal) + 3} textAnchor="end"
              fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
              {(f * maxVal).toFixed(1)}GB
            </text>
          </g>
        ))}
        {/* X axis labels */}
        {SEQ_LENGTHS.map((s, i) => (
          i % 2 === 0 && (
            <text key={i} x={toX(i)} y={chartH - 5} textAnchor="middle"
              fontSize="7" fill={COLORS.mid} fontFamily="system-ui">
              {s >= 1024 ? `${s / 1024}K` : s}
            </text>
          )
        ))}
        {/* Curves */}
        <Line data={curves.mha} color={COLORS.red} label="MHA" />
        <Line data={curves.gqa} color={COLORS.orange} label="GQA" />
        <Line data={curves.mqa} color={COLORS.green} label="MQA" />
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: COLORS.red }} /> MHA ({curves.mha[curves.mha.length - 1].toFixed(1)} GB @ 128K)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: COLORS.orange }} /> GQA ({curves.gqa[curves.gqa.length - 1].toFixed(1)} GB)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: COLORS.green }} /> MQA ({curves.mqa[curves.mqa.length - 1].toFixed(2)} GB)
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to gqa-mqa.mdx**

```mdx
// Add import at top:
import KVCacheGrowthChart from '../../../components/interactive/KVCacheGrowthChart.tsx';

// Add after line 314 (after the KV Cache calculation comparison text, before ### Batch Serving 的影响):
<KVCacheGrowthChart client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/KVCacheGrowthChart.tsx src/content/articles/zh/gqa-mqa.mdx
git commit -m "feat: add KV cache growth chart (diagram 5.1)"
```

---

### Task 15: QueryKVMapping (Diagram 5.2 + inline SVG replacement)

**Spec ref:** Section 5.1, Diagram 5.2 + Section 6 (replaces gqa-mqa inline SVG lines 128-284)
**Files:**
- Create: `src/components/interactive/QueryKVMapping.tsx`
- Modify: `src/content/articles/zh/gqa-mqa.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/QueryKVMapping.tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, HEAD_COLORS } from './shared/colors';

const h = 4; // query heads
const gqa_g = 2; // GQA groups

function HeadNode({ x, y, label, color, dashed = false, opacity = 1 }: {
  x: number; y: number; label: string; color: string; dashed?: boolean; opacity?: number;
}) {
  return (
    <g opacity={opacity}>
      <rect x={x - 25} y={y - 14} width={50} height={28} rx={6}
        fill={color + '22'} stroke={color} strokeWidth={dashed ? 1 : 1.5}
        strokeDasharray={dashed ? '4,3' : 'none'} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="10"
        fill={color} fontFamily="system-ui" fontWeight="600">{label}</text>
    </g>
  );
}

function ConnectionLine({ x1, y1, x2, y2, color = COLORS.mid }: {
  x1: number; y1: number; x2: number; y2: number; color?: string;
}) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.2} />;
}

function Column({ title, subtitle, qPositions, kvPositions, connections, annotations }: {
  title: string; subtitle: string;
  qPositions: { x: number; label: string }[];
  kvPositions: { x: number; label: string; dashed?: boolean; opacity?: number }[];
  connections: [number, number][]; // [qIdx, kvIdx]
  annotations?: { x: number; y: number; text: string }[];
}) {
  const qY = 40;
  const kvY = 120;
  return (
    <g>
      <text x={150} y={16} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.dark}
        fontFamily="system-ui">{title}</text>
      <text x={150} y={30} textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily="system-ui">{subtitle}</text>

      {/* Connections */}
      {connections.map(([qi, kvi], i) => (
        <ConnectionLine key={i}
          x1={qPositions[qi].x} y1={qY + 14}
          x2={kvPositions[kvi].x} y2={kvY - 14}
          color={HEAD_COLORS[qi]}
        />
      ))}

      {/* Q heads */}
      {qPositions.map((q, i) => (
        <HeadNode key={`q-${i}`} x={q.x} y={qY} label={q.label} color={HEAD_COLORS[i]} />
      ))}

      {/* KV heads */}
      {kvPositions.map((kv, i) => (
        <HeadNode key={`kv-${i}`} x={kv.x} y={kvY} label={kv.label}
          color={COLORS.orange} dashed={kv.dashed} opacity={kv.opacity} />
      ))}

      {/* Annotations */}
      {annotations?.map((a, i) => (
        <text key={i} x={a.x} y={a.y} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily="system-ui">{a.text}</text>
      ))}
    </g>
  );
}

function MHADiagram() {
  const qs = [{ x: 45, label: 'Q₁' }, { x: 105, label: 'Q₂' }, { x: 195, label: 'Q₃' }, { x: 255, label: 'Q₄' }];
  const kvs = [{ x: 45, label: 'KV₁' }, { x: 105, label: 'KV₂' }, { x: 195, label: 'KV₃' }, { x: 255, label: 'KV₄' }];
  return (
    <svg viewBox="0 0 300 160" className="w-full max-w-[300px]">
      <Column title="MHA" subtitle="一对一" qPositions={qs} kvPositions={kvs}
        connections={[[0, 0], [1, 1], [2, 2], [3, 3]]}
        annotations={[{ x: 150, y: 155, text: 'KV heads = h = 4' }]} />
    </svg>
  );
}

function GQADiagram() {
  const qs = [{ x: 40, label: 'Q₁' }, { x: 100, label: 'Q₂' }, { x: 200, label: 'Q₃' }, { x: 260, label: 'Q₄' }];
  const kvs = [{ x: 70, label: 'KV₁' }, { x: 230, label: 'KV₂' }];
  return (
    <svg viewBox="0 0 300 160" className="w-full max-w-[300px]">
      <Column title="GQA (g=2)" subtitle="两对一" qPositions={qs} kvPositions={kvs}
        connections={[[0, 0], [1, 0], [2, 1], [3, 1]]}
        annotations={[
          { x: 70, y: 152, text: 'repeat_interleave' },
          { x: 230, y: 152, text: 'repeat_interleave' },
        ]} />
    </svg>
  );
}

function MQADiagram() {
  const qs = [{ x: 40, label: 'Q₁' }, { x: 100, label: 'Q₂' }, { x: 200, label: 'Q₃' }, { x: 260, label: 'Q₄' }];
  const kvs = [{ x: 150, label: 'KV' }];
  return (
    <svg viewBox="0 0 300 160" className="w-full max-w-[300px]">
      <Column title="MQA" subtitle="全共享" qPositions={qs} kvPositions={kvs}
        connections={[[0, 0], [1, 0], [2, 0], [3, 0]]}
        annotations={[{ x: 150, y: 155, text: 'KV heads = 1' }]} />
    </svg>
  );
}

export default function QueryKVMapping() {
  const steps = [
    {
      title: 'MHA — 每个 Q 对应独立 KV',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">标准多头注意力：{h} 个 Q head 各自拥有独立的 KV head。</p>
          <div className="flex justify-center"><MHADiagram /></div>
        </div>
      ),
    },
    {
      title: 'GQA — 每组 Q 共享 KV',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            分组查询注意力：{h} 个 Q head 分为 {gqa_g} 组，每组共享一对 KV head。
            通过 <code className="bg-gray-100 px-1 rounded">repeat_interleave</code> 将 KV 复制以匹配 Q 数量。
          </p>
          <div className="flex justify-center"><GQADiagram /></div>
          <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
            KV Cache 缩减为 MHA 的 g/h = {gqa_g}/{h} = {((gqa_g / h) * 100).toFixed(0)}%
          </div>
        </div>
      ),
    },
    {
      title: 'MQA — 所有 Q 共享同一 KV',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            多查询注意力：所有 {h} 个 Q head 共享同一对 KV head — 最极致的缩减。
          </p>
          <div className="flex justify-center"><MQADiagram /></div>
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
            KV Cache 缩减为 MHA 的 1/h = 1/{h} = {((1 / h) * 100).toFixed(1)}%
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Replace inline SVG in gqa-mqa.mdx**

Replace lines 128-284 (the entire `<svg>...</svg>` block) with the React component:

```mdx
// Add import:
import QueryKVMapping from '../../../components/interactive/QueryKVMapping.tsx';

// Replace the inline SVG with:
<QueryKVMapping client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/QueryKVMapping.tsx src/content/articles/zh/gqa-mqa.mdx
git commit -m "feat: add query-KV mapping animation, replace inline SVG (diagram 5.2)"
```

---

### Task 16: UptrainingPooling (Diagram 5.3)

**Spec ref:** Section 5.1, Diagram 5.3 — Uptraining 参数池化过程
**Files:**
- Create: `src/components/interactive/UptrainingPooling.tsx`
- Modify: `src/content/articles/zh/gqa-mqa.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/UptrainingPooling.tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { HEAD_COLORS, COLORS } from './shared/colors';

const h = 8; // original head count
const g = 2; // target group count
const headsPerGroup = h / g;
const cellSize = 14;
const matSize = 4; // simplified 4x4 weight matrices

// Generate a small "weight matrix" for visualization
function genWeights(seed: number): number[][] {
  let s = seed;
  const next = () => { s = (s * 16807 + 11) % 2147483647; return ((s % 200) - 100) / 100; };
  return Array.from({ length: matSize }, () =>
    Array.from({ length: matSize }, () => parseFloat(next().toFixed(2)))
  );
}

function MiniHeatmap({ data, color, label, size = 60 }: {
  data: number[][]; color: string; label: string; size?: number;
}) {
  const cs = size / matSize;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {data.map((row, i) =>
          row.map((v, j) => {
            const t = (v + 1) / 2;
            return (
              <rect key={`${i}-${j}`} x={j * cs} y={i * cs} width={cs - 0.5} height={cs - 0.5}
                fill={color} opacity={0.2 + t * 0.7} rx={1} />
            );
          })
        )}
      </svg>
      <span className="text-[8px] text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

export default function UptrainingPooling() {
  const allWeights = useMemo(() =>
    Array.from({ length: h }, (_, i) => genWeights(42 + i * 17)), []);

  // Pooled weights (mean of each group)
  const pooled = useMemo(() =>
    Array.from({ length: g }, (_, gi) => {
      const groupStart = gi * headsPerGroup;
      return Array.from({ length: matSize }, (_, r) =>
        Array.from({ length: matSize }, (_, c) => {
          let sum = 0;
          for (let hi = groupStart; hi < groupStart + headsPerGroup; hi++) {
            sum += allWeights[hi][r][c];
          }
          return parseFloat((sum / headsPerGroup).toFixed(2));
        })
      );
    }), [allWeights]);

  const steps = [
    {
      title: `Step 1: ${h} 个 KV Head 权重矩阵`,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            原始 MHA 模型有 {h} 个独立的 KV head，每个都有自己的权重矩阵。
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {allWeights.map((w, i) => (
              <MiniHeatmap key={i} data={w} color={HEAD_COLORS[i % HEAD_COLORS.length]} label={`KV${i + 1}`} />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: `Step 2: 分组 (g=${g}，每组 ${headsPerGroup} 个)`,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            将 {h} 个 head 分为 {g} 组，每组 {headsPerGroup} 个 head。
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: g }, (_, gi) => (
              <div key={gi} className="p-2 border-2 rounded-lg" style={{ borderColor: HEAD_COLORS[gi] }}>
                <div className="text-xs font-semibold mb-1 text-center" style={{ color: HEAD_COLORS[gi] }}>
                  组 {gi + 1}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: headsPerGroup }, (_, hi) => {
                    const idx = gi * headsPerGroup + hi;
                    return <MiniHeatmap key={idx} data={allWeights[idx]}
                      color={HEAD_COLORS[idx % HEAD_COLORS.length]} label={`KV${idx + 1}`} size={50} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Step 3: 均值池化',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            组内取均值：{headsPerGroup} 个权重矩阵 → 1 个权重矩阵。{h} 个 head → {g} 个 head。
          </p>
          <div className="flex justify-center gap-8">
            {pooled.map((w, gi) => (
              <MiniHeatmap key={gi} data={w} color={HEAD_COLORS[gi]} label={`GQA KV${gi + 1}`} size={80} />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Step 4: Uptraining',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            用少量数据（约原训练量的 5%）微调，恢复因池化带来的质量损失。
          </p>
          <div className="flex justify-center gap-8">
            {pooled.map((w, gi) => (
              <div key={gi} className="flex flex-col items-center">
                <MiniHeatmap data={w} color={HEAD_COLORS[gi]} label={`GQA KV${gi + 1}`} size={80} />
                <span className="text-[9px] text-green-600 mt-1 font-semibold">✓ 微调完成</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-800">
            <strong>结果：</strong>从 {h} 个 KV head 缩减到 {g} 个，
            KV Cache 缩小 {h / g}×，质量接近原始 MHA。
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Add to gqa-mqa.mdx**

```mdx
// Add import:
import UptrainingPooling from '../../../components/interactive/UptrainingPooling.tsx';

// Add after line 124 (after the uptraining explanation, before ## 结构对比图):
<UptrainingPooling client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/UptrainingPooling.tsx src/content/articles/zh/gqa-mqa.mdx
git commit -m "feat: add uptraining pooling animation (diagram 5.3)"
```

---

### Task 17: ConcurrencyComparison (Diagram 5.4)

**Spec ref:** Section 5.1, Diagram 5.4 — 批处理并发能力对比
**Files:**
- Create: `src/components/interactive/ConcurrencyComparison.tsx`
- Modify: `src/content/articles/zh/gqa-mqa.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/ConcurrencyComparison.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';
import { BYTES_PER_PARAM } from './shared/types';

export default function ConcurrencyComparison() {
  const [gpuMemGB, setGpuMemGB] = useState(40); // Available for KV Cache
  const [seqLen, setSeqLen] = useState(4096);

  // LLaMA-2 70B params
  const L = 80, heads = 64, dk = 128, kvHeadsGQA = 8;

  const kvPerReq = useMemo(() => {
    const bytes = BYTES_PER_PARAM['FP16'];
    const mha = (2 * L * heads * seqLen * dk * bytes) / (1024 ** 3);
    const gqa = (2 * L * kvHeadsGQA * seqLen * dk * bytes) / (1024 ** 3);
    const mqa = (2 * L * 1 * seqLen * dk * bytes) / (1024 ** 3);
    return { mha, gqa, mqa };
  }, [seqLen]);

  const concurrency = {
    mha: Math.floor(gpuMemGB / kvPerReq.mha),
    gqa: Math.floor(gpuMemGB / kvPerReq.gqa),
    mqa: Math.floor(gpuMemGB / kvPerReq.mqa),
  };

  const maxConc = Math.max(concurrency.mha, concurrency.gqa, concurrency.mqa, 1);

  const bars = [
    { label: 'MHA', value: concurrency.mha, color: COLORS.red, kvGB: kvPerReq.mha },
    { label: 'GQA', value: concurrency.gqa, color: COLORS.orange, kvGB: kvPerReq.gqa },
    { label: 'MQA', value: concurrency.mqa, color: COLORS.green, kvGB: kvPerReq.mqa },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-500 block">可用 GPU 显存 (GB)</label>
          <input type="range" min={10} max={160} step={10} value={gpuMemGB}
            onChange={e => setGpuMemGB(Number(e.target.value))} className="w-32" />
          <span className="text-sm ml-2 font-semibold">{gpuMemGB} GB</span>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">序列长度</label>
          <select value={seqLen} onChange={e => setSeqLen(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1">
            {[1024, 2048, 4096, 8192, 16384].map(s => (
              <option key={s} value={s}>{s.toLocaleString()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {bars.map(bar => (
          <div key={bar.label} className="flex items-center gap-3">
            <div className="w-12 text-sm font-semibold text-right" style={{ color: bar.color }}>
              {bar.label}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{
                  width: `${Math.max((bar.value / maxConc) * 100, 3)}%`,
                  backgroundColor: bar.color + '33',
                  border: `2px solid ${bar.color}`,
                }}>
              </div>
            </div>
            <div className="w-40 text-sm">
              <strong>{bar.value}</strong> 个并发
              <span className="text-xs text-gray-400 ml-1">
                ({bar.kvGB.toFixed(2)} GB/req)
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        基于 LLaMA-2 70B 参数 (L={L}, h={heads}, d_k={dk}, GQA kv_heads={kvHeadsGQA}), FP16
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add to gqa-mqa.mdx**

```mdx
// Add import:
import ConcurrencyComparison from '../../../components/interactive/ConcurrencyComparison.tsx';

// Add after line 326 (after the batch serving concurrency table, before ## 质量与性能的 Trade-off):
<ConcurrencyComparison client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/ConcurrencyComparison.tsx src/content/articles/zh/gqa-mqa.mdx
git commit -m "feat: add concurrency comparison chart (diagram 5.4)"
```

---

### Task 18: RedundantComputationViz (Diagram 6.1)

**Spec ref:** Section 5.2, Diagram 6.1 — 无 Cache 时的重复计算可视化
**Files:**
- Create: `src/components/interactive/RedundantComputationViz.tsx`
- Modify: `src/content/articles/zh/kv-cache.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/RedundantComputationViz.tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const N = 5;
const TOKENS = ['Hello', 'world', 'how', 'are', 'you'];

function AttentionGrid({ step }: { step: number }) {
  // step 0: generate token 2 (row 1, 1 cell)
  // step 1: generate token 3 (rows 0-1 re-computed + row 2)
  // etc.
  const totalRows = step + 1;
  const cellSize = 36;
  const labelW = 48;
  const labelH = 24;
  const svgW = labelW + (totalRows + 1) * cellSize;
  const svgH = labelH + (totalRows + 1) * cellSize;

  let wastedCells = 0;
  let totalCells = 0;

  return (
    <svg viewBox={`0 0 ${svgW + 10} ${svgH + 30}`} className="w-full max-w-sm mx-auto">
      {/* Column labels (keys) */}
      {TOKENS.slice(0, totalRows + 1).map((t, j) => (
        <text key={`c-${j}`} x={labelW + j * cellSize + cellSize / 2} y={labelH - 4}
          textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
      ))}
      {/* For each generation step's attention row */}
      {Array.from({ length: totalRows }, (_, i) => {
        const isRecomputed = i < step; // rows before current step are redundant
        const cols = i + 2; // number of KV pairs at this row
        return TOKENS.slice(0, cols).map((_, j) => {
          const fill = isRecomputed ? COLORS.waste : COLORS.valid;
          if (isRecomputed) wastedCells++;
          totalCells++;
          return (
            <g key={`${i}-${j}`}>
              <rect x={labelW + j * cellSize} y={labelH + i * cellSize}
                width={cellSize - 1} height={cellSize - 1} rx={3}
                fill={fill} stroke="#d1d5db" strokeWidth={0.5} />
              {isRecomputed && (
                <line x1={labelW + j * cellSize + 3} y1={labelH + i * cellSize + 3}
                  x2={labelW + j * cellSize + cellSize - 4} y2={labelH + i * cellSize + cellSize - 4}
                  stroke={COLORS.red} strokeWidth={1.5} opacity={0.5} />
              )}
            </g>
          );
        });
      })}
      {/* Row labels (query = new token) */}
      {Array.from({ length: totalRows }, (_, i) => (
        <text key={`r-${i}`} x={labelW - 4} y={labelH + i * cellSize + cellSize / 2 + 3}
          textAnchor="end" fontSize="8" fill={i < step ? COLORS.red : COLORS.primary}
          fontFamily="system-ui" fontWeight={i === step ? '700' : '400'}>
          gen {TOKENS[i + 1]}
        </text>
      ))}
      {/* Stats */}
      {(() => { wastedCells = 0; totalCells = 0;
        for (let i = 0; i < totalRows; i++) {
          for (let j = 0; j < i + 2; j++) {
            if (i < step) wastedCells++;
            totalCells++;
          }
        }
        return (
          <text x={svgW / 2} y={svgH + 20} textAnchor="middle" fontSize="10" fill={COLORS.dark} fontFamily="system-ui">
            总计算: {totalCells} · 浪费: {wastedCells} ({totalCells > 0 ? ((wastedCells / totalCells) * 100).toFixed(0) : 0}%)
          </text>
        );
      })()}
    </svg>
  );
}

export default function RedundantComputationViz() {
  const steps = Array.from({ length: N - 1 }, (_, step) => ({
    title: `生成 "${TOKENS[step + 1]}" (第 ${step + 1} 步)`,
    content: (
      <div>
        <p className="text-sm text-gray-600 mb-3">
          {step === 0 ? '第一步没有重复计算。' :
            `前 ${step} 行（浅红 + 划线）是重复计算 — 这些 attention 分数之前已经算过了！`}
        </p>
        <AttentionGrid step={step} />
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.valid }} /> 新计算
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.waste }} /> 重复计算
          </span>
        </div>
      </div>
    ),
  }));

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Add to kv-cache.mdx**

Add import and place after the section explaining why KV cache avoids redundant computation (the section that explains the problem KV Cache solves).

```mdx
import RedundantComputationViz from '../../../components/interactive/RedundantComputationViz.tsx';
// Place after the section explaining redundant computation without cache
<RedundantComputationViz client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/RedundantComputationViz.tsx src/content/articles/zh/kv-cache.mdx
git commit -m "feat: add redundant computation visualization (diagram 6.1)"
```

---

### Task 19: KVCacheCalculator (Diagram 6.2)

**Spec ref:** Section 5.2, Diagram 6.2 — KV Cache 内存公式交互计算器
**Files:**
- Create: `src/components/interactive/KVCacheCalculator.tsx`
- Modify: `src/content/articles/zh/kv-cache.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/KVCacheCalculator.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';
import { MODEL_PRESETS, HARDWARE_PRESETS } from './shared/presets';
import { BYTES_PER_PARAM, type Precision } from './shared/types';

export default function KVCacheCalculator() {
  const [preset, setPreset] = useState('LLaMA-2 7B');
  const [seqLen, setSeqLen] = useState(2048);
  const [precision, setPrecision] = useState<Precision>('FP16');
  const [concurrency, setConcurrency] = useState(1);
  const [hwPreset, setHwPreset] = useState('A100 80GB');

  const model = MODEL_PRESETS[preset];
  const hw = HARDWARE_PRESETS[hwPreset];
  const bpp = BYTES_PER_PARAM[precision];

  const result = useMemo(() => {
    const singleBytes = 2 * model.layers * model.kvHeads * seqLen * model.headDim * bpp;
    const singleGB = singleBytes / (1024 ** 3);
    const totalGB = singleGB * concurrency;
    const pct = (totalGB / hw.memoryGB) * 100;
    return { singleGB, totalGB, pct };
  }, [model, seqLen, bpp, concurrency, hw]);

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 block">模型预设</label>
          <select value={preset} onChange={e => setPreset(e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full">
            {Object.keys(MODEL_PRESETS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">序列长度 S: {seqLen.toLocaleString()}</label>
          <input type="range" min={256} max={131072} step={256} value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">精度</label>
          <select value={precision} onChange={e => setPrecision(e.target.value as Precision)}
            className="text-sm border rounded px-2 py-1 w-full">
            {(['FP32', 'FP16', 'INT8', 'INT4'] as Precision[]).map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">并发请求 N: {concurrency}</label>
          <input type="range" min={1} max={256} step={1} value={concurrency}
            onChange={e => setConcurrency(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">GPU</label>
          <select value={hwPreset} onChange={e => setHwPreset(e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full">
            {Object.keys(HARDWARE_PRESETS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="text-xs text-gray-500">单请求 KV Cache</div>
          <div className="text-lg font-bold text-blue-700">{result.singleGB.toFixed(3)} GB</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded">
          <div className="text-xs text-gray-500">{concurrency} 个并发总占用</div>
          <div className="text-lg font-bold text-orange-700">{result.totalGB.toFixed(2)} GB</div>
        </div>
        <div className="text-center p-3 rounded" style={{
          backgroundColor: result.pct > 100 ? '#fee2e2' : result.pct > 80 ? '#fef3c7' : '#d1fae5'
        }}>
          <div className="text-xs text-gray-500">占 GPU 显存</div>
          <div className="text-lg font-bold" style={{
            color: result.pct > 100 ? COLORS.red : result.pct > 80 ? COLORS.orange : COLORS.green
          }}>
            {result.pct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(result.pct, 100)}%`,
            backgroundColor: result.pct > 100 ? COLORS.red : result.pct > 80 ? COLORS.orange : COLORS.green,
          }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1 text-center">
        {hw.name}: {hw.memoryGB} GB 总显存
      </div>

      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
        公式: 2 × L({model.layers}) × kv_heads({model.kvHeads}) × S({seqLen.toLocaleString()}) × d_k({model.headDim}) × {bpp}B
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to kv-cache.mdx**

```mdx
import KVCacheCalculator from '../../../components/interactive/KVCacheCalculator.tsx';
// Place after the KV Cache memory formula section
<KVCacheCalculator client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/KVCacheCalculator.tsx src/content/articles/zh/kv-cache.mdx
git commit -m "feat: add KV cache calculator (diagram 6.2)"
```

---

### Task 20: PagedAttentionComparison (Diagram 6.3)

**Spec ref:** Section 5.2, Diagram 6.3 — PagedAttention vs 预分配的显存碎片对比
**Files:**
- Create: `src/components/interactive/PagedAttentionComparison.tsx`
- Modify: `src/content/articles/zh/kv-cache.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/PagedAttentionComparison.tsx
import { useState, useEffect } from 'react';
import { COLORS, HEAD_COLORS } from './shared/colors';

const TOTAL_BLOCKS = 20;
const BLOCK_W = 28;
const BLOCK_H = 22;
const GAP = 2;

type BlockState = 'free' | 'reqA' | 'reqB' | 'waste' | 'fragment';

function MemoryBar({ blocks, label }: { blocks: BlockState[]; label: string }) {
  const colorMap: Record<BlockState, string> = {
    free: '#f3f4f6',
    reqA: HEAD_COLORS[0] + '66',
    reqB: HEAD_COLORS[2] + '66',
    waste: COLORS.waste,
    fragment: '#e5e7eb',
  };
  const totalW = blocks.length * (BLOCK_W + GAP);
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <svg viewBox={`0 0 ${totalW} ${BLOCK_H + 4}`} className="w-full max-w-md">
        {blocks.map((b, i) => (
          <rect key={i} x={i * (BLOCK_W + GAP)} y={2} width={BLOCK_W} height={BLOCK_H}
            rx={3} fill={colorMap[b]} stroke="#d1d5db" strokeWidth={0.5} />
        ))}
      </svg>
    </div>
  );
}

export default function PagedAttentionComparison() {
  const [step, setStep] = useState(0);
  const maxStep = 3;

  // Pre-allocated states
  const preAllocStates: BlockState[][] = [
    // Step 0: Request A pre-allocates 10 blocks
    [...Array(10).fill('reqA'), ...Array(10).fill('free')],
    // Step 1: Request A only uses 5 blocks (5 wasted)
    [...Array(5).fill('reqA'), ...Array(5).fill('waste'), ...Array(10).fill('free')],
    // Step 2: Request A done, leaves gap
    [...Array(5).fill('fragment'), ...Array(5).fill('fragment'), ...Array(10).fill('free')],
    // Step 3: Request B needs 8 blocks, can't fit in the gap
    [...Array(5).fill('fragment'), ...Array(5).fill('fragment'), ...Array(8).fill('reqB'), ...Array(2).fill('free')],
  ];

  // Paged states
  const pagedStates: BlockState[][] = [
    // Step 0: Request A allocates pages as needed (5 pages)
    [...Array(5).fill('reqA'), ...Array(15).fill('free')],
    // Step 1: Request A uses exactly 5 pages
    [...Array(5).fill('reqA'), ...Array(15).fill('free')],
    // Step 2: Request A done, pages freed
    [...Array(20).fill('free')],
    // Step 3: Request B allocates 8 pages anywhere
    [...Array(8).fill('reqB'), ...Array(12).fill('free')],
  ];

  const labels = [
    'Request A 分配空间',
    'Request A 实际只用了一半',
    'Request A 完成，释放空间',
    'Request B 需要 8 个块',
  ];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2 text-center">传统预分配</div>
          <MemoryBar blocks={preAllocStates[step]} label="GPU 显存" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2 text-center">PagedAttention</div>
          <MemoryBar blocks={pagedStates[step]} label="GPU 显存" />
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 mb-3">{labels[step]}</div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: maxStep + 1 }, (_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`px-3 py-1 text-xs rounded ${i === step
              ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Step {i + 1}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: HEAD_COLORS[0] + '66' }} /> Request A
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: HEAD_COLORS[2] + '66' }} /> Request B
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.waste }} /> 内部碎片
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: '#e5e7eb' }} /> 外部碎片
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to kv-cache.mdx**

```mdx
import PagedAttentionComparison from '../../../components/interactive/PagedAttentionComparison.tsx';
// Place in the PagedAttention section
<PagedAttentionComparison client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/PagedAttentionComparison.tsx src/content/articles/zh/kv-cache.mdx
git commit -m "feat: add paged attention comparison (diagram 6.3)"
```

---

### Task 21: ContinuousBatchingTimeline (Diagram 6.4)

**Spec ref:** Section 5.2, Diagram 6.4 — Continuous Batching 请求调度时间轴
**Files:**
- Create: `src/components/interactive/ContinuousBatchingTimeline.tsx`
- Modify: `src/content/articles/zh/kv-cache.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/ContinuousBatchingTimeline.tsx
import { COLORS, HEAD_COLORS } from './shared/colors';

// Request definitions: [startTime, duration]
const REQUESTS = [
  { id: 'A', duration: 3, color: HEAD_COLORS[0] },
  { id: 'B', duration: 5, color: HEAD_COLORS[1] },
  { id: 'C', duration: 2, color: HEAD_COLORS[2] },
  { id: 'D', duration: 3, color: HEAD_COLORS[3] },
  { id: 'E', duration: 2, color: HEAD_COLORS[4] },
];

const TOTAL_TIME = 8;
const SLOTS = 3;

function Timeline({ title, schedule, utilization }: {
  title: string;
  schedule: { slot: number; start: number; end: number; reqId: string; color: string; idle?: boolean }[];
  utilization: number;
}) {
  const svgW = 500;
  const svgH = SLOTS * 30 + 40;
  const padL = 30;
  const padT = 24;
  const timeW = (svgW - padL - 10) / TOTAL_TIME;
  const slotH = 24;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold text-gray-700 mb-1">{title}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-md">
        {/* Time axis */}
        {Array.from({ length: TOTAL_TIME + 1 }, (_, t) => (
          <g key={t}>
            <line x1={padL + t * timeW} y1={padT - 4} x2={padL + t * timeW} y2={padT + SLOTS * (slotH + 2)}
              stroke="#e5e7eb" strokeWidth={0.5} />
            <text x={padL + t * timeW} y={padT - 8} textAnchor="middle"
              fontSize="8" fill={COLORS.mid} fontFamily="system-ui">t{t}</text>
          </g>
        ))}
        {/* Slot labels */}
        {Array.from({ length: SLOTS }, (_, s) => (
          <text key={s} x={padL - 4} y={padT + s * (slotH + 2) + slotH / 2 + 3}
            textAnchor="end" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">Slot {s + 1}</text>
        ))}
        {/* Schedule blocks */}
        {schedule.map((s, i) => (
          <g key={i}>
            <rect
              x={padL + s.start * timeW + 1}
              y={padT + s.slot * (slotH + 2)}
              width={(s.end - s.start) * timeW - 2}
              height={slotH}
              rx={4}
              fill={s.idle ? '#f3f4f6' : s.color + '55'}
              stroke={s.idle ? '#d1d5db' : s.color}
              strokeWidth={1}
            />
            {!s.idle && (
              <text
                x={padL + ((s.start + s.end) / 2) * timeW}
                y={padT + s.slot * (slotH + 2) + slotH / 2 + 3}
                textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily="system-ui" fontWeight="600">
                {s.reqId}
              </text>
            )}
          </g>
        ))}
        {/* Utilization */}
        <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize="10"
          fill={utilization > 80 ? COLORS.green : COLORS.orange} fontFamily="system-ui" fontWeight="600">
          GPU 利用率: {utilization}%
        </text>
      </svg>
    </div>
  );
}

export default function ContinuousBatchingTimeline() {
  // Static batching: A(3), B(5), C(2) start together, wait for B to finish
  const staticSchedule = [
    { slot: 0, start: 0, end: 3, reqId: 'A', color: REQUESTS[0].color },
    { slot: 0, start: 3, end: 5, reqId: '', color: '', idle: true }, // A idle
    { slot: 1, start: 0, end: 5, reqId: 'B', color: REQUESTS[1].color },
    { slot: 2, start: 0, end: 2, reqId: 'C', color: REQUESTS[2].color },
    { slot: 2, start: 2, end: 5, reqId: '', color: '', idle: true }, // C idle
    // New batch after t=5
    { slot: 0, start: 5, end: 8, reqId: 'D', color: REQUESTS[3].color },
    { slot: 1, start: 5, end: 7, reqId: 'E', color: REQUESTS[4].color },
    { slot: 1, start: 7, end: 8, reqId: '', color: '', idle: true },
    { slot: 2, start: 5, end: 8, reqId: '', color: '', idle: true },
  ];

  // Continuous batching: fill slots as they become free
  const contSchedule = [
    { slot: 0, start: 0, end: 3, reqId: 'A', color: REQUESTS[0].color },
    { slot: 1, start: 0, end: 5, reqId: 'B', color: REQUESTS[1].color },
    { slot: 2, start: 0, end: 2, reqId: 'C', color: REQUESTS[2].color },
    // C finishes at t=2, D fills in
    { slot: 2, start: 2, end: 5, reqId: 'D', color: REQUESTS[3].color },
    // A finishes at t=3, E fills in
    { slot: 0, start: 3, end: 5, reqId: 'E', color: REQUESTS[4].color },
    { slot: 0, start: 5, end: 8, reqId: '', color: '', idle: true },
    { slot: 1, start: 5, end: 8, reqId: '', color: '', idle: true },
    { slot: 2, start: 5, end: 8, reqId: '', color: '', idle: true },
  ];

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Timeline title="Static Batching" schedule={staticSchedule} utilization={63} />
        <Timeline title="Continuous Batching" schedule={contSchedule} utilization={83} />
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        Continuous Batching 在请求完成后立即插入新请求，显著提高 GPU 利用率
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add to kv-cache.mdx and commit**

```bash
# Add import + component to the Continuous Batching section of kv-cache.mdx
npm run dev
git add src/components/interactive/ContinuousBatchingTimeline.tsx src/content/articles/zh/kv-cache.mdx
git commit -m "feat: add continuous batching timeline (diagram 6.4)"
```

---

### Task 22: RooflineModel (Diagram 7.1)

**Spec ref:** Section 5.3, Diagram 7.1 — Roofline 模型交互图
**Files:**
- Create: `src/components/interactive/RooflineModel.tsx`
- Modify: `src/content/articles/zh/prefill-vs-decode.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/RooflineModel.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';
import { HARDWARE_PRESETS } from './shared/presets';

export default function RooflineModel() {
  const [batchSize, setBatchSize] = useState(1);
  const [hwPreset, setHwPreset] = useState('A100 80GB');
  const hw = HARDWARE_PRESETS[hwPreset];

  // Roofline parameters
  const peakTFLOPS = hw.peakTFLOPS;
  const bwTBs = hw.bandwidthTBs;
  const ridgePoint = peakTFLOPS / bwTBs; // FLOP/Byte at knee

  // Arithmetic intensity for Prefill and Decode
  // Prefill: compute-bound, high AI (~model_dim, simplified)
  const prefillAI = 200; // FLOP/Byte (roughly, depends on seq len)
  // Decode: memory-bound, AI ≈ 2*batch_size/sizeof(element) for matmul
  const decodeAI = 2 * batchSize / 2; // FP16 = 2 bytes

  // Throughput on roofline
  const roofline = (ai: number) => Math.min(ai * bwTBs, peakTFLOPS);

  // Chart dimensions (log-log)
  const svgW = 480;
  const svgH = 300;
  const padL = 60, padR = 20, padT = 30, padB = 40;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const aiMin = 0.5, aiMax = 1000;
  const tpMin = 0.1, tpMax = peakTFLOPS * 1.5;

  const logX = (ai: number) => padL + (Math.log10(ai / aiMin) / Math.log10(aiMax / aiMin)) * plotW;
  const logY = (tp: number) => padT + plotH - (Math.log10(tp / tpMin) / Math.log10(tpMax / tpMin)) * plotH;

  // Generate roofline curve points
  const roofPoints = useMemo(() => {
    const points: string[] = [];
    for (let logAI = Math.log10(aiMin); logAI <= Math.log10(aiMax); logAI += 0.05) {
      const ai = Math.pow(10, logAI);
      const tp = roofline(ai);
      points.push(`${logX(ai)},${logY(tp)}`);
    }
    return points.join(' ');
  }, [hw]);

  const decodeTP = roofline(decodeAI);
  const prefillTP = roofline(prefillAI);
  const isDecodeCompute = decodeAI >= ridgePoint;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="flex flex-wrap gap-4 mb-3">
        <div>
          <label className="text-xs text-gray-500 block">Batch Size: {batchSize}</label>
          <input type="range" min={1} max={256} step={1} value={batchSize}
            onChange={e => setBatchSize(Number(e.target.value))} className="w-40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">硬件</label>
          <select value={hwPreset} onChange={e => setHwPreset(e.target.value)}
            className="text-sm border rounded px-2 py-1">
            {Object.keys(HARDWARE_PRESETS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg">
        {/* Roofline */}
        <polyline points={roofPoints} fill="none" stroke={COLORS.mid} strokeWidth={2} />

        {/* Ridge point vertical line */}
        <line x1={logX(ridgePoint)} y1={padT} x2={logX(ridgePoint)} y2={padT + plotH}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />
        <text x={logX(ridgePoint)} y={padT + plotH + 28} textAnchor="middle"
          fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
          I* = {ridgePoint.toFixed(0)} FLOP/B
        </text>

        {/* Labels */}
        <text x={logX(2)} y={logY(roofline(2)) - 10} fontSize="9" fill={COLORS.mid}
          fontFamily="system-ui">Memory-bound</text>
        <text x={logX(ridgePoint * 3)} y={logY(peakTFLOPS) - 10} fontSize="9" fill={COLORS.mid}
          fontFamily="system-ui">Compute-bound</text>

        {/* Prefill point */}
        <circle cx={logX(prefillAI)} cy={logY(prefillTP)} r={6} fill={COLORS.green} />
        <text x={logX(prefillAI) + 10} y={logY(prefillTP) + 4} fontSize="10"
          fill={COLORS.green} fontFamily="system-ui" fontWeight="600">Prefill</text>

        {/* Decode point */}
        <circle cx={logX(decodeAI)} cy={logY(decodeTP)} r={6}
          fill={isDecodeCompute ? COLORS.green : COLORS.red} />
        <text x={logX(decodeAI) + 10} y={logY(decodeTP) - 8} fontSize="10"
          fill={isDecodeCompute ? COLORS.green : COLORS.red} fontFamily="system-ui" fontWeight="600">
          Decode (bs={batchSize})
        </text>

        {/* Axes labels */}
        <text x={padL + plotW / 2} y={svgH - 4} textAnchor="middle"
          fontSize="10" fill={COLORS.dark} fontFamily="system-ui">
          Arithmetic Intensity (FLOP/Byte, log)
        </text>
        <text x={14} y={padT + plotH / 2} textAnchor="middle"
          fontSize="10" fill={COLORS.dark} fontFamily="system-ui"
          transform={`rotate(-90, 14, ${padT + plotH / 2})`}>
          Throughput (TFLOPS, log)
        </text>
      </svg>

      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <strong>Decode:</strong> AI = {decodeAI.toFixed(1)} FLOP/B →{' '}
        {isDecodeCompute ? '✅ Compute-bound (batch 足够大)' : '⚠️ Memory-bound (带宽瓶颈)'}
        &nbsp;| <strong>Prefill:</strong> AI ≈ {prefillAI} FLOP/B → ✅ Compute-bound
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to prefill-vs-decode.mdx**

```mdx
import RooflineModel from '../../../components/interactive/RooflineModel.tsx';
// Place after the section explaining compute-bound vs memory-bound
<RooflineModel client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/RooflineModel.tsx src/content/articles/zh/prefill-vs-decode.mdx
git commit -m "feat: add roofline model interactive chart (diagram 7.1)"
```

---

### Task 23: GEMMvsGEMV (Diagram 7.2)

**Spec ref:** Section 5.3, Diagram 7.2 — GEMM vs GEMV 并排对比
**Files:**
- Create: `src/components/interactive/GEMMvsGEMV.tsx`
- Modify: `src/content/articles/zh/prefill-vs-decode.mdx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/interactive/GEMMvsGEMV.tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const d = 6; // simplified dimension
const n = 4; // batch/seq length for Prefill

function MatrixViz({ rows, cols, activeRow, activeCol, color, label }: {
  rows: number; cols: number; activeRow?: number; activeCol?: number;
  color: string; label: string;
}) {
  const cs = 20;
  return (
    <div className="flex flex-col items-center">
      <div className="text-[9px] text-gray-500 mb-0.5">{label}</div>
      <svg viewBox={`0 0 ${cols * cs} ${rows * cs}`} width={cols * cs} height={rows * cs}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const isActive = (activeRow !== undefined && r === activeRow) ||
              (activeCol !== undefined && c === activeCol);
            return (
              <rect key={`${r}-${c}`} x={c * cs} y={r * cs}
                width={cs - 1} height={cs - 1} rx={2}
                fill={isActive ? color : '#f3f4f6'}
                stroke="#d1d5db" strokeWidth={0.3} />
            );
          })
        )}
      </svg>
    </div>
  );
}

function GPUGrid({ active, total, label }: { active: number; total: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[9px] text-gray-500 mb-0.5">{label}</div>
      <div className="grid grid-cols-4 gap-0.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: i < active ? COLORS.green : '#e5e7eb' }} />
        ))}
      </div>
      <div className="text-[8px] text-gray-400 mt-0.5">{((active / total) * 100).toFixed(0)}% 利用率</div>
    </div>
  );
}

export default function GEMMvsGEMV() {
  const steps = [
    {
      title: 'GEMM (Prefill) vs GEMV (Decode)',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Prefill 做矩阵×矩阵 (GEMM)，Decode 做向量×矩阵 (GEMV)。
            关键差异在于<strong>数据复用率</strong>。
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-sm font-semibold mb-2" style={{ color: COLORS.green }}>Prefill (GEMM)</div>
              <div className="text-xs text-gray-500 mb-2">({n}×{d}) × ({d}×{d})</div>
              <div className="flex items-center justify-center gap-2">
                <MatrixViz rows={n} cols={d} color={COLORS.valid} label={`输入 (${n}×${d})`} />
                <span className="text-gray-400">×</span>
                <MatrixViz rows={d} cols={d} activeCol={0} color={COLORS.highlight} label={`权重 (${d}×${d})`} />
              </div>
              <p className="text-xs text-gray-500 mt-2">权重的每列被 {n} 行复用 → 数据复用率高</p>
              <GPUGrid active={14} total={16} label="GPU 核心" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold mb-2" style={{ color: COLORS.red }}>Decode (GEMV)</div>
              <div className="text-xs text-gray-500 mb-2">(1×{d}) × ({d}×{d})</div>
              <div className="flex items-center justify-center gap-2">
                <MatrixViz rows={1} cols={d} color={COLORS.valid} label={`输入 (1×${d})`} />
                <span className="text-gray-400">×</span>
                <MatrixViz rows={d} cols={d} activeCol={0} color={COLORS.highlight} label={`权重 (${d}×${d})`} />
              </div>
              <p className="text-xs text-gray-500 mt-2">权重的每列只被 1 行用一次 → 加载即丢弃</p>
              <GPUGrid active={4} total={16} label="GPU 核心" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Add to prefill-vs-decode.mdx**

```mdx
import GEMMvsGEMV from '../../../components/interactive/GEMMvsGEMV.tsx';
// Place in the section comparing Prefill vs Decode computation characteristics
<GEMMvsGEMV client:visible />
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
git add src/components/interactive/GEMMvsGEMV.tsx src/content/articles/zh/prefill-vs-decode.mdx
git commit -m "feat: add GEMM vs GEMV comparison (diagram 7.2)"
```

---

### Task 24: PrefillDecodeOverview (Inline SVG → React conversion)

**Spec ref:** Section 6, Prefill vs Decode inline SVG → React component
**Files:**
- Create: `src/components/interactive/PrefillDecodeOverview.tsx`
- Modify: `src/content/articles/zh/prefill-vs-decode.mdx` (replace inline SVG at lines 170-284)

- [ ] **Step 1: Create the component**

Convert the existing inline SVG from prefill-vs-decode.mdx (lines 170-284) to a React component. Preserve the same two-phase comparison layout showing input tokens, GEMM/GEMV, KV Cache operations, and bound indicators.

The implementer should:
1. Read `src/content/articles/zh/prefill-vs-decode.mdx` lines 170-284
2. Create `src/components/interactive/PrefillDecodeOverview.tsx` using React SVG (same layout)
3. Import colors from `./shared/colors`
4. Replace the inline SVG in MDX with `<PrefillDecodeOverview client:visible />`

- [ ] **Step 2: Verify the converted component matches the original**

```bash
npm run dev
# Compare the visual output with the original inline SVG
```

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/PrefillDecodeOverview.tsx src/content/articles/zh/prefill-vs-decode.mdx
git commit -m "refactor: convert Prefill vs Decode inline SVG to React component"
```

---

## Phase 8: Flash Attention (Article 8) — Tasks 25-28

### Task 25: GPUMemoryHierarchy (Diagram 8.1)

**Spec ref:** Section 5.4, Diagram 8.1 — GPU 内存层次与数据搬运对比
**Files:**
- Create: `src/components/interactive/GPUMemoryHierarchy.tsx`
- Modify: `src/content/articles/zh/flash-attention.mdx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/interactive/GPUMemoryHierarchy.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

interface ArrowStep {
  label: string;
  from: 'hbm' | 'sram';
  to: 'hbm' | 'sram';
  data: string;
}

const standardSteps: ArrowStep[] = [
  { label: 'Step 1', from: 'hbm', to: 'sram', data: 'Read Q, K' },
  { label: 'Step 1', from: 'sram', to: 'hbm', data: 'Write S = QKᵀ' },
  { label: 'Step 2', from: 'hbm', to: 'sram', data: 'Read S' },
  { label: 'Step 2', from: 'sram', to: 'hbm', data: 'Write P = softmax(S)' },
  { label: 'Step 3', from: 'hbm', to: 'sram', data: 'Read P, V' },
  { label: 'Step 3', from: 'sram', to: 'hbm', data: 'Write O = PV' },
];

const flashSteps: ArrowStep[] = [
  { label: 'Load', from: 'hbm', to: 'sram', data: 'Read Q, K, V blocks' },
  { label: 'Compute', from: 'sram', to: 'sram', data: 'QKᵀ → scale → mask → softmax → ×V (all in SRAM)' },
  { label: 'Write', from: 'sram', to: 'hbm', data: 'Write final O only' },
];

function MemoryBlock({ label, size, bandwidth, y, color }: {
  label: string; size: string; bandwidth: string; y: number; color: string;
}) {
  const width = label === 'HBM' ? 200 : 100;
  const x = label === 'HBM' ? 50 : 100;
  return (
    <g>
      <rect x={x} y={y} width={width} height={50} rx={6}
        fill={color} stroke={COLORS.dark} strokeWidth={1.5} opacity={0.15} />
      <rect x={x} y={y} width={width} height={50} rx={6}
        fill="none" stroke={color} strokeWidth={2} />
      <text x={x + width / 2} y={y + 20} textAnchor="middle"
        fontSize={14} fontWeight={700} fill={COLORS.dark}>{label}</text>
      <text x={x + width / 2} y={y + 38} textAnchor="middle"
        fontSize={10} fill={COLORS.mid}>{size} · {bandwidth}</text>
    </g>
  );
}

function DataFlowPanel({ title, steps, color }: {
  title: string; steps: ArrowStep[]; color: string;
}) {
  const [activeStep, setActiveStep] = useState(-1);
  const ioCount = steps.filter(s => s.from !== s.to).length;

  return (
    <div className="flex-1 min-w-[260px]">
      <h4 className="text-sm font-semibold mb-2 text-center" style={{ color }}>
        {title}
        <span className="ml-2 text-xs font-normal" style={{ color: COLORS.mid }}>
          ({ioCount} HBM transfers)
        </span>
      </h4>
      <div className="space-y-1">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer"
            style={{
              backgroundColor: activeStep === i ? `${color}15` : 'transparent',
              borderLeft: `3px solid ${activeStep === i ? color : 'transparent'}`,
            }}
            onMouseEnter={() => setActiveStep(i)}
            onMouseLeave={() => setActiveStep(-1)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="font-mono text-[10px] w-12 shrink-0" style={{ color: COLORS.mid }}>
              {step.label}
            </span>
            <span className="shrink-0">
              {step.from === step.to ? (
                <span style={{ color: COLORS.green }}>⟳ SRAM</span>
              ) : step.from === 'hbm' ? (
                <span style={{ color: COLORS.primary }}>HBM → SRAM</span>
              ) : (
                <span style={{ color: COLORS.red }}>SRAM → HBM</span>
              )}
            </span>
            <span className="text-gray-600 truncate">{step.data}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function GPUMemoryHierarchy() {
  return (
    <div className="my-6 p-4 bg-white rounded-lg border" style={{ borderColor: COLORS.light }}>
      <h3 className="text-base font-bold mb-4" style={{ color: COLORS.dark }}>
        GPU 内存层次与数据搬运对比
      </h3>

      {/* Memory hierarchy diagram */}
      <svg viewBox="0 0 300 140" className="w-full max-w-[400px] mx-auto mb-4">
        <MemoryBlock label="SRAM" size="~20MB" bandwidth="19 TB/s" y={10} color={COLORS.green} />
        <MemoryBlock label="HBM" size="80GB" bandwidth="2 TB/s" y={80} color={COLORS.primary} />
        {/* Bandwidth pipe */}
        <line x1={150} y1={60} x2={150} y2={80} stroke={COLORS.mid} strokeWidth={8} opacity={0.3} />
        <text x={170} y={74} fontSize={9} fill={COLORS.mid}>bandwidth bottleneck</text>
      </svg>

      {/* Side-by-side comparison */}
      <div className="flex flex-col sm:flex-row gap-4">
        <DataFlowPanel
          title="Standard Attention"
          steps={standardSteps}
          color={COLORS.red}
        />
        <div className="hidden sm:block w-px bg-gray-200" />
        <DataFlowPanel
          title="Flash Attention"
          steps={flashSteps}
          color={COLORS.green}
        />
      </div>

      <p className="text-xs mt-3 text-center" style={{ color: COLORS.mid }}>
        标准 Attention 需要 6 次 HBM 传输（3 读 + 3 写），Flash Attention 只需 2 次（1 读 + 1 写）
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add to MDX**

In `src/content/articles/zh/flash-attention.mdx`, add import after existing import (line 18):

```mdx
import GPUMemoryHierarchy from '../../../components/interactive/GPUMemoryHierarchy.tsx';
```

Insert the component after the "两级存储" table (after line 48, before "### 标准 Attention 的内存访问模式"):

```mdx
<GPUMemoryHierarchy client:visible />
```

- [ ] **Step 3: Verify**

```bash
npm run dev
# Open flash-attention page, verify memory hierarchy diagram renders with side-by-side comparison
```

- [ ] **Step 4: Commit**

```bash
git add src/components/interactive/GPUMemoryHierarchy.tsx src/content/articles/zh/flash-attention.mdx
git commit -m "feat: add GPU memory hierarchy diagram (Flash Attention 8.1)"
```

### Task 26: OnlineSoftmaxDemo (Diagram 8.2)

**Spec ref:** Section 5.4, Diagram 8.2 — Online Softmax 递推更新逐步演示
**Files:**
- Create: `src/components/interactive/OnlineSoftmaxDemo.tsx`
- Modify: `src/content/articles/zh/flash-attention.mdx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/interactive/OnlineSoftmaxDemo.tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

// Small example: 3 blocks, 2 elements each
const SCORES = [
  [2.1, 3.2],   // Block 1
  [4.1, 1.5],   // Block 2
  [2.8, 3.0],   // Block 3
];

// V blocks (simplified 2x2)
const V_BLOCKS = [
  [[0.5, 0.3], [0.8, 0.1]],
  [[0.2, 0.9], [0.6, 0.4]],
  [[0.7, 0.2], [0.1, 0.8]],
];

function fmt(n: number, d = 4): string {
  return n.toFixed(d);
}

function HighlightVar({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
      <span className="font-semibold">{label}</span> = {value}
    </span>
  );
}

export default function OnlineSoftmaxDemo() {
  const computation = useMemo(() => {
    const steps: {
      title: string;
      block: number;
      m: number;
      l: number;
      O: number[];
      alpha?: number;
      detail: string;
    }[] = [];

    // Block 1: init
    const s1 = SCORES[0];
    const m1 = Math.max(...s1);
    const exp1 = s1.map(v => Math.exp(v - m1));
    const l1 = exp1.reduce((a, b) => a + b, 0);
    const softmax1 = exp1.map(e => e / l1);
    const O1 = V_BLOCKS[0][0].map((_, col) =>
      softmax1.reduce((sum, s, row) => sum + s * V_BLOCKS[0][row][col], 0)
    );

    steps.push({
      title: 'Block 1: 初始化',
      block: 0,
      m: m1,
      l: l1,
      O: O1,
      detail: `s₁ = [${s1.join(', ')}] → m₁ = max(${s1.join(', ')}) = ${fmt(m1, 1)} → exp(s₁ - m₁) = [${exp1.map(e => fmt(e)).join(', ')}] → l₁ = ${fmt(l1)}`,
    });

    // Block 2: update
    const s2 = SCORES[1];
    const m2_local = Math.max(...s2);
    const m2_new = Math.max(m1, m2_local);
    const alpha2 = Math.exp(m1 - m2_new);
    const exp2 = s2.map(v => Math.exp(v - m2_new));
    const l2 = alpha2 * l1 + exp2.reduce((a, b) => a + b, 0);
    const softmax2_contrib = exp2.map(e => e / l2);
    const O2 = O1.map((o, col) => {
      const old_part = alpha2 * l1 / l2 * o;
      const new_part = softmax2_contrib.reduce((sum, s, row) => sum + s * V_BLOCKS[1][row][col], 0);
      return old_part + new_part;
    });

    steps.push({
      title: 'Block 2: 递推更新',
      block: 1,
      m: m2_new,
      l: l2,
      O: O2,
      alpha: alpha2,
      detail: `s₂ = [${s2.join(', ')}] → m₂_new = max(${fmt(m1, 1)}, ${fmt(m2_local, 1)}) = ${fmt(m2_new, 1)} → α = e^(${fmt(m1, 1)}-${fmt(m2_new, 1)}) = ${fmt(alpha2)}`,
    });

    // Block 3: update
    const s3 = SCORES[2];
    const m3_local = Math.max(...s3);
    const m3_new = Math.max(m2_new, m3_local);
    const alpha3 = Math.exp(m2_new - m3_new);
    const exp3 = s3.map(v => Math.exp(v - m3_new));
    const l3 = alpha3 * l2 + exp3.reduce((a, b) => a + b, 0);
    const softmax3_contrib = exp3.map(e => e / l3);
    const O3 = O2.map((o, col) => {
      const old_part = alpha3 * l2 / l3 * o;
      const new_part = softmax3_contrib.reduce((sum, s, row) => sum + s * V_BLOCKS[2][row][col], 0);
      return old_part + new_part;
    });

    steps.push({
      title: 'Block 3: 继续更新',
      block: 2,
      m: m3_new,
      l: l3,
      O: O3,
      alpha: alpha3,
      detail: `s₃ = [${s3.join(', ')}] → m₃_new = max(${fmt(m2_new, 1)}, ${fmt(m3_local, 1)}) = ${fmt(m3_new, 1)} → α = e^(${fmt(m2_new, 1)}-${fmt(m3_new, 1)}) = ${fmt(alpha3)}`,
    });

    return steps;
  }, []);

  const steps = computation.map((comp, i) => ({
    title: comp.title,
    content: (
      <div className="space-y-3">
        {/* Score blocks visualization */}
        <div className="flex gap-2 items-center flex-wrap">
          {SCORES.map((block, bi) => (
            <div key={bi} className="flex gap-1 px-2 py-1 rounded text-xs font-mono border"
              style={{
                backgroundColor: bi === comp.block ? `${COLORS.highlight}` : bi < comp.block ? `${COLORS.valid}` : COLORS.bg,
                borderColor: bi === comp.block ? COLORS.orange : bi < comp.block ? COLORS.green : COLORS.light,
              }}>
              <span className="text-[10px] mr-1" style={{ color: COLORS.mid }}>B{bi + 1}:</span>
              [{block.join(', ')}]
            </div>
          ))}
        </div>

        {/* Computation detail */}
        <p className="text-xs font-mono leading-relaxed" style={{ color: COLORS.dark }}>
          {comp.detail}
        </p>

        {/* Running state */}
        <div className="flex flex-wrap gap-2">
          <HighlightVar label="m" value={fmt(comp.m, 1)} color={COLORS.primary} />
          <HighlightVar label="l" value={fmt(comp.l)} color={COLORS.primary} />
          {comp.alpha !== undefined && (
            <HighlightVar label="α (correction)" value={fmt(comp.alpha)} color={COLORS.orange} />
          )}
          <HighlightVar label="O" value={`[${comp.O.map(v => fmt(v)).join(', ')}]`} color={COLORS.green} />
        </div>

        {comp.alpha !== undefined && (
          <p className="text-[11px] mt-1" style={{ color: COLORS.orange }}>
            ⚠ 修正因子 α 将之前所有累积量调整到新的全局 max
          </p>
        )}
      </div>
    ),
  }));

  return (
    <div className="my-6">
      <StepNavigator steps={steps} />
      <p className="text-xs mt-2 text-center" style={{ color: COLORS.mid }}>
        无需存储完整的 N×N 矩阵，只需维护 m, l, O 三个累积量
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add to MDX**

In `src/content/articles/zh/flash-attention.mdx`, add import:

```mdx
import OnlineSoftmaxDemo from '../../../components/interactive/OnlineSoftmaxDemo.tsx';
```

Insert after the recursive algorithm derivation (after "为什么是精确的？" section end at line 183, before "## 交互演示"):

```mdx

<OnlineSoftmaxDemo client:visible />

```

- [ ] **Step 3: Verify**

```bash
npm run dev
# Open flash-attention page, step through 3 blocks, verify correction factors shown in orange
```

- [ ] **Step 4: Commit**

```bash
git add src/components/interactive/OnlineSoftmaxDemo.tsx src/content/articles/zh/flash-attention.mdx
git commit -m "feat: add Online Softmax step-by-step demo (Flash Attention 8.2)"
```

### Task 27: IOComplexityChart (Diagram 8.3)

**Spec ref:** Section 5.4, Diagram 8.3 — 标准 vs Flash v1 vs v2 的 IO 复杂度对比
**Files:**
- Create: `src/components/interactive/IOComplexityChart.tsx`
- Modify: `src/content/articles/zh/flash-attention.mdx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/interactive/IOComplexityChart.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';

const N_VALUES = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];

function computeIO(N: number, d: number, M: number) {
  // Standard: Θ(Nd + N²)
  const standard = N * d + N * N;
  // Flash v1: Θ(N²d²M⁻¹)
  const flashV1 = (N * N * d * d) / M;
  // Flash v2: Θ(N²dM⁻¹)
  const flashV2 = (N * N * d) / M;
  return { standard, flashV1, flashV2 };
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)}T`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)}G`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)}M`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)}K`;
  return `${bytes}`;
}

export default function IOComplexityChart() {
  const [d, setD] = useState(128);
  const [M, setM] = useState(100 * 1024); // 100KB in bytes

  const data = useMemo(() =>
    N_VALUES.map(N => ({
      N,
      ...computeIO(N, d, M),
    })),
    [d, M]
  );

  // SVG chart dimensions
  const W = 600, H = 320, pad = { top: 20, right: 20, bottom: 50, left: 70 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...data.map(d => d.standard));
  const logMax = Math.log10(maxVal);
  const logMin = Math.log10(Math.min(...data.map(d => Math.min(d.flashV2, 1))));

  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * plotW;
  const yScale = (val: number) => {
    if (val <= 0) return pad.top + plotH;
    const logVal = Math.log10(val);
    const ratio = (logVal - logMin) / (logMax - logMin);
    return pad.top + plotH * (1 - ratio);
  };

  const lines = [
    { key: 'standard', color: COLORS.red, label: 'Standard Θ(Nd+N²)' },
    { key: 'flashV1', color: COLORS.orange, label: 'Flash v1 Θ(N²d²/M)' },
    { key: 'flashV2', color: COLORS.green, label: 'Flash v2 Θ(N²d/M)' },
  ] as const;

  return (
    <div className="my-6 p-4 bg-white rounded-lg border" style={{ borderColor: COLORS.light }}>
      <h3 className="text-base font-bold mb-3" style={{ color: COLORS.dark }}>
        IO 复杂度对比：Standard vs Flash v1 vs v2
      </h3>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-3">
        <label className="flex items-center gap-2 text-xs">
          <span style={{ color: COLORS.mid }}>head dim d:</span>
          <select value={d} onChange={e => setD(Number(e.target.value))}
            className="px-2 py-0.5 border rounded text-xs" style={{ borderColor: COLORS.light }}>
            <option value={64}>64</option>
            <option value={128}>128</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <span style={{ color: COLORS.mid }}>SRAM M:</span>
          <select value={M} onChange={e => setM(Number(e.target.value))}
            className="px-2 py-0.5 border rounded text-xs" style={{ borderColor: COLORS.light }}>
            <option value={50 * 1024}>50 KB</option>
            <option value={100 * 1024}>100 KB</option>
            <option value={192 * 1024}>192 KB</option>
          </select>
        </label>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
        {/* Grid lines */}
        {Array.from({ length: 5 }, (_, i) => {
          const y = pad.top + (plotH / 4) * i;
          return <line key={i} x1={pad.left} y1={y} x2={W - pad.right} y2={y}
            stroke={COLORS.light} strokeWidth={0.5} />;
        })}

        {/* Lines */}
        {lines.map(({ key, color }) => (
          <polyline key={key}
            points={data.map((pt, i) => `${xScale(i)},${yScale(pt[key])}`).join(' ')}
            fill="none" stroke={color} strokeWidth={2}
          />
        ))}

        {/* Dots */}
        {lines.map(({ key, color }) =>
          data.map((pt, i) => (
            <circle key={`${key}-${i}`} cx={xScale(i)} cy={yScale(pt[key])}
              r={3} fill={color} />
          ))
        )}

        {/* X axis labels */}
        {data.map((pt, i) => (
          <text key={i} x={xScale(i)} y={H - 10} textAnchor="middle"
            fontSize={9} fill={COLORS.mid} transform={`rotate(-30, ${xScale(i)}, ${H - 10})`}>
            {pt.N >= 1024 ? `${pt.N / 1024}K` : pt.N}
          </text>
        ))}
        <text x={pad.left + plotW / 2} y={H - 2} textAnchor="middle"
          fontSize={10} fill={COLORS.mid}>序列长度 N</text>

        {/* Y axis label */}
        <text x={12} y={pad.top + plotH / 2} textAnchor="middle"
          fontSize={10} fill={COLORS.mid} transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>
          HBM 访问量 (log scale)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 justify-center">
        {lines.map(({ key, color, label }) => (
          <div key={key} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
            <span style={{ color }}>{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs mt-2 text-center" style={{ color: COLORS.mid }}>
        长序列下标准方案 IO 爆炸 vs Flash Attention 的亚二次增长
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add to MDX**

In `src/content/articles/zh/flash-attention.mdx`, add import:

```mdx
import IOComplexityChart from '../../../components/interactive/IOComplexityChart.tsx';
```

Insert after Flash Attention IO complexity analysis (after line 234 "实验中 Flash Attention 比标准实现快 **2-4 倍**。", before "### 下界"):

```mdx

<IOComplexityChart client:visible />

```

- [ ] **Step 3: Verify**

```bash
npm run dev
# Open flash-attention page, verify 3 curves, adjust d and M, check responsive behavior
```

- [ ] **Step 4: Commit**

```bash
git add src/components/interactive/IOComplexityChart.tsx src/content/articles/zh/flash-attention.mdx
git commit -m "feat: add IO complexity comparison chart (Flash Attention 8.3)"
```

### Task 28: BlockSizeCalculator (Diagram 8.4)

**Spec ref:** Section 5.4, Diagram 8.4 — 分块大小与 SRAM 容量的关系
**Files:**
- Create: `src/components/interactive/BlockSizeCalculator.tsx`
- Modify: `src/content/articles/zh/flash-attention.mdx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/interactive/BlockSizeCalculator.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS } from './shared/colors';

export default function BlockSizeCalculator() {
  const [sramKB, setSramKB] = useState(100);
  const [d, setD] = useState(64);
  const [N, setN] = useState(512);

  const calc = useMemo(() => {
    const M = sramKB * 1024; // bytes
    const Bc = Math.ceil(M / (4 * d));
    const Br = Math.min(Bc, d);
    const Tc = Math.ceil(N / Bc);
    const Tr = Math.ceil(N / Br);
    const totalBlocks = Tc * Tr;
    return { Bc, Br, Tc, Tr, totalBlocks, M };
  }, [sramKB, d, N]);

  // Visualization: show Q blocks (left) and K/V blocks (right)
  const maxBlocksToShow = 12;
  const qBlocks = Math.min(calc.Tr, maxBlocksToShow);
  const kvBlocks = Math.min(calc.Tc, maxBlocksToShow);

  return (
    <div className="my-6 p-4 bg-white rounded-lg border" style={{ borderColor: COLORS.light }}>
      <h3 className="text-base font-bold mb-3" style={{ color: COLORS.dark }}>
        分块大小计算器
      </h3>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <label className="text-xs">
          <div className="flex justify-between mb-1">
            <span style={{ color: COLORS.mid }}>SRAM (M)</span>
            <span className="font-mono font-semibold" style={{ color: COLORS.primary }}>{sramKB} KB</span>
          </div>
          <input type="range" min={10} max={200} step={10} value={sramKB}
            onChange={e => setSramKB(Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: COLORS.primary }} />
        </label>
        <label className="text-xs">
          <div className="flex justify-between mb-1">
            <span style={{ color: COLORS.mid }}>head dim (d)</span>
            <span className="font-mono font-semibold" style={{ color: COLORS.primary }}>{d}</span>
          </div>
          <input type="range" min={32} max={128} step={32} value={d}
            onChange={e => setD(Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: COLORS.primary }} />
        </label>
        <label className="text-xs">
          <div className="flex justify-between mb-1">
            <span style={{ color: COLORS.mid }}>序列长度 (N)</span>
            <span className="font-mono font-semibold" style={{ color: COLORS.primary }}>{N}</span>
          </div>
          <input type="range" min={128} max={4096} step={128} value={N}
            onChange={e => setN(Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: COLORS.primary }} />
        </label>
      </div>

      {/* Formulas + results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center">
        {[
          { label: 'Bc = ⌈M/(4d)⌉', value: calc.Bc, color: COLORS.primary },
          { label: 'Br = min(Bc, d)', value: calc.Br, color: COLORS.green },
          { label: 'Q blocks (Tr)', value: calc.Tr, color: COLORS.green },
          { label: 'K/V blocks (Tc)', value: calc.Tc, color: COLORS.primary },
        ].map(({ label, value, color }) => (
          <motion.div key={label}
            className="p-2 rounded border text-xs"
            style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
            layout
          >
            <div className="text-[10px]" style={{ color: COLORS.mid }}>{label}</div>
            <div className="text-lg font-bold font-mono" style={{ color }}>{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Block visualization */}
      <div className="flex justify-center gap-8 mb-3">
        {/* Q blocks */}
        <div className="text-center">
          <div className="text-xs mb-1" style={{ color: COLORS.mid }}>
            Q 矩阵 ({N}×{d})
          </div>
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: qBlocks }, (_, i) => (
              <motion.div key={i}
                className="rounded text-[9px] font-mono flex items-center justify-center"
                style={{
                  width: 60,
                  height: Math.max(12, 80 / qBlocks),
                  backgroundColor: `${COLORS.green}20`,
                  border: `1px solid ${COLORS.green}60`,
                  color: COLORS.green,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                {calc.Br}×{d}
              </motion.div>
            ))}
            {calc.Tr > maxBlocksToShow && (
              <div className="text-[9px]" style={{ color: COLORS.mid }}>
                ...({calc.Tr - maxBlocksToShow} more)
              </div>
            )}
          </div>
        </div>

        {/* K/V blocks */}
        <div className="text-center">
          <div className="text-xs mb-1" style={{ color: COLORS.mid }}>
            K, V 矩阵 ({N}×{d})
          </div>
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: kvBlocks }, (_, i) => (
              <motion.div key={i}
                className="rounded text-[9px] font-mono flex items-center justify-center"
                style={{
                  width: 60,
                  height: Math.max(12, 80 / kvBlocks),
                  backgroundColor: `${COLORS.primary}20`,
                  border: `1px solid ${COLORS.primary}60`,
                  color: COLORS.primary,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                {calc.Bc}×{d}
              </motion.div>
            ))}
            {calc.Tc > maxBlocksToShow && (
              <div className="text-[9px]" style={{ color: COLORS.mid }}>
                ...({calc.Tc - maxBlocksToShow} more)
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: COLORS.orange }}>
        SRAM 越大 → 块越大 → 外循环次数越少 → HBM 访问越少（当前共 {calc.totalBlocks} 次块计算）
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add to MDX**

In `src/content/articles/zh/flash-attention.mdx`, add import:

```mdx
import BlockSizeCalculator from '../../../components/interactive/BlockSizeCalculator.tsx';
```

Insert after the block size formulas (after line 77 "都能放进 SRAM。", before "### 双层循环结构"):

```mdx

<BlockSizeCalculator client:visible />

```

- [ ] **Step 3: Verify**

```bash
npm run dev
# Open flash-attention page, adjust SRAM, d, N sliders, verify block counts update
```

- [ ] **Step 4: Commit**

```bash
git add src/components/interactive/BlockSizeCalculator.tsx src/content/articles/zh/flash-attention.mdx
git commit -m "feat: add block size calculator (Flash Attention 8.4)"
```

---

## Phase 9: Cleanup & Validation — Tasks 29-30

### Task 29: Remove CSS SVG Attribute Hacks

**Context:** After all 3 inline SVGs (MHA, GQA, Prefill vs Decode) are converted to React components, the CSS hacks in `src/styles/global.css` for Astro's SVG attribute lowercasing are no longer needed for those elements. However, verify no other inline SVGs remain before removing.

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Search for remaining inline SVGs in MDX files**

```bash
grep -r "<svg" src/content/articles/zh/*.mdx
```

If any inline SVGs still exist, keep the CSS hacks. If none remain, proceed to Step 2.

- [ ] **Step 2: Remove SVG attribute CSS hacks**

In `src/styles/global.css`, remove lines 15-29 (the SVG attribute fix block):

```css
/* REMOVE THIS ENTIRE BLOCK: */
/* Fix: Astro MDX lowercases JSX camelCase SVG attrs (textAnchor → textanchor instead of text-anchor) */
svg [textanchor="middle"] { text-anchor: middle; }
svg [textanchor="end"] { text-anchor: end; }
svg [fontweight="bold"] { font-weight: bold; }
svg [fontstyle="italic"] { font-style: italic; }
svg [fontsize="9"] { font-size: 9px; }
svg [fontsize="10"] { font-size: 10px; }
svg [fontsize="11"] { font-size: 11px; }
svg [fontsize="12"] { font-size: 12px; }
svg [fontsize="13"] { font-size: 13px; }
svg [fontsize="15"] { font-size: 15px; }
svg [fontsize="16"] { font-size: 16px; }
svg [fontsize="17"] { font-size: 17px; }
svg [fontsize="18"] { font-size: 18px; }
svg [fontsize="20"] { font-size: 20px; }
```

- [ ] **Step 3: Verify no visual regressions**

```bash
npm run dev
# Check all 8 articles — no SVG text alignment or sizing issues
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "chore: remove SVG attribute CSS hacks (all inline SVGs converted to React)"
```

### Task 30: Final Validation

**Files:** None modified — validation only

- [ ] **Step 1: Run content validation**

```bash
npm run validate
```

Expected: All articles pass validation (no broken references, missing fields, etc.)

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors. Note any warnings about unused imports or missing types.

- [ ] **Step 3: Spot-check all 8 articles in dev server**

```bash
npm run dev
```

Walk through each article and verify:
1. All new components render without errors
2. Interactive components respond to user input (sliders, hover, step navigation)
3. Inline SVG replacements match the original content
4. No console errors in browser DevTools
5. Components are responsive on mobile viewport

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address final validation issues"
```
