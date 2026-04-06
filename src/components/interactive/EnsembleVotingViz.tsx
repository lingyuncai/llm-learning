import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type VoteMode = 'majority' | 'weighted' | 'best-of-n';

const MODELS = [
  { name: 'GPT-4o', answer: 'A', weight: 0.4, quality: 95, color: '#6a1b9a' },
  { name: 'Claude', answer: 'A', weight: 0.35, quality: 90, color: '#1565c0' },
  { name: 'Gemini', answer: 'B', weight: 0.25, quality: 85, color: '#2e7d32' },
];

export default function EnsembleVotingViz() {
  const [mode, setMode] = useState<VoteMode>('majority');

  const W = 580, H = 320;
  const labels = { majority: '多数投票', weighted: '加权投票', 'best-of-n': 'Best-of-N' };

  const getResult = () => {
    if (mode === 'majority') return { answer: 'A', detail: '2票 A vs 1票 B → A 获胜', score: '2/3' };
    if (mode === 'weighted') {
      const aWeight = 0.4 + 0.35;
      return { answer: 'A', detail: `A权重 ${aWeight.toFixed(2)} vs B权重 0.25 → A 获胜`, score: `${aWeight.toFixed(2)}` };
    }
    return { answer: 'A', detail: 'GPT-4o 质量最高 (95%) → 选择其回答', score: '95%' };
  };

  const result = getResult();

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Ensemble 投票方式
        </text>

        {/* Mode tabs */}
        <g transform="translate(115, 38)">
          {(['majority', 'weighted', 'best-of-n'] as VoteMode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 125} y="0" width="115" height="26" rx="4"
                    fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
              <text x={i * 125 + 57.5} y="17" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10"
                    fontWeight={mode === m ? "700" : "400"}
                    fill={mode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {labels[m]}
              </text>
            </g>
          ))}
        </g>

        {/* Model votes */}
        {MODELS.map((m, i) => (
          <g key={m.name} transform={`translate(30, ${80 + i * 50})`}>
            <rect x="0" y="0" width="120" height="38" rx="4"
                  fill={m.color} opacity="0.12" stroke={m.color} strokeWidth="1.5" />
            <text x="60" y="16" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="600" fill={m.color}>{m.name}</text>
            <text x="60" y="32" textAnchor="middle" fontFamily={FONTS.mono}
                  fontSize="9" fill={COLORS.mid}>
              {mode === 'weighted' ? `权重: ${m.weight}` : mode === 'best-of-n' ? `质量: ${m.quality}%` : ''}
            </text>

            <text x="130" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

            {/* Answer */}
            <rect x="150" y="5" width="60" height="28" rx="4"
                  fill={m.answer === result.answer ? COLORS.valid : COLORS.waste}
                  stroke={m.answer === result.answer ? COLORS.green : COLORS.red} strokeWidth="1.5" />
            <text x="180" y="24" textAnchor="middle" fontFamily={FONTS.mono}
                  fontSize="14" fontWeight="700" fill={COLORS.dark}>
              {m.answer}
            </text>

            {/* Weight/score visualization */}
            {mode === 'weighted' && (
              <rect x="225" y="10" width={m.weight * 300} height="18" rx="3"
                    fill={m.color} opacity="0.4" />
            )}
            {mode === 'best-of-n' && (
              <rect x="225" y="10" width={m.quality * 2.5} height="18" rx="3"
                    fill={m.color} opacity="0.4" />
            )}
          </g>
        ))}

        {/* Result */}
        <g transform="translate(30, 235)">
          <rect x="0" y="0" width="520" height="60" rx="6"
                fill={COLORS.valid} stroke={COLORS.green} strokeWidth="2" />
          <text x="20" y="22" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.green}>
            结果: {result.answer}
          </text>
          <text x="20" y="42" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {labels[mode]}: {result.detail}
          </text>
        </g>
      </svg>
    </div>
  );
}
