// src/components/interactive/DoubleBufPipeline.tsx
// StepNavigator: double buffering pipeline — load and compute overlap
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 300;

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

const steps = [
  {
    title: '无双缓冲: Load 和 Compute 串行',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          串行流水线: 计算必须等加载完成
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个 tile: 加载到 shared memory → __syncthreads() → 计算 → __syncthreads() → 下一个
        </text>

        {/* Timeline axis */}
        <text x={30} y={TRACK_Y - 8} fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>时间 →</text>

        {/* Load track */}
        <text x={15} y={TRACK_Y + TRACK_H / 2} textAnchor="end" dominantBaseline="middle"
          fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>Load</text>
        {Array.from({ length: 4 }).map((_, i) => (
          <TimeBar key={`l-${i}`}
            x={40 + i * (UNIT_W * 2 + 8)} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
            label={`Load T${i}`} color={COLORS.primary} bg="#dbeafe" />
        ))}

        {/* Compute track */}
        <text x={15} y={TRACK_Y + TRACK_H + 8 + TRACK_H / 2} textAnchor="end"
          dominantBaseline="middle" fontSize="8" fill={COLORS.green} fontFamily={FONTS.sans}>
          Compute
        </text>
        {Array.from({ length: 4 }).map((_, i) => (
          <TimeBar key={`c-${i}`}
            x={40 + UNIT_W + 4 + i * (UNIT_W * 2 + 8)}
            y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
            label={`Compute T${i}`} color={COLORS.green} bg="#dcfce7" />
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
              fontSize="6" fill="#94a3b8" fontFamily={FONTS.sans}>idle</text>
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
              fontSize="6" fill="#94a3b8" fontFamily={FONTS.sans}>idle</text>
          </g>
        ))}

        {/* Total time */}
        <line x1={40} y1={145} x2={40 + 4 * (UNIT_W * 2 + 8) - 8} y2={145}
          stroke={COLORS.red} strokeWidth={1.5} />
        <text x={W / 2} y={162} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          总时间 = 4 x (Load + Compute) — 一半时间在空闲!
        </text>

        {/* Problem */}
        <rect x={40} y={180} width={500} height={100} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={200} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          问题: 加载和计算不能重叠
        </text>
        <text x={60} y={220} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          加载 tile 到 shared memory 后才能计算 → 计算完才能加载下一个 tile
        </text>
        <text x={60} y={238} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          原因: 只有一块 shared memory buffer，加载和计算操作的是同一块内存
        </text>
        <text x={60} y={256} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
          解决方案: 用两块 buffer — 一块加载新数据，同时另一块用于计算
        </text>
        <text x={60} y={272} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          (或者用寄存器预加载: 先读到寄存器，计算完当前 tile 后再写入 shared memory)
        </text>
      </StepSvg>
    ),
  },
  {
    title: '双缓冲: Load 和 Compute 重叠',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Double Buffering: 加载和计算流水线化
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          Buffer A 用于计算时，Buffer B 同时从 HBM 预加载下一个 tile
        </text>

        {/* Two buffer tracks */}
        <text x={15} y={TRACK_Y + TRACK_H / 2} textAnchor="end" dominantBaseline="middle"
          fontSize="7" fill={COLORS.primary} fontFamily={FONTS.sans}>Buf A</text>
        <text x={15} y={TRACK_Y + TRACK_H + 8 + TRACK_H / 2} textAnchor="end"
          dominantBaseline="middle" fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
          Buf B
        </text>

        {/* Buffer A: Load T0, Compute T0, Load T2, Compute T2 */}
        <TimeBar x={40} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label="Load T0" color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + UNIT_W + 4} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label="Comp T0" color={COLORS.green} bg="#dcfce7" />
        <TimeBar x={40 + (UNIT_W + 4) * 2} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label="Load T2" color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 3} y={TRACK_Y} w={UNIT_W} h={TRACK_H}
          label="Comp T2" color={COLORS.green} bg="#dcfce7" />

        {/* Buffer B: idle, Load T1, Compute T1, Load T3, Compute T3 */}
        <TimeBar x={40 + UNIT_W + 4} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label="Load T1" color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 2} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label="Comp T1" color={COLORS.green} bg="#dcfce7" />
        <TimeBar x={40 + (UNIT_W + 4) * 3} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label="Load T3" color={COLORS.primary} bg="#dbeafe" />
        <TimeBar x={40 + (UNIT_W + 4) * 4} y={TRACK_Y + TRACK_H + 8} w={UNIT_W} h={TRACK_H}
          label="Comp T3" color={COLORS.green} bg="#dcfce7" />

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
          橙色虚线框 = Load 和 Compute 同时进行 (重叠)
        </text>

        {/* Time comparison */}
        <rect x={40} y={165} width={500} height={65} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={185} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          时间节省
        </text>
        <text x={150} y={205} textAnchor="middle" fontSize="8"
          fill={COLORS.red} fontFamily={FONTS.mono}>串行: 4 x (L + C) = 8 步</text>
        <text x={290} y={205} fontSize="10" fill={COLORS.dark}>→</text>
        <text x={430} y={205} textAnchor="middle" fontSize="8"
          fill={COLORS.green} fontFamily={FONTS.mono}>重叠: L + 4C + drain = ~5 步</text>
        <text x={W / 2} y={222} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          当 Load 时间 {'≤'} Compute 时间时，几乎完全隐藏加载延迟
        </text>

        {/* Trade-off */}
        <rect x={40} y={245} width={500} height={40} rx={5}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
        <text x={W / 2} y={262} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          代价: 2x shared memory 使用 (两个 buffer) 或额外寄存器用于预加载
        </text>
        <text x={W / 2} y={278} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          实际实现常用寄存器预加载 (先 global → register → shared) 避免 2x shared memory
        </text>
      </StepSvg>
    ),
  },
];

export default function DoubleBufPipeline() {
  return <StepNavigator steps={steps} />;
}
