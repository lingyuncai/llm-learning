import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface ReasonStep {
  text: string;
  correct: boolean;
  ormLabel?: string;
  prmLabel: string;
}

const STEPS: ReasonStep[] = [
  { text: '题目：计算 (2+3) × 4 - 6 ÷ 2', correct: true, prmLabel: '✓ 正确理解题意' },
  { text: '第一步：2 + 3 = 5', correct: true, prmLabel: '✓ 正确' },
  { text: '第二步：5 × 4 = 20', correct: true, prmLabel: '✓ 正确' },
  { text: '第三步：6 ÷ 2 = 4', correct: false, prmLabel: '✗ 错误！6÷2=3' },
  { text: '第四步：20 - 4 = 16', correct: true, prmLabel: '✓ 计算正确（但基于错误前提）' },
  { text: '最终答案：16', correct: false, ormLabel: '✗ 答案错误', prmLabel: '✗ 答案错误 (正确: 17)' },
];

export default function ORMvsPRM() {
  const [showPRM, setShowPRM] = useState(false);

  const stepY = 80;
  const stepH = 46;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          ORM vs PRM：结果奖励 vs 过程奖励
        </text>

        {/* Toggle */}
        <g onClick={() => setShowPRM(!showPRM)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 80} y={36} width={160} height={26} rx={13}
            fill={showPRM ? COLORS.green : COLORS.orange} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showPRM ? 'PRM (Process Reward)' : 'ORM (Outcome Reward)'}
          </text>
        </g>

        {/* Reasoning steps */}
        {STEPS.map((step, i) => {
          const y = stepY + i * stepH;
          const isLast = i === STEPS.length - 1;

          return (
            <g key={i}>
              <rect x={30} y={y} width={340} height={stepH - 6} rx={6}
                fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
              <text x={40} y={y + (stepH - 6) / 2 + 4} fontSize={10} fill={COLORS.dark}>
                {step.text}
              </text>

              {!showPRM && (
                <g>
                  {isLast ? (
                    <>
                      <rect x={390} y={y} width={170} height={stepH - 6} rx={6}
                        fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1.5} />
                      <text x={475} y={y + (stepH - 6) / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.red}>
                        {step.ormLabel}
                      </text>
                    </>
                  ) : (
                    <rect x={390} y={y} width={170} height={stepH - 6} rx={6}
                      fill={COLORS.masked} stroke={COLORS.light} strokeWidth={1} />
                  )}
                  {!isLast && (
                    <text x={475} y={y + (stepH - 6) / 2 + 4} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
                      — (不评估)
                    </text>
                  )}
                </g>
              )}

              {showPRM && (
                <rect x={390} y={y} width={170} height={stepH - 6} rx={6}
                  fill={step.correct ? '#d4edda' : COLORS.waste}
                  stroke={step.correct ? COLORS.green : COLORS.red} strokeWidth={1.5} />
              )}
              {showPRM && (
                <text x={475} y={y + (stepH - 6) / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={600}
                  fill={step.correct ? COLORS.green : COLORS.red}>
                  {step.prmLabel}
                </text>
              )}
            </g>
          );
        })}

        {showPRM && (
          <rect x={390} y={stepY + 3 * stepH} width={170} height={stepH - 6} rx={6}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth={2.5}
            opacity={0.3} />
        )}

        <rect x={30} y={H - 56} width={520} height={44} rx={6}
          fill={showPRM ? '#d4edda' : COLORS.highlight}
          stroke={showPRM ? COLORS.green : COLORS.orange} strokeWidth={1} />
        <text x={40} y={H - 38} fontSize={10} fontWeight={600} fill={showPRM ? COLORS.green : COLORS.orange}>
          {showPRM ? 'PRM 优势：' : 'ORM 局限：'}
        </text>
        <text x={40} y={H - 22} fontSize={10} fill={COLORS.mid}>
          {showPRM
            ? '第 3 步错误被精确定位！即使最终答案碰巧对了，PRM 也能发现过程错误（更细粒度的信号）'
            : 'ORM 只看最终答案 → 如果过程错误但答案碰巧对了，ORM 会给高分 → 无法定位错误步骤'}
        </text>
      </svg>
    </div>
  );
}
