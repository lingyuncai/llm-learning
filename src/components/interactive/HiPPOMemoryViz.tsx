import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

// Simplified signal: 6 token values
const SIGNAL = [0.8, 0.3, 0.9, 0.5, 0.2, 0.7];
const LABELS = ['w₁', 'w₂', 'w₃', 'w₄', 'w₅', 'w₆'];

// Random A: exponential decay — only recent tokens survive
const RANDOM_STATE = [0.01, 0.03, 0.08, 0.22]; // dim 0-3
const RANDOM_RECON = [0.05, 0.08, 0.15, 0.35, 0.18, 0.65]; // heavily biased to recent

// HiPPO A: Legendre projection — global shape preserved
const HIPPO_STATE = [0.55, 0.18, -0.12, 0.09]; // Legendre coefficients
const HIPPO_RECON = [0.72, 0.35, 0.82, 0.48, 0.25, 0.63]; // preserves global shape

function BarChart({ x, y, w, h, values, maxVal, color, labels, locale }: {
  x: number; y: number; w: number; h: number;
  values: number[]; maxVal: number; color: string;
  labels?: string[]; locale: 'zh' | 'en';
}) {
  const barW = w / values.length;
  const gap = 4;
  return (
    <g>
      {values.map((v, i) => {
        const barH = (Math.abs(v) / maxVal) * h;
        const bx = x + i * barW;
        return (
          <g key={i}>
            <rect x={bx + gap / 2} y={y + h - barH} width={barW - gap} height={barH}
              fill={color} opacity={0.75} rx={2} />
            {labels && (
              <text x={bx + barW / 2} y={y + h + 14} textAnchor="middle"
                fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>{labels[i]}</text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function StateVectorSmall({ x, y, values, label }: {
  x: number; y: number; values: number[]; label: string;
}) {
  const cellW = 42;
  const cellH = 24;
  return (
    <g>
      <text x={x} y={y - 6} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {values.map((v, i) => (
        <g key={i}>
          <rect x={x + i * cellW} y={y} width={cellW - 2} height={cellH}
            fill={v >= 0 ? COLORS.valid : COLORS.waste}
            stroke={COLORS.light} strokeWidth="1" rx="3" />
          <text x={x + i * cellW + cellW / 2} y={y + cellH / 2 + 4}
            textAnchor="middle" fontSize="8" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            {v.toFixed(2)}
          </text>
        </g>
      ))}
    </g>
  );
}

export default function HiPPOMemoryViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '1. 随机 A 的遗忘问题',
      step1Header: '随机初始化 A → 指数衰减',
      step1Signal: '输入信号（6 个 token）',
      step1State: '状态向量（N=4）',
      step1Note: '随机 A → 旧信息指数衰减 → 只记得最近几步',
      step2Title: '2. HiPPO: 用正交多项式记忆',
      step2Header: '用 Legendre 多项式基逼近信号历史',
      step2P0: 'P₀: 常数',
      step2P1: 'P₁: 线性',
      step2P2: 'P₂: 二次',
      step2P3: 'P₃: 三次',
      step2Note: '状态的第 n 维 = 信号在第 n 阶 Legendre 多项式上的投影系数',
      step3Title: '3. 记忆效果对比',
      step3Random: '随机 A → 重建',
      step3Hippo: 'HiPPO A → 重建',
      step3Original: '原始信号',
      step3Note: 'S4 在 Path-X (16K 步) 上首次突破，关键正是 HiPPO 初始化',
    },
    en: {
      step1Title: '1. Random A: The Forgetting Problem',
      step1Header: 'Random A initialization → exponential decay',
      step1Signal: 'Input signal (6 tokens)',
      step1State: 'State vector (N=4)',
      step1Note: 'Random A → exponential decay → only recent tokens survive',
      step2Title: '2. HiPPO: Memory via Orthogonal Polynomials',
      step2Header: 'Approximate signal history using Legendre polynomial basis',
      step2P0: 'P₀: constant',
      step2P1: 'P₁: linear',
      step2P2: 'P₂: quadratic',
      step2P3: 'P₃: cubic',
      step2Note: 'State dim n = projection coefficient of signal onto n-th Legendre polynomial',
      step3Title: '3. Memory Quality Comparison',
      step3Random: 'Random A → reconstruction',
      step3Hippo: 'HiPPO A → reconstruction',
      step3Original: 'Original signal',
      step3Note: 'S4\'s breakthrough on Path-X (16K steps) was enabled by HiPPO initialization',
    },
  }[locale];

  const legendrePolys = [
    (x: number) => 1,                           // P0
    (x: number) => 2 * x - 1,                   // P1
    (x: number) => 6 * x * x - 6 * x + 1,      // P2
    (x: number) => 20 * x * x * x - 30 * x * x + 12 * x - 1, // P3
  ];
  const polyColors = [COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple];
  const polyLabels = [t.step2P0, t.step2P1, t.step2P2, t.step2P3];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step1Header}</text>

          {/* Input signal */}
          <text x={40} y={52} fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step1Signal}</text>
          <BarChart x={40} y={58} w={200} h={80} values={SIGNAL} maxVal={1}
            color={COLORS.primary} labels={LABELS} locale={locale} />

          {/* Arrow */}
          <text x={260} y={100} fontSize="18" fill={COLORS.mid} fontFamily={FONTS.mono}>→</text>

          {/* Decayed state */}
          <text x={300} y={52} fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step1State}</text>
          <BarChart x={300} y={58} w={200} h={80} values={RANDOM_STATE} maxVal={0.5}
            color={COLORS.red} locale={locale} />
          {/* Decay arrows showing exponential falloff */}
          {['dim₀', 'dim₁', 'dim₂', 'dim₃'].map((l, i) => (
            <text key={i} x={300 + i * 50 + 25} y={155} textAnchor="middle"
              fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>{l}</text>
          ))}

          {/* Note */}
          <rect x={40} y={185} width={W - 80} height={36} rx={6}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" opacity={0.6} />
          <text x={W / 2} y={208} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>{t.step1Note}</text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2Header}</text>

          {/* Legendre polynomial curves */}
          {legendrePolys.map((fn, pi) => {
            const curveW = 220;
            const curveH = 60;
            const cx = 30;
            const cy = 50;
            const points = [];
            for (let i = 0; i <= 40; i++) {
              const xNorm = i / 40;
              const val = fn(xNorm);
              const px = cx + xNorm * curveW;
              const py = cy + curveH / 2 - (val / 2) * (curveH / 2);
              points.push(`${px},${py}`);
            }
            return (
              <g key={pi}>
                {/* Baseline */}
                <line x1={cx} y1={cy + curveH / 2} x2={cx + curveW} y2={cy + curveH / 2}
                  stroke={COLORS.light} strokeWidth="0.5" />
                <polyline points={points.join(' ')} fill="none"
                  stroke={polyColors[pi]} strokeWidth="2" opacity={0.8} />
                <text x={cx + curveW + 8} y={cy + curveH / 2 + 4}
                  fontSize="9" fill={polyColors[pi]} fontFamily={FONTS.sans}>
                  {polyLabels[pi]}
                </text>
              </g>
            );
          })}

          {/* Arrow to state */}
          <text x={380} y={80} fontSize="18" fill={COLORS.mid} fontFamily={FONTS.mono}>→</text>

          {/* HiPPO state coefficients */}
          <StateVectorSmall x={400} y={50} values={HIPPO_STATE} label="c = [c₀, c₁, c₂, c₃]" />

          {/* Explanation below */}
          <rect x={40} y={135} width={W - 80} height={100} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={W / 2} y={160} textAnchor="middle" fontSize="11"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2Note}</text>

          {/* Formula: signal ≈ c₀P₀ + c₁P₁ + c₂P₂ + c₃P₃ */}
          <text x={W / 2} y={185} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.mono}>
            signal(t) ≈ c₀·P₀(t) + c₁·P₁(t) + c₂·P₂(t) + c₃·P₃(t)
          </text>

          {/* HiPPO matrix structure hint */}
          <text x={W / 2} y={215} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {locale === 'zh'
              ? 'HiPPO 矩阵 A 的特殊结构（下三角 + 对角）使得状态更新 = 在线计算 Legendre 系数'
              : 'HiPPO matrix A (lower-triangular + diagonal) makes state update = online Legendre projection'}
          </text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          {/* Random A reconstruction */}
          <text x={145} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>{t.step3Random}</text>
          <BarChart x={40} y={30} w={210} h={80} values={RANDOM_RECON} maxVal={1}
            color={COLORS.red} labels={LABELS} locale={locale} />
          {/* Ghost original */}
          {SIGNAL.map((v, i) => {
            const barW = 210 / SIGNAL.length;
            const barH = v * 80;
            return (
              <rect key={`ghost-r-${i}`} x={40 + i * barW + 2} y={30 + 80 - barH}
                width={barW - 4} height={barH}
                fill="none" stroke={COLORS.primary} strokeWidth="1.5"
                strokeDasharray="3,2" opacity={0.5} rx={2} />
            );
          })}

          {/* HiPPO A reconstruction */}
          <text x={435} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t.step3Hippo}</text>
          <BarChart x={330} y={30} w={210} h={80} values={HIPPO_RECON} maxVal={1}
            color={COLORS.green} labels={LABELS} locale={locale} />
          {/* Ghost original */}
          {SIGNAL.map((v, i) => {
            const barW = 210 / SIGNAL.length;
            const barH = v * 80;
            return (
              <rect key={`ghost-h-${i}`} x={330 + i * barW + 2} y={30 + 80 - barH}
                width={barW - 4} height={barH}
                fill="none" stroke={COLORS.primary} strokeWidth="1.5"
                strokeDasharray="3,2" opacity={0.5} rx={2} />
            );
          })}

          {/* Legend: dashed = original */}
          <line x1={200} y1={140} x2={225} y2={140}
            stroke={COLORS.primary} strokeWidth="1.5" strokeDasharray="3,2" />
          <text x={230} y={144} fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
            = {t.step3Original}
          </text>

          {/* VS divider */}
          <text x={W / 2} y={75} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.mid} fontFamily={FONTS.sans}>vs</text>

          {/* Bottom note */}
          <rect x={40} y={165} width={W - 80} height={36} rx={6}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" opacity={0.7} />
          <text x={W / 2} y={188} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t.step3Note}</text>

          {/* Key insight */}
          <text x={W / 2} y={230} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {locale === 'zh'
              ? 'Mamba 简化为 S4D-Real: A = -diag(1,2,...,N)，选择性机制弥补了简化的表达力损失'
              : 'Mamba simplifies to S4D-Real: A = -diag(1,2,...,N), selectivity compensates for reduced expressiveness'}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} locale={locale} />;
}
