import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

export default function GenSpecCompare() {
  const [selected, setSelected] = useState<'lunar' | 'panther'>('lunar');

  const W = 580;
  const H = 380;

  const specs = {
    lunar: {
      name: 'Lunar Lake',
      euCount: 128,
      xmxTops: 67,
      slm: 64,
      l2: 4,
      bandwidth: 90,
    },
    panther: {
      name: 'Panther Lake',
      euCount: 160,
      xmxTops: 96,
      slm: 128,
      l2: 8,
      bandwidth: 120,
    },
  };

  const current = specs[selected];
  const maxEU = 200;
  const maxTops = 120;
  const maxSLM = 150;
  const maxL2 = 10;
  const maxBW = 150;

  const metrics = [
    {
      label: 'EU Count',
      value: current.euCount,
      max: maxEU,
      unit: '',
      y: 80,
      improvement: ((specs.panther.euCount - specs.lunar.euCount) / specs.lunar.euCount) * 100,
    },
    {
      label: 'XMX TOPS (INT8)',
      value: current.xmxTops,
      max: maxTops,
      unit: ' TOPS',
      y: 140,
      improvement: ((specs.panther.xmxTops - specs.lunar.xmxTops) / specs.lunar.xmxTops) * 100,
    },
    {
      label: 'SLM per Xe-core',
      value: current.slm,
      max: maxSLM,
      unit: ' KB',
      y: 200,
      improvement: ((specs.panther.slm - specs.lunar.slm) / specs.lunar.slm) * 100,
    },
    {
      label: 'L2 Cache',
      value: current.l2,
      max: maxL2,
      unit: ' MB',
      y: 260,
      improvement: ((specs.panther.l2 - specs.lunar.l2) / specs.lunar.l2) * 100,
    },
    {
      label: 'Memory Bandwidth',
      value: current.bandwidth,
      max: maxBW,
      unit: ' GB/s',
      y: 320,
      improvement:
        ((specs.panther.bandwidth - specs.lunar.bandwidth) / specs.lunar.bandwidth) * 100,
    },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">代际对比：Lunar Lake vs Panther Lake</h3>
          <p className="text-sm text-gray-600">切换查看不同代次规格</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelected('lunar')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selected === 'lunar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Lunar Lake
          </button>
          <button
            onClick={() => setSelected('panther')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selected === 'panther'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Panther Lake
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
          fontSize={16}
          fontWeight="bold"
          fontFamily={FONTS.sans}
        >
          {current.name}
        </text>

        {/* Metrics */}
        {metrics.map((metric) => {
          const barWidth = (metric.value / metric.max) * 400;
          const showImprovement = selected === 'panther' && metric.improvement > 0;

          return (
            <g key={metric.label}>
              {/* Label */}
              <text
                x={20}
                y={metric.y - 5}
                fill={COLORS.dark}
                fontSize={12}
                fontWeight="600"
                fontFamily={FONTS.sans}
              >
                {metric.label}
              </text>

              {/* Background Bar */}
              <rect
                x={20}
                y={metric.y}
                width={400}
                height={24}
                fill={COLORS.light}
                stroke={COLORS.mid}
                strokeWidth={1}
                rx={3}
              />

              {/* Value Bar with Animation */}
              <motion.rect
                x={20}
                y={metric.y}
                width={barWidth}
                height={24}
                fill={selected === 'lunar' ? COLORS.primary : COLORS.green}
                rx={3}
                initial={{ width: 0 }}
                animate={{ width: barWidth }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />

              {/* Value Text */}
              <text
                x={30 + barWidth}
                y={metric.y + 16}
                fill={COLORS.dark}
                fontSize={12}
                fontWeight="bold"
                fontFamily={FONTS.mono}
              >
                {metric.value}
                {metric.unit}
              </text>

              {/* Improvement Badge */}
              {showImprovement && (
                <g>
                  <rect
                    x={440}
                    y={metric.y + 2}
                    width={120}
                    height={20}
                    fill={COLORS.green}
                    rx={3}
                    opacity={0.9}
                  />
                  <text
                    x={500}
                    y={metric.y + 15}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontWeight="bold"
                    fontFamily={FONTS.sans}
                  >
                    +{metric.improvement.toFixed(0)}% 提升
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Summary Note */}
        {selected === 'panther' && (
          <g>
            <rect x={20} y={355} width={540} height={20} fill={COLORS.highlight} rx={3} />
            <text
              x={290}
              y={369}
              textAnchor="middle"
              fill={COLORS.dark}
              fontSize={11}
              fontWeight="600"
              fontFamily={FONTS.sans}
            >
              Panther Lake 显著提升了 AI 算力和内存子系统，更适合大规模推理工作负载
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
