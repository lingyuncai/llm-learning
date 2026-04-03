# GPU Architecture Article — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the "GPU Architecture — 从晶体管到线程" article with 8 interactive/static components, covering GPU vs CPU design, NVIDIA chip topology, SM internals, warp execution, and memory hierarchy.

**Architecture:** Astro MDX article with React island components. Each component is a self-contained `.tsx` file in `src/components/interactive/`, imported in the MDX with `client:visible`. Static diagrams use pure SVG; animated components use `motion/react` and `useState`. Shared colors/fonts from `src/components/interactive/shared/colors.ts`.

**Tech Stack:** Astro 5, React, TypeScript, motion/react, SVG, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-03-gpu-deep-dive-design.md` — Article 1

---

## Key Decisions & Context

### Project-Level Decisions
- **Phase 1 = 4 篇文章**：GPU Architecture → 矩阵加速单元 (Tensor Core/XMX) → CUDA 编程模型 → GEMM 优化。Phase 2（非 CUDA 路线 + 矩阵加速指令进阶）后续再做
- **4 个独立 plan**，每篇文章一个 plan。后续 3 篇 plan 在前一篇完成后写（复用模式）
- **归入 ai-compute-stack 学习路径**，排在全景文章之后。未来如果有复杂 GPU 编程路径，同一文章可放到多条路径
- **混合型风格**：交互动画建立直觉 + 关键处给真实代码片段。图要多（静态 + 动态），不怕数量多
- **NVIDIA 为主线，Intel iGPU (Xe2, Lunar Lake/Panther Lake) 详讲**，AMD 简要提及
- **XMX 很重要** — 在文章 2（硬件原理）、文章 3（编程接口）、文章 4（GEMM 优化）三个层面递进覆盖
- **DeepSeek V3/R1 的 dual-pipe 优化**作为 Tensor Core + CUDA Core 同时利用的实战案例（文章 2）

### This Article's Decisions
- **叙事主线**：一条指令从发射到执行完毕经过哪些硬件单元
- **以 H100 Hopper 为主要参考芯片**，数字来自 NVIDIA whitepaper。对比提及 RTX 4090
- **Intel Xe2 对照放在文章 2**（矩阵加速单元那篇），本文不涉及 Intel 架构细节
- **已有 GPUMemoryHierarchy 组件**在 flash-attention 文章中，本文新建 MemoryHierarchyDetailed 展示完整 4 级层次（那个侧重 SRAM vs HBM 二分）
- **StepNavigator primitive** 已存在于 `src/components/primitives/StepNavigator.tsx`，WarpExecutionAnimation 和 WarpSchedulerTimeline 直接复用
- **SVG 组件模式**：viewBox 坐标系 + COLORS/FONTS 共享常量 + helper 子组件。参考 ShaderKernelPathway.tsx、GpuContextDiagram.tsx 的风格
- **不用 emoji** — CLAUDE.md 规定，除非用户明确要求

### Codebase Patterns to Follow
- 组件文件命名：PascalCase，放在 `src/components/interactive/`
- MDX 中 import 路径：`'../../../components/interactive/XXX.tsx'`
- 必须加 `client:visible` 才能启用 React 交互逻辑
- 共享常量：`import { COLORS, FONTS } from './shared/colors'`
- 动画库：`import { motion } from 'motion/react'`（不是 framer-motion）
- 步骤动画用 StepNavigator：`import StepNavigator from '../primitives/StepNavigator'`
- Frontmatter 必填：title, slug, locale, tags, difficulty, created, updated, references
- Build 命令：`npm run build`，验证命令：`npm run validate`
- 当前 build 产出 43 pages，新增 1 页后应为 44 pages

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/content/articles/zh/gpu-architecture.mdx` | Article content — 5 sections covering GPU architecture fundamentals |
| `src/components/interactive/CpuGpuTransistorCompare.tsx` | Static SVG: CPU vs GPU transistor budget comparison |
| `src/components/interactive/LatencyHidingCompare.tsx` | Animated timeline: CPU stall vs GPU warp switching |
| `src/components/interactive/GpuChipTopology.tsx` | Interactive SVG: GPC → TPC → SM chip hierarchy with expand |
| `src/components/interactive/SmInternalDiagram.tsx` | Static SVG: SM internal structure with sub-partitions |
| `src/components/interactive/SmResourceTable.tsx` | Interactive table: SM resources across GPU generations |
| `src/components/interactive/WarpExecutionAnimation.tsx` | Step animation: warp execution + divergence demo |
| `src/components/interactive/WarpSchedulerTimeline.tsx` | Step animation: warp scheduler switching between warps |
| `src/components/interactive/MemoryHierarchyDetailed.tsx` | Static SVG: 4-level memory hierarchy with specs |

### Modified Files

| File | Change |
|------|--------|
| `src/content/paths/ai-compute-stack.yaml` | Add `gpu-architecture` to articles list |

---

### Task 1: CpuGpuTransistorCompare — CPU vs GPU transistor budget

**Files:**
- Create: `src/components/interactive/CpuGpuTransistorCompare.tsx`

Static SVG diagram showing CPU vs GPU die area allocation. CPU has large cache + control logic + small ALU area; GPU has massive ALU array + small cache/control.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/CpuGpuTransistorCompare.tsx`:

```tsx
// src/components/interactive/CpuGpuTransistorCompare.tsx
// Static SVG: CPU vs GPU transistor budget / die area comparison
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const H = 280;

interface BlockProps {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; color: string; bg: string;
  fontSize?: number;
}

function Block({ x, y, w, h, label, sub, color, bg, fontSize = 10 }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 6 : y + h / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 8}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          {sub}
        </text>
      )}
    </g>
  );
}

export default function CpuGpuTransistorCompare() {
  // CPU side — left half
  const cpuX = 20;
  const cpuW = 240;
  // GPU side — right half
  const gpuX = 300;
  const gpuW = 240;
  const dieY = 50;
  const dieH = 190;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CPU vs GPU transistor budget comparison">

      {/* Headers */}
      <text x={cpuX + cpuW / 2} y={20} textAnchor="middle"
        fontSize="13" fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.sans}>
        CPU — 延迟优化
      </text>
      <text x={gpuX + gpuW / 2} y={20} textAnchor="middle"
        fontSize="13" fontWeight="700" fill={COLORS.green} fontFamily={FONTS.sans}>
        GPU — 吞吐优化
      </text>

      {/* CPU die outline */}
      <rect x={cpuX} y={dieY} width={cpuW} height={dieH} rx={6}
        fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" />

      {/* CPU blocks — large cache, medium control, small ALU */}
      <Block x={cpuX + 8} y={dieY + 8} w={cpuW - 16} h={70}
        label="Cache (L1/L2/L3)" sub="~50% 晶体管预算"
        color={COLORS.orange} bg="#fff7ed" />
      <Block x={cpuX + 8} y={dieY + 86} w={110} h={50}
        label="控制逻辑" sub="分支预测 / 乱序执行"
        color={COLORS.purple} bg="#f3e8ff" fontSize={9} />
      <Block x={cpuX + 126} y={dieY + 86} w={106} h={50}
        label="ALU" sub="4-8 个强核心"
        color={COLORS.primary} bg="#dbeafe" />
      <Block x={cpuX + 8} y={dieY + 144} w={cpuW - 16} h={38}
        label="内存控制器 + IO" color="#64748b" bg="#f1f5f9" fontSize={9} />

      {/* GPU die outline */}
      <rect x={gpuX} y={dieY} width={gpuW} height={dieH} rx={6}
        fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" />

      {/* GPU blocks — massive ALU grid, tiny cache/control */}
      {/* ALU grid — 4x4 blocks filling most of the die */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => {
          const bx = gpuX + 8 + col * 58;
          const by = dieY + 8 + row * 34;
          return (
            <rect key={`${row}-${col}`} x={bx} y={by} width={54} height={30} rx={3}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          );
        })
      )}
      <text x={gpuX + cpuW / 2} y={dieY + 75} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
        数千个小 ALU（SM / CU）
      </text>
      <text x={gpuX + cpuW / 2} y={dieY + 90} textAnchor="middle"
        fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
        ~80% 晶体管预算
      </text>

      {/* GPU small cache + control */}
      <Block x={gpuX + 8} y={dieY + 146} w={80} h={36}
        label="L2 Cache" sub="较小" color={COLORS.orange} bg="#fff7ed" fontSize={9} />
      <Block x={gpuX + 96} y={dieY + 146} w={60} h={36}
        label="控制" color={COLORS.purple} bg="#f3e8ff" fontSize={9} />
      <Block x={gpuX + 164} y={dieY + 146} w={68} h={36}
        label="Mem Ctrl" color="#64748b" bg="#f1f5f9" fontSize={9} />

      {/* Bottom annotation */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        CPU：几个强核心，延迟低 · GPU：数千个弱核心，总吞吐量高
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds (component is created but not yet imported in any MDX).

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/CpuGpuTransistorCompare.tsx
git commit -m "feat: add CpuGpuTransistorCompare static diagram"
```

---

### Task 2: LatencyHidingCompare — CPU stall vs GPU warp switching

**Files:**
- Create: `src/components/interactive/LatencyHidingCompare.tsx`

Animated timeline showing CPU stalling on cache miss vs GPU switching warps to fill idle cycles. Uses StepNavigator for two views (CPU / GPU).

- [ ] **Step 1: Create the component**

Create `src/components/interactive/LatencyHidingCompare.tsx`:

```tsx
// src/components/interactive/LatencyHidingCompare.tsx
// Animated comparison: CPU stall on cache miss vs GPU warp switching
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const H = 200;
const SLOT_W = 32;
const SLOT_H = 28;
const Y_TRACK = 80;

// Timeline slot colors
const COMPUTE = '#dbeafe';   // blue — active compute
const STALL = '#fee2e2';     // red — stalled / idle
const SWITCH = '#dcfce7';    // green — active (different warp)

interface Slot { label: string; color: string; textColor: string; }

const cpuSlots: Slot[] = [
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
  { label: 'Miss', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Data', color: '#fef3c7', textColor: COLORS.orange },
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
  { label: 'Miss', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Data', color: '#fef3c7', textColor: COLORS.orange },
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
];

// GPU: 3 warps interleaved, no stalls visible at timeline level
const warpColors = ['#dbeafe', '#dcfce7', '#ede9fe'];
const warpTextColors = [COLORS.primary, COLORS.green, COLORS.purple];
const warpLabels = ['W0', 'W1', 'W2'];

const gpuSlots: Slot[] = Array.from({ length: 15 }, (_, i) => {
  const w = i % 3;
  return { label: warpLabels[w], color: warpColors[w], textColor: warpTextColors[w] };
});

function Timeline({ slots, y, title, annotation }: {
  slots: Slot[]; y: number; title: string; annotation: string;
}) {
  return (
    <g>
      <text x={10} y={y - 8} fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
      {slots.map((s, i) => (
        <g key={i}>
          <rect x={10 + i * (SLOT_W + 2)} y={y} width={SLOT_W} height={SLOT_H}
            rx={3} fill={s.color} stroke={s.textColor} strokeWidth={1} />
          <text x={10 + i * (SLOT_W + 2) + SLOT_W / 2} y={y + SLOT_H / 2 + 1}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fontWeight="500" fill={s.textColor} fontFamily={FONTS.mono}>
            {s.label}
          </text>
        </g>
      ))}
      <text x={10} y={y + SLOT_H + 14} fontSize="8.5" fill="#64748b"
        fontFamily={FONTS.sans}>{annotation}</text>
    </g>
  );
}

export default function LatencyHidingCompare() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CPU stall vs GPU warp-switching latency hiding">

      <Timeline slots={cpuSlots} y={20} title="CPU 单线程"
        annotation="Cache miss → 线程阻塞等待数据（红色 = 浪费的周期）" />

      <Timeline slots={gpuSlots} y={105} title="GPU 多 Warp"
        annotation="Warp 0 等数据时切到 Warp 1/2 → 没有空闲周期（每种颜色 = 不同 warp）" />

      {/* Efficiency labels */}
      <text x={W - 10} y={62} textAnchor="end" fontSize="10" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>
        利用率 ~33%
      </text>
      <text x={W - 10} y={147} textAnchor="end" fontSize="10" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        利用率 ~100%
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/LatencyHidingCompare.tsx
git commit -m "feat: add LatencyHidingCompare timeline diagram"
```

---

### Task 3: GpuChipTopology — interactive chip hierarchy

**Files:**
- Create: `src/components/interactive/GpuChipTopology.tsx`

Interactive chip hierarchy diagram. Shows GPU → GPC → TPC → SM layers. Click a GPC to expand and see TPCs/SMs inside. Uses useState for expand/collapse.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/GpuChipTopology.tsx`:

```tsx
// src/components/interactive/GpuChipTopology.tsx
// Interactive chip hierarchy: GPU → GPC → TPC → SM with expand/collapse
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// H100 SXM: full die = 8 GPC × 9 TPC × 2 SM = 144 SM, 132 enabled
// Visualization simplified: showing 2 TPC per GPC to fit diagram
const GPU_SPEC = {
  name: 'H100 SXM',
  gpcs: 8,
  tpcsPerGpc: 2,   // simplified for viz (actual: ~9 per GPC)
  smsPerTpc: 2,
  totalSMs: 132,    // 144 on die, 132 enabled for yield
  l2Cache: '50 MB',
  hbm: '80 GB HBM3',
};

const W = 580;
const COLLAPSED_H = 280;
const GPC_COLS = 4;
const GPC_W = 120;
const GPC_H = 40;
const GPC_GAP = 16;

function SmBox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={36} height={20} rx={3}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={x + 18} y={y + 11} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill={COLORS.primary} fontFamily={FONTS.mono} fontWeight="500">
        SM
      </text>
    </g>
  );
}

function TpcBox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={84} height={50} rx={4}
        fill="none" stroke={COLORS.green} strokeWidth={1} strokeDasharray="3 2" />
      <text x={x + 42} y={y + 10} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>TPC</text>
      <SmBox x={x + 4} y={y + 18} />
      <SmBox x={x + 44} y={y + 18} />
    </g>
  );
}

export default function GpuChipTopology() {
  const [expandedGpc, setExpandedGpc] = useState<number | null>(null);

  const gpcStartY = 70;
  const gpcRows = Math.ceil(GPU_SPEC.gpcs / GPC_COLS);

  // Calculate dynamic height
  const hasExpanded = expandedGpc !== null;
  const expandedRow = hasExpanded ? Math.floor(expandedGpc! / GPC_COLS) : -1;
  const EXPAND_EXTRA = 80;
  const H = COLLAPSED_H + (hasExpanded ? EXPAND_EXTRA : 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="GPU chip topology: GPC → TPC → SM hierarchy">

      {/* GPU chip outline */}
      <rect x={10} y={10} width={W - 20} height={H - 20} rx={8}
        fill="#fafbfc" stroke="#37474f" strokeWidth={2} />
      <text x={20} y={32} fontSize="12" fontWeight="700" fill="#37474f"
        fontFamily={FONTS.sans}>
        {GPU_SPEC.name} — {GPU_SPEC.totalSMs} SMs
      </text>

      {/* GPC grid */}
      {Array.from({ length: GPU_SPEC.gpcs }).map((_, i) => {
        const col = i % GPC_COLS;
        const row = Math.floor(i / GPC_COLS);
        const x = 30 + col * (GPC_W + GPC_GAP);
        const extraY = hasExpanded && row > expandedRow ? EXPAND_EXTRA : 0;
        const y = gpcStartY + row * (GPC_H + GPC_GAP + 20) + extraY;
        const isExpanded = expandedGpc === i;

        return (
          <g key={i} onClick={() => setExpandedGpc(isExpanded ? null : i)}
            style={{ cursor: 'pointer' }}>
            <rect x={x} y={y} width={GPC_W} height={isExpanded ? GPC_H + EXPAND_EXTRA : GPC_H}
              rx={6} fill={isExpanded ? '#eff6ff' : '#f8fafc'}
              stroke={isExpanded ? COLORS.primary : '#94a3b8'} strokeWidth={isExpanded ? 2 : 1} />
            <text x={x + GPC_W / 2} y={y + 14} textAnchor="middle" fontSize="10"
              fontWeight="600" fill={isExpanded ? COLORS.primary : '#37474f'}
              fontFamily={FONTS.sans}>
              GPC {i} {isExpanded ? '▾' : '▸'}
            </text>
            <text x={x + GPC_W / 2} y={y + 28} textAnchor="middle" fontSize="8"
              fill="#64748b" fontFamily={FONTS.sans}>
              {GPU_SPEC.tpcsPerGpc} TPC × {GPU_SPEC.smsPerTpc} SM
            </text>
            {isExpanded && (
              <g>
                <TpcBox x={x + 4} y={y + GPC_H} />
                <text x={x + GPC_W / 2} y={y + GPC_H + EXPAND_EXTRA - 6} textAnchor="middle"
                  fontSize="7" fill="#94a3b8" fontFamily={FONTS.sans}>
                  点击收起
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Bottom bar: L2 + HBM */}
      {(() => {
        const bottomY = H - 50;
        return (
          <g>
            <rect x={30} y={bottomY} width={200} height={26} rx={5}
              fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
            <text x={130} y={bottomY + 14} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans} fontWeight="500">
              L2 Cache — {GPU_SPEC.l2Cache}
            </text>
            <rect x={250} y={bottomY} width={280} height={26} rx={5}
              fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1} />
            <text x={390} y={bottomY + 14} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill={COLORS.purple} fontFamily={FONTS.sans} fontWeight="500">
              {GPU_SPEC.hbm} — 3.35 TB/s
            </text>
          </g>
        );
      })()}

      {/* Click hint */}
      {!hasExpanded && (
        <text x={W / 2} y={H - 58} textAnchor="middle" fontSize="8"
          fill="#94a3b8" fontFamily={FONTS.sans}>
          点击任意 GPC 展开查看内部 TPC → SM 结构
        </text>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/GpuChipTopology.tsx
git commit -m "feat: add GpuChipTopology interactive chip hierarchy"
```

---

### Task 4: SmInternalDiagram — SM internal structure

**Files:**
- Create: `src/components/interactive/SmInternalDiagram.tsx`

Static SVG showing SM internal structure with 4 sub-partitions, each containing warp scheduler, dispatch unit, FP32 cores, INT32 cores, Tensor Cores, SFU, LD/ST units. Also shows shared memory / L1 cache and register file.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/SmInternalDiagram.tsx`:

```tsx
// src/components/interactive/SmInternalDiagram.tsx
// Static SVG: SM internal structure — 4 processing blocks with functional units
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;
const PART_W = 125;
const PART_H = 240;
const PART_GAP = 10;
const PART_START_X = 20;
const PART_START_Y = 50;

interface UnitRowProps {
  x: number; y: number; w: number;
  label: string; count: string; color: string; bg: string;
}

function UnitRow({ x, y, w, label, count, color, bg }: UnitRowProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={3} fill={bg} stroke={color} strokeWidth={1} />
      <text x={x + 4} y={y + 12} dominantBaseline="middle"
        fontSize="7.5" fill={color} fontFamily={FONTS.sans} fontWeight="500">{label}</text>
      <text x={x + w - 4} y={y + 12} textAnchor="end" dominantBaseline="middle"
        fontSize="7" fill="#64748b" fontFamily={FONTS.mono}>{count}</text>
    </g>
  );
}

function ProcessingBlock({ x, y, index }: { x: number; y: number; index: number }) {
  const uw = PART_W - 16; // unit width inside partition
  const ux = x + 8;
  return (
    <g>
      {/* Partition outline */}
      <rect x={x} y={y} width={PART_W} height={PART_H} rx={6}
        fill="#fafbfc" stroke="#94a3b8" strokeWidth={1.5} />
      <text x={x + PART_W / 2} y={y + 14} textAnchor="middle"
        fontSize="9" fontWeight="700" fill="#37474f" fontFamily={FONTS.sans}>
        Processing Block {index}
      </text>

      {/* Control — orange */}
      <UnitRow x={ux} y={y + 24} w={uw}
        label="Warp Scheduler" count="×1" color={COLORS.orange} bg="#fff7ed" />
      <UnitRow x={ux} y={y + 50} w={uw}
        label="Dispatch Unit" count="×1" color={COLORS.orange} bg="#fff7ed" />

      {/* Compute — blue */}
      <UnitRow x={ux} y={y + 80} w={uw}
        label="FP32 CUDA Core" count="×32" color={COLORS.primary} bg="#dbeafe" />
      <UnitRow x={ux} y={y + 106} w={uw}
        label="INT32 Core" count="×16" color={COLORS.primary} bg="#eff6ff" />
      <UnitRow x={ux} y={y + 132} w={uw}
        label="FP64 Core" count="×8" color={COLORS.primary} bg="#eff6ff" />

      {/* Special — purple */}
      <UnitRow x={ux} y={y + 162} w={uw}
        label="Tensor Core" count="×1" color={COLORS.purple} bg="#f3e8ff" />
      <UnitRow x={ux} y={y + 188} w={uw}
        label="SFU (sin/cos/exp)" count="×4" color={COLORS.purple} bg="#faf5ff" />

      {/* Memory — green */}
      <UnitRow x={ux} y={y + 218} w={uw}
        label="Load/Store Unit" count="×8" color={COLORS.green} bg="#dcfce7" />
    </g>
  );
}

export default function SmInternalDiagram() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="SM internal structure with 4 processing blocks">

      {/* SM label */}
      <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Streaming Multiprocessor (SM) — Hopper 架构
      </text>
      <text x={W / 2} y={36} textAnchor="middle" fontSize="9"
        fill="#64748b" fontFamily={FONTS.sans}>
        每个 SM 包含 4 个 Processing Block（Sub-partition），各有独立的 Warp Scheduler
      </text>

      {/* 4 processing blocks */}
      {Array.from({ length: 4 }).map((_, i) => (
        <ProcessingBlock key={i}
          x={PART_START_X + i * (PART_W + PART_GAP)}
          y={PART_START_Y} index={i} />
      ))}

      {/* Shared resources at bottom */}
      {(() => {
        const sharedY = PART_START_Y + PART_H + 15;
        const fullW = 4 * PART_W + 3 * PART_GAP;
        return (
          <g>
            {/* Register File */}
            <rect x={PART_START_X} y={sharedY} width={fullW / 2 - 5} height={34} rx={5}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={PART_START_X + fullW / 4 - 3} y={sharedY + 13}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.green} fontFamily={FONTS.sans}>
              Register File — 256 KB
            </text>
            <text x={PART_START_X + fullW / 4 - 3} y={sharedY + 26}
              textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
              每线程最多 255 个 32-bit register
            </text>

            {/* Shared Memory / L1 */}
            <rect x={PART_START_X + fullW / 2 + 5} y={sharedY} width={fullW / 2 - 5} height={34} rx={5}
              fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={PART_START_X + fullW * 3 / 4 + 3} y={sharedY + 13}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>
              Shared Memory / L1 Cache — 228 KB
            </text>
            <text x={PART_START_X + fullW * 3 / 4 + 3} y={sharedY + 26}
              textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
              可配置分配比例（更多 shared 或更多 L1）
            </text>

            {/* Legend */}
            {[
              { color: COLORS.orange, label: '控制单元' },
              { color: COLORS.primary, label: '计算单元' },
              { color: COLORS.purple, label: '特殊单元' },
              { color: COLORS.green, label: '存储单元' },
            ].map((item, idx) => (
              <g key={idx}>
                <rect x={PART_START_X + idx * 80} y={sharedY + 44} width={10} height={10} rx={2}
                  fill={item.color} opacity={0.6} />
                <text x={PART_START_X + idx * 80 + 14} y={sharedY + 53} fontSize="8" fill="#94a3b8"
                  fontFamily={FONTS.sans}>{item.label}</text>
              </g>
            ))}
          </g>
        );
      })()}
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SmInternalDiagram.tsx
git commit -m "feat: add SmInternalDiagram static SM structure"
```

---

### Task 5: SmResourceTable — SM resources across generations

**Files:**
- Create: `src/components/interactive/SmResourceTable.tsx`

Interactive table comparing SM resources across Ampere, Hopper, and Blackwell architectures. Hover to highlight row differences.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/SmResourceTable.tsx`:

```tsx
// src/components/interactive/SmResourceTable.tsx
// Interactive comparison table: SM resources across GPU generations
import { useState } from 'react';
import { COLORS } from './shared/colors';

interface GenSpec {
  name: string;
  year: number;
  smsPerGpu: string;
  fp32Cores: number;
  int32Cores: number;
  tensorCores: string;
  tensorGen: string;
  regFile: string;
  sharedMem: string;
  l1Cache: string;
  maxWarps: number;
  maxThreads: number;
}

const generations: GenSpec[] = [
  {
    name: 'Ampere (A100)', year: 2020, smsPerGpu: '108',
    fp32Cores: 64, int32Cores: 32, tensorCores: '4 (3rd gen)', tensorGen: 'FP16/BF16/TF32/INT8/INT4',
    regFile: '256 KB', sharedMem: '164 KB', l1Cache: '192 KB 共享',
    maxWarps: 64, maxThreads: 2048,
  },
  {
    name: 'Hopper (H100)', year: 2022, smsPerGpu: '132',
    fp32Cores: 128, int32Cores: 64, tensorCores: '4 (4th gen)', tensorGen: 'FP16/BF16/TF32/FP8/INT8',
    regFile: '256 KB', sharedMem: '228 KB', l1Cache: '256 KB 共享',
    maxWarps: 64, maxThreads: 2048,
  },
  {
    name: 'Blackwell (B200)', year: 2024, smsPerGpu: '192',
    fp32Cores: 128, int32Cores: 64, tensorCores: '4 (5th gen)', tensorGen: 'FP16/BF16/TF32/FP8/FP4/INT8',
    regFile: '256 KB', sharedMem: '228 KB', l1Cache: '256 KB 共享',
    maxWarps: 64, maxThreads: 2048,
  },
];

const rows: { label: string; key: keyof GenSpec; highlight?: boolean }[] = [
  { label: 'GPU 中 SM 数量', key: 'smsPerGpu' },
  { label: 'FP32 Core / SM', key: 'fp32Cores', highlight: true },
  { label: 'INT32 Core / SM', key: 'int32Cores' },
  { label: 'Tensor Core / SM', key: 'tensorCores', highlight: true },
  { label: 'Tensor Core 精度', key: 'tensorGen', highlight: true },
  { label: 'Register File / SM', key: 'regFile' },
  { label: 'Shared Memory / SM', key: 'sharedMem', highlight: true },
  { label: 'L1 Cache / SM', key: 'l1Cache' },
  { label: 'Max Warps / SM', key: 'maxWarps' },
  { label: 'Max Threads / SM', key: 'maxThreads' },
];

export default function SmResourceTable() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 px-3 text-gray-600 font-medium w-1/4">资源</th>
            {generations.map((g, i) => (
              <th key={i} className="text-center py-2 px-3 font-semibold" style={{ color: COLORS.primary }}>
                {g.name}
                <div className="text-xs font-normal text-gray-400">{g.year}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isHovered = hoveredRow === ri;
            const vals = generations.map(g => String(g[row.key]));
            const allSame = vals.every(v => v === vals[0]);
            return (
              <tr key={ri}
                onMouseEnter={() => setHoveredRow(ri)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-b border-gray-100 transition-colors ${isHovered ? 'bg-blue-50' : ''}`}>
                <td className="py-1.5 px-3 text-gray-700 font-medium">{row.label}</td>
                {vals.map((v, gi) => {
                  const changed = gi > 0 && v !== vals[gi - 1];
                  return (
                    <td key={gi} className={`py-1.5 px-3 text-center font-mono text-xs ${changed ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                      {v}
                      {changed && <span className="text-green-500 ml-1">↑</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">绿色箭头 ↑ 表示相比前一代有变化。Hover 高亮行。</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SmResourceTable.tsx
git commit -m "feat: add SmResourceTable generation comparison"
```

---

### Task 6: WarpExecutionAnimation — warp divergence demo

**Files:**
- Create: `src/components/interactive/WarpExecutionAnimation.tsx`

Step-through animation using StepNavigator: (1) all 32 threads execute same instruction, (2) encounter if/else branch, (3) threads diverge — some masked, two paths execute serially.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/WarpExecutionAnimation.tsx`:

```tsx
// src/components/interactive/WarpExecutionAnimation.tsx
// Step animation: warp SIMT execution + divergence demo
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const THREAD_COUNT = 32;
const COLS = 16;
const CELL = 22;
const GAP = 2;

type ThreadState = 'active' | 'masked' | 'idle';

function ThreadGrid({ states, label }: { states: ThreadState[]; label: string }) {
  const rows = Math.ceil(THREAD_COUNT / COLS);
  const w = COLS * (CELL + GAP) + GAP;
  const h = rows * (CELL + GAP) + GAP;

  const colorMap: Record<ThreadState, { fill: string; stroke: string; text: string }> = {
    active: { fill: '#dbeafe', stroke: COLORS.primary, text: COLORS.primary },
    masked: { fill: '#f3f4f6', stroke: '#d1d5db', text: '#9ca3af' },
    idle: { fill: '#fee2e2', stroke: COLORS.red, text: COLORS.red },
  };

  return (
    <div className="mb-3">
      <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg">
        {states.map((s, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = GAP + col * (CELL + GAP);
          const y = GAP + row * (CELL + GAP);
          const c = colorMap[s];
          return (
            <g key={i}>
              <rect x={x} y={y} width={CELL} height={CELL} rx={3}
                fill={c.fill} stroke={c.stroke} strokeWidth={1} />
              <text x={x + CELL / 2} y={y + CELL / 2 + 1} textAnchor="middle"
                dominantBaseline="middle" fontSize="7" fill={c.text}
                fontFamily={FONTS.mono}>
                {i}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Legend() {
  const items = [
    { color: '#dbeafe', border: COLORS.primary, label: '活跃' },
    { color: '#f3f4f6', border: '#d1d5db', label: '被 mask（等待）' },
  ];
  return (
    <div className="flex gap-4 mt-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3.5 h-3.5 rounded" style={{ background: it.color, border: `1.5px solid ${it.border}` }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

export default function WarpExecutionAnimation() {
  const allActive: ThreadState[] = Array(32).fill('active');

  // Even threads take if-branch, odd threads take else-branch
  const ifActive: ThreadState[] = Array.from({ length: 32 }, (_, i) => i % 2 === 0 ? 'active' : 'masked');
  const elseActive: ThreadState[] = Array.from({ length: 32 }, (_, i) => i % 2 !== 0 ? 'active' : 'masked');

  const steps = [
    {
      title: '正常执行：32 线程齐步走',
      content: (
        <div>
          <p className="text-sm mb-3">
            一个 <strong>Warp</strong> 包含 32 个线程，执行<strong>同一条指令</strong>（SIMT）。
            所有线程同步执行 <code>z[i] = x[i] + y[i]</code>。
          </p>
          <ThreadGrid states={allActive} label="Warp 0 — 所有线程执行 z[i] = x[i] + y[i]" />
          <div className="p-3 bg-blue-50 rounded text-xs text-blue-800">
            ✅ 32 个线程全部活跃，硬件效率 100%
          </div>
          <Legend />
        </div>
      ),
    },
    {
      title: '分支发散 Pass 1：偶数线程执行 if',
      content: (
        <div>
          <p className="text-sm mb-3">
            遇到 <code>if (threadIdx.x % 2 == 0)</code> 分支。偶数线程走 if 路径，
            <strong>奇数线程被 mask 掉</strong>（灰色），硬件仍然发射指令但这些线程不写结果。
          </p>
          <ThreadGrid states={ifActive} label="Pass 1 — if 分支：偶数线程活跃" />
          <div className="p-3 bg-amber-50 rounded text-xs text-amber-800">
            ⚠️ 只有 16/32 线程做有效工作，硬件效率 50%
          </div>
          <Legend />
        </div>
      ),
    },
    {
      title: '分支发散 Pass 2：奇数线程执行 else',
      content: (
        <div>
          <p className="text-sm mb-3">
            if 路径执行完后，<strong>串行执行 else 路径</strong>。现在奇数线程活跃，偶数线程被 mask。
            两条路径<strong>总时间 = if 时间 + else 时间</strong>（不是并行！）。
          </p>
          <ThreadGrid states={elseActive} label="Pass 2 — else 分支：奇数线程活跃" />
          <div className="p-3 bg-red-50 rounded text-xs text-red-800">
            ❌ Warp Divergence：本该 1 次完成的工作，需要 2 个 pass 串行执行。
            这就是为什么 GPU 代码要尽量避免分支。
          </div>
          <Legend />
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/WarpExecutionAnimation.tsx
git commit -m "feat: add WarpExecutionAnimation divergence demo"
```

---

### Task 7: WarpSchedulerTimeline — warp switching animation

**Files:**
- Create: `src/components/interactive/WarpSchedulerTimeline.tsx`

Step animation showing warp scheduler switching between warps to hide memory latency.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/WarpSchedulerTimeline.tsx`:

```tsx
// src/components/interactive/WarpSchedulerTimeline.tsx
// Step animation: warp scheduler interleaving warps to hide latency
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const WARPS = ['Warp 0', 'Warp 1', 'Warp 2', 'Warp 3'];
const WARP_COLORS = ['#dbeafe', '#dcfce7', '#ede9fe', '#fef3c7'];
const WARP_STROKES = [COLORS.primary, COLORS.green, COLORS.purple, COLORS.orange];
const CYCLES = 16;
const SLOT_W = 28;
const SLOT_H = 24;

type SlotType = 'exec' | 'wait' | 'idle';

interface TimelineState {
  warps: SlotType[][];
  activeWarp: number;
  cycle: number;
}

// Simplified schedule: each warp executes 2 cycles, then waits 4 cycles for memory
function generateSchedule(): SlotType[][] {
  const schedule: SlotType[][] = WARPS.map(() => Array(CYCLES).fill('idle'));

  // 3 warps rotate: each executes 2 cycles then waits 4 cycles for memory
  // Warp 0: exec 0-1, wait 2-5, exec 6-7, wait 8-11, exec 12-13
  // Warp 1: exec 2-3, wait 4-7, exec 8-9, wait 10-13, exec 14-15
  // Warp 2: exec 4-5, wait 6-9, exec 10-11, wait 12-15
  // Warp 3: shown as idle (not enough work to schedule) — demonstrates that
  //         more active warps = better latency hiding
  const patterns = [
    [0, 1, -1, -1, -1, -1, 6, 7, -1, -1, -1, -1, 12, 13, -1, -1],
    [-1, -1, 2, 3, -1, -1, -1, -1, 8, 9, -1, -1, -1, -1, 14, 15],
    [-1, -1, -1, -1, 4, 5, -1, -1, -1, -1, 10, 11, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], // idle
  ];

  for (let w = 0; w < 3; w++) {
    for (let c = 0; c < CYCLES; c++) {
      if (patterns[w][c] >= 0) schedule[w][c] = 'exec';
      else if (c > 0 && schedule[w][c - 1] === 'exec') schedule[w][c] = 'wait'; // start wait after exec
    }
    // Fill wait periods
    let inWait = false;
    for (let c = 0; c < CYCLES; c++) {
      if (schedule[w][c] === 'exec') { inWait = false; }
      else if (c > 0 && schedule[w][c - 1] === 'exec') { schedule[w][c] = 'wait'; inWait = true; }
      else if (inWait && schedule[w][c] === 'idle') { schedule[w][c] = 'wait'; }
    }
  }

  return schedule;
}

function TimelineRow({ warpIdx, slots, highlightCycle }: {
  warpIdx: number; slots: SlotType[]; highlightCycle: number;
}) {
  const colorMap: Record<SlotType, { fill: string; stroke: string }> = {
    exec: { fill: WARP_COLORS[warpIdx], stroke: WARP_STROKES[warpIdx] },
    wait: { fill: '#fee2e2', stroke: '#fca5a5' },
    idle: { fill: '#f9fafb', stroke: '#e5e7eb' },
  };

  return (
    <g>
      <text x={0} y={14} fontSize="9" fontWeight="600"
        fill={WARP_STROKES[warpIdx]} fontFamily={FONTS.sans}>
        {WARPS[warpIdx]}
      </text>
      {slots.map((s, c) => {
        const x = 60 + c * (SLOT_W + 2);
        const col = colorMap[s];
        const isHighlight = c === highlightCycle;
        return (
          <g key={c}>
            <rect x={x} y={0} width={SLOT_W} height={SLOT_H} rx={3}
              fill={col.fill} stroke={isHighlight ? '#000' : col.stroke}
              strokeWidth={isHighlight ? 2 : 1} />
            <text x={x + SLOT_W / 2} y={SLOT_H / 2 + 1} textAnchor="middle"
              dominantBaseline="middle" fontSize="6.5" fill="#64748b"
              fontFamily={FONTS.mono}>
              {s === 'exec' ? 'RUN' : s === 'wait' ? 'MEM' : '—'}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function WarpSchedulerTimeline() {
  const schedule = generateSchedule();

  const steps = [
    {
      title: 'Cycle 0-1: Warp 0 执行',
      content: (
        <div>
          <p className="text-sm mb-3">
            Warp Scheduler 选择 <strong>Warp 0</strong> 执行计算指令。执行 2 个周期后，
            遇到全局内存访问 — 需要等待 ~数百个周期。
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={1} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-blue-50 rounded text-xs text-blue-800 mt-2">
            关键：Warp 0 等待内存时不会阻塞整个 SM — scheduler 立即切换到另一个 ready warp
          </div>
        </div>
      ),
    },
    {
      title: 'Cycle 2-3: 切换到 Warp 1',
      content: (
        <div>
          <p className="text-sm mb-3">
            Warp 0 在等内存数据，<strong>零开销切换</strong>到 Warp 1（所有 warp 的寄存器状态常驻 SM，
            切换不需要保存/恢复上下文）。Warp 1 开始执行。
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={3} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-green-50 rounded text-xs text-green-800 mt-2">
            GPU 的秘密武器：寄存器状态常驻 → warp 切换是零开销的（不像 CPU 的上下文切换需要保存/恢复）
          </div>
        </div>
      ),
    },
    {
      title: 'Cycle 4-5: 继续切换到 Warp 2',
      content: (
        <div>
          <p className="text-sm mb-3">
            Warp 1 也遇到内存等待，切换到 <strong>Warp 2</strong>。此时 Warp 0 还在等内存。
            Scheduler 持续在 ready warp 之间轮转，<strong>让 ALU 始终有事做</strong>。
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={5} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-purple-50 rounded text-xs text-purple-800 mt-2">
            这就是为什么 GPU 需要大量 warp — 每个 SM 上 active warp 越多，延迟隐藏越充分，利用率越高。
            这也是 occupancy 概念的由来。
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/WarpSchedulerTimeline.tsx
git commit -m "feat: add WarpSchedulerTimeline latency hiding demo"
```

---

### Task 8: MemoryHierarchyDetailed — 4-level memory pyramid

**Files:**
- Create: `src/components/interactive/MemoryHierarchyDetailed.tsx`

Static SVG showing the 4-level GPU memory hierarchy (Register → Shared/L1 → L2 → HBM) with bandwidth, latency, and capacity numbers for H100.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/MemoryHierarchyDetailed.tsx`:

```tsx
// src/components/interactive/MemoryHierarchyDetailed.tsx
// Static SVG: 4-level GPU memory hierarchy with H100 specs
import { COLORS, FONTS } from './shared/colors';

const W = 520;
const H = 300;

interface Level {
  label: string;
  capacity: string;
  bandwidth: string;
  latency: string;
  color: string;
  bg: string;
  width: number; // trapezoid width at this level
}

const levels: Level[] = [
  { label: 'Register File', capacity: '256 KB / SM', bandwidth: '极高（片上）',
    latency: '0 周期', color: COLORS.green, bg: '#dcfce7', width: 120 },
  { label: 'Shared Memory / L1', capacity: '228 KB / SM', bandwidth: '极高（片上）',
    latency: '~20-30 周期', color: COLORS.primary, bg: '#dbeafe', width: 200 },
  { label: 'L2 Cache', capacity: '50 MB (全局共享)', bandwidth: '~12 TB/s（理论计算值）',
    latency: '~200 周期', color: COLORS.orange, bg: '#fff7ed', width: 320 },
  { label: 'HBM3 (全局显存)', capacity: '80 GB', bandwidth: '3.35 TB/s',
    latency: '~400-600 周期', color: COLORS.purple, bg: '#f3e8ff', width: 440 },
];

export default function MemoryHierarchyDetailed() {
  const startY = 30;
  const levelH = 52;
  const centerX = W / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="GPU 4-level memory hierarchy with H100 specs">

      <text x={centerX} y={16} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        GPU 内存层次（H100 参考数据）
      </text>

      {levels.map((lv, i) => {
        const y = startY + i * (levelH + 8);
        const x = centerX - lv.width / 2;

        return (
          <g key={i}>
            {/* Level box — trapezoid-like (wider = slower/larger) */}
            <rect x={x} y={y} width={lv.width} height={levelH} rx={6}
              fill={lv.bg} stroke={lv.color} strokeWidth={1.5} />

            {/* Label */}
            <text x={centerX} y={y + 15} textAnchor="middle"
              fontSize="11" fontWeight="700" fill={lv.color} fontFamily={FONTS.sans}>
              {lv.label}
            </text>

            {/* Specs row */}
            <text x={centerX} y={y + 30} textAnchor="middle"
              fontSize="8.5" fill="#37474f" fontFamily={FONTS.mono}>
              {lv.capacity}
            </text>
            <text x={centerX} y={y + 42} textAnchor="middle"
              fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
              带宽 {lv.bandwidth} · 延迟 {lv.latency}
            </text>

            {/* Speed indicator arrow on right */}
            {i < levels.length - 1 && (
              <text x={centerX + lv.width / 2 + 12} y={y + levelH / 2 + 2} fontSize="9"
                fill="#94a3b8" fontFamily={FONTS.sans}>
                ↓ 更慢更大
              </text>
            )}
          </g>
        );
      })}

      {/* Annotation */}
      <text x={centerX} y={H - 8} textAnchor="middle" fontSize="8.5"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        优化核心思路：尽量让数据停留在金字塔顶部（Register / Shared Memory）
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MemoryHierarchyDetailed.tsx
git commit -m "feat: add MemoryHierarchyDetailed 4-level memory pyramid"
```

---

### Task 9: MDX Article Content

**Files:**
- Create: `src/content/articles/zh/gpu-architecture.mdx`

The full article content with all 8 component imports. Content must be technically accurate — verify hardware numbers against NVIDIA whitepapers. Article follows the existing pattern: frontmatter → imports → sections with embedded components.

**Important**: The article content below is a structural skeleton with key technical points. The implementer MUST:
1. Verify all hardware numbers (SM counts, core counts, bandwidth, latency) against official NVIDIA documentation
2. Expand explanations with proper technical depth matching the existing ai-compute-stack.mdx style
3. Ensure all references in frontmatter are real, accessible URLs

- [ ] **Step 1: Create the MDX file**

Create `src/content/articles/zh/gpu-architecture.mdx`:

```mdx
---
title: "GPU Architecture — 从晶体管到线程"
slug: gpu-architecture
locale: zh
tags: [gpu, architecture, hardware, nvidia, intel]
prerequisites: [ai-compute-stack]
difficulty: intermediate
created: "2026-04-03"
updated: "2026-04-03"
references:
  - type: website
    title: "NVIDIA H100 Tensor Core GPU Architecture Whitepaper"
    url: "https://resources.nvidia.com/en-us-tensor-core"
  - type: website
    title: "NVIDIA CUDA C++ Programming Guide"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/"
  - type: website
    title: "Intel Xe2 Architecture (Lunar Lake)"
    url: "https://www.intel.com/content/www/us/en/products/docs/processors/core-ultra/core-ultra-200v-brief.html"
---

import CpuGpuTransistorCompare from '../../../components/interactive/CpuGpuTransistorCompare.tsx';
import LatencyHidingCompare from '../../../components/interactive/LatencyHidingCompare.tsx';
import GpuChipTopology from '../../../components/interactive/GpuChipTopology.tsx';
import SmInternalDiagram from '../../../components/interactive/SmInternalDiagram.tsx';
import SmResourceTable from '../../../components/interactive/SmResourceTable.tsx';
import WarpExecutionAnimation from '../../../components/interactive/WarpExecutionAnimation.tsx';
import WarpSchedulerTimeline from '../../../components/interactive/WarpSchedulerTimeline.tsx';
import MemoryHierarchyDetailed from '../../../components/interactive/MemoryHierarchyDetailed.tsx';

在 [AI Compute Stack 全景](/zh/articles/ai-compute-stack) 文章中，我们从软件栈的角度理解了从推理框架到硬件 ISA 的七层结构。那篇文章的最底层是"Hardware ISA — GPU 能执行的唯一东西"。

本文往下钻一层：**GPU 硬件本身长什么样**。理解硬件架构是写高性能 GPU 代码的前提 — 你需要知道指令在什么样的物理结构上执行，才能做出正确的优化决策。

## Section 1: GPU vs CPU — 两种设计哲学

CPU 和 GPU 面对的是两种截然不同的计算需求，因此走了完全不同的设计路线。

**CPU 的设计目标：最小化单个任务的延迟（latency）。** 为此，CPU 把大量晶体管预算投入到：
- **大容量多级缓存**（L1/L2/L3，有时占芯片面积 50%+）— 让数据尽可能靠近计算单元
- **复杂的控制逻辑** — 分支预测、乱序执行（out-of-order execution）、寄存器重命名，让单个线程跑得尽可能快
- **少量高性能核心**（4-8 个）— 每个核心都是"重装步兵"

**GPU 的设计目标：最大化总吞吐量（throughput）。** 完全不同的策略：
- **海量简单 ALU** — 数千个小计算单元，每个都很弱，但合在一起吞吐量极高
- **最小化控制逻辑** — 没有复杂的分支预测和乱序执行，控制逻辑占比极小
- **小缓存，靠线程切换隐藏延迟** — 遇到内存等待不是靠缓存命中来加速，而是立即切换到另一组线程继续执行

<CpuGpuTransistorCompare client:visible />

### 延迟隐藏：两种截然不同的策略

CPU 遇到 cache miss（数据不在缓存中）时，线程会 **stall（阻塞）** — 什么都不做，干等数据从内存返回。这段等待时间完全浪费了。CPU 的应对策略是：用更大的缓存减少 miss 的概率。

GPU 的应对策略完全不同：**不减少等待，而是在等待期间做别的事**。GPU 上同时有数千个线程（分组为 warp），当一组线程等内存时，硬件 warp scheduler 立即切换到另一组已经准备好的线程。只要同时活跃的线程足够多，就能把等待时间完全填满。

<LatencyHidingCompare client:visible />

这就是为什么 GPU 需要大量线程 — 不是因为有那么多独立的任务要做，而是**需要足够多的线程来掩盖内存延迟**。这个概念叫 **latency hiding**，是理解 GPU 架构最核心的思想。

---

## Section 2: NVIDIA GPU 全局结构

以 NVIDIA H100 为例，从芯片级到最小计算单元的层级结构：

**GPU 芯片** → **GPC** (Graphics Processing Cluster) → **TPC** (Texture Processing Cluster) → **SM** (Streaming Multiprocessor)

- **GPC** 是最大的逻辑分组。H100 有 8 个 GPC。
- 每个 GPC 包含若干 **TPC**（Texture Processing Cluster）。TPC 是历史遗留名称（来自图形渲染），在计算场景下主要是 SM 的容器。
- 每个 TPC 包含 2 个 **SM** — SM 是 GPU 的核心计算单元，也是我们最需要理解的层级。
- 所有 SM 共享一个大的 **L2 Cache**（H100 约 50MB）。
- L2 之外是 **HBM**（High Bandwidth Memory）— GPU 的主显存。

**H100 SXM 全芯片：** 8 GPC × 9 TPC × 2 SM = 144 SM（实际启用 132 个），50 MB L2，80 GB HBM3。

<GpuChipTopology client:visible />

> 对比：RTX 4090 有 128 SM，L2 96 MB，24 GB GDDR6X。架构核心相同（都基于 Ada / Hopper SM），但规模和显存技术不同。

---

## Section 3: SM 内部解剖

SM（Streaming Multiprocessor）是 GPU 中**真正执行计算的单元**。理解 SM 的内部结构，就理解了 GPU 的执行模型。

### 四个 Processing Block

每个 SM 被分为 **4 个 Processing Block**（也叫 Sub-partition），每个 Processing Block 有：

- **1 个 Warp Scheduler** + 1 个 Dispatch Unit — 选择并发射指令
- **FP32 CUDA Core** — 做浮点乘加（Hopper 每 block 32 个，整个 SM 128 个）
- **INT32 Core** — 整数运算
- **Tensor Core** — 矩阵乘加速单元（下一篇文章详细讲）
- **SFU** (Special Function Unit) — 计算 sin/cos/exp 等超越函数
- **Load/Store Unit** — 从内存加载/写入数据

<SmInternalDiagram client:visible />

### 共享资源

4 个 Processing Block 共享：

- **Register File** — 256 KB，这是 GPU 中最快的存储。每个线程最多使用 255 个 32-bit 寄存器。Register file 很大是因为 GPU 需要同时维持数千个线程的寄存器状态（实现零开销 warp 切换的关键）
- **Shared Memory / L1 Cache** — 228 KB（Hopper），Block 内线程间共享的高速存储。可以配置 shared memory 和 L1 cache 的分配比例

### 代际演进

<SmResourceTable client:visible />

---

## Section 4: Warp — GPU 的最小执行单位

### 什么是 Warp

**Warp** = 32 个线程组成的一组，是 GPU 调度和执行的最小单位。Warp 中的 32 个线程在硬件层面**锁步执行同一条指令**（SIMT — Single Instruction, Multiple Threads）。

这就像一个班的士兵齐步走 — 32 人同时迈左脚、同时迈右脚。他们执行相同的"指令"（步伐），但各自踩在不同的"数据"（地面位置）上。

每个 Processing Block 的 Warp Scheduler 每个周期选择一个 **ready warp**（不在等待内存的 warp），为它发射一条指令。4 个 Processing Block 可以同时各选一个 warp，所以一个 SM 每周期最多发射 4 条指令。

### Warp Divergence

32 个线程必须执行**同一条指令** — 那如果代码里有 `if/else` 呢？

这就是 **Warp Divergence**：当 warp 中的线程走了不同的分支路径时，硬件无法同时执行两条路径。解决方式是**串行化** — 先执行 if 路径（不走 if 的线程被 mask 掉），再执行 else 路径（不走 else 的线程被 mask 掉）。两条路径的时间加在一起。

<WarpExecutionAnimation client:visible />

> 这就是为什么 GPU 代码要尽量避免分支 — 不是说不能写 if/else，而是同一个 warp 的 32 个线程最好都走同一条路径。

### Warp Scheduler 与延迟隐藏

Warp scheduler 是 SM 的"调度大脑"。它的工作很简单：**在 ready warp 中挑一个，发射它的下一条指令**。

当一个 warp 执行了内存加载指令后，需要等待数百个周期才能拿到数据。Scheduler 不会空等 — 它立刻切换到另一个 ready warp 继续执行。**这个切换是零开销的**（zero-overhead context switch），因为所有 warp 的寄存器状态都常驻在 SM 的 register file 中，不需要保存/恢复。

<WarpSchedulerTimeline client:visible />

---

## Section 5: 内存层次

GPU 的内存层次是影响性能最大的因素。从快到慢：

| 层级 | 容量 (H100) | 带宽 | 延迟 | 作用域 |
|------|------------|------|------|--------|
| Register File | 256 KB / SM | 极高（片上） | 0 周期 | 线程私有 |
| Shared Memory / L1 | 228 KB / SM | 极高（片上） | ~20-30 周期 | Block 内共享 |
| L2 Cache | 50 MB | ~12 TB/s（理论计算值） | ~200 周期 | 全局共享 |
| HBM3 | 80 GB | 3.35 TB/s | ~400-600 周期 | 全局 |

<MemoryHierarchyDetailed client:visible />

关键数字：从 register 到 HBM 的延迟差距是 **数百倍**，带宽差距是 **5-6 倍**。这意味着：

- **让数据尽可能停留在 register 和 shared memory** 是优化的核心
- 从 HBM 读一次数据很贵 — 读来之后应该尽可能**多次复用**
- 这就是 tiling（分块）策略的本质动机，我们将在 [GEMM 优化](/zh/articles/gemm-optimization) 文章中详细展开

> Flash Attention 的核心创新正是基于这个内存层次 — 把 Attention 计算分块到 SRAM（shared memory）中完成，避免写回巨大的中间矩阵到 HBM。详见 [Flash Attention 分块原理](/zh/articles/flash-attention)。

---

## 总结

GPU 架构的核心设计思想可以归纳为三点：

1. **吞吐优先** — 数千个简单核心，牺牲单线程延迟换取总吞吐量
2. **延迟隐藏** — 不减少等待时间，而是用大量线程（warp）填满等待。这要求 register file 常驻所有 warp 状态
3. **内存层次** — 从 register 到 HBM 延迟差数百倍，优化 = 尽量让数据留在快速存储中

下一篇文章将深入 GPU 中最重要的专用加速单元 — [Tensor Core 与 XMX](/zh/articles/matrix-acceleration)，理解它们为什么能让矩阵乘法快一个数量级。
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds with the new article page generated. Check output for any MDX parsing errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/gpu-architecture.mdx
git commit -m "feat: add GPU Architecture article with 8 interactive components"
```

---

### Task 10: Update learning path + final build verification

**Files:**
- Modify: `src/content/paths/ai-compute-stack.yaml`

- [ ] **Step 1: Update the learning path**

Edit `src/content/paths/ai-compute-stack.yaml` to add the new article after the existing one:

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
```

- [ ] **Step 2: Full build verification**

```bash
npm run build
```

Expected: Build succeeds. Output should show the new article page (`/zh/articles/gpu-architecture`). Total pages should increase by 1.

- [ ] **Step 3: Run content validation**

```bash
npm run validate
```

Expected: Validation passes — all frontmatter fields present, references valid, prerequisites exist.

- [ ] **Step 4: Visual verification**

```bash
npm run dev
```

Open `http://localhost:4322/zh/articles/gpu-architecture` and verify:
1. All 8 components render correctly
2. Interactive components (GpuChipTopology expand/collapse, SmResourceTable hover, StepNavigator navigation) work
3. Article appears in the AI Compute Stack learning path
4. Top navigation shows correct prev/next links

- [ ] **Step 5: Commit**

```bash
git add src/content/paths/ai-compute-stack.yaml
git commit -m "feat: add gpu-architecture to AI Compute Stack learning path"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Section 1: GPU vs CPU design philosophy → Task 1 (CpuGpuTransistorCompare), Task 2 (LatencyHidingCompare)
- ✅ Section 2: NVIDIA GPU global structure → Task 3 (GpuChipTopology)
- ✅ Section 3: SM internal anatomy → Task 4 (SmInternalDiagram), Task 5 (SmResourceTable)
- ✅ Section 4: Warp execution and divergence → Task 6 (WarpExecutionAnimation), Task 7 (WarpSchedulerTimeline)
- ✅ Section 5: Memory hierarchy → Task 8 (MemoryHierarchyDetailed)
- ✅ MDX article content → Task 9
- ✅ Learning path update → Task 10

**Placeholder scan:** No TBD/TODO. All code complete. One note: Task 9 marks reference URLs as needing verification — this is intentional guidance for the implementer, not a placeholder.

**Type consistency:** All component names match between tasks and the MDX imports in Task 9.
