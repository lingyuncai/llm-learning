import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'classify' | 'generate';

export default function CausalLMRouter({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [mode, setMode] = useState<Mode>('classify');

  const W = 580, H = 340;

  const t = {
    zh: {
      title: 'Causal LM Router: 分类 vs 生成',
      classify: '✓ 做路由分类',
      generate: '✗ 直接生成',
      classifyTitle: '分类模式 — Small Models as Routers (2026)',
      generateTitle: '生成模式 — 直接用小模型回答',
      classifyBenefit1: '用 1-4B 参数小模型做路由判断，78.3% 准确率',
      classifyBenefit2: '推理成本极低（zero-marginal-cost：已部署的模型顺便做分类）',
      classifyBenefit3: '语义理解能力远强于 BERT，可理解复杂 query 结构',
      classifyBenefit4: '可本地部署，无需额外 API 调用',
      classifyAdvantage: '关键优势：把 "路由判断" 转化为 "文本分类"，复用 LM 的语言理解能力',
      generateProblem1: '小模型（3B）直接回答复杂问题，质量可能不够',
      generateProblem2: '无法知道自己"不够好"——缺乏自我评估能力',
      generateProblem3: '生成成本高于分类（需要完整回答 vs 一个 token 判断）',
      generateProblem4: '如果错了，用户得到低质量回答，还浪费了时间',
      coreIssue: '核心问题：小模型擅长"判断难度"而非"解决难题"',
    },
    en: {
      title: 'Causal LM Router: Classification vs Generation',
      classify: '✓ Route Classification',
      generate: '✗ Direct Generation',
      classifyTitle: 'Classification Mode — Small Models as Routers (2026)',
      generateTitle: 'Generation Mode — Small Model Direct Answer',
      classifyBenefit1: '1-4B param small models for routing, 78.3% accuracy',
      classifyBenefit2: 'Extremely low inference cost (zero-marginal-cost: deployed models classify on the side)',
      classifyBenefit3: 'Semantic understanding far stronger than BERT, can understand complex query structures',
      classifyBenefit4: 'Can be deployed locally, no extra API calls needed',
      classifyAdvantage: 'Key advantage: Convert "routing decision" to "text classification", reuse LM language understanding',
      generateProblem1: 'Small models (3B) directly answer complex questions, quality may be insufficient',
      generateProblem2: 'Cannot know if it\'s "not good enough" — lacks self-evaluation capability',
      generateProblem3: 'Generation cost higher than classification (full answer vs single token judgment)',
      generateProblem4: 'If wrong, users get low-quality answers and waste time',
      coreIssue: 'Core issue: Small models are good at "judging difficulty" not "solving hard problems"',
    },
  }[locale];

  const classifySteps = [
    { label: 'Query', text: '"解释量子纠缠"', x: 20 },
    { label: 'Prompt 模板', text: '"判断此 query 需要强模型还是弱模型: "', x: 135 },
    { label: 'Qwen-2.5-3B', text: '小 LM 做分类', x: 270 },
    { label: '输出: "strong"', text: 'P(strong)=0.87', x: 400 },
  ];

  const generateSteps = [
    { label: 'Query', text: '"解释量子纠缠"', x: 20 },
    { label: '直接输入', text: '"解释量子纠缠"', x: 135 },
    { label: 'Qwen-2.5-3B', text: '小 LM 做生成', x: 270 },
    { label: '输出: 回答', text: '可能质量不足...', x: 400 },
  ];

  const steps = mode === 'classify' ? classifySteps : generateSteps;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        <g transform="translate(180, 40)">
          {(['classify', 'generate'] as Mode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 120} y="0" width="110" height="28" rx="4"
                    fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
              <text x={i * 120 + 55} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="12"
                    fontWeight={mode === m ? "700" : "400"}
                    fill={mode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {m === 'classify' ? t.classify : t.generate}
              </text>
            </g>
          ))}
        </g>

        {steps.map((s, i) => (
          <g key={i} transform={`translate(${s.x}, 90)`}>
            <rect x="0" y="0" width="105" height="60" rx="6"
                  fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="52.5" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {s.label}
            </text>
            <text x="52.5" y="42" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="9" fill={COLORS.mid}>
              {s.text.split('\n')[0]}
            </text>
            {s.text.split('\n')[1] && (
              <text x="52.5" y="54" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={COLORS.mid}>
                {s.text.split('\n')[1]}
              </text>
            )}
            {i < steps.length - 1 && (
              <text x="110" y="30" fontFamily={FONTS.sans} fontSize="18" fill={COLORS.primary}>→</text>
            )}
          </g>
        ))}

        <g transform="translate(30, 170)">
          <rect x="0" y="0" width="520" height="150" rx="6"
                fill={mode === 'classify' ? COLORS.valid : COLORS.waste}
                stroke={mode === 'classify' ? COLORS.green : COLORS.red}
                strokeWidth="2" />
          {mode === 'classify' ? (
            <>
              <text x="20" y="25" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.green}>
                ✓ {t.classifyTitle}
              </text>
              <text x="20" y="48" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • {t.classifyBenefit1}
              </text>
              <text x="20" y="66" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • {t.classifyBenefit2}
              </text>
              <text x="20" y="84" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • {t.classifyBenefit3}
              </text>
              <text x="20" y="102" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • {t.classifyBenefit4}
              </text>
              <text x="20" y="125" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                {t.classifyAdvantage}
              </text>
            </>
          ) : (
            <>
              <text x="20" y="25" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.red}>
                ✗ {t.generateTitle}
              </text>
              <text x="20" y="48" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • {t.generateProblem1}
              </text>
              <text x="20" y="66" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • {t.generateProblem2}
              </text>
              <text x="20" y="84" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • {t.generateProblem3}
              </text>
              <text x="20" y="102" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • {t.generateProblem4}
              </text>
              <text x="20" y="125" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                {t.coreIssue}
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
