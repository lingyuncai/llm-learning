// src/components/interactive/DualPipeOverlap.tsx
// StepNavigator: serial vs dual-pipe overlapped Tensor Core + CUDA Core execution
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

type Locale = 'zh' | 'en';

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

const steps = (locale: Locale) => {
  const t = {
    zh: {
      step1Title: '串行执行 (baseline)',
      step1Header: '传统串行: GEMM (Tensor Core) → Element-wise (CUDA Core) → GEMM → ...',
      gemmLayer1: 'GEMM Layer 1',
      gemmLayer2: 'GEMM Layer 2',
      idle: '(空闲)',
      actNorm: 'Act/Norm',
      totalTime: '总时间 = GEMM + Act/Norm + GEMM + Act/Norm（串行叠加）',
      problem: '问题: Tensor Core 和 CUDA Core 交替空闲，SM 利用率低',
      problemDetail: 'GEMM 期间 CUDA Core 空闲 | Act/Norm 期间 Tensor Core 空闲',
      step2Title: 'Dual-Pipe 重叠执行',
      step2Header: 'Dual-Pipe: 不同 micro-batch 的 GEMM 与 Act/Norm 重叠执行',
      gemmBatchA: 'GEMM (batch A)',
      gemmBatchB: 'GEMM (batch B)',
      gemmBatchC: 'GEMM (batch C)',
      actNormA: 'Act/Norm (A)',
      actNormB: 'Act/Norm (B)',
      noPrevBatch: '(无前序 batch)',
      overlapExec: '重叠执行',
      shorterTime: '总时间缩短: Act/Norm 被"藏"在 GEMM 执行期间',
      keyCondition: '关键: 不同 micro-batch 之间无数据依赖 — batch B 的 GEMM 和 batch A 的 Act/Norm 操作不同数据',
      independentUnits: 'Tensor Core 和 CUDA Core 是独立功能单元，可同时处理不同 batch 的不同阶段',
      step3Title: 'DeepSeek V3 实践',
      step3Header: '实战: DeepSeek V3/R1 FP8 训练中的 Dual-Pipe 优化',
      moeLayer: 'DeepSeek V3 MoE (Mixture of Experts) 层',
      expertGemm: 'Expert GEMM (FP8)',
      expertGemmSub: 'Tensor Core — 主要计算',
      gateTopK: 'Gate / TopK / Norm',
      gateTopKSub: 'CUDA Core — element-wise',
      overlapResult: '重叠执行',
      keyInnovation: '关键创新: FP8 量化 + Dual-Pipe 调度',
      keyInnovationDetail: 'FP8 GEMM 在 Tensor Core 上执行 → 同时 CUDA Core 做 FP32 的 gate 计算和 normalization → SM 利用率提升',
      generalApplication: 'Dual-pipe 不仅限于 DeepSeek — 任何"GEMM + element-wise"交替的网络都能受益',
      transformerExample: '例: Transformer 中的 QKV projection (GEMM) + LayerNorm (element-wise) + FFN (GEMM) + GELU (element-wise)',
      reference: '参考: DeepSeek-V3 Technical Report, Section 3.3',
    },
    en: {
      step1Title: 'Serial Execution (baseline)',
      step1Header: 'Traditional Serial: GEMM (Tensor Core) → Element-wise (CUDA Core) → GEMM → ...',
      gemmLayer1: 'GEMM Layer 1',
      gemmLayer2: 'GEMM Layer 2',
      idle: '(Idle)',
      actNorm: 'Act/Norm',
      totalTime: 'Total time = GEMM + Act/Norm + GEMM + Act/Norm (serial accumulation)',
      problem: 'Problem: Tensor Core and CUDA Core idle alternately, low SM utilization',
      problemDetail: 'CUDA Core idle during GEMM | Tensor Core idle during Act/Norm',
      step2Title: 'Dual-Pipe Overlapped Execution',
      step2Header: 'Dual-Pipe: GEMM and Act/Norm of different micro-batches overlap',
      gemmBatchA: 'GEMM (batch A)',
      gemmBatchB: 'GEMM (batch B)',
      gemmBatchC: 'GEMM (batch C)',
      actNormA: 'Act/Norm (A)',
      actNormB: 'Act/Norm (B)',
      noPrevBatch: '(No prev batch)',
      overlapExec: 'Overlapped',
      shorterTime: 'Shorter total time: Act/Norm hidden in GEMM execution',
      keyCondition: 'Key: No data dependency between micro-batches — batch B GEMM and batch A Act/Norm operate on different data',
      independentUnits: 'Tensor Core and CUDA Core are independent units, can process different stages of different batches simultaneously',
      step3Title: 'DeepSeek V3 Practice',
      step3Header: 'In Practice: Dual-Pipe optimization in DeepSeek V3/R1 FP8 training',
      moeLayer: 'DeepSeek V3 MoE (Mixture of Experts) Layer',
      expertGemm: 'Expert GEMM (FP8)',
      expertGemmSub: 'Tensor Core — main compute',
      gateTopK: 'Gate / TopK / Norm',
      gateTopKSub: 'CUDA Core — element-wise',
      overlapResult: 'Overlapped',
      keyInnovation: 'Key Innovation: FP8 quantization + Dual-Pipe scheduling',
      keyInnovationDetail: 'FP8 GEMM on Tensor Core → simultaneously CUDA Core does FP32 gate compute and normalization → SM utilization boost',
      generalApplication: 'Dual-pipe not limited to DeepSeek — any network with alternating "GEMM + element-wise" benefits',
      transformerExample: 'e.g. Transformer: QKV projection (GEMM) + LayerNorm (element-wise) + FFN (GEMM) + GELU (element-wise)',
      reference: 'Reference: DeepSeek-V3 Technical Report, Section 3.3',
    },
  }[locale];

  return [
  {
    title: t.step1Title,
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step1Header}
        </text>

        <TrackLabel x={88} y={60} label="Tensor Core" />
        <TrackLabel x={88} y={100} label="CUDA Core" />
        <TimeAxis x={94} y={130} w={440} label="time" />

        {/* Layer 1 */}
        <Bar x={100} y={44} w={120} h={30}
          label={t.gemmLayer1} sublabel="Tensor Core" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={100} y={84} w={120} h={30}
          label={t.idle} color="#94a3b8" bg={IDLE_BG} />

        {/* Elem-wise 1 */}
        <Bar x={224} y={44} w={60} h={30}
          label={t.idle} color="#94a3b8" bg={IDLE_BG} />
        <Bar x={224} y={84} w={60} h={30}
          label={t.actNorm} sublabel="CUDA Core" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Layer 2 */}
        <Bar x={288} y={44} w={120} h={30}
          label={t.gemmLayer2} sublabel="Tensor Core" color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={288} y={84} w={120} h={30}
          label={t.idle} color="#94a3b8" bg={IDLE_BG} />

        {/* Elem-wise 2 */}
        <Bar x={412} y={44} w={60} h={30}
          label={t.idle} color="#94a3b8" bg={IDLE_BG} />
        <Bar x={412} y={84} w={60} h={30}
          label={t.actNorm} sublabel="CUDA Core" color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Total time */}
        <line x1={100} y1={145} x2={472} y2={145}
          stroke={COLORS.red} strokeWidth={1.5} />
        <text x={286} y={158} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          {t.totalTime}
        </text>

        {/* Problem annotation */}
        <rect x={80} y={170} width={400} height={36} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={280} y={186} textAnchor="middle" fontSize="9" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          {t.problem}
        </text>
        <text x={280} y={200} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.problemDetail}
        </text>
      </StepSvg>
    ),
  },
  {
    title: t.step2Title,
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step2Header}
        </text>

        <TrackLabel x={88} y={60} label="Tensor Core" />
        <TrackLabel x={88} y={100} label="CUDA Core" />
        <TimeAxis x={94} y={130} w={380} label="time" />

        {/* Batch A GEMM */}
        <Bar x={100} y={44} w={120} h={30}
          label={t.gemmBatchA} color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={100} y={84} w={120} h={30}
          label={t.noPrevBatch} color="#94a3b8" bg={IDLE_BG} />

        {/* Batch B GEMM + Batch A Act overlapped */}
        <Bar x={224} y={44} w={120} h={30}
          label={t.gemmBatchB} color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={224} y={84} w={60} h={30}
          label={t.actNormA} color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Batch C GEMM + Batch B Act overlapped */}
        <Bar x={348} y={44} w={120} h={30}
          label={t.gemmBatchC} color={GEMM_COLOR} bg={GEMM_BG} />
        <Bar x={348} y={84} w={60} h={30}
          label={t.actNormB} color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Overlap highlight */}
        <rect x={224} y={40} width={120} height={80} rx={4}
          fill="none" stroke={COLORS.orange} strokeWidth={2} strokeDasharray="4 2" />
        <text x={284} y={135} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          {t.overlapExec}
        </text>

        {/* Shorter total time */}
        <line x1={100} y1={150} x2={468} y2={150}
          stroke={COLORS.green} strokeWidth={1.5} />
        <text x={284} y={164} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.shorterTime}
        </text>

        {/* Condition */}
        <rect x={60} y={178} width={440} height={44} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={280} y={194} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          {t.keyCondition}
        </text>
        <text x={280} y={210} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.independentUnits}
        </text>
      </StepSvg>
    ),
  },
  {
    title: t.step3Title,
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step3Header}
        </text>

        {/* DeepSeek architecture */}
        <rect x={30} y={40} width={500} height={90} rx={6}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={280} y={58} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.moeLayer}
        </text>

        {/* GEMM: FP8 on Tensor Core */}
        <Bar x={50} y={68} w={140} h={32}
          label={t.expertGemm} sublabel={t.expertGemmSub}
          color={GEMM_COLOR} bg={GEMM_BG} />

        {/* Overlap arrow */}
        <text x={210} y={88} fontSize="14" fill={COLORS.orange}>+</text>

        {/* Element-wise on CUDA Core */}
        <Bar x={230} y={68} w={140} h={32}
          label={t.gateTopK} sublabel={t.gateTopKSub}
          color={ELEM_COLOR} bg={ELEM_BG} />

        {/* Arrow to overlap */}
        <text x={390} y={88} fontSize="14" fill={COLORS.orange}>→</text>
        <Bar x={410} y={68} w={100} h={32}
          label={t.overlapResult} color={COLORS.orange} bg="#fff7ed" />

        {/* Key insight */}
        <rect x={30} y={142} width={500} height={50} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={280} y={160} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.keyInnovation}
        </text>
        <text x={280} y={178} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.keyInnovationDetail}
        </text>

        {/* Additional notes */}
        <text x={W / 2} y={210} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          {t.generalApplication}
        </text>
        <text x={W / 2} y={228} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.transformerExample}
        </text>

        <text x={W / 2} y={252} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.sans}>
          {t.reference}
        </text>
      </StepSvg>
    ),
  },
];
};

export default function DualPipeOverlap({ locale = 'zh' }: { locale?: Locale }) {
  return <StepNavigator steps={steps(locale)} />;
}
