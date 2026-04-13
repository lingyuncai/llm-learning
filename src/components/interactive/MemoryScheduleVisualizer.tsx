import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface TensorInfo {
  id: string;
  sizeMB: number;
  color: string;
}

interface OpNode {
  id: string;
  label: string;
  outputTensors: { id: string; sizeMB: number }[];
  inputTensorIds: string[];
}

interface ScheduleOrder {
  name: { zh: string; en: string };
  order: string[];
  description: { zh: string; en: string };
}

interface MemorySnapshot {
  afterOp: string;
  aliveTensors: { id: string; sizeMB: number }[];
  totalMB: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Constants ─── */

const W = 800;
const H = 520;

const TENSOR_COLORS: Record<string, string> = {
  t1: HEAD_COLORS[0],
  t2: HEAD_COLORS[1],
  t3: HEAD_COLORS[2],
  t4: HEAD_COLORS[3],
  t5: HEAD_COLORS[4],
  t6: HEAD_COLORS[5],
  out: HEAD_COLORS[6],
};

/* ─── Data ─── */

const OPS: OpNode[] = [
  { id: 'A', label: 'Op A', outputTensors: [{ id: 't1', sizeMB: 256 }, { id: 't2', sizeMB: 128 }], inputTensorIds: [] },
  { id: 'B', label: 'Op B', outputTensors: [{ id: 't3', sizeMB: 128 }], inputTensorIds: ['t1'] },
  { id: 'C', label: 'Op C', outputTensors: [{ id: 't4', sizeMB: 64 }], inputTensorIds: ['t1'] },
  { id: 'D', label: 'Op D', outputTensors: [{ id: 't5', sizeMB: 128 }], inputTensorIds: ['t2'] },
  { id: 'E', label: 'Op E', outputTensors: [{ id: 't6', sizeMB: 64 }], inputTensorIds: ['t3', 't4'] },
  { id: 'F', label: 'Op F', outputTensors: [{ id: 'out', sizeMB: 64 }], inputTensorIds: ['t5', 't6'] },
];

const SCHEDULES: ScheduleOrder[] = [
  {
    name: { zh: 'BFS 调度', en: 'BFS Schedule' },
    order: ['A', 'B', 'C', 'D', 'E', 'F'],
    description: {
      zh: '广度优先: A→B→C→D→E→F，多个 tensor 同时存活',
      en: 'Breadth-first: A→B→C→D→E→F, many tensors alive simultaneously',
    },
  },
  {
    name: { zh: 'DFS 调度', en: 'DFS Schedule' },
    order: ['A', 'B', 'C', 'E', 'D', 'F'],
    description: {
      zh: '深度优先: A→B→C→E→D→F，尽早释放 tensor',
      en: 'Depth-first: A→B→C→E→D→F, frees tensors earlier',
    },
  },
];

/* ─── Computation ─── */

function computeMemoryTimeline(
  ops: OpNode[],
  order: string[],
  checkpointing: boolean,
): MemorySnapshot[] {
  const opMap = new Map(ops.map(op => [op.id, op]));

  // Track which tensors are needed by remaining ops
  const tensorConsumers = new Map<string, Set<string>>();
  for (const op of ops) {
    for (const tid of op.inputTensorIds) {
      if (!tensorConsumers.has(tid)) tensorConsumers.set(tid, new Set());
      tensorConsumers.get(tid)!.add(op.id);
    }
  }

  const alive = new Map<string, number>(); // tensorId -> sizeMB
  const remaining = new Map<string, Set<string>>();
  for (const [tid, consumers] of tensorConsumers) {
    remaining.set(tid, new Set(consumers));
  }

  const snapshots: MemorySnapshot[] = [];

  // Checkpointed tensors (t1 and t3 are large, mark for recompute)
  const checkpointedTensors = checkpointing ? new Set(['t1', 't3']) : new Set<string>();

  for (const opId of order) {
    const op = opMap.get(opId)!;

    // Produce output tensors
    for (const out of op.outputTensors) {
      if (out.id === 'out') {
        alive.set(out.id, out.sizeMB);
        continue;
      }
      const size = checkpointedTensors.has(out.id) ? Math.ceil(out.sizeMB * 0.15) : out.sizeMB;
      alive.set(out.id, size);
    }

    // Consume input tensors — remove from remaining consumers
    for (const tid of op.inputTensorIds) {
      const rem = remaining.get(tid);
      if (rem) {
        rem.delete(opId);
        if (rem.size === 0) {
          alive.delete(tid);
        }
      }
    }

    const aliveTensors = Array.from(alive.entries()).map(([id, sizeMB]) => ({ id, sizeMB }));
    const totalMB = aliveTensors.reduce((sum, t) => sum + t.sizeMB, 0);
    snapshots.push({ afterOp: opId, aliveTensors, totalMB });
  }

  return snapshots;
}

/* ─── DAG Layout (top area) ─── */

const DAG_POSITIONS: Record<string, { x: number; y: number }> = {
  A: { x: 70, y: 45 },
  B: { x: 210, y: 20 },
  C: { x: 210, y: 70 },
  D: { x: 350, y: 70 },
  E: { x: 350, y: 20 },
  F: { x: 490, y: 45 },
};

const DAG_EDGES: [string, string, string][] = [
  ['A', 'B', 't1'],
  ['A', 'C', 't1'],
  ['A', 'D', 't2'],
  ['B', 'E', 't3'],
  ['C', 'E', 't4'],
  ['D', 'F', 't5'],
  ['E', 'F', 't6'],
];

/* ─── Component ─── */

export default function MemoryScheduleVisualizer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '内存调度: BFS vs DFS',
      peak: '峰值',
      savings: '节省',
      enableCheckpoint: '启用 Activation Checkpointing',
      disableCheckpoint: '关闭 Activation Checkpointing',
      afterOp: '执行后',
      alive: '存活 Tensor',
      checkpointNote: '(带 ✓ 的 tensor 标记为可重计算，仅保留校验信息)',
      tensorLabel: 'Tensor 生命周期',
    },
    en: {
      title: 'Memory Scheduling: BFS vs DFS',
      peak: 'Peak',
      savings: 'Savings',
      enableCheckpoint: 'Enable Activation Checkpointing',
      disableCheckpoint: 'Disable Activation Checkpointing',
      afterOp: 'After',
      alive: 'Alive Tensors',
      checkpointNote: '(tensors marked ✓ are recomputed on demand, only checksum stored)',
      tensorLabel: 'Tensor Lifetimes',
    },
  }[locale]!;

  const [checkpointing, setCheckpointing] = useState(false);

  const bfsSnapshots = useMemo(
    () => computeMemoryTimeline(OPS, SCHEDULES[0].order, checkpointing),
    [checkpointing],
  );
  const dfsSnapshots = useMemo(
    () => computeMemoryTimeline(OPS, SCHEDULES[1].order, checkpointing),
    [checkpointing],
  );

  const bfsPeak = Math.max(...bfsSnapshots.map(s => s.totalMB));
  const dfsPeak = Math.max(...dfsSnapshots.map(s => s.totalMB));
  const savings = ((1 - dfsPeak / bfsPeak) * 100).toFixed(0);
  const globalMax = Math.max(bfsPeak, dfsPeak) * 1.15;

  // Memory chart dimensions
  const chartLeft = 55;
  const chartW = 320;
  const chartH = 140;
  const chartTop = 280;
  const chartGap = 60;
  const barGap = 4;

  function renderMemoryChart(
    snapshots: MemorySnapshot[],
    schedule: ScheduleOrder,
    xOffset: number,
    peak: number,
  ) {
    const barW = (chartW - (snapshots.length - 1) * barGap) / snapshots.length;
    const scale = (mb: number) => (mb / globalMax) * chartH;

    return (
      <g transform={`translate(${xOffset}, ${chartTop})`}>
        {/* Title */}
        <text x={chartW / 2} y="-12" fontSize="12" fill={COLORS.dark} textAnchor="middle" fontWeight="600">
          {schedule.name[locale]}
        </text>
        <text x={chartW / 2} y="0" fontSize="9" fill={COLORS.mid} textAnchor="middle">
          {schedule.description[locale]}
        </text>

        {/* Y axis */}
        <line x1="0" y1="10" x2="0" y2={chartH + 10} stroke={COLORS.light} strokeWidth="1" />
        {[0, 0.25, 0.5, 0.75, 1].map(frac => {
          const y = chartH + 10 - frac * chartH;
          const mb = Math.round(frac * globalMax);
          return (
            <g key={frac}>
              <line x1="-4" y1={y} x2={chartW} y2={y} stroke={COLORS.light} strokeWidth="0.5" strokeDasharray="2,2" />
              <text x="-8" y={y + 3} fontSize="8" fill={COLORS.mid} textAnchor="end">
                {mb}
              </text>
            </g>
          );
        })}

        {/* Stacked bars */}
        {snapshots.map((snap, i) => {
          const x = i * (barW + barGap);
          let yOffset = chartH + 10;

          return (
            <g key={snap.afterOp}>
              {snap.aliveTensors.map(tensor => {
                const h = scale(tensor.sizeMB);
                yOffset -= h;
                return (
                  <motion.rect
                    key={tensor.id}
                    x={x}
                    y={yOffset}
                    width={barW}
                    height={h}
                    fill={TENSOR_COLORS[tensor.id] ?? COLORS.mid}
                    rx="2"
                    initial={{ height: 0, y: chartH + 10 }}
                    animate={{ height: h, y: yOffset }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    opacity={0.85}
                  />
                );
              })}
              {/* Op label */}
              <text x={x + barW / 2} y={chartH + 24} fontSize="9" fill={COLORS.dark} textAnchor="middle" fontWeight="500">
                {snap.afterOp}
              </text>
            </g>
          );
        })}

        {/* Peak line */}
        <line
          x1="0"
          y1={chartH + 10 - scale(peak)}
          x2={chartW}
          y2={chartH + 10 - scale(peak)}
          stroke={COLORS.red}
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
        <text
          x={chartW + 4}
          y={chartH + 10 - scale(peak) + 4}
          fontSize="10"
          fill={COLORS.red}
          fontWeight="600"
        >
          {t.peak}: {peak} MB
        </text>
      </g>
    );
  }

  return (
    <div className="my-6">
      {/* Checkpoint toggle */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setCheckpointing(!checkpointing)}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
          style={{
            background: checkpointing ? COLORS.purple : COLORS.bgAlt,
            color: checkpointing ? '#fff' : COLORS.dark,
            border: `1px solid ${checkpointing ? COLORS.purple : COLORS.light}`,
          }}
        >
          {checkpointing ? t.disableCheckpoint : t.enableCheckpoint}
        </button>
        {checkpointing && (
          <span className="text-xs" style={{ color: COLORS.mid }}>
            {t.checkpointNote}
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <rect width={W} height={H} fill={COLORS.bg} rx="8" />

        {/* DAG visualization */}
        <g transform="translate(120, 90)">
          {/* Edges */}
          {DAG_EDGES.map(([from, to, tensorId]) => {
            const p1 = DAG_POSITIONS[from];
            const p2 = DAG_POSITIONS[to];
            return (
              <g key={`${from}-${to}`}>
                <line
                  x1={p1.x + 18}
                  y1={p1.y}
                  x2={p2.x - 18}
                  y2={p2.y}
                  stroke={TENSOR_COLORS[tensorId] ?? COLORS.mid}
                  strokeWidth="2"
                  opacity={0.7}
                />
                <text
                  x={(p1.x + p2.x) / 2}
                  y={(p1.y + p2.y) / 2 - 6}
                  fontSize="9"
                  fill={TENSOR_COLORS[tensorId] ?? COLORS.mid}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {tensorId}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {OPS.map(op => {
            const pos = DAG_POSITIONS[op.id];
            return (
              <g key={op.id}>
                <circle cx={pos.x} cy={pos.y} r="16" fill={COLORS.primary} opacity={0.9} />
                <text x={pos.x} y={pos.y + 4} fontSize="11" fill="#fff" textAnchor="middle" fontWeight="700">
                  {op.id}
                </text>
                {/* Output tensor info */}
                <text x={pos.x} y={pos.y + 30} fontSize="8" fill={COLORS.mid} textAnchor="middle">
                  {op.outputTensors.map(ot => `${ot.id}(${ot.sizeMB}MB)`).join(', ')}
                </text>
              </g>
            );
          })}
        </g>

        {/* Tensor legend */}
        <g transform="translate(25, 195)">
          <text x="0" y="0" fontSize="10" fill={COLORS.mid} fontWeight="600">{t.tensorLabel}:</text>
          {Object.entries(TENSOR_COLORS).filter(([id]) => id !== 'out').map(([id, color], i) => (
            <g key={id} transform={`translate(${i * 100 + 100}, -8)`}>
              <rect width="10" height="10" fill={color} rx="2" />
              <text x="14" y="9" fontSize="9" fill={COLORS.mid}>{id}</text>
            </g>
          ))}
        </g>

        {/* Memory charts side by side */}
        {renderMemoryChart(bfsSnapshots, SCHEDULES[0], chartLeft, bfsPeak)}
        {renderMemoryChart(dfsSnapshots, SCHEDULES[1], chartLeft + chartW + chartGap, dfsPeak)}

        {/* Metrics bar at bottom */}
        <rect x="10" y={H - 45} width={W - 20} height="35" fill={COLORS.bgAlt} rx="6" />
        <text x="25" y={H - 22} fontSize="12" fill={COLORS.dark} fontWeight="600">
          BFS {t.peak}: {bfsPeak} MB
        </text>
        <text x="240" y={H - 22} fontSize="12" fill={COLORS.dark} fontWeight="600">
          DFS {t.peak}: {dfsPeak} MB
        </text>
        <text x="450" y={H - 22} fontSize="13" fill={COLORS.green} fontWeight="700">
          {t.savings}: {savings}%
        </text>
        {checkpointing && (
          <text x="600" y={H - 22} fontSize="11" fill={COLORS.purple} fontWeight="600">
            + Checkpoint
          </text>
        )}
      </svg>
    </div>
  );
}
