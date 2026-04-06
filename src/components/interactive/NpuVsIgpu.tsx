import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'npu' | 'igpu' | 'both';

interface RadarPoint {
  angle: number;
  value: number;
}

const NpuVsIgpu: React.FC = () => {
  const [mode, setMode] = useState<Mode>('both');

  const axes = [
    { name: '吞吐量 (Throughput)', angle: -90 },
    { name: '延迟 (Latency)', angle: -18 },
    { name: '功耗效率 (Power Efficiency)', angle: 54 },
    { name: '灵活性 (Flexibility)', angle: 126 },
    { name: '模型支持 (Model Support)', angle: 198 },
  ];

  // Values 0-100
  const npuData = [60, 85, 95, 30, 40]; // High power efficiency, good latency, limited flexibility
  const igpuData = [85, 70, 60, 95, 90]; // High throughput, high flexibility, broad support

  const polarToCartesian = (angle: number, value: number, cx: number, cy: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const createPath = (data: number[], cx: number, cy: number, radius: number) => {
    const points = data.map((value, i) => polarToCartesian(axes[i].angle, value, cx, cy, radius));
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    return pathData;
  };

  const cx = 290;
  const cy = 190;
  const maxRadius = 120;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 380" className="w-full">
        {/* Background circles */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={maxRadius * scale}
            fill="none"
            stroke={COLORS.light}
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {axes.map((axis, i) => {
          const end = polarToCartesian(axis.angle, 100, cx, cy, maxRadius);
          const labelPos = polarToCartesian(axis.angle, 115, cx, cy, maxRadius);
          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={end.x}
                y2={end.y}
                stroke={COLORS.mid}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill={COLORS.dark}
                fontFamily={FONTS.sans}
              >
                {axis.name}
              </text>
            </g>
          );
        })}

        {/* NPU polygon */}
        {(mode === 'npu' || mode === 'both') && (
          <path
            d={createPath(npuData, cx, cy, maxRadius)}
            fill={mode === 'both' ? COLORS.primary : COLORS.primary}
            fillOpacity={mode === 'both' ? 0.3 : 0.5}
            stroke={COLORS.primary}
            strokeWidth="2"
          />
        )}

        {/* iGPU polygon */}
        {(mode === 'igpu' || mode === 'both') && (
          <path
            d={createPath(igpuData, cx, cy, maxRadius)}
            fill={mode === 'both' ? COLORS.green : COLORS.green}
            fillOpacity={mode === 'both' ? 0.3 : 0.5}
            stroke={COLORS.green}
            strokeWidth="2"
          />
        )}

        {/* Legend */}
        <g transform="translate(40, 330)">
          <rect x="0" y="0" width="16" height="16" fill={COLORS.primary} opacity="0.5" />
          <text x="22" y="12" fontSize="12" fontFamily={FONTS.sans} fill={COLORS.dark}>
            NPU (AI Boost)
          </text>

          <rect x="150" y="0" width="16" height="16" fill={COLORS.green} opacity="0.5" />
          <text x="172" y="12" fontSize="12" fontFamily={FONTS.sans} fill={COLORS.dark}>
            iGPU (Xe2)
          </text>
        </g>

        {/* Info box */}
        <g transform="translate(320, 320)">
          <rect x="0" y="0" width="240" height="48" fill={COLORS.bgAlt} rx="4" />
          <text x="10" y="18" fontSize="11" fontFamily={FONTS.sans} fill={COLORS.dark}>
            NPU 优势：低功耗，固定模型高效
          </text>
          <text x="10" y="36" fontSize="11" fontFamily={FONTS.sans} fill={COLORS.dark}>
            iGPU 优势：灵活性强，模型支持广
          </text>
        </g>
      </svg>

      {/* Controls */}
      <div className="flex gap-2 mt-4 justify-center">
        <button
          onClick={() => setMode('npu')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            mode === 'npu'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          NPU
        </button>
        <button
          onClick={() => setMode('igpu')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            mode === 'igpu'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          iGPU
        </button>
        <button
          onClick={() => setMode('both')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            mode === 'both'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          对比
        </button>
      </div>
    </div>
  );
};

export default NpuVsIgpu;
