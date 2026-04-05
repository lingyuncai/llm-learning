import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

export default function RLHFvsDPOArchitecture() {
  const [showDPO, setShowDPO] = useState(false);

  const boxW = 90, boxH = 34;

  // RLHF: 4 models
  const rlhfModels = [
    { label: 'Policy\nπ_θ', x: 80, y: 100, color: COLORS.primary, active: true },
    { label: 'Reference\nπ_ref', x: 80, y: 200, color: COLORS.mid, active: true },
    { label: 'Reward\nModel', x: 250, y: 100, color: COLORS.orange, active: true },
    { label: 'Critic\nV(s;w)', x: 250, y: 200, color: COLORS.green, active: true },
  ];

  // DPO: 2 models (RM and Critic eliminated)
  const dpoModels = [
    { label: 'Policy\nπ_θ', x: 80, y: 140, color: COLORS.primary, active: true },
    { label: 'Reference\nπ_ref', x: 250, y: 140, color: COLORS.mid, active: true },
    { label: 'Reward\nModel', x: 80, y: 240, color: COLORS.orange, active: false },
    { label: 'Critic\nV(s;w)', x: 250, y: 240, color: COLORS.green, active: false },
  ];

  const models = showDPO ? dpoModels : rlhfModels;
  const halfW = 290;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          RLHF vs DPO 架构对比
        </text>

        {/* Toggle */}
        <g onClick={() => setShowDPO(!showDPO)} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 80} y={36} width={160} height={26} rx={13}
            fill={showDPO ? COLORS.purple : COLORS.primary} />
          <text x={W / 2} y={53} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
            {showDPO ? 'DPO（2 模型）' : 'RLHF（4 模型）'}
          </text>
        </g>

        {/* Architecture label */}
        <text x={halfW / 2} y={82} textAnchor="middle" fontSize={12} fontWeight={600}
          fill={showDPO ? COLORS.purple : COLORS.primary}>
          {showDPO ? 'DPO 架构' : 'RLHF 架构'}
        </text>

        {/* Model boxes */}
        {models.map((m, i) => (
          <g key={i} opacity={m.active ? 1 : 0.25}>
            <rect x={m.x - boxW / 2} y={m.y - boxH / 2} width={boxW} height={boxH} rx={8}
              fill={m.active ? COLORS.bgAlt : COLORS.masked}
              stroke={m.color} strokeWidth={m.active ? 2 : 1}
              strokeDasharray={m.active ? undefined : '4 3'} />
            <text x={m.x} y={m.y + 2} textAnchor="middle" fontSize={9} fontWeight={600} fill={m.active ? m.color : COLORS.mid}>
              {m.label.split('\n').map((line, li) => (
                <tspan key={li} x={m.x} dy={li === 0 ? -6 : 14}>{line}</tspan>
              ))}
            </text>
            {!m.active && (
              <>
                <line x1={m.x - boxW / 2 + 5} y1={m.y - boxH / 2 + 5}
                  x2={m.x + boxW / 2 - 5} y2={m.y + boxH / 2 - 5}
                  stroke={COLORS.red} strokeWidth={2} />
                <line x1={m.x + boxW / 2 - 5} y1={m.y - boxH / 2 + 5}
                  x2={m.x - boxW / 2 + 5} y2={m.y + boxH / 2 - 5}
                  stroke={COLORS.red} strokeWidth={2} />
              </>
            )}
          </g>
        ))}

        {/* GPU comparison */}
        <rect x={360} y={80} width={200} height={160} rx={8} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={460} y={100} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.dark}>训练资源对比</text>

        {/* GPU bars */}
        {[
          { label: 'RLHF', gpus: 4, color: COLORS.primary },
          { label: 'DPO', gpus: 2, color: COLORS.purple },
        ].map((item, i) => (
          <g key={i}>
            <text x={375} y={130 + i * 50} fontSize={10} fontWeight={600} fill={item.color}>{item.label}</text>
            {Array.from({ length: 4 }, (_, j) => (
              <rect key={j} x={420 + j * 32} y={118 + i * 50}
                width={26} height={20} rx={3}
                fill={j < item.gpus ? item.color : COLORS.masked}
                opacity={j < item.gpus ? 0.7 : 0.3} />
            ))}
            <text x={420} y={150 + i * 50} fontSize={9} fill={COLORS.mid}>
              {item.gpus} 个模型同时在 GPU
            </text>
          </g>
        ))}

        {/* Key insight */}
        <rect x={360} y={250} width={200} height={50} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={460} y={268} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
          DPO 核心洞察
        </text>
        <text x={460} y={286} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          最优策略和 reward 有 closed-form
        </text>
        <text x={460} y={298} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          关系 → 可以把 RM 消掉
        </text>

        {/* Data flow description */}
        <rect x={30} y={310} width={520} height={70} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={40} y={330} fontSize={11} fontWeight={600} fill={showDPO ? COLORS.purple : COLORS.primary}>
          {showDPO ? 'DPO 训练流程' : 'RLHF 训练流程'}
        </text>
        <text x={40} y={350} fontSize={10} fill={COLORS.dark}>
          {showDPO
            ? '偏好数据 (x, y_w, y_l) → 直接优化 policy 使 preferred 概率上升 → 隐式学习 reward'
            : 'Prompt → Policy 生成 → RM 评分 → Critic 估计 V(s) → 计算 Advantage → PPO 更新'}
        </text>
        <text x={40} y={368} fontSize={10} fill={COLORS.mid}>
          {showDPO
            ? 'Loss: -log σ(β·(log π/π_ref(y_w) - log π/π_ref(y_l))) — 训练简单如 SFT'
            : '需要 4 个模型同时运行，训练复杂度高，超参数敏感'}
        </text>
      </svg>
    </div>
  );
}
