import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

interface WordExample {
  word: string;
  sentences: { text: string; meaning: string; contextualPos: { x: number; y: number }; neighbors: string[] }[];
  staticPos: { x: number; y: number };
}

const EXAMPLES: Record<'zh' | 'en', WordExample[]> = {
  zh: [
    {
      word: 'bank',
      sentences: [
        {
          text: 'I deposited money in the bank.',
          meaning: '银行（金融机构）',
          contextualPos: { x: 550, y: 120 },
          neighbors: ['finance', 'money', 'deposit'],
        },
        {
          text: 'We sat on the river bank.',
          meaning: '河岸',
          contextualPos: { x: 620, y: 310 },
          neighbors: ['river', 'shore', 'water'],
        },
        {
          text: 'The bank approved my loan.',
          meaning: '银行（贷款）',
          contextualPos: { x: 530, y: 150 },
          neighbors: ['loan', 'credit', 'approve'],
        },
      ],
      staticPos: { x: 580, y: 220 },
    },
    {
      word: 'apple',
      sentences: [
        {
          text: 'I ate a red apple.',
          meaning: '苹果（水果）',
          contextualPos: { x: 560, y: 130 },
          neighbors: ['fruit', 'eat', 'red'],
        },
        {
          text: 'Apple released a new iPhone.',
          meaning: '苹果公司',
          contextualPos: { x: 620, y: 300 },
          neighbors: ['iPhone', 'tech', 'company'],
        },
        {
          text: 'She picked apples from the tree.',
          meaning: '苹果（采摘）',
          contextualPos: { x: 540, y: 160 },
          neighbors: ['tree', 'pick', 'garden'],
        },
      ],
      staticPos: { x: 580, y: 220 },
    },
    {
      word: 'crane',
      sentences: [
        {
          text: 'The crane lifted the steel beam.',
          meaning: '起重机',
          contextualPos: { x: 560, y: 120 },
          neighbors: ['lift', 'steel', 'construction'],
        },
        {
          text: 'A beautiful crane stood by the lake.',
          meaning: '鹤（鸟类）',
          contextualPos: { x: 620, y: 310 },
          neighbors: ['bird', 'lake', 'fly'],
        },
        {
          text: 'He had to crane his neck to see.',
          meaning: '伸（脖子）',
          contextualPos: { x: 540, y: 230 },
          neighbors: ['neck', 'stretch', 'look'],
        },
      ],
      staticPos: { x: 580, y: 220 },
    },
  ],
  en: [
    {
      word: 'bank',
      sentences: [
        {
          text: 'I deposited money in the bank.',
          meaning: 'Financial institution',
          contextualPos: { x: 550, y: 120 },
          neighbors: ['finance', 'money', 'deposit'],
        },
        {
          text: 'We sat on the river bank.',
          meaning: 'Riverside',
          contextualPos: { x: 620, y: 310 },
          neighbors: ['river', 'shore', 'water'],
        },
        {
          text: 'The bank approved my loan.',
          meaning: 'Bank (lending)',
          contextualPos: { x: 530, y: 150 },
          neighbors: ['loan', 'credit', 'approve'],
        },
      ],
      staticPos: { x: 580, y: 220 },
    },
    {
      word: 'apple',
      sentences: [
        {
          text: 'I ate a red apple.',
          meaning: 'Fruit',
          contextualPos: { x: 560, y: 130 },
          neighbors: ['fruit', 'eat', 'red'],
        },
        {
          text: 'Apple released a new iPhone.',
          meaning: 'Tech company',
          contextualPos: { x: 620, y: 300 },
          neighbors: ['iPhone', 'tech', 'company'],
        },
        {
          text: 'She picked apples from the tree.',
          meaning: 'Fruit (picking)',
          contextualPos: { x: 540, y: 160 },
          neighbors: ['tree', 'pick', 'garden'],
        },
      ],
      staticPos: { x: 580, y: 220 },
    },
    {
      word: 'crane',
      sentences: [
        {
          text: 'The crane lifted the steel beam.',
          meaning: 'Machine',
          contextualPos: { x: 560, y: 120 },
          neighbors: ['lift', 'steel', 'construction'],
        },
        {
          text: 'A beautiful crane stood by the lake.',
          meaning: 'Bird',
          contextualPos: { x: 620, y: 310 },
          neighbors: ['bird', 'lake', 'fly'],
        },
        {
          text: 'He had to crane his neck to see.',
          meaning: 'Verb (stretch)',
          contextualPos: { x: 540, y: 230 },
          neighbors: ['neck', 'stretch', 'look'],
        },
      ],
      staticPos: { x: 580, y: 220 },
    },
  ],
};

const SENTENCE_COLORS = [COLORS.primary, COLORS.green, COLORS.purple];

export default function StaticVsContextual({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '静态嵌入 vs 上下文嵌入',
      selectWord: '选择多义词：',
      staticView: '静态 (Word2Vec)',
      contextualView: '上下文 (BERT)',
      sentences: '句子与含义',
      embeddingSpace: '嵌入空间',
      samePoint: '同一个点！',
      differentPoints: '不同位置！',
      staticNote: '静态嵌入：无论上下文如何，同一个词总是映射到同一个向量',
      contextualNote: '上下文嵌入：同一个词在不同语境中映射到不同向量，靠近语义相近的词',
    },
    en: {
      title: 'Static vs Contextual Embeddings',
      selectWord: 'Select polysemous word:',
      staticView: 'Static (Word2Vec)',
      contextualView: 'Contextual (BERT)',
      sentences: 'Sentences & Meanings',
      embeddingSpace: 'Embedding Space',
      samePoint: 'Same point!',
      differentPoints: 'Different positions!',
      staticNote: 'Static embedding: the same word always maps to the same vector regardless of context',
      contextualNote: 'Contextual embedding: the same word maps to different vectors in different contexts, near semantically similar words',
    },
  }[locale]!;

  const examples = EXAMPLES[locale];
  const [selectedWord, setSelectedWord] = useState(0);
  const [viewMode, setViewMode] = useState<'static' | 'contextual'>('contextual');

  const example = examples[selectedWord];

  // Left panel: sentences
  const sentenceStartY = 80;
  const sentenceH = 55;
  const leftPanelW = 380;

  // Right panel: embedding space
  const rightPanelX = 410;
  const rightPanelW = 370;
  const rightPanelH = 300;
  const rightPanelY = 60;

  return (
    <div className="my-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-3 items-center">
        <span className="text-sm font-medium text-gray-600">{t.selectWord}</span>
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSelectedWord(i)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: selectedWord === i ? COLORS.primary : '#f1f5f9',
              color: selectedWord === i ? '#fff' : '#475569',
            }}
          >
            {ex.word}
          </button>
        ))}

        <span className="mx-2 text-gray-300">|</span>

        <button
          onClick={() => setViewMode('static')}
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
          style={{
            background: viewMode === 'static' ? COLORS.orange : '#f1f5f9',
            color: viewMode === 'static' ? '#fff' : '#475569',
          }}
        >
          {t.staticView}
        </button>
        <button
          onClick={() => setViewMode('contextual')}
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
          style={{
            background: viewMode === 'contextual' ? COLORS.green : '#f1f5f9',
            color: viewMode === 'contextual' ? '#fff' : '#475569',
          }}
        >
          {t.contextualView}
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Left panel: sentences */}
        <text x={15} y={55} fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.sentences}
        </text>

        {example.sentences.map((s, i) => {
          const y = sentenceStartY + i * (sentenceH + 15);
          const color = SENTENCE_COLORS[i];

          // Highlight the target word in the sentence
          const wordIdx = s.text.toLowerCase().indexOf(example.word.toLowerCase());
          const before = s.text.slice(0, wordIdx);
          const highlighted = s.text.slice(wordIdx, wordIdx + example.word.length);
          const after = s.text.slice(wordIdx + example.word.length);

          return (
            <g key={i}>
              {/* Sentence card */}
              <rect x={10} y={y} width={leftPanelW} height={sentenceH} rx={6}
                fill={COLORS.bgAlt} stroke={color} strokeWidth={1.2} strokeOpacity={0.5} />

              {/* Colored indicator */}
              <rect x={10} y={y} width={4} height={sentenceH} rx={2}
                fill={color} />

              {/* Sentence text */}
              <text x={22} y={y + 20} fontSize="11" fill={COLORS.dark}>
                <tspan>{before}</tspan>
                <tspan fontWeight="700" fill={color}>{highlighted}</tspan>
                <tspan>{after}</tspan>
              </text>

              {/* Meaning */}
              <text x={22} y={y + 40} fontSize="10" fill={COLORS.mid}>
                → {s.meaning}
              </text>
            </g>
          );
        })}

        {/* Right panel: embedding space */}
        <rect x={rightPanelX} y={rightPanelY} width={rightPanelW} height={rightPanelH} rx={8}
          fill="#fafafa" stroke={COLORS.light} strokeWidth={1} />
        <text x={rightPanelX + rightPanelW / 2} y={rightPanelY - 8} textAnchor="middle"
          fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.embeddingSpace}
        </text>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <g key={`grid-${f}`}>
            <line x1={rightPanelX} y1={rightPanelY + rightPanelH * f}
              x2={rightPanelX + rightPanelW} y2={rightPanelY + rightPanelH * f}
              stroke={COLORS.light} strokeWidth={0.5} />
            <line x1={rightPanelX + rightPanelW * f} y1={rightPanelY}
              x2={rightPanelX + rightPanelW * f} y2={rightPanelY + rightPanelH}
              stroke={COLORS.light} strokeWidth={0.5} />
          </g>
        ))}

        {viewMode === 'static' ? (
          /* Static: all sentences map to the same point */
          <motion.g
            key="static"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Single point */}
            <motion.circle
              cx={example.staticPos.x} cy={example.staticPos.y} r={8}
              fill={COLORS.orange} stroke={COLORS.dark} strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
            />
            <text x={example.staticPos.x} y={example.staticPos.y - 14}
              textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.orange}>
              "{example.word}"
            </text>
            <text x={example.staticPos.x} y={example.staticPos.y + 24}
              textAnchor="middle" fontSize="10" fill={COLORS.mid}>
              {t.samePoint}
            </text>

            {/* Lines from sentences to the single point */}
            {example.sentences.map((s, i) => {
              const sentY = sentenceStartY + i * (sentenceH + 15) + sentenceH / 2;
              return (
                <motion.line key={i}
                  x1={leftPanelW + 10} y1={sentY}
                  x2={example.staticPos.x - 10} y2={example.staticPos.y}
                  stroke={SENTENCE_COLORS[i]} strokeWidth={1.5} strokeDasharray="4,3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                />
              );
            })}
          </motion.g>
        ) : (
          /* Contextual: different points */
          <motion.g
            key="contextual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {example.sentences.map((s, i) => {
              const color = SENTENCE_COLORS[i];
              const pos = s.contextualPos;
              const sentY = sentenceStartY + i * (sentenceH + 15) + sentenceH / 2;

              return (
                <g key={i}>
                  {/* Connection line */}
                  <motion.line
                    x1={leftPanelW + 10} y1={sentY}
                    x2={pos.x - 10} y2={pos.y}
                    stroke={color} strokeWidth={1.5} strokeDasharray="4,3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  />

                  {/* Neighbor words */}
                  {s.neighbors.map((n, ni) => {
                    const angle = (ni / s.neighbors.length) * Math.PI * 2 - Math.PI / 4;
                    const dist = 35;
                    const nx = pos.x + Math.cos(angle) * dist;
                    const ny = pos.y + Math.sin(angle) * dist;
                    return (
                      <g key={ni}>
                        <line x1={pos.x} y1={pos.y} x2={nx} y2={ny}
                          stroke={color} strokeWidth={0.5} opacity={0.3} />
                        <circle cx={nx} cy={ny} r={2.5} fill={color} opacity={0.4} />
                        <text x={nx} y={ny - 6} textAnchor="middle"
                          fontSize="8" fill={COLORS.mid}>{n}</text>
                      </g>
                    );
                  })}

                  {/* Main point */}
                  <motion.circle
                    cx={pos.x} cy={pos.y} r={7}
                    fill={color} stroke={COLORS.dark} strokeWidth={1.5}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.15 }}
                  />
                  <text x={pos.x} y={pos.y - 12}
                    textAnchor="middle" fontSize="10" fontWeight="600" fill={color}>
                    "{example.word}"
                  </text>
                </g>
              );
            })}

            <text x={rightPanelX + rightPanelW / 2} y={rightPanelY + rightPanelH - 10}
              textAnchor="middle" fontSize="10" fill={COLORS.green} fontWeight="600">
              {t.differentPoints}
            </text>
          </motion.g>
        )}

        {/* Bottom note */}
        <rect x={20} y={H - 45} width={W - 40} height={32} rx={6}
          fill={viewMode === 'static' ? '#fff8e1' : '#e8f5e9'} stroke={COLORS.light} strokeWidth={1} />
        <text x={W / 2} y={H - 24} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
          {viewMode === 'static' ? t.staticNote : t.contextualNote}
        </text>
      </svg>
    </div>
  );
}
