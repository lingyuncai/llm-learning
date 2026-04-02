import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { HEAD_COLORS, COLORS } from './shared/colors';

const h = 8;
const g = 2;
const headsPerGroup = h / g;
const cellSize = 14;
const matSize = 4;

function genWeights(seed: number): number[][] {
  let s = seed;
  const next = () => { s = (s * 16807 + 11) % 2147483647; return ((s % 200) - 100) / 100; };
  return Array.from({ length: matSize }, () =>
    Array.from({ length: matSize }, () => parseFloat(next().toFixed(2)))
  );
}

function MiniHeatmap({ data, color, label, size = 60 }: {
  data: number[][]; color: string; label: string; size?: number;
}) {
  const cs = size / matSize;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {data.map((row, i) =>
          row.map((v, j) => {
            const t = (v + 1) / 2;
            return (
              <rect key={`${i}-${j}`} x={j * cs} y={i * cs} width={cs - 0.5} height={cs - 0.5}
                fill={color} opacity={0.2 + t * 0.7} rx={1} />
            );
          })
        )}
      </svg>
      <span className="text-[8px] text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

export default function UptrainingPooling() {
  const allWeights = useMemo(() =>
    Array.from({ length: h }, (_, i) => genWeights(42 + i * 17)), []);

  const pooled = useMemo(() =>
    Array.from({ length: g }, (_, gi) => {
      const groupStart = gi * headsPerGroup;
      return Array.from({ length: matSize }, (_, r) =>
        Array.from({ length: matSize }, (_, c) => {
          let sum = 0;
          for (let hi = groupStart; hi < groupStart + headsPerGroup; hi++) {
            sum += allWeights[hi][r][c];
          }
          return parseFloat((sum / headsPerGroup).toFixed(2));
        })
      );
    }), [allWeights]);

  const steps = [
    {
      title: `Step 1: ${h} 个 KV Head 权重矩阵`,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            原始 MHA 模型有 {h} 个独立的 KV head，每个都有自己的权重矩阵。
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {allWeights.map((w, i) => (
              <MiniHeatmap key={i} data={w} color={HEAD_COLORS[i % HEAD_COLORS.length]} label={`KV${i + 1}`} />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: `Step 2: 分组 (g=${g}，每组 ${headsPerGroup} 个)`,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            将 {h} 个 head 分为 {g} 组，每组 {headsPerGroup} 个 head。
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: g }, (_, gi) => (
              <div key={gi} className="p-2 border-2 rounded-lg" style={{ borderColor: HEAD_COLORS[gi] }}>
                <div className="text-xs font-semibold mb-1 text-center" style={{ color: HEAD_COLORS[gi] }}>
                  组 {gi + 1}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: headsPerGroup }, (_, hi) => {
                    const idx = gi * headsPerGroup + hi;
                    return <MiniHeatmap key={idx} data={allWeights[idx]}
                      color={HEAD_COLORS[idx % HEAD_COLORS.length]} label={`KV${idx + 1}`} size={50} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Step 3: 均值池化',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            组内取均值：{headsPerGroup} 个权重矩阵 → 1 个权重矩阵。{h} 个 head → {g} 个 head。
          </p>
          <div className="flex justify-center gap-8">
            {pooled.map((w, gi) => (
              <MiniHeatmap key={gi} data={w} color={HEAD_COLORS[gi]} label={`GQA KV${gi + 1}`} size={80} />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Step 4: Uptraining',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            用少量数据（约原训练量的 5%）微调，恢复因池化带来的质量损失。
          </p>
          <div className="flex justify-center gap-8">
            {pooled.map((w, gi) => (
              <div key={gi} className="flex flex-col items-center">
                <MiniHeatmap data={w} color={HEAD_COLORS[gi]} label={`GQA KV${gi + 1}`} size={80} />
                <span className="text-[9px] text-green-600 mt-1 font-semibold">✓ 微调完成</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-800">
            <strong>结果：</strong>从 {h} 个 KV head 缩减到 {g} 个，
            KV Cache 缩小 {h / g}×，质量接近原始 MHA。
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
