import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Step {
  action: string;
  state: string;
  reward: number;
}

export default function AgentEnvironmentLoop({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Agent-Environment 交互循环',
      actions: ['向上', '向右', '向下', '向左'],
      chooseAction: '选择动作',
      trajectory: 'Trajectory',
      totalReward: '累积奖励',
      reset: '重置',
      start: '起点',
      upper: '上方',
      right: '右侧',
      trap: '陷阱',
      goal: '目标',
      note: '点击动作按钮控制 Agent 移动 | S₄=目标(+5) | S₃=陷阱(-1)',
    },
    en: {
      title: 'Agent-Environment Loop',
      actions: ['Up', 'Right', 'Down', 'Left'],
      chooseAction: 'Choose Action',
      trajectory: 'Trajectory',
      totalReward: 'Total Reward',
      reset: 'Reset',
      start: 'Start',
      upper: 'Upper',
      right: 'Right',
      trap: 'Trap',
      goal: 'Goal',
      note: 'Click action buttons to control Agent | S₄=goal(+5) | S₃=trap(-1)',
    },
  }[locale];

  const ACTIONS = t.actions;
  const [trajectory, setTrajectory] = useState<Step[]>([]);
  const [currentState, setCurrentState] = useState('S₀');
  const [totalReward, setTotalReward] = useState(0);
  const [animating, setAnimating] = useState(false);

  const stateMap: Record<string, Record<string, { next: string; reward: number }>> = {
    'S₀': { '向上': { next: 'S₁', reward: 0 }, '向右': { next: 'S₂', reward: 1 }, '向下': { next: 'S₃', reward: -1 }, '向左': { next: 'S₀', reward: 0 } },
    'S₁': { '向上': { next: 'S₁', reward: 0 }, '向右': { next: 'S₄', reward: 5 }, '向下': { next: 'S₀', reward: 0 }, '向左': { next: 'S₁', reward: 0 } },
    'S₂': { '向上': { next: 'S₄', reward: 5 }, '向右': { next: 'S₂', reward: 0 }, '向下': { next: 'S₂', reward: 0 }, '向左': { next: 'S₀', reward: 0 } },
    'S₃': { '向上': { next: 'S₀', reward: 0 }, '向右': { next: 'S₃', reward: 0 }, '向下': { next: 'S₃', reward: -1 }, '向左': { next: 'S₃', reward: -1 } },
    'S₄': { '向上': { next: 'S₄', reward: 0 }, '向右': { next: 'S₄', reward: 0 }, '向下': { next: 'S₄', reward: 0 }, '向左': { next: 'S₄', reward: 0 } },
  };

  const takeAction = (action: string) => {
    if (animating || currentState === 'S₄') return;
    const result = stateMap[currentState][action];
    setAnimating(true);
    setTimeout(() => {
      setTrajectory(prev => [...prev, { action, state: result.next, reward: result.reward }]);
      setCurrentState(result.next);
      setTotalReward(prev => prev + result.reward);
      setAnimating(false);
    }, 300);
  };

  const reset = () => {
    setTrajectory([]);
    setCurrentState('S₀');
    setTotalReward(0);
    setAnimating(false);
  };

  // Node positions
  const nodes: Record<string, { x: number; y: number; label: string }> = {
    'S₀': { x: 160, y: 190, label: t.start },
    'S₁': { x: 160, y: 70, label: t.upper },
    'S₂': { x: 300, y: 190, label: t.right },
    'S₃': { x: 160, y: 310, label: t.trap },
    'S₄': { x: 300, y: 70, label: t.goal },
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Edges (simplified: just show main transitions) */}
        {[
          ['S₀', 'S₁'], ['S₀', 'S₂'], ['S₀', 'S₃'], ['S₁', 'S₄'], ['S₂', 'S₄'],
        ].map(([from, to], i) => (
          <line key={i}
            x1={nodes[from].x} y1={nodes[from].y}
            x2={nodes[to].x} y2={nodes[to].y}
            stroke={COLORS.light} strokeWidth={1.5} />
        ))}

        {/* Nodes */}
        {Object.entries(nodes).map(([id, { x, y, label }]) => {
          const isGoal = id === 'S₄';
          const isTrap = id === 'S₃';
          const isCurrent = id === currentState;
          return (
            <g key={id}>
              <circle cx={x} cy={y} r={28}
                fill={isCurrent ? COLORS.highlight : isGoal ? '#d4edda' : isTrap ? COLORS.waste : COLORS.bgAlt}
                stroke={isCurrent ? COLORS.primary : isGoal ? COLORS.green : isTrap ? COLORS.red : COLORS.mid}
                strokeWidth={isCurrent ? 2.5 : 1.5} />
              <text x={x} y={y - 6} textAnchor="middle" fontSize={13} fontWeight={700}
                fill={isGoal ? COLORS.green : isTrap ? COLORS.red : COLORS.dark}>
                {id}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
                {label}
              </text>
            </g>
          );
        })}

        {/* Action buttons */}
        <text x={440} y={55} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
          {t.chooseAction}
        </text>
        {ACTIONS.map((action, i) => {
          const bx = 400, by = 65 + i * 38;
          const disabled = currentState === 'S₄' || animating;
          return (
            <g key={action} onClick={() => !disabled && takeAction(action)}
              style={{ cursor: disabled ? 'default' : 'pointer' }}>
              <rect x={bx} y={by} width={80} height={30} rx={6}
                fill={disabled ? COLORS.masked : COLORS.primary} opacity={disabled ? 0.4 : 1} />
              <text x={bx + 40} y={by + 19} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff">
                {action}
              </text>
            </g>
          );
        })}

        {/* Trajectory log */}
        <text x={440} y={230} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
          {t.trajectory}
        </text>
        {trajectory.slice(-4).map((step, i) => (
          <text key={i} x={400} y={248 + i * 18} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
            {step.action} → {step.state} (r={step.reward > 0 ? '+' : ''}{step.reward})
          </text>
        ))}

        {/* Total reward */}
        <text x={440} y={330} textAnchor="middle" fontSize={13} fontWeight={700}
          fill={totalReward > 0 ? COLORS.green : totalReward < 0 ? COLORS.red : COLORS.dark}>
          {t.totalReward}: {totalReward > 0 ? '+' : ''}{totalReward}
        </text>

        {/* Reset button */}
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={410} y={342} width={60} height={26} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={440} y={359} textAnchor="middle" fontSize={11} fill={COLORS.dark}>{t.reset}</text>
        </g>

        {/* Legend */}
        <text x={30} y={H - 10} fontSize={9} fill={COLORS.mid}>
          {t.note}
        </text>
      </svg>
    </div>
  );
}
