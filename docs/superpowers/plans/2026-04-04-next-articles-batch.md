# Next Articles Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 2 new articles (Attention Variants, MoE) and expand 2 existing articles (Speculative Decoding, Positional Encoding) with 20 new interactive components + 1 component update.

**Architecture:** Each component is a self-contained React TSX file in `src/components/interactive/`, using shared COLORS/FONTS constants and the StepNavigator primitive. Static SVGs export default functions with no state; interactive components use useState. MDX articles import components with `client:visible` for interactive ones.

**Tech Stack:** Astro 5, React, TypeScript, SVG, StepNavigator primitive, shared/colors.ts

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/components/interactive/DraftTreeStructure.tsx` | Interactive: draft tree with accept/reject nodes |
| `src/components/interactive/TreeAttentionMask.tsx` | Static SVG: tree attention mask vs causal mask |
| `src/components/interactive/EagleEvolution.tsx` | StepNavigator: EAGLE 1→2→3 architecture evolution |
| `src/components/interactive/DraftVerifyPipeline.tsx` | StepNavigator: feature prediction vs direct token prediction |
| `src/components/interactive/SlidingWindowVsFullMask.tsx` | Interactive: adjustable window size, full vs sliding mask |
| `src/components/interactive/HybridLayerStack.tsx` | Static SVG: layer stack with Gemma 2 / Jamba configs |
| `src/components/interactive/CrossVsSelfAttention.tsx` | StepNavigator: self vs cross attention data flow |
| `src/components/interactive/MLACompression.tsx` | Interactive: KV cache size comparison MHA/GQA/MLA |
| `src/components/interactive/MLADataFlow.tsx` | Static SVG: MLA compress → cache → decompress flow |
| `src/components/interactive/AttentionVariantComparison.tsx` | Interactive: comparison table with hover details |
| `src/components/interactive/MoEBasicFlow.tsx` | StepNavigator: token → router → expert → combine |
| `src/components/interactive/DenseVsMoECompare.tsx` | Static SVG: Dense FFN vs MoE FFN side-by-side |
| `src/components/interactive/RoutingStrategyCompare.tsx` | StepNavigator: token-choice vs expert-choice |
| `src/components/interactive/LoadBalanceViz.tsx` | Interactive: adjustable aux loss, expert load bars |
| `src/components/interactive/DeepSeekMoEArchitecture.tsx` | Static SVG: shared + routed expert structure |
| `src/components/interactive/ExpertParallelismDiagram.tsx` | Static SVG: multi-GPU expert distribution + all-to-all |
| `src/components/interactive/MoEModelComparison.tsx` | Static SVG: MoE model comparison table |
| `src/components/interactive/RoPEFrequencyBands.tsx` | Interactive: position slider, frequency heatmap |
| `src/components/interactive/RoPEComplexPlane.tsx` | StepNavigator: complex plane rotation visualization |
| `src/components/interactive/RoPEExtrapolation.tsx` | Interactive: length + scaling method, angle coverage |
| `src/content/articles/zh/attention-variants.mdx` | New article: Attention variants |
| `src/content/articles/zh/mixture-of-experts.mdx` | New article: MoE |

### Modified Files
| File | Change |
|------|--------|
| `src/components/interactive/SpecMethodComparison.tsx` | Add EAGLE-3 row to METHODS array |
| `src/content/articles/zh/speculative-decoding.mdx` | Insert Draft Tree + EAGLE-3 sections, new imports |
| `src/content/articles/zh/positional-encoding.mdx` | Insert 3 new sections with RoPE components |
| `src/content/paths/transformer-core.yaml` | Add missing articles + 2 new articles |

---

## Conventions

- **SVG viewBox width:** 580 (standard across all components)
- **Colors/Fonts:** `import { COLORS, FONTS } from './shared/colors';`
- **StepNavigator:** `import StepNavigator from '../primitives/StepNavigator';`
- **Static components:** No `client:visible` in MDX, no useState
- **Interactive/StepNavigator components:** Add `client:visible` in MDX
- **Marker IDs:** Prefix with component abbreviation (e.g., `dtree-`, `eagle-`, `mla-`)
- **Build verification:** `npm run build` after each component, expect 59+ pages
- **Commit pattern:** One commit per component, descriptive message

---

## Article 1: Speculative Decoding Update (Tasks 1–6)

### Task 1: DraftTreeStructure

**Files:**
- Create: `src/components/interactive/DraftTreeStructure.tsx`

- [ ] **Step 1: Write component**

```tsx
// src/components/interactive/DraftTreeStructure.tsx
// Interactive: Draft tree visualization with accept/reject states
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface TreeNode {
  id: string;
  token: string;
  prob: number;
  children: TreeNode[];
  status: 'accepted' | 'rejected' | 'pending';
}

const DRAFT_TREE: TreeNode = {
  id: 'root', token: 'The', prob: 1.0, status: 'accepted',
  children: [
    {
      id: 'c1', token: 'cat', prob: 0.7, status: 'accepted',
      children: [
        {
          id: 'c1a', token: 'sat', prob: 0.8, status: 'accepted',
          children: [
            { id: 'c1a1', token: 'on', prob: 0.9, status: 'accepted', children: [] },
            { id: 'c1a2', token: 'down', prob: 0.1, status: 'rejected', children: [] },
          ],
        },
        {
          id: 'c1b', token: 'is', prob: 0.2, status: 'rejected',
          children: [
            { id: 'c1b1', token: 'here', prob: 0.5, status: 'pending', children: [] },
          ],
        },
      ],
    },
    {
      id: 'c2', token: 'dog', prob: 0.3, status: 'rejected',
      children: [
        {
          id: 'c2a', token: 'ran', prob: 0.6, status: 'pending',
          children: [],
        },
      ],
    },
  ],
};

const CHAIN: { token: string; status: 'accepted' | 'rejected' | 'pending' }[] = [
  { token: 'The', status: 'accepted' },
  { token: 'cat', status: 'accepted' },
  { token: 'sat', status: 'accepted' },
  { token: 'on', status: 'accepted' },
  { token: 'the', status: 'rejected' },
  { token: 'mat', status: 'pending' },
  { token: 'today', status: 'pending' },
];

const STATUS_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  accepted: { fill: '#dcfce7', stroke: COLORS.green, text: COLORS.green },
  rejected: { fill: '#fee2e2', stroke: COLORS.red, text: COLORS.red },
  pending: { fill: '#f1f5f9', stroke: '#94a3b8', text: '#64748b' },
};

function flattenTree(node: TreeNode, x: number, y: number, xSpan: number, depth: number): {
  nodes: { id: string; token: string; prob: number; status: string; x: number; y: number }[];
  edges: { x1: number; y1: number; x2: number; y2: number }[];
} {
  const nodes: { id: string; token: string; prob: number; status: string; x: number; y: number }[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];

  nodes.push({ id: node.id, token: node.token, prob: node.prob, status: node.status, x, y });

  const childCount = node.children.length;
  if (childCount === 0) return { nodes, edges };

  const childSpan = xSpan / childCount;
  const startX = x - xSpan / 2 + childSpan / 2;
  const childY = y + 60;

  node.children.forEach((child, i) => {
    const childX = startX + i * childSpan;
    edges.push({ x1: x, y1: y + 16, x2: childX, y2: childY - 16 });
    const sub = flattenTree(child, childX, childY, childSpan * 0.9, depth + 1);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  });

  return { nodes, edges };
}

export default function DraftTreeStructure() {
  const [mode, setMode] = useState<'tree' | 'chain'>('tree');

  const { nodes, edges } = flattenTree(DRAFT_TREE, 200, 60, 340, 0);

  // Count accepted in each mode
  const treeAccepted = nodes.filter(n => n.status === 'accepted').length;
  const chainAccepted = CHAIN.filter(c => c.status === 'accepted').length;
  const treeBudget = nodes.length;
  const chainBudget = CHAIN.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden p-4">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-3 justify-center">
        {(['tree', 'chain'] as const).map(m => (
          <button key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === m
                ? 'bg-blue-100 text-blue-800 font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {m === 'tree' ? 'Tree Structure' : 'Chain (Sequential)'}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label="Draft tree vs chain comparison">

        {mode === 'tree' ? (
          <g>
            <text x={200} y={25} textAnchor="middle" fontSize="11" fontWeight="700"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              Tree-based Draft (Token Budget = {treeBudget})
            </text>

            {/* Edges */}
            {edges.map((e, i) => (
              <line key={`e-${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="#cbd5e1" strokeWidth={1.5} />
            ))}

            {/* Nodes */}
            {nodes.map(n => {
              const sc = STATUS_COLORS[n.status];
              return (
                <g key={n.id}>
                  <rect x={n.x - 28} y={n.y - 14} width={56} height={28} rx={6}
                    fill={sc.fill} stroke={sc.stroke} strokeWidth={1.5} />
                  <text x={n.x} y={n.y - 1} textAnchor="middle" fontSize="9" fontWeight="600"
                    fill={sc.text} fontFamily={FONTS.sans}>
                    {n.token}
                  </text>
                  <text x={n.x} y={n.y + 10} textAnchor="middle" fontSize="7"
                    fill="#94a3b8" fontFamily={FONTS.mono}>
                    p={n.prob.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            {[
              { label: 'Accepted', status: 'accepted' },
              { label: 'Rejected', status: 'rejected' },
              { label: 'Pruned (not verified)', status: 'pending' },
            ].map((item, i) => {
              const sc = STATUS_COLORS[item.status];
              const lx = 420;
              const ly = 60 + i * 24;
              return (
                <g key={item.status}>
                  <rect x={lx} y={ly - 8} width={16} height={16} rx={3}
                    fill={sc.fill} stroke={sc.stroke} strokeWidth={1} />
                  <text x={lx + 22} y={ly + 3} fontSize="8" fill={COLORS.dark}
                    fontFamily={FONTS.sans}>{item.label}</text>
                </g>
              );
            })}

            {/* Stats */}
            <rect x={400} y={140} width={160} height={50} rx={5}
              fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
            <text x={480} y={158} textAnchor="middle" fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {treeBudget} tokens verified
            </text>
            <text x={480} y={174} textAnchor="middle" fontSize="8"
              fill={COLORS.green} fontFamily={FONTS.sans}>
              {treeAccepted} accepted ({(treeAccepted / treeBudget * 100).toFixed(0)}%)
            </text>
          </g>
        ) : (
          <g>
            <text x={W / 2} y={25} textAnchor="middle" fontSize="11" fontWeight="700"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              Chain-based Draft (Token Budget = {chainBudget})
            </text>

            {/* Chain nodes */}
            {CHAIN.map((c, i) => {
              const x = 60 + i * 68;
              const y = 80;
              const sc = STATUS_COLORS[c.status];
              return (
                <g key={i}>
                  {i > 0 && (
                    <line x1={x - 40} y1={y} x2={x - 28} y2={y}
                      stroke="#cbd5e1" strokeWidth={1.5} />
                  )}
                  <rect x={x - 26} y={y - 14} width={52} height={28} rx={6}
                    fill={sc.fill} stroke={sc.stroke} strokeWidth={1.5} />
                  <text x={x} y={y + 3} textAnchor="middle" fontSize="9" fontWeight="600"
                    fill={sc.text} fontFamily={FONTS.sans}>
                    {c.token}
                  </text>
                </g>
              );
            })}

            {/* Explanation */}
            <rect x={40} y={130} width={500} height={50} rx={5}
              fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
            <text x={W / 2} y={150} textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.red} fontFamily={FONTS.sans}>
              Chain 的问题: 一旦 reject，后续全部作废
            </text>
            <text x={W / 2} y={166} textAnchor="middle" fontSize="8"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {chainBudget} tokens 中只有 {chainAccepted} 个被接受 — 第 {chainAccepted + 1} 个 reject 后剩余 {chainBudget - chainAccepted - 1} 个浪费
            </text>
          </g>
        )}

        {/* Comparison insight */}
        <rect x={40} y={H - 80} width={500} height={65} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={W / 2} y={H - 58} textAnchor="middle" fontSize="9" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          Tree vs Chain: 同样的 Token Budget
        </text>
        <text x={W / 2} y={H - 42} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Tree: 多条候选路径并行验证 → reject 只影响单条分支，其他路径不受影响
        </text>
        <text x={W / 2} y={H - 26} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Chain: 单一序列 → 一处 reject 后所有后续 token 作废，budget 利用率低
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes, 59+ pages

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/DraftTreeStructure.tsx
git commit -m "feat: add DraftTreeStructure interactive component (spec dec update)"
```

---

### Task 2: TreeAttentionMask

**Files:**
- Create: `src/components/interactive/TreeAttentionMask.tsx`

- [ ] **Step 1: Write component**

```tsx
// src/components/interactive/TreeAttentionMask.tsx
// Static SVG: Tree attention mask vs standard causal mask comparison
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

const N = 7; // 7 tokens in example
const CELL = 28;
const TOKENS = ['The', 'cat', 'sat', 'cat', 'is', 'sat', 'on'];
// Tree positions: 0=The(root), 1=cat(L1), 2=sat(L2a), 3=cat→is(L2b), 4=dog(rejected), 5=sat→on(L3a), 6=sat→down(L3b)
// Simplified: prefix tokens [The], then tree branches

// Causal mask: lower triangle
const CAUSAL: boolean[][] = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (_, j) => j <= i)
);

// Tree mask: causal + tree structure constraints
// Token indices: 0=The, 1=cat, 2=sat, 3=on, 4=is, 5=dog, 6=ran
// Tree paths: [The→cat→sat→on], [The→cat→is], [The→dog→ran]
const TREE_LABELS = ['The', 'cat', 'sat', 'on', 'is', 'dog', 'ran'];
const TREE_MASK: boolean[][] = [
  [true, false, false, false, false, false, false], // The: sees itself
  [true, true, false, false, false, false, false],  // cat: sees The, cat
  [true, true, true, false, false, false, false],   // sat: sees The, cat, sat
  [true, true, true, true, false, false, false],    // on: sees The, cat, sat, on
  [true, true, false, false, true, false, false],   // is: sees The, cat, is (NOT sat/on)
  [true, false, false, false, false, true, false],  // dog: sees The, dog (NOT cat branch)
  [true, false, false, false, false, true, true],   // ran: sees The, dog, ran
];

function MaskGrid({ x, y, mask, labels, title, subtitle }: {
  x: number; y: number; mask: boolean[][]; labels: string[];
  title: string; subtitle: string;
}) {
  const n = labels.length;
  const gridX = x + 30;
  const gridY = y + 30;

  return (
    <g>
      <text x={x + (n * CELL) / 2 + 30} y={y - 18} textAnchor="middle" fontSize="10"
        fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {title}
      </text>
      <text x={x + (n * CELL) / 2 + 30} y={y - 4} textAnchor="middle" fontSize="7"
        fill="#64748b" fontFamily={FONTS.sans}>
        {subtitle}
      </text>

      {/* Column headers */}
      {labels.map((label, j) => (
        <text key={`ch-${j}`} x={gridX + j * CELL + CELL / 2} y={gridY - 4}
          textAnchor="middle" fontSize="6.5" fill="#64748b" fontFamily={FONTS.mono}>
          {label}
        </text>
      ))}

      {/* Row headers */}
      {labels.map((label, i) => (
        <text key={`rh-${i}`} x={gridX - 4} y={gridY + i * CELL + CELL / 2 + 1}
          textAnchor="end" dominantBaseline="middle" fontSize="6.5"
          fill="#64748b" fontFamily={FONTS.mono}>
          {label}
        </text>
      ))}

      {/* Cells */}
      {mask.map((row, i) =>
        row.map((val, j) => (
          <rect key={`${i}-${j}`}
            x={gridX + j * CELL} y={gridY + i * CELL}
            width={CELL - 1} height={CELL - 1} rx={2}
            fill={val ? (i === j ? '#bbdefb' : '#dbeafe') : '#f8fafc'}
            stroke={val ? COLORS.primary : '#e2e8f0'} strokeWidth={0.5} />
        ))
      )}
    </g>
  );
}

export default function TreeAttentionMask() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Tree attention mask vs causal mask comparison">

      <MaskGrid x={10} y={30} mask={CAUSAL} labels={TOKENS}
        title="Standard Causal Mask"
        subtitle="每个 token 看到所有之前的 token" />

      <MaskGrid x={300} y={30} mask={TREE_MASK} labels={TREE_LABELS}
        title="Tree Attention Mask"
        subtitle="每个 token 只看到自己的祖先路径" />

      {/* Key insight */}
      <rect x={40} y={H - 50} width={500} height={40} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={W / 2} y={H - 28} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        Tree mask 允许不同分支并行验证: "is" 不会看到 "sat/on"，"dog" 不会看到 "cat" 分支
      </text>
      <text x={W / 2} y={H - 14} textAnchor="middle" fontSize="7"
        fill="#64748b" fontFamily={FONTS.sans}>
        一次 forward pass 验证所有路径 → 选择最长被接受路径
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TreeAttentionMask.tsx
git commit -m "feat: add TreeAttentionMask static SVG (spec dec update)"
```

---

### Task 3: EagleEvolution

**Files:**
- Create: `src/components/interactive/EagleEvolution.tsx`

- [ ] **Step 1: Write component**

```tsx
// src/components/interactive/EagleEvolution.tsx
// StepNavigator: EAGLE 1 → 2 → 3 architecture evolution
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 320;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

function Box({ x, y, w, h, label, sublabel, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - (sublabel ? 4 : 0)} textAnchor="middle"
        dominantBaseline="middle" fontSize="8" fontWeight="600"
        fill={stroke} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
          fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, color }: {
  x1: number; y1: number; x2: number; y2: number;
  label?: string; color: string;
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={1.5} markerEnd={`url(#eagle-evo-arr)`} />
      {label && (
        <text x={midX + 4} y={midY - 4} fontSize="6.5" fill={color} fontFamily={FONTS.sans}>
          {label}
        </text>
      )}
    </g>
  );
}

const steps = [
  {
    title: 'EAGLE-1: Feature-Level Drafting',
    content: (
      <StepSvg>
        <defs>
          <marker id="eagle-evo-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>

        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-1: Hidden State → Feature → Token
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          用 target model 的 hidden state 做 draft — feature 级信息量 {'>'} token 级
        </text>

        {/* Target Model */}
        <Box x={40} y={70} w={140} h={50} label="Target Model"
          sublabel="Forward Pass" fill="#dbeafe" stroke={COLORS.primary} />

        {/* Hidden State */}
        <Box x={220} y={70} w={140} h={50} label="Hidden State"
          sublabel="Top-layer feature" fill="#fef3c7" stroke={COLORS.orange} />
        <Arrow x1={180} y1={95} x2={220} y2={95} color={COLORS.primary} />

        {/* Token Embedding */}
        <Box x={220} y={140} w={140} h={36} label="Token Embedding"
          fill="#f1f5f9" stroke="#94a3b8" />

        {/* Draft Head */}
        <Box x={400} y={90} w={140} h={50} label="Draft Head"
          sublabel="Lightweight decoder" fill="#dcfce7" stroke={COLORS.green} />
        <Arrow x1={360} y1={95} x2={400} y2={105} label="feature" color={COLORS.orange} />
        <Arrow x1={360} y1={158} x2={400} y2={120} label="embedding" color="#94a3b8" />

        {/* Output tokens */}
        <Box x={400} y={170} w={140} h={36} label="Draft Tokens"
          sublabel="T+1, T+2, ..." fill="#dcfce7" stroke={COLORS.green} />
        <Arrow x1={470} y1={140} x2={470} y2={170} color={COLORS.green} />

        {/* Key insight */}
        <rect x={40} y={230} width={500} height={70} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={250} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          核心洞察: Feature-level {'>'} Token-level
        </text>
        <text x={W / 2} y={268} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Hidden state 编码了完整上下文语义 → acceptance rate 比 Medusa 高 10-15%
        </text>
        <text x={W / 2} y={284} textAnchor="middle" fontSize="8" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          限制: Draft 阶段依赖 target model 的 hidden state → 必须等 target forward pass 完成
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'EAGLE-2: Dynamic Draft Tree',
    content: (
      <StepSvg>
        <defs>
          <marker id="eagle-evo-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>

        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-2: Context-Aware Dynamic Draft Tree
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          在 EAGLE-1 基础上 + 根据置信度动态调整树结构
        </text>

        {/* Same architecture as EAGLE-1 but with tree */}
        <Box x={40} y={60} w={120} h={40} label="Target Model"
          fill="#dbeafe" stroke={COLORS.primary} />
        <Arrow x1={160} y1={80} x2={190} y2={80} color={COLORS.primary} />
        <Box x={190} y={60} w={120} h={40} label="Hidden State"
          fill="#fef3c7" stroke={COLORS.orange} />
        <Arrow x1={310} y1={80} x2={340} y2={80} color={COLORS.orange} />
        <Box x={340} y={60} w={120} h={40} label="Draft Head"
          fill="#dcfce7" stroke={COLORS.green} />

        {/* Dynamic tree visualization */}
        <text x={W / 2} y={124} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Dynamic Tree: 高置信度 → 深扩展, 低置信度 → 提前剪枝
        </text>

        {/* Tree example - expanded branch */}
        <g>
          <rect x={60} y={140} width={44} height={24} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={82} y={155} textAnchor="middle" fontSize="7" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>p=0.9</text>

          <line x1={104} y1={152} x2={130} y2={145} stroke={COLORS.green} strokeWidth={1} />
          <line x1={104} y1={152} x2={130} y2={165} stroke={COLORS.green} strokeWidth={1} />

          <rect x={130} y={132} width={44} height={24} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={152} y={148} textAnchor="middle" fontSize="7"
            fill={COLORS.green} fontFamily={FONTS.sans}>p=0.8</text>

          <rect x={130} y={158} width={44} height={24} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={152} y={174} textAnchor="middle" fontSize="7"
            fill={COLORS.green} fontFamily={FONTS.sans}>p=0.7</text>

          {/* Deep expansion */}
          <line x1={174} y1={144} x2={200} y2={144} stroke={COLORS.green} strokeWidth={1} />
          <rect x={200} y={132} width={44} height={24} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={222} y={148} textAnchor="middle" fontSize="7"
            fill={COLORS.green} fontFamily={FONTS.sans}>p=0.6</text>

          <text x={150} y={200} textAnchor="middle" fontSize="8" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            高置信度分支: 展开更深
          </text>
        </g>

        {/* Pruned branch */}
        <g>
          <rect x={360} y={140} width={44} height={24} rx={4}
            fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
          <text x={382} y={155} textAnchor="middle" fontSize="7" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>p=0.2</text>

          <line x1={404} y1={152} x2={430} y2={152} stroke="#cbd5e1" strokeWidth={1}
            strokeDasharray="3 2" />
          <text x={455} y={155} fontSize="7" fill="#94a3b8" fontFamily={FONTS.sans}>
            pruned
          </text>

          <text x={420} y={200} textAnchor="middle" fontSize="8" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>
            低置信度分支: 提前剪枝
          </text>
        </g>

        {/* Improvement */}
        <rect x={40} y={225} width={500} height={70} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={245} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          EAGLE-2 改进: Token budget 智能分配
        </text>
        <text x={W / 2} y={263} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          固定 token budget 下，把验证资源集中在高概率路径 → 更高 acceptance rate
        </text>
        <text x={W / 2} y={281} textAnchor="middle" fontSize="8" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          仍然限制: Draft 阶段依赖 target model hidden state
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'EAGLE-3: Direct Token Prediction',
    content: (
      <StepSvg>
        <defs>
          <marker id="eagle-evo-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>

        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-3: Direct Token Prediction + Multi-Layer Fusion
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          从 feature prediction 转为直接预测 token，融合多层特征
        </text>

        {/* Target Model with multiple layers highlighted */}
        <Box x={30} y={65} w={130} h={80} label="Target Model"
          sublabel="" fill="#dbeafe" stroke={COLORS.primary} />
        <text x={95} y={90} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Layer N</text>
        <text x={95} y={104} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Layer N-1</text>
        <text x={95} y={118} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Layer N-2</text>
        <text x={95} y={132} textAnchor="middle" fontSize="6" fill="#94a3b8"
          fontFamily={FONTS.sans}>...</text>

        {/* Multi-layer features */}
        <Arrow x1={160} y1={90} x2={200} y2={90} color={COLORS.primary} />
        <Arrow x1={160} y1={105} x2={200} y2={105} color={COLORS.primary} />
        <Arrow x1={160} y1={120} x2={200} y2={120} color={COLORS.primary} />

        <Box x={200} y={72} w={140} h={65} label="Multi-Layer Fusion"
          sublabel="Training-Time Test" fill="#fef3c7" stroke={COLORS.orange} />

        {/* Direct token prediction */}
        <Arrow x1={340} y1={105} x2={380} y2={105} color={COLORS.orange} />
        <Box x={380} y={80} w={160} h={50} label="Direct Token Prediction"
          sublabel="不经过 feature → token 映射" fill="#dcfce7" stroke={COLORS.green} />

        {/* Output */}
        <Arrow x1={460} y1={130} x2={460} y2={158} color={COLORS.green} />
        <Box x={380} y={158} w={160} h={36} label="Draft Tokens (6.5x speedup)"
          fill="#dcfce7" stroke={COLORS.green} />

        {/* Comparison bars */}
        <text x={W / 2} y={220} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          加速比对比
        </text>

        {[
          { label: 'Medusa', speedup: 2.5, color: '#94a3b8' },
          { label: 'EAGLE-1', speedup: 3.5, color: COLORS.orange },
          { label: 'EAGLE-2', speedup: 4.5, color: COLORS.primary },
          { label: 'EAGLE-3', speedup: 6.5, color: COLORS.green },
        ].map((item, i) => {
          const barY = 232 + i * 18;
          const maxBarW = 300;
          const barW = (item.speedup / 7) * maxBarW;
          return (
            <g key={i}>
              <text x={100} y={barY + 9} textAnchor="end" fontSize="7.5" fontWeight="500"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{item.label}</text>
              <rect x={110} y={barY} width={maxBarW} height={14} rx={2}
                fill="#f1f5f9" />
              <rect x={110} y={barY} width={barW} height={14} rx={2}
                fill={item.color} opacity={0.7} />
              <text x={115 + barW} y={barY + 10} fontSize="7" fontWeight="600"
                fill={item.color} fontFamily={FONTS.mono}>
                {item.speedup}x
              </text>
            </g>
          );
        })}
      </StepSvg>
    ),
  },
];

export default function EagleEvolution() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/EagleEvolution.tsx
git commit -m "feat: add EagleEvolution StepNavigator (EAGLE 1→2→3 comparison)"
```

---

### Task 4: DraftVerifyPipeline

**Files:**
- Create: `src/components/interactive/DraftVerifyPipeline.tsx`

- [ ] **Step 1: Write component**

```tsx
// src/components/interactive/DraftVerifyPipeline.tsx
// StepNavigator: EAGLE 1/2 feature prediction vs EAGLE-3 direct token prediction
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 280;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

function PipelineBox({ x, y, w, h, label, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

const BOX_W = 80;
const BOX_H = 28;

const steps = [
  {
    title: 'EAGLE 1/2: Feature Prediction Pipeline',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE 1/2: Hidden State → Feature → Token
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          Draft 依赖 target model 的 hidden state — 三步流程
        </text>

        {/* Pipeline: Target Forward → Extract Hidden State → Draft Head → Tokens */}
        {[
          { label: 'Target\nForward', fill: '#dbeafe', stroke: COLORS.primary },
          { label: 'Extract\nHidden State', fill: '#fef3c7', stroke: COLORS.orange },
          { label: 'Draft Head\n(Feature→Token)', fill: '#dcfce7', stroke: COLORS.green },
          { label: 'Verify\n(Target)', fill: '#dbeafe', stroke: COLORS.primary },
        ].map((box, i) => {
          const x = 40 + i * 135;
          return (
            <g key={i}>
              <PipelineBox x={x} y={60} w={110} h={50} label={box.label}
                fill={box.fill} stroke={box.stroke} />
              {i < 3 && (
                <line x1={x + 110} y1={85} x2={x + 135} y2={85}
                  stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#dvp-arr)" />
              )}
            </g>
          );
        })}

        <defs>
          <marker id="dvp-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
          </marker>
        </defs>

        {/* Dependency chain highlight */}
        <rect x={40} y={125} width={500} height={24} rx={4}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} strokeDasharray="4 2" />
        <text x={W / 2} y={140} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          串行依赖链: Draft 必须等 Target 的 Hidden State → 无法流水线化
        </text>

        {/* Iteration timeline */}
        <text x={30} y={175} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>迭代过程:</text>

        {Array.from({ length: 3 }).map((_, iter) => {
          const baseX = 40 + iter * 180;
          const y = 190;
          return (
            <g key={iter}>
              <PipelineBox x={baseX} y={y} w={75} h={22}
                label={`Target #${iter + 1}`} fill="#dbeafe" stroke={COLORS.primary} />
              <PipelineBox x={baseX + 80} y={y} w={75} h={22}
                label={`Draft #${iter + 1}`} fill="#dcfce7" stroke={COLORS.green} />
              {iter < 2 && (
                <line x1={baseX + 155} y1={y + 11} x2={baseX + 180} y2={y + 11}
                  stroke="#cbd5e1" strokeWidth={1} />
              )}
            </g>
          );
        })}

        <text x={W / 2} y={240} textAnchor="middle" fontSize="8" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          每轮: Target forward (慢) → Draft (快) → 串行等待
        </text>

        <rect x={40} y={252} width={500} height={20} rx={3}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={265} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-1 ~3.5x | EAGLE-2 ~4.5x (dynamic tree 改善了 budget 分配)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'EAGLE-3: Direct Token Prediction + Multi-Layer Fusion',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-3: Direct Token Prediction
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          跳过 feature prediction，直接预测 token + 融合多层特征
        </text>

        {/* New pipeline: Multi-Layer Features → Fusion → Direct Token */}
        <PipelineBox x={40} y={60} w={110} h={50}
          label="Target Model" fill="#dbeafe" stroke={COLORS.primary} />

        {/* Multiple arrows for multi-layer */}
        {[0, 1, 2].map(i => (
          <line key={i} x1={150} y1={72 + i * 12} x2={190} y2={78 + i * 6}
            stroke={COLORS.primary} strokeWidth={1} />
        ))}

        <PipelineBox x={190} y={60} w={110} h={50}
          label="Multi-Layer\nFusion" fill="#fef3c7" stroke={COLORS.orange} />

        <line x1={300} y1={85} x2={335} y2={85}
          stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#dvp-arr2)" />

        <PipelineBox x={335} y={60} w={110} h={50}
          label="Direct Token\nPrediction" fill="#dcfce7" stroke={COLORS.green} />

        <line x1={445} y1={85} x2={475} y2={85}
          stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#dvp-arr2)" />

        <PipelineBox x={475} y={70} w={75} h={30}
          label="Verify" fill="#dbeafe" stroke={COLORS.primary} />

        <defs>
          <marker id="dvp-arr2" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
          </marker>
        </defs>

        {/* Key improvements */}
        <rect x={40} y={130} width={500} height={60} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={148} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          EAGLE-3 的两个关键改进
        </text>
        <text x={60} y={166} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          1. Direct token prediction: 跳过 feature→token 映射，直接输出 token 概率
        </text>
        <text x={60} y={180} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          2. Multi-layer fusion (Training-Time Test): 融合多层特征而非只用最后一层
        </text>

        {/* Performance comparison */}
        <text x={W / 2} y={215} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          性能对比
        </text>

        {[
          { label: 'EAGLE-2', val: 4.5, max: 7, color: COLORS.primary },
          { label: 'EAGLE-3', val: 6.5, max: 7, color: COLORS.green },
        ].map((item, i) => {
          const barY = 225 + i * 20;
          const maxW = 300;
          const barW = (item.val / item.max) * maxW;
          return (
            <g key={i}>
              <text x={130} y={barY + 11} textAnchor="end" fontSize="8"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{item.label}</text>
              <rect x={140} y={barY} width={maxW} height={16} rx={3} fill="#f1f5f9" />
              <rect x={140} y={barY} width={barW} height={16} rx={3}
                fill={item.color} opacity={0.7} />
              <text x={145 + barW} y={barY + 11} fontSize="8" fontWeight="700"
                fill={item.color} fontFamily={FONTS.mono}>{item.val}x</text>
            </g>
          );
        })}

        <text x={W / 2} y={275} textAnchor="middle" fontSize="8" fill={COLORS.green}
          fontFamily={FONTS.sans}>
          EAGLE-3: ~1.4x faster than EAGLE-2 | SGLang batch=64 吞吐提升 1.38x
        </text>
      </StepSvg>
    ),
  },
];

export default function DraftVerifyPipeline() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/DraftVerifyPipeline.tsx
git commit -m "feat: add DraftVerifyPipeline StepNavigator (EAGLE feature vs direct prediction)"
```

---

### Task 5: Update SpecMethodComparison

**Files:**
- Modify: `src/components/interactive/SpecMethodComparison.tsx:16-62`

- [ ] **Step 1: Add EAGLE-3 entry to METHODS array**

After the existing `Eagle` entry (line ~53) and before `Lookahead`, add:

```tsx
  {
    name: 'Eagle-3',
    extraParams: '轻量 draft model',
    trainingCost: '低',
    trainingLevel: 'low',
    speedup: '~6.5x',
    useCase: '最高加速比',
    summary: 'Direct token prediction + multi-layer feature fusion (Training-Time Test)，不再预测 feature 而是直接预测 token，比 EAGLE-2 提升约 1.4x',
  },
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SpecMethodComparison.tsx
git commit -m "feat: add EAGLE-3 to SpecMethodComparison table"
```

---

### Task 6: Update Speculative Decoding MDX

**Files:**
- Modify: `src/content/articles/zh/speculative-decoding.mdx`

- [ ] **Step 1: Add new imports**

After the existing import block (line 43), add:

```mdx
import DraftTreeStructure from '../../../components/interactive/DraftTreeStructure.tsx';
import TreeAttentionMask from '../../../components/interactive/TreeAttentionMask.tsx';
import EagleEvolution from '../../../components/interactive/EagleEvolution.tsx';
import DraftVerifyPipeline from '../../../components/interactive/DraftVerifyPipeline.tsx';
```

- [ ] **Step 2: Insert Draft Tree section**

Insert before the `## 对比总结` section (before `<SpecMethodComparison`):

```mdx
## Draft Tree — 树状推测结构

前面 Medusa 和 Eagle-2 都提到了 tree attention — 这里详细展开 draft tree 的结构和验证机制。

### 为什么树比序列好

经典的 Draft-then-Verify 生成一条链（序列）：一旦某个位置被 reject，后续所有 token 全部作废。而 **draft tree** 维护多条候选路径，一次 forward pass 并行验证所有路径 — reject 只影响单条分支，其他路径不受影响。

<DraftTreeStructure client:visible />

### Tree Attention Mask

要在一次 forward pass 中验证整棵树，需要构造特殊的 attention mask：每个节点只能 attend 自己的**祖先路径**上的节点（而非所有前面的节点）。这比标准因果 mask 更加稀疏：

<TreeAttentionMask />

验证完成后，选择树中**最长的被接受路径**作为输出。固定 token budget 下，树结构的 expected accepted tokens 显著高于链结构。

## EAGLE-3 — Scaling Up Speculative Decoding

EAGLE 系列是目前 acceptance rate 最高的 speculative decoding 方案。从 EAGLE-1 到 EAGLE-3，核心演进是：

<EagleEvolution client:visible />

### EAGLE-3 的关键改进

EAGLE-1/2 预测 **feature 向量**（target model 的 hidden state），再映射到 token。EAGLE-3 转为 **direct token prediction** — 直接预测下一个 token，同时融合 target model 多层的特征（multi-layer feature fusion），通过 Training-Time Test 技术更好地利用训练数据 scaling。

<DraftVerifyPipeline client:visible />

实测 EAGLE-3 达到 **6.5x 加速比**，比 EAGLE-2 提升约 1.4x。在 SGLang 推理框架中，batch=64 时吞吐提升 1.38x。
```

- [ ] **Step 3: Add EAGLE-3 reference**

In the frontmatter references section, add:

```yaml
  - type: paper
    title: "EAGLE-3: Scaling up Inference Acceleration of Large Language Models via Training-Time Test"
    url: "https://arxiv.org/abs/2503.01840"
```

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: Build passes, page count increases (60+ pages)

- [ ] **Step 5: Commit**

```bash
git add src/content/articles/zh/speculative-decoding.mdx
git commit -m "feat: add Draft Tree + EAGLE-3 sections to speculative-decoding article"
```

---

## Article 2: Attention Variants (New Article)

### Task 7: SlidingWindowVsFullMask

**Files:**
- Create: `src/components/interactive/SlidingWindowVsFullMask.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

export default function SlidingWindowVsFullMask() {
  const [seqLen, setSeqLen] = useState(8);
  const [windowSize, setWindowSize] = useState(3);

  const { fullOps, swOps } = useMemo(() => ({
    fullOps: seqLen * (seqLen + 1) / 2,
    swOps: Array.from({ length: seqLen }, (_, i) => Math.min(i + 1, windowSize))
      .reduce((a, b) => a + b, 0),
  }), [seqLen, windowSize]);

  const cellSize = Math.min(24, Math.floor(240 / seqLen));
  const gridW = seqLen * cellSize;
  const leftX = (W / 2 - gridW) / 2;
  const rightX = W / 2 + (W / 2 - gridW) / 2;

  const renderMask = (ox: number, isSW: boolean) => {
    const cells: JSX.Element[] = [];
    for (let row = 0; row < seqLen; row++) {
      for (let col = 0; col < seqLen; col++) {
        const causal = col <= row;
        const inWindow = isSW ? (row - col < windowSize) : true;
        const active = causal && inWindow;
        cells.push(
          <rect key={`${row}-${col}`}
            x={ox + col * cellSize} y={50 + row * cellSize}
            width={cellSize - 1} height={cellSize - 1} rx={2}
            fill={active ? (isSW ? COLORS.primary : '#93c5fd') : COLORS.masked}
            opacity={active ? 0.8 : 0.4}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="my-6">
      <div className="flex gap-4 mb-3 items-center justify-center">
        <label className="text-xs text-gray-500">
          序列长度 n={seqLen}
          <input type="range" min={4} max={16} step={1} value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="ml-2 w-24" />
        </label>
        <label className="text-xs text-gray-500">
          窗口大小 w={windowSize}
          <input type="range" min={1} max={seqLen} step={1} value={windowSize}
            onChange={e => setWindowSize(Number(e.target.value))} className="ml-2 w-24" />
        </label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Title */}
        <text x={W / 4} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Full Causal Mask</text>
        <text x={3 * W / 4} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Sliding Window Mask (w={windowSize})</text>

        {/* Axis labels */}
        <text x={leftX + gridW / 2} y={42} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily={FONTS.sans}>Key position</text>
        <text x={rightX + gridW / 2} y={42} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily={FONTS.sans}>Key position</text>

        {renderMask(leftX, false)}
        {renderMask(rightX, true)}

        {/* Divider */}
        <line x1={W / 2} y1={35} x2={W / 2} y2={50 + seqLen * cellSize + 5}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />

        {/* Computation comparison */}
        {(() => {
          const barY = 50 + seqLen * cellSize + 20;
          const maxBarW = 200;
          const fullBarW = maxBarW;
          const swBarW = (swOps / fullOps) * maxBarW;
          const saving = ((1 - swOps / fullOps) * 100).toFixed(0);
          return (
            <g>
              <text x={W / 2} y={barY} textAnchor="middle" fontSize="10" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>
                计算量对比
              </text>
              <text x={W / 2 - maxBarW / 2 - 5} y={barY + 20} textAnchor="end" fontSize="8"
                fill={COLORS.mid} fontFamily={FONTS.sans}>Full</text>
              <rect x={W / 2 - maxBarW / 2} y={barY + 12} width={fullBarW} height={12} rx={3}
                fill="#93c5fd" opacity={0.6} />
              <text x={W / 2 + maxBarW / 2 + 4} y={barY + 22} fontSize="8" fontWeight="600"
                fill={COLORS.mid} fontFamily={FONTS.mono}>
                O(n²) = {fullOps}
              </text>

              <text x={W / 2 - maxBarW / 2 - 5} y={barY + 38} textAnchor="end" fontSize="8"
                fill={COLORS.mid} fontFamily={FONTS.sans}>SWA</text>
              <rect x={W / 2 - maxBarW / 2} y={barY + 30} width={swBarW} height={12} rx={3}
                fill={COLORS.primary} opacity={0.7} />
              <text x={W / 2 - maxBarW / 2 + swBarW + 4} y={barY + 40} fontSize="8" fontWeight="600"
                fill={COLORS.primary} fontFamily={FONTS.mono}>
                O(nw) = {swOps} ({saving}% less)
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SlidingWindowVsFullMask.tsx
git commit -m "feat: add SlidingWindowVsFullMask interactive component"
```

---

### Task 8: HybridLayerStack

**Files:**
- Create: `src/components/interactive/HybridLayerStack.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 340;

interface LayerConfig {
  label: string;
  layers: { type: 'full' | 'swa' | 'mamba'; label: string }[];
}

const configs: LayerConfig[] = [
  {
    label: 'Gemma 2',
    layers: Array.from({ length: 8 }, (_, i) => ({
      type: (i % 2 === 0 ? 'full' : 'swa') as 'full' | 'swa',
      label: i % 2 === 0 ? 'Full Attn' : 'SWA',
    })),
  },
  {
    label: 'Jamba',
    layers: [
      { type: 'full', label: 'Attention' },
      { type: 'mamba', label: 'Mamba' },
      { type: 'mamba', label: 'Mamba' },
      { type: 'full', label: 'Attention' },
      { type: 'mamba', label: 'Mamba' },
      { type: 'mamba', label: 'Mamba' },
      { type: 'full', label: 'Attention' },
      { type: 'mamba', label: 'Mamba' },
    ],
  },
];

const LAYER_COLORS: Record<string, { fill: string; stroke: string }> = {
  full: { fill: '#dbeafe', stroke: COLORS.primary },
  swa: { fill: '#fef3c7', stroke: COLORS.orange },
  mamba: { fill: '#dcfce7', stroke: COLORS.green },
};

export default function HybridLayerStack() {
  const colW = 200;
  const layerH = 28;
  const gap = 4;
  const startY = 60;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Hybrid Attention 层配置对比
      </text>

      {configs.map((cfg, ci) => {
        const cx = 60 + ci * (colW + 80);
        return (
          <g key={ci}>
            <text x={cx + colW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{cfg.label}</text>
            {cfg.layers.map((layer, li) => {
              const y = startY + li * (layerH + gap);
              const c = LAYER_COLORS[layer.type];
              return (
                <g key={li}>
                  <rect x={cx} y={y} width={colW} height={layerH} rx={5}
                    fill={c.fill} stroke={c.stroke} strokeWidth={1} />
                  <text x={cx + 10} y={y + layerH / 2 + 1} dominantBaseline="middle"
                    fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
                    L{li}
                  </text>
                  <text x={cx + colW / 2} y={y + layerH / 2 + 1} textAnchor="middle"
                    dominantBaseline="middle" fontSize="9" fontWeight="600"
                    fill={c.stroke} fontFamily={FONTS.sans}>
                    {layer.label}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Legend */}
      {[
        { type: 'full', label: 'Full Attention' },
        { type: 'swa', label: 'Sliding Window' },
        { type: 'mamba', label: 'Mamba (SSM)' },
      ].map((item, i) => {
        const lx = 140 + i * 140;
        const ly = H - 20;
        const c = LAYER_COLORS[item.type];
        return (
          <g key={i}>
            <rect x={lx} y={ly - 8} width={12} height={12} rx={2}
              fill={c.fill} stroke={c.stroke} strokeWidth={1} />
            <text x={lx + 16} y={ly + 2} fontSize="8" fill={COLORS.dark}
              fontFamily={FONTS.sans}>{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/HybridLayerStack.tsx
git commit -m "feat: add HybridLayerStack static SVG (Gemma 2 vs Jamba)"
```

---

### Task 9: CrossVsSelfAttention

**Files:**
- Create: `src/components/interactive/CrossVsSelfAttention.tsx`

- [ ] **Step 1: Create component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function Box({ x, y, w, h, label, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>{label}</text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, id }: {
  x1: number; y1: number; x2: number; y2: number; id: string;
}) {
  return (
    <g>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd={`url(#${id})`} />
    </g>
  );
}

const steps = [
  {
    title: 'Self-Attention',
    content: (
      <StepSvg h={220}>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Self-Attention: Q, K, V 来自同一序列
        </text>

        {/* Input sequence */}
        <Box x={200} y={35} w={180} h={35} label="Input Sequence X"
          fill="#dbeafe" stroke={COLORS.primary} />

        {/* Q, K, V branches */}
        {[
          { label: 'Q = Wq·X', cx: 120, color: COLORS.primary },
          { label: 'K = Wk·X', cx: 290, color: COLORS.green },
          { label: 'V = Wv·X', cx: 460, color: COLORS.orange },
        ].map((item, i) => (
          <g key={i}>
            <Arrow x1={290} y1={70} x2={item.cx} y2={95} id={`csa-s-${i}`} />
            <Box x={item.cx - 65} y={95} w={130} h={30}
              label={item.label} fill="#f8fafc" stroke={item.color} />
          </g>
        ))}

        {/* Attention */}
        <Arrow x1={290} y1={125} x2={290} y2={150} id="csa-s-att" />
        <Box x={200} y={150} w={180} h={35} label="Attention(Q, K, V)"
          fill="#fef3c7" stroke={COLORS.orange} />

        <text x={W / 2} y={210} textAnchor="middle" fontSize="9" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          所有 Q, K, V 都从相同的输入 X 投影得到
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Cross-Attention',
    content: (
      <StepSvg h={240}>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Cross-Attention: Q 来自 Decoder，K/V 来自 Encoder
        </text>

        {/* Two sources */}
        <Box x={30} y={40} w={160} h={35} label="Decoder Hidden (Y)"
          fill="#dbeafe" stroke={COLORS.primary} />
        <Box x={390} y={40} w={160} h={35} label="Encoder Output (X)"
          fill="#dcfce7" stroke={COLORS.green} />

        {/* Q from decoder */}
        <Arrow x1={110} y1={75} x2={150} y2={105} id="csa-c-q" />
        <Box x={85} y={105} w={130} h={30} label="Q = Wq·Y"
          fill="#f8fafc" stroke={COLORS.primary} />

        {/* K, V from encoder */}
        <Arrow x1={470} y1={75} x2={350} y2={105} id="csa-c-k" />
        <Box x={285} y={105} w={130} h={30} label="K = Wk·X"
          fill="#f8fafc" stroke={COLORS.green} />
        <Arrow x1={470} y1={75} x2={490} y2={105} id="csa-c-v" />
        <Box x={425} y={105} w={130} h={30} label="V = Wv·X"
          fill="#f8fafc" stroke={COLORS.green} />

        {/* Attention */}
        <Arrow x1={290} y1={135} x2={290} y2={160} id="csa-c-att" />
        <Box x={200} y={160} w={180} h={35} label="Attention(Q, K, V)"
          fill="#fef3c7" stroke={COLORS.orange} />

        <text x={W / 2} y={220} textAnchor="middle" fontSize="9" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Q 来自 decoder 自身，K/V 来自外部 encoder — 用于翻译、多模态等跨序列场景
        </text>
      </StepSvg>
    ),
  },
];

export default function CrossVsSelfAttention() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/CrossVsSelfAttention.tsx
git commit -m "feat: add CrossVsSelfAttention StepNavigator (self vs cross data flow)"
```

---

### Task 10: MLACompression

**Files:**
- Create: `src/components/interactive/MLACompression.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

export default function MLACompression() {
  const [dModel, setDModel] = useState(4096);
  const [numHeads, setNumHeads] = useState(32);
  const [numKvHeads, setNumKvHeads] = useState(8);
  const [latentDim, setLatentDim] = useState(512);
  const [seqLen, setSeqLen] = useState(4096);

  const headDim = dModel / numHeads;

  const results = useMemo(() => {
    const bytesPerParam = 2; // FP16
    const mha = 2 * numHeads * headDim * seqLen * bytesPerParam;
    const gqa = 2 * numKvHeads * headDim * seqLen * bytesPerParam;
    const mla = latentDim * seqLen * bytesPerParam;
    const toMB = (b: number) => b / (1024 * 1024);
    return {
      mha: toMB(mha),
      gqa: toMB(gqa),
      mla: toMB(mla),
      maxMB: toMB(mha),
    };
  }, [numHeads, numKvHeads, headDim, latentDim, seqLen]);

  const barData = [
    { label: 'MHA', value: results.mha, color: '#93c5fd' },
    { label: `GQA (${numKvHeads}h)`, value: results.gqa, color: COLORS.orange },
    { label: 'MLA', value: results.mla, color: COLORS.green },
  ];

  const barAreaX = 140;
  const barMaxW = 380;
  const barH = 28;
  const barGap = 12;
  const barStartY = 160;

  return (
    <div className="my-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 px-2">
        <div>
          <label className="text-xs text-gray-500 block">d_model: {dModel}</label>
          <input type="range" min={1024} max={8192} step={1024} value={dModel}
            onChange={e => setDModel(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">num_heads: {numHeads}</label>
          <input type="range" min={8} max={64} step={8} value={numHeads}
            onChange={e => setNumHeads(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">GQA kv_heads: {numKvHeads}</label>
          <input type="range" min={1} max={numHeads} step={1} value={numKvHeads}
            onChange={e => setNumKvHeads(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">MLA latent_dim: {latentDim}</label>
          <input type="range" min={64} max={2048} step={64} value={latentDim}
            onChange={e => setLatentDim(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">seq_len: {seqLen}</label>
          <input type="range" min={512} max={32768} step={512} value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          KV Cache 大小对比 (FP16, seq_len={seqLen})
        </text>

        {/* Formula summary */}
        <text x={W / 2} y={42} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.mono}>
          head_dim = d_model / num_heads = {dModel} / {numHeads} = {headDim}
        </text>

        {/* Formulas */}
        {[
          `MHA: 2 × ${numHeads} heads × ${headDim} dim × ${seqLen} seq × 2B = ${results.mha.toFixed(1)} MB`,
          `GQA: 2 × ${numKvHeads} kv_heads × ${headDim} dim × ${seqLen} seq × 2B = ${results.gqa.toFixed(1)} MB`,
          `MLA: ${latentDim} latent_dim × ${seqLen} seq × 2B = ${results.mla.toFixed(1)} MB`,
        ].map((text, i) => (
          <text key={i} x={30} y={65 + i * 16} fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.mono}>{text}</text>
        ))}

        {/* Bars */}
        {barData.map((item, i) => {
          const y = barStartY + i * (barH + barGap);
          const barW = results.maxMB > 0
            ? Math.max(2, (item.value / results.maxMB) * barMaxW) : 2;
          const pct = results.mha > 0 ? ((item.value / results.mha) * 100).toFixed(0) : '0';
          return (
            <g key={i}>
              <text x={barAreaX - 8} y={y + barH / 2 + 1} textAnchor="end"
                dominantBaseline="middle" fontSize="9" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{item.label}</text>
              <rect x={barAreaX} y={y} width={barMaxW} height={barH} rx={4}
                fill="#f1f5f9" />
              <rect x={barAreaX} y={y} width={barW} height={barH} rx={4}
                fill={item.color} opacity={0.75} />
              <text x={barAreaX + barW + 6} y={y + barH / 2 + 1}
                dominantBaseline="middle" fontSize="8" fontWeight="700"
                fill={item.color} fontFamily={FONTS.mono}>
                {item.value.toFixed(1)} MB ({pct}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MLACompression.tsx
git commit -m "feat: add MLACompression interactive calculator (MHA vs GQA vs MLA)"
```

---

### Task 11: MLADataFlow

**Files:**
- Create: `src/components/interactive/MLADataFlow.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 200;

function FlowBox({ x, y, w, h, label, sub, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 5 : h / 2 + 1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          dominantBaseline="middle" fontSize="7" fill={COLORS.mid} fontFamily={FONTS.mono}>
          {sub}
        </text>
      )}
    </g>
  );
}

export default function MLADataFlow() {
  const boxes = [
    { x: 10, y: 60, w: 90, h: 50, label: 'Hidden\nState h', sub: 'd_model', fill: '#dbeafe', stroke: COLORS.primary },
    { x: 120, y: 60, w: 90, h: 50, label: 'Compress\nW_DKV', sub: 'd → d_c', fill: '#fef3c7', stroke: COLORS.orange },
    { x: 230, y: 55, w: 90, h: 60, label: 'Cache\nc_KV', sub: 'd_c (小!)', fill: '#dcfce7', stroke: COLORS.green },
    { x: 340, y: 40, w: 90, h: 40, label: 'W_UK → K', sub: 'd_c → d_k', fill: '#fef3c7', stroke: COLORS.orange },
    { x: 340, y: 90, w: 90, h: 40, label: 'W_UV → V', sub: 'd_c → d_v', fill: '#fef3c7', stroke: COLORS.orange },
    { x: 470, y: 60, w: 90, h: 50, label: 'Attention\nOutput', sub: '', fill: '#dbeafe', stroke: COLORS.primary },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        MLA: Multi-Latent Attention 数据流
      </text>

      <text x={W / 2} y={36} textAnchor="middle" fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        只缓存低维 c_KV（如 512 维），推理时解压为完整 K、V
      </text>

      {boxes.map((b, i) => (
        <FlowBox key={i} {...b} />
      ))}

      {/* Arrows */}
      <defs>
        <marker id="mla-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* h → compress */}
      <line x1={100} y1={85} x2={118} y2={85}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* compress → cache */}
      <line x1={210} y1={85} x2={228} y2={85}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* cache → K */}
      <line x1={320} y1={75} x2={338} y2={62}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* cache → V */}
      <line x1={320} y1={95} x2={338} y2={108}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* K → attention */}
      <line x1={430} y1={60} x2={468} y2={78}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* V → attention */}
      <line x1={430} y1={110} x2={468} y2={92}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />

      {/* Highlight cache saving */}
      <rect x={228} y={125} width={96} height={22} rx={4}
        fill={COLORS.green} opacity={0.12} stroke={COLORS.green} strokeWidth={1} strokeDasharray="3,2" />
      <text x={276} y={140} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        缓存点 — 大幅节省显存
      </text>

      {/* Bottom note */}
      <text x={W / 2} y={175} textAnchor="middle" fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        推理优化：W_UK 可吸收进 W_Q，避免显式解压 K — 进一步减少计算
      </text>

      <text x={W / 2} y={192} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        采用者：DeepSeek-V2, DeepSeek-V3, DeepSeek-R1
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MLADataFlow.tsx
git commit -m "feat: add MLADataFlow static SVG (compress → cache → decompress)"
```

---

### Task 12: AttentionVariantComparison

**Files:**
- Create: `src/components/interactive/AttentionVariantComparison.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS } from './shared/colors';

interface Variant {
  name: string;
  complexity: string;
  kvCache: string;
  coreIdea: string;
  models: string;
  extrapolation: string;
}

const VARIANTS: Variant[] = [
  {
    name: 'Full MHA',
    complexity: 'O(n²d)',
    kvCache: '2 × n_heads × d_head × seq',
    coreIdea: '每个 head 独立 Q/K/V，完整注意力',
    models: 'GPT-2/3, LLaMA-1, BERT',
    extrapolation: '受限于训练长度',
  },
  {
    name: 'GQA',
    complexity: 'O(n²d)',
    kvCache: '2 × n_kv_heads × d_head × seq',
    coreIdea: '多个 Q head 共享 KV head，减少 KV 缓存',
    models: 'LLaMA-2/3, Gemma, Qwen',
    extrapolation: '受限于训练长度',
  },
  {
    name: 'Sliding Window',
    complexity: 'O(nwd)',
    kvCache: '2 × n_heads × d_head × w',
    coreIdea: '每个 token 只 attend 前 w 个，堆叠扩大感受野',
    models: 'Mistral 7B, Mixtral, Gemma 2 (交替层)',
    extrapolation: '理论上无限长（滑动窗口）',
  },
  {
    name: 'Cross Attention',
    complexity: 'O(n·m·d)',
    kvCache: '2 × n_heads × d_head × m (encoder)',
    coreIdea: 'Q 来自 decoder，KV 来自 encoder/视觉',
    models: 'T5, BART, Flamingo, LLaVA',
    extrapolation: '取决于 encoder 序列长度',
  },
  {
    name: 'MLA',
    complexity: 'O(n²d)',
    kvCache: 'latent_dim × seq (极小)',
    coreIdea: '低秩压缩 KV cache，存 compressed latent',
    models: 'DeepSeek-V2, V3, R1',
    extrapolation: '受限于训练长度',
  },
  {
    name: 'Hybrid',
    complexity: '混合',
    kvCache: '分层不同',
    coreIdea: '混合不同 attention 类型（full + SWA / SSM）',
    models: 'Gemma 2, Jamba, Command-R',
    extrapolation: '取长补短',
  },
];

const columns: { key: keyof Variant; label: string; width: string }[] = [
  { key: 'name', label: '方法', width: 'w-28' },
  { key: 'complexity', label: '计算复杂度', width: 'w-24' },
  { key: 'kvCache', label: 'KV Cache', width: 'w-40' },
  { key: 'coreIdea', label: '核心思想', width: 'flex-1' },
];

export default function AttentionVariantComparison() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            {columns.map(col => (
              <th key={col.key} className={`px-3 py-2 text-left text-xs font-semibold text-gray-600 ${col.width}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VARIANTS.map((v, i) => (
            <tr key={i}
              className={`border-b last:border-b-0 transition-colors cursor-pointer
                ${hoveredIdx === i ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}>
              <td className="px-3 py-2 font-semibold text-gray-800">{v.name}</td>
              <td className="px-3 py-2 font-mono text-xs text-gray-600">{v.complexity}</td>
              <td className="px-3 py-2 font-mono text-xs text-gray-600">{v.kvCache}</td>
              <td className="px-3 py-2 text-gray-700">{v.coreIdea}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail panel */}
      {hoveredIdx !== null && (
        <div className="px-4 py-3 bg-blue-50 border-t text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-xs text-gray-500">代表模型：</span>
              <span className="ml-1 font-medium" style={{ color: COLORS.primary }}>
                {VARIANTS[hoveredIdx].models}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">长度外推：</span>
              <span className="ml-1">{VARIANTS[hoveredIdx].extrapolation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/AttentionVariantComparison.tsx
git commit -m "feat: add AttentionVariantComparison interactive table with hover details"
```

---

### Task 13: Attention Variants MDX Article

**Files:**
- Create: `src/content/articles/zh/attention-variants.mdx`

- [ ] **Step 1: Create article file**

```mdx
---
title: "Attention 变体：从 Sliding Window 到 MLA"
slug: attention-variants
locale: zh
difficulty: advanced
tags: [transformer, attention, mla, sliding-window, cross-attention]
prerequisites: [multi-head-attention, gqa-mqa, flash-attention]
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: paper
    title: "Mistral 7B"
    url: "https://arxiv.org/abs/2310.06825"
  - type: paper
    title: "Gemma 2 Technical Report"
    url: "https://arxiv.org/abs/2408.00118"
  - type: paper
    title: "Jamba: A Hybrid Transformer-Mamba Language Model"
    url: "https://arxiv.org/abs/2403.19887"
  - type: paper
    title: "Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer (T5)"
    url: "https://arxiv.org/abs/1910.10683"
  - type: paper
    title: "Flamingo: a Visual Language Model for Few-Shot Learning"
    url: "https://arxiv.org/abs/2204.14198"
  - type: paper
    title: "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model"
    url: "https://arxiv.org/abs/2405.04434"
---

import SlidingWindowVsFullMask from '../../../components/interactive/SlidingWindowVsFullMask.tsx';
import HybridLayerStack from '../../../components/interactive/HybridLayerStack.tsx';
import CrossVsSelfAttention from '../../../components/interactive/CrossVsSelfAttention.tsx';
import MLACompression from '../../../components/interactive/MLACompression.tsx';
import MLADataFlow from '../../../components/interactive/MLADataFlow.tsx';
import AttentionVariantComparison from '../../../components/interactive/AttentionVariantComparison.tsx';

标准的 Multi-Head Attention 面临三大瓶颈：$O(n^2)$ 计算复杂度、KV cache 显存占用、长上下文处理。前面我们已经看过 [GQA/MQA](/zh/articles/gqa-mqa) 如何通过共享 KV head 来减少缓存，这里进一步介绍其他重要的 attention 变体。

三个优化方向：
- **稀疏化**：减少每个 token 需要 attend 的范围（Sliding Window Attention）
- **压缩 KV**：减少每个位置存储的信息量（MLA）
- **混合架构**：不同层用不同策略，取长补短（Hybrid Attention）

## Sliding Window Attention

核心思想：每个 token 只 attend 前 $w$ 个 token，而非整个序列。

$$\text{Attention}(q_i, K, V) = \text{softmax}\left(\frac{q_i \cdot K_{[i-w+1:i]}^T}{\sqrt{d_k}}\right) V_{[i-w+1:i]}$$

这将复杂度从 $O(n^2)$ 降到 $O(nw)$。看起来损失了全局信息？其实不然 — 多层堆叠后，第 $L$ 层的有效感受野为 $L \times w$。例如 Mistral 7B 有 32 层、窗口 $w=4096$，理论感受野覆盖 $32 \times 4096 = 131072$ 个 token。

<SlidingWindowVsFullMask client:visible />

**采用者：** Mistral 7B ($w=4096$), Mixtral 8x7B ($w=4096$), Gemma 2（交替层使用）。

Sliding Window 还能和 [Flash Attention](/zh/articles/flash-attention) 完美结合 — 窗口内的计算用 Flash Attention 的 tiling 策略高效完成，窗口外的直接跳过。

## Hybrid Attention

不是所有层都需要 full attention — 将不同类型的 attention 混合使用，让每种类型发挥特长。

常见做法：
- **Gemma 2**：偶数层 full attention + 奇数层 sliding window attention
- **Jamba** (AI21)：Attention 层 + Mamba (SSM) 层交替，1:3 的比例
- **Command-R** (Cohere)：部分层 full attention + 部分层 local attention

<HybridLayerStack />

设计选择的关键问题：full attention 层放哪里？比例怎么定？经验表明：靠近输出的层更需要全局信息（全局层放上面），靠近输入的层局部模式就够了。

## Cross Attention

前面的 attention 变体都是 self-attention（Q/K/V 来自同一序列）。Cross attention 的核心区别是 **Q 来自一个序列，K/V 来自另一个序列**。

<CrossVsSelfAttention client:visible />

### 典型场景

**Encoder-Decoder 架构**（翻译、摘要）：
- Decoder 的 hidden state 作为 Q
- Encoder 的输出作为 K 和 V
- 每个 decoder token "查询" encoder 的完整输入，决定关注输入的哪些部分
- **采用者**：T5, BART

**多模态架构**（图文理解）：
- 文本 decoder 的 token 作为 Q
- Vision encoder 输出的图像 token 作为 K 和 V
- 文本 token "查询" 图像 token，融合视觉信息
- **采用者**：Flamingo, LLaVA

和 self-attention 相比，cross attention 的 KV cache 行为不同：KV 来自 encoder 的固定输出，不会随着生成增长。

## Multi-Latent Attention (MLA)

GQA 通过 **共享 KV head** 减少缓存，那能不能更激进？MLA 的思路是对 KV cache 做 **低秩压缩**，不存完整的 K 和 V，而是存一个低维的 compressed latent $c_{KV}$。

**压缩过程：**

$$c_{KV} = W_{DKV} \cdot h \quad \text{（h 是 hidden state, } d_{model} \to d_c \text{）}$$

$$K = W_{UK} \cdot c_{KV}, \quad V = W_{UV} \cdot c_{KV} \quad \text{（解压：} d_c \to d_k, d_v \text{）}$$

只需缓存 $c_{KV}$（维度远小于 K+V）。推理时再用 $W_{UK}$、$W_{UV}$ 解压。更妙的是，$W_{UK}$ 可以吸收进 $W_Q$ 的矩阵乘法中，避免显式解压。

<MLADataFlow />

下面的计算器可以对比不同配置下 MHA、GQA、MLA 的 KV cache 大小：

<MLACompression client:visible />

以 DeepSeek-V2 为例（$d_{model}=5120$, 128 heads, $d_c=512$）：MLA 的 KV cache 只有标准 MHA 的约 **5%**。

**采用者：** DeepSeek-V2, DeepSeek-V3, DeepSeek-R1

## 对比总结

<AttentionVariantComparison client:visible />

**选型指南：**
- 长上下文 + 低延迟 → Sliding Window（Mistral 方案）
- 极致 KV cache 压缩 → MLA（DeepSeek 方案）
- 跨模态 / Encoder-Decoder → Cross Attention
- 平衡方案 → Hybrid（Gemma 2 方案）
- 通用 KV 节省 → GQA（目前最主流的折中选择）
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes, new article page generated

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/attention-variants.mdx
git commit -m "feat: add Attention Variants article (SWA, Hybrid, Cross, MLA)"
```

---

### Task 14: Update transformer-core.yaml (Attention Variants)

**Files:**
- Modify: `src/content/paths/transformer-core.yaml`

> **Note:** This task adds `attention-variants` to the path. The final full YAML update (including MoE) is in Task 28.

- [ ] **Step 1: Read current transformer-core.yaml and add attention-variants after gqa-mqa**

The current file likely has these articles (some may be missing). Ensure `attention-variants` is placed **after** `gqa-mqa` in the articles list.

Current expected order through the attention section:
```yaml
  - multi-head-attention
  - gqa-mqa
  - attention-variants    # ← INSERT HERE
  - kv-cache
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/transformer-core.yaml
git commit -m "feat: add attention-variants to transformer-core learning path"
```

---

## Article 3: Mixture of Experts (New Article)

### Task 15: MoEBasicFlow

**Files:**
- Create: `src/components/interactive/MoEBasicFlow.tsx`

- [ ] **Step 1: Create component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

const W = 580;
const NUM_EXPERTS = 8;
const TOP_K = 2;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function ExpertBox({ x, y, w, h, idx, active, score, selected }: {
  x: number; y: number; w: number; h: number; idx: number;
  active: boolean; score?: number; selected?: boolean;
}) {
  const fill = selected ? '#dbeafe' : active ? '#f8fafc' : COLORS.masked;
  const stroke = selected ? COLORS.primary : active ? '#94a3b8' : '#d1d5db';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={fill} stroke={stroke} strokeWidth={selected ? 2 : 1} />
      <text x={x + w / 2} y={y + h / 2 - (score !== undefined ? 4 : 0)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontWeight={selected ? '700' : '500'}
        fill={selected ? COLORS.primary : COLORS.dark} fontFamily={FONTS.sans}>
        E{idx}
      </text>
      {score !== undefined && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          fontSize="7" fill={selected ? COLORS.primary : COLORS.mid}
          fontFamily={FONTS.mono} fontWeight={selected ? '700' : '400'}>
          {score.toFixed(2)}
        </text>
      )}
    </g>
  );
}

// Fixed scores for demonstration
const scores = [0.05, 0.12, 0.35, 0.08, 0.22, 0.03, 0.11, 0.04];
const topIdx = scores.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s - a.s)
  .slice(0, TOP_K)
  .map(x => x.i);
const totalWeight = topIdx.reduce((sum, i) => sum + scores[i], 0);
const weights = topIdx.map(i => scores[i] / totalWeight);

const expertW = 52;
const expertH = 40;
const expertGap = 10;
const expertsStartX = (W - NUM_EXPERTS * (expertW + expertGap) + expertGap) / 2;
const expertsY = 100;

const steps = [
  {
    title: 'Router 打分',
    content: (
      <StepSvg h={220}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 1: Token 进入 Router，对每个 Expert 打分
        </text>

        {/* Input token */}
        <rect x={W / 2 - 40} y={40} width={80} height={28} rx={14}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={W / 2} y={57} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Token x</text>

        {/* Router */}
        <text x={W / 2} y={85} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.mono}>g = softmax(W_g · x)</text>

        {/* Experts with scores */}
        {scores.map((score, i) => (
          <ExpertBox key={i}
            x={expertsStartX + i * (expertW + expertGap)} y={expertsY}
            w={expertW} h={expertH} idx={i} active={true} score={score} />
        ))}

        {/* Arrow from token to experts */}
        <defs>
          <marker id="moe-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        <text x={W / 2} y={165} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Router（小型线性层）为每个 expert 输出一个概率分数
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Top-K 选择',
    content: (
      <StepSvg h={220}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 2: Top-{TOP_K} 选择（高亮被选中的 Expert）
        </text>

        <rect x={W / 2 - 40} y={40} width={80} height={28} rx={14}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={W / 2} y={57} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Token x</text>

        <text x={W / 2} y={85} textAnchor="middle" fontSize="8" fill={COLORS.primary}
          fontFamily={FONTS.mono} fontWeight="600">
          选择分数最高的 {TOP_K} 个: E{topIdx[0]} ({scores[topIdx[0]].toFixed(2)}) + E{topIdx[1]} ({scores[topIdx[1]].toFixed(2)})
        </text>

        {scores.map((score, i) => (
          <ExpertBox key={i}
            x={expertsStartX + i * (expertW + expertGap)} y={expertsY}
            w={expertW} h={expertH} idx={i}
            active={topIdx.includes(i)} score={score}
            selected={topIdx.includes(i)} />
        ))}

        <text x={W / 2} y={165} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          未选中的 expert 不参与计算 — 这就是 "稀疏" 的含义
        </text>

        <text x={W / 2} y={185} textAnchor="middle" fontSize="8" fill={COLORS.green}
          fontFamily={FONTS.sans} fontWeight="600">
          每个 token 只激活 {TOP_K}/{NUM_EXPERTS} 的 expert → 计算量仅为 dense 的 {(TOP_K / NUM_EXPERTS * 100).toFixed(0)}%
        </text>
      </StepSvg>
    ),
  },
  {
    title: '加权合并',
    content: (
      <StepSvg h={250}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 3: 选中 Expert 并行计算，输出加权合并
        </text>

        <rect x={W / 2 - 40} y={40} width={80} height={28} rx={14}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={W / 2} y={57} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Token x</text>

        {/* Two selected experts */}
        {topIdx.map((ei, i) => {
          const cx = W / 2 + (i === 0 ? -100 : 100);
          return (
            <g key={i}>
              <line x1={W / 2} y1={68} x2={cx} y2={88}
                stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#moe-arr)" />
              <rect x={cx - 55} y={90} width={110} height={35} rx={6}
                fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
              <text x={cx} y={105} textAnchor="middle" fontSize="9" fontWeight="600"
                fill={COLORS.primary} fontFamily={FONTS.sans}>
                E{ei}(x)
              </text>
              <text x={cx} y={118} textAnchor="middle" fontSize="7"
                fill={COLORS.mid} fontFamily={FONTS.mono}>
                weight = {weights[i].toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Merge */}
        <line x1={W / 2 - 100} y1={125} x2={W / 2} y2={155}
          stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#moe-arr)" />
        <line x1={W / 2 + 100} y1={125} x2={W / 2} y2={155}
          stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#moe-arr)" />

        <rect x={W / 2 - 60} y={155} width={120} height={30} rx={6}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
        <text x={W / 2} y={173} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          y = Σ gᵢ · Eᵢ(x)
        </text>

        <defs>
          <marker id="moe-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>

        <text x={W / 2} y={210} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.mono}>
          y = {weights[0].toFixed(2)} · E{topIdx[0]}(x) + {weights[1].toFixed(2)} · E{topIdx[1]}(x)
        </text>

        <text x={W / 2} y={235} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          权重经过 renormalize（选中 expert 的分数归一化为 1）
        </text>
      </StepSvg>
    ),
  },
];

export default function MoEBasicFlow() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MoEBasicFlow.tsx
git commit -m "feat: add MoEBasicFlow StepNavigator (router → select → combine)"
```

---

### Task 16: DenseVsMoECompare

**Files:**
- Create: `src/components/interactive/DenseVsMoECompare.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 260;

export default function DenseVsMoECompare() {
  const leftX = 40;
  const rightX = 310;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Dense FFN vs MoE FFN
      </text>

      {/* Dense side */}
      <text x={leftX + 110} y={46} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Dense Transformer</text>

      {/* Input */}
      <rect x={leftX + 60} y={55} width={100} height={25} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={leftX + 110} y={71} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Attention</text>

      {/* Single large FFN */}
      <rect x={leftX + 30} y={95} width={160} height={60} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={leftX + 110} y={122} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>FFN</text>
      <text x={leftX + 110} y={140} textAnchor="middle" fontSize="7"
        fill={COLORS.mid} fontFamily={FONTS.mono}>d_model → 4·d_model → d_model</text>

      {/* Output */}
      <rect x={leftX + 60} y={170} width={100} height={25} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={leftX + 110} y={186} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Output</text>

      {/* Stats */}
      <text x={leftX + 110} y={215} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Total params ≈ Active params</text>
      <text x={leftX + 110} y={230} textAnchor="middle" fontSize="8"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        例: 7B params → 7B active
      </text>

      {/* MoE side */}
      <text x={rightX + 120} y={46} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>MoE Transformer</text>

      <rect x={rightX + 70} y={55} width={100} height={25} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={rightX + 120} y={71} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Attention</text>

      {/* Router */}
      <rect x={rightX + 85} y={88} width={70} height={18} rx={9}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
      <text x={rightX + 120} y={100} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>Router</text>

      {/* Multiple small experts */}
      {Array.from({ length: 8 }, (_, i) => {
        const ex = rightX + 5 + i * 30;
        const ey = 112;
        const isActive = i === 2 || i === 4;
        return (
          <rect key={i} x={ex} y={ey} width={26} height={40} rx={4}
            fill={isActive ? '#fef3c7' : COLORS.masked}
            stroke={isActive ? COLORS.orange : '#d1d5db'}
            strokeWidth={isActive ? 1.5 : 0.5} />
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const ex = rightX + 5 + i * 30;
        return (
          <text key={i} x={ex + 13} y={136} textAnchor="middle" fontSize="7"
            fill={i === 2 || i === 4 ? COLORS.orange : COLORS.mid}
            fontWeight={i === 2 || i === 4 ? '700' : '400'}
            fontFamily={FONTS.sans}>
            E{i}
          </text>
        );
      })}

      <rect x={rightX + 70} y={170} width={100} height={25} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={rightX + 120} y={186} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Output</text>

      {/* Stats */}
      <text x={rightX + 120} y={215} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Total params >> Active params</text>
      <text x={rightX + 120} y={230} textAnchor="middle" fontSize="8"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        例: Mixtral 47B total → ~13B active (top-2 of 8)
      </text>

      {/* Divider */}
      <line x1={W / 2} y1={40} x2={W / 2} y2={240}
        stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />
    </svg>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/DenseVsMoECompare.tsx
git commit -m "feat: add DenseVsMoECompare static SVG (Dense vs MoE side-by-side)"
```

---

### Task 17: RoutingStrategyCompare

**Files:**
- Create: `src/components/interactive/RoutingStrategyCompare.tsx`

- [ ] **Step 1: Create component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

const TOKENS = ['I', 'love', 'large', 'models'];
const EXPERTS = ['E0', 'E1', 'E2', 'E3'];

// Token-choice: each token picks top-K experts
const tokenChoices = [
  [1, 2],  // "I" → E1, E2
  [0, 3],  // "love" → E0, E3
  [2, 3],  // "large" → E2, E3
  [1, 2],  // "models" → E1, E2
];

// Expert-choice: each expert picks top-K tokens
const expertChoices = [
  [1],     // E0 picks "love"
  [0, 3],  // E1 picks "I", "models"
  [0, 2],  // E2 picks "I", "large"
  [1, 2],  // E3 picks "love", "large"
];

const tokenY = 60;
const expertY = 160;
const tokenStartX = 80;
const expertStartX = 80;
const tokenGap = 120;
const expertGap = 120;

const steps = [
  {
    title: 'Token-Choice',
    content: (
      <StepSvg h={260}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Token-Choice Routing: 每个 token 选 top-K expert
        </text>

        <text x={20} y={tokenY + 15} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Tokens:
        </text>
        <text x={20} y={expertY + 15} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Experts:
        </text>

        {/* Tokens */}
        {TOKENS.map((t, i) => (
          <g key={i}>
            <rect x={tokenStartX + i * tokenGap} y={tokenY} width={70} height={28} rx={14}
              fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={tokenStartX + i * tokenGap + 35} y={tokenY + 17}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans}>{t}</text>
          </g>
        ))}

        {/* Experts */}
        {EXPERTS.map((e, i) => (
          <g key={i}>
            <rect x={expertStartX + i * expertGap} y={expertY} width={70} height={28} rx={6}
              fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={expertStartX + i * expertGap + 35} y={expertY + 17}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>{e}</text>
          </g>
        ))}

        {/* Arrows: token → expert */}
        <defs>
          <marker id="rsc-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>
        {tokenChoices.flatMap((choices, ti) =>
          choices.map((ei, ci) => {
            const tx = tokenStartX + ti * tokenGap + 35;
            const ex = expertStartX + ei * expertGap + 35;
            return (
              <line key={`${ti}-${ci}`}
                x1={tx} y1={tokenY + 28}
                x2={ex} y2={expertY}
                stroke={HEAD_COLORS[ti % HEAD_COLORS.length]}
                strokeWidth={1.5} opacity={0.6}
                markerEnd="url(#rsc-arr)" />
            );
          })
        )}

        <text x={W / 2} y={215} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          每个 token 的视角出发 — 简单，但 expert 负载可能不均
        </text>
        <text x={W / 2} y={235} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          采用者：Mixtral (top-2), Switch Transformer (top-1), DeepSeek-V3 (top-8)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Expert-Choice',
    content: (
      <StepSvg h={260}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Expert-Choice Routing: 每个 expert 选 top-K token
        </text>

        <text x={20} y={tokenY + 15} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Tokens:
        </text>
        <text x={20} y={expertY + 15} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Experts:
        </text>

        {TOKENS.map((t, i) => (
          <g key={i}>
            <rect x={tokenStartX + i * tokenGap} y={tokenY} width={70} height={28} rx={14}
              fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={tokenStartX + i * tokenGap + 35} y={tokenY + 17}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans}>{t}</text>
          </g>
        ))}

        {EXPERTS.map((e, i) => (
          <g key={i}>
            <rect x={expertStartX + i * expertGap} y={expertY} width={70} height={28} rx={6}
              fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={expertStartX + i * expertGap + 35} y={expertY + 17}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>{e}</text>
          </g>
        ))}

        {/* Arrows: expert → token (reversed direction visually) */}
        <defs>
          <marker id="rsc-arr2" viewBox="0 0 10 10" refX="0" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 10 0 L 0 5 L 10 10 z" fill={COLORS.orange} />
          </marker>
        </defs>
        {expertChoices.flatMap((choices, ei) =>
          choices.map((ti, ci) => {
            const tx = tokenStartX + ti * tokenGap + 35;
            const ex = expertStartX + ei * expertGap + 35;
            return (
              <line key={`${ei}-${ci}`}
                x1={ex} y1={expertY}
                x2={tx} y2={tokenY + 28}
                stroke={HEAD_COLORS[(ei + 4) % HEAD_COLORS.length]}
                strokeWidth={1.5} opacity={0.6}
                markerEnd="url(#rsc-arr2)" />
            );
          })
        )}

        <text x={W / 2} y={215} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          每个 expert 的视角出发 — 负载天然均匀，但某些 token 可能被丢弃
        </text>
        <text x={W / 2} y={235} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          采用者：部分 Switch Transformer 变体
        </text>
      </StepSvg>
    ),
  },
];

export default function RoutingStrategyCompare() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/RoutingStrategyCompare.tsx
git commit -m "feat: add RoutingStrategyCompare StepNavigator (token-choice vs expert-choice)"
```

---

### Task 18: LoadBalanceViz

**Files:**
- Create: `src/components/interactive/LoadBalanceViz.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

const W = 580;
const H = 260;
const NUM_EXPERTS = 8;

// Simulated load distribution based on aux loss coefficient
function getLoadDistribution(alpha: number): number[] {
  // At alpha=0: highly skewed (power law). At alpha=0.1: nearly uniform.
  // Use a simple exponential decay model
  const raw = Array.from({ length: NUM_EXPERTS }, (_, i) => {
    const skew = Math.exp(-i * 0.8); // natural skew
    const uniform = 1 / NUM_EXPERTS;
    return skew * (1 - alpha * 10) + uniform * (alpha * 10);
  });
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map(v => v / total);
}

export default function LoadBalanceViz() {
  const [alpha, setAlpha] = useState(0);

  const loads = useMemo(() => getLoadDistribution(alpha), [alpha]);
  const maxLoad = Math.max(...loads);

  const barStartX = 80;
  const barMaxW = 400;
  const barH = 22;
  const barGap = 6;
  const barStartY = 75;
  const idealLoad = 1 / NUM_EXPERTS;

  return (
    <div className="my-6">
      <div className="flex items-center justify-center gap-4 mb-3">
        <label className="text-xs text-gray-500">
          Aux Loss 系数 α = {alpha.toFixed(3)}
          <input type="range" min={0} max={0.1} step={0.005} value={alpha}
            onChange={e => setAlpha(Number(e.target.value))} className="ml-2 w-40" />
        </label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Expert 负载分布 (α = {alpha.toFixed(3)})
        </text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {alpha === 0
            ? '无 aux loss: 少数 expert 承担大部分 token（expert collapse）'
            : alpha >= 0.08
              ? 'aux loss 足够大: 负载接近均匀'
              : 'aux loss 逐渐增大: 负载趋于均衡'}
        </text>

        {/* Ideal load line */}
        {(() => {
          const idealX = barStartX + (idealLoad / maxLoad) * barMaxW;
          return (
            <g>
              <line x1={idealX} y1={barStartY - 5} x2={idealX}
                y2={barStartY + NUM_EXPERTS * (barH + barGap)}
                stroke={COLORS.green} strokeWidth={1} strokeDasharray="4,3" />
              <text x={idealX} y={barStartY - 8} textAnchor="middle"
                fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
                ideal = {(idealLoad * 100).toFixed(1)}%
              </text>
            </g>
          );
        })()}

        {loads.map((load, i) => {
          const y = barStartY + i * (barH + barGap);
          const barW = (load / maxLoad) * barMaxW;
          const overloaded = load > idealLoad * 1.5;
          const color = overloaded ? COLORS.red : HEAD_COLORS[i % HEAD_COLORS.length];
          return (
            <g key={i}>
              <text x={barStartX - 8} y={y + barH / 2 + 1} textAnchor="end"
                dominantBaseline="middle" fontSize="8" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>E{i}</text>
              <rect x={barStartX} y={y} width={barMaxW} height={barH} rx={3}
                fill="#f1f5f9" />
              <rect x={barStartX} y={y} width={barW} height={barH} rx={3}
                fill={color} opacity={0.7} />
              <text x={barStartX + barW + 5} y={y + barH / 2 + 1}
                dominantBaseline="middle" fontSize="7" fontWeight="600"
                fill={color} fontFamily={FONTS.mono}>
                {(load * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Formula */}
        <text x={W / 2} y={H - 18} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily={FONTS.mono}>
          L_aux = α · N · Σᵢ fᵢ · Pᵢ （fᵢ = 实际接收比例, Pᵢ = router 分配概率均值）
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/LoadBalanceViz.tsx
git commit -m "feat: add LoadBalanceViz interactive (adjustable aux loss coefficient)"
```

---

### Task 19: DeepSeekMoEArchitecture

**Files:**
- Create: `src/components/interactive/DeepSeekMoEArchitecture.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

export default function DeepSeekMoEArchitecture() {
  const numRouted = 8; // showing 8 of 256 for visual clarity
  const inputY = 240;
  const sharedY = 140;
  const routedY = 140;
  const routerY = 105;
  const mergeY = 60;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        DeepSeek MoE: Shared Expert + Fine-Grained Routed Expert
      </text>

      <text x={W / 2} y={36} textAnchor="middle" fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        DeepSeek-V3: 1 shared expert + 256 routed experts, top-8
      </text>

      <defs>
        <marker id="ds-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Input token */}
      <rect x={W / 2 - 50} y={inputY} width={100} height={25} rx={12}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={W / 2} y={inputY + 16} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Token x</text>

      {/* Shared expert path (left) */}
      <line x1={W / 2 - 30} y1={inputY} x2={100} y2={sharedY + 45}
        stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#ds-arr)" />

      <rect x={40} y={sharedY} width={120} height={45} rx={6}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={2} />
      <text x={100} y={sharedY + 18} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.green} fontFamily={FONTS.sans}>Shared Expert</text>
      <text x={100} y={sharedY + 32} textAnchor="middle" fontSize="7"
        fill={COLORS.mid} fontFamily={FONTS.sans}>所有 token 必经</text>

      {/* Router */}
      <line x1={W / 2 + 30} y1={inputY} x2={W / 2 + 30} y2={routerY + 18}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#ds-arr)" />

      <rect x={W / 2 - 10} y={routerY} width={80} height={18} rx={9}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={W / 2 + 30} y={routerY + 12} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Router (Top-8)</text>

      {/* Routed experts */}
      {Array.from({ length: numRouted }, (_, i) => {
        const ex = 210 + i * 42;
        const isActive = i < 3; // highlight 3 as "selected"
        return (
          <g key={i}>
            <line x1={W / 2 + 30} y1={routerY + 18}
              x2={ex + 16} y2={routedY}
              stroke={isActive ? COLORS.orange : '#d1d5db'} strokeWidth={1}
              opacity={isActive ? 0.8 : 0.3} />
            <rect x={ex} y={routedY} width={32} height={45} rx={4}
              fill={isActive ? '#fef3c7' : COLORS.masked}
              stroke={isActive ? COLORS.orange : '#d1d5db'}
              strokeWidth={isActive ? 1.5 : 0.5} />
            <text x={ex + 16} y={routedY + 18} textAnchor="middle"
              fontSize="7" fontWeight={isActive ? '700' : '400'}
              fill={isActive ? COLORS.orange : COLORS.mid} fontFamily={FONTS.sans}>
              R{i}
            </text>
            {i === numRouted - 1 && (
              <text x={ex + 42} y={routedY + 22} fontSize="8"
                fill={COLORS.mid} fontFamily={FONTS.sans}>
                ...×256
              </text>
            )}
          </g>
        );
      })}

      {/* Merge */}
      <line x1={100} y1={sharedY} x2={W / 2} y2={mergeY + 25}
        stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#ds-arr)" />
      <line x1={320} y1={routedY} x2={W / 2} y2={mergeY + 25}
        stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#ds-arr)" />

      <rect x={W / 2 - 50} y={mergeY} width={100} height={25} rx={6}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={W / 2} y={mergeY + 16} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Output</text>

      {/* Legend */}
      <rect x={30} y={H - 22} width={10} height={10} rx={2}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
      <text x={44} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Shared (所有 token) — 兜底通用知识
      </text>

      <rect x={250} y={H - 22} width={10} height={10} rx={2}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={264} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Routed (Top-K 选择) — 细粒度专业化
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/DeepSeekMoEArchitecture.tsx
git commit -m "feat: add DeepSeekMoEArchitecture static SVG (shared + routed experts)"
```

---

### Task 20: ExpertParallelismDiagram

**Files:**
- Create: `src/components/interactive/ExpertParallelismDiagram.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

const W = 580;
const H = 280;

const NUM_GPUS = 4;
const EXPERTS_PER_GPU = 2;

export default function ExpertParallelismDiagram() {
  const gpuW = 110;
  const gpuH = 160;
  const gpuGap = 20;
  const startX = (W - NUM_GPUS * gpuW - (NUM_GPUS - 1) * gpuGap) / 2;
  const gpuY = 55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Expert Parallelism: Expert 分布在不同 GPU 上
      </text>

      <defs>
        <marker id="ep-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
        </marker>
      </defs>

      {Array.from({ length: NUM_GPUS }, (_, gi) => {
        const gx = startX + gi * (gpuW + gpuGap);
        return (
          <g key={gi}>
            {/* GPU box */}
            <rect x={gx} y={gpuY} width={gpuW} height={gpuH} rx={8}
              fill="#f8fafc" stroke={HEAD_COLORS[gi]} strokeWidth={2} />
            <text x={gx + gpuW / 2} y={gpuY + 18} textAnchor="middle"
              fontSize="9" fontWeight="700" fill={HEAD_COLORS[gi]} fontFamily={FONTS.sans}>
              GPU {gi}
            </text>

            {/* Experts inside GPU */}
            {Array.from({ length: EXPERTS_PER_GPU }, (_, ei) => {
              const ey = gpuY + 30 + ei * 35;
              const expertIdx = gi * EXPERTS_PER_GPU + ei;
              return (
                <g key={ei}>
                  <rect x={gx + 10} y={ey} width={gpuW - 20} height={28} rx={5}
                    fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
                  <text x={gx + gpuW / 2} y={ey + 17} textAnchor="middle"
                    fontSize="8" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.sans}>
                    Expert {expertIdx}
                  </text>
                </g>
              );
            })}

            {/* Token buffer at bottom */}
            <rect x={gx + 10} y={gpuY + gpuH - 40} width={gpuW - 20} height={28} rx={5}
              fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
            <text x={gx + gpuW / 2} y={gpuY + gpuH - 23} textAnchor="middle"
              fontSize="7" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              Token Buffer
            </text>
          </g>
        );
      })}

      {/* All-to-All arrows between GPUs */}
      {[
        { from: 0, to: 1, label: 'dispatch' },
        { from: 1, to: 2, label: '' },
        { from: 2, to: 3, label: 'combine' },
      ].map(({ from, to, label }, i) => {
        const x1 = startX + from * (gpuW + gpuGap) + gpuW;
        const x2 = startX + to * (gpuW + gpuGap);
        const y = gpuY + gpuH - 25;
        return (
          <g key={i}>
            <line x1={x1 + 2} y1={y - 4} x2={x2 - 2} y2={y - 4}
              stroke={COLORS.primary} strokeWidth={1} markerEnd="url(#ep-arr)" />
            <line x1={x2 - 2} y1={y + 4} x2={x1 + 2} y2={y + 4}
              stroke={COLORS.green} strokeWidth={1} markerEnd="url(#ep-arr)" />
            {label && (
              <text x={(x1 + x2) / 2} y={y - 10} textAnchor="middle"
                fontSize="6" fill={COLORS.mid} fontFamily={FONTS.sans}>{label}</text>
            )}
          </g>
        );
      })}

      {/* Flow description */}
      <text x={W / 2} y={gpuY + gpuH + 25} textAnchor="middle" fontSize="9"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        All-to-All 通信：token dispatch → expert compute → result combine
      </text>
      <text x={W / 2} y={gpuY + gpuH + 42} textAnchor="middle" fontSize="8"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        每个 GPU 上的 token 需要发送到对应 expert 所在 GPU，计算完再发回
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/ExpertParallelismDiagram.tsx
git commit -m "feat: add ExpertParallelismDiagram static SVG (multi-GPU expert distribution)"
```

---

### Task 21: MoEModelComparison

**Files:**
- Create: `src/components/interactive/MoEModelComparison.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface MoEModel {
  name: string;
  totalParams: string;
  activeParams: string;
  numExperts: string;
  topK: number;
  sharedExperts: string;
  year: string;
}

const MODELS: MoEModel[] = [
  { name: 'Switch Transformer', totalParams: '1.6T', activeParams: '~26B', numExperts: '2048', topK: 1, sharedExperts: '—', year: '2021' },
  { name: 'Mixtral 8x7B', totalParams: '47B', activeParams: '~13B', numExperts: '8', topK: 2, sharedExperts: '—', year: '2024' },
  { name: 'Mixtral 8x22B', totalParams: '141B', activeParams: '~39B', numExperts: '8', topK: 2, sharedExperts: '—', year: '2024' },
  { name: 'DeepSeek-V2', totalParams: '236B', activeParams: '21B', numExperts: '160', topK: 6, sharedExperts: '2', year: '2024' },
  { name: 'DeepSeek-V3', totalParams: '671B', activeParams: '37B', numExperts: '256', topK: 8, sharedExperts: '1', year: '2024' },
  { name: 'Qwen2.5-MoE', totalParams: '57B', activeParams: '14B', numExperts: '64', topK: 8, sharedExperts: '8', year: '2025' },
];

const cols: { key: keyof MoEModel; label: string }[] = [
  { key: 'name', label: '模型' },
  { key: 'totalParams', label: 'Total Params' },
  { key: 'activeParams', label: 'Active Params' },
  { key: 'numExperts', label: 'Experts' },
  { key: 'topK', label: 'Top-K' },
  { key: 'sharedExperts', label: 'Shared' },
  { key: 'year', label: '年份' },
];

const rowH = 22;
const headerH = 24;
const tableY = 40;

export default function MoEModelComparison() {
  const colWidths = [120, 75, 75, 60, 50, 50, 50];
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const tableX = (W - tableW) / 2;
  const H = tableY + headerH + MODELS.length * rowH + 20;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        主流 MoE 模型配置对比
      </text>

      {/* Header */}
      <rect x={tableX} y={tableY} width={tableW} height={headerH}
        fill="#f1f5f9" rx={0} />
      {cols.map((col, ci) => {
        const cx = tableX + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
        return (
          <text key={ci} x={cx + colWidths[ci] / 2} y={tableY + headerH / 2 + 1}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {col.label}
          </text>
        );
      })}

      {/* Rows */}
      {MODELS.map((model, ri) => {
        const ry = tableY + headerH + ri * rowH;
        return (
          <g key={ri}>
            {ri % 2 === 1 && (
              <rect x={tableX} y={ry} width={tableW} height={rowH} fill="#f8fafc" />
            )}
            <line x1={tableX} y1={ry} x2={tableX + tableW} y2={ry}
              stroke="#e2e8f0" strokeWidth={0.5} />
            {cols.map((col, ci) => {
              const cx = tableX + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
              const val = String(model[col.key]);
              return (
                <text key={ci} x={cx + colWidths[ci] / 2} y={ry + rowH / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="7" fill={ci === 0 ? COLORS.primary : COLORS.dark}
                  fontWeight={ci === 0 ? '600' : '400'}
                  fontFamily={ci === 0 ? FONTS.sans : FONTS.mono}>
                  {val}
                </text>
              );
            })}
          </g>
        );
      })}

      {/* Bottom border */}
      <line x1={tableX} y1={tableY + headerH + MODELS.length * rowH}
        x2={tableX + tableW} y2={tableY + headerH + MODELS.length * rowH}
        stroke="#e2e8f0" strokeWidth={0.5} />
    </svg>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MoEModelComparison.tsx
git commit -m "feat: add MoEModelComparison static SVG table"
```

---

### Task 22: Mixture of Experts MDX Article

**Files:**
- Create: `src/content/articles/zh/mixture-of-experts.mdx`

- [ ] **Step 1: Create article file**

```mdx
---
title: "Mixture of Experts：稀疏激活的大模型架构"
slug: mixture-of-experts
locale: zh
difficulty: advanced
tags: [transformer, moe, routing, deepseek, mixtral]
prerequisites: [transformer-overview]
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: paper
    title: "Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity"
    url: "https://arxiv.org/abs/2101.03961"
  - type: paper
    title: "Mixtral of Experts"
    url: "https://arxiv.org/abs/2401.04088"
  - type: paper
    title: "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model"
    url: "https://arxiv.org/abs/2405.04434"
  - type: paper
    title: "DeepSeek-V3 Technical Report"
    url: "https://arxiv.org/abs/2412.19437"
  - type: paper
    title: "GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding"
    url: "https://arxiv.org/abs/2006.16668"
---

import MoEBasicFlow from '../../../components/interactive/MoEBasicFlow.tsx';
import DenseVsMoECompare from '../../../components/interactive/DenseVsMoECompare.tsx';
import RoutingStrategyCompare from '../../../components/interactive/RoutingStrategyCompare.tsx';
import LoadBalanceViz from '../../../components/interactive/LoadBalanceViz.tsx';
import DeepSeekMoEArchitecture from '../../../components/interactive/DeepSeekMoEArchitecture.tsx';
import ExpertParallelismDiagram from '../../../components/interactive/ExpertParallelismDiagram.tsx';
import MoEModelComparison from '../../../components/interactive/MoEModelComparison.tsx';

Dense model 的核心矛盾：**参数量和计算量线性绑定**。想要更强的模型就需要更多参数，但更多参数意味着每个 token 的计算量也线性增长。

Mixture of Experts (MoE) 打破了这个绑定：**参数量大，但每个 token 只激活一小部分** — 解耦参数量和计算量。

关键数字：Mixtral 8x7B 有 47B 总参数，但每个 token 只用 ~13B active 参数的计算量 — 相当于用 7B 模型的推理成本，获得接近 47B 模型的能力。

## Sparse MoE 基本原理

标准 Transformer 中，每个 token 经过同一个 FFN 层。MoE 将这个 FFN 替换为 **N 个并行的 expert**（每个 expert 就是一个小 FFN），加上一个 **router** 决定每个 token 送给哪些 expert。

<DenseVsMoECompare />

每个 token 只被送到 Top-K 个 expert（通常 $K=1$ 或 $K=2$），输出加权求和：

$$y = \sum_{i \in \text{TopK}} g_i \cdot E_i(x), \quad g = \text{softmax}(W_g \cdot x)$$

下面的动画展示了完整的 MoE 前向流程：

<MoEBasicFlow client:visible />

## Router 机制

Router 的设计直接决定了 MoE 的效果。主要有两种思路：

<RoutingStrategyCompare client:visible />

**Token-choice routing**（主流做法）：每个 token 选 top-K expert。简单高效，但负载可能不均 — 某些 "热门" expert 被大量 token 选中，其他 expert 闲置。

**Expert-choice routing**：反过来，每个 expert 选 top-K token。负载天然均匀，但某些 token 可能不被任何 expert 选中而被丢弃。

实践中 token-choice 更常用：Mixtral (top-2), Switch Transformer (top-1), DeepSeek-V3 (top-8)。

## Load Balancing

没有约束时，router 倾向于把大部分 token 集中到少数 expert — **rich-get-richer** 现象（又叫 expert collapse）。这显然不是我们想要的。

解决方案是添加 **auxiliary loss**，鼓励 expert 负载均匀：

$$L_{aux} = \alpha \cdot N \sum_i f_i \cdot P_i$$

其中 $f_i$ 是 expert $i$ 实际接收的 token 比例，$P_i$ 是 router 分配给 expert $i$ 的平均概率。$\alpha$ 越大，均衡效果越强，但也可能影响模型质量（强制均匀不一定自然）。

调整下面的滑块，观察 $\alpha$ 对 expert 负载分布的影响：

<LoadBalanceViz client:visible />

另一个手段是 **expert capacity**：限定每个 expert 每 batch 最多处理 $C$ 个 token，溢出的 token 走 residual 直接跳过。

## DeepSeek 的创新

DeepSeek 在 MoE 上做了两个关键改进：

<DeepSeekMoEArchitecture />

### Shared Expert

部分 expert **所有 token 必经**（不经过 routing）。这些 shared expert 负责 "兜底" — 保证基础能力（通用知识、语法、常识）不会因为 routing 分散而丢失。

### Fine-Grained Expert

使用更多但更小的 expert，实现更细粒度的专业化。DeepSeek-V2 用 160 个 routed expert（对比 Mixtral 只有 8 个），每个 expert 更小但更专精。

具体配置：
- **DeepSeek-V2**: 160 routed + 2 shared, top-6
- **DeepSeek-V3**: 256 routed + 1 shared, top-8

## Expert Parallelism

256 个 expert 放不进一张 GPU — 需要 **Expert Parallelism (EP)**：不同 expert 分布在不同 GPU 上。

<ExpertParallelismDiagram />

这带来了 **All-to-All 通信**：每个 GPU 上的 token 需要发送到对应 expert 所在的 GPU（dispatch），expert 计算完后结果再发回原 GPU（combine）。

Expert Parallelism 通常和 Tensor Parallelism (TP)、Pipeline Parallelism (PP) 组合使用：
- **TP**: 切分单个 expert 的矩阵到多卡
- **EP**: 不同 expert 放不同卡
- **PP**: 不同 layer 放不同卡

expert 越多、GPU 越多，all-to-all 通信越重 — 这是 MoE 部署的主要挑战。

## 模型对比总结

<MoEModelComparison />
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes, new article page generated

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/mixture-of-experts.mdx
git commit -m "feat: add Mixture of Experts article (routing, load balancing, DeepSeek, EP)"
```

---

### Task 23: Update transformer-core.yaml (MoE)

**Files:**
- Modify: `src/content/paths/transformer-core.yaml`

- [ ] **Step 1: Add mixture-of-experts at end of articles list**

After the last article (e.g., `speculative-decoding`), add:

```yaml
  - mixture-of-experts    # ← APPEND
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/transformer-core.yaml
git commit -m "feat: add mixture-of-experts to transformer-core learning path"
```

---

## Article 4: Positional Encoding Update

### Task 24: RoPEFrequencyBands

**Files:**
- Create: `src/components/interactive/RoPEFrequencyBands.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;
const D_MODEL = 64; // total dims → 32 dim pairs
const NUM_PAIRS = D_MODEL / 2;
const BASE = 10000;

export default function RoPEFrequencyBands() {
  const [pos, setPos] = useState(10);
  const maxPos = 128;

  // Compute theta_i for each dimension pair
  const thetas = useMemo(() =>
    Array.from({ length: NUM_PAIRS }, (_, i) =>
      Math.pow(BASE, -2 * i / D_MODEL)
    ), []);

  // Heatmap: rows = positions, cols = dim pairs
  const numPosDisplay = 64;
  const cellW = Math.floor((W - 80) / NUM_PAIRS);
  const cellH = Math.floor((H - 120) / numPosDisplay);
  const heatmapX = 60;
  const heatmapY = 55;

  // Angle for highlighted position
  const angles = thetas.map(t => ((pos * t) % (2 * Math.PI)));

  return (
    <div className="my-6">
      <div className="flex items-center justify-center gap-4 mb-3">
        <label className="text-xs text-gray-500">
          位置 pos = {pos}
          <input type="range" min={0} max={maxPos} step={1} value={pos}
            onChange={e => setPos(Number(e.target.value))} className="ml-2 w-48" />
        </label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          RoPE 各维度对的旋转角度热力图 (d_model={D_MODEL})
        </text>

        {/* Axis labels */}
        <text x={heatmapX + (NUM_PAIRS * cellW) / 2} y={heatmapY - 8}
          textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          维度对 index i →
        </text>
        <text x={heatmapX - 8} y={heatmapY + (numPosDisplay * cellH) / 2}
          textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}
          transform={`rotate(-90, ${heatmapX - 8}, ${heatmapY + (numPosDisplay * cellH) / 2})`}>
          位置 pos →
        </text>

        {/* Frequency band labels */}
        <text x={heatmapX + 2} y={heatmapY - 18} fontSize="7" fill={COLORS.red}
          fontFamily={FONTS.sans} fontWeight="600">高频 (变化快)</text>
        <text x={heatmapX + NUM_PAIRS * cellW - 2} y={heatmapY - 18}
          textAnchor="end" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans} fontWeight="600">低频 (变化慢)</text>

        {/* Heatmap cells */}
        {Array.from({ length: numPosDisplay }, (_, pi) => {
          const rowY = heatmapY + pi * cellH;
          return Array.from({ length: NUM_PAIRS }, (_, di) => {
            const angle = (pi * thetas[di]) % (2 * Math.PI);
            const normalizedAngle = angle / (2 * Math.PI);
            // Color: interpolate from blue (0) → yellow (0.5) → red (1)
            const r = Math.floor(255 * Math.min(1, normalizedAngle * 2));
            const g = Math.floor(255 * Math.max(0, 1 - Math.abs(normalizedAngle - 0.5) * 2));
            const b = Math.floor(255 * Math.max(0, 1 - normalizedAngle * 2));
            return (
              <rect key={`${pi}-${di}`}
                x={heatmapX + di * cellW} y={rowY}
                width={cellW} height={cellH}
                fill={`rgb(${r},${g},${b})`} opacity={0.8} />
            );
          });
        })}

        {/* Highlight current position row */}
        {pos < numPosDisplay && (
          <rect x={heatmapX - 1} y={heatmapY + pos * cellH - 1}
            width={NUM_PAIRS * cellW + 2} height={cellH + 2}
            fill="none" stroke={COLORS.dark} strokeWidth={1.5} />
        )}

        {/* Bottom: angle values for selected pos */}
        {(() => {
          const barY = heatmapY + numPosDisplay * cellH + 15;
          return (
            <g>
              <text x={W / 2} y={barY} textAnchor="middle" fontSize="8" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>
                pos={pos} 时各维度对的角度 mθᵢ (mod 2π)
              </text>
              {angles.map((a, i) => {
                const bx = heatmapX + i * cellW;
                const barH = (a / (2 * Math.PI)) * 30;
                return (
                  <rect key={i} x={bx} y={barY + 35 - barH}
                    width={cellW - 1} height={barH} rx={1}
                    fill={i < NUM_PAIRS / 3 ? COLORS.red : i < 2 * NUM_PAIRS / 3 ? COLORS.orange : COLORS.primary}
                    opacity={0.7} />
                );
              })}
              <text x={heatmapX} y={barY + 45} fontSize="6"
                fill={COLORS.red} fontFamily={FONTS.sans}>i=0: 角度变化大</text>
              <text x={heatmapX + NUM_PAIRS * cellW} y={barY + 45}
                textAnchor="end" fontSize="6"
                fill={COLORS.primary} fontFamily={FONTS.sans}>i={NUM_PAIRS - 1}: 角度变化小</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/RoPEFrequencyBands.tsx
git commit -m "feat: add RoPEFrequencyBands interactive heatmap"
```

---

### Task 25: RoPEComplexPlane

**Files:**
- Create: `src/components/interactive/RoPEComplexPlane.tsx`

- [ ] **Step 1: Create component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SH = 280;

function StepSvg({ children }: { children: React.ReactNode }) {
  return <svg viewBox={`0 0 ${W} ${SH}`} className="w-full">{children}</svg>;
}

// Complex plane helpers
const CX = W / 2;
const CY = 140;
const R = 100; // radius of unit circle

function ComplexPlane({ children }: { children: React.ReactNode }) {
  return (
    <g>
      {/* Unit circle */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      {/* Axes */}
      <line x1={CX - R - 20} y1={CY} x2={CX + R + 20} y2={CY}
        stroke="#e2e8f0" strokeWidth={0.5} />
      <line x1={CX} y1={CY - R - 20} x2={CX} y2={CY + R + 20}
        stroke="#e2e8f0" strokeWidth={0.5} />
      <text x={CX + R + 25} y={CY + 3} fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Re</text>
      <text x={CX + 3} y={CY - R - 10} fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Im</text>
      {children}
    </g>
  );
}

function Vector({ angle, r, color, label, dashed }: {
  angle: number; r: number; color: string; label: string; dashed?: boolean;
}) {
  const x = CX + Math.cos(angle) * r;
  const y = CY - Math.sin(angle) * r;
  return (
    <g>
      <line x1={CX} y1={CY} x2={x} y2={y}
        stroke={color} strokeWidth={2}
        strokeDasharray={dashed ? '4,3' : undefined} />
      <circle cx={x} cy={y} r={4} fill={color} />
      <text x={x + 8} y={y - 8} fontSize="8" fontWeight="600"
        fill={color} fontFamily={FONTS.sans}>{label}</text>
    </g>
  );
}

function ArcArrow({ fromAngle, toAngle, r, color, label }: {
  fromAngle: number; toAngle: number; r: number; color: string; label: string;
}) {
  const midAngle = (fromAngle + toAngle) / 2;
  const arcR = r + 15;
  const x1 = CX + Math.cos(fromAngle) * arcR;
  const y1 = CY - Math.sin(fromAngle) * arcR;
  const x2 = CX + Math.cos(toAngle) * arcR;
  const y2 = CY - Math.sin(toAngle) * arcR;
  const lx = CX + Math.cos(midAngle) * (arcR + 15);
  const ly = CY - Math.sin(midAngle) * (arcR + 15);
  const sweep = toAngle > fromAngle ? 0 : 1;
  return (
    <g>
      <path d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 0 ${sweep} ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3,2" />
      <text x={lx} y={ly} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={color} fontFamily={FONTS.mono}>{label}</text>
    </g>
  );
}

const qAngle = 0.4; // ~23°
const theta = 0.8; // base frequency
const mTheta = 3 * theta; // position m=3
const nTheta = 1 * theta; // position n=1

const steps = [
  {
    title: '复数表示',
    content: (
      <StepSvg>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 1: Q 向量的一对维度在复平面上表示
        </text>
        <ComplexPlane>
          <Vector angle={qAngle} r={R * 0.8} color={COLORS.primary} label="q = (q₂ᵢ, q₂ᵢ₊₁)" />
        </ComplexPlane>
        <text x={W / 2} y={SH - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          把相邻两个维度 (q₂ᵢ, q₂ᵢ₊₁) 看作复数 q₂ᵢ + q₂ᵢ₊₁·j
        </text>
      </StepSvg>
    ),
  },
  {
    title: '旋转编码',
    content: (
      <StepSvg>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 2: 乘以 e^(imθ)，向量旋转 mθ 角度
        </text>
        <ComplexPlane>
          <Vector angle={qAngle} r={R * 0.8} color="#94a3b8" label="q (原始)" dashed />
          <Vector angle={qAngle + mTheta} r={R * 0.8} color={COLORS.primary}
            label={`q̃ₘ = q · e^(i·${3}·θ)`} />
          <ArcArrow fromAngle={qAngle} toAngle={qAngle + mTheta}
            r={R * 0.8} color={COLORS.orange} label={`mθ = ${3}θ`} />
        </ComplexPlane>
        <text x={W / 2} y={SH - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          位置 m 的 token 旋转 mθ — 复数乘法 = 旋转（高效 element-wise cos/sin）
        </text>
      </StepSvg>
    ),
  },
  {
    title: '相对位置',
    content: (
      <StepSvg>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 3: Q 和 K 旋转后，内积只取决于角度差 (m-n)θ
        </text>
        <ComplexPlane>
          <Vector angle={qAngle + mTheta} r={R * 0.75} color={COLORS.primary}
            label="q̃ₘ (pos=3)" />
          <Vector angle={qAngle + 0.3 + nTheta} r={R * 0.7} color={COLORS.green}
            label="k̃ₙ (pos=1)" />
          <ArcArrow fromAngle={qAngle + nTheta + 0.3} toAngle={qAngle + mTheta}
            r={R * 0.65} color={COLORS.red} label="Δθ = (m-n)θ" />
        </ComplexPlane>
        <text x={W / 2} y={SH - 30} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.mono}>
          q̃ₘ · k̃ₙ* = q · k* · e^(i(m-n)θ) — 内积只依赖相对距离 m-n
        </text>
        <text x={W / 2} y={SH - 14} textAnchor="middle" fontSize="8" fill={COLORS.green}
          fontFamily={FONTS.sans} fontWeight="600">
          这就是 RoPE 实现相对位置编码的数学本质
        </text>
      </StepSvg>
    ),
  },
];

export default function RoPEComplexPlane() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/RoPEComplexPlane.tsx
git commit -m "feat: add RoPEComplexPlane StepNavigator (complex plane rotation viz)"
```

---

### Task 26: RoPEExtrapolation

**Files:**
- Create: `src/components/interactive/RoPEExtrapolation.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;
const D_MODEL = 32;
const NUM_PAIRS = D_MODEL / 2;
const BASE = 10000;
const TRAIN_LEN = 4096;

type ScalingMethod = 'none' | 'ntk' | 'yarn';

function computeThetas(method: ScalingMethod, seqLen: number): number[] {
  const scale = seqLen / TRAIN_LEN;
  if (method === 'none') {
    return Array.from({ length: NUM_PAIRS }, (_, i) =>
      Math.pow(BASE, -2 * i / D_MODEL));
  }
  if (method === 'ntk') {
    // NTK-aware: b' = b * s^(d/(d-2))
    const newBase = BASE * Math.pow(scale, D_MODEL / (D_MODEL - 2));
    return Array.from({ length: NUM_PAIRS }, (_, i) =>
      Math.pow(newBase, -2 * i / D_MODEL));
  }
  // YaRN: low dims keep original, high dims scale, middle interpolate
  return Array.from({ length: NUM_PAIRS }, (_, i) => {
    const ratio = i / NUM_PAIRS;
    const origTheta = Math.pow(BASE, -2 * i / D_MODEL);
    if (ratio < 0.25) return origTheta; // high freq: keep
    if (ratio > 0.75) return origTheta / scale; // low freq: scale down
    // middle: interpolate
    const t = (ratio - 0.25) / 0.5;
    return origTheta * (1 - t) + (origTheta / scale) * t;
  });
}

export default function RoPEExtrapolation() {
  const [seqLen, setSeqLen] = useState(TRAIN_LEN);
  const [method, setMethod] = useState<ScalingMethod>('none');

  const thetas = useMemo(() => computeThetas(method, seqLen), [method, seqLen]);

  // Max angle at each dim pair = seqLen * theta_i
  const maxAngles = thetas.map(t => seqLen * t);
  const trainMaxAngles = Array.from({ length: NUM_PAIRS }, (_, i) =>
    TRAIN_LEN * Math.pow(BASE, -2 * i / D_MODEL));

  const barX = 80;
  const barMaxW = 420;
  const barH = 14;
  const barGap = 3;
  const barStartY = 80;
  const globalMaxAngle = Math.max(...maxAngles, ...trainMaxAngles) * 1.1;

  return (
    <div className="my-6">
      <div className="flex flex-wrap gap-4 mb-3 items-center justify-center">
        <label className="text-xs text-gray-500">
          序列长度: {seqLen.toLocaleString()}
          <input type="range" min={TRAIN_LEN} max={TRAIN_LEN * 4} step={512}
            value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="ml-2 w-32" />
        </label>
        <div className="flex gap-2">
          {(['none', 'ntk', 'yarn'] as ScalingMethod[]).map(m => (
            <button key={m}
              onClick={() => setMethod(m)}
              className={`text-xs px-3 py-1 rounded border transition-colors ${
                method === m
                  ? 'bg-blue-100 border-blue-400 text-blue-700 font-semibold'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {m === 'none' ? 'No Scaling' : m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          各维度对的最大角度覆盖 (训练长度={TRAIN_LEN}, 当前={seqLen.toLocaleString()})
        </text>

        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {method === 'none'
            ? '无缩放 — 超出训练范围的角度（红色区域）可能导致性能下降'
            : method === 'ntk'
              ? 'NTK-aware: 修改基数压缩高频角度到训练范围内'
              : 'YaRN: 对不同频率分量使用不同缩放因子（混合策略）'}
        </text>

        {/* Dim pair labels */}
        <text x={barX - 5} y={barStartY - 8} textAnchor="end" fontSize="7"
          fill={COLORS.mid} fontFamily={FONTS.sans}>dim pair</text>

        {Array.from({ length: NUM_PAIRS }, (_, i) => {
          const y = barStartY + i * (barH + barGap);
          const trainAngleW = (trainMaxAngles[i] / globalMaxAngle) * barMaxW;
          const currentAngleW = (maxAngles[i] / globalMaxAngle) * barMaxW;
          const inRange = maxAngles[i] <= trainMaxAngles[i] * 1.05;

          return (
            <g key={i}>
              <text x={barX - 5} y={y + barH / 2 + 1} textAnchor="end"
                dominantBaseline="middle" fontSize="6"
                fill={COLORS.mid} fontFamily={FONTS.mono}>i={i}</text>

              {/* Background */}
              <rect x={barX} y={y} width={barMaxW} height={barH} rx={2}
                fill="#f8fafc" />

              {/* Training range (green zone) */}
              <rect x={barX} y={y} width={Math.min(trainAngleW, barMaxW)} height={barH} rx={2}
                fill="#dcfce7" opacity={0.6} />

              {/* Current angle bar */}
              <rect x={barX} y={y}
                width={Math.min(currentAngleW, barMaxW)} height={barH} rx={2}
                fill={inRange ? COLORS.green : COLORS.red} opacity={0.5} />

              {/* Out-of-range marker */}
              {!inRange && trainAngleW < barMaxW && (
                <line x1={barX + trainAngleW} y1={y}
                  x2={barX + trainAngleW} y2={y + barH}
                  stroke={COLORS.dark} strokeWidth={1} />
              )}
            </g>
          );
        })}

        {/* Legend */}
        {(() => {
          const ly = barStartY + NUM_PAIRS * (barH + barGap) + 10;
          return (
            <g>
              <rect x={140} y={ly} width={12} height={10} rx={2} fill="#dcfce7" opacity={0.6} />
              <text x={156} y={ly + 8} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
                训练范围 (0 ~ {TRAIN_LEN})
              </text>

              <rect x={280} y={ly} width={12} height={10} rx={2} fill={COLORS.green} opacity={0.5} />
              <text x={296} y={ly + 8} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
                角度在范围内
              </text>

              <rect x={380} y={ly} width={12} height={10} rx={2} fill={COLORS.red} opacity={0.5} />
              <text x={396} y={ly + 8} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
                角度超出范围
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/RoPEExtrapolation.tsx
git commit -m "feat: add RoPEExtrapolation interactive (length scaling comparison)"
```

---

### Task 27: Update Positional Encoding MDX

**Files:**
- Modify: `src/content/articles/zh/positional-encoding.mdx`

- [ ] **Step 1: Add new imports**

After the existing import block (line 27), add:

```mdx
import RoPEFrequencyBands from '../../../components/interactive/RoPEFrequencyBands.tsx';
import RoPEComplexPlane from '../../../components/interactive/RoPEComplexPlane.tsx';
import RoPEExtrapolation from '../../../components/interactive/RoPEExtrapolation.tsx';
```

- [ ] **Step 2: Insert frequency bands section after "核心直觉" (after line 122)**

Insert after `<RoPERotationAnimation client:visible />` and before `### 数学推导`:

```mdx
### 维度对频率分解

每对维度 $(d_{2i}, d_{2i+1})$ 对应基础角度 $\theta_i = 10000^{-2i/d}$。这个公式的含义是：

- **低维度**（小 $i$）= **高频旋转**：位置变化一点，角度就大幅变化 → 捕捉**局部关系**
- **高维度**（大 $i$）= **低频旋转**：位置变化很多，角度才明显变化 → 捕捉**远距离关系**

这和 Sinusoidal 编码的多频率思想一脉相承，只是用旋转来实现。

<RoPEFrequencyBands client:visible />

热力图中左侧（低维度）颜色变化剧烈 — 高频信号；右侧（高维度）颜色变化缓慢 — 低频信号。这种多频率编码让模型同时感知近距离和远距离的位置关系。
```

- [ ] **Step 3: Insert complex plane section after "数学推导" (after the math section, before "长度外推问题")**

Insert before `### 长度外推问题`:

```mdx
### 复数视角

RoPE 有一个等价的复数表示，更直观也更高效：把每对维度 $(q_{2i}, q_{2i+1})$ 看作复数 $q_{2i} + q_{2i+1} \cdot j$。

旋转就是复数乘法：

$$\tilde{q} = q \cdot e^{im\theta}$$

关键推导 — 旋转后的内积只依赖相对位置：

$$\tilde{q}_m \cdot \overline{\tilde{k}_n} = q \cdot \bar{k} \cdot e^{i(m-n)\theta}$$

实现层面，这意味着不需要矩阵乘法，只需 element-wise 的 cos/sin 操作 — 非常高效。

<RoPEComplexPlane client:visible />
```

- [ ] **Step 4: Expand "长度外推问题" section with extrapolation visualization**

Replace the existing short extrapolation content (lines 147-155, starting at "RoPE 训练时的位置角度范围..." through "...100K+ token 的长文本。") with:

```mdx
RoPE 训练时的位置角度范围是有限的。当推理序列超过训练长度时，高频分量的角度值超出训练时见过的范围，导致 attention score 异常，模型性能下降。

目前主流的解决方案：

- **NTK-aware scaling：** 修改频率基数 $b' = b \cdot s^{d/(d-2)}$（$s$ 为缩放比），把高频分量"压缩"到训练范围内
- **YaRN（Yet another RoPE extensioN）：** 混合策略 — 对不同频率分量使用不同的缩放因子。高频保持不变（局部关系不需要外推），低频做缩放（远距离关系需要适配更长上下文）

下面的可视化展示了不同缩放方法如何把超出范围的角度压回训练区间：

<RoPEExtrapolation client:visible />

这些方法能将 RoPE 的有效长度从训练长度扩展数倍甚至数十倍，使得 LLaMA 等模型可以处理 100K+ token 的长文本。
```

- [ ] **Step 5: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 6: Commit**

```bash
git add src/content/articles/zh/positional-encoding.mdx
git commit -m "feat: add RoPE frequency bands, complex plane, extrapolation viz to positional-encoding"
```

---

## Final Tasks

### Task 28: Reconcile transformer-core.yaml

**Files:**
- Modify: `src/content/paths/transformer-core.yaml`

This task ensures the full transformer-core path has all articles in the correct order. Read the current file, then update to match:

- [ ] **Step 1: Update articles list to final order**

The complete articles list should be:

```yaml
articles:
  - transformer-overview
  - qkv-intuition
  - attention-computation
  - multi-head-attention
  - gqa-mqa
  - attention-variants
  - kv-cache
  - prefill-vs-decode
  - flash-attention
  - positional-encoding
  - sampling-and-decoding
  - speculative-decoding
  - mixture-of-experts
```

> **Note:** Verify exact slugs match existing files. Known correct slugs: `attention-computation` (not `attention-mechanism`), `gqa-mqa` (not `mqa-gqa`).

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/transformer-core.yaml
git commit -m "feat: reconcile transformer-core path with all 13 articles in correct order"
```
