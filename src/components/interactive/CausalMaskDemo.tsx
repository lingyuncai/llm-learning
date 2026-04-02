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

export default function CausalMaskDemo() {
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
      title: '原始 QKᵀ 分数矩阵',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            原始点积分数 — 每个格子表示 token i 对 token j 的原始相关性。
          </p>
          <Grid data={rawScores} label="Scores = QKᵀ/√d_k"
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
      title: '应用因果遮罩 (上三角 → -∞)',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            上三角位置（未来 token）设为 <code className="bg-gray-100 px-1 rounded">-∞</code>，
            用浅红标记被遮罩的位置。
          </p>
          <Grid data={maskedScores} label="Masked Scores"
            format={v => typeof v === 'number' ? v.toFixed(2) : String(v)}
            colorFn={(r, c, v) => {
              if (c > r) return COLORS.waste;
              const val = typeof v === 'number' ? v : 0;
              const t = (val + 3) / 6;
              return `rgba(59, 130, 246, ${0.1 + t * 0.5})`;
            }}
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            每个 token 只能看到自己和之前的 token
          </p>
        </div>
      ),
    },
    {
      title: 'Softmax → 注意力权重',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Softmax 后：上三角变为 <strong>0.00</strong>（灰色），
            下三角归一化为概率（每行和为 1.0）。
          </p>
          <Grid data={softmaxResult} label="Attention Weights"
            colorFn={(r, c, v) => {
              const val = typeof v === 'number' ? v : 0;
              if (c > r) return COLORS.masked;
              return `rgba(59, 130, 246, ${0.1 + val * 0.7})`;
            }}
          />
          <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-500">
            {softmaxResult.map((row, i) => (
              <span key={i}>行{i + 1}总和: {row.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0).toFixed(2)}</span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
