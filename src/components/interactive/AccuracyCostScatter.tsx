import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface MethodPoint {
  name: string;
  accuracy: number; // 0-100, % of GPT-4 quality
  costSaving: number; // 0-100, % cost reduction
  category: 'classifier' | 'cascade' | 'hybrid' | 'online' | 'ensemble';
  detail: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

const createMethods = (locale: 'zh' | 'en'): MethodPoint[] => {
  const t = {
    zh: {
      noRouting: { name: 'No Routing\n(always GPT-4)', detail: '始终使用最强模型。质量最高，成本最高。' },
      mfRouter: { name: 'MF Router', detail: 'RouteLLM Matrix Factorization。偏好数据学评分，85% 成本降低。' },
      bertRouter: { name: 'BERT Router', detail: '微调 BERT 二分类器。训练简单，推理快。' },
      causalLmRouter: { name: 'Causal LM Router', detail: '小语言模型做路由。78.3% 准确率，zero-marginal-cost。' },
      semanticRouter: { name: 'Semantic Router', detail: 'Embedding cosine 匹配。无需训练，最快路由。' },
      frugalGpt: { name: 'FrugalGPT', detail: '级联链：便宜模型先试，不行再升级。98% 成本降低。' },
      autoMix: { name: 'AutoMix', detail: 'POMDP + 自验证。NeurIPS 2024，50%+ 成本降低。' },
      consRoute: { name: 'ConsRoute', detail: 'Reranker 语义一致性。40% 延迟+成本降低。' },
      routerFreeRl: { name: 'Router-free RL', detail: '本地模型自学升级决策。无需外部 router。' },
      paretoBandit: { name: 'ParetoBandit', detail: 'Cost-aware contextual bandit。Pareto 前沿优化。' },
      councilMode: { name: 'Council Mode', detail: '多 LLM 并行 + 综合。35.9% 幻觉降低，但成本增加。' },
    },
    en: {
      noRouting: { name: 'No Routing\n(always GPT-4)', detail: 'Always use strongest model. Highest quality, highest cost.' },
      mfRouter: { name: 'MF Router', detail: 'RouteLLM Matrix Factorization. Learn scoring from preference data, 85% cost reduction.' },
      bertRouter: { name: 'BERT Router', detail: 'Fine-tuned BERT binary classifier. Simple training, fast inference.' },
      causalLmRouter: { name: 'Causal LM Router', detail: 'Small language model for routing. 78.3% accuracy, zero-marginal-cost.' },
      semanticRouter: { name: 'Semantic Router', detail: 'Embedding cosine matching. No training, fastest routing.' },
      frugalGpt: { name: 'FrugalGPT', detail: 'Cascade chain: try cheap model first, upgrade if needed. 98% cost reduction.' },
      autoMix: { name: 'AutoMix', detail: 'POMDP + self-verification. NeurIPS 2024, 50%+ cost reduction.' },
      consRoute: { name: 'ConsRoute', detail: 'Reranker semantic consistency. 40% latency+cost reduction.' },
      routerFreeRl: { name: 'Router-free RL', detail: 'Local model learns upgrade decision via RL. No external router.' },
      paretoBandit: { name: 'ParetoBandit', detail: 'Cost-aware contextual bandit. Pareto frontier optimization.' },
      councilMode: { name: 'Council Mode', detail: 'Parallel multi-LLM + synthesis. 35.9% hallucination reduction, increased cost.' },
    },
  }[locale];

  return [
    { name: t.noRouting.name, accuracy: 100, costSaving: 0, category: 'classifier' as const, detail: t.noRouting.detail },
    { name: t.mfRouter.name, accuracy: 95, costSaving: 85, category: 'classifier' as const, detail: t.mfRouter.detail },
    { name: t.bertRouter.name, accuracy: 93, costSaving: 80, category: 'classifier' as const, detail: t.bertRouter.detail },
    { name: t.causalLmRouter.name, accuracy: 92, costSaving: 75, category: 'classifier' as const, detail: t.causalLmRouter.detail },
    { name: t.semanticRouter.name, accuracy: 85, costSaving: 90, category: 'classifier' as const, detail: t.semanticRouter.detail },
    { name: t.frugalGpt.name, accuracy: 96, costSaving: 98, category: 'cascade' as const, detail: t.frugalGpt.detail },
    { name: t.autoMix.name, accuracy: 94, costSaving: 50, category: 'cascade' as const, detail: t.autoMix.detail },
    { name: t.consRoute.name, accuracy: 91, costSaving: 40, category: 'hybrid' as const, detail: t.consRoute.detail },
    { name: t.routerFreeRl.name, accuracy: 88, costSaving: 60, category: 'hybrid' as const, detail: t.routerFreeRl.detail },
    { name: t.paretoBandit.name, accuracy: 90, costSaving: 70, category: 'online' as const, detail: t.paretoBandit.detail },
    { name: t.councilMode.name, accuracy: 98, costSaving: -50, category: 'ensemble' as const, detail: t.councilMode.detail },
  ];
};

const CATEGORY_COLORS: Record<string, string> = {
  classifier: '#1565c0',
  cascade: '#2e7d32',
  hybrid: '#e65100',
  online: '#6a1b9a',
  ensemble: '#c62828',
};

const createCategoryLabels = (locale: 'zh' | 'en') => ({
  zh: {
    classifier: '分类器路由',
    cascade: '级联/自验证',
    hybrid: 'Hybrid LLM',
    online: '在线学习',
    ensemble: '多模型协作',
  },
  en: {
    classifier: 'Classifier Routing',
    cascade: 'Cascade/Self-Verification',
    hybrid: 'Hybrid LLM',
    online: 'Online Learning',
    ensemble: 'Multi-Model Collaboration',
  },
}[locale]);

export default function AccuracyCostScatter({ locale = 'zh' }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const METHODS = createMethods(locale);
  const CATEGORY_LABELS = createCategoryLabels(locale);

  const t = {
    zh: {
      title: '路由方法：精度 vs 成本节省',
      instruction: 'Hover 查看方法详情 · 左侧=成本增加 · 右侧=成本节省',
      xAxis: '← 成本增加 | 成本节省 (%) →',
      yAxis: '质量保持 (% of GPT-4) →',
      summary: (name: string, accuracy: number, costSaving: number) =>
        `${name.replace('\n', ' ')} — 质量 ${accuracy}% · 成本节省 ${costSaving}%`,
    },
    en: {
      title: 'Routing Methods: Accuracy vs Cost Savings',
      instruction: 'Hover for details · Left=cost increase · Right=cost savings',
      xAxis: '← Cost Increase | Cost Savings (%) →',
      yAxis: 'Quality (% of GPT-4) →',
      summary: (name: string, accuracy: number, costSaving: number) =>
        `${name.replace('\n', ' ')} — Quality ${accuracy}% · Cost Savings ${costSaving}%`,
    },
  }[locale];

  const W = 580, H = 420;
  const pL = 100, pR = 530, pT = 50, pB = 310;
  const pW = pR - pL, pH = pB - pT;
  // X axis: -60 to 100 (supports negative cost saving = cost increase)
  const xMin = -60, xMax = 100, xRange = xMax - xMin;
  const getXPos = (costSaving: number) => pL + ((costSaving - xMin) / xRange) * pW;
  // Zero line position
  const zeroX = getXPos(0);

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          {t.instruction}
        </text>

        {/* Axes */}
        <line x1={pL} y1={pB} x2={pR} y2={pB} stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={pL} y1={pT} x2={pL} y2={pB} stroke={COLORS.mid} strokeWidth="1.5" />
        {/* Zero line */}
        <line x1={zeroX} y1={pT} x2={zeroX} y2={pB}
              stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,3" />
        <text x={zeroX} y={pB + 15} textAnchor="middle"
              fontFamily={FONTS.mono} fontSize="9" fontWeight="600" fill={COLORS.dark}>0%</text>
        <text x={W / 2} y={pB + 30} textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>
          {t.xAxis}
        </text>
        <text x={pL - 15} y={(pT + pB) / 2} textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}
              transform={`rotate(-90, ${pL - 15}, ${(pT + pB) / 2})`}>
          {t.yAxis}
        </text>

        {/* Grid lines */}
        {[-50, 0, 25, 50, 75, 100].map(v => (
          <g key={`grid-${v}`}>
            <line x1={getXPos(v)} y1={pT} x2={getXPos(v)} y2={pB}
                  stroke={COLORS.light} strokeWidth="0.5" />
            <text x={getXPos(v)} y={pB + 15} textAnchor="middle"
                  fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>{v}</text>
          </g>
        ))}
        {[80, 85, 90, 95, 100].map(v => (
          <g key={`grid-y-${v}`}>
            <line x1={pL} y1={pB - ((v - 80) / 25) * pH} x2={pR} y2={pB - ((v - 80) / 25) * pH}
                  stroke={COLORS.light} strokeWidth="0.5" />
            <text x={pL - 8} y={pB - ((v - 80) / 25) * pH + 4} textAnchor="end"
                  fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>{v}</text>
          </g>
        ))}

        {/* Data points */}
        {METHODS.map(m => {
          const cx = getXPos(m.costSaving);
          const cy = pB - ((Math.min(100, Math.max(80, m.accuracy)) - 80) / 25) * pH;
          const isHovered = hovered === m.name;
          return (
            <g key={m.name}
               onMouseEnter={() => setHovered(m.name)}
               onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              <circle cx={cx} cy={cy} r={isHovered ? 10 : 7}
                      fill={CATEGORY_COLORS[m.category]} opacity={isHovered ? 1 : 0.8}
                      stroke="#fff" strokeWidth="2" />
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${pL}, ${pB + 40})`}>
          {Object.entries(CATEGORY_LABELS).map(([key, label], i) => (
            <g key={key} transform={`translate(${i * 100}, 0)`}>
              <circle cx="6" cy="6" r="5" fill={CATEGORY_COLORS[key]} />
              <text x="16" y="10" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{label}</text>
            </g>
          ))}
        </g>

        {/* Hover detail */}
        {hovered && (() => {
          const m = METHODS.find(m => m.name === hovered)!;
          return (
            <g transform={`translate(70, ${pB + 60})`}>
              <rect x="0" y="0" width="460" height="42" rx="4"
                    fill={COLORS.bgAlt} stroke={CATEGORY_COLORS[m.category]} strokeWidth="1.5" />
              <text x="10" y="17" fontFamily={FONTS.sans} fontSize="12" fontWeight="700"
                    fill={CATEGORY_COLORS[m.category]}>
                {t.summary(m.name, m.accuracy, m.costSaving)}
              </text>
              <text x="10" y="34" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {m.detail}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
