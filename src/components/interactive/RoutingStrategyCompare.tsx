import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

const TOKENS = ['I', 'love', 'large', 'models'];
const EXPERTS = ['E0', 'E1', 'E2', 'E3'];

// Token-choice: each token picks top-K experts
const tokenChoices = [
  [1, 2],  // "I" → E1, E2
  [0, 3],  // "love" → E0, E3
  [2, 3],  // "large" → E2, E3
  [1, 2],  // "models" → E1, E2
];

// Expert-choice: each expert picks top-K tokens
const expertChoices = [
  [1],     // E0 picks "love"
  [0, 3],  // E1 picks "I", "models"
  [0, 2],  // E2 picks "I", "large"
  [1, 2],  // E3 picks "love", "large"
];

const tokenY = 60;
const expertY = 160;
const tokenStartX = 80;
const expertStartX = 80;
const tokenGap = 120;
const expertGap = 120;

const steps = [
  {
    title: 'Token-Choice',
    content: (
      <StepSvg h={260}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Token-Choice Routing: 每个 token 选 top-K expert
        </text>

        <text x={20} y={tokenY + 15} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Tokens:
        </text>
        <text x={20} y={expertY + 15} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Experts:
        </text>

        {/* Tokens */}
        {TOKENS.map((t, i) => (
          <g key={i}>
            <rect x={tokenStartX + i * tokenGap} y={tokenY} width={70} height={28} rx={14}
              fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={tokenStartX + i * tokenGap + 35} y={tokenY + 17}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans}>{t}</text>
          </g>
        ))}

        {/* Experts */}
        {EXPERTS.map((e, i) => (
          <g key={i}>
            <rect x={expertStartX + i * expertGap} y={expertY} width={70} height={28} rx={6}
              fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={expertStartX + i * expertGap + 35} y={expertY + 17}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>{e}</text>
          </g>
        ))}

        {/* Arrows: token → expert */}
        <defs>
          <marker id="rsc-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>
        {tokenChoices.flatMap((choices, ti) =>
          choices.map((ei, ci) => {
            const tx = tokenStartX + ti * tokenGap + 35;
            const ex = expertStartX + ei * expertGap + 35;
            return (
              <line key={`${ti}-${ci}`}
                x1={tx} y1={tokenY + 28}
                x2={ex} y2={expertY}
                stroke={HEAD_COLORS[ti % HEAD_COLORS.length]}
                strokeWidth={1.5} opacity={0.6}
                markerEnd="url(#rsc-arr)" />
            );
          })
        )}

        <text x={W / 2} y={215} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          每个 token 的视角出发 — 简单，但 expert 负载可能不均
        </text>
        <text x={W / 2} y={235} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          采用者：Mixtral (top-2), Switch Transformer (top-1), DeepSeek-V3 (top-8)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Expert-Choice',
    content: (
      <StepSvg h={260}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Expert-Choice Routing: 每个 expert 选 top-K token
        </text>

        <text x={20} y={tokenY + 15} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Tokens:
        </text>
        <text x={20} y={expertY + 15} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Experts:
        </text>

        {TOKENS.map((t, i) => (
          <g key={i}>
            <rect x={tokenStartX + i * tokenGap} y={tokenY} width={70} height={28} rx={14}
              fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={tokenStartX + i * tokenGap + 35} y={tokenY + 17}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans}>{t}</text>
          </g>
        ))}

        {EXPERTS.map((e, i) => (
          <g key={i}>
            <rect x={expertStartX + i * expertGap} y={expertY} width={70} height={28} rx={6}
              fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={expertStartX + i * expertGap + 35} y={expertY + 17}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans}>{e}</text>
          </g>
        ))}

        {/* Arrows: expert → token (reversed direction visually) */}
        <defs>
          <marker id="rsc-arr2" viewBox="0 0 10 10" refX="0" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 10 0 L 0 5 L 10 10 z" fill={COLORS.orange} />
          </marker>
        </defs>
        {expertChoices.flatMap((choices, ei) =>
          choices.map((ti, ci) => {
            const tx = tokenStartX + ti * tokenGap + 35;
            const ex = expertStartX + ei * expertGap + 35;
            return (
              <line key={`${ei}-${ci}`}
                x1={ex} y1={expertY}
                x2={tx} y2={tokenY + 28}
                stroke={HEAD_COLORS[(ei + 4) % HEAD_COLORS.length]}
                strokeWidth={1.5} opacity={0.6}
                markerEnd="url(#rsc-arr2)" />
            );
          })
        )}

        <text x={W / 2} y={215} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          每个 expert 的视角出发 — 负载天然均匀，但某些 token 可能被丢弃
        </text>
        <text x={W / 2} y={235} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          采用者：部分 Switch Transformer 变体
        </text>
      </StepSvg>
    ),
  },
];

export default function RoutingStrategyCompare() {
  return <StepNavigator steps={steps} />;
}
