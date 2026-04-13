import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface BarData {
  label: string;
  mamba: number;
  mambaLabel: string;
  transformer: number;
  transformerLabel: string;
}

const PPL_DATA: BarData[] = [
  { label: '370M', mamba: 8.14, mambaLabel: 'Mamba', transformer: 8.55, transformerLabel: 'Pythia' },
  { label: '1.4B', mamba: 6.80, mambaLabel: 'Mamba', transformer: 7.51, transformerLabel: 'Pythia' },
  { label: '2.8B', mamba: 6.22, mambaLabel: 'Mamba', transformer: 6.73, transformerLabel: 'Pythia' },
];

interface StrengthItem {
  text: string;
  isStrength: boolean;
}

export default function MambaBenchmarkChart({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [view, setView] = useState<'throughput' | 'tradeoffs'>('throughput');

  const t = {
    zh: {
      title: 'Mamba vs Transformer 性能对比',
      pplTitle: 'Pile 数据集 Perplexity（越低越好）',
      paramScale: '参数量',
      pplLabel: 'Perplexity',
      downstreamTitle: '下游任务平均准确率（%）',
      throughputBtn: '推理吞吐量',
      tradeoffsBtn: '强项 vs 弱项',
      throughputTitle: '推理吞吐量（A100 80GB）',
      throughputNote: 'Mamba 比同参数 Transformer 快 5×（prompt 2048 + gen 128）',
      strengths: '强项',
      weaknesses: '弱项',
      strengthItems: [
        { text: '线性训练复杂度 O(L)', isStrength: true },
        { text: '固定大小推理缓存 O(1)', isStrength: true },
        { text: '5× 推理吞吐量', isStrength: true },
        { text: '选择性复制 99.8% 准确率', isStrength: true },
        { text: '半参数量匹配 Transformer 质量', isStrength: true },
        { text: '多查询关联召回 (MQAR) 较弱', isStrength: false },
        { text: 'In-context learning 弱于 Attention', isStrength: false },
        { text: '固定状态维度限制精确复制能力', isStrength: false },
      ] as StrengthItem[],
    },
    en: {
      title: 'Mamba vs Transformer Performance',
      pplTitle: 'Pile Perplexity (lower is better)',
      paramScale: 'Parameters',
      pplLabel: 'Perplexity',
      downstreamTitle: 'Downstream Avg Accuracy (%)',
      throughputBtn: 'Inference Throughput',
      tradeoffsBtn: 'Strengths vs Weaknesses',
      throughputTitle: 'Inference Throughput (A100 80GB)',
      throughputNote: 'Mamba is 5× faster than same-size Transformer (prompt 2048 + gen 128)',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      strengthItems: [
        { text: 'Linear training complexity O(L)', isStrength: true },
        { text: 'Fixed-size inference cache O(1)', isStrength: true },
        { text: '5× inference throughput', isStrength: true },
        { text: 'Selective copying: 99.8% accuracy', isStrength: true },
        { text: 'Half params matches Transformer quality', isStrength: true },
        { text: 'MQAR (multi-query recall) is weak', isStrength: false },
        { text: 'In-context learning weaker than Attention', isStrength: false },
        { text: 'Fixed state dim limits exact copying', isStrength: false },
      ] as StrengthItem[],
    },
  }[locale];

  // PPL bar chart dimensions
  const chartX = 60;
  const chartY = 55;
  const chartW = 460;
  const chartH = 100;
  const barGroupW = chartW / PPL_DATA.length;
  const barW = 40;
  const pplMin = 5.5;
  const pplMax = 9.0;
  const pplRange = pplMax - pplMin;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Title */}
      <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.title}</text>

      {/* PPL section header */}
      <text x={W / 2} y={45} textAnchor="middle" fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.pplTitle}</text>

      {/* PPL bars */}
      {PPL_DATA.map((d, i) => {
        const gx = chartX + i * barGroupW + (barGroupW - barW * 2 - 8) / 2;
        const mambaH = ((d.mamba - pplMin) / pplRange) * chartH;
        const transH = ((d.transformer - pplMin) / pplRange) * chartH;
        return (
          <g key={i}>
            {/* Scale label */}
            <text x={gx + barW + 4} y={chartY + chartH + 16} textAnchor="middle"
              fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
              {d.label}
            </text>
            {/* Mamba bar */}
            <rect x={gx} y={chartY + chartH - mambaH} width={barW} height={mambaH}
              fill={COLORS.primary} opacity={0.8} rx={3} />
            <text x={gx + barW / 2} y={chartY + chartH - mambaH - 4} textAnchor="middle"
              fontSize="8" fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.mono}>
              {d.mamba.toFixed(2)}
            </text>
            {/* Transformer bar */}
            <rect x={gx + barW + 8} y={chartY + chartH - transH} width={barW} height={transH}
              fill={COLORS.orange} opacity={0.7} rx={3} />
            <text x={gx + barW + 8 + barW / 2} y={chartY + chartH - transH - 4} textAnchor="middle"
              fontSize="8" fontWeight="700" fill={COLORS.orange} fontFamily={FONTS.mono}>
              {d.transformer.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* PPL legend */}
      <rect x={chartX} y={chartY + chartH + 24} width={10} height={10} fill={COLORS.primary} rx={2} />
      <text x={chartX + 14} y={chartY + chartH + 33} fontSize="9"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Mamba</text>
      <rect x={chartX + 70} y={chartY + chartH + 24} width={10} height={10} fill={COLORS.orange} rx={2} />
      <text x={chartX + 84} y={chartY + chartH + 33} fontSize="9"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Pythia (Transformer)</text>

      {/* Downstream accuracy key insight */}
      <rect x={chartX + 220} y={chartY + chartH + 20} width={240} height={18} rx={4}
        fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="0.5" />
      <text x={chartX + 340} y={chartY + chartH + 33} textAnchor="middle"
        fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
        {locale === 'zh'
          ? 'Mamba-2.8B (63.3%) > Pythia-6.9B (61.7%)'
          : 'Mamba-2.8B (63.3%) > Pythia-6.9B (61.7%)'}
      </text>

      {/* Toggle buttons */}
      {[
        { key: 'throughput' as const, label: t.throughputBtn },
        { key: 'tradeoffs' as const, label: t.tradeoffsBtn },
      ].map((btn, i) => {
        const bx = W / 2 - 130 + i * 140;
        const by = 200;
        const isActive = view === btn.key;
        return (
          <g key={btn.key} onClick={() => setView(btn.key)} cursor="pointer">
            <rect x={bx} y={by} width={120} height={26} rx={13}
              fill={isActive ? COLORS.primary : COLORS.bgAlt}
              stroke={isActive ? COLORS.primary : COLORS.light} strokeWidth="1.5" />
            <text x={bx + 60} y={by + 17} textAnchor="middle" fontSize="10" fontWeight="600"
              fill={isActive ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
              {btn.label}
            </text>
          </g>
        );
      })}

      {/* Bottom panel */}
      {view === 'throughput' ? (
        <g>
          <text x={W / 2} y={250} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.throughputTitle}</text>

          {/* Simple throughput comparison bars */}
          {[
            { label: 'Transformer', value: 1, color: COLORS.orange },
            { label: 'Mamba', value: 5, color: COLORS.primary },
          ].map((d, i) => {
            const by = 265 + i * 35;
            const maxBarW = 350;
            const bw = (d.value / 5) * maxBarW;
            return (
              <g key={d.label}>
                <text x={chartX + 70} y={by + 14} textAnchor="end" fontSize="10"
                  fill={COLORS.dark} fontFamily={FONTS.sans}>{d.label}</text>
                <rect x={chartX + 80} y={by} width={bw} height={22} rx={4}
                  fill={d.color} opacity={0.75} />
                <text x={chartX + 85 + bw} y={by + 15} fontSize="10" fontWeight="700"
                  fill={d.color} fontFamily={FONTS.mono}>{d.value}×</text>
              </g>
            );
          })}

          <text x={W / 2} y={355} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.throughputNote}</text>
        </g>
      ) : (
        <g>
          {/* Strengths column */}
          <text x={150} y={250} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.sans}>✓ {t.strengths}</text>
          {t.strengthItems.filter(s => s.isStrength).map((s, i) => (
            <text key={`s-${i}`} x={30} y={272 + i * 18} fontSize="9"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              • {s.text}
            </text>
          ))}

          {/* Weaknesses column */}
          <text x={430} y={250} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>✗ {t.weaknesses}</text>
          {t.strengthItems.filter(s => !s.isStrength).map((s, i) => (
            <text key={`w-${i}`} x={310} y={272 + i * 18} fontSize="9"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              • {s.text}
            </text>
          ))}

          {/* Info theory note */}
          <text x={W / 2} y={355} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {locale === 'zh'
              ? 'SSM 的固定 N 维状态 = 有损压缩 → 擅长摘要和模式识别，不擅长精确检索'
              : 'Fixed N-dim state = lossy compression → good at summarization, not exact retrieval'}
          </text>
        </g>
      )}
    </svg>
  );
}
