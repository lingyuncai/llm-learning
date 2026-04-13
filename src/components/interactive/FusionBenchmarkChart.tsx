import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface BenchmarkResult {
  config: string;
  strategy: string;
  throughputTFLOPS: number;
  latencyMs: number;
  peakMemoryMB: number;
  hbmAccessGB: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const CONFIGS = ['GPT-2 Small', 'LLaMA 7B', 'LLaMA 70B'] as const;

const CONFIG_DETAILS: { [key: string]: { seqLen: number; hiddenDim: number; numHeads: number; batchSize: number } } = {
  'GPT-2 Small': { seqLen: 1024, hiddenDim: 768, numHeads: 12, batchSize: 16 },
  'LLaMA 7B': { seqLen: 2048, hiddenDim: 4096, numHeads: 32, batchSize: 1 },
  'LLaMA 70B': { seqLen: 4096, hiddenDim: 8192, numHeads: 64, batchSize: 1 },
};

const STRATEGIES = ['No Fusion', 'Element-wise Only', 'Full Inductor', 'Inductor + FlashAttn'] as const;

const STRATEGY_COLORS: { [key: string]: string } = {
  'No Fusion': COLORS.mid,
  'Element-wise Only': COLORS.orange,
  'Full Inductor': COLORS.primary,
  'Inductor + FlashAttn': COLORS.green,
};

const RESULTS: BenchmarkResult[] = [
  // GPT-2 Small
  { config: 'GPT-2 Small', strategy: 'No Fusion', throughputTFLOPS: 15, latencyMs: 8.5, peakMemoryMB: 320, hbmAccessGB: 0.8 },
  { config: 'GPT-2 Small', strategy: 'Element-wise Only', throughputTFLOPS: 28, latencyMs: 4.5, peakMemoryMB: 280, hbmAccessGB: 0.5 },
  { config: 'GPT-2 Small', strategy: 'Full Inductor', throughputTFLOPS: 42, latencyMs: 3.0, peakMemoryMB: 240, hbmAccessGB: 0.35 },
  { config: 'GPT-2 Small', strategy: 'Inductor + FlashAttn', throughputTFLOPS: 55, latencyMs: 2.3, peakMemoryMB: 200, hbmAccessGB: 0.25 },
  // LLaMA 7B
  { config: 'LLaMA 7B', strategy: 'No Fusion', throughputTFLOPS: 45, latencyMs: 42, peakMemoryMB: 4800, hbmAccessGB: 6.2 },
  { config: 'LLaMA 7B', strategy: 'Element-wise Only', throughputTFLOPS: 85, latencyMs: 22, peakMemoryMB: 3800, hbmAccessGB: 3.8 },
  { config: 'LLaMA 7B', strategy: 'Full Inductor', throughputTFLOPS: 130, latencyMs: 14.5, peakMemoryMB: 3200, hbmAccessGB: 2.5 },
  { config: 'LLaMA 7B', strategy: 'Inductor + FlashAttn', throughputTFLOPS: 175, latencyMs: 10.8, peakMemoryMB: 2400, hbmAccessGB: 1.8 },
  // LLaMA 70B
  { config: 'LLaMA 70B', strategy: 'No Fusion', throughputTFLOPS: 80, latencyMs: 180, peakMemoryMB: 38000, hbmAccessGB: 48 },
  { config: 'LLaMA 70B', strategy: 'Element-wise Only', throughputTFLOPS: 150, latencyMs: 96, peakMemoryMB: 30000, hbmAccessGB: 28 },
  { config: 'LLaMA 70B', strategy: 'Full Inductor', throughputTFLOPS: 220, latencyMs: 65, peakMemoryMB: 26000, hbmAccessGB: 18 },
  { config: 'LLaMA 70B', strategy: 'Inductor + FlashAttn', throughputTFLOPS: 310, latencyMs: 46, peakMemoryMB: 20000, hbmAccessGB: 12 },
];

/* ─── Insights per config ─── */

const INSIGHTS: { [key: string]: { zh: string; en: string } } = {
  'GPT-2 Small': {
    zh: '小模型受 kernel launch overhead 影响大：仅 element-wise 融合就带来 1.87x 吞吐提升。FlashAttention 在短序列（1024）上收益相对有限。',
    en: 'Small models are dominated by kernel launch overhead: element-wise fusion alone yields 1.87x throughput. FlashAttention gains are modest at short sequences (1024).',
  },
  'LLaMA 7B': {
    zh: 'Full Inductor 带来最大单步提升（85→130 TFLOPS）。FlashAttention 额外贡献 35% 吞吐提升并降低 25% 峰值内存。',
    en: 'Full Inductor provides the largest single-step gain (85→130 TFLOPS). FlashAttention adds 35% throughput and reduces 25% peak memory.',
  },
  'LLaMA 70B': {
    zh: 'FlashAttention 在大模型长序列上效果最显著：从 Full Inductor 到 +FlashAttn，吞吐提升 41%（220→310 TFLOPS），HBM 访问减少 33%。',
    en: 'FlashAttention shines at large models with long sequences: from Full Inductor to +FlashAttn, throughput increases 41% (220→310 TFLOPS), HBM access drops 33%.',
  },
};

/* ─── SVG Constants ─── */

const W = 800;
const H = 500;

type MetricKey = 'throughputTFLOPS' | 'latencyMs' | 'peakMemoryMB' | 'hbmAccessGB';

interface MetricDef {
  key: MetricKey;
  label: { zh: string; en: string };
  unit: string;
  higherIsBetter: boolean;
}

const METRICS: MetricDef[] = [
  { key: 'throughputTFLOPS', label: { zh: '吞吐量', en: 'Throughput' }, unit: 'TFLOPS', higherIsBetter: true },
  { key: 'latencyMs', label: { zh: '延迟', en: 'Latency' }, unit: 'ms', higherIsBetter: false },
  { key: 'peakMemoryMB', label: { zh: '峰值内存', en: 'Peak Memory' }, unit: 'MB', higherIsBetter: false },
  { key: 'hbmAccessGB', label: { zh: 'HBM 访问', en: 'HBM Access' }, unit: 'GB', higherIsBetter: false },
];

/* ─── Component ─── */

export default function FusionBenchmarkChart({ locale = 'zh' }: Props) {
  const [configIdx, setConfigIdx] = useState(1); // default LLaMA 7B
  const configName = CONFIGS[configIdx];
  const configResults = RESULTS.filter(r => r.config === configName);
  const detail = CONFIG_DETAILS[configName];

  const t = {
    zh: {
      title: '融合策略基准对比',
      disclaimer: '数据为教学用估算值',
      insight: '关键发现',
      configInfo: '配置信息',
    },
    en: {
      title: 'Fusion Strategy Benchmarks',
      disclaimer: 'Approximate values for educational purposes',
      insight: 'Key Insight',
      configInfo: 'Config Info',
    },
  }[locale]!;

  // Chart layout
  const chartLeft = 30;
  const chartTop = 100;
  const metricGroupW = 175;
  const barW = 28;
  const barGap = 4;
  const maxBarH = 200;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; } .clickable { cursor: pointer; }`}</style>

        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Config tabs */}
        {CONFIGS.map((cfg, i) => {
          const tabW = 200;
          const bx = chartLeft + i * (tabW + 10);
          const isActive = configIdx === i;
          return (
            <g key={cfg} className="clickable" onClick={() => setConfigIdx(i)}>
              <rect x={bx} y={36} width={tabW} height={28} rx={6}
                fill={isActive ? COLORS.highlight : COLORS.bgAlt}
                stroke={isActive ? COLORS.orange : COLORS.light} strokeWidth={isActive ? 2 : 1} />
              <text x={bx + tabW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight={isActive ? '700' : '500'}
                fill={COLORS.dark}>
                {cfg}
              </text>
              <text x={bx + tabW / 2} y={60} textAnchor="middle" fontSize="7" fill={COLORS.mid}
                style={{ fontFamily: FONTS.mono }}>
                seq={detail ? CONFIG_DETAILS[cfg].seqLen : ''} h={CONFIG_DETAILS[cfg].hiddenDim} B={CONFIG_DETAILS[cfg].batchSize}
              </text>
            </g>
          );
        })}

        {/* Metric labels at top */}
        {METRICS.map((metric, mi) => {
          const gx = chartLeft + mi * metricGroupW;
          return (
            <text key={metric.key} x={gx + metricGroupW / 2} y={chartTop - 4} textAnchor="middle"
              fontSize="10" fontWeight="700" fill={COLORS.dark}>
              {metric.label[locale]} ({metric.unit})
            </text>
          );
        })}

        {/* Grouped bar chart */}
        {METRICS.map((metric, mi) => {
          const gx = chartLeft + mi * metricGroupW;
          const values = configResults.map(r => r[metric.key]);
          const maxVal = Math.max(...values);

          return (
            <g key={metric.key}>
              {configResults.map((result, si) => {
                const val = result[metric.key];
                const barH = (val / maxVal) * maxBarH;
                const bx = gx + 20 + si * (barW + barGap);
                const by = chartTop + maxBarH - barH;
                const color = STRATEGY_COLORS[result.strategy];

                return (
                  <g key={result.strategy}>
                    <motion.rect
                      x={bx} y={by} width={barW} rx={3}
                      fill={color} fillOpacity={0.7}
                      initial={{ height: 0, y: chartTop + maxBarH }}
                      animate={{ height: barH, y: by }}
                      transition={{ duration: 0.5, delay: si * 0.08 }}
                    />
                    {/* Value label */}
                    <text x={bx + barW / 2} y={by - 4} textAnchor="middle"
                      fontSize="7" fontWeight="600" fill={color}
                      style={{ fontFamily: FONTS.mono }}>
                      {metric.key === 'peakMemoryMB' && val >= 1000
                        ? `${(val / 1000).toFixed(1)}G`
                        : val}
                    </text>
                  </g>
                );
              })}
              {/* Baseline */}
              <line x1={gx + 16} y1={chartTop + maxBarH} x2={gx + metricGroupW - 16} y2={chartTop + maxBarH}
                stroke={COLORS.light} strokeWidth={1} />
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${chartLeft}, ${chartTop + maxBarH + 20})`}>
          {STRATEGIES.map((strategy, i) => {
            const lx = i * 180;
            return (
              <g key={strategy} transform={`translate(${lx}, 0)`}>
                <rect x={0} y={-6} width={12} height={12} rx={3} fill={STRATEGY_COLORS[strategy]} fillOpacity={0.7} />
                <text x={16} y={4} fontSize="8.5" fontWeight="500" fill={COLORS.dark}>{strategy}</text>
              </g>
            );
          })}
        </g>

        {/* Insight box */}
        <g transform={`translate(${chartLeft}, ${chartTop + maxBarH + 46})`}>
          <rect x={0} y={0} width={W - 2 * chartLeft} height={58} rx={8}
            fill={COLORS.primary} fillOpacity={0.05} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={14} y={18} fontSize="10" fontWeight="700" fill={COLORS.primary}>
            {t.insight}
          </text>
          {/* Wrap text manually — split into lines */}
          {(() => {
            const text = INSIGHTS[configName][locale];
            const maxChars = locale === 'zh' ? 55 : 95;
            const lines: string[] = [];
            let remaining = text;
            while (remaining.length > 0) {
              if (remaining.length <= maxChars) {
                lines.push(remaining);
                break;
              }
              let breakIdx = remaining.lastIndexOf(' ', maxChars);
              if (locale === 'zh') {
                // For CJK, break at maxChars
                breakIdx = maxChars;
              }
              if (breakIdx <= 0) breakIdx = maxChars;
              lines.push(remaining.slice(0, breakIdx));
              remaining = remaining.slice(breakIdx).trimStart();
            }
            return lines.map((line, i) => (
              <text key={i} x={14} y={34 + i * 13} fontSize="8.5" fill={COLORS.dark}>
                {line}
              </text>
            ));
          })()}
        </g>

        {/* Disclaimer */}
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="7" fill={COLORS.mid} fontStyle="italic">
          {t.disclaimer}
        </text>
      </svg>
    </div>
  );
}
