# vLLM + SGLang Plan — Part 2 (Tasks 14-31)

> Continuation of `2026-04-05-vllm-sglang-plan.md`. Same conventions apply.

---

## Task 14: Article 2 — paged-attention.mdx

**Files:**
- Create: `src/content/articles/zh/paged-attention.mdx`

- [ ] **Step 1: Create the article**

```mdx
---
title: "PagedAttention 与 Continuous Batching"
slug: paged-attention
locale: zh
tags: [paged-attention, continuous-batching, vllm, memory-management, kv-cache]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [kv-cache]
references:
  - type: paper
    title: "Efficient Memory Management for Large Language Model Serving with PagedAttention"
    url: "https://arxiv.org/abs/2309.06180"
  - type: paper
    title: "Orca: A Distributed Serving System for Transformer-Based Generative Models"
    url: "https://arxiv.org/abs/2206.06003"
  - type: website
    title: "vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention"
    url: "https://blog.vllm.ai/2023/06/20/vllm.html"
---

import MemoryWasteComparison from '../../../components/interactive/MemoryWasteComparison.tsx';
import BlockTableMapping from '../../../components/interactive/BlockTableMapping.tsx';
import FragmentationAnalysis from '../../../components/interactive/FragmentationAnalysis.tsx';
import CopyOnWriteBeam from '../../../components/interactive/CopyOnWriteBeam.tsx';
import ContinuousBatchingTimeline from '../../../components/interactive/ContinuousBatchingTimeline.tsx';
import ThroughputBenchmark from '../../../components/interactive/ThroughputBenchmark.tsx';

## KV Cache 的内存困境

在 [KV Cache 原理](./kv-cache) 中我们知道，推理时需要缓存每一层的 Key 和 Value 张量来避免重复计算。但传统实现有一个严重问题：**为每个请求预分配 max_seq_len 的连续内存**。

假设 max_seq_len = 2048，但用户请求平均只用 512 个 token。这意味着 75% 的 GPU 显存被预分配但从未使用。更糟的是，当多个请求的 KV Cache 在显存中连续分配时，已完成的请求释放的内存会形成碎片（**外部碎片**），导致新请求可能因为找不到足够大的连续空间而无法启动。

<MemoryWasteComparison client:visible />

Kwon et al. (2023) 的实测数据显示，在真实 serving 场景中，**KV Cache 占用了 GPU 显存的 60-80%，但其中超过 60% 被浪费在预分配和碎片上**。

## 操作系统的启示

这个问题和操作系统的内存管理非常相似。早期操作系统为每个进程分配连续的物理内存，导致同样的碎片问题。解决方案是**虚拟内存 + 分页**：每个进程看到连续的虚拟地址空间，但操作系统在背后将虚拟页映射到分散的物理页帧。

PagedAttention 将这个思想引入 KV Cache 管理：

| 操作系统概念 | PagedAttention 对应 |
|-------------|-------------------|
| 虚拟页 | 逻辑块（一组连续 token 的 KV） |
| 物理页帧 | 物理块（GPU 显存中的固定大小区域） |
| 页表 | Block Table（逻辑块 → 物理块映射） |
| 按需分配 | 新 token 到来时才分配新物理块 |
| 页面大小 | Block size（通常 16 tokens） |

## PagedAttention 核心机制

每个请求的 KV Cache 被划分为**逻辑块**，每块存储固定数量的 token（如 16 个）的 Key/Value。逻辑块通过 **Block Table** 映射到 GPU 显存中的**物理块**，物理块无需连续。

<BlockTableMapping client:visible />

关键设计：

1. **按需分配**：不预分配 max_seq_len，而是每生成一个新 token，检查当前块是否还有空间。满了才分配新物理块
2. **无外部碎片**：物理块大小固定且统一，任何空闲块都可以被任何请求使用
3. **极小内部碎片**：浪费只发生在每个请求的最后一个块（未填满的部分），平均浪费 &lt; block_size / 2 个 token

<FragmentationAnalysis client:visible />

## Copy-on-Write

Beam search 和 parallel sampling 场景中，多个候选序列共享相同的前缀。PagedAttention 用 **Copy-on-Write (CoW)** 优化：多个序列的 Block Table 可以指向同一个物理块，只在某个序列需要修改该块内容时才复制。

每个物理块维护一个 **ref_count**（引用计数）。当 ref_count > 1 时写入会触发复制。这和 Linux 的 fork() + CoW 机制完全一致。

<CopyOnWriteBeam client:visible />

## Continuous Batching

有了 PagedAttention 高效管理内存后，下一步是优化请求调度。

传统 **Static Batching**（Orca 之前的做法）：将一批请求打包在一起，等所有请求都完成才处理下一批。短请求被长请求"拖后腿"，GPU 在等待期间大量空闲。

**Continuous Batching**（Orca 提出的 iteration-level scheduling）：在每一个 decode iteration 结束后检查，已完成的请求立即释放 slot，等待队列中的新请求立即填入。没有空闲等待，GPU 利用率最大化。

<ContinuousBatchingTimeline client:visible />

## 性能分析

三种批处理策略在不同并发数下的吞吐量差异：

<ThroughputBenchmark client:visible />

核心结论：
- **低并发**（1-4 请求）：三种策略差异不大，因为 GPU 本身没被充分利用
- **高并发**（16+ 请求）：continuous batching 的优势呈指数级增长，因为它避免了长尾请求阻塞整个 batch
- **实测数据**：vLLM 在 PagedAttention + continuous batching 下，吞吐量比 HuggingFace Text Generation Inference 高 **2-4 倍**，比原始 transformers 高 **24 倍**

## 总结

PagedAttention 通过"虚拟内存分页"思想解决了 KV Cache 的内存浪费问题，Continuous Batching 通过"iteration-level 调度"解决了请求间的 GPU 空闲问题。两者结合使得 vLLM 能同时服务更多请求、更高效利用 GPU——这也是为什么 vLLM 成为云端 LLM serving 的事实标准。

## 延伸阅读

- 想了解调度策略和抢占机制？阅读 [调度与抢占](./inference-scheduling)
- 想了解前缀缓存优化？阅读 [前缀缓存与 RadixAttention](./prefix-caching)
```

- [ ] **Step 2: Verify (Task 14)**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit (Articles 1+2)**

```bash
git add src/components/interactive/MemoryWasteComparison.tsx \
  src/components/interactive/BlockTableMapping.tsx \
  src/components/interactive/FragmentationAnalysis.tsx \
  src/components/interactive/CopyOnWriteBeam.tsx \
  src/components/interactive/ContinuousBatchingTimeline.tsx \
  src/components/interactive/ThroughputBenchmark.tsx \
  src/content/articles/zh/paged-attention.mdx
git commit -m "feat: add paged-attention article with 6 components"
```

---

## Task 15: SchedulerStateMachine

**Files:**
- Create: `src/components/interactive/SchedulerStateMachine.tsx`

- [ ] **Step 1: Create the component**

Full code in plan part 1 Task 15 section. Use the identical code from the brainstorming output below:

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

type State = 'waiting' | 'running' | 'swapped' | 'finished';

interface StateNode {
  id: State;
  label: string;
  x: number;
  y: number;
  color: string;
}

const STATES: StateNode[] = [
  { id: 'waiting',  label: 'Waiting',  x: 110, y: 110, color: COLORS.orange },
  { id: 'running',  label: 'Running',  x: 350, y: 110, color: COLORS.green },
  { id: 'swapped',  label: 'Swapped',  x: 230, y: 260, color: COLORS.purple },
  { id: 'finished', label: 'Finished', x: 470, y: 260, color: COLORS.mid },
];

interface Transition {
  from: State;
  to: State;
  label: string;
  event: string;
}

const TRANSITIONS: Transition[] = [
  { from: 'waiting', to: 'running',  label: 'GPU slot 空闲', event: 'schedule' },
  { from: 'running', to: 'finished', label: '生成 EOS', event: 'finish' },
  { from: 'running', to: 'swapped',  label: '显存不足', event: 'preempt' },
  { from: 'swapped', to: 'running',  label: 'swap 完成', event: 'resume' },
];

const NODE_RX = 45;
const NODE_RY = 25;

export default function SchedulerStateMachine() {
  const [currentState, setCurrentState] = useState<State>('waiting');
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const getNode = (id: State) => STATES.find(s => s.id === id)!;
  const availableTransitions = TRANSITIONS.filter(t => t.from === currentState);

  const triggerEvent = (t: Transition) => {
    setCurrentState(t.to);
    setLastEvent(t.event);
  };

  const reset = () => { setCurrentState('waiting'); setLastEvent(null); };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="sm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill={COLORS.mid} />
        </marker>
      </defs>

      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Scheduler 请求状态机
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击下方按钮触发状态转换
      </text>

      {/* Transition edges */}
      {TRANSITIONS.map((t, i) => {
        const from = getNode(t.from);
        const to = getNode(t.to);
        const isActive = currentState === t.from;
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2 - 15;
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isActive ? COLORS.primary : COLORS.light}
              strokeWidth={isActive ? 2 : 1}
              markerEnd="url(#sm-arrow)" />
            <text x={mx} y={my} textAnchor="middle" fontSize="8"
              fill={isActive ? COLORS.primary : COLORS.mid} fontFamily={FONTS.sans}>
              {t.label}
            </text>
          </g>
        );
      })}

      {/* State nodes */}
      {STATES.map((s) => {
        const isCurrent = currentState === s.id;
        return (
          <g key={s.id}>
            <ellipse cx={s.x} cy={s.y} rx={NODE_RX} ry={NODE_RY}
              fill={s.color} opacity={isCurrent ? 0.25 : 0.08}
              stroke={s.color} strokeWidth={isCurrent ? 3 : 1.5} />
            <text x={s.x} y={s.y + 5} textAnchor="middle" fontSize="12"
              fontWeight={isCurrent ? '700' : '500'}
              fill={isCurrent ? s.color : COLORS.dark} fontFamily={FONTS.sans}>
              {s.label}
            </text>
          </g>
        );
      })}

      {/* Action buttons */}
      {availableTransitions.map((t, i) => {
        const btnY = 330 + i * 34;
        return (
          <g key={`btn-${i}`} onClick={() => triggerEvent(t)} cursor="pointer">
            <rect x={120} y={btnY} width={240} height={28} rx={14}
              fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x={240} y={btnY + 18} textAnchor="middle" fontSize="10"
              fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              {t.label} → {getNode(t.to).label}
            </text>
          </g>
        );
      })}

      {currentState === 'finished' && (
        <g onClick={reset} cursor="pointer">
          <rect x={200} y={330} width={100} height={28} rx={14}
            fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x={250} y={348} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>重置</text>
        </g>
      )}

      {lastEvent && (
        <text x={430} y={350} textAnchor="middle" fontSize="9"
          fill={COLORS.mid} fontFamily={FONTS.mono}>
          最近事件: {lastEvent}
        </text>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verify (Task 15)**

Run: `npm run validate`
Expected: PASS

---

## Task 16: SchedulingPolicyGantt

**Files:**
- Create: `src/components/interactive/SchedulingPolicyGantt.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

type Policy = 'fcfs' | 'priority' | 'fair';

interface Req { id: string; arrive: number; length: number; priority: number; color: string }

const REQS: Req[] = [
  { id: 'R1', arrive: 0, length: 5, priority: 2, color: COLORS.primary },
  { id: 'R2', arrive: 1, length: 3, priority: 1, color: COLORS.green },
  { id: 'R3', arrive: 2, length: 4, priority: 3, color: COLORS.orange },
  { id: 'R4', arrive: 3, length: 2, priority: 2, color: COLORS.purple },
];

const TICK_W = 32;
const BAR_H = 26;
const GAP = 8;
const SLOTS = 2;

function schedule(reqs: Req[], policy: Policy) {
  const result: { req: Req; slot: number; start: number; end: number }[] = [];
  const slotFree = Array(SLOTS).fill(0);

  let queue = [...reqs].sort((a, b) => a.arrive - b.arrive);
  if (policy === 'priority') {
    queue = [...reqs].sort((a, b) => a.priority - b.priority || a.arrive - b.arrive);
  }
  if (policy === 'fair') {
    queue = [...reqs].sort((a, b) => a.length - b.length || a.arrive - b.arrive);
  }

  for (const req of queue) {
    const slot = slotFree.indexOf(Math.min(...slotFree));
    const start = Math.max(req.arrive, slotFree[slot]);
    slotFree[slot] = start + req.length;
    result.push({ req, slot, start, end: start + req.length });
  }
  return result;
}

export default function SchedulingPolicyGantt() {
  const [policy, setPolicy] = useState<Policy>('fcfs');

  const events = schedule(REQS, policy);
  const maxTime = Math.max(...events.map(e => e.end));
  const ticks = Array.from({ length: maxTime + 2 }, (_, i) => i);

  const chartX = 60;
  const chartY = 100;

  const avgWait = events.reduce((sum, e) => sum + (e.start - e.req.arrive), 0) / events.length;
  const avgCompletion = events.reduce((sum, e) => sum + (e.end - e.req.arrive), 0) / events.length;

  const policies: { id: Policy; label: string }[] = [
    { id: 'fcfs', label: 'FCFS' },
    { id: 'priority', label: '优先级' },
    { id: 'fair', label: '短作业优先' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        调度策略对比：同一批请求的执行顺序
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        切换策略查看甘特图变化
      </text>

      {policies.map((p, i) => (
        <g key={p.id} onClick={() => setPolicy(p.id)} cursor="pointer">
          <rect x={130 + i * 120} y={52} width={105} height={26} rx={13}
            fill={policy === p.id ? COLORS.primary : COLORS.bgAlt}
            stroke={policy === p.id ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={182 + i * 120} y={69} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={policy === p.id ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {p.label}
          </text>
        </g>
      ))}

      {Array.from({ length: SLOTS }, (_, s) => (
        <text key={s} x={chartX - 8} y={chartY + s * (BAR_H + GAP) + BAR_H / 2 + 4}
          textAnchor="end" fontSize="9" fontWeight="600"
          fill={COLORS.mid} fontFamily={FONTS.sans}>Slot {s}</text>
      ))}

      {ticks.map(t => {
        const x = chartX + t * TICK_W;
        const axisY = chartY + SLOTS * (BAR_H + GAP) + 5;
        return (
          <g key={t}>
            <line x1={x} y1={chartY - 5} x2={x} y2={axisY}
              stroke={COLORS.light} strokeWidth="0.5" />
            <text x={x} y={axisY + 12} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily={FONTS.mono}>{t}</text>
          </g>
        );
      })}

      {events.map((ev) => {
        const y = chartY + ev.slot * (BAR_H + GAP);
        const waitW = (ev.start - ev.req.arrive) * TICK_W;
        return (
          <g key={ev.req.id}>
            {waitW > 0 && (
              <rect x={chartX + ev.req.arrive * TICK_W} y={y}
                width={waitW} height={BAR_H} rx={4}
                fill={COLORS.waste} opacity={0.4} stroke={COLORS.red}
                strokeWidth="0.5" strokeDasharray="2,2" />
            )}
            <rect x={chartX + ev.start * TICK_W} y={y}
              width={ev.req.length * TICK_W} height={BAR_H} rx={4}
              fill={ev.req.color} opacity={0.7} />
            <text x={chartX + (ev.start + ev.req.length / 2) * TICK_W}
              y={y + BAR_H / 2 + 4} textAnchor="middle" fontSize="11"
              fontWeight="700" fill="#fff" fontFamily={FONTS.mono}>{ev.req.id}</text>
            {ev.req.priority === 1 && (
              <text x={chartX + (ev.start + ev.req.length) * TICK_W + 5}
                y={y + BAR_H / 2 + 4} fontSize="9" fill={COLORS.red} fontFamily={FONTS.sans}>
                VIP
              </text>
            )}
          </g>
        );
      })}

      <rect x={60} y={H - 70} width={W - 120} height={55} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 50} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        平均等待时间: {avgWait.toFixed(1)} 步 | 平均完成时间: {avgCompletion.toFixed(1)} 步
      </text>
      <text x={W / 2} y={H - 32} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {policy === 'fcfs' && 'FCFS：先到先服务，简单但 VIP 请求可能等待过久'}
        {policy === 'priority' && '优先级：VIP 请求（R2）优先执行，但可能饿死低优先级请求'}
        {policy === 'fair' && '短作业优先：最小化平均完成时间，但长请求可能被持续推迟'}
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify (Task 16)**

Run: `npm run validate`
Expected: PASS

---

## Task 17: PreemptionCompare

**Files:**
- Create: `src/components/interactive/PreemptionCompare.tsx`

- [ ] **Step 1: Create the component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

export default function PreemptionCompare() {
  const steps = [
    {
      title: '触发抢占：显存不足',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>场景：新高优先级请求到达，GPU 显存不足</text>
          <rect x={60} y={50} width={200} height={80} rx={6}
            fill={COLORS.green} opacity={0.15} stroke={COLORS.green} strokeWidth="2" />
          <text x={160} y={75} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Running 请求 A</text>
          <text x={160} y={95} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>KV Cache: 2GB (20 blocks)</text>
          <text x={160} y={115} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>已生成 80% tokens</text>
          <text x={330} y={85} fontSize="18" fill={COLORS.red}>⚡</text>
          <rect x={360} y={50} width={170} height={80} rx={6}
            fill={COLORS.orange} opacity={0.15} stroke={COLORS.orange} strokeWidth="2" />
          <text x={445} y={75} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>新请求 B (VIP)</text>
          <text x={445} y={95} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>需要 KV Cache: 3GB</text>
          <text x={445} y={115} textAnchor="middle" fontSize="9"
            fill={COLORS.red} fontFamily={FONTS.sans}>GPU 显存不足!</text>
          <text x={W / 2} y={160} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Scheduler 必须抢占请求 A 来腾出显存 — 但 A 的 KV Cache 不能丢？
          </text>
          <text x={W / 2} y={180} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>
            两种策略：Swap（搬到 CPU）vs Recompute（丢弃重算）
          </text>
        </svg>
      ),
    },
    {
      title: 'Swap：KV Cache 搬到 CPU',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Swap 策略：GPU → CPU → GPU</text>
          <rect x={40} y={50} width={140} height={90} rx={6}
            fill={COLORS.green} opacity={0.1} stroke={COLORS.green} strokeWidth="1.5" />
          <text x={110} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.sans}>GPU 显存</text>
          <text x={110} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>请求 B 运行中</text>
          <text x={110} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>A 的空间已释放</text>
          <text x={230} y={80} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>PCIe 传输</text>
          <line x1={180} y1={95} x2={280} y2={95}
            stroke={COLORS.orange} strokeWidth="2" strokeDasharray="5,3" />
          <text x={230} y={110} textAnchor="middle" fontSize="8"
            fill={COLORS.red} fontFamily={FONTS.mono}>~500ms (2GB)</text>
          <rect x={290} y={50} width={140} height={90} rx={6}
            fill={COLORS.purple} opacity={0.1} stroke={COLORS.purple} strokeWidth="1.5" />
          <text x={360} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.purple} fontFamily={FONTS.sans}>CPU 内存</text>
          <text x={360} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>A 的 KV Cache</text>
          <text x={360} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>完整保存</text>
          <line x1={280} y1={130} x2={180} y2={130}
            stroke={COLORS.green} strokeWidth="2" strokeDasharray="5,3" />
          <text x={230} y={148} textAnchor="middle" fontSize="8"
            fill={COLORS.green} fontFamily={FONTS.sans}>恢复时搬回 GPU</text>
          <rect x={60} y={165} width={W - 120} height={28} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={W / 2} y={183} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            无需重算 | PCIe 带宽是瓶颈（~32GB/s）| 适合：已生成大量 token 的请求
          </text>
        </svg>
      ),
    },
    {
      title: 'Recompute：丢弃并重算',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Recompute 策略：丢弃 → 重新 Prefill</text>
          <rect x={40} y={50} width={150} height={80} rx={6}
            fill={COLORS.red} opacity={0.1} stroke={COLORS.red} strokeWidth="1.5" />
          <text x={115} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>丢弃 KV Cache</text>
          <text x={115} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>A 的 20 blocks</text>
          <text x={115} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>立即释放显存</text>
          <text x={230} y={90} fontSize="14" fill={COLORS.mid}>→</text>
          <rect x={260} y={50} width={150} height={80} rx={6}
            fill={COLORS.orange} opacity={0.1} stroke={COLORS.orange} strokeWidth="1.5" />
          <text x={335} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.orange} fontFamily={FONTS.sans}>恢复时重算</text>
          <text x={335} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>重跑 Prefill</text>
          <text x={335} y={108} textAnchor="middle" fontSize="8"
            fill={COLORS.red} fontFamily={FONTS.mono}>~200ms (prompt re-encode)</text>
          <rect x={60} y={145} width={W - 120} height={28} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={W / 2} y={163} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            无 PCIe 传输 | 浪费 prefill 计算 | 适合：生成较少 token 的请求（重算成本低）
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify (Task 17)**

Run: `npm run validate`
Expected: PASS

---

## Task 18: ChunkedPrefillTimeline

**Files:**
- Create: `src/components/interactive/ChunkedPrefillTimeline.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 340;

const TICK_W = 36;
const BAR_H = 24;
const GAP = 4;

export default function ChunkedPrefillTimeline() {
  const chartX = 70;
  const unchunkedY = 70;
  const chunkedY = 200;
  const labelX = 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Chunked Prefill：长 Prompt 分块调度
      </text>

      {/* Scenario 1: Non-chunked */}
      <text x={chartX + 5 * TICK_W} y={unchunkedY - 10} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
        不分块：Prefill 独占 GPU
      </text>
      <text x={labelX} y={unchunkedY + BAR_H / 2 + 4} fontSize="8" fontWeight="600"
        fill={COLORS.mid} fontFamily={FONTS.sans}>新请求</text>
      <rect x={chartX} y={unchunkedY} width={8 * TICK_W} height={BAR_H} rx={4}
        fill={COLORS.primary} opacity={0.8} />
      <text x={chartX + 4 * TICK_W} y={unchunkedY + BAR_H / 2 + 4} textAnchor="middle"
        fontSize="9" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
        Long Prefill (8 iteration 独占)
      </text>

      <text x={labelX} y={unchunkedY + BAR_H + GAP + BAR_H / 2 + 4} fontSize="8"
        fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>Decode A</text>
      <rect x={chartX} y={unchunkedY + BAR_H + GAP}
        width={8 * TICK_W} height={BAR_H} rx={4}
        fill={COLORS.waste} opacity={0.6} stroke={COLORS.red} strokeWidth="1"
        strokeDasharray="3,2" />
      <text x={chartX + 4 * TICK_W} y={unchunkedY + BAR_H + GAP + BAR_H / 2 + 4}
        textAnchor="middle" fontSize="9" fill={COLORS.red} fontFamily={FONTS.sans}>
        被阻塞 — TTFT 飙升!
      </text>

      <text x={labelX} y={unchunkedY + 2 * (BAR_H + GAP) + BAR_H / 2 + 4} fontSize="8"
        fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>Decode B</text>
      <rect x={chartX} y={unchunkedY + 2 * (BAR_H + GAP)}
        width={8 * TICK_W} height={BAR_H} rx={4}
        fill={COLORS.waste} opacity={0.6} stroke={COLORS.red} strokeWidth="1"
        strokeDasharray="3,2" />
      <text x={chartX + 4 * TICK_W} y={unchunkedY + 2 * (BAR_H + GAP) + BAR_H / 2 + 4}
        textAnchor="middle" fontSize="9" fill={COLORS.red} fontFamily={FONTS.sans}>
        被阻塞 — 用户感知卡顿!
      </text>

      {/* Scenario 2: Chunked */}
      <text x={chartX + 5 * TICK_W} y={chunkedY - 10} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
        分块：Prefill 与 Decode 交替执行
      </text>
      <text x={labelX} y={chunkedY + BAR_H / 2 + 4} fontSize="8" fontWeight="600"
        fill={COLORS.mid} fontFamily={FONTS.sans}>新请求</text>
      {[0, 2, 4, 6].map((t, i) => (
        <g key={`chunk-${i}`}>
          <rect x={chartX + t * TICK_W} y={chunkedY} width={TICK_W} height={BAR_H} rx={4}
            fill={COLORS.primary} opacity={0.8} />
          <text x={chartX + (t + 0.5) * TICK_W} y={chunkedY + BAR_H / 2 + 4}
            textAnchor="middle" fontSize="7" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
            P{i + 1}
          </text>
        </g>
      ))}

      <text x={labelX} y={chunkedY + BAR_H + GAP + BAR_H / 2 + 4} fontSize="8"
        fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>Decode A</text>
      {[1, 3, 5, 7].map((t) => (
        <g key={`da-${t}`}>
          <rect x={chartX + t * TICK_W} y={chunkedY + BAR_H + GAP}
            width={TICK_W} height={BAR_H} rx={4}
            fill={COLORS.green} opacity={0.5} />
          <text x={chartX + (t + 0.5) * TICK_W} y={chunkedY + BAR_H + GAP + BAR_H / 2 + 4}
            textAnchor="middle" fontSize="7" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>D</text>
        </g>
      ))}

      <text x={labelX} y={chunkedY + 2 * (BAR_H + GAP) + BAR_H / 2 + 4} fontSize="8"
        fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>Decode B</text>
      {[1, 3, 5, 7].map((t) => (
        <g key={`db-${t}`}>
          <rect x={chartX + t * TICK_W} y={chunkedY + 2 * (BAR_H + GAP)}
            width={TICK_W} height={BAR_H} rx={4}
            fill={COLORS.orange} opacity={0.5} />
          <text x={chartX + (t + 0.5) * TICK_W} y={chunkedY + 2 * (BAR_H + GAP) + BAR_H / 2 + 4}
            textAnchor="middle" fontSize="7" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>D</text>
        </g>
      ))}

      <rect x={40} y={H - 35} width={W - 80} height={28} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 17} textAnchor="middle" fontSize="9"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Chunked Prefill 将长 prompt 切成小块，与 decode 交替执行 — Decode 请求不再被阻塞
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify (Task 18)**

Run: `npm run validate`
Expected: PASS

---

## Task 19: SchedulingTradeoffSlider

**Files:**
- Create: `src/components/interactive/SchedulingTradeoffSlider.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

type Focus = 'throughput' | 'latency' | 'fairness';

interface Config {
  focus: Focus;
  label: string;
  color: string;
  strategy: string;
  throughput: number;
  latency: number;
  fairness: number;
  desc: string;
}

const CONFIGS: Config[] = [
  { focus: 'throughput', label: '吞吐优先', color: COLORS.primary,
    strategy: '大 batch size + 延迟 preemption',
    throughput: 95, latency: 40, fairness: 50,
    desc: '最大化 GPU 利用率，适合离线批处理任务' },
  { focus: 'latency', label: '延迟优先', color: COLORS.green,
    strategy: '小 batch size + 激进 preemption + chunked prefill',
    throughput: 60, latency: 92, fairness: 70,
    desc: '最小化首 token 延迟（TTFT），适合实时对话' },
  { focus: 'fairness', label: '公平优先', color: COLORS.orange,
    strategy: '时间片轮转 + 短作业优先',
    throughput: 70, latency: 75, fairness: 90,
    desc: '保证每个请求都能按时完成，适合多租户 SLA 场景' },
];

export default function SchedulingTradeoffSlider() {
  const [selected, setSelected] = useState<Focus>('throughput');
  const config = CONFIGS.find(c => c.focus === selected)!;

  const barX = 160;
  const barW = 300;
  const metrics = [
    { label: '吞吐量', value: config.throughput, color: COLORS.primary },
    { label: '延迟', value: config.latency, color: COLORS.green },
    { label: '公平性', value: config.fairness, color: COLORS.orange },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        调度 Trade-off：吞吐 vs 延迟 vs 公平性
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        选择优化目标，查看对应策略和效果
      </text>

      {CONFIGS.map((c, i) => (
        <g key={c.focus} onClick={() => setSelected(c.focus)} cursor="pointer">
          <rect x={90 + i * 150} y={55} width={130} height={28} rx={14}
            fill={selected === c.focus ? c.color : COLORS.bgAlt}
            stroke={c.color} strokeWidth="1.5" />
          <text x={155 + i * 150} y={73} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={selected === c.focus ? '#fff' : c.color} fontFamily={FONTS.sans}>
            {c.label}
          </text>
        </g>
      ))}

      <rect x={60} y={100} width={W - 120} height={50} rx={6}
        fill={config.color} opacity={0.08} stroke={config.color} strokeWidth="1" />
      <text x={W / 2} y={120} textAnchor="middle" fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        策略: {config.strategy}
      </text>
      <text x={W / 2} y={140} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{config.desc}</text>

      {metrics.map((m, i) => {
        const y = 175 + i * 50;
        return (
          <g key={m.label}>
            <text x={barX - 10} y={y + 18} textAnchor="end" fontSize="10"
              fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{m.label}</text>
            <rect x={barX} y={y} width={barW} height={28} rx={6}
              fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <rect x={barX} y={y} width={barW * m.value / 100} height={28} rx={6}
              fill={m.color} opacity={0.6} />
            <text x={barX + barW * m.value / 100 + 8} y={y + 18}
              fontSize="10" fontWeight="700" fill={m.color} fontFamily={FONTS.mono}>
              {m.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Verify (Task 19)**

Run: `npm run validate`
Expected: PASS

---

## Task 20: Article 3 — inference-scheduling.mdx

**Files:**
- Create: `src/content/articles/zh/inference-scheduling.mdx`

- [ ] **Step 1: Create the article**

```mdx
---
title: "调度与抢占：推理引擎的 Scheduler"
slug: inference-scheduling
locale: zh
tags: [scheduling, preemption, chunked-prefill, vllm, inference]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [paged-attention]
references:
  - type: paper
    title: "Efficient Memory Management for Large Language Model Serving with PagedAttention"
    url: "https://arxiv.org/abs/2309.06180"
  - type: paper
    title: "Sarathi: Efficient LLM Inference by Piggybacking Decodes with Chunked Prefills"
    url: "https://arxiv.org/abs/2308.16369"
  - type: paper
    title: "Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve"
    url: "https://arxiv.org/abs/2403.02310"
---

import SchedulerStateMachine from '../../../components/interactive/SchedulerStateMachine.tsx';
import SchedulingPolicyGantt from '../../../components/interactive/SchedulingPolicyGantt.tsx';
import PreemptionCompare from '../../../components/interactive/PreemptionCompare.tsx';
import ChunkedPrefillTimeline from '../../../components/interactive/ChunkedPrefillTimeline.tsx';
import SchedulingTradeoffSlider from '../../../components/interactive/SchedulingTradeoffSlider.tsx';

## Scheduler：推理引擎的大脑

在 [上一篇](./paged-attention) 中我们解决了内存管理问题（PagedAttention）和批处理问题（Continuous Batching）。但还有一个关键问题：**当 GPU 资源不够同时服务所有请求时，谁先谁后？谁该被暂停？**

这就是 Scheduler 的职责。它是推理引擎的"大脑"，每一个 decode iteration 都做一次决策：哪些请求继续运行、哪些新请求可以加入、哪些正在运行的请求需要被抢占让路。

## 请求状态机

每个请求在 Scheduler 中有四种状态：

<SchedulerStateMachine client:visible />

- **Waiting**：请求到达，排队等待 GPU slot
- **Running**：正在 GPU 上执行 prefill 或 decode
- **Swapped**：被抢占，KV Cache 搬到 CPU 或已丢弃，等待恢复
- **Finished**：生成了 EOS token 或达到 max_length，释放所有资源

核心转换：`Waiting → Running`（调度）、`Running → Swapped`（抢占）、`Swapped → Running`（恢复）。每次 iteration 结束后 Scheduler 重新评估所有请求的状态。

## 调度策略

最基本的策略是 **FCFS**（先到先服务），但它不考虑请求的重要性。生产环境中通常需要更复杂的策略：

<SchedulingPolicyGantt client:visible />

**FCFS**：简单公平，但 VIP 用户的请求可能被大量普通请求堵在后面。

**优先级调度**：为不同请求分配优先级（如 VIP 用户、付费用户、免费用户），高优先级请求优先获得 GPU slot。缺点是低优先级请求可能被"饿死"。

**短作业优先 (SJF)**：预估请求长度，短请求优先执行，最小化平均完成时间。但长请求可能被不断推迟。

## 抢占机制

当显存不够时，Scheduler 必须从 Running 请求中选择一个或多个进行**抢占** (preemption)，释放其 KV Cache 占用的显存。有两种策略：

<PreemptionCompare client:visible />

**如何选择？** vLLM 的默认策略是：如果请求已经生成了很多 token（KV Cache 很大），优先用 **Swap**（搬运成本高但不浪费计算）；如果请求刚开始（KV Cache 较小），优先用 **Recompute**（重算成本低且避免 PCIe 传输）。

## Chunked Prefill

长 prompt 会带来另一个问题：prefill 阶段需要一次性处理数千个 token，这期间 GPU 被独占，正在 decode 的请求全部被阻塞。用户体验直接表现为"卡顿"——已经开始流式输出的对话突然停顿。

**Chunked Prefill** (Sarathi, 2023) 的解决方案是将长 prompt 切成固定大小的 chunk，每个 chunk 只占用一个 iteration，剩余 iteration 留给 decode 请求：

<ChunkedPrefillTimeline />

Sarathi-Serve 进一步优化：在每个 iteration 中，将 prefill chunk 和 decode 请求**混合执行** (piggybacking)——利用 prefill 是 compute-bound、decode 是 memory-bound 的互补特性，两者混合可以同时最大化 GPU 的计算单元和显存带宽利用率。

## 调度的 Trade-off

吞吐量、延迟和公平性——三者不可兼得。Scheduler 的配置本质上是在这个三角形中选择一个位置：

<SchedulingTradeoffSlider client:visible />

实际系统中，这些参数通常可以通过配置调整：
- `max_num_seqs`：最大并发请求数（大 → 高吞吐，小 → 低延迟）
- `enable_chunked_prefill`：是否启用分块 prefill（开 → 低延迟，关 → 高吞吐）
- `preemption_mode`：抢占策略选择（swap / recompute）
- `scheduling_policy`：调度算法选择

## 总结

Scheduler 是推理引擎中最"工程化"的部分——没有统一最优解，需要根据场景调参。但核心原则清晰：**状态机管理请求生命周期，抢占机制处理资源不足，chunked prefill 消除长 prompt 阻塞，trade-off 三角引导配置选择**。

## 延伸阅读

- 想了解前缀缓存如何进一步优化？阅读 [前缀缓存与 RadixAttention](./prefix-caching)
- 想了解 SGLang 的编程模型？阅读 [SGLang 编程模型](./sglang-programming-model)
```

- [ ] **Step 2: Verify (Task 20)**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit (Article 3)**

```bash
git add src/components/interactive/SchedulerStateMachine.tsx \
  src/components/interactive/SchedulingPolicyGantt.tsx \
  src/components/interactive/PreemptionCompare.tsx \
  src/components/interactive/ChunkedPrefillTimeline.tsx \
  src/components/interactive/SchedulingTradeoffSlider.tsx \
  src/content/articles/zh/inference-scheduling.mdx
git commit -m "feat: add inference-scheduling article with 5 components"
```
