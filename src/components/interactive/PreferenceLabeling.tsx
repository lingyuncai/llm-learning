import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 440;

interface Example {
  prompt: string;
  responseA: string;
  responseB: string;
  better: 'A' | 'B';
}

const EXAMPLES: Example[] = [
  {
    prompt: '解释量子纠缠',
    responseA: '量子纠缠是两个粒子间的一种奇妙关联，测量一个粒子会瞬间影响另一个，无论距离多远。这种"超距作用"困扰了爱因斯坦...',
    responseB: '量子纠缠是一个复杂的量子力学概念。简单来说就是粒子之间有关联。这个概念很难理解。',
    better: 'A',
  },
  {
    prompt: '写一首关于春天的诗',
    responseA: '春天来了\n花开了\n鸟叫了\n天暖了',
    responseB: '东风拂柳绿丝绦，\n雨润百花次第开。\n燕子衔泥筑新巢，\n一池春水映楼台。',
    better: 'B',
  },
  {
    prompt: '如何提高代码质量',
    responseA: '1. 写单元测试 2. Code Review 3. 使用 linter 4. 保持函数小巧 5. 有意义的命名 6. 避免过早优化...',
    responseB: '多写代码就好了，熟能生巧。',
    better: 'A',
  },
];

export default function PreferenceLabeling() {
  const [exIdx, setExIdx] = useState(0);
  const [choices, setChoices] = useState<('A' | 'B' | null)[]>([null, null, null]);
  const [showResult, setShowResult] = useState(false);

  const ex = EXAMPLES[exIdx];
  const choice = choices[exIdx];

  const choose = (c: 'A' | 'B') => {
    const newChoices = [...choices];
    newChoices[exIdx] = c;
    setChoices(newChoices);
    setShowResult(true);
  };

  const next = () => {
    setShowResult(false);
    setExIdx((exIdx + 1) % EXAMPLES.length);
  };

  const completed = choices.filter(c => c !== null).length;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          偏好标注模拟器
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          选择你认为更好的回答 | 已标注 {completed}/3
        </text>

        {/* Prompt */}
        <rect x={30} y={55} width={520} height={32} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
        <text x={40} y={68} fontSize={10} fontWeight={600} fill={COLORS.primary}>Prompt:</text>
        <text x={95} y={68} fontSize={11} fill={COLORS.dark}>{ex.prompt}</text>

        {/* Response A */}
        <rect x={30} y={95} width={250} height={120} rx={6}
          fill={choice === 'A' ? (showResult && ex.better === 'A' ? '#d4edda' : showResult ? COLORS.waste : COLORS.highlight) : COLORS.bgAlt}
          stroke={choice === 'A' ? COLORS.primary : COLORS.light} strokeWidth={choice === 'A' ? 2 : 1}
          onClick={() => !showResult && choose('A')} style={{ cursor: showResult ? 'default' : 'pointer' }} />
        <text x={40} y={112} fontSize={10} fontWeight={700} fill={COLORS.dark}>回答 A</text>
        {ex.responseA.split('\n').map((line, i) => (
          <text key={i} x={40} y={128 + i * 16} fontSize={10} fill={COLORS.mid}>
            {line.substring(0, 35)}{line.length > 35 ? '...' : ''}
          </text>
        ))}

        {/* Response B */}
        <rect x={300} y={95} width={250} height={120} rx={6}
          fill={choice === 'B' ? (showResult && ex.better === 'B' ? '#d4edda' : showResult ? COLORS.waste : COLORS.highlight) : COLORS.bgAlt}
          stroke={choice === 'B' ? COLORS.primary : COLORS.light} strokeWidth={choice === 'B' ? 2 : 1}
          onClick={() => !showResult && choose('B')} style={{ cursor: showResult ? 'default' : 'pointer' }} />
        <text x={310} y={112} fontSize={10} fontWeight={700} fill={COLORS.dark}>回答 B</text>
        {ex.responseB.split('\n').map((line, i) => (
          <text key={i} x={310} y={128 + i * 16} fontSize={10} fill={COLORS.mid}>
            {line.substring(0, 35)}{line.length > 35 ? '...' : ''}
          </text>
        ))}

        {/* Result feedback */}
        {showResult && (
          <g>
            <rect x={30} y={225} width={520} height={40} rx={6}
              fill={choice === ex.better ? '#d4edda' : COLORS.waste}
              stroke={choice === ex.better ? COLORS.green : COLORS.red} strokeWidth={1} />
            <text x={W / 2} y={248} textAnchor="middle" fontSize={12} fontWeight={600}
              fill={choice === ex.better ? COLORS.green : COLORS.red}>
              {choice === ex.better ? '✓ 与多数标注者一致！' : `✗ 多数标注者选择了回答 ${ex.better}`}
            </text>
          </g>
        )}

        {/* How RM learns from this */}
        <rect x={30} y={275} width={520} height={80} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={40} y={295} fontSize={11} fontWeight={600} fill={COLORS.dark}>
          Reward Model 如何学习
        </text>
        <text x={40} y={315} fontSize={10} fill={COLORS.mid}>
          每个偏好对 (y_w ≻ y_l) → Bradley-Terry 模型: P(y_w ≻ y_l) = σ(r(y_w) - r(y_l))
        </text>
        <text x={40} y={333} fontSize={10} fill={COLORS.mid}>
          RM 学习给"更好"的回答更高分，给"更差"的更低分 → 将人类偏好量化为标量 reward
        </text>

        {/* Progress dots */}
        {EXAMPLES.map((_, i) => (
          <circle key={i} cx={W / 2 - 20 + i * 20} cy={H - 56} r={6}
            fill={choices[i] !== null ? COLORS.green : i === exIdx ? COLORS.primary : COLORS.light}
            stroke={i === exIdx ? COLORS.primary : 'none'} strokeWidth={2} />
        ))}

        {/* Next button */}
        {showResult && (
          <g onClick={next} style={{ cursor: 'pointer' }}>
            <rect x={W / 2 - 40} y={H - 42} width={80} height={28} rx={5} fill={COLORS.primary} />
            <text x={W / 2} y={H - 24} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
              下一题 →
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
