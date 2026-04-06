import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

export default function GAELambdaSlider({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'GAE λ 参数：偏差-方差权衡',
      lambda_low: 'λ=0 (TD, 高偏差低方差)',
      lambda_high: 'λ=1 (MC, 低偏差高方差)',
      chart1_title: 'Advantage 估计值散布',
      chart2_title: '训练收敛曲线',
      formula: 'GAE(λ) = Σₖ (γλ)ᵏ · δₜ₊ₖ  其中 δₜ = rₜ + γV(sₜ₊₁) - V(sₜ)',
      desc_low: 'λ 接近 0：类似 TD(0)，只看一步。偏差大（Critic 不准时误差大），但方差小、收敛快。',
      desc_mid: 'λ 中间值：平衡偏差和方差。实践中 λ=0.95-0.97 最常用。',
      desc_high: 'λ 接近 1：类似 Monte Carlo，看完整轨迹。方差大（每条轨迹差异大），但偏差小。',
    },
    en: {
      title: 'GAE λ Parameter: Bias-Variance Tradeoff',
      lambda_low: 'λ=0 (TD, high bias low variance)',
      lambda_high: 'λ=1 (MC, low bias high variance)',
      chart1_title: 'Advantage Estimate Scatter',
      chart2_title: 'Training Convergence Curve',
      formula: 'GAE(λ) = Σₖ (γλ)ᵏ · δₜ₊ₖ  where δₜ = rₜ + γV(sₜ₊₁) - V(sₜ)',
      desc_low: 'λ near 0: similar to TD(0), only one-step lookahead. High bias (large error when Critic inaccurate), but low variance, fast convergence.',
      desc_mid: 'λ mid-range: balances bias and variance. In practice λ=0.95-0.97 most common.',
      desc_high: 'λ near 1: similar to Monte Carlo, full trajectory. High variance (large trajectory differences), but low bias.',
    },
  }[locale];
  const [lambda, setLambda] = useState(0.95);

  // Simulate bias-variance tradeoff
  const data = useMemo(() => {
    const points = 40;
    const result: { step: number; value: number }[] = [];
    let val = 0;
    const noise = lambda; // higher lambda = more variance (MC-like)
    const bias = 1 - lambda; // lower lambda = more bias (TD-like)

    for (let i = 0; i < points; i++) {
      const trueSignal = Math.sin(i * 0.15) * 3 + i * 0.05;
      const noiseAmount = (Math.random() - 0.5) * noise * 6;
      const biasAmount = bias * 2;
      val = trueSignal + noiseAmount + biasAmount;
      result.push({ step: i, value: val });
    }
    return result;
  }, [lambda]);

  const chartX = 50, chartY = 100, chartW = 260, chartH = 200;
  const maxVal = Math.max(...data.map(d => Math.abs(d.value)), 1);

  // Convergence curve
  const convergenceData = useMemo(() => {
    const steps = 50;
    const result: number[] = [];
    let perf = 0;
    for (let i = 0; i < steps; i++) {
      const lr = 0.1;
      const gradNoise = (Math.random() - 0.5) * lambda * 3;
      const gradBias = (1 - lambda) * 0.5;
      perf += lr * (1 - perf / 5 + gradNoise - gradBias);
      result.push(Math.max(-1, Math.min(5, perf)));
    }
    return result;
  }, [lambda]);

  const conv2X = 340, conv2W = 220;
  const maxConv = Math.max(...convergenceData.map(Math.abs), 1);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Lambda slider */}
        <text x={W / 2} y={50} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
          λ = {lambda.toFixed(2)}
        </text>
        <text x={50} y={76} fontSize={10} fill={COLORS.mid}>{t.lambda_low}</text>
        <text x={W - 50} y={76} textAnchor="end" fontSize={10} fill={COLORS.mid}>{t.lambda_high}</text>

        {/* Slider track */}
        <rect x={50} y={82} width={480} height={6} rx={3} fill={COLORS.light} />
        <circle cx={50 + lambda * 480} cy={85} r={8} fill={COLORS.primary} stroke="#fff" strokeWidth={2} />

        {/* Invisible wider hit area for slider */}
        <rect x={50} y={70} width={480} height={30} fill="transparent" style={{ cursor: 'pointer' }}
          onMouseDown={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const updateLambda = (clientX: number) => {
              const x = (clientX - rect.left) / rect.width;
              setLambda(Math.max(0, Math.min(1, x)));
            };
            updateLambda(e.clientX);
            const onMove = (ev: MouseEvent) => updateLambda(ev.clientX);
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        />

        {/* Left chart: Advantage estimate scatter */}
        <text x={chartX + chartW / 2} y={chartY - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          {t.chart1_title}
        </text>
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <line x1={chartX} y1={chartY + chartH / 2} x2={chartX + chartW} y2={chartY + chartH / 2}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4 3" />

        {data.map((d, i) => {
          const x = chartX + (d.step / 39) * chartW;
          const y = chartY + chartH / 2 - (d.value / maxVal) * (chartH / 2 - 10);
          return <circle key={i} cx={x} cy={y} r={3} fill={COLORS.primary} opacity={0.6} />;
        })}

        {/* Right chart: Convergence curve */}
        <text x={conv2X + conv2W / 2} y={chartY - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          {t.chart2_title}
        </text>
        <rect x={conv2X} y={chartY} width={conv2W} height={chartH} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {convergenceData.length > 1 && (
          <polyline
            points={convergenceData.map((v, i) => {
              const x = conv2X + (i / 49) * conv2W;
              const y = chartY + chartH - 10 - ((v + 1) / (maxConv + 1)) * (chartH - 20);
              return `${x},${y}`;
            }).join(' ')}
            fill="none" stroke={COLORS.green} strokeWidth={2} />
        )}

        {/* Labels */}
        <rect x={40} y={H - 60} width={500} height={48} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={50} y={H - 42} fontSize={11} fontWeight={600} fill={COLORS.orange}>
          {t.formula}
        </text>
        <text x={50} y={H - 24} fontSize={10} fill={COLORS.mid}>
          {lambda < 0.3 ? t.desc_low :
           lambda < 0.7 ? t.desc_mid :
           t.desc_high}
        </text>
      </svg>
    </div>
  );
}
