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

interface TimelineProps {
  slots: Slot[];
  y: number;
  title: string;
  annotation: string;
}

function Timeline({ slots, y, title, annotation }: TimelineProps) {
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

export default function LatencyHidingCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      exec: 'Exec',
      miss: 'Miss',
      wait: 'Wait',
      data: 'Data',
      cpuTitle: 'CPU 单线程',
      cpuAnnotation: 'Cache miss → 线程阻塞等待数据（红色 = 浪费的周期）',
      gpuTitle: 'GPU 多 Warp',
      gpuAnnotation: 'Warp 0 等数据时切到 Warp 1/2 → 没有空闲周期（每种颜色 = 不同 warp）',
      cpuUtil: '利用率 ~33%',
      gpuUtil: '利用率 ~100%',
    },
    en: {
      exec: 'Exec',
      miss: 'Miss',
      wait: 'Wait',
      data: 'Data',
      cpuTitle: 'CPU Single Thread',
      cpuAnnotation: 'Cache miss → thread stalls waiting for data (red = wasted cycles)',
      gpuTitle: 'GPU Multi-Warp',
      gpuAnnotation: 'When Warp 0 waits, switch to Warp 1/2 → no idle cycles (each color = different warp)',
      cpuUtil: 'Utilization ~33%',
      gpuUtil: 'Utilization ~100%',
    },
  }[locale];

  const cpuSlots: Slot[] = [
    { label: t.exec, color: COMPUTE, textColor: COLORS.primary },
    { label: t.exec, color: COMPUTE, textColor: COLORS.primary },
    { label: t.miss, color: STALL, textColor: COLORS.red },
    { label: t.wait, color: STALL, textColor: COLORS.red },
    { label: t.wait, color: STALL, textColor: COLORS.red },
    { label: t.wait, color: STALL, textColor: COLORS.red },
    { label: t.wait, color: STALL, textColor: COLORS.red },
    { label: t.data, color: '#fef3c7', textColor: COLORS.orange },
    { label: t.exec, color: COMPUTE, textColor: COLORS.primary },
    { label: t.exec, color: COMPUTE, textColor: COLORS.primary },
    { label: t.miss, color: STALL, textColor: COLORS.red },
    { label: t.wait, color: STALL, textColor: COLORS.red },
    { label: t.wait, color: STALL, textColor: COLORS.red },
    { label: t.data, color: '#fef3c7', textColor: COLORS.orange },
    { label: t.exec, color: COMPUTE, textColor: COLORS.primary },
  ];

  // GPU: 3 warps interleaved, no stalls visible at timeline level
  const warpColors = ['#dbeafe', '#dcfce7', '#ede9fe'];
  const warpTextColors = [COLORS.primary, COLORS.green, COLORS.purple];
  const warpLabels = ['W0', 'W1', 'W2'];

  const gpuSlots: Slot[] = Array.from({ length: 15 }, (_, i) => {
    const w = i % 3;
    return { label: warpLabels[w], color: warpColors[w], textColor: warpTextColors[w] };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CPU stall vs GPU warp-switching latency hiding">

      <Timeline slots={cpuSlots} y={20} title={t.cpuTitle}
        annotation={t.cpuAnnotation} />

      <Timeline slots={gpuSlots} y={105} title={t.gpuTitle}
        annotation={t.gpuAnnotation} />

      {/* Efficiency labels */}
      <text x={W - 10} y={62} textAnchor="end" fontSize="10" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>
        {t.cpuUtil}
      </text>
      <text x={W - 10} y={147} textAnchor="end" fontSize="10" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        {t.gpuUtil}
      </text>
    </svg>
  );
}
