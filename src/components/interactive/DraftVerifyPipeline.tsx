import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 280;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

function PipelineBox({ x, y, w, h, label, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

const BOX_W = 80;
const BOX_H = 28;

const steps = [
  {
    title: 'EAGLE 1/2: Feature Prediction Pipeline',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE 1/2: Hidden State → Feature → Token
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          Draft 依赖 target model 的 hidden state — 三步流程
        </text>

        {[
          { label: 'Target\nForward', fill: '#dbeafe', stroke: COLORS.primary },
          { label: 'Extract\nHidden State', fill: '#fef3c7', stroke: COLORS.orange },
          { label: 'Draft Head\n(Feature→Token)', fill: '#dcfce7', stroke: COLORS.green },
          { label: 'Verify\n(Target)', fill: '#dbeafe', stroke: COLORS.primary },
        ].map((box, i) => {
          const x = 40 + i * 135;
          return (
            <g key={i}>
              <PipelineBox x={x} y={60} w={110} h={50} label={box.label}
                fill={box.fill} stroke={box.stroke} />
              {i < 3 && (
                <line x1={x + 110} y1={85} x2={x + 135} y2={85}
                  stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#dvp-arr)" />
              )}
            </g>
          );
        })}

        <defs>
          <marker id="dvp-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
          </marker>
        </defs>

        <rect x={40} y={125} width={500} height={24} rx={4}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} strokeDasharray="4 2" />
        <text x={W / 2} y={140} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          串行依赖链: Draft 必须等 Target 的 Hidden State → 无法流水线化
        </text>

        <text x={30} y={175} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>迭代过程:</text>

        {Array.from({ length: 3 }).map((_, iter) => {
          const baseX = 40 + iter * 180;
          const y = 190;
          return (
            <g key={iter}>
              <PipelineBox x={baseX} y={y} w={75} h={22}
                label={`Target #${iter + 1}`} fill="#dbeafe" stroke={COLORS.primary} />
              <PipelineBox x={baseX + 80} y={y} w={75} h={22}
                label={`Draft #${iter + 1}`} fill="#dcfce7" stroke={COLORS.green} />
              {iter < 2 && (
                <line x1={baseX + 155} y1={y + 11} x2={baseX + 180} y2={y + 11}
                  stroke="#cbd5e1" strokeWidth={1} />
              )}
            </g>
          );
        })}

        <text x={W / 2} y={240} textAnchor="middle" fontSize="8" fill={COLORS.red}
          fontFamily={FONTS.sans}>
          每轮: Target forward (慢) → Draft (快) → 串行等待
        </text>

        <rect x={40} y={252} width={500} height={20} rx={3}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={265} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-1 ~3.5x | EAGLE-2 ~4.5x (dynamic tree 改善了 budget 分配)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'EAGLE-3: Direct Token Prediction + Multi-Layer Fusion',
    content: (
      <StepSvg>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          EAGLE-3: Direct Token Prediction
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          跳过 feature prediction，直接预测 token + 融合多层特征
        </text>

        <PipelineBox x={40} y={60} w={110} h={50}
          label="Target Model" fill="#dbeafe" stroke={COLORS.primary} />

        {[0, 1, 2].map(i => (
          <line key={i} x1={150} y1={72 + i * 12} x2={190} y2={78 + i * 6}
            stroke={COLORS.primary} strokeWidth={1} />
        ))}

        <PipelineBox x={190} y={60} w={110} h={50}
          label="Multi-Layer\nFusion" fill="#fef3c7" stroke={COLORS.orange} />

        <line x1={300} y1={85} x2={335} y2={85}
          stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#dvp-arr2)" />

        <PipelineBox x={335} y={60} w={110} h={50}
          label="Direct Token\nPrediction" fill="#dcfce7" stroke={COLORS.green} />

        <line x1={445} y1={85} x2={475} y2={85}
          stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#dvp-arr2)" />

        <PipelineBox x={475} y={70} w={75} h={30}
          label="Verify" fill="#dbeafe" stroke={COLORS.primary} />

        <defs>
          <marker id="dvp-arr2" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
          </marker>
        </defs>

        <rect x={40} y={130} width={500} height={60} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={148} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          EAGLE-3 的两个关键改进
        </text>
        <text x={60} y={166} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          1. Direct token prediction: 跳过 feature→token 映射，直接输出 token 概率
        </text>
        <text x={60} y={180} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          2. Multi-layer fusion (Training-Time Test): 融合多层特征而非只用最后一层
        </text>

        <text x={W / 2} y={215} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          性能对比
        </text>

        {[
          { label: 'EAGLE-2', val: 4.5, max: 7, color: COLORS.primary },
          { label: 'EAGLE-3', val: 6.5, max: 7, color: COLORS.green },
        ].map((item, i) => {
          const barY = 225 + i * 20;
          const maxW = 300;
          const barW = (item.val / item.max) * maxW;
          return (
            <g key={i}>
              <text x={130} y={barY + 11} textAnchor="end" fontSize="8"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{item.label}</text>
              <rect x={140} y={barY} width={maxW} height={16} rx={3} fill="#f1f5f9" />
              <rect x={140} y={barY} width={barW} height={16} rx={3}
                fill={item.color} opacity={0.7} />
              <text x={145 + barW} y={barY + 11} fontSize="8" fontWeight="700"
                fill={item.color} fontFamily={FONTS.mono}>{item.val}x</text>
            </g>
          );
        })}

        <text x={W / 2} y={275} textAnchor="middle" fontSize="8" fill={COLORS.green}
          fontFamily={FONTS.sans}>
          EAGLE-3: ~1.4x faster than EAGLE-2 | SGLang batch=64 吞吐提升 1.38x
        </text>
      </StepSvg>
    ),
  },
];

export default function DraftVerifyPipeline() {
  return <StepNavigator steps={steps} />;
}
