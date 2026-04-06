import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface TreeNode {
  id: string;
  tokens: string;
  children: TreeNode[];
  kvBlocks: number;
  refCount: number;
}

function getScenarios(locale: 'zh' | 'en'): { label: string; tree: TreeNode }[] {
  if (locale === 'zh') {
    return [
      {
        label: '单轮对话',
        tree: {
          id: 'root', tokens: '[SYS] You are helpful...', children: [
            { id: 'q1', tokens: '[USER] 什么是 PagedAttention？', children: [
              { id: 'a1', tokens: '[ASST] PagedAttention 是...', children: [], kvBlocks: 3, refCount: 0 },
            ], kvBlocks: 2, refCount: 1 },
          ], kvBlocks: 4, refCount: 1,
        },
      },
      {
        label: '多轮对话',
        tree: {
          id: 'root', tokens: '[SYS] You are helpful...', children: [
            { id: 'q1', tokens: '[USER] 什么是 PA？', children: [
              { id: 'a1', tokens: '[ASST] PA 是...', children: [
                { id: 'q2', tokens: '[USER] 和虚拟内存？', children: [
                  { id: 'a2', tokens: '[ASST] 类比...', children: [], kvBlocks: 2, refCount: 0 },
                ], kvBlocks: 2, refCount: 1 },
              ], kvBlocks: 2, refCount: 1 },
            ], kvBlocks: 2, refCount: 1 },
          ], kvBlocks: 4, refCount: 1,
        },
      },
      {
        label: '分支共享 (few-shot)',
        tree: {
          id: 'root', tokens: '[SYS] You are helpful...', children: [
            { id: 'fs', tokens: '[FEW-SHOT] examples...', children: [
              { id: 'u1', tokens: '[USER] 问题 A', children: [
                { id: 'a1', tokens: '[ASST] 回答 A', children: [], kvBlocks: 2, refCount: 0 },
              ], kvBlocks: 1, refCount: 1 },
              { id: 'u2', tokens: '[USER] 问题 B', children: [
                { id: 'a2', tokens: '[ASST] 回答 B', children: [], kvBlocks: 2, refCount: 0 },
              ], kvBlocks: 1, refCount: 1 },
              { id: 'u3', tokens: '[USER] 问题 C', children: [
                { id: 'a3', tokens: '[ASST] 回答 C', children: [], kvBlocks: 2, refCount: 0 },
              ], kvBlocks: 1, refCount: 1 },
            ], kvBlocks: 6, refCount: 3 },
          ], kvBlocks: 4, refCount: 1,
        },
      },
    ];
  } else {
    return [
      {
        label: 'Single Turn',
        tree: {
          id: 'root', tokens: '[SYS] You are helpful...', children: [
            { id: 'q1', tokens: '[USER] What is PagedAttention?', children: [
              { id: 'a1', tokens: '[ASST] PagedAttention is...', children: [], kvBlocks: 3, refCount: 0 },
            ], kvBlocks: 2, refCount: 1 },
          ], kvBlocks: 4, refCount: 1,
        },
      },
      {
        label: 'Multi-turn',
        tree: {
          id: 'root', tokens: '[SYS] You are helpful...', children: [
            { id: 'q1', tokens: '[USER] What is PA?', children: [
              { id: 'a1', tokens: '[ASST] PA is...', children: [
                { id: 'q2', tokens: '[USER] vs virtual memory?', children: [
                  { id: 'a2', tokens: '[ASST] Analogy...', children: [], kvBlocks: 2, refCount: 0 },
                ], kvBlocks: 2, refCount: 1 },
              ], kvBlocks: 2, refCount: 1 },
            ], kvBlocks: 2, refCount: 1 },
          ], kvBlocks: 4, refCount: 1,
        },
      },
      {
        label: 'Branch Sharing (few-shot)',
        tree: {
          id: 'root', tokens: '[SYS] You are helpful...', children: [
            { id: 'fs', tokens: '[FEW-SHOT] examples...', children: [
              { id: 'u1', tokens: '[USER] Question A', children: [
                { id: 'a1', tokens: '[ASST] Answer A', children: [], kvBlocks: 2, refCount: 0 },
              ], kvBlocks: 1, refCount: 1 },
              { id: 'u2', tokens: '[USER] Question B', children: [
                { id: 'a2', tokens: '[ASST] Answer B', children: [], kvBlocks: 2, refCount: 0 },
              ], kvBlocks: 1, refCount: 1 },
              { id: 'u3', tokens: '[USER] Question C', children: [
                { id: 'a3', tokens: '[ASST] Answer C', children: [], kvBlocks: 2, refCount: 0 },
              ], kvBlocks: 1, refCount: 1 },
            ], kvBlocks: 6, refCount: 3 },
          ], kvBlocks: 4, refCount: 1,
        },
      },
    ];
  }
}

function layoutTree(node: TreeNode, x: number, y: number, width: number): { id: string; x: number; y: number; node: TreeNode; children: { parentX: number; parentY: number; childX: number; childY: number }[] }[] {
  const result: any[] = [];
  const nodeH = 50;
  const gapY = 70;

  result.push({ id: node.id, x, y, node, children: [] });

  const childCount = node.children.length;
  if (childCount > 0) {
    const childWidth = width / childCount;
    node.children.forEach((child, i) => {
      const cx = x - width / 2 + childWidth * i + childWidth / 2;
      const cy = y + gapY;
      result[0].children.push({ parentX: x, parentY: y + nodeH / 2, childX: cx, childY: cy - nodeH / 2 + 5 });
      result.push(...layoutTree(child, cx, cy, childWidth));
    });
  }
  return result;
}

export default function RadixTreeViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      sharedNode: '共享前缀节点 (ref > 1)',
      exclusiveNode: '独占节点',
      sharedTooltip: '共享节点 — 多个序列复用',
      leafTooltip: '叶节点 — 独占',
    },
    en: {
      sharedNode: 'Shared prefix node (ref > 1)',
      exclusiveNode: 'Exclusive node',
      sharedTooltip: 'Shared node — reused by multiple sequences',
      leafTooltip: 'Leaf node — exclusive',
    },
  }[locale];

  const SCENARIOS = getScenarios(locale);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const scenario = SCENARIOS[scenarioIdx];

  const nodes = layoutTree(scenario.tree, W / 2, 50, W - 60);
  const allEdges = nodes.flatMap(n => n.children);

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setScenarioIdx(i); setHoveredNode(null); }}
            style={{
              padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === scenarioIdx ? COLORS.primary : COLORS.light,
              color: i === scenarioIdx ? '#fff' : COLORS.dark,
              fontSize: 13, fontFamily: FONTS.sans,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* Edges */}
        {allEdges.map((e, i) => (
          <line key={i} x1={e.parentX} y1={e.parentY} x2={e.childX} y2={e.childY}
            stroke={COLORS.mid} strokeWidth={1.5} opacity={0.4} />
        ))}

        {/* Nodes */}
        {nodes.map((n) => {
          const isHovered = hoveredNode === n.id;
          const isShared = n.node.refCount > 1;
          const nodeW = 140;
          const nodeH = 50;
          return (
            <g key={n.id}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={n.x - nodeW / 2} y={n.y - nodeH / 2}
                width={nodeW} height={nodeH} rx={6}
                fill={isHovered ? COLORS.highlight : isShared ? '#ecfdf5' : COLORS.valid}
                stroke={isShared ? COLORS.green : COLORS.primary}
                strokeWidth={isHovered ? 2 : 1}
              />
              <text x={n.x} y={n.y - 5} fontSize={10} fill={COLORS.dark}
                fontFamily={FONTS.mono} textAnchor="middle">
                {n.node.tokens.length > 20 ? n.node.tokens.slice(0, 20) + '...' : n.node.tokens}
              </text>
              <text x={n.x} y={n.y + 12} fontSize={10} fill={COLORS.mid}
                fontFamily={FONTS.sans} textAnchor="middle">
                {n.node.kvBlocks} KV blocks | ref={n.node.refCount}
              </text>
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredNode && (() => {
          const n = nodes.find(nd => nd.id === hoveredNode);
          if (!n) return null;
          const tipW = 200;
          const tipH = 60;
          const tipX = Math.min(n.x + 80, W - tipW - 10);
          const tipY = Math.max(n.y - 30, 10);
          return (
            <g>
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={6}
                fill={COLORS.dark} opacity={0.95} />
              <text x={tipX + 10} y={tipY + 18} fontSize={11} fill="#fff" fontFamily={FONTS.mono}>
                {n.node.tokens}
              </text>
              <text x={tipX + 10} y={tipY + 35} fontSize={11} fill={COLORS.light} fontFamily={FONTS.sans}>
                KV Blocks: {n.node.kvBlocks} | Refs: {n.node.refCount}
              </text>
              <text x={tipX + 10} y={tipY + 50} fontSize={11}
                fill={n.node.refCount > 1 ? '#4ade80' : COLORS.light} fontFamily={FONTS.sans}>
                {n.node.refCount > 1 ? t.sharedTooltip : t.leafTooltip}
              </text>
            </g>
          );
        })()}

        {/* Legend */}
        <g transform={`translate(10, ${H - 35})`}>
          <rect width={12} height={12} rx={2} fill="#ecfdf5" stroke={COLORS.green} strokeWidth={1} />
          <text x={18} y={10} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>{t.sharedNode}</text>
          <rect x={170} width={12} height={12} rx={2} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={188} y={10} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>{t.exclusiveNode}</text>
        </g>
      </svg>
    </div>
  );
}
