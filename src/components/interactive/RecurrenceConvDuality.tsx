import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 340;
const N = 6; // sequence length for demo

export default function RecurrenceConvDuality() {
  const [mode, setMode] = useState<'recurrence' | 'convolution'>('recurrence');

  const nodeR = 16;
  const startX = 60;
  const nodeGap = 75;
  const stateY = 100;
  const inputY = 200;
  const outputY = 50;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {mode === 'recurrence' ? 'Recurrence 模式（推理）' : 'Convolution 模式（训练）'}
      </text>

      {/* Toggle buttons */}
      {(['recurrence', 'convolution'] as const).map((m, i) => (
        <g key={m} onClick={() => setMode(m)} cursor="pointer">
          <rect x={140 + i * 170} y={32} width={150} height={24} rx={5}
            fill={mode === m ? COLORS.primary : COLORS.bg}
            stroke={mode === m ? COLORS.primary : COLORS.light} strokeWidth="1.5" />
          <text x={215 + i * 170} y={48} textAnchor="middle" fontSize="10"
            fontWeight={mode === m ? '700' : '400'}
            fill={mode === m ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {m === 'recurrence' ? 'Recurrence (逐步)' : 'Convolution (并行)'}
          </text>
        </g>
      ))}

      {mode === 'recurrence' ? (
        <g>
          {/* Input tokens */}
          <text x={startX - 40} y={inputY + 5} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>输入 u</text>
          {Array.from({ length: N }, (_, i) => (
            <g key={`in-${i}`}>
              <rect x={startX + i * nodeGap - 15} y={inputY - 12} width={30} height={24} rx={4}
                fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" />
              <text x={startX + i * nodeGap} y={inputY + 5} textAnchor="middle"
                fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
                u{i + 1}
              </text>
            </g>
          ))}

          {/* State nodes with arrows */}
          <text x={startX - 40} y={stateY + 5} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>状态 x</text>
          {Array.from({ length: N }, (_, i) => (
            <g key={`state-${i}`}>
              <circle cx={startX + i * nodeGap} cy={stateY} r={nodeR}
                fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" />
              <text x={startX + i * nodeGap} y={stateY + 4} textAnchor="middle"
                fontSize="9" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
                x{i + 1}
              </text>
              {/* Ā arrow between states */}
              {i > 0 && (
                <>
                  <line x1={startX + (i - 1) * nodeGap + nodeR + 2} y1={stateY}
                    x2={startX + i * nodeGap - nodeR - 2} y2={stateY}
                    stroke={COLORS.primary} strokeWidth="1.5" markerEnd="url(#rcd-arrow)" />
                  <text x={startX + (i - 0.5) * nodeGap} y={stateY - 12} textAnchor="middle"
                    fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.mono}>Ā</text>
                </>
              )}
              {/* B̄u arrow from input to state */}
              <line x1={startX + i * nodeGap} y1={inputY - 14}
                x2={startX + i * nodeGap} y2={stateY + nodeR + 2}
                stroke={COLORS.orange} strokeWidth="1" strokeDasharray="3,2"
                markerEnd="url(#rcd-arrow-orange)" />
              <text x={startX + i * nodeGap + 14} y={(inputY + stateY) / 2}
                fontSize="7" fill={COLORS.orange} fontFamily={FONTS.mono}>B̄u</text>
            </g>
          ))}

          {/* Output */}
          <text x={startX - 40} y={outputY + 5} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>输出 y</text>
          {Array.from({ length: N }, (_, i) => (
            <g key={`out-${i}`}>
              <line x1={startX + i * nodeGap} y1={stateY - nodeR - 2}
                x2={startX + i * nodeGap} y2={outputY + 14}
                stroke={COLORS.green} strokeWidth="1" strokeDasharray="3,2"
                markerEnd="url(#rcd-arrow-green)" />
              <rect x={startX + i * nodeGap - 15} y={outputY - 12} width={30} height={24} rx={4}
                fill="#e8f5e9" stroke={COLORS.green} strokeWidth="1" />
              <text x={startX + i * nodeGap} y={outputY + 5} textAnchor="middle"
                fontSize="10" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.mono}>
                y{i + 1}
              </text>
            </g>
          ))}

          {/* Complexity */}
          <rect x={60} y={250} width={460} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={268} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            O(1) per step · O(N) total · Sequential
          </text>
          <text x={290} y={282} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            适合推理：每个新 token 只需一次状态更新
          </text>
        </g>
      ) : (
        <g>
          {/* Input sequence */}
          <text x={40} y={85} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>输入序列 u</text>
          <rect x={40} y={95} width={220} height={30} rx={4}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" />
          <text x={150} y={114} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            [u₁, u₂, u₃, u₄, u₅, u₆]
          </text>

          {/* Convolution kernel */}
          <text x={40} y={155} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>SSM 卷积核 K̄</text>
          <rect x={40} y={165} width={220} height={30} rx={4}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" />
          <text x={150} y={184} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.mono}>
            [CB̄, CĀB̄, CĀ²B̄, ...]
          </text>

          {/* Convolution operator */}
          <text x={290} y={140} fontSize="24" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.mono}>*</text>
          <text x={310} y={145} fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
            卷积
          </text>

          {/* FFT acceleration */}
          <rect x={320} y={95} width={220} height={100} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={430} y={118} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>FFT 加速</text>
          <text x={430} y={138} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.mono}>
            y = IFFT(FFT(u) · FFT(K̄))
          </text>
          <text x={430} y={158} textAnchor="middle" fontSize="10"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            全部 token 并行计算
          </text>
          <text x={430} y={178} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            无需逐步递推
          </text>

          {/* Output */}
          <text x={40} y={225} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>输出序列 y</text>
          <rect x={40} y={235} width={500} height={30} rx={4}
            fill="#e8f5e9" stroke={COLORS.green} strokeWidth="1" />
          <text x={290} y={254} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.mono}>
            [y₁, y₂, y₃, y₄, y₅, y₆]
          </text>

          {/* Complexity */}
          <rect x={60} y={280} width={460} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={298} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            O(N log N) total · Parallel
          </text>
          <text x={290} y={312} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            适合训练：所有 token 同时处理，充分利用 GPU 并行
          </text>
        </g>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="rcd-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={COLORS.primary} />
        </marker>
        <marker id="rcd-arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={COLORS.orange} />
        </marker>
        <marker id="rcd-arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={COLORS.green} />
        </marker>
      </defs>
    </svg>
  );
}
