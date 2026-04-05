import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

type Phase = 'action' | 'reward' | 'critic' | 'advantage' | 'update';

const PHASES: { id: Phase; label: string; desc: string }[] = [
  { id: 'action', label: '1. Actor 输出动作', desc: 'Actor 网络 π(a|s;θ) 根据当前状态 s 输出动作概率分布，采样动作 a' },
  { id: 'reward', label: '2. 环境返回', desc: '执行动作 a 后，环境返回即时奖励 r 和下一个状态 s\'' },
  { id: 'critic', label: '3. Critic 评估', desc: 'Critic 网络 V(s;w) 分别估计当前状态 V(s) 和下一状态 V(s\') 的价值' },
  { id: 'advantage', label: '4. 计算 Advantage', desc: 'A = r + γ·V(s\') - V(s)，即 TD error，衡量"这个动作比预期好多少"' },
  { id: 'update', label: '5. 双网络更新', desc: 'Actor: θ += α·∇log π(a|s)·A | Critic: w -= β·∇(V(s) - (r+γV(s\')))²' },
];

export default function ActorCriticArchitecture() {
  const [phase, setPhase] = useState<Phase>('action');
  const pi = PHASES.findIndex(p => p.id === phase);

  const boxW = 100, boxH = 40;

  // Positions
  const actor = { x: 100, y: 100, label: 'Actor π(a|s;θ)', color: COLORS.primary };
  const env = { x: 290, y: 100, label: 'Environment', color: COLORS.mid };
  const critic = { x: 100, y: 260, label: 'Critic V(s;w)', color: COLORS.green };
  const adv = { x: 290, y: 260, label: 'Advantage A', color: COLORS.orange };

  const highlight = (ids: Phase[]) => ids.includes(phase) ? 1 : 0.3;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Actor-Critic 架构：双网络协同
        </text>

        {/* Actor box */}
        <rect x={actor.x - boxW / 2} y={actor.y - boxH / 2} width={boxW} height={boxH} rx={8}
          fill={COLORS.bgAlt} stroke={actor.color} strokeWidth={phase === 'action' || phase === 'update' ? 2.5 : 1.5}
          opacity={highlight(['action', 'update'])} />
        <text x={actor.x} y={actor.y - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={actor.color}>Actor</text>
        <text x={actor.x} y={actor.y + 10} textAnchor="middle" fontSize={8} fill={COLORS.mid}>π(a|s; θ)</text>

        {/* Environment box */}
        <rect x={env.x - boxW / 2} y={env.y - boxH / 2} width={boxW} height={boxH} rx={8}
          fill={COLORS.bgAlt} stroke={env.color} strokeWidth={phase === 'reward' ? 2.5 : 1.5}
          opacity={highlight(['action', 'reward'])} />
        <text x={env.x} y={env.y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={env.color}>Environment</text>

        {/* Critic box */}
        <rect x={critic.x - boxW / 2} y={critic.y - boxH / 2} width={boxW} height={boxH} rx={8}
          fill={COLORS.bgAlt} stroke={critic.color} strokeWidth={phase === 'critic' || phase === 'update' ? 2.5 : 1.5}
          opacity={highlight(['critic', 'advantage', 'update'])} />
        <text x={critic.x} y={critic.y - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={critic.color}>Critic</text>
        <text x={critic.x} y={critic.y + 10} textAnchor="middle" fontSize={8} fill={COLORS.mid}>V(s; w)</text>

        {/* Advantage box */}
        <rect x={adv.x - boxW / 2} y={adv.y - boxH / 2} width={boxW} height={boxH} rx={8}
          fill={COLORS.highlight} stroke={adv.color} strokeWidth={phase === 'advantage' ? 2.5 : 1.5}
          opacity={highlight(['advantage', 'update'])} />
        <text x={adv.x} y={adv.y - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={adv.color}>Advantage</text>
        <text x={adv.x} y={adv.y + 10} textAnchor="middle" fontSize={8} fill={COLORS.mid}>A = r + γV(s') - V(s)</text>

        {/* Arrows */}
        <defs>
          <marker id="arrowAC" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
          <marker id="arrowACg" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
          </marker>
          <marker id="arrowACo" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.orange} />
          </marker>
        </defs>

        {/* Actor → Env: action */}
        <line x1={actor.x + boxW / 2 + 5} y1={actor.y - 8} x2={env.x - boxW / 2 - 5} y2={env.y - 8}
          stroke={COLORS.primary} strokeWidth={phase === 'action' ? 2.5 : 1} opacity={highlight(['action'])}
          markerEnd="url(#arrowAC)" />
        <text x={(actor.x + env.x) / 2} y={actor.y - 18} textAnchor="middle" fontSize={9} fill={COLORS.primary}
          opacity={highlight(['action'])}>a ~ π(·|s)</text>

        {/* Env → Actor: state, reward */}
        <line x1={env.x - boxW / 2 - 5} y1={env.y + 8} x2={actor.x + boxW / 2 + 5} y2={actor.y + 8}
          stroke={COLORS.mid} strokeWidth={phase === 'reward' ? 2.5 : 1} opacity={highlight(['reward'])}
          markerEnd="url(#arrowAC)" />
        <text x={(actor.x + env.x) / 2} y={actor.y + 28} textAnchor="middle" fontSize={9} fill={COLORS.mid}
          opacity={highlight(['reward'])}>s', r</text>

        {/* State → Critic */}
        <line x1={actor.x} y1={actor.y + boxH / 2 + 5} x2={critic.x} y2={critic.y - boxH / 2 - 5}
          stroke={COLORS.green} strokeWidth={phase === 'critic' ? 2.5 : 1} opacity={highlight(['critic'])}
          markerEnd="url(#arrowACg)" />
        <text x={actor.x - 20} y={(actor.y + critic.y) / 2} fontSize={9} fill={COLORS.green}
          opacity={highlight(['critic'])}>s, s'</text>

        {/* Critic → Advantage */}
        <line x1={critic.x + boxW / 2 + 5} y1={critic.y} x2={adv.x - boxW / 2 - 5} y2={adv.y}
          stroke={COLORS.green} strokeWidth={phase === 'advantage' ? 2.5 : 1} opacity={highlight(['advantage'])}
          markerEnd="url(#arrowACg)" />
        <text x={(critic.x + adv.x) / 2} y={critic.y - 10} textAnchor="middle" fontSize={9} fill={COLORS.green}
          opacity={highlight(['advantage'])}>V(s), V(s')</text>

        {/* Advantage → Actor (update) */}
        <path d={`M ${adv.x} ${adv.y - boxH / 2 - 5} Q ${adv.x} ${actor.y} ${actor.x + boxW / 2 + 10} ${actor.y}`}
          fill="none" stroke={COLORS.orange} strokeWidth={phase === 'update' ? 2.5 : 1} opacity={highlight(['update'])}
          markerEnd="url(#arrowACo)" />
        <text x={350} y={170} fontSize={9} fill={COLORS.orange} opacity={highlight(['update'])}>
          A → 更新 Actor
        </text>

        {/* Phase controls */}
        {PHASES.map((p, i) => (
          <g key={p.id} onClick={() => setPhase(p.id)} style={{ cursor: 'pointer' }}>
            <rect x={420} y={70 + i * 34} width={150} height={28} rx={6}
              fill={phase === p.id ? COLORS.primary : COLORS.bgAlt}
              stroke={phase === p.id ? COLORS.primary : COLORS.light} strokeWidth={1} />
            <text x={495} y={88 + i * 34} textAnchor="middle" fontSize={10}
              fontWeight={phase === p.id ? 700 : 400} fill={phase === p.id ? '#fff' : COLORS.dark}>
              {p.label}
            </text>
          </g>
        ))}

        {/* Description */}
        <rect x={30} y={H - 60} width={520} height={45} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={40} y={H - 40} fontSize={11} fontWeight={600} fill={COLORS.dark}>
          {PHASES[pi].label}
        </text>
        <text x={40} y={H - 22} fontSize={10} fill={COLORS.mid}>
          {PHASES[pi].desc}
        </text>
      </svg>
    </div>
  );
}
