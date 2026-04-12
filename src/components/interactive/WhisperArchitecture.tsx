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

function Arrow({ x1, y1, x2, y2, active }: {
  x1: number; y1: number; x2: number; y2: number; active?: boolean;
}) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={active ? COLORS.primary : COLORS.light}
      strokeWidth={active ? 2 : 1}
      markerEnd="url(#whisper-arrow)"
      initial={{ opacity: 0.3 }}
      animate={{ opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.3 }}
    />
  );
}

export default function WhisperArchitecture({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      steps: [
        { title: '音频切分', desc: '将长音频切分为 30 秒片段，每段独立处理' },
        { title: 'Log-Mel 频谱图', desc: '每 30s 音频 → 80 个 mel bin × 3000 帧 → (3000, 80) 特征' },
        { title: 'CNN Stem', desc: '两层 1D 卷积 (kernel=3) 将频谱图下采样到 1500 帧 → (1500, d_model)' },
        { title: 'Transformer Encoder', desc: 'N 层 Transformer Block，对音频特征进行全局建模' },
        { title: 'Transformer Decoder', desc: '自回归解码，生成 token 序列。特殊 token 控制多任务' },
      ],
      audio: '长音频',
      segments: '30s 片段',
      logMel: 'Log-Mel',
      melShape: '(3000, 80)',
      cnnStem: 'CNN Stem',
      cnnShape: '(1500, d)',
      encoder: 'Transformer\nEncoder',
      encShape: '(1500, d)',
      decoder: 'Transformer\nDecoder',
      output: '输出 Tokens',
      multitask: '多任务标签',
      langTag: '<|zh|>',
      taskTag: '<|transcribe|>',
      noTimestamp: '<|notimestamps|>',
      asrLabel: 'ASR 转录',
      translateLabel: '翻译',
      langDetect: '语言检测',
      crossAttn: 'Cross-Attention',
    },
    en: {
      steps: [
        { title: 'Audio Segmentation', desc: 'Split long audio into 30-second segments, each processed independently' },
        { title: 'Log-Mel Spectrogram', desc: '30s audio → 80 mel bins × 3000 frames → (3000, 80) features' },
        { title: 'CNN Stem', desc: 'Two 1D conv layers (kernel=3) downsample to 1500 frames → (1500, d_model)' },
        { title: 'Transformer Encoder', desc: 'N Transformer Blocks, modeling global audio features' },
        { title: 'Transformer Decoder', desc: 'Autoregressive decoding, generating token sequence. Special tokens control multitask' },
      ],
      audio: 'Long Audio',
      segments: '30s Segments',
      logMel: 'Log-Mel',
      melShape: '(3000, 80)',
      cnnStem: 'CNN Stem',
      cnnShape: '(1500, d)',
      encoder: 'Transformer\nEncoder',
      encShape: '(1500, d)',
      decoder: 'Transformer\nDecoder',
      output: 'Output Tokens',
      multitask: 'Multitask Tags',
      langTag: '<|zh|>',
      taskTag: '<|transcribe|>',
      noTimestamp: '<|notimestamps|>',
      asrLabel: 'ASR Transcription',
      translateLabel: 'Translation',
      langDetect: 'Lang Detection',
      crossAttn: 'Cross-Attention',
    },
  }[locale]!;

  const stepsData = t.steps.map((s, i) => ({
    title: s.title,
    content: (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="whisper-arrow" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Step description */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.dark}>{s.desc}</text>

        {/* Pipeline flow - horizontal */}
        {/* Audio */}
        <FlowBox x={10} y={50} w={90} h={50} label={t.audio} sublabel=""
          fill={COLORS.bgAlt} stroke={COLORS.mid} active={i >= 0} />
        <Arrow x1={100} y1={75} x2={118} y2={75} active={i >= 0} />

        {/* Segments */}
        <FlowBox x={120} y={50} w={90} h={50} label={t.segments}
          fill={i >= 0 ? COLORS.highlight : COLORS.bgAlt}
          stroke={i >= 0 ? COLORS.orange : COLORS.mid} active={i >= 0} />
        <Arrow x1={210} y1={75} x2={228} y2={75} active={i >= 1} />

        {/* Log-Mel */}
        <FlowBox x={230} y={50} w={90} h={50} label={t.logMel} sublabel={t.melShape}
          fill={i >= 1 ? COLORS.valid : COLORS.bgAlt}
          stroke={i >= 1 ? COLORS.primary : COLORS.mid} active={i >= 1} />
        <Arrow x1={320} y1={75} x2={338} y2={75} active={i >= 2} />

        {/* CNN Stem */}
        <FlowBox x={340} y={50} w={90} h={50} label={t.cnnStem} sublabel={t.cnnShape}
          fill={i >= 2 ? COLORS.valid : COLORS.bgAlt}
          stroke={i >= 2 ? COLORS.primary : COLORS.mid} active={i >= 2} />
        <Arrow x1={430} y1={75} x2={448} y2={75} active={i >= 3} />

        {/* Encoder */}
        <FlowBox x={450} y={45} w={110} h={60} label={t.encoder} sublabel={t.encShape}
          fill={i >= 3 ? '#e8f5e9' : COLORS.bgAlt}
          stroke={i >= 3 ? COLORS.green : COLORS.mid} active={i >= 3} />
        <Arrow x1={560} y1={75} x2={578} y2={75} active={i >= 4} />

        {/* Decoder */}
        <FlowBox x={580} y={45} w={110} h={60} label={t.decoder} sublabel={t.output}
          fill={i >= 4 ? '#f3e5f5' : COLORS.bgAlt}
          stroke={i >= 4 ? COLORS.purple : COLORS.mid} active={i >= 4} />

        {/* Cross-attention arrow from encoder to decoder */}
        {i >= 4 && (
          <g>
            <motion.path
              d={`M 505,105 L 505,130 L 635,130 L 635,105`}
              fill="none" stroke={COLORS.orange} strokeWidth={1.5}
              strokeDasharray="4,3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <text x={570} y={143} textAnchor="middle" fontSize="8"
              fill={COLORS.orange}>{t.crossAttn}</text>
          </g>
        )}

        {/* Step 5: Show multitask special tokens */}
        {i >= 4 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
            {/* Multitask tags */}
            <text x={400} y={185} textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.dark}>{t.multitask}</text>

            {/* Special tokens */}
            <rect x={120} y={200} width={160} height={28} rx={4} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
            <text x={200} y={218} textAnchor="middle" fontSize="9" fontWeight="500"
              fill={COLORS.orange} fontFamily={FONTS.mono}>
              {`<|startoftranscript|> ${t.langTag} ${t.taskTag}`}
            </text>

            {/* Task branches */}
            <rect x={50} y={250} width={130} height={30} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={115} y={269} textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.primary}>
              {t.asrLabel}
            </text>

            <rect x={220} y={250} width={130} height={30} rx={6} fill="#e8f5e9" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={285} y={269} textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.green}>
              {t.translateLabel}
            </text>

            <rect x={390} y={250} width={130} height={30} rx={6} fill="#f3e5f5" stroke={COLORS.purple} strokeWidth={1.5} />
            <text x={455} y={269} textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.purple}>
              {t.langDetect}
            </text>

            {/* 680k hours note */}
            <rect x={560} y={250} width={200} height={30} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
            <text x={660} y={269} textAnchor="middle" fontSize="8" fontWeight="500" fill={COLORS.red}>
              680,000 hours weak supervision
            </text>
          </motion.g>
        )}
      </svg>
    ),
  }));

  return (
    <div className="my-6">
      <StepNavigator steps={stepsData} locale={locale} />
    </div>
  );
}
