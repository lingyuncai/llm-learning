import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Operator = 'matmul' | 'softmax' | 'layernorm';

const PluginKernelSelection: React.FC = () => {
  const [selected, setSelected] = useState<Operator>('matmul');

  const renderFlowchart = () => {
    switch (selected) {
      case 'matmul':
        return (
          <svg viewBox="0 0 580 340" className="w-full">
            <defs>
              <marker
                id="arrow-kernel"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>

            <rect x={200} y={20} width={180} height={50} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} strokeWidth={2} rx={4} />
            <text x={290} y={45} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.dark}>MatMul Operation</text>

            <line x1={290} y1={70} x2={290} y2={98} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel)" />

            <rect x={200} y={100} width={180} height={40} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} rx={4} />
            <text x={290} y={125} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>Check oneDNN support?</text>

            <line x1={290} y1={140} x2={290} y2={168} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel)" />
            <text x={310} y={158} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.green}>Yes</text>

            <rect x={200} y={170} width={180} height={40} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} rx={4} />
            <text x={290} y={195} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>Has XMX (Xe-HPC)?</text>

            {/* Yes path - XMX available */}
            <line x1={380} y1={190} x2={460} y2={190} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel)" />
            <text x={400} y={185} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.green}>Yes</text>

            <rect x={460} y={160} width={110} height={80} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} strokeWidth={2} rx={4} />
            <text x={515} y={185} textAnchor="middle" fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>oneDNN</text>
            <text x={515} y={202} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>SPIR-V kernel</text>
            <text x={515} y={218} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.orange}>XMX systolic</text>
            <text x={515} y={232} textAnchor="middle" fontFamily={FONTS.mono} fontSize={14} fill={COLORS.green}>★★★</text>

            {/* No path - fallback OpenCL */}
            <line x1={290} y1={210} x2={290} y2={258} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel)" />
            <text x={310} y={238} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.red}>No</text>

            <rect x={200} y={260} width={180} height={70} fill={COLORS.orange} fillOpacity={0.15} stroke={COLORS.orange} strokeWidth={2} rx={4} />
            <text x={290} y={280} textAnchor="middle" fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.orange}>OpenCL Fallback</text>
            <text x={290} y={297} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Generic kernel</text>
            <text x={290} y={314} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>EU threads</text>
            <text x={290} y={325} textAnchor="middle" fontFamily={FONTS.mono} fontSize={14} fill={COLORS.orange}>★★</text>
          </svg>
        );

      case 'softmax':
        return (
          <svg viewBox="0 0 580 340" className="w-full">
            <defs>
              <marker
                id="arrow-kernel2"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>

            <rect x={200} y={20} width={180} height={50} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} strokeWidth={2} rx={4} />
            <text x={290} y={45} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.dark}>Softmax Operation</text>

            <line x1={290} y1={70} x2={290} y2={98} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel2)" />

            <rect x={200} y={100} width={180} height={40} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} rx={4} />
            <text x={290} y={125} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>Check oneDNN support?</text>

            <line x1={290} y1={140} x2={290} y2={168} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel2)" />
            <text x={310} y={158} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.green}>Yes</text>

            <rect x={200} y={170} width={180} height={40} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} rx={4} />
            <text x={290} y={195} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>GPU optimized kernel?</text>

            {/* Yes path */}
            <line x1={380} y1={190} x2={460} y2={190} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel2)" />
            <text x={400} y={185} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.green}>Yes</text>

            <rect x={460} y={160} width={110} height={80} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} strokeWidth={2} rx={4} />
            <text x={515} y={185} textAnchor="middle" fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>oneDNN</text>
            <text x={515} y={202} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Reduction opt</text>
            <text x={515} y={218} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>Sub-group scan</text>
            <text x={515} y={232} textAnchor="middle" fontFamily={FONTS.mono} fontSize={14} fill={COLORS.green}>★★★</text>

            {/* Limited path */}
            <line x1={290} y1={210} x2={290} y2={258} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel2)" />
            <text x={270} y={238} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.orange}>Limited</text>

            <rect x={200} y={260} width={180} height={70} fill={COLORS.orange} fillOpacity={0.15} stroke={COLORS.orange} strokeWidth={2} rx={4} />
            <text x={290} y={280} textAnchor="middle" fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.orange}>OpenCL Reference</text>
            <text x={290} y={297} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Simple reduction</text>
            <text x={290} y={314} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>Work-group local mem</text>
            <text x={290} y={325} textAnchor="middle" fontFamily={FONTS.mono} fontSize={14} fill={COLORS.orange}>★★</text>
          </svg>
        );

      case 'layernorm':
        return (
          <svg viewBox="0 0 580 340" className="w-full">
            <defs>
              <marker
                id="arrow-kernel3"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>

            <rect x={200} y={20} width={180} height={50} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} strokeWidth={2} rx={4} />
            <text x={290} y={45} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.dark}>LayerNorm Operation</text>

            <line x1={290} y1={70} x2={290} y2={98} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel3)" />

            <rect x={200} y={100} width={180} height={40} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} rx={4} />
            <text x={290} y={125} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>Check oneDNN support?</text>

            <line x1={290} y1={140} x2={290} y2={168} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel3)" />
            <text x={310} y={158} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.green}>Yes</text>

            <rect x={200} y={170} width={180} height={40} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} rx={4} />
            <text x={290} y={195} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>Fused primitive available?</text>

            {/* Yes path */}
            <line x1={380} y1={190} x2={460} y2={190} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel3)" />
            <text x={400} y={185} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.green}>Yes</text>

            <rect x={460} y={160} width={110} height={80} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} strokeWidth={2} rx={4} />
            <text x={515} y={185} textAnchor="middle" fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>oneDNN</text>
            <text x={515} y={202} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Fused LN+Scale</text>
            <text x={515} y={218} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>Single kernel pass</text>
            <text x={515} y={232} textAnchor="middle" fontFamily={FONTS.mono} fontSize={14} fill={COLORS.green}>★★★</text>

            {/* No path */}
            <line x1={290} y1={210} x2={290} y2={258} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-kernel3)" />
            <text x={310} y={238} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.red}>No</text>

            <rect x={200} y={260} width={180} height={70} fill={COLORS.red} fillOpacity={0.1} stroke={COLORS.red} strokeWidth={2} rx={4} />
            <text x={290} y={280} textAnchor="middle" fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.red}>OpenCL Decomposed</text>
            <text x={290} y={297} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Mean → Variance → Scale</text>
            <text x={290} y={314} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>3 kernel launches</text>
            <text x={290} y={325} textAnchor="middle" fontFamily={FONTS.mono} fontSize={14} fill={COLORS.red}>★</text>
          </svg>
        );
    }
  };

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelected('matmul')}
          className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
            selected === 'matmul'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          MatMul
        </button>
        <button
          onClick={() => setSelected('softmax')}
          className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
            selected === 'softmax'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Softmax
        </button>
        <button
          onClick={() => setSelected('layernorm')}
          className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
            selected === 'layernorm'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          LayerNorm
        </button>
      </div>

      {renderFlowchart()}

      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-600 rounded">
        <p className="text-sm text-gray-700 font-mono">
          <strong>策略：</strong>oneDNN primitives 首选（利用硬件加速单元），OpenCL 作为通用 fallback
        </p>
      </div>
    </div>
  );
};

export default PluginKernelSelection;
