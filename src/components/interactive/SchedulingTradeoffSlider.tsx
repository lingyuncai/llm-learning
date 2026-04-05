import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

type Focus = 'throughput' | 'latency' | 'fairness';

interface Config {
  focus: Focus;
  label: string;
  color: string;
  strategy: string;
  throughput: number;
  latency: number;
  fairness: number;
  desc: string;
}

const CONFIGS: Config[] = [
  { focus: 'throughput', label: '吞吐优先', color: COLORS.primary,
    strategy: '大 batch size + 延迟 preemption',
    throughput: 95, latency: 40, fairness: 50,
    desc: '最大化 GPU 利用率，适合离线批处理任务' },
  { focus: 'latency', label: '延迟优先', color: COLORS.green,
    strategy: '小 batch size + 激进 preemption + chunked prefill',
    throughput: 60, latency: 92, fairness: 70,
    desc: '最小化首 token 延迟（TTFT），适合实时对话' },
  { focus: 'fairness', label: '公平优先', color: COLORS.orange,
    strategy: '时间片轮转 + 短作业优先',
    throughput: 70, latency: 75, fairness: 90,
    desc: '保证每个请求都能按时完成，适合多租户 SLA 场景' },
];

export default function SchedulingTradeoffSlider() {
  const [selected, setSelected] = useState<Focus>('throughput');
  const config = CONFIGS.find(c => c.focus === selected)!;

  const barX = 160;
  const barW = 300;
  const metrics = [
    { label: '吞吐量', value: config.throughput, color: COLORS.primary },
    { label: '延迟', value: config.latency, color: COLORS.green },
    { label: '公平性', value: config.fairness, color: COLORS.orange },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        调度 Trade-off：吞吐 vs 延迟 vs 公平性
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        选择优化目标，查看对应策略和效果
      </text>

      {CONFIGS.map((c, i) => (
        <g key={c.focus} onClick={() => setSelected(c.focus)} cursor="pointer">
          <rect x={90 + i * 150} y={55} width={130} height={28} rx={14}
            fill={selected === c.focus ? c.color : COLORS.bgAlt}
            stroke={c.color} strokeWidth="1.5" />
          <text x={155 + i * 150} y={73} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={selected === c.focus ? '#fff' : c.color} fontFamily={FONTS.sans}>
            {c.label}
          </text>
        </g>
      ))}

      <rect x={60} y={100} width={W - 120} height={50} rx={6}
        fill={config.color} opacity={0.08} stroke={config.color} strokeWidth="1" />
      <text x={W / 2} y={120} textAnchor="middle" fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        策略: {config.strategy}
      </text>
      <text x={W / 2} y={140} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{config.desc}</text>

      {metrics.map((m, i) => {
        const y = 175 + i * 50;
        return (
          <g key={m.label}>
            <text x={barX - 10} y={y + 18} textAnchor="end" fontSize="10"
              fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{m.label}</text>
            <rect x={barX} y={y} width={barW} height={28} rx={6}
              fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <rect x={barX} y={y} width={barW * m.value / 100} height={28} rx={6}
              fill={m.color} opacity={0.6} />
            <text x={barX + barW * m.value / 100 + 8} y={y + 18}
              fontSize="10" fontWeight="700" fill={m.color} fontFamily={FONTS.mono}>
              {m.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
