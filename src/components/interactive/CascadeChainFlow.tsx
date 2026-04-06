import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface CascadeStep {
  model: string;
  cost: string;
  quality: string;
  color: string;
}

const CHAIN: CascadeStep[] = [
  { model: 'Llama-8B', cost: '$0.0002/1K', quality: '60%', color: COLORS.green },
  { model: 'Llama-70B', cost: '$0.005/1K', quality: '82%', color: COLORS.orange },
  { model: 'GPT-4o', cost: '$0.03/1K', quality: '95%', color: COLORS.red },
];

const QUERIES = [
  { text: '"1+1等于几"', stopAt: 0, score: 0.95, reason: '简单数学，Llama-8B 置信度高' },
  { text: '"解释 transformer attention"', stopAt: 1, score: 0.82, reason: '中等难度，Llama-70B 能力足够' },
  { text: '"证明 P≠NP 的可能路径"', stopAt: 2, score: 0.45, reason: '极难问题，需要最强模型' },
];

export default function CascadeChainFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [queryIdx, setQueryIdx] = useState(0);

  const W = 580, H = 380;
  const q = QUERIES[queryIdx];

  const t = {
    zh: {
      title: 'FrugalGPT 级联链',
      subtitle: '先试便宜模型，质量不够再升级',
      quality: '质量',
      scoring: 'Scoring Function 判断',
      accept: '接受当前回答',
      upgrade: '升级到下一级模型',
      result: '结果：',
      stopModel: '停止模型',
      actualCost: '实际成本',
      reason: '置信度不足，升级',
      insufficient: '置信度不足，升级',
      stopHere: '在此停止',
      vsGpt4: 'vs 始终用 GPT-4: 成本节省',
    },
    en: {
      title: 'FrugalGPT Cascade Chain',
      subtitle: 'Try cheap models first, upgrade if quality insufficient',
      quality: 'Quality',
      scoring: 'Scoring Function Decision',
      accept: 'Accept current answer',
      upgrade: 'Upgrade to next model',
      result: 'Result:',
      stopModel: 'Stop at',
      actualCost: 'Actual cost',
      reason: 'Insufficient confidence, upgrade',
      insufficient: 'Insufficient confidence, upgrade',
      stopHere: 'Stop here',
      vsGpt4: 'vs Always GPT-4: Cost savings',
    },
  }[locale];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Query selector */}
        <g transform="translate(30, 55)">
          {QUERIES.map((qu, i) => (
            <g key={i} transform={`translate(${i * 180}, 0)`}
               onClick={() => setQueryIdx(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="170" height="26" rx="4"
                    fill={queryIdx === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="85" y="17" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="10" fill={queryIdx === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {qu.text}
              </text>
            </g>
          ))}
        </g>

        {/* Cascade chain */}
        {CHAIN.map((step, i) => {
          const x = 50 + i * 180;
          const y = 110;
          const isActive = i <= q.stopAt;
          const isStop = i === q.stopAt;

          return (
            <g key={i}>
              {/* Model box */}
              <rect x={x} y={y} width="140" height="70" rx="6"
                    fill={isActive ? step.color : COLORS.light}
                    opacity={isActive ? 0.15 : 0.3}
                    stroke={isActive ? step.color : COLORS.mid}
                    strokeWidth={isStop ? 3 : 1.5} />
              <text x={x + 70} y={y + 22} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="13" fontWeight="700"
                    fill={isActive ? step.color : COLORS.mid}>
                {step.model}
              </text>
              <text x={x + 70} y={y + 40} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10"
                    fill={isActive ? COLORS.dark : COLORS.mid}>
                {step.cost} · {t.quality} {step.quality}
              </text>
              {isStop && (
                <text x={x + 70} y={y + 58} textAnchor="middle"
                      fontFamily={FONTS.sans} fontSize="10" fontWeight="700" fill={step.color}>
                  ✓ {t.stopHere}
                </text>
              )}
              {!isStop && isActive && (
                <text x={x + 70} y={y + 58} textAnchor="middle"
                      fontFamily={FONTS.sans} fontSize="10" fill={COLORS.red}>
                  ✗ {t.insufficient}
                </text>
              )}

              {/* Arrow */}
              {i < CHAIN.length - 1 && (
                <text x={x + 150} y={y + 35} fontFamily={FONTS.sans} fontSize="20"
                      fill={i < q.stopAt ? COLORS.red : COLORS.light}>
                  →
                </text>
              )}
            </g>
          );
        })}

        {/* Scoring function explanation */}
        <g transform="translate(30, 200)">
          <rect x="0" y="0" width="520" height="55" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.scoring}
          </text>
          <text x="15" y="40" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {`Score = ${q.score.toFixed(2)} ${q.score > 0.7 ? `> 0.7 → ${t.accept}` : `< 0.7 → ${t.upgrade}`}`}
          </text>
        </g>

        {/* Result summary */}
        <g transform="translate(30, 270)">
          <rect x="0" y="0" width="520" height="90" rx="6"
                fill={COLORS.valid} stroke={COLORS.green} strokeWidth="2" />
          <text x="20" y="25" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.dark}>
            {t.result}{q.text}
          </text>
          <text x="20" y="48" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {t.stopModel}: {CHAIN[q.stopAt].model} · {t.actualCost}: {CHAIN[q.stopAt].cost}
          </text>
          <text x="20" y="68" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
            {q.reason}
          </text>
          <text x="20" y="84" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.green}>
            {t.vsGpt4} {q.stopAt === 0 ? '99.3%' : q.stopAt === 1 ? '83%' : '0%'}
          </text>
        </g>
      </svg>
    </div>
  );
}
