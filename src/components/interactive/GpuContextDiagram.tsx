// src/components/interactive/GpuContextDiagram.tsx
// Static SVG: GPU Context as a container for device, buffers, queues, programs
import { COLORS, FONTS } from './shared/colors';

const W = 460;
const H = 220;

function Pill({ x, y, w, label, color, bg }: {
  x: number; y: number; w: number; label: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} rx={5}
        fill={bg} stroke={color} strokeWidth={1} />
      <text x={x + w / 2} y={y + 14} textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fill={color} fontFamily={FONTS.mono} fontWeight="500">
        {label}
      </text>
    </g>
  );
}

export default function GpuContextDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      context: 'Context（会话/沙箱）',
      buffersLabel: 'Buffers（显存）',
      contextResources: 'Context 内的资源互相关联：Queue 可以 dispatch Kernel，Kernel 读写 Buffer',
      isolation: '不同进程 / 不同 Context 之间资源隔离，互不干扰（类比数据库 Connection）',
      analogy: '类比：Context ≈ 数据库 Connection · Buffer ≈ malloc · Queue ≈ Transaction',
      anotherContext: '另一个 Context（隔离）',
    },
    en: {
      context: 'Context (session/sandbox)',
      buffersLabel: 'Buffers (device memory)',
      contextResources: 'Resources within Context are interconnected: Queue dispatches Kernel, Kernel reads/writes Buffer',
      isolation: 'Different processes / Contexts are isolated from each other (analogous to database Connection)',
      analogy: 'Analogy: Context ≈ DB Connection · Buffer ≈ malloc · Queue ≈ Transaction',
      anotherContext: 'Another Context (isolated)',
    },
  }[locale];

  const buffers = [
    { x: 25, label: 'bufA' },
    { x: 85, label: 'bufB' },
    { x: 145, label: 'bufC' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="GPU Context as a container">

      {/* Context outer box */}
      <rect x={10} y={30} width={W - 20} height={155} rx={8}
        fill="#fafbfc" stroke={COLORS.primary} strokeWidth={2} />
      <text x={20} y={48} fontSize="12" fontWeight="700" fill={COLORS.primary}
        fontFamily={FONTS.sans}>
        {t.context}
      </text>

      {/* Device */}
      <Pill x={25} y={60} w={120} label="GPU Device #0" color="#37474f" bg="#f1f5f9" />

      {/* Programs / Kernels */}
      <Pill x={160} y={60} w={130} label="Program (kernel 集合)" color={COLORS.orange} bg="#fff7ed" />
      <Pill x={305} y={60} w={120} label="Compiled Kernel" color={COLORS.orange} bg="#fef3c7" />

      {/* Section label: Buffers */}
      <text x={25} y={105} fontSize="9" fontWeight="600" fill={COLORS.green}
        fontFamily={FONTS.sans}>
        {t.buffersLabel}
      </text>
      {buffers.map((b, i) => (
        <Pill key={i} x={b.x} y={112} w={52} label={b.label}
          color={COLORS.green} bg="#dcfce7" />
      ))}

      {/* Section label: Queues */}
      <text x={220} y={105} fontSize="9" fontWeight="600" fill={COLORS.purple}
        fontFamily={FONTS.sans}>
        Command Queues
      </text>
      <Pill x={220} y={112} w={95} label="Queue #0" color={COLORS.purple} bg="#ede9fe" />
      <Pill x={325} y={112} w={95} label="Queue #1" color={COLORS.purple} bg="#ede9fe" />

      {/* Isolation note */}
      <text x={25} y={160} fontSize="8.5" fill="#64748b" fontFamily={FONTS.sans}>
        {t.contextResources}
      </text>
      <text x={25} y={173} fontSize="8.5" fill="#64748b" fontFamily={FONTS.sans}>
        {t.isolation}
      </text>

      {/* Analogy header */}
      <text x={W / 2} y={15} textAnchor="middle" fontSize="9" fill="#94a3b8"
        fontFamily={FONTS.sans}>
        {t.analogy}
      </text>

      {/* Second context (ghost) to show isolation */}
      <rect x={W - 130} y={148} width={110} height={30} rx={6}
        fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 2" />
      <text x={W - 75} y={167} textAnchor="middle" fontSize="8" fill="#94a3b8"
        fontFamily={FONTS.sans}>
        {t.anotherContext}
      </text>
    </svg>
  );
}
