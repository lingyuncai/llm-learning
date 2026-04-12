import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;
const GRID = 8; // 8×8 simplified patch grid

export default function CNNvsViTComparison({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'CNN vs ViT：感受野对比',
      layer: '层',
      cnnTitle: 'CNN：局部 → 全局',
      vitTitle: 'ViT：全局自注意力',
      cnnDesc: '感受野逐层增大：3×3 → 5×5 → 7×7 → ...',
      vitDesc: '每一层都能关注所有 patch',
      localFirst: '局部优先，逐步扩大',
      globalAlways: '从第一层就是全局',
      centerPatch: '中心 Patch',
      receptiveField: '感受野 / 注意力范围',
    },
    en: {
      title: 'CNN vs ViT: Receptive Field Comparison',
      layer: 'Layer',
      cnnTitle: 'CNN: Local → Global',
      vitTitle: 'ViT: Full Self-Attention',
      cnnDesc: 'Receptive field grows: 3×3 → 5×5 → 7×7 → ...',
      vitDesc: 'Every patch attends to all others',
      localFirst: 'Local first, gradually expand',
      globalAlways: 'Global from layer 1',
      centerPatch: 'Center Patch',
      receptiveField: 'Receptive Field / Attention Range',
    },
  }[locale]!;

  const [currentLayer, setCurrentLayer] = useState(1);

  const cellSize = 30;
  const gridW = GRID * cellSize;

  // CNN side
  const cnnStartX = 40;
  const gridY = 90;

  // ViT side
  const vitStartX = W / 2 + 40;

  const centerR = Math.floor(GRID / 2);
  const centerC = Math.floor(GRID / 2);

  // CNN receptive field radius grows with layers (3×3 conv → +1 per layer)
  const cnnRadius = currentLayer; // layer 1 → 1 cell, layer 2 → 2, etc.

  // ViT attention: all patches, but intensity varies slightly
  // (In practice, attention is learned, here we simulate softmax-like distribution)

  function isCnnActive(row: number, col: number): boolean {
    const dr = Math.abs(row - centerR);
    const dc = Math.abs(col - centerC);
    return dr <= cnnRadius && dc <= cnnRadius;
  }

  function vitAttention(row: number, col: number): number {
    // All patches get attention, but closer ones get slightly more
    // This is a simplification — real ViT attention is learned
    const dist = Math.sqrt((row - centerR) ** 2 + (col - centerC) ** 2);
    const maxDist = Math.sqrt(2) * GRID;
    // Even at layer 1, all patches have some attention
    return 0.3 + 0.7 * Math.exp(-dist / (GRID * 0.5));
  }

  return (
    <div className="my-6">
      {/* Slider control */}
      <div className="flex items-center gap-3 mb-4 justify-center">
        <span className="text-sm font-medium text-gray-700">{t.layer}:</span>
        <input
          type="range"
          min={1} max={6}
          value={currentLayer}
          onChange={(e) => setCurrentLayer(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm font-semibold text-gray-800 w-8">{currentLayer}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Divider */}
        <line x1={W / 2} y1={30} x2={W / 2} y2={H - 20}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4 4" />

        {/* CNN Title */}
        <text x={cnnStartX + gridW / 2} y={35} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.primary}>
          {t.cnnTitle}
        </text>
        <text x={cnnStartX + gridW / 2} y={55} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.cnnDesc}
        </text>

        {/* CNN Grid */}
        {Array.from({ length: GRID }, (_, row) =>
          Array.from({ length: GRID }, (_, col) => {
            const isCenter = row === centerR && col === centerC;
            const active = isCnnActive(row, col);
            let fill: string = COLORS.masked;
            if (isCenter) {
              fill = COLORS.orange;
            } else if (active) {
              fill = COLORS.valid;
            }
            return (
              <motion.rect
                key={`cnn-${row}-${col}`}
                x={cnnStartX + col * cellSize}
                y={gridY + row * cellSize}
                width={cellSize - 2}
                height={cellSize - 2}
                rx={3}
                fill={fill}
                stroke={active ? COLORS.primary : COLORS.light}
                strokeWidth={active ? 1.5 : 0.5}
                initial={false}
                animate={{
                  opacity: active ? 1 : 0.4,
                  scale: active ? 1 : 0.95,
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })
        )}

        {/* CNN receptive field label */}
        <text x={cnnStartX + gridW / 2} y={gridY + gridW + 25}
          textAnchor="middle" fontSize="11" fill={COLORS.dark} fontWeight="500">
          {t.receptiveField}: {2 * cnnRadius + 1}×{2 * cnnRadius + 1}
        </text>
        <text x={cnnStartX + gridW / 2} y={gridY + gridW + 42}
          textAnchor="middle" fontSize="10" fill={COLORS.primary}>
          {t.localFirst}
        </text>

        {/* ViT Title */}
        <text x={vitStartX + gridW / 2} y={35} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.green}>
          {t.vitTitle}
        </text>
        <text x={vitStartX + gridW / 2} y={55} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.vitDesc}
        </text>

        {/* ViT Grid */}
        {Array.from({ length: GRID }, (_, row) =>
          Array.from({ length: GRID }, (_, col) => {
            const isCenter = row === centerR && col === centerC;
            const attention = vitAttention(row, col);
            let fill: string;
            if (isCenter) {
              fill = COLORS.orange;
            } else {
              // Blend between valid (blue) and bg based on attention
              const r = Math.round(219 + (1 - attention) * 36);
              const g = Math.round(234 + (1 - attention) * 21);
              const b = Math.round(254 - (1 - attention) * 14);
              fill = `rgb(${r},${g},${b})`;
            }
            return (
              <motion.rect
                key={`vit-${row}-${col}`}
                x={vitStartX + col * cellSize}
                y={gridY + row * cellSize}
                width={cellSize - 2}
                height={cellSize - 2}
                rx={3}
                fill={fill}
                stroke={COLORS.green}
                strokeWidth={isCenter ? 2 : 0.8}
                opacity={isCenter ? 1 : 0.5 + attention * 0.5}
              />
            );
          })
        )}

        {/* Attention lines from center to some patches (ViT side) */}
        {Array.from({ length: GRID }, (_, row) =>
          Array.from({ length: GRID }, (_, col) => {
            if (row === centerR && col === centerC) return null;
            // Show a subset of attention connections
            if ((row + col) % 2 !== 0) return null;
            const attention = vitAttention(row, col);
            return (
              <motion.line
                key={`attn-${row}-${col}`}
                x1={vitStartX + centerC * cellSize + cellSize / 2}
                y1={gridY + centerR * cellSize + cellSize / 2}
                x2={vitStartX + col * cellSize + cellSize / 2}
                y2={gridY + row * cellSize + cellSize / 2}
                stroke={COLORS.green}
                strokeWidth={0.5}
                opacity={attention * 0.3}
              />
            );
          })
        )}

        {/* ViT label */}
        <text x={vitStartX + gridW / 2} y={gridY + gridW + 25}
          textAnchor="middle" fontSize="11" fill={COLORS.dark} fontWeight="500">
          {t.receptiveField}: {GRID}×{GRID} ({locale === 'zh' ? '全部' : 'all'})
        </text>
        <text x={vitStartX + gridW / 2} y={gridY + gridW + 42}
          textAnchor="middle" fontSize="10" fill={COLORS.green}>
          {t.globalAlways}
        </text>

        {/* Legend */}
        <g transform={`translate(${W / 2 - 70}, ${H - 20})`}>
          <rect x={0} y={-8} width={12} height={12} fill={COLORS.orange} rx={2} />
          <text x={16} y={2} fontSize="9" fill={COLORS.mid}>{t.centerPatch}</text>
          <rect x={90} y={-8} width={12} height={12} fill={COLORS.valid} rx={2} />
          <text x={106} y={2} fontSize="9" fill={COLORS.mid}>{t.receptiveField}</text>
        </g>
      </svg>
    </div>
  );
}
