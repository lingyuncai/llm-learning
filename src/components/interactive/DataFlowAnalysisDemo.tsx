import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface BasicBlock {
  id: string;
  label: string;
  instructions: string[];
  successors: string[];
  predecessors: string[];
  x?: number;
  y?: number;
}

type AnalysisMode = 'constant-propagation' | 'liveness';
type LatticeValue = 'top' | 'bottom' | number;

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const CP_CFG: BasicBlock[] = [
  { id: 'B0', label: 'B0 (entry)', instructions: ['x = 3', 'y = 5'], successors: ['B1'], predecessors: [] },
  { id: 'B1', label: 'B1', instructions: ['z = x + y'], successors: ['B2'], predecessors: ['B0'] },
  { id: 'B2', label: 'B2', instructions: ['if z > 0'], successors: ['B3', 'B4'], predecessors: ['B1'] },
  { id: 'B3', label: 'B3', instructions: ['w = z × 2'], successors: ['B5'], predecessors: ['B2'] },
  { id: 'B4', label: 'B4', instructions: ['w = z − 1'], successors: ['B5'], predecessors: ['B2'] },
  { id: 'B5', label: 'B5 (exit)', instructions: ['return w'], successors: [], predecessors: ['B3', 'B4'] },
];

const POSITIONS: Record<string, { x: number; y: number }> = {
  B0: { x: 200, y: 50 },
  B1: { x: 200, y: 130 },
  B2: { x: 200, y: 210 },
  B3: { x: 100, y: 290 },
  B4: { x: 300, y: 290 },
  B5: { x: 200, y: 370 },
};

CP_CFG.forEach(b => {
  const pos = POSITIONS[b.id];
  if (pos) {
    b.x = pos.x;
    b.y = pos.y;
  }
});

/* ─── SVG Constants ─── */

const W = 800;
const H = 550;

/* ─── Constant Propagation Steps ─── */

interface CPState {
  worklist: string[];
  facts: Record<string, Record<string, LatticeValue>>;
  currentBlock?: string;
}

const CP_STEPS: CPState[] = [
  {
    worklist: ['B0', 'B1', 'B2', 'B3', 'B4', 'B5'],
    facts: {
      B0: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B1: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B2: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B3: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B4: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B5: { x: 'top', y: 'top', z: 'top', w: 'top' },
    },
  },
  {
    worklist: ['B1', 'B2', 'B3', 'B4', 'B5'],
    facts: {
      B0: { x: 3, y: 5, z: 'top', w: 'top' },
      B1: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B2: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B3: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B4: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B5: { x: 'top', y: 'top', z: 'top', w: 'top' },
    },
    currentBlock: 'B0',
  },
  {
    worklist: ['B2', 'B3', 'B4', 'B5'],
    facts: {
      B0: { x: 3, y: 5, z: 'top', w: 'top' },
      B1: { x: 3, y: 5, z: 8, w: 'top' },
      B2: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B3: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B4: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B5: { x: 'top', y: 'top', z: 'top', w: 'top' },
    },
    currentBlock: 'B1',
  },
  {
    worklist: ['B3', 'B4', 'B5'],
    facts: {
      B0: { x: 3, y: 5, z: 'top', w: 'top' },
      B1: { x: 3, y: 5, z: 8, w: 'top' },
      B2: { x: 3, y: 5, z: 8, w: 'top' },
      B3: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B4: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B5: { x: 'top', y: 'top', z: 'top', w: 'top' },
    },
    currentBlock: 'B2',
  },
  {
    worklist: ['B4', 'B5'],
    facts: {
      B0: { x: 3, y: 5, z: 'top', w: 'top' },
      B1: { x: 3, y: 5, z: 8, w: 'top' },
      B2: { x: 3, y: 5, z: 8, w: 'top' },
      B3: { x: 3, y: 5, z: 8, w: 16 },
      B4: { x: 'top', y: 'top', z: 'top', w: 'top' },
      B5: { x: 'top', y: 'top', z: 'top', w: 'top' },
    },
    currentBlock: 'B3',
  },
  {
    worklist: ['B5'],
    facts: {
      B0: { x: 3, y: 5, z: 'top', w: 'top' },
      B1: { x: 3, y: 5, z: 8, w: 'top' },
      B2: { x: 3, y: 5, z: 8, w: 'top' },
      B3: { x: 3, y: 5, z: 8, w: 16 },
      B4: { x: 3, y: 5, z: 8, w: 7 },
      B5: { x: 'top', y: 'top', z: 'top', w: 'top' },
    },
    currentBlock: 'B4',
  },
  {
    worklist: [],
    facts: {
      B0: { x: 3, y: 5, z: 'top', w: 'top' },
      B1: { x: 3, y: 5, z: 8, w: 'top' },
      B2: { x: 3, y: 5, z: 8, w: 'top' },
      B3: { x: 3, y: 5, z: 8, w: 16 },
      B4: { x: 3, y: 5, z: 8, w: 7 },
      B5: { x: 3, y: 5, z: 8, w: 'bottom' },
    },
    currentBlock: 'B5',
  },
];

/* ─── Component ─── */

export default function DataFlowAnalysisDemo({ locale = 'zh' }: Props) {
  const [mode, setMode] = useState<AnalysisMode>('constant-propagation');

  const t = {
    zh: {
      title: '数据流分析：Worklist 算法演示',
      subtitle: '观察常量传播如何在控制流图上迭代收敛',
      modeCP: '常量传播',
      modeLiveness: '活性分析',
      worklist: 'Worklist',
      empty: '空',
      processing: '正在处理',
      top: '⊤（未知）',
      bottom: '⊥（冲突）',
      constant: '常量',
      legend: '图例',
    },
    en: {
      title: 'Data Flow Analysis: Worklist Algorithm Demo',
      subtitle: 'Observe constant propagation iterating to convergence on CFG',
      modeCP: 'Constant Propagation',
      modeLiveness: 'Liveness Analysis',
      worklist: 'Worklist',
      empty: 'Empty',
      processing: 'Processing',
      top: '⊤ (unknown)',
      bottom: '⊥ (conflict)',
      constant: 'Constant',
      legend: 'Legend',
    },
  }[locale]!;

  const cpSteps = useMemo(() => {
    return CP_STEPS.map((state, i) => ({
      title: `${locale === 'zh' ? '步骤' : 'Step'} ${i}`,
      content: (
        <div>
          <CFGView state={state} cfg={CP_CFG} locale={locale} t={t} />
        </div>
      ),
    }));
  }, [locale, t]);

  return (
    <div className="my-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('constant-propagation')}
            className={`px-3 py-1 text-sm rounded ${
              mode === 'constant-propagation'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t.modeCP}
          </button>
          <button
            onClick={() => setMode('liveness')}
            className={`px-3 py-1 text-sm rounded opacity-50 cursor-not-allowed`}
            disabled
          >
            {t.modeLiveness}
          </button>
        </div>
      </div>

      {mode === 'constant-propagation' && <StepNavigator steps={cpSteps} locale={locale} />}
    </div>
  );
}

/* ─── CFG View ─── */

interface CFGViewProps {
  state: CPState;
  cfg: BasicBlock[];
  locale: 'zh' | 'en';
  t: any;
}

function CFGView({ state, cfg, locale, t }: CFGViewProps) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <style>{`text { font-family: ${FONTS.sans}; }`}</style>

      <defs>
        <marker id="cfg-arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
          <path d="M0,1 L8,4 L0,7" fill={COLORS.primary} opacity={0.5} />
        </marker>
      </defs>

      {/* Title */}
      <text x={20} y={20} fontSize="12" fontWeight="700" fill={COLORS.dark}>
        {t.title}
      </text>

      {/* Edges */}
      {cfg.map(block => {
        return block.successors.map(succId => {
          const succ = cfg.find(b => b.id === succId);
          if (!block.x || !block.y || !succ || !succ.x || !succ.y) return null;
          return (
            <line
              key={`${block.id}-${succId}`}
              x1={block.x}
              y1={block.y + 45}
              x2={succ.x}
              y2={succ.y - 10}
              stroke={COLORS.primary}
              strokeWidth={1.5}
              strokeOpacity={0.4}
              markerEnd="url(#cfg-arrow)"
            />
          );
        });
      })}

      {/* Blocks */}
      {cfg.map(block => {
        if (!block.x || !block.y) return null;
        const facts = state.facts[block.id];
        const isCurrent = state.currentBlock === block.id;

        return (
          <motion.g
            key={block.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: block.x, y: block.y }}
            transition={{ duration: 0.3 }}
          >
            {/* Block box */}
            <rect
              x={-70}
              y={-10}
              width={140}
              height={55}
              rx={6}
              fill={isCurrent ? COLORS.highlight : COLORS.bg}
              stroke={isCurrent ? COLORS.orange : COLORS.primary}
              strokeWidth={isCurrent ? 2.5 : 1.5}
            />

            {/* Block label */}
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={COLORS.dark}
            >
              {block.label}
            </text>

            {/* Instructions */}
            {block.instructions.slice(0, 2).map((instr, i) => (
              <text
                key={i}
                x={0}
                y={20 + i * 12}
                textAnchor="middle"
                fontSize="9"
                fill={COLORS.mid}
                style={{ fontFamily: FONTS.mono }}
              >
                {instr}
              </text>
            ))}

            {/* Facts */}
            <rect
              x={-68}
              y={48}
              width={136}
              height={30}
              rx={4}
              fill={COLORS.bgAlt}
              stroke={COLORS.light}
              strokeWidth={1}
            />
            <text x={0} y={60} textAnchor="middle" fontSize="8" fill={COLORS.mid}>
              {formatFacts(facts, locale)}
            </text>
          </motion.g>
        );
      })}

      {/* Worklist panel */}
      <g transform="translate(500, 80)">
        <rect x={0} y={0} width={260} height={180} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1.5} />
        <text x={10} y={20} fontSize="12" fontWeight="700" fill={COLORS.dark}>
          {t.worklist}
        </text>

        {state.worklist.length === 0 ? (
          <text x={130} y={90} textAnchor="middle" fontSize="11" fill={COLORS.mid}>
            {t.empty}
          </text>
        ) : (
          <g>
            {state.worklist.slice(0, 6).map((blockId, i) => (
              <g key={i} transform={`translate(10, ${35 + i * 24})`}>
                <rect x={0} y={0} width={240} height={20} rx={4} fill={COLORS.bg} stroke={COLORS.primary} strokeWidth={1} />
                <text x={120} y={10} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="600" fill={COLORS.primary}>
                  {blockId}
                </text>
              </g>
            ))}
          </g>
        )}

        {state.currentBlock && (
          <g transform="translate(10, 155)">
            <text x={0} y={0} fontSize="10" fontWeight="600" fill={COLORS.orange}>
              {t.processing}: {state.currentBlock}
            </text>
          </g>
        )}
      </g>

      {/* Legend */}
      <g transform="translate(500, 280)">
        <rect x={0} y={0} width={260} height={100} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1.5} />
        <text x={10} y={20} fontSize="11" fontWeight="700" fill={COLORS.dark}>
          {t.legend}
        </text>

        <g transform="translate(10, 30)">
          <rect x={0} y={0} width={16} height={12} rx={2} fill={COLORS.masked} />
          <text x={22} y={6} dominantBaseline="middle" fontSize="10" fill={COLORS.mid}>
            {t.top}
          </text>
        </g>

        <g transform="translate(10, 50)">
          <rect x={0} y={0} width={16} height={12} rx={2} fill={COLORS.green} fillOpacity={0.3} />
          <text x={22} y={6} dominantBaseline="middle" fontSize="10" fill={COLORS.green}>
            {t.constant}
          </text>
        </g>

        <g transform="translate(10, 70)">
          <rect x={0} y={0} width={16} height={12} rx={2} fill={COLORS.red} fillOpacity={0.3} />
          <text x={22} y={6} dominantBaseline="middle" fontSize="10" fill={COLORS.red}>
            {t.bottom}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* ─── Helpers ─── */

function formatFacts(facts: Record<string, LatticeValue>, locale: 'zh' | 'en'): string {
  const vars = Object.keys(facts);
  const parts = vars.slice(0, 4).map(v => {
    const val = facts[v];
    if (val === 'top') return `${v}=⊤`;
    if (val === 'bottom') return `${v}=⊥`;
    return `${v}=${val}`;
  });
  return parts.join(', ');
}
