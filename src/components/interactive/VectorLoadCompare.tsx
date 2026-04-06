// src/components/interactive/VectorLoadCompare.tsx
// Static SVG: scalar load vs float4 vector load comparison
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;

export default function VectorLoadCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const colLeft = 145;
  const colRight = 435;

  const t = {
    zh: {
      title: '向量化访存: float vs float4',
      scalarLoad: '标量加载 (4 条指令)',
      vectorLoad: '向量加载 (1 条指令)',
      vectorDesc: '一次读取 128 bits = 4 个 float',
      compare: '对比',
      instCount: '指令数',
      totalTransfer: '总传输量',
      issueOverhead: '指令发射开销',
      scalarInst: '4 条 LDG.32',
      vectorInst: '1 条 LDG.128',
      scalarTransfer: '4 x 32b = 128b',
      vectorTransfer: '1 x 128b = 128b',
      scalarSlots: '4 个调度槽',
      vectorSlots: '1 个调度槽',
    },
    en: {
      title: 'Vectorized Memory Access: float vs float4',
      scalarLoad: 'Scalar Load (4 instructions)',
      vectorLoad: 'Vector Load (1 instruction)',
      vectorDesc: 'One load: 128 bits = 4 floats',
      compare: 'Comparison',
      instCount: 'Instruction Count',
      totalTransfer: 'Total Transfer',
      issueOverhead: 'Instruction Issue Overhead',
      scalarInst: '4x LDG.32',
      vectorInst: '1x LDG.128',
      scalarTransfer: '4 x 32b = 128b',
      vectorTransfer: '1 x 128b = 128b',
      scalarSlots: '4 schedule slots',
      vectorSlots: '1 schedule slot',
    },
  }[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Scalar vs vector load comparison">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      {/* Left: scalar loads */}
      <rect x={20} y={38} width={250} height={22} rx={4}
        fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
      <text x={colLeft} y={52} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>{t.scalarLoad}</text>

      {Array.from({ length: 4 }).map((_, i) => {
        const y = 70 + i * 30;
        return (
          <g key={i}>
            <rect x={30} y={y} width={230} height={22} rx={3}
              fill="#f8fafc" stroke="#cbd5e1" strokeWidth={0.5} />
            <text x={40} y={y + 14} fontSize="7.5" fill={COLORS.dark} fontFamily={FONTS.mono}>
              LDG.32 R{i}, [addr + {i * 4}]
            </text>
            {/* 32-bit bus usage */}
            <rect x={200} y={y + 3} width={50} height={16} rx={2}
              fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
            <rect x={200} y={y + 3} width={12} height={16} rx={2}
              fill={COLORS.red} opacity={0.5} />
            <text x={225} y={y + 14} textAnchor="middle" fontSize="6"
              fill={COLORS.red} fontFamily={FONTS.mono}>32b</text>
          </g>
        );
      })}

      {/* Right: vector load */}
      <rect x={310} y={38} width={250} height={22} rx={4}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
      <text x={colRight} y={52} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>{t.vectorLoad}</text>

      <rect x={320} y={70} width={230} height={50} rx={3}
        fill="#f8fafc" stroke={COLORS.green} strokeWidth={1} />
      <text x={330} y={88} fontSize="7.5" fill={COLORS.dark} fontFamily={FONTS.mono}>
        LDG.128 R0:R3, [addr]
      </text>
      <text x={330} y={104} fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
        {t.vectorDesc}
      </text>
      {/* 128-bit bus usage */}
      <rect x={490} y={76} width={50} height={16} rx={2}
        fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
      <rect x={490} y={76} width={50} height={16} rx={2}
        fill={COLORS.green} opacity={0.5} />
      <text x={515} y={87} textAnchor="middle" fontSize="6"
        fill={COLORS.green} fontFamily={FONTS.mono}>128b</text>

      {/* Comparison */}
      <rect x={40} y={185} width={500} height={85} rx={5}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      <text x={W / 2} y={205} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.compare}</text>

      {[
        { label: t.instCount, left: t.scalarInst, right: t.vectorInst, better: 'right' },
        { label: t.totalTransfer, left: t.scalarTransfer, right: t.vectorTransfer, better: 'same' },
        { label: t.issueOverhead, left: t.scalarSlots, right: t.vectorSlots, better: 'right' },
      ].map((row, i) => {
        const y = 218 + i * 16;
        return (
          <g key={i}>
            <text x={100} y={y} textAnchor="middle" fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{row.label}</text>
            <text x={250} y={y} textAnchor="middle" fontSize="7.5"
              fill={row.better === 'left' ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
              {row.left}
            </text>
            <text x={430} y={y} textAnchor="middle" fontSize="7.5"
              fill={row.better === 'right' ? COLORS.green : row.better === 'same' ? COLORS.dark : COLORS.red}
              fontFamily={FONTS.mono}>
              {row.right}
            </text>
          </g>
        );
      })}

      {/* Code hint */}
      <rect x={40} y={H - 24} width={500} height={18} rx={3}
        fill="#1e293b" />
      <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="7.5"
        fill="#e2e8f0" fontFamily={FONTS.mono}>
        float4 tmp = *reinterpret_cast{'<'}float4*{'>'}(&A[row * K + k]);  // 128-bit aligned load
      </text>
    </svg>
  );
}
