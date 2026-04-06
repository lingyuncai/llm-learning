import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

const ACT = [
  [0.5, 0.3, 48.2, 0.8],
  [0.4, 0.6, 52.1, 0.5],
  [0.7, 0.2, 45.7, 0.9],
  [0.3, 0.5, 50.8, 0.6],
];
const WGT = [
  [0.12, -0.08, 0.001, 0.15],
  [-0.09, 0.11, 0.002, -0.13],
  [0.07, -0.14, 0.001, 0.10],
  [-0.11, 0.06, 0.003, -0.08],
];

export default function SmoothQuantTransform({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Step 1: 原始 Activation (通道 2 是 outlier)',
      step1Outlier: '通道 2 动态范围 (~50) 是其他通道 (~1) 的 50 倍',
      step1Issue: 'Per-tensor INT8 量化: scale 被 outlier 主导 → 正常通道精度崩溃',
      step1PerChannelMax: 'Per-channel max:',
      step2Title: 'Step 2: 计算平滑因子 sⱼ',
      step2Formula: 'sⱼ = max(|Xⱼ|)^α, α = 0.5',
      step2Channel: '通道',
      step2Transform: 'X\' = X · diag(s)⁻¹ (激活除以 s) | W\' = diag(s) · W (权重乘以 s)',
      step2Equiv: '数学等价: X\' · W\' = X · diag(s)⁻¹ · diag(s) · W = X · W',
      step3Title: 'Step 3: 平滑后矩阵',
      step3Result: '✓ X\' 所有通道动态范围接近 — per-tensor INT8 量化可行',
      step4Title: 'Step 4: W8A8 推理加速',
      step4Equiv: 'X\' · W\' = X · W (数学等价)',
      step4ActivationQuant: 'X\' → INT8 per-tensor',
      step4ActivationOk: '动态范围均衡 ✓',
      step4WeightQuant: 'W\' → INT8 per-tensor',
      step4WeightOk: '值略增但可控 ✓',
      step4GemmTitle: 'INT8 GEMM (Tensor Core 加速)',
      step4Speedup: '对比 FP16: 内存减半, 吞吐提升 ~1.5-2×',
      step4Ppl: 'LLaMA-7B WikiText2 PPL: FP16 5.68 → W8A8 5.73 (+0.05)',
      step4Adoption: 'α = 0.5 是大多数模型的经验最优值, SmoothQuant 已被 TensorRT-LLM, vLLM 广泛采用',
    },
    en: {
      step1Title: 'Step 1: Original Activation (channel 2 is outlier)',
      step1Outlier: 'Channel 2 dynamic range (~50) is 50× larger than other channels (~1)',
      step1Issue: 'Per-tensor INT8 quantization: scale dominated by outlier → normal channel precision collapse',
      step1PerChannelMax: 'Per-channel max:',
      step2Title: 'Step 2: Calculate smoothing factor sⱼ',
      step2Formula: 'sⱼ = max(|Xⱼ|)^α, α = 0.5',
      step2Channel: 'Channel',
      step2Transform: 'X\' = X · diag(s)⁻¹ (activation divided by s) | W\' = diag(s) · W (weight multiplied by s)',
      step2Equiv: 'Mathematically equivalent: X\' · W\' = X · diag(s)⁻¹ · diag(s) · W = X · W',
      step3Title: 'Step 3: Smoothed matrices',
      step3Result: '✓ X\' all channels have similar dynamic range — per-tensor INT8 quantization feasible',
      step4Title: 'Step 4: W8A8 inference acceleration',
      step4Equiv: 'X\' · W\' = X · W (mathematically equivalent)',
      step4ActivationQuant: 'X\' → INT8 per-tensor',
      step4ActivationOk: 'Balanced dynamic range ✓',
      step4WeightQuant: 'W\' → INT8 per-tensor',
      step4WeightOk: 'Slightly increased but controllable ✓',
      step4GemmTitle: 'INT8 GEMM (Tensor Core acceleration)',
      step4Speedup: 'vs FP16: half memory, ~1.5-2× throughput',
      step4Ppl: 'LLaMA-7B WikiText2 PPL: FP16 5.68 → W8A8 5.73 (+0.05)',
      step4Adoption: 'α = 0.5 is empirically optimal for most models, SmoothQuant widely adopted by TensorRT-LLM, vLLM',
    },
  }[locale];

  const channelMax = ACT[0].map((_, j) =>
    Math.max(...ACT.map(r => Math.abs(r[j])))
  );
  const alpha = 0.5;
  const s = channelMax.map(m => +Math.pow(m, alpha).toFixed(2));

  const smoothedAct = ACT.map(row => row.map((v, j) => +(v / s[j]).toFixed(3)));
  const smoothedWgt = WGT.map(row => row.map((v, j) => +(v * s[j]).toFixed(4)));

  const cW = 78;
  const cH = 28;

  function Mat({ x, y, data, title, rangeColors }: {
    x: number; y: number; data: number[][]; title: string; rangeColors?: boolean;
  }) {
    return (
      <g>
        <text x={x + data[0].length * cW / 2} y={y - 8} textAnchor="middle"
          fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {title}
        </text>
        {data.map((row, r) =>
          row.map((v, c) => {
            let fill = COLORS.bg;
            if (rangeColors) {
              const absV = Math.abs(v);
              fill = absV > 10 ? '#ffcdd2' : absV > 1 ? '#fff9c4' : '#c8e6c9';
            }
            return (
              <g key={`${r}-${c}`}>
                <rect x={x + c * cW} y={y + r * cH} width={cW - 1} height={cH - 1}
                  fill={fill} stroke={COLORS.light} strokeWidth={1} rx={2} />
                <text x={x + c * cW + cW / 2} y={y + r * cH + cH / 2 + 4}
                  textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily={FONTS.mono}>
                  {Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(3)}
                </text>
              </g>
            );
          })
        )}
      </g>
    );
  }

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <Mat x={100} y={30} data={ACT} title="Activation X (FP16)" rangeColors />
          <text x={W / 2} y={175} textAnchor="middle" fontSize="8" fill={COLORS.red}
            fontFamily={FONTS.sans}>
            {t.step1Outlier}
          </text>
          <text x={W / 2} y={195} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            {t.step1Issue}
          </text>
          <text x={60} y={230} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step1PerChannelMax}
          </text>
          {channelMax.map((m, j) => (
            <text key={j} x={165 + j * 100} y={230} fontSize="8"
              fill={m > 10 ? COLORS.red : COLORS.green} fontFamily={FONTS.mono}>
              ch{j}: {m.toFixed(1)}
            </text>
          ))}
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={28} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step2Formula}
          </text>
          {s.map((sv, j) => {
            const bx = 50 + j * 130;
            return (
              <g key={j}>
                <rect x={bx} y={50} width={110} height={70} rx={6}
                  fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
                <text x={bx + 55} y={70} textAnchor="middle" fontSize="9"
                  fill={COLORS.mid} fontFamily={FONTS.sans}>{t.step2Channel} {j}</text>
                <text x={bx + 55} y={88} textAnchor="middle" fontSize="8"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>max = {channelMax[j].toFixed(1)}</text>
                <text x={bx + 55} y={110} textAnchor="middle" fontSize="12"
                  fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.mono}>
                  s = {sv}
                </text>
              </g>
            );
          })}
          <text x={W / 2} y={155} textAnchor="middle" fontSize="9" fill={COLORS.dark}
            fontFamily={FONTS.sans}>{t.step2Transform}</text>
          <text x={W / 2} y={175} textAnchor="middle" fontSize="8" fill={COLORS.purple}
            fontFamily={FONTS.sans}>
            {t.step2Equiv}
          </text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <Mat x={5} y={30} data={smoothedAct} title="X' = X · diag(s)⁻¹" rangeColors />
          <Mat x={340} y={30} data={smoothedWgt} title="W' = diag(s) · W" />
          <text x={W / 2} y={175} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            {t.step3Result}
          </text>
        </svg>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={28} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step4Equiv}</text>

          <rect x={40} y={50} width={210} height={60} rx={8}
            fill="#e8f5e9" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={145} y={72} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t.step4ActivationQuant}</text>
          <text x={145} y={92} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>{t.step4ActivationOk}</text>

          <rect x={330} y={50} width={210} height={60} rx={8}
            fill="#e8f5e9" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={435} y={72} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t.step4WeightQuant}</text>
          <text x={435} y={92} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>{t.step4WeightOk}</text>

          <text x={W / 2} y={82} fontSize="16" fill={COLORS.primary}>×</text>

          <rect x={150} y={130} width={280} height={40} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={2} />
          <text x={W / 2} y={155} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t.step4GemmTitle}</text>

          <text x={W / 2} y={200} textAnchor="middle" fontSize="9" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            {t.step4Speedup}
          </text>
          <text x={W / 2} y={220} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            {t.step4Ppl}
          </text>
          <text x={W / 2} y={245} textAnchor="middle" fontSize="8" fill={COLORS.orange}
            fontFamily={FONTS.sans}>
            {t.step4Adoption}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
