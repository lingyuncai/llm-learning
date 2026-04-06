import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const QUERIES = [
  { label: '翻译 hello', diff: 10, spec: 80, expected: 'weak' },
  { label: '写诗', diff: 30, spec: 40, expected: 'weak' },
  { label: '解释 GAN', diff: 60, spec: 70, expected: 'strong' },
  { label: '分析论文', diff: 80, spec: 50, expected: 'strong' },
  { label: '代码优化', diff: 70, spec: 90, expected: 'strong' },
  { label: '聊天问候', diff: 5, spec: 20, expected: 'weak' },
  { label: '数学证明', diff: 95, spec: 85, expected: 'strong' },
  { label: '总结新闻', diff: 40, spec: 60, expected: 'weak' },
];

const ROUTERS = [
  { name: 'MF Router', threshold: 50, accuracy: '95%', note: '偏好数据学评分', color: '#1565c0' },
  { name: 'BERT Router', threshold: 55, accuracy: '93%', note: '固定决策边界', color: '#2e7d32' },
  { name: 'Causal LM', threshold: 45, accuracy: '92%', note: '更保守（倾向强模型）', color: '#e65100' },
  { name: 'Semantic', threshold: 60, accuracy: '85%', note: '更激进（倾向弱模型）', color: '#6a1b9a' },
];

export default function DecisionBoundaryCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '四种 Router 决策边界对比',
      subtitle: '相同 query 集，不同 router 的强/弱模型判定差异',
      strong: '强',
      weak: '弱',
      accuracy: '准确率',
      threshold: '阈值',
      wrongDecision: '判断错误',
    },
    en: {
      title: 'Four Router Decision Boundary Comparison',
      subtitle: 'Same query set, different router strong/weak model decisions',
      strong: 'Strong',
      weak: 'Weak',
      accuracy: 'Accuracy',
      threshold: 'Threshold',
      wrongDecision: 'Wrong decision',
    },
  }[locale];

  const [hoveredRouter, setHoveredRouter] = useState<number | null>(null);

  const W = 580, H = 380;
  const cellW = 125, cellH = 260;
  const startX = 30, startY = 50;

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

        {ROUTERS.map((router, ri) => {
          const rx = startX + ri * (cellW + 10);
          return (
            <g key={router.name} transform={`translate(${rx}, ${startY})`}
               onMouseEnter={() => setHoveredRouter(ri)}
               onMouseLeave={() => setHoveredRouter(null)}>
              <rect x="0" y="0" width={cellW} height="30" rx="4"
                    fill={router.color} />
              <text x={cellW / 2} y="20" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill="#fff">
                {router.name}
              </text>

              {QUERIES.map((q, qi) => {
                const decision = q.diff > router.threshold ? 'strong' : 'weak';
                const correct = decision === q.expected;
                return (
                  <g key={qi} transform={`translate(0, ${35 + qi * 27})`}>
                    <rect x="0" y="0" width={cellW} height="23" rx="3"
                          fill={decision === 'strong' ? COLORS.waste : COLORS.valid}
                          stroke={correct ? 'transparent' : COLORS.red}
                          strokeWidth={correct ? 0 : 2} />
                    <text x="5" y="15" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.dark}>
                      {q.label}
                    </text>
                    <text x={cellW - 5} y="15" textAnchor="end"
                          fontFamily={FONTS.mono} fontSize="9"
                          fill={decision === 'strong' ? COLORS.red : COLORS.green}>
                      {decision === 'strong' ? t.strong : t.weak}
                    </text>
                  </g>
                );
              })}

              <text x={cellW / 2} y={35 + QUERIES.length * 27 + 15} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10" fontWeight="600" fill={router.color}>
                {t.accuracy}: {router.accuracy}
              </text>
            </g>
          );
        })}

        {hoveredRouter !== null && (
          <g transform={`translate(30, ${startY + cellH + 25})`}>
            <rect x="0" y="0" width="520" height="28" rx="4"
                  fill={COLORS.bgAlt} stroke={ROUTERS[hoveredRouter].color} strokeWidth="1" />
            <text x="10" y="18" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {ROUTERS[hoveredRouter].name}: {ROUTERS[hoveredRouter].note}
              · {t.threshold}={ROUTERS[hoveredRouter].threshold} · {locale === 'zh' ? '红色边框=' : 'Red border='}{t.wrongDecision}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
