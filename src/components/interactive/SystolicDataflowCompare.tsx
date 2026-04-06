// src/components/interactive/SystolicDataflowCompare.tsx
// Static SVG: Output-stationary vs Weight-stationary systolic array comparison
import { COLORS, FONTS } from './shared/colors';

interface SystolicDataflowCompareProps {
  locale?: 'zh' | 'en';
}

const W = 580;
const H = 320;
const HALF = W / 2 - 10;
const PE = 40;
const GAP = 8;

function Arrow({ x1, y1, x2, y2, color }: {
  x1: number; y1: number; x2: number; y2: number; color: string;
}) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={1.5} markerEnd={`url(#arrow-${color.replace('#', '')})`} />
  );
}

function PeGrid3x3({ offsetX, title, subtitle, peLabel, stayLabel, stayColor, stayDesc,
  flowH, flowHColor, flowHLabel, flowV, flowVColor, flowVLabel,
}: {
  offsetX: number; title: string; subtitle: string; peLabel: string;
  stayLabel: string; stayColor: string; stayDesc: string;
  flowH: boolean; flowHColor: string; flowHLabel: string;
  flowV: boolean; flowVColor: string; flowVLabel: string;
}) {
  const gridX = offsetX + 40;
  const gridY = 80;

  return (
    <g>
      <text x={offsetX + HALF / 2} y={24} textAnchor="middle" fontSize="11"
        fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
      <text x={offsetX + HALF / 2} y={42} textAnchor="middle" fontSize="9"
        fill="#64748b" fontFamily={FONTS.sans}>{subtitle}</text>

      {/* 3×3 PE grid */}
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 3 }).map((_, c) => {
          const x = gridX + c * (PE + GAP);
          const y = gridY + r * (PE + GAP);
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={PE} height={PE} rx={4}
                fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
              <text x={x + PE / 2} y={y + PE / 2 - 4} textAnchor="middle"
                dominantBaseline="middle" fontSize="7" fill={COLORS.dark}
                fontFamily={FONTS.sans}>PE</text>
              <text x={x + PE / 2} y={y + PE / 2 + 8} textAnchor="middle"
                fontSize="7" fontWeight="600" fill={stayColor}
                fontFamily={FONTS.sans}>{peLabel}</text>
            </g>
          );
        })
      )}

      {/* Horizontal flow arrows (A or partial sums) */}
      {flowH && Array.from({ length: 3 }).map((_, r) => {
        const y = gridY + r * (PE + GAP) + PE / 2;
        return (
          <g key={`fh-${r}`}>
            <Arrow x1={gridX - 20} y1={y} x2={gridX - 4} y2={y} color={flowHColor} />
            {Array.from({ length: 2 }).map((_, c) => (
              <Arrow key={c}
                x1={gridX + (c + 1) * (PE + GAP) - GAP + 2}
                y1={y}
                x2={gridX + (c + 1) * (PE + GAP) - 2}
                y2={y}
                color={flowHColor} />
            ))}
          </g>
        );
      })}

      {/* Vertical flow arrows (B or partial sums) */}
      {flowV && Array.from({ length: 3 }).map((_, c) => {
        const x = gridX + c * (PE + GAP) + PE / 2;
        return (
          <g key={`fv-${c}`}>
            <Arrow x1={x} y1={gridY - 20} x2={x} y2={gridY - 4} color={flowVColor} />
            {Array.from({ length: 2 }).map((_, r) => (
              <Arrow key={r}
                x1={x}
                y1={gridY + (r + 1) * (PE + GAP) - GAP + 2}
                x2={x}
                y2={gridY + (r + 1) * (PE + GAP) - 2}
                color={flowVColor} />
            ))}
          </g>
        );
      })}

      {/* Flow labels */}
      {flowH && (
        <text x={gridX - 24} y={gridY + PE / 2 - 14} fontSize="8" fill={flowHColor}
          fontFamily={FONTS.sans} textAnchor="end">{flowHLabel}</text>
      )}
      {flowV && (
        <text x={gridX + PE / 2 + (PE + GAP)} y={gridY - 24} textAnchor="middle"
          fontSize="8" fill={flowVColor} fontFamily={FONTS.sans}>{flowVLabel}</text>
      )}

      {/* Stay label */}
      <rect x={offsetX + 10} y={H - 60} width={HALF - 20} height={34} rx={5}
        fill="white" stroke={stayColor} strokeWidth={1} />
      <text x={offsetX + HALF / 2} y={H - 48} textAnchor="middle" fontSize="9"
        fontWeight="600" fill={stayColor} fontFamily={FONTS.sans}>
        {stayLabel}
      </text>
      <text x={offsetX + HALF / 2} y={H - 34} textAnchor="middle" fontSize="8"
        fill="#64748b" fontFamily={FONTS.sans}>
        {stayDesc}
      </text>
    </g>
  );
}

export default function SystolicDataflowCompare({ locale = 'zh' }: SystolicDataflowCompareProps) {
  const t = {
    zh: {
      outputStationary: {
        title: 'Output-Stationary',
        subtitle: 'C 留在 PE，A 和 B 流动',
        stayLabel: '固定: 输出矩阵 C',
        stayDesc: '部分和 C 留在 PE 中累加，A/B 流过',
        flowHLabel: 'A 行 →',
        flowVLabel: 'B 列 ↓',
      },
      weightStationary: {
        title: 'Weight-Stationary',
        subtitle: 'B 预加载到 PE，A 流动，部分和传递',
        stayLabel: '固定: 权重矩阵 B',
        stayDesc: '权重 B 预加载到 PE，A 流过，部分和向下传递',
        flowHLabel: 'A 行 →',
        flowVLabel: '部分和 ↓',
      },
    },
    en: {
      outputStationary: {
        title: 'Output-Stationary',
        subtitle: 'C stays in PE, A and B flow',
        stayLabel: 'Fixed: Output Matrix C',
        stayDesc: 'Partial sum C accumulates in PE, A/B flow through',
        flowHLabel: 'A rows →',
        flowVLabel: 'B cols ↓',
      },
      weightStationary: {
        title: 'Weight-Stationary',
        subtitle: 'B preloaded, A flows, partial sums propagate',
        stayLabel: 'Fixed: Weight Matrix B',
        stayDesc: 'Weights B preloaded to PE, A flows, partial sums propagate down',
        flowHLabel: 'A rows →',
        flowVLabel: 'Partial sums ↓',
      },
    },
  }[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Output-stationary vs weight-stationary systolic array comparison">
      <defs>
        {[COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple].map(color => (
          <marker key={color} id={`arrow-${color.replace('#', '')}`}
            viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>

      {/* Left: Output-Stationary */}
      <PeGrid3x3
        offsetX={0}
        title={t.outputStationary.title}
        subtitle={t.outputStationary.subtitle}
        peLabel="C[i][j]"
        stayLabel={t.outputStationary.stayLabel}
        stayColor={COLORS.orange}
        stayDesc={t.outputStationary.stayDesc}
        flowH={true} flowHColor={COLORS.primary} flowHLabel={t.outputStationary.flowHLabel}
        flowV={true} flowVColor={COLORS.green} flowVLabel={t.outputStationary.flowVLabel}
      />

      {/* Divider */}
      <line x1={W / 2} y1={10} x2={W / 2} y2={H - 10}
        stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />

      {/* Right: Weight-Stationary */}
      <PeGrid3x3
        offsetX={W / 2 + 10}
        title={t.weightStationary.title}
        subtitle={t.weightStationary.subtitle}
        peLabel="B[i][j]"
        stayLabel={t.weightStationary.stayLabel}
        stayColor={COLORS.purple}
        stayDesc={t.weightStationary.stayDesc}
        flowH={true} flowHColor={COLORS.primary} flowHLabel={t.weightStationary.flowHLabel}
        flowV={true} flowVColor={COLORS.orange} flowVLabel={t.weightStationary.flowVLabel}
      />
    </svg>
  );
}
