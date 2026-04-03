# Matrix Acceleration Article — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the "矩阵加速单元 — Tensor Core 与 XMX" article with 8 interactive/static components, covering why matrix units exist, systolic arrays, NVIDIA Tensor Core, Intel XMX, and dual-pipe overlap.

**Architecture:** Astro MDX article with React island components. Each component is a self-contained `.tsx` file in `src/components/interactive/`, imported in the MDX with `client:visible` for interactive components. Static diagrams use pure SVG; animated components use StepNavigator primitive and `useState`. Shared colors/fonts from `src/components/interactive/shared/colors.ts`.

**Tech Stack:** Astro 5, React, TypeScript, motion/react, SVG, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-03-gpu-deep-dive-design.md` — Article 2

---

## Key Decisions & Context

### Project-Level Decisions (carried from Article 1)
- **Phase 1 = 4 articles**: GPU Architecture → 矩阵加速单元 → CUDA 编程模型 → GEMM 优化
- **归入 ai-compute-stack 学习路径**
- **混合型风格**: 交互动画建立直觉 + 关键处给真实代码片段
- **NVIDIA 为主线, Intel iGPU (Xe2) 详讲**, AMD 简要提及
- **XMX 很重要** — 本文讲硬件原理, 文章 3 讲编程接口, 文章 4 讲 GEMM 优化
- **不用 emoji** — CLAUDE.md 规定

### This Article's Decisions
- **前置文章**: `gpu-architecture` — 读者已了解 SM、Processing Block、Warp、CUDA Core 概念
- **Systolic Array 用 4×4 PE 网格动画** — 核心组件，逐拍步进展示数据流动
- **用具体数值做动画**: A 和 B 矩阵用小整数，可追踪 partial sum 变化
- **Tensor Core MMA 用 warp 级视角**: 32 线程各持有 fragment → Tensor Core 执行 → 输出分发
- **Intel XMX 单独 Section**: Xe-Core 内部结构 + systolic array 尺寸 + Lunar Lake/Panther Lake 规格
- **Dual-pipe 以 DeepSeek V3/R1 为实例**: FP8 训练中 GEMM (Tensor Core) 与 element-wise (CUDA Core) 重叠
- **静态组件不加 `client:visible`**: 减少 JS bundle（Article 1 review 决定）
- **StepNavigator 用于步进动画**: 复用 `src/components/primitives/StepNavigator.tsx`
- **MatrixGrid 可用于矩阵展示**: 复用 `src/components/primitives/MatrixGrid.tsx`

### Codebase Patterns to Follow
- 组件文件命名: PascalCase, 放在 `src/components/interactive/`
- MDX import 路径: `'../../../components/interactive/XXX.tsx'`
- 交互组件必须加 `client:visible`
- 共享常量: `import { COLORS, FONTS } from './shared/colors'`
- 动画库: `import { motion } from 'motion/react'`
- 步骤动画: `import StepNavigator from '../primitives/StepNavigator'`
- Frontmatter 必填: title, slug, locale, tags, difficulty, created, updated, references
- Build: `npm run build`, 验证: `npm run validate`
- 当前 build 产出 46 pages, 新增 1 页后应为 47 pages

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/content/articles/zh/matrix-acceleration.mdx` | Article — 6 sections on matrix acceleration units |
| `src/components/interactive/TensorCoreVsCudaCore.tsx` | StepNavigator: 4×4 matmul CUDA Core (112 ops) vs Tensor Core (1 op) |
| `src/components/interactive/SystolicArrayAnimation.tsx` | StepNavigator: 4×4 PE grid systolic array clock-by-clock |
| `src/components/interactive/SystolicDataflowCompare.tsx` | Static SVG: output-stationary vs weight-stationary |
| `src/components/interactive/TensorCorePrecisionTimeline.tsx` | Static SVG: Volta→Blackwell precision support timeline |
| `src/components/interactive/TensorCoreMmaFlow.tsx` | StepNavigator: warp-level MMA data flow |
| `src/components/interactive/XmxArchitectureDiagram.tsx` | Static SVG: Intel XMX internal structure |
| `src/components/interactive/TensorCoreXmxCompare.tsx` | Interactive table: Tensor Core vs XMX comparison |
| `src/components/interactive/DualPipeOverlap.tsx` | StepNavigator: serial vs dual-pipe overlapped execution |

### Modified Files

| File | Change |
|------|--------|
| `src/content/paths/ai-compute-stack.yaml` | Add `matrix-acceleration` after `gpu-architecture` |

---

### Task 1: TensorCoreVsCudaCore — CUDA Core vs Tensor Core throughput comparison

**Files:**
- Create: `src/components/interactive/TensorCoreVsCudaCore.tsx`

StepNavigator animation comparing 4×4 matrix multiply: CUDA Core path (112 scalar operations) vs Tensor Core path (1 MMA instruction).

- [ ] **Step 1: Create the component**

Create `src/components/interactive/TensorCoreVsCudaCore.tsx`:

```tsx
// src/components/interactive/TensorCoreVsCudaCore.tsx
// StepNavigator: CUDA Core (112 scalar ops) vs Tensor Core (1 MMA) for 4×4 matmul
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const SVG_H = 260;
const CELL = 28;
const GAP = 2;

// 4×4 matrix visualization
function Matrix4x4({
  x, y, label, fills, values,
}: {
  x: number; y: number; label: string;
  fills: string[][]; values?: number[][];
}) {
  return (
    <g>
      <text x={x + (CELL * 4 + GAP * 3) / 2} y={y - 6} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => {
          const cx = x + c * (CELL + GAP);
          const cy = y + r * (CELL + GAP);
          return (
            <g key={`${r}-${c}`}>
              <rect x={cx} y={cy} width={CELL} height={CELL} rx={3}
                fill={fills[r][c]} stroke="#94a3b8" strokeWidth={0.5} />
              {values && (
                <text x={cx + CELL / 2} y={cy + CELL / 2} textAnchor="middle"
                  dominantBaseline="middle" fontSize="8" fill={COLORS.dark}
                  fontFamily={FONTS.mono}>
                  {values[r][c]}
                </text>
              )}
            </g>
          );
        })
      )}
    </g>
  );
}

// Simple values for demo
const A = [[1, 2, 3, 0], [0, 1, 2, 3], [3, 0, 1, 2], [2, 3, 0, 1]];
const B = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0], [0, 0, 1, 1]];
// C = A×B (verified)
const C = [
  [4, 5, 1, 2], [2, 3, 3, 4], [4, 1, 5, 2], [2, 3, 3, 4],
];

const EMPTY = '#f8fafc';
const ACTIVE = '#dbeafe';
const DONE = '#dcfce7';
const TC_DONE = '#e8d5f5';

function makeGrid(fill: string): string[][] {
  return Array.from({ length: 4 }, () => Array(4).fill(fill));
}

// For CUDA Core step: show partial fill — first N elements filled
function cudaFills(doneCount: number): string[][] {
  const grid = makeGrid(EMPTY);
  let count = 0;
  for (let r = 0; r < 4 && count < doneCount; r++) {
    for (let c = 0; c < 4 && count < doneCount; c++) {
      grid[r][c] = DONE;
      count++;
    }
  }
  return grid;
}

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Operation counter box
function OpsCounter({ x, y, current, total, color }: {
  x: number; y: number; current: number; total: number; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={100} height={30} rx={5}
        fill="white" stroke={color} strokeWidth={1.5} />
      <text x={x + 50} y={y + 12} textAnchor="middle"
        fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
        操作计数
      </text>
      <text x={x + 50} y={y + 24} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={color} fontFamily={FONTS.mono}>
        {current} / {total}
      </text>
    </g>
  );
}

const steps = [
  {
    title: '矩阵乘法 C = A × B (4×4)',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          目标: 计算 C(4×4) = A(4×4) × B(4×4) — 需要多少次操作?
        </text>
        <Matrix4x4 x={30} y={50} label="A (4×4)" fills={makeGrid('#dbeafe')} values={A} />
        <text x={W / 2 - 30} y={120} fontSize="20" fill={COLORS.dark} fontFamily={FONTS.sans}>×</text>
        <Matrix4x4 x={210} y={50} label="B (4×4)" fills={makeGrid('#dcfce7')} values={B} />
        <text x={W / 2 + 80} y={120} fontSize="20" fill={COLORS.dark} fontFamily={FONTS.sans}>=</text>
        <Matrix4x4 x={390} y={50} label="C (4×4)" fills={makeGrid(EMPTY)} />
        <text x={W / 2} y={200} textAnchor="middle" fontSize="10" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个输出元素 C[i][j] = 4 次乘法 + 3 次加法 = 7 次操作
        </text>
        <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fill="#64748b"
          fontFamily={FONTS.sans}>
          16 个输出元素 × 7 = 112 次标量操作（实际为 64 次乘法 + 48 次加法）
        </text>
        <text x={W / 2} y={245} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          CUDA Core: 逐个标量操作 → 112 次 | Tensor Core: 一条 MMA 指令 → 1 次
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'CUDA Core 路径 — 112 次标量操作',
    content: (
      <StepSvg>
        {/* Left: CUDA Core */}
        <text x={W / 4} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          CUDA Core 路径
        </text>
        <text x={W / 4} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          逐元素: 每个 C[i][j] 需要 4 次乘 + 3 次加
        </text>
        {/* Show output matrix partially filled */}
        <Matrix4x4 x={50} y={50} label="C — 逐个计算中..." fills={cudaFills(6)} values={C} />
        <OpsCounter x={90} y={180} current={42} total={112} color={COLORS.primary} />
        {/* Equation for current element */}
        <text x={W / 4} y={235} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.mono}>
          C[1][1] = A[1][0]×B[0][1] + A[1][1]×B[1][1] + A[1][2]×B[2][1] + A[1][3]×B[3][1]
        </text>

        {/* Divider */}
        <line x1={W / 2} y1={10} x2={W / 2} y2={SVG_H - 10}
          stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />

        {/* Right: result if Tensor Core */}
        <text x={W * 3 / 4} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.purple} fontFamily={FONTS.sans}>
          Tensor Core 路径
        </text>
        <text x={W * 3 / 4} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          一条 MMA 指令: D = A · B + C
        </text>
        <Matrix4x4 x={W / 2 + 60} y={50} label="C — 已完成" fills={makeGrid(TC_DONE)} values={C} />
        <OpsCounter x={W / 2 + 100} y={180} current={1} total={1} color={COLORS.purple} />
        <text x={W * 3 / 4} y={235} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.mono}>
          mma.sync.aligned.m4n4k4 — 一条指令完成整块矩阵乘
        </text>
      </StepSvg>
    ),
  },
  {
    title: '吞吐量差距 — 一个数量级',
    content: (
      <StepSvg>
        <text x={W / 2} y={24} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          H100 SXM 理论峰值对比
        </text>

        {/* CUDA Core bar */}
        <rect x={120} y={50} width={120} height={36} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={60} y={72} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          CUDA Core
        </text>
        <text x={180} y={64} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.mono}>
          ~67 TFLOPS
        </text>
        <text x={250} y={72} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          FP32
        </text>

        {/* Tensor Core bar — much wider */}
        <rect x={120} y={100} width={400} height={36} rx={5}
          fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1.5} />
        <text x={60} y={122} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.purple} fontFamily={FONTS.sans}>
          Tensor Core
        </text>
        <text x={320} y={114} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700" fill={COLORS.purple} fontFamily={FONTS.mono}>
          ~990 TFLOPS
        </text>
        <text x={530} y={122} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          FP16
        </text>

        {/* Ratio */}
        <text x={W / 2} y={160} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Tensor Core 吞吐量约为 CUDA Core 的 15 倍（FP16 vs FP32）
        </text>

        {/* Why it matters */}
        <rect x={40} y={180} width={W - 80} height={60} rx={6}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={200} textAnchor="middle" fontSize="10" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          AI 训练和推理中 90%+ 的计算量是矩阵乘法
        </text>
        <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Tensor Core / XMX 等专用单元让这些计算快一个数量级
        </text>
        <text x={W / 2} y={236} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          关键: 它们内部都是 Systolic Array（脉动阵列）的变体 → 下一节详解
        </text>
      </StepSvg>
    ),
  },
];

export default function TensorCoreVsCudaCore() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds (component not yet imported in any page, so no runtime errors to check yet).

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TensorCoreVsCudaCore.tsx
git commit -m "feat: add TensorCoreVsCudaCore step animation"
```

---

### Task 2: SystolicArrayAnimation — systolic array clock-by-clock visualization

**Files:**
- Create: `src/components/interactive/SystolicArrayAnimation.tsx`

Core component. StepNavigator animation showing a 4×4 PE grid performing matrix multiply. Data flows in from left (A rows) and top (B columns), staggered by row/column index. Each step = one clock cycle, showing active PEs and partial sum accumulation.

**Systolic array math (output-stationary):**
- PE(i,j) computes C[i][j] = Σ_k A[i][k] × B[k][j]
- A[i][k] and B[k][j] both arrive at PE(i,j) at cycle t = i + j + k
- PE(i,j) is active for k = 0..3, at cycles t = i+j, i+j+1, i+j+2, i+j+3
- Total cycles: 0 through 9 (10 cycles for 4×4 × 4×4)

**Input matrices (small integers for clarity):**
- A = [[2,1,0,1],[1,2,1,0],[0,1,2,1],[1,0,1,2]]
- B = [[1,0,1,0],[0,1,0,1],[1,0,1,0],[0,1,0,1]]

**Show selected cycles as steps (not all 10):**
- Step 0: Intro — empty grid + matrices
- Step 1: Cycle 0 — PE(0,0) active
- Step 2: Cycle 1 — 2 PEs active
- Step 3: Cycle 3 — maximum diagonal (4 PEs)
- Step 4: Cycle 5 — middle phase
- Step 5: Cycle 9 — last PE finishes
- Step 6: Result — all PEs show final C values

- [ ] **Step 1: Create the component**

Create `src/components/interactive/SystolicArrayAnimation.tsx`:

```tsx
// src/components/interactive/SystolicArrayAnimation.tsx
// StepNavigator: 4×4 output-stationary systolic array, clock-by-clock
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const N = 4; // matrix dimension
const W = 580;
const SVG_H = 340;

// Input matrices
const A = [[2, 1, 0, 1], [1, 3, 1, 0], [0, 1, 2, 1], [1, 0, 1, 3]];
const B = [[1, 0, 2, 1], [2, 1, 0, 0], [0, 3, 1, 2], [1, 0, 0, 1]];

// Precompute C = A × B
function computeC(): number[][] {
  const C: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      for (let k = 0; k < N; k++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}
const C = computeC();

// Precompute partial sums at each cycle for each PE
// PE(i,j) processes k = t - i - j at cycle t (if 0 ≤ k < N)
function partialSumAt(i: number, j: number, upToCycle: number): number {
  let sum = 0;
  for (let t = 0; t <= upToCycle; t++) {
    const k = t - i - j;
    if (k >= 0 && k < N) {
      sum += A[i][k] * B[k][j];
    }
  }
  return sum;
}

// Check if PE(i,j) is active at cycle t
function isActiveAt(i: number, j: number, t: number): boolean {
  const k = t - i - j;
  return k >= 0 && k < N;
}

// PE grid layout
const GRID_X = 160;
const GRID_Y = 60;
const PE_SIZE = 56;
const PE_GAP = 6;

interface PeState {
  active: boolean;
  partialSum: number;
  done: boolean; // all k processed
  currentK: number; // which k is being processed (-1 if not active)
}

function getPeStates(cycle: number): PeState[][] {
  return Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => {
      const k = cycle - i - j;
      const active = k >= 0 && k < N;
      const done = cycle >= i + j + N; // all N values processed
      return {
        active,
        partialSum: partialSumAt(i, j, cycle),
        done,
        currentK: active ? k : -1,
      };
    })
  );
}

function PeGrid({ cycle, showResult }: { cycle: number; showResult?: boolean }) {
  const states = getPeStates(cycle);

  return (
    <g>
      {/* Column headers (B columns) */}
      {Array.from({ length: N }).map((_, j) => (
        <text key={`bh-${j}`}
          x={GRID_X + j * (PE_SIZE + PE_GAP) + PE_SIZE / 2} y={GRID_Y - 8}
          textAnchor="middle" fontSize="8" fill={COLORS.green} fontFamily={FONTS.sans}>
          B col {j} ↓
        </text>
      ))}

      {/* Row headers (A rows) */}
      {Array.from({ length: N }).map((_, i) => (
        <text key={`ah-${i}`}
          x={GRID_X - 8} y={GRID_Y + i * (PE_SIZE + PE_GAP) + PE_SIZE / 2}
          textAnchor="end" dominantBaseline="middle"
          fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
          A row {i} →
        </text>
      ))}

      {/* PE cells */}
      {Array.from({ length: N }).map((_, i) =>
        Array.from({ length: N }).map((_, j) => {
          const px = GRID_X + j * (PE_SIZE + PE_GAP);
          const py = GRID_Y + i * (PE_SIZE + PE_GAP);
          const s = states[i][j];
          const bg = showResult ? '#dcfce7'
            : s.active ? '#fff7ed'
            : s.done ? '#dbeafe'
            : '#f8fafc';
          const border = s.active ? COLORS.orange : s.done ? COLORS.primary : '#cbd5e1';

          return (
            <g key={`pe-${i}-${j}`}>
              <rect x={px} y={py} width={PE_SIZE} height={PE_SIZE} rx={4}
                fill={bg} stroke={border} strokeWidth={s.active ? 2 : 1} />
              <text x={px + PE_SIZE / 2} y={py + 12} textAnchor="middle"
                fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
                PE({i},{j})
              </text>
              {(s.partialSum !== 0 || s.done || showResult) && (
                <text x={px + PE_SIZE / 2} y={py + PE_SIZE / 2 + 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="700"
                  fill={showResult ? COLORS.green : s.active ? COLORS.orange : COLORS.primary}
                  fontFamily={FONTS.mono}>
                  {showResult ? C[i][j] : s.partialSum}
                </text>
              )}
              {s.active && !showResult && (
                <text x={px + PE_SIZE / 2} y={py + PE_SIZE - 8} textAnchor="middle"
                  fontSize="6" fill={COLORS.orange} fontFamily={FONTS.mono}>
                  +A[{i}][{s.currentK}]×B[{s.currentK}][{j}]
                </text>
              )}
            </g>
          );
        })
      )}
    </g>
  );
}

function Legend({ cycle, label }: { cycle: number; label: string }) {
  return (
    <g>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
      <text x={W / 2} y={SVG_H - 12} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        {[
          { color: COLORS.orange, label: '当前活跃 (MAC)' },
          { color: COLORS.primary, label: '已完成部分累加' },
          { color: '#cbd5e1', label: '空闲' },
        ].map((item, idx) => `■ ${item.label}`).join('    ')}
      </text>
      {/* Colored legend squares */}
      {[COLORS.orange, COLORS.primary, '#cbd5e1'].map((color, idx) => (
        <rect key={idx}
          x={W / 2 - 160 + idx * 120} y={SVG_H - 20}
          width={8} height={8} rx={1} fill={color} />
      ))}
    </g>
  );
}

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img"
      aria-label="Systolic array animation">
      {children}
    </svg>
  );
}

// Show input matrices in intro step
function InputMatrices() {
  const matY = 50;
  const cellSz = 22;
  const gap = 1;

  function SmallMatrix({ x, y, data, label, color }: {
    x: number; y: number; data: number[][]; label: string; color: string;
  }) {
    return (
      <g>
        <text x={x + (cellSz * N + gap * (N - 1)) / 2} y={y - 6}
          textAnchor="middle" fontSize="10" fontWeight="600" fill={color}
          fontFamily={FONTS.sans}>{label}</text>
        {data.map((row, r) =>
          row.map((val, c) => (
            <g key={`${r}-${c}`}>
              <rect x={x + c * (cellSz + gap)} y={y + r * (cellSz + gap)}
                width={cellSz} height={cellSz} rx={2}
                fill="white" stroke={color} strokeWidth={0.5} />
              <text x={x + c * (cellSz + gap) + cellSz / 2}
                y={y + r * (cellSz + gap) + cellSz / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill={COLORS.dark} fontFamily={FONTS.mono}>
                {val}
              </text>
            </g>
          ))
        )}
      </g>
    );
  }

  return (
    <g>
      <SmallMatrix x={20} y={matY} data={A} label="A (输入)" color={COLORS.primary} />
      <text x={140} y={matY + 45} fontSize="16" fill={COLORS.dark}>×</text>
      <SmallMatrix x={160} y={matY} data={B} label="B (权重)" color={COLORS.green} />
      <text x={280} y={matY + 45} fontSize="16" fill={COLORS.dark}>=</text>
      <SmallMatrix x={300} y={matY} data={C} label="C (输出)" color={COLORS.orange} />
    </g>
  );
}

const selectedCycles = [
  { cycle: -1, label: '初始状态 — 输入矩阵与 PE 阵列' },
  { cycle: 0, label: 'Cycle 0 — 第一个 PE 开始计算' },
  { cycle: 1, label: 'Cycle 1 — 波前扩展' },
  { cycle: 3, label: 'Cycle 3 — 主对角线全部活跃' },
  { cycle: 5, label: 'Cycle 5 — 前排 PE 完成, 后排继续' },
  { cycle: 9, label: 'Cycle 9 — 最后一个 PE 完成' },
  { cycle: 100, label: '最终结果 — C = A × B' },
];

const steps = selectedCycles.map(({ cycle, label }) => ({
  title: label.split(' — ')[0],
  content: (
    <StepSvg>
      {cycle === -1 ? (
        <g>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Output-Stationary Systolic Array (4×4)
          </text>
          <InputMatrices />
          <text x={W / 2} y={180} textAnchor="middle" fontSize="10" fill="#64748b"
            fontFamily={FONTS.sans}>
            每个 PE 计算输出矩阵的一个元素。A 从左侧逐行流入，B 从顶部逐列流入
          </text>
          <text x={W / 2} y={200} textAnchor="middle" fontSize="10" fill="#64748b"
            fontFamily={FONTS.sans}>
            输入按行/列索引错开（stagger），保证同一 k 的 A[i][k] 和 B[k][j] 同时到达 PE(i,j)
          </text>
          <text x={W / 2} y={225} textAnchor="middle" fontSize="9" fill={COLORS.primary}
            fontFamily={FONTS.sans}>
            PE(i,j) 在 cycle t = i+j+k 时处理第 k 对输入 → 总共需要 10 个 cycle (0~9)
          </text>
        </g>
      ) : (
        <g>
          <Legend cycle={cycle} label={label} />
          <PeGrid cycle={Math.min(cycle, 9)} showResult={cycle > 9} />
        </g>
      )}
    </StepSvg>
  ),
}));

export default function SystolicArrayAnimation() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SystolicArrayAnimation.tsx
git commit -m "feat: add SystolicArrayAnimation 4x4 PE grid demo"
```

---

### Task 3: SystolicDataflowCompare — output-stationary vs weight-stationary

**Files:**
- Create: `src/components/interactive/SystolicDataflowCompare.tsx`

Static SVG showing two systolic array dataflow variants side by side. Each shows a 3×3 PE grid with arrows indicating which data stays, which flows, and where partial sums accumulate.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/SystolicDataflowCompare.tsx`:

```tsx
// src/components/interactive/SystolicDataflowCompare.tsx
// Static SVG: Output-stationary vs Weight-stationary systolic array comparison
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;
const HALF = W / 2 - 10;
const PE = 40;
const GAP = 8;

function Arrow({ x1, y1, x2, y2, color }: {
  x1: number; y1: number; x2: number; y2: number; color: string;
}) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={1.5} markerEnd={`url(#arrow-${color.replace('#', '')})`} />
  );
}

function PeGrid3x3({ offsetX, title, subtitle, peLabel, stayLabel, stayColor,
  flowH, flowHColor, flowHLabel, flowV, flowVColor, flowVLabel,
}: {
  offsetX: number; title: string; subtitle: string; peLabel: string;
  stayLabel: string; stayColor: string;
  flowH: boolean; flowHColor: string; flowHLabel: string;
  flowV: boolean; flowVColor: string; flowVLabel: string;
}) {
  const gridX = offsetX + 40;
  const gridY = 80;

  return (
    <g>
      <text x={offsetX + HALF / 2} y={24} textAnchor="middle" fontSize="11"
        fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
      <text x={offsetX + HALF / 2} y={42} textAnchor="middle" fontSize="9"
        fill="#64748b" fontFamily={FONTS.sans}>{subtitle}</text>

      {/* 3×3 PE grid */}
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 3 }).map((_, c) => {
          const x = gridX + c * (PE + GAP);
          const y = gridY + r * (PE + GAP);
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={PE} height={PE} rx={4}
                fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
              <text x={x + PE / 2} y={y + PE / 2 - 4} textAnchor="middle"
                dominantBaseline="middle" fontSize="7" fill={COLORS.dark}
                fontFamily={FONTS.sans}>PE</text>
              <text x={x + PE / 2} y={y + PE / 2 + 8} textAnchor="middle"
                fontSize="7" fontWeight="600" fill={stayColor}
                fontFamily={FONTS.sans}>{peLabel}</text>
            </g>
          );
        })
      )}

      {/* Horizontal flow arrows (A or partial sums) */}
      {flowH && Array.from({ length: 3 }).map((_, r) => {
        const y = gridY + r * (PE + GAP) + PE / 2;
        return (
          <g key={`fh-${r}`}>
            <Arrow x1={gridX - 20} y1={y} x2={gridX - 4} y2={y} color={flowHColor} />
            {Array.from({ length: 2 }).map((_, c) => (
              <Arrow key={c}
                x1={gridX + (c + 1) * (PE + GAP) - GAP + 2}
                y1={y}
                x2={gridX + (c + 1) * (PE + GAP) - 2}
                y2={y}
                color={flowHColor} />
            ))}
          </g>
        );
      })}

      {/* Vertical flow arrows (B or partial sums) */}
      {flowV && Array.from({ length: 3 }).map((_, c) => {
        const x = gridX + c * (PE + GAP) + PE / 2;
        return (
          <g key={`fv-${c}`}>
            <Arrow x1={x} y1={gridY - 20} x2={x} y2={gridY - 4} color={flowVColor} />
            {Array.from({ length: 2 }).map((_, r) => (
              <Arrow key={r}
                x1={x}
                y1={gridY + (r + 1) * (PE + GAP) - GAP + 2}
                x2={x}
                y2={gridY + (r + 1) * (PE + GAP) - 2}
                color={flowVColor} />
            ))}
          </g>
        );
      })}

      {/* Flow labels */}
      {flowH && (
        <text x={gridX - 24} y={gridY + PE / 2 - 14} fontSize="8" fill={flowHColor}
          fontFamily={FONTS.sans} textAnchor="end">{flowHLabel}</text>
      )}
      {flowV && (
        <text x={gridX + PE / 2 + (PE + GAP)} y={gridY - 24} textAnchor="middle"
          fontSize="8" fill={flowVColor} fontFamily={FONTS.sans}>{flowVLabel}</text>
      )}

      {/* Stay label */}
      <rect x={offsetX + 10} y={H - 60} width={HALF - 20} height={34} rx={5}
        fill="white" stroke={stayColor} strokeWidth={1} />
      <text x={offsetX + HALF / 2} y={H - 48} textAnchor="middle" fontSize="9"
        fontWeight="600" fill={stayColor} fontFamily={FONTS.sans}>
        固定: {stayLabel}
      </text>
      <text x={offsetX + HALF / 2} y={H - 34} textAnchor="middle" fontSize="8"
        fill="#64748b" fontFamily={FONTS.sans}>
        {title === 'Output-Stationary' ? '部分和 C 留在 PE 中累加，A/B 流过' : '权重 B 预加载到 PE，A 流过，部分和向下传递'}
      </text>
    </g>
  );
}

export default function SystolicDataflowCompare() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Output-stationary vs weight-stationary systolic array comparison">
      <defs>
        {[COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple].map(color => (
          <marker key={color} id={`arrow-${color.replace('#', '')}`}
            viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>

      {/* Left: Output-Stationary */}
      <PeGrid3x3
        offsetX={0}
        title="Output-Stationary"
        subtitle="C 留在 PE，A 和 B 流动"
        peLabel="C[i][j]"
        stayLabel="输出矩阵 C"
        stayColor={COLORS.orange}
        flowH={true} flowHColor={COLORS.primary} flowHLabel="A 行 →"
        flowV={true} flowVColor={COLORS.green} flowVLabel="B 列 ↓"
      />

      {/* Divider */}
      <line x1={W / 2} y1={10} x2={W / 2} y2={H - 10}
        stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />

      {/* Right: Weight-Stationary */}
      <PeGrid3x3
        offsetX={W / 2 + 10}
        title="Weight-Stationary"
        subtitle="B 预加载到 PE，A 流动，部分和传递"
        peLabel="B[i][j]"
        stayLabel="权重矩阵 B"
        stayColor={COLORS.purple}
        flowH={true} flowHColor={COLORS.primary} flowHLabel="A 行 →"
        flowV={true} flowVColor={COLORS.orange} flowVLabel="部分和 ↓"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SystolicDataflowCompare.tsx
git commit -m "feat: add SystolicDataflowCompare static diagram"
```

---

### Task 4: TensorCorePrecisionTimeline — generation precision timeline

**Files:**
- Create: `src/components/interactive/TensorCorePrecisionTimeline.tsx`

Static SVG horizontal timeline showing Tensor Core precision support evolution from Volta (2017) through Blackwell (2024). Each generation shows which data types it added.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/TensorCorePrecisionTimeline.tsx`:

```tsx
// src/components/interactive/TensorCorePrecisionTimeline.tsx
// Static SVG: Tensor Core precision support evolution Volta → Blackwell
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

interface GenInfo {
  name: string;
  year: number;
  gen: string;
  newTypes: string[];
  allTypes: string[];
  x: number;
}

const generations: GenInfo[] = [
  {
    name: 'Volta', year: 2017, gen: '1st gen',
    newTypes: ['FP16'],
    allTypes: ['FP16'],
    x: 40,
  },
  {
    name: 'Turing', year: 2018, gen: '2nd gen',
    newTypes: ['INT8', 'INT4', 'INT1'],
    allTypes: ['FP16', 'INT8', 'INT4', 'INT1'],
    x: 150,
  },
  {
    name: 'Ampere', year: 2020, gen: '3rd gen',
    newTypes: ['TF32', 'BF16', 'FP64'],
    allTypes: ['FP16', 'BF16', 'TF32', 'FP64', 'INT8', 'INT4', 'INT1'],
    x: 260,
  },
  {
    name: 'Hopper', year: 2022, gen: '4th gen',
    newTypes: ['FP8'],
    allTypes: ['FP16', 'BF16', 'TF32', 'FP64', 'FP8', 'INT8'],
    x: 370,
  },
  {
    name: 'Blackwell', year: 2024, gen: '5th gen',
    newTypes: ['FP4'],
    allTypes: ['FP16', 'BF16', 'TF32', 'FP64', 'FP8', 'FP4', 'INT8'],
    x: 480,
  },
];

const TYPE_COLORS: Record<string, string> = {
  FP16: '#1565c0',
  BF16: '#0277bd',
  TF32: '#00838f',
  FP64: '#4527a0',
  FP8: '#e65100',
  FP4: '#c62828',
  INT8: '#2e7d32',
  INT4: '#558b2f',
  INT1: '#827717',
};

export default function TensorCorePrecisionTimeline() {
  const lineY = 80;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Tensor Core precision support timeline from Volta to Blackwell">

      {/* Title */}
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Tensor Core 精度支持演进
      </text>

      {/* Timeline line */}
      <line x1={30} y1={lineY} x2={W - 30} y2={lineY}
        stroke="#cbd5e1" strokeWidth={2} />

      {/* Generation nodes */}
      {generations.map((gen, gi) => (
        <g key={gi}>
          {/* Dot on timeline */}
          <circle cx={gen.x} cy={lineY} r={6}
            fill={COLORS.primary} stroke="white" strokeWidth={2} />

          {/* Name + year */}
          <text x={gen.x} y={lineY - 18} textAnchor="middle"
            fontSize="11" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {gen.name}
          </text>
          <text x={gen.x} y={lineY - 6} textAnchor="middle"
            fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
            {gen.year} · {gen.gen}
          </text>

          {/* New types (highlighted) */}
          {gen.newTypes.map((t, ti) => {
            const ty = lineY + 20 + ti * 20;
            return (
              <g key={ti}>
                <rect x={gen.x - 28} y={ty} width={56} height={16} rx={3}
                  fill={TYPE_COLORS[t] || '#666'} opacity={0.15}
                  stroke={TYPE_COLORS[t] || '#666'} strokeWidth={1.5} />
                <text x={gen.x} y={ty + 9} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fontWeight="700" fill={TYPE_COLORS[t] || '#666'}
                  fontFamily={FONTS.mono}>
                  {t}
                </text>
              </g>
            );
          })}

          {/* "NEW" badge for new types */}
          {gen.newTypes.length > 0 && (
            <text x={gen.x + 34} y={lineY + 32} fontSize="6" fontWeight="700"
              fill={COLORS.red} fontFamily={FONTS.sans}>
              NEW
            </text>
          )}
        </g>
      ))}

      {/* Bottom: summary of all types for latest gen */}
      <text x={W / 2} y={H - 50} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        Blackwell (5th gen) 支持全部精度:
      </text>
      {(() => {
        const types = generations[generations.length - 1].allTypes;
        const startX = W / 2 - (types.length * 50) / 2;
        return types.map((t, i) => (
          <g key={i}>
            <rect x={startX + i * 50} y={H - 36} width={46} height={18} rx={3}
              fill={TYPE_COLORS[t] || '#666'} opacity={0.12}
              stroke={TYPE_COLORS[t] || '#666'} strokeWidth={1} />
            <text x={startX + i * 50 + 23} y={H - 25} textAnchor="middle"
              fontSize="8" fontWeight="600" fill={TYPE_COLORS[t] || '#666'}
              fontFamily={FONTS.mono}>{t}</text>
          </g>
        ));
      })()}

      {/* Trend arrow annotation */}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="8" fill="#94a3b8"
        fontFamily={FONTS.sans}>
        趋势: 精度越来越低 → 吞吐量越来越高 (FP16: 990 TFLOPS → FP8: 1979 TFLOPS → FP4: 3958 TFLOPS on H100/B200)
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TensorCorePrecisionTimeline.tsx
git commit -m "feat: add TensorCorePrecisionTimeline static diagram"
```

---

### Task 5: TensorCoreMmaFlow — warp-level MMA data flow

**Files:**
- Create: `src/components/interactive/TensorCoreMmaFlow.tsx`

StepNavigator animation showing how a warp of 32 threads collaborates to issue a Tensor Core MMA operation. Steps: (1) 32 threads each hold a fragment of A, B, C matrices, (2) MMA instruction issued → Tensor Core executes matrix multiply, (3) output fragments distributed back to 32 threads.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/TensorCoreMmaFlow.tsx`:

```tsx
// src/components/interactive/TensorCoreMmaFlow.tsx
// StepNavigator: warp-level MMA operation data flow
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const SVG_H = 280;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Draw a row of thread boxes
function ThreadRow({ x, y, count, highlightRange, label, color }: {
  x: number; y: number; count: number; highlightRange?: [number, number];
  label: string; color: string;
}) {
  const boxW = 14;
  const gap = 1;
  return (
    <g>
      <text x={x} y={y - 6} fontSize="8" fontWeight="600" fill={color}
        fontFamily={FONTS.sans}>{label}</text>
      {Array.from({ length: count }).map((_, i) => {
        const bx = x + i * (boxW + gap);
        const inRange = highlightRange && i >= highlightRange[0] && i <= highlightRange[1];
        return (
          <rect key={i} x={bx} y={y} width={boxW} height={boxW} rx={2}
            fill={inRange ? color : '#f1f5f9'} opacity={inRange ? 0.3 : 1}
            stroke={inRange ? color : '#cbd5e1'} strokeWidth={inRange ? 1.5 : 0.5} />
        );
      })}
    </g>
  );
}

// Fragment visualization: a matrix block with label
function Fragment({ x, y, w, h, label, sublabel, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - 5} textAnchor="middle"
        dominantBaseline="middle" fontSize="10" fontWeight="700"
        fill={color} fontFamily={FONTS.sans}>{label}</text>
      <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
        fontSize="7" fill="#64748b" fontFamily={FONTS.mono}>{sublabel}</text>
    </g>
  );
}

// Arrow with label
function FlowArrow({ x1, y1, x2, y2, label, color }: {
  x1: number; y1: number; x2: number; y2: number; label?: string; color: string;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <defs>
        <marker id={`mma-arrow-${color.replace('#', '')}`}
          viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={1.5}
        markerEnd={`url(#mma-arrow-${color.replace('#', '')})`} />
      {label && (
        <text x={mx} y={my - 4} textAnchor="middle" fontSize="7"
          fill={color} fontFamily={FONTS.sans}>{label}</text>
      )}
    </g>
  );
}

const steps = [
  {
    title: '线程持有 Fragment',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 1: Warp 内 32 个线程各持有矩阵片段（Fragment）
        </text>

        {/* Warp: 32 threads */}
        <ThreadRow x={40} y={44} count={32} label="Warp (32 threads)" color={COLORS.dark}
          highlightRange={[0, 31]} />

        {/* Three fragment groups */}
        <text x={W / 2} y={80} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          wmma::fragment — 矩阵块分布在 32 个线程的寄存器中
        </text>

        <Fragment x={30} y={95} w={140} h={50}
          label="Fragment A" sublabel="16×16 FP16 — 每线程 8 元素"
          color={COLORS.primary} bg="#dbeafe" />
        <Fragment x={210} y={95} w={140} h={50}
          label="Fragment B" sublabel="16×16 FP16 — 每线程 8 元素"
          color={COLORS.green} bg="#dcfce7" />
        <Fragment x={390} y={95} w={140} h={50}
          label="Fragment C (累加器)" sublabel="16×16 FP32 — 每线程 8 元素"
          color={COLORS.orange} bg="#fff7ed" />

        {/* Thread register detail */}
        <rect x={80} y={160} width={400} height={50} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={280} y={176} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Thread 0 的寄存器: A 的 8 个 FP16 元素 + B 的 8 个 FP16 元素 + C 的 8 个 FP32 元素
        </text>
        <text x={280} y={192} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          32 个线程合起来 = 完整的 16×16 矩阵块（每个线程只看到自己的一小部分）
        </text>

        <text x={W / 2} y={240} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.mono}>
          wmma::load_matrix_sync(frag_a, A_ptr, lda);
        </text>
        <text x={W / 2} y={254} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.mono}>
          wmma::load_matrix_sync(frag_b, B_ptr, ldb);
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'MMA 指令执行',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 2: Warp 发射 MMA 指令 → Tensor Core 执行矩阵乘累加
        </text>

        {/* Fragments flow into Tensor Core */}
        <Fragment x={30} y={50} w={100} h={40}
          label="Frag A" sublabel="16×16 FP16"
          color={COLORS.primary} bg="#dbeafe" />
        <Fragment x={430} y={50} w={100} h={40}
          label="Frag B" sublabel="16×16 FP16"
          color={COLORS.green} bg="#dcfce7" />

        <FlowArrow x1={130} y1={70} x2={200} y2={120} color={COLORS.primary} label="A" />
        <FlowArrow x1={430} y1={70} x2={360} y2={120} color={COLORS.green} label="B" />

        {/* Tensor Core box */}
        <rect x={200} y={100} width={160} height={70} rx={8}
          fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={2} />
        <text x={280} y={124} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.purple} fontFamily={FONTS.sans}>
          Tensor Core
        </text>
        <text x={280} y={142} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          D(16×16) = A(16×16) × B(16×16) + C(16×16)
        </text>
        <text x={280} y={156} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.sans}>
          内部: systolic array 执行矩阵乘累加
        </text>

        {/* Accumulator input */}
        <Fragment x={230} y={185} w={100} h={34}
          label="Frag C" sublabel="累加器 FP32"
          color={COLORS.orange} bg="#fff7ed" />
        <FlowArrow x1={280} y1={185} x2={280} y2={172} color={COLORS.orange} label="C (累加)" />

        {/* PTX instruction */}
        <rect x={60} y={235} width={440} height={24} rx={4}
          fill="#1a1a2e" stroke="none" />
        <text x={280} y={250} textAnchor="middle" fontSize="8" fill="#a5f3fc"
          fontFamily={FONTS.mono}>
          mma.sync.aligned.m16n8k16.row.col.f32.f16.f16.f32 d, a, b, c;
        </text>
      </StepSvg>
    ),
  },
  {
    title: '输出分发回线程',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 3: 输出 Fragment D 分发回 32 个线程的寄存器
        </text>

        {/* Tensor Core output */}
        <rect x={180} y={44} width={200} height={46} rx={6}
          fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1.5} />
        <text x={280} y={62} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.purple} fontFamily={FONTS.sans}>
          Tensor Core 输出 D (16×16 FP32)
        </text>
        <text x={280} y={78} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          D = A × B + C
        </text>

        {/* Distribution arrows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <FlowArrow key={i}
            x1={200 + i * 40} y1={92}
            x2={40 + i * 120} y2={112}
            color={COLORS.purple} />
        ))}

        {/* Thread boxes showing output */}
        <ThreadRow x={40} y={118} count={32} label="Warp (32 threads) — 每线程收到 D 的 8 个 FP32 元素"
          color={COLORS.purple} highlightRange={[0, 31]} />

        {/* Output fragment */}
        <Fragment x={130} y={155} w={300} h={44}
          label="Fragment D (输出)" sublabel="16×16 FP32 分布在 32 个线程寄存器中"
          color={COLORS.purple} bg="#f3e8ff" />

        {/* Store instruction */}
        <rect x={60} y={215} width={440} height={24} rx={4}
          fill="#1a1a2e" stroke="none" />
        <text x={280} y={230} textAnchor="middle" fontSize="8" fill="#a5f3fc"
          fontFamily={FONTS.mono}>
          wmma::store_matrix_sync(D_ptr, frag_d, ldd, wmma::mem_row_major);
        </text>

        {/* Summary */}
        <text x={W / 2} y={260} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          整个过程: load fragments → mma_sync → store fragments。Warp 的 32 个线程协作完成一次 16×16 矩阵乘
        </text>
      </StepSvg>
    ),
  },
];

export default function TensorCoreMmaFlow() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TensorCoreMmaFlow.tsx
git commit -m "feat: add TensorCoreMmaFlow warp-level MMA animation"
```

---

### Task 6: XmxArchitectureDiagram — Intel XMX internal structure

**Files:**
- Create: `src/components/interactive/XmxArchitectureDiagram.tsx`

Static SVG showing Intel XMX (Xe Matrix eXtensions) internal structure within a Xe-Core. Shows the systolic array dimensions, input/output data flow, and position within the Xe-Core alongside Vector Engines.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/XmxArchitectureDiagram.tsx`:

```tsx
// src/components/interactive/XmxArchitectureDiagram.tsx
// Static SVG: Intel XMX internal structure within Xe-Core
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface BlockProps {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; color: string; bg: string;
  fontSize?: number;
}

function Block({ x, y, w, h, label, sub, color, bg, fontSize = 10 }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 6 : y + h / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          dominantBaseline="middle" fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
          {sub}
        </text>
      )}
    </g>
  );
}

// Systolic array mini grid
function SystolicGrid({ x, y, rows, cols, label }: {
  x: number; y: number; rows: number; cols: number; label: string;
}) {
  const cellSize = 14;
  const gap = 2;
  const gridW = cols * (cellSize + gap) - gap;
  const gridH = rows * (cellSize + gap) - gap;

  return (
    <g>
      <text x={x + gridW / 2} y={y - 6} textAnchor="middle"
        fontSize="8" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>
        {label}
      </text>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <rect key={`${r}-${c}`}
            x={x + c * (cellSize + gap)} y={y + r * (cellSize + gap)}
            width={cellSize} height={cellSize} rx={2}
            fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={0.5} />
        ))
      )}
      {/* Flow arrows */}
      <text x={x - 10} y={y + gridH / 2} textAnchor="end" dominantBaseline="middle"
        fontSize="7" fill={COLORS.primary} fontFamily={FONTS.sans}>
        A →
      </text>
      <text x={x + gridW / 2} y={y - 16} textAnchor="middle"
        fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
        B ↓
      </text>
    </g>
  );
}

export default function XmxArchitectureDiagram() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Intel XMX architecture within Xe-Core">

      {/* Title */}
      <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Intel Xe-Core 内部结构 — XMX 矩阵引擎
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9"
        fill="#64748b" fontFamily={FONTS.sans}>
        Xe2 架构 (Lunar Lake / Panther Lake) — 每 Xe-Core 含 8 个 XMX 单元
      </text>

      {/* Xe-Core outline */}
      <rect x={15} y={48} width={W - 30} height={H - 90} rx={8}
        fill="#fafbfc" stroke="#37474f" strokeWidth={2} />
      <text x={25} y={66} fontSize="11" fontWeight="700" fill="#37474f"
        fontFamily={FONTS.sans}>
        Xe-Core
      </text>

      {/* Left side: Vector Engines (2) */}
      <Block x={30} y={80} w={120} h={50}
        label="Vector Engine 0" sub="FP32/FP16/INT 8-wide SIMD"
        color={COLORS.primary} bg="#dbeafe" fontSize={9} />
      <Block x={30} y={140} w={120} h={50}
        label="Vector Engine 1" sub="FP32/FP16/INT 8-wide SIMD"
        color={COLORS.primary} bg="#dbeafe" fontSize={9} />

      {/* Right side: XMX engines (8, shown as 2×4 grid of systolic arrays) */}
      <rect x={170} y={74} width={380} height={180} rx={6}
        fill="none" stroke={COLORS.purple} strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={360} y={90} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.purple} fontFamily={FONTS.sans}>
        XMX 矩阵引擎 (×8)
      </text>

      {/* 2×4 grid of mini systolic arrays */}
      {Array.from({ length: 2 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <SystolicGrid key={`${row}-${col}`}
            x={195 + col * 90} y={110 + row * 70}
            rows={4} cols={8}
            label={`XMX ${row * 4 + col}`} />
        ))
      )}

      {/* Shared resources */}
      <Block x={30} y={205} w={120} h={40}
        label="Thread Control" sub="SIMD 调度"
        color={COLORS.orange} bg="#fff7ed" fontSize={9} />

      {/* SLM / L1 at bottom */}
      <rect x={30} y={268} width={250} height={30} rx={5}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
      <text x={155} y={286} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        SLM (Shared Local Memory) — 64 KB
      </text>

      <rect x={295} y={268} width={250} height={30} rx={5}
        fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={420} y={286} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>
        L1 Cache / Instruction Cache
      </text>

      {/* XMX specs summary */}
      <rect x={30} y={H - 34} width={W - 60} height={28} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={H - 16} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        每 XMX 单元: 8×8 systolic array, 支持 FP16/BF16/TF32/INT8/INT4 |
        D(M×N) = A(M×K) × B(K×N) + C(M×N), M/N/K 取决于精度 |
        编程: SYCL joint_matrix / ESIMD
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/XmxArchitectureDiagram.tsx
git commit -m "feat: add XmxArchitectureDiagram Intel Xe-Core structure"
```

---

### Task 7: TensorCoreXmxCompare — Tensor Core vs XMX comparison table

**Files:**
- Create: `src/components/interactive/TensorCoreXmxCompare.tsx`

Interactive comparison table with hover highlighting, comparing NVIDIA Tensor Core and Intel XMX across multiple dimensions: architecture, matrix block size, precision, throughput, programming interface.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/TensorCoreXmxCompare.tsx`:

```tsx
// src/components/interactive/TensorCoreXmxCompare.tsx
// Interactive comparison table: NVIDIA Tensor Core vs Intel XMX
import { useState } from 'react';
import { COLORS } from './shared/colors';

interface CompareRow {
  label: string;
  tensorCore: string;
  xmx: string;
  same?: boolean; // true if both are similar
}

const rows: CompareRow[] = [
  {
    label: '厂商 / 架构',
    tensorCore: 'NVIDIA (Hopper, 4th gen)',
    xmx: 'Intel (Xe2, Lunar Lake)',
  },
  {
    label: '内部结构',
    tensorCore: 'Systolic Array 变体',
    xmx: 'Systolic Array (8×8)',
    same: true,
  },
  {
    label: '核心操作',
    tensorCore: 'D = A × B + C (MMA)',
    xmx: 'D = A × B + C (DPAS)',
    same: true,
  },
  {
    label: '矩阵块尺寸 (FP16)',
    tensorCore: 'm16n8k16',
    xmx: 'm8n8k16',
  },
  {
    label: '每 SM/Xe-Core 数量',
    tensorCore: '4 Tensor Core / SM',
    xmx: '8 XMX / Xe-Core',
  },
  {
    label: 'FP16 / BF16',
    tensorCore: '990 TFLOPS (H100 SXM)',
    xmx: '~48 TOPS (Lunar Lake iGPU)',
  },
  {
    label: 'FP8 支持',
    tensorCore: 'Hopper 起 (4th gen)',
    xmx: 'Xe2 起 (Lunar Lake)',
  },
  {
    label: 'FP4 支持',
    tensorCore: 'Blackwell 起 (5th gen)',
    xmx: '尚未支持',
  },
  {
    label: 'TF32 支持',
    tensorCore: 'Ampere 起 (3rd gen)',
    xmx: 'Xe2 起',
  },
  {
    label: '编程接口 (高层)',
    tensorCore: 'CUDA wmma / mma.sync',
    xmx: 'SYCL joint_matrix',
  },
  {
    label: '编程接口 (低层)',
    tensorCore: 'PTX mma 指令',
    xmx: 'ESIMD dpas 指令',
  },
  {
    label: 'Warp/Sub-group 协作',
    tensorCore: '32 线程 warp 协作',
    xmx: '8/16-wide sub-group',
  },
  {
    label: '目标场景',
    tensorCore: '数据中心 AI 训练/推理',
    xmx: '客户端 AI 推理 (iGPU)',
  },
];

export default function TensorCoreXmxCompare() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 px-3 text-gray-600 font-medium w-1/4">
              对比维度
            </th>
            <th className="text-center py-2 px-3 font-semibold" style={{ color: COLORS.purple }}>
              NVIDIA Tensor Core
              <div className="text-xs font-normal text-gray-400">H100 Hopper</div>
            </th>
            <th className="text-center py-2 px-3 font-semibold" style={{ color: COLORS.primary }}>
              Intel XMX
              <div className="text-xs font-normal text-gray-400">Xe2 Lunar Lake</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}
              onMouseEnter={() => setHoveredRow(ri)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`border-b border-gray-100 transition-colors ${
                hoveredRow === ri ? 'bg-blue-50' : ''
              }`}>
              <td className="py-1.5 px-3 text-gray-700 font-medium">{row.label}</td>
              <td className="py-1.5 px-3 text-center font-mono text-xs text-gray-600">
                {row.tensorCore}
              </td>
              <td className="py-1.5 px-3 text-center font-mono text-xs text-gray-600">
                {row.xmx}
                {row.same && <span className="text-green-500 ml-1">(相似)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">
        两者核心思路相同: systolic array 做 D=A×B+C。主要区别在规模 (数据中心 vs 客户端)、矩阵块尺寸和编程接口。Hover 高亮行。
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TensorCoreXmxCompare.tsx
git commit -m "feat: add TensorCoreXmxCompare comparison table"
```

---

### Task 8: DualPipeOverlap — serial vs dual-pipe overlapped execution

**Files:**
- Create: `src/components/interactive/DualPipeOverlap.tsx`

StepNavigator animation showing dual-pipe optimization: Tensor Core (GEMM) and CUDA Core (element-wise) can execute simultaneously on different data. Step 1: serial execution baseline. Step 2: dual-pipe overlapped. Step 3: DeepSeek V3 practical example.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/DualPipeOverlap.tsx`:

```tsx
// src/components/interactive/DualPipeOverlap.tsx
// StepNavigator: serial vs dual-pipe overlapped Tensor Core + CUDA Core execution
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const SVG_H = 260;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Timeline bar
function Bar({ x, y, w, h, label, sublabel, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={sublabel ? y + h / 2 - 4 : y + h / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

// Track label
function TrackLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text x={x} y={y} textAnchor="end" dominantBaseline="middle"
      fontSize="8" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
      {label}
    </text>
  );
}

// Time axis
function TimeAxis({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + w} y2={y} stroke="#cbd5e1" strokeWidth={1} />
      <text x={x + w + 8} y={y} dominantBaseline="middle"
        fontSize="7" fill="#94a3b8" fontFamily={FONTS.sans}>
        {label}
      </text>
      {/* tick marks */}
      {Array.from({ length: Math.floor(w / 40) + 1 }).map((_, i) => (
        <line key={i} x1={x + i * 40} y1={y - 3} x2={x + i * 40} y2={y + 3}
          stroke="#cbd5e1" strokeWidth={1} />
      ))}
    </g>
  );
}

const GEMM_COLOR = COLORS.purple;
const GEMM_BG = '#f3e8ff';
const ELEM_COLOR = COLORS.green;
const ELEM_BG = '#dcfce7';
const IDLE_BG = '#f1f5f9';

const steps = [
  {
    title: '串行执行 (baseline)',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          传统串行: GEMM (Tensor Core) → Element-wise (CUDA Core) → GEMM → ...
        </text>

        <TrackLabel x={88} y={60} label="Tensor Core" />
        <TrackLabel x={88} y={100} label="CUDA Core" />
        <TimeAxis x={94} y={130} w={440} label="time" />

        {/* Layer 1 */}
        <Bar x={100} y={44} w={120} h={30}
          label="GEMM Layer 1" sublabel="Tensor Core" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={100} y={84} w={120} h={30}
          label="(空闲)" color="#94a3b8" bg={IDLE_BG} />

        {/* Elem-wise 1 */}
        <Bar x={224} y={44} w={60} h={30}
          label="(空闲)" color="#94a3b8" bg={IDLE_BG} />
        <Bar x={224} y={84} w={60} h={30}
          label="Act/Norm" sublabel="CUDA Core" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Layer 2 */}
        <Bar x={288} y={44} w={120} h={30}
          label="GEMM Layer 2" sublabel="Tensor Core" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={288} y={84} w={120} h={30}
          label="(空闲)" color="#94a3b8" bg={IDLE_BG} />

        {/* Elem-wise 2 */}
        <Bar x={412} y={44} w={60} h={30}
          label="(空闲)" color="#94a3b8" bg={IDLE_BG} />
        <Bar x={412} y={84} w={60} h={30}
          label="Act/Norm" sublabel="CUDA Core" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Total time */}
        <line x1={100} y1={145} x2={472} y2={145}
          stroke={COLORS.red} strokeWidth={1.5} />
        <text x={286} y={158} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          总时间 = GEMM + Act/Norm + GEMM + Act/Norm（串行叠加）
        </text>

        {/* Problem annotation */}
        <rect x={80} y={170} width={400} height={36} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={280} y={186} textAnchor="middle" fontSize="9" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          问题: Tensor Core 和 CUDA Core 交替空闲，SM 利用率低
        </text>
        <text x={280} y={200} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          GEMM 期间 CUDA Core 空闲 | Act/Norm 期间 Tensor Core 空闲
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Dual-Pipe 重叠执行',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Dual-Pipe: 当前层 GEMM 与上一层 Act/Norm 重叠执行
        </text>

        <TrackLabel x={88} y={60} label="Tensor Core" />
        <TrackLabel x={88} y={100} label="CUDA Core" />
        <TimeAxis x={94} y={130} w={380} label="time" />

        {/* Layer 1 GEMM */}
        <Bar x={100} y={44} w={120} h={30}
          label="GEMM Layer 1" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={100} y={84} w={120} h={30}
          label="(无前序 Act)" color="#94a3b8" bg={IDLE_BG} />

        {/* Layer 2 GEMM + Layer 1 Act overlapped */}
        <Bar x={224} y={44} w={120} h={30}
          label="GEMM Layer 2" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={224} y={84} w={60} h={30}
          label="Act/Norm L1" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Layer 3 GEMM + Layer 2 Act overlapped */}
        <Bar x={348} y={44} w={120} h={30}
          label="GEMM Layer 3" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={348} y={84} w={60} h={30}
          label="Act/Norm L2" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Overlap highlight */}
        <rect x={224} y={40} width={120} height={80} rx={4}
          fill="none" stroke={COLORS.orange} strokeWidth={2} strokeDasharray="4 2" />
        <text x={284} y={135} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          重叠执行
        </text>

        {/* Shorter total time */}
        <line x1={100} y1={150} x2={468} y2={150}
          stroke={COLORS.green} strokeWidth={1.5} />
        <text x={284} y={164} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          总时间缩短: Act/Norm 被"藏"在 GEMM 执行期间
        </text>

        {/* Condition */}
        <rect x={60} y={178} width={440} height={44} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={280} y={194} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          前提条件: 两组操作之间没有数据依赖（Layer N 的 Act/Norm 用 Layer N 的 GEMM 输出）
        </text>
        <text x={280} y={210} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          Layer N+1 的 GEMM 用 Layer N 的 Act/Norm 输出 → 无依赖冲突，可以重叠
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'DeepSeek V3 实践',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          实战: DeepSeek V3/R1 FP8 训练中的 Dual-Pipe 优化
        </text>

        {/* DeepSeek architecture */}
        <rect x={30} y={40} width={500} height={90} rx={6}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={280} y={58} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          DeepSeek V3 MoE (Mixture of Experts) 层
        </text>

        {/* GEMM: FP8 on Tensor Core */}
        <Bar x={50} y={68} w={140} h={32}
          label="Expert GEMM (FP8)" sublabel="Tensor Core — 主要计算"
          color={GEMM_COLOR} bg={GEMM_BG} />

        {/* Overlap arrow */}
        <text x={210} y={88} fontSize="14" fill={COLORS.orange}>+</text>

        {/* Element-wise on CUDA Core */}
        <Bar x={230} y={68} w={140} h={32}
          label="Gate / TopK / Norm" sublabel="CUDA Core — element-wise"
          color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Arrow to overlap */}
        <text x={390} y={88} fontSize="14" fill={COLORS.orange}>→</text>
        <Bar x={410} y={68} w={100} h={32}
          label="重叠执行" color={COLORS.orange} bg="#fff7ed" />

        {/* Key insight */}
        <rect x={30} y={142} width={500} height={50} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={280} y={160} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          关键创新: FP8 量化 + Dual-Pipe 调度
        </text>
        <text x={280} y={178} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          FP8 GEMM 在 Tensor Core 上执行 → 同时 CUDA Core 做 FP32 的 gate 计算和 normalization → SM 利用率提升
        </text>

        {/* Additional notes */}
        <text x={W / 2} y={210} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Dual-pipe 不仅限于 DeepSeek — 任何"GEMM + element-wise"交替的网络都能受益
        </text>
        <text x={W / 2} y={228} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          例: Transformer 中的 QKV projection (GEMM) + LayerNorm (element-wise) + FFN (GEMM) + GELU (element-wise)
        </text>

        <text x={W / 2} y={252} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.sans}>
          参考: DeepSeek-V3 Technical Report, Section 3.3
        </text>
      </StepSvg>
    ),
  },
];

export default function DualPipeOverlap() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/DualPipeOverlap.tsx
git commit -m "feat: add DualPipeOverlap dual-pipe execution animation"
```

---

### Task 9: MDX Article — matrix-acceleration.mdx

**Files:**
- Create: `src/content/articles/zh/matrix-acceleration.mdx`

Full article with 6 sections, importing all 8 components. Interactive components use `client:visible`; static components (SystolicDataflowCompare, TensorCorePrecisionTimeline, XmxArchitectureDiagram) do not.

- [ ] **Step 1: Create the article**

Create `src/content/articles/zh/matrix-acceleration.mdx`:

```mdx
---
title: "矩阵加速单元 — Tensor Core 与 XMX"
slug: matrix-acceleration
locale: zh
tags: [gpu, tensor-core, xmx, systolic-array, nvidia, intel]
prerequisites: [gpu-architecture]
difficulty: intermediate
created: "2026-04-03"
updated: "2026-04-03"
references:
  - type: website
    title: "NVIDIA H100 Tensor Core GPU Architecture Whitepaper"
    url: "https://resources.nvidia.com/en-us-tensor-core"
  - type: paper
    title: "Why Systolic Architectures? — H.T. Kung"
    url: "https://www.cs.virginia.edu/~smk9u/CS4330S19/kung_1982.pdf"
  - type: website
    title: "NVIDIA PTX ISA — Matrix Multiply-Accumulate"
    url: "https://docs.nvidia.com/cuda/parallel-thread-execution/"
  - type: website
    title: "Intel Xe2 Architecture — Xe-Core and XMX"
    url: "https://www.intel.com/content/www/us/en/docs/oneapi/optimization-guide-gpu/"
  - type: paper
    title: "DeepSeek-V3 Technical Report"
    url: "https://arxiv.org/abs/2412.19437"
---

import TensorCoreVsCudaCore from '../../../components/interactive/TensorCoreVsCudaCore.tsx';
import SystolicArrayAnimation from '../../../components/interactive/SystolicArrayAnimation.tsx';
import SystolicDataflowCompare from '../../../components/interactive/SystolicDataflowCompare.tsx';
import TensorCorePrecisionTimeline from '../../../components/interactive/TensorCorePrecisionTimeline.tsx';
import TensorCoreMmaFlow from '../../../components/interactive/TensorCoreMmaFlow.tsx';
import XmxArchitectureDiagram from '../../../components/interactive/XmxArchitectureDiagram.tsx';
import TensorCoreXmxCompare from '../../../components/interactive/TensorCoreXmxCompare.tsx';
import DualPipeOverlap from '../../../components/interactive/DualPipeOverlap.tsx';

在 [GPU Architecture](/zh/articles/gpu-architecture) 文章中，我们了解了 SM 内部的 Processing Block 结构 — 每个 Block 有 Warp Scheduler、FP32 CUDA Core、INT32 Core 和一个 **Tensor Core**。

那篇文章中 Tensor Core 只是一个名字。本文要回答：**它内部到底是什么，为什么能让矩阵乘法快一个数量级**。同时，我们会深入 Intel 的对应技术 — XMX (Xe Matrix eXtensions)，理解两大阵营如何用不同的硬件实现相同的目标。

## Section 1: 为什么需要专用矩阵单元

传统 CUDA Core 做矩阵乘法是**逐元素标量乘加**。以一个 4×4 矩阵乘为例：

- C(4×4) = A(4×4) × B(4×4)
- 每个输出元素需要 4 次乘法 + 3 次加法 = 7 次标量操作
- 16 个输出元素 × 7 = **112 次标量操作**

而 Tensor Core 一条 MMA (Matrix Multiply-Accumulate) 指令就完成整块矩阵乘累加 D = A·B + C。

<TensorCoreVsCudaCore client:visible />

吞吐量差距是数量级的：H100 SXM 上 FP32 CUDA Core 约 67 TFLOPS，FP16 Tensor Core 约 990 TFLOPS — **约 15 倍差距**。

AI 训练和推理中 90%+ 的计算量是矩阵乘法（QKV 投影、Attention score、FFN 全是 GEMM）。这就是为什么专用矩阵加速单元如此重要 — 它直接决定了 AI 工作负载的性能天花板。

那么 Tensor Core 和 XMX 内部是怎么做到一拍完成矩阵乘的？答案是 **Systolic Array（脉动阵列）**。

---

## Section 2: Systolic Array — 数据在阵列中脉动流动

### 基本概念

Systolic Array 是一种由大量简单 PE (Processing Element) 组成的计算网格。核心思想：

- **数据从边缘流入**，沿固定方向在 PE 之间传递
- 每个 PE 执行一次 **Multiply-Accumulate (MAC)**，然后将数据传给邻居
- 数据被**多个 PE 复用** — 一个输入元素经过多个 PE，参与多次计算
- 不需要每次都从内存读取 — **极高的数据复用率**是效率的关键

这个名字来自 "systole"（心脏收缩），形容数据像血液一样有节奏地在阵列中脉动流动。

### 4×4 脉动阵列动画

下面的动画展示一个 4×4 output-stationary systolic array 的工作过程。A 矩阵的行从左侧流入，B 矩阵的列从顶部流入，每个 PE 累加自己负责的输出元素。

<SystolicArrayAnimation client:visible />

关键观察：
- **波前对角线** — 活跃 PE 像波浪一样从左上角扫到右下角
- **PE(i,j) 在 cycle i+j+k 时处理第 k 对输入** — 输入的错开保证数据同时到达
- **4×4 矩阵乘需要 10 个 cycle**（而非 1 个），但硬件可以**流水线化**多组矩阵

### Dataflow 变体

Systolic array 有多种数据流模式，区别在于**哪个矩阵"固定"在 PE 内，哪个"流动"**：

<SystolicDataflowCompare />

- **Output-Stationary**: 输出矩阵 C 固定在 PE 中累加，A 和 B 都流过。优点是部分和不需要移动
- **Weight-Stationary**: 权重矩阵 B 预加载到 PE，输入 A 流过，部分和向下传递。适合推理（权重固定）

Tensor Core 和 XMX 的具体实现是厂商机密，但本质都是 systolic array 的变体。

---

## Section 3: NVIDIA Tensor Core

### MMA 操作

Tensor Core 的核心操作是矩阵乘累加：**D = A × B + C**

- 原始概念尺寸是 4×4，但从 Volta 到 Blackwell，实际支持的块尺寸越来越大
- Hopper (4th gen) 常用尺寸：`m16n8k16` — 即 A(16×16) × B(16×8) → D(16×8)
- 每个 SM 有 **4 个 Tensor Core**（每个 Processing Block 一个）

### 精度支持演进

从 Volta (2017) 到 Blackwell (2024)，Tensor Core 支持的精度不断扩展：

<TensorCorePrecisionTimeline />

趋势非常清晰：精度越来越低，吞吐量越来越高。FP8 的吞吐量是 FP16 的 2 倍，FP4 又翻倍。这也是为什么 FP8 训练（如 DeepSeek V3）和 FP4 量化推理成为趋势。

### Warp 级操作

Tensor Core 操作不是单个线程发起的 — 它是 **warp 级协作操作**。一个 warp 的 32 个线程共同持有输入矩阵的片段（fragment），一起发射 MMA 指令。

<TensorCoreMmaFlow client:visible />

关键要点：
- **Fragment** 是矩阵块在 32 个线程寄存器中的分布式表示 — 每个线程只持有一部分
- `wmma::load_matrix_sync` 从内存加载到 fragment，`wmma::mma_sync` 执行矩阵乘，`wmma::store_matrix_sync` 写回内存
- PTX 层面的指令：`mma.sync.aligned.m16n8k16.row.col.f32.f16.f16.f32`

---

## Section 4: Intel XMX

Intel 的矩阵加速单元叫 **XMX (Xe Matrix eXtensions)**，是 Xe2 架构的核心组件。

<XmxArchitectureDiagram />

### 关键规格 (Xe2 / Lunar Lake)

- 每个 **Xe-Core** 包含 8 个 XMX 单元 + 2 个 Vector Engine
- XMX 内部是 **8×8 systolic array**
- 支持精度：FP16、BF16、TF32、INT8、INT4
- 编程接口：SYCL `joint_matrix` (高层) / ESIMD `dpas` (低层)

### 与 NVIDIA 的架构类比

| NVIDIA | Intel | 说明 |
|--------|-------|------|
| SM | Xe-Core | 基本计算单元 |
| CUDA Core | Vector Engine | 标量/向量计算 |
| Tensor Core | XMX | 矩阵加速 |
| Warp (32 threads) | Sub-group (8/16 wide) | SIMD 执行单位 |
| Shared Memory | SLM (Shared Local Memory) | SM/Xe-Core 内共享存储 |
| wmma / mma.sync | joint_matrix / dpas | 矩阵操作 API |

核心思路完全一致 — 都是用 systolic array 做 D = A × B + C。主要区别在**规模**（数据中心 GPU vs 客户端 iGPU）和**编程模型**（CUDA 的 warp-level vs SYCL 的 sub-group）。

---

## Section 5: Tensor Core vs XMX 详细对比

<TensorCoreXmxCompare client:visible />

两者的**相似点**比区别更重要：
- 都是 systolic array 变体，都做 D = A·B + C
- 都只能做特定尺寸、特定精度的矩阵乘 — 其他操作仍走传统 CUDA Core / Vector Engine
- 都需要软件配合（tiling、数据对齐）才能发挥峰值性能 — 这是 GEMM 优化文章的主题

**关键区别**主要在规模和目标场景：
- H100 Tensor Core 峰值 ~990 TFLOPS (FP16)，面向数据中心 AI 训练
- Lunar Lake XMX 峰值 ~48 TOPS (INT8)，面向客户端 AI 推理
- NVIDIA 的 32-wide warp vs Intel 的 8/16-wide sub-group 影响编程方式

---

## Section 6: Dual-Pipe — 同时利用两种计算单元

Tensor Core 和 CUDA Core 是 SM 内不同的功能单元，有独立的执行通道。传统做法是串行执行：矩阵乘（Tensor Core）完成后才开始 element-wise 操作（CUDA Core）。

**Dual-Pipe 优化**打破了这个限制：让 Tensor Core 做**当前层**的 GEMM 的同时，CUDA Core 做**上一层**的 activation/normalization。

<DualPipeOverlap client:visible />

Dual-pipe 的条件：
- 两组操作之间**没有数据依赖**（当前 GEMM 不依赖当前 Act/Norm 的结果）
- 需要精心安排执行顺序和数据布局
- 可以显著提升 SM 利用率，特别是在 MoE 等 element-wise 操作较多的架构中

---

## 总结

矩阵加速单元的核心设计思想：

1. **专用硬件做矩阵乘** — Systolic array 用极高的数据复用率实现单条指令完成整块矩阵乘累加
2. **精度换吞吐** — 从 FP16 到 FP8 到 FP4，每降一级精度吞吐量翻倍，AI 工作负载可以接受较低精度
3. **协作执行** — 矩阵操作是 warp/sub-group 级别的协作，需要软件配合（fragment 管理、tiling 策略）

下一篇文章将从编程者的视角出发 — CUDA 编程模型，理解 thread/block/grid 的层级、shared memory 的使用、memory coalescing 等关键概念。这些知识是写高性能 GPU 代码（包括利用 Tensor Core）的前提。
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with 47 pages. `npm run validate` passes.

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/matrix-acceleration.mdx
git commit -m "feat: add Matrix Acceleration article with 8 interactive components"
```

---

### Task 10: Update learning path YAML

**Files:**
- Modify: `src/content/paths/ai-compute-stack.yaml`

Add `matrix-acceleration` after `gpu-architecture` in the articles list.

- [ ] **Step 1: Update the YAML**

Edit `src/content/paths/ai-compute-stack.yaml`, add `matrix-acceleration` after `gpu-architecture`:

```yaml
id: ai-compute-stack
title:
  zh: "AI Compute Stack"
  en: "AI Compute Stack"
description:
  zh: "从推理框架到硬件指令集，理解 AI 软件栈的各层关系"
  en: "Understanding the AI software stack from inference frameworks to hardware ISA"
level: intermediate
articles:
  - ai-compute-stack
  - gpu-architecture
  - matrix-acceleration
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. `npm run validate` passes.

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/ai-compute-stack.yaml
git commit -m "feat: add matrix-acceleration to AI Compute Stack learning path"
```
