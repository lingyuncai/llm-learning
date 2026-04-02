// src/components/interactive/IOComplexityChart.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';

const N_VALUES = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];

function computeIO(N: number, d: number, M: number) {
  // Standard: Θ(Nd + N²)
  const standard = N * d + N * N;
  // Flash v1: Θ(N²d²M⁻¹)
  const flashV1 = (N * N * d * d) / M;
  // Flash v2: Θ(N²dM⁻¹)
  const flashV2 = (N * N * d) / M;
  return { standard, flashV1, flashV2 };
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)}T`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)}G`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)}M`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)}K`;
  return `${bytes}`;
}

export default function IOComplexityChart() {
  const [d, setD] = useState(128);
  const [M, setM] = useState(100 * 1024); // 100KB in bytes

  const data = useMemo(() =>
    N_VALUES.map(N => ({
      N,
      ...computeIO(N, d, M),
    })),
    [d, M]
  );

  // SVG chart dimensions
  const W = 600, H = 320, pad = { top: 20, right: 20, bottom: 50, left: 70 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...data.map(d => d.standard));
  const logMax = Math.log10(maxVal);
  const logMin = Math.log10(Math.min(...data.map(d => Math.min(d.flashV2, 1))));

  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * plotW;
  const yScale = (val: number) => {
    if (val <= 0) return pad.top + plotH;
    const logVal = Math.log10(val);
    const ratio = (logVal - logMin) / (logMax - logMin);
    return pad.top + plotH * (1 - ratio);
  };

  const lines = [
    { key: 'standard', color: COLORS.red, label: 'Standard Θ(Nd+N²)' },
    { key: 'flashV1', color: COLORS.orange, label: 'Flash v1 Θ(N²d²/M)' },
    { key: 'flashV2', color: COLORS.green, label: 'Flash v2 Θ(N²d/M)' },
  ] as const;

  return (
    <div className="my-6 p-4 bg-white rounded-lg border" style={{ borderColor: COLORS.light }}>
      <h3 className="text-base font-bold mb-3" style={{ color: COLORS.dark }}>
        IO 复杂度对比：Standard vs Flash v1 vs v2
      </h3>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-3">
        <label className="flex items-center gap-2 text-xs">
          <span style={{ color: COLORS.mid }}>head dim d:</span>
          <select value={d} onChange={e => setD(Number(e.target.value))}
            className="px-2 py-0.5 border rounded text-xs" style={{ borderColor: COLORS.light }}>
            <option value={64}>64</option>
            <option value={128}>128</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <span style={{ color: COLORS.mid }}>SRAM M:</span>
          <select value={M} onChange={e => setM(Number(e.target.value))}
            className="px-2 py-0.5 border rounded text-xs" style={{ borderColor: COLORS.light }}>
            <option value={50 * 1024}>50 KB</option>
            <option value={100 * 1024}>100 KB</option>
            <option value={192 * 1024}>192 KB</option>
          </select>
        </label>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
        {/* Grid lines */}
        {Array.from({ length: 5 }, (_, i) => {
          const y = pad.top + (plotH / 4) * i;
          return <line key={i} x1={pad.left} y1={y} x2={W - pad.right} y2={y}
            stroke={COLORS.light} strokeWidth={0.5} />;
        })}

        {/* Lines */}
        {lines.map(({ key, color }) => (
          <polyline key={key}
            points={data.map((pt, i) => `${xScale(i)},${yScale(pt[key])}`).join(' ')}
            fill="none" stroke={color} strokeWidth={2}
          />
        ))}

        {/* Dots */}
        {lines.map(({ key, color }) =>
          data.map((pt, i) => (
            <circle key={`${key}-${i}`} cx={xScale(i)} cy={yScale(pt[key])}
              r={3} fill={color} />
          ))
        )}

        {/* X axis labels */}
        {data.map((pt, i) => (
          <text key={i} x={xScale(i)} y={H - 10} textAnchor="middle"
            fontSize={9} fill={COLORS.mid} transform={`rotate(-30, ${xScale(i)}, ${H - 10})`}>
            {pt.N >= 1024 ? `${pt.N / 1024}K` : pt.N}
          </text>
        ))}
        <text x={pad.left + plotW / 2} y={H - 2} textAnchor="middle"
          fontSize={10} fill={COLORS.mid}>序列长度 N</text>

        {/* Y axis label */}
        <text x={12} y={pad.top + plotH / 2} textAnchor="middle"
          fontSize={10} fill={COLORS.mid} transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>
          HBM 访问量 (log scale)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 justify-center">
        {lines.map(({ key, color, label }) => (
          <div key={key} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
            <span style={{ color }}>{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs mt-2 text-center" style={{ color: COLORS.mid }}>
        长序列下标准方案 IO 爆炸 vs Flash Attention 的亚二次增长
      </p>
    </div>
  );
}
