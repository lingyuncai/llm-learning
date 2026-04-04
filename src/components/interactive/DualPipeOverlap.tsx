// src/components/interactive/DualPipeOverlap.tsx
// StepNavigator: serial vs dual-pipe overlapped Tensor Core + CUDA Core execution
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const SVG_H = 260;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Timeline bar
function Bar({ x, y, w, h, label, sublabel, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={sublabel ? y + h / 2 - 4 : y + h / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

// Track label
function TrackLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text x={x} y={y} textAnchor="end" dominantBaseline="middle"
      fontSize="8" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
      {label}
    </text>
  );
}

// Time axis
function TimeAxis({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + w} y2={y} stroke="#cbd5e1" strokeWidth={1} />
      <text x={x + w + 8} y={y} dominantBaseline="middle"
        fontSize="7" fill="#94a3b8" fontFamily={FONTS.sans}>
        {label}
      </text>
      {/* tick marks */}
      {Array.from({ length: Math.floor(w / 40) + 1 }).map((_, i) => (
        <line key={i} x1={x + i * 40} y1={y - 3} x2={x + i * 40} y2={y + 3}
          stroke="#cbd5e1" strokeWidth={1} />
      ))}
    </g>
  );
}

const GEMM_COLOR = COLORS.purple;
const GEMM_BG = '#f3e8ff';
const ELEM_COLOR = COLORS.green;
const ELEM_BG = '#dcfce7';
const IDLE_BG = '#f1f5f9';

const steps = [
  {
    title: '串行执行 (baseline)',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          传统串行: GEMM (Tensor Core) → Element-wise (CUDA Core) → GEMM → ...
        </text>

        <TrackLabel x={88} y={60} label="Tensor Core" />
        <TrackLabel x={88} y={100} label="CUDA Core" />
        <TimeAxis x={94} y={130} w={440} label="time" />

        {/* Layer 1 */}
        <Bar x={100} y={44} w={120} h={30}
          label="GEMM Layer 1" sublabel="Tensor Core" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={100} y={84} w={120} h={30}
          label="(空闲)" color="#94a3b8" bg={IDLE_BG} />

        {/* Elem-wise 1 */}
        <Bar x={224} y={44} w={60} h={30}
          label="(空闲)" color="#94a3b8" bg={IDLE_BG} />
        <Bar x={224} y={84} w={60} h={30}
          label="Act/Norm" sublabel="CUDA Core" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Layer 2 */}
        <Bar x={288} y={44} w={120} h={30}
          label="GEMM Layer 2" sublabel="Tensor Core" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={288} y={84} w={120} h={30}
          label="(空闲)" color="#94a3b8" bg={IDLE_BG} />

        {/* Elem-wise 2 */}
        <Bar x={412} y={44} w={60} h={30}
          label="(空闲)" color="#94a3b8" bg={IDLE_BG} />
        <Bar x={412} y={84} w={60} h={30}
          label="Act/Norm" sublabel="CUDA Core" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Total time */}
        <line x1={100} y1={145} x2={472} y2={145}
          stroke={COLORS.red} strokeWidth={1.5} />
        <text x={286} y={158} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          总时间 = GEMM + Act/Norm + GEMM + Act/Norm（串行叠加）
        </text>

        {/* Problem annotation */}
        <rect x={80} y={170} width={400} height={36} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={280} y={186} textAnchor="middle" fontSize="9" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          问题: Tensor Core 和 CUDA Core 交替空闲，SM 利用率低
        </text>
        <text x={280} y={200} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          GEMM 期间 CUDA Core 空闲 | Act/Norm 期间 Tensor Core 空闲
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Dual-Pipe 重叠执行',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Dual-Pipe: 当前层 GEMM 与上一层 Act/Norm 重叠执行
        </text>

        <TrackLabel x={88} y={60} label="Tensor Core" />
        <TrackLabel x={88} y={100} label="CUDA Core" />
        <TimeAxis x={94} y={130} w={380} label="time" />

        {/* Layer 1 GEMM */}
        <Bar x={100} y={44} w={120} h={30}
          label="GEMM Layer 1" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={100} y={84} w={120} h={30}
          label="(无前序 Act)" color="#94a3b8" bg={IDLE_BG} />

        {/* Layer 2 GEMM + Layer 1 Act overlapped */}
        <Bar x={224} y={44} w={120} h={30}
          label="GEMM Layer 2" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={224} y={84} w={60} h={30}
          label="Act/Norm L1" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Layer 3 GEMM + Layer 2 Act overlapped */}
        <Bar x={348} y={44} w={120} h={30}
          label="GEMM Layer 3" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={348} y={84} w={60} h={30}
          label="Act/Norm L2" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Overlap highlight */}
        <rect x={224} y={40} width={120} height={80} rx={4}
          fill="none" stroke={COLORS.orange} strokeWidth={2} strokeDasharray="4 2" />
        <text x={284} y={135} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          重叠执行
        </text>

        {/* Shorter total time */}
        <line x1={100} y1={150} x2={468} y2={150}
          stroke={COLORS.green} strokeWidth={1.5} />
        <text x={284} y={164} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          总时间缩短: Act/Norm 被"藏"在 GEMM 执行期间
        </text>

        {/* Condition */}
        <rect x={60} y={178} width={440} height={44} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={280} y={194} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          前提条件: 两组操作之间没有数据依赖（Layer N 的 Act/Norm 用 Layer N 的 GEMM 输出）
        </text>
        <text x={280} y={210} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          Layer N+1 的 GEMM 用 Layer N 的 Act/Norm 输出 → 无依赖冲突，可以重叠
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'DeepSeek V3 实践',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          实战: DeepSeek V3/R1 FP8 训练中的 Dual-Pipe 优化
        </text>

        {/* DeepSeek architecture */}
        <rect x={30} y={40} width={500} height={90} rx={6}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={280} y={58} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          DeepSeek V3 MoE (Mixture of Experts) 层
        </text>

        {/* GEMM: FP8 on Tensor Core */}
        <Bar x={50} y={68} w={140} h={32}
          label="Expert GEMM (FP8)" sublabel="Tensor Core — 主要计算"
          color={GEMM_COLOR} bg={GEMM_BG} />

        {/* Overlap arrow */}
        <text x={210} y={88} fontSize="14" fill={COLORS.orange}>+</text>

        {/* Element-wise on CUDA Core */}
        <Bar x={230} y={68} w={140} h={32}
          label="Gate / TopK / Norm" sublabel="CUDA Core — element-wise"
          color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Arrow to overlap */}
        <text x={390} y={88} fontSize="14" fill={COLORS.orange}>→</text>
        <Bar x={410} y={68} w={100} h={32}
          label="重叠执行" color={COLORS.orange} bg="#fff7ed" />

        {/* Key insight */}
        <rect x={30} y={142} width={500} height={50} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={280} y={160} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          关键创新: FP8 量化 + Dual-Pipe 调度
        </text>
        <text x={280} y={178} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          FP8 GEMM 在 Tensor Core 上执行 → 同时 CUDA Core 做 FP32 的 gate 计算和 normalization → SM 利用率提升
        </text>

        {/* Additional notes */}
        <text x={W / 2} y={210} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Dual-pipe 不仅限于 DeepSeek — 任何"GEMM + element-wise"交替的网络都能受益
        </text>
        <text x={W / 2} y={228} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          例: Transformer 中的 QKV projection (GEMM) + LayerNorm (element-wise) + FFN (GEMM) + GELU (element-wise)
        </text>

        <text x={W / 2} y={252} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.sans}>
          参考: DeepSeek-V3 Technical Report, Section 3.3
        </text>
      </StepSvg>
    ),
  },
];

export default function DualPipeOverlap() {
  return <StepNavigator steps={steps} />;
}
