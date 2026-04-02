// src/components/interactive/QKVSemanticSpaces.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';

const TOKENS = ['猫', '坐', '在', '垫子', '上'];
const TOKEN_COLORS = ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a', '#c62828'];

function genPositions(seed: number): [number, number][] {
  let s = seed;
  const next = () => {
    s = (s * 16807 + 11) % 2147483647;
    return (s % 160) + 20;
  };
  return TOKENS.map(() => [next(), next()]);
}

function SpacePanel({ title, subtitle, positions, hoveredIdx, onHover }: {
  title: string;
  subtitle: string;
  positions: [number, number][];
  hoveredIdx: number | null;
  onHover: (idx: number | null) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      <div className="text-xs text-gray-400 mb-1">{subtitle}</div>
      <svg viewBox="0 0 200 200" className="w-full max-w-[200px] border border-gray-200 rounded bg-white">
        {[50, 100, 150].map(v => (
          <g key={v}>
            <line x1={v} y1={0} x2={v} y2={200} stroke="#f0f0f0" strokeWidth={0.5} />
            <line x1={0} y1={v} x2={200} y2={v} stroke="#f0f0f0" strokeWidth={0.5} />
          </g>
        ))}
        {positions.map(([x, y], i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g key={i}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={isHovered ? 8 : 6}
                fill={TOKEN_COLORS[i]}
                opacity={hoveredIdx !== null && !isHovered ? 0.3 : 1}
                stroke={isHovered ? COLORS.highlight : 'none'}
                strokeWidth={3} />
              <text x={x + 10} y={y + 4} fontSize="10"
                fill={TOKEN_COLORS[i]} fontFamily="system-ui" fontWeight={isHovered ? '700' : '500'}
                opacity={hoveredIdx !== null && !isHovered ? 0.3 : 1}>
                {TOKENS[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function QKVSemanticSpaces() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const qPos = useMemo(() => genPositions(42), []);
  const kPos = useMemo(() => genPositions(137), []);
  const vPos = useMemo(() => genPositions(256), []);

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SpacePanel title="Q 空间" subtitle='"我在找什么"'
          positions={qPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
        <SpacePanel title="K 空间" subtitle='"我能提供什么"'
          positions={kPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
        <SpacePanel title="V 空间" subtitle='"我的实际内容"'
          positions={vPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
      </div>
      {hoveredIdx !== null && (
        <p className="text-center text-xs text-gray-500 mt-2">
          同一个词 "<strong>{TOKENS[hoveredIdx]}</strong>" 在三个空间中有不同的位置 —
          W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> 将同一输入映射到不同的语义空间
        </p>
      )}
      <div className="flex justify-center gap-3 mt-3 flex-wrap">
        {TOKENS.map((t, i) => (
          <span key={i} className="flex items-center gap-1 text-xs">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: TOKEN_COLORS[i] }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
