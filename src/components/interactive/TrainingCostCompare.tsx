import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Method {
  label: string;
  color: string;
  models: number;
  gpuRelative: number;
  dataReq: string;
  trainTime: string;
}

const METHODS: Method[] = [
  { label: 'RLHF', color: COLORS.primary, models: 4, gpuRelative: 1.0, dataReq: '大量偏好对 + prompts', trainTime: '最长（PPO 迭代）' },
  { label: 'DPO', color: COLORS.purple, models: 2, gpuRelative: 0.4, dataReq: '偏好对（可复用 RLHF 数据）', trainTime: '最短（类似 SFT）' },
  { label: 'GRPO', color: COLORS.red, models: 2, gpuRelative: 0.6, dataReq: 'Prompts + 规则 reward', trainTime: '中等（在线生成）' },
];

export default function TrainingCostCompare() {
  const [hovered, setHovered] = useState<number | null>(null);

  const chartX = 100, chartY = 70, chartW = 400, chartH = 180;
  const metrics = ['同时运行模型数', 'GPU 内存需求', '训练时间'];
  const barGroupW = chartW / 3;

  const getVal = (m: Method, mi: number): number => {
    if (mi === 0) return m.models / 4;
    if (mi === 1) return m.gpuRelative;
    if (mi === 2) return m.label === 'RLHF' ? 1 : m.label === 'GRPO' ? 0.6 : 0.3;
    return 0;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          训练资源需求对比
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          RLHF vs DPO vs GRPO — GPU、模型数、训练时间
        </text>

        <line x1={chartX} y1={chartY + chartH} x2={chartX + chartW} y2={chartY + chartH}
          stroke={COLORS.light} strokeWidth={1} />

        {metrics.map((metric, mi) => {
          const gx = chartX + mi * barGroupW;
          return (
            <g key={mi}>
              <text x={gx + barGroupW / 2} y={chartY + chartH + 18} textAnchor="middle" fontSize={9} fill={COLORS.dark}>
                {metric}
              </text>
              {METHODS.map((m, mIdx) => {
                const barW = (barGroupW - 20) / 3;
                const bx = gx + 10 + mIdx * barW;
                const val = getVal(m, mi);
                const bh = val * (chartH - 20);
                const isHov = hovered === mIdx;
                return (
                  <g key={mIdx}
                    onMouseEnter={() => setHovered(mIdx)}
                    onMouseLeave={() => setHovered(null)}>
                    <rect x={bx} y={chartY + chartH - bh} width={barW - 4} height={bh} rx={3}
                      fill={m.color} opacity={isHov ? 1 : 0.7} />
                    <text x={bx + (barW - 4) / 2} y={chartY + chartH - bh - 4} textAnchor="middle"
                      fontSize={8} fontWeight={600} fill={m.color} fontFamily={FONTS.mono}>
                      {mi === 0 ? m.models : (val * 100).toFixed(0) + '%'}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {METHODS.map((m, i) => (
          <g key={i}>
            <rect x={chartX + i * 140} y={chartY - 10} width={12} height={12} rx={2} fill={m.color} />
            <text x={chartX + i * 140 + 18} y={chartY + 1} fontSize={10} fontWeight={600} fill={m.color}>{m.label}</text>
          </g>
        ))}

        {hovered !== null && (
          <g>
            <rect x={30} y={chartY + chartH + 30} width={520} height={70} rx={8}
              fill={COLORS.bgAlt} stroke={METHODS[hovered].color} strokeWidth={1.5} />
            <text x={45} y={chartY + chartH + 48} fontSize={12} fontWeight={700} fill={METHODS[hovered].color}>
              {METHODS[hovered].label}
            </text>
            <text x={45} y={chartY + chartH + 66} fontSize={10} fill={COLORS.dark}>
              模型数: {METHODS[hovered].models} | 数据需求: {METHODS[hovered].dataReq}
            </text>
            <text x={45} y={chartY + chartH + 84} fontSize={10} fill={COLORS.mid}>
              训练时长: {METHODS[hovered].trainTime}
            </text>
          </g>
        )}

        {!hovered && (
          <rect x={30} y={chartY + chartH + 30} width={520} height={70} rx={8}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} >
          </rect>
        )}
        {!hovered && (
          <>
            <text x={W / 2} y={chartY + chartH + 60} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.orange}>
              Hover 柱状图查看各方法详情
            </text>
            <text x={W / 2} y={chartY + chartH + 80} textAnchor="middle" fontSize={10} fill={COLORS.mid}>
              DPO 最轻量（无 RM/Critic）| GRPO 中等（无 Critic 但需在线生成）| RLHF 最重
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
