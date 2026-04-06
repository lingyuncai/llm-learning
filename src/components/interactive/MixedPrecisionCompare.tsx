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

const specs: Record<Precision, PrecisionSpec> = {
  fp32: {
    name: 'FP32',
    throughput: 1,
    bandwidth: 4,
    precisionLevel: '高精度',
    xmxAccel: false,
    recommendation: '训练阶段，精度要求极高的场景',
  },
  fp16: {
    name: 'FP16',
    throughput: 2,
    bandwidth: 2,
    precisionLevel: '中等精度',
    xmxAccel: true,
    recommendation: '推理首选，精度与性能平衡最佳',
  },
  bf16: {
    name: 'BF16',
    throughput: 2,
    bandwidth: 2,
    precisionLevel: '中等精度 (动态范围大)',
    xmxAccel: true,
    recommendation: '训练与推理通用，避免溢出问题',
  },
  int8: {
    name: 'INT8',
    throughput: 4,
    bandwidth: 1,
    precisionLevel: '低精度',
    xmxAccel: true,
    recommendation: '量化推理，最高吞吐量，需要校准',
  },
};

const MixedPrecisionCompare: React.FC = () => {
  const [selected, setSelected] = useState<Precision>('fp16');

  const spec = specs[selected];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 360" className="w-full">
        {/* Title */}
        <text x="290" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Xe2 混合精度性能对比
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
            相对吞吐量 (vs FP32)
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
            {spec.throughput}× ({spec.throughput === 1 ? 'baseline' : spec.throughput === 2 ? '2× faster' : '4× faster'})
          </text>

          {/* Bandwidth savings */}
          <text x="0" y="60" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            内存带宽需求
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
            {spec.bandwidth} bytes/element ({spec.bandwidth === 4 ? 'baseline' : spec.bandwidth === 2 ? '50% 节省' : '75% 节省'})
          </text>

          {/* Precision level */}
          <text x="0" y="120" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            精度级别
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
            XMX 硬件加速
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
            {spec.xmxAccel ? '✓ 支持' : '✗ 不支持'}
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
            推荐场景
          </text>
          <text x="250" y="45" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
            {spec.recommendation}
          </text>
          <text x="250" y="62" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
            {selected === 'int8' && 'XMX INT8: 128 ops/cycle'}
            {(selected === 'fp16' || selected === 'bf16') && 'XMX FP16/BF16: 64 ops/cycle'}
            {selected === 'fp32' && 'FP32 FPU: 基础性能，无 XMX 加速'}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default MixedPrecisionCompare;
