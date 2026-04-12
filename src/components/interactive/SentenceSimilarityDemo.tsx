import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;

interface SentencePair {
  a: string;
  b: string;
  score: number;
}

export default function SentenceSimilarityDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '句子相似度计算器',
      sentenceA: '句子 A',
      sentenceB: '句子 B',
      similarity: '余弦相似度',
      high: '高度相似',
      medium: '中度相关',
      low: '几乎无关',
      formula: 'cos(θ) = (A·B) / (|A||B|)',
      clickToSelect: '点击选择句对',
    },
    en: {
      title: 'Sentence Similarity Calculator',
      sentenceA: 'Sentence A',
      sentenceB: 'Sentence B',
      similarity: 'Cosine Similarity',
      high: 'Highly similar',
      medium: 'Moderately related',
      low: 'Nearly unrelated',
      formula: 'cos(θ) = (A·B) / (|A||B|)',
      clickToSelect: 'Click to select a pair',
    },
  }[locale]!;

  const pairs: SentencePair[] = useMemo(() => locale === 'zh' ? [
    { a: '这家餐厅的菜很好吃', b: '这个饭店的食物非常美味', score: 0.94 },
    { a: '今天天气很好', b: '外面阳光明媚', score: 0.88 },
    { a: '我喜欢跑步', b: '运动对健康有益', score: 0.72 },
    { a: '猫在沙发上睡觉', b: '股票市场今天大涨', score: 0.08 },
    { a: '深度学习需要大量数据', b: '神经网络需要海量训练样本', score: 0.91 },
    { a: '他正在写代码', b: '月亮围绕地球运转', score: 0.05 },
  ] : [
    { a: 'The food at this restaurant is great', b: 'This eatery serves delicious meals', score: 0.94 },
    { a: 'The weather is nice today', b: 'It is sunny outside', score: 0.88 },
    { a: 'I enjoy running', b: 'Exercise is good for health', score: 0.72 },
    { a: 'The cat sleeps on the couch', b: 'Stock market surged today', score: 0.08 },
    { a: 'Deep learning requires lots of data', b: 'Neural networks need massive training samples', score: 0.91 },
    { a: 'He is writing code', b: 'The moon orbits the earth', score: 0.05 },
  ], [locale]);

  const [selectedPair, setSelectedPair] = useState(0);
  const pair = pairs[selectedPair];

  const scoreColor = pair.score > 0.8 ? COLORS.green : pair.score > 0.5 ? COLORS.orange : COLORS.red;
  const scoreLabel = pair.score > 0.8 ? t.high : pair.score > 0.5 ? t.medium : t.low;

  // Angle from score: cos(θ) = score, θ = acos(score)
  const angle = Math.acos(Math.min(1, Math.max(-1, pair.score)));
  const arrowLen = 90;
  const cx = W / 2, cy = 210;

  // Vector A: always points right
  const ax = cx + arrowLen;
  const ay = cy;
  // Vector B: rotated by angle
  const bx = cx + arrowLen * Math.cos(angle);
  const by = cy - arrowLen * Math.sin(angle);

  // Gradient bar
  const barX = 220, barY = 340, barW = 360, barH = 20;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Sentence pair selector */}
        {pairs.map((p, i) => {
          const isActive = i === selectedPair;
          const py = 50 + i * 26;
          return (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedPair(i)}>
              <rect x={20} y={py - 10} width={W - 40} height={22} rx={4}
                fill={isActive ? COLORS.valid : 'transparent'}
                stroke={isActive ? COLORS.primary : COLORS.light} strokeWidth={isActive ? 1.5 : 0.5} />
              <text x={35} y={py + 4} fontSize="9" fill={COLORS.dark}>
                {p.a.length > 28 ? p.a.slice(0, 28) + '...' : p.a}
              </text>
              <text x={W / 2 - 20} y={py + 4} textAnchor="middle" fontSize="9" fill={COLORS.mid}>↔</text>
              <text x={W / 2 + 10} y={py + 4} fontSize="9" fill={COLORS.dark}>
                {p.b.length > 28 ? p.b.slice(0, 28) + '...' : p.b}
              </text>
              <text x={W - 45} y={py + 4} textAnchor="end" fontSize="9" fontWeight="bold"
                fill={p.score > 0.8 ? COLORS.green : p.score > 0.5 ? COLORS.orange : COLORS.red}>
                {p.score.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Vector angle visualization */}
        <text x={cx} y={cy - 105} textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          {t.formula}
        </text>

        {/* Arc showing angle */}
        {angle > 0.01 && (
          <path
            d={`M ${cx + 30} ${cy} A 30 30 0 0 0 ${cx + 30 * Math.cos(angle)} ${cy - 30 * Math.sin(angle)}`}
            fill="none" stroke={COLORS.mid} strokeWidth={1.5} strokeDasharray="3 3"
          />
        )}
        <text x={cx + 40 * Math.cos(angle / 2)} y={cy - 40 * Math.sin(angle / 2)}
          textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          θ
        </text>

        {/* Vector A arrow */}
        <motion.line
          x1={cx} y1={cy} x2={ax} y2={ay}
          stroke={COLORS.primary} strokeWidth={2.5}
          markerEnd="url(#arrowSimA)"
        />
        <text x={ax + 10} y={ay + 5} fontSize="11" fontWeight="bold" fill={COLORS.primary}>A</text>

        {/* Vector B arrow - animated */}
        <motion.line
          x1={cx} y1={cy}
          x2={bx} y2={by}
          stroke={COLORS.green} strokeWidth={2.5}
          markerEnd="url(#arrowSimB)"
          animate={{ x2: bx, y2: by }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        <motion.g animate={{ x: bx + 10 - cx, y: by - 5 - cy }} style={{ x: cx, y: cy }}>
          <text x={cx} y={cy} fontSize="11" fontWeight="bold" fill={COLORS.green}>B</text>
        </motion.g>

        {/* Sentence boxes */}
        <rect x={50} y={260} width={300} height={40} rx={6}
          fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={55} y={274} fontSize="8" fill={COLORS.primary} fontWeight="bold">{t.sentenceA}:</text>
        <text x={200} y={290} textAnchor="middle" fontSize="9" fill={COLORS.dark}>
          {pair.a.length > 35 ? pair.a.slice(0, 35) + '...' : pair.a}
        </text>

        <rect x={450} y={260} width={300} height={40} rx={6}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
        <text x={455} y={274} fontSize="8" fill={COLORS.green} fontWeight="bold">{t.sentenceB}:</text>
        <text x={600} y={290} textAnchor="middle" fontSize="9" fill={COLORS.dark}>
          {pair.b.length > 35 ? pair.b.slice(0, 35) + '...' : pair.b}
        </text>

        {/* Score indicator */}
        <text x={cx} y={barY - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          {t.similarity}
        </text>

        {/* Gradient bar */}
        <defs>
          <linearGradient id="simGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.red} />
            <stop offset="50%" stopColor={COLORS.orange} />
            <stop offset="100%" stopColor={COLORS.green} />
          </linearGradient>
          <marker id="arrowSimA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
          <marker id="arrowSimB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
          </marker>
        </defs>

        <rect x={barX} y={barY} width={barW} height={barH} rx={4} fill="url(#simGradient)" opacity={0.3} />
        <rect x={barX} y={barY} width={barW} height={barH} rx={4} fill="none" stroke={COLORS.light} strokeWidth={1} />

        {/* Score marker */}
        <motion.g
          animate={{ x: barX + pair.score * barW }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <line x1={0} y1={barY - 2} x2={0} y2={barY + barH + 2} stroke={scoreColor} strokeWidth={3} />
          <text x={0} y={barY + barH + 16} textAnchor="middle" fontSize="13" fontWeight="bold" fill={scoreColor}>
            {pair.score.toFixed(2)}
          </text>
          <text x={0} y={barY + barH + 30} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
            {scoreLabel}
          </text>
        </motion.g>

        {/* Scale labels */}
        <text x={barX} y={barY + barH + 16} fontSize="8" fill={COLORS.red}>0.0</text>
        <text x={barX + barW} y={barY + barH + 16} textAnchor="end" fontSize="8" fill={COLORS.green}>1.0</text>
      </svg>
    </div>
  );
}
