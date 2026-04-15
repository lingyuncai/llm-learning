// src/components/interactive/NpuVsGpuExecution.tsx
// Side-by-side comparison explorer: NPU vs GPU execution models across three dimensions.
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

// ---------------------------------------------------------------------------
// Types & Props
// ---------------------------------------------------------------------------
interface Props {
  locale?: 'zh' | 'en';
  className?: string;
}

type Dimension = 'scheduling' | 'memory' | 'programming';

// ---------------------------------------------------------------------------
// Theme colors
// ---------------------------------------------------------------------------
const C_NPU = '#1e40af';        // blue-800
const C_NPU_BG = '#dbeafe';     // blue-100
const C_NPU_BORDER = '#93c5fd'; // blue-300
const C_GPU = '#166534';        // green-800
const C_GPU_BG = '#dcfce7';     // green-100
const C_GPU_BORDER = '#86efac'; // green-300
const C_TAB_ACTIVE = COLORS.primary;
const C_TAB_INACTIVE = '#94a3b8';
const C_TABLE_HEADER = '#1e293b';
const C_TABLE_STRIPE = '#f8fafc';
const C_ARROW = '#64748b';

// ---------------------------------------------------------------------------
// Localisation
// ---------------------------------------------------------------------------
const translations = {
  zh: {
    title: 'NPU vs GPU 执行模型对比',
    subtitle: '点击维度切换对比视角',
    tabs: {
      scheduling: '调度模型',
      memory: '内存层次',
      programming: '编程接口',
    },
    npuHeader: 'NPU (Intel Meteor Lake)',
    gpuHeader: 'GPU (NVIDIA CUDA)',
    scheduling: {
      npu: [
        '编译期完成全部规划',
        'Blob 包含所有任务描述符 (task descriptors)',
        '管理核 (management core) 顺序读取执行',
        '运行时零决策 — 确定性执行',
        '🎵 好比播放预先录制好的专辑',
      ],
      gpu: [
        '运行时动态调度',
        'Host 发起 kernel launch',
        'Warp scheduler 分配工作给 SM',
        '动态资源分配 — 按需调整',
        '🎷 好比现场即兴的爵士乐队',
      ],
    },
    memory: {
      npu: [
        'DDR (GB 级, 慢) — 外部主存',
        'DMA 传输 — 编译期全部规划好',
        'CMX (KB~MB 级, 快, 片上 SRAM)',
        '所有数据搬移在编译时确定',
      ],
      gpu: [
        'Global Memory (GB 级, VRAM)',
        'Cache 层次 (L2 → L1 → Register)',
        'Shared Memory (KB 级, 每 SM 独占)',
        '程序员通过 __shared__ 显式控制',
      ],
    },
    programming: {
      npu: [
        'ONNX 模型 → OpenVINO IR',
        'npu_compiler → Blob (ELF 格式)',
        '算子作者编写 SHAVE kernel + 编译器 pass',
        '最终产物: 静态计算图的完整执行计划',
      ],
      gpu: [
        'CUDA C++ 源码',
        'nvcc → PTX → SASS (机器码)',
        '程序员直接编写 kernel, 控制 thread/block/grid',
        '最终产物: 可动态调用的 kernel 二进制',
      ],
    },
    tableTitle: '核心概念映射',
    tableHeaders: ['NPU', 'GPU', '说明'],
    mappings: [
      { npu: 'CMX', gpu: 'Shared Memory', desc: '高速片上暂存器' },
      { npu: 'DMA prefetch', gpu: 'async memcpy + streams', desc: '隐藏内存延迟' },
      { npu: 'Barrier', gpu: 'Stream event / __syncthreads', desc: '同步机制' },
      { npu: 'Blob (ELF)', gpu: 'Kernel binary (cubin)', desc: '编译后的可执行体' },
      { npu: 'Management core', gpu: 'Warp scheduler', desc: '任务分发单元' },
      { npu: 'DPU', gpu: 'Tensor Cores', desc: '固定功能矩阵运算' },
      { npu: 'SHAVE', gpu: 'CUDA Cores', desc: '可编程计算单元' },
    ],
  },
  en: {
    title: 'NPU vs GPU Execution Model Comparison',
    subtitle: 'Click a dimension to switch comparison perspective',
    tabs: {
      scheduling: 'Scheduling',
      memory: 'Memory',
      programming: 'Programming',
    },
    npuHeader: 'NPU (Intel Meteor Lake)',
    gpuHeader: 'GPU (NVIDIA CUDA)',
    scheduling: {
      npu: [
        'Compile-time full planning',
        'Blob contains all task descriptors',
        'Management core reads & executes sequentially',
        'Zero runtime decisions — deterministic execution',
        '🎵 Like playing a pre-recorded album',
      ],
      gpu: [
        'Runtime dynamic scheduling',
        'Host initiates kernel launch',
        'Warp scheduler assigns work to SMs',
        'Dynamic resource allocation — on-demand',
        '🎷 Like a live jazz band improvising',
      ],
    },
    memory: {
      npu: [
        'DDR (GB, slow) — external main memory',
        'DMA transfer — all planned at compile time',
        'CMX (KB–MB, fast, on-chip SRAM)',
        'All data movement determined at compile time',
      ],
      gpu: [
        'Global Memory (GB, VRAM)',
        'Cache hierarchy (L2 → L1 → Register)',
        'Shared Memory (KB, per-SM)',
        'Programmer controls via __shared__',
      ],
    },
    programming: {
      npu: [
        'ONNX model → OpenVINO IR',
        'npu_compiler → Blob (ELF format)',
        'Operator authors write SHAVE kernels + compiler passes',
        'Final artifact: complete execution plan for static graph',
      ],
      gpu: [
        'CUDA C++ source code',
        'nvcc → PTX → SASS (machine code)',
        'Programmer writes kernels, controls thread/block/grid',
        'Final artifact: dynamically callable kernel binary',
      ],
    },
    tableTitle: 'Core Concept Mapping',
    tableHeaders: ['NPU', 'GPU', 'Description'],
    mappings: [
      { npu: 'CMX', gpu: 'Shared Memory', desc: 'Fast on-chip scratchpad' },
      { npu: 'DMA prefetch', gpu: 'async memcpy + streams', desc: 'Hide memory latency' },
      { npu: 'Barrier', gpu: 'Stream event / __syncthreads', desc: 'Synchronization' },
      { npu: 'Blob (ELF)', gpu: 'Kernel binary (cubin)', desc: 'Compiled executable' },
      { npu: 'Management core', gpu: 'Warp scheduler', desc: 'Task dispatch unit' },
      { npu: 'DPU', gpu: 'Tensor Cores', desc: 'Fixed-function matrix ops' },
      { npu: 'SHAVE', gpu: 'CUDA Cores', desc: 'Programmable compute unit' },
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// Dimension tab configuration
// ---------------------------------------------------------------------------
const DIMENSIONS: Dimension[] = ['scheduling', 'memory', 'programming'];

const DIMENSION_ICONS: Record<Dimension, string> = {
  scheduling: '\u2699\uFE0F',  // gear
  memory: '\uD83D\uDCBE',      // floppy disk (memory icon)
  programming: '\uD83D\uDCBB', // laptop (coding icon)
};

// ---------------------------------------------------------------------------
// Sub-component: Bullet list card for one side (NPU or GPU)
// ---------------------------------------------------------------------------
function ArchCard({
  header,
  headerColor,
  headerBg,
  borderColor,
  items,
  side,
}: {
  header: string;
  headerColor: string;
  headerBg: string;
  borderColor: string;
  items: readonly string[];
  side: 'npu' | 'gpu';
}) {
  return (
    <div
      className="flex-1 min-w-0 rounded-lg border overflow-hidden"
      style={{ borderColor }}
    >
      {/* Card header */}
      <div
        className="px-4 py-2.5 font-semibold text-sm"
        style={{ backgroundColor: headerBg, color: headerColor }}
      >
        {side === 'npu' ? (
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <rect x="3" y="3" width="10" height="10" rx="1.5" stroke={headerColor} strokeWidth="1.5" fill="none" />
              <rect x="5.5" y="5.5" width="5" height="5" rx="0.5" fill={headerColor} opacity="0.3" />
              <line x1="8" y1="0.5" x2="8" y2="3" stroke={headerColor} strokeWidth="1" />
              <line x1="8" y1="13" x2="8" y2="15.5" stroke={headerColor} strokeWidth="1" />
              <line x1="0.5" y1="8" x2="3" y2="8" stroke={headerColor} strokeWidth="1" />
              <line x1="13" y1="8" x2="15.5" y2="8" stroke={headerColor} strokeWidth="1" />
            </svg>
            {header}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              {/* Mini GPU icon: grid of small rects */}
              {[0, 1, 2].map(r =>
                [0, 1, 2].map(c => (
                  <rect
                    key={`${r}-${c}`}
                    x={2 + c * 4.5}
                    y={2 + r * 4.5}
                    width="3.5"
                    height="3.5"
                    rx="0.5"
                    fill={headerColor}
                    opacity={0.4 + (r + c) * 0.1}
                  />
                ))
              )}
            </svg>
            {header}
          </span>
        )}
      </div>

      {/* Bullet points */}
      <ul className="px-4 py-3 space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed"
            initial={{ opacity: 0, x: side === 'npu' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: side === 'npu' ? C_NPU : C_GPU }}
            />
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Concept mapping table
// ---------------------------------------------------------------------------
function MappingTable({
  title,
  headers,
  mappings,
}: {
  title: string;
  headers: readonly [string, string, string];
  mappings: readonly { npu: string; gpu: string; desc: string }[];
}) {
  return (
    <div className="mt-5 rounded-lg border border-gray-200 overflow-hidden">
      {/* Table title */}
      <div
        className="px-4 py-2 text-sm font-semibold text-white"
        style={{ backgroundColor: C_TABLE_HEADER }}
      >
        {title}
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600">
            <th className="px-4 py-2 text-left font-semibold" style={{ color: C_NPU, width: '25%' }}>
              {headers[0]}
            </th>
            <th className="px-1 py-2 w-8 text-center text-gray-400" aria-hidden="true" />
            <th className="px-4 py-2 text-left font-semibold" style={{ color: C_GPU, width: '28%' }}>
              {headers[1]}
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">
              {headers[2]}
            </th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((row, i) => (
            <tr
              key={i}
              className="border-t border-gray-100"
              style={{ backgroundColor: i % 2 === 1 ? C_TABLE_STRIPE : 'white' }}
            >
              <td className="px-4 py-2 font-mono text-xs" style={{ color: C_NPU }}>
                {row.npu}
              </td>
              <td className="px-1 py-2 text-center text-gray-400 text-xs select-none" aria-hidden="true">
                <svg width="16" height="12" viewBox="0 0 16 12" className="inline-block">
                  <path
                    d="M2 6 L11 6 M9 3 L12 6 L9 9"
                    fill="none"
                    stroke={C_ARROW}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
              <td className="px-4 py-2 font-mono text-xs" style={{ color: C_GPU }}>
                {row.gpu}
              </td>
              <td className="px-4 py-2 text-xs text-gray-600">
                {row.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function NpuVsGpuExecution({ locale = 'zh', className }: Props) {
  const t = translations[locale ?? 'zh'];
  const [activeDim, setActiveDim] = useState<Dimension>('scheduling');

  const npuItems = t[activeDim].npu;
  const gpuItems = t[activeDim].gpu;

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className ?? ''}`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 text-center">
        <h3 className="text-base font-bold text-gray-900">{t.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Dimension tabs */}
      <div className="flex items-center justify-center gap-2 px-4 pb-3">
        {DIMENSIONS.map((dim) => {
          const isActive = activeDim === dim;
          return (
            <button
              key={dim}
              onClick={() => setActiveDim(dim)}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive
                  ? 'text-white shadow-md'
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700'
                }
              `}
              style={isActive ? { backgroundColor: C_TAB_ACTIVE } : undefined}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-base leading-none">{DIMENSION_ICONS[dim]}</span>
                {t.tabs[dim]}
              </span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: C_TAB_ACTIVE, zIndex: -1 }}
                  layoutId="activeTab"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Comparison cards */}
      <div className="px-4 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDim}
            className="flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ArchCard
              header={t.npuHeader}
              headerColor={C_NPU}
              headerBg={C_NPU_BG}
              borderColor={C_NPU_BORDER}
              items={npuItems}
              side="npu"
            />
            <ArchCard
              header={t.gpuHeader}
              headerColor={C_GPU}
              headerBg={C_GPU_BG}
              borderColor={C_GPU_BORDER}
              items={gpuItems}
              side="gpu"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Concept mapping table (always visible) */}
      <div className="px-4 pb-4">
        <MappingTable
          title={t.tableTitle}
          headers={t.tableHeaders as unknown as readonly [string, string, string]}
          mappings={t.mappings}
        />
      </div>
    </div>
  );
}
