import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

interface ImageOption {
  icon: string;
  label: string;
  scores: number[];
}

const LABELS = ['cat', 'car', 'flower', 'building'];

const PRESET_IMAGES: ImageOption[] = [
  { icon: '🐱', label: 'cat', scores: [0.92, 0.02, 0.03, 0.03] },
  { icon: '🚗', label: 'car', scores: [0.01, 0.91, 0.03, 0.05] },
  { icon: '🌸', label: 'flower', scores: [0.04, 0.01, 0.89, 0.06] },
  { icon: '🏢', label: 'building', scores: [0.03, 0.05, 0.02, 0.90] },
];

export default function ZeroShotClassification({ locale = 'zh' }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);

  const t = {
    zh: {
      title: 'CLIP Zero-Shot 分类',
      selectImage: '选择图像',
      prompt: '"a photo of a {label}"',
      similarity: '相似度',
      prediction: '预测',
      noTraining: '无需训练 — CLIP 使用文本提示作为分类器权重',
      textPrompts: '文本提示',
    },
    en: {
      title: 'CLIP Zero-Shot Classification',
      selectImage: 'Select image',
      prompt: '"a photo of a {label}"',
      similarity: 'Similarity',
      prediction: 'Prediction',
      noTraining: 'No training needed — CLIP uses text prompts as classifier weights',
      textPrompts: 'Text prompts',
    },
  }[locale]!;

  const img: ImageOption = PRESET_IMAGES[selectedImage];
  const maxIdx: number = img.scores.indexOf(Math.max(...img.scores));

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-semibold" style={{ color: COLORS.dark }}>{t.title}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Image selection - left side */}
        <text x={120} y={40} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.selectImage}</text>
        {PRESET_IMAGES.map((p, i) => (
          <g key={i} onClick={() => setSelectedImage(i)} style={{ cursor: 'pointer' }}>
            <motion.rect
              x={40 + i * 42} y={55} width={38} height={38} rx={8}
              fill={i === selectedImage ? COLORS.valid : COLORS.bgAlt}
              stroke={i === selectedImage ? COLORS.primary : COLORS.light}
              strokeWidth={i === selectedImage ? 2 : 1}
              whileHover={{ scale: 1.1 }}
            />
            <text x={59 + i * 42} y={80} textAnchor="middle" fontSize="18">{p.icon}</text>
          </g>
        ))}

        {/* Selected image display */}
        <rect x={60} y={120} width={120} height={120} rx={12}
          fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={2} />
        <text x={120} y={185} textAnchor="middle" fontSize="48">{img.icon}</text>
        <text x={120} y={260} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>{img.label}</text>

        {/* Arrow from image to CLIP */}
        <line x1={180} y1={180} x2={240} y2={180} stroke="#94a3b8" strokeWidth={1.5}
          markerEnd="url(#zsc-arrow)" />
        <defs>
          <marker id="zsc-arrow" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* CLIP box */}
        <rect x={240} y={155} width={80} height={50} rx={8}
          fill="#e3f2fd" stroke={COLORS.primary} strokeWidth={2} />
        <text x={280} y={175} textAnchor="middle" fontSize="14" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>CLIP</text>
        <text x={280} y={192} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily={FONTS.sans}>cos(I, T)</text>

        {/* Arrow from CLIP to bars */}
        <line x1={320} y1={180} x2={380} y2={180} stroke="#94a3b8" strokeWidth={1.5}
          markerEnd="url(#zsc-arrow)" />

        {/* Text prompts and bars - right side */}
        <text x={590} y={40} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>{t.textPrompts}</text>
        {LABELS.map((label, j) => {
          let score: number = img.scores[j];
          let isMax: boolean = j === maxIdx;
          let barMaxW: number = 200;
          let barH: number = 30;
          let barY: number = 70 + j * 80;
          let barW: number = score * barMaxW;
          return (
            <g key={j}>
              <text x={400} y={barY + 5} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
                "a photo of a {label}"
              </text>
              <motion.rect
                x={400} y={barY + 12} width={barW} height={barH} rx={4}
                fill={isMax ? COLORS.green : COLORS.light}
                stroke={isMax ? COLORS.green : COLORS.mid}
                strokeWidth={1}
                initial={{ width: 0 }}
                animate={{ width: barW }}
                transition={{ duration: 0.5, delay: j * 0.1 }}
              />
              <motion.text
                x={400 + barW + 8} y={barY + 12 + barH / 2 + 1}
                fontSize="11" fontWeight={isMax ? '700' : '400'}
                fill={isMax ? COLORS.green : COLORS.mid}
                fontFamily={FONTS.mono}
                dominantBaseline="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + j * 0.1 }}
              >
                {(score * 100).toFixed(1)}%
              </motion.text>
              {isMax && (
                <motion.text
                  x={710} y={barY + 12 + barH / 2 + 1}
                  fontSize="10" fontWeight="700" fill={COLORS.green}
                  fontFamily={FONTS.sans} dominantBaseline="middle"
                  initial={{ opacity: 0, x: 700 }}
                  animate={{ opacity: 1, x: 710 }}
                  transition={{ delay: 0.6 }}
                >
                  ✓ {t.prediction}
                </motion.text>
              )}
            </g>
          );
        })}

        {/* Bottom note */}
        <rect x={150} y={400} width={500} height={30} rx={6}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={400} y={419} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          {t.noTraining}
        </text>
      </svg>
    </div>
  );
}
