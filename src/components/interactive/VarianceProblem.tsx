import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function VarianceProblem({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [samples, setSamples] = useState<{ x: number; y: number }[]>([]);
  const [sampleCount, setSampleCount] = useState(0);

  const t = {
    zh: {
      title: '高方差问题：梯度估计的散布',
      subtitle: '每次采样一条 trajectory 只能得到一个 noisy 梯度估计',
      trueGrad: '真实梯度方向',
      samples: '采样梯度估计',
      avgGrad: '平均梯度方向',
      stats: '统计',
      sampleCount: '采样数',
      avgDir: '平均方向',
      trueDir: '真实方向',
      clickSample: '点击采样观察方差',
      highVar: '方差很大！梯度方向不稳定',
      moreData: '增加采样，平均方向趋近真实',
      varReduced: '大量采样后方差减小 ✓',
      reason: '这就是 REINFORCE 收敛慢的原因',
      sample1: '采样 1 条',
      sample10: '采样 10 条',
      reset: '重置',
    },
    en: {
      title: 'High Variance Problem: Gradient Estimate Scatter',
      subtitle: 'Each trajectory sample yields only one noisy gradient estimate',
      trueGrad: 'True Gradient Direction',
      samples: 'Sampled Gradient Estimates',
      avgGrad: 'Average Gradient Direction',
      stats: 'Statistics',
      sampleCount: 'Samples',
      avgDir: 'Avg Direction',
      trueDir: 'True Direction',
      clickSample: 'Click to sample and observe variance',
      highVar: 'High variance! Gradient direction unstable',
      moreData: 'More samples, average converges to true',
      varReduced: 'Variance reduced after many samples ✓',
      reason: 'This is why REINFORCE converges slowly',
      sample1: 'Sample 1',
      sample10: 'Sample 10',
      reset: 'Reset',
    },
  }[locale];

  // True gradient direction (normalized): pointing upper-right
  const trueGradX = 0.7;
  const trueGradY = -0.7;

  const sampleGradient = () => {
    // Noisy estimate of the gradient — high variance around the true direction
    const noise = 1.2;
    const gx = trueGradX + (Math.random() - 0.5) * noise * 2;
    const gy = trueGradY + (Math.random() - 0.5) * noise * 2;
    return { x: gx, y: gy };
  };

  const addSamples = (n: number) => {
    const newSamples: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      newSamples.push(sampleGradient());
    }
    setSamples(prev => [...prev, ...newSamples]);
    setSampleCount(prev => prev + n);
  };

  const reset = () => {
    setSamples([]);
    setSampleCount(0);
  };

  const cx = 180, cy = 180;
  const scale = 60;

  // Compute average direction
  const avgX = samples.length > 0 ? samples.reduce((s, p) => s + p.x, 0) / samples.length : 0;
  const avgY = samples.length > 0 ? samples.reduce((s, p) => s + p.y, 0) / samples.length : 0;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Coordinate axes */}
        <line x1={cx - 130} y1={cy} x2={cx + 130} y2={cy} stroke={COLORS.light} strokeWidth={1} />
        <line x1={cx} y1={cy - 130} x2={cx} y2={cy + 130} stroke={COLORS.light} strokeWidth={1} />
        <text x={cx + 135} y={cy + 4} fontSize={9} fill={COLORS.mid}>θ₁</text>
        <text x={cx + 4} y={cy - 132} fontSize={9} fill={COLORS.mid}>θ₂</text>

        {/* True gradient direction */}
        <line x1={cx} y1={cy} x2={cx + trueGradX * scale * 1.8} y2={cy + trueGradY * scale * 1.8}
          stroke={COLORS.green} strokeWidth={2.5} strokeDasharray="6 3" markerEnd="url(#arrowTrue)" />
        <defs>
          <marker id="arrowTrue" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
          </marker>
          <marker id="arrowSample" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={4} markerHeight={4} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
          <marker id="arrowAvg" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.orange} />
          </marker>
        </defs>

        {/* Sample gradient arrows */}
        {samples.map((s, i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + s.x * scale} y2={cy + s.y * scale}
            stroke={COLORS.primary} strokeWidth={0.8} opacity={0.4} markerEnd="url(#arrowSample)" />
        ))}

        {/* Average gradient */}
        {samples.length > 0 && (
          <line x1={cx} y1={cy} x2={cx + avgX * scale * 1.5} y2={cy + avgY * scale * 1.5}
            stroke={COLORS.orange} strokeWidth={2.5} markerEnd="url(#arrowAvg)" />
        )}

        {/* Legend */}
        <line x1={370} y1={80} x2={400} y2={80} stroke={COLORS.green} strokeWidth={2.5} strokeDasharray="6 3" />
        <text x={410} y={84} fontSize={10} fill={COLORS.dark}>{t.trueGrad}</text>
        <line x1={370} y1={100} x2={400} y2={100} stroke={COLORS.primary} strokeWidth={1} opacity={0.5} />
        <text x={410} y={104} fontSize={10} fill={COLORS.dark}>{t.samples} (n={sampleCount})</text>
        {samples.length > 0 && (
          <>
            <line x1={370} y1={120} x2={400} y2={120} stroke={COLORS.orange} strokeWidth={2.5} />
            <text x={410} y={124} fontSize={10} fill={COLORS.dark}>{t.avgGrad}</text>
          </>
        )}

        {/* Stats */}
        <rect x={360} y={150} width={200} height={80} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={370} y={170} fontSize={11} fontWeight={600} fill={COLORS.dark}>{t.stats}</text>
        <text x={370} y={188} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
          {t.sampleCount}: {sampleCount}
        </text>
        <text x={370} y={204} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
          {t.avgDir}: ({avgX.toFixed(2)}, {avgY.toFixed(2)})
        </text>
        <text x={370} y={220} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
          {t.trueDir}: ({trueGradX.toFixed(2)}, {trueGradY.toFixed(2)})
        </text>

        {/* Insight */}
        <rect x={360} y={240} width={200} height={44} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={460} y={257} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {sampleCount === 0 ? t.clickSample :
           sampleCount < 5 ? t.highVar :
           sampleCount < 20 ? t.moreData :
           t.varReduced}
        </text>
        <text x={460} y={275} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {t.reason}
        </text>

        {/* Controls */}
        {[
          { label: t.sample1, n: 1, x: 360 },
          { label: t.sample10, n: 10, x: 440 },
        ].map(btn => (
          <g key={btn.n} onClick={() => addSamples(btn.n)} style={{ cursor: 'pointer' }}>
            <rect x={btn.x} y={H - 42} width={80} height={26} rx={5} fill={COLORS.primary} />
            <text x={btn.x + 40} y={H - 25} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">{btn.label}</text>
          </g>
        ))}
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={530} y={H - 42} width={40} height={26} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={550} y={H - 25} textAnchor="middle" fontSize={10} fill={COLORS.dark}>{t.reset}</text>
        </g>
      </svg>
    </div>
  );
}
