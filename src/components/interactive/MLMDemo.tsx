import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 300;

interface MaskOption {
  text: string;
  correct: boolean;
}

interface Sentence {
  tokens: string[];
  masks: { index: number; options: MaskOption[] }[];
}

const SENTENCES: Record<'zh' | 'en', Sentence[]> = {
  zh: [
    {
      tokens: ['巴黎', '是', '法国', '的', '首都', '，', '也是', '世界', '著名', '的', '旅游', '城市'],
      masks: [
        { index: 0, options: [{ text: '巴黎', correct: true }, { text: '伦敦', correct: false }, { text: '东京', correct: false }, { text: '纽约', correct: false }] },
        { index: 4, options: [{ text: '首都', correct: true }, { text: '省份', correct: false }, { text: '国家', correct: false }, { text: '城区', correct: false }] },
      ],
    },
    {
      tokens: ['猫', '喜欢', '在', '温暖', '的', '阳光', '下', '睡觉', '，', '这是', '它们', '的', '天性'],
      masks: [
        { index: 5, options: [{ text: '阳光', correct: true }, { text: '月光', correct: false }, { text: '灯光', correct: false }, { text: '星光', correct: false }] },
        { index: 7, options: [{ text: '睡觉', correct: true }, { text: '跑步', correct: false }, { text: '游泳', correct: false }, { text: '飞翔', correct: false }] },
      ],
    },
    {
      tokens: ['水', '在', '零', '度', '以下', '会', '结冰', '，', '这是', '基本', '的', '物理', '常识'],
      masks: [
        { index: 6, options: [{ text: '结冰', correct: true }, { text: '蒸发', correct: false }, { text: '沸腾', correct: false }, { text: '燃烧', correct: false }] },
        { index: 11, options: [{ text: '物理', correct: true }, { text: '数学', correct: false }, { text: '历史', correct: false }, { text: '文学', correct: false }] },
      ],
    },
  ],
  en: [
    {
      tokens: ['Paris', 'is', 'the', 'capital', 'of', 'France', ',', 'and', 'a', 'world', 'famous', 'tourist', 'city'],
      masks: [
        { index: 0, options: [{ text: 'Paris', correct: true }, { text: 'London', correct: false }, { text: 'Tokyo', correct: false }, { text: 'Berlin', correct: false }] },
        { index: 3, options: [{ text: 'capital', correct: true }, { text: 'province', correct: false }, { text: 'island', correct: false }, { text: 'border', correct: false }] },
      ],
    },
    {
      tokens: ['Cats', 'love', 'to', 'sleep', 'in', 'the', 'warm', 'sunlight', ',', 'it', 'is', 'their', 'nature'],
      masks: [
        { index: 7, options: [{ text: 'sunlight', correct: true }, { text: 'moonlight', correct: false }, { text: 'darkness', correct: false }, { text: 'starlight', correct: false }] },
        { index: 3, options: [{ text: 'sleep', correct: true }, { text: 'swim', correct: false }, { text: 'fly', correct: false }, { text: 'run', correct: false }] },
      ],
    },
    {
      tokens: ['Water', 'freezes', 'below', 'zero', 'degrees', ',', 'this', 'is', 'basic', 'physics', 'knowledge'],
      masks: [
        { index: 1, options: [{ text: 'freezes', correct: true }, { text: 'boils', correct: false }, { text: 'evaporates', correct: false }, { text: 'burns', correct: false }] },
        { index: 9, options: [{ text: 'physics', correct: true }, { text: 'math', correct: false }, { text: 'history', correct: false }, { text: 'art', correct: false }] },
      ],
    },
  ],
};

export default function MLMDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Masked Language Model 交互演示',
      instruction: '点击 [MASK] 选择正确的词，体验 BERT 的训练方式',
      correct: '正确！',
      wrong: '再试一次',
      allRevealed: '全部正确！这正是 BERT 的训练方式：从上下文预测被遮盖的词',
      objective: '训练目标',
      switchSentence: '换一句',
      maskCount: '被遮盖',
      tokens: '个 token',
      revealed: '已揭示',
    },
    en: {
      title: 'Masked Language Model Interactive Demo',
      instruction: 'Click [MASK] tokens to select the correct word — experience how BERT learns',
      correct: 'Correct!',
      wrong: 'Try again',
      allRevealed: 'All correct! This is exactly how BERT learns: predicting masked words from context',
      objective: 'Training Objective',
      switchSentence: 'Next Sentence',
      maskCount: 'Masked',
      tokens: 'tokens',
      revealed: 'Revealed',
    },
  }[locale]!;

  const sentences = SENTENCES[locale];
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const sentence = sentences[sentenceIdx];
  const maskedIndices = useMemo(() => new Set(sentence.masks.map(m => m.index)), [sentenceIdx]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ index: number; correct: boolean } | null>(null);

  const allRevealed = revealed.size === sentence.masks.length;

  const handleSelect = (maskIndex: number, option: MaskOption) => {
    if (option.correct) {
      setRevealed(prev => new Set([...prev, maskIndex]));
      setFeedback({ index: maskIndex, correct: true });
      setActiveDropdown(null);
    } else {
      setFeedback({ index: maskIndex, correct: false });
    }
    setTimeout(() => setFeedback(null), 1200);
  };

  const nextSentence = () => {
    setSentenceIdx((sentenceIdx + 1) % sentences.length);
    setRevealed(new Set());
    setActiveDropdown(null);
    setFeedback(null);
  };

  // Layout
  const tokenY = 120;
  const tokenH = 36;
  const tokenPad = 6;

  // Compute token positions
  const tokenWidths = sentence.tokens.map(tok => {
    const isMasked = maskedIndices.has(sentence.tokens.indexOf(tok));
    const display = isMasked && !revealed.has(sentence.tokens.indexOf(tok)) ? '[MASK]' : tok;
    return Math.max(display.length * 10 + 16, 50);
  });

  // Recompute with actual indices
  const tokenPositions = useMemo(() => {
    const positions: { x: number; w: number }[] = [];
    let cx = 30;
    sentence.tokens.forEach((tok, i) => {
      const isMasked = maskedIndices.has(i);
      const isRevealed = revealed.has(i);
      const display = isMasked && !isRevealed ? '[MASK]' : tok;
      const w = Math.max(display.length * 9 + 20, 50);
      positions.push({ x: cx, w });
      cx += w + tokenPad;
    });
    return positions;
  }, [sentenceIdx, revealed.size]);

  const totalWidth = tokenPositions.length > 0
    ? tokenPositions[tokenPositions.length - 1].x + tokenPositions[tokenPositions.length - 1].w + 30
    : W;
  const offsetX = Math.max(0, (W - totalWidth) / 2);

  return (
    <div className="my-6 relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: 'visible' }}>
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={50} textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          {t.instruction}
        </text>

        {/* Tokens row */}
        {sentence.tokens.map((tok, i) => {
          const isMasked = maskedIndices.has(i);
          const isRevealed = revealed.has(i);
          const pos = tokenPositions[i];
          const x = pos.x + offsetX;

          if (isMasked && !isRevealed) {
            // Masked token
            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => setActiveDropdown(activeDropdown === i ? null : i)}>
                <motion.rect
                  x={x} y={tokenY} width={pos.w} height={tokenH} rx={6}
                  fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2}
                  animate={{ scale: activeDropdown === i ? 1.05 : 1 }}
                  style={{ originX: `${x + pos.w / 2}px`, originY: `${tokenY + tokenH / 2}px` }}
                />
                <text x={x + pos.w / 2} y={tokenY + tokenH / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.orange}>
                  [MASK]
                </text>
              </g>
            );
          }

          if (isMasked && isRevealed) {
            // Revealed token
            return (
              <g key={i}>
                <motion.rect
                  x={x} y={tokenY} width={pos.w} height={tokenH} rx={6}
                  fill="#dcfce7" stroke={COLORS.green} strokeWidth={2}
                  initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                />
                <text x={x + pos.w / 2} y={tokenY + tokenH / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.green}>
                  {tok}
                </text>
              </g>
            );
          }

          // Normal token
          return (
            <g key={i}>
              <rect x={x} y={tokenY} width={pos.w} height={tokenH} rx={6}
                fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} opacity={0.8} />
              <text x={x + pos.w / 2} y={tokenY + tokenH / 2 + 4} textAnchor="middle" fontSize="11" fill={COLORS.dark}>
                {tok}
              </text>
            </g>
          );
        })}

        {/* Bidirectional arrows for context */}
        {sentence.masks.map(mask => {
          const maskPos = tokenPositions[mask.index];
          const mx = maskPos.x + offsetX + maskPos.w / 2;
          const arrowY = tokenY - 8;
          // Draw arrows from neighbors to mask
          return sentence.tokens.map((_, ni) => {
            if (ni === mask.index || maskedIndices.has(ni)) return null;
            const nPos = tokenPositions[ni];
            const nx = nPos.x + offsetX + nPos.w / 2;
            if (Math.abs(ni - mask.index) > 4) return null;
            return (
              <motion.path
                key={`arrow-${mask.index}-${ni}`}
                d={`M ${nx} ${arrowY} Q ${(nx + mx) / 2} ${arrowY - 20 - Math.abs(ni - mask.index) * 5} ${mx} ${arrowY}`}
                fill="none" stroke={COLORS.primary} strokeWidth={1} opacity={0.25}
                strokeDasharray="3 3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: Math.abs(ni - mask.index) * 0.05 }}
              />
            );
          });
        })}

        {/* Dropdown */}
        {activeDropdown !== null && (() => {
          const mask = sentence.masks.find(m => m.index === activeDropdown);
          if (!mask) return null;
          const pos = tokenPositions[activeDropdown];
          const dx = pos.x + offsetX;
          const dy = tokenY + tokenH + 8;
          const optW = 90;
          const optH = 28;
          return (
            <g>
              <rect x={dx - 10} y={dy} width={optW + 20} height={mask.options.length * optH + 10} rx={6}
                fill={COLORS.bg} stroke={COLORS.light} strokeWidth={1} filter="url(#shadow)" />
              {mask.options.map((opt, oi) => (
                <g key={oi} style={{ cursor: 'pointer' }} onClick={() => handleSelect(activeDropdown, opt)}>
                  <rect x={dx - 5} y={dy + 5 + oi * optH} width={optW + 10} height={optH - 2} rx={4}
                    fill={feedback?.index === activeDropdown && !feedback.correct && opt.text === sentence.tokens[activeDropdown] ? COLORS.bg : COLORS.bgAlt}
                    stroke="transparent" />
                  <text x={dx + optW / 2} y={dy + 5 + oi * optH + optH / 2 + 1} textAnchor="middle" fontSize="11" fill={COLORS.dark}>
                    {opt.text}
                  </text>
                </g>
              ))}
            </g>
          );
        })()}

        {/* Feedback */}
        {feedback && (() => {
          const pos = tokenPositions[feedback.index];
          const fx = pos.x + offsetX + pos.w / 2;
          return (
            <motion.text
              x={fx} y={tokenY + tokenH + 60} textAnchor="middle" fontSize="12" fontWeight="bold"
              fill={feedback.correct ? COLORS.green : COLORS.red}
              initial={{ opacity: 0, y: tokenY + tokenH + 50 }}
              animate={{ opacity: 1, y: tokenY + tokenH + 60 }}
            >
              {feedback.correct ? t.correct : t.wrong}
            </motion.text>
          );
        })()}

        {/* Status bar */}
        <text x={30} y={H - 50} fontSize="11" fill={COLORS.mid}>
          {t.maskCount}: {sentence.masks.length} {t.tokens} | {t.revealed}: {revealed.size}/{sentence.masks.length}
        </text>

        {/* Training objective */}
        <rect x={30} y={H - 40} width={W - 60} height={30} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={45} y={H - 20} fontSize="11" fill={COLORS.primary} fontWeight="bold">{t.objective}:</text>
        <text x={150} y={H - 20} fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>
          {'P(w_masked | context) = P(w_i | x_1, ..., x_{i-1}, x_{i+1}, ..., x_n)'}
        </text>

        {/* All revealed message */}
        {allRevealed && (
          <motion.text
            x={W / 2} y={tokenY + tokenH + 55} textAnchor="middle" fontSize="13" fontWeight="bold" fill={COLORS.green}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            {t.allRevealed}
          </motion.text>
        )}

        {/* Shadow filter */}
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>
      </svg>

      {/* Switch sentence button */}
      <div className="flex justify-center mt-2">
        <button
          onClick={nextSentence}
          className="px-4 py-1.5 text-sm rounded-md border transition-colors"
          style={{ borderColor: COLORS.primary, color: COLORS.primary, background: COLORS.bg }}
        >
          {t.switchSentence}
        </button>
      </div>
    </div>
  );
}
