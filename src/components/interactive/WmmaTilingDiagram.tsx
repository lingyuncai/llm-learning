// src/components/interactive/WmmaTilingDiagram.tsx
// Static SVG: Tensor Core GEMM tiling hierarchy
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function WmmaTilingDiagram() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Tensor Core GEMM tiling hierarchy">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Tensor Core GEMM 的多级 Tiling
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        从 Grid 到 Tensor Core，每级 tile 缩小到适合当前硬件层级
      </text>

      {/* Level 1: Grid Tile */}
      <rect x={20} y={52} width={540} height={55} rx={6}
        fill="none" stroke={COLORS.dark} strokeWidth={2} strokeDasharray="6 3" />
      <text x={30} y={68} fontSize="8" fontWeight="700" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Level 1: Grid Tile</text>
      <text x={30} y={82} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        每个 CUDA Block 负责 C 的一个 BM x BN 区域 (如 128 x 128)
      </text>
      <text x={30} y={96} fontSize="7.5" fill={COLORS.primary} fontFamily={FONTS.sans}>
        决定: 每个 Block 的工作量、shared memory 需求
      </text>

      {/* Level 2: Block Tile → Warp */}
      <rect x={40} y={116} width={500} height={55} rx={6}
        fill="none" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={50} y={132} fontSize="8" fontWeight="700" fill={COLORS.primary}
        fontFamily={FONTS.sans}>Level 2: Warp Tile</text>
      <text x={50} y={146} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        Block 内每个 Warp 负责 C 的 WM x WN 区域 (如 32 x 64)
      </text>
      <text x={50} y={160} fontSize="7.5" fill={COLORS.primary} fontFamily={FONTS.sans}>
        决定: Block 内 Warp 的分工、寄存器分配
      </text>

      {/* Level 3: MMA tile */}
      <rect x={60} y={180} width={460} height={55} rx={6}
        fill="none" stroke={COLORS.green} strokeWidth={1.5} />
      <text x={70} y={196} fontSize="8" fontWeight="700" fill={COLORS.green}
        fontFamily={FONTS.sans}>Level 3: MMA Instruction Tile</text>
      <text x={70} y={210} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        每个 Warp 内层循环用 wmma::mma_sync 做 16 x 16 x 16 (或 m16n8k16) 的矩阵块乘
      </text>
      <text x={70} y={224} fontSize="7.5" fill={COLORS.green} fontFamily={FONTS.sans}>
        这一步由 Tensor Core 硬件执行 — 一条指令完成整块乘加
      </text>

      {/* Tensor Core box */}
      <rect x={100} y={244} width={380} height={45} rx={6}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={2} />
      <text x={290} y={262} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        Tensor Core: D(16x16) = A(16x16) * B(16x16) + C(16x16)
      </text>
      <text x={290} y={278} textAnchor="middle" fontSize="7.5" fill="#64748b"
        fontFamily={FONTS.mono}>
        wmma::mma_sync{'<'}16,16,16,half{'>'} (底层映射到多条 PTX mma.sync 指令)
      </text>

      {/* Dimension summary table */}
      <rect x={40} y={300} width={500} height={65} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={316} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>典型尺寸 (H100 HGEMM)</text>

      {[
        ['Grid tile (Block)', '128 x 128', 'shared memory 中'],
        ['Warp tile', '32 x 64', 'register fragment 中'],
        ['MMA tile (WMMA)', '16 x 16 x 16', 'Tensor Core 一条 warp 级指令'],
      ].map(([level, size, loc], i) => {
        const y = 332 + i * 12;
        return (
          <g key={i}>
            <text x={120} y={y} textAnchor="middle" fontSize="7.5" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{level}</text>
            <text x={280} y={y} textAnchor="middle" fontSize="7.5"
              fill={COLORS.primary} fontFamily={FONTS.mono}>{size}</text>
            <text x={430} y={y} textAnchor="middle" fontSize="7.5"
              fill="#64748b" fontFamily={FONTS.sans}>{loc}</text>
          </g>
        );
      })}
    </svg>
  );
}
