import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Paper {
  year: number;
  month: number;
  name: string;
  venue?: string;
  contribution: string;
  category: 'classifier' | 'cascade' | 'hybrid' | 'online' | 'ensemble' | 'system';
}

interface Props {
  locale?: 'zh' | 'en';
}

const createPapers = (locale: 'zh' | 'en'): Paper[] => {
  const t = {
    zh: {
      frugalGpt: '级联方法开山之作，98% 成本降低',
      autoMix: 'POMDP + few-shot 自验证路由',
      routeLlm: '开源路由框架，MF/BERT/Causal LM/SW 四种 router',
      appleIntelligence: 'On-device + Private Cloud Compute，产品化标杆',
      confidenceDriven: 'LLM-as-Judge + 不确定性估计',
      prism: '实体级隐私敏感度路由',
      hybridFlow: 'Subtask-level DAG 路由',
      consRoute: 'Reranker 语义一致性做 cloud-edge-device 路由',
      robustBatch: '批量优化在对抗条件下优于逐条 24%',
      smallModels: '1-4B 模型做路由，78.3% 准确率',
      councilMode: '并行多 LLM + 综合，35.9% 幻觉降低',
    },
    en: {
      frugalGpt: 'Pioneering cascade method, 98% cost reduction',
      autoMix: 'POMDP + few-shot self-verification routing',
      routeLlm: 'Open-source routing framework, 4 routers: MF/BERT/Causal LM/SW',
      appleIntelligence: 'On-device + Private Cloud Compute, production benchmark',
      confidenceDriven: 'LLM-as-Judge + uncertainty estimation',
      prism: 'Entity-level privacy-sensitive routing',
      hybridFlow: 'Subtask-level DAG routing',
      consRoute: 'Reranker semantic consistency for cloud-edge-device routing',
      robustBatch: 'Batch optimization 24% better than per-query under adversarial conditions',
      smallModels: '1-4B models as routers, 78.3% accuracy',
      councilMode: 'Parallel multi-LLM + synthesis, 35.9% hallucination reduction',
    },
  }[locale];

  return [
    { year: 2023, month: 5, name: 'FrugalGPT', venue: 'arXiv', contribution: t.frugalGpt, category: 'cascade' },
    { year: 2023, month: 10, name: 'AutoMix', venue: 'arXiv → NeurIPS 2024', contribution: t.autoMix, category: 'cascade' },
    { year: 2024, month: 6, name: 'RouteLLM', venue: 'arXiv', contribution: t.routeLlm, category: 'system' },
    { year: 2024, month: 6, name: 'Apple Intelligence', venue: 'WWDC', contribution: t.appleIntelligence, category: 'hybrid' },
    { year: 2025, month: 2, name: 'Confidence-Driven Router', venue: 'arXiv', contribution: t.confidenceDriven, category: 'cascade' },
    { year: 2025, month: 11, name: 'PRISM', venue: 'AAAI 2026', contribution: t.prism, category: 'hybrid' },
    { year: 2025, month: 12, name: 'HybridFlow', venue: 'arXiv', contribution: t.hybridFlow, category: 'hybrid' },
    { year: 2026, month: 3, name: 'ConsRoute', venue: 'arXiv', contribution: t.consRoute, category: 'hybrid' },
    { year: 2026, month: 3, name: 'Robust Batch Routing', venue: 'arXiv', contribution: t.robustBatch, category: 'online' },
    { year: 2026, month: 4, name: 'Small Models as Routers', venue: 'arXiv', contribution: t.smallModels, category: 'classifier' },
    { year: 2026, month: 4, name: 'Council Mode', venue: 'arXiv', contribution: t.councilMode, category: 'ensemble' },
  ];
};

const CAT_COLORS: Record<string, string> = {
  classifier: '#1565c0', cascade: '#2e7d32', hybrid: '#e65100',
  online: '#6a1b9a', ensemble: '#c62828', system: '#00838f',
};

const createCatLabels = (locale: 'zh' | 'en') => ({
  zh: {
    classifier: '分类器', cascade: '级联', hybrid: '混合路由',
    online: '在线学习', ensemble: '多模型', system: '系统/框架',
  },
  en: {
    classifier: 'Classifier', cascade: 'Cascade', hybrid: 'Hybrid Routing',
    online: 'Online Learning', ensemble: 'Multi-Model', system: 'System/Framework',
  },
}[locale]);

export default function PaperTimeline({ locale = 'zh' }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const PAPERS = createPapers(locale);
  const CAT_LABELS = createCatLabels(locale);

  const t = {
    zh: {
      title: 'Model Routing 论文与系统时间线 (2023-2026)',
    },
    en: {
      title: 'Model Routing Papers & Systems Timeline (2023-2026)',
    },
  }[locale];

  const W = 580, H = 520;
  const timelineL = 100, timelineR = 540;
  const timelineW = timelineR - timelineL;
  const startDate = 2023.0, endDate = 2026.5;
  const range = endDate - startDate;

  const getX = (year: number, month: number) =>
    timelineL + ((year + month / 12 - startDate) / range) * timelineW;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Timeline axis */}
        <line x1={timelineL} y1="60" x2={timelineR} y2="60"
              stroke={COLORS.dark} strokeWidth="2" />
        {[2023, 2024, 2025, 2026].map(y => (
          <g key={y}>
            <line x1={getX(y, 0)} y1="55" x2={getX(y, 0)} y2="65"
                  stroke={COLORS.dark} strokeWidth="2" />
            <text x={getX(y, 0)} y="80" textAnchor="middle"
                  fontFamily={FONTS.mono} fontSize="12" fontWeight="600" fill={COLORS.dark}>
              {y}
            </text>
          </g>
        ))}

        {/* Paper dots */}
        {PAPERS.map((p, i) => {
          const x = getX(p.year, p.month);
          const row = i % 2 === 0 ? 0 : 1;
          const dotY = 60;
          const labelY = 100 + (i % 4) * 30;
          const isSelected = selected === p.name;
          return (
            <g key={p.name} style={{ cursor: 'pointer' }}
               onClick={() => setSelected(isSelected ? null : p.name)}>
              <circle cx={x} cy={dotY} r={isSelected ? 7 : 5}
                      fill={CAT_COLORS[p.category]}
                      stroke={isSelected ? COLORS.dark : '#fff'}
                      strokeWidth={isSelected ? 2 : 1.5} />
              <line x1={x} y1={dotY + 6} x2={x} y2={labelY - 10}
                    stroke={CAT_COLORS[p.category]} strokeWidth="1"
                    strokeDasharray="2,2" opacity="0.5" />
              <text x={x} y={labelY}
                    textAnchor="middle" fontFamily={FONTS.sans} fontSize="9"
                    fontWeight={isSelected ? "700" : "400"}
                    fill={CAT_COLORS[p.category]}>
                {p.name}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(80, 340)">
          {Object.entries(CAT_LABELS).map(([key, label], i) => (
            <g key={key} transform={`translate(${(i % 3) * 160}, ${Math.floor(i / 3) * 20})`}>
              <circle cx="6" cy="6" r="5" fill={CAT_COLORS[key]} />
              <text x="16" y="10" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{label}</text>
            </g>
          ))}
        </g>

        {/* Selected detail */}
        {selected && (() => {
          const p = PAPERS.find(p => p.name === selected)!;
          return (
            <g transform="translate(40, 390)">
              <rect x="0" y="0" width="500" height="55" rx="4"
                    fill={COLORS.bgAlt} stroke={CAT_COLORS[p.category]} strokeWidth="1.5" />
              <text x="10" y="18" fontFamily={FONTS.sans} fontSize="12" fontWeight="700"
                    fill={CAT_COLORS[p.category]}>
                {p.name} ({p.year}.{String(p.month).padStart(2, '0')})
                {p.venue ? ` — ${p.venue}` : ''}
              </text>
              <text x="10" y="38" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {p.contribution}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
