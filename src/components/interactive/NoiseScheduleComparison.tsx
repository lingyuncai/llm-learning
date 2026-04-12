import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 350;
const T_STEPS = 1000;
const PLOT_X = 80;
const PLOT_Y = 50;
const PLOT_W = 650;
const PLOT_H = 220;

// Compute alpha_bar for linear schedule
function linearSchedule(): number[] {
  const betas: number[] = [];
  for (let i = 0; i < T_STEPS; i++) {
    betas.push(0.0001 + (0.02 - 0.0001) * (i / (T_STEPS - 1)));
  }
  const alphaBars: number[] = [];
  let prod = 1.0;
  for (let i = 0; i < T_STEPS; i++) {
    prod *= (1 - betas[i]);
    alphaBars.push(prod);
  }
  return alphaBars;
}

// Compute alpha_bar for cosine schedule
function cosineSchedule(): number[] {
  const s = 0.008;
  const alphaBars: number[] = [];
  for (let i = 0; i < T_STEPS; i++) {
    const t1 = (i / T_STEPS + s) / (1 + s);
    const t0 = (0 / T_STEPS + s) / (1 + s);
    const val = (Math.cos(t1 * Math.PI / 2) ** 2) / (Math.cos(t0 * Math.PI / 2) ** 2);
    alphaBars.push(Math.max(0.001, Math.min(1, val)));
  }
  return alphaBars;
}

function dataToPath(data: number[], color: string): string {
  const points = data.map((v, i) => {
    const x = PLOT_X + (i / (data.length - 1)) * PLOT_W;
    const y = PLOT_Y + PLOT_H - v * PLOT_H;
    return `${x},${y}`;
  });
  // Downsample for SVG performance: take every 5th point
  const sampled = points.filter((_, i) => i % 5 === 0 || i === points.length - 1);
  return `M${sampled.join(' L')}`;
}

export default function NoiseScheduleComparison({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '噪声调度策略对比',
      linear: '线性调度 (Linear)',
      cosine: '余弦调度 (Cosine)',
      xAxis: '时间步 t',
      yAxis: 'ᾱₜ',
      hoverInfo: (step: number, linVal: number, cosVal: number) =>
        `t=${step}  线性: ${linVal.toFixed(4)}  余弦: ${cosVal.toFixed(4)}`,
      annotation: '线性调度在低噪声区域浪费了大量步数',
      annotationCosine: '余弦调度更均匀地分配噪声',
    },
    en: {
      title: 'Noise Schedule Comparison',
      linear: 'Linear Schedule',
      cosine: 'Cosine Schedule',
      xAxis: 'Timestep t',
      yAxis: 'ᾱₜ',
      hoverInfo: (step: number, linVal: number, cosVal: number) =>
        `t=${step}  Linear: ${linVal.toFixed(4)}  Cosine: ${cosVal.toFixed(4)}`,
      annotation: 'Linear wastes many steps in low-noise region',
      annotationCosine: 'Cosine distributes noise more evenly',
    },
  }[locale]!;

  const [hoverStep, setHoverStep] = useState<number | null>(null);

  const linearData = useMemo(() => linearSchedule(), []);
  const cosineData = useMemo(() => cosineSchedule(), []);

  const linearPath = useMemo(() => dataToPath(linearData, COLORS.primary), [linearData]);
  const cosinePath = useMemo(() => dataToPath(cosineData, COLORS.green), [cosineData]);

  // Handle mouse move over plot area
  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) / rect.width * W;
    const step = Math.round(((svgX - PLOT_X) / PLOT_W) * (T_STEPS - 1));
    if (step >= 0 && step < T_STEPS) {
      setHoverStep(step);
    }
  };

  // Grid lines
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];
  const xTicks = [0, 200, 400, 600, 800, 1000];

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Y-axis gridlines and labels */}
        {yTicks.map((v) => {
          const y = PLOT_Y + PLOT_H - v * PLOT_H;
          return (
            <g key={`ytick-${v}`}>
              <line x1={PLOT_X} y1={y} x2={PLOT_X + PLOT_W} y2={y}
                stroke={COLORS.light} strokeWidth={1} />
              <text x={PLOT_X - 8} y={y + 4} textAnchor="end" fontSize="10" fill={COLORS.mid}>
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* X-axis gridlines and labels */}
        {xTicks.map((v) => {
          const x = PLOT_X + (v / T_STEPS) * PLOT_W;
          return (
            <g key={`xtick-${v}`}>
              <line x1={x} y1={PLOT_Y} x2={x} y2={PLOT_Y + PLOT_H}
                stroke={COLORS.light} strokeWidth={1} />
              <text x={x} y={PLOT_Y + PLOT_H + 18} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
                {v}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={PLOT_X + PLOT_W / 2} y={PLOT_Y + PLOT_H + 35} textAnchor="middle" fontSize="12" fill={COLORS.dark}>
          {t.xAxis}
        </text>
        <text x={25} y={PLOT_Y + PLOT_H / 2} textAnchor="middle" fontSize="12" fill={COLORS.dark}
          transform={`rotate(-90, 25, ${PLOT_Y + PLOT_H / 2})`}>
          {t.yAxis}
        </text>

        {/* Plot border */}
        <rect x={PLOT_X} y={PLOT_Y} width={PLOT_W} height={PLOT_H}
          fill="none" stroke={COLORS.mid} strokeWidth={1} />

        {/* Linear curve */}
        <path d={linearPath} fill="none" stroke={COLORS.primary} strokeWidth={2.5} />

        {/* Cosine curve */}
        <path d={cosinePath} fill="none" stroke={COLORS.green} strokeWidth={2.5} />

        {/* Hover interaction area */}
        <rect
          x={PLOT_X} y={PLOT_Y} width={PLOT_W} height={PLOT_H}
          fill="transparent"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverStep(null)}
          style={{ cursor: 'crosshair' }}
        />

        {/* Hover line and values */}
        {hoverStep !== null && (
          <g>
            <line
              x1={PLOT_X + (hoverStep / (T_STEPS - 1)) * PLOT_W}
              y1={PLOT_Y}
              x2={PLOT_X + (hoverStep / (T_STEPS - 1)) * PLOT_W}
              y2={PLOT_Y + PLOT_H}
              stroke={COLORS.dark} strokeWidth={1} strokeDasharray="4,3" opacity={0.5}
            />
            {/* Linear dot */}
            <circle
              cx={PLOT_X + (hoverStep / (T_STEPS - 1)) * PLOT_W}
              cy={PLOT_Y + PLOT_H - linearData[hoverStep] * PLOT_H}
              r={4} fill={COLORS.primary}
            />
            {/* Cosine dot */}
            <circle
              cx={PLOT_X + (hoverStep / (T_STEPS - 1)) * PLOT_W}
              cy={PLOT_Y + PLOT_H - cosineData[hoverStep] * PLOT_H}
              r={4} fill={COLORS.green}
            />
            {/* Tooltip */}
            <rect
              x={Math.min(PLOT_X + (hoverStep / (T_STEPS - 1)) * PLOT_W + 10, W - 280)}
              y={PLOT_Y + 5}
              width={260} height={24}
              fill={COLORS.bg} stroke={COLORS.light} strokeWidth={1} rx={4}
              opacity={0.95}
            />
            <text
              x={Math.min(PLOT_X + (hoverStep / (T_STEPS - 1)) * PLOT_W + 18, W - 272)}
              y={PLOT_Y + 21}
              fontSize="10" fill={COLORS.dark} fontFamily={FONTS.mono}
            >
              {t.hoverInfo(hoverStep, linearData[hoverStep], cosineData[hoverStep])}
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${PLOT_X + PLOT_W - 200}, ${PLOT_Y + 12})`}>
          <rect x={0} y={0} width={190} height={45} fill={COLORS.bg} stroke={COLORS.light}
            strokeWidth={1} rx={4} opacity={0.9} />
          <line x1={10} y1={14} x2={30} y2={14} stroke={COLORS.primary} strokeWidth={2.5} />
          <text x={36} y={18} fontSize="11" fill={COLORS.dark}>{t.linear}</text>
          <line x1={10} y1={34} x2={30} y2={34} stroke={COLORS.green} strokeWidth={2.5} />
          <text x={36} y={38} fontSize="11" fill={COLORS.dark}>{t.cosine}</text>
        </g>

        {/* Annotation: linear wastes steps */}
        <g>
          <line x1={PLOT_X + 20} y1={PLOT_Y + 30} x2={PLOT_X + 200} y2={PLOT_Y + 30}
            stroke={COLORS.red} strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
          <text x={PLOT_X + 110} y={PLOT_Y + 46} textAnchor="middle" fontSize="9" fill={COLORS.red}
            fontWeight="500">
            {t.annotation}
          </text>
        </g>
      </svg>
    </div>
  );
}
