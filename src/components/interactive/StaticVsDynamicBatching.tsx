import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface Request {
  id: string;
  start: number;
  prefill: number;
  decode: number;
  color: string;
}

const REQUESTS: Request[] = [
  { id: 'R1', start: 0, prefill: 2, decode: 3,  color: COLORS.primary },
  { id: 'R2', start: 0, prefill: 1, decode: 6,  color: COLORS.green },
  { id: 'R3', start: 0, prefill: 2, decode: 2,  color: COLORS.orange },
  { id: 'R4', start: 0, prefill: 1, decode: 10, color: COLORS.purple },
];

const TICK_W = 38;
const BAR_H = 28;
const GAP = 6;

export default function StaticVsDynamicBatching({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Static Batching vs Continuous Batching',
      subtitle: '切换查看两种批处理策略的时间线差异',
      static: 'Static Batching',
      continuous: 'Continuous Batching',
      iteration: 'Iteration (时间步)',
      prefill: 'Prefill',
      decode: 'Decode',
      idle: '空闲等待',
      newRequest: '新请求',
      staticSummary: 'Static Batching：所有请求必须等最长的完成 → GPU 利用率低、红色区域全是浪费',
      continuousSummary: 'Continuous Batching：完成即释放，新请求立即填入 → GPU 利用率高、无空闲等待',
    },
    en: {
      title: 'Static Batching vs Continuous Batching',
      subtitle: 'Toggle to see timeline differences between two batching strategies',
      static: 'Static Batching',
      continuous: 'Continuous Batching',
      iteration: 'Iteration (time step)',
      prefill: 'Prefill',
      decode: 'Decode',
      idle: 'Idle wait',
      newRequest: 'New request',
      staticSummary: 'Static Batching: all requests wait for the longest to finish → low GPU utilization, red zones are wasted',
      continuousSummary: 'Continuous Batching: finish and release immediately, new requests fill in → high GPU utilization, no idle time',
    },
  }[locale];

  const [mode, setMode] = useState<'static' | 'continuous'>('static');

  const maxLen = Math.max(...REQUESTS.map(r => r.prefill + r.decode));
  const ticks = Array.from({ length: maxLen + 2 }, (_, i) => i);

  const chartX = 60;
  const chartY = 90;

  // Static: all requests wait until the longest finishes
  // Continuous: each request releases when done, new work can fill in
  const staticEnd = maxLen;
  const continuousEnds = REQUESTS.map(r => r.prefill + r.decode);

  // Waiting requests that could fill freed slots (simplified model)
  const waitingReqs: Request[] = [
    { id: 'R5', start: 0, prefill: 1, decode: 3, color: '#00838f' },
    { id: 'R6', start: 0, prefill: 1, decode: 2, color: '#ef6c00' },
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

      {/* Toggle */}
      {(['static', 'continuous'] as const).map((m, i) => (
        <g key={m} onClick={() => setMode(m)} cursor="pointer">
          <rect x={170 + i * 140} y={50} width={125} height={26} rx={13}
            fill={mode === m ? COLORS.primary : COLORS.bgAlt}
            stroke={mode === m ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={232 + i * 140} y={67} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={mode === m ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {m === 'static' ? t.static : t.continuous}
          </text>
        </g>
      ))}

      {/* Time axis */}
      <line x1={chartX} y1={chartY + REQUESTS.length * (BAR_H + GAP) + 20}
        x2={chartX + ticks.length * TICK_W}
        y2={chartY + REQUESTS.length * (BAR_H + GAP) + 20}
        stroke={COLORS.mid} strokeWidth="1" />
      {ticks.map(t => {
        const x = chartX + t * TICK_W;
        const axisY = chartY + REQUESTS.length * (BAR_H + GAP) + 20;
        return (
          <g key={t}>
            <line x1={x} y1={axisY} x2={x} y2={axisY + 5} stroke={COLORS.mid} strokeWidth="1" />
            <text x={x} y={axisY + 16} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily={FONTS.mono}>{t}</text>
          </g>
        );
      })}
      <text x={chartX + ticks.length * TICK_W / 2}
        y={chartY + REQUESTS.length * (BAR_H + GAP) + 36}
        textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.iteration}
      </text>

      {/* Request bars */}
      {REQUESTS.map((req, ri) => {
        const y = chartY + ri * (BAR_H + GAP);
        const totalLen = req.prefill + req.decode;
        const endX = mode === 'static' ? staticEnd : totalLen;
        const idleLen = mode === 'static' ? staticEnd - totalLen : 0;

        return (
          <g key={req.id}>
            <text x={chartX - 8} y={y + BAR_H / 2 + 4} textAnchor="end"
              fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
              {req.id}
            </text>
            {/* Prefill */}
            <rect x={chartX} y={y} width={req.prefill * TICK_W} height={BAR_H} rx={4}
              fill={req.color} opacity={0.8} />
            <text x={chartX + req.prefill * TICK_W / 2} y={y + BAR_H / 2 + 4}
              textAnchor="middle" fontSize="8" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
              {t.prefill}
            </text>
            {/* Decode */}
            <rect x={chartX + req.prefill * TICK_W} y={y}
              width={req.decode * TICK_W} height={BAR_H} rx={4}
              fill={req.color} opacity={0.5} />
            <text x={chartX + (req.prefill + req.decode / 2) * TICK_W} y={y + BAR_H / 2 + 4}
              textAnchor="middle" fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.decode}
            </text>
            {/* Idle time (static only) */}
            {idleLen > 0 && (
              <>
                <rect x={chartX + totalLen * TICK_W} y={y}
                  width={idleLen * TICK_W} height={BAR_H} rx={4}
                  fill={COLORS.waste} opacity={0.6} stroke={COLORS.red} strokeWidth="1"
                  strokeDasharray="3,2" />
                <text x={chartX + (totalLen + idleLen / 2) * TICK_W} y={y + BAR_H / 2 + 4}
                  textAnchor="middle" fontSize="8" fill={COLORS.red} fontFamily={FONTS.sans}>
                  {t.idle}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Continuous: show new requests filling in */}
      {mode === 'continuous' && waitingReqs.map((req, i) => {
        // Find earliest freed slot
        const sortedEnds = [...continuousEnds].sort((a, b) => a - b);
        const slotStart = sortedEnds[i] || sortedEnds[sortedEnds.length - 1];
        const y = chartY + (continuousEnds.indexOf(sortedEnds[i])) * (BAR_H + GAP);
        if (i >= sortedEnds.length) return null;
        return (
          <g key={`new-${req.id}`}>
            <rect x={chartX + slotStart * TICK_W} y={y}
              width={(req.prefill + req.decode) * TICK_W} height={BAR_H} rx={4}
              fill={req.color} opacity={0.4} stroke={req.color}
              strokeWidth="1" strokeDasharray="4,2" />
            <text x={chartX + (slotStart + (req.prefill + req.decode) / 2) * TICK_W}
              y={y + BAR_H / 2 + 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={req.color} fontFamily={FONTS.sans}>
              {req.id} ({t.newRequest})
            </text>
          </g>
        );
      })}

      {/* Summary */}
      <rect x={60} y={H - 50} width={W - 120} height={38} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 27} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {mode === 'static' ? t.staticSummary : t.continuousSummary}
      </text>
    </svg>
  );
}
