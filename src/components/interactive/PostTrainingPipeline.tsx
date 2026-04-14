// src/components/interactive/PostTrainingPipeline.tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 520;

interface PipelineStage {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  w: number;
  solves: string;
  rlConcept: string;
  article: string;
}

const STAGES: PipelineStage[] = [
  {
    id: 'pretrain', label: 'Pretrained LLM', color: COLORS.mid,
    x: W / 2, y: 60, w: 160,
    solves: '从海量文本中学习语言规律（next-token prediction）',
    rlConcept: '初始策略 π_init — 会说话，但不会遵循指令',
    article: '前置知识：Transformer、Attention',
  },
  {
    id: 'sft', label: 'SFT 监督微调', color: COLORS.primary,
    x: W / 2, y: 130, w: 160,
    solves: '学会遵循指令的基本格式和能力',
    rlConcept: 'Behavioral cloning — 模仿专家轨迹，有上限问题',
    article: '本文 §1 讨论了 SFT 的天花板',
  },
  {
    id: 'rlhf', label: 'RLHF', color: COLORS.orange,
    x: 120, y: 230, w: 100,
    solves: 'RM + PPO 完整 pipeline，用人类偏好对齐模型',
    rlConcept: 'On-policy RL：4 个模型同时运行，训练复杂但效果强',
    article: '→ 下一篇《RLHF：从人类反馈中学习》',
  },
  {
    id: 'dpo', label: 'DPO', color: COLORS.green,
    x: 290, y: 230, w: 100,
    solves: '跳过 RM，直接从偏好数据优化（offline）',
    rlConcept: 'Response-level 优化：closed-form 解，训练简单如 SFT',
    article: '→《从 DPO 到 GRPO：直接偏好优化》',
  },
  {
    id: 'grpo', label: 'GRPO', color: COLORS.purple,
    x: 460, y: 230, w: 100,
    solves: '无 Critic，组内相对排名替代绝对奖励',
    rlConcept: 'Group-relative：从同一 prompt 的多个采样中学习',
    article: '→《从 DPO 到 GRPO》中详述',
  },
  {
    id: 'rm', label: 'Reward 设计', color: COLORS.red,
    x: 200, y: 330, w: 140,
    solves: 'ORM vs PRM、reward hacking 防御',
    rlConcept: 'Reward 质量决定对齐天花板；PRM 提供 dense signal',
    article: '→《Reward 设计与 Scaling》',
  },
  {
    id: 'tts', label: 'Test-Time Scaling', color: '#00838f',
    x: 400, y: 330, w: 140,
    solves: '推理时用更多计算换更好的输出质量',
    rlConcept: 'Best-of-N、MCTS + PRM、CoT 作为 RL trajectory',
    article: '→《Test-Time Scaling 与思维强化》',
  },
];

const ARROWS: [string, string][] = [
  ['pretrain', 'sft'],
  ['sft', 'rlhf'], ['sft', 'dpo'], ['sft', 'grpo'],
  ['rlhf', 'rm'], ['dpo', 'rm'], ['grpo', 'rm'],
  ['rm', 'tts'],
];

export default function PostTrainingPipeline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = locale === 'zh' ? {
    title: 'LLM Post-Training 全景图',
    subtitle: '点击每个阶段查看它解决什么问题',
    solves: '解决的问题：',
    rlConcept: 'RL 视角：',
    article: '对应文章：',
    rlBlock: 'RL 对齐与优化',
  } : {
    title: 'LLM Post-Training Landscape',
    subtitle: 'Click each stage to see what it solves',
    solves: 'Solves:',
    rlConcept: 'RL perspective:',
    article: 'Article:',
    rlBlock: 'RL Alignment & Optimization',
  };

  const [active, setActive] = useState<string | null>(null);
  const stageMap = Object.fromEntries(STAGES.map(s => [s.id, s]));
  const activeStage = active ? stageMap[active] : null;

  const boxH = 32;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize={15} fontWeight={700}
          fill={COLORS.dark}>{t.title}</text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize={11}
          fill={COLORS.mid}>{t.subtitle}</text>

        {/* Arrow marker */}
        <defs>
          <marker id="arrowPT" viewBox="0 0 10 10" refX={8} refY={5}
            markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* RL block background */}
        <rect x={60} y={200} width={460} height={80} rx={10}
          fill="none" stroke={COLORS.light} strokeWidth={1} strokeDasharray="6,3" />
        <text x={70} y={218} fontSize={9} fill={COLORS.mid}>{t.rlBlock}</text>

        {/* Arrows */}
        {ARROWS.map(([from, to], i) => {
          const f = stageMap[from], toS = stageMap[to];
          return (
            <line key={i}
              x1={f.x} y1={f.y + boxH / 2}
              x2={toS.x} y2={toS.y - boxH / 2 - 4}
              stroke={COLORS.light} strokeWidth={1.5} markerEnd="url(#arrowPT)" />
          );
        })}

        {/* Stage boxes */}
        {STAGES.map(stage => {
          const isActive = active === stage.id;
          return (
            <g key={stage.id}
              onClick={() => setActive(isActive ? null : stage.id)}
              style={{ cursor: 'pointer' }}>
              <rect x={stage.x - stage.w / 2} y={stage.y - boxH / 2}
                width={stage.w} height={boxH} rx={boxH / 2}
                fill={isActive ? stage.color : COLORS.bgAlt}
                stroke={stage.color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={stage.x} y={stage.y + 4} textAnchor="middle"
                fontSize={11} fontWeight={600}
                fill={isActive ? '#fff' : stage.color}>
                {stage.label}
              </text>
            </g>
          );
        })}

        {/* Detail panel */}
        {activeStage ? (
          <g>
            <rect x={30} y={390} width={520} height={110} rx={8}
              fill={COLORS.bgAlt} stroke={activeStage.color} strokeWidth={1.5} />
            <text x={50} y={414} fontSize={13} fontWeight={700}
              fill={activeStage.color}>{activeStage.label}</text>

            <text x={50} y={436} fontSize={10} fontWeight={600}
              fill={COLORS.dark}>{t.solves}</text>
            <text x={140} y={436} fontSize={10} fill={COLORS.mid}>
              {activeStage.solves}
            </text>

            <text x={50} y={456} fontSize={10} fontWeight={600}
              fill={COLORS.dark}>{t.rlConcept}</text>
            <text x={140} y={456} fontSize={10} fill={COLORS.mid}>
              {activeStage.rlConcept}
            </text>

            <text x={50} y={476} fontSize={10} fontWeight={600}
              fill={COLORS.dark}>{t.article}</text>
            <text x={140} y={476} fontSize={10} fill={COLORS.primary}>
              {activeStage.article}
            </text>
          </g>
        ) : (
          <g>
            <rect x={30} y={390} width={520} height={110} rx={8}
              fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={W / 2} y={450} textAnchor="middle" fontSize={12}
              fill={COLORS.mid}>← {t.subtitle} →</text>
          </g>
        )}
      </svg>
    </div>
  );
}
