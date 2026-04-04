import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

type QType = 'Q4_0' | 'Q4_K_S' | 'Q4_K_M' | 'Q5_K_M' | 'Q6_K' | 'Q8_0' | 'FP16';

interface QData {
  label: string;
  pplDelta: number; // perplexity increase vs FP16 (lower = better)
  tokensPerSec: number; // tokens/s on RTX 4090
  vramGB: number; // VRAM in GB for Qwen3-8B
  bpw: number;
}

const DATA: Record<QType, QData> = {
  FP16:   { label: 'FP16',    pplDelta: 0,     tokensPerSec: 45,  vramGB: 16.0, bpw: 16 },
  Q8_0:   { label: 'Q8_0',    pplDelta: 0.01,  tokensPerSec: 85,  vramGB: 8.5,  bpw: 8 },
  Q6_K:   { label: 'Q6_K',    pplDelta: 0.03,  tokensPerSec: 95,  vramGB: 6.6,  bpw: 6.6 },
  Q5_K_M: { label: 'Q5_K_M',  pplDelta: 0.05,  tokensPerSec: 105, vramGB: 5.7,  bpw: 5.5 },
  Q4_K_M: { label: 'Q4_K_M',  pplDelta: 0.08,  tokensPerSec: 115, vramGB: 4.9,  bpw: 4.5 },
  Q4_K_S: { label: 'Q4_K_S',  pplDelta: 0.10,  tokensPerSec: 118, vramGB: 4.6,  bpw: 4.5 },
  Q4_0:   { label: 'Q4_0',    pplDelta: 0.15,  tokensPerSec: 120, vramGB: 4.4,  bpw: 4 },
};

const TYPES: QType[] = ['FP16', 'Q8_0', 'Q6_K', 'Q5_K_M', 'Q4_K_M', 'Q4_K_S', 'Q4_0'];

export default function QuantizationTradeoff() {
  const [selected, setSelected] = useState<QType>('Q4_K_M');
  const d = DATA[selected];

  const barChartY = 100;
  const barH = 120;
  const barW = 130;

  function Bar({ x, value, max, label, unit, color }: {
    x: number; value: number; max: number; label: string; unit: string; color: string;
  }) {
    const h = (value / max) * barH;
    return (
      <g>
        <text x={x + barW / 2} y={barChartY - 8} textAnchor="middle" fontSize="8"
          fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
        <rect x={x + 20} y={barChartY + barH - h} width={barW - 40} height={h}
          rx={4} fill={color} opacity={0.8} />
        <text x={x + barW / 2} y={barChartY + barH - h - 5} textAnchor="middle"
          fontSize="8" fontWeight="700" fill={color} fontFamily={FONTS.sans}>
          {value}{unit}
        </text>
        <line x1={x + 10} y1={barChartY + barH} x2={x + barW - 10} y2={barChartY + barH}
          stroke="#e2e8f0" strokeWidth={0.5} />
      </g>
    );
  }

  return (
    <div>
      {/* Scheme selector */}
      <div className="flex gap-1.5 justify-center mb-3 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setSelected(t)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              selected === t
                ? 'bg-orange-100 border-orange-400 text-orange-700 font-semibold'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {DATA[t].label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {d.label} — 精度 / 速度 / 显存 三角 (Qwen3-8B, RTX 4090)
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {d.bpw} bits/weight | 数据为估算值，仅供对比参考
        </text>

        {/* Three bars */}
        <Bar x={30} value={d.pplDelta} max={0.2} label="Perplexity +" unit=""
          color={COLORS.red} />
        <Bar x={220} value={d.tokensPerSec} max={130} label="Tokens/s" unit=""
          color={COLORS.green} />
        <Bar x={410} value={d.vramGB} max={18} label="VRAM (GB)" unit=""
          color={COLORS.primary} />

        {/* Annotation */}
        <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          PPL 越低越好 | Tokens/s 越高越好 | VRAM 越低越好
        </text>
      </svg>
    </div>
  );
}
