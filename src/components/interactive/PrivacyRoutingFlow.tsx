import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const EXAMPLES = [
  {
    query: '我的社保号码是 xxx-xx-xxxx，帮我查余额',
    entities: [{ text: 'xxx-xx-xxxx', type: 'SSN', sensitivity: 'high' }],
    route: 'local',
    reason: '包含高敏感 PII (SSN)，必须留在本地',
  },
  {
    query: '北京今天天气怎么样',
    entities: [{ text: '北京', type: '地点', sensitivity: 'low' }],
    route: 'cloud',
    reason: '无敏感信息，可安全上云获取更好回答',
  },
  {
    query: '我在 Acme Corp 的工资是多少',
    entities: [
      { text: 'Acme Corp', type: '公司', sensitivity: 'medium' },
      { text: '工资', type: '财务', sensitivity: 'high' },
    ],
    route: 'local-dp',
    reason: '含中/高敏感信息，本地处理 + 差分隐私保护',
  },
];

export default function PrivacyRoutingFlow() {
  const [exIdx, setExIdx] = useState(0);
  const ex = EXAMPLES[exIdx];

  const W = 580, H = 380;

  const routeColors = { local: COLORS.green, cloud: COLORS.primary, 'local-dp': COLORS.orange };
  const routeLabels = { local: '🔒 本地处理', cloud: '☁️ 云端处理', 'local-dp': '🔒+DP 本地+差分隐私' };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          PRISM: 隐私敏感度路由
        </text>

        {/* Example selector */}
        <g transform="translate(30, 40)">
          {EXAMPLES.map((e, i) => (
            <g key={i} transform={`translate(${i * 185}, 0)`}
               onClick={() => setExIdx(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="175" height="28" rx="4"
                    fill={exIdx === i ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1" />
              <text x="87.5" y="18" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={exIdx === i ? '#fff' : COLORS.dark}
                    style={{ pointerEvents: 'none' }}>
                {e.query.length > 22 ? e.query.slice(0, 22) + '…' : e.query}
              </text>
            </g>
          ))}
        </g>

        {/* Flow: Query → Entity Detection → Sensitivity Score → Route Decision */}
        <g transform="translate(20, 85)">
          {/* Step 1: Query */}
          <rect x="0" y="0" width="120" height="45" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="60" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>Query</text>
          <text x="60" y="35" textAnchor="middle" fontFamily={FONTS.sans} fontSize="8" fill={COLORS.mid}>
            {ex.query.length > 18 ? ex.query.slice(0, 18) + '…' : ex.query}
          </text>

          <text x="125" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

          {/* Step 2: Entity Detection */}
          <rect x="140" y="0" width="120" height="45" rx="4" fill={COLORS.bgAlt} stroke={COLORS.orange} strokeWidth="1.5" />
          <text x="200" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>实体检测</text>
          <text x="200" y="35" textAnchor="middle" fontFamily={FONTS.mono} fontSize="8" fill={COLORS.orange}>
            {ex.entities.length} 个实体
          </text>

          <text x="265" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

          {/* Step 3: Sensitivity Scoring */}
          <rect x="280" y="0" width="120" height="45" rx="4" fill={COLORS.bgAlt} stroke={COLORS.red} strokeWidth="1.5" />
          <text x="340" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>敏感度评分</text>
          <text x="340" y="35" textAnchor="middle" fontFamily={FONTS.mono} fontSize="8" fill={COLORS.red}>
            max: {ex.entities.reduce((a, e) => e.sensitivity === 'high' ? 'high' : a, ex.entities[0].sensitivity)}
          </text>

          <text x="405" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

          {/* Step 4: Route Decision */}
          <rect x="420" y="0" width="120" height="45" rx="4"
                fill={routeColors[ex.route as keyof typeof routeColors]} opacity="0.15"
                stroke={routeColors[ex.route as keyof typeof routeColors]} strokeWidth="2" />
          <text x="480" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="700"
                fill={routeColors[ex.route as keyof typeof routeColors]}>
            {routeLabels[ex.route as keyof typeof routeLabels]}
          </text>
        </g>

        {/* Entity details */}
        <g transform="translate(30, 150)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            检测到的实体:
          </text>
          {ex.entities.map((ent, i) => {
            const sensColor = ent.sensitivity === 'high' ? COLORS.red : ent.sensitivity === 'medium' ? COLORS.orange : COLORS.green;
            return (
              <g key={i} transform={`translate(${i * 200}, 10)`}>
                <rect x="0" y="0" width="185" height="35" rx="4"
                      fill={sensColor} opacity="0.1" stroke={sensColor} strokeWidth="1" />
                <text x="10" y="15" fontFamily={FONTS.mono} fontSize="10" fontWeight="600" fill={sensColor}>
                  {ent.text}
                </text>
                <text x="10" y="28" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.dark}>
                  类型: {ent.type} · 敏感度: {ent.sensitivity}
                </text>
              </g>
            );
          })}
        </g>

        {/* Route explanation */}
        <g transform="translate(30, 210)">
          <rect x="0" y="0" width="520" height="48" rx="6"
                fill={routeColors[ex.route as keyof typeof routeColors]} opacity="0.1"
                stroke={routeColors[ex.route as keyof typeof routeColors]} strokeWidth="2" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="700"
                fill={routeColors[ex.route as keyof typeof routeColors]}>
            路由决策: {routeLabels[ex.route as keyof typeof routeLabels]}
          </text>
          <text x="15" y="38" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {ex.reason}
          </text>
        </g>

        {/* PRISM info */}
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="520" height="85" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            PRISM (AAAI 2026) 核心机制
          </text>
          <text x="15" y="38" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            1. 实体级敏感度检测 — 不是整个 query 判断，而是精确到每个实体
          </text>
          <text x="15" y="54" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            2. 自适应差分隐私 — 对必须上云的敏感数据添加 ε-DP 噪声保护
          </text>
          <text x="15" y="70" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            3. 离线场景自动降级 — 断网时本地模型是唯一选择
          </text>
        </g>
      </svg>
    </div>
  );
}
