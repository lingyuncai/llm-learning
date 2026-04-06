// src/components/interactive/GemmInTransformer.tsx
// Static SVG: Transformer block with GEMM operations highlighted
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface GemmInTransformerProps {
  locale?: 'zh' | 'en';
}

// A single box in the transformer flow
function FlowBox({ x, y, w, h, label, sublabel, isGemm, color }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; isGemm: boolean; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={isGemm ? '#dbeafe' : '#f8fafc'}
        stroke={isGemm ? color : '#cbd5e1'}
        strokeWidth={isGemm ? 2 : 1} />
      {isGemm && (
        <rect x={x} y={y} width={4} height={h} rx={2} fill={color} />
      )}
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 4 : h / 2 + 1)} textAnchor="middle"
        dominantBaseline="middle" fontSize="8" fontWeight={isGemm ? '700' : '500'}
        fill={isGemm ? color : COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          dominantBaseline="middle" fontSize="6.5"
          fill="#64748b" fontFamily={FONTS.mono}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#94a3b8" strokeWidth={1} markerEnd="url(#gemm-tf-arrow)" />
  );
}

export default function GemmInTransformer({ locale = 'zh' }: GemmInTransformerProps) {
  const t = {
    zh: {
      title: 'Transformer Block 中的 GEMM 操作',
      subtitle: '蓝色标注 = 矩阵乘法 (占计算量 90%+)。S = seq_len, H = hidden_dim',
      input: 'Input Embedding (S×H)',
      multiHeadAttention: 'Multi-Head Attention',
      addLayerNorm: 'Add & LayerNorm',
      ffn: 'Feed-Forward Network',
      summary: '每个 Transformer 层包含 6 个 GEMM — 它们决定了推理和训练的计算时间',
    },
    en: {
      title: 'GEMM Operations in Transformer Block',
      subtitle: 'Blue highlight = matrix multiplication (90%+ of compute). S = seq_len, H = hidden_dim',
      input: 'Input Embedding (S×H)',
      multiHeadAttention: 'Multi-Head Attention',
      addLayerNorm: 'Add & LayerNorm',
      ffn: 'Feed-Forward Network',
      summary: 'Each Transformer layer contains 6 GEMMs — they determine inference and training time',
    },
  }[locale];

  // Layout: vertical flow of a single Transformer decoder layer
  const colX = W / 2;
  const boxW = 180;
  const gemmW = 140;

  // GEMM operations with M/N/K dimensions (for a typical LLM layer)
  // Assuming hidden_dim=H, seq_len=S, intermediate=4H
  const gemms = [
    { label: 'QKV Projection', dim: 'S×H · H×3H', color: COLORS.primary },
    { label: 'Attention Score', dim: 'S×H · H×S', color: COLORS.green },
    { label: 'Attention Output', dim: 'S×S · S×H', color: COLORS.green },
    { label: 'Output Projection', dim: 'S×H · H×H', color: COLORS.primary },
    { label: 'FFN Up', dim: 'S×H · H×4H', color: COLORS.orange },
    { label: 'FFN Down', dim: 'S×4H · 4H×H', color: COLORS.orange },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="GEMM operations in a Transformer block">
      <defs>
        <marker id="gemm-tf-arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
        </marker>
      </defs>

      <text x={W / 2} y={18} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={34} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {/* Input */}
      <FlowBox x={colX - boxW / 2} y={44} w={boxW} h={24}
        label={t.input} isGemm={false} color="" />
      <Arrow x1={colX} y1={68} x2={colX} y2={78} />

      {/* Multi-Head Attention block */}
      <rect x={60} y={78} width={460} height={138} rx={6}
        fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 2" />
      <text x={70} y={92} fontSize="8" fontWeight="600" fill="#64748b"
        fontFamily={FONTS.sans}>{t.multiHeadAttention}</text>

      {/* QKV */}
      <FlowBox x={colX - gemmW / 2} y={98} w={gemmW} h={28}
        label={gemms[0].label} sublabel={gemms[0].dim} isGemm={true} color={gemms[0].color} />
      <Arrow x1={colX} y1={126} x2={colX} y2={136} />

      {/* Attention: score and output side by side */}
      <FlowBox x={colX - gemmW - 10} y={138} w={gemmW} h={28}
        label={gemms[1].label} sublabel={gemms[1].dim} isGemm={true} color={gemms[1].color} />
      <FlowBox x={colX + 10} y={138} w={gemmW} h={28}
        label={gemms[2].label} sublabel={gemms[2].dim} isGemm={true} color={gemms[2].color} />
      {/* Arrows from QKV to both attention ops */}
      <Arrow x1={colX - 20} y1={126} x2={colX - gemmW / 2 - 10} y2={138} />
      <Arrow x1={colX + 20} y1={126} x2={colX + 10 + gemmW / 2} y2={138} />

      {/* Output projection */}
      <FlowBox x={colX - gemmW / 2} y={178} w={gemmW} h={28}
        label={gemms[3].label} sublabel={gemms[3].dim} isGemm={true} color={gemms[3].color} />
      <Arrow x1={colX} y1={166} x2={colX} y2={178} />

      {/* Add & Norm */}
      <Arrow x1={colX} y1={206} x2={colX} y2={222} />
      <FlowBox x={colX - boxW / 2} y={222} w={boxW} h={22}
        label={t.addLayerNorm} isGemm={false} color="" />
      <Arrow x1={colX} y1={244} x2={colX} y2={254} />

      {/* FFN block */}
      <rect x={60} y={254} width={460} height={88} rx={6}
        fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 2" />
      <text x={70} y={268} fontSize="8" fontWeight="600" fill="#64748b"
        fontFamily={FONTS.sans}>{t.ffn}</text>

      <FlowBox x={colX - gemmW - 10} y={274} w={gemmW} h={28}
        label={gemms[4].label} sublabel={gemms[4].dim} isGemm={true} color={gemms[4].color} />
      <FlowBox x={colX + 10} y={274} w={gemmW} h={28}
        label={gemms[5].label} sublabel={gemms[5].dim} isGemm={true} color={gemms[5].color} />
      <Arrow x1={colX - gemmW / 2 - 10 + gemmW} y1={288} x2={colX + 10} y2={288} />

      {/* Add & Norm */}
      <Arrow x1={colX} y1={302} x2={colX} y2={348} />
      <FlowBox x={colX - boxW / 2} y={348} w={boxW} h={22}
        label={t.addLayerNorm} isGemm={false} color="" />

      {/* Summary */}
      <rect x={40} y={H - 38} width={500} height={30} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        {t.summary}
      </text>
    </svg>
  );
}
