import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const createLabels = (locale: 'zh' | 'en') => ({
  zh: {
    methods: ['分类器路由', '级联/自验证', 'Hybrid LLM', '在线学习', '多模型协作'],
    scenarios: ['高吞吐', '低延迟', '隐私敏感', '离线场景', '成本受限'],
    fitLabels: ['不适合', '一般', '适合', '非常适合'],
    explanations: [
      ['轻量 router 不影响吞吐', '几ms 延迟极低', '数据仍需发送到模型', '可配合本地模型', '大幅降低 API 调用'],
      ['多次调用影响吞吐', '可能需多次生成', '数据可能经过多个模型', '需要多个模型可用', '逐步升级节省成本'],
      ['需要本地+云端协调', '取决于本地硬件', '敏感数据留本地', '本地模型可离线', '本地模型成本低'],
      ['持续学习需要反馈', 'Bandit 决策快', '需要收集 reward', '需要在线环境', 'Pareto 优化成本'],
      ['成本线性增长', '并行延迟叠加', '可选择安全模型', '需要多模型可用', '成本最高'],
    ],
  },
  en: {
    methods: ['Classifier Routing', 'Cascade/Self-Verification', 'Hybrid LLM', 'Online Learning', 'Multi-Model Collaboration'],
    scenarios: ['High Throughput', 'Low Latency', 'Privacy Sensitive', 'Offline', 'Cost Constrained'],
    fitLabels: ['Poor', 'Fair', 'Good', 'Excellent'],
    explanations: [
      ['Lightweight router does not affect throughput', 'Few ms latency very low', 'Data still sent to model', 'Works with local models', 'Significantly reduces API calls'],
      ['Multiple calls affect throughput', 'May require multiple generations', 'Data may pass through multiple models', 'Requires multiple models available', 'Progressive upgrade saves cost'],
      ['Requires local+cloud coordination', 'Depends on local hardware', 'Sensitive data stays local', 'Local model works offline', 'Local model low cost'],
      ['Continuous learning requires feedback', 'Bandit decision fast', 'Needs to collect reward', 'Requires online environment', 'Pareto optimizes cost'],
      ['Linear cost growth', 'Parallel latency stacks', 'Can choose secure models', 'Requires multiple models available', 'Highest cost'],
    ],
  },
}[locale]);

// Fit scores: 0=poor, 1=fair, 2=good, 3=excellent
const FIT: number[][] = [
  [3, 3, 1, 2, 3],
  [2, 1, 1, 1, 3],
  [2, 2, 3, 3, 2],
  [3, 2, 1, 0, 3],
  [0, 0, 2, 1, 0],
];

const FIT_COLORS = ['#fee2e2', '#fef3c7', '#dbeafe', '#bbf7d0'];

export default function ScenarioFitMatrix({ locale = 'zh' }: Props) {
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const labels = createLabels(locale);

  const t = {
    zh: {
      title: '方法 × 场景适用度矩阵',
      instruction: '点击格子查看解释',
    },
    en: {
      title: 'Method × Scenario Fit Matrix',
      instruction: 'Click cells for explanation',
    },
  }[locale];

  const W = 580, H = 360;
  const labelW = 100, labelH = 50;
  const cellW = 80, cellH = 40;
  const startX = labelW + 20, startY = labelH + 20;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y="38" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          {t.instruction}
        </text>

        {/* Column headers */}
        {labels.scenarios.map((s, c) => (
          <text key={`col-${c}`} x={startX + c * cellW + cellW / 2} y={startY - 8}
                textAnchor="middle" fontFamily={FONTS.sans} fontSize="11"
                fontWeight="600" fill={COLORS.dark}>
            {s}
          </text>
        ))}

        {/* Rows */}
        {labels.methods.map((m, r) => (
          <g key={`row-${r}`}>
            <text x={startX - 10} y={startY + r * cellH + cellH / 2 + 4}
                  textAnchor="end" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {m}
            </text>
            {labels.scenarios.map((_, c) => {
              const fit = FIT[r][c];
              const isSelected = selected?.r === r && selected?.c === c;
              return (
                <g key={`cell-${r}-${c}`}
                   onClick={() => setSelected({ r, c })}
                   style={{ cursor: 'pointer' }}>
                  <rect x={startX + c * cellW} y={startY + r * cellH}
                        width={cellW - 2} height={cellH - 2} rx="4"
                        fill={FIT_COLORS[fit]}
                        stroke={isSelected ? COLORS.primary : 'transparent'}
                        strokeWidth={isSelected ? 2 : 0} />
                  <text x={startX + c * cellW + cellW / 2 - 1}
                        y={startY + r * cellH + cellH / 2 + 4}
                        textAnchor="middle" fontFamily={FONTS.sans} fontSize="11"
                        fill={COLORS.dark}>
                    {labels.fitLabels[fit]}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(${startX}, ${startY + labels.methods.length * cellH + 15})`}>
          {labels.fitLabels.map((label, i) => (
            <g key={label} transform={`translate(${i * 110}, 0)`}>
              <rect x="0" y="0" width="16" height="16" rx="2" fill={FIT_COLORS[i]} stroke={COLORS.mid} strokeWidth="0.5" />
              <text x="22" y="12" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{label}</text>
            </g>
          ))}
        </g>

        {/* Explanation box */}
        {selected && (
          <g transform={`translate(40, ${startY + labels.methods.length * cellH + 42})`}>
            <rect x="0" y="0" width="500" height="36" rx="4"
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
            <text x="10" y="14" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.primary}>
              {labels.methods[selected.r]} × {labels.scenarios[selected.c]}
            </text>
            <text x="10" y="29" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {labels.explanations[selected.r][selected.c]}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
