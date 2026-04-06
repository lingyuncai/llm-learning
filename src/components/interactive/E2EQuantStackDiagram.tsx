import { COLORS, FONTS } from './shared/colors';

type Locale = 'zh' | 'en';

const W = 580;
const H = 500;

interface Block {
  label_zh: string;
  label_en: string;
  dtype_zh: string;
  dtype_en: string;
  color: string;
  hasDequant?: boolean;
}

const BLOCKS: Block[] = [
  { label_zh: 'Input Tokens', label_en: 'Input Tokens', dtype_zh: '', dtype_en: '', color: COLORS.light },
  { label_zh: 'Embedding', label_en: 'Embedding', dtype_zh: 'FP16', dtype_en: 'FP16', color: COLORS.primary },
  { label_zh: 'Attention QKV Projection', label_en: 'Attention QKV Projection', dtype_zh: 'INT4 weight → dequant → FP16', dtype_en: 'INT4 weight → dequant → FP16', color: COLORS.purple, hasDequant: true },
  { label_zh: 'Attention Score (softmax)', label_en: 'Attention Score (softmax)', dtype_zh: 'FP16 (高精度)', dtype_en: 'FP16 (high precision)', color: COLORS.green },
  { label_zh: 'KV Cache', label_en: 'KV Cache', dtype_zh: 'INT8 / FP8', dtype_en: 'INT8 / FP8', color: COLORS.orange },
  { label_zh: 'Attention Output', label_en: 'Attention Output', dtype_zh: 'FP16', dtype_en: 'FP16', color: COLORS.primary },
  { label_zh: 'FFN', label_en: 'FFN', dtype_zh: 'INT4 weight → dequant → FP16', dtype_en: 'INT4 weight → dequant → FP16', color: COLORS.purple, hasDequant: true },
  { label_zh: 'LayerNorm', label_en: 'LayerNorm', dtype_zh: 'FP32', dtype_en: 'FP32', color: COLORS.red },
  { label_zh: 'Output Logits', label_en: 'Output Logits', dtype_zh: 'FP16', dtype_en: 'FP16', color: COLORS.primary },
];

export default function E2EQuantStackDiagram({ locale = 'zh' }: { locale?: Locale }) {
  const t = {
    zh: {
      title: '端到端推理量化栈',
      keyPoints: '要点:',
      point1: '• 权重 INT4 存储，推理时即时 dequant 为 FP16 计算',
      point2: '• KV Cache INT8/FP8 减少长上下文显存',
      point3: '• Softmax + LayerNorm 需高精度 (FP16/FP32)',
    },
    en: {
      title: 'End-to-End Inference Quantization Stack',
      keyPoints: 'Key points:',
      point1: '• Weights stored in INT4, dequant to FP16 at inference time',
      point2: '• KV Cache INT8/FP8 reduces long-context memory',
      point3: '• Softmax + LayerNorm require high precision (FP16/FP32)',
    },
  }[locale];
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
        {t.title}
      </text>

      {BLOCKS.map((block, i) => {
        const y = startY + i * (blockH + gap);
        const label = locale === 'zh' ? block.label_zh : block.label_en;
        const dtype = locale === 'zh' ? block.dtype_zh : block.dtype_en;
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
            <text x={startX + blockW / 2} y={y + (dtype ? 15 : 24)}
              textAnchor="middle" fontSize="12" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {label}
            </text>
            {dtype && (
              <text x={startX + blockW / 2} y={y + 30}
                textAnchor="middle" fontSize="9"
                fill={COLORS.mid} fontFamily={FONTS.mono}>
                {dtype}
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
          {t.keyPoints}
        </text>
        <text x="0" y="14" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {t.point1}
        </text>
        <text x="0" y="26" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {t.point2}
        </text>
        <text x="0" y="38" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {t.point3}
        </text>
      </g>
    </svg>
  );
}
