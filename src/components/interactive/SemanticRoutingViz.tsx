import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Route {
  name: string;
  templates: string[];
  center: [number, number];
  radius: number;
  color: string;
  model: string;
}

const ROUTES: Route[] = [
  { name: '简单问答', templates: ['"什么是..."', '"...是什么意思"', '"定义..."'], center: [0.2, 0.8], radius: 0.15, color: COLORS.green, model: 'Llama-8B' },
  { name: '翻译任务', templates: ['"翻译..."', '"translate..."', '"...怎么说"'], center: [0.15, 0.35], radius: 0.12, color: '#00838f', model: 'Llama-8B' },
  { name: '代码生成', templates: ['"写一个..."', '"实现..."', '"...代码"'], center: [0.6, 0.6], radius: 0.14, color: COLORS.orange, model: 'Llama-70B' },
  { name: '深度分析', templates: ['"分析..."', '"比较..."', '"评估..."'], center: [0.8, 0.3], radius: 0.16, color: COLORS.red, model: 'GPT-4' },
];

const TEST_QUERIES = [
  { text: '"HTTP 是什么"', pos: [0.22, 0.78] as [number, number] },
  { text: '"写一个排序算法"', pos: [0.58, 0.55] as [number, number] },
  { text: '"分析中美贸易关系"', pos: [0.75, 0.28] as [number, number] },
  { text: '"翻译这段话"', pos: [0.17, 0.38] as [number, number] },
];

export default function SemanticRoutingViz() {
  const [activeQuery, setActiveQuery] = useState(0);

  const W = 580, H = 400;
  const plotL = 30, plotT = 60, plotSize = 300;

  const q = TEST_QUERIES[activeQuery];
  const distances = ROUTES.map(r => {
    const dx = q.pos[0] - r.center[0];
    const dy = q.pos[1] - r.center[1];
    return Math.sqrt(dx * dx + dy * dy);
  });
  const closestIdx = distances.indexOf(Math.min(...distances));
  const closestRoute = ROUTES[closestIdx];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Semantic Routing: Embedding 空间匹配
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          无需训练：预定义 route 模板 + cosine 相似度匹配
        </text>

        <rect x={plotL} y={plotT} width={plotSize} height={plotSize}
              fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

        {ROUTES.map((r) => (
          <g key={r.name}>
            <circle cx={plotL + r.center[0] * plotSize}
                    cy={plotT + (1 - r.center[1]) * plotSize}
                    r={r.radius * plotSize}
                    fill={r.color} opacity="0.12"
                    stroke={r.color} strokeWidth="1.5" strokeDasharray="4,3" />
            <text x={plotL + r.center[0] * plotSize}
                  y={plotT + (1 - r.center[1]) * plotSize + 4}
                  textAnchor="middle" fontFamily={FONTS.sans} fontSize="10"
                  fontWeight="600" fill={r.color}>
              {r.name}
            </text>
          </g>
        ))}

        <circle cx={plotL + q.pos[0] * plotSize}
                cy={plotT + (1 - q.pos[1]) * plotSize}
                r="8" fill={COLORS.dark} stroke="#fff" strokeWidth="2" />
        <text x={plotL + q.pos[0] * plotSize + 12}
              y={plotT + (1 - q.pos[1]) * plotSize + 4}
              fontFamily={FONTS.sans} fontSize="9" fontWeight="700" fill={COLORS.dark}>
          Query
        </text>

        <line x1={plotL + q.pos[0] * plotSize}
              y1={plotT + (1 - q.pos[1]) * plotSize}
              x2={plotL + closestRoute.center[0] * plotSize}
              y2={plotT + (1 - closestRoute.center[1]) * plotSize}
              stroke={closestRoute.color} strokeWidth="2" strokeDasharray="5,3" />

        <g transform={`translate(350, 65)`}>
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            选择 Query:
          </text>
          {TEST_QUERIES.map((tq, i) => (
            <g key={i} transform={`translate(0, ${10 + i * 30})`}
               onClick={() => setActiveQuery(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="200" height="24" rx="4"
                    fill={activeQuery === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="100" y="16" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10"
                    fill={activeQuery === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {tq.text}
              </text>
            </g>
          ))}

          <g transform="translate(0, 145)">
            <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
              匹配结果:
            </text>
            <rect x="0" y="8" width="200" height="48" rx="4"
                  fill={COLORS.valid} stroke={closestRoute.color} strokeWidth="1.5" />
            <text x="10" y="28" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={closestRoute.color}>
              {closestRoute.name} → {closestRoute.model}
            </text>
            <text x="10" y="46" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
              cosine distance: {distances[closestIdx].toFixed(3)}
            </text>
          </g>

          <g transform="translate(0, 220)">
            <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.green}>✓ 无需训练数据</text>
            <text x="0" y="16" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.green}>✓ ~5ms 延迟</text>
            <text x="0" y="32" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.red}>✗ 粒度粗，依赖模板</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
