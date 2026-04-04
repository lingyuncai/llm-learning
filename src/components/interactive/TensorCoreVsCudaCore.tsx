// src/components/interactive/TensorCoreVsCudaCore.tsx
// StepNavigator: CUDA Core (112 scalar ops) vs Tensor Core (1 MMA) for 4×4 matmul
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const SVG_H = 260;
const CELL = 28;
const GAP = 2;

// 4×4 matrix visualization
function Matrix4x4({
  x, y, label, fills, values,
}: {
  x: number; y: number; label: string;
  fills: string[][]; values?: number[][];
}) {
  return (
    <g>
      <text x={x + (CELL * 4 + GAP * 3) / 2} y={y - 6} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => {
          const cx = x + c * (CELL + GAP);
          const cy = y + r * (CELL + GAP);
          return (
            <g key={`${r}-${c}`}>
              <rect x={cx} y={cy} width={CELL} height={CELL} rx={3}
                fill={fills[r][c]} stroke="#94a3b8" strokeWidth={0.5} />
              {values && (
                <text x={cx + CELL / 2} y={cy + CELL / 2} textAnchor="middle"
                  dominantBaseline="middle" fontSize="8" fill={COLORS.dark}
                  fontFamily={FONTS.mono}>
                  {values[r][c]}
                </text>
              )}
            </g>
          );
        })
      )}
    </g>
  );
}

// Simple values for demo
const A = [[1, 2, 3, 0], [0, 1, 2, 3], [3, 0, 1, 2], [2, 3, 0, 1]];
const B = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0], [0, 0, 1, 1]];
// C = A×B (verified)
const C = [
  [4, 5, 1, 2], [2, 3, 3, 4], [4, 1, 5, 2], [2, 3, 3, 4],
];

const EMPTY = '#f8fafc';
const DONE = '#dcfce7';
const TC_DONE = '#e8d5f5';

function makeGrid(fill: string): string[][] {
  return Array.from({ length: 4 }, () => Array(4).fill(fill));
}

// For CUDA Core step: show partial fill — first N elements filled
function cudaFills(doneCount: number): string[][] {
  const grid = makeGrid(EMPTY);
  let count = 0;
  for (let r = 0; r < 4 && count < doneCount; r++) {
    for (let c = 0; c < 4 && count < doneCount; c++) {
      grid[r][c] = DONE;
      count++;
    }
  }
  return grid;
}

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Operation counter box
function OpsCounter({ x, y, current, total, color }: {
  x: number; y: number; current: number; total: number; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={100} height={30} rx={5}
        fill="white" stroke={color} strokeWidth={1.5} />
      <text x={x + 50} y={y + 12} textAnchor="middle"
        fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
        操作计数
      </text>
      <text x={x + 50} y={y + 24} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={color} fontFamily={FONTS.mono}>
        {current} / {total}
      </text>
    </g>
  );
}

const steps = [
  {
    title: '矩阵乘法 C = A × B (4×4)',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          目标: 计算 C(4×4) = A(4×4) × B(4×4) — 需要多少次操作?
        </text>
        <Matrix4x4 x={30} y={50} label="A (4×4)" fills={makeGrid('#dbeafe')} values={A} />
        <text x={W / 2 - 30} y={120} fontSize="20" fill={COLORS.dark} fontFamily={FONTS.sans}>×</text>
        <Matrix4x4 x={210} y={50} label="B (4×4)" fills={makeGrid('#dcfce7')} values={B} />
        <text x={W / 2 + 80} y={120} fontSize="20" fill={COLORS.dark} fontFamily={FONTS.sans}>=</text>
        <Matrix4x4 x={390} y={50} label="C (4×4)" fills={makeGrid(EMPTY)} />
        <text x={W / 2} y={200} textAnchor="middle" fontSize="10" fill="#64748b"
          fontFamily={FONTS.sans}>
          每个输出元素 C[i][j] = 4 次乘法 + 3 次加法 = 7 次操作
        </text>
        <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fill="#64748b"
          fontFamily={FONTS.sans}>
          16 个输出元素 × 7 = 112 次标量操作（实际为 64 次乘法 + 48 次加法）
        </text>
        <text x={W / 2} y={245} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          CUDA Core: 逐个标量操作 → 112 次 | Tensor Core: 一条 MMA 指令 → 1 次
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'CUDA Core 路径 — 112 次标量操作',
    content: (
      <StepSvg>
        {/* Left: CUDA Core */}
        <text x={W / 4} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          CUDA Core 路径
        </text>
        <text x={W / 4} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          逐元素: 每个 C[i][j] 需要 4 次乘 + 3 次加
        </text>
        {/* Show output matrix partially filled */}
        <Matrix4x4 x={50} y={50} label="C — 逐个计算中..." fills={cudaFills(6)} values={C} />
        <OpsCounter x={90} y={180} current={42} total={112} color={COLORS.primary} />
        {/* Equation for current element */}
        <text x={W / 4} y={235} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.mono}>
          C[1][1] = A[1][0]×B[0][1] + A[1][1]×B[1][1] + A[1][2]×B[2][1] + A[1][3]×B[3][1]
        </text>

        {/* Divider */}
        <line x1={W / 2} y1={10} x2={W / 2} y2={SVG_H - 10}
          stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />

        {/* Right: result if Tensor Core */}
        <text x={W * 3 / 4} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.purple} fontFamily={FONTS.sans}>
          Tensor Core 路径
        </text>
        <text x={W * 3 / 4} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          一条 MMA 指令: D = A · B + C
        </text>
        <Matrix4x4 x={W / 2 + 60} y={50} label="C — 已完成" fills={makeGrid(TC_DONE)} values={C} />
        <OpsCounter x={W / 2 + 100} y={180} current={1} total={1} color={COLORS.purple} />
        <text x={W * 3 / 4} y={235} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.mono}>
          mma.sync.aligned.m4n4k4 — 一条指令完成整块矩阵乘
        </text>
      </StepSvg>
    ),
  },
  {
    title: '吞吐量差距 — 一个数量级',
    content: (
      <StepSvg>
        <text x={W / 2} y={24} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          H100 SXM 理论峰值对比
        </text>

        {/* CUDA Core bar */}
        <rect x={120} y={50} width={120} height={36} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={60} y={72} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          CUDA Core
        </text>
        <text x={180} y={64} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.mono}>
          ~67 TFLOPS
        </text>
        <text x={250} y={72} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          FP32
        </text>

        {/* Tensor Core bar — much wider */}
        <rect x={120} y={100} width={400} height={36} rx={5}
          fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1.5} />
        <text x={60} y={122} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.purple} fontFamily={FONTS.sans}>
          Tensor Core
        </text>
        <text x={320} y={114} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700" fill={COLORS.purple} fontFamily={FONTS.mono}>
          ~990 TFLOPS
        </text>
        <text x={530} y={122} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          FP16
        </text>

        {/* Ratio */}
        <text x={W / 2} y={160} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Tensor Core 吞吐量约为 CUDA Core 的 15 倍（FP16 vs FP32）
        </text>

        {/* Why it matters */}
        <rect x={40} y={180} width={W - 80} height={60} rx={6}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={200} textAnchor="middle" fontSize="10" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          AI 训练和推理中 90%+ 的计算量是矩阵乘法
        </text>
        <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Tensor Core / XMX 等专用单元让这些计算快一个数量级
        </text>
        <text x={W / 2} y={236} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          关键: 它们内部都是 Systolic Array（脉动阵列）的变体 → 下一节详解
        </text>
      </StepSvg>
    ),
  },
];

export default function TensorCoreVsCudaCore() {
  return <StepNavigator steps={steps} />;
}
