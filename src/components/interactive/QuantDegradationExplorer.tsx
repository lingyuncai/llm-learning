// src/components/interactive/QuantDegradationExplorer.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type ModelScale = '7B' | '13B' | '70B';
type QuantMethod = 'FP16' | 'INT8' | 'INT4' | 'FP8';
type ViewMode = 'bar' | 'heatmap';

const QUANT_COLORS: Record<QuantMethod, string> = {
  FP16: COLORS.primary,
  INT8: COLORS.green,
  INT4: COLORS.orange,
  FP8: COLORS.purple,
};

const QUANT_METHODS: QuantMethod[] = ['FP16', 'INT8', 'INT4', 'FP8'];

const BENCH_KEYS = ['MMLU', 'MMLU-Pro', 'GSM8K', 'MATH', 'HumanEval'] as const;
type BenchKey = (typeof BENCH_KEYS)[number];

const BENCH_LABELS: Record<BenchKey, { zh: string; en: string }> = {
  'MMLU':      { zh: 'MMLU (知识)', en: 'MMLU (Knowledge)' },
  'MMLU-Pro':  { zh: 'MMLU-Pro (知识)', en: 'MMLU-Pro (Knowledge)' },
  'GSM8K':     { zh: 'GSM8K (数学)', en: 'GSM8K (Math)' },
  'MATH':      { zh: 'MATH (数学)', en: 'MATH (Math)' },
  'HumanEval': { zh: 'HumanEval (代码)', en: 'HumanEval (Code)' },
};

// Data compiled from:
// - HuggingFace blog "Overview of quantization in the Transformers library" (Llama-2 7B/13B INT4 GPTQ/BnB)
// - ZeroQuant-V2 (arxiv 2303.08302): INT4 accuracy "none of the current methods can achieve original quality"
// - Community benchmarks on Open LLM Leaderboard for quantized Llama-2 and Llama-3 variants
// - Meta Llama 2 & 3 technical reports for FP16 baselines
// - Estimated INT8/FP8 from near-lossless quantization literature (FP8 training paper, arxiv 2209.05433)
// Degradation percentages are representative of typical post-training quantization results.
interface DataEntry {
  scale: ModelScale;
  method: QuantMethod;
  scores: Record<BenchKey, number>;
}

const DATA: DataEntry[] = [
  // 7B — baselines from Llama-2 7B / Llama-3 8B range
  { scale: '7B', method: 'FP16', scores: { 'MMLU': 64, 'MMLU-Pro': 35, 'GSM8K': 52, 'MATH': 18, 'HumanEval': 62 } },
  { scale: '7B', method: 'INT8', scores: { 'MMLU': 63.5, 'MMLU-Pro': 34.5, 'GSM8K': 51, 'MATH': 17.5, 'HumanEval': 59 } },
  { scale: '7B', method: 'INT4', scores: { 'MMLU': 61, 'MMLU-Pro': 32, 'GSM8K': 47, 'MATH': 15, 'HumanEval': 52 } },
  { scale: '7B', method: 'FP8',  scores: { 'MMLU': 63.7, 'MMLU-Pro': 34.8, 'GSM8K': 51.5, 'MATH': 17.7, 'HumanEval': 61 } },
  // 13B — higher baselines, smaller relative drops
  { scale: '13B', method: 'FP16', scores: { 'MMLU': 70, 'MMLU-Pro': 42, 'GSM8K': 62, 'MATH': 24, 'HumanEval': 72 } },
  { scale: '13B', method: 'INT8', scores: { 'MMLU': 69.6, 'MMLU-Pro': 41.6, 'GSM8K': 61.2, 'MATH': 23.6, 'HumanEval': 70.5 } },
  { scale: '13B', method: 'INT4', scores: { 'MMLU': 68, 'MMLU-Pro': 39.5, 'GSM8K': 58, 'MATH': 21.5, 'HumanEval': 64 } },
  { scale: '13B', method: 'FP8',  scores: { 'MMLU': 69.8, 'MMLU-Pro': 41.8, 'GSM8K': 61.5, 'MATH': 23.8, 'HumanEval': 71 } },
  // 70B — highest baselines, very small drops (key insight: large models more robust)
  { scale: '70B', method: 'FP16', scores: { 'MMLU': 82, 'MMLU-Pro': 56, 'GSM8K': 81, 'MATH': 38, 'HumanEval': 85 } },
  { scale: '70B', method: 'INT8', scores: { 'MMLU': 81.8, 'MMLU-Pro': 55.8, 'GSM8K': 80.6, 'MATH': 37.8, 'HumanEval': 84.2 } },
  { scale: '70B', method: 'INT4', scores: { 'MMLU': 80.5, 'MMLU-Pro': 54, 'GSM8K': 78, 'MATH': 36, 'HumanEval': 80 } },
  { scale: '70B', method: 'FP8',  scores: { 'MMLU': 81.9, 'MMLU-Pro': 55.9, 'GSM8K': 80.8, 'MATH': 37.9, 'HumanEval': 84.5 } },
];

const W = 600;
const H_BAR = 380;
const H_HEAT = 320;

function getDeg(base: number, current: number): number {
  return base > 0 ? ((base - current) / base) * 100 : 0;
}

function degColor(pct: number): string {
  if (pct <= 0.5) return '#f0fdf4';
  if (pct <= 2) return '#fef9c3';
  if (pct <= 5) return '#fed7aa';
  if (pct <= 10) return '#fdba74';
  return '#f87171';
}

export default function QuantDegradationExplorer({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [scale, setScale] = useState<ModelScale>('7B');
  const [view, setView] = useState<ViewMode>('bar');
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;

  const scaleData = useMemo(() => DATA.filter(d => d.scale === scale), [scale]);
  const baseline = useMemo(() => scaleData.find(d => d.method === 'FP16')!, [scaleData]);

  // Compute max degradation for the current scale for the callout
  const maxDeg = useMemo(() => {
    let max = 0;
    let maxBench = '';
    let maxMethod = '';
    scaleData.forEach(d => {
      if (d.method === 'FP16') return;
      BENCH_KEYS.forEach(bk => {
        const deg = getDeg(baseline.scores[bk], d.scores[bk]);
        if (deg > max) {
          max = deg;
          maxBench = bk;
          maxMethod = d.method;
        }
      });
    });
    return { max: max.toFixed(1), bench: maxBench, method: maxMethod };
  }, [scaleData, baseline]);

  const barChartH = H_BAR;
  const heatChartH = H_HEAT;

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      {/* Title */}
      <div className="text-center mb-3">
        <h3 className="text-base font-bold" style={{ color: COLORS.dark }}>
          {t('量化精度退化探索器', 'Quantization Degradation Explorer')}
        </h3>
        <p className="text-xs mt-1" style={{ color: COLORS.mid }}>
          {t('选择模型规模和视图模式，探索不同量化方法对各 benchmark 的影响',
             'Select model scale and view mode to explore quantization impact on benchmarks')}
        </p>
        <p className="text-xs mt-0.5" style={{ color: COLORS.orange, fontStyle: 'italic' }}>
          {t('数据为基于文献和社区评测的代表性趋势值，具体分数因模型版本和评测条件而异',
             'Data shows representative trends from literature and community benchmarks; exact scores vary by model version and setup')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {/* Scale selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: COLORS.mid }}>
            {t('模型规模', 'Model Scale')}:
          </span>
          {(['7B', '13B', '70B'] as ModelScale[]).map(s => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className="px-3 py-1 rounded text-xs font-semibold transition-all"
              style={{
                background: scale === s ? COLORS.primary : COLORS.bgAlt,
                color: scale === s ? '#fff' : COLORS.mid,
                border: `1px solid ${scale === s ? COLORS.primary : COLORS.light}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: COLORS.mid }}>
            {t('视图', 'View')}:
          </span>
          {(['bar', 'heatmap'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 rounded text-xs font-semibold transition-all"
              style={{
                background: view === v ? COLORS.dark : COLORS.bgAlt,
                color: view === v ? '#fff' : COLORS.mid,
                border: `1px solid ${view === v ? COLORS.dark : COLORS.light}`,
              }}
            >
              {v === 'bar' ? t('柱状图', 'Bar Chart') : t('热力图', 'Heatmap')}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <AnimatePresence mode="wait">
        {view === 'bar' ? (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <BarView scale={scale} data={scaleData} baseline={baseline} locale={locale} />
          </motion.div>
        ) : (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <HeatmapView scale={scale} data={scaleData} baseline={baseline} locale={locale} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight callout */}
      <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
        <p className="font-semibold mb-1" style={{ color: COLORS.dark }}>
          {t('关键发现', 'Key Insights')}
        </p>
        <ul className="list-disc list-inside space-y-1" style={{ color: COLORS.dark }}>
          <li>
            {t(
              '敏感度排序：代码类 > 数学类 > 知识类 — 代码生成对量化最为敏感',
              'Sensitivity order: Code > Math > Knowledge — code generation is most sensitive to quantization'
            )}
          </li>
          <li>
            {t(
              '大模型更耐量化：70B 模型在 INT4 下精度损失远小于 7B（冗余参数提供了缓冲）',
              'Larger models are more robust: 70B shows far less INT4 degradation than 7B (redundant parameters buffer errors)'
            )}
          </li>
          <li>
            {t(
              `当前视图 (${scale}): 最大退化 ${maxDeg.max}% 出现在 ${maxDeg.method} × ${maxDeg.bench}`,
              `Current view (${scale}): max degradation ${maxDeg.max}% at ${maxDeg.method} x ${maxDeg.bench}`
            )}
          </li>
        </ul>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-3">
        {QUANT_METHODS.map(m => (
          <div key={m} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: QUANT_COLORS[m] }} />
            <span className="text-xs" style={{ color: COLORS.mid }}>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== Bar View ==================== */
function BarView({
  scale, data, baseline, locale,
}: {
  scale: ModelScale;
  data: DataEntry[];
  baseline: DataEntry;
  locale: 'zh' | 'en';
}) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const margin = { top: 40, right: 20, bottom: 60, left: 50 };
  const innerW = W - margin.left - margin.right;
  const innerH = H_BAR - margin.top - margin.bottom;

  const maxScore = Math.max(...data.flatMap(d => BENCH_KEYS.map(bk => d.scores[bk])));
  const yMax = Math.ceil(maxScore / 10) * 10;

  const groupW = innerW / BENCH_KEYS.length;
  const barW = Math.min(groupW * 0.18, 22);
  const barGap = 2;

  const yScale = (v: number) => innerH - (v / yMax) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H_BAR}`} className="w-full">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Y axis gridlines */}
        {[0, 20, 40, 60, 80, 100].filter(v => v <= yMax).map(v => (
          <g key={v}>
            <line x1={0} y1={yScale(v)} x2={innerW} y2={yScale(v)}
              stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4,3" />
            <text x={-8} y={yScale(v) + 3} textAnchor="end"
              fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {v}
            </text>
          </g>
        ))}

        {/* Bars grouped by benchmark */}
        {BENCH_KEYS.map((bk, bi) => {
          const groupX = bi * groupW + groupW / 2;
          const totalBarW = QUANT_METHODS.length * (barW + barGap) - barGap;
          const startX = groupX - totalBarW / 2;

          return (
            <g key={bk}>
              {/* Benchmark label */}
              <text x={groupX} y={innerH + 20} textAnchor="middle"
                fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans} fontWeight="500">
                {BENCH_LABELS[bk][locale]}
              </text>

              {/* Bars for each quant method */}
              {QUANT_METHODS.map((method, mi) => {
                const entry = data.find(d => d.method === method)!;
                const score = entry.scores[bk];
                const barX = startX + mi * (barW + barGap);
                const barH = (score / yMax) * innerH;
                const deg = getDeg(baseline.scores[bk], score);

                return (
                  <g key={method}>
                    <rect
                      x={barX} y={yScale(score)}
                      width={barW} height={barH}
                      fill={QUANT_COLORS[method]}
                      opacity={0.75}
                      rx={2}
                    />
                    {/* Score label on top */}
                    <text x={barX + barW / 2} y={yScale(score) - 12}
                      textAnchor="middle" fontSize="6.5" fill={COLORS.dark}
                      fontFamily={FONTS.mono} fontWeight="600">
                      {score}
                    </text>
                    {/* Degradation % */}
                    {method !== 'FP16' && deg > 0 && (
                      <text x={barX + barW / 2} y={yScale(score) - 4}
                        textAnchor="middle" fontSize="5.5"
                        fill={deg > 5 ? COLORS.red : COLORS.orange}
                        fontFamily={FONTS.mono}>
                        -{deg.toFixed(1)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Y axis label */}
        <text x={-35} y={innerH / 2} textAnchor="middle"
          transform={`rotate(-90, -35, ${innerH / 2})`}
          fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans} fontWeight="600">
          {t('分数', 'Score')}
        </text>

        {/* Title */}
        <text x={innerW / 2} y={-15} textAnchor="middle"
          fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans} fontWeight="700">
          {t(`${scale} 模型 — 各 Benchmark 量化退化`, `${scale} Model — Benchmark Quantization Degradation`)}
        </text>
      </g>
    </svg>
  );
}

/* ==================== Heatmap View ==================== */
function HeatmapView({
  scale, data, baseline, locale,
}: {
  scale: ModelScale;
  data: DataEntry[];
  baseline: DataEntry;
  locale: 'zh' | 'en';
}) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const margin = { top: 50, right: 40, bottom: 30, left: 80 };
  const innerW = W - margin.left - margin.right;
  const innerH = H_HEAT - margin.top - margin.bottom;

  const nonFP16 = QUANT_METHODS.filter(m => m !== 'FP16');
  const cellW = innerW / BENCH_KEYS.length;
  const cellH = innerH / nonFP16.length;

  return (
    <svg viewBox={`0 0 ${W} ${H_HEAT}`} className="w-full">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Title */}
        <text x={innerW / 2} y={-25} textAnchor="middle"
          fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans} fontWeight="700">
          {t(`${scale} 模型 — 精度退化百分比热力图`, `${scale} Model — Accuracy Degradation % Heatmap`)}
        </text>
        <text x={innerW / 2} y={-12} textAnchor="middle"
          fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {t('颜色越深 = 退化越严重（相对 FP16 基线）', 'Darker = more degradation (relative to FP16 baseline)')}
        </text>

        {/* Column headers */}
        {BENCH_KEYS.map((bk, ci) => (
          <text key={bk} x={ci * cellW + cellW / 2} y={-2}
            textAnchor="middle" fontSize="7.5" fill={COLORS.dark}
            fontFamily={FONTS.sans} fontWeight="500">
            {bk}
          </text>
        ))}

        {/* Row labels + cells */}
        {nonFP16.map((method, ri) => {
          const entry = data.find(d => d.method === method)!;
          return (
            <g key={method}>
              <text x={-10} y={ri * cellH + cellH / 2 + 3}
                textAnchor="end" fontSize="9" fontWeight="600"
                fill={QUANT_COLORS[method]} fontFamily={FONTS.mono}>
                {method}
              </text>
              {BENCH_KEYS.map((bk, ci) => {
                const deg = getDeg(baseline.scores[bk], entry.scores[bk]);
                return (
                  <g key={bk}>
                    <rect
                      x={ci * cellW + 1} y={ri * cellH + 1}
                      width={cellW - 2} height={cellH - 2}
                      fill={degColor(deg)}
                      rx={3}
                      stroke={COLORS.light}
                      strokeWidth={0.5}
                    />
                    <text
                      x={ci * cellW + cellW / 2}
                      y={ri * cellH + cellH / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill={deg > 8 ? '#fff' : COLORS.dark}
                      fontFamily={FONTS.mono}
                    >
                      {deg > 0 ? `-${deg.toFixed(1)}%` : '0%'}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Color legend */}
        <g transform={`translate(${innerW + 10}, 0)`}>
          {[
            { label: '<0.5%', color: '#f0fdf4' },
            { label: '0.5-2%', color: '#fef9c3' },
            { label: '2-5%', color: '#fed7aa' },
            { label: '5-10%', color: '#fdba74' },
            { label: '>10%', color: '#f87171' },
          ].map((item, i) => (
            <g key={i} transform={`translate(0, ${i * 22})`}>
              <rect width={12} height={12} fill={item.color} rx={2}
                stroke={COLORS.light} strokeWidth={0.5} />
              <text x={16} y={9} fontSize="6.5" fill={COLORS.mid}
                fontFamily={FONTS.sans}>
                {item.label}
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
