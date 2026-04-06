import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface QueryExample {
  label: string;
  complexity: number; // 0-100
  category: string;
}

const QUERIES: QueryExample[] = [
  { label: '日常问候', complexity: 10, category: '简单' },
  { label: '翻译短句', complexity: 20, category: '简单' },
  { label: '知识问答', complexity: 35, category: '中等' },
  { label: '代码补全', complexity: 50, category: '中等' },
  { label: '逻辑推理', complexity: 65, category: '较难' },
  { label: '多步数学', complexity: 75, category: '较难' },
  { label: '复杂分析', complexity: 85, category: '困难' },
  { label: '创意写作', complexity: 45, category: '中等' },
];

export default function CapabilityMatchDiagram() {
  const [localCapability, setLocalCapability] = useState(55);
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 580, H = 420;
  const barL = 120, barR = 520, barW = barR - barL;
  const barTop = 80;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          能力匹配：第一驱动因素
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="11" fill={COLORS.mid}>
          本地模型能力 = {localCapability}% — 超出能力边界的 query 必须上云端
        </text>

        {/* Capability boundary */}
        {(() => {
          const bx = barL + (localCapability / 100) * barW;
          return (
            <>
              {/* Local zone */}
              <rect x={barL} y={barTop - 5} width={bx - barL} height={QUERIES.length * 36 + 10}
                    fill={COLORS.valid} opacity="0.3" rx="4" />
              <text x={(barL + bx) / 2} y={barTop - 12} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.green}>
                🟢 本地模型能力范围
              </text>

              {/* Cloud zone */}
              <rect x={bx} y={barTop - 5} width={barR - bx} height={QUERIES.length * 36 + 10}
                    fill={COLORS.waste} opacity="0.2" rx="4" />
              <text x={(bx + barR) / 2} y={barTop - 12} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.red}>
                🔴 需要云端模型
              </text>

              {/* Boundary line */}
              <line x1={bx} y1={barTop - 20} x2={bx} y2={barTop + QUERIES.length * 36 + 5}
                    stroke={COLORS.dark} strokeWidth="2.5" strokeDasharray="8,4" />
              <text x={bx} y={barTop + QUERIES.length * 36 + 22} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10" fontWeight="700" fill={COLORS.dark}>
                能力边界 ({localCapability}%)
              </text>
            </>
          );
        })()}

        {/* Query bars */}
        {QUERIES.map((q, i) => {
          const y = barTop + i * 36;
          const w = (q.complexity / 100) * barW;
          const isLocal = q.complexity <= localCapability;
          const isHov = hovered === i;

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              <text x={barL - 5} y={y + 20} textAnchor="end"
                    fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {q.label}
              </text>
              <rect x={barL} y={y + 5} width={barW} height="24" rx="3"
                    fill={COLORS.light} />
              <rect x={barL} y={y + 5} width={w} height="24" rx="3"
                    fill={isLocal ? COLORS.green : COLORS.red}
                    opacity={isHov ? 1 : 0.7} />
              <text x={barL + w + 6} y={y + 22}
                    fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
                {q.complexity}% {isLocal ? '→ 本地' : '→ 云端'}
              </text>
            </g>
          );
        })}

        {/* Key insight box */}
        <g transform="translate(40, 370)">
          <rect x="0" y="0" width="500" height="38" rx="4"
                fill="#fef3c7" stroke={COLORS.orange} strokeWidth="2" />
          <text x="250" y="16" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="12" fontWeight="700" fill={COLORS.dark}>
            ⚠️ 核心原则：能力匹配是第一驱动因素
          </text>
          <text x="250" y="32" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="10" fill={COLORS.dark}>
            如果本地模型搞不定，再便宜、再隐私也没用 — 成本/隐私/延迟只是能力满足后的附加偏好
          </text>
        </g>
      </svg>

      {/* Slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">本地模型能力:</span>
        <input type="range" min="10" max="90" value={localCapability}
               onChange={e => setLocalCapability(Number(e.target.value))}
               className="w-48 accent-blue-700" />
        <span className="text-sm font-mono text-gray-600">{localCapability}%</span>
      </div>
    </div>
  );
}
