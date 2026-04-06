// src/components/interactive/WmmaTilingDiagram.tsx
// Static SVG: Tensor Core GEMM tiling hierarchy
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function WmmaTilingDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Tensor Core GEMM 的多级 Tiling',
      subtitle: '从 Grid 到 Tensor Core，每级 tile 缩小到适合当前硬件层级',
      level1Title: 'Level 1: Grid Tile',
      level1Desc: '每个 CUDA Block 负责 C 的一个 BM x BN 区域 (如 128 x 128)',
      level1Note: '决定: 每个 Block 的工作量、shared memory 需求',
      level2Title: 'Level 2: Warp Tile',
      level2Desc: 'Block 内每个 Warp 负责 C 的 WM x WN 区域 (如 32 x 64)',
      level2Note: '决定: Block 内 Warp 的分工、寄存器分配',
      level3Title: 'Level 3: MMA Instruction Tile',
      level3Desc: '每个 Warp 内层循环用 wmma::mma_sync 做 16 x 16 x 16 (或 m16n8k16) 的矩阵块乘',
      level3Note: '这一步由 Tensor Core 硬件执行 — 一条指令完成整块乘加',
      tensorCore: 'Tensor Core: D(16x16) = A(16x16) * B(16x16) + C(16x16)',
      tableTile: '典型尺寸 (H100 HGEMM)',
      gridTile: 'Grid tile (Block)',
      warpTile: 'Warp tile',
      mmaTile: 'MMA tile (WMMA)',
      inSharedMem: 'shared memory 中',
      inRegFrag: 'register fragment 中',
      oneWarpInst: 'Tensor Core 一条 warp 级指令',
    },
    en: {
      title: 'Tensor Core GEMM Multi-Level Tiling',
      subtitle: 'From Grid to Tensor Core, each level tile sized for hardware layer',
      level1Title: 'Level 1: Grid Tile',
      level1Desc: 'Each CUDA Block handles BM x BN region of C (e.g., 128 x 128)',
      level1Note: 'Determines: per-Block workload, shared memory requirements',
      level2Title: 'Level 2: Warp Tile',
      level2Desc: 'Each Warp within Block handles WM x WN region of C (e.g., 32 x 64)',
      level2Note: 'Determines: Warp division within Block, register allocation',
      level3Title: 'Level 3: MMA Instruction Tile',
      level3Desc: 'Each Warp inner loop uses wmma::mma_sync for 16 x 16 x 16 (or m16n8k16) matrix tile multiply',
      level3Note: 'This step executed by Tensor Core hardware — one instruction completes entire block multiply-add',
      tensorCore: 'Tensor Core: D(16x16) = A(16x16) * B(16x16) + C(16x16)',
      tableTile: 'Typical Dimensions (H100 HGEMM)',
      gridTile: 'Grid tile (Block)',
      warpTile: 'Warp tile',
      mmaTile: 'MMA tile (WMMA)',
      inSharedMem: 'in shared memory',
      inRegFrag: 'in register fragment',
      oneWarpInst: 'Tensor Core one warp-level instruction',
    },
  }[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Tensor Core GEMM tiling hierarchy">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {/* Level 1: Grid Tile */}
      <rect x={20} y={52} width={540} height={55} rx={6}
        fill="none" stroke={COLORS.dark} strokeWidth={2} strokeDasharray="6 3" />
      <text x={30} y={68} fontSize="8" fontWeight="700" fill={COLORS.dark}
        fontFamily={FONTS.sans}>{t.level1Title}</text>
      <text x={30} y={82} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        {t.level1Desc}
      </text>
      <text x={30} y={96} fontSize="7.5" fill={COLORS.primary} fontFamily={FONTS.sans}>
        {t.level1Note}
      </text>

      {/* Level 2: Block Tile → Warp */}
      <rect x={40} y={116} width={500} height={55} rx={6}
        fill="none" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={50} y={132} fontSize="8" fontWeight="700" fill={COLORS.primary}
        fontFamily={FONTS.sans}>{t.level2Title}</text>
      <text x={50} y={146} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        {t.level2Desc}
      </text>
      <text x={50} y={160} fontSize="7.5" fill={COLORS.primary} fontFamily={FONTS.sans}>
        {t.level2Note}
      </text>

      {/* Level 3: MMA tile */}
      <rect x={60} y={180} width={460} height={55} rx={6}
        fill="none" stroke={COLORS.green} strokeWidth={1.5} />
      <text x={70} y={196} fontSize="8" fontWeight="700" fill={COLORS.green}
        fontFamily={FONTS.sans}>{t.level3Title}</text>
      <text x={70} y={210} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
        {t.level3Desc}
      </text>
      <text x={70} y={224} fontSize="7.5" fill={COLORS.green} fontFamily={FONTS.sans}>
        {t.level3Note}
      </text>

      {/* Tensor Core box */}
      <rect x={100} y={244} width={380} height={45} rx={6}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={2} />
      <text x={290} y={262} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        {t.tensorCore}
      </text>
      <text x={290} y={278} textAnchor="middle" fontSize="7.5" fill="#64748b"
        fontFamily={FONTS.mono}>
        wmma::mma_sync{'<'}16,16,16,half{'>'} (底层映射到多条 PTX mma.sync 指令)
      </text>

      {/* Dimension summary table */}
      <rect x={40} y={300} width={500} height={65} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={316} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.tableTile}</text>

      {[
        [t.gridTile, '128 x 128', t.inSharedMem],
        [t.warpTile, '32 x 64', t.inRegFrag],
        [t.mmaTile, '16 x 16 x 16', t.oneWarpInst],
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
