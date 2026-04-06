import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function TrustRegionViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Trust Region：限制策略更新范围',
      trustRegionOn: '✓ Trust Region ON',
      trustRegionOff: '✗ Trust Region OFF（无约束）',
      policySpace: '策略参数空间 (θ₁, θ₂)',
      perfChange: '性能变化',
      perfCrash: '性能崩溃！',
      updateStep: '更新一步',
      reset: '重置',
      constrainedFormula: 'KL(π_old ∥ π_new) ≤ δ',
      constrainedExplain: '限制新旧策略距离，稳定提升',
      unconstrainedFormula: '无约束更新 → 步长可能过大',
      unconstrainedExplain: '策略剧变 → 可能性能崩溃',
    },
    en: {
      title: 'Trust Region: Constrain Policy Update Range',
      trustRegionOn: '✓ Trust Region ON',
      trustRegionOff: '✗ Trust Region OFF (Unconstrained)',
      policySpace: 'Policy Parameter Space (θ₁, θ₂)',
      perfChange: 'Performance Change',
      perfCrash: 'Performance Crashed!',
      updateStep: 'Update Step',
      reset: 'Reset',
      constrainedFormula: 'KL(π_old ∥ π_new) ≤ δ',
      constrainedExplain: 'Limit policy distance, stable improvement',
      unconstrainedFormula: 'Unconstrained update → step size may be too large',
      unconstrainedExplain: 'Policy change too large → may crash performance',
    },
  }[locale];

  const [useTrustRegion, setUseTrustRegion] = useState(false);
  const [steps, setSteps] = useState<{ x: number; y: number; perf: number }[]>([]);
  const [crashed, setCrashed] = useState(false);

  const cx = 200, cy = 180;
  const trustR = 50;

  const reset = () => {
    setSteps([]);
    setCrashed(false);
  };

  const takeStep = () => {
    if (crashed) return;
    const prev = steps.length > 0 ? steps[steps.length - 1] : { x: cx, y: cy, perf: 50 };

    if (useTrustRegion) {
      // Constrained step: stay within trust region
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * trustR * 0.6;
      const nx = prev.x + Math.cos(angle) * dist * 0.3 + 8;
      const ny = prev.y + Math.sin(angle) * dist * 0.3 - 5;
      const perf = Math.min(100, prev.perf + Math.random() * 8 + 2);
      setSteps(prev => [...prev, { x: nx, y: ny, perf }]);
    } else {
      // Unconstrained: can take big steps, may crash
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 60;
      const nx = prev.x + Math.cos(angle) * dist * 0.4 + 12;
      const ny = prev.y + Math.sin(angle) * dist * 0.4 - 8;
      const willCrash = steps.length > 2 && Math.random() < 0.3;
      const perf = willCrash ? Math.max(0, prev.perf - 40 - Math.random() * 30) : Math.min(100, prev.perf + Math.random() * 15);
      setSteps(prev => [...prev, { x: nx, y: ny, perf }]);
      if (willCrash) setCrashed(true);
    }
  };

  const perfChartX = 360, perfChartW = 200, perfChartH = 180, perfChartY = 60;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Toggle */}
        <g onClick={() => { setUseTrustRegion(!useTrustRegion); reset(); }} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 90} y={34} width={180} height={26} rx={13}
            fill={useTrustRegion ? COLORS.green : COLORS.red} />
          <text x={W / 2} y={51} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {useTrustRegion ? t.trustRegionOn : t.trustRegionOff}
          </text>
        </g>

        {/* Policy space */}
        <rect x={30} y={70} width={310} height={240} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />
        <text x={185} y={86} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>{t.policySpace}</text>

        {/* Trust region circle */}
        {useTrustRegion && steps.length > 0 && (
          <circle cx={steps[steps.length - 1].x} cy={steps[steps.length - 1].y} r={trustR}
            fill="none" stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="6 3" opacity={0.6} />
        )}

        {/* Current position */}
        {steps.length === 0 && (
          <circle cx={cx} cy={cy} r={6} fill={COLORS.primary} />
        )}

        {/* Step trail */}
        {steps.map((s, i) => {
          const prev = i === 0 ? { x: cx, y: cy } : steps[i - 1];
          const isCrash = crashed && i === steps.length - 1;
          return (
            <g key={i}>
              <line x1={prev.x} y1={prev.y} x2={s.x} y2={s.y}
                stroke={isCrash ? COLORS.red : COLORS.primary} strokeWidth={1.5} />
              <circle cx={s.x} cy={s.y} r={isCrash ? 8 : 4}
                fill={isCrash ? COLORS.red : COLORS.primary} opacity={0.8} />
              {isCrash && (
                <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize={10} fill="#fff" fontWeight={700}>✗</text>
              )}
            </g>
          );
        })}

        {/* Performance chart */}
        <text x={perfChartX + perfChartW / 2} y={perfChartY - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
          {t.perfChange}
        </text>
        <rect x={perfChartX} y={perfChartY} width={perfChartW} height={perfChartH}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={4} />

        {steps.length > 0 && (
          <polyline
            points={[{ perf: 50 }, ...steps].map((s, i) => {
              const x = perfChartX + (i / Math.max(1, steps.length)) * perfChartW;
              const y = perfChartY + perfChartH - (s.perf / 100) * perfChartH;
              return `${x},${y}`;
            }).join(' ')}
            fill="none" stroke={crashed ? COLORS.red : COLORS.green} strokeWidth={2} />
        )}

        {crashed && (
          <text x={perfChartX + perfChartW / 2} y={perfChartY + perfChartH / 2} textAnchor="middle"
            fontSize={14} fontWeight={700} fill={COLORS.red}>
            {t.perfCrash}
          </text>
        )}

        {/* Controls */}
        <g onClick={takeStep} style={{ cursor: crashed ? 'default' : 'pointer' }}>
          <rect x={360} y={perfChartY + perfChartH + 15} width={80} height={28} rx={5}
            fill={crashed ? COLORS.masked : COLORS.primary} />
          <text x={400} y={perfChartY + perfChartH + 33} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {t.updateStep}
          </text>
        </g>
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={450} y={perfChartY + perfChartH + 15} width={60} height={28} rx={5}
            fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={480} y={perfChartY + perfChartH + 33} textAnchor="middle" fontSize={11} fill={COLORS.dark}>{t.reset}</text>
        </g>

        {/* Explanation */}
        <rect x={360} y={H - 50} width={210} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={465} y={H - 32} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {useTrustRegion ? t.constrainedFormula : t.unconstrainedFormula}
        </text>
        <text x={465} y={H - 18} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {useTrustRegion ? t.constrainedExplain : t.unconstrainedExplain}
        </text>
      </svg>
    </div>
  );
}
