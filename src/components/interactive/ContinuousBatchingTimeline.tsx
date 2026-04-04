import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;

interface Request {
  id: string;
  prefillLen: number;
  decodeLen: number;
  startTime: number;
  color: string;
}

const INITIAL_REQUESTS: Request[] = [
  { id: 'A', prefillLen: 2, decodeLen: 6, startTime: 0, color: '#3b82f6' },
  { id: 'B', prefillLen: 1, decodeLen: 3, startTime: 1, color: '#f59e0b' },
  { id: 'C', prefillLen: 2, decodeLen: 4, startTime: 3, color: '#10b981' },
];

export default function ContinuousBatchingTimeline() {
  const [requests] = useState(INITIAL_REQUESTS);
  const [showStatic, setShowStatic] = useState(true);

  const timeScale = 42; // pixels per time unit
  const timelineX = 60;
  const maxTime = 12;

  // Continuous batching layout
  const contY = 60;
  const staticY = 180;
  const rowH = 24;

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3">
        <button onClick={() => setShowStatic(!showStatic)}
          className={`px-3 py-1 text-xs rounded-full border ${
            showStatic ? 'bg-gray-100 border-gray-400 text-gray-700' : 'bg-white border-gray-300 text-gray-500'
          }`}>
          {showStatic ? '隐藏' : '显示'} Static Batching 对比
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Continuous Batching 时间线
        </text>

        {/* Time axis */}
        <text x={timelineX - 5} y={contY - 8} textAnchor="end" fontSize="7"
          fill={COLORS.mid} fontFamily={FONTS.sans}>Continuous</text>
        {Array.from({ length: maxTime + 1 }, (_, t) => (
          <g key={t}>
            <line x1={timelineX + t * timeScale} y1={contY - 3}
              x2={timelineX + t * timeScale} y2={contY + requests.length * rowH + 3}
              stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={timelineX + t * timeScale} y={contY + requests.length * rowH + 15}
              textAnchor="middle" fontSize="6" fill={COLORS.mid} fontFamily={FONTS.mono}>
              t={t}
            </text>
          </g>
        ))}

        {/* Continuous batching bars */}
        {requests.map((req, ri) => {
          const y = contY + ri * rowH;
          const prefillX = timelineX + req.startTime * timeScale;
          const decodeX = prefillX + req.prefillLen * timeScale;
          return (
            <g key={req.id}>
              <text x={timelineX - 8} y={y + rowH / 2 + 3} textAnchor="end"
                fontSize="7" fontWeight="600" fill={req.color} fontFamily={FONTS.sans}>
                {req.id}
              </text>
              {/* Prefill */}
              <rect x={prefillX} y={y + 2} width={req.prefillLen * timeScale - 2}
                height={rowH - 4} rx={3} fill={req.color} opacity={0.7} />
              <text x={prefillX + (req.prefillLen * timeScale) / 2} y={y + rowH / 2 + 3}
                textAnchor="middle" fontSize="6" fill="white" fontWeight="600"
                fontFamily={FONTS.sans}>P</text>
              {/* Decode */}
              <rect x={decodeX} y={y + 2} width={req.decodeLen * timeScale - 2}
                height={rowH - 4} rx={3} fill={req.color} opacity={0.35} />
              <text x={decodeX + (req.decodeLen * timeScale) / 2} y={y + rowH / 2 + 3}
                textAnchor="middle" fontSize="6" fill={req.color} fontWeight="600"
                fontFamily={FONTS.sans}>D ({req.decodeLen})</text>
            </g>
          );
        })}

        {/* Static batching comparison */}
        {showStatic && (
          <g>
            <text x={timelineX - 5} y={staticY - 8} textAnchor="end" fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>Static</text>

            {/* Time axis for static */}
            {Array.from({ length: maxTime + 1 }, (_, t) => (
              <line key={t} x1={timelineX + t * timeScale} y1={staticY - 3}
                x2={timelineX + t * timeScale} y2={staticY + requests.length * rowH + 3}
                stroke="#e2e8f0" strokeWidth={0.5} />
            ))}

            {/* In static batching, B waits for A to finish before being in same batch */}
            {requests.map((req, ri) => {
              const y = staticY + ri * rowH;
              // Static: each request runs in its own batch sequentially
              const staticStart = ri === 0 ? 0 : ri === 1 ? 0 : 4; // simplified
              const totalLen = req.prefillLen + req.decodeLen;
              return (
                <g key={req.id}>
                  <text x={timelineX - 8} y={y + rowH / 2 + 3} textAnchor="end"
                    fontSize="7" fontWeight="600" fill={req.color} fontFamily={FONTS.sans}>
                    {req.id}
                  </text>
                  <rect x={timelineX + staticStart * timeScale} y={y + 2}
                    width={totalLen * timeScale - 2} height={rowH - 4} rx={3}
                    fill={req.color} opacity={0.3} />
                  {/* Gray waiting period for C */}
                  {ri === 2 && (
                    <rect x={timelineX + 3 * timeScale} y={y + 2}
                      width={1 * timeScale - 2} height={rowH - 4} rx={3}
                      fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.5}
                      strokeDasharray="2,2" />
                  )}
                </g>
              );
            })}

            <text x={W / 2} y={staticY + requests.length * rowH + 28} textAnchor="middle"
              fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
              Static: 短请求等长请求完成才能释放 | Continuous: 完成即释放, 新请求立即插入
            </text>
          </g>
        )}

        {/* Legend */}
        <rect x={30} y={H - 18} width={20} height={10} rx={2} opacity={0.7}
          fill={COLORS.primary} />
        <text x={55} y={H - 10} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Prefill (P)
        </text>
        <rect x={120} y={H - 18} width={20} height={10} rx={2} opacity={0.35}
          fill={COLORS.primary} />
        <text x={145} y={H - 10} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Decode (D)
        </text>
      </svg>
    </div>
  );
}
