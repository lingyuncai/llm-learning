import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

interface TokenProb {
  token: string;
  prob: number;
}

interface GenerationStep {
  token: string;
  topK: TokenProb[];
}

const GENERATION_DATA: Record<'zh' | 'en', { prompt: string[]; steps: GenerationStep[] }> = {
  zh: {
    prompt: ['法国', '的', '首都', '是'],
    steps: [
      { token: '巴黎', topK: [{ token: '巴黎', prob: 0.82 }, { token: '里昂', prob: 0.06 }, { token: '马赛', prob: 0.04 }, { token: '一个', prob: 0.03 }, { token: '位于', prob: 0.02 }] },
      { token: '，', topK: [{ token: '，', prob: 0.71 }, { token: '。', prob: 0.18 }, { token: '、', prob: 0.04 }, { token: '！', prob: 0.02 }, { token: '是', prob: 0.02 }] },
      { token: '也是', topK: [{ token: '也是', prob: 0.35 }, { token: '是', prob: 0.28 }, { token: '它', prob: 0.12 }, { token: '一个', prob: 0.09 }, { token: '同时', prob: 0.06 }] },
      { token: '世界', topK: [{ token: '世界', prob: 0.45 }, { token: '欧洲', prob: 0.22 }, { token: '全球', prob: 0.12 }, { token: '法国', prob: 0.08 }, { token: '著名', prob: 0.05 }] },
      { token: '著名', topK: [{ token: '著名', prob: 0.52 }, { token: '上', prob: 0.15 }, { token: '最', prob: 0.12 }, { token: '知名', prob: 0.08 }, { token: '闻名', prob: 0.05 }] },
    ],
  },
  en: {
    prompt: ['The', 'capital', 'of', 'France', 'is'],
    steps: [
      { token: 'Paris', topK: [{ token: 'Paris', prob: 0.85 }, { token: 'Lyon', prob: 0.04 }, { token: 'a', prob: 0.03 }, { token: 'the', prob: 0.03 }, { token: 'located', prob: 0.02 }] },
      { token: '.', topK: [{ token: '.', prob: 0.55 }, { token: ',', prob: 0.32 }, { token: '!', prob: 0.03 }, { token: 'and', prob: 0.03 }, { token: 'which', prob: 0.02 }] },
      { token: 'It', topK: [{ token: 'It', prob: 0.38 }, { token: 'Paris', prob: 0.18 }, { token: 'The', prob: 0.15 }, { token: 'This', prob: 0.10 }, { token: 'Known', prob: 0.06 }] },
      { token: 'is', topK: [{ token: 'is', prob: 0.72 }, { token: 'has', prob: 0.08 }, { token: "'s", prob: 0.06 }, { token: 'was', prob: 0.04 }, { token: 'also', prob: 0.03 }] },
      { token: 'known', topK: [{ token: 'known', prob: 0.30 }, { token: 'also', prob: 0.22 }, { token: 'one', prob: 0.15 }, { token: 'a', prob: 0.12 }, { token: 'the', prob: 0.08 }] },
    ],
  },
};

export default function AutoregressiveGeneration({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '自回归生成：逐词预测',
      generate: '生成下一个',
      reset: '重置',
      prompt: '输入提示',
      generated: '已生成',
      probability: '概率分布 (Top-5)',
      causalMask: '因果注意力遮罩',
      canSee: '可见',
      blocked: '被遮盖',
      current: '当前步',
      complete: '生成完成！',
    },
    en: {
      title: 'Autoregressive Generation: Token by Token',
      generate: 'Generate Next',
      reset: 'Reset',
      prompt: 'Prompt',
      generated: 'Generated',
      probability: 'Probability Distribution (Top-5)',
      causalMask: 'Causal Attention Mask',
      canSee: 'Visible',
      blocked: 'Blocked',
      current: 'Current',
      complete: 'Generation complete!',
    },
  }[locale]!;

  const data = GENERATION_DATA[locale];
  const [genCount, setGenCount] = useState(0);
  const isComplete = genCount >= data.steps.length;

  const allTokens = [
    ...data.prompt,
    ...data.steps.slice(0, genCount).map(s => s.token),
  ];
  const currentTopK = genCount > 0 && genCount <= data.steps.length ? data.steps[genCount - 1].topK : null;

  const generateNext = useCallback(() => {
    if (genCount < data.steps.length) {
      setGenCount(g => g + 1);
    }
  }, [genCount, data.steps.length]);

  const reset = useCallback(() => setGenCount(0), []);

  // Layout
  const tokenRowY = 60;
  const maskStartY = 180;
  const barChartX = 470;
  const barChartY = 180;

  const n = allTokens.length;
  const tokenW = Math.min(70, (W - 60) / Math.max(n, data.prompt.length + data.steps.length));
  const tokenStartX = 30;

  // Causal mask
  const maskCellSize = Math.min(24, 240 / Math.max(n, 6));
  const maskX = 30;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Token sequence */}
        <text x={tokenStartX} y={tokenRowY - 8} fontSize="10" fill={COLORS.mid}>{t.prompt}</text>
        {allTokens.map((tok, i) => {
          const isPrompt = i < data.prompt.length;
          const isNew = i === allTokens.length - 1 && genCount > 0 && !isPrompt;
          const x = tokenStartX + i * tokenW;

          return (
            <motion.g key={`tok-${i}`}
              initial={!isPrompt && i >= data.prompt.length ? { opacity: 0, scale: 0.8 } : { opacity: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <rect x={x} y={tokenRowY} width={tokenW - 4} height={30} rx={5}
                fill={isPrompt ? COLORS.valid : isNew ? COLORS.highlight : '#dcfce7'}
                stroke={isPrompt ? COLORS.primary : isNew ? COLORS.orange : COLORS.green}
                strokeWidth={isNew ? 2 : 1} />
              <text x={x + (tokenW - 4) / 2} y={tokenRowY + 19} textAnchor="middle"
                fontSize={tokenW > 50 ? 10 : 8} fontWeight={isNew ? 'bold' : 'normal'}
                fill={isPrompt ? COLORS.dark : COLORS.green}>
                {tok}
              </text>
            </motion.g>
          );
        })}

        {/* Labels */}
        {genCount > 0 && (
          <>
            <text x={tokenStartX + data.prompt.length * tokenW} y={tokenRowY + 48} fontSize="9" fill={COLORS.green}>
              {t.generated}: {genCount}
            </text>
          </>
        )}

        {/* Causal attention mask */}
        <text x={maskX} y={maskStartY - 8} fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          {t.causalMask}
        </text>
        {allTokens.map((_, row) => (
          allTokens.map((_, col) => {
            const canAttend = col <= row;
            const isCurrent = row === n - 1 && genCount > 0;
            return (
              <rect
                key={`mask-${row}-${col}`}
                x={maskX + col * maskCellSize}
                y={maskStartY + row * maskCellSize}
                width={maskCellSize - 1}
                height={maskCellSize - 1}
                rx={2}
                fill={canAttend ? (isCurrent && canAttend ? COLORS.highlight : COLORS.valid) : COLORS.waste}
                stroke={isCurrent && canAttend ? COLORS.orange : '#d1d5db'}
                strokeWidth={isCurrent && canAttend ? 1.5 : 0.5}
              />
            );
          })
        ))}

        {/* Mask legend */}
        <rect x={maskX} y={maskStartY + n * maskCellSize + 8} width={12} height={12} rx={2} fill={COLORS.valid} stroke="#d1d5db" strokeWidth={0.5} />
        <text x={maskX + 16} y={maskStartY + n * maskCellSize + 18} fontSize="9" fill={COLORS.mid}>{t.canSee}</text>
        <rect x={maskX + 70} y={maskStartY + n * maskCellSize + 8} width={12} height={12} rx={2} fill={COLORS.waste} stroke="#d1d5db" strokeWidth={0.5} />
        <text x={maskX + 86} y={maskStartY + n * maskCellSize + 18} fontSize="9" fill={COLORS.mid}>{t.blocked}</text>
        <rect x={maskX + 140} y={maskStartY + n * maskCellSize + 8} width={12} height={12} rx={2} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={maskX + 156} y={maskStartY + n * maskCellSize + 18} fontSize="9" fill={COLORS.mid}>{t.current}</text>

        {/* Top-K bar chart */}
        {currentTopK && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <text x={barChartX} y={barChartY - 8} fontSize="11" fontWeight="bold" fill={COLORS.dark}>
              {t.probability}
            </text>
            {currentTopK.map((item, i) => {
              const barW = item.prob * 250;
              const barY = barChartY + i * 34;
              const isSelected = i === 0;
              return (
                <motion.g key={`bar-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <motion.rect
                    x={barChartX + 70} y={barY} width={barW} height={22} rx={4}
                    fill={isSelected ? COLORS.green : COLORS.primary}
                    opacity={isSelected ? 0.9 : 0.4}
                    initial={{ width: 0 }} animate={{ width: barW }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  />
                  <text x={barChartX} y={barY + 15} fontSize="10" fill={isSelected ? COLORS.green : COLORS.dark}
                    fontWeight={isSelected ? 'bold' : 'normal'}>
                    {item.token}
                  </text>
                  <text x={barChartX + 75 + barW} y={barY + 15} fontSize="9" fill={COLORS.mid}>
                    {(item.prob * 100).toFixed(1)}%
                  </text>
                </motion.g>
              );
            })}
          </motion.g>
        )}

        {/* Complete message */}
        {isComplete && (
          <motion.text x={barChartX + 100} y={barChartY + 200} textAnchor="middle" fontSize="13" fontWeight="bold"
            fill={COLORS.green} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {t.complete}
          </motion.text>
        )}

        {/* Formula */}
        <text x={barChartX} y={H - 20} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
          P(x_t | x_1, x_2, ..., x_{'{t-1}'})
        </text>
      </svg>

      {/* Controls */}
      <div className="flex justify-center gap-3 mt-2">
        <button
          onClick={generateNext}
          disabled={isComplete}
          className="px-4 py-1.5 text-sm rounded-md text-white transition-colors disabled:opacity-40"
          style={{ background: isComplete ? COLORS.mid : COLORS.green }}
        >
          {t.generate}
        </button>
        <button
          onClick={reset}
          className="px-4 py-1.5 text-sm rounded-md border transition-colors"
          style={{ borderColor: COLORS.mid, color: COLORS.mid }}
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
}
