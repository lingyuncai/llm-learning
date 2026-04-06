// src/components/interactive/IGpuRoofline.tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Kernel {
  name: string;
  ai: number; // Arithmetic Intensity (FLOP/Byte)
  perf: number; // Performance (GFLOPS)
  bound: 'compute' | 'memory';
}

const kernels: Kernel[] = [
  { name: 'MatMul-large', ai: 80, perf: 1800, bound: 'compute' },
  { name: 'MatMul-small', ai: 12, perf: 950, bound: 'memory' },
  { name: 'Softmax', ai: 2, perf: 180, bound: 'memory' },
  { name: 'LayerNorm', ai: 4, perf: 320, bound: 'memory' },
  { name: 'Conv', ai: 35, perf: 1400, bound: 'compute' },
];

const IGpuRoofline: React.FC = () => {
  const [selectedKernels, setSelectedKernels] = useState<Set<string>>(
    new Set(['MatMul-large', 'Softmax'])
  );

  const W = 580;
  const H = 380;
  const margin = { top: 30, right: 140, bottom: 60, left: 80 };
  const chartW = W - margin.left - margin.right;
  const chartH = H - margin.top - margin.bottom;

  // Roofline parameters (Xe2 iGPU)
  const xmxPeak = 2000; // GFLOPS (XMX matrix ops)
  const vectorPeak = 1200; // GFLOPS (non-matrix)
  const memBandwidth = 90; // GB/s (LPDDR5x)
  const ridgePoint = xmxPeak / memBandwidth; // AI where we hit compute bound

  // Log scale mapping
  const xMin = 0.5; // FLOP/Byte
  const xMax = 200;
  const yMin = 50; // GFLOPS
  const yMax = 3000;

  const xScale = (ai: number) => {
    const logMin = Math.log10(xMin);
    const logMax = Math.log10(xMax);
    const logVal = Math.log10(ai);
    return ((logVal - logMin) / (logMax - logMin)) * chartW;
  };

  const yScale = (perf: number) => {
    const logMin = Math.log10(yMin);
    const logMax = Math.log10(yMax);
    const logVal = Math.log10(perf);
    return chartH - ((logVal - logMin) / (logMax - logMin)) * chartH;
  };

  const toggleKernel = (name: string) => {
    const newSet = new Set(selectedKernels);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedKernels(newSet);
  };

  // Roofline lines
  const memoryBoundLine: [number, number][] = [
    [xMin, xMin * memBandwidth],
    [ridgePoint, xmxPeak],
  ];
  const computeBoundLineXMX: [number, number][] = [
    [ridgePoint, xmxPeak],
    [xMax, xmxPeak],
  ];
  const computeBoundLineVector: [number, number][] = [
    [ridgePoint * (vectorPeak / xmxPeak), vectorPeak],
    [xMax, vectorPeak],
  ];

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <marker
            id="arrow-roofline"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill={COLORS.mid} />
          </marker>
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Title */}
          <text
            x={chartW / 2}
            y={-10}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill={COLORS.dark}
            fontFamily={FONTS.sans}
          >
            Xe2 iGPU Roofline Model
          </text>

          {/* Axes */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={COLORS.mid} strokeWidth={2} />
          <line x1={0} y1={0} x2={0} y2={chartH} stroke={COLORS.mid} strokeWidth={2} />

          {/* X-axis label */}
          <text
            x={chartW / 2}
            y={chartH + 45}
            textAnchor="middle"
            fontSize="11"
            fill={COLORS.dark}
            fontFamily={FONTS.sans}
          >
            Arithmetic Intensity (FLOP/Byte, log scale)
          </text>

          {/* Y-axis label */}
          <text
            x={-chartH / 2}
            y={-55}
            textAnchor="middle"
            fontSize="11"
            fill={COLORS.dark}
            fontFamily={FONTS.sans}
            transform={`rotate(-90, -${chartH / 2}, -55)`}
          >
            Performance (GFLOPS, log scale)
          </text>

          {/* X-axis ticks */}
          {[1, 5, 10, 50, 100].map((val) => (
            <g key={val}>
              <line
                x1={xScale(val)}
                y1={chartH}
                x2={xScale(val)}
                y2={chartH + 5}
                stroke={COLORS.mid}
                strokeWidth={1}
              />
              <text
                x={xScale(val)}
                y={chartH + 18}
                textAnchor="middle"
                fontSize="9"
                fill={COLORS.mid}
                fontFamily={FONTS.sans}
              >
                {val}
              </text>
            </g>
          ))}

          {/* Y-axis ticks */}
          {[100, 500, 1000, 2000].map((val) => (
            <g key={val}>
              <line
                x1={0}
                y1={yScale(val)}
                x2={-5}
                y2={yScale(val)}
                stroke={COLORS.mid}
                strokeWidth={1}
              />
              <text
                x={-10}
                y={yScale(val) + 3}
                textAnchor="end"
                fontSize="9"
                fill={COLORS.mid}
                fontFamily={FONTS.sans}
              >
                {val}
              </text>
            </g>
          ))}

          {/* Memory bandwidth slope */}
          <path
            d={`M ${xScale(memoryBoundLine[0][0])} ${yScale(memoryBoundLine[0][1])} L ${xScale(memoryBoundLine[1][0])} ${yScale(memoryBoundLine[1][1])}`}
            stroke={COLORS.orange}
            strokeWidth={2.5}
            fill="none"
          />
          <text
            x={xScale(3)}
            y={yScale(3 * memBandwidth) - 8}
            fontSize="10"
            fill={COLORS.orange}
            fontFamily={FONTS.sans}
            fontWeight="600"
          >
            90 GB/s (LPDDR5x)
          </text>

          {/* XMX compute bound ceiling */}
          <path
            d={`M ${xScale(computeBoundLineXMX[0][0])} ${yScale(computeBoundLineXMX[0][1])} L ${xScale(computeBoundLineXMX[1][0])} ${yScale(computeBoundLineXMX[1][1])}`}
            stroke={COLORS.green}
            strokeWidth={2.5}
            fill="none"
          />
          <text
            x={xScale(120)}
            y={yScale(xmxPeak) - 8}
            fontSize="10"
            fill={COLORS.green}
            fontFamily={FONTS.sans}
            fontWeight="600"
          >
            XMX Peak: 2000 GFLOPS
          </text>

          {/* Vector compute bound ceiling */}
          <path
            d={`M ${xScale(computeBoundLineVector[0][0])} ${yScale(computeBoundLineVector[0][1])} L ${xScale(computeBoundLineVector[1][0])} ${yScale(computeBoundLineVector[1][1])}`}
            stroke={COLORS.primary}
            strokeWidth={2}
            fill="none"
            strokeDasharray="4 2"
          />
          <text
            x={xScale(120)}
            y={yScale(vectorPeak) - 8}
            fontSize="9"
            fill={COLORS.primary}
            fontFamily={FONTS.sans}
          >
            Vector Peak: 1200 GFLOPS
          </text>

          {/* Ridge point annotation */}
          <circle
            cx={xScale(ridgePoint)}
            cy={yScale(xmxPeak)}
            r={4}
            fill={COLORS.red}
            stroke={COLORS.dark}
            strokeWidth={1.5}
          />
          <text
            x={xScale(ridgePoint) + 8}
            y={yScale(xmxPeak) + 15}
            fontSize="9"
            fill={COLORS.red}
            fontFamily={FONTS.sans}
            fontWeight="600"
          >
            Ridge Point
          </text>

          {/* Kernel data points */}
          {kernels.map((kernel) => {
            const isSelected = selectedKernels.has(kernel.name);
            const color = kernel.bound === 'compute' ? COLORS.green : COLORS.orange;
            return (
              <g
                key={kernel.name}
                onClick={() => toggleKernel(kernel.name)}
                style={{ cursor: 'pointer' }}
                opacity={isSelected ? 1 : 0.3}
              >
                <circle
                  cx={xScale(kernel.ai)}
                  cy={yScale(kernel.perf)}
                  r={6}
                  fill={color}
                  stroke={COLORS.dark}
                  strokeWidth={1.5}
                />
                <text
                  x={xScale(kernel.ai) + 10}
                  y={yScale(kernel.perf) + 4}
                  fontSize="9"
                  fill={COLORS.dark}
                  fontFamily={FONTS.sans}
                  fontWeight={isSelected ? '600' : '400'}
                >
                  {kernel.name}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(${chartW + 15}, 20)`}>
            <text fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              Kernels (click):
            </text>
            <circle cx={5} cy={20} r={4} fill={COLORS.green} stroke={COLORS.dark} strokeWidth={1} />
            <text x={12} y={24} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
              Compute-bound
            </text>
            <circle cx={5} cy={40} r={4} fill={COLORS.orange} stroke={COLORS.dark} strokeWidth={1} />
            <text x={12} y={44} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
              Memory-bound
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default IGpuRoofline;
