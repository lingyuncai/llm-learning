import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

const DIMS = ['校准样本', '量化耗时', '位宽', 'PPL (4-bit)', '推理框架', '适用场景'];

const METHODS = [
  { name: 'RTN', color: COLORS.mid, data: ['0', '<1 min', 'W4/W8', '~7.2', '通用', '快速基线'] },
  { name: 'GPTQ', color: COLORS.primary, data: ['128', '~10 min', 'W4/W3/W2', '~5.67', 'ExLlama/vLLM', '4-bit 部署'] },
  { name: 'AWQ', color: COLORS.green, data: ['128', '~5 min', 'W4', '~5.60', 'vLLM/TRT-LLM', '高效部署'] },
  { name: 'SmoothQuant', color: COLORS.purple, data: ['512', '~15 min', 'W8A8', '~5.73', 'TRT-LLM', '高吞吐推理'] },
];

const DETAILS: Record<string, Record<string, string>> = {
  RTN: {
    '校准样本': '无需校准数据，直接逐元素 round-to-nearest',
    '量化耗时': '无需前向推理，仅做 round 操作',
    '位宽': '8-bit 精度尚可，4-bit 严重退化',
    'PPL (4-bit)': 'INT4 perplexity 上升明显 (FP16 基线: 5.47)',
    '推理框架': '任何量化框架均支持',
    '适用场景': '快速评估量化可行性，或 8-bit 部署',
  },
  GPTQ: {
    '校准样本': '需要 128 条数据计算 Hessian 矩阵',
    '量化耗时': '7B 模型约 10 分钟，需单 GPU',
    '位宽': '支持超低比特 (2/3/4/8-bit)',
    'PPL (4-bit)': 'INT4-g128 接近 FP16 (5.47)，损失极小',
    '推理框架': '需要专用 CUDA kernel',
    '适用场景': '消费级 GPU 部署大模型首选',
  },
  AWQ: {
    '校准样本': '需要校准数据识别 salient channel',
    '量化耗时': '无需反向传播，仅分析激活统计',
    '位宽': '聚焦 4-bit, 保护 1% 显著通道',
    'PPL (4-bit)': 'INT4-g128 略优于 GPTQ',
    '推理框架': '兼容标准 INT4 kernel',
    '适用场景': '量化质量与推理速度最佳平衡',
  },
  SmoothQuant: {
    '校准样本': '需统计各通道激活分布',
    '量化耗时': '需统计并融合平滑因子',
    '位宽': 'W8A8: 权重+激活都用 INT8',
    'PPL (4-bit)': 'W8A8 精度损失极小 (FP16: 5.47)',
    '推理框架': '需要 INT8 GEMM (A100/H100)',
    '适用场景': '数据中心大规模服务',
  },
};

export default function PTQMethodComparison() {
  const [active, setActive] = useState<{ row: number; col: number } | null>(null);

  const nameW = 88;
  const colW = (W - nameW - 20) / DIMS.length;
  const headerH = 35;
  const rowH = 38;
  const tX = 10;
  const tY = 10;

  return (
    <svg viewBox={`0 0 ${W} 350`} className="w-full">
      {/* Column headers */}
      {DIMS.map((dim, j) => (
        <g key={j}>
          <rect x={tX + nameW + j * colW} y={tY} width={colW - 1} height={headerH}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} rx={2} />
          <text x={tX + nameW + j * colW + colW / 2} y={tY + headerH / 2 + 4}
            textAnchor="middle" fontSize="7.5" fontWeight="600" fill={COLORS.dark}
            fontFamily={FONTS.sans}>{dim}</text>
        </g>
      ))}

      {/* Method rows */}
      {METHODS.map((method, i) => {
        const yPos = tY + headerH + i * rowH;
        return (
          <g key={i}>
            <rect x={tX} y={yPos} width={nameW - 1} height={rowH - 1}
              fill={COLORS.bgAlt} stroke={method.color} strokeWidth={1.5} rx={2} />
            <text x={tX + nameW / 2} y={yPos + rowH / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="700" fill={method.color} fontFamily={FONTS.sans}>
              {method.name}
            </text>
            {DIMS.map((_, j) => {
              const isActive = active?.row === i && active?.col === j;
              return (
                <g key={j} onClick={() => setActive(isActive ? null : { row: i, col: j })}
                  cursor="pointer">
                  <rect x={tX + nameW + j * colW} y={yPos} width={colW - 1} height={rowH - 1}
                    fill={isActive ? '#e3f2fd' : COLORS.bg}
                    stroke={isActive ? COLORS.primary : COLORS.light}
                    strokeWidth={isActive ? 2 : 1} rx={2} />
                  <text x={tX + nameW + j * colW + colW / 2} y={yPos + rowH / 2 + 4}
                    textAnchor="middle" fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>
                    {method.data[j]}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Detail panel */}
      {active ? (
        <g>
          <rect x={tX} y={tY + headerH + 4 * rowH + 10} width={W - 20} height={48} rx={6}
            fill={COLORS.bgAlt} stroke={METHODS[active.row].color} strokeWidth={1.5} />
          <text x={tX + 15} y={tY + headerH + 4 * rowH + 30} fontSize="9"
            fontWeight="600" fill={METHODS[active.row].color} fontFamily={FONTS.sans}>
            {METHODS[active.row].name} — {DIMS[active.col]}
          </text>
          <text x={tX + 15} y={tY + headerH + 4 * rowH + 48} fontSize="8"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {DETAILS[METHODS[active.row].name][DIMS[active.col]]}
          </text>
        </g>
      ) : (
        <text x={W / 2} y={tY + headerH + 4 * rowH + 35} textAnchor="middle"
          fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
          点击单元格查看详细说明
        </text>
      )}
    </svg>
  );
}
