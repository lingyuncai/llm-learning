import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

interface GraphNode {
  id: string;
  label: string;
  type: 'compute' | 'quant' | 'dequant' | 'fused';
  precision: 'INT4' | 'INT8' | 'FP16' | 'FP32';
  x: number;
  y: number;
  absorbedOps?: string[];
}

interface GraphEdge {
  from: string;
  to: string;
  precision: string;
}

interface FusionPattern {
  id: string;
  label: { zh: string; en: string };
  beforeNodes: GraphNode[];
  beforeEdges: GraphEdge[];
  afterNodes: GraphNode[];
  afterEdges: GraphEdge[];
  savings: { ops: string; conversions: string; memoryTrips: string };
}

const W = 800;
const H = 520;

const PATTERNS: FusionPattern[] = [
  {
    id: 'matmul',
    label: { zh: 'MatMul 权重反量化融合', en: 'MatMul Weight Dequant Fusion' },
    beforeNodes: [
      { id: 'w_int4', label: 'W (INT4)', type: 'compute', precision: 'INT4', x: 40, y: 60 },
      { id: 'dequant_w', label: 'Dequant', type: 'dequant', precision: 'FP16', x: 40, y: 150 },
      { id: 'x_fp16', label: 'X (FP16)', type: 'compute', precision: 'FP16', x: 200, y: 60 },
      { id: 'matmul', label: 'MatMul', type: 'compute', precision: 'FP16', x: 120, y: 250 },
      { id: 'quant_y', label: 'Quant', type: 'quant', precision: 'INT8', x: 120, y: 340 },
      { id: 'y_int8', label: 'Y (INT8)', type: 'compute', precision: 'INT8', x: 120, y: 420 },
    ],
    beforeEdges: [
      { from: 'w_int4', to: 'dequant_w', precision: 'INT4' },
      { from: 'dequant_w', to: 'matmul', precision: 'FP16' },
      { from: 'x_fp16', to: 'matmul', precision: 'FP16' },
      { from: 'matmul', to: 'quant_y', precision: 'FP16' },
      { from: 'quant_y', to: 'y_int8', precision: 'INT8' },
    ],
    afterNodes: [
      { id: 'w_int4', label: 'W (INT4)', type: 'compute', precision: 'INT4', x: 40, y: 80 },
      { id: 'x_fp16', label: 'X (FP16)', type: 'compute', precision: 'FP16', x: 200, y: 80 },
      { id: 'fused', label: 'Fused\nDequant+MatMul', type: 'fused', precision: 'FP16', x: 120, y: 220, absorbedOps: ['Dequant(W)', 'MatMul'] },
      { id: 'quant_y', label: 'Quant', type: 'quant', precision: 'INT8', x: 120, y: 350 },
      { id: 'y_int8', label: 'Y (INT8)', type: 'compute', precision: 'INT8', x: 120, y: 430 },
    ],
    afterEdges: [
      { from: 'w_int4', to: 'fused', precision: 'INT4' },
      { from: 'x_fp16', to: 'fused', precision: 'FP16' },
      { from: 'fused', to: 'quant_y', precision: 'FP16' },
      { from: 'quant_y', to: 'y_int8', precision: 'INT8' },
    ],
    savings: { ops: '6 → 5', conversions: '2 → 1', memoryTrips: '3 → 1' },
  },
  {
    id: 'epilogue',
    label: { zh: 'Epilogue 量化融合', en: 'Epilogue Quant Fusion' },
    beforeNodes: [
      { id: 'x_fp16', label: 'X (FP16)', type: 'compute', precision: 'FP16', x: 120, y: 40 },
      { id: 'matmul', label: 'MatMul', type: 'compute', precision: 'FP16', x: 120, y: 120 },
      { id: 'bias_add', label: 'BiasAdd', type: 'compute', precision: 'FP16', x: 120, y: 200 },
      { id: 'relu', label: 'ReLU', type: 'compute', precision: 'FP16', x: 120, y: 280 },
      { id: 'quant_y', label: 'Quant', type: 'quant', precision: 'INT8', x: 120, y: 360 },
      { id: 'y_int8', label: 'Y (INT8)', type: 'compute', precision: 'INT8', x: 120, y: 430 },
    ],
    beforeEdges: [
      { from: 'x_fp16', to: 'matmul', precision: 'FP16' },
      { from: 'matmul', to: 'bias_add', precision: 'FP16' },
      { from: 'bias_add', to: 'relu', precision: 'FP16' },
      { from: 'relu', to: 'quant_y', precision: 'FP16' },
      { from: 'quant_y', to: 'y_int8', precision: 'INT8' },
    ],
    afterNodes: [
      { id: 'x_fp16', label: 'X (FP16)', type: 'compute', precision: 'FP16', x: 120, y: 60 },
      { id: 'fused', label: 'Fused\nMatMul+Bias+ReLU+Quant', type: 'fused', precision: 'INT8', x: 120, y: 230, absorbedOps: ['MatMul', 'BiasAdd', 'ReLU', 'Quant'] },
      { id: 'y_int8', label: 'Y (INT8)', type: 'compute', precision: 'INT8', x: 120, y: 400 },
    ],
    afterEdges: [
      { from: 'x_fp16', to: 'fused', precision: 'FP16' },
      { from: 'fused', to: 'y_int8', precision: 'INT8' },
    ],
    savings: { ops: '6 → 3', conversions: '1 → 0', memoryTrips: '4 → 1' },
  },
  {
    id: 'full',
    label: { zh: '完整 Dequant-Compute-Quant 融合', en: 'Full Dequant-Compute-Quant Fusion' },
    beforeNodes: [
      { id: 'x_int8', label: 'X (INT8)', type: 'compute', precision: 'INT8', x: 120, y: 30 },
      { id: 'dequant_x', label: 'Dequant', type: 'dequant', precision: 'FP16', x: 120, y: 100 },
      { id: 'w_int4', label: 'W (INT4)', type: 'compute', precision: 'INT4', x: 10, y: 100 },
      { id: 'dequant_w', label: 'Dequant', type: 'dequant', precision: 'FP16', x: 10, y: 175 },
      { id: 'matmul', label: 'MatMul', type: 'compute', precision: 'FP16', x: 80, y: 250 },
      { id: 'layernorm', label: 'LayerNorm', type: 'compute', precision: 'FP16', x: 80, y: 325 },
      { id: 'quant_y', label: 'Quant', type: 'quant', precision: 'INT8', x: 80, y: 400 },
      { id: 'y_int8', label: 'Y (INT8)', type: 'compute', precision: 'INT8', x: 80, y: 460 },
    ],
    beforeEdges: [
      { from: 'x_int8', to: 'dequant_x', precision: 'INT8' },
      { from: 'dequant_x', to: 'matmul', precision: 'FP16' },
      { from: 'w_int4', to: 'dequant_w', precision: 'INT4' },
      { from: 'dequant_w', to: 'matmul', precision: 'FP16' },
      { from: 'matmul', to: 'layernorm', precision: 'FP16' },
      { from: 'layernorm', to: 'quant_y', precision: 'FP16' },
      { from: 'quant_y', to: 'y_int8', precision: 'INT8' },
    ],
    afterNodes: [
      { id: 'x_int8', label: 'X (INT8)', type: 'compute', precision: 'INT8', x: 60, y: 60 },
      { id: 'w_int4', label: 'W (INT4)', type: 'compute', precision: 'INT4', x: 200, y: 60 },
      { id: 'fused', label: 'Fused\nDequant+MatMul\n+LN+Quant', type: 'fused', precision: 'INT8', x: 120, y: 240, absorbedOps: ['Dequant(X)', 'Dequant(W)', 'MatMul', 'LayerNorm', 'Quant'] },
      { id: 'y_int8', label: 'Y (INT8)', type: 'compute', precision: 'INT8', x: 120, y: 420 },
    ],
    afterEdges: [
      { from: 'x_int8', to: 'fused', precision: 'INT8' },
      { from: 'w_int4', to: 'fused', precision: 'INT4' },
      { from: 'fused', to: 'y_int8', precision: 'INT8' },
    ],
    savings: { ops: '8 → 4', conversions: '3 → 0', memoryTrips: '5 → 1' },
  },
];

function nodeColor(type: GraphNode['type']): string {
  switch (type) {
    case 'compute': return COLORS.primary;
    case 'quant': return COLORS.red;
    case 'dequant': return COLORS.orange;
    case 'fused': return COLORS.green;
  }
}

function precisionColor(precision: string): string {
  switch (precision) {
    case 'FP32': return COLORS.primary;
    case 'FP16': return COLORS.green;
    case 'INT8': return COLORS.orange;
    case 'INT4': return COLORS.red;
    default: return COLORS.mid;
  }
}

export default function QuantFusionVisualizer({ locale = 'zh' }: Props) {
  const [activePattern, setActivePattern] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const t = {
    zh: {
      title: '量化感知融合可视化',
      before: '融合前',
      after: '融合后',
      ops: '算子数',
      conversions: '类型转换',
      memoryTrips: '显存往返',
      fusedContains: '融合包含:',
      legendCompute: '计算算子',
      legendQuant: '量化',
      legendDequant: '反量化',
      legendFused: '融合算子',
    },
    en: {
      title: 'Quantization-Aware Fusion Visualizer',
      before: 'Before Fusion',
      after: 'After Fusion',
      ops: 'Ops',
      conversions: 'Type Conversions',
      memoryTrips: 'Memory Trips',
      fusedContains: 'Fused contains:',
      legendCompute: 'Compute',
      legendQuant: 'Quant',
      legendDequant: 'Dequant',
      legendFused: 'Fused',
    },
  }[locale]!;

  const pattern = PATTERNS[activePattern];

  const panelW = 280;
  const leftX = 30;
  const rightX = W - panelW - 30;
  const graphTop = 100;

  const findNode = useCallback((nodes: GraphNode[], id: string) => nodes.find(n => n.id === id), []);

  const renderGraph = (nodes: GraphNode[], edges: GraphEdge[], offsetX: number, isFused: boolean) => {
    const nodeW = 120;
    const nodeH = isFused ? 50 : 40;

    return (
      <g>
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = findNode(nodes, edge.from);
          const toNode = findNode(nodes, edge.to);
          if (!fromNode || !toNode) return null;
          const fx = offsetX + fromNode.x + nodeW / 2;
          const fy = graphTop + fromNode.y + nodeH;
          const tx = offsetX + toNode.x + nodeW / 2;
          const ty = graphTop + toNode.y;
          const midY = (fy + ty) / 2;
          return (
            <g key={`edge-${i}`}>
              <path
                d={`M${fx},${fy} C${fx},${midY} ${tx},${midY} ${tx},${ty}`}
                fill="none"
                stroke={precisionColor(edge.precision)}
                strokeWidth="2"
                markerEnd="url(#qfv-arrow)"
              />
              <text
                x={(fx + tx) / 2 + 8}
                y={midY - 4}
                fontSize="9"
                fontFamily={FONTS.mono}
                fill={precisionColor(edge.precision)}
                textAnchor="start"
              >
                {edge.precision}
              </text>
            </g>
          );
        })}
        {/* Nodes */}
        {nodes.map((node) => {
          const nx = offsetX + node.x;
          const ny = graphTop + node.y;
          const isFusedNode = node.type === 'fused';
          const nw = isFusedNode ? 160 : nodeW;
          const nh = isFusedNode ? 70 : nodeH;
          const isHovered = hoveredNode === `${isFused ? 'after' : 'before'}-${node.id}`;
          const lines = node.label.split('\n');

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(`${isFused ? 'after' : 'before'}-${node.id}`)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: isFusedNode ? 'pointer' : 'default' }}
            >
              <motion.rect
                x={nx}
                y={ny}
                width={nw}
                height={nh}
                rx={isFusedNode ? 8 : 4}
                fill={isHovered ? COLORS.highlight : COLORS.bgAlt}
                stroke={nodeColor(node.type)}
                strokeWidth={isFusedNode ? 2.5 : 1.5}
                strokeDasharray={isFusedNode ? '6 3' : 'none'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.05 * nodes.indexOf(node) }}
              />
              {lines.map((line, li) => (
                <motion.text
                  key={li}
                  x={nx + nw / 2}
                  y={ny + (lines.length === 1 ? nh / 2 + 4 : 18 + li * 16)}
                  textAnchor="middle"
                  fontSize={isFusedNode ? 11 : 12}
                  fontWeight={isFusedNode ? 700 : 500}
                  fontFamily={FONTS.sans}
                  fill={nodeColor(node.type)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + 0.05 * nodes.indexOf(node) }}
                >
                  {line}
                </motion.text>
              ))}
              {/* Tooltip for fused nodes */}
              {isFusedNode && isHovered && node.absorbedOps && (
                <g>
                  <rect
                    x={nx - 10}
                    y={ny + nh + 6}
                    width={nw + 20}
                    height={16 + node.absorbedOps.length * 14}
                    rx={4}
                    fill={COLORS.dark}
                    fillOpacity={0.92}
                  />
                  <text
                    x={nx + nw / 2}
                    y={ny + nh + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily={FONTS.sans}
                    fill="#fff"
                  >
                    {t.fusedContains}
                  </text>
                  {node.absorbedOps.map((op, oi) => (
                    <text
                      key={oi}
                      x={nx + nw / 2}
                      y={ny + nh + 34 + oi * 14}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily={FONTS.mono}
                      fill="#ddd"
                    >
                      {op}
                    </text>
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="my-6">
      {/* Pattern selector buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {PATTERNS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActivePattern(i)}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: i === activePattern ? COLORS.primary : COLORS.bgAlt,
              color: i === activePattern ? '#fff' : COLORS.dark,
              border: `1px solid ${i === activePattern ? COLORS.primary : COLORS.light}`,
            }}
          >
            {p.label[locale]}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="qfv-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Left panel label */}
        <text x={leftX + panelW / 2} y={60} textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.red}>
          {t.before}
        </text>
        <rect x={leftX - 5} y={graphTop - 15} width={panelW + 10} height={H - graphTop - 10} rx={6} fill="none" stroke={COLORS.light} strokeWidth="1" strokeDasharray="4 2" />

        {/* Right panel label */}
        <text x={rightX + panelW / 2} y={60} textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.green}>
          {t.after}
        </text>
        <rect x={rightX - 5} y={graphTop - 15} width={panelW + 10} height={H - graphTop - 10} rx={6} fill="none" stroke={COLORS.light} strokeWidth="1" strokeDasharray="4 2" />

        {/* Arrow between panels */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <line x1={leftX + panelW + 20} y1={H / 2} x2={rightX - 20} y2={H / 2} stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#qfv-arrow)" />
          <text x={(leftX + panelW + rightX) / 2} y={H / 2 - 10} textAnchor="middle" fontSize="11" fill={COLORS.mid} fontWeight="600">
            Fusion
          </text>
        </motion.g>

        {/* Before graph */}
        <AnimatePresence mode="wait">
          <motion.g
            key={`before-${pattern.id}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4 }}
          >
            {renderGraph(pattern.beforeNodes, pattern.beforeEdges, leftX, false)}
          </motion.g>
        </AnimatePresence>

        {/* After graph */}
        <AnimatePresence mode="wait">
          <motion.g
            key={`after-${pattern.id}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {renderGraph(pattern.afterNodes, pattern.afterEdges, rightX, true)}
          </motion.g>
        </AnimatePresence>

        {/* Stats box (center bottom) */}
        <motion.g
          key={`stats-${pattern.id}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
        >
          <rect x={W / 2 - 80} y={H - 65} width={160} height={55} rx={6} fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth="1.5" />
          <text x={W / 2} y={H - 47} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.dark}>
            {t.ops}: {pattern.savings.ops}
          </text>
          <text x={W / 2} y={H - 33} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.dark}>
            {t.conversions}: {pattern.savings.conversions}
          </text>
          <text x={W / 2} y={H - 19} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.dark}>
            {t.memoryTrips}: {pattern.savings.memoryTrips}
          </text>
        </motion.g>

        {/* Legend */}
        {[
          { color: COLORS.primary, label: t.legendCompute },
          { color: COLORS.quant ?? COLORS.red, label: t.legendQuant },
          { color: COLORS.orange, label: t.legendDequant },
          { color: COLORS.green, label: t.legendFused },
        ].map((item, i) => (
          <g key={i}>
            <rect x={leftX + i * 90} y={H - 10} width={10} height={10} rx={2} fill="none" stroke={item.color} strokeWidth="2" />
            <text x={leftX + i * 90 + 14} y={H - 1} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
