import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface FusionScenario {
  id: string;
  label: { zh: string; en: string };
  ops: string[];
  regsPerThread: number;
  dataReuse: number;
  description: { zh: string; en: string };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const SCENARIOS: FusionScenario[] = [
  {
    id: 'single_relu',
    label: { zh: '单个 ReLU', en: 'Single ReLU' },
    ops: ['relu'],
    regsPerThread: 8,
    dataReuse: 1.0,
    description: { zh: '最少寄存器，最高 occupancy，但无数据复用', en: 'Fewest registers, highest occupancy, but no data reuse' },
  },
  {
    id: 'fused_2',
    label: { zh: 'ReLU + Mul (2-op)', en: 'ReLU + Mul (2-op)' },
    ops: ['relu', 'mul'],
    regsPerThread: 16,
    dataReuse: 1.5,
    description: { zh: '中等寄存器，减少一次 HBM 往返', en: 'Moderate registers, eliminates one HBM round-trip' },
  },
  {
    id: 'fused_4',
    label: { zh: 'ReLU+Mul+Add+Tanh', en: 'ReLU+Mul+Add+Tanh' },
    ops: ['relu', 'mul', 'add', 'tanh'],
    regsPerThread: 32,
    dataReuse: 2.5,
    description: { zh: '较多寄存器，大幅减少内存访问', en: 'More registers, significantly reduces memory access' },
  },
  {
    id: 'fused_8',
    label: { zh: 'GEMM+8-op', en: 'GEMM+8-op' },
    ops: ['gemm', 'bias', 'relu', 'mul', 'add', 'norm', 'scale', 'tanh'],
    regsPerThread: 96,
    dataReuse: 4.0,
    description: { zh: '大量寄存器，最大数据复用，但 occupancy 大幅下降', en: 'Many registers, maximum reuse, but occupancy drops significantly' },
  },
  {
    id: 'fused_overload',
    label: { zh: '过度融合 (spill)', en: 'Over-fused (spill)' },
    ops: ['gemm', 'bias', 'relu', 'mul', 'add', 'norm', 'scale', 'tanh', 'dropout', 'residual', 'layernorm'],
    regsPerThread: 200,
    dataReuse: 3.0,
    description: { zh: '寄存器溢出！spill 到 local memory，性能反降', en: 'Register spill! Spills to local memory, performance drops' },
  },
];

const GPU_REGS_PER_SM = 65536;
const GPU_MAX_WARPS = 64;
const GPU_MAX_REGS_PER_THREAD = 255;
const GPU_THREADS_PER_WARP = 32;

/* ─── Computation ─── */

function computeMetrics(scenario: FusionScenario) {
  const regs = scenario.regsPerThread;
  const threadsPerWarp = GPU_THREADS_PER_WARP;
  const regsPerWarp = regs * threadsPerWarp;
  const maxWarps = Math.min(GPU_MAX_WARPS, Math.floor(GPU_REGS_PER_SM / regsPerWarp));
  const occupancy = maxWarps / GPU_MAX_WARPS;
  const spill = regs > GPU_MAX_REGS_PER_THREAD;
  const effectivePerf = spill ? scenario.dataReuse * 0.3 : scenario.dataReuse * Math.max(occupancy, 0.25);
  return { maxWarps, occupancy, spill, effectivePerf, regsPerWarp };
}

/* ─── Component ─── */

export default function RegisterPressureVisualizer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Register Pressure vs Occupancy 权衡',
      regsPerThread: '每线程寄存器',
      usedRegs: '已用',
      totalRegs: '总量',
      activeWarps: '活跃 warps',
      occupancy: 'Occupancy',
      dataReuse: '数据复用',
      effPerf: '有效性能',
      spillWarning: 'Register Spill! 性能下降',
      spillDetail: '溢出到 local memory (L1→L2→DRAM)',
      sweetSpot: '★ 最佳平衡点',
      regFile: '寄存器文件 (65536 regs/SM)',
      tradeoff: 'Occupancy vs 数据复用',
    },
    en: {
      title: 'Register Pressure vs Occupancy Tradeoff',
      regsPerThread: 'Regs/Thread',
      usedRegs: 'Used',
      totalRegs: 'Total',
      activeWarps: 'Active Warps',
      occupancy: 'Occupancy',
      dataReuse: 'Data Reuse',
      effPerf: 'Eff. Perf.',
      spillWarning: 'Register Spill! Performance degraded',
      spillDetail: 'Spills to local memory (L1→L2→DRAM)',
      sweetSpot: '★ Sweet Spot',
      regFile: 'Register File (65536 regs/SM)',
      tradeoff: 'Occupancy vs Data Reuse',
    },
  }[locale]!;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const scenario = SCENARIOS[selectedIdx];
  const metrics = computeMetrics(scenario);
  const allMetrics = SCENARIOS.map(s => computeMetrics(s));

  // Register file visualization dimensions
  const rfX = 30;
  const rfY = 100;
  const rfW = 150;
  const rfH = 280;

  const usedRegs = metrics.spill
    ? GPU_REGS_PER_SM // show overflowing
    : metrics.maxWarps * scenario.regsPerThread * GPU_THREADS_PER_WARP;
  const fillRatio = Math.min(usedRegs / GPU_REGS_PER_SM, 1);
  const fillH = rfH * fillRatio;

  // Bar chart dimensions
  const chartX = 400;
  const chartY = 82;
  const barH = 14;
  const barMaxW = 300;
  const rowSpacing = 80;

  // Max effective perf for normalization
  const maxPerf = Math.max(...allMetrics.map(m => m.effectivePerf));

  // Sweet spot index (typically fused_4)
  const sweetSpotIdx = 2;

  return (
    <div className="my-6">
      {/* Scenario selector tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SCENARIOS.map((s, i) => {
          const m = allMetrics[i];
          return (
            <button
              key={s.id}
              onClick={() => setSelectedIdx(i)}
              className="px-3 py-1.5 text-xs rounded-md transition-colors"
              style={{
                backgroundColor: i === selectedIdx ? (m.spill ? COLORS.red : COLORS.primary) : COLORS.bgAlt,
                color: i === selectedIdx ? '#fff' : COLORS.dark,
                border: `1px solid ${i === selectedIdx ? (m.spill ? COLORS.red : COLORS.primary) : COLORS.light}`,
              }}
            >
              {s.label[locale]}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg viewBox="0 0 800 500" className="w-full">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>

            {/* ─── Left Panel: Register File ─── */}
            <text x={rfX + rfW / 2} y={rfY - 15} textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {t.regFile}
            </text>

            {/* Total capacity outline */}
            <rect
              x={rfX}
              y={rfY}
              width={rfW}
              height={rfH}
              rx={6}
              fill="none"
              stroke={COLORS.dark}
              strokeWidth={1.5}
              strokeOpacity={0.2}
            />

            {/* Filled portion (animated) */}
            <motion.rect
              x={rfX + 2}
              y={rfY + rfH - fillH + 2}
              width={rfW - 4}
              rx={4}
              fill={metrics.spill ? COLORS.red : fillRatio > 0.8 ? COLORS.orange : fillRatio > 0.5 ? COLORS.orange : COLORS.green}
              fillOpacity={0.25}
              stroke={metrics.spill ? COLORS.red : fillRatio > 0.5 ? COLORS.orange : COLORS.green}
              strokeWidth={1}
              strokeOpacity={0.4}
              animate={{ height: fillH - 4 > 0 ? fillH - 4 : 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* Register usage label */}
            <text x={rfX + rfW / 2} y={rfY + rfH + 20} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
              <tspan fontWeight="600">{t.usedRegs}: </tspan>
              {usedRegs.toLocaleString()} / {GPU_REGS_PER_SM.toLocaleString()}
            </text>

            {/* Active warps label */}
            <text x={rfX + rfW / 2} y={rfY + rfH + 38} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
              <tspan fontWeight="600">{t.activeWarps}: </tspan>
              {metrics.maxWarps} / {GPU_MAX_WARPS}
            </text>

            {/* Regs per thread label */}
            <text x={rfX + rfW / 2} y={rfY + rfH + 56} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
              <tspan fontWeight="600">{t.regsPerThread}: </tspan>
              {scenario.regsPerThread}
              {metrics.spill ? ` (> ${GPU_MAX_REGS_PER_THREAD} max!)` : ''}
            </text>

            {/* Spill visualization */}
            {metrics.spill && (
              <g>
                {/* Overflow dashed area */}
                <rect
                  x={rfX}
                  y={rfY + rfH + 2}
                  width={rfW}
                  height={40}
                  rx={4}
                  fill={COLORS.red}
                  fillOpacity={0.08}
                  stroke={COLORS.red}
                  strokeWidth={1.5}
                  strokeDasharray="6,3"
                  strokeOpacity={0.5}
                />
                <text
                  x={rfX + rfW / 2}
                  y={rfY + rfH + 18}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill={COLORS.red}
                >
                  Spill → Local Memory
                </text>
                <text
                  x={rfX + rfW / 2}
                  y={rfY + rfH + 32}
                  textAnchor="middle"
                  fontSize="8"
                  fill={COLORS.red}
                  fillOpacity={0.7}
                >
                  (L1 → L2 → DRAM)
                </text>

                {/* Pulsing warning */}
                <motion.rect
                  x={rfX - 5}
                  y={rfY - 5}
                  width={rfW + 10}
                  height={rfH + 50}
                  rx={8}
                  fill="none"
                  stroke={COLORS.red}
                  strokeWidth={2}
                  animate={{ strokeOpacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </g>
            )}

            {/* ─── Fused Ops List ─── */}
            <text x={210} y={rfY - 15} fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {locale === 'zh' ? '融合的算子' : 'Fused Ops'}
            </text>
            {scenario.ops.map((op, i) => {
              const opY = rfY + 5 + i * 22;
              if (opY > rfY + rfH - 10) return null;
              return (
                <g key={`${op}-${i}`}>
                  <rect
                    x={210}
                    y={opY}
                    width={70}
                    height={18}
                    rx={4}
                    fill={COLORS.primary}
                    fillOpacity={0.08}
                    stroke={COLORS.primary}
                    strokeWidth={0.8}
                    strokeOpacity={0.3}
                  />
                  <text
                    x={245}
                    y={opY + 12}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily={FONTS.mono}
                    fill={COLORS.primary}
                    fontWeight="500"
                  >
                    {op}
                  </text>
                </g>
              );
            })}
            {scenario.ops.length > 10 && (
              <text x={245} y={rfY + 5 + 10 * 22 + 12} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
                +{scenario.ops.length - 10} more...
              </text>
            )}

            {/* ─── Right Panel: Tradeoff Chart ─── */}
            <text x={chartX} y={chartY - 8} fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {t.tradeoff}
            </text>

            {SCENARIOS.map((s, i) => {
              const m = allMetrics[i];
              const rowY = chartY + i * rowSpacing;
              const isCurrent = i === selectedIdx;
              const isSweet = i === sweetSpotIdx;
              const opacity = isCurrent ? 1 : 0.35;

              return (
                <g key={s.id} opacity={opacity}>
                  {/* Scenario label */}
                  <text
                    x={chartX}
                    y={rowY + 5}
                    fontSize="10"
                    fontWeight={isCurrent ? '700' : '500'}
                    fill={m.spill ? COLORS.red : COLORS.dark}
                  >
                    {s.label[locale]}
                    {isSweet && isCurrent ? ` ${t.sweetSpot}` : ''}
                  </text>

                  {/* Occupancy bar */}
                  <text x={chartX} y={rowY + 22} fontSize="8" fill={COLORS.mid} fontWeight="500">
                    {t.occupancy}: {(m.occupancy * 100).toFixed(0)}%
                  </text>
                  <rect x={chartX + 100} y={rowY + 14} width={barMaxW} height={barH} rx={3} fill={COLORS.light} fillOpacity={0.5} />
                  <motion.rect
                    x={chartX + 100}
                    y={rowY + 14}
                    height={barH}
                    rx={3}
                    fill={m.spill ? COLORS.red : COLORS.green}
                    fillOpacity={isCurrent ? 0.5 : 0.3}
                    animate={{ width: m.occupancy * barMaxW }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />

                  {/* Data reuse bar */}
                  <text x={chartX} y={rowY + 42} fontSize="8" fill={COLORS.mid} fontWeight="500">
                    {t.dataReuse}: {s.dataReuse}x
                  </text>
                  <rect x={chartX + 100} y={rowY + 34} width={barMaxW} height={barH} rx={3} fill={COLORS.light} fillOpacity={0.5} />
                  <motion.rect
                    x={chartX + 100}
                    y={rowY + 34}
                    height={barH}
                    rx={3}
                    fill={COLORS.primary}
                    fillOpacity={isCurrent ? 0.5 : 0.3}
                    animate={{ width: (s.dataReuse / 4.0) * barMaxW }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />

                  {/* Effective performance bar */}
                  <text x={chartX} y={rowY + 62} fontSize="8" fill={COLORS.mid} fontWeight="500">
                    {t.effPerf}: {m.effectivePerf.toFixed(2)}
                  </text>
                  <rect x={chartX + 100} y={rowY + 54} width={barMaxW} height={barH} rx={3} fill={COLORS.light} fillOpacity={0.5} />
                  <motion.rect
                    x={chartX + 100}
                    y={rowY + 54}
                    height={barH}
                    rx={3}
                    fill={m.spill ? COLORS.red : COLORS.purple}
                    fillOpacity={isCurrent ? 0.5 : 0.3}
                    animate={{ width: (m.effectivePerf / maxPerf) * barMaxW }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </g>
              );
            })}

            {/* ─── Bottom: Description ─── */}
            <text x={30} y={485} fontSize="11" fill={metrics.spill ? COLORS.red : COLORS.mid} fontWeight={metrics.spill ? '600' : '400'}>
              {scenario.description[locale]}
            </text>

            {/* Spill warning box */}
            {metrics.spill && (
              <motion.g
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <rect x={400} y={468} width={380} height={26} rx={6} fill={COLORS.red} fillOpacity={0.1} stroke={COLORS.red} strokeWidth={1.5} strokeOpacity={0.5} />
                <text x={410} y={485} fontSize="11" fontWeight="700" fill={COLORS.red}>
                  ⚠ {t.spillWarning}
                </text>
              </motion.g>
            )}
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
