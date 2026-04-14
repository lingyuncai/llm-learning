import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Question {
  subject: { zh: string; en: string };
  question: { zh: string; en: string };
  options: string[];
  correctIndex: number;
  directAnswer: { selectedIndex: number; confidence: number };
  cotReasoning: {
    steps: { zh: string; en: string }[];
    selectedIndex: number;
    confidence: number;
  };
}

// Physics free-fall question: v = g*t = 9.8 * 2 ≈ 19.6 ≈ 20 m/s → D
const EXAMPLE_QUESTION: Question = {
  subject: { zh: '物理学', en: 'Physics' },
  question: {
    zh: '在自由落体运动中，一个物体从静止开始下落。忽略空气阻力，2秒后物体的速度最接近以下哪个值？',
    en: 'In free fall from rest, ignoring air resistance, which value best approximates the velocity after 2 seconds?',
  },
  options: [
    'A. 5 m/s', 'B. 10 m/s', 'C. 15 m/s', 'D. 20 m/s', 'E. 25 m/s',
    'F. 30 m/s', 'G. 35 m/s', 'H. 40 m/s', 'I. 45 m/s', 'J. 50 m/s',
  ],
  correctIndex: 3, // D. 20 m/s
  directAnswer: { selectedIndex: 1, confidence: 0.18 }, // wrong — B
  cotReasoning: {
    steps: [
      { zh: 'g ≈ 9.8 m/s²', en: 'g ≈ 9.8 m/s²' },
      { zh: 'v = g × t = 9.8 × 2 = 19.6 m/s', en: 'v = g × t = 9.8 × 2 = 19.6 m/s' },
      { zh: '19.6 ≈ 20，选 D', en: '19.6 ≈ 20, choose D' },
    ],
    selectedIndex: 3,
    confidence: 0.82,
  },
};

const OPTION_LETTERS = 'ABCDEFGHIJ';

export default function MMLUProEvalDemo({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const q = EXAMPLE_QUESTION;

  const [cotStep, setCotStep] = useState(-1); // -1 = not started, 0..n = steps, n+1 = done
  const totalSteps = q.cotReasoning.steps.length;
  const cotDone = cotStep >= totalSteps;

  const handleCotAdvance = () => {
    if (cotStep < totalSteps) {
      setCotStep(prev => prev + 1);
    }
  };

  const handleReset = () => setCotStep(-1);

  const optionStyle = (
    index: number,
    selectedIndex: number | null,
    correctIndex: number,
    show: boolean,
  ): React.CSSProperties => {
    const isSelected = show && selectedIndex === index;
    const isCorrect = index === correctIndex;
    let border = `1.5px solid ${COLORS.light}`;
    let bg = '#fff';
    if (show && isSelected && isCorrect) {
      border = `2px solid ${COLORS.green}`;
      bg = COLORS.green + '12';
    } else if (show && isSelected && !isCorrect) {
      border = `2px solid ${COLORS.red}`;
      bg = COLORS.red + '12';
    } else if (show && isCorrect && selectedIndex !== null) {
      border = `1.5px dashed ${COLORS.green}`;
    }
    return {
      padding: '4px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontFamily: FONTS.mono,
      border,
      background: bg,
      transition: 'all 0.2s',
      lineHeight: 1.3,
    };
  };

  const ConfidenceBar = ({ value, color }: { value: number; color: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
      <span style={{ fontSize: 10, color: COLORS.mid, width: 50, flexShrink: 0 }}>
        {t('置信度', 'Conf.')}
      </span>
      <div style={{ flex: 1, height: 10, borderRadius: 5, background: COLORS.light, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 5, background: color }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, width: 36, textAlign: 'right', fontFamily: FONTS.mono }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );

  return (
    <div style={{ fontFamily: FONTS.sans, maxWidth: 640, margin: '0 auto' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark }}>
          {t('MMLU-Pro 评估演示：10 选项 + CoT', 'MMLU-Pro Eval Demo: 10 Choices + CoT')}
        </span>
      </div>

      {/* Question card */}
      <div style={{
        border: `1.5px solid ${COLORS.primary}`,
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 12,
        background: '#fff',
      }}>
        {/* Subject badge */}
        <span style={{
          display: 'inline-block',
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 8,
          background: COLORS.primary + '18',
          color: COLORS.primary,
          marginBottom: 8,
        }}>
          {q.subject[locale]}
        </span>
        {/* Question text */}
        <p style={{ fontSize: 13, color: COLORS.dark, margin: '0 0 10px 0', lineHeight: 1.6 }}>
          {q.question[locale]}
        </p>
        {/* 10 option buttons in 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {q.options.map((opt, i) => (
            <div key={i} style={optionStyle(i, null, q.correctIndex, false)}>
              {opt}
            </div>
          ))}
        </div>
      </div>

      {/* Callout */}
      <div style={{
        background: COLORS.highlight,
        borderRadius: 8,
        padding: '8px 12px',
        marginBottom: 12,
        fontSize: 12,
        color: COLORS.dark,
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        {t(
          '10 选项 → 随机猜测概率仅 10%（vs MMLU 的 25%），更能区分真实理解和瞎猜',
          '10 choices → random guess is only 10% (vs MMLU\'s 25%), better at distinguishing real understanding from guessing',
        )}
      </div>

      {/* Two-column comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Direct Answer column */}
        <div style={{
          border: `1.5px solid ${COLORS.red}`,
          borderRadius: 10,
          padding: 12,
          background: '#fff',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.red, marginBottom: 8, textAlign: 'center' }}>
            {t('直接回答', 'Direct Answer')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {q.options.map((opt, i) => (
              <div key={i} style={optionStyle(i, q.directAnswer.selectedIndex, q.correctIndex, true)}>
                {opt}
              </div>
            ))}
          </div>
          <ConfidenceBar value={q.directAnswer.confidence} color={COLORS.red} />
          <div style={{ fontSize: 10, color: COLORS.red, marginTop: 6, textAlign: 'center', fontWeight: 600 }}>
            {t('选了 B — 错误 ✗', 'Chose B — Wrong ✗')}
          </div>
        </div>

        {/* CoT column */}
        <div style={{
          border: `1.5px solid ${cotDone ? COLORS.green : COLORS.primary}`,
          borderRadius: 10,
          padding: 12,
          background: '#fff',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: cotDone ? COLORS.green : COLORS.primary,
            marginBottom: 8, textAlign: 'center',
          }}>
            Chain-of-Thought
          </div>

          {/* CoT reasoning steps */}
          <div style={{
            minHeight: 80,
            background: COLORS.bgAlt,
            borderRadius: 6,
            padding: 8,
            marginBottom: 8,
          }}>
            {cotStep === -1 && (
              <span style={{ fontSize: 11, color: COLORS.mid, fontStyle: 'italic' }}>
                {t('点击下方按钮开始推理…', 'Click button below to start reasoning…')}
              </span>
            )}
            <AnimatePresence>
              {q.cotReasoning.steps.map((step, i) => (
                i <= cotStep - 1 ? null :
                i > cotStep ? null : null
              ))}
              {Array.from({ length: Math.min(cotStep + 1, totalSteps) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: 11,
                    color: COLORS.dark,
                    fontFamily: FONTS.mono,
                    padding: '3px 0',
                    borderBottom: i < Math.min(cotStep, totalSteps - 1) ? `1px dashed ${COLORS.light}` : 'none',
                  }}>
                  <span style={{ color: COLORS.primary, fontWeight: 600 }}>
                    {t(`步骤 ${i + 1}`, `Step ${i + 1}`)}:
                  </span>{' '}
                  {q.cotReasoning.steps[i][locale]}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Step / Reset button */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            {!cotDone ? (
              <button onClick={handleCotAdvance} style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: `1.5px solid ${COLORS.primary}`,
                background: COLORS.primary + '12',
                color: COLORS.primary,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: FONTS.sans,
              }}>
                {cotStep === -1
                  ? t('开始推理', 'Start Reasoning')
                  : t(`下一步 (${cotStep + 1}/${totalSteps})`, `Next Step (${cotStep + 1}/${totalSteps})`)}
              </button>
            ) : (
              <button onClick={handleReset} style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: `1.5px solid ${COLORS.mid}`,
                background: '#fff',
                color: COLORS.mid,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: FONTS.sans,
              }}>
                {t('重置', 'Reset')}
              </button>
            )}
          </div>

          {/* Final answer + confidence (only when done) */}
          {cotDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {q.options.map((opt, i) => (
                  <div key={i} style={optionStyle(i, q.cotReasoning.selectedIndex, q.correctIndex, true)}>
                    {opt}
                  </div>
                ))}
              </div>
              <ConfidenceBar value={q.cotReasoning.confidence} color={COLORS.green} />
              <div style={{ fontSize: 10, color: COLORS.green, marginTop: 6, textAlign: 'center', fontWeight: 600 }}>
                {t('选了 D — 正确 ✓', 'Chose D — Correct ✓')}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
