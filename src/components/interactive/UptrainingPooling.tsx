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

export default function UptrainingPooling({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
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

  const t = {
    zh: {
      step1Title: `Step 1: ${h} 个 KV Head 权重矩阵`,
      step1P: `原始 MHA 模型有 ${h} 个独立的 KV head，每个都有自己的权重矩阵。`,
      step2Title: `Step 2: 分组 (g=${g}，每组 ${headsPerGroup} 个)`,
      step2P: `将 ${h} 个 head 分为 ${g} 组，每组 ${headsPerGroup} 个 head。`,
      group: '组',
      step3Title: 'Step 3: 均值池化',
      step3P: `组内取均值：${headsPerGroup} 个权重矩阵 → 1 个权重矩阵。${h} 个 head → ${g} 个 head。`,
      step4Title: 'Step 4: Uptraining',
      step4P: '用少量数据（约原训练量的 5%）微调，恢复因池化带来的质量损失。',
      fineTuned: '✓ 微调完成',
      result: '结果：',
      resultText: `从 ${h} 个 KV head 缩减到 ${g} 个，KV Cache 缩小 ${h / g}×，质量接近原始 MHA。`,
    },
    en: {
      step1Title: `Step 1: ${h} KV Head Weight Matrices`,
      step1P: `Original MHA model has ${h} independent KV heads, each with its own weight matrix.`,
      step2Title: `Step 2: Grouping (g=${g}, ${headsPerGroup} per group)`,
      step2P: `Divide ${h} heads into ${g} groups, ${headsPerGroup} heads per group.`,
      group: 'Group',
      step3Title: 'Step 3: Mean Pooling',
      step3P: `Average within group: ${headsPerGroup} weight matrices → 1 weight matrix. ${h} heads → ${g} heads.`,
      step4Title: 'Step 4: Uptraining',
      step4P: 'Fine-tune with small amount of data (~5% of original training) to recover quality loss from pooling.',
      fineTuned: '✓ Fine-tuned',
      result: 'Result:',
      resultText: `Reduced from ${h} KV heads to ${g}, KV Cache shrinks ${h / g}×, quality close to original MHA.`,
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step1P}
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
      title: t.step2Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step2P}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: g }, (_, gi) => (
              <div key={gi} className="p-2 border-2 rounded-lg" style={{ borderColor: HEAD_COLORS[gi] }}>
                <div className="text-xs font-semibold mb-1 text-center" style={{ color: HEAD_COLORS[gi] }}>
                  {t.group} {gi + 1}
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
      title: t.step3Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step3P}
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
      title: t.step4Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.step4P}
          </p>
          <div className="flex justify-center gap-8">
            {pooled.map((w, gi) => (
              <div key={gi} className="flex flex-col items-center">
                <MiniHeatmap data={w} color={HEAD_COLORS[gi]} label={`GQA KV${gi + 1}`} size={80} />
                <span className="text-[9px] text-green-600 mt-1 font-semibold">{t.fineTuned}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-800">
            <strong>{t.result}</strong>{t.resultText}
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} locale={locale} />;
}
