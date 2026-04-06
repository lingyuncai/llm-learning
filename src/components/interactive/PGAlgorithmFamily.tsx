import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface AlgoNode {
  id: string;
  label: string;
  x: number;
  y: number;
  improvement: string;
  detail: string;
  color: string;
}

const NODES: AlgoNode[] = [
  { id: 'reinforce', label: 'REINFORCE', x: 100, y: 80, improvement: '最基础的 Policy Gradient', detail: '采样完整 trajectory → 计算 return G → 更新 θ += α·∇log π·G。简单但方差极高，收敛慢。', color: COLORS.primary },
  { id: 'baseline', label: 'REINFORCE\n+ Baseline', x: 100, y: 170, improvement: '引入 Baseline 降低方差', detail: '用 return 减去 baseline b(s)，通常 b(s) = V(s) 的滑动平均。方差降低但仍需完整 trajectory。', color: COLORS.primary },
  { id: 'ac', label: 'Actor-Critic', x: 290, y: 170, improvement: '用网络近似 V(s) 作 baseline', detail: 'Critic 网络学习 V(s) 替代简单平均。可以每步更新（不需完整 trajectory），学习效率大幅提升。', color: COLORS.green },
  { id: 'a2c', label: 'A2C', x: 290, y: 260, improvement: '同步并行 + Advantage', detail: 'Advantage Actor-Critic：多个 worker 并行采样，同步更新。用 Advantage A = Q-V 替代 raw return。', color: COLORS.green },
  { id: 'ppo', label: 'PPO', x: 480, y: 260, improvement: 'Clipped Objective 限制更新', detail: 'Proximal Policy Optimization：用 clip(ratio, 1-ε, 1+ε) 限制策略更新幅度，防止步长过大导致性能崩溃。RLHF 的核心算法。', color: COLORS.orange },
];

export default function PGAlgorithmFamily({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Policy Gradient 算法演进',
      subtitle: '点击节点查看每步改进的详情',
      rlhfNote: '↑ RLHF 核心算法',
      improvement: '核心改进：',
      nodes: {
        reinforce: {
          label: 'REINFORCE',
          improvement: '最基础的 Policy Gradient',
          detail: '采样完整 trajectory → 计算 return G → 更新 θ += α·∇log π·G。简单但方差极高，收敛慢。',
        },
        baseline: {
          label: 'REINFORCE\n+ Baseline',
          improvement: '引入 Baseline 降低方差',
          detail: '用 return 减去 baseline b(s)，通常 b(s) = V(s) 的滑动平均。方差降低但仍需完整 trajectory。',
        },
        ac: {
          label: 'Actor-Critic',
          improvement: '用网络近似 V(s) 作 baseline',
          detail: 'Critic 网络学习 V(s) 替代简单平均。可以每步更新（不需完整 trajectory），学习效率大幅提升。',
        },
        a2c: {
          label: 'A2C',
          improvement: '同步并行 + Advantage',
          detail: 'Advantage Actor-Critic：多个 worker 并行采样，同步更新。用 Advantage A = Q-V 替代 raw return。',
        },
        ppo: {
          label: 'PPO',
          improvement: 'Clipped Objective 限制更新',
          detail: 'Proximal Policy Optimization：用 clip(ratio, 1-ε, 1+ε) 限制策略更新幅度，防止步长过大导致性能崩溃。RLHF 的核心算法。',
        },
      },
      edges: [
        '+ baseline b(s)',
        '+ Critic 网络',
        '+ 并行采样',
        '+ Clipped Trust Region',
      ],
    },
    en: {
      title: 'Policy Gradient Algorithm Evolution',
      subtitle: 'Click nodes to see details of each improvement',
      rlhfNote: '↑ Core algorithm for RLHF',
      improvement: 'Key improvement:',
      nodes: {
        reinforce: {
          label: 'REINFORCE',
          improvement: 'Most basic Policy Gradient',
          detail: 'Sample full trajectory → compute return G → update θ += α·∇log π·G. Simple but extremely high variance, slow convergence.',
        },
        baseline: {
          label: 'REINFORCE\n+ Baseline',
          improvement: 'Introduce Baseline to reduce variance',
          detail: 'Subtract baseline b(s) from return, typically b(s) = moving avg of V(s). Variance reduced but still needs full trajectory.',
        },
        ac: {
          label: 'Actor-Critic',
          improvement: 'Use network to approximate V(s) as baseline',
          detail: 'Critic network learns V(s) to replace simple average. Can update every step (no full trajectory needed), learning efficiency greatly improved.',
        },
        a2c: {
          label: 'A2C',
          improvement: 'Synchronous parallel + Advantage',
          detail: 'Advantage Actor-Critic: multiple workers sample in parallel, sync updates. Use Advantage A = Q-V instead of raw return.',
        },
        ppo: {
          label: 'PPO',
          improvement: 'Clipped Objective limits updates',
          detail: 'Proximal Policy Optimization: use clip(ratio, 1-ε, 1+ε) to limit policy update magnitude, prevent performance collapse from large steps. Core algorithm for RLHF.',
        },
      },
      edges: [
        '+ baseline b(s)',
        '+ Critic network',
        '+ parallel sampling',
        '+ Clipped Trust Region',
      ],
    },
  }[locale];

  const [active, setActive] = useState<string | null>(null);

  const edges: [string, string][] = [
    ['reinforce', 'baseline'],
    ['baseline', 'ac'],
    ['ac', 'a2c'],
    ['a2c', 'ppo'],
  ];

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));
  const activeNode = active ? nodeMap[active] : null;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Edges */}
        {edges.map(([from, to], i) => {
          const f = nodeMap[from], edgeTo = nodeMap[to];
          const mx = (f.x + edgeTo.x) / 2, my = (f.y + edgeTo.y) / 2;
          const label = t.edges[i];
          return (
            <g key={i}>
              <line x1={f.x} y1={f.y + 20} x2={edgeTo.x} y2={edgeTo.y - 20}
                stroke={COLORS.light} strokeWidth={2} markerEnd="url(#arrowPG)" />
              <rect x={mx - 60} y={my - 10} width={120} height={18} rx={4}
                fill="rgba(255,255,255,0.95)" stroke={COLORS.light} strokeWidth={0.5} />
              <text x={mx} y={my + 3} textAnchor="middle" fontSize={9} fill={COLORS.orange} fontWeight={600}>
                {label}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="arrowPG" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.light} />
          </marker>
        </defs>

        {/* Nodes */}
        {NODES.map(node => {
          const isActive = active === node.id;
          const isPPO = node.id === 'ppo';
          const nodeT = t.nodes[node.id as keyof typeof t.nodes];
          return (
            <g key={node.id}
              onClick={() => setActive(isActive ? null : node.id)}
              style={{ cursor: 'pointer' }}>
              <rect x={node.x - 55} y={node.y - 18} width={110} height={36} rx={18}
                fill={isActive ? node.color : COLORS.bgAlt}
                stroke={node.color} strokeWidth={isActive ? 2.5 : 1.5} />
              {isPPO && !isActive && (
                <rect x={node.x - 58} y={node.y - 21} width={116} height={42} rx={21}
                  fill="none" stroke={COLORS.purple} strokeWidth={1} strokeDasharray="4 2" />
              )}
              <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={11} fontWeight={700}
                fill={isActive ? '#fff' : node.color}>
                {nodeT.label.split('\n').map((line, li) => (
                  <tspan key={li} x={node.x} dy={li === 0 ? 0 : 14}>{line}</tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* PPO badge */}
        <text x={480} y={300} textAnchor="middle" fontSize={9} fill={COLORS.purple} fontWeight={600}>
          {t.rlhfNote}
        </text>

        {/* Detail panel */}
        {activeNode && (
          <g>
            <rect x={30} y={H - 90} width={520} height={75} rx={8}
              fill={COLORS.bgAlt} stroke={activeNode.color} strokeWidth={1.5} />
            <text x={45} y={H - 72} fontSize={12} fontWeight={700} fill={activeNode.color}>
              {t.nodes[activeNode.id as keyof typeof t.nodes].label.replace('\n', ' ')}
            </text>
            <text x={45} y={H - 55} fontSize={11} fontWeight={600} fill={COLORS.dark}>
              {t.improvement}{t.nodes[activeNode.id as keyof typeof t.nodes].improvement}
            </text>
            <text x={45} y={H - 35} fontSize={10} fill={COLORS.mid}>
              {t.nodes[activeNode.id as keyof typeof t.nodes].detail.substring(0, 80)}
            </text>
            <text x={45} y={H - 20} fontSize={10} fill={COLORS.mid}>
              {t.nodes[activeNode.id as keyof typeof t.nodes].detail.substring(80)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
