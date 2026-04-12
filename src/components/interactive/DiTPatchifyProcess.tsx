import React from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 380;

function FlowBox({ x, y, w, h, label, sublabel, fill, stroke, active }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string;
  fill: string; stroke: string; active?: boolean;
}) {
  return (
    <motion.g
      initial={{ opacity: 0.25 }}
      animate={{ opacity: active ? 1 : 0.25 }}
      transition={{ duration: 0.4 }}
    >
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={active ? 2 : 1} />
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 6 : h / 2 + 1)} textAnchor="middle"
        dominantBaseline="middle" fontSize="10" fontWeight="600" fill={stroke}
        fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle"
          dominantBaseline="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </motion.g>
  );
}

export default function DiTPatchifyProcess({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      steps: [
        { title: '噪声潜变量', desc: '输入 32×32×4 的噪声潜变量 z_t（来自 VAE encoder + 加噪）' },
        { title: 'Patchify', desc: '将潜变量切分为 2×2 patch → 256 个 token，每个维度 D，拼接 [t, c] 条件嵌入' },
        { title: 'Transformer 处理', desc: 'N 层 DiT Block 处理 token 序列，每层使用 adaLN-Zero 注入时间步和类别条件' },
        { title: 'Unpatchify', desc: '将 token 序列重排回 32×32×4 空间，得到预测噪声 ε（或 v-prediction）' },
      ],
      noisyLatent: '噪声潜变量 z_t',
      latentShape: '32×32×4',
      patchify: 'Patchify (2×2)',
      tokens: '256 tokens',
      tokenDim: 'dim = D',
      condition: '[t, c] 嵌入',
      ditBlock: 'DiT Block',
      adaLN: 'adaLN-Zero',
      nLayers: '× N 层',
      unpatchify: 'Unpatchify',
      predNoise: '预测噪声 ε',
      outputShape: '32×32×4',
    },
    en: {
      steps: [
        { title: 'Noisy Latent', desc: 'Input 32×32×4 noisy latent z_t (from VAE encoder + noise schedule)' },
        { title: 'Patchify', desc: 'Split latent into 2×2 patches → 256 tokens of dimension D, concatenate [t, c] conditioning' },
        { title: 'Transformer Processing', desc: 'N DiT Blocks process token sequence, each using adaLN-Zero to inject timestep and class conditioning' },
        { title: 'Unpatchify', desc: 'Rearrange tokens back to 32×32×4 spatial layout, producing predicted noise ε (or v-prediction)' },
      ],
      noisyLatent: 'Noisy Latent z_t',
      latentShape: '32×32×4',
      patchify: 'Patchify (2×2)',
      tokens: '256 tokens',
      tokenDim: 'dim = D',
      condition: '[t, c] embedding',
      ditBlock: 'DiT Block',
      adaLN: 'adaLN-Zero',
      nLayers: '× N layers',
      unpatchify: 'Unpatchify',
      predNoise: 'Predicted noise ε',
      outputShape: '32×32×4',
    },
  }[locale]!;

  const boxY = 60;
  const boxH = 55;
  const boxW = 140;
  const gap = 22;
  const startX = 30;

  const boxes = [
    { x: startX, label: t.noisyLatent, sublabel: t.latentShape, fill: COLORS.highlight, stroke: COLORS.orange },
    { x: startX + (boxW + gap) * 1, label: t.patchify, sublabel: `→ ${t.tokens}`, fill: COLORS.valid, stroke: COLORS.primary },
    { x: startX + (boxW + gap) * 2, label: t.ditBlock, sublabel: t.adaLN, fill: '#ede9fe', stroke: COLORS.purple },
    { x: startX + (boxW + gap) * 3, label: t.unpatchify, sublabel: t.outputShape, fill: '#dcfce7', stroke: COLORS.green },
  ];

  const steps = t.steps.map((step, idx) => ({
    title: step.title,
    content: (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="dtp-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Draw all boxes */}
        {boxes.map((box, i) => (
          <FlowBox
            key={i}
            x={box.x} y={boxY} w={boxW} h={boxH}
            label={box.label} sublabel={box.sublabel}
            fill={box.fill} stroke={box.stroke}
            active={i <= idx}
          />
        ))}

        {/* Arrows between boxes */}
        {boxes.slice(0, -1).map((box, i) => (
          <motion.line
            key={`arrow-${i}`}
            x1={box.x + boxW + 2} y1={boxY + boxH / 2}
            x2={boxes[i + 1].x - 2} y2={boxY + boxH / 2}
            stroke={i < idx ? COLORS.primary : COLORS.light}
            strokeWidth={i < idx ? 2 : 1}
            markerEnd="url(#dtp-arrow)"
            initial={{ opacity: 0.25 }}
            animate={{ opacity: i < idx ? 1 : 0.25 }}
            transition={{ duration: 0.3 }}
          />
        ))}

        {/* N layers annotation for DiT block */}
        <motion.text
          x={boxes[2].x + boxW / 2} y={boxY - 10}
          textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.purple}
          animate={{ opacity: idx >= 2 ? 1 : 0.2 }}
        >
          {t.nLayers}
        </motion.text>

        {/* Conditioning input arrow into DiT block */}
        <motion.g animate={{ opacity: idx >= 1 ? 1 : 0.2 }}>
          <rect x={boxes[2].x + boxW / 2 - 45} y={boxY + boxH + 12} width={90} height={22} rx={11}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={boxes[2].x + boxW / 2} y={boxY + boxH + 26} textAnchor="middle"
            fontSize="8" fontWeight="500" fill={COLORS.orange}>
            {t.condition}
          </text>
          <line x1={boxes[2].x + boxW / 2} y1={boxY + boxH + 12}
            x2={boxes[2].x + boxW / 2} y2={boxY + boxH + 2}
            stroke={COLORS.orange} strokeWidth={1} markerEnd="url(#dtp-arrow)" />
        </motion.g>

        {/* Current step highlight */}
        <motion.rect
          x={boxes[Math.min(idx, boxes.length - 1)].x - 3}
          y={boxY - 3}
          width={boxW + 6} height={boxH + 6}
          rx={8} fill="none" stroke={COLORS.primary}
          strokeWidth={2} strokeDasharray="4 2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Visual detail per step */}
        {idx === 0 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {/* Grid showing 32x32 latent (simplified as 8x8) */}
            {Array.from({ length: 8 }, (_, r) =>
              Array.from({ length: 8 }, (_, c) => (
                <rect key={`lat-${r}-${c}`}
                  x={startX + 25 + c * 11} y={boxY + boxH + 50 + r * 11}
                  width={10} height={10} rx={1}
                  fill={`hsl(${30 + r * 5 + c * 3}, 70%, ${65 + Math.sin(r + c) * 15}%)`}
                  opacity={0.8}
                />
              ))
            )}
            <text x={startX + 25 + 44} y={boxY + boxH + 145} textAnchor="middle"
              fontSize="9" fill={COLORS.mid}>{t.latentShape}</text>
          </motion.g>
        )}

        {idx === 1 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {/* Show patches being extracted */}
            {Array.from({ length: 16 }, (_, i) => (
              <motion.rect
                key={`tok-${i}`}
                x={startX + (boxW + gap) + 10 + (i % 16) * 8}
                y={boxY + boxH + 50 + Math.floor(i / 16) * 20}
                width={7} height={18} rx={1}
                fill={COLORS.primary} opacity={0.5}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              />
            ))}
            <text x={boxes[1].x + boxW / 2} y={boxY + boxH + 50 + 32}
              textAnchor="middle" fontSize="9" fill={COLORS.mid}>
              {t.tokens} ({t.tokenDim})
            </text>
            <text x={boxes[1].x + boxW / 2} y={boxY + boxH + 50 + 44}
              textAnchor="middle" fontSize="8" fill={COLORS.mid}>
              ... (256 total)
            </text>
          </motion.g>
        )}

        {idx === 2 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {/* Show stacked transformer layers */}
            {[0, 1, 2].map((li) => (
              <g key={`layer-${li}`}>
                <motion.rect
                  x={boxes[2].x + 15} y={boxY + boxH + 50 + li * 28}
                  width={boxW - 30} height={22} rx={4}
                  fill="#ede9fe" stroke={COLORS.purple} strokeWidth={1}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + li * 0.1 }}
                />
                <text x={boxes[2].x + boxW / 2} y={boxY + boxH + 64 + li * 28}
                  textAnchor="middle" fontSize="8" fill={COLORS.purple}>
                  {t.ditBlock} {li + 1}
                </text>
              </g>
            ))}
            <text x={boxes[2].x + boxW / 2} y={boxY + boxH + 50 + 3 * 28 + 5}
              textAnchor="middle" fontSize="8" fill={COLORS.mid}>...</text>
          </motion.g>
        )}

        {idx === 3 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {/* Show reconstructed output grid */}
            {Array.from({ length: 8 }, (_, r) =>
              Array.from({ length: 8 }, (_, c) => (
                <motion.rect key={`out-${r}-${c}`}
                  x={boxes[3].x + 25 + c * 11} y={boxY + boxH + 50 + r * 11}
                  width={10} height={10} rx={1}
                  fill={COLORS.green} opacity={0.3 + Math.random() * 0.4}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (r * 8 + c) * 0.01, duration: 0.2 }}
                />
              ))
            )}
            <text x={boxes[3].x + 25 + 44} y={boxY + boxH + 145}
              textAnchor="middle" fontSize="9" fill={COLORS.mid}>
              {t.predNoise} ({t.outputShape})
            </text>
          </motion.g>
        )}

        {/* Step description */}
        <motion.g
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <rect x={50} y={H - 55} width={W - 100} height={40}
            rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={W / 2} y={H - 30} textAnchor="middle"
            fontSize="12" fill={COLORS.dark} fontWeight="500">
            {step.desc}
          </text>
        </motion.g>
      </svg>
    ),
  }));

  return (
    <div className="my-6">
      <StepNavigator steps={steps} locale={locale} />
    </div>
  );
}
