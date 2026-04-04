// src/components/interactive/IntelGemmCompare.tsx
// Static SVG: CUDA GEMM vs Intel GEMM tiling comparison
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

const COL_X = [150, 430];
const COL_W = 230;

interface CompRow {
  level: string;
  cuda: string;
  intel: string;
}

const ROWS: CompRow[] = [
  { level: 'Grid 级', cuda: 'Block tile: BM x BN\n(Shared Memory)', intel: 'Work-group tile: BM x BN\n(SLM / Shared Local Memory)' },
  { level: 'Warp/Sub-group 级', cuda: 'Warp tile: WM x WN\n(Register fragment)', intel: 'Sub-group tile: WM x WN\n(GRF / Register)' },
  { level: '指令级', cuda: 'wmma::mma_sync\n(Tensor Core 16x16x16)', intel: 'joint_matrix_mad\n(XMX systolic array)' },
  { level: '数据类型', cuda: 'FP16 in → FP32 acc\n(mma.sync.f32.f16)', intel: 'FP16/BF16 in → FP32 acc\n(dpas / XMX)' },
  { level: '编程 API', cuda: 'CUDA wmma / mma.sync\n(PTX / CUTLASS)', intel: 'SYCL joint_matrix\n(或 ESIMD intrinsics)' },
];

const ROW_H = 52;
const ROW_START = 75;

export default function IntelGemmCompare() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CUDA vs Intel GEMM tiling comparison">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        CUDA GEMM vs Intel GEMM: Tiling 层级对照
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        思路完全相同 — 只是 API 和硬件单元名称不同
      </text>

      {/* Column headers */}
      <rect x={COL_X[0] - COL_W / 2} y={48} width={COL_W} height={22} rx={4}
        fill={COLORS.green} fillOpacity={0.1} stroke={COLORS.green} strokeWidth={1} />
      <text x={COL_X[0]} y={62} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>CUDA (NVIDIA)</text>

      <rect x={COL_X[1] - COL_W / 2} y={48} width={COL_W} height={22} rx={4}
        fill={COLORS.primary} fillOpacity={0.1} stroke={COLORS.primary} strokeWidth={1} />
      <text x={COL_X[1]} y={62} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>SYCL / DPC++ (Intel)</text>

      {/* Rows */}
      {ROWS.map((row, ri) => {
        const y = ROW_START + ri * ROW_H;
        return (
          <g key={ri}>
            {ri % 2 === 0 && (
              <rect x={0} y={y} width={W} height={ROW_H} fill="#fafbfc" />
            )}
            {/* Level label */}
            <text x={18} y={y + ROW_H / 2} fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {row.level}
            </text>
            {/* CUDA cell */}
            {row.cuda.split('\n').map((line, li) => (
              <text key={`c-${li}`} x={COL_X[0]} y={y + ROW_H / 2 - 6 + li * 13}
                textAnchor="middle" fontSize="7.5"
                fill={li === 0 ? COLORS.dark : '#64748b'} fontFamily={FONTS.sans}>
                {line}
              </text>
            ))}
            {/* Intel cell */}
            {row.intel.split('\n').map((line, li) => (
              <text key={`i-${li}`} x={COL_X[1]} y={y + ROW_H / 2 - 6 + li * 13}
                textAnchor="middle" fontSize="7.5"
                fill={li === 0 ? COLORS.dark : '#64748b'} fontFamily={FONTS.sans}>
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* Separator */}
      <line x1={W / 2} y1={48} x2={W / 2} y2={ROW_START + ROWS.length * ROW_H}
        stroke="#e2e8f0" strokeWidth={0.5} />

      {/* Key insight */}
      <rect x={40} y={H - 40} width={500} height={30} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={W / 2} y={H - 22} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        核心相同: HBM → SLM/smem (block tile) → Register (warp/sub-group tile) → 矩阵硬件 (TC/XMX)
      </text>
    </svg>
  );
}
