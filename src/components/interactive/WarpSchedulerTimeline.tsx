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

export default function WarpSchedulerTimeline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const schedule = generateSchedule();

  const t = {
    zh: {
      step1Title: 'Cycle 0-1: Warp 0 执行',
      step1P: 'Warp Scheduler 选择 Warp 0 执行计算指令。执行 2 个周期后，遇到全局内存访问 — 需要等待 ~数百个周期。',
      step1Insight: '关键：Warp 0 等待内存时不会阻塞整个 SM — scheduler 立即切换到另一个 ready warp',
      step2Title: 'Cycle 2-3: 切换到 Warp 1',
      step2P: 'Warp 0 在等内存数据，零开销切换到 Warp 1（所有 warp 的寄存器状态常驻 SM，切换不需要保存/恢复上下文）。Warp 1 开始执行。',
      step2Insight: 'GPU 的秘密武器：寄存器状态常驻 → warp 切换是零开销的（不像 CPU 的上下文切换需要保存/恢复）',
      step3Title: 'Cycle 4-5: 继续切换到 Warp 2',
      step3P: 'Warp 1 也遇到内存等待，切换到 Warp 2。此时 Warp 0 还在等内存。Scheduler 持续在 ready warp 之间轮转，让 ALU 始终有事做。',
      step3Insight: '这就是为什么 GPU 需要大量 warp — 每个 SM 上 active warp 越多，延迟隐藏越充分，利用率越高。这也是 occupancy 概念的由来。',
    },
    en: {
      step1Title: 'Cycle 0-1: Warp 0 Executes',
      step1P: 'Warp Scheduler selects Warp 0 to execute compute instructions. After 2 cycles, encounters global memory access — needs to wait ~hundreds of cycles.',
      step1Insight: 'Key: While Warp 0 waits for memory, it doesn\'t block the entire SM — scheduler immediately switches to another ready warp',
      step2Title: 'Cycle 2-3: Switch to Warp 1',
      step2P: 'Warp 0 is waiting for memory data, zero-overhead switch to Warp 1 (all warp register states are resident in SM, switching requires no save/restore context). Warp 1 starts executing.',
      step2Insight: 'GPU\'s secret weapon: Register state resident → warp switching is zero-overhead (unlike CPU context switching which requires save/restore)',
      step3Title: 'Cycle 4-5: Continue to Warp 2',
      step3P: 'Warp 1 also encounters memory wait, switches to Warp 2. Meanwhile Warp 0 still waiting for memory. Scheduler continuously rotates among ready warps, keeping ALU always busy.',
      step3Insight: 'This is why GPUs need many warps — more active warps per SM = better latency hiding and higher utilization. This is the origin of the occupancy concept.',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <div>
          <p className="text-sm mb-3">
            {t.step1P}
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={1} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-blue-50 rounded text-xs text-blue-800 mt-2">
            {t.step1Insight}
          </div>
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div>
          <p className="text-sm mb-3">
            {t.step2P}
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={3} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-green-50 rounded text-xs text-green-800 mt-2">
            {t.step2Insight}
          </div>
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div>
          <p className="text-sm mb-3">
            {t.step3P}
          </p>
          <svg viewBox={`0 0 560 130`} className="w-full">
            {schedule.map((slots, w) => (
              <g key={w} transform={`translate(0, ${w * 30})`}>
                <TimelineRow warpIdx={w} slots={slots} highlightCycle={5} />
              </g>
            ))}
          </svg>
          <div className="p-3 bg-purple-50 rounded text-xs text-purple-800 mt-2">
            {t.step3Insight}
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} locale={locale} />;
}
