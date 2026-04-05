import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const ROWS = 8;
const COLS = 8;

const ACTIVATIONS = [
  [0.12, 0.03, 4.81, 0.08, 0.15, 0.02, 0.11, 0.06],
  [0.09, 0.05, 5.23, 0.11, 0.07, 0.04, 0.13, 0.08],
  [0.14, 0.02, 4.67, 0.06, 0.18, 0.03, 0.09, 0.05],
  [0.11, 0.04, 5.01, 0.09, 0.12, 0.05, 0.14, 0.07],
  [0.08, 0.06, 4.92, 0.13, 0.09, 0.02, 0.10, 0.04],
  [0.13, 0.03, 5.15, 0.07, 0.16, 0.04, 0.12, 0.06],
  [0.10, 0.05, 4.78, 0.10, 0.11, 0.03, 0.08, 0.09],
  [0.15, 0.04, 5.34, 0.08, 0.14, 0.05, 0.11, 0.07],
];

const SALIENT_COLS = new Set([2]);

export default function AWQSalientChannels() {
  const [selectedCol, setSelectedCol] = useState(2);
  const maxAct = 5.5;

  const colVals = ACTIVATIONS.map(r => r[selectedCol]);
  const colMax = Math.max(...colVals);
  const colMean = +(colVals.reduce((a, b) => a + b, 0) / colVals.length).toFixed(3);
  const isSalient = SALIENT_COLS.has(selectedCol);
  const scaleFactor = isSalient ? +(colMax / 0.5).toFixed(2) : 1.0;

  const { errBefore, errAfter } = useMemo(() => ({
    errBefore: isSalient ? 0.47 : 0.03,
    errAfter: isSalient ? 0.05 : 0.03,
  }), [isSalient]);

  const cellSize = 28;
  const heatX = 30;
  const heatY = 40;

  function heatColor(v: number): string {
    const t = Math.min(v / maxAct, 1);
    if (t > 0.6) return COLORS.red;
    if (t > 0.3) return COLORS.orange;
    return '#90caf9';
  }

  return (
    <svg viewBox={`0 0 ${W} 380`} className="w-full">
      <text x={heatX} y={25} fontSize="10" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>激活矩阵 X（点击列选择通道）</text>

      {ACTIVATIONS.map((row, i) =>
        row.map((v, j) => (
          <g key={`${i}-${j}`} onClick={() => setSelectedCol(j)} cursor="pointer">
            <rect x={heatX + j * cellSize} y={heatY + i * cellSize}
              width={cellSize - 1} height={cellSize - 1} rx={2}
              fill={heatColor(v)}
              stroke={j === selectedCol ? COLORS.primary : SALIENT_COLS.has(j) ? COLORS.red : 'none'}
              strokeWidth={j === selectedCol ? 2.5 : SALIENT_COLS.has(j) ? 1.5 : 0} />
            <text x={heatX + j * cellSize + cellSize / 2} y={heatY + i * cellSize + cellSize / 2 + 3}
              textAnchor="middle" fontSize="7" fill={v > 1 ? '#fff' : COLORS.dark}
              fontFamily={FONTS.mono}>{v > 1 ? v.toFixed(1) : v.toFixed(2)}</text>
          </g>
        ))
      )}

      {Array.from({ length: COLS }, (_, j) => (
        <text key={j} x={heatX + j * cellSize + cellSize / 2} y={heatY + ROWS * cellSize + 12}
          textAnchor="middle" fontSize="7"
          fill={SALIENT_COLS.has(j) ? COLORS.red : COLORS.mid} fontFamily={FONTS.mono}>
          ch{j}
        </text>
      ))}

      <rect x={290} y={35} width={260} height={95} rx={6}
        fill={COLORS.bgAlt} stroke={isSalient ? COLORS.red : COLORS.light} strokeWidth={1} />
      <text x={300} y={55} fontSize="9" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        通道 {selectedCol} {isSalient ? '⚡ 显著通道' : '普通通道'}
      </text>
      <text x={300} y={72} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
        max={colMax.toFixed(2)}  mean={colMean}
      </text>
      <text x={300} y={90} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
        <tspan fontWeight="600">缩放因子 s = </tspan>{scaleFactor.toFixed(2)}
      </text>
      <text x={300} y={108} fontSize="7.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {isSalient
          ? 'AWQ 放大此通道权重 → 量化粒度更细 → 误差更小'
          : '普通通道无需特殊处理, s=1'}
      </text>

      <rect x={30} y={290} width={245} height={35} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.red} strokeWidth={1} />
      <text x={152} y={312} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>
        缩放前量化误差: {errBefore.toFixed(2)}
      </text>

      <rect x={290} y={290} width={260} height={35} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1} />
      <text x={420} y={312} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        缩放后量化误差: {errAfter.toFixed(2)}
      </text>

      <text x={W / 2} y={350} textAnchor="middle" fontSize="8" fill={COLORS.orange}
        fontFamily={FONTS.sans}>
        Y = XW = (X·diag(s)⁻¹)·(diag(s)·W) — 保持数学等价, 保护 1% 关键通道
      </text>
      <text x={W / 2} y={368} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        AWQ 是"事前预防" (调整分布使其易量化) vs GPTQ 是"事后补救" (补偿量化误差)
      </text>
    </svg>
  );
}
