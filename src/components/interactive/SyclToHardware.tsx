import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface CodeLine {
  id: number;
  code: string;
  hardwareMapping: string;
}

const SyclToHardware: React.FC = () => {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const codeLines: CodeLine[] = [
    { id: 0, code: 'h.parallel_for(nd_range<1>(N, 256), [=](nd_item<1> it) {', hardwareMapping: 'dispatch' },
    { id: 1, code: '  auto sg = it.get_sub_group();', hardwareMapping: 'eu' },
    { id: 2, code: '  auto local_acc = local[it.get_local_id()];', hardwareMapping: 'slm' },
    { id: 3, code: '  float val = data[it.get_global_id()];', hardwareMapping: 'grf' },
    { id: 4, code: '  val = sg.shuffle(val, lane_id ^ 4);', hardwareMapping: 'shuffle' },
    { id: 5, code: '  it.barrier();', hardwareMapping: 'barrier' },
    { id: 6, code: '  output[it.get_global_id()] = val;', hardwareMapping: 'grf' },
    { id: 7, code: '});', hardwareMapping: 'dispatch' },
  ];

  const getHardwareHighlight = (mapping: string) => {
    if (hoveredLine === null) return false;
    return codeLines[hoveredLine]?.hardwareMapping === mapping;
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 340" className="w-full">
        <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
          SYCL 代码 → 硬件资源映射
        </text>

        {/* Code section */}
        <text x="40" y="50" fontSize="12" fontWeight="bold" fill={COLORS.primary}>
          SYCL Kernel 代码
        </text>

        {codeLines.map((line, index) => {
          const y = 70 + index * 24;
          const isHovered = hoveredLine === line.id;

          return (
            <g key={line.id}>
              <rect
                x="30"
                y={y - 15}
                width="250"
                height="20"
                fill={isHovered ? COLORS.highlight : 'transparent'}
                onMouseEnter={() => setHoveredLine(line.id)}
                onMouseLeave={() => setHoveredLine(null)}
                style={{ cursor: 'pointer' }}
              />
              <text
                x="35"
                y={y}
                fontSize="9"
                fontFamily={FONTS.mono}
                fill={isHovered ? COLORS.orange : COLORS.dark}
                fontWeight={isHovered ? 'bold' : 'normal'}
              >
                {line.code}
              </text>
            </g>
          );
        })}

        {/* Hardware diagram */}
        <text x="420" y="50" fontSize="12" fontWeight="bold" fill={COLORS.green}>
          Xe2 硬件资源
        </text>

        {/* GPU Dispatch */}
        <rect
          x="320"
          y="65"
          width="230"
          height="30"
          fill={getHardwareHighlight('dispatch') ? COLORS.orange : COLORS.primary}
          fillOpacity={getHardwareHighlight('dispatch') ? '0.3' : '0.15'}
          stroke={getHardwareHighlight('dispatch') ? COLORS.orange : COLORS.primary}
          strokeWidth={getHardwareHighlight('dispatch') ? '2.5' : '1.5'}
        />
        <text x="435" y="83" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          GPU Dispatch Engine
        </text>

        {/* Xe-core box containing EU, SLM, Shuffle */}
        <rect
          x="320"
          y="105"
          width="230"
          height="185"
          fill="none"
          stroke={COLORS.mid}
          strokeWidth="1"
          strokeDasharray="4,4"
        />
        <text x="330" y="120" fontSize="10" fontWeight="bold" fill={COLORS.mid}>
          Xe-core
        </text>

        {/* EU */}
        <rect
          x="335"
          y="130"
          width="200"
          height="35"
          fill={getHardwareHighlight('eu') ? COLORS.orange : COLORS.green}
          fillOpacity={getHardwareHighlight('eu') ? '0.3' : '0.15'}
          stroke={getHardwareHighlight('eu') ? COLORS.orange : COLORS.green}
          strokeWidth={getHardwareHighlight('eu') ? '2.5' : '1.5'}
        />
        <text x="435" y="150" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          EU (Execution Unit)
        </text>
        <text x="435" y="160" textAnchor="middle" fontSize="8" fill={COLORS.mid}>
          SIMD8/16 lanes
        </text>

        {/* GRF */}
        <rect
          x="335"
          y="175"
          width="95"
          height="35"
          fill={getHardwareHighlight('grf') ? COLORS.orange : COLORS.purple}
          fillOpacity={getHardwareHighlight('grf') ? '0.3' : '0.15'}
          stroke={getHardwareHighlight('grf') ? COLORS.orange : COLORS.purple}
          strokeWidth={getHardwareHighlight('grf') ? '2.5' : '1.5'}
        />
        <text x="382.5" y="193" textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLORS.dark}>
          GRF
        </text>
        <text x="382.5" y="203" textAnchor="middle" fontSize="8" fill={COLORS.mid}>
          Registers
        </text>

        {/* Shuffle Unit */}
        <rect
          x="440"
          y="175"
          width="95"
          height="35"
          fill={getHardwareHighlight('shuffle') ? COLORS.orange : COLORS.primary}
          fillOpacity={getHardwareHighlight('shuffle') ? '0.3' : '0.15'}
          stroke={getHardwareHighlight('shuffle') ? COLORS.orange : COLORS.primary}
          strokeWidth={getHardwareHighlight('shuffle') ? '2.5' : '1.5'}
        />
        <text x="487.5" y="193" textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLORS.dark}>
          Shuffle
        </text>
        <text x="487.5" y="203" textAnchor="middle" fontSize="8" fill={COLORS.mid}>
          Unit
        </text>

        {/* SLM */}
        <rect
          x="335"
          y="220"
          width="95"
          height="35"
          fill={getHardwareHighlight('slm') ? COLORS.orange : COLORS.green}
          fillOpacity={getHardwareHighlight('slm') ? '0.3' : '0.15'}
          stroke={getHardwareHighlight('slm') ? COLORS.orange : COLORS.green}
          strokeWidth={getHardwareHighlight('slm') ? '2.5' : '1.5'}
        />
        <text x="382.5" y="238" textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLORS.dark}>
          SLM
        </text>
        <text x="382.5" y="248" textAnchor="middle" fontSize="8" fill={COLORS.mid}>
          64KB/Xe-core
        </text>

        {/* Barrier */}
        <rect
          x="440"
          y="220"
          width="95"
          height="35"
          fill={getHardwareHighlight('barrier') ? COLORS.orange : COLORS.red}
          fillOpacity={getHardwareHighlight('barrier') ? '0.3' : '0.15'}
          stroke={getHardwareHighlight('barrier') ? COLORS.orange : COLORS.red}
          strokeWidth={getHardwareHighlight('barrier') ? '2.5' : '1.5'}
        />
        <text x="487.5" y="238" textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLORS.dark}>
          Barrier
        </text>
        <text x="487.5" y="248" textAnchor="middle" fontSize="8" fill={COLORS.mid}>
          SLM Sync
        </text>

        {/* Legend */}
        <rect x="30" y="310" width="520" height="20" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
        <text x="290" y="324" textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          Hover 代码行查看对应的硬件资源映射
        </text>
      </svg>
    </div>
  );
};

export default SyclToHardware;
