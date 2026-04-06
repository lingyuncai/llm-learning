import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Arch = 'flat' | 'pyramid';

export default function MoAHierarchy() {
  const [arch, setArch] = useState<Arch>('flat');

  const W = 580, H = 340;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          层级 MoA 架构
        </text>

        {/* Arch toggle */}
        <g transform="translate(180, 38)">
          {(['flat', 'pyramid'] as Arch[]).map((a, i) => (
            <g key={a}>
              <rect x={i * 120} y="0" width="110" height="26" rx="4"
                    fill={arch === a ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1"
                    style={{ cursor: 'pointer' }} onClick={() => setArch(a)} />
              <text x={i * 120 + 55} y="17" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10"
                    fontWeight={arch === a ? "700" : "400"}
                    fill={arch === a ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {a === 'flat' ? 'HieraMAS 扁平' : 'Pyramid MoA'}
              </text>
            </g>
          ))}
        </g>

        {arch === 'flat' ? (
          <g transform="translate(30, 80)">
            {/* Layer 1: 4 models */}
            <text x="0" y="10" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 1</text>
            {['LLM-A', 'LLM-B', 'LLM-C', 'LLM-D'].map((m, i) => (
              <rect key={m} x={60 + i * 110} y="0" width="95" height="30" rx="4"
                    fill={COLORS.green} opacity="0.15" stroke={COLORS.green} strokeWidth="1" />
            ))}
            {['LLM-A', 'LLM-B', 'LLM-C', 'LLM-D'].map((m, i) => (
              <text key={`t-${m}`} x={60 + i * 110 + 47.5} y="20" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{m}</text>
            ))}

            {/* Layer 2: 2 aggregators */}
            <text x="0" y="65" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 2</text>
            {['Agg-1', 'Agg-2'].map((m, i) => (
              <rect key={m} x={115 + i * 220} y="55" width="110" height="30" rx="4"
                    fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="1.5" />
            ))}
            {['Agg-1', 'Agg-2'].map((m, i) => (
              <text key={`t-${m}`} x={115 + i * 220 + 55} y="75" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.primary}>{m}</text>
            ))}

            {/* Layer 3: Final aggregator */}
            <text x="0" y="120" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 3</text>
            <rect x="190" y="110" width="140" height="30" rx="4"
                  fill={COLORS.orange} opacity="0.15" stroke={COLORS.orange} strokeWidth="2" />
            <text x="260" y="130" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="700" fill={COLORS.orange}>Final Aggregator</text>

            {/* Arrows (simplified) */}
            {[0, 1].map(i => <line key={`a1-${i}`} x1={107 + i * 110} y1="30" x2={170} y2="55" stroke={COLORS.mid} strokeWidth="1" />)}
            {[2, 3].map(i => <line key={`a2-${i}`} x1={107 + i * 110} y1="30" x2={390} y2="55" stroke={COLORS.mid} strokeWidth="1" />)}
            <line x1="170" y1="85" x2="260" y2="110" stroke={COLORS.mid} strokeWidth="1" />
            <line x1="390" y1="85" x2="260" y2="110" stroke={COLORS.mid} strokeWidth="1" />

            <text x="260" y="165" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="10" fill={COLORS.mid}>
              HieraMAS: 节点内 LLM 混合 + 节点间通信
            </text>
          </g>
        ) : (
          <g transform="translate(30, 80)">
            {/* Pyramid: wide base, narrowing layers */}
            <text x="0" y="10" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 1 (广)</text>
            {['LLM-1', 'LLM-2', 'LLM-3', 'LLM-4', 'LLM-5'].map((m, i) => (
              <rect key={m} x={50 + i * 95} y="0" width="82" height="25" rx="3"
                    fill={COLORS.green} opacity="0.15" stroke={COLORS.green} strokeWidth="1" />
            ))}
            {['LLM-1', 'LLM-2', 'LLM-3', 'LLM-4', 'LLM-5'].map((m, i) => (
              <text key={`t-${m}`} x={50 + i * 95 + 41} y="17" textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>{m}</text>
            ))}

            <text x="0" y="55" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 2 (中)</text>
            {['Synth-A', 'Synth-B', 'Synth-C'].map((m, i) => (
              <rect key={m} x={100 + i * 130} y="45" width="110" height="25" rx="3"
                    fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="1" />
            ))}
            {['Synth-A', 'Synth-B', 'Synth-C'].map((m, i) => (
              <text key={`t-${m}`} x={100 + i * 130 + 55} y="62" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="9" fontWeight="600" fill={COLORS.primary}>{m}</text>
            ))}

            <text x="0" y="100" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>Layer 3 (窄)</text>
            <rect x="190" y="90" width="140" height="30" rx="4"
                  fill={COLORS.orange} opacity="0.15" stroke={COLORS.orange} strokeWidth="2" />
            <text x="260" y="110" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="700" fill={COLORS.orange}>Final Output</text>

            {/* Router */}
            <rect x="380" y="90" width="130" height="30" rx="4"
                  fill="#fef3c7" stroke={COLORS.dark} strokeWidth="1" />
            <text x="445" y="110" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="9" fill={COLORS.dark}>Decision-theoretic Router</text>

            <text x="260" y="145" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="10" fill={COLORS.mid}>
              Pyramid MoA: 层级递减 + decision-theoretic router 决定何时停止
            </text>
          </g>
        )}

        {/* Comparison box */}
        <g transform="translate(30, 240)">
          <rect x="0" y="0" width="520" height="78" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="20" y="20" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            层级 MoA vs 扁平 MoA
          </text>
          <text x="20" y="38" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            扁平 MoA: 所有模型同一层并行 → 综合。简单但质量收益有限。
          </text>
          <text x="20" y="54" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            层级 MoA: 多层逐级精炼。每层综合后传给下一层进一步提升。
          </text>
          <text x="20" y="70" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            Pyramid MoA 特色: 层级递减（5→3→1），router 决定何时已经"够好了"可以提前终止。
          </text>
        </g>
      </svg>
    </div>
  );
}
