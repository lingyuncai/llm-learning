import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface GraphNode {
  id: string;
  label: string;
  phase: 'forward' | 'backward' | 'saved';
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

/* ─── Data: Before AOTAutograd (forward only) ─── */

const FORWARD_ONLY_NODES: GraphNode[] = [
  { id: 'x', label: 'x', phase: 'forward', x: 120, y: 30 },
  { id: 'w', label: 'W', phase: 'forward', x: 300, y: 30 },
  { id: 'mm', label: 'matmul', phase: 'forward', x: 200, y: 100 },
  { id: 'b', label: 'bias', phase: 'forward', x: 400, y: 100 },
  { id: 'add', label: 'add', phase: 'forward', x: 300, y: 170 },
  { id: 'relu', label: 'relu', phase: 'forward', x: 300, y: 240 },
  { id: 'loss', label: 'loss_fn', phase: 'forward', x: 300, y: 310 },
];

const FORWARD_ONLY_EDGES: GraphEdge[] = [
  { from: 'x', to: 'mm' },
  { from: 'w', to: 'mm' },
  { from: 'mm', to: 'add' },
  { from: 'b', to: 'add' },
  { from: 'add', to: 'relu' },
  { from: 'relu', to: 'loss' },
];

/* ─── Data: After AOTAutograd (joint graph) ─── */

const JOINT_NODES: GraphNode[] = [
  // Forward nodes
  { id: 'j_x', label: 'x', phase: 'forward', x: 80, y: 20 },
  { id: 'j_w', label: 'W', phase: 'forward', x: 240, y: 20 },
  { id: 'j_mm', label: 'matmul', phase: 'forward', x: 150, y: 80 },
  { id: 'j_b', label: 'bias', phase: 'forward', x: 340, y: 80 },
  { id: 'j_add', label: 'add', phase: 'forward', x: 240, y: 140 },
  { id: 'j_relu', label: 'relu', phase: 'forward', x: 240, y: 200 },
  { id: 'j_loss', label: 'loss_fn', phase: 'forward', x: 240, y: 260 },
  // Saved tensors
  { id: 's_mm', label: 'save: mm_out', phase: 'saved', x: 470, y: 80 },
  { id: 's_relu_mask', label: 'save: relu_mask', phase: 'saved', x: 470, y: 200 },
  { id: 's_x', label: 'save: x', phase: 'saved', x: 470, y: 140 },
  // Backward nodes
  { id: 'b_loss', label: 'grad_loss', phase: 'backward', x: 240, y: 330 },
  { id: 'b_relu', label: 'relu_bwd', phase: 'backward', x: 240, y: 390 },
  { id: 'b_add', label: 'add_bwd', phase: 'backward', x: 240, y: 450 },
  { id: 'b_mm', label: 'matmul_bwd', phase: 'backward', x: 150, y: 510 },
  { id: 'grad_w', label: 'grad_W', phase: 'backward', x: 340, y: 510 },
];

const JOINT_EDGES: GraphEdge[] = [
  // Forward
  { from: 'j_x', to: 'j_mm' },
  { from: 'j_w', to: 'j_mm' },
  { from: 'j_mm', to: 'j_add' },
  { from: 'j_b', to: 'j_add' },
  { from: 'j_add', to: 'j_relu' },
  { from: 'j_relu', to: 'j_loss' },
  // Saved tensors connections
  { from: 'j_mm', to: 's_mm', label: 'save' },
  { from: 'j_relu', to: 's_relu_mask', label: 'save' },
  { from: 'j_x', to: 's_x', label: 'save' },
  // Backward
  { from: 'j_loss', to: 'b_loss' },
  { from: 'b_loss', to: 'b_relu' },
  { from: 's_relu_mask', to: 'b_relu', label: 'use' },
  { from: 'b_relu', to: 'b_add' },
  { from: 'b_add', to: 'b_mm' },
  { from: 'b_add', to: 'grad_w' },
  { from: 's_x', to: 'b_mm', label: 'use' },
  { from: 's_mm', to: 'grad_w', label: 'use' },
];

/* ─── Constants ─── */

const NODE_W = 110;
const NODE_H = 30;

const PHASE_COLORS = {
  forward: COLORS.primary,
  backward: COLORS.red,
  saved: '#d4a017',
};

/* ─── Props ─── */

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Helpers ─── */

function computePath(fromNode: GraphNode, toNode: GraphNode): string {
  const x1 = fromNode.x + NODE_W / 2;
  const y1 = fromNode.y + NODE_H;
  const x2 = toNode.x + NODE_W / 2;
  const y2 = toNode.y;
  // horizontal saved-tensor edges use a different strategy
  if (Math.abs(x2 - x1) > 150) {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1 - NODE_H / 2} C ${midX} ${y1 - NODE_H / 2}, ${midX} ${y2 + NODE_H / 2}, ${x2} ${y2 + NODE_H / 2}`;
  }
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

/* ─── Component ─── */

export default function AOTAutogradFlow({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'AOTAutograd: 前向+反向联合图',
      before: '编译前（仅前向图）',
      after: '编译后（联合图）',
      forward: '前向',
      backward: '反向',
      saved: '保存的张量',
      desc: 'AOTAutograd 在编译时追踪 Autograd，生成包含前向和反向计算的联合图，实现跨前向/反向的全局优化',
      partitioning: '分区后，前向图和反向图可分别优化并传递给后端（如 Inductor）',
    },
    en: {
      title: 'AOTAutograd: Forward+Backward Joint Graph',
      before: 'Before (Forward Graph Only)',
      after: 'After (Joint Graph)',
      forward: 'Forward',
      backward: 'Backward',
      saved: 'Saved Tensors',
      desc: 'AOTAutograd traces Autograd at compile time, generating a joint graph with both forward and backward, enabling cross-phase global optimization',
      partitioning: 'After partitioning, forward and backward graphs are separately optimized and sent to the backend (e.g., Inductor)',
    },
  }[locale]!;

  const [view, setView] = useState<'before' | 'after'>('before');

  const nodes = view === 'before' ? FORWARD_ONLY_NODES : JOINT_NODES;
  const edges = view === 'before' ? FORWARD_ONLY_EDGES : JOINT_EDGES;
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const svgH = view === 'before' ? 380 : 570;

  return (
    <div className="my-6">
      {/* Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setView('before')}
          className="px-4 py-1.5 text-sm rounded-md transition-colors"
          style={{
            backgroundColor: view === 'before' ? COLORS.primary : COLORS.bgAlt,
            color: view === 'before' ? '#fff' : COLORS.dark,
            border: `1px solid ${view === 'before' ? COLORS.primary : COLORS.light}`,
          }}
        >
          {t.before}
        </button>
        <button
          onClick={() => setView('after')}
          className="px-4 py-1.5 text-sm rounded-md transition-colors"
          style={{
            backgroundColor: view === 'after' ? COLORS.primary : COLORS.bgAlt,
            color: view === 'after' ? '#fff' : COLORS.dark,
            border: `1px solid ${view === 'after' ? COLORS.primary : COLORS.light}`,
          }}
        >
          {t.after}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <svg viewBox={`0 0 620 ${svgH}`} className="w-full">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>

            {/* Arrow marker */}
            <defs>
              <marker id="aotArrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.mid} fillOpacity="0.6" />
              </marker>
              <marker id="aotArrowSaved" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" fill="#d4a017" fillOpacity="0.6" />
              </marker>
            </defs>

            {/* Background regions for joint graph */}
            {view === 'after' && (
              <>
                {/* Forward region */}
                <rect x="20" y="5" width="430" height="280" rx="10" fill={COLORS.primary} fillOpacity="0.04" stroke={COLORS.primary} strokeWidth="1" strokeDasharray="6,3" strokeOpacity="0.3" />
                <text x="35" y="22" fontSize="10" fontWeight="600" fill={COLORS.primary} opacity="0.6">
                  {t.forward}
                </text>

                {/* Saved tensors region */}
                <rect x="455" y="65" width="150" height="185" rx="10" fill="#d4a017" fillOpacity="0.04" stroke="#d4a017" strokeWidth="1" strokeDasharray="6,3" strokeOpacity="0.3" />
                <text x="470" y="82" fontSize="10" fontWeight="600" fill="#d4a017" opacity="0.6">
                  {t.saved}
                </text>

                {/* Backward region */}
                <rect x="100" y="310" width="340" height="245" rx="10" fill={COLORS.red} fillOpacity="0.04" stroke={COLORS.red} strokeWidth="1" strokeDasharray="6,3" strokeOpacity="0.3" />
                <text x="115" y="327" fontSize="10" fontWeight="600" fill={COLORS.red} opacity="0.6">
                  {t.backward}
                </text>
              </>
            )}

            {/* Edges */}
            {edges.map((edge, i) => {
              const fromNode = nodeMap[edge.from];
              const toNode = nodeMap[edge.to];
              if (!fromNode || !toNode) return null;
              const isSaved = edge.label === 'save' || edge.label === 'use';
              return (
                <path
                  key={i}
                  d={computePath(fromNode, toNode)}
                  fill="none"
                  stroke={isSaved ? '#d4a017' : COLORS.mid}
                  strokeWidth={isSaved ? 1.5 : 1}
                  strokeOpacity={isSaved ? 0.6 : 0.35}
                  strokeDasharray={isSaved ? '5,3' : 'none'}
                  markerEnd={isSaved ? 'url(#aotArrowSaved)' : 'url(#aotArrow)'}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node, i) => {
              const color = PHASE_COLORS[node.phase];
              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx="6"
                    fill={color}
                    fillOpacity={0.1}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  <text
                    x={node.x + NODE_W / 2}
                    y={node.y + NODE_H / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontFamily={FONTS.mono}
                    fontWeight="600"
                    fill={color}
                  >
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Description */}
      <p className="text-sm mt-2" style={{ color: COLORS.mid }}>
        {view === 'before' ? t.desc : t.partitioning}
      </p>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {[
          { color: COLORS.primary, label: t.forward },
          { color: COLORS.red, label: t.backward },
          { color: '#d4a017', label: t.saved },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color, opacity: 0.6 }} />
            <span className="text-xs" style={{ color: COLORS.mid }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
