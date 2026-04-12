import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

interface ModelPoint {
  name: string;
  params: number; // in millions
  paramsLabel: string;
  performance: number; // 0-100 normalized
  year: number;
  milestone: string;
  color: string;
}

export default function ScalingLawChart({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'GPT 系列：参数规模与能力演进',
      xLabel: '参数量（对数尺度）',
      yLabel: '模型能力',
      formula: 'Kaplan 缩放定律',
      formulaText: 'L(N) = (Nc / N)^{\u03B1_N}, \u03B1_N \u2248 0.076',
      showTrend: '显示趋势线',
      hideTrend: '隐藏趋势线',
      annotation: '关键里程碑',
    },
    en: {
      title: 'GPT Series: Parameter Scaling and Capability Evolution',
      xLabel: 'Parameters (log scale)',
      yLabel: 'Model Capability',
      formula: 'Kaplan Scaling Law',
      formulaText: 'L(N) = (Nc / N)^{\u03B1_N}, \u03B1_N \u2248 0.076',
      showTrend: 'Show Trend Line',
      hideTrend: 'Hide Trend Line',
      annotation: 'Key Milestones',
    },
  }[locale]!;

  const models: ModelPoint[] = useMemo(() => {
    const milestones = {
      zh: {
        gpt1: '需要微调才能做下游任务',
        gpt2: '零样本能力涌现，无需微调',
        gpt3: 'In-context learning，少样本即可',
      },
      en: {
        gpt1: 'Requires fine-tuning for downstream tasks',
        gpt2: 'Zero-shot capability emerges',
        gpt3: 'In-context learning, few-shot capable',
      },
    }[locale];

    return [
      { name: 'GPT-1', params: 117, paramsLabel: '117M', performance: 35, year: 2018, milestone: milestones.gpt1, color: COLORS.primary },
      { name: 'GPT-2', params: 1500, paramsLabel: '1.5B', performance: 58, year: 2019, milestone: milestones.gpt2, color: COLORS.orange },
      { name: 'GPT-3', params: 175000, paramsLabel: '175B', performance: 82, year: 2020, milestone: milestones.gpt3, color: COLORS.green },
    ];
  }, [locale]);

  const [showTrend, setShowTrend] = useState(true);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  // Chart area
  const chartLeft = 80;
  const chartRight = W - 40;
  const chartTop = 70;
  const chartBottom = H - 120;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  // Log scale mapping
  const logMin = Math.log10(50); // ~50M
  const logMax = Math.log10(300000); // ~300B
  const logRange = logMax - logMin;

  const getX = (params: number) => chartLeft + ((Math.log10(params) - logMin) / logRange) * chartW;
  const getY = (perf: number) => chartBottom - (perf / 100) * chartH;

  // Grid lines
  const xTicks = [100, 1000, 10000, 100000];
  const xLabels = ['100M', '1B', '10B', '100B'];
  const yTicks = [20, 40, 60, 80, 100];

  // Power law trend line
  const trendPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let logP = logMin; logP <= logMax; logP += 0.05) {
      const p = Math.pow(10, logP);
      // Approximate power law: perf ~ a * log(N) + b
      const perf = 12 * (logP - logMin) + 18;
      points.push({ x: getX(p), y: getY(Math.min(perf, 95)) });
    }
    return points;
  }, []);

  const trendPath = trendPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={30} textAnchor="middle" fontSize="15" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Chart background */}
        <rect x={chartLeft} y={chartTop} width={chartW} height={chartH} rx={4}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

        {/* Grid lines */}
        {yTicks.map(tick => (
          <g key={`y-${tick}`}>
            <line x1={chartLeft} y1={getY(tick)} x2={chartRight} y2={getY(tick)}
              stroke={COLORS.light} strokeWidth={0.5} />
            <text x={chartLeft - 8} y={getY(tick) + 4} textAnchor="end" fontSize="9" fill={COLORS.mid}>
              {tick}
            </text>
          </g>
        ))}

        {xTicks.map((tick, i) => (
          <g key={`x-${tick}`}>
            <line x1={getX(tick)} y1={chartTop} x2={getX(tick)} y2={chartBottom}
              stroke={COLORS.light} strokeWidth={0.5} />
            <text x={getX(tick)} y={chartBottom + 16} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
              {xLabels[i]}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={W / 2} y={chartBottom + 35} textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          {t.xLabel}
        </text>
        <text x={20} y={(chartTop + chartBottom) / 2} textAnchor="middle" fontSize="11" fill={COLORS.mid}
          transform={`rotate(-90, 20, ${(chartTop + chartBottom) / 2})`}>
          {t.yLabel}
        </text>

        {/* Trend line */}
        {showTrend && (
          <motion.path
            d={trendPath}
            fill="none" stroke={COLORS.red} strokeWidth={2} strokeDasharray="8 4" opacity={0.5}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
          />
        )}

        {/* Model points */}
        {models.map((model, i) => {
          const cx = getX(model.params);
          const cy = getY(model.performance);
          const isHovered = hoveredModel === model.name;
          const dotR = isHovered ? 14 : 10;

          return (
            <g key={model.name}
              onMouseEnter={() => setHoveredModel(model.name)}
              onMouseLeave={() => setHoveredModel(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Connecting lines to annotation */}
              <motion.line
                x1={cx} y1={cy - dotR - 2}
                x2={cx} y2={cy - 40}
                stroke={model.color} strokeWidth={1} strokeDasharray="3 3" opacity={0.5}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.3 + i * 0.2 }}
              />

              {/* Point */}
              <motion.circle
                cx={cx} cy={cy} r={dotR}
                fill={model.color} stroke={COLORS.bg} strokeWidth={2}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: i * 0.2, type: 'spring' }}
              />

              {/* Label on point */}
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLORS.bg}>
                {model.name.replace('GPT-', '')}
              </text>

              {/* Model name + params above */}
              <text x={cx} y={cy - 46} textAnchor="middle" fontSize="11" fontWeight="bold" fill={model.color}>
                {model.name}
              </text>
              <text x={cx} y={cy - 34} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
                {model.paramsLabel} ({model.year})
              </text>

              {/* Milestone annotation */}
              {isHovered && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <rect x={cx - 110} y={cy + 18} width={220} height={24} rx={5}
                    fill={COLORS.bg} stroke={model.color} strokeWidth={1.5}
                    filter="url(#shadowSLC)" />
                  <text x={cx} y={cy + 34} textAnchor="middle" fontSize="9" fill={COLORS.dark}>
                    {model.milestone}
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}

        {/* Formula box */}
        <rect x={chartRight - 260} y={chartBottom - 55} width={250} height={45} rx={6}
          fill={COLORS.bg} stroke={COLORS.light} strokeWidth={1} opacity={0.9} />
        <text x={chartRight - 250} y={chartBottom - 35} fontSize="10" fontWeight="bold" fill={COLORS.primary}>
          {t.formula}:
        </text>
        <text x={chartRight - 250} y={chartBottom - 18} fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>
          {t.formulaText}
        </text>

        {/* Shadow filter */}
        <defs>
          <filter id="shadowSLC" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>
      </svg>

      {/* Toggle button */}
      <div className="flex justify-center mt-2">
        <button
          onClick={() => setShowTrend(!showTrend)}
          className="px-4 py-1.5 text-sm rounded-md border transition-colors"
          style={{ borderColor: COLORS.red, color: COLORS.red, background: showTrend ? COLORS.waste : COLORS.bg }}
        >
          {showTrend ? t.hideTrend : t.showTrend}
        </button>
      </div>
    </div>
  );
}
