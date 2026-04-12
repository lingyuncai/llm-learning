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

function Arrow({ x1, y1, x2, y2, active, dashed }: {
  x1: number; y1: number; x2: number; y2: number;
  active?: boolean; dashed?: boolean;
}) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={active ? COLORS.primary : COLORS.light}
      strokeWidth={active ? 2 : 1}
      strokeDasharray={dashed ? '4,3' : undefined}
      markerEnd="url(#valle-arrow)"
      initial={{ opacity: 0.25 }}
      animate={{ opacity: active ? 1 : 0.25 }}
      transition={{ duration: 0.3 }}
    />
  );
}

// Mini token grid for codec visualization
function MiniTokenGrid({ x, y, w, h, layers, highlighted, active }: {
  x: number; y: number; w: number; h: number;
  layers: number; highlighted?: number; active?: boolean;
}) {
  const cellH = h / layers;
  const steps = 12;
  const cellW = w / steps;
  const palette = [COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple, COLORS.red];
  let seed = 13;
  const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  return (
    <motion.g initial={{ opacity: 0.25 }} animate={{ opacity: active ? 1 : 0.25 }} transition={{ duration: 0.4 }}>
      {Array.from({ length: layers }, (_, l) =>
        Array.from({ length: steps }, (_, s) => {
          const isHighlighted = highlighted !== undefined ? l < highlighted : true;
          const idx = Math.floor(rng() * palette.length);
          return (
            <rect key={`${l}-${s}`}
              x={x + s * cellW} y={y + l * cellH}
              width={cellW - 1} height={cellH - 1} rx={1}
              fill={isHighlighted ? palette[idx] : COLORS.masked}
              opacity={isHighlighted ? 0.7 : 0.3} />
          );
        })
      )}
      {/* Layer labels */}
      {highlighted !== undefined && highlighted <= layers && (
        <rect x={x + w + 4} y={y + (highlighted - 1) * cellH}
          width={3} height={cellH} rx={1} fill={COLORS.orange} />
      )}
    </motion.g>
  );
}

export default function VALLEPipeline({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      steps: [
        { title: '输入编码', desc: '文本转音素 + 3 秒语音提示通过 EnCodec → 8 层 codec token' },
        { title: 'AR 阶段', desc: 'AR 模型自回归预测第 1 层 token（从左到右，逐个生成）' },
        { title: 'NAR 阶段', desc: 'NAR 模型并行预测第 2-8 层 token（以第 1 层为条件）' },
        { title: '解码输出', desc: '完整 8 层 token → EnCodec 解码器 → 高质量波形' },
      ],
      textInput: '文本 (音素)',
      audioPrompt: '3s 语音提示',
      encodec: 'EnCodec',
      codecTokens: '8 层 Codec Tokens',
      arModel: 'AR 模型',
      arDesc: '自回归 (左→右)',
      layer1: '第 1 层 tokens',
      narModel: 'NAR 模型',
      narDesc: '非自回归 (并行)',
      layers28: '第 2-8 层 tokens',
      decoder: 'EnCodec 解码器',
      waveform: '输出波形',
      keyInsight: '核心洞见: TTS 即语言建模',
      promptLabel: '说话人身份',
      l1Label: 'Layer 1: 语音结构',
      l28Label: 'Layer 2-8: 细节',
    },
    en: {
      steps: [
        { title: 'Input Encoding', desc: 'Text → phonemes + 3s audio prompt → EnCodec → 8-layer codec tokens' },
        { title: 'AR Stage', desc: 'AR model autoregressively predicts Layer 1 tokens (left-to-right)' },
        { title: 'NAR Stage', desc: 'NAR model predicts Layers 2-8 tokens in parallel (conditioned on Layer 1)' },
        { title: 'Decode Output', desc: 'Complete 8-layer tokens → EnCodec decoder → high-quality waveform' },
      ],
      textInput: 'Text (Phonemes)',
      audioPrompt: '3s Audio Prompt',
      encodec: 'EnCodec',
      codecTokens: '8-layer Codec Tokens',
      arModel: 'AR Model',
      arDesc: 'Autoregressive (L→R)',
      layer1: 'Layer 1 tokens',
      narModel: 'NAR Model',
      narDesc: 'Non-autoregressive',
      layers28: 'Layers 2-8 tokens',
      decoder: 'EnCodec Decoder',
      waveform: 'Output Waveform',
      keyInsight: 'Key insight: TTS as language modeling',
      promptLabel: 'Speaker identity',
      l1Label: 'Layer 1: speech structure',
      l28Label: 'Layers 2-8: details',
    },
  }[locale]!;

  const stepsData = t.steps.map((s, i) => ({
    title: s.title,
    content: (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="valle-arrow" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Step description */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={COLORS.dark}>{s.desc}</text>

        {/* Input section */}
        <FlowBox x={20} y={50} w={120} h={40} label={t.textInput}
          fill={COLORS.bgAlt} stroke={COLORS.mid} active={i >= 0} />
        <FlowBox x={20} y={100} w={120} h={40} label={t.audioPrompt}
          fill={i >= 0 ? COLORS.highlight : COLORS.bgAlt}
          stroke={i >= 0 ? COLORS.orange : COLORS.mid} active={i >= 0} />
        {i >= 0 && (
          <text x={80} y={155} textAnchor="middle" fontSize="7" fill={COLORS.orange}>{t.promptLabel}</text>
        )}

        {/* EnCodec encoder */}
        <Arrow x1={140} y1={120} x2={168} y2={120} active={i >= 0} />
        <FlowBox x={170} y={95} w={100} h={50} label={t.encodec} sublabel={t.codecTokens}
          fill={i >= 0 ? '#e8f5e9' : COLORS.bgAlt}
          stroke={i >= 0 ? COLORS.green : COLORS.mid} active={i >= 0} />

        {/* Codec token grid */}
        <Arrow x1={270} y1={120} x2={298} y2={120} active={i >= 0} />
        <MiniTokenGrid x={300} y={90} w={120} h={72}
          layers={8} highlighted={i === 0 ? 8 : i === 1 ? 1 : i >= 2 ? 8 : 0}
          active={i >= 0} />
        {i >= 0 && (
          <>
            <text x={360} y={82} textAnchor="middle" fontSize="8" fontWeight="500"
              fill={COLORS.dark}>{t.codecTokens}</text>
          </>
        )}

        {/* AR model stage */}
        <Arrow x1={420} y1={95} x2={448} y2={95} active={i >= 1} />
        <FlowBox x={450} y={70} w={120} h={50} label={t.arModel} sublabel={t.arDesc}
          fill={i >= 1 ? COLORS.valid : COLORS.bgAlt}
          stroke={i >= 1 ? COLORS.primary : COLORS.mid} active={i >= 1} />
        {i >= 1 && (
          <text x={510} y={135} textAnchor="middle" fontSize="8" fill={COLORS.primary}>{t.layer1}</text>
        )}

        {/* AR step animation: left-to-right arrows */}
        {i === 1 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {Array.from({ length: 5 }, (_, j) => (
              <motion.rect key={j}
                x={460 + j * 18} y={148} width={14} height={10} rx={2}
                fill={COLORS.primary}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + j * 0.15 }}
              />
            ))}
            <text x={510} y={172} textAnchor="middle" fontSize="7" fill={COLORS.primary}>→ → → → →</text>
          </motion.g>
        )}

        {/* NAR model stage */}
        <Arrow x1={420} y1={140} x2={448} y2={170} active={i >= 2} />
        <FlowBox x={450} y={150} w={120} h={50} label={t.narModel} sublabel={t.narDesc}
          fill={i >= 2 ? '#f3e5f5' : COLORS.bgAlt}
          stroke={i >= 2 ? COLORS.purple : COLORS.mid} active={i >= 2} />
        {i >= 2 && (
          <text x={510} y={215} textAnchor="middle" fontSize="8" fill={COLORS.purple}>{t.layers28}</text>
        )}

        {/* NAR parallel generation */}
        {i === 2 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {Array.from({ length: 7 }, (_, j) => (
              <motion.rect key={j}
                x={580} y={225 + j * 10} width={80} height={8} rx={2}
                fill={COLORS.purple} opacity={0.4 + j * 0.08}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              />
            ))}
          </motion.g>
        )}

        {/* Decoder output */}
        <Arrow x1={570} y1={120} x2={618} y2={120} active={i >= 3} />
        <FlowBox x={620} y={95} w={100} h={50} label={t.decoder}
          fill={i >= 3 ? '#e8f5e9' : COLORS.bgAlt}
          stroke={i >= 3 ? COLORS.green : COLORS.mid} active={i >= 3} />

        {/* Output waveform */}
        {i >= 3 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Arrow x1={720} y1={120} x2={738} y2={120} active />
            <rect x={740} y={100} width={50} height={40} rx={4}
              fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth={1.5} />
            {/* Mini waveform */}
            <polyline
              points={Array.from({ length: 20 }, (_, j) => {
                const px = 743 + j * 2.2;
                const py = 120 + Math.sin(j * 0.8) * Math.sin(j * 0.3) * 12;
                return `${px},${py}`;
              }).join(' ')}
              fill="none" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={765} y={155} textAnchor="middle" fontSize="8" fill={COLORS.green}>{t.waveform}</text>
          </motion.g>
        )}

        {/* Key insight banner */}
        <rect x={W / 2 - 150} y={H - 40} width={300} height={28} rx={6}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={W / 2} y={H - 22} textAnchor="middle" fontSize="10" fontWeight="700"
          fill={COLORS.orange}>{t.keyInsight}</text>
      </svg>
    ),
  }));

  return (
    <div className="my-6">
      <StepNavigator steps={stepsData} locale={locale} />
    </div>
  );
}
