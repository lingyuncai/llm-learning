import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

const CONCURRENCIES = [1, 4, 8, 16, 32, 64];

interface Series {
  name: string;
  color: string;
  // throughput (req/s) at each concurrency level
  values: number[];
}

const DATA: Series[] = [
  { name: 'Static Batch',     color: COLORS.red,     values: [5, 12, 14, 15, 15, 15] },
  { name: 'Dynamic Batch',    color: COLORS.orange,  values: [5, 16, 28, 35, 38, 40] },
  { name: 'Continuous Batch',  color: COLORS.green,   values: [5, 18, 34, 56, 72, 85] },
];

export default function ThroughputBenchmark() {
  const [hovered, setHovered] = useState<{ series: number; point: number } | null>(null);

  const chartX = 70;
  const chartY = 60;
  const chartW = 440;
  const chartH = 220;

  const maxVal = 100;
  const xScale = (i: number) => chartX + (i / (CONCURRENCIES.length - 1)) * chartW;
  const yScale = (v: number) => chartY + chartH - (v / maxVal) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        吞吐量对比：三种批处理策略
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        Hover 查看具体数值
      </text>

      {/* Y axis */}
      <line x1={chartX} y1={chartY} x2={chartX} y2={chartY + chartH}
        stroke={COLORS.light} strokeWidth="1" />
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={chartX - 5} y1={yScale(v)} x2={chartX + chartW} y2={yScale(v)}
            stroke={COLORS.light} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={chartX - 8} y={yScale(v) + 4} textAnchor="end"
            fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>{v}</text>
        </g>
      ))}
      <text x={20} y={chartY + chartH / 2}
        textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}
        transform={`rotate(-90, 20, ${chartY + chartH / 2})`}>
        吞吐量 (req/s)
      </text>

      {/* X axis */}
      <line x1={chartX} y1={chartY + chartH} x2={chartX + chartW} y2={chartY + chartH}
        stroke={COLORS.light} strokeWidth="1" />
      {CONCURRENCIES.map((c, i) => (
        <text key={c} x={xScale(i)} y={chartY + chartH + 16} textAnchor="middle"
          fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>{c}</text>
      ))}
      <text x={chartX + chartW / 2} y={chartY + chartH + 32}
        textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
        并发请求数
      </text>

      {/* Lines + dots */}
      {DATA.map((series, si) => {
        const points = series.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
        return (
          <g key={series.name}>
            <polyline points={points} fill="none"
              stroke={series.color} strokeWidth="2.5" />
            {series.values.map((v, i) => {
              const isHov = hovered?.series === si && hovered?.point === i;
              return (
                <g key={i}
                  onMouseEnter={() => setHovered({ series: si, point: i })}
                  onMouseLeave={() => setHovered(null)}>
                  <circle cx={xScale(i)} cy={yScale(v)} r={isHov ? 6 : 4}
                    fill={series.color} stroke="#fff" strokeWidth="2" cursor="pointer" />
                  {isHov && (
                    <g>
                      <rect x={xScale(i) - 35} y={yScale(v) - 26} width={70} height={18} rx={4}
                        fill={COLORS.dark} />
                      <text x={xScale(i)} y={yScale(v) - 14} textAnchor="middle"
                        fontSize="9" fontWeight="600" fill="#fff" fontFamily={FONTS.mono}>
                        {v} req/s
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Legend */}
      {DATA.map((s, i) => (
        <g key={`leg-${i}`}>
          <line x1={100 + i * 160} y1={H - 25} x2={120 + i * 160} y2={H - 25}
            stroke={s.color} strokeWidth="3" />
          <text x={125 + i * 160} y={H - 21} fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{s.name}</text>
        </g>
      ))}
    </svg>
  );
}
