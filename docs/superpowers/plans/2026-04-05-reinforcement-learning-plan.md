# 强化学习：从基础到 LLM 对齐与推理 — Implementation Plan (Part 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 7-article learning path covering RL foundations through LLM alignment and test-time scaling, with 41 interactive SVG/React components.

**Architecture:** Each article is an MDX file with 5-6 interactive React components rendered via Astro Islands (`client:visible`). Components use SVG with `viewBox` for responsive sizing, shared color/font tokens, and `useState` for interactivity. StepNavigator primitive handles multi-step explanations.

**Tech Stack:** Astro 5, MDX, React 18, TypeScript, SVG, Motion (motion/react), Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-05-reinforcement-learning-design.md`

---

## File Structure

### Path YAML
- Create: `src/content/paths/reinforcement-learning.yaml`

### Article 1: 强化学习基础 (rl-foundations)
- Create: `src/components/interactive/AgentEnvironmentLoop.tsx`
- Create: `src/components/interactive/MDPGridWorld.tsx`
- Create: `src/components/interactive/BellmanBackup.tsx`
- Create: `src/components/interactive/ValuePolicyViz.tsx`
- Create: `src/components/interactive/QLearningDemo.tsx`
- Create: `src/components/interactive/RLTaxonomy.tsx`
- Create: `src/content/articles/zh/rl-foundations.mdx`

### Article 2: Policy Gradient (policy-gradient)
- Create: `src/components/interactive/PolicyGradientIntuition.tsx`
- Create: `src/components/interactive/REINFORCETrajectory.tsx`
- Create: `src/components/interactive/VarianceProblem.tsx`
- Create: `src/components/interactive/BaselineEffect.tsx`
- Create: `src/components/interactive/AdvantageExplainer.tsx`
- Create: `src/components/interactive/PGAlgorithmFamily.tsx`
- Create: `src/content/articles/zh/policy-gradient.mdx`

---

## Task 1: Path YAML

**Files:**
- Create: `src/content/paths/reinforcement-learning.yaml`

- [ ] **Step 1: Create path YAML**

```yaml
id: reinforcement-learning
title:
  zh: "强化学习：从基础到 LLM 对齐与推理"
  en: "Reinforcement Learning: From Foundations to LLM Alignment & Reasoning"
description:
  zh: "从 MDP 到 Policy Gradient，从 RLHF 到 GRPO，从 Reward 设计到 Test-Time Scaling，系统理解强化学习如何驱动大语言模型的对齐、优化与推理能力。"
  en: "From MDP to Policy Gradient, from RLHF to GRPO, from Reward Modeling to Test-Time Scaling — a systematic guide to how reinforcement learning drives LLM alignment, optimization, and reasoning."
level: advanced
articles:
  - rl-foundations
  - policy-gradient
  - ppo-actor-critic
  - rlhf
  - direct-preference-optimization
  - reward-modeling
  - test-time-scaling
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/paths/reinforcement-learning.yaml
git commit -m "feat: add reinforcement-learning path YAML"
```

---

## Task 2: AgentEnvironmentLoop

**Files:**
- Create: `src/components/interactive/AgentEnvironmentLoop.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Step {
  action: string;
  state: string;
  reward: number;
}

const ACTIONS = ['向上', '向右', '向下', '向左'];

export default function AgentEnvironmentLoop() {
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
    'S₀': { x: 160, y: 190, label: '起点' },
    'S₁': { x: 160, y: 70, label: '上方' },
    'S₂': { x: 300, y: 190, label: '右侧' },
    'S₃': { x: 160, y: 310, label: '陷阱' },
    'S₄': { x: 300, y: 70, label: '目标' },
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Agent-Environment 交互循环
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
          选择动作
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
          Trajectory
        </text>
        {trajectory.slice(-4).map((step, i) => (
          <text key={i} x={400} y={248 + i * 18} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
            {step.action} → {step.state} (r={step.reward > 0 ? '+' : ''}{step.reward})
          </text>
        ))}

        {/* Total reward */}
        <text x={440} y={330} textAnchor="middle" fontSize={13} fontWeight={700}
          fill={totalReward > 0 ? COLORS.green : totalReward < 0 ? COLORS.red : COLORS.dark}>
          累积奖励: {totalReward > 0 ? '+' : ''}{totalReward}
        </text>

        {/* Reset button */}
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={410} y={342} width={60} height={26} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={440} y={359} textAnchor="middle" fontSize={11} fill={COLORS.dark}>重置</text>
        </g>

        {/* Legend */}
        <text x={30} y={H - 10} fontSize={9} fill={COLORS.mid}>
          点击动作按钮控制 Agent 移动 | S₄=目标(+5) | S₃=陷阱(-1)
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No TypeScript errors for AgentEnvironmentLoop

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/AgentEnvironmentLoop.tsx
git commit -m "feat(rl): add AgentEnvironmentLoop component"
```

---

## Task 3: MDPGridWorld

**Files:**
- Create: `src/components/interactive/MDPGridWorld.tsx`

- [ ] **Step 1: Create component**

```tsx
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

export default function MDPGridWorld() {
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
          MDP Grid World — 马尔可夫决策过程
        </text>
        <text x={W / 2} y={44} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          γ = {gamma} | 每步 reward = -0.04 | 目标 +1 | 陷阱 -1
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
          轨迹 (Trajectory)
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
            {grid[agentR][agentC].reward > 0 ? '🎯 到达目标！' : '💥 掉入陷阱！'}
          </text>
        )}
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={370} y={H - 48} width={60} height={26} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={400} y={H - 31} textAnchor="middle" fontSize={11} fill={COLORS.dark}>重置</text>
        </g>

        <text x={30} y={H - 8} fontSize={9} fill={COLORS.mid}>
          使用方向键控制 Agent | 蓝色圆点 = Agent 位置
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/MDPGridWorld.tsx
git commit -m "feat(rl): add MDPGridWorld component"
```

---

## Task 4: BellmanBackup (StepNavigator)

**Files:**
- Create: `src/components/interactive/BellmanBackup.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function BellmanBackup() {
  const steps = [
    {
      title: '单步 Backup 直觉',
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Bellman Backup：从下一个状态"回传"价值
          </text>
          {/* Current state */}
          <circle cx={120} cy={100} r={30} fill={COLORS.highlight} stroke={COLORS.primary} strokeWidth={2} />
          <text x={120} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>s</text>
          <text x={120} y={112} textAnchor="middle" fontSize={10} fill={COLORS.mid}>V(s) = ?</text>

          {/* Arrow */}
          <line x1={155} y1={90} x2={220} y2={70} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrow1)" />
          <line x1={155} y1={100} x2={220} y2={100} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrow1)" />
          <line x1={155} y1={110} x2={220} y2={130} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrow1)" />
          <defs>
            <marker id="arrow1" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
            </marker>
          </defs>

          {/* Next states */}
          {[{ y: 60, label: "s'₁", v: '3.0', r: '+1' }, { y: 100, label: "s'₂", v: '1.0', r: '0' }, { y: 140, label: "s'₃", v: '2.0', r: '+2' }].map((s, i) => (
            <g key={i}>
              <circle cx={260} cy={s.y} r={24} fill={COLORS.valid} stroke={COLORS.mid} strokeWidth={1.5} />
              <text x={260} y={s.y - 4} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>{s.label}</text>
              <text x={260} y={s.y + 12} textAnchor="middle" fontSize={9} fill={COLORS.mid}>V={s.v}</text>
              <text x={210} y={s.y - 6} textAnchor="middle" fontSize={9} fill={COLORS.orange}>r={s.r}</text>
            </g>
          ))}

          {/* Formula */}
          <text x={380} y={80} fontSize={12} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
            V(s) = max_a Σ P(s'|s,a)
          </text>
          <text x={380} y={100} fontSize={12} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
                 × [R + γ·V(s')]
          </text>
          <text x={380} y={130} fontSize={11} fill={COLORS.mid}>
            当前价值 = 即时奖励 + 折扣未来价值
          </text>
          <rect x={370} y={145} width={190} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={465} y={163} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.orange}>
            核心直觉：价值来自未来
          </text>
          <text x={465} y={178} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            好的状态 = 能到达高奖励状态的状态
          </text>
        </svg>
      ),
    },
    {
      title: '递推展开',
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            递推展开：Bellman 方程层层回传
          </text>

          {/* Chain of states */}
          {[
            { x: 60, label: 's₀', v: '?', col: COLORS.highlight },
            { x: 170, label: 's₁', v: '?', col: COLORS.highlight },
            { x: 280, label: 's₂', v: '?', col: COLORS.highlight },
            { x: 390, label: 's₃', v: '10', col: '#d4edda' },
            { x: 500, label: 'sₜ', v: '0', col: COLORS.masked },
          ].map((s, i) => (
            <g key={i}>
              <circle cx={s.x} cy={100} r={28} fill={s.col} stroke={COLORS.mid} strokeWidth={1.5} />
              <text x={s.x} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>{s.label}</text>
              <text x={s.x} y={112} textAnchor="middle" fontSize={10} fill={COLORS.mid}>V={s.v}</text>
              {i < 4 && (
                <>
                  <line x1={s.x + 30} y1={100} x2={s.x + 78} y2={100} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrow2)" />
                  <text x={s.x + 55} y={90} textAnchor="middle" fontSize={9} fill={COLORS.orange}>
                    r{i + 1}, γ
                  </text>
                </>
              )}
            </g>
          ))}
          <defs>
            <marker id="arrow2" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
            </marker>
          </defs>

          {/* Backward arrows */}
          {[390, 280, 170, 60].map((x, i) => (
            <path key={i}
              d={`M ${x} 135 Q ${x - 55} 170 ${x - 110} 135`}
              fill="none" stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="4 3"
              markerEnd="url(#arrow2g)" />
          ))}
          <defs>
            <marker id="arrow2g" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
            </marker>
          </defs>

          <text x={W / 2} y={190} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.green}>
            ← 价值从终点向起点回传（Backup）
          </text>
          <text x={W / 2} y={210} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
            V(s₂) = r₃ + γ·V(s₃) → V(s₁) = r₂ + γ·V(s₂) → V(s₀) = r₁ + γ·V(s₁)
          </text>
        </svg>
      ),
    },
    {
      title: '收敛到最优值',
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Value Iteration：反复 Backup 直到收敛
          </text>

          {/* Iteration visualization */}
          {['迭代 1', '迭代 2', '迭代 3', '...', '收敛'].map((label, i) => {
            const x = 40 + i * 110;
            const colors = [
              [COLORS.masked, COLORS.masked, COLORS.masked, '#d4edda'],
              [COLORS.masked, COLORS.masked, COLORS.highlight, '#d4edda'],
              [COLORS.masked, COLORS.highlight, COLORS.highlight, '#d4edda'],
              [],
              [COLORS.valid, COLORS.valid, COLORS.valid, '#d4edda'],
            ];
            return (
              <g key={i}>
                <text x={x + 20} y={60} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>{label}</text>
                {i !== 3 && colors[i].map((c, j) => (
                  <rect key={j} x={x} y={70 + j * 28} width={40} height={22} rx={4}
                    fill={c} stroke={COLORS.mid} strokeWidth={1} />
                ))}
                {i === 3 && (
                  <text x={x + 20} y={110} textAnchor="middle" fontSize={20} fill={COLORS.mid}>⋯</text>
                )}
                {i < 4 && (
                  <text x={x + 60} y={110} textAnchor="middle" fontSize={16} fill={COLORS.mid}>→</text>
                )}
              </g>
            );
          })}

          <rect x={40} y={170} width={500} height={40} rx={6} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={W / 2} y={187} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.primary}>
            反复应用 Bellman 方程（Backup），每次迭代更新所有状态的 V 值
          </text>
          <text x={W / 2} y={203} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
            当所有状态的 V 值不再变化时 → 收敛到最优值函数 V*(s)
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/BellmanBackup.tsx
git commit -m "feat(rl): add BellmanBackup StepNavigator component"
```

---

## Task 5: ValuePolicyViz

**Files:**
- Create: `src/components/interactive/ValuePolicyViz.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;
const GRID = 4;
const CELL = 56;

export default function ValuePolicyViz() {
  const [values, setValues] = useState<number[][]>([
    [3.0, 2.5, 2.0, 0],
    [2.5, 0, 1.5, 0],
    [2.0, 1.5, 1.0, -0.5],
    [1.5, 1.0, 0.5, 0.0],
  ]);

  // Derive policy from values: pick direction of neighbor with highest value
  const DIRS = [
    { dr: -1, dc: 0, arrow: '↑' },
    { dr: 0, dc: 1, arrow: '→' },
    { dr: 1, dc: 0, arrow: '↓' },
    { dr: 0, dc: -1, arrow: '←' },
  ];

  const getPolicy = (r: number, c: number): string => {
    if ((r === 0 && c === 3) || (r === 1 && c === 1)) return '·';
    let best = -Infinity;
    let arrow = '·';
    for (const d of DIRS) {
      const nr = r + d.dr, nc = c + d.dc;
      if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID && !(nr === 1 && nc === 1)) {
        if (values[nr][nc] > best) {
          best = values[nr][nc];
          arrow = d.arrow;
        }
      }
    }
    return arrow;
  };

  const maxV = Math.max(...values.flat());
  const minV = Math.min(...values.flat().filter(v => v !== 0 || true));

  const valToColor = (v: number): string => {
    const t = maxV === minV ? 0.5 : (v - minV) / (maxV - minV);
    const r = Math.round(255 - t * 100);
    const g = Math.round(255 - t * 40);
    const b = Math.round(255 - t * 100);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const adjustValue = (r: number, c: number, delta: number) => {
    if ((r === 0 && c === 3) || (r === 1 && c === 1)) return;
    setValues(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = Math.round((next[r][c] + delta) * 10) / 10;
      return next;
    });
  };

  const OX1 = 20, OX2 = 310, OY = 60;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Value Function ↔ Policy 对照
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          点击格子 +/- 调整 V 值，观察策略箭头如何跟随变化
        </text>

        {/* Value heatmap */}
        <text x={OX1 + (GRID * CELL) / 2} y={OY - 6} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
          Value Function V(s)
        </text>
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const x = OX1 + c * CELL;
            const y = OY + r * CELL;
            const isWall = r === 1 && c === 1;
            const isGoal = r === 0 && c === 3;
            return (
              <g key={`v-${r}-${c}`}>
                <rect x={x} y={y} width={CELL} height={CELL}
                  fill={isWall ? COLORS.mid : valToColor(values[r][c])}
                  stroke={COLORS.light} strokeWidth={1} />
                {!isWall && (
                  <>
                    <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle"
                      fontSize={12} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
                      {values[r][c].toFixed(1)}
                    </text>
                    {!isGoal && (
                      <>
                        <text x={x + 10} y={y + 14} fontSize={10} fill={COLORS.primary}
                          style={{ cursor: 'pointer' }} onClick={() => adjustValue(r, c, 0.5)}>+</text>
                        <text x={x + CELL - 14} y={y + 14} fontSize={10} fill={COLORS.red}
                          style={{ cursor: 'pointer' }} onClick={() => adjustValue(r, c, -0.5)}>−</text>
                      </>
                    )}
                  </>
                )}
              </g>
            );
          })
        )}

        {/* Policy arrows */}
        <text x={OX2 + (GRID * CELL) / 2} y={OY - 6} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
          Policy π(s)
        </text>
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const x = OX2 + c * CELL;
            const y = OY + r * CELL;
            const isWall = r === 1 && c === 1;
            return (
              <g key={`p-${r}-${c}`}>
                <rect x={x} y={y} width={CELL} height={CELL}
                  fill={isWall ? COLORS.mid : COLORS.bgAlt}
                  stroke={COLORS.light} strokeWidth={1} />
                {!isWall && (
                  <text x={x + CELL / 2} y={y + CELL / 2 + 6} textAnchor="middle"
                    fontSize={22} fontWeight={700} fill={COLORS.primary}>
                    {getPolicy(r, c)}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Legend */}
        <text x={30} y={H - 12} fontSize={9} fill={COLORS.mid}>
          深色 = 高价值 | 浅色 = 低价值 | 策略箭头指向最高价值邻居 | 修改 V 值观察策略变化
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/ValuePolicyViz.tsx
git commit -m "feat(rl): add ValuePolicyViz component"
```

---

## Task 6: QLearningDemo

**Files:**
- Create: `src/components/interactive/QLearningDemo.tsx`

- [ ] **Step 1: Create component**

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/QLearningDemo.tsx
git commit -m "feat(rl): add QLearningDemo component"
```

---

## Task 7: RLTaxonomy

**Files:**
- Create: `src/components/interactive/RLTaxonomy.tsx`

- [ ] **Step 1: Create component**

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/RLTaxonomy.tsx
git commit -m "feat(rl): add RLTaxonomy component"
```

---

## Task 8: Article 1 MDX — rl-foundations

**Files:**
- Create: `src/content/articles/zh/rl-foundations.mdx`

- [ ] **Step 1: Create article MDX**

```mdx
---
title: "强化学习基础：从 Agent 到 Bellman 方程"
slug: rl-foundations
locale: zh
tags: [reinforcement-learning, mdp, bellman-equation, value-function, q-learning]
difficulty: intermediate
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: []
references:
  - type: book
    title: "Reinforcement Learning: An Introduction (Sutton & Barto, 2nd Edition)"
    url: "http://incompleteideas.net/book/the-book-2nd.html"
  - type: course
    title: "David Silver UCL Reinforcement Learning Course"
    url: "https://www.davidsilver.uk/teaching/"
  - type: website
    title: "OpenAI Spinning Up: Introduction to RL"
    url: "https://spinningup.openai.com/en/latest/spinningup/rl_intro.html"
  - type: course
    title: "Hugging Face Deep RL Course"
    url: "https://huggingface.co/learn/deep-rl-course"
  - type: blog
    title: "A (Long) Peek into Reinforcement Learning — Lilian Weng"
    url: "https://lilianweng.github.io/posts/2018-02-19-rl-overview/"
  - type: course
    title: "UC Berkeley CS285: Deep Reinforcement Learning"
    url: "http://rail.eecs.berkeley.edu/deeprlcourse/"
  - type: blog
    title: "Deep Reinforcement Learning: Pong from Pixels — Andrej Karpathy"
    url: "https://karpathy.github.io/2016/05/31/rl/"
---

import AgentEnvironmentLoop from '../../../components/interactive/AgentEnvironmentLoop.tsx';
import MDPGridWorld from '../../../components/interactive/MDPGridWorld.tsx';
import BellmanBackup from '../../../components/interactive/BellmanBackup.tsx';
import ValuePolicyViz from '../../../components/interactive/ValuePolicyViz.tsx';
import QLearningDemo from '../../../components/interactive/QLearningDemo.tsx';
import RLTaxonomy from '../../../components/interactive/RLTaxonomy.tsx';

## 什么是强化学习

强化学习 (Reinforcement Learning, RL) 是机器学习的第三大范式，与监督学习和无监督学习并列。它的核心思想简单而深刻：**一个 Agent（智能体）在 Environment（环境）中通过不断试错来学习最优行为策略**。

与监督学习的关键区别在于：
- **没有标签**：没人告诉 Agent 正确答案是什么，它只能从环境的奖励信号中学习
- **延迟奖励**：一个好的决策可能要很久以后才能看到效果（比如下棋的开局布局）
- **探索-利用困境**（Exploration-Exploitation Dilemma）：Agent 必须在"尝试新策略"和"使用已知好策略"之间平衡

<AgentEnvironmentLoop client:visible />

在每个时间步，这个循环不断重复：
1. Agent 观察当前**状态** (State) $s_t$
2. Agent 根据策略选择一个**动作** (Action) $a_t$
3. 环境返回**奖励** (Reward) $r_t$ 和新状态 $s_{t+1}$
4. Agent 根据经验调整策略

## 马尔可夫决策过程 (MDP)

RL 的数学基础是**马尔可夫决策过程**（Markov Decision Process, MDP），由五元组 $(S, A, P, R, \gamma)$ 定义：

- **$S$**：状态空间（所有可能的状态集合）
- **$A$**：动作空间（所有可能的动作集合）
- **$P(s'|s,a)$**：状态转移概率（在状态 $s$ 执行动作 $a$ 后转移到 $s'$ 的概率）
- **$R(s,a,s')$**：奖励函数（状态转移时获得的即时奖励）
- **$\gamma \in [0,1)$**：折扣因子（未来奖励的衰减系数，越远的奖励价值越低）

"马尔可夫"的含义是**无记忆性**：下一个状态只取决于当前状态和动作，不取决于历史。这个假设让问题变得可解。

<MDPGridWorld client:visible />

## 策略与价值函数

有了 MDP 的框架，我们需要定义 Agent 的行为模式和评估标准：

**策略 (Policy)** $\pi(a|s)$：在状态 $s$ 下选择动作 $a$ 的概率分布。策略可以是确定性的（每个状态固定一个动作）或随机的（概率分布）。

**状态价值函数 (State Value Function)** $V^\pi(s)$：从状态 $s$ 开始，遵循策略 $\pi$ 能获得的期望累积折扣奖励：

$$V^\pi(s) = \mathbb{E}_\pi\left[\sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s\right]$$

**动作价值函数 (Action Value Function)** $Q^\pi(s,a)$：在状态 $s$ 执行动作 $a$ 后，遵循策略 $\pi$ 的期望回报：

$$Q^\pi(s,a) = \mathbb{E}_\pi\left[\sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s, a_0 = a\right]$$

两者的关系：$V^\pi(s) = \sum_a \pi(a|s) \cdot Q^\pi(s,a)$ — 状态价值等于所有动作的 Q 值按策略概率加权。

## Bellman 方程

Bellman 方程是 RL 最核心的递推关系。它的直觉很简单：**一个状态的价值 = 即时奖励 + 折扣后的下一状态价值**。

$$V^\pi(s) = \sum_a \pi(a|s) \sum_{s'} P(s'|s,a) \left[R(s,a,s') + \gamma V^\pi(s')\right]$$

最优 Bellman 方程（取最优动作而非按策略概率加权）：

$$V^*(s) = \max_a \sum_{s'} P(s'|s,a) \left[R(s,a,s') + \gamma V^*(s')\right]$$

<BellmanBackup client:visible />

## Value-Based 方法

Value-Based 方法的核心思路是：**先学到准确的 Q 函数，再从中推导最优策略**（贪心：选 Q 值最大的动作）。

**Q-Learning** 是最经典的 Value-Based 算法，它的更新规则是：

$$Q(s,a) \leftarrow Q(s,a) + \alpha \left[r + \gamma \max_{a'} Q(s',a') - Q(s,a)\right]$$

其中 $\alpha$ 是学习率。这个更新规则直接逼近最优 Q 函数，不需要知道环境的转移概率（model-free）。

当状态空间很大时（比如图像输入），用表格存储 Q 值不现实。**DQN**（Deep Q-Network）用神经网络近似 Q 函数，是深度强化学习的里程碑之作。

<QLearningDemo client:visible />

<ValuePolicyViz client:visible />

## 从 Value 到 Policy

Q-Learning 和 DQN 在 Atari 游戏等离散动作空间中非常成功，但它们有一个根本限制：**不适合 LLM 这样的场景**。

原因是 LLM 的"动作空间"是整个词汇表（通常 32K-128K tokens），而且是序列决策——生成一个 token 后要生成下一个。用 Q-Learning 需要对每个 token 计算 Q 值，计算量巨大且不自然。

更自然的方式是**直接参数化策略**：让一个网络直接输出"在当前状态下，每个动作的概率"——这正是 LLM 已经在做的事情（next-token prediction 就是一个策略）。

这就是 **Policy Gradient** 方法的动机，也是下一篇文章的主题。

## RL 方法全景

<RLTaxonomy client:visible />

从图中可以看到，LLM 对齐（RLHF、DPO、GRPO）走的是 **Policy-Based → Actor-Critic → PPO** 这条路线，而不是 Value-Based 路线。理解这个演进路径是学习后续内容的关键。

## 推荐学习资源

如果你想更深入地学习强化学习，以下是我们精选的资源：

### 经典教材
- **Sutton & Barto《Reinforcement Learning: An Introduction》（第二版）** — RL 领域的圣经，免费在线阅读。适合系统学习 MDP、动态规划、蒙特卡洛方法、TD 学习等基础内容。
- **Csaba Szepesvári《Algorithms for Reinforcement Learning》** — 更偏数学的简明教材，适合喜欢理论推导的读者。

### 视频课程
- **David Silver UCL RL 课程** — DeepMind 首席科学家的经典课程，10 讲涵盖从基础到函数近似、策略梯度。每讲约 1.5 小时，配合 slides 效果最佳。
- **Sergey Levine UC Berkeley CS285** — 深度强化学习课程，偏研究前沿，覆盖 model-based RL、offline RL 等高级主题。
- **Hugging Face Deep RL Course** — 免费交互课程，边学边实践，有配套代码和作业环境。非常适合动手学习者。
- **Stanford CS234** — Emma Brunskill 主讲，更偏理论和分析。

### 博客与教程
- **Lilian Weng 博客系列** — 覆盖 RL 基础、Policy Gradient、RLHF、Reward Hacking 等主题，每篇都是高质量综述，图文并茂。
- **OpenAI Spinning Up** — 官方 RL 入门教程，从概念到代码实现，特别适合想从零开始理解算法细节的人。
- **Andrej Karpathy "Pong from Pixels"** — 经典入门博文，从零用 Policy Gradient 训练 Pong 游戏，直觉解释极佳。
- **Nathan Lambert (interconnects.ai)** — 专注 RLHF 和 LLM 对齐领域的深度博客，追踪最新研究动态。
- **Chip Huyen 的 RLHF 综述** — 面向工程师的 RLHF 入门文章，清晰直接。

### 交互实验
- **Gymnasium (原 OpenAI Gym)** — RL 标准环境库，提供 CartPole、MountainCar 等经典环境。
- **CleanRL** — 单文件 RL 实现，每个算法一个文件，适合学习和修改。

## 总结

本文介绍了强化学习的核心概念：
1. **Agent-Environment 循环**是 RL 的基本框架
2. **MDP** 为 RL 提供数学基础（状态、动作、转移、奖励、折扣）
3. **Bellman 方程**是价值函数的递推关系，是几乎所有 RL 算法的基础
4. **Q-Learning / DQN** 是经典的 Value-Based 方法
5. LLM 的特殊性（巨大动作空间、序列决策）使得 **Policy-Based 方法**更为适合

下一篇，我们将深入 Policy Gradient，理解如何直接优化策略——这是连接经典 RL 和 LLM 对齐的关键桥梁。
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/rl-foundations.mdx
git commit -m "feat(rl): add rl-foundations article with 6 components"
```

---

## Task 9: PolicyGradientIntuition

**Files:**
- Create: `src/components/interactive/PolicyGradientIntuition.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function PolicyGradientIntuition() {
  const [probs, setProbs] = useState([0.25, 0.25, 0.25, 0.25]);
  const [lastAction, setLastAction] = useState<number | null>(null);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [history, setHistory] = useState<{ action: number; reward: number }[]>([]);

  const actions = ['动作 A', '动作 B', '动作 C', '动作 D'];
  const trueRewards = [0.2, 0.8, -0.5, 0.1]; // hidden expected rewards
  const barW = 80;
  const barMaxH = 160;
  const ox = 60;
  const oy = 60;

  const sampleReward = (ai: number) => {
    return trueRewards[ai] + (Math.random() - 0.5) * 0.6;
  };

  const takeAction = (ai: number) => {
    const reward = Math.round(sampleReward(ai) * 100) / 100;
    setLastAction(ai);
    setLastReward(reward);
    setHistory(prev => [...prev, { action: ai, reward }]);

    // Policy gradient update: increase prob of positive reward actions
    const lr = 0.1;
    const newProbs = probs.map((p, i) => {
      if (i === ai) return p + lr * reward * (1 - p);
      return p - lr * reward * p;
    });
    // Normalize
    const sum = newProbs.reduce((a, b) => a + Math.max(0.01, b), 0);
    setProbs(newProbs.map(p => Math.max(0.01, p) / sum));
  };

  const reset = () => {
    setProbs([0.25, 0.25, 0.25, 0.25]);
    setLastAction(null);
    setLastReward(null);
    setHistory([]);
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Policy Gradient 直觉：概率分布随 Reward 调整
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          点击动作获得 reward → 正 reward 推高概率，负 reward 压低概率
        </text>

        {/* Probability bars */}
        {probs.map((p, i) => {
          const x = ox + i * (barW + 20);
          const h = p * barMaxH;
          const isLast = lastAction === i;
          return (
            <g key={i} onClick={() => takeAction(i)} style={{ cursor: 'pointer' }}>
              <rect x={x} y={oy + barMaxH - h} width={barW} height={h} rx={4}
                fill={isLast ? (lastReward! > 0 ? COLORS.green : COLORS.red) : COLORS.primary}
                opacity={isLast ? 1 : 0.7} />
              <rect x={x} y={oy} width={barW} height={barMaxH} rx={4}
                fill="none" stroke={COLORS.light} strokeWidth={1} />
              <text x={x + barW / 2} y={oy + barMaxH + 18} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
                {actions[i]}
              </text>
              <text x={x + barW / 2} y={oy + barMaxH + 34} textAnchor="middle" fontSize={11} fill={COLORS.mid} fontFamily={FONTS.mono}>
                π = {(p * 100).toFixed(1)}%
              </text>
              <text x={x + barW / 2} y={oy + barMaxH - h - 6} textAnchor="middle" fontSize={10} fontWeight={600}
                fill={COLORS.dark} fontFamily={FONTS.mono}>
                {p.toFixed(3)}
              </text>
            </g>
          );
        })}

        {/* Last action result */}
        {lastAction !== null && lastReward !== null && (
          <g>
            <rect x={420} y={oy} width={140} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={490} y={oy + 18} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
              上次：{actions[lastAction]}
            </text>
            <text x={490} y={oy + 38} textAnchor="middle" fontSize={13} fontWeight={700}
              fill={lastReward > 0 ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
              reward = {lastReward > 0 ? '+' : ''}{lastReward.toFixed(2)}
            </text>
          </g>
        )}

        {/* Gradient explanation */}
        <rect x={420} y={oy + 60} width={140} height={60} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={490} y={oy + 78} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
          策略梯度核心
        </text>
        <text x={490} y={oy + 94} textAnchor="middle" fontSize={9} fill={COLORS.dark} fontFamily={FONTS.mono}>
          ∇J ≈ ∇log π(a|s) · R
        </text>
        <text x={490} y={oy + 110} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          R{'>'}0: 推高 π(a) | R{'<'}0: 压低 π(a)
        </text>

        {/* History sparkline */}
        <text x={420} y={oy + 140} fontSize={10} fontWeight={600} fill={COLORS.dark}>
          reward 历史 ({history.length} 步)
        </text>
        {history.slice(-20).map((h, i) => (
          <rect key={i} x={420 + i * 7} y={oy + 148} width={5}
            height={Math.abs(h.reward) * 30}
            transform={h.reward < 0 ? `translate(0, 0)` : `translate(0, ${-Math.abs(h.reward) * 30})`}
            fill={h.reward > 0 ? COLORS.green : COLORS.red} opacity={0.7} rx={1} />
        ))}

        {/* Reset */}
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={460} y={H - 40} width={60} height={24} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={490} y={H - 24} textAnchor="middle" fontSize={11} fill={COLORS.dark}>重置</text>
        </g>

        <text x={30} y={H - 10} fontSize={9} fill={COLORS.mid}>
          每个动作有隐藏的期望 reward | 多次点击观察策略如何收敛到最优动作
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/PolicyGradientIntuition.tsx
git commit -m "feat(rl): add PolicyGradientIntuition component"
```

---

## Task 10: REINFORCETrajectory

**Files:**
- Create: `src/components/interactive/REINFORCETrajectory.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface Step {
  state: string;
  action: string;
  reward: number;
}

export default function REINFORCETrajectory() {
  const [trajectories, setTrajectories] = useState<{ steps: Step[]; totalReturn: number }[]>([]);
  const [sampling, setSampling] = useState(false);
  const gamma = 0.9;

  const sampleTrajectory = (): { steps: Step[]; totalReturn: number } => {
    const states = ['s₀', 's₁', 's₂', 's₃', 's₄'];
    const actions = ['a₁', 'a₂'];
    const steps: Step[] = [];
    let totalReturn = 0;

    for (let i = 0; i < 4; i++) {
      const action = actions[Math.random() > 0.5 ? 0 : 1];
      const reward = Math.round((Math.random() * 2 - 0.5) * 100) / 100;
      steps.push({ state: states[i], action, reward });
    }

    // Calculate discounted return for each step
    for (let i = steps.length - 1; i >= 0; i--) {
      totalReturn = steps[i].reward + gamma * totalReturn;
    }
    return { steps, totalReturn: Math.round(totalReturn * 100) / 100 };
  };

  const sample = () => {
    setSampling(true);
    setTimeout(() => {
      const traj = sampleTrajectory();
      setTrajectories(prev => [...prev.slice(-4), traj]);
      setSampling(false);
    }, 200);
  };

  const reset = () => {
    setTrajectories([]);
  };

  const ox = 30, oy = 70;
  const stepW = 120;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          REINFORCE：采样 Trajectory → 计算 Return → 更新
        </text>
        <text x={W / 2} y={44} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          γ = {gamma} | 每次采样一条完整轨迹，计算折扣回报
        </text>

        {/* Current trajectory visualization */}
        {trajectories.length > 0 && (
          <g>
            {trajectories[trajectories.length - 1].steps.map((step, i) => {
              const x = ox + i * stepW;
              return (
                <g key={i}>
                  {/* State node */}
                  <circle cx={x + 20} cy={oy + 20} r={18} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
                  <text x={x + 20} y={oy + 24} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
                    {step.state}
                  </text>
                  {/* Action arrow */}
                  {i < 3 && (
                    <>
                      <line x1={x + 40} y1={oy + 20} x2={x + stepW} y2={oy + 20}
                        stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowRF)" />
                      <text x={x + 70} y={oy + 12} textAnchor="middle" fontSize={9} fill={COLORS.orange} fontFamily={FONTS.mono}>
                        {step.action}
                      </text>
                    </>
                  )}
                  {/* Reward */}
                  <text x={x + 20} y={oy + 52} textAnchor="middle" fontSize={10} fontFamily={FONTS.mono}
                    fill={step.reward > 0 ? COLORS.green : COLORS.red}>
                    r={step.reward > 0 ? '+' : ''}{step.reward}
                  </text>
                </g>
              );
            })}
            <defs>
              <marker id="arrowRF" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* Return */}
            <rect x={ox + 4 * stepW - 80} y={oy} width={100} height={40} rx={6}
              fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
            <text x={ox + 4 * stepW - 30} y={oy + 16} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
              G₀ (Return)
            </text>
            <text x={ox + 4 * stepW - 30} y={oy + 33} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily={FONTS.mono}
              fill={trajectories[trajectories.length - 1].totalReturn > 0 ? COLORS.green : COLORS.red}>
              {trajectories[trajectories.length - 1].totalReturn > 0 ? '+' : ''}
              {trajectories[trajectories.length - 1].totalReturn}
            </text>
          </g>
        )}

        {/* Historical returns (showing variance) */}
        <text x={ox} y={oy + 90} fontSize={12} fontWeight={600} fill={COLORS.dark}>
          历史采样 Return 分布（观察方差）
        </text>
        {trajectories.map((traj, i) => {
          const x = ox + i * 110;
          const barH = Math.abs(traj.totalReturn) * 40;
          const isPositive = traj.totalReturn > 0;
          return (
            <g key={i}>
              <rect x={x} y={isPositive ? oy + 130 - barH : oy + 130}
                width={90} height={barH} rx={4}
                fill={isPositive ? COLORS.green : COLORS.red} opacity={i === trajectories.length - 1 ? 0.9 : 0.4} />
              <text x={x + 45} y={oy + 150} textAnchor="middle" fontSize={10} fontFamily={FONTS.mono}
                fill={COLORS.dark}>
                {traj.totalReturn > 0 ? '+' : ''}{traj.totalReturn}
              </text>
              <text x={x + 45} y={oy + 164} textAnchor="middle" fontSize={8} fill={COLORS.mid}>
                采样 {i + 1}
              </text>
            </g>
          );
        })}

        {/* REINFORCE pseudocode */}
        <rect x={ox} y={oy + 180} width={520} height={70} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={ox + 10} y={oy + 198} fontSize={10} fontWeight={600} fill={COLORS.dark}>
          REINFORCE 更新规则：
        </text>
        <text x={ox + 10} y={oy + 216} fontSize={10} fontFamily={FONTS.mono} fill={COLORS.primary}>
          θ ← θ + α · ∇log π(aₜ|sₜ;θ) · Gₜ
        </text>
        <text x={ox + 10} y={oy + 236} fontSize={9} fill={COLORS.mid}>
          Gₜ {'>'} 0 → 增大该动作概率 | Gₜ {'<'} 0 → 减小该动作概率 | 多次采样才能得到可靠的梯度估计
        </text>

        {/* Controls */}
        <g onClick={sample} style={{ cursor: sampling ? 'default' : 'pointer' }}>
          <rect x={ox} y={H - 42} width={100} height={28} rx={5}
            fill={sampling ? COLORS.masked : COLORS.primary} />
          <text x={ox + 50} y={H - 24} textAnchor="middle" fontSize={12} fontWeight={600} fill="#fff">
            {sampling ? '采样中...' : '采样轨迹'}
          </text>
        </g>
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={ox + 120} y={H - 42} width={60} height={28} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={ox + 150} y={H - 24} textAnchor="middle" fontSize={11} fill={COLORS.dark}>重置</text>
        </g>

        <text x={W - 30} y={H - 10} textAnchor="end" fontSize={9} fill={COLORS.mid}>
          多次采样观察 Return 的方差 — 这就是 REINFORCE 的核心问题
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/REINFORCETrajectory.tsx
git commit -m "feat(rl): add REINFORCETrajectory component"
```

---

## Task 11: VarianceProblem

**Files:**
- Create: `src/components/interactive/VarianceProblem.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function VarianceProblem() {
  const [samples, setSamples] = useState<{ x: number; y: number }[]>([]);
  const [sampleCount, setSampleCount] = useState(0);

  // True gradient direction (normalized): pointing upper-right
  const trueGradX = 0.7;
  const trueGradY = -0.7;

  const sampleGradient = () => {
    // Noisy estimate of the gradient — high variance around the true direction
    const noise = 1.2;
    const gx = trueGradX + (Math.random() - 0.5) * noise * 2;
    const gy = trueGradY + (Math.random() - 0.5) * noise * 2;
    return { x: gx, y: gy };
  };

  const addSamples = (n: number) => {
    const newSamples: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      newSamples.push(sampleGradient());
    }
    setSamples(prev => [...prev, ...newSamples]);
    setSampleCount(prev => prev + n);
  };

  const reset = () => {
    setSamples([]);
    setSampleCount(0);
  };

  const cx = 180, cy = 180;
  const scale = 60;

  // Compute average direction
  const avgX = samples.length > 0 ? samples.reduce((s, p) => s + p.x, 0) / samples.length : 0;
  const avgY = samples.length > 0 ? samples.reduce((s, p) => s + p.y, 0) / samples.length : 0;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          高方差问题：梯度估计的散布
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          每次采样一条 trajectory 只能得到一个 noisy 梯度估计
        </text>

        {/* Coordinate axes */}
        <line x1={cx - 130} y1={cy} x2={cx + 130} y2={cy} stroke={COLORS.light} strokeWidth={1} />
        <line x1={cx} y1={cy - 130} x2={cx} y2={cy + 130} stroke={COLORS.light} strokeWidth={1} />
        <text x={cx + 135} y={cy + 4} fontSize={9} fill={COLORS.mid}>θ₁</text>
        <text x={cx + 4} y={cy - 132} fontSize={9} fill={COLORS.mid}>θ₂</text>

        {/* True gradient direction */}
        <line x1={cx} y1={cy} x2={cx + trueGradX * scale * 1.8} y2={cy + trueGradY * scale * 1.8}
          stroke={COLORS.green} strokeWidth={2.5} strokeDasharray="6 3" markerEnd="url(#arrowTrue)" />
        <defs>
          <marker id="arrowTrue" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
          </marker>
          <marker id="arrowSample" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={4} markerHeight={4} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
          <marker id="arrowAvg" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.orange} />
          </marker>
        </defs>

        {/* Sample gradient arrows */}
        {samples.map((s, i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + s.x * scale} y2={cy + s.y * scale}
            stroke={COLORS.primary} strokeWidth={0.8} opacity={0.4} markerEnd="url(#arrowSample)" />
        ))}

        {/* Average gradient */}
        {samples.length > 0 && (
          <line x1={cx} y1={cy} x2={cx + avgX * scale * 1.5} y2={cy + avgY * scale * 1.5}
            stroke={COLORS.orange} strokeWidth={2.5} markerEnd="url(#arrowAvg)" />
        )}

        {/* Legend */}
        <line x1={370} y1={80} x2={400} y2={80} stroke={COLORS.green} strokeWidth={2.5} strokeDasharray="6 3" />
        <text x={410} y={84} fontSize={10} fill={COLORS.dark}>真实梯度方向</text>
        <line x1={370} y1={100} x2={400} y2={100} stroke={COLORS.primary} strokeWidth={1} opacity={0.5} />
        <text x={410} y={104} fontSize={10} fill={COLORS.dark}>采样梯度估计 (n={sampleCount})</text>
        {samples.length > 0 && (
          <>
            <line x1={370} y1={120} x2={400} y2={120} stroke={COLORS.orange} strokeWidth={2.5} />
            <text x={410} y={124} fontSize={10} fill={COLORS.dark}>平均梯度方向</text>
          </>
        )}

        {/* Stats */}
        <rect x={360} y={150} width={200} height={80} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={370} y={170} fontSize={11} fontWeight={600} fill={COLORS.dark}>统计</text>
        <text x={370} y={188} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
          采样数: {sampleCount}
        </text>
        <text x={370} y={204} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
          平均方向: ({avgX.toFixed(2)}, {avgY.toFixed(2)})
        </text>
        <text x={370} y={220} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
          真实方向: ({trueGradX.toFixed(2)}, {trueGradY.toFixed(2)})
        </text>

        {/* Insight */}
        <rect x={360} y={240} width={200} height={44} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={460} y={257} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {sampleCount === 0 ? '点击采样观察方差' :
           sampleCount < 5 ? '方差很大！梯度方向不稳定' :
           sampleCount < 20 ? '增加采样，平均方向趋近真实' :
           '大量采样后方差减小 ✓'}
        </text>
        <text x={460} y={275} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          这就是 REINFORCE 收敛慢的原因
        </text>

        {/* Controls */}
        {[
          { label: '采样 1 条', n: 1, x: 360 },
          { label: '采样 10 条', n: 10, x: 440 },
        ].map(btn => (
          <g key={btn.n} onClick={() => addSamples(btn.n)} style={{ cursor: 'pointer' }}>
            <rect x={btn.x} y={H - 42} width={80} height={26} rx={5} fill={COLORS.primary} />
            <text x={btn.x + 40} y={H - 25} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">{btn.label}</text>
          </g>
        ))}
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={530} y={H - 42} width={40} height={26} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={550} y={H - 25} textAnchor="middle" fontSize={10} fill={COLORS.dark}>重置</text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/VarianceProblem.tsx
git commit -m "feat(rl): add VarianceProblem component"
```

---

## Task 12: BaselineEffect

**Files:**
- Create: `src/components/interactive/BaselineEffect.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function BaselineEffect() {
  const [useBaseline, setUseBaseline] = useState(false);
  const [noBaselineData, setNoBaselineData] = useState<number[]>([]);
  const [baselineData, setBaselineData] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const runRef = useRef(false);

  const simulate = async () => {
    runRef.current = true;
    setRunning(true);
    setNoBaselineData([]);
    setBaselineData([]);

    let nbCum = 0, bCum = 0;
    const nbPoints: number[] = [];
    const bPoints: number[] = [];

    for (let i = 0; i < 60 && runRef.current; i++) {
      // No baseline: raw returns, high variance
      const rawReturn = Math.sin(i * 0.1) * 2 + (Math.random() - 0.5) * 4;
      nbCum += rawReturn * 0.05;
      nbPoints.push(nbCum);

      // With baseline: advantage = return - baseline, low variance
      const advantage = Math.sin(i * 0.1) * 2 + (Math.random() - 0.5) * 1.2;
      bCum += advantage * 0.05;
      bPoints.push(bCum);

      setNoBaselineData([...nbPoints]);
      setBaselineData([...bPoints]);

      await new Promise(r => setTimeout(r, 50));
    }
    setRunning(false);
    runRef.current = false;
  };

  const stop = () => { runRef.current = false; setRunning(false); };

  const chartX = 40, chartY = 80, chartW = 500, chartH = 200;

  const drawCurve = (data: number[], color: string) => {
    if (data.length < 2) return null;
    const maxAbs = Math.max(1, ...data.map(Math.abs), ...(useBaseline ? baselineData : noBaselineData).map(Math.abs));
    const points = data.map((v, i) => {
      const x = chartX + (i / 59) * chartW;
      const y = chartY + chartH / 2 - (v / maxAbs) * (chartH / 2 - 10);
      return `${x},${y}`;
    }).join(' ');
    return <polyline points={points} fill="none" stroke={color} strokeWidth={2} />;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Baseline 对 Policy Gradient 方差的影响
        </text>

        {/* Toggle */}
        <g onClick={() => setUseBaseline(!useBaseline)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 80} y={36} width={160} height={26} rx={13}
            fill={useBaseline ? COLORS.green : COLORS.red} opacity={0.9} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {useBaseline ? '✓ 显示有 Baseline' : '✗ 显示无 Baseline'}
          </text>
        </g>

        {/* Chart area */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <line x1={chartX} y1={chartY + chartH / 2} x2={chartX + chartW} y2={chartY + chartH / 2}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4 3" />
        <text x={chartX - 4} y={chartY + chartH / 2 + 4} textAnchor="end" fontSize={9} fill={COLORS.mid}>0</text>

        {/* Labels */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 20} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          训练步数
        </text>

        {/* Curves */}
        {!useBaseline && drawCurve(noBaselineData, COLORS.red)}
        {useBaseline && drawCurve(baselineData, COLORS.green)}

        {/* Legend */}
        <rect x={chartX + 10} y={chartY + 8} width={160} height={36} rx={4} fill="rgba(255,255,255,0.9)" />
        {!useBaseline ? (
          <>
            <line x1={chartX + 18} y1={chartY + 22} x2={chartX + 38} y2={chartY + 22} stroke={COLORS.red} strokeWidth={2} />
            <text x={chartX + 44} y={chartY + 26} fontSize={10} fill={COLORS.dark}>无 Baseline：方差大、抖动剧烈</text>
          </>
        ) : (
          <>
            <line x1={chartX + 18} y1={chartY + 22} x2={chartX + 38} y2={chartY + 22} stroke={COLORS.green} strokeWidth={2} />
            <text x={chartX + 44} y={chartY + 26} fontSize={10} fill={COLORS.dark}>有 Baseline：方差小、收敛平滑</text>
          </>
        )}

        {/* Explanation */}
        <rect x={40} y={H - 70} width={500} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 50} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {useBaseline ? 'Advantage A(s,a) = Q(s,a) - V(s)' : '无 Baseline: ∇J ≈ ∇log π · G (raw return)'}
        </text>
        <text x={50} y={H - 34} fontSize={10} fill={COLORS.mid}>
          {useBaseline
            ? '减去 baseline V(s) 后，梯度反映"比平均好多少"而非"绝对好坏"，方差大幅降低'
            : 'Raw return 包含绝对值大小的信号，即使所有 reward 为正，梯度仍在正方向波动'}
        </text>

        {/* Controls */}
        <g onClick={running ? stop : simulate} style={{ cursor: 'pointer' }}>
          <rect x={40} y={H - 14} width={80} height={24} rx={5} fill={running ? COLORS.red : COLORS.primary} />
          <text x={80} y={H + 1} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {running ? '停止' : '运行模拟'}
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/BaselineEffect.tsx
git commit -m "feat(rl): add BaselineEffect component"
```

---

## Task 13: AdvantageExplainer (StepNavigator)

**Files:**
- Create: `src/components/interactive/AdvantageExplainer.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function AdvantageExplainer() {
  const steps = [
    {
      title: 'Raw Return G',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            原始 Return：绝对好坏
          </text>
          {/* Bar chart showing raw returns */}
          {[
            { label: 'action A', value: 8, color: COLORS.green },
            { label: 'action B', value: 6, color: COLORS.green },
            { label: 'action C', value: 3, color: COLORS.green },
          ].map((item, i) => {
            const x = 80 + i * 160;
            const h = item.value * 12;
            return (
              <g key={i}>
                <rect x={x} y={120 - h} width={100} height={h} rx={4} fill={item.color} opacity={0.7} />
                <text x={x + 50} y={138} textAnchor="middle" fontSize={11} fill={COLORS.dark}>{item.label}</text>
                <text x={x + 50} y={120 - h - 6} textAnchor="middle" fontSize={11} fontWeight={600}
                  fill={COLORS.dark} fontFamily={FONTS.mono}>G = {item.value}</text>
              </g>
            );
          })}
          <text x={W / 2} y={165} textAnchor="middle" fontSize={11} fill={COLORS.red}>
            问题：所有 Return 为正 → 所有动作概率都增加 → 梯度方向不稳定
          </text>
        </svg>
      ),
    },
    {
      title: '减去 Baseline b(s)',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            减去 Baseline b(s) = V(s) ≈ 5.67
          </text>
          {/* Bar chart showing centered values */}
          {[
            { label: 'action A', raw: 8, adj: 2.33, color: COLORS.green },
            { label: 'action B', raw: 6, adj: 0.33, color: COLORS.green },
            { label: 'action C', raw: 3, adj: -2.67, color: COLORS.red },
          ].map((item, i) => {
            const x = 80 + i * 160;
            const baseline_y = 100;
            const h = Math.abs(item.adj) * 16;
            const isPos = item.adj > 0;
            return (
              <g key={i}>
                <rect x={x} y={isPos ? baseline_y - h : baseline_y}
                  width={100} height={h} rx={4}
                  fill={item.color} opacity={0.7} />
                <text x={x + 50} y={138} textAnchor="middle" fontSize={11} fill={COLORS.dark}>{item.label}</text>
                <text x={x + 50} y={isPos ? baseline_y - h - 6 : baseline_y + h + 14}
                  textAnchor="middle" fontSize={11} fontWeight={600}
                  fill={isPos ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
                  {item.adj > 0 ? '+' : ''}{item.adj.toFixed(2)}
                </text>
              </g>
            );
          })}
          <line x1={60} y1={100} x2={520} y2={100} stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="6 3" />
          <text x={530} y={104} fontSize={10} fill={COLORS.orange}>baseline</text>
          <text x={W / 2} y={168} textAnchor="middle" fontSize={11} fill={COLORS.green}>
            现在有正有负 → 好动作推高，坏动作压低 → 梯度方向清晰！
          </text>
        </svg>
      ),
    },
    {
      title: 'Advantage 定义',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Advantage Function A(s,a) = Q(s,a) - V(s)
          </text>
          <rect x={40} y={40} width={500} height={60} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={W / 2} y={62} textAnchor="middle" fontSize={12} fontFamily={FONTS.mono} fill={COLORS.primary}>
            A(s,a) = Q(s,a) - V(s)
          </text>
          <text x={W / 2} y={82} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
            Q(s,a) = 执行动作 a 的价值 | V(s) = 所有动作的平均价值
          </text>

          <rect x={60} y={115} width={200} height={40} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={160} y={133} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.green}>
            A {'>'} 0：比平均好
          </text>
          <text x={160} y={148} textAnchor="middle" fontSize={10} fill={COLORS.mid}>→ 增加该动作概率</text>

          <rect x={320} y={115} width={200} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={420} y={133} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.red}>
            A {'<'} 0：比平均差
          </text>
          <text x={420} y={148} textAnchor="middle" fontSize={10} fill={COLORS.mid}>→ 减少该动作概率</text>

          <text x={W / 2} y={175} textAnchor="middle" fontSize={11} fill={COLORS.orange} fontWeight={600}>
            Advantage 是相对评价：不是"好不好"，而是"比平均好多少"
          </text>
        </svg>
      ),
    },
    {
      title: '为什么 Advantage 更有效',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Advantage 的数学保证
          </text>

          <rect x={30} y={40} width={240} height={90} rx={8} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={150} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.red}>
            无 Baseline
          </text>
          <text x={150} y={76} textAnchor="middle" fontSize={10} fill={COLORS.dark}>
            ∇J = E[∇log π · G]
          </text>
          <text x={150} y={94} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            方差 ∝ E[G²] — 很大
          </text>
          <text x={150} y={112} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            所有为正的 G 都推高概率
          </text>

          <rect x={310} y={40} width={240} height={90} rx={8} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={430} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.green}>
            有 Baseline (Advantage)
          </text>
          <text x={430} y={76} textAnchor="middle" fontSize={10} fill={COLORS.dark}>
            ∇J = E[∇log π · A]
          </text>
          <text x={430} y={94} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            方差 ∝ E[A²] — 小得多
          </text>
          <text x={430} y={112} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            只有比平均好的才推高概率
          </text>

          <rect x={80} y={145} width={420} height={28} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={W / 2} y={163} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.orange}>
            关键性质：E[A(s,a)] = 0 → 梯度无偏 + 低方差 → 这是 Actor-Critic 的基础
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/AdvantageExplainer.tsx
git commit -m "feat(rl): add AdvantageExplainer StepNavigator component"
```

---

## Task 14: PGAlgorithmFamily

**Files:**
- Create: `src/components/interactive/PGAlgorithmFamily.tsx`

- [ ] **Step 1: Create component**

```tsx
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

export default function PGAlgorithmFamily() {
  const [active, setActive] = useState<string | null>(null);

  const edges: [string, string, string][] = [
    ['reinforce', 'baseline', '+ baseline b(s)'],
    ['baseline', 'ac', '+ Critic 网络'],
    ['ac', 'a2c', '+ 并行采样'],
    ['a2c', 'ppo', '+ Clipped Trust Region'],
  ];

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));
  const activeNode = active ? nodeMap[active] : null;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Policy Gradient 算法演进
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          点击节点查看每步改进的详情
        </text>

        {/* Edges */}
        {edges.map(([from, to, label], i) => {
          const f = nodeMap[from], t = nodeMap[to];
          const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
          return (
            <g key={i}>
              <line x1={f.x} y1={f.y + 20} x2={t.x} y2={t.y - 20}
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
                {node.label.split('\n').map((line, li) => (
                  <tspan key={li} x={node.x} dy={li === 0 ? 0 : 14}>{line}</tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* PPO badge */}
        <text x={480} y={300} textAnchor="middle" fontSize={9} fill={COLORS.purple} fontWeight={600}>
          ↑ RLHF 核心算法
        </text>

        {/* Detail panel */}
        {activeNode && (
          <g>
            <rect x={30} y={H - 90} width={520} height={75} rx={8}
              fill={COLORS.bgAlt} stroke={activeNode.color} strokeWidth={1.5} />
            <text x={45} y={H - 72} fontSize={12} fontWeight={700} fill={activeNode.color}>
              {activeNode.label.replace('\n', ' ')}
            </text>
            <text x={45} y={H - 55} fontSize={11} fontWeight={600} fill={COLORS.dark}>
              核心改进：{activeNode.improvement}
            </text>
            <text x={45} y={H - 35} fontSize={10} fill={COLORS.mid}>
              {activeNode.detail.substring(0, 80)}
            </text>
            <text x={45} y={H - 20} fontSize={10} fill={COLORS.mid}>
              {activeNode.detail.substring(80)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/PGAlgorithmFamily.tsx
git commit -m "feat(rl): add PGAlgorithmFamily component"
```

---

## Task 15: Article 2 MDX — policy-gradient

**Files:**
- Create: `src/content/articles/zh/policy-gradient.mdx`

- [ ] **Step 1: Create article MDX**

```mdx
---
title: "Policy Gradient：直接优化策略"
slug: policy-gradient
locale: zh
tags: [policy-gradient, reinforce, baseline, variance-reduction, advantage]
difficulty: intermediate
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [rl-foundations]
references:
  - type: paper
    title: "Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning (Williams, 1992)"
    url: "https://link.springer.com/article/10.1007/BF00992696"
  - type: paper
    title: "Policy Gradient Methods for Reinforcement Learning with Function Approximation (Sutton et al., 1999)"
    url: "https://proceedings.neurips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html"
  - type: blog
    title: "Policy Gradient Algorithms — Lilian Weng"
    url: "https://lilianweng.github.io/posts/2018-04-08-policy-gradient/"
  - type: course
    title: "UC Berkeley CS285 Lectures 5-6: Policy Gradient"
    url: "http://rail.eecs.berkeley.edu/deeprlcourse/"
  - type: website
    title: "OpenAI Spinning Up: Vanilla Policy Gradient"
    url: "https://spinningup.openai.com/en/latest/algorithms/vpg.html"
---

import PolicyGradientIntuition from '../../../components/interactive/PolicyGradientIntuition.tsx';
import REINFORCETrajectory from '../../../components/interactive/REINFORCETrajectory.tsx';
import VarianceProblem from '../../../components/interactive/VarianceProblem.tsx';
import BaselineEffect from '../../../components/interactive/BaselineEffect.tsx';
import AdvantageExplainer from '../../../components/interactive/AdvantageExplainer.tsx';
import PGAlgorithmFamily from '../../../components/interactive/PGAlgorithmFamily.tsx';

## 为什么直接优化策略

上一篇我们看到，Value-Based 方法（Q-Learning / DQN）的核心是学习 $Q(s,a)$，然后贪心选最大 Q 值的动作。这种方法有几个根本限制：

1. **只能处理离散动作空间**：需要对每个可能的动作计算 Q 值，当动作空间很大（如 LLM 的词汇表 32K+ tokens）或连续时（如机器人控制），这不现实
2. **无法表达随机策略**：有时最优策略需要随机性（如石头剪刀布），Q-Learning 只能输出确定性策略
3. **小变化大影响**：Q 值的微小变化可能导致 argmax 翻转，策略突变

**Policy Gradient 的核心思想**：既然 LLM 本身就是一个参数化策略 $\pi_\theta(a|s)$（给定 context，输出 token 概率分布），为什么不直接优化这个策略？

<PolicyGradientIntuition client:visible />

## 策略梯度定理

Policy Gradient 的目标是最大化期望累积回报 $J(\theta) = \mathbb{E}_{\pi_\theta}[\sum_t \gamma^t r_t]$。

**策略梯度定理**给出了 $J(\theta)$ 对参数 $\theta$ 的梯度：

$$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\left[\nabla_\theta \log \pi_\theta(a_t|s_t) \cdot G_t\right]$$

其中 $G_t = \sum_{k=0}^{\infty} \gamma^k r_{t+k}$ 是从时间步 $t$ 开始的折扣回报。

**直觉**：
- $\nabla_\theta \log \pi_\theta(a|s)$ 是让动作 $a$ 概率增加的方向
- $G_t$ 是这条轨迹的好坏程度
- 两者相乘：$G_t > 0$ 时推高好动作概率，$G_t < 0$ 时压低坏动作概率

这个公式的美妙之处：**不需要知道环境模型**，只需要采样 trajectory 就能估计梯度。

## REINFORCE 算法

REINFORCE 是最简单的 Policy Gradient 实现：

1. **采样**：用当前策略 $\pi_\theta$ 采样一条完整 trajectory $\tau = (s_0, a_0, r_0, s_1, a_1, r_1, \ldots)$
2. **计算 Return**：对 trajectory 中每个时间步计算折扣回报 $G_t$
3. **更新参数**：$\theta \leftarrow \theta + \alpha \sum_t \nabla_\theta \log \pi_\theta(a_t|s_t) \cdot G_t$

<REINFORCETrajectory client:visible />

## 高方差问题

REINFORCE 虽然简单优美，但有一个致命缺陷：**梯度估计的方差极高**。

每次只采样一条 trajectory，这条 trajectory 的 return 受随机性影响很大。同一个策略，两次采样可能得到截然不同的 return——一次碰巧走了好路径得到高 return，另一次走了坏路径得到低 return。

这导致梯度估计非常不稳定，需要大量采样才能得到可靠的梯度方向。

<VarianceProblem client:visible />

## Baseline 与 Advantage

解决高方差的关键洞察：**reward 的绝对值不重要，重要的是"比平均好多少"**。

引入 **Baseline** $b(s)$（通常取 $V(s)$ 的估计），将梯度修改为：

$$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\left[\nabla_\theta \log \pi_\theta(a_t|s_t) \cdot (G_t - b(s_t))\right]$$

数学上可以证明：减去任何不依赖于动作的 baseline **不改变梯度期望**（无偏），但**显著降低方差**。

这就引出了 **Advantage Function**：

$$A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s)$$

$A > 0$ 表示这个动作比平均水平好，$A < 0$ 表示比平均差。用 Advantage 替代 raw return，梯度同时具有无偏性和低方差。

<BaselineEffect client:visible />

<AdvantageExplainer client:visible />

## 从 REINFORCE 到 Actor-Critic

REINFORCE + Baseline 仍然需要采样完整 trajectory 才能计算 return。能不能每走一步就更新？

答案是 **Actor-Critic**：用一个神经网络（Critic）来近似 $V(s)$，作为 baseline。这样：
- **Actor**（策略网络）决定采取什么动作
- **Critic**（价值网络）评估当前状态有多好

Critic 的 TD 估计可以在每一步提供 Advantage 信号，不需要等 trajectory 结束。这大幅提升了样本效率。

Actor-Critic 是通向 PPO 和 RLHF 的关键跳板，我们将在下一篇深入讲解。

<PGAlgorithmFamily client:visible />

## 总结

本文梳理了 Policy Gradient 的核心思路：

1. **直接优化策略** $\pi_\theta$ 比 Value-Based 方法更适合大动作空间（如 LLM）
2. **策略梯度定理**提供了不依赖环境模型的梯度估计
3. **REINFORCE** 是最简单的实现，但方差极高
4. **Baseline / Advantage** 在保持无偏的同时大幅降低方差
5. **Actor-Critic** 用神经网络近似 baseline，实现逐步更新

下一篇我们将深入 Actor-Critic 架构和 PPO，理解 RLHF 中最核心的优化算法。
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/policy-gradient.mdx
git commit -m "feat(rl): add policy-gradient article with 6 components"
```
