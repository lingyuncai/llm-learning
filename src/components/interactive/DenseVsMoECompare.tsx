import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 260;

export default function DenseVsMoECompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Dense FFN vs MoE FFN',
      denseTransformer: 'Dense Transformer',
      moeTransformer: 'MoE Transformer',
      attention: 'Attention',
      ffn: 'FFN',
      router: 'Router',
      output: 'Output',
      totalParamsEqActive: 'Total params ≈ Active params',
      totalParamsGtActive: 'Total params >> Active params',
      denseExample: '例: 7B params → 7B active',
      moeExample: '例: Mixtral 47B total → ~13B active (top-2 of 8)',
    },
    en: {
      title: 'Dense FFN vs MoE FFN',
      denseTransformer: 'Dense Transformer',
      moeTransformer: 'MoE Transformer',
      attention: 'Attention',
      ffn: 'FFN',
      router: 'Router',
      output: 'Output',
      totalParamsEqActive: 'Total params ≈ Active params',
      totalParamsGtActive: 'Total params >> Active params',
      denseExample: 'e.g.: 7B params → 7B active',
      moeExample: 'e.g.: Mixtral 47B total → ~13B active (top-2 of 8)',
    },
  }[locale];

  const leftX = 40;
  const rightX = 310;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      {/* Dense side */}
      <text x={leftX + 110} y={46} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.denseTransformer}</text>

      {/* Input */}
      <rect x={leftX + 60} y={55} width={100} height={25} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={leftX + 110} y={71} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.attention}</text>

      {/* Single large FFN */}
      <rect x={leftX + 30} y={95} width={160} height={60} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={leftX + 110} y={122} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.ffn}</text>
      <text x={leftX + 110} y={140} textAnchor="middle" fontSize="7"
        fill={COLORS.mid} fontFamily={FONTS.mono}>d_model → 4·d_model → d_model</text>

      {/* Output */}
      <rect x={leftX + 60} y={170} width={100} height={25} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={leftX + 110} y={186} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.output}</text>

      {/* Stats */}
      <text x={leftX + 110} y={215} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.totalParamsEqActive}</text>
      <text x={leftX + 110} y={230} textAnchor="middle" fontSize="8"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.denseExample}
      </text>

      {/* MoE side */}
      <text x={rightX + 120} y={46} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.moeTransformer}</text>

      <rect x={rightX + 70} y={55} width={100} height={25} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={rightX + 120} y={71} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.attention}</text>

      {/* Router */}
      <rect x={rightX + 85} y={88} width={70} height={18} rx={9}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
      <text x={rightX + 120} y={100} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>{t.router}</text>

      {/* Multiple small experts */}
      {Array.from({ length: 8 }, (_, i) => {
        const ex = rightX + 5 + i * 30;
        const ey = 112;
        const isActive = i === 2 || i === 4;
        return (
          <rect key={i} x={ex} y={ey} width={26} height={40} rx={4}
            fill={isActive ? '#fef3c7' : COLORS.masked}
            stroke={isActive ? COLORS.orange : '#d1d5db'}
            strokeWidth={isActive ? 1.5 : 0.5} />
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const ex = rightX + 5 + i * 30;
        return (
          <text key={i} x={ex + 13} y={136} textAnchor="middle" fontSize="7"
            fill={i === 2 || i === 4 ? COLORS.orange : COLORS.mid}
            fontWeight={i === 2 || i === 4 ? '700' : '400'}
            fontFamily={FONTS.sans}>
            E{i}
          </text>
        );
      })}

      <rect x={rightX + 70} y={170} width={100} height={25} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={rightX + 120} y={186} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.output}</text>

      {/* Stats */}
      <text x={rightX + 120} y={215} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.totalParamsGtActive}</text>
      <text x={rightX + 120} y={230} textAnchor="middle" fontSize="8"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.moeExample}
      </text>

      {/* Divider */}
      <line x1={W / 2} y1={40} x2={W / 2} y2={240}
        stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />
    </svg>
  );
}
