// src/components/interactive/PerplexityIntuition.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

// Pre-computed probability distributions for each token position
// Good model: high probability on correct token
const GOOD_MODEL: { candidates: string[]; probs: number[] }[] = [
  { candidates: ['The', 'A', 'This', 'One', 'My'], probs: [0.45, 0.25, 0.15, 0.08, 0.04] },
  { candidates: ['cat', 'dog', 'bird', 'man', 'boy'], probs: [0.52, 0.22, 0.12, 0.08, 0.04] },
  { candidates: ['sat', 'was', 'lay', 'stood', 'slept'], probs: [0.60, 0.18, 0.10, 0.07, 0.03] },
  { candidates: ['on', 'in', 'by', 'near', 'under'], probs: [0.70, 0.12, 0.08, 0.06, 0.03] },
  { candidates: ['the', 'a', 'his', 'my', 'that'], probs: [0.65, 0.18, 0.08, 0.05, 0.03] },
  { candidates: ['mat', 'floor', 'bed', 'table', 'roof'], probs: [0.55, 0.20, 0.12, 0.08, 0.04] },
];

// Bad model: spread probability, lower confidence
const BAD_MODEL: { candidates: string[]; probs: number[] }[] = [
  { candidates: ['The', 'A', 'This', 'One', 'My'], probs: [0.25, 0.22, 0.20, 0.18, 0.12] },
  { candidates: ['cat', 'dog', 'bird', 'man', 'boy'], probs: [0.24, 0.22, 0.20, 0.18, 0.13] },
  { candidates: ['sat', 'was', 'lay', 'stood', 'slept'], probs: [0.26, 0.22, 0.20, 0.17, 0.12] },
  { candidates: ['on', 'in', 'by', 'near', 'under'], probs: [0.28, 0.23, 0.20, 0.16, 0.10] },
  { candidates: ['the', 'a', 'his', 'my', 'that'], probs: [0.26, 0.24, 0.20, 0.17, 0.10] },
  { candidates: ['mat', 'floor', 'bed', 'table', 'roof'], probs: [0.24, 0.22, 0.20, 0.19, 0.12] },
];

function computePPL(model: typeof GOOD_MODEL): number {
  // PPL = exp(-1/N * sum(ln(p(correct_token))))
  // correct token is always the first candidate
  const N = model.length;
  const sumLogProb = model.reduce((sum, m) => sum + Math.log(m.probs[0]), 0);
  return Math.exp(-sumLogProb / N);
}

function MiniBarChart({ candidates, probs, correctIdx }: {
  candidates: string[]; probs: number[]; correctIdx: number;
}) {
  const maxProb = Math.max(...probs);
  const barH = 32;
  const barW = 18;
  const gap = 3;
  const w = candidates.length * (barW + gap);

  return (
    <svg viewBox={`0 0 ${w} ${barH + 14}`} className="w-full" style={{ maxWidth: w }}>
      {probs.map((p, i) => {
        const h = (p / maxProb) * barH;
        const isCorrect = i === correctIdx;
        return (
          <g key={i}>
            <motion.rect
              x={i * (barW + gap)}
              y={barH - h}
              width={barW}
              height={h}
              rx={2}
              fill={isCorrect ? COLORS.green : COLORS.light}
              stroke={isCorrect ? COLORS.green : '#d1d5db'}
              strokeWidth={0.5}
              initial={{ height: 0, y: barH }}
              animate={{ height: h, y: barH - h }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            />
            <text
              x={i * (barW + gap) + barW / 2}
              y={barH + 10}
              textAnchor="middle" fontSize="6" fill={COLORS.mid}
              fontFamily="monospace"
            >
              {(p * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PerplexityIntuition({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      goodModel: '好模型',
      badModel: '差模型',
      pplLabel: 'PPL',
      goodModelNote: '好模型：高置信度预测 → 低困惑度（每步平均只需从 ~2 个 token 中选择）',
      badModelNote: '差模型：概率分散 → 高困惑度（每步平均要从 ~4 个 token 中选择）',
    },
    en: {
      goodModel: 'Good Model',
      badModel: 'Bad Model',
      pplLabel: 'PPL',
      goodModelNote: 'Good model: high-confidence predictions → low perplexity (on average, choose from ~2 tokens per step)',
      badModelNote: 'Bad model: scattered probabilities → high perplexity (on average, choose from ~4 tokens per step)',
    },
  }[locale];

  const [isGoodModel, setIsGoodModel] = useState(true);
  const model = isGoodModel ? GOOD_MODEL : BAD_MODEL;
  const ppl = useMemo(() => computePPL(model), [model]);

  return (
    <div className="space-y-4">
      {/* Model toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setIsGoodModel(true)}
          className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
            isGoodModel
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t.goodModel}
        </button>
        <button
          onClick={() => setIsGoodModel(false)}
          className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
            !isGoodModel
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t.badModel}
        </button>
      </div>

      {/* Token sequence with bar charts */}
      <div className="flex items-end justify-center gap-1 flex-wrap">
        <AnimatePresence mode="wait">
          {TOKENS.map((token, i) => (
            <motion.div
              key={`${isGoodModel}-${i}`}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {/* Mini bar chart */}
              <div className="w-[100px] mb-1">
                <MiniBarChart
                  candidates={model[i].candidates}
                  probs={model[i].probs}
                  correctIdx={0}
                />
              </div>
              {/* Token */}
              <div className="px-2 py-1 rounded text-sm font-mono border"
                style={{
                  borderColor: isGoodModel ? COLORS.green : COLORS.red,
                  backgroundColor: isGoodModel ? '#f0fdf4' : '#fef2f2',
                }}>
                {token}
              </div>
              {/* Probability */}
              <div className="text-xs font-mono mt-0.5"
                style={{ color: isGoodModel ? COLORS.green : COLORS.red }}>
                {(model[i].probs[0] * 100).toFixed(0)}%
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PPL display */}
      <motion.div
        className="text-center p-3 rounded-lg"
        style={{
          backgroundColor: isGoodModel ? '#f0fdf4' : '#fef2f2',
          borderLeft: `4px solid ${isGoodModel ? COLORS.green : COLORS.red}`,
        }}
        key={isGoodModel ? 'good' : 'bad'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-lg font-bold" style={{ color: isGoodModel ? COLORS.green : COLORS.red }}>
          {t.pplLabel} = {ppl.toFixed(2)}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {isGoodModel ? t.goodModelNote : t.badModelNote}
        </div>
      </motion.div>
    </div>
  );
}
