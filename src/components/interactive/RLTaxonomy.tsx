import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface TaxNode {
  id: string;
  label: string;
  desc: string;
  examples: string;
  x: number;
  y: number;
  color: string;
  children?: string[];
  llm?: boolean;
}

const NODES: TaxNode[] = [
  { id: 'root', label: 'RL 方法', desc: '强化学习算法分类', examples: '', x: W / 2, y: 40, color: COLORS.dark },
  { id: 'value', label: 'Value-Based', desc: '学习价值函数 V(s) 或 Q(s,a)，从中推导策略', examples: 'Q-Learning, DQN, Double DQN', x: 120, y: 120, color: COLORS.primary, children: ['dqn'] },
  { id: 'policy', label: 'Policy-Based', desc: '直接参数化策略 π(a|s;θ)，通过梯度上升优化期望回报', examples: 'REINFORCE, REINFORCE+Baseline', x: 290, y: 120, color: COLORS.green, children: ['pg'], llm: true },
  { id: 'ac', label: 'Actor-Critic', desc: 'Actor（策略网络）+ Critic（价值网络）协同训练，兼顾两者优势', examples: 'A2C, A3C, PPO, TRPO', x: 460, y: 120, color: COLORS.orange, children: ['ppo'], llm: true },
  { id: 'dqn', label: 'DQN 系列', desc: '用深度网络近似 Q 函数，适合离散动作空间（游戏 AI）', examples: 'DQN, Dueling DQN, Rainbow', x: 80, y: 230, color: COLORS.primary },
  { id: 'pg', label: 'Policy Gradient', desc: '策略梯度定理驱动：∇J(θ) = E[∇log π · A]', examples: 'REINFORCE, VPG', x: 240, y: 230, color: COLORS.green, llm: true },
  { id: 'ppo', label: 'PPO / TRPO', desc: 'Clipped surrogate objective 限制策略更新幅度，稳定训练', examples: 'PPO-Clip, TRPO, PPO2', x: 400, y: 230, color: COLORS.orange, llm: true },
  { id: 'rlhf', label: 'RLHF / DPO / GRPO', desc: '将 RL 用于 LLM 对齐：从人类偏好中学习', examples: 'InstructGPT, ChatGPT, DeepSeek-R1', x: 400, y: 330, color: COLORS.purple, llm: true },
];

export default function RLTaxonomy() {
  const [active, setActive] = useState<string | null>(null);

  const edges: [string, string][] = [
    ['root', 'value'], ['root', 'policy'], ['root', 'ac'],
    ['value', 'dqn'], ['policy', 'pg'], ['ac', 'ppo'],
    ['ppo', 'rlhf'],
  ];

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));
  const activeNode = active ? nodeMap[active] : null;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize={14} fontWeight={700} fill={COLORS.dark}>
          RL 方法分类树
        </text>

        {/* Edges */}
        {edges.map(([from, to], i) => (
          <line key={i}
            x1={nodeMap[from].x} y1={nodeMap[from].y + 16}
            x2={nodeMap[to].x} y2={nodeMap[to].y - 16}
            stroke={COLORS.light} strokeWidth={1.5} />
        ))}

        {/* Nodes */}
        {NODES.map(node => {
          const isActive = active === node.id;
          const nodeW = node.id === 'rlhf' ? 150 : node.id === 'root' ? 80 : 110;
          return (
            <g key={node.id}
              onClick={() => setActive(isActive ? null : node.id)}
              style={{ cursor: 'pointer' }}>
              <rect x={node.x - nodeW / 2} y={node.y - 14} width={nodeW} height={28} rx={14}
                fill={isActive ? node.color : COLORS.bgAlt}
                stroke={node.color} strokeWidth={isActive ? 2 : 1.5} />
              <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={11} fontWeight={600}
                fill={isActive ? '#fff' : node.color}>
                {node.label}
              </text>
              {node.llm && (
                <circle cx={node.x + nodeW / 2 - 6} cy={node.y - 14} r={6}
                  fill={COLORS.purple} stroke="#fff" strokeWidth={1} />
              )}
            </g>
          );
        })}

        {/* LLM badge legend */}
        <circle cx={30} cy={H - 60} r={6} fill={COLORS.purple} stroke="#fff" strokeWidth={1} />
        <text x={42} y={H - 56} fontSize={10} fill={COLORS.mid}>= LLM 对齐相关</text>

        {/* Detail panel */}
        {activeNode && (
          <g>
            <rect x={30} y={H - 90} width={520} height={70} rx={8}
              fill={COLORS.bgAlt} stroke={activeNode.color} strokeWidth={1.5} />
            <text x={45} y={H - 72} fontSize={12} fontWeight={700} fill={activeNode.color}>
              {activeNode.label}
            </text>
            <text x={45} y={H - 55} fontSize={11} fill={COLORS.dark}>
              {activeNode.desc}
            </text>
            <text x={45} y={H - 38} fontSize={10} fill={COLORS.mid}>
              代表算法：{activeNode.examples}
            </text>
          </g>
        )}

        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          点击节点查看详情 | 紫色圆点标记 = LLM 对齐相关路径
        </text>
      </svg>
    </div>
  );
}
