// src/components/interactive/PositionalEncodingComparison.tsx
import { useMemo } from 'react';
import { COLORS } from './shared/colors';

// Generate sinusoidal PE values for visualization
function sinusoidalPE(maxPos: number, dModel: number): number[][] {
  return Array.from({ length: maxPos }, (_, pos) =>
    Array.from({ length: dModel }, (_, i) => {
      const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / dModel);
      return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
    })
  );
}

const POS = 8;
const DIM = 16;

function HeatmapColumn({ title, data, note }: {
  title: string;
  data: number[][] | null; // null for learnable (show ? pattern)
  note: string;
}) {
  const cellW = 14;
  const cellH = 18;
  const svgW = DIM * cellW + 40;
  const svgH = POS * cellH + 30;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold text-gray-700 mb-2">{title}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[280px]">
        {/* Position labels */}
        {Array.from({ length: POS }, (_, p) => (
          <text key={p} x={28} y={10 + p * cellH + cellH / 2 + 4} textAnchor="end"
            fontSize="9" fill={COLORS.mid} fontFamily="system-ui">
            pos {p}
          </text>
        ))}
        {/* Cells */}
        {Array.from({ length: POS }, (_, p) =>
          Array.from({ length: DIM }, (_, d) => {
            let fill: string;
            if (data) {
              const val = data[p][d];
              // Map [-1, 1] to blue-white-red
              const t = (val + 1) / 2; // [0, 1]
              const r = Math.round(59 + t * (198 - 59));
              const g = Math.round(130 + (1 - Math.abs(t - 0.5) * 2) * 125);
              const b = Math.round(246 - t * (246 - 40));
              fill = `rgb(${r},${g},${b})`;
            } else {
              // Learnable: random-looking but deterministic pattern
              const seed = (p * 31 + d * 17) % 255;
              fill = `rgb(${seed}, ${(seed * 3) % 255}, ${(seed * 7) % 255})`;
            }
            return (
              <rect key={`${p}-${d}`} x={32 + d * cellW} y={10 + p * cellH}
                width={cellW - 1} height={cellH - 1} rx={2} fill={fill} />
            );
          })
        )}
      </svg>
      <div className="text-xs text-gray-500 mt-1 text-center max-w-[280px]">{note}</div>
    </div>
  );
}

export default function PositionalEncodingComparison() {
  const sinPE = useMemo(() => sinusoidalPE(POS, DIM), []);

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HeatmapColumn
          title="正弦/余弦 (固定)"
          data={sinPE}
          note="每个维度不同频率的波，固定不可学习，支持外推到更长序列"
        />
        <HeatmapColumn
          title="可学习绝对位置"
          data={null}
          note="训练时学习每个位置的向量，简单直接但外推能力差"
        />
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold text-gray-700 mb-2">RoPE (旋转)</div>
          <svg viewBox="0 0 260 180" className="w-full max-w-[260px]">
            {/* Show rotation concept */}
            <circle cx={130} cy={90} r={60} fill="none" stroke={COLORS.light} strokeWidth={1} />
            {/* Position 0 - small rotation */}
            {[0, 1, 2, 3, 4].map(p => {
              const angle = (p * 25 * Math.PI) / 180; // increasing rotation
              const x = 130 + 50 * Math.cos(angle - Math.PI / 2);
              const y = 90 + 50 * Math.sin(angle - Math.PI / 2);
              const opacity = 1 - p * 0.15;
              return (
                <g key={p}>
                  <line x1={130} y1={90} x2={x} y2={y} stroke={COLORS.primary}
                    strokeWidth={2} opacity={opacity} />
                  <circle cx={x} cy={y} r={4} fill={COLORS.primary} opacity={opacity} />
                  <text x={x + 8} y={y + 4} fontSize="9" fill={COLORS.dark} fontFamily="system-ui">
                    pos {p}
                  </text>
                </g>
              );
            })}
            {/* Angle arc */}
            <text x={130} y={170} textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily="system-ui">
              相邻 token 旋转 θ 角度
            </text>
          </svg>
          <div className="text-xs text-gray-500 mt-1 text-center max-w-[260px]">
            在 Attention 计算中通过旋转编码相对位置，兼顾绝对位置和相对距离
          </div>
        </div>
      </div>
    </div>
  );
}
