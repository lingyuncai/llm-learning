// src/components/interactive/LlamaCppSamplerChainVisualizer.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ------------------------------------------------------------------ */
/*  i18n                                                               */
/* ------------------------------------------------------------------ */
const translations = {
  zh: {
    title: 'llama.cpp Sampler Chain 可视化',
    subtitle: '观察 logits 如何依次经过各 sampler 被过滤和变换',
    step: '步骤',
    of: '/',
    prev: '上一步',
    next: '下一步',
    reset: '重置',
    token: 'Token',
    prob: '概率',
    logit: 'Logit',
    eliminated: '已淘汰',
    selected: '采样结果',

    /* sampler names */
    samplerInitial: '初始 Logits',
    samplerTopK: 'top-k (k=5)',
    samplerTopP: 'top-p (p=0.90)',
    samplerMinP: 'min-p (p=0.05)',
    samplerTemp: 'temperature (T=0.8)',
    samplerDist: 'dist (采样)',

    /* sampler descriptions */
    descInitial:
      '模型输出的原始 logits — 对词表中每个 token 的未归一化分数。这里展示 12 个代表性 token。',
    descTopK:
      'top-k: 只保留 logit 值最高的 k=5 个 token，其余 token 的 logit 设为 -inf（概率归零）。这是最简单粗暴的截断。',
    descTopP:
      'top-p (nucleus): 将 token 按概率从高到低排序，保留累计概率刚好达到 p=0.90 的最小集合，其余归零。动态调整候选数量。',
    descMinP:
      'min-p: 去除概率低于 max_prob × p 的 token（p=0.05）。当最高概率为 0.35 时，阈值 = 0.35 × 0.05 = 0.0175。',
    descTemp:
      'temperature: 将所有存活 token 的 logit 除以 T=0.8（T<1 使分布更尖锐，高概率 token 更突出），然后重新 softmax。',
    descDist:
      'dist: 最终采样阶段 — 按概率加权随机选择一个 token 作为输出。高亮的 token 即本次采样结果。',
  },
  en: {
    title: 'llama.cpp Sampler Chain Visualizer',
    subtitle: 'Watch logits pass through each sampler, getting filtered and transformed',
    step: 'Step',
    of: '/',
    prev: 'Previous',
    next: 'Next',
    reset: 'Reset',
    token: 'Token',
    prob: 'Prob',
    logit: 'Logit',
    eliminated: 'eliminated',
    selected: 'sampled',

    samplerInitial: 'Initial Logits',
    samplerTopK: 'top-k (k=5)',
    samplerTopP: 'top-p (p=0.90)',
    samplerMinP: 'min-p (p=0.05)',
    samplerTemp: 'temperature (T=0.8)',
    samplerDist: 'dist (sample)',

    descInitial:
      'Raw logits from the model — unnormalized scores for each token in the vocabulary. Here we show 12 representative tokens.',
    descTopK:
      'top-k: Keep only the k=5 tokens with the highest logit values, set the rest to -inf (probability zero). The simplest truncation method.',
    descTopP:
      'top-p (nucleus): Sort tokens by probability descending, keep the smallest set whose cumulative probability just reaches p=0.90, zero out the rest. Dynamically adjusts candidate count.',
    descMinP:
      'min-p: Remove tokens with probability below max_prob × p (p=0.05). When max prob is 0.35, threshold = 0.35 × 0.05 = 0.0175.',
    descTemp:
      'temperature: Divide all surviving logits by T=0.8 (T<1 sharpens the distribution, making high-probability tokens more prominent), then re-softmax.',
    descDist:
      'dist: Final sampling stage — randomly select one token weighted by probability. The highlighted token is the sampling result.',
  },
};

/* ------------------------------------------------------------------ */
/*  Synthetic initial data                                             */
/* ------------------------------------------------------------------ */
interface TokenEntry {
  label: string;
  logit: number;
}

const INITIAL_TOKENS: TokenEntry[] = [
  { label: 'The',   logit: 4.2 },
  { label: 'Hello', logit: 3.8 },
  { label: 'I',     logit: 3.5 },
  { label: 'It',    logit: 3.1 },
  { label: 'We',    logit: 2.7 },
  { label: ',',     logit: 2.3 },
  { label: '.',     logit: 1.8 },
  { label: 'A',     logit: 1.4 },
  { label: 'In',    logit: 0.9 },
  { label: '"',     logit: 0.5 },
  { label: 'But',   logit: 0.1 },
  { label: 'So',    logit: -0.3 },
];

/* ------------------------------------------------------------------ */
/*  Math helpers                                                       */
/* ------------------------------------------------------------------ */
function softmax(logits: number[]): number[] {
  const max = Math.max(...logits.filter(l => l > -1e6));
  const exps = logits.map(l => (l > -1e6 ? Math.exp(l - max) : 0));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => (sum > 0 ? e / sum : 0));
}

/* ------------------------------------------------------------------ */
/*  Sampler chain pipeline                                             */
/* ------------------------------------------------------------------ */
interface StepState {
  logits: number[];       // logit values (-Infinity for eliminated)
  probs: number[];        // probabilities after softmax of surviving tokens
  eliminated: boolean[];  // true if token is out of the running
  selectedIdx: number;    // -1 until final sampling step
}

function computeChain(tokens: TokenEntry[]): StepState[] {
  const states: StepState[] = [];

  // Helper: build StepState from logits array
  const snap = (logits: number[], selectedIdx = -1): StepState => {
    const eliminated = logits.map(l => l <= -1e6);
    const probs = softmax(logits);
    return { logits: [...logits], probs, eliminated, selectedIdx };
  };

  // Step 0 — Initial logits
  let logits = tokens.map(t => t.logit);
  states.push(snap(logits));

  // Step 1 — top-k (k=5)
  {
    const sorted = logits
      .map((l, i) => ({ l, i }))
      .sort((a, b) => b.l - a.l);
    const keep = new Set(sorted.slice(0, 5).map(x => x.i));
    logits = logits.map((l, i) => (keep.has(i) ? l : -Infinity));
    states.push(snap(logits));
  }

  // Step 2 — top-p (p=0.90)
  {
    const probs = softmax(logits);
    const indexed = probs
      .map((p, i) => ({ p, i }))
      .filter(x => x.p > 0)
      .sort((a, b) => b.p - a.p);
    let cumulative = 0;
    const keep = new Set<number>();
    for (const item of indexed) {
      keep.add(item.i);
      cumulative += item.p;
      if (cumulative >= 0.90) break;
    }
    logits = logits.map((l, i) => (keep.has(i) ? l : -Infinity));
    states.push(snap(logits));
  }

  // Step 3 — min-p (p=0.05)
  {
    const probs = softmax(logits);
    const maxProb = Math.max(...probs);
    const threshold = maxProb * 0.05;
    logits = logits.map((l, i) => (probs[i] >= threshold ? l : -Infinity));
    states.push(snap(logits));
  }

  // Step 4 — temperature (T=0.8)
  {
    const temp = 0.8;
    logits = logits.map(l => (l > -1e6 ? l / temp : -Infinity));
    states.push(snap(logits));
  }

  // Step 5 — dist (deterministic pseudo-random selection)
  // Use a simple deterministic pick: choose token with highest prob
  // (simulates sampling; in practice this is random, but for demo reproducibility we pick top)
  {
    const probs = softmax(logits);
    // Deterministic "random" pick: weighted selection with fixed seed-like approach
    // We'll pick "The" (index 0) which has the highest probability throughout
    let bestIdx = 0;
    let bestProb = 0;
    probs.forEach((p, i) => {
      if (p > bestProb) {
        bestProb = p;
        bestIdx = i;
      }
    });
    states.push(snap(logits, bestIdx));
  }

  return states;
}

/* ------------------------------------------------------------------ */
/*  Sampler metadata per step                                          */
/* ------------------------------------------------------------------ */
type LocaleKey = 'zh' | 'en';

function stepMeta(locale: LocaleKey) {
  const l = translations[locale];
  return [
    { name: l.samplerInitial, desc: l.descInitial, color: '#6366f1' },
    { name: l.samplerTopK,    desc: l.descTopK,    color: '#0891b2' },
    { name: l.samplerTopP,    desc: l.descTopP,    color: '#059669' },
    { name: l.samplerMinP,    desc: l.descMinP,    color: '#d97706' },
    { name: l.samplerTemp,    desc: l.descTemp,    color: '#dc2626' },
    { name: l.samplerDist,    desc: l.descDist,    color: '#7c3aed' },
  ];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface Props {
  locale?: 'zh' | 'en';
}

export default function LlamaCppSamplerChainVisualizer({ locale = 'zh' }: Props) {
  const l = translations[locale];
  const meta = useMemo(() => stepMeta(locale), [locale]);
  const chain = useMemo(() => computeChain(INITIAL_TOKENS), []);
  const [step, setStep] = useState(0);
  const totalSteps = chain.length;
  const state = chain[step];
  const currentMeta = meta[step];

  const maxProb = Math.max(...state.probs, 1e-9);

  const goPrev = () => setStep(s => Math.max(0, s - 1));
  const goNext = () => setStep(s => Math.min(totalSteps - 1, s + 1));
  const goReset = () => setStep(0);

  /* chain progress dots */
  const chainDots = meta.map((m, i) => {
    const isActive = i === step;
    const isPast = i < step;
    return (
      <button
        key={i}
        onClick={() => setStep(i)}
        className="flex items-center gap-1 group"
        aria-label={`${l.step} ${i + 1}: ${m.name}`}
        aria-current={isActive ? 'step' : undefined}
      >
        <span
          className="w-2.5 h-2.5 rounded-full transition-all duration-200"
          style={{
            backgroundColor: isActive || isPast ? m.color : '#d1d5db',
            boxShadow: isActive ? `0 0 0 3px ${m.color}33` : 'none',
            transform: isActive ? 'scale(1.3)' : 'scale(1)',
          }}
        />
        <span
          className={`text-[10px] font-medium transition-colors hidden sm:inline ${
            isActive ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        >
          {m.name}
        </span>
      </button>
    );
  });

  return (
    <div className="my-6 p-4 rounded-xl border border-gray-200 bg-white">
      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-700 mb-1">{l.title}</h4>
      <p className="text-xs text-gray-500 mb-4">{l.subtitle}</p>

      {/* Chain progress */}
      <div className="flex items-center gap-3 flex-wrap mb-4 px-1">{chainDots}</div>

      {/* Current step header */}
      <div className="mb-3 flex items-baseline gap-2">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: currentMeta.color }}
        >
          {l.step} {step + 1}{l.of}{totalSteps}
        </span>
        <span className="text-sm font-semibold text-gray-700">{currentMeta.name}</span>
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          className="text-xs text-gray-500 mb-4 leading-relaxed"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {currentMeta.desc}
        </motion.p>
      </AnimatePresence>

      {/* Bar chart */}
      <div className="space-y-1.5 mb-4">
        {INITIAL_TOKENS.map((tok, i) => {
          const prob = state.probs[i];
          const isEliminated = state.eliminated[i];
          const isSelected = state.selectedIdx === i;
          const barWidth = maxProb > 0 ? (prob / maxProb) * 100 : 0;

          return (
            <div
              key={tok.label}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors duration-200 ${
                isSelected
                  ? 'bg-purple-50 ring-2 ring-purple-400'
                  : isEliminated
                    ? 'bg-gray-50'
                    : 'bg-white'
              }`}
            >
              {/* Token label */}
              <span
                className={`w-12 text-right font-mono text-xs font-semibold shrink-0 ${
                  isEliminated
                    ? 'text-gray-300 line-through'
                    : isSelected
                      ? 'text-purple-700'
                      : 'text-gray-700'
                }`}
              >
                {tok.label}
              </span>

              {/* Bar */}
              <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden relative">
                <motion.div
                  className="h-full rounded-md"
                  initial={false}
                  animate={{
                    width: `${barWidth}%`,
                    opacity: isEliminated ? 0.15 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{
                    backgroundColor: isSelected
                      ? '#7c3aed'
                      : isEliminated
                        ? '#9ca3af'
                        : currentMeta.color,
                  }}
                />
              </div>

              {/* Probability value */}
              <motion.span
                className={`w-14 text-right font-mono text-[11px] shrink-0 ${
                  isEliminated
                    ? 'text-gray-300'
                    : isSelected
                      ? 'text-purple-700 font-bold'
                      : 'text-gray-600'
                }`}
                initial={false}
                animate={{ opacity: isEliminated ? 0.4 : 1 }}
              >
                {isEliminated
                  ? `(${l.eliminated})`
                  : `${(prob * 100).toFixed(1)}%`}
              </motion.span>

              {/* Selected badge */}
              {isSelected && (
                <motion.span
                  className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.15 }}
                >
                  {l.selected}
                </motion.span>
              )}
            </div>
          );
        })}
      </div>

      {/* Logit values reference (collapsed for initial & temperature steps) */}
      {(step === 0 || step === 4) && (
        <motion.details
          className="mb-4 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <summary className="cursor-pointer hover:text-gray-600">
            {l.logit} {locale === 'zh' ? '值详情' : 'values'}
          </summary>
          <div className="mt-1 font-mono grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-0.5 pl-4">
            {INITIAL_TOKENS.map((tok, i) => (
              <span key={tok.label} className={state.eliminated[i] ? 'text-gray-300' : ''}>
                {tok.label}: {state.logits[i] > -1e6 ? state.logits[i].toFixed(2) : '-inf'}
              </span>
            ))}
          </div>
        </motion.details>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={goReset}
          disabled={step === 0}
          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-opacity"
        >
          {l.reset}
        </button>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
          >
            {l.prev}
          </button>
          <button
            onClick={goNext}
            disabled={step === totalSteps - 1}
            className="px-3 py-1 text-xs text-white rounded-lg hover:opacity-90 disabled:opacity-30 transition-all"
            style={{ backgroundColor: currentMeta.color }}
          >
            {l.next}
          </button>
        </div>
      </div>
    </div>
  );
}
