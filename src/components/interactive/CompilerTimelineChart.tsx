import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface Milestone {
  year: number;
  label: string;
  category: 'inherited' | 'adapted' | 'original';
  description: { zh: string; en: string };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const MILESTONES: Milestone[] = [
  { year: 1986, label: 'SSA Form', category: 'inherited', description: { zh: 'IBM 研究员提出 Static Single Assignment', en: 'IBM researchers propose Static Single Assignment' } },
  { year: 1991, label: 'Cytron et al.', category: 'inherited', description: { zh: 'SSA 高效构造算法发表', en: 'Efficient SSA construction algorithm published' } },
  { year: 1996, label: 'ATLAS', category: 'adapted', description: { zh: 'HPC autotuning 先驱', en: 'HPC autotuning pioneer' } },
  { year: 2000, label: 'Polyhedral', category: 'inherited', description: { zh: 'Polyhedral 编译框架成熟', en: 'Polyhedral compilation framework matures' } },
  { year: 2003, label: 'LLVM', category: 'inherited', description: { zh: 'LLVM 发布，模块化编译器基础设施', en: 'LLVM released: modular compiler infrastructure' } },
  { year: 2016, label: 'XLA', category: 'original', description: { zh: 'Google 为 TensorFlow 构建 ML 编译器', en: 'Google builds ML compiler for TensorFlow' } },
  { year: 2018, label: 'TVM', category: 'original', description: { zh: '端到端 ML 编译框架', en: 'End-to-end ML compilation framework' } },
  { year: 2019, label: 'MLIR', category: 'original', description: { zh: 'Google 提出可扩展多层 IR 框架', en: 'Google proposes extensible multi-level IR framework' } },
  { year: 2019, label: 'Triton', category: 'original', description: { zh: 'Block-level GPU 编程 DSL', en: 'Block-level GPU programming DSL' } },
  { year: 2023, label: 'torch.compile', category: 'original', description: { zh: 'PyTorch 2.0 正式发布', en: 'PyTorch 2.0 officially released' } },
  { year: 2022, label: 'FlashAttention', category: 'original', description: { zh: 'IO-aware attention 算法', en: 'IO-aware attention algorithm' } },
  { year: 2023, label: 'FlashAttention-2', category: 'original', description: { zh: '优化 warp 分配和非 matmul FLOPs', en: 'Optimized warp partitioning' } },
];

/* ─── Constants ─── */

const W = 800;
const H = 400;
const MARGIN_LEFT = 60;
const MARGIN_RIGHT = 40;
const TIMELINE_Y = 200;
const MIN_YEAR = 1984;
const MAX_YEAR = 2025;
const TRACK_W = W - MARGIN_LEFT - MARGIN_RIGHT;

const CATEGORY_COLORS = {
  inherited: COLORS.primary,
  adapted: COLORS.orange,
  original: COLORS.green,
} as const;

const CATEGORY_LABELS = {
  zh: {
    inherited: '传统编译器继承',
    adapted: 'HPC 适配',
    original: 'ML 原生创新',
  },
  en: {
    inherited: 'Traditional Compiler',
    adapted: 'HPC Adapted',
    original: 'ML-Native Innovation',
  },
} as const;

/* ─── Helpers ─── */

function yearToX(year: number): number {
  const frac = (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
  return MARGIN_LEFT + frac * TRACK_W;
}

/**
 * Resolve vertical positions for milestones that share the same year.
 * Alternates above/below the timeline for clarity, with extra offset for same-year items.
 */
function resolveMilestonePositions(milestones: Milestone[]) {
  const positions: { x: number; labelY: number; dotY: number; above: boolean }[] = [];

  // Group by approximate x position to detect overlaps
  let lastX = -Infinity;
  let sameXCount = 0;

  milestones.forEach((m, i) => {
    const x = yearToX(m.year);
    const above = i % 2 === 0;
    const baseOffset = above ? -30 : 30;

    // If x is very close to previous, stagger further
    if (Math.abs(x - lastX) < 25) {
      sameXCount++;
    } else {
      sameXCount = 0;
    }
    lastX = x;

    const extraOffset = sameXCount * (above ? -28 : 28);
    const labelY = TIMELINE_Y + baseOffset + extraOffset;

    positions.push({ x, labelY, dotY: TIMELINE_Y, above });
  });

  return positions;
}

/* ─── Component ─── */

export default function CompilerTimelineChart({ locale = 'zh' }: Props) {
  const t = {
    zh: { title: 'ML 编译器技术演化', clickHint: '点击节点查看详情' },
    en: { title: 'ML Compiler Technology Evolution', clickHint: 'Click a milestone for details' },
  }[locale]!;

  const catLabels = CATEGORY_LABELS[locale];
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const positions = useMemo(() => resolveMilestonePositions(MILESTONES), []);

  // Tick marks for decades
  const decades = [1990, 2000, 2010, 2020];

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; user-select: none; }`}</style>

        {/* Legend */}
        <g transform="translate(60, 24)">
          {(['inherited', 'adapted', 'original'] as const).map((cat, i) => (
            <g key={cat} transform={`translate(${i * 200}, 0)`}>
              <circle cx={0} cy={-3} r={5} fill={CATEGORY_COLORS[cat]} />
              <text x={12} y={1} fontSize="11" fill={COLORS.dark} fontWeight="500">
                {catLabels[cat]}
              </text>
            </g>
          ))}
        </g>

        {/* Hint text */}
        <text x={W - MARGIN_RIGHT} y={24} textAnchor="end" fontSize="9" fill={COLORS.mid} fontStyle="italic">
          {t.clickHint}
        </text>

        {/* Background era bands */}
        <rect
          x={yearToX(MIN_YEAR)}
          y={TIMELINE_Y - 80}
          width={yearToX(2015) - yearToX(MIN_YEAR)}
          height={160}
          fill={COLORS.primary}
          fillOpacity={0.03}
          rx={6}
        />
        <rect
          x={yearToX(2015)}
          y={TIMELINE_Y - 80}
          width={yearToX(MAX_YEAR) - yearToX(2015)}
          height={160}
          fill={COLORS.green}
          fillOpacity={0.04}
          rx={6}
        />

        {/* Era labels */}
        <text
          x={(yearToX(MIN_YEAR) + yearToX(2015)) / 2}
          y={TIMELINE_Y - 88}
          textAnchor="middle"
          fontSize="9"
          fill={COLORS.mid}
          fontWeight="500"
        >
          {locale === 'zh' ? '传统编译器时代' : 'Traditional Compiler Era'}
        </text>
        <text
          x={(yearToX(2015) + yearToX(MAX_YEAR)) / 2}
          y={TIMELINE_Y - 88}
          textAnchor="middle"
          fontSize="9"
          fill={COLORS.green}
          fontWeight="500"
        >
          {locale === 'zh' ? 'ML 编译器时代' : 'ML Compiler Era'}
        </text>

        {/* Main timeline line */}
        <line
          x1={MARGIN_LEFT}
          y1={TIMELINE_Y}
          x2={W - MARGIN_RIGHT}
          y2={TIMELINE_Y}
          stroke={COLORS.light}
          strokeWidth={2}
        />

        {/* Decade tick marks */}
        {decades.map(year => {
          const x = yearToX(year);
          return (
            <g key={year}>
              <line x1={x} y1={TIMELINE_Y - 6} x2={x} y2={TIMELINE_Y + 6} stroke={COLORS.mid} strokeWidth={1} />
              <text x={x} y={TIMELINE_Y + 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
                {year}
              </text>
            </g>
          );
        })}

        {/* Start/end years */}
        <text x={MARGIN_LEFT} y={TIMELINE_Y + 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {MIN_YEAR}
        </text>
        <text x={W - MARGIN_RIGHT} y={TIMELINE_Y + 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {MAX_YEAR}
        </text>

        {/* Milestones */}
        {MILESTONES.map((m, i) => {
          const { x, labelY, above } = positions[i];
          const color = CATEGORY_COLORS[m.category];
          const isSelected = selectedIdx === i;
          const stemY1 = above ? labelY + 10 : labelY - 14;

          return (
            <g
              key={`${m.year}-${m.label}`}
              onClick={() => setSelectedIdx(isSelected ? null : i)}
              style={{ cursor: 'pointer' }}
            >
              {/* Stem line connecting label to dot */}
              <line
                x1={x}
                y1={stemY1}
                x2={x}
                y2={TIMELINE_Y}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={isSelected ? 0.8 : 0.3}
                strokeDasharray={isSelected ? 'none' : '2 2'}
              />

              {/* Dot on timeline */}
              {isSelected ? (
                <motion.circle
                  cx={x}
                  cy={TIMELINE_Y}
                  r={7}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ) : (
                <circle
                  cx={x}
                  cy={TIMELINE_Y}
                  r={5}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              )}

              {/* Year label near dot */}
              <text
                x={x}
                y={above ? labelY + 8 : labelY - 8}
                textAnchor="middle"
                fontSize="8"
                fill={COLORS.mid}
                fontWeight="500"
              >
                {m.year}
              </text>

              {/* Milestone label */}
              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                fontSize="10"
                fontWeight={isSelected ? '700' : '600'}
                fill={isSelected ? color : COLORS.dark}
              >
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Selected milestone description tooltip */}
        <AnimatePresence>
          {selectedIdx !== null && (
            <motion.g
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.25 }}
            >
              {(() => {
                const m = MILESTONES[selectedIdx];
                const color = CATEGORY_COLORS[m.category];
                const tooltipW = 320;
                const tooltipH = 48;
                const rawX = positions[selectedIdx].x;
                const tooltipX = Math.max(10, Math.min(W - tooltipW - 10, rawX - tooltipW / 2));
                const tooltipY = H - tooltipH - 20;

                return (
                  <>
                    <rect
                      x={tooltipX}
                      y={tooltipY}
                      width={tooltipW}
                      height={tooltipH}
                      rx={8}
                      fill="#fff"
                      stroke={color}
                      strokeWidth={1.5}
                      filter="url(#tooltip-shadow)"
                    />
                    <text
                      x={tooltipX + 12}
                      y={tooltipY + 18}
                      fontSize="12"
                      fontWeight="700"
                      fill={color}
                    >
                      {m.year} — {m.label}
                    </text>
                    <text
                      x={tooltipX + 12}
                      y={tooltipY + 36}
                      fontSize="11"
                      fill={COLORS.dark}
                    >
                      {m.description[locale]}
                    </text>
                  </>
                );
              })()}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Shadow filter for tooltip */}
        <defs>
          <filter id="tooltip-shadow" x="-4%" y="-4%" width="108%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
