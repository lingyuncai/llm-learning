// src/components/interactive/XmxArchitectureDiagram.tsx
// Static SVG: Intel XMX internal structure within Xe-Core
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface BlockProps {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; color: string; bg: string;
  fontSize?: number;
}

function Block({ x, y, w, h, label, sub, color, bg, fontSize = 10 }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 6 : y + h / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          dominantBaseline="middle" fontSize="7.5" fill="#64748b" fontFamily={FONTS.sans}>
          {sub}
        </text>
      )}
    </g>
  );
}

// Systolic array mini grid
function SystolicGrid({ x, y, rows, cols, label }: {
  x: number; y: number; rows: number; cols: number; label: string;
}) {
  const cellSize = 8;
  const gap = 1;
  const gridW = cols * (cellSize + gap) - gap;
  const gridH = rows * (cellSize + gap) - gap;

  return (
    <g>
      <text x={x + gridW / 2} y={y - 6} textAnchor="middle"
        fontSize="8" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>
        {label}
      </text>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <rect key={`${r}-${c}`}
            x={x + c * (cellSize + gap)} y={y + r * (cellSize + gap)}
            width={cellSize} height={cellSize} rx={2}
            fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={0.5} />
        ))
      )}
      {/* Flow arrows */}
      <text x={x - 10} y={y + gridH / 2} textAnchor="end" dominantBaseline="middle"
        fontSize="7" fill={COLORS.primary} fontFamily={FONTS.sans}>
        A →
      </text>
      <text x={x + gridW / 2} y={y - 16} textAnchor="middle"
        fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
        B ↓
      </text>
    </g>
  );
}

export default function XmxArchitectureDiagram() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Intel XMX architecture within Xe-Core">

      {/* Title */}
      <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Intel Xe-Core 内部结构 — XMX 矩阵引擎
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="9"
        fill="#64748b" fontFamily={FONTS.sans}>
        Xe2 架构 (Lunar Lake / Panther Lake) — 每 Xe-Core 含 8 个 XMX 单元
      </text>

      {/* Xe-Core outline */}
      <rect x={15} y={48} width={W - 30} height={H - 90} rx={8}
        fill="#fafbfc" stroke="#37474f" strokeWidth={2} />
      <text x={25} y={66} fontSize="11" fontWeight="700" fill="#37474f"
        fontFamily={FONTS.sans}>
        Xe-Core
      </text>

      {/* Left side: Vector Engines (2) */}
      <Block x={30} y={80} w={120} h={50}
        label="Vector Engine 0" sub="FP32/FP16/INT 8-wide SIMD"
        color={COLORS.primary} bg="#dbeafe" fontSize={9} />
      <Block x={30} y={140} w={120} h={50}
        label="Vector Engine 1" sub="FP32/FP16/INT 8-wide SIMD"
        color={COLORS.primary} bg="#dbeafe" fontSize={9} />

      {/* Right side: XMX engines (8, shown as 2×4 grid of systolic arrays) */}
      <rect x={170} y={74} width={345} height={192} rx={6}
        fill="none" stroke={COLORS.purple} strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={360} y={90} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.purple} fontFamily={FONTS.sans}>
        XMX 矩阵引擎 (×8)
      </text>

      {/* 2×4 grid of mini systolic arrays */}
      {Array.from({ length: 2 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <SystolicGrid key={`${row}-${col}`}
            x={195 + col * 78} y={112 + row * 78}
            rows={8} cols={8}
            label={`XMX ${row * 4 + col}`} />
        ))
      )}

      {/* Shared resources */}
      <Block x={30} y={205} w={120} h={40}
        label="Thread Control" sub="SIMD 调度"
        color={COLORS.orange} bg="#fff7ed" fontSize={9} />

      {/* SLM / L1 at bottom */}
      <rect x={30} y={268} width={250} height={30} rx={5}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
      <text x={155} y={286} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        SLM (Shared Local Memory) — 64 KB
      </text>

      <rect x={295} y={268} width={250} height={30} rx={5}
        fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={420} y={286} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>
        L1 Cache / Instruction Cache
      </text>

      {/* XMX specs summary */}
      <rect x={30} y={H - 34} width={W - 60} height={28} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={H - 16} textAnchor="middle" fontSize="8" fill="#64748b"
        fontFamily={FONTS.sans}>
        每 XMX 单元: 8×8 systolic array, 支持 FP16/BF16/TF32/INT8/INT4 |
        D(M×N) = A(M×K) × B(K×N) + C(M×N), M/N/K 取决于精度 |
        编程: SYCL joint_matrix / ESIMD
      </text>
    </svg>
  );
}
