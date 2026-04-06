// src/components/interactive/ScalingFactorDemo.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';

function generateScores(dk: number, seed: number = 42): number[] {
  let s = seed;
  const next = () => {
    s = (s * 16807 + 11) % 2147483647;
    return ((s % 2000) - 1000) / 1000;
  };
  return Array.from({ length: 8 }, () => {
    let sum = 0;
    for (let i = 0; i < dk; i++) sum += next() * next();
    return parseFloat(sum.toFixed(2));
  });
}

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function entropy(probs: number[]): number {
  return -probs.reduce((acc, p) => acc + (p > 1e-10 ? p * Math.log2(p) : 0), 0);
}

function variance(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((acc, v) => acc + (v - mean) ** 2, 0) / arr.length;
}

function BarChart({ values, maxVal, color, labels, height = 120, width = 280 }: {
  values: number[]; maxVal: number; color: string;
  labels?: string[]; height?: number; width?: number;
}) {
  const barW = width / values.length - 4;
  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full">
      {values.map((v, i) => {
        const barH = maxVal > 0 ? (Math.abs(v) / maxVal) * height : 0;
        const y = v >= 0 ? height - barH : height;
        return (
          <g key={i}>
            <rect x={i * (barW + 4) + 2} y={y} width={barW} height={barH}
              fill={color} rx={2} opacity={0.8} />
            {labels && (
              <text x={i * (barW + 4) + 2 + barW / 2} y={height + 14}
                textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
      <line x1={0} y1={height} x2={width} y2={height} stroke={COLORS.light} strokeWidth={0.5} />
    </svg>
  );
}

export default function ScalingFactorDemo({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      headDim: 'Head 维度 d',
      unscaled: '未缩放: QK',
      scaled: '缩放后: QK',
      variance: '方差:',
      entropy: 'Softmax 熵:',
      bits: 'bits',
      softmaxOutput: '→ Softmax 输出',
      observation: '观察：',
      observationText: 'd越大 → 未缩放分数的方差越大 → Softmax 输出越接近 one-hot（熵趋近 0）。除以 √d后方差恢复到 ~1，Softmax 输出保持均匀分布（熵接近 {entropy} bits）。',
    },
    en: {
      headDim: 'Head dimension d',
      unscaled: 'Unscaled: QK',
      scaled: 'Scaled: QK',
      variance: 'Variance:',
      entropy: 'Softmax entropy:',
      bits: 'bits',
      softmaxOutput: '→ Softmax output',
      observation: 'Observation:',
      observationText: 'Larger d → higher variance in unscaled scores → Softmax output approaches one-hot (entropy → 0). Dividing by √d restores variance to ~1, Softmax output maintains uniform distribution (entropy ≈ {entropy} bits).',
    },
  }[locale];

  const [dk, setDk] = useState(64);

  const rawScores = useMemo(() => generateScores(dk), [dk]);
  const scaledScores = useMemo(() => rawScores.map(s => s / Math.sqrt(dk)), [rawScores, dk]);
  const rawProbs = useMemo(() => softmax(rawScores), [rawScores]);
  const scaledProbs = useMemo(() => softmax(scaledScores), [scaledScores]);

  const rawVar = variance(rawScores);
  const scaledVar = variance(scaledScores);
  const rawEntropy = entropy(rawProbs);
  const scaledEntropy = entropy(scaledProbs);

  const labels = Array.from({ length: 8 }, (_, i) => `k${i + 1}`);
  const maxScore = Math.max(...rawScores.map(Math.abs));

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.headDim}<sub>k</sub>: <strong>{dk}</strong>
        </label>
        <input type="range" min={8} max={128} step={8} value={dk}
          onChange={e => setDk(Number(e.target.value))}
          className="w-full max-w-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold text-red-700 mb-1">{t.unscaled}<sup>T</sup></div>
          <BarChart values={rawScores} maxVal={maxScore} color={COLORS.red} labels={labels} />
          <div className="text-xs text-gray-500 mt-1">
            {t.variance} {rawVar.toFixed(2)} · {t.entropy} {rawEntropy.toFixed(3)} {t.bits}
          </div>
          <div className="text-xs font-semibold text-gray-600 mt-2">{t.softmaxOutput}</div>
          <BarChart values={rawProbs} maxVal={1} color={COLORS.red} labels={labels} />
        </div>

        <div>
          <div className="text-sm font-semibold text-blue-700 mb-1">{t.scaled}<sup>T</sup> / √d<sub>k</sub></div>
          <BarChart values={scaledScores} maxVal={maxScore} color={COLORS.primary} labels={labels} />
          <div className="text-xs text-gray-500 mt-1">
            {t.variance} {scaledVar.toFixed(2)} · {t.entropy} {scaledEntropy.toFixed(3)} {t.bits}
          </div>
          <div className="text-xs font-semibold text-gray-600 mt-2">{t.softmaxOutput}</div>
          <BarChart values={scaledProbs} maxVal={1} color={COLORS.primary} labels={labels} />
        </div>
      </div>

      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <strong>{t.observation}</strong>{t.observationText.replace('{entropy}', Math.log2(8).toFixed(1))}
      </div>
    </div>
  );
}
