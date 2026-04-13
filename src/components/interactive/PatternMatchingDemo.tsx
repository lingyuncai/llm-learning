import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface GraphNode {
  id: string;
  op: string;
  inputs: string[];
  label: string;
  x?: number;
  y?: number;
}

interface Pattern {
  id: string;
  name: { zh: string; en: string };
  matchNodes: string[];
  replacementLabel: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const PATTERNS: Pattern[] = [
  {
    id: 'matmul_bias',
    name: { zh: 'MatMul + BiasAdd → FusedLinear', en: 'MatMul + BiasAdd → FusedLinear' },
    matchNodes: ['mm', 'bias_add'],
    replacementLabel: 'FusedLinear',
  },
  {
    id: 'mul_add_relu',
    name: { zh: 'Mul + Add + ReLU → FusedMulAddReLU', en: 'Mul + Add + ReLU → FusedMulAddReLU' },
    matchNodes: ['mul', 'add', 'relu'],
    replacementLabel: 'FusedMulAddReLU',
  },
  {
    id: 'identity_removal',
    name: { zh: 'X + 0 → X', en: 'X + 0 → X' },
    matchNodes: ['add_zero'],
    replacementLabel: null as string | null, // Will remove node
  },
];

const INITIAL_GRAPH: GraphNode[] = [
  { id: 'x', op: 'input', inputs: [], label: 'x' },
  { id: 'w', op: 'param', inputs: [], label: 'W' },
  { id: 'b', op: 'param', inputs: [], label: 'bias' },
  { id: 'mm', op: 'matmul', inputs: ['x', 'w'], label: 'matmul' },
  { id: 'bias_add', op: 'add', inputs: ['mm', 'b'], label: '+ bias' },
  { id: 'scale', op: 'param', inputs: [], label: 'scale' },
  { id: 'shift', op: 'param', inputs: [], label: 'shift' },
  { id: 'mul', op: 'mul', inputs: ['bias_add', 'scale'], label: '× scale' },
  { id: 'add', op: 'add', inputs: ['mul', 'shift'], label: '+ shift' },
  { id: 'relu', op: 'relu', inputs: ['add'], label: 'relu' },
  { id: 'zero', op: 'const', inputs: [], label: '0' },
  { id: 'add_zero', op: 'add', inputs: ['relu', 'zero'], label: '+ 0' },
  { id: 'out', op: 'output', inputs: ['add_zero'], label: 'output' },
];

/* ─── SVG Constants ─── */

const W = 800;
const H = 550;
const PANEL_LEFT = 30;
const PANEL_WIDTH = 180;
const GRAPH_LEFT = PANEL_LEFT + PANEL_WIDTH + 30;
const GRAPH_WIDTH = W - GRAPH_LEFT - 30;
const NODE_R = 24;
const NODE_GAP_X = 80;
const NODE_GAP_Y = 60;

/* ─── Helpers ─── */

function layoutGraph(nodes: GraphNode[]): GraphNode[] {
  // Simple topological layout
  const levels: Map<string, number> = new Map();
  const columns: Map<string, number> = new Map();

  function getLevel(id: string): number {
    if (levels.has(id)) return levels.get(id)!;
    const node = nodes.find(n => n.id === id);
    if (!node || node.inputs.length === 0) {
      levels.set(id, 0);
      return 0;
    }
    const level = Math.max(...node.inputs.map(inp => getLevel(inp))) + 1;
    levels.set(id, level);
    return level;
  }

  nodes.forEach(n => getLevel(n.id));
  const maxLevel = Math.max(...Array.from(levels.values()));

  // Assign columns within each level
  const levelGroups: Map<number, string[]> = new Map();
  levels.forEach((level, id) => {
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(id);
  });

  levelGroups.forEach((ids, level) => {
    ids.forEach((id, idx) => {
      columns.set(id, idx);
    });
  });

  return nodes.map(node => {
    const level = levels.get(node.id) ?? 0;
    const col = columns.get(node.id) ?? 0;
    const levelSize = levelGroups.get(level)?.length ?? 1;
    const centerOffset = (levelSize - 1) * NODE_GAP_X / 2;

    return {
      ...node,
      x: GRAPH_LEFT + GRAPH_WIDTH / 2 + col * NODE_GAP_X - centerOffset,
      y: 100 + level * NODE_GAP_Y,
    };
  });
}

/* ─── Component ─── */

export default function PatternMatchingDemo({ locale = 'zh' }: Props) {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [graph, setGraph] = useState<GraphNode[]>(() => layoutGraph(INITIAL_GRAPH));
  const [appliedPatterns, setAppliedPatterns] = useState<string[]>([]);

  const t = {
    zh: {
      title: 'Pattern Matching：声明式图重写',
      subtitle: '通过模式匹配识别和替换子图',
      patterns: 'Pattern 列表',
      selectPattern: '点击 Pattern 查看匹配',
      apply: '应用',
      reset: '重置',
      currentGraph: '当前图',
      matched: '已匹配',
      applied: '已应用',
    },
    en: {
      title: 'Pattern Matching: Declarative Graph Rewriting',
      subtitle: 'Identify and replace subgraphs via pattern matching',
      patterns: 'Pattern List',
      selectPattern: 'Click a pattern to see matches',
      apply: 'Apply',
      reset: 'Reset',
      currentGraph: 'Current Graph',
      matched: 'Matched',
      applied: 'Applied',
    },
  }[locale]!;

  const matchedNodes = useMemo(() => {
    if (!selectedPattern) return new Set<string>();
    const pattern = PATTERNS.find(p => p.id === selectedPattern);
    if (!pattern) return new Set<string>();

    // Check if all match nodes exist in current graph
    const allExist = pattern.matchNodes.every(id => graph.some(n => n.id === id));
    if (!allExist) return new Set<string>();

    return new Set(pattern.matchNodes);
  }, [selectedPattern, graph]);

  function handleApply() {
    if (!selectedPattern || matchedNodes.size === 0) return;

    const pattern = PATTERNS.find(p => p.id === selectedPattern)!;
    let newGraph = [...graph];

    if (pattern.id === 'identity_removal') {
      // Remove add_zero, connect relu directly to output
      newGraph = newGraph.filter(n => n.id !== 'add_zero' && n.id !== 'zero');
      const outNode = newGraph.find(n => n.id === 'out');
      if (outNode) {
        outNode.inputs = ['relu'];
      }
    } else {
      // Contract matched nodes into a single fused node
      const firstMatch = pattern.matchNodes[0];
      const lastMatch = pattern.matchNodes[pattern.matchNodes.length - 1];
      const firstNode = newGraph.find(n => n.id === firstMatch)!;
      const lastNode = newGraph.find(n => n.id === lastMatch)!;

      // Create fused node with inputs from first node
      const fusedNode: GraphNode = {
        id: `fused_${pattern.id}`,
        op: 'fused',
        inputs: firstNode.inputs,
        label: pattern.replacementLabel,
      };

      // Remove matched nodes
      newGraph = newGraph.filter(n => !pattern.matchNodes.includes(n.id));

      // Update nodes that depended on lastMatch to depend on fused node
      newGraph.forEach(n => {
        n.inputs = n.inputs.map(inp => (inp === lastMatch ? fusedNode.id : inp));
      });

      // Insert fused node
      newGraph.push(fusedNode);
    }

    setGraph(layoutGraph(newGraph));
    setAppliedPatterns([...appliedPatterns, selectedPattern]);
    setSelectedPattern(null);
  }

  function handleReset() {
    setGraph(layoutGraph(INITIAL_GRAPH));
    setAppliedPatterns([]);
    setSelectedPattern(null);
  }

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Left panel: Pattern cards */}
        <g>
          <text
            x={PANEL_LEFT + PANEL_WIDTH / 2}
            y={75}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={COLORS.dark}
          >
            {t.patterns}
          </text>

          {PATTERNS.map((pattern, idx) => {
            const isSelected = selectedPattern === pattern.id;
            const isApplied = appliedPatterns.includes(pattern.id);
            const cardY = 90 + idx * 60;
            const canApply = matchedNodes.size > 0 && isSelected;

            return (
              <g
                key={pattern.id}
                onClick={() => !isApplied && setSelectedPattern(isSelected ? null : pattern.id)}
                style={{ cursor: isApplied ? 'default' : 'pointer' }}
              >
                <rect
                  x={PANEL_LEFT}
                  y={cardY}
                  width={PANEL_WIDTH}
                  height={50}
                  rx={6}
                  fill={isApplied ? COLORS.masked : (isSelected ? COLORS.valid : COLORS.bg)}
                  stroke={isApplied ? COLORS.mid : (isSelected ? COLORS.primary : COLORS.light)}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={isApplied ? 0.5 : 1}
                />
                <text
                  x={PANEL_LEFT + PANEL_WIDTH / 2}
                  y={cardY + 18}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill={isApplied ? COLORS.mid : COLORS.dark}
                >
                  {pattern.name[locale].split('→')[0]}
                </text>
                <text
                  x={PANEL_LEFT + PANEL_WIDTH / 2}
                  y={cardY + 32}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isApplied ? COLORS.mid : COLORS.dark}
                >
                  → {pattern.name[locale].split('→')[1]}
                </text>

                {isApplied && (
                  <g>
                    <rect
                      x={PANEL_LEFT + PANEL_WIDTH - 50}
                      y={cardY + 4}
                      width={44}
                      height={14}
                      rx={7}
                      fill={COLORS.green}
                      fillOpacity={0.2}
                    />
                    <text
                      x={PANEL_LEFT + PANEL_WIDTH - 28}
                      y={cardY + 14}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="600"
                      fill={COLORS.green}
                    >
                      {t.applied}
                    </text>
                  </g>
                )}

                {canApply && (
                  <g
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={PANEL_LEFT + PANEL_WIDTH - 50}
                      y={cardY + 50 - 18}
                      width={44}
                      height={14}
                      rx={7}
                      fill={COLORS.primary}
                    />
                    <text
                      x={PANEL_LEFT + PANEL_WIDTH - 28}
                      y={cardY + 50 - 8}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="600"
                      fill={COLORS.bg}
                    >
                      {t.apply}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Reset button */}
          <g
            transform={`translate(${PANEL_LEFT}, ${90 + PATTERNS.length * 60 + 10})`}
            onClick={handleReset}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={0}
              y={0}
              width={PANEL_WIDTH}
              height={28}
              rx={6}
              fill={COLORS.bgAlt}
              stroke={COLORS.mid}
              strokeWidth={1}
            />
            <text
              x={PANEL_WIDTH / 2}
              y={18}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={COLORS.dark}
            >
              {t.reset}
            </text>
          </g>
        </g>

        {/* Right: Graph */}
        <g>
          <text
            x={GRAPH_LEFT + GRAPH_WIDTH / 2}
            y={75}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={COLORS.dark}
          >
            {t.currentGraph}
          </text>

          {/* Edges */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} opacity={0.4} />
            </marker>
          </defs>

          <AnimatePresence>
            {graph.map(node => {
              if (!node.x || !node.y) return null;
              return node.inputs.map(inputId => {
                const inputNode = graph.find(n => n.id === inputId);
                if (!inputNode?.x || !inputNode?.y) return null;

                return (
                  <motion.line
                    key={`${node.id}-${inputId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    x1={inputNode.x}
                    y1={inputNode.y + NODE_R}
                    x2={node.x}
                    y2={node.y - NODE_R}
                    stroke={COLORS.mid}
                    strokeWidth={1.5}
                    markerEnd="url(#arrowhead)"
                  />
                );
              });
            })}
          </AnimatePresence>

          {/* Nodes */}
          <AnimatePresence>
            {graph.map(node => {
              if (!node.x || !node.y) return null;
              const isMatched = matchedNodes.has(node.id);
              const nodeColor =
                node.op === 'input' || node.op === 'param' || node.op === 'const'
                  ? COLORS.light
                  : node.op === 'output'
                    ? COLORS.purple
                    : node.op === 'fused'
                      ? COLORS.green
                      : COLORS.primary;

              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_R}
                    fill={nodeColor}
                    fillOpacity={isMatched ? 0.3 : 0.15}
                    stroke={isMatched ? COLORS.orange : nodeColor}
                    strokeWidth={isMatched ? 3 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fontWeight={isMatched ? '700' : '600'}
                    fill={isMatched ? COLORS.orange : COLORS.dark}
                    style={{ fontFamily: FONTS.mono }}
                  >
                    {node.label}
                  </text>
                  {isMatched && (
                    <text
                      x={node.x}
                      y={node.y + NODE_R + 12}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="600"
                      fill={COLORS.orange}
                    >
                      {t.matched}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </g>

        {/* Hint text */}
        <text
          x={W / 2}
          y={H - 10}
          textAnchor="middle"
          fontSize="9"
          fill={COLORS.mid}
        >
          {t.selectPattern}
        </text>
      </svg>
    </div>
  );
}
