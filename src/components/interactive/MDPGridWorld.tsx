import { useState, useCallback } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;
const GRID = 4;
const CELL = 72;
const OX = 40;
const OY = 60;

type Cell = { reward: number; wall: boolean };

const initGrid = (): Cell[][] => {
  const g: Cell[][] = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => ({ reward: -0.04, wall: false }))
  );
  g[0][3] = { reward: 1, wall: false };    // goal
  g[1][3] = { reward: -1, wall: false };   // penalty
  g[1][1] = { reward: 0, wall: true };     // wall
  return g;
};

const ARROWS: Record<string, string> = { up: '↑', right: '→', down: '↓', left: '←' };
const DIRS = [
  { name: 'up', dr: -1, dc: 0 },
  { name: 'right', dr: 0, dc: 1 },
  { name: 'down', dr: 1, dc: 0 },
  { name: 'left', dr: 0, dc: -1 },
];

export default function MDPGridWorld({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'MDP Grid World — 马尔可夫决策过程',
      subtitle: 'γ = {gamma} | 每步 reward = -0.04 | 目标 +1 | 陷阱 -1',
      trajectory: '轨迹 (Trajectory)',
      goalReached: '🎯 到达目标！',
      trapFell: '💥 掉入陷阱！',
      reset: '重置',
      instructions: '使用方向键控制 Agent | 蓝色圆点 = Agent 位置',
    },
    en: {
      title: 'MDP Grid World — Markov Decision Process',
      subtitle: 'γ = {gamma} | step reward = -0.04 | goal +1 | trap -1',
      trajectory: 'Trajectory',
      goalReached: '🎯 Goal Reached!',
      trapFell: '💥 Fell into Trap!',
      reset: 'Reset',
      instructions: 'Use arrow keys to control Agent | Blue dot = Agent position',
    },
  }[locale];
  const [grid] = useState<Cell[][]>(initGrid);
  const [agentR, setAgentR] = useState(3);
  const [agentC, setAgentC] = useState(0);
  const [gamma] = useState(0.9);
  const [trajectory, setTrajectory] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const isTerminal = (r: number, c: number) =>
    (r === 0 && c === 3) || (r === 1 && c === 3);

  const move = useCallback((dir: typeof DIRS[number]) => {
    if (done) return;
    let nr = agentR + dir.dr;
    let nc = agentC + dir.dc;
    if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID || grid[nr][nc].wall) {
      nr = agentR;
      nc = agentC;
    }
    setAgentR(nr);
    setAgentC(nc);
    setTrajectory(prev => [...prev, `${ARROWS[dir.name]} (${nr},${nc}) r=${grid[nr][nc].reward}`]);
    if (isTerminal(nr, nc)) setDone(true);
  }, [agentR, agentC, done, grid]);

  const reset = () => {
    setAgentR(3);
    setAgentC(0);
    setTrajectory([]);
    setDone(false);
  };

  const cellColor = (r: number, c: number) => {
    if (grid[r][c].wall) return COLORS.mid;
    if (r === 0 && c === 3) return '#d4edda';
    if (r === 1 && c === 3) return COLORS.waste;
    return COLORS.bgAlt;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={44} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle.replace('{gamma}', gamma.toString())}
        </text>

        {/* Grid */}
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const x = OX + c * CELL;
            const y = OY + r * CELL;
            const isAgent = r === agentR && c === agentC;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={CELL} height={CELL}
                  fill={cellColor(r, c)}
                  stroke={isAgent ? COLORS.primary : COLORS.light}
                  strokeWidth={isAgent ? 2.5 : 1} />
                {grid[r][c].wall ? (
                  <text x={x + CELL / 2} y={y + CELL / 2 + 5} textAnchor="middle" fontSize={18} fill="#fff">
                    ▓
                  </text>
                ) : (
                  <>
                    <text x={x + CELL / 2} y={y + 18} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
                      ({r},{c})
                    </text>
                    <text x={x + CELL / 2} y={y + CELL / 2 + 5} textAnchor="middle" fontSize={11} fontWeight={600}
                      fill={grid[r][c].reward > 0 ? COLORS.green : grid[r][c].reward < -0.04 ? COLORS.red : COLORS.dark}>
                      {grid[r][c].reward > 0 ? `+${grid[r][c].reward}` : grid[r][c].reward}
                    </text>
                  </>
                )}
                {isAgent && !grid[r][c].wall && (
                  <circle cx={x + CELL / 2} cy={y + CELL - 14} r={8}
                    fill={COLORS.primary} stroke="#fff" strokeWidth={2} />
                )}
              </g>
            );
          })
        )}

        {/* Direction buttons */}
        {DIRS.map((dir, i) => {
          const bx = 380 + (i % 2 === 0 ? 40 : (i === 1 ? 80 : 0));
          const by = OY + (i === 0 ? 0 : i === 2 ? 80 : 40);
          return (
            <g key={dir.name} onClick={() => move(dir)} style={{ cursor: done ? 'default' : 'pointer' }}>
              <rect x={bx} y={by} width={36} height={30} rx={5}
                fill={done ? COLORS.masked : COLORS.primary} opacity={done ? 0.4 : 1} />
              <text x={bx + 18} y={by + 20} textAnchor="middle" fontSize={16} fill="#fff">
                {ARROWS[dir.name]}
              </text>
            </g>
          );
        })}

        {/* Trajectory */}
        <text x={370} y={OY + 140} fontSize={12} fontWeight={600} fill={COLORS.dark}>
          {t.trajectory}
        </text>
        {trajectory.slice(-6).map((t, i) => (
          <text key={i} x={370} y={OY + 158 + i * 16} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
            t{trajectory.length - (trajectory.slice(-6).length - i)}: {t}
          </text>
        ))}

        {/* Done / Reset */}
        {done && (
          <text x={W / 2} y={H - 30} textAnchor="middle" fontSize={14} fontWeight={700}
            fill={grid[agentR][agentC].reward > 0 ? COLORS.green : COLORS.red}>
            {grid[agentR][agentC].reward > 0 ? t.goalReached : t.trapFell}
          </text>
        )}
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={370} y={H - 48} width={60} height={26} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={400} y={H - 31} textAnchor="middle" fontSize={11} fill={COLORS.dark}>{t.reset}</text>
        </g>

        <text x={30} y={H - 8} fontSize={9} fill={COLORS.mid}>
          {t.instructions}
        </text>
      </svg>
    </div>
  );
}
