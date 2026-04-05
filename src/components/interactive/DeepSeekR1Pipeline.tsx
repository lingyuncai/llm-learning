import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function DeepSeekR1Pipeline() {
  const steps = [
    {
      title: '冷启动数据',
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 1: 少量高质量 CoT 数据冷启动
          </text>
          <rect x={30} y={40} width={520} height={40} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={40} y={58} fontSize={10} fontWeight={600} fill={COLORS.primary}>冷启动数据：</text>
          <text x={40} y={72} fontSize={10} fill={COLORS.mid}>
            少量 (prompt, long CoT answer) 对 → 教模型"思考的格式"（用 {'<think>'} 标签包裹推理过程）
          </text>
          <rect x={30} y={95} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={115} fontSize={10} fill={COLORS.dark}>
            目的：不是教模型"如何正确推理"，而是教模型"输出推理过程的格式"
          </text>
          <text x={40} y={133} fontSize={10} fill={COLORS.mid}>
            实际的推理能力来自下一步的 RL 训练
          </text>
        </svg>
      ),
    },
    {
      title: 'GRPO 训练 (R1-Zero)',
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 2: GRPO + 规则 Reward → 涌现 Thinking
          </text>
          <rect x={30} y={40} width={250} height={60} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={155} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>GRPO 训练</text>
          <text x={155} y={76} textAnchor="middle" fontSize={9} fill={COLORS.mid}>组采样 + 相对 Advantage</text>
          <text x={155} y={92} textAnchor="middle" fontSize={9} fill={COLORS.mid}>Reward = 答案正确性（规则判断）</text>

          <text x={295} y={70} fontSize={14} fill={COLORS.mid}>→</text>

          <rect x={310} y={40} width={240} height={60} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={430} y={58} textAnchor="middle" fontSize={10} fontWeight={700} fill={COLORS.green}>R1-Zero</text>
          <text x={430} y={76} textAnchor="middle" fontSize={9} fill={COLORS.mid}>涌现行为：自我验证、回溯</text>
          <text x={430} y={92} textAnchor="middle" fontSize={9} fill={COLORS.mid}>分步推理、反思重试</text>

          <rect x={30} y={110} width={520} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={40} y={128} fontSize={10} fontWeight={600} fill={COLORS.red}>关键发现：</text>
          <text x={40} y={144} fontSize={10} fill={COLORS.dark}>
            没有人教模型"如何思考"，只给了正确性 reward → 模型自发涌现了复杂的推理策略！
          </text>
        </svg>
      ),
    },
    {
      title: 'Rejection Sampling + SFT',
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 3: 收集高质量 CoT → SFT 蒸馏
          </text>
          <rect x={30} y={40} width={160} height={45} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={110} y={66} textAnchor="middle" fontSize={10} fill={COLORS.dark}>R1-Zero 生成</text>

          <text x={200} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={210} y={40} width={130} height={45} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={275} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>Rejection</text>
          <text x={275} y={74} textAnchor="middle" fontSize={10} fill={COLORS.orange}>Sampling</text>

          <text x={350} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={360} y={40} width={190} height={45} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={455} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>高质量 CoT 数据</text>
          <text x={455} y={74} textAnchor="middle" fontSize={9} fill={COLORS.mid}>只保留答案正确的 trajectory</text>

          <rect x={30} y={100} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.dark}>蒸馏过程：</text>
          <text x={40} y={136} fontSize={10} fill={COLORS.mid}>
            用 R1-Zero 的高质量 CoT 数据对更小的模型做 SFT → 让小模型也具备 thinking 能力
          </text>
        </svg>
      ),
    },
    {
      title: '最终 RL 精调 (R1)',
      content: (
        <svg viewBox={`0 0 ${W} 160`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            Step 4: 最终 RL 精调 → DeepSeek-R1
          </text>
          <rect x={30} y={40} width={160} height={45} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={110} y={66} textAnchor="middle" fontSize={10} fill={COLORS.dark}>SFT 后的模型</text>

          <text x={200} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={210} y={40} width={130} height={45} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={275} y={58} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>GRPO</text>
          <text x={275} y={74} textAnchor="middle" fontSize={9} fill={COLORS.mid}>+ 多类型 reward</text>

          <text x={350} y={66} fontSize={12} fill={COLORS.mid}>→</text>

          <rect x={360} y={40} width={190} height={45} rx={6} fill={COLORS.purple} stroke={COLORS.purple} strokeWidth={1.5} />
          <text x={455} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">DeepSeek-R1</text>
          <text x={455} y={74} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.8)">数学/代码 SOTA</text>

          <rect x={30} y={100} width={520} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth={1} />
          <text x={40} y={118} fontSize={10} fontWeight={600} fill={COLORS.purple}>完整 Pipeline：</text>
          <text x={40} y={136} fontSize={10} fill={COLORS.dark}>
            冷启动 → GRPO (涌现 thinking) → Rejection Sampling → SFT 蒸馏 → GRPO 精调 → R1
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
