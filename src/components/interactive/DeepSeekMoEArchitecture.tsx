import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

export default function DeepSeekMoEArchitecture({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'DeepSeek MoE: Shared Expert + Fine-Grained Routed Expert',
      subtitle: 'DeepSeek-V3: 1 shared expert + 256 routed experts, top-8',
      tokenX: 'Token x',
      sharedExpert: 'Shared Expert',
      allTokens: '所有 token 必经',
      routerTopK: 'Router (Top-8)',
      output: 'Output',
      sharedLegend: 'Shared (所有 token) — 兜底通用知识',
      routedLegend: 'Routed (Top-K 选择) — 细粒度专业化',
    },
    en: {
      title: 'DeepSeek MoE: Shared Expert + Fine-Grained Routed Expert',
      subtitle: 'DeepSeek-V3: 1 shared expert + 256 routed experts, top-8',
      tokenX: 'Token x',
      sharedExpert: 'Shared Expert',
      allTokens: 'All tokens pass through',
      routerTopK: 'Router (Top-8)',
      output: 'Output',
      sharedLegend: 'Shared (all tokens) — General knowledge fallback',
      routedLegend: 'Routed (Top-K selection) — Fine-grained specialization',
    },
  }[locale];

  const numRouted = 8; // showing 8 of 256 for visual clarity
  const inputY = 45;
  const routerY = 95;
  const sharedY = 130;
  const routedY = 130;
  const mergeY = 200;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      <text x={W / 2} y={36} textAnchor="middle" fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      <defs>
        <marker id="ds-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Input token */}
      <rect x={W / 2 - 50} y={inputY} width={100} height={25} rx={12}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={W / 2} y={inputY + 16} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.tokenX}</text>

      {/* Shared expert path (left) */}
      <line x1={W / 2 - 30} y1={inputY + 25} x2={100} y2={sharedY}
        stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#ds-arr)" />

      <rect x={40} y={sharedY} width={120} height={45} rx={6}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={2} />
      <text x={100} y={sharedY + 18} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.green} fontFamily={FONTS.sans}>{t.sharedExpert}</text>
      <text x={100} y={sharedY + 32} textAnchor="middle" fontSize="7"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{t.allTokens}</text>

      {/* Router */}
      <line x1={W / 2 + 30} y1={inputY + 25} x2={W / 2 + 30} y2={routerY}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#ds-arr)" />

      <rect x={W / 2 - 10} y={routerY} width={80} height={18} rx={9}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={W / 2 + 30} y={routerY + 12} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.routerTopK}</text>

      {/* Routed experts */}
      {Array.from({ length: numRouted }, (_, i) => {
        const ex = 210 + i * 42;
        const isActive = i < 3; // highlight 3 as "selected"
        return (
          <g key={i}>
            <line x1={W / 2 + 30} y1={routerY + 18}
              x2={ex + 16} y2={routedY}
              stroke={isActive ? COLORS.orange : '#d1d5db'} strokeWidth={1}
              opacity={isActive ? 0.8 : 0.3} />
            <rect x={ex} y={routedY} width={32} height={45} rx={4}
              fill={isActive ? '#fef3c7' : COLORS.masked}
              stroke={isActive ? COLORS.orange : '#d1d5db'}
              strokeWidth={isActive ? 1.5 : 0.5} />
            <text x={ex + 16} y={routedY + 18} textAnchor="middle"
              fontSize="7" fontWeight={isActive ? '700' : '400'}
              fill={isActive ? COLORS.orange : COLORS.mid} fontFamily={FONTS.sans}>
              R{i}
            </text>
            {i === numRouted - 1 && (
              <text x={ex + 42} y={routedY + 22} fontSize="8"
                fill={COLORS.mid} fontFamily={FONTS.sans}>
                ...×256
              </text>
            )}
          </g>
        );
      })}

      {/* Merge */}
      <line x1={100} y1={sharedY + 45} x2={W / 2} y2={mergeY}
        stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#ds-arr)" />
      <line x1={320} y1={routedY + 45} x2={W / 2} y2={mergeY}
        stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#ds-arr)" />

      <rect x={W / 2 - 50} y={mergeY} width={100} height={25} rx={6}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={W / 2} y={mergeY + 16} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.output}</text>

      {/* Legend */}
      <rect x={30} y={H - 22} width={10} height={10} rx={2}
        fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
      <text x={44} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.sharedLegend}
      </text>

      <rect x={250} y={H - 22} width={10} height={10} rx={2}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={264} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.routedLegend}
      </text>
    </svg>
  );
}
