# Next Articles Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 articles (Positional Encoding, Sampling & Decoding, Speculative Decoding) with 14 interactive components to the LLM Learning site.

**Architecture:** Each article is an MDX file with imported React components rendered via Astro Islands (`client:visible`). Components use shared infrastructure (`src/components/interactive/shared/`) for colors, types, and hooks. StepNavigator primitive handles step-through animations.

**Tech Stack:** Astro 5, MDX, React, TypeScript, Motion (`motion/react`), Tailwind CSS, SVG, KaTeX

**Spec:** `docs/superpowers/specs/2026-04-02-next-articles-design.md`

---

## File Structure

### New Files (17)

**Article 1 — Positional Encoding:**
- `src/content/articles/zh/positional-encoding.mdx` — Article MDX
- `src/components/interactive/PermutationInvariance.tsx` — StepNavigator: attention permutation invariance demo
- `src/components/interactive/SinusoidalHeatmap.tsx` — Interactive heatmap of sinusoidal PE values
- `src/components/interactive/RoPERotationAnimation.tsx` — StepNavigator: RoPE rotation vector animation
- `src/components/interactive/EncodingComparison.tsx` — Interactive comparison table of 5 PE methods

**Article 2 — Sampling & Decoding:**
- `src/content/articles/zh/sampling-and-decoding.mdx` — Article MDX
- `src/components/interactive/PerplexityIntuition.tsx` — PPL intuition with good/bad model toggle
- `src/components/interactive/TemperatureDistribution.tsx` — Temperature slider + softmax bar chart
- `src/components/interactive/SamplingStrategyComparison.tsx` — 3-column Greedy/Top-k/Top-p comparison
- `src/components/interactive/BeamSearchTree.tsx` — StepNavigator: beam search tree expansion

**Article 3 — Speculative Decoding:**
- `src/content/articles/zh/speculative-decoding.mdx` — Article MDX
- `src/components/interactive/DraftVerifyAnimation.tsx` — StepNavigator: draft-then-verify flow
- `src/components/interactive/AcceptanceRateCalculator.tsx` — α/K sliders + expected tokens chart
- `src/components/interactive/MedusaTreeViz.tsx` — Tree attention visualization with verify animation
- `src/components/interactive/MTPTrainInferBridge.tsx` — Train vs inference architecture diagram
- `src/components/interactive/EagleArchitecture.tsx` — Eagle vs traditional draft architecture
- `src/components/interactive/SpecMethodComparison.tsx` — Interactive comparison table of 5 methods

### Modified Files (2)
- `src/content/paths/transformer-core.yaml` — Add `positional-encoding` as #6
- `src/content/paths/inference-engineering.yaml` — Add `sampling-and-decoding` (#4) and `speculative-decoding` (#5)

---

## Task Execution Order

Tasks are grouped by article. Within each article: components first, then MDX, then path update. Articles 1 and 2 are independent; Article 3 depends on Article 2 (for prerequisite slug).

---

## Article 1: Positional Encoding (Tasks 1–6)

### Task 1: PermutationInvariance Component

**Files:**
- Create: `src/components/interactive/PermutationInvariance.tsx`

**Context:** This component demonstrates that self-attention is permutation-invariant — shuffling token order doesn't change attention scores. It uses the StepNavigator primitive for 3-step walkthrough.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/PermutationInvariance.tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const TOKENS_ORIGINAL = ['The', 'cat', 'sat', 'here'];
const TOKENS_SHUFFLED = ['sat', 'here', 'The', 'cat'];
const SHUFFLE_MAP = [2, 3, 0, 1]; // original[i] -> shuffled position

// Simplified attention scores (no positional encoding)
// These are symmetric-ish values that demonstrate the concept
const ATTN_SCORES = [
  [0.25, 0.35, 0.20, 0.20],
  [0.30, 0.25, 0.25, 0.20],
  [0.20, 0.30, 0.30, 0.20],
  [0.15, 0.25, 0.25, 0.35],
];

// After adding positional encoding — scores change
const ATTN_WITH_PE = [
  [0.40, 0.30, 0.18, 0.12],
  [0.28, 0.35, 0.25, 0.12],
  [0.15, 0.28, 0.37, 0.20],
  [0.10, 0.15, 0.25, 0.50],
];

function AttnMatrix({ tokens, scores, highlight }: {
  tokens: string[];
  scores: number[][];
  highlight?: number[][];
}) {
  const cellSize = 48;
  const labelW = 48;
  const w = labelW + tokens.length * cellSize;
  const h = labelW + tokens.length * cellSize;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xs mx-auto">
      {/* Column headers */}
      {tokens.map((t, i) => (
        <text key={`ch-${i}`} x={labelW + i * cellSize + cellSize / 2} y={labelW - 8}
          textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark}
          fontFamily="system-ui">{t}</text>
      ))}
      {/* Row headers */}
      {tokens.map((t, i) => (
        <text key={`rh-${i}`} x={labelW - 8} y={labelW + i * cellSize + cellSize / 2 + 4}
          textAnchor="end" fontSize="11" fontWeight="600" fill={COLORS.dark}
          fontFamily="system-ui">{t}</text>
      ))}
      {/* Cells */}
      {scores.map((row, r) =>
        row.map((val, c) => {
          const isHighlighted = highlight?.some(([hr, hc]) => hr === r && hc === c);
          const bg = isHighlighted
            ? COLORS.highlight
            : `rgba(21, 101, 192, ${val})`;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={labelW + c * cellSize + 1}
                y={labelW + r * cellSize + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                rx={4}
                fill={bg}
                stroke={isHighlighted ? COLORS.orange : '#e5e7eb'}
                strokeWidth={isHighlighted ? 2 : 1}
              />
              <text
                x={labelW + c * cellSize + cellSize / 2}
                y={labelW + r * cellSize + cellSize / 2 + 4}
                textAnchor="middle" fontSize="10" fill={COLORS.dark}
                fontFamily="monospace">{val.toFixed(2)}</text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// Reorder attention matrix according to shuffle map
function reorderMatrix(scores: number[][], map: number[]): number[][] {
  const n = scores.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[map[i]][map[j]] = scores[i][j];
    }
  }
  return result;
}

export default function PermutationInvariance() {
  const reorderedScores = reorderMatrix(ATTN_SCORES, SHUFFLE_MAP);

  // Find cells that changed between no-PE and with-PE
  const changedCells: number[][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (Math.abs(ATTN_SCORES[i][j] - ATTN_WITH_PE[i][j]) > 0.03) {
        changedCells.push([i, j]);
      }
    }
  }

  const steps = [
    {
      title: '原始序列的 Attention',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            {TOKENS_ORIGINAL.map((t, i) => (
              <span key={i} className="px-2 py-1 rounded text-sm font-mono"
                style={{ backgroundColor: COLORS.valid, color: COLORS.primary }}>
                {t}
              </span>
            ))}
          </div>
          <AttnMatrix tokens={TOKENS_ORIGINAL} scores={ATTN_SCORES} />
          <p className="text-sm text-gray-600 text-center">
            无位置编码时，Attention 分数只取决于 token 内容
          </p>
        </div>
      ),
    },
    {
      title: '打乱顺序 → 分数不变',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            {TOKENS_SHUFFLED.map((t, i) => (
              <span key={i} className="px-2 py-1 rounded text-sm font-mono"
                style={{ backgroundColor: COLORS.waste, color: COLORS.red }}>
                {t}
              </span>
            ))}
          </div>
          <AttnMatrix tokens={TOKENS_SHUFFLED} scores={reorderedScores} />
          <p className="text-sm text-gray-600 text-center">
            行列随 token 重排，但每对 token 之间的分数<strong>完全一致</strong>
            <br />
            <span className="text-xs">例：(The, cat) 仍是 0.35，无论它们在什么位置</span>
          </p>
        </div>
      ),
    },
    {
      title: '加入位置编码 → 分数改变',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            {TOKENS_ORIGINAL.map((t, i) => (
              <span key={i} className="px-2 py-1 rounded text-sm font-mono"
                style={{ backgroundColor: COLORS.highlight, color: COLORS.dark }}>
                {t}<sub className="text-[9px] ml-0.5">+PE({i})</sub>
              </span>
            ))}
          </div>
          <AttnMatrix tokens={TOKENS_ORIGINAL} scores={ATTN_WITH_PE} highlight={changedCells} />
          <p className="text-sm text-gray-600 text-center">
            位置编码让模型能区分 <strong>"狗咬人"</strong> 和 <strong>"人咬狗"</strong>
            <br />
            <span className="text-xs">黄色高亮 = 与无 PE 时有显著差异的分数</span>
          </p>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds (component not yet imported in any MDX)

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/PermutationInvariance.tsx
git commit -m "feat: add PermutationInvariance component (positional-encoding 1/4)"
```

---

### Task 2: SinusoidalHeatmap Component

**Files:**
- Create: `src/components/interactive/SinusoidalHeatmap.tsx`

**Context:** Interactive heatmap showing sinusoidal positional encoding values. Position (y, 0–63) × dimension (x, 0–63). Supports sin/cos toggle and row highlight on hover. Color maps [-1, 1] → blue-white-red.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/SinusoidalHeatmap.tsx
import { useState, useMemo, useCallback } from 'react';
import { COLORS } from './shared/colors';

const NUM_POS = 64;
const NUM_DIM = 64;

function computeSinusoidalPE(numPos: number, numDim: number): { sin: number[][]; cos: number[][] } {
  const sinVals: number[][] = [];
  const cosVals: number[][] = [];
  for (let pos = 0; pos < numPos; pos++) {
    const sinRow: number[] = [];
    const cosRow: number[] = [];
    for (let i = 0; i < numDim / 2; i++) {
      const angle = pos / Math.pow(10000, (2 * i) / numDim);
      sinRow.push(Math.sin(angle));
      cosRow.push(Math.cos(angle));
    }
    sinVals.push(sinRow);
    cosVals.push(cosRow);
  }
  return { sin: sinVals, cos: cosVals };
}

function valueToColor(v: number): string {
  // -1 → blue (#1565c0), 0 → white, +1 → red (#c62828)
  if (v >= 0) {
    const r = 255;
    const g = Math.round(255 - v * (255 - 40));
    const b = Math.round(255 - v * (255 - 40));
    return `rgb(${r},${g},${b})`;
  } else {
    const a = -v;
    const r = Math.round(255 - a * (255 - 21));
    const g = Math.round(255 - a * (255 - 101));
    const b = Math.round(255 - a * (255 - 192));
    return `rgb(${r},${g},${b})`;
  }
}

export default function SinusoidalHeatmap() {
  const [channel, setChannel] = useState<'sin' | 'cos'>('sin');
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const [hoverDim, setHoverDim] = useState<number | null>(null);

  const pe = useMemo(() => computeSinusoidalPE(NUM_POS, NUM_DIM), []);
  const data = channel === 'sin' ? pe.sin : pe.cos;

  const cellSize = 6;
  const labelPad = 36;
  const svgW = labelPad + (NUM_DIM / 2) * cellSize;
  const svgH = labelPad + NUM_POS * cellSize;

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = svgW / rect.width;
    const scaleY = svgH / rect.height;
    const x = (e.clientX - rect.left) * scaleX - labelPad;
    const y = (e.clientY - rect.top) * scaleY - labelPad;
    const dim = Math.floor(x / cellSize);
    const pos = Math.floor(y / cellSize);
    if (dim >= 0 && dim < NUM_DIM / 2 && pos >= 0 && pos < NUM_POS) {
      setHoverPos(pos);
      setHoverDim(dim);
    } else {
      setHoverPos(null);
      setHoverDim(null);
    }
  }, [svgW, svgH]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setChannel('sin')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              channel === 'sin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            sin 通道
          </button>
          <button
            onClick={() => setChannel('cos')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              channel === 'cos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            cos 通道
          </button>
        </div>
        {hoverPos !== null && hoverDim !== null && (
          <div className="text-xs font-mono text-gray-600">
            pos={hoverPos}, dim={hoverDim * 2 + (channel === 'cos' ? 1 : 0)},
            val={data[hoverPos][hoverDim].toFixed(4)}
          </div>
        )}
      </div>

      {/* Heatmap */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoverPos(null); setHoverDim(null); }}
        >
          {/* Y-axis label */}
          <text x={2} y={svgH / 2} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily="system-ui"
            transform={`rotate(-90, 8, ${svgH / 2})`}>
            Position
          </text>
          {/* X-axis label */}
          <text x={labelPad + (NUM_DIM / 2) * cellSize / 2} y={labelPad - 6}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            Dimension (i)
          </text>
          {/* Y tick marks */}
          {[0, 15, 31, 47, 63].map(p => (
            <text key={p} x={labelPad - 3} y={labelPad + p * cellSize + cellSize / 2 + 2}
              textAnchor="end" fontSize="6" fill={COLORS.mid} fontFamily="monospace">{p}</text>
          ))}
          {/* X tick marks */}
          {[0, 7, 15, 23, 31].map(d => (
            <text key={d} x={labelPad + d * cellSize + cellSize / 2} y={labelPad - 10}
              textAnchor="middle" fontSize="6" fill={COLORS.mid} fontFamily="monospace">{d * 2}</text>
          ))}
          {/* Heatmap cells */}
          {data.map((row, pos) =>
            row.map((val, dim) => (
              <rect
                key={`${pos}-${dim}`}
                x={labelPad + dim * cellSize}
                y={labelPad + pos * cellSize}
                width={cellSize}
                height={cellSize}
                fill={valueToColor(val)}
                stroke={pos === hoverPos ? COLORS.orange : 'none'}
                strokeWidth={pos === hoverPos ? 0.5 : 0}
              />
            ))
          )}
          {/* Hover crosshair */}
          {hoverPos !== null && hoverDim !== null && (
            <>
              <rect x={labelPad + hoverDim * cellSize} y={labelPad + hoverPos * cellSize}
                width={cellSize} height={cellSize}
                fill="none" stroke={COLORS.dark} strokeWidth={1.5} />
            </>
          )}
        </svg>
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span style={{ color: '#1565c0' }}>■ −1</span>
        <div className="w-24 h-3 rounded" style={{
          background: 'linear-gradient(to right, #1565c0, #ffffff, #c62828)'
        }} />
        <span style={{ color: '#c62828' }}>+1 ■</span>
      </div>

      <p className="text-xs text-gray-500 text-center">
        低维度（左侧）变化频率高，高维度（右侧）变化频率低 — 每个位置有唯一的"频率指纹"
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SinusoidalHeatmap.tsx
git commit -m "feat: add SinusoidalHeatmap component (positional-encoding 2/4)"
```

---

### Task 3: RoPERotationAnimation Component

**Files:**
- Create: `src/components/interactive/RoPERotationAnimation.tsx`

**Context:** Core animation showing RoPE's rotary mechanism. Uses StepNavigator with 4 steps: (1) Q vector at position 0, (2) Q and K both rotate by θ at position 1, (3) positions 3 vs 5 showing inner product depends on difference 2θ, (4) multiple dimension pairs with different frequencies. SVG polar coordinates with motion animations.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/RoPERotationAnimation.tsx
import { useMemo } from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, HEAD_COLORS } from './shared/colors';

const SVG_SIZE = 280;
const CENTER = SVG_SIZE / 2;
const RADIUS = 100;
const THETA = 30; // degrees per position for visualization

function polarToXY(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER - r * Math.sin(rad) };
}

function Arrow({ fromAngle, toAngle, r, color, label, showArc }: {
  fromAngle: number; toAngle: number; r: number; color: string; label: string; showArc?: boolean;
}) {
  const from = polarToXY(fromAngle, 0);
  const to = polarToXY(toAngle, r);
  const labelPos = polarToXY(toAngle, r + 18);

  // Arc for angle indicator
  const arcR = 30;
  const arcStart = polarToXY(fromAngle || 0, arcR);
  const arcEnd = polarToXY(toAngle, arcR);
  const sweep = toAngle > fromAngle ? 0 : 1;

  return (
    <g>
      <motion.line
        x1={CENTER} y1={CENTER}
        x2={to.x} y2={to.y}
        stroke={color} strokeWidth={2.5}
        markerEnd={`url(#arrow-${color.replace('#', '')})`}
        initial={{ x2: CENTER, y2: CENTER }}
        animate={{ x2: to.x, y2: to.y }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.text
        x={labelPos.x} y={labelPos.y}
        textAnchor="middle" fontSize="11" fontWeight="600" fill={color}
        fontFamily="system-ui"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.text>
      {showArc && Math.abs(toAngle) > 1 && (
        <motion.path
          d={`M ${polarToXY(0, arcR).x} ${polarToXY(0, arcR).y} A ${arcR} ${arcR} 0 0 ${sweep} ${arcEnd.x} ${arcEnd.y}`}
          fill="none" stroke={color} strokeWidth={1} strokeDasharray="3,2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4 }}
        />
      )}
    </g>
  );
}

function PolarGrid() {
  return (
    <g opacity={0.3}>
      {/* Concentric circles */}
      {[40, 70, 100].map(r => (
        <circle key={r} cx={CENTER} cy={CENTER} r={r}
          fill="none" stroke="#e5e7eb" strokeWidth={0.5} />
      ))}
      {/* Axis lines */}
      <line x1={CENTER - RADIUS - 20} y1={CENTER} x2={CENTER + RADIUS + 20} y2={CENTER}
        stroke="#d1d5db" strokeWidth={0.5} />
      <line x1={CENTER} y1={CENTER - RADIUS - 20} x2={CENTER} y2={CENTER + RADIUS + 20}
        stroke="#d1d5db" strokeWidth={0.5} />
    </g>
  );
}

export default function RoPERotationAnimation() {
  const steps = useMemo(() => [
    {
      title: 'Q 向量（position 0）',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[280px] mx-auto">
            <defs>
              <marker id={`arrow-${COLORS.primary.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>
            <PolarGrid />
            <Arrow fromAngle={0} toAngle={0} r={RADIUS} color={COLORS.primary} label="Q₀" />
            <text x={CENTER} y={SVG_SIZE - 8} textAnchor="middle" fontSize="10" fill={COLORS.mid}
              fontFamily="system-ui">Position 0: 旋转角度 = 0</text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            把 Q 向量的一对维度 $(d_{2i}, d_{2i+1})$ 看作二维平面上的向量
          </p>
        </div>
      ),
    },
    {
      title: 'Position 1: Q 和 K 各旋转 θ',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[280px] mx-auto">
            <defs>
              <marker id={`arrow-${COLORS.primary.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
              <marker id={`arrow-${COLORS.green.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
              </marker>
            </defs>
            <PolarGrid />
            {/* Original (ghost) */}
            <line x1={CENTER} y1={CENTER}
              x2={CENTER + RADIUS * 0.7} y2={CENTER}
              stroke={COLORS.primary} strokeWidth={1} opacity={0.2} strokeDasharray="4,3" />
            <Arrow fromAngle={0} toAngle={THETA} r={RADIUS} color={COLORS.primary}
              label={`Q₁ (θ)`} showArc />
            <Arrow fromAngle={0} toAngle={THETA} r={RADIUS * 0.75} color={COLORS.green}
              label={`K₁ (θ)`} showArc />
            <text x={CENTER} y={SVG_SIZE - 8} textAnchor="middle" fontSize="10" fill={COLORS.mid}
              fontFamily="system-ui">Position 1: 两个向量都旋转 θ = {THETA}°</text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            RoPE 对 Q 和 K 施加<strong>相同的</strong>旋转，角度 = position × θ
          </p>
        </div>
      ),
    },
    {
      title: 'Position 3 vs 5: 内积只依赖差值',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[280px] mx-auto">
            <defs>
              <marker id={`arrow-${COLORS.primary.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
              <marker id={`arrow-${COLORS.green.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
              </marker>
              <marker id={`arrow-${COLORS.orange.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.orange} />
              </marker>
            </defs>
            <PolarGrid />
            <Arrow fromAngle={0} toAngle={3 * THETA} r={RADIUS} color={COLORS.primary}
              label={`Q₃ (3θ)`} showArc />
            <Arrow fromAngle={0} toAngle={5 * THETA} r={RADIUS * 0.75} color={COLORS.green}
              label={`K₅ (5θ)`} showArc />
            {/* Angle difference arc */}
            <motion.path
              d={`M ${polarToXY(3 * THETA, 55).x} ${polarToXY(3 * THETA, 55).y} A 55 55 0 0 0 ${polarToXY(5 * THETA, 55).x} ${polarToXY(5 * THETA, 55).y}`}
              fill="none" stroke={COLORS.orange} strokeWidth={2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
            <motion.text
              x={polarToXY(4 * THETA, 68).x} y={polarToXY(4 * THETA, 68).y}
              textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.orange}
              fontFamily="system-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Δ = 2θ
            </motion.text>
            <text x={CENTER} y={SVG_SIZE - 8} textAnchor="middle" fontSize="10" fill={COLORS.mid}
              fontFamily="system-ui">Q₃ᵀK₅ = Qᵀ R(5−3)θ K — 只依赖相对距离</text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            <strong>关键性质：</strong>$\tilde{{q}}_m^T \tilde{{k}}_n = q^T R_{{(n-m)\theta}} k$ — 内积只依赖 $n - m$
          </p>
        </div>
      ),
    },
    {
      title: '多维度对：不同频率',
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'θ₁ (低频)', theta: 10, color: HEAD_COLORS[0] },
              { label: 'θ₂ (中频)', theta: 30, color: HEAD_COLORS[1] },
              { label: 'θ₃ (高频)', theta: 70, color: HEAD_COLORS[2] },
            ].map(({ label, theta, color }) => {
              const size = 120;
              const c = size / 2;
              const r = 40;
              const positions = [0, 1, 2, 3];
              return (
                <div key={label} className="text-center">
                  <div className="text-xs font-semibold mb-1" style={{ color }}>{label}</div>
                  <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
                    {/* Grid */}
                    <circle cx={c} cy={c} r={r} fill="none" stroke="#e5e7eb" strokeWidth={0.5} />
                    <line x1={c - r - 5} y1={c} x2={c + r + 5} y2={c} stroke="#e5e7eb" strokeWidth={0.3} />
                    <line x1={c} y1={c - r - 5} x2={c} y2={c + r + 5} stroke="#e5e7eb" strokeWidth={0.3} />
                    {/* Position vectors */}
                    {positions.map(p => {
                      const angle = p * theta;
                      const rad = (angle * Math.PI) / 180;
                      const endX = c + r * Math.cos(rad);
                      const endY = c - r * Math.sin(rad);
                      const labelX = c + (r + 12) * Math.cos(rad);
                      const labelY = c - (r + 12) * Math.sin(rad);
                      return (
                        <g key={p}>
                          <motion.line
                            x1={c} y1={c} x2={endX} y2={endY}
                            stroke={color} strokeWidth={1.5} opacity={0.4 + p * 0.2}
                            initial={{ x2: c, y2: c }}
                            animate={{ x2: endX, y2: endY }}
                            transition={{ duration: 0.4, delay: p * 0.15 }}
                          />
                          <motion.text x={labelX} y={labelY + 3}
                            textAnchor="middle" fontSize="7" fill={color} fontFamily="monospace"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: p * 0.15 + 0.3 }}
                          >
                            p{p}
                          </motion.text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="text-[10px] text-gray-500">每步旋转 {theta}°</div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 text-center">
            不同维度对使用不同 $\theta_i$，类似 Sinusoidal 的多频率思想
            <br />
            <span className="text-xs">低频 → 捕捉远距离位置关系；高频 → 捕捉近距离精确位置</span>
          </p>
        </div>
      ),
    },
  ], []);

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/RoPERotationAnimation.tsx
git commit -m "feat: add RoPERotationAnimation component (positional-encoding 3/4)"
```

---

### Task 4: EncodingComparison Component

**Files:**
- Create: `src/components/interactive/EncodingComparison.tsx`

**Context:** Interactive comparison table of 5 positional encoding methods. Rows: Sinusoidal, Learned, Shaw (Relative), ALiBi, RoPE. Columns: type, training params, extrapolation, compute cost, representative models. Hover highlights row, click expands one-sentence summary.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/EncodingComparison.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

interface EncodingMethod {
  name: string;
  type: '绝对' | '相对';
  params: string;
  extrapolation: string;
  extrapolationLevel: 'low' | 'medium' | 'high';
  cost: string;
  models: string;
  summary: string;
}

const METHODS: EncodingMethod[] = [
  {
    name: 'Sinusoidal',
    type: '绝对',
    params: '无',
    extrapolation: '有限',
    extrapolationLevel: 'low',
    cost: '极低',
    models: 'Transformer (原始)',
    summary: '用不同频率的 sin/cos 函数生成固定编码，无需训练，理论可外推但实际效果有限',
  },
  {
    name: 'Learned',
    type: '绝对',
    params: 'L_max × d',
    extrapolation: '无',
    extrapolationLevel: 'low',
    cost: '极低',
    models: 'BERT, GPT-2',
    summary: '直接训练位置向量表，简单有效，但序列长度被训练时的 L_max 限死',
  },
  {
    name: 'Shaw (Relative)',
    type: '相对',
    params: '2K+1 个偏置',
    extrapolation: '中等',
    extrapolationLevel: 'medium',
    cost: '中等',
    models: 'Transformer-XL',
    summary: '在 Attention 分数中加入可学习的相对位置偏置，天然支持变长序列',
  },
  {
    name: 'ALiBi',
    type: '相对',
    params: '无',
    extrapolation: '强',
    extrapolationLevel: 'high',
    cost: '极低',
    models: 'BLOOM, MPT',
    summary: '直接在 Attention 分数上减去线性距离惩罚 m·|i−j|，零参数且外推能力极强',
  },
  {
    name: 'RoPE',
    type: '相对',
    params: '无',
    extrapolation: '中→强',
    extrapolationLevel: 'high',
    cost: '低',
    models: 'LLaMA, GPT-NeoX, Qwen',
    summary: '对 Q/K 向量做旋转变换，内积自然只依赖相对位置；配合 NTK/YaRN 可显著提升外推',
  },
];

const EXTRAP_COLORS: Record<string, string> = {
  low: COLORS.red,
  medium: COLORS.orange,
  high: COLORS.green,
};

export default function EncodingComparison() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {['方案', '类型', '训练参数', '外推能力', '计算开销', '代表模型'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METHODS.map((m, i) => (
            <tr key={m.name}>
              <td colSpan={6} className="p-0">
                <div
                  className="cursor-pointer transition-colors"
                  style={{
                    backgroundColor: hovered === i ? COLORS.highlight : expanded === i ? '#f0f7ff' : 'transparent',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="grid grid-cols-6 px-3 py-2.5 items-center border-b border-gray-100">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <span className="text-xs text-gray-400">{expanded === i ? '▼' : '▶'}</span>
                      {m.name}
                    </div>
                    <div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                        m.type === '绝对' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {m.type}
                      </span>
                    </div>
                    <div className="text-gray-600 font-mono text-xs">{m.params}</div>
                    <div>
                      <span className="font-medium" style={{ color: EXTRAP_COLORS[m.extrapolationLevel] }}>
                        {m.extrapolation}
                      </span>
                    </div>
                    <div className="text-gray-600">{m.cost}</div>
                    <div className="text-gray-600 text-xs">{m.models}</div>
                  </div>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border-b border-gray-100">
                          💡 {m.summary}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/EncodingComparison.tsx
git commit -m "feat: add EncodingComparison component (positional-encoding 4/4)"
```

---

### Task 5: Positional Encoding Article MDX

**Files:**
- Create: `src/content/articles/zh/positional-encoding.mdx`

**Context:** Full article assembling all 4 components from Tasks 1–4. Follows the content structure from spec section 2.1. Must include all frontmatter fields, imports with `client:visible`, KaTeX formulas, and references.

- [ ] **Step 1: Create the MDX file**

```mdx
---
title: "Positional Encoding — 让 Transformer 理解顺序"
slug: positional-encoding
locale: zh
tags: [transformer, attention, positional-encoding]
prerequisites: [transformer-overview]
difficulty: intermediate
created: "2026-04-02"
updated: "2026-04-02"
references:
  - type: paper
    title: "Attention Is All You Need"
    url: "https://arxiv.org/abs/1706.03762"
  - type: paper
    title: "Self-Attention with Relative Position Representations"
    url: "https://arxiv.org/abs/1803.02155"
  - type: paper
    title: "RoFormer: Enhanced Transformer with Rotary Position Embedding"
    url: "https://arxiv.org/abs/2104.09864"
  - type: paper
    title: "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation"
    url: "https://arxiv.org/abs/2108.12409"
---

import PermutationInvariance from '../../../components/interactive/PermutationInvariance.tsx';
import SinusoidalHeatmap from '../../../components/interactive/SinusoidalHeatmap.tsx';
import RoPERotationAnimation from '../../../components/interactive/RoPERotationAnimation.tsx';
import EncodingComparison from '../../../components/interactive/EncodingComparison.tsx';

Transformer 的 Self-Attention 机制有一个常被忽视但极其关键的特性：**置换不变性（Permutation Invariance）**。打乱输入 token 的顺序，Attention 的输出不会改变 — 换句话说，原始的 Attention 完全不知道 token 的位置。这意味着没有位置编码的 Transformer 分不清 "狗咬人" 和 "人咬狗"。

Positional Encoding（位置编码）就是解决这个问题的方案。本文从 Sinusoidal 编码出发，经过 Learned Embedding 和相对位置编码，最终深入讲解当今主流 LLM 普遍采用的 **RoPE（Rotary Position Embedding）**。

## 为什么需要位置编码

### Attention 的置换不变性

Self-Attention 的计算过程是：$\text{Attn}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$

其中 $Q = XW_Q$, $K = XW_K$, $V = XW_V$。如果我们对输入序列做一个置换 $\pi$（即打乱 token 顺序），设置换矩阵为 $P$：

$$
\text{Attn}(PX) = P \cdot \text{Attn}(X)
$$

输出只是跟着置换了一下，每对 token 之间的 Attention 分数**完全不变**。

<PermutationInvariance client:visible />

这意味着：不加位置编码，"The cat sat here" 和 "sat here The cat" 对模型来说是**等价的**。对于语言理解，这显然不可接受 — 我们必须显式注入位置信息。

## 绝对位置编码

### Sinusoidal 编码（Vaswani et al. 2017）

原始 Transformer 使用固定的正弦/余弦函数生成位置编码：

$$
PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d}}\right), \quad PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d}}\right)
$$

每个维度对应一个不同频率的波。低维度频率高（变化快），高维度频率低（变化慢）。每个位置因此获得一个唯一的"频率指纹"：

<SinusoidalHeatmap client:visible />

**优点：** 无训练参数，理论上可外推到训练时未见过的长度。

**缺点：** 实际外推效果有限，后续被其他方案逐渐取代。

### Learned Embedding

另一种简单的方案是直接训练一个位置向量表 $E \in \mathbb{R}^{L_{max} \times d}$，让模型自己学出每个位置的表示。

- **优点：** 实现简单，效果通常优于 Sinusoidal
- **缺点：** 序列长度被训练时的 $L_{max}$ 限死，无法处理更长的输入

BERT 和 GPT-2 都采用了这种方案。

## 相对位置编码

### Shaw et al. 2018 — 从绝对到相对的转变

核心观察：自然语言中，token 之间的**相对距离**往往比绝对位置更重要。"the cat" 这两个词无论出现在句子开头还是结尾，它们之间的语法关系是一样的。

Shaw et al. 的方案在 Attention 分数中加入可学习的相对位置偏置 $a_{ij}^K$：

$$
e_{ij} = \frac{x_i W_Q (x_j W_K + a_{ij}^K)^T}{\sqrt{d_k}}
$$

其中 $a_{ij}^K$ 只取决于 $i - j$ 的值（距离），且会被裁剪到 $[-K, K]$ 范围内。

**优点：** 天然支持变长序列，参数量小（只需 $2K + 1$ 个偏置向量）。

### ALiBi（Press et al. 2022）— 极致简化

ALiBi 走了一条更激进的路：完全不加位置 embedding，直接在 Attention 分数上减去**线性距离惩罚**：

$$
\text{score}_{ij} = q_i \cdot k_j - m \cdot |i - j|
$$

其中 $m$ 是每个注意力头不同的固定斜率（按几何级数设定，如 $m \in \{2^{-1}, 2^{-2}, \ldots, 2^{-H}\}$）。

- **优点：** 零训练参数、外推能力极强、实现极其简单
- **缺点：** 只有距离衰减一种模式，表达力有限

BLOOM 和 MPT 等模型采用了 ALiBi。

## RoPE — Rotary Position Embedding

RoPE（Su et al. 2021）是当前最主流的位置编码方案，被 LLaMA、Qwen、GPT-NeoX 等模型广泛采用。

### 核心直觉

RoPE 的核心思想极其优雅：**把每对相邻维度 $(d_{2i}, d_{2i+1})$ 看作二维平面上的一个向量，然后根据 token 的位置对这个向量做旋转。**

- 位置 $m$ 对应旋转角度 $m\theta_i$
- 不同维度对使用不同的基础角度 $\theta_i$（类似 Sinusoidal 的多频率思想）
- 两个 token 的 Q 和 K 旋转后做内积 → 内积**只依赖相对距离 $m - n$**

<RoPERotationAnimation client:visible />

### 数学推导

对每对维度 $(2i, 2i+1)$，定义旋转矩阵：

$$
R_{\theta_i}(m) = \begin{pmatrix} \cos m\theta_i & -\sin m\theta_i \\ \sin m\theta_i & \cos m\theta_i \end{pmatrix}
$$

其中 $\theta_i = 10000^{-2i/d}$。对 Q 和 K 分别施加旋转：

$$
\tilde{q}_m = R_{\theta}(m) \, q_m, \quad \tilde{k}_n = R_{\theta}(n) \, k_n
$$

**关键性质** — 旋转后的内积只依赖相对位置：

$$
\tilde{q}_m^T \tilde{k}_n = q_m^T R_{\theta}(m)^T R_{\theta}(n) \, k_n = q_m^T R_{\theta}(n - m) \, k_n
$$

这是因为旋转矩阵的性质 $R(\alpha)^T R(\beta) = R(\beta - \alpha)$。

### 长度外推问题

RoPE 训练时的位置角度范围是有限的。当推理序列超过训练长度时，角度值超出训练分布，模型性能会下降。

目前主流的解决方案：

- **NTK-aware scaling：** 修改频率基数，把高频分量"压缩"到训练范围内
- **YaRN（Yet another RoPE extensioN）：** 混合策略 — 对不同频率分量使用不同的缩放因子

这些方法能将 RoPE 的有效长度从训练长度扩展数倍甚至数十倍，使得 LLaMA 等模型可以处理 100K+ token 的长文本。

## 对比总结

<EncodingComparison client:visible />

**选型建议：**
- 从头训练新模型 → **RoPE**（当前主流首选）
- 需要极致简单 + 强外推 → ALiBi
- 历史模型兼容 → 按原有方案（Learned / Sinusoidal）
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds, article renders with all 4 components

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/positional-encoding.mdx
git commit -m "feat: add positional-encoding article with 4 interactive components"
```

---

### Task 6: Update Transformer Core Learning Path

**Files:**
- Modify: `src/content/paths/transformer-core.yaml`

**Context:** Add `positional-encoding` as the 6th article in the Transformer Core learning path.

- [ ] **Step 1: Update the YAML file**

Add `positional-encoding` at the end of the articles list:

```yaml
id: transformer-core
title:
  zh: "Transformer 核心机制"
  en: "Transformer Core Mechanisms"
description:
  zh: "从网络结构到注意力机制，深入理解 Transformer 的每一个组件"
  en: "Deep dive into every component of the Transformer, from architecture to attention"
level: intermediate
articles:
  - transformer-overview
  - qkv-intuition
  - attention-computation
  - multi-head-attention
  - gqa-mqa
  - positional-encoding
```

- [ ] **Step 2: Run validation**

Run: `npm run validate`
Expected: Validation passes

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/transformer-core.yaml
git commit -m "feat: add positional-encoding to transformer-core path (#6)"
```

---

## Article 2: Sampling & Decoding (Tasks 7–12)

### Task 7: PerplexityIntuition Component

**Files:**
- Create: `src/components/interactive/PerplexityIntuition.tsx`

**Context:** Shows a short sentence with per-token prediction probabilities. Toggles between "good model" (high probs, low PPL) and "bad model" (spread probs, high PPL). Each token shows top-5 candidate bar chart above it. Bottom displays computed PPL.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/PerplexityIntuition.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

// Pre-computed probability distributions for each token position
// Good model: high probability on correct token
const GOOD_MODEL: { candidates: string[]; probs: number[] }[] = [
  { candidates: ['The', 'A', 'This', 'One', 'My'], probs: [0.45, 0.25, 0.15, 0.08, 0.04] },
  { candidates: ['cat', 'dog', 'bird', 'man', 'boy'], probs: [0.52, 0.22, 0.12, 0.08, 0.04] },
  { candidates: ['sat', 'was', 'lay', 'stood', 'slept'], probs: [0.60, 0.18, 0.10, 0.07, 0.03] },
  { candidates: ['on', 'in', 'by', 'near', 'under'], probs: [0.70, 0.12, 0.08, 0.06, 0.03] },
  { candidates: ['the', 'a', 'his', 'my', 'that'], probs: [0.65, 0.18, 0.08, 0.05, 0.03] },
  { candidates: ['mat', 'floor', 'bed', 'table', 'roof'], probs: [0.55, 0.20, 0.12, 0.08, 0.04] },
];

// Bad model: spread probability, lower confidence
const BAD_MODEL: { candidates: string[]; probs: number[] }[] = [
  { candidates: ['The', 'A', 'This', 'One', 'My'], probs: [0.25, 0.22, 0.20, 0.18, 0.12] },
  { candidates: ['cat', 'dog', 'bird', 'man', 'boy'], probs: [0.24, 0.22, 0.20, 0.18, 0.13] },
  { candidates: ['sat', 'was', 'lay', 'stood', 'slept'], probs: [0.26, 0.22, 0.20, 0.17, 0.12] },
  { candidates: ['on', 'in', 'by', 'near', 'under'], probs: [0.28, 0.23, 0.20, 0.16, 0.10] },
  { candidates: ['the', 'a', 'his', 'my', 'that'], probs: [0.26, 0.24, 0.20, 0.17, 0.10] },
  { candidates: ['mat', 'floor', 'bed', 'table', 'roof'], probs: [0.24, 0.22, 0.20, 0.19, 0.12] },
];

function computePPL(model: typeof GOOD_MODEL): number {
  // PPL = exp(-1/N * sum(ln(p(correct_token))))
  // correct token is always the first candidate
  const N = model.length;
  const sumLogProb = model.reduce((sum, m) => sum + Math.log(m.probs[0]), 0);
  return Math.exp(-sumLogProb / N);
}

function MiniBarChart({ candidates, probs, correctIdx }: {
  candidates: string[]; probs: number[]; correctIdx: number;
}) {
  const maxProb = Math.max(...probs);
  const barH = 32;
  const barW = 18;
  const gap = 3;
  const w = candidates.length * (barW + gap);

  return (
    <svg viewBox={`0 0 ${w} ${barH + 14}`} className="w-full" style={{ maxWidth: w }}>
      {probs.map((p, i) => {
        const h = (p / maxProb) * barH;
        const isCorrect = i === correctIdx;
        return (
          <g key={i}>
            <motion.rect
              x={i * (barW + gap)}
              y={barH - h}
              width={barW}
              height={h}
              rx={2}
              fill={isCorrect ? COLORS.green : COLORS.light}
              stroke={isCorrect ? COLORS.green : '#d1d5db'}
              strokeWidth={0.5}
              initial={{ height: 0, y: barH }}
              animate={{ height: h, y: barH - h }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            />
            <text
              x={i * (barW + gap) + barW / 2}
              y={barH + 10}
              textAnchor="middle" fontSize="6" fill={COLORS.mid}
              fontFamily="monospace"
            >
              {(p * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PerplexityIntuition() {
  const [isGoodModel, setIsGoodModel] = useState(true);
  const model = isGoodModel ? GOOD_MODEL : BAD_MODEL;
  const ppl = useMemo(() => computePPL(model), [model]);

  return (
    <div className="space-y-4">
      {/* Model toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setIsGoodModel(true)}
          className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
            isGoodModel
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          好模型
        </button>
        <button
          onClick={() => setIsGoodModel(false)}
          className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
            !isGoodModel
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          差模型
        </button>
      </div>

      {/* Token sequence with bar charts */}
      <div className="flex items-end justify-center gap-1 flex-wrap">
        <AnimatePresence mode="wait">
          {TOKENS.map((token, i) => (
            <motion.div
              key={`${isGoodModel}-${i}`}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {/* Mini bar chart */}
              <div className="w-[100px] mb-1">
                <MiniBarChart
                  candidates={model[i].candidates}
                  probs={model[i].probs}
                  correctIdx={0}
                />
              </div>
              {/* Token */}
              <div className="px-2 py-1 rounded text-sm font-mono border"
                style={{
                  borderColor: isGoodModel ? COLORS.green : COLORS.red,
                  backgroundColor: isGoodModel ? '#f0fdf4' : '#fef2f2',
                }}>
                {token}
              </div>
              {/* Probability */}
              <div className="text-xs font-mono mt-0.5"
                style={{ color: isGoodModel ? COLORS.green : COLORS.red }}>
                {(model[i].probs[0] * 100).toFixed(0)}%
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PPL display */}
      <motion.div
        className="text-center p-3 rounded-lg"
        style={{
          backgroundColor: isGoodModel ? '#f0fdf4' : '#fef2f2',
          borderLeft: `4px solid ${isGoodModel ? COLORS.green : COLORS.red}`,
        }}
        key={isGoodModel ? 'good' : 'bad'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-lg font-bold" style={{ color: isGoodModel ? COLORS.green : COLORS.red }}>
          PPL = {ppl.toFixed(2)}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {isGoodModel
            ? '好模型：高置信度预测 → 低困惑度（每步平均只需从 ~2 个 token 中选择）'
            : '差模型：概率分散 → 高困惑度（每步平均要从 ~4 个 token 中选择）'}
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/PerplexityIntuition.tsx
git commit -m "feat: add PerplexityIntuition component (sampling-and-decoding 1/4)"
```

---

### Task 8: TemperatureDistribution Component

**Files:**
- Create: `src/components/interactive/TemperatureDistribution.tsx`

**Context:** Temperature slider (0.1–3.0) controls softmax distribution over ~10 tokens. Real-time bar chart with entropy and PPL annotations. Marks greedy choice and sampling range.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/TemperatureDistribution.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS } from './shared/colors';

// Fixed logits for 10 tokens
const TOKEN_DATA = [
  { token: 'Paris', logit: 5.2 },
  { token: 'London', logit: 3.8 },
  { token: 'Berlin', logit: 3.1 },
  { token: 'Tokyo', logit: 2.5 },
  { token: 'Rome', logit: 2.0 },
  { token: 'Madrid', logit: 1.5 },
  { token: 'Oslo', logit: 0.8 },
  { token: 'Lima', logit: 0.3 },
  { token: 'Baku', logit: -0.5 },
  { token: 'Fiji', logit: -1.2 },
];

function softmax(logits: number[], T: number): number[] {
  const scaled = logits.map(z => z / T);
  const maxZ = Math.max(...scaled);
  const exps = scaled.map(z => Math.exp(z - maxZ));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function entropy(probs: number[]): number {
  return -probs.reduce((sum, p) => {
    if (p > 1e-10) sum += p * Math.log2(p);
    return sum;
  }, 0);
}

export default function TemperatureDistribution() {
  const [temp, setTemp] = useState(1.0);
  const logits = TOKEN_DATA.map(d => d.logit);
  const probs = useMemo(() => softmax(logits, temp), [temp]);
  const H = useMemo(() => entropy(probs), [probs]);
  const ppl = Math.pow(2, H);
  const maxProb = Math.max(...probs);
  const greedyIdx = probs.indexOf(maxProb);

  const svgW = 460;
  const svgH = 200;
  const padL = 10;
  const padR = 10;
  const padT = 20;
  const padB = 40;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;
  const barW = chartW / TOKEN_DATA.length * 0.7;
  const barGap = chartW / TOKEN_DATA.length;

  return (
    <div className="space-y-3">
      {/* Temperature slider */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Temperature: <span className="font-mono font-bold" style={{ color: COLORS.primary }}>{temp.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={0.1}
          max={3.0}
          step={0.1}
          value={temp}
          onChange={e => setTemp(parseFloat(e.target.value))}
          className="flex-1"
        />
        <div className="flex gap-3 text-xs text-gray-500">
          <span>T→0: Greedy</span>
          <span>T=1: 标准</span>
          <span>T→∞: 均匀</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {/* Bars */}
          {probs.map((p, i) => {
            const barH = (p / Math.max(maxProb, 0.01)) * chartH;
            const x = padL + i * barGap + (barGap - barW) / 2;
            const y = padT + chartH - barH;
            const isGreedy = i === greedyIdx;

            return (
              <g key={i}>
                <motion.rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={3}
                  fill={isGreedy ? COLORS.primary : COLORS.valid}
                  stroke={isGreedy ? COLORS.primary : '#93c5fd'}
                  strokeWidth={isGreedy ? 2 : 1}
                  animate={{ y, height: barH }}
                  transition={{ duration: 0.2 }}
                />
                {/* Probability label */}
                <motion.text
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle" fontSize="8" fontFamily="monospace"
                  fill={isGreedy ? COLORS.primary : COLORS.mid}
                  fontWeight={isGreedy ? '700' : '400'}
                  animate={{ y: y - 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {(p * 100).toFixed(1)}%
                </motion.text>
                {/* Token label */}
                <text
                  x={x + barW / 2}
                  y={padT + chartH + 14}
                  textAnchor="middle" fontSize="9" fill={COLORS.dark}
                  fontFamily="system-ui" fontWeight={isGreedy ? '700' : '400'}
                >
                  {TOKEN_DATA[i].token}
                </text>
                {/* Greedy marker */}
                {isGreedy && (
                  <text x={x + barW / 2} y={padT + chartH + 26}
                    textAnchor="middle" fontSize="7" fill={COLORS.primary}
                    fontFamily="system-ui" fontWeight="600">
                    ← Greedy
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-xs text-gray-500">Entropy (H)</div>
          <div className="font-mono font-bold" style={{ color: COLORS.orange }}>{H.toFixed(2)} bits</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Perplexity (2ᴴ)</div>
          <div className="font-mono font-bold" style={{ color: COLORS.red }}>{ppl.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Greedy 选择</div>
          <div className="font-mono font-bold" style={{ color: COLORS.primary }}>{TOKEN_DATA[greedyIdx].token}</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        T &lt; 1 → 分布更尖锐（确定性高）；T &gt; 1 → 分布更平坦（多样性高）
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TemperatureDistribution.tsx
git commit -m "feat: add TemperatureDistribution component (sampling-and-decoding 2/4)"
```

---

### Task 9: SamplingStrategyComparison Component

**Files:**
- Create: `src/components/interactive/SamplingStrategyComparison.tsx`

**Context:** Three-column comparison showing Greedy / Top-k / Top-p applied to the same set of ~15 token logits. k slider (1–15) and p slider (0.5–1.0). Filtered-out tokens appear gray/small; kept tokens highlighted. Each column shows count of kept tokens and renormalized distribution.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/SamplingStrategyComparison.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS } from './shared/colors';

// 15 tokens with decreasing probabilities (already softmax-ed at T=1)
const TOKENS: { token: string; prob: number }[] = [
  { token: 'Paris', prob: 0.22 },
  { token: 'London', prob: 0.15 },
  { token: 'Berlin', prob: 0.11 },
  { token: 'Tokyo', prob: 0.09 },
  { token: 'Rome', prob: 0.07 },
  { token: 'Madrid', prob: 0.06 },
  { token: 'Seoul', prob: 0.05 },
  { token: 'Oslo', prob: 0.04 },
  { token: 'Lima', prob: 0.04 },
  { token: 'Cairo', prob: 0.03 },
  { token: 'Baku', prob: 0.03 },
  { token: 'Kiev', prob: 0.03 },
  { token: 'Doha', prob: 0.03 },
  { token: 'Fiji', prob: 0.03 },
  { token: 'Laos', prob: 0.02 },
];

function ColumnChart({ title, tokens, kept, color, note }: {
  title: string;
  tokens: typeof TOKENS;
  kept: boolean[];
  color: string;
  note: string;
}) {
  const keptCount = kept.filter(Boolean).length;
  const totalKeptProb = tokens.reduce((s, t, i) => kept[i] ? s + t.prob : s, 0);

  return (
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold text-center mb-1" style={{ color }}>{title}</div>
      <div className="space-y-0.5">
        {tokens.map((t, i) => {
          const isKept = kept[i];
          const normalizedProb = isKept ? t.prob / totalKeptProb : 0;
          const barW = isKept ? normalizedProb * 100 : 0;
          return (
            <div key={i} className="flex items-center gap-1 h-4">
              <span className={`text-[9px] font-mono w-8 text-right ${isKept ? 'text-gray-700' : 'text-gray-300'}`}>
                {t.token}
              </span>
              <div className="flex-1 h-3 bg-gray-50 rounded-sm overflow-hidden relative">
                <motion.div
                  className="h-full rounded-sm"
                  style={{ backgroundColor: isKept ? color : '#e5e7eb' }}
                  animate={{ width: `${isKept ? Math.max(barW, 2) : t.prob * 100 * 0.3}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className={`text-[8px] font-mono w-8 ${isKept ? 'text-gray-600' : 'text-gray-300'}`}>
                {isKept ? `${(normalizedProb * 100).toFixed(1)}%` : '—'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-1.5">
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
          backgroundColor: `${color}15`,
          color,
        }}>
          保留 {keptCount} 个 token
        </span>
      </div>
      <div className="text-[9px] text-gray-400 text-center mt-0.5">{note}</div>
    </div>
  );
}

export default function SamplingStrategyComparison() {
  const [k, setK] = useState(5);
  const [p, setP] = useState(0.9);

  const greedyKept = TOKENS.map((_, i) => i === 0);

  const topKKept = useMemo(() => {
    return TOKENS.map((_, i) => i < k);
  }, [k]);

  const topPKept = useMemo(() => {
    let cumProb = 0;
    return TOKENS.map(t => {
      if (cumProb >= p) return false;
      cumProb += t.prob;
      return true;
    });
  }, [p]);

  const topPCount = topPKept.filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            Top-k: <span className="font-mono font-bold" style={{ color: COLORS.orange }}>{k}</span>
          </label>
          <input type="range" min={1} max={15} step={1} value={k}
            onChange={e => setK(parseInt(e.target.value))} className="flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            Top-p: <span className="font-mono font-bold" style={{ color: COLORS.purple }}>{p.toFixed(2)}</span>
          </label>
          <input type="range" min={0.5} max={1.0} step={0.05} value={p}
            onChange={e => setP(parseFloat(e.target.value))} className="flex-1" />
        </div>
      </div>

      {/* Three columns */}
      <div className="flex gap-3 border border-gray-200 rounded-lg p-3 bg-white">
        <ColumnChart
          title="Greedy"
          tokens={TOKENS}
          kept={greedyKept}
          color={COLORS.primary}
          note="只选最高概率"
        />
        <div className="w-px bg-gray-200" />
        <ColumnChart
          title={`Top-k (k=${k})`}
          tokens={TOKENS}
          kept={topKKept}
          color={COLORS.orange}
          note={`固定保留前 ${k} 个`}
        />
        <div className="w-px bg-gray-200" />
        <ColumnChart
          title={`Top-p (p=${p.toFixed(2)})`}
          tokens={TOKENS}
          kept={topPKept}
          color={COLORS.purple}
          note={`动态保留 ${topPCount} 个 (Σ≥${p})`}
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        Top-p 会根据分布的确定性<strong>动态调整</strong>保留数量 — 尖锐分布保留少、平坦分布保留多
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SamplingStrategyComparison.tsx
git commit -m "feat: add SamplingStrategyComparison component (sampling-and-decoding 3/4)"
```

---

### Task 10: BeamSearchTree Component

**Files:**
- Create: `src/components/interactive/BeamSearchTree.tsx`

**Context:** StepNavigator with 4 steps showing beam search (beam width B=2, 3 steps). Tree grows left to right. Pruned branches shown in gray dashed lines.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/BeamSearchTree.tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, HEAD_COLORS } from './shared/colors';

interface TreeNode {
  id: string;
  token: string;
  score: number;
  x: number;
  y: number;
  parentId?: string;
  pruned?: boolean;
}

const B = 2; // beam width
const SVG_W = 480;
const SVG_H = 220;
const COL_W = 110;
const START_X = 30;

// Pre-computed beam search tree
// Step 0: [START]
// Step 1: expand → "I" (−0.5), "The" (−0.3) → keep both
// Step 2: "The" → "cat"(−0.7), "dog"(−0.9); "I" → "like"(−0.8), "am"(−1.1) → keep "The cat"(−1.0), "I like"(−1.3)
// Step 3: "The cat" → "sat"(−1.3), "is"(−1.5); "I like" → "cats"(−1.6), "dogs"(−1.8) → keep "The cat sat"(−1.3), "The cat is"(−1.5)

function buildTree(step: number): { nodes: TreeNode[]; edges: { from: string; to: string; pruned: boolean }[] } {
  const nodes: TreeNode[] = [];
  const edges: { from: string; to: string; pruned: boolean }[] = [];

  // Root
  const rootY = SVG_H / 2;
  nodes.push({ id: 'root', token: '[START]', score: 0, x: START_X, y: rootY });

  if (step >= 1) {
    // Step 1: expand root → 4 candidates, keep top-2
    const step1 = [
      { id: 's1-0', token: 'The', score: -0.3, kept: true },
      { id: 's1-1', token: 'I', score: -0.5, kept: true },
      { id: 's1-2', token: 'A', score: -1.2, kept: false },
      { id: 's1-3', token: 'We', score: -1.5, kept: false },
    ];
    const keptCount = step1.filter(s => s.kept).length;
    const totalNodes = step1.length;
    step1.forEach((n, i) => {
      const y = 30 + (i / (totalNodes - 1)) * (SVG_H - 60);
      nodes.push({ ...n, x: START_X + COL_W, y, parentId: 'root', pruned: !n.kept });
      edges.push({ from: 'root', to: n.id, pruned: !n.kept });
    });

    if (step >= 2) {
      // Step 2: expand each kept beam
      const step2 = [
        { id: 's2-0', token: 'cat', score: -1.0, parentId: 's1-0', kept: true },
        { id: 's2-1', token: 'dog', score: -1.2, parentId: 's1-0', kept: false },
        { id: 's2-2', token: 'like', score: -1.3, parentId: 's1-1', kept: true },
        { id: 's2-3', token: 'am', score: -1.6, parentId: 's1-1', kept: false },
      ];
      step2.forEach((n, i) => {
        const y = 20 + (i / (step2.length - 1)) * (SVG_H - 40);
        nodes.push({ ...n, x: START_X + COL_W * 2, y, pruned: !n.kept });
        edges.push({ from: n.parentId!, to: n.id, pruned: !n.kept });
      });

      if (step >= 3) {
        // Step 3: final expansion
        const step3 = [
          { id: 's3-0', token: 'sat', score: -1.3, parentId: 's2-0', kept: true },
          { id: 's3-1', token: 'is', score: -1.5, parentId: 's2-0', kept: true },
          { id: 's3-2', token: 'cats', score: -1.6, parentId: 's2-2', kept: false },
          { id: 's3-3', token: 'dogs', score: -1.8, parentId: 's2-2', kept: false },
        ];
        step3.forEach((n, i) => {
          const y = 20 + (i / (step3.length - 1)) * (SVG_H - 40);
          nodes.push({ ...n, x: START_X + COL_W * 3, y, pruned: !n.kept });
          edges.push({ from: n.parentId!, to: n.id, pruned: !n.kept });
        });
      }
    }
  }

  return { nodes, edges };
}

function TreeSVG({ step }: { step: number }) {
  const { nodes, edges } = useMemo(() => buildTree(step), [step]);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
      {/* Edges */}
      {edges.map(e => {
        const from = nodeMap[e.from];
        const to = nodeMap[e.to];
        if (!from || !to) return null;
        return (
          <line key={`${e.from}-${e.to}`}
            x1={from.x + 30} y1={from.y}
            x2={to.x - 30} y2={to.y}
            stroke={e.pruned ? '#d1d5db' : COLORS.primary}
            strokeWidth={e.pruned ? 1 : 2}
            strokeDasharray={e.pruned ? '4,3' : 'none'}
            opacity={e.pruned ? 0.5 : 1}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map(n => {
        const isRoot = n.id === 'root';
        const fill = n.pruned ? '#f9fafb' : isRoot ? COLORS.bgAlt : '#dbeafe';
        const stroke = n.pruned ? '#d1d5db' : COLORS.primary;
        const textColor = n.pruned ? COLORS.mid : COLORS.dark;
        return (
          <g key={n.id}>
            <rect
              x={n.x - 28} y={n.y - 14}
              width={56} height={28}
              rx={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={n.pruned ? 1 : 1.5}
            />
            <text x={n.x} y={n.y - 1}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={textColor} fontFamily="system-ui">
              {n.token}
            </text>
            {!isRoot && (
              <text x={n.x} y={n.y + 10}
                textAnchor="middle" fontSize="7" fill={n.pruned ? '#d1d5db' : COLORS.orange}
                fontFamily="monospace">
                {n.score.toFixed(1)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function BeamSearchTree() {
  const steps = [
    {
      title: '初始: [START]',
      content: (
        <div className="space-y-2">
          <TreeSVG step={0} />
          <p className="text-sm text-gray-600 text-center">
            从起始 token 开始，准备展开 top-{B} 个候选
          </p>
        </div>
      ),
    },
    {
      title: 'Step 1: 展开 + 剪枝',
      content: (
        <div className="space-y-2">
          <TreeSVG step={1} />
          <p className="text-sm text-gray-600 text-center">
            展开 4 个候选，保留分数最高的 <strong>B={B}</strong> 条 beam（"The" 和 "I"）
            <br />
            <span className="text-xs text-gray-400">灰色虚线 = 被剪枝的路径</span>
          </p>
        </div>
      ),
    },
    {
      title: 'Step 2: 继续展开',
      content: (
        <div className="space-y-2">
          <TreeSVG step={2} />
          <p className="text-sm text-gray-600 text-center">
            每条 beam 各展开 2 个候选（共 4 个），保留全局最优的 B={B} 条
            <br />
            <span className="text-xs">"The cat" (−1.0) 和 "I like" (−1.3) 胜出</span>
          </p>
        </div>
      ),
    },
    {
      title: 'Step 3: 最终结果',
      content: (
        <div className="space-y-2">
          <TreeSVG step={3} />
          <p className="text-sm text-gray-600 text-center">
            最终选择总分数最高的序列: <strong>"The cat sat"</strong> (score = −1.3)
            <br />
            <span className="text-xs">Beam Search 能找到比 Greedy 更优的全局序列，但计算量是 B 倍</span>
          </p>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/BeamSearchTree.tsx
git commit -m "feat: add BeamSearchTree component (sampling-and-decoding 4/4)"
```

---

### Task 11: Sampling & Decoding Article MDX

**Files:**
- Create: `src/content/articles/zh/sampling-and-decoding.mdx`

**Context:** Full article with Perplexity upfront, then all sampling strategies. Imports 4 components from Tasks 7–10.

- [ ] **Step 1: Create the MDX file**

```mdx
---
title: "Sampling & Decoding — 从概率到文本"
slug: sampling-and-decoding
locale: zh
tags: [inference, sampling, decoding, perplexity]
prerequisites: [transformer-overview]
difficulty: intermediate
created: "2026-04-02"
updated: "2026-04-02"
references:
  - type: paper
    title: "The Curious Case of Neural Text Degeneration"
    url: "https://arxiv.org/abs/1904.09751"
  - type: paper
    title: "Hierarchical Neural Story Generation"
    url: "https://arxiv.org/abs/1805.04833"
  - type: paper
    title: "Perplexity — a Measure of the Difficulty of Speech Recognition Tasks"
    url: "https://ieeexplore.ieee.org/document/1457626"
  - type: paper
    title: "Language Models are Unsupervised Multitask Learners"
    url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"
---

import PerplexityIntuition from '../../../components/interactive/PerplexityIntuition.tsx';
import TemperatureDistribution from '../../../components/interactive/TemperatureDistribution.tsx';
import SamplingStrategyComparison from '../../../components/interactive/SamplingStrategyComparison.tsx';
import BeamSearchTree from '../../../components/interactive/BeamSearchTree.tsx';

语言模型的输出是一个**概率分布** — 对词表中每个 token 的预测概率。但最终我们需要的是一段**确定的文本**。从概率分布到实际 token 的选择过程，就是 **Sampling & Decoding**。

不同的采样策略会产生截然不同的文本：确定性的 Greedy 适合代码生成，高温 Top-p 适合创意写作。而 **Perplexity（困惑度）** 则是衡量模型预测质量的核心指标 — 它告诉我们模型在每个位置"有多困惑"。

## Perplexity — 语言模型的"困惑度"

### 信息论基础

在理解 Perplexity 之前，需要两个信息论概念：

**熵（Entropy）：** 衡量随机变量的不确定性

$$
H(p) = -\sum_{x} p(x) \log_2 p(x)
$$

**交叉熵（Cross-Entropy）：** 衡量模型 $q$ 对真实分布 $p$ 的近似程度

$$
H(p, q) = -\sum_{x} p(x) \log_2 q(x)
$$

模型越好，交叉熵越低。

### Perplexity 定义

$$
\text{PPL} = 2^{H(p,q)}
$$

直觉：**模型在每个位置平均要从多少个 token 中做选择。** PPL = 1 表示完全确定（模型每次都知道下一个 token），PPL = |V|（词表大小）表示完全随机猜测。

对一段文本 $w_1, w_2, \ldots, w_N$，实际计算公式为：

$$
\text{PPL} = \exp\left(-\frac{1}{N}\sum_{i=1}^{N} \ln p(w_i | w_{<i})\right)
$$

<PerplexityIntuition client:visible />

### PPL 的局限

- **PPL 低 ≠ 生成质量高：** 模型可能通过保守的高频词获得低 PPL，但生成的文本缺乏多样性和创造力
- **不同 tokenizer 不可比较：** PPL 值依赖于词表切分方式，BPE 和 SentencePiece 的 PPL 不能直接对比
- **长度归一化重要：** 不做归一化的话，长句子的 PPL 会系统性偏高

那么，模型输出了概率分布之后，我们该如何选择下一个 token？

## Greedy Decoding

最简单的策略 — 每步选概率最高的 token：

$$
w_t = \arg\max_{w} p(w | w_{<t})
$$

**优点：** 确定性、速度快、实现简单

**问题：**
- **局部最优陷阱：** 贪心选择不一定得到全局最优序列
- **退化重复：** 容易产生 "the the the..." 之类的重复循环
- **缺乏多样性：** 同样的输入永远产生同样的输出

**适用场景：** 分类、信息提取等不需要创造性的任务。

## Temperature Scaling

在 softmax 之前对 logits 除以温度参数 $T$：

$$
p_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}
$$

- **T < 1：** 分布更尖锐 → 更确定，接近 Greedy
- **T > 1：** 分布更平坦 → 更随机，增加多样性
- **T → 0：** 退化为 Greedy；**T → ∞：** 退化为均匀分布

<TemperatureDistribution client:visible />

Temperature 与 Perplexity 的关系：T 升高 → 选择更分散 → 生成文本的 PPL 上升。

## Top-k Sampling

Fan et al. (2018) 提出只保留概率最高的 $k$ 个 token，其余概率设为 0，重新归一化后采样。

**k 的选择困境：**
- **k 太小** → 遗漏合理选项（"I ate a ___" — 可能的食物种类很多）
- **k 太大** → 包含概率极低的噪声 token

核心问题：$k$ 是**固定的**，无法适应不同上下文的确定性程度。高确定性上下文（"the capital of France is"）只需保留 1-2 个 token，而低确定性上下文需要保留更多。

## Top-p / Nucleus Sampling

Holtzman et al. (2020) 提出的解决方案 — **动态截断：**

选择最小的 token 集合 $V_p$，使得累积概率 $\sum_{w \in V_p} p(w) \geq p$。

- 确定性上下文（"the capital of France is"）→ 集合很小（1-2 个 token 就够）
- 不确定上下文（"I like to eat"）→ 集合较大（需要更多 token 才达到阈值）

<SamplingStrategyComparison client:visible />

Top-p 比 Top-k 更**自适应**，实际效果也更好。通常设 $p = 0.9 \sim 0.95$。

## Beam Search

与上面的采样策略不同，Beam Search 是一种**搜索算法**。它维护 $B$ 条候选序列（beam），每步扩展所有可能的下一 token，保留总分数最高的 $B$ 条：

$$
\text{score}(w_{1:t}) = \sum_{i=1}^{t} \log p(w_i | w_{<i})
$$

通常还会加 **length penalty** 避免偏好短序列。

<BeamSearchTree client:visible />

**优点：** 全局搜索比 Greedy 更优

**缺点：** 计算量是 Greedy 的 $B$ 倍、生成文本偏"安全"（缺乏惊喜和创造性）、不适合开放式生成

**适用场景：** 机器翻译、文本摘要等需要高准确性的任务。

## Repetition Penalty 与其他技巧

实际部署中，采样策略通常不是单独使用的：

- **Frequency Penalty：** 已生成 token 的 logit 按出现次数递减
- **Presence Penalty：** 已出现过的 token 统一减去固定值
- **Min-P Sampling：** 设定最小概率阈值，低于 $p_{min} \times p_{max}$ 的 token 被过滤

组合使用示例：Temperature + Top-p + Repetition Penalty 联合，是当前 LLM API（如 OpenAI、Anthropic）的标准配置。

## 策略选择指南

| 场景 | 推荐策略 | 参数参考 |
|------|---------|---------|
| 代码生成 | Greedy 或低温 Top-p | T=0.2, p=0.9 |
| 创意写作 | 高温 Top-p | T=0.9, p=0.95 |
| 翻译/摘要 | Beam Search | B=4, length_penalty=0.6 |
| 对话 | 中温 Top-p + Repetition | T=0.7, p=0.9, rep=1.1 |

## 总结

- **Perplexity** 衡量模型的预测质量，是评估语言模型的核心指标
- **Greedy** 简单但退化，适合确定性任务
- **Temperature** 控制分布的锐度，是其他策略的基础
- **Top-k** 固定截断，简单但不够自适应
- **Top-p** 动态截断，是当前最常用的采样策略
- **Beam Search** 全局搜索，适合翻译等精确任务
- 实际应用中通常**组合多种策略**
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds, article renders with all 4 components

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/sampling-and-decoding.mdx
git commit -m "feat: add sampling-and-decoding article with 4 interactive components"
```

---

### Task 12: Update Inference Engineering Learning Path

**Files:**
- Modify: `src/content/paths/inference-engineering.yaml`

**Context:** Add `sampling-and-decoding` (#4) and `speculative-decoding` (#5). Adding both now even though Article 3 isn't created yet — the path entry just needs the slug to exist later.

- [ ] **Step 1: Update the YAML file**

```yaml
id: inference-engineering
title:
  zh: "LLM 推理工程"
  en: "LLM Inference Engineering"
description:
  zh: "从 Prefill/Decode 到 KV Cache 再到 Flash Attention，理解大模型推理的工程优化"
  en: "Understanding engineering optimizations for LLM inference, from KV Cache to Flash Attention"
level: advanced
articles:
  - prefill-vs-decode
  - kv-cache
  - flash-attention
  - sampling-and-decoding
  - speculative-decoding
```

- [ ] **Step 2: Commit**

```bash
git add src/content/paths/inference-engineering.yaml
git commit -m "feat: add sampling-and-decoding and speculative-decoding to inference-engineering path"
```

---

## Article 3: Speculative Decoding (Tasks 13–20)

### Task 13: DraftVerifyAnimation Component

**Files:**
- Create: `src/components/interactive/DraftVerifyAnimation.tsx`

**Context:** StepNavigator with 4 steps showing the Draft-then-Verify flow. (1) Draft model generates K=4 tokens fast, (2) Target model verifies all 4 in one forward pass, (3) Rejection sampling accept/reject per position, (4) Resample from rejection point. SVG token sequence with motion animations.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/DraftVerifyAnimation.tsx
import { useMemo } from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const DRAFT_TOKENS = [
  { token: 'The', draftProb: 0.4, targetProb: 0.45, accepted: true },
  { token: 'quick', draftProb: 0.3, targetProb: 0.35, accepted: true },
  { token: 'brown', draftProb: 0.25, targetProb: 0.10, accepted: false },
  { token: 'fox', draftProb: 0.35, targetProb: 0.30, accepted: true },
];
const RESAMPLE_TOKEN = { token: 'red', prob: 0.22 };

const TOKEN_W = 80;
const TOKEN_H = 36;
const GAP = 12;
const SVG_W = 460;
const SVG_H = 160;
const START_X = 30;
const TOKEN_Y = 60;

function TokenBox({ x, y, token, color, borderColor, subtitle, delayed, opacity }: {
  x: number; y: number; token: string; color: string; borderColor: string;
  subtitle?: string; delayed?: number; opacity?: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: y + 10 }}
      animate={{ opacity: opacity ?? 1, y }}
      transition={{ duration: 0.3, delay: delayed ?? 0 }}
    >
      <rect x={x} y={y} width={TOKEN_W} height={TOKEN_H} rx={6}
        fill={color} stroke={borderColor} strokeWidth={1.5} />
      <text x={x + TOKEN_W / 2} y={y + TOKEN_H / 2 + 1}
        textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark}
        fontFamily="system-ui">{token}</text>
      {subtitle && (
        <text x={x + TOKEN_W / 2} y={y + TOKEN_H + 14}
          textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily="monospace">{subtitle}</text>
      )}
    </motion.g>
  );
}

function VerifyArrow({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <line x1={x} y1={y} x2={x + width} y2={y}
        stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#verify-arrow)" />
      <text x={x + width / 2} y={y - 6}
        textAnchor="middle" fontSize="8" fill={COLORS.primary}
        fontFamily="system-ui" fontWeight="600">
        1 forward pass 并行验证
      </text>
    </motion.g>
  );
}

export default function DraftVerifyAnimation() {
  const steps = useMemo(() => [
    {
      title: 'Draft: 小模型快速生成',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
            <defs>
              <marker id="verify-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>
            {/* Draft model label */}
            <text x={START_X} y={25} fontSize="10" fontWeight="600" fill={COLORS.orange}
              fontFamily="system-ui">Draft Model (68M) — 快速自回归</text>
            {/* Draft tokens appear one by one */}
            {DRAFT_TOKENS.map((t, i) => (
              <TokenBox key={i}
                x={START_X + i * (TOKEN_W + GAP)}
                y={TOKEN_Y}
                token={t.token}
                color={COLORS.highlight}
                borderColor={COLORS.orange}
                subtitle={`q=${t.draftProb.toFixed(2)}`}
                delayed={i * 0.2}
              />
            ))}
            {/* Sequential arrows */}
            {[0, 1, 2].map(i => (
              <motion.text key={i}
                x={START_X + TOKEN_W + i * (TOKEN_W + GAP) + GAP / 2}
                y={TOKEN_Y + TOKEN_H / 2 + 4}
                textAnchor="middle" fontSize="14" fill={COLORS.orange}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (i + 1) * 0.2 }}
              >→</motion.text>
            ))}
          </svg>
          <p className="text-sm text-gray-600 text-center">
            Draft model 自回归生成 K=4 个候选 token（速度快，但不够准确）
          </p>
        </div>
      ),
    },
    {
      title: 'Verify: 大模型一次验证',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
            <defs>
              <marker id="verify-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>
            <text x={START_X} y={20} fontSize="10" fontWeight="600" fill={COLORS.primary}
              fontFamily="system-ui">Target Model (7B) — 并行 forward pass</text>
            {/* All tokens with target probs */}
            {DRAFT_TOKENS.map((t, i) => (
              <TokenBox key={i}
                x={START_X + i * (TOKEN_W + GAP)}
                y={TOKEN_Y}
                token={t.token}
                color={COLORS.valid}
                borderColor={COLORS.primary}
                subtitle={`p=${t.targetProb.toFixed(2)}`}
                delayed={0.1}
              />
            ))}
            {/* Parallel verify arrows */}
            <VerifyArrow
              x={START_X}
              y={TOKEN_Y - 10}
              width={DRAFT_TOKENS.length * (TOKEN_W + GAP) - GAP}
            />
          </svg>
          <p className="text-sm text-gray-600 text-center">
            Target model 对 4 个候选做<strong>一次</strong> forward pass（类似 Prefill），同时获得所有位置的概率
          </p>
        </div>
      ),
    },
    {
      title: 'Rejection Sampling',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H + 20}`} className="w-full">
            {/* Tokens with accept/reject */}
            {DRAFT_TOKENS.map((t, i) => {
              const accepted = t.accepted;
              return (
                <motion.g key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.25 }}
                >
                  <rect
                    x={START_X + i * (TOKEN_W + GAP)}
                    y={TOKEN_Y}
                    width={TOKEN_W}
                    height={TOKEN_H}
                    rx={6}
                    fill={accepted ? '#dcfce7' : '#fee2e2'}
                    stroke={accepted ? COLORS.green : COLORS.red}
                    strokeWidth={2}
                  />
                  <text
                    x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                    y={TOKEN_Y + TOKEN_H / 2 + 1}
                    textAnchor="middle" fontSize="12" fontWeight="600"
                    fill={COLORS.dark} fontFamily="system-ui">
                    {t.token}
                  </text>
                  {/* Accept/Reject marker */}
                  <text
                    x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                    y={TOKEN_Y - 8}
                    textAnchor="middle" fontSize="16"
                    fill={accepted ? COLORS.green : COLORS.red}>
                    {accepted ? '✓' : '✗'}
                  </text>
                  {/* Probability comparison */}
                  <text
                    x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                    y={TOKEN_Y + TOKEN_H + 14}
                    textAnchor="middle" fontSize="7" fill={COLORS.mid}
                    fontFamily="monospace">
                    q={t.draftProb} {accepted ? '≤' : '>'} p={t.targetProb}
                  </text>
                </motion.g>
              );
            })}
            {/* Explanation */}
            <text x={SVG_W / 2} y={SVG_H + 12} textAnchor="middle" fontSize="9" fill={COLORS.mid}
              fontFamily="system-ui">
              q(x) ≤ p(x) → 接受 | q(x) {'>'} p(x) → 以 1−p/q 概率拒绝
            </text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            逐位置比较 draft 概率 q 和 target 概率 p — "brown" 在位置 3 被拒绝
          </p>
        </div>
      ),
    },
    {
      title: '重新采样 + 最终序列',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
            {/* Final sequence */}
            {['The', 'quick', RESAMPLE_TOKEN.token].map((token, i) => {
              const isResampled = i === 2;
              return (
                <motion.g key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <rect
                    x={START_X + i * (TOKEN_W + GAP)}
                    y={TOKEN_Y}
                    width={TOKEN_W}
                    height={TOKEN_H}
                    rx={6}
                    fill={isResampled ? '#fef3c7' : '#dcfce7'}
                    stroke={isResampled ? COLORS.orange : COLORS.green}
                    strokeWidth={2}
                  />
                  <text
                    x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                    y={TOKEN_Y + TOKEN_H / 2 + 1}
                    textAnchor="middle" fontSize="12" fontWeight="600"
                    fill={COLORS.dark} fontFamily="system-ui">
                    {token}
                  </text>
                  {isResampled && (
                    <text x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                      y={TOKEN_Y - 8}
                      textAnchor="middle" fontSize="8" fill={COLORS.orange}
                      fontFamily="system-ui" fontWeight="600">
                      重新采样
                    </text>
                  )}
                </motion.g>
              );
            })}
            {/* Result annotation */}
            <motion.text x={SVG_W / 2} y={TOKEN_Y + TOKEN_H + 30}
              textAnchor="middle" fontSize="10" fill={COLORS.green}
              fontWeight="600" fontFamily="system-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              本轮产出 3 个有效 token（2 accepted + 1 resampled）
            </motion.text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            从拒绝位置用修正分布 norm(max(0, p−q)) 重新采样 → <strong>最终分布与只用大模型完全一致</strong>
          </p>
        </div>
      ),
    },
  ], []);

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/DraftVerifyAnimation.tsx
git commit -m "feat: add DraftVerifyAnimation component (speculative-decoding 1/6)"
```

---

### Task 14: AcceptanceRateCalculator Component

**Files:**
- Create: `src/components/interactive/AcceptanceRateCalculator.tsx`

**Context:** Two sliders for acceptance rate α (0.5–0.99) and draft length K (1–10). Shows expected tokens formula (1−α^(K+1))/(1−α), line chart with x=K, y=expected tokens, multiple α curves.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/AcceptanceRateCalculator.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, HEAD_COLORS } from './shared/colors';

function expectedTokens(alpha: number, K: number): number {
  if (Math.abs(alpha - 1) < 1e-9) return K + 1;
  return (1 - Math.pow(alpha, K + 1)) / (1 - alpha);
}

const ALPHA_CURVES = [0.5, 0.7, 0.8, 0.9, 0.95];
const MAX_K = 10;

export default function AcceptanceRateCalculator() {
  const [alpha, setAlpha] = useState(0.8);
  const [K, setK] = useState(5);
  const expected = expectedTokens(alpha, K);
  const speedup = expected; // simplified: speedup ≈ expected tokens per round

  // Chart dimensions
  const svgW = 440;
  const svgH = 200;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const maxY = 12; // max expected tokens on y-axis
  const toX = (k: number) => padL + (k / MAX_K) * chartW;
  const toY = (val: number) => padT + chartH - (val / maxY) * chartH;

  const curves = useMemo(() => {
    return ALPHA_CURVES.map((a, ci) => {
      const points = Array.from({ length: MAX_K }, (_, i) => {
        const k = i + 1;
        return { x: toX(k), y: toY(expectedTokens(a, k)) };
      });
      const pathD = points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      return { alpha: a, pathD, color: HEAD_COLORS[ci], points };
    });
  }, []);

  // Current point
  const curX = toX(K);
  const curY = toY(expected);

  return (
    <div className="space-y-3">
      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            α (acceptance rate): <span className="font-mono font-bold" style={{ color: COLORS.primary }}>{alpha.toFixed(2)}</span>
          </label>
          <input type="range" min={0.5} max={0.99} step={0.01} value={alpha}
            onChange={e => setAlpha(parseFloat(e.target.value))} className="flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            K (draft length): <span className="font-mono font-bold" style={{ color: COLORS.orange }}>{K}</span>
          </label>
          <input type="range" min={1} max={10} step={1} value={K}
            onChange={e => setK(parseInt(e.target.value))} className="flex-1" />
        </div>
      </div>

      {/* Result */}
      <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
        <div className="text-xs text-gray-500">期望每轮生成 token 数</div>
        <div className="text-xl font-bold font-mono" style={{ color: COLORS.primary }}>
          {expected.toFixed(2)} tokens
        </div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">
          (1 − {alpha.toFixed(2)}^{K + 1}) / (1 − {alpha.toFixed(2)}) = {expected.toFixed(2)}
        </div>
      </div>

      {/* Chart */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {/* Grid */}
          {[2, 4, 6, 8, 10].map(v => (
            <g key={v}>
              <line x1={padL} y1={toY(v)} x2={svgW - padR} y2={toY(v)}
                stroke="#f3f4f6" strokeWidth={1} />
              <text x={padL - 4} y={toY(v) + 3} textAnchor="end" fontSize="8"
                fill={COLORS.mid} fontFamily="monospace">{v}</text>
            </g>
          ))}
          {/* X axis ticks */}
          {Array.from({ length: MAX_K }, (_, i) => i + 1).map(k => (
            <text key={k} x={toX(k)} y={svgH - 8} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily="monospace">{k}</text>
          ))}
          {/* Axis labels */}
          <text x={svgW / 2} y={svgH - 0} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily="system-ui">K (draft length)</text>
          <text x={8} y={svgH / 2} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily="system-ui"
            transform={`rotate(-90, 8, ${svgH / 2})`}>Expected Tokens</text>

          {/* Curves */}
          {curves.map(c => (
            <g key={c.alpha}>
              <path d={c.pathD} fill="none" stroke={c.color} strokeWidth={1.5}
                opacity={Math.abs(c.alpha - alpha) < 0.06 ? 1 : 0.3} />
              <text x={c.points[c.points.length - 1].x + 4}
                y={c.points[c.points.length - 1].y + 3}
                fontSize="7" fill={c.color} fontFamily="monospace"
                opacity={Math.abs(c.alpha - alpha) < 0.06 ? 1 : 0.5}>
                α={c.alpha}
              </text>
            </g>
          ))}

          {/* Current point */}
          <motion.circle
            cx={curX} cy={curY} r={5}
            fill={COLORS.primary} stroke="white" strokeWidth={2}
            animate={{ cx: curX, cy: curY }}
            transition={{ duration: 0.2 }}
          />
          {/* Crosshair */}
          <motion.line x1={curX} y1={padT} x2={curX} y2={padT + chartH}
            stroke={COLORS.primary} strokeWidth={0.5} strokeDasharray="3,3" opacity={0.4}
            animate={{ x1: curX, x2: curX }}
            transition={{ duration: 0.2 }}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {ALPHA_CURVES.map((a, i) => (
          <div key={a} className="flex items-center gap-1 text-[10px]">
            <div className="w-3 h-0.5" style={{ backgroundColor: HEAD_COLORS[i] }} />
            <span className="font-mono" style={{ color: HEAD_COLORS[i] }}>α={a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/AcceptanceRateCalculator.tsx
git commit -m "feat: add AcceptanceRateCalculator component (speculative-decoding 2/6)"
```

---

### Task 15: MedusaTreeViz Component

**Files:**
- Create: `src/components/interactive/MedusaTreeViz.tsx`

**Context:** Visualizes Medusa's multi-head prediction tree. Root = current token, Head 1 produces top-2 candidates, each branches to Head 2 top-2, forming a tree. Click "Verify" button to animate tree attention checking, rejected branches turn gray.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/MedusaTreeViz.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, HEAD_COLORS } from './shared/colors';

interface TreeNode {
  id: string;
  token: string;
  head: number; // 0=root, 1=head1, 2=head2
  conf: number;
  children: string[];
  accepted?: boolean;
}

const TREE: Record<string, TreeNode> = {
  root: { id: 'root', token: 'cat', head: 0, conf: 1.0, children: ['h1-0', 'h1-1'] },
  'h1-0': { id: 'h1-0', token: 'sat', head: 1, conf: 0.72, children: ['h2-00', 'h2-01'] },
  'h1-1': { id: 'h1-1', token: 'is', head: 1, conf: 0.61, children: ['h2-10', 'h2-11'] },
  'h2-00': { id: 'h2-00', token: 'on', head: 2, conf: 0.68, children: [] },
  'h2-01': { id: 'h2-01', token: 'by', head: 2, conf: 0.31, children: [] },
  'h2-10': { id: 'h2-10', token: 'a', head: 2, conf: 0.55, children: [] },
  'h2-11': { id: 'h2-11', token: 'very', head: 2, conf: 0.22, children: [] },
};

// Acceptance results: longest accepted path is root → h1-0 → h2-00
const ACCEPTED_IDS = new Set(['root', 'h1-0', 'h2-00']);

const POSITIONS: Record<string, { x: number; y: number }> = {
  root: { x: 50, y: 110 },
  'h1-0': { x: 170, y: 60 },
  'h1-1': { x: 170, y: 160 },
  'h2-00': { x: 300, y: 30 },
  'h2-01': { x: 300, y: 90 },
  'h2-10': { x: 300, y: 130 },
  'h2-11': { x: 300, y: 190 },
};

const SVG_W = 420;
const SVG_H = 220;
const NODE_W = 56;
const NODE_H = 28;

const HEAD_LABELS = ['Current', 'Head 1', 'Head 2'];
const HEAD_LABEL_COLORS = [COLORS.dark, HEAD_COLORS[0], HEAD_COLORS[1]];

export default function MedusaTreeViz() {
  const [verified, setVerified] = useState(false);

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
  }, []);

  return (
    <div className="space-y-3">
      {/* Head labels */}
      <div className="flex items-center justify-center gap-4">
        {HEAD_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded" style={{
              backgroundColor: `${HEAD_LABEL_COLORS[i]}20`,
              border: `1.5px solid ${HEAD_LABEL_COLORS[i]}`,
            }} />
            <span style={{ color: HEAD_LABEL_COLORS[i] }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          {/* Edges */}
          {Object.values(TREE).flatMap(node =>
            node.children.map(childId => {
              const from = POSITIONS[node.id];
              const to = POSITIONS[childId];
              const isAccepted = verified && ACCEPTED_IDS.has(node.id) && ACCEPTED_IDS.has(childId);
              const isRejected = verified && !isAccepted;
              return (
                <motion.line
                  key={`${node.id}-${childId}`}
                  x1={from.x + NODE_W / 2} y1={from.y}
                  x2={to.x - NODE_W / 2 + 10} y2={to.y}
                  stroke={isRejected ? '#d1d5db' : isAccepted ? COLORS.green : COLORS.primary}
                  strokeWidth={isAccepted ? 2.5 : isRejected ? 1 : 1.5}
                  strokeDasharray={isRejected ? '4,3' : 'none'}
                  animate={{
                    stroke: isRejected ? '#d1d5db' : isAccepted ? COLORS.green : COLORS.primary,
                    strokeWidth: isAccepted ? 2.5 : isRejected ? 1 : 1.5,
                  }}
                  transition={{ duration: 0.4 }}
                />
              );
            })
          )}

          {/* Nodes */}
          {Object.values(TREE).map(node => {
            const pos = POSITIONS[node.id];
            const isAccepted = verified && ACCEPTED_IDS.has(node.id);
            const isRejected = verified && !ACCEPTED_IDS.has(node.id);
            const headColor = HEAD_LABEL_COLORS[node.head];

            return (
              <motion.g key={node.id}
                animate={{
                  opacity: isRejected ? 0.35 : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                <rect
                  x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2}
                  width={NODE_W} height={NODE_H}
                  rx={6}
                  fill={isAccepted ? '#dcfce7' : isRejected ? '#f9fafb' : `${headColor}12`}
                  stroke={isAccepted ? COLORS.green : isRejected ? '#d1d5db' : headColor}
                  strokeWidth={isAccepted ? 2 : 1.5}
                />
                <text x={pos.x} y={pos.y + 1}
                  textAnchor="middle" fontSize="11" fontWeight="600"
                  fill={isRejected ? COLORS.mid : COLORS.dark} fontFamily="system-ui">
                  {node.token}
                </text>
                <text x={pos.x} y={pos.y + NODE_H / 2 + 12}
                  textAnchor="middle" fontSize="7"
                  fill={isRejected ? '#d1d5db' : COLORS.mid} fontFamily="monospace">
                  conf: {node.conf.toFixed(2)}
                </text>
                {/* Accept/reject marker */}
                {verified && (
                  <motion.text
                    x={pos.x + NODE_W / 2 - 2} y={pos.y - NODE_H / 2 + 2}
                    textAnchor="middle" fontSize="12"
                    fill={isAccepted ? COLORS.green : COLORS.red}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isAccepted ? '✓' : '✗'}
                  </motion.text>
                )}
              </motion.g>
            );
          })}

          {/* Accepted path label */}
          {verified && (
            <motion.text
              x={SVG_W / 2} y={SVG_H - 4}
              textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.green}
              fontFamily="system-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              最长接受路径: cat → sat → on（3 tokens）
            </motion.text>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!verified ? (
          <button onClick={handleVerify}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Tree Attention 验证
          </button>
        ) : (
          <button onClick={handleReset}
            className="px-4 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
            重置
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 text-center">
        Medusa 的多个 head 组合成候选树，Tree Attention 一次验证所有路径，选择最长被接受分支
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MedusaTreeViz.tsx
git commit -m "feat: add MedusaTreeViz component (speculative-decoding 3/6)"
```

---

### Task 16: MTPTrainInferBridge Component

**Files:**
- Create: `src/components/interactive/MTPTrainInferBridge.tsx`

**Context:** Side-by-side architecture comparison — left "Training" vs right "Inference". Shows shared backbone with multiple prediction heads. Dashed arrows connect corresponding heads between train and infer. Hover highlights connected heads.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/MTPTrainInferBridge.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, HEAD_COLORS } from './shared/colors';

const HEADS = [
  { label: 'Head 1', desc: 'next token', trainTarget: 'Loss₁ (next)', inferRole: 'Verify (target)' },
  { label: 'Head 2', desc: 'next+1 token', trainTarget: 'Loss₂ (next+1)', inferRole: 'Draft token 1' },
  { label: 'Head 3', desc: 'next+2 token', trainTarget: 'Loss₃ (next+2)', inferRole: 'Draft token 2' },
];

const SVG_W = 480;
const SVG_H = 280;
const HALF_W = SVG_W / 2;

// Layout constants
const BACKBONE_W = 70;
const BACKBONE_H = 100;
const HEAD_W = 50;
const HEAD_H = 24;
const HEAD_GAP = 36;

export default function MTPTrainInferBridge() {
  const [hoveredHead, setHoveredHead] = useState<number | null>(null);

  // Positions for left (train) and right (infer) sides
  const leftBackbone = { x: HALF_W / 2 - BACKBONE_W / 2, y: SVG_H - BACKBONE_H - 30 };
  const rightBackbone = { x: HALF_W + HALF_W / 2 - BACKBONE_W / 2, y: SVG_H - BACKBONE_H - 30 };

  const headY = (i: number) => leftBackbone.y - 30 - i * HEAD_GAP;

  return (
    <div className="space-y-2">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          {/* Center divider */}
          <line x1={HALF_W} y1={10} x2={HALF_W} y2={SVG_H - 10}
            stroke="#e5e7eb" strokeWidth={1} strokeDasharray="6,4" />

          {/* Side labels */}
          <text x={HALF_W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.primary} fontFamily="system-ui">训练时</text>
          <text x={HALF_W + HALF_W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.green} fontFamily="system-ui">推理时</text>

          {/* Left backbone */}
          <rect x={leftBackbone.x} y={leftBackbone.y} width={BACKBONE_W} height={BACKBONE_H}
            rx={8} fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={leftBackbone.x + BACKBONE_W / 2} y={leftBackbone.y + BACKBONE_H / 2 - 6}
            textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.primary} fontFamily="system-ui">
            Backbone
          </text>
          <text x={leftBackbone.x + BACKBONE_W / 2} y={leftBackbone.y + BACKBONE_H / 2 + 8}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            (共享)
          </text>
          {/* Input arrow */}
          <text x={leftBackbone.x + BACKBONE_W / 2} y={SVG_H - 10}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            Input Tokens
          </text>
          <line x1={leftBackbone.x + BACKBONE_W / 2} y1={SVG_H - 14}
            x2={leftBackbone.x + BACKBONE_W / 2} y2={leftBackbone.y + BACKBONE_H}
            stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mtp-arrow)" />

          {/* Right backbone */}
          <rect x={rightBackbone.x} y={rightBackbone.y} width={BACKBONE_W} height={BACKBONE_H}
            rx={8} fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={rightBackbone.x + BACKBONE_W / 2} y={rightBackbone.y + BACKBONE_H / 2 - 6}
            textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.green} fontFamily="system-ui">
            Backbone
          </text>
          <text x={rightBackbone.x + BACKBONE_W / 2} y={rightBackbone.y + BACKBONE_H / 2 + 8}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            (同一个)
          </text>
          <text x={rightBackbone.x + BACKBONE_W / 2} y={SVG_H - 10}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            Input Tokens
          </text>
          <line x1={rightBackbone.x + BACKBONE_W / 2} y1={SVG_H - 14}
            x2={rightBackbone.x + BACKBONE_W / 2} y2={rightBackbone.y + BACKBONE_H}
            stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mtp-arrow)" />

          <defs>
            <marker id="mtp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* Heads — left and right */}
          {HEADS.map((head, i) => {
            const y = headY(i);
            const isHovered = hoveredHead === i;
            const leftX = leftBackbone.x + BACKBONE_W / 2 - HEAD_W / 2;
            const rightX = rightBackbone.x + BACKBONE_W / 2 - HEAD_W / 2;
            const color = HEAD_COLORS[i];

            return (
              <g key={i}
                onMouseEnter={() => setHoveredHead(i)}
                onMouseLeave={() => setHoveredHead(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Left head */}
                <motion.rect x={leftX} y={y} width={HEAD_W} height={HEAD_H}
                  rx={4}
                  fill={isHovered ? `${color}30` : `${color}15`}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  animate={{ strokeWidth: isHovered ? 2 : 1 }}
                />
                <text x={leftX + HEAD_W / 2} y={y + HEAD_H / 2 + 3}
                  textAnchor="middle" fontSize="8" fontWeight="600" fill={color}
                  fontFamily="system-ui">{head.label}</text>
                {/* Left target */}
                <text x={leftX - 6} y={y + HEAD_H / 2 + 3}
                  textAnchor="end" fontSize="7" fill={isHovered ? color : COLORS.mid}
                  fontFamily="system-ui">{head.trainTarget}</text>
                {/* Connection line from backbone */}
                <line x1={leftBackbone.x + BACKBONE_W / 2} y1={leftBackbone.y}
                  x2={leftX + HEAD_W / 2} y2={y + HEAD_H}
                  stroke={color} strokeWidth={isHovered ? 1.5 : 0.8} opacity={0.5} />

                {/* Right head */}
                <motion.rect x={rightX} y={y} width={HEAD_W} height={HEAD_H}
                  rx={4}
                  fill={isHovered ? `${color}30` : `${color}15`}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  animate={{ strokeWidth: isHovered ? 2 : 1 }}
                />
                <text x={rightX + HEAD_W / 2} y={y + HEAD_H / 2 + 3}
                  textAnchor="middle" fontSize="8" fontWeight="600" fill={color}
                  fontFamily="system-ui">{head.label}</text>
                {/* Right role */}
                <text x={rightX + HEAD_W + 6} y={y + HEAD_H / 2 + 3}
                  textAnchor="start" fontSize="7" fill={isHovered ? color : COLORS.mid}
                  fontFamily="system-ui">{head.inferRole}</text>
                {/* Connection line from backbone */}
                <line x1={rightBackbone.x + BACKBONE_W / 2} y1={rightBackbone.y}
                  x2={rightX + HEAD_W / 2} y2={y + HEAD_H}
                  stroke={color} strokeWidth={isHovered ? 1.5 : 0.8} opacity={0.5} />

                {/* Bridge dashed arrow */}
                <motion.line
                  x1={leftX + HEAD_W} y1={y + HEAD_H / 2}
                  x2={rightX} y2={y + HEAD_H / 2}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeDasharray="4,3"
                  opacity={isHovered ? 0.9 : 0.3}
                  animate={{ opacity: isHovered ? 0.9 : 0.3 }}
                />
                {isHovered && (
                  <motion.text
                    x={HALF_W} y={y + HEAD_H / 2 - 6}
                    textAnchor="middle" fontSize="7" fill={color}
                    fontFamily="system-ui" fontWeight="600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    训练的头 = 推理的 drafter
                  </motion.text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-gray-500 text-center">
        <strong>MTP 核心:</strong> 训练时联合优化的多个预测头 → 推理时直接复用做 speculative draft
        <br />
        与 Medusa 不同: heads 和 backbone 一起训练，预测质量更高
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MTPTrainInferBridge.tsx
git commit -m "feat: add MTPTrainInferBridge component (speculative-decoding 4/6)"
```

---

### Task 17: EagleArchitecture Component

**Files:**
- Create: `src/components/interactive/EagleArchitecture.tsx`

**Context:** Two-row comparison — top "Traditional Draft Model" vs bottom "Eagle". Traditional: token embedding → small model → draft tokens (thin arrow = little info). Eagle: hidden states → lightweight decoder → draft tokens (thick arrow = rich info). Hover toggles highlighting different info flow paths.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/EagleArchitecture.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS } from './shared/colors';

const SVG_W = 480;
const SVG_H = 260;
const ROW_H = 100;
const ROW_GAP = 40;
const TOP_Y = 20;
const BOT_Y = TOP_Y + ROW_H + ROW_GAP;

const BOX_H = 36;
const BOX_RX = 6;

export default function EagleArchitecture() {
  const [hovered, setHovered] = useState<'traditional' | 'eagle' | null>(null);

  const traditionalOpacity = hovered === 'eagle' ? 0.3 : 1;
  const eagleOpacity = hovered === 'traditional' ? 0.3 : 1;

  return (
    <div className="space-y-2">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          <defs>
            <marker id="eagle-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
            <marker id="eagle-arrow-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
            </marker>
          </defs>

          {/* ===== Traditional Draft Model (top) ===== */}
          <motion.g
            onMouseEnter={() => setHovered('traditional')}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
            animate={{ opacity: traditionalOpacity }}
          >
            {/* Label */}
            <text x={10} y={TOP_Y + 10} fontSize="10" fontWeight="700" fill={COLORS.orange}
              fontFamily="system-ui">传统 Draft Model</text>

            {/* Token Embedding box */}
            <rect x={30} y={TOP_Y + 25} width={90} height={BOX_H} rx={BOX_RX}
              fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={75} y={TOP_Y + 25 + BOX_H / 2 - 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.orange} fontFamily="system-ui">Token</text>
            <text x={75} y={TOP_Y + 25 + BOX_H / 2 + 6} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.orange} fontFamily="system-ui">Embedding</text>

            {/* Thin arrow → */}
            <line x1={125} y1={TOP_Y + 25 + BOX_H / 2} x2={175} y2={TOP_Y + 25 + BOX_H / 2}
              stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#eagle-arrow)" />
            <text x={150} y={TOP_Y + 20} textAnchor="middle" fontSize="7" fill={COLORS.orange}
              fontFamily="system-ui">信息少 ↓</text>

            {/* Small Model box */}
            <rect x={180} y={TOP_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={230} y={TOP_Y + 25 + BOX_H / 2 - 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.orange} fontFamily="system-ui">小模型 (68M)</text>
            <text x={230} y={TOP_Y + 25 + BOX_H / 2 + 6} textAnchor="middle" fontSize="7"
              fill={COLORS.mid} fontFamily="system-ui">独立参数</text>

            {/* Arrow → */}
            <line x1={285} y1={TOP_Y + 25 + BOX_H / 2} x2={335} y2={TOP_Y + 25 + BOX_H / 2}
              stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#eagle-arrow)" />

            {/* Draft Tokens */}
            <rect x={340} y={TOP_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={390} y={TOP_Y + 25 + BOX_H / 2 + 3} textAnchor="middle" fontSize="9"
              fontWeight="600" fill={COLORS.orange} fontFamily="system-ui">Draft Tokens</text>
          </motion.g>

          {/* ===== Divider ===== */}
          <line x1={20} y1={TOP_Y + ROW_H + ROW_GAP / 2} x2={SVG_W - 20} y2={TOP_Y + ROW_H + ROW_GAP / 2}
            stroke="#e5e7eb" strokeWidth={1} strokeDasharray="6,4" />
          <text x={SVG_W / 2} y={TOP_Y + ROW_H + ROW_GAP / 2 - 5} textAnchor="middle" fontSize="8"
            fill={COLORS.mid} fontFamily="system-ui">vs</text>

          {/* ===== Eagle (bottom) ===== */}
          <motion.g
            onMouseEnter={() => setHovered('eagle')}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
            animate={{ opacity: eagleOpacity }}
          >
            {/* Label */}
            <text x={10} y={BOT_Y + 10} fontSize="10" fontWeight="700" fill={COLORS.green}
              fontFamily="system-ui">Eagle — Feature-Level Drafting</text>

            {/* Hidden States box */}
            <rect x={30} y={BOT_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={80} y={BOT_Y + 25 + BOX_H / 2 - 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.green} fontFamily="system-ui">Hidden States</text>
            <text x={80} y={BOT_Y + 25 + BOX_H / 2 + 6} textAnchor="middle" fontSize="7"
              fill={COLORS.mid} fontFamily="system-ui">Target 最后一层</text>

            {/* THICK arrow → (rich info) */}
            <line x1={135} y1={BOT_Y + 25 + BOX_H / 2} x2={175} y2={BOT_Y + 25 + BOX_H / 2}
              stroke={COLORS.green} strokeWidth={4} markerEnd="url(#eagle-arrow-green)" />
            <text x={155} y={BOT_Y + 20} textAnchor="middle" fontSize="7" fill={COLORS.green}
              fontWeight="600" fontFamily="system-ui">信息丰富 ↑</text>

            {/* Lightweight Decoder box */}
            <rect x={180} y={BOT_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#f0fdf4" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={230} y={BOT_Y + 25 + BOX_H / 2 - 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.green} fontFamily="system-ui">轻量 Decoder</text>
            <text x={230} y={BOT_Y + 25 + BOX_H / 2 + 6} textAnchor="middle" fontSize="7"
              fill={COLORS.mid} fontFamily="system-ui">1 层</text>

            {/* Arrow → */}
            <line x1={285} y1={BOT_Y + 25 + BOX_H / 2} x2={335} y2={BOT_Y + 25 + BOX_H / 2}
              stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#eagle-arrow-green)" />

            {/* Draft Tokens */}
            <rect x={340} y={BOT_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={390} y={BOT_Y + 25 + BOX_H / 2 + 3} textAnchor="middle" fontSize="9"
              fontWeight="600" fill={COLORS.green} fontFamily="system-ui">Draft Tokens</text>
          </motion.g>

          {/* Info comparison annotation */}
          <text x={SVG_W / 2} y={SVG_H - 6} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily="system-ui">
            Hidden state 包含完整上下文语义 → Eagle 的 acceptance rate 比 Medusa 高 ~10-15%
          </text>
        </svg>
      </div>

      <p className="text-xs text-gray-500 text-center">
        <strong>关键洞察:</strong> Token embedding 只有 token 本身的信息，而 hidden state 编码了完整上下文、语义关系、语法模式
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/EagleArchitecture.tsx
git commit -m "feat: add EagleArchitecture component (speculative-decoding 5/6)"
```

---

### Task 18: SpecMethodComparison Component

**Files:**
- Create: `src/components/interactive/SpecMethodComparison.tsx`

**Context:** Interactive comparison table for 5 speculative decoding methods: Draft-then-Verify, Medusa, MTP, Eagle, Lookahead. Same interaction pattern as EncodingComparison (Task 4) — hover highlights row, click expands summary.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/interactive/SpecMethodComparison.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

interface SpecMethod {
  name: string;
  extraParams: string;
  trainingCost: string;
  trainingLevel: 'none' | 'low' | 'medium' | 'high';
  speedup: string;
  useCase: string;
  summary: string;
}

const METHODS: SpecMethod[] = [
  {
    name: 'Draft-then-Verify',
    extraParams: '独立 draft model',
    trainingCost: '需训练 draft',
    trainingLevel: 'high',
    speedup: '2-3x',
    useCase: '有配套小模型',
    summary: '经典方案：小模型自回归 draft，大模型一次验证，通过 rejection sampling 保证分布一致性',
  },
  {
    name: 'Medusa',
    extraParams: '多个轻量 head',
    trainingCost: '低',
    trainingLevel: 'low',
    speedup: '2-3x',
    useCase: '快速部署',
    summary: '在 target model 最后一层加多个预测 head，冻结主模型只训 head，用 tree attention 验证',
  },
  {
    name: 'MTP',
    extraParams: '训练时内置',
    trainingCost: '高（预训练）',
    trainingLevel: 'high',
    speedup: '2-3x',
    useCase: '从头训新模型',
    summary: '训练时联合优化多个预测头，推理时直接复用做 draft — 头和 backbone 一起训练，预测质量最高',
  },
  {
    name: 'Eagle',
    extraParams: '轻量 decoder',
    trainingCost: '低',
    trainingLevel: 'low',
    speedup: '3-4x',
    useCase: '追求最高加速比',
    summary: '用 target model 的 hidden state（而非 token embedding）做 draft，信息量远大于 token 级别 → 最高 acceptance rate',
  },
  {
    name: 'Lookahead',
    extraParams: '无',
    trainingCost: '零',
    trainingLevel: 'none',
    speedup: '1.5-2x',
    useCase: '即插即用',
    summary: '基于 Jacobi 迭代，同时猜测多个位置并行验证，不需要任何额外模型或训练 — 但加速比较低',
  },
];

const TRAINING_COLORS: Record<string, string> = {
  none: COLORS.green,
  low: '#2196f3',
  medium: COLORS.orange,
  high: COLORS.red,
};

export default function SpecMethodComparison() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {['方法', '额外参数', '训练成本', '加速比', '适用场景'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METHODS.map((m, i) => (
            <tr key={m.name}>
              <td colSpan={5} className="p-0">
                <div
                  className="cursor-pointer transition-colors"
                  style={{
                    backgroundColor: hovered === i ? COLORS.highlight : expanded === i ? '#f0f7ff' : 'transparent',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="grid grid-cols-5 px-3 py-2.5 items-center border-b border-gray-100">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <span className="text-xs text-gray-400">{expanded === i ? '▼' : '▶'}</span>
                      {m.name}
                    </div>
                    <div className="text-gray-600 text-xs">{m.extraParams}</div>
                    <div>
                      <span className="font-medium" style={{ color: TRAINING_COLORS[m.trainingLevel] }}>
                        {m.trainingCost}
                      </span>
                    </div>
                    <div className="font-mono font-bold" style={{ color: COLORS.primary }}>{m.speedup}</div>
                    <div className="text-gray-600 text-xs">{m.useCase}</div>
                  </div>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border-b border-gray-100">
                          💡 {m.summary}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SpecMethodComparison.tsx
git commit -m "feat: add SpecMethodComparison component (speculative-decoding 6/6)"
```

---

### Task 19: Speculative Decoding Article MDX

**Files:**
- Create: `src/content/articles/zh/speculative-decoding.mdx`

**Context:** Full article covering Draft-then-Verify, Medusa, MTP, Eagle, Lookahead with 6 interactive components. Follows spec section 4.1 content structure.

- [ ] **Step 1: Create the MDX file**

```mdx
---
title: "Speculative Decoding — 猜测式解码加速"
slug: speculative-decoding
locale: zh
tags: [inference, optimization, speculative-decoding]
prerequisites: [sampling-and-decoding, prefill-vs-decode]
difficulty: advanced
created: "2026-04-02"
updated: "2026-04-02"
references:
  - type: paper
    title: "Fast Inference from Transformers via Speculative Decoding"
    url: "https://arxiv.org/abs/2211.17192"
  - type: paper
    title: "Accelerating Large Language Model Decoding with Speculative Sampling"
    url: "https://arxiv.org/abs/2302.01318"
  - type: paper
    title: "Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads"
    url: "https://arxiv.org/abs/2401.10774"
  - type: paper
    title: "Better & Faster Large Language Models via Multi-Token Prediction"
    url: "https://arxiv.org/abs/2404.19737"
  - type: paper
    title: "EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty"
    url: "https://arxiv.org/abs/2401.15077"
  - type: paper
    title: "EAGLE-2: Faster Inference of Language Models with Dynamic Draft Trees"
    url: "https://arxiv.org/abs/2406.16858"
  - type: paper
    title: "Break the Sequential Dependency of LLM Inference Using Lookahead Decoding"
    url: "https://arxiv.org/abs/2402.02057"
  - type: website
    title: "DeepSeek-V3 Technical Report"
    url: "https://arxiv.org/abs/2412.19437"
---

import DraftVerifyAnimation from '../../../components/interactive/DraftVerifyAnimation.tsx';
import AcceptanceRateCalculator from '../../../components/interactive/AcceptanceRateCalculator.tsx';
import MedusaTreeViz from '../../../components/interactive/MedusaTreeViz.tsx';
import MTPTrainInferBridge from '../../../components/interactive/MTPTrainInferBridge.tsx';
import EagleArchitecture from '../../../components/interactive/EagleArchitecture.tsx';
import SpecMethodComparison from '../../../components/interactive/SpecMethodComparison.tsx';

LLM 推理的 Decode 阶段是 **memory-bound** 的 — 每步只生成 1 个 token，GPU 算力大量空闲。自回归生成的核心瓶颈在于**顺序依赖**：每个 token 的生成都依赖前一个 token 的结果。

Speculative Decoding（猜测式解码）的核心思路是：**用一个快速但不那么准确的方法"猜测"多个未来 token，然后让目标大模型一次性并行验证这些猜测。** 如果猜对了，一轮就能产出多个 token；猜错了，从错误位置重新采样 — 而且可以保证最终输出分布和只用大模型生成**完全一致**。

## 动机 — 为什么 Decode 很慢

回顾 prefill-vs-decode 的结论：

- **Prefill 阶段：** 并行处理所有 prompt token，是 **compute-bound**（GPU 算力充分利用）
- **Decode 阶段：** 逐 token 生成，每步执行 GEMV（矩阵-向量乘法），是 **memory-bound**

Decode 的每次 forward pass 都需要把整个模型权重从 HBM 加载到计算单元，但只做很少的计算（一个 token 的 GEMV）。GPU 的算力利用率极低。

核心问题：能否"批量"生成 token？直接批量不行（因为自回归依赖），但可以**先猜后验** — 这就是 Speculative Decoding。

## Draft-then-Verify — 经典方案

### Draft 阶段

使用一个参数量小得多的 **draft model**（例如 7B 目标模型配一个 68M 的小模型），自回归生成 $K$ 个候选 token。小模型速度快但不够准确。

### Verify 阶段

目标大模型对 $K$ 个候选 token 做**一次 forward pass** — 这就像 Prefill 阶段一样是并行的，一次性获得所有 $K$ 个位置的概率分布。

<DraftVerifyAnimation client:visible />

### Rejection Sampling — 保证分布一致性

这是 Speculative Decoding 最精妙的部分 — 通过 rejection sampling 保证输出分布与只用大模型生成**完全一致**：

对每个位置 $i$，比较 draft 概率 $q(x_i)$ 和 target 概率 $p(x_i)$：

- 如果 $q(x) \leq p(x)$：**接受** — draft 的保守猜测是安全的
- 如果 $q(x) > p(x)$：以概率 $1 - p(x)/q(x)$ **拒绝**

被拒绝后，从修正分布 $\text{norm}(\max(0, p(x) - q(x)))$ 重新采样 1 个 token。

**关键保证：** 无论 draft model 有多差，最终输出分布都和只用 target model 生成一模一样。差的 draft model 只会降低加速比（更多 rejection），不会影响质量。

### 加速比分析

定义 acceptance rate $\alpha$ — draft token 被接受的平均概率。

期望每轮生成的 token 数为：

$$
E[\text{tokens}] = \frac{1 - \alpha^{K+1}}{1 - \alpha}
$$

$\alpha$ 越高（draft 越准）、$K$ 越大（一次猜得越多），加速比越高：

<AcceptanceRateCalculator client:visible />

实际加速比通常在 **2–3x**（取决于 draft model 质量和目标模型大小）。

## Medusa — 推理时加多头

Cai et al. (2024) 提出了一种不需要独立 draft model 的方案。

### 核心改进

在 target model 的最后一层 hidden state 上接**多个轻量 prediction head**：
- Head 1 预测下一个 token
- Head 2 预测再下一个 token
- Head K 预测第 $K$ 个 token

### Tree Attention 验证

多个 head 的预测组合成一棵**候选树**（而非单一序列），用 tree attention mask 一次 forward pass 验证所有候选路径，选择最长的被接受路径：

<MedusaTreeViz client:visible />

### 训练

冻结 target model，只训练额外的 prediction heads。训练成本低，只需要少量数据和小参数量。

**优势：** 不需要额外模型、部署简单、训练成本低

**局限：** Heads 未经联合训练（推理时才加上的），预测质量有限 → acceptance rate 不如后面的 Eagle

## Multi-Token Prediction (MTP) — 训练时加多头

### 核心思想

与 Medusa 的关键区别：**训练时就让模型同时预测未来第 1, 2, ..., K 个 token。** 每个预测头共享主干网络，各有独立的输出层，训练 loss = 各头 loss 之和（或加权和）。

### 和 Medusa 的关键区别

| | Medusa | MTP |
|---|---|---|
| 训练方式 | 推理时冻结主模型，单独训 heads | 联合训练，heads 和 backbone 一起优化 |
| Head 质量 | 未见过主模型的训练过程 | 与主干共同优化 |
| 类比 | 临时加装的猜测器 | 出厂自带的多步预测能力 |

<MTPTrainInferBridge client:visible />

### 训练到推理的桥梁

训练时的多头预测 → 推理时直接复用这些头做 speculative draft。不需要额外的 draft model，**模型自身就是 drafter + verifier**（self-speculative）。

### 实际应用

- **DeepSeek-V3：** 训练时使用 MTP，推理时利用 MTP heads 做 speculative decoding
- **Meta 2024：** "Better & Faster LLMs via Multi-Token Prediction" 系统验证了 MTP 的有效性

## Eagle — Feature-Level Drafting

Li et al. (2024) 提出了当前 acceptance rate 最高的方案。

### 核心洞察

Draft 不需要从 token embedding 开始预测 — target model 最后一层的 **hidden state** 已编码了丰富的上下文语义信息。直接用 hidden state feature 做 draft，信息量远大于 token-level，准确率自然更高。

<EagleArchitecture client:visible />

### 架构

Eagle 的 "auto-regression head" 是一个轻量 decoder 层：

- **输入：** Target model 的 top-layer hidden state + 当前 token embedding
- **输出：** 下一位置的 feature 向量 → 通过 target model 的 LM head 映射到 token 概率
- **自回归：** 可以用自己的输出继续预测更远的位置

### 为什么 Acceptance Rate 更高

- **Feature-level 信息量 >> token-level：** Hidden state 包含了完整上下文、语义关系、语法模式
- **Token embedding 只有 token 本身的信息**，丢失了上下文
- 实验显示 Eagle 的 acceptance rate 比 Medusa 高约 **10–15%**

### Eagle-2 改进

引入 **context-aware dynamic draft tree**：
- 根据每个节点的置信度动态调整树结构
- 高置信度分支 → 展开更深（更多候选）
- 低置信度分支 → 提前剪枝（不浪费验证计算）
- 结果：比 Eagle-1 进一步提升加速比

### 训练

冻结 target model，只训练轻量 decoder（类似 Medusa 的训练方式），但因为输入是 feature 而非 token，同等训练量下效果更好。

## Lookahead Decoding — 无 Draft Model

Fu et al. (2024) 提出了一种完全不同的思路。

### 基于 Jacobi 迭代

不需要任何 draft model 或额外 head — 基于 **Jacobi 迭代**，同时猜测多个未来位置的 token，并行验证，不断迭代直到收敛。

**工作原理：**

1. **初始：** 随机猜测位置 $t+1, t+2, \ldots, t+K$ 的 token
2. **每步：** 用 target model 对所有位置并行做 forward pass
3. 如果某位置的预测和猜测一致 → 该位置"收敛"
4. 未收敛的位置用新预测替换，继续迭代
5. 通常 2–3 轮迭代就能收敛

**优势：** 零额外参数、零训练成本、任何模型即插即用

**局限：** 加速比通常低于 Medusa/Eagle（迭代次数不可控），实际约 1.5–2x

## 对比总结

<SpecMethodComparison client:visible />

### 选择指南

- **已有配套小模型** → Draft-then-Verify
- **从头训新模型** → MTP（预训练时内置多头预测能力）
- **已有大模型，想快速加速** → Eagle > Medusa > Lookahead
- **不想训练任何东西** → Lookahead（即插即用）

所有方法都通过 rejection sampling 保证**分布一致性** — 加速是无损的，只影响速度不影响质量。核心区别在于 draft 的**来源和质量**，这决定了 acceptance rate 和最终加速比。
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds, article renders with all 6 components

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/speculative-decoding.mdx
git commit -m "feat: add speculative-decoding article with 6 interactive components"
```

---

### Task 20: Final Validation & Cleanup

**Files:**
- Verify all articles and components

- [ ] **Step 1: Run validation**

Run: `npm run validate`
Expected: All content passes validation

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors or warnings

- [ ] **Step 3: Verify article count**

Check that all 3 new articles appear in their paths and render correctly:
- `positional-encoding` in Transformer Core (position 6)
- `sampling-and-decoding` in Inference Engineering (position 4)
- `speculative-decoding` in Inference Engineering (position 5)

- [ ] **Step 4: Final commit if any remaining changes**

```bash
git status
# If there are uncommitted changes:
git add -A
git commit -m "chore: final validation pass for next articles batch"
```
