import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

type Mode = 'spatial' | 'temporal' | 'full3d';

export default function SpatialVsTemporalAttention({ locale = 'zh' }: Props) {
  const [mode, setMode] = useState<Mode>('spatial');

  const t = {
    zh: {
      title: '时空注意力模式对比',
      spatial: '空间注意力',
      temporal: '时间注意力',
      full3d: '完整 3D 注意力',
      spatialDesc: '每帧内部：所有空间位置相互注意。复杂度 O(N_s²)，每帧独立计算。',
      temporalDesc: '跨帧同位置：相同空间位置在不同帧之间注意。复杂度 O(T²)，保持时间一致性。',
      full3dDesc: '所有位置对所有位置：空间+时间全连接注意力。复杂度 O((N_s·T)²) — 计算量爆炸！',
      frameLabel: '帧',
      complexityLabel: '复杂度',
      prohibitive: '(实际不可行)',
    },
    en: {
      title: 'Spatial vs Temporal Attention Patterns',
      spatial: 'Spatial Attention',
      temporal: 'Temporal Attention',
      full3d: 'Full 3D Attention',
      spatialDesc: 'Within each frame: all spatial positions attend to each other. Complexity O(N_s²), computed per frame.',
      temporalDesc: 'Same position across frames: identical spatial positions attend across time. Complexity O(T²), ensures temporal coherence.',
      full3dDesc: 'All positions to all positions: full spatiotemporal attention. Complexity O((N_s·T)²) — prohibitively expensive!',
      frameLabel: 'Frame',
      complexityLabel: 'Complexity',
      prohibitive: '(infeasible)',
    },
  }[locale]!;

  const gridSize = 3;
  const cellSize = 30;
  const cellGap = 4;
  const frameGap = 50;
  const numFrames = 3;
  const gridStartX = 120;
  const gridStartY = 80;

  const getFrameX = (fi: number) => gridStartX + fi * (gridSize * (cellSize + cellGap) + frameGap);
  const getCellCenter = (fi: number, r: number, c: number) => ({
    x: getFrameX(fi) + c * (cellSize + cellGap) + cellSize / 2,
    y: gridStartY + r * (cellSize + cellGap) + cellSize / 2,
  });

  // Build attention connections based on mode
  const connections: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];

  if (mode === 'spatial') {
    // Within frame 1 (middle), all attend to all
    const fi = 1;
    for (let r1 = 0; r1 < gridSize; r1++) {
      for (let c1 = 0; c1 < gridSize; c1++) {
        for (let r2 = r1; r2 < gridSize; r2++) {
          for (let c2 = (r2 === r1 ? c1 + 1 : 0); c2 < gridSize; c2++) {
            const p1 = getCellCenter(fi, r1, c1);
            const p2 = getCellCenter(fi, r2, c2);
            connections.push({ ...p1, x2: p2.x, y2: p2.y, color: COLORS.primary });
          }
        }
      }
    }
  } else if (mode === 'temporal') {
    // Same position across frames — highlight position (1,1) center
    const r = 1, c = 1;
    for (let fi = 0; fi < numFrames - 1; fi++) {
      const p1 = getCellCenter(fi, r, c);
      const p2 = getCellCenter(fi + 1, r, c);
      connections.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color: COLORS.green });
    }
    // Also show for position (0,0) and (2,2)
    for (const [pr, pc] of [[0, 0], [2, 2]] as const) {
      for (let fi = 0; fi < numFrames - 1; fi++) {
        const p1 = getCellCenter(fi, pr, pc);
        const p2 = getCellCenter(fi + 1, pr, pc);
        connections.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color: COLORS.orange });
      }
    }
  } else {
    // Full 3D — show a subset of cross-frame, cross-position connections
    for (let fi = 0; fi < numFrames; fi++) {
      for (let fj = fi; fj < numFrames; fj++) {
        const pairs = fi === fj
          ? [[0, 0, 1, 1], [1, 1, 2, 2], [0, 2, 2, 0]]
          : [[1, 1, 1, 1], [0, 0, 2, 2], [2, 0, 0, 2], [0, 1, 2, 1]];
        for (const [r1, c1, r2, c2] of pairs) {
          if (fi === fj && r1 === r2 && c1 === c2) continue;
          const p1 = getCellCenter(fi, r1, c1);
          const p2 = getCellCenter(fj, r2, c2);
          connections.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color: COLORS.red });
        }
      }
    }
  }

  const descriptions: Record<Mode, string> = {
    spatial: t.spatialDesc,
    temporal: t.temporalDesc,
    full3d: t.full3dDesc,
  };

  const complexities: Record<Mode, string> = {
    spatial: 'O(N_s²) per frame',
    temporal: 'O(T²) per position',
    full3d: `O((N_s·T)²) ${t.prohibitive}`,
  };

  const complexityColors: Record<Mode, string> = {
    spatial: COLORS.primary,
    temporal: COLORS.green,
    full3d: COLORS.red,
  };

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }}>
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Mode buttons */}
        {([
          { key: 'spatial' as Mode, label: t.spatial, color: COLORS.primary },
          { key: 'temporal' as Mode, label: t.temporal, color: COLORS.green },
          { key: 'full3d' as Mode, label: t.full3d, color: COLORS.red },
        ]).map((btn, i) => (
          <g key={btn.key} onClick={() => setMode(btn.key)} style={{ cursor: 'pointer' }}>
            <rect x={180 + i * 160} y={42} width={140} height={28} rx={14}
              fill={mode === btn.key ? btn.color : COLORS.bg}
              stroke={btn.color} strokeWidth={1.5} />
            <text x={250 + i * 160} y={60} textAnchor="middle"
              fontSize="11" fontWeight="600"
              fill={mode === btn.key ? COLORS.bg : btn.color}>
              {btn.label}
            </text>
          </g>
        ))}

        {/* Frame grids */}
        {Array.from({ length: numFrames }, (_, fi) => (
          <g key={fi}>
            {/* Frame label */}
            <text x={getFrameX(fi) + (gridSize * (cellSize + cellGap) - cellGap) / 2}
              y={gridStartY - 12} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.mid}>
              {t.frameLabel} {fi}  (t={fi})
            </text>

            {/* Grid cells */}
            {Array.from({ length: gridSize }, (_, r) =>
              Array.from({ length: gridSize }, (_, c) => {
                let isHighlighted: boolean = false;
                let highlightColor: string = COLORS.light;

                if (mode === 'spatial' && fi === 1) {
                  isHighlighted = true;
                  highlightColor = COLORS.valid;
                } else if (mode === 'temporal') {
                  if ((r === 1 && c === 1) || (r === 0 && c === 0) || (r === 2 && c === 2)) {
                    isHighlighted = true;
                    highlightColor = r === 1 && c === 1 ? '#dcfce7' : COLORS.highlight;
                  }
                } else if (mode === 'full3d') {
                  isHighlighted = true;
                  highlightColor = COLORS.waste;
                }

                return (
                  <motion.rect
                    key={`${fi}-${r}-${c}`}
                    x={getFrameX(fi) + c * (cellSize + cellGap)}
                    y={gridStartY + r * (cellSize + cellGap)}
                    width={cellSize} height={cellSize} rx={4}
                    fill={isHighlighted ? highlightColor : COLORS.bgAlt}
                    stroke={isHighlighted ? complexityColors[mode] : COLORS.light}
                    strokeWidth={isHighlighted ? 1.5 : 1}
                    animate={{ opacity: isHighlighted ? 1 : 0.4 }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })
            )}
          </g>
        ))}

        {/* Attention connections */}
        {connections.map((conn, i) => (
          <motion.line
            key={`${mode}-${i}`}
            x1={conn.x1} y1={conn.y1} x2={conn.x2} y2={conn.y2}
            stroke={conn.color} strokeWidth={1.5} strokeOpacity={0.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
          />
        ))}

        {/* Description box */}
        <motion.g
          key={mode}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <rect x={40} y={H - 120} width={W - 80} height={45} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={W / 2} y={H - 93} textAnchor="middle" fontSize="11" fill={COLORS.dark}>
            {descriptions[mode]}
          </text>

          {/* Complexity badge */}
          <rect x={W / 2 - 100} y={H - 65} width={200} height={28} rx={6}
            fill={complexityColors[mode]} fillOpacity={0.1}
            stroke={complexityColors[mode]} strokeWidth={1} />
          <text x={W / 2} y={H - 47} textAnchor="middle"
            fontSize="12" fontWeight="700" fill={complexityColors[mode]}>
            {t.complexityLabel}: {complexities[mode]}
          </text>
        </motion.g>
      </svg>
    </div>
  );
}
