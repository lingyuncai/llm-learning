import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 300;

export default function QATvsPTQBoundary() {
  const ptqPoints = [
    { bit: 8, ppl: 0.5 },
    { bit: 6, ppl: 0.8 },
    { bit: 4, ppl: 1.5 },
    { bit: 3, ppl: 5.0 },
    { bit: 2, ppl: 15.0 },
    { bit: 1, ppl: 35.0 },
  ];

  const qatPoints = [
    { bit: 8, ppl: 0.4 },
    { bit: 6, ppl: 0.6 },
    { bit: 4, ppl: 1.0 },
    { bit: 3, ppl: 2.5 },
    { bit: 2, ppl: 6.0 },
    { bit: 1, ppl: 12.0 },
  ];

  const margin = { top: 40, right: 50, bottom: 50, left: 60 };
  const chartW = W - margin.left - margin.right;
  const chartH = H - margin.top - margin.bottom;

  const xScale = (bit: number) => margin.left + ((8 - bit) / 7) * chartW;
  const yScale = (ppl: number) => margin.top + chartH - (Math.min(ppl, 40) / 40) * chartH;

  const ptqPath = ptqPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.bit)} ${yScale(p.ppl)}`).join(' ');
  const qatPath = qatPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.bit)} ${yScale(p.ppl)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y="20" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        QAT vs PTQ 精度边界：Perplexity 增长曲线
      </text>

      <g>
        <rect x={margin.left} y={margin.top} width={chartW} height={chartH} fill={COLORS.bg} stroke={COLORS.mid} strokeWidth="1" />

        {[0, 10, 20, 30, 40].map(y => (
          <g key={`y-${y}`}>
            <line
              x1={margin.left}
              x2={margin.left + chartW}
              y1={yScale(y)}
              y2={yScale(y)}
              stroke={COLORS.bgAlt}
              strokeWidth="1"
            />
            <text x={margin.left - 10} y={yScale(y) + 4} textAnchor="end" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {y}
            </text>
          </g>
        ))}

        {[1, 2, 3, 4, 6, 8].map(x => (
          <g key={`x-${x}`}>
            <line
              x1={xScale(x)}
              x2={xScale(x)}
              y1={margin.top}
              y2={margin.top + chartH}
              stroke={COLORS.bgAlt}
              strokeWidth="1"
            />
            <text x={xScale(x)} y={margin.top + chartH + 20} textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {x}
            </text>
          </g>
        ))}

        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
          Bit Width (位宽)
        </text>
        <text
          x={margin.left - 45}
          y={margin.top + chartH / 2}
          textAnchor="middle"
          fontSize="11"
          fill={COLORS.mid}
          fontFamily={FONTS.sans}
          transform={`rotate(-90, ${margin.left - 45}, ${margin.top + chartH / 2})`}
        >
          Perplexity 增长 (%)
        </text>

        <path d={ptqPath} fill="none" stroke={COLORS.red} strokeWidth="3" />
        {ptqPoints.map(p => (
          <circle key={`ptq-${p.bit}`} cx={xScale(p.bit)} cy={yScale(p.ppl)} r="4" fill={COLORS.red} />
        ))}

        <path d={qatPath} fill="none" stroke={COLORS.green} strokeWidth="3" />
        {qatPoints.map(p => (
          <circle key={`qat-${p.bit}`} cx={xScale(p.bit)} cy={yScale(p.ppl)} r="4" fill={COLORS.green} />
        ))}

        <circle cx={xScale(3)} cy={yScale(3.2)} r="6" fill="none" stroke={COLORS.purple} strokeWidth="2" strokeDasharray="3,2" />
        <text x={xScale(3) + 12} y={yScale(3.2) - 8} fontSize="10" fill={COLORS.purple} fontFamily={FONTS.sans}>
          交叉点
        </text>
        <text x={xScale(3) + 12} y={yScale(3.2) + 5} fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
          ~3 bit
        </text>

        <rect x={W - 170} y={margin.top + 10} width="150" height="60" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="3" />
        <line x1={W - 155} x2={W - 135} y1={margin.top + 30} y2={margin.top + 30} stroke={COLORS.red} strokeWidth="3" />
        <text x={W - 130} y={margin.top + 34} fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>
          PTQ (Post-Training)
        </text>
        <line x1={W - 155} x2={W - 135} y1={margin.top + 55} y2={margin.top + 55} stroke={COLORS.green} strokeWidth="3" />
        <text x={W - 130} y={margin.top + 59} fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>
          QAT (Quantization-Aware)
        </text>

        <rect x={margin.left + 10} y={margin.top + chartH - 90} width="200" height="75" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1.5" rx="3" />
        <text x={margin.left + 110} y={margin.top + chartH - 72} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          极低比特区域 (≤3 bit)
        </text>
        <text x={margin.left + 110} y={margin.top + chartH - 58} textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
          QAT 显著优于 PTQ
        </text>
        <text x={margin.left + 110} y={margin.top + chartH - 45} textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
          PTQ 精度快速崩溃
        </text>
        <text x={margin.left + 110} y={margin.top + chartH - 32} textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
          需训练时量化感知
        </text>
      </g>
    </svg>
  );
}
