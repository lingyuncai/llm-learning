import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function TokenBox({ x, y, text, variant }: {
  x: number; y: number; text: string;
  variant: 'cached' | 'new' | 'reused' | 'neutral';
}) {
  const fills = {
    cached: '#dbeafe', new: '#fef3c7', reused: '#dcfce7', neutral: '#f1f5f9',
  };
  const strokes = {
    cached: COLORS.primary, new: COLORS.orange, reused: COLORS.green, neutral: '#94a3b8',
  };
  const textFills = {
    cached: COLORS.primary, new: COLORS.orange, reused: COLORS.green, neutral: COLORS.mid,
  };
  return (
    <g>
      <rect x={x} y={y} width={60} height={26} rx={4}
        fill={fills[variant]} stroke={strokes[variant]} strokeWidth={1.2} />
      <text x={x + 30} y={y + 16} textAnchor="middle" fontSize="7.5"
        fontWeight="600" fill={textFills[variant]} fontFamily={FONTS.sans}>{text}</text>
    </g>
  );
}

const steps = [
  {
    title: 'Step 1: 首次请求 — 完整 Prefill',
    content: (
      <StepSvg h={150}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>请求: "解释量子计算"</text>
        <TokenBox x={20} y={30} text="解释" variant="neutral" />
        <TokenBox x={90} y={30} text="量子" variant="neutral" />
        <TokenBox x={160} y={30} text="计算" variant="neutral" />
        <text x={250} y={47} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          → 完整 prefill (3 tokens)
        </text>

        <text x={20} y={82} fontSize="7" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>KV Cache 状态:</text>
        <TokenBox x={20} y={90} text="解释" variant="cached" />
        <TokenBox x={90} y={90} text="量子" variant="cached" />
        <TokenBox x={160} y={90} text="计算" variant="cached" />
        <text x={250} y={107} fontSize="7" fill={COLORS.primary} fontFamily={FONTS.sans}>
          ✓ 缓存了 3 个 token 的 KV
        </text>
        <text x={W / 2} y={135} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          hash("解释量子计算") → 存入 prefix cache 索引
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: 新请求 — 前缀匹配',
    content: (
      <StepSvg h={150}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>新请求: "解释量子纠缠"</text>
        <TokenBox x={20} y={30} text="解释" variant="reused" />
        <TokenBox x={90} y={30} text="量子" variant="reused" />
        <TokenBox x={160} y={30} text="纠缠" variant="new" />

        <text x={20} y={82} fontSize="7" fontWeight="600" fill={COLORS.green}
          fontFamily={FONTS.sans}>前缀匹配:</text>
        <text x={20} y={96} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          hash("解释量子") → 命中缓存! 前 2 个 token 的 KV 可复用
        </text>
        <text x={20} y={112} fontSize="7" fill={COLORS.orange} fontFamily={FONTS.sans}>
          "纠缠" ≠ "计算" → 从位置 2 开始分歧 → 只需 prefill 1 个新 token
        </text>
        <text x={W / 2} y={140} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          最长公共前缀: "解释量子" (2 tokens)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: 复用 KV Cache — 节省计算',
    content: (
      <StepSvg h={170}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>执行策略:</text>

        {/* Reused tokens */}
        <TokenBox x={20} y={35} text="解释" variant="reused" />
        <TokenBox x={90} y={35} text="量子" variant="reused" />
        <text x={170} y={52} fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
          ← KV 直接复用 (跳过 prefill)
        </text>

        {/* New token */}
        <TokenBox x={20} y={70} text="纠缠" variant="new" />
        <text x={100} y={87} fontSize="7" fill={COLORS.orange} fontFamily={FONTS.sans}>
          ← 仅 prefill 此 token (1 次 forward)
        </text>

        {/* Stats */}
        <rect x={60} y={110} width={460} height={40} rx={6}
          fill="#f0fdf4" stroke={COLORS.green} strokeWidth={1} />
        <text x={290} y={128} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          节省 2/3 prefill 计算 = ~67% TTFT 降低
        </text>
        <text x={290} y={142} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          典型场景: system prompt 复用 (可能 1000+ tokens 全部命中缓存)
        </text>
      </StepSvg>
    ),
  },
];

export default function PrefixCacheHit() {
  return <StepNavigator steps={steps} />;
}
