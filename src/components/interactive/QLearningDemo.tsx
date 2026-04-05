import { useState, useRef, useCallback } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 440;
const GRID = 4;
const CELL = 52;
const OX = 30;
const OY = 55;

const DIRS = [
  { name: '↑', dr: -1, dc: 0 },
  { name: '→', dr: 0, dc: 1 },
  { name: '↓', dr: 1, dc: 0 },
  { name: '←', dr: 0, dc: -1 },
];

const REWARDS: number[][] = [
  [-0.04, -0.04, -0.04, 1],
  [-0.04, 0, -0.04, -1],
  [-0.04, -0.04, -0.04, -0.04],
  [-0.04, -0.04, -0.04, -0.04],
];
const WALLS = [[1, 1]];
const isWall = (r: number, c: number) => WALLS.some(([wr, wc]) => wr === r && wc === c);
const isTerminal = (r: number, c: number) => (r === 0 && c === 3) || (r === 1 && c === 3);

export default function QLearningDemo() {
  const initQ = () => Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => [0, 0, 0, 0])
  );
  const [qTable, setQTable] = useState<number[][][]>(initQ);
  const [agentR, setAgentR] = useState(3);
  const [agentC, setAgentC] = useState(0);
  const [episodes, setEpisodes] = useState(0);
  const [running, setRunning] = useState(false);
  const runRef = useRef(false);
  const alpha = 0.1;
  const gamma = 0.9;
  const epsilon = 0.3;

  const step = useCallback((q: number[][][], r: number, c: number): { q: number[][][]; nr: number; nc: number; done: boolean } => {
    // Epsilon-greedy action selection
    let ai: number;
    if (Math.random() < epsilon) {
      ai = Math.floor(Math.random() * 4);
    } else {
      ai = q[r][c].indexOf(Math.max(...q[r][c]));
    }
    let nr = r + DIRS[ai].dr;
    let nc = c + DIRS[ai].dc;
    if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID || isWall(nr, nc)) {
      nr = r; nc = c;
    }
    const reward = REWARDS[nr][nc];
    const maxNextQ = isTerminal(nr, nc) ? 0 : Math.max(...q[nr][nc]);
    const newQ = q.map(row => row.map(cell => [...cell]));
    newQ[r][c][ai] += alpha * (reward + gamma * maxNextQ - newQ[r][c][ai]);
    return { q: newQ, nr, nc, done: isTerminal(nr, nc) };
  }, []);

  const runEpisode = useCallback(async () => {
    let r = 3, c = 0;
    let q = qTable.map(row => row.map(cell => [...cell]));
    let steps = 0;
    while (!isTerminal(r, c) && steps < 100 && runRef.current) {
      const result = step(q, r, c);
      q = result.q;
      r = result.nr;
      c = result.nc;
      steps++;
    }
    setQTable(q);
    setAgentR(r);
    setAgentC(c);
    setEpisodes(prev => prev + 1);
  }, [qTable, step]);

  const runMany = useCallback(async () => {
    runRef.current = true;
    setRunning(true);
    let q = qTable.map(row => row.map(cell => [...cell]));
    for (let ep = 0; ep < 50 && runRef.current; ep++) {
      let r = 3, c = 0;
      let steps = 0;
      while (!isTerminal(r, c) && steps < 100) {
        const result = step(q, r, c);
        q = result.q;
        r = result.nr;
        c = result.nc;
        steps++;
      }
      setQTable([...q.map(row => row.map(cell => [...cell]))]);
      setEpisodes(prev => prev + 1);
      setAgentR(r);
      setAgentC(c);
      await new Promise(res => setTimeout(res, 30));
    }
    setRunning(false);
    runRef.current = false;
  }, [qTable, step]);

  const stopRun = () => { runRef.current = false; setRunning(false); };

  const reset = () => {
    runRef.current = false;
    setRunning(false);
    setQTable(initQ());
    setAgentR(3);
    setAgentC(0);
    setEpisodes(0);
  };

  const maxQ = Math.max(1, ...qTable.flat().flat().map(Math.abs));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Q-Learning 实时学习演示
        </text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          α={alpha} γ={gamma} ε={epsilon} | 已训练 {episodes} 轮
        </text>

        {/* Q-Table grid */}
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const x = OX + c * (CELL + 2);
            const y = OY + r * (CELL + 2);
            if (isWall(r, c)) {
              return <rect key={`${r}-${c}`} x={x} y={y} width={CELL} height={CELL} fill={COLORS.mid} rx={4} />;
            }
            const maxQv = Math.max(...qTable[r][c]);
            const intensity = Math.min(1, Math.abs(maxQv) / maxQ);
            const bgColor = isTerminal(r, c)
              ? (REWARDS[r][c] > 0 ? '#d4edda' : COLORS.waste)
              : `rgba(21, 101, 192, ${intensity * 0.3})`;
            const isAgent = r === agentR && c === agentC;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={CELL} height={CELL} fill={bgColor}
                  stroke={isAgent ? COLORS.primary : COLORS.light} strokeWidth={isAgent ? 2 : 1} rx={4} />
                {/* Show Q values for each direction as small triangles */}
                {DIRS.map((d, di) => {
                  const qv = qTable[r][c][di];
                  const cx = x + CELL / 2 + (di === 1 ? 14 : di === 3 ? -14 : 0);
                  const cy = y + CELL / 2 + (di === 2 ? 14 : di === 0 ? -14 : 0);
                  return (
                    <text key={di} x={cx} y={cy + 3} textAnchor="middle" fontSize={7}
                      fill={qv > 0 ? COLORS.green : qv < 0 ? COLORS.red : COLORS.mid} fontFamily={FONTS.mono}>
                      {qv.toFixed(1)}
                    </text>
                  );
                })}
                {isAgent && (
                  <circle cx={x + CELL / 2} cy={y + CELL / 2} r={4} fill={COLORS.primary} />
                )}
              </g>
            );
          })
        )}

        {/* Controls */}
        {[
          { label: '训练 1 轮', x: 280, action: 'one' },
          { label: '训练 50 轮', x: 370, action: 'fifty' },
          { label: running ? '停止' : '重置', x: 460, action: running ? 'stop' : 'reset' },
        ].map(btn => (
          <g key={btn.action}
            onClick={() => {
              if (btn.action === 'one' && !running) runEpisode();
              else if (btn.action === 'fifty' && !running) runMany();
              else if (btn.action === 'stop') stopRun();
              else if (btn.action === 'reset') reset();
            }}
            style={{ cursor: 'pointer' }}>
            <rect x={btn.x} y={OY + GRID * (CELL + 2) + 10} width={80} height={28} rx={5}
              fill={btn.action === 'stop' ? COLORS.red : COLORS.primary} opacity={running && btn.action !== 'stop' && btn.action !== 'reset' ? 0.4 : 1} />
            <text x={btn.x + 40} y={OY + GRID * (CELL + 2) + 29} textAnchor="middle"
              fontSize={11} fontWeight={600} fill="#fff">{btn.label}</text>
          </g>
        ))}

        {/* Right side: Best policy derived from Q */}
        <text x={400} y={OY} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
          学到的策略
        </text>
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const x = 330 + c * 36;
            const y = OY + 8 + r * 36;
            if (isWall(r, c)) return <rect key={`p${r}-${c}`} x={x} y={y} width={32} height={32} fill={COLORS.mid} rx={3} />;
            const bestA = qTable[r][c].indexOf(Math.max(...qTable[r][c]));
            const allZero = qTable[r][c].every(v => v === 0);
            return (
              <g key={`p${r}-${c}`}>
                <rect x={x} y={y} width={32} height={32} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={3} />
                <text x={x + 16} y={y + 22} textAnchor="middle" fontSize={16} fontWeight={700}
                  fill={allZero ? COLORS.mid : COLORS.primary}>
                  {isTerminal(r, c) ? '★' : allZero ? '·' : DIRS[bestA].name}
                </text>
              </g>
            );
          })
        )}

        <text x={30} y={H - 10} fontSize={9} fill={COLORS.mid}>
          每格四角显示 Q(s,a) 值 | 颜色深浅 = Q 值大小 | ε-greedy 探索
        </text>
      </svg>
    </div>
  );
}
