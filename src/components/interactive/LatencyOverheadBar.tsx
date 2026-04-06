import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface MethodLatency {
  name: string;
  overhead_ms: number;
  detail: string;
  category: string;
}

const DATA: MethodLatency[] = [
  { name: 'Semantic Router', overhead_ms: 5, detail: 'Embedding cosine 匹配，几乎无额外延迟', category: '分类器' },
  { name: 'BERT Router', overhead_ms: 15, detail: 'BERT 推理 ~15ms，可在 CPU 上运行', category: '分类器' },
  { name: 'MF Router', overhead_ms: 10, detail: '矩阵乘法 + 阈值判断', category: '分类器' },
  { name: 'Causal LM Router', overhead_ms: 50, detail: '小 LM 推理 ~50ms，需要 GPU', category: '分类器' },
  { name: 'Self-Verification', overhead_ms: 200, detail: '需要生成 + 自评，可能多次调用', category: '级联' },
  { name: 'LLM-as-Judge', overhead_ms: 500, detail: '额外一次 LLM 调用评估质量', category: '级联' },
  { name: 'Council Mode', overhead_ms: 0, detail: '并行调用，延迟 = 最慢模型（非额外开销）', category: 'MoA' },
  { name: 'Token-level Hybrid', overhead_ms: 30, detail: '每 token 置信度判断，累积开销', category: '混合' },
];

const MAX_MS = 600;

export default function LatencyOverheadBar() {
  const [hovered, setHovered] = useState<string | null>(null);

  const W = 580, barH = 28, gap = 6;
  const labelW = 140, barL = 155, barR = 530, barW = barR - barL;
  const H = 60 + DATA.length * (barH + gap) + 60;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          路由方法额外延迟开销
        </text>
        <text x={W / 2} y="42" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          不含模型推理时间，仅路由决策本身的延迟
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
                {d.overhead_ms === 0 ? '0ms (并行)' : `~${d.overhead_ms}ms`}
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
