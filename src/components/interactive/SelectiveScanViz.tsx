import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface TokenData {
  text: string;
  delta: number; // 0-1 normalized
  isContent: boolean;
  stateContrib: number[]; // 4-dim state contribution
}

const TOKENS: TokenData[] = [
  { text: 'The',  delta: 0.15, isContent: false, stateContrib: [0.02, -0.01, 0.01, 0.00] },
  { text: 'cat',  delta: 0.85, isContent: true,  stateContrib: [0.31, 0.18, -0.12, 0.24] },
  { text: 'sat',  delta: 0.72, isContent: true,  stateContrib: [0.15, 0.28, 0.09, -0.11] },
  { text: 'on',   delta: 0.12, isContent: false, stateContrib: [0.01, -0.02, 0.01, 0.01] },
  { text: 'the',  delta: 0.10, isContent: false, stateContrib: [0.01, 0.00, -0.01, 0.01] },
  { text: 'mat',  delta: 0.88, isContent: true,  stateContrib: [0.22, -0.15, 0.33, 0.19] },
];

const STATE_DIM = 4;

export default function SelectiveScanViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [selected, setSelected] = useState<number | null>(null);

  const t = {
    zh: {
      title: 'Mamba 选择性机制：Δ 控制记忆与遗忘',
      subtitle: '点击 token 查看其对状态的影响',
      deltaLabel: 'Δ 值',
      largeDelta: '大 Δ = 记住（内容词）',
      smallDelta: '小 Δ = 遗忘（功能词）',
      stateProcessed: '状态 (处理到 "{token}")',
      stateCumulative: '累积状态 (全部 tokens)',
      annotation: '选择性 Δ 让 Mamba 自适应地关注重要 token，忽略噪声 — 类似 Attention 的"软选择"',
    },
    en: {
      title: 'Mamba Selective Mechanism: Δ Controls Memory & Forgetting',
      subtitle: 'Click token to see its impact on state',
      deltaLabel: 'Δ value',
      largeDelta: 'Large Δ = Remember (content words)',
      smallDelta: 'Small Δ = Forget (function words)',
      stateProcessed: 'State (processed to "{token}")',
      stateCumulative: 'Cumulative state (all tokens)',
      annotation: 'Selective Δ allows Mamba to adaptively focus on important tokens and ignore noise — similar to Attention\'s "soft selection"',
    },
  }[locale];

  const tokenW = 70;
  const tokenH = 32;
  const tokensX = (W - TOKENS.length * tokenW) / 2;
  const tokensY = 60;
  const deltaY = 140;
  const deltaMaxH = 80;
  const stateY = 280;
  const stateCellW = 60;
  const stateCellH = 28;

  // Cumulative state up to selected token
  const cumulativeState = Array.from({ length: STATE_DIM }, () => 0);
  const limit = selected !== null ? selected + 1 : TOKENS.length;
  for (let t = 0; t < limit; t++) {
    const decay = Math.pow(0.9, limit - 1 - t); // older tokens decay
    for (let d = 0; d < STATE_DIM; d++) {
      cumulativeState[d] += TOKENS[t].stateContrib[d] * TOKENS[t].delta * decay;
    }
  }
  const maxState = Math.max(...cumulativeState.map(Math.abs), 0.01);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {/* Token row */}
      {TOKENS.map((tok, i) => {
        const x = tokensX + i * tokenW;
        const isActive = selected === i;
        return (
          <g key={i} onClick={() => setSelected(selected === i ? null : i)} cursor="pointer">
            <rect x={x + 2} y={tokensY} width={tokenW - 4} height={tokenH} rx={5}
              fill={isActive ? COLORS.highlight : COLORS.bgAlt}
              stroke={isActive ? COLORS.primary : COLORS.light}
              strokeWidth={isActive ? 2.5 : 1} />
            <text x={x + tokenW / 2} y={tokensY + 20} textAnchor="middle"
              fontSize="13" fontWeight={isActive ? '700' : '500'}
              fill={isActive ? COLORS.primary : COLORS.dark} fontFamily={FONTS.mono}>
              {tok.text}
            </text>
          </g>
        );
      })}

      {/* Delta bars */}
      <text x={tokensX - 5} y={deltaY + deltaMaxH / 2} fontSize="10" fontWeight="600"
        fill={COLORS.mid} fontFamily={FONTS.sans} textAnchor="end">{t.deltaLabel}</text>
      {TOKENS.map((tok, i) => {
        const x = tokensX + i * tokenW;
        const barH = tok.delta * deltaMaxH;
        const color = tok.delta > 0.5 ? COLORS.green : COLORS.red;
        const isActive = selected === i;
        return (
          <g key={`d-${i}`}>
            <rect x={x + 15} y={deltaY + deltaMaxH - barH} width={tokenW - 30} height={barH}
              fill={color} opacity={isActive ? 1 : 0.6} rx={3} />
            <text x={x + tokenW / 2} y={deltaY + deltaMaxH - barH - 5} textAnchor="middle"
              fontSize="9" fontWeight="600" fill={color} fontFamily={FONTS.mono}>
              {tok.delta.toFixed(2)}
            </text>
          </g>
        );
      })}
      {/* Delta legend */}
      <text x={tokensX} y={deltaY + deltaMaxH + 18} fontSize="9"
        fill={COLORS.green} fontFamily={FONTS.sans}>■ {t.largeDelta}</text>
      <text x={tokensX + 200} y={deltaY + deltaMaxH + 18} fontSize="9"
        fill={COLORS.red} fontFamily={FONTS.sans}>■ {t.smallDelta}</text>

      {/* State heatmap */}
      <text x={W / 2} y={stateY - 12} textAnchor="middle" fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {selected !== null
          ? t.stateProcessed.replace('{token}', TOKENS[selected].text)
          : t.stateCumulative}
      </text>
      {cumulativeState.map((val, d) => {
        const x = (W - STATE_DIM * stateCellW) / 2 + d * stateCellW;
        const t = Math.abs(val) / maxState;
        const bg = val >= 0
          ? `rgba(21,101,192,${0.15 + t * 0.6})`
          : `rgba(198,40,40,${0.15 + t * 0.6})`;
        return (
          <g key={`s-${d}`}>
            <rect x={x + 2} y={stateY} width={stateCellW - 4} height={stateCellH}
              fill={bg} stroke={COLORS.light} strokeWidth="1" rx="4" />
            <text x={x + stateCellW / 2} y={stateY + stateCellH / 2 + 4}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.mono}>
              {val.toFixed(3)}
            </text>
            <text x={x + stateCellW / 2} y={stateY + stateCellH + 14}
              textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
              dim {d}
            </text>
          </g>
        );
      })}

      {/* Annotation */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.annotation}
      </text>
    </svg>
  );
}
