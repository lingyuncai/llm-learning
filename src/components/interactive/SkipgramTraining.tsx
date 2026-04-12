import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 420;

const SAMPLE_WORDS = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];

export default function SkipgramTraining({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Skip-gram 滑动窗口训练',
      centerWord: '中心词',
      contextWords: '上下文词',
      windowSize: '窗口大小',
      next: '下一步',
      prev: '上一步',
      trainingPairs: '训练样本对',
      inputLayer: '输入层 (one-hot)',
      hiddenLayer: '隐藏层 (词向量)',
      outputLayer: '输出层 (softmax)',
      sentence: '句子',
      objective: '目标：给定中心词，预测上下文词',
      neuralNet: '简化 Skip-gram 网络结构',
    },
    en: {
      title: 'Skip-gram Sliding Window Training',
      centerWord: 'Center word',
      contextWords: 'Context words',
      windowSize: 'Window size',
      next: 'Next',
      prev: 'Prev',
      trainingPairs: 'Training pairs',
      inputLayer: 'Input (one-hot)',
      hiddenLayer: 'Hidden (word vector)',
      outputLayer: 'Output (softmax)',
      sentence: 'Sentence',
      objective: 'Objective: given center word, predict context words',
      neuralNet: 'Simplified Skip-gram Network',
    },
  }[locale]!;

  const [position, setPosition] = useState(2);
  const [windowSize, setWindowSize] = useState(2);

  const handleNext = () => setPosition(p => Math.min(SAMPLE_WORDS.length - 1, p + 1));
  const handlePrev = () => setPosition(p => Math.max(0, p - 1));

  // Calculate context window
  const contextStart = Math.max(0, position - windowSize);
  const contextEnd = Math.min(SAMPLE_WORDS.length - 1, position + windowSize);

  // Generate training pairs
  const pairs: { center: string; context: string }[] = [];
  for (let i = contextStart; i <= contextEnd; i++) {
    if (i !== position) {
      pairs.push({ center: SAMPLE_WORDS[position], context: SAMPLE_WORDS[i] });
    }
  }

  // Layout constants
  const wordRowY = 80;
  const wordBoxW = 70;
  const wordBoxH = 34;
  const wordGap = 6;
  const totalWordsW = SAMPLE_WORDS.length * (wordBoxW + wordGap) - wordGap;
  const wordStartX = (W - totalWordsW) / 2;

  // Neural network diagram
  const nnY = 240;
  const nnH = 140;
  const layerW = 50;
  const layerH = 80;
  const layerGap = 160;
  const nnStartX = 160;

  return (
    <div className="my-6">
      {/* Window size slider */}
      <div className="flex flex-wrap gap-4 mb-3 items-center justify-center">
        <label className="text-sm font-medium text-gray-600">
          {t.windowSize}: <span className="font-bold text-blue-700">{windowSize}</span>
        </label>
        <input
          type="range" min={1} max={3} value={windowSize}
          onChange={e => setWindowSize(Number(e.target.value))}
          className="w-32"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="sg-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <path d="M0,0 L7,2.5 L0,5" fill={COLORS.primary} />
          </marker>
          <marker id="sg-arrow-ctx" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <path d="M0,0 L7,2.5 L0,5" fill={COLORS.green} />
          </marker>
        </defs>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          {t.objective}
        </text>

        {/* Window bracket */}
        {(() => {
          const bracketLeft = wordStartX + contextStart * (wordBoxW + wordGap) - 4;
          const bracketRight = wordStartX + contextEnd * (wordBoxW + wordGap) + wordBoxW + 4;
          const bracketY = wordRowY - 12;
          return (
            <motion.rect
              x={bracketLeft} y={bracketY} width={bracketRight - bracketLeft} height={wordBoxH + 24}
              rx={8}
              fill={COLORS.highlight} fillOpacity={0.3}
              stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="5,3"
              initial={false}
              animate={{ x: bracketLeft, width: bracketRight - bracketLeft }}
              transition={{ duration: 0.3 }}
            />
          );
        })()}

        {/* Word boxes */}
        {SAMPLE_WORDS.map((word, i) => {
          const x = wordStartX + i * (wordBoxW + wordGap);
          const isCenter = i === position;
          const isContext = i !== position && i >= contextStart && i <= contextEnd;
          const isOutside = !isCenter && !isContext;

          let fill: string = COLORS.bgAlt;
          let stroke: string = COLORS.light;
          let textColor: string = COLORS.mid;
          let strokeW = 1;

          if (isCenter) {
            fill = '#dbeafe';
            stroke = COLORS.primary;
            textColor = COLORS.primary;
            strokeW = 2;
          } else if (isContext) {
            fill = '#dcfce7';
            stroke = COLORS.green;
            textColor = COLORS.green;
            strokeW = 1.5;
          }

          return (
            <motion.g key={i}
              initial={false}
              animate={{ opacity: isOutside ? 0.4 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <rect x={x} y={wordRowY} width={wordBoxW} height={wordBoxH} rx={5}
                fill={fill} stroke={stroke} strokeWidth={strokeW} />
              <text x={x + wordBoxW / 2} y={wordRowY + wordBoxH / 2 + 4}
                textAnchor="middle" fontSize="12" fontWeight={isCenter ? '700' : '500'}
                fontFamily={FONTS.mono} fill={textColor}>
                {word}
              </text>
              {/* Position index */}
              <text x={x + wordBoxW / 2} y={wordRowY + wordBoxH + 14}
                textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                {i}
              </text>
            </motion.g>
          );
        })}

        {/* Label: center word and context */}
        <text x={wordStartX + position * (wordBoxW + wordGap) + wordBoxW / 2} y={wordRowY - 18}
          textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.primary}>
          {t.centerWord}
        </text>

        {/* Arrows from center to context words */}
        {pairs.map((pair, pi) => {
          const centerX = wordStartX + position * (wordBoxW + wordGap) + wordBoxW / 2;
          const centerIdx = SAMPLE_WORDS.indexOf(pair.context, contextStart);
          const idx = position + (pi < Math.min(position, windowSize) ? (pi - Math.min(position, windowSize)) : pi - Math.min(position, windowSize) + 1);
          // Find the actual index
          let targetIdx = -1;
          for (let i = contextStart; i <= contextEnd; i++) {
            if (i !== position && SAMPLE_WORDS[i] === pair.context) {
              if (targetIdx === -1 || Math.abs(i - position) <= Math.abs(targetIdx - position)) {
                // Match based on order in pairs array
                const pairsBefore = pairs.slice(0, pi).filter(p => p.context === pair.context).length;
                const matchCount = SAMPLE_WORDS.slice(contextStart, contextEnd + 1)
                  .filter((w, wi) => w === pair.context && wi + contextStart !== position)
                  .length;
                if (pairsBefore === 0) { targetIdx = i; break; }
              }
            }
          }
          if (targetIdx === -1) {
            // Fallback: find by offset
            for (let i = contextStart; i <= contextEnd; i++) {
              if (i !== position && SAMPLE_WORDS[i] === pair.context) {
                targetIdx = i;
                break;
              }
            }
          }
          if (targetIdx === -1) return null;

          const targetX = wordStartX + targetIdx * (wordBoxW + wordGap) + wordBoxW / 2;
          const y1 = wordRowY + wordBoxH + 2;
          const y2 = wordRowY + wordBoxH + 22 + pi * 4;

          return (
            <motion.path key={pi}
              d={`M${centerX},${y1} Q${(centerX + targetX) / 2},${y2} ${targetX},${y1}`}
              fill="none" stroke={COLORS.green} strokeWidth={1.5}
              markerEnd="url(#sg-arrow-ctx)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 0.4, delay: pi * 0.1 }}
            />
          );
        })}

        {/* Training pairs list */}
        <text x={620} y={wordRowY + wordBoxH + 28} fontSize="10" fontWeight="600" fill={COLORS.dark}>
          {t.trainingPairs}:
        </text>
        {pairs.map((pair, i) => (
          <motion.text key={i}
            x={620} y={wordRowY + wordBoxH + 44 + i * 16}
            fontSize="10" fontFamily={FONTS.mono} fill={COLORS.mid}
            initial={{ opacity: 0, x: 630 }}
            animate={{ opacity: 1, x: 620 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            ({pair.center}, {pair.context})
          </motion.text>
        ))}

        {/* Simplified neural network diagram */}
        <text x={W / 2} y={nnY - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.neuralNet}
        </text>

        {/* Input layer */}
        <rect x={nnStartX} y={nnY} width={layerW} height={layerH} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={nnStartX + layerW / 2} y={nnY + layerH / 2}
          textAnchor="middle" fontSize="9" fill={COLORS.primary} fontWeight="600">
          V dims
        </text>
        <text x={nnStartX + layerW / 2} y={nnY + layerH + 16}
          textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.inputLayer}
        </text>

        {/* Hidden layer */}
        <rect x={nnStartX + layerGap} y={nnY + 15} width={layerW} height={layerH - 30} rx={5}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={nnStartX + layerGap + layerW / 2} y={nnY + layerH / 2}
          textAnchor="middle" fontSize="9" fill={COLORS.orange} fontWeight="600">
          d dims
        </text>
        <text x={nnStartX + layerGap + layerW / 2} y={nnY + layerH + 16}
          textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.hiddenLayer}
        </text>

        {/* Output layer */}
        <rect x={nnStartX + 2 * layerGap} y={nnY} width={layerW} height={layerH} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
        <text x={nnStartX + 2 * layerGap + layerW / 2} y={nnY + layerH / 2}
          textAnchor="middle" fontSize="9" fill={COLORS.green} fontWeight="600">
          V dims
        </text>
        <text x={nnStartX + 2 * layerGap + layerW / 2} y={nnY + layerH + 16}
          textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.outputLayer}
        </text>

        {/* Connection arrows */}
        {/* Input → Hidden: W matrix */}
        <line x1={nnStartX + layerW} y1={nnY + layerH / 2}
          x2={nnStartX + layerGap} y2={nnY + layerH / 2}
          stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#sg-arrow)" />
        <text x={nnStartX + layerW + (layerGap - layerW) / 2} y={nnY + layerH / 2 - 8}
          textAnchor="middle" fontSize="10" fontFamily={FONTS.mono} fill={COLORS.primary} fontWeight="600">
          W
        </text>
        <text x={nnStartX + layerW + (layerGap - layerW) / 2} y={nnY + layerH / 2 + 14}
          textAnchor="middle" fontSize="8" fill={COLORS.mid}>
          (V x d)
        </text>

        {/* Hidden → Output: W' matrix */}
        <line x1={nnStartX + layerGap + layerW} y1={nnY + layerH / 2}
          x2={nnStartX + 2 * layerGap} y2={nnY + layerH / 2}
          stroke={COLORS.green} strokeWidth={2} markerEnd="url(#sg-arrow-ctx)" />
        <text x={nnStartX + layerGap + layerW + (layerGap - layerW) / 2} y={nnY + layerH / 2 - 8}
          textAnchor="middle" fontSize="10" fontFamily={FONTS.mono} fill={COLORS.green} fontWeight="600">
          W'
        </text>
        <text x={nnStartX + layerGap + layerW + (layerGap - layerW) / 2} y={nnY + layerH / 2 + 14}
          textAnchor="middle" fontSize="8" fill={COLORS.mid}>
          (d x V)
        </text>

        {/* Nav buttons */}
        <g style={{ cursor: 'pointer' }} onClick={handlePrev}>
          <rect x={W / 2 - 120} y={H - 45} width={70} height={30} rx={6}
            fill={position > 0 ? COLORS.bgAlt : COLORS.masked}
            stroke={COLORS.light} strokeWidth={1} />
          <text x={W / 2 - 85} y={H - 26} textAnchor="middle"
            fontSize="11" fill={position > 0 ? COLORS.dark : COLORS.mid} fontWeight="500">
            {t.prev}
          </text>
        </g>
        <g style={{ cursor: 'pointer' }} onClick={handleNext}>
          <rect x={W / 2 + 50} y={H - 45} width={70} height={30} rx={6}
            fill={position < SAMPLE_WORDS.length - 1 ? COLORS.primary : COLORS.masked}
            stroke={position < SAMPLE_WORDS.length - 1 ? COLORS.primary : COLORS.light} strokeWidth={1} />
          <text x={W / 2 + 85} y={H - 26} textAnchor="middle"
            fontSize="11" fill={position < SAMPLE_WORDS.length - 1 ? '#fff' : COLORS.mid} fontWeight="500">
            {t.next}
          </text>
        </g>

        {/* Position indicator */}
        <text x={W / 2} y={H - 26} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {position + 1} / {SAMPLE_WORDS.length}
        </text>
      </svg>
    </div>
  );
}
