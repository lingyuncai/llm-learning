import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 340;

type QuantScheme = 'Q4_K_S' | 'Q4_K_M' | 'Q5_K_M' | 'Q6_K';

const getTranslations = (locale: 'zh' | 'en') => ({
  zh: {
    title: 'K-quant 混合精度: {scheme}',
    subtitle: '一个 Transformer Block 的各子模块量化精度分配 (Qwen3-8B)',
    attention: 'Attention',
    ffn: 'FFN (SwiGLU)',
    qProj: 'Q proj',
    kProj: 'K proj',
    vProj: 'V proj',
    oProj: 'O proj',
    gate: 'Gate',
    up: 'Up',
    down: 'Down',
    avgPrecision: '平均精度: {bits} bits/weight | 单层大小: ~{size} MB',
    explanation: 'Attention 层保高精度 → 维持注意力模式质量 | FFN 层降精度 → 最大化压缩',
    legendHigh: '≥6 bpw',
    legendMedium: '~5 bpw',
    legendLow: '~4.5 bpw',
  },
  en: {
    title: 'K-quant Mixed Precision: {scheme}',
    subtitle: 'Quantization precision allocation for Transformer Block submodules (Qwen3-8B)',
    attention: 'Attention',
    ffn: 'FFN (SwiGLU)',
    qProj: 'Q proj',
    kProj: 'K proj',
    vProj: 'V proj',
    oProj: 'O proj',
    gate: 'Gate',
    up: 'Up',
    down: 'Down',
    avgPrecision: 'Avg precision: {bits} bits/weight | Layer size: ~{size} MB',
    explanation: 'Attention layers high precision → maintain attention quality | FFN layers low precision → maximize compression',
    legendHigh: '≥6 bpw',
    legendMedium: '~5 bpw',
    legendLow: '~4.5 bpw',
  },
}[locale]);

interface ModuleInfo {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  // bits per scheme
  bits: Record<QuantScheme, { type: string; bits: number }>;
  paramCount: number; // in millions, for Qwen3-8B single layer
}

const MODULES: ModuleInfo[] = [
  {
    label: 'Q proj', x: 40, y: 80, w: 70, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q6_K', bits: 6.6 },
            Q5_K_M: { type: 'Q6_K', bits: 6.6 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 16.8,
  },
  {
    label: 'K proj', x: 120, y: 80, w: 70, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q6_K', bits: 6.6 },
            Q5_K_M: { type: 'Q6_K', bits: 6.6 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 2.1,
  },
  {
    label: 'V proj', x: 200, y: 80, w: 70, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q6_K', bits: 6.6 },
            Q5_K_M: { type: 'Q6_K', bits: 6.6 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 2.1,
  },
  {
    label: 'O proj', x: 280, y: 80, w: 70, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q4_K', bits: 4.5 },
            Q5_K_M: { type: 'Q5_K', bits: 5.5 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 16.8,
  },
  {
    label: 'Gate', x: 80, y: 200, w: 80, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q4_K', bits: 4.5 },
            Q5_K_M: { type: 'Q5_K', bits: 5.5 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 44.8,
  },
  {
    label: 'Up', x: 200, y: 200, w: 80, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q4_K', bits: 4.5 },
            Q5_K_M: { type: 'Q5_K', bits: 5.5 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 44.8,
  },
  {
    label: 'Down', x: 320, y: 200, w: 80, h: 40,
    bits: { Q4_K_S: { type: 'Q4_K', bits: 4.5 }, Q4_K_M: { type: 'Q4_K', bits: 4.5 },
            Q5_K_M: { type: 'Q5_K', bits: 5.5 }, Q6_K: { type: 'Q6_K', bits: 6.6 } },
    paramCount: 44.8,
  },
];

const SCHEMES: QuantScheme[] = ['Q4_K_S', 'Q4_K_M', 'Q5_K_M', 'Q6_K'];

function bitColor(bits: number): string {
  if (bits >= 6) return '#dcfce7'; // high precision = green
  if (bits >= 5) return '#dbeafe'; // medium = blue
  return '#fef3c7'; // low = orange
}

export default function KQuantMixedPrecision({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [scheme, setScheme] = useState<QuantScheme>('Q4_K_M');
  const t = getTranslations(locale);

  const totalBits = MODULES.reduce((sum, m) => {
    return sum + m.paramCount * m.bits[scheme].bits;
  }, 0);
  const totalParams = MODULES.reduce((sum, m) => sum + m.paramCount, 0);
  const avgBits = totalBits / totalParams;
  const layerSizeMB = totalBits / 8; // rough: paramCount is in millions

  return (
    <div>
      {/* Scheme selector */}
      <div className="flex gap-2 justify-center mb-3">
        {SCHEMES.map(s => (
          <button key={s} onClick={() => setScheme(s)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              scheme === s
                ? 'bg-orange-100 border-orange-400 text-orange-700 font-semibold'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.title.replace('{scheme}', scheme)}
        </text>
        <text x={W / 2} y={32} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {t.subtitle}
        </text>

        {/* Section labels */}
        <text x={180} y={60} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.attention}</text>
        <line x1={30} y1={65} x2={360} y2={65} stroke="#e2e8f0" strokeWidth={0.5} />

        <text x={240} y={180} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.ffn}</text>
        <line x1={70} y1={185} x2={410} y2={185} stroke="#e2e8f0" strokeWidth={0.5} />

        {/* Modules */}
        {MODULES.map(m => {
          const info = m.bits[scheme];
          return (
            <g key={m.label}>
              <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={5}
                fill={bitColor(info.bits)} stroke={COLORS.dark} strokeWidth={0.8} />
              <text x={m.x + m.w / 2} y={m.y + 15} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
                {m.label}
              </text>
              <text x={m.x + m.w / 2} y={m.y + 27} textAnchor="middle"
                fontSize="7" fontWeight="700" fill={COLORS.orange} fontFamily={FONTS.sans}>
                {info.type}
              </text>
              <text x={m.x + m.w / 2} y={m.y + 37} textAnchor="middle"
                fontSize="6" fill={COLORS.mid} fontFamily={FONTS.sans}>
                {info.bits} bpw
              </text>
            </g>
          );
        })}

        {/* Summary */}
        <rect x={120} y={260} width={340} height={50} rx={6}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={290} y={278} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.avgPrecision.replace('{bits}', avgBits.toFixed(1)).replace('{size}', layerSizeMB.toFixed(0))}
        </text>
        <text x={290} y={293} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {t.explanation}
        </text>

        {/* Legend */}
        <rect x={430} y={80} width={12} height={12} rx={2} fill="#dcfce7" stroke="#94a3b8" strokeWidth={0.5} />
        <text x={448} y={90} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>{t.legendHigh}</text>
        <rect x={430} y={98} width={12} height={12} rx={2} fill="#dbeafe" stroke="#94a3b8" strokeWidth={0.5} />
        <text x={448} y={108} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>{t.legendMedium}</text>
        <rect x={430} y={116} width={12} height={12} rx={2} fill="#fef3c7" stroke="#94a3b8" strokeWidth={0.5} />
        <text x={448} y={126} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>{t.legendLow}</text>
      </svg>
    </div>
  );
}
