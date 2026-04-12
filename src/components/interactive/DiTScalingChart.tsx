import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;

interface ModelPoint {
  name: string;
  params: string;
  gflops: number;
  fid: number;
  color: string;
  type: 'dit' | 'baseline';
}

// Data from DiT paper (Peebles & Xie, 2023) — Table 1 & Figure 4
// GFLOPs approximate per image at 256×256 resolution
const models: ModelPoint[] = [
  { name: 'DiT-S/2', params: '33M', gflops: 6, fid: 68.4, color: HEAD_COLORS[0], type: 'dit' },
  { name: 'DiT-B/2', params: '130M', gflops: 23, fid: 43.5, color: HEAD_COLORS[0], type: 'dit' },
  { name: 'DiT-L/2', params: '458M', gflops: 80, fid: 23.3, color: HEAD_COLORS[0], type: 'dit' },
  { name: 'DiT-XL/2', params: '675M', gflops: 119, fid: 9.62, color: HEAD_COLORS[2], type: 'dit' },
  // Baselines (U-Net based)
  { name: 'LDM-4', params: '400M', gflops: 104, fid: 10.56, color: HEAD_COLORS[4], type: 'baseline' },
  { name: 'ADM', params: '554M', gflops: 1120, fid: 10.94, color: HEAD_COLORS[4], type: 'baseline' },
  { name: 'ADM-U', params: '730M', gflops: 1500, fid: 7.49, color: HEAD_COLORS[3], type: 'baseline' },
];

export default function DiTScalingChart({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'DiT Scaling：FID vs 计算量',
      xLabel: 'GFLOPs (对数尺度)',
      yLabel: 'FID ↓ (越低越好)',
      insight: 'DiT 在更少计算量下达到可比 FID — Transformer 架构 scaling 更高效',
      dit: 'DiT 系列',
      unet: 'U-Net 基线',
      withCFG: '(w/ CFG)',
      params: '参数量',
    },
    en: {
      title: 'DiT Scaling: FID vs Compute',
      xLabel: 'GFLOPs (log scale)',
      yLabel: 'FID ↓ (lower is better)',
      insight: 'DiT achieves comparable FID with less compute — Transformer scaling is more efficient',
      dit: 'DiT family',
      unet: 'U-Net baselines',
      withCFG: '(w/ CFG)',
      params: 'Params',
    },
  }[locale]!;

  const [hoveredModel, setHoveredModel] = useState<number | null>(null);

  // Chart area
  const chartLeft = 90;
  const chartRight = W - 150;
  const chartTop = 60;
  const chartBottom = H - 80;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  // Log scale for x (GFLOPs): range ~5 to ~2000
  const xMin = Math.log10(4);
  const xMax = Math.log10(2000);
  // Log scale for y (FID): range ~5 to ~100
  const yMin = Math.log10(5);
  const yMax = Math.log10(100);

  function xPos(gflops: number): number {
    const logVal = Math.log10(gflops);
    return chartLeft + ((logVal - xMin) / (xMax - xMin)) * chartW;
  }

  function yPos(fid: number): number {
    const logVal = Math.log10(fid);
    return chartTop + ((logVal - yMin) / (yMax - yMin)) * chartH;
  }

  // X grid values
  const xGridValues = [5, 10, 50, 100, 500, 1000];
  // Y grid values
  const yGridValues = [5, 10, 20, 50, 100];

  // DiT trend line points
  const ditModels = models.filter(m => m.type === 'dit');
  const ditLinePoints = ditModels.map(m => `${xPos(m.gflops)},${yPos(m.fid)}`).join(' ');

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

        {/* Y grid lines */}
        {yGridValues.map((val) => (
          <g key={`ygrid-${val}`}>
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

        {/* X grid lines */}
        {xGridValues.map((val) => (
          <g key={`xgrid-${val}`}>
            <line
              x1={xPos(val)} y1={chartTop}
              x2={xPos(val)} y2={chartBottom}
              stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4 4"
            />
            <text x={xPos(val)} y={chartBottom + 16}
              textAnchor="middle" fontSize="10" fill={COLORS.mid}>
              {val}
            </text>
          </g>
        ))}

        {/* DiT trend line */}
        <motion.polyline
          points={ditLinePoints}
          fill="none" stroke={COLORS.primary} strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />

        {/* DiT efficiency zone (shaded area showing better compute efficiency) */}
        <rect x={chartLeft} y={yPos(15)} width={xPos(150) - chartLeft} height={yPos(70) - yPos(15)}
          fill={COLORS.valid} opacity={0.1} rx={4} />
        <text x={chartLeft + 15} y={yPos(50) + 4} fontSize="8" fill={COLORS.primary} opacity={0.6}>
          {t.dit}
        </text>

        {/* U-Net zone */}
        <rect x={xPos(80)} y={yPos(7)} width={xPos(1800) - xPos(80)} height={yPos(12) - yPos(7)}
          fill={COLORS.waste} opacity={0.1} rx={4} />
        <text x={xPos(400)} y={yPos(8) + 4} fontSize="8" fill={COLORS.red} opacity={0.6}>
          {t.unet}
        </text>

        {/* Model points */}
        {models.map((model, i) => {
          const cx = xPos(model.gflops);
          const cy = yPos(model.fid);
          const isHovered = hoveredModel === i;
          const isDiT = model.type === 'dit';

          return (
            <g key={model.name}
              onMouseEnter={() => setHoveredModel(i)}
              onMouseLeave={() => setHoveredModel(null)}
              style={{ cursor: 'pointer' }}
            >
              <motion.circle
                cx={cx} cy={cy}
                r={isHovered ? 8 : 6}
                fill={model.color}
                stroke={COLORS.bg}
                strokeWidth={2}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  opacity: hoveredModel === null || isHovered ? 1 : 0.4,
                }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              />

              {/* Point shape: circle for DiT, diamond for baseline */}
              {!isDiT && (
                <motion.rect
                  x={cx - 5} y={cy - 5}
                  width={10} height={10}
                  fill={model.color} stroke={COLORS.bg} strokeWidth={1.5}
                  transform={`rotate(45, ${cx}, ${cy})`}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    opacity: hoveredModel === null || isHovered ? 1 : 0.4,
                  }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                />
              )}

              {/* Label */}
              <motion.text
                x={cx} y={cy - 12}
                textAnchor="middle" fontSize="9" fontWeight="600"
                fill={model.color}
                animate={{ opacity: isHovered || hoveredModel === null ? 1 : 0.3 }}
              >
                {model.name}
              </motion.text>

              {/* Details on hover */}
              {isHovered && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <rect x={cx - 55} y={cy + 10} width={110} height={36} rx={4}
                    fill={COLORS.bg} stroke={model.color} strokeWidth={1} />
                  <text x={cx} y={cy + 24} textAnchor="middle" fontSize="8" fill={COLORS.dark}>
                    {t.params}: {model.params}
                  </text>
                  <text x={cx} y={cy + 36} textAnchor="middle" fontSize="8" fontWeight="600" fill={model.color}>
                    FID: {model.fid} {model.name === 'DiT-XL/2' ? t.withCFG : ''}
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={(chartLeft + chartRight) / 2} y={H - 35} textAnchor="middle" fontSize="12" fill={COLORS.dark} fontWeight="500">
          {t.xLabel}
        </text>
        <text x={20} y={chartTop + chartH / 2} textAnchor="middle" fontSize="12" fill={COLORS.dark} fontWeight="500"
          transform={`rotate(-90, 20, ${chartTop + chartH / 2})`}>
          {t.yLabel}
        </text>

        {/* Legend */}
        <g transform={`translate(${chartRight + 15}, ${chartTop + 15})`}>
          <circle cx={8} cy={0} r={5} fill={HEAD_COLORS[0]} />
          <text x={18} y={3} fontSize="9" fill={COLORS.dark}>{t.dit}</text>

          <rect x={3} y={18} width={8} height={8} fill={HEAD_COLORS[4]}
            transform={`rotate(45, 7, 22)`} />
          <text x={18} y={25} fontSize="9" fill={COLORS.dark}>{t.unet}</text>
        </g>

        {/* Insight */}
        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="11" fontWeight="500" fill={COLORS.primary}>
          {t.insight}
        </text>
      </svg>
    </div>
  );
}
