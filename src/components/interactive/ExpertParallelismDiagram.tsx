import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

const W = 580;
const H = 280;

const NUM_GPUS = 4;
const EXPERTS_PER_GPU = 2;

export default function ExpertParallelismDiagram() {
  const gpuW = 110;
  const gpuH = 160;
  const gpuGap = 20;
  const startX = (W - NUM_GPUS * gpuW - (NUM_GPUS - 1) * gpuGap) / 2;
  const gpuY = 55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Expert Parallelism: Expert 分布在不同 GPU 上
      </text>

      <defs>
        <marker id="ep-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
        </marker>
      </defs>

      {Array.from({ length: NUM_GPUS }, (_, gi) => {
        const gx = startX + gi * (gpuW + gpuGap);
        return (
          <g key={gi}>
            {/* GPU box */}
            <rect x={gx} y={gpuY} width={gpuW} height={gpuH} rx={8}
              fill="#f8fafc" stroke={HEAD_COLORS[gi]} strokeWidth={2} />
            <text x={gx + gpuW / 2} y={gpuY + 18} textAnchor="middle"
              fontSize="9" fontWeight="700" fill={HEAD_COLORS[gi]} fontFamily={FONTS.sans}>
              GPU {gi}
            </text>

            {/* Experts inside GPU */}
            {Array.from({ length: EXPERTS_PER_GPU }, (_, ei) => {
              const ey = gpuY + 30 + ei * 35;
              const expertIdx = gi * EXPERTS_PER_GPU + ei;
              return (
                <g key={ei}>
                  <rect x={gx + 10} y={ey} width={gpuW - 20} height={28} rx={5}
                    fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
                  <text x={gx + gpuW / 2} y={ey + 17} textAnchor="middle"
                    fontSize="8" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.sans}>
                    Expert {expertIdx}
                  </text>
                </g>
              );
            })}

            {/* Token buffer at bottom */}
            <rect x={gx + 10} y={gpuY + gpuH - 40} width={gpuW - 20} height={28} rx={5}
              fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
            <text x={gx + gpuW / 2} y={gpuY + gpuH - 23} textAnchor="middle"
              fontSize="7" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              Token Buffer
            </text>
          </g>
        );
      })}

      {/* All-to-All arrows between GPUs */}
      {[
        { from: 0, to: 1, label: 'dispatch' },
        { from: 1, to: 2, label: '' },
        { from: 2, to: 3, label: 'combine' },
      ].map(({ from, to, label }, i) => {
        const x1 = startX + from * (gpuW + gpuGap) + gpuW;
        const x2 = startX + to * (gpuW + gpuGap);
        const y = gpuY + gpuH - 25;
        return (
          <g key={i}>
            <line x1={x1 + 2} y1={y - 4} x2={x2 - 2} y2={y - 4}
              stroke={COLORS.primary} strokeWidth={1} markerEnd="url(#ep-arr)" />
            <line x1={x2 - 2} y1={y + 4} x2={x1 + 2} y2={y + 4}
              stroke={COLORS.green} strokeWidth={1} markerEnd="url(#ep-arr)" />
            {label && (
              <text x={(x1 + x2) / 2} y={y - 10} textAnchor="middle"
                fontSize="6" fill={COLORS.mid} fontFamily={FONTS.sans}>{label}</text>
            )}
          </g>
        );
      })}

      {/* Flow description */}
      <text x={W / 2} y={gpuY + gpuH + 25} textAnchor="middle" fontSize="9"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        All-to-All 通信：token dispatch → expert compute → result combine
      </text>
      <text x={W / 2} y={gpuY + gpuH + 42} textAnchor="middle" fontSize="8"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        每个 GPU 上的 token 需要发送到对应 expert 所在 GPU，计算完再发回
      </text>
    </svg>
  );
}
