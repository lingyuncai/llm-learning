import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'sync' | 'async';

const AsyncPipeline: React.FC = () => {
  const [mode, setMode] = useState<Mode>('sync');

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('sync')}
          className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
            mode === 'sync'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          同步模式
        </button>
        <button
          onClick={() => setMode('async')}
          className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
            mode === 'async'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          异步模式
        </button>
      </div>

      <svg viewBox="0 0 580 300" className="w-full">
        {mode === 'sync' ? (
          <>
            {/* Sync mode Gantt chart */}
            <text x={10} y={25} fontFamily={FONTS.sans} fontSize={14} fontWeight="bold" fill={COLORS.dark}>
              同步推理（阻塞模式）
            </text>

            {/* Time axis */}
            <line x1={80} y1={55} x2={560} y2={55} stroke={COLORS.light} strokeWidth={2} />
            <text x={80} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>0</text>
            <text x={200} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>10ms</text>
            <text x={320} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>20ms</text>
            <text x={440} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>30ms</text>
            <text x={560} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>40ms</text>

            {/* CPU row */}
            <text x={10} y={85} fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.primary}>CPU</text>
            <rect x={80} y={70} width={50} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={105} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">Submit</text>

            {/* CPU waiting */}
            <rect x={130} y={70} width={100} height={30} fill={COLORS.masked} fillOpacity={0.5} stroke={COLORS.mid} strokeDasharray="3,2" rx={2} />
            <text x={180} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>Wait</text>

            {/* CPU result */}
            <rect x={230} y={70} width={30} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={245} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">Res</text>

            {/* Second request */}
            <rect x={280} y={70} width={50} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={305} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">Submit</text>

            <rect x={330} y={70} width={100} height={30} fill={COLORS.masked} fillOpacity={0.5} stroke={COLORS.mid} strokeDasharray="3,2" rx={2} />
            <text x={380} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>Wait</text>

            {/* GPU row */}
            <text x={10} y={135} fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>GPU</text>

            {/* GPU idle initially */}
            <rect x={80} y={120} width={50} height={30} fill={COLORS.masked} fillOpacity={0.5} stroke={COLORS.mid} strokeDasharray="3,2" rx={2} />
            <text x={105} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>Idle</text>

            {/* GPU processing */}
            <rect x={130} y={120} width={100} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={180} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">Process 1</text>

            {/* GPU idle */}
            <rect x={230} y={120} width={50} height={30} fill={COLORS.masked} fillOpacity={0.5} stroke={COLORS.mid} strokeDasharray="3,2" rx={2} />
            <text x={255} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>Idle</text>

            {/* GPU processing 2 */}
            <rect x={330} y={120} width={100} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={380} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">Process 2</text>

            {/* Metrics */}
            <rect x={100} y={190} width={380} height={70} fill={COLORS.red} fillOpacity={0.1} stroke={COLORS.red} strokeWidth={2} rx={4} />
            <text x={290} y={215} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.red}>
              吞吐量：~100 infer/s
            </text>
            <text x={290} y={235} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
              CPU 阻塞等待 GPU 完成，大量空闲时间
            </text>
            <text x={290} y={250} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
              利用率：CPU ~40%, GPU ~60%
            </text>
          </>
        ) : (
          <>
            {/* Async mode Gantt chart */}
            <text x={10} y={25} fontFamily={FONTS.sans} fontSize={14} fontWeight="bold" fill={COLORS.dark}>
              异步推理（并发模式）
            </text>

            {/* Time axis */}
            <line x1={80} y1={55} x2={560} y2={55} stroke={COLORS.light} strokeWidth={2} />
            <text x={80} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>0</text>
            <text x={200} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>10ms</text>
            <text x={320} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>20ms</text>
            <text x={440} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>30ms</text>
            <text x={560} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>40ms</text>

            {/* CPU row - continuous activity */}
            <text x={10} y={85} fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.primary}>CPU</text>
            <rect x={80} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={100} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">Sub1</text>

            <rect x={125} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={145} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">Sub2</text>

            <rect x={170} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={190} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">Sub3</text>

            <rect x={215} y={70} width={30} height={30} fill={COLORS.primary} fillOpacity={0.5} stroke={COLORS.primary} rx={2} />
            <text x={230} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">R1</text>

            <rect x={250} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={270} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">Sub4</text>

            <rect x={295} y={70} width={30} height={30} fill={COLORS.primary} fillOpacity={0.5} stroke={COLORS.primary} rx={2} />
            <text x={310} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">R2</text>

            <rect x={330} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={350} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">Sub5</text>

            <rect x={375} y={70} width={30} height={30} fill={COLORS.primary} fillOpacity={0.5} stroke={COLORS.primary} rx={2} />
            <text x={390} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">R3</text>

            {/* GPU row - continuous processing */}
            <text x={10} y={135} fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>GPU</text>

            <rect x={90} y={120} width={90} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={135} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">Process 1</text>

            <rect x={185} y={120} width={90} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={230} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">Process 2</text>

            <rect x={280} y={120} width={90} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={325} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">Process 3</text>

            <rect x={375} y={120} width={90} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={420} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">Process 4</text>

            {/* Overlap indicator */}
            <line x1={120} y1={110} x2={160} y2={80} stroke={COLORS.orange} strokeWidth={1} strokeDasharray="2,2" />
            <text x={140} y={105} textAnchor="middle" fontFamily={FONTS.mono} fontSize={8} fill={COLORS.orange}>Overlap</text>

            {/* Metrics */}
            <rect x={100} y={190} width={380} height={70} fill={COLORS.green} fillOpacity={0.1} stroke={COLORS.green} strokeWidth={2} rx={4} />
            <text x={290} y={215} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.green}>
              吞吐量：~280 infer/s
            </text>
            <text x={290} y={235} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
              CPU 和 GPU 并行工作，最小化空闲时间
            </text>
            <text x={290} y={250} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
              利用率：CPU ~85%, GPU ~90%（加速 2.8x）
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export default AsyncPipeline;
