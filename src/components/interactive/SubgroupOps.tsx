import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type OpType = 'shuffle' | 'broadcast' | 'reduce';

const SubgroupOps: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      title: 'Sub-group 集合操作',
      inputState: '输入状态 (8 个 SIMD 通道)',
      outputState: '输出状态',
      shuffle: {
        desc: 'sg.shuffle(value, target_lane) — 通道间交换数据，用于矩阵转置、数据重排',
        code: 'auto swapped = sg.shuffle(value, lane_id ^ 4);',
      },
      broadcast: {
        desc: 'sg.broadcast(value, source_lane) — 单个值广播到所有通道，用于共享常量',
        code: 'auto shared = sg.broadcast(value, 0);',
      },
      reduce: {
        desc: 'sg.reduce(value, op) — 所有通道归约为单个结果，用于求和、最大值',
        code: 'auto sum = sg.reduce(value, sycl::plus<>());',
      },
    },
    en: {
      title: 'Sub-group Collective Operations',
      inputState: 'Input State (8 SIMD Lanes)',
      outputState: 'Output State',
      shuffle: {
        desc: 'sg.shuffle(value, target_lane) — Exchange data between lanes for matrix transpose, data rearrangement',
        code: 'auto swapped = sg.shuffle(value, lane_id ^ 4);',
      },
      broadcast: {
        desc: 'sg.broadcast(value, source_lane) — Broadcast single value to all lanes for constant sharing',
        code: 'auto shared = sg.broadcast(value, 0);',
      },
      reduce: {
        desc: 'sg.reduce(value, op) — Reduce all lanes to single result for sum, max operations',
        code: 'auto sum = sg.reduce(value, sycl::plus<>());',
      },
    },
  }[locale];

  const [selectedOp, setSelectedOp] = useState<OpType>('shuffle');

  const lanes = [
    { id: 0, value: 'A', color: '#e3f2fd' },
    { id: 1, value: 'B', color: '#fff3e0' },
    { id: 2, value: 'C', color: '#f3e5f5' },
    { id: 3, value: 'D', color: '#e8f5e9' },
    { id: 4, value: 'E', color: '#fce4ec' },
    { id: 5, value: 'F', color: '#e0f2f1' },
    { id: 6, value: 'G', color: '#fff9c4' },
    { id: 7, value: 'H', color: '#ede7f6' },
  ];

  const renderArrows = () => {
    if (selectedOp === 'shuffle') {
      // Shuffle: cross-exchange between lanes
      return (
        <>
          {/* Lane 0 ↔ Lane 4 */}
          <path d="M 90 125 Q 160 100 230 125" stroke={COLORS.primary} strokeWidth="2" fill="none" markerEnd="url(#arrow-shuffle)" />
          <path d="M 230 145 Q 160 170 90 145" stroke={COLORS.orange} strokeWidth="2" fill="none" markerEnd="url(#arrow-shuffle-2)" />

          {/* Lane 1 ↔ Lane 5 */}
          <path d="M 155 125 Q 195 105 235 125" stroke={COLORS.primary} strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 235 145 Q 195 165 155 145" stroke={COLORS.orange} strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* Lane 2 ↔ Lane 6 */}
          <path d="M 220 125 Q 255 105 290 125" stroke={COLORS.primary} strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 290 145 Q 255 165 220 145" stroke={COLORS.orange} strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* Lane 3 ↔ Lane 7 */}
          <path d="M 285 125 Q 320 105 355 125" stroke={COLORS.primary} strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 355 145 Q 320 165 285 145" stroke={COLORS.orange} strokeWidth="1.5" fill="none" opacity="0.6" />

          <defs>
            <marker id="arrow-shuffle" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
            </marker>
            <marker id="arrow-shuffle-2" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.orange} />
            </marker>
          </defs>
        </>
      );
    } else if (selectedOp === 'broadcast') {
      // Broadcast: Lane 0 to all others
      return (
        <>
          {lanes.slice(1).map((lane, i) => {
            const targetX = 80 + (i + 1) * 65;
            return (
              <path
                key={lane.id}
                d={`M 90 145 Q ${(90 + targetX) / 2} 200 ${targetX} 145`}
                stroke={COLORS.primary}
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrow-broadcast)"
              />
            );
          })}
          <defs>
            <marker id="arrow-broadcast" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
            </marker>
          </defs>
        </>
      );
    } else if (selectedOp === 'reduce') {
      // Reduce: all lanes to Lane 0
      return (
        <>
          {lanes.slice(1).map((lane, i) => {
            const sourceX = 80 + (i + 1) * 65;
            return (
              <path
                key={lane.id}
                d={`M ${sourceX} 125 Q ${(sourceX + 90) / 2} 70 90 125`}
                stroke={COLORS.green}
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrow-reduce)"
              />
            );
          })}
          <defs>
            <marker id="arrow-reduce" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
            </marker>
          </defs>
        </>
      );
    }
    return null;
  };

  const getDescription = () => t[selectedOp].desc;
  const getCodeExample = () => t[selectedOp].code;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 300" className="w-full">
        <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Operation selector */}
        {(['shuffle', 'broadcast', 'reduce'] as OpType[]).map((op, i) => {
          const x = 150 + i * 100;
          const isSelected = selectedOp === op;
          return (
            <g key={op}>
              <rect
                x={x}
                y="40"
                width="85"
                height="28"
                fill={isSelected ? COLORS.primary : COLORS.bgAlt}
                stroke={isSelected ? COLORS.primary : COLORS.light}
                strokeWidth={isSelected ? '2' : '1'}
                onMouseDown={() => setSelectedOp(op)}
                style={{ cursor: 'pointer' }}
              />
              <text
                x={x + 42.5}
                y="58"
                textAnchor="middle"
                fontSize="11"
                fontWeight={isSelected ? 'bold' : 'normal'}
                fill={isSelected ? COLORS.bg : COLORS.dark}
                style={{ pointerEvents: 'none' }}
              >
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </text>
            </g>
          );
        })}

        {/* SIMD8 lanes - input state */}
        <text x="290" y="105" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.mid}>
          {t.inputState}
        </text>
        {lanes.map((lane, i) => {
          const x = 80 + i * 65;
          const highlight = selectedOp === 'broadcast' && lane.id === 0;
          const reduceHighlight = selectedOp === 'reduce' && lane.id === 0;
          return (
            <g key={lane.id}>
              <rect
                x={x - 20}
                y="115"
                width="50"
                height="50"
                fill={highlight || reduceHighlight ? COLORS.highlight : lane.color}
                stroke={highlight || reduceHighlight ? COLORS.orange : COLORS.primary}
                strokeWidth={highlight || reduceHighlight ? '2.5' : '1.5'}
              />
              <text
                x={x + 5}
                y="138"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill={COLORS.dark}
                fontFamily={FONTS.mono}
              >
                {lane.value}
              </text>
              <text
                x={x + 5}
                y="155"
                textAnchor="middle"
                fontSize="9"
                fill={COLORS.mid}
                fontFamily={FONTS.mono}
              >
                L{lane.id}
              </text>
            </g>
          );
        })}

        {/* Arrows for operations */}
        {renderArrows()}

        {/* Output state */}
        <text x="290" y="225" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.mid}>
          {t.outputState}
        </text>
        {lanes.map((lane, i) => {
          const x = 80 + i * 65;
          let outputValue = lane.value;
          let outputColor = lane.color;

          if (selectedOp === 'shuffle') {
            // Swap with lane XOR 4
            const swapIndex = lane.id ^ 4;
            outputValue = lanes[swapIndex].value;
            outputColor = lanes[swapIndex].color;
          } else if (selectedOp === 'broadcast') {
            outputValue = 'A';
            outputColor = lanes[0].color;
          } else if (selectedOp === 'reduce') {
            if (lane.id === 0) {
              outputValue = 'Σ';
              outputColor = COLORS.valid;
            } else {
              outputValue = '-';
              outputColor = COLORS.masked;
            }
          }

          return (
            <g key={lane.id}>
              <rect
                x={x - 20}
                y="235"
                width="50"
                height="50"
                fill={outputColor}
                stroke={COLORS.primary}
                strokeWidth="1.5"
              />
              <text
                x={x + 5}
                y="258"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill={COLORS.dark}
                fontFamily={FONTS.mono}
              >
                {outputValue}
              </text>
              <text
                x={x + 5}
                y="275"
                textAnchor="middle"
                fontSize="9"
                fill={COLORS.mid}
                fontFamily={FONTS.mono}
              >
                L{lane.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Description */}
      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
        <p className="text-sm text-gray-700 mb-2">{getDescription()}</p>
        <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono text-gray-800">
          {getCodeExample()}
        </code>
      </div>
    </div>
  );
};

export default SubgroupOps;
