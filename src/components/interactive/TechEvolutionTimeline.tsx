import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

interface Milestone {
  date: string;
  label: string;
  desc: string;
  engine: string;
  color: string;
}

interface MilestoneData {
  zh: Milestone[];
  en: Milestone[];
}

const MILESTONE_DATA: MilestoneData = {
  zh: [
    { date: '2022.06', label: 'Orca', desc: 'Iteration-level scheduling 开创 continuous batching', engine: 'Microsoft', color: COLORS.primary },
    { date: '2023.06', label: 'vLLM', desc: 'PagedAttention — 虚拟内存思想管理 KV Cache', engine: 'UC Berkeley', color: COLORS.primary },
    { date: '2023.10', label: 'SGLang', desc: 'RadixAttention + 结构化 LLM 编程模型', engine: 'LMSYS', color: COLORS.green },
    { date: '2023.12', label: 'TRT-LLM', desc: 'NVIDIA 官方推理框架，FP8 + inflight batching', engine: 'NVIDIA', color: COLORS.purple },
    { date: '2024.03', label: 'Chunked Prefill', desc: 'Sarathi: prefill 分块与 decode 混合调度', engine: 'Microsoft', color: COLORS.orange },
    { date: '2024.06', label: 'SGLang FSM', desc: 'Compressed FSM — 结构化输出 jump-forward 加速', engine: 'LMSYS', color: COLORS.green },
    { date: '2024.09', label: 'vLLM v2', desc: '前缀缓存、多模态、disaggregated prefill', engine: 'vLLM Team', color: COLORS.primary },
    { date: '2025.01', label: '框架融合', desc: '各引擎互相吸收对方核心技术，功能趋同', engine: '社区', color: COLORS.mid },
  ],
  en: [
    { date: '2022.06', label: 'Orca', desc: 'Iteration-level scheduling pioneered continuous batching', engine: 'Microsoft', color: COLORS.primary },
    { date: '2023.06', label: 'vLLM', desc: 'PagedAttention — Virtual memory for KV Cache management', engine: 'UC Berkeley', color: COLORS.primary },
    { date: '2023.10', label: 'SGLang', desc: 'RadixAttention + Structured LLM programming model', engine: 'LMSYS', color: COLORS.green },
    { date: '2023.12', label: 'TRT-LLM', desc: 'NVIDIA official inference, FP8 + inflight batching', engine: 'NVIDIA', color: COLORS.purple },
    { date: '2024.03', label: 'Chunked Prefill', desc: 'Sarathi: chunked prefill mixed with decode scheduling', engine: 'Microsoft', color: COLORS.orange },
    { date: '2024.06', label: 'SGLang FSM', desc: 'Compressed FSM — Jump-forward for structured outputs', engine: 'LMSYS', color: COLORS.green },
    { date: '2024.09', label: 'vLLM v2', desc: 'Prefix caching, multimodal, disaggregated prefill', engine: 'vLLM Team', color: COLORS.primary },
    { date: '2025.01', label: 'Framework Convergence', desc: 'Engines adopt each other\'s core tech, features converge', engine: 'Community', color: COLORS.mid },
  ],
};

const TIMELINE_X = 100;
const TIMELINE_W = 400;
const TIMELINE_Y = 70;
const ITEM_H = 32;

export default function TechEvolutionTimeline({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const t = {
    zh: {
      title: 'LLM 推理引擎技术演进',
      hover: 'Hover 查看里程碑详情',
    },
    en: {
      title: 'LLM Inference Engine Evolution',
      hover: 'Hover to view milestone details',
    },
  }[locale];

  const MILESTONES = MILESTONE_DATA[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.hover}
      </text>

      {/* Vertical timeline line */}
      <line x1={TIMELINE_X} y1={TIMELINE_Y}
        x2={TIMELINE_X} y2={TIMELINE_Y + MILESTONES.length * ITEM_H}
        stroke={COLORS.light} strokeWidth="2" />

      {/* Milestones */}
      {MILESTONES.map((m, i) => {
        const y = TIMELINE_Y + i * ITEM_H;
        const isHovered = hovered === i;
        return (
          <g key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            cursor="pointer">
            {/* Background highlight */}
            {isHovered && (
              <rect x={TIMELINE_X - 10} y={y - 2} width={TIMELINE_W + 20} height={ITEM_H}
                fill={COLORS.highlight} rx={4} />
            )}
            {/* Dot */}
            <circle cx={TIMELINE_X} cy={y + ITEM_H / 2} r={5}
              fill={m.color} stroke="#fff" strokeWidth="2" />
            {/* Date */}
            <text x={TIMELINE_X - 15} y={y + ITEM_H / 2 + 4} textAnchor="end"
              fontSize="9" fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {m.date}
            </text>
            {/* Label + engine */}
            <text x={TIMELINE_X + 18} y={y + ITEM_H / 2 + 4} fontSize="11"
              fontWeight={isHovered ? '700' : '500'} fill={m.color} fontFamily={FONTS.sans}>
              {m.label}
            </text>
            <text x={TIMELINE_X + 18 + m.label.length * 8 + 10} y={y + ITEM_H / 2 + 4}
              fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
              ({m.engine})
            </text>
          </g>
        );
      })}

      {/* Detail box for hovered item */}
      {hovered !== null && (
        <g>
          <rect x={80} y={H - 60} width={W - 160} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={MILESTONES[hovered].color} strokeWidth="1.5" />
          <text x={W / 2} y={H - 36} textAnchor="middle" fontSize="11"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {MILESTONES[hovered].desc}
          </text>
        </g>
      )}
    </svg>
  );
}
