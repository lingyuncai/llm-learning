import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function HardwareComputePath() {
  const leftX = 55;
  const rightX = 320;
  const colW = 195;

  function Box({ x, y, w, h, label, color, sub }: {
    x: number; y: number; w: number; h: number;
    label: string; color: string; sub?: string;
  }) {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={6}
          fill={color} opacity={0.12} stroke={color} strokeWidth={1.5} />
        <text x={x + w / 2} y={y + h / 2 + (sub ? -4 : 3)} textAnchor="middle"
          fontSize="8.5" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
          {label}
        </text>
        {sub && (
          <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
            fontSize="7" fill={color} opacity={0.7} fontFamily={FONTS.sans}>
            {sub}
          </text>
        )}
      </g>
    );
  }

  function Arrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
    return (
      <g>
        <line x1={x} y1={y1} x2={x} y2={y2 - 6} stroke={color} strokeWidth={1.2} />
        <polygon points={`${x - 4},${y2 - 8} ${x + 4},${y2 - 8} ${x},${y2}`} fill={color} />
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        反量化路径 vs 原生低精度路径
      </text>

      {/* Left: Dequant path */}
      <text x={leftX + colW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.mid} fontFamily={FONTS.sans}>Dequant 路径</text>

      <Box x={leftX} y={60} w={colW} h={32} label="INT4 Weight (存储)" color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={92} y2={108} color={COLORS.mid} />
      <text x={leftX + colW + 8} y={103} fontSize="6.5" fill={COLORS.mid}
        fontFamily={FONTS.sans} fontStyle="italic">dequantize</text>

      <Box x={leftX} y={108} w={colW} h={32} label="FP16 Weight (运行时还原)" color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={140} y2={156} color={COLORS.mid} />

      <Box x={leftX} y={156} w={colW} h={32} label="FP16 GEMM" color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={188} y2={204} color={COLORS.mid} />

      <Box x={leftX} y={204} w={colW} h={32} label="FP16 Output" color={COLORS.mid} />

      <text x={leftX + colW / 2} y={255} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>CPU, 老 GPU, Metal</text>
      <text x={leftX + colW / 2} y={270} textAnchor="middle" fontSize="7" fill={COLORS.red}
        fontFamily={FONTS.sans}>dequant 有额外开销</text>

      {/* Right: Native path */}
      <text x={rightX + colW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>原生低精度路径</text>

      <Box x={rightX} y={60} w={92} h={32} label="INT8 Weight" color={COLORS.primary} />
      <Box x={rightX + 102} y={60} w={93} h={32} label="INT8 Activ." color={COLORS.green} />
      <Arrow x={rightX + colW / 2} y1={92} y2={108} color={COLORS.primary} />

      <Box x={rightX} y={108} w={colW} h={32}
        label="INT8 GEMM (Tensor Core)" color={COLORS.primary} />
      <Arrow x={rightX + colW / 2} y1={140} y2={156} color={COLORS.primary} />

      <Box x={rightX} y={156} w={colW} h={32}
        label="INT32 Accumulate" color={COLORS.primary} sub="防溢出" />
      <Arrow x={rightX + colW / 2} y1={188} y2={204} color={COLORS.primary} />

      <Box x={rightX} y={204} w={colW} h={32} label="FP16 Output" color={COLORS.primary} />

      <text x={rightX + colW / 2} y={255} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>H100/A100, Apple ANE, Intel AMX</text>
      <text x={rightX + colW / 2} y={270} textAnchor="middle" fontSize="7" fill={COLORS.green}
        fontFamily={FONTS.sans}>无 dequant 开销, 吞吐量 2x</text>

      {/* Divider */}
      <line x1={W / 2} y1={50} x2={W / 2} y2={280}
        stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />

      {/* Bottom insight */}
      <rect x={40} y={295} width={W - 80} height={70} rx={6}
        fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
      <text x={W / 2} y={316} textAnchor="middle" fontSize="8.5" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>
        量化不仅节省存储 — 在原生支持的硬件上还能跳过 dequant, 直接加速计算
      </text>
      <text x={W / 2} y={334} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        FP8: H100 Tensor Core 原生支持 | INT8: A100/H100, Intel AMX/VNNI | INT4: Apple ANE
      </text>
      <text x={W / 2} y={350} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        选择量化方案时需考虑目标硬件是否支持原生低精度计算
      </text>
    </svg>
  );
}
