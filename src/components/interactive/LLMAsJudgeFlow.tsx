import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Method = 'self' | 'judge' | 'human';

export default function LLMAsJudgeFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '三种回答质量评估方式',
      methods: {
        self: { label: '自验证', cost: '极低 (~$0)', latency: '~50ms', accuracy: '中等', detail: '模型评估自己的回答。便宜快速，但可能"盲目自信"。AutoMix 用 few-shot 校准缓解此问题。' },
        judge: { label: 'LLM-as-Judge', cost: '中等 ($0.01-0.03)', latency: '~500ms', accuracy: '高', detail: '用另一个 LLM 评估。更客观，但引入额外成本和延迟。Confidence-Driven Router (2025) 结合不确定性估计。' },
        human: { label: '人工评估', cost: '极高 ($0.5-2)', latency: '分钟级', accuracy: '最高', detail: '人类专家评估。金标准，但无法用于实时路由。通常用于离线校准 router。' },
      },
      query: 'Query',
      modelGen: 'Model 生成',
      answer: 'Answer',
      score: 'Score',
      selfEval: '自我评估',
      judgeLLM: 'Judge LLM',
      humanExpert: '人类专家',
      costLabel: '成本',
      latencyLabel: '延迟',
      accuracyLabel: '准确度',
    },
    en: {
      title: 'Three Answer Quality Evaluation Methods',
      methods: {
        self: { label: 'Self-Verify', cost: 'Very Low (~$0)', latency: '~50ms', accuracy: 'Medium', detail: 'Model evaluates its own answer. Fast and cheap, but prone to overconfidence. AutoMix uses few-shot calibration to mitigate this.' },
        judge: { label: 'LLM-as-Judge', cost: 'Medium ($0.01-0.03)', latency: '~500ms', accuracy: 'High', detail: 'Another LLM evaluates the answer. More objective, but adds cost and latency. Confidence-Driven Router (2025) combines uncertainty estimation.' },
        human: { label: 'Human Eval', cost: 'Very High ($0.5-2)', latency: 'Minutes', accuracy: 'Highest', detail: 'Human expert evaluation. Gold standard, but unsuitable for real-time routing. Typically used for offline router calibration.' },
      },
      query: 'Query',
      modelGen: 'Model Gen',
      answer: 'Answer',
      score: 'Score',
      selfEval: 'Self-Eval',
      judgeLLM: 'Judge LLM',
      humanExpert: 'Human Expert',
      costLabel: 'Cost',
      latencyLabel: 'Latency',
      accuracyLabel: 'Accuracy',
    },
  }[locale];

  const METHODS: { id: Method; label: string; cost: string; latency: string; accuracy: string; detail: string }[] = [
    { id: 'self', ...t.methods.self },
    { id: 'judge', ...t.methods.judge },
    { id: 'human', ...t.methods.human },
  ];

  const [active, setActive] = useState<Method>('self');

  const W = 580, H = 320;
  const m = METHODS.find(m => m.id === active)!;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Method tabs */}
        <g transform="translate(115, 42)">
          {METHODS.map((me, i) => (
            <g key={me.id}>
              <rect x={i * 125} y="0" width="115" height="28" rx="4"
                    fill={active === me.id ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setActive(me.id)} />
              <text x={i * 125 + 57.5} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={active === me.id ? "700" : "400"}
                    fill={active === me.id ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {me.label}
              </text>
            </g>
          ))}
        </g>

        {/* Flow diagram */}
        <g transform="translate(30, 85)">
          {/* Query → Model → Answer */}
          <rect x="0" y="0" width="90" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="45" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>{t.query}</text>

          <text x="95" y="25" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

          <rect x="110" y="0" width="100" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
          <text x="160" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>{t.modelGen}</text>

          <text x="215" y="25" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

          <rect x="230" y="0" width="90" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="275" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>{t.answer}</text>

          <text x="325" y="25" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

          {/* Evaluator */}
          <rect x="340" y="0" width="110" height="40" rx="4"
                fill={active === 'self' ? COLORS.valid : active === 'judge' ? '#fef3c7' : '#fee2e2'}
                stroke={active === 'self' ? COLORS.green : active === 'judge' ? COLORS.orange : COLORS.red}
                strokeWidth="2" />
          <text x="395" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11"
                fontWeight="600" fill={COLORS.dark}>
            {active === 'self' ? t.selfEval : active === 'judge' ? t.judgeLLM : t.humanExpert}
          </text>

          <text x="455" y="25" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

          <rect x="470" y="0" width="50" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="495" y="25" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>{t.score}</text>
        </g>

        {/* Metrics */}
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="520" height="60" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="90" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.costLabel}: {m.cost}
          </text>
          <text x="260" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.latencyLabel}: {m.latency}
          </text>
          <text x="430" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.accuracyLabel}: {m.accuracy}
          </text>

          {/* Bar comparison */}
          {(() => {
            const costs = { self: 2, judge: 40, human: 100 };
            const lats = { self: 10, judge: 50, human: 100 };
            const accs = { self: 60, judge: 85, human: 100 };
            return (
              <>
                <rect x="40" y="32" width={costs[active] * 1.2} height="8" rx="2" fill={COLORS.red} />
                <rect x="210" y="32" width={lats[active] * 1.2} height="8" rx="2" fill={COLORS.orange} />
                <rect x="380" y="32" width={accs[active] * 1.2} height="8" rx="2" fill={COLORS.green} />
              </>
            );
          })()}
        </g>

        {/* Detail */}
        <g transform="translate(30, 225)">
          <rect x="0" y="0" width="520" height="72" rx="6"
                fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.primary}>
            {m.label}
          </text>
          <text x="15" y="42" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {m.detail.length > 75 ? m.detail.slice(0, 75) : m.detail}
          </text>
          {m.detail.length > 75 && (
            <text x="15" y="60" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {m.detail.slice(75)}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
