import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 380;

// Pre-computed tokenization results for different algorithms
interface TokenResult {
  tokens: string[];
  vocab: string;
  algo: string;
}

interface Sentence {
  label: string;
  text: string;
  bpe: TokenResult;
  wordpiece: TokenResult;
  sentencepiece: TokenResult;
}

const SENTENCES: Record<'zh' | 'en', Sentence[]> = {
  zh: [
    {
      label: '英文常见句',
      text: 'The cat sat on the mat.',
      bpe: { tokens: ['The', ' cat', ' sat', ' on', ' the', ' mat', '.'], vocab: '~50k', algo: 'GPT-2 BPE' },
      wordpiece: { tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat', '.'], vocab: '~30k', algo: 'BERT WordPiece' },
      sentencepiece: { tokens: ['▁The', '▁cat', '▁sat', '▁on', '▁the', '▁mat', '.'], vocab: '~32k', algo: 'SentencePiece' },
    },
    {
      label: '中文句子',
      text: '大语言模型改变了世界',
      bpe: { tokens: ['大', '语言', '模型', '改变', '了', '世界'], vocab: '~50k', algo: 'GPT-2 BPE' },
      wordpiece: { tokens: ['大', '语', '言', '模', '型', '改', '变', '了', '世', '界'], vocab: '~30k', algo: 'BERT WordPiece' },
      sentencepiece: { tokens: ['▁大', '语言', '模型', '改变了', '世界'], vocab: '~32k', algo: 'SentencePiece' },
    },
    {
      label: '罕见词',
      text: 'unbelievably transformative',
      bpe: { tokens: ['un', 'bel', 'iev', 'ably', ' transform', 'ative'], vocab: '~50k', algo: 'GPT-2 BPE' },
      wordpiece: { tokens: ['un', '##bel', '##ie', '##va', '##bly', 'transform', '##ative'], vocab: '~30k', algo: 'BERT WordPiece' },
      sentencepiece: { tokens: ['▁un', 'believ', 'ably', '▁transform', 'ative'], vocab: '~32k', algo: 'SentencePiece' },
    },
    {
      label: '中英混合',
      text: 'GPT-4 是最先进的 LLM',
      bpe: { tokens: ['G', 'PT', '-', '4', ' 是', '最', '先进', '的', ' LL', 'M'], vocab: '~50k', algo: 'GPT-2 BPE' },
      wordpiece: { tokens: ['GP', '##T', '-', '4', '是', '最', '先', '进', '的', 'LL', '##M'], vocab: '~30k', algo: 'BERT WordPiece' },
      sentencepiece: { tokens: ['▁GPT', '-', '4', '▁是', '最先进的', '▁LLM'], vocab: '~32k', algo: 'SentencePiece' },
    },
  ],
  en: [
    {
      label: 'Common English',
      text: 'The cat sat on the mat.',
      bpe: { tokens: ['The', ' cat', ' sat', ' on', ' the', ' mat', '.'], vocab: '~50k', algo: 'GPT-2 BPE' },
      wordpiece: { tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat', '.'], vocab: '~30k', algo: 'BERT WordPiece' },
      sentencepiece: { tokens: ['▁The', '▁cat', '▁sat', '▁on', '▁the', '▁mat', '.'], vocab: '~32k', algo: 'SentencePiece' },
    },
    {
      label: 'Chinese',
      text: '大语言模型改变了世界',
      bpe: { tokens: ['大', '语言', '模型', '改变', '了', '世界'], vocab: '~50k', algo: 'GPT-2 BPE' },
      wordpiece: { tokens: ['大', '语', '言', '模', '型', '改', '变', '了', '世', '界'], vocab: '~30k', algo: 'BERT WordPiece' },
      sentencepiece: { tokens: ['▁大', '语言', '模型', '改变了', '世界'], vocab: '~32k', algo: 'SentencePiece' },
    },
    {
      label: 'Rare words',
      text: 'unbelievably transformative',
      bpe: { tokens: ['un', 'bel', 'iev', 'ably', ' transform', 'ative'], vocab: '~50k', algo: 'GPT-2 BPE' },
      wordpiece: { tokens: ['un', '##bel', '##ie', '##va', '##bly', 'transform', '##ative'], vocab: '~30k', algo: 'BERT WordPiece' },
      sentencepiece: { tokens: ['▁un', 'believ', 'ably', '▁transform', 'ative'], vocab: '~32k', algo: 'SentencePiece' },
    },
    {
      label: 'Mixed zh+en',
      text: 'GPT-4 是最先进的 LLM',
      bpe: { tokens: ['G', 'PT', '-', '4', ' 是', '最', '先进', '的', ' LL', 'M'], vocab: '~50k', algo: 'GPT-2 BPE' },
      wordpiece: { tokens: ['GP', '##T', '-', '4', '是', '最', '先', '进', '的', 'LL', '##M'], vocab: '~30k', algo: 'BERT WordPiece' },
      sentencepiece: { tokens: ['▁GPT', '-', '4', '▁是', '最先进的', '▁LLM'], vocab: '~32k', algo: 'SentencePiece' },
    },
  ],
};

const ALGO_COLORS: Record<string, string> = {
  bpe: COLORS.primary,
  wordpiece: COLORS.green,
  sentencepiece: COLORS.purple,
};

const ALGO_BG: Record<string, string> = {
  bpe: '#dbeafe',
  wordpiece: '#dcfce7',
  sentencepiece: '#f3e8ff',
};

export default function TokenizerComparison({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Tokenizer 对比',
      selectSentence: '选择句子：',
      tokens: '个 token',
      vocabSize: '词表',
      note: '注：## 前缀表示 WordPiece 子词续接；▁ 前缀表示 SentencePiece 词首标记',
    },
    en: {
      title: 'Tokenizer Comparison',
      selectSentence: 'Select sentence:',
      tokens: 'tokens',
      vocabSize: 'Vocab',
      note: 'Note: ## prefix indicates WordPiece subword continuation; ▁ prefix indicates SentencePiece word boundary',
    },
  }[locale]!;

  const sentences = SENTENCES[locale];
  const [selected, setSelected] = useState(0);
  const sentence = sentences[selected];

  const rows: { key: string; data: TokenResult }[] = [
    { key: 'bpe', data: sentence.bpe },
    { key: 'wordpiece', data: sentence.wordpiece },
    { key: 'sentencepiece', data: sentence.sentencepiece },
  ];

  const rowH = 70;
  const startY = 75;
  const tokenH = 28;
  const tokenGap = 3;
  const tokenStartX = 140;

  return (
    <div className="my-6">
      {/* Sentence selector */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <span className="text-sm font-medium text-gray-600">{t.selectSentence}</span>
        {sentences.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: selected === i ? COLORS.primary : '#f1f5f9',
              color: selected === i ? '#fff' : '#475569',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Source text */}
        <text x={W / 2} y={30} textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark}>
          "{sentence.text}"
        </text>

        {/* Divider */}
        <line x1={20} y1={45} x2={W - 20} y2={45} stroke={COLORS.light} strokeWidth={1} />

        {/* Three algorithm rows */}
        {rows.map((row, ri) => {
          const y = startY + ri * rowH;
          const algoColor = ALGO_COLORS[row.key];
          const algoBg = ALGO_BG[row.key];

          // Calculate token positions
          let tx = tokenStartX;
          const tokenLayouts = row.data.tokens.map((tok) => {
            const w = Math.max(26, tok.length * 8.5 + 12);
            const layout = { x: tx, w, tok };
            tx += w + tokenGap;
            return layout;
          });

          return (
            <g key={row.key}>
              {/* Algorithm label */}
              <text x={10} y={y + 12} fontSize="11" fontWeight="600" fill={algoColor}>
                {row.data.algo}
              </text>
              <text x={10} y={y + 26} fontSize="9" fill={COLORS.mid}>
                {t.vocabSize}: {row.data.vocab}
              </text>

              {/* Token boxes */}
              {tokenLayouts.map((tl, ti) => (
                <motion.g key={`${ri}-${ti}-${selected}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: ti * 0.03 }}
                >
                  <rect
                    x={tl.x} y={y + 2} width={tl.w} height={tokenH} rx={4}
                    fill={algoBg} stroke={algoColor} strokeWidth={1}
                  />
                  <text
                    x={tl.x + tl.w / 2} y={y + 2 + tokenH / 2 + 4}
                    textAnchor="middle" fontSize="10" fontFamily={FONTS.mono}
                    fill={COLORS.dark}
                  >
                    {tl.tok}
                  </text>
                </motion.g>
              ))}

              {/* Token count */}
              <text x={W - 20} y={y + 18} textAnchor="end" fontSize="10" fill={COLORS.mid}>
                {row.data.tokens.length} {t.tokens}
              </text>

              {/* Separator */}
              {ri < rows.length - 1 && (
                <line x1={10} y1={y + rowH - 12} x2={W - 10} y2={y + rowH - 12}
                  stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4,4" />
              )}
            </g>
          );
        })}

        {/* Note */}
        <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.note}
        </text>
      </svg>
    </div>
  );
}
