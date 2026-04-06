import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Arch = 'consroute' | 'hybridflow' | 'apple';

const ARCHS: { id: Arch; name: string; year: string; approach: string; granularity: string; keyFeature: string; result: string; color: string }[] = [
  {
    id: 'consroute', name: 'ConsRoute', year: '2026',
    approach: 'Reranker 评估语义一致性',
    granularity: 'Query-level',
    keyFeature: '用 reranker 判断本地回答是否与 query 一致，不一致则升级到 cloud',
    result: '40% 延迟+成本降低，cloud-edge-device 三级路由',
    color: COLORS.green,
  },
  {
    id: 'hybridflow', name: 'HybridFlow', year: '2025',
    approach: 'Subtask-level DAG 路由',
    granularity: 'Subtask-level',
    keyFeature: '将复杂任务拆解为 DAG，每个子任务独立决定 local/cloud',
    result: '适合多步 agent 任务，每步独立路由',
    color: COLORS.primary,
  },
  {
    id: 'apple', name: 'Apple Intelligence', year: '2024',
    approach: 'On-device 默认 + Private Cloud Compute',
    granularity: 'Query-level',
    keyFeature: '小模型 on-device 优先，超出能力走 PCC（苹果自有安全云）',
    result: '产品化标杆：10 亿+ 设备部署，隐私保证',
    color: COLORS.orange,
  },
];

export default function HybridArchCompare() {
  const [active, setActive] = useState<Arch>('consroute');

  const W = 580, H = 380;
  const a = ARCHS.find(a => a.id === active)!;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Hybrid LLM 架构对比
        </text>

        {/* Tabs */}
        <g transform="translate(95, 38)">
          {ARCHS.map((ar, i) => (
            <g key={ar.id}>
              <rect x={i * 140} y="0" width="130" height="28" rx="4"
                    fill={active === ar.id ? ar.color : COLORS.bgAlt}
                    stroke={ar.color} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setActive(ar.id)} />
              <text x={i * 140 + 65} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={active === ar.id ? "700" : "400"}
                    fill={active === ar.id ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {ar.name} ({ar.year})
              </text>
            </g>
          ))}
        </g>

        {/* Architecture flow */}
        <g transform="translate(30, 80)">
          {/* Common: Query → Router/Evaluator → Local or Cloud */}
          <rect x="0" y="10" width="80" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="40" y="35" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Query</text>

          <text x="85" y="35" fontFamily={FONTS.sans} fontSize="16" fill={a.color}>→</text>

          <rect x="100" y="0" width="130" height="60" rx="6"
                fill={a.color} opacity="0.12" stroke={a.color} strokeWidth="2" />
          <text x="165" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={a.color}>
            {a.id === 'consroute' ? 'Reranker' : a.id === 'hybridflow' ? 'DAG Planner' : 'On-device Model'}
          </text>
          <text x="165" y="42" textAnchor="middle" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
            {a.approach}
          </text>

          {/* Split */}
          <line x1="235" y1="20" x2="280" y2="0" stroke={COLORS.green} strokeWidth="1.5" />
          <line x1="235" y1="40" x2="280" y2="60" stroke={COLORS.red} strokeWidth="1.5" />

          {/* Local */}
          <rect x="280" y="-10" width="100" height="35" rx="4"
                fill={COLORS.valid} stroke={COLORS.green} strokeWidth="1.5" />
          <text x="330" y="12" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.green}>
            🟢 本地模型
          </text>

          {/* Cloud */}
          <rect x="280" y="40" width="100" height="35" rx="4"
                fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1.5" />
          <text x="330" y="62" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.red}>
            🔴 云端模型
          </text>

          <text x="385" y="12" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.green}>→</text>
          <text x="385" y="62" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.red}>→</text>

          <rect x="400" y="15" width="100" height="35" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="450" y="38" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Response</text>
        </g>

        {/* Detail card */}
        <g transform="translate(30, 165)">
          <rect x="0" y="0" width="520" height="190" rx="6"
                fill={COLORS.bgAlt} stroke={a.color} strokeWidth="1.5" />

          <text x="20" y="25" fontFamily={FONTS.sans} fontSize="14" fontWeight="700" fill={a.color}>
            {a.name} ({a.year})
          </text>

          <text x="20" y="50" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            <tspan fontWeight="600">路由粒度:</tspan> {a.granularity}
          </text>
          <text x="20" y="72" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            <tspan fontWeight="600">核心机制:</tspan>
          </text>
          <text x="20" y="90" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {a.keyFeature.length > 65 ? a.keyFeature.slice(0, 65) : a.keyFeature}
          </text>
          {a.keyFeature.length > 65 && (
            <text x="20" y="106" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {a.keyFeature.slice(65)}
            </text>
          )}

          <text x="20" y="130" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            <tspan fontWeight="600">效果:</tspan> {a.result}
          </text>

          {/* Unique features */}
          <text x="20" y="155" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>
            特色:
          </text>
          <text x="20" y="172" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {a.id === 'consroute' ? '三级路由: device → edge → cloud · 语义一致性评分无需标注数据'
            : a.id === 'hybridflow' ? 'DAG 拓扑自动规划 · 子任务级别精确路由 · 适合复杂 agent 工作流'
            : '10 亿+ 部署 · Private Cloud Compute 硬件安全 · 端到端加密 · 第三方审计'}
          </text>
        </g>
      </svg>
    </div>
  );
}
