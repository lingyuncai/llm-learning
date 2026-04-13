import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

function fmtV(v: number): string {
  if (v === 0) return '0';
  return String(v);
}

export default function BellmanBackup({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const isZh = locale === 'zh';
  const t = isZh ? {
    step1Title: '1. 单步 Backup 计算',
    step1Header: '如何用下一状态的价值，反推当前状态的价值？',
    step1Best: '← 最大！',
    step1Result: '∴ V(s) = 3.80，最优动作 = ↓',
    step2Title: '2. 链式回传：从终点逐步计算',
    step2Header: '终端状态价值已知 → 逐步 Backup 到每个前驱状态',
    step2Known: '（已知）',
    step2Arrow: '← 价值从终点向起点逐步回传',
    step3Title: '3. Value Iteration：反复 Backup 到收敛',
    step3Header: '对所有状态反复 Backup，价值从目标像波浪一样向外扩散',
    step3Init: '初始',
    step3Iter: '迭代',
    step3Done: '收敛！',
    step3Goal: '目标',
    step3Note: 'γ=0.9 → 每远一步，价值衰减到 0.9 倍',
  } : {
    step1Title: '1. Single-Step Backup',
    step1Header: 'How to compute current value from next state values?',
    step1Best: '← max!',
    step1Result: '∴ V(s) = 3.80, optimal action = ↓',
    step2Title: '2. Chain Propagation',
    step2Header: 'Terminal value is known → Backup to each predecessor',
    step2Known: '(known)',
    step2Arrow: '← Value propagates from goal to start',
    step3Title: '3. Value Iteration: Converge',
    step3Header: 'Repeatedly Backup all states; values spread from goal like a wave',
    step3Init: 'Init',
    step3Iter: 'Iter',
    step3Done: 'Converged!',
    step3Goal: 'Goal',
    step3Note: 'γ=0.9 → each step further, value decays to 0.9×',
  };

  // Step 1: backup from 3 next states (γ=0.9)
  const nexts = [
    { y: 60, label: "s'₁", v: 3.0, r: 1, act: '↑' },
    { y: 110, label: "s'₂", v: 1.0, r: 0, act: '→' },
    { y: 160, label: "s'₃", v: 2.0, r: 2, act: '↓' },
  ];
  const vals = nexts.map(n => n.r + 0.9 * n.v); // [3.70, 0.90, 3.80]
  const best = vals.indexOf(Math.max(...vals));   // 2

  // Step 3: value iteration on 4-cell strip, γ=0.9, goal V=10
  const iters = [
    [0, 0, 0, 10],
    [0, 0, 9, 10],
    [0, 8.1, 9, 10],
    [7.29, 8.1, 9, 10],
  ];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 230`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <defs>
            <marker id="bk-a" viewBox="0 0 10 10" refX={8} refY={5}
              markerWidth={6} markerHeight={6} orient="auto">
              <polygon points="0,0 10,5 0,10" fill={COLORS.primary} />
            </marker>
          </defs>

          <text x={W / 2} y={22} textAnchor="middle" fontSize={13}
            fontWeight={700} fill={COLORS.dark}>{t.step1Header}</text>

          {/* State s */}
          <circle cx={80} cy={110} r={30} fill={COLORS.highlight}
            stroke={COLORS.primary} strokeWidth={2} />
          <text x={80} y={106} textAnchor="middle" fontSize={14}
            fontWeight={700} fill={COLORS.dark}>s</text>
          <text x={80} y={122} textAnchor="middle" fontSize={10}
            fill={COLORS.mid}>V = ?</text>

          {/* Next states with arrows */}
          {nexts.map((n, i) => (
            <g key={i}>
              <line x1={112} y1={110 + (n.y - 110) * 0.4} x2={185} y2={n.y}
                stroke={i === best ? COLORS.primary : COLORS.light}
                strokeWidth={i === best ? 2.5 : 1.5} markerEnd="url(#bk-a)" />
              <circle cx={215} cy={n.y} r={22} fill={COLORS.valid}
                stroke={COLORS.mid} strokeWidth={1.5} />
              <text x={215} y={n.y - 4} textAnchor="middle" fontSize={11}
                fontWeight={600} fill={COLORS.dark}>{n.label}</text>
              <text x={215} y={n.y + 10} textAnchor="middle" fontSize={9}
                fill={COLORS.mid}>V={n.v.toFixed(1)}</text>
              <text x={160} y={n.y - 10} textAnchor="middle" fontSize={9}
                fill={COLORS.orange}>r={n.r > 0 ? '+' + n.r : n.r}</text>
            </g>
          ))}

          {/* Calculation table */}
          <text x={280} y={48} fontSize={11} fontWeight={600}
            fill={COLORS.primary} fontFamily={FONTS.mono}>
            V(s) = max [R + γ·V(s')]  γ=0.9
          </text>

          {nexts.map((n, i) => {
            const y = 72 + i * 28;
            return (
              <g key={`c${i}`}>
                {i === best && <rect x={272} y={y - 13} width={280} height={20} rx={4}
                  fill={COLORS.highlight} stroke={COLORS.primary} strokeWidth={1} />}
                <text x={280} y={y} fontSize={10}
                  fontWeight={i === best ? 700 : 400}
                  fill={i === best ? COLORS.primary : COLORS.dark}
                  fontFamily={FONTS.mono}>
                  {n.act}→{n.label}: {n.r} + 0.9×{n.v.toFixed(1)} = {vals[i].toFixed(2)}
                </text>
                {i === best && <text x={535} y={y} fontSize={10} fontWeight={700}
                  fill={COLORS.primary}>{t.step1Best}</text>}
              </g>
            );
          })}

          {/* Result box */}
          <rect x={272} y={155} width={280} height={28} rx={6}
            fill={COLORS.valid} stroke={COLORS.green} strokeWidth={1.5} />
          <text x={412} y={174} textAnchor="middle" fontSize={11}
            fontWeight={700} fill={COLORS.green} fontFamily={FONTS.mono}>
            {t.step1Result}
          </text>

          {/* Green arrow back to s */}
          <path d="M 272 170 Q 180 210 85 145" fill="none"
            stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={80} y={158} textAnchor="middle" fontSize={12}
            fontWeight={700} fill={COLORS.green}>3.80</text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 230`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <defs>
            <marker id="bk-a2" viewBox="0 0 10 10" refX={8} refY={5}
              markerWidth={6} markerHeight={6} orient="auto">
              <polygon points="0,0 10,5 0,10" fill={COLORS.mid} />
            </marker>
          </defs>

          <text x={W / 2} y={22} textAnchor="middle" fontSize={13}
            fontWeight={700} fill={COLORS.dark}>{t.step2Header}</text>

          {/* Chain: s₀ → s₁ → s₂ → Goal */}
          {[
            { x: 70, label: 's₀', v: '7.29' },
            { x: 200, label: 's₁', v: '8.1' },
            { x: 330, label: 's₂', v: '9' },
            { x: 460, label: isZh ? '目标' : 'Goal', v: '10' },
          ].map((s, i) => {
            const isGoal = i === 3;
            return (
              <g key={i}>
                <circle cx={s.x} cy={80} r={28}
                  fill={isGoal ? '#d4edda' : COLORS.highlight}
                  stroke={isGoal ? COLORS.green : COLORS.primary}
                  strokeWidth={isGoal ? 2.5 : 1.5} />
                <text x={s.x} y={75} textAnchor="middle" fontSize={12}
                  fontWeight={700} fill={COLORS.dark}>{s.label}</text>
                <text x={s.x} y={93} textAnchor="middle" fontSize={10}
                  fontWeight={600} fill={isGoal ? COLORS.green : COLORS.primary}>
                  V={s.v}
                </text>
                {isGoal && <text x={s.x} y={120} textAnchor="middle" fontSize={9}
                  fontWeight={600} fill={COLORS.green}>{t.step2Known}</text>}
                {i < 3 && <line x1={s.x + 30} y1={80} x2={s.x + 100} y2={80}
                  stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#bk-a2)" />}
              </g>
            );
          })}

          {/* Backward propagation arrow */}
          <path d="M 455 115 C 390 148 140 148 75 115" fill="none"
            stroke={COLORS.green} strokeWidth={2} strokeDasharray="5 3" />
          <text x={265} y={148} textAnchor="middle" fontSize={10}
            fontWeight={600} fill={COLORS.green}>{t.step2Arrow}</text>

          {/* Step-by-step calculation */}
          {[
            '① V(s₂) = 0 + 0.9 × 10 = 9',
            '② V(s₁) = 0 + 0.9 × 9 = 8.1',
            '③ V(s₀) = 0 + 0.9 × 8.1 = 7.29',
          ].map((line, i) => (
            <text key={i} x={80} y={178 + i * 22} fontSize={10}
              fill={COLORS.dark} fontFamily={FONTS.mono}>{line}</text>
          ))}
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={22} textAnchor="middle" fontSize={13}
            fontWeight={700} fill={COLORS.dark}>{t.step3Header}</text>

          {/* Iteration rows */}
          {iters.map((row, ri) => {
            const y = 42 + ri * 52;
            const isLast = ri === iters.length - 1;
            const label = ri === 0 ? t.step3Init
              : isLast ? t.step3Done
              : `${t.step3Iter} ${ri}`;
            return (
              <g key={ri}>
                <text x={58} y={y + 22} textAnchor="end" fontSize={10}
                  fontWeight={isLast ? 700 : 400}
                  fill={isLast ? COLORS.green : COLORS.dark}>{label}</text>
                {row.map((v, ci) => {
                  const cx = 80 + ci * 120;
                  const isGoal = ci === 3;
                  const prev = ri > 0 ? iters[ri - 1][ci] : v;
                  const updated = ri > 0 && prev !== v;
                  const frac = v / 10;
                  const bg = isGoal ? '#d4edda'
                    : v > 0 ? `rgba(59,130,246,${0.08 + frac * 0.25})`
                    : COLORS.bgAlt;
                  return (
                    <g key={ci}>
                      <rect x={cx} y={y} width={100} height={36} rx={6}
                        fill={bg}
                        stroke={updated ? COLORS.primary : COLORS.light}
                        strokeWidth={updated ? 2 : 1} />
                      <text x={cx + 50} y={y + 14} textAnchor="middle"
                        fontSize={9} fill={COLORS.mid}>
                        {isGoal ? t.step3Goal : `s${ci}`}
                      </text>
                      <text x={cx + 50} y={y + 30} textAnchor="middle"
                        fontSize={12} fontWeight={updated ? 700 : 400}
                        fill={updated ? COLORS.primary : COLORS.dark}
                        fontFamily={FONTS.mono}>{fmtV(v)}</text>
                    </g>
                  );
                })}
                {ri < iters.length - 1 && (
                  <text x={W / 2 + 20} y={y + 46} textAnchor="middle"
                    fontSize={14} fill={COLORS.mid}>↓</text>
                )}
              </g>
            );
          })}

          {/* Bottom note */}
          <rect x={60} y={256} width={460} height={20} rx={4}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={0.5} />
          <text x={W / 2} y={269} textAnchor="middle" fontSize={10}
            fontWeight={600} fill={COLORS.primary}>{t.step3Note}</text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} locale={locale} />;
}
