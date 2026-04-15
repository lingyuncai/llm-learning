// src/components/interactive/KVCacheGrowthAnimation.tsx
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
  className?: string;
}

/* ─── Constants ─── */

const CACHE_COLORS = {
  prompt: '#1565c0',      // blue — prompt tokens (prefill)
  generated: '#2e7d32',   // green — generated tokens (decode)
  padding: '#e5e7eb',     // gray — unused padding
  pointer: '#e65100',     // orange — write pointer
  maskOne: '#dbeafe',     // light blue — mask 1
  maskZero: '#f3f4f6',    // light gray — mask 0
  full: '#c62828',        // red — capacity reached
} as const;

// SVG layout
const SVG_W = 600;
const SVG_H = 180;
const BAR_X = 40;
const BAR_W = 520;
const BAR_Y = 30;
const BAR_H = 50;
const MASK_Y = 110;
const MASK_H = 20;
const POINTER_Y = BAR_Y - 2;

// Defaults
const DEFAULT_CAPACITY = 1152;
const DEFAULT_PROMPT_LEN = 128;
const MIN_CAPACITY = 64;
const MAX_CAPACITY = 4096;
const MIN_PROMPT = 1;
const AUTO_PLAY_INTERVAL = 300;

/* ─── Component ─── */

export default function KVCacheGrowthAnimation({ locale = 'zh', className }: Props) {
  const t = useMemo(() => ({
    zh: {
      title: 'KV Cache 增长可视化',
      subtitle: '物理 buffer 大小不变，有效边界随 token 生成前移',
      capacity: '总容量',
      promptLen: '提示词长度',
      tokens: 'tokens',
      step: '步进',
      autoPlay: '自动播放',
      pause: '暂停',
      reset: '重置',
      currentPos: '当前写入位置',
      full: '已满',
      prompt: '提示词区域',
      generated: '生成区域',
      padding: '未使用（填充）',
      maskLabel: '注意力掩码',
      validCount: '有效 token',
      paddingCount: '填充',
    },
    en: {
      title: 'KV Cache Growth Visualization',
      subtitle: 'Physical buffer size stays constant; effective boundary advances with generation',
      capacity: 'Capacity',
      promptLen: 'Prompt length',
      tokens: 'tokens',
      step: 'Step',
      autoPlay: 'Auto-play',
      pause: 'Pause',
      reset: 'Reset',
      currentPos: 'Write position',
      full: 'Full',
      prompt: 'Prompt region',
      generated: 'Generated region',
      padding: 'Unused (padding)',
      maskLabel: 'Attention mask',
      validCount: 'Valid tokens',
      paddingCount: 'Padding',
    },
  }), [])[locale];

  /* ─── State ─── */

  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY);
  const [promptLen, setPromptLen] = useState(DEFAULT_PROMPT_LEN);
  const [writePos, setWritePos] = useState(DEFAULT_PROMPT_LEN);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ensure promptLen stays within bounds when capacity changes
  const effectivePromptLen = Math.min(promptLen, capacity - 1);
  const isFull = writePos >= capacity;

  /* ─── Computed values ─── */

  const regions = useMemo(() => {
    const promptFraction = effectivePromptLen / capacity;
    const generatedTokens = writePos - effectivePromptLen;
    const generatedFraction = generatedTokens / capacity;
    const paddingFraction = 1 - promptFraction - generatedFraction;

    return {
      promptW: promptFraction * BAR_W,
      generatedW: generatedFraction * BAR_W,
      paddingW: paddingFraction * BAR_W,
      generatedTokens,
      paddingTokens: capacity - writePos,
    };
  }, [capacity, effectivePromptLen, writePos]);

  const pointerX = BAR_X + (writePos / capacity) * BAR_W;

  /* ─── Auto-play ─── */

  const stepForward = useCallback(() => {
    setWritePos(prev => {
      if (prev >= capacity) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [capacity]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(stepForward, AUTO_PLAY_INTERVAL);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, stepForward]);

  // Stop auto-play when capacity is reached
  useEffect(() => {
    if (isFull && isPlaying) {
      setIsPlaying(false);
    }
  }, [isFull, isPlaying]);

  /* ─── Handlers ─── */

  const handleReset = () => {
    setIsPlaying(false);
    setWritePos(effectivePromptLen);
  };

  const handleCapacityChange = (val: number) => {
    setIsPlaying(false);
    setCapacity(val);
    const newPrompt = Math.min(promptLen, val - 1);
    setPromptLen(newPrompt);
    setWritePos(newPrompt);
  };

  const handlePromptLenChange = (val: number) => {
    setIsPlaying(false);
    const clamped = Math.max(MIN_PROMPT, Math.min(val, capacity - 1));
    setPromptLen(clamped);
    setWritePos(clamped);
  };

  /* ─── Mask segment rendering ─── */

  // We show a simplified mask: two colored segments rather than individual 0s/1s
  const maskValidW = (writePos / capacity) * BAR_W;
  const maskPaddingW = BAR_W - maskValidW;

  /* ─── Render ─── */

  return (
    <div className={`my-6 ${className ?? ''}`}>
      {/* Title */}
      <div className="text-center mb-4">
        <div className="text-base font-bold text-gray-800">{t.title}</div>
        <div className="text-xs text-gray-500 mt-0.5">{t.subtitle}</div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-4 px-2">
        <label className="flex flex-col text-xs text-gray-600">
          <span className="flex justify-between mb-1">
            <span className="font-medium">{t.capacity}</span>
            <span className="font-mono text-gray-800">{capacity} {t.tokens}</span>
          </span>
          <input
            type="range"
            min={MIN_CAPACITY}
            max={MAX_CAPACITY}
            step={64}
            value={capacity}
            onChange={e => handleCapacityChange(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 cursor-pointer"
          />
        </label>
        <label className="flex flex-col text-xs text-gray-600">
          <span className="flex justify-between mb-1">
            <span className="font-medium">{t.promptLen}</span>
            <span className="font-mono text-gray-800">{effectivePromptLen} {t.tokens}</span>
          </span>
          <input
            type="range"
            min={MIN_PROMPT}
            max={Math.max(MIN_PROMPT, capacity - 1)}
            step={1}
            value={effectivePromptLen}
            onChange={e => handlePromptLenChange(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 cursor-pointer"
          />
        </label>
      </div>

      {/* SVG Visualization */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        role="img"
        aria-label={t.title}
      >
        {/* Buffer bar background */}
        <rect
          x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H}
          rx={4} fill={CACHE_COLORS.padding} stroke="#d1d5db" strokeWidth={1}
        />

        {/* Prompt region */}
        <motion.rect
          x={BAR_X} y={BAR_Y}
          height={BAR_H}
          rx={4}
          fill={CACHE_COLORS.prompt}
          initial={false}
          animate={{ width: Math.max(0, regions.promptW) }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />

        {/* Generated region */}
        <motion.rect
          y={BAR_Y}
          height={BAR_H}
          fill={CACHE_COLORS.generated}
          initial={false}
          animate={{
            x: BAR_X + regions.promptW,
            width: Math.max(0, regions.generatedW),
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />

        {/* Clip the bar to rounded rect */}
        <rect
          x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H}
          rx={4} fill="none" stroke="#94a3b8" strokeWidth={1.5}
        />

        {/* Write position pointer (triangle) */}
        <motion.g
          initial={false}
          animate={{ x: pointerX }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <polygon
            points={`0,${POINTER_Y - 10} -5,${POINTER_Y - 18} 5,${POINTER_Y - 18}`}
            fill={isFull ? CACHE_COLORS.full : CACHE_COLORS.pointer}
          />
          <line
            x1={0} y1={POINTER_Y - 10}
            x2={0} y2={BAR_Y + BAR_H + 4}
            stroke={isFull ? CACHE_COLORS.full : CACHE_COLORS.pointer}
            strokeWidth={1.5}
            strokeDasharray={isFull ? 'none' : '3,2'}
          />
        </motion.g>

        {/* Position labels */}
        <text x={BAR_X} y={BAR_Y + BAR_H + 16}
          fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono} textAnchor="middle">
          0
        </text>
        <text x={BAR_X + BAR_W} y={BAR_Y + BAR_H + 16}
          fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono} textAnchor="middle">
          {capacity}
        </text>

        {/* Write position label */}
        <motion.text
          y={POINTER_Y - 22}
          fontSize="9"
          fontWeight="600"
          fontFamily={FONTS.mono}
          textAnchor="middle"
          fill={isFull ? CACHE_COLORS.full : CACHE_COLORS.pointer}
          initial={false}
          animate={{ x: pointerX }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {writePos}
        </motion.text>

        {/* Region labels inside bar */}
        {regions.promptW > 50 && (
          <text
            x={BAR_X + regions.promptW / 2}
            y={BAR_Y + BAR_H / 2 + 4}
            fontSize="9" fontWeight="600" fill="#fff"
            fontFamily={FONTS.sans} textAnchor="middle"
          >
            {t.prompt}
          </text>
        )}
        {regions.generatedW > 50 && (
          <text
            x={BAR_X + regions.promptW + regions.generatedW / 2}
            y={BAR_Y + BAR_H / 2 + 4}
            fontSize="9" fontWeight="600" fill="#fff"
            fontFamily={FONTS.sans} textAnchor="middle"
          >
            {t.generated}
          </text>
        )}
        {regions.paddingW > 50 && (
          <text
            x={BAR_X + regions.promptW + regions.generatedW + regions.paddingW / 2}
            y={BAR_Y + BAR_H / 2 + 4}
            fontSize="9" fill={COLORS.mid}
            fontFamily={FONTS.sans} textAnchor="middle"
          >
            {t.padding}
          </text>
        )}

        {/* ── Attention Mask ── */}
        <text x={BAR_X - 4} y={MASK_Y + MASK_H / 2 + 3}
          fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans} textAnchor="end">
          {t.maskLabel}
        </text>

        {/* Mask background */}
        <rect
          x={BAR_X} y={MASK_Y} width={BAR_W} height={MASK_H}
          rx={3} fill={CACHE_COLORS.maskZero} stroke="#d1d5db" strokeWidth={0.5}
        />

        {/* Mask valid (1s) region */}
        <motion.rect
          x={BAR_X} y={MASK_Y}
          height={MASK_H}
          rx={3}
          fill={CACHE_COLORS.maskOne}
          initial={false}
          animate={{ width: Math.max(0, maskValidW) }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />

        {/* Mask "1" and "0" text indicators */}
        {maskValidW > 20 && (
          <text
            x={BAR_X + maskValidW / 2}
            y={MASK_Y + MASK_H / 2 + 3}
            fontSize="10" fontWeight="700" fill={COLORS.primary}
            fontFamily={FONTS.mono} textAnchor="middle"
          >
            1 1 1 ... 1
          </text>
        )}
        {maskPaddingW > 20 && (
          <text
            x={BAR_X + maskValidW + maskPaddingW / 2}
            y={MASK_Y + MASK_H / 2 + 3}
            fontSize="10" fill="#aaa"
            fontFamily={FONTS.mono} textAnchor="middle"
          >
            0 0 0 ... 0
          </text>
        )}

        {/* Mask border */}
        <rect
          x={BAR_X} y={MASK_Y} width={BAR_W} height={MASK_H}
          rx={3} fill="none" stroke="#94a3b8" strokeWidth={1}
        />

        {/* Stats below mask */}
        <text x={BAR_X} y={MASK_Y + MASK_H + 14}
          fontSize="9" fill={COLORS.primary} fontFamily={FONTS.sans}>
          {t.validCount}: {writePos}
        </text>
        <text x={BAR_X + BAR_W} y={MASK_Y + MASK_H + 14}
          fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans} textAnchor="end">
          {t.paddingCount}: {capacity - writePos}
        </text>
      </svg>

      {/* Full indicator */}
      <AnimatePresence>
        {isFull && (
          <motion.div
            className="text-center text-sm font-bold mt-1"
            style={{ color: CACHE_COLORS.full }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {t.full}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
        <button
          onClick={stepForward}
          disabled={isFull}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white
                     hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {t.step} +1
        </button>
        <button
          onClick={() => setIsPlaying(prev => !prev)}
          disabled={isFull && !isPlaying}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
            ${isPlaying
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-green-600 text-white hover:bg-green-700'}
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isPlaying ? t.pause : t.autoPlay}
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300
                     text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {t.reset}
        </button>
        <span className="text-xs text-gray-500 font-mono ml-2">
          {t.currentPos}: <span className="font-bold text-gray-800">{writePos}</span> / {capacity}
        </span>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: CACHE_COLORS.prompt }} />
          {t.prompt}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: CACHE_COLORS.generated }} />
          {t.generated}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: CACHE_COLORS.padding }} />
          {t.padding}
        </span>
      </div>
    </div>
  );
}
