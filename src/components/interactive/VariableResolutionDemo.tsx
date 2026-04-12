import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

interface ResConfig {
  label: string;
  w: number;
  h: number;
  duration: number;
  desc: string;
}

export default function VariableResolutionDemo({ locale = 'zh' }: Props) {
  const [selectedConfig, setSelectedConfig] = useState(0);

  const t = {
    zh: {
      title: 'Sora 的可变分辨率与宽高比',
      subtitle: '同一模型，无需裁剪，直接处理不同尺寸',
      tokenCalc: 'Token 数',
      resolution: '分辨率',
      duration: '时长',
      seconds: '秒',
      configs: [
        { label: '1080p 横屏', w: 1920, h: 1080, duration: 10, desc: '标准电影宽高比 (16:9)' },
        { label: '720p 竖屏', w: 720, h: 1280, duration: 15, desc: '手机竖屏视频 (9:16)' },
        { label: '正方形', w: 1080, h: 1080, duration: 8, desc: '社交媒体格式 (1:1)' },
        { label: '超宽屏', w: 2560, h: 1080, duration: 5, desc: '电影级超宽比例 (21:9)' },
        { label: '短视频竖屏', w: 608, h: 1080, duration: 20, desc: '短视频平台格式' },
      ] as ResConfig[],
    },
    en: {
      title: "Sora's Variable Resolution & Aspect Ratio",
      subtitle: 'Same model, no cropping, handles any size natively',
      tokenCalc: 'Tokens',
      resolution: 'Resolution',
      duration: 'Duration',
      seconds: 'sec',
      configs: [
        { label: '1080p Landscape', w: 1920, h: 1080, duration: 10, desc: 'Standard cinematic (16:9)' },
        { label: '720p Portrait', w: 720, h: 1280, duration: 15, desc: 'Mobile vertical video (9:16)' },
        { label: 'Square', w: 1080, h: 1080, duration: 8, desc: 'Social media format (1:1)' },
        { label: 'Ultra-wide', w: 2560, h: 1080, duration: 5, desc: 'Cinematic ultra-wide (21:9)' },
        { label: 'Short Vertical', w: 608, h: 1080, duration: 20, desc: 'Short-form video format' },
      ] as ResConfig[],
    },
  }[locale]!;

  const config = t.configs[selectedConfig];
  const patchSize = 32;
  const patchT = 2;
  const fps = 24;
  const totalFrames = config.duration * fps;
  const spatialTokens = Math.ceil(config.w / patchSize) * Math.ceil(config.h / patchSize);
  const temporalPatches = Math.ceil(totalFrames / patchT);
  const totalTokens = spatialTokens * temporalPatches;

  // Scale for display
  const displayMaxW = 320, displayMaxH = 220;
  const scale = Math.min(displayMaxW / config.w, displayMaxH / config.h);
  const displayW = config.w * scale;
  const displayH = config.h * scale;
  const displayX = W / 2 - displayW / 2;
  const displayY = 100 + (displayMaxH - displayH) / 2;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }}>
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={48} textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Config selector buttons */}
        {t.configs.map((cfg, i) => {
          const btnW = 130;
          const btnH = 24;
          const perRow = 5;
          const bx = (W - perRow * (btnW + 8)) / 2 + i * (btnW + 8);
          const by = 62;

          return (
            <g key={i} onClick={() => setSelectedConfig(i)} style={{ cursor: 'pointer' }}>
              <rect x={bx} y={by} width={btnW} height={btnH} rx={12}
                fill={selectedConfig === i ? COLORS.primary : COLORS.bg}
                stroke={selectedConfig === i ? COLORS.primary : COLORS.light}
                strokeWidth={1.5} />
              <text x={bx + btnW / 2} y={by + 16} textAnchor="middle"
                fontSize="9" fontWeight="600"
                fill={selectedConfig === i ? COLORS.bg : COLORS.dark}>
                {cfg.label}
              </text>
            </g>
          );
        })}

        {/* Resolution display area background */}
        <rect x={displayX - 15} y={90} width={displayMaxW + 30} height={displayMaxH + 20} rx={8}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

        {/* Animated resolution rectangle */}
        <motion.rect
          x={W / 2 - displayW / 2}
          y={100 + (displayMaxH - displayH) / 2}
          width={displayW}
          height={displayH}
          rx={4}
          fill={COLORS.primary}
          fillOpacity={0.15}
          stroke={COLORS.primary}
          strokeWidth={2}
          animate={{
            width: displayW,
            height: displayH,
            x: W / 2 - displayW / 2,
            y: 100 + (displayMaxH - displayH) / 2,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />

        {/* Resolution label inside */}
        <motion.text
          x={W / 2}
          y={100 + displayMaxH / 2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="14" fontWeight="700" fill={COLORS.primary}
          animate={{
            y: 100 + displayMaxH / 2,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          {config.w} × {config.h}
        </motion.text>

        {/* Aspect ratio indicator */}
        <motion.text
          x={W / 2}
          y={100 + displayMaxH / 2 + 18}
          textAnchor="middle" fontSize="10" fill={COLORS.mid}
          animate={{
            y: 100 + displayMaxH / 2 + 18,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          {config.desc}
        </motion.text>

        {/* Stats panel */}
        <motion.g
          key={selectedConfig}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Info cards */}
          {[
            { label: t.resolution, value: `${config.w}×${config.h}`, color: COLORS.primary },
            { label: t.duration, value: `${config.duration} ${t.seconds} (${totalFrames} frames)`, color: COLORS.green },
            { label: t.tokenCalc, value: totalTokens.toLocaleString(), color: COLORS.purple },
          ].map((card, i) => {
            const cardW = 220;
            const cardX = 60 + i * (cardW + 20);
            const cardY = H - 105;

            return (
              <g key={i}>
                <rect x={cardX} y={cardY} width={cardW} height={50} rx={6}
                  fill={COLORS.bg} stroke={card.color} strokeWidth={1} strokeOpacity={0.3} />
                <text x={cardX + 12} y={cardY + 18} fontSize="9" fill={COLORS.mid}>
                  {card.label}
                </text>
                <text x={cardX + 12} y={cardY + 38} fontSize="14" fontWeight="700" fill={card.color}>
                  {card.value}
                </text>
              </g>
            );
          })}

          {/* Calculation breakdown */}
          <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
            ({config.w}/{patchSize} × {config.h}/{patchSize}) × ({totalFrames}/{patchT}) = {spatialTokens} × {temporalPatches} = {totalTokens.toLocaleString()} tokens
          </text>
        </motion.g>
      </svg>
    </div>
  );
}
