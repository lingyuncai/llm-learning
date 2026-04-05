# 强化学习 Implementation Plan — Part 3 (Tasks 31-48)

> Continues from `2026-04-05-reinforcement-learning-plan-part2.md` (Tasks 16-30).
> **Spec:** `docs/superpowers/specs/2026-04-05-reinforcement-learning-design.md`

---

## File Structure (Part 3)

### Article 5: 从 DPO 到 GRPO (direct-preference-optimization)
- Create: `src/components/interactive/RLHFvsDPOArchitecture.tsx`
- Create: `src/components/interactive/DPOLossViz.tsx`
- Create: `src/components/interactive/OfflineVsOnline.tsx`
- Create: `src/components/interactive/GRPOGroupSampling.tsx`
- Create: `src/components/interactive/MethodEvolution.tsx`
- Create: `src/components/interactive/TrainingCostCompare.tsx`
- Create: `src/content/articles/zh/direct-preference-optimization.mdx`

### Article 6: Reward 设计与 Scaling (reward-modeling)
- Create: `src/components/interactive/ORMvsPRM.tsx`
- Create: `src/components/interactive/RewardHackingGallery.tsx`
- Create: `src/components/interactive/RewardScalingChart.tsx`
- Create: `src/components/interactive/ConstitutionalAIFlow.tsx`
- Create: `src/components/interactive/RewardToVerifier.tsx`
- Create: `src/content/articles/zh/reward-modeling.mdx`

### Article 7: Test-Time Scaling (test-time-scaling)
- Create: `src/components/interactive/ScalingParadigmCompare.tsx`
- Create: `src/components/interactive/BestOfNSimulator.tsx`
- Create: `src/components/interactive/MCTSReasoningTree.tsx`
- Create: `src/components/interactive/DeepSeekR1Pipeline.tsx`
- Create: `src/components/interactive/EmergentThinking.tsx`
- Create: `src/components/interactive/ComputeOptimalInference.tsx`
- Create: `src/content/articles/zh/test-time-scaling.mdx`

---

## Task 31: RLHFvsDPOArchitecture

**Files:**
- Create: `src/components/interactive/RLHFvsDPOArchitecture.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

export default function RLHFvsDPOArchitecture() {
  const [showDPO, setShowDPO] = useState(false);

  const boxW = 90, boxH = 34;

  // RLHF: 4 models
  const rlhfModels = [
    { label: 'Policy\nπ_θ', x: 80, y: 100, color: COLORS.primary, active: true },
    { label: 'Reference\nπ_ref', x: 80, y: 200, color: COLORS.mid, active: true },
    { label: 'Reward\nModel', x: 250, y: 100, color: COLORS.orange, active: true },
    { label: 'Critic\nV(s;w)', x: 250, y: 200, color: COLORS.green, active: true },
  ];

  // DPO: 2 models (RM and Critic eliminated)
  const dpoModels = [
    { label: 'Policy\nπ_θ', x: 80, y: 140, color: COLORS.primary, active: true },
    { label: 'Reference\nπ_ref', x: 250, y: 140, color: COLORS.mid, active: true },
    { label: 'Reward\nModel', x: 80, y: 240, color: COLORS.orange, active: false },
    { label: 'Critic\nV(s;w)', x: 250, y: 240, color: COLORS.green, active: false },
  ];

  const models = showDPO ? dpoModels : rlhfModels;
  const halfW = 290;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          RLHF vs DPO 架构对比
        </text>

        {/* Toggle */}
        <g onClick={() => setShowDPO(!showDPO)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 80} y={36} width={160} height={26} rx={13}
            fill={showDPO ? COLORS.purple : COLORS.primary} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showDPO ? 'DPO（2 模型）' : 'RLHF（4 模型）'}
          </text>
        </g>

        {/* Architecture label */}
        <text x={halfW / 2} y={82} textAnchor="middle" fontSize={12} fontWeight={600}
          fill={showDPO ? COLORS.purple : COLORS.primary}>
          {showDPO ? 'DPO 架构' : 'RLHF 架构'}
        </text>

        {/* Model boxes */}
        {models.map((m, i) => (
          <g key={i} opacity={m.active ? 1 : 0.25}>
            <rect x={m.x - boxW / 2} y={m.y - boxH / 2} width={boxW} height={boxH} rx={8}
              fill={m.active ? COLORS.bgAlt : COLORS.masked}
              stroke={m.color} strokeWidth={m.active ? 2 : 1}
              strokeDasharray={m.active ? undefined : '4 3'} />
            <text x={m.x} y={m.y + 2} textAnchor="middle" fontSize={9} fontWeight={600} fill={m.active ? m.color : COLORS.mid}>
              {m.label.split('\n').map((line, li) => (
                <tspan key={li} x={m.x} dy={li === 0 ? -6 : 14}>{line}</tspan>
              ))}
            </text>
            {!m.active && (
              <>
                <line x1={m.x - boxW / 2 + 5} y1={m.y - boxH / 2 + 5}
                  x2={m.x + boxW / 2 - 5} y2={m.y + boxH / 2 - 5}
                  stroke={COLORS.red} strokeWidth={2} />
                <line x1={m.x + boxW / 2 - 5} y1={m.y - boxH / 2 + 5}
                  x2={m.x - boxW / 2 + 5} y2={m.y + boxH / 2 - 5}
                  stroke={COLORS.red} strokeWidth={2} />
              </>
            )}
          </g>
        ))}

        {/* GPU comparison */}
        <rect x={360} y={80} width={200} height={160} rx={8} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={460} y={100} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.dark}>训练资源对比</text>

        {/* GPU bars */}
        {[
          { label: 'RLHF', gpus: 4, color: COLORS.primary },
          { label: 'DPO', gpus: 2, color: COLORS.purple },
        ].map((item, i) => (
          <g key={i}>
            <text x={375} y={130 + i * 50} fontSize={10} fontWeight={600} fill={item.color}>{item.label}</text>
            {Array.from({ length: 4 }, (_, j) => (
              <rect key={j} x={420 + j * 32} y={118 + i * 50}
                width={26} height={20} rx={3}
                fill={j < item.gpus ? item.color : COLORS.masked}
                opacity={j < item.gpus ? 0.7 : 0.3} />
            ))}
            <text x={420} y={150 + i * 50} fontSize={9} fill={COLORS.mid}>
              {item.gpus} 个模型同时在 GPU
            </text>
          </g>
        ))}

        {/* Key insight */}
        <rect x={360} y={250} width={200} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={460} y={268} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
          DPO 核心洞察
        </text>
        <text x={460} y={286} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          最优策略和 reward 有 closed-form
        </text>
        <text x={460} y={298} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          关系 → 可以把 RM 消掉
        </text>

        {/* Data flow description */}
        <rect x={30} y={310} width={520} height={70} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={40} y={330} fontSize={11} fontWeight={600} fill={showDPO ? COLORS.purple : COLORS.primary}>
          {showDPO ? 'DPO 训练流程' : 'RLHF 训练流程'}
        </text>
        <text x={40} y={350} fontSize={10} fill={COLORS.dark}>
          {showDPO
            ? '偏好数据 (x, y_w, y_l) → 直接优化 policy 使 preferred 概率上升 → 隐式学习 reward'
            : 'Prompt → Policy 生成 → RM 评分 → Critic 估计 V(s) → 计算 Advantage → PPO 更新'}
        </text>
        <text x={40} y={368} fontSize={10} fill={COLORS.mid}>
          {showDPO
            ? 'Loss: -log σ(β·(log π/π_ref(y_w) - log π/π_ref(y_l))) — 训练简单如 SFT'
            : '需要 4 个模型同时运行，训练复杂度高，超参数敏感'}
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
git add src/components/interactive/RLHFvsDPOArchitecture.tsx
git commit -m "feat(rl): add RLHFvsDPOArchitecture component"
```

---

## Task 32: DPOLossViz

**Files:**
- Create: `src/components/interactive/DPOLossViz.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function DPOLossViz() {
  const [beta, setBeta] = useState(0.1);

  const chartX = 60, chartY = 90, chartW = 460, chartH = 200;
  const xMin = -4, xMax = 4;

  const toChartX = (v: number) => chartX + ((v - xMin) / (xMax - xMin)) * chartW;
  const toChartY = (v: number) => chartY + chartH - ((v + 0.5) / 5) * chartH;

  // DPO loss: L = -log σ(β * (log_ratio_w - log_ratio_l))
  // Simplified: plot loss as function of margin = log_ratio_w - log_ratio_l
  const sigma = (x: number) => 1 / (1 + Math.exp(-x));
  const dpoLoss = (margin: number) => -Math.log(sigma(beta * margin) + 1e-8);

  const numPoints = 100;
  const margins = Array.from({ length: numPoints }, (_, i) => xMin + (i / (numPoints - 1)) * (xMax - xMin));

  const lossPoints = margins.map(m => ({
    x: toChartX(m),
    y: toChartY(dpoLoss(m)),
  }));

  const pathStr = lossPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          DPO Loss 函数可视化
        </text>

        {/* Beta selector */}
        <text x={W / 2} y={48} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          β = {beta.toFixed(2)}
        </text>
        {[0.05, 0.1, 0.2, 0.5].map((b, i) => (
          <g key={b} onClick={() => setBeta(b)} style={{ cursor: 'pointer' }}>
            <rect x={180 + i * 60} y={56} width={48} height={22} rx={4}
              fill={beta === b ? COLORS.primary : COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={204 + i * 60} y={71} textAnchor="middle" fontSize={10}
              fill={beta === b ? '#fff' : COLORS.dark}>{b}</text>
          </g>
        ))}

        {/* Chart */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {/* Zero line */}
        <line x1={toChartX(0)} y1={chartY} x2={toChartX(0)} y2={chartY + chartH}
          stroke={COLORS.mid} strokeWidth={0.5} strokeDasharray="4 3" />
        <text x={toChartX(0)} y={chartY + chartH + 14} textAnchor="middle" fontSize={9} fill={COLORS.dark}>0</text>

        {/* Regions */}
        <rect x={chartX} y={chartY} width={toChartX(0) - chartX} height={chartH}
          fill={COLORS.red} opacity={0.04} />
        <rect x={toChartX(0)} y={chartY} width={chartX + chartW - toChartX(0)} height={chartH}
          fill={COLORS.green} opacity={0.04} />

        <text x={toChartX(-2)} y={chartY + 16} textAnchor="middle" fontSize={9} fill={COLORS.red}>
          preferred 概率 {'<'} rejected
        </text>
        <text x={toChartX(2)} y={chartY + 16} textAnchor="middle" fontSize={9} fill={COLORS.green}>
          preferred 概率 {'>'} rejected
        </text>

        {/* Loss curve */}
        <path d={pathStr} fill="none" stroke={COLORS.primary} strokeWidth={2.5} />

        {/* Gradient arrows */}
        <line x1={toChartX(-2)} y1={toChartY(dpoLoss(-2))} x2={toChartX(-1)} y2={toChartY(dpoLoss(-2))}
          stroke={COLORS.green} strokeWidth={2} markerEnd="url(#arrowDPO)" />
        <text x={toChartX(-1.5)} y={toChartY(dpoLoss(-2)) - 8} textAnchor="middle" fontSize={8} fill={COLORS.green}>
          梯度 → 推高 preferred
        </text>

        <defs>
          <marker id="arrowDPO" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
          </marker>
        </defs>

        {/* Axes labels */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 28} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          margin = log(π/π_ref)(y_w) - log(π/π_ref)(y_l)
        </text>
        <text x={chartX - 8} y={chartY + chartH / 2} textAnchor="end" fontSize={10} fill={COLORS.mid}
          transform={`rotate(-90, ${chartX - 8}, ${chartY + chartH / 2})`}>Loss</text>

        {/* Explanation */}
        <rect x={40} y={H - 52} width={500} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 34} fontSize={10} fontWeight={600} fill={COLORS.orange} fontFamily={FONTS.mono}>
          L_DPO = -log σ(β · margin)
        </text>
        <text x={50} y={H - 18} fontSize={10} fill={COLORS.mid}>
          β 越大 → loss 曲线越陡 → 对偏好差异更敏感 | β 越小 → 更平缓 → 容忍更大偏差
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
git add src/components/interactive/DPOLossViz.tsx
git commit -m "feat(rl): add DPOLossViz component"
```

---

## Task 33: OfflineVsOnline (StepNavigator)

**Files:**
- Create: `src/components/interactive/OfflineVsOnline.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function OfflineVsOnline() {
  const steps = [
    {
      title: 'DPO (Offline)',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            DPO: Offline — 固定数据集
          </text>
          <rect x={30} y={40} width={130} height={40} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={95} y={64} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.primary}>
            固定偏好数据集
          </text>
          <line x1={165} y1={60} x2={220} y2={60} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrowOO)" />
          <rect x={225} y={40} width={100} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={275} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>DPO 训练</text>
          <text x={275} y={72} textAnchor="middle" fontSize={8} fill={COLORS.mid}>一次性</text>
          <line x1={330} y1={60} x2={385} y2={60} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowOO)" />
          <rect x={390} y={40} width={100} height={40} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={440} y={64} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>对齐模型</text>

          <defs>
            <marker id="arrowOO" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
            </marker>
          </defs>

          <rect x={30} y={100} width={460} height={60} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.dark}>特点：</text>
          <text x={40} y={136} fontSize={10} fill={COLORS.mid}>✓ 训练简单 ✓ 不需要在线生成 ✗ 数据分布偏移 ✗ 容易过拟合</text>
          <text x={40} y={152} fontSize={10} fill={COLORS.mid}>数据在训练前收集好，模型看不到自己新策略产生的回答</text>
        </svg>
      ),
    },
    {
      title: 'Online DPO',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Online DPO: 迭代采样新数据
          </text>
          {/* Cycle: model → generate → label → train → model */}
          {[
            { label: '当前模型', x: 80, y: 80, color: COLORS.primary },
            { label: '生成回答', x: 210, y: 80, color: COLORS.orange },
            { label: '标注偏好', x: 340, y: 80, color: COLORS.green },
            { label: 'DPO 更新', x: 470, y: 80, color: COLORS.purple },
          ].map((item, i) => (
            <g key={i}>
              <rect x={item.x - 50} y={item.y - 18} width={100} height={36} rx={6}
                fill={COLORS.bgAlt} stroke={item.color} strokeWidth={1.5} />
              <text x={item.x} y={item.y + 4} textAnchor="middle" fontSize={10} fontWeight={600} fill={item.color}>
                {item.label}
              </text>
              {i < 3 && (
                <line x1={item.x + 55} y1={item.y} x2={item.x + 75} y2={item.y}
                  stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowOO)" />
              )}
            </g>
          ))}
          {/* Feedback loop */}
          <path d="M 470 100 Q 470 140 275 140 Q 80 140 80 100"
            fill="none" stroke={COLORS.primary} strokeWidth={1.5} strokeDasharray="6 3" markerEnd="url(#arrowOO)" />
          <text x={275} y={138} textAnchor="middle" fontSize={9} fill={COLORS.primary}>迭代循环</text>

          <rect x={30} y={155} width={520} height={20} rx={4} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={W / 2} y={169} textAnchor="middle" fontSize={10} fill={COLORS.orange}>
            用当前策略采样 → 标注 → 训练 → 缓解分布偏移，但增加计算成本
          </text>
        </svg>
      ),
    },
    {
      title: 'GRPO (在线组采样)',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            GRPO: 在线 + 组内相对排序
          </text>
          <rect x={30} y={40} width={80} height={36} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={70} y={62} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.primary}>Prompt</text>

          <line x1={115} y1={58} x2={145} y2={58} stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowOO)" />

          {/* Group sampling */}
          <rect x={150} y={35} width={150} height={90} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={225} y={52} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>采样 G 个回答</text>
          {Array.from({ length: 4 }, (_, i) => (
            <rect key={i} x={162} y={58 + i * 15} width={126} height={12} rx={3}
              fill={i === 0 ? '#d4edda' : i === 3 ? COLORS.waste : COLORS.bgAlt}
              stroke={COLORS.mid} strokeWidth={0.5} />
          ))}

          <line x1={305} y1={58} x2={335} y2={58} stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowOO)" />

          <rect x={340} y={35} width={110} height={46} rx={6} fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1.5} />
          <text x={395} y={55} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>组内排序</text>
          <text x={395} y={72} textAnchor="middle" fontSize={8} fill={COLORS.mid}>相对 Advantage</text>

          <line x1={455} y1={58} x2={485} y2={58} stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowOO)" />

          <rect x={490} y={40} width={70} height={36} rx={6} fill={COLORS.purple} stroke={COLORS.purple} strokeWidth={1.5} />
          <text x={525} y={62} textAnchor="middle" fontSize={10} fontWeight={600} fill="#fff">更新</text>

          <rect x={30} y={135} width={520} height={40} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={152} fontSize={10} fontWeight={600} fill={COLORS.red}>关键创新：去掉 Critic</text>
          <text x={40} y={168} fontSize={10} fill={COLORS.mid}>
            用组内相对排序替代 Critic 网络估计 Advantage → 减少一个大模型 → 降低 GPU 需求
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
git add src/components/interactive/OfflineVsOnline.tsx
git commit -m "feat(rl): add OfflineVsOnline StepNavigator component"
```

---

## Task 34: GRPOGroupSampling

**Files:**
- Create: `src/components/interactive/GRPOGroupSampling.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

export default function GRPOGroupSampling() {
  const [groupSize, setGroupSize] = useState(8);

  const samples = useMemo(() => {
    const result: { score: number; advantage: number }[] = [];
    for (let i = 0; i < groupSize; i++) {
      result.push({ score: Math.round((Math.random() * 4 + 3) * 100) / 100, advantage: 0 });
    }
    // Compute group-relative advantage
    const mean = result.reduce((s, r) => s + r.score, 0) / result.length;
    const std = Math.sqrt(result.reduce((s, r) => s + (r.score - mean) ** 2, 0) / result.length) || 1;
    result.forEach(r => { r.advantage = Math.round(((r.score - mean) / std) * 100) / 100; });
    result.sort((a, b) => b.score - a.score);
    return result;
  }, [groupSize]);

  const barX = 40, barY = 110, barW = 440, barH = 200;
  const maxScore = Math.max(...samples.map(s => s.score));
  const itemW = barW / groupSize;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          GRPO 组采样机制
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          同一 Prompt → 采样 G 个回答 → 组内相对排序 → 计算 Advantage
        </text>

        {/* Group size slider */}
        <text x={W / 2} y={64} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          G = {groupSize}
        </text>
        {[4, 8, 16, 32].map((g, i) => (
          <g key={g} onClick={() => setGroupSize(g)} style={{ cursor: 'pointer' }}>
            <rect x={180 + i * 60} y={72} width={48} height={22} rx={4}
              fill={groupSize === g ? COLORS.primary : COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={204 + i * 60} y={87} textAnchor="middle" fontSize={10}
              fill={groupSize === g ? '#fff' : COLORS.dark}>G={g}</text>
          </g>
        ))}

        {/* Prompt */}
        <rect x={barX} y={barY - 14} width={barW} height={14} rx={3} fill={COLORS.valid} />
        <text x={barX + barW / 2} y={barY - 3} textAnchor="middle" fontSize={8} fill={COLORS.primary}>
          同一个 Prompt → 采样 {groupSize} 个回答
        </text>

        {/* Bars */}
        {samples.map((s, i) => {
          const x = barX + i * itemW;
          const h = (s.score / maxScore) * (barH - 30);
          const isPos = s.advantage > 0;
          return (
            <g key={i}>
              <rect x={x + 2} y={barY + barH - h} width={itemW - 4} height={h} rx={3}
                fill={isPos ? COLORS.green : COLORS.red} opacity={0.6 + Math.abs(s.advantage) * 0.15} />
              <text x={x + itemW / 2} y={barY + barH - h - 4} textAnchor="middle" fontSize={8}
                fill={COLORS.dark} fontFamily={FONTS.mono}>{s.score.toFixed(1)}</text>
              <text x={x + itemW / 2} y={barY + barH + 14} textAnchor="middle" fontSize={7}
                fill={isPos ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
                A={s.advantage > 0 ? '+' : ''}{s.advantage.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Mean line */}
        {(() => {
          const mean = samples.reduce((s, r) => s + r.score, 0) / samples.length;
          const meanY = barY + barH - (mean / maxScore) * (barH - 30);
          return (
            <>
              <line x1={barX} y1={meanY} x2={barX + barW} y2={meanY}
                stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="6 3" />
              <text x={barX + barW + 5} y={meanY + 4} fontSize={9} fill={COLORS.orange}>
                mean={mean.toFixed(2)}
              </text>
            </>
          );
        })()}

        {/* Labels */}
        <text x={barX + barW / 2} y={barY + barH + 28} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          score 排序 | 绿色=比平均好(A{'>'}0) | 红色=比平均差(A{'<'}0)
        </text>

        {/* Formula */}
        <rect x={30} y={H - 66} width={520} height={52} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={40} y={H - 48} fontSize={10} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          A_i = (r_i - mean(r)) / std(r)
        </text>
        <text x={40} y={H - 30} fontSize={10} fill={COLORS.mid}>
          G 越大 → Advantage 估计越准（方差越小）→ 但计算成本线性增长 | 实践中 G=8~64
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
git add src/components/interactive/GRPOGroupSampling.tsx
git commit -m "feat(rl): add GRPOGroupSampling component"
```

---

## Task 35: MethodEvolution

**Files:**
- Create: `src/components/interactive/MethodEvolution.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface MethodNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  solved: string;
  introduced: string;
}

const METHODS: MethodNode[] = [
  { id: 'rlhf', label: 'RLHF', x: 100, y: 80, color: COLORS.primary, solved: '首次实现 LLM 对齐（InstructGPT）', introduced: '需要 RM + PPO + Critic，4 个模型，训练复杂' },
  { id: 'dpo', label: 'DPO', x: 250, y: 80, color: COLORS.purple, solved: '去掉 RM 和 PPO，训练简单如 SFT', introduced: 'Offline 数据分布偏移，容易过拟合' },
  { id: 'ipo', label: 'IPO', x: 100, y: 170, color: COLORS.green, solved: '加正则解决 DPO 过拟合', introduced: '仍是 offline，性能提升有限' },
  { id: 'kto', label: 'KTO', x: 250, y: 170, color: COLORS.green, solved: '不需要配对偏好，只需要好/坏标签', introduced: '信号更弱，对齐效果天花板较低' },
  { id: 'grpo', label: 'GRPO', x: 400, y: 170, color: COLORS.red, solved: '在线采样 + 去掉 Critic，降低训练资源', introduced: '需要生成多个回答（推理成本高）' },
];

const EDGES: [string, string][] = [
  ['rlhf', 'dpo'], ['dpo', 'ipo'], ['dpo', 'kto'], ['dpo', 'grpo'], ['rlhf', 'grpo'],
];

export default function MethodEvolution() {
  const [active, setActive] = useState<string | null>(null);
  const nodeMap = Object.fromEntries(METHODS.map(m => [m.id, m]));
  const activeNode = active ? nodeMap[active] : null;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          方法演进图谱
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          点击节点查看"解决了什么 / 引入了什么问题"
        </text>

        {/* Edges */}
        {EDGES.map(([from, to], i) => (
          <line key={i}
            x1={nodeMap[from].x} y1={nodeMap[from].y + 18}
            x2={nodeMap[to].x} y2={nodeMap[to].y - 18}
            stroke={COLORS.light} strokeWidth={1.5} />
        ))}

        {/* Nodes */}
        {METHODS.map(m => {
          const isActive = active === m.id;
          return (
            <g key={m.id} onClick={() => setActive(isActive ? null : m.id)} style={{ cursor: 'pointer' }}>
              <rect x={m.x - 45} y={m.y - 16} width={90} height={32} rx={16}
                fill={isActive ? m.color : COLORS.bgAlt}
                stroke={m.color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={m.x} y={m.y + 4} textAnchor="middle" fontSize={12} fontWeight={700}
                fill={isActive ? '#fff' : m.color}>{m.label}</text>
            </g>
          );
        })}

        {/* Detail panel */}
        {activeNode ? (
          <g>
            <rect x={30} y={220} width={520} height={70} rx={8} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
            <text x={40} y={240} fontSize={10} fontWeight={700} fill={COLORS.green}>
              ✓ 解决了什么：
            </text>
            <text x={40} y={258} fontSize={11} fill={COLORS.dark}>{activeNode.solved}</text>

            <rect x={30} y={300} width={520} height={70} rx={8} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
            <text x={40} y={320} fontSize={10} fontWeight={700} fill={COLORS.red}>
              ✗ 引入了什么问题：
            </text>
            <text x={40} y={338} fontSize={11} fill={COLORS.dark}>{activeNode.introduced}</text>
          </g>
        ) : (
          <g>
            <rect x={30} y={230} width={520} height={130} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={W / 2} y={290} textAnchor="middle" fontSize={12} fill={COLORS.mid}>
              ← 点击节点查看详情 →
            </text>
            <text x={W / 2} y={310} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
              每种方法都在解决前一种的问题，同时引入新的挑战
            </text>
          </g>
        )}

        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          没有完美方案 — 选择取决于训练资源、数据质量和性能需求
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
git add src/components/interactive/MethodEvolution.tsx
git commit -m "feat(rl): add MethodEvolution component"
```

---

## Task 36: TrainingCostCompare

**Files:**
- Create: `src/components/interactive/TrainingCostCompare.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Method {
  label: string;
  color: string;
  models: number;
  gpuRelative: number;
  dataReq: string;
  trainTime: string;
}

const METHODS: Method[] = [
  { label: 'RLHF', color: COLORS.primary, models: 4, gpuRelative: 1.0, dataReq: '大量偏好对 + prompts', trainTime: '最长（PPO 迭代）' },
  { label: 'DPO', color: COLORS.purple, models: 2, gpuRelative: 0.4, dataReq: '偏好对（可复用 RLHF 数据）', trainTime: '最短（类似 SFT）' },
  { label: 'GRPO', color: COLORS.red, models: 2, gpuRelative: 0.6, dataReq: 'Prompts + 规则 reward', trainTime: '中等（在线生成）' },
];

export default function TrainingCostCompare() {
  const [hovered, setHovered] = useState<number | null>(null);

  const chartX = 100, chartY = 70, chartW = 400, chartH = 180;
  const metrics = ['同时运行模型数', 'GPU 内存需求', '训练时间'];
  const barGroupW = chartW / 3;

  const getVal = (m: Method, mi: number): number => {
    if (mi === 0) return m.models / 4;
    if (mi === 1) return m.gpuRelative;
    if (mi === 2) return m.label === 'RLHF' ? 1 : m.label === 'GRPO' ? 0.6 : 0.3;
    return 0;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          训练资源需求对比
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          RLHF vs DPO vs GRPO — GPU、模型数、训练时间
        </text>

        {/* Chart area */}
        <line x1={chartX} y1={chartY + chartH} x2={chartX + chartW} y2={chartY + chartH}
          stroke={COLORS.light} strokeWidth={1} />

        {/* Metric groups */}
        {metrics.map((metric, mi) => {
          const gx = chartX + mi * barGroupW;
          return (
            <g key={mi}>
              <text x={gx + barGroupW / 2} y={chartY + chartH + 18} textAnchor="middle" fontSize={9} fill={COLORS.dark}>
                {metric}
              </text>
              {/* Bars for each method */}
              {METHODS.map((m, mIdx) => {
                const barW = (barGroupW - 20) / 3;
                const bx = gx + 10 + mIdx * barW;
                const val = getVal(m, mi);
                const bh = val * (chartH - 20);
                const isHov = hovered === mIdx;
                return (
                  <g key={mIdx}
                    onMouseEnter={() => setHovered(mIdx)}
                    onMouseLeave={() => setHovered(null)}>
                    <rect x={bx} y={chartY + chartH - bh} width={barW - 4} height={bh} rx={3}
                      fill={m.color} opacity={isHov ? 1 : 0.7} />
                    <text x={bx + (barW - 4) / 2} y={chartY + chartH - bh - 4} textAnchor="middle"
                      fontSize={8} fontWeight={600} fill={m.color} fontFamily={FONTS.mono}>
                      {mi === 0 ? m.models : (val * 100).toFixed(0) + '%'}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Legend */}
        {METHODS.map((m, i) => (
          <g key={i}>
            <rect x={chartX + i * 140} y={chartY - 10} width={12} height={12} rx={2} fill={m.color} />
            <text x={chartX + i * 140 + 18} y={chartY + 1} fontSize={10} fontWeight={600} fill={m.color}>{m.label}</text>
          </g>
        ))}

        {/* Detail panel */}
        {hovered !== null && (
          <g>
            <rect x={30} y={chartY + chartH + 30} width={520} height={70} rx={8}
              fill={COLORS.bgAlt} stroke={METHODS[hovered].color} strokeWidth={1.5} />
            <text x={45} y={chartY + chartH + 48} fontSize={12} fontWeight={700} fill={METHODS[hovered].color}>
              {METHODS[hovered].label}
            </text>
            <text x={45} y={chartY + chartH + 66} fontSize={10} fill={COLORS.dark}>
              模型数: {METHODS[hovered].models} | 数据需求: {METHODS[hovered].dataReq}
            </text>
            <text x={45} y={chartY + chartH + 84} fontSize={10} fill={COLORS.mid}>
              训练时长: {METHODS[hovered].trainTime}
            </text>
          </g>
        )}

        {!hovered && (
          <rect x={30} y={chartY + chartH + 30} width={520} height={70} rx={8}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} >
          </rect>
        )}
        {!hovered && (
          <>
            <text x={W / 2} y={chartY + chartH + 60} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.orange}>
              Hover 柱状图查看各方法详情
            </text>
            <text x={W / 2} y={chartY + chartH + 80} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
              DPO 最轻量（无 RM/Critic）| GRPO 中等（无 Critic 但需在线生成）| RLHF 最重
            </text>
          </>
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
git add src/components/interactive/TrainingCostCompare.tsx
git commit -m "feat(rl): add TrainingCostCompare component"
```

---

## Task 37: Article 5 MDX — direct-preference-optimization

**Files:**
- Create: `src/content/articles/zh/direct-preference-optimization.mdx`

- [ ] **Step 1: Create article MDX**

```mdx
---
title: "从 DPO 到 GRPO：直接偏好优化"
slug: direct-preference-optimization
locale: zh
tags: [dpo, grpo, ipo, preference-optimization, offline-rl]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [rlhf]
references:
  - type: paper
    title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model (Rafailov et al., 2023)"
    url: "https://arxiv.org/abs/2305.18290"
  - type: paper
    title: "A General Theoretical Paradigm to Understand Learning from Human Feedback (Azar et al., 2023)"
    url: "https://arxiv.org/abs/2310.12036"
  - type: paper
    title: "KTO: Model Alignment as Prospect Theoretic Optimization (Ethayarajh et al., 2024)"
    url: "https://arxiv.org/abs/2402.01306"
  - type: paper
    title: "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models (Shao et al., 2024)"
    url: "https://arxiv.org/abs/2402.03300"
  - type: website
    title: "Hugging Face TRL Documentation: DPO Trainer"
    url: "https://huggingface.co/docs/trl/dpo_trainer"
  - type: blog
    title: "Preference Tuning LLMs — Lilian Weng"
    url: "https://lilianweng.github.io/posts/2024-11-28-reward-hacking/"
---

import RLHFvsDPOArchitecture from '../../../components/interactive/RLHFvsDPOArchitecture.tsx';
import DPOLossViz from '../../../components/interactive/DPOLossViz.tsx';
import OfflineVsOnline from '../../../components/interactive/OfflineVsOnline.tsx';
import GRPOGroupSampling from '../../../components/interactive/GRPOGroupSampling.tsx';
import MethodEvolution from '../../../components/interactive/MethodEvolution.tsx';
import TrainingCostCompare from '../../../components/interactive/TrainingCostCompare.tsx';

## RLHF 的痛点

上一篇我们完整介绍了 RLHF 的三阶段 pipeline。虽然它成功推动了 ChatGPT 的诞生，但也暴露了几个核心痛点：

1. **训练复杂度高**：需要同时运行 4 个模型（policy, reference, RM, critic），PPO 训练不稳定
2. **Reward Model 是瓶颈**：RM 质量直接限制对齐效果天花板，且容易被 exploit
3. **超参数敏感**：PPO 的 clip epsilon、learning rate、KL penalty β 等参数需要精心调优

能不能**跳过 RM 和 PPO**，直接从偏好数据优化策略？这就是 DPO 的核心动机。

<RLHFvsDPOArchitecture client:visible />

## DPO 核心推导

DPO 的关键洞察是：**在 RLHF 框架中，最优策略和 reward function 之间存在 closed-form 关系**。

从 RLHF 的 KL 约束优化目标出发：

$$\max_\pi \mathbb{E}[r(x,y)] - \beta \cdot KL(\pi \| \pi_{ref})$$

可以推导出最优策略为：

$$\pi^*(y|x) = \frac{1}{Z(x)} \pi_{ref}(y|x) \exp\left(\frac{1}{\beta} r(x,y)\right)$$

反过来，reward 可以用策略表示：

$$r(x,y) = \beta \log \frac{\pi^*(y|x)}{\pi_{ref}(y|x)} + \beta \log Z(x)$$

将这个关系代入 Bradley-Terry 模型后，$Z(x)$ 项消除，得到 **DPO Loss**：

$$\mathcal{L}_{DPO}(\theta) = -\mathbb{E}\left[\log \sigma\left(\beta \left(\log \frac{\pi_\theta(y_w|x)}{\pi_{ref}(y_w|x)} - \log \frac{\pi_\theta(y_l|x)}{\pi_{ref}(y_l|x)}\right)\right)\right]$$

<DPOLossViz client:visible />

## DPO 的优势与问题

**优势：**
- 去掉了 Reward Model 和 PPO，只需要 2 个模型（policy + reference）
- 训练过程和 SFT 一样简单（前向传播 + 反向传播）
- 不需要在线采样，直接在离线偏好数据上训练

**问题：**
- **Offline 数据分布偏移**：训练数据来自旧策略，随着模型更新，数据和当前策略不匹配
- **对数据质量敏感**：偏好对中的噪音会直接影响优化方向
- **容易过拟合**：在小数据集上特别明显

## IPO 与 KTO

为了解决 DPO 的问题，研究者提出了多种变体：

**IPO (Identity Preference Optimization)**：加入正则项防止过拟合，让模型不需要将偏好对的 margin 推到无穷大。

**KTO (Kahneman-Tversky Optimization)**：最大的创新是**不需要配对偏好数据**——只需要知道每个回答是"好"还是"坏"，大大降低了数据标注成本。

## GRPO：DeepSeek 的方案

**GRPO (Group Relative Policy Optimization)** 来自 DeepSeek，核心创新是**去掉 Critic 网络**：

1. 对同一个 prompt，采样一组（G 个）回答
2. 用 reward function（可以是规则或 RM）给每个回答打分
3. 用组内相对排序计算 Advantage：$A_i = \frac{r_i - \text{mean}(r)}{\text{std}(r)}$
4. 用 PPO-style 的 clipped objective 更新策略

<GRPOGroupSampling client:visible />

GRPO 的优势是不需要 Critic 网络（省一个大模型的 GPU 内存），而且在线采样避免了分布偏移。DeepSeek-R1 用 GRPO + 规则 reward 训练出了涌现 thinking 能力的模型。

<OfflineVsOnline client:visible />

## 方法选型

<MethodEvolution client:visible />

没有完美的对齐方法。选择取决于你的约束条件：

| 维度 | RLHF | DPO | GRPO |
|------|------|-----|------|
| 训练复杂度 | 高（4 模型） | 低（2 模型） | 中（2 模型 + 在线生成） |
| 数据需求 | 偏好对 + prompts | 偏好对 | Prompts + reward rule |
| 训练稳定性 | PPO 不稳定 | 稳定如 SFT | 较稳定 |
| 性能天花板 | 高（在线优化） | 中（offline 限制） | 高（在线 + 涌现） |
| 适用场景 | 追求最佳对齐 | 快速迭代、资源有限 | 数学/推理任务 |

<TrainingCostCompare client:visible />

## 总结

1. **DPO** 用 closed-form 关系消除了 RM 和 PPO，让对齐训练简单如 SFT
2. **IPO** 加正则防过拟合，**KTO** 去除配对数据依赖
3. **GRPO** 去掉 Critic 用组采样计算 Advantage，兼顾效率和在线优化
4. 选择方法需权衡：训练资源 / 数据质量 / 性能需求
5. DeepSeek-R1 展示了 GRPO 在 reasoning 任务上的巨大潜力

下一篇我们将深入 Reward 设计：ORM vs PRM、reward hacking 的深层原因、以及 reward model 如何进化为 verifier。
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/direct-preference-optimization.mdx
git commit -m "feat(rl): add direct-preference-optimization article with 6 components"
```

---

## Task 38: ORMvsPRM

**Files:**
- Create: `src/components/interactive/ORMvsPRM.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface ReasonStep {
  text: string;
  correct: boolean;
  ormLabel?: string;
  prmLabel: string;
}

const STEPS: ReasonStep[] = [
  { text: '题目：计算 (2+3) × 4 - 6 ÷ 2', correct: true, prmLabel: '✓ 正确理解题意' },
  { text: '第一步：2 + 3 = 5', correct: true, prmLabel: '✓ 正确' },
  { text: '第二步：5 × 4 = 20', correct: true, prmLabel: '✓ 正确' },
  { text: '第三步：6 ÷ 2 = 4', correct: false, prmLabel: '✗ 错误！6÷2=3' },
  { text: '第四步：20 - 4 = 16', correct: true, prmLabel: '✓ 计算正确（但基于错误前提）' },
  { text: '最终答案：16', correct: false, ormLabel: '✗ 答案错误', prmLabel: '✗ 答案错误 (正确: 17)' },
];

export default function ORMvsPRM() {
  const [showPRM, setShowPRM] = useState(false);

  const stepY = 80;
  const stepH = 46;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          ORM vs PRM：结果奖励 vs 过程奖励
        </text>

        {/* Toggle */}
        <g onClick={() => setShowPRM(!showPRM)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 80} y={36} width={160} height={26} rx={13}
            fill={showPRM ? COLORS.green : COLORS.orange} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showPRM ? 'PRM (Process Reward)' : 'ORM (Outcome Reward)'}
          </text>
        </g>

        {/* Reasoning steps */}
        {STEPS.map((step, i) => {
          const y = stepY + i * stepH;
          const isLast = i === STEPS.length - 1;

          return (
            <g key={i}>
              {/* Step box */}
              <rect x={30} y={y} width={340} height={stepH - 6} rx={6}
                fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
              <text x={40} y={y + (stepH - 6) / 2 + 4} fontSize={10} fill={COLORS.dark}>
                {step.text}
              </text>

              {/* ORM: only labels the final answer */}
              {!showPRM && (
                <g>
                  {isLast ? (
                    <>
                      <rect x={390} y={y} width={170} height={stepH - 6} rx={6}
                        fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1.5} />
                      <text x={475} y={y + (stepH - 6) / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.red}>
                        {step.ormLabel}
                      </text>
                    </>
                  ) : (
                    <rect x={390} y={y} width={170} height={stepH - 6} rx={6}
                      fill={COLORS.masked} stroke={COLORS.light} strokeWidth={1} />
                  )}
                  {!isLast && (
                    <text x={475} y={y + (stepH - 6) / 2 + 4} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
                      — (不评估)
                    </text>
                  )}
                </g>
              )}

              {/* PRM: labels each step */}
              {showPRM && (
                <rect x={390} y={y} width={170} height={stepH - 6} rx={6}
                  fill={step.correct ? '#d4edda' : COLORS.waste}
                  stroke={step.correct ? COLORS.green : COLORS.red} strokeWidth={1.5} />
              )}
              {showPRM && (
                <text x={475} y={y + (stepH - 6) / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={600}
                  fill={step.correct ? COLORS.green : COLORS.red}>
                  {step.prmLabel}
                </text>
              )}
            </g>
          );
        })}

        {/* Highlight the key insight */}
        {showPRM && (
          <rect x={390} y={stepY + 3 * stepH} width={170} height={stepH - 6} rx={6}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth={2.5}
            opacity={0.3} />
        )}

        {/* Bottom explanation */}
        <rect x={30} y={H - 56} width={520} height={44} rx={6}
          fill={showPRM ? '#d4edda' : COLORS.highlight}
          stroke={showPRM ? COLORS.green : COLORS.orange} strokeWidth={1} />
        <text x={40} y={H - 38} fontSize={10} fontWeight={600} fill={showPRM ? COLORS.green : COLORS.orange}>
          {showPRM ? 'PRM 优势：' : 'ORM 局限：'}
        </text>
        <text x={40} y={H - 22} fontSize={10} fill={COLORS.mid}>
          {showPRM
            ? '第 3 步错误被精确定位！即使最终答案碰巧对了，PRM 也能发现过程错误（更细粒度的信号）'
            : 'ORM 只看最终答案 → 如果过程错误但答案碰巧对了，ORM 会给高分 → 无法定位错误步骤'}
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
git add src/components/interactive/ORMvsPRM.tsx
git commit -m "feat(rl): add ORMvsPRM component"
```

---

## Task 39: RewardHackingGallery

**Files:**
- Create: `src/components/interactive/RewardHackingGallery.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface HackCase {
  title: string;
  rmScore: number;
  quality: number;
  example: string;
  mechanism: string;
}

const CASES: HackCase[] = [
  {
    title: '冗长注水',
    rmScore: 0.91,
    quality: 0.35,
    example: '非常感谢您提出这个非常好的问题。让我来非常详细地为您解答这个非常重要的问题。首先...（500字废话后才切入正题）',
    mechanism: 'RM 在训练数据中看到"详细回答"得分高 → 模型学会"写得长就是写得好"',
  },
  {
    title: '讨好措辞',
    rmScore: 0.87,
    quality: 0.45,
    example: '这真是一个非常棒的问题！您的思考非常深刻！让我来回答...\n（实际回答内容浅薄）',
    mechanism: 'RM 训练数据中友善回答得分高 → 模型学会用赞美代替实质内容',
  },
  {
    title: '格式包装',
    rmScore: 0.94,
    quality: 0.40,
    example: '## 答案\n### 1. 第一点\n- 要点 A\n- 要点 B\n### 2. 第二点\n（格式完美但内容是同义重复）',
    mechanism: 'RM 偏好结构化输出 → 模型学会用精美格式掩盖空洞内容',
  },
  {
    title: '安全逃避',
    rmScore: 0.82,
    quality: 0.20,
    example: '我理解您的问题，但这个话题比较敏感...\n作为 AI 助手，我无法提供...\n建议您咨询专业人士...',
    mechanism: 'Safety RM 惩罚任何"危险"回答 → 模型对所有稍有争议的问题都拒绝回答',
  },
];

export default function RewardHackingGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = CASES[activeIdx];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Reward Hacking 案例展
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          RM score 高 ≠ 真实质量高 — Goodhart's Law 的体现
        </text>

        {/* Case tabs */}
        {CASES.map((c, i) => (
          <g key={i} onClick={() => setActiveIdx(i)} style={{ cursor: 'pointer' }}>
            <rect x={30 + i * 135} y={55} width={125} height={28} rx={6}
              fill={activeIdx === i ? COLORS.red : COLORS.bgAlt}
              stroke={COLORS.mid} strokeWidth={1} />
            <text x={92 + i * 135} y={73} textAnchor="middle" fontSize={10}
              fontWeight={activeIdx === i ? 700 : 400} fill={activeIdx === i ? '#fff' : COLORS.dark}>
              {c.title}
            </text>
          </g>
        ))}

        {/* Score comparison */}
        <rect x={30} y={95} width={250} height={70} rx={8} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={45} y={115} fontSize={11} fontWeight={600} fill={COLORS.dark}>RM Score</text>
        <rect x={130} y={103} width={active.rmScore * 130} height={14} rx={3} fill={COLORS.green} opacity={0.7} />
        <text x={130 + active.rmScore * 130 + 8} y={115} fontSize={10} fontWeight={600} fill={COLORS.green} fontFamily={FONTS.mono}>
          {active.rmScore.toFixed(2)}
        </text>
        <text x={45} y={145} fontSize={11} fontWeight={600} fill={COLORS.dark}>真实质量</text>
        <rect x={130} y={133} width={active.quality * 130} height={14} rx={3} fill={COLORS.red} opacity={0.7} />
        <text x={130 + active.quality * 130 + 8} y={145} fontSize={10} fontWeight={600} fill={COLORS.red} fontFamily={FONTS.mono}>
          {active.quality.toFixed(2)}
        </text>

        {/* Gap indicator */}
        <rect x={300} y={95} width={250} height={70} rx={8} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
        <text x={425} y={115} textAnchor="middle" fontSize={20} fontWeight={700} fill={COLORS.red}>
          ⚠ Gap: {((active.rmScore - active.quality) * 100).toFixed(0)}%
        </text>
        <text x={425} y={138} textAnchor="middle" fontSize={10} fill={COLORS.dark}>
          RM 认为很好
        </text>
        <text x={425} y={153} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          实际质量很差
        </text>

        {/* Example output */}
        <rect x={30} y={175} width={520} height={90} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={40} y={193} fontSize={10} fontWeight={600} fill={COLORS.dark}>模型输出示例：</text>
        {active.example.split('\n').slice(0, 3).map((line, i) => (
          <text key={i} x={40} y={211 + i * 16} fontSize={10} fill={COLORS.mid}>
            {line.substring(0, 70)}{line.length > 70 ? '...' : ''}
          </text>
        ))}

        {/* Mechanism */}
        <rect x={30} y={275} width={520} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={40} y={293} fontSize={10} fontWeight={600} fill={COLORS.orange}>Hack 机制：</text>
        <text x={40} y={311} fontSize={10} fill={COLORS.dark}>
          {active.mechanism}
        </text>

        {/* Bottom insight */}
        <rect x={30} y={335} width={520} height={48} rx={6} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
        <text x={40} y={355} fontSize={10} fontWeight={600} fill={COLORS.primary}>
          Goodhart's Law: "当一个度量成为目标时，它就不再是一个好的度量"
        </text>
        <text x={40} y={373} fontSize={10} fill={COLORS.mid}>
          解决方案：更大更强的 RM、过程奖励 (PRM)、多样化训练数据、KL 约束、Constitutional AI
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
git add src/components/interactive/RewardHackingGallery.tsx
git commit -m "feat(rl): add RewardHackingGallery component"
```

---

## Task 40: RewardScalingChart

**Files:**
- Create: `src/components/interactive/RewardScalingChart.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function RewardScalingChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const chartX = 70, chartY = 60, chartW = 440, chartH = 210;
  const dataPoints = [
    { size: '125M', alignment: 0.35, hackRate: 0.82 },
    { size: '350M', alignment: 0.48, hackRate: 0.68 },
    { size: '1.3B', alignment: 0.62, hackRate: 0.52 },
    { size: '6.7B', alignment: 0.75, hackRate: 0.35 },
    { size: '13B', alignment: 0.83, hackRate: 0.22 },
    { size: '70B', alignment: 0.91, hackRate: 0.12 },
  ];

  const toX = (i: number) => chartX + (i / (dataPoints.length - 1)) * chartW;
  const toY = (v: number) => chartY + chartH - v * chartH;

  const alignmentPath = dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(d.alignment)}`).join(' ');
  const hackPath = dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(d.hackRate)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Reward Model Scaling：更大的 RM 更难被 Hack
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          RM 参数量 vs 对齐效果 / Hack 成功率
        </text>

        {/* Chart area */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(v => (
          <line key={v} x1={chartX} y1={toY(v)} x2={chartX + chartW} y2={toY(v)}
            stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4 3" />
        ))}

        {/* Curves */}
        <path d={alignmentPath} fill="none" stroke={COLORS.green} strokeWidth={2.5} />
        <path d={hackPath} fill="none" stroke={COLORS.red} strokeWidth={2.5} />

        {/* Data points */}
        {dataPoints.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <circle cx={toX(i)} cy={toY(d.alignment)} r={hovered === i ? 6 : 4} fill={COLORS.green} />
            <circle cx={toX(i)} cy={toY(d.hackRate)} r={hovered === i ? 6 : 4} fill={COLORS.red} />
            <text x={toX(i)} y={chartY + chartH + 14} textAnchor="middle" fontSize={8} fill={COLORS.dark} fontFamily={FONTS.mono}>
              {d.size}
            </text>
            {hovered === i && (
              <g>
                <rect x={toX(i) + 8} y={toY(d.alignment) - 20} width={100} height={36} rx={4}
                  fill="rgba(255,255,255,0.95)" stroke={COLORS.mid} strokeWidth={0.5} />
                <text x={toX(i) + 14} y={toY(d.alignment) - 6} fontSize={9} fill={COLORS.green} fontFamily={FONTS.mono}>
                  对齐效果: {(d.alignment * 100).toFixed(0)}%
                </text>
                <text x={toX(i) + 14} y={toY(d.alignment) + 8} fontSize={9} fill={COLORS.red} fontFamily={FONTS.mono}>
                  Hack 率: {(d.hackRate * 100).toFixed(0)}%
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Legend */}
        <line x1={chartX + 10} y1={chartY + 14} x2={chartX + 30} y2={chartY + 14} stroke={COLORS.green} strokeWidth={2.5} />
        <text x={chartX + 35} y={chartY + 18} fontSize={10} fill={COLORS.green}>对齐效果 ↑</text>
        <line x1={chartX + 150} y1={chartY + 14} x2={chartX + 170} y2={chartY + 14} stroke={COLORS.red} strokeWidth={2.5} />
        <text x={chartX + 175} y={chartY + 18} fontSize={10} fill={COLORS.red}>Hack 成功率 ↓</text>

        {/* X axis */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 30} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          Reward Model 参数量
        </text>

        {/* Insight */}
        <rect x={40} y={H - 48} width={500} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 28} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          Scaling Law for RM: 更大的 RM → 更好的对齐 + 更难被 hack (Gao et al., 2022)
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
git add src/components/interactive/RewardScalingChart.tsx
git commit -m "feat(rl): add RewardScalingChart component"
```

---

## Task 41: ConstitutionalAIFlow (StepNavigator)

**Files:**
- Create: `src/components/interactive/ConstitutionalAIFlow.tsx`

- [ ] **Step 1: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function ConstitutionalAIFlow() {
  const steps = [
    {
      title: '人类写 Principles',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 1: 人类定义宪法原则
          </text>
          {[
            '原则 1: 回答应该是有帮助的、诚实的、无害的',
            '原则 2: 不要帮助用户做危险或非法的事情',
            '原则 3: 承认不确定性，不要编造事实',
            '原则 4: 尊重用户隐私和个人信息',
          ].map((p, i) => (
            <g key={i}>
              <rect x={40} y={35 + i * 32} width={500} height={26} rx={4} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
              <text x={50} y={52 + i * 32} fontSize={10} fill={COLORS.primary}>{p}</text>
            </g>
          ))}
          <text x={W / 2} y={170} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            人类只需要定义高层原则，不需要逐条标注偏好对
          </text>
        </svg>
      ),
    },
    {
      title: 'LLM 自我评判 (Critique)',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 2: LLM 根据原则评判自己的回答
          </text>
          <rect x={30} y={40} width={240} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={58} fontSize={10} fontWeight={600} fill={COLORS.dark}>原始回答：</text>
          <text x={40} y={76} fontSize={10} fill={COLORS.mid}>"这里是如何制作炸弹的步骤..."</text>

          <line x1={275} y1={65} x2={310} y2={65} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowCAI)" />
          <defs>
            <marker id="arrowCAI" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.orange} />
            </marker>
          </defs>

          <rect x={315} y={40} width={240} height={50} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1.5} />
          <text x={325} y={58} fontSize={10} fontWeight={600} fill={COLORS.red}>Critique：</text>
          <text x={325} y={76} fontSize={10} fill={COLORS.dark}>"违反原则 2：帮助危险行为"</text>

          <rect x={30} y={110} width={520} height={55} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={40} y={128} fontSize={10} fontWeight={600} fill={COLORS.orange}>关键：LLM 自己当评判者</text>
          <text x={40} y={146} fontSize={10} fill={COLORS.mid}>
            给 LLM 原则 + 自己的回答 → 让它判断是否违反原则 → 自动生成"critique"
          </text>
        </svg>
      ),
    },
    {
      title: '生成改进版本 (Revision)',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 3: LLM 根据 critique 修改回答
          </text>
          <rect x={30} y={40} width={160} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={110} y={64} textAnchor="middle" fontSize={10} fill={COLORS.red}>原始回答 (有害)</text>

          <text x={200} y={64} fontSize={12} fill={COLORS.mid}>+</text>

          <rect x={215} y={40} width={120} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={275} y={64} textAnchor="middle" fontSize={10} fill={COLORS.orange}>Critique</text>

          <line x1={340} y1={60} x2={385} y2={60} stroke={COLORS.green} strokeWidth={2} markerEnd="url(#arrowCAI)" />

          <rect x={390} y={40} width={160} height={40} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={470} y={64} textAnchor="middle" fontSize={10} fill={COLORS.green}>修改后回答 (安全)</text>

          <rect x={30} y={100} width={520} height={60} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.dark}>产出：</text>
          <text x={40} y={138} fontSize={10} fill={COLORS.mid}>
            (原始回答, 修改后回答) 构成偏好对 → 可以用来训练 RM 或直接做 DPO
          </text>
          <text x={40} y={154} fontSize={10} fill={COLORS.mid}>
            这就是 RLAIF (RL from AI Feedback) — AI 替代人类做标注
          </text>
        </svg>
      ),
    },
    {
      title: 'RLAIF vs RLHF 对比',
      content: (
        <svg viewBox={`0 0 ${W} 180`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 4: Constitutional AI 的意义
          </text>

          <rect x={30} y={40} width={250} height={80} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={155} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.primary}>RLHF</text>
          <text x={40} y={78} fontSize={10} fill={COLORS.mid}>标注来源：人类标注者</text>
          <text x={40} y={94} fontSize={10} fill={COLORS.mid}>成本：高（需要大量人工）</text>
          <text x={40} y={110} fontSize={10} fill={COLORS.mid}>可扩展性：有限</text>

          <rect x={300} y={40} width={250} height={80} rx={8} fill={COLORS.highlight} stroke={COLORS.green} strokeWidth={1} />
          <text x={425} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.green}>RLAIF (Constitutional AI)</text>
          <text x={310} y={78} fontSize={10} fill={COLORS.mid}>标注来源：LLM 自身</text>
          <text x={310} y={94} fontSize={10} fill={COLORS.mid}>成本：低（自动化）</text>
          <text x={310} y={110} fontSize={10} fill={COLORS.mid}>可扩展性：高</text>

          <rect x={30} y={135} width={520} height={36} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={152} fontSize={10} fontWeight={600} fill={COLORS.orange}>
            核心思路：用少量人类定义的原则 + LLM 的判断能力 → 大规模自动生成对齐数据
          </text>
          <text x={40} y={166} fontSize={10} fill={COLORS.mid}>
            Anthropic (Claude) 使用 Constitutional AI 作为其对齐策略的核心
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
git add src/components/interactive/ConstitutionalAIFlow.tsx
git commit -m "feat(rl): add ConstitutionalAIFlow StepNavigator component"
```

---

## Task 42: RewardToVerifier

**Files:**
- Create: `src/components/interactive/RewardToVerifier.tsx`

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Stage {
  id: string;
  label: string;
  x: number;
  capability: string;
  output: string;
  limitation: string;
}

const STAGES: Stage[] = [
  { id: 'rm', label: 'Reward Model', x: 80, capability: '给整个回答一个标量分数', output: 'r(x,y) ∈ ℝ', limitation: '无法定位错误步骤' },
  { id: 'prm', label: 'Process RM', x: 230, capability: '对推理过程的每一步打分', output: 'r(x,y,step_i) ∈ ℝ', limitation: '需要逐步标注数据' },
  { id: 'verifier', label: 'Verifier', x: 380, capability: '验证推理过程的正确性', output: 'correct/incorrect per step', limitation: '仅适用于可验证问题' },
];

export default function RewardToVerifier() {
  const [active, setActive] = useState<string | null>(null);
  const activeStage = STAGES.find(s => s.id === active);

  const stageY = 100;
  const boxW = 120, boxH = 50;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          从 Reward Model 到 Verifier 的演进
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          点击每个阶段查看能力对比
        </text>

        {/* Evolution arrow */}
        <line x1={80} y1={stageY - 24} x2={480} y2={stageY - 24}
          stroke={COLORS.light} strokeWidth={2} markerEnd="url(#arrowRV)" />
        <text x={280} y={stageY - 30} textAnchor="middle" fontSize={9} fill={COLORS.mid}>能力演进 →</text>
        <defs>
          <marker id="arrowRV" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.light} />
          </marker>
        </defs>

        {/* Stage boxes */}
        {STAGES.map((stage, i) => {
          const isActive = active === stage.id;
          const colors = [COLORS.primary, COLORS.orange, COLORS.green];
          return (
            <g key={stage.id} onClick={() => setActive(isActive ? null : stage.id)} style={{ cursor: 'pointer' }}>
              <rect x={stage.x - boxW / 2} y={stageY} width={boxW} height={boxH} rx={10}
                fill={isActive ? colors[i] : COLORS.bgAlt}
                stroke={colors[i]} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={stage.x} y={stageY + boxH / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700}
                fill={isActive ? '#fff' : colors[i]}>
                {stage.label}
              </text>
            </g>
          );
        })}

        {/* Test-time scaling callout */}
        <rect x={450} y={stageY + 10} width={110} height={30} rx={6}
          fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth={1} />
        <text x={505} y={stageY + 29} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.purple}>
          → Test-Time Scaling
        </text>

        {/* Detail panel */}
        {activeStage ? (
          <g>
            <rect x={30} y={190} width={520} height={55} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
            <text x={45} y={210} fontSize={11} fontWeight={700} fill={COLORS.dark}>能力：</text>
            <text x={100} y={210} fontSize={11} fill={COLORS.dark}>{activeStage.capability}</text>
            <text x={45} y={230} fontSize={10} fontWeight={600} fill={COLORS.mid}>输出：</text>
            <text x={100} y={230} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>{activeStage.output}</text>

            <rect x={30} y={255} width={520} height={35} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
            <text x={45} y={276} fontSize={10} fontWeight={600} fill={COLORS.red}>局限：</text>
            <text x={100} y={276} fontSize={10} fill={COLORS.dark}>{activeStage.limitation}</text>
          </g>
        ) : (
          <rect x={30} y={190} width={520} height={100} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        )}
        {!activeStage && (
          <text x={W / 2} y={240} textAnchor="middle" fontSize={12} fill={COLORS.mid}>
            ← 点击阶段查看详情 →
          </text>
        )}

        {/* Comparison table */}
        <rect x={30} y={300} width={520} height={60} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={100} y={318} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.dark}>粒度</text>
        <text x={240} y={318} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.dark}>标注成本</text>
        <text x={380} y={318} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.dark}>信号质量</text>
        <text x={510} y={318} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.dark}>用途</text>

        {[
          { label: 'RM', g: '整体', c: '低', q: '粗', u: 'RLHF' },
          { label: 'PRM', g: '逐步', c: '高', q: '细', u: 'MCTS' },
          { label: 'Verifier', g: '逐步', c: '中(规则)', q: '精确', u: 'Best-of-N' },
        ].map((row, i) => (
          <g key={i}>
            <text x={40} y={338 + i * 14} fontSize={9} fontWeight={600} fill={COLORS.dark}>{row.label}</text>
            <text x={100} y={338 + i * 14} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{row.g}</text>
            <text x={240} y={338 + i * 14} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{row.c}</text>
            <text x={380} y={338 + i * 14} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{row.q}</text>
            <text x={510} y={338 + i * 14} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{row.u}</text>
          </g>
        ))}
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
git add src/components/interactive/RewardToVerifier.tsx
git commit -m "feat(rl): add RewardToVerifier component"
```

---

## Task 43: Article 6 MDX — reward-modeling

**Files:**
- Create: `src/content/articles/zh/reward-modeling.mdx`

- [ ] **Step 1: Create article MDX**

```mdx
---
title: "Reward 设计与 Scaling"
slug: reward-modeling
locale: zh
tags: [reward-model, reward-hacking, process-reward, outcome-reward, constitutional-ai]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [rlhf]
references:
  - type: paper
    title: "Let's Verify Step by Step (Lightman et al., 2023)"
    url: "https://arxiv.org/abs/2305.20050"
  - type: paper
    title: "Training Verifiers to Solve Math Word Problems (Cobbe et al., 2021)"
    url: "https://arxiv.org/abs/2110.14168"
  - type: paper
    title: "Constitutional AI: Harmlessness from AI Feedback (Bai et al., 2022)"
    url: "https://arxiv.org/abs/2212.08073"
  - type: paper
    title: "Scaling Laws for Reward Model Overoptimization (Gao et al., 2022)"
    url: "https://arxiv.org/abs/2210.10760"
  - type: blog
    title: "Reward Hacking in Reinforcement Learning — Lilian Weng"
    url: "https://lilianweng.github.io/posts/2024-11-28-reward-hacking/"
  - type: blog
    title: "Reward Model 系列 — Nathan Lambert (interconnects.ai)"
    url: "https://www.interconnects.ai/"
---

import ORMvsPRM from '../../../components/interactive/ORMvsPRM.tsx';
import RewardHackingGallery from '../../../components/interactive/RewardHackingGallery.tsx';
import RewardScalingChart from '../../../components/interactive/RewardScalingChart.tsx';
import ConstitutionalAIFlow from '../../../components/interactive/ConstitutionalAIFlow.tsx';
import RewardToVerifier from '../../../components/interactive/RewardToVerifier.tsx';

## Reward Model 是对齐的核心

无论你选择 RLHF、DPO 还是 GRPO，最终都依赖某种形式的 **reward 信号**。RLHF 显式训练一个 RM；DPO 隐式学习 reward；GRPO 用规则或 RM 打分。

RM 的质量直接决定了对齐效果的天花板。一个完美的 RM 意味着完美的对齐——但现实中 RM 总是不完美的，这就引出了一系列核心挑战。

## Outcome Reward vs Process Reward

传统 RM 是 **Outcome Reward Model (ORM)**：只看最终结果打一个分。但对于推理任务（数学、代码、逻辑），这种粗粒度信号有明显缺陷。

**Process Reward Model (PRM)** 对推理过程的每一步都打分，提供更细粒度的监督信号。

<ORMvsPRM client:visible />

PRM 的核心优势：
- 能识别"答案碰巧对但推理过程错"的情况
- 为 MCTS 式搜索提供节点级别的评估信号
- 更好的 credit assignment（定位哪一步出了问题）

但 PRM 的标注成本显著更高——需要逐步标注每一步的正确性。OpenAI 的"Let's Verify Step by Step"论文表明 PRM 在数学推理上显著优于 ORM。

## Reward Hacking 深度分析

**Goodhart's Law** 在 RL 对齐中的体现：当 RM score 成为优化目标时，模型会找到最大化 score 但不真正提高质量的"捷径"。

<RewardHackingGallery client:visible />

常见 reward hacking pattern：
- **冗长注水**：RM 偏好详细回答 → 模型学会写冗余内容
- **讨好措辞**：RM 偏好友善语气 → 模型用赞美替代实质
- **格式包装**：RM 偏好结构化输出 → 形式大于内容
- **安全逃避**：Safety RM 过度惩罚 → 模型对正常问题也拒绝回答

## Reward Model Scaling

好消息是：**更大的 RM 更难被 hack**。Gao et al. (2022) 的研究表明，RM 的参数量和训练数据量都遵循 scaling law：

<RewardScalingChart client:visible />

这给出了一个清晰的工程指导：**投资更大更好的 RM，而不是更复杂的训练算法**。

## Constitutional AI 与自动 Reward

人工标注偏好数据成本高且难以扩展。Anthropic 的 **Constitutional AI** 提出了一种替代方案：**让 LLM 自己生成偏好判断**。

<ConstitutionalAIFlow client:visible />

这种 RLAIF（RL from AI Feedback）方法的核心思路：
1. 人类只定义高层原则（"constitution"）
2. LLM 根据原则自我评判和修改回答
3. 修改前后的回答对构成训练数据

这大大降低了标注成本，使对齐训练可以大规模自动化。

## 从 Reward 到 Verifier

Reward Model 的进化路径：**从打分器到验证器**。

<RewardToVerifier client:visible />

这个演进为 **Test-Time Scaling** 铺平了道路：有了 verifier，我们可以在推理时生成多个候选回答，用 verifier 选最好的——这是下一篇文章的核心主题。

## 总结

1. **RM 是对齐的核心**，其质量直接决定对齐效果天花板
2. **PRM 优于 ORM**：逐步打分提供更细粒度的信号，尤其适合推理任务
3. **Reward Hacking** 是 Goodhart's Law 的体现，更大的 RM 更难被 hack
4. **Constitutional AI** 用 LLM 自我评判替代人工标注，实现大规模 RLAIF
5. **RM → PRM → Verifier** 的演进为 test-time scaling 奠定基础

下一篇，我们将探讨 test-time scaling：如何在推理时投入更多计算来提升 LLM 的输出质量。
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/reward-modeling.mdx
git commit -m "feat(rl): add reward-modeling article with 5 components"
```

---

## Task 44: ScalingParadigmCompare + BestOfNSimulator + MCTSReasoningTree + DeepSeekR1Pipeline + EmergentThinking + ComputeOptimalInference (Article 7 Components)

**Files:**
- Create: `src/components/interactive/ScalingParadigmCompare.tsx`
- Create: `src/components/interactive/BestOfNSimulator.tsx`
- Create: `src/components/interactive/MCTSReasoningTree.tsx`
- Create: `src/components/interactive/DeepSeekR1Pipeline.tsx`
- Create: `src/components/interactive/EmergentThinking.tsx`
- Create: `src/components/interactive/ComputeOptimalInference.tsx`

### Sub-step A: ScalingParadigmCompare

- [ ] **Step 1: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function ScalingParadigmCompare() {
  const [hovered, setHovered] = useState<'train' | 'test' | null>(null);

  const chartX = 60, chartY = 70, chartW = 200, chartH = 220;
  const chart2X = 320;

  // Train-time scaling data: diminishing returns
  const trainData = Array.from({ length: 20 }, (_, i) => {
    const x = (i + 1) / 20;
    return { x, y: 1 - Math.exp(-x * 3) };
  });

  // Test-time scaling data: continued improvement
  const testData = Array.from({ length: 20 }, (_, i) => {
    const x = (i + 1) / 20;
    return { x, y: 0.4 + 0.5 * (1 - Math.exp(-x * 4)) };
  });

  const toPath = (data: { x: number; y: number }[], cx: number) =>
    data.map((d, i) => {
      const px = cx + d.x * chartW;
      const py = chartY + chartH - d.y * chartH;
      return `${i === 0 ? 'M' : 'L'} ${px},${py}`;
    }).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Train-Time vs Test-Time Scaling
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          两种不同的"投入更多计算"策略
        </text>

        {/* Train-time chart */}
        <text x={chartX + chartW / 2} y={chartY - 8} textAnchor="middle" fontSize={11} fontWeight={600}
          fill={hovered === 'train' ? COLORS.primary : COLORS.dark}>
          Train-Time Scaling
        </text>
        <rect x={chartX} y={chartY} width={chartW} height={chartH}
          fill={COLORS.bgAlt} stroke={hovered === 'train' ? COLORS.primary : COLORS.light} strokeWidth={hovered === 'train' ? 2 : 1} rx={4}
          onMouseEnter={() => setHovered('train')} onMouseLeave={() => setHovered(null)} />
        <path d={toPath(trainData, chartX)} fill="none" stroke={COLORS.primary} strokeWidth={2.5} />
        <text x={chartX + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          模型参数量 / 训练数据量
        </text>
        {/* Saturation annotation */}
        <text x={chartX + chartW - 30} y={chartY + 30} fontSize={9} fill={COLORS.red}>趋缓 ↗</text>

        {/* Test-time chart */}
        <text x={chart2X + chartW / 2} y={chartY - 8} textAnchor="middle" fontSize={11} fontWeight={600}
          fill={hovered === 'test' ? COLORS.green : COLORS.dark}>
          Test-Time Scaling
        </text>
        <rect x={chart2X} y={chartY} width={chartW} height={chartH}
          fill={COLORS.bgAlt} stroke={hovered === 'test' ? COLORS.green : COLORS.light} strokeWidth={hovered === 'test' ? 2 : 1} rx={4}
          onMouseEnter={() => setHovered('test')} onMouseLeave={() => setHovered(null)} />
        <path d={toPath(testData, chart2X)} fill="none" stroke={COLORS.green} strokeWidth={2.5} />
        <text x={chart2X + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          推理时计算量（采样次数 / 搜索深度）
        </text>
        {/* Continued improvement annotation */}
        <text x={chart2X + chartW - 20} y={chartY + 30} fontSize={9} fill={COLORS.green}>持续提升 ↑</text>

        {/* Y axis label */}
        <text x={chartX - 12} y={chartY + chartH / 2} textAnchor="middle" fontSize={9} fill={COLORS.mid}
          transform={`rotate(-90, ${chartX - 12}, ${chartY + chartH / 2})`}>性能</text>

        {/* Comparison boxes */}
        <rect x={30} y={H - 68} width={250} height={54} rx={6} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
        <text x={40} y={H - 50} fontSize={10} fontWeight={600} fill={COLORS.primary}>Train-Time</text>
        <text x={40} y={H - 34} fontSize={9} fill={COLORS.mid}>增大模型/数据 → 性能提升但趋缓</text>
        <text x={40} y={H - 20} fontSize={9} fill={COLORS.mid}>成本：训练一次，推理无额外开销</text>

        <rect x={300} y={H - 68} width={250} height={54} rx={6} fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1} />
        <text x={310} y={H - 50} fontSize={10} fontWeight={600} fill={COLORS.green}>Test-Time</text>
        <text x={310} y={H - 34} fontSize={9} fill={COLORS.mid}>固定模型，推理投入更多计算</text>
        <text x={310} y={H - 20} fontSize={9} fill={COLORS.mid}>成本：每次推理都额外消耗计算</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/interactive/ScalingParadigmCompare.tsx
git commit -m "feat(rl): add ScalingParadigmCompare component"
```

### Sub-step B: BestOfNSimulator

- [ ] **Step 3: Create component**

```tsx
import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function BestOfNSimulator() {
  const [n, setN] = useState(8);

  const data = useMemo(() => {
    const results: { n: number; accuracy: number; cost: number }[] = [];
    for (let ni = 1; ni <= 64; ni *= 2) {
      // Simulate: as N increases, probability of at least one correct answer increases
      const baseAccuracy = 0.4; // single sample accuracy
      const accuracy = 1 - Math.pow(1 - baseAccuracy, ni);
      results.push({ n: ni, accuracy, cost: ni });
    }
    return results;
  }, []);

  const currentData = data.find(d => d.n === n) || data[0];

  const chartX = 60, chartY = 80, chartW = 220, chartH = 180;
  const chart2X = 330, chart2W = 210;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Best-of-N Sampling
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          生成 N 个回答 → 用 Verifier 选最好的
        </text>

        {/* N selector */}
        <text x={W / 2} y={64} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          N = {n}
        </text>
        {[1, 2, 4, 8, 16, 32, 64].map((ni, i) => (
          <g key={ni} onClick={() => setN(ni)} style={{ cursor: 'pointer' }}>
            <rect x={100 + i * 56} y={70} width={48} height={20} rx={4}
              fill={n === ni ? COLORS.primary : COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={124 + i * 56} y={84} textAnchor="middle" fontSize={9}
              fill={n === ni ? '#fff' : COLORS.dark}>{ni}</text>
          </g>
        ))}

        {/* Accuracy chart */}
        <text x={chartX + chartW / 2} y={chartY - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          正确率 vs N
        </text>
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        {data.map((d, i) => {
          const x = chartX + (i / (data.length - 1)) * chartW;
          const barH = d.accuracy * (chartH - 20);
          const isCurrent = d.n === n;
          return (
            <g key={i}>
              <rect x={x - 12} y={chartY + chartH - barH - 5} width={24} height={barH}
                rx={3} fill={isCurrent ? COLORS.green : COLORS.primary} opacity={isCurrent ? 1 : 0.4} />
              <text x={x} y={chartY + chartH + 12} textAnchor="middle" fontSize={8} fill={COLORS.dark} fontFamily={FONTS.mono}>
                {d.n}
              </text>
              <text x={x} y={chartY + chartH - barH - 10} textAnchor="middle" fontSize={8} fontWeight={600}
                fill={isCurrent ? COLORS.green : COLORS.mid} fontFamily={FONTS.mono}>
                {(d.accuracy * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {/* Cost chart */}
        <text x={chart2X + chart2W / 2} y={chartY - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          计算成本 (相对)
        </text>
        <rect x={chart2X} y={chartY} width={chart2W} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        {data.map((d, i) => {
          const x = chart2X + (i / (data.length - 1)) * chart2W;
          const barH = (d.cost / 64) * (chartH - 20);
          const isCurrent = d.n === n;
          return (
            <g key={i}>
              <rect x={x - 12} y={chartY + chartH - barH - 5} width={24} height={barH}
                rx={3} fill={isCurrent ? COLORS.red : COLORS.orange} opacity={isCurrent ? 1 : 0.4} />
              <text x={x} y={chartY + chartH + 12} textAnchor="middle" fontSize={8} fill={COLORS.dark} fontFamily={FONTS.mono}>
                {d.n}
              </text>
              <text x={x} y={chartY + chartH - barH - 10} textAnchor="middle" fontSize={8} fontWeight={600}
                fill={isCurrent ? COLORS.red : COLORS.mid} fontFamily={FONTS.mono}>
                {d.cost}x
              </text>
            </g>
          );
        })}

        {/* Current stats */}
        <rect x={40} y={H - 62} width={500} height={48} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 42} fontSize={11} fontWeight={600} fill={COLORS.orange}>
          N={n}: 正确率 {(currentData.accuracy * 100).toFixed(1)}% | 成本 {currentData.cost}x
        </text>
        <text x={50} y={H - 24} fontSize={10} fill={COLORS.mid}>
          {n <= 2 ? '提升有限，样本太少' :
           n <= 16 ? '性价比较好，准确率显著提升而成本可控' :
           'N 继续增大收益递减，但成本线性增长 — 需要 compute-optimal 策略'}
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/interactive/BestOfNSimulator.tsx
git commit -m "feat(rl): add BestOfNSimulator component"
```

### Sub-step C: MCTSReasoningTree

- [ ] **Step 5: Create component**

```tsx
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

const NODES: TreeNode[] = [
  { id: 'root', text: '问题: 12×15=?', x: W / 2, y: 50, score: 0.5, children: ['a1', 'a2', 'a3'] },
  { id: 'a1', text: '10×15=150', x: 120, y: 130, score: 0.7, children: ['b1', 'b2'], selected: true },
  { id: 'a2', text: '12×10=120', x: 290, y: 130, score: 0.6, children: ['b3'] },
  { id: 'a3', text: '12×20=240', x: 460, y: 130, score: 0.2 },
  { id: 'b1', text: '2×15=30', x: 80, y: 210, score: 0.85, children: ['c1'], selected: true },
  { id: 'b2', text: '3×15=45', x: 200, y: 210, score: 0.3 },
  { id: 'b3', text: '12×5=60', x: 340, y: 210, score: 0.65, children: ['c2'] },
  { id: 'c1', text: '150+30=180 ✓', x: 80, y: 290, score: 0.95, selected: true },
  { id: 'c2', text: '120+60=180 ✓', x: 340, y: 290, score: 0.9 },
];

type Phase = 'select' | 'expand' | 'evaluate' | 'backprop';

const PHASES: { id: Phase; label: string; desc: string }[] = [
  { id: 'select', label: 'Select', desc: '从根节点开始，选择 UCB 值最高的子节点向下走' },
  { id: 'expand', label: 'Expand', desc: '到达叶节点后，展开新的推理步骤（子节点）' },
  { id: 'evaluate', label: 'Evaluate', desc: '用 PRM/Verifier 对新节点打分' },
  { id: 'backprop', label: 'Backpropagate', desc: '将评估分数回传到父节点，更新路径上所有节点的统计' },
];

export default function MCTSReasoningTree() {
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
          MCTS + LLM 推理树搜索
        </text>

        {/* Edges */}
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

        {/* Backprop arrows */}
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

        {/* Nodes */}
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
              {/* Score badge */}
              <circle cx={node.x + 48} cy={node.y - 8} r={10} fill={color} stroke="#fff" strokeWidth={1} />
              <text x={node.x + 48} y={node.y - 4} textAnchor="middle" fontSize={7} fontWeight={700} fill="#fff">
                {node.score.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Phase controls */}
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

        {/* Phase description */}
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
```

- [ ] **Step 6: Commit**

```bash
git add src/components/interactive/MCTSReasoningTree.tsx
git commit -m "feat(rl): add MCTSReasoningTree component"
```

### Sub-step D: DeepSeekR1Pipeline (StepNavigator)

- [ ] **Step 7: Create component**

```tsx
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function DeepSeekR1Pipeline() {
  const steps = [
    {
      title: '冷启动数据',
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 1: 少量高质量 CoT 数据冷启动
          </text>
          <rect x={30} y={40} width={520} height={40} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={40} y={58} fontSize={10} fontWeight={600} fill={COLORS.primary}>冷启动数据：</text>
          <text x={40} y={72} fontSize={10} fill={COLORS.mid}>
            少量 (prompt, long CoT answer) 对 → 教模型"思考的格式"（用 {'<think>'} 标签包裹推理过程）
          </text>
          <rect x={30} y={95} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={115} fontSize={10} fill={COLORS.dark}>
            目的：不是教模型"如何正确推理"，而是教模型"输出推理过程的格式"
          </text>
          <text x={40} y={133} fontSize={10} fill={COLORS.mid}>
            实际的推理能力来自下一步的 RL 训练
          </text>
        </svg>
      ),
    },
    {
      title: 'GRPO 训练 (R1-Zero)',
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 2: GRPO + 规则 Reward → 涌现 Thinking
          </text>
          <rect x={30} y={40} width={250} height={60} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={155} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>GRPO 训练</text>
          <text x={155} y={76} textAnchor="middle" fontSize={9} fill={COLORS.mid}>组采样 + 相对 Advantage</text>
          <text x={155} y={92} textAnchor="middle" fontSize={9} fill={COLORS.mid}>Reward = 答案正确性（规则判断）</text>

          <text x={295} y={70} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={310} y={40} width={240} height={60} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={430} y={58} textAnchor="middle" fontSize={10} fontWeight={700} fill={COLORS.green}>R1-Zero</text>
          <text x={430} y={76} textAnchor="middle" fontSize={9} fill={COLORS.mid}>涌现行为：自我验证、回溯</text>
          <text x={430} y={92} textAnchor="middle" fontSize={9} fill={COLORS.mid}>分步推理、反思重试</text>

          <rect x={30} y={110} width={520} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={40} y={128} fontSize={10} fontWeight={600} fill={COLORS.red}>关键发现：</text>
          <text x={40} y={144} fontSize={10} fill={COLORS.dark}>
            没有人教模型"如何思考"，只给了正确性 reward → 模型自发涌现了复杂的推理策略！
          </text>
        </svg>
      ),
    },
    {
      title: 'Rejection Sampling + SFT',
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 3: 收集高质量 CoT → SFT 蒸馏
          </text>
          <rect x={30} y={40} width={160} height={45} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={110} y={66} textAnchor="middle" fontSize={10} fill={COLORS.dark}>R1-Zero 生成</text>

          <text x={200} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={210} y={40} width={130} height={45} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={275} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>Rejection</text>
          <text x={275} y={74} textAnchor="middle" fontSize={10} fill={COLORS.orange}>Sampling</text>

          <text x={350} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={360} y={40} width={190} height={45} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={455} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>高质量 CoT 数据</text>
          <text x={455} y={74} textAnchor="middle" fontSize={9} fill={COLORS.mid}>只保留答案正确的 trajectory</text>

          <rect x={30} y={100} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.dark}>蒸馏过程：</text>
          <text x={40} y={136} fontSize={10} fill={COLORS.mid}>
            用 R1-Zero 的高质量 CoT 数据对更小的模型做 SFT → 让小模型也具备 thinking 能力
          </text>
        </svg>
      ),
    },
    {
      title: '最终 RL 精调 (R1)',
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 4: 最终 RL 精调 → DeepSeek-R1
          </text>
          <rect x={30} y={40} width={160} height={45} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={110} y={66} textAnchor="middle" fontSize={10} fill={COLORS.dark}>SFT 后的模型</text>

          <text x={200} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={210} y={40} width={130} height={45} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={275} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>GRPO</text>
          <text x={275} y={74} textAnchor="middle" fontSize={9} fill={COLORS.mid}>+ 多类型 reward</text>

          <text x={350} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={360} y={40} width={190} height={45} rx={6} fill={COLORS.purple} stroke={COLORS.purple} strokeWidth={1.5} />
          <text x={455} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">DeepSeek-R1</text>
          <text x={455} y={74} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.8)">数学/代码 SOTA</text>

          <rect x={30} y={100} width={520} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.purple}>完整 Pipeline：</text>
          <text x={40} y={136} fontSize={10} fill={COLORS.dark}>
            冷启动 → GRPO (涌现 thinking) → Rejection Sampling → SFT 蒸馏 → GRPO 精调 → R1
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/interactive/DeepSeekR1Pipeline.tsx
git commit -m "feat(rl): add DeepSeekR1Pipeline StepNavigator component"
```

### Sub-step E: EmergentThinking

- [ ] **Step 9: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface ThinkingStep {
  type: 'think' | 'verify' | 'backtrack' | 'answer';
  text: string;
  label: string;
}

const WITH_RL: ThinkingStep[] = [
  { type: 'think', text: '让我分析这道题: 48÷6+2×3', label: '分步推理' },
  { type: 'think', text: '先做除法: 48÷6 = 8', label: '运算优先级' },
  { type: 'think', text: '再做乘法: 2×3 = 6', label: '分步计算' },
  { type: 'verify', text: '等一下，让我验证: 8和6，最后加起来...', label: '自我验证' },
  { type: 'think', text: '8 + 6 = 14', label: '汇总结果' },
  { type: 'verify', text: '检查: 48÷6=8 ✓, 2×3=6 ✓, 8+6=14 ✓', label: '最终验证' },
  { type: 'answer', text: '答案是 14', label: '输出答案' },
];

const WITHOUT_RL: ThinkingStep[] = [
  { type: 'think', text: '48÷6+2×3', label: '直接计算' },
  { type: 'think', text: '= 8+2×3', label: '部分计算' },
  { type: 'think', text: '= 10×3', label: '错误！先做了加法' },
  { type: 'answer', text: '= 30', label: '错误答案' },
];

export default function EmergentThinking() {
  const [showRL, setShowRL] = useState(true);
  const steps = showRL ? WITH_RL : WITHOUT_RL;

  const typeColor: Record<string, string> = {
    think: COLORS.primary,
    verify: COLORS.green,
    backtrack: COLORS.orange,
    answer: COLORS.purple,
  };

  const typeIcon: Record<string, string> = {
    think: '💭',
    verify: '✓',
    backtrack: '↩',
    answer: '→',
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          R1-Zero 涌现行为展示
        </text>

        {/* Toggle */}
        <g onClick={() => setShowRL(!showRL)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 100} y={36} width={200} height={26} rx={13}
            fill={showRL ? COLORS.green : COLORS.red} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showRL ? '✓ 有 RL 训练（R1-Zero）' : '✗ 无 RL 训练（基础模型）'}
          </text>
        </g>

        {/* Thinking steps */}
        {steps.map((step, i) => {
          const y = 78 + i * 40;
          const color = typeColor[step.type];
          return (
            <g key={i}>
              {/* Step connector */}
              {i > 0 && (
                <line x1={50} y1={y - 18} x2={50} y2={y - 2} stroke={COLORS.light} strokeWidth={1.5} />
              )}
              {/* Type badge */}
              <circle cx={50} cy={y + 12} r={12} fill={color} opacity={0.15} />
              <text x={50} y={y + 16} textAnchor="middle" fontSize={10} fill={color}>
                {typeIcon[step.type]}
              </text>
              {/* Content */}
              <rect x={70} y={y} width={400} height={30} rx={6}
                fill={step.type === 'answer' ? (showRL ? '#d4edda' : COLORS.waste) : COLORS.bgAlt}
                stroke={color} strokeWidth={1} />
              <text x={80} y={y + 18} fontSize={10} fill={COLORS.dark}>
                {step.text}
              </text>
              {/* Label */}
              <rect x={480} y={y + 2} width={80} height={22} rx={4} fill={color} opacity={0.15} />
              <text x={520} y={y + 17} textAnchor="middle" fontSize={8} fontWeight={600} fill={color}>
                {step.label}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <rect x={30} y={H - 60} width={520} height={48} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={40} y={H - 42} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {showRL ? '涌现行为：' : '无 RL 的问题：'}
        </text>
        <text x={40} y={H - 24} fontSize={10} fill={COLORS.mid}>
          {showRL
            ? '模型自发学会了分步推理、自我验证、运算优先级 — 没有人显式教过这些行为！'
            : '缺乏深度推理能力，容易犯运算优先级等基础错误，无法自我检查和纠正'}
        </text>
        {/* Behavior type legend */}
        {showRL && (
          <g>
            {[
              { type: 'think', label: '推理', x: 220 },
              { type: 'verify', label: '验证', x: 300 },
              { type: 'answer', label: '答案', x: 380 },
            ].map(item => (
              <g key={item.type}>
                <circle cx={item.x} cy={H - 42} r={5} fill={typeColor[item.type]} opacity={0.5} />
                <text x={item.x + 10} y={H - 38} fontSize={9} fill={COLORS.dark}>{item.label}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add src/components/interactive/EmergentThinking.tsx
git commit -m "feat(rl): add EmergentThinking component"
```

### Sub-step F: ComputeOptimalInference

- [ ] **Step 11: Create component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Problem {
  difficulty: number;
  strategy: string;
  compute: number;
  color: string;
}

export default function ComputeOptimalInference() {
  const [hovered, setHovered] = useState<number | null>(null);

  const problems: Problem[] = [
    { difficulty: 0.1, strategy: '直接回答', compute: 1, color: COLORS.green },
    { difficulty: 0.2, strategy: '直接回答', compute: 1, color: COLORS.green },
    { difficulty: 0.35, strategy: 'CoT', compute: 3, color: COLORS.primary },
    { difficulty: 0.45, strategy: 'CoT', compute: 4, color: COLORS.primary },
    { difficulty: 0.55, strategy: 'CoT', compute: 5, color: COLORS.primary },
    { difficulty: 0.65, strategy: 'Best-of-4', compute: 8, color: COLORS.orange },
    { difficulty: 0.72, strategy: 'Best-of-8', compute: 16, color: COLORS.orange },
    { difficulty: 0.8, strategy: 'Best-of-16', compute: 24, color: COLORS.orange },
    { difficulty: 0.88, strategy: 'MCTS', compute: 40, color: COLORS.red },
    { difficulty: 0.95, strategy: 'MCTS deep', compute: 60, color: COLORS.red },
  ];

  const chartX = 60, chartY = 60, chartW = 460, chartH = 220;
  const maxCompute = Math.max(...problems.map(p => p.compute));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Compute-Optimal Inference
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          简单问题少想，难问题多想 — 动态分配推理计算
        </text>

        {/* Chart */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {/* Scatter points */}
        {problems.map((p, i) => {
          const x = chartX + p.difficulty * chartW;
          const y = chartY + chartH - (p.compute / maxCompute) * (chartH - 20);
          const isHov = hovered === i;
          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>
              <circle cx={x} cy={y} r={isHov ? 10 : 7} fill={p.color} opacity={0.8}
                stroke={isHov ? COLORS.dark : 'none'} strokeWidth={2} />
              {isHov && (
                <g>
                  <rect x={x + 12} y={y - 24} width={120} height={40} rx={4}
                    fill="rgba(255,255,255,0.95)" stroke={COLORS.mid} strokeWidth={0.5} />
                  <text x={x + 18} y={y - 8} fontSize={9} fontWeight={600} fill={p.color}>
                    {p.strategy}
                  </text>
                  <text x={x + 18} y={y + 6} fontSize={9} fill={COLORS.mid} fontFamily={FONTS.mono}>
                    计算量: {p.compute}x | 难度: {(p.difficulty * 100).toFixed(0)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Trend line */}
        <path d={`M ${chartX + problems[0].difficulty * chartW},${chartY + chartH - (problems[0].compute / maxCompute) * (chartH - 20)}
          Q ${chartX + 0.5 * chartW},${chartY + chartH - (10 / maxCompute) * (chartH - 20)}
          ${chartX + problems[problems.length - 1].difficulty * chartW},${chartY + chartH - (problems[problems.length - 1].compute / maxCompute) * (chartH - 20)}`}
          fill="none" stroke={COLORS.mid} strokeWidth={1} strokeDasharray="6 3" />

        {/* Axes */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 16} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          问题难度 →
        </text>
        <text x={chartX - 8} y={chartY + chartH / 2} textAnchor="middle" fontSize={10} fill={COLORS.mid}
          transform={`rotate(-90, ${chartX - 8}, ${chartY + chartH / 2})`}>
          推理计算量 →
        </text>

        {/* Strategy legend */}
        {[
          { color: COLORS.green, label: '直接回答 (1x)' },
          { color: COLORS.primary, label: 'CoT (3-5x)' },
          { color: COLORS.orange, label: 'Best-of-N (8-24x)' },
          { color: COLORS.red, label: 'MCTS (40-60x)' },
        ].map((item, i) => (
          <g key={i}>
            <circle cx={chartX + 10 + i * 125} cy={chartY + chartH + 32} r={5} fill={item.color} />
            <text x={chartX + 20 + i * 125} y={chartY + chartH + 36} fontSize={9} fill={COLORS.dark}>
              {item.label}
            </text>
          </g>
        ))}

        {/* Insight */}
        <rect x={40} y={H - 48} width={500} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 28} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          核心思想：根据问题难度动态选择策略 — "2+2=?" 不需要 MCTS，但 AMC 竞赛题值得深度搜索
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 12: Commit**

```bash
git add src/components/interactive/ComputeOptimalInference.tsx
git commit -m "feat(rl): add ComputeOptimalInference component"
```

---

## Task 45: Article 7 MDX — test-time-scaling

**Files:**
- Create: `src/content/articles/zh/test-time-scaling.mdx`

- [ ] **Step 1: Create article MDX**

```mdx
---
title: "Test-Time Scaling 与思维强化"
slug: test-time-scaling
locale: zh
tags: [test-time-scaling, chain-of-thought, mcts, deepseek-r1, thinking, verifier]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [reward-modeling]
references:
  - type: paper
    title: "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters (Snell et al., 2024)"
    url: "https://arxiv.org/abs/2408.03314"
  - type: paper
    title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning (2025)"
    url: "https://arxiv.org/abs/2501.12948"
  - type: paper
    title: "Let's Verify Step by Step (Lightman et al., 2023)"
    url: "https://arxiv.org/abs/2305.20050"
  - type: paper
    title: "AlphaZero-like Tree-Search can Guide Large Language Model Decoding and Training (Feng et al., 2024)"
    url: "https://arxiv.org/abs/2309.17179"
  - type: course
    title: "Hugging Face Deep RL Course"
    url: "https://huggingface.co/learn/deep-rl-course"
  - type: blog
    title: "Deep Reinforcement Learning: Pong from Pixels — Andrej Karpathy"
    url: "https://karpathy.github.io/2016/05/31/rl/"
---

import ScalingParadigmCompare from '../../../components/interactive/ScalingParadigmCompare.tsx';
import BestOfNSimulator from '../../../components/interactive/BestOfNSimulator.tsx';
import MCTSReasoningTree from '../../../components/interactive/MCTSReasoningTree.tsx';
import DeepSeekR1Pipeline from '../../../components/interactive/DeepSeekR1Pipeline.tsx';
import EmergentThinking from '../../../components/interactive/EmergentThinking.tsx';
import ComputeOptimalInference from '../../../components/interactive/ComputeOptimalInference.tsx';

## Train-Time vs Test-Time Scaling

传统的 scaling law 关注 **train-time scaling**：增大模型参数量、增加训练数据和计算量，性能稳步提升。但这条曲线正在趋缓——从 100B 到 1T 参数的收益越来越小。

**Test-Time Scaling** 提出了一个不同的思路：**固定模型大小，在推理时投入更多计算来提升输出质量**。

<ScalingParadigmCompare client:visible />

Snell et al. (2024) 的关键发现：在某些任务上，**增加推理时计算比增大模型更 cost-effective**。一个 14B 模型配合足够的 test-time compute，可以超过 70B 模型的直接输出。

## Chain-of-Thought 的 RL 视角

Chain-of-Thought (CoT) 不仅仅是一个 prompting 技巧。从 RL 的角度看：

- 每一步推理 = 一个 **action**
- 思维链 = 一条 **trajectory**
- 最终答案的正确性 = **reward**

这意味着我们可以用 RL 来优化**模型如何思考**——不只是优化最终答案，而是优化整个推理过程。这就是 DeepSeek-R1 的核心思路。

## Best-of-N 与 Rejection Sampling

最简单的 test-time scaling 方法：生成 N 个回答，用 verifier 选最好的。

<BestOfNSimulator client:visible />

Best-of-N 的优势是简单直接，但计算成本与 N 线性增长。对于简单问题，N=1 就够了；对于困难问题，可能需要 N=64 甚至更多。关键是需要一个好的 verifier 来选择最佳答案。

## MCTS + LLM

更高级的 test-time scaling 方法是将推理过程建模为**树搜索**。借鉴 AlphaGo/AlphaZero 的思路：

- 每个节点代表一个推理步骤
- 用 PRM（Process Reward Model）评估每个节点的"价值"
- MCTS 策略决定**探索哪些推理路径**

<MCTSReasoningTree client:visible />

MCTS 的四步循环：
1. **Select**：从根节点出发，用 UCB 公式选择最有潜力的路径
2. **Expand**：在叶节点展开新的推理步骤
3. **Evaluate**：用 PRM 评估新步骤的质量
4. **Backpropagate**：将评估结果回传更新整条路径

这种方法比 Best-of-N 更高效，因为它不是独立采样 N 条路径，而是**智能地探索和剪枝**。

## DeepSeek-R1 式 Thinking

DeepSeek-R1 展示了一种更深刻的 test-time scaling：**用 RL 训练模型学会"思考"**。

<DeepSeekR1Pipeline client:visible />

关键发现：当给模型一个简单的 reward 信号（答案正确性）并用 GRPO 训练时，模型自发涌现了一系列复杂的推理行为：

<EmergentThinking client:visible />

这些涌现行为包括：
- **分步推理**：自动将复杂问题分解为子步骤
- **自我验证**：主动检查自己的计算结果
- **回溯纠错**：发现错误后回退重新推理
- **策略选择**：尝试不同方法解决同一个问题

没有人显式地教模型这些行为——它们完全是从"答案对不对"这个简单信号中涌现出来的。

## Compute-Optimal Inference

并非所有问题都需要大量推理计算。**"2+2=?"** 不需要 MCTS 搜索，但 **IMO 竞赛题** 值得投入大量搜索。

<ComputeOptimalInference client:visible />

Compute-Optimal 的核心思想是**根据问题难度动态分配推理预算**：
- **简单问题**：直接回答（1x 计算）
- **中等问题**：CoT 推理（3-5x 计算）
- **困难问题**：Best-of-N + Verifier（8-24x 计算）
- **极难问题**：MCTS 深度搜索（40-60x 计算）

自动判断问题难度并选择合适策略，是 test-time scaling 走向实用的关键。

## 总结

本文介绍了 test-time scaling 的核心思想和方法：

1. **Test-Time Scaling** 是与 train-time scaling 互补的新范式
2. **Best-of-N** 是最简单的方法，用 verifier 从多个候选中选最优
3. **MCTS** 将推理过程建模为树搜索，智能探索推理路径
4. **DeepSeek-R1** 用 GRPO 训练出涌现 thinking 行为，是 test-time scaling 的巅峰体现
5. **Compute-Optimal** 策略根据问题难度动态分配推理计算

从 MDP 基础到 test-time scaling，我们走完了 RL 在 LLM 领域的完整链条。RL 不仅让 LLM 学会"做正确的事"（对齐），更让它学会"如何思考"（reasoning）——这或许是通向更强 AI 的关键路径。
```

- [ ] **Step 2: Validate**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/articles/zh/test-time-scaling.mdx
git commit -m "feat(rl): add test-time-scaling article with 6 components"
```

---

## Task 46: Update TODO.md

**Files:**
- Modify: `docs/TODO.md`

- [ ] **Step 1: Mark RL topic as completed**

Change:
```
- [ ] Reinforcement Learning (RLHF/GRPO/PPO) 专题 (来源: 2026-04-05)
```
to:
```
- [x] Reinforcement Learning (RLHF/GRPO/PPO) 专题 (来源: 2026-04-05) — 完成: reinforcement-learning 路径 (7 篇文章, 41 组件)
```

- [ ] **Step 2: Commit**

```bash
git add docs/TODO.md
git commit -m "docs: mark RL learning path as completed in TODO"
```

---

## Task 47: Final Validation

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: All pages built successfully, no errors

- [ ] **Step 2: Run validate**

Run: `npm run validate`
Expected: PASS

---

## Task 48: Git Push

- [ ] **Step 1: Push to remote**

```bash
git push origin main
```
Expected: Success (if network allows)
