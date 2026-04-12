import React from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

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
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 7 : h / 2 + 1)} textAnchor="middle"
        dominantBaseline="middle" fontSize="10" fontWeight="600" fill={stroke}
        fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          dominantBaseline="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </motion.g>
  );
}

function Arrow({ x1, y1, x2, y2, active, label }: {
  x1: number; y1: number; x2: number; y2: number;
  active?: boolean; label?: string;
}) {
  return (
    <motion.g
      initial={{ opacity: 0.25 }}
      animate={{ opacity: active ? 1 : 0.25 }}
      transition={{ duration: 0.3 }}
    >
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={active ? COLORS.primary : COLORS.light}
        strokeWidth={active ? 2 : 1}
        markerEnd="url(#mg-arrow)" />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6}
          textAnchor="middle" fontSize="7" fill={COLORS.mid}>{label}</text>
      )}
    </motion.g>
  );
}

function DelayGrid({ x, y, w, h, active }: {
  x: number; y: number; w: number; h: number; active?: boolean;
}) {
  const layers = 4, steps = 8;
  const cw = w / steps, ch = h / layers;
  const palette = [COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple];

  return (
    <motion.g initial={{ opacity: 0.25 }} animate={{ opacity: active ? 1 : 0.25 }} transition={{ duration: 0.4 }}>
      <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx={3}
        fill="none" stroke={COLORS.light} strokeWidth={1} />
      {Array.from({ length: layers }, (_, l) =>
        Array.from({ length: steps }, (_, s) => {
          // Delay pattern: layer l at step s is valid when s >= l
          const valid = s >= l;
          return (
            <rect key={`${l}-${s}`}
              x={x + s * cw + 0.5} y={y + l * ch + 0.5}
              width={cw - 1} height={ch - 1} rx={1.5}
              fill={valid ? palette[l] : COLORS.masked}
              opacity={valid ? 0.7 : 0.3} />
          );
        })
      )}
    </motion.g>
  );
}

function MiniWaveform({ x, y, w, h, active }: {
  x: number; y: number; w: number; h: number; active?: boolean;
}) {
  const mid = y + h / 2;
  const points = Array.from({ length: 30 }, (_, i) => {
    const px = x + (i / 29) * w;
    const py = mid - Math.sin(i * 0.6) * Math.sin(i * 0.2) * (h * 0.35);
    return `${px},${py}`;
  }).join(' ');

  return (
    <motion.g initial={{ opacity: 0.25 }} animate={{ opacity: active ? 1 : 0.25 }} transition={{ duration: 0.4 }}>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1} />
      <polyline points={points} fill="none" stroke={COLORS.green} strokeWidth={1.5} />
    </motion.g>
  );
}

export default function MusicGenPipeline({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      steps: [
        { title: '输入条件', desc: '文本描述（可选旋律音频）作为生成条件' },
        { title: 'T5 编码', desc: 'T5 Encoder 将文本编码为向量，通过 Cross-Attention 注入' },
        { title: 'Transformer 解码', desc: '单 Transformer 用 Delay Pattern 自回归生成交错 codec tokens' },
        { title: 'EnCodec 解码', desc: 'EnCodec 解码器将 codec tokens 转换为高质量音频波形' },
      ],
      textInput: '文本描述',
      textExample: '"欢快的吉他旋律"',
      melodyInput: '旋律 (可选)',
      melodyDesc: '旋律条件',
      t5Encoder: 'T5 Encoder',
      t5Desc: '文本 → 向量',
      crossAttn: 'Cross-Attention',
      transformer: 'Transformer',
      transDesc: '单模型自回归',
      delayPattern: 'Delay Pattern',
      delayDesc: 'Codec Tokens',
      encodecDec: 'EnCodec 解码器',
      encodecDesc: 'Tokens → 波形',
      output: '输出音频',
      keyPoint: '核心: 单 Transformer + Delay Pattern = 高效多码本生成',
    },
    en: {
      steps: [
        { title: 'Input Conditions', desc: 'Text description (+ optional melody audio) as generation conditions' },
        { title: 'T5 Encoding', desc: 'T5 Encoder encodes text into vectors, injected via Cross-Attention' },
        { title: 'Transformer Decoding', desc: 'Single Transformer autoregressively generates interleaved codec tokens via Delay Pattern' },
        { title: 'EnCodec Decoding', desc: 'EnCodec decoder converts codec tokens into high-quality audio waveform' },
      ],
      textInput: 'Text Description',
      textExample: '"Upbeat guitar melody"',
      melodyInput: 'Melody (optional)',
      melodyDesc: 'Melody conditioning',
      t5Encoder: 'T5 Encoder',
      t5Desc: 'Text → Embeddings',
      crossAttn: 'Cross-Attention',
      transformer: 'Transformer',
      transDesc: 'Single-model AR',
      delayPattern: 'Delay Pattern',
      delayDesc: 'Codec Tokens',
      encodecDec: 'EnCodec Decoder',
      encodecDesc: 'Tokens → Waveform',
      output: 'Output Audio',
      keyPoint: 'Key: Single Transformer + Delay Pattern = Efficient multi-codebook generation',
    },
  }[locale]!;

  const stepsData = t.steps.map((s, i) => ({
    title: s.title,
    content: (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="mg-arrow" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Step description */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.dark}>{s.desc}</text>

        {/* --- Step 1: Inputs --- */}
        <FlowBox x={30} y={60} w={140} h={44} label={t.textInput} sublabel={t.textExample}
          fill={i >= 0 ? COLORS.highlight : COLORS.bgAlt}
          stroke={i >= 0 ? COLORS.orange : COLORS.mid} active={i >= 0} />

        <FlowBox x={30} y={120} w={140} h={44} label={t.melodyInput} sublabel={t.melodyDesc}
          fill={i >= 0 ? '#f3e5f5' : COLORS.bgAlt}
          stroke={i >= 0 ? COLORS.purple : COLORS.mid} active={i >= 0} />

        {/* --- Step 2: T5 Encoder --- */}
        <Arrow x1={170} y1={82} x2={218} y2={82} active={i >= 1} />
        <FlowBox x={220} y={55} w={130} h={55} label={t.t5Encoder} sublabel={t.t5Desc}
          fill={i >= 1 ? COLORS.valid : COLORS.bgAlt}
          stroke={i >= 1 ? COLORS.primary : COLORS.mid} active={i >= 1} />

        {/* Cross-attention arrow */}
        <Arrow x1={350} y1={82} x2={398} y2={82} active={i >= 1}
          label={i >= 1 ? t.crossAttn : ''} />

        {/* Melody conditioning arrow */}
        <Arrow x1={170} y1={142} x2={398} y2={142} active={i >= 1} />

        {/* --- Step 3: Transformer + Delay Pattern --- */}
        <FlowBox x={400} y={50} w={150} h={60} label={t.transformer} sublabel={t.transDesc}
          fill={i >= 2 ? '#e8f5e9' : COLORS.bgAlt}
          stroke={i >= 2 ? COLORS.green : COLORS.mid} active={i >= 2} />

        {/* Delay pattern grid below transformer */}
        <Arrow x1={475} y1={110} x2={475} y2={148} active={i >= 2} />
        <DelayGrid x={400} y={150} w={150} h={80} active={i >= 2} />
        {i >= 2 && (
          <text x={475} y={245} textAnchor="middle" fontSize="8" fontWeight="500"
            fill={COLORS.green}>{t.delayPattern} — {t.delayDesc}</text>
        )}

        {/* --- Step 4: EnCodec Decoder --- */}
        <Arrow x1={550} y1={190} x2={598} y2={190} active={i >= 3} />
        <FlowBox x={600} y={165} w={130} h={55} label={t.encodecDec} sublabel={t.encodecDesc}
          fill={i >= 3 ? '#e8f5e9' : COLORS.bgAlt}
          stroke={i >= 3 ? COLORS.green : COLORS.mid} active={i >= 3} />

        {/* Output waveform */}
        {i >= 3 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Arrow x1={665} y1={220} x2={665} y2={258} active />
            <MiniWaveform x={620} y={260} w={90} h={40} active />
            <text x={665} y={315} textAnchor="middle" fontSize="9" fontWeight="600"
              fill={COLORS.green}>{t.output}</text>
          </motion.g>
        )}

        {/* Key point banner */}
        <rect x={W / 2 - 200} y={H - 50} width={400} height={30} rx={6}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={W / 2} y={H - 31} textAnchor="middle" fontSize="10" fontWeight="700"
          fill={COLORS.orange}>{t.keyPoint}</text>
      </svg>
    ),
  }));

  return (
    <div className="my-6">
      <StepNavigator steps={stepsData} locale={locale} />
    </div>
  );
}
