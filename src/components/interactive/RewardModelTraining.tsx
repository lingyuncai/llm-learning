import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function RewardModelTraining() {
  const steps = [
    {
      title: '偏好对收集',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 1: 收集人类偏好数据
          </text>

          {/* Data collection flow */}
          {[0, 1, 2].map(i => {
            const y = 45 + i * 50;
            return (
              <g key={i}>
                <rect x={30} y={y} width={80} height={32} rx={4} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
                <text x={70} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.primary}>Prompt {i + 1}</text>

                <rect x={130} y={y} width={70} height={32} rx={4} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
                <text x={165} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.green}>y_w ✓</text>

                <rect x={210} y={y} width={70} height={32} rx={4} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
                <text x={245} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.red}>y_l ✗</text>

                <text x={300} y={y + 20} fontSize={12} fill={COLORS.mid}>→</text>

                <rect x={320} y={y} width={100} height={32} rx={4} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
                <text x={370} y={y + 20} textAnchor="middle" fontSize={9} fill={COLORS.dark}>偏好对 (w≻l)</text>
              </g>
            );
          })}

          <rect x={440} y={50} width={120} height={100} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={500} y={85} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>偏好数据集</text>
          <text x={500} y={103} textAnchor="middle" fontSize={9} fill={COLORS.mid}>~10K-100K 对</text>
          <text x={500} y={118} textAnchor="middle" fontSize={9} fill={COLORS.mid}>人工标注</text>
        </svg>
      ),
    },
    {
      title: 'Bradley-Terry 概率建模',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 2: Bradley-Terry 模型
          </text>

          <rect x={30} y={40} width={520} height={55} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={W / 2} y={62} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
            P(y_w ≻ y_l | x) = σ(r_φ(x, y_w) - r_φ(x, y_l))
          </text>
          <text x={W / 2} y={82} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            σ = sigmoid | r_φ = Reward Model 输出的标量分数
          </text>

          {/* Intuition diagram */}
          <text x={100} y={118} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>直觉：</text>

          <rect x={30} y={125} width={100} height={30} rx={4} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={80} y={144} textAnchor="middle" fontSize={10} fill={COLORS.green}>r(y_w) = 3.2</text>

          <text x={145} y={144} fontSize={14} fill={COLORS.mid}>-</text>

          <rect x={160} y={125} width={100} height={30} rx={4} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={210} y={144} textAnchor="middle" fontSize={10} fill={COLORS.red}>r(y_l) = 1.1</text>

          <text x={275} y={144} fontSize={14} fill={COLORS.mid}>→</text>

          <text x={320} y={144} fontSize={11} fill={COLORS.dark} fontFamily={FONTS.mono}>Δ = 2.1</text>
          <text x={390} y={144} fontSize={11} fill={COLORS.dark}>→</text>
          <text x={440} y={144} fontSize={11} fontWeight={600} fill={COLORS.green} fontFamily={FONTS.mono}>σ(2.1) = 89%</text>

          <text x={W / 2} y={180} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            分数差越大 → 选择概率越高 → 模型越"自信"这个偏好排序是对的
          </text>
        </svg>
      ),
    },
    {
      title: 'Ranking Loss 训练',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 3: 训练 Reward Model
          </text>

          <rect x={30} y={40} width={520} height={50} rx={8} fill={COLORS.bgAlt} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={W / 2} y={60} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.orange} fontFamily={FONTS.mono}>
            L(φ) = -E[log σ(r_φ(x,y_w) - r_φ(x,y_l))]
          </text>
          <text x={W / 2} y={78} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
            最大化"赢家比输家分高"的概率 → RM 学会排序
          </text>

          {/* Training diagram */}
          <rect x={30} y={105} width={120} height={36} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={90} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.primary}>SFT Model</text>
          <text x={90} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>（初始化 RM）</text>

          <text x={165} y={127} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={180} y={105} width={120} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={240} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>RM Training</text>
          <text x={240} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>ranking loss</text>

          <text x={315} y={127} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={330} y={105} width={120} height={36} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={390} y={120} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>Reward Model</text>
          <text x={390} y={134} textAnchor="middle" fontSize={8} fill={COLORS.mid}>r_φ(x, y) → 标量分数</text>

          <rect x={30} y={155} width={520} height={36} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={40} y={172} fontSize={10} fontWeight={600} fill={COLORS.orange}>关键点：</text>
          <text x={110} y={172} fontSize={10} fill={COLORS.mid}>
            RM 通常是比 policy LLM 小的模型 | 输出一个标量分数而非文本 | 从 SFT 模型初始化
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
