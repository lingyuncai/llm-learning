// src/components/interactive/SingleVsMultiHeadAttention.tsx
import { useState } from 'react';
import { COLORS, HEAD_COLORS } from './shared/colors';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'tired'];
const N = TOKENS.length;

function generateSingleHead(): number[][] {
  return Array.from({ length: N }, (_, i) => {
    const row = Array(N).fill(0.05);
    if (i > 0) row[i - 1] += 0.15;
    if (i < N - 1) row[i + 1] += 0.1;
    row[i] += 0.2;
    if (i === 7) { row[1] += 0.15; row[8] += 0.1; }
    if (i === 2) row[1] += 0.15;
    const sum = row.reduce((a, b) => a + b, 0);
    return row.map(v => parseFloat((v / sum).toFixed(3)));
  });
}

function generateHeadPatterns(): number[][][] {
  return [
    Array.from({ length: N }, (_, i) => {
      const row = Array(N).fill(0.02);
      row[i] += 0.35;
      if (i > 0) row[i - 1] += 0.35;
      if (i > 1) row[i - 2] += 0.1;
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(v => parseFloat((v / sum).toFixed(3)));
    }),
    Array.from({ length: N }, (_, i) => {
      const row = Array(N).fill(0.03);
      row[i] += 0.2;
      if (i === 2) row[1] += 0.5;
      if (i === 8) row[7] += 0.4;
      if (i === 9) row[8] += 0.4;
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(v => parseFloat((v / sum).toFixed(3)));
    }),
    Array.from({ length: N }, (_, i) => {
      const row = Array(N).fill(0.03);
      row[i] += 0.2;
      if (i === 7) row[1] += 0.55;
      if (i === 6) row[2] += 0.3;
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(v => parseFloat((v / sum).toFixed(3)));
    }),
    Array.from({ length: N }, (_, i) => {
      const row = Array(N).fill(0.03);
      row[i] += 0.2;
      if (i === 3) row[5] += 0.5;
      if (i === 5) row[3] += 0.4;
      if (i === 6) row[5] += 0.25;
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(v => parseFloat((v / sum).toFixed(3)));
    }),
  ];
}

function Heatmap({ data, size = 160, label, color }: {
  data: number[][]; size?: number; label: string; color?: string;
}) {
  const cellSize = size / N;
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold mb-1" style={{ color: color || COLORS.dark }}>{label}</div>
      <svg viewBox={`0 0 ${size + 30} ${size + 20}`} className="w-full" style={{ maxWidth: size + 30 }}>
        {TOKENS.map((t, i) => (
          <g key={i}>
            <text x={28 + i * cellSize + cellSize / 2} y={10}
              textAnchor="middle" fontSize="5" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
            <text x={26} y={18 + i * cellSize + cellSize / 2 + 2}
              textAnchor="end" fontSize="5" fill={COLORS.mid} fontFamily="system-ui">{t}</text>
          </g>
        ))}
        {data.map((row, i) =>
          row.map((v, j) => (
            <rect key={`${i}-${j}`}
              x={30 + j * cellSize} y={14 + i * cellSize}
              width={cellSize - 0.5} height={cellSize - 0.5}
              fill={color || COLORS.primary}
              opacity={v * 0.9 + 0.05}
              rx={1}
            />
          ))
        )}
      </svg>
    </div>
  );
}

export default function SingleVsMultiHeadAttention({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      singleHeadLabel: '单头 Attention — 所有模式混在一起',
      multiHeadLabel: '多头 Attention (h=4) — 每个 head 关注不同模式',
      head1: 'Head 1: 局部模式',
      head2: 'Head 2: 动词-主语',
      head3: 'Head 3: 代词指代',
      head4: 'Head 4: 介词短语',
      disclaimer: '示意图，非真实模型权重 — 展示多头如何让不同 head 专注于不同关系模式',
    },
    en: {
      singleHeadLabel: 'Single-Head Attention — All patterns mixed',
      multiHeadLabel: 'Multi-Head Attention (h=4) — Each head focuses on different patterns',
      head1: 'Head 1: Local pattern',
      head2: 'Head 2: Verb-subject',
      head3: 'Head 3: Pronoun reference',
      head4: 'Head 4: Prepositional phrase',
      disclaimer: 'Illustrative diagram, not real model weights — shows how multi-head allows different heads to focus on different relational patterns',
    },
  }[locale];

  const HEAD_LABELS = [t.head1, t.head2, t.head3, t.head4];

  const [hoveredHead, setHoveredHead] = useState<number | null>(null);
  const singleHead = generateSingleHead();
  const headPatterns = generateHeadPatterns();

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Heatmap data={singleHead} size={240} label={t.singleHeadLabel} />
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-2 text-center">
            {t.multiHeadLabel}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {headPatterns.map((pattern, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredHead(i)}
                onMouseLeave={() => setHoveredHead(null)}
                className={`rounded p-1 transition-shadow ${hoveredHead === i ? 'shadow-lg ring-2' : ''}`}
                style={{ ringColor: HEAD_COLORS[i] }}>
                <Heatmap data={pattern} size={140} label={HEAD_LABELS[i]} color={HEAD_COLORS[i]} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">
        {t.disclaimer}
      </p>
    </div>
  );
}
