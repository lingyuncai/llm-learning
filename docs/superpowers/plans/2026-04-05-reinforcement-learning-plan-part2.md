# 强化学习 Implementation Plan — Part 2 (Tasks 16-30)

> Continues from `2026-04-05-reinforcement-learning-plan.md` (Tasks 1-15).
> **Spec:** `docs/superpowers/specs/2026-04-05-reinforcement-learning-design.md`

---

## File Structure (Part 2)

### Article 3: Actor-Critic 与 PPO (ppo-actor-critic)
- Create: `src/components/interactive/ActorCriticArchitecture.tsx`
- Create: `src/components/interactive/GAELambdaSlider.tsx`
- Create: `src/components/interactive/TrustRegionViz.tsx`
- Create: `src/components/interactive/PPOClipExplainer.tsx`
- Create: `src/components/interactive/PPOvsVanillaPG.tsx`
- Create: `src/components/interactive/PPOForLLM.tsx`
- Create: `src/content/articles/zh/ppo-actor-critic.mdx`

### Article 4: RLHF (rlhf)
- Create: `src/components/interactive/RLHFPipeline.tsx`
- Create: `src/components/interactive/PreferenceLabeling.tsx`
- Create: `src/components/interactive/RewardModelTraining.tsx`
- Create: `src/components/interactive/KLPenaltyViz.tsx`
- Create: `src/components/interactive/RewardHackingDemo.tsx`
- Create: `src/components/interactive/AlignmentMethodTimeline.tsx`
- Create: `src/content/articles/zh/rlhf.mdx`

---

## Task 16: ActorCriticArchitecture

**Files:**
- Create: `src/components/interactive/ActorCriticArchitecture.tsx`

- [ ] **Step 1: Create component**

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | head -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/ActorCriticArchitecture.tsx
git commit -m "feat(rl): add ActorCriticArchitecture component"
```

---

## Task 17: GAELambdaSlider

**Files:**
- Create: `src/components/interactive/GAELambdaSlider.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

export default function GAELambdaSlider() {
  const [lambda, setLambda] = useState(0.95);

  // Simulate bias-variance tradeoff
  const data = useMemo(() => {
    const points = 40;
    const result: { step: number; value: number }[] = [];
    let val = 0;
    const noise = lambda; // higher lambda = more variance (MC-like)
    const bias = 1 - lambda; // lower lambda = more bias (TD-like)

    for (let i = 0; i < points; i++) {
      const trueSignal = Math.sin(i * 0.15) * 3 + i * 0.05;
      const noiseAmount = (Math.random() - 0.5) * noise * 6;
      const biasAmount = bias * 2;
      val = trueSignal + noiseAmount + biasAmount;
      result.push({ step: i, value: val });
    }
    return result;
  }, [lambda]);

  const chartX = 50, chartY = 100, chartW = 260, chartH = 200;
  const maxVal = Math.max(...data.map(d => Math.abs(d.value)), 1);

  // Convergence curve
  const convergenceData = useMemo(() => {
    const steps = 50;
    const result: number[] = [];
    let perf = 0;
    for (let i = 0; i < steps; i++) {
      const lr = 0.1;
      const gradNoise = (Math.random() - 0.5) * lambda * 3;
      const gradBias = (1 - lambda) * 0.5;
      perf += lr * (1 - perf / 5 + gradNoise - gradBias);
      result.push(Math.max(-1, Math.min(5, perf)));
    }
    return result;
  }, [lambda]);

  const conv2X = 340, conv2W = 220;
  const maxConv = Math.max(...convergenceData.map(Math.abs), 1);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          GAE λ 参数：偏差-方差权衡
        </text>

        {/* Lambda slider */}
        <text x={W / 2} y={50} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          λ = {lambda.toFixed(2)}
        </text>
        <text x={50} y={76} fontSize={10} fill={COLORS.mid}>λ=0 (TD, 高偏差低方差)</text>
        <text x={W - 50} y={76} textAnchor="end" fontSize={10} fill={COLORS.mid}>λ=1 (MC, 低偏差高方差)</text>

        {/* Slider track */}
        <rect x={50} y={82} width={480} height={6} rx={3} fill={COLORS.light} />
        <circle cx={50 + lambda * 480} cy={85} r={8} fill={COLORS.primary} stroke="#fff" strokeWidth={2} />

        {/* Invisible wider hit area for slider */}
        <rect x={50} y={70} width={480} height={30} fill="transparent" style={{ cursor: 'pointer' }}
          onMouseDown={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const updateLambda = (clientX: number) => {
              const x = (clientX - rect.left) / rect.width;
              setLambda(Math.max(0, Math.min(1, x)));
            };
            updateLambda(e.clientX);
            const onMove = (ev: MouseEvent) => updateLambda(ev.clientX);
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        />

        {/* Left chart: Advantage estimate scatter */}
        <text x={chartX + chartW / 2} y={chartY - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          Advantage 估计值散布
        </text>
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <line x1={chartX} y1={chartY + chartH / 2} x2={chartX + chartW} y2={chartY + chartH / 2}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4 3" />

        {data.map((d, i) => {
          const x = chartX + (d.step / 39) * chartW;
          const y = chartY + chartH / 2 - (d.value / maxVal) * (chartH / 2 - 10);
          return <circle key={i} cx={x} cy={y} r={3} fill={COLORS.primary} opacity={0.6} />;
        })}

        {/* Right chart: Convergence curve */}
        <text x={conv2X + conv2W / 2} y={chartY - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          训练收敛曲线
        </text>
        <rect x={conv2X} y={chartY} width={conv2W} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {convergenceData.length > 1 && (
          <polyline
            points={convergenceData.map((v, i) => {
              const x = conv2X + (i / 49) * conv2W;
              const y = chartY + chartH - 10 - ((v + 1) / (maxConv + 1)) * (chartH - 20);
              return `${x},${y}`;
            }).join(' ')}
            fill="none" stroke={COLORS.green} strokeWidth={2} />
        )}

        {/* Labels */}
        <rect x={40} y={H - 60} width={500} height={48} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 42} fontSize={11} fontWeight={600} fill={COLORS.orange}>
          GAE(λ) = Σₖ (γλ)ᵏ · δₜ₊ₖ  其中 δₜ = rₜ + γV(sₜ₊₁) - V(sₜ)
        </text>
        <text x={50} y={H - 24} fontSize={10} fill={COLORS.mid}>
          {lambda < 0.3 ? 'λ 接近 0：类似 TD(0)，只看一步。偏差大（Critic 不准时误差大），但方差小、收敛快。' :
           lambda < 0.7 ? 'λ 中间值：平衡偏差和方差。实践中 λ=0.95-0.97 最常用。' :
           'λ 接近 1：类似 Monte Carlo，看完整轨迹。方差大（每条轨迹差异大），但偏差小。'}
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
git add src/components/interactive/GAELambdaSlider.tsx
git commit -m "feat(rl): add GAELambdaSlider component"
```

---

## Task 18: TrustRegionViz

**Files:**
- Create: `src/components/interactive/TrustRegionViz.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function TrustRegionViz() {
  const [useTrustRegion, setUseTrustRegion] = useState(false);
  const [steps, setSteps] = useState<{ x: number; y: number; perf: number }[]>([]);
  const [crashed, setCrashed] = useState(false);

  const cx = 200, cy = 180;
  const trustR = 50;

  const reset = () => {
    setSteps([]);
    setCrashed(false);
  };

  const takeStep = () => {
    if (crashed) return;
    const prev = steps.length > 0 ? steps[steps.length - 1] : { x: cx, y: cy, perf: 50 };

    if (useTrustRegion) {
      // Constrained step: stay within trust region
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * trustR * 0.6;
      const nx = prev.x + Math.cos(angle) * dist * 0.3 + 8;
      const ny = prev.y + Math.sin(angle) * dist * 0.3 - 5;
      const perf = Math.min(100, prev.perf + Math.random() * 8 + 2);
      setSteps(prev => [...prev, { x: nx, y: ny, perf }]);
    } else {
      // Unconstrained: can take big steps, may crash
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 60;
      const nx = prev.x + Math.cos(angle) * dist * 0.4 + 12;
      const ny = prev.y + Math.sin(angle) * dist * 0.4 - 8;
      const willCrash = steps.length > 2 && Math.random() < 0.3;
      const perf = willCrash ? Math.max(0, prev.perf - 40 - Math.random() * 30) : Math.min(100, prev.perf + Math.random() * 15);
      setSteps(prev => [...prev, { x: nx, y: ny, perf }]);
      if (willCrash) setCrashed(true);
    }
  };

  const perfChartX = 360, perfChartW = 200, perfChartH = 180, perfChartY = 60;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Trust Region：限制策略更新范围
        </text>

        {/* Toggle */}
        <g onClick={() => { setUseTrustRegion(!useTrustRegion); reset(); }} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 90} y={34} width={180} height={26} rx={13}
            fill={useTrustRegion ? COLORS.green : COLORS.red} />
          <text x={W / 2} y={51} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {useTrustRegion ? '✓ Trust Region ON' : '✗ Trust Region OFF（无约束）'}
          </text>
        </g>

        {/* Policy space */}
        <rect x={30} y={70} width={310} height={240} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <text x={185} y={86} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>策略参数空间 (θ₁, θ₂)</text>

        {/* Trust region circle */}
        {useTrustRegion && steps.length > 0 && (
          <circle cx={steps[steps.length - 1].x} cy={steps[steps.length - 1].y} r={trustR}
            fill="none" stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="6 3" opacity={0.6} />
        )}

        {/* Current position */}
        {steps.length === 0 && (
          <circle cx={cx} cy={cy} r={6} fill={COLORS.primary} />
        )}

        {/* Step trail */}
        {steps.map((s, i) => {
          const prev = i === 0 ? { x: cx, y: cy } : steps[i - 1];
          const isCrash = crashed && i === steps.length - 1;
          return (
            <g key={i}>
              <line x1={prev.x} y1={prev.y} x2={s.x} y2={s.y}
                stroke={isCrash ? COLORS.red : COLORS.primary} strokeWidth={1.5} />
              <circle cx={s.x} cy={s.y} r={isCrash ? 8 : 4}
                fill={isCrash ? COLORS.red : COLORS.primary} opacity={0.8} />
              {isCrash && (
                <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize={10} fill="#fff" fontWeight={700}>✗</text>
              )}
            </g>
          );
        })}

        {/* Performance chart */}
        <text x={perfChartX + perfChartW / 2} y={perfChartY - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          性能变化
        </text>
        <rect x={perfChartX} y={perfChartY} width={perfChartW} height={perfChartH}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {steps.length > 0 && (
          <polyline
            points={[{ perf: 50 }, ...steps].map((s, i) => {
              const x = perfChartX + (i / Math.max(1, steps.length)) * perfChartW;
              const y = perfChartY + perfChartH - (s.perf / 100) * perfChartH;
              return `${x},${y}`;
            }).join(' ')}
            fill="none" stroke={crashed ? COLORS.red : COLORS.green} strokeWidth={2} />
        )}

        {crashed && (
          <text x={perfChartX + perfChartW / 2} y={perfChartY + perfChartH / 2} textAnchor="middle"
            fontSize={14} fontWeight={700} fill={COLORS.red}>
            性能崩溃！
          </text>
        )}

        {/* Controls */}
        <g onClick={takeStep} style={{ cursor: crashed ? 'default' : 'pointer' }}>
          <rect x={360} y={perfChartY + perfChartH + 15} width={80} height={28} rx={5}
            fill={crashed ? COLORS.masked : COLORS.primary} />
          <text x={400} y={perfChartY + perfChartH + 33} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            更新一步
          </text>
        </g>
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={450} y={perfChartY + perfChartH + 15} width={60} height={28} rx={5}
            fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={480} y={perfChartY + perfChartH + 33} textAnchor="middle" fontSize={11} fill={COLORS.dark}>重置</text>
        </g>

        {/* Explanation */}
        <rect x={360} y={H - 50} width={210} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={465} y={H - 32} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {useTrustRegion ? 'KL(π_old ∥ π_new) ≤ δ' : '无约束更新 → 步长可能过大'}
        </text>
        <text x={465} y={H - 18} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {useTrustRegion ? '限制新旧策略距离，稳定提升' : '策略剧变 → 可能性能崩溃'}
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
git add src/components/interactive/TrustRegionViz.tsx
git commit -m "feat(rl): add TrustRegionViz component"
```

---

## Task 19: PPOClipExplainer

**Files:**
- Create: `src/components/interactive/PPOClipExplainer.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

export default function PPOClipExplainer() {
  const [epsilon, setEpsilon] = useState(0.2);
  const [advPositive, setAdvPositive] = useState(true);

  const chartX = 60, chartY = 100, chartW = 460, chartH = 220;
  const ratioMin = 0, ratioMax = 2.5;

  const toChartX = (ratio: number) => chartX + ((ratio - ratioMin) / (ratioMax - ratioMin)) * chartW;
  const toChartY = (val: number) => chartY + chartH / 2 - (val / 2) * (chartH / 2);

  // PPO objective: L = min(ratio * A, clip(ratio, 1-eps, 1+eps) * A)
  const getObjective = (ratio: number): { unclipped: number; clipped: number; final: number } => {
    const A = advPositive ? 1 : -1;
    const unclipped = ratio * A;
    const clippedRatio = Math.max(1 - epsilon, Math.min(1 + epsilon, ratio));
    const clipped = clippedRatio * A;
    const final = Math.min(unclipped, clipped);
    return { unclipped, clipped, final };
  };

  const numPoints = 100;
  const ratios = Array.from({ length: numPoints }, (_, i) => ratioMin + (i / (numPoints - 1)) * (ratioMax - ratioMin));

  const makePath = (getValue: (r: number) => number, color: string, dashed?: boolean) => {
    const points = ratios.map(r => `${toChartX(r)},${toChartY(getValue(r))}`).join(' ');
    return <polyline points={points} fill="none" stroke={color} strokeWidth={2}
      strokeDasharray={dashed ? '6 3' : undefined} />;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          PPO Clipped Surrogate Objective
        </text>

        {/* Controls */}
        <text x={80} y={52} fontSize={11} fill={COLORS.dark} fontFamily={FONTS.mono}>
          ε = {epsilon.toFixed(2)}
        </text>
        {[0.1, 0.2, 0.3, 0.4].map((e, i) => (
          <g key={e} onClick={() => setEpsilon(e)} style={{ cursor: 'pointer' }}>
            <rect x={160 + i * 50} y={40} width={40} height={22} rx={4}
              fill={epsilon === e ? COLORS.primary : COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={180 + i * 50} y={55} textAnchor="middle" fontSize={10}
              fill={epsilon === e ? '#fff' : COLORS.dark}>{e}</text>
          </g>
        ))}

        {/* Advantage toggle */}
        <g onClick={() => setAdvPositive(!advPositive)} style={{ cursor: 'pointer' }}>
          <rect x={380} y={40} width={170} height={22} rx={4}
            fill={advPositive ? COLORS.green : COLORS.red} />
          <text x={465} y={55} textAnchor="middle" fontSize={10} fontWeight={600} fill="#fff">
            A {advPositive ? '> 0 (好动作)' : '< 0 (坏动作)'}
          </text>
        </g>

        {/* Chart area */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {/* Axes */}
        <line x1={chartX} y1={chartY + chartH / 2} x2={chartX + chartW} y2={chartY + chartH / 2}
          stroke={COLORS.mid} strokeWidth={0.5} />
        <text x={chartX + chartW + 5} y={chartY + chartH / 2 + 4} fontSize={9} fill={COLORS.mid}>0</text>

        {/* ratio = 1 line */}
        <line x1={toChartX(1)} y1={chartY} x2={toChartX(1)} y2={chartY + chartH}
          stroke={COLORS.mid} strokeWidth={0.5} strokeDasharray="4 3" />
        <text x={toChartX(1)} y={chartY + chartH + 14} textAnchor="middle" fontSize={9} fill={COLORS.dark}>
          ratio=1
        </text>

        {/* Clip boundaries */}
        <line x1={toChartX(1 - epsilon)} y1={chartY} x2={toChartX(1 - epsilon)} y2={chartY + chartH}
          stroke={COLORS.orange} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <line x1={toChartX(1 + epsilon)} y1={chartY} x2={toChartX(1 + epsilon)} y2={chartY + chartH}
          stroke={COLORS.orange} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <text x={toChartX(1 - epsilon)} y={chartY - 4} textAnchor="middle" fontSize={8} fill={COLORS.orange}>1-ε</text>
        <text x={toChartX(1 + epsilon)} y={chartY - 4} textAnchor="middle" fontSize={8} fill={COLORS.orange}>1+ε</text>

        {/* Clip region shading */}
        <rect x={toChartX(1 - epsilon)} y={chartY}
          width={toChartX(1 + epsilon) - toChartX(1 - epsilon)} height={chartH}
          fill={COLORS.orange} opacity={0.06} />

        {/* Curves */}
        {makePath(r => getObjective(r).unclipped, COLORS.mid, true)}
        {makePath(r => getObjective(r).final, COLORS.primary)}

        {/* Legend */}
        <line x1={chartX + 10} y1={chartY + 14} x2={chartX + 30} y2={chartY + 14}
          stroke={COLORS.mid} strokeWidth={2} strokeDasharray="6 3" />
        <text x={chartX + 35} y={chartY + 18} fontSize={9} fill={COLORS.mid}>ratio × A (无 clip)</text>
        <line x1={chartX + 10} y1={chartY + 30} x2={chartX + 30} y2={chartY + 30}
          stroke={COLORS.primary} strokeWidth={2} />
        <text x={chartX + 35} y={chartY + 34} fontSize={9} fill={COLORS.primary}>L_CLIP = min(...) (PPO)</text>

        {/* X axis label */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 28} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          ratio = π_new(a|s) / π_old(a|s)
        </text>

        {/* Explanation */}
        <rect x={40} y={H - 56} width={500} height={44} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 38} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          L_CLIP = min(ratio·A, clip(ratio, 1-ε, 1+ε)·A)
        </text>
        <text x={50} y={H - 22} fontSize={10} fill={COLORS.mid}>
          {advPositive
            ? 'A>0 时：ratio 超过 1+ε 后 objective 不再增长 → 阻止过度增大好动作概率'
            : 'A<0 时：ratio 低于 1-ε 后 objective 不再减小 → 阻止过度减小坏动作概率'}
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
git add src/components/interactive/PPOClipExplainer.tsx
git commit -m "feat(rl): add PPOClipExplainer component"
```

---

## Task 20: PPOvsVanillaPG

**Files:**
- Create: `src/components/interactive/PPOvsVanillaPG.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useRef } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function PPOvsVanillaPG() {
  const [vpgData, setVpgData] = useState<number[]>([]);
  const [ppoData, setPpoData] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const runRef = useRef(false);

  const simulate = async () => {
    runRef.current = true;
    setRunning(true);
    setVpgData([]);
    setPpoData([]);

    const vpg: number[] = [];
    const ppo: number[] = [];
    let vpgPerf = 0, ppoPerf = 0;

    for (let i = 0; i < 80 && runRef.current; i++) {
      // VPG: high variance, occasional crashes
      const vpgGrad = 0.8 + (Math.random() - 0.5) * 3;
      const vpgCrash = i > 10 && Math.random() < 0.08;
      vpgPerf = vpgCrash ? Math.max(0, vpgPerf - 15 - Math.random() * 20) : Math.min(100, vpgPerf + vpgGrad);
      vpg.push(vpgPerf);

      // PPO: stable, consistent
      const ppoGrad = 0.9 + (Math.random() - 0.5) * 0.8;
      ppoPerf = Math.min(100, ppoPerf + ppoGrad);
      ppo.push(ppoPerf);

      setVpgData([...vpg]);
      setPpoData([...ppo]);
      await new Promise(r => setTimeout(r, 40));
    }
    setRunning(false);
    runRef.current = false;
  };

  const stop = () => { runRef.current = false; setRunning(false); };
  const reset = () => { stop(); setVpgData([]); setPpoData([]); };

  const chartX = 50, chartY = 60, chartW = 480, chartH = 210;

  const drawCurve = (data: number[], color: string) => {
    if (data.length < 2) return null;
    const points = data.map((v, i) => {
      const x = chartX + (i / 79) * chartW;
      const y = chartY + chartH - (v / 100) * chartH;
      return `${x},${y}`;
    }).join(' ');
    return <polyline points={points} fill="none" stroke={color} strokeWidth={2} />;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          PPO vs Vanilla Policy Gradient 训练对比
        </text>

        {/* Chart */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <text x={chartX - 5} y={chartY + 4} textAnchor="end" fontSize={8} fill={COLORS.mid}>100</text>
        <text x={chartX - 5} y={chartY + chartH} textAnchor="end" fontSize={8} fill={COLORS.mid}>0</text>
        <text x={chartX - 20} y={chartY + chartH / 2} textAnchor="middle" fontSize={9} fill={COLORS.mid}
          transform={`rotate(-90, ${chartX - 20}, ${chartY + chartH / 2})`}>性能</text>

        {drawCurve(vpgData, COLORS.red)}
        {drawCurve(ppoData, COLORS.green)}

        {/* Hover line */}
        {hoverIdx !== null && vpgData.length > hoverIdx && (
          <g>
            <line x1={chartX + (hoverIdx / 79) * chartW} y1={chartY}
              x2={chartX + (hoverIdx / 79) * chartW} y2={chartY + chartH}
              stroke={COLORS.mid} strokeWidth={0.5} strokeDasharray="3 2" />
            <rect x={chartX + (hoverIdx / 79) * chartW + 5} y={chartY + 5} width={110} height={38} rx={4}
              fill="rgba(255,255,255,0.95)" stroke={COLORS.mid} strokeWidth={0.5} />
            <text x={chartX + (hoverIdx / 79) * chartW + 10} y={chartY + 20} fontSize={9} fill={COLORS.red} fontFamily={FONTS.mono}>
              VPG: {vpgData[hoverIdx]?.toFixed(1)}
            </text>
            <text x={chartX + (hoverIdx / 79) * chartW + 10} y={chartY + 36} fontSize={9} fill={COLORS.green} fontFamily={FONTS.mono}>
              PPO: {ppoData[hoverIdx]?.toFixed(1)}
            </text>
          </g>
        )}

        {/* Hover detector */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill="transparent"
          onMouseMove={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            setHoverIdx(Math.min(vpgData.length - 1, Math.max(0, Math.round(x * 79))));
          }}
          onMouseLeave={() => setHoverIdx(null)} />

        {/* Legend */}
        <line x1={chartX + 10} y1={chartY + 14} x2={chartX + 30} y2={chartY + 14} stroke={COLORS.red} strokeWidth={2} />
        <text x={chartX + 35} y={chartY + 18} fontSize={10} fill={COLORS.red}>Vanilla PG（高方差、偶尔崩溃）</text>
        <line x1={chartX + 10} y1={chartY + 30} x2={chartX + 30} y2={chartY + 30} stroke={COLORS.green} strokeWidth={2} />
        <text x={chartX + 35} y={chartY + 34} fontSize={10} fill={COLORS.green}>PPO（稳定上升、clip 保护）</text>

        {/* X axis */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={10} fill={COLORS.mid}>训练步数</text>

        {/* Controls */}
        <g onClick={running ? stop : simulate} style={{ cursor: 'pointer' }}>
          <rect x={50} y={H - 42} width={90} height={28} rx={5} fill={running ? COLORS.red : COLORS.primary} />
          <text x={95} y={H - 24} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {running ? '停止' : '开始训练'}
          </text>
        </g>
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={150} y={H - 42} width={60} height={28} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={180} y={H - 24} textAnchor="middle" fontSize={11} fill={COLORS.dark}>重置</text>
        </g>

        <text x={W - 20} y={H - 10} textAnchor="end" fontSize={9} fill={COLORS.mid}>
          Hover 查看每步详情 | VPG 的崩溃来自策略更新过大
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
git add src/components/interactive/PPOvsVanillaPG.tsx
git commit -m "feat(rl): add PPOvsVanillaPG component"
```

---

## Task 21: PPOForLLM (StepNavigator)

**Files:**
- Create: `src/components/interactive/PPOForLLM.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function PPOForLLM() {
  const steps = [
    {
      title: 'LLM 生成回答',
      content: (
        <svg viewBox={`0 0 ${W} 190`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 1: Policy (LLM) 生成回答
          </text>

          {/* Prompt → LLM → Response */}
          <rect x={30} y={50} width={120} height={40} rx={8} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={90} y={74} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.primary}>Prompt</text>

          <line x1={155} y1={70} x2={210} y2={70} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={215} y={40} width={140} height={60} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2} />
          <text x={285} y={62} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.orange}>LLM (Policy)</text>
          <text x={285} y={80} textAnchor="middle" fontSize={9} fill={COLORS.mid}>π_θ(token|context)</text>

          <line x1={360} y1={70} x2={415} y2={70} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={420} y={50} width={130} height={40} rx={8} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1.5} />
          <text x={485} y={74} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>Response</text>

          <defs>
            <marker id="arrowPPO" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
            </marker>
          </defs>

          {/* Analogy */}
          <rect x={30} y={120} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={40} y={138} fontSize={10} fontWeight={600} fill={COLORS.dark}>游戏 RL 对应关系：</text>
          <text x={40} y={156} fontSize={10} fill={COLORS.mid}>
            State = prompt + 已生成 tokens | Action = 下一个 token | Trajectory = 完整回答
          </text>
        </svg>
      ),
    },
    {
      title: 'Reward Model 评分',
      content: (
        <svg viewBox={`0 0 ${W} 190`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 2: Reward Model 给回答打分
          </text>

          <rect x={30} y={50} width={100} height={35} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={80} y={72} textAnchor="middle" fontSize={10} fill={COLORS.primary}>Prompt</text>

          <text x={145} y={72} textAnchor="middle" fontSize={14} fill={COLORS.mid}>+</text>

          <rect x={160} y={50} width={100} height={35} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={210} y={72} textAnchor="middle" fontSize={10} fill={COLORS.dark}>Response</text>

          <line x1={265} y1={68} x2={320} y2={68} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={325} y={40} width={120} height={55} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2} />
          <text x={385} y={60} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.orange}>Reward Model</text>
          <text x={385} y={78} textAnchor="middle" fontSize={9} fill={COLORS.mid}>r = RM(prompt, response)</text>

          <line x1={450} y1={68} x2={500} y2={68} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={500} y={50} width={60} height={35} rx={6} fill={COLORS.green} stroke={COLORS.green} strokeWidth={1} />
          <text x={530} y={72} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">0.82</text>

          <rect x={30} y={120} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={40} y={138} fontSize={10} fontWeight={600} fill={COLORS.dark}>Reward Model 的角色：</text>
          <text x={40} y={156} fontSize={10} fill={COLORS.mid}>
            RM 把人类偏好量化为标量分数 | 高分 = 有帮助、安全、准确 | 低分 = 有害、不准确、不相关
          </text>
        </svg>
      ),
    },
    {
      title: '计算 Advantage',
      content: (
        <svg viewBox={`0 0 ${W} 190`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 3: 计算 Advantage（含 KL 惩罚）
          </text>

          <rect x={30} y={45} width={240} height={60} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={150} y={64} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.primary}>
            总 Reward = RM score - β·KL(π ∥ π_ref)
          </text>
          <text x={150} y={82} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
            RM score: 回答质量 | KL 惩罚: 不要偏离太远
          </text>
          <text x={150} y={96} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
            β 控制探索 vs 保守的平衡
          </text>

          <line x1={275} y1={75} x2={320} y2={75} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={325} y={45} width={220} height={60} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2} />
          <text x={435} y={64} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.orange}>
            GAE 计算 Advantage
          </text>
          <text x={435} y={82} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
            A_t = Σ (γλ)^k · δ_{t+k}
          </text>
          <text x={435} y={96} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
            每个 token 位置都有一个 Advantage 值
          </text>

          <rect x={30} y={130} width={520} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={40} y={148} fontSize={10} fontWeight={600} fill={COLORS.red}>
            为什么需要 KL 惩罚？
          </text>
          <text x={40} y={162} fontSize={10} fill={COLORS.mid}>
            没有 KL → LLM 会 "hack" RM（学会讨好评分器而非真正变好）→ Reward Hacking
          </text>
        </svg>
      ),
    },
    {
      title: 'PPO 更新策略',
      content: (
        <svg viewBox={`0 0 ${W} 190`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 4: PPO 更新 LLM 参数
          </text>

          <rect x={30} y={45} width={520} height={70} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={50} y={65} fontSize={11} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
            L_CLIP = E[min(ratio·A, clip(ratio, 1-ε, 1+ε)·A)]
          </text>
          <text x={50} y={85} fontSize={10} fill={COLORS.dark}>
            ratio = π_θ(token|context) / π_θ_old(token|context)
          </text>
          <text x={50} y={103} fontSize={10} fill={COLORS.mid}>
            A {'>'} 0 的 token → 增加生成概率（但不超过 1+ε）| A {'<'} 0 → 减少（但不低于 1-ε）
          </text>

          <rect x={30} y={130} width={250} height={44} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={155} y={148} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>游戏 RL</text>
          <text x={155} y={164} textAnchor="middle" fontSize={9} fill={COLORS.mid}>一个 episode → 一个 reward</text>

          <rect x={300} y={130} width={250} height={44} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={425} y={148} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>LLM RLHF</text>
          <text x={425} y={164} textAnchor="middle" fontSize={9} fill={COLORS.mid}>每个 token = 一步 → RM 给整体评分</text>
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
git add src/components/interactive/PPOForLLM.tsx
git commit -m "feat(rl): add PPOForLLM StepNavigator component"
```

---

## Task 22: Article 3 MDX — ppo-actor-critic

**Files:**
- Create: `src/content/articles/zh/ppo-actor-critic.mdx`

- [ ] **Step 1: Create article MDX**

```mdx
---
title: "Actor-Critic 与 PPO：稳定的策略优化"
slug: ppo-actor-critic
locale: zh
tags: [actor-critic, ppo, gae, advantage, clipping, trust-region]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [policy-gradient]
references:
  - type: paper
    title: "Proximal Policy Optimization Algorithms (Schulman et al., 2017)"
    url: "https://arxiv.org/abs/1707.06347"
  - type: paper
    title: "High-Dimensional Continuous Control Using Generalized Advantage Estimation (Schulman et al., 2016)"
    url: "https://arxiv.org/abs/1506.02438"
  - type: paper
    title: "Trust Region Policy Optimization (Schulman et al., 2015)"
    url: "https://arxiv.org/abs/1502.05477"
  - type: blog
    title: "Policy Gradient Algorithms — Lilian Weng"
    url: "https://lilianweng.github.io/posts/2018-04-08-policy-gradient/"
  - type: course
    title: "UC Berkeley CS285 Lectures 7-9"
    url: "http://rail.eecs.berkeley.edu/deeprlcourse/"
  - type: course
    title: "Hugging Face Deep RL Course: PPO"
    url: "https://huggingface.co/learn/deep-rl-course/unit8/introduction"
---

import ActorCriticArchitecture from '../../../components/interactive/ActorCriticArchitecture.tsx';
import GAELambdaSlider from '../../../components/interactive/GAELambdaSlider.tsx';
import TrustRegionViz from '../../../components/interactive/TrustRegionViz.tsx';
import PPOClipExplainer from '../../../components/interactive/PPOClipExplainer.tsx';
import PPOvsVanillaPG from '../../../components/interactive/PPOvsVanillaPG.tsx';
import PPOForLLM from '../../../components/interactive/PPOForLLM.tsx';

## Actor-Critic 架构

上一篇我们看到 REINFORCE + Baseline 的思路：用 $V(s)$ 作为 baseline 来降低方差。但 REINFORCE 仍然需要采样完整 trajectory 才能更新。

**Actor-Critic** 更进一步：用一个独立的神经网络（Critic）来学习 $V(s)$，这样每走一步就可以计算 TD error 作为 Advantage 信号：

$$\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$$

这个 $\delta_t$ 就是 **Advantage 的一步估计**：如果实际获得的 reward + 下一状态价值比预期的当前状态价值高，说明这个动作"比预期好"。

<ActorCriticArchitecture client:visible />

两个网络各司其职：
- **Actor** $\pi(a|s;\theta)$：策略网络，决定采取什么动作
- **Critic** $V(s;w)$：价值网络，评估状态好坏

## GAE：平衡偏差与方差

一步 TD error $\delta_t$ 偏差大但方差小；Monte Carlo return 偏差小但方差大。**GAE（Generalized Advantage Estimation）**用参数 $\lambda$ 在两者之间平滑插值：

$$\hat{A}_t^{GAE(\gamma,\lambda)} = \sum_{l=0}^{\infty} (\gamma\lambda)^l \delta_{t+l}$$

- $\lambda = 0$：只用一步 TD error（高偏差、低方差）
- $\lambda = 1$：等价于 Monte Carlo return（低偏差、高方差）
- 实践中 $\lambda = 0.95 \sim 0.97$ 效果最好

<GAELambdaSlider client:visible />

## Trust Region 问题

Policy Gradient 有一个致命的实际问题：**步长太大策略会崩溃，步长太小收敛太慢**。

普通梯度下降无法保证策略更新后性能不会骤降。一个看似合理的梯度方向，如果步长过大，可能让策略跳到完全不同的行为模式，导致性能灾难性崩溃。

**TRPO (Trust Region Policy Optimization)** 的解决方案是：在每次更新时添加 KL 散度约束，确保新旧策略"足够接近"：

$$\max_\theta \hat{\mathbb{E}}\left[\frac{\pi_\theta(a|s)}{\pi_{\theta_{old}}(a|s)} \hat{A}\right] \quad \text{s.t. } KL(\pi_{\theta_{old}} \| \pi_\theta) \leq \delta$$

<TrustRegionViz client:visible />

## PPO：简单有效的信任域方法

TRPO 虽然理论优美，但带约束优化计算复杂。**PPO（Proximal Policy Optimization）**用一个巧妙的 clip 操作实现了类似效果：

$$L^{CLIP}(\theta) = \hat{\mathbb{E}}\left[\min\left(r_t(\theta)\hat{A}_t, \; \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t\right)\right]$$

其中 $r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{old}}(a_t|s_t)}$ 是新旧策略的概率比。

**Clip 的直觉**：
- 当 $\hat{A} > 0$（好动作）：ratio 超过 $1+\epsilon$ 后 objective 不再增长，阻止过度增大概率
- 当 $\hat{A} < 0$（坏动作）：ratio 低于 $1-\epsilon$ 后 objective 不再减小，阻止过度减小概率

这种"pessimistic"策略确保每次更新都在安全范围内。

<PPOClipExplainer client:visible />

<PPOvsVanillaPG client:visible />

## PPO 在 LLM 中的角色

当 PPO 遇到 LLM，RL 的概念发生了有趣的对应：

| 游戏 RL | LLM RLHF |
|---------|----------|
| 环境状态 $s$ | Prompt + 已生成的 tokens |
| 动作 $a$ | 下一个 token |
| 策略 $\pi(a|s)$ | LLM 的 next-token 分布 |
| Trajectory | 一个完整回答 |
| Reward | RM score - β·KL penalty |
| Episode 结束 | 生成 EOS token |

**KL 惩罚** $\beta \cdot KL(\pi_\theta \| \pi_{ref})$ 是 LLM RLHF 的关键补充：它防止 LLM 偏离预训练分布太远，避免 reward hacking（后续文章详述）。

<PPOForLLM client:visible />

## 总结

本文介绍了从 Actor-Critic 到 PPO 的演进：

1. **Actor-Critic** 用 Critic 网络提供逐步 Advantage 信号，告别完整 trajectory 依赖
2. **GAE** 用 λ 参数在偏差和方差之间优雅权衡
3. **Trust Region** 解决策略更新步长问题，防止性能崩溃
4. **PPO** 用 clip 操作简化信任域约束，成为最实用的策略优化算法
5. **PPO + LLM** 将 token 生成映射为 RL 动作序列，加上 KL 惩罚防止偏离

PPO 是 RLHF 的核心引擎。下一篇我们将完整介绍 RLHF pipeline：SFT → Reward Model → PPO，看 PPO 如何在实际中对齐 LLM。
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/ppo-actor-critic.mdx
git commit -m "feat(rl): add ppo-actor-critic article with 6 components"
```

---

## Task 23: RLHFPipeline

**Files:**
- Create: `src/components/interactive/RLHFPipeline.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface Stage {
  id: string;
  label: string;
  x: number;
  color: string;
  inputs: string;
  outputs: string;
  loss: string;
  detail: string;
}

const STAGES: Stage[] = [
  {
    id: 'sft', label: 'SFT', x: 100, color: COLORS.primary,
    inputs: '高质量 (prompt, response) 对',
    outputs: 'SFT Model π_SFT',
    loss: 'Cross-entropy loss (标准语言模型 loss)',
    detail: '用人工编写的高质量回答做监督微调。模型学会遵循指令的基本能力，但还不知道什么回答"更好"。'
  },
  {
    id: 'rm', label: 'Reward\nModel', x: 290, color: COLORS.orange,
    inputs: 'prompt + (response_w, response_l) 偏好对',
    outputs: 'Reward Model r_φ',
    loss: 'Bradley-Terry ranking loss',
    detail: '人类标注者比较两个回答，选择更好的。RM 学习将"更好"量化为分数。通常训练数万到十万个偏好对。'
  },
  {
    id: 'ppo', label: 'PPO\n优化', x: 480, color: COLORS.green,
    inputs: 'prompts + π_SFT (ref) + r_φ',
    outputs: '对齐后的 LLM π_θ',
    loss: 'PPO clipped objective + KL penalty',
    detail: '用 RM 作为 reward 信号，PPO 优化 LLM 策略。KL 惩罚防止偏离 SFT 模型太远。这是计算最密集的阶段。'
  },
];

export default function RLHFPipeline() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const active = STAGES.find(s => s.id === activeStage);

  const stageY = 80;
  const boxW = 130, boxH = 55;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          RLHF 三阶段流水线
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          点击每个阶段查看详细数据流
        </text>

        {/* Stage boxes */}
        {STAGES.map((stage, i) => {
          const isActive = activeStage === stage.id;
          return (
            <g key={stage.id} onClick={() => setActiveStage(isActive ? null : stage.id)} style={{ cursor: 'pointer' }}>
              {/* Arrow from previous */}
              {i > 0 && (
                <line x1={STAGES[i - 1].x + boxW / 2 + 5} y1={stageY + boxH / 2}
                  x2={stage.x - boxW / 2 - 5} y2={stageY + boxH / 2}
                  stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrowRL)" />
              )}
              <rect x={stage.x - boxW / 2} y={stageY} width={boxW} height={boxH} rx={10}
                fill={isActive ? stage.color : COLORS.bgAlt}
                stroke={stage.color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={stage.x} y={stageY + boxH / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700}
                fill={isActive ? '#fff' : stage.color}>
                {stage.label.split('\n').map((line, li) => (
                  <tspan key={li} x={stage.x} dy={li === 0 ? -6 : 16}>{line}</tspan>
                ))}
              </text>
              {/* Step number */}
              <circle cx={stage.x - boxW / 2 + 12} cy={stageY - 8} r={10} fill={stage.color} />
              <text x={stage.x - boxW / 2 + 12} y={stageY - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
                {i + 1}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="arrowRL" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Data flow labels */}
        <text x={195} y={stageY - 4} textAnchor="middle" fontSize={9} fill={COLORS.mid}>π_SFT</text>
        <text x={385} y={stageY - 4} textAnchor="middle" fontSize={9} fill={COLORS.mid}>r_φ</text>

        {/* Detail panel */}
        {active ? (
          <g>
            <rect x={30} y={170} width={520} height={230} rx={8} fill={COLORS.bgAlt} stroke={active.color} strokeWidth={1.5} />
            <text x={50} y={195} fontSize={14} fontWeight={700} fill={active.color}>
              阶段 {STAGES.indexOf(active) + 1}: {active.label.replace('\n', ' ')}
            </text>

            <text x={50} y={220} fontSize={11} fontWeight={600} fill={COLORS.dark}>输入：</text>
            <text x={100} y={220} fontSize={11} fill={COLORS.mid}>{active.inputs}</text>

            <text x={50} y={244} fontSize={11} fontWeight={600} fill={COLORS.dark}>输出：</text>
            <text x={100} y={244} fontSize={11} fill={COLORS.mid}>{active.outputs}</text>

            <text x={50} y={268} fontSize={11} fontWeight={600} fill={COLORS.dark}>Loss：</text>
            <text x={100} y={268} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.mono}>{active.loss}</text>

            <line x1={50} y1={284} x2={530} y2={284} stroke={COLORS.light} strokeWidth={1} />

            <text x={50} y={304} fontSize={11} fill={COLORS.dark}>{active.detail.substring(0, 70)}</text>
            <text x={50} y={322} fontSize={11} fill={COLORS.dark}>{active.detail.substring(70, 140)}</text>
            <text x={50} y={340} fontSize={11} fill={COLORS.mid}>{active.detail.substring(140)}</text>
          </g>
        ) : (
          <g>
            <rect x={30} y={170} width={520} height={230} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={W / 2} y={250} textAnchor="middle" fontSize={13} fill={COLORS.mid}>
              ← 点击上方阶段查看详情 →
            </text>
            <text x={W / 2} y={280} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
              SFT: 学会遵循指令 → RM: 量化人类偏好 → PPO: 优化策略使 LLM 对齐
            </text>
            <text x={W / 2} y={310} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
              这是 InstructGPT (2022) 和 ChatGPT 使用的核心训练流程
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
git add src/components/interactive/RLHFPipeline.tsx
git commit -m "feat(rl): add RLHFPipeline component"
```

---

## Task 24: PreferenceLabeling

**Files:**
- Create: `src/components/interactive/PreferenceLabeling.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 440;

interface Example {
  prompt: string;
  responseA: string;
  responseB: string;
  better: 'A' | 'B';
}

const EXAMPLES: Example[] = [
  {
    prompt: '解释量子纠缠',
    responseA: '量子纠缠是两个粒子间的一种奇妙关联，测量一个粒子会瞬间影响另一个，无论距离多远。这种"超距作用"困扰了爱因斯坦...',
    responseB: '量子纠缠是一个复杂的量子力学概念。简单来说就是粒子之间有关联。这个概念很难理解。',
    better: 'A',
  },
  {
    prompt: '写一首关于春天的诗',
    responseA: '春天来了\n花开了\n鸟叫了\n天暖了',
    responseB: '东风拂柳绿丝绦，\n雨润百花次第开。\n燕子衔泥筑新巢，\n一池春水映楼台。',
    better: 'B',
  },
  {
    prompt: '如何提高代码质量',
    responseA: '1. 写单元测试 2. Code Review 3. 使用 linter 4. 保持函数小巧 5. 有意义的命名 6. 避免过早优化...',
    responseB: '多写代码就好了，熟能生巧。',
    better: 'A',
  },
];

export default function PreferenceLabeling() {
  const [exIdx, setExIdx] = useState(0);
  const [choices, setChoices] = useState<('A' | 'B' | null)[]>([null, null, null]);
  const [showResult, setShowResult] = useState(false);

  const ex = EXAMPLES[exIdx];
  const choice = choices[exIdx];

  const choose = (c: 'A' | 'B') => {
    const newChoices = [...choices];
    newChoices[exIdx] = c;
    setChoices(newChoices);
    setShowResult(true);
  };

  const next = () => {
    setShowResult(false);
    setExIdx((exIdx + 1) % EXAMPLES.length);
  };

  const completed = choices.filter(c => c !== null).length;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          偏好标注模拟器
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          选择你认为更好的回答 | 已标注 {completed}/3
        </text>

        {/* Prompt */}
        <rect x={30} y={55} width={520} height={32} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
        <text x={40} y={68} fontSize={10} fontWeight={600} fill={COLORS.primary}>Prompt:</text>
        <text x={95} y={68} fontSize={11} fill={COLORS.dark}>{ex.prompt}</text>

        {/* Response A */}
        <rect x={30} y={95} width={250} height={120} rx={6}
          fill={choice === 'A' ? (showResult && ex.better === 'A' ? '#d4edda' : showResult ? COLORS.waste : COLORS.highlight) : COLORS.bgAlt}
          stroke={choice === 'A' ? COLORS.primary : COLORS.light} strokeWidth={choice === 'A' ? 2 : 1}
          onClick={() => !showResult && choose('A')} style={{ cursor: showResult ? 'default' : 'pointer' }} />
        <text x={40} y={112} fontSize={10} fontWeight={700} fill={COLORS.dark}>回答 A</text>
        {ex.responseA.split('\n').map((line, i) => (
          <text key={i} x={40} y={128 + i * 16} fontSize={10} fill={COLORS.mid}>
            {line.substring(0, 35)}{line.length > 35 ? '...' : ''}
          </text>
        ))}

        {/* Response B */}
        <rect x={300} y={95} width={250} height={120} rx={6}
          fill={choice === 'B' ? (showResult && ex.better === 'B' ? '#d4edda' : showResult ? COLORS.waste : COLORS.highlight) : COLORS.bgAlt}
          stroke={choice === 'B' ? COLORS.primary : COLORS.light} strokeWidth={choice === 'B' ? 2 : 1}
          onClick={() => !showResult && choose('B')} style={{ cursor: showResult ? 'default' : 'pointer' }} />
        <text x={310} y={112} fontSize={10} fontWeight={700} fill={COLORS.dark}>回答 B</text>
        {ex.responseB.split('\n').map((line, i) => (
          <text key={i} x={310} y={128 + i * 16} fontSize={10} fill={COLORS.mid}>
            {line.substring(0, 35)}{line.length > 35 ? '...' : ''}
          </text>
        ))}

        {/* Result feedback */}
        {showResult && (
          <g>
            <rect x={30} y={225} width={520} height={40} rx={6}
              fill={choice === ex.better ? '#d4edda' : COLORS.waste}
              stroke={choice === ex.better ? COLORS.green : COLORS.red} strokeWidth={1} />
            <text x={W / 2} y={248} textAnchor="middle" fontSize={12} fontWeight={600}
              fill={choice === ex.better ? COLORS.green : COLORS.red}>
              {choice === ex.better ? '✓ 与多数标注者一致！' : `✗ 多数标注者选择了回答 ${ex.better}`}
            </text>
          </g>
        )}

        {/* How RM learns from this */}
        <rect x={30} y={275} width={520} height={80} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={40} y={295} fontSize={11} fontWeight={600} fill={COLORS.dark}>
          Reward Model 如何学习
        </text>
        <text x={40} y={315} fontSize={10} fill={COLORS.mid}>
          每个偏好对 (y_w ≻ y_l) → Bradley-Terry 模型: P(y_w ≻ y_l) = σ(r(y_w) - r(y_l))
        </text>
        <text x={40} y={333} fontSize={10} fill={COLORS.mid}>
          RM 学习给"更好"的回答更高分，给"更差"的更低分 → 将人类偏好量化为标量 reward
        </text>

        {/* Progress dots */}
        {EXAMPLES.map((_, i) => (
          <circle key={i} cx={W / 2 - 20 + i * 20} cy={H - 56} r={6}
            fill={choices[i] !== null ? COLORS.green : i === exIdx ? COLORS.primary : COLORS.light}
            stroke={i === exIdx ? COLORS.primary : 'none'} strokeWidth={2} />
        ))}

        {/* Next button */}
        {showResult && (
          <g onClick={next} style={{ cursor: 'pointer' }}>
            <rect x={W / 2 - 40} y={H - 42} width={80} height={28} rx={5} fill={COLORS.primary} />
            <text x={W / 2} y={H - 24} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
              下一题 →
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
git add src/components/interactive/PreferenceLabeling.tsx
git commit -m "feat(rl): add PreferenceLabeling component"
```

---

## Task 25: RewardModelTraining (StepNavigator)

**Files:**
- Create: `src/components/interactive/RewardModelTraining.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function RewardModelTraining() {
  const steps = [
    {
      title: '偏好对收集',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 1: 收集人类偏好数据
          </text>

          {/* Data collection flow */}
          {[0, 1, 2].map(i => {
            const y = 45 + i * 50;
            return (
              <g key={i}>
                <rect x={30} y={y} width={80} height={32} rx={4} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
                <text x={70} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.primary}>Prompt {i + 1}</text>

                <rect x={130} y={y} width={70} height={32} rx={4} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
                <text x={165} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.green}>y_w ✓</text>

                <rect x={210} y={y} width={70} height={32} rx={4} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
                <text x={245} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.red}>y_l ✗</text>

                <text x={300} y={y + 20} fontSize={12} fill={COLORS.mid}>→</text>

                <rect x={320} y={y} width={100} height={32} rx={4} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
                <text x={370} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.dark}>偏好对 (w≻l)</text>
              </g>
            );
          })}

          <rect x={440} y={50} width={120} height={100} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={500} y={85} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>偏好数据集</text>
          <text x={500} y={103} textAnchor="middle" fontSize={9} fill={COLORS.mid}>~10K-100K 对</text>
          <text x={500} y={118} textAnchor="middle" fontSize={9} fill={COLORS.mid}>人工标注</text>
        </svg>
      ),
    },
    {
      title: 'Bradley-Terry 概率建模',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 2: Bradley-Terry 模型
          </text>

          <rect x={30} y={40} width={520} height={55} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={W / 2} y={62} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
            P(y_w ≻ y_l | x) = σ(r_φ(x, y_w) - r_φ(x, y_l))
          </text>
          <text x={W / 2} y={82} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            σ = sigmoid | r_φ = Reward Model 输出的标量分数
          </text>

          {/* Intuition diagram */}
          <text x={100} y={118} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>直觉：</text>

          <rect x={30} y={125} width={100} height={30} rx={4} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={80} y={144} textAnchor="middle" fontSize={10} fill={COLORS.green}>r(y_w) = 3.2</text>

          <text x={145} y={144} fontSize={14} fill={COLORS.mid}>-</text>

          <rect x={160} y={125} width={100} height={30} rx={4} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={210} y={144} textAnchor="middle" fontSize={10} fill={COLORS.red}>r(y_l) = 1.1</text>

          <text x={275} y={144} fontSize={14} fill={COLORS.mid}>→</text>

          <text x={320} y={144} fontSize={11} fill={COLORS.dark} fontFamily={FONTS.mono}>Δ = 2.1</text>
          <text x={390} y={144} fontSize={11} fill={COLORS.dark}>→</text>
          <text x={440} y={144} fontSize={11} fontWeight={600} fill={COLORS.green} fontFamily={FONTS.mono}>σ(2.1) = 89%</text>

          <text x={W / 2} y={180} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            分数差越大 → 选择概率越高 → 模型越"自信"这个偏好排序是对的
          </text>
        </svg>
      ),
    },
    {
      title: 'Ranking Loss 训练',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 3: 训练 Reward Model
          </text>

          <rect x={30} y={40} width={520} height={50} rx={8} fill={COLORS.bgAlt} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={W / 2} y={60} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.orange} fontFamily={FONTS.mono}>
            L(φ) = -E[log σ(r_φ(x,y_w) - r_φ(x,y_l))]
          </text>
          <text x={W / 2} y={78} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            最大化"赢家比输家分高"的概率 → RM 学会排序
          </text>

          {/* Training diagram */}
          <rect x={30} y={105} width={120} height={36} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={90} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.primary}>SFT Model</text>
          <text x={90} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>（初始化 RM）</text>

          <text x={165} y={127} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={180} y={105} width={120} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={240} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>RM Training</text>
          <text x={240} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>ranking loss</text>

          <text x={315} y={127} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={330} y={105} width={120} height={36} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={390} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>Reward Model</text>
          <text x={390} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>r_φ(x, y) → 标量分数</text>

          <rect x={30} y={155} width={520} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={40} y={172} fontSize={10} fontWeight={600} fill={COLORS.orange}>关键点：</text>
          <text x={110} y={172} fontSize={10} fill={COLORS.mid}>
            RM 通常是比 policy LLM 小的模型 | 输出一个标量分数而非文本 | 从 SFT 模型初始化
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
git add src/components/interactive/RewardModelTraining.tsx
git commit -m "feat(rl): add RewardModelTraining StepNavigator component"
```

---

## Task 26: KLPenaltyViz

**Files:**
- Create: `src/components/interactive/KLPenaltyViz.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function KLPenaltyViz() {
  const [beta, setBeta] = useState(0.1);

  const data = useMemo(() => {
    const points = 50;
    const result: { step: number; rmScore: number; klDiv: number; totalReward: number }[] = [];

    for (let i = 0; i < points; i++) {
      const t = i / points;
      // RM score increases then plateaus as model optimizes
      const rmScore = 3 * (1 - Math.exp(-t * 5)) + Math.random() * 0.3;
      // KL divergence grows as model drifts from reference
      const klDiv = t * t * 20 + Math.random() * 0.5;
      const totalReward = rmScore - beta * klDiv;
      result.push({ step: i, rmScore, klDiv, totalReward });
    }
    return result;
  }, [beta]);

  const chartX = 50, chartY = 90, chartW = 480, chartH = 200;

  const maxRM = Math.max(...data.map(d => d.rmScore));
  const maxKL = Math.max(...data.map(d => d.klDiv));
  const maxTotal = Math.max(...data.map(d => Math.abs(d.totalReward)));

  const toY = (val: number, max: number) => chartY + chartH / 2 - (val / max) * (chartH / 2 - 10);

  const drawLine = (getData: (d: typeof data[0]) => number, max: number, color: string) => {
    const points = data.map((d, i) => {
      const x = chartX + (i / (data.length - 1)) * chartW;
      const y = toY(getData(d), max);
      return `${x},${y}`;
    }).join(' ');
    return <polyline points={points} fill="none" stroke={color} strokeWidth={2} />;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          KL 惩罚系数 β 的影响
        </text>

        {/* Beta slider */}
        <text x={W / 2} y={48} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          β = {beta.toFixed(2)}
        </text>
        <text x={50} y={68} fontSize={9} fill={COLORS.mid}>β=0 (无惩罚→reward hacking)</text>
        <text x={W - 50} y={68} textAnchor="end" fontSize={9} fill={COLORS.mid}>β=0.5 (强约束→几乎没优化)</text>
        <rect x={50} y={74} width={480} height={6} rx={3} fill={COLORS.light} />
        <circle cx={50 + (beta / 0.5) * 480} cy={77} r={7} fill={COLORS.primary} stroke="#fff" strokeWidth={2} />
        <rect x={50} y={64} width={480} height={26} fill="transparent" style={{ cursor: 'pointer' }}
          onMouseDown={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const update = (clientX: number) => {
              const x = (clientX - rect.left) / rect.width;
              setBeta(Math.max(0, Math.min(0.5, x * 0.5)));
            };
            update(e.clientX);
            const onMove = (ev: MouseEvent) => update(ev.clientX);
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        />

        {/* Chart */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <line x1={chartX} y1={chartY + chartH / 2} x2={chartX + chartW} y2={chartY + chartH / 2}
          stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4 3" />

        {drawLine(d => d.rmScore, maxRM, COLORS.green)}
        {drawLine(d => -d.klDiv * beta, maxTotal, COLORS.red)}
        {drawLine(d => d.totalReward, maxTotal, COLORS.primary)}

        {/* Legend */}
        {[
          { color: COLORS.green, label: 'RM Score (质量)' },
          { color: COLORS.red, label: '-β·KL (惩罚)' },
          { color: COLORS.primary, label: 'Total Reward (实际优化目标)' },
        ].map((item, i) => (
          <g key={i}>
            <line x1={chartX + 8} y1={chartY + 12 + i * 16} x2={chartX + 24} y2={chartY + 12 + i * 16}
              stroke={item.color} strokeWidth={2} />
            <text x={chartX + 30} y={chartY + 16 + i * 16} fontSize={9} fill={COLORS.dark}>{item.label}</text>
          </g>
        ))}

        {/* X axis */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          训练步数
        </text>

        {/* Insight */}
        <rect x={40} y={H - 52} width={500} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 34} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {beta < 0.05 ? '⚠️ β 太小：KL 几乎无惩罚 → 模型会 reward hack（RM score 高但实际质量下降）' :
           beta < 0.2 ? '✓ β 适中：RM score 和 KL 惩罚平衡 → 稳定的对齐效果' :
           '⚠️ β 太大：KL 惩罚过强 → 模型几乎不变，等于白训练'}
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
git add src/components/interactive/KLPenaltyViz.tsx
git commit -m "feat(rl): add KLPenaltyViz component"
```

---

## Task 27: RewardHackingDemo

**Files:**
- Create: `src/components/interactive/RewardHackingDemo.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface HackExample {
  label: string;
  rmScore: number;
  trueQuality: string;
  output: string;
  hackType: string;
}

const WITHOUT_KL: HackExample[] = [
  { label: '冗长回答', rmScore: 0.92, trueQuality: '低', output: '非常感谢您提出这个非常好的问题！让我来为您详细解答这个非常重要的问题。首先，我想说...（后面重复废话 500 字）', hackType: 'RM 偏好长回答 → 模型学会注水' },
  { label: '讨好措辞', rmScore: 0.88, trueQuality: '中', output: '这是一个非常棒的问题！您真是太聪明了！让我来回答...\n（实际内容很浅）', hackType: 'RM 被赞美性语言欺骗 → 内容空洞' },
  { label: '格式 Hack', rmScore: 0.95, trueQuality: '低', output: '## 答案\n\n### 第一点\n- 项目1\n- 项目2\n\n### 第二点\n...（格式完美但内容重复）', hackType: 'RM 偏好格式化输出 → 形式大于内容' },
];

const WITH_KL: HackExample[] = [
  { label: '简洁准确', rmScore: 0.78, trueQuality: '高', output: '量子纠缠是两个量子粒子间的非经典关联。当两个粒子处于纠缠态时，对其中一个的测量会瞬间确定另一个的状态，与距离无关。', hackType: 'KL 约束防止偏离 → 保持预训练质量' },
];

export default function RewardHackingDemo() {
  const [showKL, setShowKL] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const examples = showKL ? WITH_KL : WITHOUT_KL;
  const ex = examples[Math.min(activeIdx, examples.length - 1)];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Reward Hacking 对比展示
        </text>

        {/* Toggle */}
        <g onClick={() => { setShowKL(!showKL); setActiveIdx(0); }} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 90} y={36} width={180} height={26} rx={13}
            fill={showKL ? COLORS.green : COLORS.red} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showKL ? '✓ 有 KL 约束（正常）' : '✗ 无 KL 约束（Reward Hacking）'}
          </text>
        </g>

        {/* Example tabs */}
        {examples.map((e, i) => (
          <g key={i} onClick={() => setActiveIdx(i)} style={{ cursor: 'pointer' }}>
            <rect x={30 + i * 140} y={72} width={130} height={26} rx={5}
              fill={activeIdx === i ? COLORS.primary : COLORS.bgAlt}
              stroke={COLORS.mid} strokeWidth={1} />
            <text x={95 + i * 140} y={89} textAnchor="middle" fontSize={10}
              fontWeight={activeIdx === i ? 600 : 400} fill={activeIdx === i ? '#fff' : COLORS.dark}>
              {e.label}
            </text>
          </g>
        ))}

        {/* Score panel */}
        <rect x={30} y={108} width={250} height={70} rx={8} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={45} y={128} fontSize={11} fontWeight={600} fill={COLORS.dark}>RM Score:</text>
        <text x={130} y={128} fontSize={16} fontWeight={700}
          fill={ex.rmScore > 0.85 ? COLORS.green : COLORS.orange} fontFamily={FONTS.mono}>
          {ex.rmScore.toFixed(2)}
        </text>
        <text x={45} y={150} fontSize={11} fontWeight={600} fill={COLORS.dark}>真实质量:</text>
        <text x={130} y={150} fontSize={14} fontWeight={700}
          fill={ex.trueQuality === '高' ? COLORS.green : ex.trueQuality === '中' ? COLORS.orange : COLORS.red}>
          {ex.trueQuality}
        </text>
        <text x={45} y={168} fontSize={9} fill={COLORS.mid}>
          {!showKL && ex.rmScore > 0.85 && ex.trueQuality !== '高' ? '⚠️ RM 分高但质量不高 = Reward Hacking' : ''}
        </text>

        {/* Hack type */}
        <rect x={300} y={108} width={250} height={70} rx={8}
          fill={showKL ? '#d4edda' : COLORS.waste}
          stroke={showKL ? COLORS.green : COLORS.red} strokeWidth={1} />
        <text x={310} y={128} fontSize={10} fontWeight={600} fill={showKL ? COLORS.green : COLORS.red}>
          {showKL ? '正常行为' : 'Hack 类型'}
        </text>
        <text x={310} y={148} fontSize={10} fill={COLORS.dark}>
          {ex.hackType.substring(0, 35)}
        </text>
        <text x={310} y={164} fontSize={10} fill={COLORS.mid}>
          {ex.hackType.substring(35)}
        </text>

        {/* Output preview */}
        <rect x={30} y={190} width={520} height={100} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={40} y={208} fontSize={10} fontWeight={600} fill={COLORS.dark}>模型输出预览：</text>
        {ex.output.split('\n').slice(0, 4).map((line, i) => (
          <text key={i} x={40} y={226 + i * 16} fontSize={10} fill={COLORS.mid}>
            {line.substring(0, 65)}{line.length > 65 ? '...' : ''}
          </text>
        ))}

        {/* Explanation */}
        <rect x={30} y={300} width={520} height={80} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={40} y={320} fontSize={11} fontWeight={600} fill={COLORS.orange}>
          {showKL ? '为什么 KL 约束有效？' : 'Goodhart\'s Law 在 RL 中的体现'}
        </text>
        <text x={40} y={340} fontSize={10} fill={COLORS.dark}>
          {showKL
            ? 'KL(π_θ ∥ π_ref) 限制了策略偏离预训练模型的程度。预训练模型虽然不完美，'
            : '"当一个度量成为目标时，它就不再是一个好的度量" — RM score 是 reward 的近似，'}
        </text>
        <text x={40} y={358} fontSize={10} fill={COLORS.mid}>
          {showKL
            ? '但至少输出流畅、有信息量。KL 约束确保对齐后的模型不会丧失这些基本能力。'
            : '但不完美。模型会找到最大化 score 但不真正提高质量的"捷径"。'}
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
git add src/components/interactive/RewardHackingDemo.tsx
git commit -m "feat(rl): add RewardHackingDemo component"
```

---

## Task 28: AlignmentMethodTimeline

**Files:**
- Create: `src/components/interactive/AlignmentMethodTimeline.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface Milestone {
  date: string;
  label: string;
  desc: string;
  tech: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  { date: '2017', label: 'RLHF 论文', desc: 'Christiano et al. 提出用人类偏好训练 RL agent', tech: 'Deep RL from Human Preferences', color: COLORS.primary },
  { date: '2019', label: 'Fine-Tuning LM', desc: 'Ziegler et al. 首次将 RLHF 应用于语言模型', tech: 'PPO + Reward Model', color: COLORS.primary },
  { date: '2022.1', label: 'InstructGPT', desc: 'OpenAI 3 阶段 pipeline: SFT → RM → PPO', tech: 'SFT + RM + PPO (1.3B 优于 175B)', color: COLORS.green },
  { date: '2022.11', label: 'ChatGPT', desc: '基于 InstructGPT 方法训练，引爆 AI 革命', tech: 'RLHF at scale', color: COLORS.green },
  { date: '2023.7', label: 'Llama 2', desc: 'Meta 开源 RLHF 模型，推动开源对齐', tech: 'RLHF + Safety RM', color: COLORS.orange },
  { date: '2023.12', label: 'DPO', desc: 'Rafailov et al. 直接从偏好优化，去掉 RM 和 PPO', tech: 'Direct Preference Optimization', color: COLORS.purple },
  { date: '2024.2', label: 'GRPO', desc: 'DeepSeek 组采样去掉 Critic，降低训练成本', tech: 'Group Relative Policy Optimization', color: COLORS.red },
  { date: '2025.1', label: 'DeepSeek-R1', desc: 'RL 训练涌现 reasoning 能力，开启 thinking 时代', tech: 'GRPO + Rule Reward', color: COLORS.red },
];

export default function AlignmentMethodTimeline() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const timelineX = 100;
  const timelineY = 50;
  const itemH = 42;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          LLM 对齐方法演进时间线
        </text>

        {/* Timeline line */}
        <line x1={timelineX} y1={timelineY} x2={timelineX} y2={timelineY + MILESTONES.length * itemH}
          stroke={COLORS.light} strokeWidth={2} />

        {/* Milestones */}
        {MILESTONES.map((ms, i) => {
          const y = timelineY + i * itemH;
          const isHovered = hoveredIdx === i;
          return (
            <g key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}>
              {/* Dot */}
              <circle cx={timelineX} cy={y + 10} r={isHovered ? 8 : 5}
                fill={ms.color} stroke="#fff" strokeWidth={2} />

              {/* Date */}
              <text x={timelineX - 15} y={y + 14} textAnchor="end" fontSize={10} fontWeight={600}
                fill={ms.color} fontFamily={FONTS.mono}>
                {ms.date}
              </text>

              {/* Label */}
              <text x={timelineX + 18} y={y + 10} fontSize={11} fontWeight={isHovered ? 700 : 600}
                fill={isHovered ? ms.color : COLORS.dark}>
                {ms.label}
              </text>
              <text x={timelineX + 18} y={y + 26} fontSize={9} fill={COLORS.mid}>
                {ms.tech}
              </text>
            </g>
          );
        })}

        {/* Detail panel */}
        {hoveredIdx !== null && (
          <g>
            <rect x={280} y={timelineY + hoveredIdx * itemH - 10} width={280} height={55} rx={8}
              fill={COLORS.bgAlt} stroke={MILESTONES[hoveredIdx].color} strokeWidth={1.5} />
            <text x={290} y={timelineY + hoveredIdx * itemH + 8} fontSize={11} fontWeight={700}
              fill={MILESTONES[hoveredIdx].color}>
              {MILESTONES[hoveredIdx].label} ({MILESTONES[hoveredIdx].date})
            </text>
            <text x={290} y={timelineY + hoveredIdx * itemH + 26} fontSize={10} fill={COLORS.dark}>
              {MILESTONES[hoveredIdx].desc.substring(0, 40)}
            </text>
            <text x={290} y={timelineY + hoveredIdx * itemH + 40} fontSize={10} fill={COLORS.mid}>
              {MILESTONES[hoveredIdx].desc.substring(40)}
            </text>
          </g>
        )}

        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          Hover 查看每个里程碑的详细信息
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
git add src/components/interactive/AlignmentMethodTimeline.tsx
git commit -m "feat(rl): add AlignmentMethodTimeline component"
```

---

## Task 29: Article 4 MDX — rlhf

**Files:**
- Create: `src/content/articles/zh/rlhf.mdx`

- [ ] **Step 1: Create article MDX**

```mdx
---
title: "RLHF：从人类反馈中学习"
slug: rlhf
locale: zh
tags: [rlhf, reward-model, alignment, instruct-gpt, kl-divergence]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [ppo-actor-critic]
references:
  - type: paper
    title: "Training language models to follow instructions with human feedback (Ouyang et al., 2022)"
    url: "https://arxiv.org/abs/2203.02155"
  - type: paper
    title: "Deep Reinforcement Learning from Human Preferences (Christiano et al., 2017)"
    url: "https://arxiv.org/abs/1706.03741"
  - type: paper
    title: "Fine-Tuning Language Models from Human Preferences (Ziegler et al., 2019)"
    url: "https://arxiv.org/abs/1909.08593"
  - type: blog
    title: "RLHF: Reinforcement Learning from Human Feedback — Chip Huyen"
    url: "https://huyenchip.com/2023/05/02/rlhf.html"
  - type: blog
    title: "RLHF 系列 — Nathan Lambert (interconnects.ai)"
    url: "https://www.interconnects.ai/"
  - type: blog
    title: "Reward Hacking in Reinforcement Learning — Lilian Weng"
    url: "https://lilianweng.github.io/posts/2024-11-28-reward-hacking/"
---

import RLHFPipeline from '../../../components/interactive/RLHFPipeline.tsx';
import PreferenceLabeling from '../../../components/interactive/PreferenceLabeling.tsx';
import RewardModelTraining from '../../../components/interactive/RewardModelTraining.tsx';
import KLPenaltyViz from '../../../components/interactive/KLPenaltyViz.tsx';
import RewardHackingDemo from '../../../components/interactive/RewardHackingDemo.tsx';
import AlignmentMethodTimeline from '../../../components/interactive/AlignmentMethodTimeline.tsx';

## 为什么需要对齐

预训练语言模型有一个根本问题：它的训练目标是"预测下一个 token"，而不是"成为一个有帮助、诚实、无害的助手"。这意味着：

- 模型可能**生成有害内容**（训练数据中包含有害文本）
- 模型**不遵循指令**（它学的是补全文本，不是回答问题）
- 模型会**编造事实**（它不理解"真实"，只理解"看起来合理"）
- 模型的**格式和风格**不符合用户期望

**对齐（Alignment）**的目标是让模型的行为符合人类的期望和价值观。挑战在于：**"有帮助且安全"无法直接编码为一个 loss function**。我们需要某种方式将人类偏好转化为优化信号——这就是 RLHF 的核心动机。

## RLHF 三阶段流程

InstructGPT (2022) 确立了 RLHF 的标准三阶段 pipeline：

<RLHFPipeline client:visible />

**阶段 1：SFT (Supervised Fine-Tuning)**
用人工编写的高质量 (prompt, response) 数据对预训练模型做监督微调。这让模型学会"遵循指令"的基本格式和能力。

**阶段 2：Reward Model 训练**
收集人类偏好数据——对同一个 prompt 的两个回答，标注哪个更好——训练一个 Reward Model 将人类偏好量化为标量分数。

**阶段 3：PPO 策略优化**
用 Reward Model 作为 reward 信号，PPO 优化 LLM 策略，使其生成的回答获得更高的 RM score。同时加入 KL 惩罚防止偏离。

## Reward Model 训练

Reward Model 的训练是 RLHF 最关键的一环。它需要将模糊的"人类偏好"转化为精确的数学信号。

<PreferenceLabeling client:visible />

训练数据是偏好对 $(y_w, y_l)$：对同一个 prompt $x$，人类标注者选择 $y_w$（赢家）优于 $y_l$（输家）。

**Bradley-Terry 模型**将偏好建模为概率：

$$P(y_w \succ y_l | x) = \sigma(r_\phi(x, y_w) - r_\phi(x, y_l))$$

训练损失函数：

$$\mathcal{L}(\phi) = -\mathbb{E}_{(x, y_w, y_l)}\left[\log \sigma(r_\phi(x, y_w) - r_\phi(x, y_l))\right]$$

<RewardModelTraining client:visible />

## PPO 对齐优化

有了 Reward Model，我们可以用 PPO 优化 LLM。优化目标是：

$$\max_\theta \; \mathbb{E}_{x \sim D, \; y \sim \pi_\theta(\cdot|x)}\left[r_\phi(x, y) - \beta \cdot KL(\pi_\theta \| \pi_{ref})\right]$$

其中 $\pi_{ref}$ 是 SFT 模型（作为参考策略），$\beta$ 是 KL 惩罚系数。

这个目标函数的含义：**最大化 RM score，但不要偏离预训练模型太远**。

## KL 约束的重要性

KL 散度 $KL(\pi_\theta \| \pi_{ref})$ 衡量新策略和参考策略之间的"距离"。$\beta$ 控制着这个约束的强度。

<KLPenaltyViz client:visible />

没有 KL 惩罚会怎样？模型会发现 RM 的弱点并疯狂利用——这就是 **Reward Hacking**。

<RewardHackingDemo client:visible />

## RLHF 的局限

虽然 RLHF 取得了巨大成功（InstructGPT、ChatGPT），但它也有明显的局限：

1. **Reward Model 是瓶颈**
   - RM 的质量直接限制了对齐效果的天花板
   - 人类偏好不一致（不同标注者可能给出相反判断）
   - RM 容易被 exploit（reward hacking）

2. **训练复杂度高**
   - 需要同时运行 4 个模型：policy、reference policy、reward model、critic
   - PPO 训练不稳定，超参数敏感
   - 计算资源需求大

3. **标注成本高**
   - 需要大量高质量偏好数据
   - 人类标注有噪音和偏见

这些局限催生了 DPO 和 GRPO 等替代方案——在下一篇文章中详述。

<AlignmentMethodTimeline client:visible />

## 总结

本文完整介绍了 RLHF 的三阶段流程：

1. **SFT** 让模型学会遵循指令的基本能力
2. **Reward Model** 将人类偏好量化为标量分数（Bradley-Terry 模型）
3. **PPO** 优化策略使 LLM 对齐，KL 惩罚防止 reward hacking
4. **Reward Hacking** 是没有 KL 约束时的主要风险
5. RLHF 虽成功但复杂 → 催生了 DPO、GRPO 等更简洁的方案

下一篇我们将深入 DPO 和 GRPO，看如何跳过 Reward Model 直接从偏好数据优化策略。
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/rlhf.mdx
git commit -m "feat(rl): add rlhf article with 6 components"
```

---

## Task 30: Update TODO.md

**Files:**
- Modify: `docs/TODO.md`

- [ ] **Step 1: Update TODO**

Change the RL item status from `- [ ]` to reflect progress:

```
- [ ] Reinforcement Learning (RLHF/GRPO/PPO) 专题 (来源: 2026-04-05)
```

Note: Keep as unchecked until all 7 articles are complete. No modification needed at this point — this is a checkpoint. Proceed to Part 3.

- [ ] **Step 2: Commit all Part 2 work if not already committed individually**

This is a checkpoint task. Each component was committed individually above.
