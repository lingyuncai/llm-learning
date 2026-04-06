// src/components/interactive/KVCacheGrowthChart.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';
import { MODEL_PRESETS } from './shared/presets';
import { BYTES_PER_PARAM, type Precision } from './shared/types';

const SEQ_LENGTHS = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

function kvCacheGB(layers: number, kvHeads: number, headDim: number, seqLen: number, bytesPerParam: number): number {
  return (2 * layers * kvHeads * seqLen * headDim * bytesPerParam) / (1024 ** 3);
}

export default function KVCacheGrowthChart({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: { modelPreset: '模型预设', precision: '精度' },
    en: { modelPreset: 'Model Preset', precision: 'Precision' },
  }[locale];

  const [preset, setPreset] = useState('LLaMA-2 70B');
  const [precision, setPrecision] = useState<Precision>('FP16');
  const model = MODEL_PRESETS[preset];
  const bpp = BYTES_PER_PARAM[precision];

  const curves = useMemo(() => {
    const mha = SEQ_LENGTHS.map(s => kvCacheGB(model.layers, model.heads, model.headDim, s, bpp));
    const gqa = SEQ_LENGTHS.map(s => kvCacheGB(model.layers, model.kvHeads, model.headDim, s, bpp));
    const mqa = SEQ_LENGTHS.map(s => kvCacheGB(model.layers, 1, model.headDim, s, bpp));
    return { mha, gqa, mqa };
  }, [model, bpp]);

  const maxVal = Math.max(...curves.mha);
  const chartW = 500;
  const chartH = 250;
  const padL = 60;
  const padB = 30;
  const padT = 10;
  const padR = 10;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  function toX(i: number) { return padL + (i / (SEQ_LENGTHS.length - 1)) * plotW; }
  function toY(v: number) { return padT + plotH - (v / maxVal) * plotH; }

  function Line({ data, color, label }: { data: number[]; color: string; label: string }) {
    const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
    return (
      <g>
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
        {data.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={2.5} fill={color} />
        ))}
      </g>
    );
  }

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="flex flex-wrap gap-4 mb-3">
        <div>
          <label className="text-xs text-gray-500 block">{t.modelPreset}</label>
          <select value={preset} onChange={e => setPreset(e.target.value)}
            className="text-sm border rounded px-2 py-1">
            {Object.keys(MODEL_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">{t.precision}</label>
          <select value={precision} onChange={e => setPrecision(e.target.value as Precision)}
            className="text-sm border rounded px-2 py-1">
            {(['FP32', 'FP16', 'INT8', 'INT4'] as Precision[]).map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="text-xs text-gray-400 self-end">
          h={model.heads}, kv_heads={model.kvHeads}, L={model.layers}, d_k={model.headDim}
        </div>
      </div>

      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-lg">
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={padL} y1={toY(f * maxVal)} x2={chartW - padR} y2={toY(f * maxVal)}
              stroke="#f0f0f0" strokeWidth={0.5} />
            <text x={padL - 4} y={toY(f * maxVal) + 3} textAnchor="end"
              fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
              {(f * maxVal).toFixed(1)}GB
            </text>
          </g>
        ))}
        {SEQ_LENGTHS.map((s, i) => (
          i % 2 === 0 && (
            <text key={i} x={toX(i)} y={chartH - 5} textAnchor="middle"
              fontSize="7" fill={COLORS.mid} fontFamily="system-ui">
              {s >= 1024 ? `${s / 1024}K` : s}
            </text>
          )
        ))}
        <Line data={curves.mha} color={COLORS.red} label="MHA" />
        <Line data={curves.gqa} color={COLORS.orange} label="GQA" />
        <Line data={curves.mqa} color={COLORS.green} label="MQA" />
      </svg>

      <div className="flex justify-center gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: COLORS.red }} /> MHA ({curves.mha[curves.mha.length - 1].toFixed(1)} GB @ 128K)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: COLORS.orange }} /> GQA ({curves.gqa[curves.gqa.length - 1].toFixed(1)} GB)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: COLORS.green }} /> MQA ({curves.mqa[curves.mqa.length - 1].toFixed(2)} GB)
        </span>
      </div>
    </div>
  );
}
