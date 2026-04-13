import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

/* ─── Types ─── */

interface FFNNode {
  id: string;
  op: string;
  label: string;
}

interface AlgorithmStep {
  stepNum: number;
  edge: { from: string; to: string } | null;
  decision: 'fuse' | 'skip' | 'init' | 'final';
  reason: { zh: string; en: string };
  groups: Map<string, number>;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const FFN_GRAPH: FFNNode[] = [
  { id: 'x', op: 'input', label: 'x [128×768]' },
  { id: 'ln', op: 'layer_norm', label: 'LayerNorm' },
  { id: 'w1', op: 'param', label: 'W₁' },
  { id: 'mm1', op: 'matmul', label: 'x@W₁' },
  { id: 'gelu', op: 'gelu', label: 'GELU' },
  { id: 'w2', op: 'param', label: 'W₂' },
  { id: 'mm2', op: 'matmul', label: 'GELU@W₂' },
  { id: 'add', op: 'add', label: '+residual' },
  { id: 'out', op: 'output', label: 'output' },
];

const EDGES = [
  { from: 'x', to: 'ln' },
  { from: 'ln', to: 'mm1' },
  { from: 'w1', to: 'mm1' },
  { from: 'mm1', to: 'gelu' },
  { from: 'gelu', to: 'mm2' },
  { from: 'w2', to: 'mm2' },
  { from: 'mm2', to: 'add' },
  { from: 'x', to: 'add' },
  { from: 'add', to: 'out' },
];

function buildAlgorithmSteps(): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];

  // Step 0: init
  const initGroups = new Map<string, number>();
  FFN_GRAPH.forEach((n, i) => initGroups.set(n.id, i));
  steps.push({
    stepNum: 0,
    edge: null,
    decision: 'init',
    reason: {
      zh: '初始化：每个节点各自为一组',
      en: 'Init: each node is its own group'
    },
    groups: new Map(initGroups),
  });

  // Step 1: x → ln (skip)
  steps.push({
    stepNum: 1,
    edge: { from: 'x', to: 'ln' },
    decision: 'skip',
    reason: {
      zh: '跳过：x 是输入占位符',
      en: 'Skip: x is input placeholder'
    },
    groups: new Map(initGroups),
  });

  // Step 2: ln → mm1 (skip)
  steps.push({
    stepNum: 2,
    edge: { from: 'ln', to: 'mm1' },
    decision: 'skip',
    reason: {
      zh: '跳过：reduction 与 matmul 是不同内核类型',
      en: 'Skip: reduction + matmul are different kernel types'
    },
    groups: new Map(initGroups),
  });

  // Step 3: mm1 → gelu (fuse)
  const groups3 = new Map(initGroups);
  const mm1Group = groups3.get('mm1')!;
  groups3.set('gelu', mm1Group);
  steps.push({
    stepNum: 3,
    edge: { from: 'mm1', to: 'gelu' },
    decision: 'fuse',
    reason: {
      zh: '融合：GELU 可作为 matmul 的 epilogue',
      en: 'Fuse: GELU as matmul epilogue'
    },
    groups: groups3,
  });

  // Step 4: gelu → mm2 (skip)
  steps.push({
    stepNum: 4,
    edge: { from: 'gelu', to: 'mm2' },
    decision: 'skip',
    reason: {
      zh: '跳过：matmul → matmul 无法融合',
      en: 'Skip: matmul → matmul cannot fuse'
    },
    groups: new Map(groups3),
  });

  // Step 5: mm2 → add (fuse)
  const groups5 = new Map(groups3);
  const mm2Group = groups5.get('mm2')!;
  groups5.set('add', mm2Group);
  steps.push({
    stepNum: 5,
    edge: { from: 'mm2', to: 'add' },
    decision: 'fuse',
    reason: {
      zh: '融合：residual add 可作为 matmul 的 epilogue',
      en: 'Fuse: residual add as matmul epilogue'
    },
    groups: groups5,
  });

  // Step 6: final
  steps.push({
    stepNum: 6,
    edge: null,
    decision: 'final',
    reason: {
      zh: '最终结果：3 个内核 — LN (reduction)、mm1+GELU (matmul)、mm2+add (matmul)',
      en: 'Final: 3 kernels — LN (reduction), mm1+GELU (matmul), mm2+add (matmul)'
    },
    groups: new Map(groups5),
  });

  return steps;
}

/* ─── SVG Constants ─── */

const W = 800;
const H = 550;
const GRAPH_TOP = 80;
const NODE_W = 90;
const NODE_H = 36;

// Layout positions
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  x: { x: 100, y: GRAPH_TOP },
  ln: { x: 100, y: GRAPH_TOP + 80 },
  w1: { x: 220, y: GRAPH_TOP + 140 },
  mm1: { x: 100, y: GRAPH_TOP + 160 },
  gelu: { x: 100, y: GRAPH_TOP + 240 },
  w2: { x: 220, y: GRAPH_TOP + 280 },
  mm2: { x: 100, y: GRAPH_TOP + 320 },
  add: { x: 100, y: GRAPH_TOP + 400 },
  out: { x: 100, y: GRAPH_TOP + 480 },
};

/* ─── Component ─── */

export default function FusionAlgorithmStepper({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '融合判定算法演示：Greedy Fusion',
      stepLabel: '步骤',
      decision: '决策',
      reason: '原因',
      fuse: '✅ 融合',
      skip: '❌ 跳过',
      init: '初始化',
      final: '最终',
      kernelBoundary: '内核边界',
    },
    en: {
      title: 'Fusion Algorithm Demo: Greedy Fusion',
      stepLabel: 'Step',
      decision: 'Decision',
      reason: 'Reason',
      fuse: '✅ Fuse',
      skip: '❌ Skip',
      init: 'Init',
      final: 'Final',
      kernelBoundary: 'Kernel Boundary',
    },
  }[locale]!;

  const algorithmSteps = buildAlgorithmSteps();

  const steps = algorithmSteps.map((algStep) => {
    const groupColors = new Map<number, string>();
    const uniqueGroups = Array.from(new Set(algStep.groups.values()));
    uniqueGroups.forEach((g, i) => {
      groupColors.set(g, HEAD_COLORS[i % HEAD_COLORS.length]);
    });

    return {
      title: `${t.stepLabel} ${algStep.stepNum}`,
      content: (
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>

            {/* Title */}
            <text x={W / 2} y={24} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.dark}>
              {t.title}
            </text>

            {/* Edges */}
            {EDGES.map((e, i) => {
              const from = NODE_POSITIONS[e.from];
              const to = NODE_POSITIONS[e.to];
              const isCurrent = algStep.edge?.from === e.from && algStep.edge?.to === e.to;
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y + NODE_H / 2}
                  x2={to.x}
                  y2={to.y - NODE_H / 2}
                  stroke={isCurrent ? COLORS.primary : COLORS.light}
                  strokeWidth={isCurrent ? 3 : 2}
                  opacity={isCurrent ? 1 : 0.5}
                />
              );
            })}

            {/* Nodes */}
            {FFN_GRAPH.map(node => {
              const pos = NODE_POSITIONS[node.id];
              const groupId = algStep.groups.get(node.id)!;
              const groupColor = groupColors.get(groupId) || COLORS.mid;

              return (
                <g key={node.id}>
                  <rect
                    x={pos.x - NODE_W / 2}
                    y={pos.y - NODE_H / 2}
                    width={NODE_W}
                    height={NODE_H}
                    rx={4}
                    fill={algStep.decision === 'final' ? `${groupColor}20` : COLORS.bgAlt}
                    stroke={groupColor}
                    strokeWidth={algStep.decision === 'final' ? 2.5 : 1.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={COLORS.dark}
                    style={{ fontFamily: FONTS.mono }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}

            {/* Decision badge */}
            {algStep.decision !== 'init' && algStep.decision !== 'final' && (
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x={W - 280}
                  y={50}
                  width={260}
                  height={80}
                  rx={6}
                  fill={algStep.decision === 'fuse' ? COLORS.valid : COLORS.waste}
                  stroke={algStep.decision === 'fuse' ? COLORS.green : COLORS.red}
                  strokeWidth={2}
                />
                <text
                  x={W - 270}
                  y={70}
                  fontSize="11"
                  fontWeight="700"
                  fill={algStep.decision === 'fuse' ? COLORS.green : COLORS.red}
                >
                  {t.decision}: {algStep.decision === 'fuse' ? t.fuse : t.skip}
                </text>
                <text
                  x={W - 270}
                  y={90}
                  fontSize="9"
                  fontWeight="600"
                  fill={COLORS.mid}
                >
                  {t.reason}:
                </text>
                <text
                  x={W - 270}
                  y={106}
                  fontSize="9"
                  fill={COLORS.dark}
                >
                  {algStep.reason[locale]}
                </text>
              </motion.g>
            )}

            {/* Init/Final message */}
            {(algStep.decision === 'init' || algStep.decision === 'final') && (
              <g>
                <rect
                  x={W - 320}
                  y={50}
                  width={300}
                  height={60}
                  rx={6}
                  fill={algStep.decision === 'final' ? COLORS.valid : COLORS.bgAlt}
                  stroke={algStep.decision === 'final' ? COLORS.green : COLORS.light}
                  strokeWidth={1.5}
                />
                <text
                  x={W - 310}
                  y={70}
                  fontSize="10"
                  fontWeight="700"
                  fill={algStep.decision === 'final' ? COLORS.green : COLORS.dark}
                >
                  {algStep.decision === 'final' ? t.final : t.init}
                </text>
                <text
                  x={W - 310}
                  y={88}
                  fontSize="9"
                  fill={COLORS.dark}
                >
                  {algStep.reason[locale]}
                </text>
              </g>
            )}

            {/* Kernel boundary markers (final step) */}
            {algStep.decision === 'final' && (
              <g>
                {uniqueGroups.filter(g => {
                  // Exclude input/param/output groups
                  const nodesInGroup = Array.from(algStep.groups.entries()).filter(([_, gid]) => gid === g).map(([id]) => id);
                  return nodesInGroup.some(id => {
                    const node = FFN_GRAPH.find(n => n.id === id);
                    return node && node.op !== 'input' && node.op !== 'output' && node.op !== 'param';
                  });
                }).map((g, i) => {
                  const nodesInGroup = Array.from(algStep.groups.entries()).filter(([_, gid]) => gid === g).map(([id]) => id);
                  const positions = nodesInGroup.map(id => NODE_POSITIONS[id]);
                  const minX = Math.min(...positions.map(p => p.x));
                  const minY = Math.min(...positions.map(p => p.y));
                  const maxX = Math.max(...positions.map(p => p.x));
                  const maxY = Math.max(...positions.map(p => p.y));

                  const groupColor = groupColors.get(g)!;

                  return (
                    <g key={g}>
                      <rect
                        x={minX - NODE_W / 2 - 8}
                        y={minY - NODE_H / 2 - 8}
                        width={maxX - minX + NODE_W + 16}
                        height={maxY - minY + NODE_H + 16}
                        rx={8}
                        fill="none"
                        stroke={groupColor}
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        opacity={0.7}
                      />
                      <rect
                        x={minX - NODE_W / 2 - 6}
                        y={minY - NODE_H / 2 - 24}
                        width={100}
                        height={16}
                        rx={8}
                        fill={groupColor}
                        fillOpacity={0.2}
                        stroke={groupColor}
                        strokeWidth={1}
                      />
                      <text
                        x={minX - NODE_W / 2 + 4}
                        y={minY - NODE_H / 2 - 12}
                        fontSize="9"
                        fontWeight="600"
                        fill={groupColor}
                      >
                        {t.kernelBoundary} {i + 1}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      ),
    };
  });

  return (
    <div className="my-6">
      <StepNavigator steps={steps} locale={locale} />
    </div>
  );
}
