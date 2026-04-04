// src/components/interactive/MemoryCoalescingDemo.tsx
// StepNavigator: coalesced vs uncoalesced global memory access
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 320;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Memory segment (128 bytes)
function MemSegment({ x, y, w, h, label, used, total, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; used: number; total: number; color: string; bg: string;
}) {
  const usedW = (used / total) * w;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={0.5} />
      <rect x={x} y={y} width={usedW} height={h} rx={3}
        fill={bg} stroke={color} strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize="6.5" fill={color} fontFamily={FONTS.mono}>{label}</text>
    </g>
  );
}

const THREAD_COUNT = 16; // show 16 of 32 for space
const CELL_W = 28;
const CELL_GAP = 2;
const THREAD_Y = 60;
const MEM_Y = 150;

const steps = [
  {
    title: 'Coalesced: 连续访问',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Coalesced Access: Thread i 读 A[i] (连续地址)
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          32 个线程读 32 个连续 float (128 bytes) → 合并为 1 个 128B transaction
        </text>

        {/* Thread row */}
        {Array.from({ length: THREAD_COUNT }).map((_, i) => {
          const x = (W - THREAD_COUNT * (CELL_W + CELL_GAP) + CELL_GAP) / 2 + i * (CELL_W + CELL_GAP);
          return (
            <g key={i}>
              <rect x={x} y={THREAD_Y} width={CELL_W} height={22} rx={2}
                fill="#dcfce7" stroke={COLORS.green} strokeWidth={0.5} />
              <text x={x + CELL_W / 2} y={THREAD_Y + 9} textAnchor="middle"
                fontSize="6" fill={COLORS.green} fontFamily={FONTS.mono}>T{i}</text>
              <text x={x + CELL_W / 2} y={THREAD_Y + 19} textAnchor="middle"
                fontSize="5" fill="#64748b" fontFamily={FONTS.mono}>A[{i}]</text>
              {/* Arrow down */}
              <line x1={x + CELL_W / 2} y1={THREAD_Y + 22} x2={x + CELL_W / 2} y2={MEM_Y - 4}
                stroke={COLORS.green} strokeWidth={0.5} opacity={0.4} />
            </g>
          );
        })}

        {/* Memory: single 128B segment */}
        <text x={W / 2} y={MEM_Y - 8} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Global Memory (HBM)</text>
        <MemSegment
          x={(W - THREAD_COUNT * (CELL_W + CELL_GAP) + CELL_GAP) / 2}
          y={MEM_Y} w={THREAD_COUNT * (CELL_W + CELL_GAP) - CELL_GAP} h={30}
          label="1 × 128B transaction" used={128} total={128}
          color={COLORS.green} bg="#dcfce7" />

        {/* Stats */}
        <rect x={60} y={200} width={460} height={55} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          效率: 128 / 128 = 100% 带宽利用率
        </text>
        <text x={W / 2} y={236} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          传输 128 bytes, 有效数据 128 bytes — 零浪费
        </text>
        <text x={W / 2} y={248} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>
          GPU 内存控制器将 warp 内连续地址合并为最少的 transaction
        </text>

        {/* Note */}
        <text x={W / 2} y={280} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          行优先访问矩阵的同一行: thread i 读 M[row][i] — 地址连续，天然 coalesced
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Strided: 不连续访问',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Strided Access: Thread i 读 A[i × stride] (不连续地址)
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          stride=16: 32 个线程的地址散落在 16 个 128B segment 中
        </text>

        {/* Thread row — spread out */}
        {Array.from({ length: THREAD_COUNT }).map((_, i) => {
          const x = (W - THREAD_COUNT * (CELL_W + CELL_GAP) + CELL_GAP) / 2 + i * (CELL_W + CELL_GAP);
          return (
            <g key={i}>
              <rect x={x} y={THREAD_Y} width={CELL_W} height={22} rx={2}
                fill="#fee2e2" stroke={COLORS.red} strokeWidth={0.5} />
              <text x={x + CELL_W / 2} y={THREAD_Y + 9} textAnchor="middle"
                fontSize="6" fill={COLORS.red} fontFamily={FONTS.mono}>T{i}</text>
              <text x={x + CELL_W / 2} y={THREAD_Y + 19} textAnchor="middle"
                fontSize="5" fill="#64748b" fontFamily={FONTS.mono}>A[{i * 16}]</text>
            </g>
          );
        })}

        {/* Memory: many segments, mostly wasted */}
        <text x={W / 2} y={MEM_Y - 8} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Global Memory: 多个 128B transaction</text>

        {Array.from({ length: 4 }).map((_, row) => (
          <g key={row}>
            {Array.from({ length: 4 }).map((_, col) => {
              const segIdx = row * 4 + col;
              const x = 50 + col * 130;
              const y = MEM_Y + row * 18;
              return (
                <MemSegment key={segIdx}
                  x={x} y={y} w={120} h={14}
                  label={`seg ${segIdx}: 128B (有效 4B)`} used={4} total={128}
                  color={COLORS.red} bg="#fee2e2" />
              );
            })}
          </g>
        ))}

        {/* Stats */}
        <rect x={60} y={230} width={460} height={55} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={248} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          效率: 128 / 2048 = 6.25% 带宽利用率
        </text>
        <text x={W / 2} y={266} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          传输 16 × 128B = 2048 bytes, 有效数据仅 128 bytes — 93.75% 浪费
        </text>
        <text x={W / 2} y={278} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个 thread 的 4B 数据分散在不同 segment → 每个 segment 只用 4B
        </text>

        {/* Note */}
        <text x={W / 2} y={305} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          列优先访问矩阵: thread i 读 M[i][col] — stride = 行宽，严重 uncoalesced
        </text>
      </StepSvg>
    ),
  },
];

export default function MemoryCoalescingDemo() {
  return <StepNavigator steps={steps} />;
}
