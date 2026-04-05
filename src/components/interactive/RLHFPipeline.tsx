import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface Stage {
  id: string;
  label: string;
  x: number;
  color: string;
  inputs: string;
  outputs: string;
  loss: string;
  detail: string;
}

const STAGES: Stage[] = [
  {
    id: 'sft', label: 'SFT', x: 100, color: COLORS.primary,
    inputs: '高质量 (prompt, response) 对',
    outputs: 'SFT Model π_SFT',
    loss: 'Cross-entropy loss (标准语言模型 loss)',
    detail: '用人工编写的高质量回答做监督微调。模型学会遵循指令的基本能力，但还不知道什么回答"更好"。'
  },
  {
    id: 'rm', label: 'Reward\nModel', x: 290, color: COLORS.orange,
    inputs: 'prompt + (response_w, response_l) 偏好对',
    outputs: 'Reward Model r_φ',
    loss: 'Bradley-Terry ranking loss',
    detail: '人类标注者比较两个回答，选择更好的。RM 学习将"更好"量化为分数。通常训练数万到十万个偏好对。'
  },
  {
    id: 'ppo', label: 'PPO\n优化', x: 480, color: COLORS.green,
    inputs: 'prompts + π_SFT (ref) + r_φ',
    outputs: '对齐后的 LLM π_θ',
    loss: 'PPO clipped objective + KL penalty',
    detail: '用 RM 作为 reward 信号，PPO 优化 LLM 策略。KL 惩罚防止偏离 SFT 模型太远。这是计算最密集的阶段。'
  },
];

export default function RLHFPipeline() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const active = STAGES.find(s => s.id === activeStage);

  const stageY = 80;
  const boxW = 130, boxH = 55;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          RLHF 三阶段流水线
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          点击每个阶段查看详细数据流
        </text>

        {/* Stage boxes */}
        {STAGES.map((stage, i) => {
          const isActive = activeStage === stage.id;
          return (
            <g key={stage.id} onClick={() => setActiveStage(isActive ? null : stage.id)} style={{ cursor: 'pointer' }}>
              {/* Arrow from previous */}
              {i > 0 && (
                <line x1={STAGES[i - 1].x + boxW / 2 + 5} y1={stageY + boxH / 2}
                  x2={stage.x - boxW / 2 - 5} y2={stageY + boxH / 2}
                  stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrowRL)" />
              )}
              <rect x={stage.x - boxW / 2} y={stageY} width={boxW} height={boxH} rx={10}
                fill={isActive ? stage.color : COLORS.bgAlt}
                stroke={stage.color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={stage.x} y={stageY + boxH / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700}
                fill={isActive ? '#fff' : stage.color}>
                {stage.label.split('\n').map((line, li) => (
                  <tspan key={li} x={stage.x} dy={li === 0 ? -6 : 16}>{line}</tspan>
                ))}
              </text>
              {/* Step number */}
              <circle cx={stage.x - boxW / 2 + 12} cy={stageY - 8} r={10} fill={stage.color} />
              <text x={stage.x - boxW / 2 + 12} y={stageY - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
                {i + 1}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="arrowRL" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Data flow labels */}
        <text x={195} y={stageY - 4} textAnchor="middle" fontSize={9} fill={COLORS.mid}>π_SFT</text>
        <text x={385} y={stageY - 4} textAnchor="middle" fontSize={9} fill={COLORS.mid}>r_φ</text>

        {/* Detail panel */}
        {active ? (
          <g>
            <rect x={30} y={170} width={520} height={230} rx={8} fill={COLORS.bgAlt} stroke={active.color} strokeWidth={1.5} />
            <text x={50} y={195} fontSize={14} fontWeight={700} fill={active.color}>
              阶段 {STAGES.indexOf(active) + 1}: {active.label.replace('\n', ' ')}
            </text>

            <text x={50} y={220} fontSize={11} fontWeight={600} fill={COLORS.dark}>输入：</text>
            <text x={100} y={220} fontSize={11} fill={COLORS.mid}>{active.inputs}</text>

            <text x={50} y={244} fontSize={11} fontWeight={600} fill={COLORS.dark}>输出：</text>
            <text x={100} y={244} fontSize={11} fill={COLORS.mid}>{active.outputs}</text>

            <text x={50} y={268} fontSize={11} fontWeight={600} fill={COLORS.dark}>Loss：</text>
            <text x={100} y={268} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.mono}>{active.loss}</text>

            <line x1={50} y1={284} x2={530} y2={284} stroke={COLORS.light} strokeWidth={1} />

            <text x={50} y={304} fontSize={11} fill={COLORS.dark}>{active.detail.substring(0, 70)}</text>
            <text x={50} y={322} fontSize={11} fill={COLORS.dark}>{active.detail.substring(70, 140)}</text>
            <text x={50} y={340} fontSize={11} fill={COLORS.mid}>{active.detail.substring(140)}</text>
          </g>
        ) : (
          <g>
            <rect x={30} y={170} width={520} height={230} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={W / 2} y={250} textAnchor="middle" fontSize={13} fill={COLORS.mid}>
              ← 点击上方阶段查看详情 →
            </text>
            <text x={W / 2} y={280} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
              SFT: 学会遵循指令 → RM: 量化人类偏好 → PPO: 优化策略使 LLM 对齐
            </text>
            <text x={W / 2} y={310} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
              这是 InstructGPT (2022) 和 ChatGPT 使用的核心训练流程
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
