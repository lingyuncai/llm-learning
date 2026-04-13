# RL-for-LLM Bridge Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a bridge article "当 RL 遇上 LLM：从语言生成到策略优化" with 4 interactive components, positioned between ppo-actor-critic and rlhf in the RL learning path.

**Architecture:** New MDX article at `src/content/articles/zh/rl-for-llm.mdx` with 5 sections (SFT limitations → MDP mapping → RL toolbox translation → LLM RL challenges → post-training landscape). Four React interactive components in `src/components/interactive/`. Minor edits to `rl-foundations.mdx`, `ppo-actor-critic.mdx`, and `reinforcement-learning.yaml`.

**Tech Stack:** Astro + MDX, React (useState), SVG-based interactive components, shared color system (`COLORS`/`FONTS` from `./shared/colors`), KaTeX for math.

**Spec:** `docs/superpowers/specs/2026-04-13-rl-for-llm-bridge-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/components/interactive/SFTvsRLComparison.tsx` | §1: SFT vs RL learning process side-by-side animation |
| Create | `src/components/interactive/LLMasMDP.tsx` | §2: Token-by-token MDP walkthrough with probability bars |
| Create | `src/components/interactive/TokenRewardAssignment.tsx` | §4: Sparse vs dense reward credit assignment visualization |
| Create | `src/components/interactive/PostTrainingPipeline.tsx` | §5: Expandable post-training pipeline overview |
| Create | `src/content/articles/zh/rl-for-llm.mdx` | The bridge article itself |
| Modify | `src/content/paths/reinforcement-learning.yaml` | Insert rl-for-llm into learning path |
| Modify | `src/content/articles/zh/rl-foundations.mdx:70-71` | Add LLM anchor paragraph after MDP section |
| Modify | `src/content/articles/zh/ppo-actor-critic.mdx:96-111` | Add forward reference to bridge article |

---

### Task 1: SFTvsRLComparison Component

**Files:**
- Create: `src/components/interactive/SFTvsRLComparison.tsx`

This component shows a side-by-side comparison of SFT (behavioral cloning) vs RL learning processes using a simplified text-generation scenario. Left panel: SFT follows a demo trajectory but collapses when it deviates. Right panel: RL explores, gets reward feedback, and learns to recover.

- [ ] **Step 1: Create the SFTvsRLComparison component**

```tsx
// src/components/interactive/SFTvsRLComparison.tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 480;

// Simulated token generation sequences
// SFT side: follows demo perfectly until it deviates, then cascading errors
// RL side: explores, gets reward, improves over rounds

interface TokenStep {
  token: string;
  prob: number; // model confidence
  status: 'correct' | 'wrong' | 'explored' | 'improved';
}

const PROMPT = '请解释量子纠缠';

const SFT_DEMO: TokenStep[] = [
  { token: '量子', prob: 0.92, status: 'correct' },
  { token: '纠缠', prob: 0.88, status: 'correct' },
  { token: '是', prob: 0.85, status: 'correct' },
  { token: '一个', prob: 0.45, status: 'wrong' },   // deviation begins
  { token: '复杂', prob: 0.22, status: 'wrong' },   // compounding error
  { token: '...', prob: 0.10, status: 'wrong' },     // collapse
];

const RL_ROUNDS: { round: string; tokens: TokenStep[] }[] = [
  {
    round: 'Round 1',
    tokens: [
      { token: '量子', prob: 0.60, status: 'explored' },
      { token: '力学', prob: 0.35, status: 'explored' },
      { token: '中', prob: 0.30, status: 'explored' },
    ],
  },
  {
    round: 'Round 2',
    tokens: [
      { token: '量子', prob: 0.78, status: 'improved' },
      { token: '纠缠', prob: 0.65, status: 'improved' },
      { token: '是指', prob: 0.55, status: 'improved' },
    ],
  },
  {
    round: 'Round 3',
    tokens: [
      { token: '量子', prob: 0.91, status: 'improved' },
      { token: '纠缠', prob: 0.87, status: 'improved' },
      { token: '描述', prob: 0.80, status: 'improved' },
    ],
  },
];

const statusColor = (s: TokenStep['status']) => {
  switch (s) {
    case 'correct': return COLORS.green;
    case 'wrong': return COLORS.red;
    case 'explored': return COLORS.orange;
    case 'improved': return COLORS.green;
  }
};

export default function SFTvsRLComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = locale === 'zh' ? {
    title: 'SFT vs RL：两种学习方式的对比',
    sftTitle: 'SFT (Behavioral Cloning)',
    rlTitle: 'RL (Policy Optimization)',
    prompt: '提示词',
    sftProblem: '偏离示范后错误累积 (Distribution Shift)',
    rlAdvantage: '从自己的生成中学习，持续改进',
    collapse: '→ 模型崩溃：进入训练中未见过的状态',
    selfImprove: '→ 自我进化：每轮数据由当前策略生成',
    clickToAnimate: '点击播放动画',
    sftPhase: '训练时只看示范',
    rlPhase: '从 reward 中学习',
  } : {
    title: 'SFT vs RL: Two Learning Paradigms',
    sftTitle: 'SFT (Behavioral Cloning)',
    rlTitle: 'RL (Policy Optimization)',
    prompt: 'Prompt',
    sftProblem: 'Errors compound after deviation (Distribution Shift)',
    rlAdvantage: 'Learns from own generations, improves continuously',
    collapse: '→ Model collapse: enters unseen states',
    selfImprove: '→ Self-improvement: data generated by current policy',
    clickToAnimate: 'Click to animate',
    sftPhase: 'Trained on demos only',
    rlPhase: 'Learns from reward',
  };

  const [sftStep, setSftStep] = useState(0);
  const [rlRound, setRlRound] = useState(0);
  const [animating, setAnimating] = useState(false);

  const animate = () => {
    if (animating) return;
    setAnimating(true);
    setSftStep(0);
    setRlRound(0);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step <= SFT_DEMO.length) setSftStep(step);
      if (step === 2) setRlRound(1);
      if (step === 4) setRlRound(2);
      if (step === 6) setRlRound(3);
      if (step > 6) { clearInterval(timer); setAnimating(false); }
    }, 500);
  };

  const leftX = 20, rightX = W / 2 + 10, panelW = W / 2 - 30;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        {/* Divider */}
        <line x1={W / 2} y1={36} x2={W / 2} y2={H - 50}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,4" />

        {/* === SFT Panel === */}
        <text x={leftX + panelW / 2} y={50} textAnchor="middle" fontSize={13}
          fontWeight={700} fill={COLORS.primary}>{t.sftTitle}</text>
        <text x={leftX + panelW / 2} y={68} textAnchor="middle" fontSize={10}
          fill={COLORS.mid}>{t.sftPhase}</text>
        <rect x={leftX + 10} y={80} width={panelW - 20} height={24} rx={4}
          fill={COLORS.highlight} />
        <text x={leftX + 20} y={96} fontSize={10} fill={COLORS.dark}>
          {t.prompt}: {PROMPT}
        </text>
        {/* SFT tokens with confidence bars */}
        {SFT_DEMO.slice(0, sftStep).map((tk, i) => {
          const y = 120 + i * 36;
          const barW = tk.prob * (panelW - 100);
          return (
            <g key={`sft-${i}`}>
              <text x={leftX + 15} y={y + 14} fontSize={10} fill={COLORS.dark}>
                {i + 1}. "{tk.token}"
              </text>
              <rect x={leftX + 100} y={y + 2} width={barW} height={16} rx={3}
                fill={statusColor(tk.status)} opacity={0.7} />
              <text x={leftX + 105 + barW} y={y + 14} fontSize={9} fill={COLORS.mid}>
                {(tk.prob * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        {sftStep >= SFT_DEMO.length && (
          <g>
            <rect x={leftX + 10} y={340} width={panelW - 20} height={28} rx={6}
              fill={COLORS.waste} />
            <text x={leftX + panelW / 2} y={358} textAnchor="middle" fontSize={10}
              fontWeight={600} fill={COLORS.red}>{t.collapse}</text>
            <text x={leftX + panelW / 2} y={385} textAnchor="middle" fontSize={10}
              fontWeight={600} fill={COLORS.red}>{t.sftProblem}</text>
          </g>
        )}

        {/* === RL Panel === */}
        <text x={rightX + panelW / 2} y={50} textAnchor="middle" fontSize={13}
          fontWeight={700} fill={COLORS.green}>{t.rlTitle}</text>
        <text x={rightX + panelW / 2} y={68} textAnchor="middle" fontSize={10}
          fill={COLORS.mid}>{t.rlPhase}</text>
        <rect x={rightX + 10} y={80} width={panelW - 20} height={24} rx={4}
          fill={COLORS.highlight} />
        <text x={rightX + 20} y={96} fontSize={10} fill={COLORS.dark}>
          {t.prompt}: {PROMPT}
        </text>
        {/* RL rounds with improving confidence */}
        {RL_ROUNDS.slice(0, rlRound).map((round, ri) => {
          const baseY = 115 + ri * 80;
          return (
            <g key={`rl-${ri}`}>
              <text x={rightX + 15} y={baseY + 10} fontSize={10} fontWeight={600}
                fill={ri === rlRound - 1 ? COLORS.green : COLORS.mid}>
                {round.round} → R={( 0.3 + ri * 0.3).toFixed(1)}
              </text>
              {round.tokens.map((tk, ti) => {
                const y = baseY + 16 + ti * 20;
                const barW = tk.prob * (panelW - 130);
                return (
                  <g key={`rl-${ri}-${ti}`}>
                    <text x={rightX + 20} y={y + 12} fontSize={9} fill={COLORS.dark}>
                      "{tk.token}"
                    </text>
                    <rect x={rightX + 80} y={y} width={barW} height={14} rx={3}
                      fill={statusColor(tk.status)} opacity={0.7} />
                    <text x={rightX + 85 + barW} y={y + 11} fontSize={9} fill={COLORS.mid}>
                      {(tk.prob * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
        {rlRound >= 3 && (
          <g>
            <rect x={rightX + 10} y={340} width={panelW - 20} height={28} rx={6}
              fill={COLORS.valid} />
            <text x={rightX + panelW / 2} y={358} textAnchor="middle" fontSize={10}
              fontWeight={600} fill={COLORS.green}>{t.selfImprove}</text>
            <text x={rightX + panelW / 2} y={385} textAnchor="middle" fontSize={10}
              fontWeight={600} fill={COLORS.green}>{t.rlAdvantage}</text>
          </g>
        )}

        {/* Animate button */}
        <g onClick={animate} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 60} y={H - 40} width={120} height={28} rx={14}
            fill={animating ? COLORS.mid : COLORS.primary} />
          <text x={W / 2} y={H - 22} textAnchor="middle" fontSize={11}
            fontWeight={600} fill="#fff">
            {animating ? '...' : t.clickToAnimate}
          </text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders**

Run: `npm run dev`
Open browser and temporarily import the component in an existing article to verify the SVG renders. Check: two panels, animate button plays the sequence, SFT side shows red collapse, RL side shows green improvement.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/SFTvsRLComparison.tsx
git commit -m "feat(rl-for-llm): add SFTvsRLComparison interactive component"
```

### Task 2: LLMasMDP Component

**Files:**
- Create: `src/components/interactive/LLMasMDP.tsx`

This component demonstrates LLM text generation as an MDP. Given a prompt, it steps through token generation showing: current state (prompt + generated tokens), probability distribution over vocabulary, action selection, and state transition. Users click "Next Step" to advance.

- [ ] **Step 1: Create the LLMasMDP component**

```tsx
// src/components/interactive/LLMasMDP.tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 500;

interface GenerationStep {
  state: string;        // current text so far
  topTokens: { token: string; prob: number }[];  // top-5 token probabilities
  chosen: number;       // index of chosen token
  reward: number | null; // null for intermediate steps, number for final
}

const STEPS: GenerationStep[] = [
  {
    state: '中国的首都是',
    topTokens: [
      { token: '北', prob: 0.82 },
      { token: '上', prob: 0.05 },
      { token: '南', prob: 0.03 },
      { token: '天', prob: 0.02 },
      { token: '...', prob: 0.08 },
    ],
    chosen: 0,
    reward: null,
  },
  {
    state: '中国的首都是北',
    topTokens: [
      { token: '京', prob: 0.97 },
      { token: '方', prob: 0.01 },
      { token: '部', prob: 0.005 },
      { token: '边', prob: 0.003 },
      { token: '...', prob: 0.012 },
    ],
    chosen: 0,
    reward: null,
  },
  {
    state: '中国的首都是北京',
    topTokens: [
      { token: '。', prob: 0.70 },
      { token: '，', prob: 0.15 },
      { token: '市', prob: 0.08 },
      { token: '<EOS>', prob: 0.04 },
      { token: '...', prob: 0.03 },
    ],
    chosen: 0,
    reward: null,
  },
  {
    state: '中国的首都是北京。',
    topTokens: [
      { token: '<EOS>', prob: 0.90 },
      { token: '它', prob: 0.05 },
      { token: '北京', prob: 0.02 },
      { token: '作为', prob: 0.01 },
      { token: '...', prob: 0.02 },
    ],
    chosen: 0,
    reward: 0.92,
  },
];

export default function LLMasMDP({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = locale === 'zh' ? {
    title: 'LLM 生成 = MDP 决策过程',
    subtitle: '逐 token 展示 State → Action → Transition → Reward',
    stateLabel: '状态 sₜ',
    actionLabel: '动作 aₜ',
    probLabel: 'π_θ(a|s) 概率分布',
    transitionLabel: '转移',
    rewardLabel: '奖励',
    rewardNone: 'r = 0（中间步骤无任务奖励）',
    rewardFinal: 'R = {val}（回答完成，RM 评分）',
    nextStep: '下一步 →',
    reset: '重置',
    stepOf: '步骤',
    episodeEnd: 'Episode 结束 — 生成 <EOS>',
    prompt: '提示词 (初始状态 s₀)',
    chosenToken: '选中',
  } : {
    title: 'LLM Generation = MDP Decision Process',
    subtitle: 'Token-by-token: State → Action → Transition → Reward',
    stateLabel: 'State sₜ',
    actionLabel: 'Action aₜ',
    probLabel: 'π_θ(a|s) distribution',
    transitionLabel: 'Transition',
    rewardLabel: 'Reward',
    rewardNone: 'r = 0 (no task reward for intermediate steps)',
    rewardFinal: 'R = {val} (response complete, RM score)',
    nextStep: 'Next Step →',
    reset: 'Reset',
    stepOf: 'Step',
    episodeEnd: 'Episode ends — generated <EOS>',
    prompt: 'Prompt (initial state s₀)',
    chosenToken: 'chosen',
  };

  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const barX = 40, barMaxW = 300;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize={15} fontWeight={700}
          fill={COLORS.dark}>{t.title}</text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize={11}
          fill={COLORS.mid}>{t.subtitle}</text>

        {/* Step indicator */}
        <text x={W - 30} y={22} textAnchor="end" fontSize={11} fontWeight={600}
          fill={COLORS.primary}>{t.stepOf} {step + 1}/{STEPS.length}</text>

        {/* State box */}
        <text x={barX} y={68} fontSize={12} fontWeight={700} fill={COLORS.primary}>
          {t.stateLabel}
        </text>
        <rect x={barX} y={76} width={W - 80} height={36} rx={6}
          fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1.5} />
        {/* Highlight prompt vs generated */}
        <text x={barX + 12} y={99} fontSize={13} fill={COLORS.dark}
          fontFamily={FONTS.mono}>
          <tspan fill={COLORS.mid}>{'中国的首都是'}</tspan>
          <tspan fill={COLORS.primary} fontWeight={700}>
            {current.state.slice('中国的首都是'.length)}
          </tspan>
        </text>
        {step === 0 && (
          <text x={barX + 12} y={126} fontSize={9} fill={COLORS.mid}>
            ↑ {t.prompt}
          </text>
        )}

        {/* Probability distribution */}
        <text x={barX} y={148} fontSize={12} fontWeight={700} fill={COLORS.orange}>
          {t.probLabel}
        </text>
        {current.topTokens.map((tk, i) => {
          const y = 160 + i * 30;
          const barW = tk.prob * barMaxW;
          const isChosen = i === current.chosen;
          return (
            <g key={`tok-${i}`}>
              <text x={barX + 5} y={y + 16} fontSize={11} fontWeight={isChosen ? 700 : 400}
                fill={isChosen ? COLORS.dark : COLORS.mid} fontFamily={FONTS.mono}>
                "{tk.token}"
              </text>
              <rect x={barX + 70} y={y + 3} width={barW} height={18} rx={4}
                fill={isChosen ? COLORS.green : COLORS.light}
                stroke={isChosen ? COLORS.green : 'none'} strokeWidth={1} />
              <text x={barX + 75 + barW} y={y + 16} fontSize={10}
                fill={isChosen ? COLORS.green : COLORS.mid}>
                {(tk.prob * 100).toFixed(1)}%
              </text>
              {isChosen && (
                <text x={barX + 75 + barW + 50} y={y + 16} fontSize={9}
                  fontWeight={600} fill={COLORS.green}>
                  ← {t.chosenToken}
                </text>
              )}
            </g>
          );
        })}

        {/* Action label */}
        <text x={barX + 380} y={168} fontSize={12} fontWeight={700} fill={COLORS.green}>
          {t.actionLabel}
        </text>
        <rect x={barX + 380} y={176} width={130} height={30} rx={6}
          fill={COLORS.valid} stroke={COLORS.green} strokeWidth={1.5} />
        <text x={barX + 445} y={196} textAnchor="middle" fontSize={13}
          fontWeight={700} fill={COLORS.green} fontFamily={FONTS.mono}>
          "{current.topTokens[current.chosen].token}"
        </text>

        {/* Reward */}
        <text x={barX} y={330} fontSize={12} fontWeight={700}
          fill={current.reward !== null ? COLORS.green : COLORS.mid}>
          {t.rewardLabel}
        </text>
        <rect x={barX} y={338} width={W - 80} height={28} rx={6}
          fill={current.reward !== null ? COLORS.valid : COLORS.masked}
          stroke={current.reward !== null ? COLORS.green : COLORS.light}
          strokeWidth={1} />
        <text x={barX + 15} y={357} fontSize={11}
          fill={current.reward !== null ? COLORS.green : COLORS.mid}>
          {current.reward !== null
            ? t.rewardFinal.replace('{val}', current.reward.toFixed(2))
            : t.rewardNone}
        </text>

        {/* Episode end banner */}
        {isLast && (
          <g>
            <rect x={barX} y={380} width={W - 80} height={28} rx={6}
              fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
            <text x={W / 2} y={399} textAnchor="middle" fontSize={11}
              fontWeight={600} fill={COLORS.orange}>{t.episodeEnd}</text>
          </g>
        )}

        {/* MDP labels on right side */}
        <g>
          <rect x={barX + 380} y={230} width={130} height={80} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={barX + 445} y={250} textAnchor="middle" fontSize={10}
            fontWeight={600} fill={COLORS.dark}>{t.transitionLabel}</text>
          <text x={barX + 445} y={270} textAnchor="middle" fontSize={9}
            fill={COLORS.mid} fontFamily={FONTS.mono}>
            s' = (s, a)
          </text>
          <text x={barX + 445} y={290} textAnchor="middle" fontSize={9}
            fill={COLORS.mid}>
            确定性拼接
          </text>
        </g>

        {/* Navigation buttons */}
        {!isLast ? (
          <g onClick={() => setStep(s => Math.min(s + 1, STEPS.length - 1))}
            style={{ cursor: 'pointer' }}>
            <rect x={W / 2 - 50} y={H - 45} width={100} height={30} rx={15}
              fill={COLORS.primary} />
            <text x={W / 2} y={H - 26} textAnchor="middle" fontSize={11}
              fontWeight={600} fill="#fff">{t.nextStep}</text>
          </g>
        ) : (
          <g onClick={() => setStep(0)} style={{ cursor: 'pointer' }}>
            <rect x={W / 2 - 40} y={H - 45} width={80} height={30} rx={15}
              fill={COLORS.mid} />
            <text x={W / 2} y={H - 26} textAnchor="middle" fontSize={11}
              fontWeight={600} fill="#fff">{t.reset}</text>
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders**

Run: `npm run dev`
Check: step through all 4 steps. Step 1-3 should show "r = 0" for reward; step 4 should show the RM score and "Episode ends" banner. Probability bars should highlight the chosen token in green.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/LLMasMDP.tsx
git commit -m "feat(rl-for-llm): add LLMasMDP interactive component"
```

### Task 3: TokenRewardAssignment Component

**Files:**
- Create: `src/components/interactive/TokenRewardAssignment.tsx`

Visualizes a response as a token sequence, comparing sparse reward (ORM: only last token gets score) vs dense reward (PRM: every reasoning step gets a score). Users toggle between modes to see how credit assignment differs.

- [ ] **Step 1: Create the TokenRewardAssignment component**

```tsx
// src/components/interactive/TokenRewardAssignment.tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface Token {
  text: string;
  denseReward: number;  // per-step reward for dense mode
  isKeyStep: boolean;   // whether this is a meaningful reasoning step
}

// A math reasoning response: "2+3=5, 5×4=20, so the answer is 20"
const TOKENS: Token[] = [
  { text: '2+3', denseReward: 0.9, isKeyStep: true },
  { text: '=', denseReward: 0.8, isKeyStep: false },
  { text: '5', denseReward: 0.9, isKeyStep: true },
  { text: ',', denseReward: 0.0, isKeyStep: false },
  { text: '5×4', denseReward: 0.85, isKeyStep: true },
  { text: '=', denseReward: 0.8, isKeyStep: false },
  { text: '20', denseReward: 0.95, isKeyStep: true },
  { text: ',', denseReward: 0.0, isKeyStep: false },
  { text: '答案', denseReward: 0.5, isKeyStep: false },
  { text: '是', denseReward: 0.5, isKeyStep: false },
  { text: '20', denseReward: 0.95, isKeyStep: true },
  { text: '。', denseReward: 0.0, isKeyStep: false },
];

const SPARSE_REWARD = 0.92; // single score at end

export default function TokenRewardAssignment({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = locale === 'zh' ? {
    title: 'Credit Assignment：谁该获得奖励？',
    sparse: 'Sparse Reward (ORM)',
    dense: 'Dense Reward (PRM)',
    sparseDesc: '只在最后给一个分数 — 哪个 token 的功劳？',
    denseDesc: '每步都有评分 — 精确定位关键推理步骤',
    tokenLabel: 'Token 序列',
    rewardLabel: '奖励分配',
    creditQuestion: 'Credit Assignment 问题：200 个 token 中，到底是哪些 token 让回答变好/变坏？',
    creditAnswer: 'Dense reward 直接告诉你哪步推理正确，但标注成本高 100 倍',
    prompt: '问题：计算 (2+3)×4',
    clickToToggle: '点击切换模式',
  } : {
    title: 'Credit Assignment: Who Gets the Reward?',
    sparse: 'Sparse Reward (ORM)',
    dense: 'Dense Reward (PRM)',
    sparseDesc: 'Single score at the end — which token deserves credit?',
    denseDesc: 'Score per step — precisely locates key reasoning steps',
    tokenLabel: 'Token sequence',
    rewardLabel: 'Reward assignment',
    creditQuestion: 'Credit assignment: across 200 tokens, which ones actually improved/worsened the answer?',
    creditAnswer: 'Dense reward directly identifies correct reasoning steps, but costs 100x more to annotate',
    prompt: 'Question: Calculate (2+3)×4',
    clickToToggle: 'Click to toggle mode',
  };

  const [mode, setMode] = useState<'sparse' | 'dense'>('sparse');
  const isSparse = mode === 'sparse';

  const tokStartX = 30;
  const tokY = 160;
  const tokW = 42;
  const tokH = 32;
  const barMaxH = 80;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize={15} fontWeight={700}
          fill={COLORS.dark}>{t.title}</text>

        {/* Mode toggle */}
        <g style={{ cursor: 'pointer' }} onClick={() => setMode(m => m === 'sparse' ? 'dense' : 'sparse')}>
          <rect x={W / 2 - 120} y={38} width={115} height={26} rx={13}
            fill={isSparse ? COLORS.primary : COLORS.bgAlt}
            stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={W / 2 - 62} y={55} textAnchor="middle" fontSize={10}
            fontWeight={600} fill={isSparse ? '#fff' : COLORS.primary}>
            {t.sparse}
          </text>
          <rect x={W / 2 + 5} y={38} width={115} height={26} rx={13}
            fill={!isSparse ? COLORS.green : COLORS.bgAlt}
            stroke={COLORS.green} strokeWidth={1.5} />
          <text x={W / 2 + 62} y={55} textAnchor="middle" fontSize={10}
            fontWeight={600} fill={!isSparse ? '#fff' : COLORS.green}>
            {t.dense}
          </text>
        </g>

        {/* Mode description */}
        <text x={W / 2} y={84} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {isSparse ? t.sparseDesc : t.denseDesc}
        </text>

        {/* Prompt */}
        <rect x={tokStartX} y={96} width={W - 60} height={24} rx={4}
          fill={COLORS.highlight} />
        <text x={tokStartX + 10} y={112} fontSize={10} fill={COLORS.dark}>
          {t.prompt}
        </text>

        {/* Token sequence label */}
        <text x={tokStartX} y={148} fontSize={11} fontWeight={600}
          fill={COLORS.dark}>{t.tokenLabel}</text>

        {/* Token boxes */}
        {TOKENS.map((tk, i) => {
          const x = tokStartX + i * tokW;
          const isLast = i === TOKENS.length - 1;

          // Reward bar
          let barH = 0;
          let barColor = COLORS.light;
          if (isSparse) {
            // Only last token gets the reward
            barH = isLast ? SPARSE_REWARD * barMaxH : 0;
            barColor = isLast ? COLORS.primary : COLORS.light;
          } else {
            barH = tk.denseReward * barMaxH;
            barColor = tk.isKeyStep ? COLORS.green : COLORS.mid;
          }

          return (
            <g key={`tk-${i}`}>
              {/* Token box */}
              <rect x={x} y={tokY} width={tokW - 4} height={tokH} rx={4}
                fill={COLORS.bgAlt}
                stroke={isSparse && isLast ? COLORS.primary :
                  !isSparse && tk.isKeyStep ? COLORS.green : COLORS.light}
                strokeWidth={1.5} />
              <text x={x + (tokW - 4) / 2} y={tokY + tokH / 2 + 4}
                textAnchor="middle" fontSize={9}
                fontWeight={tk.isKeyStep ? 600 : 400}
                fill={COLORS.dark} fontFamily={FONTS.mono}>
                {tk.text}
              </text>

              {/* Reward bar (above tokens) */}
              {barH > 0 && (
                <g>
                  <rect x={x + 4} y={tokY - barH - 8} width={tokW - 12}
                    height={barH} rx={3} fill={barColor} opacity={0.6} />
                  <text x={x + (tokW - 4) / 2} y={tokY - barH - 12}
                    textAnchor="middle" fontSize={8} fill={barColor}>
                    {isSparse && isLast ? SPARSE_REWARD.toFixed(2) :
                      !isSparse && tk.denseReward > 0 ? tk.denseReward.toFixed(1) : ''}
                  </text>
                </g>
              )}

              {/* "?" marks for sparse mode on non-last tokens */}
              {isSparse && !isLast && i % 3 === 0 && (
                <text x={x + (tokW - 4) / 2} y={tokY - 16}
                  textAnchor="middle" fontSize={12} fill={COLORS.mid}>?</text>
              )}
            </g>
          );
        })}

        {/* Reward label */}
        <text x={tokStartX} y={tokY + tokH + 24} fontSize={11} fontWeight={600}
          fill={COLORS.dark}>{t.rewardLabel}</text>

        {/* Bottom explanation */}
        <rect x={30} y={H - 70} width={W - 60} height={50} rx={8}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={W / 2} y={H - 46} textAnchor="middle" fontSize={10}
          fill={isSparse ? COLORS.red : COLORS.green} fontWeight={600}>
          {isSparse ? t.creditQuestion : t.creditAnswer}
        </text>
        <text x={W / 2} y={H - 28} textAnchor="middle" fontSize={9}
          fill={COLORS.mid}>{t.clickToToggle}</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders**

Run: `npm run dev`
Check: toggle between sparse and dense modes. In sparse mode, only the last token should have a reward bar; all other tokens show "?" marks. In dense mode, key reasoning tokens (2+3, 5, 5×4, 20) should have tall green bars.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/TokenRewardAssignment.tsx
git commit -m "feat(rl-for-llm): add TokenRewardAssignment interactive component"
```

### Task 4: PostTrainingPipeline Component

**Files:**
- Create: `src/components/interactive/PostTrainingPipeline.tsx`

An expandable post-training pipeline overview. Shows the full path from pretraining → SFT → RL alignment methods → reward design → test-time scaling. Each stage is clickable to expand details about what it solves and which article covers it.

- [ ] **Step 1: Create the PostTrainingPipeline component**

```tsx
// src/components/interactive/PostTrainingPipeline.tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 520;

interface PipelineStage {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  w: number;
  solves: string;
  rlConcept: string;
  article: string;
}

const STAGES: PipelineStage[] = [
  {
    id: 'pretrain', label: 'Pretrained LLM', color: COLORS.mid,
    x: W / 2, y: 60, w: 160,
    solves: '从海量文本中学习语言规律（next-token prediction）',
    rlConcept: '初始策略 π_init — 会说话，但不会遵循指令',
    article: '前置知识：Transformer、Attention',
  },
  {
    id: 'sft', label: 'SFT 监督微调', color: COLORS.primary,
    x: W / 2, y: 130, w: 160,
    solves: '学会遵循指令的基本格式和能力',
    rlConcept: 'Behavioral cloning — 模仿专家轨迹，有上限问题',
    article: '本文 §1 讨论了 SFT 的天花板',
  },
  {
    id: 'rlhf', label: 'RLHF', color: COLORS.orange,
    x: 120, y: 230, w: 100,
    solves: 'RM + PPO 完整 pipeline，用人类偏好对齐模型',
    rlConcept: 'On-policy RL：4 个模型同时运行，训练复杂但效果强',
    article: '→ 下一篇《RLHF：从人类反馈中学习》',
  },
  {
    id: 'dpo', label: 'DPO', color: COLORS.green,
    x: 290, y: 230, w: 100,
    solves: '跳过 RM，直接从偏好数据优化（offline）',
    rlConcept: 'Response-level 优化：closed-form 解，训练简单如 SFT',
    article: '→《从 DPO 到 GRPO：直接偏好优化》',
  },
  {
    id: 'grpo', label: 'GRPO', color: COLORS.purple,
    x: 460, y: 230, w: 100,
    solves: '无 Critic，组内相对排名替代绝对奖励',
    rlConcept: 'Group-relative：从同一 prompt 的多个采样中学习',
    article: '→《从 DPO 到 GRPO》中详述',
  },
  {
    id: 'rm', label: 'Reward 设计', color: COLORS.red,
    x: 200, y: 330, w: 140,
    solves: 'ORM vs PRM、reward hacking 防御',
    rlConcept: 'Reward 质量决定对齐天花板；PRM 提供 dense signal',
    article: '→《Reward 设计与 Scaling》',
  },
  {
    id: 'tts', label: 'Test-Time Scaling', color: '#00838f',
    x: 400, y: 330, w: 140,
    solves: '推理时用更多计算换更好的输出质量',
    rlConcept: 'Best-of-N、MCTS + PRM、CoT 作为 RL trajectory',
    article: '→《Test-Time Scaling 与思维强化》',
  },
];

const ARROWS: [string, string][] = [
  ['pretrain', 'sft'],
  ['sft', 'rlhf'], ['sft', 'dpo'], ['sft', 'grpo'],
  ['rlhf', 'rm'], ['dpo', 'rm'], ['grpo', 'rm'],
  ['rm', 'tts'],
];

export default function PostTrainingPipeline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = locale === 'zh' ? {
    title: 'LLM Post-Training 全景图',
    subtitle: '点击每个阶段查看它解决什么问题',
    solves: '解决的问题：',
    rlConcept: 'RL 视角：',
    article: '对应文章：',
    rlBlock: 'RL 对齐与优化',
  } : {
    title: 'LLM Post-Training Landscape',
    subtitle: 'Click each stage to see what it solves',
    solves: 'Solves:',
    rlConcept: 'RL perspective:',
    article: 'Article:',
    rlBlock: 'RL Alignment & Optimization',
  };

  const [active, setActive] = useState<string | null>(null);
  const stageMap = Object.fromEntries(STAGES.map(s => [s.id, s]));
  const activeStage = active ? stageMap[active] : null;

  const boxH = 32;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize={15} fontWeight={700}
          fill={COLORS.dark}>{t.title}</text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize={11}
          fill={COLORS.mid}>{t.subtitle}</text>

        {/* Arrow marker */}
        <defs>
          <marker id="arrowPT" viewBox="0 0 10 10" refX={8} refY={5}
            markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* RL block background */}
        <rect x={60} y={200} width={460} height={80} rx={10}
          fill="none" stroke={COLORS.light} strokeWidth={1} strokeDasharray="6,3" />
        <text x={70} y={218} fontSize={9} fill={COLORS.mid}>{t.rlBlock}</text>

        {/* Arrows */}
        {ARROWS.map(([from, to], i) => {
          const f = stageMap[from], toS = stageMap[to];
          return (
            <line key={i}
              x1={f.x} y1={f.y + boxH / 2}
              x2={toS.x} y2={toS.y - boxH / 2 - 4}
              stroke={COLORS.light} strokeWidth={1.5} markerEnd="url(#arrowPT)" />
          );
        })}

        {/* Stage boxes */}
        {STAGES.map(stage => {
          const isActive = active === stage.id;
          return (
            <g key={stage.id}
              onClick={() => setActive(isActive ? null : stage.id)}
              style={{ cursor: 'pointer' }}>
              <rect x={stage.x - stage.w / 2} y={stage.y - boxH / 2}
                width={stage.w} height={boxH} rx={boxH / 2}
                fill={isActive ? stage.color : COLORS.bgAlt}
                stroke={stage.color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={stage.x} y={stage.y + 4} textAnchor="middle"
                fontSize={11} fontWeight={600}
                fill={isActive ? '#fff' : stage.color}>
                {stage.label}
              </text>
            </g>
          );
        })}

        {/* Detail panel */}
        {activeStage ? (
          <g>
            <rect x={30} y={390} width={520} height={110} rx={8}
              fill={COLORS.bgAlt} stroke={activeStage.color} strokeWidth={1.5} />
            <text x={50} y={414} fontSize={13} fontWeight={700}
              fill={activeStage.color}>{activeStage.label}</text>

            <text x={50} y={436} fontSize={10} fontWeight={600}
              fill={COLORS.dark}>{t.solves}</text>
            <text x={140} y={436} fontSize={10} fill={COLORS.mid}>
              {activeStage.solves}
            </text>

            <text x={50} y={456} fontSize={10} fontWeight={600}
              fill={COLORS.dark}>{t.rlConcept}</text>
            <text x={140} y={456} fontSize={10} fill={COLORS.mid}>
              {activeStage.rlConcept}
            </text>

            <text x={50} y={476} fontSize={10} fontWeight={600}
              fill={COLORS.dark}>{t.article}</text>
            <text x={140} y={476} fontSize={10} fill={COLORS.primary}>
              {activeStage.article}
            </text>
          </g>
        ) : (
          <g>
            <rect x={30} y={390} width={520} height={110} rx={8}
              fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={W / 2} y={450} textAnchor="middle" fontSize={12}
              fill={COLORS.mid}>← {t.subtitle} →</text>
          </g>
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders**

Run: `npm run dev`
Check: 7 stage nodes connected by arrows. Clicking each expands a detail panel at the bottom. The RL block (RLHF/DPO/GRPO) is visually grouped with a dashed border.

- [ ] **Step 3: Commit**

```bash
git add src/components/interactive/PostTrainingPipeline.tsx
git commit -m "feat(rl-for-llm): add PostTrainingPipeline interactive component"
```

### Task 5: The Bridge Article (MDX)

**Files:**
- Create: `src/content/articles/zh/rl-for-llm.mdx`

This is the main article with 5 sections. It imports all 4 interactive components from Tasks 1-4 and uses KaTeX for math formulas.

- [ ] **Step 1: Create the article frontmatter and §1**

Create `src/content/articles/zh/rl-for-llm.mdx` with the following content:

````mdx
---
title: "当 RL 遇上 LLM：从语言生成到策略优化"
slug: rl-for-llm
locale: zh
tags: [reinforcement-learning, llm, post-training, rlhf, policy-optimization, alignment]
difficulty: intermediate
created: "2026-04-13"
updated: "2026-04-13"
prerequisites: [rl-foundations, policy-gradient, ppo-actor-critic]
references:
  - type: paper
    title: "Training language models to follow instructions with human feedback (Ouyang et al., 2022)"
    url: "https://arxiv.org/abs/2203.02155"
  - type: paper
    title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model (Rafailov et al., 2023)"
    url: "https://arxiv.org/abs/2305.18290"
  - type: paper
    title: "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models (Shao et al., 2024)"
    url: "https://arxiv.org/abs/2402.03300"
  - type: paper
    title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning (2025)"
    url: "https://arxiv.org/abs/2501.12948"
  - type: paper
    title: "A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning (Ross et al., 2011)"
    url: "https://arxiv.org/abs/1011.0686"
  - type: paper
    title: "Fine-Tuning Language Models from Human Preferences (Ziegler et al., 2019)"
    url: "https://arxiv.org/abs/1909.08593"
  - type: paper
    title: "Learning to summarize from human feedback (Stiennon et al., 2020)"
    url: "https://arxiv.org/abs/2009.01325"
  - type: website
    title: "Policy Gradient Algorithms — Lilian Weng"
    url: "https://lilianweng.github.io/posts/2018-04-08-policy-gradient/"
  - type: website
    title: "RLHF: Reinforcement Learning from Human Feedback — Chip Huyen"
    url: "https://huyenchip.com/2023/05/02/rlhf.html"
---

import SFTvsRLComparison from '../../../components/interactive/SFTvsRLComparison.tsx';
import LLMasMDP from '../../../components/interactive/LLMasMDP.tsx';
import TokenRewardAssignment from '../../../components/interactive/TokenRewardAssignment.tsx';
import PostTrainingPipeline from '../../../components/interactive/PostTrainingPipeline.tsx';

前面三篇文章，我们建立了完整的 RL 工具箱：MDP 和 Bellman 方程（价值评估）、Policy Gradient（直接优化策略）、PPO（稳定的策略优化）。这些算法最初诞生于游戏和机器人控制领域。

但你可能一直在想：**这些和 LLM 有什么关系？**

本文就是这座桥。我们将回答三个核心问题：
1. 为什么 LLM post-training 必须使用 RL，而不能只靠 SFT？
2. LLM 的文本生成过程如何精确映射为一个 MDP？
3. 前面学的 PG、Advantage、PPO 在 LLM 语境下具体意味着什么？

## SFT 的天花板：为什么 Behavioral Cloning 不够

LLM 的第一阶段 post-training 是 **SFT（Supervised Fine-Tuning）**：用人工编写的高质量 (prompt, response) 数据对预训练模型做监督微调。SFT 教会模型遵循指令的基本格式和能力。

但 SFT 本质上是 **behavioral cloning（行为克隆）**——模仿专家的行为。这种方式有四个根本局限。

### Distribution Shift：训练和推理的分布不匹配

SFT 训练时，模型看到的是人类编写的"完美"轨迹，每一步都用 **teacher forcing**：无论模型自己会生成什么，训练时强制喂入正确的下一个 token。

但推理时，模型必须用**自己生成的 token** 作为后续输入。一旦某步生成了训练数据中没见过的 token，模型就进入了"未知领域"——它在训练中从未学习过如何从这种状态恢复。

这就是 **exposure bias / distribution shift**（Ross et al., 2011）：训练分布和推理分布不匹配，而且错误会 **级联放大**（compounding error）——一个小偏差引发下一个更大的偏差。

类比：只看老司机开车录像学开车。在常见路况下表现良好，但一旦遇到录像中没有的情况（突然的施工路段），就完全不知道该怎么修正，越开越偏。

### 上限问题：SFT 无法超越训练数据

SFT 的上限就是训练数据的质量。如果人类标注者写出了 90 分的回答，SFT 最多也只能学到 90 分。它不会"创造"超越训练数据的新策略。

**RL 不受这个限制。** RL 通过 exploration（探索）可以发现训练数据中不存在的更好策略。一个惊人的例子是 **DeepSeek-R1-Zero**：在完全没有任何 SFT 数据的情况下，仅通过 RL（GRPO）训练，模型自发产生了 chain-of-thought 推理、self-verification（自我验证）、以及 reflection（反思）等行为——这些能力不是任何人教的，而是 RL 的 exploration 机制让模型自己"发现"的。

最终的 DeepSeek-R1 在 R1-Zero 的基础上加入了 cold-start SFT 和多轮 RL，进一步提升了可读性和稳定性。但核心发现是：**RL 阶段产生的推理能力超越了 SFT 数据所能教授的上限**。

### Sequence-Level 目标无法通过离散采样反向传播

"有帮助"、"安全"、"推理正确"——这些 post-training 的目标是在**整个 response 层面**定义的，不是在单个 token 层面。

SFT 的 cross-entropy loss 逐 token 计算："你生成的这个 token 和参考答案的 token 是否一致？"。它无法表达"整体回答质量"这种 sequence-level 的概念。

如果我们有一个 Reward Model 可以对完整回答打分呢？问题在于：**从概率分布中采样一个离散 token 的过程是不可微的**。你无法对 argmax 或 categorical sampling 求导——梯度在这里断了。

**Policy Gradient** 正是为此而生。它的核心贡献是：不需要通过采样过程反向传播，而是用 REINFORCE 估计器间接估计梯度。前面学的 $\nabla_\theta J = \mathbb{E}[\nabla_\theta \log \pi_\theta(a|s) \cdot A]$ 在这里找到了它真正的用武之地。

### On-policy 自我进化

上面第一点说的是"问题"（训练分布 ≠ 推理分布），这里来看 RL 为什么天然不存在这个问题。

RL 是 **on-policy** 的：训练数据由模型自己当前的策略生成。这意味着：
- 模型犯的错误会出现在自己的训练数据中，所以它能学会修正
- 随着模型改进，生成的数据质量也在提升——形成**自我进化的正循环**

而 SFT 的训练数据是固定的。无论模型训练到什么水平，它看到的永远是同一批人类示范。

<SFTvsRLComparison client:visible />
````

- [ ] **Step 2: Append §2 (LLM as MDP)**

Using Edit, append after the `<SFTvsRLComparison>` component:

````mdx
## 语言生成的马尔可夫决策过程

上面我们论证了 RL 的必要性。但要使用 RL，首先需要把 LLM 的文本生成过程正式建模为一个 **MDP（马尔可夫决策过程）**。

### 完整的 MDP 五元组映射

回忆在 [RL 基础](/llm-learning/zh/articles/rl-foundations) 中学到的 MDP 五元组 $(S, A, P, R, \gamma)$，我们可以精确地将 LLM 的每一步 token 生成对应上去：

**状态 (State)** $s_t = (x, y_{<t})$：prompt $x$ 加上已生成的所有 token $y_1, y_2, \ldots, y_{t-1}$。初始状态 $s_0 = x$ 就是 prompt 本身。

**动作 (Action)** $a_t \in \mathcal{V}$：从词汇表 $\mathcal{V}$（通常 32K-128K 个 token）中选择一个 token。

**策略 (Policy)** $\pi_\theta(a_t | s_t)$：就是 LLM 本身——给定当前 context（prompt + 已生成 tokens），输出下一个 token 的概率分布（softmax 输出层）。

**状态转移 (Transition)** $P(s_{t+1}|s_t, a_t)$：**确定性的**——新状态就是把选中的 token 拼接到序列后面：$s_{t+1} = (x, y_1, \ldots, y_{t-1}, a_t)$。

**奖励 (Reward)** $R(s_t, a_t)$：取决于任务设计。最典型的设置是：中间步骤 $r_t = 0$（$t < T$），只在生成完成时给一个 reward $r_T = R_{RM}(x, y)$（比如 RM score）。

**终止条件**：生成 EOS (End of Sequence) token，或达到最大长度。一个完整的生成过程就是一个 **episode**。

**折扣因子** $\gamma = 1$：由于 LLM 生成的 episode 是有限长的（有最大长度限制），不需要用 $\gamma < 1$ 来保证收敛——这与经典 RL 中无限 horizon 的设置不同。

### LLM MDP 的独特之处

与经典 RL 的 Atari 游戏或机器人控制相比，LLM 的 MDP 有几个显著的特殊性：

- **确定性转移**：经典环境有随机性（打砖块的球反弹方向、机器人的物理扰动），但 LLM 的状态转移完全确定——选了哪个 token，新状态就唯一确定
- **巨大动作空间**：词汇表有 32K-128K 个可能的 token，远超 Atari 的 18 个动作。这正是 Value-Based 方法（Q-Learning）不适合 LLM 的原因——你不可能为每个 token 都维护一个 Q 值
- **变长 Episode**：生成长度不固定，从几个 token 到几千个 token
- **Sparse Reward**：奖励通常只在 episode 结束时给出。几百个 token 的生成过程中，中间步骤全是 $r = 0$——这带来了严重的 credit assignment 问题（§4 详述）

### 具体示例：一次 token 生成的完整 MDP 轨迹

让我们用一个简单的例子走完一轮完整的 MDP 决策过程：

**Prompt**："中国的首都是"

| 步骤 | 状态 $s_t$ | 策略 $\pi_\theta(a \vert s_t)$ | 动作 $a_t$ | 奖励 $r_t$ |
|------|----------|------------------------|----------|----------|
| $t=0$ | "中国的首都是" | {"北": 0.82, "上": 0.05, "南": 0.03, ...} | "北" | 0 |
| $t=1$ | "中国的首都是北" | {"京": 0.97, "方": 0.01, ...} | "京" | 0 |
| $t=2$ | "中国的首都是北京" | {"。": 0.70, "，": 0.15, ...} | "。" | 0 |
| $t=3$ | "中国的首都是北京。" | {"\<EOS\>": 0.90, ...} | \<EOS\> | $R_{RM} = 0.92$ |

注意：只有最后一步才有非零的 reward（由 Reward Model 评分）。中间所有步骤的 reward 都是 0。

<LLMasMDP client:visible />

### 关于马尔可夫性

细心的读者可能会问：LLM 的每一步决策都依赖完整的上下文历史，这满足马尔可夫性吗？

答案是**满足的**，因为我们把 state 定义为 $(x, y_{<t})$——完整的 prompt 加上所有已生成的 token。这个 state 包含了所有历史信息。Transformer 的 attention 机制让模型在每一步都能 attend to 完整序列，所以 state 确实是"充分统计量"——给定当前 state，未来的决策不需要额外的历史信息。

这和经典 RL 中的处理方式一致：如果环境本身不满足马尔可夫性（如部分可观测环境），我们可以通过扩展 state 的定义（包含更多历史）来使其满足。

### Token-level 与 Response-level：两种操作粒度

上面建立的 MDP 是 **token-level** 的——每个 token 是一个 action。这是最基础、最精确的建模方式，也是 PPO 在 RLHF 中使用的视角。

但后续文章中你会看到一些方法使用不同的粒度：

- **Token-level MDP**（RLHF + PPO）：每个 token 计算 advantage，逐 token 调整概率
- **Response-level 视角**（DPO, GRPO）：把整个 response 看作一个 "action"，在完整回答之间做对比

两种视角在数学上是等价的——response-level 的 log probability 就是 token-level log probabilities 的求和：

$$\log \pi_\theta(y|x) = \sum_{t=1}^{T} \log \pi_\theta(y_t | x, y_{<t})$$

Token-level 更细致（能定位哪个 token 好/坏），但计算更重；response-level 更简洁，是 DPO/GRPO 能大幅简化训练的关键。在后续文章中遇到不同粒度时我们会明确标注。
````

- [ ] **Step 3: Append §3 (RL Toolbox Translation)**

Using Edit, append after the response-level formula:

````mdx
## 从 PG 到 PPO：在 LLM 语境下重新理解

有了 MDP 映射，我们可以重新审视前三篇学过的公式——这一次，每个符号都有了 LLM 中的具体含义。

### Policy Gradient → LLM 微调梯度

在 [Policy Gradient](/llm-learning/zh/articles/policy-gradient) 中我们学到策略梯度定理：

$$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\left[\nabla_\theta \log \pi_\theta(a_t|s_t) \cdot A_t\right]$$

翻译到 LLM 语境：

$$\nabla_\theta J(\theta) = \mathbb{E}\left[\nabla_\theta \log \pi_\theta(y_t | x, y_{<t}) \cdot A_t\right]$$

**直觉**：如果生成 token $y_t$ 后，整个回答的质量比平均水平好（$A_t > 0$），就增大 $y_t$ 的生成概率；反之则减小。模型就这样逐步学会"在什么位置生成什么 token 能让回答整体变好"。

### Advantage → Token 级别的"好坏判断"

Advantage $A_t$ 在 LLM 中回答的是一个非常具体的问题：

> 在已经生成了 $y_1, \ldots, y_{t-1}$ 的前提下，选择 token $y_t$ 比"平均选择"好多少？

如果 $A_t > 0$，这个 token 让整个回答质量提升了；如果 $A_t < 0$，这个 token 拖了后腿。

PPO 中用 **GAE（Generalized Advantage Estimation）** 计算 Advantage，需要一个 Critic 网络 $V(s)$ 来估计每个状态的价值。在 RLHF 中，这个 Critic 通常是从 Reward Model 初始化的——利用 RM 对"什么是好回答"的知识来估计中间状态的价值。

### PPO Clip → 防止 LLM 单次更新"突变"

PPO 的核心公式在 LLM 中变成：

$$L^{CLIP}(\theta) = \hat{\mathbb{E}}\left[\min\left(r_t(\theta)\hat{A}_t, \; \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t\right)\right]$$

其中概率比 $r_t(\theta) = \frac{\pi_\theta(y_t|x,y_{<t})}{\pi_{\theta_{old}}(y_t|x,y_{<t})}$ 就是"新模型和旧模型对同一个 token 的概率之比"。

**clip 的 LLM 含义**：不允许任何单个 token 的生成概率在一次更新中变化太大。如果某个 token 的概率突然从 5% 跳到 80%（或反过来），这可能破坏模型的语言能力。$\epsilon$ 通常设为 0.2，意味着概率比被限制在 $[0.8, 1.2]$ 范围内。

这就是 PPO 在 LLM 对齐中的角色：**保守地调整 token 概率分布**，确保每次更新都不会让模型"崩溃"。
````

- [ ] **Step 4: Append §4 (LLM RL Challenges)**

Using Edit, append after §3:

````mdx
## LLM 强化学习的独特挑战

将 RL 应用于 LLM 不是简单地"套公式"。LLM 场景引入了一系列经典 RL 中不存在或不突出的技术挑战。

### Sparse Reward 与 Credit Assignment

在典型的 RLHF 设置中，Reward Model 在整个 response 生成完成后给出一个标量分数。这意味着：

- 一个 200 token 的回答，只有最后一个 token 的位置有非零 reward
- 前面 199 个 token 的 reward 全是 0

**Credit assignment 问题**：到底是哪些 token 让回答变好了？是开头的问题理解？中间的推理步骤？还是最后的总结？Sparse reward 无法直接回答这个问题。

目前有两种应对策略：

**Outcome Reward Model (ORM)**：只看最终结果打分。简单但 credit assignment 困难。PPO 中的 GAE 通过多步 bootstrapping 来"传播" reward，但这仍然是间接的——从最后一个 token 的 reward 向前传递，估计质量随距离衰减。

**Process Reward Model (PRM)**：对推理过程的每一步打分，提供 dense reward signal。PRM 直接告诉你"第 3 步推理是对的，第 5 步出了错"。OpenAI 的 "Let's Verify Step by Step"（Lightman et al., 2023）证明 PRM 在数学推理上显著优于 ORM。但代价是标注成本极高——需要人工逐步标注每一步的正确性。

这个问题在 [Reward 设计与 Scaling](/llm-learning/zh/articles/reward-modeling) 中有更深入的讨论。

<TokenRewardAssignment client:visible />

### KL Penalty：不要忘记你是一个语言模型

RLHF 的优化目标不仅仅是"最大化 reward"，还有一个关键的正则化项——**KL 散度惩罚**：

$$\max_\theta \; \mathbb{E}_{x \sim D, \; y \sim \pi_\theta}\left[R_{task}(x, y) - \beta \cdot KL(\pi_\theta \| \pi_{ref})\right]$$

其中 $\pi_{ref}$ 是 SFT 模型（参考策略），$\beta$ 控制 KL 约束的强度。

**为什么需要 KL penalty？** 没有它，模型会发现 Reward Model 的弱点并疯狂利用——这就是 **reward hacking**。比如模型可能学会生成一些"看起来很长很专业但实际上是废话"的回答，因为 RM 倾向于给长回答高分。

KL penalty 的直觉：**让模型在对齐的同时不要忘记预训练学到的语言能力**。它像一根弹性绳，允许模型适度偏离 SFT 模型，但拉得太远就会被拽回来。

在实际实现中，KL penalty 被分解到 **token 级别**，成为每步 reward 的一部分：

$$r_t = r_{task,t} - \beta \cdot \left[\log \pi_\theta(y_t|s_t) - \log \pi_{ref}(y_t|s_t)\right]$$

一个关键细节：$r_{task,t} = 0$ 对所有中间 token（$t < T$），只有最后一个 token $r_{task,T} = R_{RM}(x, y)$ 才携带任务 reward。这意味着**中间步骤的 reward 信号完全来自 KL penalty**。

这带来一个有趣的副作用：KL penalty 在 credit assignment 中起到了意想不到的重要作用——它为中间 token 提供了一个"基准信号"（偏离参考策略太多就惩罚），让 GAE 有更多的信息来估计 advantage。

$\beta$ 的权衡：
- **$\beta$ 太大**：模型几乎无法偏离 SFT，学不到新东西
- **$\beta$ 太小**：reward hacking 风险高，模型可能变得不像话

### 生成即采样：On-policy 的代价

RL 优化需要 **on-policy 数据**——必须用当前模型的参数 $\theta$ 生成 response，才能计算 policy gradient。这意味着：

1. 每次参数更新后，之前采集的所有 response 数据就"过期"了
2. 需要用更新后的模型重新生成一批 response
3. 生成过程本身是 autoregressive 的——逐 token 生成，速度不快

这就是 RLHF 训练成本远高于 SFT 的根本原因之一。InstructGPT 论文提到需要同时运行 **4 个大模型**：policy（当前策略）、reference policy（SFT 模型）、reward model、critic（价值网络）。

这也是为什么 **DPO**（Direct Preference Optimization）如此有吸引力——它是 offline 的，直接在已有的偏好数据上训练，不需要 on-policy 采样。但这也引入了新的问题（distribution shift），我们在 [DPO 文章](/llm-learning/zh/articles/direct-preference-optimization) 中详述。
````

- [ ] **Step 5: Append §5 (Post-Training Landscape) and Summary**

Using Edit, append after §4:

````mdx
## Post-Training 全景：从 SFT 到推理强化

现在让我们退后一步，看完整的 post-training 版图。每个阶段都解决一个特定问题，并对应本学习路径中的一篇文章：

**Pretrained LLM**：从海量文本中学习语言规律（next-token prediction）。此时模型会"说话"，但不会遵循指令、不知道什么回答是好的。

**SFT（监督微调）**：用高质量的 (prompt, response) 对做 behavioral cloning。模型学会遵循指令的基本格式。但受限于训练数据的质量上限和 distribution shift。（本文 §1）

**RLHF**：SFT → Reward Model → PPO 的完整 pipeline。用人类偏好训练 RM，再用 PPO 优化 LLM 策略。效果强但训练复杂，需要 4 个模型同时运行。（→ [RLHF：从人类反馈中学习](/llm-learning/zh/articles/rlhf)）

**DPO**：跳过 Reward Model，直接从偏好数据优化策略。数学上等价于 RLHF 的隐式 reward，但训练过程简单如 SFT。代价是 offline 训练的 distribution shift。（→ [从 DPO 到 GRPO](/llm-learning/zh/articles/direct-preference-optimization)）

**GRPO**：DeepSeek 提出的方法。无需 Critic 网络，通过对同一 prompt 生成多个回答、用组内相对排名替代绝对 reward。比 PPO 更轻量，是 DeepSeek-R1 的核心训练算法。（→ [从 DPO 到 GRPO](/llm-learning/zh/articles/direct-preference-optimization)）

**Reward 设计**：无论用哪种对齐方法，reward 信号的质量决定天花板。ORM vs PRM、reward hacking 防御、reward scaling。（→ [Reward 设计与 Scaling](/llm-learning/zh/articles/reward-modeling)）

**Test-Time Scaling**：固定模型大小，在推理时投入更多计算换更好的输出。Best-of-N、MCTS + PRM、CoT 作为 RL trajectory。（→ [Test-Time Scaling 与思维强化](/llm-learning/zh/articles/test-time-scaling)）

<PostTrainingPipeline client:visible />

## 总结

本文建立了从经典 RL 到 LLM post-training 的完整桥梁：

1. **SFT 的局限**：distribution shift、上限问题、sequence-level 目标的不可微性，以及固定数据的 off-policy 本质——这些解释了为什么 post-training 必须使用 RL
2. **LLM 生成 = MDP**：state 是已生成序列，action 是选择下一个 token，policy 就是 LLM 本身。确定性转移、巨大动作空间、sparse reward 是 LLM MDP 的独特特征
3. **RL 工具箱翻译**：Policy Gradient 调整 token 概率，Advantage 判断每个 token 的好坏，PPO Clip 防止单次更新过大
4. **LLM RL 的独特挑战**：sparse reward 的 credit assignment 困难、KL penalty 防止 reward hacking 和遗忘、on-policy 采样的高成本
5. **Post-Training 全景**：SFT → RLHF / DPO / GRPO → Reward 设计 → Test-Time Scaling

下一篇，我们将深入 RLHF 的完整 pipeline：SFT → Reward Model → PPO，看这些 RL 工具如何具体地用于对齐大语言模型。
````

- [ ] **Step 6: Verify the complete article renders**

Run: `npm run dev`
Navigate to: `http://localhost:4321/llm-learning/zh/articles/rl-for-llm`
Check:
- All 4 interactive components render and are interactive
- Math formulas render correctly via KaTeX (inline and block)
- Internal links to other articles work
- Tables render correctly
- No console errors

- [ ] **Step 7: Run content validation**

```bash
npm run validate
```

Expected: pass with no errors for rl-for-llm.mdx

- [ ] **Step 8: Commit**

```bash
git add src/content/articles/zh/rl-for-llm.mdx
git commit -m "feat(rl-for-llm): add bridge article — RL meets LLM

5 sections: SFT limitations, MDP mapping, RL toolbox translation,
LLM-specific challenges, post-training landscape. zh-only"
```

### Task 6: Update Learning Path and Existing Articles

**Files:**
- Modify: `src/content/paths/reinforcement-learning.yaml`
- Modify: `src/content/articles/zh/rl-foundations.mdx:70-71`
- Modify: `src/content/articles/zh/ppo-actor-critic.mdx:96-98`

- [ ] **Step 1: Insert rl-for-llm into the learning path**

In `src/content/paths/reinforcement-learning.yaml`, add `rl-for-llm` after `ppo-actor-critic`:

```yaml
articles:
  - rl-foundations
  - policy-gradient
  - ppo-actor-critic
  - rl-for-llm
  - rlhf
  - direct-preference-optimization
  - reward-modeling
  - test-time-scaling
```

- [ ] **Step 2: Add LLM anchor to rl-foundations.mdx**

After line 70 (`<MDPGridWorld client:visible />`), before the `## 策略与价值函数` section, insert:

```mdx

> **LLM 连接**：在后续文章 [当 RL 遇上 LLM](/llm-learning/zh/articles/rl-for-llm) 中我们会看到，LLM 的文本生成过程可以完美地建模为 MDP——state 是 prompt + 已生成的 token 序列，action 是从词汇表中选择下一个 token，policy 就是 LLM 本身。这里先建立直觉，详细映射见那篇文章。

```

- [ ] **Step 3: Add forward reference in ppo-actor-critic.mdx**

At line 96 (`## PPO 在 LLM 中的角色`), modify the section opening to add a forward reference. Replace:

```
## PPO 在 LLM 中的角色
```

With:

```
## PPO 在 LLM 中的角色

下面的映射表是一个快速预览。完整的 MDP 映射、LLM RL 的独特挑战、以及 post-training 全景，请参阅 [当 RL 遇上 LLM](/llm-learning/zh/articles/rl-for-llm)。
```

- [ ] **Step 4: Verify all changes**

Run: `npm run dev`
Check:
1. RL learning path page shows 8 articles in correct order (rl-for-llm at position 4)
2. rl-foundations article has the blockquote LLM anchor after the MDP grid
3. ppo-actor-critic has the forward reference text before the mapping table
4. All internal links work

- [ ] **Step 5: Run validation**

```bash
npm run validate
```

Expected: pass

- [ ] **Step 6: Commit**

```bash
git add src/content/paths/reinforcement-learning.yaml \
       src/content/articles/zh/rl-foundations.mdx \
       src/content/articles/zh/ppo-actor-critic.mdx
git commit -m "feat(rl-for-llm): integrate into learning path and add cross-references

- Insert rl-for-llm as 4th article in RL learning path
- Add LLM anchor paragraph in rl-foundations after MDP section
- Add forward reference in ppo-actor-critic to bridge article"
```
