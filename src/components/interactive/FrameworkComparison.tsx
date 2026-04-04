import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface FrameworkInfo {
  name: string;
  lang: string;
  deploy: string;
  format: string;
  quant: string;
  backend: string;
  kvMgmt: string;
  color: string;
}

const FRAMEWORKS: FrameworkInfo[] = [
  {
    name: 'Ollama + llama.cpp',
    lang: 'Go + C/C++',
    deploy: '桌面/边缘, 单二进制',
    format: 'GGUF (自包含)',
    quant: 'K-quant (无需校准)',
    backend: 'CUDA + Metal + Vulkan + CPU',
    kvMgmt: 'Slot-based, Prefix Cache',
    color: COLORS.primary,
  },
  {
    name: 'vLLM',
    lang: 'Python + CUDA',
    deploy: '服务器, GPU 必须',
    format: 'safetensors / HF',
    quant: 'GPTQ, AWQ, FP8',
    backend: 'CUDA only',
    kvMgmt: 'PagedAttention',
    color: '#7c3aed',
  },
  {
    name: 'TensorRT-LLM',
    lang: 'C++ + Python',
    deploy: '服务器, NVIDIA 专用',
    format: '编译后引擎文件',
    quant: 'FP8, INT4/INT8 (TRT)',
    backend: 'CUDA only (TensorRT)',
    kvMgmt: 'Paged KV Cache',
    color: '#059669',
  },
  {
    name: 'TGI (HuggingFace)',
    lang: 'Rust + Python',
    deploy: '服务器, 云端服务',
    format: 'safetensors / HF',
    quant: 'GPTQ, AWQ, bitsandbytes',
    backend: 'CUDA (+ 部分 ROCm)',
    kvMgmt: 'Flash-Attention v2',
    color: '#d97706',
  },
];

const COLS = ['lang', 'deploy', 'format', 'quant', 'backend', 'kvMgmt'] as const;
const COL_LABELS: Record<typeof COLS[number], string> = {
  lang: '语言',
  deploy: '部署场景',
  format: '模型格式',
  quant: '量化方案',
  backend: '硬件后端',
  kvMgmt: 'KV Cache',
};

export default function FrameworkComparison() {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left bg-gray-50 border border-gray-200 font-semibold text-gray-700 w-28">
              框架
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
              {COLS.map((col, ci) => (
                <td key={col}
                  className="p-2 border border-gray-200 transition-colors"
                  style={{
                    backgroundColor:
                      hovered?.row === ri && hovered?.col === ci
                        ? '#f0f9ff' : undefined,
                  }}
                  onMouseEnter={() => setHovered({ row: ri, col: ci })}
                  onMouseLeave={() => setHovered(null)}>
                  {fw[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-1 text-center">
        hover 单元格查看详情
      </p>
    </div>
  );
}
