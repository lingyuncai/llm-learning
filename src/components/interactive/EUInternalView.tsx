import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

export default function EUInternalView() {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const W = 580;
  const H = 360;

  const parts = [
    {
      id: 'vector',
      x: 50,
      y: 60,
      width: 220,
      height: 100,
      label: 'Vector Engine',
      sublabel: 'SIMD8 ALU',
      tooltip: 'FP32: 8 ops/cycle\nFP16: 16 ops/cycle\nINT32: 8 ops/cycle',
      color: COLORS.primary,
    },
    {
      id: 'xmx',
      x: 310,
      y: 60,
      width: 220,
      height: 100,
      label: 'XMX Engine',
      sublabel: 'Matrix Accelerator',
      tooltip: 'INT8: 128 ops/cycle\nBF16: 64 ops/cycle\nFP16: 64 ops/cycle',
      color: COLORS.orange,
    },
    {
      id: 'grf',
      x: 50,
      y: 190,
      width: 220,
      height: 100,
      label: 'GRF',
      sublabel: 'General Register File',
      tooltip: '128 × 32B registers/thread\n4KB per thread\n32KB total per EU',
      color: COLORS.green,
    },
    {
      id: 'threads',
      x: 310,
      y: 190,
      width: 220,
      height: 100,
      label: 'Thread Slots',
      sublabel: '8 Concurrent Threads',
      tooltip: '8 hardware threads\nRapid context switching\nZero-overhead scheduling',
      color: COLORS.purple,
    },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="mb-3">
        <h3 className="text-lg font-semibold mb-2">EU (Execution Unit) 内部结构</h3>
        <p className="text-sm text-gray-600">悬停查看各部件规格</p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* EU Container */}
        <rect
          x={20}
          y={20}
          width={540}
          height={310}
          fill="none"
          stroke={COLORS.dark}
          strokeWidth={3}
          strokeDasharray="5,5"
          rx={6}
        />
        <text
          x={290}
          y={340}
          textAnchor="middle"
          fill={COLORS.dark}
          fontSize={14}
          fontWeight="bold"
          fontFamily={FONTS.sans}
        >
          Execution Unit (EU)
        </text>

        {/* Parts */}
        {parts.map((part) => (
          <g key={part.id}>
            <rect
              x={part.x}
              y={part.y}
              width={part.width}
              height={part.height}
              fill={hoveredPart === part.id ? part.color : part.color}
              stroke={hoveredPart === part.id ? COLORS.dark : part.color}
              strokeWidth={hoveredPart === part.id ? 3 : 2}
              rx={4}
              style={{ cursor: 'pointer', opacity: hoveredPart === part.id ? 1 : 0.85 }}
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
            />
            <text
              x={part.x + part.width / 2}
              y={part.y + part.height / 2 - 10}
              textAnchor="middle"
              fill="white"
              fontSize={16}
              fontWeight="bold"
              fontFamily={FONTS.sans}
              style={{ pointerEvents: 'none' }}
            >
              {part.label}
            </text>
            <text
              x={part.x + part.width / 2}
              y={part.y + part.height / 2 + 10}
              textAnchor="middle"
              fill="white"
              fontSize={13}
              fontFamily={FONTS.sans}
              style={{ pointerEvents: 'none' }}
            >
              {part.sublabel}
            </text>

            {/* Tooltip */}
            {hoveredPart === part.id && (
              <g>
                <rect
                  x={part.x + part.width / 2 - 90}
                  y={part.y + part.height + 10}
                  width={180}
                  height={60}
                  fill={COLORS.dark}
                  stroke={part.color}
                  strokeWidth={2}
                  rx={4}
                  opacity={0.95}
                />
                {part.tooltip.split('\n').map((line, i) => (
                  <text
                    key={i}
                    x={part.x + part.width / 2}
                    y={part.y + part.height + 30 + i * 16}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontFamily={FONTS.mono}
                  >
                    {line}
                  </text>
                ))}
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
