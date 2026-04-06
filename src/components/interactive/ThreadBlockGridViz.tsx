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
function GridOverview({ locale, t }: { locale: string; t: any }) {
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
        {t.gridTitle}
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.gridDesc}
      </text>

      {/* Grid outline */}
      <rect x={startX - 8} y={startY - 8}
        width={gridDim.x * (blockW + gap) - gap + 16}
        height={gridDim.y * (blockH + gap) - gap + 16}
        rx={6} fill="none" stroke={COLORS.dark} strokeWidth={2} strokeDasharray="6 3" />
      <text x={startX - 8} y={startY - 14} fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.gridLabel}</text>

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
                {t.blockLabel}({bx},{by})
              </text>
              <text x={x + blockW / 2} y={y + 30} textAnchor="middle"
                fontSize="7" fill="#64748b" fontFamily={FONTS.mono}>
                {t.blockIdx}=({bx},{by})
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
        {t.highlight}
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
        {t.gridDimDesc}
      </text>
    </g>
  );
}

// Single block expanded to show threads
function BlockExpanded({ locale, t }: { locale: string; t: any }) {
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
        {t.blockTitle}
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.blockDesc}
      </text>

      {/* Block outline */}
      <rect x={startX - 6} y={startY - 6}
        width={blockDim.x * (cellW + gap) - gap + 12}
        height={blockDim.y * (cellH + gap) - gap + 12}
        rx={5} fill="none" stroke={COLORS.primary} strokeWidth={2} />
      <text x={startX - 6} y={startY - 12} fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        {t.blockLabel}(1,1) — {t.blockIdx}=(1,1)
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
                {t.tid}=({tx},{ty})
              </text>
              <text x={x + cellW / 2} y={y + 22} textAnchor="middle"
                fontSize="6" fill="#64748b" fontFamily={FONTS.mono}>
                {t.linear}={linearId}
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
        {t.warpDesc}
      </text>

      {/* Formula */}
      <rect x={40} y={SVG_H - 65} width={500} height={48} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={SVG_H - 44} textAnchor="middle" fontSize="9" fill={COLORS.dark}
        fontFamily={FONTS.mono}>
        {t.globalFormula}
      </text>
      <text x={W / 2} y={SVG_H - 28} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.globalDesc}
      </text>
    </g>
  );
}

// Thread to warp mapping
function WarpPacking({ locale, t }: { locale: string; t: any }) {
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
        {t.warpTitle}
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.warpSubtitle}
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

      {/* Warp bounding boxes — warp 0: rows 0-1, warp 1: rows 2-3 */}
      {[0, 1].map(warpId => {
        const color = warpId === 0 ? COLORS.primary : COLORS.green;
        const boxY = startY - 2 + warpId * 2 * (cellH + gap);
        return (
          <g key={warpId}>
            <rect x={startX - 2}
              y={boxY}
              width={COLS * (cellW + gap) - gap + 4}
              height={2 * (cellH + gap) - gap + 4}
              rx={4} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 2" />
          </g>
        );
      })}

      {/* Warp 0 label */}
      <text x={startX + COLS * (cellW + gap) / 2} y={startY + 2 * (cellH + gap) + cellH + 16}
        textAnchor="middle" fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
        {t.warp0}
      </text>
      <text x={startX + COLS * (cellW + gap) / 2} y={startY + 4 * (cellH + gap) + cellH + 16}
        textAnchor="middle" fontSize="8" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
        {t.warp1}
      </text>

      {/* Key insight */}
      <rect x={40} y={SVG_H - 100} width={500} height={80} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={SVG_H - 80} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.warpRuleTitle}
      </text>
      <text x={W / 2} y={SVG_H - 64} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        {t.warpRule1}
      </text>
      <text x={W / 2} y={SVG_H - 48} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        {t.warpRule2}
      </text>
      <text x={W / 2} y={SVG_H - 32} textAnchor="middle" fontSize="8" fill={COLORS.orange}
        fontFamily={FONTS.sans}>
        {t.warpRule3}
      </text>
    </g>
  );
}

export default function ThreadBlockGridViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      gridTitle: 'Grid: 所有 Block 的集合 (gridDim = 4×3)',
      gridDesc: '每个 Block 是独立的线程组，可被分配到任意 SM 执行',
      gridLabel: 'Grid',
      blockLabel: 'Block',
      blockIdx: 'blockIdx',
      highlight: '高亮 Block(1,1) — 下一步展开看内部线程结构',
      gridDimDesc: 'gridDim 指定 Grid 中 Block 的数量 (每个维度)',
      blockTitle: 'Block(1,1) 内部: blockDim = 8×4 = 32 个线程',
      blockDesc: 'Block 内线程共享 Shared Memory，可通过 __syncthreads() 同步',
      tid: 'tid',
      linear: 'linear',
      warpDesc: 'Warp 0: thread 0-31 (硬件将 32 个线程打包为 1 个 warp 锁步执行)',
      globalFormula: 'globalIdx.x = threadIdx.x + blockIdx.x * blockDim.x = tx + 1 * 8 = tx + 8',
      globalDesc: '每个线程用 threadIdx + blockIdx * blockDim 计算自己在全局数据中的位置',
      warpTitle: 'Thread → Warp 打包规则',
      warpSubtitle: 'blockDim = 16×4 = 64 threads → 打包为 2 个 warp (每 32 个线程一组)',
      warp0: 'Warp 0: T0-T31',
      warp1: 'Warp 1: T32-T63',
      warpRuleTitle: 'Warp 打包规则',
      warpRule1: '线程按 linearIdx = threadIdx.x + threadIdx.y * blockDim.x + threadIdx.z * blockDim.x * blockDim.y 排序',
      warpRule2: '每连续 32 个线程打包为一个 warp: warpId = linearIdx / 32',
      warpRule3: '因此 blockDim 应该是 32 的倍数 — 否则最后一个 warp 有空闲线程，浪费硬件',
      stepGrid: 'Grid: Block 的集合',
      stepBlock: 'Block 内部: Thread',
      stepWarp: 'Thread → Warp 打包',
    },
    en: {
      gridTitle: 'Grid: Collection of all Blocks (gridDim = 4×3)',
      gridDesc: 'Each Block is an independent thread group, can be assigned to any SM for execution',
      gridLabel: 'Grid',
      blockLabel: 'Block',
      blockIdx: 'blockIdx',
      highlight: 'Highlight Block(1,1) — next step expands to see internal thread structure',
      gridDimDesc: 'gridDim specifies the number of Blocks in the Grid (per dimension)',
      blockTitle: 'Block(1,1) internals: blockDim = 8×4 = 32 threads',
      blockDesc: 'Threads in Block share Shared Memory, can sync via __syncthreads()',
      tid: 'tid',
      linear: 'linear',
      warpDesc: 'Warp 0: threads 0-31 (hardware packs 32 threads into 1 warp for lockstep execution)',
      globalFormula: 'globalIdx.x = threadIdx.x + blockIdx.x * blockDim.x = tx + 1 * 8 = tx + 8',
      globalDesc: 'Each thread computes its position in global data using threadIdx + blockIdx * blockDim',
      warpTitle: 'Thread → Warp Packing Rules',
      warpSubtitle: 'blockDim = 16×4 = 64 threads → packed into 2 warps (32 threads per group)',
      warp0: 'Warp 0: T0-T31',
      warp1: 'Warp 1: T32-T63',
      warpRuleTitle: 'Warp Packing Rules',
      warpRule1: 'Threads sorted by linearIdx = threadIdx.x + threadIdx.y * blockDim.x + threadIdx.z * blockDim.x * blockDim.y',
      warpRule2: 'Every consecutive 32 threads packed into one warp: warpId = linearIdx / 32',
      warpRule3: 'Therefore blockDim should be a multiple of 32 — otherwise last warp has idle threads, wasting hardware',
      stepGrid: 'Grid: Collection of Blocks',
      stepBlock: 'Block Internals: Threads',
      stepWarp: 'Thread → Warp Packing',
    },
  }[locale];

  const steps = [
    { title: t.stepGrid, content: <StepSvg><GridOverview locale={locale} t={t} /></StepSvg> },
    { title: t.stepBlock, content: <StepSvg><BlockExpanded locale={locale} t={t} /></StepSvg> },
    { title: t.stepWarp, content: <StepSvg><WarpPacking locale={locale} t={t} /></StepSvg> },
  ];

  return <StepNavigator steps={steps} />;
}
