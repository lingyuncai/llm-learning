import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 520;

export default function JambaArchDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Jamba 架构：交替式 Hybrid + MoE',
      subtitle: '52B total / 12B active · 256K context · 单卡 80GB 可部署',
      attention: 'Attention',
      ffn: 'FFN (SwiGLU)',
      kvCacheOnlyHere: 'KV Cache 仅此层生成',
      kvCacheSize: 'KV cache 大小 = 1/8 纯 Transformer',
      fixedState: '固定大小状态向量',
      noGrowth: '不随序列长度增长',
      paramDistribution: '参数分布',
      mambaLayer: 'Mamba 层',
      attentionLayer: 'Attention 层',
      moeExperts: 'MoE experts',
      mambaLayerLegend: 'Mamba 层',
      attentionLayerLegend: 'Attention 层',
      moeLegend: 'MoE (16E/2A)',
    },
    en: {
      title: 'Jamba Architecture: Interleaved Hybrid + MoE',
      subtitle: '52B total / 12B active · 256K context · Deployable on single 80GB GPU',
      attention: 'Attention',
      ffn: 'FFN (SwiGLU)',
      kvCacheOnlyHere: 'KV Cache only generated here',
      kvCacheSize: 'KV cache size = 1/8 pure Transformer',
      fixedState: 'Fixed-size state vector',
      noGrowth: 'Does not grow with sequence length',
      paramDistribution: 'Parameter Distribution',
      mambaLayer: 'Mamba Layers',
      attentionLayer: 'Attention Layers',
      moeExperts: 'MoE experts',
      mambaLayerLegend: 'Mamba Layers',
      attentionLayerLegend: 'Attention Layers',
      moeLegend: 'MoE (16E/2A)',
    },
  }[locale];
  const layerW = 180;
  const layerH = 18;
  const gap = 3;
  const stackX = 80;
  const stackY = 50;

  // One group: 7 Mamba + 1 Attention
  const groupLayers: { type: 'mamba' | 'attention'; moe: boolean }[] = [
    { type: 'mamba', moe: false },
    { type: 'mamba', moe: true },
    { type: 'mamba', moe: false },
    { type: 'mamba', moe: false },
    { type: 'mamba', moe: true },
    { type: 'mamba', moe: false },
    { type: 'mamba', moe: false },
    { type: 'attention', moe: false },
  ];

  // Show 2 full groups + "..." + partial
  const allLayers = [...groupLayers, ...groupLayers];

  // Pie chart data
  const pieData = [
    { label: t.mambaLayer, pct: 0.45, color: COLORS.primary },
    { label: t.attentionLayer, pct: 0.15, color: COLORS.orange },
    { label: t.moeExperts, pct: 0.40, color: COLORS.purple },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={38} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {/* Layer stack */}
      {allLayers.map((l, i) => {
        const y = stackY + i * (layerH + gap);
        const fill = l.type === 'mamba' ? COLORS.primary : COLORS.orange;
        return (
          <g key={i}>
            <rect x={stackX} y={y} width={layerW} height={layerH} rx={3}
              fill={fill} opacity="0.15" stroke={fill} strokeWidth="1" />
            <text x={stackX + layerW / 2} y={y + layerH / 2 + 3} textAnchor="middle"
              fontSize="8" fontWeight="500" fill={fill} fontFamily={FONTS.sans}>
              {l.type === 'mamba' ? 'Mamba' : 'Attention'}
            </text>
            {l.moe && (
              <g>
                <rect x={stackX + layerW + 8} y={y} width={55} height={layerH} rx={3}
                  fill={COLORS.purple} opacity="0.12" stroke={COLORS.purple} strokeWidth="0.8" />
                <text x={stackX + layerW + 35} y={y + layerH / 2 + 3} textAnchor="middle"
                  fontSize="7" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.mono}>
                  16E/2A
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Group brackets */}
      {[0, 1].map((g) => {
        const y1 = stackY + g * 8 * (layerH + gap);
        const y2 = y1 + 8 * (layerH + gap) - gap;
        return (
          <g key={`grp-${g}`}>
            <line x1={stackX - 12} y1={y1} x2={stackX - 12} y2={y2}
              stroke={COLORS.mid} strokeWidth="1.5" />
            <line x1={stackX - 12} y1={y1} x2={stackX - 6} y2={y1}
              stroke={COLORS.mid} strokeWidth="1.5" />
            <line x1={stackX - 12} y1={y2} x2={stackX - 6} y2={y2}
              stroke={COLORS.mid} strokeWidth="1.5" />
            <text x={stackX - 16} y={(y1 + y2) / 2 + 3} textAnchor="end"
              fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
              ×10
            </text>
          </g>
        );
      })}

      {/* "..." */}
      <text x={stackX + layerW / 2} y={stackY + 16 * (layerH + gap) + 15}
        textAnchor="middle" fontSize="14" fill={COLORS.mid} fontFamily={FONTS.mono}>
        ⋮
      </text>

      {/* Right side annotations */}
      {(() => {
        const annotX = stackX + layerW + 80;
        const attnY = stackY + 7 * (layerH + gap) + layerH / 2;
        const mambaY = stackY + 3 * (layerH + gap) + layerH / 2;
        return (
          <g>
            <line x1={stackX + layerW + 4} y1={attnY} x2={annotX - 4} y2={attnY}
              stroke={COLORS.orange} strokeWidth="0.8" strokeDasharray="3 2" />
            <text x={annotX} y={attnY - 4} fontSize="8" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>{t.kvCacheOnlyHere}</text>
            <text x={annotX} y={attnY + 10} fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>{t.kvCacheSize}</text>

            <line x1={stackX + layerW + 4} y1={mambaY} x2={annotX - 4} y2={mambaY}
              stroke={COLORS.primary} strokeWidth="0.8" strokeDasharray="3 2" />
            <text x={annotX} y={mambaY - 4} fontSize="8" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans}>{t.fixedState}</text>
            <text x={annotX} y={mambaY + 10} fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>{t.noGrowth}</text>
          </g>
        );
      })()}

      {/* Pie chart */}
      {(() => {
        const cx = 440;
        const cy = 430;
        const r = 40;
        let startAngle = 0;
        return (
          <g>
            <text x={cx} y={cy - r - 12} textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{t.paramDistribution}</text>
            {pieData.map((d, i) => {
              const angle = d.pct * Math.PI * 2;
              const x1 = cx + r * Math.cos(startAngle);
              const y1 = cy + r * Math.sin(startAngle);
              const x2 = cx + r * Math.cos(startAngle + angle);
              const y2 = cy + r * Math.sin(startAngle + angle);
              const largeArc = angle > Math.PI ? 1 : 0;
              const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
              const labelAngle = startAngle + angle / 2;
              const lx = cx + (r + 22) * Math.cos(labelAngle);
              const ly = cy + (r + 22) * Math.sin(labelAngle);
              startAngle += angle;
              return (
                <g key={i}>
                  <path d={path} fill={d.color} opacity="0.6" stroke="#fff" strokeWidth="1" />
                  <text x={lx} y={ly + 3} textAnchor="middle" fontSize="7" fontWeight="600"
                    fill={d.color} fontFamily={FONTS.sans}>
                    {d.label} {(d.pct * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </g>
        );
      })()}

      {/* Legend */}
      <g transform="translate(40, 400)">
        <rect x={0} y={0} width={12} height={12} rx={2} fill={COLORS.primary} opacity="0.6" />
        <text x={16} y={10} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.mambaLayerLegend}</text>
        <rect x={80} y={0} width={12} height={12} rx={2} fill={COLORS.orange} opacity="0.6" />
        <text x={96} y={10} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.attentionLayerLegend}</text>
        <rect x={180} y={0} width={12} height={12} rx={2} fill={COLORS.purple} opacity="0.6" />
        <text x={196} y={10} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.moeLegend}</text>
      </g>
    </svg>
  );
}
