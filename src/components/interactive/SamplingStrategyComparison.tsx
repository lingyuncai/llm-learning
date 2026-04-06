// src/components/interactive/SamplingStrategyComparison.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS } from './shared/colors';

// 15 tokens with decreasing probabilities (already softmax-ed at T=1)
const TOKENS: { token: string; prob: number }[] = [
  { token: 'Paris', prob: 0.22 },
  { token: 'London', prob: 0.15 },
  { token: 'Berlin', prob: 0.11 },
  { token: 'Tokyo', prob: 0.09 },
  { token: 'Rome', prob: 0.07 },
  { token: 'Madrid', prob: 0.06 },
  { token: 'Seoul', prob: 0.05 },
  { token: 'Oslo', prob: 0.04 },
  { token: 'Lima', prob: 0.04 },
  { token: 'Cairo', prob: 0.03 },
  { token: 'Baku', prob: 0.03 },
  { token: 'Kiev', prob: 0.03 },
  { token: 'Doha', prob: 0.03 },
  { token: 'Fiji', prob: 0.03 },
  { token: 'Laos', prob: 0.02 },
];

function ColumnChart({ title, tokens, kept, color, note, keepLabel }: {
  title: string;
  tokens: typeof TOKENS;
  kept: boolean[];
  color: string;
  note: string;
  keepLabel: string;
}) {
  const keptCount = kept.filter(Boolean).length;
  const totalKeptProb = tokens.reduce((s, t, i) => kept[i] ? s + t.prob : s, 0);

  return (
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold text-center mb-1" style={{ color }}>{title}</div>
      <div className="space-y-0.5">
        {tokens.map((t, i) => {
          const isKept = kept[i];
          const normalizedProb = isKept ? t.prob / totalKeptProb : 0;
          const barW = isKept ? normalizedProb * 100 : 0;
          return (
            <div key={i} className="flex items-center gap-1 h-4">
              <span className={`text-[9px] font-mono w-8 text-right ${isKept ? 'text-gray-700' : 'text-gray-300'}`}>
                {t.token}
              </span>
              <div className="flex-1 h-3 bg-gray-50 rounded-sm overflow-hidden relative">
                <motion.div
                  className="h-full rounded-sm"
                  style={{ backgroundColor: isKept ? color : '#e5e7eb' }}
                  animate={{ width: `${isKept ? Math.max(barW, 2) : t.prob * 100 * 0.3}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className={`text-[8px] font-mono w-8 ${isKept ? 'text-gray-600' : 'text-gray-300'}`}>
                {isKept ? `${(normalizedProb * 100).toFixed(1)}%` : '—'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-1.5">
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
          backgroundColor: `${color}15`,
          color,
        }}>
          {keepLabel.replace('{count}', keptCount.toString())}
        </span>
      </div>
      <div className="text-[9px] text-gray-400 text-center mt-0.5">{note}</div>
    </div>
  );
}

export default function SamplingStrategyComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      topKLabel: 'Top-k:',
      topPLabel: 'Top-p:',
      greedyTitle: 'Greedy',
      greedyNote: '只选最高概率',
      topKNote: '固定保留前 {k} 个',
      topPNote: '动态保留 {count} 个 (Σ≥{p})',
      keepTokens: '保留 {count} 个 token',
      bottomNote: 'Top-p 会根据分布的确定性动态调整保留数量 — 尖锐分布保留少、平坦分布保留多',
    },
    en: {
      topKLabel: 'Top-k:',
      topPLabel: 'Top-p:',
      greedyTitle: 'Greedy',
      greedyNote: 'Pick highest probability only',
      topKNote: 'Fixed top {k} tokens',
      topPNote: 'Dynamic {count} tokens (Σ≥{p})',
      keepTokens: 'Keep {count} tokens',
      bottomNote: 'Top-p dynamically adjusts retained count based on distribution certainty — sharp distributions keep few, flat distributions keep many',
    },
  }[locale];

  const [k, setK] = useState(5);
  const [p, setP] = useState(0.9);

  const greedyKept = TOKENS.map((_, i) => i === 0);

  const topKKept = useMemo(() => {
    return TOKENS.map((_, i) => i < k);
  }, [k]);

  const topPKept = useMemo(() => {
    let cumProb = 0;
    return TOKENS.map(t => {
      if (cumProb >= p) return false;
      cumProb += t.prob;
      return true;
    });
  }, [p]);

  const topPCount = topPKept.filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            {t.topKLabel} <span className="font-mono font-bold" style={{ color: COLORS.orange }}>{k}</span>
          </label>
          <input type="range" min={1} max={15} step={1} value={k}
            onChange={e => setK(parseInt(e.target.value))} className="flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            {t.topPLabel} <span className="font-mono font-bold" style={{ color: COLORS.purple }}>{p.toFixed(2)}</span>
          </label>
          <input type="range" min={0.5} max={1.0} step={0.05} value={p}
            onChange={e => setP(parseFloat(e.target.value))} className="flex-1" />
        </div>
      </div>

      {/* Three columns */}
      <div className="flex gap-3 border border-gray-200 rounded-lg p-3 bg-white">
        <ColumnChart
          title={t.greedyTitle}
          tokens={TOKENS}
          kept={greedyKept}
          color={COLORS.primary}
          note={t.greedyNote}
          keepLabel={t.keepTokens}
        />
        <div className="w-px bg-gray-200" />
        <ColumnChart
          title={`Top-k (k=${k})`}
          tokens={TOKENS}
          kept={topKKept}
          color={COLORS.orange}
          note={t.topKNote.replace('{k}', k.toString())}
          keepLabel={t.keepTokens}
        />
        <div className="w-px bg-gray-200" />
        <ColumnChart
          title={`Top-p (p=${p.toFixed(2)})`}
          tokens={TOKENS}
          kept={topPKept}
          color={COLORS.purple}
          note={t.topPNote.replace('{count}', topPCount.toString()).replace('{p}', p.toString())}
          keepLabel={t.keepTokens}
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        {t.bottomNote}
      </p>
    </div>
  );
}
