import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface FusionType {
  id: string;
  name: { zh: string; en: string };
  category: 'simple' | 'complex';
  before: OpNode[];
  after: OpNode[];
  edges: { from: string; to: string }[];
  savings: number;
  description: { zh: string; en: string };
  detail: { zh: string; en: string };
}

interface OpNode {
  id: string;
  label: string;
  color: string;
  memReads?: number;
  memWrites?: number;
  isFused?: boolean;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const FUSION_TYPES: FusionType[] = [
  {
    id: 'elementwise',
    name: { zh: 'Element-wise 融合', en: 'Element-wise Fusion' },
    category: 'simple',
    before: [
      { id: 'x', label: 'x', color: COLORS.mid, memReads: 12, memWrites: 0 },
      { id: 'relu', label: 'ReLU', color: COLORS.primary, memReads: 12, memWrites: 12 },
      { id: 'mul', label: '×', color: COLORS.primary, memReads: 12, memWrites: 12 },
      { id: 'add', label: '+', color: COLORS.primary, memReads: 12, memWrites: 12 },
      { id: 'out', label: 'output', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    after: [
      { id: 'x', label: 'x', color: COLORS.mid, memReads: 12, memWrites: 0 },
      { id: 'fused', label: 'ReLU+×+add', color: COLORS.green, memReads: 12, memWrites: 12, isFused: true },
      { id: 'out', label: 'output', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    edges: [
      { from: 'x', to: 'relu' },
      { from: 'relu', to: 'mul' },
      { from: 'mul', to: 'add' },
      { from: 'add', to: 'out' },
    ],
    savings: 67,
    description: {
      zh: '逐元素算子链，消除中间缓冲区',
      en: 'Element-wise operator chain, eliminate intermediate buffers'
    },
    detail: {
      zh: '融合前：3 次内核启动，12+12 MB HBM 读写 × 3。融合后：1 次启动，4+4 MB。节省 67% 内存流量。',
      en: 'Before: 3 kernel launches, 12+12 MB HBM R/W × 3. After: 1 launch, 4+4 MB. 67% memory saved.'
    }
  },
  {
    id: 'reduction',
    name: { zh: 'Reduction 融合', en: 'Reduction Fusion' },
    category: 'simple',
    before: [
      { id: 'x', label: 'x', color: COLORS.mid, memReads: 12, memWrites: 0 },
      { id: 'sq', label: 'x²', color: COLORS.primary, memReads: 12, memWrites: 12 },
      { id: 'sum', label: 'sum', color: COLORS.primary, memReads: 12, memWrites: 4 },
      { id: 'sqrt', label: '√', color: COLORS.primary, memReads: 4, memWrites: 4 },
      { id: 'out', label: 'norm', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    after: [
      { id: 'x', label: 'x', color: COLORS.mid, memReads: 12, memWrites: 0 },
      { id: 'fused', label: 'L2-norm', color: COLORS.green, memReads: 12, memWrites: 4, isFused: true },
      { id: 'out', label: 'norm', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    edges: [
      { from: 'x', to: 'sq' },
      { from: 'sq', to: 'sum' },
      { from: 'sum', to: 'sqrt' },
      { from: 'sqrt', to: 'out' },
    ],
    savings: 67,
    description: {
      zh: 'Reduction 算子链，避免中间 materialize',
      en: 'Reduction chain, avoid intermediate materialization'
    },
    detail: {
      zh: '融合前：3 次启动，x²需 materialize 12 MB 中间结果。融合后：单趟扫描计算 L2 范数，只写出标量。',
      en: 'Before: 3 launches, x² materializes 12 MB. After: single-pass L2 norm, scalar output only.'
    }
  },
  {
    id: 'broadcast',
    name: { zh: 'Broadcast 融合', en: 'Broadcast Fusion' },
    category: 'simple',
    before: [
      { id: 'x', label: 'x', color: COLORS.mid, memReads: 12, memWrites: 0 },
      { id: 'mean', label: 'reduce_mean', color: COLORS.primary, memReads: 12, memWrites: 4 },
      { id: 'bc', label: 'broadcast', color: COLORS.primary, memReads: 4, memWrites: 12 },
      { id: 'sub', label: 'subtract', color: COLORS.primary, memReads: 24, memWrites: 12 },
      { id: 'out', label: 'centered', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    after: [
      { id: 'x', label: 'x', color: COLORS.mid, memReads: 12, memWrites: 0 },
      { id: 'fused', label: 'center', color: COLORS.green, memReads: 12, memWrites: 12, isFused: true },
      { id: 'out', label: 'centered', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    edges: [
      { from: 'x', to: 'mean' },
      { from: 'mean', to: 'bc' },
      { from: 'bc', to: 'sub' },
      { from: 'x', to: 'sub' },
      { from: 'sub', to: 'out' },
    ],
    savings: 65,
    description: {
      zh: 'Reduce + Broadcast 模式，LayerNorm 核心',
      en: 'Reduce + Broadcast pattern, LayerNorm core'
    },
    detail: {
      zh: '融合前：broadcast 产生 12 MB 临时张量。融合后：on-the-fly 广播，每个 thread 计算本地均值。',
      en: 'Before: broadcast creates 12 MB temp. After: on-the-fly broadcast, each thread computes local mean.'
    }
  },
  {
    id: 'reshape',
    name: { zh: 'Transpose/Reshape 消除', en: 'Transpose/Reshape Elimination' },
    category: 'simple',
    before: [
      { id: 'x', label: 'x', color: COLORS.mid, memReads: 12, memWrites: 0 },
      { id: 'trans', label: 'transpose', color: COLORS.primary, memReads: 12, memWrites: 12 },
      { id: 'reshape', label: 'reshape', color: COLORS.primary, memReads: 12, memWrites: 12 },
      { id: 'mm', label: 'matmul', color: COLORS.primary, memReads: 24, memWrites: 12 },
      { id: 'out', label: 'output', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    after: [
      { id: 'x', label: 'x', color: COLORS.mid, memReads: 12, memWrites: 0 },
      { id: 'fused', label: 'matmul (stride)', color: COLORS.green, memReads: 12, memWrites: 12, isFused: true },
      { id: 'out', label: 'output', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    edges: [
      { from: 'x', to: 'trans' },
      { from: 'trans', to: 'reshape' },
      { from: 'reshape', to: 'mm' },
      { from: 'mm', to: 'out' },
    ],
    savings: 71,
    description: {
      zh: 'Layout 变换通过 stride 吸收',
      en: 'Layout changes absorbed via stride manipulation'
    },
    detail: {
      zh: '融合前：transpose/reshape 需物化中间结果。融合后：matmul 直接读取非连续内存，通过 stride 描述。',
      en: 'Before: transpose/reshape materialize intermediate. After: matmul reads non-contiguous memory via stride.'
    }
  },
  {
    id: 'flash',
    name: { zh: 'FlashAttention（算法改写）', en: 'FlashAttention (Algorithmic Rewrite)' },
    category: 'complex',
    before: [
      { id: 'q', label: 'Q', color: COLORS.mid, memReads: 8, memWrites: 0 },
      { id: 'k', label: 'K', color: COLORS.mid, memReads: 8, memWrites: 0 },
      { id: 'mm1', label: 'Q×Kᵀ', color: COLORS.purple, memReads: 16, memWrites: 32 },
      { id: 'sm', label: 'softmax', color: COLORS.purple, memReads: 32, memWrites: 32 },
      { id: 'v', label: 'V', color: COLORS.mid, memReads: 8, memWrites: 0 },
      { id: 'mm2', label: 'attn×V', color: COLORS.purple, memReads: 40, memWrites: 8 },
      { id: 'out', label: 'output', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    after: [
      { id: 'qkv', label: 'Q/K/V', color: COLORS.mid, memReads: 24, memWrites: 0 },
      { id: 'fused', label: 'FlashAttention', color: COLORS.purple, memReads: 24, memWrites: 8, isFused: true },
      { id: 'out', label: 'output', color: COLORS.mid, memReads: 0, memWrites: 0 },
    ],
    edges: [
      { from: 'q', to: 'mm1' },
      { from: 'k', to: 'mm1' },
      { from: 'mm1', to: 'sm' },
      { from: 'sm', to: 'mm2' },
      { from: 'v', to: 'mm2' },
      { from: 'mm2', to: 'out' },
    ],
    savings: 75,
    description: {
      zh: 'Tiling + online softmax，消除 N² attention matrix',
      en: 'Tiling + online softmax, eliminate N² attention matrix'
    },
    detail: {
      zh: 'N=4096, FP16: Q×Kᵀ = 32MB。FlashAttention 通过 tiling 和增量 softmax，I/O 从 O(N²) 降到 O(N²d²/M)。',
      en: 'N=4096, FP16: Q×Kᵀ = 32MB. FlashAttention uses tiling + incremental softmax, I/O reduced from O(N²) to O(N²d²/M).'
    }
  },
];

/* ─── SVG Constants ─── */

const W = 800;
const H = 600;
const LEFT_PANEL_W = 200;
const LEFT_PAD = 10;
const RIGHT_PAD = 10;
const GRAPH_LEFT = LEFT_PANEL_W + 20;
const GRAPH_W = (W - GRAPH_LEFT - RIGHT_PAD - 30) / 2;
const NODE_R = 28;
const NODE_GAP_Y = 70;

/* ─── Component ─── */

export default function FusionTaxonomy({ locale = 'zh' }: Props) {
  const [selectedType, setSelectedType] = useState<string>('elementwise');

  const t = {
    zh: {
      title: '算子融合类型学',
      simple: '简单融合',
      complex: '复杂融合',
      before: '融合前',
      after: '融合后',
      memReads: '读',
      memWrites: '写',
      savings: '节省',
      mb: 'MB',
    },
    en: {
      title: 'Operator Fusion Taxonomy',
      simple: 'Simple Fusion',
      complex: 'Complex Fusion',
      before: 'Before',
      after: 'After',
      memReads: 'R',
      memWrites: 'W',
      savings: 'Savings',
      mb: 'MB',
    },
  }[locale]!;

  const selected = FUSION_TYPES.find(f => f.id === selectedType)!;
  const categoryColor = selected.category === 'simple' ? COLORS.primary : COLORS.purple;

  function renderGraph(nodes: OpNode[], edges: { from: string; to: string }[], offsetX: number) {
    const nodeMap = new Map(nodes.map((n, i) => [n.id, { ...n, y: 80 + i * NODE_GAP_Y }]));

    return (
      <g>
        {/* Edges */}
        {edges.map((e, i) => {
          const from = nodeMap.get(e.from);
          const to = nodeMap.get(e.to);
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={offsetX}
              y1={from.y}
              x2={offsetX}
              y2={to.y - NODE_R - 8}
              stroke={COLORS.light}
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* Nodes */}
        {Array.from(nodeMap.values()).map((node) => {
          const showBadges = node.memReads !== undefined || node.memWrites !== undefined;
          return (
            <g key={node.id}>
              <circle
                cx={offsetX}
                cy={node.y}
                r={NODE_R}
                fill={node.isFused ? COLORS.valid : COLORS.bgAlt}
                stroke={node.color}
                strokeWidth={node.isFused ? 2.5 : 2}
              />
              <text
                x={offsetX}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight={node.isFused ? '700' : '600'}
                fill={node.color}
                style={{ fontFamily: FONTS.mono }}
              >
                {node.label}
              </text>

              {/* Memory badges */}
              {showBadges && (
                <g>
                  {node.memReads !== undefined && node.memReads > 0 && (
                    <g transform={`translate(${offsetX - NODE_R - 18}, ${node.y - 6})`}>
                      <rect x={0} y={0} width={32} height={12} rx={6} fill={COLORS.primary} fillOpacity={0.15} />
                      <text x={16} y={6} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="600" fill={COLORS.primary}>
                        {t.memReads} {node.memReads}
                      </text>
                    </g>
                  )}
                  {node.memWrites !== undefined && node.memWrites > 0 && (
                    <g transform={`translate(${offsetX + NODE_R - 14}, ${node.y - 6})`}>
                      <rect x={0} y={0} width={32} height={12} rx={6} fill={COLORS.orange} fillOpacity={0.15} />
                      <text x={16} y={6} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="600" fill={COLORS.orange}>
                        {t.memWrites} {node.memWrites}
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  const totalMemBefore = selected.before.reduce((sum, n) => sum + (n.memReads || 0) + (n.memWrites || 0), 0);
  const totalMemAfter = selected.after.reduce((sum, n) => sum + (n.memReads || 0) + (n.memWrites || 0), 0);

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,1 L7,4 L0,7" fill={COLORS.light} />
          </marker>
        </defs>

        {/* Title */}
        <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Left panel: category list */}
        <g>
          {/* Simple fusion */}
          <text x={LEFT_PAD + 8} y={50} fontSize="10" fontWeight="700" fill={COLORS.primary}>
            {t.simple}
          </text>
          {FUSION_TYPES.filter(f => f.category === 'simple').map((f, i) => {
            const isSelected = f.id === selectedType;
            return (
              <g
                key={f.id}
                onClick={() => setSelectedType(f.id)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={LEFT_PAD}
                  y={60 + i * 32}
                  width={LEFT_PANEL_W - 20}
                  height={28}
                  rx={4}
                  fill={isSelected ? COLORS.valid : COLORS.bgAlt}
                  stroke={isSelected ? COLORS.primary : COLORS.light}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={LEFT_PAD + 10}
                  y={74 + i * 32}
                  fontSize="10"
                  fontWeight={isSelected ? '700' : '500'}
                  fill={isSelected ? COLORS.primary : COLORS.dark}
                >
                  {f.name[locale]}
                </text>
              </g>
            );
          })}

          {/* Complex fusion */}
          <text x={LEFT_PAD + 8} y={230} fontSize="10" fontWeight="700" fill={COLORS.purple}>
            {t.complex}
          </text>
          {FUSION_TYPES.filter(f => f.category === 'complex').map((f, i) => {
            const isSelected = f.id === selectedType;
            return (
              <g
                key={f.id}
                onClick={() => setSelectedType(f.id)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={LEFT_PAD}
                  y={240 + i * 32}
                  width={LEFT_PANEL_W - 20}
                  height={28}
                  rx={4}
                  fill={isSelected ? '#f3e5f5' : COLORS.bgAlt}
                  stroke={isSelected ? COLORS.purple : COLORS.light}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={LEFT_PAD + 10}
                  y={254 + i * 32}
                  fontSize="10"
                  fontWeight={isSelected ? '700' : '500'}
                  fill={isSelected ? COLORS.purple : COLORS.dark}
                >
                  {f.name[locale]}
                </text>
              </g>
            );
          })}
        </g>

        {/* Right panels: before/after graphs */}
        <g>
          {/* Before label */}
          <text x={GRAPH_LEFT + GRAPH_W / 2} y={50} textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.red}>
            {t.before}
          </text>
          {renderGraph(selected.before, selected.edges, GRAPH_LEFT + GRAPH_W / 2)}

          {/* After label */}
          <text x={GRAPH_LEFT + GRAPH_W + 30 + GRAPH_W / 2} y={50} textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.green}>
            {t.after}
          </text>
          {renderGraph(selected.after, selected.edges.filter(e =>
            selected.after.some(n => n.id === e.from) && selected.after.some(n => n.id === e.to)
          ), GRAPH_LEFT + GRAPH_W + 30 + GRAPH_W / 2)}

          {/* Fusion arrow */}
          <motion.g
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <defs>
              <marker id="fusion-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <path d="M0,1 L9,4 L0,7" fill={categoryColor} />
              </marker>
            </defs>
            <line
              x1={GRAPH_LEFT + GRAPH_W + 8}
              y1={H / 2}
              x2={GRAPH_LEFT + GRAPH_W + 22}
              y2={H / 2}
              stroke={categoryColor}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              markerEnd="url(#fusion-arrow)"
            />
          </motion.g>
        </g>

        {/* Description */}
        <g>
          <rect
            x={GRAPH_LEFT}
            y={H - 120}
            width={W - GRAPH_LEFT - RIGHT_PAD}
            height={100}
            rx={6}
            fill={COLORS.bgAlt}
            stroke={categoryColor}
            strokeWidth={1.5}
          />
          <text
            x={GRAPH_LEFT + 12}
            y={H - 100}
            fontSize="10"
            fontWeight="700"
            fill={categoryColor}
          >
            {selected.name[locale]}
          </text>
          <text
            x={GRAPH_LEFT + 12}
            y={H - 84}
            fontSize="9"
            fill={COLORS.dark}
          >
            {selected.description[locale]}
          </text>
          <text
            x={GRAPH_LEFT + 12}
            y={H - 66}
            fontSize="8.5"
            fill={COLORS.mid}
            style={{ fontFamily: FONTS.mono }}
          >
            {selected.detail[locale]}
          </text>

          {/* Savings bar */}
          <rect
            x={GRAPH_LEFT + 12}
            y={H - 48}
            width={W - GRAPH_LEFT - RIGHT_PAD - 24}
            height={16}
            rx={8}
            fill={COLORS.light}
          />
          <motion.rect
            x={GRAPH_LEFT + 12}
            y={H - 48}
            width={(W - GRAPH_LEFT - RIGHT_PAD - 24) * (selected.savings / 100)}
            height={16}
            rx={8}
            fill={COLORS.green}
            initial={{ width: 0 }}
            animate={{ width: (W - GRAPH_LEFT - RIGHT_PAD - 24) * (selected.savings / 100) }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <text
            x={GRAPH_LEFT + (W - GRAPH_LEFT - RIGHT_PAD) / 2}
            y={H - 40}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={COLORS.green}
          >
            {t.savings}: {selected.savings}% ({totalMemBefore} → {totalMemAfter} {t.mb})
          </text>
        </g>
      </svg>
    </div>
  );
}
