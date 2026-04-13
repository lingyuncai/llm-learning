import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface HardwareConfig {
  sharedMemoryKB: number;
  registersPerSM: number;
  maxWarpsPerSM: number;
  hbmBandwidthTBs: number;
  computeTFLOPS: number;
}

interface KernelConfig {
  name: { zh: string; en: string };
  flops: number;
  hbmReads: number;
  hbmWrites: number;
  registersPerThread: number;
  sharedMemoryKB: number;
  blockSize: number;
}

interface FusionScenario {
  id: string;
  name: { zh: string; en: string };
  unfused: KernelConfig[];
  fused: KernelConfig;
  description: { zh: string; en: string };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const HW_PRESETS: { [key: string]: HardwareConfig } = {
  V100: { sharedMemoryKB: 96, registersPerSM: 65536, maxWarpsPerSM: 64, hbmBandwidthTBs: 0.9, computeTFLOPS: 125 },
  A100: { sharedMemoryKB: 164, registersPerSM: 65536, maxWarpsPerSM: 64, hbmBandwidthTBs: 2.0, computeTFLOPS: 312 },
  H100: { sharedMemoryKB: 228, registersPerSM: 65536, maxWarpsPerSM: 64, hbmBandwidthTBs: 3.35, computeTFLOPS: 990 },
};

const SCENARIOS: FusionScenario[] = [
  {
    id: 'beneficial',
    name: { zh: 'GELU + Dropout（融合有利）', en: 'GELU + Dropout (Beneficial)' },
    unfused: [
      { name: { zh: 'GELU', en: 'GELU' }, flops: 2, hbmReads: 4, hbmWrites: 4, registersPerThread: 16, sharedMemoryKB: 0, blockSize: 256 },
      { name: { zh: 'Dropout', en: 'Dropout' }, flops: 1, hbmReads: 4, hbmWrites: 4, registersPerThread: 12, sharedMemoryKB: 0, blockSize: 256 },
    ],
    fused: { name: { zh: 'GELU+Dropout', en: 'GELU+Dropout' }, flops: 3, hbmReads: 4, hbmWrites: 4, registersPerThread: 24, sharedMemoryKB: 0, blockSize: 256 },
    description: {
      zh: '两个 memory-bound pointwise op。融合后消除中间 tensor 的 HBM 读写（4+4=8 MB），FLOPs 不变。总是值得融合。',
      en: 'Two memory-bound pointwise ops. Fusion eliminates intermediate tensor HBM read+write (8 MB). FLOPs unchanged. Always beneficial.',
    },
  },
  {
    id: 'harmful',
    name: { zh: '大 Reduction + 小 Pointwise（融合有害）', en: 'Reduction + Pointwise (Harmful)' },
    unfused: [
      { name: { zh: 'LayerNorm', en: 'LayerNorm' }, flops: 10, hbmReads: 4, hbmWrites: 4, registersPerThread: 32, sharedMemoryKB: 8, blockSize: 256 },
      { name: { zh: 'Scale', en: 'Scale' }, flops: 0.5, hbmReads: 4, hbmWrites: 4, registersPerThread: 8, sharedMemoryKB: 0, blockSize: 256 },
    ],
    fused: { name: { zh: 'LayerNorm+Scale', en: 'LayerNorm+Scale' }, flops: 10.5, hbmReads: 4, hbmWrites: 4, registersPerThread: 40, sharedMemoryKB: 8, blockSize: 256 },
    description: {
      zh: '融合后 register pressure 增加（32+8→40），可能导致 occupancy 下降。LayerNorm 需要 shared memory 做 cross-thread reduction，而 Scale 不需要——融合后整个 kernel 都被 shared memory 约束。某些 GPU 上融合反而更慢。',
      en: 'Fusion increases register pressure (32+8→40), potentially reducing occupancy. LayerNorm needs shared memory for reduction; Scale doesn\'t — fusion constrains the entire kernel. On some GPUs, fusion is actually slower.',
    },
  },
  {
    id: 'tradeoff',
    name: { zh: 'MatMul + BiasAdd + ReLU（权衡）', en: 'MatMul + Bias + ReLU (Tradeoff)' },
    unfused: [
      { name: { zh: 'MatMul', en: 'MatMul' }, flops: 200, hbmReads: 20, hbmWrites: 4, registersPerThread: 40, sharedMemoryKB: 32, blockSize: 128 },
      { name: { zh: 'BiasAdd', en: 'BiasAdd' }, flops: 0.5, hbmReads: 4, hbmWrites: 4, registersPerThread: 8, sharedMemoryKB: 0, blockSize: 256 },
      { name: { zh: 'ReLU', en: 'ReLU' }, flops: 0.5, hbmReads: 4, hbmWrites: 4, registersPerThread: 8, sharedMemoryKB: 0, blockSize: 256 },
    ],
    fused: { name: { zh: 'MatMul+Bias+ReLU', en: 'MatMul+Bias+ReLU' }, flops: 201, hbmReads: 20, hbmWrites: 4, registersPerThread: 48, sharedMemoryKB: 32, blockSize: 128 },
    description: {
      zh: 'BiasAdd 和 ReLU 作为 MatMul 的 epilogue fusion。消除 8+8=16 MB 中间读写，register 增加可控（cuBLAS 已为 epilogue 预留空间）。',
      en: 'BiasAdd + ReLU as MatMul epilogue. Eliminates 16 MB intermediate access, register increase manageable (cuBLAS reserves space for epilogues).',
    },
  },
];

/* ─── Cost Model ─── */

function computeOccupancy(kernel: KernelConfig, hw: HardwareConfig) {
  const warpsPerBlock = kernel.blockSize / 32;
  const regsPerWarp = kernel.registersPerThread * 32;
  const maxWarpsFromRegs = Math.floor(hw.registersPerSM / regsPerWarp);
  const maxWarpsFromShMem = kernel.sharedMemoryKB > 0
    ? Math.floor(hw.sharedMemoryKB / kernel.sharedMemoryKB) * warpsPerBlock
    : hw.maxWarpsPerSM;
  const activeWarps = Math.min(hw.maxWarpsPerSM, maxWarpsFromRegs, maxWarpsFromShMem);
  return Math.min(1.0, activeWarps / hw.maxWarpsPerSM);
}

function computeTime(kernel: KernelConfig, hw: HardwareConfig) {
  const occ = computeOccupancy(kernel, hw);
  const occFactor = Math.max(0.25, occ);
  const totalHBM = (kernel.hbmReads + kernel.hbmWrites);
  const memTimeUs = totalHBM / (hw.hbmBandwidthTBs * 1e6) * 1e6;
  const compTimeUs = (kernel.flops * 1e6) / (hw.computeTFLOPS * 1e12 * occFactor) * 1e6;
  return { memTimeUs, compTimeUs, totalUs: Math.max(memTimeUs, compTimeUs), occupancy: occ };
}

/* ─── SVG Constants ─── */

const W = 800;
const H = 600;

/* ─── Component ─── */

export default function CostModelCalculator({ locale = 'zh' }: Props) {
  const [hwKey, setHwKey] = useState('A100');
  const [scenarioIdx, setScenarioIdx] = useState(0);

  const hw = HW_PRESETS[hwKey];
  const scenario = SCENARIOS[scenarioIdx];

  const t = {
    zh: {
      title: 'Cost Model 计算器',
      hw: '选择 GPU',
      unfused: '未融合',
      fused: '已融合',
      flops: 'FLOPs (M)',
      hbmRead: 'HBM 读 (MB)',
      hbmWrite: 'HBM 写 (MB)',
      regs: 'Reg/Thread',
      shMem: 'Shared Mem',
      time: '估算时间',
      occupancy: 'Occupancy',
      totalHBM: 'HBM 总量',
      verdict: '判定',
      beneficial: '融合有利',
      harmful: '融合有害',
      tradeoff: '权衡',
      faster: '快',
      slower: '慢',
      bandwidth: '带宽',
      compute: '算力',
      memBound: '访存受限',
      compBound: '计算受限',
      scenario: '场景',
    },
    en: {
      title: 'Cost Model Calculator',
      hw: 'Select GPU',
      unfused: 'Unfused',
      fused: 'Fused',
      flops: 'FLOPs (M)',
      hbmRead: 'HBM Read (MB)',
      hbmWrite: 'HBM Write (MB)',
      regs: 'Reg/Thread',
      shMem: 'Shared Mem',
      time: 'Est. Time',
      occupancy: 'Occupancy',
      totalHBM: 'Total HBM',
      verdict: 'Verdict',
      beneficial: 'Fusion Beneficial',
      harmful: 'Fusion Harmful',
      tradeoff: 'Tradeoff',
      faster: 'faster',
      slower: 'slower',
      bandwidth: 'Bandwidth',
      compute: 'Compute',
      memBound: 'Memory-bound',
      compBound: 'Compute-bound',
      scenario: 'Scenario',
    },
  }[locale]!;

  // Compute costs
  const unfusedResults = useMemo(
    () => scenario.unfused.map(k => computeTime(k, hw)),
    [scenario, hw]
  );
  const fusedResult = useMemo(
    () => computeTime(scenario.fused, hw),
    [scenario, hw]
  );

  const unfusedTotalUs = unfusedResults.reduce((s, r) => s + r.totalUs, 0);
  const fusedTotalUs = fusedResult.totalUs;
  const speedup = unfusedTotalUs / fusedTotalUs;
  const isBeneficial = speedup > 1.05;
  const isHarmful = speedup < 0.95;

  const unfusedTotalHBM = scenario.unfused.reduce((s, k) => s + k.hbmReads + k.hbmWrites, 0);
  const fusedTotalHBM = scenario.fused.hbmReads + scenario.fused.hbmWrites;
  const fusedOcc = computeOccupancy(scenario.fused, hw);
  const unfusedMinOcc = Math.min(...scenario.unfused.map(k => computeOccupancy(k, hw)));

  // Layout constants
  const headerY = 10;
  const controlY = 34;
  const scenarioTabY = 72;
  const mainY = 110;
  const leftX = 20;
  const rightX = 420;
  const cardW = 350;
  const bottomY = 420;

  function KernelCard({ kernel, result, x, y, w, h }: {
    kernel: KernelConfig; result: ReturnType<typeof computeTime>;
    x: number; y: number; w: number; h: number;
  }) {
    const isMem = result.memTimeUs >= result.compTimeUs;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1.5} />
        <text x={x + w / 2} y={y + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.dark}>
          {kernel.name[locale]}
        </text>
        {/* Metrics in two columns */}
        <text x={x + 10} y={y + 38} fontSize="9" fill={COLORS.mid}>{t.flops}:</text>
        <text x={x + 110} y={y + 38} fontSize="9" fontWeight="600" fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
          {kernel.flops}
        </text>
        <text x={x + 10} y={y + 54} fontSize="9" fill={COLORS.mid}>{t.hbmRead}:</text>
        <text x={x + 110} y={y + 54} fontSize="9" fontWeight="600" fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
          {kernel.hbmReads}
        </text>
        <text x={x + 10} y={y + 70} fontSize="9" fill={COLORS.mid}>{t.hbmWrite}:</text>
        <text x={x + 110} y={y + 70} fontSize="9" fontWeight="600" fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
          {kernel.hbmWrites}
        </text>
        <text x={x + 10} y={y + 86} fontSize="9" fill={COLORS.mid}>{t.regs}:</text>
        <text x={x + 110} y={y + 86} fontSize="9" fontWeight="600" fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
          {kernel.registersPerThread}
        </text>
        <text x={x + 10} y={y + 102} fontSize="9" fill={COLORS.mid}>{t.shMem}:</text>
        <text x={x + 110} y={y + 102} fontSize="9" fontWeight="600" fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
          {kernel.sharedMemoryKB > 0 ? `${kernel.sharedMemoryKB} KB` : '—'}
        </text>
        {/* Computed results */}
        <line x1={x + 8} y1={y + 112} x2={x + w - 8} y2={y + 112} stroke={COLORS.light} strokeWidth={1} />
        <text x={x + 10} y={y + 128} fontSize="9" fill={COLORS.mid}>{t.occupancy}:</text>
        <text x={x + 110} y={y + 128} fontSize="9" fontWeight="700"
          fill={result.occupancy < 0.5 ? COLORS.red : result.occupancy < 0.75 ? COLORS.orange : COLORS.green}
          style={{ fontFamily: FONTS.mono }}
        >
          {(result.occupancy * 100).toFixed(0)}%
        </text>
        <text x={x + 10} y={y + 144} fontSize="9" fill={COLORS.mid}>{t.time}:</text>
        <text x={x + 110} y={y + 144} fontSize="9" fontWeight="700" fill={COLORS.primary} style={{ fontFamily: FONTS.mono }}>
          {result.totalUs.toFixed(2)} μs
        </text>
        {/* Bound indicator */}
        <rect x={x + w - 90} y={y + 132} width={78} height={16} rx={8}
          fill={isMem ? COLORS.waste : COLORS.valid} stroke={isMem ? COLORS.red : COLORS.primary} strokeWidth={1} />
        <text x={x + w - 51} y={y + 143} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={isMem ? COLORS.red : COLORS.primary}>
          {isMem ? t.memBound : t.compBound}
        </text>
      </g>
    );
  }

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; } .clickable { cursor: pointer; }`}</style>

        {/* Title */}
        <text x={W / 2} y={headerY + 18} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* GPU Selector */}
        <text x={leftX} y={controlY + 14} fontSize="10" fontWeight="600" fill={COLORS.mid}>{t.hw}:</text>
        {Object.keys(HW_PRESETS).map((key, i) => {
          const bx = leftX + 75 + i * 80;
          const isActive = hwKey === key;
          return (
            <g key={key} className="clickable" onClick={() => setHwKey(key)}>
              <rect x={bx} y={controlY} width={68} height={24} rx={12}
                fill={isActive ? COLORS.primary : COLORS.bgAlt}
                stroke={isActive ? COLORS.primary : COLORS.light} strokeWidth={1.5} />
              <text x={bx + 34} y={controlY + 16} textAnchor="middle"
                fontSize="10" fontWeight="600" fill={isActive ? '#fff' : COLORS.dark}>
                {key}
              </text>
            </g>
          );
        })}
        {/* HW specs summary */}
        <text x={leftX + 340} y={controlY + 10} fontSize="8" fill={COLORS.mid} style={{ fontFamily: FONTS.mono }}>
          {t.bandwidth}: {hw.hbmBandwidthTBs} TB/s
        </text>
        <text x={leftX + 340} y={controlY + 22} fontSize="8" fill={COLORS.mid} style={{ fontFamily: FONTS.mono }}>
          {t.compute}: {hw.computeTFLOPS} TFLOPS | {t.shMem}: {hw.sharedMemoryKB} KB
        </text>

        {/* Scenario Tabs */}
        {SCENARIOS.map((sc, i) => {
          const tabW = 250;
          const bx = leftX + i * (tabW + 8);
          const isActive = scenarioIdx === i;
          return (
            <g key={sc.id} className="clickable" onClick={() => setScenarioIdx(i)}>
              <rect x={bx} y={scenarioTabY} width={tabW} height={26} rx={6}
                fill={isActive ? COLORS.highlight : COLORS.bgAlt}
                stroke={isActive ? COLORS.orange : COLORS.light} strokeWidth={isActive ? 2 : 1} />
              <text x={bx + tabW / 2} y={scenarioTabY + 17} textAnchor="middle"
                fontSize="9" fontWeight={isActive ? '700' : '500'} fill={COLORS.dark}>
                {sc.name[locale]}
              </text>
            </g>
          );
        })}

        {/* Unfused panel */}
        <text x={leftX + cardW / 2} y={mainY + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.mid}>
          {t.unfused}
        </text>
        {scenario.unfused.map((kernel, i) => {
          const cardH = 155;
          const cy = mainY + 14 + i * (cardH + 8);
          return (
            <KernelCard key={i} kernel={kernel} result={unfusedResults[i]} x={leftX} y={cy} w={cardW} h={cardH} />
          );
        })}

        {/* Arrow in center */}
        <g>
          <text x={leftX + cardW + 12} y={mainY + 120} fontSize="24" fill={COLORS.mid}>→</text>
        </g>

        {/* Fused panel */}
        <text x={rightX + cardW / 2} y={mainY + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.primary}>
          {t.fused}
        </text>
        <KernelCard kernel={scenario.fused} result={fusedResult} x={rightX} y={mainY + 14} w={cardW} h={155} />

        {/* Comparison bars at bottom */}
        <g>
          <rect x={leftX} y={bottomY} width={W - 2 * leftX} height={170} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

          {/* Execution time comparison */}
          <text x={leftX + 16} y={bottomY + 20} fontSize="10" fontWeight="600" fill={COLORS.dark}>
            {t.time}
          </text>
          {(() => {
            const barLeft = leftX + 120;
            const maxBarW = 280;
            const maxTime = Math.max(unfusedTotalUs, fusedTotalUs);
            const unfusedBarW = (unfusedTotalUs / maxTime) * maxBarW;
            const fusedBarW = (fusedTotalUs / maxTime) * maxBarW;
            return (
              <g>
                <text x={barLeft - 4} y={bottomY + 40} textAnchor="end" fontSize="8" fill={COLORS.mid}>{t.unfused}</text>
                <motion.rect x={barLeft} y={bottomY + 30} width={unfusedBarW} height={14} rx={3}
                  fill={COLORS.mid} initial={{ width: 0 }} animate={{ width: unfusedBarW }}
                  transition={{ duration: 0.5 }} />
                <text x={barLeft + unfusedBarW + 4} y={bottomY + 41} fontSize="8" fontWeight="600" fill={COLORS.dark}
                  style={{ fontFamily: FONTS.mono }}>
                  {unfusedTotalUs.toFixed(2)} μs
                </text>

                <text x={barLeft - 4} y={bottomY + 60} textAnchor="end" fontSize="8" fill={COLORS.mid}>{t.fused}</text>
                <motion.rect x={barLeft} y={bottomY + 50} width={fusedBarW} height={14} rx={3}
                  fill={isBeneficial ? COLORS.green : isHarmful ? COLORS.red : COLORS.orange}
                  initial={{ width: 0 }} animate={{ width: fusedBarW }}
                  transition={{ duration: 0.5 }} />
                <text x={barLeft + fusedBarW + 4} y={bottomY + 61} fontSize="8" fontWeight="600" fill={COLORS.dark}
                  style={{ fontFamily: FONTS.mono }}>
                  {fusedTotalUs.toFixed(2)} μs
                </text>
              </g>
            );
          })()}

          {/* Occupancy comparison */}
          <text x={leftX + 16} y={bottomY + 85} fontSize="10" fontWeight="600" fill={COLORS.dark}>
            {t.occupancy}
          </text>
          {(() => {
            const barLeft = leftX + 120;
            const maxBarW = 280;
            return (
              <g>
                <text x={barLeft - 4} y={bottomY + 100} textAnchor="end" fontSize="8" fill={COLORS.mid}>{t.unfused}</text>
                <motion.rect x={barLeft} y={bottomY + 90} width={unfusedMinOcc * maxBarW} height={14} rx={3}
                  fill={COLORS.mid} initial={{ width: 0 }} animate={{ width: unfusedMinOcc * maxBarW }}
                  transition={{ duration: 0.5 }} />
                <text x={barLeft + unfusedMinOcc * maxBarW + 4} y={bottomY + 101} fontSize="8" fontWeight="600"
                  fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
                  {(unfusedMinOcc * 100).toFixed(0)}%
                </text>

                <text x={barLeft - 4} y={bottomY + 120} textAnchor="end" fontSize="8" fill={COLORS.mid}>{t.fused}</text>
                <motion.rect x={barLeft} y={bottomY + 110} width={fusedOcc * maxBarW} height={14} rx={3}
                  fill={fusedOcc >= unfusedMinOcc ? COLORS.green : COLORS.red}
                  initial={{ width: 0 }} animate={{ width: fusedOcc * maxBarW }}
                  transition={{ duration: 0.5 }} />
                <text x={barLeft + fusedOcc * maxBarW + 4} y={bottomY + 121} fontSize="8" fontWeight="600"
                  fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
                  {(fusedOcc * 100).toFixed(0)}%
                </text>
              </g>
            );
          })()}

          {/* HBM comparison */}
          <text x={leftX + 16} y={bottomY + 145} fontSize="10" fontWeight="600" fill={COLORS.dark}>
            {t.totalHBM}
          </text>
          {(() => {
            const barLeft = leftX + 120;
            const maxBarW = 280;
            const maxHBM = Math.max(unfusedTotalHBM, fusedTotalHBM);
            return (
              <g>
                <text x={barLeft - 4} y={bottomY + 155} textAnchor="end" fontSize="8" fill={COLORS.mid}>{t.unfused}</text>
                <motion.rect x={barLeft} y={bottomY + 146} width={(unfusedTotalHBM / maxHBM) * maxBarW} height={10} rx={3}
                  fill={COLORS.mid} initial={{ width: 0 }} animate={{ width: (unfusedTotalHBM / maxHBM) * maxBarW }}
                  transition={{ duration: 0.5 }} />
                <text x={barLeft + (unfusedTotalHBM / maxHBM) * maxBarW + 4} y={bottomY + 155} fontSize="8"
                  fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
                  {unfusedTotalHBM} MB
                </text>

                <text x={barLeft - 4} y={bottomY + 167} textAnchor="end" fontSize="8" fill={COLORS.mid}>{t.fused}</text>
                <motion.rect x={barLeft} y={bottomY + 158} width={(fusedTotalHBM / maxHBM) * maxBarW} height={10} rx={3}
                  fill={fusedTotalHBM <= unfusedTotalHBM ? COLORS.green : COLORS.red}
                  initial={{ width: 0 }} animate={{ width: (fusedTotalHBM / maxHBM) * maxBarW }}
                  transition={{ duration: 0.5 }} />
                <text x={barLeft + (fusedTotalHBM / maxHBM) * maxBarW + 4} y={bottomY + 167} fontSize="8"
                  fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
                  {fusedTotalHBM} MB
                </text>
              </g>
            );
          })()}

          {/* Verdict panel */}
          {(() => {
            const vx = leftX + 470;
            const vy = bottomY + 20;
            const pctStr = Math.abs((speedup - 1) * 100).toFixed(0);
            const verdictColor = isBeneficial ? COLORS.green : isHarmful ? COLORS.red : COLORS.orange;
            const verdictText = isBeneficial
              ? `${pctStr}% ${t.faster}`
              : isHarmful
                ? `${pctStr}% ${t.slower}`
                : t.tradeoff;
            const verdictLabel = isBeneficial ? t.beneficial : isHarmful ? t.harmful : t.tradeoff;
            const icon = isBeneficial ? '\u2705' : isHarmful ? '\u274C' : '\u26A0\uFE0F';
            return (
              <g>
                <rect x={vx} y={vy} width={280} height={140} rx={8} fill={verdictColor} fillOpacity={0.08}
                  stroke={verdictColor} strokeWidth={2} />
                <text x={vx + 140} y={vy + 22} textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.dark}>
                  {t.verdict}
                </text>
                <text x={vx + 140} y={vy + 48} textAnchor="middle" fontSize="18" fontWeight="800" fill={verdictColor}>
                  {icon} {verdictLabel}
                </text>
                <text x={vx + 140} y={vy + 70} textAnchor="middle" fontSize="13" fontWeight="700" fill={verdictColor}
                  style={{ fontFamily: FONTS.mono }}>
                  {verdictText}
                </text>
                {/* Description */}
                {scenario.description[locale].split('。').filter(s => s.trim()).slice(0, 3).map((seg, i) => (
                  <text key={i} x={vx + 10} y={vy + 90 + i * 14} fontSize="7.5" fill={COLORS.mid}>
                    {seg.trim()}{seg.trim().endsWith('.') ? '' : locale === 'zh' ? '。' : '.'}
                  </text>
                ))}
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
}
