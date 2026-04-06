// src/components/interactive/BenchmarkDashboard.tsx
import React from 'react';
import { COLORS, FONTS } from './shared/colors';

const BenchmarkDashboard: React.FC = () => {
  const W = 580;
  const H = 380;

  const outputLines = [
    { text: '[Step 10/11] Measuring performance', highlight: false },
    { text: '[ INFO ] Count:      1000 iterations', highlight: false },
    { text: '[ INFO ] Duration:   10023.45 ms', highlight: false },
    { text: '[ INFO ] Latency:', highlight: false },
    { text: '[ INFO ]    Median:   9.82 ms', highlight: 'median' },
    { text: '[ INFO ]    Average:  10.02 ms', highlight: false },
    { text: '[ INFO ]    Min:      8.15 ms', highlight: false },
    { text: '[ INFO ]    Max:      25.67 ms', highlight: 'max' },
    { text: '[ INFO ]    P99:      15.23 ms', highlight: 'p99' },
    { text: '[ INFO ] Throughput: 99.77 FPS', highlight: 'throughput' },
  ];

  const annotations = [
    { key: 'median', label: '最稳定指标，受异常值影响最小', x: 320, y: 145, targetY: 145 },
    { key: 'p99', label: '99th percentile，用于 SLA', x: 320, y: 225, targetY: 225 },
    { key: 'max', label: '首次推理最慢（kernel 编译），用 cache 消除', x: 320, y: 185, targetY: 185 },
    { key: 'throughput', label: 'FPS = 1000 / avg_latency × nireq', x: 320, y: 265, targetY: 265 },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <marker
            id="arrow-bench"
            markerWidth="8"
            markerHeight="8"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,3 L6,0 L6,6 z" fill={COLORS.primary} />
          </marker>
        </defs>

        {/* Title */}
        <text
          x={W / 2}
          y={25}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill={COLORS.dark}
          fontFamily={FONTS.sans}
        >
          OpenVINO benchmark_app 输出 (模拟)
        </text>

        {/* Console output box */}
        <rect
          x={20}
          y={45}
          width={280}
          height={300}
          fill={COLORS.dark}
          rx={4}
          stroke={COLORS.mid}
          strokeWidth={1.5}
        />

        {/* Console text */}
        {outputLines.map((line, idx) => {
          const y = 65 + idx * 28;
          const isHighlighted = line.highlight;
          return (
            <text
              key={idx}
              x={30}
              y={y}
              fontSize="9"
              fill={isHighlighted ? COLORS.green : COLORS.light}
              fontFamily={FONTS.mono}
              fontWeight={isHighlighted ? '600' : '400'}
            >
              {line.text}
            </text>
          );
        })}

        {/* Annotations */}
        {annotations.map((anno, idx) => {
          const lineData = outputLines.find((l) => l.highlight === anno.key);
          if (!lineData) return null;

          const targetX = 300;

          return (
            <g key={idx}>
              {/* Arrow */}
              <line
                x1={anno.x}
                y1={anno.y}
                x2={targetX}
                y2={anno.targetY}
                stroke={COLORS.primary}
                strokeWidth={1.5}
                markerEnd="url(#arrow-bench)"
              />
              {/* Annotation text */}
              <text
                x={anno.x + 5}
                y={anno.y - 5}
                fontSize="9"
                fill={COLORS.primary}
                fontFamily={FONTS.sans}
              >
                {anno.label}
              </text>
            </g>
          );
        })}

        {/* Footer note */}
        <text
          x={W / 2}
          y={H - 10}
          textAnchor="middle"
          fontSize="9"
          fill={COLORS.mid}
          fontFamily={FONTS.sans}
          fontStyle="italic"
        >
          benchmark_app -m model.xml -d GPU -niter 1000
        </text>
      </svg>
    </div>
  );
};

export default BenchmarkDashboard;
