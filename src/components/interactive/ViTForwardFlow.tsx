import React from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 340;

function FlowBox({ x, y, w, h, label, sublabel, fill, stroke, active }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string;
  fill: string; stroke: string; active?: boolean;
}) {
  return (
    <motion.g
      initial={{ opacity: 0.3 }}
      animate={{ opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.4 }}
    >
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={active ? 2 : 1} />
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 5 : h / 2 + 1)} textAnchor="middle"
        dominantBaseline="middle" fontSize="11" fontWeight="600" fill={stroke}
        fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
          dominantBaseline="middle" fontSize="9" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </motion.g>
  );
}

function Arrow({ x1, y1, x2, y2, active }: {
  x1: number; y1: number; x2: number; y2: number; active?: boolean;
}) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={active ? COLORS.primary : COLORS.light}
      strokeWidth={active ? 2 : 1}
      markerEnd="url(#vit-arrow)"
      initial={{ opacity: 0.3 }}
      animate={{ opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.3 }}
    />
  );
}

export default function ViTForwardFlow({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      steps: [
        { title: '输入图像', desc: '输入 224×224×3 的 RGB 图像' },
        { title: 'Patch 提取 + [CLS]', desc: '切分为 14×14 = 196 个 patch，前置 [CLS] token → 197 个 token' },
        { title: '线性投影 + 位置编码', desc: '每个 patch 展平后线性投影到 D 维，加上可学习位置编码 → (197, D)' },
        { title: 'Transformer Encoder', desc: 'L 层 Transformer Block，每层包含 Multi-Head Self-Attention + MLP' },
        { title: '分类输出', desc: '[CLS] token 的输出通过 MLP Head 得到类别预测' },
      ],
      image: '输入图像',
      imageShape: '224×224×3',
      patchExtract: 'Patch 提取',
      patchShape: '196 patches',
      clsToken: '[CLS] 前置',
      tokenSeq: '197 tokens',
      linearProj: '线性投影 E',
      posEnc: '+ 位置编码',
      seqShape: '(197, D)',
      encoder: 'Transformer\nEncoder ×L',
      encoderShape: '(197, D)',
      clsOut: '[CLS] 输出',
      mlpHead: 'MLP Head',
      prediction: '类别预测',
      predShape: '(num_classes)',
    },
    en: {
      steps: [
        { title: 'Input Image', desc: 'Input 224×224×3 RGB image' },
        { title: 'Patch Extraction + [CLS]', desc: 'Split into 14×14 = 196 patches, prepend [CLS] token → 197 tokens' },
        { title: 'Linear Projection + Position Encoding', desc: 'Flatten each patch and project to D dimensions, add learnable position encoding → (197, D)' },
        { title: 'Transformer Encoder', desc: 'L Transformer Blocks, each with Multi-Head Self-Attention + MLP' },
        { title: 'Classification Output', desc: '[CLS] token output passed through MLP Head for class prediction' },
      ],
      image: 'Input Image',
      imageShape: '224×224×3',
      patchExtract: 'Patch Extraction',
      patchShape: '196 patches',
      clsToken: '[CLS] Prepend',
      tokenSeq: '197 tokens',
      linearProj: 'Linear Proj E',
      posEnc: '+ Pos Encoding',
      seqShape: '(197, D)',
      encoder: 'Transformer\nEncoder ×L',
      encoderShape: '(197, D)',
      clsOut: '[CLS] Output',
      mlpHead: 'MLP Head',
      prediction: 'Class Prediction',
      predShape: '(num_classes)',
    },
  }[locale]!;

  // Box positions along horizontal flow
  const boxY = 100;
  const boxH = 70;
  const boxW = 120;
  const gap = 20;
  const startX = 20;

  const boxes = [
    { x: startX, label: t.image, sublabel: t.imageShape, fill: '#e0f2fe', stroke: COLORS.primary },
    { x: startX + (boxW + gap) * 1, label: t.patchExtract, sublabel: t.tokenSeq, fill: COLORS.valid, stroke: COLORS.primary },
    { x: startX + (boxW + gap) * 2, label: t.linearProj, sublabel: t.seqShape, fill: '#ede9fe', stroke: COLORS.purple },
    { x: startX + (boxW + gap) * 3, label: t.encoder, sublabel: t.encoderShape, fill: COLORS.highlight, stroke: COLORS.orange },
    { x: startX + (boxW + gap) * 4, label: t.mlpHead, sublabel: t.prediction, fill: '#dcfce7', stroke: COLORS.green },
  ];

  const steps = t.steps.map((step, idx) => ({
    title: step.title,
    content: (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="vit-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
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
          <Arrow
            key={`arrow-${i}`}
            x1={box.x + boxW + 2} y1={boxY + boxH / 2}
            x2={boxes[i + 1].x - 2} y2={boxY + boxH / 2}
            active={i < idx}
          />
        ))}

        {/* Step description */}
        <motion.g
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <rect x={50} y={boxY + boxH + 40} width={W - 100} height={50}
            rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={W / 2} y={boxY + boxH + 70} textAnchor="middle"
            fontSize="13" fill={COLORS.dark} fontWeight="500">
            {step.desc}
          </text>
        </motion.g>

        {/* Current step highlight indicator */}
        <motion.rect
          x={boxes[idx].x - 3} y={boxY - 3}
          width={boxW + 6} height={boxH + 6}
          rx={8} fill="none" stroke={COLORS.primary}
          strokeWidth={2} strokeDasharray="4 2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Image representation for step 1 */}
        {idx === 0 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {Array.from({ length: 4 }, (_, r) =>
              Array.from({ length: 4 }, (_, c) => (
                <rect key={`img-${r}-${c}`}
                  x={startX + 20 + c * 20} y={boxY - 55 + r * 12}
                  width={18} height={10} rx={1}
                  fill={`hsl(${200 + r * 20 + c * 15}, 60%, ${50 + r * 5}%)`}
                />
              ))
            )}
          </motion.g>
        )}

        {/* Patch grid visualization for step 2 */}
        {idx >= 1 && (
          <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={`token-${i}`}
                x={boxes[1].x + 10 + i * 14} y={boxY - 20}
                width={12} height={12} rx={2}
                fill={i === 0 ? COLORS.orange : COLORS.primary}
                opacity={0.6}
              />
            ))}
            <text x={boxes[1].x + boxW / 2} y={boxY - 28} textAnchor="middle" fontSize="8" fill={COLORS.mid}>
              {t.clsToken}
            </text>
          </motion.g>
        )}
      </svg>
    ),
  }));

  return (
    <div className="my-6">
      <StepNavigator steps={steps} locale={locale} />
    </div>
  );
}
