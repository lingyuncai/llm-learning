import React from 'react';
import { COLORS, FONTS } from './shared/colors';

type SupportLevel = 'full' | 'partial' | 'none';

interface CellData {
  level: SupportLevel;
  note?: string;
}

const OpDataTypeMatrix: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      title: '操作与数据类型支持矩阵 (Intel Xe2)',
      operation: 'Operation',
      fullSupport: '完全支持',
      partialSupport: '部分支持（可能需要类型转换）',
      noSupport: '不支持',
      recommended: '推荐',
      recommendedFor: '针对该操作的最优数据类型',
      needConversion: '需转换',
      xmxNote: 'Intel Xe2 的矩阵加速单元，支持 INT8、FP16、BF16 的高效矩阵乘法。对于 MatMul 和 Convolution，BF16 是推荐类型，兼顾精度与性能。',
      eltwiseNote: '包括 ReLU、GELU、Sigmoid、Tanh 等逐元素激活函数，支持所有数据类型。',
      reorderNote: '内存格式转换操作（如 NCHW ↔ nChw16c），支持所有数据类型，是 oneDNN 自动优化的关键。',
    },
    en: {
      title: 'Operation vs Data Type Support Matrix (Intel Xe2)',
      operation: 'Operation',
      fullSupport: 'Full Support',
      partialSupport: 'Partial Support (may need type conversion)',
      noSupport: 'Not Supported',
      recommended: 'Recommended',
      recommendedFor: 'Optimal data type for this operation',
      needConversion: 'Need conversion',
      xmxNote: 'Intel Xe2 matrix acceleration unit, supports efficient INT8, FP16, BF16 matrix multiplication. For MatMul and Convolution, BF16 is recommended for balanced precision and performance.',
      eltwiseNote: 'Includes element-wise activation functions like ReLU, GELU, Sigmoid, Tanh, supports all data types.',
      reorderNote: 'Memory format conversion operations (e.g., NCHW ↔ nChw16c), supports all data types, critical for oneDNN auto-optimization.',
    },
  }[locale];

  // Operations × Data types support matrix for Intel Xe2
  const operations = [
    'MatMul',
    'Convolution',
    'Softmax',
    'LayerNorm',
    'Pooling',
    'Eltwise',
    'Reorder',
  ];

  const dataTypes = ['FP32', 'FP16', 'BF16', 'INT8'];

  // Support matrix
  const matrix: Record<string, Record<string, CellData>> = {
    MatMul: {
      FP32: { level: 'full' },
      FP16: { level: 'full', note: 'XMX' },
      BF16: { level: 'full', note: 'XMX' },
      INT8: { level: 'full', note: 'XMX' },
    },
    Convolution: {
      FP32: { level: 'full' },
      FP16: { level: 'full', note: 'XMX' },
      BF16: { level: 'full', note: 'XMX' },
      INT8: { level: 'full', note: 'XMX' },
    },
    Softmax: {
      FP32: { level: 'full' },
      FP16: { level: 'full' },
      BF16: { level: 'partial', note: locale === 'zh' ? '需转换' : 'Need conversion' },
      INT8: { level: 'none' },
    },
    LayerNorm: {
      FP32: { level: 'full' },
      FP16: { level: 'full' },
      BF16: { level: 'partial', note: locale === 'zh' ? '需转换' : 'Need conversion' },
      INT8: { level: 'none' },
    },
    Pooling: {
      FP32: { level: 'full' },
      FP16: { level: 'full' },
      BF16: { level: 'full' },
      INT8: { level: 'full' },
    },
    Eltwise: {
      FP32: { level: 'full' },
      FP16: { level: 'full' },
      BF16: { level: 'full' },
      INT8: { level: 'full' },
    },
    Reorder: {
      FP32: { level: 'full' },
      FP16: { level: 'full' },
      BF16: { level: 'full' },
      INT8: { level: 'full' },
    },
  };

  const getCellStyle = (level: SupportLevel) => {
    switch (level) {
      case 'full':
        return { bg: COLORS.green, text: COLORS.green, symbol: '✓' };
      case 'partial':
        return { bg: COLORS.orange, text: COLORS.orange, symbol: '△' };
      case 'none':
        return { bg: COLORS.red, text: COLORS.red, symbol: '✗' };
    }
  };

  // Recommended types for specific ops
  const recommended = {
    MatMul: 'BF16',
    Convolution: 'BF16',
  };

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{t.title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                {t.operation}
              </th>
              {dataTypes.map((dtype) => (
                <th
                  key={dtype}
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700"
                >
                  {dtype}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr key={op} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">
                  {op}
                </td>
                {dataTypes.map((dtype) => {
                  const cell = matrix[op][dtype];
                  const style = getCellStyle(cell.level);
                  const isRecommended = recommended[op as keyof typeof recommended] === dtype;

                  return (
                    <td
                      key={`${op}-${dtype}`}
                      className={`border border-gray-300 px-4 py-2 text-center ${
                        isRecommended ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="text-lg font-bold"
                          style={{ color: style.text }}
                        >
                          {style.symbol}
                        </span>
                        {cell.note && (
                          <span className="text-xs text-gray-600">{cell.note}</span>
                        )}
                        {isRecommended && (
                          <span className="text-xs font-semibold text-blue-600">{t.recommended}</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg" style={{ color: COLORS.green }}>✓</span>
          <span className="text-gray-700">{t.fullSupport}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg" style={{ color: COLORS.orange }}>△</span>
          <span className="text-gray-700">{t.partialSupport}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg" style={{ color: COLORS.red }}>✗</span>
          <span className="text-gray-700">{t.noSupport}</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="px-2 py-0.5 bg-blue-50 border border-blue-300 rounded text-xs font-semibold text-blue-600">
            {t.recommended}
          </span>
          <span className="text-gray-700">{t.recommendedFor}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-gray-700">
          <strong>XMX (Xe Matrix Extensions):</strong> {t.xmxNote}
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Eltwise {locale === 'zh' ? '操作' : 'Operations'}:</strong> {t.eltwiseNote}
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Reorder:</strong> {t.reorderNote}
        </p>
      </div>
    </div>
  );
};

export default OpDataTypeMatrix;
