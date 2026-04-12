import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

interface Point {
  x: number;
  y: number;
  label: string;
  pairId: number;
}

// Generate positions for each training step
// Step 0: random scatter, Steps 1-5: positive pairs converge, negative diverge
function getPositions(step: number): Point[] {
  const base: Point[] = [
    { x: 200, y: 150, label: 'S1', pairId: 0 },
    { x: 550, y: 280, label: "S1'", pairId: 0 },
    { x: 500, y: 120, label: 'S2', pairId: 1 },
    { x: 180, y: 300, label: "S2'", pairId: 1 },
    { x: 350, y: 100, label: 'S3', pairId: 2 },
    { x: 400, y: 350, label: "S3'", pairId: 2 },
    { x: 600, y: 200, label: 'S4', pairId: 3 },
    { x: 150, y: 220, label: "S4'", pairId: 3 },
  ];

  // Target positions: pairs clustered together, separated from others
  const targets: Point[] = [
    { x: 150, y: 120, label: 'S1', pairId: 0 },
    { x: 170, y: 140, label: "S1'", pairId: 0 },
    { x: 600, y: 110, label: 'S2', pairId: 1 },
    { x: 620, y: 130, label: "S2'", pairId: 1 },
    { x: 160, y: 330, label: 'S3', pairId: 2 },
    { x: 180, y: 350, label: "S3'", pairId: 2 },
    { x: 600, y: 330, label: 'S4', pairId: 3 },
    { x: 620, y: 350, label: "S4'", pairId: 3 },
  ];

  const t = Math.min(step / 5, 1);
  return base.map((p, i) => ({
    ...p,
    x: p.x + (targets[i].x - p.x) * t,
    y: p.y + (targets[i].y - p.y) * t,
  }));
}

const PAIR_COLORS = [COLORS.primary, COLORS.green, COLORS.purple, COLORS.orange];

export default function ContrastiveLearningViz({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '对比学习：Batch 内正负样本',
      step: '训练步',
      loss: 'InfoNCE Loss',
      positivePair: '正例对 (拉近)',
      negativePair: '负例对 (推远)',
      trainProgress: '训练进度',
      reset: '重置',
    },
    en: {
      title: 'Contrastive Learning: In-Batch Positives & Negatives',
      step: 'Training Step',
      loss: 'InfoNCE Loss',
      positivePair: 'Positive pair (attract)',
      negativePair: 'Negative pair (repel)',
      trainProgress: 'Training Progress',
      reset: 'Reset',
    },
  }[locale]!;

  const [trainingStep, setTrainingStep] = useState(0);
  const points = useMemo(() => getPositions(trainingStep), [trainingStep]);

  // Simulated loss values decreasing over steps
  const losses = [2.08, 1.52, 1.01, 0.63, 0.35, 0.18];
  const currentLoss = losses[trainingStep];

  // Chart area for scatter
  const chartLeft = 80, chartRight = 700, chartTop = 70, chartBottom = 370;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Step control */}
        <text x={chartLeft} y={54} fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          {t.step}: {trainingStep}/5
        </text>

        {/* Step buttons */}
        {[0, 1, 2, 3, 4, 5].map(s => {
          const bx = chartLeft + 120 + s * 36;
          const isActive = s === trainingStep;
          return (
            <g key={s} style={{ cursor: 'pointer' }} onClick={() => setTrainingStep(s)}>
              <rect x={bx} y={40} width={28} height={22} rx={4}
                fill={isActive ? COLORS.primary : COLORS.bgAlt}
                stroke={isActive ? COLORS.primary : COLORS.light} strokeWidth={1} />
              <text x={bx + 14} y={55} textAnchor="middle" fontSize="10"
                fontWeight={isActive ? 'bold' : 'normal'}
                fill={isActive ? COLORS.bg : COLORS.mid}>
                {s}
              </text>
            </g>
          );
        })}

        {/* Loss display */}
        <text x={chartRight - 20} y={54} textAnchor="end" fontSize="11" fill={COLORS.red}>
          {t.loss}: {currentLoss.toFixed(2)}
        </text>

        {/* Chart border */}
        <rect x={chartLeft} y={chartTop} width={chartRight - chartLeft} height={chartBottom - chartTop}
          rx={4} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

        {/* Draw negative pair lines (dashed red) between different pairs */}
        {points.map((p, i) =>
          points.filter((_, j) => j > i && points[j].pairId !== p.pairId).map((q, j) => (
            <line key={`neg-${i}-${j}`}
              x1={p.x} y1={p.y} x2={q.x} y2={q.y}
              stroke={COLORS.red} strokeWidth={0.3} strokeDasharray="3 3" opacity={0.15}
            />
          ))
        )}

        {/* Draw positive pair lines (solid colored) */}
        {[0, 1, 2, 3].map(pairId => {
          const pair = points.filter(p => p.pairId === pairId);
          if (pair.length !== 2) return null;
          return (
            <motion.line key={`pos-${pairId}`}
              x1={pair[0].x} y1={pair[0].y} x2={pair[1].x} y2={pair[1].y}
              stroke={PAIR_COLORS[pairId]} strokeWidth={2.5} opacity={0.7}
              animate={{ x1: pair[0].x, y1: pair[0].y, x2: pair[1].x, y2: pair[1].y }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          );
        })}

        {/* Draw points */}
        {points.map((p, i) => (
          <motion.g key={i}
            animate={{ x: p.x, y: p.y }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <circle cx={0} cy={0} r={14}
              fill={PAIR_COLORS[p.pairId]} opacity={0.15} />
            <circle cx={0} cy={0} r={8}
              fill={PAIR_COLORS[p.pairId]} stroke={COLORS.bg} strokeWidth={2} />
            <text x={0} y={-16} textAnchor="middle" fontSize="8" fontWeight="bold"
              fill={PAIR_COLORS[p.pairId]}>
              {p.label}
            </text>
          </motion.g>
        ))}

        {/* Legend */}
        <g transform={`translate(${chartLeft + 10}, ${chartBottom + 15})`}>
          <line x1={0} y1={8} x2={25} y2={8} stroke={COLORS.primary} strokeWidth={2.5} />
          <text x={32} y={12} fontSize="9" fill={COLORS.dark}>{t.positivePair}</text>
          <line x1={200} y1={8} x2={225} y2={8} stroke={COLORS.red} strokeWidth={1} strokeDasharray="4 3" />
          <text x={232} y={12} fontSize="9" fill={COLORS.dark}>{t.negativePair}</text>
        </g>

        {/* Loss bar chart at bottom right */}
        <g transform={`translate(${chartRight - 200}, ${chartBottom + 5})`}>
          <text x={80} y={10} textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLORS.dark}>
            {t.trainProgress}
          </text>
          {losses.map((l, i) => {
            const bw = 20, bh = l * 20, bx = i * 28 + 10, by = 52 - bh;
            return (
              <g key={i}>
                <motion.rect x={bx} y={by} width={bw} height={bh} rx={2}
                  fill={i <= trainingStep ? COLORS.primary : COLORS.light}
                  animate={{ fill: i <= trainingStep ? COLORS.primary : COLORS.light }}
                  transition={{ duration: 0.3 }}
                />
                <text x={bx + bw / 2} y={58} textAnchor="middle" fontSize="7" fill={COLORS.mid}>{i}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
