import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface GraphNode {
  id: string;
  op: string;
  label: string;
  shape: string;
  inputs?: string[];
  hasSideEffect: boolean;
  memoryEstimate: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const CHECKER_GRAPH: GraphNode[] = [
  { id: 'x', op: 'input', label: 'x', shape: '[128,768]', hasSideEffect: false, memoryEstimate: 0 },
  { id: 'w1', op: 'param', label: 'W₁', shape: '[768,3072]', hasSideEffect: false, memoryEstimate: 0 },
  { id: 'mm1', op: 'matmul', label: 'x@W₁', inputs: ['x', 'w1'], shape: '[128,3072]', hasSideEffect: false, memoryEstimate: 12 },
  { id: 'gelu', op: 'gelu', label: 'GELU', inputs: ['mm1'], shape: '[128,3072]', hasSideEffect: false, memoryEstimate: 2 },
  { id: 'w2', op: 'param', label: 'W₂', shape: '[3072,768]', hasSideEffect: false, memoryEstimate: 0 },
  { id: 'mm2', op: 'matmul', label: 'GELU@W₂', inputs: ['gelu', 'w2'], shape: '[128,768]', hasSideEffect: false, memoryEstimate: 12 },
  { id: 'dropout', op: 'dropout', label: 'dropout', inputs: ['mm2'], shape: '[128,768]', hasSideEffect: true, memoryEstimate: 1 },
  { id: 'add', op: 'add', label: '+residual', inputs: ['dropout', 'x'], shape: '[128,768]', hasSideEffect: false, memoryEstimate: 1 },
  { id: 'ln', op: 'layer_norm', label: 'LayerNorm', inputs: ['add'], shape: '[128,768]', hasSideEffect: false, memoryEstimate: 2 },
  { id: 'out', op: 'output', label: 'output', inputs: ['ln'], shape: '[128,768]', hasSideEffect: false, memoryEstimate: 0 },
];

/* ─── SVG Constants ─── */

const W = 800;
const H = 500;
const GRAPH_LEFT = 50;
const GRAPH_RIGHT = 400;
const CHECKLIST_LEFT = 420;
const NODE_W = 90;
const NODE_H = 36;
const NODE_GAP_Y = 50;

/* ─── Component ─── */

export default function FusionLegalityChecker({ locale = 'zh' }: Props) {
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);

  const t = {
    zh: {
      title: '融合合法性检查器',
      instruction: '点击两个节点检查能否融合',
      reset: '重置',
      checks: {
        producerConsumer: '生产者-消费者关系',
        noCycle: '无循环依赖',
        shapeCompatible: '形状兼容',
        noSideEffect: '无副作用',
        memoryFits: '内存可容纳 (<48KB)',
      },
      result: {
        fusible: '可融合',
        notFusible: '不可融合',
        withCaveats: '有条件融合',
      },
      reason: '原因',
    },
    en: {
      title: 'Fusion Legality Checker',
      instruction: 'Click two nodes to check fusion legality',
      reset: 'Reset',
      checks: {
        producerConsumer: 'Producer-consumer',
        noCycle: 'No cycle',
        shapeCompatible: 'Shape compatible',
        noSideEffect: 'No side effects',
        memoryFits: 'Memory fits (<48KB)',
      },
      result: {
        fusible: 'Fusible',
        notFusible: 'Not fusible',
        withCaveats: 'With caveats',
      },
      reason: 'Reason',
    },
  }[locale]!;

  function handleNodeClick(id: string) {
    if (selectedA === id) {
      setSelectedA(null);
      setSelectedB(null);
    } else if (selectedB === id) {
      setSelectedB(null);
    } else if (selectedA === null) {
      setSelectedA(id);
    } else {
      setSelectedB(id);
    }
  }

  function checkFusion() {
    if (!selectedA || !selectedB) return null;

    const nodeA = CHECKER_GRAPH.find(n => n.id === selectedA)!;
    const nodeB = CHECKER_GRAPH.find(n => n.id === selectedB)!;

    const checks = {
      producerConsumer: false,
      noCycle: true,
      shapeCompatible: false,
      noSideEffect: true,
      memoryFits: true,
    };

    let reason = '';

    // Producer-consumer
    if (nodeA.inputs?.includes(selectedB)) {
      checks.producerConsumer = true;
    } else if (nodeB.inputs?.includes(selectedA)) {
      checks.producerConsumer = true;
    } else {
      reason = locale === 'zh' ? '两节点无直接依赖关系' : 'No direct dependency';
    }

    // Shape compatible (simplified: assume element-wise ops are compatible)
    if (nodeA.shape === nodeB.shape || nodeA.op === 'input' || nodeB.op === 'output' || nodeA.op === 'param' || nodeB.op === 'param') {
      checks.shapeCompatible = true;
    } else {
      if (!reason) reason = locale === 'zh' ? '形状不兼容' : 'Shape mismatch';
    }

    // Side effects
    if (nodeA.hasSideEffect || nodeB.hasSideEffect) {
      checks.noSideEffect = false;
      if (!reason) reason = locale === 'zh' ? 'dropout 有随机副作用' : 'dropout has random side effect';
    }

    // Memory
    const totalMem = nodeA.memoryEstimate + nodeB.memoryEstimate;
    if (totalMem > 48) {
      checks.memoryFits = false;
      if (!reason) reason = locale === 'zh' ? `需 ${totalMem} KB，超出 SRAM` : `Requires ${totalMem} KB, exceeds SRAM`;
    }

    const allPass = Object.values(checks).every(v => v);
    const anyFail = !allPass;

    let result: 'fusible' | 'notFusible' | 'withCaveats';
    if (allPass) {
      result = 'fusible';
    } else if (checks.producerConsumer && checks.noCycle && checks.shapeCompatible && !checks.noSideEffect) {
      result = 'withCaveats';
      reason = locale === 'zh' ? '可融合但需禁用副作用（如 training=False）' : 'Fusible if side effects disabled (e.g., training=False)';
    } else {
      result = 'notFusible';
    }

    return { checks, result, reason };
  }

  const fusionCheck = checkFusion();

  // Layout nodes
  const nodePositions = new Map<string, { x: number; y: number }>();
  CHECKER_GRAPH.forEach((node, i) => {
    nodePositions.set(node.id, {
      x: GRAPH_LEFT + NODE_W / 2,
      y: 60 + i * NODE_GAP_Y,
    });
  });

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; } .clickable { cursor: pointer; }`}</style>

        {/* Title */}
        <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.instruction}
        </text>

        {/* Graph edges */}
        {CHECKER_GRAPH.map(node => {
          if (!node.inputs) return null;
          const toPos = nodePositions.get(node.id)!;
          return node.inputs.map(fromId => {
            const fromPos = nodePositions.get(fromId);
            if (!fromPos) return null;
            return (
              <line
                key={`${fromId}-${node.id}`}
                x1={fromPos.x}
                y1={fromPos.y + NODE_H / 2}
                x2={toPos.x}
                y2={toPos.y - NODE_H / 2}
                stroke={COLORS.light}
                strokeWidth={2}
              />
            );
          });
        })}

        {/* Graph nodes */}
        {CHECKER_GRAPH.map(node => {
          const pos = nodePositions.get(node.id)!;
          const isSelectedA = selectedA === node.id;
          const isSelectedB = selectedB === node.id;
          const isSelected = isSelectedA || isSelectedB;

          return (
            <g
              key={node.id}
              className="clickable"
              onClick={() => handleNodeClick(node.id)}
            >
              <rect
                x={pos.x - NODE_W / 2}
                y={pos.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={4}
                fill={isSelected ? COLORS.highlight : COLORS.bgAlt}
                stroke={isSelectedA ? COLORS.primary : isSelectedB ? COLORS.orange : COLORS.light}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              <text
                x={pos.x}
                y={pos.y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={COLORS.dark}
                style={{ fontFamily: FONTS.mono }}
              >
                {node.label}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                fontSize="8"
                fill={COLORS.mid}
              >
                {node.shape}
              </text>
            </g>
          );
        })}

        {/* Checklist panel */}
        <g>
          <rect
            x={CHECKLIST_LEFT}
            y={60}
            width={360}
            height={fusionCheck ? 280 : 200}
            rx={6}
            fill={COLORS.bgAlt}
            stroke={COLORS.light}
            strokeWidth={1.5}
          />

          {fusionCheck ? (
            <>
              {/* Checks */}
              {Object.entries(fusionCheck.checks).map(([key, value], i) => {
                const label = t.checks[key as keyof typeof t.checks];
                const icon = value ? '✅' : '❌';
                return (
                  <g key={key} transform={`translate(${CHECKLIST_LEFT + 16}, ${80 + i * 28})`}>
                    <text x={0} y={0} fontSize="14" fill={value ? COLORS.green : COLORS.red}>
                      {icon}
                    </text>
                    <text x={24} y={0} fontSize="10" fill={COLORS.dark}>
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Result */}
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x={CHECKLIST_LEFT + 16}
                  y={240}
                  width={328}
                  height={80}
                  rx={6}
                  fill={
                    fusionCheck.result === 'fusible'
                      ? COLORS.valid
                      : fusionCheck.result === 'withCaveats'
                        ? COLORS.highlight
                        : COLORS.waste
                  }
                  stroke={
                    fusionCheck.result === 'fusible'
                      ? COLORS.green
                      : fusionCheck.result === 'withCaveats'
                        ? COLORS.orange
                        : COLORS.red
                  }
                  strokeWidth={2}
                />
                <text
                  x={CHECKLIST_LEFT + 32}
                  y={262}
                  fontSize="12"
                  fontWeight="700"
                  fill={
                    fusionCheck.result === 'fusible'
                      ? COLORS.green
                      : fusionCheck.result === 'withCaveats'
                        ? COLORS.orange
                        : COLORS.red
                  }
                >
                  {fusionCheck.result === 'fusible'
                    ? t.result.fusible
                    : fusionCheck.result === 'withCaveats'
                      ? t.result.withCaveats
                      : t.result.notFusible}
                </text>
                {fusionCheck.reason && (
                  <>
                    <text x={CHECKLIST_LEFT + 32} y={282} fontSize="9" fontWeight="600" fill={COLORS.mid}>
                      {t.reason}:
                    </text>
                    <text
                      x={CHECKLIST_LEFT + 32}
                      y={298}
                      fontSize="9"
                      fill={COLORS.dark}
                      style={{ fontFamily: FONTS.mono }}
                    >
                      {fusionCheck.reason}
                    </text>
                  </>
                )}
              </motion.g>
            </>
          ) : (
            <text
              x={CHECKLIST_LEFT + 180}
              y={160}
              textAnchor="middle"
              fontSize="10"
              fill={COLORS.mid}
            >
              {t.instruction}
            </text>
          )}

          {/* Reset button */}
          {(selectedA || selectedB) && (
            <g
              className="clickable"
              onClick={() => {
                setSelectedA(null);
                setSelectedB(null);
              }}
            >
              <rect
                x={CHECKLIST_LEFT + 260}
                y={68}
                width={60}
                height={24}
                rx={12}
                fill={COLORS.light}
                stroke={COLORS.mid}
                strokeWidth={1}
              />
              <text
                x={CHECKLIST_LEFT + 290}
                y={80}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="600"
                fill={COLORS.dark}
              >
                {t.reset}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
