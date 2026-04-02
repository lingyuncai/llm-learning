// src/components/interactive/AcceptanceRateCalculator.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, HEAD_COLORS } from './shared/colors';

function expectedTokens(alpha: number, K: number): number {
  if (Math.abs(alpha - 1) < 1e-9) return K + 1;
  return (1 - Math.pow(alpha, K + 1)) / (1 - alpha);
}

const ALPHA_CURVES = [0.5, 0.7, 0.8, 0.9, 0.95];
const MAX_K = 10;

export default function AcceptanceRateCalculator() {
  const [alpha, setAlpha] = useState(0.8);
  const [K, setK] = useState(5);
  const expected = expectedTokens(alpha, K);
  const speedup = expected; // simplified: speedup ≈ expected tokens per round

  // Chart dimensions
  const svgW = 440;
  const svgH = 200;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const maxY = 12; // max expected tokens on y-axis
  const toX = (k: number) => padL + (k / MAX_K) * chartW;
  const toY = (val: number) => padT + chartH - (val / maxY) * chartH;

  const curves = useMemo(() => {
    return ALPHA_CURVES.map((a, ci) => {
      const points = Array.from({ length: MAX_K }, (_, i) => {
        const k = i + 1;
        return { x: toX(k), y: toY(expectedTokens(a, k)) };
      });
      const pathD = points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      return { alpha: a, pathD, color: HEAD_COLORS[ci], points };
    });
  }, []);

  // Current point
  const curX = toX(K);
  const curY = toY(expected);

  return (
    <div className="space-y-3">
      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            α (acceptance rate): <span className="font-mono font-bold" style={{ color: COLORS.primary }}>{alpha.toFixed(2)}</span>
          </label>
          <input type="range" min={0.5} max={0.99} step={0.01} value={alpha}
            onChange={e => setAlpha(parseFloat(e.target.value))} className="flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            K (draft length): <span className="font-mono font-bold" style={{ color: COLORS.orange }}>{K}</span>
          </label>
          <input type="range" min={1} max={10} step={1} value={K}
            onChange={e => setK(parseInt(e.target.value))} className="flex-1" />
        </div>
      </div>

      {/* Result */}
      <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
        <div className="text-xs text-gray-500">期望每轮生成 token 数</div>
        <div className="text-xl font-bold font-mono" style={{ color: COLORS.primary }}>
          {expected.toFixed(2)} tokens
        </div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">
          (1 − {alpha.toFixed(2)}^{K + 1}) / (1 − {alpha.toFixed(2)}) = {expected.toFixed(2)}
        </div>
      </div>

      {/* Chart */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {/* Grid */}
          {[2, 4, 6, 8, 10].map(v => (
            <g key={v}>
              <line x1={padL} y1={toY(v)} x2={svgW - padR} y2={toY(v)}
                stroke="#f3f4f6" strokeWidth={1} />
              <text x={padL - 4} y={toY(v) + 3} textAnchor="end" fontSize="8"
                fill={COLORS.mid} fontFamily="monospace">{v}</text>
            </g>
          ))}
          {/* X axis ticks */}
          {Array.from({ length: MAX_K }, (_, i) => i + 1).map(k => (
            <text key={k} x={toX(k)} y={svgH - 8} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily="monospace">{k}</text>
          ))}
          {/* Axis labels */}
          <text x={svgW / 2} y={svgH - 0} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily="system-ui">K (draft length)</text>
          <text x={8} y={svgH / 2} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily="system-ui"
            transform={`rotate(-90, 8, ${svgH / 2})`}>Expected Tokens</text>

          {/* Curves */}
          {curves.map(c => (
            <g key={c.alpha}>
              <path d={c.pathD} fill="none" stroke={c.color} strokeWidth={1.5}
                opacity={c.alpha === curves.reduce((prev, curr) =>
                  Math.abs(curr.alpha - alpha) < Math.abs(prev.alpha - alpha) ? curr : prev
                ).alpha ? 1 : 0.3} />
              <text x={c.points[c.points.length - 1].x + 4}
                y={c.points[c.points.length - 1].y + 3}
                fontSize="7" fill={c.color} fontFamily="monospace"
                opacity={c.alpha === curves.reduce((prev, curr) =>
                  Math.abs(curr.alpha - alpha) < Math.abs(prev.alpha - alpha) ? curr : prev
                ).alpha ? 1 : 0.5}>
                α={c.alpha}
              </text>
            </g>
          ))}

          {/* Current point */}
          <motion.circle
            cx={curX} cy={curY} r={5}
            fill={COLORS.primary} stroke="white" strokeWidth={2}
            animate={{ cx: curX, cy: curY }}
            transition={{ duration: 0.2 }}
          />
          {/* Crosshair */}
          <motion.line x1={curX} y1={padT} x2={curX} y2={padT + chartH}
            stroke={COLORS.primary} strokeWidth={0.5} strokeDasharray="3,3" opacity={0.4}
            animate={{ x1: curX, x2: curX }}
            transition={{ duration: 0.2 }}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {ALPHA_CURVES.map((a, i) => (
          <div key={a} className="flex items-center gap-1 text-[10px]">
            <div className="w-3 h-0.5" style={{ backgroundColor: HEAD_COLORS[i] }} />
            <span className="font-mono" style={{ color: HEAD_COLORS[i] }}>α={a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
