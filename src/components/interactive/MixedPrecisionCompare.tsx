import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Precision = 'fp32' | 'fp16' | 'bf16' | 'int8';

interface PrecisionSpec {
  name: string;
  throughput: number; // relative to FP32
  bandwidth: number; // bytes per element
  precisionLevel: string;
  xmxAccel: boolean;
  recommendation: string;
}

const MixedPrecisionCompare: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      title: 'Xe2 混合精度性能对比',
      throughputLabel: '相对吞吐量 (vs FP32)',
      bandwidthLabel: '内存带宽需求',
      precisionLabel: '精度级别',
      xmxLabel: 'XMX 硬件加速',
      recommendationLabel: '推荐场景',
      baseline: 'baseline',
      faster: 'faster',
      bytesPerElement: 'bytes/element',
      savings: '节省',
      supported: '✓ 支持',
      notSupported: '✗ 不支持',
      specs: {
        fp32: {
          precisionLevel: '高精度',
          recommendation: '训练阶段，精度要求极高的场景',
          xmxInfo: 'FP32 FPU: 基础性能，无 XMX 加速',
        },
        fp16: {
          precisionLevel: '中等精度',
          recommendation: '推理首选，精度与性能平衡最佳',
          xmxInfo: 'XMX FP16/BF16: 64 ops/cycle',
        },
        bf16: {
          precisionLevel: '中等精度 (动态范围大)',
          recommendation: '训练与推理通用，避免溢出问题',
          xmxInfo: 'XMX FP16/BF16: 64 ops/cycle',
        },
        int8: {
          precisionLevel: '低精度',
          recommendation: '量化推理，最高吞吐量，需要校准',
          xmxInfo: 'XMX INT8: 128 ops/cycle',
        },
      },
    },
    en: {
      title: 'Xe2 Mixed Precision Performance Comparison',
      throughputLabel: 'Relative Throughput (vs FP32)',
      bandwidthLabel: 'Memory Bandwidth Requirement',
      precisionLabel: 'Precision Level',
      xmxLabel: 'XMX Hardware Acceleration',
      recommendationLabel: 'Recommended Scenarios',
      baseline: 'baseline',
      faster: 'faster',
      bytesPerElement: 'bytes/element',
      savings: 'saved',
      supported: '✓ Supported',
      notSupported: '✗ Not Supported',
      specs: {
        fp32: {
          precisionLevel: 'High precision',
          recommendation: 'Training phase, scenarios requiring extreme precision',
          xmxInfo: 'FP32 FPU: baseline performance, no XMX acceleration',
        },
        fp16: {
          precisionLevel: 'Medium precision',
          recommendation: 'Inference first choice, best balance of precision and performance',
          xmxInfo: 'XMX FP16/BF16: 64 ops/cycle',
        },
        bf16: {
          precisionLevel: 'Medium precision (large dynamic range)',
          recommendation: 'Universal for training and inference, avoids overflow',
          xmxInfo: 'XMX FP16/BF16: 64 ops/cycle',
        },
        int8: {
          precisionLevel: 'Low precision',
          recommendation: 'Quantized inference, highest throughput, requires calibration',
          xmxInfo: 'XMX INT8: 128 ops/cycle',
        },
      },
    },
  }[locale];

  const specs: Record<Precision, PrecisionSpec> = {
    fp32: {
      name: 'FP32',
      throughput: 1,
      bandwidth: 4,
      precisionLevel: t.specs.fp32.precisionLevel,
      xmxAccel: false,
      recommendation: t.specs.fp32.recommendation,
    },
    fp16: {
      name: 'FP16',
      throughput: 2,
      bandwidth: 2,
      precisionLevel: t.specs.fp16.precisionLevel,
      xmxAccel: true,
      recommendation: t.specs.fp16.recommendation,
    },
    bf16: {
      name: 'BF16',
      throughput: 2,
      bandwidth: 2,
      precisionLevel: t.specs.bf16.precisionLevel,
      xmxAccel: true,
      recommendation: t.specs.bf16.recommendation,
    },
    int8: {
      name: 'INT8',
      throughput: 4,
      bandwidth: 1,
      precisionLevel: t.specs.int8.precisionLevel,
      xmxAccel: true,
      recommendation: t.specs.int8.recommendation,
    },
  };
  const [selected, setSelected] = useState<Precision>('fp16');

  const spec = specs[selected];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 360" className="w-full">
        {/* Title */}
        <text x="290" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Precision buttons */}
        <g transform="translate(100, 45)">
          {(['fp32', 'fp16', 'bf16', 'int8'] as Precision[]).map((p, i) => (
            <g key={p} transform={`translate(${i * 95}, 0)`}>
              <rect
                x="0"
                y="0"
                width="85"
                height="32"
                fill={selected === p ? COLORS.primary : COLORS.bgAlt}
                stroke={COLORS.primary}
                strokeWidth="2"
                rx="4"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(p)}
              />
              <text
                x="42.5"
                y="21"
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontSize="13"
                fontWeight={selected === p ? '700' : '500'}
                fill={selected === p ? COLORS.bg : COLORS.dark}
                style={{ cursor: 'pointer', pointerEvents: 'none' }}
              >
                {specs[p].name}
              </text>
            </g>
          ))}
        </g>

        {/* Comparison bars */}
        <g transform="translate(40, 110)">
          {/* Throughput */}
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.throughputLabel}
          </text>
          <rect x="0" y="8" width="500" height="30" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <rect
            x="0"
            y="8"
            width={(spec.throughput / 4) * 500}
            height="30"
            fill={COLORS.green}
            rx="4"
          />
          <text
            x="10"
            y="28"
            fontFamily={FONTS.mono}
            fontSize="13"
            fontWeight="700"
            fill={COLORS.dark}
          >
            {spec.throughput}× ({spec.throughput === 1 ? t.baseline : spec.throughput === 2 ? `2× ${t.faster}` : `4× ${t.faster}`})
          </text>

          {/* Bandwidth savings */}
          <text x="0" y="60" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.bandwidthLabel}
          </text>
          <rect x="0" y="68" width="500" height="30" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <rect
            x="0"
            y="68"
            width={(spec.bandwidth / 4) * 500}
            height="30"
            fill={COLORS.orange}
            rx="4"
          />
          <text
            x="10"
            y="88"
            fontFamily={FONTS.mono}
            fontSize="13"
            fontWeight="700"
            fill={COLORS.dark}
          >
            {spec.bandwidth} {t.bytesPerElement} ({spec.bandwidth === 4 ? t.baseline : spec.bandwidth === 2 ? `50% ${t.savings}` : `75% ${t.savings}`})
          </text>

          {/* Precision level */}
          <text x="0" y="120" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.precisionLabel}
          </text>
          <rect x="0" y="128" width="500" height="30" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <text
            x="250"
            y="148"
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize="12"
            fill={COLORS.dark}
          >
            {spec.precisionLevel}
          </text>

          {/* XMX acceleration */}
          <text x="0" y="180" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.xmxLabel}
          </text>
          <rect x="0" y="188" width="500" height="30" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <text
            x="250"
            y="208"
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize="13"
            fontWeight="700"
            fill={spec.xmxAccel ? COLORS.green : COLORS.red}
          >
            {spec.xmxAccel ? t.supported : t.notSupported}
          </text>
        </g>

        {/* Recommendation box */}
        <g transform="translate(40, 270)">
          <rect
            x="0"
            y="0"
            width="500"
            height="70"
            fill={COLORS.valid}
            stroke={COLORS.primary}
            strokeWidth="2"
            rx="4"
          />
          <text x="250" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>
            {t.recommendationLabel}
          </text>
          <text x="250" y="45" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
            {spec.recommendation}
          </text>
          <text x="250" y="62" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
            {selected === 'int8' && t.specs.int8.xmxInfo}
            {(selected === 'fp16' || selected === 'bf16') && (selected === 'fp16' ? t.specs.fp16.xmxInfo : t.specs.bf16.xmxInfo)}
            {selected === 'fp32' && t.specs.fp32.xmxInfo}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default MixedPrecisionCompare;
