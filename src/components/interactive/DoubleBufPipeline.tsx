// src/components/interactive/DoubleBufPipeline.tsx
// StepNavigator: double buffering pipeline — load and compute overlap
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 300;

type Locale = 'zh' | 'en';

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

function TimeBar({ x, y, w, h, label, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={bg} stroke={color} strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

const TRACK_Y = 65;
const TRACK_H = 26;
const UNIT_W = 60;

function getSteps(locale: Locale) {
  const t = {
    zh: {
      step1Title: '无双缓冲: Load 和 Compute 串行',
      step1TitleText: '串行流水线: 计算必须等加载完成',
      step1SubText: '每个 tile: 加载到 shared memory → __syncthreads() → 计算 → __syncthreads() → 下一个',
      timeLabel: '时间 →',
      load: 'Load',
      compute: 'Compute',
      idle: 'idle',
      totalTime: '总时间 = 4 x (Load + Compute) — 一半时间在空闲!',
      problem: '问题: 加载和计算不能重叠',
      problemDesc1: '加载 tile 到 shared memory 后才能计算 → 计算完才能加载下一个 tile',
      problemDesc2: '原因: 只有一块 shared memory buffer，加载和计算操作的是同一块内存',
      solution: '解决方案: 用两块 buffer — 一块加载新数据，同时另一块用于计算',
      solutionNote: '(或者用寄存器预加载: 先读到寄存器，计算完当前 tile 后再写入 shared memory)',
      step2Title: '双缓冲: Load 和 Compute 重叠',
      step2TitleText: 'Double Buffering: 加载和计算流水线化',
      step2SubText: 'Buffer A 用于计算时，Buffer B 同时从 HBM 预加载下一个 tile',
      bufA: 'Buf A',
      bufB: 'Buf B',
      overlapNote: '橙色虚线框 = Load 和 Compute 同时进行 (重叠)',
      timeSavings: '时间节省',
      serialTime: '串行: 4 x (L + C) = 8 步',
      overlapTime: '重叠: L + 4C + drain = ~5 步',
      hiddenLatency: '当 Load 时间 ≤ Compute 时间时，几乎完全隐藏加载延迟',
      tradeoff: '代价: 2x shared memory 使用 (两个 buffer) 或额外寄存器用于预加载',
      tradeoffNote: '实际实现常用寄存器预加载 (先 global → register → shared) 避免 2x shared memory',
    },
    en: {
      step1Title: 'Without Double Buffering: Serial Load and Compute',
      step1TitleText: 'Serial Pipeline: Compute Must Wait for Load',
      step1SubText: 'Each tile: Load to shared memory → __syncthreads() → Compute → __syncthreads() → Next',
      timeLabel: 'Time →',
      load: 'Load',
      compute: 'Compute',
      idle: 'idle',
      totalTime: 'Total time = 4 x (Load + Compute) — Half the time idle!',
      problem: 'Problem: Load and Compute Cannot Overlap',
      problemDesc1: 'Must load tile to shared memory before compute → Must finish compute before loading next tile',
      problemDesc2: 'Reason: Only one shared memory buffer, load and compute operate on the same memory',
      solution: 'Solution: Use two buffers — one loads new data while the other is used for compute',
      solutionNote: '(Or use register prefetching: read to register first, write to shared memory after computing current tile)',
      step2Title: 'Double Buffering: Load and Compute Overlap',
      step2TitleText: 'Double Buffering: Pipeline Load and Compute',
      step2SubText: 'While Buffer A is computing, Buffer B prefetches next tile from HBM',
      bufA: 'Buf A',
      bufB: 'Buf B',
      overlapNote: 'Orange dashed box = Load and Compute happen concurrently (overlap)',
      timeSavings: 'Time Savings',
      serialTime: 'Serial: 4 x (L + C) = 8 steps',
      overlapTime: 'Overlap: L + 4C + drain = ~5 steps',
      hiddenLatency: 'When Load time ≤ Compute time, load latency is almost fully hidden',
      tradeoff: 'Trade-off: 2x shared memory usage (two buffers) or extra registers for prefetch',
      tradeoffNote: 'Actual implementations often use register prefetch (global → register → shared) to avoid 2x shared memory',
    },
  }[locale];

const steps = [
  {
    title: t.step1Title,
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step1TitleText}
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.step1SubText}
        </text>

        {/* Timeline axis */}
        <text x={30} y={TRACK_Y - 8} fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.timeLabel}</text>

        {/* Load track */}
        <text x={15} y={TRACK_Y + TRACK_H / 2} textAnchor="end" dominantBaseline="middle"
          fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>{t.load}</text>
        {Array.from({ length: 4 }).map((_, i) => (
          <TimeBar key={`l-${i}`}
            x={40 + i * (UNIT_W * 2 + 8)} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
            label={`${t.load} T${i}`} color={COLORS.primary} bg="#dbeafe" />
        ))}

        {/* Compute track */}
        <text x={15} y={TRACK_Y + TRACK_H + 8 + TRACK_H / 2} textAnchor="end"
          dominantBaseline="middle" fontSize="8" fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.compute}
        </text>
        {Array.from({ length: 4 }).map((_, i) => (
          <TimeBar key={`c-${i}`}
            x={40 + UNIT_W + 4 + i * (UNIT_W * 2 + 8)}
            y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
            label={`${t.compute} T${i}`} color={COLORS.green} bg="#dcfce7" />
        ))}

        {/* Idle markers */}
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={`idle-${i}`}>
            <rect x={40 + i * (UNIT_W * 2 + 8)} y={TRACK_Y + TRACK_H + 8}
              width={UNIT_W} height={TRACK_H} rx={3}
              fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={40 + UNIT_W / 2 + i * (UNIT_W * 2 + 8)}
              y={TRACK_Y + TRACK_H + 8 + TRACK_H / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="6" fill="#94a3b8" fontFamily={FONTS.sans}>{t.idle}</text>
          </g>
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={`idle2-${i}`}>
            <rect x={40 + UNIT_W + 4 + i * (UNIT_W * 2 + 8)} y={TRACK_Y}
              width={UNIT_W} height={TRACK_H} rx={3}
              fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={40 + UNIT_W + 4 + UNIT_W / 2 + i * (UNIT_W * 2 + 8)}
              y={TRACK_Y + TRACK_H / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="6" fill="#94a3b8" fontFamily={FONTS.sans}>{t.idle}</text>
          </g>
        ))}

        {/* Total time */}
        <line x1={40} y1={145} x2={40 + 4 * (UNIT_W * 2 + 8) - 8} y2={145}
          stroke={COLORS.red} strokeWidth={1.5} />
        <text x={W / 2} y={162} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          {t.totalTime}
        </text>

        {/* Problem */}
        <rect x={40} y={180} width={500} height={100} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={200} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          {t.problem}
        </text>
        <text x={60} y={220} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.problemDesc1}
        </text>
        <text x={60} y={238} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.problemDesc2}
        </text>
        <text x={60} y={256} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
          {t.solution}
        </text>
        <text x={60} y={272} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          {t.solutionNote}
        </text>
      </StepSvg>
    ),
  },
  {
    title: t.step2Title,
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step2TitleText}
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.step2SubText}
        </text>

        {/* Two buffer tracks */}
        <text x={15} y={TRACK_Y + TRACK_H / 2} textAnchor="end" dominantBaseline="middle"
          fontSize="7" fill={COLORS.primary} fontFamily={FONTS.sans}>{t.bufA}</text>
        <text x={15} y={TRACK_Y + TRACK_H + 8 + TRACK_H / 2} textAnchor="end"
          dominantBaseline="middle" fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.bufB}
        </text>

        {/* Buffer A: Load T0, Compute T0, Load T2, Compute T2 */}
        <TimeBar x={40} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label={`${t.load} T0`} color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + UNIT_W + 4} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label={`${t.compute.slice(0, 4)} T0`} color={COLORS.green} bg="#dcfce7" />
        <TimeBar x={40 + (UNIT_W + 4) * 2} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label={`${t.load} T2`} color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 3} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label={`${t.compute.slice(0, 4)} T2`} color={COLORS.green} bg="#dcfce7" />

        {/* Buffer B: idle, Load T1, Compute T1, Load T3, Compute T3 */}
        <TimeBar x={40 + UNIT_W + 4} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label={`${t.load} T1`} color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 2} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label={`${t.compute.slice(0, 4)} T1`} color={COLORS.green} bg="#dcfce7" />
        <TimeBar x={40 + (UNIT_W + 4) * 3} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label={`${t.load} T3`} color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 4} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label={`${t.compute.slice(0, 4)} T3`} color={COLORS.green} bg="#dcfce7" />

        {/* Overlap highlight */}
        {[1, 2, 3].map(i => {
          const x = 40 + (UNIT_W + 4) * i;
          return (
            <rect key={i} x={x - 2} y={TRACK_Y - 4}
              width={UNIT_W + 4} height={TRACK_H * 2 + 16} rx={4}
              fill="none" stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="4 2" />
          );
        })}

        <text x={W / 2} y={TRACK_Y + TRACK_H * 2 + 25} textAnchor="middle"
          fontSize="8" fill={COLORS.orange} fontFamily={FONTS.sans}>
          {t.overlapNote}
        </text>

        {/* Time comparison */}
        <rect x={40} y={165} width={500} height={65} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={185} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.timeSavings}
        </text>
        <text x={150} y={205} textAnchor="middle" fontSize="8"
          fill={COLORS.red} fontFamily={FONTS.mono}>{t.serialTime}</text>
        <text x={290} y={205} fontSize="10" fill={COLORS.dark}>→</text>
        <text x={430} y={205} textAnchor="middle" fontSize="8"
          fill={COLORS.green} fontFamily={FONTS.mono}>{t.overlapTime}</text>
        <text x={W / 2} y={222} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.hiddenLatency}
        </text>

        {/* Trade-off */}
        <rect x={40} y={245} width={500} height={40} rx={5}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
        <text x={W / 2} y={262} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          {t.tradeoff}
        </text>
        <text x={W / 2} y={278} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.tradeoffNote}
        </text>
      </StepSvg>
    ),
  },
];

return steps;
}

export default function DoubleBufPipeline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const steps = getSteps(locale);
  return <StepNavigator steps={steps} />;
}
