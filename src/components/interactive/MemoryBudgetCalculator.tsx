import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

interface ModelSpec {
  name: string;
  sizeGB: number;
  kvPerTokenMB: number; // KV cache per token in MB
}

const MODELS: ModelSpec[] = [
  { name: 'Qwen3-4B Q4_K_M', sizeGB: 2.6, kvPerTokenMB: 0.05 },
  { name: 'Qwen3-8B Q4_K_M', sizeGB: 4.9, kvPerTokenMB: 0.08 },
  { name: 'Llama3-8B Q4_K_M', sizeGB: 4.7, kvPerTokenMB: 0.08 },
  { name: 'Qwen3-14B Q4_K_M', sizeGB: 8.2, kvPerTokenMB: 0.12 },
  { name: 'Llama3-70B Q4_K_M', sizeGB: 40.0, kvPerTokenMB: 0.4 },
];

export default function MemoryBudgetCalculator({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      gpuVram: 'GPU VRAM: {vram} GB',
      systemRam: 'System RAM: {ram} GB',
      title: '内存预算计算器 (ctx={ctx})',
      gpuVramLabel: 'GPU VRAM ({vram} GB)',
      systemRamLabel: 'System RAM ({ram} GB)',
      cannotFit: '{model}: 需要 {size} GB, 放不下!',
      summary: '模型大小 = 权重 + KV Cache ({ctx} tokens) | GPU 放不下则降级到 CPU',
    },
    en: {
      gpuVram: 'GPU VRAM: {vram} GB',
      systemRam: 'System RAM: {ram} GB',
      title: 'Memory Budget Calculator (ctx={ctx})',
      gpuVramLabel: 'GPU VRAM ({vram} GB)',
      systemRamLabel: 'System RAM ({ram} GB)',
      cannotFit: '{model}: needs {size} GB, cannot fit!',
      summary: 'Model size = weights + KV Cache ({ctx} tokens) | Falls back to CPU if GPU insufficient',
    },
  }[locale];
  const [vramGB, setVramGB] = useState(8);
  const [ramGB, setRamGB] = useState(16);
  const [selectedModels, setSelectedModels] = useState<Set<number>>(new Set([1]));
  const contextLen = 2048;

  const toggleModel = (idx: number) => {
    const next = new Set(selectedModels);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setSelectedModels(next);
  };

  // Calculate placement
  const placements = [...selectedModels].map(idx => {
    const m = MODELS[idx];
    const kvGB = (m.kvPerTokenMB * contextLen) / 1024;
    const totalNeed = m.sizeGB + kvGB;
    const fitsGPU = totalNeed <= vramGB;
    const fitsCPU = totalNeed <= ramGB;
    return { model: m, kvGB, totalNeed, fitsGPU, fitsCPU };
  });

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
        <div>
          <label className="text-gray-600">{t.gpuVram.replace('{vram}', vramGB.toString())}</label>
          <input type="range" min={0} max={24} step={1} value={vramGB}
            onChange={e => setVramGB(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-gray-600">{t.systemRam.replace('{ram}', ramGB.toString())}</label>
          <input type="range" min={8} max={128} step={8} value={ramGB}
            onChange={e => setRamGB(parseInt(e.target.value))} className="w-full" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center mb-3">
        {MODELS.map((m, i) => (
          <button key={i} onClick={() => toggleModel(i)}
            className={`px-2 py-1 text-xs rounded-full border ${
              selectedModels.has(i)
                ? 'bg-blue-100 border-blue-400 text-blue-700 font-semibold'
                : 'bg-white border-gray-300 text-gray-500'
            }`}>
            {m.name}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.title.replace('{ctx}', contextLen.toString())}
        </text>

        {/* VRAM bar */}
        <text x={20} y={50} fontSize="8" fontWeight="600" fill={COLORS.green}
          fontFamily={FONTS.sans}>{t.gpuVramLabel.replace('{vram}', vramGB.toString())}</text>
        <rect x={20} y={55} width={W - 40} height={30} rx={4}
          fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} />

        {/* RAM bar */}
        <text x={20} y={110} fontSize="8" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>{t.systemRamLabel.replace('{ram}', ramGB.toString())}</text>
        <rect x={20} y={115} width={W - 40} height={30} rx={4}
          fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} />

        {/* Model placements on VRAM bar */}
        {(() => {
          let vramOffset = 0;
          let ramOffset = 0;
          return placements.map((p, i) => {
            const vramW = (p.totalNeed / Math.max(vramGB, 1)) * (W - 40);
            const ramW = (p.totalNeed / Math.max(ramGB, 1)) * (W - 40);
            const vramX = 20 + vramOffset;
            const ramX = 20 + ramOffset;

            if (p.fitsGPU) {
              vramOffset += vramW;
              return (
                <g key={i}>
                  <rect x={vramX} y={55} width={Math.min(vramW, W - 40 - (vramX - 20))} height={30}
                    rx={4} fill={COLORS.green} opacity={0.3} />
                  <text x={vramX + Math.min(vramW, W - 40) / 2} y={74} textAnchor="middle"
                    fontSize="7" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
                    {p.model.name} ({p.totalNeed.toFixed(1)} GB)
                  </text>
                </g>
              );
            } else if (p.fitsCPU) {
              ramOffset += ramW;
              return (
                <g key={i}>
                  <rect x={ramX} y={115} width={Math.min(ramW, W - 40 - (ramX - 20))} height={30}
                    rx={4} fill={COLORS.primary} opacity={0.3} />
                  <text x={ramX + Math.min(ramW, W - 40) / 2} y={134} textAnchor="middle"
                    fontSize="7" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
                    {p.model.name} ({p.totalNeed.toFixed(1)} GB)
                  </text>
                </g>
              );
            } else {
              return (
                <text key={i} x={W / 2} y={170 + i * 15} textAnchor="middle"
                  fontSize="7" fill={COLORS.red} fontFamily={FONTS.sans}>
                  {t.cannotFit.replace('{model}', p.model.name).replace('{size}', p.totalNeed.toFixed(1))}
                </text>
              );
            }
          });
        })()}

        {/* Summary */}
        <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {t.summary.replace('{ctx}', contextLen.toString())}
        </text>
      </svg>
    </div>
  );
}
