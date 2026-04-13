import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

type FlowStage = 'idle' | 'load_hbm' | 'load_smem' | 'compute' | 'double_buffer' | 'store';

interface MemoryTier {
  id: string;
  label: { zh: string; en: string };
  capacity: string;
  bandwidth: string;
  latency: string;
  color: string;
  y: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const MEMORY_TIERS: MemoryTier[] = [
  { id: 'hbm', label: { zh: 'HBM (全局显存)', en: 'HBM (Global Memory)' },
    capacity: '80 GB', bandwidth: '2 TB/s', latency: '~400 cycles', color: COLORS.red, y: 60 },
  { id: 'l2', label: { zh: 'L2 Cache', en: 'L2 Cache' },
    capacity: '40 MB', bandwidth: '~5 TB/s', latency: '~200 cycles', color: COLORS.orange, y: 160 },
  { id: 'smem', label: { zh: 'Shared Memory (SRAM)', en: 'Shared Memory (SRAM)' },
    capacity: '~164 KB/SM', bandwidth: '~19 TB/s', latency: '~30 cycles', color: COLORS.primary, y: 260 },
  { id: 'reg', label: { zh: 'Register File', en: 'Register File' },
    capacity: '256 KB/SM', bandwidth: 'on-chip', latency: '~1 cycle', color: COLORS.green, y: 360 },
];

const STAGES: FlowStage[] = ['idle', 'load_hbm', 'load_smem', 'compute', 'double_buffer', 'store'];

const STAGE_DESCRIPTIONS: Record<FlowStage, { zh: string; en: string }> = {
  idle: {
    zh: '空闲状态。数据存储在 HBM 中，准备开始 tiling 计算。',
    en: 'Idle state. Data resides in HBM, ready to begin tiled computation.',
  },
  load_hbm: {
    zh: 'HBM → L2 → Shared Memory：使用 cp.async (Ampere+) 将 Tile[0] 从全局显存异步复制到 Shared Memory，不经过 Register File。',
    en: 'HBM → L2 → Shared Memory: Use cp.async (Ampere+) to asynchronously copy Tile[0] from global memory to Shared Memory, bypassing Register File.',
  },
  load_smem: {
    zh: 'Shared Memory → Register File：每个线程从 Shared Memory 加载所需的数据片段到寄存器中，准备计算。',
    en: 'Shared Memory → Register File: Each thread loads its required data fragment from Shared Memory into registers, preparing for computation.',
  },
  compute: {
    zh: 'Tensor Core 计算：MMA 指令在 Register File 中执行 16×16×16 矩阵乘加，达到峰值吞吐。',
    en: 'Tensor Core compute: MMA instructions execute 16×16×16 matrix multiply-add in Register File at peak throughput.',
  },
  double_buffer: {
    zh: 'Double Buffering：Tile[0] 计算的同时，cp.async 预加载 Tile[1] 到 Shared Memory 的另一个 buffer。Load 和 Compute 重叠执行。',
    en: 'Double Buffering: While computing Tile[0], cp.async preloads Tile[1] into another Shared Memory buffer. Load and Compute overlap.',
  },
  store: {
    zh: '结果写回：计算结果从 Register File 写回 HBM（通过 L2 Cache）。一个 tile 的生命周期完成。',
    en: 'Store result: Computed result writes back from Register File to HBM (via L2 Cache). One tile lifecycle complete.',
  },
};

/* ─── Component ─── */

export default function MemoryHierarchyFlow({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'GPU 内存层次数据流',
      play: '▶ 播放',
      pause: '⏸ 暂停',
      step: '单步 ▶',
      reset: '↻ 重置',
      capacity: '容量',
      bw: '带宽',
      lat: '延迟',
      pipeline: 'Double Buffering 流水线',
      load: '加载',
      compute: '计算',
      store: '写回',
      barrier: '__syncthreads()',
    },
    en: {
      title: 'GPU Memory Hierarchy Data Flow',
      play: '▶ Play',
      pause: '⏸ Pause',
      step: 'Step ▶',
      reset: '↻ Reset',
      capacity: 'Capacity',
      bw: 'Bandwidth',
      lat: 'Latency',
      pipeline: 'Double Buffering Pipeline',
      load: 'Load',
      compute: 'Compute',
      store: 'Store',
      barrier: '__syncthreads()',
    },
  }[locale]!;

  const [stageIdx, setStageIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stage = STAGES[stageIdx];

  const advance = useCallback(() => {
    setStageIdx(prev => (prev < STAGES.length - 1 ? prev + 1 : 0));
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(advance, 1800);
    return () => clearInterval(timer);
  }, [playing, advance]);

  const handleStep = () => { setPlaying(false); advance(); };
  const handleReset = () => { setPlaying(false); setStageIdx(0); };
  const handlePlay = () => setPlaying(p => !p);

  /* ── Data block positions ── */
  function getTileY(tileStage: FlowStage): number | null {
    switch (tileStage) {
      case 'idle': return null;
      case 'load_hbm': return 110;
      case 'load_smem': return 310;
      case 'compute': return 360;
      case 'double_buffer': return 360;
      case 'store': return 60;
    }
  }

  /* ── Pipeline timeline rendering ── */
  function renderPipeline() {
    const px = 480, py = 80;
    const laneH = 36, laneW = 260;
    const lanes = [
      { label: t.load, color: COLORS.orange },
      { label: t.compute, color: COLORS.green },
      { label: t.store, color: COLORS.red },
    ];

    // Pipeline stages: each column = one time step
    const steps = [
      // step 0: Load T0
      [{ lane: 0, tile: 0 }],
      // step 1: Compute T0, Load T1 (overlap!)
      [{ lane: 0, tile: 1 }, { lane: 1, tile: 0 }],
      // step 2: Compute T1, Load T2, Store T0
      [{ lane: 0, tile: 2 }, { lane: 1, tile: 1 }, { lane: 2, tile: 0 }],
      // step 3: Compute T2, Load T3, Store T1
      [{ lane: 0, tile: 3 }, { lane: 1, tile: 2 }, { lane: 2, tile: 1 }],
    ];

    const colW = laneW / steps.length;
    const tileColors = [HEAD_COLORS[0], HEAD_COLORS[1], HEAD_COLORS[2], HEAD_COLORS[3]];

    // Determine which pipeline columns to highlight based on current stage
    const highlightCol = stageIdx <= 1 ? 0 : stageIdx <= 3 ? 1 : stageIdx <= 4 ? 2 : 3;

    return (
      <g>
        <text x={px} y={py - 10} fontSize="12" fontWeight="600" fill={COLORS.dark}>
          {t.pipeline}
        </text>

        {/* Lane labels and backgrounds */}
        {lanes.map((lane, li) => (
          <g key={lane.label}>
            <text x={px} y={py + li * (laneH + 6) + 22} fontSize="10" fontWeight="600" fill={lane.color}>
              {lane.label}
            </text>
            <rect x={px + 60} y={py + li * (laneH + 6)} width={laneW} height={laneH} rx="4"
              fill={COLORS.light} fillOpacity={0.5}
            />
          </g>
        ))}

        {/* Time step labels */}
        {steps.map((_, si) => (
          <text key={si} x={px + 60 + si * colW + colW / 2} y={py + 3 * (laneH + 6) + 16}
            textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>
            t={si}
          </text>
        ))}

        {/* Pipeline blocks */}
        {steps.map((step, si) =>
          step.map(({ lane, tile }) => (
            <motion.rect
              key={`pipe-${si}-${lane}`}
              x={px + 60 + si * colW + 2}
              y={py + lane * (laneH + 6) + 3}
              width={colW - 4} height={laneH - 6} rx="3"
              fill={tileColors[tile % tileColors.length]}
              fillOpacity={si === highlightCol ? 0.6 : 0.15}
              stroke={tileColors[tile % tileColors.length]}
              strokeWidth={si === highlightCol ? 2 : 0.5}
              strokeOpacity={si === highlightCol ? 1 : 0.3}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: si * 0.05 }}
            />
          ))
        )}

        {/* Tile labels in pipeline blocks */}
        {steps.map((step, si) =>
          step.map(({ lane, tile }) => (
            <text
              key={`pipe-lbl-${si}-${lane}`}
              x={px + 60 + si * colW + colW / 2}
              y={py + lane * (laneH + 6) + laneH / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fontFamily={FONTS.mono} fontWeight="600"
              fill={si === highlightCol ? tileColors[tile % tileColors.length] : COLORS.mid}
            >
              T{tile}
            </text>
          ))
        )}

        {/* "overlap" annotation */}
        <text x={px + 60 + colW * 1.5} y={py + 3 * (laneH + 6) + 32}
          textAnchor="middle" fontSize="9" fill={COLORS.green} fontWeight="600">
          ← Load + Compute overlap →
        </text>
      </g>
    );
  }

  return (
    <div className="my-6">
      <svg viewBox="0 0 800 540" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x="230" y="24" textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Control buttons */}
        {[
          { label: playing ? t.pause : t.play, action: handlePlay, x: 30 },
          { label: t.step, action: handleStep, x: 140 },
          { label: t.reset, action: handleReset, x: 230 },
        ].map(btn => (
          <g key={btn.label} onClick={btn.action} style={{ cursor: 'pointer' }}>
            <rect x={btn.x} y={33} width={90} height={26} rx="6"
              fill={COLORS.primary} fillOpacity={0.08}
              stroke={COLORS.primary} strokeWidth="1" strokeOpacity={0.3}
            />
            <text x={btn.x + 45} y={50} textAnchor="middle" fontSize="11" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.mono}>
              {btn.label}
            </text>
          </g>
        ))}

        {/* Left column: Memory hierarchy boxes */}
        {MEMORY_TIERS.map((tier, i) => {
          const bx = 30, bw = 410, bh = 60;
          return (
            <g key={tier.id}>
              {/* Box */}
              <rect x={bx} y={tier.y} width={bw} height={bh} rx="6"
                fill={tier.color} fillOpacity={0.06}
                stroke={tier.color} strokeWidth="1.5" strokeOpacity={0.4}
              />
              {/* Label */}
              <text x={bx + 10} y={tier.y + 20} fontSize="12" fontWeight="700" fill={tier.color}>
                {tier.label[locale]}
              </text>
              {/* Stats */}
              <text x={bx + 10} y={tier.y + 38} fontSize="9.5" fill={COLORS.mid} fontFamily={FONTS.mono}>
                {t.capacity}: {tier.capacity}
              </text>
              <text x={bx + 150} y={tier.y + 38} fontSize="9.5" fill={COLORS.mid} fontFamily={FONTS.mono}>
                {t.bw}: {tier.bandwidth}
              </text>
              <text x={bx + 290} y={tier.y + 38} fontSize="9.5" fill={COLORS.mid} fontFamily={FONTS.mono}>
                {t.lat}: {tier.latency}
              </text>
              {/* Capacity bar */}
              <rect x={bx + 10} y={tier.y + 48} width={bw - 20} height={4} rx="2" fill={tier.color} fillOpacity={0.1} />
              <rect x={bx + 10} y={tier.y + 48}
                width={i === 0 ? bw - 20 : i === 1 ? (bw - 20) * 0.005 : i === 2 ? (bw - 20) * 0.00002 : (bw - 20) * 0.00003}
                height={4} rx="2" fill={tier.color} fillOpacity={0.5}
              />

              {/* Downward arrow */}
              {i < MEMORY_TIERS.length - 1 && (
                <g>
                  <line x1={bx + bw / 2} y1={tier.y + bh + 2} x2={bx + bw / 2} y2={MEMORY_TIERS[i + 1].y - 2}
                    stroke={COLORS.mid} strokeWidth="1.5" strokeOpacity={0.3}
                  />
                  <polygon
                    points={`${bx + bw / 2 - 4},${MEMORY_TIERS[i + 1].y - 6} ${bx + bw / 2},${MEMORY_TIERS[i + 1].y - 1} ${bx + bw / 2 + 4},${MEMORY_TIERS[i + 1].y - 6}`}
                    fill={COLORS.mid} fillOpacity={0.3}
                  />
                  {/* cp.async label between HBM→L2 and L2→SMEM */}
                  {i === 0 && (
                    <text x={bx + bw / 2 + 12} y={(tier.y + bh + MEMORY_TIERS[i + 1].y) / 2 + 4}
                      fontSize="9" fill={COLORS.orange} fontFamily={FONTS.mono} fontWeight="600">
                      cp.async (Ampere+)
                    </text>
                  )}
                  {/* __syncthreads barrier between SMEM and Reg */}
                  {i === 2 && (
                    <>
                      <line x1={bx + 40} y1={(tier.y + bh + MEMORY_TIERS[i + 1].y) / 2}
                        x2={bx + bw - 40} y2={(tier.y + bh + MEMORY_TIERS[i + 1].y) / 2}
                        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,3" strokeOpacity={0.4}
                      />
                      <text x={bx + bw / 2} y={(tier.y + bh + MEMORY_TIERS[i + 1].y) / 2 - 5}
                        textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
                        {t.barrier}
                      </text>
                    </>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Animated data tile */}
        <AnimatePresence mode="wait">
          {getTileY(stage) !== null && (
            <motion.g
              key={`tile-${stage}`}
              initial={{ opacity: 0, y: (getTileY(STAGES[Math.max(0, stageIdx - 1)]) ?? getTileY(stage)!) }}
              animate={{ opacity: 1, y: getTileY(stage)! }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <rect x={330} y={0} width={80} height={24} rx="4"
                fill={HEAD_COLORS[0]} fillOpacity={0.2}
                stroke={HEAD_COLORS[0]} strokeWidth="2"
              />
              <text x={370} y={16} textAnchor="middle" fontSize="10" fontWeight="700"
                fill={HEAD_COLORS[0]} fontFamily={FONTS.mono}>
                Tile[0]
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Second tile for double buffer stage */}
        {stage === 'double_buffer' && (
          <motion.g
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 260 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <rect x={170} y={6} width={80} height={24} rx="4"
              fill={HEAD_COLORS[1]} fillOpacity={0.2}
              stroke={HEAD_COLORS[1]} strokeWidth="2"
            />
            <text x={210} y={22} textAnchor="middle" fontSize="10" fontWeight="700"
              fill={HEAD_COLORS[1]} fontFamily={FONTS.mono}>
              Tile[1]
            </text>
          </motion.g>
        )}

        {/* Right column: Pipeline view */}
        {renderPipeline()}

        {/* Stage description */}
        <rect x={30} y={440} width={740} height={80} rx="6"
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1"
        />
        <text x={40} y={458} fontSize="10" fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.mono}>
          Stage {stageIdx + 1}/{STAGES.length}: {stage}
        </text>
        {/* Wrap description text */}
        {STAGE_DESCRIPTIONS[stage][locale].match(/.{1,80}/g)?.map((line, i) => (
          <text key={i} x={40} y={476 + i * 15} fontSize="10.5" fill={COLORS.dark}>
            {line}
          </text>
        ))}
      </svg>
    </div>
  );
}
