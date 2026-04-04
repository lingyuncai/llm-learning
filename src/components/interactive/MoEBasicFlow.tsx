import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

const W = 580;
const NUM_EXPERTS = 8;
const TOP_K = 2;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function ExpertBox({ x, y, w, h, idx, active, score, selected }: {
  x: number; y: number; w: number; h: number; idx: number;
  active: boolean; score?: number; selected?: boolean;
}) {
  const fill = selected ? '#dbeafe' : active ? '#f8fafc' : COLORS.masked;
  const stroke = selected ? COLORS.primary : active ? '#94a3b8' : '#d1d5db';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={fill} stroke={stroke} strokeWidth={selected ? 2 : 1} />
      <text x={x + w / 2} y={y + h / 2 - (score !== undefined ? 4 : 0)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontWeight={selected ? '700' : '500'}
        fill={selected ? COLORS.primary : COLORS.dark} fontFamily={FONTS.sans}>
        E{idx}
      </text>
      {score !== undefined && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          fontSize="7" fill={selected ? COLORS.primary : COLORS.mid}
          fontFamily={FONTS.mono} fontWeight={selected ? '700' : '400'}>
          {score.toFixed(2)}
        </text>
      )}
    </g>
  );
}

// Fixed scores for demonstration
const scores = [0.05, 0.12, 0.35, 0.08, 0.22, 0.03, 0.11, 0.04];
const topIdx = scores.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s - a.s)
  .slice(0, TOP_K)
  .map(x => x.i);
const totalWeight = topIdx.reduce((sum, i) => sum + scores[i], 0);
const weights = topIdx.map(i => scores[i] / totalWeight);

const expertW = 52;
const expertH = 40;
const expertGap = 10;
const expertsStartX = (W - NUM_EXPERTS * (expertW + expertGap) + expertGap) / 2;
const expertsY = 100;

const steps = [
  {
    title: 'Router 打分',
    content: (
      <StepSvg h={220}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 1: Token 进入 Router，对每个 Expert 打分
        </text>

        {/* Input token */}
        <rect x={W / 2 - 40} y={40} width={80} height={28} rx={14}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={W / 2} y={57} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Token x</text>

        {/* Router */}
        <text x={W / 2} y={85} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.mono}>g = softmax(W_g · x)</text>

        {/* Experts with scores */}
        {scores.map((score, i) => (
          <ExpertBox key={i}
            x={expertsStartX + i * (expertW + expertGap)} y={expertsY}
            w={expertW} h={expertH} idx={i} active={true} score={score} />
        ))}

        {/* Arrow from token to experts */}
        <defs>
          <marker id="moe-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        <text x={W / 2} y={165} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Router（小型线性层）为每个 expert 输出一个概率分数
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Top-K 选择',
    content: (
      <StepSvg h={220}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 2: Top-{TOP_K} 选择（高亮被选中的 Expert）
        </text>

        <rect x={W / 2 - 40} y={40} width={80} height={28} rx={14}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={W / 2} y={57} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Token x</text>

        <text x={W / 2} y={85} textAnchor="middle" fontSize="8" fill={COLORS.primary}
          fontFamily={FONTS.mono} fontWeight="600">
          选择分数最高的 {TOP_K} 个: E{topIdx[0]} ({scores[topIdx[0]].toFixed(2)}) + E{topIdx[1]} ({scores[topIdx[1]].toFixed(2)})
        </text>

        {scores.map((score, i) => (
          <ExpertBox key={i}
            x={expertsStartX + i * (expertW + expertGap)} y={expertsY}
            w={expertW} h={expertH} idx={i}
            active={topIdx.includes(i)} score={score}
            selected={topIdx.includes(i)} />
        ))}

        <text x={W / 2} y={165} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          未选中的 expert 不参与计算 — 这就是 "稀疏" 的含义
        </text>

        <text x={W / 2} y={185} textAnchor="middle" fontSize="8" fill={COLORS.green}
          fontFamily={FONTS.sans} fontWeight="600">
          每个 token 只激活 {TOP_K}/{NUM_EXPERTS} 的 expert → 计算量仅为 dense 的 {(TOP_K / NUM_EXPERTS * 100).toFixed(0)}%
        </text>
      </StepSvg>
    ),
  },
  {
    title: '加权合并',
    content: (
      <StepSvg h={250}>
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Step 3: 选中 Expert 并行计算，输出加权合并
        </text>

        <rect x={W / 2 - 40} y={40} width={80} height={28} rx={14}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={W / 2} y={57} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Token x</text>

        {/* Two selected experts */}
        {topIdx.map((ei, i) => {
          const cx = W / 2 + (i === 0 ? -100 : 100);
          return (
            <g key={i}>
              <line x1={W / 2} y1={68} x2={cx} y2={88}
                stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#moe-arr)" />
              <rect x={cx - 55} y={90} width={110} height={35} rx={6}
                fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
              <text x={cx} y={105} textAnchor="middle" fontSize="9" fontWeight="600"
                fill={COLORS.primary} fontFamily={FONTS.sans}>
                E{ei}(x)
              </text>
              <text x={cx} y={118} textAnchor="middle" fontSize="7"
                fill={COLORS.mid} fontFamily={FONTS.mono}>
                weight = {weights[i].toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Merge */}
        <line x1={W / 2 - 100} y1={125} x2={W / 2} y2={155}
          stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#moe-arr)" />
        <line x1={W / 2 + 100} y1={125} x2={W / 2} y2={155}
          stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#moe-arr)" />

        <rect x={W / 2 - 60} y={155} width={120} height={30} rx={6}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
        <text x={W / 2} y={173} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          y = Σ gᵢ · Eᵢ(x)
        </text>

        <defs>
          <marker id="moe-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>

        <text x={W / 2} y={210} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.mono}>
          y = {weights[0].toFixed(2)} · E{topIdx[0]}(x) + {weights[1].toFixed(2)} · E{topIdx[1]}(x)
        </text>

        <text x={W / 2} y={235} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          权重经过 renormalize（选中 expert 的分数归一化为 1）
        </text>
      </StepSvg>
    ),
  },
];

export default function MoEBasicFlow() {
  return <StepNavigator steps={steps} />;
}
