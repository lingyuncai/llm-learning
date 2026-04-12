import React from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

function Box({ x, y, w, h, label, sublabel, fill, stroke, active = true }: {
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
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 7 : h / 2 + 1)} textAnchor="middle"
        dominantBaseline="middle" fontSize="11" fontWeight="600" fill={stroke}
        fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle"
          dominantBaseline="middle" fontSize="9" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </motion.g>
  );
}

function Arrow({ x1, y1, x2, y2, active = true }: {
  x1: number; y1: number; x2: number; y2: number; active?: boolean;
}) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={active ? '#94a3b8' : COLORS.light}
      strokeWidth={1.5}
      markerEnd="url(#dea-arrow)"
      animate={{ opacity: active ? 1 : 0.2 }}
      transition={{ duration: 0.4 }}
    />
  );
}

export default function DualEncoderArchitecture({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      step1Title: '双塔结构',
      step2Title: '编码过程',
      step3Title: '共享空间',
      image: '图像',
      text: '文本',
      imageEncoder: 'Image Encoder',
      textEncoder: 'Text Encoder',
      vit: 'ViT',
      transformer: 'Transformer',
      patches: 'Patches',
      tokens: 'Tokens',
      cls: '[CLS]',
      eos: '[EOS]',
      projectD: '投影到 D 维',
      imageEmb: '图像向量',
      textEmb: '文本向量',
      sharedSpace: '共享嵌入空间',
      matchClose: '匹配的对 → 距离近',
      unmatchFar: '不匹配的对 → 距离远',
      twoTowers: '图像和文本各有独立的编码器',
      twoTowersNote: 'CLIP 的核心是"双塔"架构：图像侧用 ViT，文本侧用 Transformer，两者完全独立',
    },
    en: {
      step1Title: 'Two Towers',
      step2Title: 'Encoding Process',
      step3Title: 'Shared Space',
      image: 'Image',
      text: 'Text',
      imageEncoder: 'Image Encoder',
      textEncoder: 'Text Encoder',
      vit: 'ViT',
      transformer: 'Transformer',
      patches: 'Patches',
      tokens: 'Tokens',
      cls: '[CLS]',
      eos: '[EOS]',
      projectD: 'Project to D-dim',
      imageEmb: 'Image Vector',
      textEmb: 'Text Vector',
      sharedSpace: 'Shared Embedding Space',
      matchClose: 'Matching pairs → close',
      unmatchFar: 'Non-matching pairs → far',
      twoTowers: 'Image and text have independent encoders',
      twoTowersNote: 'CLIP\'s core is a "dual encoder" architecture: ViT for images, Transformer for text, fully independent',
    },
  }[locale]!;

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <marker id="dea-arrow" viewBox="0 0 10 10" refX="10" refY="5"
              markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
          {/* Image tower */}
          <rect x={80} y={40} width={250} height={400} rx={12}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={2} strokeDasharray="8 4" />
          <text x={205} y={70} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t.imageEncoder}</text>
          <Box x={130} y={100} w={150} h={45} label={t.image} sublabel="224×224×3"
            fill={COLORS.bgAlt} stroke={COLORS.dark} />
          <Box x={130} y={190} w={150} h={45} label={t.vit} sublabel="ViT-L/14"
            fill="#e3f2fd" stroke={COLORS.primary} />
          <Box x={130} y={280} w={150} h={45} label={t.cls} sublabel="→ D-dim"
            fill="#e8f5e9" stroke={COLORS.green} />
          <Arrow x1={205} y1={145} x2={205} y2={190} />
          <Arrow x1={205} y1={235} x2={205} y2={280} />

          {/* Text tower */}
          <rect x={470} y={40} width={250} height={400} rx={12}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2} strokeDasharray="8 4" />
          <text x={595} y={70} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.orange} fontFamily={FONTS.sans}>{t.textEncoder}</text>
          <Box x={520} y={100} w={150} h={45} label={t.text} sublabel='"a photo of a dog"'
            fill={COLORS.bgAlt} stroke={COLORS.dark} />
          <Box x={520} y={190} w={150} h={45} label={t.transformer} sublabel="12-layer"
            fill="#fff3e0" stroke={COLORS.orange} />
          <Box x={520} y={280} w={150} h={45} label={t.eos} sublabel="→ D-dim"
            fill="#e8f5e9" stroke={COLORS.green} />
          <Arrow x1={595} y1={145} x2={595} y2={190} />
          <Arrow x1={595} y1={235} x2={595} y2={280} />

          {/* Note */}
          <text x={400} y={380} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.twoTowers}</text>
          <text x={400} y={400} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.twoTowersNote}</text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <marker id="dea-arrow2" viewBox="0 0 10 10" refX="10" refY="5"
              markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
          {/* Image path */}
          <text x={200} y={30} textAnchor="middle" fontSize="13" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t.imageEncoder}</text>
          <Box x={100} y={45} w={200} h={40} label={t.image} sublabel="224×224×3"
            fill={COLORS.bgAlt} stroke={COLORS.dark} />
          <Arrow x1={200} y1={85} x2={200} y2={110} />
          <Box x={100} y={110} w={200} h={40} label={t.patches} sublabel="16×16 → 196 patches"
            fill="#e3f2fd" stroke={COLORS.primary} />
          <Arrow x1={200} y1={150} x2={200} y2={175} />
          <Box x={100} y={175} w={200} h={40} label="Transformer" sublabel="L layers × self-attention"
            fill="#e3f2fd" stroke={COLORS.primary} />
          <Arrow x1={200} y1={215} x2={200} y2={240} />
          <Box x={100} y={240} w={200} h={40} label={t.cls}
            fill="#e8f5e9" stroke={COLORS.green} />
          <Arrow x1={200} y1={280} x2={200} y2={305} />
          <Box x={100} y={305} w={200} h={40} label={t.projectD}
            fill="#e8f5e9" stroke={COLORS.green} />
          <Arrow x1={200} y1={345} x2={200} y2={370} />
          <Box x={125} y={370} w={150} h={40} label={t.imageEmb} sublabel="D = 768"
            fill={COLORS.valid} stroke={COLORS.primary} />

          {/* Text path */}
          <text x={600} y={30} textAnchor="middle" fontSize="13" fontWeight="700"
            fill={COLORS.orange} fontFamily={FONTS.sans}>{t.textEncoder}</text>
          <Box x={500} y={45} w={200} h={40} label={t.text} sublabel='"a photo of a dog"'
            fill={COLORS.bgAlt} stroke={COLORS.dark} />
          <Arrow x1={600} y1={85} x2={600} y2={110} />
          <Box x={500} y={110} w={200} h={40} label={t.tokens} sublabel="BPE tokenize"
            fill="#fff3e0" stroke={COLORS.orange} />
          <Arrow x1={600} y1={150} x2={600} y2={175} />
          <Box x={500} y={175} w={200} h={40} label="Transformer" sublabel="12 layers × self-attention"
            fill="#fff3e0" stroke={COLORS.orange} />
          <Arrow x1={600} y1={215} x2={600} y2={240} />
          <Box x={500} y={240} w={200} h={40} label={t.eos}
            fill="#e8f5e9" stroke={COLORS.green} />
          <Arrow x1={600} y1={280} x2={600} y2={305} />
          <Box x={500} y={305} w={200} h={40} label={t.projectD}
            fill="#e8f5e9" stroke={COLORS.green} />
          <Arrow x1={600} y1={345} x2={600} y2={370} />
          <Box x={525} y={370} w={150} h={40} label={t.textEmb} sublabel="D = 768"
            fill={COLORS.highlight} stroke={COLORS.orange} />

          {/* Center arrow connecting */}
          <line x1={275} y1={390} x2={525} y2={390}
            stroke={COLORS.green} strokeWidth={2} strokeDasharray="6 3" />
          <text x={400} y={440} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            cos(I, T) → similarity
          </text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* Shared embedding space */}
          <text x={400} y={30} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.sharedSpace}</text>
          <ellipse cx={400} cy={250} rx={300} ry={180}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={2} />

          {/* Matching pairs - close together */}
          <motion.circle cx={250} cy={180} r={12} fill={COLORS.primary} opacity={0.8}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <text x={250} y={184} textAnchor="middle" fontSize="8" fill="white" fontFamily={FONTS.sans}>🐕</text>
          <motion.rect x={270} y={170} width={20} height={20} rx={3} fill={COLORS.orange} opacity={0.8}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
          <text x={280} y={184} textAnchor="middle" fontSize="8" fill="white" fontFamily={FONTS.sans}>dog</text>
          <line x1={262} y1={180} x2={270} y2={180} stroke={COLORS.green} strokeWidth={1.5} />

          <motion.circle cx={480} cy={160} r={12} fill={COLORS.primary} opacity={0.8}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
          <text x={480} y={164} textAnchor="middle" fontSize="8" fill="white" fontFamily={FONTS.sans}>🚗</text>
          <motion.rect x={500} y={150} width={20} height={20} rx={3} fill={COLORS.orange} opacity={0.8}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.7 }} />
          <text x={510} y={164} textAnchor="middle" fontSize="8" fill="white" fontFamily={FONTS.sans}>car</text>
          <line x1={492} y1={160} x2={500} y2={160} stroke={COLORS.green} strokeWidth={1.5} />

          <motion.circle cx={350} cy={300} r={12} fill={COLORS.primary} opacity={0.8}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1.0 }} />
          <text x={350} y={304} textAnchor="middle" fontSize="8" fill="white" fontFamily={FONTS.sans}>🌸</text>
          <motion.rect x={370} y={290} width={20} height={20} rx={3} fill={COLORS.orange} opacity={0.8}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
          <text x={380} y={304} textAnchor="middle" fontSize="7" fill="white" fontFamily={FONTS.sans}>flower</text>
          <line x1={362} y1={300} x2={370} y2={300} stroke={COLORS.green} strokeWidth={1.5} />

          {/* Legend */}
          <circle cx={150} cy={430} r={8} fill={COLORS.primary} opacity={0.8} />
          <text x={165} y={434} fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.image}</text>
          <rect x={235} y={422} width={16} height={16} rx={3} fill={COLORS.orange} opacity={0.8} />
          <text x={258} y={434} fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.text}</text>

          <line x1={350} y1={430} x2={370} y2={430} stroke={COLORS.green} strokeWidth={2} />
          <text x={380} y={434} fontSize="11" fill={COLORS.green} fontFamily={FONTS.sans}>{t.matchClose}</text>

          <line x1={350} y1={455} x2={370} y2={455} stroke={COLORS.red} strokeWidth={2} strokeDasharray="4 2" />
          <text x={380} y={459} fontSize="11" fill={COLORS.red} fontFamily={FONTS.sans}>{t.unmatchFar}</text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} locale={locale} />;
}
