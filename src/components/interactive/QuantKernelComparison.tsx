import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

type HardwareId = 'a100' | 'h100';
type OpId = 'matmul_4096' | 'matmul_8192' | 'matmul_16384';

interface FormatData {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  a100: number | null; // TOPS, null = not supported
  h100: number | null;
  note?: string;
}

const W = 800;
const H = 480;

const FORMATS: FormatData[] = [
  { id: 'fp32', label: 'FP32 (non-TC)', shortLabel: 'FP32', color: COLORS.mid, a100: 19.5, h100: 67 },
  { id: 'tf32', label: 'TF32 (TC)', shortLabel: 'TF32', color: COLORS.primary, a100: 156, h100: 989 },
  { id: 'fp16', label: 'FP16/BF16 (TC)', shortLabel: 'FP16', color: COLORS.green, a100: 312, h100: 1979 },
  { id: 'int8', label: 'INT8 (TC)', shortLabel: 'INT8', color: COLORS.orange, a100: 624, h100: 1979 },
  { id: 'fp8', label: 'FP8 E4M3 (TC)', shortLabel: 'FP8', color: COLORS.purple, a100: null, h100: 1979 },
  { id: 'int4', label: 'INT4 (effective)*', shortLabel: 'INT4', color: COLORS.red, a100: 250, h100: 700, note: 'dequant→FP16, memory-bound' },
];

const OP_SIZES: { id: OpId; label: { zh: string; en: string }; scale: number }[] = [
  { id: 'matmul_4096', label: { zh: 'MatMul 4096×4096', en: 'MatMul 4096x4096' }, scale: 1.0 },
  { id: 'matmul_8192', label: { zh: 'MatMul 8192×8192', en: 'MatMul 8192x8192' }, scale: 1.0 },
  { id: 'matmul_16384', label: { zh: 'MatMul 16384×16384', en: 'MatMul 16384x16384' }, scale: 1.0 },
];

export default function QuantKernelComparison({ locale = 'zh' }: Props) {
  const [hardware, setHardware] = useState<HardwareId>('a100');
  const [opIdx, setOpIdx] = useState(0);

  const t = {
    zh: {
      title: '量化 Kernel 性能对比',
      hardware: '硬件',
      opSize: '操作规模',
      peakTops: '峰值吞吐 (TOPS/TFLOPS)',
      notSupported: '不支持',
      note: '*INT4: 无原生 TC 指令，运行时 dequant 到 FP16，受限于显存带宽',
      ratio: '相对 FP32',
      keyInsight: '关键洞察',
      insight1: 'FP16 TC ≈ 16× FP32 非 TC 吞吐',
      insight2: 'INT8 TC ≈ 2× FP16 TC (A100)',
      insight3: 'H100 FP8 = INT8 = FP16 吞吐 (均 1,979 TOPS)',
      insight4: 'INT4 因 dequant 开销反而低于 INT8',
    },
    en: {
      title: 'Quantized Kernel Performance Comparison',
      hardware: 'Hardware',
      opSize: 'Operation Size',
      peakTops: 'Peak Throughput (TOPS/TFLOPS)',
      notSupported: 'N/A',
      note: '*INT4: no native TC op, on-the-fly dequant to FP16, memory-bandwidth bound',
      ratio: 'vs FP32',
      keyInsight: 'Key Insights',
      insight1: 'FP16 TC ≈ 16x FP32 non-TC throughput',
      insight2: 'INT8 TC ≈ 2x FP16 TC (A100)',
      insight3: 'H100 FP8 = INT8 = FP16 throughput (all 1,979 TOPS)',
      insight4: 'INT4 lower than INT8 due to dequant overhead',
    },
  }[locale]!;

  const activeFormats = useMemo(() => {
    return FORMATS.filter(f => {
      const val = hardware === 'a100' ? f.a100 : f.h100;
      return val !== null;
    });
  }, [hardware]);

  const maxTops = useMemo(() => {
    return Math.max(...activeFormats.map(f => (hardware === 'a100' ? f.a100 : f.h100) || 0));
  }, [activeFormats, hardware]);

  const chartLeft = 140;
  const chartRight = W - 30;
  const chartTop = 130;
  const chartBottom = H - 110;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;
  const barGap = 12;
  const barCount = activeFormats.length;
  const groupW = chartW / barCount;
  const barW = Math.min(groupW - barGap * 2, 60);

  const fp32Val = hardware === 'a100' ? 19.5 : 67;

  return (
    <div className="my-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-3 items-center">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium" style={{ color: COLORS.dark }}>{t.hardware}:</span>
          {(['a100', 'h100'] as HardwareId[]).map(hw => (
            <button
              key={hw}
              onClick={() => setHardware(hw)}
              className="px-3 py-1 text-sm rounded-md transition-colors"
              style={{
                backgroundColor: hardware === hw ? COLORS.primary : COLORS.bgAlt,
                color: hardware === hw ? '#fff' : COLORS.dark,
                border: `1px solid ${hardware === hw ? COLORS.primary : COLORS.light}`,
              }}
            >
              {hw === 'a100' ? 'A100 SXM' : 'H100 SXM5'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium" style={{ color: COLORS.dark }}>{t.opSize}:</span>
          {OP_SIZES.map((op, i) => (
            <button
              key={op.id}
              onClick={() => setOpIdx(i)}
              className="px-3 py-1 text-sm rounded-md transition-colors"
              style={{
                backgroundColor: opIdx === i ? COLORS.green : COLORS.bgAlt,
                color: opIdx === i ? '#fff' : COLORS.dark,
                border: `1px solid ${opIdx === i ? COLORS.green : COLORS.light}`,
              }}
            >
              {op.label[locale]}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={48} textAnchor="middle" fontSize="12" fill={COLORS.mid}>
          {hardware === 'a100' ? 'NVIDIA A100 SXM 80GB' : 'NVIDIA H100 SXM5 80GB'} — {t.peakTops}
        </text>

        {/* Y-axis */}
        <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke={COLORS.light} strokeWidth="1" />
        {/* Y-axis gridlines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
          const y = chartBottom - frac * chartH;
          const val = Math.round(frac * maxTops);
          return (
            <g key={i}>
              <line x1={chartLeft} y1={y} x2={chartRight} y2={y} stroke={COLORS.light} strokeWidth="0.5" strokeDasharray="3 3" />
              <text x={chartLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fontFamily={FONTS.mono} fill={COLORS.mid}>
                {val}
              </text>
            </g>
          );
        })}

        {/* Y-axis label */}
        <text
          x={30}
          y={(chartTop + chartBottom) / 2}
          textAnchor="middle"
          fontSize="11"
          fill={COLORS.mid}
          transform={`rotate(-90, 30, ${(chartTop + chartBottom) / 2})`}
        >
          TOPS / TFLOPS
        </text>

        {/* X-axis */}
        <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke={COLORS.light} strokeWidth="1" />

        {/* Bars */}
        {activeFormats.map((format, i) => {
          const val = (hardware === 'a100' ? format.a100 : format.h100) || 0;
          const barH = (val / maxTops) * chartH;
          const bx = chartLeft + i * groupW + (groupW - barW) / 2;
          const by = chartBottom - barH;
          const ratio = Math.round(val / fp32Val * 10) / 10;

          return (
            <g key={format.id}>
              <motion.rect
                x={bx}
                y={by}
                width={barW}
                height={barH}
                rx={3}
                fill={format.color}
                fillOpacity={0.75}
                initial={{ height: 0, y: chartBottom }}
                animate={{ height: barH, y: by }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              />
              {/* Value label */}
              <motion.text
                x={bx + barW / 2}
                y={by - 14}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fontFamily={FONTS.mono}
                fill={format.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
              >
                {val.toLocaleString()}
              </motion.text>
              {/* Ratio label */}
              {format.id !== 'fp32' && (
                <motion.text
                  x={bx + barW / 2}
                  y={by - 3}
                  textAnchor="middle"
                  fontSize="9"
                  fill={COLORS.mid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                >
                  {ratio}x
                </motion.text>
              )}
              {/* X-axis label */}
              <text
                x={bx + barW / 2}
                y={chartBottom + 15}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={format.color}
              >
                {format.shortLabel}
              </text>
              {/* Sublabel (TC or not) */}
              <text
                x={bx + barW / 2}
                y={chartBottom + 27}
                textAnchor="middle"
                fontSize="8"
                fill={COLORS.mid}
              >
                {format.id === 'fp32' ? 'non-TC' : 'TC'}
              </text>
            </g>
          );
        })}

        {/* Note about INT4 */}
        <text x={chartLeft} y={chartBottom + 48} fontSize="10" fill={COLORS.mid} fontStyle="italic">
          {t.note}
        </text>

        {/* Key insights box */}
        <rect x={chartLeft} y={chartBottom + 60} width={chartW} height={58} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
        <text x={chartLeft + 10} y={chartBottom + 77} fontSize="11" fontWeight="700" fill={COLORS.dark}>
          {t.keyInsight}:
        </text>
        <text x={chartLeft + 10} y={chartBottom + 92} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {hardware === 'a100'
            ? `${t.insight1} | ${t.insight2} | ${t.insight4}`
            : `${t.insight1} | ${t.insight3} | ${t.insight4}`
          }
        </text>
        <text x={chartLeft + 10} y={chartBottom + 107} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {hardware === 'h100' ? t.insight3 : t.insight2}
        </text>
      </svg>
    </div>
  );
}
