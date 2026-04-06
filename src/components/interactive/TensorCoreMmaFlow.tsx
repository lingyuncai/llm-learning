// src/components/interactive/TensorCoreMmaFlow.tsx
// StepNavigator: warp-level MMA operation data flow
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const SVG_H = 280;

// Arrow marker defs — rendered once in StepSvg, not per FlowArrow
const ARROW_COLORS = [COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple];

function ArrowDefs() {
  return (
    <defs>
      {ARROW_COLORS.map(color => (
        <marker key={color} id={`mma-arrow-${color.replace('#', '')}`}
          viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      <ArrowDefs />
      {children}
    </svg>
  );
}

// Draw a row of thread boxes
function ThreadRow({ x, y, count, highlightRange, label, color }: {
  x: number; y: number; count: number; highlightRange?: [number, number];
  label: string; color: string;
}) {
  const boxW = 14;
  const gap = 1;
  return (
    <g>
      <text x={x} y={y - 6} fontSize="8" fontWeight="600" fill={color}
        fontFamily={FONTS.sans}>{label}</text>
      {Array.from({ length: count }).map((_, i) => {
        const bx = x + i * (boxW + gap);
        const inRange = highlightRange && i >= highlightRange[0] && i <= highlightRange[1];
        return (
          <rect key={i} x={bx} y={y} width={boxW} height={boxW} rx={2}
            fill={inRange ? color : '#f1f5f9'} opacity={inRange ? 0.3 : 1}
            stroke={inRange ? color : '#cbd5e1'} strokeWidth={inRange ? 1.5 : 0.5} />
        );
      })}
    </g>
  );
}

// Fragment visualization: a matrix block with label
function Fragment({ x, y, w, h, label, sublabel, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - 5} textAnchor="middle"
        dominantBaseline="middle" fontSize="10" fontWeight="700"
        fill={color} fontFamily={FONTS.sans}>{label}</text>
      <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
        fontSize="7" fill="#64748b" fontFamily={FONTS.mono}>{sublabel}</text>
    </g>
  );
}

// Arrow with label
function FlowArrow({ x1, y1, x2, y2, label, color }: {
  x1: number; y1: number; x2: number; y2: number; label?: string; color: string;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={1.5}
        markerEnd={`url(#mma-arrow-${color.replace('#', '')})`} />
      {label && (
        <text x={mx} y={my - 4} textAnchor="middle" fontSize="7"
          fill={color} fontFamily={FONTS.sans}>{label}</text>
      )}
    </g>
  );
}

const steps = [
  {
    title: '线程持有 Fragment',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 1: Warp 内 32 个线程各持有矩阵片段（Fragment）
        </text>

        {/* Warp: 32 threads */}
        <ThreadRow x={40} y={44} count={32} label="Warp (32 threads)" color={COLORS.dark}
          highlightRange={[0, 31]} />

        {/* Three fragment groups */}
        <text x={W / 2} y={80} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          wmma::fragment — 矩阵块分布在 32 个线程的寄存器中
        </text>

        <Fragment x={30} y={95} w={140} h={50}
          label="Fragment A" sublabel="16×16 FP16 — 每线程 8 元素"
          color={COLORS.primary} bg="#dbeafe" />
        <Fragment x={210} y={95} w={140} h={50}
          label="Fragment B" sublabel="16×16 FP16 — 每线程 8 元素"
          color={COLORS.green} bg="#dcfce7" />
        <Fragment x={390} y={95} w={140} h={50}
          label="Fragment C (累加器)" sublabel="16×16 FP32 — 每线程 8 元素"
          color={COLORS.orange} bg="#fff7ed" />

        {/* Thread register detail */}
        <rect x={80} y={160} width={400} height={50} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={280} y={176} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Thread 0 的寄存器: A 的 8 个 FP16 元素 + B 的 8 个 FP16 元素 + C 的 8 个 FP32 元素
        </text>
        <text x={280} y={192} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          32 个线程合起来 = 完整的 16×16 矩阵块（每个线程只看到自己的一小部分）
        </text>

        <text x={W / 2} y={240} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.mono}>
          wmma::load_matrix_sync(frag_a, A_ptr, lda);
        </text>
        <text x={W / 2} y={254} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.mono}>
          wmma::load_matrix_sync(frag_b, B_ptr, ldb);
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'MMA 指令执行',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 2: Warp 发射 MMA 指令 → Tensor Core 执行矩阵乘累加
        </text>

        {/* Fragments flow into Tensor Core */}
        <Fragment x={30} y={50} w={100} h={40}
          label="Frag A" sublabel="16×16 FP16"
          color={COLORS.primary} bg="#dbeafe" />
        <Fragment x={430} y={50} w={100} h={40}
          label="Frag B" sublabel="16×16 FP16"
          color={COLORS.green} bg="#dcfce7" />

        <FlowArrow x1={130} y1={70} x2={200} y2={120} color={COLORS.primary} label="A" />
        <FlowArrow x1={430} y1={70} x2={360} y2={120} color={COLORS.green} label="B" />

        {/* Tensor Core box */}
        <rect x={200} y={100} width={160} height={70} rx={8}
          fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={2} />
        <text x={280} y={124} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.purple} fontFamily={FONTS.sans}>
          Tensor Core
        </text>
        <text x={280} y={142} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          D(16×16) = A(16×16) × B(16×16) + C(16×16)
        </text>
        <text x={280} y={156} textAnchor="middle" fontSize="8" fill="#94a3b8"
          fontFamily={FONTS.sans}>
          内部: systolic array 执行矩阵乘累加
        </text>

        {/* Accumulator input */}
        <Fragment x={230} y={185} w={100} h={34}
          label="Frag C" sublabel="累加器 FP32"
          color={COLORS.orange} bg="#fff7ed" />
        <FlowArrow x1={280} y1={185} x2={280} y2={172} color={COLORS.orange} label="C (累加)" />

        {/* PTX instruction */}
        <rect x={60} y={235} width={440} height={24} rx={4}
          fill="#1a1a2e" stroke="none" />
        <text x={280} y={250} textAnchor="middle" fontSize="8" fill="#a5f3fc"
          fontFamily={FONTS.mono}>
          wmma::mma_sync(frag_d, frag_a, frag_b, frag_c);  // m16n16k16
        </text>
      </StepSvg>
    ),
  },
  {
    title: '输出分发回线程',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 3: 输出 Fragment D 分发回 32 个线程的寄存器
        </text>

        {/* Tensor Core output */}
        <rect x={180} y={44} width={200} height={46} rx={6}
          fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1.5} />
        <text x={280} y={62} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.purple} fontFamily={FONTS.sans}>
          Tensor Core 输出 D (16×16 FP32)
        </text>
        <text x={280} y={78} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          D = A × B + C
        </text>

        {/* Distribution arrows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <FlowArrow key={i}
            x1={200 + i * 40} y1={92}
            x2={40 + i * 120} y2={112}
            color={COLORS.purple} />
        ))}

        {/* Thread boxes showing output */}
        <ThreadRow x={40} y={118} count={32} label="Warp (32 threads) — 每线程收到 D 的 8 个 FP32 元素"
          color={COLORS.purple} highlightRange={[0, 31]} />

        {/* Output fragment */}
        <Fragment x={130} y={155} w={300} h={44}
          label="Fragment D (输出)" sublabel="16×16 FP32 分布在 32 个线程寄存器中"
          color={COLORS.purple} bg="#f3e8ff" />

        {/* Store instruction */}
        <rect x={60} y={215} width={440} height={24} rx={4}
          fill="#1a1a2e" stroke="none" />
        <text x={280} y={230} textAnchor="middle" fontSize="8" fill="#a5f3fc"
          fontFamily={FONTS.mono}>
          wmma::store_matrix_sync(D_ptr, frag_d, ldd, wmma::mem_row_major);
        </text>

        {/* Summary */}
        <text x={W / 2} y={260} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          整个过程: load fragments → mma_sync → store fragments。Warp 的 32 个线程协作完成一次 16×16 矩阵乘
        </text>
      </StepSvg>
    ),
  },
];

export default function TensorCoreMmaFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      threadHoldFrag: '线程持有 Fragment',
      step1Main: 'Step 1: Warp 内 32 个线程各持有矩阵片段（Fragment）',
      warpLabel: 'Warp (32 threads)',
      fragDesc: 'wmma::fragment — 矩阵块分布在 32 个线程的寄存器中',
      fragALabel: 'Fragment A',
      fragASub: '16×16 FP16 — 每线程 8 元素',
      fragBLabel: 'Fragment B',
      fragBSub: '16×16 FP16 — 每线程 8 元素',
      fragCLabel: 'Fragment C (累加器)',
      fragCSub: '16×16 FP32 — 每线程 8 元素',
      thread0Regs: 'Thread 0 的寄存器: A 的 8 个 FP16 元素 + B 的 8 个 FP16 元素 + C 的 8 个 FP32 元素',
      threadsForm: '32 个线程合起来 = 完整的 16×16 矩阵块（每个线程只看到自己的一小部分）',
      mmaExec: 'MMA 指令执行',
      step2Main: 'Step 2: Warp 发射 MMA 指令 → Tensor Core 执行矩阵乘累加',
      tensorCore: 'Tensor Core',
      tensorCoreOp: 'D(16×16) = A(16×16) × B(16×16) + C(16×16)',
      internalSystolic: '内部: systolic array 执行矩阵乘累加',
      fragCAccum: 'Frag C',
      accumFP32: '累加器 FP32',
      cAccumLabel: 'C (累加)',
      outputDist: '输出分发回线程',
      step3Main: 'Step 3: 输出 Fragment D 分发回 32 个线程的寄存器',
      tensorCoreOutput: 'Tensor Core 输出 D (16×16 FP32)',
      warpRecv: 'Warp (32 threads) — 每线程收到 D 的 8 个 FP32 元素',
      fragDLabel: 'Fragment D (输出)',
      fragDSub: '16×16 FP32 分布在 32 个线程寄存器中',
      fullProcess: '整个过程: load fragments → mma_sync → store fragments。Warp 的 32 个线程协作完成一次 16×16 矩阵乘',
    },
    en: {
      threadHoldFrag: 'Threads Hold Fragments',
      step1Main: 'Step 1: 32 threads in Warp each hold matrix fragment',
      warpLabel: 'Warp (32 threads)',
      fragDesc: 'wmma::fragment — matrix block distributed across 32 thread registers',
      fragALabel: 'Fragment A',
      fragASub: '16×16 FP16 — 8 elements per thread',
      fragBLabel: 'Fragment B',
      fragBSub: '16×16 FP16 — 8 elements per thread',
      fragCLabel: 'Fragment C (accumulator)',
      fragCSub: '16×16 FP32 — 8 elements per thread',
      thread0Regs: 'Thread 0 registers: 8 FP16 elements of A + 8 FP16 elements of B + 8 FP32 elements of C',
      threadsForm: '32 threads together = complete 16×16 matrix block (each thread sees only its portion)',
      mmaExec: 'MMA Instruction Execution',
      step2Main: 'Step 2: Warp issues MMA instruction → Tensor Core executes matrix multiply-accumulate',
      tensorCore: 'Tensor Core',
      tensorCoreOp: 'D(16×16) = A(16×16) × B(16×16) + C(16×16)',
      internalSystolic: 'Internal: systolic array performs matrix multiply-accumulate',
      fragCAccum: 'Frag C',
      accumFP32: 'accumulator FP32',
      cAccumLabel: 'C (accum)',
      outputDist: 'Output Distributed to Threads',
      step3Main: 'Step 3: Output Fragment D distributed back to 32 thread registers',
      tensorCoreOutput: 'Tensor Core output D (16×16 FP32)',
      warpRecv: 'Warp (32 threads) — each thread receives 8 FP32 elements of D',
      fragDLabel: 'Fragment D (output)',
      fragDSub: '16×16 FP32 distributed across 32 thread registers',
      fullProcess: 'Full process: load fragments → mma_sync → store fragments. Warp\'s 32 threads cooperate to complete one 16×16 matrix multiply',
    },
  }[locale];

  const steps = [
    {
      title: t.threadHoldFrag,
      content: (
        <StepSvg>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step1Main}
          </text>

          {/* Warp: 32 threads */}
          <ThreadRow x={40} y={44} count={32} label={t.warpLabel} color={COLORS.dark}
            highlightRange={[0, 31]} />

          {/* Three fragment groups */}
          <text x={W / 2} y={80} textAnchor="middle" fontSize="9" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.fragDesc}
          </text>

          <Fragment x={30} y={95} w={140} h={50}
            label={t.fragALabel} sublabel={t.fragASub}
            color={COLORS.primary} bg="#dbeafe" />
          <Fragment x={210} y={95} w={140} h={50}
            label={t.fragBLabel} sublabel={t.fragBSub}
            color={COLORS.green} bg="#dcfce7" />
          <Fragment x={390} y={95} w={140} h={50}
            label={t.fragCLabel} sublabel={t.fragCSub}
            color={COLORS.orange} bg="#fff7ed" />

          {/* Thread register detail */}
          <rect x={80} y={160} width={400} height={50} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={280} y={176} textAnchor="middle" fontSize="9" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            {t.thread0Regs}
          </text>
          <text x={280} y={192} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.threadsForm}
          </text>

          <text x={W / 2} y={240} textAnchor="middle" fontSize="8" fill="#94a3b8"
            fontFamily={FONTS.mono}>
            wmma::load_matrix_sync(frag_a, A_ptr, lda);
          </text>
          <text x={W / 2} y={254} textAnchor="middle" fontSize="8" fill="#94a3b8"
            fontFamily={FONTS.mono}>
            wmma::load_matrix_sync(frag_b, B_ptr, ldb);
          </text>
        </StepSvg>
      ),
    },
    {
      title: t.mmaExec,
      content: (
        <StepSvg>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step2Main}
          </text>

          {/* Fragments flow into Tensor Core */}
          <Fragment x={30} y={50} w={100} h={40}
            label="Frag A" sublabel="16×16 FP16"
            color={COLORS.primary} bg="#dbeafe" />
          <Fragment x={430} y={50} w={100} h={40}
            label="Frag B" sublabel="16×16 FP16"
            color={COLORS.green} bg="#dcfce7" />

          <FlowArrow x1={130} y1={70} x2={200} y2={120} color={COLORS.primary} label="A" />
          <FlowArrow x1={430} y1={70} x2={360} y2={120} color={COLORS.green} label="B" />

          {/* Tensor Core box */}
          <rect x={200} y={100} width={160} height={70} rx={8}
            fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={2} />
          <text x={280} y={124} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.purple} fontFamily={FONTS.sans}>
            {t.tensorCore}
          </text>
          <text x={280} y={142} textAnchor="middle" fontSize="9" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.tensorCoreOp}
          </text>
          <text x={280} y={156} textAnchor="middle" fontSize="8" fill="#94a3b8"
            fontFamily={FONTS.sans}>
            {t.internalSystolic}
          </text>

          {/* Accumulator input */}
          <Fragment x={230} y={185} w={100} h={34}
            label={t.fragCAccum} sublabel={t.accumFP32}
            color={COLORS.orange} bg="#fff7ed" />
          <FlowArrow x1={280} y1={185} x2={280} y2={172} color={COLORS.orange} label={t.cAccumLabel} />

          {/* PTX instruction */}
          <rect x={60} y={235} width={440} height={24} rx={4}
            fill="#1a1a2e" stroke="none" />
          <text x={280} y={250} textAnchor="middle" fontSize="8" fill="#a5f3fc"
            fontFamily={FONTS.mono}>
            wmma::mma_sync(frag_d, frag_a, frag_b, frag_c);  // m16n16k16
          </text>
        </StepSvg>
      ),
    },
    {
      title: t.outputDist,
      content: (
        <StepSvg>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step3Main}
          </text>

          {/* Tensor Core output */}
          <rect x={180} y={44} width={200} height={46} rx={6}
            fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1.5} />
          <text x={280} y={62} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.purple} fontFamily={FONTS.sans}>
            {t.tensorCoreOutput}
          </text>
          <text x={280} y={78} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            D = A × B + C
          </text>

          {/* Distribution arrows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <FlowArrow key={i}
              x1={200 + i * 40} y1={92}
              x2={40 + i * 120} y2={112}
              color={COLORS.purple} />
          ))}

          {/* Thread boxes showing output */}
          <ThreadRow x={40} y={118} count={32} label={t.warpRecv}
            color={COLORS.purple} highlightRange={[0, 31]} />

          {/* Output fragment */}
          <Fragment x={130} y={155} w={300} h={44}
            label={t.fragDLabel} sublabel={t.fragDSub}
            color={COLORS.purple} bg="#f3e8ff" />

          {/* Store instruction */}
          <rect x={60} y={215} width={440} height={24} rx={4}
            fill="#1a1a2e" stroke="none" />
          <text x={280} y={230} textAnchor="middle" fontSize="8" fill="#a5f3fc"
            fontFamily={FONTS.mono}>
            wmma::store_matrix_sync(D_ptr, frag_d, ldd, wmma::mem_row_major);
          </text>

          {/* Summary */}
          <text x={W / 2} y={260} textAnchor="middle" fontSize="9" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.fullProcess}
          </text>
        </StepSvg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
