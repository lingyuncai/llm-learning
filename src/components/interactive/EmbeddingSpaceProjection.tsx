import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

interface Pair {
  label: string;
  icon: string;
  imgBefore: [number, number];
  txtBefore: [number, number];
  imgAfter: [number, number];
  txtAfter: [number, number];
}

const PAIRS: Pair[] = [
  { label: 'dog', icon: '🐕', imgBefore: [120, 100], txtBefore: [600, 320], imgAfter: [250, 150], txtAfter: [280, 160] },
  { label: 'car', icon: '🚗', imgBefore: [180, 150], txtBefore: [550, 280], imgAfter: [450, 120], txtAfter: [470, 130] },
  { label: 'flower', icon: '🌸', imgBefore: [100, 200], txtBefore: [620, 250], imgAfter: [350, 280], txtAfter: [370, 290] },
  { label: 'building', icon: '🏢', imgBefore: [200, 80], txtBefore: [500, 350], imgAfter: [550, 200], txtAfter: [570, 210] },
  { label: 'cat', icon: '🐱', imgBefore: [150, 250], txtBefore: [580, 200], imgAfter: [220, 220], txtAfter: [240, 230] },
  { label: 'plane', icon: '✈️', imgBefore: [80, 300], txtBefore: [650, 150], imgAfter: [480, 300], txtAfter: [500, 310] },
  { label: 'tree', icon: '🌳', imgBefore: [220, 180], txtBefore: [530, 130], imgAfter: [340, 180], txtAfter: [360, 190] },
  { label: 'book', icon: '📖', imgBefore: [160, 320], txtBefore: [560, 100], imgAfter: [600, 320], txtAfter: [620, 330] },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export default function EmbeddingSpaceProjection({ locale = 'zh' }: Props) {
  const [progress, setProgress] = useState(0);

  const t = {
    zh: {
      title: '嵌入空间对齐可视化',
      before: '训练前',
      after: '训练后',
      training: '训练进度',
      images: '图像 (circle)',
      texts: '文本 (square)',
      line: '匹配对连线',
      note: '对比训练将匹配的图文对拉近，不匹配的推远',
    },
    en: {
      title: 'Embedding Space Alignment',
      before: 'Before Training',
      after: 'After Training',
      training: 'Training Progress',
      images: 'Images (circle)',
      texts: 'Texts (square)',
      line: 'Matching pair link',
      note: 'Contrastive training pulls matching pairs together, pushes non-matching apart',
    },
  }[locale]!;

  let pct: number = progress / 100;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-semibold" style={{ color: COLORS.dark }}>{t.title}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{t.training}:</span>
          <input type="range" min={0} max={100} value={progress}
            onChange={e => setProgress(Number(e.target.value))}
            className="w-32 h-1.5 accent-blue-600" />
          <span className="text-xs font-mono text-gray-600 w-8">{progress}%</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Background region labels */}
        {progress < 30 && (
          <>
            <text x={160} y={40} textAnchor="middle" fontSize="12" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans} opacity={1 - pct * 3}>
              {t.images}
            </text>
            <text x={590} y={40} textAnchor="middle" fontSize="12" fontWeight="600"
              fill={COLORS.orange} fontFamily={FONTS.sans} opacity={1 - pct * 3}>
              {t.texts}
            </text>
          </>
        )}

        {/* Lines connecting matching pairs */}
        {PAIRS.map((pair, i) => {
          let ix: number = lerp(pair.imgBefore[0], pair.imgAfter[0], pct);
          let iy: number = lerp(pair.imgBefore[1], pair.imgAfter[1], pct);
          let tx: number = lerp(pair.txtBefore[0], pair.txtAfter[0], pct);
          let ty: number = lerp(pair.txtBefore[1], pair.txtAfter[1], pct);
          let dist: number = Math.sqrt((ix - tx) ** 2 + (iy - ty) ** 2);
          let maxDist: number = 500;
          let lineColor: string = dist < 50 ? COLORS.green : dist < 150 ? COLORS.orange : COLORS.red;
          return (
            <motion.line key={`line-${i}`}
              x1={ix} y1={iy} x2={tx} y2={ty}
              stroke={lineColor} strokeWidth={1} strokeDasharray="4 2"
              opacity={0.5}
            />
          );
        })}

        {/* Image dots (circles) */}
        {PAIRS.map((pair, i) => {
          let cx: number = lerp(pair.imgBefore[0], pair.imgAfter[0], pct);
          let cy: number = lerp(pair.imgBefore[1], pair.imgAfter[1], pct);
          return (
            <g key={`img-${i}`}>
              <motion.circle
                cx={cx} cy={cy} r={14}
                fill={COLORS.primary} opacity={0.85}
                initial={false}
                animate={{ cx, cy }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
              <motion.text
                x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fill="white"
                animate={{ x: cx, y: cy + 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              >
                {pair.icon}
              </motion.text>
            </g>
          );
        })}

        {/* Text dots (squares) */}
        {PAIRS.map((pair, i) => {
          let sx: number = lerp(pair.txtBefore[0], pair.txtAfter[0], pct);
          let sy: number = lerp(pair.txtBefore[1], pair.txtAfter[1], pct);
          return (
            <g key={`txt-${i}`}>
              <motion.rect
                x={sx - 12} y={sy - 12} width={24} height={24} rx={4}
                fill={COLORS.orange} opacity={0.85}
                animate={{ x: sx - 12, y: sy - 12 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
              <motion.text
                x={sx} y={sy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fill="white" fontFamily={FONTS.sans} fontWeight="600"
                animate={{ x: sx, y: sy + 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              >
                {pair.label}
              </motion.text>
            </g>
          );
        })}

        {/* Legend */}
        <circle cx={200} cy={410} r={6} fill={COLORS.primary} opacity={0.85} />
        <text x={212} y={414} fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.images}</text>
        <rect x={320} y={404} width={12} height={12} rx={2} fill={COLORS.orange} opacity={0.85} />
        <text x={338} y={414} fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.texts}</text>
        <line x1={440} y1={410} x2={460} y2={410} stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={468} y={414} fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.line}</text>

        {/* Bottom note */}
        <text x={400} y={440} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.mid} fontFamily={FONTS.sans}>{t.note}</text>
      </svg>
    </div>
  );
}
