// src/components/interactive/TensorCoreGemmFlow.tsx
// StepNavigator: WMMA warp-level Tensor Core GEMM flow
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

// Thread register visualization (simplified)
function ThreadRegs({ x, y, w, h, label, color, bg, detail }: {
  x: number; y: number; w: number; h: number;
  label: string; color: string; bg: string; detail: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle"
        fontSize="8" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
        fontSize="6.5" fill="#64748b" fontFamily={FONTS.mono}>
        {detail}
      </text>
    </g>
  );
}

const steps = [
  {
    title: 'Step 1: load_matrix_sync — 加载 Fragment',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          WMMA Step 1: 从 Shared Memory 加载 Fragment
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          32 个线程协作将矩阵块加载到各自的寄存器中 (fragment)
        </text>

        {/* Shared memory blocks */}
        <rect x={30} y={55} width={120} height={60} rx={4}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={90} y={75} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>Shared Memory</text>
        <text x={90} y={92} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.mono}>As[16x16] + Bs[16x16]</text>

        {/* Arrows */}
        <line x1={155} y1={85} x2={210} y2={85}
          stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#tcflow-arr)" />
        <defs>
          <marker id="tcflow-arr" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.primary} />
          </marker>
        </defs>

        {/* Thread registers */}
        <rect x={215} y={50} width={340} height={80} rx={5}
          fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1} />
        <text x={385} y={66} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Warp (32 threads) — 各线程的寄存器</text>
        <ThreadRegs x={225} y={74} w={100} h={44}
          label="A fragment" color={COLORS.primary} bg="#dbeafe"
          detail="wmma::matrix_a<16,16,16,half>" />
        <ThreadRegs x={340} y={74} w={100} h={44}
          label="B fragment" color={COLORS.green} bg="#dcfce7"
          detail="wmma::matrix_b<16,16,16,half>" />
        <ThreadRegs x={455} y={74} w={90} h={44}
          label="C accumulator" color={COLORS.orange} bg="#fff7ed"
          detail="wmma::accumulator<float>" />

        {/* Code */}
        <rect x={30} y={145} width={520} height={65} rx={4}
          fill="#1e293b" />
        <text x={45} y={163} fontSize="7.5" fill="#94a3b8" fontFamily={FONTS.mono}>
          // 声明 fragment (每个线程持有矩阵的一部分)
        </text>
        <text x={45} y={179} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          wmma::fragment{'<'}wmma::matrix_a, 16, 16, 16, half, wmma::row_major{'>'} a_frag;
        </text>
        <text x={45} y={195} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          wmma::load_matrix_sync(a_frag, &As[warp_row * 16], 16);  // shared → register
        </text>

        {/* Key concept */}
        <rect x={30} y={225} width={520} height={70} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={W / 2} y={245} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Fragment 分布</text>
        <text x={60} y={265} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          16x16 = 256 个元素由 32 个线程分持: 每个线程寄存器中持有 8 个元素
        </text>
        <text x={60} y={282} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          具体哪个线程持有哪些元素由硬件决定 — 对程序员不透明 (只能通过 wmma API 操作)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: mma_sync — Tensor Core 执行矩阵乘加',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          WMMA Step 2: mma_sync — D = A * B + C
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          一条 warp 级指令，32 个线程同步发射到 Tensor Core
        </text>

        {/* Input fragments */}
        <ThreadRegs x={30} y={55} w={100} h={50}
          label="A fragment" color={COLORS.primary} bg="#dbeafe"
          detail="FP16 (16x16)" />
        <ThreadRegs x={150} y={55} w={100} h={50}
          label="B fragment" color={COLORS.green} bg="#dcfce7"
          detail="FP16 (16x16)" />
        <ThreadRegs x={440} y={55} w={110} h={50}
          label="C accumulator" color={COLORS.orange} bg="#fff7ed"
          detail="FP32 (16x16)" />

        {/* Tensor Core box */}
        <rect x={80} y={120} width={420} height={50} rx={6}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={2.5} />
        <text x={290} y={140} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          Tensor Core
        </text>
        <text x={290} y={158} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.mono}>
          D = A(FP16) * B(FP16) + C(FP32) → D(FP32)
        </text>

        {/* Arrows in */}
        <line x1={80} y1={105} x2={160} y2={120} stroke={COLORS.primary} strokeWidth={1.5} />
        <line x1={200} y1={105} x2={230} y2={120} stroke={COLORS.green} strokeWidth={1.5} />
        <line x1={495} y1={105} x2={430} y2={120} stroke={COLORS.orange} strokeWidth={1.5} />

        {/* Output */}
        <line x1={290} y1={170} x2={290} y2={195}
          stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#tcflow-arr2)" />
        <defs>
          <marker id="tcflow-arr2" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.purple} />
          </marker>
        </defs>
        <ThreadRegs x={220} y={200} w={140} h={45}
          label="D accumulator (更新后)" color={COLORS.purple} bg="#f3e8ff"
          detail="FP32 (16x16) — 在寄存器中" />

        {/* Code */}
        <rect x={30} y={260} width={520} height={30} rx={4}
          fill="#1e293b" />
        <text x={45} y={279} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          wmma::mma_sync(d_frag, a_frag, b_frag, c_frag);  // 一条 warp 级指令完成 16x16x16 乘加
        </text>

        {/* Performance note */}
        <rect x={40} y={SVG_H - 20} width={500} height={14} rx={3}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={0.5} />
        <text x={W / 2} y={SVG_H - 10} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          16x16x16 = 4096 FMA (8192 FLOPs) / 指令 vs CUDA Core 1 FMA / 指令
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: store_matrix_sync — 写回结果',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          WMMA Step 3: 累加完所有 tile 后写回
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          内循环结束后，将 accumulator fragment 存回 shared memory 或 global memory
        </text>

        {/* Flow: inner loop then store */}
        <rect x={30} y={55} width={520} height={100} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={72} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>完整 Warp 级循环</text>

        {/* Loop iterations */}
        {Array.from({ length: 4 }).map((_, i) => {
          const x = 55 + i * 125;
          const isLast = i === 3;
          return (
            <g key={i}>
              <rect x={x} y={82} width={110} height={28} rx={3}
                fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
              <text x={x + 55} y={98} textAnchor="middle" fontSize="7" fontWeight="500"
                fill={COLORS.primary} fontFamily={FONTS.mono}>
                {isLast ? '...' : `load + mma (k=${i})`}
              </text>
              {!isLast && (
                <text x={x + 117} y={98} textAnchor="middle" fontSize="8"
                  fill="#94a3b8">→</text>
              )}
            </g>
          );
        })}

        <text x={W / 2} y={130} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          d_frag 在每个 k 步累加: d = a*b + d
        </text>

        {/* Store */}
        <rect x={150} y={155} width={280} height={40} rx={5}
          fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1.5} />
        <text x={290} y={178} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.purple} fontFamily={FONTS.mono}>
          wmma::store_matrix_sync(&C[...], d_frag, N, wmma::mem_row_major)
        </text>

        <line x1={290} y1={195} x2={290} y2={215}
          stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#tcflow-arr3)" />
        <defs>
          <marker id="tcflow-arr3" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.purple} />
          </marker>
        </defs>

        <rect x={200} y={220} width={180} height={30} rx={4}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={290} y={238} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>Global Memory (C 矩阵)</text>

        {/* Summary */}
        <rect x={30} y={265} width={520} height={40} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={282} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          WMMA 三步: load_matrix_sync → mma_sync (循环) → store_matrix_sync
        </text>
        <text x={W / 2} y={298} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          仍然需要 Block 级 tiling (shared memory) — Tensor Core 只是替换了最内层计算单元
        </text>
      </StepSvg>
    ),
  },
];

export default function TensorCoreGemmFlow() {
  return <StepNavigator steps={steps} />;
}
