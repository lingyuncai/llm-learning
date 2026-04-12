import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

const IMAGES_4 = ['🐕 dog', '🚗 car', '🌸 flower', '🏠 house'];
const TEXTS_4 = ['a dog', 'a car', 'a flower', 'a house'];
const IMAGES_8 = ['🐕 dog', '🚗 car', '🌸 flower', '🏠 house', '🐱 cat', '✈️ plane', '🌳 tree', '📖 book'];
const TEXTS_8 = ['a dog', 'a car', 'a flower', 'a house', 'a cat', 'a plane', 'a tree', 'a book'];

function simScore(i: number, j: number, n: number): number {
  if (i === j) return 0.85 + Math.random() * 0.1;
  const dist: number = Math.abs(i - j);
  return Math.max(0.05, 0.3 - dist * (0.05 + (i * 17 + j * 13) % 7 * 0.01));
}

export default function ContrastiveMatrix({ locale = 'zh' }: Props) {
  const [batchSize, setBatchSize] = useState<4 | 8>(4);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  const t = {
    zh: {
      title: '对比学习矩阵',
      batchLabel: 'Batch 大小',
      images: '图像',
      texts: '文本',
      positive: '正样本 (对角线)',
      negative: '负样本',
      similarity: '相似度',
      formula: '目标：最大化对角线，最小化其余',
      hoverHint: '悬停查看详情',
    },
    en: {
      title: 'Contrastive Learning Matrix',
      batchLabel: 'Batch Size',
      images: 'Images',
      texts: 'Texts',
      positive: 'Positive (diagonal)',
      negative: 'Negative',
      similarity: 'Similarity',
      formula: 'Goal: maximize diagonal, minimize the rest',
      hoverHint: 'Hover to see details',
    },
  }[locale]!;

  const images: string[] = batchSize === 4 ? IMAGES_4 : IMAGES_8;
  const texts: string[] = batchSize === 4 ? TEXTS_4 : TEXTS_8;
  const n: number = batchSize;

  const scores = useMemo(() => {
    const s: number[][] = [];
    for (let i = 0; i < n; i++) {
      s[i] = [];
      for (let j = 0; j < n; j++) {
        s[i][j] = simScore(i, j, n);
      }
    }
    return s;
  }, [n]);

  let cellSize: number = batchSize === 4 ? 60 : 36;
  let fontSize: number = batchSize === 4 ? 10 : 7;
  let labelFontSize: number = batchSize === 4 ? 10 : 7;
  const matrixX: number = 260;
  const matrixY: number = 80;
  const matrixW: number = n * cellSize;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-semibold" style={{ color: COLORS.dark }}>{t.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t.batchLabel}:</span>
          {([4, 8] as const).map(s => (
            <button key={s} onClick={() => setBatchSize(s)}
              className={`px-2 py-0.5 text-xs rounded ${batchSize === s
                ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              N={s}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Column headers (texts) */}
        <text x={matrixX + matrixW / 2} y={45} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>{t.texts}</text>
        {texts.map((txt, j) => (
          <text key={`col-${j}`} x={matrixX + j * cellSize + cellSize / 2} y={matrixY - 8}
            textAnchor="middle" fontSize={labelFontSize} fill={COLORS.mid} fontFamily={FONTS.sans}>
            {txt}
          </text>
        ))}

        {/* Row headers (images) */}
        <text x={matrixX - 30} y={matrixY + matrixW / 2} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}
          transform={`rotate(-90, ${matrixX - 30}, ${matrixY + matrixW / 2})`}>
          {t.images}
        </text>
        {images.map((img, i) => (
          <text key={`row-${i}`} x={matrixX - 10} y={matrixY + i * cellSize + cellSize / 2 + 3}
            textAnchor="end" fontSize={labelFontSize} fill={COLORS.mid} fontFamily={FONTS.sans}>
            {img}
          </text>
        ))}

        {/* Matrix cells */}
        {scores.map((row, i) =>
          row.map((score, j) => {
            let isPositive: boolean = i === j;
            let isHovered: boolean = hoveredCell !== null && hoveredCell[0] === i && hoveredCell[1] === j;
            let cellFill: string = isPositive
              ? `rgba(46, 125, 50, ${0.2 + score * 0.6})`
              : `rgba(198, 40, 40, ${0.05 + score * 0.4})`;
            return (
              <g key={`${i}-${j}`}
                onMouseEnter={() => setHoveredCell([i, j])}
                onMouseLeave={() => setHoveredCell(null)}>
                <motion.rect
                  x={matrixX + j * cellSize} y={matrixY + i * cellSize}
                  width={cellSize} height={cellSize}
                  fill={cellFill}
                  stroke={isHovered ? COLORS.dark : isPositive ? COLORS.green : COLORS.light}
                  strokeWidth={isHovered ? 2 : 1}
                  rx={2}
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  style={{ transformOrigin: `${matrixX + j * cellSize + cellSize / 2}px ${matrixY + i * cellSize + cellSize / 2}px` }}
                />
                <text x={matrixX + j * cellSize + cellSize / 2}
                  y={matrixY + i * cellSize + cellSize / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={fontSize} fontWeight={isPositive ? '700' : '400'}
                  fill={isPositive ? COLORS.green : COLORS.mid}
                  fontFamily={FONTS.mono}>
                  {score.toFixed(2)}
                </text>
              </g>
            );
          })
        )}

        {/* Hover info */}
        {hoveredCell && (
          <g>
            <rect x={matrixX + matrixW + 20} y={matrixY} width={200} height={80}
              rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={matrixX + matrixW + 30} y={matrixY + 20} fontSize="10" fill={COLORS.dark}
              fontFamily={FONTS.sans} fontWeight="600">
              {images[hoveredCell[0]]}
            </text>
            <text x={matrixX + matrixW + 30} y={matrixY + 38} fontSize="10" fill={COLORS.orange}
              fontFamily={FONTS.sans}>
              {texts[hoveredCell[1]]}
            </text>
            <text x={matrixX + matrixW + 30} y={matrixY + 58} fontSize="11" fontWeight="700"
              fill={hoveredCell[0] === hoveredCell[1] ? COLORS.green : COLORS.red}
              fontFamily={FONTS.mono}>
              {t.similarity}: {scores[hoveredCell[0]][hoveredCell[1]].toFixed(3)}
            </text>
          </g>
        )}

        {/* Legend */}
        <rect x={80} y={matrixY + matrixW + 20} width={14} height={14} rx={2}
          fill="rgba(46, 125, 50, 0.6)" />
        <text x={100} y={matrixY + matrixW + 32} fontSize="10" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{t.positive}</text>

        <rect x={280} y={matrixY + matrixW + 20} width={14} height={14} rx={2}
          fill="rgba(198, 40, 40, 0.15)" />
        <text x={300} y={matrixY + matrixW + 32} fontSize="10" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{t.negative}</text>

        <text x={400} y={matrixY + matrixW + 55} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.formula}</text>

        {!hoveredCell && (
          <text x={matrixX + matrixW + 80} y={matrixY + 40} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.hoverHint}</text>
        )}
      </svg>
    </div>
  );
}
