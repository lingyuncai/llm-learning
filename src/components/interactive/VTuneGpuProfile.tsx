// src/components/interactive/VTuneGpuProfile.tsx
import React from 'react';
import { COLORS, FONTS } from './shared/colors';

const VTuneGpuProfile: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const W = 580;
  const H = 360;
  const margin = { top: 40, right: 30, bottom: 20, left: 180 };
  const barW = W - margin.left - margin.right;
  const rowH = 50;

  const t = {
    zh: {
      title: 'VTune GPU Profiling View (模拟)',
      footer: 'VTune GPU Compute/Media Hotspots 分析视图示例',
      euActiveAnnotation: '越高越好，目标 >80%',
      euStallAnnotation: '高 stall = 等待数据或同步',
      euIdleAnnotation: '高 idle = occupancy 不足',
      l3Annotation: '接近峰值 = memory-bound',
    },
    en: {
      title: 'VTune GPU Profiling View (Simulated)',
      footer: 'VTune GPU Compute/Media Hotspots Analysis View Example',
      euActiveAnnotation: 'Higher is better, target >80%',
      euStallAnnotation: 'High stall = waiting for data/sync',
      euIdleAnnotation: 'High idle = low occupancy',
      l3Annotation: 'Near peak = memory-bound',
    },
  }[locale];

  const metrics = [
    {
      label: 'EU Active',
      value: 72,
      peak: 100,
      color: COLORS.green,
      annotation: t.euActiveAnnotation,
      annotationX: 380,
    },
    {
      label: 'EU Stall',
      value: 18,
      peak: 100,
      color: COLORS.orange,
      annotation: t.euStallAnnotation,
      annotationX: 380,
    },
    {
      label: 'EU Idle',
      value: 10,
      peak: 100,
      color: COLORS.mid,
      annotation: t.euIdleAnnotation,
      annotationX: 380,
    },
    {
      label: 'L3 Bandwidth',
      value: 45,
      peak: 90,
      color: COLORS.primary,
      unit: ' GB/s',
      annotation: t.l3Annotation,
      annotationX: 380,
    },
    {
      label: 'SLM Usage',
      value: 32,
      peak: 64,
      color: COLORS.purple,
      unit: ' KB',
      annotation: '',
      annotationX: 380,
    },
    {
      label: 'XMX Busy',
      value: 65,
      peak: 100,
      color: COLORS.green,
      annotation: '',
      annotationX: 380,
    },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <marker
            id="arrow-vtune"
            markerWidth="8"
            markerHeight="8"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,3 L6,0 L6,6 z" fill={COLORS.red} />
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
          {t.title}
        </text>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Metrics rows */}
          {metrics.map((metric, idx) => {
            const y = idx * rowH;
            const barLength = (metric.value / metric.peak) * barW;
            const percentage = Math.round((metric.value / metric.peak) * 100);

            return (
              <g key={idx}>
                {/* Label */}
                <text
                  x={-10}
                  y={y + 20}
                  textAnchor="end"
                  fontSize="11"
                  fill={COLORS.dark}
                  fontFamily={FONTS.sans}
                  fontWeight="600"
                >
                  {metric.label}:
                </text>

                {/* Bar background */}
                <rect
                  x={0}
                  y={y + 5}
                  width={barW}
                  height={30}
                  fill={COLORS.bgAlt}
                  stroke={COLORS.light}
                  strokeWidth={1}
                  rx={2}
                />

                {/* Bar fill */}
                <rect
                  x={0}
                  y={y + 5}
                  width={barLength}
                  height={30}
                  fill={metric.color}
                  opacity={0.8}
                  rx={2}
                />

                {/* Value text */}
                <text
                  x={barLength + 8}
                  y={y + 24}
                  fontSize="10"
                  fill={COLORS.dark}
                  fontFamily={FONTS.mono}
                  fontWeight="600"
                >
                  {metric.value}
                  {metric.unit || '%'} ({percentage}%)
                </text>

                {/* Annotation arrows for key metrics */}
                {metric.annotation && (
                  <>
                    <line
                      x1={metric.annotationX}
                      y1={y + 20}
                      x2={barLength + 60}
                      y2={y + 20}
                      stroke={COLORS.red}
                      strokeWidth={1.5}
                      markerEnd="url(#arrow-vtune)"
                    />
                    <text
                      x={metric.annotationX + 5}
                      y={y + 15}
                      fontSize="9"
                      fill={COLORS.red}
                      fontFamily={FONTS.sans}
                    >
                      {metric.annotation}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Footer note */}
        <text
          x={W / 2}
          y={H - 5}
          textAnchor="middle"
          fontSize="9"
          fill={COLORS.mid}
          fontFamily={FONTS.sans}
          fontStyle="italic"
        >
          {t.footer}
        </text>
      </svg>
    </div>
  );
};

export default VTuneGpuProfile;
