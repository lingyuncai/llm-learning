import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 320;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

function Box({ x, y, w, h, label, sublabel, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - (sublabel ? 4 : 0)} textAnchor="middle"
        dominantBaseline="middle" fontSize="8" fontWeight="600"
        fill={stroke} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
          fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, color }: {
  x1: number; y1: number; x2: number; y2: number;
  label?: string; color: string;
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={1.5} markerEnd={`url(#eagle-evo-arr)`} />
      {label && (
        <text x={midX + 4} y={midY - 4} fontSize="6.5" fill={color} fontFamily={FONTS.sans}>
          {label}
        </text>
      )}
    </g>
  );
}

const steps = [
  {
    title: 'EAGLE-1: Feature-Level Drafting',
    content: (
      <StepSvg>
        <defs>
          <marker id="eagle-evo-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>

        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-1: Hidden State → Feature → Token
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          用 target model 的 hidden state 做 draft — feature 级信息量 {'>'} token 级
        </text>

        <Box x={40} y={70} w={140} h={50} label="Target Model"
          sublabel="Forward Pass" fill="#dbeafe" stroke={COLORS.primary} />
        <Box x={220} y={70} w={140} h={50} label="Hidden State"
          sublabel="Top-layer feature" fill="#fef3c7" stroke={COLORS.orange} />
        <Arrow x1={180} y1={95} x2={220} y2={95} color={COLORS.primary} />

        <Box x={220} y={140} w={140} h={36} label="Token Embedding"
          fill="#f1f5f9" stroke="#94a3b8" />

        <Box x={400} y={90} w={140} h={50} label="Draft Head"
          sublabel="Lightweight decoder" fill="#dcfce7" stroke={COLORS.green} />
        <Arrow x1={360} y1={95} x2={400} y2={105} label="feature" color={COLORS.orange} />
        <Arrow x1={360} y1={158} x2={400} y2={120} label="embedding" color="#94a3b8" />

        <Box x={400} y={170} w={140} h={36} label="Draft Tokens"
          sublabel="T+1, T+2, ..." fill="#dcfce7" stroke={COLORS.green} />
        <Arrow x1={470} y1={140} x2={470} y2={170} color={COLORS.green} />

        <rect x={40} y={230} width={500} height={70} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={250} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          核心洞察: Feature-level {'>'} Token-level
        </text>
        <text x={W / 2} y={268} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          Hidden state 编码了完整上下文语义 → acceptance rate 比 Medusa 高 10-15%
        </text>
        <text x={W / 2} y={284} textAnchor="middle" fontSize="8" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          限制: Draft 阶段依赖 target model 的 hidden state → 必须等 target forward pass 完成
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'EAGLE-2: Dynamic Draft Tree',
    content: (
      <StepSvg>
        <defs>
          <marker id="eagle-evo-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>

        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-2: Context-Aware Dynamic Draft Tree
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          在 EAGLE-1 基础上 + 根据置信度动态调整树结构
        </text>

        <Box x={40} y={60} w={120} h={40} label="Target Model"
          fill="#dbeafe" stroke={COLORS.primary} />
        <Arrow x1={160} y1={80} x2={190} y2={80} color={COLORS.primary} />
        <Box x={190} y={60} w={120} h={40} label="Hidden State"
          fill="#fef3c7" stroke={COLORS.orange} />
        <Arrow x1={310} y1={80} x2={340} y2={80} color={COLORS.orange} />
        <Box x={340} y={60} w={120} h={40} label="Draft Head"
          fill="#dcfce7" stroke={COLORS.green} />

        <text x={W / 2} y={124} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Dynamic Tree: 高置信度 → 深扩展, 低置信度 → 提前剪枝
        </text>

        <g>
          <rect x={60} y={140} width={44} height={24} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={82} y={155} textAnchor="middle" fontSize="7" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>p=0.9</text>
          <line x1={104} y1={152} x2={130} y2={145} stroke={COLORS.green} strokeWidth={1} />
          <line x1={104} y1={152} x2={130} y2={165} stroke={COLORS.green} strokeWidth={1} />
          <rect x={130} y={132} width={44} height={24} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={152} y={148} textAnchor="middle" fontSize="7"
            fill={COLORS.green} fontFamily={FONTS.sans}>p=0.8</text>
          <rect x={130} y={158} width={44} height={24} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={152} y={174} textAnchor="middle" fontSize="7"
            fill={COLORS.green} fontFamily={FONTS.sans}>p=0.7</text>
          <line x1={174} y1={144} x2={200} y2={144} stroke={COLORS.green} strokeWidth={1} />
          <rect x={200} y={132} width={44} height={24} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={222} y={148} textAnchor="middle" fontSize="7"
            fill={COLORS.green} fontFamily={FONTS.sans}>p=0.6</text>
          <text x={150} y={200} textAnchor="middle" fontSize="8" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            高置信度分支: 展开更深
          </text>
        </g>

        <g>
          <rect x={360} y={140} width={44} height={24} rx={4}
            fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
          <text x={382} y={155} textAnchor="middle" fontSize="7" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>p=0.2</text>
          <line x1={404} y1={152} x2={430} y2={152} stroke="#cbd5e1" strokeWidth={1}
            strokeDasharray="3 2" />
          <text x={455} y={155} fontSize="7" fill="#94a3b8" fontFamily={FONTS.sans}>
            pruned
          </text>
          <text x={420} y={200} textAnchor="middle" fontSize="8" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>
            低置信度分支: 提前剪枝
          </text>
        </g>

        <rect x={40} y={225} width={500} height={70} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={245} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          EAGLE-2 改进: Token budget 智能分配
        </text>
        <text x={W / 2} y={263} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          固定 token budget 下，把验证资源集中在高概率路径 → 更高 acceptance rate
        </text>
        <text x={W / 2} y={281} textAnchor="middle" fontSize="8" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          仍然限制: Draft 阶段依赖 target model hidden state
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'EAGLE-3: Direct Token Prediction',
    content: (
      <StepSvg>
        <defs>
          <marker id="eagle-evo-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
        </defs>

        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-3: Direct Token Prediction + Multi-Layer Fusion
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          从 feature prediction 转为直接预测 token，融合多层特征
        </text>

        <Box x={30} y={65} w={130} h={80} label="Target Model"
          sublabel="" fill="#dbeafe" stroke={COLORS.primary} />
        <text x={95} y={90} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Layer N</text>
        <text x={95} y={104} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Layer N-1</text>
        <text x={95} y={118} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Layer N-2</text>
        <text x={95} y={132} textAnchor="middle" fontSize="6" fill="#94a3b8"
          fontFamily={FONTS.sans}>...</text>

        <Arrow x1={160} y1={90} x2={200} y2={90} color={COLORS.primary} />
        <Arrow x1={160} y1={105} x2={200} y2={105} color={COLORS.primary} />
        <Arrow x1={160} y1={120} x2={200} y2={120} color={COLORS.primary} />

        <Box x={200} y={72} w={140} h={65} label="Multi-Layer Fusion"
          sublabel="Training-Time Test" fill="#fef3c7" stroke={COLORS.orange} />

        <Arrow x1={340} y1={105} x2={380} y2={105} color={COLORS.orange} />
        <Box x={380} y={80} w={160} h={50} label="Direct Token Prediction"
          sublabel="不经过 feature → token 映射" fill="#dcfce7" stroke={COLORS.green} />

        <Arrow x1={460} y1={130} x2={460} y2={158} color={COLORS.green} />
        <Box x={380} y={158} w={160} h={36} label="Draft Tokens (6.5x speedup)"
          fill="#dcfce7" stroke={COLORS.green} />

        <text x={W / 2} y={220} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          加速比对比
        </text>

        {[
          { label: 'Medusa', speedup: 2.5, color: '#94a3b8' },
          { label: 'EAGLE-1', speedup: 3.5, color: COLORS.orange },
          { label: 'EAGLE-2', speedup: 4.5, color: COLORS.primary },
          { label: 'EAGLE-3', speedup: 6.5, color: COLORS.green },
        ].map((item, i) => {
          const barY = 232 + i * 18;
          const maxBarW = 300;
          const barW = (item.speedup / 7) * maxBarW;
          return (
            <g key={i}>
              <text x={100} y={barY + 9} textAnchor="end" fontSize="7.5" fontWeight="500"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{item.label}</text>
              <rect x={110} y={barY} width={maxBarW} height={14} rx={2}
                fill="#f1f5f9" />
              <rect x={110} y={barY} width={barW} height={14} rx={2}
                fill={item.color} opacity={0.7} />
              <text x={115 + barW} y={barY + 10} fontSize="7" fontWeight="600"
                fill={item.color} fontFamily={FONTS.mono}>
                {item.speedup}x
              </text>
            </g>
          );
        })}
      </StepSvg>
    ),
  },
];

export default function EagleEvolution() {
  return <StepNavigator steps={steps} />;
}
