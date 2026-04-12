import React, { useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 350;
const MEL_BINS = 80;
const TIME_FRAMES = 200;

// Seeded PRNG for reproducibility
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate synthetic Mel spectrogram data mimicking speech patterns
function generateMelData(): number[][] {
  const rng = seededRandom(42);
  const data: number[][] = [];

  for (let m = 0; m < MEL_BINS; m++) {
    const row: number[] = [];
    for (let t = 0; t < TIME_FRAMES; t++) {
      // Base energy decreases with frequency
      let energy = Math.exp(-m * 0.04) * 0.6;

      // Simulate formants (speech resonances) around certain mel bins
      const formant1 = Math.exp(-((m - 8) ** 2) / 30) * 0.5;
      const formant2 = Math.exp(-((m - 22) ** 2) / 50) * 0.35;
      const formant3 = Math.exp(-((m - 40) ** 2) / 80) * 0.2;
      energy += formant1 + formant2 + formant3;

      // Simulate harmonics (periodic pitch structure)
      const pitch = Math.sin(m * 0.6) * 0.15 * Math.max(0, Math.sin(t * 0.08));
      energy += Math.max(0, pitch);

      // Speech envelope: silence gaps
      const envelope = (() => {
        if (t < 15 || t > 185) return 0.05; // silence at edges
        if (t > 70 && t < 85) return 0.1; // pause between words
        if (t > 130 && t < 140) return 0.08; // another pause
        return 0.6 + 0.4 * Math.sin(t * 0.04);
      })();
      energy *= envelope;

      // Add noise
      energy += rng() * 0.08;

      row.push(Math.max(0, Math.min(1, energy)));
    }
    data.push(row);
  }
  return data;
}

// Map energy [0,1] to color using a warm palette
function energyToColor(e: number): string {
  // Dark blue → blue → cyan → yellow → red → white
  if (e < 0.1) return `rgb(${Math.floor(20 + e * 200)}, ${Math.floor(10 + e * 100)}, ${Math.floor(60 + e * 200)})`;
  if (e < 0.3) return `rgb(${Math.floor(40 + e * 300)}, ${Math.floor(30 + e * 250)}, ${Math.floor(120 - e * 100)})`;
  if (e < 0.5) return `rgb(${Math.floor(100 + e * 300)}, ${Math.floor(80 + e * 200)}, ${Math.floor(20)})`;
  if (e < 0.7) return `rgb(${Math.floor(200 + e * 80)}, ${Math.floor(120 + e * 100)}, ${Math.floor(10)})`;
  return `rgb(${Math.min(255, Math.floor(220 + e * 40))}, ${Math.floor(60 + e * 100)}, ${Math.floor(20 + e * 30)})`;
}

export default function MelSpectrogramVisualization({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Mel 频谱图可视化',
      xLabel: '时间 (s)',
      yLabel: 'Mel 频率 (Hz)',
      annotation: 'Whisper 输入: 30s × 80 mel bins = (3000, 80)',
      lowFreq: '0',
      midFreq: '~1kHz',
      highFreq: '~8kHz',
      silence: '静音',
      speech: '语音',
      pause: '停顿',
    },
    en: {
      title: 'Mel Spectrogram Visualization',
      xLabel: 'Time (s)',
      yLabel: 'Mel Frequency (Hz)',
      annotation: 'Whisper input: 30s × 80 mel bins = (3000, 80)',
      lowFreq: '0',
      midFreq: '~1kHz',
      highFreq: '~8kHz',
      silence: 'Silence',
      speech: 'Speech',
      pause: 'Pause',
    },
  }[locale]!;

  const melData = useMemo(() => generateMelData(), []);

  // Spectrogram area
  const padLeft = 70, padRight = 30, padTop = 40, padBottom = 60;
  const specW = W - padLeft - padRight;
  const specH = H - padTop - padBottom;
  const cellW = specW / TIME_FRAMES;
  const cellH = specH / MEL_BINS;

  // Build heatmap as small rects
  const cells = useMemo(() => {
    const result: React.ReactNode[] = [];
    for (let m = 0; m < MEL_BINS; m++) {
      for (let ti = 0; ti < TIME_FRAMES; ti++) {
        const x = padLeft + ti * cellW;
        // Flip y axis: low frequency at bottom
        const y = padTop + (MEL_BINS - 1 - m) * cellH;
        result.push(
          <rect key={`${m}-${ti}`}
            x={x} y={y} width={cellW + 0.5} height={cellH + 0.5}
            fill={energyToColor(melData[m][ti])} />
        );
      }
    }
    return result;
  }, [melData, cellW, cellH]);

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700"
          fill={COLORS.dark}>{t.title}</text>

        {/* Background */}
        <rect x={padLeft} y={padTop} width={specW} height={specH}
          fill={COLORS.dark} />

        {/* Heatmap cells */}
        {cells}

        {/* Y-axis labels */}
        <text x={padLeft - 8} y={padTop + 8} textAnchor="end" fontSize="8"
          fill={COLORS.mid}>{t.highFreq}</text>
        <text x={padLeft - 8} y={padTop + specH / 2} textAnchor="end" fontSize="8"
          fill={COLORS.mid}>{t.midFreq}</text>
        <text x={padLeft - 8} y={padTop + specH - 2} textAnchor="end" fontSize="8"
          fill={COLORS.mid}>{t.lowFreq}</text>

        {/* Y-axis title */}
        <text x={16} y={padTop + specH / 2} textAnchor="middle" fontSize="10"
          fontWeight="600" fill={COLORS.dark}
          transform={`rotate(-90, 16, ${padTop + specH / 2})`}>
          {t.yLabel}
        </text>

        {/* X-axis labels */}
        <text x={padLeft} y={padTop + specH + 16} textAnchor="middle" fontSize="8"
          fill={COLORS.mid}>0</text>
        <text x={padLeft + specW * 0.25} y={padTop + specH + 16} textAnchor="middle" fontSize="8"
          fill={COLORS.mid}>0.5</text>
        <text x={padLeft + specW * 0.5} y={padTop + specH + 16} textAnchor="middle" fontSize="8"
          fill={COLORS.mid}>1.0</text>
        <text x={padLeft + specW * 0.75} y={padTop + specH + 16} textAnchor="middle" fontSize="8"
          fill={COLORS.mid}>1.5</text>
        <text x={padLeft + specW} y={padTop + specH + 16} textAnchor="middle" fontSize="8"
          fill={COLORS.mid}>2.0</text>

        {/* X-axis title */}
        <text x={padLeft + specW / 2} y={padTop + specH + 32} textAnchor="middle"
          fontSize="10" fontWeight="600" fill={COLORS.dark}>{t.xLabel}</text>

        {/* Annotations: speech regions */}
        <line x1={padLeft + (15 / TIME_FRAMES) * specW} y1={padTop - 4}
          x2={padLeft + (15 / TIME_FRAMES) * specW} y2={padTop + specH}
          stroke={COLORS.highlight} strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
        <text x={padLeft + (7 / TIME_FRAMES) * specW} y={padTop - 6} textAnchor="middle"
          fontSize="7" fill={COLORS.orange}>{t.silence}</text>

        <line x1={padLeft + (75 / TIME_FRAMES) * specW} y1={padTop - 4}
          x2={padLeft + (75 / TIME_FRAMES) * specW} y2={padTop + specH}
          stroke={COLORS.highlight} strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
        <text x={padLeft + (78 / TIME_FRAMES) * specW} y={padTop - 6} textAnchor="middle"
          fontSize="7" fill={COLORS.orange}>{t.pause}</text>

        {/* Annotation box */}
        <rect x={W / 2 - 160} y={H - 24} width={320} height={20} rx={4}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={W / 2} y={H - 11} textAnchor="middle" fontSize="9"
          fontWeight="600" fill={COLORS.orange}>{t.annotation}</text>
      </svg>
    </div>
  );
}
