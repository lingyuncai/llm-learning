import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface PatternDemo {
  label: { zh: string; en: string };
  patternTemplate: string;
  replacementTemplate: string;
  beforeIR: string;
  afterIR: string;
  matchedRegion: { startLine: number; endLine: number };
}

/* ─── Data ─── */

const PATTERNS: PatternDemo[] = [
  {
    label: { zh: 'linalg.matmul → scf.for 循环', en: 'linalg.matmul → scf.for loops' },
    patternTemplate: `// Pattern: match linalg.matmul
linalg.matmul
  ins(%A, %B : memref<?x?xf32>,
               memref<?x?xf32>)
  outs(%C : memref<?x?xf32>)`,
    replacementTemplate: `// Replacement: expand to triple loop
scf.for %i = 0 to %M step 1 {
  scf.for %j = 0 to %N step 1 {
    scf.for %k = 0 to %K step 1 {
      %a = memref.load %A[%i, %k]
      %b = memref.load %B[%k, %j]
      %c = memref.load %C[%i, %j]
      %prod = arith.mulf %a, %b
      %sum = arith.addf %c, %prod
      memref.store %sum, %C[%i, %j]
    }
  }
}`,
    beforeIR: `func.func @fn(
    %A: memref<128x768xf32>,
    %B: memref<768x768xf32>,
    %C: memref<128x768xf32>) {
  linalg.matmul
    ins(%A, %B) outs(%C)
  return
}`,
    afterIR: `func.func @fn(
    %A: memref<128x768xf32>,
    %B: memref<768x768xf32>,
    %C: memref<128x768xf32>) {
  scf.for %i = 0 to 128 {
    scf.for %j = 0 to 768 {
      scf.for %k = 0 to 768 {
        // load, mul, add, store
      }
    }
  }
  return
}`,
    matchedRegion: { startLine: 4, endLine: 5 },
  },
  {
    label: { zh: 'scf.for → affine.for', en: 'scf.for → affine.for' },
    patternTemplate: `// Pattern: match scf.for with
// constant bounds
scf.for %iv = %lb to %ub step %s {
  // loop body
}`,
    replacementTemplate: `// Replacement: affine.for with
// affine map bounds
affine.for %iv = 0 to 128 {
  // loop body (affine loads/stores)
}`,
    beforeIR: `func.func @fn(%buf: memref<128xf32>) {
  %c0 = arith.constant 0 : index
  %c128 = arith.constant 128 : index
  %c1 = arith.constant 1 : index
  scf.for %i = %c0 to %c128 step %c1 {
    %v = memref.load %buf[%i]
    %r = arith.mulf %v, %v : f32
    memref.store %r, %buf[%i]
  }
  return
}`,
    afterIR: `func.func @fn(%buf: memref<128xf32>) {
  affine.for %i = 0 to 128 {
    %v = affine.load %buf[%i]
    %r = arith.mulf %v, %v : f32
    affine.store %r, %buf[%i]
  }
  return
}`,
    matchedRegion: { startLine: 4, endLine: 8 },
  },
];

/* ─── Phases ─── */
type Phase = 'before' | 'match' | 'replace' | 'after';
const PHASES: Phase[] = ['before', 'match', 'replace', 'after'];

/* ─── Helpers ─── */

function codeLines(code: string): string[] {
  return code.split('\n');
}

/* ─── Props ─── */
interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Main Component ─── */

export default function DialectConversionDemo({ locale = 'zh' }: Props) {
  const [patternIdx, setPatternIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('before');

  const pattern = PATTERNS[patternIdx];
  const phaseIndex = PHASES.indexOf(phase);

  const t = {
    zh: {
      pattern: 'RewritePattern',
      replacement: 'Replacement',
      irBefore: 'IR (转换前)',
      irAfter: 'IR (转换后)',
      irMatched: 'IR (匹配中)',
      irReplacing: 'IR (替换中)',
      phases: ['原始 IR', '匹配 Pattern', '应用 Replacement', '转换结果'],
      matchHint: '高亮部分匹配了 Pattern',
      replaceHint: 'Pattern 被替换为新 IR',
      resultHint: '转换完成',
      selectPattern: '选择 Pattern',
    },
    en: {
      pattern: 'RewritePattern',
      replacement: 'Replacement',
      irBefore: 'IR (Before)',
      irAfter: 'IR (After)',
      irMatched: 'IR (Matching)',
      irReplacing: 'IR (Replacing)',
      phases: ['Original IR', 'Match Pattern', 'Apply Replacement', 'Result'],
      matchHint: 'Highlighted region matched the pattern',
      replaceHint: 'Pattern replaced with new IR',
      resultHint: 'Conversion complete',
      selectPattern: 'Select Pattern',
    },
  }[locale];

  const beforeLines = codeLines(pattern.beforeIR);
  const afterLines = codeLines(pattern.afterIR);

  /* Determine which IR to show */
  const showIR = phase === 'after' || phase === 'replace' ? afterLines : beforeLines;
  const irTitle = phase === 'before' ? t.irBefore
    : phase === 'match' ? t.irMatched
    : phase === 'replace' ? t.irReplacing
    : t.irAfter;

  const hint = phase === 'match' ? t.matchHint
    : phase === 'replace' ? t.replaceHint
    : phase === 'after' ? t.resultHint
    : '';

  /* Which template to highlight */
  const showPattern = phase === 'match' || phase === 'before';
  const showReplacement = phase === 'replace' || phase === 'after';

  return (
    <div className="my-6">
      {/* Pattern selector */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: COLORS.mid, fontWeight: 600 }}>
          {t.selectPattern}:
        </span>
        {PATTERNS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setPatternIdx(i); setPhase('before'); }}
            style={{
              padding: '4px 14px', fontSize: '12px',
              fontWeight: patternIdx === i ? 700 : 500,
              color: patternIdx === i ? COLORS.bg : COLORS.dark,
              background: patternIdx === i ? COLORS.purple : `${COLORS.light}80`,
              border: `1px solid ${patternIdx === i ? COLORS.purple : COLORS.light}`,
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {p.label[locale]}
          </button>
        ))}
      </div>

      {/* Phase stepper */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '16px',
      }}>
        {PHASES.map((p, i) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            style={{
              flex: 1, padding: '6px 8px', fontSize: '11px', fontWeight: 600,
              color: phase === p ? '#fff' : COLORS.dark,
              background: phase === p
                ? (i <= 1 ? COLORS.primary : i === 2 ? COLORS.orange : COLORS.green)
                : i <= phaseIndex ? `${COLORS.primary}15` : `${COLORS.light}80`,
              border: `1px solid ${phase === p ? 'transparent' : COLORS.light}`,
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
              textAlign: 'center',
            }}
          >
            {t.phases[i]}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 800 400" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Left column: Pattern / Replacement template */}
        <g>
          <rect x={10} y={10} width={260} height={375} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={140} y={32} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={showPattern ? COLORS.primary : COLORS.green}>
            {showPattern ? t.pattern : t.replacement}
          </text>
          <line x1={20} y1={40} x2={260} y2={40}
            stroke={showPattern ? COLORS.primary : COLORS.green}
            strokeWidth={1.5} opacity={0.5} />

          {/* Template code */}
          <foreignObject x={16} y={48} width={248} height={330}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: '9.5px', lineHeight: '1.5',
              color: COLORS.dark, whiteSpace: 'pre', padding: '4px',
              background: `${showPattern ? COLORS.primary : COLORS.green}06`,
              borderRadius: '4px', height: '100%', overflowY: 'auto',
            }}>
              {showPattern ? pattern.patternTemplate : pattern.replacementTemplate}
            </div>
          </foreignObject>

          {/* Active indicator */}
          <AnimatePresence>
            {(phase === 'match' || phase === 'replace') && (
              <motion.rect
                x={10} y={10} width={260} height={375} rx={8}
                fill="none"
                stroke={phase === 'match' ? COLORS.primary : COLORS.green}
                strokeWidth={2.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>
        </g>

        {/* Arrow between panels */}
        <g>
          <AnimatePresence>
            {phase === 'match' && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <text x={290} y={195} fontSize="16" fill={COLORS.primary} textAnchor="middle">
                  {'→'}
                </text>
                <text x={290} y={215} fontSize="9" fill={COLORS.primary} textAnchor="middle" fontWeight="600">
                  match
                </text>
              </motion.g>
            )}
            {phase === 'replace' && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <text x={290} y={195} fontSize="16" fill={COLORS.green} textAnchor="middle">
                  {'→'}
                </text>
                <text x={290} y={215} fontSize="9" fill={COLORS.green} textAnchor="middle" fontWeight="600">
                  replace
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </g>

        {/* Right column: IR code */}
        <g>
          <rect x={320} y={10} width={470} height={375} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={555} y={32} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.dark}>
            {irTitle}
          </text>
          <line x1={330} y1={40} x2={780} y2={40}
            stroke={COLORS.mid} strokeWidth={1} opacity={0.3} />

          {/* IR code lines */}
          <foreignObject x={326} y={48} width={458} height={290}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: '10px', lineHeight: '1.55',
              color: COLORS.dark, padding: '4px', overflowY: 'auto', height: '100%',
            }}>
              {showIR.map((line, i) => {
                const lineNum = i + 1;
                const isMatched = phase === 'match'
                  && lineNum >= pattern.matchedRegion.startLine
                  && lineNum <= pattern.matchedRegion.endLine;
                const isNew = (phase === 'replace' || phase === 'after')
                  && lineNum >= pattern.matchedRegion.startLine;
                return (
                  <div key={`${phase}-${i}`} style={{
                    display: 'flex', gap: '6px',
                    background: isMatched ? `${COLORS.highlight}`
                      : isNew ? `${COLORS.green}12`
                      : 'transparent',
                    borderLeft: isMatched ? `3px solid ${COLORS.primary}`
                      : isNew ? `3px solid ${COLORS.green}`
                      : '3px solid transparent',
                    padding: '0 4px',
                    transition: 'background 0.3s',
                  }}>
                    <span style={{
                      width: '20px', textAlign: 'right', color: COLORS.mid,
                      fontSize: '9px', userSelect: 'none', flexShrink: 0,
                    }}>
                      {lineNum}
                    </span>
                    <span style={{ whiteSpace: 'pre' }}>{line}</span>
                  </div>
                );
              })}
            </div>
          </foreignObject>

          {/* Hint text at bottom */}
          {hint && (
            <motion.text
              key={phase}
              x={555} y={370} textAnchor="middle" fontSize="10"
              fill={phase === 'match' ? COLORS.primary : COLORS.green}
              fontWeight="600"
              initial={{ opacity: 0, y: 375 }}
              animate={{ opacity: 1, y: 370 }}
            >
              {hint}
            </motion.text>
          )}
        </g>
      </svg>
    </div>
  );
}
