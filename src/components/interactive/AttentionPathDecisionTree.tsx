import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  locale?: 'zh' | 'en';
  className?: string;
}

type PathId = 'decompose' | 'flash' | 'incremental';

interface Step {
  name: string;
  unit: 'DPU' | 'SHAVE' | 'DPU/SHAVE';
  note?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const UNIT_COLORS = {
  DPU: COLORS.green,
  SHAVE: COLORS.orange,
  'DPU/SHAVE': COLORS.purple,
} as const;

const PATH_COLORS: Record<PathId, string> = {
  decompose: '#6b7280',   // gray
  flash: COLORS.primary,  // blue
  incremental: COLORS.green,
};

const PATH_BG: Record<PathId, string> = {
  decompose: '#f3f4f6',
  flash: '#eff6ff',
  incremental: '#f0fdf4',
};

/* ------------------------------------------------------------------ */
/*  Localization                                                       */
/* ------------------------------------------------------------------ */

const translations = {
  zh: {
    title: 'Attention 实现路径选择',
    subtitle: '编译器如何为不同场景选择最优 attention 实现',
    root: '推理阶段',
    prefill: 'Prefill（预填充）',
    decode: 'Decode（解码）',
    prefillCondition: '长序列 + 硬件支持专用 kernel？',
    decodeCondition: '硬件支持专用 kernel？',
    yes: '是',
    no: '否',
    clickToExpand: '点击查看数据流',
    clickToCollapse: '点击收起',
    decomposeName: 'Decompose SDPA',
    decomposeDesc: '回退方案：将 SDPA 拆分为基础算子分别执行',
    decomposeNote: '中间结果需要 CMX/DDR 传输',
    flashName: 'Flash SDPA',
    flashDesc: '整个 attention 作为单个 SHAVE kernel 执行',
    flashNote: 'KV cache 按 seq_len 分块，维护 running_max/sum 保证数值稳定',
    flashUnroll: 'UnrollFlashSDPA pass 将一个 FlashSDPA op 展开为 tile 链',
    incrementalName: 'Incremental SDPA',
    incrementalDesc: 'Q 仅 1 个 token，矩阵乘退化为向量-矩阵乘',
    incrementalNote: '专用优化 SHAVE kernel，mask 内部处理',
    footer: '编译器在编译时根据模型结构和目标硬件能力选择路径',
    steps: {
      decompose: [
        { name: 'Q × K^T', unit: 'DPU', note: 'MatMul' },
        { name: '× scale', unit: 'DPU', note: 'PPE fused' },
        { name: '+ mask', unit: 'DPU/SHAVE', note: '条件分支' },
        { name: 'Softmax', unit: 'SHAVE', note: '' },
        { name: '× V', unit: 'DPU', note: 'MatMul' },
      ] as Step[],
      flash: [
        { name: 'Tile KV cache', unit: 'SHAVE', note: '沿 seq_len 分块' },
        { name: '局部 Q×K^T + scale + mask', unit: 'SHAVE', note: '块内融合' },
        { name: '更新 running_max', unit: 'SHAVE', note: '数值稳定' },
        { name: '局部 Softmax × V', unit: 'SHAVE', note: '局部输出' },
        { name: '更新 running_sum/output', unit: 'SHAVE', note: '归一化累积' },
      ] as Step[],
      incremental: [
        { name: 'Q (1×d) × K^T (d×n)', unit: 'SHAVE', note: '向量-矩阵乘' },
        { name: '× scale + mask', unit: 'SHAVE', note: '内部融合' },
        { name: 'Softmax', unit: 'SHAVE', note: '单行向量' },
        { name: '× V', unit: 'SHAVE', note: '向量-矩阵乘' },
      ] as Step[],
    },
  },
  en: {
    title: 'Attention Implementation Path Selection',
    subtitle: 'How the compiler selects the optimal attention implementation for different scenarios',
    root: 'Inference Phase',
    prefill: 'Prefill',
    decode: 'Decode',
    prefillCondition: 'Long sequence + HW supports specialized kernel?',
    decodeCondition: 'HW supports specialized kernel?',
    yes: 'Yes',
    no: 'No',
    clickToExpand: 'Click to view data flow',
    clickToCollapse: 'Click to collapse',
    decomposeName: 'Decompose SDPA',
    decomposeDesc: 'Fallback: decompose SDPA into individual primitive ops',
    decomposeNote: 'Intermediate results require CMX/DDR transfers',
    flashName: 'Flash SDPA',
    flashDesc: 'Entire attention as a single SHAVE kernel',
    flashNote: 'KV cache tiled along seq_len, maintains running_max/sum for numerical stability',
    flashUnroll: 'UnrollFlashSDPA pass unrolls one FlashSDPA op into a tile chain',
    incrementalName: 'Incremental SDPA',
    incrementalDesc: 'Q has only 1 token; matmul degenerates to vector-matrix multiply',
    incrementalNote: 'Specialized optimized SHAVE kernel, mask handled internally',
    footer: 'The compiler selects paths at compile time based on model structure and target hardware capabilities',
    steps: {
      decompose: [
        { name: 'Q × K^T', unit: 'DPU', note: 'MatMul' },
        { name: '× scale', unit: 'DPU', note: 'PPE fused' },
        { name: '+ mask', unit: 'DPU/SHAVE', note: 'Conditional' },
        { name: 'Softmax', unit: 'SHAVE', note: '' },
        { name: '× V', unit: 'DPU', note: 'MatMul' },
      ] as Step[],
      flash: [
        { name: 'Tile KV cache', unit: 'SHAVE', note: 'Along seq_len' },
        { name: 'Local Q×K^T + scale + mask', unit: 'SHAVE', note: 'Fused in tile' },
        { name: 'Update running_max', unit: 'SHAVE', note: 'Numerical stability' },
        { name: 'Local Softmax × V', unit: 'SHAVE', note: 'Local output' },
        { name: 'Update running_sum/output', unit: 'SHAVE', note: 'Normalization accumulation' },
      ] as Step[],
      incremental: [
        { name: 'Q (1×d) × K^T (d×n)', unit: 'SHAVE', note: 'Vec-mat multiply' },
        { name: '× scale + mask', unit: 'SHAVE', note: 'Fused internally' },
        { name: 'Softmax', unit: 'SHAVE', note: 'Single row vector' },
        { name: '× V', unit: 'SHAVE', note: 'Vec-mat multiply' },
      ] as Step[],
    },
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function UnitBadge({ unit }: { unit: Step['unit'] }) {
  const color = UNIT_COLORS[unit];
  const isStriped = unit === 'DPU/SHAVE';

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
      style={{
        color: '#fff',
        background: isStriped
          ? `repeating-linear-gradient(135deg, ${COLORS.green}, ${COLORS.green} 4px, ${COLORS.orange} 4px, ${COLORS.orange} 8px)`
          : color,
      }}
    >
      {unit}
    </span>
  );
}

function StepList({ steps, pathId }: { steps: Step[]; pathId: PathId }) {
  const borderColor = PATH_COLORS[pathId];

  return (
    <div className="mt-3 space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          {/* Vertical connector line */}
          <div className="flex flex-col items-center w-5 shrink-0">
            {i > 0 && (
              <div className="w-0.5 h-2" style={{ backgroundColor: borderColor, opacity: 0.4 }} />
            )}
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: borderColor }}
            />
            {i < steps.length - 1 && (
              <div className="w-0.5 h-2" style={{ backgroundColor: borderColor, opacity: 0.4 }} />
            )}
          </div>

          {/* Step content */}
          <div className="flex items-center gap-2 py-1 min-w-0">
            <span className="text-sm font-mono font-medium" style={{ color: COLORS.dark }}>
              {step.name}
            </span>
            <UnitBadge unit={step.unit} />
            {step.note && (
              <span className="text-xs" style={{ color: COLORS.mid }}>
                {step.note}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeafCard({
  pathId,
  name,
  desc,
  note,
  extraNote,
  steps,
  expanded,
  onToggle,
  expandLabel,
  collapseLabel,
}: {
  pathId: PathId;
  name: string;
  desc: string;
  note: string;
  extraNote?: string;
  steps: Step[];
  expanded: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseLabel: string;
}) {
  const color = PATH_COLORS[pathId];
  const bg = PATH_BG[pathId];

  return (
    <div
      className="rounded-lg border-2 overflow-hidden transition-shadow duration-200"
      style={{ borderColor: color, backgroundColor: bg }}
    >
      <div className="px-4 py-3">
        {/* Path name header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-bold" style={{ color }}>
            {name}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed m-0 mb-1" style={{ color: COLORS.dark }}>
          {desc}
        </p>
        <p className="text-xs leading-relaxed m-0 italic" style={{ color: COLORS.mid }}>
          {note}
        </p>
        {extraNote && (
          <p className="text-xs leading-relaxed m-0 mt-1 font-mono" style={{ color: COLORS.mid }}>
            {extraNote}
          </p>
        )}

        {/* Expand button */}
        <button
          onClick={onToggle}
          className="mt-2 text-xs font-medium px-3 py-1 rounded-full border cursor-pointer transition-colors duration-150"
          style={{
            borderColor: color,
            color,
            backgroundColor: expanded ? color : 'transparent',
            ...(expanded ? { color: '#fff' } : {}),
          }}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-3 pt-1 border-t"
              style={{ borderColor: `${color}33` }}
            >
              <StepList steps={steps} pathId={pathId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Connector lines (CSS-based)                                        */
/* ------------------------------------------------------------------ */

function BranchSplit({ leftLabel, rightLabel }: { leftLabel: string; rightLabel: string }) {
  return (
    <div className="relative flex justify-center py-1">
      {/* Horizontal line */}
      <div
        className="absolute top-1/2 h-0.5"
        style={{
          backgroundColor: COLORS.mid,
          left: '25%',
          right: '25%',
          transform: 'translateY(-50%)',
        }}
      />
      {/* Left vertical drop */}
      <div
        className="absolute w-0.5 h-3"
        style={{ backgroundColor: COLORS.mid, left: '25%', top: '50%' }}
      />
      {/* Right vertical drop */}
      <div
        className="absolute w-0.5 h-3"
        style={{ backgroundColor: COLORS.mid, right: '25%', top: '50%' }}
      />
      {/* Branch labels */}
      <div className="flex w-full justify-between px-[10%] mt-4">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100" style={{ color: COLORS.mid }}>
          {leftLabel}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100" style={{ color: COLORS.mid }}>
          {rightLabel}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function AttentionPathDecisionTree({ locale = 'zh', className }: Props) {
  const [expandedPath, setExpandedPath] = useState<PathId | null>(null);
  const t = translations[locale];

  const togglePath = (pathId: PathId) => {
    setExpandedPath((prev) => (prev === pathId ? null : pathId));
  };

  return (
    <div className={`my-6 rounded-xl border border-gray-200 bg-white overflow-hidden ${className ?? ''}`}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h3 className="text-base font-bold m-0" style={{ color: COLORS.dark }}>
          {t.title}
        </h3>
        <p className="text-xs mt-0.5 mb-0" style={{ color: COLORS.mid }}>
          {t.subtitle}
        </p>
      </div>

      <div className="px-5 pb-5">
        {/* Root node */}
        <div className="flex justify-center">
          <div
            className="px-5 py-2 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: COLORS.dark }}
          >
            {t.root}
          </div>
        </div>

        {/* Branch: Prefill / Decode */}
        <BranchSplit leftLabel={t.prefill} rightLabel={t.decode} />

        {/* Two-column layout for branches */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          {/* ---- Left branch: Prefill ---- */}
          <div className="flex flex-col items-center">
            {/* Decision node */}
            <div
              className="rounded-lg border-2 border-dashed px-3 py-2 text-center w-full"
              style={{ borderColor: COLORS.primary, backgroundColor: '#f0f6ff' }}
            >
              <span className="text-xs font-medium" style={{ color: COLORS.primary }}>
                {t.prefillCondition}
              </span>
            </div>

            {/* Branch from prefill decision */}
            <div className="relative w-full flex justify-center py-1">
              <div
                className="absolute top-1/2 h-0.5"
                style={{
                  backgroundColor: COLORS.mid,
                  left: '20%',
                  right: '20%',
                  transform: 'translateY(-50%)',
                }}
              />
              <div
                className="absolute w-0.5 h-3"
                style={{ backgroundColor: COLORS.mid, left: '20%', top: '50%' }}
              />
              <div
                className="absolute w-0.5 h-3"
                style={{ backgroundColor: COLORS.mid, right: '20%', top: '50%' }}
              />
              <div className="flex w-full justify-between px-[5%] mt-4">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                  {t.yes}
                </span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                  {t.no}
                </span>
              </div>
            </div>

            {/* Flash + Decompose leaves side by side */}
            <div className="grid grid-cols-2 gap-2 mt-2 w-full">
              <LeafCard
                pathId="flash"
                name={t.flashName}
                desc={t.flashDesc}
                note={t.flashNote}
                extraNote={t.flashUnroll}
                steps={t.steps.flash}
                expanded={expandedPath === 'flash'}
                onToggle={() => togglePath('flash')}
                expandLabel={t.clickToExpand}
                collapseLabel={t.clickToCollapse}
              />
              <LeafCard
                pathId="decompose"
                name={t.decomposeName}
                desc={t.decomposeDesc}
                note={t.decomposeNote}
                steps={t.steps.decompose}
                expanded={expandedPath === 'decompose'}
                onToggle={() => togglePath('decompose')}
                expandLabel={t.clickToExpand}
                collapseLabel={t.clickToCollapse}
              />
            </div>
          </div>

          {/* ---- Right branch: Decode ---- */}
          <div className="flex flex-col items-center">
            {/* Decision node */}
            <div
              className="rounded-lg border-2 border-dashed px-3 py-2 text-center w-full"
              style={{ borderColor: COLORS.red, backgroundColor: '#fef2f2' }}
            >
              <span className="text-xs font-medium" style={{ color: COLORS.red }}>
                {t.decodeCondition}
              </span>
            </div>

            {/* Branch from decode decision */}
            <div className="relative w-full flex justify-center py-1">
              <div
                className="absolute top-1/2 h-0.5"
                style={{
                  backgroundColor: COLORS.mid,
                  left: '20%',
                  right: '20%',
                  transform: 'translateY(-50%)',
                }}
              />
              <div
                className="absolute w-0.5 h-3"
                style={{ backgroundColor: COLORS.mid, left: '20%', top: '50%' }}
              />
              <div
                className="absolute w-0.5 h-3"
                style={{ backgroundColor: COLORS.mid, right: '20%', top: '50%' }}
              />
              <div className="flex w-full justify-between px-[5%] mt-4">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                  {t.yes}
                </span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                  {t.no}
                </span>
              </div>
            </div>

            {/* Incremental + Decompose leaves side by side */}
            <div className="grid grid-cols-2 gap-2 mt-2 w-full">
              <LeafCard
                pathId="incremental"
                name={t.incrementalName}
                desc={t.incrementalDesc}
                note={t.incrementalNote}
                steps={t.steps.incremental}
                expanded={expandedPath === 'incremental'}
                onToggle={() => togglePath('incremental')}
                expandLabel={t.clickToExpand}
                collapseLabel={t.clickToCollapse}
              />
              <LeafCard
                pathId="decompose"
                name={t.decomposeName}
                desc={t.decomposeDesc}
                note={t.decomposeNote}
                steps={t.steps.decompose}
                expanded={expandedPath === 'decompose'}
                onToggle={() => togglePath('decompose')}
                expandLabel={t.clickToExpand}
                collapseLabel={t.clickToCollapse}
              />
            </div>
          </div>
        </div>

        {/* Execution unit legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5 pt-3 border-t border-gray-100">
          {(['DPU', 'SHAVE', 'DPU/SHAVE'] as const).map((unit) => (
            <div key={unit} className="flex items-center gap-1.5">
              <UnitBadge unit={unit} />
              <span className="text-xs" style={{ color: COLORS.mid }}>
                {unit === 'DPU'
                  ? locale === 'zh' ? '矩阵运算单元' : 'Matrix compute unit'
                  : unit === 'SHAVE'
                    ? locale === 'zh' ? '向量/标量处理单元' : 'Vector/scalar processor'
                    : locale === 'zh' ? '条件分配' : 'Conditional assignment'}
              </span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          className="text-xs text-center mt-3 mb-0 italic"
          style={{ color: COLORS.mid }}
        >
          {t.footer}
        </p>
      </div>
    </div>
  );
}
