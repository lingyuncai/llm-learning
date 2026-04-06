import React, { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Dtype = 'fp16' | 'bf16' | 'int8';

const XmxUtilization: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const [M, setM] = useState(256);
  const [K, setK] = useState(512);
  const [N, setN] = useState(1024);
  const [dtype, setDtype] = useState<Dtype>('fp16');

  const t = {
    zh: {
      title: 'XMX 利用率计算器',
      utilization: 'XMX 利用率',
      alignReq: '对齐要求',
      alignGranularity: '对齐粒度',
      actualDim: '实际维度',
      alignedDim: '对齐后',
      alignWaste: '对齐浪费',
      theoretical: '理论',
      throughputCompare: '吞吐量对比',
      xmxPeak: 'XMX 峰值',
      actual: '实际',
      theoreticalPeak: '理论峰值',
      actualUtil: '实际利用',
      excellent: '✓ 优秀 — 维度已充分对齐，XMX 利用率高',
      canOptimize: '⚠ 可优化 — 建议调整维度为',
      multipleTail: '的倍数',
      inefficient: '✗ 低效 — 大量对齐浪费，强烈建议使用',
      alignedDim2: '对齐的维度',
      dataType: '数据类型',
    },
    en: {
      title: 'XMX Utilization Calculator',
      utilization: 'XMX Utilization',
      alignReq: 'Alignment Requirements',
      alignGranularity: 'Alignment Granularity',
      actualDim: 'Actual Dimensions',
      alignedDim: 'Aligned',
      alignWaste: 'Alignment Waste',
      theoretical: 'Theoretical',
      throughputCompare: 'Throughput Comparison',
      xmxPeak: 'XMX Peak',
      actual: 'Actual',
      theoreticalPeak: 'Theoretical Peak',
      actualUtil: 'Actual Utilization',
      excellent: '✓ Excellent — Dimensions well aligned, high XMX utilization',
      canOptimize: '⚠ Optimizable — Consider adjusting dimensions to multiples of',
      multipleTail: '',
      inefficient: '✗ Inefficient — Significant alignment waste, strongly recommend using',
      alignedDim2: 'aligned dimensions',
      dataType: 'Data Type',
    },
  }[locale];

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
      {/* HTML controls for interactivity */}
      <div className="flex flex-wrap gap-4 mb-3">
        <div>
          <label className="text-xs text-gray-500 block">M: {M}</label>
          <input type="range" min={32} max={4096} step={32} value={M}
            onChange={e => setM(Number(e.target.value))} className="w-36" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">K: {K}</label>
          <input type="range" min={32} max={4096} step={32} value={K}
            onChange={e => setK(Number(e.target.value))} className="w-36" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">N: {N}</label>
          <input type="range" min={32} max={4096} step={32} value={N}
            onChange={e => setN(Number(e.target.value))} className="w-36" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">{t.dataType}</label>
          <div className="flex gap-1">
            {(['fp16', 'bf16', 'int8'] as Dtype[]).map(dt => (
              <button
                key={dt}
                onClick={() => setDtype(dt)}
                className={`px-2 py-1 text-xs rounded border ${dtype === dt ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {dt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <svg viewBox="0 0 580 280" className="w-full">
        {/* Title */}
        <text x="290" y="20" textAnchor="middle" fontFamily={FONTS.sans} fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Utilization bar */}
        <g transform="translate(0, 40)">
          <text x="40" y="0" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>{t.utilization}</text>
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
        <g transform="translate(0, 100)">
          <rect x="40" y="0" width="240" height="120" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <text x="160" y="20" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.alignReq}
          </text>
          <text x="160" y="40" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.mid}>
            {t.alignGranularity}: {metrics.alignment}×{metrics.alignment}
          </text>
          <text x="160" y="60" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
            {t.actualDim}: {M}×{K}×{N}
          </text>
          <text x="160" y="78" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.orange}>
            {t.alignedDim}: {metrics.M_aligned}×{metrics.K_aligned}×{metrics.N_aligned}
          </text>
          <text x="160" y="96" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.red}>
            {t.alignWaste}: {metrics.alignmentWaste.toFixed(1)}%
          </text>
          <text x="160" y="112" textAnchor="middle" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
            {t.theoretical} {(metrics.theoreticalOps / 1e6).toFixed(1)}M ops
          </text>
        </g>

        {/* Throughput comparison */}
        <g transform="translate(290, 100)">
          <rect x="0" y="0" width="250" height="120" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
          <text x="125" y="20" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.throughputCompare}
          </text>
          <text x="125" y="40" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.mid}>
            {t.xmxPeak}: {metrics.opsPerCycle} ops/cycle
          </text>
          <text x="125" y="60" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={getUtilColor(metrics.utilization)}>
            {t.actual}: {metrics.effectiveThroughput.toFixed(1)} ops/cycle
          </text>

          {/* Bars */}
          <rect x="20" y="70" width="90" height="16" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="1" rx="2" />
          <rect x="20" y="70" width="90" height="16" fill={COLORS.primary} rx="2" />
          <text x="65" y="82" textAnchor="middle" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.bg}>{t.theoreticalPeak}</text>

          <rect x="20" y="92" width={(metrics.utilization / 100) * 90} height="16" fill={getUtilColor(metrics.utilization)} rx="2" />
          <rect x="20" y="92" width="90" height="16" fill="none" stroke={COLORS.mid} strokeWidth="1" rx="2" />
          <text x="65" y="104" textAnchor="middle" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>{t.actualUtil}</text>
        </g>

        {/* Recommendation */}
        <g transform="translate(40, 240)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {metrics.utilization >= 90
              ? t.excellent
              : metrics.utilization >= 70
              ? `${t.canOptimize} ${metrics.alignment} ${t.multipleTail}`
              : `${t.inefficient} ${metrics.alignment}×${metrics.alignment} ${t.alignedDim2}`}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default XmxUtilization;
