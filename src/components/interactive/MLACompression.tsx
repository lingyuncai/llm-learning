import { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

export default function MLACompression({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'KV Cache 大小对比 (FP16, seq_len=',
      formulaSummary: 'head_dim = d_model / num_heads =',
      mhaFormula: 'MHA: 2 ×',
      gqaFormula: 'GQA: 2 ×',
      mlaFormula: 'MLA:',
      heads: 'heads',
      kvHeads: 'kv_heads',
      dim: 'dim',
      seq: 'seq',
      latentDim: 'latent_dim',
      dModel: 'd_model:',
      numHeads: 'num_heads:',
      gqaKvHeads: 'GQA kv_heads:',
      mlaLatentDim: 'MLA latent_dim:',
      seqLen: 'seq_len:',
    },
    en: {
      title: 'KV Cache Size Comparison (FP16, seq_len=',
      formulaSummary: 'head_dim = d_model / num_heads =',
      mhaFormula: 'MHA: 2 ×',
      gqaFormula: 'GQA: 2 ×',
      mlaFormula: 'MLA:',
      heads: 'heads',
      kvHeads: 'kv_heads',
      dim: 'dim',
      seq: 'seq',
      latentDim: 'latent_dim',
      dModel: 'd_model:',
      numHeads: 'num_heads:',
      gqaKvHeads: 'GQA kv_heads:',
      mlaLatentDim: 'MLA latent_dim:',
      seqLen: 'seq_len:',
    },
  }[locale];
  const [dModel, setDModel] = useState(4096);
  const [numHeads, setNumHeads] = useState(32);
  const [numKvHeads, setNumKvHeads] = useState(8);
  const [latentDim, setLatentDim] = useState(512);
  const [seqLen, setSeqLen] = useState(4096);

  const headDim = dModel / numHeads;

  const results = useMemo(() => {
    const bytesPerParam = 2; // FP16
    const mha = 2 * numHeads * headDim * seqLen * bytesPerParam;
    const gqa = 2 * numKvHeads * headDim * seqLen * bytesPerParam;
    const mla = latentDim * seqLen * bytesPerParam;
    const toMB = (b: number) => b / (1024 * 1024);
    return {
      mha: toMB(mha),
      gqa: toMB(gqa),
      mla: toMB(mla),
      maxMB: toMB(mha),
    };
  }, [numHeads, numKvHeads, headDim, latentDim, seqLen]);

  const barData = [
    { label: 'MHA', value: results.mha, color: '#93c5fd' },
    { label: `GQA (${numKvHeads}h)`, value: results.gqa, color: COLORS.orange },
    { label: 'MLA', value: results.mla, color: COLORS.green },
  ];

  const barAreaX = 140;
  const barMaxW = 380;
  const barH = 28;
  const barGap = 12;
  const barStartY = 160;

  return (
    <div className="my-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 px-2">
        <div>
          <label className="text-xs text-gray-500 block">{t.dModel} {dModel}</label>
          <input type="range" min={1024} max={8192} step={1024} value={dModel}
            onChange={e => setDModel(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">{t.numHeads} {numHeads}</label>
          <input type="range" min={8} max={64} step={8} value={numHeads}
            onChange={e => setNumHeads(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">{t.gqaKvHeads} {numKvHeads}</label>
          <input type="range" min={1} max={numHeads} step={1} value={numKvHeads}
            onChange={e => setNumKvHeads(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">{t.mlaLatentDim} {latentDim}</label>
          <input type="range" min={64} max={2048} step={64} value={latentDim}
            onChange={e => setLatentDim(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">{t.seqLen} {seqLen}</label>
          <input type="range" min={512} max={32768} step={512} value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.title}{seqLen})
        </text>

        {/* Formula summary */}
        <text x={W / 2} y={42} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.mono}>
          {t.formulaSummary} {dModel} / {numHeads} = {headDim}
        </text>

        {/* Formulas */}
        {[
          `${t.mhaFormula} ${numHeads} ${t.heads} × ${headDim} ${t.dim} × ${seqLen} ${t.seq} × 2B = ${results.mha.toFixed(1)} MB`,
          `${t.gqaFormula} ${numKvHeads} ${t.kvHeads} × ${headDim} ${t.dim} × ${seqLen} ${t.seq} × 2B = ${results.gqa.toFixed(1)} MB`,
          `${t.mlaFormula} ${latentDim} ${t.latentDim} × ${seqLen} ${t.seq} × 2B = ${results.mla.toFixed(1)} MB`,
        ].map((text, i) => (
          <text key={i} x={30} y={65 + i * 16} fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.mono}>{text}</text>
        ))}

        {/* Bars */}
        {barData.map((item, i) => {
          const y = barStartY + i * (barH + barGap);
          const barW = results.maxMB > 0
            ? Math.max(2, (item.value / results.maxMB) * barMaxW) : 2;
          const pct = results.mha > 0 ? ((item.value / results.mha) * 100).toFixed(0) : '0';
          return (
            <g key={i}>
              <text x={barAreaX - 8} y={y + barH / 2 + 1} textAnchor="end"
                dominantBaseline="middle" fontSize="9" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{item.label}</text>
              <rect x={barAreaX} y={y} width={barMaxW} height={barH} rx={4}
                fill="#f1f5f9" />
              <rect x={barAreaX} y={y} width={barW} height={barH} rx={4}
                fill={item.color} opacity={0.75} />
              <text x={barAreaX + barW + 6} y={y + barH / 2 + 1}
                dominantBaseline="middle" fontSize="8" fontWeight="700"
                fill={item.color} fontFamily={FONTS.mono}>
                {item.value.toFixed(1)} MB ({pct}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
