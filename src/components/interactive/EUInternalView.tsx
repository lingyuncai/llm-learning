import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

export default function EUInternalView({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const t = {
    zh: {
      title: 'EU (Execution Unit) 内部结构',
      subtitle: '悬停查看各部件规格',
      euLabel: 'Execution Unit (EU)',
      vectorEngine: 'Vector Engine',
      vectorSublabel: 'SIMD8 ALU',
      vectorTooltip: 'FP32: 8 ops/cycle\nFP16: 16 ops/cycle\nINT32: 8 ops/cycle',
      xmxEngine: 'XMX Engine',
      xmxSublabel: 'Matrix Accelerator',
      xmxTooltip: 'INT8: 128 ops/cycle\nBF16: 64 ops/cycle\nFP16: 64 ops/cycle',
      grf: 'GRF',
      grfSublabel: 'General Register File',
      grfTooltip: '128 × 32B registers/thread\n4KB per thread\n32KB total per EU',
      threads: 'Thread Slots',
      threadsSublabel: '8 Concurrent Threads',
      threadsTooltip: '8 hardware threads\nRapid context switching\nZero-overhead scheduling',
    },
    en: {
      title: 'EU (Execution Unit) Internal Structure',
      subtitle: 'Hover to view component specs',
      euLabel: 'Execution Unit (EU)',
      vectorEngine: 'Vector Engine',
      vectorSublabel: 'SIMD8 ALU',
      vectorTooltip: 'FP32: 8 ops/cycle\nFP16: 16 ops/cycle\nINT32: 8 ops/cycle',
      xmxEngine: 'XMX Engine',
      xmxSublabel: 'Matrix Accelerator',
      xmxTooltip: 'INT8: 128 ops/cycle\nBF16: 64 ops/cycle\nFP16: 64 ops/cycle',
      grf: 'GRF',
      grfSublabel: 'General Register File',
      grfTooltip: '128 × 32B registers/thread\n4KB per thread\n32KB total per EU',
      threads: 'Thread Slots',
      threadsSublabel: '8 Concurrent Threads',
      threadsTooltip: '8 hardware threads\nRapid context switching\nZero-overhead scheduling',
    },
  }[locale];

  const W = 580;
  const H = 360;

  const parts = [
    {
      id: 'vector',
      x: 50,
      y: 60,
      width: 220,
      height: 100,
      label: t.vectorEngine,
      sublabel: t.vectorSublabel,
      tooltip: t.vectorTooltip,
      color: COLORS.primary,
    },
    {
      id: 'xmx',
      x: 310,
      y: 60,
      width: 220,
      height: 100,
      label: t.xmxEngine,
      sublabel: t.xmxSublabel,
      tooltip: t.xmxTooltip,
      color: COLORS.orange,
    },
    {
      id: 'grf',
      x: 50,
      y: 190,
      width: 220,
      height: 100,
      label: t.grf,
      sublabel: t.grfSublabel,
      tooltip: t.grfTooltip,
      color: COLORS.green,
    },
    {
      id: 'threads',
      x: 310,
      y: 190,
      width: 220,
      height: 100,
      label: t.threads,
      sublabel: t.threadsSublabel,
      tooltip: t.threadsTooltip,
      color: COLORS.purple,
    },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="mb-3">
        <h3 className="text-lg font-semibold mb-2">{t.title}</h3>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
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
          {t.euLabel}
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
