// src/components/interactive/PerplexityVsTaskAccuracy.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type BenchmarkKey = 'MMLU' | 'GSM8K' | 'HumanEval';

const BENCH_INFO: Record<BenchmarkKey, { zh: string; en: string; color: string }> = {
  MMLU:      { zh: 'MMLU (知识)', en: 'MMLU (Knowledge)', color: COLORS.primary },
  GSM8K:     { zh: 'GSM8K (数学)', en: 'GSM8K (Math)', color: COLORS.orange },
  HumanEval: { zh: 'HumanEval (代码)', en: 'HumanEval (Code)', color: COLORS.green },
};

// Data representative of Llama 3.1 8B GGUF quantization variants
// Sources:
// - Perplexity values: community benchmarks on llama.cpp (WikiText-2, context 512)
// - Task scores: estimated from HuggingFace Open LLM Leaderboard quantized submissions
//   and community GGUF evaluations (TheBloke, bartowski repos)
// - Degradation patterns verified against HuggingFace blog "Overview of quantization in Transformers"
//   (Llama-2 7B GPTQ/BnB: ~1pt avg drop at INT4 on ARC/HellaSwag/MMLU/TruthfulQA)
// - Key insight (ppl-task divergence at Q4 and below) consistent with ZeroQuant-V2 findings
interface QuantLevel {
  label: string;
  bits: string;
  ppl: number;
  pplChange: number;
  taskChanges: Record<BenchmarkKey, number>;
}

const QUANT_LEVELS: QuantLevel[] = [
  { label: 'FP16',   bits: '16-bit', ppl: 6.24, pplChange: 0,
    taskChanges: { MMLU: 0, GSM8K: 0, HumanEval: 0 } },
  { label: 'Q8_0',   bits: '8-bit',  ppl: 6.25, pplChange: 0.16,
    taskChanges: { MMLU: -0.3, GSM8K: -0.6, HumanEval: -1.0 } },
  { label: 'Q6_K',   bits: '6-bit',  ppl: 6.26, pplChange: 0.32,
    taskChanges: { MMLU: -0.5, GSM8K: -0.8, HumanEval: -1.5 } },
  { label: 'Q5_K_M', bits: '5-bit',  ppl: 6.30, pplChange: 0.96,
    taskChanges: { MMLU: -0.8, GSM8K: -1.5, HumanEval: -3.0 } },
  { label: 'Q4_K_M', bits: '4-bit',  ppl: 6.38, pplChange: 2.24,
    taskChanges: { MMLU: -1.2, GSM8K: -3.0, HumanEval: -5.0 } },
  { label: 'Q3_K_M', bits: '3-bit',  ppl: 6.55, pplChange: 4.97,
    taskChanges: { MMLU: -2.5, GSM8K: -6.0, HumanEval: -10.0 } },
  { label: 'Q2_K',   bits: '2-bit',  ppl: 7.20, pplChange: 15.38,
    taskChanges: { MMLU: -8.0, GSM8K: -15.0, HumanEval: -20.0 } },
];

const W = 600;
const H = 380;
const margin = { top: 50, right: 70, bottom: 65, left: 60 };

export default function PerplexityVsTaskAccuracy({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [selectedBench, setSelectedBench] = useState<BenchmarkKey>('HumanEval');
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;

  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  // Y-axis scales
  const maxPplChange = 16;
  const maxTaskDrop = 22;

  const xScale = (i: number) => (i / (QUANT_LEVELS.length - 1)) * innerW;
  const yLeftScale = (v: number) => innerH - (v / maxPplChange) * innerH;
  const yRightScale = (v: number) => innerH - (Math.abs(v) / maxTaskDrop) * innerH;

  // Build path strings
  const pplPath = useMemo(() => {
    return QUANT_LEVELS.map((q, i) =>
      `${i === 0 ? 'M' : 'L'}${xScale(i)},${yLeftScale(q.pplChange)}`
    ).join(' ');
  }, []);

  const taskPath = useMemo(() => {
    return QUANT_LEVELS.map((q, i) =>
      `${i === 0 ? 'M' : 'L'}${xScale(i)},${yRightScale(q.taskChanges[selectedBench])}`
    ).join(' ');
  }, [selectedBench]);

  // Find divergence point (where task drops faster than ppl would predict)
  const divergeIdx = 4; // Q4_K_M is the key divergence point

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="text-center mb-3">
        <h3 className="text-base font-bold" style={{ color: COLORS.dark }}>
          {t('Perplexity vs 任务精度变化', 'Perplexity vs Task Accuracy Change')}
        </h3>
        <p className="text-xs mt-1" style={{ color: COLORS.mid }}>
          {t('Llama 3.1 8B GGUF — 量化等级对 perplexity 和 benchmark 分数的影响',
             'Llama 3.1 8B GGUF — Impact of quantization levels on perplexity and benchmark scores')}
        </p>
      </div>

      {/* Benchmark selector */}
      <div className="flex justify-center gap-2 mb-3">
        {(Object.keys(BENCH_INFO) as BenchmarkKey[]).map(bk => (
          <button
            key={bk}
            onClick={() => setSelectedBench(bk)}
            className="px-3 py-1 rounded text-xs font-semibold transition-all"
            style={{
              background: selectedBench === bk ? BENCH_INFO[bk].color : COLORS.bgAlt,
              color: selectedBench === bk ? '#fff' : COLORS.mid,
              border: `1px solid ${selectedBench === bk ? BENCH_INFO[bk].color : COLORS.light}`,
            }}
          >
            {BENCH_INFO[bk][locale]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <marker id="ppl-dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
            <circle cx="3" cy="3" r="2.5" fill={COLORS.red} />
          </marker>
          <marker id="task-dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
            <circle cx="3" cy="3" r="2.5" fill={BENCH_INFO[selectedBench].color} />
          </marker>
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Title */}
          <text x={innerW / 2} y={-30} textAnchor="middle"
            fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans} fontWeight="700">
            {t('双轴对比：Perplexity 变化率 vs 任务精度变化率',
               'Dual-Axis: Perplexity Change % vs Task Accuracy Change %')}
          </text>

          {/* Grid lines */}
          {[0, 4, 8, 12, 16].map(v => (
            <line key={`grid-${v}`} x1={0} y1={yLeftScale(v)} x2={innerW} y2={yLeftScale(v)}
              stroke={COLORS.light} strokeWidth={0.5} strokeDasharray="4,3" />
          ))}

          {/* Divergence zone highlight */}
          <rect
            x={xScale(divergeIdx) - 15}
            y={0}
            width={innerW - xScale(divergeIdx) + 30}
            height={innerH}
            fill={COLORS.red}
            opacity={0.04}
            rx={4}
          />
          <text x={xScale(divergeIdx) + (innerW - xScale(divergeIdx)) / 2} y={12}
            textAnchor="middle" fontSize="7" fill={COLORS.red} fontFamily={FONTS.sans}
            fontWeight="600" opacity={0.7}>
            {t('分歧区域', 'Divergence Zone')}
          </text>

          {/* Perplexity line */}
          <path d={pplPath} fill="none" stroke={COLORS.red}
            strokeWidth={2} strokeLinecap="round" />
          {QUANT_LEVELS.map((q, i) => (
            <circle key={`ppl-${i}`} cx={xScale(i)} cy={yLeftScale(q.pplChange)}
              r={3} fill={COLORS.red} stroke="#fff" strokeWidth={1} />
          ))}

          {/* Task accuracy line */}
          <AnimatePresence mode="wait">
            <motion.g
              key={selectedBench}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <path d={taskPath} fill="none" stroke={BENCH_INFO[selectedBench].color}
                strokeWidth={2} strokeLinecap="round" strokeDasharray="6,3" />
              {QUANT_LEVELS.map((q, i) => (
                <circle key={`task-${i}`} cx={xScale(i)} cy={yRightScale(q.taskChanges[selectedBench])}
                  r={3} fill={BENCH_INFO[selectedBench].color} stroke="#fff" strokeWidth={1} />
              ))}
            </motion.g>
          </AnimatePresence>

          {/* X axis labels */}
          {QUANT_LEVELS.map((q, i) => (
            <g key={q.label}>
              <text x={xScale(i)} y={innerH + 15} textAnchor="middle"
                fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono} fontWeight="600">
                {q.label}
              </text>
              <text x={xScale(i)} y={innerH + 25} textAnchor="middle"
                fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
                {q.bits}
              </text>
              {/* PPL value */}
              <text x={xScale(i)} y={innerH + 37} textAnchor="middle"
                fontSize="6" fill={COLORS.red} fontFamily={FONTS.mono}>
                ppl {q.ppl}
              </text>
            </g>
          ))}

          {/* Left Y axis — Perplexity change */}
          {[0, 4, 8, 12, 16].map(v => (
            <text key={`yl-${v}`} x={-8} y={yLeftScale(v) + 3} textAnchor="end"
              fontSize="7" fill={COLORS.red} fontFamily={FONTS.mono}>
              +{v}%
            </text>
          ))}
          <text x={-40} y={innerH / 2} textAnchor="middle"
            transform={`rotate(-90, -40, ${innerH / 2})`}
            fontSize="8" fill={COLORS.red} fontFamily={FONTS.sans} fontWeight="600">
            {t('Perplexity 变化 %', 'Perplexity Change %')}
          </text>

          {/* Right Y axis — Task accuracy change */}
          {[0, 5, 10, 15, 20].map(v => (
            <text key={`yr-${v}`} x={innerW + 8} y={yRightScale(v) + 3} textAnchor="start"
              fontSize="7" fill={BENCH_INFO[selectedBench].color} fontFamily={FONTS.mono}>
              -{v}%
            </text>
          ))}
          <text x={innerW + 50} y={innerH / 2} textAnchor="middle"
            transform={`rotate(90, ${innerW + 50}, ${innerH / 2})`}
            fontSize="8" fill={BENCH_INFO[selectedBench].color} fontFamily={FONTS.sans} fontWeight="600">
            {t('任务精度变化 %', 'Task Accuracy Change %')}
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke={COLORS.red} strokeWidth="2" /></svg>
          <span className="text-xs" style={{ color: COLORS.red }}>
            {t('Perplexity 变化率', 'Perplexity Change %')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke={BENCH_INFO[selectedBench].color} strokeWidth="2" strokeDasharray="4,2" /></svg>
          <span className="text-xs" style={{ color: BENCH_INFO[selectedBench].color }}>
            {t(`${selectedBench} 精度变化率`, `${selectedBench} Accuracy Change %`)}
          </span>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
        <p className="font-semibold mb-1" style={{ color: COLORS.dark }}>
          {t('关键发现', 'Key Insight')}
        </p>
        <ul className="list-disc list-inside space-y-1" style={{ color: COLORS.dark }}>
          <li>
            {t(
              'Q5_K_M 及以上：perplexity 和任务精度基本同步，perplexity 是可靠的质量指标',
              'Q5_K_M and above: perplexity and task accuracy track closely, perplexity is a reliable quality indicator'
            )}
          </li>
          <li>
            {t(
              'Q4_K_M 以下：任务精度（尤其代码）下降速度远超 perplexity 预期 — 不能仅靠 perplexity 判断',
              'Below Q4_K_M: task accuracy (especially code) drops much faster than perplexity suggests — perplexity alone is insufficient'
            )}
          </li>
          <li>
            {t(
              'Perplexity 是快速筛选工具，不能替代 task-specific 评估',
              'Perplexity is a quick screening tool, not a substitute for task-specific evaluation'
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
