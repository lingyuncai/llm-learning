// src/components/interactive/TemperatureDistribution.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS } from './shared/colors';

// Fixed logits for 10 tokens
const TOKEN_DATA = [
  { token: 'Paris', logit: 5.2 },
  { token: 'London', logit: 3.8 },
  { token: 'Berlin', logit: 3.1 },
  { token: 'Tokyo', logit: 2.5 },
  { token: 'Rome', logit: 2.0 },
  { token: 'Madrid', logit: 1.5 },
  { token: 'Oslo', logit: 0.8 },
  { token: 'Lima', logit: 0.3 },
  { token: 'Baku', logit: -0.5 },
  { token: 'Fiji', logit: -1.2 },
];

function softmax(logits: number[], T: number): number[] {
  const scaled = logits.map(z => z / T);
  const maxZ = Math.max(...scaled);
  const exps = scaled.map(z => Math.exp(z - maxZ));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function entropy(probs: number[]): number {
  return -probs.reduce((sum, p) => {
    if (p > 1e-10) sum += p * Math.log2(p);
    return sum;
  }, 0);
}

export default function TemperatureDistribution({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [temp, setTemp] = useState(1.0);

  const t = {
    zh: {
      temperature: 'Temperature',
      standard: '标准',
      greedy: 'Greedy',
      uniform: '均匀',
      entropy: 'Entropy (H)',
      perplexity: 'Perplexity (2ᴴ)',
      greedyChoice: 'Greedy 选择',
      trend: 'T < 1 → 分布更尖锐（确定性高）；T > 1 → 分布更平坦（多样性高）',
    },
    en: {
      temperature: 'Temperature',
      standard: 'Standard',
      greedy: 'Greedy',
      uniform: 'Uniform',
      entropy: 'Entropy (H)',
      perplexity: 'Perplexity (2ᴴ)',
      greedyChoice: 'Greedy Choice',
      trend: 'T < 1 → Sharper distribution (high certainty); T > 1 → Flatter distribution (high diversity)',
    },
  }[locale];
  const logits = TOKEN_DATA.map(d => d.logit);
  const probs = useMemo(() => softmax(logits, temp), [temp]);
  const H = useMemo(() => entropy(probs), [probs]);
  const ppl = Math.pow(2, H);
  const maxProb = Math.max(...probs);
  const greedyIdx = probs.indexOf(maxProb);

  const svgW = 460;
  const svgH = 200;
  const padL = 10;
  const padR = 10;
  const padT = 20;
  const padB = 40;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;
  const barW = chartW / TOKEN_DATA.length * 0.7;
  const barGap = chartW / TOKEN_DATA.length;

  return (
    <div className="space-y-3">
      {/* Temperature slider */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {t.temperature}: <span className="font-mono font-bold" style={{ color: COLORS.primary }}>{temp.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={0.1}
          max={3.0}
          step={0.1}
          value={temp}
          onChange={e => setTemp(parseFloat(e.target.value))}
          className="flex-1"
        />
        <div className="flex gap-3 text-xs text-gray-500">
          <span>T→0: {t.greedy}</span>
          <span>T=1: {t.standard}</span>
          <span>T→∞: {t.uniform}</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {/* Bars */}
          {probs.map((p, i) => {
            const barH = (p / Math.max(maxProb, 0.01)) * chartH;
            const x = padL + i * barGap + (barGap - barW) / 2;
            const y = padT + chartH - barH;
            const isGreedy = i === greedyIdx;

            return (
              <g key={i}>
                <motion.rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={3}
                  fill={isGreedy ? COLORS.primary : COLORS.valid}
                  stroke={isGreedy ? COLORS.primary : '#93c5fd'}
                  strokeWidth={isGreedy ? 2 : 1}
                  animate={{ y, height: barH }}
                  transition={{ duration: 0.2 }}
                />
                {/* Probability label */}
                <motion.text
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle" fontSize="8" fontFamily="monospace"
                  fill={isGreedy ? COLORS.primary : COLORS.mid}
                  fontWeight={isGreedy ? '700' : '400'}
                  animate={{ y: y - 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {(p * 100).toFixed(1)}%
                </motion.text>
                {/* Token label */}
                <text
                  x={x + barW / 2}
                  y={padT + chartH + 14}
                  textAnchor="middle" fontSize="9" fill={COLORS.dark}
                  fontFamily="system-ui" fontWeight={isGreedy ? '700' : '400'}
                >
                  {TOKEN_DATA[i].token}
                </text>
                {/* Greedy marker */}
                {isGreedy && (
                  <text x={x + barW / 2} y={padT + chartH + 26}
                    textAnchor="middle" fontSize="7" fill={COLORS.primary}
                    fontFamily="system-ui" fontWeight="600">
                    ← Greedy
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-xs text-gray-500">{t.entropy}</div>
          <div className="font-mono font-bold" style={{ color: COLORS.orange }}>{H.toFixed(2)} bits</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">{t.perplexity}</div>
          <div className="font-mono font-bold" style={{ color: COLORS.red }}>{ppl.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">{t.greedyChoice}</div>
          <div className="font-mono font-bold" style={{ color: COLORS.primary }}>{TOKEN_DATA[greedyIdx].token}</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        {t.trend}
      </p>
    </div>
  );
}
