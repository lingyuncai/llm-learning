import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface MethodLatency {
  name: string;
  overhead_ms: number;
  detail: string;
  category: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

const createData = (locale: 'zh' | 'en'): MethodLatency[] => {
  const t = {
    zh: {
      semanticRouter: { detail: 'Embedding cosine 匹配，几乎无额外延迟', category: '分类器' },
      bertRouter: { detail: 'BERT 推理 ~15ms，可在 CPU 上运行', category: '分类器' },
      mfRouter: { detail: '矩阵乘法 + 阈值判断', category: '分类器' },
      causalLmRouter: { detail: '小 LM 推理 ~50ms，需要 GPU', category: '分类器' },
      selfVerification: { detail: '需要生成 + 自评，可能多次调用', category: '级联' },
      llmAsJudge: { detail: '额外一次 LLM 调用评估质量', category: '级联' },
      councilMode: { detail: '并行调用，延迟 = 最慢模型（非额外开销）', category: 'MoA' },
      tokenLevelHybrid: { detail: '每 token 置信度判断，累积开销', category: '混合' },
    },
    en: {
      semanticRouter: { detail: 'Embedding cosine matching, negligible latency', category: 'Classifier' },
      bertRouter: { detail: 'BERT inference ~15ms, runs on CPU', category: 'Classifier' },
      mfRouter: { detail: 'Matrix multiplication + threshold', category: 'Classifier' },
      causalLmRouter: { detail: 'Small LM inference ~50ms, requires GPU', category: 'Classifier' },
      selfVerification: { detail: 'Generation + self-evaluation, possibly multiple calls', category: 'Cascade' },
      llmAsJudge: { detail: 'Additional LLM call for quality assessment', category: 'Cascade' },
      councilMode: { detail: 'Parallel calls, latency = slowest model (not additional overhead)', category: 'MoA' },
      tokenLevelHybrid: { detail: 'Per-token confidence judgment, cumulative overhead', category: 'Hybrid' },
    },
  }[locale];

  return [
    { name: 'Semantic Router', overhead_ms: 5, detail: t.semanticRouter.detail, category: t.semanticRouter.category },
    { name: 'BERT Router', overhead_ms: 15, detail: t.bertRouter.detail, category: t.bertRouter.category },
    { name: 'MF Router', overhead_ms: 10, detail: t.mfRouter.detail, category: t.mfRouter.category },
    { name: 'Causal LM Router', overhead_ms: 50, detail: t.causalLmRouter.detail, category: t.causalLmRouter.category },
    { name: 'Self-Verification', overhead_ms: 200, detail: t.selfVerification.detail, category: t.selfVerification.category },
    { name: 'LLM-as-Judge', overhead_ms: 500, detail: t.llmAsJudge.detail, category: t.llmAsJudge.category },
    { name: 'Council Mode', overhead_ms: 0, detail: t.councilMode.detail, category: t.councilMode.category },
    { name: 'Token-level Hybrid', overhead_ms: 30, detail: t.tokenLevelHybrid.detail, category: t.tokenLevelHybrid.category },
  ];
};

const MAX_MS = 600;

export default function LatencyOverheadBar({ locale = 'zh' }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const DATA = createData(locale);

  const t = {
    zh: {
      title: '路由方法额外延迟开销',
      subtitle: '不含模型推理时间，仅路由决策本身的延迟',
      parallel: '0ms (并行)',
    },
    en: {
      title: 'Routing Method Latency Overhead',
      subtitle: 'Excludes model inference time, only routing decision latency',
      parallel: '0ms (parallel)',
    },
  }[locale];

  const W = 580, barH = 28, gap = 6;
  const labelW = 140, barL = 155, barR = 530, barW = barR - barL;
  const H = 60 + DATA.length * (barH + gap) + 60;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {DATA.map((d, i) => {
          const y = 60 + i * (barH + gap);
          const w = (d.overhead_ms / MAX_MS) * barW;
          const isHovered = hovered === d.name;
          const barColor = d.overhead_ms < 20 ? COLORS.green
            : d.overhead_ms < 100 ? COLORS.orange : COLORS.red;

          return (
            <g key={d.name}
               onMouseEnter={() => setHovered(d.name)}
               onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              <text x={labelW} y={y + barH / 2 + 4} textAnchor="end"
                    fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {d.name}
              </text>
              <rect x={barL} y={y} width={barW} height={barH} rx="3"
                    fill={COLORS.light} />
              <rect x={barL} y={y} width={Math.max(w, 4)} height={barH} rx="3"
                    fill={barColor} opacity={isHovered ? 1 : 0.8} />
              <text x={barL + Math.max(w, 4) + 6} y={y + barH / 2 + 4}
                    fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>
                {d.overhead_ms === 0 ? t.parallel : `~${d.overhead_ms}ms`}
              </text>
            </g>
          );
        })}

        {/* Hover detail */}
        {hovered && (() => {
          const d = DATA.find(d => d.name === hovered)!;
          const y = 60 + DATA.length * (barH + gap) + 10;
          return (
            <g>
              <rect x="40" y={y} width="500" height="32" rx="4"
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
              <text x="50" y={y + 20} fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                {d.name}：{d.detail}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
