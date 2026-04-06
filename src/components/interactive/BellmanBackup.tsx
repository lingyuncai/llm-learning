import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function BellmanBackup({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step0Title: '单步 Backup 直觉',
      step0MainTitle: 'Bellman Backup：从下一个状态"回传"价值',
      step0Intuition: '核心直觉：价值来自未来',
      step0IntuitionDesc: '好的状态 = 能到达高奖励状态的状态',
      step0CurrentValue: '当前价值 = 即时奖励 + 折扣未来价值',
      step1Title: '递推展开',
      step1MainTitle: '递推展开：Bellman 方程层层回传',
      step1BackupDesc: '← 价值从终点向起点回传（Backup）',
      step1Formula: 'V(s₂) = r₃ + γ·V(s₃) → V(s₁) = r₂ + γ·V(s₂) → V(s₀) = r₁ + γ·V(s₁)',
      step2Title: '收敛到最优值',
      step2MainTitle: 'Value Iteration：反复 Backup 直到收敛',
      step2Iteration1: '迭代 1',
      step2Iteration2: '迭代 2',
      step2Iteration3: '迭代 3',
      step2Convergence: '收敛',
      step2Desc: '反复应用 Bellman 方程（Backup），每次迭代更新所有状态的 V 值',
      step2ConvergenceDesc: '当所有状态的 V 值不再变化时 → 收敛到最优值函数 V*(s)',
    },
    en: {
      step0Title: 'Single-Step Backup Intuition',
      step0MainTitle: 'Bellman Backup: "Propagating" Value from Next States',
      step0Intuition: 'Core Intuition: Value Comes from the Future',
      step0IntuitionDesc: 'Good state = state that can reach high-reward states',
      step0CurrentValue: 'Current value = immediate reward + discounted future value',
      step1Title: 'Recursive Expansion',
      step1MainTitle: 'Recursive Expansion: Bellman Equation Propagates Layer by Layer',
      step1BackupDesc: '← Value propagates backward from terminal to initial states (Backup)',
      step1Formula: 'V(s₂) = r₃ + γ·V(s₃) → V(s₁) = r₂ + γ·V(s₂) → V(s₀) = r₁ + γ·V(s₁)',
      step2Title: 'Converge to Optimal Value',
      step2MainTitle: 'Value Iteration: Repeated Backup Until Convergence',
      step2Iteration1: 'Iteration 1',
      step2Iteration2: 'Iteration 2',
      step2Iteration3: 'Iteration 3',
      step2Convergence: 'Converged',
      step2Desc: 'Repeatedly apply Bellman equation (Backup), updating V values for all states in each iteration',
      step2ConvergenceDesc: 'When V values for all states stop changing → converged to optimal value function V*(s)',
    },
  }[locale];

  const steps = [
    {
      title: t.step0Title,
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step0MainTitle}
          </text>
          {/* Current state */}
          <circle cx={120} cy={100} r={30} fill={COLORS.highlight} stroke={COLORS.primary} strokeWidth={2} />
          <text x={120} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>s</text>
          <text x={120} y={112} textAnchor="middle" fontSize={10} fill={COLORS.mid}>V(s) = ?</text>

          {/* Arrow */}
          <line x1={155} y1={90} x2={220} y2={70} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrow1)" />
          <line x1={155} y1={100} x2={220} y2={100} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrow1)" />
          <line x1={155} y1={110} x2={220} y2={130} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrow1)" />
          <defs>
            <marker id="arrow1" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
            </marker>
          </defs>

          {/* Next states */}
          {[{ y: 60, label: "s'₁", v: '3.0', r: '+1' }, { y: 100, label: "s'₂", v: '1.0', r: '0' }, { y: 140, label: "s'₃", v: '2.0', r: '+2' }].map((s, i) => (
            <g key={i}>
              <circle cx={260} cy={s.y} r={24} fill={COLORS.valid} stroke={COLORS.mid} strokeWidth={1.5} />
              <text x={260} y={s.y - 4} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>{s.label}</text>
              <text x={260} y={s.y + 12} textAnchor="middle" fontSize={9} fill={COLORS.mid}>V={s.v}</text>
              <text x={210} y={s.y - 6} textAnchor="middle" fontSize={9} fill={COLORS.orange}>r={s.r}</text>
            </g>
          ))}

          {/* Formula */}
          <text x={380} y={80} fontSize={12} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
            V(s) = max_a Σ P(s'|s,a)
          </text>
          <text x={380} y={100} fontSize={12} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
                 × [R + γ·V(s')]
          </text>
          <text x={380} y={130} fontSize={11} fill={COLORS.mid}>
            {t.step0CurrentValue}
          </text>
          <rect x={370} y={145} width={190} height={40} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={465} y={163} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.orange}>
            {t.step0Intuition}
          </text>
          <text x={465} y={178} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            {t.step0IntuitionDesc}
          </text>
        </svg>
      ),
    },
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step1MainTitle}
          </text>

          {/* Chain of states */}
          {[
            { x: 60, label: 's₀', v: '?', col: COLORS.highlight },
            { x: 170, label: 's₁', v: '?', col: COLORS.highlight },
            { x: 280, label: 's₂', v: '?', col: COLORS.highlight },
            { x: 390, label: 's₃', v: '10', col: '#d4edda' },
            { x: 500, label: 'sₜ', v: '0', col: COLORS.masked },
          ].map((s, i) => (
            <g key={i}>
              <circle cx={s.x} cy={100} r={28} fill={s.col} stroke={COLORS.mid} strokeWidth={1.5} />
              <text x={s.x} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>{s.label}</text>
              <text x={s.x} y={112} textAnchor="middle" fontSize={10} fill={COLORS.mid}>V={s.v}</text>
              {i < 4 && (
                <>
                  <line x1={s.x + 30} y1={100} x2={s.x + 78} y2={100} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrow2)" />
                  <text x={s.x + 55} y={90} textAnchor="middle" fontSize={9} fill={COLORS.orange}>
                    r{i + 1}, γ
                  </text>
                </>
              )}
            </g>
          ))}
          <defs>
            <marker id="arrow2" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
            </marker>
          </defs>

          {/* Backward arrows */}
          {[390, 280, 170, 60].map((x, i) => (
            <path key={i}
              d={`M ${x} 135 Q ${x - 55} 170 ${x - 110} 135`}
              fill="none" stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="4 3"
              markerEnd="url(#arrow2g)" />
          ))}
          <defs>
            <marker id="arrow2g" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
            </marker>
          </defs>

          <text x={W / 2} y={190} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.green}>
            {t.step1BackupDesc}
          </text>
          <text x={W / 2} y={210} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
            {t.step1Formula}
          </text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step2MainTitle}
          </text>

          {/* Iteration visualization */}
          {[t.step2Iteration1, t.step2Iteration2, t.step2Iteration3, '...', t.step2Convergence].map((label, i) => {
            const x = 40 + i * 110;
            const colors = [
              [COLORS.masked, COLORS.masked, COLORS.masked, '#d4edda'],
              [COLORS.masked, COLORS.masked, COLORS.highlight, '#d4edda'],
              [COLORS.masked, COLORS.highlight, COLORS.highlight, '#d4edda'],
              [],
              [COLORS.valid, COLORS.valid, COLORS.valid, '#d4edda'],
            ];
            return (
              <g key={i}>
                <text x={x + 20} y={60} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>{label}</text>
                {i !== 3 && colors[i].map((c, j) => (
                  <rect key={j} x={x} y={70 + j * 28} width={40} height={22} rx={4}
                    fill={c} stroke={COLORS.mid} strokeWidth={1} />
                ))}
                {i === 3 && (
                  <text x={x + 20} y={110} textAnchor="middle" fontSize={20} fill={COLORS.mid}>⋯</text>
                )}
                {i < 4 && (
                  <text x={x + 60} y={110} textAnchor="middle" fontSize={16} fill={COLORS.mid}>→</text>
                )}
              </g>
            );
          })}

          <rect x={40} y={170} width={500} height={40} rx={6} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={W / 2} y={187} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.primary}>
            {t.step2Desc}
          </text>
          <text x={W / 2} y={203} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
            {t.step2ConvergenceDesc}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} locale={locale} />;
}
