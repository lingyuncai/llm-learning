# vLLM + SGLang 推理引擎深度解析 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 5-article learning path covering vLLM and SGLang inference engine internals with 28 interactive components.

**Architecture:** Each article is an MDX file with imported React/SVG interactive components. Components use the project's shared color system (`COLORS`, `FONTS`), `const W = 580` convention, and StepNavigator primitive for multi-step visualizations. All components are pure client-side React with no external dependencies beyond Motion for animations.

**Tech Stack:** Astro 5 + MDX, React, SVG, Motion (`motion/react`), TypeScript, Tailwind CSS

**Conventions:**
- Components: `import { COLORS, FONTS } from './shared/colors'`, `const W = 580`, `export default function ComponentName()`
- StepNavigator: `import StepNavigator from '../primitives/StepNavigator'`, accepts `steps: { title: string; content: ReactNode }[]`
- MDX imports: `import Foo from '../../../components/interactive/Foo.tsx'`
- Interactive components in MDX: `<Foo client:visible />`
- Static SVG components in MDX: `<Foo />` (no `client:visible`)
- All text in Chinese, technical terms in English

---

## Task 1: InferenceEngineRadar

**Files:**
- Create: `src/components/interactive/InferenceEngineRadar.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface EngineData {
  name: string;
  color: string;
  scores: number[]; // 0-1 for each axis
}

const AXES = ['吞吐量', '延迟', '易用性', '生态', '灵活性'];
const ENGINES: EngineData[] = [
  { name: 'vLLM',         color: COLORS.primary, scores: [0.95, 0.75, 0.70, 0.90, 0.60] },
  { name: 'SGLang',       color: COLORS.green,   scores: [0.90, 0.80, 0.60, 0.65, 0.95] },
  { name: 'Ollama',       color: COLORS.orange,  scores: [0.40, 0.85, 0.95, 0.80, 0.50] },
  { name: 'TensorRT-LLM', color: COLORS.purple,  scores: [0.98, 0.90, 0.30, 0.55, 0.35] },
];

const cx = W / 2;
const cy = 210;
const R = 130;

function polarToXY(angle: number, r: number): [number, number] {
  const a = angle - Math.PI / 2; // start from top
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export default function InferenceEngineRadar() {
  const [active, setActive] = useState<number | null>(null);

  const angleStep = (2 * Math.PI) / AXES.length;

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={cx} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        推理引擎特性对比
      </text>
      <text x={cx} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击引擎名称查看各维度评分
      </text>

      {/* Grid rings */}
      {rings.map((scale) => {
        const points = AXES.map((_, i) => polarToXY(i * angleStep, R * scale));
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
        return <path key={scale} d={d} fill="none" stroke={COLORS.light} strokeWidth="1" />;
      })}

      {/* Axis lines + labels */}
      {AXES.map((label, i) => {
        const angle = i * angleStep;
        const [ex, ey] = polarToXY(angle, R + 5);
        const [lx, ly] = polarToXY(angle, R + 22);
        return (
          <g key={label}>
            <line x1={cx} y1={cy} x2={ex} y2={ey}
              stroke={COLORS.light} strokeWidth="1" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10"
              fontWeight="500" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {label}
            </text>
          </g>
        );
      })}

      {/* Engine polygons */}
      {ENGINES.map((engine, ei) => {
        const isActive = active === ei;
        const show = active === null || isActive;
        const points = engine.scores.map((s, i) => polarToXY(i * angleStep, R * s));
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
        return (
          <path key={engine.name} d={d}
            fill={engine.color} fillOpacity={isActive ? 0.25 : 0.1}
            stroke={engine.color} strokeWidth={isActive ? 2.5 : 1.5}
            opacity={show ? 1 : 0.15} />
        );
      })}

      {/* Score dots when active */}
      {active !== null && ENGINES[active].scores.map((s, i) => {
        const [dx, dy] = polarToXY(i * angleStep, R * s);
        return (
          <g key={`dot-${i}`}>
            <circle cx={dx} cy={dy} r={4}
              fill={ENGINES[active].color} stroke="#fff" strokeWidth="1.5" />
            <text x={dx} y={dy - 8} textAnchor="middle" fontSize="9"
              fontWeight="600" fill={ENGINES[active].color} fontFamily={FONTS.mono}>
              {(s * 100).toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Legend / buttons */}
      {ENGINES.map((engine, i) => {
        const bx = 40 + i * 135;
        const by = H - 40;
        const isActive = active === i;
        return (
          <g key={`btn-${i}`} onClick={() => setActive(active === i ? null : i)} cursor="pointer">
            <rect x={bx} y={by} width={120} height={26} rx={13}
              fill={isActive ? engine.color : COLORS.bgAlt}
              stroke={engine.color} strokeWidth="1.5" />
            <text x={bx + 60} y={by + 17} textAnchor="middle" fontSize="11"
              fontWeight="600" fill={isActive ? '#fff' : engine.color} fontFamily={FONTS.sans}>
              {engine.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 2: DesignPhilosophyMap

**Files:**
- Create: `src/components/interactive/DesignPhilosophyMap.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface EnginePos {
  name: string;
  x: number;
  y: number;
  color: string;
  desc: string;
}

// Triangle vertices: top = throughput, bottom-left = programmable, bottom-right = ease-of-use
const TX = W / 2, TY = 60;   // throughput (top)
const PX = 100,   PY = 310;  // programmable (bottom-left)
const EX = 480,   EY = 310;  // ease-of-use (bottom-right)

const ENGINES: EnginePos[] = [
  { name: 'TensorRT-LLM', x: TX + 30,  y: TY + 50,  color: COLORS.purple, desc: '极致吞吐' },
  { name: 'vLLM',         x: TX - 40,  y: TY + 110, color: COLORS.primary, desc: '吞吐优先' },
  { name: 'SGLang',       x: PX + 100, y: PY - 80,  color: COLORS.green,   desc: '可编程+高性能' },
  { name: 'Ollama',       x: EX - 80,  y: EY - 50,  color: COLORS.orange,  desc: '易用优先' },
];

export default function DesignPhilosophyMap() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        推理引擎设计哲学定位
      </text>

      {/* Triangle */}
      <polygon points={`${TX},${TY} ${PX},${PY} ${EX},${EY}`}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1.5" />

      {/* Vertex labels */}
      <text x={TX} y={TY - 10} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>吞吐量</text>
      <text x={PX - 10} y={PY + 20} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>可编程性</text>
      <text x={EX + 10} y={EY + 20} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>易用性</text>

      {/* Engine dots + labels */}
      {ENGINES.map((e) => (
        <g key={e.name}>
          <circle cx={e.x} cy={e.y} r={8}
            fill={e.color} opacity={0.9} stroke="#fff" strokeWidth="2" />
          <text x={e.x} y={e.y - 14} textAnchor="middle" fontSize="11"
            fontWeight="700" fill={e.color} fontFamily={FONTS.sans}>
            {e.name}
          </text>
          <text x={e.x} y={e.y + 22} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {e.desc}
          </text>
        </g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 3: RequestLifecycleCompare

**Files:**
- Create: `src/components/interactive/RequestLifecycleCompare.tsx`

- [ ] **Step 1: Create the component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface StageProps {
  stages: { label: string; color: string; desc: string }[];
  title: string;
}

function Pipeline({ stages, title }: StageProps) {
  const stageW = (W - 60) / stages.length;
  const stageH = 50;
  const y = 50;
  return (
    <svg viewBox={`0 0 ${W} 140`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
      {stages.map((s, i) => {
        const x = 30 + i * stageW;
        return (
          <g key={i}>
            <rect x={x + 2} y={y} width={stageW - 4} height={stageH} rx={6}
              fill={s.color} opacity={0.15} stroke={s.color} strokeWidth="1.5" />
            <text x={x + stageW / 2} y={y + 22} textAnchor="middle" fontSize="10"
              fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>{s.label}</text>
            <text x={x + stageW / 2} y={y + 38} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily={FONTS.sans}>{s.desc}</text>
            {i < stages.length - 1 && (
              <text x={x + stageW - 1} y={y + stageH / 2 + 4} textAnchor="middle"
                fontSize="14" fill={COLORS.mid}>→</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function RequestLifecycleCompare() {
  const steps = [
    {
      title: '云端 Serving (vLLM)',
      content: (
        <Pipeline title="vLLM 请求流程 — 吞吐优先" stages={[
          { label: 'API 请求', color: COLORS.primary, desc: 'OpenAI 兼容' },
          { label: 'Scheduler', color: COLORS.orange, desc: '调度 + 批处理' },
          { label: 'PagedAttention', color: COLORS.green, desc: '分页 KV 管理' },
          { label: 'GPU 推理', color: COLORS.purple, desc: 'Batch decode' },
          { label: 'Stream 输出', color: COLORS.primary, desc: 'SSE 流式返回' },
        ]} />
      ),
    },
    {
      title: '本地推理 (Ollama)',
      content: (
        <Pipeline title="Ollama 请求流程 — 易用优先" stages={[
          { label: 'CLI / API', color: COLORS.orange, desc: 'ollama run' },
          { label: '模型加载', color: COLORS.primary, desc: 'GGUF 量化' },
          { label: 'llama.cpp', color: COLORS.green, desc: '单请求推理' },
          { label: '输出', color: COLORS.purple, desc: '逐 token 打印' },
        ]} />
      ),
    },
    {
      title: '可编程管道 (SGLang)',
      content: (
        <Pipeline title="SGLang 请求流程 — 可编程优先" stages={[
          { label: 'DSL 程序', color: COLORS.green, desc: 'gen/fork/join' },
          { label: 'IR 编排', color: COLORS.primary, desc: '执行计划优化' },
          { label: 'RadixAttention', color: COLORS.orange, desc: '前缀缓存复用' },
          { label: 'GPU 推理', color: COLORS.purple, desc: '约束解码' },
          { label: '结构化输出', color: COLORS.green, desc: 'JSON/Schema' },
        ]} />
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 4: StaticVsDynamicBatching

**Files:**
- Create: `src/components/interactive/StaticVsDynamicBatching.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface Request {
  id: string;
  start: number;
  prefill: number;
  decode: number;
  color: string;
}

const REQUESTS: Request[] = [
  { id: 'R1', start: 0, prefill: 2, decode: 3,  color: COLORS.primary },
  { id: 'R2', start: 0, prefill: 1, decode: 6,  color: COLORS.green },
  { id: 'R3', start: 0, prefill: 2, decode: 2,  color: COLORS.orange },
  { id: 'R4', start: 0, prefill: 1, decode: 10, color: COLORS.purple },
];

const TICK_W = 38;
const BAR_H = 28;
const GAP = 6;

export default function StaticVsDynamicBatching() {
  const [mode, setMode] = useState<'static' | 'continuous'>('static');

  const maxLen = Math.max(...REQUESTS.map(r => r.prefill + r.decode));
  const ticks = Array.from({ length: maxLen + 2 }, (_, i) => i);

  const chartX = 60;
  const chartY = 90;

  // Static: all requests wait until the longest finishes
  // Continuous: each request releases when done, new work can fill in
  const staticEnd = maxLen;
  const continuousEnds = REQUESTS.map(r => r.prefill + r.decode);

  // Waiting requests that could fill freed slots (simplified model)
  const waitingReqs: Request[] = [
    { id: 'R5', start: 0, prefill: 1, decode: 3, color: '#00838f' },
    { id: 'R6', start: 0, prefill: 1, decode: 2, color: '#ef6c00' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Static Batching vs Continuous Batching
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        切换查看两种批处理策略的时间线差异
      </text>

      {/* Toggle */}
      {(['static', 'continuous'] as const).map((m, i) => (
        <g key={m} onClick={() => setMode(m)} cursor="pointer">
          <rect x={170 + i * 140} y={50} width={125} height={26} rx={13}
            fill={mode === m ? COLORS.primary : COLORS.bgAlt}
            stroke={mode === m ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={232 + i * 140} y={67} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={mode === m ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {m === 'static' ? 'Static Batching' : 'Continuous Batching'}
          </text>
        </g>
      ))}

      {/* Time axis */}
      <line x1={chartX} y1={chartY + REQUESTS.length * (BAR_H + GAP) + 20}
        x2={chartX + ticks.length * TICK_W}
        y2={chartY + REQUESTS.length * (BAR_H + GAP) + 20}
        stroke={COLORS.mid} strokeWidth="1" />
      {ticks.map(t => {
        const x = chartX + t * TICK_W;
        const axisY = chartY + REQUESTS.length * (BAR_H + GAP) + 20;
        return (
          <g key={t}>
            <line x1={x} y1={axisY} x2={x} y2={axisY + 5} stroke={COLORS.mid} strokeWidth="1" />
            <text x={x} y={axisY + 16} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily={FONTS.mono}>{t}</text>
          </g>
        );
      })}
      <text x={chartX + ticks.length * TICK_W / 2}
        y={chartY + REQUESTS.length * (BAR_H + GAP) + 36}
        textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
        Iteration (时间步)
      </text>

      {/* Request bars */}
      {REQUESTS.map((req, ri) => {
        const y = chartY + ri * (BAR_H + GAP);
        const totalLen = req.prefill + req.decode;
        const endX = mode === 'static' ? staticEnd : totalLen;
        const idleLen = mode === 'static' ? staticEnd - totalLen : 0;

        return (
          <g key={req.id}>
            <text x={chartX - 8} y={y + BAR_H / 2 + 4} textAnchor="end"
              fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
              {req.id}
            </text>
            {/* Prefill */}
            <rect x={chartX} y={y} width={req.prefill * TICK_W} height={BAR_H} rx={4}
              fill={req.color} opacity={0.8} />
            <text x={chartX + req.prefill * TICK_W / 2} y={y + BAR_H / 2 + 4}
              textAnchor="middle" fontSize="8" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
              Prefill
            </text>
            {/* Decode */}
            <rect x={chartX + req.prefill * TICK_W} y={y}
              width={req.decode * TICK_W} height={BAR_H} rx={4}
              fill={req.color} opacity={0.5} />
            <text x={chartX + (req.prefill + req.decode / 2) * TICK_W} y={y + BAR_H / 2 + 4}
              textAnchor="middle" fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              Decode
            </text>
            {/* Idle time (static only) */}
            {idleLen > 0 && (
              <>
                <rect x={chartX + totalLen * TICK_W} y={y}
                  width={idleLen * TICK_W} height={BAR_H} rx={4}
                  fill={COLORS.waste} opacity={0.6} stroke={COLORS.red} strokeWidth="1"
                  strokeDasharray="3,2" />
                <text x={chartX + (totalLen + idleLen / 2) * TICK_W} y={y + BAR_H / 2 + 4}
                  textAnchor="middle" fontSize="8" fill={COLORS.red} fontFamily={FONTS.sans}>
                  空闲等待
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Continuous: show new requests filling in */}
      {mode === 'continuous' && waitingReqs.map((req, i) => {
        // Find earliest freed slot
        const sortedEnds = [...continuousEnds].sort((a, b) => a - b);
        const slotStart = sortedEnds[i] || sortedEnds[sortedEnds.length - 1];
        const y = chartY + (continuousEnds.indexOf(sortedEnds[i])) * (BAR_H + GAP);
        if (i >= sortedEnds.length) return null;
        return (
          <g key={`new-${req.id}`}>
            <rect x={chartX + slotStart * TICK_W} y={y}
              width={(req.prefill + req.decode) * TICK_W} height={BAR_H} rx={4}
              fill={req.color} opacity={0.4} stroke={req.color}
              strokeWidth="1" strokeDasharray="4,2" />
            <text x={chartX + (slotStart + (req.prefill + req.decode) / 2) * TICK_W}
              y={y + BAR_H / 2 + 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={req.color} fontFamily={FONTS.sans}>
              {req.id} (新请求)
            </text>
          </g>
        );
      })}

      {/* Summary */}
      <rect x={60} y={H - 50} width={W - 120} height={38} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 27} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {mode === 'static'
          ? 'Static Batching：所有请求必须等最长的完成 → GPU 利用率低、红色区域全是浪费'
          : 'Continuous Batching：完成即释放，新请求立即填入 → GPU 利用率高、无空闲等待'}
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 5: TechEvolutionTimeline

**Files:**
- Create: `src/components/interactive/TechEvolutionTimeline.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

interface Milestone {
  date: string;
  label: string;
  desc: string;
  engine: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  { date: '2022.06', label: 'Orca', desc: 'Iteration-level scheduling 开创 continuous batching', engine: 'Microsoft', color: COLORS.primary },
  { date: '2023.06', label: 'vLLM', desc: 'PagedAttention — 虚拟内存思想管理 KV Cache', engine: 'UC Berkeley', color: COLORS.primary },
  { date: '2023.10', label: 'SGLang', desc: 'RadixAttention + 结构化 LLM 编程模型', engine: 'LMSYS', color: COLORS.green },
  { date: '2023.12', label: 'TRT-LLM', desc: 'NVIDIA 官方推理框架，FP8 + inflight batching', engine: 'NVIDIA', color: COLORS.purple },
  { date: '2024.03', label: 'Chunked Prefill', desc: 'Sarathi: prefill 分块与 decode 混合调度', engine: 'Microsoft', color: COLORS.orange },
  { date: '2024.06', label: 'SGLang FSM', desc: 'Compressed FSM — 结构化输出 jump-forward 加速', engine: 'LMSYS', color: COLORS.green },
  { date: '2024.09', label: 'vLLM v2', desc: '前缀缓存、多模态、disaggregated prefill', engine: 'vLLM Team', color: COLORS.primary },
  { date: '2025.01', label: '框架融合', desc: '各引擎互相吸收对方核心技术，功能趋同', engine: '社区', color: COLORS.mid },
];

const TIMELINE_X = 100;
const TIMELINE_W = 400;
const TIMELINE_Y = 70;
const ITEM_H = 32;

export default function TechEvolutionTimeline() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        LLM 推理引擎技术演进
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        Hover 查看里程碑详情
      </text>

      {/* Vertical timeline line */}
      <line x1={TIMELINE_X} y1={TIMELINE_Y}
        x2={TIMELINE_X} y2={TIMELINE_Y + MILESTONES.length * ITEM_H}
        stroke={COLORS.light} strokeWidth="2" />

      {/* Milestones */}
      {MILESTONES.map((m, i) => {
        const y = TIMELINE_Y + i * ITEM_H;
        const isHovered = hovered === i;
        return (
          <g key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            cursor="pointer">
            {/* Background highlight */}
            {isHovered && (
              <rect x={TIMELINE_X - 10} y={y - 2} width={TIMELINE_W + 20} height={ITEM_H}
                fill={COLORS.highlight} rx={4} />
            )}
            {/* Dot */}
            <circle cx={TIMELINE_X} cy={y + ITEM_H / 2} r={5}
              fill={m.color} stroke="#fff" strokeWidth="2" />
            {/* Date */}
            <text x={TIMELINE_X - 15} y={y + ITEM_H / 2 + 4} textAnchor="end"
              fontSize="9" fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {m.date}
            </text>
            {/* Label + engine */}
            <text x={TIMELINE_X + 18} y={y + ITEM_H / 2 + 4} fontSize="11"
              fontWeight={isHovered ? '700' : '500'} fill={m.color} fontFamily={FONTS.sans}>
              {m.label}
            </text>
            <text x={TIMELINE_X + 18 + m.label.length * 8 + 10} y={y + ITEM_H / 2 + 4}
              fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
              ({m.engine})
            </text>
          </g>
        );
      })}

      {/* Detail box for hovered item */}
      {hovered !== null && (
        <g>
          <rect x={80} y={H - 60} width={W - 160} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={MILESTONES[hovered].color} strokeWidth="1.5" />
          <text x={W / 2} y={H - 36} textAnchor="middle" fontSize="11"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {MILESTONES[hovered].desc}
          </text>
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 6: EngineDecisionTree

**Files:**
- Create: `src/components/interactive/EngineDecisionTree.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface Question {
  text: string;
  options: { label: string; next: number | string }[]; // number = next question index, string = result engine
}

const QUESTIONS: Question[] = [
  {
    text: '你的部署环境？',
    options: [
      { label: '云端 GPU 服务器', next: 1 },
      { label: '本地 / 笔记本', next: 'Ollama' },
    ],
  },
  {
    text: '需要结构化输出（JSON/Schema）吗？',
    options: [
      { label: '是，核心需求', next: 'SGLang' },
      { label: '不需要 / 偶尔', next: 2 },
    ],
  },
  {
    text: '硬件是 NVIDIA 最新卡（H100/B200）吗？',
    options: [
      { label: '是，且要极致性能', next: 'TensorRT-LLM' },
      { label: '各种 GPU / 通用', next: 'vLLM' },
    ],
  },
];

const RESULTS: Record<string, { color: string; desc: string }> = {
  'vLLM':         { color: COLORS.primary, desc: '生态最成熟，社区最大，兼容性最广的云端 serving 方案' },
  'SGLang':       { color: COLORS.green,   desc: '最强结构化输出 + 可编程推理，适合复杂 LLM 应用' },
  'Ollama':       { color: COLORS.orange,  desc: '一键安装，开箱即用，最适合本地开发和实验' },
  'TensorRT-LLM': { color: COLORS.purple,  desc: 'NVIDIA 原生优化，H100/B200 上的极致吞吐' },
};

export default function EngineDecisionTree() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<{ q: number; a: string }[]>([]);

  const handleChoice = (option: { label: string; next: number | string }) => {
    const newHistory = [...history, { q: step, a: option.label }];
    setHistory(newHistory);
    if (typeof option.next === 'string') {
      setResult(option.next);
    } else {
      setStep(option.next);
    }
  };

  const reset = () => { setStep(0); setResult(null); setHistory([]); };

  const q = QUESTIONS[step];
  const boxY = 60;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        推理引擎选型指南
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        回答几个问题，找到最适合你的引擎
      </text>

      {/* History breadcrumbs */}
      {history.map((h, i) => {
        const y = boxY + i * 50;
        return (
          <g key={i}>
            <rect x={40} y={y} width={W - 80} height={40} rx={6}
              fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x={60} y={y + 17} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
              Q{i + 1}: {QUESTIONS[h.q].text}
            </text>
            <text x={60} y={y + 32} fontSize="10" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans}>
              → {h.a}
            </text>
          </g>
        );
      })}

      {/* Current question or result */}
      {result === null ? (
        <g>
          <rect x={40} y={boxY + history.length * 50} width={W - 80} height={40} rx={6}
            fill="#fff" stroke={COLORS.primary} strokeWidth="2" />
          <text x={W / 2} y={boxY + history.length * 50 + 25} textAnchor="middle"
            fontSize="12" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
            Q{history.length + 1}: {q.text}
          </text>
          {q.options.map((opt, i) => {
            const btnY = boxY + history.length * 50 + 55 + i * 40;
            return (
              <g key={i} onClick={() => handleChoice(opt)} cursor="pointer">
                <rect x={100} y={btnY} width={W - 200} height={32} rx={16}
                  fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
                <text x={W / 2} y={btnY + 21} textAnchor="middle" fontSize="11"
                  fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
                  {opt.label}
                </text>
              </g>
            );
          })}
        </g>
      ) : (
        <g>
          {/* Result card */}
          {(() => {
            const r = RESULTS[result];
            const cardY = boxY + history.length * 50 + 10;
            return (
              <>
                <rect x={40} y={cardY} width={W - 80} height={80} rx={8}
                  fill={r.color} opacity={0.1} stroke={r.color} strokeWidth="2" />
                <text x={W / 2} y={cardY + 28} textAnchor="middle"
                  fontSize="18" fontWeight="700" fill={r.color} fontFamily={FONTS.sans}>
                  推荐：{result}
                </text>
                <text x={W / 2} y={cardY + 52} textAnchor="middle"
                  fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
                  {r.desc}
                </text>
                <g onClick={reset} cursor="pointer">
                  <rect x={W / 2 - 45} y={cardY + 90} width={90} height={28} rx={14}
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
                  <text x={W / 2} y={cardY + 108} textAnchor="middle"
                    fontSize="10" fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>
                    重新选择
                  </text>
                </g>
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 7: Article 1 — inference-engine-landscape.mdx

**Files:**
- Create: `src/content/articles/zh/inference-engine-landscape.mdx`

- [ ] **Step 1: Create the article**

```mdx
---
title: "LLM 推理引擎全景：vLLM、SGLang、Ollama 与 TensorRT-LLM"
slug: inference-engine-landscape
locale: zh
tags: [inference, vllm, sglang, ollama, tensorrt-llm]
difficulty: intermediate
created: "2026-04-05"
updated: "2026-04-05"
references:
  - type: paper
    title: "Efficient Memory Management for Large Language Model Serving with PagedAttention"
    url: "https://arxiv.org/abs/2309.06180"
  - type: paper
    title: "SGLang: Efficient Execution of Structured Language Model Programs"
    url: "https://arxiv.org/abs/2312.07104"
  - type: website
    title: "NVIDIA TensorRT-LLM Documentation"
    url: "https://nvidia.github.io/TensorRT-LLM/"
  - type: website
    title: "Ollama GitHub Repository"
    url: "https://github.com/ollama/ollama"
---

import InferenceEngineRadar from '../../../components/interactive/InferenceEngineRadar.tsx';
import DesignPhilosophyMap from '../../../components/interactive/DesignPhilosophyMap.tsx';
import RequestLifecycleCompare from '../../../components/interactive/RequestLifecycleCompare.tsx';
import StaticVsDynamicBatching from '../../../components/interactive/StaticVsDynamicBatching.tsx';
import TechEvolutionTimeline from '../../../components/interactive/TechEvolutionTimeline.tsx';
import EngineDecisionTree from '../../../components/interactive/EngineDecisionTree.tsx';

## 为什么需要推理引擎

直接用 `transformers.generate()` 跑 LLM 推理有三个致命瓶颈：

1. **内存浪费**：为每个请求预分配 max_seq_len 的 KV Cache，实际使用往往不到一半
2. **无法并发**：一个请求占满 GPU，其他请求只能排队
3. **吞吐量低**：没有批处理优化，GPU 算力大部分时间在空转

推理引擎的核心任务就是解决这三个问题：高效管理内存、智能调度请求、最大化 GPU 利用率。

## 四大引擎与设计哲学

当前主流的四大 LLM 推理引擎各有侧重：

**vLLM** (UC Berkeley, 2023)：以 PagedAttention 起家，核心目标是最大化 serving 吞吐量。借鉴操作系统虚拟内存的思想管理 KV Cache，消除内存碎片。生态最成熟，社区最大，OpenAI 兼容 API 使其成为云端部署的默认选择。

**SGLang** (LMSYS, 2023)：强调可编程性与高性能的结合。RadixAttention 提供比 vLLM 更灵活的前缀缓存，独创的 DSL 编程模型支持复杂的多步推理流水线，Compressed FSM 实现最快的结构化输出。适合需要精确格式控制的复杂 LLM 应用。

**Ollama + llama.cpp**：本地优先、易用优先。一行命令安装运行，GGUF 量化格式支持 CPU 和消费级 GPU。牺牲极致吞吐换取开箱即用的体验，是个人开发者和本地实验的首选。

**TensorRT-LLM** (NVIDIA)：NVIDIA 硬件生态的深度绑定。FP8 量化、inflight batching、custom kernels，在 H100/B200 上榨取最后一滴性能。代价是灵活性低、学习曲线陡、仅支持 NVIDIA GPU。

<InferenceEngineRadar client:visible />

这四个引擎的设计哲学可以用一个三角形来理解：吞吐量、可编程性、易用性——任何引擎都无法同时在三个维度上做到极致。

<DesignPhilosophyMap />

## 请求处理流程对比

三种引擎的请求处理流程反映了它们各自的设计优先级：

<RequestLifecycleCompare client:visible />

**vLLM** 的流程以 Scheduler 为核心，所有优化都围绕"同一时刻塞进更多请求"展开。**Ollama** 的流程最短最直接，单请求模型适合交互式使用。**SGLang** 的流程多了 IR 编排和约束解码两个环节——它不仅在优化推理速度，还在优化"程序员怎么使用 LLM"。

## 关键技术概览

这些引擎的性能差异来自底层的关键技术创新。我们先建立全局认知，后续文章会逐个深入：

| 技术 | 核心思想 | 首创 | 详解文章 |
|------|----------|------|----------|
| **PagedAttention** | 虚拟内存分页管理 KV Cache | vLLM | [下一篇](./paged-attention) |
| **Continuous Batching** | 请求完成即释放，动态填入新请求 | Orca | [下一篇](./paged-attention) |
| **RadixAttention** | Radix Tree 管理前缀缓存 | SGLang | [前缀缓存](./prefix-caching) |
| **Constrained Decoding** | FSM 约束 + jump-forward 加速 | SGLang | [SGLang 编程模型](./sglang-programming-model) |
| **Chunked Prefill** | 长 prompt 分块混合调度 | Sarathi | [调度与抢占](./inference-scheduling) |

**Static vs Continuous Batching** 是理解所有引擎的基础——静态批处理必须等最慢的请求完成，GPU 大量空闲；continuous batching 则逐请求释放、逐请求填入：

<StaticVsDynamicBatching client:visible />

## 技术演进时间线

从 2022 年 Orca 开创 continuous batching 到今天，推理引擎领域经历了爆发式创新。各引擎从独立创新走向互相吸收——vLLM 加入了前缀缓存，SGLang 优化了批处理调度，TensorRT-LLM 也支持了 PagedAttention。

<TechEvolutionTimeline client:visible />

## 选型指南

不知道该选哪个？回答几个简单问题：

<EngineDecisionTree client:visible />

当然，这只是粗略指南。实际选型还需要考虑：模型大小、请求模式（长/短上下文）、SLA 要求、团队技术栈、硬件预算等因素。最稳妥的策略是先用 vLLM（生态最成熟），遇到瓶颈再评估 SGLang（结构化输出）或 TensorRT-LLM（极致性能）。

## 总结

推理引擎是 LLM 从"能跑"到"能用"的关键基础设施。理解它们的设计哲学和核心技术，是做好 LLM 工程的必备知识。接下来我们将深入每个关键技术：从 PagedAttention 的内存管理开始，逐步理解现代推理引擎的完整技术栈。

## 延伸阅读

- 想深入 KV Cache 内存管理？阅读 [PagedAttention 与 Continuous Batching](./paged-attention)
- 想了解调度策略？阅读 [调度与抢占](./inference-scheduling)
- 想了解前缀缓存？阅读 [前缀缓存与 RadixAttention](./prefix-caching)
- 想了解结构化输出？阅读 [SGLang 编程模型](./sglang-programming-model)
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/InferenceEngineRadar.tsx \
  src/components/interactive/DesignPhilosophyMap.tsx \
  src/components/interactive/RequestLifecycleCompare.tsx \
  src/components/interactive/StaticVsDynamicBatching.tsx \
  src/components/interactive/TechEvolutionTimeline.tsx \
  src/components/interactive/EngineDecisionTree.tsx \
  src/content/articles/zh/inference-engine-landscape.mdx
git commit -m "feat: add inference engine landscape article with 6 components"
```

---

## Task 8: MemoryWasteComparison

**Files:**
- Create: `src/components/interactive/MemoryWasteComparison.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

const MAX_SEQ = 2048;
const BLOCK_SIZE = 16;

export default function MemoryWasteComparison() {
  const [seqLen, setSeqLen] = useState(512);

  const chartY = 80;
  const chartH = 200;
  const barW = 180;

  // Pre-allocated: always reserves max_seq_len
  const preAllocUsed = seqLen / MAX_SEQ;
  const preAllocWaste = 1 - preAllocUsed;

  // PagedAttention: allocates blocks on demand
  const blocksNeeded = Math.ceil(seqLen / BLOCK_SIZE);
  const totalSlots = blocksNeeded * BLOCK_SIZE;
  const pagedUsed = seqLen / totalSlots;
  const pagedWaste = 1 - pagedUsed; // only last-block internal fragmentation

  const wastePercent = (v: number) => `${(v * 100).toFixed(1)}%`;

  // Slider step positions (5 values)
  const sliderValues = [128, 256, 512, 1024, 1536];
  const sliderX = 120;
  const sliderW = 340;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        内存分配对比：预分配 vs PagedAttention
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        拖动滑块调整实际序列长度，观察内存浪费率变化
      </text>

      {/* Slider */}
      <line x1={sliderX} y1={58} x2={sliderX + sliderW} y2={58}
        stroke={COLORS.light} strokeWidth="4" strokeLinecap="round" />
      {sliderValues.map((v, i) => {
        const x = sliderX + (i / (sliderValues.length - 1)) * sliderW;
        const isActive = seqLen === v;
        return (
          <g key={v} onClick={() => setSeqLen(v)} cursor="pointer">
            <circle cx={x} cy={58} r={isActive ? 8 : 5}
              fill={isActive ? COLORS.primary : COLORS.bgAlt}
              stroke={isActive ? COLORS.primary : COLORS.mid} strokeWidth="1.5" />
            <text x={x} y={74} textAnchor="middle" fontSize="8"
              fontWeight={isActive ? '700' : '400'}
              fill={isActive ? COLORS.primary : COLORS.mid} fontFamily={FONTS.mono}>
              {v}
            </text>
          </g>
        );
      })}
      <text x={sliderX + sliderW + 30} y={62} fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>tokens</text>

      {/* Left bar: Pre-allocated */}
      {(() => {
        const x = W / 2 - barW - 30;
        const usedH = chartH * preAllocUsed;
        const wasteH = chartH * preAllocWaste;
        return (
          <g>
            <text x={x + barW / 2} y={chartY - 5} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
              预分配 (max={MAX_SEQ})
            </text>
            {/* Waste */}
            <rect x={x} y={chartY} width={barW} height={wasteH} rx={4}
              fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" />
            <text x={x + barW / 2} y={chartY + wasteH / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="600" fill={COLORS.red} fontFamily={FONTS.sans}>
              浪费 {wastePercent(preAllocWaste)}
            </text>
            {/* Used */}
            <rect x={x} y={chartY + wasteH} width={barW} height={usedH} rx={4}
              fill={COLORS.primary} opacity={0.7} />
            <text x={x + barW / 2} y={chartY + wasteH + usedH / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
              使用 {wastePercent(preAllocUsed)}
            </text>
          </g>
        );
      })()}

      {/* Right bar: PagedAttention */}
      {(() => {
        const x = W / 2 + 30;
        const usedH = chartH * pagedUsed;
        const wasteH = chartH * pagedWaste;
        return (
          <g>
            <text x={x + barW / 2} y={chartY - 5} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
              PagedAttention (block={BLOCK_SIZE})
            </text>
            {/* Tiny waste (last block) */}
            {wasteH > 2 && (
              <>
                <rect x={x} y={chartY + chartH - wasteH - usedH} width={barW} height={wasteH} rx={4}
                  fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" />
                <text x={x + barW / 2} y={chartY + chartH - usedH - wasteH / 2 + 4}
                  textAnchor="middle" fontSize="9" fontWeight="600"
                  fill={COLORS.red} fontFamily={FONTS.sans}>
                  {wastePercent(pagedWaste)}
                </text>
              </>
            )}
            {/* Used — almost the entire bar */}
            <rect x={x} y={chartY + chartH - usedH} width={barW} height={usedH} rx={4}
              fill={COLORS.green} opacity={0.7} />
            <text x={x + barW / 2} y={chartY + chartH - usedH / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
              使用 {wastePercent(pagedUsed)}
            </text>
          </g>
        );
      })()}

      {/* Stats row */}
      <text x={W / 2} y={chartY + chartH + 30} textAnchor="middle" fontSize="10"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        序列长度 {seqLen} / max {MAX_SEQ} — PagedAttention 使用 {blocksNeeded} 个块（{totalSlots} slots）
      </text>

      {/* Summary */}
      <rect x={60} y={H - 55} width={W - 120} height={40} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 31} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        预分配浪费 {wastePercent(preAllocWaste)} vs PagedAttention 浪费 {wastePercent(pagedWaste)}
        — 节省 {wastePercent(preAllocWaste - pagedWaste)} 内存
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 9: BlockTableMapping

**Files:**
- Create: `src/components/interactive/BlockTableMapping.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 440;

const BLOCK_SIZE = 4;
const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'and', 'slept', 'for', 'hours'];
const NUM_BLOCKS = Math.ceil(TOKENS.length / BLOCK_SIZE);

// Physical blocks are non-contiguous (simulating scattered allocation)
const PHYSICAL_MAP = [3, 7, 1]; // logical block 0→phys 3, 1→phys 7, 2→phys 1

const PHYS_TOTAL = 10;

export default function BlockTableMapping() {
  const [selectedToken, setSelectedToken] = useState<number | null>(null);

  const selectedBlock = selectedToken !== null ? Math.floor(selectedToken / BLOCK_SIZE) : null;
  const selectedPhys = selectedBlock !== null ? PHYSICAL_MAP[selectedBlock] : null;

  const tokenY = 70;
  const tokenW = 50;
  const tokenH = 30;
  const tokensX = (W - TOKENS.length * tokenW) / 2;

  const tableY = 150;
  const tableRowH = 28;
  const tableW = 200;
  const tableX = 40;

  const physY = 150;
  const physBlockW = 44;
  const physBlockH = 70;
  const physX = 330;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Block Table：逻辑块 → 物理块映射
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击 token 查看它在哪个逻辑块，映射到哪个物理块
      </text>

      {/* Token sequence */}
      {TOKENS.map((tok, i) => {
        const x = tokensX + i * tokenW;
        const blockIdx = Math.floor(i / BLOCK_SIZE);
        const isSelected = selectedToken === i;
        const inSelectedBlock = selectedBlock === blockIdx;
        return (
          <g key={i} onClick={() => setSelectedToken(selectedToken === i ? null : i)}
            cursor="pointer">
            <rect x={x + 1} y={tokenY} width={tokenW - 2} height={tokenH} rx={4}
              fill={isSelected ? COLORS.highlight : inSelectedBlock ? COLORS.valid : COLORS.bgAlt}
              stroke={isSelected ? COLORS.primary : inSelectedBlock ? COLORS.primary : COLORS.light}
              strokeWidth={isSelected ? 2.5 : 1} />
            <text x={x + tokenW / 2} y={tokenY + 19} textAnchor="middle"
              fontSize="10" fontWeight={isSelected ? '700' : '500'}
              fill={COLORS.dark} fontFamily={FONTS.mono}>{tok}</text>
          </g>
        );
      })}

      {/* Block boundaries */}
      {Array.from({ length: NUM_BLOCKS }, (_, b) => {
        const x1 = tokensX + b * BLOCK_SIZE * tokenW;
        const bLen = Math.min(BLOCK_SIZE, TOKENS.length - b * BLOCK_SIZE);
        const bw = bLen * tokenW;
        return (
          <rect key={`bb-${b}`} x={x1} y={tokenY - 4} width={bw} height={tokenH + 8} rx={6}
            fill="none" stroke={selectedBlock === b ? COLORS.primary : COLORS.mid}
            strokeWidth={selectedBlock === b ? 2 : 0.5}
            strokeDasharray={selectedBlock === b ? 'none' : '3,2'} />
        );
      })}
      {/* Block labels */}
      {Array.from({ length: NUM_BLOCKS }, (_, b) => {
        const x = tokensX + b * BLOCK_SIZE * tokenW;
        return (
          <text key={`bl-${b}`} x={x + (Math.min(BLOCK_SIZE, TOKENS.length - b * BLOCK_SIZE) * tokenW) / 2}
            y={tokenY + tokenH + 18} textAnchor="middle" fontSize="8"
            fill={selectedBlock === b ? COLORS.primary : COLORS.mid} fontFamily={FONTS.mono}>
            逻辑块 {b}
          </text>
        );
      })}

      {/* Block Table */}
      <text x={tableX + tableW / 2} y={tableY - 8} textAnchor="middle" fontSize="11"
        fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>Block Table</text>
      {/* Header */}
      <rect x={tableX} y={tableY} width={tableW / 2} height={tableRowH}
        fill={COLORS.dark} rx={4} />
      <text x={tableX + tableW / 4} y={tableY + 18} textAnchor="middle"
        fontSize="9" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>逻辑块</text>
      <rect x={tableX + tableW / 2} y={tableY} width={tableW / 2} height={tableRowH}
        fill={COLORS.dark} rx={4} />
      <text x={tableX + 3 * tableW / 4} y={tableY + 18} textAnchor="middle"
        fontSize="9" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>物理块</text>
      {/* Rows */}
      {PHYSICAL_MAP.map((phys, b) => {
        const y = tableY + (b + 1) * tableRowH;
        const isActive = selectedBlock === b;
        return (
          <g key={`row-${b}`}>
            <rect x={tableX} y={y} width={tableW} height={tableRowH}
              fill={isActive ? COLORS.highlight : b % 2 === 0 ? COLORS.bgAlt : '#fff'}
              stroke={COLORS.light} strokeWidth="0.5" />
            <text x={tableX + tableW / 4} y={y + 18} textAnchor="middle"
              fontSize="10" fontWeight={isActive ? '700' : '400'}
              fill={isActive ? COLORS.primary : COLORS.dark} fontFamily={FONTS.mono}>{b}</text>
            <text x={tableX + 3 * tableW / 4} y={y + 18} textAnchor="middle"
              fontSize="10" fontWeight={isActive ? '700' : '400'}
              fill={isActive ? COLORS.green : COLORS.dark} fontFamily={FONTS.mono}>{phys}</text>
          </g>
        );
      })}

      {/* Physical memory blocks */}
      <text x={physX + (PHYS_TOTAL / 2 * physBlockW) / 2} y={physY - 8} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
        物理内存 (GPU)
      </text>
      {Array.from({ length: PHYS_TOTAL }, (_, p) => {
        const col = p % 5;
        const row = Math.floor(p / 5);
        const x = physX + col * physBlockW;
        const y = physY + row * physBlockH;
        const logicalIdx = PHYSICAL_MAP.indexOf(p);
        const isUsed = logicalIdx !== -1;
        const isActive = selectedPhys === p;
        return (
          <g key={`phys-${p}`}>
            <rect x={x + 1} y={y + 1} width={physBlockW - 2} height={physBlockH - 2} rx={4}
              fill={isActive ? COLORS.highlight : isUsed ? COLORS.valid : COLORS.bgAlt}
              stroke={isActive ? COLORS.primary : isUsed ? COLORS.primary : COLORS.light}
              strokeWidth={isActive ? 2.5 : 1} />
            <text x={x + physBlockW / 2} y={y + 22} textAnchor="middle"
              fontSize="9" fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.mono}>
              P{p}
            </text>
            {isUsed && (
              <text x={x + physBlockW / 2} y={y + 40} textAnchor="middle"
                fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
                ← L{logicalIdx}
              </text>
            )}
            {isUsed && (
              <text x={x + physBlockW / 2} y={y + 54} textAnchor="middle"
                fontSize="7" fill={COLORS.mid} fontFamily={FONTS.mono}>
                {TOKENS.slice(logicalIdx * BLOCK_SIZE, (logicalIdx + 1) * BLOCK_SIZE).join(' ')}
              </text>
            )}
          </g>
        );
      })}

      {/* Arrow from table to physical when selected */}
      {selectedBlock !== null && selectedPhys !== null && (
        <line
          x1={tableX + tableW} y1={tableY + (selectedBlock + 1.5) * tableRowH}
          x2={physX + (selectedPhys % 5) * physBlockW}
          y2={physY + Math.floor(selectedPhys / 5) * physBlockH + physBlockH / 2}
          stroke={COLORS.primary} strokeWidth="2" strokeDasharray="5,3" />
      )}

      {/* Summary */}
      <rect x={40} y={H - 50} width={W - 80} height={36} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 28} textAnchor="middle" fontSize="10"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {selectedToken !== null
          ? `"${TOKENS[selectedToken]}" 在逻辑块 ${selectedBlock}，映射到物理块 ${selectedPhys}（非连续分配，消除外部碎片）`
          : '物理块在 GPU 显存中无需连续 — 就像操作系统的虚拟内存分页'}
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 10: FragmentationAnalysis

**Files:**
- Create: `src/components/interactive/FragmentationAnalysis.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Scenario {
  label: string;
  requests: number;
  contiguousInternal: number;
  contiguousExternal: number;
  pagedInternal: number;
  pagedExternal: number;
}

const SCENARIOS: Scenario[] = [
  { label: '4 请求', requests: 4,  contiguousInternal: 35, contiguousExternal: 20, pagedInternal: 3, pagedExternal: 0 },
  { label: '16 请求', requests: 16, contiguousInternal: 40, contiguousExternal: 30, pagedInternal: 3, pagedExternal: 0 },
  { label: '64 请求', requests: 64, contiguousInternal: 45, contiguousExternal: 38, pagedInternal: 4, pagedExternal: 0 },
];

export default function FragmentationAnalysis() {
  const [scenarioIdx, setScenarioIdx] = useState(1);
  const s = SCENARIOS[scenarioIdx];

  const chartX = 80;
  const chartW = 420;
  const chartY = 100;
  const barH = 36;
  const groupGap = 60;

  const bars = [
    { label: '内部碎片', contiguous: s.contiguousInternal, paged: s.pagedInternal, desc: '预分配 max_len 导致的未使用空间' },
    { label: '外部碎片', contiguous: s.contiguousExternal, paged: s.pagedExternal, desc: '请求间内存间隙无法利用' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        内存碎片率对比
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        切换不同并发请求数，观察碎片率变化
      </text>

      {/* Scenario selector */}
      {SCENARIOS.map((sc, i) => (
        <g key={i} onClick={() => setScenarioIdx(i)} cursor="pointer">
          <rect x={160 + i * 100} y={52} width={85} height={24} rx={12}
            fill={scenarioIdx === i ? COLORS.primary : COLORS.bgAlt}
            stroke={scenarioIdx === i ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={202 + i * 100} y={68} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={scenarioIdx === i ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {sc.label}
          </text>
        </g>
      ))}

      {/* Bars */}
      {bars.map((bar, gi) => {
        const baseY = chartY + gi * groupGap;
        const maxVal = 60; // max percentage for scale
        const scale = chartW / maxVal;

        return (
          <g key={bar.label}>
            <text x={chartX - 5} y={baseY + 10} textAnchor="end" fontSize="10"
              fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{bar.label}</text>
            <text x={chartX - 5} y={baseY + 24} textAnchor="end" fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>{bar.desc}</text>

            {/* Contiguous bar */}
            <rect x={chartX} y={baseY} width={bar.contiguous * scale} height={barH / 2 - 1} rx={3}
              fill={COLORS.red} opacity={0.7} />
            <text x={chartX + bar.contiguous * scale + 5} y={baseY + 12}
              fontSize="9" fontWeight="600" fill={COLORS.red} fontFamily={FONTS.mono}>
              {bar.contiguous}%
            </text>
            <text x={chartX + bar.contiguous * scale + 35} y={baseY + 12}
              fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>连续分配</text>

            {/* Paged bar */}
            <rect x={chartX} y={baseY + barH / 2 + 1}
              width={Math.max(bar.paged * scale, 2)} height={barH / 2 - 1} rx={3}
              fill={COLORS.green} opacity={0.7} />
            <text x={chartX + Math.max(bar.paged * scale, 2) + 5} y={baseY + barH - 2}
              fontSize="9" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.mono}>
              {bar.paged}%
            </text>
            <text x={chartX + Math.max(bar.paged * scale, 2) + 30} y={baseY + barH - 2}
              fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>PagedAttention</text>
          </g>
        );
      })}

      {/* Total waste comparison */}
      {(() => {
        const totalContiguous = s.contiguousInternal + s.contiguousExternal;
        const totalPaged = s.pagedInternal + s.pagedExternal;
        const y = chartY + 2 * groupGap + 20;
        const barMaxW = 300;
        return (
          <g>
            <text x={W / 2} y={y} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
              总浪费率
            </text>
            {/* Contiguous */}
            <rect x={W / 2 - barMaxW / 2} y={y + 10}
              width={barMaxW * totalContiguous / 100} height={20} rx={4}
              fill={COLORS.red} opacity={0.6} />
            <text x={W / 2 + barMaxW / 2 + 10} y={y + 25}
              fontSize="10" fontWeight="700" fill={COLORS.red} fontFamily={FONTS.mono}>
              {totalContiguous}%
            </text>
            {/* Paged */}
            <rect x={W / 2 - barMaxW / 2} y={y + 34}
              width={Math.max(barMaxW * totalPaged / 100, 3)} height={20} rx={4}
              fill={COLORS.green} opacity={0.6} />
            <text x={W / 2 + barMaxW / 2 + 10} y={y + 49}
              fontSize="10" fontWeight="700" fill={COLORS.green} fontFamily={FONTS.mono}>
              {totalPaged}%
            </text>
          </g>
        );
      })()}

      {/* Summary */}
      <rect x={60} y={H - 45} width={W - 120} height={32} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 25} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        PagedAttention 将外部碎片降为 0%，内部碎片仅来自最后一个块（&lt; block_size tokens）
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 11: CopyOnWriteBeam

**Files:**
- Create: `src/components/interactive/CopyOnWriteBeam.tsx`

- [ ] **Step 1: Create the component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface BlockRect {
  x: number; y: number; w: number; h: number;
  label: string; color: string; refCount?: number;
}

function BlockDiagram({ blocks, arrows, title, note }: {
  blocks: BlockRect[];
  arrows?: { from: [number, number]; to: [number, number]; dashed?: boolean }[];
  title: string;
  note?: string;
}) {
  return (
    <svg viewBox={`0 0 ${W} 240`} className="w-full">
      <defs>
        <marker id="cow-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={COLORS.mid} />
        </marker>
      </defs>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
      {blocks.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={5}
            fill={b.color} opacity={0.2} stroke={b.color} strokeWidth="2" />
          <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4} textAnchor="middle"
            fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
            {b.label}
          </text>
          {b.refCount !== undefined && (
            <g>
              <circle cx={b.x + b.w - 4} cy={b.y + 4} r={8}
                fill={COLORS.orange} />
              <text x={b.x + b.w - 4} y={b.y + 8} textAnchor="middle"
                fontSize="8" fontWeight="700" fill="#fff" fontFamily={FONTS.mono}>
                {b.refCount}
              </text>
            </g>
          )}
        </g>
      ))}
      {arrows?.map((a, i) => (
        <line key={`a-${i}`} x1={a.from[0]} y1={a.from[1]} x2={a.to[0]} y2={a.to[1]}
          stroke={COLORS.mid} strokeWidth="1.5"
          strokeDasharray={a.dashed ? '4,2' : 'none'}
          markerEnd="url(#cow-arrow)" />
      ))}
      {note && (
        <text x={W / 2} y={225} textAnchor="middle" fontSize="9"
          fill={COLORS.mid} fontFamily={FONTS.sans}>{note}</text>
      )}
    </svg>
  );
}

export default function CopyOnWriteBeam() {
  const bw = 90, bh = 40;
  const seqY = 50, physY = 140;

  const steps = [
    {
      title: '初始：Beam 1 和 Beam 2 共享前缀',
      content: (
        <BlockDiagram
          title="Prompt 阶段 — 物理块共享"
          blocks={[
            { x: 100, y: seqY, w: bw, h: bh, label: 'Beam 1', color: COLORS.primary },
            { x: 100 + bw + 20, y: seqY, w: bw, h: bh, label: 'Beam 2', color: COLORS.green },
            { x: 200, y: physY, w: bw, h: bh, label: 'Block 0', color: COLORS.primary, refCount: 2 },
            { x: 200 + bw + 20, y: physY, w: bw, h: bh, label: 'Block 1', color: COLORS.primary, refCount: 2 },
          ]}
          arrows={[
            { from: [145, seqY + bh], to: [245, physY] },
            { from: [255, seqY + bh], to: [245, physY] },
            { from: [145, seqY + bh], to: [355, physY], dashed: true },
            { from: [255, seqY + bh], to: [355, physY], dashed: true },
          ]}
          note="两个 beam 指向同一组物理块，ref_count = 2"
        />
      ),
    },
    {
      title: 'Beam 分叉：生成不同 token',
      content: (
        <BlockDiagram
          title="Beam 1 写入新 token — 触发 Copy-on-Write"
          blocks={[
            { x: 60, y: seqY, w: bw, h: bh, label: 'Beam 1', color: COLORS.primary },
            { x: 60 + bw + 20, y: seqY, w: bw, h: bh, label: 'Beam 2', color: COLORS.green },
            { x: 100, y: physY, w: bw, h: bh, label: 'Block 0', color: COLORS.primary, refCount: 2 },
            { x: 220, y: physY, w: bw, h: bh, label: 'Block 1', color: COLORS.primary, refCount: 2 },
            { x: 380, y: physY, w: bw, h: bh, label: 'Block 1\'', color: COLORS.orange },
          ]}
          arrows={[
            { from: [105, seqY + bh], to: [145, physY] },
            { from: [105, seqY + bh], to: [265, physY] },
            { from: [215, seqY + bh], to: [145, physY] },
            { from: [265, physY + bh / 2], to: [380, physY + bh / 2], dashed: true },
          ]}
          note="Beam 1 要写入 Block 1 但 ref_count > 1 → 先复制到 Block 1'，再写入"
        />
      ),
    },
    {
      title: 'CoW 完成：各自独立',
      content: (
        <BlockDiagram
          title="Copy-on-Write 完成 — 独立物理块"
          blocks={[
            { x: 60, y: seqY, w: bw, h: bh, label: 'Beam 1', color: COLORS.primary },
            { x: 60 + bw + 20, y: seqY, w: bw, h: bh, label: 'Beam 2', color: COLORS.green },
            { x: 100, y: physY, w: bw, h: bh, label: 'Block 0', color: COLORS.primary, refCount: 2 },
            { x: 240, y: physY, w: bw, h: bh, label: 'Block 1a', color: COLORS.primary, refCount: 1 },
            { x: 380, y: physY, w: bw, h: bh, label: 'Block 1b', color: COLORS.green, refCount: 1 },
          ]}
          arrows={[
            { from: [105, seqY + bh], to: [145, physY] },
            { from: [105, seqY + bh], to: [285, physY] },
            { from: [215, seqY + bh], to: [145, physY] },
            { from: [215, seqY + bh], to: [425, physY] },
          ]}
          note="Block 0 仍共享（前缀相同），Block 1 各自独立（内容已分叉）"
        />
      ),
    },
    {
      title: '总结：CoW 的节省',
      content: (
        <svg viewBox={`0 0 ${W} 240`} className="w-full">
          <text x={W / 2} y={30} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Copy-on-Write 节省分析</text>
          <rect x={60} y={50} width={220} height={140} rx={6}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" />
          <text x={170} y={70} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>无 CoW</text>
          <text x={170} y={92} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>每个 beam 完整复制所有块</text>
          <text x={170} y={112} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>4 beams × 10 blocks = 40 块</text>
          <text x={170} y={140} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.mono}>40 块</text>

          <rect x={300} y={50} width={220} height={140} rx={6}
            fill={COLORS.valid} stroke={COLORS.green} strokeWidth="1" />
          <text x={410} y={70} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.sans}>有 CoW</text>
          <text x={410} y={92} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>共享前缀 + 仅复制分叉块</text>
          <text x={410} y={112} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>8 共享 + 4 独立 = 12 块</text>
          <text x={410} y={140} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.mono}>12 块 (70% ↓)</text>

          <text x={W / 2} y={220} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            beam search 中大部分 token 是共享前缀 — CoW 避免了不必要的内存复制
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 12: ContinuousBatchingTimeline

**Files:**
- Create: `src/components/interactive/ContinuousBatchingTimeline.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Req {
  id: string;
  arrive: number;
  prefill: number;
  decode: number;
  color: string;
}

const REQS: Req[] = [
  { id: 'A', arrive: 0, prefill: 1, decode: 4, color: COLORS.primary },
  { id: 'B', arrive: 0, prefill: 1, decode: 8, color: COLORS.green },
  { id: 'C', arrive: 0, prefill: 1, decode: 3, color: COLORS.orange },
  { id: 'D', arrive: 3, prefill: 1, decode: 5, color: COLORS.purple },
  { id: 'E', arrive: 5, prefill: 1, decode: 3, color: '#00838f' },
];

const SLOT_COUNT = 3; // max concurrent requests
const TICK_W = 36;
const MAX_TIME = 14;
const BAR_H = 28;
const GAP = 4;

export default function ContinuousBatchingTimeline() {
  const [hovered, setHovered] = useState<string | null>(null);

  const chartX = 50;
  const chartY = 70;

  // Simulate continuous batching: greedy slot assignment
  type SlotEvent = { req: Req; start: number; end: number; slot: number };
  const events: SlotEvent[] = [];
  const slotFree = Array(SLOT_COUNT).fill(0); // when each slot becomes free

  // Sort by arrival time
  const sorted = [...REQS].sort((a, b) => a.arrive - b.arrive);
  for (const req of sorted) {
    // Find earliest available slot at or after arrival
    const earliest = Math.max(req.arrive, Math.min(...slotFree));
    const slotIdx = slotFree.indexOf(Math.min(...slotFree.filter(t => t <= req.arrive)));
    const slot = slotIdx >= 0 ? slotIdx : slotFree.indexOf(Math.min(...slotFree));
    const start = Math.max(req.arrive, slotFree[slot]);
    const end = start + req.prefill + req.decode;
    slotFree[slot] = end;
    events.push({ req, start, end, slot });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Continuous Batching 时间线
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {SLOT_COUNT} 个 GPU slot，请求动态进出，完成即释放
      </text>

      {/* Slot labels */}
      {Array.from({ length: SLOT_COUNT }, (_, s) => (
        <text key={s} x={chartX - 8} y={chartY + s * (BAR_H + GAP) + BAR_H / 2 + 4}
          textAnchor="end" fontSize="9" fontWeight="600"
          fill={COLORS.mid} fontFamily={FONTS.sans}>Slot {s}</text>
      ))}

      {/* Time axis */}
      {Array.from({ length: MAX_TIME + 1 }, (_, t) => {
        const x = chartX + t * TICK_W;
        const axisY = chartY + SLOT_COUNT * (BAR_H + GAP) + 10;
        return (
          <g key={t}>
            <line x1={x} y1={chartY - 5} x2={x} y2={axisY}
              stroke={COLORS.light} strokeWidth="0.5" />
            <text x={x} y={axisY + 12} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily={FONTS.mono}>{t}</text>
          </g>
        );
      })}

      {/* Request bars */}
      {events.map((ev) => {
        const y = chartY + ev.slot * (BAR_H + GAP);
        const isHovered = hovered === ev.req.id;
        return (
          <g key={ev.req.id}
            onMouseEnter={() => setHovered(ev.req.id)}
            onMouseLeave={() => setHovered(null)}>
            {/* Prefill */}
            <rect x={chartX + ev.start * TICK_W} y={y}
              width={ev.req.prefill * TICK_W} height={BAR_H} rx={4}
              fill={ev.req.color} opacity={isHovered ? 1 : 0.8}
              stroke={isHovered ? COLORS.dark : 'none'} strokeWidth="1.5" />
            {/* Decode */}
            <rect x={chartX + (ev.start + ev.req.prefill) * TICK_W} y={y}
              width={ev.req.decode * TICK_W} height={BAR_H} rx={4}
              fill={ev.req.color} opacity={isHovered ? 0.6 : 0.4}
              stroke={isHovered ? COLORS.dark : 'none'} strokeWidth="1.5" />
            {/* Label */}
            <text x={chartX + (ev.start + (ev.req.prefill + ev.req.decode) / 2) * TICK_W}
              y={y + BAR_H / 2 + 4} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={isHovered ? '#fff' : COLORS.dark} fontFamily={FONTS.mono}>
              {ev.req.id}
            </text>
          </g>
        );
      })}

      {/* Arrival markers */}
      {REQS.filter(r => r.arrive > 0).map((r) => {
        const x = chartX + r.arrive * TICK_W;
        return (
          <g key={`arr-${r.id}`}>
            <line x1={x} y1={chartY - 10} x2={x}
              y2={chartY + SLOT_COUNT * (BAR_H + GAP)}
              stroke={r.color} strokeWidth="1" strokeDasharray="3,2" />
            <text x={x} y={chartY - 14} textAnchor="middle" fontSize="8"
              fill={r.color} fontFamily={FONTS.sans}>{r.id} 到达</text>
          </g>
        );
      })}

      {/* Detail box */}
      {hovered !== null && (() => {
        const ev = events.find(e => e.req.id === hovered);
        if (!ev) return null;
        return (
          <rect x={60} y={H - 80} width={W - 120} height={30} rx={6} fill="none" />
        );
      })()}

      {/* Legend */}
      <g>
        <rect x={100} y={H - 60} width={16} height={12} rx={2}
          fill={COLORS.primary} opacity={0.8} />
        <text x={122} y={H - 51} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Prefill（深色）
        </text>
        <rect x={240} y={H - 60} width={16} height={12} rx={2}
          fill={COLORS.primary} opacity={0.4} />
        <text x={262} y={H - 51} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Decode（浅色）
        </text>
        <line x1={380} y1={H - 54} x2={410} y2={H - 54}
          stroke={COLORS.mid} strokeWidth="1" strokeDasharray="3,2" />
        <text x={416} y={H - 51} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
          新请求到达
        </text>
      </g>

      {/* Summary */}
      <rect x={60} y={H - 35} width={W - 120} height={26} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 18} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        请求 A/C 完成后 slot 立即被 D/E 填入 — 无空闲等待，GPU 利用率最大化
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

---

## Task 13: ThroughputBenchmark

**Files:**
- Create: `src/components/interactive/ThroughputBenchmark.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

const CONCURRENCIES = [1, 4, 8, 16, 32, 64];

interface Series {
  name: string;
  color: string;
  // throughput (req/s) at each concurrency level
  values: number[];
}

const DATA: Series[] = [
  { name: 'Static Batch',     color: COLORS.red,     values: [5, 12, 14, 15, 15, 15] },
  { name: 'Dynamic Batch',    color: COLORS.orange,  values: [5, 16, 28, 35, 38, 40] },
  { name: 'Continuous Batch',  color: COLORS.green,   values: [5, 18, 34, 56, 72, 85] },
];

export default function ThroughputBenchmark() {
  const [hovered, setHovered] = useState<{ series: number; point: number } | null>(null);

  const chartX = 70;
  const chartY = 60;
  const chartW = 440;
  const chartH = 220;

  const maxVal = 100;
  const xScale = (i: number) => chartX + (i / (CONCURRENCIES.length - 1)) * chartW;
  const yScale = (v: number) => chartY + chartH - (v / maxVal) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        吞吐量对比：三种批处理策略
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        Hover 查看具体数值
      </text>

      {/* Y axis */}
      <line x1={chartX} y1={chartY} x2={chartX} y2={chartY + chartH}
        stroke={COLORS.light} strokeWidth="1" />
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={chartX - 5} y1={yScale(v)} x2={chartX + chartW} y2={yScale(v)}
            stroke={COLORS.light} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={chartX - 8} y={yScale(v) + 4} textAnchor="end"
            fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>{v}</text>
        </g>
      ))}
      <text x={20} y={chartY + chartH / 2}
        textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}
        transform={`rotate(-90, 20, ${chartY + chartH / 2})`}>
        吞吐量 (req/s)
      </text>

      {/* X axis */}
      <line x1={chartX} y1={chartY + chartH} x2={chartX + chartW} y2={chartY + chartH}
        stroke={COLORS.light} strokeWidth="1" />
      {CONCURRENCIES.map((c, i) => (
        <text key={c} x={xScale(i)} y={chartY + chartH + 16} textAnchor="middle"
          fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>{c}</text>
      ))}
      <text x={chartX + chartW / 2} y={chartY + chartH + 32}
        textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
        并发请求数
      </text>

      {/* Lines + dots */}
      {DATA.map((series, si) => {
        const points = series.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
        return (
          <g key={series.name}>
            <polyline points={points} fill="none"
              stroke={series.color} strokeWidth="2.5" />
            {series.values.map((v, i) => {
              const isHov = hovered?.series === si && hovered?.point === i;
              return (
                <g key={i}
                  onMouseEnter={() => setHovered({ series: si, point: i })}
                  onMouseLeave={() => setHovered(null)}>
                  <circle cx={xScale(i)} cy={yScale(v)} r={isHov ? 6 : 4}
                    fill={series.color} stroke="#fff" strokeWidth="2" cursor="pointer" />
                  {isHov && (
                    <g>
                      <rect x={xScale(i) - 35} y={yScale(v) - 26} width={70} height={18} rx={4}
                        fill={COLORS.dark} />
                      <text x={xScale(i)} y={yScale(v) - 14} textAnchor="middle"
                        fontSize="9" fontWeight="600" fill="#fff" fontFamily={FONTS.mono}>
                        {v} req/s
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Legend */}
      {DATA.map((s, i) => (
        <g key={`leg-${i}`}>
          <line x1={100 + i * 160} y1={H - 25} x2={120 + i * 160} y2={H - 25}
            stroke={s.color} strokeWidth="3" />
          <text x={125 + i * 160} y={H - 21} fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{s.name}</text>
        </g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Verify (Task 13 end)**

Run: `npm run validate`
Expected: PASS

---

<!-- Tasks 14-31 are in the companion file: 2026-04-05-vllm-sglang-plan-part2.md -->
