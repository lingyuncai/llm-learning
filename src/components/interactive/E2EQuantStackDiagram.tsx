import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 500;

interface Block {
  label: string;
  dtype: string;
  color: string;
  hasDequant?: boolean;
}

const BLOCKS: Block[] = [
  { label: 'Input Tokens', dtype: '', color: COLORS.light },
  { label: 'Embedding', dtype: 'FP16', color: COLORS.primary },
  { label: 'Attention QKV Projection', dtype: 'INT4 weight → dequant → FP16', color: COLORS.purple, hasDequant: true },
  { label: 'Attention Score (softmax)', dtype: 'FP16 (高精度)', color: COLORS.green },
  { label: 'KV Cache', dtype: 'INT8 / FP8', color: COLORS.orange },
  { label: 'Attention Output', dtype: 'FP16', color: COLORS.primary },
  { label: 'FFN', dtype: 'INT4 weight → dequant → FP16', color: COLORS.purple, hasDequant: true },
  { label: 'LayerNorm', dtype: 'FP32', color: COLORS.red },
  { label: 'Output Logits', dtype: 'FP16', color: COLORS.primary },
];

export default function E2EQuantStackDiagram() {
  const blockW = 380;
  const blockH = 40;
  const gap = 8;
  const startX = (W - blockW) / 2;
  const startY = 40;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="e2e-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
        </marker>
      </defs>

      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        端到端推理量化栈
      </text>

      {BLOCKS.map((block, i) => {
        const y = startY + i * (blockH + gap);
        return (
          <g key={i}>
            {/* Connection arrow */}
            {i > 0 && (
              <line x1={startX + blockW / 2} y1={y - gap + 1}
                x2={startX + blockW / 2} y2={y - 1}
                stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#e2e-arrow)" />
            )}
            {/* Block */}
            <rect x={startX} y={y} width={blockW} height={blockH}
              fill={block.color} opacity={0.15} stroke={block.color}
              strokeWidth="2" rx="5" />
            <text x={startX + blockW / 2} y={y + (block.dtype ? 15 : 24)}
              textAnchor="middle" fontSize="12" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {block.label}
            </text>
            {block.dtype && (
              <text x={startX + blockW / 2} y={y + 30}
                textAnchor="middle" fontSize="9"
                fill={COLORS.mid} fontFamily={FONTS.mono}>
                {block.dtype}
              </text>
            )}
            {/* Dequant annotation */}
            {block.hasDequant && (
              <>
                <polygon points={`${startX + blockW + 8},${y + blockH / 2} ${startX + blockW + 16},${y + blockH / 2 - 5} ${startX + blockW + 16},${y + blockH / 2 + 5}`}
                  fill={COLORS.orange} />
                <text x={startX + blockW + 20} y={y + blockH / 2 + 4}
                  fontSize="8" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.mono}>
                  dequant
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Key observations */}
      <g transform={`translate(${startX}, ${startY + BLOCKS.length * (blockH + gap) + 5})`}>
        <text x="0" y="0" fontSize="9" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          要点:
        </text>
        <text x="0" y="14" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          • 权重 INT4 存储，推理时即时 dequant 为 FP16 计算
        </text>
        <text x="0" y="26" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          • KV Cache INT8/FP8 减少长上下文显存
        </text>
        <text x="0" y="38" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          • Softmax + LayerNorm 需高精度 (FP16/FP32)
        </text>
      </g>
    </svg>
  );
}
