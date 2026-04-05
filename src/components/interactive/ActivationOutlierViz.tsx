import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;
const TOKENS = 8;
const CHANNELS = 16;
const OUTLIER_CHANNELS = [5, 12];

// Generate deterministic activations (seeded by index)
function generateActivations(): number[][] {
  const act: number[][] = [];
  for (let i = 0; i < TOKENS; i++) {
    const row: number[] = [];
    for (let j = 0; j < CHANNELS; j++) {
      const base = Math.sin(i * 7 + j * 13) * 3; // -3 to 3
      if (OUTLIER_CHANNELS.includes(j)) {
        row.push(base + 60 + Math.sin(i * 3 + j) * 20); // 37 to 83
      } else {
        row.push(base); // -3 to 3
      }
    }
    act.push(row);
  }
  return act;
}

const ACT = generateActivations();

function quantErrors(act: number[][], mode: 'per-tensor' | 'per-channel'): number[][] {
  if (mode === 'per-tensor') {
    let maxAbs = 0;
    for (const row of act) for (const v of row) maxAbs = Math.max(maxAbs, Math.abs(v));
    const scale = maxAbs / 127;
    return act.map(row => row.map(v => Math.abs(v - Math.round(v / scale) * scale)));
  } else {
    const scales: number[] = [];
    for (let j = 0; j < CHANNELS; j++) {
      let maxAbs = 0;
      for (let i = 0; i < TOKENS; i++) maxAbs = Math.max(maxAbs, Math.abs(act[i][j]));
      scales.push(maxAbs / 127);
    }
    return act.map(row => row.map((v, j) => Math.abs(v - Math.round(v / scales[j]) * scales[j])));
  }
}

export default function ActivationOutlierViz() {
  const [mode, setMode] = useState<'per-tensor' | 'per-channel'>('per-tensor');

  const errors = useMemo(() => quantErrors(ACT, mode), [mode]);
  const maxAct = Math.max(...ACT.flat().map(Math.abs));
  const maxErr = Math.max(...errors.flat());

  const cellW = 28;
  const cellH = 18;
  const mapX = 50;
  const actY = 55;
  const errY = 255;

  const actColor = (val: number) => {
    const t = Math.abs(val) / maxAct;
    const r = Math.round(26 + t * 200);
    const g = Math.round(26 + (1 - t) * 100);
    const b = Math.round(46 + (1 - t) * 100);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const errColorFn = (err: number) => {
    if (maxErr === 0) return COLORS.green;
    const t = err / maxErr;
    if (t > 0.5) return COLORS.red;
    if (t > 0.2) return COLORS.orange;
    return COLORS.green;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Activation Outlier 对量化的影响
      </text>

      {/* Activation heatmap */}
      <text x={mapX} y={actY - 8} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Activation Matrix ({TOKENS} tokens × {CHANNELS} channels)
      </text>
      {ACT.map((row, i) => row.map((val, j) => (
        <rect key={`a-${i}-${j}`} x={mapX + j * cellW} y={actY + i * cellH}
          width={cellW - 1} height={cellH - 1} fill={actColor(val)}
          stroke={COLORS.light} strokeWidth="0.5" />
      )))}
      {/* Outlier markers */}
      {OUTLIER_CHANNELS.map(ch => (
        <g key={ch}>
          <rect x={mapX + ch * cellW} y={actY} width={cellW - 1}
            height={cellH * TOKENS - 1} fill="none" stroke={COLORS.red} strokeWidth="2" />
          <text x={mapX + ch * cellW + cellW / 2} y={actY - 2} textAnchor="middle"
            fontSize="8" fontWeight="700" fill={COLORS.red} fontFamily={FONTS.sans}>
            Outlier
          </text>
        </g>
      ))}

      {/* Toggle buttons */}
      {(['per-tensor', 'per-channel'] as const).map((m, i) => (
        <g key={m} onClick={() => setMode(m)} cursor="pointer">
          <rect x={140 + i * 170} y={actY + cellH * TOKENS + 12} width={150} height={26} rx={5}
            fill={mode === m ? COLORS.primary : COLORS.bg}
            stroke={mode === m ? COLORS.primary : COLORS.light} strokeWidth="1.5" />
          <text x={215 + i * 170} y={actY + cellH * TOKENS + 30} textAnchor="middle"
            fontSize="11" fontWeight={mode === m ? '700' : '400'}
            fill={mode === m ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {m === 'per-tensor' ? 'Per-Tensor' : 'Per-Channel'}
          </text>
        </g>
      ))}

      {/* Error heatmap */}
      <text x={mapX} y={errY - 8} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        量化误差 ({mode})
      </text>
      {errors.map((row, i) => row.map((err, j) => (
        <rect key={`e-${i}-${j}`} x={mapX + j * cellW} y={errY + i * cellH}
          width={cellW - 1} height={cellH - 1} fill={errColorFn(err)}
          stroke={COLORS.light} strokeWidth="0.5" />
      )))}

      {/* Annotation */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {mode === 'per-tensor'
          ? 'Per-tensor: Outlier 拉大 scale → 正常值精度崩溃 (红色)'
          : 'Per-channel: 每个 channel 独立 scale → 误差均匀且小 (绿色)'}
      </text>
    </svg>
  );
}
