import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface InferenceCall {
  id: number;
  shape: [number, number, number];
  label: string;
}

interface CacheEntry {
  shapes: string;
  compiledAt: number;
  hitCount: number;
  isSymbolic?: boolean;
}

type GuardResult = 'compile' | 'hit' | 'recompile';
type DynamicMode = 'static' | 'auto_dynamic';

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const STATIC_CALL_SEQUENCE: InferenceCall[] = [
  { id: 1, shape: [1, 128, 768], label: 'Call 1' },
  { id: 2, shape: [1, 128, 768], label: 'Call 2' },
  { id: 3, shape: [1, 256, 768], label: 'Call 3' },
  { id: 4, shape: [1, 128, 768], label: 'Call 4' },
  { id: 5, shape: [1, 256, 768], label: 'Call 5' },
  { id: 6, shape: [1, 512, 768], label: 'Call 6' },
  { id: 7, shape: [1, 1024, 768], label: 'Call 7' },
  { id: 8, shape: [1, 512, 768], label: 'Call 8' },
];

const AUTO_DYNAMIC_CALL_SEQUENCE: InferenceCall[] = [
  { id: 1, shape: [1, 128, 768], label: 'Call 1' },
  { id: 2, shape: [1, 128, 768], label: 'Call 2' },
  { id: 3, shape: [1, 256, 768], label: 'Call 3' },
  { id: 4, shape: [1, 128, 768], label: 'Call 4' },
  { id: 5, shape: [1, 256, 768], label: 'Call 5' },
  { id: 6, shape: [1, 512, 768], label: 'Call 6' },
  { id: 7, shape: [1, 1024, 768], label: 'Call 7' },
  { id: 8, shape: [1, 512, 768], label: 'Call 8' },
];

/* ─── Helpers ─── */

function shapeStr(shape: [number, number, number]): string {
  return `[${shape[0]}, ${shape[1]}, ${shape[2]}]`;
}

function simulateStatic(calls: InferenceCall[], upToIndex: number) {
  const cache: CacheEntry[] = [];
  const results: GuardResult[] = [];

  for (let i = 0; i <= upToIndex; i++) {
    const key = shapeStr(calls[i].shape);
    const existing = cache.find(c => c.shapes === key);
    if (existing) {
      existing.hitCount++;
      results.push('hit');
    } else {
      cache.push({ shapes: key, compiledAt: i + 1, hitCount: 0 });
      results.push(i === 0 ? 'compile' : 'recompile');
    }
  }

  return { cache, results };
}

function simulateAutoDynamic(calls: InferenceCall[], upToIndex: number) {
  const cache: CacheEntry[] = [];
  const results: GuardResult[] = [];
  let symbolicMode = false;

  for (let i = 0; i <= upToIndex; i++) {
    if (symbolicMode) {
      // In symbolic mode, all shapes match since seq_len is symbolic
      const entry = cache.find(c => c.isSymbolic);
      if (entry) {
        entry.hitCount++;
        results.push('hit');
      }
    } else {
      const key = shapeStr(calls[i].shape);
      const existing = cache.find(c => c.shapes === key);
      if (existing) {
        existing.hitCount++;
        results.push('hit');
      } else {
        if (cache.length > 0) {
          // Guard fail → recompile with symbolic dim
          symbolicMode = true;
          cache.push({
            shapes: '[1, s0, 768]',
            compiledAt: i + 1,
            hitCount: 0,
            isSymbolic: true,
          });
          results.push('recompile');
        } else {
          // First call → compile static
          cache.push({ shapes: key, compiledAt: i + 1, hitCount: 0 });
          results.push('compile');
        }
      }
    }
  }

  return { cache, results };
}

/* ─── Component ─── */

export default function GuardRecompilationDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Guard 与重编译模拟',
      modeStatic: 'dynamic=False',
      modeAuto: 'dynamic=None (默认)',
      step: '下一步',
      play: '播放',
      pause: '暂停',
      reset: '重置',
      cache: '编译缓存',
      cacheEntries: '条目',
      compile: '编译',
      hit: '缓存命中',
      recompile: '重编译',
      compileCount: '总编译次数',
      hitRate: '缓存命中率',
      avgLatency: '平均延迟',
      high: '高',
      low: '低',
      staticDesc: 'dynamic=False: 每个具体 shape 各自缓存，新 shape 必须重编译',
      autoDesc: 'dynamic=None: 首次 guard fail 后将变化维度标记为符号化，后续所有 shape 都命中缓存',
      symbolicNote: 'seq_len 标记为符号化 (s0)',
      hitCount: '命中',
      compiledAt: '编译于',
    },
    en: {
      title: 'Guard & Recompilation Simulation',
      modeStatic: 'dynamic=False',
      modeAuto: 'dynamic=None (default)',
      step: 'Step',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      cache: 'Compilation Cache',
      cacheEntries: 'entries',
      compile: 'Compile',
      hit: 'Cache Hit',
      recompile: 'Recompile',
      compileCount: 'Total Compilations',
      hitRate: 'Cache Hit Rate',
      avgLatency: 'Avg Latency',
      high: 'high',
      low: 'low',
      staticDesc: 'dynamic=False: each concrete shape cached separately, new shape requires recompilation',
      autoDesc: 'dynamic=None: after first guard fail, wobbling dim marked symbolic, all subsequent shapes hit cache',
      symbolicNote: 'seq_len marked symbolic (s0)',
      hitCount: 'hits',
      compiledAt: 'compiled at',
    },
  }[locale]!;

  const [mode, setMode] = useState<DynamicMode>('static');
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calls = mode === 'static' ? STATIC_CALL_SEQUENCE : AUTO_DYNAMIC_CALL_SEQUENCE;
  const simulate = mode === 'static' ? simulateStatic : simulateAutoDynamic;
  const { cache, results } = currentStep >= 0 ? simulate(calls, currentStep) : { cache: [], results: [] };

  const compileCount = results.filter(r => r === 'compile' || r === 'recompile').length;
  const hitCount = results.filter(r => r === 'hit').length;
  const hitRate = results.length > 0 ? Math.round((hitCount / results.length) * 100) : 0;

  const step = useCallback(() => {
    setCurrentStep(prev => {
      if (prev >= calls.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [calls.length]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentStep >= calls.length - 1) {
      reset();
      setIsPlaying(true);
      setCurrentStep(0);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [currentStep, calls.length, reset]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      const currentResult = currentStep >= 0 && currentStep < results.length ? results[currentStep] : null;
      const delay = currentResult === 'hit' ? 1000 : 2000;
      intervalRef.current = setTimeout(() => {
        step();
      }, delay);
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, currentStep, results, step]);

  // Reset step when mode changes
  useEffect(() => {
    reset();
  }, [mode, reset]);

  /* ── Render result icon ── */
  function resultIcon(result: GuardResult, x: number, y: number) {
    if (result === 'compile' || result === 'recompile') {
      const color = result === 'compile' ? COLORS.primary : COLORS.orange;
      return (
        <g>
          <circle cx={x} cy={y} r="8" fill={color} fillOpacity={0.15} stroke={color} strokeWidth="1.5" />
          <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={color} fontWeight="700">⚙</text>
        </g>
      );
    }
    return (
      <g>
        <circle cx={x} cy={y} r="8" fill={COLORS.green} fillOpacity={0.15} stroke={COLORS.green} strokeWidth="1.5" />
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={COLORS.green} fontWeight="700">✓</text>
      </g>
    );
  }

  /* ── Latency bar ── */
  function latencyBar(result: GuardResult, x: number, y: number, maxW: number) {
    const w = result === 'hit' ? maxW * 0.15 : result === 'compile' ? maxW * 0.95 : maxW * 0.8;
    const color = result === 'hit' ? COLORS.green : result === 'compile' ? COLORS.primary : COLORS.orange;
    return (
      <motion.rect
        x={x} y={y} height={4} rx="2"
        fill={color} fillOpacity={0.6}
        initial={{ width: 0 }}
        animate={{ width: w }}
        transition={{ duration: 0.4 }}
      />
    );
  }

  return (
    <div className="my-6">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode('static')}
          className="px-4 py-1.5 text-sm rounded-md transition-colors font-mono"
          style={{
            backgroundColor: mode === 'static' ? COLORS.primary : COLORS.bgAlt,
            color: mode === 'static' ? '#fff' : COLORS.dark,
            border: `1px solid ${mode === 'static' ? COLORS.primary : COLORS.light}`,
          }}
        >
          {t.modeStatic}
        </button>
        <button
          onClick={() => setMode('auto_dynamic')}
          className="px-4 py-1.5 text-sm rounded-md transition-colors font-mono"
          style={{
            backgroundColor: mode === 'auto_dynamic' ? COLORS.primary : COLORS.bgAlt,
            color: mode === 'auto_dynamic' ? '#fff' : COLORS.dark,
            border: `1px solid ${mode === 'auto_dynamic' ? COLORS.primary : COLORS.light}`,
          }}
        >
          {t.modeAuto}
        </button>
      </div>

      <svg viewBox="0 0 800 500" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x="400" y="22" textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Controls */}
        {[
          { label: t.step, x: 570, onClick: step, disabled: currentStep >= calls.length - 1 },
          { label: isPlaying ? t.pause : t.play, x: 650, onClick: togglePlay, disabled: false },
          { label: t.reset, x: 730, onClick: reset, disabled: currentStep < 0 },
        ].map(btn => (
          <g key={btn.label} onClick={btn.disabled ? undefined : btn.onClick}
            style={{ cursor: btn.disabled ? 'not-allowed' : 'pointer' }}
            opacity={btn.disabled ? 0.3 : 1}
          >
            <rect x={btn.x} y={32} width={60} height={24} rx="4"
              fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x={btn.x + 30} y={48} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.mid}>
              {btn.label}
            </text>
          </g>
        ))}

        {/* Mode description */}
        <text x="20" y="48" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {mode === 'static' ? t.staticDesc : t.autoDesc}
        </text>

        {/* LEFT: Call timeline */}
        <text x="20" y="80" fontSize="11" fontWeight="600" fill={COLORS.dark}>
          Inference Calls
        </text>

        {calls.map((call, i) => {
          const isVisible = i <= currentStep;
          const isCurrent = i === currentStep;
          const isPast = i < currentStep;
          const y = 94 + i * 42;

          if (!isVisible) {
            return (
              <g key={call.id}>
                <rect x={20} y={y} width={440} height={34} rx="4"
                  fill={COLORS.light} fillOpacity={0.3} />
                <text x={240} y={y + 20} textAnchor="middle" fontSize="10" fill={COLORS.mid} fillOpacity={0.4}>
                  {call.label}
                </text>
              </g>
            );
          }

          const result = results[i];
          const resultLabel = result === 'compile' ? t.compile : result === 'hit' ? t.hit : t.recompile;
          const resultColor = result === 'hit' ? COLORS.green : result === 'compile' ? COLORS.primary : COLORS.orange;

          return (
            <motion.g
              key={call.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPast ? 0.5 : 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Row background */}
              <rect x={20} y={y} width={440} height={34} rx="4"
                fill={isCurrent ? COLORS.highlight : COLORS.bgAlt}
                stroke={isCurrent ? COLORS.primary : 'none'}
                strokeWidth={isCurrent ? 1.5 : 0}
                strokeOpacity={0.4}
              />

              {/* Call label */}
              <text x={30} y={y + 15} fontSize="10" fontWeight="600" fill={COLORS.dark}>
                {call.label}
              </text>

              {/* Shape badge */}
              <rect x={80} y={y + 4} width={110} height={18} rx="3"
                fill={COLORS.dark} fillOpacity={0.06} />
              <text x={135} y={y + 16} textAnchor="middle" fontSize="9" fontFamily={FONTS.mono} fill={COLORS.dark}>
                {shapeStr(call.shape)}
              </text>

              {/* Guard result icon */}
              {resultIcon(result, 215, y + 13)}

              {/* Result label */}
              <text x={230} y={y + 16} fontSize="9.5" fontWeight="600" fill={resultColor}>
                {resultLabel}
              </text>

              {/* Symbolic note for auto_dynamic recompile */}
              {mode === 'auto_dynamic' && result === 'recompile' && (
                <text x={310} y={y + 16} fontSize="8" fill={COLORS.purple} fontFamily={FONTS.mono}>
                  {t.symbolicNote}
                </text>
              )}

              {/* Latency bar */}
              {latencyBar(result, 310, y + 24, 140)}
            </motion.g>
          );
        })}

        {/* RIGHT: Compilation Cache */}
        <rect x={490} y={70} width={290} height={280} rx="8"
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
        <text x={500} y={90} fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.cache}: {cache.length} {t.cacheEntries}
        </text>

        <AnimatePresence>
          {cache.map((entry, i) => {
            const ey = 100 + i * 50;
            const isSymbolic = entry.isSymbolic;
            return (
              <motion.g
                key={entry.shapes + entry.compiledAt}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect x={500} y={ey} width={270} height={40} rx="6"
                  fill={isSymbolic ? COLORS.purple : COLORS.primary}
                  fillOpacity={0.06}
                  stroke={isSymbolic ? COLORS.purple : COLORS.primary}
                  strokeWidth="1" strokeOpacity={0.3}
                />
                {/* Shape string */}
                <text x={510} y={ey + 16} fontSize="11" fontFamily={FONTS.mono} fontWeight="600"
                  fill={isSymbolic ? COLORS.purple : COLORS.dark}>
                  {entry.shapes}
                </text>
                {/* Hit count badge */}
                {entry.hitCount > 0 && (
                  <motion.g
                    key={`hit-${entry.hitCount}`}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <rect x={700} y={ey + 4} width={60} height={16} rx="8"
                      fill={COLORS.green} fillOpacity={0.15} />
                    <text x={730} y={ey + 15} textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.green}>
                      {entry.hitCount} {t.hitCount}
                    </text>
                  </motion.g>
                )}
                {/* Compiled at */}
                <text x={510} y={ey + 32} fontSize="8.5" fill={COLORS.mid}>
                  {t.compiledAt} Call {entry.compiledAt}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* BOTTOM: Statistics */}
        <rect x={20} y={440} width={760} height={50} rx="6"
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />

        {/* Compile count */}
        <text x={60} y={460} fontSize="10" fill={COLORS.mid}>{t.compileCount}:</text>
        <text x={170} y={460} fontSize="14" fontWeight="700" fontFamily={FONTS.mono}
          fill={compileCount > 2 ? COLORS.orange : COLORS.green}>
          {compileCount}
        </text>

        {/* Hit rate */}
        <text x={260} y={460} fontSize="10" fill={COLORS.mid}>{t.hitRate}:</text>
        <text x={360} y={460} fontSize="14" fontWeight="700" fontFamily={FONTS.mono}
          fill={hitRate >= 50 ? COLORS.green : COLORS.orange}>
          {hitRate}%
        </text>

        {/* Avg latency indicator */}
        <text x={460} y={460} fontSize="10" fill={COLORS.mid}>{t.avgLatency}:</text>
        {currentStep >= 0 && (
          <>
            <rect x={550} y={451} width={180} height={8} rx="3" fill={COLORS.light} />
            <motion.rect
              x={550} y={451} height={8} rx="3"
              fill={compileCount > 2 ? COLORS.orange : COLORS.green}
              fillOpacity={0.6}
              initial={{ width: 0 }}
              animate={{
                width: 180 * ((compileCount * 0.8 + hitCount * 0.1) / results.length),
              }}
              transition={{ duration: 0.4 }}
            />
            <text x={550} y={478} fontSize="8" fill={COLORS.mid}>
              {compileCount > 2 ? t.high : t.low}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
