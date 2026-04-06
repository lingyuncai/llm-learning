import React, { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

type ModelSize = 'small' | 'medium' | 'large';

interface DataPoint {
  label: string;
  power: number; // Watts
  throughput: number; // infer/s
  color: string;
}

const PowerPerfTradeoff: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      title: '功耗-性能权衡曲线',
      throughput: '吞吐量 (infer/s)',
      power: '功耗 (Watts)',
      pureNPU: '纯 NPU',
      hybrid: 'GPU+NPU 混合',
      pureGPU: '纯 GPU',
      infoLine1: '💡 续航优先场景 → 纯 NPU；插电高性能场景 → GPU 或混合',
      infoLine2: '混合方案在多数场景下提供最佳能效比 (吞吐/瓦特)',
      smallModel: '小模型 (7B)',
      mediumModel: '中模型 (13B)',
      largeModel: '大模型 (70B)',
    },
    en: {
      title: 'Power-Performance Tradeoff Curve',
      throughput: 'Throughput (infer/s)',
      power: 'Power (Watts)',
      pureNPU: 'Pure NPU',
      hybrid: 'GPU+NPU Hybrid',
      pureGPU: 'Pure GPU',
      infoLine1: '💡 Battery-first → Pure NPU; Plugged-in high-perf → GPU or Hybrid',
      infoLine2: 'Hybrid offers best efficiency (throughput/watt) in most scenarios',
      smallModel: 'Small (7B)',
      mediumModel: 'Medium (13B)',
      largeModel: 'Large (70B)',
    },
  }[locale];

  const [modelSize, setModelSize] = useState<ModelSize>('medium');

  const dataPoints = useMemo(() => {
    const configs: Record<ModelSize, DataPoint[]> = {
      small: [
        { label: t.pureNPU, power: 5, throughput: 45, color: COLORS.primary },
        { label: t.hybrid, power: 12, throughput: 60, color: COLORS.orange },
        { label: t.pureGPU, power: 18, throughput: 70, color: COLORS.green },
      ],
      medium: [
        { label: t.pureNPU, power: 8, throughput: 28, color: COLORS.primary },
        { label: t.hybrid, power: 20, throughput: 55, color: COLORS.orange },
        { label: t.pureGPU, power: 30, throughput: 75, color: COLORS.green },
      ],
      large: [
        { label: t.pureNPU, power: 12, throughput: 15, color: COLORS.primary },
        { label: t.hybrid, power: 35, throughput: 45, color: COLORS.orange },
        { label: t.pureGPU, power: 50, throughput: 80, color: COLORS.green },
      ],
    };
    return configs[modelSize];
  }, [modelSize, t]);

  // Scale for axes
  const maxPower = 60;
  const maxThroughput = 100;
  const plotWidth = 400;
  const plotHeight = 240;
  const marginLeft = 60;
  const marginBottom = 50;
  const marginTop = 20;

  const scaleX = (power: number) => marginLeft + (power / maxPower) * plotWidth;
  const scaleY = (throughput: number) => marginTop + plotHeight - (throughput / maxThroughput) * plotHeight;

  // Efficiency frontier (connect sorted points)
  const sortedPoints = [...dataPoints].sort((a, b) => a.power - b.power);

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 360" className="w-full">
        {/* Title */}
        <text x="290" y="20" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.title}
        </text>

        {/* Y axis */}
        <line
          x1={marginLeft}
          y1={marginTop}
          x2={marginLeft}
          y2={marginTop + plotHeight}
          stroke={COLORS.mid}
          strokeWidth="2"
        />
        <text
          x={marginLeft - 10}
          y={marginTop - 5}
          textAnchor="end"
          fontSize="11"
          fontWeight="600"
          fill={COLORS.dark}
          fontFamily={FONTS.sans}
        >
          {t.throughput}
        </text>

        {/* Y axis ticks */}
        {[0, 25, 50, 75, 100].map((val) => (
          <g key={val}>
            <line
              x1={marginLeft - 5}
              y1={scaleY(val)}
              x2={marginLeft}
              y2={scaleY(val)}
              stroke={COLORS.mid}
              strokeWidth="1"
            />
            <text
              x={marginLeft - 10}
              y={scaleY(val) + 4}
              textAnchor="end"
              fontSize="10"
              fill={COLORS.mid}
              fontFamily={FONTS.mono}
            >
              {val}
            </text>
            <line
              x1={marginLeft}
              y1={scaleY(val)}
              x2={marginLeft + plotWidth}
              y2={scaleY(val)}
              stroke={COLORS.light}
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* X axis */}
        <line
          x1={marginLeft}
          y1={marginTop + plotHeight}
          x2={marginLeft + plotWidth}
          y2={marginTop + plotHeight}
          stroke={COLORS.mid}
          strokeWidth="2"
        />
        <text
          x={marginLeft + plotWidth / 2}
          y={marginTop + plotHeight + 35}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill={COLORS.dark}
          fontFamily={FONTS.sans}
        >
          {t.power}
        </text>

        {/* X axis ticks */}
        {[0, 10, 20, 30, 40, 50, 60].map((val) => (
          <g key={val}>
            <line
              x1={scaleX(val)}
              y1={marginTop + plotHeight}
              x2={scaleX(val)}
              y2={marginTop + plotHeight + 5}
              stroke={COLORS.mid}
              strokeWidth="1"
            />
            <text
              x={scaleX(val)}
              y={marginTop + plotHeight + 18}
              textAnchor="middle"
              fontSize="10"
              fill={COLORS.mid}
              fontFamily={FONTS.mono}
            >
              {val}
            </text>
          </g>
        ))}

        {/* Efficiency frontier line */}
        <path
          d={sortedPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.power)} ${scaleY(p.throughput)}`)
            .join(' ')}
          stroke={COLORS.orange}
          strokeWidth="2"
          strokeDasharray="5,3"
          fill="none"
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <g key={i}>
            <circle
              cx={scaleX(point.power)}
              cy={scaleY(point.throughput)}
              r="8"
              fill={point.color}
              opacity="0.8"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={scaleX(point.power)}
              y={scaleY(point.throughput) - 15}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={point.color}
              fontFamily={FONTS.sans}
            >
              {point.label}
            </text>
            <text
              x={scaleX(point.power)}
              y={scaleY(point.throughput) + 25}
              textAnchor="middle"
              fontSize="9"
              fill={COLORS.mid}
              fontFamily={FONTS.mono}
            >
              {point.throughput.toFixed(0)} infer/s
            </text>
          </g>
        ))}

        {/* Info box */}
        <g transform="translate(60, 305)">
          <rect x="0" y="0" width="400" height="40" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <text x="200" y="16" textAnchor="middle" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.infoLine1}
          </text>
          <text x="200" y="32" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.infoLine2}
          </text>
        </g>
      </svg>

      {/* Model size selector */}
      <div className="flex gap-2 mt-4 justify-center">
        <button
          onClick={() => setModelSize('small')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            modelSize === 'small'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t.smallModel}
        </button>
        <button
          onClick={() => setModelSize('medium')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            modelSize === 'medium'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t.mediumModel}
        </button>
        <button
          onClick={() => setModelSize('large')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            modelSize === 'large'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t.largeModel}
        </button>
      </div>
    </div>
  );
};

export default PowerPerfTradeoff;
