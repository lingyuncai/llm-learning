import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface Milestone {
  date: string;
  label: string;
  desc: string;
  tech: string;
  color: string;
}

export default function AlignmentMethodTimeline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const MILESTONES: Milestone[] = locale === 'zh' ? [
    { date: '2017', label: 'RLHF 论文', desc: 'Christiano et al. 提出用人类偏好训练 RL agent', tech: 'Deep RL from Human Preferences', color: COLORS.primary },
    { date: '2019', label: 'Fine-Tuning LM', desc: 'Ziegler et al. 首次将 RLHF 应用于语言模型', tech: 'PPO + Reward Model', color: COLORS.primary },
    { date: '2022.1', label: 'InstructGPT', desc: 'OpenAI 3 阶段 pipeline: SFT → RM → PPO', tech: 'SFT + RM + PPO (1.3B 优于 175B)', color: COLORS.green },
    { date: '2022.11', label: 'ChatGPT', desc: '基于 InstructGPT 方法训练，引爆 AI 革命', tech: 'RLHF at scale', color: COLORS.green },
    { date: '2023.7', label: 'Llama 2', desc: 'Meta 开源 RLHF 模型，推动开源对齐', tech: 'RLHF + Safety RM', color: COLORS.orange },
    { date: '2023.12', label: 'DPO', desc: 'Rafailov et al. 直接从偏好优化，去掉 RM 和 PPO', tech: 'Direct Preference Optimization', color: COLORS.purple },
    { date: '2024.2', label: 'GRPO', desc: 'DeepSeek 组采样去掉 Critic，降低训练成本', tech: 'Group Relative Policy Optimization', color: COLORS.red },
    { date: '2025.1', label: 'DeepSeek-R1', desc: 'RL 训练涌现 reasoning 能力，开启 thinking 时代', tech: 'GRPO + Rule Reward', color: COLORS.red },
  ] : [
    { date: '2017', label: 'RLHF Paper', desc: 'Christiano et al. propose training RL agents with human preferences', tech: 'Deep RL from Human Preferences', color: COLORS.primary },
    { date: '2019', label: 'Fine-Tuning LM', desc: 'Ziegler et al. first apply RLHF to language models', tech: 'PPO + Reward Model', color: COLORS.primary },
    { date: '2022.1', label: 'InstructGPT', desc: 'OpenAI 3-stage pipeline: SFT → RM → PPO', tech: 'SFT + RM + PPO (1.3B beats 175B)', color: COLORS.green },
    { date: '2022.11', label: 'ChatGPT', desc: 'Trained with InstructGPT method, sparked AI revolution', tech: 'RLHF at scale', color: COLORS.green },
    { date: '2023.7', label: 'Llama 2', desc: 'Meta open-sources RLHF model, advancing open alignment', tech: 'RLHF + Safety RM', color: COLORS.orange },
    { date: '2023.12', label: 'DPO', desc: 'Rafailov et al. optimize directly from preferences, removing RM and PPO', tech: 'Direct Preference Optimization', color: COLORS.purple },
    { date: '2024.2', label: 'GRPO', desc: 'DeepSeek group sampling removes Critic, reducing training cost', tech: 'Group Relative Policy Optimization', color: COLORS.red },
    { date: '2025.1', label: 'DeepSeek-R1', desc: 'RL training enables emergent reasoning, opens thinking era', tech: 'GRPO + Rule Reward', color: COLORS.red },
  ];

  const t = {
    zh: { title: 'LLM 对齐方法演进时间线', hover: 'Hover 查看每个里程碑的详细信息' },
    en: { title: 'LLM Alignment Method Timeline', hover: 'Hover to see milestone details' },
  }[locale];
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const timelineX = 100;
  const timelineY = 50;
  const itemH = 42;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Timeline line */}
        <line x1={timelineX} y1={timelineY} x2={timelineX} y2={timelineY + MILESTONES.length * itemH}
          stroke={COLORS.light} strokeWidth={2} />

        {/* Milestones */}
        {MILESTONES.map((ms, i) => {
          const y = timelineY + i * itemH;
          const isHovered = hoveredIdx === i;
          return (
            <g key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}>
              {/* Dot */}
              <circle cx={timelineX} cy={y + 10} r={isHovered ? 8 : 5}
                fill={ms.color} stroke="#fff" strokeWidth={2} />

              {/* Date */}
              <text x={timelineX - 15} y={y + 14} textAnchor="end" fontSize={10} fontWeight={600}
                fill={ms.color} fontFamily={FONTS.mono}>
                {ms.date}
              </text>

              {/* Label */}
              <text x={timelineX + 18} y={y + 10} fontSize={11} fontWeight={isHovered ? 700 : 600}
                fill={isHovered ? ms.color : COLORS.dark}>
                {ms.label}
              </text>
              <text x={timelineX + 18} y={y + 26} fontSize={9} fill={COLORS.mid}>
                {ms.tech}
              </text>
            </g>
          );
        })}

        {/* Detail panel */}
        {hoveredIdx !== null && (
          <g>
            <rect x={280} y={timelineY + hoveredIdx * itemH - 10} width={280} height={55} rx={8}
              fill={COLORS.bgAlt} stroke={MILESTONES[hoveredIdx].color} strokeWidth={1.5} />
            <text x={290} y={timelineY + hoveredIdx * itemH + 8} fontSize={11} fontWeight={700}
              fill={MILESTONES[hoveredIdx].color}>
              {MILESTONES[hoveredIdx].label} ({MILESTONES[hoveredIdx].date})
            </text>
            <text x={290} y={timelineY + hoveredIdx * itemH + 26} fontSize={10} fill={COLORS.dark}>
              {MILESTONES[hoveredIdx].desc.substring(0, 40)}
            </text>
            <text x={290} y={timelineY + hoveredIdx * itemH + 40} fontSize={10} fill={COLORS.mid}>
              {MILESTONES[hoveredIdx].desc.substring(40)}
            </text>
          </g>
        )}

        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {t.hover}
        </text>
      </svg>
    </div>
  );
}
