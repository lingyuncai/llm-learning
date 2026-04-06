import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';


export default function BertRouterFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'BERT Router 流程',
      query: 'Query 输入',
      queryDetail: '用户的原始问题',
      tokenize: 'Tokenize',
      tokenizeDetail: 'BERT WordPiece 分词',
      bertEncoder: 'BERT Encoder',
      bertEncoderDetail: '提取 [CLS] 语义向量',
      linearSigmoid: 'Linear + Sigmoid',
      linearSigmoidDetail: '二分类: P(需要强模型)',
      threshold: '阈值判断',
      thresholdDetail: 'P > τ ? 强模型 : 弱模型',
      example1Query: '"帮我翻译 hello world"',
      example1Reason: '简单翻译任务',
      example2Query: '"比较康德和黑格尔的哲学"',
      example2Reason: '需要深度推理',
      example3Query: '"1+1等于几"',
      example3Reason: '极简数学问题',
      example4Query: '"分析这段代码的安全漏洞"',
      example4Reason: '复杂代码分析',
      exampleQuery: '示例 Query:',
      probLabel: 'P(需要强模型) = ',
      thresholdLabel: 'τ = ',
      strongModel: '强模型 (GPT-4)',
      weakModel: '弱模型 (Llama-8B)',
      strongCost: '成本: $0.03/1K tokens',
      weakCost: '成本: $0.0002/1K tokens',
      strongNote: '使用最高质量',
      weakNote: '节省 99.3%',
      thresholdNote: '阈值 τ 可调：降低 τ → 更多 query 用强模型（质量↑ 成本↑）· 提高 τ → 更多用弱模型（质量↓ 成本↓）',
      thresholdSlider: '阈值 τ:',
    },
    en: {
      title: 'BERT Router Flow',
      query: 'Query Input',
      queryDetail: "User's original question",
      tokenize: 'Tokenize',
      tokenizeDetail: 'BERT WordPiece tokenization',
      bertEncoder: 'BERT Encoder',
      bertEncoderDetail: 'Extract [CLS] semantic vector',
      linearSigmoid: 'Linear + Sigmoid',
      linearSigmoidDetail: 'Binary classification: P(needs strong model)',
      threshold: 'Threshold Decision',
      thresholdDetail: 'P > τ ? strong : weak',
      example1Query: '"Translate hello world"',
      example1Reason: 'Simple translation',
      example2Query: '"Compare Kant and Hegel\'s philosophy"',
      example2Reason: 'Requires deep reasoning',
      example3Query: '"What is 1+1"',
      example3Reason: 'Trivial math',
      example4Query: '"Analyze security vulnerabilities in this code"',
      example4Reason: 'Complex code analysis',
      exampleQuery: 'Example Query:',
      probLabel: 'P(needs strong model) = ',
      thresholdLabel: 'τ = ',
      strongModel: 'Strong Model (GPT-4)',
      weakModel: 'Weak Model (Llama-8B)',
      strongCost: 'Cost: $0.03/1K tokens',
      weakCost: 'Cost: $0.0002/1K tokens',
      strongNote: 'Highest quality',
      weakNote: 'Save 99.3%',
      thresholdNote: 'Adjustable threshold τ: Lower τ → more queries use strong model (quality↑ cost↑) · Higher τ → more use weak model (quality↓ cost↓)',
      thresholdSlider: 'Threshold τ:',
    },
  }[locale];

  const STEPS = [
    { label: t.query, detail: t.queryDetail },
    { label: t.tokenize, detail: t.tokenizeDetail },
    { label: t.bertEncoder, detail: t.bertEncoderDetail },
    { label: t.linearSigmoid, detail: t.linearSigmoidDetail },
    { label: t.threshold, detail: t.thresholdDetail },
  ];

  const EXAMPLES = [
    { query: t.example1Query, prob: 0.12, result: 'weak', reason: t.example1Reason },
    { query: t.example2Query, prob: 0.91, result: 'strong', reason: t.example2Reason },
    { query: t.example3Query, prob: 0.05, result: 'weak', reason: t.example3Reason },
    { query: t.example4Query, prob: 0.85, result: 'strong', reason: t.example4Reason },
  ];

  const [exampleIdx, setExampleIdx] = useState(0);
  const [threshold, setThreshold] = useState(0.5);

  const W = 580, H = 360;
  const ex = EXAMPLES[exampleIdx];
  const decision = ex.prob > threshold ? 'strong' : 'weak';

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Flow steps */}
        {STEPS.map((s, i) => {
          const x = 30 + i * 108;
          return (
            <g key={i} transform={`translate(${x}, 50)`}>
              <rect x="0" y="0" width="95" height="55" rx="6"
                    fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
              <text x="47.5" y="22" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="11" fontWeight="600" fill={COLORS.dark}>
                {s.label}
              </text>
              <text x="47.5" y="40" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={COLORS.mid}>
                {s.detail}
              </text>
              {i < STEPS.length - 1 && (
                <text x="100" y="28" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>
              )}
            </g>
          );
        })}

        {/* Example selector */}
        <g transform="translate(30, 125)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.exampleQuery}
          </text>
          {EXAMPLES.map((e, i) => (
            <g key={i} transform={`translate(${i * 135}, 10)`}
               onClick={() => setExampleIdx(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="125" height="26" rx="4"
                    fill={exampleIdx === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="62.5" y="17" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="9"
                    fill={exampleIdx === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {e.query.length > 16 ? e.query.slice(0, 16) + '…' : e.query}
              </text>
            </g>
          ))}
        </g>

        {/* Probability bar */}
        <g transform="translate(30, 175)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.probLabel}{ex.prob.toFixed(2)}
          </text>
          <rect x="0" y="10" width="520" height="24" rx="4" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="1" />
          <rect x="0" y="10" width={ex.prob * 520} height="24" rx="4"
                fill={ex.prob > threshold ? COLORS.red : COLORS.green} />
          <line x1={threshold * 520} y1="8" x2={threshold * 520} y2="36"
                stroke={COLORS.dark} strokeWidth="2" strokeDasharray="4,2" />
          <text x={threshold * 520} y="50" textAnchor="middle"
                fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
            {t.thresholdLabel}{threshold.toFixed(2)}
          </text>
        </g>

        {/* Decision result */}
        <g transform="translate(30, 240)">
          <rect x="0" y="0" width="250" height="50" rx="6"
                fill={decision === 'strong' ? COLORS.waste : COLORS.valid}
                stroke={decision === 'strong' ? COLORS.red : COLORS.green} strokeWidth="2" />
          <text x="125" y="22" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="14" fontWeight="700"
                fill={decision === 'strong' ? COLORS.red : COLORS.green}>
            → {decision === 'strong' ? t.strongModel : t.weakModel}
          </text>
          <text x="125" y="40" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="10" fill={COLORS.mid}>
            {ex.reason}
          </text>

          <rect x="280" y="0" width="240" height="50" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="400" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="11" fill={COLORS.dark}>
            {decision === 'strong' ? t.strongCost : t.weakCost}
          </text>
          <text x="400" y="38" textAnchor="middle" fontFamily={FONTS.mono}
                fontSize="10" fill={COLORS.mid}>
            {decision === 'weak' ? t.weakNote : t.strongNote}
          </text>
        </g>

        {/* Note about threshold */}
        <g transform="translate(30, 305)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {t.thresholdNote}
          </text>
        </g>
      </svg>

      {/* Threshold slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">{t.thresholdSlider}</span>
        <input type="range" min="0" max="100" value={threshold * 100}
               onChange={e => setThreshold(Number(e.target.value) / 100)}
               className="w-48 accent-blue-700" />
        <span className="text-sm font-mono text-gray-600">{threshold.toFixed(2)}</span>
      </div>
    </div>
  );
}
