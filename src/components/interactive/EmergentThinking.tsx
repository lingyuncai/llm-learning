import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface ThinkingStep {
  type: 'think' | 'verify' | 'backtrack' | 'answer';
  text: string;
  label: string;
}

const WITH_RL: ThinkingStep[] = [
  { type: 'think', text: '让我分析这道题: 48÷6+2×3', label: '分步推理' },
  { type: 'think', text: '先做除法: 48÷6 = 8', label: '运算优先级' },
  { type: 'think', text: '再做乘法: 2×3 = 6', label: '分步计算' },
  { type: 'verify', text: '等一下，让我验证: 8和6，最后加起来...', label: '自我验证' },
  { type: 'think', text: '8 + 6 = 14', label: '汇总结果' },
  { type: 'verify', text: '检查: 48÷6=8 ✓, 2×3=6 ✓, 8+6=14 ✓', label: '最终验证' },
  { type: 'answer', text: '答案是 14', label: '输出答案' },
];

const WITHOUT_RL: ThinkingStep[] = [
  { type: 'think', text: '48÷6+2×3', label: '直接计算' },
  { type: 'think', text: '= 8+2×3', label: '部分计算' },
  { type: 'think', text: '= 10×3', label: '错误！先做了加法' },
  { type: 'answer', text: '= 30', label: '错误答案' },
];

export default function EmergentThinking() {
  const [showRL, setShowRL] = useState(true);
  const steps = showRL ? WITH_RL : WITHOUT_RL;

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
          R1-Zero 涌现行为展示
        </text>

        <g onClick={() => setShowRL(!showRL)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 100} y={36} width={200} height={26} rx={13}
            fill={showRL ? COLORS.green : COLORS.red} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showRL ? '✓ 有 RL 训练（R1-Zero）' : '✗ 无 RL 训练（基础模型）'}
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
          {showRL ? '涌现行为：' : '无 RL 的问题：'}
        </text>
        <text x={40} y={H - 24} fontSize={10} fill={COLORS.mid}>
          {showRL
            ? '模型自发学会了分步推理、自我验证、运算优先级 — 没有人显式教过这些行为！'
            : '缺乏深度推理能力，容易犯运算优先级等基础错误，无法自我检查和纠正'}
        </text>
        {showRL && (
          <g>
            {[
              { type: 'think', label: '推理', x: 220 },
              { type: 'verify', label: '验证', x: 300 },
              { type: 'answer', label: '答案', x: 380 },
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
