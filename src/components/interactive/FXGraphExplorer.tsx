import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface FXNode {
  id: string;
  op: 'placeholder' | 'call_function' | 'call_method' | 'call_module' | 'get_attr' | 'output';
  target: string;
  args: string[];
  shape: string;
  dtype: string;
  description: { zh: string; en: string };
  x: number;
  y: number;
}

interface FXEdge {
  from: string;
  to: string;
}

/* ─── Color map ─── */

const OP_COLOR: Record<string, string> = {
  placeholder: COLORS.primary,
  call_function: COLORS.green,
  call_method: '#00838f',
  call_module: COLORS.purple,
  get_attr: COLORS.orange,
  output: '#e65100',
};

const OP_LABEL: Record<string, string> = {
  placeholder: 'placeholder',
  call_function: 'call_function',
  call_method: 'call_method',
  call_module: 'call_module',
  get_attr: 'get_attr',
  output: 'output',
};

/* ─── Sample: Transformer self-attention subgraph ─── */

const NODES: FXNode[] = [
  { id: 'x', op: 'placeholder', target: 'x', args: [], shape: '[B, S, 768]', dtype: 'float32', description: { zh: '输入 hidden states', en: 'Input hidden states' }, x: 360, y: 20 },
  { id: 'wq', op: 'get_attr', target: 'self.W_q', args: [], shape: '[768, 768]', dtype: 'float32', description: { zh: 'Query 投影权重', en: 'Query projection weight' }, x: 100, y: 90 },
  { id: 'wk', op: 'get_attr', target: 'self.W_k', args: [], shape: '[768, 768]', dtype: 'float32', description: { zh: 'Key 投影权重', en: 'Key projection weight' }, x: 330, y: 90 },
  { id: 'wv', op: 'get_attr', target: 'self.W_v', args: [], shape: '[768, 768]', dtype: 'float32', description: { zh: 'Value 投影权重', en: 'Value projection weight' }, x: 560, y: 90 },
  { id: 'q', op: 'call_function', target: 'torch.matmul', args: ['x', 'W_q'], shape: '[B, S, 768]', dtype: 'float32', description: { zh: 'Q = x @ W_q，计算 Query', en: 'Q = x @ W_q, compute Query' }, x: 100, y: 170 },
  { id: 'k', op: 'call_function', target: 'torch.matmul', args: ['x', 'W_k'], shape: '[B, S, 768]', dtype: 'float32', description: { zh: 'K = x @ W_k，计算 Key', en: 'K = x @ W_k, compute Key' }, x: 330, y: 170 },
  { id: 'v', op: 'call_function', target: 'torch.matmul', args: ['x', 'W_v'], shape: '[B, S, 768]', dtype: 'float32', description: { zh: 'V = x @ W_v，计算 Value', en: 'V = x @ W_v, compute Value' }, x: 560, y: 170 },
  { id: 'kt', op: 'call_method', target: 'transpose', args: ['k', '-2', '-1'], shape: '[B, 768, S]', dtype: 'float32', description: { zh: '转置 Key 用于点积', en: 'Transpose Key for dot product' }, x: 330, y: 240 },
  { id: 'attn_w', op: 'call_function', target: 'torch.matmul', args: ['q', 'k_t'], shape: '[B, S, S]', dtype: 'float32', description: { zh: 'Attention weights = Q @ K^T', en: 'Attention weights = Q @ K^T' }, x: 200, y: 300 },
  { id: 'scale', op: 'call_function', target: 'torch.div', args: ['attn_w', 'sqrt(d)'], shape: '[B, S, S]', dtype: 'float32', description: { zh: '除以 sqrt(d_k) 缩放', en: 'Scale by sqrt(d_k)' }, x: 200, y: 360 },
  { id: 'softmax', op: 'call_function', target: 'torch.softmax', args: ['scaled', 'dim=-1'], shape: '[B, S, S]', dtype: 'float32', description: { zh: 'Softmax 归一化得到注意力分布', en: 'Softmax normalize to get attention distribution' }, x: 360, y: 360 },
  { id: 'out', op: 'call_function', target: 'torch.matmul', args: ['softmax', 'v'], shape: '[B, S, 768]', dtype: 'float32', description: { zh: 'Output = softmax(scores) @ V', en: 'Output = softmax(scores) @ V' }, x: 460, y: 420 },
  { id: 'output', op: 'output', target: 'output', args: ['out'], shape: '[B, S, 768]', dtype: 'float32', description: { zh: '图的输出节点', en: 'Graph output node' }, x: 360, y: 490 },
];

const EDGES: FXEdge[] = [
  { from: 'x', to: 'q' }, { from: 'x', to: 'k' }, { from: 'x', to: 'v' },
  { from: 'wq', to: 'q' }, { from: 'wk', to: 'k' }, { from: 'wv', to: 'v' },
  { from: 'k', to: 'kt' },
  { from: 'q', to: 'attn_w' }, { from: 'kt', to: 'attn_w' },
  { from: 'attn_w', to: 'scale' },
  { from: 'scale', to: 'softmax' },
  { from: 'softmax', to: 'out' }, { from: 'v', to: 'out' },
  { from: 'out', to: 'output' },
];

const NODE_W = 150;
const NODE_H = 36;

/* ─── Props ─── */

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Helpers ─── */

function getNodeCenter(node: FXNode): { cx: number; cy: number } {
  return { cx: node.x + NODE_W / 2, cy: node.y + NODE_H / 2 };
}

function computeEdgePath(fromNode: FXNode, toNode: FXNode): string {
  const from = getNodeCenter(fromNode);
  const to = getNodeCenter(toNode);
  // Connect from bottom of source to top of target
  const x1 = from.cx;
  const y1 = fromNode.y + NODE_H;
  const x2 = to.cx;
  const y2 = toNode.y;
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

/* ─── Component ─── */

export default function FXGraphExplorer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'FX Graph 节点探索器',
      subtitle: '点击节点查看详情 — Transformer Self-Attention 子图',
      op: '操作类型',
      target: '目标',
      shape: '形状',
      dtype: '数据类型',
      args: '参数',
      desc: '描述',
      clickHint: '点击节点查看详细信息',
    },
    en: {
      title: 'FX Graph Node Explorer',
      subtitle: 'Click a node for details — Transformer Self-Attention subgraph',
      op: 'Op Type',
      target: 'Target',
      shape: 'Shape',
      dtype: 'Data Type',
      args: 'Args',
      desc: 'Description',
      clickHint: 'Click a node to see details',
    },
  }[locale]!;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = NODES.find(n => n.id === selectedId) ?? null;

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <div className="my-6">
      <svg viewBox="0 0 800 550" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x="400" y="16" textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Arrow marker */}
        <defs>
          <marker id="fxArrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.mid} fillOpacity="0.5" />
          </marker>
        </defs>

        {/* Edges */}
        {EDGES.map((edge, i) => {
          const fromNode = nodeMap[edge.from];
          const toNode = nodeMap[edge.to];
          if (!fromNode || !toNode) return null;
          const isHighlighted = selectedId === edge.from || selectedId === edge.to;
          return (
            <path
              key={i}
              d={computeEdgePath(fromNode, toNode)}
              fill="none"
              stroke={isHighlighted ? COLORS.primary : COLORS.mid}
              strokeWidth={isHighlighted ? 2 : 1}
              strokeOpacity={isHighlighted ? 0.8 : 0.3}
              markerEnd="url(#fxArrow)"
            />
          );
        })}

        {/* Nodes */}
        {NODES.map(node => {
          const color = OP_COLOR[node.op] || COLORS.mid;
          const isSelected = node.id === selectedId;

          return (
            <g
              key={node.id}
              onClick={() => setSelectedId(isSelected ? null : node.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Node rect */}
              <motion.rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx="6"
                fill={isSelected ? color : COLORS.bg}
                fillOpacity={isSelected ? 0.15 : 1}
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                animate={isSelected ? { strokeOpacity: [0.6, 1, 0.6] } : { strokeOpacity: 1 }}
                transition={isSelected ? { duration: 1.5, repeat: Infinity } : {}}
              />

              {/* Op type tag */}
              <rect
                x={node.x + 4}
                y={node.y + 3}
                width={node.op === 'call_function' ? 74 : (node.op === 'call_method' ? 68 : (node.op === 'call_module' ? 70 : (node.op === 'placeholder' ? 64 : (node.op === 'get_attr' ? 50 : 42))))}
                height={13}
                rx="6"
                fill={color}
                fillOpacity={0.2}
              />
              <text x={node.x + 7} y={node.y + 13} fontSize="7.5" fontWeight="600" fill={color}>
                {OP_LABEL[node.op]}
              </text>

              {/* Target name */}
              <text x={node.x + NODE_W / 2} y={node.y + 28} textAnchor="middle" fontSize="9.5" fontFamily={FONTS.mono} fill={COLORS.dark} fontWeight="600">
                {node.target}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        {(['placeholder', 'call_function', 'call_method', 'get_attr', 'output'] as const).map((op, i) => (
          <g key={op} transform={`translate(${10 + i * 130}, 535)`}>
            <rect x="0" y="-9" width="10" height="10" rx="2" fill={OP_COLOR[op]} fillOpacity="0.6" />
            <text x="14" y="0" fontSize="8.5" fill={COLORS.mid}>{op}</text>
          </g>
        ))}
      </svg>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-3 p-4 rounded-lg border"
            style={{ backgroundColor: COLORS.bgAlt, borderColor: OP_COLOR[selected.op] }}
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="font-semibold" style={{ color: OP_COLOR[selected.op] }}>{t.op}:</span>{' '}
                <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: COLORS.valid }}>{selected.op}</code>
              </div>
              <div>
                <span className="font-semibold" style={{ color: COLORS.dark }}>{t.target}:</span>{' '}
                <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: COLORS.valid, fontFamily: FONTS.mono }}>{selected.target}</code>
              </div>
              <div>
                <span className="font-semibold" style={{ color: COLORS.dark }}>{t.shape}:</span>{' '}
                <code className="text-xs" style={{ fontFamily: FONTS.mono }}>{selected.shape}</code>
              </div>
              <div>
                <span className="font-semibold" style={{ color: COLORS.dark }}>{t.dtype}:</span>{' '}
                <code className="text-xs" style={{ fontFamily: FONTS.mono }}>{selected.dtype}</code>
              </div>
              {selected.args.length > 0 && (
                <div className="col-span-2">
                  <span className="font-semibold" style={{ color: COLORS.dark }}>{t.args}:</span>{' '}
                  <code className="text-xs" style={{ fontFamily: FONTS.mono }}>({selected.args.join(', ')})</code>
                </div>
              )}
              <div className="col-span-2">
                <span className="font-semibold" style={{ color: COLORS.dark }}>{t.desc}:</span>{' '}
                {selected.description[locale]}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <p className="text-center text-sm mt-2" style={{ color: COLORS.mid }}>
          {t.clickHint}
        </p>
      )}
    </div>
  );
}
