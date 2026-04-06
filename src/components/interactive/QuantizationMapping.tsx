import { useState, useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

const WEIGHTS = [
  -0.82, -0.61, -0.45, -0.33, -0.21, -0.12, -0.04, 0.08,
  0.15, 0.27, 0.35, 0.49, 0.56, 0.68, 0.74, 0.91,
];

export default function QuantizationMapping({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      symmetric: '对称',
      asymmetric: '非对称',
      step1Title: 'Step 1: FP16 权重分布',
      step1Footer: 'FP16 权重值 (连续分布)',
      step2Title: 'Step 2: 计算 scale 和量化网格',
      step2Footer: '橙色虚线 = 量化级别 (整数网格)',
      step3Title: 'Step 3: 映射到最近网格线 (Rounding)',
      step3Footer: '蓝 = 原始值, 橙 = 量化后值, 红线 = rounding 误差',
      step3Formula: 'q[i] = round(w[i] / scale',
      step4Title: 'Step 4: 反量化与误差分析',
      step4Error: '量化误差 |w - ŵ|',
      step4Dequant: '反量化: ',
      step4MSE: 'MSE: ',
      step4MaxError: 'Max Error: ',
      step4SymNote: '对称量化: 简单高效, 适合近似对称的权重分布',
      step4AsymNote: '非对称量化: 额外存储 zero_point, 适合偏移分布 (如 activation)',
    },
    en: {
      symmetric: 'Symmetric',
      asymmetric: 'Asymmetric',
      step1Title: 'Step 1: FP16 Weight Distribution',
      step1Footer: 'FP16 weight values (continuous)',
      step2Title: 'Step 2: Compute scale & quantization grid',
      step2Footer: 'Orange dashed lines = quantization levels (integer grid)',
      step3Title: 'Step 3: Map to nearest grid (Rounding)',
      step3Footer: 'Blue = original, Orange = quantized, Red = rounding error',
      step3Formula: 'q[i] = round(w[i] / scale',
      step4Title: 'Step 4: Dequantization & error analysis',
      step4Error: 'Quantization error |w - ŵ|',
      step4Dequant: 'Dequantization: ',
      step4MSE: 'MSE: ',
      step4MaxError: 'Max Error: ',
      step4SymNote: 'Symmetric quantization: simple & efficient, good for near-symmetric weights',
      step4AsymNote: 'Asymmetric quantization: stores zero_point, good for shifted distributions (e.g. activations)',
    },
  }[locale];

  const [symmetric, setSymmetric] = useState(true);

  const { scale, zeroPoint, qMin, qMax, quantized, dequantized, errors } = useMemo(() => {
    const qMin = symmetric ? -7 : 0;
    const qMax = symmetric ? 7 : 15;
    const wMin = Math.min(...WEIGHTS);
    const wMax = Math.max(...WEIGHTS);

    let scale: number;
    let zeroPoint: number;
    if (symmetric) {
      scale = Math.max(Math.abs(wMin), Math.abs(wMax)) / qMax;
      zeroPoint = 0;
    } else {
      scale = (wMax - wMin) / (qMax - qMin);
      zeroPoint = Math.round(qMin - wMin / scale);
    }

    const quantized = WEIGHTS.map(w =>
      Math.max(qMin, Math.min(qMax, Math.round(w / scale + zeroPoint)))
    );
    const dequantized = quantized.map(q => (q - zeroPoint) * scale);
    const errors = WEIGHTS.map((w, i) => Math.abs(w - dequantized[i]));

    return { scale, zeroPoint, qMin, qMax, quantized, dequantized, errors };
  }, [symmetric]);

  const plotW = 480;
  const plotX = 50;
  const plotH = 100;
  const wMin = Math.min(...WEIGHTS) - 0.15;
  const wMax = Math.max(...WEIGHTS) + 0.15;
  const toX = (v: number) => plotX + ((v - wMin) / (wMax - wMin)) * plotW;
  const dotY = (i: number) => 45 + (i / WEIGHTS.length) * plotH;

  const modeToggle = (
    <g>
      {[t.symmetric, t.asymmetric].map((label, i) => (
        <g key={label} onClick={() => setSymmetric(i === 0)} cursor="pointer">
          <rect x={200 + i * 90} y={4} width={80} height={20} rx={4}
            fill={(i === 0) === symmetric ? COLORS.primary : COLORS.bgAlt}
            stroke={COLORS.primary} strokeWidth={1} />
          <text x={240 + i * 90} y={18} textAnchor="middle" fontSize="8"
            fontWeight="600" fill={(i === 0) === symmetric ? '#fff' : COLORS.primary}
            fontFamily={FONTS.sans}>{label}</text>
        </g>
      ))}
    </g>
  );

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 195`} className="w-full">
          {modeToggle}
          {WEIGHTS.map((w, i) => (
            <circle key={i} cx={toX(w)} cy={dotY(i)} r={4}
              fill={COLORS.primary} opacity={0.7} />
          ))}
          <line x1={plotX} y1={155} x2={plotX + plotW} y2={155}
            stroke={COLORS.mid} strokeWidth={0.5} />
          <line x1={toX(0)} y1={35} x2={toX(0)} y2={160}
            stroke={COLORS.mid} strokeWidth={0.5} strokeDasharray="3,2" />
          <text x={toX(0)} y={172} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.mono}>0</text>
          <text x={W / 2} y={190} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>{t.step1Footer}</text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 195`} className="w-full">
          {modeToggle}
          <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.mono}>
            {symmetric
              ? `scale = max(|w|) / 7 = ${scale.toFixed(4)}, zero_point = 0`
              : `scale = (max-min) / 15 = ${scale.toFixed(4)}, zero_point = ${zeroPoint}`}
          </text>
          {Array.from({ length: qMax - qMin + 1 }, (_, i) => {
            const qVal = qMin + i;
            const wVal = (qVal - zeroPoint) * scale;
            if (wVal < wMin || wVal > wMax) return null;
            return (
              <g key={qVal}>
                <line x1={toX(wVal)} y1={48} x2={toX(wVal)} y2={150}
                  stroke={COLORS.orange} strokeWidth={0.5} strokeDasharray="2,2" opacity={0.5} />
                <text x={toX(wVal)} y={164} textAnchor="middle" fontSize="6"
                  fill={COLORS.orange} fontFamily={FONTS.mono}>{qVal}</text>
              </g>
            );
          })}
          {WEIGHTS.map((w, i) => (
            <circle key={i} cx={toX(w)} cy={dotY(i) + 5} r={3}
              fill={COLORS.primary} opacity={0.6} />
          ))}
          <text x={W / 2} y={185} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>{t.step2Footer}</text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 195`} className="w-full">
          {modeToggle}
          {Array.from({ length: qMax - qMin + 1 }, (_, i) => {
            const qVal = qMin + i;
            const wVal = (qVal - zeroPoint) * scale;
            if (wVal < wMin || wVal > wMax) return null;
            return (
              <line key={qVal} x1={toX(wVal)} y1={30} x2={toX(wVal)} y2={145}
                stroke={COLORS.orange} strokeWidth={0.5} strokeDasharray="2,2" opacity={0.3} />
            );
          })}
          {WEIGHTS.map((w, i) => {
            const dq = dequantized[i];
            return (
              <g key={i}>
                <circle cx={toX(w)} cy={dotY(i)} r={3} fill={COLORS.primary} opacity={0.4} />
                <circle cx={toX(dq)} cy={dotY(i)} r={3} fill={COLORS.orange} />
                <line x1={toX(w)} y1={dotY(i)} x2={toX(dq)} y2={dotY(i)}
                  stroke={COLORS.red} strokeWidth={0.8} opacity={0.5} />
              </g>
            );
          })}
          <text x={W / 2} y={165} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>{t.step3Footer}</text>
          <text x={W / 2} y={185} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            {t.step3Formula}{symmetric ? '' : ' + zero_point'})
          </text>
        </svg>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          {modeToggle}
          <text x={15} y={42} fontSize="7" fontWeight="600" fill={COLORS.dark}
            fontFamily={FONTS.sans}>{t.step4Error}</text>
          {WEIGHTS.map((_w, i) => {
            const maxErr = Math.max(...errors);
            const barH = maxErr > 0 ? (errors[i] / maxErr) * 50 : 0;
            const bx = 30 + i * 34;
            return (
              <g key={i}>
                <rect x={bx} y={65 - barH} width={28} height={barH} rx={2}
                  fill={errors[i] > scale * 0.4 ? COLORS.red : COLORS.green} opacity={0.6} />
                <text x={bx + 14} y={80} textAnchor="middle" fontSize="5.5"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>{errors[i].toFixed(3)}</text>
              </g>
            );
          })}
          <rect x={40} y={100} width={W - 80} height={55} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={60} y={120} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
            <tspan fontWeight="600">{t.step4Dequant}</tspan>
            ŵ[i] = {symmetric ? 'q[i] × scale' : '(q[i] - zero_point) × scale'}
          </text>
          <text x={60} y={140} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
            <tspan fontWeight="600">{t.step4MSE}</tspan>
            {(errors.reduce((a, b) => a + b * b, 0) / errors.length).toFixed(6)}
            <tspan dx={20} fontWeight="600">{t.step4MaxError}</tspan>
            {Math.max(...errors).toFixed(4)}
          </text>
          <text x={W / 2} y={180} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
            fontFamily={FONTS.sans}>
            {symmetric ? t.step4SymNote : t.step4AsymNote}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
