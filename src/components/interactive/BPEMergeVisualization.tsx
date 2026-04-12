import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 420;

// BPE algorithm: step-by-step merge
interface BPEState {
  tokens: string[];
  merges: { pair: [string, string]; freq: number; merged: string }[];
  pairFreqs: Map<string, number>;
}

function computePairFreqs(tokens: string[]): Map<string, number> {
  const freqs = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const key = `${tokens[i]}|${tokens[i + 1]}`;
    freqs.set(key, (freqs.get(key) || 0) + 1);
  }
  return freqs;
}

function getTopPair(freqs: Map<string, number>): [string, string] | null {
  let best: [string, string] | null = null;
  let bestFreq = 0;
  for (const [key, freq] of freqs) {
    if (freq > bestFreq) {
      bestFreq = freq;
      const [a, b] = key.split('|');
      best = [a, b];
    }
  }
  return best;
}

function applyMerge(tokens: string[], pair: [string, string]): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (i < tokens.length - 1 && tokens[i] === pair[0] && tokens[i + 1] === pair[1]) {
      result.push(pair[0] + pair[1]);
      i += 2;
    } else {
      result.push(tokens[i]);
      i++;
    }
  }
  return result;
}

const TOKEN_COLORS = [
  COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple,
  COLORS.red, '#00838f', '#4527a0', '#ef6c00',
  '#1565c0', '#2e7d32', '#e65100', '#6a1b9a',
];

export default function BPEMergeVisualization({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'BPE 分词可视化',
      inputLabel: '输入文本：',
      step: '步骤',
      initial: '初始字符拆分',
      nextMerge: '下一步合并',
      reset: '重置',
      pair: '字符对',
      freq: '频率',
      merged: '合并结果',
      mergeHistory: '合并历史',
      currentTokens: '当前 Token 序列',
      tokenCount: '个 token',
      done: '无更多可合并的对',
      topPair: '最高频对',
    },
    en: {
      title: 'BPE Tokenization Visualization',
      inputLabel: 'Input text:',
      step: 'Step',
      initial: 'Initial character split',
      nextMerge: 'Next Merge',
      reset: 'Reset',
      pair: 'Pair',
      freq: 'Frequency',
      merged: 'Merged',
      mergeHistory: 'Merge History',
      currentTokens: 'Current Token Sequence',
      tokenCount: 'tokens',
      done: 'No more pairs to merge',
      topPair: 'Top pair',
    },
  }[locale]!;

  const presets = [
    { label: locale === 'zh' ? 'low lowest' : 'low lowest', text: 'low lowest lower' },
    { label: locale === 'zh' ? 'hug hugging' : 'hug hugging', text: 'hug hugging hugs' },
    { label: locale === 'zh' ? 'aaabdaaabac' : 'aaabdaaabac', text: 'aaabdaaabac' },
  ];

  const [selectedPreset, setSelectedPreset] = useState(0);
  const inputText = presets[selectedPreset].text;

  const initialTokens = useMemo(() => inputText.split(''), [inputText]);

  const [step, setStep] = useState(0);

  const { history, states } = useMemo(() => {
    const history: { pair: [string, string]; freq: number; merged: string }[] = [];
    const states: { tokens: string[]; pairFreqs: Map<string, number> }[] = [];
    let tokens = [...initialTokens];
    let freqs = computePairFreqs(tokens);
    states.push({ tokens: [...tokens], pairFreqs: new Map(freqs) });

    for (let i = 0; i < 20; i++) {
      const top = getTopPair(freqs);
      if (!top || (freqs.get(`${top[0]}|${top[1]}`) || 0) < 2) break;
      const freq = freqs.get(`${top[0]}|${top[1]}`) || 0;
      history.push({ pair: top, freq, merged: top[0] + top[1] });
      tokens = applyMerge(tokens, top);
      freqs = computePairFreqs(tokens);
      states.push({ tokens: [...tokens], pairFreqs: new Map(freqs) });
    }
    return { history, states };
  }, [initialTokens]);

  const currentState = states[Math.min(step, states.length - 1)];
  const canAdvance = step < states.length - 1;

  const handleReset = () => setStep(0);
  const handleNext = () => { if (canAdvance) setStep(s => s + 1); };
  const handlePreset = (i: number) => { setSelectedPreset(i); setStep(0); };

  // Sort pair frequencies for display
  const sortedPairs = useMemo(() => {
    const entries: { pair: string; freq: number }[] = [];
    for (const [key, freq] of currentState.pairFreqs) {
      entries.push({ pair: key.replace('|', ''), freq });
    }
    entries.sort((a, b) => b.freq - a.freq);
    return entries.slice(0, 8);
  }, [currentState]);

  // Current highlight pair
  const highlightPair = canAdvance ? history[step] : null;

  // Token box layout
  const tokenBoxH = 32;
  const tokenGap = 4;
  const tokenStartY = 80;
  const tokenStartX = 30;
  const maxTokenW = 60;

  // Measure token widths
  const tokenLayouts = useMemo(() => {
    let x = tokenStartX;
    return currentState.tokens.map((tok, i) => {
      const w = Math.max(24, Math.min(maxTokenW, tok.length * 12 + 12));
      const layout = { x, y: tokenStartY, w, h: tokenBoxH, token: tok };
      x += w + tokenGap;
      return layout;
    });
  }, [currentState.tokens]);

  // Total width check — if overflows, we wrap
  const wrapThreshold = W - 220;

  const wrappedLayouts = useMemo(() => {
    const rows: typeof tokenLayouts[] = [[]];
    let x = tokenStartX;
    let row = 0;
    for (const tl of tokenLayouts) {
      if (x + tl.w > wrapThreshold && rows[row].length > 0) {
        row++;
        rows.push([]);
        x = tokenStartX;
      }
      rows[row].push({ ...tl, x, y: tokenStartY + row * (tokenBoxH + 8) });
      x += tl.w + tokenGap;
    }
    return rows.flat();
  }, [tokenLayouts]);

  const tableStartX = W - 200;
  const tableStartY = 60;

  return (
    <div className="my-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <span className="text-sm font-medium text-gray-600">{t.inputLabel}</span>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => handlePreset(i)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: selectedPreset === i ? COLORS.primary : '#f1f5f9',
              color: selectedPreset === i ? '#fff' : '#475569',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title area */}
        <text x={W / 2 - 100} y={30} fontSize="14" fontWeight="600" fill={COLORS.dark}>
          {t.step} {step}: {step === 0 ? t.initial : `${t.merged || ''} "${history[step - 1]?.pair.join('')}" → "${history[step - 1]?.merged}"`}
        </text>
        <text x={W / 2 - 100} y={50} fontSize="11" fill={COLORS.mid}>
          {t.currentTokens} ({currentState.tokens.length} {t.tokenCount})
        </text>

        {/* Token boxes */}
        {wrappedLayouts.map((tl, i) => {
          const isHighlight = highlightPair && i < wrappedLayouts.length - 1 &&
            tl.token === highlightPair.pair[0] && wrappedLayouts[i + 1]?.token === highlightPair.pair[1];
          const isHighlightSecond = highlightPair && i > 0 &&
            wrappedLayouts[i - 1]?.token === highlightPair.pair[0] && tl.token === highlightPair.pair[1];
          const color = TOKEN_COLORS[tl.token.length % TOKEN_COLORS.length];

          return (
            <motion.g key={`${i}-${tl.token}-${step}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
            >
              <rect
                x={tl.x} y={tl.y} width={tl.w} height={tl.h} rx={4}
                fill={(isHighlight || isHighlightSecond) ? COLORS.highlight : COLORS.bgAlt}
                stroke={(isHighlight || isHighlightSecond) ? COLORS.orange : color}
                strokeWidth={(isHighlight || isHighlightSecond) ? 2 : 1.2}
              />
              <text
                x={tl.x + tl.w / 2} y={tl.y + tl.h / 2 + 4}
                textAnchor="middle" fontSize="11" fontFamily={FONTS.mono}
                fill={COLORS.dark}
              >
                {tl.token}
              </text>
            </motion.g>
          );
        })}

        {/* Pair frequency table */}
        <text x={tableStartX} y={tableStartY - 10} fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.pair} → {t.freq}
        </text>
        {sortedPairs.map((entry, i) => {
          const isTop = highlightPair && entry.pair === highlightPair.pair.join('');
          return (
            <g key={entry.pair + i}>
              <rect
                x={tableStartX} y={tableStartY + i * 24}
                width={170} height={20} rx={3}
                fill={isTop ? COLORS.highlight : (i % 2 === 0 ? '#f8fafc' : '#ffffff')}
                stroke={isTop ? COLORS.orange : '#e2e8f0'}
                strokeWidth={isTop ? 1.5 : 0.5}
              />
              <text
                x={tableStartX + 8} y={tableStartY + i * 24 + 14}
                fontSize="10" fontFamily={FONTS.mono} fill={COLORS.dark}
              >
                "{entry.pair}"
              </text>
              <text
                x={tableStartX + 140} y={tableStartY + i * 24 + 14}
                fontSize="10" fontFamily={FONTS.mono} fill={COLORS.primary}
                textAnchor="end"
              >
                {entry.freq}
              </text>
            </g>
          );
        })}

        {/* Merge history */}
        <text x={30} y={tokenStartY + (wrappedLayouts.length > 0 ? Math.max(...wrappedLayouts.map(l => l.y)) - tokenStartY + tokenBoxH + 30 : 60)} fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.mergeHistory}
        </text>
        {history.slice(0, step).map((m, i) => {
          const baseY = tokenStartY + (wrappedLayouts.length > 0 ? Math.max(...wrappedLayouts.map(l => l.y)) - tokenStartY + tokenBoxH + 48 : 78);
          return (
            <motion.g key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <text
                x={30 + (i % 4) * 170} y={baseY + Math.floor(i / 4) * 20}
                fontSize="10" fontFamily={FONTS.mono} fill={COLORS.mid}
              >
                {i + 1}. "{m.pair[0]}" + "{m.pair[1]}" → "{m.merged}" ({m.freq}x)
              </text>
            </motion.g>
          );
        })}

        {/* Buttons */}
        <g style={{ cursor: 'pointer' }} onClick={handleNext}>
          <rect x={W / 2 - 110} y={H - 50} width={100} height={32} rx={6}
            fill={canAdvance ? COLORS.primary : COLORS.light}
            opacity={canAdvance ? 1 : 0.5}
          />
          <text x={W / 2 - 60} y={H - 30} textAnchor="middle" fontSize="12"
            fill="#fff" fontWeight="600">
            {canAdvance ? t.nextMerge : t.done}
          </text>
        </g>
        <g style={{ cursor: 'pointer' }} onClick={handleReset}>
          <rect x={W / 2 + 10} y={H - 50} width={80} height={32} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1}
          />
          <text x={W / 2 + 50} y={H - 30} textAnchor="middle" fontSize="12"
            fill={COLORS.mid} fontWeight="500">
            {t.reset}
          </text>
        </g>
      </svg>
    </div>
  );
}
