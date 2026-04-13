import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800;
const H = 520;

const MODELS = [
  { name: '7B',   paramsBillion: 7,   memoryFP16GB: 14,  layerCount: 32,  hiddenDim: 4096 },
  { name: '13B',  paramsBillion: 13,  memoryFP16GB: 26,  layerCount: 40,  hiddenDim: 5120 },
  { name: '70B',  paramsBillion: 70,  memoryFP16GB: 140, layerCount: 80,  hiddenDim: 8192 },
  { name: '175B', paramsBillion: 175, memoryFP16GB: 350, layerCount: 96,  hiddenDim: 12288 },
];

const GPU_COUNTS = [1, 2, 4, 8, 16];
const GPU_MEM = 80; // A100 80GB

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

export default function ParallelStrategyExplorer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '并行策略对比',
      model: '模型',
      gpus: 'GPU 数',
      memPerGpu: '单卡显存: 80 GB (A100)',
      dp: '数据并行 (DP)',
      tp: '张量并行 (TP)',
      pp: '流水线并行 (PP)',
      memory: '显存',
      comm: '通信',
      efficiency: '效率',
      oom: 'OOM!',
      ok: 'OK',
      gradientAllReduce: '梯度 AllReduce',
      activationAllReduce: '层内 AllReduce',
      p2p: '点对点传输',
      perGpu: '/卡',
      bubble: '气泡',
      overlapable: '可与计算重叠',
      nvlinkRequired: '需要 NVLink',
      hybridTitle: '实际部署示例',
      hybridNote: 'LLaMA 70B: TP=8 (节点内 NVLink) + PP=4 (跨节点) + DP=16 (数据并行)',
      microBatches: '微批次 M',
      stages: '阶段',
      nCopies: '份副本',
      layersPerStage: '层/阶段',
    },
    en: {
      title: 'Parallel Strategy Comparison',
      model: 'Model',
      gpus: 'GPUs',
      memPerGpu: 'Per GPU: 80 GB (A100)',
      dp: 'Data Parallel (DP)',
      tp: 'Tensor Parallel (TP)',
      pp: 'Pipeline Parallel (PP)',
      memory: 'Memory',
      comm: 'Comm',
      efficiency: 'Efficiency',
      oom: 'OOM!',
      ok: 'OK',
      gradientAllReduce: 'Gradient AllReduce',
      activationAllReduce: 'Intra-layer AllReduce',
      p2p: 'Point-to-point',
      perGpu: '/GPU',
      bubble: 'Bubble',
      overlapable: 'Overlappable with compute',
      nvlinkRequired: 'Requires NVLink',
      hybridTitle: 'Real-World Deployment',
      hybridNote: 'LLaMA 70B: TP=8 (intra-node NVLink) + PP=4 (inter-node) + DP=16 (data parallel)',
      microBatches: 'Micro-batches M',
      stages: 'stages',
      nCopies: 'copies',
      layersPerStage: 'layers/stage',
    },
  }[locale]!;

  const [modelIdx, setModelIdx] = useState(2); // default 70B
  const [gpuCount, setGpuCount] = useState(8);

  const model = MODELS[modelIdx];
  const N = gpuCount;

  // DP calculations
  const dpMemPerGpu = model.memoryFP16GB; // full model on each GPU
  const dpOom = dpMemPerGpu > GPU_MEM;
  const dpEfficiency = N === 1 ? 100 : 96; // ~95-100% when AllReduce overlapped
  const dpCommVolume = `2 * ${model.paramsBillion}B * 2B`; // ring allreduce ≈ 2x model size

  // TP calculations
  const tpMemPerGpu = model.memoryFP16GB / N;
  const tpOom = tpMemPerGpu > GPU_MEM;
  const tpEfficiency = N <= 8 ? (N === 1 ? 100 : 92) : 85; // degrades with more GPUs
  const tpCommPerLayer = `2 * B*S*${model.hiddenDim} * 2B`; // AllReduce per layer

  // PP calculations
  const ppMemPerGpu = model.memoryFP16GB / N;
  const ppOom = ppMemPerGpu > GPU_MEM;
  const M_microBatches = 8; // fixed for simplicity
  const ppEfficiency = N === 1 ? 100 : Math.max(0, Math.round(((M_microBatches - N + 1) / M_microBatches) * 100));
  const ppBubbleRatio = N === 1 ? 0 : Math.round(((N - 1) / M_microBatches) * 100);
  const layersPerStage = Math.ceil(model.layerCount / N);

  // Column definitions
  const COL_X = [60, 310, 560];
  const COL_W = 220;
  const BAR_Y = 195;
  const BAR_H = 20;
  const BAR_W = 180;

  const memBar = (memGB: number, oom: boolean, x: number) => {
    const ratio = clamp(memGB / GPU_MEM, 0, 1.5);
    const barLen = Math.min(ratio, 1) * BAR_W;
    return (
      <g>
        {/* Background bar */}
        <rect x={x} y={BAR_Y} width={BAR_W} height={BAR_H} rx={3}
          fill={COLORS.light} />
        {/* Filled bar */}
        <motion.rect
          x={x} y={BAR_Y} width={barLen} height={BAR_H} rx={3}
          fill={oom ? COLORS.red : COLORS.green}
          opacity={0.7}
          initial={{ width: 0 }}
          animate={{ width: barLen }}
          transition={{ duration: 0.5 }}
        />
        {/* Label */}
        <text x={x + BAR_W + 5} y={BAR_Y + 14} fontSize={9} fontFamily={FONTS.mono}
          fill={oom ? COLORS.red : COLORS.green} fontWeight="700">
          {Math.round(memGB)}GB {oom ? t.oom : t.ok}
        </text>
        {/* 80GB mark */}
        <line x1={x + BAR_W} y1={BAR_Y - 2} x2={x + BAR_W} y2={BAR_Y + BAR_H + 2}
          stroke={COLORS.dark} strokeWidth={1} strokeDasharray="3 2" opacity={0.4} />
        <text x={x + BAR_W} y={BAR_Y - 5} textAnchor="middle" fontSize={7}
          fill={COLORS.mid}>80GB</text>
      </g>
    );
  };

  return (
    <div className="my-6">
      {/* Config panel */}
      <div className="flex flex-wrap items-center gap-4 mb-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">{t.model}:</span>
          {MODELS.map((m, i) => (
            <button
              key={m.name}
              onClick={() => setModelIdx(i)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                modelIdx === i
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">{t.gpus}:</span>
          {GPU_COUNTS.map(g => (
            <button
              key={g}
              onClick={() => setGpuCount(g)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                gpuCount === g
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{t.memPerGpu}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize={14} fontWeight="700" fill={COLORS.dark}>
          {t.title}: {model.name} x {N} GPUs
        </text>

        {/* Three columns */}
        {[
          {
            label: t.dp, color: HEAD_COLORS[0],
            mem: dpMemPerGpu, oom: dpOom, eff: dpEfficiency,
            commLabel: t.gradientAllReduce,
            commDetail: dpCommVolume,
            commNote: t.overlapable,
            detail: `${N} ${t.nCopies}`,
          },
          {
            label: t.tp, color: HEAD_COLORS[1],
            mem: tpMemPerGpu, oom: tpOom, eff: tpEfficiency,
            commLabel: t.activationAllReduce,
            commDetail: tpCommPerLayer,
            commNote: t.nvlinkRequired,
            detail: `${model.hiddenDim}/${N} = ${Math.round(model.hiddenDim / N)} ${locale === 'zh' ? '每卡' : 'per GPU'}`,
          },
          {
            label: t.pp, color: HEAD_COLORS[2],
            mem: ppMemPerGpu, oom: ppOom, eff: ppEfficiency,
            commLabel: t.p2p,
            commDetail: `${N} ${t.stages}, M=${M_microBatches}`,
            commNote: `${t.bubble}: ${ppBubbleRatio}%`,
            detail: `${layersPerStage} ${t.layersPerStage}`,
          },
        ].map((col, ci) => {
          const cx = COL_X[ci];
          return (
            <g key={ci}>
              {/* Column header */}
              <rect x={cx} y={40} width={COL_W} height={30} rx={4}
                fill={col.color} opacity={0.12} />
              <text x={cx + COL_W / 2} y={60} textAnchor="middle" fontSize={12}
                fontWeight="700" fill={col.color}>
                {col.label}
              </text>

              {/* Strategy detail */}
              <text x={cx + COL_W / 2} y={85} textAnchor="middle" fontSize={10}
                fill={COLORS.dark}>
                {col.detail}
              </text>

              {/* GPU visualization: mini device boxes */}
              <g transform={`translate(${cx}, 95)`}>
                {Array.from({ length: Math.min(N, 8) }).map((_, gi) => {
                  const bx = (gi % 4) * 56;
                  const by = Math.floor(gi / 4) * 28;
                  const bw = 50;
                  const bh = 22;
                  return (
                    <g key={gi}>
                      <rect x={bx} y={by} width={bw} height={bh} rx={3}
                        fill={col.color} opacity={0.08}
                        stroke={col.color} strokeWidth={1} />
                      <text x={bx + bw / 2} y={by + 14} textAnchor="middle"
                        fontSize={8} fill={col.color} fontWeight="600">
                        GPU{gi}
                      </text>
                    </g>
                  );
                })}
                {N > 8 && (
                  <text x={0} y={70} fontSize={8} fill={COLORS.mid}>+{N - 8} more</text>
                )}
              </g>

              {/* Memory section */}
              <text x={cx} y={BAR_Y - 15} fontSize={10} fontWeight="600" fill={COLORS.dark}>
                {t.memory} {t.perGpu}:
              </text>
              {memBar(col.mem, col.oom, cx)}

              {/* Communication section */}
              <text x={cx} y={BAR_Y + 45} fontSize={10} fontWeight="600" fill={COLORS.dark}>
                {t.comm}:
              </text>
              <rect x={cx} y={BAR_Y + 52} width={COL_W} height={40} rx={3}
                fill={col.color} opacity={0.05}
                stroke={col.color} strokeWidth={0.5} />
              <text x={cx + 6} y={BAR_Y + 68} fontSize={9} fill={col.color} fontWeight="600">
                {col.commLabel}
              </text>
              <text x={cx + 6} y={BAR_Y + 82} fontSize={8} fontFamily={FONTS.mono} fill={COLORS.mid}>
                {col.commNote}
              </text>

              {/* Efficiency section */}
              <text x={cx} y={BAR_Y + 110} fontSize={10} fontWeight="600" fill={COLORS.dark}>
                {t.efficiency}:
              </text>
              <rect x={cx} y={BAR_Y + 116} width={BAR_W} height={14} rx={3} fill={COLORS.light} />
              <motion.rect
                x={cx} y={BAR_Y + 116}
                width={0}
                height={14} rx={3}
                fill={col.oom ? COLORS.mid : (col.eff >= 90 ? COLORS.green : (col.eff >= 70 ? COLORS.orange : COLORS.red))}
                opacity={col.oom ? 0.3 : 0.6}
                animate={{ width: col.oom ? 0 : (col.eff / 100) * BAR_W }}
                transition={{ duration: 0.5 }}
              />
              <text x={cx + BAR_W + 5} y={BAR_Y + 127} fontSize={9}
                fill={col.oom ? COLORS.red : COLORS.dark} fontWeight="600">
                {col.oom ? '—' : `~${col.eff}%`}
              </text>
            </g>
          );
        })}

        {/* Hybrid strategy callout at bottom */}
        <rect x={40} y={H - 60} width={W - 80} height={48} rx={6}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={W / 2} y={H - 38} textAnchor="middle" fontSize={11}
          fontWeight="700" fill={COLORS.orange}>
          {t.hybridTitle}
        </text>
        <text x={W / 2} y={H - 22} textAnchor="middle" fontSize={10} fill={COLORS.dark}>
          {t.hybridNote}
        </text>
      </svg>
    </div>
  );
}
