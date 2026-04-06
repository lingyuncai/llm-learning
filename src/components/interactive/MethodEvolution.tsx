import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface MethodNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  solved: string;
  introduced: string;
}

const EDGES: [string, string][] = [
  ['rlhf', 'dpo'], ['dpo', 'ipo'], ['dpo', 'kto'], ['dpo', 'grpo'], ['rlhf', 'grpo'],
];

export default function MethodEvolution({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '方法演进图谱',
      subtitle: '点击节点查看"解决了什么 / 引入了什么问题"',
      solvedLabel: '✓ 解决了什么：',
      introducedLabel: '✗ 引入了什么问题：',
      clickPrompt: '← 点击节点查看详情 →',
      explanation: '每种方法都在解决前一种的问题，同时引入新的挑战',
      footer: '没有完美方案 — 选择取决于训练资源、数据质量和性能需求',
      methods: {
        rlhf: { solved: '首次实现 LLM 对齐（InstructGPT）', introduced: '需要 RM + PPO + Critic，4 个模型，训练复杂' },
        dpo: { solved: '去掉 RM 和 PPO，训练简单如 SFT', introduced: 'Offline 数据分布偏移，容易过拟合' },
        ipo: { solved: '加正则解决 DPO 过拟合', introduced: '仍是 offline，性能提升有限' },
        kto: { solved: '不需要配对偏好，只需要好/坏标签', introduced: '信号更弱，对齐效果天花板较低' },
        grpo: { solved: '在线采样 + 去掉 Critic，降低训练资源', introduced: '需要生成多个回答（推理成本高）' },
      },
    },
    en: {
      title: 'Method Evolution Map',
      subtitle: 'Click nodes to see "What it solved / What problems it introduced"',
      solvedLabel: '✓ What it solved:',
      introducedLabel: '✗ Problems introduced:',
      clickPrompt: '← Click a node to see details →',
      explanation: 'Each method solves previous issues while introducing new challenges',
      footer: 'No perfect solution — choice depends on resources, data quality and performance needs',
      methods: {
        rlhf: { solved: 'First LLM alignment (InstructGPT)', introduced: 'Requires RM + PPO + Critic, 4 models, complex training' },
        dpo: { solved: 'Removes RM and PPO, training as simple as SFT', introduced: 'Offline data distribution shift, overfitting prone' },
        ipo: { solved: 'Adds regularization to solve DPO overfitting', introduced: 'Still offline, limited performance gains' },
        kto: { solved: 'No paired preferences, only good/bad labels', introduced: 'Weaker signal, lower alignment ceiling' },
        grpo: { solved: 'Online sampling + removes Critic, reduces resources', introduced: 'Requires multiple responses (high inference cost)' },
      },
    },
  }[locale];

  const METHODS: MethodNode[] = [
    { id: 'rlhf', label: 'RLHF', x: 100, y: 80, color: COLORS.primary, solved: t.methods.rlhf.solved, introduced: t.methods.rlhf.introduced },
    { id: 'dpo', label: 'DPO', x: 250, y: 80, color: COLORS.purple, solved: t.methods.dpo.solved, introduced: t.methods.dpo.introduced },
    { id: 'ipo', label: 'IPO', x: 100, y: 170, color: COLORS.green, solved: t.methods.ipo.solved, introduced: t.methods.ipo.introduced },
    { id: 'kto', label: 'KTO', x: 250, y: 170, color: COLORS.green, solved: t.methods.kto.solved, introduced: t.methods.kto.introduced },
    { id: 'grpo', label: 'GRPO', x: 400, y: 170, color: COLORS.red, solved: t.methods.grpo.solved, introduced: t.methods.grpo.introduced },
  ];
  const [active, setActive] = useState<string | null>(null);
  const nodeMap = Object.fromEntries(METHODS.map(m => [m.id, m]));
  const activeNode = active ? nodeMap[active] : null;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {EDGES.map(([from, to], i) => (
          <line key={i}
            x1={nodeMap[from].x} y1={nodeMap[from].y + 18}
            x2={nodeMap[to].x} y2={nodeMap[to].y - 18}
            stroke={COLORS.light} strokeWidth={1.5} />
        ))}

        {METHODS.map(m => {
          const isActive = active === m.id;
          return (
            <g key={m.id} onClick={() => setActive(isActive ? null : m.id)} style={{ cursor: 'pointer' }}>
              <rect x={m.x - 45} y={m.y - 16} width={90} height={32} rx={16}
                fill={isActive ? m.color : COLORS.bgAlt}
                stroke={m.color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={m.x} y={m.y + 4} textAnchor="middle" fontSize={12} fontWeight={700}
                fill={isActive ? '#fff' : m.color}>{m.label}</text>
            </g>
          );
        })}

        {activeNode ? (
          <g>
            <rect x={30} y={220} width={520} height={70} rx={8} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
            <text x={40} y={240} fontSize={10} fontWeight={700} fill={COLORS.green}>
              {t.solvedLabel}
            </text>
            <text x={40} y={258} fontSize={11} fill={COLORS.dark}>{activeNode.solved}</text>

            <rect x={30} y={300} width={520} height={70} rx={8} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
            <text x={40} y={320} fontSize={10} fontWeight={700} fill={COLORS.red}>
              {t.introducedLabel}
            </text>
            <text x={40} y={338} fontSize={11} fill={COLORS.dark}>{activeNode.introduced}</text>
          </g>
        ) : (
          <g>
            <rect x={30} y={230} width={520} height={130} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={W / 2} y={290} textAnchor="middle" fontSize={12} fill={COLORS.mid}>
              {t.clickPrompt}
            </text>
            <text x={W / 2} y={310} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
              {t.explanation}
            </text>
          </g>
        )}

        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          {t.footer}
        </text>
      </svg>
    </div>
  );
}
