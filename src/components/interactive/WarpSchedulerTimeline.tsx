// src/components/interactive/WarpSchedulerTimeline.tsx
// Step animation: warp scheduler interleaving warps to hide latency
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const WARPS = ['Warp 0', 'Warp 1', 'Warp 2', 'Warp 3'];
const WARP_COLORS = ['#dbeafe', '#dcfce7', '#ede9fe', '#fef3c7'];
const WARP_STROKES = [COLORS.primary, COLORS.green, COLORS.purple, COLORS.orange];
const CYCLES = 16;
const SLOT_W = 28;
const SLOT_H = 24;

type SlotType = 'exec' | 'wait' | 'idle';

interface TimelineState {
  warps: SlotType[][];
  activeWarp: number;
  cycle: number;
}

// Simplified schedule: each warp executes 2 cycles, then waits 4 cycles for memory
function generateSchedule(): SlotType[][] {
  const schedule: SlotType[][] = WARPS.map(() => Array(CYCLES).fill('idle'));

  // 3 warps rotate: each executes 2 cycles then waits 4 cycles for memory
  // Warp 0: exec 0-1, wait 2-5, exec 6-7, wait 8-11, exec 12-13
  // Warp 1: exec 2-3, wait 4-7, exec 8-9, wait 10-13, exec 14-15
  // Warp 2: exec 4-5, wait 6-9, exec 10-11, wait 12-15
  // Warp 3: shown as idle (not enough work to schedule) — demonstrates that
  //         more active warps = better latency hiding
  const patterns = [
    [0, 1, -1, -1, -1, -1, 6, 7, -1, -1, -1, -1, 12, 13, -1, -1],
    [-1, -1, 2, 3, -1, -1, -1, -1, 8, 9, -1, -1, -1, -1, 14, 15],
    [-1, -1, -1, -1, 4, 5, -1, -1, -1, -1, 10, 11, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], // idle
  ];

  for (let w = 0; w < 3; w++) {
    for (let c = 0; c < CYCLES; c++) {
      if (patterns[w][c] >= 0) schedule[w][c] = 'exec';
      else if (c > 0 && schedule[w][c - 1] === 'exec') schedule[w][c] = 'wait'; // start wait after exec
    }
    // Fill wait periods
    let inWait = false;
    for (let c = 0; c < CYCLES; c++) {
      if (schedule[w][c] === 'exec') { inWait = false; }
      else if (c > 0 && schedule[w][c - 1] === 'exec') { schedule[w][c] = 'wait'; inWait = true; }
      else if (inWait && schedule[w][c] === 'idle') { schedule[w][c] = 'wait'; }
    }
  }

  return schedule;
}

function TimelineRow({ warpIdx, slots, highlightCycle }: {
  warpIdx: number; slots: SlotType[]; highlightCycle: number;
}) {
  const colorMap: Record<SlotType, { fill: string; stroke: string }> = {
    exec: { fill: WARP_COLORS[warpIdx], stroke: WARP_STROKES[warpIdx] },
    wait: { fill: '#fee2e2', stroke: '#fca5a5' },
    idle: { fill: '#f9fafb', stroke: '#e5e7eb' },
  };

  return (
    <g>
      <text x={0} y={14} fontSize="9" fontWeight="600"
        fill={WARP_STROKES[warpIdx]} fontFamily={FONTS.sans}>
        {WARPS[warpIdx]}
      </text>
      {slots.map((s, c) => {
        const x = 60 + c * (SLOT_W + 2);
        const col = colorMap[s];
        const isHighlight = c === highlightCycle;
        return (
          <g key={c}>
            <rect x={x} y={0} width={SLOT_W} height={SLOT_H} rx={3}
              fill={col.fill} stroke={isHighlight ? '#000' : col.stroke}
              strokeWidth={isHighlight ? 2 : 1} />
            <text x={x + SLOT_W / 2} y={SLOT_H / 2 + 1} textAnchor="middle"
              dominantBaseline="middle" fontSize="6.5" fill="#64748b"
              fontFamily={FONTS.mono}>
              {s === 'exec' ? 'RUN' : s === 'wait' ? 'MEM' : '—'}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function WarpSchedulerTimeline() {
  const schedule = generateSchedule();

  const steps = [
    {
      title: 'Cycle 0-1: Warp 0 执行',
      content: (
        <div>
          <p className="text-sm mb-3">
            Warp Scheduler 选择 <strong>Warp 0</strong> 执行计算指令。执行 2 个周期后，
            遇到全局内存访问 — 需要等待 ~数百个周期。
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={1} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-blue-50 rounded text-xs text-blue-800 mt-2">
            关键：Warp 0 等待内存时不会阻塞整个 SM — scheduler 立即切换到另一个 ready warp
          </div>
        </div>
      ),
    },
    {
      title: 'Cycle 2-3: 切换到 Warp 1',
      content: (
        <div>
          <p className="text-sm mb-3">
            Warp 0 在等内存数据，<strong>零开销切换</strong>到 Warp 1（所有 warp 的寄存器状态常驻 SM，
            切换不需要保存/恢复上下文）。Warp 1 开始执行。
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={3} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-green-50 rounded text-xs text-green-800 mt-2">
            GPU 的秘密武器：寄存器状态常驻 → warp 切换是零开销的（不像 CPU 的上下文切换需要保存/恢复）
          </div>
        </div>
      ),
    },
    {
      title: 'Cycle 4-5: 继续切换到 Warp 2',
      content: (
        <div>
          <p className="text-sm mb-3">
            Warp 1 也遇到内存等待，切换到 <strong>Warp 2</strong>。此时 Warp 0 还在等内存。
            Scheduler 持续在 ready warp 之间轮转，<strong>让 ALU 始终有事做</strong>。
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={5} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-purple-50 rounded text-xs text-purple-800 mt-2">
            这就是为什么 GPU 需要大量 warp — 每个 SM 上 active warp 越多，延迟隐藏越充分，利用率越高。
            这也是 occupancy 概念的由来。
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
