import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Locale = 'zh' | 'en';

// Simulated price series (10 time steps)
const TIME_STEPS = 10;
const MODELS_DATA = [
  { name: 'GPT-4o', baseCost: 30, priceVariation: [30, 32, 28, 35, 40, 38, 25, 30, 33, 29], color: '#6a1b9a' },
  { name: 'Claude Sonnet', baseCost: 15, priceVariation: [15, 14, 16, 15, 13, 18, 20, 16, 14, 15], color: '#1565c0' },
  { name: 'Llama-70B', baseCost: 5, priceVariation: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], color: '#2e7d32' }, // self-hosted, stable
];

// Which model the router picks at each time step (cost-aware)
function getRouterChoice(t: number): number {
  const prices = MODELS_DATA.map(m => m.priceVariation[t]);
  // Simple: if GPT-4o price spikes, prefer Claude; if Claude spikes, prefer Llama
  if (prices[0] > 35) return 1; // GPT-4 too expensive, use Claude
  if (prices[1] > 17) return 2; // Claude expensive, use Llama
  return 0; // default: GPT-4 (highest quality)
}

export default function DynamicPriceAdaptation({ locale = 'zh' }: { locale?: Locale }) {
  const t = {
    zh: {
      title: '动态价格适应',
      subtitle: 'API 价格波动时路由策略自动调整',
      currentTime: '当前: T=',
      routingDecision: '路由决策:',
      price: '价格:',
      priceUnit: '/M tokens',
      strategyTitle: '动态路由策略',
      strategyRule: 'GPT-4 价格 > $35 → 降级到 Claude · Claude 价格 > $17 → 降级到 Llama',
      onlineLearning: '在线学习 (Bandit/RL) 可以自动发现这些规律，无需手动设定阈值',
      selfHosted: 'Llama-70B 自部署，价格恒定 — 这是 self-hosted 模型的优势',
      timeStepLabel: '时间步:',
    },
    en: {
      title: 'Dynamic Price Adaptation',
      subtitle: 'Routing strategy auto-adjusts to API price fluctuations',
      currentTime: 'Current: T=',
      routingDecision: 'Routing:',
      price: 'Price:',
      priceUnit: '/M tokens',
      strategyTitle: 'Dynamic Routing Strategy',
      strategyRule: 'GPT-4 price > $35 → fallback to Claude · Claude price > $17 → fallback to Llama',
      onlineLearning: 'Online learning (Bandit/RL) can auto-discover these patterns without manual threshold tuning',
      selfHosted: 'Llama-70B self-hosted, constant price — advantage of self-hosted models',
      timeStepLabel: 'Time step:',
    },
  }[locale];

  const [timeStep, setTimeStep] = useState(0);

  const W = 580, H = 340;
  const chartL = 60, chartR = 420, chartT = 55, chartB = 220;
  const chartW = chartR - chartL, chartH = chartB - chartT;

  const getX = (t: number) => chartL + (t / (TIME_STEPS - 1)) * chartW;
  const getY = (price: number) => chartB - (price / 45) * chartH;

  const choice = getRouterChoice(timeStep);

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          {t.subtitle} · {t.currentTime}{timeStep}
        </text>

        {/* Axes */}
        <line x1={chartL} y1={chartB} x2={chartR} y2={chartB} stroke={COLORS.mid} strokeWidth="1" />
        <line x1={chartL} y1={chartT} x2={chartL} y2={chartB} stroke={COLORS.mid} strokeWidth="1" />

        {/* Price curves */}
        {MODELS_DATA.map(m => {
          const path = m.priceVariation.map((p, t) =>
            `${t === 0 ? 'M' : 'L'}${getX(t)},${getY(p)}`
          ).join(' ');
          return (
            <path key={m.name} d={path} fill="none" stroke={m.color} strokeWidth="2" />
          );
        })}

        {/* Current time marker */}
        <line x1={getX(timeStep)} y1={chartT} x2={getX(timeStep)} y2={chartB}
              stroke={COLORS.dark} strokeWidth="2" strokeDasharray="4,3" />

        {/* Price dots at current time */}
        {MODELS_DATA.map((m, i) => (
          <circle key={m.name} cx={getX(timeStep)} cy={getY(m.priceVariation[timeStep])}
                  r={i === choice ? 8 : 5}
                  fill={i === choice ? m.color : COLORS.light}
                  stroke={m.color} strokeWidth="2" />
        ))}

        {/* Legend */}
        <g transform="translate(435, 60)">
          {MODELS_DATA.map((m, i) => (
            <g key={m.name} transform={`translate(0, ${i * 24})`}>
              <line x1="0" y1="6" x2="20" y2="6" stroke={m.color} strokeWidth="2" />
              <text x="26" y="10" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
                {m.name}
              </text>
            </g>
          ))}
        </g>

        {/* Router decision */}
        <g transform="translate(435, 145)">
          <rect x="0" y="0" width="130" height="70" rx="4"
                fill={MODELS_DATA[choice].color} opacity="0.1"
                stroke={MODELS_DATA[choice].color} strokeWidth="1.5" />
          <text x="65" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="10" fontWeight="600" fill={COLORS.dark}>
            T={timeStep} {t.routingDecision}
          </text>
          <text x="65" y="40" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="12" fontWeight="700" fill={MODELS_DATA[choice].color}>
            → {MODELS_DATA[choice].name}
          </text>
          <text x="65" y="58" textAnchor="middle" fontFamily={FONTS.mono}
                fontSize="9" fill={COLORS.mid}>
            {t.price} ${MODELS_DATA[choice].priceVariation[timeStep]}{t.priceUnit}
          </text>
        </g>

        {/* Explanation */}
        <g transform="translate(30, 240)">
          <rect x="0" y="0" width="520" height="75" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            {t.strategyTitle}
          </text>
          <text x="15" y="38" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {t.strategyRule}
          </text>
          <text x="15" y="56" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {t.onlineLearning}
          </text>
          <text x="15" y="70" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            {t.selfHosted}
          </text>
        </g>
      </svg>

      {/* Time slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">{t.timeStepLabel}</span>
        <input type="range" min="0" max={TIME_STEPS - 1} value={timeStep}
               onChange={e => setTimeStep(Number(e.target.value))}
               className="w-64 accent-blue-700" />
        <span className="text-sm font-mono text-gray-500">T={timeStep}</span>
      </div>
    </div>
  );
}
