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
          let barColor: string = COLORS.light;
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
