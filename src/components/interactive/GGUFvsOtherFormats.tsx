import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

const FORMATS = [
  { name: 'GGUF', x: 40, color: COLORS.orange },
  { name: 'safetensors', x: 220, color: COLORS.primary },
  { name: 'ONNX', x: 400, color: '#7c3aed' },
];

const ROWS = [
  {
    label: '包含内容',
    values: [
      '权重 + tokenizer\n+ 配置 + template',
      '权重 + 最小 metadata',
      '计算图 + 权重\n+ 运行时配置',
    ],
  },
  {
    label: '文件数量',
    values: ['单文件', '多文件 (HF repo)', '多文件'],
  },
  {
    label: '加载方式',
    values: ['mmap (按需)', '全量加载', '全量加载'],
  },
  {
    label: '量化支持',
    values: ['内嵌 (Q4_K 等)', '外部工具', '外部量化'],
  },
  {
    label: '设计目标',
    values: ['推理部署优化', '安全 tensor 存储', '跨框架通用'],
  },
];

export default function GGUFvsOtherFormats() {
  const colW = 160;
  const rowH = 38;
  const startY = 55;
  const labelX = 15;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        模型格式对比: GGUF vs safetensors vs ONNX
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
