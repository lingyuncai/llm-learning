import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 340;

const TICK_W = 36;
const BAR_H = 24;
const GAP = 4;

export default function ChunkedPrefillTimeline() {
  const chartX = 70;
  const unchunkedY = 70;
  const chunkedY = 200;
  const labelX = 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Chunked Prefill：长 Prompt 分块调度
      </text>

      {/* Scenario 1: Non-chunked */}
      <text x={chartX + 5 * TICK_W} y={unchunkedY - 10} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
        不分块：Prefill 独占 GPU
      </text>
      <text x={labelX} y={unchunkedY + BAR_H / 2 + 4} fontSize="8" fontWeight="600"
        fill={COLORS.mid} fontFamily={FONTS.sans}>新请求</text>
      <rect x={chartX} y={unchunkedY} width={8 * TICK_W} height={BAR_H} rx={4}
        fill={COLORS.primary} opacity={0.8} />
      <text x={chartX + 4 * TICK_W} y={unchunkedY + BAR_H / 2 + 4} textAnchor="middle"
        fontSize="9" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
        Long Prefill (8 iteration 独占)
      </text>

      <text x={labelX} y={unchunkedY + BAR_H + GAP + BAR_H / 2 + 4} fontSize="8"
        fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>Decode A</text>
      <rect x={chartX} y={unchunkedY + BAR_H + GAP}
        width={8 * TICK_W} height={BAR_H} rx={4}
        fill={COLORS.waste} opacity={0.6} stroke={COLORS.red} strokeWidth="1"
        strokeDasharray="3,2" />
      <text x={chartX + 4 * TICK_W} y={unchunkedY + BAR_H + GAP + BAR_H / 2 + 4}
        textAnchor="middle" fontSize="9" fill={COLORS.red} fontFamily={FONTS.sans}>
        被阻塞 — TTFT 飙升!
      </text>

      <text x={labelX} y={unchunkedY + 2 * (BAR_H + GAP) + BAR_H / 2 + 4} fontSize="8"
        fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>Decode B</text>
      <rect x={chartX} y={unchunkedY + 2 * (BAR_H + GAP)}
        width={8 * TICK_W} height={BAR_H} rx={4}
        fill={COLORS.waste} opacity={0.6} stroke={COLORS.red} strokeWidth="1"
        strokeDasharray="3,2" />
      <text x={chartX + 4 * TICK_W} y={unchunkedY + 2 * (BAR_H + GAP) + BAR_H / 2 + 4}
        textAnchor="middle" fontSize="9" fill={COLORS.red} fontFamily={FONTS.sans}>
        被阻塞 — 用户感知卡顿!
      </text>

      {/* Scenario 2: Chunked */}
      <text x={chartX + 5 * TICK_W} y={chunkedY - 10} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
        分块：Prefill 与 Decode 交替执行
      </text>
      <text x={labelX} y={chunkedY + BAR_H / 2 + 4} fontSize="8" fontWeight="600"
        fill={COLORS.mid} fontFamily={FONTS.sans}>新请求</text>
      {[0, 2, 4, 6].map((t, i) => (
        <g key={`chunk-${i}`}>
          <rect x={chartX + t * TICK_W} y={chunkedY} width={TICK_W} height={BAR_H} rx={4}
            fill={COLORS.primary} opacity={0.8} />
          <text x={chartX + (t + 0.5) * TICK_W} y={chunkedY + BAR_H / 2 + 4}
            textAnchor="middle" fontSize="7" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>
            P{i + 1}
          </text>
        </g>
      ))}

      <text x={labelX} y={chunkedY + BAR_H + GAP + BAR_H / 2 + 4} fontSize="8"
        fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>Decode A</text>
      {[1, 3, 5, 7].map((t) => (
        <g key={`da-${t}`}>
          <rect x={chartX + t * TICK_W} y={chunkedY + BAR_H + GAP}
            width={TICK_W} height={BAR_H} rx={4}
            fill={COLORS.green} opacity={0.5} />
          <text x={chartX + (t + 0.5) * TICK_W} y={chunkedY + BAR_H + GAP + BAR_H / 2 + 4}
            textAnchor="middle" fontSize="7" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>D</text>
        </g>
      ))}

      <text x={labelX} y={chunkedY + 2 * (BAR_H + GAP) + BAR_H / 2 + 4} fontSize="8"
        fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>Decode B</text>
      {[1, 3, 5, 7].map((t) => (
        <g key={`db-${t}`}>
          <rect x={chartX + t * TICK_W} y={chunkedY + 2 * (BAR_H + GAP)}
            width={TICK_W} height={BAR_H} rx={4}
            fill={COLORS.orange} opacity={0.5} />
          <text x={chartX + (t + 0.5) * TICK_W} y={chunkedY + 2 * (BAR_H + GAP) + BAR_H / 2 + 4}
            textAnchor="middle" fontSize="7" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>D</text>
        </g>
      ))}

      <rect x={40} y={H - 35} width={W - 80} height={28} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 17} textAnchor="middle" fontSize="9"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Chunked Prefill 将长 prompt 切成小块，与 decode 交替执行 — Decode 请求不再被阻塞
      </text>
    </svg>
  );
}
