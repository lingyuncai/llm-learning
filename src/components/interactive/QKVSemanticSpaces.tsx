// src/components/interactive/QKVSemanticSpaces.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';

const TOKEN_COLORS = ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a', '#c62828'];

function genPositions(seed: number, count: number): [number, number][] {
  let s = seed;
  const next = () => {
    s = (s * 16807 + 11) % 2147483647;
    return (s % 160) + 20;
  };
  return Array.from({ length: count }, () => [next(), next()]);
}

function SpacePanel({ title, subtitle, positions, hoveredIdx, onHover, tokens }: {
  title: string;
  subtitle: string;
  positions: [number, number][];
  hoveredIdx: number | null;
  onHover: (idx: number | null) => void;
  tokens: string[];
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
                {tokens[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function QKVSemanticSpaces({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      tokens: ['猫', '坐', '在', '垫子', '上'],
      qTitle: 'Q 空间',
      qSubtitle: '"我在找什么"',
      kTitle: 'K 空间',
      kSubtitle: '"我能提供什么"',
      vTitle: 'V 空间',
      vSubtitle: '"我的实际内容"',
      hoverText: '同一个词 "',
      hoverText2: '" 在三个空间中有不同的位置 — W',
      hoverText3: ', W',
      hoverText4: ', W',
      hoverText5: ' 将同一输入映射到不同的语义空间',
    },
    en: {
      tokens: ['cat', 'sits', 'on', 'mat', 'the'],
      qTitle: 'Q Space',
      qSubtitle: '"What am I looking for"',
      kTitle: 'K Space',
      kSubtitle: '"What can I provide"',
      vTitle: 'V Space',
      vSubtitle: '"My actual content"',
      hoverText: 'The same token "',
      hoverText2: '" has different positions in three spaces — W',
      hoverText3: ', W',
      hoverText4: ', W',
      hoverText5: ' map the same input to different semantic spaces',
    },
  }[locale];

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const qPos = useMemo(() => genPositions(42, t.tokens.length), [t.tokens.length]);
  const kPos = useMemo(() => genPositions(137, t.tokens.length), [t.tokens.length]);
  const vPos = useMemo(() => genPositions(256, t.tokens.length), [t.tokens.length]);

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SpacePanel title={t.qTitle} subtitle={t.qSubtitle}
          positions={qPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} tokens={t.tokens} />
        <SpacePanel title={t.kTitle} subtitle={t.kSubtitle}
          positions={kPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} tokens={t.tokens} />
        <SpacePanel title={t.vTitle} subtitle={t.vSubtitle}
          positions={vPos} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} tokens={t.tokens} />
      </div>
      {hoveredIdx !== null && (
        <p className="text-center text-xs text-gray-500 mt-2">
          {t.hoverText}<strong>{t.tokens[hoveredIdx]}</strong>{t.hoverText2}<sub>Q</sub>{t.hoverText3}<sub>K</sub>{t.hoverText4}<sub>V</sub>{t.hoverText5}
        </p>
      )}
      <div className="flex justify-center gap-3 mt-3 flex-wrap">
        {t.tokens.map((token, i) => (
          <span key={i} className="flex items-center gap-1 text-xs">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: TOKEN_COLORS[i] }} />
            {token}
          </span>
        ))}
      </div>
    </div>
  );
}
