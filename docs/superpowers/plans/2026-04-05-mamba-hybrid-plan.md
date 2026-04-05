# Mamba/SSM & Hybrid Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 2 articles (state-space-models, hybrid-architectures) with 10 interactive components to the Transformer Core learning path.

**Architecture:** Each component is a self-contained React TSX file in `src/components/interactive/`, using shared COLORS/FONTS and the StepNavigator primitive. Articles are MDX files importing these components. The transformer-core.yaml path is updated to include both articles at the end.

**Tech Stack:** Astro 5, React, TypeScript, SVG, StepNavigator primitive, shared/colors.ts

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/components/interactive/SSMStateRecurrence.tsx` | StepNavigator: SSM state recurrence step-by-step |
| `src/components/interactive/RecurrenceConvDuality.tsx` | Interactive: toggle recurrence vs convolution views |
| `src/components/interactive/SelectiveScanViz.tsx` | Interactive: click tokens to see selective Δ mechanism |
| `src/components/interactive/MambaBlockDiagram.tsx` | Static SVG: Mamba block architecture |
| `src/components/interactive/SSDAttentionEquivalence.tsx` | StepNavigator: SSM-Attention duality visualization |
| `src/content/articles/zh/state-space-models.mdx` | Article 1: SSM fundamentals and Mamba |
| `src/components/interactive/CopyTaskComparison.tsx` | Interactive: Transformer vs SSM copying task |
| `src/components/interactive/HybridPatternCompare.tsx` | Interactive: 3-tab hybrid fusion patterns |
| `src/components/interactive/JambaArchDiagram.tsx` | Static SVG: Jamba architecture diagram |
| `src/components/interactive/HymbaParallelHeads.tsx` | StepNavigator: Hymba parallel head fusion |
| `src/components/interactive/HybridModelBenchmark.tsx` | Interactive: model comparison table with hover |
| `src/content/articles/zh/hybrid-architectures.mdx` | Article 2: Hybrid Mamba+Attention architectures |

### Modified Files
| File | Change |
|------|--------|
| `src/content/paths/transformer-core.yaml` | Append state-space-models, hybrid-architectures |

---

## Conventions

- **SVG viewBox width:** 580 (standard across all components)
- **Colors/Fonts:** `import { COLORS, FONTS } from './shared/colors';`
- **StepNavigator:** `import StepNavigator from '../primitives/StepNavigator';`
- **Static components:** No `client:visible` in MDX, no useState
- **Interactive/StepNavigator components:** Add `client:visible` in MDX
- **Export pattern:** `export default function ComponentName()`
- **Build verification:** `npm run validate` after articles

---

## Article 1: 状态空间模型与 Mamba (Tasks 1–6)

### Task 1: SSMStateRecurrence Component

**Files:**
- Create: `src/components/interactive/SSMStateRecurrence.tsx`

- [ ] **Step 1: Write the component**

StepNavigator with 4 steps showing SSM state recurrence process.

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StateVector({ x, y, values, label, dim }: {
  x: number; y: number; values: number[]; label: string; dim: number;
}) {
  const cellW = 36;
  const cellH = 28;
  return (
    <g>
      <text x={x} y={y - 8} fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {values.map((v, i) => (
        <g key={i}>
          <rect x={x + i * cellW} y={y} width={cellW - 2} height={cellH}
            fill={Math.abs(v) > 0.01 ? COLORS.valid : COLORS.bgAlt}
            stroke={COLORS.light} strokeWidth="1" rx="3" />
          <text x={x + i * cellW + cellW / 2} y={y + cellH / 2 + 4}
            textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      <text x={x + dim * cellW + 8} y={y + cellH / 2 + 4} fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.mono}>∈ ℝ^{dim}</text>
    </g>
  );
}

function TokenBox({ x, y, token, active }: {
  x: number; y: number; token: string; active: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={50} height={28} rx={4}
        fill={active ? COLORS.highlight : COLORS.bgAlt}
        stroke={active ? COLORS.primary : COLORS.light} strokeWidth={active ? 2 : 1} />
      <text x={x + 25} y={y + 18} textAnchor="middle" fontSize="11"
        fontWeight={active ? '700' : '500'}
        fill={active ? COLORS.primary : COLORS.dark} fontFamily={FONTS.mono}>
        {token}
      </text>
    </g>
  );
}

export default function SSMStateRecurrence() {
  const N = 4; // state dim

  const steps = [
    {
      title: '1. 初始状态 x₀ = 0',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            SSM 初始化：空状态向量
          </text>
          <StateVector x={120} y={60} values={[0, 0, 0, 0]} label="x₀ (state)" dim={N} />
          <text x={W / 2} y={130} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            状态向量 x ∈ ℝᴺ 是 SSM 的"记忆"— 固定大小，不随序列增长
          </text>
          <text x={W / 2} y={155} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            N 通常为 16-64，远小于序列长度
          </text>
        </svg>
      ),
    },
    {
      title: '2. 输入 u₁ → 更新状态',
      content: (
        <svg viewBox={`0 0 ${W} 240`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            x₁ = B̄ · u₁
          </text>
          <TokenBox x={30} y={55} token="The" active={true} />
          <text x={100} y={74} fontSize="16" fill={COLORS.primary} fontFamily={FONTS.mono}>→</text>
          <text x={120} y={74} fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>B̄ 投影</text>
          <text x={180} y={74} fontSize="16" fill={COLORS.primary} fontFamily={FONTS.mono}>→</text>
          <StateVector x={200} y={55} values={[0.12, -0.08, 0.35, 0.21]} label="x₁" dim={N} />
          <rect x={40} y={120} width={500} height={50} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={140} textAnchor="middle" fontSize="11"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            B̄ 矩阵将输入 token 的 embedding 映射到状态空间
          </text>
          <text x={290} y={158} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            "写入"操作：决定输入信息如何编码到状态中
          </text>
          <text x={290} y={200} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            输出 y₁ = C · x₁（C 矩阵"读出"状态信息）
          </text>
        </svg>
      ),
    },
    {
      title: '3. 输入 u₂ → 混合新旧信息',
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            x₂ = Ā · x₁ + B̄ · u₂
          </text>
          {/* Old state */}
          <StateVector x={30} y={55} values={[0.12, -0.08, 0.35, 0.21]} label="x₁ (旧状态)" dim={N} />
          <text x={240} y={80} fontSize="11" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>× Ā (衰减)</text>
          {/* New input */}
          <TokenBox x={30} y={120} token="cat" active={true} />
          <text x={100} y={139} fontSize="16" fill={COLORS.primary} fontFamily={FONTS.mono}>→</text>
          <text x={120} y={139} fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>B̄ 投影</text>
          <text x={350} y={110} fontSize="20" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>+</text>
          {/* Result */}
          <StateVector x={120} y={170} values={[0.09, 0.24, 0.18, 0.43]} label="x₂ (新状态)" dim={N} />
          <text x={290} y={235} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Ā 控制旧信息保留多少，B̄ 控制新信息写入多少
          </text>
        </svg>
      ),
    },
    {
      title: '4. 对比 Attention：内存开销',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            推理缓存对比
          </text>
          {/* Attention side */}
          <text x={145} y={55} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>Attention (KV Cache)</text>
          {['K₁V₁', 'K₂V₂', 'K₃V₃', '...', 'KₙVₙ'].map((label, i) => (
            <g key={`kv-${i}`}>
              <rect x={40 + i * 52} y={70} width={48} height={28} rx={3}
                fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" />
              <text x={64 + i * 52} y={88} textAnchor="middle" fontSize="9"
                fill={COLORS.dark} fontFamily={FONTS.mono}>{label}</text>
            </g>
          ))}
          <text x={145} y={120} textAnchor="middle" fontSize="10"
            fill={COLORS.red} fontFamily={FONTS.sans}>
            缓存 O(n) — 每个 token 都要存
          </text>
          {/* SSM side */}
          <text x={435} y={55} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>SSM (State)</text>
          <rect x={370} y={70} width={130} height={28} rx={3}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" />
          <text x={435} y={88} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.mono}>x ∈ ℝᴺ (N=16~64)</text>
          <text x={435} y={120} textAnchor="middle" fontSize="10"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            缓存 O(1) — 固定大小
          </text>
          {/* Bar chart */}
          {[
            { label: '1K tokens', attn: 60, ssm: 8 },
            { label: '10K', attn: 140, ssm: 8 },
            { label: '100K', attn: 200, ssm: 8 },
          ].map((d, i) => {
            const bx = 80 + i * 170;
            return (
              <g key={`bar-${i}`}>
                <text x={bx + 30} y={155} textAnchor="middle" fontSize="9"
                  fill={COLORS.mid} fontFamily={FONTS.sans}>{d.label}</text>
                <rect x={bx} y={265 - d.attn} width={25} height={d.attn}
                  fill={COLORS.orange} opacity={0.7} rx={2} />
                <rect x={bx + 30} y={265 - d.ssm} width={25} height={d.ssm}
                  fill={COLORS.primary} opacity={0.7} rx={2} />
              </g>
            );
          })}
          <text x={290} y={250} textAnchor="middle" fontSize="9"
            fill={COLORS.orange} fontFamily={FONTS.sans}>■ KV Cache</text>
          <text x={290} y={265} textAnchor="middle" fontSize="9"
            fill={COLORS.primary} fontFamily={FONTS.sans}>■ SSM State</text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 2: RecurrenceConvDuality Component

**Files:**
- Create: `src/components/interactive/RecurrenceConvDuality.tsx`

- [ ] **Step 1: Write the component**

Interactive toggle between recurrence and convolution computation views.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 340;
const N = 6; // sequence length for demo

export default function RecurrenceConvDuality() {
  const [mode, setMode] = useState<'recurrence' | 'convolution'>('recurrence');

  const nodeR = 16;
  const startX = 60;
  const nodeGap = 75;
  const stateY = 100;
  const inputY = 200;
  const outputY = 50;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {mode === 'recurrence' ? 'Recurrence 模式（推理）' : 'Convolution 模式（训练）'}
      </text>

      {/* Toggle buttons */}
      {(['recurrence', 'convolution'] as const).map((m, i) => (
        <g key={m} onClick={() => setMode(m)} cursor="pointer">
          <rect x={140 + i * 170} y={32} width={150} height={24} rx={5}
            fill={mode === m ? COLORS.primary : COLORS.bg}
            stroke={mode === m ? COLORS.primary : COLORS.light} strokeWidth="1.5" />
          <text x={215 + i * 170} y={48} textAnchor="middle" fontSize="10"
            fontWeight={mode === m ? '700' : '400'}
            fill={mode === m ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {m === 'recurrence' ? 'Recurrence (逐步)' : 'Convolution (并行)'}
          </text>
        </g>
      ))}

      {mode === 'recurrence' ? (
        <g>
          {/* Input tokens */}
          <text x={startX - 40} y={inputY + 5} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>输入 u</text>
          {Array.from({ length: N }, (_, i) => (
            <g key={`in-${i}`}>
              <rect x={startX + i * nodeGap - 15} y={inputY - 12} width={30} height={24} rx={4}
                fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" />
              <text x={startX + i * nodeGap} y={inputY + 5} textAnchor="middle"
                fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
                u{i + 1}
              </text>
            </g>
          ))}

          {/* State nodes with arrows */}
          <text x={startX - 40} y={stateY + 5} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>状态 x</text>
          {Array.from({ length: N }, (_, i) => (
            <g key={`state-${i}`}>
              <circle cx={startX + i * nodeGap} cy={stateY} r={nodeR}
                fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" />
              <text x={startX + i * nodeGap} y={stateY + 4} textAnchor="middle"
                fontSize="9" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
                x{i + 1}
              </text>
              {/* Ā arrow between states */}
              {i > 0 && (
                <>
                  <line x1={startX + (i - 1) * nodeGap + nodeR + 2} y1={stateY}
                    x2={startX + i * nodeGap - nodeR - 2} y2={stateY}
                    stroke={COLORS.primary} strokeWidth="1.5" markerEnd="url(#rcd-arrow)" />
                  <text x={startX + (i - 0.5) * nodeGap} y={stateY - 12} textAnchor="middle"
                    fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.mono}>Ā</text>
                </>
              )}
              {/* B̄u arrow from input to state */}
              <line x1={startX + i * nodeGap} y1={inputY - 14}
                x2={startX + i * nodeGap} y2={stateY + nodeR + 2}
                stroke={COLORS.orange} strokeWidth="1" strokeDasharray="3,2"
                markerEnd="url(#rcd-arrow-orange)" />
              <text x={startX + i * nodeGap + 14} y={(inputY + stateY) / 2}
                fontSize="7" fill={COLORS.orange} fontFamily={FONTS.mono}>B̄u</text>
            </g>
          ))}

          {/* Output */}
          <text x={startX - 40} y={outputY + 5} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>输出 y</text>
          {Array.from({ length: N }, (_, i) => (
            <g key={`out-${i}`}>
              <line x1={startX + i * nodeGap} y1={stateY - nodeR - 2}
                x2={startX + i * nodeGap} y2={outputY + 14}
                stroke={COLORS.green} strokeWidth="1" strokeDasharray="3,2"
                markerEnd="url(#rcd-arrow-green)" />
              <rect x={startX + i * nodeGap - 15} y={outputY - 12} width={30} height={24} rx={4}
                fill="#e8f5e9" stroke={COLORS.green} strokeWidth="1" />
              <text x={startX + i * nodeGap} y={outputY + 5} textAnchor="middle"
                fontSize="10" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.mono}>
                y{i + 1}
              </text>
            </g>
          ))}

          {/* Complexity */}
          <rect x={60} y={250} width={460} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={268} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            O(1) per step · O(N) total · Sequential
          </text>
          <text x={290} y={282} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            适合推理：每个新 token 只需一次状态更新
          </text>
        </g>
      ) : (
        <g>
          {/* Input sequence */}
          <text x={40} y={85} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>输入序列 u</text>
          <rect x={40} y={95} width={220} height={30} rx={4}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" />
          <text x={150} y={114} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            [u₁, u₂, u₃, u₄, u₅, u₆]
          </text>

          {/* Convolution kernel */}
          <text x={40} y={155} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>SSM 卷积核 K̄</text>
          <rect x={40} y={165} width={220} height={30} rx={4}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
          <text x={150} y={184} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.mono}>
            [CB̄, CĀB̄, CĀ²B̄, ...]
          </text>

          {/* Convolution operator */}
          <text x={290} y={140} fontSize="24" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.mono}>*</text>
          <text x={310} y={145} fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
            卷积
          </text>

          {/* FFT acceleration */}
          <rect x={320} y={95} width={220} height={100} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={430} y={118} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>FFT 加速</text>
          <text x={430} y={138} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.mono}>
            y = IFFT(FFT(u) · FFT(K̄))
          </text>
          <text x={430} y={158} textAnchor="middle" fontSize="10"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            全部 token 并行计算
          </text>
          <text x={430} y={178} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            无需逐步递推
          </text>

          {/* Output */}
          <text x={40} y={225} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>输出序列 y</text>
          <rect x={40} y={235} width={500} height={30} rx={4}
            fill="#e8f5e9" stroke={COLORS.green} strokeWidth="1" />
          <text x={290} y={254} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.mono}>
            [y₁, y₂, y₃, y₄, y₅, y₆]
          </text>

          {/* Complexity */}
          <rect x={60} y={280} width={460} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={298} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            O(N log N) total · Parallel
          </text>
          <text x={290} y={312} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            适合训练：所有 token 同时处理，充分利用 GPU 并行
          </text>
        </g>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="rcd-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={COLORS.primary} />
        </marker>
        <marker id="rcd-arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={COLORS.orange} />
        </marker>
        <marker id="rcd-arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={COLORS.green} />
        </marker>
      </defs>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 3: SelectiveScanViz Component

**Files:**
- Create: `src/components/interactive/SelectiveScanViz.tsx`

- [ ] **Step 1: Write the component**

Interactive visualization showing Mamba's selective mechanism — click tokens to see Δ values and state impact.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface TokenData {
  text: string;
  delta: number; // 0-1 normalized
  isContent: boolean;
  stateContrib: number[]; // 4-dim state contribution
}

const TOKENS: TokenData[] = [
  { text: 'The',  delta: 0.15, isContent: false, stateContrib: [0.02, -0.01, 0.01, 0.00] },
  { text: 'cat',  delta: 0.85, isContent: true,  stateContrib: [0.31, 0.18, -0.12, 0.24] },
  { text: 'sat',  delta: 0.72, isContent: true,  stateContrib: [0.15, 0.28, 0.09, -0.11] },
  { text: 'on',   delta: 0.12, isContent: false, stateContrib: [0.01, -0.02, 0.01, 0.01] },
  { text: 'the',  delta: 0.10, isContent: false, stateContrib: [0.01, 0.00, -0.01, 0.01] },
  { text: 'mat',  delta: 0.88, isContent: true,  stateContrib: [0.22, -0.15, 0.33, 0.19] },
];

const STATE_DIM = 4;

export default function SelectiveScanViz() {
  const [selected, setSelected] = useState<number | null>(null);

  const tokenW = 70;
  const tokenH = 32;
  const tokensX = (W - TOKENS.length * tokenW) / 2;
  const tokensY = 60;
  const deltaY = 140;
  const deltaMaxH = 80;
  const stateY = 280;
  const stateCellW = 60;
  const stateCellH = 28;

  // Cumulative state up to selected token
  const cumulativeState = Array.from({ length: STATE_DIM }, () => 0);
  const limit = selected !== null ? selected + 1 : TOKENS.length;
  for (let t = 0; t < limit; t++) {
    const decay = Math.pow(0.9, limit - 1 - t); // older tokens decay
    for (let d = 0; d < STATE_DIM; d++) {
      cumulativeState[d] += TOKENS[t].stateContrib[d] * TOKENS[t].delta * decay;
    }
  }
  const maxState = Math.max(...cumulativeState.map(Math.abs), 0.01);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Mamba 选择性机制：Δ 控制记忆与遗忘
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击 token 查看其对状态的影响
      </text>

      {/* Token row */}
      {TOKENS.map((tok, i) => {
        const x = tokensX + i * tokenW;
        const isActive = selected === i;
        return (
          <g key={i} onClick={() => setSelected(selected === i ? null : i)} cursor="pointer">
            <rect x={x + 2} y={tokensY} width={tokenW - 4} height={tokenH} rx={5}
              fill={isActive ? COLORS.highlight : COLORS.bgAlt}
              stroke={isActive ? COLORS.primary : COLORS.light}
              strokeWidth={isActive ? 2.5 : 1} />
            <text x={x + tokenW / 2} y={tokensY + 20} textAnchor="middle"
              fontSize="13" fontWeight={isActive ? '700' : '500'}
              fill={isActive ? COLORS.primary : COLORS.dark} fontFamily={FONTS.mono}>
              {tok.text}
            </text>
          </g>
        );
      })}

      {/* Delta bars */}
      <text x={tokensX - 5} y={deltaY + deltaMaxH / 2} fontSize="10" fontWeight="600"
        fill={COLORS.mid} fontFamily={FONTS.sans} textAnchor="end">Δ 值</text>
      {TOKENS.map((tok, i) => {
        const x = tokensX + i * tokenW;
        const barH = tok.delta * deltaMaxH;
        const color = tok.delta > 0.5 ? COLORS.green : COLORS.red;
        const isActive = selected === i;
        return (
          <g key={`d-${i}`}>
            <rect x={x + 15} y={deltaY + deltaMaxH - barH} width={tokenW - 30} height={barH}
              fill={color} opacity={isActive ? 1 : 0.6} rx={3} />
            <text x={x + tokenW / 2} y={deltaY + deltaMaxH - barH - 5} textAnchor="middle"
              fontSize="9" fontWeight="600" fill={color} fontFamily={FONTS.mono}>
              {tok.delta.toFixed(2)}
            </text>
          </g>
        );
      })}
      {/* Delta legend */}
      <text x={tokensX} y={deltaY + deltaMaxH + 18} fontSize="9"
        fill={COLORS.green} fontFamily={FONTS.sans}>■ 大 Δ = 记住（内容词）</text>
      <text x={tokensX + 200} y={deltaY + deltaMaxH + 18} fontSize="9"
        fill={COLORS.red} fontFamily={FONTS.sans}>■ 小 Δ = 遗忘（功能词）</text>

      {/* State heatmap */}
      <text x={W / 2} y={stateY - 12} textAnchor="middle" fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {selected !== null
          ? `状态 (处理到 "${TOKENS[selected].text}")`
          : '累积状态 (全部 tokens)'}
      </text>
      {cumulativeState.map((val, d) => {
        const x = (W - STATE_DIM * stateCellW) / 2 + d * stateCellW;
        const t = Math.abs(val) / maxState;
        const bg = val >= 0
          ? `rgba(21,101,192,${0.15 + t * 0.6})`
          : `rgba(198,40,40,${0.15 + t * 0.6})`;
        return (
          <g key={`s-${d}`}>
            <rect x={x + 2} y={stateY} width={stateCellW - 4} height={stateCellH}
              fill={bg} stroke={COLORS.light} strokeWidth="1" rx="4" />
            <text x={x + stateCellW / 2} y={stateY + stateCellH / 2 + 4}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.mono}>
              {val.toFixed(3)}
            </text>
            <text x={x + stateCellW / 2} y={stateY + stateCellH + 14}
              textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
              dim {d}
            </text>
          </g>
        );
      })}

      {/* Annotation */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        选择性 Δ 让 Mamba 自适应地关注重要 token，忽略噪声 — 类似 Attention 的"软选择"
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 4: MambaBlockDiagram Component

**Files:**
- Create: `src/components/interactive/MambaBlockDiagram.tsx`

- [ ] **Step 1: Write the component**

Static SVG showing the Mamba block architecture with tensor shapes.

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 480;

interface BlockProps {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; color: string;
}

function Block({ x, y, w, h, label, sublabel, color }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={color} opacity={0.15} stroke={color} strokeWidth="2" />
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 3 : h / 2 + 4)}
        textAnchor="middle" fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
          fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>{sublabel}</text>
      )}
    </g>
  );
}

export default function MambaBlockDiagram() {
  const cx = W / 2;
  const bw = 160;
  const bh = 36;

  // Branch widths
  const branchGap = 40;
  const leftX = cx - bw / 2 - branchGap;
  const rightX = cx + branchGap;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="mbd-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={COLORS.mid} />
        </marker>
      </defs>

      <text x={cx} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Mamba Block 架构
      </text>

      {/* Input */}
      <Block x={cx - bw / 2} y={42} w={bw} h={bh}
        label="Input x" sublabel="(B, L, D)" color={COLORS.light} />

      {/* Residual arrow */}
      <line x1={cx + bw / 2 + 10} y1={60} x2={cx + bw / 2 + 40} y2={60}
        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,2" />
      <line x1={cx + bw / 2 + 40} y1={60} x2={cx + bw / 2 + 40} y2={430}
        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,2" />
      <text x={cx + bw / 2 + 50} y={250} fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans} transform={`rotate(90, ${cx + bw / 2 + 50}, 250)`}>
        Residual
      </text>

      {/* Linear projection expand */}
      <line x1={cx} y1={78} x2={cx} y2={98} stroke={COLORS.mid} strokeWidth="1.5"
        markerEnd="url(#mbd-arrow)" />
      <Block x={cx - bw / 2} y={100} w={bw} h={bh}
        label="Linear ↑" sublabel="D → ED (expand)" color={COLORS.primary} />

      {/* Split into two branches */}
      <line x1={cx} y1={136} x2={cx} y2={150} stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={leftX + bw / 2} y1={150} x2={rightX + bw / 2 - bw / 2} y2={150}
        stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={leftX + bw / 2} y1={150} x2={leftX + bw / 2} y2={168}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />
      <line x1={rightX + bw / 2 - bw / 2} y1={150} x2={rightX + bw / 2 - bw / 2} y2={168}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />

      {/* Left branch: Conv1d → SiLU → SSM */}
      <Block x={leftX} y={170} w={bw} h={bh}
        label="Conv1d" sublabel="kernel=4" color={COLORS.orange} />
      <line x1={leftX + bw / 2} y1={206} x2={leftX + bw / 2} y2={220}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />

      <Block x={leftX} y={222} w={bw} h={bh}
        label="SiLU (σ)" sublabel="activation" color={COLORS.green} />
      <line x1={leftX + bw / 2} y1={258} x2={leftX + bw / 2} y2={272}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />

      <Block x={leftX} y={274} w={bw} h={bh}
        label="SSM (Selective)" sublabel="Δ, B, C = f(input)" color={COLORS.primary} />

      {/* Right branch: SiLU gate */}
      <Block x={rightX} y={170} w={bw - 20} h={bh}
        label="SiLU (gate)" sublabel="(B, L, ED)" color={COLORS.green} />

      {/* Gate arrow down to multiply level */}
      <line x1={rightX + (bw - 20) / 2} y1={206}
        x2={rightX + (bw - 20) / 2} y2={295}
        stroke={COLORS.mid} strokeWidth="1.5" strokeDasharray="4,2" />

      {/* Multiply */}
      <line x1={leftX + bw / 2} y1={310} x2={leftX + bw / 2} y2={340}
        stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={rightX + (bw - 20) / 2} y1={295}
        x2={rightX + (bw - 20) / 2} y2={340}
        stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={leftX + bw / 2} y1={340} x2={rightX + (bw - 20) / 2} y2={340}
        stroke={COLORS.mid} strokeWidth="1.5" />
      <circle cx={cx} cy={340} r={12}
        fill={COLORS.bgAlt} stroke={COLORS.dark} strokeWidth="1.5" />
      <text x={cx} y={344} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.mono}>×</text>

      {/* Linear projection contract */}
      <line x1={cx} y1={352} x2={cx} y2={372} stroke={COLORS.mid} strokeWidth="1.5"
        markerEnd="url(#mbd-arrow)" />
      <Block x={cx - bw / 2} y={374} w={bw} h={bh}
        label="Linear ↓" sublabel="ED → D (contract)" color={COLORS.primary} />

      {/* Add residual */}
      <line x1={cx} y1={410} x2={cx} y2={425} stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={cx + bw / 2 + 40} y1={430} x2={cx + 15} y2={430}
        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,2"
        markerEnd="url(#mbd-arrow)" />
      <circle cx={cx} cy={430} r={10}
        fill={COLORS.bgAlt} stroke={COLORS.dark} strokeWidth="1.5" />
      <text x={cx} y={434} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.mono}>+</text>

      {/* Output */}
      <line x1={cx} y1={440} x2={cx} y2={455} stroke={COLORS.mid} strokeWidth="1.5"
        markerEnd="url(#mbd-arrow)" />
      <text x={cx} y={468} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Output (B, L, D)</text>

      {/* Annotation */}
      <text x={30} y={300} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        无 Attention
      </text>
      <text x={30} y={312} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        无 MLP
      </text>
      <text x={30} y={324} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        比 Transformer
      </text>
      <text x={30} y={336} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        block 更简洁
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 5: SSDAttentionEquivalence Component

**Files:**
- Create: `src/components/interactive/SSDAttentionEquivalence.tsx`

- [ ] **Step 1: Write the component**

StepNavigator with 3 steps showing Mamba-2 SSD-Attention duality.

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const N = 6; // matrix size

function MatrixViz({ x, y, size, data, label, cellSize }: {
  x: number; y: number; size: number; data: (i: number, j: number) => number;
  label: string; cellSize: number;
}) {
  const maxVal = Math.max(
    ...Array.from({ length: size * size }, (_, k) =>
      Math.abs(data(Math.floor(k / size), k % size))
    )
  );
  return (
    <g>
      <text x={x} y={y - 8} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (__, j) => {
          const val = data(i, j);
          const t = Math.abs(val) / (maxVal || 1);
          const color = val === 0
            ? COLORS.masked
            : val > 0
              ? `rgba(21,101,192,${0.1 + t * 0.7})`
              : `rgba(198,40,40,${0.1 + t * 0.7})`;
          return (
            <g key={`${i}-${j}`}>
              <rect x={x + j * cellSize} y={y + i * cellSize}
                width={cellSize - 1} height={cellSize - 1}
                fill={color} stroke={COLORS.light} strokeWidth="0.5" rx="1" />
              {cellSize >= 24 && (
                <text x={x + j * cellSize + cellSize / 2} y={y + i * cellSize + cellSize / 2 + 3}
                  textAnchor="middle" fontSize="7" fill={COLORS.dark} fontFamily={FONTS.mono}>
                  {val.toFixed(1)}
                </text>
              )}
            </g>
          );
        })
      )}
    </g>
  );
}

// Semiseparable: M[i][j] = C[i] * A^(i-j) * B[j] for j <= i, 0 otherwise
function semiSep(i: number, j: number): number {
  if (j > i) return 0;
  return Math.pow(0.85, i - j) * (0.6 + 0.3 * Math.sin(j * 2.1));
}

// Dense attention-like scores
function denseAttn(i: number, j: number): number {
  if (j > i) return 0; // causal
  return 0.3 + 0.5 * Math.cos((i - j) * 0.8) + 0.2 * Math.sin(i * 0.5 + j * 0.3);
}

export default function SSDAttentionEquivalence() {
  const cell = 28;

  const steps = [
    {
      title: '1. SSM → Semiseparable Matrix',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            SSM 递推展开为矩阵乘法 Y = M · U
          </text>

          <MatrixViz x={50} y={55} size={N} data={semiSep} label="M (semiseparable)" cellSize={cell} />

          <text x={240} y={130} fontSize="18" fontWeight="700" fill={COLORS.dark}>·</text>

          {/* Input vector */}
          <g>
            <text x={270} y={47} fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>U (input)</text>
            {Array.from({ length: N }, (_, i) => (
              <g key={i}>
                <rect x={270} y={55 + i * cell} width={cell - 1} height={cell - 1}
                  fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" rx="1" />
                <text x={270 + cell / 2} y={55 + i * cell + cell / 2 + 3} textAnchor="middle"
                  fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>u{i + 1}</text>
              </g>
            ))}
          </g>

          {/* Annotation */}
          <rect x={330} y={60} width={220} height={80} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={340} y={80} fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Semiseparable 结构：</text>
          <text x={340} y={96} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            M[i,j] = C·Ā^(i-j)·B̄  (j ≤ i)
          </text>
          <text x={340} y={112} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            M[i,j] = 0             (j {'>'} i)
          </text>
          <text x={340} y={130} fontSize="9" fill={COLORS.primary} fontFamily={FONTS.sans}>
            因果 + 指数衰减结构
          </text>

          <text x={W / 2} y={280} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            SSM 递推 xₖ = Āxₖ₋₁ + B̄uₖ 展开后等价于一个结构化矩阵乘法
          </text>
        </svg>
      ),
    },
    {
      title: '2. Attention → Dense Matrix',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Attention 计算 Y = softmax(QK^T) · V
          </text>

          <MatrixViz x={50} y={55} size={N} data={denseAttn} label="softmax(QKᵀ) (dense)" cellSize={cell} />

          <text x={240} y={130} fontSize="18" fontWeight="700" fill={COLORS.dark}>·</text>

          <g>
            <text x={270} y={47} fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>V (value)</text>
            {Array.from({ length: N }, (_, i) => (
              <g key={i}>
                <rect x={270} y={55 + i * cell} width={cell - 1} height={cell - 1}
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" rx="1" />
                <text x={270 + cell / 2} y={55 + i * cell + cell / 2 + 3} textAnchor="middle"
                  fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>v{i + 1}</text>
              </g>
            ))}
          </g>

          <rect x={330} y={60} width={220} height={80} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={340} y={80} fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Dense 结构：</text>
          <text x={340} y={96} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            A[i,j] = softmax(qᵢ·kⱼ)  (j ≤ i)
          </text>
          <text x={340} y={112} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            A[i,j] = 0                (j {'>'} i)
          </text>
          <text x={340} y={130} fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans}>
            因果 + 任意值（data-dependent）
          </text>

          <text x={W / 2} y={280} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Attention score matrix 是完全 dense 的 — 每对 token 独立计算权重
          </text>
        </svg>
      ),
    },
    {
      title: '3. SSM ≈ 结构化的 Attention',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            State Space Duality (Mamba-2)
          </text>

          {/* SSM matrix */}
          <MatrixViz x={30} y={55} size={N} data={semiSep} label="SSM: Semiseparable" cellSize={24} />
          <text x={30} y={55 + N * 24 + 18} fontSize="9" fill={COLORS.primary} fontFamily={FONTS.sans}>
            低秩结构 → O(N) 计算
          </text>

          {/* vs */}
          <text x={W / 2} y={120} textAnchor="middle" fontSize="16" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>≈</text>

          {/* Attention matrix */}
          <MatrixViz x={320} y={55} size={N} data={denseAttn} label="Attention: Dense" cellSize={24} />
          <text x={320} y={55 + N * 24 + 18} fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans}>
            全秩 → O(N²) 计算
          </text>

          {/* Key insight box */}
          <rect x={50} y={210} width={480} height={70} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" />
          <text x={290} y={232} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>
            "SSM 是加了结构约束的 Attention"
          </text>
          <text x={290} y={252} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Semiseparable 结构 = 因果 mask + 指数衰减 → 用 chunk-wise 算法加速
          </text>
          <text x={290} y={268} textAnchor="middle" fontSize="10"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            Mamba-2 利用此对偶性，比 Mamba-1 快 2-8×
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 6: state-space-models Article

**Files:**
- Create: `src/content/articles/zh/state-space-models.mdx`

- [ ] **Step 1: Write the article**

Full article covering SSM fundamentals, discretization, recurrence/convolution duality, Mamba selective mechanism, and Mamba-2 SSD.

```mdx
---
title: "状态空间模型与 Mamba"
slug: "state-space-models"
locale: "zh"
tags: [ssm, mamba, state-space-model, selective-scan, sequence-modeling]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [attention-computation]
references:
  - type: paper
    title: "Efficiently Modeling Long Sequences with Structured State Spaces (S4)"
    url: "https://arxiv.org/abs/2111.00396"
  - type: paper
    title: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces"
    url: "https://arxiv.org/abs/2312.00752"
  - type: paper
    title: "Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality"
    url: "https://arxiv.org/abs/2405.21060"
---

import SSMStateRecurrence from '../../../components/interactive/SSMStateRecurrence.tsx';
import RecurrenceConvDuality from '../../../components/interactive/RecurrenceConvDuality.tsx';
import SelectiveScanViz from '../../../components/interactive/SelectiveScanViz.tsx';
import MambaBlockDiagram from '../../../components/interactive/MambaBlockDiagram.tsx';
import SSDAttentionEquivalence from '../../../components/interactive/SSDAttentionEquivalence.tsx';

## 引言

标准 Attention 的计算复杂度为 $O(n^2)$，推理时 KV cache 随序列长度线性增长。在 100K+ token 的长上下文场景下，Attention 的显存和计算成本成为关键瓶颈。有没有一种序列建模方法，能在 **线性时间** 内处理任意长度的序列，同时保持固定大小的推理缓存？

**状态空间模型 (State Space Model, SSM)** 正是这样一种方案。SSM 源自控制论和信号处理领域，核心思想是用一个 **固定大小的状态向量** 压缩序列的全部历史信息，每处理一个新 token 只需更新状态而非回看全部历史。

---

## 1. 连续状态空间模型

SSM 的数学基础是一个连续时间的线性动态系统：

$$
\dot{x}(t) = Ax(t) + Bu(t), \quad y(t) = Cx(t) + Du(t)
$$

其中 $u(t)$ 是输入信号，$x(t) \in \mathbb{R}^N$ 是隐状态，$y(t)$ 是输出。矩阵 $A \in \mathbb{R}^{N \times N}$ 控制状态的演化规律，$B \in \mathbb{R}^{N \times 1}$ 控制输入如何写入状态，$C \in \mathbb{R}^{1 \times N}$ 控制如何从状态读出输出。

直觉：**状态 $x$ 是"压缩的历史摘要"**。与 Attention 不同——Attention 每步都回看完整的 token 序列——SSM 只维护一个固定大小的状态，所有历史信息都被压缩到这 $N$ 个维度中。这就像一个"带记忆的滤波器"：输入信号经过系统，被状态记住、混合、然后输出。

<SSMStateRecurrence client:visible />

---

## 2. 离散化：从连续到序列

语言模型处理的是离散 token 序列，需要将连续 SSM 离散化。使用 Zero-Order Hold (ZOH) 方法，步长为 $\Delta$：

$$
\bar{A} = e^{\Delta A}, \quad \bar{B} = (\Delta A)^{-1}(e^{\Delta A} - I) \cdot \Delta B
$$

离散化后的递推公式：

$$
x_k = \bar{A} x_{k-1} + \bar{B} u_k, \quad y_k = C x_k
$$

步长 $\Delta$ 的物理含义：它控制系统的"时间分辨率"。**大 $\Delta$** 意味着每步跨越更长的时间，系统更关注远距离依赖；**小 $\Delta$** 让系统关注近距离细节。在后续的 Mamba 模型中，$\Delta$ 将变成一个依赖输入的可学习参数，这是选择性机制的关键。

---

## 3. Recurrence 与 Convolution 的对偶性

离散 SSM 有一个优雅的性质：同一个模型可以用两种完全不同的方式计算。

**Recurrence 模式**：逐步递推 $x_k = \bar{A}x_{k-1} + \bar{B}u_k$，每步 $O(1)$ 计算。适合 **推理**——每个新 token 只需一次状态更新。

**Convolution 模式**：将递推展开，得到 $y = \bar{K} * u$，其中卷积核 $\bar{K} = (C\bar{B}, C\bar{A}\bar{B}, C\bar{A}^2\bar{B}, ...)$。整个序列可以用 FFT 在 $O(N \log N)$ 时间内并行计算。适合 **训练**——所有 token 同时处理。

<RecurrenceConvDuality client:visible />

这个对偶性是 S4 (Structured State Spaces for Sequence Modeling) 的核心贡献：训练时用 convolution 充分利用 GPU 并行性，推理时切换为 recurrence 实现 $O(1)$ 增量推理。

---

## 4. Mamba 的选择性机制

S4 等早期 SSM 有一个根本限制：参数 $A$, $B$, $C$ 是 **固定的**（与输入无关）。这意味着系统对所有输入 token 一视同仁——无论是关键内容词还是噪声填充词，SSM 都用相同的方式处理。

**Mamba** (Gu & Dao, 2023) 的核心创新是 **选择性 (Selectivity)**：让关键参数依赖于当前输入。

- **选择性 $B$**：$B_k = \text{Linear}(u_k)$ — 控制"写入什么到状态"
- **选择性 $C$**：$C_k = \text{Linear}(u_k)$ — 控制"从状态读出什么"
- **选择性 $\Delta$**：$\Delta_k = \text{softplus}(\text{Linear}(u_k))$ — 控制"遗忘速度"

$\Delta$ 是最直观的：对于重要 token（如内容词 "cat", "mat"），模型学会输出大 $\Delta$，让信息 **被记住**；对于噪声 token（如 "the", "on"），输出小 $\Delta$，让旧信息 **快速遗忘** 新输入。

<SelectiveScanViz client:visible />

选择性的代价：参数依赖输入后，SSM 不再是时不变系统 (LTI)，卷积核 $\bar{K}$ 随输入变化，无法再用 FFT 加速。Mamba 用 **硬件感知的 parallel scan 算法** 替代——在 GPU 的 SRAM 中进行 scan 操作，避免 HBM 读写，实现接近 convolution 的训练效率。

### Mamba Block 架构

Mamba 用一种比 Transformer block 更简洁的结构替代了传统的 Attention + MLP：

<MambaBlockDiagram />

整个 block 没有 Attention 层，也没有独立的 MLP 层。输入先通过 linear projection 扩展维度，然后分两条路径：一条经过 Conv1d + SSM 处理序列信息，另一条作为 gate。两路相乘后收缩维度输出。

---

## 5. Mamba-2: State Space Duality

**Mamba-2** (Dao & Gu, ICML 2024) 建立了 SSM 和 Attention 之间的深层数学联系——**State Space Duality (SSD)**。

核心发现：将 SSM 递推展开为矩阵形式 $Y = M \cdot U$，矩阵 $M$ 是一个 **semiseparable matrix**（半可分矩阵）。而标准 Attention 的计算 $Y = \text{softmax}(QK^T) \cdot V$ 中，score matrix $QK^T$ 是一个 **dense matrix**。

<SSDAttentionEquivalence client:visible />

换句话说：**SSM 是一种加了结构约束的 Attention**。Semiseparable 结构 = 因果 mask + 指数衰减，这种结构使得矩阵乘法可以用 chunk-wise 算法在 $O(N)$ 时间完成——类似 Flash Attention 的分块策略。

实际意义：Mamba-2 比 Mamba-1 快 **2-8×**，同时引入了 **multi-head SSM**（类似 multi-head attention），使得模型的表达能力更强。

---

## 总结

SSM 提供了一种根本不同于 Attention 的序列建模范式：

| | Attention | SSM |
|---|---|---|
| 训练复杂度 | $O(N^2)$ | $O(N)$ 或 $O(N \log N)$ |
| 推理缓存 | $O(N)$ (KV cache) | $O(1)$ (固定状态) |
| 历史访问 | 精确（任意 token） | 压缩（固定维度） |
| 核心瓶颈 | 长序列显存/计算 | Copying / ICL 能力 |

SSM 的优势在于线性复杂度和常数推理缓存，但固定大小的状态向量意味着信息必然被压缩——当需要精确回忆远处特定 token 时（如 copying、in-context learning），SSM 力不从心。

这个根本局限引出了下一篇文章的主题：**Hybrid 架构** 如何结合 Attention 的精确检索和 SSM 的高效摘要，取长补短。

## 延伸阅读

- [Attention 计算](./attention-computation) — 理解标准 Attention 的计算流程
- [Flash Attention](./flash-attention) — 另一种优化 Attention 效率的方法
- [Attention 变体](./attention-variants) — Sliding Window、MLA 等 Attention 优化
- [Hybrid 架构](./hybrid-architectures) — Mamba 与 Attention 的融合
```

- [ ] **Step 2: Validate and verify**

```bash
npm run validate && npm run dev
```

- [ ] **Step 3: Commit Article 1 and its components**

```bash
git add src/components/interactive/SSMStateRecurrence.tsx \
  src/components/interactive/RecurrenceConvDuality.tsx \
  src/components/interactive/SelectiveScanViz.tsx \
  src/components/interactive/MambaBlockDiagram.tsx \
  src/components/interactive/SSDAttentionEquivalence.tsx \
  src/content/articles/zh/state-space-models.mdx
git commit -m "feat: add state-space-models article with 5 components"
```

---

## Article 2: Hybrid 架构 (Tasks 7–13)

### Task 7: CopyTaskComparison Component

**Files:**
- Create: `src/components/interactive/CopyTaskComparison.tsx`

- [ ] **Step 1: Write the component**

Interactive toggle comparing Transformer vs SSM on a copying task.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

const SOURCE = ['A', 'B', 'C', 'D'];
const SEP = '|';

export default function CopyTaskComparison() {
  const [mode, setMode] = useState<'transformer' | 'ssm'>('transformer');

  const tokenW = 48;
  const tokenH = 32;
  const seqY = 70;
  const allTokens = [...SOURCE, SEP, ...SOURCE.map(() => '?')];
  const seqX = (W - allTokens.length * tokenW) / 2;

  // SSM accuracy drops with distance
  const ssmAccuracy = SOURCE.map((_, i) => Math.max(0, 1 - i * 0.2));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Copying Task：Transformer vs SSM
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        任务：将分隔符前的 token 精确复制到后半段
      </text>

      {/* Toggle */}
      {(['transformer', 'ssm'] as const).map((m, i) => (
        <g key={m} onClick={() => setMode(m)} cursor="pointer">
          <rect x={180 + i * 120} y={48} width={110} height={24} rx={12}
            fill={mode === m ? COLORS.primary : COLORS.bgAlt}
            stroke={mode === m ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={235 + i * 120} y={64} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={mode === m ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {m === 'transformer' ? 'Transformer' : 'SSM'}
          </text>
        </g>
      ))}

      {/* Token sequence */}
      {allTokens.map((tok, i) => {
        const x = seqX + i * tokenW;
        const isSep = tok === SEP;
        const isQuestion = tok === '?';
        const isSource = i < SOURCE.length;
        return (
          <g key={i}>
            <rect x={x + 2} y={seqY} width={tokenW - 4} height={tokenH} rx={5}
              fill={isSep ? COLORS.bgAlt : isSource ? '#e3f2fd' : '#fff3e0'}
              stroke={isSep ? COLORS.mid : isSource ? COLORS.primary : COLORS.orange}
              strokeWidth="1.5" />
            <text x={x + tokenW / 2} y={seqY + 21} textAnchor="middle"
              fontSize="14" fontWeight="600"
              fill={isSep ? COLORS.mid : isSource ? COLORS.primary : COLORS.orange}
              fontFamily={FONTS.mono}>
              {tok}
            </text>
          </g>
        );
      })}

      {mode === 'transformer' ? (
        <g>
          {/* Attention arrows from ? to source tokens */}
          {SOURCE.map((_, i) => {
            const srcX = seqX + i * tokenW + tokenW / 2;
            const tgtX = seqX + (SOURCE.length + 1 + i) * tokenW + tokenW / 2;
            return (
              <g key={`attn-${i}`}>
                <path d={`M ${tgtX} ${seqY + tokenH + 4} Q ${(srcX + tgtX) / 2} ${seqY + tokenH + 50 + i * 10} ${srcX} ${seqY + tokenH + 4}`}
                  fill="none" stroke={COLORS.primary} strokeWidth="1.5"
                  strokeDasharray="4 2" opacity="0.7" />
                <circle cx={srcX} cy={seqY + tokenH + 4} r="3" fill={COLORS.primary} />
              </g>
            );
          })}

          {/* Result tokens */}
          {SOURCE.map((tok, i) => {
            const x = seqX + (SOURCE.length + 1 + i) * tokenW;
            return (
              <text key={`res-${i}`} x={x + tokenW / 2} y={seqY + tokenH + 80}
                textAnchor="middle" fontSize="13" fontWeight="700"
                fill={COLORS.green} fontFamily={FONTS.mono}>
                {tok} ✓
              </text>
            );
          })}

          <text x={W / 2} y={seqY + tokenH + 110} textAnchor="middle" fontSize="11"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            Attention 直接连线到源 token → 精确复制
          </text>

          {/* Accuracy bar */}
          <text x={60} y={280} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>准确率</text>
          <rect x={120} y={268} width={380} height={18} rx={9}
            fill={COLORS.green} opacity="0.9" />
          <text x={310} y={281} textAnchor="middle" fontSize="10"
            fontWeight="700" fill="#fff" fontFamily={FONTS.mono}>100% (任意长度)</text>

          <rect x={60} y={310} width={460} height={60} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={332} textAnchor="middle" fontSize="11"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Attention 矩阵的每个位置可以直接访问任意历史 token
          </text>
          <text x={290} y={352} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Transformer 两层即可 copy 指数长度字符串 (Jelassi et al. 2024)
          </text>
        </g>
      ) : (
        <g>
          {/* State decay visualization */}
          <rect x={100} y={seqY + tokenH + 10} width={380} height={50} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={seqY + tokenH + 30} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            固定大小状态向量 x ∈ ℝᴺ
          </text>
          <text x={290} y={seqY + tokenH + 48} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            信息经过状态压缩，越早的 token 衰减越多
          </text>

          {/* Result tokens with degradation */}
          {SOURCE.map((tok, i) => {
            const x = seqX + (SOURCE.length + 1 + i) * tokenW;
            const acc = ssmAccuracy[i];
            const correct = acc > 0.5;
            return (
              <g key={`ssm-res-${i}`}>
                <text x={x + tokenW / 2} y={seqY + tokenH + 90}
                  textAnchor="middle" fontSize="13" fontWeight="700"
                  fill={correct ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
                  {correct ? tok : '?'} {correct ? '✓' : '✗'}
                </text>
                <text x={x + tokenW / 2} y={seqY + tokenH + 106}
                  textAnchor="middle" fontSize="8"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>
                  {(acc * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          <text x={W / 2} y={seqY + tokenH + 128} textAnchor="middle" fontSize="11"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            SSM 状态压缩 → 远距离 token 信息衰减
          </text>

          {/* Accuracy bars per position */}
          <text x={60} y={268} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>准确率</text>
          {SOURCE.map((_, i) => {
            const barW = ssmAccuracy[i] * 380;
            const x = 120;
            const y = 260 + i * 24;
            return (
              <g key={`bar-${i}`}>
                <text x={x - 10} y={y + 13} textAnchor="end" fontSize="9"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>pos {i}</text>
                <rect x={x} y={y} width={380} height={18} rx={9}
                  fill={COLORS.bgAlt} />
                <rect x={x} y={y} width={barW} height={18} rx={9}
                  fill={ssmAccuracy[i] > 0.5 ? COLORS.green : COLORS.red}
                  opacity="0.8" />
                <text x={x + barW + 8} y={y + 13} fontSize="9"
                  fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
                  {(ssmAccuracy[i] * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          <rect x={60} y={362} width={460} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={380} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            N 维状态无法精确存储 M 个 token (M &gt;&gt; N)：信息必然丢失
          </text>
          <text x={290} y={394} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            序列越长，准确率下降越明显 — SSM 的根本局限
          </text>
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 8: HybridPatternCompare Component

**Files:**
- Create: `src/components/interactive/HybridPatternCompare.tsx`

- [ ] **Step 1: Write the component**

Interactive 3-tab component showing interleaved, parallel, and shared hybrid patterns.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 480;

type Pattern = 'interleaved' | 'parallel' | 'shared';

const TABS: { key: Pattern; label: string }[] = [
  { key: 'interleaved', label: '交替式' },
  { key: 'parallel', label: '并行式' },
  { key: 'shared', label: '共享式' },
];

function LayerRect({ x, y, w, h, type, label }: {
  x: number; y: number; w: number; h: number;
  type: 'mamba' | 'attention' | 'moe'; label: string;
}) {
  const fill = type === 'mamba' ? COLORS.primary
    : type === 'attention' ? COLORS.orange : COLORS.purple;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={fill} opacity="0.15" stroke={fill} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle"
        fontSize="9" fontWeight="600" fill={fill} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

function InterleavedView() {
  const layerW = 200;
  const layerH = 22;
  const gap = 4;
  const startX = (W - layerW) / 2;
  const startY = 30;
  // 8-layer group: 7 Mamba + 1 Attention, repeated 2x
  const layers: { type: 'mamba' | 'attention' | 'moe'; label: string }[] = [];
  for (let g = 0; g < 2; g++) {
    for (let i = 0; i < 7; i++) {
      layers.push({ type: 'mamba', label: `Mamba ${g * 8 + i + 1}` });
    }
    layers.push({ type: 'attention', label: `Attention ${g + 1}` });
  }

  return (
    <g>
      {layers.map((l, i) => (
        <LayerRect key={i} x={startX} y={startY + i * (layerH + gap)}
          w={layerW} h={layerH} type={l.type} label={l.label} />
      ))}
      {/* MoE markers on some Mamba layers */}
      {[2, 5, 10, 13].map((i) => (
        <text key={`moe-${i}`} x={startX + layerW + 10} y={startY + i * (layerH + gap) + layerH / 2 + 3}
          fontSize="8" fill={COLORS.purple} fontFamily={FONTS.mono}>MoE</text>
      ))}
      {/* Bracket annotation */}
      <text x={startX - 10} y={startY + 4 * (layerH + gap)} fontSize="8"
        fill={COLORS.mid} fontFamily={FONTS.sans} textAnchor="end">7:1</text>

      {/* Info box */}
      <rect x={40} y={startY + 16 * (layerH + gap) + 10} width={500} height={52} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={290} y={startY + 16 * (layerH + gap) + 30} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Jamba 式：7 Mamba + 1 Attention 为一组，部分层加 MoE
      </text>
      <text x={290} y={startY + 16 * (layerH + gap) + 48} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        KV cache 仅 1/8 · 适合长上下文大模型 · 代表: Jamba (52B/12B active)
      </text>
    </g>
  );
}

function ParallelView() {
  const layerW = 200;
  const layerH = 50;
  const gap = 8;
  const startX = (W - layerW) / 2;
  const startY = 30;
  const numLayers = 6;

  return (
    <g>
      {Array.from({ length: numLayers }, (_, i) => {
        const y = startY + i * (layerH + gap);
        const halfW = (layerW - 8) / 2;
        return (
          <g key={i}>
            <rect x={startX} y={y} width={layerW} height={layerH} rx={4}
              fill="none" stroke={COLORS.light} strokeWidth="1" strokeDasharray="4 2" />
            {/* SSM head left */}
            <rect x={startX + 2} y={y + 2} width={halfW} height={layerH - 4} rx={3}
              fill={COLORS.primary} opacity="0.12" stroke={COLORS.primary} strokeWidth="1" />
            <text x={startX + 2 + halfW / 2} y={y + layerH / 2 + 4} textAnchor="middle"
              fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              SSM heads
            </text>
            {/* Attention head right */}
            <rect x={startX + halfW + 6} y={y + 2} width={halfW} height={layerH - 4} rx={3}
              fill={COLORS.orange} opacity="0.12" stroke={COLORS.orange} strokeWidth="1" />
            <text x={startX + halfW + 6 + halfW / 2} y={y + layerH / 2 + 4} textAnchor="middle"
              fontSize="8" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.sans}>
              Attn heads
            </text>
            {/* Plus sign */}
            <text x={startX + halfW + 3} y={y + layerH / 2 + 4} textAnchor="middle"
              fontSize="12" fontWeight="700" fill={COLORS.mid} fontFamily={FONTS.mono}>+</text>
            {/* Layer label */}
            <text x={startX - 8} y={y + layerH / 2 + 4} textAnchor="end"
              fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>L{i + 1}</text>
          </g>
        );
      })}

      <rect x={40} y={startY + numLayers * (layerH + gap) + 5} width={500} height={52} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={290} y={startY + numLayers * (layerH + gap) + 25} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Hymba 式：每层内 SSM heads + Attention heads 并行
      </text>
      <text x={290} y={startY + numLayers * (layerH + gap) + 43} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        每层同时获得精确检索 + 高效摘要 · 适合强 ICL 小模型 · 代表: Hymba (1.5B)
      </text>
    </g>
  );
}

function SharedView() {
  const layerW = 160;
  const layerH = 22;
  const gap = 4;
  const startX = (W - layerW) / 2;
  const startY = 30;
  // Pattern: M M M A(shared1) M M M A(shared2) M M M A(shared1) M M M A(shared2)
  const layers: { type: 'mamba' | 'attention'; label: string; shared: number | null }[] = [];
  for (let g = 0; g < 4; g++) {
    for (let i = 0; i < 3; i++) {
      layers.push({ type: 'mamba', label: `Mamba ${g * 4 + i + 1}`, shared: null });
    }
    const sharedId = (g % 2) + 1;
    layers.push({ type: 'attention', label: `Attn (shared ${sharedId})`, shared: sharedId });
  }

  const attnPositions = layers
    .map((l, i) => ({ ...l, idx: i }))
    .filter(l => l.type === 'attention');

  return (
    <g>
      {layers.map((l, i) => (
        <LayerRect key={i} x={startX} y={startY + i * (layerH + gap)}
          w={layerW} h={layerH} type={l.type} label={l.label} />
      ))}

      {/* Shared connection lines */}
      {[1, 2].map((sharedId) => {
        const positions = attnPositions.filter(a => a.shared === sharedId);
        if (positions.length < 2) return null;
        const lineX = sharedId === 1 ? startX + layerW + 20 : startX + layerW + 50;
        return (
          <g key={`shared-${sharedId}`}>
            {positions.map((p, pi) => {
              const y = startY + p.idx * (layerH + gap) + layerH / 2;
              return (
                <line key={pi} x1={startX + layerW} y1={y} x2={lineX} y2={y}
                  stroke={COLORS.orange} strokeWidth="1" strokeDasharray="3 2" />
              );
            })}
            <line x1={lineX} y1={startY + positions[0].idx * (layerH + gap) + layerH / 2}
              x2={lineX} y2={startY + positions[positions.length - 1].idx * (layerH + gap) + layerH / 2}
              stroke={COLORS.orange} strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={lineX + 6} y={startY + ((positions[0].idx + positions[positions.length - 1].idx) / 2) * (layerH + gap) + layerH / 2 + 3}
              fontSize="7" fill={COLORS.orange} fontFamily={FONTS.mono}>共享 {sharedId}</text>
            {/* LoRA markers */}
            {positions.slice(1).map((p, pi) => (
              <text key={`lora-${pi}`} x={startX - 8} y={startY + p.idx * (layerH + gap) + layerH / 2 + 3}
                textAnchor="end" fontSize="7" fill={COLORS.purple} fontFamily={FONTS.mono}>+LoRA</text>
            ))}
          </g>
        );
      })}

      <rect x={40} y={startY + layers.length * (layerH + gap) + 5} width={500} height={52} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={290} y={startY + layers.length * (layerH + gap) + 25} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Zamba2 式：2 个共享 Attention 层 + LoRA 位置特化
      </text>
      <text x={290} y={startY + layers.length * (layerH + gap) + 43} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        极致参数效率 · 适合小模型端侧部署 · 代表: Zamba2 (2.7B)
      </text>
    </g>
  );
}

export default function HybridPatternCompare() {
  const [tab, setTab] = useState<Pattern>('interleaved');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        三种 Hybrid 融合范式
      </text>

      {/* Tab buttons */}
      {TABS.map((t, i) => (
        <g key={t.key} onClick={() => setTab(t.key)} cursor="pointer">
          <rect x={140 + i * 110} y={36} width={100} height={24} rx={12}
            fill={tab === t.key ? COLORS.primary : COLORS.bgAlt}
            stroke={tab === t.key ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={190 + i * 110} y={52} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={tab === t.key ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {t.label}
          </text>
        </g>
      ))}

      <g transform="translate(0, 30)">
        {tab === 'interleaved' && <InterleavedView />}
        {tab === 'parallel' && <ParallelView />}
        {tab === 'shared' && <SharedView />}
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 9: JambaArchDiagram Component

**Files:**
- Create: `src/components/interactive/JambaArchDiagram.tsx`

- [ ] **Step 1: Write the component**

Static SVG showing Jamba's full architecture with layer stack, MoE markers, and parameter distribution.

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 520;

export default function JambaArchDiagram() {
  const layerW = 180;
  const layerH = 18;
  const gap = 3;
  const stackX = 80;
  const stackY = 50;

  // One group: 7 Mamba + 1 Attention
  const groupLayers: { type: 'mamba' | 'attention'; moe: boolean }[] = [
    { type: 'mamba', moe: false },
    { type: 'mamba', moe: true },
    { type: 'mamba', moe: false },
    { type: 'mamba', moe: false },
    { type: 'mamba', moe: true },
    { type: 'mamba', moe: false },
    { type: 'mamba', moe: false },
    { type: 'attention', moe: false },
  ];

  // Show 2 full groups + "..." + partial
  const allLayers = [...groupLayers, ...groupLayers];

  // Pie chart data
  const pieData = [
    { label: 'Mamba 层', pct: 0.45, color: COLORS.primary },
    { label: 'Attention 层', pct: 0.15, color: COLORS.orange },
    { label: 'MoE experts', pct: 0.40, color: COLORS.purple },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Jamba 架构：交替式 Hybrid + MoE
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        52B total / 12B active · 256K context · 单卡 80GB 可部署
      </text>

      {/* Layer stack */}
      {allLayers.map((l, i) => {
        const y = stackY + i * (layerH + gap);
        const fill = l.type === 'mamba' ? COLORS.primary : COLORS.orange;
        return (
          <g key={i}>
            <rect x={stackX} y={y} width={layerW} height={layerH} rx={3}
              fill={fill} opacity="0.15" stroke={fill} strokeWidth="1" />
            <text x={stackX + layerW / 2} y={y + layerH / 2 + 3} textAnchor="middle"
              fontSize="8" fontWeight="500" fill={fill} fontFamily={FONTS.sans}>
              {l.type === 'mamba' ? 'Mamba' : 'Attention'}
            </text>
            {l.moe && (
              <g>
                <rect x={stackX + layerW + 8} y={y} width={55} height={layerH} rx={3}
                  fill={COLORS.purple} opacity="0.12" stroke={COLORS.purple} strokeWidth="0.8" />
                <text x={stackX + layerW + 35} y={y + layerH / 2 + 3} textAnchor="middle"
                  fontSize="7" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.mono}>
                  16E/2A
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Group brackets */}
      {[0, 1].map((g) => {
        const y1 = stackY + g * 8 * (layerH + gap);
        const y2 = y1 + 8 * (layerH + gap) - gap;
        return (
          <g key={`grp-${g}`}>
            <line x1={stackX - 12} y1={y1} x2={stackX - 12} y2={y2}
              stroke={COLORS.mid} strokeWidth="1.5" />
            <line x1={stackX - 12} y1={y1} x2={stackX - 6} y2={y1}
              stroke={COLORS.mid} strokeWidth="1.5" />
            <line x1={stackX - 12} y1={y2} x2={stackX - 6} y2={y2}
              stroke={COLORS.mid} strokeWidth="1.5" />
            <text x={stackX - 16} y={(y1 + y2) / 2 + 3} textAnchor="end"
              fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
              ×10
            </text>
          </g>
        );
      })}

      {/* "..." */}
      <text x={stackX + layerW / 2} y={stackY + 16 * (layerH + gap) + 15}
        textAnchor="middle" fontSize="14" fill={COLORS.mid} fontFamily={FONTS.mono}>
        ⋮
      </text>

      {/* Right side annotations */}
      {(() => {
        const annotX = stackX + layerW + 80;
        const attnY = stackY + 7 * (layerH + gap) + layerH / 2;
        const mambaY = stackY + 3 * (layerH + gap) + layerH / 2;
        return (
          <g>
            <line x1={stackX + layerW + 4} y1={attnY} x2={annotX - 4} y2={attnY}
              stroke={COLORS.orange} strokeWidth="0.8" strokeDasharray="3 2" />
            <text x={annotX} y={attnY - 4} fontSize="8" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>KV Cache 仅此层生成</text>
            <text x={annotX} y={attnY + 10} fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>KV cache 大小 = 1/8 纯 Transformer</text>

            <line x1={stackX + layerW + 4} y1={mambaY} x2={annotX - 4} y2={mambaY}
              stroke={COLORS.primary} strokeWidth="0.8" strokeDasharray="3 2" />
            <text x={annotX} y={mambaY - 4} fontSize="8" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans}>固定大小状态向量</text>
            <text x={annotX} y={mambaY + 10} fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>不随序列长度增长</text>
          </g>
        );
      })()}

      {/* Pie chart */}
      {(() => {
        const cx = 440;
        const cy = 430;
        const r = 40;
        let startAngle = 0;
        return (
          <g>
            <text x={cx} y={cy - r - 12} textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>参数分布</text>
            {pieData.map((d, i) => {
              const angle = d.pct * Math.PI * 2;
              const x1 = cx + r * Math.cos(startAngle);
              const y1 = cy + r * Math.sin(startAngle);
              const x2 = cx + r * Math.cos(startAngle + angle);
              const y2 = cy + r * Math.sin(startAngle + angle);
              const largeArc = angle > Math.PI ? 1 : 0;
              const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
              const labelAngle = startAngle + angle / 2;
              const lx = cx + (r + 22) * Math.cos(labelAngle);
              const ly = cy + (r + 22) * Math.sin(labelAngle);
              startAngle += angle;
              return (
                <g key={i}>
                  <path d={path} fill={d.color} opacity="0.6" stroke="#fff" strokeWidth="1" />
                  <text x={lx} y={ly + 3} textAnchor="middle" fontSize="7" fontWeight="600"
                    fill={d.color} fontFamily={FONTS.sans}>
                    {d.label} {(d.pct * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </g>
        );
      })()}

      {/* Legend */}
      <g transform="translate(40, 400)">
        <rect x={0} y={0} width={12} height={12} rx={2} fill={COLORS.primary} opacity="0.6" />
        <text x={16} y={10} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>Mamba 层</text>
        <rect x={80} y={0} width={12} height={12} rx={2} fill={COLORS.orange} opacity="0.6" />
        <text x={96} y={10} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>Attention 层</text>
        <rect x={180} y={0} width={12} height={12} rx={2} fill={COLORS.purple} opacity="0.6" />
        <text x={196} y={10} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>MoE (16E/2A)</text>
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 10: HymbaParallelHeads Component

**Files:**
- Create: `src/components/interactive/HymbaParallelHeads.tsx`

- [ ] **Step 1: Write the component**

StepNavigator with 3 steps showing Hymba's parallel head fusion process.

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function Box({ x, y, w, h, label, color, sublabel }: {
  x: number; y: number; w: number; h: number;
  label: string; color: string; sublabel?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={color} opacity="0.12" stroke={color} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + (sublabel ? -2 : 4)} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle"
          fontSize="8" fill={color} fontFamily={FONTS.sans} opacity="0.7">
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color }: {
  x1: number; y1: number; x2: number; y2: number; color: string;
}) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth="1.5" markerEnd={`url(#hymba-arrow-${color.replace('#', '')})`} />
  );
}

export default function HymbaParallelHeads() {
  const steps = [
    {
      title: '1. 输入 + Meta Tokens',
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full">
          <defs>
            <marker id={`hymba-arrow-${COLORS.primary.replace('#', '')}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill={COLORS.primary} />
            </marker>
            <marker id={`hymba-arrow-${COLORS.purple.replace('#', '')}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill={COLORS.purple} />
            </marker>
          </defs>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Meta Tokens 拼接到输入序列前
          </text>

          {/* Meta tokens */}
          {['M₁', 'M₂', 'M₃'].map((tok, i) => (
            <g key={i}>
              <rect x={80 + i * 50} y={45} width={44} height={28} rx={4}
                fill={COLORS.purple} opacity="0.15" stroke={COLORS.purple} strokeWidth="1.5" />
              <text x={102 + i * 50} y={64} textAnchor="middle" fontSize="11"
                fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.mono}>{tok}</text>
            </g>
          ))}

          {/* Separator */}
          <text x={237} y={64} fontSize="14" fill={COLORS.mid} fontFamily={FONTS.mono}>+</text>

          {/* Token embeddings */}
          {['t₁', 't₂', 't₃', 't₄', 't₅'].map((tok, i) => (
            <g key={`t-${i}`}>
              <rect x={255 + i * 50} y={45} width={44} height={28} rx={4}
                fill={COLORS.primary} opacity="0.12" stroke={COLORS.primary} strokeWidth="1" />
              <text x={277 + i * 50} y={64} textAnchor="middle" fontSize="11"
                fontWeight="500" fill={COLORS.primary} fontFamily={FONTS.mono}>{tok}</text>
            </g>
          ))}

          {/* Combined sequence */}
          <text x={W / 2} y={95} textAnchor="middle" fontSize="14" fill={COLORS.dark}
            fontFamily={FONTS.mono}>↓</text>
          <rect x={60} y={105} width={460} height={32} rx={5}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={126} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            拼接序列: [M₁, M₂, M₃, t₁, t₂, t₃, t₄, t₅]
          </text>

          <rect x={60} y={155} width={460} height={44} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={173} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Meta tokens 是可学习参数，存储全局关键信息（如任务类型、语言特征）
          </text>
          <text x={290} y={189} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            减少 Attention 需要处理的有效序列长度 → 压缩 KV cache
          </text>
        </svg>
      ),
    },
    {
      title: '2. 并行 Attention + SSM Heads',
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            同一层内：Attention 和 SSM 并行计算
          </text>

          {/* Input */}
          <Box x={200} y={40} w={180} h={28} label="拼接序列 [M + tokens]" color={COLORS.dark} />

          {/* Split arrow */}
          <line x1={240} y1={68} x2={140} y2={95} stroke={COLORS.mid} strokeWidth="1" />
          <line x1={340} y1={68} x2={440} y2={95} stroke={COLORS.mid} strokeWidth="1" />

          {/* Attention branch */}
          <Box x={50} y={95} w={180} h={40}
            label="Attention Heads" sublabel="处理 [M + tokens] 序列" color={COLORS.orange} />
          <text x={140} y={150} textAnchor="middle" fontSize="8"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Meta tokens 参与 Q/K/V 计算
          </text>

          {/* SSM branch */}
          <Box x={350} y={95} w={180} h={40}
            label="SSM Heads" sublabel="仅处理 token 序列" color={COLORS.primary} />
          <text x={440} y={150} textAnchor="middle" fontSize="8"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            不使用 Meta tokens
          </text>

          {/* Merge */}
          <line x1={140} y1={158} x2={290} y2={188} stroke={COLORS.mid} strokeWidth="1" />
          <line x1={440} y1={158} x2={290} y2={188} stroke={COLORS.mid} strokeWidth="1" />
          <text x={290} y={184} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.mono}>⊕</text>

          <Box x={200} y={195} w={180} h={28} label="输出 = Attn + SSM" color={COLORS.green} />

          <rect x={60} y={235} width={460} height={20} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="0.5" />
          <text x={290} y={249} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            并行计算无额外延迟 · Attention 提供精确检索 · SSM 提供高效摘要
          </text>
        </svg>
      ),
    },
    {
      title: '3. 输出融合 + Cross-layer KV Sharing',
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            层间 KV cache 共享 → 进一步压缩显存
          </text>

          {/* Layer stack with shared KV */}
          {[0, 1, 2, 3].map((i) => {
            const y = 45 + i * 45;
            return (
              <g key={i}>
                <rect x={100} y={y} width={240} height={32} rx={5}
                  fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
                {/* SSM half */}
                <rect x={102} y={y + 2} width={114} height={28} rx={3}
                  fill={COLORS.primary} opacity="0.1" stroke={COLORS.primary} strokeWidth="0.8" />
                <text x={159} y={y + 20} textAnchor="middle" fontSize="8"
                  fill={COLORS.primary} fontFamily={FONTS.sans}>SSM</text>
                {/* Attn half */}
                <rect x={222} y={y + 2} width={114} height={28} rx={3}
                  fill={COLORS.orange} opacity="0.1" stroke={COLORS.orange} strokeWidth="0.8" />
                <text x={279} y={y + 20} textAnchor="middle" fontSize="8"
                  fill={COLORS.orange} fontFamily={FONTS.sans}>Attn</text>
                {/* Layer label */}
                <text x={90} y={y + 20} textAnchor="end" fontSize="8"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>L{i + 1}</text>
              </g>
            );
          })}

          {/* Shared KV bracket */}
          <line x1={360} y1={45 + 16} x2={380} y2={45 + 16}
            stroke={COLORS.orange} strokeWidth="1" strokeDasharray="3 2" />
          <line x1={380} y1={45 + 16} x2={380} y2={45 + 3 * 45 + 16}
            stroke={COLORS.orange} strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1={360} y1={45 + 3 * 45 + 16} x2={380} y2={45 + 3 * 45 + 16}
            stroke={COLORS.orange} strokeWidth="1" strokeDasharray="3 2" />
          <text x={388} y={45 + 1.5 * 45 + 20} fontSize="8" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>共享 KV</text>
          <text x={388} y={45 + 1.5 * 45 + 32} fontSize="7"
            fill={COLORS.mid} fontFamily={FONTS.sans}>Cache</text>

          {/* Bottom summary */}
          <rect x={40} y={230} width={500} height={20} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="0.5" />
          <text x={290} y={244} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Hymba 1.5B: KV cache 比 Llama-3.2-3B 小 11.67× · Throughput 高 3.49×
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 11: HybridModelBenchmark Component

**Files:**
- Create: `src/components/interactive/HybridModelBenchmark.tsx`

- [ ] **Step 1: Write the component**

Interactive table with hover to show model details.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface ModelRow {
  name: string;
  totalParams: string;
  activeParams: string;
  ssmAttnRatio: string;
  throughput: string;
  avgBench: string;
  kvCache: string;
  org: string;
  year: string;
  keyDesign: string;
}

const MODELS: ModelRow[] = [
  {
    name: 'Jamba',
    totalParams: '52B',
    activeParams: '12B',
    ssmAttnRatio: '7:1',
    throughput: '1.6×',
    avgBench: '72.1',
    kvCache: '1/8',
    org: 'AI21 Labs',
    year: '2024.03',
    keyDesign: '交替式 Hybrid + MoE, 256K context',
  },
  {
    name: 'Zamba2',
    totalParams: '2.7B',
    activeParams: '2.7B',
    ssmAttnRatio: '~6:1',
    throughput: '2.0×',
    avgBench: '68.5',
    kvCache: '1/6',
    org: 'Zyphra',
    year: '2024.08',
    keyDesign: '共享式 Hybrid: 2 shared Attention + LoRA',
  },
  {
    name: 'Hymba',
    totalParams: '1.5B',
    activeParams: '1.5B',
    ssmAttnRatio: '1:1',
    throughput: '3.49×',
    avgBench: '67.3',
    kvCache: '1/12',
    org: 'NVIDIA',
    year: '2024.11',
    keyDesign: '并行式 Hybrid: Attn+SSM heads + Meta tokens',
  },
  {
    name: 'Transformer',
    totalParams: '—',
    activeParams: '—',
    ssmAttnRatio: '0:N',
    throughput: '1.0× (基准)',
    avgBench: '基准',
    kvCache: '1× (基准)',
    org: '—',
    year: '—',
    keyDesign: '纯 Attention，KV cache 随序列线性增长',
  },
  {
    name: 'Mamba',
    totalParams: '—',
    activeParams: '—',
    ssmAttnRatio: 'N:0',
    throughput: '~5×',
    avgBench: '基准-2.65',
    kvCache: 'O(1)',
    org: 'CMU/Princeton',
    year: '2023.12',
    keyDesign: '纯 SSM，Copying/ICL 受限',
  },
];

const COLS = [
  { key: 'name' as const, label: '模型', w: 70 },
  { key: 'totalParams' as const, label: '总参数', w: 55 },
  { key: 'activeParams' as const, label: 'Active', w: 55 },
  { key: 'ssmAttnRatio' as const, label: 'SSM:Attn', w: 60 },
  { key: 'throughput' as const, label: 'Throughput', w: 70 },
  { key: 'avgBench' as const, label: 'Avg Score', w: 65 },
  { key: 'kvCache' as const, label: 'KV Cache', w: 60 },
];

export default function HybridModelBenchmark() {
  const [hovered, setHovered] = useState<number | null>(null);

  const tableX = 20;
  const headerY = 50;
  const rowH = 28;
  const tableW = W - 40;

  // Calculate column positions
  const colPositions = COLS.reduce<number[]>((acc, col, i) => {
    acc.push(i === 0 ? tableX : acc[i - 1] + COLS[i - 1].w);
    return acc;
  }, []);

  const totalRows = MODELS.length;
  const detailY = headerY + (totalRows + 1) * rowH + 10;

  return (
    <svg viewBox={`0 0 ${W} ${hovered !== null ? 420 : 260}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Hybrid 模型对比
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        Hover 查看模型详细信息
      </text>

      {/* Header row */}
      <rect x={tableX} y={headerY} width={tableW} height={rowH} rx={4}
        fill={COLORS.dark} opacity="0.08" />
      {COLS.map((col, i) => (
        <text key={col.key} x={colPositions[i] + col.w / 2} y={headerY + 18}
          textAnchor="middle" fontSize="9" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {col.label}
        </text>
      ))}

      {/* Data rows */}
      {MODELS.map((model, ri) => {
        const y = headerY + (ri + 1) * rowH;
        const isHovered = hovered === ri;
        return (
          <g key={ri}
            onMouseEnter={() => setHovered(ri)}
            onMouseLeave={() => setHovered(null)}
            cursor="pointer">
            <rect x={tableX} y={y} width={tableW} height={rowH} rx={0}
              fill={isHovered ? COLORS.highlight : ri % 2 === 0 ? '#fafafa' : '#fff'}
              stroke={isHovered ? COLORS.primary : 'none'} strokeWidth={isHovered ? 1.5 : 0} />
            {COLS.map((col, ci) => (
              <text key={col.key}
                x={colPositions[ci] + col.w / 2} y={y + 18}
                textAnchor="middle" fontSize="9"
                fontWeight={ci === 0 ? '600' : '400'}
                fill={isHovered ? COLORS.primary : COLORS.dark}
                fontFamily={ci === 0 ? FONTS.sans : FONTS.mono}>
                {model[col.key]}
              </text>
            ))}
          </g>
        );
      })}

      {/* Hover detail card */}
      {hovered !== null && (
        <g>
          <rect x={40} y={detailY} width={500} height={65} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1" />
          <text x={290} y={detailY + 18} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>
            {MODELS[hovered].name}
          </text>
          <text x={290} y={detailY + 35} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {MODELS[hovered].org} · {MODELS[hovered].year}
          </text>
          <text x={290} y={detailY + 52} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {MODELS[hovered].keyDesign}
          </text>
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

---

### Task 12: hybrid-architectures.mdx Article

**Files:**
- Create: `src/content/articles/zh/hybrid-architectures.mdx`

- [ ] **Step 1: Write the article**

Full MDX article for Hybrid architectures with all 5 component imports.

````mdx
---
title: "Hybrid 架构：Mamba 与 Attention 的融合"
slug: hybrid-architectures
locale: zh
tags: [hybrid, mamba, jamba, zamba, hymba, architecture]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [state-space-models, mixture-of-experts]
references:
  - type: paper
    title: "Jamba: A Hybrid Transformer-Mamba Language Model"
    url: "https://arxiv.org/abs/2403.19887"
  - type: website
    title: "Zamba2-Small: A Hybrid SSM-Transformer Model"
    url: "https://www.zyphra.com/post/zamba2-small"
  - type: paper
    title: "Hymba: A Hybrid-head Architecture for Small Language Models"
    url: "https://arxiv.org/abs/2411.13676"
  - type: paper
    title: "An Empirical Study of Mamba-based Language Models"
    url: "https://arxiv.org/abs/2406.07887"
  - type: paper
    title: "Repeat After Me: Transformers are Better than State Space Models at Copying"
    url: "https://arxiv.org/abs/2402.01032"
---

import CopyTaskComparison from '../../../components/interactive/CopyTaskComparison.tsx';
import HybridPatternCompare from '../../../components/interactive/HybridPatternCompare.tsx';
import JambaArchDiagram from '../../../components/interactive/JambaArchDiagram.tsx';
import HymbaParallelHeads from '../../../components/interactive/HymbaParallelHeads.tsx';
import HybridModelBenchmark from '../../../components/interactive/HybridModelBenchmark.tsx';

## 纯 SSM 为什么不够

在 [上一篇文章](./state-space-models) 中我们看到，SSM/Mamba 通过固定大小的状态向量 $x \in \mathbb{R}^N$ 实现了线性复杂度和常数推理缓存。但这个优势本身就是它的根本局限：N 维状态向量无法精确存储 M 个 token 的完整信息（当 M >> N 时信息必然丢失）。

这个限制在 **copying task** 中暴露得最明显。给定输入 "A B C D | ? ? ? ?"，模型需要将前半段精确复制到后半段。Transformer 的 Attention 矩阵可以直接从输出位置连线到源 token，精确复制任意长度的序列。而 SSM 必须将所有源 token 压缩进固定大小的状态——越早的 token 信息衰减越多，序列越长准确率越低。

Jelassi et al. (2024) 在 "Repeat After Me" 论文中严格证明：**Transformer 仅需两层即可 copy 指数长度字符串，而 SSM 做不到**。这不是工程问题，而是架构的根本理论限制。

<CopyTaskComparison client:visible />

NVIDIA 在 8B 规模实验中发现，**纯 Mamba-2 模型在 12 个标准 benchmark 上比纯 Transformer 平均低 2.65 分**。但有趣的是，8B Mamba-2-Hybrid（混合架构）反而比纯 Transformer 平均**高** 2.65 分。这个结论引出了当前的共识：**Hybrid 架构是严格更优解**——纯 Attention 太贵，纯 SSM 太弱，混合才是最佳方案。

## 三种融合范式

如何将 SSM 和 Attention 组合在一起？目前有三种主流的融合范式，各有优劣：

**交替式 (Interleaved)**：Mamba 层和 Attention 层按固定比例交替堆叠。例如每 8 层中 7 层用 Mamba、1 层用 Attention。实现简单，可灵活控制 SSM:Attention 比例。大部分层用 Mamba 节省 KV cache，少量 Attention 层保证 in-context learning 能力。代表模型是 AI21 的 **Jamba**。

**并行式 (Parallel)**：同一层内 SSM heads 和 Attention heads 并行运行，输出相加融合。每层同时获得精确检索（来自 Attention）和高效摘要（来自 SSM）。实现较复杂，需要协调两种 head 的维度和融合方式。代表模型是 NVIDIA 的 **Hymba**。

**共享式 (Shared)**：少量 Attention 层被多个位置的 Mamba 层复用（参数共享）。极致参数效率——仅 2 个 Attention 层即可补足 SSM 的 copying/ICL 缺陷，通过 LoRA adapter 在不同调用位置做特化。代表模型是 Zyphra 的 **Zamba2**。

<HybridPatternCompare client:visible />

三种范式的选择取决于目标场景：
- **长上下文 + 大模型** → 交替式（高 SSM 比例压缩 KV cache）
- **小模型 + 端侧部署** → 共享式（参数效率最高）
- **强 ICL 需求 + 精确检索** → 并行式（每层都有 Attention）

通用规则：SSM 比例越高 → 长序列效率越好但 ICL 越弱；Attention 比例越高 → 反之。

## Jamba：大规模交替式 Hybrid

[Jamba](https://arxiv.org/abs/2403.19887) (AI21 Labs, 2024) 是第一个成功在大规模（52B 参数）部署 Hybrid 架构的生产模型。

**架构设计**：80 层，每 8 层为一组：7 层 Mamba + 1 层 Attention。部分层集成 MoE（16 experts, top-2 routing），使得总参数 52B 但每个 token 仅激活 12B 参数。

<JambaArchDiagram />

**设计动机**：在 256K context 下，纯 Transformer 的 KV cache 会占用大量显存。Jamba 的 KV cache 仅在 Attention 层生成（占总层数的 1/8），Mamba 层使用固定大小状态，使得 **KV cache 大小仅为同等纯 Transformer 的 1/8**。

**关键数据**：
- 256K context window，支持极长文本
- 52B 总参数 / 12B active 参数 → 单卡 80GB GPU 可部署
- 在同参数规模下：长上下文任务显著优于纯 Transformer，短上下文任务持平或略优

Jamba 验证了一个重要结论：**大部分 Transformer 层可以被 Mamba 替换而不损失质量，少量 Attention 层足以维持 ICL 能力**。这种 7:1 的比例成为后续交替式 Hybrid 设计的参考基线。

## Zamba2：参数高效的共享式 Hybrid

[Zamba2](https://www.zyphra.com/post/zamba2-small) (Zyphra, 2024) 走了一条完全不同的路线：极致参数效率。

**架构设计**：Mamba2 backbone + 仅 2 个共享 Attention 层。这 2 个 Attention 层以 ABAB 模式在多个位置被复用——它们的 Q/K/V projection 权重是共享的，但每个调用位置附加独立的 LoRA adapter 做特化。这意味着不同位置的 Attention 计算共享大部分参数，但通过低秩调整仍能表现出位置特异性。

**核心创新**：
- **共享 Attention 参数 + LoRA 特化**：兼得参数效率和层间差异
- **嵌入拼接 (Embedding Concatenation)**：将原始 embedding 拼接到每个 Attention block 的输入，防止深层信息退化
- **Mamba2 backbone**：利用 SSD 的 chunk-wise 算法加速训练

**关键数据**（2.7B 参数）：
- 推理效率等于 1-2B 参数的纯 Transformer
- 输出质量等于 3-4B 参数的纯 Transformer
- 对比 Phi-3 3.8B：**2× 更快的 TTFT (Time to First Token)**，**27% 更少显存**，**1.29× 更低生成延迟**

Zamba2 的启示是：**Attention 的作用在于"补足"SSM 的缺陷，而非替代**。仅 2 个共享 Attention 层就足够了——它们主要负责那些 SSM 做不好的精确检索任务。这使得 Zamba2 成为端侧部署的理想选择。

## Hymba：并行融合 + Meta Tokens

[Hymba](https://arxiv.org/abs/2411.13676) (NVIDIA, 2024) 提出了最精细的融合方案：在每一层内同时运行 Attention heads 和 SSM heads。

**架构设计**：每层内部包含两组 heads：Attention heads 和 SSM heads。输入 token embedding 同时送入两组 heads，它们独立计算后输出相加。此外，Hymba 引入了 **Meta Tokens**——一组可学习的 token 前缀，拼接到输入序列前端。Meta tokens 存储全局关键信息（如语言特征、任务类型），减少 Attention 需要从实际 token 中检索的信息量。

<HymbaParallelHeads client:visible />

**进一步优化**：
- **Cross-layer KV sharing**：相邻层共享 Attention 的 KV cache，减少存储开销
- **Partial sliding window attention**：部分 Attention heads 使用局部窗口而非全局 Attention，进一步压缩计算

**关键数据**（1.5B 参数）：
- 超越 Llama-3.2-3B（+1.32% 平均分数），参数量仅为其一半
- **KV cache 比 Llama-3.2-3B 小 11.67×**
- **Throughput 高 3.49×**

Hymba 的并行式设计保证了每一层都能同时利用 Attention 的精确检索和 SSM 的高效摘要。代价是实现复杂度最高，但效果也最好——尤其适合需要强 ICL 能力的小模型。

## 模型对比

下面的表格汇总了主要 Hybrid 模型的关键指标。Throughput 和 KV Cache 大小相对于同规模纯 Transformer baseline：

<HybridModelBenchmark client:visible />

几个关键观察：
1. **没有统一最优比例**：Jamba 用 7:1，Zamba2 用 ~6:1，Hymba 用 1:1 — 最优 SSM:Attention 比例因模型规模和目标任务而异
2. **Hybrid 一致优于两个极端**：纯 Transformer（太贵）和纯 Mamba（太弱）都不是最优解
3. **KV cache 压缩是核心收益**：所有 Hybrid 模型的 KV cache 都显著小于纯 Transformer

## 总结与展望

Hybrid 架构代表了当前序列建模的共识方向：

| 维度 | 纯 Attention | 纯 SSM | Hybrid |
|------|------------|--------|--------|
| 训练效率 | $O(N^2)$ | $O(N)$ | $O(N)$~$O(N^2)$ |
| 推理 KV cache | $O(N)$ | $O(1)$ | 大幅减少 |
| ICL / Copying | 精确 | 受限 | 精确（靠 Attention 层）|
| 长序列支持 | 困难 | 原生 | 良好 |
| 工程复杂度 | 成熟 | 中等 | 较高 |

**趋势与开放问题**：
- **最优混合策略仍在探索**：如何自动搜索最优 SSM:Attention 比例和放置位置？
- **SSM 能否突破 copying 限制？** 更大的状态维度或新的状态更新机制可能缩小差距
- **硬件协同设计**：未来芯片是否会为 SSM 的 scan 操作提供专用硬件支持？
- **统一框架**：Mamba-2 的 SSD 框架暗示 Attention 和 SSM 可能最终统一为同一个数学框架的不同特例

## 延伸阅读

- [状态空间模型与 Mamba](./state-space-models) — SSM 基础原理和 Mamba 选择性机制
- [Attention 计算](./attention-computation) — 理解标准 Attention 的工作原理
- [Mixture of Experts](./mixture-of-experts) — Jamba 使用的 MoE 技术
- [Attention 变体](./attention-variants) — Sliding Window 等 Attention 优化方法
````

- [ ] **Step 2: Validate and verify**

```bash
npm run validate && npm run dev
```

- [ ] **Step 3: Commit Article 2 and its components**

```bash
git add src/components/interactive/CopyTaskComparison.tsx \
  src/components/interactive/HybridPatternCompare.tsx \
  src/components/interactive/JambaArchDiagram.tsx \
  src/components/interactive/HymbaParallelHeads.tsx \
  src/components/interactive/HybridModelBenchmark.tsx \
  src/content/articles/zh/hybrid-architectures.mdx
git commit -m "feat: add hybrid-architectures article with 5 components"
```

---

### Task 13: Update transformer-core.yaml

**Files:**
- Modify: `src/content/paths/transformer-core.yaml:22-23`

- [ ] **Step 1: Append two new articles to path**

Add `state-space-models` and `hybrid-architectures` after `mixture-of-experts`:

```yaml
  - mixture-of-experts
  - state-space-models
  - hybrid-architectures
```

- [ ] **Step 2: Validate**

```bash
npm run validate
```

- [ ] **Step 3: Commit path update**

```bash
git add src/content/paths/transformer-core.yaml
git commit -m "feat: add SSM and hybrid articles to transformer-core path"
```
