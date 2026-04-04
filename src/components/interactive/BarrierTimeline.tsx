// src/components/interactive/BarrierTimeline.tsx
// Static SVG: multi-warp write → barrier → read timeline
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

// Timeline bar
function Bar({ x, y, w, h, label, color, bg }: {
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

const TRACK_H = 26;
const TRACK_GAP = 8;
const LABEL_X = 85;
const TIMELINE_X = 95;

const warps = ['Warp 0', 'Warp 1', 'Warp 2', 'Warp 3'];

export default function BarrierTimeline() {
  const barrierX = TIMELINE_X + 180;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Synchronization barrier timeline">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        __syncthreads() — Block 内 Barrier 同步
      </text>

      {/* Correct pattern with barrier */}
      <text x={TIMELINE_X} y={42} fontSize="10" fontWeight="600" fill={COLORS.green}
        fontFamily={FONTS.sans}>正确: 写 Shared Memory → __syncthreads() → 读 Shared Memory</text>

      {warps.map((warp, i) => {
        const y = 55 + i * (TRACK_H + TRACK_GAP);
        // Stagger write completion slightly per warp
        const writeEnd = 130 + i * 15;
        return (
          <g key={i}>
            <text x={LABEL_X} y={y + TRACK_H / 2} textAnchor="end" dominantBaseline="middle"
              fontSize="8" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {warp}
            </text>
            {/* Write phase */}
            <Bar x={TIMELINE_X} y={y} w={writeEnd - TIMELINE_X} h={TRACK_H}
              label="写 smem" color={COLORS.primary} bg="#dbeafe" />
            {/* Wait at barrier */}
            <rect x={writeEnd} y={y} width={barrierX - writeEnd} height={TRACK_H} rx={3}
              fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={0.5} />
            <text x={(writeEnd + barrierX) / 2} y={y + TRACK_H / 2} textAnchor="middle"
              dominantBaseline="middle" fontSize="6" fill="#94a3b8" fontFamily={FONTS.sans}>
              等待
            </text>
            {/* Read phase (after barrier) */}
            <Bar x={barrierX + 4} y={y} w={100} h={TRACK_H}
              label="读 smem" color={COLORS.green} bg="#dcfce7" />
          </g>
        );
      })}

      {/* Barrier line */}
      <line x1={barrierX} y1={50} x2={barrierX}
        y2={55 + warps.length * (TRACK_H + TRACK_GAP) - TRACK_GAP}
        stroke={COLORS.orange} strokeWidth={2.5} />
      <text x={barrierX} y={55 + warps.length * (TRACK_H + TRACK_GAP) + 8}
        textAnchor="middle" fontSize="8" fontWeight="700" fill={COLORS.orange}
        fontFamily={FONTS.mono}>__syncthreads()</text>
      <text x={barrierX} y={55 + warps.length * (TRACK_H + TRACK_GAP) + 22}
        textAnchor="middle" fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
        所有线程到达后才继续
      </text>

      {/* Without barrier - race condition */}
      <rect x={30} y={205} width={520} height={90} rx={6}
        fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
      <text x={W / 2} y={222} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>
        如果没有 __syncthreads():
      </text>
      <text x={W / 2} y={240} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        Warp 0 写完 smem 后立即读 → 但 Warp 3 还没写完 → 读到的是旧数据或未初始化数据
      </text>
      <text x={W / 2} y={256} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        Race Condition: 结果取决于 warp 执行顺序，不确定且不可复现
      </text>
      <text x={W / 2} y={275} textAnchor="middle" fontSize="8" fill={COLORS.red}
        fontFamily={FONTS.sans}>
        注意: 所有线程必须执行到同一个 __syncthreads() — 不能在 if/else 分支中不对称调用
      </text>
    </svg>
  );
}
