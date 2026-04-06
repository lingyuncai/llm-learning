import React, { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Dtype = 'fp16' | 'bf16' | 'int8';

const XmxUtilization: React.FC = () => {
  const [M, setM] = useState(256);
  const [K, setK] = useState(512);
  const [N, setN] = useState(1024);
  const [dtype, setDtype] = useState<Dtype>('fp16');

  const metrics = useMemo(() => {
    // XMX alignment requirements
    const alignment = dtype === 'int8' ? 32 : 16;
    const opsPerCycle = dtype === 'int8' ? 128 : 64;

    // Calculate aligned dimensions
    const M_aligned = Math.ceil(M / alignment) * alignment;
    const K_aligned = Math.ceil(K / alignment) * alignment;
    const N_aligned = Math.ceil(N / alignment) * alignment;

    // Theoretical ops (actual dimensions)
    const theoreticalOps = M * K * N * 2; // multiply-add = 2 ops

    // Actual ops (aligned dimensions, with padding waste)
    const actualOps = M_aligned * K_aligned * N_aligned * 2;

    // Utilization
    const utilization = (theoreticalOps / actualOps) * 100;

    // Alignment waste
    const alignmentWaste = 100 - utilization;

    // Effective throughput (based on utilization)
    const effectiveThroughput = (opsPerCycle * utilization) / 100;

    return {
      M_aligned,
      K_aligned,
      N_aligned,
      theoreticalOps,
      actualOps,
      utilization,
      alignmentWaste,
      opsPerCycle,
      effectiveThroughput,
      alignment,
    };
  }, [M, K, N, dtype]);

  const getUtilColor = (util: number) => {
    if (util >= 90) return COLORS.green;
    if (util >= 70) return COLORS.orange;
    return COLORS.red;
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 360" className="w-full">
        {/* Title */}
        <text x="290" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="16" fontWeight="600" fill={COLORS.dark}>
          XMX 利用率计算器
        </text>

        {/* Controls */}
        <g>
          {/* M slider */}
          <text x="40" y="55" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.dark}>M: {M}</text>
          <rect x="40" y="62" width="200" height="4" fill={COLORS.light} rx="2" />
          <rect x="40" y="62" width={(M - 32) / (4096 - 32) * 200} height="4" fill={COLORS.primary} rx="2" />
          <circle cx={40 + (M - 32) / (4096 - 32) * 200} cy="64" r="6" fill={COLORS.primary} stroke={COLORS.bg} strokeWidth="2" />

          {/* K slider */}
          <text x="40" y="90" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.dark}>K: {K}</text>
          <rect x="40" y="97" width="200" height="4" fill={COLORS.light} rx="2" />
          <rect x="40" y="97" width={(K - 32) / (4096 - 32) * 200} height="4" fill={COLORS.primary} rx="2" />
          <circle cx={40 + (K - 32) / (4096 - 32) * 200} cy="99" r="6" fill={COLORS.primary} stroke={COLORS.bg} strokeWidth="2" />

          {/* N slider */}
          <text x="40" y="125" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.dark}>N: {N}</text>
          <rect x="40" y="132" width="200" height="4" fill={COLORS.light} rx="2" />
          <rect x="40" y="132" width={(N - 32) / (4096 - 32) * 200} height="4" fill={COLORS.primary} rx="2" />
          <circle cx={40 + (N - 32) / (4096 - 32) * 200} cy="134" r="6" fill={COLORS.primary} stroke={COLORS.bg} strokeWidth="2" />

          {/* Dtype buttons */}
          <text x="340" y="65" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>数据类型:</text>
          {(['fp16', 'bf16', 'int8'] as Dtype[]).map((t, i) => (
            <g key={t}>
              <rect
                x={340 + i * 70}
                y={72}
                width={60}
                height={28}
                fill={dtype === t ? COLORS.primary : COLORS.bgAlt}
                stroke={COLORS.primary}
                strokeWidth="1.5"
                rx="4"
                style={{ cursor: 'pointer' }}
              />
              <text
                x={370 + i * 70}
                y={90}
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontSize="12"
                fontWeight={dtype === t ? '600' : '400'}
                fill={dtype === t ? COLORS.bg : COLORS.dark}
                style={{ cursor: 'pointer', pointerEvents: 'none' }}
              >
                {t.toUpperCase()}
              </text>
            </g>
          ))}
        </g>

        {/* Utilization bar */}
        <g transform="translate(0, 160)">
          <text x="40" y="0" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>XMX 利用率</text>
          <rect x="40" y="10" width="500" height="30" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <rect
            x="40"
            y="10"
            width={(metrics.utilization / 100) * 500}
            height="30"
            fill={getUtilColor(metrics.utilization)}
            rx="4"
          />
          <text
            x="290"
            y="30"
            textAnchor="middle"
            fontFamily={FONTS.mono}
            fontSize="14"
            fontWeight="700"
            fill={COLORS.dark}
          >
            {metrics.utilization.toFixed(1)}%
          </text>
        </g>

        {/* Alignment info */}
        <g transform="translate(0, 220)">
          <rect x="40" y="0" width="240" height="120" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <text x="160" y="20" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            对齐要求
          </text>
          <text x="160" y="40" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.mid}>
            对齐粒度: {metrics.alignment}×{metrics.alignment}
          </text>
          <text x="160" y="60" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
            实际维度: {M}×{K}×{N}
          </text>
          <text x="160" y="78" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.orange}>
            对齐后: {metrics.M_aligned}×{metrics.K_aligned}×{metrics.N_aligned}
          </text>
          <text x="160" y="96" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.red}>
            对齐浪费: {metrics.alignmentWaste.toFixed(1)}%
          </text>
          <text x="160" y="112" textAnchor="middle" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
            理论 {(metrics.theoreticalOps / 1e6).toFixed(1)}M ops
          </text>
        </g>

        {/* Throughput comparison */}
        <g transform="translate(290, 220)">
          <rect x="0" y="0" width="250" height="120" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <text x="125" y="20" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            吞吐量对比
          </text>
          <text x="125" y="40" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.mid}>
            XMX 峰值: {metrics.opsPerCycle} ops/cycle
          </text>
          <text x="125" y="60" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={getUtilColor(metrics.utilization)}>
            实际: {metrics.effectiveThroughput.toFixed(1)} ops/cycle
          </text>

          {/* Bars */}
          <rect x="20" y="70" width="90" height="16" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="1" rx="2" />
          <rect x="20" y="70" width="90" height="16" fill={COLORS.primary} rx="2" />
          <text x="65" y="82" textAnchor="middle" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.bg}>理论峰值</text>

          <rect x="20" y="92" width={(metrics.utilization / 100) * 90} height="16" fill={getUtilColor(metrics.utilization)} rx="2" />
          <rect x="20" y="92" width="90" height="16" fill="none" stroke={COLORS.mid} strokeWidth="1" rx="2" />
          <text x="65" y="104" textAnchor="middle" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>实际利用</text>
        </g>

        {/* Recommendation */}
        <g transform="translate(40, 350)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {metrics.utilization >= 90
              ? `✓ 优秀 — 维度已充分对齐，XMX 利用率高`
              : metrics.utilization >= 70
              ? `⚠ 可优化 — 建议调整维度为 ${metrics.alignment} 的倍数`
              : `✗ 低效 — 大量对齐浪费，强烈建议使用 ${metrics.alignment}×${metrics.alignment} 对齐的维度`}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default XmxUtilization;
