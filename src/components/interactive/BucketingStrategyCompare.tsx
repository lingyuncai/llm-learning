import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

type BucketStrategy = 'none' | 'power_of_2' | 'fixed_interval' | 'multiple_of_8';

interface StrategyConfig {
  id: BucketStrategy;
  label: { zh: string; en: string };
  getBucket: (seqLen: number) => number;
  description: { zh: string; en: string };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const STRATEGIES: StrategyConfig[] = [
  {
    id: 'none',
    label: { zh: '无 Bucketing', en: 'No Bucketing' },
    getBucket: (s) => s,
    description: {
      zh: '每个独特 seq_len 触发一次编译。零 padding 浪费，但编译次数最多。',
      en: 'Each unique seq_len triggers a compilation. Zero padding waste, but most compilations.',
    },
  },
  {
    id: 'power_of_2',
    label: { zh: 'Power-of-2', en: 'Power-of-2' },
    getBucket: (s) => Math.pow(2, Math.ceil(Math.log2(s))),
    description: {
      zh: '向上取到最近的 2 的幂（64, 128, 256, 512, 1024）。编译次数少，但短序列浪费大。',
      en: 'Round up to nearest power of 2 (64, 128, 256, ...). Few compilations, but high waste for short sequences.',
    },
  },
  {
    id: 'fixed_interval',
    label: { zh: '固定间隔 (128)', en: 'Fixed Interval (128)' },
    getBucket: (s) => Math.ceil(s / 128) * 128,
    description: {
      zh: '向上取到 128 的整数倍。编译次数和浪费的折中方案。',
      en: 'Round up to nearest multiple of 128. Balance between compilations and waste.',
    },
  },
  {
    id: 'multiple_of_8',
    label: { zh: 'Multiple-of-8', en: 'Multiple-of-8' },
    getBucket: (s) => Math.ceil(s / 8) * 8,
    description: {
      zh: '向上取到 8 的整数倍。最小 padding，但 bucket 数量较多。对 Tensor Core 对齐友好。',
      en: 'Round up to nearest multiple of 8. Minimal padding, but more buckets. Tensor Core alignment friendly.',
    },
  },
];

const WORKLOAD: number[] = [73, 128, 45, 256, 128, 512, 73, 1024, 256, 45, 200, 512, 73, 128, 300, 1024, 150, 64, 256, 800];

/* ─── Component ─── */

export default function BucketingStrategyCompare({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Bucketing 策略对比',
      compilations: '编译次数 (Unique Buckets)',
      totalWaste: '总 Padding 浪费 (tokens)',
      worstWaste: '最大单次浪费 (%)',
      actual: '实际长度',
      padded: 'Padding 浪费',
      fewer: '更少 →',
      more: '← 更多',
      seqLen: '序列长度',
      requests: '请求',
    },
    en: {
      title: 'Bucketing Strategy Comparison',
      compilations: 'Compilations (Unique Buckets)',
      totalWaste: 'Total Padding Waste (tokens)',
      worstWaste: 'Worst Single-Request Waste (%)',
      actual: 'Actual length',
      padded: 'Padding waste',
      fewer: 'fewer →',
      more: '← more',
      seqLen: 'Sequence Length',
      requests: 'Requests',
    },
  }[locale]!;

  const [activeStrategy, setActiveStrategy] = useState<BucketStrategy>('none');
  const strategy = STRATEGIES.find(s => s.id === activeStrategy)!;

  /* ── Compute metrics ── */
  const metrics = useMemo(() => {
    const bucketedSeqs = WORKLOAD.map(s => ({
      actual: s,
      bucketed: strategy.getBucket(s),
      waste: strategy.getBucket(s) - s,
    }));

    const uniqueBuckets = new Set(bucketedSeqs.map(b => b.bucketed)).size;
    const totalWaste = bucketedSeqs.reduce((sum, b) => sum + b.waste, 0);
    const worstWastePct = Math.round(
      Math.max(...bucketedSeqs.map(b => (b.waste / b.bucketed) * 100))
    );

    return { bucketedSeqs, uniqueBuckets, totalWaste, worstWastePct };
  }, [strategy]);

  /* ── Max values for normalization ── */
  const maxBucket = Math.max(...metrics.bucketedSeqs.map(b => b.bucketed));
  const maxCompilations = 14; // 'none' produces ~14 unique values
  const maxTotalWaste = 8000; // reasonable upper bound
  const maxWorstWaste = 100;

  /* ── Bucket chart dimensions ── */
  const chartX = 50, chartY = 85, chartW = 700, chartH = 180;
  const barH = 6;
  const barGap = (chartH - WORKLOAD.length * barH) / (WORKLOAD.length - 1);

  /* ── Metrics bar dimensions ── */
  const metricsY = 310;
  const barWidth = 300;

  return (
    <div className="my-6">
      <svg viewBox="0 0 800 500" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x="400" y="22" textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Strategy selector buttons */}
        {STRATEGIES.map((s, i) => {
          const bw = 170;
          const gap = 8;
          const totalW = STRATEGIES.length * bw + (STRATEGIES.length - 1) * gap;
          const startX = (800 - totalW) / 2;
          const bx = startX + i * (bw + gap);
          const isActive = activeStrategy === s.id;
          return (
            <g key={s.id} onClick={() => setActiveStrategy(s.id)} style={{ cursor: 'pointer' }}>
              <rect x={bx} y={36} width={bw} height={28} rx="6"
                fill={isActive ? COLORS.primary : COLORS.bgAlt}
                fillOpacity={isActive ? 0.15 : 1}
                stroke={isActive ? COLORS.primary : COLORS.light}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={bx + bw / 2} y={54} textAnchor="middle" fontSize="10" fontWeight={isActive ? '700' : '500'}
                fill={isActive ? COLORS.primary : COLORS.mid}>
                {s.label[locale]}
              </text>
            </g>
          );
        })}

        {/* X-axis label */}
        <text x={chartX + chartW / 2} y={chartY - 8} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.seqLen} (0 — {maxBucket})
        </text>

        {/* Bucket visualization area */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} rx="4"
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />

        {/* Vertical grid lines for bucket boundaries */}
        <AnimatePresence>
          {(() => {
            const uniqueBuckets = [...new Set(metrics.bucketedSeqs.map(b => b.bucketed))].sort((a, b) => a - b);
            return uniqueBuckets.map(bucket => {
              const x = chartX + (bucket / maxBucket) * chartW;
              return (
                <motion.g
                  key={`bucket-${bucket}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <line x1={x} y1={chartY} x2={x} y2={chartY + chartH}
                    stroke={COLORS.primary} strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity={0.4} />
                  <text x={x} y={chartY + chartH + 12} textAnchor="middle" fontSize="7" fontFamily={FONTS.mono}
                    fill={COLORS.primary} fillOpacity={0.7}>
                    {bucket}
                  </text>
                </motion.g>
              );
            });
          })()}
        </AnimatePresence>

        {/* Workload bars */}
        {metrics.bucketedSeqs.map((item, i) => {
          const by = chartY + 4 + i * (barH + barGap);
          const actualW = (item.actual / maxBucket) * chartW;
          const bucketW = (item.bucketed / maxBucket) * chartW;

          return (
            <g key={i}>
              {/* Request label */}
              <text x={chartX - 4} y={by + barH / 2 + 1} textAnchor="end" fontSize="7" fontFamily={FONTS.mono}
                fill={COLORS.mid}>
                {i + 1}
              </text>

              {/* Waste (padding) area — behind actual */}
              <motion.rect
                x={chartX} y={by}
                height={barH} rx="1"
                fill={COLORS.waste}
                initial={{ width: 0 }}
                animate={{ width: bucketW }}
                transition={{ duration: 0.4 }}
              />

              {/* Actual data area */}
              <motion.rect
                x={chartX} y={by}
                height={barH} rx="1"
                fill={COLORS.primary} fillOpacity={0.6}
                initial={{ width: 0 }}
                animate={{ width: actualW }}
                transition={{ duration: 0.4, delay: 0.05 }}
              />
            </g>
          );
        })}

        {/* Legend */}
        <rect x={chartX + chartW - 200} y={chartY + chartH + 16} width={8} height={8} rx="2" fill={COLORS.primary} fillOpacity={0.6} />
        <text x={chartX + chartW - 188} y={chartY + chartH + 24} fontSize="9" fill={COLORS.mid}>{t.actual}</text>
        <rect x={chartX + chartW - 100} y={chartY + chartH + 16} width={8} height={8} rx="2" fill={COLORS.waste} />
        <text x={chartX + chartW - 88} y={chartY + chartH + 24} fontSize="9" fill={COLORS.mid}>{t.padded}</text>
        <text x={chartX} y={chartY + chartH + 24} fontSize="8" fill={COLORS.mid}>{t.requests} ↓</text>

        {/* METRICS SECTION */}
        {/* Metric 1: Unique compilations */}
        <text x={60} y={metricsY + 16} fontSize="10" fill={COLORS.dark} fontWeight="600">
          {t.compilations}
        </text>
        <rect x={60} y={metricsY + 22} width={barWidth} height={14} rx="3" fill={COLORS.light} />
        <motion.rect
          x={60} y={metricsY + 22} height={14} rx="3"
          fill={metrics.uniqueBuckets <= 5 ? COLORS.green : metrics.uniqueBuckets <= 10 ? COLORS.orange : COLORS.red}
          fillOpacity={0.6}
          initial={{ width: 0 }}
          animate={{ width: barWidth * (metrics.uniqueBuckets / maxCompilations) }}
          transition={{ duration: 0.5 }}
        />
        <text x={60 + barWidth + 8} y={metricsY + 33} fontSize="12" fontWeight="700" fontFamily={FONTS.mono}
          fill={metrics.uniqueBuckets <= 5 ? COLORS.green : metrics.uniqueBuckets <= 10 ? COLORS.orange : COLORS.red}>
          {metrics.uniqueBuckets}
        </text>

        {/* Metric 2: Total padding waste */}
        <text x={60} y={metricsY + 60} fontSize="10" fill={COLORS.dark} fontWeight="600">
          {t.totalWaste}
        </text>
        <rect x={60} y={metricsY + 66} width={barWidth} height={14} rx="3" fill={COLORS.light} />
        <motion.rect
          x={60} y={metricsY + 66} height={14} rx="3"
          fill={metrics.totalWaste <= 1000 ? COLORS.green : metrics.totalWaste <= 4000 ? COLORS.orange : COLORS.red}
          fillOpacity={0.6}
          initial={{ width: 0 }}
          animate={{ width: barWidth * Math.min(metrics.totalWaste / maxTotalWaste, 1) }}
          transition={{ duration: 0.5 }}
        />
        <text x={60 + barWidth + 8} y={metricsY + 77} fontSize="12" fontWeight="700" fontFamily={FONTS.mono}
          fill={metrics.totalWaste <= 1000 ? COLORS.green : metrics.totalWaste <= 4000 ? COLORS.orange : COLORS.red}>
          {metrics.totalWaste}
        </text>

        {/* Metric 3: Worst-case waste % */}
        <text x={60} y={metricsY + 104} fontSize="10" fill={COLORS.dark} fontWeight="600">
          {t.worstWaste}
        </text>
        <rect x={60} y={metricsY + 110} width={barWidth} height={14} rx="3" fill={COLORS.light} />
        <motion.rect
          x={60} y={metricsY + 110} height={14} rx="3"
          fill={metrics.worstWastePct <= 15 ? COLORS.green : metrics.worstWastePct <= 50 ? COLORS.orange : COLORS.red}
          fillOpacity={0.6}
          initial={{ width: 0 }}
          animate={{ width: barWidth * (metrics.worstWastePct / maxWorstWaste) }}
          transition={{ duration: 0.5 }}
        />
        <text x={60 + barWidth + 8} y={metricsY + 121} fontSize="12" fontWeight="700" fontFamily={FONTS.mono}
          fill={metrics.worstWastePct <= 15 ? COLORS.green : metrics.worstWastePct <= 50 ? COLORS.orange : COLORS.red}>
          {metrics.worstWastePct}%
        </text>

        {/* Strategy description */}
        <text x={430} y={metricsY + 30} fontSize="11" fill={COLORS.dark} fontWeight="600">
          {strategy.label[locale]}
        </text>
        {strategy.description[locale].split(locale === 'zh' ? '。' : '. ').filter(Boolean).map((sentence, i) => (
          <text key={i} x={430} y={metricsY + 50 + i * 16} fontSize="10" fill={COLORS.mid}>
            {sentence.trim()}{locale === 'zh' ? '。' : '.'}
          </text>
        ))}

        {/* Summary comparison table */}
        <text x={430} y={metricsY + 95} fontSize="10" fontWeight="600" fill={COLORS.dark}>
          {locale === 'zh' ? '策略对比' : 'Strategy Comparison'}
        </text>
        {STRATEGIES.map((s, i) => {
          const m = (() => {
            const seqs = WORKLOAD.map(w => ({ actual: w, bucketed: s.getBucket(w), waste: s.getBucket(w) - w }));
            return {
              unique: new Set(seqs.map(b => b.bucketed)).size,
              waste: seqs.reduce((sum, b) => sum + b.waste, 0),
            };
          })();
          const isCurrent = activeStrategy === s.id;
          const ty = metricsY + 110 + i * 17;
          return (
            <g key={s.id}>
              <rect x={428} y={ty - 10} width={360} height={15} rx="2"
                fill={isCurrent ? COLORS.primary : 'transparent'}
                fillOpacity={isCurrent ? 0.08 : 0}
              />
              <text x={435} y={ty} fontSize="9" fontWeight={isCurrent ? '700' : '400'}
                fill={isCurrent ? COLORS.primary : COLORS.mid}>
                {s.label[locale]}
              </text>
              <text x={610} y={ty} textAnchor="middle" fontSize="9" fontFamily={FONTS.mono}
                fontWeight={isCurrent ? '700' : '400'}
                fill={isCurrent ? COLORS.primary : COLORS.mid}>
                {m.unique}
              </text>
              <text x={720} y={ty} textAnchor="middle" fontSize="9" fontFamily={FONTS.mono}
                fontWeight={isCurrent ? '700' : '400'}
                fill={isCurrent ? COLORS.primary : COLORS.mid}>
                {m.waste}
              </text>
            </g>
          );
        })}
        {/* Table header */}
        <text x={610} y={metricsY + 98} textAnchor="middle" fontSize="8" fill={COLORS.mid} fontWeight="600">
          {locale === 'zh' ? '编译数' : 'Compiles'}
        </text>
        <text x={720} y={metricsY + 98} textAnchor="middle" fontSize="8" fill={COLORS.mid} fontWeight="600">
          {locale === 'zh' ? '浪费' : 'Waste'}
        </text>
      </svg>
    </div>
  );
}
