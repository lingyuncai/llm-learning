import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';
import { MODEL_PRESETS, HARDWARE_PRESETS } from './shared/presets';
import { BYTES_PER_PARAM, type Precision } from './shared/types';

export default function KVCacheCalculator() {
  const [preset, setPreset] = useState('LLaMA-2 7B');
  const [seqLen, setSeqLen] = useState(2048);
  const [precision, setPrecision] = useState<Precision>('FP16');
  const [concurrency, setConcurrency] = useState(1);
  const [hwPreset, setHwPreset] = useState('A100 80GB');

  const model = MODEL_PRESETS[preset];
  const hw = HARDWARE_PRESETS[hwPreset];
  const bpp = BYTES_PER_PARAM[precision];

  const result = useMemo(() => {
    const singleBytes = 2 * model.layers * model.kvHeads * seqLen * model.headDim * bpp;
    const singleGB = singleBytes / (1024 ** 3);
    const totalGB = singleGB * concurrency;
    const pct = (totalGB / hw.memoryGB) * 100;
    return { singleGB, totalGB, pct };
  }, [model, seqLen, bpp, concurrency, hw]);

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 block">模型预设</label>
          <select value={preset} onChange={e => setPreset(e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full">
            {Object.keys(MODEL_PRESETS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">序列长度 S: {seqLen.toLocaleString()}</label>
          <input type="range" min={256} max={131072} step={256} value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">精度</label>
          <select value={precision} onChange={e => setPrecision(e.target.value as Precision)}
            className="text-sm border rounded px-2 py-1 w-full">
            {(['FP32', 'FP16', 'INT8', 'INT4'] as Precision[]).map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">并发请求 N: {concurrency}</label>
          <input type="range" min={1} max={256} step={1} value={concurrency}
            onChange={e => setConcurrency(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">GPU</label>
          <select value={hwPreset} onChange={e => setHwPreset(e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full">
            {Object.keys(HARDWARE_PRESETS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="text-xs text-gray-500">单请求 KV Cache</div>
          <div className="text-lg font-bold text-blue-700">{result.singleGB.toFixed(3)} GB</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded">
          <div className="text-xs text-gray-500">{concurrency} 个并发总占用</div>
          <div className="text-lg font-bold text-orange-700">{result.totalGB.toFixed(2)} GB</div>
        </div>
        <div className="text-center p-3 rounded" style={{
          backgroundColor: result.pct > 100 ? '#fee2e2' : result.pct > 80 ? '#fef3c7' : '#d1fae5'
        }}>
          <div className="text-xs text-gray-500">占 GPU 显存</div>
          <div className="text-lg font-bold" style={{
            color: result.pct > 100 ? COLORS.red : result.pct > 80 ? COLORS.orange : COLORS.green
          }}>
            {result.pct.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(result.pct, 100)}%`,
            backgroundColor: result.pct > 100 ? COLORS.red : result.pct > 80 ? COLORS.orange : COLORS.green,
          }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1 text-center">
        {hw.name}: {hw.memoryGB} GB 总显存
      </div>

      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
        公式: 2 × L({model.layers}) × kv_heads({model.kvHeads}) × S({seqLen.toLocaleString()}) × d_k({model.headDim}) × {bpp}B
      </div>
    </div>
  );
}
