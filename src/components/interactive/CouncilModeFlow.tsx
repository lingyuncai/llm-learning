import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const MODELS = [
  { name: 'GPT-4o', answer: '量子纠缠是一种量子力学现象...', quality: 92, color: '#6a1b9a' },
  { name: 'Claude 3.5', answer: '量子纠缠指两个粒子之间的关联...', quality: 90, color: '#1565c0' },
  { name: 'Gemini 1.5', answer: '在量子力学中，纠缠态描述了...', quality: 88, color: '#2e7d32' },
];

type SynthMode = 'merge' | 'vote' | 'best-of-n';

export default function CouncilModeFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Council Mode: 多 LLM 并行综合',
      query: 'Query',
      quality: '质量',
      synthesisLayer: '综合层',
      synthesisAnswer: '综合回答',
      cost: '成本: 3 个模型并行 = 3× 单模型成本 + 综合层成本',
      latency: '延迟: max(3 个模型延迟) + 综合时间 ≈ 最慢模型 × 1.2',
      moaNote: 'MoA ≠ MoE: MoA 是多个完整 LLM 协作，MoE 是单个模型内部的专家路由',
      synthLabels: {
        merge: '综合合并',
        vote: '多数投票',
        'best-of-n': 'Best-of-N',
      },
      synthDetails: {
        merge: 'Council Mode: 综合所有回答的优点，生成新的统一回答。35.9% 幻觉降低。',
        vote: '多数决: 多个模型给出相同结论则采纳，减少个别模型的错误。',
        'best-of-n': '生成 N 个回答，用评估器选最好的一个。成本 = N × 单次推理。',
      },
    },
    en: {
      title: 'Council Mode: Multi-LLM Parallel Synthesis',
      query: 'Query',
      quality: 'Quality',
      synthesisLayer: 'Synthesis Layer',
      synthesisAnswer: 'Synthesized Answer',
      cost: 'Cost: 3 parallel models = 3× single model cost + synthesis cost',
      latency: 'Latency: max(3 model latencies) + synthesis time ≈ slowest model × 1.2',
      moaNote: 'MoA ≠ MoE: MoA is multi-LLM collaboration, MoE is intra-model expert routing',
      synthLabels: {
        merge: 'Merge',
        vote: 'Vote',
        'best-of-n': 'Best-of-N',
      },
      synthDetails: {
        merge: 'Council Mode: Synthesizes advantages of all answers into unified response. 35.9% hallucination reduction.',
        vote: 'Majority vote: Adopt consensus, reduce individual model errors.',
        'best-of-n': 'Generate N answers, evaluator picks best. Cost = N × single inference.',
      },
    },
  }[locale];

  const [synthMode, setSynthMode] = useState<SynthMode>('merge');

  const W = 580, H = 360;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Synth mode selector */}
        <g transform="translate(115, 38)">
          {(['merge', 'vote', 'best-of-n'] as SynthMode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 125} y="0" width="115" height="26" rx="4"
                    fill={synthMode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1"
                    style={{ cursor: 'pointer' }} onClick={() => setSynthMode(m)} />
              <text x={i * 125 + 57.5} y="17" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="10"
                    fontWeight={synthMode === m ? "700" : "400"}
                    fill={synthMode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {t.synthLabels[m]}
              </text>
            </g>
          ))}
        </g>

        {/* Flow: Query → 3 Models in parallel → Synthesizer → Output */}
        <g transform="translate(15, 80)">
          {/* Query */}
          <rect x="0" y="40" width="70" height="35" rx="4" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="35" y="62" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>{t.query}</text>

          {/* Arrows to models */}
          {MODELS.map((_, i) => (
            <line key={i} x1="70" y1="57" x2="100" y2={15 + i * 45 + 17}
                  stroke={COLORS.mid} strokeWidth="1" markerEnd="url(#arrow-council)" />
          ))}

          {/* Models */}
          {MODELS.map((m, i) => (
            <g key={m.name} transform={`translate(100, ${15 + i * 45})`}>
              <rect x="0" y="0" width="130" height="35" rx="4"
                    fill={m.color} opacity="0.12" stroke={m.color} strokeWidth="1.5" />
              <text x="65" y="15" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="10" fontWeight="600" fill={m.color}>
                {m.name}
              </text>
              <text x="65" y="28" textAnchor="middle" fontFamily={FONTS.mono}
                    fontSize="8" fill={COLORS.mid}>
                {t.quality}: {m.quality}%
              </text>
            </g>
          ))}

          {/* Arrows to synthesizer */}
          {MODELS.map((_, i) => (
            <line key={`s-${i}`} x1="230" y1={15 + i * 45 + 17}
                  x2="265" y2="57"
                  stroke={COLORS.mid} strokeWidth="1" markerEnd="url(#arrow-council)" />
          ))}

          {/* Synthesizer */}
          <rect x="265" y="30" width="110" height="55" rx="6"
                fill={COLORS.orange} opacity="0.12" stroke={COLORS.orange} strokeWidth="2" />
          <text x="320" y="52" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="11" fontWeight="700" fill={COLORS.orange}>
            {t.synthLabels[synthMode]}
          </text>
          <text x="320" y="72" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="8" fill={COLORS.mid}>
            {t.synthesisLayer}
          </text>

          {/* Arrow to output */}
          <line x1="375" y1="57" x2="400" y2="57"
                stroke={COLORS.mid} strokeWidth="1" markerEnd="url(#arrow-council)" />

          {/* Output */}
          <rect x="400" y="35" width="130" height="45" rx="4"
                fill="#fef3c7" stroke={COLORS.orange} strokeWidth="2" />
          <text x="465" y="55" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="11" fontWeight="600" fill={COLORS.dark}>
            {t.synthesisAnswer}
          </text>
          <text x="465" y="70" textAnchor="middle" fontFamily={FONTS.mono}
                fontSize="9" fill={COLORS.green}>
            {t.quality}: {synthMode === 'merge' ? '96' : synthMode === 'vote' ? '93' : '94'}%
          </text>

          <defs>
            <marker id="arrow-council" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>
        </g>

        {/* Detail */}
        <g transform="translate(30, 225)">
          <rect x="0" y="0" width="520" height="50" rx="4"
                fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
          <text x="15" y="20" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.primary}>
            {t.synthLabels[synthMode]}
          </text>
          <text x="15" y="40" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {t.synthDetails[synthMode]}
          </text>
        </g>

        {/* Cost note */}
        <g transform="translate(30, 290)">
          <rect x="0" y="0" width="520" height="48" rx="4"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="15" y="18" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {t.cost}
          </text>
          <text x="15" y="34" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {t.latency}
          </text>
          <text x="15" y="46" fontFamily={FONTS.mono} fontSize="8" fill={COLORS.mid}>
            {t.moaNote}
          </text>
        </g>
      </svg>
    </div>
  );
}
