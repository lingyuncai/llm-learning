import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;
const GRID = 4;
const CELL = 56;

export default function ValuePolicyViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [values, setValues] = useState<number[][]>([
    [3.0, 2.5, 2.0, 0],
    [2.5, 0, 1.5, 0],
    [2.0, 1.5, 1.0, -0.5],
    [1.5, 1.0, 0.5, 0.0],
  ]);

  const t = {
    zh: {
      title: 'Value Function ↔ Policy 对照',
      subtitle: '点击格子 +/- 调整 V 值，观察策略箭头如何跟随变化',
      valueFunctionLabel: 'Value Function V(s)',
      policyLabel: 'Policy π(s)',
      legend: '深色 = 高价值 | 浅色 = 低价值 | 策略箭头指向最高价值邻居 | 修改 V 值观察策略变化',
    },
    en: {
      title: 'Value Function ↔ Policy Correspondence',
      subtitle: 'Click +/- on cells to adjust V values, observe how policy arrows follow',
      valueFunctionLabel: 'Value Function V(s)',
      policyLabel: 'Policy π(s)',
      legend: 'Dark = high value | Light = low value | Policy arrows point to highest-value neighbor | Modify V to observe policy changes',
    },
  }[locale];

  // Derive policy from values: pick direction of neighbor with highest value
  const DIRS = [
    { dr: -1, dc: 0, arrow: '↑' },
    { dr: 0, dc: 1, arrow: '→' },
    { dr: 1, dc: 0, arrow: '↓' },
    { dr: 0, dc: -1, arrow: '←' },
  ];

  const getPolicy = (r: number, c: number): string => {
    if ((r === 0 && c === 3) || (r === 1 && c === 1)) return '·';
    let best = -Infinity;
    let arrow = '·';
    for (const d of DIRS) {
      const nr = r + d.dr, nc = c + d.dc;
      if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID && !(nr === 1 && nc === 1)) {
        if (values[nr][nc] > best) {
          best = values[nr][nc];
          arrow = d.arrow;
        }
      }
    }
    return arrow;
  };

  const maxV = Math.max(...values.flat());
  const minV = Math.min(...values.flat().filter(v => v !== 0 || true));

  const valToColor = (v: number): string => {
    const t = maxV === minV ? 0.5 : (v - minV) / (maxV - minV);
    const r = Math.round(255 - t * 100);
    const g = Math.round(255 - t * 40);
    const b = Math.round(255 - t * 100);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const adjustValue = (r: number, c: number, delta: number) => {
    if ((r === 0 && c === 3) || (r === 1 && c === 1)) return;
    setValues(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = Math.round((next[r][c] + delta) * 10) / 10;
      return next;
    });
  };

  const OX1 = 20, OX2 = 310, OY = 60;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Value heatmap */}
        <text x={OX1 + (GRID * CELL) / 2} y={OY - 6} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
          {t.valueFunctionLabel}
        </text>
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const x = OX1 + c * CELL;
            const y = OY + r * CELL;
            const isWall = r === 1 && c === 1;
            const isGoal = r === 0 && c === 3;
            return (
              <g key={`v-${r}-${c}`}>
                <rect x={x} y={y} width={CELL} height={CELL}
                  fill={isWall ? COLORS.mid : valToColor(values[r][c])}
                  stroke={COLORS.light} strokeWidth={1} />
                {!isWall && (
                  <>
                    <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle"
                      fontSize={12} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
                      {values[r][c].toFixed(1)}
                    </text>
                    {!isGoal && (
                      <>
                        <text x={x + 10} y={y + 14} fontSize={10} fill={COLORS.primary}
                          style={{ cursor: 'pointer' }} onClick={() => adjustValue(r, c, 0.5)}>+</text>
                        <text x={x + CELL - 14} y={y + 14} fontSize={10} fill={COLORS.red}
                          style={{ cursor: 'pointer' }} onClick={() => adjustValue(r, c, -0.5)}>−</text>
                      </>
                    )}
                  </>
                )}
              </g>
            );
          })
        )}

        {/* Policy arrows */}
        <text x={OX2 + (GRID * CELL) / 2} y={OY - 6} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
          {t.policyLabel}
        </text>
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const x = OX2 + c * CELL;
            const y = OY + r * CELL;
            const isWall = r === 1 && c === 1;
            return (
              <g key={`p-${r}-${c}`}>
                <rect x={x} y={y} width={CELL} height={CELL}
                  fill={isWall ? COLORS.mid : COLORS.bgAlt}
                  stroke={COLORS.light} strokeWidth={1} />
                {!isWall && (
                  <text x={x + CELL / 2} y={y + CELL / 2 + 6} textAnchor="middle"
                    fontSize={22} fontWeight={700} fill={COLORS.primary}>
                    {getPolicy(r, c)}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Legend */}
        <text x={30} y={H - 12} fontSize={9} fill={COLORS.mid}>
          {t.legend}
        </text>
      </svg>
    </div>
  );
}
