import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

interface Pattern {
  labelKey: string;
  descKey: string;
  hitRates: number[]; // per-request cache hit rates (0-1)
}

interface CacheHitHeatmapProps {
  locale?: 'zh' | 'en';
}

const PATTERN_CONFIG: Pattern[] = [
  {
    labelKey: 'pattern1Label',
    descKey: 'pattern1Desc',
    hitRates: [0, 0, 0, 0.05, 0, 0, 0.02, 0, 0, 0],
  },
  {
    labelKey: 'pattern2Label',
    descKey: 'pattern2Desc',
    hitRates: [0, 0.4, 0.55, 0.65, 0.72, 0.76, 0.79, 0.82, 0.84, 0.86],
  },
  {
    labelKey: 'pattern3Label',
    descKey: 'pattern3Desc',
    hitRates: [0, 0.7, 0.7, 0.7, 0.71, 0.7, 0.72, 0.7, 0.71, 0.7],
  },
  {
    labelKey: 'pattern4Label',
    descKey: 'pattern4Desc',
    hitRates: [0, 0.5, 0.5, 0.35, 0.6, 0.45, 0.55, 0.4, 0.5, 0.65],
  },
];

const CELL_W = 42;
const CELL_H = 42;
const LABEL_W = 110;
const TOP_MARGIN = 50;
const LEFT_MARGIN = 15;

function hitColor(rate: number): string {
  if (rate === 0) return COLORS.waste;
  if (rate < 0.3) return '#fde68a';
  if (rate < 0.6) return '#fbbf24';
  if (rate < 0.8) return '#34d399';
  return COLORS.green;
}

export default function CacheHitHeatmap({ locale = 'zh' }: CacheHitHeatmapProps) {
  const t = {
    zh: {
      title: '不同对话模式下的缓存命中率',
      pattern1Label: '单轮独立',
      pattern1Desc: '每个请求完全独立，无共享前缀',
      pattern2Label: '多轮对话',
      pattern2Desc: '同一用户连续对话，共享 system prompt + 历史',
      pattern3Label: 'Few-shot',
      pattern3Desc: '多个请求共享相同的 few-shot examples',
      pattern4Label: 'Tree-of-Thought',
      pattern4Desc: '分支推理，共享前缀 + 部分中间路径',
      tooltipHit: '命中',
      legend0: '0%',
      legendLow: '< 30%',
      legendMid: '30-60%',
      legendHigh: '60-80%',
      legendVeryHigh: '> 80%',
    },
    en: {
      title: 'Cache Hit Rate by Dialogue Pattern',
      pattern1Label: 'Single-turn',
      pattern1Desc: 'Each request is independent, no shared prefix',
      pattern2Label: 'Multi-turn',
      pattern2Desc: 'Same user continuous dialogue, shared system prompt + history',
      pattern3Label: 'Few-shot',
      pattern3Desc: 'Multiple requests share same few-shot examples',
      pattern4Label: 'Tree-of-Thought',
      pattern4Desc: 'Branching inference, shared prefix + partial intermediate paths',
      tooltipHit: 'hit',
      legend0: '0%',
      legendLow: '< 30%',
      legendMid: '30-60%',
      legendHigh: '60-80%',
      legendVeryHigh: '> 80%',
    },
  }[locale];

  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* Title */}
        <text x={W / 2} y={22} fontSize={13} fontWeight={600} fill={COLORS.dark}
          fontFamily={FONTS.sans} textAnchor="middle">
          {t.title}
        </text>

        {/* Column headers */}
        {Array.from({ length: 10 }, (_, i) => (
          <text key={i}
            x={LEFT_MARGIN + LABEL_W + i * CELL_W + CELL_W / 2}
            y={TOP_MARGIN - 8}
            fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono} textAnchor="middle">
            R{i + 1}
          </text>
        ))}

        {/* Rows */}
        {PATTERN_CONFIG.map((pattern, row) => {
          const y = TOP_MARGIN + row * (CELL_H + 4);
          return (
            <g key={row}>
              {/* Row label */}
              <text x={LEFT_MARGIN} y={y + CELL_H / 2 + 4} fontSize={11} fill={COLORS.dark}
                fontFamily={FONTS.sans} fontWeight={500}>
                {t[pattern.labelKey as keyof typeof t]}
              </text>

              {/* Cells */}
              {pattern.hitRates.map((rate, col) => {
                const x = LEFT_MARGIN + LABEL_W + col * CELL_W;
                const isHovered = hovered?.row === row && hovered?.col === col;
                return (
                  <g key={col}
                    onMouseEnter={() => setHovered({ row, col })}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <rect x={x} y={y} width={CELL_W - 2} height={CELL_H - 2} rx={4}
                      fill={hitColor(rate)}
                      stroke={isHovered ? COLORS.dark : 'none'} strokeWidth={isHovered ? 2 : 0}
                    />
                    <text x={x + CELL_W / 2 - 1} y={y + CELL_H / 2 + 3}
                      fontSize={11} fill={rate > 0.6 ? '#fff' : COLORS.dark}
                      fontFamily={FONTS.mono} textAnchor="middle" fontWeight={500}>
                      {Math.round(rate * 100)}%
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered && (() => {
          const pattern = PATTERN_CONFIG[hovered.row];
          const rate = pattern.hitRates[hovered.col];
          const tipW = 240;
          const tipH = 52;
          const tipX = Math.min(LEFT_MARGIN + LABEL_W + hovered.col * CELL_W, W - tipW - 10);
          const tipY = TOP_MARGIN + (hovered.row + 1) * (CELL_H + 4) + 4;
          return (
            <g>
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={6}
                fill={COLORS.dark} opacity={0.95} />
              <text x={tipX + 10} y={tipY + 18} fontSize={11} fill="#fff" fontFamily={FONTS.sans}>
                {t[pattern.labelKey as keyof typeof t]} — {locale === 'zh' ? '请求' : 'Request'} #{hovered.col + 1}: {Math.round(rate * 100)}% {t.tooltipHit}
              </text>
              <text x={tipX + 10} y={tipY + 36} fontSize={10} fill={COLORS.light} fontFamily={FONTS.sans}>
                {t[pattern.descKey as keyof typeof t]}
              </text>
            </g>
          );
        })()}

        {/* Legend */}
        <g transform={`translate(${LEFT_MARGIN}, ${H - 30})`}>
          {[
            { labelKey: 'legend0', color: COLORS.waste },
            { labelKey: 'legendLow', color: '#fde68a' },
            { labelKey: 'legendMid', color: '#fbbf24' },
            { labelKey: 'legendHigh', color: '#34d399' },
            { labelKey: 'legendVeryHigh', color: COLORS.green },
          ].map((item, i) => (
            <g key={i} transform={`translate(${i * 100}, 0)`}>
              <rect width={14} height={14} rx={2} fill={item.color} />
              <text x={18} y={11} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.sans}>{t[item.labelKey as keyof typeof t]}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
