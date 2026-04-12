import React from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;

export default function MMDiTFlow({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      steps: [
        {
          title: '双流输入',
          desc: '文本 token（来自 T5 + CLIP 编码器）和图像 latent token（来自 VAE 编码器）分别进入两条独立的流',
        },
        {
          title: '联合注意力',
          desc: '两条流的 token 拼接后共享 Attention 计算 — 文本和图像在同一注意力空间中交互',
        },
        {
          title: '输出',
          desc: '图像流输出预测噪声（用于去噪），文本流的输出被丢弃。两种模态共享注意力但各自保持独立的 MLP',
        },
      ],
      textStream: '文本流',
      imageStream: '图像流',
      textTokens: '文本 Token',
      imageTokens: '图像 Latent Token',
      t5Clip: 'T5 + CLIP',
      vaeEnc: 'VAE Encoder',
      textMLP: '文本 MLP',
      imageMLP: '图像 MLP',
      jointAttn: '联合 Attention',
      concat: 'Concat',
      split: 'Split',
      predNoise: '预测噪声 ε',
      discard: '丢弃',
      insight: '两种模态 · 一个共享注意力空间',
      sharedAttn: '共享 Q·K·V 空间',
      nBlocks: '× N 层',
    },
    en: {
      steps: [
        {
          title: 'Dual Streams',
          desc: 'Text tokens (from T5 + CLIP encoders) and image latent tokens (from VAE encoder) enter two independent streams',
        },
        {
          title: 'Joint Attention',
          desc: 'Tokens from both streams are concatenated for shared Attention — text and image interact in the same attention space',
        },
        {
          title: 'Output',
          desc: 'Image stream outputs predicted noise (for denoising), text stream output is discarded. Both modalities share attention but have separate MLPs',
        },
      ],
      textStream: 'Text Stream',
      imageStream: 'Image Stream',
      textTokens: 'Text Tokens',
      imageTokens: 'Image Latent Tokens',
      t5Clip: 'T5 + CLIP',
      vaeEnc: 'VAE Encoder',
      textMLP: 'Text MLP',
      imageMLP: 'Image MLP',
      jointAttn: 'Joint Attention',
      concat: 'Concat',
      split: 'Split',
      predNoise: 'Predicted noise ε',
      discard: 'Discarded',
      insight: 'Two modalities, one shared attention space',
      sharedAttn: 'Shared Q·K·V space',
      nBlocks: '× N layers',
    },
  }[locale]!;

  // Layout columns
  const textX = 160;
  const imageX = 560;
  const centerX = W / 2;
  const streamW = 140;
  const boxH = 32;

  const steps = t.steps.map((step, idx) => ({
    title: step.title,
    content: (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="mmdit-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Stream labels */}
        <text x={textX} y={24} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.purple}>
          {t.textStream}
        </text>
        <text x={imageX} y={24} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.primary}>
          {t.imageStream}
        </text>

        {/* Text input: T5 + CLIP */}
        <motion.g animate={{ opacity: idx >= 0 ? 1 : 0.2 }}>
          <rect x={textX - streamW / 2} y={40} width={streamW} height={boxH} rx={16}
            fill="#ede9fe" stroke={COLORS.purple} strokeWidth={1.5} />
          <text x={textX} y={59} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.purple}>
            {t.t5Clip}
          </text>
        </motion.g>

        {/* Image input: VAE Encoder */}
        <motion.g animate={{ opacity: idx >= 0 ? 1 : 0.2 }}>
          <rect x={imageX - streamW / 2} y={40} width={streamW} height={boxH} rx={16}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={imageX} y={59} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.primary}>
            {t.vaeEnc}
          </text>
        </motion.g>

        {/* Arrows down from encoders */}
        <line x1={textX} y1={72} x2={textX} y2={88}
          stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mmdit-arrow)" />
        <line x1={imageX} y1={72} x2={imageX} y2={88}
          stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mmdit-arrow)" />

        {/* Token boxes */}
        <motion.g animate={{ opacity: idx >= 0 ? 1 : 0.2 }}>
          <rect x={textX - streamW / 2} y={90} width={streamW} height={boxH} rx={5}
            fill="#ede9fe" stroke={COLORS.purple} strokeWidth={1.5} />
          <text x={textX} y={109} textAnchor="middle" fontSize="10" fontWeight="500" fill={COLORS.purple}>
            {t.textTokens}
          </text>
        </motion.g>

        <motion.g animate={{ opacity: idx >= 0 ? 1 : 0.2 }}>
          <rect x={imageX - streamW / 2} y={90} width={streamW} height={boxH} rx={5}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={imageX} y={109} textAnchor="middle" fontSize="10" fontWeight="500" fill={COLORS.primary}>
            {t.imageTokens}
          </text>
        </motion.g>

        {/* MM-DiT Block area */}
        {(() => {
          const blockTop = 135;
          const blockH = 160;
          const blockLeft = 80;
          const blockRight = W - 80;
          const blockWidth = blockRight - blockLeft;

          return (
            <g>
              {/* Block border */}
              <rect x={blockLeft} y={blockTop} width={blockWidth} height={blockH} rx={8}
                fill={COLORS.bg} stroke={COLORS.dark} strokeWidth={1.5} strokeDasharray="6 3" />
              <text x={blockLeft + 12} y={blockTop + 15} fontSize="10" fontWeight="700" fill={COLORS.dark}>
                MM-DiT Block
              </text>
              <text x={blockRight - 10} y={blockTop + 15} textAnchor="end" fontSize="9" fontWeight="600" fill={COLORS.orange}>
                {t.nBlocks}
              </text>

              {/* Arrows into block */}
              <line x1={textX} y1={122} x2={textX} y2={blockTop + 2}
                stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mmdit-arrow)" />
              <line x1={imageX} y1={122} x2={imageX} y2={blockTop + 2}
                stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mmdit-arrow)" />

              {/* Inside: Joint Attention (center) */}
              <motion.g animate={{ opacity: idx >= 1 ? 1 : 0.2 }}>
                {/* Concat arrows */}
                <motion.path
                  d={`M${textX},${blockTop + 50} L${centerX - 10},${blockTop + 65}`}
                  fill="none" stroke={COLORS.purple} strokeWidth={1.5}
                  markerEnd="url(#mmdit-arrow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: idx >= 1 ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.path
                  d={`M${imageX},${blockTop + 50} L${centerX + 10},${blockTop + 65}`}
                  fill="none" stroke={COLORS.primary} strokeWidth={1.5}
                  markerEnd="url(#mmdit-arrow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: idx >= 1 ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />

                {/* Concat label */}
                <text x={centerX - 60} y={blockTop + 55} textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                  {t.concat}
                </text>
                <text x={centerX + 60} y={blockTop + 55} textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                  {t.concat}
                </text>

                {/* Joint Attention box */}
                <motion.rect
                  x={centerX - 100} y={blockTop + 65} width={200} height={35} rx={6}
                  fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: idx >= 1 ? 1 : 0.9, opacity: idx >= 1 ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                />
                <text x={centerX} y={blockTop + 82} textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.orange}>
                  {t.jointAttn}
                </text>
                <text x={centerX} y={blockTop + 95} textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                  {t.sharedAttn}
                </text>

                {/* Split back into streams */}
                <motion.path
                  d={`M${centerX - 10},${blockTop + 100} L${textX},${blockTop + 115}`}
                  fill="none" stroke={COLORS.purple} strokeWidth={1.5}
                  markerEnd="url(#mmdit-arrow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: idx >= 1 ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
                <motion.path
                  d={`M${centerX + 10},${blockTop + 100} L${imageX},${blockTop + 115}`}
                  fill="none" stroke={COLORS.primary} strokeWidth={1.5}
                  markerEnd="url(#mmdit-arrow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: idx >= 1 ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />
                <text x={centerX} y={blockTop + 112} textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                  {t.split}
                </text>
              </motion.g>

              {/* Separate MLPs */}
              <motion.g animate={{ opacity: idx >= 1 ? 1 : 0.3 }}>
                <rect x={textX - 50} y={blockTop + 120} width={100} height={24} rx={4}
                  fill="#ede9fe" stroke={COLORS.purple} strokeWidth={1} />
                <text x={textX} y={blockTop + 135} textAnchor="middle" fontSize="9" fontWeight="500" fill={COLORS.purple}>
                  {t.textMLP}
                </text>

                <rect x={imageX - 50} y={blockTop + 120} width={100} height={24} rx={4}
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
                <text x={imageX} y={blockTop + 135} textAnchor="middle" fontSize="9" fontWeight="500" fill={COLORS.primary}>
                  {t.imageMLP}
                </text>
              </motion.g>
            </g>
          );
        })()}

        {/* Outputs */}
        {(() => {
          const outY = 310;

          return (
            <motion.g animate={{ opacity: idx >= 2 ? 1 : 0.2 }}>
              {/* Arrows out of block */}
              <line x1={textX} y1={295} x2={textX} y2={outY}
                stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mmdit-arrow)" />
              <line x1={imageX} y1={295} x2={imageX} y2={outY}
                stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mmdit-arrow)" />

              {/* Text output: discarded */}
              <rect x={textX - streamW / 2} y={outY} width={streamW} height={boxH} rx={5}
                fill={COLORS.masked} stroke={COLORS.mid} strokeWidth={1}
                strokeDasharray="4 2" />
              <text x={textX} y={outY + 13} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
                {t.textTokens}
              </text>
              <text x={textX} y={outY + 25} textAnchor="middle" fontSize="8" fontWeight="600" fill={COLORS.red}>
                {t.discard}
              </text>

              {/* Image output: predicted noise */}
              <rect x={imageX - streamW / 2} y={outY} width={streamW} height={boxH} rx={5}
                fill="#dcfce7" stroke={COLORS.green} strokeWidth={2} />
              <text x={imageX} y={outY + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS.green}>
                {t.predNoise}
              </text>
            </motion.g>
          );
        })()}

        {/* Step description */}
        <motion.g
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <rect x={50} y={H - 48} width={W - 100} height={36}
            rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={W / 2} y={H - 26} textAnchor="middle"
            fontSize="11" fill={COLORS.dark} fontWeight="500">
            {step.desc}
          </text>
        </motion.g>

        {/* Key insight (step 2+) */}
        {idx >= 1 && (
          <motion.text
            x={W / 2} y={H - 4}
            textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.orange}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t.insight}
          </motion.text>
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
