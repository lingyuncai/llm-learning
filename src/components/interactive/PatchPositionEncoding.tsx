import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;
const GRID = 14; // 14×14 patches for ViT-B/16

// Generate deterministic cosine similarity values based on distance
// Position embeddings tend to show spatial structure: nearby patches are more similar
function cosineSimilarity(selRow: number, selCol: number, row: number, col: number): number {
  const dr = selRow - row;
  const dc = selCol - col;
  const dist = Math.sqrt(dr * dr + dc * dc);
  const maxDist = Math.sqrt(2) * (GRID - 1);
  // Base similarity from distance with some learned-like noise
  const baseSim = 1 - (dist / maxDist) * 1.2;
  // Add deterministic "learned" variation
  const noise = Math.sin(row * 3.7 + col * 5.3) * 0.08 + Math.cos(row * 2.1 - col * 4.9) * 0.05;
  return Math.max(-0.3, Math.min(1, baseSim + noise));
}

function simToColor(sim: number): string {
  // Map [-0.3, 1] to color: blue (cold) → white → red (hot)
  const t = (sim + 0.3) / 1.3; // normalize to [0, 1]
  if (t < 0.5) {
    const s = t * 2; // 0→1
    const r = Math.round(59 + s * 196);
    const g = Math.round(130 + s * 125);
    const b = Math.round(246 - s * 46);
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (t - 0.5) * 2; // 0→1
    const r = Math.round(255 - s * 57);
    const g = Math.round(255 - s * 135);
    const b = Math.round(200 - s * 160);
    return `rgb(${r},${g},${b})`;
  }
}

export default function PatchPositionEncoding({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '位置编码的空间相似性',
      patchGrid: 'Patch 网格（点击选择）',
      heatmap: '余弦相似度热力图',
      selected: '已选 Patch',
      high: '高相似度',
      low: '低相似度',
      instruction: '点击左侧网格中的任意 patch 查看其位置编码与所有其他 patch 的余弦相似度',
      insight: '相邻 patch 的位置编码更相似 — 说明学到的位置编码保留了 2D 空间结构',
    },
    en: {
      title: 'Spatial Similarity of Position Embeddings',
      patchGrid: 'Patch Grid (click to select)',
      heatmap: 'Cosine Similarity Heatmap',
      selected: 'Selected Patch',
      high: 'High similarity',
      low: 'Low similarity',
      instruction: 'Click any patch in the left grid to see cosine similarity of its position embedding with all others',
      insight: 'Nearby patches have more similar position embeddings — learned embeddings preserve 2D spatial structure',
    },
  }[locale]!;

  const [selectedPatch, setSelectedPatch] = useState<[number, number]>([7, 7]);

  const similarities = useMemo(() => {
    const [selR, selC] = selectedPatch;
    return Array.from({ length: GRID }, (_, r) =>
      Array.from({ length: GRID }, (_, c) => cosineSimilarity(selR, selC, r, c))
    );
  }, [selectedPatch]);

  // Layout
  const gridStartX = 40;
  const gridStartY = 60;
  const cellSize = 20;
  const gridW = GRID * cellSize;

  const heatmapStartX = W / 2 + 40;
  const heatmapStartY = 60;
  const heatCellSize = 20;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Left: Patch Grid */}
        <text x={gridStartX + gridW / 2} y={35} textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark}>
          {t.patchGrid}
        </text>

        {Array.from({ length: GRID }, (_, row) =>
          Array.from({ length: GRID }, (_, col) => {
            const isSelected = selectedPatch[0] === row && selectedPatch[1] === col;
            return (
              <g key={`grid-${row}-${col}`}>
                <rect
                  x={gridStartX + col * cellSize}
                  y={gridStartY + row * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={isSelected ? COLORS.orange : COLORS.light}
                  stroke={isSelected ? COLORS.orange : COLORS.mid}
                  strokeWidth={isSelected ? 2 : 0.3}
                  rx={1}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPatch([row, col])}
                />
                {isSelected && (
                  <text
                    x={gridStartX + col * cellSize + cellSize / 2}
                    y={gridStartY + row * cellSize + cellSize / 2 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="8" fontWeight="bold" fill={COLORS.bg}
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Selected patch label */}
        <text x={gridStartX + gridW / 2} y={gridStartY + gridW + 20}
          textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          {t.selected}: ({selectedPatch[0]}, {selectedPatch[1]})
        </text>

        {/* Right: Heatmap */}
        <text x={heatmapStartX + gridW / 2} y={35} textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark}>
          {t.heatmap}
        </text>

        {Array.from({ length: GRID }, (_, row) =>
          Array.from({ length: GRID }, (_, col) => {
            const sim = similarities[row][col];
            const isSelected = selectedPatch[0] === row && selectedPatch[1] === col;
            return (
              <motion.rect
                key={`heat-${row}-${col}`}
                x={heatmapStartX + col * heatCellSize}
                y={heatmapStartY + row * heatCellSize}
                width={heatCellSize - 1}
                height={heatCellSize - 1}
                fill={simToColor(sim)}
                stroke={isSelected ? COLORS.dark : 'none'}
                strokeWidth={isSelected ? 2 : 0}
                rx={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: (row * GRID + col) * 0.002 }}
              />
            );
          })
        )}

        {/* Color scale legend */}
        {(() => {
          const legendX = heatmapStartX + gridW + 20;
          const legendY = heatmapStartY + 20;
          const legendH = 200;
          const legendW = 15;
          const steps = 20;
          return (
            <g>
              {Array.from({ length: steps }, (_, i) => {
                const simVal = 1 - (i / (steps - 1)) * 1.3;
                return (
                  <rect
                    key={`legend-${i}`}
                    x={legendX}
                    y={legendY + (i / steps) * legendH}
                    width={legendW}
                    height={legendH / steps + 1}
                    fill={simToColor(simVal)}
                  />
                );
              })}
              <text x={legendX + legendW + 5} y={legendY + 8} fontSize="9" fill={COLORS.mid}>1.0</text>
              <text x={legendX + legendW + 5} y={legendY + legendH / 2} fontSize="9" fill={COLORS.mid}>0.5</text>
              <text x={legendX + legendW + 5} y={legendY + legendH - 2} fontSize="9" fill={COLORS.mid}>0.0</text>
              <text x={legendX + legendW / 2} y={legendY - 8} textAnchor="middle" fontSize="9" fill={COLORS.mid}>cos θ</text>
            </g>
          );
        })()}

        {/* Instruction text */}
        <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          {t.instruction}
        </text>

        {/* Insight */}
        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="11" fontWeight="500" fill={COLORS.primary}>
          {t.insight}
        </text>
      </svg>
    </div>
  );
}
