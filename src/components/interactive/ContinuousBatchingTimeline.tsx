import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Req {
  id: string;
  arrive: number;
  prefill: number;
  decode: number;
  color: string;
}

const REQS: Req[] = [
  { id: 'A', arrive: 0, prefill: 1, decode: 4, color: COLORS.primary },
  { id: 'B', arrive: 0, prefill: 1, decode: 8, color: COLORS.green },
  { id: 'C', arrive: 0, prefill: 1, decode: 3, color: COLORS.orange },
  { id: 'D', arrive: 3, prefill: 1, decode: 5, color: COLORS.purple },
  { id: 'E', arrive: 5, prefill: 1, decode: 3, color: '#00838f' },
];

const SLOT_COUNT = 3; // max concurrent requests
const TICK_W = 36;
const MAX_TIME = 14;
const BAR_H = 28;
const GAP = 4;

export default function ContinuousBatchingTimeline() {
  const [hovered, setHovered] = useState<string | null>(null);

  const chartX = 50;
  const chartY = 70;

  // Simulate continuous batching: greedy slot assignment
  type SlotEvent = { req: Req; start: number; end: number; slot: number };
  const events: SlotEvent[] = [];
  const slotFree = Array(SLOT_COUNT).fill(0); // when each slot becomes free

  // Sort by arrival time
  const sorted = [...REQS].sort((a, b) => a.arrive - b.arrive);
  for (const req of sorted) {
    // Find earliest available slot at or after arrival
    const earliest = Math.max(req.arrive, Math.min(...slotFree));
    const slotIdx = slotFree.indexOf(Math.min(...slotFree.filter(t => t <= req.arrive)));
    const slot = slotIdx >= 0 ? slotIdx : slotFree.indexOf(Math.min(...slotFree));
    const start = Math.max(req.arrive, slotFree[slot]);
    const end = start + req.prefill + req.decode;
    slotFree[slot] = end;
    events.push({ req, start, end, slot });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Continuous Batching 时间线
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {SLOT_COUNT} 个 GPU slot，请求动态进出，完成即释放
      </text>

      {/* Slot labels */}
      {Array.from({ length: SLOT_COUNT }, (_, s) => (
        <text key={s} x={chartX - 8} y={chartY + s * (BAR_H + GAP) + BAR_H / 2 + 4}
          textAnchor="end" fontSize="9" fontWeight="600"
          fill={COLORS.mid} fontFamily={FONTS.sans}>Slot {s}</text>
      ))}

      {/* Time axis */}
      {Array.from({ length: MAX_TIME + 1 }, (_, t) => {
        const x = chartX + t * TICK_W;
        const axisY = chartY + SLOT_COUNT * (BAR_H + GAP) + 10;
        return (
          <g key={t}>
            <line x1={x} y1={chartY - 5} x2={x} y2={axisY}
              stroke={COLORS.light} strokeWidth="0.5" />
            <text x={x} y={axisY + 12} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily={FONTS.mono}>{t}</text>
          </g>
        );
      })}

      {/* Request bars */}
      {events.map((ev) => {
        const y = chartY + ev.slot * (BAR_H + GAP);
        const isHovered = hovered === ev.req.id;
        return (
          <g key={ev.req.id}
            onMouseEnter={() => setHovered(ev.req.id)}
            onMouseLeave={() => setHovered(null)}>
            {/* Prefill */}
            <rect x={chartX + ev.start * TICK_W} y={y}
              width={ev.req.prefill * TICK_W} height={BAR_H} rx={4}
              fill={ev.req.color} opacity={isHovered ? 1 : 0.8}
              stroke={isHovered ? COLORS.dark : 'none'} strokeWidth="1.5" />
            {/* Decode */}
            <rect x={chartX + (ev.start + ev.req.prefill) * TICK_W} y={y}
              width={ev.req.decode * TICK_W} height={BAR_H} rx={4}
              fill={ev.req.color} opacity={isHovered ? 0.6 : 0.4}
              stroke={isHovered ? COLORS.dark : 'none'} strokeWidth="1.5" />
            {/* Label */}
            <text x={chartX + (ev.start + (ev.req.prefill + ev.req.decode) / 2) * TICK_W}
              y={y + BAR_H / 2 + 4} textAnchor="middle" fontSize="11"
              fontWeight="700" fill={isHovered ? '#fff' : COLORS.dark} fontFamily={FONTS.mono}>
              {ev.req.id}
            </text>
          </g>
        );
      })}

      {/* Arrival markers */}
      {REQS.filter(r => r.arrive > 0).map((r) => {
        const x = chartX + r.arrive * TICK_W;
        return (
          <g key={`arr-${r.id}`}>
            <line x1={x} y1={chartY - 10} x2={x}
              y2={chartY + SLOT_COUNT * (BAR_H + GAP)}
              stroke={r.color} strokeWidth="1" strokeDasharray="3,2" />
            <text x={x} y={chartY - 14} textAnchor="middle" fontSize="8"
              fill={r.color} fontFamily={FONTS.sans}>{r.id} 到达</text>
          </g>
        );
      })}

      {/* Detail box */}
      {hovered !== null && (() => {
        const ev = events.find(e => e.req.id === hovered);
        if (!ev) return null;
        return (
          <rect x={60} y={H - 80} width={W - 120} height={30} rx={6} fill="none" />
        );
      })()}

      {/* Legend */}
      <g>
        <rect x={100} y={H - 60} width={16} height={12} rx={2}
          fill={COLORS.primary} opacity={0.8} />
        <text x={122} y={H - 51} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Prefill（深色）
        </text>
        <rect x={240} y={H - 60} width={16} height={12} rx={2}
          fill={COLORS.primary} opacity={0.4} />
        <text x={262} y={H - 51} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Decode（浅色）
        </text>
        <line x1={380} y1={H - 54} x2={410} y2={H - 54}
          stroke={COLORS.mid} strokeWidth="1" strokeDasharray="3,2" />
        <text x={416} y={H - 51} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
          新请求到达
        </text>
      </g>

      {/* Summary */}
      <rect x={60} y={H - 35} width={W - 120} height={26} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 18} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        请求 A/C 完成后 slot 立即被 D/E 填入 — 无空闲等待，GPU 利用率最大化
      </text>
    </svg>
  );
}
