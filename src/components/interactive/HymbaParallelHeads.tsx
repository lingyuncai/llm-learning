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

export default function HymbaParallelHeads() {
  const steps = [
    {
      title: '1. 输入 + Meta Tokens',
      content: (
        <svg viewBox={`0 0 ${W} 220`} className="w-full">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Meta Tokens 拼接到输入序列前
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
            拼接序列: [M₁, M₂, M₃, t₁, t₂, t₃, t₄, t₅]
          </text>

          <rect x={60} y={155} width={460} height={44} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={173} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Meta tokens 是可学习参数，存储全局关键信息（如任务类型、语言特征）
          </text>
          <text x={290} y={189} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            减少 Attention 需要处理的有效序列长度 → 压缩 KV cache
          </text>
        </svg>
      ),
    },
    {
      title: '2. 并行 Attention + SSM Heads',
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            同一层内：Attention 和 SSM 并行计算
          </text>

          {/* Input */}
          <Box x={200} y={40} w={180} h={28} label="拼接序列 [M + tokens]" color={COLORS.dark} />

          {/* Split arrow */}
          <line x1={240} y1={68} x2={140} y2={95} stroke={COLORS.mid} strokeWidth="1" />
          <line x1={340} y1={68} x2={440} y2={95} stroke={COLORS.mid} strokeWidth="1" />

          {/* Attention branch */}
          <Box x={50} y={95} w={180} h={40}
            label="Attention Heads" sublabel="处理 [M + tokens] 序列" color={COLORS.orange} />
          <text x={140} y={150} textAnchor="middle" fontSize="8"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Meta tokens 参与 Q/K/V 计算
          </text>

          {/* SSM branch */}
          <Box x={350} y={95} w={180} h={40}
            label="SSM Heads" sublabel="仅处理 token 序列" color={COLORS.primary} />
          <text x={440} y={150} textAnchor="middle" fontSize="8"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            不使用 Meta tokens
          </text>

          {/* Merge */}
          <line x1={140} y1={158} x2={290} y2={188} stroke={COLORS.mid} strokeWidth="1" />
          <line x1={440} y1={158} x2={290} y2={188} stroke={COLORS.mid} strokeWidth="1" />
          <text x={290} y={184} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.mono}>⊕</text>

          <Box x={200} y={195} w={180} h={28} label="输出 = Attn + SSM" color={COLORS.green} />

          <rect x={60} y={235} width={460} height={20} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="0.5" />
          <text x={290} y={249} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            并行计算无额外延迟 · Attention 提供精确检索 · SSM 提供高效摘要
          </text>
        </svg>
      ),
    },
    {
      title: '3. 输出融合 + Cross-layer KV Sharing',
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            层间 KV cache 共享 → 进一步压缩显存
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
            fill={COLORS.orange} fontFamily={FONTS.sans}>共享 KV</text>
          <text x={388} y={45 + 1.5 * 45 + 32} fontSize="7"
            fill={COLORS.mid} fontFamily={FONTS.sans}>Cache</text>

          {/* Bottom summary */}
          <rect x={40} y={230} width={500} height={20} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="0.5" />
          <text x={290} y={244} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Hymba 1.5B: KV cache 比 Llama-3.2-3B 小 11.67× · Throughput 高 3.49×
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
