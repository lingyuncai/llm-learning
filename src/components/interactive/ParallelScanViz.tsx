import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const N = 8; // number of elements

function Node({ x, y, label, color = COLORS.primary }: {
  x: number; y: number; label: string; color?: string;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={16} fill={color} opacity={0.15}
        stroke={color} strokeWidth="1.5" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={color} fontFamily={FONTS.mono}>{label}</text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = COLORS.mid }: {
  x1: number; y1: number; x2: number; y2: number; color?: string;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Shorten to account for node radius
  const sx = x1 + (dx / len) * 18;
  const sy = y1 + (dy / len) * 18;
  const ex = x2 - (dx / len) * 18;
  const ey = y2 - (dy / len) * 18;
  return (
    <line x1={sx} y1={sy} x2={ex} y2={ey}
      stroke={color} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
  );
}

export default function ParallelScanViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '1. 顺序递推 — O(L) 步',
      step1Header: '选择性 SSM 必须逐步计算',
      step1Formula: 'xₖ = Āₖ · xₖ₋₁ + B̄ₖ · uₖ',
      step1Note: '必须等前一步完成才能计算下一步 → 7 步完成 8 个元素',
      step2Title: '2. 并行前缀和 — O(log L) 步',
      step2Header: '利用结合律并行化',
      step2Assoc: '关键：(aₖ, bₖ) 运算满足结合律 → 可并行组合',
      step2Combine: '组合规则: (a₂, b₂) ∘ (a₁, b₁) = (a₂a₁, a₂b₁ + b₂)',
      step2Note: '3 步完成（log₂ 8 = 3），所有中间结果均可用',
      step2Round: '轮',
      step3Title: '3. Mamba 的硬件感知优化',
      step3Header: 'GPU 内存层级优化',
      step3Hbm: 'HBM（大/慢）',
      step3Sram: 'SRAM（小/快）',
      step3Naive: '朴素: 中间张量 (B,L,D,N) 存 HBM → 显存爆炸',
      step3Mamba: 'Mamba: 参数→SRAM, 计算在SRAM, 只写输出回HBM',
      step3Note: '与使用 FlashAttention 的优化 Transformer 具有相同的显存需求',
    },
    en: {
      step1Title: '1. Sequential Scan — O(L) Steps',
      step1Header: 'Selective SSM must compute step by step',
      step1Formula: 'xₖ = Āₖ · xₖ₋₁ + B̄ₖ · uₖ',
      step1Note: 'Must wait for previous step → 7 steps for 8 elements',
      step2Title: '2. Parallel Prefix Sum — O(log L) Steps',
      step2Header: 'Exploit associativity for parallelism',
      step2Assoc: 'Key: (aₖ, bₖ) operation is associative → can combine in parallel',
      step2Combine: 'Combine rule: (a₂, b₂) ∘ (a₁, b₁) = (a₂a₁, a₂b₁ + b₂)',
      step2Note: '3 steps (log₂ 8 = 3), all intermediate results available',
      step2Round: 'Round',
      step3Title: '3. Mamba\'s Hardware-Aware Optimization',
      step3Header: 'GPU memory hierarchy optimization',
      step3Hbm: 'HBM (large/slow)',
      step3Sram: 'SRAM (small/fast)',
      step3Naive: 'Naive: intermediate tensor (B,L,D,N) in HBM → memory explosion',
      step3Mamba: 'Mamba: params→SRAM, compute in SRAM, only write output to HBM',
      step3Note: 'Same memory footprint as optimized Transformer with FlashAttention',
    },
  }[locale];

  const nodeSpacing = W / (N + 1);
  const nodeY = 55;

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step1Header}</text>

          {/* Nodes */}
          {Array.from({ length: N }, (_, i) => (
            <Node key={i} x={(i + 1) * nodeSpacing} y={nodeY} label={`x${i + 1}`} />
          ))}

          {/* Sequential arrows */}
          {Array.from({ length: N - 1 }, (_, i) => (
            <Arrow key={`a-${i}`}
              x1={(i + 1) * nodeSpacing} y1={nodeY}
              x2={(i + 2) * nodeSpacing} y2={nodeY}
              color={COLORS.orange} />
          ))}

          {/* Formula */}
          <text x={W / 2} y={100} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.mono}>{t.step1Formula}</text>

          {/* Step counter: 1→2→3→...→7 */}
          {Array.from({ length: N - 1 }, (_, i) => (
            <text key={`s-${i}`} x={(i + 1.5) * nodeSpacing} y={nodeY - 24}
              textAnchor="middle" fontSize="8" fill={COLORS.orange} fontFamily={FONTS.mono}>
              {i + 1}
            </text>
          ))}

          {/* Note */}
          <rect x={40} y={125} width={W - 80} height={36} rx={6}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" opacity={0.5} />
          <text x={W / 2} y={148} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>{t.step1Note}</text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2Header}</text>

          {/* Associativity note */}
          <text x={W / 2} y={36} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.step2Assoc}</text>

          {/* Parallel prefix tree visualization */}
          {/* Row 0: input nodes */}
          {Array.from({ length: N }, (_, i) => {
            const x = (i + 1) * (W / (N + 1));
            return <Node key={`r0-${i}`} x={x} y={60} label={`x${i + 1}`} color={COLORS.mid} />;
          })}

          {/* Round 1: pairs (1,2), (3,4), (5,6), (7,8) */}
          {[0, 2, 4, 6].map((i) => {
            const x1 = (i + 1) * (W / (N + 1));
            const x2 = (i + 2) * (W / (N + 1));
            const ym = 110;
            return (
              <g key={`r1-${i}`}>
                <line x1={x1} y1={76} x2={(x1 + x2) / 2} y2={ym - 16}
                  stroke={COLORS.green} strokeWidth="1.5" />
                <line x1={x2} y1={76} x2={(x1 + x2) / 2} y2={ym - 16}
                  stroke={COLORS.green} strokeWidth="1.5" />
                <Node x={(x1 + x2) / 2} y={ym} label={`${i + 1}:${i + 2}`} color={COLORS.green} />
              </g>
            );
          })}
          <text x={30} y={114} fontSize="9" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t.step2Round} 1</text>

          {/* Round 2: merge (1:2,3:4), (5:6,7:8) */}
          {[0, 4].map((i) => {
            const x1 = ((i + 1) + (i + 2)) / 2 * (W / (N + 1));
            const x2 = ((i + 3) + (i + 4)) / 2 * (W / (N + 1));
            const ym = 160;
            return (
              <g key={`r2-${i}`}>
                <line x1={x1} y1={126} x2={(x1 + x2) / 2} y2={ym - 16}
                  stroke={COLORS.primary} strokeWidth="1.5" />
                <line x1={x2} y1={126} x2={(x1 + x2) / 2} y2={ym - 16}
                  stroke={COLORS.primary} strokeWidth="1.5" />
                <Node x={(x1 + x2) / 2} y={ym} label={`${i + 1}:${i + 4}`} color={COLORS.primary} />
              </g>
            );
          })}
          <text x={30} y={164} fontSize="9" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t.step2Round} 2</text>

          {/* Round 3: final merge */}
          {(() => {
            const x1 = ((1 + 2) / 2 + (3 + 4) / 2) / 2 * (W / (N + 1));
            const x2 = ((5 + 6) / 2 + (7 + 8) / 2) / 2 * (W / (N + 1));
            const ym = 210;
            return (
              <g>
                <line x1={x1} y1={176} x2={(x1 + x2) / 2} y2={ym - 16}
                  stroke={COLORS.purple} strokeWidth="1.5" />
                <line x1={x2} y1={176} x2={(x1 + x2) / 2} y2={ym - 16}
                  stroke={COLORS.purple} strokeWidth="1.5" />
                <Node x={(x1 + x2) / 2} y={ym} label="1:8" color={COLORS.purple} />
              </g>
            );
          })()}
          <text x={30} y={214} fontSize="9" fontWeight="600"
            fill={COLORS.purple} fontFamily={FONTS.sans}>{t.step2Round} 3</text>

          {/* Combine rule */}
          <text x={W / 2} y={245} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.mono}>{t.step2Combine}</text>

          {/* Note */}
          <rect x={40} y={255} width={W - 80} height={20} rx={4}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" opacity={0.5} />
          <text x={W / 2} y={269} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t.step2Note}</text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step3Header}</text>

          {/* HBM box */}
          <rect x={40} y={45} width={500} height={65} rx={8}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1.5" opacity={0.3} />
          <text x={60} y={65} fontSize="11" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>{t.step3Hbm}</text>

          {/* Data blocks in HBM */}
          {['Δ', 'A', 'B', 'C'].map((label, i) => (
            <g key={`hbm-${i}`}>
              <rect x={70 + i * 65} y={75} width={50} height={24} rx={4}
                fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" />
              <text x={95 + i * 65} y={91} textAnchor="middle" fontSize="10" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.mono}>{label}</text>
            </g>
          ))}

          {/* Output in HBM */}
          <rect x={380} y={75} width={120} height={24} rx={4}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
          <text x={440} y={91} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.mono}>output (B,L,D)</text>

          {/* Arrows down to SRAM */}
          <line x1={180} y1={110} x2={180} y2={140} stroke={COLORS.orange} strokeWidth="1.5"
            markerEnd="url(#arrowSram)" />
          <text x={195} y={130} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>load</text>

          {/* Arrow up from SRAM */}
          <line x1={440} y1={140} x2={440} y2={110} stroke={COLORS.primary} strokeWidth="1.5"
            markerEnd="url(#arrowSram)" />
          <text x={455} y={130} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>write</text>

          <defs>
            <marker id="arrowSram" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* SRAM box */}
          <rect x={80} y={145} width={420} height={50} rx={8}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" opacity={0.4} />
          <text x={100} y={165} fontSize="11" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t.step3Sram}</text>

          {/* Operations in SRAM */}
          {[
            locale === 'zh' ? '离散化' : 'Discretize',
            'Parallel Scan',
            locale === 'zh' ? '× C 输出' : '× C output'
          ].map((label, i) => (
            <g key={`sram-${i}`}>
              <rect x={200 + i * 100} y={155} width={85} height={28} rx={4}
                fill={COLORS.bg} stroke={COLORS.primary} strokeWidth="1" />
              <text x={242 + i * 100} y={173} textAnchor="middle" fontSize="9" fontWeight="600"
                fill={COLORS.primary} fontFamily={FONTS.mono}>{label}</text>
            </g>
          ))}
          {/* Arrows between SRAM ops */}
          <text x={290} y={173} fontSize="12" fill={COLORS.primary}>→</text>
          <text x={390} y={173} fontSize="12" fill={COLORS.primary}>→</text>

          {/* Comparison */}
          <rect x={40} y={205} width={240} height={22} rx={4}
            fill={COLORS.waste} opacity={0.3} />
          <text x={160} y={220} textAnchor="middle" fontSize="9"
            fill={COLORS.red} fontFamily={FONTS.sans}>✗ {t.step3Naive}</text>

          <rect x={300} y={205} width={240} height={22} rx={4}
            fill={COLORS.valid} opacity={0.5} />
          <text x={420} y={220} textAnchor="middle" fontSize="9"
            fill={COLORS.green} fontFamily={FONTS.sans}>✓ {t.step3Mamba}</text>

          {/* Bottom note */}
          <text x={W / 2} y={250} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t.step3Note}</text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} locale={locale} />;
}
