// src/components/interactive/PipelineTimeline.tsx
// Animated SVG: DMA / DPU / SHAVE pipeline overlap in NPU multi-layer Transformer execution
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
  className?: string;
}

type Mode = 'serial' | 'pipeline';

interface Task {
  unit: 'DMA' | 'DPU' | 'SHAVE';
  layer: number;
  start: number;
  duration: number;
  label: string;
}

interface Barrier {
  fromUnit: 'DMA' | 'DPU' | 'SHAVE';
  toUnit: 'DMA' | 'DPU' | 'SHAVE';
  time: number;
  layer: number;
}

/* ─── Constants ─── */

const NUM_LAYERS = 4;
const DMA_DUR = 2;   // DMA fetch duration per layer
const DPU_DUR = 3;   // DPU compute duration per layer
const SHAVE_DUR = 1; // SHAVE activation duration per layer

const UNIT_COLORS = {
  DMA:   { fill: '#dbeafe', stroke: COLORS.primary, text: COLORS.primary },
  DPU:   { fill: '#dcfce7', stroke: COLORS.green,   text: COLORS.green },
  SHAVE: { fill: '#fff7ed', stroke: COLORS.orange,  text: COLORS.orange },
} as const;

const LAYER_OPACITY = [1.0, 0.85, 0.7, 0.55] as const;

// SVG layout
const SVG_W = 620;
const LABEL_W = 60;
const CHART_X = LABEL_W + 10;
const LANE_H = 36;
const LANE_GAP = 12;
const TOP_Y = 50;
const AUTO_PLAY_MS = 200;

const UNITS: ('DMA' | 'DPU' | 'SHAVE')[] = ['DMA', 'DPU', 'SHAVE'];

/* ─── Task generation ─── */

function buildSerialTasks(): { tasks: Task[]; barriers: Barrier[]; totalTime: number } {
  const tasks: Task[] = [];
  const barriers: Barrier[] = [];
  let t = 0;

  for (let l = 0; l < NUM_LAYERS; l++) {
    // DMA fetch
    tasks.push({ unit: 'DMA', layer: l, start: t, duration: DMA_DUR, label: `L${l}` });
    t += DMA_DUR;

    // Barrier: DMA(l) done -> DPU(l) start
    barriers.push({ fromUnit: 'DMA', toUnit: 'DPU', time: t, layer: l });

    // DPU compute
    tasks.push({ unit: 'DPU', layer: l, start: t, duration: DPU_DUR, label: `L${l}` });
    t += DPU_DUR;

    // Barrier: DPU(l) done -> SHAVE(l) start
    barriers.push({ fromUnit: 'DPU', toUnit: 'SHAVE', time: t, layer: l });

    // SHAVE activation
    tasks.push({ unit: 'SHAVE', layer: l, start: t, duration: SHAVE_DUR, label: `L${l}` });
    t += SHAVE_DUR;
  }

  return { tasks, barriers, totalTime: t };
}

function buildPipelineTasks(): { tasks: Task[]; barriers: Barrier[]; totalTime: number } {
  const tasks: Task[] = [];
  const barriers: Barrier[] = [];

  // Track when each unit becomes free
  const unitFree = { DMA: 0, DPU: 0, SHAVE: 0 };
  // Track when each layer's DMA / DPU finishes (for dependency barriers)
  const dmaEnd: number[] = [];
  const dpuEnd: number[] = [];

  for (let l = 0; l < NUM_LAYERS; l++) {
    // DMA for layer l: starts when DMA is free
    const dmaStart = unitFree.DMA;
    tasks.push({ unit: 'DMA', layer: l, start: dmaStart, duration: DMA_DUR, label: `L${l}` });
    unitFree.DMA = dmaStart + DMA_DUR;
    dmaEnd.push(unitFree.DMA);

    // DPU for layer l: must wait for DMA(l) to finish AND DPU to be free
    const dpuStart = Math.max(unitFree.DPU, dmaEnd[l]);
    barriers.push({ fromUnit: 'DMA', toUnit: 'DPU', time: dpuStart, layer: l });
    tasks.push({ unit: 'DPU', layer: l, start: dpuStart, duration: DPU_DUR, label: `L${l}` });
    unitFree.DPU = dpuStart + DPU_DUR;
    dpuEnd.push(unitFree.DPU);

    // SHAVE for layer l: must wait for DPU(l) to finish AND SHAVE to be free
    const shaveStart = Math.max(unitFree.SHAVE, dpuEnd[l]);
    barriers.push({ fromUnit: 'DPU', toUnit: 'SHAVE', time: shaveStart, layer: l });
    tasks.push({ unit: 'SHAVE', layer: l, start: shaveStart, duration: SHAVE_DUR, label: `L${l}` });
    unitFree.SHAVE = shaveStart + SHAVE_DUR;
  }

  const totalTime = Math.max(unitFree.DMA, unitFree.DPU, unitFree.SHAVE);
  return { tasks, barriers, totalTime };
}

/* ─── Component ─── */

export default function PipelineTimeline({ locale = 'zh', className }: Props) {
  const t = useMemo(() => ({
    zh: {
      title: 'NPU 流水线重叠执行',
      serial: '串行',
      pipeline: '流水线',
      play: '播放',
      pause: '暂停',
      step: '步进',
      reset: '重置',
      serialTime: '串行总时间',
      pipelineTime: '流水线总时间',
      speedup: '加速比',
      units: '单位时间',
      dmaLabel: 'DMA',
      dpuLabel: 'DPU',
      shaveLabel: 'SHAVE',
      dmaDesc: '数据搬运',
      dpuDesc: '矩阵运算',
      shaveDesc: '激活函数',
      barrierNote: '虚线 = 同步屏障（数据依赖）',
      overlapInsight: 'DMA 预取下一层数据，与当前层 DPU 计算重叠',
    },
    en: {
      title: 'NPU Pipeline Overlap Execution',
      serial: 'Serial',
      pipeline: 'Pipeline',
      play: 'Play',
      pause: 'Pause',
      step: 'Step',
      reset: 'Reset',
      serialTime: 'Serial total',
      pipelineTime: 'Pipeline total',
      speedup: 'Speedup',
      units: 'time units',
      dmaLabel: 'DMA',
      dpuLabel: 'DPU',
      shaveLabel: 'SHAVE',
      dmaDesc: 'Data transfer',
      dpuDesc: 'Matrix compute',
      shaveDesc: 'Activation',
      barrierNote: 'Dashed lines = sync barriers (data dependencies)',
      overlapInsight: 'DMA prefetches next layer while DPU computes current layer',
    },
  }), [])[locale];

  /* ─── State ─── */

  const [mode, setMode] = useState<Mode>('serial');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── Computed layout ─── */

  const serialData = useMemo(() => buildSerialTasks(), []);
  const pipelineData = useMemo(() => buildPipelineTasks(), []);
  const data = mode === 'serial' ? serialData : pipelineData;
  const { tasks, barriers, totalTime } = data;

  // Scale time units to SVG pixels
  const chartW = SVG_W - CHART_X - 20;
  const pxPerUnit = chartW / (totalTime + 1);

  // Lane Y positions
  const laneY = (unit: 'DMA' | 'DPU' | 'SHAVE') => {
    const idx = UNITS.indexOf(unit);
    return TOP_Y + idx * (LANE_H + LANE_GAP);
  };

  const svgH = TOP_Y + 3 * (LANE_H + LANE_GAP) + 60;

  /* ─── Playback ─── */

  const stepForward = useCallback(() => {
    setCurrentTime(prev => {
      const next = prev + 1;
      if (next > totalTime) {
        setIsPlaying(false);
        return totalTime;
      }
      return next;
    });
  }, [totalTime]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(stepForward, AUTO_PLAY_MS);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, stepForward]);

  // Stop at end
  useEffect(() => {
    if (currentTime >= totalTime && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentTime, totalTime, isPlaying]);

  // Reset time when mode changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [mode]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTogglePlay = () => {
    if (currentTime >= totalTime) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  /* ─── Helpers ─── */

  const taskVisible = (task: Task) => currentTime >= task.start;
  const taskProgress = (task: Task) => {
    if (currentTime <= task.start) return 0;
    if (currentTime >= task.start + task.duration) return 1;
    return (currentTime - task.start) / task.duration;
  };

  const playheadX = CHART_X + currentTime * pxPerUnit;

  /* ─── Render ─── */

  return (
    <div className={`my-6 ${className ?? ''}`}>
      {/* Title */}
      <div className="text-center mb-3">
        <div className="text-base font-bold text-gray-800">{t.title}</div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={() => setMode('serial')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            mode === 'serial'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t.serial}
        </button>
        <button
          onClick={() => setMode('pipeline')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            mode === 'pipeline'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t.pipeline}
        </button>
      </div>

      {/* SVG timeline */}
      <svg
        viewBox={`0 0 ${SVG_W} ${svgH}`}
        className="w-full"
        role="img"
        aria-label={t.title}
      >
        {/* Lane labels */}
        {UNITS.map((unit) => {
          const y = laneY(unit);
          const desc = unit === 'DMA' ? t.dmaDesc : unit === 'DPU' ? t.dpuDesc : t.shaveDesc;
          const colors = UNIT_COLORS[unit];
          return (
            <g key={unit}>
              <text
                x={LABEL_W}
                y={y + LANE_H / 2 - 4}
                textAnchor="end"
                fontSize="11"
                fontWeight="700"
                fill={colors.text}
                fontFamily={FONTS.sans}
              >
                {unit}
              </text>
              <text
                x={LABEL_W}
                y={y + LANE_H / 2 + 9}
                textAnchor="end"
                fontSize="8"
                fill={COLORS.mid}
                fontFamily={FONTS.sans}
              >
                {desc}
              </text>
              {/* Lane background */}
              <rect
                x={CHART_X}
                y={y}
                width={chartW}
                height={LANE_H}
                rx={4}
                fill={COLORS.bgAlt}
                stroke={COLORS.light}
                strokeWidth={0.5}
              />
            </g>
          );
        })}

        {/* Time axis ticks */}
        {Array.from({ length: totalTime + 2 }, (_, i) => {
          const x = CHART_X + i * pxPerUnit;
          const axisY = laneY('SHAVE') + LANE_H + 8;
          return (
            <g key={`tick-${i}`}>
              <line
                x1={x} y1={TOP_Y - 4}
                x2={x} y2={axisY}
                stroke={COLORS.light}
                strokeWidth={0.5}
              />
              <text
                x={x}
                y={axisY + 12}
                textAnchor="middle"
                fontSize="8"
                fill={COLORS.mid}
                fontFamily={FONTS.mono}
              >
                {i}
              </text>
            </g>
          );
        })}

        {/* Task blocks */}
        <AnimatePresence>
          {tasks.map((task, idx) => {
            const y = laneY(task.unit);
            const x = CHART_X + task.start * pxPerUnit;
            const w = task.duration * pxPerUnit;
            const colors = UNIT_COLORS[task.unit];
            const visible = taskVisible(task);
            const progress = taskProgress(task);

            if (!visible) return null;

            return (
              <motion.g
                key={`${mode}-${idx}`}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: LAYER_OPACITY[task.layer] ?? 0.55, scaleX: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ originX: `${x}px`, originY: `${y + LANE_H / 2}px` }}
              >
                {/* Task rect */}
                <rect
                  x={x + 1}
                  y={y + 2}
                  width={Math.max(0, w - 2)}
                  height={LANE_H - 4}
                  rx={4}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={1.5}
                />
                {/* Progress fill (during partial execution) */}
                {progress < 1 && (
                  <rect
                    x={x + 1}
                    y={y + 2}
                    width={Math.max(0, (w - 2) * progress)}
                    height={LANE_H - 4}
                    rx={4}
                    fill={colors.stroke}
                    opacity={0.15}
                  />
                )}
                {/* Label */}
                <text
                  x={x + w / 2}
                  y={y + LANE_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={colors.text}
                  fontFamily={FONTS.mono}
                >
                  {task.label}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Barrier lines */}
        {barriers.map((barrier, idx) => {
          const fromY = laneY(barrier.fromUnit) + LANE_H;
          const toY = laneY(barrier.toUnit);
          const x = CHART_X + barrier.time * pxPerUnit;
          const visible = currentTime >= barrier.time;

          if (!visible) return null;

          return (
            <motion.line
              key={`barrier-${mode}-${idx}`}
              x1={x}
              y1={fromY - 2}
              x2={x}
              y2={toY + 2}
              stroke={COLORS.red}
              strokeWidth={1.5}
              strokeDasharray="4,3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.2 }}
            />
          );
        })}

        {/* Playhead group — translate the whole group so triangle + line + label move together */}
        <motion.g
          initial={false}
          animate={{ x: playheadX }}
          transition={{ duration: 0.12, ease: 'linear' }}
        >
          {/* Vertical sweep line */}
          <line
            x1={0} y1={TOP_Y - 8}
            x2={0} y2={laneY('SHAVE') + LANE_H + 8}
            stroke={COLORS.red}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Triangle indicator */}
          <polygon
            points={`-5,${TOP_Y - 14} 5,${TOP_Y - 14} 0,${TOP_Y - 6}`}
            fill={COLORS.red}
          />
          {/* Time label */}
          <text
            x={0}
            y={TOP_Y - 18}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill={COLORS.red}
            fontFamily={FONTS.mono}
          >
            t={currentTime}
          </text>
        </motion.g>

        {/* Barrier note */}
        <text
          x={SVG_W / 2}
          y={svgH - 10}
          textAnchor="middle"
          fontSize="9"
          fill={COLORS.mid}
          fontFamily={FONTS.sans}
        >
          {mode === 'pipeline' ? t.overlapInsight : t.barrierNote}
        </text>
      </svg>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
        <button
          onClick={handleTogglePlay}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            isPlaying
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isPlaying ? t.pause : t.play}
        </button>
        <button
          onClick={stepForward}
          disabled={currentTime >= totalTime}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white
                     hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {t.step} +1
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300
                     text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {t.reset}
        </button>
        <span className="text-xs text-gray-500 font-mono ml-2">
          t = <span className="font-bold text-gray-800">{currentTime}</span> / {totalTime}
        </span>
      </div>

      {/* Performance comparison */}
      <div className="mt-4 mx-auto max-w-md">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={`rounded-lg p-2 border ${
            mode === 'serial' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="text-xs text-gray-500">{t.serialTime}</div>
            <div className="text-lg font-bold font-mono text-gray-800">
              {serialData.totalTime}
            </div>
            <div className="text-xs text-gray-400">{t.units}</div>
          </div>
          <div className={`rounded-lg p-2 border ${
            mode === 'pipeline' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="text-xs text-gray-500">{t.pipelineTime}</div>
            <div className="text-lg font-bold font-mono text-gray-800">
              {pipelineData.totalTime}
            </div>
            <div className="text-xs text-gray-400">{t.units}</div>
          </div>
          <div className="rounded-lg p-2 border border-orange-300 bg-orange-50">
            <div className="text-xs text-gray-500">{t.speedup}</div>
            <div className="text-lg font-bold font-mono" style={{ color: COLORS.orange }}>
              {(serialData.totalTime / pipelineData.totalTime).toFixed(1)}x
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
        {UNITS.map((unit) => {
          const colors = UNIT_COLORS[unit];
          const label = unit === 'DMA' ? t.dmaLabel : unit === 'DPU' ? t.dpuLabel : t.shaveLabel;
          return (
            <span key={unit} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded border"
                style={{ backgroundColor: colors.fill, borderColor: colors.stroke }}
              />
              {label}
            </span>
          );
        })}
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: COLORS.red }} />
          {t.barrierNote.split('(')[0].trim()}
        </span>
      </div>
    </div>
  );
}
