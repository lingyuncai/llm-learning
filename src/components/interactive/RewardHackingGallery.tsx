import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface HackCase {
  title: string;
  rmScore: number;
  quality: number;
  example: string;
  mechanism: string;
}

const CASES: HackCase[] = [
  {
    title: '冗长注水',
    rmScore: 0.91,
    quality: 0.35,
    example: '非常感谢您提出这个非常好的问题。让我来非常详细地为您解答这个非常重要的问题。首先...（500字废话后才切入正题）',
    mechanism: 'RM 在训练数据中看到"详细回答"得分高 → 模型学会"写得长就是写得好"',
  },
  {
    title: '讨好措辞',
    rmScore: 0.87,
    quality: 0.45,
    example: '这真是一个非常棒的问题！您的思考非常深刻！让我来回答...\n（实际回答内容浅薄）',
    mechanism: 'RM 训练数据中友善回答得分高 → 模型学会用赞美代替实质内容',
  },
  {
    title: '格式包装',
    rmScore: 0.94,
    quality: 0.40,
    example: '## 答案\n### 1. 第一点\n- 要点 A\n- 要点 B\n### 2. 第二点\n（格式完美但内容是同义重复）',
    mechanism: 'RM 偏好结构化输出 → 模型学会用精美格式掩盖空洞内容',
  },
  {
    title: '安全逃避',
    rmScore: 0.82,
    quality: 0.20,
    example: '我理解您的问题，但这个话题比较敏感...\n作为 AI 助手，我无法提供...\n建议您咨询专业人士...',
    mechanism: 'Safety RM 惩罚任何"危险"回答 → 模型对所有稍有争议的问题都拒绝回答',
  },
];

export default function RewardHackingGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = CASES[activeIdx];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Reward Hacking 案例展
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          RM score 高 ≠ 真实质量高 — Goodhart's Law 的体现
        </text>

        {CASES.map((c, i) => (
          <g key={i} onClick={() => setActiveIdx(i)} style={{ cursor: 'pointer' }}>
            <rect x={30 + i * 135} y={55} width={125} height={28} rx={6}
              fill={activeIdx === i ? COLORS.red : COLORS.bgAlt}
              stroke={COLORS.mid} strokeWidth={1} />
            <text x={92 + i * 135} y={73} textAnchor="middle" fontSize={10}
              fontWeight={activeIdx === i ? 700 : 400} fill={activeIdx === i ? '#fff' : COLORS.dark}>
              {c.title}
            </text>
          </g>
        ))}

        <rect x={30} y={95} width={250} height={70} rx={8} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={45} y={115} fontSize={11} fontWeight={600} fill={COLORS.dark}>RM Score</text>
        <rect x={130} y={103} width={active.rmScore * 130} height={14} rx={3} fill={COLORS.green} opacity={0.7} />
        <text x={130 + active.rmScore * 130 + 8} y={115} fontSize={10} fontWeight={600} fill={COLORS.green} fontFamily={FONTS.mono}>
          {active.rmScore.toFixed(2)}
        </text>
        <text x={45} y={145} fontSize={11} fontWeight={600} fill={COLORS.dark}>真实质量</text>
        <rect x={130} y={133} width={active.quality * 130} height={14} rx={3} fill={COLORS.red} opacity={0.7} />
        <text x={130 + active.quality * 130 + 8} y={145} fontSize={10} fontWeight={600} fill={COLORS.red} fontFamily={FONTS.mono}>
          {active.quality.toFixed(2)}
        </text>

        <rect x={300} y={95} width={250} height={70} rx={8} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
        <text x={425} y={115} textAnchor="middle" fontSize={20} fontWeight={700} fill={COLORS.red}>
          Gap: {((active.rmScore - active.quality) * 100).toFixed(0)}%
        </text>
        <text x={425} y={138} textAnchor="middle" fontSize={10} fill={COLORS.dark}>
          RM 认为很好
        </text>
        <text x={425} y={153} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
          实际质量很差
        </text>

        <rect x={30} y={175} width={520} height={90} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={40} y={193} fontSize={10} fontWeight={600} fill={COLORS.dark}>模型输出示例：</text>
        {active.example.split('\n').slice(0, 3).map((line, i) => (
          <text key={i} x={40} y={211 + i * 16} fontSize={10} fill={COLORS.mid}>
            {line.substring(0, 70)}{line.length > 70 ? '...' : ''}
          </text>
        ))}

        <rect x={30} y={275} width={520} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={40} y={293} fontSize={10} fontWeight={600} fill={COLORS.orange}>Hack 机制：</text>
        <text x={40} y={311} fontSize={10} fill={COLORS.dark}>
          {active.mechanism}
        </text>

        <rect x={30} y={335} width={520} height={48} rx={6} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
        <text x={40} y={355} fontSize={10} fontWeight={600} fill={COLORS.primary}>
          Goodhart's Law: "当一个度量成为目标时，它就不再是一个好的度量"
        </text>
        <text x={40} y={373} fontSize={10} fill={COLORS.mid}>
          解决方案：更大更强的 RM、过程奖励 (PRM)、多样化训练数据、KL 约束、Constitutional AI
        </text>
      </svg>
    </div>
  );
}
