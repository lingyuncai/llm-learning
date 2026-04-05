# Quantization Learning Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a "Quantization" learning path with 5 articles (4 new + 1 rename/expand), 16 new interactive components, and 1 learning path YAML. All components use principle-level SVG diagrams to build intuition.

**Architecture:** Each article lives in `src/content/articles/zh/` as MDX. Components live in `src/components/interactive/` as React TSX (static SVG, StepNavigator, or useState-interactive). Components import `COLORS`/`FONTS` from `./shared/colors` and use `const W = 580` standard width. StepNavigator components import from `../primitives/StepNavigator`. Learning path defined in `src/content/paths/quantization.yaml`.

**Tech Stack:** Astro 5 + MDX + React + TypeScript + SVG + StepNavigator primitive

**Spec:** `docs/superpowers/specs/2026-04-05-quantization-learning-path-design.md`

---

## File Structure

### New Files
- `src/content/paths/quantization.yaml` — learning path definition
- `src/content/articles/zh/quantization-fundamentals.mdx` — Article 1
- `src/content/articles/zh/ptq-weight-quantization.mdx` — Article 2
- `src/content/articles/zh/quantization-aware-training.mdx` — Article 3
- `src/content/articles/zh/inference-time-quantization.mdx` — Article 4
- `src/components/interactive/DataTypeBitLayout.tsx` — Article 1 component
- `src/components/interactive/QuantizationMapping.tsx` — Article 1 component
- `src/components/interactive/GranularityCompare.tsx` — Article 1 component
- `src/components/interactive/HardwareComputePath.tsx` — Article 1 component
- `src/components/interactive/GPTQErrorPropagation.tsx` — Article 2 component
- `src/components/interactive/AWQSalientChannels.tsx` — Article 2 component
- `src/components/interactive/SmoothQuantTransform.tsx` — Article 2 component
- `src/components/interactive/PTQMethodComparison.tsx` — Article 2 component
- `src/components/interactive/FakeQuantForwardBackward.tsx` — Article 3 component
- `src/components/interactive/BitNetArithmetic.tsx` — Article 3 component
- `src/components/interactive/QATvsPTQBoundary.tsx` — Article 3 component
- `src/components/interactive/KVCacheMemoryCalculator.tsx` — Article 4 component
- `src/components/interactive/KVQuantSensitivity.tsx` — Article 4 component
- `src/components/interactive/ActivationOutlierViz.tsx` — Article 4 component
- `src/components/interactive/E2EQuantStackDiagram.tsx` — Article 4 component
- `src/components/interactive/Q4KMBitPacking.tsx` — Article 5 component

### Modified Files
- `src/content/articles/zh/ollama-quantization.mdx` → rename to `llama-cpp-quantization.mdx` + expand
- `src/content/paths/ollama-internals.yaml` — update slug reference
- `src/content/articles/zh/ollama-compute-graph.mdx` — update prerequisite

---

### Task 0: Rename ollama-quantization → llama-cpp-quantization

**Files:**
- Rename: `src/content/articles/zh/ollama-quantization.mdx` → `src/content/articles/zh/llama-cpp-quantization.mdx`
- Modify: `src/content/paths/ollama-internals.yaml:13`
- Modify: `src/content/articles/zh/ollama-compute-graph.mdx:6`

- [ ] **Step 1: Rename the article file**

```bash
cd /c/workspace/llm-learning
mv src/content/articles/zh/ollama-quantization.mdx src/content/articles/zh/llama-cpp-quantization.mdx
```

- [ ] **Step 2: Update frontmatter in the renamed file**

In `src/content/articles/zh/llama-cpp-quantization.mdx`, update frontmatter:

```yaml
---
title: "llama.cpp 量化方案"
slug: "llama-cpp-quantization"
locale: "zh"
tags: ["quantization", "llama-cpp", "gguf", "inference-optimization"]
prerequisites: ["quantization-fundamentals", "gguf-format"]
difficulty: "advanced"
created: "2026-04-04"
updated: "2026-04-05"
references:
  - type: "repo"
    title: "llama.cpp Quantization Types"
    url: "https://github.com/ggerganov/llama.cpp/blob/master/ggml/include/ggml.h"
  - type: "repo"
    title: "K-quant PR"
    url: "https://github.com/ggerganov/llama.cpp/pull/1684"
  - type: "paper"
    title: "GPTQ: Accurate Post-Training Quantization"
    url: "https://arxiv.org/abs/2210.17323"
  - type: "paper"
    title: "AWQ: Activation-aware Weight Quantization"
    url: "https://arxiv.org/abs/2306.00978"
---
```

Changes from original:
- `title`: `"量化方案"` → `"llama.cpp 量化方案"`
- `slug`: `"ollama-quantization"` → `"llama-cpp-quantization"`
- `prerequisites`: `["gguf-format"]` → `["quantization-fundamentals", "gguf-format"]`
- `updated`: `"2026-04-04"` → `"2026-04-05"`

- [ ] **Step 3: Update ollama-internals.yaml**

In `src/content/paths/ollama-internals.yaml`, change line 13:

```yaml
# Before:
  - ollama-quantization
# After:
  - llama-cpp-quantization
```

- [ ] **Step 4: Update ollama-compute-graph.mdx prerequisite**

In `src/content/articles/zh/ollama-compute-graph.mdx`, update prerequisites:

```yaml
# Before:
prerequisites: ["ollama-quantization"]
# After:
prerequisites: ["llama-cpp-quantization"]
```

- [ ] **Step 5: Validate**

```bash
npm run validate
```

Expected: PASS (all slug references resolve correctly)

- [ ] **Step 6: Commit**

```bash
git add src/content/articles/zh/llama-cpp-quantization.mdx src/content/paths/ollama-internals.yaml src/content/articles/zh/ollama-compute-graph.mdx
git rm src/content/articles/zh/ollama-quantization.mdx
git commit -m "refactor: rename ollama-quantization to llama-cpp-quantization"
```

---

### Task 1: Create Quantization Learning Path YAML

**Files:**
- Create: `src/content/paths/quantization.yaml`

- [ ] **Step 1: Create the learning path file**

```yaml
id: quantization
title:
  zh: "LLM 量化技术"
  en: "LLM Quantization Techniques"
description:
  zh: "从数据类型基础到前沿量化算法，系统掌握 LLM 权重量化、KV Cache 量化和推理时量化的理论与实践"
  en: "From data type fundamentals to cutting-edge quantization algorithms — weight quantization, KV cache quantization, and inference-time quantization"
level: intermediate
articles:
  - quantization-fundamentals
  - ptq-weight-quantization
  - quantization-aware-training
  - inference-time-quantization
  - llama-cpp-quantization
```

- [ ] **Step 2: Validate**

```bash
npm run validate
```

Expected: PASS (articles don't exist yet but YAML structure is valid)

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/quantization.yaml
git commit -m "feat: add quantization learning path definition"
```

---

### Task 2: DataTypeBitLayout Component

**Files:**
- Create: `src/components/interactive/DataTypeBitLayout.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

interface DataType {
  name: string;
  fields: { label: string; bits: number; color: string }[];
  totalBits: number;
  range: string;
  precision: string;
  example: string;
}

const DATA_TYPES: DataType[] = [
  {
    name: 'FP32',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exponent', bits: 8, color: COLORS.primary },
      { label: 'Mantissa', bits: 23, color: COLORS.green },
    ],
    totalBits: 32,
    range: '±3.4×10³⁸',
    precision: '~7.2 位有效数字',
    example: '1.0 = 0 01111111 00000000000000000000000',
  },
  {
    name: 'FP16',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exp', bits: 5, color: COLORS.primary },
      { label: 'Mantissa', bits: 10, color: COLORS.green },
    ],
    totalBits: 16,
    range: '±65504',
    precision: '~3.3 位有效数字',
    example: '1.0 = 0 01111 0000000000',
  },
  {
    name: 'BF16',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exponent', bits: 8, color: COLORS.primary },
      { label: 'Mantissa', bits: 7, color: COLORS.green },
    ],
    totalBits: 16,
    range: '±3.4×10³⁸',
    precision: '~2.4 位有效数字',
    example: '1.0 = 0 01111111 0000000',
  },
  {
    name: 'INT8',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Value', bits: 7, color: COLORS.purple },
    ],
    totalBits: 8,
    range: '[-128, 127]',
    precision: '精确整数',
    example: '42 = 0 0101010',
  },
  {
    name: 'INT4',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Value', bits: 3, color: COLORS.purple },
    ],
    totalBits: 4,
    range: '[-8, 7]',
    precision: '精确整数 (16 个值)',
    example: '5 = 0 101',
  },
  {
    name: 'FP8 E4M3',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exp', bits: 4, color: COLORS.primary },
      { label: 'Man', bits: 3, color: COLORS.green },
    ],
    totalBits: 8,
    range: '±448',
    precision: '~1.6 位有效数字',
    example: '1.0 = 0 0111 000',
  },
  {
    name: 'FP8 E5M2',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exp', bits: 5, color: COLORS.primary },
      { label: 'M', bits: 2, color: COLORS.green },
    ],
    totalBits: 8,
    range: '±57344',
    precision: '~1 位有效数字',
    example: '1.0 = 0 01111 00',
  },
];

export default function DataTypeBitLayout() {
  const [selected, setSelected] = useState(0);
  const dt = DATA_TYPES[selected];

  const bitBoxW = Math.min(16, (W - 80) / dt.totalBits);
  const startX = (W - dt.totalBits * bitBoxW) / 2;
  const bitY = 100;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Type selector buttons */}
      {DATA_TYPES.map((t, i) => {
        const bx = 15 + i * 80;
        return (
          <g key={t.name} onClick={() => setSelected(i)} cursor="pointer">
            <rect x={bx} y={10} width={74} height={24} rx={4}
              fill={i === selected ? COLORS.primary : COLORS.bgAlt}
              stroke={i === selected ? COLORS.primary : COLORS.light}
              strokeWidth={1} />
            <text x={bx + 37} y={26} textAnchor="middle" fontSize="8"
              fontWeight={i === selected ? '700' : '400'}
              fill={i === selected ? '#fff' : COLORS.mid}
              fontFamily={FONTS.sans}>{t.name}</text>
          </g>
        );
      })}

      {/* Title */}
      <text x={W / 2} y={60} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {dt.name} — {dt.totalBits} bits
      </text>

      {/* Bit boxes */}
      {(() => {
        let bitIdx = 0;
        return dt.fields.map((field) => {
          const elements = [];
          for (let b = 0; b < field.bits; b++) {
            const x = startX + bitIdx * bitBoxW;
            elements.push(
              <rect key={bitIdx} x={x} y={bitY} width={bitBoxW - 1} height={28}
                rx={2} fill={field.color} opacity={0.2}
                stroke={field.color} strokeWidth={1} />
            );
            bitIdx++;
          }
          const labelX = startX + (bitIdx - field.bits / 2) * bitBoxW;
          elements.push(
            <text key={`label-${field.label}`} x={labelX - bitBoxW / 2}
              y={bitY + 48} textAnchor="middle" fontSize="8" fontWeight="600"
              fill={field.color} fontFamily={FONTS.sans}>
              {field.label} ({field.bits})
            </text>
          );
          return elements;
        });
      })()}

      {/* Legend */}
      {[
        { label: 'Sign', color: COLORS.red },
        { label: 'Exponent', color: COLORS.primary },
        { label: 'Mantissa/Value', color: COLORS.green },
      ].map((item, i) => (
        <g key={item.label}>
          <rect x={140 + i * 140} y={170} width={10} height={10} rx={2}
            fill={item.color} opacity={0.3} stroke={item.color} strokeWidth={1} />
          <text x={154 + i * 140} y={179} fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>{item.label}</text>
        </g>
      ))}

      {/* Info panel */}
      <rect x={40} y={195} width={W - 80} height={110} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
      <text x={60} y={218} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
        <tspan fontWeight="600">表示范围: </tspan>{dt.range}
      </text>
      <text x={60} y={238} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
        <tspan fontWeight="600">精度: </tspan>{dt.precision}
      </text>
      <text x={60} y={258} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
        <tspan fontWeight="600">编码示例: </tspan>
      </text>
      <text x={60} y={278} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
        {dt.example}
      </text>

      {/* BF16 vs FP16 hint */}
      {(dt.name === 'BF16' || dt.name === 'FP16') && (
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="7" fill={COLORS.orange}
          fontFamily={FONTS.sans}>
          {dt.name === 'BF16'
            ? 'BF16 与 FP32 相同的 8-bit exponent — 相同的动态范围，但 mantissa 仅 7 位'
            : 'FP16 仅 5-bit exponent — 动态范围有限，但 10-bit mantissa 精度更高'}
        </text>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

Open browser, navigate to any page that could import this component, verify no build errors.

---

### Task 3: QuantizationMapping Component

**Files:**
- Create: `src/components/interactive/QuantizationMapping.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useState, useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

const WEIGHTS = [
  -0.82, -0.61, -0.45, -0.33, -0.21, -0.12, -0.04, 0.08,
  0.15, 0.27, 0.35, 0.49, 0.56, 0.68, 0.74, 0.91,
];

export default function QuantizationMapping() {
  const [symmetric, setSymmetric] = useState(true);

  const { scale, zeroPoint, qMin, qMax, quantized, dequantized, errors } = useMemo(() => {
    const qMin = symmetric ? -7 : 0;
    const qMax = symmetric ? 7 : 15;
    const wMin = Math.min(...WEIGHTS);
    const wMax = Math.max(...WEIGHTS);

    let scale: number;
    let zeroPoint: number;
    if (symmetric) {
      scale = Math.max(Math.abs(wMin), Math.abs(wMax)) / qMax;
      zeroPoint = 0;
    } else {
      scale = (wMax - wMin) / (qMax - qMin);
      zeroPoint = Math.round(qMin - wMin / scale);
    }

    const quantized = WEIGHTS.map(w =>
      Math.max(qMin, Math.min(qMax, Math.round(w / scale + zeroPoint)))
    );
    const dequantized = quantized.map(q => (q - zeroPoint) * scale);
    const errors = WEIGHTS.map((w, i) => Math.abs(w - dequantized[i]));

    return { scale, zeroPoint, qMin, qMax, quantized, dequantized, errors };
  }, [symmetric]);

  const plotW = 480;
  const plotX = 50;
  const plotH = 100;
  const wMin = Math.min(...WEIGHTS) - 0.15;
  const wMax = Math.max(...WEIGHTS) + 0.15;
  const toX = (v: number) => plotX + ((v - wMin) / (wMax - wMin)) * plotW;
  const dotY = (i: number) => 45 + (i / WEIGHTS.length) * plotH;

  const modeToggle = (
    <g>
      {['对称', '非对称'].map((label, i) => (
        <g key={label} onClick={() => setSymmetric(i === 0)} cursor="pointer">
          <rect x={200 + i * 90} y={4} width={80} height={20} rx={4}
            fill={(i === 0) === symmetric ? COLORS.primary : COLORS.bgAlt}
            stroke={COLORS.primary} strokeWidth={1} />
          <text x={240 + i * 90} y={18} textAnchor="middle" fontSize="8"
            fontWeight="600" fill={(i === 0) === symmetric ? '#fff' : COLORS.primary}
            fontFamily={FONTS.sans}>{label}</text>
        </g>
      ))}
    </g>
  );

  const steps = [
    {
      title: 'Step 1: FP16 权重分布',
      content: (
        <svg viewBox={`0 0 ${W} 195`} className="w-full">
          {modeToggle}
          {WEIGHTS.map((w, i) => (
            <circle key={i} cx={toX(w)} cy={dotY(i)} r={4}
              fill={COLORS.primary} opacity={0.7} />
          ))}
          <line x1={plotX} y1={155} x2={plotX + plotW} y2={155}
            stroke={COLORS.mid} strokeWidth={0.5} />
          <line x1={toX(0)} y1={35} x2={toX(0)} y2={160}
            stroke={COLORS.mid} strokeWidth={0.5} strokeDasharray="3,2" />
          <text x={toX(0)} y={172} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.mono}>0</text>
          <text x={W / 2} y={190} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>FP16 权重值 (连续分布)</text>
        </svg>
      ),
    },
    {
      title: 'Step 2: 计算 scale 和量化网格',
      content: (
        <svg viewBox={`0 0 ${W} 195`} className="w-full">
          {modeToggle}
          <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.mono}>
            {symmetric
              ? `scale = max(|w|) / 7 = ${scale.toFixed(4)}, zero_point = 0`
              : `scale = (max-min) / 15 = ${scale.toFixed(4)}, zero_point = ${zeroPoint}`}
          </text>
          {Array.from({ length: qMax - qMin + 1 }, (_, i) => {
            const qVal = qMin + i;
            const wVal = (qVal - zeroPoint) * scale;
            if (wVal < wMin || wVal > wMax) return null;
            return (
              <g key={qVal}>
                <line x1={toX(wVal)} y1={48} x2={toX(wVal)} y2={150}
                  stroke={COLORS.orange} strokeWidth={0.5} strokeDasharray="2,2" opacity={0.5} />
                <text x={toX(wVal)} y={164} textAnchor="middle" fontSize="6"
                  fill={COLORS.orange} fontFamily={FONTS.mono}>{qVal}</text>
              </g>
            );
          })}
          {WEIGHTS.map((w, i) => (
            <circle key={i} cx={toX(w)} cy={dotY(i) + 5} r={3}
              fill={COLORS.primary} opacity={0.6} />
          ))}
          <text x={W / 2} y={185} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>橙色虚线 = 量化级别 (整数网格)</text>
        </svg>
      ),
    },
    {
      title: 'Step 3: 映射到最近网格线 (Rounding)',
      content: (
        <svg viewBox={`0 0 ${W} 195`} className="w-full">
          {modeToggle}
          {Array.from({ length: qMax - qMin + 1 }, (_, i) => {
            const qVal = qMin + i;
            const wVal = (qVal - zeroPoint) * scale;
            if (wVal < wMin || wVal > wMax) return null;
            return (
              <line key={qVal} x1={toX(wVal)} y1={30} x2={toX(wVal)} y2={145}
                stroke={COLORS.orange} strokeWidth={0.5} strokeDasharray="2,2" opacity={0.3} />
            );
          })}
          {WEIGHTS.map((w, i) => {
            const dq = dequantized[i];
            return (
              <g key={i}>
                <circle cx={toX(w)} cy={dotY(i)} r={3} fill={COLORS.primary} opacity={0.4} />
                <circle cx={toX(dq)} cy={dotY(i)} r={3} fill={COLORS.orange} />
                <line x1={toX(w)} y1={dotY(i)} x2={toX(dq)} y2={dotY(i)}
                  stroke={COLORS.red} strokeWidth={0.8} opacity={0.5} />
              </g>
            );
          })}
          <text x={W / 2} y={165} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>蓝 = 原始值, 橙 = 量化后值, 红线 = rounding 误差</text>
          <text x={W / 2} y={185} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            q[i] = round(w[i] / scale{symmetric ? '' : ' + zero_point'})
          </text>
        </svg>
      ),
    },
    {
      title: 'Step 4: 反量化与误差分析',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          {modeToggle}
          <text x={15} y={42} fontSize="7" fontWeight="600" fill={COLORS.dark}
            fontFamily={FONTS.sans}>量化误差 |w - ŵ|</text>
          {WEIGHTS.map((_w, i) => {
            const maxErr = Math.max(...errors);
            const barH = maxErr > 0 ? (errors[i] / maxErr) * 50 : 0;
            const bx = 30 + i * 34;
            return (
              <g key={i}>
                <rect x={bx} y={65 - barH} width={28} height={barH} rx={2}
                  fill={errors[i] > scale * 0.4 ? COLORS.red : COLORS.green} opacity={0.6} />
                <text x={bx + 14} y={80} textAnchor="middle" fontSize="5.5"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>{errors[i].toFixed(3)}</text>
              </g>
            );
          })}
          <rect x={40} y={100} width={W - 80} height={55} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={60} y={120} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
            <tspan fontWeight="600">反量化: </tspan>
            ŵ[i] = {symmetric ? 'q[i] × scale' : '(q[i] - zero_point) × scale'}
          </text>
          <text x={60} y={140} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
            <tspan fontWeight="600">MSE: </tspan>
            {(errors.reduce((a, b) => a + b * b, 0) / errors.length).toFixed(6)}
            <tspan dx={20} fontWeight="600">Max Error: </tspan>
            {Math.max(...errors).toFixed(4)}
          </text>
          <text x={W / 2} y={180} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
            fontFamily={FONTS.sans}>
            {symmetric
              ? '对称量化: 简单高效, 适合近似对称的权重分布'
              : '非对称量化: 额外存储 zero_point, 适合偏移分布 (如 activation)'}
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

### Task 4: GranularityCompare Component

**Files:**
- Create: `src/components/interactive/GranularityCompare.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 350;
const ROWS = 8;
const COLS = 8;

// Weight matrix with outlier channels (rows 2 and 6) to show granularity impact
const WEIGHT_MATRIX = [
  [0.23, -0.87, 0.45, -0.12, 0.91, -0.34, 0.67, -0.55],
  [0.11, -0.99, 0.38, -0.63, 0.82, -0.47, 0.15, -0.73],
  [3.45, -2.89, 3.12, -2.67, 3.78, -2.34, 3.56, -2.91],
  [0.33, -0.61, 0.72, -0.18, 0.88, -0.42, 0.59, -0.95],
  [0.08, -0.21, 0.14, -0.07, 0.19, -0.15, 0.11, -0.23],
  [0.56, -0.29, 0.94, -0.08, 0.41, -0.86, 0.78, -0.45],
  [-1.92, 1.78, -1.56, 1.34, -1.89, 1.67, -1.45, 1.23],
  [0.38, -0.67, 0.52, -0.31, 0.84, -0.19, 0.63, -0.48],
];

function quantize(val: number, scale: number): number {
  const q = Math.max(-8, Math.min(7, Math.round(val / scale)));
  return q * scale;
}

export default function GranularityCompare() {
  const [groupSize, setGroupSize] = useState(4);

  const results = useMemo(() => {
    const flat = WEIGHT_MATRIX.flat();

    // Per-tensor: single scale
    const tensorScale = Math.max(...flat.map(Math.abs)) / 7;
    const tensorErrors = WEIGHT_MATRIX.map(row =>
      row.map(w => Math.abs(w - quantize(w, tensorScale)))
    );
    const tensorMSE = flat.reduce((s, w) =>
      s + (w - quantize(w, tensorScale)) ** 2, 0) / flat.length;

    // Per-channel: one scale per row
    const channelErrors = WEIGHT_MATRIX.map(row => {
      const s = Math.max(...row.map(Math.abs)) / 7;
      return row.map(w => Math.abs(w - quantize(w, s)));
    });
    const channelMSE = WEIGHT_MATRIX.flatMap(row => {
      const s = Math.max(...row.map(Math.abs)) / 7;
      return row.map(w => (w - quantize(w, s)) ** 2);
    }).reduce((a, b) => a + b, 0) / flat.length;

    // Per-group
    const groupErrors = WEIGHT_MATRIX.map(row => {
      const errs: number[] = [];
      for (let g = 0; g < row.length; g += groupSize) {
        const group = row.slice(g, g + groupSize);
        const s = Math.max(...group.map(Math.abs)) / 7;
        group.forEach(w => errs.push(Math.abs(w - quantize(w, s))));
      }
      return errs;
    });
    const groupMSE = groupErrors.flat().reduce((a, b) => a + b * b, 0) / flat.length;

    return { tensorErrors, channelErrors, groupErrors, tensorMSE, channelMSE, groupMSE };
  }, [groupSize]);

  const maxError = Math.max(
    ...results.tensorErrors.flat(),
    ...results.channelErrors.flat(),
    ...results.groupErrors.flat(),
    0.001
  );

  function errorColor(err: number): string {
    const ratio = err / maxError;
    if (ratio < 0.2) return '#c8e6c9';
    if (ratio < 0.5) return '#fff9c4';
    return '#ffcdd2';
  }

  const cellSize = 18;
  const matrixW = COLS * cellSize;
  const gap = 22;
  const totalW = 3 * matrixW + 2 * gap;
  const offsetBase = (W - totalW) / 2;
  const offsets = [offsetBase, offsetBase + matrixW + gap, offsetBase + 2 * (matrixW + gap)];
  const startY = 55;

  function renderMatrix(errors: number[][], ox: number) {
    return errors.map((row, r) =>
      row.map((err, c) => (
        <rect key={`${r}-${c}`} x={ox + c * cellSize} y={startY + r * cellSize}
          width={cellSize - 1} height={cellSize - 1} rx={2}
          fill={errorColor(err)} stroke={COLORS.light} strokeWidth={0.5} />
      ))
    );
  }

  const labels = ['Per-Tensor', 'Per-Channel', `Per-Group (${groupSize})`];
  const mses = [results.tensorMSE, results.channelMSE, results.groupMSE];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        量化粒度对比 — 误差热力图
      </text>

      {[0, 1, 2].map(col => (
        <g key={col}>
          <text x={offsets[col] + matrixW / 2} y={48} textAnchor="middle" fontSize="9"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {labels[col]}
          </text>
          {renderMatrix(
            [results.tensorErrors, results.channelErrors, results.groupErrors][col],
            offsets[col]
          )}
          <text x={offsets[col] + matrixW / 2} y={startY + ROWS * cellSize + 16}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            MSE: {mses[col].toFixed(5)}
          </text>
        </g>
      ))}

      {/* Group size selector */}
      <text x={15} y={startY + ROWS * cellSize + 46} fontSize="8" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Group Size:</text>
      {[2, 4, 8].map((gs, i) => (
        <g key={gs} onClick={() => setGroupSize(gs)} cursor="pointer">
          <rect x={100 + i * 55} y={startY + ROWS * cellSize + 34} width={45} height={20}
            rx={4} fill={gs === groupSize ? COLORS.primary : COLORS.bgAlt}
            stroke={COLORS.primary} strokeWidth={1} />
          <text x={122 + i * 55} y={startY + ROWS * cellSize + 48} textAnchor="middle"
            fontSize="8" fontWeight="600"
            fill={gs === groupSize ? '#fff' : COLORS.primary}
            fontFamily={FONTS.sans}>{gs}</text>
        </g>
      ))}

      {/* Legend */}
      {[
        { label: '低误差', color: '#c8e6c9' },
        { label: '中等', color: '#fff9c4' },
        { label: '高误差', color: '#ffcdd2' },
      ].map((item, i) => (
        <g key={item.label}>
          <rect x={350 + i * 70} y={startY + ROWS * cellSize + 34}
            width={12} height={12} rx={2} fill={item.color} />
          <text x={366 + i * 70} y={startY + ROWS * cellSize + 45} fontSize="7"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{item.label}</text>
        </g>
      ))}

      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
        fontFamily={FONTS.sans}>
        粒度越细 → 每组独立 scale → 误差越小 → 但 metadata 开销越大 (llama.cpp block=32)
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

### Task 5: HardwareComputePath Component

**Files:**
- Create: `src/components/interactive/HardwareComputePath.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function HardwareComputePath() {
  const leftX = 55;
  const rightX = 320;
  const colW = 195;

  function Box({ x, y, w, h, label, color, sub }: {
    x: number; y: number; w: number; h: number;
    label: string; color: string; sub?: string;
  }) {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={6}
          fill={color} opacity={0.12} stroke={color} strokeWidth={1.5} />
        <text x={x + w / 2} y={y + h / 2 + (sub ? -4 : 3)} textAnchor="middle"
          fontSize="8.5" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
          {label}
        </text>
        {sub && (
          <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
            fontSize="7" fill={color} opacity={0.7} fontFamily={FONTS.sans}>
            {sub}
          </text>
        )}
      </g>
    );
  }

  function Arrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
    return (
      <g>
        <line x1={x} y1={y1} x2={x} y2={y2 - 6} stroke={color} strokeWidth={1.2} />
        <polygon points={`${x - 4},${y2 - 8} ${x + 4},${y2 - 8} ${x},${y2}`} fill={color} />
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        反量化路径 vs 原生低精度路径
      </text>

      {/* Left: Dequant path */}
      <text x={leftX + colW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.mid} fontFamily={FONTS.sans}>Dequant 路径</text>

      <Box x={leftX} y={60} w={colW} h={32} label="INT4 Weight (存储)" color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={92} y2={108} color={COLORS.mid} />
      <text x={leftX + colW + 8} y={103} fontSize="6.5" fill={COLORS.mid}
        fontFamily={FONTS.sans} fontStyle="italic">dequantize</text>

      <Box x={leftX} y={108} w={colW} h={32} label="FP16 Weight (运行时还原)" color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={140} y2={156} color={COLORS.mid} />

      <Box x={leftX} y={156} w={colW} h={32} label="FP16 GEMM" color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={188} y2={204} color={COLORS.mid} />

      <Box x={leftX} y={204} w={colW} h={32} label="FP16 Output" color={COLORS.mid} />

      <text x={leftX + colW / 2} y={255} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>CPU, 老 GPU, Metal</text>
      <text x={leftX + colW / 2} y={270} textAnchor="middle" fontSize="7" fill={COLORS.red}
        fontFamily={FONTS.sans}>dequant 有额外开销</text>

      {/* Right: Native path */}
      <text x={rightX + colW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>原生低精度路径</text>

      <Box x={rightX} y={60} w={92} h={32} label="INT8 Weight" color={COLORS.primary} />
      <Box x={rightX + 102} y={60} w={93} h={32} label="INT8 Activ." color={COLORS.green} />
      <Arrow x={rightX + colW / 2} y1={92} y2={108} color={COLORS.primary} />

      <Box x={rightX} y={108} w={colW} h={32}
        label="INT8 GEMM (Tensor Core)" color={COLORS.primary} />
      <Arrow x={rightX + colW / 2} y1={140} y2={156} color={COLORS.primary} />

      <Box x={rightX} y={156} w={colW} h={32}
        label="INT32 Accumulate" color={COLORS.primary} sub="防溢出" />
      <Arrow x={rightX + colW / 2} y1={188} y2={204} color={COLORS.primary} />

      <Box x={rightX} y={204} w={colW} h={32} label="FP16 Output" color={COLORS.primary} />

      <text x={rightX + colW / 2} y={255} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>H100/A100, Apple ANE, Intel AMX</text>
      <text x={rightX + colW / 2} y={270} textAnchor="middle" fontSize="7" fill={COLORS.green}
        fontFamily={FONTS.sans}>无 dequant 开销, 吞吐量 2x</text>

      {/* Divider */}
      <line x1={W / 2} y1={50} x2={W / 2} y2={280}
        stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />

      {/* Bottom insight */}
      <rect x={40} y={295} width={W - 80} height={70} rx={6}
        fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
      <text x={W / 2} y={316} textAnchor="middle" fontSize="8.5" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>
        量化不仅节省存储 — 在原生支持的硬件上还能跳过 dequant, 直接加速计算
      </text>
      <text x={W / 2} y={334} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        FP8: H100 Tensor Core 原生支持 | INT8: A100/H100, Intel AMX/VNNI | INT4: Apple ANE
      </text>
      <text x={W / 2} y={350} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        选择量化方案时需考虑目标硬件是否支持原生低精度计算
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

### Task 6: quantization-fundamentals Article

**Files:**
- Create: `src/content/articles/zh/quantization-fundamentals.mdx`

- [ ] **Step 1: Write the article**

```mdx
---
title: "量化基础"
slug: "quantization-fundamentals"
locale: "zh"
tags: ["quantization", "data-types", "mixed-precision", "inference-optimization"]
prerequisites: []
difficulty: "intermediate"
created: "2026-04-05"
updated: "2026-04-05"
references:
  - type: "paper"
    title: "A Survey of Quantization Methods for Efficient Neural Network Inference"
    url: "https://arxiv.org/abs/2103.13630"
  - type: "paper"
    title: "Integer Quantization for Deep Learning Inference: Principles and Empirical Evaluation"
    url: "https://arxiv.org/abs/2004.09602"
  - type: "paper"
    title: "FP8 Formats for Deep Learning"
    url: "https://arxiv.org/abs/2209.05433"
---

import DataTypeBitLayout from '../../../components/interactive/DataTypeBitLayout.tsx';
import QuantizationMapping from '../../../components/interactive/QuantizationMapping.tsx';
import GranularityCompare from '../../../components/interactive/GranularityCompare.tsx';
import HardwareComputePath from '../../../components/interactive/HardwareComputePath.tsx';

量化 (Quantization) 是 LLM 推理优化的核心技术——通过降低权重和激活值的数值精度 (如 FP16 → INT4)，实现 2-4 倍的显存节省和推理加速。本文从数据类型基础出发，建立量化的完整理论框架：量化的数学本质是什么？对称和非对称有什么区别？粒度选择如何影响精度？硬件是否支持原生低精度计算？这些基础概念是理解后续 PTQ、QAT、KV Cache 量化等高级话题的前提。

## 数据类型全景

LLM 推理涉及的数据类型跨越 32 位到 4 位，每种类型在表示范围 (dynamic range) 和精度 (precision) 之间做不同的权衡。理解它们的 bit 级结构是量化的第一步。

浮点类型 (FP32, FP16, BF16, FP8) 由 sign + exponent + mantissa 三部分组成，exponent 决定动态范围，mantissa 决定精度。关键对比：

- **FP16 vs BF16**: BF16 ("Brain Floating Point") 保留了 FP32 的 8-bit exponent，动态范围相同 ($\pm 3.4 \times 10^{38}$)，但 mantissa 仅 7 位 (精度约 2.4 位有效数字)。FP16 的 5-bit exponent 限制了范围 ($\pm 65504$)，但 10-bit mantissa 精度更高。实践中 BF16 更适合训练 (不会 overflow)，FP16 更适合需要精度的推理场景。
- **FP8 的两种格式**: E4M3 (4-bit exponent + 3-bit mantissa) 精度更高，用于前向传播的 weight 和 activation；E5M2 (5-bit exponent + 2-bit mantissa) 范围更大，用于反向传播的 gradient。NVIDIA H100/H200 原生支持两种格式。

整数类型 (INT8, INT4) 没有 exponent/mantissa 之分，所有 bit 表示一个精确整数值。优点是计算简单、硬件实现高效；缺点是无法表示浮点数的非均匀分布——需要配合 scale factor 使用。

<DataTypeBitLayout client:visible />

## 量化的数学本质

量化的核心操作是将连续浮点值映射到离散整数：

$$q = \text{clip}\left(\text{round}\left(\frac{x}{s}\right) + z, \; q_{\min}, \; q_{\max}\right)$$

其中 $s$ 是 scale factor (缩放因子)，$z$ 是 zero-point (零点偏移)，$q_{\min}$ 和 $q_{\max}$ 是量化值的范围。反量化 (dequantization) 将离散值还原回浮点近似：

$$\hat{x} = s \cdot (q - z)$$

量化误差有两个来源：**rounding error** (round 操作将精确商截断到最近整数) 和 **clipping error** (clip 操作将超出范围的值截断到边界)。

### 对称 vs 非对称量化

- **对称量化**: $z = 0$，$s = \max(|x|) / q_{\max}$。映射关于零对称，float 的 0 精确映射到 int 的 0。优点是简单高效 (无需存储 zero-point)；缺点是对偏移分布 (如 ReLU activation，全正值) 浪费一半量化范围。
- **非对称量化**: $z \neq 0$，$s = (\max(x) - \min(x)) / (q_{\max} - q_{\min})$。映射可偏移，充分利用量化范围。每组额外存储一个 zero-point。

经验法则：权重分布通常近似对称 → 用对称量化。Activation 常有偏移 (特别是 ReLU 后全正值) → 用非对称量化。

下面的交互组件演示了量化→反量化的完整过程，可以切换对称/非对称模式观察差异：

<QuantizationMapping client:visible />

## 量化粒度

量化粒度决定"多大范围的权重共享一个 scale"：

- **Per-tensor**: 整个权重张量用一个 scale。最简单但误差最大——如果某些 channel 值域是其他 channel 的 10 倍，正常 channel 的精度被 outlier 拉低。
- **Per-channel**: 每个 output channel 有独立 scale。主流推理框架 (TensorRT, ONNX Runtime) 的默认选择，精度和开销平衡好。
- **Per-group**: 每 $g$ 个权重共享一个 scale。llama.cpp 使用 group size = 32 (称为 "block")。比 per-channel 更细粒度，适合低 bit-width (4-bit) 场景。
- **Per-block**: 进一步细化的分组策略。llama.cpp 的 K-quant 使用 super-block (256 weights) + sub-block (32 weights) 的两级结构。

粒度越细，每组有独立的 scale/zero-point，量化误差越小，但 metadata 存储开销越大。llama.cpp 选择 block size = 32 是精度与开销的经验折衷——32 个 INT4 值 (16 bytes) + 1 个 FP16 scale (2 bytes) = 18 bytes，有效精度 4.5 bpw (bits per weight)。

<GranularityCompare client:visible />

## 反量化 vs 原生低精度计算

量化后的推理有两条路径，取决于硬件支持：

**Dequant 路径 (兼容模式)**：权重存储为 INT4/INT8 → 推理时 dequantize 到 FP16 → 用 FP16 做矩阵乘法 → FP16 输出。大多数 CPU 和老 GPU 走这条路。好处是兼容性好 (任何支持 FP16 的硬件)；代价是 dequant 有性能开销，吞吐量不如原始 FP16 快多少 (主要收益是带宽节省)。

**原生低精度路径 (加速模式)**：INT8 weight × INT8 activation → INT32 累加 → FP16 输出。无需 dequant，硬件直接执行整数乘加。支持的硬件：
- **NVIDIA Tensor Core** (A100/H100): INT8 和 FP8 GEMM，吞吐量是 FP16 的 2 倍
- **Apple ANE** (Apple Neural Engine): INT8 和部分 INT4 支持
- **Intel VNNI/AMX**: INT8 向量/矩阵运算加速

关键认知：量化的收益不仅是"存储变小"。在有原生支持的硬件上，量化还能直接加速计算——这是 W8A8 (weight INT8 + activation INT8) 方案 (如 SmoothQuant) 的核心价值。

<HardwareComputePath />

## 混合精度实践

真实部署中，模型的不同层和操作使用不同精度。典型的混合精度配置：

| 模块 | 常用精度 | 原因 |
|------|----------|------|
| Embedding | FP16/FP32 | 词表查找不是瓶颈，精度敏感 |
| Attention QKV Projection | INT8/INT4 | 参数量大，量化收益高 |
| Attention Score ($QK^T$) | FP16 | softmax 对精度极敏感 |
| FFN Weight | INT4/INT8 | 参数量最大 (占 ~2/3)，SwiGLU 有平滑效应 |
| LayerNorm | FP32 | 累加和均值计算需要高精度 |
| Output Head | FP16 | 影响最终 logit 分布 |

决策依据是 **per-layer sensitivity analysis**：逐层量化，测量每层量化后 perplexity 的变化。对 perplexity 贡献最大的层 (通常是 Attention Q/K/V projection 和第一/最后几层) 保留高精度，其余层激进量化。llama.cpp 的 K-quant 混合精度策略就是这一思想的工程实现。

## PTQ vs QAT 概览

量化方法分两大路线：

**训练后量化 (Post-Training Quantization, PTQ)**：模型训练完成后直接量化，不修改权重。
- **Round-to-Nearest (RTN)**: 最简单，直接 round。8-bit 可用，4-bit 精度崩溃。
- **GPTQ**: 利用 Hessian 矩阵做误差补偿，4-bit 精度接近 FP16。
- **AWQ**: 识别重要 channel 保护性量化，比 GPTQ 更高效。
- **SmoothQuant**: 平滑 activation outlier，实现 W8A8 推理加速。

**量化感知训练 (Quantization-Aware Training, QAT)**：训练时模拟量化，模型学会适应低精度。
- **Fake Quantization + STE**: 在训练图中插入伪量化节点。
- **LoRA-QAT**: 用低秩适配器补偿量化损失，低成本近似 QAT。
- **BitNet**: 三值权重 {-1, 0, 1}，1.58-bit 极端量化，矩阵乘法退化为加减法。

经验分界线：**8-bit PTQ 足够，4-bit PTQ 优先，3-bit 以下需要 QAT**。后续文章将深入每条路线的算法细节。

## 总结

量化的核心是用离散整数近似连续浮点——通过 scale factor 和 zero-point 建立映射，粒度越细误差越小。硬件决定了量化收益的上限：有原生低精度支持时，量化不仅省存储还加速计算；没有时，主要收益是带宽节省。实际部署采用混合精度，通过 sensitivity analysis 为不同层分配不同精度。接下来将深入 PTQ 和 QAT 两条路线的具体算法。
```

- [ ] **Step 2: Validate**

```bash
npm run validate
```

Expected: PASS

- [ ] **Step 3: Commit Article 1 and its components**

```bash
git add src/components/interactive/DataTypeBitLayout.tsx \
  src/components/interactive/QuantizationMapping.tsx \
  src/components/interactive/GranularityCompare.tsx \
  src/components/interactive/HardwareComputePath.tsx \
  src/content/articles/zh/quantization-fundamentals.mdx
git commit -m "feat: add quantization fundamentals article with 4 components"
```

---

### Task 7: GPTQErrorPropagation Component

**Files:**
- Create: `src/components/interactive/GPTQErrorPropagation.tsx`

- [ ] **Step 1: Write the component**

See spec for detailed step descriptions. StepNavigator with 5 steps showing GPTQ's column-wise quantization with Hessian error compensation.

Key design:
- 4×4 weight matrix visualization
- Step 1: Original FP16 matrix
- Step 2: Quantize column 1, show error δ₁ (red)
- Step 3: Error propagation arrows to columns 2-4, green compensation values
- Step 4: Quantize column 2, continue propagation
- Step 5: Final GPTQ vs RTN MSE comparison

Pattern: Same as QuantizationProcess.tsx — import StepNavigator, COLORS, FONTS; const W = 580; steps array with {title, content} objects containing SVG.

```tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

const ORIG = [
  [0.0312, -0.0187, 0.0456, -0.0089],
  [-0.0234, 0.0401, -0.0156, 0.0278],
  [0.0178, -0.0345, 0.0289, -0.0198],
  [-0.0401, 0.0156, -0.0367, 0.0423],
];

const QUANT = [
  [0.0313, -0.0188, 0.0438, -0.0063],
  [-0.0250, 0.0375, -0.0125, 0.0250],
  [0.0188, -0.0375, 0.0313, -0.0188],
  [-0.0375, 0.0125, -0.0375, 0.0438],
];

export default function GPTQErrorPropagation() {
  const errors = useMemo(() =>
    ORIG.map((row, i) => row.map((v, j) => +(v - QUANT[i][j]).toFixed(4))), []
  );

  const compensated = useMemo(() => {
    const c = ORIG.map(row => [...row]);
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j < 4; j++) {
        c[i][j] = +(ORIG[i][j] + errors[i][0] * 0.3 / j).toFixed(4);
      }
    }
    return c;
  }, [errors]);

  const cellW = 90;
  const cellH = 36;
  const matX = 120;
  const matY = 70;

  function Cell({ x, y, val, bg, tc }: { x: number; y: number; val: number; bg?: string; tc?: string }) {
    return (
      <g>
        <rect x={x} y={y} width={cellW} height={cellH} fill={bg || COLORS.bg}
          stroke={COLORS.light} strokeWidth={1} rx={3} />
        <text x={x + cellW / 2} y={y + cellH / 2 + 5} textAnchor="middle"
          fontFamily={FONTS.mono} fontSize="10" fill={tc || COLORS.dark}>
          {val >= 0 ? '+' : ''}{val.toFixed(4)}
        </text>
      </g>
    );
  }

  function Matrix({ data, colBgs, colTcs, title }: {
    data: number[][]; colBgs?: (string | undefined)[]; colTcs?: (string | undefined)[]; title: string;
  }) {
    return (
      <g>
        <text x={matX + cellW * 2} y={matY - 10} textAnchor="middle" fontSize="11"
          fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
        {data.map((row, i) =>
          row.map((v, j) => (
            <Cell key={`${i}-${j}`} x={matX + j * cellW} y={matY + i * cellH}
              val={v} bg={colBgs?.[j]} tc={colTcs?.[j]} />
          ))
        )}
      </g>
    );
  }

  const steps = [
    {
      title: 'Step 1: 原始权重矩阵 W (FP16)',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={ORIG} title="W (FP16) — Hessian H⁻¹ 引导量化顺序" />
          <text x={W / 2} y={250} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            GPTQ 逐列量化: 利用 Hessian 逆矩阵将误差最优地分散到后续列
          </text>
        </svg>
      ),
    },
    {
      title: 'Step 2: 量化第 1 列, 计算误差 δ₁',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={ORIG.map((row, i) => [QUANT[i][0], ...row.slice(1)])}
            title="量化第 1 列 → 计算误差 δ₁"
            colBgs={[COLORS.highlight, undefined, undefined, undefined]} />
          <text x={matX + cellW * 4 + 15} y={matY + 10} fontSize="9" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>δ₁</text>
          {errors.map((row, i) => (
            <text key={i} x={matX + cellW * 4 + 15} y={matY + i * cellH + cellH / 2 + 5}
              fontSize="9" fill={COLORS.red} fontFamily={FONTS.mono}>
              {row[0] >= 0 ? '+' : ''}{row[0].toFixed(4)}
            </text>
          ))}
        </svg>
      ),
    },
    {
      title: 'Step 3: 误差传播到后续列 (Hessian 补偿)',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={ORIG.map((row, i) => [QUANT[i][0], ...compensated[i].slice(1)])}
            title="误差补偿: δ₁ × H⁻¹ → 第 2-4 列"
            colBgs={['#e0e0e0', undefined, undefined, undefined]}
            colTcs={[COLORS.mid, COLORS.green, COLORS.green, COLORS.green]} />
          <defs>
            <marker id="gptq-arr" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
            </marker>
          </defs>
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1={matX + cellW} y1={matY + i * cellH + cellH / 2}
              x2={matX + cellW + 15} y2={matY + i * cellH + cellH / 2}
              stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#gptq-arr)" />
          ))}
          <text x={W / 2} y={250} textAnchor="middle" fontSize="8" fill={COLORS.green}
            fontFamily={FONTS.sans}>
            绿色 = 补偿后的值 (原始值 + 误差分配)
          </text>
        </svg>
      ),
    },
    {
      title: 'Step 4: 量化第 2 列, 继续传播',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={ORIG.map((row, i) => [QUANT[i][0], QUANT[i][1], ...compensated[i].slice(2)])}
            title="量化第 2 列 → 补偿第 3-4 列"
            colBgs={['#e0e0e0', COLORS.highlight, undefined, undefined]}
            colTcs={[COLORS.mid, undefined, COLORS.green, COLORS.green]} />
          <text x={W / 2} y={250} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            逐列处理: 每列量化后误差补偿到右侧所有未量化列
          </text>
        </svg>
      ),
    },
    {
      title: 'Step 5: 最终结果 — GPTQ vs RTN',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={QUANT} title="最终量化矩阵 (INT4)"
            colBgs={['#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0']} />
          <rect x={100} y={230} width={170} height={50} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.red} strokeWidth={1.5} />
          <text x={185} y={252} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>RTN (逐元素)</text>
          <text x={185} y={270} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.mono}>MSE = 0.00082</text>

          <rect x={310} y={230} width={170} height={50} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1.5} />
          <text x={395} y={252} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>GPTQ (列级补偿)</text>
          <text x={395} y={270} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.mono}>MSE = 0.00031</text>

          <text x={W / 2} y={296} textAnchor="middle" fontSize="9" fill={COLORS.primary}
            fontFamily={FONTS.sans}>
            ↓ GPTQ 将 MSE 降低约 62%
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify** — `npm run dev`

---

### Task 8: AWQSalientChannels Component

**Files:**
- Create: `src/components/interactive/AWQSalientChannels.tsx`

- [ ] **Step 1: Write the component**

Interactive component showing activation heatmap with salient channel highlighting and per-channel scaling effect. See spec for details.

Pattern: useState + SVG, COLORS/FONTS, W=580, viewBox 0 0 580 380.

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const ROWS = 8;
const COLS = 8;

// Activation matrix: column 2 is salient (values ~5x, representing 1% outlier)
const ACTIVATIONS = [
  [0.12, 0.03, 4.81, 0.08, 0.15, 0.02, 0.11, 0.06],
  [0.09, 0.05, 5.23, 0.11, 0.07, 0.04, 0.13, 0.08],
  [0.14, 0.02, 4.67, 0.06, 0.18, 0.03, 0.09, 0.05],
  [0.11, 0.04, 5.01, 0.09, 0.12, 0.05, 0.14, 0.07],
  [0.08, 0.06, 4.92, 0.13, 0.09, 0.02, 0.10, 0.04],
  [0.13, 0.03, 5.15, 0.07, 0.16, 0.04, 0.12, 0.06],
  [0.10, 0.05, 4.78, 0.10, 0.11, 0.03, 0.08, 0.09],
  [0.15, 0.04, 5.34, 0.08, 0.14, 0.05, 0.11, 0.07],
];

const SALIENT_COLS = new Set([2]);

export default function AWQSalientChannels() {
  const [selectedCol, setSelectedCol] = useState(2);
  const maxAct = 5.5;

  const colVals = ACTIVATIONS.map(r => r[selectedCol]);
  const colMax = Math.max(...colVals);
  const colMean = +(colVals.reduce((a, b) => a + b, 0) / colVals.length).toFixed(3);
  const isSalient = SALIENT_COLS.has(selectedCol);
  const scaleFactor = isSalient ? +(colMax / 0.5).toFixed(2) : 1.0;

  const { errBefore, errAfter } = useMemo(() => ({
    errBefore: isSalient ? 0.47 : 0.03,
    errAfter: isSalient ? 0.05 : 0.03,
  }), [isSalient]);

  const cellSize = 28;
  const heatX = 30;
  const heatY = 40;

  function heatColor(v: number): string {
    const t = Math.min(v / maxAct, 1);
    if (t > 0.6) return COLORS.red;
    if (t > 0.3) return COLORS.orange;
    return '#90caf9';
  }

  return (
    <svg viewBox={`0 0 ${W} 380`} className="w-full">
      <text x={heatX} y={25} fontSize="10" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>激活矩阵 X（点击列选择通道）</text>

      {/* Heatmap */}
      {ACTIVATIONS.map((row, i) =>
        row.map((v, j) => (
          <g key={`${i}-${j}`} onClick={() => setSelectedCol(j)} cursor="pointer">
            <rect x={heatX + j * cellSize} y={heatY + i * cellSize}
              width={cellSize - 1} height={cellSize - 1} rx={2}
              fill={heatColor(v)}
              stroke={j === selectedCol ? COLORS.primary : SALIENT_COLS.has(j) ? COLORS.red : 'none'}
              strokeWidth={j === selectedCol ? 2.5 : SALIENT_COLS.has(j) ? 1.5 : 0} />
            <text x={heatX + j * cellSize + cellSize / 2} y={heatY + i * cellSize + cellSize / 2 + 3}
              textAnchor="middle" fontSize="7" fill={v > 1 ? '#fff' : COLORS.dark}
              fontFamily={FONTS.mono}>{v > 1 ? v.toFixed(1) : v.toFixed(2)}</text>
          </g>
        ))
      )}

      {/* Channel labels */}
      {Array.from({ length: COLS }, (_, j) => (
        <text key={j} x={heatX + j * cellSize + cellSize / 2} y={heatY + ROWS * cellSize + 12}
          textAnchor="middle" fontSize="7"
          fill={SALIENT_COLS.has(j) ? COLORS.red : COLORS.mid} fontFamily={FONTS.mono}>
          ch{j}
        </text>
      ))}

      {/* Right panel: channel info */}
      <rect x={290} y={35} width={260} height={95} rx={6}
        fill={COLORS.bgAlt} stroke={isSalient ? COLORS.red : COLORS.light} strokeWidth={1} />
      <text x={300} y={55} fontSize="9" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        通道 {selectedCol} {isSalient ? '⚡ 显著通道' : '普通通道'}
      </text>
      <text x={300} y={72} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
        max={colMax.toFixed(2)}  mean={colMean}
      </text>
      <text x={300} y={90} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
        <tspan fontWeight="600">缩放因子 s = </tspan>{scaleFactor.toFixed(2)}
      </text>
      <text x={300} y={108} fontSize="7.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {isSalient
          ? 'AWQ 放大此通道权重 → 量化粒度更细 → 误差更小'
          : '普通通道无需特殊处理, s=1'}
      </text>

      {/* Error comparison */}
      <rect x={30} y={290} width={245} height={35} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.red} strokeWidth={1} />
      <text x={152} y={312} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>
        缩放前量化误差: {errBefore.toFixed(2)}
      </text>

      <rect x={290} y={290} width={260} height={35} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1} />
      <text x={420} y={312} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        缩放后量化误差: {errAfter.toFixed(2)}
      </text>

      <text x={W / 2} y={350} textAnchor="middle" fontSize="8" fill={COLORS.orange}
        fontFamily={FONTS.sans}>
        Y = XW = (X·diag(s)⁻¹)·(diag(s)·W) — 保持数学等价, 保护 1% 关键通道
      </text>
      <text x={W / 2} y={368} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        AWQ 是"事前预防" (调整分布使其易量化) vs GPTQ 是"事后补救" (补偿量化误差)
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Verify** — `npm run dev`, click different columns

---

### Task 9: SmoothQuantTransform Component

**Files:**
- Create: `src/components/interactive/SmoothQuantTransform.tsx`

- [ ] **Step 1: Write the component**

StepNavigator with 4 steps showing SmoothQuant's activation smoothing process. See spec for step details.

Pattern: import StepNavigator, COLORS, FONTS; const W = 580; steps with {title, content}.

Complete code follows the same pattern as QuantizationMapping.tsx. Data: 4×4 activation matrix with channel 2 as outlier (~50x), weights, smoothing factors with α=0.5. Steps: (1) Original activation with outlier highlighted red, (2) Compute s_j, show formula, (3) Smoothed activation X' and weight W', (4) Both can use INT8 per-tensor quantization.

```tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

const ACT = [
  [0.5, 0.3, 48.2, 0.8],
  [0.4, 0.6, 52.1, 0.5],
  [0.7, 0.2, 45.7, 0.9],
  [0.3, 0.5, 50.8, 0.6],
];
const WGT = [
  [0.12, -0.08, 0.001, 0.15],
  [-0.09, 0.11, 0.002, -0.13],
  [0.07, -0.14, 0.001, 0.10],
  [-0.11, 0.06, 0.003, -0.08],
];

export default function SmoothQuantTransform() {
  const channelMax = ACT[0].map((_, j) =>
    Math.max(...ACT.map(r => Math.abs(r[j])))
  );
  const alpha = 0.5;
  const s = channelMax.map(m => +Math.pow(m, alpha).toFixed(2));

  const smoothedAct = ACT.map(row => row.map((v, j) => +(v / s[j]).toFixed(3)));
  const smoothedWgt = WGT.map(row => row.map((v, j) => +(v * s[j]).toFixed(4)));

  const cW = 78;
  const cH = 28;

  function Mat({ x, y, data, title, rangeColors }: {
    x: number; y: number; data: number[][]; title: string; rangeColors?: boolean;
  }) {
    return (
      <g>
        <text x={x + data[0].length * cW / 2} y={y - 8} textAnchor="middle"
          fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {title}
        </text>
        {data.map((row, r) =>
          row.map((v, c) => {
            let fill = COLORS.bg;
            if (rangeColors) {
              const absV = Math.abs(v);
              fill = absV > 10 ? '#ffcdd2' : absV > 1 ? '#fff9c4' : '#c8e6c9';
            }
            return (
              <g key={`${r}-${c}`}>
                <rect x={x + c * cW} y={y + r * cH} width={cW - 1} height={cH - 1}
                  fill={fill} stroke={COLORS.light} strokeWidth={1} rx={2} />
                <text x={x + c * cW + cW / 2} y={y + r * cH + cH / 2 + 4}
                  textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily={FONTS.mono}>
                  {Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(3)}
                </text>
              </g>
            );
          })
        )}
      </g>
    );
  }

  const steps = [
    {
      title: 'Step 1: 原始 Activation (通道 2 是 outlier)',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <Mat x={100} y={30} data={ACT} title="Activation X (FP16)" rangeColors />
          <text x={W / 2} y={175} textAnchor="middle" fontSize="8" fill={COLORS.red}
            fontFamily={FONTS.sans}>
            通道 2 动态范围 (~50) 是其他通道 (~1) 的 50 倍
          </text>
          <text x={W / 2} y={195} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            Per-tensor INT8 量化: scale 被 outlier 主导 → 正常通道精度崩溃
          </text>
          <text x={60} y={230} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
            Per-channel max:
          </text>
          {channelMax.map((m, j) => (
            <text key={j} x={165 + j * 100} y={230} fontSize="8"
              fill={m > 10 ? COLORS.red : COLORS.green} fontFamily={FONTS.mono}>
              ch{j}: {m.toFixed(1)}
            </text>
          ))}
        </svg>
      ),
    },
    {
      title: 'Step 2: 计算平滑因子 sⱼ',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={28} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            sⱼ = max(|Xⱼ|)^α, α = 0.5
          </text>
          {s.map((sv, j) => {
            const bx = 50 + j * 130;
            return (
              <g key={j}>
                <rect x={bx} y={50} width={110} height={70} rx={6}
                  fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
                <text x={bx + 55} y={70} textAnchor="middle" fontSize="9"
                  fill={COLORS.mid} fontFamily={FONTS.sans}>通道 {j}</text>
                <text x={bx + 55} y={88} textAnchor="middle" fontSize="8"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>max = {channelMax[j].toFixed(1)}</text>
                <text x={bx + 55} y={110} textAnchor="middle" fontSize="12"
                  fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.mono}>
                  s = {sv}
                </text>
              </g>
            );
          })}
          <text x={W / 2} y={155} textAnchor="middle" fontSize="9" fill={COLORS.dark}
            fontFamily={FONTS.sans}>X' = X · diag(s)⁻¹ (激活除以 s) | W' = diag(s) · W (权重乘以 s)</text>
          <text x={W / 2} y={175} textAnchor="middle" fontSize="8" fill={COLORS.purple}
            fontFamily={FONTS.sans}>
            数学等价: X' · W' = X · diag(s)⁻¹ · diag(s) · W = X · W
          </text>
        </svg>
      ),
    },
    {
      title: 'Step 3: 平滑后矩阵',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <Mat x={5} y={30} data={smoothedAct} title="X' = X · diag(s)⁻¹" rangeColors />
          <Mat x={340} y={30} data={smoothedWgt} title="W' = diag(s) · W" />
          <text x={W / 2} y={175} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            ✓ X' 所有通道动态范围接近 — per-tensor INT8 量化可行
          </text>
        </svg>
      ),
    },
    {
      title: 'Step 4: W8A8 推理加速',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={28} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>X' · W' = X · W (数学等价)</text>

          <rect x={40} y={50} width={210} height={60} rx={8}
            fill="#e8f5e9" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={145} y={72} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>X' → INT8 per-tensor</text>
          <text x={145} y={92} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>动态范围均衡 ✓</text>

          <rect x={330} y={50} width={210} height={60} rx={8}
            fill="#e8f5e9" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={435} y={72} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>W' → INT8 per-tensor</text>
          <text x={435} y={92} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>值略增但可控 ✓</text>

          <text x={W / 2} y={82} fontSize="16" fill={COLORS.primary}>×</text>

          <rect x={150} y={130} width={280} height={40} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={2} />
          <text x={W / 2} y={155} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>INT8 GEMM (Tensor Core 加速)</text>

          <text x={W / 2} y={200} textAnchor="middle" fontSize="9" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            对比 FP16: 内存减半, 吞吐提升 ~1.5-2×
          </text>
          <text x={W / 2} y={220} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            LLaMA-7B WikiText2 PPL: FP16 5.68 → W8A8 5.73 (+0.05)
          </text>
          <text x={W / 2} y={245} textAnchor="middle" fontSize="8" fill={COLORS.orange}
            fontFamily={FONTS.sans}>
            α = 0.5 是大多数模型的经验最优值, SmoothQuant 已被 TensorRT-LLM, vLLM 广泛采用
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify** — `npm run dev`

---

### Task 10: PTQMethodComparison Component

**Files:**
- Create: `src/components/interactive/PTQMethodComparison.tsx`

- [ ] **Step 1: Write the component**

Interactive comparison table. Click cells to expand details. See spec for dimensions and data.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

const DIMS = ['校准样本', '量化耗时', '位宽', 'PPL (4-bit)', '推理框架', '适用场景'];

const METHODS = [
  { name: 'RTN', color: COLORS.mid, data: ['0', '<1 min', 'W4/W8', '~7.2', '通用', '快速基线'] },
  { name: 'GPTQ', color: COLORS.primary, data: ['128', '~10 min', 'W4/W3/W2', '~5.67', 'ExLlama/vLLM', '4-bit 部署'] },
  { name: 'AWQ', color: COLORS.green, data: ['128', '~5 min', 'W4', '~5.60', 'vLLM/TRT-LLM', '高效部署'] },
  { name: 'SmoothQuant', color: COLORS.purple, data: ['512', '~15 min', 'W8A8', '~5.73', 'TRT-LLM', '高吞吐推理'] },
];

const DETAILS: Record<string, Record<string, string>> = {
  RTN: {
    '校准样本': '无需校准数据，直接逐元素 round-to-nearest',
    '量化耗时': '无需前向推理，仅做 round 操作',
    '位宽': '8-bit 精度尚可，4-bit 严重退化',
    'PPL (4-bit)': 'INT4 perplexity 上升明显 (FP16 基线: 5.47)',
    '推理框架': '任何量化框架均支持',
    '适用场景': '快速评估量化可行性，或 8-bit 部署',
  },
  GPTQ: {
    '校准样本': '需要 128 条数据计算 Hessian 矩阵',
    '量化耗时': '7B 模型约 10 分钟，需单 GPU',
    '位宽': '支持超低比特 (2/3/4/8-bit)',
    'PPL (4-bit)': 'INT4-g128 接近 FP16 (5.47)，损失极小',
    '推理框架': '需要专用 CUDA kernel',
    '适用场景': '消费级 GPU 部署大模型首选',
  },
  AWQ: {
    '校准样本': '需要校准数据识别 salient channel',
    '量化耗时': '无需反向传播，仅分析激活统计',
    '位宽': '聚焦 4-bit, 保护 1% 显著通道',
    'PPL (4-bit)': 'INT4-g128 略优于 GPTQ',
    '推理框架': '兼容标准 INT4 kernel',
    '适用场景': '量化质量与推理速度最佳平衡',
  },
  SmoothQuant: {
    '校准样本': '需统计各通道激活分布',
    '量化耗时': '需统计并融合平滑因子',
    '位宽': 'W8A8: 权重+激活都用 INT8',
    'PPL (4-bit)': 'W8A8 精度损失极小 (FP16: 5.47)',
    '推理框架': '需要 INT8 GEMM (A100/H100)',
    '适用场景': '数据中心大规模服务',
  },
};

export default function PTQMethodComparison() {
  const [active, setActive] = useState<{ row: number; col: number } | null>(null);

  const nameW = 88;
  const colW = (W - nameW - 20) / DIMS.length;
  const headerH = 35;
  const rowH = 38;
  const tX = 10;
  const tY = 10;

  return (
    <svg viewBox={`0 0 ${W} 350`} className="w-full">
      {/* Column headers */}
      {DIMS.map((dim, j) => (
        <g key={j}>
          <rect x={tX + nameW + j * colW} y={tY} width={colW - 1} height={headerH}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={2} />
          <text x={tX + nameW + j * colW + colW / 2} y={tY + headerH / 2 + 4}
            textAnchor="middle" fontSize="7.5" fontWeight="600" fill={COLORS.dark}
            fontFamily={FONTS.sans}>{dim}</text>
        </g>
      ))}

      {/* Method rows */}
      {METHODS.map((method, i) => {
        const yPos = tY + headerH + i * rowH;
        return (
          <g key={i}>
            <rect x={tX} y={yPos} width={nameW - 1} height={rowH - 1}
              fill={COLORS.bgAlt} stroke={method.color} strokeWidth={1.5} rx={2} />
            <text x={tX + nameW / 2} y={yPos + rowH / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="700" fill={method.color} fontFamily={FONTS.sans}>
              {method.name}
            </text>
            {DIMS.map((_, j) => {
              const isActive = active?.row === i && active?.col === j;
              return (
                <g key={j} onClick={() => setActive(isActive ? null : { row: i, col: j })}
                  cursor="pointer">
                  <rect x={tX + nameW + j * colW} y={yPos} width={colW - 1} height={rowH - 1}
                    fill={isActive ? '#e3f2fd' : COLORS.bg}
                    stroke={isActive ? COLORS.primary : COLORS.light}
                    strokeWidth={isActive ? 2 : 1} rx={2} />
                  <text x={tX + nameW + j * colW + colW / 2} y={yPos + rowH / 2 + 4}
                    textAnchor="middle" fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>
                    {method.data[j]}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Detail panel */}
      {active ? (
        <g>
          <rect x={tX} y={tY + headerH + 4 * rowH + 10} width={W - 20} height={48} rx={6}
            fill={COLORS.bgAlt} stroke={METHODS[active.row].color} strokeWidth={1.5} />
          <text x={tX + 15} y={tY + headerH + 4 * rowH + 30} fontSize="9"
            fontWeight="600" fill={METHODS[active.row].color} fontFamily={FONTS.sans}>
            {METHODS[active.row].name} — {DIMS[active.col]}
          </text>
          <text x={tX + 15} y={tY + headerH + 4 * rowH + 48} fontSize="8"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {DETAILS[METHODS[active.row].name][DIMS[active.col]]}
          </text>
        </g>
      ) : (
        <text x={W / 2} y={tY + headerH + 4 * rowH + 35} textAnchor="middle"
          fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
          点击单元格查看详细说明
        </text>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verify** — `npm run dev`, click cells

---

### Task 11: PTQ Weight Quantization Article

**Files:**
- Create: `src/content/articles/zh/ptq-weight-quantization.mdx`

- [ ] **Step 1: Write the article**

Full article covering RTN limitations, GPTQ (Hessian compensation), AWQ (salient channels), SmoothQuant (activation smoothing), and method comparison. ~200 lines of MDX with 4 component imports.

Article content follows the spec's Content Structure (sections 1-5). Imports all 4 components from Tasks 7-10. Uses formulas for GPTQ update rule and SmoothQuant transform. Includes selection recommendations at the end.

See spec `docs/superpowers/specs/2026-04-05-quantization-learning-path-design.md` Article 2 section for complete content structure and references.

```mdx
---
title: "PTQ 权重量化：从 GPTQ 到 AWQ"
slug: "ptq-weight-quantization"
locale: "zh"
tags: ["quantization", "ptq", "gptq", "awq", "smoothquant"]
difficulty: "advanced"
prerequisites: ["quantization-fundamentals"]
created: "2026-04-05"
updated: "2026-04-05"
references:
  - type: "paper"
    title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-Trained Transformers"
    url: "https://arxiv.org/abs/2210.17323"
  - type: "paper"
    title: "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration"
    url: "https://arxiv.org/abs/2306.00978"
  - type: "paper"
    title: "SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models"
    url: "https://arxiv.org/abs/2211.10438"
---

import GPTQErrorPropagation from '../../../components/interactive/GPTQErrorPropagation.tsx';
import AWQSalientChannels from '../../../components/interactive/AWQSalientChannels.tsx';
import SmoothQuantTransform from '../../../components/interactive/SmoothQuantTransform.tsx';
import PTQMethodComparison from '../../../components/interactive/PTQMethodComparison.tsx';

Post-Training Quantization (PTQ，训练后量化) 在模型训练完成后直接对权重进行量化，无需重新训练。相比 QAT 的零训练成本优势——只需少量校准数据和几分钟处理时间——使 PTQ 成为 LLM 部署的首选量化方案。本文深入分析四种主流 PTQ 方法的算法原理和适用场景。

## Round-to-Nearest 的局限

最简单的量化方式是 Round-to-Nearest (RTN)：对每个权重直接取最近的量化值。RTN 在 **8-bit** 时表现尚可——LLaMA2-7B 的 perplexity 从 FP16 的 5.47 仅升至约 5.52。但降到 **4-bit** 时，perplexity 飙升到 7.2 以上。

核心问题：RTN 独立处理每个权重，忽略了权重之间的相关性。当量化一个权重产生误差时，这个误差对模型输出的影响取决于该权重与其他权重的关系 (Hessian 矩阵)。RTN 完全忽略了这种结构化信息。

## GPTQ：Hessian 引导的误差补偿

GPTQ (Frantar et al., 2022) 基于关键洞察：**量化一个权重产生的误差可以通过调整尚未量化的权重来补偿**。

算法的核心是 Optimal Brain Quantization (OBQ) 的高效近似：逐列处理权重矩阵，利用 $H^{-1}$ (Hessian 逆矩阵) 将当前列的量化误差最优分配到后续列。更新公式：

$$\delta_F = -\frac{w_q - w}{[H_F^{-1}]_{qq}} \cdot (H_F^{-1})_{:,q}$$

关键优化：Lazy Batch Updates 每 128 列批量更新一次，减少内存访问。校准需要 128-512 个文本样本的前向传播来估计 Hessian 矩阵。

<GPTQErrorPropagation client:visible />

实际效果：LLaMA2-7B 在 INT4-g128 下 perplexity 仅 5.67，接近 FP16 的 5.47。量化 7B 模型约需 10 分钟和单张 GPU。

## AWQ：激活感知的权重量化

AWQ (Lin et al., 2023) 从另一个角度出发：**不是所有权重同等重要**。观察发现 LLM 的激活中存在约 1% 的显著通道 (salient channels)，这些通道的激活值远大于其他通道。

AWQ 的解决方案是 per-channel scaling：对显著通道的权重乘以较大的 scale factor $s$，使其量化粒度更细。同时激活除以 $s$ 保持数学等价：

$$Y = XW = (X \cdot \text{diag}(s)^{-1}) \cdot (\text{diag}(s) \cdot W)$$

<AWQSalientChannels client:visible />

AWQ 的关键优势：无需反向传播 (量化速度快 ~5 min)、输出标准 INT4 格式 (兼容 vLLM/TRT-LLM)、质量优异 (LLaMA2-7B INT4-g128 perplexity ~5.60)。

与 GPTQ 的本质区别：GPTQ 在量化过程中修改未量化权重来补偿误差 ("事后补救")，AWQ 在量化前调整权重分布使其更易量化 ("事前预防")。两者可以组合使用。

## SmoothQuant：平滑激活离群值

前面的方法聚焦权重量化 (weight-only)，SmoothQuant (Xiao et al., 2022) 解决的是 **W8A8**——同时量化权重和激活，利用 INT8 Tensor Core 加速。

激活量化的难点在于 outlier channels：部分通道值域达其他通道的 100 倍以上，per-tensor INT8 量化无法同时保留大值和小值精度。

SmoothQuant 的核心思想——将量化难度从激活迁移到权重：

$$Y = X \cdot W = (X \cdot \text{diag}(s)^{-1}) \cdot (\text{diag}(s) \cdot W) = X' \cdot W'$$

平滑因子 $s_j = \max(|X_j|)^\alpha$，$\alpha = 0.5$ 是经验最优值。变换后 $X'$ 各通道动态范围接近，$W'$ 值虽略增但仍可控，两者都可用 per-tensor INT8 量化。

<SmoothQuantTransform client:visible />

SmoothQuant 在数据中心场景最具价值：W8A8 直接利用 GPU 的 INT8 Tensor Core (A100/H100)，吞吐量相比 FP16 提升 1.5-2 倍。

## 方法对比与选型

<PTQMethodComparison client:visible />

**选型建议：**
- **消费级 GPU 部署** (RTX 3090/4090)：选 AWQ 或 GPTQ 的 INT4-g128，用 vLLM 或 ExLlamaV2
- **数据中心高吞吐** (A100/H100)：选 SmoothQuant 的 W8A8，用 TensorRT-LLM
- **快速评估**：先用 RTN INT8 验证，再切换更精细方法
- **极低比特** (2-3 bit)：GPTQ 支持但质量损失较大，需评估是否需要 QAT

## 总结

PTQ 权重量化已发展出成熟工具链。GPTQ 通过 Hessian 误差补偿实现高质量逐列量化，AWQ 利用激活感知 per-channel scaling 保护关键通道，SmoothQuant 通过数学变换让 W8A8 成为可能。三者各有侧重，实际部署应根据硬件条件和精度需求选择。
```

- [ ] **Step 2: Validate and verify**

```bash
npm run validate && npm run dev
```

- [ ] **Step 3: Commit Article 2 and its components**

```bash
git add src/components/interactive/GPTQErrorPropagation.tsx \
  src/components/interactive/AWQSalientChannels.tsx \
  src/components/interactive/SmoothQuantTransform.tsx \
  src/components/interactive/PTQMethodComparison.tsx \
  src/content/articles/zh/ptq-weight-quantization.mdx
git commit -m "feat: add PTQ weight quantization article with 4 components"
```

### Task 12: FakeQuantForwardBackward Component

**Files:**
- Create: `src/components/interactive/FakeQuantForwardBackward.tsx`

- [ ] **Step 1: Write the component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

export default function FakeQuantForwardBackward() {
  const steps = [
    {
      title: '1. FP32 Master Weight',
      content: (
        <svg viewBox={`0 0 ${W} 250`} className="w-full">
          <rect x="200" y="30" width="180" height="80" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="290" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            FP32 Master Weight
          </text>
          <text x="290" y="85" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.mono}>
            W = [0.347, -0.892, ...]
          </text>
          <text x="290" y="105" textAnchor="middle" fontSize="11" fill={COLORS.green} fontFamily={FONTS.sans}>
            全精度 32-bit
          </text>
          <text x="290" y="160" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            训练开始时初始化为全精度权重
          </text>
          <text x="290" y="180" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            整个训练过程始终保持 FP32 精度
          </text>
        </svg>
      ),
    },
    {
      title: '2. Forward: Fake Quantization',
      content: (
        <svg viewBox={`0 0 ${W} 250`} className="w-full">
          <defs>
            <marker id="fq-arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.primary} />
            </marker>
            <marker id="fq-arrow-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.mid} />
            </marker>
          </defs>
          <rect x="30" y="30" width="120" height="55" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="90" y="52" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>FP32 Master</text>
          <text x="90" y="72" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W = 0.347</text>
          <path d="M 150 57 L 195 57" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq-arrow-blue)"/>
          <rect x="195" y="20" width="110" height="120" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" strokeDasharray="4,2" rx="4"/>
          <text x="250" y="42" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Fake Quant</text>
          <rect x="208" y="55" width="85" height="24" fill={COLORS.bg} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
          <text x="250" y="72" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Quantize</text>
          <path d="M 250 79 L 250 92" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#fq-arrow-gray)"/>
          <rect x="208" y="92" width="85" height="24" fill={COLORS.bg} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
          <text x="250" y="109" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Dequantize</text>
          <path d="M 305 80 L 365 80" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq-arrow-blue)"/>
          <rect x="365" y="50" width="130" height="55" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="430" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>量化后权重</text>
          <text x="430" y="92" textAnchor="middle" fontSize="10" fill={COLORS.red} fontFamily={FONTS.mono}>W_q = 0.333</text>
          <text x="430" y="170" textAnchor="middle" fontSize="11" fill={COLORS.red} fontFamily={FONTS.sans}>
            量化噪声 = 0.347 - 0.333 = 0.014
          </text>
          <text x="290" y="200" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            前向传播通过伪量化节点，模拟量化精度损失
          </text>
        </svg>
      ),
    },
    {
      title: '3. Forward: Compute Loss',
      content: (
        <svg viewBox={`0 0 ${W} 250`} className="w-full">
          <defs>
            <marker id="fq3-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.primary} />
            </marker>
          </defs>
          <rect x="30" y="40" width="95" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="77" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>FP32 Master</text>
          <text x="77" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W</text>
          <path d="M 125 62 L 165 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="165" y="40" width="95" height="45" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" strokeDasharray="4,2" rx="4"/>
          <text x="212" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Fake Quant</text>
          <text x="212" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Q(W)</text>
          <path d="M 260 62 L 300 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="300" y="40" width="95" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="347" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>MatMul</text>
          <text x="347" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Y = Q(W)X</text>
          <path d="M 395 62 L 435 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="435" y="40" width="80" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="475" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Loss</text>
          <text x="475" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>L</text>
          <text x="290" y="130" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            使用量化后的权重计算前向传播
          </text>
          <text x="290" y="155" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            Loss 反映了量化精度下的模型性能
          </text>
        </svg>
      ),
    },
    {
      title: '4. Backward: STE 激活',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <defs>
            <marker id="fq4-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.primary} />
            </marker>
            <marker id="fq4-orange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.orange} />
            </marker>
          </defs>
          <rect x="30" y="30" width="95" height="50" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="77" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>FP32 Master</text>
          <text x="77" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W</text>
          <path d="M 125 48 L 165 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 165 68 L 125 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="165" y="30" width="105" height="50" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="3" strokeDasharray="6,3" rx="4"/>
          <text x="217" y="48" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Fake Quant</text>
          <text x="217" y="62" textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>STE 激活</text>
          <text x="217" y="75" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>∂L/∂W ≈ ∂L/∂Q(W)</text>
          <path d="M 270 48 L 310 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 310 68 L 270 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="310" y="30" width="95" height="50" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="357" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>MatMul</text>
          <text x="357" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Y = Q(W)X</text>
          <path d="M 405 48 L 445 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 445 68 L 405 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="445" y="30" width="80" height="50" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="485" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Loss</text>
          <text x="485" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>L</text>
          <path d="M 217 80 L 217 120" stroke={COLORS.orange} strokeWidth="2" strokeDasharray="3,3"/>
          <text x="240" y="105" fontSize="10" fill={COLORS.purple} fontFamily={FONTS.sans}>梯度"穿过" round()</text>
          <text x="240" y="120" fontSize="10" fill={COLORS.purple} fontFamily={FONTS.sans}>恒等映射: ∂Q/∂W ≈ I</text>
          <rect x="30" y="145" width="520" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4"/>
          <text x="50" y="165" fontSize="11" fill={COLORS.primary} fontFamily={FONTS.sans}>→ 蓝色: 前向传播</text>
          <text x="250" y="165" fontSize="11" fill={COLORS.orange} fontFamily={FONTS.sans}>← 橙色: 反向传播</text>
          <text x="50" y="185" fontSize="11" fill={COLORS.purple} fontFamily={FONTS.sans}>虚线框: STE 节点 (round 不可导，梯度直通)</text>
        </svg>
      ),
    },
    {
      title: '5. Weight Update',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <rect x="140" y="20" width="300" height="80" fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth="3" rx="4"/>
          <text x="290" y="45" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            FP32 Master Weight 更新
          </text>
          <text x="290" y="68" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.mono}>
            W_t+1 = W_t - η · ∂L/∂W
          </text>
          <text x="290" y="90" textAnchor="middle" fontSize="11" fill={COLORS.green} fontFamily={FONTS.sans}>
            始终保持全精度累积更新
          </text>
          <rect x="40" y="120" width="500" height="85" fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth="2" rx="4"/>
          <text x="290" y="145" textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            QAT 核心机制总结
          </text>
          <text x="290" y="168" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            • 前向：通过 Fake Quant 模拟量化噪声
          </text>
          <text x="290" y="185" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            • 反向：STE 让梯度穿过不可导的 round() 操作
          </text>
          <text x="290" y="202" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            • 更新：Master Weight 保持 FP32 精度累积训练
          </text>
          <text x="290" y="240" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            训练结束后直接量化为目标精度，模型已适应量化噪声
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

### Task 13: BitNetArithmetic Component

**Files:**
- Create: `src/components/interactive/BitNetArithmetic.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

export default function BitNetArithmetic() {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  return (
    <svg viewBox={`0 0 ${W} 350`} className="w-full">
      {/* Title */}
      <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        传统 FP16 vs BitNet 三值计算对比
      </text>

      {/* Left: Traditional FP16 */}
      <g transform="translate(20, 45)">
        <text x="120" y="0" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
          传统 FP16 (2×2 × 2×2)
        </text>
        {/* Matrix A */}
        <rect x="10" y="15" width="100" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
        <text x="15" y="8" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>A =</text>
        <text x="30" y="35" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>0.8  -1.2</text>
        <text x="30" y="55" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>0.5   0.9</text>
        {/* Matrix B */}
        <text x="125" y="8" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>B =</text>
        <rect x="120" y="15" width="100" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
        <text x="130" y="35" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>0.6   0.3</text>
        <text x="130" y="55" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>-0.4  1.1</text>

        {/* Computation */}
        <rect x="0" y="80" width="240" height="80" fill={selectedCell === 0 ? COLORS.highlight : COLORS.bg}
          stroke={COLORS.primary} strokeWidth="1" rx="3" cursor="pointer"
          onClick={() => setSelectedCell(selectedCell === 0 ? null : 0)} />
        <text x="120" y="98" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Cell (0,0) 计算路径
        </text>
        <text x="10" y="118" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>0.8 × 0.6 = 0.48</text>
        <text x="10" y="135" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>+ (-1.2) × (-0.4) = 0.48</text>
        <text x="10" y="152" fontSize="10" fill={COLORS.green} fontFamily={FONTS.mono}>= 0.96</text>
        <text x="160" y="118" fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans}>2 次乘法</text>
        <text x="160" y="135" fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans}>1 次加法</text>

        {/* Stats */}
        <rect x="0" y="175" width="240" height="40" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="3"/>
        <text x="120" y="193" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          总计: 4 次乘法 + 2 次加法
        </text>
        <text x="120" y="208" textAnchor="middle" fontSize="10" fill={COLORS.red} fontFamily={FONTS.mono}>= 6 FLOPs</text>
      </g>

      {/* Right: BitNet */}
      <g transform="translate(300, 45)">
        <text x="120" y="0" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>
          BitNet 三值 (2×2 × 2×2)
        </text>
        {/* Matrix A_t */}
        <rect x="10" y="15" width="90" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
        <text x="15" y="8" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>A =</text>
        <text x="25" y="35" fontSize="11" fill={COLORS.green} fontFamily={FONTS.mono}>+1  -1</text>
        <text x="25" y="55" fontSize="11" fill={COLORS.green} fontFamily={FONTS.mono}>+1  +1</text>
        {/* Matrix B_t */}
        <text x="115" y="8" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>B =</text>
        <rect x="110" y="15" width="90" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
        <text x="120" y="35" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>+1   0</text>
        <text x="120" y="55" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>-1  +1</text>

        {/* Computation */}
        <rect x="0" y="80" width="240" height="80" fill={selectedCell === 1 ? COLORS.highlight : COLORS.bg}
          stroke={COLORS.purple} strokeWidth="1" rx="3" cursor="pointer"
          onClick={() => setSelectedCell(selectedCell === 1 ? null : 1)} />
        <text x="120" y="98" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Cell (0,0) 计算路径
        </text>
        <text x="10" y="118" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>(+1)×(+1) → add X</text>
        <text x="10" y="135" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>(-1)×(-1) → add X</text>
        <text x="10" y="152" fontSize="10" fill={COLORS.green} fontFamily={FONTS.mono}>= +2 (0 次乘法)</text>
        <text x="160" y="118" fontSize="9" fill={COLORS.green} fontFamily={FONTS.sans}>0 次乘法</text>
        <text x="160" y="135" fontSize="9" fill={COLORS.green} fontFamily={FONTS.sans}>2 次加法</text>

        {/* Stats */}
        <rect x="0" y="175" width="240" height="40" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="3"/>
        <text x="120" y="193" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          总计: 0 次乘法 + 2 次加减
        </text>
        <text x="120" y="208" textAnchor="middle" fontSize="10" fill={COLORS.green} fontFamily={FONTS.mono}>+ 2 次跳过 (W=0)</text>
      </g>

      {/* Bottom comparison */}
      <rect x="40" y="295" width="500" height="35" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" rx="4"/>
      <text x="290" y="310" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        关键优势：BitNet 完全消除乘法运算
      </text>
      <text x="290" y="325" textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {'{-1, 0, +1}'} 只需加法器和符号位，无需浮点乘法单元
      </text>

      <text x="290" y="345" textAnchor="middle" fontSize="10" fontStyle="italic" fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击计算路径框查看详细步骤
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

### Task 14: QATvsPTQBoundary Component

**Files:**
- Create: `src/components/interactive/QATvsPTQBoundary.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;

export default function QATvsPTQBoundary() {
  const padding = { left: 60, right: 40, top: 40, bottom: 50 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const bitWidths = [1, 2, 3, 4, 5, 6, 7, 8];
  // Perplexity relative increase (illustrative)
  const ptqData = [250, 120, 45, 8, 3, 1.5, 0.8, 0.5];
  const qatData = [60, 25, 12, 5, 2, 1, 0.6, 0.4];

  const xScale = (bit: number) => padding.left + ((bit - 1) / 7) * chartW;
  const yScale = (val: number) => padding.top + chartH - (val / 250) * chartH;

  const ptqPath = bitWidths.map((bit, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(bit)} ${yScale(ptqData[i])}`
  ).join(' ');
  const qatPath = bitWidths.map((bit, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(bit)} ${yScale(qatData[i])}`
  ).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        QAT vs PTQ：何时值得训练？
      </text>

      {/* Y-axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke={COLORS.mid} strokeWidth="1.5"/>
      <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>250%</text>
      <text x={padding.left - 8} y={yScale(100) + 3} textAnchor="end" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>100%</text>
      <text x={padding.left - 8} y={yScale(50) + 3} textAnchor="end" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>50%</text>
      <text x={padding.left - 8} y={padding.top + chartH + 3} textAnchor="end" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>0%</text>
      <text x={18} y={(padding.top * 2 + chartH) / 2} textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}
        transform={`rotate(-90, 18, ${(padding.top * 2 + chartH) / 2})`}>
        Perplexity 相对增长
      </text>

      {/* X-axis */}
      <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke={COLORS.mid} strokeWidth="1.5"/>
      {bitWidths.map(bit => (
        <g key={bit}>
          <line x1={xScale(bit)} y1={padding.top + chartH} x2={xScale(bit)} y2={padding.top + chartH + 5} stroke={COLORS.mid} strokeWidth="1"/>
          <text x={xScale(bit)} y={padding.top + chartH + 18} textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>{bit}</text>
        </g>
      ))}
      <text x={padding.left + chartW / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
        Bit-width (位宽)
      </text>

      {/* Grid lines */}
      {[50, 100, 150, 200].map(val => (
        <line key={val} x1={padding.left} y1={yScale(val)} x2={padding.left + chartW} y2={yScale(val)}
          stroke={COLORS.light} strokeWidth="1" strokeDasharray="2,2"/>
      ))}

      {/* PTQ curve */}
      <path d={ptqPath} fill="none" stroke={COLORS.red} strokeWidth="2.5"/>
      {bitWidths.map((bit, i) => (
        <circle key={`ptq-${bit}`} cx={xScale(bit)} cy={yScale(ptqData[i])} r="3.5" fill={COLORS.red}/>
      ))}
      <text x={xScale(2) - 15} y={yScale(120) - 8} fontSize="11" fontWeight="600" fill={COLORS.red} fontFamily={FONTS.sans}>PTQ</text>

      {/* QAT curve */}
      <path d={qatPath} fill="none" stroke={COLORS.green} strokeWidth="2.5"/>
      {bitWidths.map((bit, i) => (
        <circle key={`qat-${bit}`} cx={xScale(bit)} cy={yScale(qatData[i])} r="3.5" fill={COLORS.green}/>
      ))}
      <text x={xScale(2) - 15} y={yScale(25) + 15} fontSize="11" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>QAT</text>

      {/* Crossover annotation */}
      <line x1={xScale(3)} y1={padding.top} x2={xScale(3)} y2={padding.top + chartH}
        stroke={COLORS.purple} strokeWidth="2" strokeDasharray="4,3"/>
      <rect x={xScale(3) - 52} y={yScale(80)} width="104" height="32" fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth="1.5" rx="3"/>
      <text x={xScale(3)} y={yScale(80) + 13} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>
        QAT 值得的分界线
      </text>
      <text x={xScale(3)} y={yScale(80) + 26} textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
        ~3-bit 以下推荐 QAT
      </text>

      {/* Method annotations */}
      <text x={xScale(8) + 3} y={yScale(0.5) - 2} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>8-bit RTN</text>
      <text x={xScale(4) + 5} y={yScale(8) - 4} fontSize="8" fill={COLORS.orange} fontFamily={FONTS.sans}>4-bit GPTQ/AWQ</text>
      <text x={xScale(3) - 55} y={yScale(12) - 4} fontSize="8" fill={COLORS.green} fontFamily={FONTS.sans}>3-bit QAT</text>
      <text x={xScale(1.58) - 10} y={yScale(60) + 20} fontSize="9" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>
        1.58-bit BitNet
      </text>

      {/* Legend */}
      <g transform={`translate(${padding.left + 15}, ${padding.top + 8})`}>
        <line x1="0" y1="0" x2="25" y2="0" stroke={COLORS.red} strokeWidth="2.5"/>
        <text x="30" y="4" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>PTQ (训练后量化)</text>
        <line x1="0" y1="16" x2="25" y2="16" stroke={COLORS.green} strokeWidth="2.5"/>
        <text x="30" y="20" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>QAT (量化感知训练)</text>
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

### Task 15: quantization-aware-training Article

**Files:**
- Create: `src/content/articles/zh/quantization-aware-training.mdx`

- [ ] **Step 1: Write the article**

Full article covering QAT fundamentals: Fake Quantization + STE mechanism, LoRA-QAT vs QLoRA distinction, BitNet 1.58-bit ternary quantization, and QAT vs PTQ decision boundary. ~200 lines of MDX with 3 component imports.

```mdx
---
title: "量化感知训练 (QAT)：让模型主动适应低比特"
slug: "quantization-aware-training"
locale: "zh"
tags: ["quantization", "qat", "ste", "lora-qat", "bitnet"]
difficulty: "advanced"
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: ["quantization-fundamentals"]
references:
  - type: "paper"
    title: "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference"
    url: "https://arxiv.org/abs/1712.05877"
  - type: "paper"
    title: "QLoRA: Efficient Finetuning of Quantized LLMs"
    url: "https://arxiv.org/abs/2305.14314"
  - type: "paper"
    title: "The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits"
    url: "https://arxiv.org/abs/2402.17764"
  - type: "paper"
    title: "BitNet: Scaling 1-bit Transformers for Large Language Models"
    url: "https://arxiv.org/abs/2310.11453"
---

import FakeQuantForwardBackward from '../../../components/interactive/FakeQuantForwardBackward.tsx';
import BitNetArithmetic from '../../../components/interactive/BitNetArithmetic.tsx';
import QATvsPTQBoundary from '../../../components/interactive/QATvsPTQBoundary.tsx';

## 简介

在 [量化基础](./quantization-fundamentals) 中，我们学习了训练后量化 (PTQ)——先训练完整精度模型，然后再量化。但当目标比特宽度降到 4-bit 以下时，PTQ 的精度损失开始急剧上升。量化感知训练 (Quantization-Aware Training, QAT) 通过在训练过程中模拟量化噪声，让模型主动学习适应低比特表示，从而在极低比特宽度下依然保持可用精度。

本文将深入讲解 QAT 的核心机制：Fake Quantization 节点如何在前向传播中引入量化噪声，Straight-Through Estimator (STE) 如何在反向传播中绕过不可导的 round() 操作，以及如何通过 LoRA-QAT 在保持基座模型冻结的情况下实现量化微调。最后，我们将探讨 BitNet 如何将量化推向极限——1.58-bit 的三值神经网络，完全消除浮点乘法运算。

---

## 1. QAT 核心思想：在训练中模拟量化噪声

PTQ 的核心假设是：模型权重在量化后的分布变化不大，损失的信息可以通过统计方法补偿回来。但这个假设在低比特下失效——当 $b \leq 3$ 时，量化误差呈指数级增长，单纯的 scale 调整无法挽救。

QAT 在训练的前向传播中插入 **Fake Quantization** 节点：

$$
\tilde{W} = \text{Dequant}(\text{Quant}(W)) = s \cdot \text{round}\left(\frac{W}{s}\right)
$$

前向传播使用 $\tilde{W}$ 计算 loss，让模型"感知"量化噪声。训练结束后，模型权重已经在训练中适应了量化分布，直接量化为目标比特宽度时精度损失大幅降低。

**直觉解释**：想象你在学习用筷子夹花生米。PTQ 是你先用手练熟了，最后换筷子时发现夹不起来。QAT 是你从一开始就戴着筷子练习，手指肌肉记忆已经适应了这种约束。

<FakeQuantForwardBackward client:visible />

---

## 2. Straight-Through Estimator (STE)

Fake Quantization 中的 $\text{round}(\cdot)$ 函数是不可导的：$\frac{\partial \text{round}(x)}{\partial x} = 0$（几乎处处）。如果直接按链式法则计算梯度，反向传播会在 round() 节点处中断。

STE 的解决方案：在反向传播时，**假装 round() 是恒等映射**：

$$
\frac{\partial \mathcal{L}}{\partial W} \approx \frac{\partial \mathcal{L}}{\partial \tilde{W}} \cdot I
$$

即梯度直接"穿过" (straight-through) round() 操作。虽然数学上不严格，但实践证明模型能收敛到"量化友好"的权重分布。

注意 QAT 训练时始终维护一份 **FP32 精度的 Master Weight**：$W_{t+1} = W_t - \eta \cdot \frac{\partial \mathcal{L}}{\partial W_t}$，只有前向传播时才通过 Fake Quant 生成 $\tilde{W}$。

---

## 3. LoRA-QAT vs QLoRA

两个容易混淆的概念：

- **QLoRA** (Dettmers et al., 2023)：先用 PTQ 将基座模型量化到 4-bit (NF4)，然后在量化后的权重上训练 LoRA adapter。目的是省显存做 fine-tuning。
- **LoRA-QAT**：冻结 FP32 基座模型，只对 LoRA adapter 做 QAT 训练，adapter 在训练中模拟量化噪声。目的是用低成本获得接近 QAT 的量化质量。

| 维度 | QLoRA | LoRA-QAT |
|------|-------|----------|
| 基座模型 | 4-bit NF4 量化 | FP32 冻结 |
| Adapter 训练 | FP16 全精度 | 带 Fake Quant |
| 适用比特宽度 | 4-bit 及以上 | 2-bit 及以下 |
| 目标场景 | 推理内存受限 | 极致压缩 |

---

## 4. BitNet：1.58-bit 的极限量化

BitNet (Ma et al., 2023) 将权重量化为 **三值** $\{-1, 0, +1\}$。理论上三值需要 $\log_2(3) \approx 1.585$ bit 存储。

三值量化的数学形式：$W_{\text{ternary}} = \text{sign}(W) \cdot \mathbb{1}_{|W| > \tau}$

矩阵乘法退化为加减法：
- $W = +1$：直接加 activation
- $W = -1$：直接减 activation
- $W = 0$：跳过

<BitNetArithmetic client:visible />

硬件实现只需要**加法器 + 符号位**，功耗和面积相比浮点乘法器降低 10-100 倍。

---

## 5. QAT vs PTQ：何时值得训练？

经验法则：
- **8-bit**：PTQ (RTN) 就够了，精度损失 < 1%
- **4-bit**：PTQ (GPTQ, AWQ) 精度可接受，QAT 提升有限
- **3-bit**：PTQ 精度损失 5-10%，QAT 可降到 2-3%
- **2-bit 及以下**：PTQ 几乎不可用，必须 QAT

<QATvsPTQBoundary />

**推荐策略：** 4-bit 及以上优先 PTQ；3-bit 视任务关键程度选择；2-bit 及以下必须 QAT 或 BitNet。

---

## 总结

QAT 通过在训练中模拟量化噪声，让模型主动适应低比特表示。核心技术栈：Fake Quantization + STE + FP32 Master Weight。适用场景是 3-bit 及以下的极限量化，4-bit 及以上 PTQ 已经足够。

## 延伸阅读

- Google 的 [QAT 奠基论文](https://arxiv.org/abs/1712.05877)
- [QLoRA paper](https://arxiv.org/abs/2305.14314)
- [BitNet](https://arxiv.org/abs/2310.11453) 和 [The Era of 1-bit LLMs](https://arxiv.org/abs/2402.17764)
```

- [ ] **Step 2: Validate and verify**

```bash
npm run validate && npm run dev
```

- [ ] **Step 3: Commit Article 3 and its components**

```bash
git add src/components/interactive/FakeQuantForwardBackward.tsx \
  src/components/interactive/BitNetArithmetic.tsx \
  src/components/interactive/QATvsPTQBoundary.tsx \
  src/content/articles/zh/quantization-aware-training.mdx
git commit -m "feat: add quantization-aware-training article with 3 components"
```

### Task 16: KVCacheMemoryCalculator Component

**Files:**
- Create: `src/components/interactive/KVCacheMemoryCalculator.tsx`

- [ ] **Step 1: Write the component**

This is a NEW component (not reusing existing `KVCacheCalculator.tsx`). It focuses on multi-precision comparison for quantization, with model presets and a log-scale sequence length slider.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

type ModelPreset = 'llama3-8b' | 'llama3-70b' | 'qwen3-72b' | 'custom';

interface ModelConfig {
  name: string;
  layers: number;
  heads: number;
  d_head: number;
  weightGB: number;
}

const PRESETS: Record<Exclude<ModelPreset, 'custom'>, ModelConfig> = {
  'llama3-8b': { name: 'Llama 3 8B', layers: 32, heads: 32, d_head: 128, weightGB: 16 },
  'llama3-70b': { name: 'Llama 3 70B', layers: 80, heads: 64, d_head: 128, weightGB: 140 },
  'qwen3-72b': { name: 'Qwen3 72B', layers: 80, heads: 64, d_head: 128, weightGB: 144 },
};

const QUANT_FORMATS = [
  { name: 'FP16', bytes: 2, color: COLORS.primary },
  { name: 'INT8', bytes: 1, color: COLORS.green },
  { name: 'FP8', bytes: 1, color: COLORS.orange },
  { name: 'INT4', bytes: 0.5, color: COLORS.purple },
];

function formatMem(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

export default function KVCacheMemoryCalculator() {
  const [preset, setPreset] = useState<ModelPreset>('llama3-8b');
  const [seqLenLog, setSeqLenLog] = useState(11); // 2^11 = 2048

  const config = preset === 'custom'
    ? { name: 'Custom', layers: 32, heads: 32, d_head: 128, weightGB: 16 }
    : PRESETS[preset];
  const seqLen = Math.round(Math.pow(2, seqLenLog));

  // KV size = 2 × layers × heads × d_head × seq_len × bytes_per_element
  const kvSizes = QUANT_FORMATS.map(fmt => ({
    ...fmt,
    size: 2 * config.layers * config.heads * config.d_head * seqLen * fmt.bytes,
  }));

  const maxSize = kvSizes[0].size * 1.15; // FP16 is always largest
  const chartX = 80;
  const chartY = 100;
  const chartW = W - 120;
  const chartH = 200;
  const barW = 70;
  const barGap = (chartW - barW * 4) / 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y="22" textAnchor="middle" fontSize="14" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        KV Cache 显存对比 ({config.name})
      </text>

      {/* Model preset buttons */}
      {(['llama3-8b', 'llama3-70b', 'qwen3-72b'] as const).map((p, i) => (
        <g key={p} onClick={() => setPreset(p)} cursor="pointer">
          <rect x={120 + i * 130} y={32} width={120} height={22} rx={4}
            fill={preset === p ? COLORS.primary : COLORS.bgAlt}
            stroke={preset === p ? COLORS.primary : COLORS.light} strokeWidth={1} />
          <text x={180 + i * 130} y={47} textAnchor="middle" fontSize="10"
            fontWeight={preset === p ? '700' : '400'}
            fill={preset === p ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {PRESETS[p].name}
          </text>
        </g>
      ))}

      {/* Sequence length slider label */}
      <text x={chartX} y={chartY - 25} fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
        Sequence Length:
      </text>
      <text x={chartX + 105} y={chartY - 25} fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.mono}>
        {seqLen.toLocaleString()} tokens
      </text>

      {/* Slider track (SVG-based) */}
      <rect x={chartX} y={chartY - 15} width={chartW} height={6} rx={3}
        fill={COLORS.light} />
      <rect x={chartX} y={chartY - 15}
        width={((seqLenLog - 9) / 8) * chartW} height={6} rx={3}
        fill={COLORS.primary} opacity={0.5} />
      {/* Slider knob area — use foreignObject for the actual input */}
      <foreignObject x={chartX - 5} y={chartY - 22} width={chartW + 10} height={20}>
        <input type="range" min="9" max="17" step="0.1" value={seqLenLog}
          onChange={e => setSeqLenLog(parseFloat(e.target.value))}
          style={{ width: '100%', opacity: 0, cursor: 'pointer', height: '20px' }} />
      </foreignObject>

      {/* Y-axis */}
      <line x1={chartX} y1={chartY} x2={chartX} y2={chartY + chartH}
        stroke={COLORS.light} strokeWidth="1" />
      <text x={chartX - 5} y={chartY + 5} textAnchor="end" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {formatMem(maxSize)}
      </text>
      <text x={chartX - 5} y={chartY + chartH} textAnchor="end" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>0</text>

      {/* Model weight reference line */}
      {(() => {
        const weightBytes = config.weightGB * 1e9;
        if (weightBytes < maxSize) {
          const y = chartY + chartH - (weightBytes / maxSize) * chartH;
          return (
            <>
              <line x1={chartX} x2={chartX + chartW} y1={y} y2={y}
                stroke={COLORS.red} strokeWidth="1" strokeDasharray="4,2" opacity={0.6} />
              <text x={chartX + chartW - 2} y={y - 4} textAnchor="end"
                fontSize="9" fill={COLORS.red} fontFamily={FONTS.sans}>
                模型权重: {config.weightGB} GB
              </text>
            </>
          );
        }
        return null;
      })()}

      {/* Bars */}
      {kvSizes.map((fmt, i) => {
        const x = chartX + barGap + i * (barW + barGap);
        const barH = (fmt.size / maxSize) * chartH;
        const y = chartY + chartH - barH;
        return (
          <g key={fmt.name}>
            <rect x={x} y={y} width={barW} height={barH}
              fill={fmt.color} opacity={0.85} rx={2} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle"
              fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {formatMem(fmt.size)}
            </text>
            <text x={x + barW / 2} y={chartY + chartH + 15} textAnchor="middle"
              fontSize="11" fontWeight="600" fill={fmt.color} fontFamily={FONTS.sans}>
              {fmt.name}
            </text>
          </g>
        );
      })}

      {/* Formula */}
      <text x={W / 2} y={H - 15} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.mono}>
        KV = 2 × layers × heads × d_head × seq_len × bytes
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

### Task 17: KVQuantSensitivity Component

**Files:**
- Create: `src/components/interactive/KVQuantSensitivity.tsx`

- [ ] **Step 1: Write the component**

A StepNavigator showing Key vs Value quantization sensitivity asymmetry in 4 steps.

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

// 4x4 mock matrices for visualization
const S_ORIG = [
  [0.42, 0.18, -0.05, 0.31],
  [0.28, 0.55, 0.09, -0.12],
  [-0.15, 0.33, 0.61, 0.14],
  [0.08, -0.22, 0.19, 0.47],
];
// Key quantization introduces dot-product amplified errors
const S_KQUANT = [
  [0.39, 0.21, -0.08, 0.28],
  [0.25, 0.50, 0.14, -0.16],
  [-0.19, 0.29, 0.55, 0.18],
  [0.12, -0.18, 0.23, 0.42],
];
// Value quantization errors get averaged out
const O_ORIG = [
  [0.72, -0.18, 0.35, 0.51],
  [0.64, 0.42, -0.08, 0.33],
  [-0.11, 0.78, 0.49, -0.15],
  [0.38, 0.15, 0.69, 0.44],
];
const O_VQUANT = [
  [0.71, -0.17, 0.34, 0.50],
  [0.63, 0.41, -0.07, 0.32],
  [-0.10, 0.77, 0.48, -0.14],
  [0.37, 0.14, 0.68, 0.43],
];

function errColor(err: number, maxErr: number): string {
  const t = err / maxErr;
  if (t > 0.6) return COLORS.red;
  if (t > 0.3) return COLORS.orange;
  return COLORS.green;
}

function valColor(val: number): string {
  if (val > 0.4) return COLORS.primary;
  if (val > 0.1) return '#5c9ce6';
  if (val > -0.1) return COLORS.bgAlt;
  return '#e89090';
}

function Matrix({ data, x, y, label, colorFn }: {
  data: number[][]; x: number; y: number; label: string;
  colorFn: (v: number) => string;
}) {
  const cell = 38;
  return (
    <g>
      <text x={x} y={y - 8} fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {data.map((row, i) => row.map((val, j) => (
        <g key={`${i}-${j}`}>
          <rect x={x + j * cell} y={y + i * cell} width={cell - 2} height={cell - 2}
            fill={colorFn(val)} stroke={COLORS.light} strokeWidth="1" rx="2" />
          <text x={x + j * cell + cell / 2} y={y + i * cell + cell / 2 + 4}
            textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.dark}
            fontFamily={FONTS.mono}>{val.toFixed(2)}</text>
        </g>
      )))}
    </g>
  );
}

export default function KVQuantSensitivity() {
  const errK = S_ORIG.map((row, i) => row.map((v, j) => Math.abs(v - S_KQUANT[i][j])));
  const errV = O_ORIG.map((row, i) => row.map((v, j) => Math.abs(v - O_VQUANT[i][j])));
  const maxErrK = Math.max(...errK.flat());
  const maxErrV = Math.max(...errV.flat());

  const steps = [
    {
      title: '1. 原始 Attention Scores',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            S = QK^T / √d (全精度)
          </text>
          <Matrix data={S_ORIG} x={190} y={50} label="Attention Scores S"
            colorFn={valColor} />
          <text x={W / 2} y={240} textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
            Baseline: 全精度 Q 和 K 计算的 attention scores
          </text>
        </svg>
      ),
    },
    {
      title: '2. 量化 Key → Score 误差',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            S' = Q · quant(K)^T / √d
          </text>
          <Matrix data={S_KQUANT} x={40} y={50} label="S' (Key 量化后)"
            colorFn={valColor} />
          <Matrix data={errK} x={280} y={50} label="误差热力图"
            colorFn={(v) => errColor(v, maxErrK)} />
          <text x={280} y={220} fontSize="10" fontWeight="600" fill={COLORS.red} fontFamily={FONTS.sans}>
            点积放大了 Key 量化误差
          </text>
          <text x={280} y={236} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
            max error = {maxErrK.toFixed(3)}
          </text>
        </svg>
      ),
    },
    {
      title: '3. 量化 Value → Output 误差',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            O' = softmax(S) · quant(V)
          </text>
          <Matrix data={O_VQUANT} x={40} y={50} label="O' (Value 量化后)"
            colorFn={valColor} />
          <Matrix data={errV} x={280} y={50} label="误差热力图"
            colorFn={(v) => errColor(v, maxErrV)} />
          <text x={280} y={220} fontSize="10" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
            加权求和有平均效应，误差较小
          </text>
          <text x={280} y={236} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
            max error = {maxErrV.toFixed(3)}
          </text>
        </svg>
      ),
    },
    {
      title: '4. 结论：Key 需要更高精度',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={30} textAnchor="middle" fontSize="15" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            KV Quantization Sensitivity
          </text>
          <rect x={70} y={60} width={440} height={70} fill={COLORS.bgAlt}
            stroke={COLORS.red} strokeWidth="2" rx="6" />
          <text x={290} y={85} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>Key 量化误差: 高</text>
          <text x={290} y={105} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Q·K 点积放大量化噪声 → Key 需要 FP16/FP8
          </text>
          <rect x={70} y={150} width={440} height={70} fill={COLORS.bgAlt}
            stroke={COLORS.green} strokeWidth="2" rx="6" />
          <text x={290} y={175} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>Value 量化误差: 低</text>
          <text x={290} y={195} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            加权求和平均噪声 → Value 可用 INT8/INT4
          </text>
          <text x={W / 2} y={255} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            实践策略: 非对称量化 (Key INT8 + Value INT4)
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

### Task 18: ActivationOutlierViz Component

**Files:**
- Create: `src/components/interactive/ActivationOutlierViz.tsx`

- [ ] **Step 1: Write the component**

Interactive visualization showing how activation outliers affect per-tensor vs per-channel quantization.

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;
const TOKENS = 8;
const CHANNELS = 16;
const OUTLIER_CHANNELS = [5, 12];

// Generate deterministic activations (seeded by index)
function generateActivations(): number[][] {
  const act: number[][] = [];
  for (let i = 0; i < TOKENS; i++) {
    const row: number[] = [];
    for (let j = 0; j < CHANNELS; j++) {
      const base = Math.sin(i * 7 + j * 13) * 3; // -3 to 3
      if (OUTLIER_CHANNELS.includes(j)) {
        row.push(base + 60 + Math.sin(i * 3 + j) * 20); // 37 to 83
      } else {
        row.push(base); // -3 to 3
      }
    }
    act.push(row);
  }
  return act;
}

const ACT = generateActivations();

function quantErrors(act: number[][], mode: 'per-tensor' | 'per-channel'): number[][] {
  if (mode === 'per-tensor') {
    let maxAbs = 0;
    for (const row of act) for (const v of row) maxAbs = Math.max(maxAbs, Math.abs(v));
    const scale = maxAbs / 127;
    return act.map(row => row.map(v => Math.abs(v - Math.round(v / scale) * scale)));
  } else {
    const scales: number[] = [];
    for (let j = 0; j < CHANNELS; j++) {
      let maxAbs = 0;
      for (let i = 0; i < TOKENS; i++) maxAbs = Math.max(maxAbs, Math.abs(act[i][j]));
      scales.push(maxAbs / 127);
    }
    return act.map(row => row.map((v, j) => Math.abs(v - Math.round(v / scales[j]) * scales[j])));
  }
}

export default function ActivationOutlierViz() {
  const [mode, setMode] = useState<'per-tensor' | 'per-channel'>('per-tensor');

  const errors = useMemo(() => quantErrors(ACT, mode), [mode]);
  const maxAct = Math.max(...ACT.flat().map(Math.abs));
  const maxErr = Math.max(...errors.flat());

  const cellW = 28;
  const cellH = 18;
  const mapX = 50;
  const actY = 55;
  const errY = 255;

  const actColor = (val: number) => {
    const t = Math.abs(val) / maxAct;
    const r = Math.round(26 + t * 200);
    const g = Math.round(26 + (1 - t) * 100);
    const b = Math.round(46 + (1 - t) * 100);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const errColorFn = (err: number) => {
    if (maxErr === 0) return COLORS.green;
    const t = err / maxErr;
    if (t > 0.5) return COLORS.red;
    if (t > 0.2) return COLORS.orange;
    return COLORS.green;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Activation Outlier 对量化的影响
      </text>

      {/* Activation heatmap */}
      <text x={mapX} y={actY - 8} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Activation Matrix ({TOKENS} tokens × {CHANNELS} channels)
      </text>
      {ACT.map((row, i) => row.map((val, j) => (
        <rect key={`a-${i}-${j}`} x={mapX + j * cellW} y={actY + i * cellH}
          width={cellW - 1} height={cellH - 1} fill={actColor(val)}
          stroke={COLORS.light} strokeWidth="0.5" />
      )))}
      {/* Outlier markers */}
      {OUTLIER_CHANNELS.map(ch => (
        <g key={ch}>
          <rect x={mapX + ch * cellW} y={actY} width={cellW - 1}
            height={cellH * TOKENS - 1} fill="none" stroke={COLORS.red} strokeWidth="2" />
          <text x={mapX + ch * cellW + cellW / 2} y={actY - 2} textAnchor="middle"
            fontSize="8" fontWeight="700" fill={COLORS.red} fontFamily={FONTS.sans}>
            Outlier
          </text>
        </g>
      ))}

      {/* Toggle buttons */}
      {(['per-tensor', 'per-channel'] as const).map((m, i) => (
        <g key={m} onClick={() => setMode(m)} cursor="pointer">
          <rect x={140 + i * 170} y={actY + cellH * TOKENS + 12} width={150} height={26} rx={5}
            fill={mode === m ? COLORS.primary : COLORS.bg}
            stroke={mode === m ? COLORS.primary : COLORS.light} strokeWidth="1.5" />
          <text x={215 + i * 170} y={actY + cellH * TOKENS + 30} textAnchor="middle"
            fontSize="11" fontWeight={mode === m ? '700' : '400'}
            fill={mode === m ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {m === 'per-tensor' ? 'Per-Tensor' : 'Per-Channel'}
          </text>
        </g>
      ))}

      {/* Error heatmap */}
      <text x={mapX} y={errY - 8} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        量化误差 ({mode})
      </text>
      {errors.map((row, i) => row.map((err, j) => (
        <rect key={`e-${i}-${j}`} x={mapX + j * cellW} y={errY + i * cellH}
          width={cellW - 1} height={cellH - 1} fill={errColorFn(err)}
          stroke={COLORS.light} strokeWidth="0.5" />
      )))}

      {/* Annotation */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {mode === 'per-tensor'
          ? 'Per-tensor: Outlier 拉大 scale → 正常值精度崩溃 (红色)'
          : 'Per-channel: 每个 channel 独立 scale → 误差均匀且小 (绿色)'}
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

### Task 19: E2EQuantStackDiagram Component

**Files:**
- Create: `src/components/interactive/E2EQuantStackDiagram.tsx`

- [ ] **Step 1: Write the component**

Static SVG pipeline showing the end-to-end quantization stack during inference.

```tsx
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 500;

interface Block {
  label: string;
  dtype: string;
  color: string;
  hasDequant?: boolean;
}

const BLOCKS: Block[] = [
  { label: 'Input Tokens', dtype: '', color: COLORS.light },
  { label: 'Embedding', dtype: 'FP16', color: COLORS.primary },
  { label: 'Attention QKV Projection', dtype: 'INT4 weight → dequant → FP16', color: COLORS.purple, hasDequant: true },
  { label: 'Attention Score (softmax)', dtype: 'FP16 (高精度)', color: COLORS.green },
  { label: 'KV Cache', dtype: 'INT8 / FP8', color: COLORS.orange },
  { label: 'Attention Output', dtype: 'FP16', color: COLORS.primary },
  { label: 'FFN', dtype: 'INT4 weight → dequant → FP16', color: COLORS.purple, hasDequant: true },
  { label: 'LayerNorm', dtype: 'FP32', color: COLORS.red },
  { label: 'Output Logits', dtype: 'FP16', color: COLORS.primary },
];

export default function E2EQuantStackDiagram() {
  const blockW = 380;
  const blockH = 40;
  const gap = 8;
  const startX = (W - blockW) / 2;
  const startY = 40;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="e2e-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
        </marker>
      </defs>

      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        端到端推理量化栈
      </text>

      {BLOCKS.map((block, i) => {
        const y = startY + i * (blockH + gap);
        return (
          <g key={i}>
            {/* Connection arrow */}
            {i > 0 && (
              <line x1={startX + blockW / 2} y1={y - gap + 1}
                x2={startX + blockW / 2} y2={y - 1}
                stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#e2e-arrow)" />
            )}
            {/* Block */}
            <rect x={startX} y={y} width={blockW} height={blockH}
              fill={block.color} opacity={0.15} stroke={block.color}
              strokeWidth="2" rx="5" />
            <text x={startX + blockW / 2} y={y + (block.dtype ? 15 : 24)}
              textAnchor="middle" fontSize="12" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {block.label}
            </text>
            {block.dtype && (
              <text x={startX + blockW / 2} y={y + 30}
                textAnchor="middle" fontSize="9"
                fill={COLORS.mid} fontFamily={FONTS.mono}>
                {block.dtype}
              </text>
            )}
            {/* Dequant annotation */}
            {block.hasDequant && (
              <>
                <polygon points={`${startX + blockW + 8},${y + blockH / 2} ${startX + blockW + 16},${y + blockH / 2 - 5} ${startX + blockW + 16},${y + blockH / 2 + 5}`}
                  fill={COLORS.orange} />
                <text x={startX + blockW + 20} y={y + blockH / 2 + 4}
                  fontSize="8" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.mono}>
                  dequant
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Key observations */}
      <g transform={`translate(${startX}, ${startY + BLOCKS.length * (blockH + gap) + 5})`}>
        <text x="0" y="0" fontSize="9" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          要点:
        </text>
        <text x="0" y="14" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          • 权重 INT4 存储，推理时即时 dequant 为 FP16 计算
        </text>
        <text x="0" y="26" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          • KV Cache INT8/FP8 减少长上下文显存
        </text>
        <text x="0" y="38" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          • Softmax + LayerNorm 需高精度 (FP16/FP32)
        </text>
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run dev
```

### Task 20: inference-time-quantization Article

**Files:**
- Create: `src/content/articles/zh/inference-time-quantization.mdx`

- [ ] **Step 1: Write the article**

Full article covering KV cache memory bottleneck, KV quantization methods, KIVI/KVQuant, activation outlier problem, FP8 formats, and E2E deployment stacks. ~200 lines of MDX with 4 component imports.

```mdx
---
title: "推理时量化：KV Cache 与 Activation 量化"
slug: "inference-time-quantization"
locale: "zh"
tags: ["quantization", "kv-cache", "activation-quantization", "fp8", "inference-optimization"]
difficulty: "advanced"
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: ["quantization-fundamentals", "kv-cache"]
references:
  - type: "paper"
    title: "KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization"
    url: "https://arxiv.org/abs/2401.18079"
  - type: "paper"
    title: "KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache"
    url: "https://arxiv.org/abs/2402.02750"
  - type: "paper"
    title: "FP8 Formats for Deep Learning"
    url: "https://arxiv.org/abs/2209.05433"
---

import KVCacheMemoryCalculator from '../../../components/interactive/KVCacheMemoryCalculator.tsx';
import KVQuantSensitivity from '../../../components/interactive/KVQuantSensitivity.tsx';
import ActivationOutlierViz from '../../../components/interactive/ActivationOutlierViz.tsx';
import E2EQuantStackDiagram from '../../../components/interactive/E2EQuantStackDiagram.tsx';

## 简介

权重量化解决了模型存储与加载问题，但在实际推理时，内存瓶颈往往来自 **动态生成的中间数据**：KV cache 和 activation tensors。对于长上下文推理，KV cache 可能占用数十 GB 显存；对于高吞吐场景，activation memory 的带宽消耗成为关键限制因素。

**推理时量化** 专注于这些运行时数据的压缩，与权重量化互补，共同构成完整的端到端量化方案。

---

## 1. KV Cache 的显存瓶颈

在 autoregressive 生成中，每个 token 的 key 和 value vectors 被缓存。内存占用公式：

$$
\text{KV size} = 2 \times L \times n_h \times d_h \times S \times \text{bytes}
$$

以 Llama 3 70B (80 layers, 64 heads, d_head=128) + 128K context 为例：FP16 下 KV cache ≈ 160 GB，远超模型权重（~140 GB）。

<KVCacheMemoryCalculator client:visible />

---

## 2. KV Cache 量化方法

### Per-Token vs Per-Channel

- **Per-token**：每个 token 的 K/V vector 独立计算 scale，适应动态范围
- **Per-channel**：每个 head dimension 一个 scale，开销小但精度受限

### Key vs Value 的不对称性

Key 参与 $QK^T$ 点积运算，量化误差被放大；Value 参与加权求和 $\text{softmax} \cdot V$，误差被平均。因此 Key 需要更高精度。

<KVQuantSensitivity client:visible />

### KIVI 与 KVQuant

- **KIVI** (ICLR 2024)：Key per-channel INT8 + Value per-token INT2，利用 Key/Value 分布差异
- **KVQuant**：非均匀量化 + dense-and-sparse 混合方案，少量 outlier 保留 FP16

实验结果：Llama 2 70B + 100K context，KV cache 从 32 GB 降至 8 GB，perplexity 增加 < 0.1。

---

## 3. Activation 量化的挑战

推理时每层的 activation tensors 也需量化以减少 memory bandwidth。但 activation 存在 **系统性 outlier**：少数 channel 的值比其他大 100-1000 倍。

原因：LayerNorm 后分布不均匀；特定 token 在深层触发 outlier；outlier channel 跨 token 一致。

<ActivationOutlierViz client:visible />

解决方案：
- **Mixed-precision**：outlier channels 保持 FP16，其余 INT8
- **Per-channel scaling**：每个 channel 独立量化
- **Smoothing**：SmoothQuant 在训练后调整分布

---

## 4. FP8：硬件友好的低精度浮点

| 格式 | Exponent | Mantissa | 动态范围 | 用途 |
|------|----------|----------|----------|------|
| **E4M3** | 4 bit | 3 bit | ±448 | Forward activation (高精度) |
| **E5M2** | 5 bit | 2 bit | ±57,344 | Gradient (大范围) |

H100 FP8 Tensor Core 吞吐量是 FP16 的 2 倍。FP8 vs INT8：FP8 保留动态范围更适合非均匀分布，INT8 在均匀分布时精度更高。

---

## 5. 端到端量化部署

<E2EQuantStackDiagram />

**典型配置：**
- **显存优先**：W4A16 + KV INT8（GPTQ/AWQ weight + per-token KV quant）
- **速度优先**：W8A8 + KV FP8（SmoothQuant + H100 FP8 Tensor Core）
- **平衡方案**：W4A16 + KV INT4（AWQ weight + KIVI KV cache）

**工具链**：
- llama.cpp：`--cache-type-k q4_0` 启用 KV cache 量化
- vLLM：FP8 KV cache (`--kv-cache-dtype fp8_e4m3`)
- TensorRT-LLM：端到端 INT4 权重 + FP8 activation

---

## 总结

推理时量化的核心挑战：KV cache 是长上下文的主要显存瓶颈，activation outlier 需要 mixed-precision 或 FP8。量化不是单一决策，是 weight/activation/KV cache 三个维度的联合优化。

## 延伸阅读

- [KV Cache 机制](./kv-cache) — 理解 KV cache 工作原理
- [量化基础](./quantization-fundamentals) — 对称与非对称量化
- [训练后量化](./ptq-weight-quantization) — GPTQ/AWQ/SmoothQuant
- [量化感知训练](./quantization-aware-training) — QAT 与 BitNet
```

- [ ] **Step 2: Validate and verify**

```bash
npm run validate && npm run dev
```

- [ ] **Step 3: Commit Article 4 and its components**

```bash
git add src/components/interactive/KVCacheMemoryCalculator.tsx \
  src/components/interactive/KVQuantSensitivity.tsx \
  src/components/interactive/ActivationOutlierViz.tsx \
  src/components/interactive/E2EQuantStackDiagram.tsx \
  src/content/articles/zh/inference-time-quantization.mdx
git commit -m "feat: add inference-time-quantization article with 4 components"
```

### Task 21: Q4KMBitPacking Component

**Files:**
- Create: `src/components/interactive/Q4KMBitPacking.tsx`

- [ ] **Step 1: Write the component**

Interactive visualization of Q4_K_M super-block memory layout. Click byte regions to see field details and corresponding original weight values.

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

type Region = 'super-d' | 'super-dmin' | 'sub-scales' | 'sub-mins' | 'quant-hi' | 'quant-lo';

interface RegionInfo {
  name: string;
  color: string;
  byteStart: number;
  byteEnd: number;
  bitCount: number;
  desc: string;
}

const REGIONS: Record<Region, RegionInfo> = {
  'super-d':    { name: 'Super-scale (d)',   color: COLORS.primary, byteStart: 0,  byteEnd: 2,   bitCount: 16, desc: 'FP16 全局缩放因子' },
  'super-dmin': { name: 'Super-min (dmin)',  color: COLORS.primary, byteStart: 2,  byteEnd: 4,   bitCount: 16, desc: 'FP16 全局偏移' },
  'sub-scales': { name: 'Sub-block scales',  color: COLORS.orange,  byteStart: 4,  byteEnd: 10,  bitCount: 48, desc: '8×6-bit 子块缩放因子' },
  'sub-mins':   { name: 'Sub-block mins',    color: COLORS.orange,  byteStart: 10, byteEnd: 16,  bitCount: 48, desc: '8×6-bit 子块偏移' },
  'quant-hi':   { name: 'Quant values (hi)', color: '#9e9e9e',      byteStart: 16, byteEnd: 80,  bitCount: 512, desc: '256×2-bit 高位' },
  'quant-lo':   { name: 'Quant values (lo)', color: '#757575',      byteStart: 80, byteEnd: 144, bitCount: 1024, desc: '256×4-bit 低位' },
};

const TOTAL_BYTES = 144;
const NUM_VALUES = 256;
const BLOCK_SIZE = 32;

// Deterministic synthetic weights
const FP16_VALUES = Array.from({ length: NUM_VALUES }, (_, i) => {
  const sub = Math.floor(i / BLOCK_SIZE);
  return Math.sin(i * 0.3 + sub * 1.7) * 0.08;
});
const maxAbs = Math.max(...FP16_VALUES.map(Math.abs));

export default function Q4KMBitPacking() {
  const [selected, setSelected] = useState<Region | null>(null);

  const valW = (W - 40) / NUM_VALUES;
  const valY = 45;
  const valH = 45;
  const byteY = 150;
  const bytesPerRow = 36;
  const byteSize = 12;

  function getRegion(byteIdx: number): Region | null {
    for (const [key, r] of Object.entries(REGIONS)) {
      if (byteIdx >= r.byteStart && byteIdx < r.byteEnd) return key as Region;
    }
    return null;
  }

  const info = selected ? REGIONS[selected] : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Q4_K_M Super-block 内存布局 (256 值 → 144 字节)
      </text>

      {/* Original FP16 values */}
      <text x={20} y={valY - 5} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        原始 FP16 权重
      </text>
      {FP16_VALUES.map((val, i) => {
        const t = Math.abs(val) / maxAbs;
        const fill = val >= 0
          ? `rgba(21,101,192,${0.2 + t * 0.8})`
          : `rgba(198,40,40,${0.2 + t * 0.8})`;
        return (
          <rect key={i} x={20 + i * valW} y={valY} width={valW - 0.3} height={valH}
            fill={fill} opacity={selected ? 0.3 : 1} />
        );
      })}
      {/* Sub-block boundaries */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={20 + i * BLOCK_SIZE * valW} y1={valY}
          x2={20 + i * BLOCK_SIZE * valW} y2={valY + valH}
          stroke={COLORS.dark} strokeWidth="0.8" opacity={0.4} />
      ))}

      {/* Formula */}
      <text x={20} y={valY + valH + 18} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
        wᵢ = d · sᵦ · qᵢ − dmin · mᵦ
      </text>

      {/* Byte stream */}
      <text x={20} y={byteY - 5} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        压缩后字节流 (144 bytes)
      </text>
      {Array.from({ length: TOTAL_BYTES }, (_, idx) => {
        const row = Math.floor(idx / bytesPerRow);
        const col = idx % bytesPerRow;
        const region = getRegion(idx);
        const color = region ? REGIONS[region].color : COLORS.light;
        const isHL = selected && region === selected;
        return (
          <rect key={idx} x={20 + col * byteSize} y={byteY + row * (byteSize + 2)}
            width={byteSize - 1} height={byteSize - 1}
            fill={color} opacity={isHL ? 1 : (selected ? 0.3 : 0.8)}
            stroke={isHL ? COLORS.green : COLORS.dark} strokeWidth={isHL ? 2 : 0.3}
            cursor="pointer" rx="1"
            onClick={() => {
              if (region) setSelected(selected === region ? null : region);
            }} />
        );
      })}

      {/* Region labels under byte stream */}
      <text x={20} y={byteY + 4 * (byteSize + 2) + 14} fontSize="8"
        fill={COLORS.primary} fontFamily={FONTS.sans}>d | dmin</text>
      <text x={80} y={byteY + 4 * (byteSize + 2) + 14} fontSize="8"
        fill={COLORS.orange} fontFamily={FONTS.sans}>scales | mins</text>
      <text x={200} y={byteY + 4 * (byteSize + 2) + 14} fontSize="8"
        fill="#9e9e9e" fontFamily={FONTS.sans}>quant hi-2bit</text>
      <text x={340} y={byteY + 4 * (byteSize + 2) + 14} fontSize="8"
        fill="#757575" fontFamily={FONTS.sans}>quant lo-4bit</text>

      {/* Detail panel */}
      <rect x={390} y={valY} width={170} height={135} rx={4}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={400} y={valY + 18} fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {info ? info.name : '点击字节查看详情'}
      </text>
      {info && (
        <>
          <text x={400} y={valY + 38} fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.mono}>
            Bytes: {info.byteStart}-{info.byteEnd}
          </text>
          <text x={400} y={valY + 55} fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.mono}>
            Bits: {info.bitCount}
          </text>
          <text x={400} y={valY + 75} fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {info.desc}
          </text>
          <rect x={400} y={valY + 90} width={60} height={14} rx={2}
            fill={info.color} opacity={0.3} />
          <text x={430} y={valY + 100} textAnchor="middle" fontSize="8"
            fill={COLORS.dark} fontFamily={FONTS.sans}>区域颜色</text>
          <text x={400} y={valY + 125} fontSize="8"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {info.byteEnd - info.byteStart} bytes / 144 total
          </text>
        </>
      )}

      {/* Bottom note */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击字节流中的区域查看字段详情 | Q4_K_M 平均 ~4.84 bits per weight
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

### Task 22: Expand llama-cpp-quantization Article

**Files:**
- Modify: `src/content/articles/zh/llama-cpp-quantization.mdx`

This task assumes Task 0 has already renamed `ollama-quantization.mdx` to `llama-cpp-quantization.mdx`.

- [ ] **Step 1: Add Q4KMBitPacking import**

After the existing imports (QuantizationProcess, KQuantMixedPrecision, QuantizationTradeoff), add:

```tsx
import Q4KMBitPacking from '../../../components/interactive/Q4KMBitPacking.tsx';
```

- [ ] **Step 2: Insert Q4_K_M deep dive section**

After the existing K-quant mixed precision section, insert ~40 lines:

```markdown
### Q4_K_M 内存布局深度解析

Q4_K_M 是 K-quant 系列中平衡精度与压缩率的最佳选择。其 super-block 设计利用分层缩放（hierarchical scaling）实现高效量化。

**Super-block 结构**：每个 super-block 包含 256 个权重值，分为 8 个 sub-block（每个 32 值）。量化公式为：

$$
w_i = d \cdot s_b \cdot q_i - dmin \cdot m_b
$$

其中 $d$ 是 super-block scale (FP16)，$dmin$ 是 super-block min (FP16)，$s_b$ 和 $m_b$ 是 sub-block 级 6-bit scale 和 min，$q_i$ 是量化值。

**内存布局** (144 bytes per super-block)：
1. 0-2 bytes：super-scale $d$ (FP16)
2. 2-4 bytes：super-min $dmin$ (FP16)
3. 4-10 bytes：8 个 sub-block scales (各 6 bit，打包)
4. 10-16 bytes：8 个 sub-block mins (各 6 bit，打包)
5. 16-80 bytes：256 个量化值高 2 位 (64 bytes)
6. 80-144 bytes：256 个量化值低 4 位 (64 bytes)

**为什么分离高低位？** 现代 CPU 的 SIMD 指令处理连续内存更高效。

<Q4KMBitPacking client:visible />

Q4_K_M 相比 Q4_0：精度提升约 15%，文件大小仅增 8%，推理速度几乎无差异。
```

- [ ] **Step 3: Insert KV Cache quantization mini-section**

Before the "为什么不一样" section, insert:

```markdown
## KV Cache 量化

llama.cpp 支持 KV cache 量化以减少长上下文推理显存：

```bash
llama-cli --model model.gguf --cache-type-k q4_0 --cache-type-v q4_0
```

100K context 下 KV INT4 可将显存从 32 GB 降至 8 GB（4× 压缩），perplexity 仅增加 0.1。详细原理见 [推理时量化](./inference-time-quantization)。
```

- [ ] **Step 4: Add cross-references**

At the end of "为什么不一样" section, add:

```markdown
**进一步学习：**
- 权重量化深度 → [训练后量化](./ptq-weight-quantization)
- 训练优化 → [量化感知训练](./quantization-aware-training)
- 推理优化 → [推理时量化](./inference-time-quantization)
```

- [ ] **Step 5: Validate and verify**

```bash
npm run validate && npm run dev
```

- [ ] **Step 6: Commit Article 5 and its component**

```bash
git add src/components/interactive/Q4KMBitPacking.tsx \
  src/content/articles/zh/llama-cpp-quantization.mdx
git commit -m "feat: expand llama-cpp-quantization with Q4_K_M deep dive and cross-references"
```

