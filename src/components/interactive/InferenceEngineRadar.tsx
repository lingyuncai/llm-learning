import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface EngineData {
  name: string;
  color: string;
  scores: number[]; // 0-1 for each axis
}

const AXES = ['吞吐量', '延迟', '易用性', '生态', '灵活性'];
const ENGINES: EngineData[] = [
  { name: 'vLLM',         color: COLORS.primary, scores: [0.95, 0.75, 0.70, 0.90, 0.60] },
  { name: 'SGLang',       color: COLORS.green,   scores: [0.90, 0.80, 0.60, 0.65, 0.95] },
  { name: 'Ollama',       color: COLORS.orange,  scores: [0.40, 0.85, 0.95, 0.80, 0.50] },
  { name: 'TensorRT-LLM', color: COLORS.purple,  scores: [0.98, 0.90, 0.30, 0.55, 0.35] },
];

const cx = W / 2;
const cy = 210;
const R = 130;

function polarToXY(angle: number, r: number): [number, number] {
  const a = angle - Math.PI / 2; // start from top
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export default function InferenceEngineRadar() {
  const [active, setActive] = useState<number | null>(null);

  const angleStep = (2 * Math.PI) / AXES.length;

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={cx} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        推理引擎特性对比
      </text>
      <text x={cx} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击引擎名称查看各维度评分
      </text>

      {/* Grid rings */}
      {rings.map((scale) => {
        const points = AXES.map((_, i) => polarToXY(i * angleStep, R * scale));
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
        return <path key={scale} d={d} fill="none" stroke={COLORS.light} strokeWidth="1" />;
      })}

      {/* Axis lines + labels */}
      {AXES.map((label, i) => {
        const angle = i * angleStep;
        const [ex, ey] = polarToXY(angle, R + 5);
        const [lx, ly] = polarToXY(angle, R + 22);
        return (
          <g key={label}>
            <line x1={cx} y1={cy} x2={ex} y2={ey}
              stroke={COLORS.light} strokeWidth="1" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10"
              fontWeight="500" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {label}
            </text>
          </g>
        );
      })}

      {/* Engine polygons */}
      {ENGINES.map((engine, ei) => {
        const isActive = active === ei;
        const show = active === null || isActive;
        const points = engine.scores.map((s, i) => polarToXY(i * angleStep, R * s));
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
        return (
          <path key={engine.name} d={d}
            fill={engine.color} fillOpacity={isActive ? 0.25 : 0.1}
            stroke={engine.color} strokeWidth={isActive ? 2.5 : 1.5}
            opacity={show ? 1 : 0.15} />
        );
      })}

      {/* Score dots when active */}
      {active !== null && ENGINES[active].scores.map((s, i) => {
        const [dx, dy] = polarToXY(i * angleStep, R * s);
        return (
          <g key={`dot-${i}`}>
            <circle cx={dx} cy={dy} r={4}
              fill={ENGINES[active].color} stroke="#fff" strokeWidth="1.5" />
            <text x={dx} y={dy - 8} textAnchor="middle" fontSize="9"
              fontWeight="600" fill={ENGINES[active].color} fontFamily={FONTS.mono}>
              {(s * 100).toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Legend / buttons */}
      {ENGINES.map((engine, i) => {
        const bx = 40 + i * 135;
        const by = H - 40;
        const isActive = active === i;
        return (
          <g key={`btn-${i}`} onClick={() => setActive(active === i ? null : i)} cursor="pointer">
            <rect x={bx} y={by} width={120} height={26} rx={13}
              fill={isActive ? engine.color : COLORS.bgAlt}
              stroke={engine.color} strokeWidth="1.5" />
            <text x={bx + 60} y={by + 17} textAnchor="middle" fontSize="11"
              fontWeight="600" fill={isActive ? '#fff' : engine.color} fontFamily={FONTS.sans}>
              {engine.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
