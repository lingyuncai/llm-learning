import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

function Waveform({ x, y, w, h, complex }: {
  x: number; y: number; w: number; h: number; complex?: boolean;
}) {
  const mid = y + h / 2;
  const points: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const px = x + (i / 80) * w;
    let amp: number;
    if (complex) {
      // Music: multi-frequency, richer harmonics
      amp = (Math.sin(i * 0.3) * 0.4 + Math.sin(i * 0.7) * 0.3 +
        Math.sin(i * 1.5) * 0.2 + Math.sin(i * 2.3) * 0.1) * (h * 0.4);
    } else {
      // Speech: simpler envelope with pauses
      const envelope = Math.max(0, Math.sin(i * 0.12)) * (i > 50 && i < 60 ? 0.1 : 1);
      amp = Math.sin(i * 0.6) * envelope * (h * 0.35);
    }
    points.push(`${px},${mid - amp}`);
  }
  return (
    <polyline points={points.join(' ')} fill="none"
      stroke={complex ? COLORS.purple : COLORS.primary} strokeWidth={1.5} />
  );
}

function Spectrogram({ x, y, w, h, complex }: {
  x: number; y: number; w: number; h: number; complex?: boolean;
}) {
  const cols = 24, rows = 10;
  const cw = w / cols, ch = h / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let energy: number;
      if (complex) {
        // Music: wide frequency, rich harmonics across all bands
        energy = 0.3 + 0.7 * Math.abs(Math.sin(c * 0.4 + r * 0.6) * Math.cos(r * 0.3 + c * 0.2));
      } else {
        // Speech: narrow frequency band, formant structure
        const formant = Math.exp(-(r - 3) * (r - 3) / 8) + Math.exp(-(r - 6) * (r - 6) / 12) * 0.4;
        const pause = (c > 10 && c < 13) ? 0.05 : 1;
        energy = formant * pause * (0.5 + 0.5 * Math.sin(c * 0.5));
      }
      const intensity = Math.floor(energy * 200 + 40);
      let color: string = complex
        ? `rgb(${Math.floor(intensity * 0.5)}, ${Math.floor(intensity * 0.3)}, ${intensity})`
        : `rgb(${intensity}, ${Math.floor(intensity * 0.4)}, ${Math.floor(intensity * 0.2)})`;
      cells.push(
        <rect key={`${r}-${c}`} x={x + c * cw} y={y + r * ch}
          width={cw} height={ch} fill={color} stroke={COLORS.bg} strokeWidth={0.3} />
      );
    }
  }
  return <g>{cells}</g>;
}

export default function MusicVsSpeechComparison({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '语音 vs 音乐：信号特征对比',
      speech: '语音',
      music: '音乐',
      waveformLabel: '波形',
      spectrogramLabel: '频谱图',
      feature: '特征',
      freqRange: '频率范围',
      speechFreq: '窄 (85-8kHz)',
      musicFreq: '宽 (20Hz-20kHz)',
      duration: '典型时长',
      speechDur: '~5s (句子)',
      musicDur: '~3min (乐曲)',
      sources: '声源',
      speechSrc: '单一 (人声)',
      musicSrc: '多重 (乐器+人声)',
      structure: '结构',
      speechStruct: '语言学 (音素/词/句)',
      musicStruct: '音乐学 (节拍/和弦/段落)',
      complexity: '建模难度',
      speechComp: '较低',
      musicComp: '极高',
    },
    en: {
      title: 'Speech vs Music: Signal Comparison',
      speech: 'Speech',
      music: 'Music',
      waveformLabel: 'Waveform',
      spectrogramLabel: 'Spectrogram',
      feature: 'Feature',
      freqRange: 'Freq Range',
      speechFreq: 'Narrow (85-8kHz)',
      musicFreq: 'Wide (20Hz-20kHz)',
      duration: 'Typical Duration',
      speechDur: '~5s (sentence)',
      musicDur: '~3min (song)',
      sources: 'Sources',
      speechSrc: 'Single (voice)',
      musicSrc: 'Multiple (instruments+voice)',
      structure: 'Structure',
      speechStruct: 'Linguistic (phoneme/word/sentence)',
      musicStruct: 'Musical (beat/chord/section)',
      complexity: 'Modeling Difficulty',
      speechComp: 'Moderate',
      musicComp: 'Very High',
    },
  }[locale]!;

  const [activeTab, setActiveTab] = useState<'speech' | 'music'>('speech');

  const isSpeech = activeTab === 'speech';
  const leftX = 40, rightX = 420;
  const panelW = 340;

  return (
    <div className="my-6">
      <div className="flex gap-2 mb-3">
        {(['speech', 'music'] as const).map((tab) => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {tab === 'speech' ? t.speech : t.music}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700"
          fill={COLORS.dark}>{t.title}</text>

        {/* Speech panel */}
        <motion.g animate={{ opacity: isSpeech ? 1 : 0.2 }} transition={{ duration: 0.3 }}>
          <text x={leftX + panelW / 2} y={52} textAnchor="middle" fontSize="12"
            fontWeight="600" fill={COLORS.primary}>{t.speech}</text>

          {/* Waveform */}
          <rect x={leftX} y={62} width={panelW} height={60} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <Waveform x={leftX + 5} y={62} w={panelW - 10} h={60} />
          <text x={leftX + 4} y={58} fontSize="8" fill={COLORS.mid}>{t.waveformLabel}</text>

          {/* Spectrogram */}
          <rect x={leftX} y={135} width={panelW} height={80} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <Spectrogram x={leftX + 2} y={137} w={panelW - 4} h={76} />
          <text x={leftX + 4} y={131} fontSize="8" fill={COLORS.mid}>{t.spectrogramLabel}</text>
        </motion.g>

        {/* Music panel */}
        <motion.g animate={{ opacity: !isSpeech ? 1 : 0.2 }} transition={{ duration: 0.3 }}>
          <text x={rightX + panelW / 2} y={52} textAnchor="middle" fontSize="12"
            fontWeight="600" fill={COLORS.purple}>{t.music}</text>

          {/* Waveform */}
          <rect x={rightX} y={62} width={panelW} height={60} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <Waveform x={rightX + 5} y={62} w={panelW - 10} h={60} complex />
          <text x={rightX + 4} y={58} fontSize="8" fill={COLORS.mid}>{t.waveformLabel}</text>

          {/* Spectrogram */}
          <rect x={rightX} y={135} width={panelW} height={80} rx={4}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <Spectrogram x={rightX + 2} y={137} w={panelW - 4} h={76} complex />
          <text x={rightX + 4} y={131} fontSize="8" fill={COLORS.mid}>{t.spectrogramLabel}</text>
        </motion.g>

        {/* VS divider */}
        <text x={W / 2} y={140} textAnchor="middle" fontSize="16" fontWeight="800"
          fill={COLORS.light}>VS</text>

        {/* Comparison table */}
        <g transform="translate(40, 235)">
          {/* Header */}
          <rect x={0} y={0} width={720} height={28} rx={4} fill={COLORS.dark} />
          <text x={120} y={18} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.bg}>{t.feature}</text>
          <text x={360} y={18} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.bg}>{t.speech}</text>
          <text x={600} y={18} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.bg}>{t.music}</text>

          {/* Rows */}
          {[
            [t.freqRange, t.speechFreq, t.musicFreq],
            [t.duration, t.speechDur, t.musicDur],
            [t.sources, t.speechSrc, t.musicSrc],
            [t.structure, t.speechStruct, t.musicStruct],
            [t.complexity, t.speechComp, t.musicComp],
          ].map(([feat, sp, mu], i) => (
            <g key={i}>
              <rect x={0} y={30 + i * 26} width={720} height={26} rx={0}
                fill={i % 2 === 0 ? COLORS.bgAlt : COLORS.bg} />
              <text x={120} y={47 + i * 26} textAnchor="middle" fontSize="9"
                fill={COLORS.dark}>{feat}</text>
              <text x={360} y={47 + i * 26} textAnchor="middle" fontSize="9"
                fill={COLORS.primary}>{sp}</text>
              <text x={600} y={47 + i * 26} textAnchor="middle" fontSize="9"
                fill={COLORS.purple}>{mu}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
