// src/components/interactive/SinusoidalHeatmap.tsx
import { useState, useMemo, useCallback } from 'react';
import { COLORS } from './shared/colors';

const NUM_POS = 64;
const NUM_DIM = 64;

function computeSinusoidalPE(numPos: number, numDim: number): { sin: number[][]; cos: number[][] } {
  const sinVals: number[][] = [];
  const cosVals: number[][] = [];
  for (let pos = 0; pos < numPos; pos++) {
    const sinRow: number[] = [];
    const cosRow: number[] = [];
    for (let i = 0; i < numDim / 2; i++) {
      const angle = pos / Math.pow(10000, (2 * i) / numDim);
      sinRow.push(Math.sin(angle));
      cosRow.push(Math.cos(angle));
    }
    sinVals.push(sinRow);
    cosVals.push(cosRow);
  }
  return { sin: sinVals, cos: cosVals };
}

function valueToColor(v: number): string {
  // -1 → blue (#1565c0), 0 → white, +1 → red (#c62828)
  if (v >= 0) {
    const r = 255;
    const g = Math.round(255 - v * (255 - 40));
    const b = Math.round(255 - v * (255 - 40));
    return `rgb(${r},${g},${b})`;
  } else {
    const a = -v;
    const r = Math.round(255 - a * (255 - 21));
    const g = Math.round(255 - a * (255 - 101));
    const b = Math.round(255 - a * (255 - 192));
    return `rgb(${r},${g},${b})`;
  }
}

export default function SinusoidalHeatmap({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      sinChannel: 'sin 通道',
      cosChannel: 'cos 通道',
      position: 'Position',
      dimension: 'Dimension (i)',
      disclaimer: '低维度（左侧）变化频率高，高维度（右侧）变化频率低 — 每个位置有唯一的"频率指纹"',
    },
    en: {
      sinChannel: 'sin channel',
      cosChannel: 'cos channel',
      position: 'Position',
      dimension: 'Dimension (i)',
      disclaimer: 'Low dimensions (left) vary at high frequency, high dimensions (right) at low frequency — each position has a unique "frequency fingerprint"',
    },
  }[locale];

  const [channel, setChannel] = useState<'sin' | 'cos'>('sin');
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const [hoverDim, setHoverDim] = useState<number | null>(null);

  const pe = useMemo(() => computeSinusoidalPE(NUM_POS, NUM_DIM), []);
  const data = channel === 'sin' ? pe.sin : pe.cos;

  const cellSize = 6;
  const labelPad = 36;
  const svgW = labelPad + (NUM_DIM / 2) * cellSize;
  const svgH = labelPad + NUM_POS * cellSize;

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = svgW / rect.width;
    const scaleY = svgH / rect.height;
    const x = (e.clientX - rect.left) * scaleX - labelPad;
    const y = (e.clientY - rect.top) * scaleY - labelPad;
    const dim = Math.floor(x / cellSize);
    const pos = Math.floor(y / cellSize);
    if (dim >= 0 && dim < NUM_DIM / 2 && pos >= 0 && pos < NUM_POS) {
      setHoverPos(pos);
      setHoverDim(dim);
    } else {
      setHoverPos(null);
      setHoverDim(null);
    }
  }, [svgW, svgH]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setChannel('sin')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              channel === 'sin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.sinChannel}
          </button>
          <button
            onClick={() => setChannel('cos')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              channel === 'cos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.cosChannel}
          </button>
        </div>
        {hoverPos !== null && hoverDim !== null && (
          <div className="text-xs font-mono text-gray-600">
            pos={hoverPos}, dim={hoverDim * 2 + (channel === 'cos' ? 1 : 0)},
            val={data[hoverPos][hoverDim].toFixed(4)}
          </div>
        )}
      </div>

      {/* Heatmap */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoverPos(null); setHoverDim(null); }}
        >
          {/* Y-axis label */}
          <text x={2} y={svgH / 2} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily="system-ui"
            transform={`rotate(-90, 8, ${svgH / 2})`}>
            {t.position}
          </text>
          {/* X-axis label */}
          <text x={labelPad + (NUM_DIM / 2) * cellSize / 2} y={labelPad - 6}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            {t.dimension}
          </text>
          {/* Y tick marks */}
          {[0, 15, 31, 47, 63].map(p => (
            <text key={p} x={labelPad - 3} y={labelPad + p * cellSize + cellSize / 2 + 2}
              textAnchor="end" fontSize="6" fill={COLORS.mid} fontFamily="monospace">{p}</text>
          ))}
          {/* X tick marks */}
          {[0, 7, 15, 23, 31].map(d => (
            <text key={d} x={labelPad + d * cellSize + cellSize / 2} y={labelPad - 10}
              textAnchor="middle" fontSize="6" fill={COLORS.mid} fontFamily="monospace">{d * 2}</text>
          ))}
          {/* Heatmap cells */}
          {data.map((row, pos) =>
            row.map((val, dim) => (
              <rect
                key={`${pos}-${dim}`}
                x={labelPad + dim * cellSize}
                y={labelPad + pos * cellSize}
                width={cellSize}
                height={cellSize}
                fill={valueToColor(val)}
                stroke={pos === hoverPos ? COLORS.orange : 'none'}
                strokeWidth={pos === hoverPos ? 0.5 : 0}
              />
            ))
          )}
          {/* Hover crosshair */}
          {hoverPos !== null && hoverDim !== null && (
            <>
              <rect x={labelPad + hoverDim * cellSize} y={labelPad + hoverPos * cellSize}
                width={cellSize} height={cellSize}
                fill="none" stroke={COLORS.dark} strokeWidth={1.5} />
            </>
          )}
        </svg>
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span style={{ color: '#1565c0' }}>■ −1</span>
        <div className="w-24 h-3 rounded" style={{
          background: 'linear-gradient(to right, #1565c0, #ffffff, #c62828)'
        }} />
        <span style={{ color: '#c62828' }}>+1 ■</span>
      </div>

      <p className="text-xs text-gray-500 text-center">
        {t.disclaimer}
      </p>
    </div>
  );
}
