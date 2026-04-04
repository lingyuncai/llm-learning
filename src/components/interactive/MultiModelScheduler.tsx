import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;

interface Event {
  time: number;
  action: string;
  model: string;
  color: string;
  reason: string;
}

const EVENTS: Event[] = [
  { time: 0, action: 'Load', model: 'llama3-8B', color: '#3b82f6', reason: '首次请求, 加载模型' },
  { time: 1, action: 'Infer', model: 'llama3-8B', color: '#3b82f6', reason: 'User A 推理中' },
  { time: 3, action: 'Load', model: 'qwen3-8B', color: '#f59e0b', reason: 'User B 请求不同模型' },
  { time: 4, action: 'Infer', model: 'qwen3-8B', color: '#f59e0b', reason: 'User B 推理中, llama3 空闲' },
  { time: 6, action: 'Reuse', model: 'llama3-8B', color: '#3b82f6', reason: 'User C 请求 llama3, 仍在内存中 → 复用' },
  { time: 7, action: 'Infer', model: 'llama3-8B', color: '#3b82f6', reason: 'User C 推理中' },
  { time: 9, action: 'Unload', model: 'qwen3-8B', color: '#f59e0b', reason: '空闲超时 (KEEP_ALIVE), 卸载释放显存' },
];

export default function MultiModelScheduler() {
  const eventH = 34;
  const startY = 50;
  const timeX = 30;
  const actionX = 80;
  const modelX = 160;
  const reasonX = 290;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        多模型调度时间线
      </text>
      <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        Scheduler 管理模型的加载、推理、复用和卸载
      </text>

      {/* Headers */}
      <text x={timeX} y={startY - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Time</text>
      <text x={actionX} y={startY - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Action</text>
      <text x={modelX} y={startY - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Model</text>
      <text x={reasonX} y={startY - 5} fontSize="7" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>Decision Reason</text>

      {EVENTS.map((ev, i) => {
        const y = startY + i * eventH;
        const actionColors: Record<string, string> = {
          Load: COLORS.orange, Infer: COLORS.green, Reuse: COLORS.primary, Unload: COLORS.red,
        };
        return (
          <g key={i}>
            {i % 2 === 0 && (
              <rect x={20} y={y} width={W - 40} height={eventH} fill="#f8fafc" />
            )}
            {/* Timeline dot */}
            <circle cx={timeX + 10} cy={y + eventH / 2} r={4} fill={ev.color} />
            {i < EVENTS.length - 1 && (
              <line x1={timeX + 10} y1={y + eventH / 2 + 4}
                x2={timeX + 10} y2={y + eventH + eventH / 2 - 4}
                stroke="#e2e8f0" strokeWidth={1} />
            )}
            <text x={timeX + 22} y={y + eventH / 2 + 3} fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.mono}>t={ev.time}s</text>
            <text x={actionX} y={y + eventH / 2 + 3} fontSize="7.5" fontWeight="600"
              fill={actionColors[ev.action] || COLORS.mid} fontFamily={FONTS.sans}>
              {ev.action}
            </text>
            <text x={modelX} y={y + eventH / 2 + 3} fontSize="7" fontWeight="600"
              fill={ev.color} fontFamily={FONTS.sans}>{ev.model}</text>
            <text x={reasonX} y={y + eventH / 2 + 3} fontSize="6.5"
              fill={COLORS.mid} fontFamily={FONTS.sans}>{ev.reason}</text>
          </g>
        );
      })}
    </svg>
  );
}
