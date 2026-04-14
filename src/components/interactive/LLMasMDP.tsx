// src/components/interactive/LLMasMDP.tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 500;
const PROMPT_PREFIX = '中国的首都是';

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
          <tspan fill={COLORS.mid}>{PROMPT_PREFIX}</tspan>
          <tspan fill={COLORS.primary} fontWeight={700}>
            {current.state.slice(PROMPT_PREFIX.length)}
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
