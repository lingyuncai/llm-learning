// src/components/interactive/ArithmeticIntensityCalc.tsx
// Interactive: M/N/K → FLOPs, memory, arithmetic intensity, roofline position
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 280;

export default function ArithmeticIntensityCalc({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      mLabel: 'M (rows of A, C)',
      nLabel: 'N (cols of B, C)',
      kLabel: 'K (inner dimension)',
      rooflinePosition: 'Roofline 位置 (H100 FP32 CUDA Core)',
      memoryBound: 'Memory-bound',
      computeBound: 'Compute-bound',
      computeBoundInsight: 'Compute-bound: 计算量充足，可以充分利用 Tensor Core',
      memoryBoundInsight: 'Memory-bound: 带宽是瓶颈，需要更大的矩阵或 batch 来提高 AI',
      typicalLLM: '典型 LLM: M=batch*seq, K=N=hidden_dim (4096+) → AI 通常 > 100 → Compute-bound',
      gemmOptGoal: 'GEMM 优化的目标: 让实际 FLOPS 接近 peak (FP32: {peak}T, FP16 TC: 990T)',
      ridge: 'ridge: {value}',
    },
    en: {
      mLabel: 'M (rows of A, C)',
      nLabel: 'N (cols of B, C)',
      kLabel: 'K (inner dimension)',
      rooflinePosition: 'Roofline Position (H100 FP32 CUDA Core)',
      memoryBound: 'Memory-bound',
      computeBound: 'Compute-bound',
      computeBoundInsight: 'Compute-bound: sufficient compute, can fully utilize Tensor Core',
      memoryBoundInsight: 'Memory-bound: bandwidth is bottleneck, need larger matrix or batch to increase AI',
      typicalLLM: 'Typical LLM: M=batch*seq, K=N=hidden_dim (4096+) → AI usually > 100 → Compute-bound',
      gemmOptGoal: 'GEMM optimization goal: bring actual FLOPS close to peak (FP32: {peak}T, FP16 TC: 990T)',
      ridge: 'ridge: {value}',
    },
  }[locale];
  const [M, setM] = useState(4096);
  const [N, setN] = useState(4096);
  const [K, setK] = useState(4096);

  const flops = 2 * M * N * K;
  const bytesA = M * K * 4; // float32
  const bytesB = K * N * 4;
  const bytesC = M * N * 4;
  const totalBytes = bytesA + bytesB + bytesC;
  const ai = flops / totalBytes; // arithmetic intensity

  // H100 specs for roofline (FP32 CUDA Core — consistent with float32 memory calc)
  const peakFlops = 67e12;  // FP32 CUDA Core TFLOPS
  const peakBW = 3.35e12;   // HBM bandwidth bytes/s
  const ridgePoint = peakFlops / peakBW; // ~20 FLOPs/byte

  const isComputeBound = ai > ridgePoint;

  // Format large numbers
  const fmt = (n: number) => {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}G`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${n}`;
  };

  // Roofline visualization (simplified horizontal bar)
  const logAI = Math.log2(Math.max(1, ai));
  const logRidge = Math.log2(ridgePoint);
  const logMax = logRidge + 4;
  const barX = 60;
  const barW = 460;
  const aiPos = barX + Math.min(barW, (logAI / logMax) * barW);
  const ridgePos = barX + (logRidge / logMax) * barW;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">{t.mLabel}</span>
          <select value={M} onChange={e => setM(+e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-mono">
            {[512, 1024, 2048, 4096, 8192, 16384].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">{t.nLabel}</span>
          <select value={N} onChange={e => setN(+e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-mono">
            {[512, 1024, 2048, 4096, 8192, 16384].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">{t.kLabel}</span>
          <select value={K} onChange={e => setK(+e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-mono">
            {[512, 1024, 2048, 4096, 8192, 16384].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
          {/* Formula */}
          <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            C({M}x{N}) = A({M}x{K}) * B({K}x{N})
          </text>

          {/* Metrics */}
          <text x={60} y={48} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
            FLOPs = 2MNK = {fmt(flops)}
          </text>
          <text x={60} y={66} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
            Memory = 4(MK + KN + MN) = {fmt(totalBytes)} bytes
          </text>
          <text x={60} y={84} fontSize="9" fontWeight="700"
            fill={isComputeBound ? COLORS.green : COLORS.red} fontFamily={FONTS.sans}>
            Arithmetic Intensity = FLOPs / Bytes = {ai.toFixed(1)} FLOPs/byte
          </text>

          {/* Roofline bar */}
          <text x={W / 2} y={115} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.rooflinePosition}
          </text>

          {/* Background bar */}
          <rect x={barX} y={130} width={barW} height={24} rx={4}
            fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={0.5} />

          {/* Memory-bound region */}
          <rect x={barX} y={130} width={ridgePos - barX} height={24} rx={4}
            fill="#fee2e2" opacity={0.5} />
          {/* Compute-bound region */}
          <rect x={ridgePos} y={130} width={barX + barW - ridgePos} height={24} rx={4}
            fill="#dcfce7" opacity={0.5} />

          {/* Ridge point marker */}
          <line x1={ridgePos} y1={126} x2={ridgePos} y2={158}
            stroke={COLORS.dark} strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={ridgePos} y={122} textAnchor="middle" fontSize="7"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            {t.ridge.replace('{value}', ridgePoint.toFixed(0))}
          </text>

          {/* AI position marker */}
          <circle cx={aiPos} cy={142} r={6}
            fill={isComputeBound ? COLORS.green : COLORS.red} />
          <text x={aiPos} y={142} textAnchor="middle" dominantBaseline="middle"
            fontSize="5" fontWeight="700" fill="white" fontFamily={FONTS.mono}>AI</text>
          <text x={aiPos} y={170} textAnchor="middle" fontSize="7.5" fontWeight="600"
            fill={isComputeBound ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
            {ai.toFixed(1)}
          </text>

          {/* Labels */}
          <text x={barX + (ridgePos - barX) / 2} y={180} textAnchor="middle"
            fontSize="7" fill={COLORS.red} fontFamily={FONTS.sans}>{t.memoryBound}</text>
          <text x={ridgePos + (barX + barW - ridgePos) / 2} y={180} textAnchor="middle"
            fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>{t.computeBound}</text>

          {/* Insight box */}
          <rect x={40} y={195} width={500} height={70} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={215} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={isComputeBound ? COLORS.green : COLORS.red} fontFamily={FONTS.sans}>
            {isComputeBound ? t.computeBoundInsight : t.memoryBoundInsight}
          </text>
          <text x={W / 2} y={235} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            {t.typicalLLM}
          </text>
          <text x={W / 2} y={252} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.gemmOptGoal.replace('{peak}', (peakFlops / 1e12).toFixed(0))}
          </text>
        </svg>
      </div>
    </div>
  );
}
