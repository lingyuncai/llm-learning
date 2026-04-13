import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
}

interface TreeNode {
  value: number;
  label: string;
  x: number;
  y: number;
  isLeaf: boolean;
  hasLoss: boolean;
  children?: [number, number];
}

/* ─── Constants ─── */

// Use 1e-8: clearly below FP32 ULP at 1.0 (~1.19e-7), so 1.0 + 1e-8 = 1.0 in FP32 (absorbed)
const VALUES = [1.0, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8];
const TRUE_SUM = 1.0 + 7e-8; // exact value in infinite precision

/* ─── FP32 simulation helpers ─── */

function fp32Add(a: number, b: number): number {
  return Math.fround(Math.fround(a) + Math.fround(b));
}

/* ─── Reduction computations ─── */

function computeSequential(): { result: number; steps: number[][] } {
  const steps: number[][] = [];
  let sum = Math.fround(VALUES[0]);
  for (let i = 1; i < VALUES.length; i++) {
    const prev = sum;
    sum = fp32Add(sum, VALUES[i]);
    steps.push([prev, VALUES[i], sum]);
  }
  return { result: sum, steps };
}

function computePairwise(): { result: number; steps: number[][] } {
  const steps: number[][] = [];
  // Pair small values first, then combine with large
  const small = VALUES.slice(1).map(v => Math.fround(v));

  // Level 1: pair small values
  let level: number[] = [];
  for (let i = 0; i < small.length; i += 2) {
    const a = small[i];
    const b = i + 1 < small.length ? small[i + 1] : 0;
    const s = fp32Add(a, b);
    steps.push([a, b, s]);
    level.push(s);
  }
  // Level 2: pair again
  let nextLevel: number[] = [];
  for (let i = 0; i < level.length; i += 2) {
    const a = level[i];
    const b = i + 1 < level.length ? level[i + 1] : 0;
    const s = fp32Add(a, b);
    steps.push([a, b, s]);
    nextLevel.push(s);
  }
  // Level 3: pair last two
  if (nextLevel.length >= 2) {
    const s = fp32Add(nextLevel[0], nextLevel[1]);
    steps.push([nextLevel[0], nextLevel[1], s]);
    nextLevel = [s];
  }
  // Final: add to large value
  const result = fp32Add(Math.fround(VALUES[0]), nextLevel[0]);
  steps.push([VALUES[0], nextLevel[0], result]);
  return { result, steps };
}

function computeReversed(): { result: number; steps: number[][] } {
  const steps: number[][] = [];
  let sum = Math.fround(0);
  // Accumulate small values first
  for (let i = VALUES.length - 1; i >= 1; i--) {
    const prev = sum;
    sum = fp32Add(sum, VALUES[i]);
    steps.push([prev, VALUES[i], sum]);
  }
  // Add the large value last
  const result = fp32Add(sum, VALUES[0]);
  steps.push([sum, VALUES[0], result]);
  return { result, steps };
}

/* ─── Reduction order definitions ─── */

interface ReductionOrder {
  id: string;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  compute: () => { result: number; steps: number[][] };
  treeType: 'sequential' | 'pairwise' | 'reversed';
}

const REDUCTION_ORDERS: ReductionOrder[] = [
  {
    id: 'left_to_right',
    label: { zh: '顺序求和 (left-to-right)', en: 'Sequential sum (left-to-right)' },
    description: {
      zh: '((((((1.0 + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8',
      en: '((((((1.0 + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8) + 1e-8',
    },
    compute: computeSequential,
    treeType: 'sequential',
  },
  {
    id: 'pairwise',
    label: { zh: '成对求和 (pairwise)', en: 'Pairwise sum' },
    description: {
      zh: '先将小值两两求和，再与大值合并',
      en: 'Pair small values first, then combine with large value',
    },
    compute: computePairwise,
    treeType: 'pairwise',
  },
  {
    id: 'reversed',
    label: { zh: '反向求和 (small-first)', en: 'Reversed sum (small-first)' },
    description: {
      zh: '先累加所有小值，最后加大值：(1e-8 + ... + 1e-8) + 1.0',
      en: 'Accumulate small values first, then add large: (1e-8 + ... + 1e-8) + 1.0',
    },
    compute: computeReversed,
    treeType: 'reversed',
  },
];

/* ─── Tree layout builders ─── */

function buildSequentialTree(): TreeNode[] {
  const nodes: TreeNode[] = [];
  const leafY = 30;
  const spacing = 82;
  const startX = 60;

  // Leaf nodes (values)
  for (let i = 0; i < VALUES.length; i++) {
    nodes.push({
      value: VALUES[i],
      label: VALUES[i] === 1.0 ? '1.0' : '1e-8',
      x: startX + i * spacing,
      y: leafY,
      isLeaf: true,
      hasLoss: false,
    });
  }

  // Intermediate nodes: sequential left-to-right accumulation
  let acc = Math.fround(VALUES[0]);
  for (let i = 1; i < VALUES.length; i++) {
    const prev = acc;
    acc = fp32Add(acc, VALUES[i]);
    const lostPrecision = Math.abs(acc - prev) < 1e-12 && VALUES[i] !== 0;
    nodes.push({
      value: acc,
      label: acc === 1.0 ? '1.0' : acc.toPrecision(8),
      x: startX + i * spacing,
      y: leafY + 65 + (i - 1) * 30,
      isLeaf: false,
      hasLoss: lostPrecision,
      children: [i === 1 ? 0 : VALUES.length + i - 2, i],
    });
  }

  return nodes;
}

function buildPairwiseTree(): TreeNode[] {
  const nodes: TreeNode[] = [];
  const leafY = 30;
  const spacing = 82;
  const startX = 60;

  // Leaf nodes
  for (let i = 0; i < VALUES.length; i++) {
    nodes.push({
      value: VALUES[i],
      label: VALUES[i] === 1.0 ? '1.0' : '1e-8',
      x: startX + i * spacing,
      y: leafY,
      isLeaf: true,
      hasLoss: false,
    });
  }

  // Level 1: pair small values (indices 1-7)
  const small = VALUES.slice(1);
  const level1Indices: number[] = [];
  for (let i = 0; i < small.length; i += 2) {
    const a = Math.fround(small[i]);
    const b = i + 1 < small.length ? Math.fround(small[i + 1]) : 0;
    const s = fp32Add(a, b);
    const idx = nodes.length;
    level1Indices.push(idx);
    nodes.push({
      value: s,
      label: s.toExponential(1),
      x: startX + (1 + i) * spacing + spacing / 2,
      y: leafY + 55,
      isLeaf: false,
      hasLoss: false,
      children: [1 + i, 1 + i + 1 < VALUES.length ? 1 + i + 1 : -1],
    });
  }

  // Level 2: pair level 1 results
  const level2Indices: number[] = [];
  for (let i = 0; i < level1Indices.length; i += 2) {
    const a = nodes[level1Indices[i]].value;
    const b = i + 1 < level1Indices.length ? nodes[level1Indices[i + 1]].value : 0;
    const s = fp32Add(a, b);
    const idx = nodes.length;
    level2Indices.push(idx);
    const x1 = nodes[level1Indices[i]].x;
    const x2 = i + 1 < level1Indices.length ? nodes[level1Indices[i + 1]].x : x1;
    nodes.push({
      value: s,
      label: s.toExponential(1),
      x: (x1 + x2) / 2,
      y: leafY + 110,
      isLeaf: false,
      hasLoss: false,
      children: [level1Indices[i], i + 1 < level1Indices.length ? level1Indices[i + 1] : -1],
    });
  }

  // Level 3: combine remaining
  let topSmallIdx: number;
  if (level2Indices.length >= 2) {
    const a = nodes[level2Indices[0]].value;
    const b = nodes[level2Indices[1]].value;
    const s = fp32Add(a, b);
    topSmallIdx = nodes.length;
    nodes.push({
      value: s,
      label: s.toExponential(2),
      x: (nodes[level2Indices[0]].x + nodes[level2Indices[1]].x) / 2,
      y: leafY + 165,
      isLeaf: false,
      hasLoss: false,
      children: [level2Indices[0], level2Indices[1]],
    });
  } else {
    topSmallIdx = level2Indices[0];
  }

  // Final: large value + accumulated small values
  const finalResult = fp32Add(Math.fround(VALUES[0]), nodes[topSmallIdx].value);
  nodes.push({
    value: finalResult,
    label: finalResult.toPrecision(8),
    x: 360,
    y: leafY + 210,
    isLeaf: false,
    hasLoss: Math.abs(finalResult - TRUE_SUM) > 1e-12,
    children: [0, topSmallIdx],
  });

  return nodes;
}

function buildReversedTree(): TreeNode[] {
  const nodes: TreeNode[] = [];
  const leafY = 30;
  const spacing = 82;
  const startX = 60;

  // Leaf nodes (reversed order for display: small values first, large last)
  for (let i = 0; i < VALUES.length; i++) {
    nodes.push({
      value: VALUES[i],
      label: VALUES[i] === 1.0 ? '1.0' : '1e-8',
      x: startX + i * spacing,
      y: leafY,
      isLeaf: true,
      hasLoss: false,
    });
  }

  // Accumulate small values right-to-left: 1e-8 + 1e-8 + ...
  let acc = Math.fround(0);
  const smallIndices = [7, 6, 5, 4, 3, 2, 1]; // indices of small values
  let prevNodeIdx = smallIndices[0]; // start from rightmost small value

  acc = Math.fround(VALUES[smallIndices[0]]);
  for (let i = 1; i < smallIndices.length; i++) {
    const val = VALUES[smallIndices[i]];
    const newAcc = fp32Add(acc, val);
    const idx = nodes.length;
    nodes.push({
      value: newAcc,
      label: newAcc.toExponential(1),
      x: startX + smallIndices[i] * spacing,
      y: leafY + 60 + (i - 1) * 30,
      isLeaf: false,
      hasLoss: false,
      children: [i === 1 ? prevNodeIdx : nodes.length - 2, smallIndices[i]],
    });
    acc = newAcc;
    prevNodeIdx = idx;
  }

  // Final: accumulated small + large value
  const result = fp32Add(acc, VALUES[0]);
  nodes.push({
    value: result,
    label: result.toPrecision(8),
    x: startX + 0.5 * spacing,
    y: leafY + 60 + (smallIndices.length - 1) * 30 + 35,
    isLeaf: false,
    hasLoss: Math.abs(result - TRUE_SUM) > 1e-12,
    children: [nodes.length - 1, 0],
  });

  return nodes;
}

/* ─── Component ─── */

export default function NumericalAccuracyDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '浮点数非结合性: 求和顺序 vs 精度',
      trueValue: '精确值 (Float64)',
      computed: '计算值 (FP32)',
      error: '误差',
      ulpNote: 'FP32 ULP at 1.0 \u2248 1.19e-7; 1e-8 被完全吸收',
      precisionTitle: '混合精度对比',
      fp16Label: 'FP16 累加器',
      fp32Label: 'FP32 累加器',
      fp16Value: '512.0',
      fp32Value: '512.0625',
      fp16Note: '小数部分丢失',
      fp32Note: '精度保留',
      toleranceTitle: '验证阈值参考',
      absLoss: '精度损失',
      noLoss: '精度保留',
      valuesLabel: '输入值: [1.0, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8]',
    },
    en: {
      title: 'Float Non-Associativity: Summation Order vs Precision',
      trueValue: 'True value (Float64)',
      computed: 'Computed (FP32)',
      error: 'Error',
      ulpNote: 'FP32 ULP at 1.0 \u2248 1.19e-7; 1e-8 is fully absorbed',
      precisionTitle: 'Mixed Precision Comparison',
      fp16Label: 'FP16 accumulator',
      fp32Label: 'FP32 accumulator',
      fp16Value: '512.0',
      fp32Value: '512.0625',
      fp16Note: 'fractional part lost',
      fp32Note: 'precision preserved',
      toleranceTitle: 'Tolerance Reference',
      absLoss: 'precision loss',
      noLoss: 'precision preserved',
      valuesLabel: 'Input: [1.0, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8]',
    },
  }[locale]!;

  const [selectedIdx, setSelectedIdx] = useState(0);

  const order = REDUCTION_ORDERS[selectedIdx];
  const { result } = order.compute();
  const error = Math.abs(result - TRUE_SUM);

  // All results for comparison
  const allResults = REDUCTION_ORDERS.map(o => {
    const r = o.compute();
    return { ...o, result: r.result, error: Math.abs(r.result - TRUE_SUM) };
  });

  // Build tree based on selected order
  const treeBuilders = {
    sequential: buildSequentialTree,
    pairwise: buildPairwiseTree,
    reversed: buildReversedTree,
  };
  const treeNodes = treeBuilders[order.treeType]();

  // Render tree connections
  function renderTreeEdges() {
    const edges: React.ReactNode[] = [];
    treeNodes.forEach((node, idx) => {
      if (node.children) {
        node.children.forEach(childIdx => {
          if (childIdx >= 0 && childIdx < treeNodes.length) {
            const child = treeNodes[childIdx];
            edges.push(
              <line
                key={`edge-${idx}-${childIdx}`}
                x1={child.x}
                y1={child.y + 12}
                x2={node.x}
                y2={node.y - 12}
                stroke={COLORS.mid}
                strokeWidth={1}
                strokeOpacity={0.3}
              />
            );
          }
        });
      }
    });
    return edges;
  }

  // Only show first 12 nodes for readability in sequential/reversed trees
  const maxDisplayNodes = order.treeType === 'pairwise' ? treeNodes.length : Math.min(treeNodes.length, 16);
  const displayNodes = treeNodes.slice(0, maxDisplayNodes);

  return (
    <div className="my-6">
      {/* Order selector */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {REDUCTION_ORDERS.map((o, i) => (
          <button
            key={o.id}
            onClick={() => setSelectedIdx(i)}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: i === selectedIdx ? COLORS.primary : COLORS.bgAlt,
              color: i === selectedIdx ? '#fff' : COLORS.dark,
              border: `1px solid ${i === selectedIdx ? COLORS.primary : COLORS.light}`,
            }}
          >
            {o.label[locale]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={order.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <svg viewBox="0 0 800 520" className="w-full">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>

            {/* Title */}
            <text x={400} y={20} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
              {t.title}
            </text>

            {/* Input values label */}
            <text x={400} y={38} textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {t.valuesLabel}
            </text>

            {/* ─── Upper: Tree visualization (y=50..270) ─── */}
            <g transform="translate(40, 50)">
              {/* Tree edges */}
              {renderTreeEdges()}

              {/* Tree nodes */}
              {displayNodes.map((node, idx) => (
                <motion.g
                  key={`${order.id}-node-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.02 }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.isLeaf ? 10 : 12}
                    fill={node.hasLoss ? COLORS.red : node.isLeaf ? COLORS.primary : COLORS.green}
                    fillOpacity={node.isLeaf ? 0.12 : 0.15}
                    stroke={node.hasLoss ? COLORS.red : node.isLeaf ? COLORS.primary : COLORS.green}
                    strokeWidth={1.5}
                    strokeOpacity={0.7}
                  />
                  <text
                    x={node.x}
                    y={node.y + (node.isLeaf ? -16 : 22)}
                    textAnchor="middle"
                    fontSize={node.isLeaf ? '8' : '7.5'}
                    fontFamily={FONTS.mono}
                    fill={node.hasLoss ? COLORS.red : COLORS.dark}
                    fontWeight={node.hasLoss ? 700 : 400}
                  >
                    {node.label}
                  </text>
                  {/* Precision loss indicator */}
                  {node.hasLoss && (
                    <text
                      x={node.x}
                      y={node.y + 34}
                      textAnchor="middle"
                      fontSize="7"
                      fill={COLORS.red}
                      fontWeight="600"
                    >
                      {t.absLoss}
                    </text>
                  )}
                </motion.g>
              ))}
            </g>

            {/* Description */}
            <text x={400} y={285} textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {order.description[locale].length > 80
                ? order.description[locale].slice(0, 80) + '...'
                : order.description[locale]}
            </text>

            {/* ─── Middle: Results comparison (y=300..395) ─── */}
            <rect x={30} y={300} width={740} height={95} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

            {/* True value */}
            <text x={50} y={320} fontSize="10" fill={COLORS.mid} fontWeight="600">
              {t.trueValue}:
            </text>
            <text x={200} y={320} fontSize="10" fontFamily={FONTS.mono} fill={COLORS.dark} fontWeight="700">
              {TRUE_SUM.toPrecision(15)}
            </text>

            {/* Three results as bars */}
            {allResults.map((r, i) => {
              const barY = 332 + i * 20;
              const isCurrent = i === selectedIdx;
              const barColor = r.error < 1e-15 ? COLORS.green : r.error < 1e-8 ? COLORS.orange : COLORS.red;
              // Normalize bar width: 0 error = full width, max error = 0
              const maxErr = Math.max(...allResults.map(a => a.error));
              const accuracy = maxErr > 0 ? 1 - r.error / maxErr : 1;
              const barWidth = 120 * accuracy + 30;

              return (
                <g key={r.id}>
                  {/* Current highlight */}
                  {isCurrent && (
                    <rect
                      x={32}
                      y={barY - 6}
                      width={736}
                      height={18}
                      rx={3}
                      fill={COLORS.primary}
                      fillOpacity={0.06}
                    />
                  )}
                  {/* Label */}
                  <text
                    x={50}
                    y={barY + 7}
                    fontSize="9"
                    fill={isCurrent ? COLORS.dark : COLORS.mid}
                    fontWeight={isCurrent ? 700 : 400}
                  >
                    {r.label[locale]}
                  </text>
                  {/* Result value */}
                  <text
                    x={350}
                    y={barY + 7}
                    fontSize="9"
                    fontFamily={FONTS.mono}
                    fill={COLORS.dark}
                    fontWeight={isCurrent ? 700 : 400}
                  >
                    {r.result.toPrecision(10)}
                  </text>
                  {/* Accuracy bar */}
                  <rect x={530} y={barY - 2} width={barWidth} height={10} rx={3} fill={barColor} fillOpacity={0.3} />
                  {/* Error */}
                  <text x={690} y={barY + 7} fontSize="8" fontFamily={FONTS.mono} fill={barColor} fontWeight="600">
                    {t.error}: {r.error === 0 ? '0' : r.error.toExponential(1)}
                  </text>
                </g>
              );
            })}

            {/* ULP note */}
            <text x={400} y={393} textAnchor="middle" fontSize="8" fill={COLORS.mid} fillOpacity={0.7}>
              {t.ulpNote}
            </text>

            {/* ─── Lower: Mixed precision demo (y=400..515) ─── */}
            <rect x={30} y={405} width={355} height={105} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

            <text x={50} y={425} fontSize="11" fontWeight="700" fill={COLORS.dark}>
              {t.precisionTitle}
            </text>

            {/* FP16 accumulator */}
            <rect x={50} y={434} width={150} height={30} rx={4} fill={COLORS.red} fillOpacity={0.06} stroke={COLORS.red} strokeWidth={1} strokeOpacity={0.3} />
            <text x={60} y={453} fontSize="9" fontWeight="600" fill={COLORS.red}>{t.fp16Label}</text>
            <text x={125} y={472} fontSize="14" fontFamily={FONTS.mono} fontWeight="700" fill={COLORS.red}>
              {t.fp16Value}
            </text>
            <text x={125} y={496} fontSize="8" fill={COLORS.red} fillOpacity={0.7}>{t.fp16Note}</text>

            {/* FP32 accumulator */}
            <rect x={215} y={434} width={150} height={30} rx={4} fill={COLORS.green} fillOpacity={0.06} stroke={COLORS.green} strokeWidth={1} strokeOpacity={0.3} />
            <text x={225} y={453} fontSize="9" fontWeight="600" fill={COLORS.green}>{t.fp32Label}</text>
            <text x={290} y={472} fontSize="14" fontFamily={FONTS.mono} fontWeight="700" fill={COLORS.green}>
              {t.fp32Value}
            </text>
            <text x={290} y={496} fontSize="8" fill={COLORS.green} fillOpacity={0.7}>{t.fp32Note}</text>

            {/* ─── Lower right: Tolerance reference ─── */}
            <rect x={400} y={405} width={370} height={105} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

            <text x={420} y={425} fontSize="11" fontWeight="700" fill={COLORS.dark}>
              {t.toleranceTitle}
            </text>

            {/* FP32 tolerances */}
            <text x={420} y={450} fontSize="10" fontWeight="600" fill={COLORS.primary}>FP32</text>
            <text x={420} y={464} fontSize="9" fontFamily={FONTS.mono} fill={COLORS.dark}>
              atol=1e-5, rtol=1.3e-6
            </text>

            {/* FP16 tolerances */}
            <text x={600} y={450} fontSize="10" fontWeight="600" fill={COLORS.orange}>FP16</text>
            <text x={600} y={464} fontSize="9" fontFamily={FONTS.mono} fill={COLORS.dark}>
              atol=1e-5, rtol=1e-3
            </text>

            {/* torch.testing.assert_close example */}
            <text x={420} y={490} fontSize="8.5" fontFamily={FONTS.mono} fill={COLORS.mid}>
              torch.testing.assert_close(compiled, eager,
            </text>
            <text x={420} y={502} fontSize="8.5" fontFamily={FONTS.mono} fill={COLORS.mid}>
              {'  '}atol=1e-5, rtol=1.3e-6)
            </text>
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary, opacity: 0.4 }} />
          <span className="text-xs" style={{ color: COLORS.mid }}>
            {locale === 'zh' ? '输入值' : 'Input values'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.green, opacity: 0.4 }} />
          <span className="text-xs" style={{ color: COLORS.mid }}>
            {locale === 'zh' ? '中间结果' : 'Intermediate'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.red, opacity: 0.4 }} />
          <span className="text-xs" style={{ color: COLORS.mid }}>
            {t.absLoss}
          </span>
        </div>
      </div>
    </div>
  );
}
