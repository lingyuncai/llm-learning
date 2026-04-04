# Ollama + llama.cpp 学习路径 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete 9-article learning path covering Ollama + llama.cpp internals with 25 interactive/static components.

**Architecture:** Each article is an MDX file in `src/content/articles/zh/` with React components in `src/components/interactive/`. A YAML learning path definition ties them together. All components follow existing patterns: SVG viewBox width 580, shared COLORS/FONTS, StepNavigator primitive for multi-step visualizations.

**Tech Stack:** Astro 5, MDX, React, TypeScript, SVG, Tailwind CSS, StepNavigator/MatrixGrid primitives

**Design Spec:** `docs/superpowers/specs/2026-04-04-ollama-llama-cpp-design.md`

**创作准则 (cross-session rules from spec):**
1. **双项目区分:** 蓝色 = Ollama (Go), 橙色 = llama.cpp/GGML (C/C++)
2. **差异化对比:** 每篇文章有 "为什么不一样" 对比 vLLM/TRT-LLM/TGI
3. **深度:** 概念级为主，关键处贴伪代码
4. **不贴源码路径:** 文章中不引用具体文件路径
5. **视觉风格:** SVG W=580, shared COLORS/FONTS, StepNavigator
6. **事实准确性:** 技术细节必须准确，references 必须有效

---

## File Structure

### New Files to Create

**Learning Path:**
- `src/content/paths/ollama-internals.yaml`

**Articles (9):**
- `src/content/articles/zh/ollama-architecture.mdx`
- `src/content/articles/zh/ollama-inference-journey.mdx`
- `src/content/articles/zh/gguf-format.mdx`
- `src/content/articles/zh/ollama-quantization.mdx`
- `src/content/articles/zh/ollama-compute-graph.mdx`
- `src/content/articles/zh/ollama-kv-cache-scheduling.mdx`
- `src/content/articles/zh/ollama-hardware-backends.mdx`
- `src/content/articles/zh/ollama-server-scheduling.mdx`
- `src/content/articles/zh/ollama-model-ecosystem.mdx`

**Components (25):**
- `src/components/interactive/OllamaArchitectureOverview.tsx`
- `src/components/interactive/DualEngineSelector.tsx`
- `src/components/interactive/FrameworkComparison.tsx`
- `src/components/interactive/InferenceJourney.tsx`
- `src/components/interactive/PrefillVsDecode.tsx`
- `src/components/interactive/GGUFFileStructure.tsx`
- `src/components/interactive/GGUFvsOtherFormats.tsx`
- `src/components/interactive/QuantizationProcess.tsx`
- `src/components/interactive/KQuantMixedPrecision.tsx`
- `src/components/interactive/QuantizationTradeoff.tsx`
- `src/components/interactive/GGMLGraphBuilder.tsx`
- `src/components/interactive/OperatorFusion.tsx`
- `src/components/interactive/DualRunnerComparison.tsx`
- `src/components/interactive/KVCacheSlotManager.tsx`
- `src/components/interactive/PrefixCacheHit.tsx`
- `src/components/interactive/ContinuousBatchingTimeline.tsx`
- `src/components/interactive/BackendArchitecture.tsx`
- `src/components/interactive/DeviceSplitVisualizer.tsx`
- `src/components/interactive/BackendPerformanceCompare.tsx`
- `src/components/interactive/RunnerLifecycle.tsx`
- `src/components/interactive/MemoryBudgetCalculator.tsx`
- `src/components/interactive/MultiModelScheduler.tsx`
- `src/components/interactive/RegistryPullFlow.tsx`
- `src/components/interactive/ModelfileBuilder.tsx`
- `src/components/interactive/MultimodalPipeline.tsx`

### Files to Modify
- `src/pages/zh/paths/[id].astro` — may need update if path rendering has issues (verify only)

---

## Task 1: Article 1 — 架构总览 (ollama-architecture)

**Components:** OllamaArchitectureOverview, DualEngineSelector, FrameworkComparison
**Article:** `src/content/articles/zh/ollama-architecture.mdx`

### Step 1.1: Create OllamaArchitectureOverview component

**Files:**
- Create: `src/components/interactive/OllamaArchitectureOverview.tsx`

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

// Ollama modules (blue)
const OLLAMA_MODULES = [
  { id: 'server', label: 'HTTP Server', x: 200, y: 50, w: 160, h: 32,
    desc: 'Gin HTTP server, 处理 /api/chat, /api/generate 等 API 请求' },
  { id: 'scheduler', label: 'Scheduler', x: 200, y: 100, w: 160, h: 32,
    desc: '调度器: 管理模型加载/卸载, 请求排队, 内存预算' },
  { id: 'llm', label: 'LLM Runner Manager', x: 200, y: 150, w: 160, h: 32,
    desc: '管理 runner 子进程的启动、健康检查和生命周期' },
];

// llama.cpp modules (orange)  
const LLAMACPP_MODULES = [
  { id: 'ollamarunner', label: 'ollamarunner', x: 80, y: 230, w: 140, h: 32,
    desc: '纯 Go 推理引擎, ~21 架构, pipeline async 执行' },
  { id: 'llamarunner', label: 'llamarunner', x: 340, y: 230, w: 140, h: 32,
    desc: 'llama.cpp CGo 绑定, ~120+ 架构, 同步执行, 兼容性后备' },
  { id: 'ggml', label: 'GGML Backend', x: 170, y: 310, w: 220, h: 32,
    desc: '底层 tensor 计算库: 计算图构建、算子融合、多后端调度' },
  { id: 'backends', label: 'CUDA / Metal / Vulkan / CPU', x: 120, y: 360, w: 320, h: 28,
    desc: '硬件后端: CUDA (NVIDIA), Metal (Apple), Vulkan (跨平台), CPU (SIMD)' },
];

export default function OllamaArchitectureOverview() {
  const [selected, setSelected] = useState<string | null>(null);
  const selModule = [...OLLAMA_MODULES, ...LLAMACPP_MODULES].find(m => m.id === selected);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Ollama + llama.cpp 双层架构
        </text>

        {/* Language boundary labels */}
        <text x={30} y={70} fontSize="8" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Go</text>
        <text x={30} y={250} fontSize="8" fontWeight="600" fill={COLORS.orange}
          fontFamily={FONTS.sans}>Go / C++</text>
        <text x={30} y={330} fontSize="8" fontWeight="600" fill={COLORS.orange}
          fontFamily={FONTS.sans}>C</text>

        {/* Boundary line */}
        <line x1={50} y1={200} x2={530} y2={200}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,3" />
        <text x={540} y={204} fontSize="7" fill="#94a3b8" fontFamily={FONTS.sans}>
          进程边界
        </text>

        {/* Ollama modules (blue) */}
        {OLLAMA_MODULES.map(m => (
          <g key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={6}
              fill={selected === m.id ? '#bfdbfe' : '#dbeafe'}
              stroke={COLORS.primary} strokeWidth={selected === m.id ? 2 : 1.2} />
            <text x={m.x + m.w / 2} y={m.y + m.h / 2 + 4} textAnchor="middle"
              fontSize="9" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              {m.label}
            </text>
          </g>
        ))}

        {/* llama.cpp modules (orange) */}
        {LLAMACPP_MODULES.map(m => (
          <g key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={6}
              fill={selected === m.id ? '#fed7aa' : '#fef3c7'}
              stroke={COLORS.orange} strokeWidth={selected === m.id ? 2 : 1.2} />
            <text x={m.x + m.w / 2} y={m.y + m.h / 2 + 4} textAnchor="middle"
              fontSize="9" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.sans}>
              {m.label}
            </text>
          </g>
        ))}

        {/* Arrows: server → scheduler → llm */}
        <defs>
          <marker id="ola-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <line x1={280} y1={82} x2={280} y2={100}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />
        <line x1={280} y1={132} x2={280} y2={150}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />

        {/* LLM → runners (fork) */}
        <line x1={230} y1={182} x2={150} y2={230}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />
        <line x1={330} y1={182} x2={410} y2={230}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />

        {/* runners → ggml */}
        <line x1={150} y1={262} x2={230} y2={310}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />
        <line x1={410} y1={262} x2={330} y2={310}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />

        {/* ggml → backends */}
        <line x1={280} y1={342} x2={280} y2={360}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />

        {/* HTTP annotation */}
        <text x={280} y={214} textAnchor="middle" fontSize="7" fill="#94a3b8"
          fontFamily={FONTS.sans}>localhost HTTP</text>
      </svg>

      {/* Detail panel */}
      {selModule && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border">
          <span className="font-semibold">{selModule.label}:</span> {selModule.desc}
        </div>
      )}
      {!selModule && (
        <p className="mt-2 text-xs text-gray-400 text-center">点击模块查看详情</p>
      )}
    </div>
  );
}
```

- [ ] Create the file with the code above
- [ ] Verify it compiles: `npm run dev` and check for errors in terminal

### Step 1.2: Create DualEngineSelector component

**Files:**
- Create: `src/components/interactive/DualEngineSelector.tsx`

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 260;

export default function DualEngineSelector() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Runner 选择逻辑: ollamarunner vs llamarunner
      </text>

      <defs>
        <marker id="des-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Input: model */}
      <rect x={220} y={35} width={140} height={28} rx={14}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />
      <text x={290} y={53} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>GGUF Model</text>

      {/* Arrow down */}
      <line x1={290} y1={63} x2={290} y2={85}
        stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#des-arr)" />

      {/* Decision diamond */}
      <polygon points="290,85 370,115 290,145 210,115"
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={290} y={112} textAnchor="middle" fontSize="7.5" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>model.New</text>
      <text x={290} y={122} textAnchor="middle" fontSize="7.5" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>TextProcessor?</text>

      {/* Left branch: success → ollamarunner */}
      <line x1={210} y1={115} x2={120} y2={115}
        stroke={COLORS.primary} strokeWidth={1.2} markerEnd="url(#des-arr)" />
      <text x={165} y={108} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>成功</text>

      <rect x={30} y={100} width={90} height={50} rx={6}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={75} y={118} textAnchor="middle" fontSize="8" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>ollamarunner</text>
      <text x={75} y={130} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>纯 Go, ~21 架构</text>
      <text x={75} y={140} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>Pipeline async</text>

      {/* Right branch: fail → llamarunner */}
      <line x1={370} y1={115} x2={460} y2={115}
        stroke={COLORS.orange} strokeWidth={1.2} markerEnd="url(#des-arr)" />
      <text x={415} y={108} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>失败</text>

      <rect x={460} y={100} width={90} height={50} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={505} y={118} textAnchor="middle" fontSize="8" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>llamarunner</text>
      <text x={505} y={130} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>llama.cpp CGo, ~120+</text>
      <text x={505} y={140} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>Sync 执行</text>

      {/* Both → GGML */}
      <line x1={75} y1={150} x2={240} y2={200}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#des-arr)" />
      <line x1={505} y1={150} x2={340} y2={200}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#des-arr)" />

      <rect x={210} y={200} width={160} height={28} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={290} y={218} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>GGML Backend (共享)</text>

      {/* Legend */}
      <rect x={30} y={H - 22} width={10} height={10} rx={2}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={44} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Ollama (Go) — 新方向, 更快
      </text>
      <rect x={250} y={H - 22} width={10} height={10} rx={2}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={264} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        llama.cpp (C/C++) — 兼容性后备
      </text>
    </svg>
  );
}
```

- [ ] Create the file with the code above
- [ ] Verify it compiles

### Step 1.3: Create FrameworkComparison component

**Files:**
- Create: `src/components/interactive/FrameworkComparison.tsx`

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface FrameworkInfo {
  name: string;
  lang: string;
  deploy: string;
  format: string;
  quant: string;
  backend: string;
  kvMgmt: string;
  color: string;
}

const FRAMEWORKS: FrameworkInfo[] = [
  {
    name: 'Ollama + llama.cpp',
    lang: 'Go + C/C++',
    deploy: '桌面/边缘, 单二进制',
    format: 'GGUF (自包含)',
    quant: 'K-quant (无需校准)',
    backend: 'CUDA + Metal + Vulkan + CPU',
    kvMgmt: 'Slot-based, Prefix Cache',
    color: COLORS.primary,
  },
  {
    name: 'vLLM',
    lang: 'Python + CUDA',
    deploy: '服务器, GPU 必须',
    format: 'safetensors / HF',
    quant: 'GPTQ, AWQ, FP8',
    backend: 'CUDA only',
    kvMgmt: 'PagedAttention',
    color: '#7c3aed',
  },
  {
    name: 'TensorRT-LLM',
    lang: 'C++ + Python',
    deploy: '服务器, NVIDIA 专用',
    format: '编译后引擎文件',
    quant: 'FP8, INT4/INT8 (TRT)',
    backend: 'CUDA only (TensorRT)',
    kvMgmt: 'Paged KV Cache',
    color: '#059669',
  },
  {
    name: 'TGI (HuggingFace)',
    lang: 'Rust + Python',
    deploy: '服务器, 云端服务',
    format: 'safetensors / HF',
    quant: 'GPTQ, AWQ, bitsandbytes',
    backend: 'CUDA (+ 部分 ROCm)',
    kvMgmt: 'Flash-Attention v2',
    color: '#d97706',
  },
];

const COLS = ['lang', 'deploy', 'format', 'quant', 'backend', 'kvMgmt'] as const;
const COL_LABELS: Record<typeof COLS[number], string> = {
  lang: '语言',
  deploy: '部署场景',
  format: '模型格式',
  quant: '量化方案',
  backend: '硬件后端',
  kvMgmt: 'KV Cache',
};

export default function FrameworkComparison() {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left bg-gray-50 border border-gray-200 font-semibold text-gray-700 w-28">
              框架
            </th>
            {COLS.map(col => (
              <th key={col}
                className="p-2 text-left bg-gray-50 border border-gray-200 font-semibold text-gray-700">
                {COL_LABELS[col]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FRAMEWORKS.map((fw, ri) => (
            <tr key={fw.name}>
              <td className="p-2 border border-gray-200 font-semibold"
                style={{ color: fw.color }}>
                {fw.name}
              </td>
              {COLS.map((col, ci) => (
                <td key={col}
                  className="p-2 border border-gray-200 transition-colors"
                  style={{
                    backgroundColor:
                      hovered?.row === ri && hovered?.col === ci
                        ? '#f0f9ff' : undefined,
                  }}
                  onMouseEnter={() => setHovered({ row: ri, col: ci })}
                  onMouseLeave={() => setHovered(null)}>
                  {fw[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-1 text-center">
        hover 单元格查看详情
      </p>
    </div>
  );
}
```

- [ ] Create the file with the code above
- [ ] Verify it compiles

### Step 1.4: Create ollama-architecture.mdx article

**Files:**
- Create: `src/content/articles/zh/ollama-architecture.mdx`

Write the full article following the spec's Section 1-6 outline. Key structure:

```mdx
---
title: "Ollama + llama.cpp 架构总览"
slug: "ollama-architecture"
locale: "zh"
tags: ["ollama", "llama-cpp", "architecture", "inference"]
difficulty: "intermediate"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "github"
    title: "Ollama GitHub"
    url: "https://github.com/ollama/ollama"
  - type: "github"
    title: "llama.cpp GitHub"
    url: "https://github.com/ggerganov/llama.cpp"
  - type: "github"
    title: "GGML GitHub"
    url: "https://github.com/ggerganov/ggml"
---

import OllamaArchitectureOverview from '../../../components/interactive/OllamaArchitectureOverview.tsx';
import DualEngineSelector from '../../../components/interactive/DualEngineSelector.tsx';
import FrameworkComparison from '../../../components/interactive/FrameworkComparison.tsx';

## 为什么需要 Ollama + llama.cpp

[Content about local inference needs, privacy, offline, cost vs cloud APIs]
[Position: Ollama = Docker for LLMs]

## 双层架构

[Ollama (Go) = service layer, llama.cpp/GGML (C/C++) = inference engine]
[Why two layers: Go for networking/concurrency, C/C++ for compute/hardware]
[Subprocess + HTTP communication]

<OllamaArchitectureOverview client:visible />

## 核心组件地图

[Server → Scheduler → LLM → Runner → Model → GGML Backend]
[One-sentence description per component]
[Data flow vs control flow]

## 双引擎设计

[ollamarunner vs llamarunner]
[Selection logic: try NewTextProcessor → success = ollamarunner, fail = llamarunner]
[Why rewrite in Go: pipeline execution, less CGo overhead]

<DualEngineSelector client:visible />

## 和主流推理框架的对比

[vs vLLM, TensorRT-LLM, TGI]
[Ollama's unique position: desktop/edge, multi-backend, single binary, CPU support]

<FrameworkComparison client:visible />

## 技术选型

[Go + C/C++ hybrid: why not pure C++ or Python]
[mmap model loading: why not load entirely into memory]
[Single binary distribution: why no Python dependencies]
```

- [ ] Create the MDX file with full content (not just outlines — write the actual Chinese text for all sections)
- [ ] Verify `npm run dev` renders the page at `/zh/articles/ollama-architecture`
- [ ] Verify all 3 components render correctly

### Step 1.5: Commit Article 1

```bash
git add src/components/interactive/OllamaArchitectureOverview.tsx \
        src/components/interactive/DualEngineSelector.tsx \
        src/components/interactive/FrameworkComparison.tsx \
        src/content/articles/zh/ollama-architecture.mdx
git commit -m "feat: add Ollama architecture overview article with 3 components"
```

- [ ] Stage and commit

---

## Task 2: Article 2 — 一次推理的完整旅程 (ollama-inference-journey)

**Components:** InferenceJourney (StepNavigator, 6步), PrefillVsDecode (静态)
**Article:** `src/content/articles/zh/ollama-inference-journey.mdx`

### Step 2.1: Create InferenceJourney component

**Files:**
- Create: `src/components/interactive/InferenceJourney.tsx`

This is a StepNavigator component with 6 steps, tracing a Qwen3 inference request through the full stack. Each step shows which layer (Ollama blue / llama.cpp orange) is active.

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

// Helper: colored box for Ollama (blue) or llama.cpp (orange)
function LayerBox({ x, y, w, h, label, sub, side }: {
  x: number; y: number; w: number; h: number;
  label: string; sub: string; side: 'ollama' | 'llamacpp' | 'both';
}) {
  const fill = side === 'ollama' ? '#dbeafe' : side === 'llamacpp' ? '#fef3c7' : '#f0e6ff';
  const stroke = side === 'ollama' ? COLORS.primary : side === 'llamacpp' ? COLORS.orange : '#7c3aed';
  const textFill = side === 'ollama' ? COLORS.primary : side === 'llamacpp' ? COLORS.orange : '#7c3aed';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" fontSize="9"
        fontWeight="600" fill={textFill} fontFamily={FONTS.sans}>{label}</text>
      <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fontSize="7"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{sub}</text>
    </g>
  );
}

const steps = [
  {
    title: 'Step 1: Prompt 输入',
    content: (
      <StepSvg h={160}>
        <LayerBox x={40} y={20} w={130} h={40} label="CLI 解析" sub="ollama run qwen3 ..." side="ollama" />
        <LayerBox x={220} y={20} w={150} h={40} label="构造 HTTP 请求" sub="POST /api/chat" side="ollama" />
        <LayerBox x={420} y={20} w={120} h={40} label="Gin Router" sub="路由到 ChatHandler" side="ollama" />
        {/* arrows */}
        <line x1={170} y1={40} x2={220} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={370} y1={40} x2={420} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <defs>
          <marker id="ij-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x={W / 2} y={90} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          用户输入 "解释量子计算" → CLI 构造请求 → Server 路由处理
        </text>
        <rect x={180} y={105} width={220} height={18} rx={4}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
        <text x={290} y={117} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          全部在 Ollama (Go) 层
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: 模型加载',
    content: (
      <StepSvg h={160}>
        <LayerBox x={30} y={20} w={120} h={40} label="定位 GGUF" sub="本地 blob 存储" side="ollama" />
        <LayerBox x={190} y={20} w={120} h={40} label="mmap 映射" sub="文件 → 虚拟内存" side="llamacpp" />
        <LayerBox x={350} y={20} w={180} h={40} label="Tensor 分配" sub="按显存预算分 GPU/CPU" side="llamacpp" />
        <line x1={150} y1={40} x2={190} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={310} y1={40} x2={350} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <text x={W / 2} y={90} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Ollama 定位文件 → llama.cpp/GGML 负责 mmap 和 tensor 分配
        </text>
        <rect x={130} y={105} width={100} height={16} rx={3}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
        <text x={180} y={116} textAnchor="middle" fontSize="6.5" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Ollama 侧</text>
        <rect x={270} y={105} width={100} height={16} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.8} />
        <text x={320} y={116} textAnchor="middle" fontSize="6.5" fill={COLORS.orange}
          fontFamily={FONTS.sans}>llama.cpp 侧</text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: Runner 启动',
    content: (
      <StepSvg h={160}>
        <LayerBox x={30} y={20} w={140} h={40} label="启动子进程" sub="ollamarunner / llamarunner" side="ollama" />
        <LayerBox x={220} y={20} w={140} h={40} label="内部 HTTP Server" sub="子进程监听端口" side="both" />
        <LayerBox x={410} y={20} w={140} h={40} label="初始化" sub="构建计算图, 分配 KV Cache" side="llamacpp" />
        <line x1={170} y1={40} x2={220} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={360} y1={40} x2={410} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <text x={W / 2} y={95} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Ollama 主进程 fork runner 子进程 → 子进程初始化推理基础设施
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 4: Prefill 阶段',
    content: (
      <StepSvg h={180}>
        <LayerBox x={20} y={15} w={100} h={35} label="Tokenize" sub=""解释量子计算" → IDs" side="both" />
        <LayerBox x={145} y={15} w={90} h={35} label="组装 Batch" sub="N tokens 并行" side="llamacpp" />
        <LayerBox x={260} y={15} w={110} h={35} label="构建计算图" sub="+ 算子融合" side="llamacpp" />
        <LayerBox x={395} y={15} w={140} h={35} label="GPU Forward Pass" sub="所有位置的 logits" side="llamacpp" />
        <line x1={120} y1={32} x2={145} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={235} y1={32} x2={260} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={370} y1={32} x2={395} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <text x={W / 2} y={80} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          所有 prompt token 一次性通过模型 → KV Cache 被填充
        </text>
        {/* Wide batch visual */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={100 + i * 48} y={95} width={40} height={20} rx={3}
            fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.8} />
        ))}
        <text x={W / 2} y={108} textAnchor="middle" fontSize="7" fill={COLORS.orange}
          fontFamily={FONTS.sans}>并行处理 N 个 token (宽 batch)</text>
        <text x={W / 2} y={140} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          Prefill: 计算密集 (compute-bound)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 5: Decode 阶段',
    content: (
      <StepSvg h={180}>
        <LayerBox x={20} y={15} w={110} h={35} label="Sampling" sub="logits → token ID" side="both" />
        <LayerBox x={155} y={15} w={100} h={35} label="Decode Step" sub="batch=1, 新 KV 追加" side="llamacpp" />
        <LayerBox x={280} y={15} w={110} h={35} label="流式输出" sub="HTTP chunked response" side="ollama" />
        <LayerBox x={415} y={15} w={130} h={35} label="循环" sub="直到 EOS 或 max_tokens" side="llamacpp" />
        <line x1={130} y1={32} x2={155} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={255} y1={32} x2={280} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={390} y1={32} x2={415} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        {/* Narrow batch visual */}
        <rect x={255} y={90} width={50} height={20} rx={3}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
        <text x={280} y={103} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans}>1 token</text>
        <text x={W / 2} y={135} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          Decode: 带宽密集 (memory-bound), 逐 token 生成
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 6: Prefix Cache 命中',
    content: (
      <StepSvg h={180}>
        {/* First request tokens */}
        <text x={20} y={25} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>请求 1: "解释量子计算"</text>
        {['解释', '量子', '计算'].map((t, i) => (
          <rect key={i} x={20 + i * 65} y={32} width={58} height={22} rx={3}
            fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
        ))}
        {['解释', '量子', '计算'].map((t, i) => (
          <text key={`t${i}`} x={49 + i * 65} y={46} textAnchor="middle" fontSize="7"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t}</text>
        ))}
        <text x={230} y={46} fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
          ✓ KV Cache 已缓存
        </text>

        {/* Second request */}
        <text x={20} y={80} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>请求 2: "解释量子纠缠"</text>
        {['解释', '量子'].map((t, i) => (
          <rect key={i} x={20 + i * 65} y={87} width={58} height={22} rx={3}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.2} />
        ))}
        {['解释', '量子'].map((t, i) => (
          <text key={`t2${i}`} x={49 + i * 65} y={101} textAnchor="middle" fontSize="7"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t} (复用)</text>
        ))}
        <rect x={150} y={87} width={58} height={22} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
        <text x={179} y={101} textAnchor="middle" fontSize="7"
          fill={COLORS.orange} fontFamily={FONTS.sans}>纠缠 (新)</text>

        <text x={W / 2} y={140} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          前缀匹配 "解释量子" → 跳过已有 KV → 只 prefill "纠缠"
        </text>
        <text x={W / 2} y={158} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          节省 ~67% prefill 计算量
        </text>
      </StepSvg>
    ),
  },
];

export default function InferenceJourney() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] Create the file with the code above
- [ ] Verify it compiles

### Step 2.2: Create PrefillVsDecode component

**Files:**
- Create: `src/components/interactive/PrefillVsDecode.tsx`

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 200;

export default function PrefillVsDecode() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Prefill vs Decode: 两个阶段的本质区别
      </text>

      {/* Prefill side (left) */}
      <text x={145} y={42} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Prefill 阶段</text>

      {/* Wide batch visualization */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={30 + i * 38} y={52} width={34} height={50} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.8} />
      ))}
      <text x={145} y={80} textAnchor="middle" fontSize="7" fill={COLORS.orange}
        fontFamily={FONTS.sans}>N tokens 并行</text>

      <text x={145} y={118} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Compute-bound</text>
      <text x={145} y={130} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>高 GPU 利用率</text>
      <text x={145} y={142} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>填充 KV Cache</text>

      {/* Divider */}
      <line x1={290} y1={35} x2={290} y2={165} stroke="#e2e8f0" strokeWidth={1}
        strokeDasharray="4,3" />

      {/* Decode side (right) */}
      <text x={435} y={42} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Decode 阶段</text>

      {/* Narrow batch visualization */}
      <rect x={415} y={52} width={40} height={50} rx={3}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={435} y={80} textAnchor="middle" fontSize="7" fill={COLORS.primary}
        fontFamily={FONTS.sans}>1 token</text>

      <text x={435} y={118} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Memory-bound</text>
      <text x={435} y={130} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>KV Cache 读取为瓶颈</text>
      <text x={435} y={142} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>逐 token 生成, 追加 KV</text>

      {/* Qwen3 params annotation */}
      <rect x={100} y={H - 30} width={380} height={22} rx={4}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={0.8} />
      <text x={W / 2} y={H - 15} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        Qwen3-8B: hidden_dim=4096, num_heads=32, num_kv_heads=8 (GQA), num_layers=32
      </text>
    </svg>
  );
}
```

- [ ] Create the file with the code above
- [ ] Verify it compiles

### Step 2.3: Create ollama-inference-journey.mdx article

**Files:**
- Create: `src/content/articles/zh/ollama-inference-journey.mdx`

```mdx
---
title: "一次推理的完整旅程"
slug: "ollama-inference-journey"
locale: "zh"
tags: ["ollama", "llama-cpp", "inference", "pipeline"]
prerequisites: ["ollama-architecture"]
difficulty: "intermediate"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "github"
    title: "Ollama GitHub"
    url: "https://github.com/ollama/ollama"
  - type: "paper"
    title: "Qwen3 Technical Report"
    url: "https://arxiv.org/abs/2505.09388"
---

import InferenceJourney from '../../../components/interactive/InferenceJourney.tsx';
import PrefillVsDecode from '../../../components/interactive/PrefillVsDecode.tsx';
```

Content sections:
1. **核心设计说明** — 用 Qwen3 模型追踪 `ollama run qwen3 "解释量子计算"` 全链路
2. **Prompt 输入** — CLI → HTTP → Server routing (all Ollama/Go)
3. **模型加载** — GGUF locate → mmap → tensor split (Ollama → llama.cpp)
4. **Runner 启动** — subprocess → internal HTTP → init (cross-boundary)
5. **Prefill 阶段** — tokenize → batch → compute graph → GPU forward (mostly llama.cpp)
6. **Decode 阶段** — sampling → decode step → stream output → loop (cross-boundary)
7. **Prefix Cache 命中** — second request reuses KV cache prefix

Place `<InferenceJourney client:visible />` after Section 1 intro.
Place `<PrefillVsDecode client:visible />` between Prefill and Decode sections.

- [ ] Create the MDX file with full Chinese content
- [ ] Verify rendering at `/zh/articles/ollama-inference-journey`
- [ ] Verify both components render correctly

### Step 2.4: Commit Article 2

```bash
git add src/components/interactive/InferenceJourney.tsx \
        src/components/interactive/PrefillVsDecode.tsx \
        src/content/articles/zh/ollama-inference-journey.mdx
git commit -m "feat: add Ollama inference journey article with 2 components"
```

- [ ] Stage and commit

---

## Task 3: Article 3 — GGUF 模型格式 (gguf-format)

**Components:** GGUFFileStructure (交互), GGUFvsOtherFormats (静态)
**Article:** `src/content/articles/zh/gguf-format.mdx`

### Step 3.1: Create GGUFFileStructure component

**Files:**
- Create: `src/components/interactive/GGUFFileStructure.tsx`

Interactive GGUF file layout — click each region to expand details. Shows header fields, metadata KV section, tensor info section, and tensor data section.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Region {
  id: string;
  label: string;
  y: number;
  h: number;
  color: string;
  fill: string;
  details: string[];
  annotation: string;
}

const REGIONS: Region[] = [
  {
    id: 'header', label: 'Header', y: 45, h: 50, color: '#7c3aed', fill: '#ede9fe',
    details: [
      'Magic: "GGUF" (4 bytes)',
      'Version: 3 (uint32)',
      'Tensor count: 291 (uint64)',
      'Metadata KV count: 26 (uint64)',
    ],
    annotation: '固定 24 bytes',
  },
  {
    id: 'metadata', label: 'Metadata KV', y: 100, h: 70, color: COLORS.primary, fill: '#dbeafe',
    details: [
      'general.architecture = "qwen3"',
      'general.name = "Qwen3-4B"',
      'qwen3.block_count = 36',
      'qwen3.embedding_length = 2560',
      'tokenizer.ggml.model = "gpt2"',
      'tokenizer.ggml.tokens = [array of 151665]',
      'tokenizer.chat_template = "{% for message in..."',
    ],
    annotation: '类型化 KV: string, uint32, float32, array...',
  },
  {
    id: 'tensorinfo', label: 'Tensor Info', y: 175, h: 60, color: COLORS.orange, fill: '#fef3c7',
    details: [
      '每个 tensor: name + shape + type + offset',
      'blk.0.attn_q.weight: [2560, 2560], Q4_K_M, offset=0',
      'blk.0.attn_k.weight: [512, 2560], Q4_K_M, offset=3440640',
      '... (共 291 个 tensor)',
    ],
    annotation: '描述每个 tensor 的元数据, 不含实际数据',
  },
  {
    id: 'tensordata', label: 'Tensor Data', y: 240, h: 90, color: COLORS.green, fill: '#dcfce7',
    details: [
      '按 32 字节对齐 (mmap + SIMD 友好)',
      '实际量化后的权重数据',
      '直接 mmap 映射, 按需访问, 无需全部加载',
      'Qwen3-4B Q4_K_M: ~2.6 GB',
    ],
    annotation: '文件主体, 占 >95% 文件大小',
  },
];

export default function GGUFFileStructure() {
  const [selected, setSelected] = useState<string | null>(null);
  const selRegion = REGIONS.find(r => r.id === selected);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          GGUF 文件结构 (以 Qwen3-4B Q4_K_M 为例)
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          点击各区域查看详情 | 单文件自包含: 权重 + tokenizer + 模型配置 + prompt template
        </text>

        {REGIONS.map(r => (
          <g key={r.id} onClick={() => setSelected(selected === r.id ? null : r.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={100} y={r.y} width={300} height={r.h} rx={6}
              fill={selected === r.id ? r.fill : r.fill}
              stroke={r.color}
              strokeWidth={selected === r.id ? 2.5 : 1.2}
              opacity={selected && selected !== r.id ? 0.4 : 1} />
            <text x={250} y={r.y + r.h / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="700" fill={r.color} fontFamily={FONTS.sans}>
              {r.label}
            </text>
            {/* Right annotation */}
            <text x={415} y={r.y + r.h / 2 + 3} fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>
              {r.annotation}
            </text>
          </g>
        ))}

        {/* File size annotation */}
        <text x={250} y={H - 30} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Qwen3-4B Q4_K_M: 291 tensors, 26 metadata KV, ~2.6 GB 总大小
        </text>
      </svg>

      {/* Detail panel */}
      {selRegion && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm">
          <p className="font-semibold mb-1" style={{ color: selRegion.color }}>
            {selRegion.label}
          </p>
          <ul className="space-y-0.5 text-gray-600 text-xs">
            {selRegion.details.map((d, i) => (
              <li key={i} className="font-mono">{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] Create the file with the code above
- [ ] Verify it compiles

### Step 3.2: Create GGUFvsOtherFormats component

**Files:**
- Create: `src/components/interactive/GGUFvsOtherFormats.tsx`

Static SVG comparison table: GGUF vs safetensors vs ONNX.

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

const FORMATS = [
  { name: 'GGUF', x: 40, color: COLORS.orange },
  { name: 'safetensors', x: 220, color: COLORS.primary },
  { name: 'ONNX', x: 400, color: '#7c3aed' },
];

const ROWS = [
  {
    label: '包含内容',
    values: [
      '权重 + tokenizer\n+ 配置 + template',
      '权重 + 最小 metadata',
      '计算图 + 权重\n+ 运行时配置',
    ],
  },
  {
    label: '文件数量',
    values: ['单文件', '多文件 (HF repo)', '多文件'],
  },
  {
    label: '加载方式',
    values: ['mmap (按需)', '全量加载', '全量加载'],
  },
  {
    label: '量化支持',
    values: ['内嵌 (Q4_K 等)', '外部工具', '外部量化'],
  },
  {
    label: '设计目标',
    values: ['推理部署优化', '安全 tensor 存储', '跨框架通用'],
  },
];

export default function GGUFvsOtherFormats() {
  const colW = 160;
  const rowH = 38;
  const startY = 55;
  const labelX = 15;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        模型格式对比: GGUF vs safetensors vs ONNX
      </text>

      {/* Column headers */}
      {FORMATS.map((f, i) => (
        <g key={f.name}>
          <rect x={f.x + 75} y={30} width={colW - 10} height={22} rx={4}
            fill="white" stroke={f.color} strokeWidth={1.5} />
          <text x={f.x + 75 + (colW - 10) / 2} y={44} textAnchor="middle"
            fontSize="8" fontWeight="700" fill={f.color} fontFamily={FONTS.sans}>
            {f.name}
          </text>
        </g>
      ))}

      {/* Rows */}
      {ROWS.map((row, ri) => {
        const y = startY + ri * rowH;
        return (
          <g key={row.label}>
            {/* Row background */}
            {ri % 2 === 0 && (
              <rect x={0} y={y} width={W} height={rowH} fill="#f8fafc" />
            )}
            {/* Row label */}
            <text x={labelX} y={y + rowH / 2 + 3} fontSize="7.5" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {row.label}
            </text>
            {/* Values */}
            {FORMATS.map((f, ci) => {
              const lines = row.values[ci].split('\n');
              return lines.map((line, li) => (
                <text key={`${ci}-${li}`}
                  x={f.x + 75 + (colW - 10) / 2}
                  y={y + rowH / 2 + 3 + (li - (lines.length - 1) / 2) * 10}
                  textAnchor="middle" fontSize="7" fill={COLORS.mid}
                  fontFamily={FONTS.sans}>
                  {line}
                </text>
              ));
            })}
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] Create the file with the code above
- [ ] Verify it compiles

### Step 3.3: Create gguf-format.mdx article

**Files:**
- Create: `src/content/articles/zh/gguf-format.mdx`

```mdx
---
title: "GGUF 模型格式"
slug: "gguf-format"
locale: "zh"
tags: ["gguf", "llama-cpp", "model-format", "serialization"]
prerequisites: ["ollama-architecture"]
difficulty: "intermediate"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "github"
    title: "GGUF Specification"
    url: "https://github.com/ggerganov/ggml/blob/master/docs/gguf.md"
  - type: "website"
    title: "Safetensors Documentation"
    url: "https://huggingface.co/docs/safetensors/"
  - type: "website"
    title: "ONNX"
    url: "https://onnx.ai/"
---

import GGUFFileStructure from '../../../components/interactive/GGUFFileStructure.tsx';
import GGUFvsOtherFormats from '../../../components/interactive/GGUFvsOtherFormats.tsx';
```

Content sections per spec:
1. 为什么需要 GGUF (format evolution, vs safetensors/ONNX, design goals)
2. 文件结构 (header, metadata KV, tensor info, tensor data + pseudocode)
3. Metadata 系统 (standardized keys, arch info, tokenizer, template)
4. Tensor 存储布局 (alignment, data types, mmap)
5. 双解析器 (C parser vs Go parser, why two)
6. "为什么不一样" (vs safetensors, vs ONNX)

Place `<GGUFFileStructure client:visible />` after Section 2.
Place `<GGUFvsOtherFormats client:visible />` in Section 6.

- [ ] Create the MDX file with full Chinese content
- [ ] Verify rendering at `/zh/articles/gguf-format`
- [ ] Verify both components render correctly

### Step 3.4: Commit Article 3

```bash
git add src/components/interactive/GGUFFileStructure.tsx \
        src/components/interactive/GGUFvsOtherFormats.tsx \
        src/content/articles/zh/gguf-format.mdx
git commit -m "feat: add GGUF format article with 2 components"
```

- [ ] Stage and commit

---

## Task 4: Article 4 — 量化方案 (ollama-quantization)

**Components:** QuantizationProcess (StepNavigator, 3步), KQuantMixedPrecision (交互), QuantizationTradeoff (交互)
**Article:** `src/content/articles/zh/ollama-quantization.mdx`

### Step 4.1: Create QuantizationProcess component

**Files:**
- Create: `src/components/interactive/QuantizationProcess.tsx`

StepNavigator with 3 steps showing quantization from FP16 → INT4:
- Step 1: FP16 original weights block (32 values) visualized as bars
- Step 2: Compute scale = max(abs) / 7, divide each value by scale, round
- Step 3: Store INT4 values + scale, show dequantized result and error

```tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

// Simulated FP16 weights for a block of 32
function generateWeights(): number[] {
  // Seeded pseudo-random for consistency
  const vals = [
    0.23, -0.87, 0.45, -0.12, 0.91, -0.34, 0.67, -0.55,
    0.78, -0.21, 0.11, -0.99, 0.38, -0.63, 0.82, -0.47,
    0.15, -0.73, 0.56, -0.29, 0.94, -0.08, 0.41, -0.86,
    0.33, -0.61, 0.72, -0.18, 0.88, -0.42, 0.59, -0.95,
  ];
  return vals;
}

export default function QuantizationProcess() {
  const weights = useMemo(() => generateWeights(), []);
  const maxAbs = useMemo(() => Math.max(...weights.map(Math.abs)), [weights]);
  const scale = maxAbs / 7; // Q4_0: 4-bit signed → range [-8, 7]
  const quantized = useMemo(
    () => weights.map(w => Math.round(w / scale)),
    [weights, scale]
  );
  const dequantized = useMemo(
    () => quantized.map(q => q * scale),
    [quantized, scale]
  );
  const errors = useMemo(
    () => weights.map((w, i) => Math.abs(w - dequantized[i])),
    [weights, dequantized]
  );
  const maxError = Math.max(...errors);
  const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;

  const barW = 14;
  const barMaxH = 60;
  const barX = (i: number) => 30 + i * (barW + 2.5);

  function WeightBars({ values, y, color, label }: {
    values: number[]; y: number; color: string; label: string;
  }) {
    return (
      <g>
        <text x={15} y={y - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{label}</text>
        {values.slice(0, 16).map((v, i) => {
          const h = Math.abs(v) / maxAbs * barMaxH;
          const barY = v >= 0 ? y + barMaxH - h : y + barMaxH;
          return (
            <rect key={i} x={barX(i)} y={barY} width={barW - 1} height={h}
              rx={1} fill={v >= 0 ? color : '#fca5a5'}
              opacity={0.8} />
          );
        })}
        {/* Zero line */}
        <line x1={25} y1={y + barMaxH} x2={barX(16)} y2={y + barMaxH}
          stroke="#94a3b8" strokeWidth={0.5} />
        <text x={barX(16) + 10} y={y + barMaxH / 2 + 3} fontSize="6"
          fill={COLORS.mid} fontFamily={FONTS.sans}>
          (前 16 / 32 个值)
        </text>
      </g>
    );
  }

  const steps = [
    {
      title: 'Step 1: FP16 原始权重',
      content: (
        <StepSvg h={180}>
          <text x={W / 2} y={16} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            一个 block = 32 个 FP16 权重值 (每个 16 bit, 共 64 bytes)
          </text>
          <WeightBars values={weights} y={30} color={COLORS.primary} label="FP16 权重" />
          <text x={W / 2} y={160} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            max|w| = {maxAbs.toFixed(2)}, 范围 [{Math.min(...weights).toFixed(2)}, {Math.max(...weights).toFixed(2)}]
          </text>
        </StepSvg>
      ),
    },
    {
      title: 'Step 2: 量化 (Q4_0)',
      content: (
        <div>
          <div className="p-3 bg-orange-50 rounded-lg mb-3 text-xs font-mono text-orange-800">
            <p className="font-semibold mb-1">Q4_0 对称量化公式:</p>
            <p>scale = max(|w|) / 7 = {maxAbs.toFixed(4)} / 7 = {scale.toFixed(4)}</p>
            <p>q[i] = round(w[i] / scale)</p>
            <p className="mt-1 text-orange-600">每个值: FP16 (16 bit) → INT4 (4 bit), 压缩 4x</p>
          </div>
          <StepSvg h={120}>
            <WeightBars values={quantized} y={10} color={COLORS.orange} label="INT4 量化值" />
            <text x={W / 2} y={105} textAnchor="middle" fontSize="7" fill={COLORS.mid}
              fontFamily={FONTS.sans}>
              量化值范围: [-8, 7] (4-bit signed integer)
            </text>
          </StepSvg>
        </div>
      ),
    },
    {
      title: 'Step 3: 反量化与误差',
      content: (
        <div>
          <div className="p-3 bg-green-50 rounded-lg mb-3 text-xs font-mono text-green-800">
            <p className="font-semibold mb-1">存储: 32 个 INT4 值 (16 bytes) + 1 个 FP16 scale (2 bytes) = 18 bytes</p>
            <p>反量化: w'[i] = q[i] × scale</p>
            <p className="mt-1">最大误差: {maxError.toFixed(4)} | 平均误差: {avgError.toFixed(4)}</p>
            <p className="text-green-600">压缩比: 64 bytes → 18 bytes = 3.6x</p>
          </div>
          <StepSvg h={140}>
            <text x={15} y={12} fontSize="7" fontWeight="600" fill={COLORS.dark}
              fontFamily={FONTS.sans}>量化误差 (|原始 - 反量化|)</text>
            {errors.slice(0, 16).map((e, i) => {
              const h = (e / maxAbs) * 60;
              return (
                <rect key={i} x={barX(i)} y={70 - h} width={barW - 1} height={h}
                  rx={1} fill={COLORS.red} opacity={0.6} />
              );
            })}
            <line x1={25} y1={70} x2={barX(16)} y2={70}
              stroke="#94a3b8" strokeWidth={0.5} />
            <text x={W / 2} y={100} textAnchor="middle" fontSize="7" fill={COLORS.mid}
              fontFamily={FONTS.sans}>
              误差通常 &lt; 0.1, 对最终模型输出影响有限
            </text>
          </StepSvg>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 4.2: Create KQuantMixedPrecision component

**Files:**
- Create: `src/components/interactive/KQuantMixedPrecision.tsx`

Interactive: a Transformer block with submodules (Q/K/V proj, O proj, Gate, Up, Down), switch K-quant scheme to see per-module precision and total size.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 340;

type QuantScheme = 'Q4_K_S' | 'Q4_K_M' | 'Q5_K_M' | 'Q6_K';

interface ModuleInfo {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  // bits per scheme
  bits: Record<QuantScheme, { type: string; bits: number }>;
  paramCount: number; // in millions, for Qwen3-8B single layer
}

const MODULES: ModuleInfo[] = [
  {
    label: 'Q proj', x: 40, y: 80, w: 70, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q6_K', bits: 6.6 },
            Q5_K_M: { type: 'Q6_K', bits: 6.6 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 16.8,
  },
  {
    label: 'K proj', x: 120, y: 80, w: 70, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q6_K', bits: 6.6 },
            Q5_K_M: { type: 'Q6_K', bits: 6.6 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 2.1,
  },
  {
    label: 'V proj', x: 200, y: 80, w: 70, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q6_K', bits: 6.6 },
            Q5_K_M: { type: 'Q6_K', bits: 6.6 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 2.1,
  },
  {
    label: 'O proj', x: 280, y: 80, w: 70, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q4_K', bits: 4.5 },
            Q5_K_M: { type: 'Q5_K', bits: 5.5 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 16.8,
  },
  {
    label: 'Gate', x: 80, y: 200, w: 80, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q4_K', bits: 4.5 },
            Q5_K_M: { type: 'Q5_K', bits: 5.5 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 44.8,
  },
  {
    label: 'Up', x: 200, y: 200, w: 80, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q4_K', bits: 4.5 },
            Q5_K_M: { type: 'Q5_K', bits: 5.5 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 44.8,
  },
  {
    label: 'Down', x: 320, y: 200, w: 80, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q4_K', bits: 4.5 },
            Q5_K_M: { type: 'Q5_K', bits: 5.5 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 44.8,
  },
];

const SCHEMES: QuantScheme[] = ['Q4_K_S', 'Q4_K_M', 'Q5_K_M', 'Q6_K'];

function bitColor(bits: number): string {
  if (bits >= 6) return '#dcfce7'; // high precision = green
  if (bits >= 5) return '#dbeafe'; // medium = blue
  return '#fef3c7'; // low = orange
}

export default function KQuantMixedPrecision() {
  const [scheme, setScheme] = useState<QuantScheme>('Q4_K_M');

  const totalBits = MODULES.reduce((sum, m) => {
    return sum + m.paramCount * m.bits[scheme].bits;
  }, 0);
  const totalParams = MODULES.reduce((sum, m) => sum + m.paramCount, 0);
  const avgBits = totalBits / totalParams;
  const layerSizeMB = totalBits / 8; // rough: paramCount is in millions

  return (
    <div>
      {/* Scheme selector */}
      <div className="flex gap-2 justify-center mb-3">
        {SCHEMES.map(s => (
          <button key={s} onClick={() => setScheme(s)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              scheme === s
                ? 'bg-orange-100 border-orange-400 text-orange-700 font-semibold'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          K-quant 混合精度: {scheme}
        </text>
        <text x={W / 2} y={32} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          一个 Transformer Block 的各子模块量化精度分配 (Qwen3-8B)
        </text>

        {/* Section labels */}
        <text x={180} y={60} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Attention</text>
        <line x1={30} y1={65} x2={360} y2={65} stroke="#e2e8f0" strokeWidth={0.5} />

        <text x={240} y={180} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>FFN (SwiGLU)</text>
        <line x1={70} y1={185} x2={410} y2={185} stroke="#e2e8f0" strokeWidth={0.5} />

        {/* Modules */}
        {MODULES.map(m => {
          const info = m.bits[scheme];
          return (
            <g key={m.label}>
              <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={5}
                fill={bitColor(info.bits)} stroke={COLORS.dark} strokeWidth={0.8} />
              <text x={m.x + m.w / 2} y={m.y + 15} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
                {m.label}
              </text>
              <text x={m.x + m.w / 2} y={m.y + 27} textAnchor="middle"
                fontSize="7" fontWeight="700" fill={COLORS.orange} fontFamily={FONTS.sans}>
                {info.type}
              </text>
              <text x={m.x + m.w / 2} y={m.y + 37} textAnchor="middle"
                fontSize="6" fill={COLORS.mid} fontFamily={FONTS.sans}>
                {info.bits} bpw
              </text>
            </g>
          );
        })}

        {/* Summary */}
        <rect x={120} y={260} width={340} height={50} rx={6}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={290} y={278} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          平均精度: {avgBits.toFixed(1)} bits/weight | 单层大小: ~{layerSizeMB.toFixed(0)} MB
        </text>
        <text x={290} y={293} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Attention 层保高精度 → 维持注意力模式质量 | FFN 层降精度 → 最大化压缩
        </text>

        {/* Legend */}
        <rect x={430} y={80} width={12} height={12} rx={2} fill="#dcfce7" stroke="#94a3b8" strokeWidth={0.5} />
        <text x={448} y={90} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>≥6 bpw</text>
        <rect x={430} y={98} width={12} height={12} rx={2} fill="#dbeafe" stroke="#94a3b8" strokeWidth={0.5} />
        <text x={448} y={108} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>~5 bpw</text>
        <rect x={430} y={116} width={12} height={12} rx={2} fill="#fef3c7" stroke="#94a3b8" strokeWidth={0.5} />
        <text x={448} y={126} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>~4.5 bpw</text>
      </svg>
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 4.3: Create QuantizationTradeoff component

**Files:**
- Create: `src/components/interactive/QuantizationTradeoff.tsx`

Interactive: select quantization scheme, show bar charts for 3 metrics (perplexity delta, tokens/s, VRAM).

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

type QType = 'Q4_0' | 'Q4_K_S' | 'Q4_K_M' | 'Q5_K_M' | 'Q6_K' | 'Q8_0' | 'FP16';

interface QData {
  label: string;
  pplDelta: number; // perplexity increase vs FP16 (lower = better)
  tokensPerSec: number; // tokens/s on RTX 4090
  vramGB: number; // VRAM in GB for Qwen3-8B
  bpw: number;
}

const DATA: Record<QType, QData> = {
  FP16:   { label: 'FP16',    pplDelta: 0,     tokensPerSec: 45,  vramGB: 16.0, bpw: 16 },
  Q8_0:   { label: 'Q8_0',    pplDelta: 0.01,  tokensPerSec: 85,  vramGB: 8.5,  bpw: 8 },
  Q6_K:   { label: 'Q6_K',    pplDelta: 0.03,  tokensPerSec: 95,  vramGB: 6.6,  bpw: 6.6 },
  Q5_K_M: { label: 'Q5_K_M',  pplDelta: 0.05,  tokensPerSec: 105, vramGB: 5.7,  bpw: 5.5 },
  Q4_K_M: { label: 'Q4_K_M',  pplDelta: 0.08,  tokensPerSec: 115, vramGB: 4.9,  bpw: 4.5 },
  Q4_K_S: { label: 'Q4_K_S',  pplDelta: 0.10,  tokensPerSec: 118, vramGB: 4.6,  bpw: 4.5 },
  Q4_0:   { label: 'Q4_0',    pplDelta: 0.15,  tokensPerSec: 120, vramGB: 4.4,  bpw: 4 },
};

const TYPES: QType[] = ['FP16', 'Q8_0', 'Q6_K', 'Q5_K_M', 'Q4_K_M', 'Q4_K_S', 'Q4_0'];

export default function QuantizationTradeoff() {
  const [selected, setSelected] = useState<QType>('Q4_K_M');
  const d = DATA[selected];

  const barChartY = 100;
  const barH = 120;
  const barW = 130;

  function Bar({ x, value, max, label, unit, color }: {
    x: number; value: number; max: number; label: string; unit: string; color: string;
  }) {
    const h = (value / max) * barH;
    return (
      <g>
        <text x={x + barW / 2} y={barChartY - 8} textAnchor="middle" fontSize="8"
          fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
        <rect x={x + 20} y={barChartY + barH - h} width={barW - 40} height={h}
          rx={4} fill={color} opacity={0.8} />
        <text x={x + barW / 2} y={barChartY + barH - h - 5} textAnchor="middle"
          fontSize="8" fontWeight="700" fill={color} fontFamily={FONTS.sans}>
          {value}{unit}
        </text>
        <line x1={x + 10} y1={barChartY + barH} x2={x + barW - 10} y2={barChartY + barH}
          stroke="#e2e8f0" strokeWidth={0.5} />
      </g>
    );
  }

  return (
    <div>
      {/* Scheme selector */}
      <div className="flex gap-1.5 justify-center mb-3 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setSelected(t)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              selected === t
                ? 'bg-orange-100 border-orange-400 text-orange-700 font-semibold'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {DATA[t].label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {d.label} — 精度 / 速度 / 显存 三角 (Qwen3-8B, RTX 4090)
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {d.bpw} bits/weight | 数据为估算值，仅供对比参考
        </text>

        {/* Three bars */}
        <Bar x={30} value={d.pplDelta} max={0.2} label="Perplexity +" unit=""
          color={COLORS.red} />
        <Bar x={220} value={d.tokensPerSec} max={130} label="Tokens/s" unit=""
          color={COLORS.green} />
        <Bar x={410} value={d.vramGB} max={18} label="VRAM (GB)" unit=""
          color={COLORS.primary} />

        {/* Annotation */}
        <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          PPL 越低越好 | Tokens/s 越高越好 | VRAM 越低越好
        </text>
      </svg>
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 4.4: Create ollama-quantization.mdx article

**Files:**
- Create: `src/content/articles/zh/ollama-quantization.mdx`

```mdx
---
title: "量化方案"
slug: "ollama-quantization"
locale: "zh"
tags: ["quantization", "llama-cpp", "gguf", "inference-optimization"]
prerequisites: ["gguf-format"]
difficulty: "advanced"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "github"
    title: "llama.cpp Quantization Types"
    url: "https://github.com/ggerganov/llama.cpp/blob/master/ggml/include/ggml.h"
  - type: "github"
    title: "K-quant PR"
    url: "https://github.com/ggerganov/llama.cpp/pull/1684"
  - type: "paper"
    title: "GPTQ: Accurate Post-Training Quantization"
    url: "https://arxiv.org/abs/2210.17323"
  - type: "paper"
    title: "AWQ: Activation-aware Weight Quantization"
    url: "https://arxiv.org/abs/2306.00978"
---

import QuantizationProcess from '../../../components/interactive/QuantizationProcess.tsx';
import KQuantMixedPrecision from '../../../components/interactive/KQuantMixedPrecision.tsx';
import QuantizationTradeoff from '../../../components/interactive/QuantizationTradeoff.tsx';
```

Content sections per spec:
1. 为什么量化 (FP16 memory bottleneck, triangle tradeoff)
2. 基本量化 Q8_0/Q4_0/Q4_1 (per-block design, pseudocode) + `<QuantizationProcess client:visible />`
3. K-quant 混合精度 (sensitivity-aware, Q4_K_M etc, super-block) + `<KQuantMixedPrecision client:visible />`
4. I-quant (IQ2_XXS etc, importance matrix, codebook)
5. 精度-性能-显存三角 + `<QuantizationTradeoff client:visible />`
6. "为什么不一样" (vs GPTQ, AWQ, FP8)

- [ ] Create the MDX file with full Chinese content
- [ ] Verify rendering at `/zh/articles/ollama-quantization`
- [ ] Verify all 3 components render correctly

### Step 4.5: Commit Article 4

```bash
git add src/components/interactive/QuantizationProcess.tsx \
        src/components/interactive/KQuantMixedPrecision.tsx \
        src/components/interactive/QuantizationTradeoff.tsx \
        src/content/articles/zh/ollama-quantization.mdx
git commit -m "feat: add quantization article with 3 components"
```

- [ ] Stage and commit

---

## Task 5: Article 5 — 计算图与推理引擎 (ollama-compute-graph)

**Components:** GGMLGraphBuilder (StepNavigator, 4步), OperatorFusion (交互), DualRunnerComparison (静态)
**Article:** `src/content/articles/zh/ollama-compute-graph.mdx`

### Step 5.1: Create GGMLGraphBuilder component

**Files:**
- Create: `src/components/interactive/GGMLGraphBuilder.tsx`

StepNavigator with 4 steps, incrementally building a Transformer block compute graph:

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

// Reusable node box
function Node({ x, y, label, shape, color = COLORS.orange }: {
  x: number; y: number; label: string; shape?: string; color?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={110} height={28} rx={5}
        fill={color === COLORS.orange ? '#fef3c7' : '#dbeafe'}
        stroke={color} strokeWidth={1.2} />
      <text x={x + 55} y={y + 13} textAnchor="middle" fontSize="7.5"
        fontWeight="600" fill={color} fontFamily={FONTS.sans}>{label}</text>
      {shape && (
        <text x={x + 55} y={y + 23} textAnchor="middle" fontSize="6"
          fill={COLORS.mid} fontFamily={FONTS.mono}>{shape}</text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke="#94a3b8" strokeWidth={1} markerEnd="url(#gg-arr)" />;
}

const steps = [
  {
    title: 'Step 1: 输入 Tensor',
    content: (
      <StepSvg h={120}>
        <defs>
          <marker id="gg-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <Node x={235} y={20} label="input_embed" shape="(seq, 4096)" />
        <text x={W / 2} y={80} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          ggml_new_tensor_2d(ctx, GGML_TYPE_F32, 4096, seq_len)
        </text>
        <text x={W / 2} y={100} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          空图 + 输入嵌入, 尚未添加任何操作
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: RMSNorm + QKV Projection',
    content: (
      <StepSvg h={200}>
        <defs>
          <marker id="gg-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <Node x={235} y={10} label="input_embed" shape="(seq, 4096)" />
        <Arrow x1={290} y1={38} x2={290} y2={50} />
        <Node x={235} y={50} label="RMSNorm" shape="(seq, 4096)" />
        <Arrow x1={250} y1={78} x2={120} y2={100} />
        <Arrow x1={290} y1={78} x2={290} y2={100} />
        <Arrow x1={330} y1={78} x2={440} y2={100} />
        <Node x={50} y={100} label="Q = Linear" shape="(seq, 4096)" />
        <Node x={235} y={100} label="K = Linear" shape="(seq, 512)" />
        <Node x={400} y={100} label="V = Linear" shape="(seq, 512)" />
        <text x={W / 2} y={160} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          RMSNorm: ggml_rms_norm(x) | Linear: ggml_mul_mat(weight, x)
        </text>
        <text x={W / 2} y={175} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          GQA: Q 有 32 heads, K/V 只有 8 heads (Qwen3-8B)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: RoPE + Attention + O Proj',
    content: (
      <StepSvg h={220}>
        <defs>
          <marker id="gg-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <Node x={50} y={10} label="Q" shape="(seq, 4096)" />
        <Node x={235} y={10} label="K" shape="(seq, 512)" />
        <Node x={400} y={10} label="V" shape="(seq, 512)" />
        <Arrow x1={105} y1={38} x2={105} y2={55} />
        <Arrow x1={290} y1={38} x2={290} y2={55} />
        <Node x={50} y={55} label="RoPE(Q)" shape="旋转位置编码" />
        <Node x={235} y={55} label="RoPE(K)" shape="旋转位置编码" />
        <Arrow x1={105} y1={83} x2={230} y2={105} />
        <Arrow x1={290} y1={83} x2={260} y2={105} />
        <Arrow x1={455} y1={38} x2={310} y2={105} />
        <Node x={190} y={105} label="FlashAttention" shape="fused QKV → output" />
        <Arrow x1={245} y1={133} x2={245} y2={150} />
        <Node x={190} y={150} label="O Projection" shape="(seq, 4096)" />
        <text x={W / 2} y={205} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          FlashAttention 融合了 QK^T/√d → softmax → ×V 三步为单内核
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 4: Residual + FFN (SwiGLU)',
    content: (
      <StepSvg h={240}>
        <defs>
          <marker id="gg-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <Node x={50} y={10} label="input_embed" shape="残差连接" color={COLORS.primary} />
        <Node x={300} y={10} label="Attn Output" shape="(seq, 4096)" />
        <Arrow x1={160} y1={24} x2={225} y2={40} />
        <Arrow x1={355} y1={38} x2={290} y2={40} />
        <Node x={190} y={42} label="Add (残差)" shape="(seq, 4096)" color={COLORS.primary} />
        <Arrow x1={245} y1={70} x2={245} y2={85} />
        <Node x={190} y={85} label="RMSNorm" shape="(seq, 4096)" />
        <Arrow x1={200} y1={113} x2={120} y2={130} />
        <Arrow x1={290} y1={113} x2={350} y2={130} />
        <Node x={50} y={130} label="Gate = Linear" shape="(seq, 11008)" />
        <Node x={290} y={130} label="Up = Linear" shape="(seq, 11008)" />
        <Arrow x1={105} y1={158} x2={200} y2={175} />
        <Arrow x1={345} y1={158} x2={260} y2={175} />
        <Node x={170} y={175} label="SiLU(Gate) × Up" shape="SwiGLU 激活" />
        <Arrow x1={225} y1={203} x2={225} y2={215} />
        <Node x={170} y={215} label="Down = Linear" shape="→ (seq, 4096) + 残差" />
      </StepSvg>
    ),
  },
];

export default function GGMLGraphBuilder() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 5.2: Create OperatorFusion component

**Files:**
- Create: `src/components/interactive/OperatorFusion.tsx`

Interactive: toggle different fusion strategies to see before/after node count.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

type FusionType = 'none' | 'flash_attn' | 'rmsnorm_matmul' | 'glu';

interface FusionInfo {
  label: string;
  desc: string;
  beforeNodes: string[];
  afterNodes: string[];
  savedKernels: number;
}

const FUSIONS: Record<FusionType, FusionInfo> = {
  none: {
    label: '无融合',
    desc: '所有操作独立执行',
    beforeNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
    afterNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
    savedKernels: 0,
  },
  flash_attn: {
    label: 'FlashAttention',
    desc: 'Q/K/V → 单个融合内核, 减少 HBM 读写',
    beforeNodes: ['Q×K^T', 'Scale', 'Mask', 'Softmax', '×V'],
    afterNodes: ['FlashAttn(Q,K,V)'],
    savedKernels: 4,
  },
  rmsnorm_matmul: {
    label: 'RMSNorm + MatMul',
    desc: '归一化和线性变换融合, 减少一次全局读写',
    beforeNodes: ['RMSNorm', 'MatMul'],
    afterNodes: ['FusedRMSNormMatMul'],
    savedKernels: 1,
  },
  glu: {
    label: 'SwiGLU Fusion',
    desc: 'Gate/Up/SiLU/Mul 融合为单内核',
    beforeNodes: ['Gate Linear', 'Up Linear', 'SiLU', 'Mul'],
    afterNodes: ['FusedSwiGLU'],
    savedKernels: 3,
  },
};

const TYPES: FusionType[] = ['none', 'flash_attn', 'rmsnorm_matmul', 'glu'];

function NodeChain({ nodes, x, y, color, label }: {
  nodes: string[]; x: number; y: number; color: string; label: string;
}) {
  const nodeH = 28;
  const gap = 8;
  return (
    <g>
      <text x={x + 60} y={y - 8} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {nodes.map((n, i) => {
        const ny = y + i * (nodeH + gap);
        return (
          <g key={i}>
            <rect x={x} y={ny} width={120} height={nodeH} rx={5}
              fill={color === COLORS.orange ? '#fef3c7' : '#dcfce7'}
              stroke={color} strokeWidth={1.2} />
            <text x={x + 60} y={ny + nodeH / 2 + 3} textAnchor="middle"
              fontSize="7.5" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
              {n}
            </text>
            {i < nodes.length - 1 && (
              <line x1={x + 60} y1={ny + nodeH} x2={x + 60} y2={ny + nodeH + gap}
                stroke="#94a3b8" strokeWidth={0.8} />
            )}
          </g>
        );
      })}
    </g>
  );
}

export default function OperatorFusion() {
  const [fusion, setFusion] = useState<FusionType>('flash_attn');
  const info = FUSIONS[fusion];

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setFusion(t)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              fusion === t
                ? 'bg-orange-100 border-orange-400 text-orange-700 font-semibold'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {FUSIONS[t].label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          算子融合: {info.label}
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>{info.desc}</text>

        {/* Before (left) */}
        <NodeChain nodes={info.beforeNodes} x={80} y={55} color={COLORS.orange} label="融合前" />

        {/* Arrow */}
        <text x={W / 2} y={140} textAnchor="middle" fontSize="16" fill="#94a3b8">→</text>

        {/* After (right) */}
        <NodeChain nodes={info.afterNodes} x={370} y={55} color={COLORS.green} label="融合后" />

        {/* Stats */}
        <rect x={180} y={H - 50} width={220} height={35} rx={6}
          fill="#f0fdf4" stroke={COLORS.green} strokeWidth={1} />
        <text x={290} y={H - 30} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {info.savedKernels > 0
            ? `节省 ${info.savedKernels} 次内核调用 (${info.beforeNodes.length} → ${info.afterNodes.length})`
            : '无融合 — 所有节点独立调度'}
        </text>
      </svg>
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 5.3: Create DualRunnerComparison component

**Files:**
- Create: `src/components/interactive/DualRunnerComparison.tsx`

Static SVG: side-by-side architecture of ollamarunner (blue) and llamarunner (orange), converging to shared GGML backend.

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

export default function DualRunnerComparison() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        ollamarunner vs llamarunner
      </text>

      <defs>
        <marker id="drc-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Left: ollamarunner (blue) */}
      <rect x={30} y={35} width={220} height={160} rx={8}
        fill="none" stroke={COLORS.primary} strokeWidth={1.5} strokeDasharray="6,3" />
      <text x={140} y={52} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>ollamarunner (Go)</text>

      <rect x={55} y={62} width={170} height={25} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={140} y={78} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>Go 图构建: model.Forward()</text>

      <rect x={55} y={95} width={170} height={25} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={140} y={111} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>Pipeline Async 执行</text>

      <rect x={55} y={128} width={170} height={25} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={140} y={144} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>~21 架构 (llama, qwen3, ...)</text>

      <text x={140} y={172} textAnchor="middle" fontSize="7" fill={COLORS.green}
        fontFamily={FONTS.sans}>新方向: 性能优化, 减少 CGo 开销</text>

      {/* Right: llamarunner (orange) */}
      <rect x={330} y={35} width={220} height={160} rx={8}
        fill="none" stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="6,3" />
      <text x={440} y={52} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>llamarunner (C++/CGo)</text>

      <rect x={355} y={62} width={170} height={25} rx={4}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={440} y={78} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
        fontFamily={FONTS.sans}>C API: llama_decode()</text>

      <rect x={355} y={95} width={170} height={25} rx={4}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={440} y={111} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
        fontFamily={FONTS.sans}>同步执行</text>

      <rect x={355} y={128} width={170} height={25} rx={4}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={440} y={144} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
        fontFamily={FONTS.sans}>~120+ 架构 (全面兼容)</text>

      <text x={440} y={172} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>兼容性后备: 不支持的架构走此路径</text>

      {/* Both converge to GGML */}
      <line x1={140} y1={195} x2={250} y2={225}
        stroke={COLORS.primary} strokeWidth={1.2} markerEnd="url(#drc-arr)" />
      <line x1={440} y1={195} x2={330} y2={225}
        stroke={COLORS.orange} strokeWidth={1.2} markerEnd="url(#drc-arr)" />

      <rect x={200} y={225} width={180} height={30} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={290} y={244} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>GGML Backend (共享)</text>

      <text x={290} y={270} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        两个 runner 最终都提交计算图给同一个 GGML 后端执行
      </text>
    </svg>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 5.4: Create ollama-compute-graph.mdx article

**Files:**
- Create: `src/content/articles/zh/ollama-compute-graph.mdx`

```mdx
---
title: "计算图与推理引擎"
slug: "ollama-compute-graph"
locale: "zh"
tags: ["ggml", "compute-graph", "inference-engine", "operator-fusion"]
prerequisites: ["ollama-quantization"]
difficulty: "advanced"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "github"
    title: "GGML"
    url: "https://github.com/ggerganov/ggml"
  - type: "github"
    title: "llama.cpp"
    url: "https://github.com/ggerganov/llama.cpp"
---

import GGMLGraphBuilder from '../../../components/interactive/GGMLGraphBuilder.tsx';
import OperatorFusion from '../../../components/interactive/OperatorFusion.tsx';
import DualRunnerComparison from '../../../components/interactive/DualRunnerComparison.tsx';
```

Content sections per spec:
1. GGML 计算图 (what is GGML, core concepts, lazy eval, static vs dynamic graph)
2. 图构建过程 (Qwen3 block example, pseudocode) + `<GGMLGraphBuilder client:visible />`
3. 算子融合 (FlashAttention, RMSNorm+MatMul, GLU fusion, pattern matching) + `<OperatorFusion client:visible />`
4. ollamarunner vs llamarunner + `<DualRunnerComparison client:visible />`
5. 后端调度 (GGML scheduler, device assignment, cross-device transfer, multi-GPU)
6. "为什么不一样" (vs PyTorch, TensorRT, ONNX Runtime)

- [ ] Create the MDX file with full Chinese content
- [ ] Verify rendering
- [ ] Verify all 3 components render correctly

### Step 5.5: Commit Article 5

```bash
git add src/components/interactive/GGMLGraphBuilder.tsx \
        src/components/interactive/OperatorFusion.tsx \
        src/components/interactive/DualRunnerComparison.tsx \
        src/content/articles/zh/ollama-compute-graph.mdx
git commit -m "feat: add compute graph article with 3 components"
```

- [ ] Stage and commit

---

## Task 6: Article 6 — KV Cache 与 Batch 调度 (ollama-kv-cache-scheduling)

**Components:** KVCacheSlotManager (交互), PrefixCacheHit (StepNavigator, 3步), ContinuousBatchingTimeline (交互)
**Article:** `src/content/articles/zh/ollama-kv-cache-scheduling.mdx`

### Step 6.1: Create KVCacheSlotManager component

**Files:**
- Create: `src/components/interactive/KVCacheSlotManager.tsx`

Interactive KV cache memory bar visualization with slots for concurrent requests. Users can add/complete requests.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 260;
const SLOT_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

interface Slot {
  id: number;
  label: string;
  tokensUsed: number;
  maxTokens: number;
  active: boolean;
}

const INITIAL_SLOTS: Slot[] = [
  { id: 1, label: 'Req A', tokensUsed: 180, maxTokens: 512, active: true },
  { id: 2, label: 'Req B', tokensUsed: 45, maxTokens: 512, active: true },
  { id: 3, label: '(空闲)', tokensUsed: 0, maxTokens: 512, active: false },
  { id: 4, label: '(空闲)', tokensUsed: 0, maxTokens: 512, active: false },
];

export default function KVCacheSlotManager() {
  const [slots, setSlots] = useState<Slot[]>(INITIAL_SLOTS);
  const [nextReqId, setNextReqId] = useState(3);

  const totalCapacity = slots.length * 512;
  const totalUsed = slots.reduce((sum, s) => sum + s.tokensUsed, 0);
  const utilization = ((totalUsed / totalCapacity) * 100).toFixed(1);

  const addRequest = () => {
    const freeIdx = slots.findIndex(s => !s.active);
    if (freeIdx === -1) return;
    const newSlots = [...slots];
    const label = `Req ${String.fromCharCode(64 + nextReqId)}`;
    newSlots[freeIdx] = { ...newSlots[freeIdx], label, tokensUsed: Math.floor(Math.random() * 200) + 20, active: true };
    setSlots(newSlots);
    setNextReqId(nextReqId + 1);
  };

  const completeRequest = (idx: number) => {
    const newSlots = [...slots];
    newSlots[idx] = { ...newSlots[idx], label: '(空闲)', tokensUsed: 0, active: false };
    setSlots(newSlots);
  };

  const slotW = (W - 80) / slots.length;
  const barY = 80;
  const barH = 120;

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3">
        <button onClick={addRequest}
          className="px-3 py-1 text-xs rounded-full border border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100"
          disabled={!slots.some(s => !s.active)}>
          + 新请求
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          KV Cache Slot 管理器
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {slots.length} slots × 512 tokens = {totalCapacity} tokens 总容量 | 利用率: {utilization}%
        </text>

        {/* Slots */}
        {slots.map((slot, i) => {
          const x = 40 + i * slotW;
          const fillH = slot.active ? (slot.tokensUsed / slot.maxTokens) * barH : 0;
          const color = slot.active ? SLOT_COLORS[i % SLOT_COLORS.length] : '#e2e8f0';
          return (
            <g key={i} onClick={() => slot.active && completeRequest(i)}
              style={{ cursor: slot.active ? 'pointer' : 'default' }}>
              {/* Slot background */}
              <rect x={x + 4} y={barY} width={slotW - 8} height={barH}
                rx={4} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
              {/* Filled portion (bottom-up) */}
              <rect x={x + 4} y={barY + barH - fillH} width={slotW - 8} height={fillH}
                rx={4} fill={color} opacity={0.3} />
              {/* Label */}
              <text x={x + slotW / 2} y={barY + barH / 2} textAnchor="middle"
                fontSize="8" fontWeight={slot.active ? '600' : '400'}
                fill={slot.active ? color : '#94a3b8'} fontFamily={FONTS.sans}>
                {slot.label}
              </text>
              {slot.active && (
                <text x={x + slotW / 2} y={barY + barH / 2 + 14} textAnchor="middle"
                  fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
                  {slot.tokensUsed}/{slot.maxTokens}
                </text>
              )}
              {/* Slot number */}
              <text x={x + slotW / 2} y={barY + barH + 15} textAnchor="middle"
                fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
                Slot {i}
              </text>
            </g>
          );
        })}

        <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          点击活跃请求可释放 slot | 固定大小 slot: 简单但可能浪费空间 (vs PagedAttention)
        </text>
      </svg>
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 6.2: Create PrefixCacheHit component

**Files:**
- Create: `src/components/interactive/PrefixCacheHit.tsx`

StepNavigator with 3 steps showing prefix cache matching and reuse.

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function TokenBox({ x, y, text, variant }: {
  x: number; y: number; text: string;
  variant: 'cached' | 'new' | 'reused' | 'neutral';
}) {
  const fills = {
    cached: '#dbeafe', new: '#fef3c7', reused: '#dcfce7', neutral: '#f1f5f9',
  };
  const strokes = {
    cached: COLORS.primary, new: COLORS.orange, reused: COLORS.green, neutral: '#94a3b8',
  };
  const textFills = {
    cached: COLORS.primary, new: COLORS.orange, reused: COLORS.green, neutral: COLORS.mid,
  };
  return (
    <g>
      <rect x={x} y={y} width={60} height={26} rx={4}
        fill={fills[variant]} stroke={strokes[variant]} strokeWidth={1.2} />
      <text x={x + 30} y={y + 16} textAnchor="middle" fontSize="7.5"
        fontWeight="600" fill={textFills[variant]} fontFamily={FONTS.sans}>{text}</text>
    </g>
  );
}

const steps = [
  {
    title: 'Step 1: 首次请求 — 完整 Prefill',
    content: (
      <StepSvg h={150}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>请求: "解释量子计算"</text>
        <TokenBox x={20} y={30} text="解释" variant="neutral" />
        <TokenBox x={90} y={30} text="量子" variant="neutral" />
        <TokenBox x={160} y={30} text="计算" variant="neutral" />
        <text x={250} y={47} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          → 完整 prefill (3 tokens)
        </text>

        <text x={20} y={82} fontSize="7" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>KV Cache 状态:</text>
        <TokenBox x={20} y={90} text="解释" variant="cached" />
        <TokenBox x={90} y={90} text="量子" variant="cached" />
        <TokenBox x={160} y={90} text="计算" variant="cached" />
        <text x={250} y={107} fontSize="7" fill={COLORS.primary} fontFamily={FONTS.sans}>
          ✓ 缓存了 3 个 token 的 KV
        </text>
        <text x={W / 2} y={135} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          hash("解释量子计算") → 存入 prefix cache 索引
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: 新请求 — 前缀匹配',
    content: (
      <StepSvg h={150}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>新请求: "解释量子纠缠"</text>
        <TokenBox x={20} y={30} text="解释" variant="reused" />
        <TokenBox x={90} y={30} text="量子" variant="reused" />
        <TokenBox x={160} y={30} text="纠缠" variant="new" />

        <text x={20} y={82} fontSize="7" fontWeight="600" fill={COLORS.green}
          fontFamily={FONTS.sans}>前缀匹配:</text>
        <text x={20} y={96} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          hash("解释量子") → 命中缓存! 前 2 个 token 的 KV 可复用
        </text>
        <text x={20} y={112} fontSize="7" fill={COLORS.orange} fontFamily={FONTS.sans}>
          "纠缠" ≠ "计算" → 从位置 2 开始分歧 → 只需 prefill 1 个新 token
        </text>
        <text x={W / 2} y={140} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          最长公共前缀: "解释量子" (2 tokens)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: 复用 KV Cache — 节省计算',
    content: (
      <StepSvg h={170}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>执行策略:</text>

        {/* Reused tokens */}
        <TokenBox x={20} y={35} text="解释" variant="reused" />
        <TokenBox x={90} y={35} text="量子" variant="reused" />
        <text x={170} y={52} fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
          ← KV 直接复用 (跳过 prefill)
        </text>

        {/* New token */}
        <TokenBox x={20} y={70} text="纠缠" variant="new" />
        <text x={100} y={87} fontSize="7" fill={COLORS.orange} fontFamily={FONTS.sans}>
          ← 仅 prefill 此 token (1 次 forward)
        </text>

        {/* Stats */}
        <rect x={60} y={110} width={460} height={40} rx={6}
          fill="#f0fdf4" stroke={COLORS.green} strokeWidth={1} />
        <text x={290} y={128} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          节省 2/3 prefill 计算 = ~67% TTFT 降低
        </text>
        <text x={290} y={142} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          典型场景: system prompt 复用 (可能 1000+ tokens 全部命中缓存)
        </text>
      </StepSvg>
    ),
  },
];

export default function PrefixCacheHit() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 6.3: Create ContinuousBatchingTimeline component

**Files:**
- Create: `src/components/interactive/ContinuousBatchingTimeline.tsx`

Interactive timeline showing continuous batching vs static batching for multiple requests.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;

interface Request {
  id: string;
  prefillLen: number;
  decodeLen: number;
  startTime: number;
  color: string;
}

const INITIAL_REQUESTS: Request[] = [
  { id: 'A', prefillLen: 2, decodeLen: 6, startTime: 0, color: '#3b82f6' },
  { id: 'B', prefillLen: 1, decodeLen: 3, startTime: 1, color: '#f59e0b' },
  { id: 'C', prefillLen: 2, decodeLen: 4, startTime: 3, color: '#10b981' },
];

export default function ContinuousBatchingTimeline() {
  const [requests] = useState(INITIAL_REQUESTS);
  const [showStatic, setShowStatic] = useState(true);

  const timeScale = 42; // pixels per time unit
  const timelineX = 60;
  const maxTime = 12;

  // Continuous batching layout
  const contY = 60;
  const staticY = 180;
  const rowH = 24;

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3">
        <button onClick={() => setShowStatic(!showStatic)}
          className={`px-3 py-1 text-xs rounded-full border ${
            showStatic ? 'bg-gray-100 border-gray-400 text-gray-700' : 'bg-white border-gray-300 text-gray-500'
          }`}>
          {showStatic ? '隐藏' : '显示'} Static Batching 对比
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Continuous Batching 时间线
        </text>

        {/* Time axis */}
        <text x={timelineX - 5} y={contY - 8} textAnchor="end" fontSize="7"
          fill={COLORS.mid} fontFamily={FONTS.sans}>Continuous</text>
        {Array.from({ length: maxTime + 1 }, (_, t) => (
          <g key={t}>
            <line x1={timelineX + t * timeScale} y1={contY - 3}
              x2={timelineX + t * timeScale} y2={contY + requests.length * rowH + 3}
              stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={timelineX + t * timeScale} y={contY + requests.length * rowH + 15}
              textAnchor="middle" fontSize="6" fill={COLORS.mid} fontFamily={FONTS.mono}>
              t={t}
            </text>
          </g>
        ))}

        {/* Continuous batching bars */}
        {requests.map((req, ri) => {
          const y = contY + ri * rowH;
          const prefillX = timelineX + req.startTime * timeScale;
          const decodeX = prefillX + req.prefillLen * timeScale;
          return (
            <g key={req.id}>
              <text x={timelineX - 8} y={y + rowH / 2 + 3} textAnchor="end"
                fontSize="7" fontWeight="600" fill={req.color} fontFamily={FONTS.sans}>
                {req.id}
              </text>
              {/* Prefill */}
              <rect x={prefillX} y={y + 2} width={req.prefillLen * timeScale - 2}
                height={rowH - 4} rx={3} fill={req.color} opacity={0.7} />
              <text x={prefillX + (req.prefillLen * timeScale) / 2} y={y + rowH / 2 + 3}
                textAnchor="middle" fontSize="6" fill="white" fontWeight="600"
                fontFamily={FONTS.sans}>P</text>
              {/* Decode */}
              <rect x={decodeX} y={y + 2} width={req.decodeLen * timeScale - 2}
                height={rowH - 4} rx={3} fill={req.color} opacity={0.35} />
              <text x={decodeX + (req.decodeLen * timeScale) / 2} y={y + rowH / 2 + 3}
                textAnchor="middle" fontSize="6" fill={req.color} fontWeight="600"
                fontFamily={FONTS.sans}>D ({req.decodeLen})</text>
            </g>
          );
        })}

        {/* Static batching comparison */}
        {showStatic && (
          <g>
            <text x={timelineX - 5} y={staticY - 8} textAnchor="end" fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>Static</text>

            {/* Time axis for static */}
            {Array.from({ length: maxTime + 1 }, (_, t) => (
              <line key={t} x1={timelineX + t * timeScale} y1={staticY - 3}
                x2={timelineX + t * timeScale} y2={staticY + requests.length * rowH + 3}
                stroke="#e2e8f0" strokeWidth={0.5} />
            ))}

            {/* In static batching, B waits for A to finish before being in same batch */}
            {requests.map((req, ri) => {
              const y = staticY + ri * rowH;
              // Static: each request runs in its own batch sequentially
              const staticStart = ri === 0 ? 0 : ri === 1 ? 0 : 4; // simplified
              const totalLen = req.prefillLen + req.decodeLen;
              return (
                <g key={req.id}>
                  <text x={timelineX - 8} y={y + rowH / 2 + 3} textAnchor="end"
                    fontSize="7" fontWeight="600" fill={req.color} fontFamily={FONTS.sans}>
                    {req.id}
                  </text>
                  <rect x={timelineX + staticStart * timeScale} y={y + 2}
                    width={totalLen * timeScale - 2} height={rowH - 4} rx={3}
                    fill={req.color} opacity={0.3} />
                  {/* Gray waiting period for C */}
                  {ri === 2 && (
                    <rect x={timelineX + 3 * timeScale} y={y + 2}
                      width={1 * timeScale - 2} height={rowH - 4} rx={3}
                      fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.5}
                      strokeDasharray="2,2" />
                  )}
                </g>
              );
            })}

            <text x={W / 2} y={staticY + requests.length * rowH + 28} textAnchor="middle"
              fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
              Static: 短请求等长请求完成才能释放 | Continuous: 完成即释放, 新请求立即插入
            </text>
          </g>
        )}

        {/* Legend */}
        <rect x={30} y={H - 18} width={20} height={10} rx={2} opacity={0.7}
          fill={COLORS.primary} />
        <text x={55} y={H - 10} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Prefill (P)
        </text>
        <rect x={120} y={H - 18} width={20} height={10} rx={2} opacity={0.35}
          fill={COLORS.primary} />
        <text x={145} y={H - 10} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Decode (D)
        </text>
      </svg>
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 6.4: Create ollama-kv-cache-scheduling.mdx article

**Files:**
- Create: `src/content/articles/zh/ollama-kv-cache-scheduling.mdx`

```mdx
---
title: "KV Cache 与 Batch 调度"
slug: "ollama-kv-cache-scheduling"
locale: "zh"
tags: ["kv-cache", "batch-scheduling", "continuous-batching", "prefix-cache"]
prerequisites: ["ollama-compute-graph", "kv-cache"]
difficulty: "advanced"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "paper"
    title: "Efficient Memory Management for LLM Serving with PagedAttention"
    url: "https://arxiv.org/abs/2309.06180"
  - type: "github"
    title: "Ollama GitHub"
    url: "https://github.com/ollama/ollama"
---

import KVCacheSlotManager from '../../../components/interactive/KVCacheSlotManager.tsx';
import PrefixCacheHit from '../../../components/interactive/PrefixCacheHit.tsx';
import ContinuousBatchingTimeline from '../../../components/interactive/ContinuousBatchingTimeline.tsx';
```

Content sections per spec:
1. llama.cpp 的 KV Cache 实现 (slot-based, memory layout) + `<KVCacheSlotManager client:visible />`
2. Ollama 的 Go KV Cache (kvcache/ package, causal vs recurrent)
3. Prefix Cache / Prompt Cache (hash matching, pseudocode) + `<PrefixCacheHit client:visible />`
4. Continuous Batching (static vs continuous, mixed prefill/decode batch) + `<ContinuousBatchingTimeline client:visible />`
5. 上下文管理 (max context, context shifting, sliding window)
6. "为什么不一样" (vs PagedAttention, tradeoffs)

- [ ] Create the MDX file with full Chinese content
- [ ] Verify rendering
- [ ] Verify all 3 components render correctly

### Step 6.5: Commit Article 6

```bash
git add src/components/interactive/KVCacheSlotManager.tsx \
        src/components/interactive/PrefixCacheHit.tsx \
        src/components/interactive/ContinuousBatchingTimeline.tsx \
        src/content/articles/zh/ollama-kv-cache-scheduling.mdx
git commit -m "feat: add KV cache and batch scheduling article with 3 components"
```

- [ ] Stage and commit

---

## Task 7: Article 7 — 硬件后端 (ollama-hardware-backends)

**Components:** BackendArchitecture (交互), DeviceSplitVisualizer (交互), BackendPerformanceCompare (静态)
**Article:** `src/content/articles/zh/ollama-hardware-backends.mdx`

### Step 7.1: Create BackendArchitecture component

**Files:**
- Create: `src/components/interactive/BackendArchitecture.tsx`

Interactive: unified GGML compute graph at top, forking to 4 backends below. Click each backend to expand features.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

interface BackendInfo {
  id: string;
  label: string;
  x: number;
  features: string[];
  platform: string;
}

const BACKENDS: BackendInfo[] = [
  {
    id: 'cuda', label: 'CUDA', x: 40,
    features: [
      'NVIDIA GPU 专用',
      'Quantized MatMul 内核',
      'FlashAttention 融合',
      'Tensor Core (FP16)',
      'Stream 并行: 计算+传输重叠',
    ],
    platform: 'NVIDIA GPU (Turing+)',
  },
  {
    id: 'metal', label: 'Metal', x: 170,
    features: [
      'Apple Silicon 专用',
      '统一内存: 无 PCIe 传输',
      'Compute Pipeline + MSL',
      'threadgroup 优化',
      'M1/M2/M3/M4 全系列',
    ],
    platform: 'macOS (Apple Silicon)',
  },
  {
    id: 'vulkan', label: 'Vulkan', x: 300,
    features: [
      '跨平台 GPU 计算',
      'SPIR-V compute shader',
      'AMD / Intel / 移动 GPU',
      '生态较 CUDA 年轻',
      '性能仍在追赶中',
    ],
    platform: 'Windows/Linux/Android',
  },
  {
    id: 'cpu', label: 'CPU', x: 430,
    features: [
      'AVX2 / AVX-512 / NEON',
      'INT4/INT8 SIMD 直算',
      '无需 GPU 即可运行',
      '多线程 (OpenMP)',
      '所有平台通用后备',
    ],
    platform: 'x86 / ARM (所有平台)',
  },
];

export default function BackendArchitecture() {
  const [selected, setSelected] = useState<string | null>(null);
  const selBackend = BACKENDS.find(b => b.id === selected);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          GGML 多后端架构
        </text>

        <defs>
          <marker id="ba-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Top: unified compute graph */}
        <rect x={170} y={35} width={240} height={35} rx={8}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={290} y={57} textAnchor="middle" fontSize="10" fontWeight="700"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          GGML 计算图 (统一)
        </text>

        {/* Scheduler */}
        <rect x={200} y={85} width={180} height={25} rx={5}
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
        <text x={290} y={101} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>ggml_backend_sched (调度器)</text>

        {/* Fork arrows */}
        {BACKENDS.map(b => (
          <line key={b.id} x1={290} y1={110} x2={b.x + 55} y2={135}
            stroke="#94a3b8" strokeWidth={1} markerEnd="url(#ba-arr)" />
        ))}

        {/* Backend boxes */}
        {BACKENDS.map(b => (
          <g key={b.id} onClick={() => setSelected(selected === b.id ? null : b.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={b.x} y={135} width={110} height={45} rx={6}
              fill={selected === b.id ? '#fed7aa' : '#fef3c7'}
              stroke={COLORS.orange}
              strokeWidth={selected === b.id ? 2.5 : 1.2} />
            <text x={b.x + 55} y={155} textAnchor="middle" fontSize="9"
              fontWeight="700" fill={COLORS.orange} fontFamily={FONTS.sans}>
              {b.label}
            </text>
            <text x={b.x + 55} y={170} textAnchor="middle" fontSize="6.5"
              fill={COLORS.mid} fontFamily={FONTS.sans}>
              {b.platform}
            </text>
          </g>
        ))}

        {/* Note */}
        <text x={W / 2} y={210} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          全部橙色: 这些后端都属于 llama.cpp/GGML (C/C++) | 点击后端查看特性
        </text>
      </svg>

      {selBackend && (
        <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm">
          <p className="font-semibold text-orange-700 mb-1">{selBackend.label}</p>
          <ul className="space-y-0.5 text-gray-600 text-xs">
            {selBackend.features.map((f, i) => (
              <li key={i}>- {f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 7.2: Create DeviceSplitVisualizer component

**Files:**
- Create: `src/components/interactive/DeviceSplitVisualizer.tsx`

Interactive: slider for GPU VRAM, shows layer distribution GPU vs CPU.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

// Qwen3-8B: 32 layers, ~4.9 GB Q4_K_M, each layer ~0.14 GB
const TOTAL_LAYERS = 32;
const LAYER_SIZE_GB = 0.14;
const EMBEDDING_SIZE_GB = 0.3; // embedding + output head
const KV_CACHE_PER_LAYER_GB = 0.05; // rough estimate for 2048 context

export default function DeviceSplitVisualizer() {
  const [vramGB, setVramGB] = useState(6);

  const availableForLayers = Math.max(0, vramGB - EMBEDDING_SIZE_GB);
  const gpuLayers = Math.min(TOTAL_LAYERS,
    Math.floor(availableForLayers / (LAYER_SIZE_GB + KV_CACHE_PER_LAYER_GB)));
  const cpuLayers = TOTAL_LAYERS - gpuLayers;

  const layerW = (W - 100) / TOTAL_LAYERS;
  const layerY = 100;
  const layerH = 80;

  // Rough performance estimate
  const baseTokensPerSec = 120; // all GPU
  const cpuPenaltyPerLayer = 3; // tokens/s loss per CPU layer
  const estimatedTps = Math.max(5, baseTokensPerSec - cpuLayers * cpuPenaltyPerLayer);

  return (
    <div>
      {/* Slider */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-xs text-gray-600">GPU VRAM:</span>
        <input type="range" min={0} max={24} step={0.5} value={vramGB}
          onChange={e => setVramGB(parseFloat(e.target.value))}
          className="w-48" />
        <span className="text-sm font-semibold text-gray-700">{vramGB} GB</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          设备分割: Qwen3-8B Q4_K_M ({TOTAL_LAYERS} layers)
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          GPU: {gpuLayers} layers | CPU: {cpuLayers} layers | 预估: ~{estimatedTps} tok/s
        </text>

        {/* Layer labels */}
        <text x={50 + gpuLayers * layerW / 2} y={layerY - 8} textAnchor="middle"
          fontSize="7" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
          GPU ({gpuLayers} layers, {(gpuLayers * LAYER_SIZE_GB).toFixed(1)} GB)
        </text>
        {cpuLayers > 0 && (
          <text x={50 + gpuLayers * layerW + cpuLayers * layerW / 2} y={layerY - 8}
            textAnchor="middle" fontSize="7" fontWeight="600" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            CPU ({cpuLayers} layers)
          </text>
        )}

        {/* Layers */}
        {Array.from({ length: TOTAL_LAYERS }, (_, i) => {
          const isGpu = i < gpuLayers;
          return (
            <rect key={i} x={50 + i * layerW} y={layerY} width={layerW - 1} height={layerH}
              rx={1} fill={isGpu ? '#dcfce7' : '#f1f5f9'}
              stroke={isGpu ? COLORS.green : '#d1d5db'} strokeWidth={0.5} />
          );
        })}

        {/* Layer numbers (every 4th) */}
        {Array.from({ length: TOTAL_LAYERS }, (_, i) => {
          if (i % 4 !== 0 && i !== TOTAL_LAYERS - 1) return null;
          return (
            <text key={i} x={50 + i * layerW + layerW / 2} y={layerY + layerH + 12}
              textAnchor="middle" fontSize="5" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {i}
            </text>
          );
        })}

        {/* Split line */}
        {gpuLayers < TOTAL_LAYERS && gpuLayers > 0 && (
          <g>
            <line x1={50 + gpuLayers * layerW} y1={layerY - 3}
              x2={50 + gpuLayers * layerW} y2={layerY + layerH + 3}
              stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="4,2" />
            <text x={50 + gpuLayers * layerW} y={layerY + layerH + 25}
              textAnchor="middle" fontSize="6" fill={COLORS.red} fontFamily={FONTS.sans}>
              PCIe 边界
            </text>
          </g>
        )}

        {/* Performance note */}
        <rect x={100} y={H - 45} width={380} height={30} rx={5}
          fill={cpuLayers === 0 ? '#f0fdf4' : cpuLayers > 16 ? '#fef2f2' : '#fffbeb'}
          stroke={cpuLayers === 0 ? COLORS.green : cpuLayers > 16 ? COLORS.red : COLORS.orange}
          strokeWidth={0.8} />
        <text x={290} y={H - 25} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={cpuLayers === 0 ? COLORS.green : cpuLayers > 16 ? COLORS.red : COLORS.orange}
          fontFamily={FONTS.sans}>
          {cpuLayers === 0 ? '全 GPU: 最佳性能, 无 PCIe 瓶颈' :
           cpuLayers > 16 ? '大部分 CPU: 性能严重受限于内存带宽' :
           `混合模式: 每次 decode 需跨 PCIe 传输 ${cpuLayers} 层的中间结果`}
        </text>
      </svg>
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 7.3: Create BackendPerformanceCompare component

**Files:**
- Create: `src/components/interactive/BackendPerformanceCompare.tsx`

Static bar chart comparing same model on 4 backends.

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 220;

const BACKENDS = [
  { label: 'CUDA\n(RTX 4090)', tps: 115, color: '#76b900', hw: 'RTX 4090, 24GB' },
  { label: 'Metal\n(M3 Max)', tps: 55, color: '#a3aaae', hw: 'M3 Max, 36GB 统一内存' },
  { label: 'Vulkan\n(RX 7900)', tps: 38, color: '#ed1c24', hw: 'RX 7900 XTX, 24GB' },
  { label: 'CPU\n(i9-14900K)', tps: 12, color: '#0071c5', hw: 'AVX-512, 32 threads' },
];

export default function BackendPerformanceCompare() {
  const maxTps = Math.max(...BACKENDS.map(b => b.tps));
  const barAreaX = 120;
  const barAreaW = 380;
  const barH = 28;
  const gap = 12;
  const startY = 50;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Qwen3-8B Q4_K_M — 各后端 Tokens/s 对比
      </text>
      <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        数据为估算值, 实际性能因驱动版本和系统配置而异
      </text>

      {BACKENDS.map((b, i) => {
        const y = startY + i * (barH + gap);
        const w = (b.tps / maxTps) * barAreaW;
        const lines = b.label.split('\n');
        return (
          <g key={b.label}>
            {lines.map((line, li) => (
              <text key={li} x={barAreaX - 8} y={y + barH / 2 + (li - 0.5) * 10}
                textAnchor="end" fontSize="7" fontWeight={li === 0 ? '600' : '400'}
                fill={li === 0 ? b.color : COLORS.mid} fontFamily={FONTS.sans}>
                {line}
              </text>
            ))}
            <rect x={barAreaX} y={y} width={w} height={barH} rx={4}
              fill={b.color} opacity={0.25} />
            <rect x={barAreaX} y={y} width={w} height={barH} rx={4}
              fill="none" stroke={b.color} strokeWidth={1.2} />
            <text x={barAreaX + w + 8} y={y + barH / 2 + 4}
              fontSize="9" fontWeight="700" fill={b.color} fontFamily={FONTS.sans}>
              {b.tps} tok/s
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 7.4: Create ollama-hardware-backends.mdx article

**Files:**
- Create: `src/content/articles/zh/ollama-hardware-backends.mdx`

```mdx
---
title: "硬件后端"
slug: "ollama-hardware-backends"
locale: "zh"
tags: ["ggml", "cuda", "metal", "vulkan", "hardware-backend"]
prerequisites: ["ollama-compute-graph"]
difficulty: "advanced"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "github"
    title: "GGML Backend API"
    url: "https://github.com/ggerganov/ggml"
  - type: "website"
    title: "CUDA Programming Guide"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/"
  - type: "website"
    title: "Metal Shading Language"
    url: "https://developer.apple.com/metal/"
  - type: "website"
    title: "Vulkan Compute"
    url: "https://www.khronos.org/vulkan/"
---

import BackendArchitecture from '../../../components/interactive/BackendArchitecture.tsx';
import DeviceSplitVisualizer from '../../../components/interactive/DeviceSplitVisualizer.tsx';
import BackendPerformanceCompare from '../../../components/interactive/BackendPerformanceCompare.tsx';
```

Content per spec: multi-backend architecture + `<BackendArchitecture client:visible />`, CUDA backend, Metal backend, Vulkan backend, CPU backend, device split + `<DeviceSplitVisualizer client:visible />`, performance compare + `<BackendPerformanceCompare client:visible />`, "为什么不一样"

- [ ] Create the MDX file with full Chinese content
- [ ] Verify rendering
- [ ] Verify all 3 components

### Step 7.5: Commit Article 7

```bash
git add src/components/interactive/BackendArchitecture.tsx \
        src/components/interactive/DeviceSplitVisualizer.tsx \
        src/components/interactive/BackendPerformanceCompare.tsx \
        src/content/articles/zh/ollama-hardware-backends.mdx
git commit -m "feat: add hardware backends article with 3 components"
```

- [ ] Stage and commit

---

## Task 8: Article 8 — 服务层与调度 (ollama-server-scheduling)

**Components:** RunnerLifecycle (StepNavigator, 5步), MemoryBudgetCalculator (交互), MultiModelScheduler (交互)
**Article:** `src/content/articles/zh/ollama-server-scheduling.mdx`

### Step 8.1: Create RunnerLifecycle component

**Files:**
- Create: `src/components/interactive/RunnerLifecycle.tsx`

StepNavigator with 5 steps showing runner state machine: Idle → Loading → Ready → Busy → Unloading. Each step annotates resource usage changes.

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function StateBox({ x, y, label, active, color }: {
  x: number; y: number; label: string; active: boolean; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={80} height={30} rx={15}
        fill={active ? color : '#f1f5f9'}
        stroke={active ? color : '#d1d5db'}
        strokeWidth={active ? 2 : 1} opacity={active ? 1 : 0.4} />
      <text x={x + 40} y={y + 19} textAnchor="middle" fontSize="7.5"
        fontWeight={active ? '700' : '400'}
        fill={active ? 'white' : '#94a3b8'} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

function ResourceBar({ x, y, label, value, max, color }: {
  x: number; y: number; label: string; value: number; max: number; color: string;
}) {
  const barW = 120;
  const fillW = (value / max) * barW;
  return (
    <g>
      <text x={x} y={y + 10} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {label}
      </text>
      <rect x={x + 55} y={y} width={barW} height={14} rx={3}
        fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
      <rect x={x + 55} y={y} width={fillW} height={14} rx={3}
        fill={color} opacity={0.5} />
      <text x={x + 55 + barW + 5} y={y + 11} fontSize="6.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{value} / {max}</text>
    </g>
  );
}

const STATES = ['Idle', 'Loading', 'Ready', 'Busy', 'Unloading'];

function makeStep(activeIdx: number, desc: string, resources: { vram: number; ram: number; cpu: number }) {
  return {
    title: `${STATES[activeIdx]}`,
    content: (
      <StepSvg h={160}>
        {/* State machine */}
        {STATES.map((s, i) => (
          <g key={s}>
            <StateBox x={20 + i * 108} y={10} label={s} active={i === activeIdx}
              color={i === activeIdx ? COLORS.primary : '#94a3b8'} />
            {i < STATES.length - 1 && (
              <text x={100 + i * 108 + 14} y={28} fontSize="10" fill="#94a3b8">→</text>
            )}
          </g>
        ))}

        {/* Description */}
        <text x={W / 2} y={65} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{desc}</text>

        {/* Resource bars */}
        <ResourceBar x={80} y={85} label="VRAM" value={resources.vram} max={8} color={COLORS.green} />
        <ResourceBar x={80} y={105} label="RAM" value={resources.ram} max={16} color={COLORS.primary} />
        <ResourceBar x={80} y={125} label="CPU" value={resources.cpu} max={100} color={COLORS.orange} />

        <text x={350} y={95} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          VRAM: {resources.vram} GB
        </text>
        <text x={350} y={112} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          RAM: {resources.ram} GB
        </text>
        <text x={350} y={129} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          CPU: {resources.cpu}%
        </text>
      </StepSvg>
    ),
  };
}

const steps = [
  makeStep(0, '无 runner 进程, 等待首次请求到来', { vram: 0, ram: 0, cpu: 0 }),
  makeStep(1, 'Scheduler 触发加载: 启动 runner 子进程, mmap GGUF, 分配显存', { vram: 3, ram: 2, cpu: 40 }),
  makeStep(2, '健康检查通过, KV Cache 已分配, 等待推理请求', { vram: 5, ram: 2, cpu: 5 }),
  makeStep(3, '处理推理请求中: GPU 满载计算, KV Cache 活跃写入', { vram: 5, ram: 2, cpu: 80 }),
  makeStep(4, '空闲超时 (OLLAMA_KEEP_ALIVE=5m): 释放显存, 终止子进程', { vram: 0, ram: 0, cpu: 5 }),
];

export default function RunnerLifecycle() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 8.2: Create MemoryBudgetCalculator component

**Files:**
- Create: `src/components/interactive/MemoryBudgetCalculator.tsx`

Interactive: input GPU VRAM + system RAM sliders, select models, calculate fit.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

interface ModelSpec {
  name: string;
  sizeGB: number;
  kvPerTokenMB: number; // KV cache per token in MB
}

const MODELS: ModelSpec[] = [
  { name: 'Qwen3-4B Q4_K_M', sizeGB: 2.6, kvPerTokenMB: 0.05 },
  { name: 'Qwen3-8B Q4_K_M', sizeGB: 4.9, kvPerTokenMB: 0.08 },
  { name: 'Llama3-8B Q4_K_M', sizeGB: 4.7, kvPerTokenMB: 0.08 },
  { name: 'Qwen3-14B Q4_K_M', sizeGB: 8.2, kvPerTokenMB: 0.12 },
  { name: 'Llama3-70B Q4_K_M', sizeGB: 40.0, kvPerTokenMB: 0.4 },
];

export default function MemoryBudgetCalculator() {
  const [vramGB, setVramGB] = useState(8);
  const [ramGB, setRamGB] = useState(16);
  const [selectedModels, setSelectedModels] = useState<Set<number>>(new Set([1]));
  const contextLen = 2048;

  const toggleModel = (idx: number) => {
    const next = new Set(selectedModels);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setSelectedModels(next);
  };

  // Calculate placement
  const placements = [...selectedModels].map(idx => {
    const m = MODELS[idx];
    const kvGB = (m.kvPerTokenMB * contextLen) / 1024;
    const totalNeed = m.sizeGB + kvGB;
    const fitsGPU = totalNeed <= vramGB;
    const fitsCPU = totalNeed <= ramGB;
    return { model: m, kvGB, totalNeed, fitsGPU, fitsCPU };
  });

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
        <div>
          <label className="text-gray-600">GPU VRAM: {vramGB} GB</label>
          <input type="range" min={0} max={24} step={1} value={vramGB}
            onChange={e => setVramGB(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-gray-600">System RAM: {ramGB} GB</label>
          <input type="range" min={8} max={128} step={8} value={ramGB}
            onChange={e => setRamGB(parseInt(e.target.value))} className="w-full" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center mb-3">
        {MODELS.map((m, i) => (
          <button key={i} onClick={() => toggleModel(i)}
            className={`px-2 py-1 text-xs rounded-full border ${
              selectedModels.has(i)
                ? 'bg-blue-100 border-blue-400 text-blue-700 font-semibold'
                : 'bg-white border-gray-300 text-gray-500'
            }`}>
            {m.name}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          内存预算计算器 (ctx={contextLen})
        </text>

        {/* VRAM bar */}
        <text x={20} y={50} fontSize="8" fontWeight="600" fill={COLORS.green}
          fontFamily={FONTS.sans}>GPU VRAM ({vramGB} GB)</text>
        <rect x={20} y={55} width={W - 40} height={30} rx={4}
          fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} />

        {/* RAM bar */}
        <text x={20} y={110} fontSize="8" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>System RAM ({ramGB} GB)</text>
        <rect x={20} y={115} width={W - 40} height={30} rx={4}
          fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} />

        {/* Model placements on VRAM bar */}
        {(() => {
          let vramOffset = 0;
          let ramOffset = 0;
          return placements.map((p, i) => {
            const vramW = (p.totalNeed / Math.max(vramGB, 1)) * (W - 40);
            const ramW = (p.totalNeed / Math.max(ramGB, 1)) * (W - 40);
            const vramX = 20 + vramOffset;
            const ramX = 20 + ramOffset;

            if (p.fitsGPU) {
              vramOffset += vramW;
              return (
                <g key={i}>
                  <rect x={vramX} y={55} width={Math.min(vramW, W - 40 - (vramX - 20))} height={30}
                    rx={4} fill={COLORS.green} opacity={0.3} />
                  <text x={vramX + Math.min(vramW, W - 40) / 2} y={74} textAnchor="middle"
                    fontSize="7" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
                    {p.model.name} ({p.totalNeed.toFixed(1)} GB)
                  </text>
                </g>
              );
            } else if (p.fitsCPU) {
              ramOffset += ramW;
              return (
                <g key={i}>
                  <rect x={ramX} y={115} width={Math.min(ramW, W - 40 - (ramX - 20))} height={30}
                    rx={4} fill={COLORS.primary} opacity={0.3} />
                  <text x={ramX + Math.min(ramW, W - 40) / 2} y={134} textAnchor="middle"
                    fontSize="7" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
                    {p.model.name} ({p.totalNeed.toFixed(1)} GB)
                  </text>
                </g>
              );
            } else {
              return (
                <text key={i} x={W / 2} y={170 + i * 15} textAnchor="middle"
                  fontSize="7" fill={COLORS.red} fontFamily={FONTS.sans}>
                  {p.model.name}: 需要 {p.totalNeed.toFixed(1)} GB, 放不下!
                </text>
              );
            }
          });
        })()}

        {/* Summary */}
        <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          模型大小 = 权重 + KV Cache ({contextLen} tokens) | GPU 放不下则降级到 CPU
        </text>
      </svg>
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 8.3: Create MultiModelScheduler component

**Files:**
- Create: `src/components/interactive/MultiModelScheduler.tsx`

Interactive timeline animation showing scheduler decisions for 3 users requesting different models.

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;

interface Event {
  time: number;
  action: string;
  model: string;
  color: string;
  reason: string;
}

const EVENTS: Event[] = [
  { time: 0, action: 'Load', model: 'llama3-8B', color: '#3b82f6', reason: '首次请求, 加载模型' },
  { time: 1, action: 'Infer', model: 'llama3-8B', color: '#3b82f6', reason: 'User A 推理中' },
  { time: 3, action: 'Load', model: 'qwen3-8B', color: '#f59e0b', reason: 'User B 请求不同模型' },
  { time: 4, action: 'Infer', model: 'qwen3-8B', color: '#f59e0b', reason: 'User B 推理中, llama3 空闲' },
  { time: 6, action: 'Reuse', model: 'llama3-8B', color: '#3b82f6', reason: 'User C 请求 llama3, 仍在内存中 → 复用' },
  { time: 7, action: 'Infer', model: 'llama3-8B', color: '#3b82f6', reason: 'User C 推理中' },
  { time: 9, action: 'Unload', model: 'qwen3-8B', color: '#f59e0b', reason: '空闲超时 (KEEP_ALIVE), 卸载释放显存' },
];

export default function MultiModelScheduler() {
  const eventH = 34;
  const startY = 50;
  const timeX = 30;
  const actionX = 80;
  const modelX = 160;
  const reasonX = 290;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        多模型调度时间线
      </text>
      <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        Scheduler 管理模型的加载、推理、复用和卸载
      </text>

      {/* Headers */}
      <text x={timeX} y={startY - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Time</text>
      <text x={actionX} y={startY - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Action</text>
      <text x={modelX} y={startY - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Model</text>
      <text x={reasonX} y={startY - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Decision Reason</text>

      {EVENTS.map((ev, i) => {
        const y = startY + i * eventH;
        const actionColors: Record<string, string> = {
          Load: COLORS.orange, Infer: COLORS.green, Reuse: COLORS.primary, Unload: COLORS.red,
        };
        return (
          <g key={i}>
            {i % 2 === 0 && (
              <rect x={20} y={y} width={W - 40} height={eventH} fill="#f8fafc" />
            )}
            {/* Timeline dot */}
            <circle cx={timeX + 10} cy={y + eventH / 2} r={4} fill={ev.color} />
            {i < EVENTS.length - 1 && (
              <line x1={timeX + 10} y1={y + eventH / 2 + 4}
                x2={timeX + 10} y2={y + eventH + eventH / 2 - 4}
                stroke="#e2e8f0" strokeWidth={1} />
            )}
            <text x={timeX + 22} y={y + eventH / 2 + 3} fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.mono}>t={ev.time}s</text>
            <text x={actionX} y={y + eventH / 2 + 3} fontSize="7.5" fontWeight="600"
              fill={actionColors[ev.action] || COLORS.mid} fontFamily={FONTS.sans}>
              {ev.action}
            </text>
            <text x={modelX} y={y + eventH / 2 + 3} fontSize="7" fontWeight="600"
              fill={ev.color} fontFamily={FONTS.sans}>{ev.model}</text>
            <text x={reasonX} y={y + eventH / 2 + 3} fontSize="6.5"
              fill={COLORS.mid} fontFamily={FONTS.sans}>{ev.reason}</text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 8.4: Create ollama-server-scheduling.mdx article

**Files:**
- Create: `src/content/articles/zh/ollama-server-scheduling.mdx`

```mdx
---
title: "服务层与调度"
slug: "ollama-server-scheduling"
locale: "zh"
tags: ["ollama", "scheduler", "runner", "model-management"]
prerequisites: ["ollama-architecture", "ollama-kv-cache-scheduling"]
difficulty: "advanced"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "github"
    title: "Ollama GitHub"
    url: "https://github.com/ollama/ollama"
  - type: "github"
    title: "Ollama FAQ"
    url: "https://github.com/ollama/ollama/blob/main/docs/faq.md"
---

import RunnerLifecycle from '../../../components/interactive/RunnerLifecycle.tsx';
import MemoryBudgetCalculator from '../../../components/interactive/MemoryBudgetCalculator.tsx';
import MultiModelScheduler from '../../../components/interactive/MultiModelScheduler.tsx';
```

Content per spec: Ollama Server architecture, Scheduler, Runner lifecycle + `<RunnerLifecycle client:visible />`, model hot-loading/unloading + `<MultiModelScheduler client:visible />`, memory management + `<MemoryBudgetCalculator client:visible />`, "为什么不一样"

- [ ] Create the MDX file with full Chinese content
- [ ] Verify rendering
- [ ] Verify all 3 components

### Step 8.5: Commit Article 8

```bash
git add src/components/interactive/RunnerLifecycle.tsx \
        src/components/interactive/MemoryBudgetCalculator.tsx \
        src/components/interactive/MultiModelScheduler.tsx \
        src/content/articles/zh/ollama-server-scheduling.mdx
git commit -m "feat: add server scheduling article with 3 components"
```

- [ ] Stage and commit

---

## Task 9: Article 9 — 模型生态 (ollama-model-ecosystem)

**Components:** RegistryPullFlow (StepNavigator, 4步), ModelfileBuilder (交互), MultimodalPipeline (静态)
**Article:** `src/content/articles/zh/ollama-model-ecosystem.mdx`

### Step 9.1: Create RegistryPullFlow component

**Files:**
- Create: `src/components/interactive/RegistryPullFlow.tsx`

StepNavigator with 4 steps: parse model name → fetch manifest → check local blobs → download missing layers.

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function Box({ x, y, w, h, label, sub, color }: {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={color === COLORS.primary ? '#dbeafe' : '#f1f5f9'}
        stroke={color} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 2 : h / 2 + 4)} textAnchor="middle"
        fontSize="7.5" fontWeight="600" fill={color} fontFamily={FONTS.sans}>{label}</text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle"
          fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>{sub}</text>
      )}
    </g>
  );
}

const steps = [
  {
    title: 'Step 1: 解析模型名',
    content: (
      <StepSvg h={120}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>ollama pull qwen3</text>
        <Box x={20} y={35} w={120} h={35} label="qwen3" sub="= library/qwen3:latest" color={COLORS.primary} />
        <text x={160} y={55} fontSize="16" fill="#94a3b8">→</text>
        <Box x={180} y={35} w={150} h={35} label="Registry API 请求" sub="GET /v2/library/qwen3/manifests/latest" color={COLORS.primary} />
        <text x={W / 2} y={95} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          模型名格式: namespace/model:tag (类似 Docker image 命名)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: 获取 Manifest',
    content: (
      <StepSvg h={140}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>Manifest 内容:</text>
        {[
          { label: 'GGUF 权重', size: '2.6 GB', color: COLORS.orange },
          { label: 'Tokenizer', size: '4.2 MB', color: COLORS.primary },
          { label: 'Chat Template', size: '1.2 KB', color: COLORS.green },
          { label: 'License', size: '2.1 KB', color: '#94a3b8' },
        ].map((layer, i) => (
          <g key={i}>
            <rect x={20} y={30 + i * 24} width={W - 40} height={20} rx={3}
              fill="#f8fafc" stroke="#e2e8f0" strokeWidth={0.5} />
            <circle cx={35} cy={40 + i * 24} r={4} fill={layer.color} />
            <text x={50} y={44 + i * 24} fontSize="7.5" fill={COLORS.dark}
              fontFamily={FONTS.sans}>{layer.label}</text>
            <text x={W - 30} y={44 + i * 24} textAnchor="end" fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.mono}>{layer.size}</text>
          </g>
        ))}
        <text x={W / 2} y={130} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          每个 layer 有 SHA256 digest → content-addressable 存储
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: 检查本地 Blob 缓存',
    content: (
      <StepSvg h={130}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>本地缓存检查:</text>
        {[
          { label: 'GGUF 权重', status: '缺失 → 需下载', color: COLORS.red },
          { label: 'Tokenizer', status: '✓ 已有 (与 qwen3-4B 共享)', color: COLORS.green },
          { label: 'Chat Template', status: '✓ 已有 (与 qwen3-4B 共享)', color: COLORS.green },
          { label: 'License', status: '✓ 已有 (通用 Apache 2.0)', color: COLORS.green },
        ].map((item, i) => (
          <g key={i}>
            <text x={30} y={42 + i * 20} fontSize="7.5" fill={COLORS.dark}
              fontFamily={FONTS.sans}>{item.label}</text>
            <text x={200} y={42 + i * 20} fontSize="7" fill={item.color}
              fontFamily={FONTS.sans}>{item.status}</text>
          </g>
        ))}
        <rect x={100} y={110} width={380} height={16} rx={3}
          fill="#f0fdf4" stroke={COLORS.green} strokeWidth={0.8} />
        <text x={290} y={121} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          Layer 去重: 仅下载 GGUF 权重, 节省 ~4.2 MB
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 4: 下载并验证',
    content: (
      <StepSvg h={120}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>下载缺失 layer → 存入本地 blob store</text>
        <rect x={20} y={35} width={W - 40} height={20} rx={10}
          fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} />
        <rect x={20} y={35} width={(W - 40) * 0.75} height={20} rx={10}
          fill={COLORS.primary} opacity={0.3} />
        <text x={W / 2} y={49} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          下载中: 2.6 GB (75%)
        </text>
        <text x={W / 2} y={80} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          下载完成 → 验证 SHA256 → 写入 blob 目录 → 更新本地 manifest
        </text>
        <text x={W / 2} y={100} textAnchor="middle" fontSize="7" fill={COLORS.green}
          fontFamily={FONTS.sans}>
          ✓ qwen3:latest 可用
        </text>
      </StepSvg>
    ),
  },
];

export default function RegistryPullFlow() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 9.2: Create ModelfileBuilder component

**Files:**
- Create: `src/components/interactive/ModelfileBuilder.tsx`

Interactive: left side has FROM model select, PARAMETER sliders, SYSTEM text; right side shows generated Modelfile and rendered prompt preview.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const BASE_MODELS = ['qwen3:8b', 'llama3:8b', 'mistral:7b', 'gemma3:9b'];

export default function ModelfileBuilder() {
  const [baseModel, setBaseModel] = useState('qwen3:8b');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [numCtx, setNumCtx] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState('你是一个有帮助的 AI 助手。');

  const modelfile = [
    `FROM ${baseModel}`,
    '',
    `PARAMETER temperature ${temperature}`,
    `PARAMETER top_p ${topP}`,
    `PARAMETER num_ctx ${numCtx}`,
    '',
    `SYSTEM """`,
    systemPrompt,
    `"""`,
  ].join('\n');

  return (
    <div className="grid grid-cols-2 gap-4 my-4">
      {/* Left: Controls */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">FROM (基础模型)</label>
          <select value={baseModel} onChange={e => setBaseModel(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-xs border rounded">
            {BASE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">
            temperature: {temperature}
          </label>
          <input type="range" min={0} max={2} step={0.1} value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">
            top_p: {topP}
          </label>
          <input type="range" min={0} max={1} step={0.05} value={topP}
            onChange={e => setTopP(parseFloat(e.target.value))}
            className="w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">
            num_ctx: {numCtx}
          </label>
          <input type="range" min={512} max={32768} step={512} value={numCtx}
            onChange={e => setNumCtx(parseInt(e.target.value))}
            className="w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">SYSTEM prompt</label>
          <textarea value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-xs border rounded h-16 resize-none"
            placeholder="System prompt..." />
        </div>
      </div>

      {/* Right: Generated Modelfile */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1">生成的 Modelfile:</p>
        <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-auto h-64 font-mono leading-relaxed">
          {modelfile}
        </pre>
        <p className="text-xs text-gray-400 mt-1">
          ollama create my-model -f Modelfile
        </p>
      </div>
    </div>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 9.3: Create MultimodalPipeline component

**Files:**
- Create: `src/components/interactive/MultimodalPipeline.tsx`

Static data flow diagram: image → vision encoder → embedding → merge with text → decoder → output.

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 200;

export default function MultimodalPipeline() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        多模态推理数据流
      </text>

      <defs>
        <marker id="mm-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Image path (top) */}
      <rect x={20} y={40} width={80} height={35} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={60} y={55} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>图像输入</text>
      <text x={60} y={67} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Ollama 预处理</text>

      <line x1={100} y1={57} x2={125} y2={57}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={125} y={40} width={100} height={35} rx={5}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={175} y={55} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Vision Encoder</text>
      <text x={175} y={67} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>GGML 执行</text>

      <line x1={225} y1={57} x2={250} y2={57}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={250} y={40} width={80} height={35} rx={5}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={290} y={55} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Image</text>
      <text x={290} y={67} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Embedding</text>

      {/* Text path (bottom) */}
      <rect x={20} y={100} width={80} height={35} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={60} y={115} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>文本输入</text>
      <text x={60} y={127} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Tokenize</text>

      <line x1={100} y1={117} x2={250} y2={117}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={250} y={100} width={80} height={35} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={290} y={115} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Text</text>
      <text x={290} y={127} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Embedding</text>

      {/* Merge */}
      <line x1={290} y1={75} x2={370} y2={90}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />
      <line x1={330} y1={117} x2={370} y2={100}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={370} y={80} width={80} height={35} rx={5}
        fill="#f0e6ff" stroke="#7c3aed" strokeWidth={1.2} />
      <text x={410} y={95} textAnchor="middle" fontSize="7" fontWeight="600"
        fill="#7c3aed" fontFamily={FONTS.sans}>合并序列</text>
      <text x={410} y={107} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>[img] + [text]</text>

      {/* Decoder */}
      <line x1={450} y1={97} x2={475} y2={97}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={475} y={80} width={80} height={35} rx={5}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={515} y={95} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Transformer</text>
      <text x={515} y={107} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>GGML Decoder</text>

      {/* Output */}
      <line x1={515} y1={115} x2={515} y2={140}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />
      <rect x={475} y={140} width={80} height={25} rx={12}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={515} y={156} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>输出文本</text>

      {/* Legend */}
      <rect x={30} y={H - 20} width={10} height={10} rx={2}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
      <text x={44} y={H - 12} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
        Ollama (Go)
      </text>
      <rect x={150} y={H - 20} width={10} height={10} rx={2}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.8} />
      <text x={164} y={H - 12} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
        GGML (C/C++)
      </text>
      <rect x={270} y={H - 20} width={10} height={10} rx={2}
        fill="#f0e6ff" stroke="#7c3aed" strokeWidth={0.8} />
      <text x={284} y={H - 12} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
        合并层
      </text>
    </svg>
  );
}
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 9.4: Create ollama-model-ecosystem.mdx article

**Files:**
- Create: `src/content/articles/zh/ollama-model-ecosystem.mdx`

```mdx
---
title: "模型生态"
slug: "ollama-model-ecosystem"
locale: "zh"
tags: ["ollama", "registry", "modelfile", "lora", "multimodal"]
prerequisites: ["ollama-architecture", "gguf-format"]
difficulty: "intermediate"
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: "github"
    title: "Ollama Modelfile"
    url: "https://github.com/ollama/ollama/blob/main/docs/modelfile.md"
  - type: "github"
    title: "Ollama API"
    url: "https://github.com/ollama/ollama/blob/main/docs/api.md"
  - type: "paper"
    title: "LLaVA: Visual Instruction Tuning"
    url: "https://arxiv.org/abs/2304.08485"
---

import RegistryPullFlow from '../../../components/interactive/RegistryPullFlow.tsx';
import ModelfileBuilder from '../../../components/interactive/ModelfileBuilder.tsx';
import MultimodalPipeline from '../../../components/interactive/MultimodalPipeline.tsx';
```

Content per spec: Ollama Registry + `<RegistryPullFlow client:visible />`, layer dedup, Modelfile + `<ModelfileBuilder client:visible />`, prompt template system, LoRA/adapter support, multimodal + `<MultimodalPipeline client:visible />`, new architecture support

- [ ] Create the MDX file with full Chinese content
- [ ] Verify rendering
- [ ] Verify all 3 components

### Step 9.5: Commit Article 9

```bash
git add src/components/interactive/RegistryPullFlow.tsx \
        src/components/interactive/ModelfileBuilder.tsx \
        src/components/interactive/MultimodalPipeline.tsx \
        src/content/articles/zh/ollama-model-ecosystem.mdx
git commit -m "feat: add model ecosystem article with 3 components"
```

- [ ] Stage and commit

---

## Task 10: Learning Path + Validation

### Step 10.1: Create learning path YAML

**Files:**
- Create: `src/content/paths/ollama-internals.yaml`

```yaml
id: ollama-internals
title:
  zh: "Ollama + llama.cpp 深度解析"
  en: "Ollama + llama.cpp Deep Dive"
description:
  zh: "深入 Ollama 和 llama.cpp 的内部实现、架构设计和优化原理。从双层架构到量化引擎，从计算图到多后端调度，系统掌握本地推理技术栈。"
  en: "Deep dive into Ollama and llama.cpp internals — architecture, quantization, compute graphs, hardware backends, and serving infrastructure."
level: advanced
articles:
  - ollama-architecture
  - ollama-inference-journey
  - gguf-format
  - ollama-quantization
  - ollama-compute-graph
  - ollama-kv-cache-scheduling
  - ollama-hardware-backends
  - ollama-server-scheduling
  - ollama-model-ecosystem
```

- [ ] Create the file
- [ ] Verify it compiles

### Step 10.2: Run validation

```bash
npm run validate
```

- [ ] Run validation and fix any errors
- [ ] Run `npm run dev` and verify the learning path page at `/zh/paths/ollama-internals` renders correctly with all 9 articles listed

### Step 10.3: Full build test

```bash
npm run build
```

- [ ] Build succeeds with no errors

### Step 10.4: Commit learning path

```bash
git add src/content/paths/ollama-internals.yaml
git commit -m "feat: add ollama-internals learning path definition"
```

- [ ] Stage and commit

### Step 10.5: Final verification commit (if any fixes needed)

If any validation or build errors were found and fixed in previous steps, commit the fixes:

```bash
git add -A
git commit -m "fix: address validation and build issues for ollama learning path"
```

- [ ] Commit fixes if any
