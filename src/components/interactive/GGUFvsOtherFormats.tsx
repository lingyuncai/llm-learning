import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

const FORMATS = [
  { name: 'GGUF', x: 40, color: COLORS.orange },
  { name: 'safetensors', x: 220, color: COLORS.primary },
  { name: 'ONNX', x: 400, color: '#7c3aed' },
];

export default function GGUFvsOtherFormats({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '模型格式对比: GGUF vs safetensors vs ONNX',
      content: '包含内容',
      fileCount: '文件数量',
      loading: '加载方式',
      quant: '量化支持',
      goal: '设计目标',
      ggufContent: '权重 + tokenizer\n+ 配置 + template',
      stContent: '权重 + 最小 metadata',
      onnxContent: '计算图 + 权重\n+ 运行时配置',
      singleFile: '单文件',
      multiFile: '多文件 (HF repo)',
      multiFile2: '多文件',
      mmap: 'mmap (按需)',
      fullLoad: '全量加载',
      embeddedQuant: '内嵌 (Q4_K 等)',
      externalTool: '外部工具',
      externalQuant: '外部量化',
      inferOpt: '推理部署优化',
      safeTensor: '安全 tensor 存储',
      crossFramework: '跨框架通用',
    },
    en: {
      title: 'Model Format Comparison: GGUF vs safetensors vs ONNX',
      content: 'Contents',
      fileCount: 'File Count',
      loading: 'Loading',
      quant: 'Quantization',
      goal: 'Design Goal',
      ggufContent: 'Weights + tokenizer\n+ config + template',
      stContent: 'Weights + minimal metadata',
      onnxContent: 'Graph + weights\n+ runtime config',
      singleFile: 'Single file',
      multiFile: 'Multiple (HF repo)',
      multiFile2: 'Multiple files',
      mmap: 'mmap (on-demand)',
      fullLoad: 'Full load',
      embeddedQuant: 'Embedded (Q4_K etc)',
      externalTool: 'External tools',
      externalQuant: 'External quant',
      inferOpt: 'Inference optimized',
      safeTensor: 'Safe tensor storage',
      crossFramework: 'Cross-framework',
    },
  }[locale];

  const ROWS = [
    {
      label: t.content,
      values: [t.ggufContent, t.stContent, t.onnxContent],
    },
    {
      label: t.fileCount,
      values: [t.singleFile, t.multiFile, t.multiFile2],
    },
    {
      label: t.loading,
      values: [t.mmap, t.fullLoad, t.fullLoad],
    },
    {
      label: t.quant,
      values: [t.embeddedQuant, t.externalTool, t.externalQuant],
    },
    {
      label: t.goal,
      values: [t.inferOpt, t.safeTensor, t.crossFramework],
    },
  ];
  const colW = 160;
  const rowH = 38;
  const startY = 55;
  const labelX = 15;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      {/* Column headers */}
      {FORMATS.map((f, i) => (
        <g key={f.name}>
          <rect x={f.x + 75} y={30} width={colW - 10} height={22} rx={4}
            fill="white" stroke={f.color} strokeWidth={1.5} />
          <text x={f.x + 75 + (colW - 10) / 2} y={44} textAnchor="middle"
            fontSize="8" fontWeight="700" fill={f.color} fontFamily={FONTS.sans}>
            {f.name}
          </text>
        </g>
      ))}

      {/* Rows */}
      {ROWS.map((row, ri) => {
        const y = startY + ri * rowH;
        return (
          <g key={row.label}>
            {/* Row background */}
            {ri % 2 === 0 && (
              <rect x={0} y={y} width={W} height={rowH} fill="#f8fafc" />
            )}
            {/* Row label */}
            <text x={labelX} y={y + rowH / 2 + 3} fontSize="7.5" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {row.label}
            </text>
            {/* Values */}
            {FORMATS.map((f, ci) => {
              const lines = row.values[ci].split('\n');
              return lines.map((line, li) => (
                <text key={`${ci}-${li}`}
                  x={f.x + 75 + (colW - 10) / 2}
                  y={y + rowH / 2 + 3 + (li - (lines.length - 1) / 2) * 10}
                  textAnchor="middle" fontSize="7" fill={COLORS.mid}
                  fontFamily={FONTS.sans}>
                  {line}
                </text>
              ));
            })}
          </g>
        );
      })}
    </svg>
  );
}
