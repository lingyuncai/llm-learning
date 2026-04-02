// src/components/interactive/PermutationInvariance.tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const TOKENS_ORIGINAL = ['The', 'cat', 'sat', 'here'];
const TOKENS_SHUFFLED = ['sat', 'here', 'The', 'cat'];
const SHUFFLE_MAP = [2, 3, 0, 1]; // original[i] -> shuffled position

// Simplified attention scores (no positional encoding)
const ATTN_SCORES = [
  [0.25, 0.35, 0.20, 0.20],
  [0.30, 0.25, 0.25, 0.20],
  [0.20, 0.30, 0.30, 0.20],
  [0.15, 0.25, 0.25, 0.35],
];

// After adding positional encoding — scores change
const ATTN_WITH_PE = [
  [0.40, 0.30, 0.18, 0.12],
  [0.28, 0.35, 0.25, 0.12],
  [0.15, 0.28, 0.37, 0.20],
  [0.10, 0.15, 0.25, 0.50],
];

function AttnMatrix({ tokens, scores, highlight }: {
  tokens: string[];
  scores: number[][];
  highlight?: number[][];
}) {
  const cellSize = 48;
  const labelW = 48;
  const w = labelW + tokens.length * cellSize;
  const h = labelW + tokens.length * cellSize;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xs mx-auto">
      {/* Column headers */}
      {tokens.map((t, i) => (
        <text key={`ch-${i}`} x={labelW + i * cellSize + cellSize / 2} y={labelW - 8}
          textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark}
          fontFamily="system-ui">{t}</text>
      ))}
      {/* Row headers */}
      {tokens.map((t, i) => (
        <text key={`rh-${i}`} x={labelW - 8} y={labelW + i * cellSize + cellSize / 2 + 4}
          textAnchor="end" fontSize="11" fontWeight="600" fill={COLORS.dark}
          fontFamily="system-ui">{t}</text>
      ))}
      {/* Cells */}
      {scores.map((row, r) =>
        row.map((val, c) => {
          const isHighlighted = highlight?.some(([hr, hc]) => hr === r && hc === c);
          const bg = isHighlighted
            ? COLORS.highlight
            : `rgba(21, 101, 192, ${val})`;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={labelW + c * cellSize + 1}
                y={labelW + r * cellSize + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                rx={4}
                fill={bg}
                stroke={isHighlighted ? COLORS.orange : '#e5e7eb'}
                strokeWidth={isHighlighted ? 2 : 1}
              />
              <text
                x={labelW + c * cellSize + cellSize / 2}
                y={labelW + r * cellSize + cellSize / 2 + 4}
                textAnchor="middle" fontSize="10" fill={COLORS.dark}
                fontFamily="monospace">{val.toFixed(2)}</text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// Reorder attention matrix according to shuffle map
function reorderMatrix(scores: number[][], map: number[]): number[][] {
  const n = scores.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[map[i]][map[j]] = scores[i][j];
    }
  }
  return result;
}

export default function PermutationInvariance() {
  const reorderedScores = reorderMatrix(ATTN_SCORES, SHUFFLE_MAP);

  // Find cells that changed between no-PE and with-PE
  const changedCells: number[][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (Math.abs(ATTN_SCORES[i][j] - ATTN_WITH_PE[i][j]) > 0.03) {
        changedCells.push([i, j]);
      }
    }
  }

  const steps = [
    {
      title: '原始序列的 Attention',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            {TOKENS_ORIGINAL.map((t, i) => (
              <span key={i} className="px-2 py-1 rounded text-sm font-mono"
                style={{ backgroundColor: COLORS.valid, color: COLORS.primary }}>
                {t}
              </span>
            ))}
          </div>
          <AttnMatrix tokens={TOKENS_ORIGINAL} scores={ATTN_SCORES} />
          <p className="text-sm text-gray-600 text-center">
            无位置编码时，Attention 分数只取决于 token 内容
          </p>
        </div>
      ),
    },
    {
      title: '打乱顺序 → 分数不变',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            {TOKENS_SHUFFLED.map((t, i) => (
              <span key={i} className="px-2 py-1 rounded text-sm font-mono"
                style={{ backgroundColor: COLORS.waste, color: COLORS.red }}>
                {t}
              </span>
            ))}
          </div>
          <AttnMatrix tokens={TOKENS_SHUFFLED} scores={reorderedScores} />
          <p className="text-sm text-gray-600 text-center">
            行列随 token 重排，但每对 token 之间的分数<strong>完全一致</strong>
            <br />
            <span className="text-xs">例：(The, cat) 仍是 0.35，无论它们在什么位置</span>
          </p>
        </div>
      ),
    },
    {
      title: '加入位置编码 → 分数改变',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            {TOKENS_ORIGINAL.map((t, i) => (
              <span key={i} className="px-2 py-1 rounded text-sm font-mono"
                style={{ backgroundColor: COLORS.highlight, color: COLORS.dark }}>
                {t}<sub className="text-[9px] ml-0.5">+PE({i})</sub>
              </span>
            ))}
          </div>
          <AttnMatrix tokens={TOKENS_ORIGINAL} scores={ATTN_WITH_PE} highlight={changedCells} />
          <p className="text-sm text-gray-600 text-center">
            位置编码让模型能区分 <strong>"狗咬人"</strong> 和 <strong>"人咬狗"</strong>
            <br />
            <span className="text-xs">黄色高亮 = 与无 PE 时有显著差异的分数</span>
          </p>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
