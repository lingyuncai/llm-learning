// src/components/interactive/PrefillGenerateSwitch.tsx
// Visualizes KV cache data flow between Prefill and Generate blobs in NPU LLM inference.
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

// ---------------------------------------------------------------------------
// Types & Props
// ---------------------------------------------------------------------------
interface Props {
  locale?: 'zh' | 'en';
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PREFILL_CAP = 1024;
const GENERATE_CAP = 1152;
const PROMPT_LEN = 4; // small for visual clarity
const MAX_GENERATE_STEPS = 12;

// SVG layout
const SVG_W = 640;
const SVG_H = 380;
const BAR_Y = 130;
const BAR_H = 36;
const BAR_GAP = 60; // horizontal gap between the two bars
const MARGIN_X = 30;

// Proportional bar widths — the entire available width is split proportionally
const TOTAL_BAR_W = SVG_W - 2 * MARGIN_X - BAR_GAP;
const PREFILL_BAR_W = (PREFILL_CAP / (PREFILL_CAP + GENERATE_CAP)) * TOTAL_BAR_W;
const GENERATE_BAR_W = (GENERATE_CAP / (PREFILL_CAP + GENERATE_CAP)) * TOTAL_BAR_W;
const PREFILL_BAR_X = MARGIN_X;
const GENERATE_BAR_X = MARGIN_X + PREFILL_BAR_W + BAR_GAP;

// Colors
const C_PREFILL = '#2563eb';   // blue-600
const C_PREFILL_BG = '#dbeafe'; // blue-100
const C_GENERATE = '#059669';  // emerald-600
const C_GENERATE_BG = '#d1fae5'; // emerald-100
const C_DATA = '#f59e0b';      // amber-500
const C_DATA_LIGHT = '#fef3c7'; // amber-100
const C_NEW_TOKEN = '#ef4444'; // red-500
const C_NEW_TOKEN_BG = '#fee2e2'; // red-100
const C_EMPTY = '#f1f5f9';     // slate-100
const C_EMPTY_STROKE = '#e2e8f0'; // slate-200

// Phase 1 sub-steps: the copy_kvcache animation sweeps in 3 visual beats
const PHASE1_STEPS = 3;

// ---------------------------------------------------------------------------
// Localisation
// ---------------------------------------------------------------------------
const translations = {
  zh: {
    title: 'Prefill → Generate KV Cache 数据流',
    phase1Label: 'Prefill→Generate 切换',
    phase2Label: 'Generate 循环',
    prefillPresent: 'Prefill 输出 (present)',
    generatePast: 'Generate 输入 (past)',
    prefillShape: '[batch, heads, 1024, head_dim]',
    generateShape: '[batch, heads, 1152, head_dim]',
    step: '步骤',
    reset: '重置',
    prev: '上一步',
    next: '下一步',
    promptLen: 'promptLen',
    numStored: 'num_stored_tokens',
    copyKvcache: 'copy_kvcache',
    updateKvcache: 'update_kvcache_for',
    phase1Desc: 'copy_kvcache: 把 present[0:{n}] 复制到 past[0:{n}]',
    phase2Desc: '每步 update_kvcache_for 写入 1 行，num_stored_tokens++',
    dataRegion: '已填充数据',
    emptyRegion: '空闲区域',
    newToken: '本步新写入',
    copiedSlice: '已复制区域',
  },
  en: {
    title: 'Prefill → Generate KV Cache Data Flow',
    phase1Label: 'Prefill→Generate Switch',
    phase2Label: 'Generate Loop',
    prefillPresent: 'Prefill output (present)',
    generatePast: 'Generate input (past)',
    prefillShape: '[batch, heads, 1024, head_dim]',
    generateShape: '[batch, heads, 1152, head_dim]',
    step: 'Step',
    reset: 'Reset',
    prev: 'Prev',
    next: 'Next',
    promptLen: 'promptLen',
    numStored: 'num_stored_tokens',
    copyKvcache: 'copy_kvcache',
    updateKvcache: 'update_kvcache_for',
    phase1Desc: 'copy_kvcache: copy present[0:{n}] into past[0:{n}]',
    phase2Desc: 'Each step update_kvcache_for writes 1 row, num_stored_tokens++',
    dataRegion: 'Filled data',
    emptyRegion: 'Empty region',
    newToken: 'Written this step',
    copiedSlice: 'Copied region',
  },
} as const;

// ---------------------------------------------------------------------------
// Helper: proportional pixel width for a given token count inside a bar
// ---------------------------------------------------------------------------
function tokenPx(tokens: number, capacity: number, barW: number): number {
  return (tokens / capacity) * barW;
}

// ---------------------------------------------------------------------------
// Sub-component: Buffer bar (Prefill or Generate)
// ---------------------------------------------------------------------------
function BufferBar({
  x, y, w, h, capacity, label, shapeLabel, themeColor, themeBg,
  regions,
}: {
  x: number; y: number; w: number; h: number;
  capacity: number; label: string; shapeLabel: string;
  themeColor: string; themeBg: string;
  regions: { start: number; end: number; color: string; stroke?: string; animate?: boolean }[];
}) {
  return (
    <g>
      {/* Label */}
      <text x={x + w / 2} y={y - 38} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={themeColor} fontFamily={FONTS.sans}>
        {label}
      </text>
      {/* Shape */}
      <text x={x + w / 2} y={y - 18} textAnchor="middle"
        fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
        {shapeLabel}
      </text>
      {/* Background (empty) */}
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={C_EMPTY} stroke={C_EMPTY_STROKE} strokeWidth={1} />
      {/* Data regions */}
      {regions.map((r, i) => {
        const rx = x + tokenPx(r.start, capacity, w);
        const rw = tokenPx(r.end - r.start, capacity, w);
        if (rw <= 0) return null;
        return r.animate ? (
          <motion.rect
            key={i}
            x={rx} y={y} height={h} rx={4}
            fill={r.color}
            stroke={r.stroke ?? 'none'}
            strokeWidth={r.stroke ? 1.5 : 0}
            initial={{ width: 0 }}
            animate={{ width: rw }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ) : (
          <rect key={i}
            x={rx} y={y} width={rw} height={h} rx={4}
            fill={r.color}
            stroke={r.stroke ?? 'none'}
            strokeWidth={r.stroke ? 1.5 : 0}
          />
        );
      })}
      {/* Capacity label at right edge */}
      <text x={x + w + 4} y={y + h / 2 + 3} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.mono}>
        {capacity}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Animated copy arrow between bars (Phase 1)
// ---------------------------------------------------------------------------
function CopyArrow({ progress }: { progress: number }) {
  if (progress <= 0) return null;
  const fromX = PREFILL_BAR_X + PREFILL_BAR_W * 0.6;
  const toX = GENERATE_BAR_X + GENERATE_BAR_W * 0.05;
  const cy = BAR_Y + BAR_H / 2;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: Math.min(progress, 1) }}
      transition={{ duration: 0.3 }}
    >
      <defs>
        <marker id="copy-arrow-head" markerWidth="8" markerHeight="6"
          refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={C_DATA} />
        </marker>
      </defs>
      <line x1={fromX} y1={cy} x2={toX} y2={cy}
        stroke={C_DATA} strokeWidth={2} strokeDasharray="6 3"
        markerEnd="url(#copy-arrow-head)" />
      <text x={(fromX + toX) / 2} y={cy - 10} textAnchor="middle"
        fontSize="9" fontWeight="600" fill={C_DATA} fontFamily={FONTS.sans}>
        copy_kvcache
      </text>
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function PrefillGenerateSwitch({ locale = 'zh', className }: Props) {
  const t = translations[locale ?? 'zh'];

  const [phase, setPhase] = useState<1 | 2>(1);
  const [step, setStep] = useState(0);

  // Derived state
  const maxStep = phase === 1 ? PHASE1_STEPS : MAX_GENERATE_STEPS;

  // Phase 1: how many tokens have been "copied" so far (proportional to step)
  const copiedTokens = useMemo(() => {
    if (phase !== 1) return PROMPT_LEN;
    return Math.round((step / PHASE1_STEPS) * PROMPT_LEN);
  }, [phase, step]);

  // Phase 2: how many generate tokens have been produced
  const generatedTokens = useMemo(() => {
    if (phase !== 2) return 0;
    return step;
  }, [phase, step]);

  const numStoredTokens = useMemo(() => {
    if (phase === 1) return copiedTokens;
    return PROMPT_LEN + generatedTokens;
  }, [phase, copiedTokens, generatedTokens]);

  // ---- Regions for Prefill bar ----
  const prefillRegions = useMemo(() => {
    // The prefill bar always shows the prompt data
    return [
      { start: 0, end: PROMPT_LEN, color: C_DATA_LIGHT, stroke: C_DATA, animate: false },
    ];
  }, []);

  // ---- Regions for Generate bar ----
  const generateRegions = useMemo(() => {
    if (phase === 1) {
      // Animating copy — show the copied portion growing
      if (copiedTokens <= 0) return [];
      return [
        { start: 0, end: copiedTokens, color: C_DATA_LIGHT, stroke: C_DATA, animate: true },
      ];
    }
    // Phase 2: existing data + new token highlight
    const total = PROMPT_LEN + generatedTokens;
    const regions: { start: number; end: number; color: string; stroke?: string; animate?: boolean }[] = [];
    if (total > 0) {
      // Previously stored data (everything except the newest token)
      const prevEnd = Math.max(0, total - 1);
      if (prevEnd > 0) {
        regions.push({ start: 0, end: prevEnd, color: C_DATA_LIGHT, stroke: C_DATA, animate: false });
      }
      // Newest token (highlighted differently)
      if (generatedTokens > 0) {
        regions.push({
          start: prevEnd, end: total,
          color: C_NEW_TOKEN_BG, stroke: C_NEW_TOKEN, animate: true,
        });
      } else {
        // Step 0 in phase 2: all data is from copy, no new token yet
        regions.push({ start: 0, end: PROMPT_LEN, color: C_DATA_LIGHT, stroke: C_DATA, animate: false });
      }
    }
    return regions;
  }, [phase, copiedTokens, generatedTokens]);

  // Controls
  const handlePhaseSwitch = (p: 1 | 2) => {
    setPhase(p);
    setStep(0);
  };
  const handleNext = () => { if (step < maxStep) setStep(s => s + 1); };
  const handlePrev = () => { if (step > 0) setStep(s => s - 1); };
  const handleReset = () => setStep(0);

  // Description text with interpolation
  const descText = phase === 1
    ? t.phase1Desc.replace('{n}', String(copiedTokens))
    : t.phase2Desc;

  // Metadata Y position
  const META_Y = BAR_Y + BAR_H + 30;
  const DESC_Y = META_Y + 50;
  const LEGEND_Y = DESC_Y + 30;

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className ?? ''}`}>
      {/* Phase toggle */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500 mr-1">Phase:</span>
        <button
          onClick={() => handlePhaseSwitch(1)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            phase === 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {t.phase1Label}
        </button>
        <button
          onClick={() => handlePhaseSwitch(2)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            phase === 2
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {t.phase2Label}
        </button>
      </div>

      {/* SVG Visualization */}
      <div className="px-2 pt-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" role="img">
          {/* Title */}
          <text x={SVG_W / 2} y={26} textAnchor="middle"
            fontSize="13" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.title}
          </text>

          {/* Phase indicator pill */}
          <rect x={SVG_W / 2 - 80} y={40} width={160} height={22} rx={11}
            fill={phase === 1 ? '#dbeafe' : '#d1fae5'}
            stroke={phase === 1 ? C_PREFILL : C_GENERATE} strokeWidth={1} />
          <text x={SVG_W / 2} y={55} textAnchor="middle"
            fontSize="9" fontWeight="600"
            fill={phase === 1 ? C_PREFILL : C_GENERATE} fontFamily={FONTS.sans}>
            {phase === 1 ? t.copyKvcache : t.updateKvcache}
          </text>

          {/* Prefill buffer bar */}
          <AnimatePresence mode="wait">
            <motion.g key={`prefill-${phase}-${step}`}>
              <BufferBar
                x={PREFILL_BAR_X} y={BAR_Y} w={PREFILL_BAR_W} h={BAR_H}
                capacity={PREFILL_CAP}
                label={t.prefillPresent}
                shapeLabel={t.prefillShape}
                themeColor={C_PREFILL} themeBg={C_PREFILL_BG}
                regions={prefillRegions}
              />
            </motion.g>
          </AnimatePresence>

          {/* Generate buffer bar */}
          <AnimatePresence mode="wait">
            <motion.g key={`generate-${phase}-${step}`}>
              <BufferBar
                x={GENERATE_BAR_X} y={BAR_Y} w={GENERATE_BAR_W} h={BAR_H}
                capacity={GENERATE_CAP}
                label={t.generatePast}
                shapeLabel={t.generateShape}
                themeColor={C_GENERATE} themeBg={C_GENERATE_BG}
                regions={generateRegions}
              />
            </motion.g>
          </AnimatePresence>

          {/* Copy arrow (phase 1 only) */}
          {phase === 1 && <CopyArrow progress={step / PHASE1_STEPS} />}

          {/* Position indicator on generate bar for phase 2 */}
          {phase === 2 && generatedTokens > 0 && (() => {
            const pos = PROMPT_LEN + generatedTokens;
            const posX = GENERATE_BAR_X + tokenPx(pos, GENERATE_CAP, GENERATE_BAR_W);
            return (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <line x1={posX} y1={BAR_Y - 6} x2={posX} y2={BAR_Y + BAR_H + 6}
                  stroke={C_NEW_TOKEN} strokeWidth={1.5} strokeDasharray="3 2" />
                <text x={posX} y={BAR_Y - 10} textAnchor="middle"
                  fontSize="7" fontWeight="600" fill={C_NEW_TOKEN} fontFamily={FONTS.mono}>
                  pos={pos}
                </text>
              </motion.g>
            );
          })()}

          {/* Metadata panel */}
          <rect x={MARGIN_X} y={META_Y} width={SVG_W - 2 * MARGIN_X} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

          {/* promptLen */}
          <text x={MARGIN_X + 16} y={META_Y + 16} fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.promptLen}
          </text>
          <text x={MARGIN_X + 16} y={META_Y + 30} fontSize="11" fontWeight="700"
            fill={C_PREFILL} fontFamily={FONTS.mono}>
            {PROMPT_LEN}
          </text>

          {/* num_stored_tokens */}
          <text x={MARGIN_X + 130} y={META_Y + 16} fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.numStored}
          </text>
          <AnimatePresence mode="wait">
            <motion.text
              key={numStoredTokens}
              x={MARGIN_X + 130} y={META_Y + 30}
              fontSize="11" fontWeight="700"
              fill={C_GENERATE} fontFamily={FONTS.mono}
              initial={{ opacity: 0, y: META_Y + 34 }}
              animate={{ opacity: 1, y: META_Y + 30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {numStoredTokens}
            </motion.text>
          </AnimatePresence>

          {/* Step / Phase */}
          <text x={MARGIN_X + 310} y={META_Y + 16} fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step}
          </text>
          <text x={MARGIN_X + 310} y={META_Y + 30} fontSize="11" fontWeight="700"
            fill={COLORS.mid} fontFamily={FONTS.mono}>
            {step} / {maxStep}
          </text>

          {/* Current capacity usage fraction */}
          <text x={SVG_W - MARGIN_X - 16} y={META_Y + 24} textAnchor="end"
            fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            {numStoredTokens} / {GENERATE_CAP}
          </text>

          {/* Description */}
          <text x={SVG_W / 2} y={DESC_Y + 6} textAnchor="middle"
            fontSize="10" fontWeight="500" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {descText}
          </text>

          {/* Legend */}
          <g transform={`translate(0, ${LEGEND_Y})`}>
            {/* Data */}
            <rect x={MARGIN_X + 20} y={0} width={14} height={10} rx={2}
              fill={C_DATA_LIGHT} stroke={C_DATA} strokeWidth={1} />
            <text x={MARGIN_X + 40} y={8} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {phase === 1 ? t.copiedSlice : t.dataRegion}
            </text>

            {/* New token (phase 2 only) */}
            {phase === 2 && (
              <>
                <rect x={MARGIN_X + 180} y={0} width={14} height={10} rx={2}
                  fill={C_NEW_TOKEN_BG} stroke={C_NEW_TOKEN} strokeWidth={1} />
                <text x={MARGIN_X + 200} y={8} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
                  {t.newToken}
                </text>
              </>
            )}

            {/* Empty */}
            <rect x={phase === 2 ? MARGIN_X + 340 : MARGIN_X + 180} y={0}
              width={14} height={10} rx={2}
              fill={C_EMPTY} stroke={C_EMPTY_STROKE} strokeWidth={1} />
            <text
              x={phase === 2 ? MARGIN_X + 360 : MARGIN_X + 200}
              y={8} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {t.emptyRegion}
            </text>
          </g>
        </svg>
      </div>

      {/* Step controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleReset}
          disabled={step === 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
        >
          {t.reset}
        </button>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            {t.prev}
          </button>
          <button
            onClick={handleNext}
            disabled={step === maxStep}
            className={`px-3 py-1 text-sm text-white rounded disabled:opacity-30 transition-colors ${
              phase === 1
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
