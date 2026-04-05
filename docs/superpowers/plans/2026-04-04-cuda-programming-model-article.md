# CUDA Programming Model Article — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the "CUDA 编程模型 — 从代码到硬件" article with 10 interactive/static components, covering SIMD vs SIMT, thread hierarchy, block-to-SM mapping, shared memory, coalescing, barriers, occupancy, and Intel iGPU programming.

**Architecture:** Astro MDX article with React island components. Each component is a self-contained `.tsx` file in `src/components/interactive/`, imported in the MDX with `client:visible` for interactive components. Static diagrams use pure SVG; animated components use StepNavigator primitive and `useState`. Shared colors/fonts from `src/components/interactive/shared/colors.ts`.

**Tech Stack:** Astro 5, React, TypeScript, motion/react, SVG, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-03-gpu-deep-dive-design.md` — Article 3

---

## Key Decisions & Context

### Project-Level Decisions (carried from Articles 1-2)
- **Phase 1 = 4 articles**: GPU Architecture → 矩阵加速单元 → CUDA 编程模型 → GEMM 优化
- **归入 ai-compute-stack 学习路径**
- **混合型风格**: 交互动画建立直觉 + 关键处给真实代码片段
- **NVIDIA 为主线, Intel iGPU (Xe2) 详讲**, AMD 简要提及
- **不用 emoji** — CLAUDE.md 规定
- **静态组件不加 `client:visible`**: 减少 JS bundle
- **StepNavigator 用于步进动画**: `src/components/primitives/StepNavigator.tsx`
- **BASE_URL**: 项目已配置 `base: '/llm-learning/'`，MDX 内部链接由 rehype-base-url 插件自动处理

### This Article's Decisions
- **前置文章**: `gpu-architecture` — 读者已了解 SM、Processing Block、Warp、CUDA Core、Memory Hierarchy
- **SIMD vs SIMT 是核心区分**: 用同一操作 (`a[i]=b[i]+c[i]`) 的不同执行方式对比，再用 if/else 分支展示行为差异
- **Thread → Block → Grid**: 用 2D grid of 2D blocks 可视化，支持点击展开 block 看内部 thread
- **Index 计算**: 交互式计算器，输入 blockDim/gridDim，选中 thread 显示公式
- **Block → SM 映射**: 动画展示逻辑 block 被分配到物理 SM，然后 SM 内部 thread→warp 打包
- **Shared Memory Bank**: 32 个 bank 可视化，stride=1 无冲突 vs stride=2 有冲突
- **Memory Coalescing**: 32 线程地址模式 → transaction 数量对比
- **Barrier**: 静态时间轴，多 warp 写→sync→读
- **Occupancy Calculator**: 输入 block size/registers/shared mem，输出 active blocks/warps/occupancy
- **CUDA vs SYCL**: 左右代码对照，颜色标注对应概念
- **代码片段用 SVG text + FONTS.mono**: 保持所有组件一致的渲染风格

### Codebase Patterns to Follow
- 组件文件命名: PascalCase, 放在 `src/components/interactive/`
- MDX import 路径: `'../../../components/interactive/XXX.tsx'`
- 交互组件必须加 `client:visible`
- 共享常量: `import { COLORS, FONTS } from './shared/colors'`
- 动画库: `import { motion } from 'motion/react'`
- 步骤动画: `import StepNavigator from '../primitives/StepNavigator'`
- Frontmatter 必填: title, slug, locale, tags, difficulty, created, updated, references
- Build: `npm run build`, 验证: `npm run validate`
- 当前 build 产出 51 pages (含 14 篇文章), 新增 1 页后应为 52 pages

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/content/articles/zh/cuda-programming-model.mdx` | Article — 8 sections on CUDA programming model |
| `src/components/interactive/SimdVsSimtAnimation.tsx` | StepNavigator: SIMD vs SIMT execution and branch divergence |
| `src/components/interactive/ExecutionModelCompare.tsx` | Static SVG: SIMD / SIMT / Intel iGPU comparison table |
| `src/components/interactive/ThreadBlockGridViz.tsx` | StepNavigator: 2D grid of 2D blocks, expandable |
| `src/components/interactive/IndexCalculation.tsx` | Interactive: input blockDim/gridDim, show index formula |
| `src/components/interactive/BlockToSmMapping.tsx` | StepNavigator: blocks assigned to SMs, thread→warp packing |
| `src/components/interactive/SharedMemoryBanks.tsx` | StepNavigator: 32 banks, conflict-free vs bank conflict |
| `src/components/interactive/MemoryCoalescingDemo.tsx` | StepNavigator: coalesced vs uncoalesced access patterns |
| `src/components/interactive/BarrierTimeline.tsx` | Static SVG: multi-warp write→sync→read timeline |
| `src/components/interactive/OccupancyCalculator.tsx` | Interactive: block size/reg/smem → occupancy calculation |
| `src/components/interactive/CudaSyclCodeCompare.tsx` | Static SVG: CUDA vs SYCL code side-by-side |

### Modified Files

| File | Change |
|------|--------|
| `src/content/paths/ai-compute-stack.yaml` | Add `cuda-programming-model` after `matrix-acceleration` |

---

### Task 1: SimdVsSimtAnimation — SIMD vs SIMT execution comparison

**Files:**
- Create: `src/components/interactive/SimdVsSimtAnimation.tsx`

StepNavigator animation comparing how SIMD and SIMT execute the same operation `a[i] = b[i] + c[i]`, then how they handle if/else branching differently.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/SimdVsSimtAnimation.tsx`:

```tsx
// src/components/interactive/SimdVsSimtAnimation.tsx
// StepNavigator: SIMD vs SIMT execution model comparison
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

// A single lane/thread box
function Lane({ x, y, w, h, label, active, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; active: boolean; color: string; bg: string;
}) {
  return (
    <g opacity={active ? 1 : 0.25}>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={active ? bg : '#f1f5f9'} stroke={active ? color : '#cbd5e1'} strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill={active ? color : '#94a3b8'} fontFamily={FONTS.mono}>
        {label}
      </text>
    </g>
  );
}

// Section title
function SectionTitle({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize="10" fontWeight="700"
      fill={color} fontFamily={FONTS.sans}>{text}</text>
  );
}

const LANE_W = 28;
const LANE_H = 32;
const LANE_GAP = 3;

// SIMD: 8-wide vector operation
function SimdVector({ x, y, values, active, color, bg, label }: {
  x: number; y: number; values: string[];
  active: boolean[]; color: string; bg: string; label: string;
}) {
  return (
    <g>
      <text x={x - 4} y={y + LANE_H / 2} textAnchor="end" dominantBaseline="middle"
        fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {values.map((v, i) => (
        <Lane key={i} x={x + i * (LANE_W + LANE_GAP)} y={y}
          w={LANE_W} h={LANE_H} label={v} active={active[i]} color={color} bg={bg} />
      ))}
      {/* bracket */}
      <rect x={x - 2} y={y - 2} width={values.length * (LANE_W + LANE_GAP) - LANE_GAP + 4}
        height={LANE_H + 4} rx={4} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 2" />
    </g>
  );
}

// SIMT: 8 scalar threads (representing 32, showing subset)
function SimtThreads({ x, y, values, active, color, bg, label }: {
  x: number; y: number; values: string[];
  active: boolean[]; color: string; bg: string; label: string;
}) {
  return (
    <g>
      <text x={x - 4} y={y + LANE_H / 2} textAnchor="end" dominantBaseline="middle"
        fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {values.map((v, i) => (
        <Lane key={i} x={x + i * (LANE_W + LANE_GAP)} y={y}
          w={LANE_W} h={LANE_H} label={v} active={active[i]} color={color} bg={bg} />
      ))}
    </g>
  );
}

const allActive = Array(8).fill(true);
const oddActive = [false, true, false, true, false, true, false, true];
const evenActive = [true, false, true, false, true, false, true, false];

const steps = [
  {
    title: '基本操作: a[i] = b[i] + c[i]',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          同一操作 a[i] = b[i] + c[i] 的两种执行方式
        </text>

        {/* SIMD side */}
        <SectionTitle x={155} y={42} text="SIMD (Intel iGPU)" color={COLORS.primary} />
        <text x={155} y={56} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          一条指令操作 8-wide 向量
        </text>
        <SimdVector x={55} y={70} label="vadd"
          values={['b0+c0', 'b1+c1', 'b2+c2', 'b3+c3', 'b4+c4', 'b5+c5', 'b6+c6', 'b7+c7']}
          active={allActive} color={COLORS.primary} bg="#dbeafe" />

        <text x={155} y={122} textAnchor="middle" fontSize="8" fill={COLORS.primary}
          fontFamily={FONTS.mono}>
          vadd.8 a[0:7], b[0:7], c[0:7]  // 一条向量指令
        </text>

        {/* Divider */}
        <line x1={W / 2} y1={36} x2={W / 2} y2={SVG_H - 20} stroke="#e2e8f0" strokeWidth={1} />

        {/* SIMT side */}
        <SectionTitle x={435} y={42} text="SIMT (NVIDIA GPU)" color={COLORS.green} />
        <text x={435} y={56} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          32 个线程各执行标量代码 (显示 8 个)
        </text>
        <SimtThreads x={335} y={70} label="T0-T7"
          values={['b0+c0', 'b1+c1', 'b2+c2', 'b3+c3', 'b4+c4', 'b5+c5', 'b6+c6', 'b7+c7']}
          active={allActive} color={COLORS.green} bg="#dcfce7" />

        <text x={435} y={122} textAnchor="middle" fontSize="8" fill={COLORS.green}
          fontFamily={FONTS.mono}>
          a[tid] = b[tid] + c[tid];  // 标量代码 x32 线程
        </text>

        {/* Key insight */}
        <rect x={40} y={145} width={500} height={50} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={164} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          结果相同 — 但编程模型不同：SIMD 程序员必须知道向量宽度，SIMT 程序员写标量代码
        </text>
        <text x={W / 2} y={180} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          SIMD: 编译器/程序员负责向量化 | SIMT: 硬件自动将 32 个标量线程打包为 warp
        </text>

        {/* Summary boxes */}
        <rect x={40} y={210} width={220} height={80} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={150} y={228} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>SIMD 特点</text>
        <text x={150} y={244} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>显式向量宽度 (8/16/32)</text>
        <text x={150} y={258} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>程序员用 intrinsic 或编译器向量化</text>
        <text x={150} y={272} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Intel EU / CPU SSE/AVX</text>

        <rect x={320} y={210} width={220} height={80} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={430} y={228} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>SIMT 特点</text>
        <text x={430} y={244} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>向量宽度对程序员透明</text>
        <text x={430} y={258} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>写标量代码，硬件打包执行</text>
        <text x={430} y={272} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>NVIDIA Warp (32 threads)</text>
      </StepSvg>
    ),
  },
  {
    title: '分支: if (i % 2 == 0)',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          分支 if (i % 2 == 0) 下的行为差异
        </text>

        {/* SIMD side — needs explicit mask */}
        <SectionTitle x={155} y={40} text="SIMD: 需要 mask 显式处理" color={COLORS.primary} />

        <text x={55} y={62} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>Pass 1: mask = even lanes</text>
        <SimdVector x={55} y={70} label="if"
          values={['a=X', '----', 'a=X', '----', 'a=X', '----', 'a=X', '----']}
          active={evenActive} color={COLORS.primary} bg="#dbeafe" />

        <text x={55} y={118} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>Pass 2: mask = odd lanes</text>
        <SimdVector x={55} y={126} label="else"
          values={['----', 'a=Y', '----', 'a=Y', '----', 'a=Y', '----', 'a=Y']}
          active={oddActive} color={COLORS.orange} bg="#fff7ed" />

        {/* Divider */}
        <line x1={W / 2} y1={36} x2={W / 2} y2={SVG_H - 20} stroke="#e2e8f0" strokeWidth={1} />

        {/* SIMT side — warp divergence */}
        <SectionTitle x={435} y={40} text="SIMT: Warp Divergence" color={COLORS.green} />

        <text x={335} y={62} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>Pass 1: even threads active, odd masked</text>
        <SimtThreads x={335} y={70} label="if"
          values={['a=X', '----', 'a=X', '----', 'a=X', '----', 'a=X', '----']}
          active={evenActive} color={COLORS.green} bg="#dcfce7" />

        <text x={335} y={118} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>Pass 2: odd threads active, even masked</text>
        <SimtThreads x={335} y={126} label="else"
          values={['----', 'a=Y', '----', 'a=Y', '----', 'a=Y', '----', 'a=Y']}
          active={oddActive} color={COLORS.orange} bg="#fff7ed" />

        {/* Key insight */}
        <rect x={40} y={175} width={500} height={45} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={192} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          两种模型都必须串行执行两条分支路径 — 效率减半
        </text>
        <text x={W / 2} y={208} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          SIMD 用 mask register 显式控制 | SIMT 硬件自动 mask 非活跃线程 (warp divergence)
        </text>

        {/* Difference */}
        <rect x={40} y={235} width={500} height={55} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={253} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          关键区别: SIMT 的分支在硬件层自动处理（只是效率损失，不是编程错误）
        </text>
        <text x={W / 2} y={268} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          SIMD 程序员必须管理 mask / 用 blend 指令 | SIMT 程序员写普通 if/else 即可
        </text>
        <text x={W / 2} y={283} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          但 warp divergence 仍然影响性能 — 应尽量让 warp 内线程走相同分支
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Intel iGPU: SIMD + SIMT 混合',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Intel iGPU: 底层 SIMD 驱动，编程层 SIMT 体验
        </text>

        {/* Hardware layer */}
        <rect x={30} y={35} width={520} height={70} rx={6}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={50} y={52} fontSize="9" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>硬件层: EU 内部 SIMD 执行</text>
        <text x={50} y={68} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          每个 EU Thread 驱动 8-wide 或 16-wide SIMD ALU
        </text>
        <text x={50} y={82} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          向量宽度由硬件决定 (Xe2: 8-wide FP32, 16-wide FP16)
        </text>
        <text x={50} y={96} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          Sub-group 直接对应一条 SIMD lane — 暴露底层向量宽度
        </text>

        {/* Programming layer */}
        <rect x={30} y={115} width={520} height={65} rx={6}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
        <text x={50} y={132} fontSize="9" fontWeight="600" fill={COLORS.green}
          fontFamily={FONTS.sans}>编程层: SYCL / OpenCL work-item 抽象</text>
        <text x={50} y={148} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          work-item (线程) 写标量代码 — 接近 SIMT 体验
        </text>
        <text x={50} y={164} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          work-group (block) 内线程共享 SLM — 类似 CUDA shared memory
        </text>
        <text x={50} y={176} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          但 sub-group 操作 (shuffle, broadcast) 暴露了底层 SIMD 宽度
        </text>

        {/* Arrow */}
        <line x1={W / 2} y1={105} x2={W / 2} y2={115}
          stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowDown)" />

        {/* Comparison table */}
        <rect x={30} y={195} width={520} height={100} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        {/* Headers */}
        <text x={100} y={212} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>维度</text>
        <text x={230} y={212} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Intel iGPU</text>
        <text x={400} y={212} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>NVIDIA GPU</text>
        <line x1={40} y1={218} x2={540} y2={218} stroke="#e2e8f0" strokeWidth={0.5} />
        {/* Rows */}
        {[
          ['SIMD 宽度', '8/16 (显式可见)', '32 (Warp, 对程序员透明)'],
          ['编程单位', 'work-item (标量)', 'thread (标量)'],
          ['最小并行组', 'sub-group (=SIMD)', 'warp (=32 threads)'],
          ['共享内存', 'SLM (Shared Local)', 'Shared Memory'],
        ].map(([dim, intel, nvidia], i) => (
          <g key={i}>
            <text x={100} y={235 + i * 16} textAnchor="middle" fontSize="7.5"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{dim}</text>
            <text x={230} y={235 + i * 16} textAnchor="middle" fontSize="7.5"
              fill={COLORS.primary} fontFamily={FONTS.mono}>{intel}</text>
            <text x={400} y={235 + i * 16} textAnchor="middle" fontSize="7.5"
              fill={COLORS.green} fontFamily={FONTS.mono}>{nvidia}</text>
          </g>
        ))}

        {/* Arrow marker def */}
        <defs>
          <marker id="arrowDown" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.orange} />
          </marker>
        </defs>
      </StepSvg>
    ),
  },
];

export default function SimdVsSimtAnimation() {
  return <StepNavigator steps={steps} />;
}
```

Note: The table rows in Step 3 use a `.map()` inside JSX. Since this is pre-rendered SVG in a steps array (not dynamic), this works fine.

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`

This is a new component file only (no MDX yet), so it won't appear in pages but should not cause build errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SimdVsSimtAnimation.tsx
git commit -m "feat: add SimdVsSimtAnimation SIMD vs SIMT comparison"
```

---

### Task 2: ExecutionModelCompare — SIMD/SIMT/Intel comparison table

**Files:**
- Create: `src/components/interactive/ExecutionModelCompare.tsx`

Static SVG table comparing SIMD, SIMT, and Intel iGPU across multiple dimensions: programming view, hardware execution, branch handling, vector width visibility.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/ExecutionModelCompare.tsx`:

```tsx
// src/components/interactive/ExecutionModelCompare.tsx
// Static SVG: SIMD / SIMT / Intel iGPU three-column comparison table
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

const COL_X = [100, 245, 420]; // column centers
const COL_COLORS = [COLORS.primary, COLORS.green, COLORS.purple];
const HEADERS = ['SIMD (经典)', 'SIMT (NVIDIA)', 'Intel iGPU (混合)'];

const ROWS = [
  {
    dim: '编程视角',
    cells: [
      '显式向量指令\n(intrinsic / 编译器向量化)',
      '标量代码\n(硬件自动并行)',
      'SYCL work-item 标量代码\n(sub-group 暴露 SIMD)',
    ],
  },
  {
    dim: '硬件执行',
    cells: [
      '一条指令操作\nN-wide 向量寄存器',
      'Warp (32 threads)\n锁步执行同一指令',
      'EU Thread 驱动\n8/16-wide SIMD ALU',
    ],
  },
  {
    dim: '分支处理',
    cells: [
      '需要显式 mask\n或 blend 指令',
      '硬件自动 mask\n(warp divergence)',
      '硬件 mask\n(channel enable)',
    ],
  },
  {
    dim: '向量宽度',
    cells: [
      '程序员必须知道\n(8/16/32)',
      '对程序员透明\n(始终 32-wide warp)',
      '部分可见\n(sub-group size)',
    ],
  },
  {
    dim: '典型硬件',
    cells: [
      'CPU (SSE/AVX)\nIntel EU (底层)',
      'NVIDIA SM\n(FP32 / INT32 Core)',
      'Intel Xe-Core\n(Vector Engine + XMX)',
    ],
  },
];

const ROW_START = 80;
const ROW_H = 52;

export default function ExecutionModelCompare() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="SIMD vs SIMT vs Intel iGPU comparison table">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        三种并行执行模型对比
      </text>

      {/* Column headers */}
      {HEADERS.map((h, i) => (
        <g key={`h-${i}`}>
          <rect x={COL_X[i] - 70} y={42} width={140} height={26} rx={4}
            fill={`${COL_COLORS[i]}15`} stroke={COL_COLORS[i]} strokeWidth={1} />
          <text x={COL_X[i]} y={58} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COL_COLORS[i]} fontFamily={FONTS.sans}>{h}</text>
        </g>
      ))}

      {/* Row dimension label column */}
      {ROWS.map((row, ri) => {
        const y = ROW_START + ri * ROW_H;
        return (
          <g key={`r-${ri}`}>
            {/* Alternating row bg */}
            {ri % 2 === 0 && (
              <rect x={0} y={y - 4} width={W} height={ROW_H} fill="#fafbfc" />
            )}
            {/* Dimension label */}
            <text x={18} y={y + ROW_H / 2 - 4} fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {row.dim}
            </text>
            {/* Cell content */}
            {row.cells.map((cell, ci) => {
              const lines = cell.split('\n');
              return (
                <g key={`c-${ci}`}>
                  {lines.map((line, li) => (
                    <text key={li} x={COL_X[ci]} y={y + ROW_H / 2 - 6 + li * 13}
                      textAnchor="middle" fontSize="7.5"
                      fill={li === 0 ? COLORS.dark : '#64748b'} fontFamily={FONTS.sans}>
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Separator lines between columns */}
      <line x1={170} y1={42} x2={170} y2={ROW_START + ROWS.length * ROW_H - 10}
        stroke="#e2e8f0" strokeWidth={0.5} />
      <line x1={330} y1={42} x2={330} y2={ROW_START + ROWS.length * ROW_H - 10}
        stroke="#e2e8f0" strokeWidth={0.5} />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/ExecutionModelCompare.tsx
git commit -m "feat: add ExecutionModelCompare three-model comparison table"
```

---

### Task 3: ThreadBlockGridViz — Thread/Block/Grid hierarchy visualization

**Files:**
- Create: `src/components/interactive/ThreadBlockGridViz.tsx`

StepNavigator showing CUDA's 3-level thread hierarchy: overview → zoom into a block → zoom into threads with threadIdx/blockIdx annotations.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/ThreadBlockGridViz.tsx`:

```tsx
// src/components/interactive/ThreadBlockGridViz.tsx
// StepNavigator: CUDA Thread → Block → Grid hierarchy visualization
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 340;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Grid of blocks
function GridOverview() {
  const gridDim = { x: 4, y: 3 }; // 4×3 grid of blocks
  const blockW = 80;
  const blockH = 55;
  const gap = 6;
  const startX = (W - gridDim.x * (blockW + gap) + gap) / 2;
  const startY = 60;

  return (
    <g>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Grid: 所有 Block 的集合 (gridDim = 4×3)
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        每个 Block 是独立的线程组，可被分配到任意 SM 执行
      </text>

      {/* Grid outline */}
      <rect x={startX - 8} y={startY - 8}
        width={gridDim.x * (blockW + gap) - gap + 16}
        height={gridDim.y * (blockH + gap) - gap + 16}
        rx={6} fill="none" stroke={COLORS.dark} strokeWidth={2} strokeDasharray="6 3" />
      <text x={startX - 8} y={startY - 14} fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Grid</text>

      {Array.from({ length: gridDim.y }).map((_, by) =>
        Array.from({ length: gridDim.x }).map((_, bx) => {
          const x = startX + bx * (blockW + gap);
          const y = startY + by * (blockH + gap);
          const isHighlight = bx === 1 && by === 1;
          return (
            <g key={`${bx}-${by}`}>
              <rect x={x} y={y} width={blockW} height={blockH} rx={4}
                fill={isHighlight ? '#dbeafe' : '#f8fafc'}
                stroke={isHighlight ? COLORS.primary : '#cbd5e1'}
                strokeWidth={isHighlight ? 2 : 1} />
              <text x={x + blockW / 2} y={y + 16} textAnchor="middle"
                fontSize="8" fontWeight="600"
                fill={isHighlight ? COLORS.primary : COLORS.dark} fontFamily={FONTS.sans}>
                Block({bx},{by})
              </text>
              <text x={x + blockW / 2} y={y + 30} textAnchor="middle"
                fontSize="7" fill="#64748b" fontFamily={FONTS.mono}>
                blockIdx=({bx},{by})
              </text>
              {/* Mini thread grid (4×4) */}
              {Array.from({ length: 4 }).map((_, tr) =>
                Array.from({ length: 4 }).map((_, tc) => (
                  <rect key={`t-${tr}-${tc}`}
                    x={x + 12 + tc * 14} y={y + 36 + tr * 4}
                    width={12} height={3} rx={0.5}
                    fill={isHighlight ? COLORS.primary : '#94a3b8'} opacity={0.4} />
                ))
              )}
            </g>
          );
        })
      )}

      {/* Legend */}
      <text x={W / 2} y={startY + gridDim.y * (blockH + gap) + 16} textAnchor="middle"
        fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
        高亮 Block(1,1) — 下一步展开看内部线程结构
      </text>

      {/* Index formulas */}
      <rect x={60} y={SVG_H - 55} width={460} height={40} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={SVG_H - 34} textAnchor="middle" fontSize="9" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        blockIdx.x = 0..gridDim.x-1, blockIdx.y = 0..gridDim.y-1
      </text>
      <text x={W / 2} y={SVG_H - 20} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        gridDim 指定 Grid 中 Block 的数量 (每个维度)
      </text>
    </g>
  );
}

// Single block expanded to show threads
function BlockExpanded() {
  const blockDim = { x: 8, y: 4 }; // 8×4 = 32 threads per block
  const cellW = 50;
  const cellH = 28;
  const gap = 2;
  const startX = (W - blockDim.x * (cellW + gap) + gap) / 2;
  const startY = 65;

  return (
    <g>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Block(1,1) 内部: blockDim = 8×4 = 32 个线程
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        Block 内线程共享 Shared Memory，可通过 __syncthreads() 同步
      </text>

      {/* Block outline */}
      <rect x={startX - 6} y={startY - 6}
        width={blockDim.x * (cellW + gap) - gap + 12}
        height={blockDim.y * (cellH + gap) - gap + 12}
        rx={5} fill="none" stroke={COLORS.primary} strokeWidth={2} />
      <text x={startX - 6} y={startY - 12} fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        Block(1,1) — blockIdx=(1,1)
      </text>

      {Array.from({ length: blockDim.y }).map((_, ty) =>
        Array.from({ length: blockDim.x }).map((_, tx) => {
          const x = startX + tx * (cellW + gap);
          const y = startY + ty * (cellH + gap);
          // Warp coloring: threads 0-31 = warp 0 (first block has exactly 1 warp with 8×4=32)
          // Linear id = ty * blockDim.x + tx
          const linearId = ty * blockDim.x + tx;
          const warpId = Math.floor(linearId / 32);
          const warpColor = warpId === 0 ? COLORS.primary : COLORS.green;
          return (
            <g key={`${tx}-${ty}`}>
              <rect x={x} y={y} width={cellW} height={cellH} rx={2}
                fill={warpId === 0 ? '#dbeafe' : '#dcfce7'}
                stroke={warpColor} strokeWidth={0.8} />
              <text x={x + cellW / 2} y={y + 10} textAnchor="middle"
                fontSize="6.5" fill={warpColor} fontFamily={FONTS.mono}>
                tid=({tx},{ty})
              </text>
              <text x={x + cellW / 2} y={y + 22} textAnchor="middle"
                fontSize="6" fill="#64748b" fontFamily={FONTS.mono}>
                linear={linearId}
              </text>
            </g>
          );
        })
      )}

      {/* Warp annotation */}
      <rect x={startX - 6} y={startY + blockDim.y * (cellH + gap) + 10}
        width={blockDim.x * (cellW + gap) - gap + 12} height={22} rx={3}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={W / 2} y={startY + blockDim.y * (cellH + gap) + 24}
        textAnchor="middle" fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
        Warp 0: thread 0-31 (硬件将 32 个线程打包为 1 个 warp 锁步执行)
      </text>

      {/* Formula */}
      <rect x={40} y={SVG_H - 65} width={500} height={48} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={SVG_H - 44} textAnchor="middle" fontSize="9" fill={COLORS.dark}
        fontFamily={FONTS.mono}>
        globalIdx.x = threadIdx.x + blockIdx.x * blockDim.x = tx + 1 * 8 = tx + 8
      </text>
      <text x={W / 2} y={SVG_H - 28} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        每个线程用 threadIdx + blockIdx * blockDim 计算自己在全局数据中的位置
      </text>
    </g>
  );
}

// Thread to warp mapping
function WarpPacking() {
  const THREADS = 64; // 2 warps
  const COLS = 16;
  const cellW = 28;
  const cellH = 16;
  const gap = 2;
  const startX = (W - COLS * (cellW + gap) + gap) / 2;
  const startY = 60;

  return (
    <g>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Thread → Warp 打包规则
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        blockDim = 16×4 = 64 threads → 打包为 2 个 warp (每 32 个线程一组)
      </text>

      {Array.from({ length: Math.ceil(THREADS / COLS) }).map((_, row) =>
        Array.from({ length: COLS }).map((_, col) => {
          const tid = row * COLS + col;
          if (tid >= THREADS) return null;
          const warpId = Math.floor(tid / 32);
          const x = startX + col * (cellW + gap);
          const y = startY + row * (cellH + gap);
          const color = warpId === 0 ? COLORS.primary : COLORS.green;
          const bg = warpId === 0 ? '#dbeafe' : '#dcfce7';
          return (
            <g key={tid}>
              <rect x={x} y={y} width={cellW} height={cellH} rx={1.5}
                fill={bg} stroke={color} strokeWidth={0.5} />
              <text x={x + cellW / 2} y={y + cellH / 2 + 1} textAnchor="middle"
                dominantBaseline="middle" fontSize="6.5" fill={color} fontFamily={FONTS.mono}>
                T{tid}
              </text>
            </g>
          );
        })
      )}

      {/* Warp labels */}
      {[0, 1].map(warpId => {
        const y = startY + (warpId === 0 ? 0 : 2) * (cellH + gap) + cellH + gap + 2;
        const color = warpId === 0 ? COLORS.primary : COLORS.green;
        return (
          <g key={warpId}>
            <rect x={startX + (warpId === 0 ? 0 : COLS / 2 * (cellW + gap))}
              y={startY - 2 + (warpId === 0 ? 0 : 2) * (cellH + gap)}
              width={COLS * (cellW + gap) - gap}
              height={2 * (cellH + gap) + cellH + 4}
              rx={4} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 2" />
          </g>
        );
      })}

      {/* Warp 0 label */}
      <text x={startX + COLS * (cellW + gap) / 2} y={startY + 2 * (cellH + gap) + cellH + 16}
        textAnchor="middle" fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
        Warp 0: T0-T31
      </text>
      <text x={startX + COLS * (cellW + gap) / 2} y={startY + 4 * (cellH + gap) + cellH + 16}
        textAnchor="middle" fontSize="8" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
        Warp 1: T32-T63
      </text>

      {/* Key insight */}
      <rect x={40} y={SVG_H - 100} width={500} height={80} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={SVG_H - 80} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Warp 打包规则
      </text>
      <text x={W / 2} y={SVG_H - 64} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        线程按 linearIdx = threadIdx.x + threadIdx.y * blockDim.x + threadIdx.z * blockDim.x * blockDim.y 排序
      </text>
      <text x={W / 2} y={SVG_H - 48} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        每连续 32 个线程打包为一个 warp: warpId = linearIdx / 32
      </text>
      <text x={W / 2} y={SVG_H - 32} textAnchor="middle" fontSize="8" fill={COLORS.orange}
        fontFamily={FONTS.sans}>
        因此 blockDim 应该是 32 的倍数 — 否则最后一个 warp 有空闲线程，浪费硬件
      </text>
    </g>
  );
}

const steps = [
  { title: 'Grid: Block 的集合', content: <StepSvg><GridOverview /></StepSvg> },
  { title: 'Block 内部: Thread', content: <StepSvg><BlockExpanded /></StepSvg> },
  { title: 'Thread → Warp 打包', content: <StepSvg><WarpPacking /></StepSvg> },
];

export default function ThreadBlockGridViz() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/ThreadBlockGridViz.tsx
git commit -m "feat: add ThreadBlockGridViz thread hierarchy visualization"
```

---

### Task 4: IndexCalculation — Interactive global index calculator

**Files:**
- Create: `src/components/interactive/IndexCalculation.tsx`

Interactive component: user adjusts blockDim and gridDim sliders, clicks on a thread cell, and sees the full index formula with computed values.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/IndexCalculation.tsx`:

```tsx
// src/components/interactive/IndexCalculation.tsx
// Interactive: blockDim/gridDim → select thread → show global index formula
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 320;

export default function IndexCalculation() {
  const [blockDim, setBlockDim] = useState(8);
  const [gridDim, setGridDim] = useState(4);
  const [selectedBlock, setSelectedBlock] = useState(1);
  const [selectedThread, setSelectedThread] = useState(3);

  const globalIdx = selectedThread + selectedBlock * blockDim;
  const totalThreads = blockDim * gridDim;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 font-medium">blockDim:</span>
          <input type="range" min={4} max={16} step={4} value={blockDim}
            onChange={e => { setBlockDim(+e.target.value); setSelectedThread(Math.min(selectedThread, +e.target.value - 1)); }}
            className="w-20" />
          <span className="font-mono text-primary-600 w-6">{blockDim}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 font-medium">gridDim:</span>
          <input type="range" min={2} max={8} value={gridDim}
            onChange={e => { setGridDim(+e.target.value); setSelectedBlock(Math.min(selectedBlock, +e.target.value - 1)); }}
            className="w-20" />
          <span className="font-mono text-primary-600 w-6">{gridDim}</span>
        </label>
        <span className="text-xs text-gray-500">
          总线程数: {totalThreads} | 点击选择线程
        </span>
      </div>

      {/* SVG visualization */}
      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
          {/* Title */}
          <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            1D Grid: {gridDim} blocks × {blockDim} threads = {totalThreads} 个线程
          </text>

          {/* Blocks */}
          {Array.from({ length: gridDim }).map((_, bi) => {
            const blockStartX = 20 + bi * ((W - 40) / gridDim);
            const blockW = (W - 40) / gridDim - 6;
            const isSelectedBlock = bi === selectedBlock;

            return (
              <g key={bi}>
                {/* Block container */}
                <rect x={blockStartX} y={35} width={blockW} height={120} rx={4}
                  fill={isSelectedBlock ? '#dbeafe' : '#f8fafc'}
                  stroke={isSelectedBlock ? COLORS.primary : '#cbd5e1'}
                  strokeWidth={isSelectedBlock ? 2 : 1} />
                <text x={blockStartX + blockW / 2} y={50} textAnchor="middle"
                  fontSize="8" fontWeight="600"
                  fill={isSelectedBlock ? COLORS.primary : COLORS.dark}
                  fontFamily={FONTS.sans}>
                  Block {bi}
                </text>

                {/* Threads within block */}
                {Array.from({ length: blockDim }).map((_, ti) => {
                  const threadW = Math.min(28, (blockW - 10) / blockDim - 2);
                  const tx = blockStartX + 5 + ti * (threadW + 2);
                  const isSelected = bi === selectedBlock && ti === selectedThread;
                  const global = ti + bi * blockDim;

                  return (
                    <g key={ti} style={{ cursor: 'pointer' }}
                      onClick={() => { setSelectedBlock(bi); setSelectedThread(ti); }}>
                      <rect x={tx} y={60} width={threadW} height={80} rx={2}
                        fill={isSelected ? '#fef3c7' : isSelectedBlock ? '#eff6ff' : 'white'}
                        stroke={isSelected ? COLORS.orange : '#cbd5e1'}
                        strokeWidth={isSelected ? 2 : 0.5} />
                      <text x={tx + threadW / 2} y={76} textAnchor="middle"
                        fontSize="6" fill={COLORS.dark} fontFamily={FONTS.mono}>
                        T{ti}
                      </text>
                      <text x={tx + threadW / 2} y={92} textAnchor="middle"
                        fontSize="6" fill="#64748b" fontFamily={FONTS.mono}>
                        g={global}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Formula breakdown */}
          <rect x={30} y={170} width={W - 60} height={130} rx={6}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />

          <text x={W / 2} y={192} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Global Index 计算公式
          </text>

          <text x={W / 2} y={215} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.mono}>
            globalIdx = threadIdx.x + blockIdx.x * blockDim.x
          </text>

          <text x={W / 2} y={240} textAnchor="middle" fontSize="10"
            fill={COLORS.orange} fontFamily={FONTS.mono}>
            globalIdx = {selectedThread} + {selectedBlock} × {blockDim} = {globalIdx}
          </text>

          {/* Breakdown */}
          <text x={W / 2} y={265} textAnchor="middle" fontSize="8"
            fill="#64748b" fontFamily={FONTS.sans}>
            threadIdx.x = {selectedThread} (线程在 Block 内的位置) | blockIdx.x = {selectedBlock} (Block 在 Grid 内的位置) | blockDim.x = {blockDim} (每个 Block 的线程数)
          </text>

          <text x={W / 2} y={285} textAnchor="middle" fontSize="8"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            这个 globalIdx 就是该线程负责处理的数据元素下标: a[{globalIdx}] = b[{globalIdx}] + c[{globalIdx}]
          </text>
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/IndexCalculation.tsx
git commit -m "feat: add IndexCalculation interactive global index calculator"
```

---

### Task 5: BlockToSmMapping — Block to SM assignment animation

**Files:**
- Create: `src/components/interactive/BlockToSmMapping.tsx`

StepNavigator showing how logical blocks get assigned to physical SMs at runtime.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/BlockToSmMapping.tsx`:

```tsx
// src/components/interactive/BlockToSmMapping.tsx
// StepNavigator: logical blocks assigned to physical SMs, thread→warp packing
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 330;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

const BLOCK_COLORS = ['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3', '#e0e7ff', '#ccfbf1'];
const BLOCK_BORDERS = [COLORS.primary, COLORS.green, COLORS.orange, '#be185d', '#4338ca', '#0d9488'];

function SmBox({ x, y, smId, blocks }: {
  x: number; y: number; smId: number; blocks: number[];
}) {
  return (
    <g>
      <rect x={x} y={y} width={110} height={100} rx={5}
        fill="#f8fafc" stroke={COLORS.dark} strokeWidth={1.5} />
      <text x={x + 55} y={y + 16} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>SM {smId}</text>
      {blocks.map((b, i) => (
        <g key={b}>
          <rect x={x + 8 + i * 48} y={y + 26} width={44} height={64} rx={3}
            fill={BLOCK_COLORS[b % 6]} stroke={BLOCK_BORDERS[b % 6]} strokeWidth={1} />
          <text x={x + 30 + i * 48} y={y + 44} textAnchor="middle"
            fontSize="8" fontWeight="600" fill={BLOCK_BORDERS[b % 6]} fontFamily={FONTS.sans}>
            Block {b}
          </text>
          <text x={x + 30 + i * 48} y={y + 60} textAnchor="middle"
            fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
            128 threads
          </text>
          <text x={x + 30 + i * 48} y={y + 74} textAnchor="middle"
            fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
            4 warps
          </text>
        </g>
      ))}
      {blocks.length === 0 && (
        <text x={x + 55} y={y + 58} textAnchor="middle"
          fontSize="8" fill="#94a3b8" fontFamily={FONTS.sans}>(空闲)</text>
      )}
    </g>
  );
}

const steps = [
  {
    title: 'Grid: 6 个 Block 待分配',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          逻辑视图: Grid 包含 6 个 Block (每个 128 threads = 4 warps)
        </text>

        {/* Blocks in a row */}
        {Array.from({ length: 6 }).map((_, i) => {
          const x = 30 + i * 90;
          return (
            <g key={i}>
              <rect x={x} y={50} width={80} height={50} rx={4}
                fill={BLOCK_COLORS[i % 6]} stroke={BLOCK_BORDERS[i % 6]} strokeWidth={1.5} />
              <text x={x + 40} y={72} textAnchor="middle" fontSize="9" fontWeight="600"
                fill={BLOCK_BORDERS[i % 6]} fontFamily={FONTS.sans}>Block {i}</text>
              <text x={x + 40} y={88} textAnchor="middle" fontSize="7"
                fill="#64748b" fontFamily={FONTS.sans}>128 threads</text>
            </g>
          );
        })}

        {/* SMs empty */}
        <text x={W / 2} y={130} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          物理视图: 4 个 SM (每个最多容纳 2 个 Block)
        </text>
        {Array.from({ length: 4 }).map((_, i) => (
          <SmBox key={i} x={20 + i * 140} y={145} smId={i} blocks={[]} />
        ))}

        <rect x={40} y={SVG_H - 55} width={500} height={40} rx={5}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
        <text x={W / 2} y={SVG_H - 30} textAnchor="middle" fontSize="9"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          Block 到 SM 的分配由 runtime 决定，顺序不确定、不可控 — 程序不应假设分配顺序
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Block 分配到 SM',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Runtime 将 Block 分配到 SM (受资源限制: registers, shared memory, warps)
        </text>

        {/* Arrows from top to SMs */}
        <text x={W / 2} y={45} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个 SM 最多 2 个 Block (因为每个 Block 用 4 warps，SM 最大 ~8-16 active warps)
        </text>

        <SmBox x={20} y={60} smId={0} blocks={[0, 1]} />
        <SmBox x={155} y={60} smId={1} blocks={[2, 3]} />
        <SmBox x={290} y={60} smId={2} blocks={[4, 5]} />
        <SmBox x={425} y={60} smId={3} blocks={[]} />

        <text x={480} y={120} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.sans}>(6 Blocks / 3 SMs 足够)</text>

        {/* Resource accounting */}
        <rect x={30} y={180} width={520} height={80} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={198} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>SM 资源限制 (决定每个 SM 能容纳多少 Block)</text>
        {[
          ['Max warps per SM', '例: 64 warps (Hopper)', '每 Block 4 warps → 最多 16 Blocks'],
          ['Register file', '例: 256KB = 65536 regs', '每 thread 用 32 regs → 每 Block 4096 regs → 最多 16 Blocks'],
          ['Shared memory', '例: 228KB', '每 Block 用 16KB → 最多 14 Blocks'],
        ].map(([resource, spec, calc], i) => (
          <g key={i}>
            <text x={50} y={218 + i * 14} fontSize="7.5" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{resource}</text>
            <text x={215} y={218 + i * 14} fontSize="7.5"
              fill="#64748b" fontFamily={FONTS.mono}>{spec}</text>
            <text x={410} y={218 + i * 14} fontSize="7.5"
              fill={COLORS.primary} fontFamily={FONTS.sans}>{calc}</text>
          </g>
        ))}

        <text x={W / 2} y={SVG_H - 20} textAnchor="middle" fontSize="8" fill={COLORS.orange}
          fontFamily={FONTS.sans}>
          实际 Blocks/SM = min(warp 限制, register 限制, shared memory 限制) — 最紧的瓶颈决定
        </text>
      </StepSvg>
    ),
  },
];

export default function BlockToSmMapping() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/BlockToSmMapping.tsx
git commit -m "feat: add BlockToSmMapping block-to-SM assignment animation"
```

---

### Task 6: SharedMemoryBanks — Bank conflict visualization

**Files:**
- Create: `src/components/interactive/SharedMemoryBanks.tsx`

StepNavigator: 32 banks visualization showing conflict-free stride=1 access vs bank-conflicted stride=2 access.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/SharedMemoryBanks.tsx`:

```tsx
// src/components/interactive/SharedMemoryBanks.tsx
// StepNavigator: 32 shared memory banks, conflict-free vs bank conflict
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 340;
const NUM_BANKS = 32;
const BANK_W = 14;
const BANK_GAP = 2;
const BANKS_START_X = (W - NUM_BANKS * (BANK_W + BANK_GAP) + BANK_GAP) / 2;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

function BankRow({ y, accessPattern, label, conflictBanks }: {
  y: number;
  accessPattern: (number | null)[]; // thread i accesses bank accessPattern[i]
  label: string;
  conflictBanks: Set<number>;
}) {
  return (
    <g>
      <text x={W / 2} y={y - 28} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>

      {/* Thread row */}
      <text x={BANKS_START_X - 4} y={y + 8} textAnchor="end" fontSize="7"
        fill={COLORS.green} fontFamily={FONTS.sans}>Threads</text>
      {Array.from({ length: NUM_BANKS }).map((_, i) => {
        const x = BANKS_START_X + i * (BANK_W + BANK_GAP);
        const bank = accessPattern[i];
        const hasConflict = bank !== null && conflictBanks.has(bank);
        return (
          <g key={`t-${i}`}>
            <rect x={x} y={y} width={BANK_W} height={16} rx={1.5}
              fill={hasConflict ? '#fee2e2' : '#dcfce7'}
              stroke={hasConflict ? COLORS.red : COLORS.green} strokeWidth={0.5} />
            <text x={x + BANK_W / 2} y={y + 10} textAnchor="middle"
              fontSize="5.5" fill={hasConflict ? COLORS.red : COLORS.green}
              fontFamily={FONTS.mono}>T{i}</text>
          </g>
        );
      })}

      {/* Arrow lines from threads to banks */}
      {Array.from({ length: NUM_BANKS }).map((_, i) => {
        const bank = accessPattern[i];
        if (bank === null) return null;
        const tx = BANKS_START_X + i * (BANK_W + BANK_GAP) + BANK_W / 2;
        const bx = BANKS_START_X + bank * (BANK_W + BANK_GAP) + BANK_W / 2;
        const hasConflict = conflictBanks.has(bank);
        return (
          <line key={`a-${i}`} x1={tx} y1={y + 16} x2={bx} y2={y + 38}
            stroke={hasConflict ? COLORS.red : COLORS.green}
            strokeWidth={0.6} opacity={0.6} />
        );
      })}

      {/* Bank row */}
      <text x={BANKS_START_X - 4} y={y + 48} textAnchor="end" fontSize="7"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Banks</text>
      {Array.from({ length: NUM_BANKS }).map((_, i) => {
        const x = BANKS_START_X + i * (BANK_W + BANK_GAP);
        const hasConflict = conflictBanks.has(i);
        // Count how many threads access this bank
        const accessCount = accessPattern.filter(b => b === i).length;
        return (
          <g key={`b-${i}`}>
            <rect x={x} y={y + 38} width={BANK_W} height={18} rx={1.5}
              fill={hasConflict ? '#fee2e2' : accessCount > 0 ? '#dbeafe' : '#f8fafc'}
              stroke={hasConflict ? COLORS.red : accessCount > 0 ? COLORS.primary : '#cbd5e1'}
              strokeWidth={hasConflict ? 1.5 : 0.5} />
            <text x={x + BANK_W / 2} y={y + 50} textAnchor="middle"
              fontSize="5" fill={hasConflict ? COLORS.red : '#64748b'}
              fontFamily={FONTS.mono}>B{i}</text>
          </g>
        );
      })}

      {/* Conflict marker */}
      {Array.from(conflictBanks).map(b => {
        const x = BANKS_START_X + b * (BANK_W + BANK_GAP) + BANK_W / 2;
        return (
          <text key={`c-${b}`} x={x} y={y + 68} textAnchor="middle"
            fontSize="7" fontWeight="700" fill={COLORS.red} fontFamily={FONTS.sans}>!</text>
        );
      })}
    </g>
  );
}

// stride=1: thread i accesses bank i (no conflict)
const stride1Pattern = Array.from({ length: 32 }, (_, i) => i % 32);
const stride1Conflicts = new Set<number>();

// stride=2: thread i accesses address i*2 → bank = (i*2) % 32
const stride2Pattern = Array.from({ length: 32 }, (_, i) => (i * 2) % 32);
const stride2Conflicts = new Set<number>();
// Find banks accessed by multiple threads
const bankAccessCount = new Map<number, number>();
stride2Pattern.forEach(b => bankAccessCount.set(b, (bankAccessCount.get(b) || 0) + 1));
bankAccessCount.forEach((count, bank) => { if (count > 1) stride2Conflicts.add(bank); });

const steps = [
  {
    title: 'Stride=1: 无冲突',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Shared Memory: 32 Banks, 连续 4 字节映射到连续 Bank
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          Thread i 访问地址 i × 4 bytes → Bank = i % 32
        </text>

        <BankRow y={65} accessPattern={stride1Pattern}
          label="Stride=1: Thread i → Bank i (每个线程访问不同 Bank)"
          conflictBanks={stride1Conflicts} />

        <rect x={40} y={200} width={500} height={50} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          无 Bank Conflict — 一拍完成所有 32 个访问
        </text>
        <text x={W / 2} y={236} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          32 个线程各访问一个不同的 Bank，硬件并行服务所有请求
        </text>

        <rect x={40} y={265} width={500} height={40} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={288} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Bank 映射规则: Bank(addr) = (addr / 4) % 32 — 连续 4 字节在连续 Bank 中
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Stride=2: Bank Conflict',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Stride=2 访问模式: Thread i → 地址 i × 8 bytes
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          Bank = (i × 2) % 32 — 只使用偶数 Bank，两个线程共享一个 Bank
        </text>

        <BankRow y={65} accessPattern={stride2Pattern}
          label="Stride=2: Thread 0 和 Thread 16 都访问 Bank 0, Thread 1 和 17 都访问 Bank 2 ..."
          conflictBanks={stride2Conflicts} />

        <rect x={40} y={200} width={500} height={50} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          2-way Bank Conflict — 需要 2 拍才能完成 (效率减半)
        </text>
        <text x={W / 2} y={236} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个 Bank 被 2 个线程同时请求，硬件必须串行化同一 Bank 的访问
        </text>

        <rect x={40} y={265} width={500} height={45} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={282} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          解决方案: 用 padding (每行加一个 float 的偏移) 打破 stride 对齐 → 消除 bank conflict
        </text>
        <text x={W / 2} y={298} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          例: __shared__ float tile[32][33]; // 33 而非 32，错开 bank 映射
        </text>
      </StepSvg>
    ),
  },
];

export default function SharedMemoryBanks() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/SharedMemoryBanks.tsx
git commit -m "feat: add SharedMemoryBanks bank conflict visualization"
```

---

### Task 7: MemoryCoalescingDemo — Coalesced vs uncoalesced access

**Files:**
- Create: `src/components/interactive/MemoryCoalescingDemo.tsx`

StepNavigator: 32 threads' memory access patterns — coalesced (1 transaction) vs strided (many transactions).

- [ ] **Step 1: Create the component**

Create `src/components/interactive/MemoryCoalescingDemo.tsx`:

```tsx
// src/components/interactive/MemoryCoalescingDemo.tsx
// StepNavigator: coalesced vs uncoalesced global memory access
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

// Memory segment (128 bytes)
function MemSegment({ x, y, w, h, label, used, total, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; used: number; total: number; color: string; bg: string;
}) {
  const usedW = (used / total) * w;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={0.5} />
      <rect x={x} y={y} width={usedW} height={h} rx={3}
        fill={bg} stroke={color} strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize="6.5" fill={color} fontFamily={FONTS.mono}>{label}</text>
    </g>
  );
}

const THREAD_COUNT = 16; // show 16 of 32 for space
const CELL_W = 28;
const CELL_GAP = 2;
const THREAD_Y = 60;
const MEM_Y = 150;

const steps = [
  {
    title: 'Coalesced: 连续访问',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Coalesced Access: Thread i 读 A[i] (连续地址)
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          32 个线程读 32 个连续 float (128 bytes) → 合并为 1 个 128B transaction
        </text>

        {/* Thread row */}
        {Array.from({ length: THREAD_COUNT }).map((_, i) => {
          const x = (W - THREAD_COUNT * (CELL_W + CELL_GAP) + CELL_GAP) / 2 + i * (CELL_W + CELL_GAP);
          return (
            <g key={i}>
              <rect x={x} y={THREAD_Y} width={CELL_W} height={22} rx={2}
                fill="#dcfce7" stroke={COLORS.green} strokeWidth={0.5} />
              <text x={x + CELL_W / 2} y={THREAD_Y + 9} textAnchor="middle"
                fontSize="6" fill={COLORS.green} fontFamily={FONTS.mono}>T{i}</text>
              <text x={x + CELL_W / 2} y={THREAD_Y + 19} textAnchor="middle"
                fontSize="5" fill="#64748b" fontFamily={FONTS.mono}>A[{i}]</text>
              {/* Arrow down */}
              <line x1={x + CELL_W / 2} y1={THREAD_Y + 22} x2={x + CELL_W / 2} y2={MEM_Y - 4}
                stroke={COLORS.green} strokeWidth={0.5} opacity={0.4} />
            </g>
          );
        })}

        {/* Memory: single 128B segment */}
        <text x={W / 2} y={MEM_Y - 8} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Global Memory (HBM)</text>
        <MemSegment
          x={(W - THREAD_COUNT * (CELL_W + CELL_GAP) + CELL_GAP) / 2}
          y={MEM_Y} w={THREAD_COUNT * (CELL_W + CELL_GAP) - CELL_GAP} h={30}
          label="1 × 128B transaction" used={128} total={128}
          color={COLORS.green} bg="#dcfce7" />

        {/* Stats */}
        <rect x={60} y={200} width={460} height={55} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          效率: 128 / 128 = 100% 带宽利用率
        </text>
        <text x={W / 2} y={236} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          传输 128 bytes, 有效数据 128 bytes — 零浪费
        </text>
        <text x={W / 2} y={248} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>
          GPU 内存控制器将 warp 内连续地址合并为最少的 transaction
        </text>

        {/* Note */}
        <text x={W / 2} y={280} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          行优先访问矩阵的同一行: thread i 读 M[row][i] — 地址连续，天然 coalesced
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Strided: 不连续访问',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Strided Access: Thread i 读 A[i × stride] (不连续地址)
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          stride=16: 32 个线程的地址散落在 16 个 128B segment 中
        </text>

        {/* Thread row — spread out */}
        {Array.from({ length: THREAD_COUNT }).map((_, i) => {
          const x = (W - THREAD_COUNT * (CELL_W + CELL_GAP) + CELL_GAP) / 2 + i * (CELL_W + CELL_GAP);
          return (
            <g key={i}>
              <rect x={x} y={THREAD_Y} width={CELL_W} height={22} rx={2}
                fill="#fee2e2" stroke={COLORS.red} strokeWidth={0.5} />
              <text x={x + CELL_W / 2} y={THREAD_Y + 9} textAnchor="middle"
                fontSize="6" fill={COLORS.red} fontFamily={FONTS.mono}>T{i}</text>
              <text x={x + CELL_W / 2} y={THREAD_Y + 19} textAnchor="middle"
                fontSize="5" fill="#64748b" fontFamily={FONTS.mono}>A[{i * 16}]</text>
            </g>
          );
        })}

        {/* Memory: many segments, mostly wasted */}
        <text x={W / 2} y={MEM_Y - 8} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Global Memory: 多个 128B transaction</text>

        {Array.from({ length: 4 }).map((_, row) => (
          <g key={row}>
            {Array.from({ length: 4 }).map((_, col) => {
              const segIdx = row * 4 + col;
              const x = 50 + col * 130;
              const y = MEM_Y + row * 18;
              return (
                <MemSegment key={segIdx}
                  x={x} y={y} w={120} h={14}
                  label={`seg ${segIdx}: 128B (有效 4B)`} used={4} total={128}
                  color={COLORS.red} bg="#fee2e2" />
              );
            })}
          </g>
        ))}

        {/* Stats */}
        <rect x={60} y={230} width={460} height={55} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={248} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          效率: 128 / 2048 = 6.25% 带宽利用率
        </text>
        <text x={W / 2} y={266} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          传输 16 × 128B = 2048 bytes, 有效数据仅 128 bytes — 93.75% 浪费
        </text>
        <text x={W / 2} y={278} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个 thread 的 4B 数据分散在不同 segment → 每个 segment 只用 4B
        </text>

        {/* Note */}
        <text x={W / 2} y={305} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          列优先访问矩阵: thread i 读 M[i][col] — stride = 行宽，严重 uncoalesced
        </text>
      </StepSvg>
    ),
  },
];

export default function MemoryCoalescingDemo() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/MemoryCoalescingDemo.tsx
git commit -m "feat: add MemoryCoalescingDemo coalesced vs strided access"
```

---

### Task 8: BarrierTimeline — Synchronization barrier timeline

**Files:**
- Create: `src/components/interactive/BarrierTimeline.tsx`

Static SVG: multi-warp timeline showing write → __syncthreads() → read pattern, with annotation of what happens without barrier.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/BarrierTimeline.tsx`:

```tsx
// src/components/interactive/BarrierTimeline.tsx
// Static SVG: multi-warp write → barrier → read timeline
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

// Timeline bar
function Bar({ x, y, w, h, label, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={bg} stroke={color} strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

const TRACK_H = 26;
const TRACK_GAP = 8;
const LABEL_X = 85;
const TIMELINE_X = 95;
const TIMELINE_W = 420;

const warps = ['Warp 0', 'Warp 1', 'Warp 2', 'Warp 3'];

export default function BarrierTimeline() {
  const barrierX = TIMELINE_X + 180;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Synchronization barrier timeline">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        __syncthreads() — Block 内 Barrier 同步
      </text>

      {/* Correct pattern with barrier */}
      <text x={TIMELINE_X} y={42} fontSize="10" fontWeight="600" fill={COLORS.green}
        fontFamily={FONTS.sans}>正确: 写 Shared Memory → __syncthreads() → 读 Shared Memory</text>

      {warps.map((warp, i) => {
        const y = 55 + i * (TRACK_H + TRACK_GAP);
        // Stagger write completion slightly per warp
        const writeEnd = 130 + i * 15;
        return (
          <g key={i}>
            <text x={LABEL_X} y={y + TRACK_H / 2} textAnchor="end" dominantBaseline="middle"
              fontSize="8" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {warp}
            </text>
            {/* Write phase */}
            <Bar x={TIMELINE_X} y={y} w={writeEnd - TIMELINE_X} h={TRACK_H}
              label="写 smem" color={COLORS.primary} bg="#dbeafe" />
            {/* Wait at barrier */}
            <rect x={writeEnd} y={y} width={barrierX - writeEnd} height={TRACK_H} rx={3}
              fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={0.5} />
            <text x={(writeEnd + barrierX) / 2} y={y + TRACK_H / 2} textAnchor="middle"
              dominantBaseline="middle" fontSize="6" fill="#94a3b8" fontFamily={FONTS.sans}>
              等待
            </text>
            {/* Read phase (after barrier) */}
            <Bar x={barrierX + 4} y={y} w={100} h={TRACK_H}
              label="读 smem" color={COLORS.green} bg="#dcfce7" />
          </g>
        );
      })}

      {/* Barrier line */}
      <line x1={barrierX} y1={50} x2={barrierX}
        y2={55 + warps.length * (TRACK_H + TRACK_GAP) - TRACK_GAP}
        stroke={COLORS.orange} strokeWidth={2.5} />
      <text x={barrierX} y={55 + warps.length * (TRACK_H + TRACK_GAP) + 8}
        textAnchor="middle" fontSize="8" fontWeight="700" fill={COLORS.orange}
        fontFamily={FONTS.mono}>__syncthreads()</text>
      <text x={barrierX} y={55 + warps.length * (TRACK_H + TRACK_GAP) + 22}
        textAnchor="middle" fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
        所有线程到达后才继续
      </text>

      {/* Without barrier - race condition */}
      <rect x={30} y={205} width={520} height={90} rx={6}
        fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
      <text x={W / 2} y={222} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>
        如果没有 __syncthreads():
      </text>
      <text x={W / 2} y={240} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        Warp 0 写完 smem 后立即读 → 但 Warp 3 还没写完 → 读到的是旧数据或未初始化数据
      </text>
      <text x={W / 2} y={256} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        Race Condition: 结果取决于 warp 执行顺序，不确定且不可复现
      </text>
      <text x={W / 2} y={275} textAnchor="middle" fontSize="8" fill={COLORS.red}
        fontFamily={FONTS.sans}>
        注意: 所有线程必须执行到同一个 __syncthreads() — 不能在 if/else 分支中不对称调用
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/BarrierTimeline.tsx
git commit -m "feat: add BarrierTimeline synchronization barrier diagram"
```

---

### Task 9: OccupancyCalculator — Interactive occupancy calculator

**Files:**
- Create: `src/components/interactive/OccupancyCalculator.tsx`

Interactive component: user inputs block size, registers per thread, shared memory per block. Outputs active blocks/SM, active warps, occupancy percentage with progress bar and bottleneck indicator.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/OccupancyCalculator.tsx`:

```tsx
// src/components/interactive/OccupancyCalculator.tsx
// Interactive: block size / regs / smem → occupancy calculation
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 300;

// Hopper SM limits (H100)
const SM = {
  maxWarps: 64,
  maxBlocks: 32,
  maxRegs: 65536,     // 256KB = 65536 × 32-bit regs
  maxSmem: 228 * 1024, // 228 KB (configurable max)
  label: 'H100 (Hopper SM)',
};

function calcOccupancy(blockSize: number, regsPerThread: number, smemPerBlock: number) {
  const warpsPerBlock = Math.ceil(blockSize / 32);

  // Limit from warps
  const blocksByWarps = Math.floor(SM.maxWarps / warpsPerBlock);

  // Limit from registers (regs allocated in granularity of 256 per warp)
  const regsPerWarp = Math.ceil(regsPerThread * 32 / 256) * 256;
  const totalRegsPerBlock = regsPerWarp * warpsPerBlock;
  const blocksByRegs = totalRegsPerBlock > 0 ? Math.floor(SM.maxRegs / totalRegsPerBlock) : SM.maxBlocks;

  // Limit from shared memory
  const blocksBySmem = smemPerBlock > 0 ? Math.floor(SM.maxSmem / smemPerBlock) : SM.maxBlocks;

  // Limit from max blocks per SM
  const activeBlocks = Math.min(blocksByWarps, blocksByRegs, blocksBySmem, SM.maxBlocks);
  const activeWarps = activeBlocks * warpsPerBlock;
  const occupancy = activeWarps / SM.maxWarps;

  // Determine bottleneck
  const limits = [
    { name: 'Warps', val: blocksByWarps },
    { name: 'Registers', val: blocksByRegs },
    { name: 'Shared Mem', val: blocksBySmem },
    { name: 'Max Blocks', val: SM.maxBlocks },
  ];
  const bottleneck = limits.reduce((min, l) => l.val < min.val ? l : min, limits[0]);

  return { warpsPerBlock, activeBlocks, activeWarps, occupancy, bottleneck: bottleneck.name, limits };
}

export default function OccupancyCalculator() {
  const [blockSize, setBlockSize] = useState(256);
  const [regsPerThread, setRegsPerThread] = useState(32);
  const [smemPerBlock, setSmemPerBlock] = useState(16384); // 16 KB

  const result = calcOccupancy(blockSize, regsPerThread, smemPerBlock);
  const pct = Math.round(result.occupancy * 100);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">Block Size (threads)</span>
          <select value={blockSize} onChange={e => setBlockSize(+e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-mono">
            {[64, 128, 256, 512, 1024].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">Registers / Thread</span>
          <input type="range" min={16} max={128} step={8} value={regsPerThread}
            onChange={e => setRegsPerThread(+e.target.value)} className="w-full" />
          <span className="font-mono text-primary-600">{regsPerThread}</span>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">Shared Mem / Block</span>
          <input type="range" min={0} max={65536} step={4096} value={smemPerBlock}
            onChange={e => setSmemPerBlock(+e.target.value)} className="w-full" />
          <span className="font-mono text-primary-600">{(smemPerBlock / 1024).toFixed(0)} KB</span>
        </label>
      </div>

      {/* Results SVG */}
      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Occupancy Calculator — {SM.label}
          </text>

          {/* Occupancy bar */}
          <rect x={40} y={35} width={500} height={30} rx={5}
            fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} />
          <rect x={40} y={35}
            width={Math.max(0, Math.min(500, 500 * result.occupancy))} height={30} rx={5}
            fill={pct >= 75 ? '#dcfce7' : pct >= 50 ? '#fef3c7' : '#fee2e2'}
            stroke={pct >= 75 ? COLORS.green : pct >= 50 ? COLORS.orange : COLORS.red}
            strokeWidth={1} />
          <text x={W / 2} y={54} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={pct >= 75 ? COLORS.green : pct >= 50 ? COLORS.orange : COLORS.red}
            fontFamily={FONTS.mono}>
            {pct}% Occupancy
          </text>

          {/* Key metrics */}
          <text x={W / 2} y={85} textAnchor="middle" fontSize="10" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            Active Blocks: {result.activeBlocks} | Active Warps: {result.activeWarps} / {SM.maxWarps} | Warps/Block: {result.warpsPerBlock}
          </text>

          {/* Per-resource limits */}
          <text x={40} y={112} fontSize="9" fontWeight="600" fill={COLORS.dark}
            fontFamily={FONTS.sans}>每种资源允许的最大 Blocks/SM:</text>

          {result.limits.map((l, i) => {
            const y = 128 + i * 30;
            const isBottleneck = l.name === result.bottleneck;
            const barW = Math.min(360, (l.val / SM.maxBlocks) * 360);
            return (
              <g key={i}>
                <text x={40} y={y + 12} fontSize="8" fontWeight={isBottleneck ? '700' : '400'}
                  fill={isBottleneck ? COLORS.red : COLORS.dark} fontFamily={FONTS.sans}>
                  {l.name}:
                </text>
                <rect x={130} y={y} width={360} height={18} rx={3}
                  fill="#f8fafc" stroke="#e2e8f0" strokeWidth={0.5} />
                <rect x={130} y={y} width={barW} height={18} rx={3}
                  fill={isBottleneck ? '#fee2e2' : '#dbeafe'}
                  stroke={isBottleneck ? COLORS.red : COLORS.primary} strokeWidth={0.5} />
                <text x={135} y={y + 12} fontSize="7.5"
                  fill={isBottleneck ? COLORS.red : COLORS.primary} fontFamily={FONTS.mono}>
                  {l.val} blocks {isBottleneck ? '← 瓶颈' : ''}
                </text>
              </g>
            );
          })}

          {/* Insight */}
          <rect x={40} y={SVG_H - 48} width={500} height={36} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={SVG_H - 26} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            Occupancy = active warps / max warps = {result.activeWarps} / {SM.maxWarps} = {pct}% — 瓶颈: {result.bottleneck}
          </text>
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/OccupancyCalculator.tsx
git commit -m "feat: add OccupancyCalculator interactive occupancy calculator"
```

---

### Task 10: CudaSyclCodeCompare — CUDA vs SYCL code comparison

**Files:**
- Create: `src/components/interactive/CudaSyclCodeCompare.tsx`

Static SVG: side-by-side CUDA kernel vs SYCL kernel for vector addition, with color-coded corresponding concepts.

- [ ] **Step 1: Create the component**

Create `src/components/interactive/CudaSyclCodeCompare.tsx`:

```tsx
// src/components/interactive/CudaSyclCodeCompare.tsx
// Static SVG: CUDA vs SYCL code side-by-side with color-coded concepts
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 440;

interface CodeLine {
  text: string;
  color?: string; // highlight color for matching concepts
  indent?: number;
}

const CUDA_CODE: CodeLine[] = [
  { text: '// CUDA Vector Addition', color: '#64748b' },
  { text: '__global__', color: COLORS.purple },
  { text: 'void vecadd(float* a, float* b,', indent: 0 },
  { text: '            float* c, int n) {', indent: 0 },
  { text: '  int i = threadIdx.x', color: COLORS.primary, indent: 1 },
  { text: '        + blockIdx.x', color: COLORS.green, indent: 1 },
  { text: '        * blockDim.x;', color: COLORS.orange, indent: 1 },
  { text: '  if (i < n)', indent: 1 },
  { text: '    c[i] = a[i] + b[i];', indent: 2 },
  { text: '}', indent: 0 },
  { text: '' },
  { text: '// Launch', color: '#64748b' },
  { text: 'vecadd<<<gridDim, blockDim>>>', color: COLORS.red },
  { text: '    (d_a, d_b, d_c, n);', indent: 1 },
];

const SYCL_CODE: CodeLine[] = [
  { text: '// SYCL Vector Addition', color: '#64748b' },
  { text: 'q.parallel_for(', color: COLORS.purple },
  { text: '  nd_range<1>(N, block_size),', indent: 1 },
  { text: '  [=](nd_item<1> item) {', indent: 1 },
  { text: '  int i = item.get_local_id(0)', color: COLORS.primary, indent: 1 },
  { text: '        + item.get_group(0)', color: COLORS.green, indent: 1 },
  { text: '        * item.get_local_range(0);', color: COLORS.orange, indent: 1 },
  { text: '  if (i < n)', indent: 1 },
  { text: '    c[i] = a[i] + b[i];', indent: 2 },
  { text: '});', indent: 0 },
  { text: '' },
  { text: '// Launch: 内置于 parallel_for', color: '#64748b' },
  { text: '// q 是 sycl::queue', color: COLORS.red },
  { text: '// 设备选择在 queue 创建时指定', color: '#64748b' },
];

const CODE_Y = 60;
const LINE_H = 15;
const COL_W = 270;

function CodeBlock({ x, y, lines, title, titleColor }: {
  x: number; y: number; lines: CodeLine[]; title: string; titleColor: string;
}) {
  return (
    <g>
      {/* Background */}
      <rect x={x} y={y} width={COL_W} height={lines.length * LINE_H + 10} rx={5}
        fill="#1e293b" stroke={titleColor} strokeWidth={1.5} />
      {/* Title */}
      <rect x={x} y={y - 22} width={COL_W} height={22} rx={5}
        fill={titleColor} />
      <rect x={x} y={y - 8} width={COL_W} height={8} fill={titleColor} />
      <text x={x + COL_W / 2} y={y - 8} textAnchor="middle" fontSize="9" fontWeight="700"
        fill="white" fontFamily={FONTS.sans}>{title}</text>

      {/* Code lines */}
      {lines.map((line, i) => {
        const indent = (line.indent || 0) * 12;
        return (
          <text key={i} x={x + 8 + indent} y={y + 14 + i * LINE_H}
            fontSize="7.5" fill={line.color || '#e2e8f0'} fontFamily={FONTS.mono}>
            {line.text}
          </text>
        );
      })}
    </g>
  );
}

// Concept mapping legend
const CONCEPTS = [
  { color: COLORS.primary, cuda: 'threadIdx.x', sycl: 'get_local_id(0)', meaning: 'Block/Work-group 内线程 ID' },
  { color: COLORS.green, cuda: 'blockIdx.x', sycl: 'get_group(0)', meaning: 'Block/Work-group ID' },
  { color: COLORS.orange, cuda: 'blockDim.x', sycl: 'get_local_range(0)', meaning: 'Block/Work-group 大小' },
  { color: COLORS.purple, cuda: '__global__', sycl: 'parallel_for', meaning: 'Kernel 入口' },
  { color: COLORS.red, cuda: '<<<grid, block>>>', sycl: 'sycl::queue', meaning: '启动 / 设备选择' },
];

export default function CudaSyclCodeCompare() {
  const legendY = CODE_Y + CUDA_CODE.length * LINE_H + 35;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CUDA vs SYCL code comparison">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        CUDA vs SYCL: 同一个向量加法 Kernel
      </text>
      <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        颜色标注对应概念 — 核心逻辑完全相同，只是 API 不同
      </text>

      {/* Code blocks */}
      <CodeBlock x={10} y={CODE_Y} lines={CUDA_CODE} title="CUDA C++" titleColor={COLORS.green} />
      <CodeBlock x={300} y={CODE_Y} lines={SYCL_CODE} title="SYCL (Intel DPC++)" titleColor={COLORS.primary} />

      {/* Concept mapping legend */}
      <text x={W / 2} y={legendY} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>概念映射</text>

      {CONCEPTS.map((c, i) => {
        const y = legendY + 16 + i * 16;
        return (
          <g key={i}>
            <rect x={20} y={y - 6} width={8} height={8} rx={1} fill={c.color} />
            <text x={35} y={y + 1} fontSize="7.5" fill={c.color} fontFamily={FONTS.mono}>
              {c.cuda}
            </text>
            <text x={185} y={y + 1} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
              ↔
            </text>
            <text x={200} y={y + 1} fontSize="7.5" fill={c.color} fontFamily={FONTS.mono}>
              {c.sycl}
            </text>
            <text x={400} y={y + 1} fontSize="7.5" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {c.meaning}
            </text>
          </g>
        );
      })}

      {/* Additional SYCL concepts */}
      <rect x={20} y={legendY + 100} width={540} height={38} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={legendY + 116} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        CUDA: __shared__ → SYCL: local accessor | CUDA: __syncthreads() → SYCL: item.barrier()
      </text>
      <text x={W / 2} y={legendY + 130} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        CUDA: warp (32 threads) → SYCL: sub-group (8/16/32, 宽度由硬件决定)
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/CudaSyclCodeCompare.tsx
git commit -m "feat: add CudaSyclCodeCompare CUDA vs SYCL code comparison"
```

---

### Task 11: MDX Article — cuda-programming-model.mdx

**Files:**
- Create: `src/content/articles/zh/cuda-programming-model.mdx`

The full article with 8 sections, importing all 10 components.

- [ ] **Step 1: Create the article**

Create `src/content/articles/zh/cuda-programming-model.mdx`:

```mdx
---
title: "CUDA 编程模型 — 从代码到硬件"
slug: cuda-programming-model
locale: zh
tags: [gpu, cuda, programming, simt, simd, intel, sycl]
prerequisites: [gpu-architecture]
difficulty: intermediate
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: website
    title: "CUDA C++ Programming Guide"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/"
  - type: website
    title: "NVIDIA Kernel Profiling Guide — Memory Coalescing"
    url: "https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/"
  - type: website
    title: "Intel oneAPI GPU Optimization Guide"
    url: "https://www.intel.com/content/www/us/en/docs/oneapi/optimization-guide-gpu/"
  - type: website
    title: "CUDA Occupancy Calculator"
    url: "https://docs.nvidia.com/cuda/cuda-occupancy-calculator/"
  - type: website
    title: "SYCL 2020 Specification"
    url: "https://registry.khronos.org/SYCL/specs/sycl-2020/"
---

import SimdVsSimtAnimation from '../../../components/interactive/SimdVsSimtAnimation.tsx';
import ExecutionModelCompare from '../../../components/interactive/ExecutionModelCompare.tsx';
import ThreadBlockGridViz from '../../../components/interactive/ThreadBlockGridViz.tsx';
import IndexCalculation from '../../../components/interactive/IndexCalculation.tsx';
import BlockToSmMapping from '../../../components/interactive/BlockToSmMapping.tsx';
import SharedMemoryBanks from '../../../components/interactive/SharedMemoryBanks.tsx';
import MemoryCoalescingDemo from '../../../components/interactive/MemoryCoalescingDemo.tsx';
import BarrierTimeline from '../../../components/interactive/BarrierTimeline.tsx';
import OccupancyCalculator from '../../../components/interactive/OccupancyCalculator.tsx';
import CudaSyclCodeCompare from '../../../components/interactive/CudaSyclCodeCompare.tsx';

在 [GPU Architecture](/zh/articles/gpu-architecture) 文章中，我们了解了 SM 内部结构 — 四个 Processing Block、Warp Scheduler、各类计算单元和内存层次。在 [矩阵加速单元](/zh/articles/matrix-acceleration) 文章中，我们看到了 Tensor Core 和 XMX 的 warp 级协作操作。

现在的问题是：**程序员如何控制这些硬件？** 本文从 CUDA 编程模型出发，理解 GPU 编程的核心抽象 — 线程层级、内存模型、同步机制，以及这些抽象如何映射到物理硬件。

## Section 1: SIMD vs SIMT — 两种并行执行模型

GPU 并行计算有两种主要模型，理解它们的区别是理解 CUDA 编程的起点。

**SIMD (Single Instruction Multiple Data)**：一条指令操作一个向量。程序员必须知道向量宽度（8/16/32），用 intrinsic 或编译器向量化来利用硬件。Intel iGPU 的 EU 内部就是 SIMD 驱动。

**SIMT (Single Instruction Multiple Threads)**：程序员写标量代码（看起来像单线程），硬件自动把 32 个线程打包成 warp 一起执行。程序员不需要管向量宽度。NVIDIA GPU 用的就是 SIMT。

<SimdVsSimtAnimation client:visible />

关键区别在于 **分支处理**：SIMT 对分支更友好 — warp divergence 只是效率损失，不需要程序员手动管理 mask。SIMD 的分支需要显式 mask 或 blend 指令。

<ExecutionModelCompare />

Intel iGPU 是一个有趣的混合体：底层硬件是 SIMD 驱动（EU Thread 执行 8/16-wide 向量操作），但 SYCL/OpenCL 编程层提供了接近 SIMT 的 work-item 抽象。Sub-group 操作暴露了底层 SIMD 宽度，是 Intel GPU 编程的关键工具。

---

## Section 2: Thread → Block → Grid

CUDA 用三级线程层级组织并行计算：

- **Thread（线程）**：最小执行单元，每个线程执行相同的 kernel 代码，但处理不同的数据
- **Block（线程块）**：一组线程，共享 Shared Memory，可通过 `__syncthreads()` 同步
- **Grid（网格）**：所有 Block 的集合，由一次 kernel launch 产生

每个线程通过 `threadIdx`（Block 内位置）和 `blockIdx`（Grid 内 Block 位置）确定自己的身份，配合 `blockDim`（Block 尺寸）计算全局数据位置。

<ThreadBlockGridViz client:visible />

Block 和 Grid 支持 1D/2D/3D 维度 — 二维索引映射到矩阵操作更自然（`threadIdx.x` 对应列，`threadIdx.y` 对应行）。

### 全局索引计算

最基本的 CUDA 编程模式：每个线程计算自己负责的全局数据位置。

<IndexCalculation client:visible />

```c
// 向量加法 kernel — 最简单的 CUDA 程序
__global__ void vecadd(float* a, float* b, float* c, int n) {
    int i = threadIdx.x + blockIdx.x * blockDim.x;
    if (i < n) c[i] = a[i] + b[i];
}
// Launch: vecadd<<<(n+255)/256, 256>>>(d_a, d_b, d_c, n);
```

---

## Section 3: 逻辑到物理映射

Thread → Block → Grid 是**逻辑**结构。程序员定义它，但不控制它如何映射到物理硬件。

<BlockToSmMapping client:visible />

关键要点：
- **Block 到 SM 的分配由 runtime 决定** — 顺序不确定，程序不应假设任何执行顺序
- **一个 SM 可以同时容纳多个 Block** — 受限于 register 用量、shared memory 用量、warp 数量
- **Block 内的 Thread 被硬件打包为 Warp** — thread 0-31 = warp 0, thread 32-63 = warp 1, ...
- **blockDim 应该是 32 的倍数** — 否则最后一个 warp 有空闲线程，浪费计算资源

---

## Section 4: Shared Memory

`__shared__` 声明的内存是 Block 级别的快速存储（在 SM 的 L1/SRAM 中），Block 内所有线程共享，Block 结束时释放。

用途：
- **线程间通信**：一个线程写，其他线程读
- **数据预加载**：从 HBM 加载一次到 shared memory，block 内多个线程复用

### Bank 结构

Shared memory 被分为 **32 个 bank**，连续 4 字节映射到连续 bank。一个 warp 的 32 个线程同时访问不同 bank 时可以一拍完成；访问同一 bank 的不同地址时会产生 **bank conflict**，必须串行化。

<SharedMemoryBanks client:visible />

避免 bank conflict 的最简单方法：stride=1 的顺序访问天然无冲突。当 stride 是 2 的幂时容易冲突，可用 padding 技巧（`tile[32][33]` 而非 `tile[32][32]`）打破对齐。

---

## Section 5: Memory Coalescing

全局内存（HBM）访问以 32 字节或 128 字节 transaction 为单位。一个 warp 的 32 个线程访问连续地址时，硬件可以合并为最少的 transaction — 这就是 **memory coalescing**。

<MemoryCoalescingDemo client:visible />

实际影响：
- **行优先访问矩阵的同一行**：`M[row][tid]` — 地址连续，天然 coalesced
- **列优先访问矩阵**：`M[tid][col]` — stride = 行宽，严重 uncoalesced
- 这是为什么矩阵乘法需要 **tiling 到 shared memory** — 先 coalesced 加载到 shared memory，再在 shared memory 中任意 stride 访问（shared memory 的 bank conflict 比 HBM 的 uncoalesced access 便宜得多）

---

## Section 6: 同步与 Barrier

`__syncthreads()` 是 Block 内的 barrier：所有线程都到达这个点后才能继续执行。

<BarrierTimeline />

典型使用场景：写 shared memory → `__syncthreads()` → 读 shared memory。没有 barrier 的话，快速 warp 可能读到慢速 warp 还没写完的数据 — **race condition**。

注意事项：
- 所有线程**必须执行到同一个 `__syncthreads()`** — 不能在 if/else 分支中不对称调用（否则死锁）
- Warp 内线程是硬件锁步执行的，隐式同步 — 但显式用 `__syncwarp()` 更安全（未来架构可能改变锁步保证）
- `__syncthreads()` 只同步 Block 内 — **Block 之间没有直接同步机制**（这是 GPU 编程模型的核心约束）

---

## Section 7: Occupancy

**Occupancy** = SM 中活跃 warp 数 / SM 最大 warp 数。更高的 occupancy 意味着更多 warp 可以在内存延迟时切换执行，更好地隐藏延迟。

Occupancy 受三个因素限制：

1. **Warp 数量**：blockDim / 32 个 warp per block × blocks per SM
2. **Register 用量**：每线程用越多 register，SM 能容纳的 block 越少
3. **Shared memory 用量**：每 block 用越多 shared memory，SM 能容纳的 block 越少

<OccupancyCalculator client:visible />

高 occupancy 不总是更好 — 有时低 occupancy + 高数据复用（大 tile 占满 shared memory 和 register）反而更快。但通常 occupancy 是一个好的优化起点。

编译时用 `--ptxas-options=-v` 可以查看 kernel 的 register 和 shared memory 使用量。

---

## Section 8: Intel iGPU 编程要点

CUDA 是 NVIDIA 专有的。Intel GPU 用 **SYCL / DPC++**，基于标准 C++，概念上与 CUDA 一一对应：

<CudaSyclCodeCompare />

核心术语映射：
- **work-item** ≈ thread — 最小执行单元
- **work-group** ≈ block — 线程组，共享 SLM
- **sub-group** ≈ warp — 但宽度可能是 8/16/32（不固定为 32）
- **SLM (Shared Local Memory)** ≈ shared memory — 用法类似

Sub-group 是 Intel GPU 编程的关键 — 它直接暴露了底层 SIMD 宽度。`sub_group::shuffle` 和 `sub_group::reduce` 对应 NVIDIA 的 warp shuffle 操作。

XMX 矩阵操作通过 SYCL `joint_matrix` API 或低层 ESIMD `dpas` 指令访问，对应 NVIDIA 的 `wmma` / `mma.sync`（详见 [矩阵加速单元](/zh/articles/matrix-acceleration) 文章）。

---

## 总结

CUDA 编程模型的核心抽象：

1. **SIMT 执行模型** — 写标量代码，硬件并行。Warp divergence 是效率问题而非正确性问题
2. **三级线程层级** — Thread → Block → Grid，Block 是资源分配和同步的基本单位
3. **内存层级** — Register（私有）→ Shared Memory（Block 共享，快）→ Global/HBM（全局，慢）
4. **Coalescing + Bank** — 全局内存要连续访问，shared memory 要避免 bank conflict
5. **Occupancy** — warp 数量 × 数据复用 = 性能，三种资源（warp / register / shared memory）中最紧的决定上限

下一篇文章将把这些概念付诸实践 — GEMM 优化，从 Naive 实现到 Tensor Core GEMM，逐步将矩阵乘法性能推到接近硬件峰值。
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`

Expected: 52 pages built, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/cuda-programming-model.mdx
git commit -m "feat: add CUDA Programming Model article with 10 interactive components"
```

---

### Task 12: Update learning path YAML

**Files:**
- Modify: `src/content/paths/ai-compute-stack.yaml`

Add `cuda-programming-model` after `matrix-acceleration`.

- [ ] **Step 1: Update YAML**

Edit `src/content/paths/ai-compute-stack.yaml` to add the new article:

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
  - cuda-programming-model
```

- [ ] **Step 2: Run validate and build**

```bash
npm run validate
npm run build 2>&1 | tail -5
```

Expected: validation passes, 52 pages built.

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/ai-compute-stack.yaml
git commit -m "feat: add cuda-programming-model to AI Compute Stack learning path"
```
