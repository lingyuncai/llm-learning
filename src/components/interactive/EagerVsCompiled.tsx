import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface OpStep {
  name: string;
  flops: number;       // in MFLOPs
  hbmReads: number;    // in MB
  hbmWrites: number;   // in MB
}

interface Scenario {
  label: { zh: string; en: string };
  eagerSteps: OpStep[];
  compiledSteps: OpStep[];
  speedup: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const SCENARIOS: Scenario[] = [
  {
    label: { zh: 'LayerNorm + Linear', en: 'LayerNorm + Linear' },
    eagerSteps: [
      { name: 'LayerNorm: read', flops: 0, hbmReads: 4, hbmWrites: 0 },
      { name: 'LayerNorm: compute', flops: 2, hbmReads: 0, hbmWrites: 0 },
      { name: 'LayerNorm: write', flops: 0, hbmReads: 0, hbmWrites: 4 },
      { name: 'Linear: read', flops: 0, hbmReads: 4, hbmWrites: 0 },
      { name: 'Linear: compute', flops: 8, hbmReads: 0, hbmWrites: 0 },
      { name: 'Linear: write', flops: 0, hbmReads: 0, hbmWrites: 4 },
    ],
    compiledSteps: [
      { name: 'Fused: read', flops: 0, hbmReads: 4, hbmWrites: 0 },
      { name: 'Fused: compute all', flops: 10, hbmReads: 0, hbmWrites: 0 },
      { name: 'Fused: write', flops: 0, hbmReads: 0, hbmWrites: 4 },
    ],
    speedup: '~2x',
  },
  {
    label: { zh: 'Attention Block', en: 'Attention Block' },
    eagerSteps: [
      { name: 'Q projection: read+compute+write', flops: 16, hbmReads: 8, hbmWrites: 4 },
      { name: 'K projection', flops: 16, hbmReads: 8, hbmWrites: 4 },
      { name: 'V projection', flops: 16, hbmReads: 8, hbmWrites: 4 },
      { name: 'Q×Kᵀ', flops: 32, hbmReads: 8, hbmWrites: 16 },
      { name: 'Softmax', flops: 4, hbmReads: 16, hbmWrites: 16 },
      { name: 'Attn×V', flops: 32, hbmReads: 20, hbmWrites: 4 },
    ],
    compiledSteps: [
      { name: 'Fused QKV projection', flops: 48, hbmReads: 8, hbmWrites: 12 },
      { name: 'FlashAttention (tiled)', flops: 68, hbmReads: 12, hbmWrites: 4 },
    ],
    speedup: '~3-4x',
  },
];

/* ─── Constants ─── */

const W = 800;
const H = 500;
const LEFT_X = 20;
const LEFT_W = 360;
const RIGHT_X = 420;
const RIGHT_W = 360;
const TIMELINE_TOP = 100;
const TIMELINE_BOTTOM = 410;
const BAR_MAX_W = 140;

const COLOR_READ = COLORS.primary;
const COLOR_WRITE = COLORS.red;
const COLOR_COMPUTE = COLORS.green;

/* ─── Helpers ─── */

function getStepColor(step: OpStep): string {
  if (step.hbmReads > 0 && step.hbmWrites === 0 && step.flops === 0) return COLOR_READ;
  if (step.hbmWrites > 0 && step.hbmReads === 0 && step.flops === 0) return COLOR_WRITE;
  if (step.flops > 0 && step.hbmReads === 0 && step.hbmWrites === 0) return COLOR_COMPUTE;
  // Mixed: show as gradient-like blend — use primary for mixed
  if (step.hbmReads > 0 && step.flops > 0) return '#5c6bc0'; // indigo for mixed read+compute
  return COLORS.mid;
}

function getStepWidth(step: OpStep): number {
  const total = step.flops + step.hbmReads + step.hbmWrites;
  return Math.max(20, Math.min(BAR_MAX_W, (total / 32) * BAR_MAX_W));
}

function sumField(steps: OpStep[], field: keyof OpStep): number {
  return steps.reduce((acc, s) => acc + (s[field] as number), 0);
}

/* ─── Component ─── */

export default function EagerVsCompiled({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Eager 执行 vs 编译执行',
      eager: 'Eager 模式',
      compiled: '编译模式',
      hbmRead: 'HBM 读取',
      hbmWrite: 'HBM 写入',
      compute: '计算',
      totalReads: '总读取',
      totalWrites: '总写入',
      speedup: '加速比',
      play: '▶ 播放',
      reset: '↻ 重置',
      mixed: '混合操作',
      mb: 'MB',
    },
    en: {
      title: 'Eager Execution vs Compiled Execution',
      eager: 'Eager Mode',
      compiled: 'Compiled Mode',
      hbmRead: 'HBM Read',
      hbmWrite: 'HBM Write',
      compute: 'Compute',
      totalReads: 'Total Reads',
      totalWrites: 'Total Writes',
      speedup: 'Speedup',
      play: '▶ Play',
      reset: '↻ Reset',
      mixed: 'Mixed Op',
      mb: 'MB',
    },
  }[locale]!;

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [activeEagerStep, setActiveEagerStep] = useState(-1);
  const [activeCompiledStep, setActiveCompiledStep] = useState(-1);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = SCENARIOS[scenarioIdx];

  const resetAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnimating(false);
    setActiveEagerStep(-1);
    setActiveCompiledStep(-1);
    setDone(false);
  }, []);

  const playAnimation = useCallback(() => {
    resetAnimation();
    setAnimating(true);

    const eagerCount = scenario.eagerSteps.length;
    const compiledCount = scenario.compiledSteps.length;
    const totalSteps = Math.max(eagerCount, compiledCount);

    let step = 0;
    const advance = () => {
      if (step < eagerCount) setActiveEagerStep(step);
      if (step < compiledCount) setActiveCompiledStep(step);
      step++;
      if (step <= totalSteps) {
        timerRef.current = setTimeout(advance, 600);
      } else {
        timerRef.current = setTimeout(() => {
          setAnimating(false);
          setDone(true);
        }, 400);
      }
    };

    timerRef.current = setTimeout(advance, 200);
  }, [scenario, resetAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Reset animation when scenario changes
  useEffect(() => {
    resetAnimation();
  }, [scenarioIdx, resetAnimation]);

  /* ─── Render steps as bars ─── */

  function renderSteps(
    steps: OpStep[],
    baseX: number,
    areaW: number,
    activeStep: number
  ) {
    const count = steps.length;
    const availableH = TIMELINE_BOTTOM - TIMELINE_TOP;
    const gap = 6;
    const barH = Math.min(36, (availableH - (count - 1) * gap) / count);
    const totalH = count * barH + (count - 1) * gap;
    const startY = TIMELINE_TOP + (availableH - totalH) / 2;

    return steps.map((step, i) => {
      const y = startY + i * (barH + gap);
      const barW = getStepWidth(step);
      const color = getStepColor(step);
      const isActive = i <= activeStep;
      const isCurrent = i === activeStep;
      const barX = baseX + (areaW - barW) / 2;

      return (
        <g key={i}>
          {/* Bar background */}
          <rect
            x={barX}
            y={y}
            width={barW}
            height={barH}
            rx={4}
            fill={color}
            fillOpacity={0.1}
            stroke={color}
            strokeWidth={0.5}
            strokeOpacity={0.3}
          />

          {/* Animated fill */}
          {isActive && (
            <motion.rect
              x={barX}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={color}
              initial={{ fillOpacity: 0, scaleX: 0 }}
              animate={{
                fillOpacity: isCurrent ? 0.7 : 0.45,
                scaleX: 1,
              }}
              style={{ originX: `${barX}px`, originY: `${y + barH / 2}px` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )}

          {/* Pulse ring for current step */}
          {isCurrent && animating && (
            <motion.rect
              x={barX - 2}
              y={y - 2}
              width={barW + 4}
              height={barH + 4}
              rx={6}
              fill="none"
              stroke={color}
              strokeWidth={2}
              animate={{ strokeOpacity: [1, 0.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}

          {/* Step label */}
          <text
            x={barX + barW / 2}
            y={y + barH / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight={isCurrent ? '700' : '500'}
            fill={isActive ? '#fff' : COLORS.mid}
          >
            {step.name}
          </text>
        </g>
      );
    });
  }

  /* ─── Summary stats ─── */

  function renderSummary(steps: OpStep[], baseX: number, areaW: number) {
    const reads = sumField(steps, 'hbmReads');
    const writes = sumField(steps, 'hbmWrites');
    const centerX = baseX + areaW / 2;
    const y = TIMELINE_BOTTOM + 24;

    return (
      <g>
        <text x={centerX} y={y} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.totalReads}: {reads} {t.mb} | {t.totalWrites}: {writes} {t.mb}
        </text>
      </g>
    );
  }

  return (
    <div className="my-6">
      {/* Scenario selector */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => setScenarioIdx(i)}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{
              background: i === scenarioIdx ? COLORS.primary : COLORS.bgAlt,
              color: i === scenarioIdx ? '#fff' : COLORS.dark,
              border: `1px solid ${i === scenarioIdx ? COLORS.primary : COLORS.light}`,
            }}
          >
            {s.label[locale]}
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          <button
            onClick={playAnimation}
            disabled={animating}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{
              background: animating ? COLORS.light : COLORS.green,
              color: animating ? COLORS.mid : '#fff',
              border: `1px solid ${animating ? COLORS.light : COLORS.green}`,
              cursor: animating ? 'not-allowed' : 'pointer',
            }}
          >
            {t.play}
          </button>
          <button
            onClick={resetAnimation}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{
              background: COLORS.bgAlt,
              color: COLORS.dark,
              border: `1px solid ${COLORS.light}`,
            }}
          >
            {t.reset}
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Divider line */}
        <line
          x1={W / 2}
          y1={70}
          x2={W / 2}
          y2={TIMELINE_BOTTOM + 10}
          stroke={COLORS.light}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* Left header: Eager */}
        <text
          x={LEFT_X + LEFT_W / 2}
          y={40}
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill={COLORS.dark}
        >
          {t.eager}
        </text>

        {/* Right header: Compiled */}
        <text
          x={RIGHT_X + RIGHT_W / 2}
          y={40}
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill={COLORS.green}
        >
          {t.compiled}
        </text>

        {/* Legend */}
        <g transform="translate(20, 60)">
          {[
            { color: COLOR_READ, label: t.hbmRead },
            { color: COLOR_COMPUTE, label: t.compute },
            { color: COLOR_WRITE, label: t.hbmWrite },
            { color: '#5c6bc0', label: t.mixed },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${i * 130}, 0)`}>
              <rect x={0} y={-9} width={12} height={12} rx={2} fill={item.color} fillOpacity={0.7} />
              <text x={16} y={1} fontSize="10" fill={COLORS.mid}>{item.label}</text>
            </g>
          ))}
        </g>

        {/* Timeline areas */}
        <rect
          x={LEFT_X}
          y={TIMELINE_TOP - 10}
          width={LEFT_W}
          height={TIMELINE_BOTTOM - TIMELINE_TOP + 20}
          rx={8}
          fill={COLORS.bgAlt}
          stroke={COLORS.light}
          strokeWidth={1}
        />
        <rect
          x={RIGHT_X}
          y={TIMELINE_TOP - 10}
          width={RIGHT_W}
          height={TIMELINE_BOTTOM - TIMELINE_TOP + 20}
          rx={8}
          fill="#f0fdf4"
          stroke={COLORS.green}
          strokeWidth={0.5}
          strokeOpacity={0.3}
        />

        {/* Steps */}
        {renderSteps(scenario.eagerSteps, LEFT_X, LEFT_W, activeEagerStep)}
        {renderSteps(scenario.compiledSteps, RIGHT_X, RIGHT_W, activeCompiledStep)}

        {/* Summary stats */}
        {renderSummary(scenario.eagerSteps, LEFT_X, LEFT_W)}
        {renderSummary(scenario.compiledSteps, RIGHT_X, RIGHT_W)}

        {/* Speedup badge */}
        {done && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <rect
              x={W / 2 - 50}
              y={TIMELINE_BOTTOM + 44}
              width={100}
              height={30}
              rx={15}
              fill={COLORS.green}
            />
            <text
              x={W / 2}
              y={TIMELINE_BOTTOM + 63}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#fff"
            >
              {t.speedup} {scenario.speedup}
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
