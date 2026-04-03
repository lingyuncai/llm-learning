// src/components/interactive/LatencyHidingCompare.tsx
// Animated comparison: CPU stall on cache miss vs GPU warp switching
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const H = 200;
const SLOT_W = 32;
const SLOT_H = 28;

// Timeline slot colors
const COMPUTE = '#dbeafe';   // blue — active compute
const STALL = '#fee2e2';     // red — stalled / idle

interface Slot { label: string; color: string; textColor: string; }

const cpuSlots: Slot[] = [
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
  { label: 'Miss', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Data', color: '#fef3c7', textColor: COLORS.orange },
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
  { label: 'Miss', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Wait', color: STALL, textColor: COLORS.red },
  { label: 'Data', color: '#fef3c7', textColor: COLORS.orange },
  { label: 'Exec', color: COMPUTE, textColor: COLORS.primary },
];

// GPU: 3 warps interleaved, no stalls visible at timeline level
const warpColors = ['#dbeafe', '#dcfce7', '#ede9fe'];
const warpTextColors = [COLORS.primary, COLORS.green, COLORS.purple];
const warpLabels = ['W0', 'W1', 'W2'];

const gpuSlots: Slot[] = Array.from({ length: 15 }, (_, i) => {
  const w = i % 3;
  return { label: warpLabels[w], color: warpColors[w], textColor: warpTextColors[w] };
});

function Timeline({ slots, y, title, annotation }: {
  slots: Slot[]; y: number; title: string; annotation: string;
}) {
  return (
    <g>
      <text x={10} y={y - 8} fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
      {slots.map((s, i) => (
        <g key={i}>
          <rect x={10 + i * (SLOT_W + 2)} y={y} width={SLOT_W} height={SLOT_H}
            rx={3} fill={s.color} stroke={s.textColor} strokeWidth={1} />
          <text x={10 + i * (SLOT_W + 2) + SLOT_W / 2} y={y + SLOT_H / 2 + 1}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fontWeight="500" fill={s.textColor} fontFamily={FONTS.mono}>
            {s.label}
          </text>
        </g>
      ))}
      <text x={10} y={y + SLOT_H + 14} fontSize="8.5" fill="#64748b"
        fontFamily={FONTS.sans}>{annotation}</text>
    </g>
  );
}

export default function LatencyHidingCompare() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CPU stall vs GPU warp-switching latency hiding">

      <Timeline slots={cpuSlots} y={20} title="CPU 单线程"
        annotation="Cache miss → 线程阻塞等待数据（红色 = 浪费的周期）" />

      <Timeline slots={gpuSlots} y={105} title="GPU 多 Warp"
        annotation="Warp 0 等数据时切到 Warp 1/2 → 没有空闲周期（每种颜色 = 不同 warp）" />

      {/* Efficiency labels */}
      <text x={W - 10} y={62} textAnchor="end" fontSize="10" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>
        利用率 ~33%
      </text>
      <text x={W - 10} y={147} textAnchor="end" fontSize="10" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        利用率 ~100%
      </text>
    </svg>
  );
}
