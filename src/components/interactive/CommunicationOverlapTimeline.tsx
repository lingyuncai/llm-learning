import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

interface TimelineBlock {
  id: string;
  type: 'compute' | 'communication';
  layer: number;
  startTime: number;
  duration: number;
  stream: number;
}

interface OverlapConfig {
  layerCount: number;
  computeTimePerLayer: number;
  commTimePerLayer: number;
  strategy: 'serial' | 'overlap' | 'fusion' | 'bucket';
}

const W = 800;
const H = 440;

const COMPUTE_BASE = 10; // ms per layer

function buildTimeline(config: OverlapConfig): TimelineBlock[] {
  const { layerCount, computeTimePerLayer, commTimePerLayer, strategy } = config;
  const blocks: TimelineBlock[] = [];
  let blockId = 0;

  if (strategy === 'serial') {
    let time = 0;
    for (let i = 0; i < layerCount; i++) {
      blocks.push({
        id: `c${blockId++}`, type: 'compute', layer: i,
        startTime: time, duration: computeTimePerLayer, stream: 0,
      });
      time += computeTimePerLayer;
      blocks.push({
        id: `c${blockId++}`, type: 'communication', layer: i,
        startTime: time, duration: commTimePerLayer, stream: 0,
      });
      time += commTimePerLayer;
    }
  } else if (strategy === 'overlap') {
    // Compute on stream 0, comm on stream 1, overlapped
    let computeTime = 0;
    let commTime = 0;
    for (let i = 0; i < layerCount; i++) {
      blocks.push({
        id: `c${blockId++}`, type: 'compute', layer: i,
        startTime: computeTime, duration: computeTimePerLayer, stream: 0,
      });
      // Communication starts after compute finishes for this layer
      // but can overlap with next layer's compute
      const commStart = computeTime + computeTimePerLayer;
      blocks.push({
        id: `c${blockId++}`, type: 'communication', layer: i,
        startTime: Math.max(commStart, commTime), duration: commTimePerLayer, stream: 1,
      });
      commTime = Math.max(commStart, commTime) + commTimePerLayer;
      computeTime += computeTimePerLayer;
    }
  } else if (strategy === 'fusion') {
    // Fuse every 2 layers' communication together, reducing overhead
    let computeTime = 0;
    let commTime = 0;
    const fusionGroup = 2;
    for (let i = 0; i < layerCount; i++) {
      blocks.push({
        id: `c${blockId++}`, type: 'compute', layer: i,
        startTime: computeTime, duration: computeTimePerLayer, stream: 0,
      });
      computeTime += computeTimePerLayer;
      // Only emit fused comm every fusionGroup layers
      if ((i + 1) % fusionGroup === 0 || i === layerCount - 1) {
        const numFused = (i + 1) % fusionGroup === 0 ? fusionGroup : ((i + 1) % fusionGroup);
        const fusedDuration = commTimePerLayer * numFused * 0.7; // 30% reduction from fusion
        const commStart = computeTime;
        blocks.push({
          id: `c${blockId++}`, type: 'communication', layer: i,
          startTime: Math.max(commStart, commTime), duration: fusedDuration, stream: 1,
        });
        commTime = Math.max(commStart, commTime) + fusedDuration;
      }
    }
  } else if (strategy === 'bucket') {
    // Bucket AllReduce: split gradients into buckets, start comm as soon as a bucket is ready
    let computeTime = 0;
    let commTime = 0;
    const bucketSize = 2; // layers per bucket
    for (let i = 0; i < layerCount; i++) {
      blocks.push({
        id: `c${blockId++}`, type: 'compute', layer: i,
        startTime: computeTime, duration: computeTimePerLayer, stream: 0,
      });
      computeTime += computeTimePerLayer;
      // Start bucket comm as soon as bucket is full, with overlap
      if ((i + 1) % bucketSize === 0 || i === layerCount - 1) {
        const bucketCommTime = commTimePerLayer * bucketSize;
        const commStart = computeTime;
        blocks.push({
          id: `c${blockId++}`, type: 'communication', layer: i,
          startTime: Math.max(commStart, commTime), duration: bucketCommTime, stream: 1,
        });
        commTime = Math.max(commStart, commTime) + bucketCommTime;
      }
    }
  }

  return blocks;
}

function totalTime(blocks: TimelineBlock[]): number {
  return Math.max(...blocks.map(b => b.startTime + b.duration), 0);
}

export default function CommunicationOverlapTimeline({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '通信-计算重叠',
      layerCount: '层数',
      commRatio: '通信/计算比',
      strategy: '策略',
      serial: '串行',
      overlap: '计算-通信重叠',
      fusion: 'AllReduce 融合',
      bucket: 'Bucket AllReduce',
      serialExec: '串行执行',
      overlapExec: '优化后执行',
      computeStream: '计算流',
      commStream: '通信流',
      metrics: '性能指标',
      serialTime: '串行',
      overlapTime: '优化后',
      speedup: '加速',
      compute: '计算',
      comm: '通信',
      layer: '层',
      ms: 'ms',
      fused: '融合',
      bucketLabel: '桶',
    },
    en: {
      title: 'Communication-Computation Overlap',
      layerCount: 'Layers',
      commRatio: 'Comm/Compute Ratio',
      strategy: 'Strategy',
      serial: 'Serial',
      overlap: 'Compute-Comm Overlap',
      fusion: 'AllReduce Fusion',
      bucket: 'Bucket AllReduce',
      serialExec: 'Serial Execution',
      overlapExec: 'Optimized Execution',
      computeStream: 'Compute Stream',
      commStream: 'Comm Stream',
      metrics: 'Metrics',
      serialTime: 'Serial',
      overlapTime: 'Optimized',
      speedup: 'Speedup',
      compute: 'Compute',
      comm: 'Comm',
      layer: 'Layer',
      ms: 'ms',
      fused: 'Fused',
      bucketLabel: 'Bucket',
    },
  }[locale]!;

  const [layerCount, setLayerCount] = useState(6);
  const [commRatioIdx, setCommRatioIdx] = useState(1); // index into [0.1, 0.25, 0.5]
  const [strategy, setStrategy] = useState<'overlap' | 'fusion' | 'bucket'>('overlap');

  const commRatios = [0.1, 0.25, 0.5];
  const commRatio = commRatios[commRatioIdx];
  const commTime = COMPUTE_BASE * commRatio;

  const serialConfig: OverlapConfig = {
    layerCount, computeTimePerLayer: COMPUTE_BASE,
    commTimePerLayer: commTime, strategy: 'serial',
  };
  const optimizedConfig: OverlapConfig = {
    layerCount, computeTimePerLayer: COMPUTE_BASE,
    commTimePerLayer: commTime, strategy,
  };

  const serialBlocks = useMemo(() => buildTimeline(serialConfig), [layerCount, commTime]);
  const optimizedBlocks = useMemo(() => buildTimeline(optimizedConfig), [layerCount, commTime, strategy]);

  const serialTotal = totalTime(serialBlocks);
  const optimizedTotal = totalTime(optimizedBlocks);
  const speedup = serialTotal > 0 ? ((serialTotal - optimizedTotal) / serialTotal * 100) : 0;

  // Timeline rendering
  const TIMELINE_LEFT = 120;
  const TIMELINE_W = 640;
  const maxTime = Math.max(serialTotal, optimizedTotal, 1);
  const timeScale = TIMELINE_W / maxTime;

  const renderTimeline = (blocks: TimelineBlock[], yBase: number, label: string, showStreams: boolean) => {
    const streamLabels = showStreams
      ? [t.computeStream, t.commStream]
      : [label];
    const ROW_H = 28;
    const GAP = 4;

    // Group by stream
    const streams = showStreams ? [0, 1] : [0];

    return (
      <g>
        {/* Section label */}
        <text x={10} y={yBase + (showStreams ? 20 : 15)} fontSize={10} fontWeight="700" fill={COLORS.dark}>
          {label}
        </text>
        {streams.map((stream, si) => {
          const rowY = yBase + si * (ROW_H + GAP);
          const streamBlocks = showStreams
            ? blocks.filter(b => b.stream === stream)
            : blocks;

          return (
            <g key={si}>
              {/* Stream label */}
              {showStreams && (
                <text x={TIMELINE_LEFT - 5} y={rowY + ROW_H / 2 + 4}
                  textAnchor="end" fontSize={8} fill={COLORS.mid}>
                  {streamLabels[si]}
                </text>
              )}

              {/* Background track */}
              <rect x={TIMELINE_LEFT} y={rowY} width={TIMELINE_W} height={ROW_H}
                rx={3} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={0.5} />

              {/* Blocks */}
              {streamBlocks.map((block, bi) => {
                const bx = TIMELINE_LEFT + block.startTime * timeScale;
                const bw = Math.max(block.duration * timeScale, 2);
                const isCompute = block.type === 'compute';
                const color = isCompute
                  ? HEAD_COLORS[block.layer % HEAD_COLORS.length]
                  : COLORS.orange;

                return (
                  <motion.g key={block.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: bi * 0.02 }}
                  >
                    <rect
                      x={bx} y={rowY + 2}
                      width={bw} height={ROW_H - 4}
                      rx={2}
                      fill={color}
                      opacity={isCompute ? 0.7 : 0.5}
                      stroke={color}
                      strokeWidth={0.5}
                    />
                    {/* Label inside block if wide enough */}
                    {bw > 22 && (
                      <text
                        x={bx + bw / 2} y={rowY + ROW_H / 2 + 3}
                        textAnchor="middle"
                        fontSize={7}
                        fontFamily={FONTS.mono}
                        fill="#fff"
                        fontWeight="600"
                      >
                        {isCompute ? `L${block.layer}` : `AR${block.layer}`}
                      </text>
                    )}
                  </motion.g>
                );
              })}
            </g>
          );
        })}

        {/* Time axis end marker */}
        {showStreams && (
          <g>
            {(() => {
              const endX = TIMELINE_LEFT + totalTime(blocks) * timeScale;
              return (
                <>
                  <line x1={endX} y1={yBase - 2} x2={endX} y2={yBase + streams.length * (ROW_H + GAP)}
                    stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="4 2" />
                  <text x={endX + 3} y={yBase - 4} fontSize={8} fill={COLORS.red} fontWeight="600">
                    {Math.round(totalTime(blocks))} {t.ms}
                  </text>
                </>
              );
            })()}
          </g>
        )}
        {!showStreams && (
          <g>
            {(() => {
              const endX = TIMELINE_LEFT + totalTime(blocks) * timeScale;
              return (
                <>
                  <line x1={endX} y1={yBase - 2} x2={endX} y2={yBase + ROW_H + 2}
                    stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="4 2" />
                  <text x={endX + 3} y={yBase - 4} fontSize={8} fill={COLORS.red} fontWeight="600">
                    {Math.round(totalTime(blocks))} {t.ms}
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="my-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4 justify-center">
        {/* Layer count */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">{t.layerCount}:</span>
          {[4, 6, 8].map(v => (
            <button key={v} onClick={() => setLayerCount(v)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                layerCount === v
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}>
              {v}
            </button>
          ))}
        </div>

        {/* Comm ratio */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">{t.commRatio}:</span>
          {commRatios.map((r, i) => (
            <button key={r} onClick={() => setCommRatioIdx(i)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                commRatioIdx === i
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
              }`}>
              {Math.round(r * 100)}%
            </button>
          ))}
        </div>

        {/* Strategy tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">{t.strategy}:</span>
          {([
            { key: 'overlap' as const, label: t.overlap },
            { key: 'fusion' as const, label: t.fusion },
            { key: 'bucket' as const, label: t.bucket },
          ]).map(s => (
            <button key={s.key} onClick={() => setStrategy(s.key)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                strategy === s.key
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize={13} fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {layerCount} {t.layer} | {t.compute}: {COMPUTE_BASE}{t.ms}/{t.layer} | {t.comm}: {commTime.toFixed(1)}{t.ms}/{t.layer}
        </text>

        {/* Serial timeline */}
        {renderTimeline(serialBlocks, 60, t.serialExec, false)}

        {/* Optimized timeline */}
        {renderTimeline(optimizedBlocks, 130, t.overlapExec, true)}

        {/* Legend */}
        <g transform="translate(120, 220)">
          <rect x={0} y={0} width={12} height={12} rx={2} fill={HEAD_COLORS[0]} opacity={0.7} />
          <text x={16} y={10} fontSize={9} fill={COLORS.dark}>{t.compute}</text>
          <rect x={80} y={0} width={12} height={12} rx={2} fill={COLORS.orange} opacity={0.5} />
          <text x={96} y={10} fontSize={9} fill={COLORS.dark}>{t.comm}</text>
        </g>

        {/* Metrics box */}
        <rect x={120} y={250} width={TIMELINE_W} height={70} rx={6}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={W / 2} y={270} textAnchor="middle" fontSize={11} fontWeight="700" fill={COLORS.dark}>
          {t.metrics}
        </text>

        {/* Serial bar */}
        <text x={140} y={290} fontSize={9} fill={COLORS.mid}>{t.serialTime}:</text>
        <rect x={220} y={280} width={Math.min(serialTotal / maxTime * 300, 300)} height={14} rx={3}
          fill={COLORS.red} opacity={0.3} />
        <text x={220 + Math.min(serialTotal / maxTime * 300, 300) + 5} y={291} fontSize={9}
          fontFamily={FONTS.mono} fill={COLORS.dark} fontWeight="600">
          {Math.round(serialTotal)} {t.ms}
        </text>

        {/* Optimized bar */}
        <text x={140} y={308} fontSize={9} fill={COLORS.mid}>{t.overlapTime}:</text>
        <motion.rect
          x={220} y={298}
          width={0} height={14} rx={3}
          fill={COLORS.green} opacity={0.5}
          animate={{ width: Math.min(optimizedTotal / maxTime * 300, 300) }}
          transition={{ duration: 0.5 }}
        />
        <text x={220 + Math.min(optimizedTotal / maxTime * 300, 300) + 5} y={309} fontSize={9}
          fontFamily={FONTS.mono} fill={COLORS.dark} fontWeight="600">
          {Math.round(optimizedTotal)} {t.ms}
        </text>

        {/* Speedup */}
        <text x={620} y={295} fontSize={10} fill={COLORS.mid}>{t.speedup}:</text>
        <text x={670} y={295} fontSize={14} fontWeight="700"
          fill={speedup > 0 ? COLORS.green : COLORS.mid}>
          {speedup > 0 ? `${speedup.toFixed(1)}%` : '0%'}
        </text>

        {/* Strategy explanation box */}
        <rect x={120} y={335} width={TIMELINE_W} height={90} rx={6}
          fill={strategy === 'overlap' ? '#e3f2fd' : strategy === 'fusion' ? '#f3e5f5' : '#fff3e0'}
          stroke={strategy === 'overlap' ? COLORS.primary : strategy === 'fusion' ? COLORS.purple : COLORS.orange}
          strokeWidth={1} opacity={0.6} />

        {strategy === 'overlap' && (
          <g>
            <text x={140} y={358} fontSize={10} fontWeight="700" fill={COLORS.primary}>
              {t.overlap}
            </text>
            <text x={140} y={374} fontSize={9} fill={COLORS.dark}>
              {locale === 'zh'
                ? '使用独立 CUDA stream 并行执行通信和下一层的计算。'
                : 'Use a separate CUDA stream to run communication in parallel with next layer compute.'}
            </text>
            <text x={140} y={390} fontSize={9} fill={COLORS.dark}>
              {locale === 'zh'
                ? '理想情况下通信完全被计算掩盖 (当 comm_time < compute_time)。'
                : 'Ideally communication is fully hidden when comm_time < compute_time.'}
            </text>
            <text x={140} y={406} fontSize={9} fill={COLORS.mid}>
              {locale === 'zh'
                ? '限制：需要 GPU 支持多 stream 并行；PCIe 带宽可能成为瓶颈。'
                : 'Limitation: requires GPU multi-stream support; PCIe bandwidth may bottleneck.'}
            </text>
          </g>
        )}
        {strategy === 'fusion' && (
          <g>
            <text x={140} y={358} fontSize={10} fontWeight="700" fill={COLORS.purple}>
              AllReduce Fusion
            </text>
            <text x={140} y={374} fontSize={9} fill={COLORS.dark}>
              {locale === 'zh'
                ? '将多个小 AllReduce 融合为一个大 AllReduce，减少启动开销 (~30% 通信时间减少)。'
                : 'Fuse multiple small AllReduces into one large AllReduce, reducing launch overhead (~30% comm reduction).'}
            </text>
            <text x={140} y={390} fontSize={9} fill={COLORS.dark}>
              {locale === 'zh'
                ? 'PyTorch DDP 默认使用 bucket size = 25MB 进行融合。'
                : 'PyTorch DDP defaults to bucket size = 25MB for fusion.'}
            </text>
            <text x={140} y={406} fontSize={9} fill={COLORS.mid}>
              {locale === 'zh'
                ? '权衡：更大的 bucket → 更少的启动开销，但更长的等待时间。'
                : 'Trade-off: larger buckets → less launch overhead, but longer wait time.'}
            </text>
          </g>
        )}
        {strategy === 'bucket' && (
          <g>
            <text x={140} y={358} fontSize={10} fontWeight="700" fill={COLORS.orange}>
              Bucket AllReduce
            </text>
            <text x={140} y={374} fontSize={9} fill={COLORS.dark}>
              {locale === 'zh'
                ? '将梯度分组为桶，后向传播中一旦桶填满就立即启动通信，与后续层的反向传播重叠。'
                : 'Group gradients into buckets, start communication as soon as a bucket is filled during backward pass.'}
            </text>
            <text x={140} y={390} fontSize={9} fill={COLORS.dark}>
              {locale === 'zh'
                ? 'PyTorch DDP 的默认策略：反向传播从最后一层开始，梯度自然按逆序准备好。'
                : "PyTorch DDP's default: backward starts from last layer, gradients naturally ready in reverse order."}
            </text>
            <text x={140} y={406} fontSize={9} fill={COLORS.mid}>
              {locale === 'zh'
                ? '组合：Bucket + Overlap 是最常见的生产配置。'
                : 'Combined: Bucket + Overlap is the most common production configuration.'}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
