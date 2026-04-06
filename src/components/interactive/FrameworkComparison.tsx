import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface FrameworkInfo {
  name: string;
  lang: string;
  deploy: { zh: string; en: string };
  format: { zh: string; en: string };
  quant: { zh: string; en: string };
  backend: { zh: string; en: string };
  kvMgmt: string;
  color: string;
}

const FRAMEWORKS: FrameworkInfo[] = [
  {
    name: 'Ollama + llama.cpp',
    lang: 'Go + C/C++',
    deploy: { zh: '桌面/边缘, 单二进制', en: 'Desktop/Edge, single binary' },
    format: { zh: 'GGUF (自包含)', en: 'GGUF (self-contained)' },
    quant: { zh: 'K-quant (无需校准)', en: 'K-quant (no calibration)' },
    backend: { zh: 'CUDA + Metal + Vulkan + CPU', en: 'CUDA + Metal + Vulkan + CPU' },
    kvMgmt: 'Slot-based, Prefix Cache',
    color: COLORS.primary,
  },
  {
    name: 'vLLM',
    lang: 'Python + CUDA',
    deploy: { zh: '服务器, GPU 必须', en: 'Server, GPU required' },
    format: { zh: 'safetensors / HF', en: 'safetensors / HF' },
    quant: { zh: 'GPTQ, AWQ, FP8', en: 'GPTQ, AWQ, FP8' },
    backend: { zh: 'CUDA only', en: 'CUDA only' },
    kvMgmt: 'PagedAttention',
    color: '#7c3aed',
  },
  {
    name: 'TensorRT-LLM',
    lang: 'C++ + Python',
    deploy: { zh: '服务器, NVIDIA 专用', en: 'Server, NVIDIA only' },
    format: { zh: '编译后引擎文件', en: 'Compiled engine file' },
    quant: { zh: 'FP8, INT4/INT8 (TRT)', en: 'FP8, INT4/INT8 (TRT)' },
    backend: { zh: 'CUDA only (TensorRT)', en: 'CUDA only (TensorRT)' },
    kvMgmt: 'Paged KV Cache',
    color: '#059669',
  },
  {
    name: 'TGI (HuggingFace)',
    lang: 'Rust + Python',
    deploy: { zh: '服务器, 云端服务', en: 'Server, cloud service' },
    format: { zh: 'safetensors / HF', en: 'safetensors / HF' },
    quant: { zh: 'GPTQ, AWQ, bitsandbytes', en: 'GPTQ, AWQ, bitsandbytes' },
    backend: { zh: 'CUDA (+ 部分 ROCm)', en: 'CUDA (+ partial ROCm)' },
    kvMgmt: 'Flash-Attention v2',
    color: '#d97706',
  },
];

const COLS = ['lang', 'deploy', 'format', 'quant', 'backend', 'kvMgmt'] as const;

export default function FrameworkComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      framework: '框架',
      lang: '语言',
      deploy: '部署场景',
      format: '模型格式',
      quant: '量化方案',
      backend: '硬件后端',
      kvMgmt: 'KV Cache',
      hover_hint: 'hover 单元格查看详情',
    },
    en: {
      framework: 'Framework',
      lang: 'Language',
      deploy: 'Deployment',
      format: 'Model Format',
      quant: 'Quantization',
      backend: 'Hardware Backend',
      kvMgmt: 'KV Cache',
      hover_hint: 'hover cells for details',
    },
  }[locale];

  const COL_LABELS: Record<typeof COLS[number], string> = {
    lang: t.lang,
    deploy: t.deploy,
    format: t.format,
    quant: t.quant,
    backend: t.backend,
    kvMgmt: t.kvMgmt,
  };
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left bg-gray-50 border border-gray-200 font-semibold text-gray-700 w-28">
              {t.framework}
            </th>
            {COLS.map(col => (
              <th key={col}
                className="p-2 text-left bg-gray-50 border border-gray-200 font-semibold text-gray-700">
                {COL_LABELS[col]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FRAMEWORKS.map((fw, ri) => (
            <tr key={fw.name}>
              <td className="p-2 border border-gray-200 font-semibold"
                style={{ color: fw.color }}>
                {fw.name}
              </td>
              {COLS.map((col, ci) => {
                const value = fw[col];
                const displayValue = typeof value === 'object' && value !== null ? value[locale] : value;
                return (
                  <td key={col}
                    className="p-2 border border-gray-200 transition-colors"
                    style={{
                      backgroundColor:
                        hovered?.row === ri && hovered?.col === ci
                          ? '#f0f9ff' : undefined,
                    }}
                    onMouseEnter={() => setHovered({ row: ri, col: ci })}
                    onMouseLeave={() => setHovered(null)}>
                    {displayValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-1 text-center">
        {t.hover_hint}
      </p>
    </div>
  );
}
