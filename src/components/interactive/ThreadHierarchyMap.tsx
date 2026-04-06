import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Level {
  id: string;
  softwareName: string;
  hardwareName: string;
  count?: string;
}

const ThreadHierarchyMap: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const t = {
    zh: {
      title: '软件抽象 ↔ 硬件映射',
      software: '软件层次 (SYCL)',
      hardware: '硬件资源 (Xe2)',
      hover: 'Hover 查看软件抽象到硬件资源的映射关系',
    },
    en: {
      title: 'Software Abstraction ↔ Hardware Mapping',
      software: 'Software Hierarchy (SYCL)',
      hardware: 'Hardware Resources (Xe2)',
      hover: 'Hover to see software-to-hardware mapping',
    },
  }[locale];

  const levels: Level[] = [
    { id: 'level0', softwareName: 'ND-Range', hardwareName: 'GPU', count: '1 GPU' },
    { id: 'level1', softwareName: 'Work-group', hardwareName: 'Xe-core', count: '8-16 Xe-cores' },
    { id: 'level2', softwareName: 'Sub-group', hardwareName: 'EU', count: '16 EUs/Xe-core' },
    { id: 'level3', softwareName: 'Work-item', hardwareName: 'Thread Slot', count: '8 Threads/EU' },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 340" className="w-full">
        <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Column headers */}
        <text x="120" y="50" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.primary}>
          {t.software}
        </text>
        <text x="460" y="50" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.green}>
          {t.hardware}
        </text>

        {/* Levels */}
        {levels.map((level, index) => {
          const y = 75 + index * 60;
          const isHovered = hoveredLevel === level.id;

          return (
            <g key={level.id}>
              {/* Software box */}
              <rect
                x="20"
                y={y}
                width="200"
                height="45"
                fill={isHovered ? COLORS.orange : COLORS.primary}
                fillOpacity={isHovered ? '0.25' : '0.15'}
                stroke={isHovered ? COLORS.orange : COLORS.primary}
                strokeWidth={isHovered ? '2.5' : '1.5'}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{ cursor: 'pointer' }}
              />
              <text
                x="120"
                y={y + 23}
                textAnchor="middle"
                fontSize="13"
                fontWeight="bold"
                fill={COLORS.dark}
                fontFamily={FONTS.mono}
              >
                {level.softwareName}
              </text>
              <text
                x="120"
                y={y + 37}
                textAnchor="middle"
                fontSize="9"
                fill={COLORS.mid}
              >
                {index === 0 && 'parallel_for(nd_range)'}
                {index === 1 && 'local memory + barrier'}
                {index === 2 && 'SIMD lanes'}
                {index === 3 && 'get_global_id()'}
              </text>

              {/* Hardware box */}
              <rect
                x="360"
                y={y}
                width="200"
                height="45"
                fill={isHovered ? COLORS.orange : COLORS.green}
                fillOpacity={isHovered ? '0.25' : '0.15'}
                stroke={isHovered ? COLORS.orange : COLORS.green}
                strokeWidth={isHovered ? '2.5' : '1.5'}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{ cursor: 'pointer' }}
              />
              <text
                x="460"
                y={y + 23}
                textAnchor="middle"
                fontSize="13"
                fontWeight="bold"
                fill={COLORS.dark}
                fontFamily={FONTS.mono}
              >
                {level.hardwareName}
              </text>
              <text
                x="460"
                y={y + 37}
                textAnchor="middle"
                fontSize="9"
                fill={COLORS.mid}
              >
                {index === 0 && 'Intel Arc / Flex / Max'}
                {index === 1 && '64KB SLM + L1 cache'}
                {index === 2 && '128 x 512-bit registers'}
                {index === 3 && 'GRF register context'}
              </text>

              {/* Connecting line */}
              <path
                d={`M 220 ${y + 22.5} L 360 ${y + 22.5}`}
                stroke={isHovered ? COLORS.orange : COLORS.mid}
                strokeWidth={isHovered ? '2.5' : '1.5'}
                strokeDasharray={isHovered ? '0' : '4,4'}
                markerEnd={`url(#arrow-${level.id})`}
              />
              <defs>
                <marker
                  id={`arrow-${level.id}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill={isHovered ? COLORS.orange : COLORS.mid}
                  />
                </marker>
              </defs>

              {/* Count label */}
              {level.count && (
                <text
                  x="290"
                  y={y + 10}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isHovered ? COLORS.orange : COLORS.mid}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {level.count}
                </text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <rect x="20" y="305" width="540" height="25" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
        <text x="290" y="322" textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.hover}
        </text>
      </svg>
    </div>
  );
};

export default ThreadHierarchyMap;
