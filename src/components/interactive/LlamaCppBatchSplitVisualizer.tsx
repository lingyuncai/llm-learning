// src/components/interactive/LlamaCppBatchSplitVisualizer.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';

interface BatchSplitVisualizerProps {
  locale?: 'zh' | 'en';
}

const t = {
  zh: {
    title: 'Batch 切分算法可视化',
    nTokens: '总 token 数 (n_tokens)',
    nUbatch: 'ubatch 上限 (n_ubatch)',
    nSequences: '序列数 (n_sequences)',
    splitSimple: 'split_simple',
    splitEqual: 'split_equal',
    splitSeq: 'split_seq',
    splitSimpleDesc: '顺序切分：从头到尾取 token，不关心序列边界',
    splitEqualDesc: '等长切分：各序列均衡取相同数量 token',
    splitSeqDesc: '按序列切分：每个 ubatch 只含单个序列的 token',
    ubatch: 'ubatch',
    tokens: 'tokens',
    seq: '序列',
    total: '总计',
    ubatches: '个 ubatch',
    tokensPerUbatch: 'token/ubatch',
  },
  en: {
    title: 'Batch Split Algorithm Visualization',
    nTokens: 'Total tokens (n_tokens)',
    nUbatch: 'Ubatch limit (n_ubatch)',
    nSequences: 'Sequences (n_sequences)',
    splitSimple: 'split_simple',
    splitEqual: 'split_equal',
    splitSeq: 'split_seq',
    splitSimpleDesc: 'Sequential split: take tokens front-to-back, ignoring sequence boundaries',
    splitEqualDesc: 'Equal split: balanced token count per sequence',
    splitSeqDesc: 'Per-sequence split: each ubatch contains only one sequence',
    ubatch: 'ubatch',
    tokens: 'tokens',
    seq: 'Seq',
    total: 'Total',
    ubatches: 'ubatches',
    tokensPerUbatch: 'tokens/ubatch',
  },
};

/** Colors for sequences */
const SEQ_COLORS = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', bar: '#3b82f6' },   // blue
  { bg: '#dcfce7', border: '#22c55e', text: '#166534', bar: '#22c55e' },   // green
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', bar: '#f59e0b' },   // amber
  { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', bar: '#a855f7' },   // purple
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', bar: '#ec4899' },   // pink
];

/** UBATCH_COLORS for distinguishing ubatches */
const UBATCH_BORDER_COLORS = [
  '#6366f1', '#0891b2', '#d97706', '#059669', '#dc2626', '#7c3aed',
];

interface TokenInfo {
  index: number;
  seqId: number;
}

interface UbatchResult {
  tokens: TokenInfo[];
}

/** Generate the token array: tokens distributed across sequences */
function generateTokens(nTokens: number, nSequences: number): TokenInfo[] {
  const tokens: TokenInfo[] = [];
  const tokensPerSeq = Math.ceil(nTokens / nSequences);
  for (let s = 0; s < nSequences; s++) {
    const start = s * tokensPerSeq;
    const end = Math.min(start + tokensPerSeq, nTokens);
    for (let i = start; i < end; i++) {
      tokens.push({ index: i, seqId: s });
    }
  }
  return tokens.slice(0, nTokens);
}

/** split_simple: sequential chunks, ignoring sequence boundaries */
function splitSimple(tokens: TokenInfo[], nUbatch: number): UbatchResult[] {
  const results: UbatchResult[] = [];
  for (let i = 0; i < tokens.length; i += nUbatch) {
    results.push({ tokens: tokens.slice(i, i + nUbatch) });
  }
  return results;
}

/** split_equal: take equal token counts from each sequence per ubatch */
function splitEqual(tokens: TokenInfo[], nUbatch: number, nSequences: number): UbatchResult[] {
  // Group tokens by sequence
  const seqTokens: TokenInfo[][] = Array.from({ length: nSequences }, () => []);
  for (const tok of tokens) {
    seqTokens[tok.seqId].push(tok);
  }

  // Track consumed index per sequence
  const consumed = new Array(nSequences).fill(0);
  const results: UbatchResult[] = [];

  // Find sequences that still have tokens
  const hasRemaining = () => seqTokens.some((st, i) => consumed[i] < st.length);

  while (hasRemaining()) {
    // Active sequences (those with remaining tokens)
    const activeSeqs = [];
    for (let s = 0; s < nSequences; s++) {
      if (consumed[s] < seqTokens[s].length) {
        activeSeqs.push(s);
      }
    }
    if (activeSeqs.length === 0) break;

    // Equal tokens per active sequence, up to nUbatch total
    const perSeq = Math.floor(nUbatch / activeSeqs.length);
    const tokensPerSeqClamped = Math.max(perSeq, 1);

    const ubatchTokens: TokenInfo[] = [];
    for (const s of activeSeqs) {
      const available = seqTokens[s].length - consumed[s];
      const take = Math.min(tokensPerSeqClamped, available);
      for (let j = 0; j < take; j++) {
        ubatchTokens.push(seqTokens[s][consumed[s] + j]);
      }
      consumed[s] += take;
    }

    if (ubatchTokens.length > 0) {
      results.push({ tokens: ubatchTokens });
    }
  }

  return results;
}

/** split_seq: each ubatch contains tokens from only one sequence */
function splitSeq(tokens: TokenInfo[], nUbatch: number, nSequences: number): UbatchResult[] {
  // Group tokens by sequence
  const seqTokens: TokenInfo[][] = Array.from({ length: nSequences }, () => []);
  for (const tok of tokens) {
    seqTokens[tok.seqId].push(tok);
  }

  const results: UbatchResult[] = [];
  for (let s = 0; s < nSequences; s++) {
    const st = seqTokens[s];
    for (let i = 0; i < st.length; i += nUbatch) {
      results.push({ tokens: st.slice(i, i + nUbatch) });
    }
  }

  return results;
}

type SplitMode = 'simple' | 'equal' | 'seq';

function UbatchDisplay({
  ubatches,
  nTokens,
  locale,
  maxTokensPerRow,
}: {
  ubatches: UbatchResult[];
  nTokens: number;
  locale: 'zh' | 'en';
  maxTokensPerRow: number;
}) {
  const l = t[locale];

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 mb-1">
        {l.total}: {ubatches.length} {l.ubatches}
      </div>
      {ubatches.map((ub, ubIdx) => {
        const borderColor = UBATCH_BORDER_COLORS[ubIdx % UBATCH_BORDER_COLORS.length];
        // Group tokens by seq for summary
        const seqCounts: Record<number, number> = {};
        for (const tok of ub.tokens) {
          seqCounts[tok.seqId] = (seqCounts[tok.seqId] || 0) + 1;
        }
        const seqSummary = Object.entries(seqCounts)
          .map(([s, c]) => `${l.seq}${s}: ${c}`)
          .join(', ');

        return (
          <motion.div
            key={ubIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: ubIdx * 0.05 }}
            className="rounded-lg border-2 p-2"
            style={{ borderColor }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: borderColor }}>
                {l.ubatch} {ubIdx}
              </span>
              <span className="text-xs text-gray-400">
                {ub.tokens.length} {l.tokens} ({seqSummary})
              </span>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {ub.tokens.slice(0, maxTokensPerRow).map((tok, i) => {
                const color = SEQ_COLORS[tok.seqId % SEQ_COLORS.length];
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: ubIdx * 0.03 + i * 0.002 }}
                    className="rounded text-[9px] font-mono leading-none flex items-center justify-center"
                    style={{
                      backgroundColor: color.bg,
                      border: `1px solid ${color.border}`,
                      color: color.text,
                      width: '22px',
                      height: '18px',
                    }}
                    title={`token ${tok.index}, ${l.seq} ${tok.seqId}`}
                  >
                    {tok.index}
                  </motion.div>
                );
              })}
              {ub.tokens.length > maxTokensPerRow && (
                <span className="text-xs text-gray-400 self-center ml-1">
                  +{ub.tokens.length - maxTokensPerRow}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function LlamaCppBatchSplitVisualizer({ locale = 'zh' }: BatchSplitVisualizerProps) {
  const l = t[locale];
  const [nTokens, setNTokens] = useState(1500);
  const [nUbatch, setNUbatch] = useState(512);
  const [nSequences, setNSequences] = useState(1);
  const [mode, setMode] = useState<SplitMode>('simple');

  const tokens = useMemo(() => generateTokens(nTokens, nSequences), [nTokens, nSequences]);

  const ubatches = useMemo(() => {
    switch (mode) {
      case 'simple':
        return splitSimple(tokens, nUbatch);
      case 'equal':
        return splitEqual(tokens, nUbatch, nSequences);
      case 'seq':
        return splitSeq(tokens, nUbatch, nSequences);
    }
  }, [tokens, nUbatch, nSequences, mode]);

  // Limit displayed tokens per ubatch to keep rendering fast
  const maxTokensPerRow = nTokens > 1000 ? 60 : 120;

  const tabs: { key: SplitMode; label: string; desc: string }[] = [
    { key: 'simple', label: l.splitSimple, desc: l.splitSimpleDesc },
    { key: 'equal', label: l.splitEqual, desc: l.splitEqualDesc },
    { key: 'seq', label: l.splitSeq, desc: l.splitSeqDesc },
  ];

  return (
    <div className="my-6 p-4 rounded-xl border border-gray-200 bg-white">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">{l.title}</h4>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {l.nTokens}: <strong>{nTokens}</strong>
          </label>
          <input
            type="range"
            min={100}
            max={3000}
            step={50}
            value={nTokens}
            onChange={(e) => setNTokens(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {l.nUbatch}: <strong>{nUbatch}</strong>
          </label>
          <input
            type="range"
            min={64}
            max={2048}
            step={64}
            value={nUbatch}
            onChange={(e) => setNUbatch(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {l.nSequences}: <strong>{nSequences}</strong>
          </label>
          <input
            type="range"
            min={1}
            max={4}
            value={nSequences}
            onChange={(e) => setNSequences(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      {/* Sequence legend */}
      {nSequences > 1 && (
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
          {Array.from({ length: nSequences }, (_, i) => (
            <span key={i} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ backgroundColor: SEQ_COLORS[i % SEQ_COLORS.length].bar }}
              />
              {l.seq} {i}
            </span>
          ))}
        </div>
      )}

      {/* Algorithm tabs */}
      <div className="flex gap-1 mb-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
              mode === tab.key
                ? 'bg-blue-50 text-blue-700 border border-b-0 border-blue-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Algorithm description */}
      <div className="text-xs text-gray-500 mb-3 italic">
        {tabs.find((tab) => tab.key === mode)?.desc}
      </div>

      {/* Ubatch visualization */}
      <UbatchDisplay
        ubatches={ubatches}
        nTokens={nTokens}
        locale={locale}
        maxTokensPerRow={maxTokensPerRow}
      />
    </div>
  );
}
