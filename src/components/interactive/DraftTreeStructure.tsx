// src/components/interactive/DraftTreeStructure.tsx
// Interactive: Draft tree visualization with accept/reject states
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface TreeNode {
  id: string;
  token: string;
  prob: number;
  children: TreeNode[];
  status: 'accepted' | 'rejected' | 'pending';
}

const DRAFT_TREE: TreeNode = {
  id: 'root', token: 'The', prob: 1.0, status: 'accepted',
  children: [
    {
      id: 'c1', token: 'cat', prob: 0.7, status: 'accepted',
      children: [
        {
          id: 'c1a', token: 'sat', prob: 0.8, status: 'accepted',
          children: [
            { id: 'c1a1', token: 'on', prob: 0.9, status: 'accepted', children: [] },
            { id: 'c1a2', token: 'down', prob: 0.1, status: 'rejected', children: [] },
          ],
        },
        {
          id: 'c1b', token: 'is', prob: 0.2, status: 'rejected',
          children: [
            { id: 'c1b1', token: 'here', prob: 0.5, status: 'pending', children: [] },
          ],
        },
      ],
    },
    {
      id: 'c2', token: 'dog', prob: 0.3, status: 'rejected',
      children: [
        {
          id: 'c2a', token: 'ran', prob: 0.6, status: 'pending',
          children: [],
        },
      ],
    },
  ],
};

const CHAIN: { token: string; status: 'accepted' | 'rejected' | 'pending' }[] = [
  { token: 'The', status: 'accepted' },
  { token: 'cat', status: 'accepted' },
  { token: 'sat', status: 'accepted' },
  { token: 'on', status: 'accepted' },
  { token: 'the', status: 'rejected' },
  { token: 'mat', status: 'pending' },
  { token: 'today', status: 'pending' },
];

const STATUS_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  accepted: { fill: '#dcfce7', stroke: COLORS.green, text: COLORS.green },
  rejected: { fill: '#fee2e2', stroke: COLORS.red, text: COLORS.red },
  pending: { fill: '#f1f5f9', stroke: '#94a3b8', text: '#64748b' },
};

function flattenTree(node: TreeNode, x: number, y: number, xSpan: number, depth: number): {
  nodes: { id: string; token: string; prob: number; status: string; x: number; y: number }[];
  edges: { x1: number; y1: number; x2: number; y2: number }[];
} {
  const nodes: { id: string; token: string; prob: number; status: string; x: number; y: number }[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];

  nodes.push({ id: node.id, token: node.token, prob: node.prob, status: node.status, x, y });

  const childCount = node.children.length;
  if (childCount === 0) return { nodes, edges };

  const childSpan = xSpan / childCount;
  const startX = x - xSpan / 2 + childSpan / 2;
  const childY = y + 60;

  node.children.forEach((child, i) => {
    const childX = startX + i * childSpan;
    edges.push({ x1: x, y1: y + 16, x2: childX, y2: childY - 16 });
    const sub = flattenTree(child, childX, childY, childSpan * 0.9, depth + 1);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  });

  return { nodes, edges };
}

export default function DraftTreeStructure({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [mode, setMode] = useState<'tree' | 'chain'>('tree');

  const t = {
    zh: {
      treeMode: 'Tree Structure',
      chainMode: 'Chain (Sequential)',
      treeTitle: 'Tree-based Draft (Token Budget = {budget})',
      chainTitle: 'Chain-based Draft (Token Budget = {budget})',
      accepted: 'Accepted',
      rejected: 'Rejected',
      pruned: 'Pruned (not verified)',
      tokensVerified: '{count} tokens verified',
      acceptedCount: '{count} accepted ({percent}%)',
      chainProblem: 'Chain 的问题: 一旦 reject，后续全部作废',
      chainWaste: '{budget} tokens 中只有 {accepted} 个被接受 — 第 {next} 个 reject 后剩余 {wasted} 个浪费',
      comparisonTitle: 'Tree vs Chain: 同样的 Token Budget',
      treeBenefit: 'Tree: 多条候选路径并行验证 → reject 只影响单条分支，其他路径不受影响',
      chainLimit: 'Chain: 单一序列 → 一处 reject 后所有后续 token 作废，budget 利用率低',
    },
    en: {
      treeMode: 'Tree Structure',
      chainMode: 'Chain (Sequential)',
      treeTitle: 'Tree-based Draft (Token Budget = {budget})',
      chainTitle: 'Chain-based Draft (Token Budget = {budget})',
      accepted: 'Accepted',
      rejected: 'Rejected',
      pruned: 'Pruned (not verified)',
      tokensVerified: '{count} tokens verified',
      acceptedCount: '{count} accepted ({percent}%)',
      chainProblem: 'Chain problem: once rejected, all following tokens are wasted',
      chainWaste: 'Only {accepted} of {budget} tokens accepted — after #{next} rejection, remaining {wasted} tokens wasted',
      comparisonTitle: 'Tree vs Chain: Same Token Budget',
      treeBenefit: 'Tree: parallel verification of multiple paths → rejection only affects single branch, others unaffected',
      chainLimit: 'Chain: single sequence → one rejection discards all subsequent tokens, low budget utilization',
    },
  }[locale];

  const { nodes, edges } = flattenTree(DRAFT_TREE, 200, 60, 340, 0);

  // Count accepted in each mode
  const treeAccepted = nodes.filter(n => n.status === 'accepted').length;
  const chainAccepted = CHAIN.filter(c => c.status === 'accepted').length;
  const treeBudget = nodes.length;
  const chainBudget = CHAIN.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden p-4">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-3 justify-center">
        {(['tree', 'chain'] as const).map(m => (
          <button key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === m
                ? 'bg-blue-100 text-blue-800 font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {m === 'tree' ? t.treeMode : t.chainMode}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label="Draft tree vs chain comparison">

        {mode === 'tree' ? (
          <g>
            <text x={200} y={25} textAnchor="middle" fontSize="11" fontWeight="700"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.treeTitle.replace('{budget}', String(treeBudget))}
            </text>

            {/* Edges */}
            {edges.map((e, i) => (
              <line key={`e-${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="#cbd5e1" strokeWidth={1.5} />
            ))}

            {/* Nodes */}
            {nodes.map(n => {
              const sc = STATUS_COLORS[n.status];
              return (
                <g key={n.id}>
                  <rect x={n.x - 28} y={n.y - 14} width={56} height={28} rx={6}
                    fill={sc.fill} stroke={sc.stroke} strokeWidth={1.5} />
                  <text x={n.x} y={n.y - 1} textAnchor="middle" fontSize="9" fontWeight="600"
                    fill={sc.text} fontFamily={FONTS.sans}>
                    {n.token}
                  </text>
                  <text x={n.x} y={n.y + 10} textAnchor="middle" fontSize="7"
                    fill="#94a3b8" fontFamily={FONTS.mono}>
                    p={n.prob.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            {[
              { label: 'Accepted', status: 'accepted' },
              { label: 'Rejected', status: 'rejected' },
              { label: 'Pruned (not verified)', status: 'pending' },
            ].map((item, i) => {
              const sc = STATUS_COLORS[item.status];
              const lx = 420;
              const ly = 60 + i * 24;
              return (
                <g key={item.status}>
                  <rect x={lx} y={ly - 8} width={16} height={16} rx={3}
                    fill={sc.fill} stroke={sc.stroke} strokeWidth={1} />
                  <text x={lx + 22} y={ly + 3} fontSize="8" fill={COLORS.dark}
                    fontFamily={FONTS.sans}>{item.label}</text>
                </g>
              );
            })}

            {/* Stats */}
            <rect x={400} y={140} width={160} height={50} rx={5}
              fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
            <text x={480} y={158} textAnchor="middle" fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {treeBudget} tokens verified
            </text>
            <text x={480} y={174} textAnchor="middle" fontSize="8"
              fill={COLORS.green} fontFamily={FONTS.sans}>
              {treeAccepted} accepted ({(treeAccepted / treeBudget * 100).toFixed(0)}%)
            </text>
          </g>
        ) : (
          <g>
            <text x={W / 2} y={25} textAnchor="middle" fontSize="11" fontWeight="700"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              Chain-based Draft (Token Budget = {chainBudget})
            </text>

            {/* Chain nodes */}
            {CHAIN.map((c, i) => {
              const x = 60 + i * 68;
              const y = 80;
              const sc = STATUS_COLORS[c.status];
              return (
                <g key={i}>
                  {i > 0 && (
                    <line x1={x - 40} y1={y} x2={x - 28} y2={y}
                      stroke="#cbd5e1" strokeWidth={1.5} />
                  )}
                  <rect x={x - 26} y={y - 14} width={52} height={28} rx={6}
                    fill={sc.fill} stroke={sc.stroke} strokeWidth={1.5} />
                  <text x={x} y={y + 3} textAnchor="middle" fontSize="9" fontWeight="600"
                    fill={sc.text} fontFamily={FONTS.sans}>
                    {c.token}
                  </text>
                </g>
              );
            })}

            {/* Explanation */}
            <rect x={40} y={130} width={500} height={50} rx={5}
              fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
            <text x={W / 2} y={150} textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.red} fontFamily={FONTS.sans}>
              Chain 的问题: 一旦 reject，后续全部作废
            </text>
            <text x={W / 2} y={166} textAnchor="middle" fontSize="8"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {chainBudget} tokens 中只有 {chainAccepted} 个被接受 — 第 {chainAccepted + 1} 个 reject 后剩余 {chainBudget - chainAccepted - 1} 个浪费
            </text>
          </g>
        )}

        {/* Comparison insight */}
        <rect x={40} y={H - 80} width={500} height={65} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={W / 2} y={H - 58} textAnchor="middle" fontSize="9" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          Tree vs Chain: 同样的 Token Budget
        </text>
        <text x={W / 2} y={H - 42} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Tree: 多条候选路径并行验证 → reject 只影响单条分支，其他路径不受影响
        </text>
        <text x={W / 2} y={H - 26} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Chain: 单一序列 → 一处 reject 后所有后续 token 作废，budget 利用率低
        </text>
      </svg>
    </div>
  );
}
