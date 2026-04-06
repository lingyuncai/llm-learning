import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface GPTQErrorPropagationProps {
  locale?: 'zh' | 'en';
}

const ORIG = [
  [0.0312, -0.0187, 0.0456, -0.0089],
  [-0.0234, 0.0401, -0.0156, 0.0278],
  [0.0178, -0.0345, 0.0289, -0.0198],
  [-0.0401, 0.0156, -0.0367, 0.0423],
];

const QUANT = [
  [0.0313, -0.0188, 0.0438, -0.0063],
  [-0.0250, 0.0375, -0.0125, 0.0250],
  [0.0188, -0.0375, 0.0313, -0.0188],
  [-0.0375, 0.0125, -0.0375, 0.0438],
];

export default function GPTQErrorPropagation({ locale = 'zh' }: GPTQErrorPropagationProps) {
  const t = {
    zh: {
      step1Title: 'Step 1: 原始权重矩阵 W (FP16)',
      step1Matrix: 'W (FP16) — Hessian H⁻¹ 引导量化顺序',
      step1Note: 'GPTQ 逐列量化: 利用 Hessian 逆矩阵将误差最优地分散到后续列',
      step2Title: 'Step 2: 量化第 1 列, 计算误差 δ₁',
      step2Matrix: '量化第 1 列 → 计算误差 δ₁',
      step3Title: 'Step 3: 误差传播到后续列 (Hessian 补偿)',
      step3Matrix: '误差补偿: δ₁ × H⁻¹ → 第 2-4 列',
      step3Note: '绿色 = 补偿后的值 (原始值 + 误差分配)',
      step4Title: 'Step 4: 量化第 2 列, 继续传播',
      step4Matrix: '量化第 2 列 → 补偿第 3-4 列',
      step4Note: '逐列处理: 每列量化后误差补偿到右侧所有未量化列',
      step5Title: 'Step 5: 最终结果 — GPTQ vs RTN',
      step5Matrix: '最终量化矩阵 (INT4)',
      rtnLabel: 'RTN (逐元素)',
      gptqLabel: 'GPTQ (列级补偿)',
      reduction: '↓ GPTQ 将 MSE 降低约 62%',
    },
    en: {
      step1Title: 'Step 1: Original Weight Matrix W (FP16)',
      step1Matrix: 'W (FP16) — Hessian H⁻¹ guides quantization order',
      step1Note: 'GPTQ per-column quantization: uses Hessian inverse to optimally distribute error to subsequent columns',
      step2Title: 'Step 2: Quantize column 1, compute error δ₁',
      step2Matrix: 'Quantize column 1 → compute error δ₁',
      step3Title: 'Step 3: Error propagation to subsequent columns (Hessian compensation)',
      step3Matrix: 'Error compensation: δ₁ × H⁻¹ → columns 2-4',
      step3Note: 'Green = compensated values (original value + error distribution)',
      step4Title: 'Step 4: Quantize column 2, continue propagation',
      step4Matrix: 'Quantize column 2 → compensate columns 3-4',
      step4Note: 'Per-column processing: after quantizing each column, compensate error to all remaining columns',
      step5Title: 'Step 5: Final Result — GPTQ vs RTN',
      step5Matrix: 'Final Quantized Matrix (INT4)',
      rtnLabel: 'RTN (element-wise)',
      gptqLabel: 'GPTQ (column-level compensation)',
      reduction: '↓ GPTQ reduces MSE by ~62%',
    },
  }[locale];

  const errors = useMemo(() =>
    ORIG.map((row, i) => row.map((v, j) => +(v - QUANT[i][j]).toFixed(4))), []
  );

  const compensated = useMemo(() => {
    const c = ORIG.map(row => [...row]);
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j < 4; j++) {
        c[i][j] = +(ORIG[i][j] + errors[i][0] * 0.3 / j).toFixed(4);
      }
    }
    return c;
  }, [errors]);

  const cellW = 90;
  const cellH = 36;
  const matX = 120;
  const matY = 70;

  function Cell({ x, y, val, bg, tc }: { x: number; y: number; val: number; bg?: string; tc?: string }) {
    return (
      <g>
        <rect x={x} y={y} width={cellW} height={cellH} fill={bg || COLORS.bg}
          stroke={COLORS.light} strokeWidth={1} rx={3} />
        <text x={x + cellW / 2} y={y + cellH / 2 + 5} textAnchor="middle"
          fontFamily={FONTS.mono} fontSize="10" fill={tc || COLORS.dark}>
          {val >= 0 ? '+' : ''}{val.toFixed(4)}
        </text>
      </g>
    );
  }

  function Matrix({ data, colBgs, colTcs, title }: {
    data: number[][]; colBgs?: (string | undefined)[]; colTcs?: (string | undefined)[]; title: string;
  }) {
    return (
      <g>
        <text x={matX + cellW * 2} y={matY - 10} textAnchor="middle" fontSize="11"
          fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
        {data.map((row, i) =>
          row.map((v, j) => (
            <Cell key={`${i}-${j}`} x={matX + j * cellW} y={matY + i * cellH}
              val={v} bg={colBgs?.[j]} tc={colTcs?.[j]} />
          ))
        )}
      </g>
    );
  }

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={ORIG} title={t.step1Matrix} />
          <text x={W / 2} y={250} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            {t.step1Note}
          </text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={ORIG.map((row, i) => [QUANT[i][0], ...row.slice(1)])}
            title={t.step2Matrix}
            colBgs={[COLORS.highlight, undefined, undefined, undefined]} />
          <text x={matX + cellW * 4 + 15} y={matY + 10} fontSize="9" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>δ₁</text>
          {errors.map((row, i) => (
            <text key={i} x={matX + cellW * 4 + 15} y={matY + i * cellH + cellH / 2 + 5}
              fontSize="9" fill={COLORS.red} fontFamily={FONTS.mono}>
              {row[0] >= 0 ? '+' : ''}{row[0].toFixed(4)}
            </text>
          ))}
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={ORIG.map((row, i) => [QUANT[i][0], ...compensated[i].slice(1)])}
            title={t.step3Matrix}
            colBgs={['#e0e0e0', undefined, undefined, undefined]}
            colTcs={[COLORS.mid, COLORS.green, COLORS.green, COLORS.green]} />
          <defs>
            <marker id="gptq-arr" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
            </marker>
          </defs>
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1={matX + cellW} y1={matY + i * cellH + cellH / 2}
              x2={matX + cellW + 15} y2={matY + i * cellH + cellH / 2}
              stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#gptq-arr)" />
          ))}
          <text x={W / 2} y={250} textAnchor="middle" fontSize="8" fill={COLORS.green}
            fontFamily={FONTS.sans}>
            {t.step3Note}
          </text>
        </svg>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={ORIG.map((row, i) => [QUANT[i][0], QUANT[i][1], ...compensated[i].slice(2)])}
            title={t.step4Matrix}
            colBgs={['#e0e0e0', COLORS.highlight, undefined, undefined]}
            colTcs={[COLORS.mid, undefined, COLORS.green, COLORS.green]} />
          <text x={W / 2} y={250} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            {t.step4Note}
          </text>
        </svg>
      ),
    },
    {
      title: t.step5Title,
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <Matrix data={QUANT} title={t.step5Matrix}
            colBgs={['#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0']} />
          <rect x={100} y={230} width={170} height={50} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.red} strokeWidth={1.5} />
          <text x={185} y={252} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>{t.rtnLabel}</text>
          <text x={185} y={270} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.mono}>MSE = 0.00082</text>

          <rect x={310} y={230} width={170} height={50} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1.5} />
          <text x={395} y={252} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t.gptqLabel}</text>
          <text x={395} y={270} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.mono}>MSE = 0.00031</text>

          <text x={W / 2} y={296} textAnchor="middle" fontSize="9" fill={COLORS.primary}
            fontFamily={FONTS.sans}>
            {t.reduction}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
