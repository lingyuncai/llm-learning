// src/components/interactive/OutputProjectionFusion.tsx
import StepNavigator from '../primitives/StepNavigator';
import { HEAD_COLORS, COLORS } from './shared/colors';

const h = 4;
const dk = 3;
const H = h * dk;

interface ColorBarProps {
  segments: { color: string; width: number; values?: string[] }[];
  label: string;
}

function ColorBar({ segments, label }: ColorBarProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="flex border border-gray-300 rounded overflow-hidden">
        {segments.map((seg, i) => (
          <div key={i} className="flex" style={{ backgroundColor: seg.color + '44' }}>
            {(seg.values || Array(seg.width).fill('')).map((v, j) => (
              <div key={j}
                className="w-8 h-8 flex items-center justify-center text-[8px] font-mono border-r border-gray-200"
                style={{ backgroundColor: seg.color + '33' }}>
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OutputProjectionFusion({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '各 Head 独立输出',
      step1Desc: `${h} 个 head 各自计算 Attention 后得到 (d_k=${dk}) 维的输出向量，每个 head 用不同颜色标识。`,
      step1Label: (i: number) => `Head ${i} output (d_k=${dk})`,
      step2Title: 'Concat — 拼接为 (H) 向量',
      step2Desc: `transpose + reshape：将 ${h} 个 head 的输出拼接成一个 H=${H} 维向量。颜色条拼在一起，每段仍可辨识来源 head。`,
      step2Label: `Concat output (H=${H})`,
      step2Note: '此时各 head 信息只是简单堆叠，尚未交互',
      step3Title: 'W_O 投影 — 信息融合',
      step3Desc: `通过 W^O ∈ ℝ^(H×H) 线性投影，不同 head 的信息发生混合。输出向量变为统一颜色 — 多头信息已被融合。`,
      step3InputLabel: '拼接输入',
      step3OutputLabel: `融合输出 (H=${H})`,
      step3KeyPoint: '关键：',
      step3KeyDesc: 'W^O 不是简单拼接 — 它是一个学习到的线性组合，让各 head 的专家意见融合为最终决策。输出的每个维度都包含了所有 head 的信息。',
    },
    en: {
      step1Title: 'Independent Head Outputs',
      step1Desc: `${h} heads each compute Attention to get (d_k=${dk}) dimensional output vectors, each head identified by different color.`,
      step1Label: (i: number) => `Head ${i} output (d_k=${dk})`,
      step2Title: 'Concat — Concatenate to (H) Vector',
      step2Desc: `transpose + reshape: Concatenate ${h} head outputs into a single H=${H} dimensional vector. Color bars stacked together, each segment still traceable to source head.`,
      step2Label: `Concat output (H=${H})`,
      step2Note: 'At this point, head information is simply stacked, not yet interacting',
      step3Title: 'W_O Projection — Information Fusion',
      step3Desc: `Through W^O ∈ ℝ^(H×H) linear projection, information from different heads gets mixed. Output vector becomes uniform color — multi-head information is fused.`,
      step3InputLabel: 'Concat input',
      step3OutputLabel: `Fused output (H=${H})`,
      step3KeyPoint: 'Key:',
      step3KeyDesc: 'W^O is not simple concatenation — it is a learned linear combination that fuses expert opinions from all heads into final decision. Each output dimension contains information from all heads.',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step1Desc}
          </p>
          <div className="flex flex-col gap-3 items-center">
            {Array.from({ length: h }, (_, i) => (
              <ColorBar key={i}
                label={t.step1Label(i)}
                segments={[{
                  color: HEAD_COLORS[i],
                  width: dk,
                  values: Array.from({ length: dk }, (_, d) => `h${i}d${d}`),
                }]}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step2Desc}
          </p>
          <ColorBar
            label={t.step2Label}
            segments={Array.from({ length: h }, (_, i) => ({
              color: HEAD_COLORS[i],
              width: dk,
              values: Array.from({ length: dk }, (_, d) => `h${i}d${d}`),
            }))}
          />
          <div className="mt-2 text-xs text-gray-500 text-center">
            {t.step2Note}
          </div>
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step3Desc}
          </p>
          <div className="flex flex-col items-center gap-3">
            <ColorBar
              label={t.step3InputLabel}
              segments={Array.from({ length: h }, (_, i) => ({
                color: HEAD_COLORS[i],
                width: dk,
              }))}
            />
            <div className="text-lg text-gray-400">↓ × W<sup>O</sup></div>
            <ColorBar
              label={t.step3OutputLabel}
              segments={[{
                color: COLORS.purple,
                width: H,
                values: Array.from({ length: H }, (_, d) => `o${d}`),
              }]}
            />
          </div>
          <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-800">
            <strong>{t.step3KeyPoint}</strong>{t.step3KeyDesc}
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
