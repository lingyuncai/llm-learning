import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

// Data inspired by ViT paper (Dosovitskiy et al., 2020) Figure 3/5
// X-axis: dataset size (log scale conceptually: 1M, 14M, 300M)
// Y-axis: ImageNet top-1 accuracy
const datasets = ['ImageNet-1k\n(1.3M)', 'ImageNet-21k\n(14M)', 'JFT-300M\n(300M)'];
const datasetPositions = [0, 1, 2];

interface ModelData {
  name: string;
  color: string;
  // Accuracy values at each dataset size (approximate from ViT paper)
  values: number[];
  type: 'cnn' | 'vit';
}

const models: ModelData[] = [
  { name: 'ResNet-152', color: HEAD_COLORS[4], values: [79.9, 83.0, 84.2], type: 'cnn' },
  { name: 'ViT-B/16', color: HEAD_COLORS[0], values: [77.9, 84.0, 84.7], type: 'vit' },
  { name: 'ViT-L/16', color: HEAD_COLORS[2], values: [76.5, 85.3, 87.1], type: 'vit' },
  { name: 'ViT-H/14', color: HEAD_COLORS[3], values: [74.0, 85.8, 88.5], type: 'vit' },
];

export default function ViTScalingChart({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'ViT vs CNN：数据规模与性能',
      xLabel: '预训练数据集规模',
      yLabel: 'ImageNet Top-1 准确率 (%)',
      insight: '小数据集上 CNN 胜出（归纳偏置优势），大数据集上 ViT 逆转（规模效应）',
      cnnWins: 'CNN 优势区',
      vitWins: 'ViT 优势区',
      cnn: 'CNN',
      vit: 'ViT',
    },
    en: {
      title: 'ViT vs CNN: Scaling with Data',
      xLabel: 'Pre-training Dataset Size',
      yLabel: 'ImageNet Top-1 Accuracy (%)',
      insight: 'CNN wins with small data (inductive bias advantage), ViT wins with large data (scaling effect)',
      cnnWins: 'CNN wins',
      vitWins: 'ViT wins',
      cnn: 'CNN',
      vit: 'ViT',
    },
  }[locale]!;

  const [hoveredModel, setHoveredModel] = useState<number | null>(null);

  // Chart area
  const chartLeft = 100;
  const chartRight = W - 120;
  const chartTop = 70;
  const chartBottom = H - 100;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  // Y-axis range
  const yMin = 72;
  const yMax = 90;

  function xPos(idx: number): number {
    return chartLeft + (idx / (datasets.length - 1)) * chartW;
  }

  function yPos(val: number): number {
    return chartBottom - ((val - yMin) / (yMax - yMin)) * chartH;
  }

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={30} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Chart area background */}
        <rect x={chartLeft} y={chartTop} width={chartW} height={chartH}
          fill={COLORS.bgAlt} rx={4} />

        {/* Grid lines */}
        {[72, 74, 76, 78, 80, 82, 84, 86, 88, 90].map((val) => (
          <g key={`grid-${val}`}>
            <line
              x1={chartLeft} y1={yPos(val)}
              x2={chartRight} y2={yPos(val)}
              stroke={COLORS.light} strokeWidth={0.5}
            />
            <text x={chartLeft - 8} y={yPos(val) + 3}
              textAnchor="end" fontSize="10" fill={COLORS.mid}>
              {val}
            </text>
          </g>
        ))}

        {/* Vertical grid lines at data points */}
        {datasetPositions.map((_, i) => (
          <line key={`vgrid-${i}`}
            x1={xPos(i)} y1={chartTop}
            x2={xPos(i)} y2={chartBottom}
            stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4 4"
          />
        ))}

        {/* Background zones: CNN vs ViT advantage */}
        <rect x={chartLeft} y={chartTop} width={chartW * 0.3} height={chartH}
          fill={COLORS.waste} opacity={0.15} />
        <rect x={chartLeft + chartW * 0.5} y={chartTop} width={chartW * 0.5} height={chartH}
          fill={COLORS.valid} opacity={0.15} />

        <text x={chartLeft + chartW * 0.15} y={chartTop + 18}
          textAnchor="middle" fontSize="9" fill={COLORS.red} opacity={0.7}>
          {t.cnnWins}
        </text>
        <text x={chartLeft + chartW * 0.75} y={chartTop + 18}
          textAnchor="middle" fontSize="9" fill={COLORS.primary} opacity={0.7}>
          {t.vitWins}
        </text>

        {/* Model lines and data points */}
        {models.map((model, mi) => {
          const isHovered = hoveredModel === mi;
          const points = model.values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
          return (
            <g key={model.name}
              onMouseEnter={() => setHoveredModel(mi)}
              onMouseLeave={() => setHoveredModel(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Line */}
              <motion.polyline
                points={points}
                fill="none"
                stroke={model.color}
                strokeWidth={isHovered ? 3 : 2}
                strokeDasharray={model.type === 'cnn' ? '6 3' : 'none'}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isHovered || hoveredModel === null ? 1 : 0.3 }}
                transition={{ duration: 1, delay: mi * 0.2 }}
              />

              {/* Data points */}
              {model.values.map((val, i) => (
                <motion.circle
                  key={`${mi}-${i}`}
                  cx={xPos(i)} cy={yPos(val)}
                  r={isHovered ? 6 : 4}
                  fill={model.color}
                  stroke={COLORS.bg}
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    opacity: isHovered || hoveredModel === null ? 1 : 0.3,
                  }}
                  transition={{ delay: mi * 0.2 + i * 0.1, duration: 0.3 }}
                />
              ))}

              {/* Value labels on hover */}
              {isHovered && model.values.map((val, i) => (
                <text key={`label-${mi}-${i}`}
                  x={xPos(i)} y={yPos(val) - 10}
                  textAnchor="middle" fontSize="10" fontWeight="600" fill={model.color}>
                  {val}%
                </text>
              ))}
            </g>
          );
        })}

        {/* X-axis labels */}
        {datasets.map((label, i) => {
          const lines = label.split('\n');
          return (
            <g key={`xlabel-${i}`}>
              {lines.map((line, li) => (
                <text key={li} x={xPos(i)} y={chartBottom + 18 + li * 14}
                  textAnchor="middle" fontSize="10" fill={COLORS.dark}
                  fontWeight={li === 0 ? '600' : '400'}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="12" fill={COLORS.dark} fontWeight="500">
          {t.xLabel}
        </text>
        <text x={20} y={chartTop + chartH / 2} textAnchor="middle" fontSize="12" fill={COLORS.dark} fontWeight="500"
          transform={`rotate(-90, 20, ${chartTop + chartH / 2})`}>
          {t.yLabel}
        </text>

        {/* Legend */}
        {models.map((model, i) => {
          const legendX = chartRight + 15;
          const legendY = chartTop + 30 + i * 24;
          return (
            <g key={`legend-${i}`}
              onMouseEnter={() => setHoveredModel(i)}
              onMouseLeave={() => setHoveredModel(null)}
              style={{ cursor: 'pointer' }}
            >
              <line x1={legendX} y1={legendY} x2={legendX + 20} y2={legendY}
                stroke={model.color} strokeWidth={2}
                strokeDasharray={model.type === 'cnn' ? '4 2' : 'none'} />
              <circle cx={legendX + 10} cy={legendY} r={3} fill={model.color} />
              <text x={legendX + 26} y={legendY + 3} fontSize="10" fill={COLORS.dark}
                fontWeight={hoveredModel === i ? '700' : '400'}>
                {model.name}
              </text>
            </g>
          );
        })}

        {/* Key insight */}
        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fontWeight="500" fill={COLORS.primary}>
          {t.insight}
        </text>
      </svg>
    </div>
  );
}
