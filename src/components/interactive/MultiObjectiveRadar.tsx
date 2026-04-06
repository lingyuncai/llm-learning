import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Approach {
  name: string;
  scores: number[]; // [cost, latency, privacy, quality, offline] 0-100
  color: string;
}

const DIMS = ['低成本', '低延迟', '隐私保护', '回答质量', '离线可用'];

const APPROACHES: Approach[] = [
  { name: '纯本地', scores: [95, 60, 100, 50, 100], color: COLORS.green },
  { name: '纯云端', scores: [20, 70, 20, 95, 0], color: COLORS.red },
  { name: 'ConsRoute', scores: [75, 70, 70, 85, 60], color: COLORS.primary },
  { name: 'Apple Intelligence', scores: [80, 75, 95, 80, 70], color: COLORS.orange },
];

export default function MultiObjectiveRadar() {
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2]));

  const W = 580, H = 420;
  const cx = 240, cy = 200, R = 140;

  const toggle = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getPoint = (dimIdx: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * dimIdx) / DIMS.length - Math.PI / 2;
    const r = (value / 100) * R;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          多目标雷达图
        </text>

        {/* Grid circles */}
        {[20, 40, 60, 80, 100].map(v => (
          <circle key={v} cx={cx} cy={cy} r={(v / 100) * R}
                  fill="none" stroke={COLORS.light} strokeWidth="1" />
        ))}

        {/* Axis lines and labels */}
        {DIMS.map((dim, i) => {
          const [x, y] = getPoint(i, 100);
          const [lx, ly] = getPoint(i, 115);
          return (
            <g key={dim}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={COLORS.mid} strokeWidth="0.5" />
              <text x={lx} y={ly + 4} textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
                {dim}
              </text>
            </g>
          );
        })}

        {/* Approach polygons */}
        {APPROACHES.map((a, ai) => {
          if (!selected.has(ai)) return null;
          const points = DIMS.map((_, di) => getPoint(di, a.scores[di]).join(',')).join(' ');
          return (
            <g key={a.name}>
              <polygon points={points}
                       fill={a.color} fillOpacity="0.12"
                       stroke={a.color} strokeWidth="2" />
              {/* Dots */}
              {DIMS.map((_, di) => {
                const [x, y] = getPoint(di, a.scores[di]);
                return <circle key={di} cx={x} cy={y} r="4" fill={a.color} stroke="#fff" strokeWidth="1.5" />;
              })}
            </g>
          );
        })}

        {/* Toggle buttons */}
        <g transform="translate(420, 80)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            方案选择:
          </text>
          {APPROACHES.map((a, i) => (
            <g key={a.name} transform={`translate(0, ${10 + i * 32})`}
               onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="140" height="26" rx="4"
                    fill={selected.has(i) ? a.color : COLORS.bgAlt}
                    opacity={selected.has(i) ? 0.15 : 1}
                    stroke={a.color} strokeWidth={selected.has(i) ? 2 : 1} />
              <circle cx="14" cy="13" r="5" fill={selected.has(i) ? a.color : COLORS.light} />
              <text x="26" y="17" fontFamily={FONTS.sans} fontSize="10"
                    fill={COLORS.dark} style={{ pointerEvents: 'none' }}>
                {a.name}
              </text>
            </g>
          ))}

          {/* Score table for selected */}
          <g transform="translate(0, 150)">
            <text x="0" y="0" fontFamily={FONTS.sans} fontSize="10" fontWeight="600" fill={COLORS.mid}>
              评分 (0-100)
            </text>
            {Array.from(selected).map((ai, si) => (
              <text key={ai} x="0" y={16 + si * 14} fontFamily={FONTS.mono} fontSize="9" fill={APPROACHES[ai].color}>
                {APPROACHES[ai].name}: {APPROACHES[ai].scores.join(' / ')}
              </text>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
