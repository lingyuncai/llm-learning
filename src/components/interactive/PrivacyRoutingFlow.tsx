import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Entity {
  text: string;
  type: string;
  sensitivity: 'high' | 'medium' | 'low';
}

interface Example {
  query: string;
  entities: Entity[];
  route: 'local' | 'cloud' | 'local-dp';
  reason: string;
}

function getExamples(locale: 'zh' | 'en'): Example[] {
  return locale === 'zh' ? [
    {
      query: '我的社保号码是 xxx-xx-xxxx，帮我查余额',
      entities: [{ text: 'xxx-xx-xxxx', type: 'SSN', sensitivity: 'high' as const }],
      route: 'local' as const,
      reason: '包含高敏感 PII (SSN)，必须留在本地',
    },
    {
      query: '北京今天天气怎么样',
      entities: [{ text: '北京', type: '地点', sensitivity: 'low' as const }],
      route: 'cloud' as const,
      reason: '无敏感信息，可安全上云获取更好回答',
    },
    {
      query: '我在 Acme Corp 的工资是多少',
      entities: [
        { text: 'Acme Corp', type: '公司', sensitivity: 'medium' as const },
        { text: '工资', type: '财务', sensitivity: 'high' as const },
      ],
      route: 'local-dp' as const,
      reason: '含中/高敏感信息，本地处理 + 差分隐私保护',
    },
  ] : [
    {
      query: 'My SSN is xxx-xx-xxxx, check my balance',
      entities: [{ text: 'xxx-xx-xxxx', type: 'SSN', sensitivity: 'high' as const }],
      route: 'local' as const,
      reason: 'Contains high-sensitivity PII (SSN), must stay local',
    },
    {
      query: 'What is the weather in Beijing today',
      entities: [{ text: 'Beijing', type: 'Location', sensitivity: 'low' as const }],
      route: 'cloud' as const,
      reason: 'No sensitive info, safe to use cloud for better response',
    },
    {
      query: 'What is my salary at Acme Corp',
      entities: [
        { text: 'Acme Corp', type: 'Company', sensitivity: 'medium' as const },
        { text: 'salary', type: 'Financial', sensitivity: 'high' as const },
      ],
      route: 'local-dp' as const,
      reason: 'Contains medium/high sensitivity info, local processing + differential privacy',
    },
  ];
}

export default function PrivacyRoutingFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'PRISM: 隐私敏感度路由',
      query: 'Query',
      entityDetection: '实体检测',
      entitiesCount: '个实体',
      sensitivityScoring: '敏感度评分',
      max: 'max',
      detectedEntities: '检测到的实体:',
      entityType: '类型',
      sensitivity: '敏感度',
      routeDecision: '路由决策',
      local: '🔒 本地处理',
      cloud: '☁️ 云端处理',
      localDp: '🔒+DP 本地+差分隐私',
      prismTitle: 'PRISM (AAAI 2026) 核心机制',
      mechanism1: '1. 实体级敏感度检测 — 不是整个 query 判断，而是精确到每个实体',
      mechanism2: '2. 自适应差分隐私 — 对必须上云的敏感数据添加 ε-DP 噪声保护',
      mechanism3: '3. 离线场景自动降级 — 断网时本地模型是唯一选择',
    },
    en: {
      title: 'PRISM: Privacy-Sensitive Routing',
      query: 'Query',
      entityDetection: 'Entity Detection',
      entitiesCount: 'entities',
      sensitivityScoring: 'Sensitivity Scoring',
      max: 'max',
      detectedEntities: 'Detected Entities:',
      entityType: 'Type',
      sensitivity: 'Sensitivity',
      routeDecision: 'Route Decision',
      local: '🔒 Local Processing',
      cloud: '☁️ Cloud Processing',
      localDp: '🔒+DP Local + Differential Privacy',
      prismTitle: 'PRISM (AAAI 2026) Core Mechanisms',
      mechanism1: '1. Entity-level sensitivity detection — Not whole query, but precise per entity',
      mechanism2: '2. Adaptive differential privacy — Add ε-DP noise to sensitive data that must go to cloud',
      mechanism3: '3. Offline auto-fallback — Local model is the only choice when offline',
    },
  }[locale];

  const [exIdx, setExIdx] = useState(0);
  const EXAMPLES = getExamples(locale);
  const ex = EXAMPLES[exIdx];

  const W = 580, H = 380;

  const routeColors = { local: COLORS.green, cloud: COLORS.primary, 'local-dp': COLORS.orange };
  const routeLabels = { local: t.local, cloud: t.cloud, 'local-dp': t.localDp };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
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
          <text x="60" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>{t.query}</text>
          <text x="60" y="35" textAnchor="middle" fontFamily={FONTS.sans} fontSize="8" fill={COLORS.mid}>
            {ex.query.length > 18 ? ex.query.slice(0, 18) + '…' : ex.query}
          </text>

          <text x="125" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

          {/* Step 2: Entity Detection */}
          <rect x="140" y="0" width="120" height="45" rx="4" fill={COLORS.bgAlt} stroke={COLORS.orange} strokeWidth="1.5" />
          <text x="200" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>{t.entityDetection}</text>
          <text x="200" y="35" textAnchor="middle" fontFamily={FONTS.mono} fontSize="8" fill={COLORS.orange}>
            {ex.entities.length} {t.entitiesCount}
          </text>

          <text x="265" y="22" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.primary}>→</text>

          {/* Step 3: Sensitivity Scoring */}
          <rect x="280" y="0" width="120" height="45" rx="4" fill={COLORS.bgAlt} stroke={COLORS.red} strokeWidth="1.5" />
          <text x="340" y="18" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.dark}>{t.sensitivityScoring}</text>
          <text x="340" y="35" textAnchor="middle" fontFamily={FONTS.mono} fontSize="8" fill={COLORS.red}>
            {t.max}: {ex.entities.reduce((a, e) => e.sensitivity === 'high' ? 'high' : a, ex.entities[0].sensitivity)}
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
            {t.detectedEntities}
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
                  {t.entityType}: {ent.type} · {t.sensitivity}: {ent.sensitivity}
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
            {t.routeDecision}: {routeLabels[ex.route as keyof typeof routeLabels]}
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
            {t.prismTitle}
          </text>
          <text x="15" y="38" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {t.mechanism1}
          </text>
          <text x="15" y="54" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {t.mechanism2}
          </text>
          <text x="15" y="70" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {t.mechanism3}
          </text>
        </g>
      </svg>
    </div>
  );
}
