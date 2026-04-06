import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface QueryExample {
  labelKey: string;
  complexity: number; // 0-100
  categoryKey: string;
}

interface CapabilityMatchDiagramProps {
  locale?: 'zh' | 'en';
}

const QUERY_CONFIG: QueryExample[] = [
  { labelKey: 'query1', complexity: 10, categoryKey: 'cat1' },
  { labelKey: 'query2', complexity: 20, categoryKey: 'cat1' },
  { labelKey: 'query3', complexity: 35, categoryKey: 'cat2' },
  { labelKey: 'query4', complexity: 50, categoryKey: 'cat2' },
  { labelKey: 'query5', complexity: 65, categoryKey: 'cat3' },
  { labelKey: 'query6', complexity: 75, categoryKey: 'cat3' },
  { labelKey: 'query7', complexity: 85, categoryKey: 'cat4' },
  { labelKey: 'query8', complexity: 45, categoryKey: 'cat2' },
];

export default function CapabilityMatchDiagram({ locale = 'zh' }: CapabilityMatchDiagramProps) {
  const t = {
    zh: {
      title: '能力匹配：第一驱动因素',
      subtitle: '本地模型能力 = {val}% — 超出能力边界的 query 必须上云端',
      localZone: '🟢 本地模型能力范围',
      cloudZone: '🔴 需要云端模型',
      boundary: '能力边界 ({val}%)',
      toLocal: '→ 本地',
      toCloud: '→ 云端',
      keyInsightTitle: '⚠️ 核心原则：能力匹配是第一驱动因素',
      keyInsightText: '如果本地模型搞不定，再便宜、再隐私也没用 — 成本/隐私/延迟只是能力满足后的附加偏好',
      sliderLabel: '本地模型能力:',
      query1: '日常问候',
      query2: '翻译短句',
      query3: '知识问答',
      query4: '代码补全',
      query5: '逻辑推理',
      query6: '多步数学',
      query7: '复杂分析',
      query8: '创意写作',
    },
    en: {
      title: 'Capability Match: Primary Driver',
      subtitle: 'Local model capability = {val}% — queries beyond capability must go to cloud',
      localZone: '🟢 Local model capability range',
      cloudZone: '🔴 Cloud model required',
      boundary: 'Capability boundary ({val}%)',
      toLocal: '→ Local',
      toCloud: '→ Cloud',
      keyInsightTitle: '⚠️ Core principle: Capability match is the primary driver',
      keyInsightText: 'If local model cannot handle it, cost/privacy/latency advantages are irrelevant — they are only secondary preferences after capability is met',
      sliderLabel: 'Local model capability:',
      query1: 'Greetings',
      query2: 'Translation',
      query3: 'Knowledge Q&A',
      query4: 'Code completion',
      query5: 'Logic reasoning',
      query6: 'Multi-step math',
      query7: 'Complex analysis',
      query8: 'Creative writing',
    },
  }[locale];

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
          {t.title}
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="11" fill={COLORS.mid}>
          {t.subtitle.replace('{val}', String(localCapability))}
        </text>

        {/* Capability boundary */}
        {(() => {
          const bx = barL + (localCapability / 100) * barW;
          return (
            <>
              {/* Local zone */}
              <rect x={barL} y={barTop - 5} width={bx - barL} height={QUERY_CONFIG.length * 36 + 10}
                    fill={COLORS.valid} opacity="0.3" rx="4" />
              <text x={(barL + bx) / 2} y={barTop - 12} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.green}>
                {t.localZone}
              </text>

              {/* Cloud zone */}
              <rect x={bx} y={barTop - 5} width={barR - bx} height={QUERY_CONFIG.length * 36 + 10}
                    fill={COLORS.waste} opacity="0.2" rx="4" />
              <text x={(bx + barR) / 2} y={barTop - 12} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.red}>
                {t.cloudZone}
              </text>

              {/* Boundary line */}
              <line x1={bx} y1={barTop - 20} x2={bx} y2={barTop + QUERY_CONFIG.length * 36 + 5}
                    stroke={COLORS.dark} strokeWidth="2.5" strokeDasharray="8,4" />
              <text x={bx} y={barTop + QUERY_CONFIG.length * 36 + 22} textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="10" fontWeight="700" fill={COLORS.dark}>
                {t.boundary.replace('{val}', String(localCapability))}
              </text>
            </>
          );
        })()}

        {/* Query bars */}
        {QUERY_CONFIG.map((q, i) => {
          const y = barTop + i * 36;
          const w = (q.complexity / 100) * barW;
          const isLocal = q.complexity <= localCapability;
          const isHov = hovered === i;

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              <text x={barL - 5} y={y + 20} textAnchor="end"
                    fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {t[q.labelKey as keyof typeof t]}
              </text>
              <rect x={barL} y={y + 5} width={barW} height="24" rx="3"
                    fill={COLORS.light} />
              <rect x={barL} y={y + 5} width={w} height="24" rx="3"
                    fill={isLocal ? COLORS.green : COLORS.red}
                    opacity={isHov ? 1 : 0.7} />
              <text x={barL + w + 6} y={y + 22}
                    fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
                {q.complexity}% {isLocal ? t.toLocal : t.toCloud}
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
            {t.keyInsightTitle}
          </text>
          <text x="250" y="32" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="10" fill={COLORS.dark}>
            {t.keyInsightText}
          </text>
        </g>
      </svg>

      {/* Slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">{t.sliderLabel}</span>
        <input type="range" min="10" max="90" value={localCapability}
               onChange={e => setLocalCapability(Number(e.target.value))}
               className="w-48 accent-blue-700" />
        <span className="text-sm font-mono text-gray-600">{localCapability}%</span>
      </div>
    </div>
  );
}
