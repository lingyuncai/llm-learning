import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Philosophy = 'select' | 'synthesize';

export default function SelectVsSynthesize() {
  const [mode, setMode] = useState<Philosophy>('select');

  const W = 580, H = 340;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          两种哲学：选一个 vs 综合多个
        </text>

        {/* Toggle */}
        <g transform="translate(160, 38)">
          {(['select', 'synthesize'] as Philosophy[]).map((p, i) => (
            <g key={p}>
              <rect x={i * 140} y="0" width="130" height="28" rx="4"
                    fill={mode === p ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(p)} />
              <text x={i * 140 + 65} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11"
                    fontWeight={mode === p ? "700" : "400"}
                    fill={mode === p ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {p === 'select' ? '选一个 (Routing)' : '综合多个 (MoA)'}
              </text>
            </g>
          ))}
        </g>

        {mode === 'select' ? (
          <g transform="translate(30, 80)">
            {/* Query → Router → One model */}
            <rect x="0" y="30" width="80" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
            <text x="40" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Query</text>

            <text x="85" y="55" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

            <rect x="100" y="20" width="100" height="60" rx="6"
                  fill={COLORS.primary} opacity="0.12" stroke={COLORS.primary} strokeWidth="2" />
            <text x="150" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.primary}>Router</text>

            <text x="205" y="55" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.primary}>→</text>

            {/* 3 models, 1 selected */}
            {['GPT-4', 'Claude', 'Llama'].map((m, i) => {
              const selected = i === 0;
              return (
                <g key={m} transform={`translate(220, ${i * 35})`}>
                  <rect x="0" y="0" width="90" height="28" rx="4"
                        fill={selected ? COLORS.green : COLORS.light}
                        stroke={selected ? COLORS.green : COLORS.mid}
                        strokeWidth={selected ? 2 : 1} />
                  <text x="45" y="19" textAnchor="middle" fontFamily={FONTS.sans}
                        fontSize="10" fill={selected ? '#fff' : COLORS.mid}>
                    {m} {selected ? '✓' : ''}
                  </text>
                </g>
              );
            })}

            <text x="315" y="20" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.green}>→</text>

            <rect x="340" y="5" width="100" height="35" rx="4" fill={COLORS.valid} stroke={COLORS.green} strokeWidth="1.5" />
            <text x="390" y="27" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>1 个回答</text>

            {/* Properties */}
            <g transform="translate(0, 120)">
              <rect x="0" y="0" width="520" height="90" rx="6"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x="20" y="22" fontFamily={FONTS.sans} fontSize="12" fontWeight="700" fill={COLORS.primary}>
                Routing 假设：存在一个"最佳模型"
              </text>
              <text x="20" y="44" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green}>
                ✓ 成本最低（只调用一个模型）
              </text>
              <text x="20" y="62" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green}>
                ✓ 延迟最低（单次推理）
              </text>
              <text x="20" y="80" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.red}>
                ✗ 质量受限于 router 的准确性和单个模型的能力上限
              </text>
            </g>
          </g>
        ) : (
          <g transform="translate(30, 80)">
            {/* Query → All models → Synthesizer → Output */}
            <rect x="0" y="30" width="80" height="40" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
            <text x="40" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>Query</text>

            <text x="85" y="55" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.orange}>→</text>

            {/* All 3 models in parallel */}
            {['GPT-4', 'Claude', 'Llama'].map((m, i) => (
              <g key={m} transform={`translate(100, ${i * 35})`}>
                <rect x="0" y="0" width="90" height="28" rx="4"
                      fill={[COLORS.purple, COLORS.primary, COLORS.green][i]}
                      opacity="0.15"
                      stroke={[COLORS.purple, COLORS.primary, COLORS.green][i]}
                      strokeWidth="1.5" />
                <text x="45" y="19" textAnchor="middle" fontFamily={FONTS.sans}
                      fontSize="10" fill={COLORS.dark}>
                  {m} ✓
                </text>
              </g>
            ))}

            <g transform="translate(195, 0)">
              {[0, 1, 2].map(i => (
                <text key={i} x="0" y={15 + i * 35} fontFamily={FONTS.sans} fontSize="14" fill={COLORS.orange}>→</text>
              ))}
            </g>

            <rect x="215" y="15" width="110" height="70" rx="6"
                  fill={COLORS.orange} opacity="0.12" stroke={COLORS.orange} strokeWidth="2" />
            <text x="270" y="45" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.orange}>
              Synthesizer
            </text>
            <text x="270" y="62" textAnchor="middle" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
              综合层
            </text>

            <text x="330" y="55" fontFamily={FONTS.sans} fontSize="16" fill={COLORS.orange}>→</text>

            <rect x="345" y="25" width="100" height="50" rx="4"
                  fill="#fef3c7" stroke={COLORS.orange} strokeWidth="2" />
            <text x="395" y="48" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
              综合回答
            </text>
            <text x="395" y="64" textAnchor="middle" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid}>
              质量 {'>'} 任何单一模型
            </text>

            {/* Properties */}
            <g transform="translate(0, 120)">
              <rect x="0" y="0" width="520" height="90" rx="6"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x="20" y="22" fontFamily={FONTS.sans} fontSize="12" fontWeight="700" fill={COLORS.orange}>
                MoA 假设：没有单一最佳，组合才最好
              </text>
              <text x="20" y="44" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green}>
                ✓ 质量超越任何单一模型（35.9% 幻觉降低 — Council Mode）
              </text>
              <text x="20" y="62" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.red}>
                ✗ 成本线性增长（N 个模型 = N 倍成本）
              </text>
              <text x="20" y="80" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.red}>
                ✗ 延迟 = max(所有模型) + 综合时间
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
