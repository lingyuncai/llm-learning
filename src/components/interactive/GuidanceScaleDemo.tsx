import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;

// Seeded RNG
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate abstract shapes that vary with guidance scale
interface ShapeConfig {
  baseHue: number;
  baseShape: 'circle' | 'rect' | 'polygon';
  cx: number;
  cy: number;
  seed: number;
}

const SHAPES: ShapeConfig[] = [
  { baseHue: 200, baseShape: 'circle', cx: 130, cy: 200, seed: 10 },
  { baseHue: 120, baseShape: 'rect', cx: 310, cy: 200, seed: 20 },
  { baseHue: 30, baseShape: 'polygon', cx: 490, cy: 200, seed: 30 },
  { baseHue: 280, baseShape: 'circle', cx: 670, cy: 200, seed: 40 },
];

function shapeColor(baseHue: number, scale: number, index: number): string {
  // Low guidance: varied hues (diverse). High guidance: converge to base hue
  const rng = seededRandom(index * 100 + Math.floor(scale));
  const hueVariation = Math.max(0, 40 - scale * 3);
  const hue = baseHue + (rng() - 0.5) * hueVariation;
  const saturation = Math.min(90, 50 + scale * 3);
  const lightness = 55 - Math.abs(scale - 7.5) * 0.5;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function GuidanceScaleDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Classifier-Free Guidance 效果',
      scale: '引导强度 s',
      formula: 'ε̃ = ε(xₜ, ∅) + s · (ε(xₜ, c) − ε(xₜ, ∅))',
      diversity: '多样性',
      fidelity: '保真度',
      lowGuide: 's ≈ 1: 多样但模糊',
      midGuide: 's ≈ 7: 质量与多样性平衡',
      highGuide: 's > 10: 清晰但重复',
      prompt: '提示词: "彩色几何图形"',
      sample: '样本',
    },
    en: {
      title: 'Classifier-Free Guidance Effect',
      scale: 'Guidance Scale s',
      formula: 'ε̃ = ε(xₜ, ∅) + s · (ε(xₜ, c) − ε(xₜ, ∅))',
      diversity: 'Diversity',
      fidelity: 'Fidelity',
      lowGuide: 's ≈ 1: diverse but blurry',
      midGuide: 's ≈ 7: balanced quality',
      highGuide: 's > 10: sharp but repetitive',
      prompt: 'Prompt: "colorful geometric shapes"',
      sample: 'Sample',
    },
  }[locale]!;

  const [guidanceScale, setGuidanceScale] = useState(7.5);

  // Compute shape properties based on guidance scale
  const shapeProps = useMemo(() => {
    return SHAPES.map((shape, i) => {
      const rng = seededRandom(shape.seed + Math.floor(guidanceScale * 10));
      // Size: low guidance = varied sizes, high = uniform
      const sizeVariation = Math.max(5, 30 - guidanceScale * 2);
      const baseSize = 45;
      const size = baseSize + (rng() - 0.5) * sizeVariation;

      // Blur: low guidance = more blur, high guidance = sharp
      const blur = Math.max(0, (5 - guidanceScale) * 0.8);

      // Position jitter: low guidance = more jitter
      const jitter = Math.max(0, (8 - guidanceScale) * 3);
      const dx = (rng() - 0.5) * jitter;
      const dy = (rng() - 0.5) * jitter;

      // Shape deformation: high guidance = shapes become more similar
      const similarity = Math.min(1, guidanceScale / 15);

      return { size, blur, dx, dy, similarity, color: shapeColor(shape.baseHue, guidanceScale, i) };
    });
  }, [guidanceScale]);

  // Spectrum bar position
  const specX = 120;
  const specY = 330;
  const specW = 560;
  const specH = 14;

  // Current position on spectrum
  const specPos = ((guidanceScale - 1) / 14) * specW;

  return (
    <div className="my-6">
      {/* Slider control */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700">
          {t.scale}: <span className="font-mono font-bold text-blue-700">{guidanceScale.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={1}
          max={15}
          step={0.5}
          value={guidanceScale}
          onChange={(e) => setGuidanceScale(Number(e.target.value))}
          className="flex-1 max-w-xs"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <defs>
          {shapeProps.map((sp, i) => (
            <filter key={`blur-${i}`} id={`gsd-blur-${i}`}>
              <feGaussianBlur stdDeviation={sp.blur} />
            </filter>
          ))}
        </defs>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Prompt label */}
        <text x={W / 2} y={52} textAnchor="middle" fontSize="11" fill={COLORS.mid} fontStyle="italic">
          {t.prompt}
        </text>

        {/* 4 abstract shapes */}
        {SHAPES.map((shape, i) => {
          const sp = shapeProps[i];
          const cx = shape.cx + sp.dx;
          const cy = shape.cy + sp.dy;

          return (
            <g key={`shape-${i}`}>
              {/* Sample label */}
              <text x={cx} y={cy - sp.size - 15} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
                {t.sample} {i + 1}
              </text>

              {/* Background card */}
              <rect x={cx - 55} y={cy - sp.size - 8} width={110} height={sp.size * 2 + 16}
                fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={8} />

              {/* Shape */}
              <motion.g
                filter={sp.blur > 0.1 ? `url(#gsd-blur-${i})` : undefined}
                animate={{ x: sp.dx, y: sp.dy }}
                transition={{ duration: 0.3 }}
              >
                {shape.baseShape === 'circle' && (
                  <motion.circle
                    cx={shape.cx} cy={shape.cy} r={sp.size}
                    fill={sp.color}
                    animate={{ r: sp.size, fill: sp.color }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                {shape.baseShape === 'rect' && (
                  <motion.rect
                    x={shape.cx - sp.size} y={shape.cy - sp.size * 0.8}
                    width={sp.size * 2} height={sp.size * 1.6}
                    fill={sp.color} rx={sp.similarity * 10}
                    animate={{ fill: sp.color }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                {shape.baseShape === 'polygon' && (
                  <motion.polygon
                    points={`${shape.cx},${shape.cy - sp.size} ${shape.cx + sp.size * 0.87},${shape.cy + sp.size * 0.5} ${shape.cx - sp.size * 0.87},${shape.cy + sp.size * 0.5}`}
                    fill={sp.color}
                    animate={{ fill: sp.color }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.g>
            </g>
          );
        })}

        {/* Quality indicator text */}
        <text x={W / 2} y={280} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={guidanceScale < 3 ? COLORS.orange : guidanceScale > 10 ? COLORS.red : COLORS.green}>
          {guidanceScale < 3 ? t.lowGuide : guidanceScale > 10 ? t.highGuide : t.midGuide}
        </text>

        {/* Diversity ← → Fidelity spectrum */}
        <defs>
          <linearGradient id="gsd-spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.purple} />
            <stop offset="50%" stopColor={COLORS.green} />
            <stop offset="100%" stopColor={COLORS.red} />
          </linearGradient>
        </defs>

        <text x={specX - 5} y={specY + specH / 2 + 4} textAnchor="end" fontSize="11" fontWeight="600" fill={COLORS.purple}>
          {t.diversity}
        </text>
        <rect x={specX} y={specY} width={specW} height={specH}
          fill="url(#gsd-spectrum)" rx={7} opacity={0.7} />
        <text x={specX + specW + 5} y={specY + specH / 2 + 4} fontSize="11" fontWeight="600" fill={COLORS.red}>
          {t.fidelity}
        </text>

        {/* Indicator on spectrum */}
        <motion.g
          animate={{ x: specPos }}
          transition={{ duration: 0.2 }}
        >
          <polygon
            points={`${specX},${specY - 6} ${specX - 5},${specY - 14} ${specX + 5},${specY - 14}`}
            fill={COLORS.dark}
          />
          <text x={specX} y={specY - 18} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            s={guidanceScale.toFixed(1)}
          </text>
        </motion.g>

        {/* Formula */}
        <rect x={W / 2 - 210} y={H - 42} width={420} height={28}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} rx={6} />
        <text x={W / 2} y={H - 23} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.mono}>
          {t.formula}
        </text>
      </svg>
    </div>
  );
}
