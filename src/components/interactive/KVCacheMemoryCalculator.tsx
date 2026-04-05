import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

type ModelPreset = 'llama3-8b' | 'llama3-70b' | 'qwen3-72b' | 'custom';

interface ModelConfig {
  name: string;
  layers: number;
  heads: number;
  d_head: number;
  weightGB: number;
}

const PRESETS: Record<Exclude<ModelPreset, 'custom'>, ModelConfig> = {
  'llama3-8b': { name: 'Llama 3 8B', layers: 32, heads: 32, d_head: 128, weightGB: 16 },
  'llama3-70b': { name: 'Llama 3 70B', layers: 80, heads: 64, d_head: 128, weightGB: 140 },
  'qwen3-72b': { name: 'Qwen3 72B', layers: 80, heads: 64, d_head: 128, weightGB: 144 },
};

const QUANT_FORMATS = [
  { name: 'FP16', bytes: 2, color: COLORS.primary },
  { name: 'INT8', bytes: 1, color: COLORS.green },
  { name: 'FP8', bytes: 1, color: COLORS.orange },
  { name: 'INT4', bytes: 0.5, color: COLORS.purple },
];

function formatMem(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

export default function KVCacheMemoryCalculator() {
  const [preset, setPreset] = useState<ModelPreset>('llama3-8b');
  const [seqLenLog, setSeqLenLog] = useState(11); // 2^11 = 2048

  const config = preset === 'custom'
    ? { name: 'Custom', layers: 32, heads: 32, d_head: 128, weightGB: 16 }
    : PRESETS[preset];
  const seqLen = Math.round(Math.pow(2, seqLenLog));

  // KV size = 2 × layers × heads × d_head × seq_len × bytes_per_element
  const kvSizes = QUANT_FORMATS.map(fmt => ({
    ...fmt,
    size: 2 * config.layers * config.heads * config.d_head * seqLen * fmt.bytes,
  }));

  const maxSize = kvSizes[0].size * 1.15; // FP16 is always largest
  const chartX = 80;
  const chartY = 100;
  const chartW = W - 120;
  const chartH = 200;
  const barW = 70;
  const barGap = (chartW - barW * 4) / 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y="22" textAnchor="middle" fontSize="14" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        KV Cache 显存对比 ({config.name})
      </text>

      {/* Model preset buttons */}
      {(['llama3-8b', 'llama3-70b', 'qwen3-72b'] as const).map((p, i) => (
        <g key={p} onClick={() => setPreset(p)} cursor="pointer">
          <rect x={120 + i * 130} y={32} width={120} height={22} rx={4}
            fill={preset === p ? COLORS.primary : COLORS.bgAlt}
            stroke={preset === p ? COLORS.primary : COLORS.light} strokeWidth={1} />
          <text x={180 + i * 130} y={47} textAnchor="middle" fontSize="10"
            fontWeight={preset === p ? '700' : '400'}
            fill={preset === p ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {PRESETS[p].name}
          </text>
        </g>
      ))}

      {/* Sequence length slider label */}
      <text x={chartX} y={chartY - 25} fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
        Sequence Length:
      </text>
      <text x={chartX + 105} y={chartY - 25} fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.mono}>
        {seqLen.toLocaleString()} tokens
      </text>

      {/* Slider track (SVG-based) */}
      <rect x={chartX} y={chartY - 15} width={chartW} height={6} rx={3}
        fill={COLORS.light} />
      <rect x={chartX} y={chartY - 15}
        width={((seqLenLog - 9) / 8) * chartW} height={6} rx={3}
        fill={COLORS.primary} opacity={0.5} />
      {/* Slider knob area — use foreignObject for the actual input */}
      <foreignObject x={chartX - 5} y={chartY - 22} width={chartW + 10} height={20}>
        <input type="range" min="9" max="17" step="0.1" value={seqLenLog}
          onChange={e => setSeqLenLog(parseFloat(e.target.value))}
          style={{ width: '100%', opacity: 0, cursor: 'pointer', height: '20px' }} />
      </foreignObject>

      {/* Y-axis */}
      <line x1={chartX} y1={chartY} x2={chartX} y2={chartY + chartH}
        stroke={COLORS.light} strokeWidth="1" />
      <text x={chartX - 5} y={chartY + 5} textAnchor="end" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {formatMem(maxSize)}
      </text>
      <text x={chartX - 5} y={chartY + chartH} textAnchor="end" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>0</text>

      {/* Model weight reference line */}
      {(() => {
        const weightBytes = config.weightGB * 1e9;
        if (weightBytes < maxSize) {
          const y = chartY + chartH - (weightBytes / maxSize) * chartH;
          return (
            <>
              <line x1={chartX} x2={chartX + chartW} y1={y} y2={y}
                stroke={COLORS.red} strokeWidth="1" strokeDasharray="4,2" opacity={0.6} />
              <text x={chartX + chartW - 2} y={y - 4} textAnchor="end"
                fontSize="9" fill={COLORS.red} fontFamily={FONTS.sans}>
                模型权重: {config.weightGB} GB
              </text>
            </>
          );
        }
        return null;
      })()}

      {/* Bars */}
      {kvSizes.map((fmt, i) => {
        const x = chartX + barGap + i * (barW + barGap);
        const barH = (fmt.size / maxSize) * chartH;
        const y = chartY + chartH - barH;
        return (
          <g key={fmt.name}>
            <rect x={x} y={y} width={barW} height={barH}
              fill={fmt.color} opacity={0.85} rx={2} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle"
              fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {formatMem(fmt.size)}
            </text>
            <text x={x + barW / 2} y={chartY + chartH + 15} textAnchor="middle"
              fontSize="11" fontWeight="600" fill={fmt.color} fontFamily={FONTS.sans}>
              {fmt.name}
            </text>
          </g>
        );
      })}

      {/* Formula */}
      <text x={W / 2} y={H - 15} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.mono}>
        KV = 2 × layers × heads × d_head × seq_len × bytes
      </text>
    </svg>
  );
}
