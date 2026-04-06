import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const EXAMPLES = [
  { query: '简单翻译', state: '低复杂度', action: '选 Llama-8B', quality: 0.85, cost: 0.001, reward: '0.85 - 0.01 = 0.84' },
  { query: '代码分析', state: '高复杂度', action: '选 GPT-4', quality: 0.95, cost: 0.03, reward: '0.95 - 0.30 = 0.65' },
  { query: '知识问答', state: '中等复杂度', action: '选 Llama-70B', quality: 0.88, cost: 0.005, reward: '0.88 - 0.05 = 0.83' },
];

export default function RLRewardSignalViz() {
  const [exIdx, setExIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const W = 580, H = 360;
  const ex = EXAMPLES[exIdx];

  const steps = [
    { label: 'State', detail: `Query: "${ex.query}" → ${ex.state}`, color: COLORS.primary },
    { label: 'Action', detail: ex.action, color: COLORS.green },
    { label: 'Reward', detail: `Quality(${ex.quality}) - Cost(${ex.cost}) = ${ex.reward}`, color: COLORS.orange },
    { label: 'Update', detail: '更新策略: 调整 query→model 映射权重', color: '#6a1b9a' },
  ];

  // Circular positions
  const cx = 200, cy = 180, R = 100;
  const positions = steps.map((_, i) => {
    const angle = (Math.PI * 2 * i) / steps.length - Math.PI / 2;
    return [cx + R * Math.cos(angle), cy + R * Math.sin(angle)];
  });

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          RL Routing: State → Action → Reward 循环
        </text>

        {/* Example selector */}
        <g transform="translate(140, 38)">
          {EXAMPLES.map((e, i) => (
            <g key={i} transform={`translate(${i * 110}, 0)`}
               onClick={() => { setExIdx(i); setActiveStep(0); }} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="100" height="22" rx="4"
                    fill={exIdx === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="50" y="15" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={exIdx === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {e.query}
              </text>
            </g>
          ))}
        </g>

        {/* Circular flow */}
        {/* Arrows between nodes */}
        {positions.map(([x, y], i) => {
          const next = positions[(i + 1) % positions.length];
          const dx = next[0] - x, dy = next[1] - y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / len, ny = dy / len;
          return (
            <line key={`arrow-${i}`}
                  x1={x + nx * 35} y1={y + ny * 35}
                  x2={next[0] - nx * 35} y2={next[1] - ny * 35}
                  stroke={i <= activeStep ? steps[i].color : COLORS.light}
                  strokeWidth="2"
                  markerEnd={`url(#arrow-rl-${i <= activeStep ? 'active' : 'inactive'})`} />
          );
        })}

        <defs>
          <marker id="arrow-rl-active" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.dark} />
          </marker>
          <marker id="arrow-rl-inactive" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.light} />
          </marker>
        </defs>

        {/* Nodes */}
        {steps.map((s, i) => {
          const [x, y] = positions[i];
          const isActive = i <= activeStep;
          return (
            <g key={i} onClick={() => setActiveStep(i)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="30"
                      fill={isActive ? s.color : COLORS.bgAlt}
                      opacity={isActive ? 0.15 : 1}
                      stroke={s.color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={x} y={y + 4} textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="11" fontWeight="700" fill={isActive ? s.color : COLORS.mid}>
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Detail panel */}
        <g transform="translate(350, 85)">
          <rect x="0" y="0" width="200" height="200" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="100" y="22" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="12" fontWeight="700" fill={steps[activeStep].color}>
            {steps[activeStep].label}
          </text>
          <text x="10" y="48" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {steps[activeStep].detail.length > 28
              ? steps[activeStep].detail.slice(0, 28)
              : steps[activeStep].detail}
          </text>
          {steps[activeStep].detail.length > 28 && (
            <text x="10" y="64" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
              {steps[activeStep].detail.slice(28)}
            </text>
          )}

          <text x="10" y="100" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>
            RL 关键公式:
          </text>
          <text x="10" y="118" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>
            R = Quality(a, q) - λ·Cost(a)
          </text>
          <text x="10" y="136" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            λ 控制成本敏感度:
          </text>
          <text x="10" y="152" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            λ大 → 偏好便宜模型
          </text>
          <text x="10" y="168" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            λ小 → 偏好高质量模型
          </text>
        </g>
      </svg>

      {/* Step controls */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                disabled={activeStep === 0}>
          ← 上一步
        </button>
        <span className="text-sm text-gray-500">
          Step {activeStep + 1} / {steps.length}
        </span>
        <button onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                disabled={activeStep === steps.length - 1}>
          下一步 →
        </button>
      </div>
    </div>
  );
}
