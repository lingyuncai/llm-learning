/**
 * TransformerArchDiagram - SVG diagram showing a single Transformer Block (Pre-LayerNorm variant).
 *
 * Flow:
 *   Input → LayerNorm → Self-Attention → Residual Add →
 *           LayerNorm → MLP → Residual Add → Output
 *
 * Each block is annotated with its tensor shape.
 * Pure component — no state needed.
 */
export default function TransformerArchDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      figcaption: 'Pre-LayerNorm Transformer Block 结构（现代 LLM 常用变体）',
    },
    en: {
      figcaption: 'Pre-LayerNorm Transformer Block Architecture (Common Variant in Modern LLMs)',
    },
  };
  const blockW = 220;
  const blockH = 54;
  const gap = 16;
  const arrowLen = gap;
  const startY = 20;
  const centerX = 180;

  const blocks: {
    name: string;
    shape: string;
    color: string;
    highlight?: boolean;
    isResidual?: boolean;
  }[] = [
    { name: 'Input Embeddings', shape: '(B, S, H)', color: '#e0f2fe' },
    { name: 'Positional Encoding', shape: '(B, S, H)', color: '#e0f2fe' },
    { name: 'LayerNorm', shape: '(B, S, H)', color: '#fef3c7' },
    { name: 'Multi-Head Self-Attention', shape: '(B, S, H)', color: '#dbeafe', highlight: true },
    { name: '⊕ Residual Add', shape: '(B, S, H)', color: '#f0fdf4', isResidual: true },
    { name: 'LayerNorm', shape: '(B, S, H)', color: '#fef3c7' },
    { name: 'Feed-Forward (MLP)', shape: '(B, S, 4H)→(B, S, H)', color: '#ede9fe', highlight: true },
    { name: '⊕ Residual Add', shape: '(B, S, H)', color: '#f0fdf4', isResidual: true },
  ];

  const totalH = startY + blocks.length * (blockH + arrowLen) + 30;
  const svgW = 420;

  // Compute Y positions for each block
  const blockPositions = blocks.map((_, i) => startY + i * (blockH + arrowLen));

  // Residual connection paths:
  // Residual 1: from block 1 (Positional Encoding output) skips to block 4 (first ⊕ Residual Add)
  // Residual 2: from block 4 (first ⊕ Residual Add output) skips to block 7 (second ⊕ Residual Add)
  const residualPairs = [
    { fromIdx: 1, toIdx: 4 },
    { fromIdx: 4, toIdx: 7 },
  ];

  const residualXOffset = centerX + blockW / 2 + 30;

  return (
    <figure className="my-8 flex flex-col items-center">
      <svg
        viewBox={`0 0 ${svgW} ${totalH}`}
        width="100%"
        style={{ maxWidth: `${svgW}px` }}
        role="img"
        aria-label="Transformer Block architecture diagram showing the flow: Input Embeddings, Positional Encoding, LayerNorm, Self-Attention, Residual Add, LayerNorm, MLP, Residual Add"
      >
        <defs>
          <marker
            id="arrowHead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L8,3 L0,6 Z" fill="#6b7280" />
          </marker>
          <marker
            id="arrowHeadBlue"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L8,3 L0,6 Z" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Bracket label for the repeating Transformer Block (blocks 2–7, i.e. LN → Attn → Res → LN → MLP → Res) */}
        {(() => {
          const bracketX = centerX - blockW / 2 - 38;
          const bracketTop = blockPositions[2] - 2;
          const bracketBottom = blockPositions[7] + blockH + 2;
          return (
            <g>
              <path
                d={`M${bracketX + 8},${bracketTop} L${bracketX},${bracketTop} L${bracketX},${bracketBottom} L${bracketX + 8},${bracketBottom}`}
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              <text
                x={bracketX - 4}
                y={(bracketTop + bracketBottom) / 2}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
                transform={`rotate(-90, ${bracketX - 4}, ${(bracketTop + bracketBottom) / 2})`}
              >
                Transformer Block ×N
              </text>
            </g>
          );
        })()}

        {/* Blocks and arrows */}
        {blocks.map((block, i) => {
          const y = blockPositions[i];
          const x = centerX - blockW / 2;
          return (
            <g key={i}>
              {/* Block rectangle */}
              <rect
                x={x}
                y={y}
                width={blockW}
                height={blockH}
                rx={8}
                ry={8}
                fill={block.color}
                stroke={block.highlight ? '#3b82f6' : '#d1d5db'}
                strokeWidth={block.highlight ? 2 : 1}
              />
              {/* Block name */}
              <text
                x={centerX}
                y={y + 22}
                textAnchor="middle"
                fontSize="13"
                fontWeight={block.highlight ? 600 : 500}
                fill="#1e293b"
              >
                {block.name}
              </text>
              {/* Tensor shape annotation */}
              <text
                x={centerX}
                y={y + 40}
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fill="#64748b"
              >
                {block.shape}
              </text>

              {/* Arrow to next block */}
              {i < blocks.length - 1 && (
                <line
                  x1={centerX}
                  y1={y + blockH}
                  x2={centerX}
                  y2={y + blockH + arrowLen}
                  stroke="#6b7280"
                  strokeWidth="1.5"
                  markerEnd="url(#arrowHead)"
                />
              )}
            </g>
          );
        })}

        {/* Residual connection arcs */}
        {residualPairs.map(({ fromIdx, toIdx }, i) => {
          const yStart = blockPositions[fromIdx] + blockH / 2;
          const yEnd = blockPositions[toIdx] + blockH / 2;
          return (
            <g key={`res-${i}`}>
              <path
                d={`M${centerX + blockW / 2},${yStart}
                    L${residualXOffset},${yStart}
                    L${residualXOffset},${yEnd}
                    L${centerX + blockW / 2},${yEnd}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadBlue)"
              />
              <text
                x={residualXOffset + 6}
                y={(yStart + yEnd) / 2 + 4}
                fontSize="10"
                fill="#3b82f6"
              >
                residual
              </text>
            </g>
          );
        })}

        {/* Output label */}
        <text
          x={centerX}
          y={blockPositions[blocks.length - 1] + blockH + arrowLen + 10}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
        >
          → Output / Next Block
        </text>
      </svg>
      <figcaption className="text-sm text-gray-500 mt-2">
        {t[locale].figcaption}
      </figcaption>
    </figure>
  );
}
