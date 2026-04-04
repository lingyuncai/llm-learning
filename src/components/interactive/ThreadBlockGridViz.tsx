// src/components/interactive/ThreadBlockGridViz.tsx
// StepNavigator: CUDA Thread → Block → Grid hierarchy visualization
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 340;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Grid of blocks
function GridOverview() {
  const gridDim = { x: 4, y: 3 }; // 4×3 grid of blocks
  const blockW = 80;
  const blockH = 55;
  const gap = 6;
  const startX = (W - gridDim.x * (blockW + gap) + gap) / 2;
  const startY = 60;

  return (
    <g>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Grid: 所有 Block 的集合 (gridDim = 4×3)
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        每个 Block 是独立的线程组，可被分配到任意 SM 执行
      </text>

      {/* Grid outline */}
      <rect x={startX - 8} y={startY - 8}
        width={gridDim.x * (blockW + gap) - gap + 16}
        height={gridDim.y * (blockH + gap) - gap + 16}
        rx={6} fill="none" stroke={COLORS.dark} strokeWidth={2} strokeDasharray="6 3" />
      <text x={startX - 8} y={startY - 14} fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Grid</text>

      {Array.from({ length: gridDim.y }).map((_, by) =>
        Array.from({ length: gridDim.x }).map((_, bx) => {
          const x = startX + bx * (blockW + gap);
          const y = startY + by * (blockH + gap);
          const isHighlight = bx === 1 && by === 1;
          return (
            <g key={`${bx}-${by}`}>
              <rect x={x} y={y} width={blockW} height={blockH} rx={4}
                fill={isHighlight ? '#dbeafe' : '#f8fafc'}
                stroke={isHighlight ? COLORS.primary : '#cbd5e1'}
                strokeWidth={isHighlight ? 2 : 1} />
              <text x={x + blockW / 2} y={y + 16} textAnchor="middle"
                fontSize="8" fontWeight="600"
                fill={isHighlight ? COLORS.primary : COLORS.dark} fontFamily={FONTS.sans}>
                Block({bx},{by})
              </text>
              <text x={x + blockW / 2} y={y + 30} textAnchor="middle"
                fontSize="7" fill="#64748b" fontFamily={FONTS.mono}>
                blockIdx=({bx},{by})
              </text>
              {/* Mini thread grid (4×4) */}
              {Array.from({ length: 4 }).map((_, tr) =>
                Array.from({ length: 4 }).map((_, tc) => (
                  <rect key={`t-${tr}-${tc}`}
                    x={x + 12 + tc * 14} y={y + 36 + tr * 4}
                    width={12} height={3} rx={0.5}
                    fill={isHighlight ? COLORS.primary : '#94a3b8'} opacity={0.4} />
                ))
              )}
            </g>
          );
        })
      )}

      {/* Legend */}
      <text x={W / 2} y={startY + gridDim.y * (blockH + gap) + 16} textAnchor="middle"
        fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
        高亮 Block(1,1) — 下一步展开看内部线程结构
      </text>

      {/* Index formulas */}
      <rect x={60} y={SVG_H - 55} width={460} height={40} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={SVG_H - 34} textAnchor="middle" fontSize="9" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        blockIdx.x = 0..gridDim.x-1, blockIdx.y = 0..gridDim.y-1
      </text>
      <text x={W / 2} y={SVG_H - 20} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        gridDim 指定 Grid 中 Block 的数量 (每个维度)
      </text>
    </g>
  );
}

// Single block expanded to show threads
function BlockExpanded() {
  const blockDim = { x: 8, y: 4 }; // 8×4 = 32 threads per block
  const cellW = 50;
  const cellH = 28;
  const gap = 2;
  const startX = (W - blockDim.x * (cellW + gap) + gap) / 2;
  const startY = 65;

  return (
    <g>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Block(1,1) 内部: blockDim = 8×4 = 32 个线程
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        Block 内线程共享 Shared Memory，可通过 __syncthreads() 同步
      </text>

      {/* Block outline */}
      <rect x={startX - 6} y={startY - 6}
        width={blockDim.x * (cellW + gap) - gap + 12}
        height={blockDim.y * (cellH + gap) - gap + 12}
        rx={5} fill="none" stroke={COLORS.primary} strokeWidth={2} />
      <text x={startX - 6} y={startY - 12} fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        Block(1,1) — blockIdx=(1,1)
      </text>

      {Array.from({ length: blockDim.y }).map((_, ty) =>
        Array.from({ length: blockDim.x }).map((_, tx) => {
          const x = startX + tx * (cellW + gap);
          const y = startY + ty * (cellH + gap);
          const linearId = ty * blockDim.x + tx;
          const warpId = Math.floor(linearId / 32);
          const warpColor = warpId === 0 ? COLORS.primary : COLORS.green;
          return (
            <g key={`${tx}-${ty}`}>
              <rect x={x} y={y} width={cellW} height={cellH} rx={2}
                fill={warpId === 0 ? '#dbeafe' : '#dcfce7'}
                stroke={warpColor} strokeWidth={0.8} />
              <text x={x + cellW / 2} y={y + 10} textAnchor="middle"
                fontSize="6.5" fill={warpColor} fontFamily={FONTS.mono}>
                tid=({tx},{ty})
              </text>
              <text x={x + cellW / 2} y={y + 22} textAnchor="middle"
                fontSize="6" fill="#64748b" fontFamily={FONTS.mono}>
                linear={linearId}
              </text>
            </g>
          );
        })
      )}

      {/* Warp annotation */}
      <rect x={startX - 6} y={startY + blockDim.y * (cellH + gap) + 10}
        width={blockDim.x * (cellW + gap) - gap + 12} height={22} rx={3}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={W / 2} y={startY + blockDim.y * (cellH + gap) + 24}
        textAnchor="middle" fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
        Warp 0: thread 0-31 (硬件将 32 个线程打包为 1 个 warp 锁步执行)
      </text>

      {/* Formula */}
      <rect x={40} y={SVG_H - 65} width={500} height={48} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={SVG_H - 44} textAnchor="middle" fontSize="9" fill={COLORS.dark}
        fontFamily={FONTS.mono}>
        globalIdx.x = threadIdx.x + blockIdx.x * blockDim.x = tx + 1 * 8 = tx + 8
      </text>
      <text x={W / 2} y={SVG_H - 28} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        每个线程用 threadIdx + blockIdx * blockDim 计算自己在全局数据中的位置
      </text>
    </g>
  );
}

// Thread to warp mapping
function WarpPacking() {
  const THREADS = 64; // 2 warps
  const COLS = 16;
  const cellW = 28;
  const cellH = 16;
  const gap = 2;
  const startX = (W - COLS * (cellW + gap) + gap) / 2;
  const startY = 60;

  return (
    <g>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Thread → Warp 打包规则
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        blockDim = 16×4 = 64 threads → 打包为 2 个 warp (每 32 个线程一组)
      </text>

      {Array.from({ length: Math.ceil(THREADS / COLS) }).map((_, row) =>
        Array.from({ length: COLS }).map((_, col) => {
          const tid = row * COLS + col;
          if (tid >= THREADS) return null;
          const warpId = Math.floor(tid / 32);
          const x = startX + col * (cellW + gap);
          const y = startY + row * (cellH + gap);
          const color = warpId === 0 ? COLORS.primary : COLORS.green;
          const bg = warpId === 0 ? '#dbeafe' : '#dcfce7';
          return (
            <g key={tid}>
              <rect x={x} y={y} width={cellW} height={cellH} rx={1.5}
                fill={bg} stroke={color} strokeWidth={0.5} />
              <text x={x + cellW / 2} y={y + cellH / 2 + 1} textAnchor="middle"
                dominantBaseline="middle" fontSize="6.5" fill={color} fontFamily={FONTS.mono}>
                T{tid}
              </text>
            </g>
          );
        })
      )}

      {/* Warp labels */}
      {[0, 1].map(warpId => {
        const y = startY + (warpId === 0 ? 0 : 2) * (cellH + gap) + cellH + gap + 2;
        const color = warpId === 0 ? COLORS.primary : COLORS.green;
        return (
          <g key={warpId}>
            <rect x={startX + (warpId === 0 ? 0 : COLS / 2 * (cellW + gap))}
              y={startY - 2 + (warpId === 0 ? 0 : 2) * (cellH + gap)}
              width={COLS * (cellW + gap) - gap}
              height={2 * (cellH + gap) + cellH + 4}
              rx={4} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 2" />
          </g>
        );
      })}

      {/* Warp 0 label */}
      <text x={startX + COLS * (cellW + gap) / 2} y={startY + 2 * (cellH + gap) + cellH + 16}
        textAnchor="middle" fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
        Warp 0: T0-T31
      </text>
      <text x={startX + COLS * (cellW + gap) / 2} y={startY + 4 * (cellH + gap) + cellH + 16}
        textAnchor="middle" fontSize="8" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
        Warp 1: T32-T63
      </text>

      {/* Key insight */}
      <rect x={40} y={SVG_H - 100} width={500} height={80} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={SVG_H - 80} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Warp 打包规则
      </text>
      <text x={W / 2} y={SVG_H - 64} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        线程按 linearIdx = threadIdx.x + threadIdx.y * blockDim.x + threadIdx.z * blockDim.x * blockDim.y 排序
      </text>
      <text x={W / 2} y={SVG_H - 48} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        每连续 32 个线程打包为一个 warp: warpId = linearIdx / 32
      </text>
      <text x={W / 2} y={SVG_H - 32} textAnchor="middle" fontSize="8" fill={COLORS.orange}
        fontFamily={FONTS.sans}>
        因此 blockDim 应该是 32 的倍数 — 否则最后一个 warp 有空闲线程，浪费硬件
      </text>
    </g>
  );
}

const steps = [
  { title: 'Grid: Block 的集合', content: <StepSvg><GridOverview /></StepSvg> },
  { title: 'Block 内部: Thread', content: <StepSvg><BlockExpanded /></StepSvg> },
  { title: 'Thread → Warp 打包', content: <StepSvg><WarpPacking /></StepSvg> },
];

export default function ThreadBlockGridViz() {
  return <StepNavigator steps={steps} />;
}
