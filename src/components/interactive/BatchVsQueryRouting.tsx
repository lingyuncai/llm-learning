import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'query' | 'batch';

const QUERIES = [
  { text: 'Q1: 翻译', diff: 'easy', model_q: 'Llama-8B', model_b: 'Llama-8B' },
  { text: 'Q2: 代码', diff: 'hard', model_q: 'GPT-4', model_b: 'Llama-70B' },
  { text: 'Q3: 问答', diff: 'easy', model_q: 'Llama-8B', model_b: 'Llama-8B' },
  { text: 'Q4: 分析', diff: 'hard', model_q: 'GPT-4', model_b: 'GPT-4' },
  { text: 'Q5: 翻译', diff: 'easy', model_q: 'Llama-8B', model_b: 'Llama-8B' },
  { text: 'Q6: 推理', diff: 'hard', model_q: 'GPT-4', model_b: 'Llama-70B' },
];

export default function BatchVsQueryRouting() {
  const [mode, setMode] = useState<Mode>('query');

  const W = 580, H = 340;

  const modelColors: Record<string, string> = {
    'Llama-8B': COLORS.green, 'Llama-70B': COLORS.orange, 'GPT-4': COLORS.red,
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Query-level vs Batch-level 路由
        </text>

        {/* Mode toggle */}
        <g transform="translate(170, 38)">
          {(['query', 'batch'] as Mode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 130} y="0" width="120" height="28" rx="4"
                    fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
              <text x={i * 130 + 60} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={mode === m ? "700" : "400"}
                    fill={mode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {m === 'query' ? 'Query-level' : 'Batch-level'}
              </text>
            </g>
          ))}
        </g>

        {/* Query assignments */}
        <g transform="translate(30, 80)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {mode === 'query' ? '逐条路由决策:' : '批量全局优化 (GPU 约束: 同时最多 2 个 GPT-4):'}
          </text>

          {QUERIES.map((q, i) => {
            const model = mode === 'query' ? q.model_q : q.model_b;
            const color = modelColors[model];
            return (
              <g key={i} transform={`translate(${(i % 3) * 180}, ${15 + Math.floor(i / 3) * 50})`}>
                <rect x="0" y="0" width="170" height="40" rx="4"
                      fill={color} opacity="0.1" stroke={color} strokeWidth="1.5" />
                <text x="10" y="16" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
                  {q.text} ({q.diff})
                </text>
                <text x="10" y="32" fontFamily={FONTS.mono} fontSize="10" fontWeight="600" fill={color}>
                  → {model}
                </text>
              </g>
            );
          })}
        </g>

        {/* Comparison metrics */}
        <g transform="translate(30, 210)">
          {(() => {
            const qGPT4 = QUERIES.filter(q => q.model_q === 'GPT-4').length;
            const bGPT4 = QUERIES.filter(q => q.model_b === 'GPT-4').length;
            const qCost = qGPT4 * 30 + (6 - qGPT4) * 1;
            const bCost = bGPT4 * 30 + QUERIES.filter(q => q.model_b === 'Llama-70B').length * 5 +
                          QUERIES.filter(q => q.model_b === 'Llama-8B').length * 1;
            return (
              <g>
                <rect x="0" y="0" width="520" height="108" rx="6"
                      fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
                <text x="20" y="22" fontFamily={FONTS.sans} fontSize="12" fontWeight="700" fill={COLORS.dark}>
                  {mode === 'query' ? 'Query-level 结果' : 'Batch-level 结果'}
                </text>
                <text x="20" y="44" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                  GPT-4 使用次数: {mode === 'query' ? qGPT4 : bGPT4}
                  · 总成本: ${mode === 'query' ? qCost : bCost}
                </text>
                <text x="20" y="64" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                  {mode === 'query'
                    ? '逐条决策: 每个 query 独立判断，不考虑全局约束'
                    : '批量优化: 在 GPU 并发限制下全局最优分配，部分 hard query 降级到 Llama-70B'}
                </text>
                <text x="20" y="84" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
                  {mode === 'batch'
                    ? 'Robust Batch-Level Routing (2026): 在对抗条件下比逐条路由优 24%'
                    : '简单但无法处理 GPU 并发限制、全局成本约束等场景'}
                </text>
                <text x="20" y="100" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
                  {mode === 'query' ? `成本: $${qCost} · 质量: 最优(per-query)` :
                   `成本: $${bCost} (节省 ${Math.round((1 - bCost / qCost) * 100)}%) · 质量: 次优但满足约束`}
                </text>
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
}
