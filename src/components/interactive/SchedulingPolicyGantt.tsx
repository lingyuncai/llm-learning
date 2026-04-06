import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

type Policy = 'fcfs' | 'priority' | 'fair';

interface Req { id: string; arrive: number; length: number; priority: number; color: string }

const REQS: Req[] = [
  { id: 'R1', arrive: 0, length: 5, priority: 2, color: COLORS.primary },
  { id: 'R2', arrive: 1, length: 3, priority: 1, color: COLORS.green },
  { id: 'R3', arrive: 2, length: 4, priority: 3, color: COLORS.orange },
  { id: 'R4', arrive: 3, length: 2, priority: 2, color: COLORS.purple },
];

const TICK_W = 32;
const BAR_H = 26;
const GAP = 8;
const SLOTS = 2;

function schedule(reqs: Req[], policy: Policy) {
  const result: { req: Req; slot: number; start: number; end: number }[] = [];
  const slotFree = Array(SLOTS).fill(0);

  let queue = [...reqs].sort((a, b) => a.arrive - b.arrive);
  if (policy === 'priority') {
    queue = [...reqs].sort((a, b) => a.priority - b.priority || a.arrive - b.arrive);
  }
  if (policy === 'fair') {
    queue = [...reqs].sort((a, b) => a.length - b.length || a.arrive - b.arrive);
  }

  for (const req of queue) {
    const slot = slotFree.indexOf(Math.min(...slotFree));
    const start = Math.max(req.arrive, slotFree[slot]);
    slotFree[slot] = start + req.length;
    result.push({ req, slot, start, end: start + req.length });
  }
  return result;
}

export default function SchedulingPolicyGantt({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '调度策略对比：同一批请求的执行顺序',
      subtitle: '切换策略查看甘特图变化',
      fcfs: 'FCFS',
      priority: '优先级',
      fair: '短作业优先',
      slot: 'Slot',
      avgWait: '平均等待时间',
      avgCompletion: '平均完成时间',
      steps: '步',
      fcfsDesc: 'FCFS：先到先服务，简单但 VIP 请求可能等待过久',
      priorityDesc: '优先级：VIP 请求（R2）优先执行，但可能饿死低优先级请求',
      fairDesc: '短作业优先：最小化平均完成时间，但长请求可能被持续推迟',
    },
    en: {
      title: 'Scheduling Policy Comparison: Same Request Batch',
      subtitle: 'Switch policy to see Gantt chart changes',
      fcfs: 'FCFS',
      priority: 'Priority',
      fair: 'Shortest Job First',
      slot: 'Slot',
      avgWait: 'Avg Wait Time',
      avgCompletion: 'Avg Completion Time',
      steps: 'steps',
      fcfsDesc: 'FCFS: First-come-first-serve, simple but VIP requests may wait',
      priorityDesc: 'Priority: VIP requests (R2) run first, but may starve low-priority',
      fairDesc: 'Shortest Job First: Minimizes avg completion time, but long jobs may be delayed',
    },
  }[locale];

  const [policy, setPolicy] = useState<Policy>('fcfs');

  const events = schedule(REQS, policy);
  const maxTime = Math.max(...events.map(e => e.end));
  const ticks = Array.from({ length: maxTime + 2 }, (_, i) => i);

  const chartX = 60;
  const chartY = 100;

  const avgWait = events.reduce((sum, e) => sum + (e.start - e.req.arrive), 0) / events.length;
  const avgCompletion = events.reduce((sum, e) => sum + (e.end - e.req.arrive), 0) / events.length;

  const policies: { id: Policy; label: string }[] = [
    { id: 'fcfs', label: t.fcfs },
    { id: 'priority', label: t.priority },
    { id: 'fair', label: t.fair },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {policies.map((p, i) => (
        <g key={p.id} onClick={() => setPolicy(p.id)} cursor="pointer">
          <rect x={130 + i * 120} y={52} width={105} height={26} rx={13}
            fill={policy === p.id ? COLORS.primary : COLORS.bgAlt}
            stroke={policy === p.id ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={182 + i * 120} y={69} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={policy === p.id ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {p.label}
          </text>
        </g>
      ))}

      {Array.from({ length: SLOTS }, (_, s) => (
        <text key={s} x={chartX - 8} y={chartY + s * (BAR_H + GAP) + BAR_H / 2 + 4}
          textAnchor="end" fontSize="9" fontWeight="600"
          fill={COLORS.mid} fontFamily={FONTS.sans}>{t.slot} {s}</text>
      ))}

      {ticks.map(t => {
        const x = chartX + t * TICK_W;
        const axisY = chartY + SLOTS * (BAR_H + GAP) + 5;
        return (
          <g key={t}>
            <line x1={x} y1={chartY - 5} x2={x} y2={axisY}
              stroke={COLORS.light} strokeWidth="0.5" />
            <text x={x} y={axisY + 12} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily={FONTS.mono}>{t}</text>
          </g>
        );
      })}

      {events.map((ev) => {
        const y = chartY + ev.slot * (BAR_H + GAP);
        const waitW = (ev.start - ev.req.arrive) * TICK_W;
        return (
          <g key={ev.req.id}>
            {waitW > 0 && (
              <rect x={chartX + ev.req.arrive * TICK_W} y={y}
                width={waitW} height={BAR_H} rx={4}
                fill={COLORS.waste} opacity={0.4} stroke={COLORS.red}
                strokeWidth="0.5" strokeDasharray="2,2" />
            )}
            <rect x={chartX + ev.start * TICK_W} y={y}
              width={ev.req.length * TICK_W} height={BAR_H} rx={4}
              fill={ev.req.color} opacity={0.7} />
            <text x={chartX + (ev.start + ev.req.length / 2) * TICK_W}
              y={y + BAR_H / 2 + 4} textAnchor="middle" fontSize="11"
              fontWeight="700" fill="#fff" fontFamily={FONTS.mono}>{ev.req.id}</text>
            {ev.req.priority === 1 && (
              <text x={chartX + (ev.start + ev.req.length) * TICK_W + 5}
                y={y + BAR_H / 2 + 4} fontSize="9" fill={COLORS.red} fontFamily={FONTS.sans}>
                VIP
              </text>
            )}
          </g>
        );
      })}

      <rect x={60} y={H - 70} width={W - 120} height={55} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 50} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.avgWait}: {avgWait.toFixed(1)} {t.steps} | {t.avgCompletion}: {avgCompletion.toFixed(1)} {t.steps}
      </text>
      <text x={W / 2} y={H - 32} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {policy === 'fcfs' && t.fcfsDesc}
        {policy === 'priority' && t.priorityDesc}
        {policy === 'fair' && t.fairDesc}
      </text>
    </svg>
  );
}
