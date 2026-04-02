// src/components/interactive/ContinuousBatchingTimeline.tsx
import { COLORS, HEAD_COLORS } from './shared/colors';

// Request definitions: [startTime, duration]
const REQUESTS = [
  { id: 'A', duration: 3, color: HEAD_COLORS[0] },
  { id: 'B', duration: 5, color: HEAD_COLORS[1] },
  { id: 'C', duration: 2, color: HEAD_COLORS[2] },
  { id: 'D', duration: 3, color: HEAD_COLORS[3] },
  { id: 'E', duration: 2, color: HEAD_COLORS[4] },
];

const TOTAL_TIME = 8;
const SLOTS = 3;

function Timeline({ title, schedule, utilization }: {
  title: string;
  schedule: { slot: number; start: number; end: number; reqId: string; color: string; idle?: boolean }[];
  utilization: number;
}) {
  const svgW = 500;
  const svgH = SLOTS * 30 + 40;
  const padL = 30;
  const padT = 24;
  const timeW = (svgW - padL - 10) / TOTAL_TIME;
  const slotH = 24;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold text-gray-700 mb-1">{title}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-md">
        {/* Time axis */}
        {Array.from({ length: TOTAL_TIME + 1 }, (_, t) => (
          <g key={t}>
            <line x1={padL + t * timeW} y1={padT - 4} x2={padL + t * timeW} y2={padT + SLOTS * (slotH + 2)}
              stroke="#e5e7eb" strokeWidth={0.5} />
            <text x={padL + t * timeW} y={padT - 8} textAnchor="middle"
              fontSize="8" fill={COLORS.mid} fontFamily="system-ui">t{t}</text>
          </g>
        ))}
        {/* Slot labels */}
        {Array.from({ length: SLOTS }, (_, s) => (
          <text key={s} x={padL - 4} y={padT + s * (slotH + 2) + slotH / 2 + 3}
            textAnchor="end" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">Slot {s + 1}</text>
        ))}
        {/* Schedule blocks */}
        {schedule.map((s, i) => (
          <g key={i}>
            <rect
              x={padL + s.start * timeW + 1}
              y={padT + s.slot * (slotH + 2)}
              width={(s.end - s.start) * timeW - 2}
              height={slotH}
              rx={4}
              fill={s.idle ? '#f3f4f6' : s.color + '55'}
              stroke={s.idle ? '#d1d5db' : s.color}
              strokeWidth={1}
            />
            {!s.idle && (
              <text
                x={padL + ((s.start + s.end) / 2) * timeW}
                y={padT + s.slot * (slotH + 2) + slotH / 2 + 3}
                textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily="system-ui" fontWeight="600">
                {s.reqId}
              </text>
            )}
          </g>
        ))}
        {/* Utilization */}
        <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize="10"
          fill={utilization > 80 ? COLORS.green : COLORS.orange} fontFamily="system-ui" fontWeight="600">
          GPU 利用率: {utilization}%
        </text>
      </svg>
    </div>
  );
}

export default function ContinuousBatchingTimeline() {
  // Static batching: A(3), B(5), C(2) start together, wait for B to finish
  const staticSchedule = [
    { slot: 0, start: 0, end: 3, reqId: 'A', color: REQUESTS[0].color },
    { slot: 0, start: 3, end: 5, reqId: '', color: '', idle: true }, // A idle
    { slot: 1, start: 0, end: 5, reqId: 'B', color: REQUESTS[1].color },
    { slot: 2, start: 0, end: 2, reqId: 'C', color: REQUESTS[2].color },
    { slot: 2, start: 2, end: 5, reqId: '', color: '', idle: true }, // C idle
    // New batch after t=5
    { slot: 0, start: 5, end: 8, reqId: 'D', color: REQUESTS[3].color },
    { slot: 1, start: 5, end: 7, reqId: 'E', color: REQUESTS[4].color },
    { slot: 1, start: 7, end: 8, reqId: '', color: '', idle: true },
    { slot: 2, start: 5, end: 8, reqId: '', color: '', idle: true },
  ];

  // Continuous batching: fill slots as they become free
  const contSchedule = [
    { slot: 0, start: 0, end: 3, reqId: 'A', color: REQUESTS[0].color },
    { slot: 1, start: 0, end: 5, reqId: 'B', color: REQUESTS[1].color },
    { slot: 2, start: 0, end: 2, reqId: 'C', color: REQUESTS[2].color },
    // C finishes at t=2, D fills in
    { slot: 2, start: 2, end: 5, reqId: 'D', color: REQUESTS[3].color },
    // A finishes at t=3, E fills in
    { slot: 0, start: 3, end: 5, reqId: 'E', color: REQUESTS[4].color },
    { slot: 0, start: 5, end: 8, reqId: '', color: '', idle: true },
    { slot: 1, start: 5, end: 8, reqId: '', color: '', idle: true },
    { slot: 2, start: 5, end: 8, reqId: '', color: '', idle: true },
  ];

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Timeline title="Static Batching" schedule={staticSchedule} utilization={63} />
        <Timeline title="Continuous Batching" schedule={contSchedule} utilization={83} />
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        Continuous Batching 在请求完成后立即插入新请求，显著提高 GPU 利用率
      </p>
    </div>
  );
}
