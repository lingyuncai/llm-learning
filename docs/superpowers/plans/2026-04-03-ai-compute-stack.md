# AI Compute Stack 全景 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a 科普-level article explaining the full AI/GPU software stack (7 layers from Hardware ISA to Inference Framework) with 3 interactive components and a new learning path.

**Architecture:** Astro + MDX article with 3 React interactive components (StackLayerDiagram, MatmulJourney, EcosystemPathSelector) sharing a common data module for the 7-layer stack structure. Components use SVG for visualization, Motion for animations, and the project's existing color system.

**Tech Stack:** Astro 5, MDX, React 18, TypeScript, Motion (framer-motion), SVG, Tailwind CSS

**Design Spec:** `docs/superpowers/specs/2026-04-03-ai-compute-stack-design.md` (513 lines, complete content outline + component specs)

---

## File Structure

| # | Action | File | Responsibility |
|---|--------|------|---------------|
| 1 | Create | `src/components/interactive/shared/stackData.ts` | Shared 7-layer data: layer definitions, technology nodes, brand mappings, ecosystem paths — consumed by all 3 components |
| 2 | Create | `src/components/interactive/StackLayerDiagram.tsx` | Interactive 7-layer stack diagram with expand/collapse + brand highlighting |
| 3 | Create | `src/components/interactive/MatmulJourney.tsx` | 7-step StepNavigator tracing a matmul call from framework to hardware |
| 4 | Create | `src/components/interactive/EcosystemPathSelector.tsx` | 5-scenario path selector highlighting technology nodes on the stack |
| 5 | Create | `src/content/paths/ai-compute-stack.yaml` | New learning path with this article as first entry |
| 6 | Create | `src/content/articles/zh/ai-compute-stack.mdx` | The article: frontmatter + 8 sections + 3 component imports |

**Dependency graph:**
```
Task 1 (shared data) → Task 2 (StackLayerDiagram)
                      → Task 3 (MatmulJourney)
                      → Task 4 (EcosystemPathSelector)
Task 5 (learning path) — independent
Task 2,3,4,5 → Task 6 (article MDX)
Task 6 → Task 7 (build validation)
```

---

## Shared Type Definitions

These types are defined in Task 1 (`stackData.ts`) and used by Tasks 2–4. Reference this section when implementing any component.

```typescript
/** A single technology node within a layer */
interface TechNode {
  id: string;           // unique key, e.g. 'cuda-rt'
  label: string;        // display name, e.g. 'CUDA Runtime'
  brands: string[];     // which brands include this node: 'cuda' | 'opencl-sycl' | 'rocm' | 'oneapi' | 'metal'
}

/** One of the 7 layers in the stack */
interface StackLayer {
  id: string;           // e.g. 'runtime'
  name: string;         // e.g. 'Runtime'
  color: string;        // tailwind-compatible hex color
  nodes: TechNode[];    // technologies in this layer
}

/** An ecosystem path (for EcosystemPathSelector) */
interface EcoPath {
  id: string;           // e.g. 'pytorch-cuda'
  label: string;        // e.g. 'PyTorch + CUDA (NVIDIA)'
  description: string;  // one-line summary
  /** node IDs that light up for this path, keyed by layer id */
  highlightNodes: Record<string, string[]>;
  /** true if ggml spans operator+language layers */
  ggmlSpan?: boolean;
}

/** Brand filter button */
interface Brand {
  id: string;           // 'cuda' | 'opencl-sycl' | 'rocm' | 'oneapi' | 'metal'
  label: string;        // display name
  color: string;        // brand accent color
}
```

---

## Task 1: Shared Stack Data Module

**Files:**
- Create: `src/components/interactive/shared/stackData.ts`

This module is the single source of truth for all 3 components. It exports: layer definitions (with technology nodes), brand definitions (with highlight mappings), and ecosystem path definitions.

- [ ] **Step 1: Create `stackData.ts` with type definitions and layer data**

```typescript
// src/components/interactive/shared/stackData.ts

// ============================================================
// Types
// ============================================================

export interface TechNode {
  id: string;
  label: string;
  brands: string[];  // 'cuda' | 'opencl-sycl' | 'rocm' | 'oneapi' | 'metal'
}

export interface StackLayer {
  id: string;
  name: string;
  color: string;
  nodes: TechNode[];
}

export interface EcoPath {
  id: string;
  label: string;
  description: string;
  highlightNodes: Record<string, string[]>;
  ggmlSpan?: boolean;
}

export interface Brand {
  id: string;
  label: string;
  color: string;
}

// ============================================================
// 7 Stack Layers (top → bottom in the diagram, but array index
// 0 = topmost = Inference Framework)
// ============================================================

export const STACK_LAYERS: StackLayer[] = [
  {
    id: 'framework',
    name: 'Inference Framework',
    color: '#1565c0',  // blue
    nodes: [
      { id: 'onnx-rt',    label: 'ONNX Runtime',  brands: [] },
      { id: 'tensorrt',   label: 'TensorRT',      brands: ['cuda'] },
      { id: 'openvino',   label: 'OpenVINO',      brands: ['oneapi'] },
      { id: 'litert',     label: 'LiteRT',         brands: [] },
      { id: 'coreml',     label: 'CoreML',         brands: ['metal'] },
      { id: 'llamacpp',   label: 'llama.cpp',      brands: [] },
    ],
  },
  {
    id: 'graph-opt',
    name: 'Graph Optimizer',
    color: '#1976d2',  // blue lighter
    nodes: [
      { id: 'trt-opt',      label: 'TensorRT optimizer', brands: ['cuda'] },
      { id: 'xla',          label: 'XLA',                brands: [] },
      { id: 'tvm',          label: 'Apache TVM',         brands: [] },
      { id: 'torch-compile',label: 'torch.compile',      brands: [] },
    ],
  },
  {
    id: 'operator-lib',
    name: 'Operator Library',
    color: '#2e7d32',  // green
    nodes: [
      { id: 'cudnn',    label: 'cuDNN',           brands: ['cuda'] },
      { id: 'cublas',   label: 'cuBLAS',          brands: ['cuda'] },
      { id: 'onednn',   label: 'oneDNN',          brands: ['oneapi'] },
      { id: 'mps',      label: 'MPS',             brands: ['metal'] },
      { id: 'xnnpack',  label: 'XNNPACK',         brands: [] },
      { id: 'rocblas',  label: 'rocBLAS/MIOpen',  brands: ['rocm'] },
      { id: 'ggml',     label: 'ggml',            brands: [] },
    ],
  },
  {
    id: 'language',
    name: 'Language + Compiler + IR',
    color: '#e65100',  // orange
    nodes: [
      { id: 'cuda-cpp',  label: 'CUDA C++ (nvcc→PTX)',             brands: ['cuda'] },
      { id: 'hip',       label: 'HIP (hipcc→LLVM IR)',             brands: ['rocm'] },
      { id: 'opencl-c',  label: 'OpenCL C (→SPIR-V)',              brands: ['opencl-sycl'] },
      { id: 'sycl',      label: 'SYCL (DPC++→SPIR-V)',             brands: ['opencl-sycl', 'oneapi'] },
      { id: 'triton',    label: 'Triton (→LLVM IR)',               brands: [] },
      { id: 'shaders',   label: 'GLSL/HLSL/WGSL/Metal SL/Slang',  brands: ['metal'] },
    ],
  },
  {
    id: 'runtime',
    name: 'Runtime',
    color: '#6a1b9a',  // purple
    nodes: [
      { id: 'cuda-rt',      label: 'CUDA Runtime',     brands: ['cuda'] },
      { id: 'cuda-drv-api', label: 'CUDA Driver API',   brands: ['cuda'] },
      { id: 'opencl-rt',    label: 'OpenCL Runtime',    brands: ['opencl-sycl'] },
      { id: 'level-zero',   label: 'Level Zero',        brands: ['oneapi'] },
      { id: 'vulkan',       label: 'Vulkan',            brands: [] },
      { id: 'metal-rt',     label: 'Metal',             brands: ['metal'] },
      { id: 'hip-rt',       label: 'HIP Runtime',       brands: ['rocm'] },
    ],
  },
  {
    id: 'driver',
    name: 'Driver',
    color: '#546e7a',  // blue-grey
    nodes: [
      { id: 'nvidia-drv', label: 'NVIDIA Driver (PTX→SASS)',          brands: ['cuda'] },
      { id: 'amd-drv',    label: 'AMD Driver (→RDNA ISA)',            brands: ['rocm'] },
      { id: 'intel-drv',  label: 'Intel Driver (SPIR-V→Xe ISA)',      brands: ['oneapi', 'opencl-sycl'] },
      { id: 'apple-drv',  label: 'Apple Driver (AIR→Apple GPU ISA)',   brands: ['metal'] },
    ],
  },
  {
    id: 'hardware',
    name: 'Hardware ISA',
    color: '#37474f',  // dark blue-grey
    nodes: [
      { id: 'sass',      label: 'NVIDIA SASS',      brands: ['cuda'] },
      { id: 'rdna',      label: 'AMD RDNA ISA',     brands: ['rocm'] },
      { id: 'xe-isa',    label: 'Intel Xe ISA',     brands: ['oneapi'] },
      { id: 'apple-isa', label: 'Apple GPU ISA',    brands: ['metal'] },
      { id: 'adreno',    label: 'Qualcomm Adreno',  brands: [] },
    ],
  },
];

// ============================================================
// Brand Definitions (for StackLayerDiagram brand filter buttons)
// ============================================================

export const BRANDS: Brand[] = [
  { id: 'cuda',         label: 'CUDA',          color: '#76b900' },
  { id: 'opencl-sycl',  label: 'OpenCL + SYCL', color: '#ed1c24' },
  { id: 'rocm',         label: 'ROCm',          color: '#7f1d1d' },
  { id: 'oneapi',       label: 'oneAPI',        color: '#0071c5' },
  { id: 'metal',        label: 'Metal',         color: '#a3aaae' },
];

// ============================================================
// Ecosystem Paths (for EcosystemPathSelector)
// ============================================================

export const ECO_PATHS: EcoPath[] = [
  {
    id: 'tensorrt-cuda',
    label: 'TensorRT + CUDA (NVIDIA)',
    description: 'NVIDIA 闭源全栈，最成熟但锁定厂商',
    highlightNodes: {
      framework:      ['tensorrt'],
      'graph-opt':    ['trt-opt'],
      'operator-lib': ['cudnn', 'cublas'],
      language:       ['cuda-cpp'],
      runtime:        ['cuda-rt'],
      driver:         ['nvidia-drv'],
      hardware:       ['sass'],
    },
  },
  {
    id: 'onnxrt-oneapi',
    label: 'ONNX Runtime + oneAPI (Intel)',
    description: 'Intel 开放生态，SYCL 语言可跨平台',
    highlightNodes: {
      framework:      ['onnx-rt'],
      'graph-opt':    [],
      'operator-lib': ['onednn'],
      language:       ['sycl'],
      runtime:        ['level-zero'],
      driver:         ['intel-drv'],
      hardware:       ['xe-isa'],
    },
  },
  {
    id: 'llamacpp-metal',
    label: 'llama.cpp + Metal (Apple)',
    description: 'Apple 原生推理，ggml 垂直整合跳过算子库',
    highlightNodes: {
      framework:      ['llamacpp'],
      'graph-opt':    [],
      'operator-lib': ['ggml'],
      language:       ['shaders'],
      runtime:        ['metal-rt'],
      driver:         ['apple-drv'],
      hardware:       ['apple-isa'],
    },
    ggmlSpan: true,
  },
  {
    id: 'llamacpp-vulkan',
    label: 'llama.cpp + Vulkan (跨平台)',
    description: '跨平台 GPU 推理，Vulkan 覆盖大多数硬件',
    highlightNodes: {
      framework:      ['llamacpp'],
      'graph-opt':    [],
      'operator-lib': ['ggml'],
      language:       ['shaders'],
      runtime:        ['vulkan'],
      driver:         ['nvidia-drv', 'amd-drv', 'intel-drv'],
      hardware:       ['sass', 'rdna', 'xe-isa'],
    },
    ggmlSpan: true,
  },
  {
    id: 'litert-opencl',
    label: 'LiteRT + OpenCL (移动端)',
    description: '移动端推理，OpenCL 广泛支持移动 GPU',
    highlightNodes: {
      framework:      ['litert'],
      'graph-opt':    [],
      'operator-lib': ['xnnpack'],
      language:       ['opencl-c'],
      runtime:        ['opencl-rt'],
      driver:         [],
      hardware:       ['adreno'],
    },
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/components/interactive/shared/stackData.ts`

If tsc is not directly available, run: `npm run build` after all files are created (Task 7). At minimum, verify the file has no syntax errors by opening it in the IDE.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/shared/stackData.ts
git commit -m "feat: add shared stack data module for AI Compute Stack components"
```

---

## Task 2: StackLayerDiagram Component

**Files:**
- Create: `src/components/interactive/StackLayerDiagram.tsx`
- Depends on: `src/components/interactive/shared/stackData.ts` (Task 1)

**What it does:** Interactive 7-layer stack diagram. Default: collapsed layers showing only layer names. Click a layer to expand and show its technology nodes. Bottom brand buttons (CUDA / OpenCL+SYCL / ROCm / oneAPI / Metal) highlight that brand's nodes across all layers, dimming the rest.

**Layout spec (SVG):**
- SVG viewBox: `0 0 600 520` (responsive via `className="w-full"`)
- Each collapsed layer: full-width rounded rect, height ~36px, spaced vertically ~8px gap
- Expanded layer: height grows to accommodate nodes (flex-wrapped pills inside)
- Brand buttons: row of 5 buttons below the SVG

**Interaction states:**
1. `expandedLayers: Set<string>` — which layers are expanded (toggle on click)
2. `activeBrand: string | null` — which brand filter is active (toggle on click, null = no filter)

**Visual rules:**
- Each layer rect uses the layer's `color` field at 15% opacity for fill, full opacity for left border accent
- Expanded nodes render as small rounded pill rects inside the layer
- When `activeBrand` is set: nodes whose `brands` array includes the active brand get full opacity; others get 0.15 opacity. Layer rects with zero matching nodes also dim.
- Motion animations: `layout` prop on layer rects for smooth height transition; `AnimatePresence` for node pills appearing/disappearing

- [ ] **Step 1: Create `StackLayerDiagram.tsx`**

```tsx
// src/components/interactive/StackLayerDiagram.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STACK_LAYERS, BRANDS, type StackLayer, type TechNode } from './shared/stackData';

// ---------- Layout constants ----------
const SVG_W = 600;
const LAYER_H_COLLAPSED = 36;
const LAYER_GAP = 6;
const LAYER_PAD_X = 12;
const NODE_PILL_H = 24;
const NODE_PILL_GAP = 6;
const NODE_PILL_PAD = 8;        // top padding inside expanded layer before pills
const NODES_PER_ROW = 3;        // max pills per row before wrapping
const NODE_PILL_W = (SVG_W - LAYER_PAD_X * 2 - NODE_PILL_GAP * (NODES_PER_ROW - 1)) / NODES_PER_ROW;

function nodeRows(count: number): number {
  return Math.ceil(count / NODES_PER_ROW);
}

function expandedLayerH(nodeCount: number): number {
  const rows = nodeRows(nodeCount);
  return LAYER_H_COLLAPSED + NODE_PILL_PAD + rows * (NODE_PILL_H + NODE_PILL_GAP);
}

function isNodeHighlighted(node: TechNode, activeBrand: string | null): boolean {
  if (!activeBrand) return true;
  return node.brands.includes(activeBrand);
}

function isLayerHighlighted(layer: StackLayer, activeBrand: string | null): boolean {
  if (!activeBrand) return true;
  return layer.nodes.some(n => n.brands.includes(activeBrand));
}

export default function StackLayerDiagram() {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const toggleLayer = useCallback((layerId: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  }, []);

  const toggleBrand = useCallback((brandId: string) => {
    setActiveBrand(prev => (prev === brandId ? null : brandId));
  }, []);

  // Compute cumulative Y positions
  const layerPositions: { layer: StackLayer; y: number; h: number }[] = [];
  let curY = 8;
  for (const layer of STACK_LAYERS) {
    const expanded = expandedLayers.has(layer.id);
    const h = expanded ? expandedLayerH(layer.nodes.length) : LAYER_H_COLLAPSED;
    layerPositions.push({ layer, y: curY, h });
    curY += h + LAYER_GAP;
  }
  const totalH = curY + 4;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${SVG_W} ${totalH}`} className="w-full">
        {layerPositions.map(({ layer, y, h }) => {
          const expanded = expandedLayers.has(layer.id);
          const highlighted = isLayerHighlighted(layer, activeBrand);
          return (
            <g key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              style={{ cursor: 'pointer' }}
              opacity={highlighted ? 1 : 0.15}
            >
              {/* Layer background rect */}
              <motion.rect
                x={0} y={y} width={SVG_W} rx={6}
                fill={`${layer.color}18`}
                stroke={layer.color}
                strokeWidth={0}
                animate={{ height: h }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
              {/* Left accent bar */}
              <motion.rect
                x={0} y={y} width={4} rx={2}
                fill={layer.color}
                animate={{ height: h }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
              {/* Layer name */}
              <text x={LAYER_PAD_X + 6} y={y + LAYER_H_COLLAPSED / 2 + 1}
                dominantBaseline="middle" fontSize="13" fontWeight="600"
                fill={layer.color} fontFamily="system-ui">
                {layer.name}
              </text>
              {/* Expand indicator */}
              <text x={SVG_W - LAYER_PAD_X} y={y + LAYER_H_COLLAPSED / 2 + 1}
                dominantBaseline="middle" textAnchor="end" fontSize="11"
                fill={layer.color} fontFamily="system-ui" opacity={0.6}>
                {expanded ? '▾' : '▸'} {layer.nodes.length}
              </text>
              {/* Expanded node pills */}
              <AnimatePresence>
              {expanded && layer.nodes.map((node, ni) => {
                const row = Math.floor(ni / NODES_PER_ROW);
                const col = ni % NODES_PER_ROW;
                const nx = LAYER_PAD_X + col * (NODE_PILL_W + NODE_PILL_GAP);
                const ny = y + LAYER_H_COLLAPSED + NODE_PILL_PAD + row * (NODE_PILL_H + NODE_PILL_GAP);
                const nodeHl = isNodeHighlighted(node, activeBrand);
                return (
                  <motion.g key={node.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: nodeHl ? 1 : 0.15, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: ni * 0.02 }}
                  >
                    <rect x={nx} y={ny} width={NODE_PILL_W} height={NODE_PILL_H}
                      rx={4} fill="white" stroke={layer.color} strokeWidth={1} />
                    <text x={nx + NODE_PILL_W / 2} y={ny + NODE_PILL_H / 2 + 1}
                      dominantBaseline="middle" textAnchor="middle"
                      fontSize="9" fill="#1a1a2e" fontFamily="system-ui">
                      {node.label}
                    </text>
                  </motion.g>
                );
              })}
              </AnimatePresence>
            </g>
          );
        })}
      </svg>

      {/* Brand filter buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {BRANDS.map(brand => (
          <button key={brand.id}
            onClick={() => toggleBrand(brand.id)}
            className="px-3 py-1 text-xs rounded-full border transition-colors"
            style={{
              borderColor: brand.color,
              backgroundColor: activeBrand === brand.id ? brand.color : 'transparent',
              color: activeBrand === brand.id ? 'white' : brand.color,
            }}>
            {brand.label}
          </button>
        ))}
        {activeBrand && (
          <button onClick={() => setActiveBrand(null)}
            className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors">
            清除筛选
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        点击层名展开技术节点 · 底部按钮按品牌高亮
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Smoke test in dev server**

Run: `npm run dev`

Navigate to the article page (after Task 6) or create a temporary test page. Verify:
- 7 layers render vertically
- Clicking a layer expands to show node pills
- Brand buttons highlight matching nodes and dim others
- No console errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/StackLayerDiagram.tsx
git commit -m "feat: add StackLayerDiagram interactive component"
```

---

## Task 3: MatmulJourney Component

**Files:**
- Create: `src/components/interactive/MatmulJourney.tsx`
- Depends on: `src/components/interactive/shared/stackData.ts` (Task 1) — uses `STACK_LAYERS` for the left-side mini stack indicator
- Uses: `src/components/primitives/StepNavigator.tsx` — wraps steps in StepNavigator

**What it does:** A 7-step StepNavigator that traces a single `matmul` call from `model.forward()` down to GPU hardware execution. Each step shows:
- **Left side (~30%):** A mini vertical stack bar with 7 layers, the current layer highlighted and enlarged
- **Right side (~70%):** An SVG illustration specific to that step (computation graph, tiling diagram, kernel code, buffer diagram, compiler pipeline, GPU execution)

**Layout:** Each step's `content` is a flexbox `div` with left mini-stack + right SVG illustration. The right SVG is unique per step but all share a `320×160` viewBox.

**StepNavigator API reminder:**
```tsx
<StepNavigator steps={[{ title: string, content: ReactNode }, ...]} />
```

- [ ] **Step 1: Create `MatmulJourney.tsx`**

```tsx
// src/components/interactive/MatmulJourney.tsx
import StepNavigator from '../primitives/StepNavigator';
import { STACK_LAYERS } from './shared/stackData';
import { COLORS } from './shared/colors';

// ---- Mini stack indicator (left side) ----
const MINI_W = 100;
const MINI_H = 180;
const MINI_LAYER_H = 18;
const MINI_GAP = 3;
const MINI_START_Y = (MINI_H - STACK_LAYERS.length * (MINI_LAYER_H + MINI_GAP)) / 2;

function MiniStack({ activeIndex }: { activeIndex: number }) {
  return (
    <svg viewBox={`0 0 ${MINI_W} ${MINI_H}`} className="w-full h-full">
      {STACK_LAYERS.map((layer, i) => {
        const y = MINI_START_Y + i * (MINI_LAYER_H + MINI_GAP);
        const isActive = i === activeIndex;
        return (
          <g key={layer.id}>
            <rect x={4} y={y} width={MINI_W - 8}
              height={isActive ? MINI_LAYER_H + 4 : MINI_LAYER_H}
              rx={3}
              fill={isActive ? `${layer.color}30` : `${layer.color}10`}
              stroke={isActive ? layer.color : 'transparent'}
              strokeWidth={isActive ? 1.5 : 0}
            />
            <text x={MINI_W / 2} y={y + (isActive ? MINI_LAYER_H + 4 : MINI_LAYER_H) / 2 + 1}
              dominantBaseline="middle" textAnchor="middle"
              fontSize={isActive ? '8' : '6.5'}
              fontWeight={isActive ? '700' : '400'}
              fill={isActive ? layer.color : '#999'}
              fontFamily="system-ui">
              {layer.name.replace(' + Compiler + IR', '')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- Right-side illustrations (one per step) ----
const ILLUS_W = 320;
const ILLUS_H = 160;

/** Step 1: Computation graph with MatMul highlighted */
function IllusFramework() {
  const nodes = [
    { x: 40,  y: 40,  label: 'Embedding',  hl: false },
    { x: 160, y: 40,  label: 'LayerNorm',   hl: false },
    { x: 160, y: 100, label: 'MatMul',      hl: true },
    { x: 280, y: 70,  label: 'BiasAdd',     hl: false },
  ];
  const edges = [[0,1],[1,2],[2,3]];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {edges.map(([a,b]) => (
        <line key={`${a}-${b}`}
          x1={nodes[a].x+30} y1={nodes[a].y}
          x2={nodes[b].x-30} y2={nodes[b].y}
          stroke="#cbd5e1" strokeWidth={1.5} />
      ))}
      {nodes.map((n,i) => (
        <g key={i}>
          <rect x={n.x-30} y={n.y-14} width={60} height={28} rx={6}
            fill={n.hl ? '#dbeafe' : '#f8fafc'}
            stroke={n.hl ? COLORS.primary : '#e2e8f0'}
            strokeWidth={n.hl ? 2 : 1} />
          <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight={n.hl ? '700' : '400'}
            fill={n.hl ? COLORS.primary : '#64748b'} fontFamily="system-ui">
            {n.label}
          </text>
        </g>
      ))}
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily="system-ui">model.forward() 执行计算图</text>
    </svg>
  );
}

/** Step 2: Graph optimizer fuses MatMul + BiasAdd */
function IllusGraphOpt() {
  const nodes = [
    { x: 40,  y: 60, label: 'Embedding',     hl: false },
    { x: 160, y: 40, label: 'LayerNorm',      hl: false },
    { x: 260, y: 60, label: 'FusedMatMul',    hl: true },
  ];
  const edges = [[0,1],[1,2]];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {edges.map(([a,b]) => (
        <line key={`${a}-${b}`}
          x1={nodes[a].x+35} y1={nodes[a].y}
          x2={nodes[b].x-35} y2={nodes[b].y}
          stroke="#cbd5e1" strokeWidth={1.5} />
      ))}
      {nodes.map((n,i) => (
        <g key={i}>
          <rect x={n.x-35} y={n.y-14} width={70} height={28} rx={6}
            fill={n.hl ? '#dcfce7' : '#f8fafc'}
            stroke={n.hl ? COLORS.green : '#e2e8f0'}
            strokeWidth={n.hl ? 2 : 1} />
          <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight={n.hl ? '700' : '400'}
            fill={n.hl ? COLORS.green : '#64748b'} fontFamily="system-ui">
            {n.label}
          </text>
        </g>
      ))}
      <text x={200} y={100} textAnchor="middle" fontSize="9" fill={COLORS.green}
        fontFamily="system-ui" fontWeight="600">
        ✦ MatMul + BiasAdd → FusedMatMul
      </text>
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily="system-ui">算子融合：减少 kernel 启动次数</text>
    </svg>
  );
}

/** Step 3: Operator Library — tiling diagram */
function IllusOperatorLib() {
  // 2×2 tile grid on a matrix
  const matX = 60, matY = 15, matW = 80, matH = 80;
  const tileW = matW/2, tileH = matH/2;
  const tileColors = ['#dbeafe','#dcfce7','#fef3c7','#fce7f3'];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {/* Big matrix */}
      <rect x={matX} y={matY} width={matW} height={matH}
        fill="none" stroke="#94a3b8" strokeWidth={1} />
      {[0,1].map(r => [0,1].map(c => (
        <rect key={`${r}${c}`}
          x={matX + c*tileW} y={matY + r*tileH}
          width={tileW} height={tileH}
          fill={tileColors[r*2+c]} stroke="#64748b" strokeWidth={0.5} />
      )))}
      <text x={matX+matW/2} y={matY+matH+14} textAnchor="middle" fontSize="8"
        fill="#64748b" fontFamily="system-ui">大矩阵 A</text>

      {/* Arrow */}
      <text x={165} y={55} fontSize="16" fill="#94a3b8">→</text>

      {/* Tiles dispatched to thread blocks */}
      {[0,1,2,3].map(i => {
        const tx = 200 + (i%2)*60;
        const ty = 20 + Math.floor(i/2)*55;
        return (
          <g key={i}>
            <rect x={tx} y={ty} width={40} height={35} rx={4}
              fill={tileColors[i]} stroke="#64748b" strokeWidth={0.5} />
            <text x={tx+20} y={ty+20} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="#1a1a2e" fontFamily="monospace">
              Block {i}
            </text>
          </g>
        );
      })}
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily="system-ui">选择 tiling 策略，每个 tile → thread block</text>
    </svg>
  );
}

/** Step 4: Kernel pseudo-code */
function IllusKernel() {
  const lines = [
    '__global__ void matmul_tile(',
    '  float *A, float *B, float *C) {',
    '  int tile = blockIdx.x;',
    '  // 每个 block 处理一个 tile',
    '  for (int k = 0; k < K; k += TILE)',
    '    C[tile] += A[tile,k] * B[k,tile];',
    '}',
  ];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      <rect x={10} y={5} width={ILLUS_W-20} height={ILLUS_H-20} rx={6}
        fill="#1e293b" />
      {lines.map((line, i) => (
        <text key={i} x={22} y={24 + i * 16} fontSize="9"
          fill={line.startsWith('//') || line.startsWith('  //') ? '#6b7280' : '#e2e8f0'}
          fontFamily="monospace">
          {line}
        </text>
      ))}
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily="system-ui">每个 thread block 执行一份 tile 的计算</text>
    </svg>
  );
}

/** Step 5: Runtime — buffer + queue + dispatch */
function IllusRuntime() {
  const buffers = [
    { x: 30,  label: 'buf A', color: '#dbeafe' },
    { x: 110, label: 'buf B', color: '#dcfce7' },
    { x: 190, label: 'buf C', color: '#fef3c7' },
  ];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {/* Buffers */}
      {buffers.map(b => (
        <g key={b.label}>
          <rect x={b.x} y={15} width={60} height={35} rx={4}
            fill={b.color} stroke="#64748b" strokeWidth={1} />
          <text x={b.x+30} y={36} textAnchor="middle" fontSize="9"
            fill="#1a1a2e" fontFamily="monospace">{b.label}</text>
        </g>
      ))}
      <text x={150} y={8} textAnchor="middle" fontSize="8" fill="#94a3b8"
        fontFamily="system-ui">GPU 显存 Buffer</text>

      {/* Command Queue arrow */}
      <line x1={30} y1={75} x2={290} y2={75}
        stroke={COLORS.purple} strokeWidth={2} markerEnd="url(#arrowPurple)" />
      <text x={160} y={70} textAnchor="middle" fontSize="8" fill={COLORS.purple}
        fontFamily="system-ui" fontWeight="600">Command Queue</text>

      {/* Queue items */}
      {['拷 A→GPU', '拷 B→GPU', 'dispatch kernel', '拷 C→CPU'].map((item, i) => (
        <g key={i}>
          <rect x={20+i*70} y={85} width={62} height={22} rx={3}
            fill={i===2 ? '#ede9fe' : '#f1f5f9'} stroke={i===2 ? COLORS.purple : '#cbd5e1'}
            strokeWidth={1} />
          <text x={20+i*70+31} y={99} textAnchor="middle" fontSize="7"
            fill={i===2 ? COLORS.purple : '#64748b'} fontFamily="system-ui">
            {item}
          </text>
        </g>
      ))}

      {/* Arrow marker def */}
      <defs>
        <marker id="arrowPurple" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.purple} />
        </marker>
      </defs>

      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily="system-ui">allocate buffer → 入队命令 → dispatch kernel</text>
    </svg>
  );
}

/** Step 6: Driver — IR → compiler → ISA */
function IllusDriver() {
  const boxes = [
    { x: 30,  w: 70, label: 'PTX / SPIR-V',  sub: '(IR 字节码)', color: '#fef3c7' },
    { x: 140, w: 60, label: '编译器',          sub: '(Driver 内置)', color: '#e2e8f0' },
    { x: 240, w: 70, label: 'SASS / Xe ISA',   sub: '(硬件指令)', color: '#dcfce7' },
  ];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={30} width={b.w} height={50} rx={6}
            fill={b.color} stroke="#64748b" strokeWidth={1} />
          <text x={b.x+b.w/2} y={50} textAnchor="middle" fontSize="9"
            fontWeight="600" fill="#1a1a2e" fontFamily="system-ui">{b.label}</text>
          <text x={b.x+b.w/2} y={65} textAnchor="middle" fontSize="7"
            fill="#64748b" fontFamily="system-ui">{b.sub}</text>
        </g>
      ))}
      {/* Arrows between boxes */}
      <line x1={102} y1={55} x2={138} y2={55} stroke="#64748b" strokeWidth={1.5}
        markerEnd="url(#arrowGray)" />
      <line x1={202} y1={55} x2={238} y2={55} stroke="#64748b" strokeWidth={1.5}
        markerEnd="url(#arrowGray)" />

      <text x={160} y={105} textAnchor="middle" fontSize="9" fill={COLORS.orange}
        fontFamily="system-ui" fontWeight="600">
        JIT 编译 (运行时) 或 AOT (构建时)
      </text>

      <defs>
        <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="#64748b" />
        </marker>
      </defs>
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily="system-ui">Driver 将 IR 编译为硬件可执行的 ISA</text>
    </svg>
  );
}

/** Step 7: Hardware — SM/EU parallel execution */
function IllusHardware() {
  const smCount = 6;
  const smW = 38, smH = 50, gap = 8;
  const totalW = smCount * (smW + gap) - gap;
  const startX = (ILLUS_W - totalW) / 2;
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      <text x={ILLUS_W/2} y={14} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily="system-ui">GPU Die</text>
      <rect x={startX-10} y={20} width={totalW+20} height={smH+20} rx={6}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
      {Array.from({length: smCount}).map((_, i) => (
        <g key={i}>
          <rect x={startX + i*(smW+gap)} y={28} width={smW} height={smH} rx={4}
            fill={i < 4 ? '#dbeafe' : '#f8fafc'}
            stroke={i < 4 ? COLORS.primary : '#d1d5db'}
            strokeWidth={i < 4 ? 1.5 : 1} />
          <text x={startX + i*(smW+gap) + smW/2} y={48}
            textAnchor="middle" fontSize="7" fill={i < 4 ? COLORS.primary : '#94a3b8'}
            fontFamily="monospace" fontWeight="600">
            SM {i}
          </text>
          {i < 4 && (
            <text x={startX + i*(smW+gap) + smW/2} y={62}
              textAnchor="middle" fontSize="6" fill={COLORS.primary}
              fontFamily="monospace">
              warp×32
            </text>
          )}
        </g>
      ))}
      {/* Result arrow */}
      <line x1={ILLUS_W/2} y1={100} x2={ILLUS_W/2} y2={120}
        stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#arrowGreen)" />
      <text x={ILLUS_W/2} y={135} textAnchor="middle" fontSize="8" fill={COLORS.green}
        fontFamily="system-ui" fontWeight="600">结果写回显存</text>
      <defs>
        <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.green} />
        </marker>
      </defs>
    </svg>
  );
}

// ---- Step definitions ----
const STEP_ILLUSTRATIONS = [
  IllusFramework,
  IllusGraphOpt,
  IllusOperatorLib,
  IllusKernel,
  IllusRuntime,
  IllusDriver,
  IllusHardware,
];

const STEP_TITLES = [
  '1. Framework: model.forward() 遇到 MatMul',
  '2. Graph Optimizer: MatMul + BiasAdd 融合',
  '3. Operator Library: 选择 tiling 策略',
  '4. Kernel: 每个 thread block 处理一个 tile',
  '5. Runtime: allocate buffer → dispatch kernel',
  '6. Driver: IR → JIT 编译 → 硬件 ISA',
  '7. Hardware: SM/EU 并行执行 warp',
];

const STEP_LAYER_INDICES = [0, 1, 2, 3, 4, 5, 6]; // maps step → STACK_LAYERS index

export default function MatmulJourney() {
  const steps = STEP_TITLES.map((title, i) => {
    const Illustration = STEP_ILLUSTRATIONS[i];
    return {
      title,
      content: (
        <div className="flex gap-2 items-stretch" style={{ minHeight: 200 }}>
          {/* Left: mini stack */}
          <div className="flex-shrink-0" style={{ width: 100 }}>
            <MiniStack activeIndex={STEP_LAYER_INDICES[i]} />
          </div>
          {/* Right: illustration */}
          <div className="flex-1 border border-gray-200 rounded-lg bg-white p-1 flex items-center">
            <Illustration />
          </div>
        </div>
      ),
    };
  });

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Smoke test**

Run: `npm run dev`, navigate to article page. Verify:
- 7 steps navigable via StepNavigator buttons
- Left mini-stack highlights the correct layer per step
- Right illustrations render correctly (graph, tiles, code, buffers, compiler, GPU)
- No console errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MatmulJourney.tsx
git commit -m "feat: add MatmulJourney step-by-step interactive component"
```

---

## Task 4: EcosystemPathSelector Component

**Files:**
- Create: `src/components/interactive/EcosystemPathSelector.tsx`
- Depends on: `src/components/interactive/shared/stackData.ts` (Task 1) — uses `STACK_LAYERS`, `ECO_PATHS`

**What it does:** Reuses the same 7-layer stack layout as StackLayerDiagram, but instead of brand buttons it has 5 scenario buttons. Selecting a scenario highlights the technology nodes on that path through the stack, dimming everything else. For llama.cpp paths (`ggmlSpan: true`), the ggml node visually spans the Operator Library and Language layers.

**Layout:**
- Top: Row of 5 scenario buttons (from `ECO_PATHS`)
- Middle: SVG stack diagram (all layers expanded showing nodes, unlike StackLayerDiagram which starts collapsed). Simpler than StackLayerDiagram — always expanded, no click-to-toggle.
- Bottom: One-line description of the selected path

- [ ] **Step 1: Create `EcosystemPathSelector.tsx`**

```tsx
// src/components/interactive/EcosystemPathSelector.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { STACK_LAYERS, ECO_PATHS, type EcoPath } from './shared/stackData';
import { COLORS } from './shared/colors';

// Layout
const SVG_W = 600;
const LAYER_H = 52;
const LAYER_GAP = 4;
const PAD_X = 10;
const NODE_PILL_H = 22;
const NODE_PILL_GAP = 5;
const NODES_PER_ROW = 4;
const NODE_PILL_W = (SVG_W - PAD_X * 2 - NODE_PILL_GAP * (NODES_PER_ROW - 1)) / NODES_PER_ROW;
const LABEL_H = 18; // layer name area at top of each layer
const NODE_START_Y = LABEL_H + 4;

function nodeRows(count: number): number {
  return Math.ceil(count / NODES_PER_ROW);
}

function layerHeight(nodeCount: number): number {
  const rows = nodeRows(nodeCount);
  return LABEL_H + 4 + rows * (NODE_PILL_H + NODE_PILL_GAP) + 4;
}

export default function EcosystemPathSelector() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const activePath = ECO_PATHS.find(p => p.id === selectedPath) ?? null;

  // Compute layer positions
  const layerPositions: { layerId: string; y: number; h: number }[] = [];
  let curY = 4;
  for (const layer of STACK_LAYERS) {
    const h = layerHeight(layer.nodes.length);
    layerPositions.push({ layerId: layer.id, y: curY, h });
    curY += h + LAYER_GAP;
  }
  const totalH = curY + 4;

  function isNodeActive(layerId: string, nodeId: string): boolean {
    if (!activePath) return true; // no selection → all active
    const layerNodes = activePath.highlightNodes[layerId];
    return layerNodes ? layerNodes.includes(nodeId) : false;
  }

  function isLayerActive(layerId: string): boolean {
    if (!activePath) return true;
    const layerNodes = activePath.highlightNodes[layerId];
    return layerNodes ? layerNodes.length > 0 : false;
  }

  return (
    <div className="space-y-3">
      {/* Scenario buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {ECO_PATHS.map(path => (
          <button key={path.id}
            onClick={() => setSelectedPath(prev => prev === path.id ? null : path.id)}
            className="px-3 py-1.5 text-xs rounded-lg border transition-all"
            style={{
              borderColor: selectedPath === path.id ? COLORS.primary : '#d1d5db',
              backgroundColor: selectedPath === path.id ? '#dbeafe' : 'white',
              color: selectedPath === path.id ? COLORS.primary : '#4b5563',
              fontWeight: selectedPath === path.id ? 600 : 400,
            }}>
            {path.label}
          </button>
        ))}
      </div>

      {/* Stack diagram */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${SVG_W} ${totalH}`} className="w-full">
          {STACK_LAYERS.map((layer, li) => {
            const { y, h } = layerPositions[li];
            const layerActive = isLayerActive(layer.id);
            return (
              <g key={layer.id} opacity={layerActive ? 1 : 0.15}>
                {/* Layer background */}
                <rect x={0} y={y} width={SVG_W} height={h} rx={6}
                  fill={`${layer.color}12`} />
                {/* Left accent */}
                <rect x={0} y={y} width={4} height={h} rx={2}
                  fill={layer.color} />
                {/* Layer name */}
                <text x={PAD_X + 6} y={y + LABEL_H / 2 + 1}
                  dominantBaseline="middle" fontSize="11" fontWeight="600"
                  fill={layer.color} fontFamily="system-ui">
                  {layer.name}
                </text>

                {/* Node pills */}
                {layer.nodes.map((node, ni) => {
                  const row = Math.floor(ni / NODES_PER_ROW);
                  const col = ni % NODES_PER_ROW;
                  const nx = PAD_X + col * (NODE_PILL_W + NODE_PILL_GAP);
                  const ny = y + NODE_START_Y + row * (NODE_PILL_H + NODE_PILL_GAP);
                  const nodeActive = isNodeActive(layer.id, node.id);

                  // Special: ggml span for llama.cpp paths
                  const isGgmlSpan = activePath?.ggmlSpan && node.id === 'ggml';

                  return (
                    <motion.g key={node.id}
                      animate={{ opacity: nodeActive ? 1 : 0.15 }}
                      transition={{ duration: 0.25 }}
                    >
                      <rect x={nx} y={ny}
                        width={NODE_PILL_W}
                        height={isGgmlSpan ? NODE_PILL_H + LAYER_GAP + LAYER_H : NODE_PILL_H}
                        rx={4}
                        fill={nodeActive ? 'white' : '#f9fafb'}
                        stroke={nodeActive ? layer.color : '#e5e7eb'}
                        strokeWidth={nodeActive ? 1.5 : 0.5} />
                      <text x={nx + NODE_PILL_W / 2} y={ny + NODE_PILL_H / 2 + 1}
                        dominantBaseline="middle" textAnchor="middle"
                        fontSize="8.5" fill="#1a1a2e" fontFamily="system-ui">
                        {node.label}
                      </text>
                      {isGgmlSpan && (
                        <text x={nx + NODE_PILL_W / 2} y={ny + NODE_PILL_H + 8}
                          dominantBaseline="middle" textAnchor="middle"
                          fontSize="7" fill={COLORS.orange} fontFamily="system-ui">
                          (= operator lib + kernel)
                        </text>
                      )}
                    </motion.g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path description */}
      {activePath ? (
        <motion.p
          key={activePath.id}
          className="text-sm text-center font-medium"
          style={{ color: COLORS.primary }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activePath.description}
        </motion.p>
      ) : (
        <p className="text-xs text-gray-400 text-center">
          选择一个场景，查看技术栈路径
        </p>
      )}
    </div>
  );
}
```

**Note on ggmlSpan:** The `ggmlSpan` logic attempts to visually extend the ggml pill across the Operator Library and Language layers. The exact pixel overlap depends on layer heights. During smoke test, if the span doesn't look right, adjust the span height calculation `NODE_PILL_H + LAYER_GAP + LAYER_H` to match the actual distance between the two layers. The implementer should eyeball and tune this value.

- [ ] **Step 2: Smoke test**

Run: `npm run dev`, navigate to article page. Verify:
- 5 scenario buttons render
- Clicking a scenario highlights matching nodes and dims others
- llama.cpp paths show ggml spanning two layers
- Description text updates per scenario
- No console errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/EcosystemPathSelector.tsx
git commit -m "feat: add EcosystemPathSelector interactive component"
```

---

## Task 5: Learning Path YAML

**Files:**
- Create: `src/content/paths/ai-compute-stack.yaml`

- [ ] **Step 1: Create `ai-compute-stack.yaml`**

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
```

- [ ] **Step 2: Verify path loads**

Run: `npm run dev`, then navigate to `/zh/paths/ai-compute-stack`. Verify:
- Page renders with title "AI Compute Stack"
- Shows 1 article entry (after Task 6 creates the article)
- No build errors

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/ai-compute-stack.yaml
git commit -m "feat: add AI Compute Stack learning path"
```

---

## Task 6: Article MDX

**Files:**
- Create: `src/content/articles/zh/ai-compute-stack.mdx`
- Depends on: Tasks 1–5 (all components and learning path)

**Content structure (8 sections from spec):**
- Section 0: 全景概览 (StackLayerDiagram + MatmulJourney)
- Section 1: Hardware ISA
- Section 2: Driver
- Section 3: Runtime (重点)
- Section 4: Language + Compiler + IR (重点)
- Section 5: Operator Library
- Section 6: Inference Framework + Graph Optimizer
- Section 7: 跨层品牌解剖 (EcosystemPathSelector)

**Writing principles from spec:**
- 讲关系不讲实现 — each layer: "为什么需要这层" → 职责 → 技术对比 → 上下层接口 → 常见误解
- 正确类比：Runtime=JRE/libc (NOT OS), Kernel=dispatched compute program (NOT function), IR=Java bytecode, Driver=hardware manager WITH compiler (NOT just "driver"), Operator Library=MKL/BLAS (NOT "standard library")
- 中英混合：术语保持英文，解释用中文

**Important:** The article is long (~2500 words). Write it in one file but the implementer should write it incrementally (first frontmatter + imports + sections 0-3, then edit to append sections 4-7) to prevent timeouts.

- [ ] **Step 1: Create article MDX — Part 1 (frontmatter + imports + sections 0–3)**

````mdx
---
title: "AI Compute Stack 全景 — 从推理框架到硬件指令集"
slug: ai-compute-stack
locale: zh
tags: [gpu, compute, software-stack, runtime, inference]
difficulty: intermediate
created: "2026-04-03"
updated: "2026-04-03"
references:
  - type: website
    title: "NVIDIA CUDA C++ Programming Guide"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/"
  - type: website
    title: "Khronos OpenCL Specification"
    url: "https://www.khronos.org/opencl/"
  - type: website
    title: "Khronos SYCL Specification"
    url: "https://www.khronos.org/sycl/"
  - type: website
    title: "Intel oneAPI Level Zero Specification"
    url: "https://spec.oneapi.io/level-zero/latest/index.html"
  - type: website
    title: "AMD ROCm HIP Programming Guide"
    url: "https://rocm.docs.amd.com/projects/HIP/en/latest/"
  - type: website
    title: "Apple Metal Shading Language Specification"
    url: "https://developer.apple.com/metal/Metal-Shading-Language-Specification.pdf"
  - type: repo
    title: "ggml / llama.cpp"
    url: "https://github.com/ggerganov/llama.cpp"
  - type: website
    title: "ONNX Runtime Documentation"
    url: "https://onnxruntime.ai/docs/"
---

import StackLayerDiagram from '../../../components/interactive/StackLayerDiagram.tsx';
import MatmulJourney from '../../../components/interactive/MatmulJourney.tsx';
import EcosystemPathSelector from '../../../components/interactive/EcosystemPathSelector.tsx';

## 为什么这些概念特别绕？

当你听到 CUDA、OpenCL、SYCL、ROCm、oneAPI 这些名字时，最容易犯的错误是把它们当成"一个东西"。实际上，它们每一个都是**"一套东西"的品牌名**，横跨编程语言、编译器、运行时、算子库等多个层次。

比如 OpenCL，它既有编程语言（OpenCL C）又有运行时（OpenCL Runtime）；SYCL 是一门语言，但它没有自己的运行时，而是借用别人的后端（OpenCL Runtime / Level Zero / CUDA Runtime）。这种"一个名字覆盖多层"的设计，正是混淆的根源。

本文的目标：用一张 7 层全景图，把每一层**是什么、为什么存在、跟谁对话**讲清楚。读完之后，你再遇到任何 GPU 计算技术名词，都能精确地把它放到正确的层次上。

## Section 0: 全景概览

先建立全局视野。下面这张交互式栈图展示了 AI/GPU 软件栈的 7 个层次，从最上层的推理框架到最底层的硬件指令集。**点击任意层**可以展开查看该层包含的具体技术；**底部品牌按钮**可以高亮某个品牌横跨的所有层。

<StackLayerDiagram client:visible />

### 一次 MatMul 的旅程

理解各层关系最好的方式，是追踪一次具体操作的完整调用链。下面我们跟踪 `model.forward()` 中一次矩阵乘法，看它如何从框架层一路下沉到硬件执行：

<MatmulJourney client:visible />

接下来，我们自底向上逐层展开。

---

## Section 1: Hardware ISA — GPU 能执行的唯一东西

**为什么需要这层：** 这是 GPU 能直接执行的最底层 — 二进制机器指令。

ISA（Instruction Set Architecture）是 GPU 硬件能理解的指令集，类比 CPU 的 x86 或 ARM 指令集。每个 GPU 厂商的 ISA 互不兼容：

| ISA | 厂商 | 特点 |
|-----|------|------|
| SASS | NVIDIA | 每代 GPU 架构不同（Ampere、Hopper...），不公开完整文档 |
| RDNA ISA | AMD | RDNA 3、RDNA 4 各有不同 |
| Xe ISA | Intel | Arc / Data Center GPU |
| Apple GPU ISA | Apple | M1/M2/M3 系列，完全不公开 |

**为什么你不直接写 ISA？** 太底层、厂商不公开完整文档、换硬件就得重写全部代码。

**PTX vs SASS（NVIDIA 特有）：** PTX（Parallel Thread Execution）是 NVIDIA 设计的**虚拟 ISA** — 一种稳定的中间层，跨 GPU 代际不变。SASS 是真实硬件 ISA，每代不同。Driver 负责最终的 PTX → SASS 翻译。这让你的 CUDA 程序在新 GPU 上也能跑（前向兼容）。

> 需要一层帮我们屏蔽硬件差异 → **Driver**

---

## Section 2: Driver — 不只是"驱动程序"

**为什么需要这层：** 屏蔽硬件差异，给上层提供稳定接口。

GPU Driver 的角色类似操作系统中的设备驱动，但它做的事比你以为的多得多：

### 内含编译器后端

**这是很多人不知道的** — Driver 不只是"让硬件工作"的驱动，它有完整的**编译器后端**，负责把中间表示（IR）翻译成硬件 ISA：

| 厂商 | IR → ISA | 编译模式 |
|------|----------|---------|
| NVIDIA | PTX → SASS | **AOT**（构建时用 `ptxas` 预编译）或 **JIT**（运行时由 Driver 编译，支持前向兼容新 GPU） |
| Intel | SPIR-V → Xe ISA | JIT（Driver 内含 SPIR-V → Xe 编译器） |
| AMD | LLVM IR / AMD IL → RDNA ISA | 主要 AOT（编译时生成目标 ISA），也支持 JIT |

### 硬件资源管理

- GPU 显存分配/回收
- 计算单元调度
- 多进程 GPU 隔离

> Driver 接口太底层（ioctl 级别），需要更友好的编程抽象 → **Runtime**

---

## Section 3: Runtime — GPU 的 "C Runtime"

**为什么需要这层：** 给程序员一个"操作 GPU"的编程接口，封装 Driver 的底层细节。

### 正确理解 Runtime

GPU Runtime 的角色类似 **C Runtime (libc)** 或 **JRE**：
- C Runtime 给你 `malloc/free` + `pthread_create`
- GPU Runtime 给你 `bufferAlloc/free` + `kernelDispatch`

它**不是操作系统**（那是 Driver 的角色），而是**编程语言级的运行时库**。

### Runtime 的四大职责

**1. Device Discovery** — 查询系统有哪些 GPU、它们的能力

**2. Buffer 管理** — 在 GPU 显存上分配/释放内存块（类比 CPU 的 `malloc/free`）

**3. Command Queue / Command List：**
- **Queue**（CUDA / OpenCL 风格）：按顺序执行的操作序列 — "先拷数据 → 跑 kernel → 拷回来"
- **Command List**（Level Zero / Vulkan 风格）：预先录制一组命令，然后一次性提交。更显式、更高效，但编程更复杂

**4. Kernel Dispatch** — 把编译好的 kernel 程序加载到 GPU，配置线程网格（grid/block），提交执行

### Kernel Dispatch 具体流程（OpenCL 为例）

```
1. Platform/Device discovery — clGetPlatformIDs() → clGetDeviceIDs()
2. Context + Queue — clCreateContext() → clCreateCommandQueue()
3. Buffer — clCreateBuffer(size_A)              // 类比 malloc
4. 数据传输 — clEnqueueWriteBuffer(queue, bufA, hostA)
5. Kernel 加载 — clCreateProgramWithIL(spirv) → clCreateKernel("matmul")
6. 参数绑定 + Dispatch — clSetKernelArg() → clEnqueueNDRangeKernel()
7. 同步 + 读回 — clFinish() → clEnqueueReadBuffer()
```

这个流程将 Buffer、Queue、Kernel、Dispatch 的关系串联起来。CUDA Runtime API 做了更多隐式封装（自动管理 context），但底层逻辑相同。

### 主要 Runtime 对比

| Runtime | 厂商 | 特点 |
|---------|------|------|
| CUDA Runtime API | NVIDIA | 最高层抽象，隐式上下文管理，NVIDIA GPU 开发首选 |
| CUDA Driver API | NVIDIA | 更底层，显式控制上下文/模块 |
| OpenCL Runtime | Khronos | 跨平台，显式 buffer/queue 管理 |
| Level Zero | Intel | 低开销、显式控制，oneAPI 底层 runtime。规范厂商中立，但实际仅 Intel 实现 |
| Vulkan (Compute) | Khronos | 极致显式控制，command buffer 录制。不只是图形 API — llama.cpp 就用它做跨平台 GPU 推理 |
| Metal | Apple | Apple 专属，command buffer 模式 |
| HIP Runtime | AMD | ROCm 的 runtime，API 几乎对齐 CUDA Runtime |

### 常见误解

- **CUDA Runtime API vs CUDA Driver API**：同一厂商的两层抽象。Runtime 更简单（隐式 context），Driver API 更底层。大多数人只用 Runtime API
- **Vulkan 不只是图形 API**：Vulkan Compute 可以跑通用计算 kernel
- **Level Zero vs OpenCL Runtime**：都能驱动 Intel GPU，Level Zero 更新更底层（类似 Vulkan 设计哲学）
````

- [ ] **Step 2: Edit article to append sections 4–7**

Append the following content after the Section 3 ending:

````mdx

---

## Section 4: Language → Compiler → IR → Kernel

**为什么需要这层：** 你需要用某种语言写出 GPU 能跑的程序（kernel），编译器把它翻译成 Runtime 可以 dispatch 的格式。

### 四个概念

- **Language** — 写 GPU 代码的编程语言/扩展
- **Kernel** — 编译后可被 Runtime dispatch 到 GPU 并行执行的计算程序。它自己不知道怎么跑 — 需要 Runtime 来 allocate buffer、dispatch 它
- **Compiler** — Language → IR 的翻译器（nvcc, DPC++, hipcc, clang...）
- **IR (Intermediate Representation)** — 编译后的中间字节码，类比 **Java bytecode** — 平台无关，由 Driver 的编译器做最终翻译成硬件 ISA

### Single-Source vs Dual-Source

影响开发体验的关键架构差异：

- **Single-source（CUDA C++, SYCL, HIP）：** host 代码和 kernel 写在同一个文件，编译器分别提取。开发体验好，可共享类型定义
- **Dual-source（OpenCL C, GLSL, HLSL）：** kernel 单独写在文件/字符串中，host 代码通过 Runtime API 加载。灵活但体验割裂

### HIP 的跨平台机制

HIP 是理解"语言层如何实现跨平台"的好例子：
- HIP 语法和 CUDA C++ 几乎一致（`hipMalloc` ↔ `cudaMalloc`）
- 编译器 `hipcc` 检测目标平台：AMD GPU → HIP-Clang (LLVM) 生成 AMDGCN；NVIDIA GPU → nvcc 生成 PTX
- 这是**源码级可移植性**：同一份代码，编译时选择不同后端

### GPU 编程语言全景

| Language | 生态 | 编译目标 (IR) | 特点 |
|----------|------|-------------|------|
| CUDA C++ | NVIDIA | PTX | NVIDIA 专属，最成熟生态 |
| HIP | AMD (ROCm) | AMD GPU IR / PTX | AMD 对标 CUDA 的语言，语法几乎一致 |
| OpenCL C | Khronos | SPIR-V | 跨平台，C99 风格，较老 |
| SYCL | Khronos | SPIR-V (via DPC++) | 现代 C++ single-source，Intel 主推 |
| Triton | OpenAI | Triton IR → MLIR → LLVM IR → PTX/AMDGCN | Python 风格写 kernel，自动 tiling |
| GLSL | Khronos | SPIR-V | 图形着色器语言，也可用于 compute shader |
| HLSL | Microsoft | DXIL / SPIR-V | DirectX 着色器语言 |
| WGSL | W3C | SPIR-V / HLSL / MSL (via Tint/Naga) | WebGPU 着色器语言 |
| Metal SL | Apple | Metal IR (AIR) | Apple 专属 |
| Slang | Khronos 开源 | SPIR-V / HLSL / MSL / CUDA / GLSL | 新一代跨平台着色器语言，多后端输出 |

### Shader vs Kernel

- **Shader**：图形渲染管线中的可编程阶段（vertex shader, fragment shader, compute shader）
- **Kernel**：通用计算程序（CUDA kernel, OpenCL kernel）
- **Compute Shader** 是两者交叉点 — 用图形 API (Vulkan/Metal/DX12) 跑通用计算
- 本质相同：一段跑在 GPU 上的并行程序

### IR 对比

| IR | 对应语言 | 消费者 | 特点 |
|----|---------|--------|------|
| PTX | CUDA C++ | NVIDIA Driver | NVIDIA 专有虚拟 ISA，文本格式可读 |
| SPIR-V | OpenCL C, SYCL, GLSL, HLSL, WGSL, Slang | OpenCL RT, Vulkan, Level Zero | Khronos 标准，二进制格式，跨平台通用 |
| DXIL | HLSL | DirectX 12 Driver | Microsoft 专有 |
| Metal IR (AIR) | Metal SL | Metal Driver | Apple 专有 |
| LLVM IR | Triton, HIP | 各厂商 LLVM 后端 | 通用编译器 IR，被多个工具链复用 |

---

## Section 5: Operator Library — 你不用手写 Kernel

**为什么需要这层：** 手写 kernel 太难。算子库提供**预优化的 kernel 集合 + 调用 Runtime 的胶水代码**。

对上层暴露 `matmul(A, B, C)` 接口，内部选择最优 kernel、配置 tiling 策略、通过 Runtime API allocate buffer 并 dispatch。矩阵拆分（tiling）就发生在这里 — 大矩阵被切成适合 GPU shared memory 的 tile。

正确类比：算子库 ≈ **Intel MKL / BLAS** — 性能优化的算法库，不是"标准库"（范围太广了）。

| 算子库 | 厂商 | Runtime 依赖 | 覆盖算子 |
|--------|------|-------------|---------|
| cuDNN | NVIDIA | CUDA Runtime | 卷积、归一化、Attention |
| cuBLAS | NVIDIA | CUDA Runtime | 矩阵乘法、BLAS 运算 |
| oneDNN | Intel | OpenCL RT / Level Zero / CPU JIT | 卷积、MatMul、归一化 |
| MPS | Apple | Metal | 矩阵乘法、卷积、图像处理 |
| XNNPACK | Google | CPU 直接调用 | 移动端 CPU 优化算子 |
| rocBLAS / MIOpen | AMD | HIP Runtime | BLAS / 深度学习算子 |

### oneDNN 内部怎么工作

oneDNN 是理解"算子库如何使用 kernel + runtime"的最好例子：

- **Intel GPU 路径**：kernel 用 OpenCL C 或 nGen JIT 编写 → 编译为 SPIR-V → 通过 OpenCL Runtime 或 Level Zero 提交到 GPU
- **CPU 路径**：使用 JIT 汇编生成器（Xbyak for x86, Xbyak_aarch64 for ARM），运行时动态生成针对当前 CPU 微架构优化的机器码
- **选择逻辑**：oneDNN 内部根据输入 tensor 的形状、数据类型、硬件，自动选择最优 kernel

这展示了算子库的本质：**kernel 集合 + runtime 胶水 + 自动选择策略**。

### Triton 的特殊位置

Triton 介于手写 kernel 和算子库之间 — 你用 Python 风格写 kernel 逻辑，Triton 编译器自动做 tiling 和优化。PyTorch 2.0+ 的 `torch.compile` 后端大量使用 Triton 生成 kernel。

---

## Section 6: Inference Framework + Graph Optimizer

**为什么需要这层：** 你不想手动调算子库的 API。推理框架加载模型文件，做图优化，把每个算子 dispatch 到对应的算子库/后端。

### ONNX 格式 vs ONNX Runtime（常见混淆）

- **ONNX** — 开放的模型交换**格式**（.onnx 文件），类比 HTML
- **ONNX Runtime** — Microsoft 的推理**引擎**，类比 Chrome
- 其他引擎（TensorRT、OpenVINO）也能消费 .onnx 文件

### 框架做什么

1. **模型加载** — 解析 .onnx / .tflite / .gguf 等模型文件
2. **图优化** — 算子融合（MatMul+BiasAdd+ReLU → 一个 fused kernel）、常量折叠、layout 转换
3. **调度** — 把图中每个算子 dispatch 到对应的后端

| 框架 | 输入格式 | 后端机制 | 典型调用链 |
|------|---------|---------|-----------|
| ONNX Runtime | .onnx | Execution Provider 插件 | → CUDA EP → cuDNN → CUDA RT |
| TensorRT | .onnx / .plan | NVIDIA 专有引擎 | → 自有 kernel → CUDA RT |
| OpenVINO | 多种→内部 IR | 内置插件 | → oneDNN → OpenCL/L0 |
| LiteRT (TFLite) | .tflite | Delegate 插件 | → GPU delegate → OpenCL/Vulkan |
| CoreML | .mlmodel | Apple 专有 | → MPS / ANE |
| llama.cpp | .gguf | ggml backends | → ggml → CUDA/Metal/Vulkan |

### 图优化器 = 图级编译器

TensorRT、XLA、Apache TVM 不是简单的推理框架 — 它们是**图级编译器**：输入计算图，输出优化后的 kernel 调用序列。做的事：算子融合、内存规划、精度优化（FP16/INT8）、kernel 自动选择。

### llama.cpp / ggml 的垂直整合

传统分层：`ONNX Runtime → oneDNN → OpenCL Runtime → Driver`（每层独立，标准接口）

llama.cpp / ggml 的做法：
- ggml 同时承担 Operator Library + Kernel 的角色
- **不依赖** cuDNN/oneDNN — 针对 LLM 推理场景手写每个后端的 kernel
- 自定义量化格式（GGUF）、融合算子
- 好处：极致控制、无依赖、易部署
- 代价：每加一个硬件后端都要从头写 kernel

---

## Section 7: 跨层品牌解剖

**核心困惑终极解答**：这些名字不是"一个东西"，而是"一套东西"的品牌名。

下面用交互式工具，选择不同场景看技术栈路径：

<EcosystemPathSelector client:visible />

### 五大品牌 × 六层对比

| 层 | CUDA (NVIDIA) | ROCm (AMD) | oneAPI (Intel) | OpenCL (Khronos) | Metal (Apple) |
|----|--------------|------------|---------------|-----------------|--------------|
| Language | CUDA C++ | HIP | SYCL (DPC++) | OpenCL C | Metal SL |
| Compiler | nvcc / NVRTC | hipcc (Clang) | DPC++ / ICX | 各厂商实现 | Metal Compiler |
| IR | PTX | LLVM IR→AMDGCN | SPIR-V | SPIR-V | AIR |
| Runtime | CUDA RT | HIP RT (ROCr) | Level Zero | OpenCL RT | Metal |
| Operator Lib | cuDNN/cuBLAS | MIOpen/rocBLAS | oneDNN/oneMKL | — | MPS |
| Framework | TensorRT | — | OpenVINO | — | CoreML |

**注意"—"**表示该品牌在该层没有自己的组件。

**SYCL 特殊之处：** 它没有自己的 runtime，而是通过 backend plugin 使用 OpenCL RT、Level Zero 或 CUDA RT。这是唯一一个"语言层和 runtime 层完全解耦"的方案。

---

## 总结

AI/GPU 软件栈可以清晰地分为 7 层，每层解决一个明确的问题：

1. **Hardware ISA** — GPU 能执行的机器指令（厂商私有）
2. **Driver** — 硬件管理 + IR→ISA 编译器后端
3. **Runtime** — 编程接口：buffer、queue、kernel dispatch（类比 libc/JRE）
4. **Language + IR** — 写 kernel 的语言 + 编译后的平台无关字节码（类比 Java bytecode）
5. **Operator Library** — 预优化 kernel 集合 + runtime 胶水（类比 MKL/BLAS）
6. **Graph Optimizer** — 图级编译器，算子融合和内存优化
7. **Inference Framework** — 加载模型、调度算子

CUDA/OpenCL/SYCL/ROCm/oneAPI 之所以让人困惑，是因为它们每一个都横跨了多层。记住这个 7 层模型，遇到新技术名词时，先问"它在哪一层？"就能迅速定位。
````

- [ ] **Step 3: Verify article renders**

Run: `npm run dev`, navigate to `/zh/articles/ai-compute-stack`. Verify:
- Frontmatter parses without error
- All 3 components render with `client:visible`
- All tables render correctly
- No broken imports or build errors

- [ ] **Step 4: Commit**

```bash
git add src/content/articles/zh/ai-compute-stack.mdx
git commit -m "feat: add AI Compute Stack overview article"
```

---

## Task 7: Build Validation

**Files:** None created — this task validates the entire implementation.

- [ ] **Step 1: Run content validation**

```bash
npm run validate
```

Expected: All articles pass validation (frontmatter schema, required fields, reference URLs).

If validation fails:
- Missing required field → fix in `ai-compute-stack.mdx` frontmatter
- Invalid reference URL → verify the URL is correct and accessible

- [ ] **Step 2: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors. The build will:
- Compile all MDX files (including the new article)
- Type-check all TypeScript components
- Generate static pages for all routes

Common failures:
- Import path wrong → fix the `../../../components/interactive/` relative path in the MDX
- TypeScript error in a component → fix in the relevant `.tsx` file
- Missing `client:visible` → add it to the component usage in MDX

- [ ] **Step 3: Dev server smoke test**

```bash
npm run dev
```

Open browser and verify:
1. `/zh/paths/ai-compute-stack` — learning path page renders, shows 1 article
2. `/zh/articles/ai-compute-stack` — article renders with all content
3. **StackLayerDiagram** — click layers to expand, brand buttons work
4. **MatmulJourney** — 7 steps navigable, illustrations render
5. **EcosystemPathSelector** — 5 scenarios work, highlighting correct nodes
6. No console errors in browser DevTools

- [ ] **Step 4: Commit any fixes**

If any fixes were needed:
```bash
git add -A
git commit -m "fix: resolve build/render issues in AI Compute Stack article"
```

---

## Self-Review Checklist

### Spec Coverage

| Spec Requirement | Task | Status |
|-----------------|------|--------|
| 7-layer stack diagram with expand/collapse + brand highlight | Task 2 (StackLayerDiagram) | ✅ |
| MatmulJourney 7-step animation with left mini-stack + right illustration | Task 3 (MatmulJourney) | ✅ |
| EcosystemPathSelector with 5 paths + ggml span | Task 4 (EcosystemPathSelector) | ✅ |
| New learning path `ai-compute-stack` | Task 5 | ✅ |
| Article Section 0: overview + two components | Task 6 (Section 0) | ✅ |
| Article Section 1: Hardware ISA | Task 6 (Section 1) | ✅ |
| Article Section 2: Driver with compiler backend | Task 6 (Section 2) | ✅ |
| Article Section 3: Runtime (重点) with dispatch flow | Task 6 (Section 3) | ✅ |
| Article Section 4: Language + Compiler + IR (重点) | Task 6 (Section 4) | ✅ |
| Article Section 5: Operator Library + oneDNN example | Task 6 (Section 5) | ✅ |
| Article Section 6: Framework + Graph Optimizer + ggml vertical integration | Task 6 (Section 6) | ✅ |
| Article Section 7: Cross-layer brand dissection with comparison table | Task 6 (Section 7) | ✅ |
| Shared data module for components | Task 1 (stackData.ts) | ✅ |
| Correct analogies (Runtime=JRE, IR=bytecode, Driver=with compiler, OpLib=MKL) | Task 6 article text | ✅ |
| ONNX format vs ONNX Runtime distinction | Task 6 Section 6 | ✅ |
| SYCL decoupled runtime explained | Task 6 Section 7 | ✅ |
| HIP cross-platform mechanism | Task 6 Section 4 | ✅ |
| Single-source vs Dual-source | Task 6 Section 4 | ✅ |
| llama.cpp/ggml vertical integration | Task 6 Section 6 | ✅ |
| Shader vs Kernel clarification | Task 6 Section 4 | ✅ |

### Type Consistency Check

- `TechNode`, `StackLayer`, `EcoPath`, `Brand` — defined in Task 1, imported by Tasks 2, 3, 4 ✅
- `STACK_LAYERS`, `BRANDS`, `ECO_PATHS` — exported from Task 1, used consistently ✅
- `COLORS` — imported from `./shared/colors` (existing file) in Tasks 2, 3, 4 ✅
- StepNavigator API `{ title: string, content: ReactNode }[]` — matched in Task 3 ✅

### Known Simplifications

- **Inter-layer arrows:** Spec mentions "展开两层时显示层间调用关系箭头" for StackLayerDiagram. This is omitted to keep SVG layout manageable. Can be added as a polish pass if needed — requires tracking which pairs of layers are expanded and drawing connection arrows between their nodes.
- **ggmlSpan pixel height:** Uses `NODE_PILL_H + LAYER_GAP + LAYER_H` approximation. Implementer should visually tune during smoke test.

### No Placeholders

Scanned for TBD/TODO/placeholder — none found ✅
