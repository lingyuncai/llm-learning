import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'unfused' | 'fused';

const PostOpFusion: React.FC = () => {
  const [mode, setMode] = useState<Mode>('unfused');

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Post-op Fusion 优化</h3>

      {/* Mode selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('unfused')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            mode === 'unfused'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          未融合 (Unfused)
        </button>
        <button
          onClick={() => setMode('fused')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            mode === 'fused'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          融合 (Fused)
        </button>
      </div>

      <svg viewBox="0 0 580 320" className="w-full">
        <defs>
          <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.red} />
          </marker>
          <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
          </marker>
          <marker id="arrow-mid" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
          </marker>
        </defs>

        {mode === 'unfused' ? (
          <>
            {/* Title */}
            <text x="290" y="25" fontSize="14" fontWeight="600" textAnchor="middle" fill={COLORS.red}>
              未融合：3 个独立 kernel，6 次内存访问
            </text>

            {/* Input */}
            <rect x="40" y="50" width="80" height="40" rx="4" fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="80" y="75" fontSize="11" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>Input</text>

            {/* Conv */}
            <path d="M 120 70 L 160 70" stroke={COLORS.red} strokeWidth="2" markerEnd="url(#arrow-red)" />
            <text x="140" y="62" fontSize="9" fill={COLORS.red} textAnchor="middle">read</text>

            <rect x="160" y="50" width="80" height="40" rx="4" fill={COLORS.waste} stroke={COLORS.red} strokeWidth="2" />
            <text x="200" y="68" fontSize="11" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>Conv</text>
            <text x="200" y="82" fontSize="9" textAnchor="middle" fill={COLORS.mid}>Launch 1</text>

            <path d="M 240 70 L 280 70" stroke={COLORS.red} strokeWidth="2" markerEnd="url(#arrow-red)" />
            <text x="260" y="62" fontSize="9" fill={COLORS.red} textAnchor="middle">write</text>

            {/* Temp buffer 1 */}
            <rect x="280" y="50" width="70" height="40" rx="4" fill={COLORS.masked} stroke={COLORS.mid} />
            <text x="315" y="68" fontSize="10" textAnchor="middle" fill={COLORS.dark}>Temp1</text>
            <text x="315" y="82" fontSize="8" textAnchor="middle" fill={COLORS.red}>Memory</text>

            {/* ReLU */}
            <path d="M 350 70 L 390 70" stroke={COLORS.red} strokeWidth="2" markerEnd="url(#arrow-red)" />
            <text x="370" y="62" fontSize="9" fill={COLORS.red} textAnchor="middle">read</text>

            <rect x="390" y="50" width="80" height="40" rx="4" fill={COLORS.waste} stroke={COLORS.red} strokeWidth="2" />
            <text x="430" y="68" fontSize="11" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>ReLU</text>
            <text x="430" y="82" fontSize="9" textAnchor="middle" fill={COLORS.mid}>Launch 2</text>

            <path d="M 470 70 L 500 70" stroke={COLORS.red} strokeWidth="2" markerEnd="url(#arrow-red)" />
            <text x="485" y="62" fontSize="9" fill={COLORS.red} textAnchor="middle">write</text>

            {/* Temp buffer 2 */}
            <rect x="40" y="120" width="70" height="40" rx="4" fill={COLORS.masked} stroke={COLORS.mid} />
            <text x="75" y="138" fontSize="10" textAnchor="middle" fill={COLORS.dark}>Temp2</text>
            <text x="75" y="152" fontSize="8" textAnchor="middle" fill={COLORS.red}>Memory</text>

            {/* Sum */}
            <path d="M 110 140 L 150 140" stroke={COLORS.red} strokeWidth="2" markerEnd="url(#arrow-red)" />
            <text x="130" y="132" fontSize="9" fill={COLORS.red} textAnchor="middle">read</text>

            <rect x="150" y="120" width="80" height="40" rx="4" fill={COLORS.waste} stroke={COLORS.red} strokeWidth="2" />
            <text x="190" y="138" fontSize="11" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>Sum</text>
            <text x="190" y="152" fontSize="9" textAnchor="middle" fill={COLORS.mid}>Launch 3</text>

            <path d="M 230 140 L 270 140" stroke={COLORS.red} strokeWidth="2" markerEnd="url(#arrow-red)" />
            <text x="250" y="132" fontSize="9" fill={COLORS.red} textAnchor="middle">write</text>

            {/* Output */}
            <rect x="270" y="120" width="80" height="40" rx="4" fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="310" y="145" fontSize="11" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>Output</text>

            {/* Arrows showing flow */}
            <path d="M 500 90 L 520 90 L 520 220 L 75 220 L 75 160" stroke={COLORS.mid} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow-mid)" />
          </>
        ) : (
          <>
            {/* Title */}
            <text x="290" y="25" fontSize="14" fontWeight="600" textAnchor="middle" fill={COLORS.green}>
              融合：1 个 kernel，2 次内存访问
            </text>

            {/* Input */}
            <rect x="120" y="70" width="100" height="50" rx="4" fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="170" y="100" fontSize="12" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>Input</text>

            {/* Arrow */}
            <path d="M 220 95 L 270 95" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrow-green)" />
            <text x="245" y="87" fontSize="9" fill={COLORS.green} textAnchor="middle">read once</text>

            {/* Fused kernel */}
            <rect x="270" y="50" width="140" height="90" rx="6" fill={COLORS.green} fillOpacity="0.1" stroke={COLORS.green} strokeWidth="2.5" />
            <text x="340" y="75" fontSize="13" textAnchor="middle" fontWeight="700" fill={COLORS.green}>Conv + ReLU + Sum</text>
            <text x="340" y="92" fontSize="10" textAnchor="middle" fill={COLORS.dark}>Single Launch</text>
            <text x="340" y="108" fontSize="9" textAnchor="middle" fill={COLORS.mid}>Pipelined execution</text>
            <text x="340" y="124" fontSize="9" textAnchor="middle" fill={COLORS.mid}>No intermediate storage</text>

            {/* Arrow */}
            <path d="M 410 95 L 460 95" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrow-green)" />
            <text x="435" y="87" fontSize="9" fill={COLORS.green} textAnchor="middle">write once</text>

            {/* Output */}
            <rect x="460" y="70" width="100" height="50" rx="4" fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="510" y="100" fontSize="12" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>Output</text>
          </>
        )}

        {/* Metrics */}
        <rect x="20" y="180" width="540" height="120" rx="8" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1.5" />
        <text x="290" y="200" fontSize="13" fontWeight="600" textAnchor="middle" fill={COLORS.dark}>性能对比</text>

        {/* Launches */}
        <text x="40" y="225" fontSize="11" fill={COLORS.mid}>Kernel 启动次数:</text>
        <rect x="180" y="213" width={mode === 'unfused' ? 120 : 40} height="18" rx="3"
              fill={mode === 'unfused' ? COLORS.waste : COLORS.green} fillOpacity="0.3" stroke={mode === 'unfused' ? COLORS.red : COLORS.green} />
        <text x="190" y="226" fontSize="11" fontWeight="600" fill={COLORS.dark}>{mode === 'unfused' ? '3' : '1'}</text>

        {/* Memory ops */}
        <text x="40" y="250" fontSize="11" fill={COLORS.mid}>内存操作次数:</text>
        <rect x="180" y="238" width={mode === 'unfused' ? 240 : 80} height="18" rx="3"
              fill={mode === 'unfused' ? COLORS.waste : COLORS.green} fillOpacity="0.3" stroke={mode === 'unfused' ? COLORS.red : COLORS.green} />
        <text x="190" y="251" fontSize="11" fontWeight="600" fill={COLORS.dark}>{mode === 'unfused' ? '6' : '2'}</text>

        {/* Speedup */}
        <text x="40" y="275" fontSize="11" fill={COLORS.mid}>相对性能:</text>
        <rect x="180" y="263" width={mode === 'unfused' ? 60 : 180} height="18" rx="3"
              fill={mode === 'unfused' ? COLORS.waste : COLORS.green} fillOpacity="0.3" stroke={mode === 'unfused' ? COLORS.red : COLORS.green} />
        <text x="190" y="276" fontSize="11" fontWeight="600" fill={mode === 'unfused' ? COLORS.red : COLORS.green}>
          {mode === 'unfused' ? '1.0×' : '2.5× ~ 3.5×'}
        </text>

        {/* Summary */}
        <rect x="340" y="213" width="220" height="67" rx="4" fill={COLORS.highlight} stroke={COLORS.orange} />
        <text x="450" y="233" fontSize="10" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>
          {mode === 'unfused' ? '❌ 浪费带宽与启动开销' : '✅ 节省带宽与延迟'}
        </text>
        <text x="450" y="250" fontSize="9" textAnchor="middle" fill={COLORS.mid}>
          {mode === 'unfused'
            ? '中间结果需写回 VRAM'
            : '数据留在寄存器/L1 cache'
          }
        </text>
        <text x="450" y="265" fontSize="9" textAnchor="middle" fill={COLORS.mid}>
          {mode === 'unfused'
            ? 'Kernel 启动同步开销大'
            : 'Pipeline 并行，无同步'
          }
        </text>
      </svg>
    </div>
  );
};

export default PostOpFusion;
