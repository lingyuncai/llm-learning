// src/components/interactive/CausalMaskDemo.tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { seededValuesSigned } from '../primitives/mathUtils';
import { COLORS } from './shared/colors';

const N = 5;
const TOKENS = ['The', 'cat', 'sat', 'on', 'it'];

function Grid({ data, format, colorFn, label }: {
  data: (number | string)[][];
  format?: (v: number | string) => string;
  colorFn: (r: number, c: number, v: number | string) => string;
  label: string;
}) {
  const cellSize = 44;
  const labelW = 36;
  const labelH = 24;
  const svgW = labelW + N * cellSize;
  const svgH = labelH + N * cellSize;
  const fmt = format || ((v: number | string) => typeof v === 'number' ? v.toFixed(2) : String(v));

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[280px]">
        {TOKENS.map((t, j) => (
          <text key={`c${j}`} x={labelW + j * cellSize + cellSize / 2} y={labelH - 4}
            textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
        ))}
        {TOKENS.map((t, i) => (
          <text key={`r${i}`} x={labelW - 4} y={labelH + i * cellSize + cellSize / 2 + 3}
            textAnchor="end" fontSize="9" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
        ))}
        {data.map((row, i) =>
          row.map((v, j) => (
            <g key={`${i}-${j}`}>
              <rect x={labelW + j * cellSize} y={labelH + i * cellSize}
                width={cellSize} height={cellSize}
                fill={colorFn(i, j, v)} stroke="#d1d5db" strokeWidth={0.5} />
              <text x={labelW + j * cellSize + cellSize / 2} y={labelH + i * cellSize + cellSize / 2 + 4}
                textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily="monospace">
                {fmt(v)}
              </text>
            </g>
          ))
        )}
      </svg>
    </div>
  );
}

export default function CausalMaskDemo({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '原始 QKᵀ 分数矩阵',
      step1Desc: '原始点积分数 — 每个格子表示 token i 对 token j 的原始相关性。',
      step1Label: 'Scores = QKᵀ/√d_k',
      step2Title: '应用因果遮罩 (上三角 → -∞)',
      step2Desc: '上三角位置（未来 token）设为',
      step2Note: '用浅红标记被遮罩的位置。',
      step2Note2: '每个 token 只能看到自己和之前的 token',
      step2Label: 'Masked Scores',
      step3Title: 'Softmax → 注意力权重',
      step3Desc: 'Softmax 后：上三角变为',
      step3Note: '（灰色），下三角归一化为概率（每行和为 1.0）。',
      step3Label: 'Attention Weights',
      rowSum: '行',
      sumLabel: '总和',
    },
    en: {
      step1Title: 'Raw QKᵀ Score Matrix',
      step1Desc: 'Raw dot product scores — each cell shows token i\'s raw relevance to token j.',
      step1Label: 'Scores = QKᵀ/√d_k',
      step2Title: 'Apply Causal Mask (upper triangle → -∞)',
      step2Desc: 'Upper triangle positions (future tokens) set to',
      step2Note: 'masked positions marked in light red.',
      step2Note2: 'Each token can only see itself and previous tokens',
      step2Label: 'Masked Scores',
      step3Title: 'Softmax → Attention Weights',
      step3Desc: 'After softmax: upper triangle becomes',
      step3Note: '(gray), lower triangle normalized to probabilities (each row sums to 1.0).',
      step3Label: 'Attention Weights',
      rowSum: 'Row',
      sumLabel: 'sum',
    },
  }[locale];
  const rawScores = useMemo(() => {
    const flat = seededValuesSigned(N, N, 77);
    return flat.map(row => row.map(v => parseFloat((v * 3).toFixed(2))));
  }, []);

  const maskedScores = useMemo(() =>
    rawScores.map((row, i) =>
      row.map((v, j) => j <= i ? v : '-∞')
    ), [rawScores]);

  const softmaxResult = useMemo(() =>
    rawScores.map((row, i) => {
      const validScores = row.slice(0, i + 1);
      const max = Math.max(...validScores);
      const exps = validScores.map(v => Math.exp(v - max));
      const sum = exps.reduce((a, b) => a + b, 0);
      const probs = exps.map(e => parseFloat((e / sum).toFixed(2)));
      return [...probs, ...Array(N - i - 1).fill(0)];
    }), [rawScores]);

  const steps = [
    {
      title: t.step1Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step1Desc}
          </p>
          <Grid data={rawScores} label={t.step1Label}
            colorFn={(r, c, v) => {
              const val = typeof v === 'number' ? v : 0;
              const t = (val + 3) / 6;
              return `rgba(59, 130, 246, ${0.1 + t * 0.5})`;
            }}
          />
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step2Desc} <code className="bg-gray-100 px-1 rounded">-∞</code>，
            {t.step2Note}
          </p>
          <Grid data={maskedScores} label={t.step2Label}
            format={v => typeof v === 'number' ? v.toFixed(2) : String(v)}
            colorFn={(r, c, v) => {
              if (c > r) return COLORS.waste;
              const val = typeof v === 'number' ? v : 0;
              const t = (val + 3) / 6;
              return `rgba(59, 130, 246, ${0.1 + t * 0.5})`;
            }}
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            {t.step2Note2}
          </p>
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step3Desc} <strong>0.00</strong>{t.step3Note}
          </p>
          <Grid data={softmaxResult} label={t.step3Label}
            colorFn={(r, c, v) => {
              const val = typeof v === 'number' ? v : 0;
              if (c > r) return COLORS.masked;
              return `rgba(59, 130, 246, ${0.1 + val * 0.7})`;
            }}
          />
          <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-500">
            {softmaxResult.map((row, i) => (
              <span key={i}>{t.rowSum}{i + 1}{t.sumLabel}: {row.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0).toFixed(2)}</span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
