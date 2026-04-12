import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

// Generate deterministic patch colors to simulate an image
function patchColor(row: number, col: number, gridSize: number): string {
  // Create a gradient-like pattern resembling a landscape image
  const r = Math.floor(80 + (row / gridSize) * 120 + (col / gridSize) * 40);
  const g = Math.floor(120 + Math.sin((row + col) / gridSize * Math.PI) * 80);
  const b = Math.floor(180 - (row / gridSize) * 100 + (col / gridSize) * 30);
  return `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
}

export default function PatchEmbeddingDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Patch Embedding 过程',
      patchSize: 'Patch 大小',
      showProjection: '显示线性投影',
      image: '输入图像 224×224',
      patches: 'Patch 序列',
      projection: '线性投影',
      embeddings: 'Token 嵌入',
      tokenCount: (n: number, p: number) =>
        `224×224 图像 ÷ ${p}×${p} patches = ${n} 个 token（+ 1 [CLS] = ${n + 1}）`,
      cls: '[CLS]',
      step1: '切分为 Patch',
      step2: '展平 + 线性投影',
    },
    en: {
      title: 'Patch Embedding Process',
      patchSize: 'Patch Size',
      showProjection: 'Show Linear Projection',
      image: 'Input Image 224×224',
      patches: 'Patch Sequence',
      projection: 'Linear Projection',
      embeddings: 'Token Embeddings',
      tokenCount: (n: number, p: number) =>
        `224×224 image ÷ ${p}×${p} patches = ${n} tokens (+ 1 [CLS] = ${n + 1})`,
      cls: '[CLS]',
      step1: 'Split into Patches',
      step2: 'Flatten + Linear Projection',
    },
  }[locale]!;

  const [patchSize, setPatchSize] = useState<16 | 32>(16);
  const [showProjection, setShowProjection] = useState(false);

  const gridSize = 224 / patchSize; // 14 or 7
  const numTokens = gridSize * gridSize; // 196 or 49

  // Image region dimensions
  const imgSize = 180;
  const imgX = 30;
  const imgY = 60;
  const cellSize = imgSize / gridSize;

  // Patch sequence area
  const seqX = 280;
  const seqY = 60;
  const patchDisplaySize = gridSize === 14 ? 10 : 18;
  const patchGap = gridSize === 14 ? 2 : 3;
  const cols = gridSize === 14 ? 14 : 7;

  // Embedding area
  const embX = 550;
  const embY = 60;
  const embW = 200;
  const embBarH = gridSize === 14 ? 2.2 : 5;

  return (
    <div className="my-6">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700">
          {t.patchSize}:
          <select
            value={patchSize}
            onChange={(e) => setPatchSize(Number(e.target.value) as 16 | 32)}
            className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={16}>16×16</option>
            <option value={32}>32×32</option>
          </select>
        </label>
        <label className="text-sm text-gray-700 flex items-center gap-2">
          <input
            type="checkbox"
            checked={showProjection}
            onChange={(e) => setShowProjection(e.target.checked)}
            className="rounded"
          />
          {t.showProjection}
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Section: Input Image */}
        <text x={imgX + imgSize / 2} y={40} textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark}>
          {t.image}
        </text>

        {/* Image grid */}
        {Array.from({ length: gridSize }, (_, row) =>
          Array.from({ length: gridSize }, (_, col) => (
            <motion.rect
              key={`img-${row}-${col}`}
              x={imgX + col * cellSize}
              y={imgY + row * cellSize}
              width={cellSize - 0.5}
              height={cellSize - 0.5}
              fill={patchColor(row, col, gridSize)}
              rx={0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (row * gridSize + col) * 0.003, duration: 0.3 }}
            />
          ))
        )}

        {/* Grid overlay lines */}
        {Array.from({ length: gridSize + 1 }, (_, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={imgX + i * cellSize} y1={imgY}
              x2={imgX + i * cellSize} y2={imgY + imgSize}
              stroke={COLORS.bg} strokeWidth={0.5} opacity={0.6}
            />
            <line
              x1={imgX} y1={imgY + i * cellSize}
              x2={imgX + imgSize} y2={imgY + i * cellSize}
              stroke={COLORS.bg} strokeWidth={0.5} opacity={0.6}
            />
          </g>
        ))}

        {/* Arrow from image to patches */}
        <defs>
          <marker id="ped-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} />
          </marker>
        </defs>
        <line
          x1={imgX + imgSize + 10} y1={imgY + imgSize / 2}
          x2={seqX - 15} y2={imgY + imgSize / 2}
          stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#ped-arrow)"
        />
        <text x={(imgX + imgSize + seqX) / 2} y={imgY + imgSize / 2 - 8}
          textAnchor="middle" fontSize="10" fill={COLORS.primary} fontWeight="500">
          {t.step1}
        </text>

        {/* Section: Patch Sequence */}
        <text x={seqX + (cols * (patchDisplaySize + patchGap)) / 2} y={40}
          textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark}>
          {t.patches}
        </text>

        {/* [CLS] token */}
        <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <rect x={seqX} y={seqY} width={patchDisplaySize * 2 + patchGap} height={patchDisplaySize}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} rx={2} />
          <text x={seqX + patchDisplaySize + patchGap / 2} y={seqY + patchDisplaySize / 2 + 3}
            textAnchor="middle" fontSize={gridSize === 14 ? 6 : 8} fontWeight="600" fill={COLORS.orange}>
            {t.cls}
          </text>
        </motion.g>

        {/* Patch tokens */}
        {Array.from({ length: gridSize }, (_, row) =>
          Array.from({ length: gridSize }, (_, col) => {
            const idx = row * gridSize + col;
            const actualRow = Math.floor((idx + 1) / cols);
            const actualCol = (idx + 1) % cols;
            const px = seqX + actualCol * (patchDisplaySize + patchGap);
            const py = seqY + actualRow * (patchDisplaySize + patchGap) + (actualRow === 0 ? 0 : patchGap);

            return (
              <motion.rect
                key={`patch-${idx}`}
                x={px}
                y={py}
                width={patchDisplaySize}
                height={patchDisplaySize}
                fill={patchColor(row, col, gridSize)}
                rx={1}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.005, duration: 0.2 }}
              />
            );
          })
        )}

        {/* Arrow from patches to embeddings */}
        {showProjection && (
          <>
            <motion.line
              x1={seqX + cols * (patchDisplaySize + patchGap) + 10}
              y1={imgY + imgSize / 2}
              x2={embX - 15}
              y2={imgY + imgSize / 2}
              stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#ped-arrow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.text
              x={(seqX + cols * (patchDisplaySize + patchGap) + embX) / 2}
              y={imgY + imgSize / 2 - 8}
              textAnchor="middle" fontSize="10" fill={COLORS.primary} fontWeight="500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {t.step2}
            </motion.text>

            {/* Linear Projection Box */}
            <motion.g
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {/* Section: Embeddings */}
              <text x={embX + embW / 2} y={40} textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark}>
                {t.embeddings}
              </text>

              {/* Projection box */}
              <rect x={embX} y={embY - 5} width={embW} height={30}
                fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} rx={4} />
              <text x={embX + embW / 2} y={embY + 12} textAnchor="middle"
                fontSize="11" fontWeight="600" fill={COLORS.primary}>
                E ∈ ℝ^(P²·C × D)
              </text>

              {/* Embedding vectors as horizontal bars */}
              {Array.from({ length: Math.min(numTokens + 1, 80) }, (_, i) => {
                const barY = embY + 40 + i * (embBarH + 1);
                const isCls = i === 0;
                return (
                  <motion.rect
                    key={`emb-${i}`}
                    x={embX + 10}
                    y={barY}
                    width={embW - 20}
                    height={embBarH}
                    fill={isCls ? COLORS.orange : COLORS.primary}
                    opacity={isCls ? 0.8 : 0.3 + (i / (numTokens + 1)) * 0.5}
                    rx={1}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4 + i * 0.008, duration: 0.2 }}
                    style={{ transformOrigin: `${embX + 10}px ${barY}px` }}
                  />
                );
              })}

              {/* Dimension label */}
              <text x={embX + embW + 5} y={embY + 55} fontSize="9" fill={COLORS.mid}>
                D
              </text>
              <text x={embX - 5} y={embY + 40 + (Math.min(numTokens + 1, 80)) * (embBarH + 1) / 2}
                fontSize="9" fill={COLORS.mid} textAnchor="end"
                transform={`rotate(-90, ${embX - 5}, ${embY + 40 + (Math.min(numTokens + 1, 80)) * (embBarH + 1) / 2})`}>
                {numTokens + 1}
              </text>
            </motion.g>
          </>
        )}

        {/* Token count formula at bottom */}
        <text x={W / 2} y={H - 40} textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark}>
          {t.tokenCount(numTokens, patchSize)}
        </text>

        {/* Formula */}
        <text x={W / 2} y={H - 15} textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          N = H×W / P² = 224×224 / {patchSize}×{patchSize} = {numTokens}
        </text>
      </svg>
    </div>
  );
}
