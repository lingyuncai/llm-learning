# GEMM Optimization Article — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create Article 4 "GEMM 优化 — 从 Naive 到极致" with 12 interactive components, covering GEMM's role in Transformers, naive implementation, tiling, thread tiling, vectorized loads, double buffering, Tensor Core GEMM, performance ladder, and Intel iGPU GEMM.

**Architecture:** Each component is a standalone React TSX file in `src/components/interactive/`. Static diagrams are pure SVG (no client:visible). Animated components use StepNavigator from `../primitives/StepNavigator`. Interactive components use React useState (client:visible). All share colors/fonts from `./shared/colors.ts`.

**Tech Stack:** React, TypeScript, SVG, StepNavigator primitive, shared COLORS/FONTS

**Prerequisites:** Articles 1-3 complete (gpu-architecture, matrix-acceleration, cuda-programming-model)

---

## File Structure

### Components to create (12 files):
- `src/components/interactive/GemmInTransformer.tsx` — Static SVG: Transformer block with GEMM ops highlighted
- `src/components/interactive/ArithmeticIntensityCalc.tsx` — Interactive: M/N/K inputs → FLOPs, memory, AI, roofline position
- `src/components/interactive/NaiveGemmAnimation.tsx` — StepNavigator: naive GEMM element-by-element computation
- `src/components/interactive/TilingAnimation.tsx` — StepNavigator: tiling + shared memory optimization (core component)
- `src/components/interactive/ThreadTileAnimation.tsx` — StepNavigator: per-thread multi-element computation
- `src/components/interactive/ComputeToLoadRatio.tsx` — Interactive: TM/TN inputs → compute-to-load ratio
- `src/components/interactive/VectorLoadCompare.tsx` — Static SVG: scalar vs float4 load comparison
- `src/components/interactive/DoubleBufPipeline.tsx` — StepNavigator: double buffering pipeline overlap
- `src/components/interactive/WmmaTilingDiagram.tsx` — Static SVG: Tensor Core GEMM tiling hierarchy
- `src/components/interactive/TensorCoreGemmFlow.tsx` — StepNavigator: WMMA warp-level flow
- `src/components/interactive/PerformanceLadder.tsx` — Interactive: optimization stages bar chart with hover
- `src/components/interactive/IntelGemmCompare.tsx` — Static SVG: CUDA vs Intel GEMM tiling comparison

### Article and config:
- `src/content/articles/zh/gemm-optimization.mdx` — MDX article with 9 sections
- `src/content/paths/ai-compute-stack.yaml` — Add gemm-optimization to learning path

---

### Task 1: GemmInTransformer (Static SVG)

**Files:**
- Create: `src/components/interactive/GemmInTransformer.tsx`

**Context:** This is a static SVG diagram showing a simplified Transformer block (single decoder layer) with all GEMM operations highlighted. No client:visible needed. Shows Q/K/V projection, attention matmul, output projection, and FFN (two linear layers) as colored GEMM boxes within the Transformer flow.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/GemmInTransformer.tsx
// Static SVG: Transformer block with GEMM operations highlighted
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

// A single box in the transformer flow
function FlowBox({ x, y, w, h, label, sublabel, isGemm, color }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; isGemm: boolean; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={isGemm ? '#dbeafe' : '#f8fafc'}
        stroke={isGemm ? color : '#cbd5e1'}
        strokeWidth={isGemm ? 2 : 1} />
      {isGemm && (
        <rect x={x} y={y} width={4} height={h} rx={2} fill={color} />
      )}
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 4 : h / 2 + 1)} textAnchor="middle"
        dominantBaseline="middle" fontSize="8" fontWeight={isGemm ? '700' : '500'}
        fill={isGemm ? color : COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          dominantBaseline="middle" fontSize="6.5"
          fill="#64748b" fontFamily={FONTS.mono}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#94a3b8" strokeWidth={1} markerEnd="url(#gemm-tf-arrow)" />
  );
}

export default function GemmInTransformer() {
  // Layout: vertical flow of a single Transformer decoder layer
  const colX = W / 2;
  const boxW = 180;
  const gemmW = 140;

  // GEMM operations with M/N/K dimensions (for a typical LLM layer)
  // Assuming hidden_dim=H, seq_len=S, intermediate=4H
  const gemms = [
    { label: 'QKV Projection', dim: 'S×H · H×3H', color: COLORS.primary },
    { label: 'Attention Score', dim: 'S×H · H×S', color: COLORS.green },
    { label: 'Attention Output', dim: 'S×S · S×H', color: COLORS.green },
    { label: 'Output Projection', dim: 'S×H · H×H', color: COLORS.primary },
    { label: 'FFN Up', dim: 'S×H · H×4H', color: COLORS.orange },
    { label: 'FFN Down', dim: 'S×4H · 4H×H', color: COLORS.orange },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="GEMM operations in a Transformer block">
      <defs>
        <marker id="gemm-tf-arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
        </marker>
      </defs>

      <text x={W / 2} y={18} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Transformer Block 中的 GEMM 操作
      </text>
      <text x={W / 2} y={34} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        蓝色标注 = 矩阵乘法 (占计算量 90%+)。S = seq_len, H = hidden_dim
      </text>

      {/* Input */}
      <FlowBox x={colX - boxW / 2} y={44} w={boxW} h={24}
        label="Input Embedding (S×H)" isGemm={false} color="" />
      <Arrow x1={colX} y1={68} x2={colX} y2={78} />

      {/* Multi-Head Attention block */}
      <rect x={60} y={78} width={460} height={138} rx={6}
        fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 2" />
      <text x={70} y={92} fontSize="8" fontWeight="600" fill="#64748b"
        fontFamily={FONTS.sans}>Multi-Head Attention</text>

      {/* QKV */}
      <FlowBox x={colX - gemmW / 2} y={98} w={gemmW} h={28}
        label={gemms[0].label} sublabel={gemms[0].dim} isGemm={true} color={gemms[0].color} />
      <Arrow x1={colX} y1={126} x2={colX} y2={136} />

      {/* Attention: score and output side by side */}
      <FlowBox x={colX - gemmW - 10} y={138} w={gemmW} h={28}
        label={gemms[1].label} sublabel={gemms[1].dim} isGemm={true} color={gemms[1].color} />
      <FlowBox x={colX + 10} y={138} w={gemmW} h={28}
        label={gemms[2].label} sublabel={gemms[2].dim} isGemm={true} color={gemms[2].color} />
      {/* Arrows from QKV to both attention ops */}
      <Arrow x1={colX - 20} y1={126} x2={colX - gemmW / 2 - 10} y2={138} />
      <Arrow x1={colX + 20} y1={126} x2={colX + 10 + gemmW / 2} y2={138} />

      {/* Output projection */}
      <FlowBox x={colX - gemmW / 2} y={178} w={gemmW} h={28}
        label={gemms[3].label} sublabel={gemms[3].dim} isGemm={true} color={gemms[3].color} />
      <Arrow x1={colX} y1={166} x2={colX} y2={178} />

      {/* Add & Norm */}
      <Arrow x1={colX} y1={206} x2={colX} y2={222} />
      <FlowBox x={colX - boxW / 2} y={222} w={boxW} h={22}
        label="Add & LayerNorm" isGemm={false} color="" />
      <Arrow x1={colX} y1={244} x2={colX} y2={254} />

      {/* FFN block */}
      <rect x={60} y={254} width={460} height={88} rx={6}
        fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 2" />
      <text x={70} y={268} fontSize="8" fontWeight="600" fill="#64748b"
        fontFamily={FONTS.sans}>Feed-Forward Network</text>

      <FlowBox x={colX - gemmW - 10} y={274} w={gemmW} h={28}
        label={gemms[4].label} sublabel={gemms[4].dim} isGemm={true} color={gemms[4].color} />
      <FlowBox x={colX + 10} y={274} w={gemmW} h={28}
        label={gemms[5].label} sublabel={gemms[5].dim} isGemm={true} color={gemms[5].color} />
      <Arrow x1={colX - gemmW / 2 - 10 + gemmW} y1={288} x2={colX + 10} y2={288} />

      {/* Add & Norm */}
      <Arrow x1={colX} y1={302} x2={colX} y2={348} />
      <FlowBox x={colX - boxW / 2} y={348} w={boxW} h={22}
        label="Add & LayerNorm" isGemm={false} color="" />

      {/* Summary */}
      <rect x={40} y={H - 38} width={500} height={30} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        每个 Transformer 层包含 6 个 GEMM — 它们决定了推理和训练的计算时间
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds, page count increases.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/GemmInTransformer.tsx
git commit -m "feat: add GemmInTransformer Transformer block GEMM diagram"
```

---

### Task 2: ArithmeticIntensityCalc (Interactive)

**Files:**
- Create: `src/components/interactive/ArithmeticIntensityCalc.tsx`

**Context:** Interactive component with useState. User inputs M, N, K dimensions. Shows: FLOPs (2MNK), memory bytes (4(MK+KN+MN) for float32), arithmetic intensity (FLOPs/bytes), and a simple roofline position indicator. Uses client:visible in MDX.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/ArithmeticIntensityCalc.tsx
// Interactive: M/N/K → FLOPs, memory, arithmetic intensity, roofline position
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 280;

export default function ArithmeticIntensityCalc() {
  const [M, setM] = useState(4096);
  const [N, setN] = useState(4096);
  const [K, setK] = useState(4096);

  const flops = 2 * M * N * K;
  const bytesA = M * K * 4; // float32
  const bytesB = K * N * 4;
  const bytesC = M * N * 4;
  const totalBytes = bytesA + bytesB + bytesC;
  const ai = flops / totalBytes; // arithmetic intensity

  // H100 specs for roofline (FP32 CUDA Core — consistent with float32 memory calc)
  const peakFlops = 67e12;  // FP32 CUDA Core TFLOPS
  const peakBW = 3.35e12;   // HBM bandwidth bytes/s
  const ridgePoint = peakFlops / peakBW; // ~20 FLOPs/byte

  const isComputeBound = ai > ridgePoint;

  // Format large numbers
  const fmt = (n: number) => {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}G`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${n}`;
  };

  // Roofline visualization (simplified horizontal bar)
  const logAI = Math.log2(Math.max(1, ai));
  const logRidge = Math.log2(ridgePoint);
  const logMax = logRidge + 4;
  const barX = 60;
  const barW = 460;
  const aiPos = barX + Math.min(barW, (logAI / logMax) * barW);
  const ridgePos = barX + (logRidge / logMax) * barW;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">M (rows of A, C)</span>
          <select value={M} onChange={e => setM(+e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-mono">
            {[512, 1024, 2048, 4096, 8192, 16384].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">N (cols of B, C)</span>
          <select value={N} onChange={e => setN(+e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-mono">
            {[512, 1024, 2048, 4096, 8192, 16384].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">K (inner dimension)</span>
          <select value={K} onChange={e => setK(+e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-mono">
            {[512, 1024, 2048, 4096, 8192, 16384].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
          {/* Formula */}
          <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            C({M}x{N}) = A({M}x{K}) * B({K}x{N})
          </text>

          {/* Metrics */}
          <text x={60} y={48} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
            FLOPs = 2MNK = {fmt(flops)}
          </text>
          <text x={60} y={66} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
            Memory = 4(MK + KN + MN) = {fmt(totalBytes)} bytes
          </text>
          <text x={60} y={84} fontSize="9" fontWeight="700"
            fill={isComputeBound ? COLORS.green : COLORS.red} fontFamily={FONTS.sans}>
            Arithmetic Intensity = FLOPs / Bytes = {ai.toFixed(1)} FLOPs/byte
          </text>

          {/* Roofline bar */}
          <text x={W / 2} y={115} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Roofline 位置 (H100 FP32 CUDA Core)
          </text>

          {/* Background bar */}
          <rect x={barX} y={130} width={barW} height={24} rx={4}
            fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={0.5} />

          {/* Memory-bound region */}
          <rect x={barX} y={130} width={ridgePos - barX} height={24} rx={4}
            fill="#fee2e2" opacity={0.5} />
          {/* Compute-bound region */}
          <rect x={ridgePos} y={130} width={barX + barW - ridgePos} height={24} rx={4}
            fill="#dcfce7" opacity={0.5} />

          {/* Ridge point marker */}
          <line x1={ridgePos} y1={126} x2={ridgePos} y2={158}
            stroke={COLORS.dark} strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={ridgePos} y={122} textAnchor="middle" fontSize="7"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            ridge: {ridgePoint.toFixed(0)}
          </text>

          {/* AI position marker */}
          <circle cx={aiPos} cy={142} r={6}
            fill={isComputeBound ? COLORS.green : COLORS.red} />
          <text x={aiPos} y={142} textAnchor="middle" dominantBaseline="middle"
            fontSize="5" fontWeight="700" fill="white" fontFamily={FONTS.mono}>AI</text>
          <text x={aiPos} y={170} textAnchor="middle" fontSize="7.5" fontWeight="600"
            fill={isComputeBound ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
            {ai.toFixed(1)}
          </text>

          {/* Labels */}
          <text x={barX + (ridgePos - barX) / 2} y={180} textAnchor="middle"
            fontSize="7" fill={COLORS.red} fontFamily={FONTS.sans}>Memory-bound</text>
          <text x={ridgePos + (barX + barW - ridgePos) / 2} y={180} textAnchor="middle"
            fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>Compute-bound</text>

          {/* Insight box */}
          <rect x={40} y={195} width={500} height={70} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={215} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={isComputeBound ? COLORS.green : COLORS.red} fontFamily={FONTS.sans}>
            {isComputeBound
              ? 'Compute-bound: 计算量充足，可以充分利用 Tensor Core'
              : 'Memory-bound: 带宽是瓶颈，需要更大的矩阵或 batch 来提高 AI'}
          </text>
          <text x={W / 2} y={235} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            典型 LLM: M=batch*seq, K=N=hidden_dim (4096+) → AI 通常 {'>'} 100 → Compute-bound
          </text>
          <text x={W / 2} y={252} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            GEMM 优化的目标: 让实际 FLOPS 接近 peak (FP32: {(peakFlops / 1e12).toFixed(0)}T, FP16 TC: 990T)
          </text>
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/ArithmeticIntensityCalc.tsx
git commit -m "feat: add ArithmeticIntensityCalc with roofline position"
```

---

### Task 3: NaiveGemmAnimation (StepNavigator)

**Files:**
- Create: `src/components/interactive/NaiveGemmAnimation.tsx`

**Context:** StepNavigator with 3 steps showing naive GEMM on a small 4x4 matrix. Step 1: show matrices A, B, C with one output element highlighted. Step 2: show the dot product computation for that element (reading a row of A and column of B). Step 3: show the global memory access count and why this is inefficient.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/NaiveGemmAnimation.tsx
// StepNavigator: naive GEMM computation visualization
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

const N = 4; // 4x4 matrices
const CELL = 32;
const GAP = 1;

function MatrixGrid({ x, y, label, rows, cols, highlightRow, highlightCol, values, activeCell }: {
  x: number; y: number; label: string; rows: number; cols: number;
  highlightRow?: number; highlightCol?: number;
  values?: number[][]; activeCell?: { r: number; c: number };
}) {
  return (
    <g>
      <text x={x + (cols * (CELL + GAP) - GAP) / 2} y={y - 8} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const cx = x + c * (CELL + GAP);
          const cy = y + r * (CELL + GAP);
          const isRowHL = highlightRow === r;
          const isColHL = highlightCol === c;
          const isActive = activeCell?.r === r && activeCell?.c === c;
          let fill = '#f8fafc';
          let stroke = '#cbd5e1';
          let textColor = COLORS.dark;
          if (isActive) { fill = '#fef3c7'; stroke = COLORS.orange; textColor = COLORS.orange; }
          else if (isRowHL && isColHL) { fill = '#dbeafe'; stroke = COLORS.primary; textColor = COLORS.primary; }
          else if (isRowHL) { fill = '#dbeafe'; stroke = COLORS.primary; }
          else if (isColHL) { fill = '#dcfce7'; stroke = COLORS.green; }
          return (
            <g key={`${r}-${c}`}>
              <rect x={cx} y={cy} width={CELL} height={CELL} rx={2}
                fill={fill} stroke={stroke} strokeWidth={isActive ? 2 : 0.5} />
              <text x={cx + CELL / 2} y={cy + CELL / 2} textAnchor="middle"
                dominantBaseline="middle" fontSize="7" fill={textColor} fontFamily={FONTS.mono}>
                {values ? values[r][c] : `${label[0]}${r}${c}`}
              </text>
            </g>
          );
        })
      )}
    </g>
  );
}

// Example 4x4 matrices
const A = [[2, 1, 3, 0], [1, 0, 2, 1], [0, 3, 1, 2], [2, 1, 0, 3]];
const B = [[1, 0, 2, 1], [3, 1, 0, 2], [0, 2, 1, 0], [1, 1, 3, 1]];

// C[1][2] = A[1][0]*B[0][2] + A[1][1]*B[1][2] + A[1][2]*B[2][2] + A[1][3]*B[3][2]
// = 1*2 + 0*0 + 2*1 + 1*3 = 2 + 0 + 2 + 3 = 7
const targetR = 1;
const targetC = 2;

const steps = [
  {
    title: 'Naive GEMM: 一个线程算一个输出元素',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          C = A x B (4x4) — 每个线程计算 C 的一个元素
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          高亮线程负责计算 C[{targetR}][{targetC}]
        </text>

        <MatrixGrid x={30} y={60} label="A (4x4)" rows={N} cols={N}
          highlightRow={targetR} values={A} />
        <text x={175} y={100} fontSize="16" fill={COLORS.dark}>x</text>
        <MatrixGrid x={200} y={60} label="B (4x4)" rows={N} cols={N}
          highlightCol={targetC} values={B} />
        <text x={345} y={100} fontSize="16" fill={COLORS.dark}>=</text>
        <MatrixGrid x={370} y={60} label="C (4x4)" rows={N} cols={N}
          activeCell={{ r: targetR, c: targetC }} />

        <rect x={40} y={220} width={500} height={100} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={240} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Naive kernel: 每个线程的工作
        </text>
        <text x={60} y={260} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
          C[row][col] = 0;
        </text>
        <text x={60} y={276} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
          for (k = 0; k {'<'} K; k++)
        </text>
        <text x={60} y={292} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
          {'  '}C[row][col] += A[row][k] * B[k][col];  // 2 global reads per iteration
        </text>
        <text x={60} y={308} fontSize="8" fill={COLORS.red} fontFamily={FONTS.sans}>
          每个输出元素需要 2K 次全局内存读取 → 总共 2MNK 次 → 严重 memory-bound
        </text>
      </StepSvg>
    ),
  },
  {
    title: '逐步计算 C[1][2]',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          C[{targetR}][{targetC}] = A 的第 {targetR} 行 * B 的第 {targetC} 列
        </text>

        <MatrixGrid x={30} y={50} label="A" rows={N} cols={N}
          highlightRow={targetR} values={A} />
        <MatrixGrid x={200} y={50} label="B" rows={N} cols={N}
          highlightCol={targetC} values={B} />

        {/* Dot product calculation */}
        <rect x={370} y={50} width={190} height={130} rx={5}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
        <text x={465} y={70} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>Dot Product</text>

        {Array.from({ length: N }).map((_, k) => {
          const y = 86 + k * 22;
          const product = A[targetR][k] * B[k][targetC];
          return (
            <g key={k}>
              <text x={380} y={y} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
                A[{targetR}][{k}]
              </text>
              <text x={420} y={y} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>
                x
              </text>
              <text x={432} y={y} fontSize="8" fill={COLORS.green} fontFamily={FONTS.mono}>
                B[{k}][{targetC}]
              </text>
              <text x={480} y={y} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>
                = {A[targetR][k]} x {B[k][targetC]} = {product}
              </text>
            </g>
          );
        })}

        {/* Sum */}
        <line x1={380} y1={168} x2={550} y2={168} stroke={COLORS.orange} strokeWidth={1} />
        {(() => {
          const sum = A[targetR].reduce((s, a, k) => s + a * B[k][targetC], 0);
          return (
            <text x={465} y={184} textAnchor="middle" fontSize="10" fontWeight="700"
              fill={COLORS.orange} fontFamily={FONTS.mono}>
              C[{targetR}][{targetC}] = {sum}
            </text>
          );
        })()}

        {/* Memory access count */}
        <rect x={40} y={210} width={500} height={55} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={228} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          全局内存访问 (这一个线程)
        </text>
        <text x={W / 2} y={248} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          读 A 的 {N} 个元素 + 读 B 的 {N} 个元素 = {2 * N} 次 global memory load
        </text>
        <text x={W / 2} y={260} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>
          {N * N} 个线程 x {2 * N} 次读取 = {N * N * 2 * N} 次总访问 → 同一行/列被不同线程重复读取!
        </text>

        {/* Key point */}
        <rect x={40} y={280} width={500} height={40} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={298} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          问题: A[{targetR}][:] 被 C 的第 {targetR} 行的所有 {N} 个线程重复读取
        </text>
        <text x={W / 2} y={312} textAnchor="middle" fontSize="8" fill={COLORS.primary}
          fontFamily={FONTS.sans}>
          解决方案: 加载到 Shared Memory 后共享 → Tiling 优化
        </text>
      </StepSvg>
    ),
  },
  {
    title: '性能分析: 和理论峰值的差距',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Naive GEMM 性能分析 (4096x4096, H100)
        </text>

        {/* Performance bar */}
        <text x={40} y={50} fontSize="9" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          FP32 性能对比:
        </text>

        {[
          { label: 'Naive GEMM', gflops: 400, color: COLORS.red, pct: '0.6%' },
          { label: '+ Tiling', gflops: 8000, color: COLORS.orange, pct: '12%' },
          { label: '+ Thread Tile', gflops: 25000, color: '#ca8a04', pct: '37%' },
          { label: '+ Vec Load + Double Buf', gflops: 45000, color: COLORS.green, pct: '67%' },
          { label: 'Tensor Core (FP16)', gflops: 60000, color: COLORS.primary, pct: '~90%' },
          { label: 'cuBLAS (参考)', gflops: 65000, color: COLORS.purple, pct: '97%' },
        ].map((item, i) => {
          const y = 68 + i * 34;
          const maxW = 360;
          const barW = Math.max(4, (item.gflops / 65000) * maxW);
          return (
            <g key={i}>
              <text x={40} y={y + 12} fontSize="7.5" fontWeight="500"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{item.label}</text>
              <rect x={190} y={y} width={maxW} height={18} rx={3}
                fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
              <rect x={190} y={y} width={barW} height={18} rx={3}
                fill={item.color} opacity={0.7} />
              <text x={195} y={y + 12} fontSize="7" fontWeight="600"
                fill="white" fontFamily={FONTS.mono}>
                {item.gflops >= 1000 ? `${(item.gflops / 1000).toFixed(0)}K` : item.gflops} GFLOPS ({item.pct})
              </text>
            </g>
          );
        })}

        {/* Key insight */}
        <rect x={40} y={SVG_H - 80} width={500} height={65} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={SVG_H - 58} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          优化核心思路
        </text>
        <text x={W / 2} y={SVG_H - 42} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          1. 减少全局内存访问 (Tiling → Shared Memory)
        </text>
        <text x={W / 2} y={SVG_H - 28} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          2. 提高数据复用 (Thread Tiling → 寄存器)
        </text>
        <text x={W / 2} y={SVG_H - 14} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          3. 利用专用硬件 (Tensor Core → 一条指令完成矩阵块乘)
        </text>
      </StepSvg>
    ),
  },
];

export default function NaiveGemmAnimation() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/NaiveGemmAnimation.tsx
git commit -m "feat: add NaiveGemmAnimation naive GEMM step-by-step visualization"
```

---

### Task 4: TilingAnimation (StepNavigator — Core Component)

**Files:**
- Create: `src/components/interactive/TilingAnimation.tsx`

**Context:** StepNavigator with 4 steps showing GEMM tiling with shared memory. This is the core teaching component for the article. Step 1: matrices divided into tile grid. Step 2: loading one tile pair from HBM to shared memory. Step 3: computing partial results in shared memory. Step 4: memory access reduction comparison. Uses client:visible.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/TilingAnimation.tsx
// StepNavigator: GEMM tiling with shared memory optimization (core component)
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 360;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Draw a matrix divided into tiles
function TiledMatrix({ x, y, w, h, label, tilesR, tilesC, activeTileR, activeTileC, color }: {
  x: number; y: number; w: number; h: number; label: string;
  tilesR: number; tilesC: number;
  activeTileR?: number; activeTileC?: number; color: string;
}) {
  const tileW = w / tilesC;
  const tileH = h / tilesR;
  return (
    <g>
      <text x={x + w / 2} y={y - 6} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      <rect x={x} y={y} width={w} height={h} rx={2}
        fill="#f8fafc" stroke={COLORS.dark} strokeWidth={1} />
      {Array.from({ length: tilesR }).map((_, tr) =>
        Array.from({ length: tilesC }).map((_, tc) => {
          const isActive = activeTileR === tr && activeTileC === tc;
          return (
            <rect key={`${tr}-${tc}`}
              x={x + tc * tileW + 0.5} y={y + tr * tileH + 0.5}
              width={tileW - 1} height={tileH - 1} rx={1}
              fill={isActive ? (color === COLORS.primary ? '#dbeafe' : '#dcfce7') : 'transparent'}
              stroke={isActive ? color : '#e2e8f0'} strokeWidth={isActive ? 2 : 0.5} />
          );
        })
      )}
    </g>
  );
}

const TILES = 4; // 4x4 tile grid for visualization

const steps = [
  {
    title: 'Step 1: 矩阵切分为 Tile 网格',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Tiling: 把大矩阵切成 BLOCK_SIZE x BLOCK_SIZE 的小块
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个 Block 负责计算 C 的一个 tile，沿 K 维遍历 A/B 的 tile 对
        </text>

        <TiledMatrix x={30} y={60} w={140} h={140} label={`A (M x K)`}
          tilesR={TILES} tilesC={TILES} color={COLORS.primary} />
        <text x={190} y={130} fontSize="14" fill={COLORS.dark}>x</text>
        <TiledMatrix x={210} y={60} w={140} h={140} label={`B (K x N)`}
          tilesR={TILES} tilesC={TILES} color={COLORS.green} />
        <text x={370} y={130} fontSize="14" fill={COLORS.dark}>=</text>
        <TiledMatrix x={390} y={60} w={140} h={140} label={`C (M x N)`}
          tilesR={TILES} tilesC={TILES} color={COLORS.orange} />

        {/* Annotation */}
        <rect x={40} y={220} width={500} height={120} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={240} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Tiling 策略</text>
        <text x={60} y={260} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          1. 每个 CUDA Block 对应 C 的一个 tile (BLOCK_SIZE x BLOCK_SIZE 线程)
        </text>
        <text x={60} y={278} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          2. 计算 C[tile_r][tile_c] 需要 A 的第 tile_r 行所有 tile x B 的第 tile_c 列所有 tile
        </text>
        <text x={60} y={296} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          3. 外循环: for t = 0 to K/BLOCK_SIZE — 每次加载一对 tile 到 Shared Memory
        </text>
        <text x={60} y={314} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
          4. 关键: 每个 tile 从 HBM 只加载一次，被 BLOCK_SIZE 个线程共享复用
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: 加载 Tile 到 Shared Memory',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          一个 Block 的工作: 计算 C 的 tile[1][2] (第 t=0 步)
        </text>

        {/* A tile highlighted */}
        <TiledMatrix x={30} y={50} w={120} h={120} label="A"
          tilesR={TILES} tilesC={TILES} activeTileR={1} activeTileC={0} color={COLORS.primary} />
        {/* B tile highlighted */}
        <TiledMatrix x={170} y={50} w={120} h={120} label="B"
          tilesR={TILES} tilesC={TILES} activeTileR={0} activeTileC={2} color={COLORS.green} />

        {/* Arrow: HBM → Shared Memory */}
        <text x={400} y={55} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Shared Memory</text>
        <rect x={340} y={62} width={55} height={45} rx={3}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={368} y={88} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.mono}>A tile</text>
        <rect x={405} y={62} width={55} height={45} rx={3}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
        <text x={433} y={88} textAnchor="middle" fontSize="7" fill={COLORS.green}
          fontFamily={FONTS.mono}>B tile</text>

        {/* Arrows */}
        <line x1={150} y1={90} x2={335} y2={82} stroke={COLORS.primary} strokeWidth={1.5}
          markerEnd="url(#tiling-arrow-blue)" />
        <line x1={290} y1={80} x2={400} y2={82} stroke={COLORS.green} strokeWidth={1.5}
          markerEnd="url(#tiling-arrow-green)" />
        <defs>
          <marker id="tiling-arrow-blue" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.primary} />
          </marker>
          <marker id="tiling-arrow-green" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.green} />
          </marker>
        </defs>

        <text x={400} y={125} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>__syncthreads()</text>

        {/* Computation */}
        <rect x={340} y={135} width={120} height={35} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={400} y={155} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          部分和 += A_tile * B_tile
        </text>

        {/* Code */}
        <rect x={30} y={190} width={520} height={145} rx={5}
          fill="#1e293b" />
        <text x={45} y={210} fontSize="7.5" fill="#94a3b8" fontFamily={FONTS.mono}>
          // 外循环: 沿 K 维遍历每对 tile
        </text>
        <text x={45} y={226} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          for (int t = 0; t {'<'} K / BLOCK_SIZE; t++) {'{'}
        </text>
        <text x={55} y={242} fontSize="7.5" fill={COLORS.primary} fontFamily={FONTS.mono}>
          As[ty][tx] = A[row][t*BS + tx];  // 协作加载 A tile
        </text>
        <text x={55} y={258} fontSize="7.5" fill={COLORS.green} fontFamily={FONTS.mono}>
          Bs[ty][tx] = B[t*BS + ty][col];  // 协作加载 B tile
        </text>
        <text x={55} y={274} fontSize="7.5" fill={COLORS.orange} fontFamily={FONTS.mono}>
          __syncthreads();
        </text>
        <text x={55} y={290} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          for (int k = 0; k {'<'} BS; k++)
        </text>
        <text x={65} y={306} fontSize="7.5" fill="#fef3c7" fontFamily={FONTS.mono}>
          sum += As[ty][k] * Bs[k][tx];  // 从 shared memory 读 (快!)
        </text>
        <text x={55} y={322} fontSize="7.5" fill={COLORS.orange} fontFamily={FONTS.mono}>
          __syncthreads();
        </text>
        <text x={45} y={338} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          {'}'}
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: Tile 在 Shared Memory 中的计算',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Shared Memory 中的 Tile 乘法
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          Block 内 BLOCK_SIZE x BLOCK_SIZE 线程从 shared memory 读取 — 延迟极低
        </text>

        {/* As tile */}
        {(() => {
          const tileSize = 4;
          const cell = 22;
          const ax = 60;
          const ay = 60;
          return (
            <g>
              <text x={ax + tileSize * cell / 2} y={ay - 6} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
                As (shared mem)
              </text>
              <rect x={ax - 2} y={ay - 2} width={tileSize * cell + 4} height={tileSize * cell + 4}
                rx={3} fill="none" stroke={COLORS.primary} strokeWidth={1.5} />
              {Array.from({ length: tileSize }).map((_, r) =>
                Array.from({ length: tileSize }).map((_, c) => (
                  <rect key={`a-${r}-${c}`} x={ax + c * cell} y={ay + r * cell}
                    width={cell - 1} height={cell - 1} rx={1}
                    fill={r === 1 ? '#dbeafe' : '#f1f5f9'} stroke="#cbd5e1" strokeWidth={0.5} />
                ))
              )}
              <text x={ax - 10} y={ay + 1.5 * cell} textAnchor="end" fontSize="7"
                fill={COLORS.primary} fontFamily={FONTS.sans}>row</text>
            </g>
          );
        })()}

        {/* Bs tile */}
        {(() => {
          const tileSize = 4;
          const cell = 22;
          const bx = 200;
          const by = 60;
          return (
            <g>
              <text x={bx + tileSize * cell / 2} y={by - 6} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
                Bs (shared mem)
              </text>
              <rect x={bx - 2} y={by - 2} width={tileSize * cell + 4} height={tileSize * cell + 4}
                rx={3} fill="none" stroke={COLORS.green} strokeWidth={1.5} />
              {Array.from({ length: tileSize }).map((_, r) =>
                Array.from({ length: tileSize }).map((_, c) => (
                  <rect key={`b-${r}-${c}`} x={bx + c * cell} y={by + r * cell}
                    width={cell - 1} height={cell - 1} rx={1}
                    fill={c === 2 ? '#dcfce7' : '#f1f5f9'} stroke="#cbd5e1" strokeWidth={0.5} />
                ))
              )}
              <text x={bx + 2.5 * cell} y={by - 14} textAnchor="middle" fontSize="7"
                fill={COLORS.green} fontFamily={FONTS.sans}>col</text>
            </g>
          );
        })()}

        {/* Arrow from row to result */}
        <text x={175} y={110} fontSize="10" fill={COLORS.dark}>x</text>

        {/* Result cell */}
        <rect x={340} y={90} width={50} height={30} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={2} />
        <text x={365} y={108} textAnchor="middle" fontSize="8" fontWeight="700"
          fill={COLORS.orange} fontFamily={FONTS.mono}>sum</text>
        <text x={365} y={135} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>在寄存器中累加</text>

        {/* Key benefit */}
        <rect x={30} y={175} width={520} height={75} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={195} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          为什么 Tiling 有效?
        </text>
        <text x={60} y={215} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Naive: 每个线程读 A 的一行 (K 个元素) — 同一行被 BLOCK_SIZE 个线程重复从 HBM 读取
        </text>
        <text x={60} y={232} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Tiling: 每个 tile 从 HBM 只读一次到 shared memory → BLOCK_SIZE 个线程共享
        </text>
        <text x={60} y={248} fontSize="8" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
          全局内存访问减少 BLOCK_SIZE 倍! (如 BS=32: 减少 32x)
        </text>

        {/* Comparison */}
        <rect x={30} y={265} width={520} height={60} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={285} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>内存访问量对比 (M=N=K=4096, BS=32)</text>
        <text x={120} y={305} textAnchor="middle" fontSize="8" fill={COLORS.red} fontFamily={FONTS.mono}>
          Naive: 2MNK = 275G
        </text>
        <text x={W / 2} y={305} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>→</text>
        <text x={420} y={305} textAnchor="middle" fontSize="8" fill={COLORS.green} fontFamily={FONTS.mono}>
          Tiling: 2MNK/BS = 8.6G (32x 减少)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 4: 完整 Tiling 外循环',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          沿 K 维遍历所有 Tile 对，累加部分和
        </text>

        {/* Show iteration over tiles */}
        {Array.from({ length: 4 }).map((_, t) => {
          const baseY = 45 + t * 60;
          const isActive = t <= 1;
          const opacity = isActive ? 1 : 0.4;
          return (
            <g key={t} opacity={opacity}>
              <text x={20} y={baseY + 18} fontSize="8" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.mono}>t={t}</text>

              {/* A strip */}
              <rect x={55} y={baseY} width={80} height={30} rx={2}
                fill={t === 0 ? '#dbeafe' : t === 1 ? '#bfdbfe' : '#f1f5f9'}
                stroke={COLORS.primary} strokeWidth={isActive ? 1.5 : 0.5} />
              <text x={95} y={baseY + 18} textAnchor="middle" fontSize="6.5"
                fill={COLORS.primary} fontFamily={FONTS.mono}>
                A tile[1][{t}]
              </text>

              <text x={148} y={baseY + 18} fontSize="8" fill={COLORS.dark}>x</text>

              {/* B strip */}
              <rect x={165} y={baseY} width={80} height={30} rx={2}
                fill={t === 0 ? '#dcfce7' : t === 1 ? '#bbf7d0' : '#f1f5f9'}
                stroke={COLORS.green} strokeWidth={isActive ? 1.5 : 0.5} />
              <text x={205} y={baseY + 18} textAnchor="middle" fontSize="6.5"
                fill={COLORS.green} fontFamily={FONTS.mono}>
                B tile[{t}][2]
              </text>

              {/* Arrow to accumulator */}
              <line x1={250} y1={baseY + 15} x2={280} y2={baseY + 15}
                stroke="#94a3b8" strokeWidth={0.8} />
            </g>
          );
        })}

        {/* Accumulator */}
        <rect x={285} y={55} width={60} height={210} rx={5}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={315} y={100} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>累加</text>
        <text x={315} y={120} textAnchor="middle" fontSize="7"
          fill={COLORS.orange} fontFamily={FONTS.mono}>sum</text>
        <text x={315} y={140} textAnchor="middle" fontSize="7"
          fill={COLORS.orange} fontFamily={FONTS.mono}>+=</text>
        <text x={315} y={160} textAnchor="middle" fontSize="7"
          fill={COLORS.orange} fontFamily={FONTS.mono}>partial</text>

        {/* Final write back */}
        <line x1={315} y1={265} x2={315} y2={290}
          stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#tiling-arrow-o)" />
        <defs>
          <marker id="tiling-arrow-o" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.orange} />
          </marker>
        </defs>
        <rect x={275} y={292} width={80} height={25} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={315} y={308} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.mono}>C[row][col]</text>
        <text x={315} y={330} textAnchor="middle" fontSize="7"
          fill="#64748b" fontFamily={FONTS.sans}>写回 HBM</text>

        {/* Right side: summary */}
        <rect x={370} y={45} width={190} height={260} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={465} y={68} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>完整流程</text>

        {['1. 确定 C 的 tile 位置',
          '2. for t = 0..K/BS-1:',
          '   a. 从 HBM 加载 A/B tile',
          '      到 shared memory',
          '   b. __syncthreads()',
          '   c. 在 shared memory 中',
          '      做部分矩阵乘',
          '   d. sum += partial',
          '   e. __syncthreads()',
          '3. 写 C[row][col] = sum',
          '   回 HBM',
        ].map((line, i) => (
          <text key={i} x={380} y={88 + i * 16} fontSize="7.5"
            fill={line.startsWith('   ') ? '#64748b' : COLORS.dark} fontFamily={FONTS.mono}>
            {line}
          </text>
        ))}

        <text x={465} y={272} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          两次 __syncthreads() 确保
        </text>
        <text x={465} y={286} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          加载完再计算、计算完再换 tile
        </text>
      </StepSvg>
    ),
  },
];

export default function TilingAnimation() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TilingAnimation.tsx
git commit -m "feat: add TilingAnimation GEMM tiling shared memory visualization"
```

---

### Task 5: ThreadTileAnimation (StepNavigator)

**Files:**
- Create: `src/components/interactive/ThreadTileAnimation.tsx`

**Context:** StepNavigator with 3 steps showing thread tiling optimization. Step 1: naive tiling (1 element per thread). Step 2: thread tiling (TM x TN elements per thread). Step 3: register reuse analysis. Uses client:visible.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/ThreadTileAnimation.tsx
// StepNavigator: thread tiling — each thread computes TM x TN output elements
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

const steps = [
  {
    title: '1x1 Thread Tile: 一个线程算一个元素',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Naive Tiling: 每个线程计算 C 的 1 个元素
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每次内循环迭代: 从 shared memory 读 2 个值 (A 和 B)，做 1 次 FMA
        </text>

        {/* C tile with one element highlighted */}
        {(() => {
          const cell = 20;
          const BS = 8; // visual block size
          const startX = (W - BS * cell) / 2;
          const startY = 55;
          return (
            <g>
              <text x={startX + BS * cell / 2} y={startY - 8} textAnchor="middle"
                fontSize="9" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
                C tile (BLOCK_SIZE x BLOCK_SIZE)
              </text>
              {Array.from({ length: BS }).map((_, r) =>
                Array.from({ length: BS }).map((_, c) => {
                  const isHL = r === 2 && c === 3;
                  return (
                    <rect key={`${r}-${c}`}
                      x={startX + c * cell} y={startY + r * cell}
                      width={cell - 1} height={cell - 1} rx={1}
                      fill={isHL ? '#fef3c7' : '#f1f5f9'}
                      stroke={isHL ? COLORS.orange : '#cbd5e1'}
                      strokeWidth={isHL ? 2 : 0.5} />
                  );
                })
              )}
              {/* Arrow to thread */}
              <line x1={startX + 3 * cell + cell / 2} y1={startY + 2 * cell + cell}
                x2={startX + 3 * cell + cell / 2} y2={startY + BS * cell + 10}
                stroke={COLORS.orange} strokeWidth={1} />
              <text x={startX + 3 * cell + cell / 2} y={startY + BS * cell + 22}
                textAnchor="middle" fontSize="7" fontWeight="600"
                fill={COLORS.orange} fontFamily={FONTS.sans}>Thread(2,3)</text>
            </g>
          );
        })()}

        {/* Access pattern */}
        <rect x={40} y={240} width={500} height={80} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={260} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>低效: 计算/访存比 = 1:2</text>
        <text x={60} y={280} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          内循环每次: 读 As[ty][k] + 读 Bs[k][tx] = 2 次 shared memory 读
        </text>
        <text x={60} y={296} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          计算: 1 次 FMA (fused multiply-add)
        </text>
        <text x={60} y={312} fontSize="8" fill={COLORS.red} fontFamily={FONTS.sans}>
          Compute:Load = 1 FMA / 2 reads = 0.5 — shared memory 带宽成为瓶颈
        </text>
      </StepSvg>
    ),
  },
  {
    title: '4x4 Thread Tile: 一个线程算 16 个元素',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Thread Tiling: 每个线程计算 TM x TN 的输出块
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          TM=4, TN=4: 每个线程负责 C 的 4x4 = 16 个输出元素
        </text>

        {/* C tile with 4x4 block highlighted */}
        {(() => {
          const cell = 14;
          const BS = 16; // visual block size
          const TM = 4;
          const TN = 4;
          const startX = 40;
          const startY = 55;
          // Show a 16x16 C tile, highlight one 4x4 block
          return (
            <g>
              <text x={startX + BS * cell / 2} y={startY - 8} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
                C tile (16x16) — 每个颜色块 = 1 个线程的工作
              </text>
              {Array.from({ length: BS }).map((_, r) =>
                Array.from({ length: BS }).map((_, c) => {
                  const tileR = Math.floor(r / TM);
                  const tileC = Math.floor(c / TN);
                  const isHL = tileR === 1 && tileC === 2;
                  const idx = tileR * (BS / TN) + tileC;
                  const bgColors = ['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3',
                    '#e0e7ff', '#ccfbf1', '#fef9c3', '#ffe4e6',
                    '#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3',
                    '#e0e7ff', '#ccfbf1', '#fef9c3', '#ffe4e6'];
                  return (
                    <rect key={`${r}-${c}`}
                      x={startX + c * cell} y={startY + r * cell}
                      width={cell - 0.5} height={cell - 0.5} rx={0.5}
                      fill={isHL ? '#fef3c7' : bgColors[idx]}
                      stroke={isHL ? COLORS.orange : '#e2e8f0'}
                      strokeWidth={isHL ? 1.5 : 0.3} />
                  );
                })
              )}
              {/* Highlight box */}
              <rect x={startX + 2 * TN * cell} y={startY + 1 * TM * cell}
                width={TN * cell} height={TM * cell}
                fill="none" stroke={COLORS.orange} strokeWidth={2} rx={2} />
              <text x={startX + 2 * TN * cell + TN * cell / 2}
                y={startY + BS * cell + 14}
                textAnchor="middle" fontSize="7" fontWeight="600"
                fill={COLORS.orange} fontFamily={FONTS.sans}>
                Thread(1,2) 的 4x4 块
              </text>
            </g>
          );
        })()}

        {/* Register reuse diagram */}
        <rect x={310} y={50} width={250} height={180} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={435} y={70} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>寄存器复用</text>

        {/* A fragment in registers */}
        <rect x={320} y={80} width={20} height={56} rx={2}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={330} y={78} textAnchor="middle" fontSize="6" fill={COLORS.primary}
          fontFamily={FONTS.mono}>A[4]</text>

        {/* B fragment in registers */}
        <rect x={360} y={80} width={56} height={20} rx={2}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={388} y={78} textAnchor="middle" fontSize="6" fill={COLORS.green}
          fontFamily={FONTS.mono}>B[4]</text>

        {/* Result 4x4 in registers */}
        <rect x={360} y={105} width={56} height={56} rx={2}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={388} y={136} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.mono}>C[4x4]</text>

        <text x={435} y={178} textAnchor="middle" fontSize="7.5" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          A 的 4 个值 x B 的 4 个值 = 16 个 FMA
        </text>
        <text x={435} y={194} textAnchor="middle" fontSize="7.5" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          从 shared mem 加载: 4 + 4 = 8 次读
        </text>
        <text x={435} y={210} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          Compute:Load = 16 / 8 = 2.0 (4x 提升!)
        </text>

        {/* Formula */}
        <rect x={40} y={280} width={500} height={40} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={298} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          Compute:Load = TM x TN / (TM + TN) = 4x4 / (4+4) = 2.0
        </text>
        <text x={W / 2} y={312} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          增大 TM, TN → 更高的计算/访存比 (但需要更多寄存器)
        </text>
      </StepSvg>
    ),
  },
  {
    title: '完整 Thread Tile 数据流',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          三级存储层次: HBM → Shared Memory → 寄存器
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每级缓存都通过 tiling 提高复用率
        </text>

        {/* Three levels */}
        {[
          { label: 'HBM (Global Memory)', y: 55, w: 500, h: 45, color: COLORS.red,
            bg: '#fee2e2', detail: '完整矩阵 A(MxK), B(KxN), C(MxN)', bw: '~3 TB/s (H100)' },
          { label: 'Shared Memory', y: 120, w: 400, h: 45, color: COLORS.orange,
            bg: '#fff7ed', detail: 'A tile (BSxBS) + B tile (BSxBS)', bw: '~20 TB/s per SM' },
          { label: '寄存器 (Register File)', y: 185, w: 300, h: 45, color: COLORS.green,
            bg: '#dcfce7', detail: 'A fragment (TM) + B fragment (TN) + C accumulator (TMxTN)', bw: '~60 TB/s per SM' },
        ].map((level, i) => (
          <g key={i}>
            <rect x={(W - level.w) / 2} y={level.y} width={level.w} height={level.h}
              rx={5} fill={level.bg} stroke={level.color} strokeWidth={1.5} />
            <text x={W / 2} y={level.y + 16} textAnchor="middle" fontSize="9" fontWeight="600"
              fill={level.color} fontFamily={FONTS.sans}>{level.label}</text>
            <text x={W / 2} y={level.y + 30} textAnchor="middle" fontSize="7.5"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{level.detail}</text>
            <text x={W / 2} y={level.y + 42} textAnchor="middle" fontSize="7"
              fill="#64748b" fontFamily={FONTS.mono}>{level.bw}</text>
            {i < 2 && (
              <g>
                <line x1={W / 2} y1={level.y + level.h} x2={W / 2}
                  y2={level.y + level.h + 20}
                  stroke={level.color} strokeWidth={1.5} markerEnd={`url(#ttile-arr-${i})`} />
                <defs>
                  <marker id={`ttile-arr-${i}`} markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill={level.color} />
                  </marker>
                </defs>
                <text x={W / 2 + 60} y={level.y + level.h + 14} fontSize="7"
                  fill={level.color} fontFamily={FONTS.sans}>
                  {i === 0 ? 'Block Tiling (BS x BS)' : 'Thread Tiling (TM x TN)'}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Compute */}
        <rect x={(W - 200) / 2} y={245} width={200} height={30} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={W / 2} y={264} textAnchor="middle" fontSize="9" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          FMA (寄存器 → 寄存器)
        </text>

        {/* Summary table */}
        <rect x={40} y={285} width={500} height={40} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={120} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>优化层</text>
        <text x={280} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>HBM 访问减少</text>
        <text x={440} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Shared Mem 访问减少</text>
        <text x={120} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.dark} fontFamily={FONTS.mono}>Block Tile + Thread Tile</text>
        <text x={280} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.mono}>BLOCK_SIZE 倍</text>
        <text x={440} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.mono}>TM x TN / (TM + TN) 倍</text>
      </StepSvg>
    ),
  },
];

export default function ThreadTileAnimation() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/ThreadTileAnimation.tsx
git commit -m "feat: add ThreadTileAnimation thread tiling register reuse visualization"
```

---

### Task 6: ComputeToLoadRatio (Interactive)

**Files:**
- Create: `src/components/interactive/ComputeToLoadRatio.tsx`

**Context:** Interactive component with useState. User adjusts TM and TN sliders. Shows compute-to-load ratio formula and result, with visual bar and register usage estimate. Uses client:visible.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/ComputeToLoadRatio.tsx
// Interactive: TM/TN → compute-to-load ratio calculator
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 240;

export default function ComputeToLoadRatio() {
  const [TM, setTM] = useState(4);
  const [TN, setTN] = useState(4);

  const ratio = (TM * TN) / (TM + TN);
  const fmas = TM * TN;
  const loads = TM + TN;
  const regsNeeded = TM * TN + TM + TN; // C accumulator + A frag + B frag

  // Ratio quality
  const qualityColor = ratio >= 4 ? COLORS.green : ratio >= 2 ? '#ca8a04' : ratio >= 1 ? COLORS.orange : COLORS.red;
  const qualityLabel = ratio >= 4 ? '优秀' : ratio >= 2 ? '良好' : ratio >= 1 ? '一般' : '低效';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">TM (rows per thread)</span>
          <input type="range" min={1} max={8} step={1} value={TM}
            onChange={e => setTM(+e.target.value)} className="w-full" />
          <span className="font-mono text-primary-600 font-bold">{TM}</span>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">TN (cols per thread)</span>
          <input type="range" min={1} max={8} step={1} value={TN}
            onChange={e => setTN(+e.target.value)} className="w-full" />
          <span className="font-mono text-primary-600 font-bold">{TN}</span>
        </label>
      </div>

      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
          {/* Formula */}
          <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Thread Tile = {TM} x {TN} = {fmas} 个输出元素
          </text>

          {/* Visual: TM x TN grid */}
          {(() => {
            const cellSize = Math.min(20, 120 / Math.max(TM, TN));
            const gridW = TN * cellSize;
            const gridH = TM * cellSize;
            const startX = 50;
            const startY = 40;
            return (
              <g>
                {/* A fragment column */}
                <rect x={startX - cellSize - 4} y={startY}
                  width={cellSize} height={gridH} rx={2}
                  fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
                <text x={startX - cellSize / 2 - 4} y={startY + gridH + 14}
                  textAnchor="middle" fontSize="7" fill={COLORS.primary} fontFamily={FONTS.mono}>
                  A[{TM}]
                </text>

                {/* B fragment row */}
                <rect x={startX} y={startY - cellSize - 4}
                  width={gridW} height={cellSize} rx={2}
                  fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
                <text x={startX + gridW + 14} y={startY - cellSize / 2}
                  fontSize="7" fill={COLORS.green} fontFamily={FONTS.mono}>
                  B[{TN}]
                </text>

                {/* C output grid */}
                {Array.from({ length: TM }).map((_, r) =>
                  Array.from({ length: TN }).map((_, c) => (
                    <rect key={`${r}-${c}`}
                      x={startX + c * cellSize} y={startY + r * cellSize}
                      width={cellSize - 1} height={cellSize - 1} rx={1}
                      fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.5} />
                  ))
                )}
                <text x={startX + gridW / 2} y={startY + gridH + 14}
                  textAnchor="middle" fontSize="7" fill={COLORS.orange} fontFamily={FONTS.mono}>
                  C[{TM}x{TN}]
                </text>
              </g>
            );
          })()}

          {/* Calculation */}
          <text x={300} y={50} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
            每次内循环 k 步:
          </text>
          <text x={310} y={68} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
            从 shared mem 读: TM + TN = {loads} 次
          </text>
          <text x={310} y={86} fontSize="8" fill={COLORS.orange} fontFamily={FONTS.mono}>
            FMA 计算: TM x TN = {fmas} 次
          </text>

          <line x1={310} y1={94} x2={530} y2={94} stroke="#e2e8f0" strokeWidth={0.5} />

          <text x={310} y={112} fontSize="10" fontWeight="700" fill={qualityColor}
            fontFamily={FONTS.mono}>
            Compute:Load = {TM}x{TN} / ({TM}+{TN}) = {ratio.toFixed(2)}
          </text>
          <text x={310} y={130} fontSize="9" fontWeight="600" fill={qualityColor}
            fontFamily={FONTS.sans}>
            {qualityLabel}
          </text>

          {/* Ratio bar */}
          <rect x={300} y={140} width={240} height={16} rx={3}
            fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
          <rect x={300} y={140}
            width={Math.min(240, (ratio / 8) * 240)} height={16} rx={3}
            fill={qualityColor} opacity={0.6} />

          {/* Register usage */}
          <rect x={40} y={SVG_H - 70} width={500} height={55} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={SVG_H - 48} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            寄存器使用: C 累加器 ({TM}x{TN}={TM * TN}) + A 片段 ({TM}) + B 片段 ({TN}) = {regsNeeded} 个寄存器
          </text>
          <text x={W / 2} y={SVG_H - 30} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            寄存器越多 → thread tile 越大 → 比率越高，但 occupancy 可能下降 (trade-off)
          </text>
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/ComputeToLoadRatio.tsx
git commit -m "feat: add ComputeToLoadRatio interactive thread tile calculator"
```

---

### Task 7: VectorLoadCompare (Static SVG)

**Files:**
- Create: `src/components/interactive/VectorLoadCompare.tsx`

**Context:** Static SVG comparing scalar loads vs float4 vector loads. No client:visible needed. Shows 4 scalar load instructions vs 1 float4 load, with bandwidth utilization bars.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/VectorLoadCompare.tsx
// Static SVG: scalar load vs float4 vector load comparison
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;

export default function VectorLoadCompare() {
  const colLeft = 145;
  const colRight = 435;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Scalar vs vector load comparison">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        向量化访存: float vs float4
      </text>

      {/* Left: scalar loads */}
      <rect x={20} y={38} width={250} height={22} rx={4}
        fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
      <text x={colLeft} y={52} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>标量加载 (4 条指令)</text>

      {Array.from({ length: 4 }).map((_, i) => {
        const y = 70 + i * 30;
        return (
          <g key={i}>
            <rect x={30} y={y} width={230} height={22} rx={3}
              fill="#f8fafc" stroke="#cbd5e1" strokeWidth={0.5} />
            <text x={40} y={y + 14} fontSize="7.5" fill={COLORS.dark} fontFamily={FONTS.mono}>
              LDG.32 R{i}, [addr + {i * 4}]
            </text>
            {/* 32-bit bus usage */}
            <rect x={200} y={y + 3} width={50} height={16} rx={2}
              fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
            <rect x={200} y={y + 3} width={12} height={16} rx={2}
              fill={COLORS.red} opacity={0.5} />
            <text x={225} y={y + 14} textAnchor="middle" fontSize="6"
              fill={COLORS.red} fontFamily={FONTS.mono}>32b</text>
          </g>
        );
      })}

      {/* Right: vector load */}
      <rect x={310} y={38} width={250} height={22} rx={4}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
      <text x={colRight} y={52} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>向量加载 (1 条指令)</text>

      <rect x={320} y={70} width={230} height={50} rx={3}
        fill="#f8fafc" stroke={COLORS.green} strokeWidth={1} />
      <text x={330} y={88} fontSize="7.5" fill={COLORS.dark} fontFamily={FONTS.mono}>
        LDG.128 R0:R3, [addr]
      </text>
      <text x={330} y={104} fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
        一次读取 128 bits = 4 个 float
      </text>
      {/* 128-bit bus usage */}
      <rect x={490} y={76} width={50} height={16} rx={2}
        fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
      <rect x={490} y={76} width={50} height={16} rx={2}
        fill={COLORS.green} opacity={0.5} />
      <text x={515} y={87} textAnchor="middle" fontSize="6"
        fill={COLORS.green} fontFamily={FONTS.mono}>128b</text>

      {/* Comparison */}
      <rect x={40} y={185} width={500} height={85} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={205} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>对比</text>

      {[
        { label: '指令数', left: '4 条 LDG.32', right: '1 条 LDG.128', better: 'right' },
        { label: '总传输量', left: '4 x 32b = 128b', right: '1 x 128b = 128b', better: 'same' },
        { label: '指令发射开销', left: '4 个调度槽', right: '1 个调度槽', better: 'right' },
      ].map((row, i) => {
        const y = 218 + i * 16;
        return (
          <g key={i}>
            <text x={100} y={y} textAnchor="middle" fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{row.label}</text>
            <text x={250} y={y} textAnchor="middle" fontSize="7.5"
              fill={row.better === 'left' ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
              {row.left}
            </text>
            <text x={430} y={y} textAnchor="middle" fontSize="7.5"
              fill={row.better === 'right' ? COLORS.green : row.better === 'same' ? COLORS.dark : COLORS.red}
              fontFamily={FONTS.mono}>
              {row.right}
            </text>
          </g>
        );
      })}

      {/* Code hint */}
      <rect x={40} y={H - 24} width={500} height={18} rx={3}
        fill="#1e293b" />
      <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="7.5"
        fill="#e2e8f0" fontFamily={FONTS.mono}>
        float4 tmp = *reinterpret_cast{'<'}float4*{'>'}(&A[row * K + k]);  // 128-bit aligned load
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/VectorLoadCompare.tsx
git commit -m "feat: add VectorLoadCompare scalar vs float4 load diagram"
```

---

### Task 8: DoubleBufPipeline (StepNavigator)

**Files:**
- Create: `src/components/interactive/DoubleBufPipeline.tsx`

**Context:** StepNavigator with 2 steps. Step 1: serial execution (load → compute → load → compute). Step 2: double buffering (load N+1 overlaps with compute N). Uses client:visible.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/DoubleBufPipeline.tsx
// StepNavigator: double buffering pipeline — load and compute overlap
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 300;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

function TimeBar({ x, y, w, h, label, color, bg }: {
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

const TRACK_Y = 65;
const TRACK_H = 26;
const UNIT_W = 70;

const steps = [
  {
    title: '无双缓冲: Load 和 Compute 串行',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          串行流水线: 计算必须等加载完成
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个 tile: 加载到 shared memory → __syncthreads() → 计算 → __syncthreads() → 下一个
        </text>

        {/* Timeline axis */}
        <text x={30} y={TRACK_Y - 8} fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>时间 →</text>

        {/* Load track */}
        <text x={15} y={TRACK_Y + TRACK_H / 2} textAnchor="end" dominantBaseline="middle"
          fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>Load</text>
        {Array.from({ length: 4 }).map((_, i) => (
          <TimeBar key={`l-${i}`}
            x={40 + i * (UNIT_W * 2 + 8)} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
            label={`Load T${i}`} color={COLORS.primary} bg="#dbeafe" />
        ))}

        {/* Compute track */}
        <text x={15} y={TRACK_Y + TRACK_H + 8 + TRACK_H / 2} textAnchor="end"
          dominantBaseline="middle" fontSize="8" fill={COLORS.green} fontFamily={FONTS.sans}>
          Compute
        </text>
        {Array.from({ length: 4 }).map((_, i) => (
          <TimeBar key={`c-${i}`}
            x={40 + UNIT_W + 4 + i * (UNIT_W * 2 + 8)}
            y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
            label={`Compute T${i}`} color={COLORS.green} bg="#dcfce7" />
        ))}

        {/* Idle markers */}
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={`idle-${i}`}>
            <rect x={40 + i * (UNIT_W * 2 + 8)} y={TRACK_Y + TRACK_H + 8}
              width={UNIT_W} height={TRACK_H} rx={3}
              fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={40 + UNIT_W / 2 + i * (UNIT_W * 2 + 8)}
              y={TRACK_Y + TRACK_H + 8 + TRACK_H / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="6" fill="#94a3b8" fontFamily={FONTS.sans}>idle</text>
          </g>
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={`idle2-${i}`}>
            <rect x={40 + UNIT_W + 4 + i * (UNIT_W * 2 + 8)} y={TRACK_Y}
              width={UNIT_W} height={TRACK_H} rx={3}
              fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={40 + UNIT_W + 4 + UNIT_W / 2 + i * (UNIT_W * 2 + 8)}
              y={TRACK_Y + TRACK_H / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="6" fill="#94a3b8" fontFamily={FONTS.sans}>idle</text>
          </g>
        ))}

        {/* Total time */}
        <line x1={40} y1={145} x2={40 + 4 * (UNIT_W * 2 + 8) - 8} y2={145}
          stroke={COLORS.red} strokeWidth={1.5} />
        <text x={W / 2} y={162} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          总时间 = 4 x (Load + Compute) — 一半时间在空闲!
        </text>

        {/* Problem */}
        <rect x={40} y={180} width={500} height={100} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={200} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          问题: 加载和计算不能重叠
        </text>
        <text x={60} y={220} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          加载 tile 到 shared memory 后才能计算 → 计算完才能加载下一个 tile
        </text>
        <text x={60} y={238} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          原因: 只有一块 shared memory buffer，加载和计算操作的是同一块内存
        </text>
        <text x={60} y={256} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
          解决方案: 用两块 buffer — 一块加载新数据，同时另一块用于计算
        </text>
        <text x={60} y={272} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          (或者用寄存器预加载: 先读到寄存器，计算完当前 tile 后再写入 shared memory)
        </text>
      </StepSvg>
    ),
  },
  {
    title: '双缓冲: Load 和 Compute 重叠',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Double Buffering: 加载和计算流水线化
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          Buffer A 用于计算时，Buffer B 同时从 HBM 预加载下一个 tile
        </text>

        {/* Two buffer tracks */}
        <text x={15} y={TRACK_Y + TRACK_H / 2} textAnchor="end" dominantBaseline="middle"
          fontSize="7" fill={COLORS.primary} fontFamily={FONTS.sans}>Buf A</text>
        <text x={15} y={TRACK_Y + TRACK_H + 8 + TRACK_H / 2} textAnchor="end"
          dominantBaseline="middle" fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
          Buf B
        </text>

        {/* Buffer A: Load T0, Compute T0, Load T2, Compute T2 */}
        <TimeBar x={40} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label="Load T0" color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + UNIT_W + 4} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label="Comp T0" color={COLORS.green} bg="#dcfce7" />
        <TimeBar x={40 + (UNIT_W + 4) * 2} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label="Load T2" color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 3} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label="Comp T2" color={COLORS.green} bg="#dcfce7" />

        {/* Buffer B: idle, Load T1, Compute T1, Load T3, Compute T3 */}
        <TimeBar x={40 + UNIT_W + 4} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label="Load T1" color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 2} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label="Comp T1" color={COLORS.green} bg="#dcfce7" />
        <TimeBar x={40 + (UNIT_W + 4) * 3} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label="Load T3" color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 4} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label="Comp T3" color={COLORS.green} bg="#dcfce7" />

        {/* Overlap highlight */}
        {[1, 2, 3].map(i => {
          const x = 40 + (UNIT_W + 4) * i;
          return (
            <rect key={i} x={x - 2} y={TRACK_Y - 4}
              width={UNIT_W + 4} height={TRACK_H * 2 + 16} rx={4}
              fill="none" stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="4 2" />
          );
        })}

        <text x={W / 2} y={TRACK_Y + TRACK_H * 2 + 25} textAnchor="middle"
          fontSize="8" fill={COLORS.orange} fontFamily={FONTS.sans}>
          橙色虚线框 = Load 和 Compute 同时进行 (重叠)
        </text>

        {/* Time comparison */}
        <rect x={40} y={165} width={500} height={65} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={185} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          时间节省
        </text>
        <text x={150} y={205} textAnchor="middle" fontSize="8"
          fill={COLORS.red} fontFamily={FONTS.mono}>串行: 4 x (L + C) = 8 步</text>
        <text x={290} y={205} fontSize="10" fill={COLORS.dark}>→</text>
        <text x={430} y={205} textAnchor="middle" fontSize="8"
          fill={COLORS.green} fontFamily={FONTS.mono}>重叠: L + 4C + drain = ~5 步</text>
        <text x={W / 2} y={222} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          当 Load 时间 {'≤'} Compute 时间时，几乎完全隐藏加载延迟
        </text>

        {/* Trade-off */}
        <rect x={40} y={245} width={500} height={40} rx={5}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
        <text x={W / 2} y={262} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          代价: 2x shared memory 使用 (两个 buffer) 或额外寄存器用于预加载
        </text>
        <text x={W / 2} y={278} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          实际实现常用寄存器预加载 (先 global → register → shared) 避免 2x shared memory
        </text>
      </StepSvg>
    ),
  },
];

export default function DoubleBufPipeline() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/DoubleBufPipeline.tsx
git commit -m "feat: add DoubleBufPipeline double buffering pipeline diagram"
```

---

### Task 9: WmmaTilingDiagram (Static SVG)

**Files:**
- Create: `src/components/interactive/WmmaTilingDiagram.tsx`

**Context:** Static SVG showing the hierarchical tiling for Tensor Core GEMM: Grid tile → Block tile → Warp tile (16x16x16) → Tensor Core operation. No client:visible.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/WmmaTilingDiagram.tsx
// Static SVG: Tensor Core GEMM tiling hierarchy
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

function TileBox({ x, y, w, h, label, sublabel, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle"
        fontSize="8" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
        fontSize="7" fill="#64748b" fontFamily={FONTS.mono}>
        {sublabel}
      </text>
    </g>
  );
}

export default function WmmaTilingDiagram() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Tensor Core GEMM tiling hierarchy">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Tensor Core GEMM 的多级 Tiling
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        从 Grid 到 Tensor Core，每级 tile 缩小到适合当前硬件层级
      </text>

      {/* Level 1: Grid Tile */}
      <rect x={20} y={52} width={540} height={55} rx={6}
        fill="none" stroke={COLORS.dark} strokeWidth={2} strokeDasharray="6 3" />
      <text x={30} y={68} fontSize="8" fontWeight="700" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Level 1: Grid Tile</text>
      <text x={30} y={82} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        每个 CUDA Block 负责 C 的一个 BM x BN 区域 (如 128 x 128)
      </text>
      <text x={30} y={96} fontSize="7.5" fill={COLORS.primary} fontFamily={FONTS.sans}>
        决定: 每个 Block 的工作量、shared memory 需求
      </text>

      {/* Level 2: Block Tile → Warp */}
      <rect x={40} y={116} width={500} height={55} rx={6}
        fill="none" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={50} y={132} fontSize="8" fontWeight="700" fill={COLORS.primary}
        fontFamily={FONTS.sans}>Level 2: Warp Tile</text>
      <text x={50} y={146} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        Block 内每个 Warp 负责 C 的 WM x WN 区域 (如 32 x 64)
      </text>
      <text x={50} y={160} fontSize="7.5" fill={COLORS.primary} fontFamily={FONTS.sans}>
        决定: Block 内 Warp 的分工、寄存器分配
      </text>

      {/* Level 3: MMA tile */}
      <rect x={60} y={180} width={460} height={55} rx={6}
        fill="none" stroke={COLORS.green} strokeWidth={1.5} />
      <text x={70} y={196} fontSize="8" fontWeight="700" fill={COLORS.green}
        fontFamily={FONTS.sans}>Level 3: MMA Instruction Tile</text>
      <text x={70} y={210} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        每个 Warp 内层循环用 wmma::mma_sync 做 16 x 16 x 16 (或 m16n8k16) 的矩阵块乘
      </text>
      <text x={70} y={224} fontSize="7.5" fill={COLORS.green} fontFamily={FONTS.sans}>
        这一步由 Tensor Core 硬件执行 — 一条指令完成整块乘加
      </text>

      {/* Tensor Core box */}
      <rect x={100} y={244} width={380} height={45} rx={6}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={2} />
      <text x={290} y={262} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        Tensor Core: D(16x16) = A(16x16) * B(16x16) + C(16x16)
      </text>
      <text x={290} y={278} textAnchor="middle" fontSize="7.5" fill="#64748b"
        fontFamily={FONTS.mono}>
        wmma::mma_sync{'<'}16,16,16,half{'>'} (底层映射到多条 PTX mma.sync 指令)
      </text>

      {/* Dimension summary table */}
      <rect x={40} y={300} width={500} height={65} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={316} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>典型尺寸 (H100 HGEMM)</text>

      {[
        ['Grid tile (Block)', '128 x 128', 'shared memory 中'],
        ['Warp tile', '32 x 64', 'register fragment 中'],
        ['MMA tile (WMMA)', '16 x 16 x 16', 'Tensor Core 一条 warp 级指令'],
      ].map(([level, size, loc], i) => {
        const y = 332 + i * 12;
        return (
          <g key={i}>
            <text x={120} y={y} textAnchor="middle" fontSize="7.5" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{level}</text>
            <text x={280} y={y} textAnchor="middle" fontSize="7.5"
              fill={COLORS.primary} fontFamily={FONTS.mono}>{size}</text>
            <text x={430} y={y} textAnchor="middle" fontSize="7.5"
              fill="#64748b" fontFamily={FONTS.sans}>{loc}</text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/WmmaTilingDiagram.tsx
git commit -m "feat: add WmmaTilingDiagram Tensor Core GEMM tiling hierarchy"
```

---

### Task 10: TensorCoreGemmFlow (StepNavigator)

**Files:**
- Create: `src/components/interactive/TensorCoreGemmFlow.tsx`

**Context:** StepNavigator with 3 steps showing WMMA warp-level flow. Step 1: load fragments from shared memory. Step 2: mma_sync execution. Step 3: store fragment back. Uses client:visible.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/TensorCoreGemmFlow.tsx
// StepNavigator: WMMA warp-level Tensor Core GEMM flow
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

// Thread register visualization (simplified)
function ThreadRegs({ x, y, w, h, label, color, bg, detail }: {
  x: number; y: number; w: number; h: number;
  label: string; color: string; bg: string; detail: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle"
        fontSize="8" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
        fontSize="6.5" fill="#64748b" fontFamily={FONTS.mono}>
        {detail}
      </text>
    </g>
  );
}

const steps = [
  {
    title: 'Step 1: load_matrix_sync — 加载 Fragment',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          WMMA Step 1: 从 Shared Memory 加载 Fragment
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          32 个线程协作将矩阵块加载到各自的寄存器中 (fragment)
        </text>

        {/* Shared memory blocks */}
        <rect x={30} y={55} width={120} height={60} rx={4}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={90} y={75} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>Shared Memory</text>
        <text x={90} y={92} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.mono}>As[16x16] + Bs[16x16]</text>

        {/* Arrows */}
        <line x1={155} y1={85} x2={210} y2={85}
          stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#tcflow-arr)" />
        <defs>
          <marker id="tcflow-arr" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.primary} />
          </marker>
        </defs>

        {/* Thread registers */}
        <rect x={215} y={50} width={340} height={80} rx={5}
          fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1} />
        <text x={385} y={66} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Warp (32 threads) — 各线程的寄存器</text>
        <ThreadRegs x={225} y={74} w={100} h={44}
          label="A fragment" color={COLORS.primary} bg="#dbeafe"
          detail="wmma::matrix_a<16,16,16,half>" />
        <ThreadRegs x={340} y={74} w={100} h={44}
          label="B fragment" color={COLORS.green} bg="#dcfce7"
          detail="wmma::matrix_b<16,16,16,half>" />
        <ThreadRegs x={455} y={74} w={90} h={44}
          label="C accumulator" color={COLORS.orange} bg="#fff7ed"
          detail="wmma::accumulator<float>" />

        {/* Code */}
        <rect x={30} y={145} width={520} height={65} rx={4}
          fill="#1e293b" />
        <text x={45} y={163} fontSize="7.5" fill="#94a3b8" fontFamily={FONTS.mono}>
          // 声明 fragment (每个线程持有矩阵的一部分)
        </text>
        <text x={45} y={179} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          wmma::fragment{'<'}wmma::matrix_a, 16, 16, 16, half, wmma::row_major{'>'} a_frag;
        </text>
        <text x={45} y={195} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          wmma::load_matrix_sync(a_frag, &As[warp_row * 16], 16);  // shared → register
        </text>

        {/* Key concept */}
        <rect x={30} y={225} width={520} height={70} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={W / 2} y={245} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Fragment 分布</text>
        <text x={60} y={265} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          16x16 = 256 个元素由 32 个线程分持: 每个线程寄存器中持有 8 个元素
        </text>
        <text x={60} y={282} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          具体哪个线程持有哪些元素由硬件决定 — 对程序员不透明 (只能通过 wmma API 操作)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: mma_sync — Tensor Core 执行矩阵乘加',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          WMMA Step 2: mma_sync — D = A * B + C
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          一条 warp 级指令，32 个线程同步发射到 Tensor Core
        </text>

        {/* Input fragments */}
        <ThreadRegs x={30} y={55} w={100} h={50}
          label="A fragment" color={COLORS.primary} bg="#dbeafe"
          detail="FP16 (16x16)" />
        <ThreadRegs x={150} y={55} w={100} h={50}
          label="B fragment" color={COLORS.green} bg="#dcfce7"
          detail="FP16 (16x16)" />
        <ThreadRegs x={440} y={55} w={110} h={50}
          label="C accumulator" color={COLORS.orange} bg="#fff7ed"
          detail="FP32 (16x16)" />

        {/* Tensor Core box */}
        <rect x={80} y={120} width={420} height={50} rx={6}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={2.5} />
        <text x={290} y={140} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          Tensor Core
        </text>
        <text x={290} y={158} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.mono}>
          D = A(FP16) * B(FP16) + C(FP32) → D(FP32)
        </text>

        {/* Arrows in */}
        <line x1={80} y1={105} x2={160} y2={120} stroke={COLORS.primary} strokeWidth={1.5} />
        <line x1={200} y1={105} x2={230} y2={120} stroke={COLORS.green} strokeWidth={1.5} />
        <line x1={495} y1={105} x2={430} y2={120} stroke={COLORS.orange} strokeWidth={1.5} />

        {/* Output */}
        <line x1={290} y1={170} x2={290} y2={195}
          stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#tcflow-arr2)" />
        <defs>
          <marker id="tcflow-arr2" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.purple} />
          </marker>
        </defs>
        <ThreadRegs x={220} y={200} w={140} h={45}
          label="D accumulator (更新后)" color={COLORS.purple} bg="#f3e8ff"
          detail="FP32 (16x16) — 在寄存器中" />

        {/* Code */}
        <rect x={30} y={260} width={520} height={30} rx={4}
          fill="#1e293b" />
        <text x={45} y={279} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          wmma::mma_sync(d_frag, a_frag, b_frag, c_frag);  // 一条 warp 级指令完成 16x16x16 乘加
        </text>

        {/* Performance note */}
        <rect x={40} y={SVG_H - 20} width={500} height={14} rx={3}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={0.5} />
        <text x={W / 2} y={SVG_H - 10} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          16x16x16 = 4096 FMA (8192 FLOPs) / 指令 vs CUDA Core 1 FMA / 指令
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: store_matrix_sync — 写回结果',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          WMMA Step 3: 累加完所有 tile 后写回
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          内循环结束后，将 accumulator fragment 存回 shared memory 或 global memory
        </text>

        {/* Flow: inner loop then store */}
        <rect x={30} y={55} width={520} height={100} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={72} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>完整 Warp 级循环</text>

        {/* Loop iterations */}
        {Array.from({ length: 4 }).map((_, i) => {
          const x = 55 + i * 125;
          const isLast = i === 3;
          return (
            <g key={i}>
              <rect x={x} y={82} width={110} height={28} rx={3}
                fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
              <text x={x + 55} y={98} textAnchor="middle" fontSize="7" fontWeight="500"
                fill={COLORS.primary} fontFamily={FONTS.mono}>
                {isLast ? '...' : `load + mma (k=${i})`}
              </text>
              {!isLast && (
                <text x={x + 117} y={98} textAnchor="middle" fontSize="8"
                  fill="#94a3b8">→</text>
              )}
            </g>
          );
        })}

        <text x={W / 2} y={130} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          d_frag 在每个 k 步累加: d = a*b + d
        </text>

        {/* Store */}
        <rect x={150} y={155} width={280} height={40} rx={5}
          fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1.5} />
        <text x={290} y={178} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.purple} fontFamily={FONTS.mono}>
          wmma::store_matrix_sync(&C[...], d_frag, N, wmma::mem_row_major)
        </text>

        <line x1={290} y1={195} x2={290} y2={215}
          stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#tcflow-arr3)" />
        <defs>
          <marker id="tcflow-arr3" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.purple} />
          </marker>
        </defs>

        <rect x={200} y={220} width={180} height={30} rx={4}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={290} y={238} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>Global Memory (C 矩阵)</text>

        {/* Summary */}
        <rect x={30} y={265} width={520} height={40} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={282} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          WMMA 三步: load_matrix_sync → mma_sync (循环) → store_matrix_sync
        </text>
        <text x={W / 2} y={298} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          仍然需要 Block 级 tiling (shared memory) — Tensor Core 只是替换了最内层计算单元
        </text>
      </StepSvg>
    ),
  },
];

export default function TensorCoreGemmFlow() {
  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TensorCoreGemmFlow.tsx
git commit -m "feat: add TensorCoreGemmFlow WMMA warp-level Tensor Core flow"
```

---

### Task 11: PerformanceLadder (Interactive)

**Files:**
- Create: `src/components/interactive/PerformanceLadder.tsx`

**Context:** Interactive bar chart showing GEMM optimization stages. Hover to see details per stage. A cuBLAS reference line at top. Uses useState for hover state. Uses client:visible.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/PerformanceLadder.tsx
// Interactive: GEMM optimization stages bar chart with hover details
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 340;

interface Stage {
  label: string;
  gflops: number;
  pct: string;
  color: string;
  detail: string;
  keyChange: string;
}

const STAGES: Stage[] = [
  {
    label: 'Naive',
    gflops: 400,
    pct: '0.6%',
    color: COLORS.red,
    detail: 'FP32 SGEMM: 一个线程算一个输出元素，每个元素 2K 次全局内存读取',
    keyChange: '基线: 简单但严重 memory-bound (vs FP32 peak 67 TFLOPS)',
  },
  {
    label: '+ Block Tiling',
    gflops: 8000,
    pct: '12%',
    color: COLORS.orange,
    detail: 'Tile 加载到 shared memory 后 BLOCK_SIZE 个线程共享复用',
    keyChange: 'HBM 访问减少 BLOCK_SIZE 倍 (如 32x)',
  },
  {
    label: '+ Thread Tile',
    gflops: 25000,
    pct: '37%',
    color: '#ca8a04',
    detail: '每线程算 TM x TN 个输出元素，数据加载到寄存器后复用',
    keyChange: 'Shared mem 访问减少 TM*TN/(TM+TN) 倍',
  },
  {
    label: '+ Vec Load',
    gflops: 35000,
    pct: '52%',
    color: '#65a30d',
    detail: 'float4 一次加载 128 bits，减少指令数和调度开销',
    keyChange: '指令数减少 4x，带宽利用率提高',
  },
  {
    label: '+ Double Buffer',
    gflops: 45000,
    pct: '67%',
    color: COLORS.green,
    detail: '计算当前 tile 时预加载下一个 tile，重叠访存和计算',
    keyChange: '隐藏内存延迟，流水线充分利用',
  },
  {
    label: 'Tensor Core',
    gflops: 60000,
    pct: '~90%',
    color: COLORS.primary,
    detail: 'FP16 HGEMM: WMMA 一条指令完成 16x16x16 矩阵块乘加 (FP16 in, FP32 acc)',
    keyChange: '切换到 FP16 Tensor Core (vs FP16 TC practical peak ~70K GFLOPS at 4096x4096)',
  },
];

const CUBLAS = 65000;

export default function PerformanceLadder() {
  const [hover, setHover] = useState<number | null>(null);

  const barMaxW = 340;
  const barH = 28;
  const barGap = 8;
  const barX = 170;
  const barStartY = 60;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden p-4">
      <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="13" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          GEMM 优化性能阶梯 (H100, 4096x4096)
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每步优化的 GFLOPS — 悬停查看详情
        </text>

        {/* cuBLAS reference line */}
        {(() => {
          const refX = barX + barMaxW;
          return (
            <g>
              <line x1={refX} y1={barStartY - 8} x2={refX}
                y2={barStartY + STAGES.length * (barH + barGap)}
                stroke={COLORS.purple} strokeWidth={1.5} strokeDasharray="4 2" />
              <text x={refX + 4} y={barStartY - 2} fontSize="7" fontWeight="600"
                fill={COLORS.purple} fontFamily={FONTS.mono}>
                cuBLAS ~{(CUBLAS / 1000).toFixed(0)}K ({((CUBLAS / 67000) * 100).toFixed(0)}%)
              </text>
            </g>
          );
        })()}

        {/* Bars */}
        {STAGES.map((stage, i) => {
          const y = barStartY + i * (barH + barGap);
          const barW = (stage.gflops / CUBLAS) * barMaxW;
          const isHovered = hover === i;
          return (
            <g key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}>
              {/* Label */}
              <text x={barX - 6} y={y + barH / 2 + 1} textAnchor="end"
                fontSize="7.5" fontWeight={isHovered ? '700' : '500'}
                fill={isHovered ? stage.color : COLORS.dark} fontFamily={FONTS.sans}>
                {stage.label}
              </text>
              {/* Background */}
              <rect x={barX} y={y} width={barMaxW} height={barH} rx={3}
                fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
              {/* Fill */}
              <rect x={barX} y={y} width={barW} height={barH} rx={3}
                fill={stage.color} opacity={isHovered ? 0.9 : 0.6}
                stroke={stage.color} strokeWidth={isHovered ? 2 : 0} />
              {/* Value */}
              <text x={barX + barW + 6} y={y + barH / 2 + 1} dominantBaseline="middle"
                fontSize="7.5" fontWeight="600" fill={stage.color} fontFamily={FONTS.mono}>
                {stage.gflops >= 1000 ? `${(stage.gflops / 1000).toFixed(0)}K` : stage.gflops} ({stage.pct})
              </text>
            </g>
          );
        })}

        {/* Hover detail */}
        {hover !== null && (
          <g>
            <rect x={30} y={barStartY + STAGES.length * (barH + barGap) + 10}
              width={520} height={58} rx={5}
              fill={STAGES[hover].color} fillOpacity={0.08}
              stroke={STAGES[hover].color} strokeWidth={1} />
            <text x={W / 2}
              y={barStartY + STAGES.length * (barH + barGap) + 30}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={STAGES[hover].color} fontFamily={FONTS.sans}>
              {STAGES[hover].label}: {STAGES[hover].detail}
            </text>
            <text x={W / 2}
              y={barStartY + STAGES.length * (barH + barGap) + 50}
              textAnchor="middle" fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
              核心变化: {STAGES[hover].keyChange}
            </text>
          </g>
        )}

        {hover === null && (
          <rect x={30} y={barStartY + STAGES.length * (barH + barGap) + 10}
            width={520} height={58} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1}>
          </rect>
        )}
        {hover === null && (
          <text x={W / 2}
            y={barStartY + STAGES.length * (barH + barGap) + 44}
            textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily={FONTS.sans}>
            悬停各优化阶段查看详情
          </text>
        )}

        {/* Key insight */}
        <rect x={30} y={SVG_H - 35} width={520} height={28} rx={4}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={W / 2} y={SVG_H - 18} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          优化核心: 减少内存访问 → 提高数据复用 → 利用专用硬件 (Tensor Core) → 接近理论峰值
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/PerformanceLadder.tsx
git commit -m "feat: add PerformanceLadder GEMM optimization stages bar chart"
```

---

### Task 12: IntelGemmCompare (Static SVG)

**Files:**
- Create: `src/components/interactive/IntelGemmCompare.tsx`

**Context:** Static SVG comparing CUDA GEMM vs Intel GEMM tiling hierarchy. No client:visible. Side-by-side layout showing corresponding tiling levels.

- [ ] **Step 1: Create component file**

```tsx
// src/components/interactive/IntelGemmCompare.tsx
// Static SVG: CUDA GEMM vs Intel GEMM tiling comparison
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

const COL_X = [150, 430];
const COL_W = 230;

interface CompRow {
  level: string;
  cuda: string;
  intel: string;
}

const ROWS: CompRow[] = [
  { level: 'Grid 级', cuda: 'Block tile: BM x BN\n(Shared Memory)', intel: 'Work-group tile: BM x BN\n(SLM / Shared Local Memory)' },
  { level: 'Warp/Sub-group 级', cuda: 'Warp tile: WM x WN\n(Register fragment)', intel: 'Sub-group tile: WM x WN\n(GRF / Register)' },
  { level: '指令级', cuda: 'wmma::mma_sync\n(Tensor Core 16x16x16)', intel: 'joint_matrix_mad\n(XMX systolic array)' },
  { level: '数据类型', cuda: 'FP16 in → FP32 acc\n(mma.sync.f32.f16)', intel: 'FP16/BF16 in → FP32 acc\n(dpas / XMX)' },
  { level: '编程 API', cuda: 'CUDA wmma / mma.sync\n(PTX / CUTLASS)', intel: 'SYCL joint_matrix\n(或 ESIMD intrinsics)' },
];

const ROW_H = 52;
const ROW_START = 75;

export default function IntelGemmCompare() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CUDA vs Intel GEMM tiling comparison">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        CUDA GEMM vs Intel GEMM: Tiling 层级对照
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        思路完全相同 — 只是 API 和硬件单元名称不同
      </text>

      {/* Column headers */}
      <rect x={COL_X[0] - COL_W / 2} y={48} width={COL_W} height={22} rx={4}
        fill={COLORS.green} fillOpacity={0.1} stroke={COLORS.green} strokeWidth={1} />
      <text x={COL_X[0]} y={62} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>CUDA (NVIDIA)</text>

      <rect x={COL_X[1] - COL_W / 2} y={48} width={COL_W} height={22} rx={4}
        fill={COLORS.primary} fillOpacity={0.1} stroke={COLORS.primary} strokeWidth={1} />
      <text x={COL_X[1]} y={62} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>SYCL / DPC++ (Intel)</text>

      {/* Rows */}
      {ROWS.map((row, ri) => {
        const y = ROW_START + ri * ROW_H;
        return (
          <g key={ri}>
            {ri % 2 === 0 && (
              <rect x={0} y={y} width={W} height={ROW_H} fill="#fafbfc" />
            )}
            {/* Level label */}
            <text x={18} y={y + ROW_H / 2} fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {row.level}
            </text>
            {/* CUDA cell */}
            {row.cuda.split('\n').map((line, li) => (
              <text key={`c-${li}`} x={COL_X[0]} y={y + ROW_H / 2 - 6 + li * 13}
                textAnchor="middle" fontSize="7.5"
                fill={li === 0 ? COLORS.dark : '#64748b'} fontFamily={FONTS.sans}>
                {line}
              </text>
            ))}
            {/* Intel cell */}
            {row.intel.split('\n').map((line, li) => (
              <text key={`i-${li}`} x={COL_X[1]} y={y + ROW_H / 2 - 6 + li * 13}
                textAnchor="middle" fontSize="7.5"
                fill={li === 0 ? COLORS.dark : '#64748b'} fontFamily={FONTS.sans}>
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* Separator */}
      <line x1={W / 2} y1={48} x2={W / 2} y2={ROW_START + ROWS.length * ROW_H}
        stroke="#e2e8f0" strokeWidth={0.5} />

      {/* Key insight */}
      <rect x={40} y={H - 40} width={500} height={30} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={W / 2} y={H - 22} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        核心相同: HBM → SLM/smem (block tile) → Register (warp/sub-group tile) → 矩阵硬件 (TC/XMX)
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/IntelGemmCompare.tsx
git commit -m "feat: add IntelGemmCompare CUDA vs Intel GEMM tiling comparison"
```

---

### Task 13: MDX Article

**Files:**
- Create: `src/content/articles/zh/gemm-optimization.mdx`

**Context:** MDX article with 9 sections, importing all 12 components. Static components (GemmInTransformer, VectorLoadCompare, WmmaTilingDiagram, IntelGemmCompare) without client:visible. Interactive and StepNavigator components with client:visible. Prerequisites: [cuda-programming-model, matrix-acceleration]. Difficulty: advanced.

- [ ] **Step 1: Create MDX article**

```mdx
---
title: "GEMM 优化 — 从 Naive 到极致"
slug: gemm-optimization
locale: zh
tags: [gpu, gemm, cuda, optimization, tensor-core, xmx, intel]
prerequisites: [cuda-programming-model, matrix-acceleration]
difficulty: advanced
created: "2026-04-04"
updated: "2026-04-04"
references:
  - type: website
    title: "CUTLASS: Fast Linear Algebra in CUDA C++"
    url: "https://github.com/NVIDIA/cutlass"
  - type: website
    title: "How to Optimize a CUDA Matmul Kernel for cuBLAS-like Performance"
    url: "https://siboehm.com/articles/22/CUDA-MMM"
  - type: website
    title: "CUDA C++ Programming Guide — Warp Matrix Functions"
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#wmma"
  - type: website
    title: "Intel oneAPI DPC++ — joint_matrix Extension"
    url: "https://github.com/intel/llvm/blob/sycl/sycl/doc/extensions/experimental/sycl_ext_matrix.asciidoc"
  - type: paper
    title: "Dissecting the NVIDIA Volta GPU Architecture via Microbenchmarking"
    url: "https://arxiv.org/abs/1804.06826"
---

import GemmInTransformer from '../../../components/interactive/GemmInTransformer.tsx';
import ArithmeticIntensityCalc from '../../../components/interactive/ArithmeticIntensityCalc.tsx';
import NaiveGemmAnimation from '../../../components/interactive/NaiveGemmAnimation.tsx';
import TilingAnimation from '../../../components/interactive/TilingAnimation.tsx';
import ThreadTileAnimation from '../../../components/interactive/ThreadTileAnimation.tsx';
import ComputeToLoadRatio from '../../../components/interactive/ComputeToLoadRatio.tsx';
import VectorLoadCompare from '../../../components/interactive/VectorLoadCompare.tsx';
import DoubleBufPipeline from '../../../components/interactive/DoubleBufPipeline.tsx';
import WmmaTilingDiagram from '../../../components/interactive/WmmaTilingDiagram.tsx';
import TensorCoreGemmFlow from '../../../components/interactive/TensorCoreGemmFlow.tsx';
import PerformanceLadder from '../../../components/interactive/PerformanceLadder.tsx';
import IntelGemmCompare from '../../../components/interactive/IntelGemmCompare.tsx';

GEMM (General Matrix Multiply) 是 LLM 训练和推理中占比最高的计算操作。本文从最简单的 naive 实现出发，逐步添加优化 — tiling、thread tiling、向量化访存、双缓冲、Tensor Core — 直到接近 cuBLAS 的理论峰值性能。

## 1. 为什么 GEMM 是 LLM 的核心

Transformer 的每一层包含多个矩阵乘法: QKV 投影、attention score、output projection、FFN 的两个线性层。对于一个典型的 LLM (如 hidden_dim=4096)，超过 90% 的计算量来自这些 GEMM 操作。

<GemmInTransformer />

GEMM 的计算量为 $2MNK$ FLOPs (M、N、K 分别是矩阵 A、B、C 的维度)。对于大矩阵，arithmetic intensity (计算密度) 远高于 roofline 的 ridge point，属于 **compute-bound** — 这意味着理论上可以充分利用 GPU 的计算单元。

<ArithmeticIntensityCalc client:visible />

## 2. Naive 实现 — 基线

最简单的 CUDA GEMM: 每个线程计算输出矩阵 C 的一个元素。内循环沿 K 维做乘加:

```
C[row][col] = sum(A[row][k] * B[k][col]) for k = 0..K-1
```

每个输出元素需要从全局内存 (HBM) 读取 A 的一行 (K 个元素) 和 B 的一列 (K 个元素)，总共 $2MNK$ 次内存访问。

<NaiveGemmAnimation client:visible />

问题很明显: 同一行 A 数据被 C 的同一行的所有线程重复读取。$M \times N$ 个线程各自独立读取 — 大量冗余访存。

## 3. 优化 1 — Tiling + Shared Memory

核心思想: 把大矩阵切成 $\text{BLOCK\_SIZE} \times \text{BLOCK\_SIZE}$ 的 tile，每次从 HBM 加载一对 tile 到 shared memory，block 内所有线程共享复用。

全局内存访问从 $O(MNK)$ 降到 $O(MNK / \text{BLOCK\_SIZE})$ — 减少 BLOCK_SIZE 倍。

<TilingAnimation client:visible />

双重 `__syncthreads()` 确保: (1) 所有线程加载完 tile 后再开始计算; (2) 计算完当前 tile 后再加载下一个。

## 4. 优化 2 — Thread Tiling (每线程多元素)

Tiling 解决了 HBM 带宽问题，但 shared memory 带宽也会成为瓶颈。每线程只算 1 个元素时，内循环每步读 2 次 shared memory、做 1 次 FMA — compute:load 比只有 0.5。

Thread tiling: 每个线程负责 $TM \times TN$ 个输出元素 (如 4x4=16 个)。A 的 TM 个值和 B 的 TN 个值加载到**寄存器**后，产生 $TM \times TN$ 次 FMA — compute:load 比提升到 $\frac{TM \times TN}{TM + TN}$。

<ThreadTileAnimation client:visible />

<ComputeToLoadRatio client:visible />

## 5. 优化 3 — 向量化访存

GPU 内存总线支持 32/64/128-bit 宽度的 load 指令。使用 `float4` (128-bit) 一次加载 4 个 float，比 4 次标量 load 减少 3/4 的指令调度开销。

<VectorLoadCompare />

要求数据地址 128-bit 对齐。在 tiling 中，tile 的起始地址通常自然对齐。

## 6. 优化 4 — 双缓冲 Prefetch

计算当前 tile 时，同时预加载下一个 tile — 重叠访存和计算延迟。

<DoubleBufPipeline client:visible />

## 7. 优化 5 — Tensor Core GEMM

从 CUDA Core 切换到 Tensor Core: 使用 WMMA (Warp Matrix Multiply-Accumulate) API，一条 warp 级指令完成 $16 \times 16 \times 16$ 的矩阵块乘加。

仍然需要 block 级 tiling (shared memory) — Tensor Core 只是替换了最内层的计算单元。

<WmmaTilingDiagram />

WMMA 的三步流程: `load_matrix_sync` (shared memory → register fragment) → `mma_sync` (Tensor Core 执行) → `store_matrix_sync` (写回)。

<TensorCoreGemmFlow client:visible />

FP16 输入 + FP32 累加 = 精度损失可控 + 吞吐量提升 4-8 倍。

## 8. 性能阶梯总结

每步优化带来的性能提升 (以 H100 上 4096x4096 为参考):

<PerformanceLadder client:visible />

从 naive 的不到 1% 利用率，到 Tensor Core 接近 90% — 核心思路始终是: **减少内存访问 → 提高数据复用 → 利用专用硬件**。

## 9. Intel iGPU 上的 GEMM

Intel Xe2 (Lunar Lake / Panther Lake) 的 GEMM 优化思路与 CUDA 完全相同 — 只是术语和 API 不同:

<IntelGemmCompare />

核心映射: shared memory → SLM、warp → sub-group、Tensor Core → XMX、wmma → joint_matrix。优化的本质不变: 数据从远存搬到近存，在最快的存储层级上最大化复用。
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds with new page count.

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/gemm-optimization.mdx
git commit -m "feat: add GEMM Optimization article with 12 interactive components"
```

---

### Task 14: YAML Learning Path Update

**Files:**
- Modify: `src/content/paths/ai-compute-stack.yaml`

**Context:** Add `gemm-optimization` after `cuda-programming-model` in the articles list.

- [ ] **Step 1: Update YAML**

Add `- gemm-optimization` to the articles list in `src/content/paths/ai-compute-stack.yaml`:

```yaml
articles:
  - ai-compute-stack
  - gpu-architecture
  - matrix-acceleration
  - cuda-programming-model
  - gemm-optimization
```

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/ai-compute-stack.yaml
git commit -m "feat: add gemm-optimization to AI Compute Stack learning path"
```
