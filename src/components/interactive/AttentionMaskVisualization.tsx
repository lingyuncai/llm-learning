// src/components/interactive/AttentionMaskVisualization.tsx
import { useState } from 'react';
import { COLORS } from './shared/colors';

const TOKENS = ['I', 'love', 'NLP', 'and', 'ML', '!'];
const N = TOKENS.length;

type MaskType = 'bidirectional' | 'causal' | 'cross';

function getMask(type: MaskType): boolean[][] {
  if (type === 'bidirectional') {
    return Array.from({ length: N }, () => Array(N).fill(true));
  }
  if (type === 'causal') {
    return Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (_, j) => j <= i)
    );
  }
  // cross: decoder tokens (rows) attend to all encoder tokens (cols)
  return Array.from({ length: N }, () => Array(N).fill(true));
}

const MASK_INFO: Record<MaskType, { title: string; desc: string }> = {
  bidirectional: {
    title: '双向 (Encoder)',
    desc: '所有位置互相可见 — BERT 等 Encoder 模型使用',
  },
  causal: {
    title: '因果 (Decoder-only)',
    desc: '每个 token 只能看到自己和之前的位置 — GPT、LLaMA 等使用',
  },
  cross: {
    title: '交叉 (Encoder-Decoder)',
    desc: 'Decoder 可看到所有 Encoder 位置 — 原始 Transformer、T5 使用',
  },
};

const CELL_SIZE = 40;
const LABEL_WIDTH = 48;
const LABEL_HEIGHT = 28;

function MaskGrid({ type, hoveredCell, onHover }: {
  type: MaskType;
  hoveredCell: [number, number] | null;
  onHover: (cell: [number, number] | null) => void;
}) {
  const mask = getMask(type);
  const info = MASK_INFO[type];
  const svgW = LABEL_WIDTH + N * CELL_SIZE;
  const svgH = LABEL_HEIGHT + N * CELL_SIZE;
  const rowLabels = type === 'cross' ? TOKENS.map(t => t + '→') : TOKENS;
  const colLabels = TOKENS;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold text-gray-700 mb-1">{info.title}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[260px]">
        {/* Column labels */}
        {colLabels.map((t, j) => (
          <text key={`cl-${j}`} x={LABEL_WIDTH + j * CELL_SIZE + CELL_SIZE / 2} y={LABEL_HEIGHT - 6}
            textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily="system-ui">
            {t}
          </text>
        ))}
        {/* Row labels */}
        {rowLabels.map((t, i) => (
          <text key={`rl-${i}`} x={LABEL_WIDTH - 6} y={LABEL_HEIGHT + i * CELL_SIZE + CELL_SIZE / 2 + 4}
            textAnchor="end" fontSize="10" fill={COLORS.mid} fontFamily="system-ui">
            {t}
          </text>
        ))}
        {/* Grid cells */}
        {mask.map((row, i) =>
          row.map((visible, j) => {
            const isHoveredRow = hoveredCell && hoveredCell[0] === i;
            const isHoveredCol = hoveredCell && hoveredCell[1] === j;
            const isExactCell = isHoveredRow && isHoveredCol;
            let fill = visible ? COLORS.valid : COLORS.masked;
            if (isExactCell) fill = COLORS.highlight;
            else if (isHoveredRow || isHoveredCol) fill = visible ? '#bfdbfe' : '#e5e7eb';

            return (
              <rect
                key={`${i}-${j}`}
                x={LABEL_WIDTH + j * CELL_SIZE}
                y={LABEL_HEIGHT + i * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={fill}
                stroke="#d1d5db"
                strokeWidth="0.5"
                onMouseEnter={() => onHover([i, j])}
                onMouseLeave={() => onHover(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          })
        )}
      </svg>
      <div className="text-xs text-gray-500 mt-1 text-center max-w-[260px]">{info.desc}</div>
    </div>
  );
}

export default function AttentionMaskVisualization() {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['bidirectional', 'causal', 'cross'] as MaskType[]).map(type => (
          <MaskGrid key={type} type={type} hoveredCell={hoveredCell} onHover={setHoveredCell} />
        ))}
      </div>
      {hoveredCell && (
        <div className="text-center text-xs text-gray-500 mt-2">
          Query: <strong>{TOKENS[hoveredCell[0]]}</strong> → Key: <strong>{TOKENS[hoveredCell[1]]}</strong>
        </div>
      )}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: COLORS.valid }} /> 可见
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: COLORS.masked }} /> 遮罩
        </span>
      </div>
    </div>
  );
}
