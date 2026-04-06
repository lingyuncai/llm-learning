import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type NodeType = 'state' | 'observation' | 'action';

interface TreeNode {
  id: string;
  type: NodeType;
  label: string;
  detail: string;
  x: number;
  y: number;
  children?: string[];
}

  const TYPE_COLORS: Record<NodeType, string> = {
    state: COLORS.primary,
    observation: COLORS.orange,
    action: COLORS.green,
  };

export default function POMDPDecisionTree({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [selected, setSelected] = useState<string | null>(null);

  const t = {
    zh: {
      title: 'AutoMix POMDP 决策过程',
      initialState: '初始状态',
      initialStateDetail: '收到 query，选择最小模型',
      callModelS: '调用 Model-S',
      callModelSDetail: '小模型生成回答',
      selfScore065: '自评分 = 0.65',
      selfScore065Detail: 'Few-shot 自验证',
      accept: '接受回答',
      acceptDetail: 'score > τ → 输出',
      beliefUpgrade: '信念: 需升级',
      beliefUpgradeDetail: 'score < τ → 选下一级',
      callModelM: '调用 Model-M',
      callModelMDetail: '中等模型重新回答',
      selfScore092: '自评分 = 0.92',
      selfScore092Detail: '第二轮验证',
      continueUpgrade: '继续升级',
      continueUpgradeDetail: '→ Model-L',
      state: '状态',
      observation: '观察',
      action: '动作',
      generate: '生成 + 自评',
    },
    en: {
      title: 'AutoMix POMDP Decision Process',
      initialState: 'Initial State',
      initialStateDetail: 'Received query, select smallest model',
      callModelS: 'Call Model-S',
      callModelSDetail: 'Small model generates answer',
      selfScore065: 'Self-score = 0.65',
      selfScore065Detail: 'Few-shot self-verification',
      accept: 'Accept Answer',
      acceptDetail: 'score > τ → output',
      beliefUpgrade: 'Belief: Need Upgrade',
      beliefUpgradeDetail: 'score < τ → select next tier',
      callModelM: 'Call Model-M',
      callModelMDetail: 'Medium model re-answers',
      selfScore092: 'Self-score = 0.92',
      selfScore092Detail: '2nd round verification',
      continueUpgrade: 'Continue Upgrade',
      continueUpgradeDetail: '→ Model-L',
      state: 'State',
      observation: 'Observation',
      action: 'Action',
      generate: 'Generate + Self-eval',
    },
  }[locale];

  const NODES: TreeNode[] = [
    { id: 's0', type: 'state', label: t.initialState, detail: t.initialStateDetail, x: 290, y: 30 },
    { id: 'a1', type: 'action', label: t.callModelS, detail: t.callModelSDetail, x: 290, y: 90 },
    { id: 'o1', type: 'observation', label: t.selfScore065, detail: t.selfScore065Detail, x: 290, y: 150 },
    { id: 's1-accept', type: 'state', label: t.accept, detail: t.acceptDetail, x: 120, y: 220 },
    { id: 's1-upgrade', type: 'state', label: t.beliefUpgrade, detail: t.beliefUpgradeDetail, x: 430, y: 220 },
    { id: 'a2', type: 'action', label: t.callModelM, detail: t.callModelMDetail, x: 430, y: 280 },
    { id: 'o2', type: 'observation', label: t.selfScore092, detail: t.selfScore092Detail, x: 430, y: 340 },
    { id: 's2-accept', type: 'state', label: t.accept, detail: t.acceptDetail, x: 310, y: 400 },
    { id: 's2-upgrade', type: 'state', label: t.continueUpgrade, detail: t.continueUpgradeDetail, x: 530, y: 400 },
  ];

  const EDGES: [string, string, string][] = [
    ['s0', 'a1', ''],
    ['a1', 'o1', t.generate],
    ['o1', 's1-accept', 'score > τ'],
    ['o1', 's1-upgrade', 'score < τ'],
    ['s1-upgrade', 'a2', ''],
    ['a2', 'o2', t.generate],
    ['o2', 's2-accept', 'score > τ'],
    ['o2', 's2-upgrade', 'score < τ'],
  ];

  const TYPE_SHAPES: Record<NodeType, string> = {
    state: t.state,
    observation: t.observation,
    action: t.action,
  };

  const W = 580, H = 480;

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="20" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="14" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Edges */}
        {EDGES.map(([from, to, label], i) => {
          const f = nodeMap[from], t = nodeMap[to];
          const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
          return (
            <g key={i}>
              <line x1={f.x} y1={f.y + 18} x2={t.x} y2={t.y - 12}
                    stroke={COLORS.mid} strokeWidth="1.5"
                    markerEnd="url(#arrow-pomdp)" />
              {label && (
                <text x={mx + 5} y={my} fontFamily={FONTS.sans}
                      fontSize="9" fill={COLORS.mid}>{label}</text>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="arrow-pomdp" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Nodes */}
        {NODES.map(n => {
          const isSelected = selected === n.id;
          const color = TYPE_COLORS[n.type];
          return (
            <g key={n.id} onClick={() => setSelected(isSelected ? null : n.id)}
               style={{ cursor: 'pointer' }}>
              <rect x={n.x - 55} y={n.y - 12} width="110" height="24" rx={n.type === 'observation' ? 12 : 4}
                    fill={isSelected ? color : COLORS.bgAlt}
                    stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
              <text x={n.x} y={n.y + 4} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10" fontWeight="600"
                    fill={isSelected ? '#fff' : color}
                    style={{ pointerEvents: 'none' }}>
                {n.label}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(30, 435)">
          {Object.entries(TYPE_SHAPES).map(([type, label], i) => (
            <g key={type} transform={`translate(${i * 100}, 0)`}>
              <rect x="0" y="0" width="14" height="14" rx={type === 'observation' ? 7 : 2}
                    fill={TYPE_COLORS[type as NodeType]} />
              <text x="20" y="11" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{label}</text>
            </g>
          ))}
          {/* Selected detail */}
          {selected && (
            <text x="320" y="11" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
              {nodeMap[selected]?.detail}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
