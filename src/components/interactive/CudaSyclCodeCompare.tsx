// src/components/interactive/CudaSyclCodeCompare.tsx
// Static SVG: CUDA vs SYCL code side-by-side with color-coded concepts
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 440;

interface CodeLine {
  text: string;
  color?: string; // highlight color for matching concepts
  indent?: number;
}

const CUDA_CODE: CodeLine[] = [
  { text: '// CUDA Vector Addition', color: '#64748b' },
  { text: '__global__', color: COLORS.purple },
  { text: 'void vecadd(float* a, float* b,', indent: 0 },
  { text: '            float* c, int n) {', indent: 0 },
  { text: '  int i = threadIdx.x', color: COLORS.primary, indent: 1 },
  { text: '        + blockIdx.x', color: COLORS.green, indent: 1 },
  { text: '        * blockDim.x;', color: COLORS.orange, indent: 1 },
  { text: '  if (i < n)', indent: 1 },
  { text: '    c[i] = a[i] + b[i];', indent: 2 },
  { text: '}', indent: 0 },
  { text: '' },
  { text: '// Launch', color: '#64748b' },
  { text: 'vecadd<<<gridDim, blockDim>>>', color: COLORS.red },
  { text: '    (d_a, d_b, d_c, n);', indent: 1 },
];

const SYCL_CODE: CodeLine[] = [
  { text: '// SYCL Vector Addition', color: '#64748b' },
  { text: 'q.parallel_for(', color: COLORS.purple },
  { text: '  nd_range<1>(N, block_size),', indent: 1 },
  { text: '  [=](nd_item<1> item) {', indent: 1 },
  { text: '  int i = item.get_local_id(0)', color: COLORS.primary, indent: 1 },
  { text: '        + item.get_group(0)', color: COLORS.green, indent: 1 },
  { text: '        * item.get_local_range(0);', color: COLORS.orange, indent: 1 },
  { text: '  if (i < n)', indent: 1 },
  { text: '    c[i] = a[i] + b[i];', indent: 2 },
  { text: '});', indent: 0 },
  { text: '' },
  { text: '// Launch: 内置于 parallel_for', color: '#64748b' },
  { text: '// q 是 sycl::queue', color: COLORS.red },
  { text: '// 设备选择在 queue 创建时指定', color: '#64748b' },
];

const CODE_Y = 60;
const LINE_H = 15;
const COL_W = 270;

function CodeBlock({ x, y, lines, title, titleColor }: {
  x: number; y: number; lines: CodeLine[]; title: string; titleColor: string;
}) {
  return (
    <g>
      {/* Background */}
      <rect x={x} y={y} width={COL_W} height={lines.length * LINE_H + 10} rx={5}
        fill="#1e293b" stroke={titleColor} strokeWidth={1.5} />
      {/* Title */}
      <rect x={x} y={y - 22} width={COL_W} height={22} rx={5}
        fill={titleColor} />
      <rect x={x} y={y - 8} width={COL_W} height={8} fill={titleColor} />
      <text x={x + COL_W / 2} y={y - 8} textAnchor="middle" fontSize="9" fontWeight="700"
        fill="white" fontFamily={FONTS.sans}>{title}</text>

      {/* Code lines */}
      {lines.map((line, i) => {
        const indent = (line.indent || 0) * 12;
        return (
          <text key={i} x={x + 8 + indent} y={y + 14 + i * LINE_H}
            fontSize="7.5" fill={line.color || '#e2e8f0'} fontFamily={FONTS.mono}>
            {line.text}
          </text>
        );
      })}
    </g>
  );
}

// Concept mapping legend
const CONCEPTS = [
  { color: COLORS.primary, cuda: 'threadIdx.x', sycl: 'get_local_id(0)', meaning: 'Block/Work-group 内线程 ID' },
  { color: COLORS.green, cuda: 'blockIdx.x', sycl: 'get_group(0)', meaning: 'Block/Work-group ID' },
  { color: COLORS.orange, cuda: 'blockDim.x', sycl: 'get_local_range(0)', meaning: 'Block/Work-group 大小' },
  { color: COLORS.purple, cuda: '__global__', sycl: 'parallel_for', meaning: 'Kernel 入口' },
  { color: COLORS.red, cuda: '<<<grid, block>>>', sycl: 'sycl::queue', meaning: '启动 / 设备选择' },
];

export default function CudaSyclCodeCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'CUDA vs SYCL: 同一个向量加法 Kernel',
      subtitle: '颜色标注对应概念 — 核心逻辑完全相同，只是 API 不同',
      cudaTitle: 'CUDA C++',
      syclTitle: 'SYCL (Intel DPC++)',
      conceptMapping: '概念映射',
      sharedNote: 'CUDA: __shared__ → SYCL: local accessor | CUDA: __syncthreads() → SYCL: group_barrier()',
      warpNote: 'CUDA: warp (32 threads) → SYCL: sub-group (8/16/32, 宽度由硬件决定)',
      concepts: [
        { cuda: 'threadIdx.x', sycl: 'get_local_id(0)', meaning: 'Block/Work-group 内线程 ID' },
        { cuda: 'blockIdx.x', sycl: 'get_group(0)', meaning: 'Block/Work-group ID' },
        { cuda: 'blockDim.x', sycl: 'get_local_range(0)', meaning: 'Block/Work-group 大小' },
        { cuda: '__global__', sycl: 'parallel_for', meaning: 'Kernel 入口' },
        { cuda: '<<<grid, block>>>', sycl: 'sycl::queue', meaning: '启动 / 设备选择' },
      ],
    },
    en: {
      title: 'CUDA vs SYCL: Same Vector Addition Kernel',
      subtitle: 'Color-coded concepts — identical core logic, different APIs',
      cudaTitle: 'CUDA C++',
      syclTitle: 'SYCL (Intel DPC++)',
      conceptMapping: 'Concept Mapping',
      sharedNote: 'CUDA: __shared__ → SYCL: local accessor | CUDA: __syncthreads() → SYCL: group_barrier()',
      warpNote: 'CUDA: warp (32 threads) → SYCL: sub-group (8/16/32, width hardware-dependent)',
      concepts: [
        { cuda: 'threadIdx.x', sycl: 'get_local_id(0)', meaning: 'Thread ID in block/work-group' },
        { cuda: 'blockIdx.x', sycl: 'get_group(0)', meaning: 'Block/Work-group ID' },
        { cuda: 'blockDim.x', sycl: 'get_local_range(0)', meaning: 'Block/Work-group size' },
        { cuda: '__global__', sycl: 'parallel_for', meaning: 'Kernel entry' },
        { cuda: '<<<grid, block>>>', sycl: 'sycl::queue', meaning: 'Launch / device selection' },
      ],
    },
  }[locale];

  const legendY = CODE_Y + CUDA_CODE.length * LINE_H + 35;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CUDA vs SYCL code comparison">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {/* Code blocks */}
      <CodeBlock x={10} y={CODE_Y} lines={CUDA_CODE} title={t.cudaTitle} titleColor={COLORS.green} />
      <CodeBlock x={300} y={CODE_Y} lines={SYCL_CODE} title={t.syclTitle} titleColor={COLORS.primary} />

      {/* Concept mapping legend */}
      <text x={W / 2} y={legendY} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.conceptMapping}</text>

      {t.concepts.map((c, i) => {
        const y = legendY + 16 + i * 16;
        const color = CONCEPTS[i].color;
        return (
          <g key={i}>
            <rect x={20} y={y - 6} width={8} height={8} rx={1} fill={color} />
            <text x={35} y={y + 1} fontSize="7.5" fill={color} fontFamily={FONTS.mono}>
              {c.cuda}
            </text>
            <text x={185} y={y + 1} fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
              ↔
            </text>
            <text x={200} y={y + 1} fontSize="7.5" fill={color} fontFamily={FONTS.mono}>
              {c.sycl}
            </text>
            <text x={400} y={y + 1} fontSize="7.5" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {c.meaning}
            </text>
          </g>
        );
      })}

      {/* Additional SYCL concepts */}
      <rect x={20} y={legendY + 100} width={540} height={38} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={legendY + 116} textAnchor="middle" fontSize="8" fill={COLORS.dark}
        fontFamily={FONTS.sans}>
        {t.sharedNote}
      </text>
      <text x={W / 2} y={legendY + 130} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.warpNote}
      </text>
    </svg>
  );
}
