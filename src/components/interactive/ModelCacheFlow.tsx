import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'first' | 'cached';

const ModelCacheFlow: React.FC = () => {
  const [mode, setMode] = useState<Mode>('first');

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('first')}
          className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
            mode === 'first'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          首次加载
        </button>
        <button
          onClick={() => setMode('cached')}
          className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
            mode === 'cached'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          缓存加载
        </button>
      </div>

      <svg viewBox="0 0 580 300" className="w-full">
        {mode === 'first' ? (
          <>
            {/* First load timeline */}
            <text x={10} y={30} fontFamily={FONTS.sans} fontSize={14} fontWeight="bold" fill={COLORS.dark}>
              首次加载流程（无缓存）
            </text>

            {/* Timeline axis */}
            <line x1={50} y1={80} x2={550} y2={80} stroke={COLORS.light} strokeWidth={2} />

            {/* Tick marks */}
            <line x1={50} y1={75} x2={50} y2={85} stroke={COLORS.mid} strokeWidth={1} />
            <text x={50} y={100} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>0ms</text>

            <line x1={200} y1={75} x2={200} y2={85} stroke={COLORS.mid} strokeWidth={1} />
            <text x={200} y={100} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>1000ms</text>

            <line x1={350} y1={75} x2={350} y2={85} stroke={COLORS.mid} strokeWidth={1} />
            <text x={350} y={100} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>2000ms</text>

            <line x1={500} y1={75} x2={500} y2={85} stroke={COLORS.mid} strokeWidth={1} />
            <text x={500} y={100} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>2350ms</text>

            {/* Read phase */}
            <rect x={50} y={120} width={37.5} height={40} fill={COLORS.red} fillOpacity={0.3} stroke={COLORS.red} strokeWidth={2} rx={3} />
            <text x={68.75} y={145} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Read</text>
            <text x={68.75} y={175} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>50ms</text>

            {/* Optimize phase */}
            <rect x={87.5} y={120} width={75} height={40} fill={COLORS.red} fillOpacity={0.3} stroke={COLORS.red} strokeWidth={2} rx={3} />
            <text x={125} y={145} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Optimize</text>
            <text x={125} y={175} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>100ms</text>

            {/* Compile phase - longest */}
            <rect x={162.5} y={120} width={300} height={40} fill={COLORS.red} fillOpacity={0.3} stroke={COLORS.red} strokeWidth={2} rx={3} />
            <text x={312.5} y={138} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Compile (oneDNN + OpenCL)</text>
            <text x={312.5} y={152} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>SPIR-V generation, JIT, link</text>
            <text x={312.5} y={175} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>2000ms</text>

            {/* Cache write phase */}
            <rect x={462.5} y={120} width={37.5} height={40} fill={COLORS.red} fillOpacity={0.3} stroke={COLORS.red} strokeWidth={2} rx={3} />
            <text x={481.25} y={138} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.dark}>Cache</text>
            <text x={481.25} y={148} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.dark}>Write</text>
            <text x={481.25} y={175} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>200ms</text>

            {/* Ready marker */}
            <circle cx={520} cy={140} r={8} fill={COLORS.green} />
            <text x={520} y={190} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fontWeight="bold" fill={COLORS.green}>Ready</text>

            {/* Total time */}
            <rect x={150} y={220} width={280} height={50} fill={COLORS.red} fillOpacity={0.1} stroke={COLORS.red} strokeWidth={2} rx={4} />
            <text x={290} y={242} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.red}>
              总耗时：~2350ms
            </text>
            <text x={290} y={260} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
              编译阶段占比 85%
            </text>
          </>
        ) : (
          <>
            {/* Cached load timeline */}
            <text x={10} y={30} fontFamily={FONTS.sans} fontSize={14} fontWeight="bold" fill={COLORS.dark}>
              缓存加载流程
            </text>

            {/* Timeline axis */}
            <line x1={50} y1={80} x2={350} y2={80} stroke={COLORS.light} strokeWidth={2} />

            {/* Tick marks */}
            <line x1={50} y1={75} x2={50} y2={85} stroke={COLORS.mid} strokeWidth={1} />
            <text x={50} y={100} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>0ms</text>

            <line x1={150} y1={75} x2={150} y2={85} stroke={COLORS.mid} strokeWidth={1} />
            <text x={150} y={100} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>50ms</text>

            <line x1={300} y1={75} x2={300} y2={85} stroke={COLORS.mid} strokeWidth={1} />
            <text x={300} y={100} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>150ms</text>

            {/* Read phase */}
            <rect x={50} y={120} width={75} height={40} fill={COLORS.green} fillOpacity={0.3} stroke={COLORS.green} strokeWidth={2} rx={3} />
            <text x={87.5} y={145} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Read</text>
            <text x={87.5} y={175} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>50ms</text>

            {/* Load cache phase */}
            <rect x={125} y={120} width={150} height={40} fill={COLORS.green} fillOpacity={0.3} stroke={COLORS.green} strokeWidth={2} rx={3} />
            <text x={200} y={138} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Load Cache</text>
            <text x={200} y={152} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>Deserialize compiled binary</text>
            <text x={200} y={175} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>100ms</text>

            {/* Ready marker */}
            <circle cx={300} cy={140} r={8} fill={COLORS.green} />
            <text x={300} y={190} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fontWeight="bold" fill={COLORS.green}>Ready</text>

            {/* Total time */}
            <rect x={150} y={220} width={280} height={50} fill={COLORS.green} fillOpacity={0.1} stroke={COLORS.green} strokeWidth={2} rx={4} />
            <text x={290} y={242} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.green}>
              总耗时：~150ms
            </text>
            <text x={290} y={260} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
              加速比：15.7x
            </text>
          </>
        )}

        {/* Cache key explanation */}
        <rect x={10} y={280} width={560} height={1} fill={COLORS.light} />
        <text x={290} y={295} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>
          Cache key = hash(model) + device_id + driver_version + compiler_version
        </text>
      </svg>
    </div>
  );
};

export default ModelCacheFlow;
