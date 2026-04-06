import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface TreeNode {
  id: string;
  text: string;
  x: number;
  y: number;
  score: number;
  children?: string[];
  selected?: boolean;
}

type Phase = 'select' | 'expand' | 'evaluate' | 'backprop';

export default function MCTSReasoningTree({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'MCTS + LLM 推理树搜索',
      question: '问题: 12×15=?',
      selectDesc: '从根节点开始，选择 UCB 值最高的子节点向下走',
      expandDesc: '到达叶节点后，展开新的推理步骤（子节点）',
      evaluateDesc: '用 PRM/Verifier 对新节点打分',
      backpropDesc: '将评估分数回传到父节点，更新路径上所有节点的统计',
    },
    en: {
      title: 'MCTS + LLM Reasoning Tree Search',
      question: 'Problem: 12×15=?',
      selectDesc: 'Start from root, select child with highest UCB value',
      expandDesc: 'Expand new reasoning steps (child nodes) at leaf',
      evaluateDesc: 'Score new nodes with PRM/Verifier',
      backpropDesc: 'Backpropagate scores to parent, update statistics',
    },
  }[locale];

  const PHASES: { id: Phase; label: string; desc: string }[] = [
    { id: 'select', label: 'Select', desc: t.selectDesc },
    { id: 'expand', label: 'Expand', desc: t.expandDesc },
    { id: 'evaluate', label: 'Evaluate', desc: t.evaluateDesc },
    { id: 'backprop', label: 'Backpropagate', desc: t.backpropDesc },
  ];

  const NODES: TreeNode[] = [
    { id: 'root', text: t.question, x: W / 2, y: 50, score: 0.5, children: ['a1', 'a2', 'a3'] },
    { id: 'a1', text: '10×15=150', x: 120, y: 130, score: 0.7, children: ['b1', 'b2'], selected: true },
    { id: 'a2', text: '12×10=120', x: 290, y: 130, score: 0.6, children: ['b3'] },
    { id: 'a3', text: '12×20=240', x: 460, y: 130, score: 0.2 },
    { id: 'b1', text: '2×15=30', x: 80, y: 210, score: 0.85, children: ['c1'], selected: true },
    { id: 'b2', text: '3×15=45', x: 200, y: 210, score: 0.3 },
    { id: 'b3', text: '12×5=60', x: 340, y: 210, score: 0.65, children: ['c2'] },
    { id: 'c1', text: '150+30=180 ✓', x: 80, y: 290, score: 0.95, selected: true },
    { id: 'c2', text: '120+60=180 ✓', x: 340, y: 290, score: 0.9 },
  ];

  const [phase, setPhase] = useState<Phase>('select');

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  const getNodeColor = (node: TreeNode) => {
    if (node.score > 0.8) return COLORS.green;
    if (node.score > 0.5) return COLORS.orange;
    return COLORS.red;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize={14} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        {NODES.filter(n => n.children).flatMap(n =>
          n.children!.map(childId => {
            const child = nodeMap[childId];
            const isSelected = n.selected && child.selected;
            return (
              <line key={`${n.id}-${childId}`}
                x1={n.x} y1={n.y + 16}
                x2={child.x} y2={child.y - 16}
                stroke={isSelected && phase === 'select' ? COLORS.green : COLORS.light}
                strokeWidth={isSelected && phase === 'select' ? 2.5 : 1.5} />
            );
          })
        )}

        {phase === 'backprop' && (
          <>
            {['c1', 'b1', 'a1', 'root'].map((id, i) => {
              if (i === 0) return null;
              const prev = ['c1', 'b1', 'a1'][i - 1];
              return (
                <line key={id}
                  x1={nodeMap[prev].x} y1={nodeMap[prev].y - 10}
                  x2={nodeMap[id].x} y2={nodeMap[id].y + 16}
                  stroke={COLORS.purple} strokeWidth={2} strokeDasharray="6 3" markerEnd="url(#arrowMCTS)" />
              );
            })}
            <defs>
              <marker id="arrowMCTS" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.purple} />
              </marker>
            </defs>
          </>
        )}

        {NODES.map(node => {
          const color = getNodeColor(node);
          const isHighlighted =
            (phase === 'select' && node.selected) ||
            (phase === 'expand' && node.id === 'c1') ||
            (phase === 'evaluate' && node.id === 'c1') ||
            (phase === 'backprop' && node.selected);

          return (
            <g key={node.id}>
              <rect x={node.x - 55} y={node.y - 14} width={110} height={28} rx={6}
                fill={isHighlighted ? color : COLORS.bgAlt}
                stroke={color} strokeWidth={isHighlighted ? 2 : 1}
                opacity={isHighlighted ? 1 : 0.6} />
              <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={9}
                fontWeight={isHighlighted ? 700 : 400}
                fill={isHighlighted ? '#fff' : COLORS.dark}>
                {node.text}
              </text>
              <circle cx={node.x + 48} cy={node.y - 8} r={10} fill={color} stroke="#fff" strokeWidth={1} />
              <text x={node.x + 48} y={node.y - 4} textAnchor="middle" fontSize={7} fontWeight={700} fill="#fff">
                {node.score.toFixed(1)}
              </text>
            </g>
          );
        })}

        {PHASES.map((p, i) => (
          <g key={p.id} onClick={() => setPhase(p.id)} style={{ cursor: 'pointer' }}>
            <rect x={30 + i * 135} y={320} width={125} height={28} rx={6}
              fill={phase === p.id ? COLORS.primary : COLORS.bgAlt}
              stroke={COLORS.mid} strokeWidth={1} />
            <text x={92 + i * 135} y={338} textAnchor="middle" fontSize={10}
              fontWeight={phase === p.id ? 700 : 400} fill={phase === p.id ? '#fff' : COLORS.dark}>
              {i + 1}. {p.label}
            </text>
          </g>
        ))}

        <rect x={30} y={358} width={520} height={44} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={40} y={376} fontSize={11} fontWeight={600} fill={COLORS.orange}>
          {PHASES.find(p => p.id === phase)?.label}
        </text>
        <text x={40} y={394} fontSize={10} fill={COLORS.mid}>
          {PHASES.find(p => p.id === phase)?.desc}
        </text>
      </svg>
    </div>
  );
}
