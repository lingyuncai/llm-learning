import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 350;
const ROWS = 8;
const COLS = 8;

const WEIGHT_MATRIX = [
  [0.23, -0.87, 0.45, -0.12, 0.91, -0.34, 0.67, -0.55],
  [0.11, -0.99, 0.38, -0.63, 0.82, -0.47, 0.15, -0.73],
  [3.45, -2.89, 3.12, -2.67, 3.78, -2.34, 3.56, -2.91],
  [0.33, -0.61, 0.72, -0.18, 0.88, -0.42, 0.59, -0.95],
  [0.08, -0.21, 0.14, -0.07, 0.19, -0.15, 0.11, -0.23],
  [0.56, -0.29, 0.94, -0.08, 0.41, -0.86, 0.78, -0.45],
  [-1.92, 1.78, -1.56, 1.34, -1.89, 1.67, -1.45, 1.23],
  [0.38, -0.67, 0.52, -0.31, 0.84, -0.19, 0.63, -0.48],
];

function quantize(val: number, scale: number): number {
  const q = Math.max(-8, Math.min(7, Math.round(val / scale)));
  return q * scale;
}

export default function GranularityCompare() {
  const [groupSize, setGroupSize] = useState(4);

  const results = useMemo(() => {
    const flat = WEIGHT_MATRIX.flat();

    const tensorScale = Math.max(...flat.map(Math.abs)) / 7;
    const tensorErrors = WEIGHT_MATRIX.map(row =>
      row.map(w => Math.abs(w - quantize(w, tensorScale)))
    );
    const tensorMSE = flat.reduce((s, w) =>
      s + (w - quantize(w, tensorScale)) ** 2, 0) / flat.length;

    const channelErrors = WEIGHT_MATRIX.map(row => {
      const s = Math.max(...row.map(Math.abs)) / 7;
      return row.map(w => Math.abs(w - quantize(w, s)));
    });
    const channelMSE = WEIGHT_MATRIX.flatMap(row => {
      const s = Math.max(...row.map(Math.abs)) / 7;
      return row.map(w => (w - quantize(w, s)) ** 2);
    }).reduce((a, b) => a + b, 0) / flat.length;

    const groupErrors = WEIGHT_MATRIX.map(row => {
      const errs: number[] = [];
      for (let g = 0; g < row.length; g += groupSize) {
        const group = row.slice(g, g + groupSize);
        const s = Math.max(...group.map(Math.abs)) / 7;
        group.forEach(w => errs.push(Math.abs(w - quantize(w, s))));
      }
      return errs;
    });
    const groupMSE = groupErrors.flat().reduce((a, b) => a + b * b, 0) / flat.length;

    return { tensorErrors, channelErrors, groupErrors, tensorMSE, channelMSE, groupMSE };
  }, [groupSize]);

  const maxError = Math.max(
    ...results.tensorErrors.flat(),
    ...results.channelErrors.flat(),
    ...results.groupErrors.flat(),
    0.001
  );

  function errorColor(err: number): string {
    const ratio = err / maxError;
    if (ratio < 0.2) return '#c8e6c9';
    if (ratio < 0.5) return '#fff9c4';
    return '#ffcdd2';
  }

  const cellSize = 18;
  const matrixW = COLS * cellSize;
  const gap = 22;
  const totalW = 3 * matrixW + 2 * gap;
  const offsetBase = (W - totalW) / 2;
  const offsets = [offsetBase, offsetBase + matrixW + gap, offsetBase + 2 * (matrixW + gap)];
  const startY = 55;

  function renderMatrix(errors: number[][], ox: number) {
    return errors.map((row, r) =>
      row.map((err, c) => (
        <rect key={`${r}-${c}`} x={ox + c * cellSize} y={startY + r * cellSize}
          width={cellSize - 1} height={cellSize - 1} rx={2}
          fill={errorColor(err)} stroke={COLORS.light} strokeWidth={0.5} />
      ))
    );
  }

  const labels = ['Per-Tensor', 'Per-Channel', `Per-Group (${groupSize})`];
  const mses = [results.tensorMSE, results.channelMSE, results.groupMSE];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        量化粒度对比 — 误差热力图
      </text>

      {[0, 1, 2].map(col => (
        <g key={col}>
          <text x={offsets[col] + matrixW / 2} y={48} textAnchor="middle" fontSize="9"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {labels[col]}
          </text>
          {renderMatrix(
            [results.tensorErrors, results.channelErrors, results.groupErrors][col],
            offsets[col]
          )}
          <text x={offsets[col] + matrixW / 2} y={startY + ROWS * cellSize + 16}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            MSE: {mses[col].toFixed(5)}
          </text>
        </g>
      ))}

      {/* Group size selector */}
      <text x={15} y={startY + ROWS * cellSize + 46} fontSize="8" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Group Size:</text>
      {[2, 4, 8].map((gs, i) => (
        <g key={gs} onClick={() => setGroupSize(gs)} cursor="pointer">
          <rect x={100 + i * 55} y={startY + ROWS * cellSize + 34} width={45} height={20}
            rx={4} fill={gs === groupSize ? COLORS.primary : COLORS.bgAlt}
            stroke={COLORS.primary} strokeWidth={1} />
          <text x={122 + i * 55} y={startY + ROWS * cellSize + 48} textAnchor="middle"
            fontSize="8" fontWeight="600"
            fill={gs === groupSize ? '#fff' : COLORS.primary}
            fontFamily={FONTS.sans}>{gs}</text>
        </g>
      ))}

      {/* Legend */}
      {[
        { label: '低误差', color: '#c8e6c9' },
        { label: '中等', color: '#fff9c4' },
        { label: '高误差', color: '#ffcdd2' },
      ].map((item, i) => (
        <g key={item.label}>
          <rect x={350 + i * 70} y={startY + ROWS * cellSize + 34}
            width={12} height={12} rx={2} fill={item.color} />
          <text x={366 + i * 70} y={startY + ROWS * cellSize + 45} fontSize="7"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{item.label}</text>
        </g>
      ))}

      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
        fontFamily={FONTS.sans}>
        粒度越细 → 每组独立 scale → 误差越小 → 但 metadata 开销越大 (llama.cpp block=32)
      </text>
    </svg>
  );
}
