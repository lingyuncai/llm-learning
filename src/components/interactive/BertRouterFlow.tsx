import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const STEPS = [
  { label: 'Query 输入', detail: '用户的原始问题' },
  { label: 'Tokenize', detail: 'BERT WordPiece 分词' },
  { label: 'BERT Encoder', detail: '提取 [CLS] 语义向量' },
  { label: 'Linear + Sigmoid', detail: '二分类: P(需要强模型)' },
  { label: '阈值判断', detail: 'P > τ ? 强模型 : 弱模型' },
];

const EXAMPLES = [
  { query: '"帮我翻译 hello world"', prob: 0.12, result: 'weak', reason: '简单翻译任务' },
  { query: '"比较康德和黑格尔的哲学"', prob: 0.91, result: 'strong', reason: '需要深度推理' },
  { query: '"1+1等于几"', prob: 0.05, result: 'weak', reason: '极简数学问题' },
  { query: '"分析这段代码的安全漏洞"', prob: 0.85, result: 'strong', reason: '复杂代码分析' },
];

export default function BertRouterFlow() {
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
          BERT Router 流程
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
            示例 Query:
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
            P(需要强模型) = {ex.prob.toFixed(2)}
          </text>
          <rect x="0" y="10" width="520" height="24" rx="4" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="1" />
          <rect x="0" y="10" width={ex.prob * 520} height="24" rx="4"
                fill={ex.prob > threshold ? COLORS.red : COLORS.green} />
          <line x1={threshold * 520} y1="8" x2={threshold * 520} y2="36"
                stroke={COLORS.dark} strokeWidth="2" strokeDasharray="4,2" />
          <text x={threshold * 520} y="50" textAnchor="middle"
                fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
            τ = {threshold.toFixed(2)}
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
            → {decision === 'strong' ? '强模型 (GPT-4)' : '弱模型 (Llama-8B)'}
          </text>
          <text x="125" y="40" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="10" fill={COLORS.mid}>
            {ex.reason}
          </text>

          <rect x="280" y="0" width="240" height="50" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="400" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="11" fill={COLORS.dark}>
            {decision === 'strong' ? '成本: $0.03/1K tokens' : '成本: $0.0002/1K tokens'}
          </text>
          <text x="400" y="38" textAnchor="middle" fontFamily={FONTS.mono}
                fontSize="10" fill={COLORS.mid}>
            {decision === 'weak' ? '节省 99.3%' : '使用最高质量'}
          </text>
        </g>

        {/* Note about threshold */}
        <g transform="translate(30, 305)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            阈值 τ 可调：降低 τ → 更多 query 用强模型（质量↑ 成本↑）· 提高 τ → 更多用弱模型（质量↓ 成本↓）
          </text>
        </g>
      </svg>

      {/* Threshold slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">阈值 τ:</span>
        <input type="range" min="0" max="100" value={threshold * 100}
               onChange={e => setThreshold(Number(e.target.value) / 100)}
               className="w-48 accent-blue-700" />
        <span className="text-sm font-mono text-gray-600">{threshold.toFixed(2)}</span>
      </div>
    </div>
  );
}
