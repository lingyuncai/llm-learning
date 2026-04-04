import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

// Simulated FP16 weights for a block of 32
function generateWeights(): number[] {
  // Seeded pseudo-random for consistency
  const vals = [
    0.23, -0.87, 0.45, -0.12, 0.91, -0.34, 0.67, -0.55,
    0.78, -0.21, 0.11, -0.99, 0.38, -0.63, 0.82, -0.47,
    0.15, -0.73, 0.56, -0.29, 0.94, -0.08, 0.41, -0.86,
    0.33, -0.61, 0.72, -0.18, 0.88, -0.42, 0.59, -0.95,
  ];
  return vals;
}

export default function QuantizationProcess() {
  const weights = useMemo(() => generateWeights(), []);
  const maxAbs = useMemo(() => Math.max(...weights.map(Math.abs)), [weights]);
  const scale = maxAbs / 7; // Q4_0: 4-bit signed → range [-8, 7]
  const quantized = useMemo(
    () => weights.map(w => Math.round(w / scale)),
    [weights, scale]
  );
  const dequantized = useMemo(
    () => quantized.map(q => q * scale),
    [quantized, scale]
  );
  const errors = useMemo(
    () => weights.map((w, i) => Math.abs(w - dequantized[i])),
    [weights, dequantized]
  );
  const maxError = Math.max(...errors);
  const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;

  const barW = 14;
  const barMaxH = 60;
  const barX = (i: number) => 30 + i * (barW + 2.5);

  function WeightBars({ values, y, color, label }: {
    values: number[]; y: number; color: string; label: string;
  }) {
    return (
      <g>
        <text x={15} y={y - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{label}</text>
        {values.slice(0, 16).map((v, i) => {
          const h = Math.abs(v) / maxAbs * barMaxH;
          const barY = v >= 0 ? y + barMaxH - h : y + barMaxH;
          return (
            <rect key={i} x={barX(i)} y={barY} width={barW - 1} height={h}
              rx={1} fill={v >= 0 ? color : '#fca5a5'}
              opacity={0.8} />
          );
        })}
        {/* Zero line */}
        <line x1={25} y1={y + barMaxH} x2={barX(16)} y2={y + barMaxH}
          stroke="#94a3b8" strokeWidth={0.5} />
        <text x={barX(16) + 10} y={y + barMaxH / 2 + 3} fontSize="6"
          fill={COLORS.mid} fontFamily={FONTS.sans}>
          (前 16 / 32 个值)
        </text>
      </g>
    );
  }

  const steps = [
    {
      title: 'Step 1: FP16 原始权重',
      content: (
        <StepSvg h={180}>
          <text x={W / 2} y={16} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            一个 block = 32 个 FP16 权重值 (每个 16 bit, 共 64 bytes)
          </text>
          <WeightBars values={weights} y={30} color={COLORS.primary} label="FP16 权重" />
          <text x={W / 2} y={160} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            max|w| = {maxAbs.toFixed(2)}, 范围 [{Math.min(...weights).toFixed(2)}, {Math.max(...weights).toFixed(2)}]
          </text>
        </StepSvg>
      ),
    },
    {
      title: 'Step 2: 量化 (Q4_0)',
      content: (
        <div>
          <div className="p-3 bg-orange-50 rounded-lg mb-3 text-xs font-mono text-orange-800">
            <p className="font-semibold mb-1">Q4_0 对称量化公式:</p>
            <p>scale = max(|w|) / 7 = {maxAbs.toFixed(4)} / 7 = {scale.toFixed(4)}</p>
            <p>q[i] = round(w[i] / scale)</p>
            <p className="mt-1 text-orange-600">每个值: FP16 (16 bit) → INT4 (4 bit), 压缩 4x</p>
          </div>
          <StepSvg h={120}>
            <WeightBars values={quantized} y={10} color={COLORS.orange} label="INT4 量化值" />
            <text x={W / 2} y={105} textAnchor="middle" fontSize="7" fill={COLORS.mid}
              fontFamily={FONTS.sans}>
              量化值范围: [-8, 7] (4-bit signed integer)
            </text>
          </StepSvg>
        </div>
      ),
    },
    {
      title: 'Step 3: 反量化与误差',
      content: (
        <div>
          <div className="p-3 bg-green-50 rounded-lg mb-3 text-xs font-mono text-green-800">
            <p className="font-semibold mb-1">存储: 32 个 INT4 值 (16 bytes) + 1 个 FP16 scale (2 bytes) = 18 bytes</p>
            <p>反量化: w'[i] = q[i] × scale</p>
            <p className="mt-1">最大误差: {maxError.toFixed(4)} | 平均误差: {avgError.toFixed(4)}</p>
            <p className="text-green-600">压缩比: 64 bytes → 18 bytes = 3.6x</p>
          </div>
          <StepSvg h={140}>
            <text x={15} y={12} fontSize="7" fontWeight="600" fill={COLORS.dark}
              fontFamily={FONTS.sans}>量化误差 (|原始 - 反量化|)</text>
            {errors.slice(0, 16).map((e, i) => {
              const h = (e / maxAbs) * 60;
              return (
                <rect key={i} x={barX(i)} y={70 - h} width={barW - 1} height={h}
                  rx={1} fill={COLORS.red} opacity={0.6} />
              );
            })}
            <line x1={25} y1={70} x2={barX(16)} y2={70}
              stroke="#94a3b8" strokeWidth={0.5} />
            <text x={W / 2} y={100} textAnchor="middle" fontSize="7" fill={COLORS.mid}
              fontFamily={FONTS.sans}>
              误差通常 &lt; 0.1, 对最终模型输出影响有限
            </text>
          </StepSvg>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
