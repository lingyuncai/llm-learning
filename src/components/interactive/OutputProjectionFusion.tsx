// src/components/interactive/OutputProjectionFusion.tsx
import StepNavigator from '../primitives/StepNavigator';
import { HEAD_COLORS, COLORS } from './shared/colors';

const h = 4;
const dk = 3;
const H = h * dk;

function ColorBar({ segments, label }: {
  segments: { color: string; width: number; values?: string[] }[];
  label: string;
}) {
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

export default function OutputProjectionFusion() {
  const steps = [
    {
      title: '各 Head 独立输出',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {h} 个 head 各自计算 Attention 后得到 (d<sub>k</sub>={dk}) 维的输出向量，
            每个 head 用不同颜色标识。
          </p>
          <div className="flex flex-col gap-3 items-center">
            {Array.from({ length: h }, (_, i) => (
              <ColorBar key={i}
                label={`Head ${i} output (d_k=${dk})`}
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
      title: 'Concat — 拼接为 (H) 向量',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            transpose + reshape：将 {h} 个 head 的输出拼接成一个 H={H} 维向量。
            颜色条拼在一起，每段仍可辨识来源 head。
          </p>
          <ColorBar
            label={`Concat output (H=${H})`}
            segments={Array.from({ length: h }, (_, i) => ({
              color: HEAD_COLORS[i],
              width: dk,
              values: Array.from({ length: dk }, (_, d) => `h${i}d${d}`),
            }))}
          />
          <div className="mt-2 text-xs text-gray-500 text-center">
            此时各 head 信息只是简单堆叠，尚未交互
          </div>
        </div>
      ),
    },
    {
      title: 'W_O 投影 — 信息融合',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            通过 W<sup>O</sup> ∈ ℝ<sup>(H×H)</sup> 线性投影，不同 head 的信息发生混合。
            输出向量变为统一颜色 — 多头信息已被融合。
          </p>
          <div className="flex flex-col items-center gap-3">
            <ColorBar
              label="拼接输入"
              segments={Array.from({ length: h }, (_, i) => ({
                color: HEAD_COLORS[i],
                width: dk,
              }))}
            />
            <div className="text-lg text-gray-400">↓ × W<sup>O</sup></div>
            <ColorBar
              label={`融合输出 (H=${H})`}
              segments={[{
                color: COLORS.purple,
                width: H,
                values: Array.from({ length: H }, (_, d) => `o${d}`),
              }]}
            />
          </div>
          <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-800">
            <strong>关键：</strong>W<sup>O</sup> 不是简单拼接 — 它是一个学习到的线性组合，
            让各 head 的专家意见融合为最终决策。输出的每个维度都包含了所有 head 的信息。
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
