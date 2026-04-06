import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function Box({ x, y, w, h, label, color, sublabel }: {
  x: number; y: number; w: number; h: number;
  label: string; color: string; sublabel?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={color} opacity="0.12" stroke={color} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + (sublabel ? -2 : 4)} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle"
          fontSize="8" fill={color} fontFamily={FONTS.sans} opacity="0.7">
          {sublabel}
        </text>
      )}
    </g>
  );
}

export default function HymbaParallelHeads({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '1. 输入 + Meta Tokens',
      step1Subtitle: 'Meta Tokens 拼接到输入序列前',
      concatenatedSeq: '拼接序列: [M₁, M₂, M₃, t₁, t₂, t₃, t₄, t₅]',
      metaTokensDesc: 'Meta tokens 是可学习参数，存储全局关键信息（如任务类型、语言特征）',
      metaTokensInfo: '减少 Attention 需要处理的有效序列长度 → 压缩 KV cache',
      step2Title: '2. 并行 Attention + SSM Heads',
      step2Subtitle: '同一层内：Attention 和 SSM 并行计算',
      inputSeq: '拼接序列 [M + tokens]',
      attnHeads: 'Attention Heads',
      attnDesc: '处理 [M + tokens] 序列',
      metaParticipate: 'Meta tokens 参与 Q/K/V 计算',
      ssmHeads: 'SSM Heads',
      ssmDesc: '仅处理 token 序列',
      noMetaTokens: '不使用 Meta tokens',
      output: '输出 = Attn + SSM',
      parallelInfo: '并行计算无额外延迟 · Attention 提供精确检索 · SSM 提供高效摘要',
      step3Title: '3. 输出融合 + Cross-layer KV Sharing',
      step3Subtitle: '层间 KV cache 共享 → 进一步压缩显存',
      sharedKv: '共享 KV',
      cache: 'Cache',
      hymbaStats: 'Hymba 1.5B: KV cache 比 Llama-3.2-3B 小 11.67× · Throughput 高 3.49×',
    },
    en: {
      step1Title: '1. Input + Meta Tokens',
      step1Subtitle: 'Meta Tokens concatenated before input sequence',
      concatenatedSeq: 'Concatenated sequence: [M₁, M₂, M₃, t₁, t₂, t₃, t₄, t₅]',
      metaTokensDesc: 'Meta tokens are learnable parameters, storing global key information (e.g., task type, language features)',
      metaTokensInfo: 'Reduce effective sequence length for Attention processing → Compress KV cache',
      step2Title: '2. Parallel Attention + SSM Heads',
      step2Subtitle: 'Within the same layer: Attention and SSM compute in parallel',
      inputSeq: 'Concatenated sequence [M + tokens]',
      attnHeads: 'Attention Heads',
      attnDesc: 'Process [M + tokens] sequence',
      metaParticipate: 'Meta tokens participate in Q/K/V computation',
      ssmHeads: 'SSM Heads',
      ssmDesc: 'Process only token sequence',
      noMetaTokens: 'Do not use Meta tokens',
      output: 'Output = Attn + SSM',
      parallelInfo: 'Parallel computation with no extra latency · Attention provides precise retrieval · SSM provides efficient summarization',
      step3Title: '3. Output Fusion + Cross-layer KV Sharing',
      step3Subtitle: 'Cross-layer KV cache sharing → Further compress memory',
      sharedKv: 'Shared KV',
      cache: 'Cache',
      hymbaStats: 'Hymba 1.5B: KV cache 11.67× smaller than Llama-3.2-3B · Throughput 3.49× higher',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step1Subtitle}
          </text>

          {/* Meta tokens */}
          {['M₁', 'M₂', 'M₃'].map((tok, i) => (
            <g key={i}>
              <rect x={80 + i * 50} y={45} width={44} height={28} rx={4}
                fill={COLORS.purple} opacity="0.15" stroke={COLORS.purple} strokeWidth="1.5" />
              <text x={102 + i * 50} y={64} textAnchor="middle" fontSize="11"
                fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.mono}>{tok}</text>
            </g>
          ))}

          {/* Separator */}
          <text x={237} y={64} fontSize="14" fill={COLORS.mid} fontFamily={FONTS.mono}>+</text>

          {/* Token embeddings */}
          {['t₁', 't₂', 't₃', 't₄', 't₅'].map((tok, i) => (
            <g key={`t-${i}`}>
              <rect x={255 + i * 50} y={45} width={44} height={28} rx={4}
                fill={COLORS.primary} opacity="0.12" stroke={COLORS.primary} strokeWidth="1" />
              <text x={277 + i * 50} y={64} textAnchor="middle" fontSize="11"
                fontWeight="500" fill={COLORS.primary} fontFamily={FONTS.mono}>{tok}</text>
            </g>
          ))}

          {/* Combined sequence */}
          <text x={W / 2} y={95} textAnchor="middle" fontSize="14" fill={COLORS.dark}
            fontFamily={FONTS.mono}>↓</text>
          <rect x={60} y={105} width={460} height={32} rx={5}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={126} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.concatenatedSeq}
          </text>

          <rect x={60} y={155} width={460} height={44} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={173} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.metaTokensDesc}
          </text>
          <text x={290} y={189} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.metaTokensInfo}
          </text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step2Subtitle}
          </text>

          {/* Input */}
          <Box x={200} y={40} w={180} h={28} label={t.inputSeq} color={COLORS.dark} />

          {/* Split arrow */}
          <line x1={240} y1={68} x2={140} y2={95} stroke={COLORS.mid} strokeWidth="1" />
          <line x1={340} y1={68} x2={440} y2={95} stroke={COLORS.mid} strokeWidth="1" />

          {/* Attention branch */}
          <Box x={50} y={95} w={180} h={40}
            label={t.attnHeads} sublabel={t.attnDesc} color={COLORS.orange} />
          <text x={140} y={150} textAnchor="middle" fontSize="8"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.metaParticipate}
          </text>

          {/* SSM branch */}
          <Box x={350} y={95} w={180} h={40}
            label={t.ssmHeads} sublabel={t.ssmDesc} color={COLORS.primary} />
          <text x={440} y={150} textAnchor="middle" fontSize="8"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.noMetaTokens}
          </text>

          {/* Merge */}
          <line x1={140} y1={158} x2={290} y2={188} stroke={COLORS.mid} strokeWidth="1" />
          <line x1={440} y1={158} x2={290} y2={188} stroke={COLORS.mid} strokeWidth="1" />
          <text x={290} y={184} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.mono}>⊕</text>

          <Box x={200} y={195} w={180} h={28} label={t.output} color={COLORS.green} />

          <rect x={60} y={235} width={460} height={20} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="0.5" />
          <text x={290} y={249} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.parallelInfo}
          </text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step3Subtitle}
          </text>

          {/* Layer stack with shared KV */}
          {[0, 1, 2, 3].map((i) => {
            const y = 45 + i * 45;
            return (
              <g key={i}>
                <rect x={100} y={y} width={240} height={32} rx={5}
                  fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
                {/* SSM half */}
                <rect x={102} y={y + 2} width={114} height={28} rx={3}
                  fill={COLORS.primary} opacity="0.1" stroke={COLORS.primary} strokeWidth="0.8" />
                <text x={159} y={y + 20} textAnchor="middle" fontSize="8"
                  fill={COLORS.primary} fontFamily={FONTS.sans}>SSM</text>
                {/* Attn half */}
                <rect x={222} y={y + 2} width={114} height={28} rx={3}
                  fill={COLORS.orange} opacity="0.1" stroke={COLORS.orange} strokeWidth="0.8" />
                <text x={279} y={y + 20} textAnchor="middle" fontSize="8"
                  fill={COLORS.orange} fontFamily={FONTS.sans}>Attn</text>
                {/* Layer label */}
                <text x={90} y={y + 20} textAnchor="end" fontSize="8"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>L{i + 1}</text>
              </g>
            );
          })}

          {/* Shared KV bracket */}
          <line x1={360} y1={45 + 16} x2={380} y2={45 + 16}
            stroke={COLORS.orange} strokeWidth="1" strokeDasharray="3 2" />
          <line x1={380} y1={45 + 16} x2={380} y2={45 + 3 * 45 + 16}
            stroke={COLORS.orange} strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1={360} y1={45 + 3 * 45 + 16} x2={380} y2={45 + 3 * 45 + 16}
            stroke={COLORS.orange} strokeWidth="1" strokeDasharray="3 2" />
          <text x={388} y={45 + 1.5 * 45 + 20} fontSize="8" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>{t.sharedKv}</text>
          <text x={388} y={45 + 1.5 * 45 + 32} fontSize="7"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.cache}</text>

          {/* Bottom summary */}
          <rect x={40} y={230} width={500} height={20} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="0.5" />
          <text x={290} y={244} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.hymbaStats}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
