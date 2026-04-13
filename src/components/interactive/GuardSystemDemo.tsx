import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface GuardCheck {
  type: 'shape' | 'dtype' | 'value';
  condition: string;
  passes: boolean;
}

interface InputAttempt {
  label: string;
  shape: string;
  dtype: string;
  guards: GuardCheck[];
  result: 'cache_hit' | 'recompile';
}

/* ─── Data ─── */

const ATTEMPTS: InputAttempt[] = [
  {
    label: 'x₁',
    shape: '[4, 64]',
    dtype: 'float32',
    guards: [
      { type: 'shape', condition: 'x.dim() == 2', passes: true },
      { type: 'shape', condition: 'x.shape[0] == 4', passes: true },
      { type: 'shape', condition: 'x.shape[1] == 64', passes: true },
      { type: 'dtype', condition: 'x.dtype == float32', passes: true },
    ],
    result: 'cache_hit',
  },
  {
    label: 'x₂',
    shape: '[4, 64]',
    dtype: 'float32',
    guards: [
      { type: 'shape', condition: 'x.dim() == 2', passes: true },
      { type: 'shape', condition: 'x.shape[0] == 4', passes: true },
      { type: 'shape', condition: 'x.shape[1] == 64', passes: true },
      { type: 'dtype', condition: 'x.dtype == float32', passes: true },
    ],
    result: 'cache_hit',
  },
  {
    label: 'x₃',
    shape: '[8, 64]',
    dtype: 'float32',
    guards: [
      { type: 'shape', condition: 'x.dim() == 2', passes: true },
      { type: 'shape', condition: 'x.shape[0] == 4', passes: false },
      { type: 'shape', condition: 'x.shape[1] == 64', passes: true },
      { type: 'dtype', condition: 'x.dtype == float32', passes: true },
    ],
    result: 'recompile',
  },
  {
    label: 'x₄',
    shape: '[4, 128]',
    dtype: 'float32',
    guards: [
      { type: 'shape', condition: 'x.dim() == 2', passes: true },
      { type: 'shape', condition: 'x.shape[0] == 4', passes: true },
      { type: 'shape', condition: 'x.shape[1] == 64', passes: false },
      { type: 'dtype', condition: 'x.dtype == float32', passes: true },
    ],
    result: 'recompile',
  },
  {
    label: 'x₅',
    shape: '[4, 64]',
    dtype: 'float16',
    guards: [
      { type: 'shape', condition: 'x.dim() == 2', passes: true },
      { type: 'shape', condition: 'x.shape[0] == 4', passes: true },
      { type: 'shape', condition: 'x.shape[1] == 64', passes: true },
      { type: 'dtype', condition: 'x.dtype == float32', passes: false },
    ],
    result: 'recompile',
  },
];

/* ─── Props ─── */

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Component ─── */

export default function GuardSystemDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Guard 系统演示',
      compiledGraph: '已编译图',
      guardChecks: 'Guard 检查',
      result: '结果',
      cacheHit: '缓存命中',
      recompile: '重新编译',
      firstCompile: '首次编译',
      inputLabel: '输入',
      shape: '形状',
      dtype: '类型',
      pass: '通过',
      fail: '失败',
      selectInput: '选择一个输入来观察 Guard 检查过程',
      guardDesc: '首次调用时编译并记录 Guard 条件。后续调用检查 Guard，若全部通过则命中缓存，否则触发重编译。',
    },
    en: {
      title: 'Guard System Demo',
      compiledGraph: 'Compiled Graph',
      guardChecks: 'Guard Checks',
      result: 'Result',
      cacheHit: 'Cache Hit',
      recompile: 'Recompile',
      firstCompile: 'First Compile',
      inputLabel: 'Input',
      shape: 'Shape',
      dtype: 'Type',
      pass: 'Pass',
      fail: 'Fail',
      selectInput: 'Select an input to observe the Guard checking process',
      guardDesc: 'On first call, compile and record Guard conditions. Subsequent calls check Guards; if all pass, cache hit; otherwise, recompile.',
    },
  }[locale]!;

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [animatingResult, setAnimatingResult] = useState(false);

  const selected = selectedIdx !== null ? ATTEMPTS[selectedIdx] : null;

  const handleSelect = useCallback((idx: number) => {
    setSelectedIdx(idx);
    setAnimatingResult(true);
    setTimeout(() => setAnimatingResult(false), 800);
  }, []);

  const W = 800, H = 400;
  const LEFT_X = 20, LEFT_W = 180;
  const MID_X = 220, MID_W = 340;
  const RIGHT_X = 580, RIGHT_W = 200;
  const TOP_Y = 50;

  return (
    <div className="my-6">
      {/* Input selector buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ATTEMPTS.map((attempt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: i === selectedIdx ? COLORS.primary : COLORS.bgAlt,
              color: i === selectedIdx ? '#fff' : COLORS.dark,
              border: `1px solid ${i === selectedIdx ? COLORS.primary : COLORS.light}`,
            }}
          >
            {attempt.label}: {attempt.shape} ({attempt.dtype})
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Section headers */}
        <text x={LEFT_X + LEFT_W / 2} y={TOP_Y - 15} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.dark}>
          {t.compiledGraph}
        </text>
        <text x={MID_X + MID_W / 2} y={TOP_Y - 15} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.dark}>
          {t.guardChecks}
        </text>
        <text x={RIGHT_X + RIGHT_W / 2} y={TOP_Y - 15} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.dark}>
          {t.result}
        </text>

        {/* Left: Compiled Graph box */}
        <rect x={LEFT_X} y={TOP_Y} width={LEFT_W} height={200} rx="8" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
        <text x={LEFT_X + LEFT_W / 2} y={TOP_Y + 25} textAnchor="middle" fontSize="10" fontFamily={FONTS.mono} fill={COLORS.primary} fontWeight="600">
          compiled_fn_v1
        </text>
        {/* Mini graph illustration */}
        {['placeholder x', 'matmul', 'add', 'relu', 'output'].map((label, i) => (
          <g key={i}>
            <rect x={LEFT_X + 25} y={TOP_Y + 40 + i * 30} width={LEFT_W - 50} height={22} rx="4" fill={COLORS.bg} stroke={COLORS.light} strokeWidth="1" />
            <text x={LEFT_X + LEFT_W / 2} y={TOP_Y + 55 + i * 30} textAnchor="middle" fontSize="9" fontFamily={FONTS.mono} fill={COLORS.dark}>
              {label}
            </text>
            {i < 4 && (
              <line
                x1={LEFT_X + LEFT_W / 2} y1={TOP_Y + 62 + i * 30}
                x2={LEFT_X + LEFT_W / 2} y2={TOP_Y + 70 + i * 30}
                stroke={COLORS.light} strokeWidth="1"
              />
            )}
          </g>
        ))}

        {/* Arrow from left to middle */}
        <line x1={LEFT_X + LEFT_W + 5} y1={TOP_Y + 100} x2={MID_X - 5} y2={TOP_Y + 100} stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#guardArrow)" />

        {/* Center: Guard checks */}
        <rect x={MID_X} y={TOP_Y} width={MID_W} height={280} rx="8" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />

        {selected ? (
          <>
            {/* Input info */}
            <text x={MID_X + 15} y={TOP_Y + 22} fontSize="10" fontWeight="600" fill={COLORS.dark}>
              {t.inputLabel}: {selected.label} | {t.shape}: {selected.shape} | {t.dtype}: {selected.dtype}
            </text>
            <line x1={MID_X + 10} y1={TOP_Y + 30} x2={MID_X + MID_W - 10} y2={TOP_Y + 30} stroke={COLORS.light} strokeWidth="1" />

            {/* Guard checks */}
            {selected.guards.map((guard, i) => {
              const y = TOP_Y + 45 + i * 55;
              return (
                <g key={i}>
                  <motion.rect
                    x={MID_X + 10}
                    y={y}
                    width={MID_W - 20}
                    height={42}
                    rx="6"
                    fill={guard.passes ? COLORS.valid : COLORS.waste}
                    stroke={guard.passes ? COLORS.green : COLORS.red}
                    strokeWidth="1.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={!guard.passes ? { opacity: 1, x: [0, -3, 3, -3, 3, 0] } : { opacity: 1, x: 0 }}
                    transition={!guard.passes ? { duration: 0.5, delay: i * 0.15 } : { duration: 0.3, delay: i * 0.15 }}
                  />

                  {/* Guard type badge */}
                  <rect
                    x={MID_X + 16}
                    y={y + 5}
                    width={guard.type === 'shape' ? 40 : (guard.type === 'dtype' ? 38 : 36)}
                    height={14}
                    rx="7"
                    fill={guard.passes ? COLORS.green : COLORS.red}
                    fillOpacity={0.2}
                  />
                  <text x={MID_X + 20} y={y + 15} fontSize="8" fontWeight="600" fill={guard.passes ? COLORS.green : COLORS.red}>
                    {guard.type}
                  </text>

                  {/* Condition */}
                  <text x={MID_X + 70} y={y + 15} fontSize="10" fontFamily={FONTS.mono} fill={COLORS.dark}>
                    {guard.condition}
                  </text>

                  {/* Pass/Fail indicator */}
                  <text x={MID_X + MID_W - 50} y={y + 34} fontSize="10" fontWeight="700" fill={guard.passes ? COLORS.green : COLORS.red}>
                    {guard.passes ? `\u2713 ${t.pass}` : `\u2717 ${t.fail}`}
                  </text>
                </g>
              );
            })}
          </>
        ) : (
          <text x={MID_X + MID_W / 2} y={TOP_Y + 140} textAnchor="middle" fontSize="11" fill={COLORS.mid}>
            {t.selectInput}
          </text>
        )}

        {/* Arrow from middle to right */}
        <line x1={MID_X + MID_W + 5} y1={TOP_Y + 100} x2={RIGHT_X - 5} y2={TOP_Y + 100} stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#guardArrow)" />

        {/* Right: Result */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.g
              key={`${selectedIdx}-result`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <rect
                x={RIGHT_X}
                y={TOP_Y + 40}
                width={RIGHT_W}
                height={120}
                rx="8"
                fill={selected.result === 'cache_hit' ? COLORS.valid : COLORS.waste}
                stroke={selected.result === 'cache_hit' ? COLORS.green : COLORS.red}
                strokeWidth="2"
              />

              {/* Icon */}
              {selected.result === 'cache_hit' ? (
                <>
                  <circle cx={RIGHT_X + RIGHT_W / 2} cy={TOP_Y + 80} r="16" fill={COLORS.green} fillOpacity="0.15" stroke={COLORS.green} strokeWidth="2" />
                  <text x={RIGHT_X + RIGHT_W / 2} y={TOP_Y + 86} textAnchor="middle" fontSize="18" fill={COLORS.green}>{'\u2713'}</text>
                </>
              ) : (
                <>
                  <motion.g
                    animate={animatingResult ? { rotate: [0, 360] } : {}}
                    transition={{ duration: 0.6, ease: 'linear' }}
                    style={{ originX: `${RIGHT_X + RIGHT_W / 2}px`, originY: `${TOP_Y + 80}px` }}
                  >
                    <circle cx={RIGHT_X + RIGHT_W / 2} cy={TOP_Y + 80} r="16" fill="none" stroke={COLORS.red} strokeWidth="2" strokeDasharray="20,10" />
                  </motion.g>
                  <text x={RIGHT_X + RIGHT_W / 2} y={TOP_Y + 86} textAnchor="middle" fontSize="16" fill={COLORS.red}>{'\u21bb'}</text>
                </>
              )}

              <text x={RIGHT_X + RIGHT_W / 2} y={TOP_Y + 115} textAnchor="middle" fontSize="13" fontWeight="700" fill={selected.result === 'cache_hit' ? COLORS.green : COLORS.red}>
                {selected.result === 'cache_hit' ? t.cacheHit : t.recompile}
              </text>

              {selectedIdx === 0 && (
                <text x={RIGHT_X + RIGHT_W / 2} y={TOP_Y + 135} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
                  ({t.firstCompile})
                </text>
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Description text */}
        <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.guardDesc}
        </text>

        {/* Defs */}
        <defs>
          <marker id="guardArrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.mid} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
