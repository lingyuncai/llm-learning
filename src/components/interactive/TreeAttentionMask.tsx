import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

const N = 7;
const CELL = 28;
const TOKENS = ['The', 'cat', 'sat', 'on', 'is', 'dog', 'ran'];

const CAUSAL: boolean[][] = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (_, j) => j <= i)
);

const TREE_LABELS = TOKENS;
const TREE_MASK: boolean[][] = [
  [true, false, false, false, false, false, false],
  [true, true, false, false, false, false, false],
  [true, true, true, false, false, false, false],
  [true, true, true, true, false, false, false],
  [true, true, false, false, true, false, false],
  [true, false, false, false, false, true, false],
  [true, false, false, false, false, true, true],
];

function MaskGrid({ x, y, mask, labels, title, subtitle }: {
  x: number; y: number; mask: boolean[][]; labels: string[];
  title: string; subtitle: string;
}) {
  const n = labels.length;
  const gridX = x + 30;
  const gridY = y + 30;

  return (
    <g>
      <text x={x + (n * CELL) / 2 + 30} y={y - 18} textAnchor="middle" fontSize="10"
        fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {title}
      </text>
      <text x={x + (n * CELL) / 2 + 30} y={y - 4} textAnchor="middle" fontSize="7"
        fill="#64748b" fontFamily={FONTS.sans}>
        {subtitle}
      </text>

      {labels.map((label, j) => (
        <text key={`ch-${j}`} x={gridX + j * CELL + CELL / 2} y={gridY - 4}
          textAnchor="middle" fontSize="6.5" fill="#64748b" fontFamily={FONTS.mono}>
          {label}
        </text>
      ))}

      {labels.map((label, i) => (
        <text key={`rh-${i}`} x={gridX - 4} y={gridY + i * CELL + CELL / 2 + 1}
          textAnchor="end" dominantBaseline="middle" fontSize="6.5"
          fill="#64748b" fontFamily={FONTS.mono}>
          {label}
        </text>
      ))}

      {mask.map((row, i) =>
        row.map((val, j) => (
          <rect key={`${i}-${j}`}
            x={gridX + j * CELL} y={gridY + i * CELL}
            width={CELL - 1} height={CELL - 1} rx={2}
            fill={val ? (i === j ? '#bbdefb' : '#dbeafe') : '#f8fafc'}
            stroke={val ? COLORS.primary : '#e2e8f0'} strokeWidth={0.5} />
        ))
      )}
    </g>
  );
}

export default function TreeAttentionMask() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Tree attention mask vs causal mask comparison">

      <MaskGrid x={10} y={30} mask={CAUSAL} labels={TOKENS}
        title="Standard Causal Mask"
        subtitle="每个 token 看到所有之前的 token" />

      <MaskGrid x={300} y={30} mask={TREE_MASK} labels={TREE_LABELS}
        title="Tree Attention Mask"
        subtitle="每个 token 只看到自己的祖先路径" />

      <rect x={40} y={H - 50} width={500} height={40} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={W / 2} y={H - 28} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        Tree mask 允许不同分支并行验证: "is" 不会看到 "sat/on"，"dog" 不会看到 "cat" 分支
      </text>
      <text x={W / 2} y={H - 14} textAnchor="middle" fontSize="7"
        fill="#64748b" fontFamily={FONTS.sans}>
        一次 forward pass 验证所有路径 → 选择最长被接受路径
      </text>
    </svg>
  );
}
