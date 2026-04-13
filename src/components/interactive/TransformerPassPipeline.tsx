import React, { useState, useMemo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

/* ─── Types ─── */

interface GraphNode {
  id: string;
  label: string;
  inputs: string[];
  x: number;
  y: number;
  highlight?: 'removed' | 'modified' | 'added';
  annotation?: string;
}

interface Stage {
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  nodes: GraphNode[];
  stats: {
    nodeCount: number;
    estimatedHBMAccess: string;
    estimatedFLOPs: string;
  };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── SVG Constants ─── */

const GRAPH_W = 700;
const GRAPH_H = 300;
const NODE_R = 28;
const STATS_H = 80;

/* ─── Data ─── */

const STAGES: Stage[] = [
  {
    title: { zh: '1. 原始图', en: '1. Original Graph' },
    description: {
      zh: 'Self-attention 的原始图表示：Q/K/V 三个独立 matmul，softmax，输出投影',
      en: 'Original self-attention graph: Q/K/V as separate matmuls, softmax, output projection',
    },
    nodes: [
      { id: 'x', label: 'x', inputs: [], x: 100, y: 50 },
      { id: 'wq', label: 'Wq', inputs: [], x: 50, y: 120 },
      { id: 'wk', label: 'Wk', inputs: [], x: 200, y: 120 },
      { id: 'wv', label: 'Wv', inputs: [], x: 350, y: 120 },
      { id: 'q', label: 'Q=x@Wq', inputs: ['x', 'wq'], x: 75, y: 190 },
      { id: 'k', label: 'K=x@Wk', inputs: ['x', 'wk'], x: 225, y: 190 },
      { id: 'v', label: 'V=x@Wv', inputs: ['x', 'wv'], x: 375, y: 190 },
      { id: 'sqrt', label: '√dk', inputs: [], x: 500, y: 190 },
      { id: 'qkt', label: 'Q@Kᵀ', inputs: ['q', 'k'], x: 150, y: 260 },
      { id: 'div', label: '÷√dk', inputs: ['qkt', 'sqrt'], x: 300, y: 260 },
      { id: 'sm', label: 'softmax', inputs: ['div'], x: 450, y: 260 },
      { id: 'attn', label: '@V', inputs: ['sm', 'v'], x: 300, y: 330 },
      { id: 'wo', label: 'Wo', inputs: [], x: 500, y: 330 },
      { id: 'out', label: '@Wo', inputs: ['attn', 'wo'], x: 400, y: 400 },
    ],
    stats: { nodeCount: 14, estimatedHBMAccess: '100%', estimatedFLOPs: '100%' },
  },
  {
    title: { zh: '2. 常量折叠', en: '2. Constant Folding' },
    description: {
      zh: '√dk 折叠为常量，div 转换为 mul（更快）',
      en: '√dk folded into constant, div converted to mul (faster)',
    },
    nodes: [
      { id: 'x', label: 'x', inputs: [], x: 100, y: 50 },
      { id: 'wq', label: 'Wq', inputs: [], x: 50, y: 120 },
      { id: 'wk', label: 'Wk', inputs: [], x: 200, y: 120 },
      { id: 'wv', label: 'Wv', inputs: [], x: 350, y: 120 },
      { id: 'q', label: 'Q=x@Wq', inputs: ['x', 'wq'], x: 75, y: 190 },
      { id: 'k', label: 'K=x@Wk', inputs: ['x', 'wk'], x: 225, y: 190 },
      { id: 'v', label: 'V=x@Wv', inputs: ['x', 'wv'], x: 375, y: 190 },
      { id: 'qkt', label: 'Q@Kᵀ', inputs: ['q', 'k'], x: 150, y: 260 },
      { id: 'scale', label: '×(1/√dk)', inputs: ['qkt'], x: 300, y: 260, highlight: 'modified' },
      { id: 'sm', label: 'softmax', inputs: ['scale'], x: 450, y: 260 },
      { id: 'attn', label: '@V', inputs: ['sm', 'v'], x: 300, y: 330 },
      { id: 'wo', label: 'Wo', inputs: [], x: 500, y: 330 },
      { id: 'out', label: '@Wo', inputs: ['attn', 'wo'], x: 400, y: 400 },
    ],
    stats: { nodeCount: 13, estimatedHBMAccess: '98%', estimatedFLOPs: '99%' },
  },
  {
    title: { zh: '3. QKV 投影融合', en: '3. QKV Projection Fusion' },
    description: {
      zh: '三个 matmul 合并为一个大的 QKV matmul + split',
      en: 'Three matmuls fused into one large QKV matmul + split',
    },
    nodes: [
      { id: 'x', label: 'x', inputs: [], x: 100, y: 50 },
      { id: 'wqkv', label: 'Wqkv', inputs: [], x: 250, y: 50, highlight: 'added' },
      { id: 'qkv', label: 'QKV=x@Wqkv', inputs: ['x', 'wqkv'], x: 175, y: 120, highlight: 'added' },
      { id: 'q', label: 'Q', inputs: ['qkv'], x: 75, y: 190, highlight: 'modified' },
      { id: 'k', label: 'K', inputs: ['qkv'], x: 225, y: 190, highlight: 'modified' },
      { id: 'v', label: 'V', inputs: ['qkv'], x: 375, y: 190, highlight: 'modified' },
      { id: 'qkt', label: 'Q@Kᵀ', inputs: ['q', 'k'], x: 150, y: 260 },
      { id: 'scale', label: '×(1/√dk)', inputs: ['qkt'], x: 300, y: 260 },
      { id: 'sm', label: 'softmax', inputs: ['scale'], x: 450, y: 260 },
      { id: 'attn', label: '@V', inputs: ['sm', 'v'], x: 300, y: 330 },
      { id: 'wo', label: 'Wo', inputs: [], x: 500, y: 330 },
      { id: 'out', label: '@Wo', inputs: ['attn', 'wo'], x: 400, y: 400 },
    ],
    stats: { nodeCount: 12, estimatedHBMAccess: '75%', estimatedFLOPs: '98%' },
  },
  {
    title: { zh: '4. Layout 优化', en: '4. Layout Optimization' },
    description: {
      zh: '添加 layout 注解 [B,H,S,D]（多头）和 [B,S,HD]（合并）',
      en: 'Add layout annotations [B,H,S,D] (multi-head) and [B,S,HD] (merged)',
    },
    nodes: [
      { id: 'x', label: 'x\n[B,S,HD]', inputs: [], x: 100, y: 50, annotation: '[B,S,HD]' },
      { id: 'wqkv', label: 'Wqkv', inputs: [], x: 250, y: 50 },
      { id: 'qkv', label: 'QKV\n[B,S,3HD]', inputs: ['x', 'wqkv'], x: 175, y: 120, annotation: '[B,S,3HD]' },
      { id: 'q', label: 'Q\n[B,H,S,D]', inputs: ['qkv'], x: 75, y: 190, annotation: '[B,H,S,D]', highlight: 'modified' },
      { id: 'k', label: 'K\n[B,H,S,D]', inputs: ['qkv'], x: 225, y: 190, annotation: '[B,H,S,D]', highlight: 'modified' },
      { id: 'v', label: 'V\n[B,H,S,D]', inputs: ['qkv'], x: 375, y: 190, annotation: '[B,H,S,D]', highlight: 'modified' },
      { id: 'qkt', label: 'scores\n[B,H,S,S]', inputs: ['q', 'k'], x: 150, y: 260, annotation: '[B,H,S,S]' },
      { id: 'scale', label: '×scale', inputs: ['qkt'], x: 300, y: 260 },
      { id: 'sm', label: 'softmax', inputs: ['scale'], x: 450, y: 260 },
      { id: 'attn', label: 'attn\n[B,H,S,D]', inputs: ['sm', 'v'], x: 300, y: 330, annotation: '[B,H,S,D]' },
      { id: 'wo', label: 'Wo', inputs: [], x: 500, y: 330 },
      { id: 'out', label: 'out\n[B,S,HD]', inputs: ['attn', 'wo'], x: 400, y: 400, annotation: '[B,S,HD]' },
    ],
    stats: { nodeCount: 12, estimatedHBMAccess: '75%', estimatedFLOPs: '98%' },
  },
  {
    title: { zh: '5. Memory Planning', en: '5. Memory Planning' },
    description: {
      zh: 'Buffer 复用优化，减少内存分配',
      en: 'Buffer reuse optimization, reduced memory allocation',
    },
    nodes: [
      { id: 'x', label: 'x[buf0]\n[B,S,HD]', inputs: [], x: 100, y: 50, annotation: '[buf0]' },
      { id: 'wqkv', label: 'Wqkv', inputs: [], x: 250, y: 50 },
      { id: 'qkv', label: 'QKV[buf1]\n[B,S,3HD]', inputs: ['x', 'wqkv'], x: 175, y: 120, annotation: '[buf1]' },
      { id: 'q', label: 'Q[buf1]\n[B,H,S,D]', inputs: ['qkv'], x: 75, y: 190, annotation: '[buf1]', highlight: 'modified' },
      { id: 'k', label: 'K[buf1]', inputs: ['qkv'], x: 225, y: 190, annotation: '[buf1]', highlight: 'modified' },
      { id: 'v', label: 'V[buf1]', inputs: ['qkv'], x: 375, y: 190, annotation: '[buf1]', highlight: 'modified' },
      { id: 'qkt', label: 'scores[buf2]', inputs: ['q', 'k'], x: 150, y: 260, annotation: '[buf2]' },
      { id: 'scale', label: '×scale[buf2]', inputs: ['qkt'], x: 300, y: 260, annotation: '[buf2]', highlight: 'modified' },
      { id: 'sm', label: 'softmax[buf2]', inputs: ['scale'], x: 450, y: 260, annotation: '[buf2]', highlight: 'modified' },
      { id: 'attn', label: 'attn[buf1]', inputs: ['sm', 'v'], x: 300, y: 330, annotation: '[buf1]', highlight: 'modified' },
      { id: 'wo', label: 'Wo', inputs: [], x: 500, y: 330 },
      { id: 'out', label: 'out[buf0]', inputs: ['attn', 'wo'], x: 400, y: 400, annotation: '[buf0]', highlight: 'modified' },
    ],
    stats: { nodeCount: 12, estimatedHBMAccess: '60%', estimatedFLOPs: '98%' },
  },
];

/* ─── Component ─── */

export default function TransformerPassPipeline({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Transformer Attention 优化 Pipeline',
      subtitle: '完整的 Pass Pipeline 演示',
      nodeCount: '节点数',
      hbmAccess: 'HBM 访问',
      flops: 'FLOPs',
      vsOriginal: '相对原始图',
    },
    en: {
      title: 'Transformer Attention Optimization Pipeline',
      subtitle: 'Complete Pass Pipeline Demo',
      nodeCount: 'Node Count',
      hbmAccess: 'HBM Access',
      flops: 'FLOPs',
      vsOriginal: 'vs Original',
    },
  }[locale]!;

  const steps = useMemo(() => {
    return STAGES.map((stage, idx) => ({
      title: stage.title[locale],
      content: (
        <div>
          <StageView stage={stage} isOriginal={idx === 0} locale={locale} t={t} />
        </div>
      ),
    }));
  }, [locale, t]);

  return (
    <div className="my-6">
      <div className="text-center mb-4">
        <div className="text-base font-bold text-gray-900">{t.title}</div>
        <div className="text-xs text-gray-600 mt-1">{t.subtitle}</div>
      </div>
      <StepNavigator steps={steps} locale={locale} />
    </div>
  );
}

/* ─── Stage View ─── */

interface StageViewProps {
  stage: Stage;
  isOriginal: boolean;
  locale: 'zh' | 'en';
  t: any;
}

function StageView({ stage, isOriginal, locale, t }: StageViewProps) {
  return (
    <div>
      {/* Description */}
      <div className="mb-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
        {stage.description[locale]}
      </div>

      {/* Graph */}
      <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H + STATS_H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Edges */}
        <defs>
          <marker id="arrow-gray" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} opacity={0.4} />
          </marker>
        </defs>

        {stage.nodes.map(node => {
          return node.inputs.map(inputId => {
            const inputNode = stage.nodes.find(n => n.id === inputId);
            if (!inputNode) return null;

            const dx = node.x - inputNode.x;
            const dy = node.y - inputNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const offsetRatio = NODE_R / dist;

            const x1 = inputNode.x + dx * offsetRatio;
            const y1 = inputNode.y + dy * offsetRatio;
            const x2 = node.x - dx * offsetRatio;
            const y2 = node.y - dy * offsetRatio;

            return (
              <line
                key={`${node.id}-${inputId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={COLORS.mid}
                strokeWidth={1}
                markerEnd="url(#arrow-gray)"
                opacity={0.3}
              />
            );
          });
        })}

        {/* Nodes */}
        {stage.nodes.map(node => {
          const highlightColor =
            node.highlight === 'added'
              ? COLORS.green
              : node.highlight === 'modified'
                ? COLORS.orange
                : node.highlight === 'removed'
                  ? COLORS.red
                  : COLORS.primary;

          const hasHighlight = !!node.highlight;

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_R}
                fill={highlightColor}
                fillOpacity={hasHighlight ? 0.2 : 0.1}
                stroke={highlightColor}
                strokeWidth={hasHighlight ? 2 : 1}
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="600"
                fill={COLORS.dark}
                style={{ fontFamily: FONTS.mono }}
              >
                {node.label.split('\n').map((line, i) => (
                  <tspan key={i} x={node.x} dy={i === 0 ? -4 : 10}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* Stats */}
        <g transform={`translate(0, ${GRAPH_H})`}>
          <rect x={0} y={0} width={GRAPH_W} height={STATS_H} fill={COLORS.bgAlt} />

          <text
            x={GRAPH_W / 2}
            y={20}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={COLORS.dark}
          >
            {isOriginal ? t.vsOriginal : `${t.vsOriginal} (Baseline)`}
          </text>

          {/* Node count */}
          <g transform="translate(50, 40)">
            <text x={0} y={0} fontSize="9" fill={COLORS.mid}>
              {t.nodeCount}:
            </text>
            <text x={120} y={0} fontSize="10" fontWeight="700" fill={COLORS.dark}>
              {stage.stats.nodeCount}
            </text>
          </g>

          {/* HBM access */}
          <g transform="translate(250, 40)">
            <text x={0} y={0} fontSize="9" fill={COLORS.mid}>
              {t.hbmAccess}:
            </text>
            <text
              x={120}
              y={0}
              fontSize="10"
              fontWeight="700"
              fill={stage.stats.estimatedHBMAccess === '100%' ? COLORS.mid : COLORS.green}
            >
              {stage.stats.estimatedHBMAccess}
            </text>
          </g>

          {/* FLOPs */}
          <g transform="translate(450, 40)">
            <text x={0} y={0} fontSize="9" fill={COLORS.mid}>
              {t.flops}:
            </text>
            <text
              x={120}
              y={0}
              fontSize="10"
              fontWeight="700"
              fill={stage.stats.estimatedFLOPs === '100%' ? COLORS.mid : COLORS.green}
            >
              {stage.stats.estimatedFLOPs}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
