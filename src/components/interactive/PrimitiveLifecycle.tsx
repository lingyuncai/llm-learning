import React, { useState } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const PrimitiveLifecycle: React.FC = () => {
  const steps = [
    {
      title: '创建 Engine',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Engine 代表计算设备（CPU、GPU、FPGA）。创建时指定设备类型和索引。
          </p>
          <pre className="text-xs bg-gray-50 p-2 rounded border" style={{ fontFamily: FONTS.mono }}>
            {`dnnl::engine eng(dnnl::engine::kind::gpu, 0);`}
          </pre>
          <svg viewBox="0 0 580 160" className="w-full">
            <defs>
              <linearGradient id="engineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.2" />
                <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Engine box */}
            <rect x="200" y="30" width="180" height="100" rx="8"
                  fill="url(#engineGrad)" stroke={COLORS.primary} strokeWidth="2" />

            {/* GPU icon */}
            <rect x="220" y="50" width="50" height="35" rx="4" fill={COLORS.primary} opacity="0.3" />
            <rect x="226" y="56" width="12" height="23" fill={COLORS.primary} />
            <rect x="242" y="56" width="12" height="23" fill={COLORS.primary} />
            <rect x="258" y="56" width="12" height="23" fill={COLORS.primary} />

            {/* Text */}
            <text x="285" y="75" fontSize="16" fontWeight="600" fill={COLORS.dark}>Engine (GPU)</text>
            <text x="220" y="105" fontSize="12" fill={COLORS.mid}>Device: Intel Xe2</text>
            <text x="220" y="120" fontSize="12" fill={COLORS.mid}>Index: 0</text>
          </svg>
        </div>
      ),
    },
    {
      title: '创建 Primitive Descriptor',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Primitive Descriptor 描述操作的「WHAT」：算子类型、张量形状、数据类型、内存格式。
          </p>
          <p className="text-sm font-semibold text-orange-700 bg-orange-50 p-2 rounded border border-orange-200">
            ⚠️ 此时 oneDNN 会查询所有可用实现，选择最优算法（如 Winograd、Direct、Im2col 等）
          </p>
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Descriptor card */}
            <rect x="120" y="20" width="340" height="120" rx="8"
                  fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="2" />

            {/* Form fields */}
            <text x="140" y="45" fontSize="13" fontWeight="600" fill={COLORS.dark}>Primitive Descriptor</text>

            <text x="140" y="68" fontSize="11" fill={COLORS.mid}>Operation:</text>
            <rect x="220" y="56" width="220" height="18" rx="3" fill="white" stroke={COLORS.light} />
            <text x="228" y="68" fontSize="11" fill={COLORS.dark}>Convolution (Forward)</text>

            <text x="140" y="93" fontSize="11" fill={COLORS.mid}>Input Shape:</text>
            <rect x="220" y="81" width="220" height="18" rx="3" fill="white" stroke={COLORS.light} />
            <text x="228" y="93" fontSize="11" fill={COLORS.dark}>[1, 64, 224, 224] (NCHW)</text>

            <text x="140" y="118" fontSize="11" fill={COLORS.mid}>Data Type:</text>
            <rect x="220" y="106" width="100" height="18" rx="3" fill="white" stroke={COLORS.light} />
            <text x="228" y="118" fontSize="11" fill={COLORS.dark}>FP16</text>

            <text x="330" y="118" fontSize="11" fill={COLORS.mid}>Algorithm:</text>
            <rect x="390" y="106" width="50" height="18" rx="3" fill={COLORS.highlight} stroke={COLORS.orange} />
            <text x="398" y="118" fontSize="11" fontWeight="600" fill={COLORS.orange}>Auto</text>
          </svg>
        </div>
      ),
    },
    {
      title: '创建 Primitive',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            根据 Descriptor 编译出具体的 GPU kernel。这是最耗时的步骤。
          </p>
          <p className="text-sm font-semibold text-red-700 bg-red-50 p-2 rounded border border-red-200">
            🐌 这一步最慢，涉及 SPIR-V/OpenCL kernel 编译（50-200ms），必须缓存复用
          </p>
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Descriptor */}
            <rect x="40" y="50" width="120" height="60" rx="6"
                  fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1.5" />
            <text x="100" y="75" fontSize="12" textAnchor="middle" fill={COLORS.dark}>Descriptor</text>
            <text x="100" y="92" fontSize="10" textAnchor="middle" fill={COLORS.mid}>Conv FP16</text>

            {/* Arrow */}
            <path d="M 160 80 L 210 80" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead)" />

            {/* Compilation gear */}
            <circle cx="290" cy="80" r="40" fill={COLORS.orange} opacity="0.1" />
            <text x="290" y="70" fontSize="32" textAnchor="middle">⚙️</text>
            <text x="290" y="95" fontSize="10" textAnchor="middle" fontWeight="600" fill={COLORS.orange}>Compiling...</text>
            <text x="290" y="108" fontSize="9" textAnchor="middle" fill={COLORS.mid}>~100ms</text>

            {/* Arrow */}
            <path d="M 370 80 L 420 80" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead)" />

            {/* Primitive */}
            <rect x="420" y="50" width="120" height="60" rx="6"
                  fill={COLORS.primary} fillOpacity="0.1" stroke={COLORS.primary} strokeWidth="2" />
            <text x="480" y="75" fontSize="12" textAnchor="middle" fontWeight="600" fill={COLORS.primary}>Primitive</text>
            <text x="480" y="92" fontSize="10" textAnchor="middle" fill={COLORS.mid}>Executable</text>

            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>
          </svg>
        </div>
      ),
    },
    {
      title: 'Execute',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            将 Primitive 和输入输出内存提交到 GPU stream 执行。调用立即返回（异步）。
          </p>
          <pre className="text-xs bg-gray-50 p-2 rounded border" style={{ fontFamily: FONTS.mono }}>
            {`primitive.execute(stream, args);  // 异步提交`}
          </pre>
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Primitive + Buffers */}
            <rect x="40" y="30" width="100" height="40" rx="4"
                  fill={COLORS.primary} fillOpacity="0.1" stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="90" y="55" fontSize="11" textAnchor="middle" fontWeight="600" fill={COLORS.primary}>Primitive</text>

            <rect x="40" y="80" width="100" height="30" rx="4" fill={COLORS.valid} stroke={COLORS.primary} />
            <text x="90" y="99" fontSize="10" textAnchor="middle" fill={COLORS.dark}>Input Buffer</text>

            <rect x="40" y="120" width="100" height="30" rx="4" fill={COLORS.masked} stroke={COLORS.mid} />
            <text x="90" y="139" fontSize="10" textAnchor="middle" fill={COLORS.dark}>Output Buffer</text>

            {/* Arrow to GPU */}
            <path d="M 150 80 L 220 80" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow2)" />
            <text x="185" y="72" fontSize="9" fill={COLORS.mid}>Submit</text>

            {/* GPU */}
            <rect x="220" y="40" width="140" height="80" rx="8"
                  fill={COLORS.primary} fillOpacity="0.15" stroke={COLORS.primary} strokeWidth="2" />
            <text x="290" y="75" fontSize="14" textAnchor="middle" fontWeight="700" fill={COLORS.primary}>GPU</text>
            <text x="290" y="92" fontSize="10" textAnchor="middle" fill={COLORS.mid}>Xe Cores Executing</text>
            <text x="290" y="108" fontSize="9" textAnchor="middle" fill={COLORS.orange}>Async ⚡</text>

            {/* Arrow to Output */}
            <path d="M 370 80 L 440 80" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrow3)" />

            {/* Output */}
            <rect x="440" y="60" width="100" height="40" rx="4" fill={COLORS.green} fillOpacity="0.1" stroke={COLORS.green} strokeWidth="2" />
            <text x="490" y="85" fontSize="11" textAnchor="middle" fontWeight="600" fill={COLORS.green}>Output</text>

            <defs>
              <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.primary} />
              </marker>
              <marker id="arrow3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.green} />
              </marker>
            </defs>
          </svg>
        </div>
      ),
    },
    {
      title: '结果与复用',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            执行完成后结果写入 output buffer。Primitive 对象可以缓存复用，避免重复编译。
          </p>
          <p className="text-sm font-semibold text-green-700 bg-green-50 p-2 rounded border border-green-200">
            ✅ 缓存策略：用 (op_type, shapes, dtypes, format) 做 key，LRU 淘汰，命中率可达 95%+
          </p>
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Results */}
            <rect x="60" y="40" width="140" height="80" rx="6"
                  fill={COLORS.green} fillOpacity="0.1" stroke={COLORS.green} strokeWidth="2" />
            <text x="130" y="70" fontSize="13" textAnchor="middle" fontWeight="600" fill={COLORS.green}>Results Ready</text>
            <text x="130" y="90" fontSize="10" textAnchor="middle" fill={COLORS.dark}>Output: [1,64,224,224]</text>
            <text x="130" y="105" fontSize="9" textAnchor="middle" fill={COLORS.mid}>Latency: 2.3ms</text>

            {/* Plus */}
            <text x="240" y="90" fontSize="32" fill={COLORS.mid}>+</text>

            {/* Cache */}
            <rect x="300" y="40" width="220" height="80" rx="6"
                  fill={COLORS.primary} fillOpacity="0.1" stroke={COLORS.primary} strokeWidth="2" />
            <text x="410" y="60" fontSize="24" textAnchor="middle">💾</text>
            <text x="410" y="85" fontSize="13" textAnchor="middle" fontWeight="600" fill={COLORS.primary}>Primitive Cached</text>
            <text x="410" y="102" fontSize="10" textAnchor="middle" fill={COLORS.mid}>Reusable for next batch</text>

            {/* Cache stats */}
            <rect x="80" y="135" width="420" height="20" rx="4" fill={COLORS.bgAlt} stroke={COLORS.light} />
            <text x="290" y="149" fontSize="10" textAnchor="middle" fill={COLORS.dark}>
              Cache: 128 entries | Hit rate: 96% | Compile time saved: ~10s per inference
            </text>
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">oneDNN Primitive 生命周期</h3>
      <StepNavigator steps={steps} />
    </div>
  );
};

export default PrimitiveLifecycle;
