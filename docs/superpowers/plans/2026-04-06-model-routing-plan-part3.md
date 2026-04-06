# Model Routing 学习路径实现计划 — Part 3

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现第5篇（在线学习与成本优化，5 组件）和第6篇（多模型协作，5 组件）文章。

**Design reference:** `docs/superpowers/specs/2026-04-06-model-routing-design.md`

---

## Phase 5: 第5篇文章（5 个组件）

### Task 18: BanditExploration + RLRewardSignalViz 组件

**Files:**
- Create: `src/components/interactive/BanditExploration.tsx`
- Create: `src/components/interactive/RLRewardSignalViz.tsx`

- [ ] **Step 1: 创建 BanditExploration**

动画模拟组件，展示 Multi-armed Bandit 的 Explore vs Exploit 过程。

```tsx
import React, { useState, useCallback } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Arm {
  name: string;
  trueQuality: number; // hidden true mean reward
  trueCost: number;
  color: string;
}

const ARMS: Arm[] = [
  { name: 'GPT-4o', trueQuality: 0.95, trueCost: 0.03, color: '#6a1b9a' },
  { name: 'Claude Sonnet', trueQuality: 0.90, trueCost: 0.015, color: '#1565c0' },
  { name: 'Llama-70B', trueQuality: 0.82, trueCost: 0.005, color: '#2e7d32' },
  { name: 'GPT-4o-mini', trueQuality: 0.78, trueCost: 0.001, color: '#e65100' },
];

// Seeded pseudo-random for reproducibility
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function BanditExploration() {
  const [pulls, setPulls] = useState<{ arm: number; reward: number }[]>([]);
  const [estimates, setEstimates] = useState(ARMS.map(() => ({ sum: 0, count: 0 })));
  const [epsilon, setEpsilon] = useState(20); // explore rate %

  const pullArm = useCallback((armIdx: number) => {
    const arm = ARMS[armIdx];
    const seed = pulls.length * 7 + armIdx * 13 + 42;
    const noise = (seededRandom(seed) - 0.5) * 0.3;
    const reward = Math.max(0, Math.min(1, arm.trueQuality + noise));
    const netReward = reward - arm.trueCost * 10; // quality - normalized cost

    setPulls(prev => [...prev, { arm: armIdx, reward: netReward }]);
    setEstimates(prev => {
      const next = [...prev];
      next[armIdx] = {
        sum: prev[armIdx].sum + netReward,
        count: prev[armIdx].count + 1,
      };
      return next;
    });
  }, [pulls.length]);

  const autoStep = useCallback(() => {
    const seed = pulls.length * 17 + 99;
    const isExplore = seededRandom(seed) * 100 < epsilon;

    if (isExplore) {
      // Random arm
      const armIdx = Math.floor(seededRandom(seed + 1) * ARMS.length);
      pullArm(armIdx);
    } else {
      // Best estimated arm
      const avgs = estimates.map(e => e.count === 0 ? Infinity : e.sum / e.count);
      const bestIdx = avgs.indexOf(Math.max(...avgs.filter(v => v !== Infinity)));
      pullArm(bestIdx >= 0 ? bestIdx : 0);
    }
  }, [pulls.length, epsilon, estimates, pullArm]);

  const reset = () => {
    setPulls([]);
    setEstimates(ARMS.map(() => ({ sum: 0, count: 0 })));
  };

  const W = 580, H = 400;
  const totalPulls = pulls.length;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Multi-armed Bandit 探索
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          ε-greedy: {epsilon}% 探索 · {100 - epsilon}% 利用 · 共 {totalPulls} 次选择
        </text>

        {/* Arms */}
        {ARMS.map((arm, i) => {
          const x = 30 + i * 135;
          const est = estimates[i];
          const avg = est.count > 0 ? (est.sum / est.count).toFixed(3) : '?';
          const barH = est.count > 0 ? Math.max(5, (est.sum / est.count / 1) * 120) : 5;

          return (
            <g key={arm.name} transform={`translate(${x}, 55)`}>
              <rect x="0" y="0" width="125" height="160" rx="6"
                    fill={COLORS.bgAlt} stroke={arm.color} strokeWidth="1.5" />
              <text x="62.5" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="11" fontWeight="700" fill={arm.color}>
                {arm.name}
              </text>
              <text x="62.5" y="36" textAnchor="middle" fontFamily={FONTS.mono}
                    fontSize="9" fill={COLORS.mid}>
                选择 {est.count} 次
              </text>

              {/* Estimated value bar */}
              <rect x="15" y={140 - barH} width="95" height={barH} rx="3"
                    fill={arm.color} opacity="0.3" />
              <text x="62.5" y="155" textAnchor="middle" fontFamily={FONTS.mono}
                    fontSize="10" fill={COLORS.dark}>
                估值: {avg}
              </text>

              {/* Manual pull button */}
              <rect x="20" y="50" width="85" height="22" rx="4"
                    fill={arm.color} opacity="0.8"
                    style={{ cursor: 'pointer' }}
                    onClick={() => pullArm(i)} />
              <text x="62.5" y="65" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="10" fill="#fff" style={{ pointerEvents: 'none' }}>
                手动选择
              </text>
            </g>
          );
        })}

        {/* Recent history */}
        <g transform="translate(30, 230)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            最近选择:
          </text>
          {pulls.slice(-15).map((p, i) => (
            <rect key={i} x={80 + i * 30} y="-8" width="24" height="16" rx="3"
                  fill={ARMS[p.arm].color} opacity="0.7" />
          ))}
        </g>

        {/* Cumulative reward */}
        <g transform="translate(30, 258)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            累计 net reward: {pulls.reduce((s, p) => s + p.reward, 0).toFixed(2)}
          </text>
        </g>
      </svg>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button onClick={autoStep}
                className="px-3 py-1.5 bg-blue-700 text-white text-sm rounded hover:bg-blue-800">
          ε-greedy 一步
        </button>
        <button onClick={() => { for (let i = 0; i < 10; i++) setTimeout(() => autoStep(), i * 50); }}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          连续 10 步
        </button>
        <button onClick={reset}
                className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
          重置
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">ε:</span>
          <input type="range" min="0" max="100" value={epsilon}
                 onChange={e => setEpsilon(Number(e.target.value))}
                 className="w-24 accent-blue-700" />
          <span className="text-sm font-mono text-gray-500">{epsilon}%</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 RLRewardSignalViz**

循环图动画组件，展示 RL routing 的 state → action → reward 循环。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const EXAMPLES = [
  { query: '简单翻译', state: '低复杂度', action: '选 Llama-8B', quality: 0.85, cost: 0.001, reward: '0.85 - 0.01 = 0.84' },
  { query: '代码分析', state: '高复杂度', action: '选 GPT-4', quality: 0.95, cost: 0.03, reward: '0.95 - 0.30 = 0.65' },
  { query: '知识问答', state: '中等复杂度', action: '选 Llama-70B', quality: 0.88, cost: 0.005, reward: '0.88 - 0.05 = 0.83' },
];

export default function RLRewardSignalViz() {
  const [exIdx, setExIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const W = 580, H = 360;
  const ex = EXAMPLES[exIdx];

  const steps = [
    { label: 'State', detail: `Query: "${ex.query}" → ${ex.state}`, color: COLORS.primary },
    { label: 'Action', detail: ex.action, color: COLORS.green },
    { label: 'Reward', detail: `Quality(${ex.quality}) - Cost(${ex.cost}) = ${ex.reward}`, color: COLORS.orange },
    { label: 'Update', detail: '更新策略: 调整 query→model 映射权重', color: '#6a1b9a' },
  ];

  // Circular positions
  const cx = 200, cy = 180, R = 100;
  const positions = steps.map((_, i) => {
    const angle = (Math.PI * 2 * i) / steps.length - Math.PI / 2;
    return [cx + R * Math.cos(angle), cy + R * Math.sin(angle)];
  });

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          RL Routing: State → Action → Reward 循环
        </text>

        {/* Example selector */}
        <g transform="translate(140, 38)">
          {EXAMPLES.map((e, i) => (
            <g key={i} transform={`translate(${i * 110}, 0)`}
               onClick={() => { setExIdx(i); setActiveStep(0); }} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="100" height="22" rx="4"
                    fill={exIdx === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="50" y="15" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={exIdx === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {e.query}
              </text>
            </g>
          ))}
        </g>

        {/* Circular flow */}
        {/* Arrows between nodes */}
        {positions.map(([x, y], i) => {
          const next = positions[(i + 1) % positions.length];
          const dx = next[0] - x, dy = next[1] - y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / len, ny = dy / len;
          return (
            <line key={`arrow-${i}`}
                  x1={x + nx * 35} y1={y + ny * 35}
                  x2={next[0] - nx * 35} y2={next[1] - ny * 35}
                  stroke={i <= activeStep ? steps[i].color : COLORS.light}
                  strokeWidth="2"
                  markerEnd={`url(#arrow-rl-${i <= activeStep ? 'active' : 'inactive'})`} />
          );
        })}

        <defs>
          <marker id="arrow-rl-active" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.dark} />
          </marker>
          <marker id="arrow-rl-inactive" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.light} />
          </marker>
        </defs>

        {/* Nodes */}
        {steps.map((s, i) => {
          const [x, y] = positions[i];
          const isActive = i <= activeStep;
          return (
            <g key={i} onClick={() => setActiveStep(i)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="30"
                      fill={isActive ? s.color : COLORS.bgAlt}
                      opacity={isActive ? 0.15 : 1}
                      stroke={s.color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={x} y={y + 4} textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="11" fontWeight="700" fill={isActive ? s.color : COLORS.mid}>
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Detail panel */}
        <g transform="translate(350, 85)">
          <rect x="0" y="0" width="200" height="200" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="100" y="22" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="12" fontWeight="700" fill={steps[activeStep].color}>
            {steps[activeStep].label}
          </text>
          <text x="10" y="48" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {steps[activeStep].detail.length > 28
              ? steps[activeStep].detail.slice(0, 28)
              : steps[activeStep].detail}
          </text>
          {steps[activeStep].detail.length > 28 && (
            <text x="10" y="64" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
              {steps[activeStep].detail.slice(28)}
            </text>
          )}

          <text x="10" y="100" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>
            RL 关键公式:
          </text>
          <text x="10" y="118" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>
            R = Quality(a, q) - λ·Cost(a)
          </text>
          <text x="10" y="136" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            λ 控制成本敏感度:
          </text>
          <text x="10" y="152" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            λ大 → 偏好便宜模型
          </text>
          <text x="10" y="168" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            λ小 → 偏好高质量模型
          </text>
        </g>
      </svg>

      {/* Step controls */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                disabled={activeStep === 0}>
          ← 上一步
        </button>
        <span className="text-sm text-gray-500">
          Step {activeStep + 1} / {steps.length}
        </span>
        <button onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                disabled={activeStep === steps.length - 1}>
          下一步 →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/interactive/BanditExploration.tsx src/components/interactive/RLRewardSignalViz.tsx
git commit -m "feat: add BanditExploration and RLRewardSignalViz components"
```

---

### Task 19: ParetoFrontierViz + DynamicPriceAdaptation + BatchVsQueryRouting 组件

**Files:**
- Create: `src/components/interactive/ParetoFrontierViz.tsx`
- Create: `src/components/interactive/DynamicPriceAdaptation.tsx`
- Create: `src/components/interactive/BatchVsQueryRouting.tsx`

- [ ] **Step 1: 创建 ParetoFrontierViz**

散点+前沿线组件，展示 Pareto 前沿。可添加/移除模型看变化。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Model {
  name: string;
  quality: number; // 0-100
  cost: number; // 0-100
  color: string;
}

const ALL_MODELS: Model[] = [
  { name: 'Phi-3-mini', quality: 55, cost: 5, color: '#ef6c00' },
  { name: 'Llama-8B', quality: 62, cost: 10, color: COLORS.green },
  { name: 'GPT-4o-mini', quality: 78, cost: 15, color: '#4527a0' },
  { name: 'Mixtral-8x7B', quality: 75, cost: 25, color: '#00838f' },
  { name: 'Llama-70B', quality: 82, cost: 40, color: '#2e7d32' },
  { name: 'Claude Sonnet', quality: 90, cost: 60, color: '#1565c0' },
  { name: 'GPT-4o', quality: 95, cost: 95, color: '#6a1b9a' },
];

function computePareto(models: Model[]): Model[] {
  const sorted = [...models].sort((a, b) => a.cost - b.cost);
  const pareto: Model[] = [];
  let maxQuality = -1;
  for (const m of sorted) {
    if (m.quality > maxQuality) {
      pareto.push(m);
      maxQuality = m.quality;
    }
  }
  return pareto;
}

export default function ParetoFrontierViz() {
  const [enabled, setEnabled] = useState(new Set(ALL_MODELS.map((_, i) => i)));

  const toggle = (idx: number) => {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const activeModels = ALL_MODELS.filter((_, i) => enabled.has(i));
  const pareto = computePareto(activeModels);
  const paretoNames = new Set(pareto.map(p => p.name));

  const W = 580, H = 380;
  const pL = 70, pR = 420, pT = 55, pB = 280;
  const pW = pR - pL, pH = pB - pT;

  const getX = (cost: number) => pL + (cost / 100) * pW;
  const getY = (quality: number) => pB - (quality / 100) * pH;

  // Pareto frontier path
  const paretoPath = pareto.length > 0
    ? pareto.map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(p.cost)},${getY(p.quality)}`).join(' ')
    : '';

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={290} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Pareto 前沿：成本 vs 质量
        </text>
        <text x={290} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          点击右侧列表添加/移除模型，观察 Pareto 前沿变化
        </text>

        {/* Axes */}
        <line x1={pL} y1={pB} x2={pR} y2={pB} stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={pL} y1={pT} x2={pL} y2={pB} stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={(pL + pR) / 2} y={pB + 28} textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>成本 →</text>
        <text x={pL - 12} y={(pT + pB) / 2} textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}
              transform={`rotate(-90, ${pL - 12}, ${(pT + pB) / 2})`}>质量 →</text>

        {/* Pareto frontier line */}
        {paretoPath && (
          <path d={paretoPath} fill="none" stroke={COLORS.primary} strokeWidth="2.5" strokeDasharray="6,3" />
        )}

        {/* Model dots */}
        {activeModels.map(m => {
          const isPareto = paretoNames.has(m.name);
          return (
            <g key={m.name}>
              <circle cx={getX(m.cost)} cy={getY(m.quality)} r={isPareto ? 8 : 6}
                      fill={isPareto ? m.color : COLORS.light}
                      stroke={m.color} strokeWidth="2" />
              <text x={getX(m.cost)} y={getY(m.quality) - 12} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="9"
                    fontWeight={isPareto ? "700" : "400"} fill={m.color}>
                {m.name}
              </text>
            </g>
          );
        })}

        {/* Model toggle list */}
        <g transform="translate(435, 55)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            模型列表:
          </text>
          {ALL_MODELS.map((m, i) => {
            const isOn = enabled.has(i);
            const isPareto = isOn && paretoNames.has(m.name);
            return (
              <g key={m.name} transform={`translate(0, ${10 + i * 28})`}
                 onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
                <rect x="0" y="0" width="130" height="22" rx="3"
                      fill={isOn ? (isPareto ? COLORS.valid : COLORS.bgAlt) : COLORS.light}
                      stroke={isOn ? m.color : COLORS.mid} strokeWidth={isOn ? 1.5 : 0.5} />
                <circle cx="12" cy="11" r="4" fill={isOn ? m.color : COLORS.mid} />
                <text x="22" y="15" fontFamily={FONTS.sans} fontSize="9"
                      fill={isOn ? COLORS.dark : COLORS.mid}
                      style={{ pointerEvents: 'none' }}>
                  {m.name} {isPareto ? '⭐' : ''}
                </text>
              </g>
            );
          })}

          <text x="0" y={10 + ALL_MODELS.length * 28 + 10} fontFamily={FONTS.sans}
                fontSize="9" fill={COLORS.mid}>
            ⭐ = Pareto 最优
          </text>
          <text x="0" y={10 + ALL_MODELS.length * 28 + 24} fontFamily={FONTS.sans}
                fontSize="9" fill={COLORS.mid}>
            前沿上的模型在其成本下质量最高
          </text>
        </g>

        {/* Info */}
        <g transform="translate(40, 300)">
          <rect x="0" y="0" width="390" height="55" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="18" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            Pareto 前沿: {pareto.length} 个模型
          </text>
          <text x="15" y="36" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {pareto.map(p => p.name).join(' → ')}
          </text>
          <text x="15" y="50" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            添加新模型可能改变前沿 · ParetoBandit (2026) 在此基础上做 cost-aware 选择
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 DynamicPriceAdaptation**

时间序列组件，模拟价格波动下路由策略的动态调整。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// Simulated price series (10 time steps)
const TIME_STEPS = 10;
const MODELS_DATA = [
  { name: 'GPT-4o', baseCost: 30, priceVariation: [30, 32, 28, 35, 40, 38, 25, 30, 33, 29], color: '#6a1b9a' },
  { name: 'Claude Sonnet', baseCost: 15, priceVariation: [15, 14, 16, 15, 13, 18, 20, 16, 14, 15], color: '#1565c0' },
  { name: 'Llama-70B', baseCost: 5, priceVariation: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], color: '#2e7d32' }, // self-hosted, stable
];

// Which model the router picks at each time step (cost-aware)
function getRouterChoice(t: number): number {
  const prices = MODELS_DATA.map(m => m.priceVariation[t]);
  // Simple: if GPT-4o price spikes, prefer Claude; if Claude spikes, prefer Llama
  if (prices[0] > 35) return 1; // GPT-4 too expensive, use Claude
  if (prices[1] > 17) return 2; // Claude expensive, use Llama
  return 0; // default: GPT-4 (highest quality)
}

export default function DynamicPriceAdaptation() {
  const [timeStep, setTimeStep] = useState(0);

  const W = 580, H = 340;
  const chartL = 60, chartR = 420, chartT = 55, chartB = 220;
  const chartW = chartR - chartL, chartH = chartB - chartT;

  const getX = (t: number) => chartL + (t / (TIME_STEPS - 1)) * chartW;
  const getY = (price: number) => chartB - (price / 45) * chartH;

  const choice = getRouterChoice(timeStep);

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          动态价格适应
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          API 价格波动时路由策略自动调整 · 当前: T={timeStep}
        </text>

        {/* Axes */}
        <line x1={chartL} y1={chartB} x2={chartR} y2={chartB} stroke={COLORS.mid} strokeWidth="1" />
        <line x1={chartL} y1={chartT} x2={chartL} y2={chartB} stroke={COLORS.mid} strokeWidth="1" />

        {/* Price curves */}
        {MODELS_DATA.map(m => {
          const path = m.priceVariation.map((p, t) =>
            `${t === 0 ? 'M' : 'L'}${getX(t)},${getY(p)}`
          ).join(' ');
          return (
            <path key={m.name} d={path} fill="none" stroke={m.color} strokeWidth="2" />
          );
        })}

        {/* Current time marker */}
        <line x1={getX(timeStep)} y1={chartT} x2={getX(timeStep)} y2={chartB}
              stroke={COLORS.dark} strokeWidth="2" strokeDasharray="4,3" />

        {/* Price dots at current time */}
        {MODELS_DATA.map((m, i) => (
          <circle key={m.name} cx={getX(timeStep)} cy={getY(m.priceVariation[timeStep])}
                  r={i === choice ? 8 : 5}
                  fill={i === choice ? m.color : COLORS.light}
                  stroke={m.color} strokeWidth="2" />
        ))}

        {/* Legend */}
        <g transform="translate(435, 60)">
          {MODELS_DATA.map((m, i) => (
            <g key={m.name} transform={`translate(0, ${i * 24})`}>
              <line x1="0" y1="6" x2="20" y2="6" stroke={m.color} strokeWidth="2" />
              <text x="26" y="10" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
                {m.name}
              </text>
            </g>
          ))}
        </g>

        {/* Router decision */}
        <g transform="translate(435, 145)">
          <rect x="0" y="0" width="130" height="70" rx="4"
                fill={MODELS_DATA[choice].color} opacity="0.1"
                stroke={MODELS_DATA[choice].color} strokeWidth="1.5" />
          <text x="65" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="10" fontWeight="600" fill={COLORS.dark}>
            T={timeStep} 路由决策:
          </text>
          <text x="65" y="40" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="12" fontWeight="700" fill={MODELS_DATA[choice].color}>
            → {MODELS_DATA[choice].name}
          </text>
          <text x="65" y="58" textAnchor="middle" fontFamily={FONTS.mono}
                fontSize="9" fill={COLORS.mid}>
            价格: ${MODELS_DATA[choice].priceVariation[timeStep]}/M tokens
          </text>
        </g>

        {/* Explanation */}
        <g transform="translate(30, 240)">
          <rect x="0" y="0" width="520" height="75" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            动态路由策略
          </text>
          <text x="15" y="38" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            GPT-4 价格 {'>'} $35 → 降级到 Claude · Claude 价格 {'>'} $17 → 降级到 Llama
          </text>
          <text x="15" y="56" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            在线学习 (Bandit/RL) 可以自动发现这些规律，无需手动设定阈值
          </text>
          <text x="15" y="70" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            Llama-70B 自部署，价格恒定 — 这是 self-hosted 模型的优势
          </text>
        </g>
      </svg>

      {/* Time slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">时间步:</span>
        <input type="range" min="0" max={TIME_STEPS - 1} value={timeStep}
               onChange={e => setTimeStep(Number(e.target.value))}
               className="w-64 accent-blue-700" />
        <span className="text-sm font-mono text-gray-500">T={timeStep}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 BatchVsQueryRouting**

对比动画组件，展示逐 query vs batch-level 路由的差异。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'query' | 'batch';

const QUERIES = [
  { text: 'Q1: 翻译', diff: 'easy', model_q: 'Llama-8B', model_b: 'Llama-8B' },
  { text: 'Q2: 代码', diff: 'hard', model_q: 'GPT-4', model_b: 'Llama-70B' },
  { text: 'Q3: 问答', diff: 'easy', model_q: 'Llama-8B', model_b: 'Llama-8B' },
  { text: 'Q4: 分析', diff: 'hard', model_q: 'GPT-4', model_b: 'GPT-4' },
  { text: 'Q5: 翻译', diff: 'easy', model_q: 'Llama-8B', model_b: 'Llama-8B' },
  { text: 'Q6: 推理', diff: 'hard', model_q: 'GPT-4', model_b: 'Llama-70B' },
];

export default function BatchVsQueryRouting() {
  const [mode, setMode] = useState<Mode>('query');

  const W = 580, H = 340;

  const modelColors: Record<string, string> = {
    'Llama-8B': COLORS.green, 'Llama-70B': COLORS.orange, 'GPT-4': COLORS.red,
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Query-level vs Batch-level 路由
        </text>

        {/* Mode toggle */}
        <g transform="translate(170, 38)">
          {(['query', 'batch'] as Mode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 130} y="0" width="120" height="28" rx="4"
                    fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
              <text x={i * 130 + 60} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={mode === m ? "700" : "400"}
                    fill={mode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {m === 'query' ? 'Query-level' : 'Batch-level'}
              </text>
            </g>
          ))}
        </g>

        {/* Query assignments */}
        <g transform="translate(30, 80)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {mode === 'query' ? '逐条路由决策:' : '批量全局优化 (GPU 约束: 同时最多 2 个 GPT-4):'}
          </text>

          {QUERIES.map((q, i) => {
            const model = mode === 'query' ? q.model_q : q.model_b;
            const color = modelColors[model];
            return (
              <g key={i} transform={`translate(${(i % 3) * 180}, ${15 + Math.floor(i / 3) * 50})`}>
                <rect x="0" y="0" width="170" height="40" rx="4"
                      fill={color} opacity="0.1" stroke={color} strokeWidth="1.5" />
                <text x="10" y="16" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
                  {q.text} ({q.diff})
                </text>
                <text x="10" y="32" fontFamily={FONTS.mono} fontSize="10" fontWeight="600" fill={color}>
                  → {model}
                </text>
              </g>
            );
          })}
        </g>

        {/* Comparison metrics */}
        <g transform="translate(30, 210)">
          {(() => {
            const qGPT4 = QUERIES.filter(q => q.model_q === 'GPT-4').length;
            const bGPT4 = QUERIES.filter(q => q.model_b === 'GPT-4').length;
            const qCost = qGPT4 * 30 + (6 - qGPT4) * 1;
            const bCost = bGPT4 * 30 + QUERIES.filter(q => q.model_b === 'Llama-70B').length * 5 +
                          QUERIES.filter(q => q.model_b === 'Llama-8B').length * 1;
            return (
              <g>
                <rect x="0" y="0" width="520" height="108" rx="6"
                      fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
                <text x="20" y="22" fontFamily={FONTS.sans} fontSize="12" fontWeight="700" fill={COLORS.dark}>
                  {mode === 'query' ? 'Query-level 结果' : 'Batch-level 结果'}
                </text>
                <text x="20" y="44" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                  GPT-4 使用次数: {mode === 'query' ? qGPT4 : bGPT4}
                  · 总成本: ${mode === 'query' ? qCost : bCost}
                </text>
                <text x="20" y="64" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                  {mode === 'query'
                    ? '逐条决策: 每个 query 独立判断，不考虑全局约束'
                    : '批量优化: 在 GPU 并发限制下全局最优分配，部分 hard query 降级到 Llama-70B'}
                </text>
                <text x="20" y="84" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
                  {mode === 'batch'
                    ? 'Robust Batch-Level Routing (2026): 在对抗条件下比逐条路由优 24%'
                    : '简单但无法处理 GPU 并发限制、全局成本约束等场景'}
                </text>
                <text x="20" y="100" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
                  {mode === 'query' ? `成本: $${qCost} · 质量: 最优(per-query)` :
                   `成本: $${bCost} (节省 ${Math.round((1 - bCost / qCost) * 100)}%) · 质量: 次优但满足约束`}
                </text>
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add src/components/interactive/ParetoFrontierViz.tsx src/components/interactive/DynamicPriceAdaptation.tsx src/components/interactive/BatchVsQueryRouting.tsx
git commit -m "feat: add ParetoFrontierViz, DynamicPriceAdaptation, BatchVsQueryRouting components"
```

---

### Task 20: 第5篇文章 MDX — online-learning-cost-optimization

**Files:**
- Create: `src/content/articles/zh/online-learning-cost-optimization.mdx`

- [ ] **Step 1: 创建文章文件**

frontmatter:
```yaml
---
title: "在线学习与成本优化：路由也需要持续进化"
slug: online-learning-cost-optimization
locale: zh
tags: [model-routing, bandit, reinforcement-learning, pareto, cost-optimization]
difficulty: advanced
prerequisites: [model-routing-landscape]
created: "2026-04-06"
updated: "2026-04-06"
references:
  - type: paper
    title: "Robust Batch-Level LLM Routing"
    url: "https://arxiv.org/abs/2603.26796"
  - type: paper
    title: "RouteLLM: Learning to Route LLMs with Preference Data"
    url: "https://arxiv.org/abs/2406.18665"
---
```

imports:
```mdx
import BanditExploration from '../../../components/interactive/BanditExploration.tsx';
import RLRewardSignalViz from '../../../components/interactive/RLRewardSignalViz.tsx';
import ParetoFrontierViz from '../../../components/interactive/ParetoFrontierViz.tsx';
import DynamicPriceAdaptation from '../../../components/interactive/DynamicPriceAdaptation.tsx';
import BatchVsQueryRouting from '../../../components/interactive/BatchVsQueryRouting.tsx';
```

**内容骨架**（按设计文档 §1-§4）：
- §1 Multi-armed Bandit + `<BanditExploration client:visible />`
- §2 RL Routing + `<RLRewardSignalViz client:visible />`
- §3 Pareto 前沿与成本约束 + `<ParetoFrontierViz client:visible />` + `<DynamicPriceAdaptation client:visible />`
- §4 Batch vs Query + `<BatchVsQueryRouting client:visible />`

- [ ] **Step 2: 验证 + 提交**

```bash
npm run validate
git add src/content/articles/zh/online-learning-cost-optimization.mdx
git commit -m "feat: add Article 5 - Online learning and cost optimization"
```

---

## Phase 6: 第6篇文章（5 个组件）

### Task 21: SelectVsSynthesize + CouncilModeFlow 组件

**Files:**
- Create: `src/components/interactive/SelectVsSynthesize.tsx`
- Create: `src/components/interactive/CouncilModeFlow.tsx`

- [ ] **Step 1: 创建 SelectVsSynthesize**

二选一对比组件，展示"选一个"vs"综合多个"两种哲学差异。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Philosophy = 'select' | 'synthesize';

export default function SelectVsSynthesize() {
  const [mode, setMode] = useState<Philosophy>('select');

  const W = 580, H = 340;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          两种哲学：选一个 vs 综合多个
        </text>

        {/* Toggle */}
        <g transform="translate(160, 38)">
          {(['select', 'synthesize'] as Philosophy[]).map((p, i) => (
            <g key={p}>
              <rect x={i * 140} y="0" width="130" height="28" rx="4"
                    fill={mode === p ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(p)} />
              <text x={i * 140 + 65} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={mode === p ? "700" : "400"}
                    fill={mode === p ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {p === 'select' ? '选一个 (Routing)' : '综合多个 (MoA)'}
              </text>
            </g>
          ))}
        </g>

        {mode === 'select' ? (
          <g transform="translate(30, 80)">
            {/* Query → Router → One model */}
            <rect x="0" y="30" width="80" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
            <text x="40" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Query</text>

            <text x="85" y="55" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

            <rect x="100" y="20" width="100" height="60" rx="6"
                  fill={COLORS.primary} opacity="0.12" stroke={COLORS.primary} strokeWidth="2" />
            <text x="150" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.primary}>Router</text>

            <text x="205" y="55" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

            {/* 3 models, 1 selected */}
            {['GPT-4', 'Claude', 'Llama'].map((m, i) => {
              const selected = i === 0;
              return (
                <g key={m} transform={`translate(220, ${i * 35})`}>
                  <rect x="0" y="0" width="90" height="28" rx="4"
                        fill={selected ? COLORS.green : COLORS.light}
                        stroke={selected ? COLORS.green : COLORS.mid}
                        strokeWidth={selected ? 2 : 1} />
                  <text x="45" y="19" textAnchor="middle" fontFamily={FONTS.sans}
                        fontSize="10" fill={selected ? '#fff' : COLORS.mid}>
                    {m} {selected ? '✓' : ''}
                  </text>
                </g>
              );
            })}

            <text x="315" y="20" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.green}>→</text>

            <rect x="340" y="5" width="100" height="35" rx="4" fill={COLORS.valid} stroke={COLORS.green} strokeWidth="1.5" />
            <text x="390" y="27" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>1 个回答</text>

            {/* Properties */}
            <g transform="translate(0, 120)">
              <rect x="0" y="0" width="520" height="90" rx="6"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x="20" y="22" fontFamily={FONTS.sans} fontSize="12" fontWeight="700" fill={COLORS.primary}>
                Routing 假设：存在一个"最佳模型"
              </text>
              <text x="20" y="44" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green}>
                ✓ 成本最低（只调用一个模型）
              </text>
              <text x="20" y="62" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green}>
                ✓ 延迟最低（单次推理）
              </text>
              <text x="20" y="80" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.red}>
                ✗ 质量受限于 router 的准确性和单个模型的能力上限
              </text>
            </g>
          </g>
        ) : (
          <g transform="translate(30, 80)">
            {/* Query → All models → Synthesizer → Output */}
            <rect x="0" y="30" width="80" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
            <text x="40" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Query</text>

            <text x="85" y="55" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.orange}>→</text>

            {/* All 3 models in parallel */}
            {['GPT-4', 'Claude', 'Llama'].map((m, i) => (
              <g key={m} transform={`translate(100, ${i * 35})`}>
                <rect x="0" y="0" width="90" height="28" rx="4"
                      fill={[COLORS.purple, COLORS.primary, COLORS.green][i]}
                      opacity="0.15"
                      stroke={[COLORS.purple, COLORS.primary, COLORS.green][i]}
                      strokeWidth="1.5" />
                <text x="45" y="19" textAnchor="middle" fontFamily={FONTS.sans}
                      fontSize="10" fill={COLORS.dark}>
                  {m} ✓
                </text>
              </g>
            ))}

            <g transform="translate(195, 0)">
              {[0, 1, 2].map(i => (
                <text key={i} x="0" y={15 + i * 35} fontFamily={FONTS.sans} fontSize="14" fill={COLORS.orange}>→</text>
              ))}
            </g>

            <rect x="215" y="15" width="110" height="70" rx="6"
                  fill={COLORS.orange} opacity="0.12" stroke={COLORS.orange} strokeWidth="2" />
            <text x="270" y="45" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.orange}>
              Synthesizer
            </text>
            <text x="270" y="62" textAnchor="middle" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
              综合层
            </text>

            <text x="330" y="55" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.orange}>→</text>

            <rect x="345" y="25" width="100" height="50" rx="4"
                  fill="#fef3c7" stroke={COLORS.orange} strokeWidth="2" />
            <text x="395" y="48" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
              综合回答
            </text>
            <text x="395" y="64" textAnchor="middle" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
              质量 {'>'} 任何单一模型
            </text>

            {/* Properties */}
            <g transform="translate(0, 120)">
              <rect x="0" y="0" width="520" height="90" rx="6"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x="20" y="22" fontFamily={FONTS.sans} fontSize="12" fontWeight="700" fill={COLORS.orange}>
                MoA 假设：没有单一最佳，组合才最好
              </text>
              <text x="20" y="44" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green}>
                ✓ 质量超越任何单一模型（35.9% 幻觉降低 — Council Mode）
              </text>
              <text x="20" y="62" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.red}>
                ✗ 成本线性增长（N 个模型 = N 倍成本）
              </text>
              <text x="20" y="80" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.red}>
                ✗ 延迟 = max(所有模型) + 综合时间
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 CouncilModeFlow**

并行流程图组件，展示 query → 多 LLM 并行 → 综合层 → 输出。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const MODELS = [
  { name: 'GPT-4o', answer: '量子纠缠是一种量子力学现象...', quality: 92, color: '#6a1b9a' },
  { name: 'Claude 3.5', answer: '量子纠缠指两个粒子之间的关联...', quality: 90, color: '#1565c0' },
  { name: 'Gemini 1.5', answer: '在量子力学中，纠缠态描述了...', quality: 88, color: '#2e7d32' },
];

type SynthMode = 'merge' | 'vote' | 'best-of-n';

export default function CouncilModeFlow() {
  const [synthMode, setSynthMode] = useState<SynthMode>('merge');

  const W = 580, H = 360;

  const synthLabels = { merge: '综合合并', vote: '多数投票', 'best-of-n': 'Best-of-N' };
  const synthDetails = {
    merge: 'Council Mode: 综合所有回答的优点，生成新的统一回答。35.9% 幻觉降低。',
    vote: '多数决: 多个模型给出相同结论则采纳，减少个别模型的错误。',
    'best-of-n': '生成 N 个回答，用评估器选最好的一个。成本 = N × 单次推理。',
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Council Mode: 多 LLM 并行综合
        </text>

        {/* Synth mode selector */}
        <g transform="translate(115, 38)">
          {(['merge', 'vote', 'best-of-n'] as SynthMode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 125} y="0" width="115" height="26" rx="4"
                    fill={synthMode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1"
                    style={{ cursor: 'pointer' }} onClick={() => setSynthMode(m)} />
              <text x={i * 125 + 57.5} y="17" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10"
                    fontWeight={synthMode === m ? "700" : "400"}
                    fill={synthMode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {synthLabels[m]}
              </text>
            </g>
          ))}
        </g>

        {/* Flow: Query → 3 Models in parallel → Synthesizer → Output */}
        <g transform="translate(15, 80)">
          {/* Query */}
          <rect x="0" y="40" width="70" height="35" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="35" y="62" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>Query</text>

          {/* Arrows to models */}
          {MODELS.map((_, i) => (
            <line key={i} x1="70" y1="57" x2="100" y2={15 + i * 45 + 17}
                  stroke={COLORS.mid} strokeWidth="1" markerEnd="url(#arrow-council)" />
          ))}

          {/* Models */}
          {MODELS.map((m, i) => (
            <g key={m.name} transform={`translate(100, ${15 + i * 45})`}>
              <rect x="0" y="0" width="130" height="35" rx="4"
                    fill={m.color} opacity="0.12" stroke={m.color} strokeWidth="1.5" />
              <text x="65" y="15" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="10" fontWeight="600" fill={m.color}>
                {m.name}
              </text>
              <text x="65" y="28" textAnchor="middle" fontFamily={FONTS.mono}
                    fontSize="8" fill={COLORS.mid}>
                质量: {m.quality}%
              </text>
            </g>
          ))}

          {/* Arrows to synthesizer */}
          {MODELS.map((_, i) => (
            <line key={`s-${i}`} x1="230" y1={15 + i * 45 + 17}
                  x2="265" y2="57"
                  stroke={COLORS.mid} strokeWidth="1" markerEnd="url(#arrow-council)" />
          ))}

          {/* Synthesizer */}
          <rect x="265" y="30" width="110" height="55" rx="6"
                fill={COLORS.orange} opacity="0.12" stroke={COLORS.orange} strokeWidth="2" />
          <text x="320" y="52" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="11" fontWeight="700" fill={COLORS.orange}>
            {synthLabels[synthMode]}
          </text>
          <text x="320" y="72" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="8" fill={COLORS.mid}>
            综合层
          </text>

          {/* Arrow to output */}
          <line x1="375" y1="57" x2="400" y2="57"
                stroke={COLORS.mid} strokeWidth="1" markerEnd="url(#arrow-council)" />

          {/* Output */}
          <rect x="400" y="35" width="130" height="45" rx="4"
                fill="#fef3c7" stroke={COLORS.orange} strokeWidth="2" />
          <text x="465" y="55" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="11" fontWeight="600" fill={COLORS.dark}>
            综合回答
          </text>
          <text x="465" y="70" textAnchor="middle" fontFamily={FONTS.mono}
                fontSize="9" fill={COLORS.green}>
            质量: {synthMode === 'merge' ? '96' : synthMode === 'vote' ? '93' : '94'}%
          </text>

          <defs>
            <marker id="arrow-council" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>
        </g>

        {/* Detail */}
        <g transform="translate(30, 225)">
          <rect x="0" y="0" width="520" height="50" rx="4"
                fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.primary}>
            {synthLabels[synthMode]}
          </text>
          <text x="15" y="40" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {synthDetails[synthMode]}
          </text>
        </g>

        {/* Cost note */}
        <g transform="translate(30, 290)">
          <rect x="0" y="0" width="520" height="48" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="18" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            成本: 3 个模型并行 = 3× 单模型成本 + 综合层成本
          </text>
          <text x="15" y="34" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            延迟: max(3 个模型延迟) + 综合时间 ≈ 最慢模型 × 1.2
          </text>
          <text x="15" y="46" fontFamily={FONTS.mono} fontSize="8" fill={COLORS.mid}>
            MoA ≠ MoE: MoA 是多个完整 LLM 协作，MoE 是单个模型内部的专家路由
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/interactive/SelectVsSynthesize.tsx src/components/interactive/CouncilModeFlow.tsx
git commit -m "feat: add SelectVsSynthesize and CouncilModeFlow components"
```

---

### Task 22: MoAHierarchy + EnsembleVotingViz + CostScalingChart 组件

**Files:**
- Create: `src/components/interactive/MoAHierarchy.tsx`
- Create: `src/components/interactive/EnsembleVotingViz.tsx`
- Create: `src/components/interactive/CostScalingChart.tsx`

- [ ] **Step 1: 创建 MoAHierarchy**

层级架构图组件，展示 HieraMAS / Pyramid MoA 多层结构。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Arch = 'flat' | 'pyramid';

export default function MoAHierarchy() {
  const [arch, setArch] = useState<Arch>('flat');

  const W = 580, H = 340;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          层级 MoA 架构
        </text>

        {/* Arch toggle */}
        <g transform="translate(180, 38)">
          {(['flat', 'pyramid'] as Arch[]).map((a, i) => (
            <g key={a}>
              <rect x={i * 120} y="0" width="110" height="26" rx="4"
                    fill={arch === a ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1"
                    style={{ cursor: 'pointer' }} onClick={() => setArch(a)} />
              <text x={i * 120 + 55} y="17" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10"
                    fontWeight={arch === a ? "700" : "400"}
                    fill={arch === a ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {a === 'flat' ? 'HieraMAS 扁平' : 'Pyramid MoA'}
              </text>
            </g>
          ))}
        </g>

        {arch === 'flat' ? (
          <g transform="translate(30, 80)">
            {/* Layer 1: 4 models */}
            <text x="0" y="10" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 1</text>
            {['LLM-A', 'LLM-B', 'LLM-C', 'LLM-D'].map((m, i) => (
              <rect key={m} x={60 + i * 110} y="0" width="95" height="30" rx="4"
                    fill={COLORS.green} opacity="0.15" stroke={COLORS.green} strokeWidth="1" />
            ))}
            {['LLM-A', 'LLM-B', 'LLM-C', 'LLM-D'].map((m, i) => (
              <text key={`t-${m}`} x={60 + i * 110 + 47.5} y="20" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{m}</text>
            ))}

            {/* Layer 2: 2 aggregators */}
            <text x="0" y="65" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 2</text>
            {['Agg-1', 'Agg-2'].map((m, i) => (
              <rect key={m} x={115 + i * 220} y="55" width="110" height="30" rx="4"
                    fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="1.5" />
            ))}
            {['Agg-1', 'Agg-2'].map((m, i) => (
              <text key={`t-${m}`} x={115 + i * 220 + 55} y="75" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.primary}>{m}</text>
            ))}

            {/* Layer 3: Final aggregator */}
            <text x="0" y="120" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 3</text>
            <rect x="190" y="110" width="140" height="30" rx="4"
                  fill={COLORS.orange} opacity="0.15" stroke={COLORS.orange} strokeWidth="2" />
            <text x="260" y="130" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="700" fill={COLORS.orange}>Final Aggregator</text>

            {/* Arrows (simplified) */}
            {[0, 1].map(i => <line key={`a1-${i}`} x1={107 + i * 110} y1="30" x2={170} y2="55" stroke={COLORS.mid} strokeWidth="1" />)}
            {[2, 3].map(i => <line key={`a2-${i}`} x1={107 + i * 110} y1="30" x2={390} y2="55" stroke={COLORS.mid} strokeWidth="1" />)}
            <line x1="170" y1="85" x2="260" y2="110" stroke={COLORS.mid} strokeWidth="1" />
            <line x1="390" y1="85" x2="260" y2="110" stroke={COLORS.mid} strokeWidth="1" />

            <text x="260" y="165" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="10" fill={COLORS.mid}>
              HieraMAS: 节点内 LLM 混合 + 节点间通信
            </text>
          </g>
        ) : (
          <g transform="translate(30, 80)">
            {/* Pyramid: wide base, narrowing layers */}
            <text x="0" y="10" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 1 (广)</text>
            {['LLM-1', 'LLM-2', 'LLM-3', 'LLM-4', 'LLM-5'].map((m, i) => (
              <rect key={m} x={50 + i * 95} y="0" width="82" height="25" rx="3"
                    fill={COLORS.green} opacity="0.15" stroke={COLORS.green} strokeWidth="1" />
            ))}
            {['LLM-1', 'LLM-2', 'LLM-3', 'LLM-4', 'LLM-5'].map((m, i) => (
              <text key={`t-${m}`} x={50 + i * 95 + 41} y="17" textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>{m}</text>
            ))}

            <text x="0" y="55" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 2 (中)</text>
            {['Synth-A', 'Synth-B', 'Synth-C'].map((m, i) => (
              <rect key={m} x={100 + i * 130} y="45" width="110" height="25" rx="3"
                    fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="1" />
            ))}
            {['Synth-A', 'Synth-B', 'Synth-C'].map((m, i) => (
              <text key={`t-${m}`} x={100 + i * 130 + 55} y="62" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="9" fontWeight="600" fill={COLORS.primary}>{m}</text>
            ))}

            <text x="0" y="100" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 3 (窄)</text>
            <rect x="190" y="90" width="140" height="30" rx="4"
                  fill={COLORS.orange} opacity="0.15" stroke={COLORS.orange} strokeWidth="2" />
            <text x="260" y="110" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="700" fill={COLORS.orange}>Final Output</text>

            {/* Router */}
            <rect x="380" y="90" width="130" height="30" rx="4"
                  fill="#fef3c7" stroke={COLORS.dark} strokeWidth="1" />
            <text x="445" y="110" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="9" fill={COLORS.dark}>Decision-theoretic Router</text>

            <text x="260" y="145" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="10" fill={COLORS.mid}>
              Pyramid MoA: 层级递减 + decision-theoretic router 决定何时停止
            </text>
          </g>
        )}

        {/* Comparison box */}
        <g transform="translate(30, 240)">
          <rect x="0" y="0" width="520" height="78" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="20" y="20" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            层级 MoA vs 扁平 MoA
          </text>
          <text x="20" y="38" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            扁平 MoA: 所有模型同一层并行 → 综合。简单但质量收益有限。
          </text>
          <text x="20" y="54" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            层级 MoA: 多层逐级精炼。每层综合后传给下一层进一步提升。
          </text>
          <text x="20" y="70" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            Pyramid MoA 特色: 层级递减（5→3→1），router 决定何时已经"够好了"可以提前终止。
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 创建 EnsembleVotingViz**

投票动画组件，展示 Majority / Weighted / Best-of-N 三种投票方式。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type VoteMode = 'majority' | 'weighted' | 'best-of-n';

const MODELS = [
  { name: 'GPT-4o', answer: 'A', weight: 0.4, quality: 95, color: '#6a1b9a' },
  { name: 'Claude', answer: 'A', weight: 0.35, quality: 90, color: '#1565c0' },
  { name: 'Gemini', answer: 'B', weight: 0.25, quality: 85, color: '#2e7d32' },
];

export default function EnsembleVotingViz() {
  const [mode, setMode] = useState<VoteMode>('majority');

  const W = 580, H = 320;
  const labels = { majority: '多数投票', weighted: '加权投票', 'best-of-n': 'Best-of-N' };

  const getResult = () => {
    if (mode === 'majority') return { answer: 'A', detail: '2票 A vs 1票 B → A 获胜', score: '2/3' };
    if (mode === 'weighted') {
      const aWeight = 0.4 + 0.35;
      return { answer: 'A', detail: `A权重 ${aWeight.toFixed(2)} vs B权重 0.25 → A 获胜`, score: `${aWeight.toFixed(2)}` };
    }
    return { answer: 'A', detail: 'GPT-4o 质量最高 (95%) → 选择其回答', score: '95%' };
  };

  const result = getResult();

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Ensemble 投票方式
        </text>

        {/* Mode tabs */}
        <g transform="translate(115, 38)">
          {(['majority', 'weighted', 'best-of-n'] as VoteMode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 125} y="0" width="115" height="26" rx="4"
                    fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
              <text x={i * 125 + 57.5} y="17" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10"
                    fontWeight={mode === m ? "700" : "400"}
                    fill={mode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {labels[m]}
              </text>
            </g>
          ))}
        </g>

        {/* Model votes */}
        {MODELS.map((m, i) => (
          <g key={m.name} transform={`translate(30, ${80 + i * 50})`}>
            <rect x="0" y="0" width="120" height="38" rx="4"
                  fill={m.color} opacity="0.12" stroke={m.color} strokeWidth="1.5" />
            <text x="60" y="16" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="600" fill={m.color}>{m.name}</text>
            <text x="60" y="32" textAnchor="middle" fontFamily={FONTS.mono}
                  fontSize="9" fill={COLORS.mid}>
              {mode === 'weighted' ? `权重: ${m.weight}` : mode === 'best-of-n' ? `质量: ${m.quality}%` : ''}
            </text>

            <text x="130" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

            {/* Answer */}
            <rect x="150" y="5" width="60" height="28" rx="4"
                  fill={m.answer === result.answer ? COLORS.valid : COLORS.waste}
                  stroke={m.answer === result.answer ? COLORS.green : COLORS.red} strokeWidth="1.5" />
            <text x="180" y="24" textAnchor="middle" fontFamily={FONTS.mono}
                  fontSize="14" fontWeight="700" fill={COLORS.dark}>
              {m.answer}
            </text>

            {/* Weight/score visualization */}
            {mode === 'weighted' && (
              <rect x="225" y="10" width={m.weight * 300} height="18" rx="3"
                    fill={m.color} opacity="0.4" />
            )}
            {mode === 'best-of-n' && (
              <rect x="225" y="10" width={m.quality * 2.5} height="18" rx="3"
                    fill={m.color} opacity="0.4" />
            )}
          </g>
        ))}

        {/* Result */}
        <g transform="translate(30, 235)">
          <rect x="0" y="0" width="520" height="60" rx="6"
                fill={COLORS.valid} stroke={COLORS.green} strokeWidth="2" />
          <text x="20" y="22" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.green}>
            结果: {result.answer}
          </text>
          <text x="20" y="42" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {labels[mode]}: {result.detail}
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: 创建 CostScalingChart**

折线图组件，展示模型数量 vs 成本 vs 质量提升的收益递减。

```tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// Simulated data: quality improvement vs cost with N models
const DATA = [
  { n: 1, quality: 90, cost: 1 },
  { n: 2, quality: 94, cost: 2 },
  { n: 3, quality: 96, cost: 3 },
  { n: 4, quality: 97, cost: 4 },
  { n: 5, quality: 97.5, cost: 5 },
  { n: 6, quality: 97.8, cost: 6 },
  { n: 8, quality: 98, cost: 8 },
  { n: 10, quality: 98.1, cost: 10 },
];

export default function CostScalingChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 580, H = 340;
  const cL = 65, cR = 520, cT = 55, cB = 240;
  const cW = cR - cL, cH = cB - cT;

  const getX = (n: number) => cL + ((n - 1) / 9) * cW;
  const getYQ = (q: number) => cB - ((q - 85) / 15) * cH;
  const getYC = (c: number) => cB - (c / 10) * cH;

  const qualityPath = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(d.n)},${getYQ(d.quality)}`).join(' ');
  const costPath = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(d.n)},${getYC(d.cost)}`).join(' ');

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          模型数量 vs 成本与质量
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          质量提升递减，成本线性增长 — 收益递减曲线
        </text>

        {/* Axes */}
        <line x1={cL} y1={cB} x2={cR} y2={cB} stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={cL} y1={cT} x2={cL} y2={cB} stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={(cL + cR) / 2} y={cB + 28} textAnchor="middle"
              fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>模型数量 →</text>

        {/* Curves */}
        <path d={qualityPath} fill="none" stroke={COLORS.green} strokeWidth="2.5" />
        <path d={costPath} fill="none" stroke={COLORS.red} strokeWidth="2.5" />

        {/* Labels */}
        <text x={cR + 5} y={getYQ(98)} fontFamily={FONTS.sans} fontSize="10" fill={COLORS.green}>质量 %</text>
        <text x={cR + 5} y={getYC(10)} fontFamily={FONTS.sans} fontSize="10" fill={COLORS.red}>成本 ×</text>

        {/* Data points */}
        {DATA.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
             style={{ cursor: 'pointer' }}>
            <circle cx={getX(d.n)} cy={getYQ(d.quality)} r={hovered === i ? 6 : 4}
                    fill={COLORS.green} stroke="#fff" strokeWidth="1.5" />
            <circle cx={getX(d.n)} cy={getYC(d.cost)} r={hovered === i ? 6 : 4}
                    fill={COLORS.red} stroke="#fff" strokeWidth="1.5" />
            <text x={getX(d.n)} y={cB + 15} textAnchor="middle"
                  fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>{d.n}</text>
          </g>
        ))}

        {/* Hover detail */}
        {hovered !== null && (() => {
          const d = DATA[hovered];
          const marginalQ = hovered > 0 ? (d.quality - DATA[hovered - 1].quality).toFixed(1) : '-';
          return (
            <g transform={`translate(${cL + 10}, ${cT + 5})`}>
              <rect x="0" y="0" width="200" height="42" rx="4" fill="#fff" stroke={COLORS.mid} strokeWidth="1" />
              <text x="10" y="16" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
                {d.n} 个模型: 质量 {d.quality}% · 成本 {d.cost}×
              </text>
              <text x="10" y="34" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
                边际质量提升: +{marginalQ}% (收益递减)
              </text>
            </g>
          );
        })()}

        {/* Sweet spot annotation */}
        <g>
          <line x1={getX(3)} y1={cT + 10} x2={getX(3)} y2={cB}
                stroke={COLORS.primary} strokeWidth="1.5" strokeDasharray="5,3" />
          <text x={getX(3)} y={cT + 8} textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="9" fontWeight="600" fill={COLORS.primary}>
            ← sweet spot
          </text>
        </g>

        {/* Insight */}
        <g transform="translate(40, 275)">
          <rect x="0" y="0" width="500" height="48" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="18" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            关键洞察: 2-3 个模型是 sweet spot
          </text>
          <text x="15" y="36" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            从 1→3: 质量 +6%，成本 3×。从 3→10: 质量仅 +2%，成本再 3.3×。收益递减严重。
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add src/components/interactive/MoAHierarchy.tsx src/components/interactive/EnsembleVotingViz.tsx src/components/interactive/CostScalingChart.tsx
git commit -m "feat: add MoAHierarchy, EnsembleVotingViz, CostScalingChart components"
```

---

### Task 23: 第6篇文章 MDX — mixture-of-agents

**Files:**
- Create: `src/content/articles/zh/mixture-of-agents.mdx`

- [ ] **Step 1: 创建文章文件**

frontmatter:
```yaml
---
title: "多模型协作：从选一个到用多个"
slug: mixture-of-agents
locale: zh
tags: [model-routing, mixture-of-agents, ensemble, council-mode, collaboration]
difficulty: advanced
prerequisites: [model-routing-landscape]
created: "2026-04-06"
updated: "2026-04-06"
references:
  - type: paper
    title: "Council Mode: Multi-LLM Collaboration for Hallucination Reduction"
    url: "https://arxiv.org/abs/2604.02923"
  - type: website
    title: "Mixture of Agents - Together AI"
    url: "https://www.together.ai/blog/together-moa"
---
```

imports:
```mdx
import SelectVsSynthesize from '../../../components/interactive/SelectVsSynthesize.tsx';
import CouncilModeFlow from '../../../components/interactive/CouncilModeFlow.tsx';
import MoAHierarchy from '../../../components/interactive/MoAHierarchy.tsx';
import EnsembleVotingViz from '../../../components/interactive/EnsembleVotingViz.tsx';
import CostScalingChart from '../../../components/interactive/CostScalingChart.tsx';
```

**开头必须明确区分 MoE vs MoA**:
> MoE (Mixture of Experts) 是单个模型内部的专家路由机制（见 transformer-core 路径的 mixture-of-experts 文章），
> 而 MoA (Mixture of Agents) 是多个完整 LLM 模型之间的协作——粒度完全不同。

**内容骨架**（按设计文档 §1-§5）：
- §1 选择 vs 综合 + `<SelectVsSynthesize client:visible />`
- §2 Council Mode + `<CouncilModeFlow client:visible />`
- §3 层级 MoA + `<MoAHierarchy client:visible />`
- §4 Ensemble 与投票 + `<EnsembleVotingViz client:visible />`
- §5 成本与收益递减 + `<CostScalingChart client:visible />`

- [ ] **Step 2: 验证 + 提交**

```bash
npm run validate
git add src/content/articles/zh/mixture-of-agents.mdx
git commit -m "feat: add Article 6 - Mixture of Agents"
```

---

## Phase 7: 最终验证

### Task 24: 全路径集成验证

**Files:**
- Verify: All 6 articles + 33 components + 1 path YAML

- [ ] **Step 1: 运行全量验证**

```bash
npm run validate
```

Expected: 所有文章通过验证，路径 YAML 引用 6 个有效 slug

- [ ] **Step 2: 本地预览全部文章**

```bash
npm run dev
```

逐一检查:
- http://localhost:4321/zh/articles/model-routing-landscape
- http://localhost:4321/zh/articles/routing-classifiers
- http://localhost:4321/zh/articles/cascade-self-verification
- http://localhost:4321/zh/articles/hybrid-local-cloud
- http://localhost:4321/zh/articles/online-learning-cost-optimization
- http://localhost:4321/zh/articles/mixture-of-agents

确认:
- 所有组件渲染正常
- 交互功能正常（滑块、点击、hover）
- 文章内容完整，无 placeholder
- prerequisite 链接正确

- [ ] **Step 3: 构建验证**

```bash
npm run build
```

Expected: 构建成功，无错误

- [ ] **Step 4: 提交验证结果（如有修复）**

```bash
git add -A
git commit -m "fix: final adjustments for model-routing learning path"
```