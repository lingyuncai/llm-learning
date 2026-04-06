// src/components/interactive/SmInternalDiagram.tsx
// Static SVG: SM internal structure — 4 processing blocks with functional units
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;
const PART_W = 125;
const PART_H = 240;
const PART_GAP = 10;
const PART_START_X = 20;
const PART_START_Y = 50;

interface UnitRowProps {
  x: number; y: number; w: number;
  label: string; count: string; color: string; bg: string;
}

function UnitRow({ x, y, w, label, count, color, bg }: UnitRowProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={3} fill={bg} stroke={color} strokeWidth={1} />
      <text x={x + 4} y={y + 12} dominantBaseline="middle"
        fontSize="7.5" fill={color} fontFamily={FONTS.sans} fontWeight="500">{label}</text>
      <text x={x + w - 4} y={y + 12} textAnchor="end" dominantBaseline="middle"
        fontSize="7" fill="#64748b" fontFamily={FONTS.mono}>{count}</text>
    </g>
  );
}

function ProcessingBlock({ x, y, index, t }: { x: number; y: number; index: number; t: any }) {
  const uw = PART_W - 16; // unit width inside partition
  const ux = x + 8;
  return (
    <g>
      {/* Partition outline */}
      <rect x={x} y={y} width={PART_W} height={PART_H} rx={6}
        fill="#fafbfc" stroke="#94a3b8" strokeWidth={1.5} />
      <text x={x + PART_W / 2} y={y + 14} textAnchor="middle"
        fontSize="9" fontWeight="700" fill="#37474f" fontFamily={FONTS.sans}>
        {t.processingBlock} {index}
      </text>

      {/* Control — orange */}
      <UnitRow x={ux} y={y + 24} w={uw}
        label={t.warpScheduler} count="×1" color={COLORS.orange} bg="#fff7ed" />
      <UnitRow x={ux} y={y + 50} w={uw}
        label={t.dispatchUnit} count="×1" color={COLORS.orange} bg="#fff7ed" />

      {/* Compute — blue */}
      <UnitRow x={ux} y={y + 80} w={uw}
        label={t.fp32Core} count="×32" color={COLORS.primary} bg="#dbeafe" />
      <UnitRow x={ux} y={y + 106} w={uw}
        label={t.int32Core} count="×16" color={COLORS.primary} bg="#eff6ff" />
      <UnitRow x={ux} y={y + 132} w={uw}
        label={t.fp64Core} count="×16" color={COLORS.primary} bg="#eff6ff" />

      {/* Special — purple */}
      <UnitRow x={ux} y={y + 162} w={uw}
        label={t.tensorCore} count="×1" color={COLORS.purple} bg="#f3e8ff" />
      <UnitRow x={ux} y={y + 188} w={uw}
        label={t.sfu} count="×4" color={COLORS.purple} bg="#faf5ff" />

      {/* Memory — green */}
      <UnitRow x={ux} y={y + 218} w={uw}
        label={t.loadStore} count="×8" color={COLORS.green} bg="#dcfce7" />
    </g>
  );
}

export default function SmInternalDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Streaming Multiprocessor (SM) — Hopper 架构',
      subtitle: '每个 SM 包含 4 个 Processing Block（Sub-partition），各有独立的 Warp Scheduler',
      warpScheduler: 'Warp Scheduler',
      dispatchUnit: 'Dispatch Unit',
      fp32Core: 'FP32 CUDA Core',
      int32Core: 'INT32 Core',
      fp64Core: 'FP64 Core',
      tensorCore: 'Tensor Core',
      sfu: 'SFU (sin/cos/exp)',
      loadStore: 'Load/Store Unit',
      processingBlock: 'Processing Block',
      registerFile: 'Register File — 256 KB',
      registerDesc: '每线程最多 255 个 32-bit register',
      sharedMemory: 'Shared Memory / L1 Cache — 228 KB',
      sharedDesc: '可配置分配比例（更多 shared 或更多 L1）',
      controlUnit: '控制单元',
      computeUnit: '计算单元',
      specialUnit: '特殊单元',
      memoryUnit: '存储单元',
    },
    en: {
      title: 'Streaming Multiprocessor (SM) — Hopper Architecture',
      subtitle: 'Each SM contains 4 Processing Blocks (Sub-partitions), each with independent Warp Scheduler',
      warpScheduler: 'Warp Scheduler',
      dispatchUnit: 'Dispatch Unit',
      fp32Core: 'FP32 CUDA Core',
      int32Core: 'INT32 Core',
      fp64Core: 'FP64 Core',
      tensorCore: 'Tensor Core',
      sfu: 'SFU (sin/cos/exp)',
      loadStore: 'Load/Store Unit',
      processingBlock: 'Processing Block',
      registerFile: 'Register File — 256 KB',
      registerDesc: 'Max 255 32-bit registers per thread',
      sharedMemory: 'Shared Memory / L1 Cache — 228 KB',
      sharedDesc: 'Configurable allocation ratio (more shared or more L1)',
      controlUnit: 'Control Units',
      computeUnit: 'Compute Units',
      specialUnit: 'Special Units',
      memoryUnit: 'Memory Units',
    },
  }[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="SM internal structure with 4 processing blocks">

      {/* SM label */}
      <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={36} textAnchor="middle" fontSize="9"
        fill="#64748b" fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {/* 4 processing blocks */}
      {Array.from({ length: 4 }).map((_, i) => (
        <ProcessingBlock key={i}
          x={PART_START_X + i * (PART_W + PART_GAP)}
          y={PART_START_Y} index={i} t={t} />
      ))}

      {/* Shared resources at bottom */}
      {(() => {
        const sharedY = PART_START_Y + PART_H + 15;
        const fullW = 4 * PART_W + 3 * PART_GAP;
        return (
          <g>
            {/* Register File */}
            <rect x={PART_START_X} y={sharedY} width={fullW / 2 - 5} height={34} rx={5}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={PART_START_X + fullW / 4 - 3} y={sharedY + 13}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.green} fontFamily={FONTS.sans}>
              {t.registerFile}
            </text>
            <text x={PART_START_X + fullW / 4 - 3} y={sharedY + 26}
              textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
              {t.registerDesc}
            </text>

            {/* Shared Memory / L1 */}
            <rect x={PART_START_X + fullW / 2 + 5} y={sharedY} width={fullW / 2 - 5} height={34} rx={5}
              fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={PART_START_X + fullW * 3 / 4 + 3} y={sharedY + 13}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>
              {t.sharedMemory}
            </text>
            <text x={PART_START_X + fullW * 3 / 4 + 3} y={sharedY + 26}
              textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
              {t.sharedDesc}
            </text>

            {/* Legend — colored squares, no emoji */}
            {[
              { color: COLORS.orange, label: t.controlUnit },
              { color: COLORS.primary, label: t.computeUnit },
              { color: COLORS.purple, label: t.specialUnit },
              { color: COLORS.green, label: t.memoryUnit },
            ].map((item, idx) => (
              <g key={idx}>
                <rect x={PART_START_X + idx * 80} y={sharedY + 44} width={10} height={10} rx={2}
                  fill={item.color} opacity={0.6} />
                <text x={PART_START_X + idx * 80 + 14} y={sharedY + 53} fontSize="8" fill="#94a3b8"
                  fontFamily={FONTS.sans}>{item.label}</text>
              </g>
            ))}
          </g>
        );
      })()}
    </svg>
  );
}
