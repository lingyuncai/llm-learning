import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';
import { BYTES_PER_PARAM } from './shared/types';

export default function ConcurrencyComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      gpuMemLabel: '可用 GPU 显存 (GB)',
      seqLenLabel: '序列长度',
      concurrency: '个并发',
      perReq: 'GB/req',
      basedOn: '基于',
      params: '参数',
    },
    en: {
      gpuMemLabel: 'Available GPU Memory (GB)',
      seqLenLabel: 'Sequence Length',
      concurrency: 'concurrent requests',
      perReq: 'GB/req',
      basedOn: 'Based on',
      params: 'parameters',
    },
  }[locale];

  const [gpuMemGB, setGpuMemGB] = useState(40);
  const [seqLen, setSeqLen] = useState(4096);

  const L = 80, heads = 64, dk = 128, kvHeadsGQA = 8;

  const kvPerReq = useMemo(() => {
    const bytes = BYTES_PER_PARAM['FP16'];
    const mha = (2 * L * heads * seqLen * dk * bytes) / (1024 ** 3);
    const gqa = (2 * L * kvHeadsGQA * seqLen * dk * bytes) / (1024 ** 3);
    const mqa = (2 * L * 1 * seqLen * dk * bytes) / (1024 ** 3);
    return { mha, gqa, mqa };
  }, [seqLen]);

  const concurrency = {
    mha: Math.floor(gpuMemGB / kvPerReq.mha),
    gqa: Math.floor(gpuMemGB / kvPerReq.gqa),
    mqa: Math.floor(gpuMemGB / kvPerReq.mqa),
  };

  const maxConc = Math.max(concurrency.mha, concurrency.gqa, concurrency.mqa, 1);

  const bars = [
    { label: 'MHA', value: concurrency.mha, color: COLORS.red, kvGB: kvPerReq.mha },
    { label: 'GQA', value: concurrency.gqa, color: COLORS.orange, kvGB: kvPerReq.gqa },
    { label: 'MQA', value: concurrency.mqa, color: COLORS.green, kvGB: kvPerReq.mqa },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-500 block">{t.gpuMemLabel}</label>
          <input type="range" min={10} max={160} step={10} value={gpuMemGB}
            onChange={e => setGpuMemGB(Number(e.target.value))} className="w-32" />
          <span className="text-sm ml-2 font-semibold">{gpuMemGB} GB</span>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">{t.seqLenLabel}</label>
          <select value={seqLen} onChange={e => setSeqLen(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1">
            {[1024, 2048, 4096, 8192, 16384].map(s => (
              <option key={s} value={s}>{s.toLocaleString()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {bars.map(bar => (
          <div key={bar.label} className="flex items-center gap-3">
            <div className="w-12 text-sm font-semibold text-right" style={{ color: bar.color }}>
              {bar.label}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{
                  width: `${Math.max((bar.value / maxConc) * 100, 3)}%`,
                  backgroundColor: bar.color + '33',
                  border: `2px solid ${bar.color}`,
                }}>
              </div>
            </div>
            <div className="w-40 text-sm">
              <strong>{bar.value}</strong> {t.concurrency}
              <span className="text-xs text-gray-400 ml-1">
                ({bar.kvGB.toFixed(2)} {t.perReq})
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        {t.basedOn} LLaMA-2 70B {t.params} (L={L}, h={heads}, d_k={dk}, GQA kv_heads={kvHeadsGQA}), FP16
      </p>
    </div>
  );
}
