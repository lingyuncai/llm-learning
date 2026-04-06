import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Granularity = 'query' | 'subtask' | 'token';

const MODES: { id: Granularity; label: string; desc: string; pros: string; cons: string }[] = [
  {
    id: 'query',
    label: 'Query-level',
    desc: '整个请求选一个模型',
    pros: '简单高效、低延迟开销',
    cons: '无法处理 query 内部复杂度差异',
  },
  {
    id: 'subtask',
    label: 'Subtask-level',
    desc: '拆分子任务，各自路由',
    pros: '每个子任务最优匹配',
    cons: '需要任务分解能力',
  },
  {
    id: 'token',
    label: 'Token-level',
    desc: '逐 token 决定用哪个模型',
    pros: '最细粒度，理论最优',
    cons: '开销大，实现复杂',
  },
];

export default function RoutingGranularityCompare() {
  const [active, setActive] = useState<Granularity>('query');

  const W = 580, H = 380;

  // Tokens for animation
  const tokens = ['请', '帮', '我', '翻', '译', '这', '段', '代', '码'];

  const getTokenColor = (idx: number, mode: Granularity) => {
    if (mode === 'query') return COLORS.primary; // all same model
    if (mode === 'subtask') return idx < 4 ? COLORS.green : COLORS.purple; // 2 subtasks
    // token-level: alternating based on "difficulty"
    return [COLORS.green, COLORS.green, COLORS.primary, COLORS.green, COLORS.primary, COLORS.green, COLORS.green, COLORS.purple, COLORS.purple][idx];
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          路由粒度对比
        </text>

        {/* Mode tabs */}
        <g transform="translate(130, 40)">
          {MODES.map((m, i) => (
            <g key={m.id}>
              <rect x={i * 110} y="0" width="100" height="28" rx="4"
                    fill={active === m.id ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActive(m.id)} />
              <text x={i * 110 + 50} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={active === m.id ? "700" : "400"}
                    fill={active === m.id ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {m.label}
              </text>
            </g>
          ))}
        </g>

        {/* Token flow visualization */}
        <g transform="translate(40, 90)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12"
                fontWeight="600" fill={COLORS.dark}>
            输入 Query
          </text>
          <g transform="translate(0, 10)">
            {tokens.map((t, i) => (
              <g key={i}>
                <rect x={i * 55} y="0" width="48" height="32" rx="4"
                      fill={getTokenColor(i, active)}
                      opacity="0.15" stroke={getTokenColor(i, active)} strokeWidth="1.5" />
                <text x={i * 55 + 24} y="21" textAnchor="middle"
                      fontFamily={FONTS.sans} fontSize="13" fill={getTokenColor(i, active)}>
                  {t}
                </text>
              </g>
            ))}
          </g>

          {/* Legend */}
          <g transform="translate(0, 55)">
            {active === 'query' && (
              <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
                ● 所有 token → 同一个模型
              </text>
            )}
            {active === 'subtask' && (
              <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
                ● 子任务1 "请帮我翻译" → 模型A（绿色） · 子任务2 "这段代码" → 模型B（紫色）
              </text>
            )}
            {active === 'token' && (
              <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
                ● 每个 token 独立判断：绿=本地模型 · 蓝=中等模型 · 紫=云端强模型
              </text>
            )}
          </g>
        </g>

        {/* Detail card */}
        {(() => {
          const m = MODES.find(m => m.id === active)!;
          return (
            <g transform="translate(40, 220)">
              <rect x="0" y="0" width="500" height="140" rx="6"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x="20" y="28" fontFamily={FONTS.sans} fontSize="14"
                    fontWeight="700" fill={COLORS.dark}>
                {m.label}
              </text>
              <text x="20" y="50" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>
                {m.desc}
              </text>
              <text x="20" y="80" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.green}>
                ✓ 优势：{m.pros}
              </text>
              <text x="20" y="105" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.red}>
                ✗ 劣势：{m.cons}
              </text>
              <text x="20" y="128" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                {active === 'query' ? '代表：RouteLLM, FrugalGPT, 大多数路由系统'
                  : active === 'subtask' ? '代表：HybridFlow (2025), Agent 任务编排'
                  : '代表：Token-level Hybrid (2024), Speculative Decoding 变体'}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
