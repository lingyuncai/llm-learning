import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface ThinkingStep {
  type: 'think' | 'verify' | 'backtrack' | 'answer';
  text: string;
  label: string;
}

export default function EmergentThinking({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'R1-Zero 涌现行为展示',
      withRL: '✓ 有 RL 训练（R1-Zero）',
      withoutRL: '✗ 无 RL 训练（基础模型）',
      withRLSteps: [
        { type: 'think' as const, text: '让我分析这道题: 48÷6+2×3', label: '分步推理' },
        { type: 'think' as const, text: '先做除法: 48÷6 = 8', label: '运算优先级' },
        { type: 'think' as const, text: '再做乘法: 2×3 = 6', label: '分步计算' },
        { type: 'verify' as const, text: '等一下，让我验证: 8和6，最后加起来...', label: '自我验证' },
        { type: 'think' as const, text: '8 + 6 = 14', label: '汇总结果' },
        { type: 'verify' as const, text: '检查: 48÷6=8 ✓, 2×3=6 ✓, 8+6=14 ✓', label: '最终验证' },
        { type: 'answer' as const, text: '答案是 14', label: '输出答案' },
      ],
      withoutRLSteps: [
        { type: 'think' as const, text: '48÷6+2×3', label: '直接计算' },
        { type: 'think' as const, text: '= 8+2×3', label: '部分计算' },
        { type: 'think' as const, text: '= 10×3', label: '错误！先做了加法' },
        { type: 'answer' as const, text: '= 30', label: '错误答案' },
      ],
      emergentBehavior: '涌现行为：',
      noRLProblem: '无 RL 的问题：',
      emergentExplanation: '模型自发学会了分步推理、自我验证、运算优先级 — 没有人显式教过这些行为！',
      noRLExplanation: '缺乏深度推理能力，容易犯运算优先级等基础错误，无法自我检查和纠正',
      reasoning: '推理',
      verification: '验证',
      answer: '答案',
    },
    en: {
      title: 'R1-Zero Emergent Behavior Demo',
      withRL: '✓ With RL training (R1-Zero)',
      withoutRL: '✗ Without RL training (Base model)',
      withRLSteps: [
        { type: 'think' as const, text: "Let me analyze this problem: 48÷6+2×3", label: 'Step-by-step reasoning' },
        { type: 'think' as const, text: 'First division: 48÷6 = 8', label: 'Order of operations' },
        { type: 'think' as const, text: 'Then multiplication: 2×3 = 6', label: 'Step calculation' },
        { type: 'verify' as const, text: 'Wait, let me verify: 8 and 6, finally add them up...', label: 'Self-verification' },
        { type: 'think' as const, text: '8 + 6 = 14', label: 'Combine results' },
        { type: 'verify' as const, text: 'Check: 48÷6=8 ✓, 2×3=6 ✓, 8+6=14 ✓', label: 'Final verification' },
        { type: 'answer' as const, text: 'The answer is 14', label: 'Output answer' },
      ],
      withoutRLSteps: [
        { type: 'think' as const, text: '48÷6+2×3', label: 'Direct calculation' },
        { type: 'think' as const, text: '= 8+2×3', label: 'Partial calculation' },
        { type: 'think' as const, text: '= 10×3', label: 'Error! Did addition first' },
        { type: 'answer' as const, text: '= 30', label: 'Wrong answer' },
      ],
      emergentBehavior: 'Emergent Behavior:',
      noRLProblem: 'Problem without RL:',
      emergentExplanation: 'Model spontaneously learned step-by-step reasoning, self-verification, order of operations — nobody explicitly taught these behaviors!',
      noRLExplanation: 'Lacks deep reasoning ability, prone to basic errors like order of operations, cannot self-check and correct',
      reasoning: 'Reasoning',
      verification: 'Verification',
      answer: 'Answer',
    },
  }[locale];

  const [showRL, setShowRL] = useState(true);
  const steps = showRL ? t.withRLSteps : t.withoutRLSteps;

  const typeColor: Record<string, string> = {
    think: COLORS.primary,
    verify: COLORS.green,
    backtrack: COLORS.orange,
    answer: COLORS.purple,
  };

  const typeIcon: Record<string, string> = {
    think: '?',
    verify: '✓',
    backtrack: '↩',
    answer: '→',
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        <g onClick={() => setShowRL(!showRL)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 100} y={36} width={200} height={26} rx={13}
            fill={showRL ? COLORS.green : COLORS.red} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showRL ? t.withRL : t.withoutRL}
          </text>
        </g>

        {steps.map((step, i) => {
          const y = 78 + i * 40;
          const color = typeColor[step.type];
          return (
            <g key={i}>
              {i > 0 && (
                <line x1={50} y1={y - 18} x2={50} y2={y - 2} stroke={COLORS.light} strokeWidth={1.5} />
              )}
              <circle cx={50} cy={y + 12} r={12} fill={color} opacity={0.15} />
              <text x={50} y={y + 16} textAnchor="middle" fontSize={10} fill={color}>
                {typeIcon[step.type]}
              </text>
              <rect x={70} y={y} width={400} height={30} rx={6}
                fill={step.type === 'answer' ? (showRL ? '#d4edda' : COLORS.waste) : COLORS.bgAlt}
                stroke={color} strokeWidth={1} />
              <text x={80} y={y + 18} fontSize={10} fill={COLORS.dark}>
                {step.text}
              </text>
              <rect x={480} y={y + 2} width={80} height={22} rx={4} fill={color} opacity={0.15} />
              <text x={520} y={y + 17} textAnchor="middle" fontSize={8} fontWeight={600} fill={color}>
                {step.label}
              </text>
            </g>
          );
        })}

        <rect x={30} y={H - 60} width={520} height={48} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={40} y={H - 42} fontSize={10} fontWeight={600} fill={COLORS.orange}>
          {showRL ? t.emergentBehavior : t.noRLProblem}
        </text>
        <text x={40} y={H - 24} fontSize={10} fill={COLORS.mid}>
          {showRL ? t.emergentExplanation : t.noRLExplanation}
        </text>
        {showRL && (
          <g>
            {[
              { type: 'think', label: t.reasoning, x: 220 },
              { type: 'verify', label: t.verification, x: 300 },
              { type: 'answer', label: t.answer, x: 380 },
            ].map(item => (
              <g key={item.type}>
                <circle cx={item.x} cy={H - 42} r={5} fill={typeColor[item.type]} opacity={0.5} />
                <text x={item.x + 10} y={H - 38} fontSize={9} fill={COLORS.dark}>{item.label}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
