import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

export default function HardwareComputePath({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '反量化路径 vs 原生低精度路径',
      dequantPath: 'Dequant 路径',
      nativePath: '原生低精度路径',
      int4Weight: 'INT4 Weight (存储)',
      fp16Weight: 'FP16 Weight (运行时还原)',
      fp16Gemm: 'FP16 GEMM',
      fp16Output: 'FP16 Output',
      int8Weight: 'INT8 Weight',
      int8Activ: 'INT8 Activ.',
      int8Gemm: 'INT8 GEMM (Tensor Core)',
      int32Accum: 'INT32 Accumulate',
      int32Sub: '防溢出',
      dequantize: 'dequantize',
      dequantDevice: 'CPU, 老 GPU, Metal',
      dequantOverhead: 'dequant 有额外开销',
      nativeDevice: 'H100/A100, Apple ANE, Intel AMX',
      nativeAdvantage: '无 dequant 开销, 吞吐量 2x',
      insight1: '量化不仅节省存储 — 在原生支持的硬件上还能跳过 dequant, 直接加速计算',
      insight2: 'FP8: H100 Tensor Core 原生支持 | INT8: A100/H100, Intel AMX/VNNI | INT4: Apple ANE',
      insight3: '选择量化方案时需考虑目标硬件是否支持原生低精度计算',
    },
    en: {
      title: 'Dequantization Path vs Native Low-Precision Path',
      dequantPath: 'Dequant Path',
      nativePath: 'Native Low-Precision Path',
      int4Weight: 'INT4 Weight (storage)',
      fp16Weight: 'FP16 Weight (runtime restored)',
      fp16Gemm: 'FP16 GEMM',
      fp16Output: 'FP16 Output',
      int8Weight: 'INT8 Weight',
      int8Activ: 'INT8 Activ.',
      int8Gemm: 'INT8 GEMM (Tensor Core)',
      int32Accum: 'INT32 Accumulate',
      int32Sub: 'prevent overflow',
      dequantize: 'dequantize',
      dequantDevice: 'CPU, old GPU, Metal',
      dequantOverhead: 'dequant has extra overhead',
      nativeDevice: 'H100/A100, Apple ANE, Intel AMX',
      nativeAdvantage: 'No dequant overhead, 2x throughput',
      insight1: 'Quantization not only saves storage — on natively supported hardware it can skip dequant and directly accelerate computation',
      insight2: 'FP8: H100 Tensor Core native | INT8: A100/H100, Intel AMX/VNNI | INT4: Apple ANE',
      insight3: 'When choosing quantization scheme, consider whether target hardware supports native low-precision compute',
    },
  }[locale];
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
        {t.title}
      </text>

      {/* Left: Dequant path */}
      <text x={leftX + colW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{t.dequantPath}</text>

      <Box x={leftX} y={60} w={colW} h={32} label={t.int4Weight} color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={92} y2={108} color={COLORS.mid} />
      <text x={leftX + colW + 8} y={103} fontSize="6.5" fill={COLORS.mid}
        fontFamily={FONTS.sans} fontStyle="italic">{t.dequantize}</text>

      <Box x={leftX} y={108} w={colW} h={32} label={t.fp16Weight} color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={140} y2={156} color={COLORS.mid} />

      <Box x={leftX} y={156} w={colW} h={32} label={t.fp16Gemm} color={COLORS.mid} />
      <Arrow x={leftX + colW / 2} y1={188} y2={204} color={COLORS.mid} />

      <Box x={leftX} y={204} w={colW} h={32} label={t.fp16Output} color={COLORS.mid} />

      <text x={leftX + colW / 2} y={255} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{t.dequantDevice}</text>
      <text x={leftX + colW / 2} y={270} textAnchor="middle" fontSize="7" fill={COLORS.red}
        fontFamily={FONTS.sans}>{t.dequantOverhead}</text>

      {/* Right: Native path */}
      <text x={rightX + colW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.nativePath}</text>

      <Box x={rightX} y={60} w={92} h={32} label={t.int8Weight} color={COLORS.primary} />
      <Box x={rightX + 102} y={60} w={93} h={32} label={t.int8Activ} color={COLORS.green} />
      <Arrow x={rightX + colW / 2} y1={92} y2={108} color={COLORS.primary} />

      <Box x={rightX} y={108} w={colW} h={32}
        label={t.int8Gemm} color={COLORS.primary} />
      <Arrow x={rightX + colW / 2} y1={140} y2={156} color={COLORS.primary} />

      <Box x={rightX} y={156} w={colW} h={32}
        label={t.int32Accum} color={COLORS.primary} sub={t.int32Sub} />
      <Arrow x={rightX + colW / 2} y1={188} y2={204} color={COLORS.primary} />

      <Box x={rightX} y={204} w={colW} h={32} label={t.fp16Output} color={COLORS.primary} />

      <text x={rightX + colW / 2} y={255} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>{t.nativeDevice}</text>
      <text x={rightX + colW / 2} y={270} textAnchor="middle" fontSize="7" fill={COLORS.green}
        fontFamily={FONTS.sans}>{t.nativeAdvantage}</text>

      {/* Divider */}
      <line x1={W / 2} y1={50} x2={W / 2} y2={280}
        stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />

      {/* Bottom insight */}
      <rect x={40} y={295} width={W - 80} height={70} rx={6}
        fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
      <text x={W / 2} y={316} textAnchor="middle" fontSize="8.5" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>
        {t.insight1}
      </text>
      <text x={W / 2} y={334} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        {t.insight2}
      </text>
      <text x={W / 2} y={350} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        {t.insight3}
      </text>
    </svg>
  );
}
