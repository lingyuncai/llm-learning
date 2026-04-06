import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

export default function MemoryHierarchyStack() {
  const [mode, setMode] = useState<'igpu' | 'dgpu'>('igpu');

  const W = 580;
  const H = 400;

  const igpuLevels = [
    { name: 'GRF', capacity: '4KB/thread', bandwidth: '~1 TB/s', width: 140, y: 60 },
    { name: 'SLM', capacity: '64KB/Xe-core', bandwidth: '~2 TB/s', width: 200, y: 130 },
    { name: 'L1 Cache', capacity: '64KB/Xe-core', bandwidth: '~1 TB/s', width: 260, y: 200 },
    { name: 'L2 Cache', capacity: '4MB (shared)', bandwidth: '~500 GB/s', width: 360, y: 270 },
    {
      name: 'System Memory',
      capacity: 'LPDDR5x (shared)',
      bandwidth: '~90 GB/s',
      width: 480,
      y: 340,
    },
  ];

  const dgpuLevels = [
    { name: 'GRF', capacity: '4KB/thread', bandwidth: '~1 TB/s', width: 140, y: 60 },
    { name: 'SLM', capacity: '128KB/Xe-core', bandwidth: '~2 TB/s', width: 200, y: 130 },
    { name: 'L1 Cache', capacity: '64KB/Xe-core', bandwidth: '~1 TB/s', width: 260, y: 200 },
    { name: 'L2 Cache', capacity: '16-32MB', bandwidth: '~800 GB/s', width: 360, y: 270 },
    { name: 'HBM / GDDR6', capacity: 'Dedicated VRAM', bandwidth: '~1 TB/s', width: 480, y: 340 },
  ];

  const levels = mode === 'igpu' ? igpuLevels : dgpuLevels;

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">内存层次结构</h3>
          <p className="text-sm text-gray-600">切换 iGPU / dGPU 查看差异</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('igpu')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              mode === 'igpu'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            iGPU
          </button>
          <button
            onClick={() => setMode('dgpu')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              mode === 'dgpu'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            dGPU
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Title */}
        <text
          x={290}
          y={30}
          textAnchor="middle"
          fill={COLORS.dark}
          fontSize={15}
          fontWeight="bold"
          fontFamily={FONTS.sans}
        >
          {mode === 'igpu' ? 'iGPU (集成显卡)' : 'dGPU (独立显卡)'}
        </text>

        {/* Memory Hierarchy Stack */}
        {levels.map((level, i) => {
          const color =
            i === 0
              ? COLORS.purple
              : i === 1
                ? COLORS.green
                : i === 2
                  ? COLORS.primary
                  : i === 3
                    ? COLORS.orange
                    : COLORS.red;
          const x = 290 - level.width / 2;

          return (
            <g key={level.name}>
              {/* Stack Box */}
              <rect
                x={x}
                y={level.y}
                width={level.width}
                height={55}
                fill={color}
                stroke={COLORS.dark}
                strokeWidth={2}
                rx={4}
                opacity={0.9}
              />
              {/* Name */}
              <text
                x={290}
                y={level.y + 20}
                textAnchor="middle"
                fill="white"
                fontSize={14}
                fontWeight="bold"
                fontFamily={FONTS.sans}
              >
                {level.name}
              </text>
              {/* Capacity */}
              <text
                x={290}
                y={level.y + 38}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontFamily={FONTS.mono}
              >
                {level.capacity}
              </text>
              {/* Bandwidth */}
              <text
                x={290}
                y={level.y + 52}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontFamily={FONTS.mono}
              >
                {level.bandwidth}
              </text>

              {/* Connection Line */}
              {i < levels.length - 1 && (
                <line
                  x1={290}
                  y1={level.y + 55}
                  x2={290}
                  y2={levels[i + 1].y}
                  stroke={COLORS.mid}
                  strokeWidth={2}
                  strokeDasharray="4,2"
                />
              )}
            </g>
          );
        })}

        {/* Key Insight */}
        {mode === 'igpu' && (
          <g>
            <rect x={40} y={370} width={500} height={25} fill={COLORS.highlight} rx={4} />
            <text
              x={290}
              y={387}
              textAnchor="middle"
              fill={COLORS.dark}
              fontSize={12}
              fontWeight="600"
              fontFamily={FONTS.sans}
            >
              ⚠️ iGPU 与 CPU 共享系统内存带宽，这是性能瓶颈的关键
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
