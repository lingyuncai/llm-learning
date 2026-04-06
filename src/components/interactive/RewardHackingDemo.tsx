import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface HackExample {
  label: string;
  rmScore: number;
  trueQuality: string;
  output: string;
  hackType: string;
}

const WITHOUT_KL: HackExample[] = [
  { label: '冗长回答', rmScore: 0.92, trueQuality: '低', output: '非常感谢您提出这个非常好的问题！让我来为您详细解答这个非常重要的问题。首先，我想说...（后面重复废话 500 字）', hackType: 'RM 偏好长回答 → 模型学会注水' },
  { label: '讨好措辞', rmScore: 0.88, trueQuality: '中', output: '这是一个非常棒的问题！您真是太聪明了！让我来回答...\n（实际内容很浅）', hackType: 'RM 被赞美性语言欺骗 → 内容空洞' },
  { label: '格式 Hack', rmScore: 0.95, trueQuality: '低', output: '## 答案\n\n### 第一点\n- 项目1\n- 项目2\n\n### 第二点\n...（格式完美但内容重复）', hackType: 'RM 偏好格式化输出 → 形式大于内容' },
];

const WITH_KL: HackExample[] = [
  { label: '简洁准确', rmScore: 0.78, trueQuality: '高', output: '量子纠缠是两个量子粒子间的非经典关联。当两个粒子处于纠缠态时，对其中一个的测量会瞬间确定另一个的状态，与距离无关。', hackType: 'KL 约束防止偏离 → 保持预训练质量' },
];

export default function RewardHackingDemo({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Reward Hacking 对比展示',
      withKL: '✓ 有 KL 约束（正常）',
      withoutKL: '✗ 无 KL 约束（Reward Hacking）',
      rmScore: 'RM Score:',
      trueQuality: '真实质量:',
      warning: '⚠️ RM 分高但质量不高 = Reward Hacking',
      normalBehavior: '正常行为',
      hackType: 'Hack 类型',
      outputPreview: '模型输出预览：',
      whyKLWorks: '为什么 KL 约束有效？',
      goodhartLaw: 'Goodhart\'s Law 在 RL 中的体现',
      klExplain1: 'KL(π_θ ∥ π_ref) 限制了策略偏离预训练模型的程度。预训练模型虽然不完美，',
      klExplain2: '但至少输出流畅、有信息量。KL 约束确保对齐后的模型不会丧失这些基本能力。',
      goodhartExplain1: '"当一个度量成为目标时，它就不再是一个好的度量" — RM score 是 reward 的近似，',
      goodhartExplain2: '但不完美。模型会找到最大化 score 但不真正提高质量的"捷径"。',
    },
    en: {
      title: 'Reward Hacking Comparison Demo',
      withKL: '✓ With KL Constraint (Normal)',
      withoutKL: '✗ Without KL Constraint (Reward Hacking)',
      rmScore: 'RM Score:',
      trueQuality: 'True Quality:',
      warning: '⚠️ High RM score but low quality = Reward Hacking',
      normalBehavior: 'Normal Behavior',
      hackType: 'Hack Type',
      outputPreview: 'Model Output Preview:',
      whyKLWorks: 'Why KL Constraint Works?',
      goodhartLaw: 'Goodhart\'s Law in RL',
      klExplain1: 'KL(π_θ ∥ π_ref) limits the extent to which the policy deviates from the pretrained model. Although the pretrained model is imperfect,',
      klExplain2: 'it at least produces fluent, informative outputs. KL constraint ensures the aligned model doesn\'t lose these basic capabilities.',
      goodhartExplain1: '"When a measure becomes a target, it ceases to be a good measure" — RM score is an approximation of reward,',
      goodhartExplain2: 'but imperfect. The model will find "shortcuts" that maximize score without truly improving quality.',
    },
  }[locale];

  const [showKL, setShowKL] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const examples = showKL ? WITH_KL : WITHOUT_KL;
  const ex = examples[Math.min(activeIdx, examples.length - 1)];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Toggle */}
        <g onClick={() => { setShowKL(!showKL); setActiveIdx(0); }} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 90} y={36} width={180} height={26} rx={13}
            fill={showKL ? COLORS.green : COLORS.red} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showKL ? t.withKL : t.withoutKL}
          </text>
        </g>

        {/* Example tabs */}
        {examples.map((e, i) => (
          <g key={i} onClick={() => setActiveIdx(i)} style={{ cursor: 'pointer' }}>
            <rect x={30 + i * 140} y={72} width={130} height={26} rx={5}
              fill={activeIdx === i ? COLORS.primary : COLORS.bgAlt}
              stroke={COLORS.mid} strokeWidth={1} />
            <text x={95 + i * 140} y={89} textAnchor="middle" fontSize={10}
              fontWeight={activeIdx === i ? 600 : 400} fill={activeIdx === i ? '#fff' : COLORS.dark}>
              {e.label}
            </text>
          </g>
        ))}

        {/* Score panel */}
        <rect x={30} y={108} width={250} height={70} rx={8} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={45} y={128} fontSize={11} fontWeight={600} fill={COLORS.dark}>{t.rmScore}</text>
        <text x={130} y={128} fontSize={16} fontWeight={700}
          fill={ex.rmScore > 0.85 ? COLORS.green : COLORS.orange} fontFamily={FONTS.mono}>
          {ex.rmScore.toFixed(2)}
        </text>
        <text x={45} y={150} fontSize={11} fontWeight={600} fill={COLORS.dark}>{t.trueQuality}</text>
        <text x={130} y={150} fontSize={14} fontWeight={700}
          fill={ex.trueQuality === '高' ? COLORS.green : ex.trueQuality === '中' ? COLORS.orange : COLORS.red}>
          {ex.trueQuality}
        </text>
        <text x={45} y={168} fontSize={9} fill={COLORS.mid}>
          {!showKL && ex.rmScore > 0.85 && ex.trueQuality !== '高' ? t.warning : ''}
        </text>

        {/* Hack type */}
        <rect x={300} y={108} width={250} height={70} rx={8}
          fill={showKL ? '#d4edda' : COLORS.waste}
          stroke={showKL ? COLORS.green : COLORS.red} strokeWidth={1} />
        <text x={310} y={128} fontSize={10} fontWeight={600} fill={showKL ? COLORS.green : COLORS.red}>
          {showKL ? t.normalBehavior : t.hackType}
        </text>
        <text x={310} y={148} fontSize={10} fill={COLORS.dark}>
          {ex.hackType.substring(0, 35)}
        </text>
        <text x={310} y={164} fontSize={10} fill={COLORS.mid}>
          {ex.hackType.substring(35)}
        </text>

        {/* Output preview */}
        <rect x={30} y={190} width={520} height={100} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={40} y={208} fontSize={10} fontWeight={600} fill={COLORS.dark}>{t.outputPreview}</text>
        {ex.output.split('\n').slice(0, 4).map((line, i) => (
          <text key={i} x={40} y={226 + i * 16} fontSize={10} fill={COLORS.mid}>
            {line.substring(0, 65)}{line.length > 65 ? '...' : ''}
          </text>
        ))}

        {/* Explanation */}
        <rect x={30} y={300} width={520} height={80} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={40} y={320} fontSize={11} fontWeight={600} fill={COLORS.orange}>
          {showKL ? t.whyKLWorks : t.goodhartLaw}
        </text>
        <text x={40} y={340} fontSize={10} fill={COLORS.dark}>
          {showKL ? t.klExplain1 : t.goodhartExplain1}
        </text>
        <text x={40} y={358} fontSize={10} fill={COLORS.mid}>
          {showKL ? t.klExplain2 : t.goodhartExplain2}
        </text>
      </svg>
    </div>
  );
}
