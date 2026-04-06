// src/components/interactive/DraftVerifyAnimation.tsx
import { useMemo } from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const DRAFT_TOKENS = [
  { token: 'The', draftProb: 0.4, targetProb: 0.45, accepted: true },
  { token: 'quick', draftProb: 0.3, targetProb: 0.35, accepted: true },
  { token: 'brown', draftProb: 0.25, targetProb: 0.10, accepted: false },
  { token: 'fox', draftProb: 0.35, targetProb: 0.40, accepted: true },
];
const RESAMPLE_TOKEN = { token: 'red', prob: 0.22 };

const TOKEN_W = 80;
const TOKEN_H = 36;
const GAP = 12;
const SVG_W = 460;
const SVG_H = 160;
const START_X = 30;
const TOKEN_Y = 60;

function TokenBox({ x, y, token, color, borderColor, subtitle, delayed, opacity }: {
  x: number; y: number; token: string; color: string; borderColor: string;
  subtitle?: string; delayed?: number; opacity?: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: y + 10 }}
      animate={{ opacity: opacity ?? 1, y }}
      transition={{ duration: 0.3, delay: delayed ?? 0 }}
    >
      <rect x={x} y={y} width={TOKEN_W} height={TOKEN_H} rx={6}
        fill={color} stroke={borderColor} strokeWidth={1.5} />
      <text x={x + TOKEN_W / 2} y={y + TOKEN_H / 2 + 1}
        textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark}
        fontFamily="system-ui">{token}</text>
      {subtitle && (
        <text x={x + TOKEN_W / 2} y={y + TOKEN_H + 14}
          textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily="monospace">{subtitle}</text>
      )}
    </motion.g>
  );
}

function VerifyArrow({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <line x1={x} y1={y} x2={x + width} y2={y}
        stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#verify-arrow)" />
      <text x={x + width / 2} y={y - 6}
        textAnchor="middle" fontSize="8" fill={COLORS.primary}
        fontFamily="system-ui" fontWeight="600">
        1 forward pass 并行验证
      </text>
    </motion.g>
  );
}

export default function DraftVerifyAnimation({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Draft: 小模型快速生成',
      step1Sub: 'Draft model 自回归生成 K=4 个候选 token（速度快，但不够准确）',
      step2Title: 'Verify: 大模型一次验证',
      step2Sub: 'Target model 对 4 个候选做一次 forward pass（类似 Prefill），同时获得所有位置的概率',
      step3Title: 'Rejection Sampling',
      step3Sub: '逐位置比较 draft 概率 q 和 target 概率 p — "brown" 在位置 3 被拒绝',
      step4Title: '重新采样 + 最终序列',
      step4Sub: '从拒绝位置用修正分布 norm(max(0, p−q)) 重新采样 → 最终分布与只用大模型完全一致',
      fastAuto: '快速自回归',
      parallelForward: '并行 forward pass',
      parallelVerify: '1 forward pass 并行验证',
      resample: '重新采样',
      finalOutput: '本轮产出 3 个有效 token（2 accepted + 1 resampled）',
    },
    en: {
      step1Title: 'Draft: Fast generation with small model',
      step1Sub: 'Draft model autoregressively generates K=4 candidate tokens (fast but less accurate)',
      step2Title: 'Verify: Single verification by large model',
      step2Sub: 'Target model does one forward pass on 4 candidates (like Prefill), obtaining all position probabilities at once',
      step3Title: 'Rejection Sampling',
      step3Sub: 'Compare draft prob q and target prob p position-wise — "brown" at position 3 is rejected',
      step4Title: 'Resample + Final sequence',
      step4Sub: 'Resample from rejection position using corrected distribution norm(max(0, p−q)) → final distribution identical to using large model only',
      fastAuto: 'Fast autoregressive',
      parallelForward: 'Parallel forward pass',
      parallelVerify: '1 forward pass parallel verify',
      resample: 'Resample',
      finalOutput: '3 valid tokens this round (2 accepted + 1 resampled)',
    },
  }[locale];

  const steps = useMemo(() => [
    {
      title: t.step1Title,
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
            <defs>
              <marker id="verify-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>
            {/* Draft model label */}
            <text x={START_X} y={25} fontSize="10" fontWeight="600" fill={COLORS.orange}
              fontFamily="system-ui">Draft Model (68M) — {t.fastAuto}</text>
            {/* Draft tokens appear one by one */}
            {DRAFT_TOKENS.map((t, i) => (
              <TokenBox key={i}
                x={START_X + i * (TOKEN_W + GAP)}
                y={TOKEN_Y}
                token={t.token}
                color={COLORS.highlight}
                borderColor={COLORS.orange}
                subtitle={`q=${t.draftProb.toFixed(2)}`}
                delayed={i * 0.2}
              />
            ))}
            {/* Sequential arrows */}
            {[0, 1, 2].map(i => (
              <motion.text key={i}
                x={START_X + TOKEN_W + i * (TOKEN_W + GAP) + GAP / 2}
                y={TOKEN_Y + TOKEN_H / 2 + 4}
                textAnchor="middle" fontSize="14" fill={COLORS.orange}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (i + 1) * 0.2 }}
              >→</motion.text>
            ))}
          </svg>
          <p className="text-sm text-gray-600 text-center">
            {t.step1Sub}
          </p>
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
            <defs>
              <marker id="verify-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>
            <text x={START_X} y={20} fontSize="10" fontWeight="600" fill={COLORS.primary}
              fontFamily="system-ui">Target Model (7B) — {t.parallelForward}</text>
            {/* All tokens with target probs */}
            {DRAFT_TOKENS.map((t, i) => (
              <TokenBox key={i}
                x={START_X + i * (TOKEN_W + GAP)}
                y={TOKEN_Y}
                token={t.token}
                color={COLORS.valid}
                borderColor={COLORS.primary}
                subtitle={`p=${t.targetProb.toFixed(2)}`}
                delayed={0.1}
              />
            ))}
            {/* Parallel verify arrows */}
            <VerifyArrow
              x={START_X}
              y={TOKEN_Y - 10}
              width={DRAFT_TOKENS.length * (TOKEN_W + GAP) - GAP}
            />
          </svg>
          <p className="text-sm text-gray-600 text-center">
            {t.step2Sub}
          </p>
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H + 20}`} className="w-full">
            {/* Tokens with accept/reject */}
            {DRAFT_TOKENS.map((t, i) => {
              const accepted = t.accepted;
              return (
                <motion.g key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.25 }}
                >
                  <rect
                    x={START_X + i * (TOKEN_W + GAP)}
                    y={TOKEN_Y}
                    width={TOKEN_W}
                    height={TOKEN_H}
                    rx={6}
                    fill={accepted ? '#dcfce7' : '#fee2e2'}
                    stroke={accepted ? COLORS.green : COLORS.red}
                    strokeWidth={2}
                  />
                  <text
                    x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                    y={TOKEN_Y + TOKEN_H / 2 + 1}
                    textAnchor="middle" fontSize="12" fontWeight="600"
                    fill={COLORS.dark} fontFamily="system-ui">
                    {t.token}
                  </text>
                  {/* Accept/Reject marker */}
                  <text
                    x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                    y={TOKEN_Y - 8}
                    textAnchor="middle" fontSize="16"
                    fill={accepted ? COLORS.green : COLORS.red}>
                    {accepted ? '✓' : '✗'}
                  </text>
                  {/* Probability comparison */}
                  <text
                    x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                    y={TOKEN_Y + TOKEN_H + 14}
                    textAnchor="middle" fontSize="7" fill={COLORS.mid}
                    fontFamily="monospace">
                    q={t.draftProb} {accepted ? '≤' : '>'} p={t.targetProb}
                  </text>
                </motion.g>
              );
            })}
            {/* Explanation */}
            <text x={SVG_W / 2} y={SVG_H + 12} textAnchor="middle" fontSize="9" fill={COLORS.mid}
              fontFamily="system-ui">
              q(x) ≤ p(x) → 接受 | q(x) {'>'} p(x) → 以 1−p/q 概率拒绝
            </text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            {t.step3Sub}
          </p>
        </div>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
            {/* Final sequence */}
            {['The', 'quick', RESAMPLE_TOKEN.token].map((token, i) => {
              const isResampled = i === 2;
              return (
                <motion.g key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <rect
                    x={START_X + i * (TOKEN_W + GAP)}
                    y={TOKEN_Y}
                    width={TOKEN_W}
                    height={TOKEN_H}
                    rx={6}
                    fill={isResampled ? '#fef3c7' : '#dcfce7'}
                    stroke={isResampled ? COLORS.orange : COLORS.green}
                    strokeWidth={2}
                  />
                  <text
                    x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                    y={TOKEN_Y + TOKEN_H / 2 + 1}
                    textAnchor="middle" fontSize="12" fontWeight="600"
                    fill={COLORS.dark} fontFamily="system-ui">
                    {token}
                  </text>
                  {isResampled && (
                    <text x={START_X + i * (TOKEN_W + GAP) + TOKEN_W / 2}
                      y={TOKEN_Y - 8}
                      textAnchor="middle" fontSize="8" fill={COLORS.orange}
                      fontFamily="system-ui" fontWeight="600">
                      {t.resample}
                    </text>
                  )}
                </motion.g>
              );
            })}
            {/* Result annotation */}
            <motion.text x={SVG_W / 2} y={TOKEN_Y + TOKEN_H + 30}
              textAnchor="middle" fontSize="10" fill={COLORS.green}
              fontWeight="600" fontFamily="system-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {t.finalOutput}
            </motion.text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            {t.step4Sub}
          </p>
        </div>
      ),
    },
  ], []);

  return <StepNavigator steps={steps} />;
}
