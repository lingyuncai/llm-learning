import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

type AccessPattern = 'no_conflict' | 'stride_2' | 'stride_32' | 'swizzled';

interface PatternConfig {
  id: AccessPattern;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  getBank: (threadIdx: number) => number;
  conflictDegree: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const NUM_BANKS = 8;
const NUM_THREADS = 8;

const PATTERNS: PatternConfig[] = [
  {
    id: 'no_conflict',
    label: { zh: '无冲突 (stride=1)', en: 'No conflict (stride=1)' },
    description: {
      zh: '每个线程访问连续的 4 字节，映射到不同 bank。32 线程并行访问，无冲突。',
      en: 'Each thread accesses consecutive 4 bytes, mapped to different banks. 32 threads access in parallel, no conflicts.',
    },
    getBank: (tid) => tid % NUM_BANKS,
    conflictDegree: 1,
  },
  {
    id: 'stride_2',
    label: { zh: '2-way 冲突 (stride=2)', en: '2-way conflict (stride=2)' },
    description: {
      zh: '线程以 stride=2 访问，偶数 bank 被两个线程同时访问，需要 2 次串行访问。完整 warp (32 线程) 中同理。',
      en: 'Threads access with stride=2, even banks hit by 2 threads simultaneously, requiring 2 serial accesses. Same in full warp (32 threads).',
    },
    getBank: (tid) => (tid * 2) % NUM_BANKS,
    conflictDegree: 2,
  },
  {
    id: 'stride_32',
    label: { zh: '全冲突 (stride=N)', en: 'Full conflict (stride=N)' },
    description: {
      zh: '所有线程访问同一个 bank！完整 warp 中 32 个线程完全串行化，性能下降 32 倍。',
      en: 'All threads access the same bank! In a full warp, 32 threads fully serialized, 32x performance drop.',
    },
    getBank: (_tid) => 0,
    conflictDegree: 32,
  },
  {
    id: 'swizzled',
    label: { zh: 'Swizzle 优化', en: 'Swizzled (fixed)' },
    description: {
      zh: '通过 XOR swizzle 重新映射地址，消除 bank conflict。常用公式: bank = (row ⊕ col) % N_banks。',
      en: 'XOR swizzle remaps addresses to eliminate bank conflicts. Common formula: bank = (row XOR col) % N_banks.',
    },
    getBank: (tid) => (tid ^ (Math.floor(tid / NUM_BANKS) * 3)) % NUM_BANKS,
    conflictDegree: 1,
  },
];

/* ─── Component ─── */

export default function BankConflictVisualizer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Shared Memory Bank Conflict 可视化',
      threads: '线程',
      banks: 'Banks',
      note: '展示 8 个线程/bank；模式在完整 warp (32 线程) 中重复。',
      perfLabel: '访问时间',
      noConflict: '无冲突 (1x)',
      serialized: '倍串行化',
      formula: '公式: bank = (row ⊕ col) % 32',
      conflictCount: '次访问',
    },
    en: {
      title: 'Shared Memory Bank Conflict Visualization',
      threads: 'Threads',
      banks: 'Banks',
      note: 'Showing 8 threads/banks; pattern repeats for full warp (32 threads).',
      perfLabel: 'Access Time',
      noConflict: 'No conflict (1x)',
      serialized: 'x serialized',
      formula: 'Formula: bank = (row XOR col) % 32',
      conflictCount: ' accesses',
    },
  }[locale]!;

  const [activePattern, setActivePattern] = useState<AccessPattern>('no_conflict');
  const pattern = PATTERNS.find(p => p.id === activePattern)!;

  // Compute bank access counts
  const bankAccess: number[] = Array(NUM_BANKS).fill(0);
  const threadToBank: number[] = [];
  for (let tid = 0; tid < NUM_THREADS; tid++) {
    const bank = pattern.getBank(tid);
    threadToBank.push(bank);
    bankAccess[bank]++;
  }

  const maxConflict = Math.max(...bankAccess);
  const hasConflict = maxConflict > 1;

  // Connection line color
  function lineColor(bankIdx: number): string {
    if (bankAccess[bankIdx] > 1) return COLORS.red;
    return COLORS.green;
  }

  // Thread positions
  const threadX = 80;
  const threadStartY = 110;
  const threadSpacing = 34;

  // Bank positions
  const bankStartX = 400;
  const bankSpacing = 44;
  const bankTopY = 100;
  const bankHeight = 200;

  return (
    <div className="my-6">
      <svg viewBox="0 0 800 480" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x="400" y="24" textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Pattern selector buttons */}
        {PATTERNS.map((p, i) => {
          const bx = 30 + i * 190;
          const isActive = activePattern === p.id;
          const btnColor = p.conflictDegree === 1 ? COLORS.green : p.conflictDegree === 2 ? COLORS.orange : COLORS.red;
          return (
            <g key={p.id} onClick={() => setActivePattern(p.id)} style={{ cursor: 'pointer' }}>
              <rect x={bx} y={38} width={175} height={26} rx="6"
                fill={isActive ? btnColor : COLORS.bgAlt}
                fillOpacity={isActive ? 0.15 : 1}
                stroke={isActive ? btnColor : COLORS.light}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={bx + 87} y={55} textAnchor="middle" fontSize="10" fontWeight={isActive ? '700' : '500'}
                fill={isActive ? btnColor : COLORS.mid} fontFamily={FONTS.mono}>
                {p.label[locale]}
              </text>
            </g>
          );
        })}

        {/* Thread label */}
        <text x={threadX} y={90} textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.threads}
        </text>

        {/* Thread circles */}
        {Array.from({ length: NUM_THREADS }).map((_, tid) => {
          const cy = threadStartY + tid * threadSpacing;
          return (
            <g key={`thread-${tid}`}>
              <circle cx={threadX} cy={cy} r="14"
                fill={HEAD_COLORS[tid % HEAD_COLORS.length]} fillOpacity={0.15}
                stroke={HEAD_COLORS[tid % HEAD_COLORS.length]} strokeWidth="2"
              />
              <text x={threadX} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight="700" fontFamily={FONTS.mono}
                fill={HEAD_COLORS[tid % HEAD_COLORS.length]}>
                T{tid}
              </text>
            </g>
          );
        })}

        {/* Bank label */}
        <text x={bankStartX + (NUM_BANKS - 1) * bankSpacing / 2} y={90} textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.banks}
        </text>

        {/* Bank columns */}
        {Array.from({ length: NUM_BANKS }).map((_, bi) => {
          const bx = bankStartX + bi * bankSpacing;
          const accessCount = bankAccess[bi];
          const isConflict = accessCount > 1;
          return (
            <g key={`bank-${bi}`}>
              {/* Bank column */}
              <rect x={bx - 15} y={bankTopY} width={30} height={bankHeight} rx="4"
                fill={isConflict ? COLORS.red : COLORS.green}
                fillOpacity={isConflict ? 0.15 : 0.08}
                stroke={isConflict ? COLORS.red : COLORS.green}
                strokeWidth={isConflict ? 2.5 : 1}
                strokeOpacity={isConflict ? 0.8 : 0.4}
              />
              {/* Bank label */}
              <text x={bx} y={bankTopY + bankHeight + 18} textAnchor="middle"
                fontSize="10" fontWeight="600" fontFamily={FONTS.mono}
                fill={isConflict ? COLORS.red : COLORS.mid}>
                B{bi}
              </text>
              {/* Conflict count badge */}
              {accessCount > 0 && (
                <>
                  <circle cx={bx} cy={bankTopY - 10} r="10"
                    fill={isConflict ? COLORS.red : COLORS.green}
                    fillOpacity={0.15}
                    stroke={isConflict ? COLORS.red : COLORS.green}
                    strokeWidth="1.5"
                  />
                  <text x={bx} y={bankTopY - 6} textAnchor="middle" dominantBaseline="middle"
                    fontSize="9" fontWeight="700"
                    fill={isConflict ? COLORS.red : COLORS.green}>
                    {accessCount}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Connection lines */}
        <AnimatePresence mode="wait">
          <motion.g
            key={activePattern}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {threadToBank.map((bank, tid) => {
              const x1 = threadX + 16;
              const y1 = threadStartY + tid * threadSpacing;
              const x2 = bankStartX + bank * bankSpacing - 15;
              const y2 = bankTopY + (tid / NUM_THREADS) * bankHeight + 20;
              const color = lineColor(bank);
              return (
                <motion.line
                  key={`line-${tid}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color} strokeWidth={bankAccess[bank] > 1 ? 2 : 1.5}
                  strokeOpacity={0.6}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.4, delay: tid * 0.05 }}
                />
              );
            })}
          </motion.g>
        </AnimatePresence>

        {/* Note text */}
        <text x={30} y={345} fontSize="9" fill={COLORS.mid} fontStyle="italic">
          {t.note}
        </text>

        {/* Performance bar */}
        <text x={30} y={375} fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.perfLabel}
        </text>

        <rect x={30} y={385} width={500} height={18} rx="4" fill={COLORS.light} />
        <motion.rect
          x={30} y={385} height={18} rx="4"
          fill={hasConflict ? COLORS.red : COLORS.green}
          fillOpacity={0.5}
          animate={{ width: Math.min(500, (maxConflict / 32) * 500 + 15) }}
          transition={{ duration: 0.4 }}
        />
        <text x={Math.min(530, 30 + (maxConflict / 32) * 500 + 25)} y={398}
          fontSize="10" fontWeight="700" fontFamily={FONTS.mono}
          fill={hasConflict ? COLORS.red : COLORS.green}>
          {maxConflict === 1 ? t.noConflict : `${maxConflict}${t.serialized}`}
        </text>

        {/* Scale markers */}
        {[1, 8, 16, 32].map(v => {
          const x = 30 + (v / 32) * 500;
          return (
            <g key={v}>
              <line x1={x} y1={403} x2={x} y2={410} stroke={COLORS.mid} strokeWidth="1" strokeOpacity={0.4} />
              <text x={x} y={420} textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
                {v}x
              </text>
            </g>
          );
        })}

        {/* Description */}
        <rect x={30} y={430} width={740} height={40} rx="6"
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1"
        />
        <text x={40} y={450} fontSize="10.5" fill={COLORS.dark}>
          {pattern.description[locale]}
        </text>

        {/* Swizzle formula (only for swizzled pattern) */}
        {activePattern === 'swizzled' && (
          <text x={40} y={465} fontSize="10" fontFamily={FONTS.mono} fontWeight="600" fill={COLORS.green}>
            {t.formula}
          </text>
        )}
      </svg>
    </div>
  );
}
