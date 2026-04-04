import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;
const D_MODEL = 32;
const NUM_PAIRS = D_MODEL / 2;
const BASE = 10000;
const TRAIN_LEN = 4096;

type ScalingMethod = 'none' | 'ntk' | 'yarn';

function computeThetas(method: ScalingMethod, seqLen: number): number[] {
  const scale = seqLen / TRAIN_LEN;
  if (method === 'none') {
    return Array.from({ length: NUM_PAIRS }, (_, i) =>
      Math.pow(BASE, -2 * i / D_MODEL));
  }
  if (method === 'ntk') {
    // NTK-aware: b' = b * s^(d/(d-2))
    const newBase = BASE * Math.pow(scale, D_MODEL / (D_MODEL - 2));
    return Array.from({ length: NUM_PAIRS }, (_, i) =>
      Math.pow(newBase, -2 * i / D_MODEL));
  }
  // YaRN: low dims keep original, high dims scale, middle interpolate
  return Array.from({ length: NUM_PAIRS }, (_, i) => {
    const ratio = i / NUM_PAIRS;
    const origTheta = Math.pow(BASE, -2 * i / D_MODEL);
    if (ratio < 0.25) return origTheta; // high freq: keep
    if (ratio > 0.75) return origTheta / scale; // low freq: scale down
    // middle: interpolate
    const t = (ratio - 0.25) / 0.5;
    return origTheta * (1 - t) + (origTheta / scale) * t;
  });
}

export default function RoPEExtrapolation() {
  const [seqLen, setSeqLen] = useState(TRAIN_LEN);
  const [method, setMethod] = useState<ScalingMethod>('none');

  const thetas = useMemo(() => computeThetas(method, seqLen), [method, seqLen]);

  // Max angle at each dim pair = seqLen * theta_i
  const maxAngles = thetas.map(t => seqLen * t);
  const trainMaxAngles = Array.from({ length: NUM_PAIRS }, (_, i) =>
    TRAIN_LEN * Math.pow(BASE, -2 * i / D_MODEL));

  const barX = 80;
  const barMaxW = 420;
  const barH = 14;
  const barGap = 3;
  const barStartY = 80;
  const globalMaxAngle = Math.max(...maxAngles, ...trainMaxAngles) * 1.1;

  return (
    <div className="my-6">
      <div className="flex flex-wrap gap-4 mb-3 items-center justify-center">
        <label className="text-xs text-gray-500">
          序列长度: {seqLen.toLocaleString()}
          <input type="range" min={TRAIN_LEN} max={TRAIN_LEN * 4} step={512}
            value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="ml-2 w-32" />
        </label>
        <div className="flex gap-2">
          {(['none', 'ntk', 'yarn'] as ScalingMethod[]).map(m => (
            <button key={m}
              onClick={() => setMethod(m)}
              className={`text-xs px-3 py-1 rounded border transition-colors ${
                method === m
                  ? 'bg-blue-100 border-blue-400 text-blue-700 font-semibold'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {m === 'none' ? 'No Scaling' : m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          各维度对的最大角度覆盖 (训练长度={TRAIN_LEN}, 当前={seqLen.toLocaleString()})
        </text>

        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {method === 'none'
            ? '无缩放 — 超出训练范围的角度（红色区域）可能导致性能下降'
            : method === 'ntk'
              ? 'NTK-aware: 修改基数压缩高频角度到训练范围内'
              : 'YaRN: 对不同频率分量使用不同缩放因子（混合策略）'}
        </text>

        {/* Dim pair labels */}
        <text x={barX - 5} y={barStartY - 8} textAnchor="end" fontSize="7"
          fill={COLORS.mid} fontFamily={FONTS.sans}>dim pair</text>

        {Array.from({ length: NUM_PAIRS }, (_, i) => {
          const y = barStartY + i * (barH + barGap);
          const trainAngleW = (trainMaxAngles[i] / globalMaxAngle) * barMaxW;
          const currentAngleW = (maxAngles[i] / globalMaxAngle) * barMaxW;
          const inRange = maxAngles[i] <= trainMaxAngles[i] * 1.05;

          return (
            <g key={i}>
              <text x={barX - 5} y={y + barH / 2 + 1} textAnchor="end"
                dominantBaseline="middle" fontSize="6"
                fill={COLORS.mid} fontFamily={FONTS.mono}>i={i}</text>

              {/* Background */}
              <rect x={barX} y={y} width={barMaxW} height={barH} rx={2}
                fill="#f8fafc" />

              {/* Training range (green zone) */}
              <rect x={barX} y={y} width={Math.min(trainAngleW, barMaxW)} height={barH} rx={2}
                fill="#dcfce7" opacity={0.6} />

              {/* Current angle bar */}
              <rect x={barX} y={y}
                width={Math.min(currentAngleW, barMaxW)} height={barH} rx={2}
                fill={inRange ? COLORS.green : COLORS.red} opacity={0.5} />

              {/* Out-of-range marker */}
              {!inRange && trainAngleW < barMaxW && (
                <line x1={barX + trainAngleW} y1={y}
                  x2={barX + trainAngleW} y2={y + barH}
                  stroke={COLORS.dark} strokeWidth={1} />
              )}
            </g>
          );
        })}

        {/* Legend */}
        {(() => {
          const ly = barStartY + NUM_PAIRS * (barH + barGap) + 10;
          return (
            <g>
              <rect x={140} y={ly} width={12} height={10} rx={2} fill="#dcfce7" opacity={0.6} />
              <text x={156} y={ly + 8} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
                训练范围 (0 ~ {TRAIN_LEN})
              </text>

              <rect x={280} y={ly} width={12} height={10} rx={2} fill={COLORS.green} opacity={0.5} />
              <text x={296} y={ly + 8} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
                角度在范围内
              </text>

              <rect x={380} y={ly} width={12} height={10} rx={2} fill={COLORS.red} opacity={0.5} />
              <text x={396} y={ly + 8} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
                角度超出范围
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
