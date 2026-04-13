import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface KernelBlock {
  id: string;
  name: string;
  type: 'matmul' | 'elementwise' | 'reduction' | 'norm' | 'activation';
  durationMs: number;
  dependencies: string[];
}

interface ScheduledBlock {
  kernelId: string;
  startMs: number;
  endMs: number;
}

interface ScheduleResult {
  mode: 'serial' | 'multistream' | 'cudagraph';
  streams: { streamId: number; blocks: ScheduledBlock[] }[];
  totalTimeMs: number;
  launchOverheadMs: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Constants ─── */

const W = 800;
const H = 500;
const LAUNCH_OVERHEAD = 0.015; // 15μs per kernel launch
const GRAPH_LAUNCH_OVERHEAD = 0.015; // single graph launch
const STREAM_COUNT = 3;

const KERNEL_COLORS: Record<KernelBlock['type'], string> = {
  matmul: COLORS.primary,
  elementwise: COLORS.green,
  reduction: COLORS.orange,
  norm: COLORS.purple,
  activation: HEAD_COLORS[5],
};

/* ─── Workloads ─── */

const WORKLOADS: Record<string, { label: { zh: string; en: string }; kernels: KernelBlock[] }> = {
  attention: {
    label: { zh: 'Attention Block', en: 'Attention Block' },
    kernels: [
      { id: 'K1', name: 'QKV Proj', type: 'matmul', durationMs: 0.42, dependencies: [] },
      { id: 'K2', name: 'Attn Score', type: 'matmul', durationMs: 0.35, dependencies: ['K1'] },
      { id: 'K3', name: 'Softmax', type: 'reduction', durationMs: 0.12, dependencies: ['K2'] },
      { id: 'K4', name: 'Attn×V', type: 'matmul', durationMs: 0.30, dependencies: ['K3'] },
      { id: 'K5', name: 'Out Proj', type: 'matmul', durationMs: 0.38, dependencies: ['K4'] },
      { id: 'K6', name: 'LayerNorm', type: 'norm', durationMs: 0.08, dependencies: ['K5'] },
    ],
  },
  ffn: {
    label: { zh: 'FFN Block', en: 'FFN Block' },
    kernels: [
      { id: 'K1', name: 'FFN Up', type: 'matmul', durationMs: 0.45, dependencies: [] },
      { id: 'K2', name: 'GeLU', type: 'activation', durationMs: 0.06, dependencies: ['K1'] },
      { id: 'K3', name: 'FFN Gate', type: 'matmul', durationMs: 0.45, dependencies: [] },
      { id: 'K4', name: 'Mul', type: 'elementwise', durationMs: 0.04, dependencies: ['K2', 'K3'] },
      { id: 'K5', name: 'FFN Down', type: 'matmul', durationMs: 0.42, dependencies: ['K4'] },
      { id: 'K6', name: 'LayerNorm', type: 'norm', durationMs: 0.08, dependencies: ['K5'] },
    ],
  },
  full: {
    label: { zh: 'Full Transformer Layer', en: 'Full Transformer Layer' },
    kernels: [
      { id: 'K1', name: 'QKV Proj', type: 'matmul', durationMs: 0.42, dependencies: [] },
      { id: 'K2', name: 'Attention', type: 'matmul', durationMs: 0.50, dependencies: ['K1'] },
      { id: 'K3', name: 'Out Proj', type: 'matmul', durationMs: 0.38, dependencies: ['K2'] },
      { id: 'K4', name: 'LN + Res', type: 'norm', durationMs: 0.10, dependencies: ['K3'] },
      { id: 'K5', name: 'FFN Up+Gate', type: 'matmul', durationMs: 0.48, dependencies: ['K4'] },
      { id: 'K6', name: 'FFN Down', type: 'matmul', durationMs: 0.42, dependencies: ['K5'] },
    ],
  },
};

/* ─── Scheduling Logic ─── */

function scheduleSerial(kernels: KernelBlock[]): ScheduleResult {
  const blocks: ScheduledBlock[] = [];
  let t = 0;
  for (const k of kernels) {
    t += LAUNCH_OVERHEAD;
    const start = t;
    t += k.durationMs;
    blocks.push({ kernelId: k.id, startMs: start, endMs: t });
  }
  return {
    mode: 'serial',
    streams: [{ streamId: 0, blocks }],
    totalTimeMs: t,
    launchOverheadMs: kernels.length * LAUNCH_OVERHEAD,
  };
}

function scheduleMultiStream(kernels: KernelBlock[]): ScheduleResult {
  const kernelMap = new Map(kernels.map(k => [k.id, k]));
  const streamEnd = new Array(STREAM_COUNT).fill(0);
  const kernelEnd = new Map<string, number>();
  const streamBlocks: ScheduledBlock[][] = Array.from({ length: STREAM_COUNT }, () => []);

  // Topological sort with greedy list scheduling
  const inDeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const k of kernels) {
    inDeg.set(k.id, k.dependencies.length);
    for (const d of k.dependencies) {
      if (!adj.has(d)) adj.set(d, []);
      adj.get(d)!.push(k.id);
    }
  }

  const ready = kernels.filter(k => k.dependencies.length === 0).map(k => k.id);
  const scheduled = new Set<string>();

  while (ready.length > 0) {
    const kid = ready.shift()!;
    if (scheduled.has(kid)) continue;
    scheduled.add(kid);
    const kernel = kernelMap.get(kid)!;

    // Earliest start: after all dependencies finish
    const depEnd = kernel.dependencies.length > 0
      ? Math.max(...kernel.dependencies.map(d => kernelEnd.get(d) ?? 0))
      : 0;

    // Pick stream with earliest available time (but not before deps)
    let bestStream = 0;
    let bestStart = Infinity;
    for (let s = 0; s < STREAM_COUNT; s++) {
      const start = Math.max(streamEnd[s], depEnd) + LAUNCH_OVERHEAD;
      if (start < bestStart) {
        bestStart = start;
        bestStream = s;
      }
    }

    const end = bestStart + kernel.durationMs;
    streamEnd[bestStream] = end;
    kernelEnd.set(kid, end);
    streamBlocks[bestStream].push({ kernelId: kid, startMs: bestStart, endMs: end });

    // Update ready list
    for (const next of (adj.get(kid) ?? [])) {
      const newDeg = (inDeg.get(next) ?? 1) - 1;
      inDeg.set(next, newDeg);
      if (newDeg === 0) ready.push(next);
    }
  }

  const totalTime = Math.max(...streamEnd);
  return {
    mode: 'multistream',
    streams: streamBlocks.map((blocks, i) => ({ streamId: i, blocks })),
    totalTimeMs: totalTime,
    launchOverheadMs: kernels.length * LAUNCH_OVERHEAD,
  };
}

function scheduleCudaGraph(kernels: KernelBlock[]): ScheduleResult {
  // CUDA Graph: same parallelism as multi-stream but single launch overhead
  const ms = scheduleMultiStream(kernels);
  // Recompute with reduced overhead (single launch)
  const overhead = GRAPH_LAUNCH_OVERHEAD;
  // Shift all blocks to start from the single launch overhead
  const minStart = Math.min(...ms.streams.flatMap(s => s.blocks.map(b => b.startMs)));
  const shift = overhead - minStart;
  const streams = ms.streams.map(s => ({
    streamId: s.streamId,
    blocks: s.blocks.map(b => ({
      kernelId: b.kernelId,
      startMs: b.startMs + shift,
      endMs: b.endMs + shift,
    })),
  }));
  const totalTime = Math.max(...streams.flatMap(s => s.blocks.map(b => b.endMs)));
  return {
    mode: 'cudagraph',
    streams,
    totalTimeMs: totalTime,
    launchOverheadMs: overhead,
  };
}

/* ─── Component ─── */

export default function KernelSchedulerDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      serial: '串行执行',
      multistream: '多 Stream 并行',
      cudagraph: 'CUDA Graph',
      totalTime: '总时间',
      launchOverhead: '启动开销',
      workload: '工作负载',
      kernels: '个 Kernel',
      stream: 'Stream',
      graphLaunch: 'Graph 一次启动',
      overheadNote: '启动开销: 1× (vs 6× 串行)',
      hopperNote: 'Pre-Hopper: 固定结构; Hopper+ (CC 9.0): 条件节点 (IF/WHILE/SWITCH)',
      speedup: '加速比',
      vs: '相比串行',
      legend: '图例',
      matmul: 'MatMul',
      elementwise: '逐元素',
      reduction: '归约',
      norm: '归一化',
      activation: '激活',
      overhead: '启动开销',
    },
    en: {
      serial: 'Serial',
      multistream: 'Multi-Stream',
      cudagraph: 'CUDA Graph',
      totalTime: 'Total Time',
      launchOverhead: 'Launch Overhead',
      workload: 'Workload',
      kernels: 'Kernels',
      stream: 'Stream',
      graphLaunch: 'Single Graph Launch',
      overheadNote: 'Launch overhead: 1× (vs 6× serial)',
      hopperNote: 'Pre-Hopper: fixed structure; Hopper+ (CC 9.0): conditional nodes (IF/WHILE/SWITCH)',
      speedup: 'Speedup',
      vs: 'vs Serial',
      legend: 'Legend',
      matmul: 'MatMul',
      elementwise: 'Element-wise',
      reduction: 'Reduction',
      norm: 'Norm',
      activation: 'Activation',
      overhead: 'Launch Overhead',
    },
  }[locale]!;

  const [mode, setMode] = useState<'serial' | 'multistream' | 'cudagraph'>('serial');
  const [workloadKey, setWorkloadKey] = useState('attention');
  const [hoveredKernel, setHoveredKernel] = useState<string | null>(null);

  const workload = WORKLOADS[workloadKey];
  const kernels = workload.kernels;

  const serialResult = useMemo(() => scheduleSerial(kernels), [kernels]);
  const multiResult = useMemo(() => scheduleMultiStream(kernels), [kernels]);
  const graphResult = useMemo(() => scheduleCudaGraph(kernels), [kernels]);

  const result = mode === 'serial' ? serialResult : mode === 'multistream' ? multiResult : graphResult;
  const maxTime = serialResult.totalTimeMs; // normalize to serial for comparison

  // Layout
  const marginLeft = 110;
  const marginRight = 30;
  const timelineTop = 150;
  const timelineH = 240;
  const barW = W - marginLeft - marginRight;

  const streamCount = result.streams.filter(s => s.blocks.length > 0).length;
  const streamH = Math.min(50, timelineH / Math.max(streamCount, 1) - 10);
  const streamGap = 8;

  const timeScale = (ms: number) => (ms / maxTime) * barW;

  const kernelMap = new Map(kernels.map(k => [k.id, k]));

  const speedup = serialResult.totalTimeMs / result.totalTimeMs;

  return (
    <div className="my-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Mode selector */}
        {(['serial', 'multistream', 'cudagraph'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              background: mode === m ? COLORS.primary : COLORS.bgAlt,
              color: mode === m ? '#fff' : COLORS.dark,
              border: `1px solid ${mode === m ? COLORS.primary : COLORS.light}`,
            }}
          >
            {t[m]}
          </button>
        ))}
        <span className="mx-2 self-center text-gray-300">|</span>
        {/* Workload selector */}
        {Object.entries(WORKLOADS).map(([key, wl]) => (
          <button
            key={key}
            onClick={() => setWorkloadKey(key)}
            className="px-3 py-1.5 rounded text-sm transition-colors"
            style={{
              background: workloadKey === key ? COLORS.green : COLORS.bgAlt,
              color: workloadKey === key ? '#fff' : COLORS.dark,
              border: `1px solid ${workloadKey === key ? COLORS.green : COLORS.light}`,
            }}
          >
            {wl.label[locale]}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Background */}
        <rect width={W} height={H} fill={COLORS.bg} rx="8" />

        {/* Metrics bar */}
        <rect x="10" y="10" width={W - 20} height="52" fill={COLORS.bgAlt} rx="6" />
        <text x="25" y="32" fontSize="13" fill={COLORS.dark} fontWeight="600">
          {t.totalTime}: {result.totalTimeMs.toFixed(3)} ms
        </text>
        <text x="25" y="48" fontSize="11" fill={COLORS.mid}>
          {t.launchOverhead}: {result.launchOverheadMs.toFixed(3)} ms ({kernels.length} {t.kernels})
        </text>
        {mode !== 'serial' && (
          <text x={W - 200} y="38" fontSize="14" fill={COLORS.green} fontWeight="700">
            {t.speedup}: {speedup.toFixed(2)}× {t.vs}
          </text>
        )}

        {/* Legend */}
        <g transform={`translate(${marginLeft}, 75)`}>
          <text x="0" y="0" fontSize="11" fill={COLORS.mid} fontWeight="600">{t.legend}:</text>
          {([
            ['matmul', t.matmul, KERNEL_COLORS.matmul],
            ['elementwise', t.elementwise, KERNEL_COLORS.elementwise],
            ['reduction', t.reduction, KERNEL_COLORS.reduction],
            ['norm', t.norm, KERNEL_COLORS.norm],
            ['activation', t.activation, KERNEL_COLORS.activation],
            ['overhead', t.overhead, COLORS.waste],
          ] as [string, string, string][]).map(([, label, color], i) => (
            <g key={label} transform={`translate(${i * 105 + 55}, -10)`}>
              <rect width="12" height="12" fill={color} rx="2" />
              <text x="16" y="10" fontSize="10" fill={COLORS.mid}>{label}</text>
            </g>
          ))}
        </g>

        {/* Timeline area */}
        <g transform={`translate(${marginLeft}, ${timelineTop})`}>
          {/* Time axis */}
          <line x1="0" y1="-10" x2={barW} y2="-10" stroke={COLORS.light} strokeWidth="1" />
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const x = frac * barW;
            const ms = frac * maxTime;
            return (
              <g key={frac}>
                <line x1={x} y1="-14" x2={x} y2="-6" stroke={COLORS.mid} strokeWidth="1" />
                <text x={x} y="-18" fontSize="9" fill={COLORS.mid} textAnchor="middle">
                  {ms.toFixed(2)} ms
                </text>
              </g>
            );
          })}

          {/* CUDA Graph enclosure */}
          {mode === 'cudagraph' && (
            <g>
              <rect
                x={-5}
                y={-5}
                width={timeScale(result.totalTimeMs) + 10}
                height={streamCount * (streamH + streamGap) + 10}
                fill="none"
                stroke={COLORS.primary}
                strokeWidth="2"
                strokeDasharray="6,3"
                rx="6"
              />
              <text
                x={timeScale(result.totalTimeMs) / 2}
                y={streamCount * (streamH + streamGap) + 22}
                fontSize="10"
                fill={COLORS.primary}
                textAnchor="middle"
                fontWeight="600"
              >
                {t.graphLaunch} — {t.overheadNote}
              </text>
              <text
                x={timeScale(result.totalTimeMs) / 2}
                y={streamCount * (streamH + streamGap) + 36}
                fontSize="9"
                fill={COLORS.mid}
                textAnchor="middle"
                fontStyle="italic"
              >
                {t.hopperNote}
              </text>
            </g>
          )}

          {/* Streams */}
          {result.streams.map((stream, si) => {
            if (stream.blocks.length === 0) return null;
            const y = si * (streamH + streamGap);

            return (
              <g key={si}>
                {/* Stream label */}
                <text
                  x={-10}
                  y={y + streamH / 2 + 4}
                  fontSize="11"
                  fill={COLORS.dark}
                  textAnchor="end"
                  fontWeight="500"
                >
                  {t.stream} {stream.streamId}
                </text>

                {/* Stream track background */}
                <rect
                  x={0}
                  y={y}
                  width={barW}
                  height={streamH}
                  fill={COLORS.bgAlt}
                  rx="3"
                />

                {/* Kernel blocks */}
                <AnimatePresence mode="wait">
                  {stream.blocks.map(block => {
                    const kernel = kernelMap.get(block.kernelId)!;
                    const x = timeScale(block.startMs);
                    const w = timeScale(block.endMs - block.startMs);
                    const isHovered = hoveredKernel === block.kernelId;

                    // Launch overhead gap (before the kernel)
                    const overheadX = Math.max(0, x - timeScale(LAUNCH_OVERHEAD));
                    const overheadW = mode === 'cudagraph' ? 0 : timeScale(LAUNCH_OVERHEAD);

                    return (
                      <g key={`${mode}-${block.kernelId}`}>
                        {/* Launch overhead */}
                        {overheadW > 0.5 && (
                          <rect
                            x={overheadX}
                            y={y + 2}
                            width={overheadW}
                            height={streamH - 4}
                            fill={COLORS.waste}
                            rx="2"
                            opacity={0.6}
                          />
                        )}
                        {/* Kernel block */}
                        <motion.rect
                          x={x}
                          y={y + 2}
                          width={Math.max(w, 2)}
                          height={streamH - 4}
                          fill={KERNEL_COLORS[kernel.type]}
                          rx="3"
                          opacity={isHovered ? 1 : 0.85}
                          stroke={isHovered ? COLORS.dark : 'none'}
                          strokeWidth={isHovered ? 1.5 : 0}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, delay: si * 0.05 }}
                          style={{ originX: `${x}px` }}
                          onMouseEnter={() => setHoveredKernel(block.kernelId)}
                          onMouseLeave={() => setHoveredKernel(null)}
                        />
                        {/* Kernel label */}
                        {w > 25 && (
                          <text
                            x={x + w / 2}
                            y={y + streamH / 2 + 4}
                            fontSize="9"
                            fill="#fff"
                            textAnchor="middle"
                            fontWeight="600"
                            pointerEvents="none"
                          >
                            {kernel.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </AnimatePresence>
              </g>
            );
          })}

          {/* Dependency arrows for multi-stream */}
          {mode === 'multistream' && (() => {
            const arrows: React.ReactNode[] = [];
            for (const stream of result.streams) {
              for (const block of stream.blocks) {
                const kernel = kernelMap.get(block.kernelId)!;
                for (const depId of kernel.dependencies) {
                  // Find which stream has the dependency
                  for (const srcStream of result.streams) {
                    const srcBlock = srcStream.blocks.find(b => b.kernelId === depId);
                    if (srcBlock && srcStream.streamId !== stream.streamId) {
                      const x1 = timeScale(srcBlock.endMs);
                      const y1 = srcStream.streamId * (streamH + streamGap) + streamH / 2;
                      const x2 = timeScale(block.startMs);
                      const y2 = stream.streamId * (streamH + streamGap) + streamH / 2;
                      arrows.push(
                        <line
                          key={`dep-${depId}-${block.kernelId}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={COLORS.red}
                          strokeWidth="1"
                          strokeDasharray="4,2"
                          markerEnd="url(#arrowhead)"
                          opacity={0.6}
                        />
                      );
                    }
                  }
                }
              }
            }
            return arrows;
          })()}

          {/* End time marker */}
          <line
            x1={timeScale(result.totalTimeMs)}
            y1={-5}
            x2={timeScale(result.totalTimeMs)}
            y2={streamCount * (streamH + streamGap)}
            stroke={COLORS.green}
            strokeWidth="2"
            strokeDasharray="4,2"
          />
        </g>

        {/* Tooltip */}
        {hoveredKernel && (() => {
          const kernel = kernelMap.get(hoveredKernel)!;
          const block = result.streams.flatMap(s => s.blocks).find(b => b.kernelId === hoveredKernel);
          if (!block) return null;
          const tx = Math.min(timeScale(block.startMs) + marginLeft, W - 180);
          const ty = timelineTop + streamCount * (streamH + streamGap) + 50;
          return (
            <g>
              <rect x={tx} y={ty} width="170" height="55" fill={COLORS.dark} rx="4" opacity="0.92" />
              <text x={tx + 8} y={ty + 16} fontSize="11" fill="#fff" fontWeight="600">
                {kernel.id}: {kernel.name}
              </text>
              <text x={tx + 8} y={ty + 32} fontSize="10" fill={COLORS.light}>
                {locale === 'zh' ? '类型' : 'Type'}: {kernel.type} | {kernel.durationMs.toFixed(3)} ms
              </text>
              <text x={tx + 8} y={ty + 46} fontSize="10" fill={COLORS.light}>
                {locale === 'zh' ? '依赖' : 'Deps'}: {kernel.dependencies.length > 0 ? kernel.dependencies.join(', ') : 'none'}
              </text>
            </g>
          );
        })()}

        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.red} opacity="0.6" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
