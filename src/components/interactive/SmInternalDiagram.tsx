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

function ProcessingBlock({ x, y, index }: { x: number; y: number; index: number }) {
  const uw = PART_W - 16; // unit width inside partition
  const ux = x + 8;
  return (
    <g>
      {/* Partition outline */}
      <rect x={x} y={y} width={PART_W} height={PART_H} rx={6}
        fill="#fafbfc" stroke="#94a3b8" strokeWidth={1.5} />
      <text x={x + PART_W / 2} y={y + 14} textAnchor="middle"
        fontSize="9" fontWeight="700" fill="#37474f" fontFamily={FONTS.sans}>
        Processing Block {index}
      </text>

      {/* Control — orange */}
      <UnitRow x={ux} y={y + 24} w={uw}
        label="Warp Scheduler" count="×1" color={COLORS.orange} bg="#fff7ed" />
      <UnitRow x={ux} y={y + 50} w={uw}
        label="Dispatch Unit" count="×1" color={COLORS.orange} bg="#fff7ed" />

      {/* Compute — blue */}
      <UnitRow x={ux} y={y + 80} w={uw}
        label="FP32 CUDA Core" count="×32" color={COLORS.primary} bg="#dbeafe" />
      <UnitRow x={ux} y={y + 106} w={uw}
        label="INT32 Core" count="×16" color={COLORS.primary} bg="#eff6ff" />
      <UnitRow x={ux} y={y + 132} w={uw}
        label="FP64 Core" count="×8" color={COLORS.primary} bg="#eff6ff" />

      {/* Special — purple */}
      <UnitRow x={ux} y={y + 162} w={uw}
        label="Tensor Core" count="×1" color={COLORS.purple} bg="#f3e8ff" />
      <UnitRow x={ux} y={y + 188} w={uw}
        label="SFU (sin/cos/exp)" count="×4" color={COLORS.purple} bg="#faf5ff" />

      {/* Memory — green */}
      <UnitRow x={ux} y={y + 218} w={uw}
        label="Load/Store Unit" count="×8" color={COLORS.green} bg="#dcfce7" />
    </g>
  );
}

export default function SmInternalDiagram() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="SM internal structure with 4 processing blocks">

      {/* SM label */}
      <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Streaming Multiprocessor (SM) — Hopper 架构
      </text>
      <text x={W / 2} y={36} textAnchor="middle" fontSize="9"
        fill="#64748b" fontFamily={FONTS.sans}>
        每个 SM 包含 4 个 Processing Block（Sub-partition），各有独立的 Warp Scheduler
      </text>

      {/* 4 processing blocks */}
      {Array.from({ length: 4 }).map((_, i) => (
        <ProcessingBlock key={i}
          x={PART_START_X + i * (PART_W + PART_GAP)}
          y={PART_START_Y} index={i} />
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
              Register File — 256 KB
            </text>
            <text x={PART_START_X + fullW / 4 - 3} y={sharedY + 26}
              textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
              每线程最多 255 个 32-bit register
            </text>

            {/* Shared Memory / L1 */}
            <rect x={PART_START_X + fullW / 2 + 5} y={sharedY} width={fullW / 2 - 5} height={34} rx={5}
              fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={PART_START_X + fullW * 3 / 4 + 3} y={sharedY + 13}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>
              Shared Memory / L1 Cache — 228 KB
            </text>
            <text x={PART_START_X + fullW * 3 / 4 + 3} y={sharedY + 26}
              textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
              可配置分配比例（更多 shared 或更多 L1）
            </text>

            {/* Legend — colored squares, no emoji */}
            {[
              { color: COLORS.orange, label: '控制单元' },
              { color: COLORS.primary, label: '计算单元' },
              { color: COLORS.purple, label: '特殊单元' },
              { color: COLORS.green, label: '存储单元' },
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
