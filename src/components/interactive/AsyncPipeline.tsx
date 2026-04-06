import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'sync' | 'async';

const AsyncPipeline: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const [mode, setMode] = useState<Mode>('sync');

  const t = {
    zh: {
      syncMode: '同步模式',
      asyncMode: '异步模式',
      syncHeading: '同步推理（阻塞模式）',
      asyncHeading: '异步推理（并发模式）',
      submit: 'Submit',
      wait: 'Wait',
      result: 'Res',
      idle: 'Idle',
      process: 'Process',
      overlap: 'Overlap',
      syncThroughput: '吞吐量：~100 infer/s',
      syncDesc: 'CPU 阻塞等待 GPU 完成，大量空闲时间',
      syncUtil: '利用率：CPU ~40%, GPU ~60%',
      asyncThroughput: '吞吐量：~280 infer/s',
      asyncDesc: 'CPU 和 GPU 并行工作，最小化空闲时间',
      asyncUtil: '利用率：CPU ~85%, GPU ~90%（加速 2.8x）',
    },
    en: {
      syncMode: 'Sync Mode',
      asyncMode: 'Async Mode',
      syncHeading: 'Synchronous Inference (Blocking)',
      asyncHeading: 'Asynchronous Inference (Concurrent)',
      submit: 'Submit',
      wait: 'Wait',
      result: 'Res',
      idle: 'Idle',
      process: 'Process',
      overlap: 'Overlap',
      syncThroughput: 'Throughput: ~100 infer/s',
      syncDesc: 'CPU blocks waiting for GPU completion, lots of idle time',
      syncUtil: 'Utilization: CPU ~40%, GPU ~60%',
      asyncThroughput: 'Throughput: ~280 infer/s',
      asyncDesc: 'CPU and GPU work in parallel, minimizing idle time',
      asyncUtil: 'Utilization: CPU ~85%, GPU ~90% (2.8x speedup)',
    },
  }[locale];

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
          {t.syncMode}
        </button>
        <button
          onClick={() => setMode('async')}
          className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
            mode === 'async'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t.asyncMode}
        </button>
      </div>

      <svg viewBox="0 0 580 300" className="w-full">
        {mode === 'sync' ? (
          <>
            {/* Sync mode Gantt chart */}
            <text x={10} y={25} fontFamily={FONTS.sans} fontSize={14} fontWeight="bold" fill={COLORS.dark}>
              {t.syncHeading}
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
            <text x={105} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">{t.submit}</text>

            {/* CPU waiting */}
            <rect x={130} y={70} width={100} height={30} fill={COLORS.masked} fillOpacity={0.5} stroke={COLORS.mid} strokeDasharray="3,2" rx={2} />
            <text x={180} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>{t.wait}</text>

            {/* CPU result */}
            <rect x={230} y={70} width={30} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={245} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{t.result}</text>

            {/* Second request */}
            <rect x={280} y={70} width={50} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={305} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">{t.submit}</text>

            <rect x={330} y={70} width={100} height={30} fill={COLORS.masked} fillOpacity={0.5} stroke={COLORS.mid} strokeDasharray="3,2" rx={2} />
            <text x={380} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>{t.wait}</text>

            {/* GPU row */}
            <text x={10} y={135} fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>GPU</text>

            {/* GPU idle initially */}
            <rect x={80} y={120} width={50} height={30} fill={COLORS.masked} fillOpacity={0.5} stroke={COLORS.mid} strokeDasharray="3,2" rx={2} />
            <text x={105} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>{t.idle}</text>

            {/* GPU processing */}
            <rect x={130} y={120} width={100} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={180} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">{t.process} 1</text>

            {/* GPU idle */}
            <rect x={230} y={120} width={50} height={30} fill={COLORS.masked} fillOpacity={0.5} stroke={COLORS.mid} strokeDasharray="3,2" rx={2} />
            <text x={255} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>{t.idle}</text>

            {/* GPU processing 2 */}
            <rect x={330} y={120} width={100} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={380} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">{t.process} 2</text>

            {/* Metrics */}
            <rect x={100} y={190} width={380} height={70} fill={COLORS.red} fillOpacity={0.1} stroke={COLORS.red} strokeWidth={2} rx={4} />
            <text x={290} y={215} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.red}>
              {t.syncThroughput}
            </text>
            <text x={290} y={235} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
              {t.syncDesc}
            </text>
            <text x={290} y={250} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
              {t.syncUtil}
            </text>
          </>
        ) : (
          <>
            {/* Async mode Gantt chart */}
            <text x={10} y={25} fontFamily={FONTS.sans} fontSize={14} fontWeight="bold" fill={COLORS.dark}>
              {t.asyncHeading}
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
            <text x={100} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{locale === 'zh' ? '提交1' : 'Sub1'}</text>

            <rect x={125} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={145} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{locale === 'zh' ? '提交2' : 'Sub2'}</text>

            <rect x={170} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={190} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{locale === 'zh' ? '提交3' : 'Sub3'}</text>

            <rect x={215} y={70} width={30} height={30} fill={COLORS.primary} fillOpacity={0.5} stroke={COLORS.primary} rx={2} />
            <text x={230} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{locale === 'zh' ? '结果1' : 'R1'}</text>

            <rect x={250} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={270} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{locale === 'zh' ? '提交4' : 'Sub4'}</text>

            <rect x={295} y={70} width={30} height={30} fill={COLORS.primary} fillOpacity={0.5} stroke={COLORS.primary} rx={2} />
            <text x={310} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{locale === 'zh' ? '结果2' : 'R2'}</text>

            <rect x={330} y={70} width={40} height={30} fill={COLORS.primary} fillOpacity={0.7} stroke={COLORS.primary} rx={2} />
            <text x={350} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{locale === 'zh' ? '提交5' : 'Sub5'}</text>

            <rect x={375} y={70} width={30} height={30} fill={COLORS.primary} fillOpacity={0.5} stroke={COLORS.primary} rx={2} />
            <text x={390} y={90} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill="white">{locale === 'zh' ? '结果3' : 'R3'}</text>

            {/* GPU row - continuous processing */}
            <text x={10} y={135} fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>GPU</text>

            <rect x={90} y={120} width={90} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={135} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">{t.process} 1</text>

            <rect x={185} y={120} width={90} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={230} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">{t.process} 2</text>

            <rect x={280} y={120} width={90} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={325} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">{t.process} 3</text>

            <rect x={375} y={120} width={90} height={30} fill={COLORS.green} fillOpacity={0.7} stroke={COLORS.green} rx={2} />
            <text x={420} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill="white">{t.process} 4</text>

            {/* Overlap indicator */}
            <line x1={120} y1={110} x2={160} y2={80} stroke={COLORS.orange} strokeWidth={1} strokeDasharray="2,2" />
            <text x={140} y={105} textAnchor="middle" fontFamily={FONTS.mono} fontSize={8} fill={COLORS.orange}>{t.overlap}</text>

            {/* Metrics */}
            <rect x={100} y={190} width={380} height={70} fill={COLORS.green} fillOpacity={0.1} stroke={COLORS.green} strokeWidth={2} rx={4} />
            <text x={290} y={215} textAnchor="middle" fontFamily={FONTS.sans} fontSize={13} fontWeight="bold" fill={COLORS.green}>
              {t.asyncThroughput}
            </text>
            <text x={290} y={235} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
              {t.asyncDesc}
            </text>
            <text x={290} y={250} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
              {t.asyncUtil}
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export default AsyncPipeline;
