import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface CodeExample {
  label: { zh: string; en: string };
  pythonCode: string;
  bytecodeOps: string[];
  fxNodes: { op: string; target: string; args: string[] }[];
  graphBreaks: number[];
  breakReason?: { zh: string; en: string };
}

/* ─── Data ─── */

const EXAMPLES: CodeExample[] = [
  {
    label: { zh: '纯计算（无 Graph Break）', en: 'Pure Computation (No Graph Break)' },
    pythonCode: `def fn(x, w):\n    y = x @ w\n    y = y + 1\n    return y.relu()`,
    bytecodeOps: ['LOAD_FAST x', 'LOAD_FAST w', 'BINARY_MATMUL', 'LOAD_CONST 1', 'BINARY_ADD', 'CALL_METHOD relu', 'RETURN_VALUE'],
    fxNodes: [
      { op: 'placeholder', target: 'x', args: [] },
      { op: 'placeholder', target: 'w', args: [] },
      { op: 'call_function', target: 'torch.matmul', args: ['x', 'w'] },
      { op: 'call_function', target: 'torch.add', args: ['matmul', '1'] },
      { op: 'call_method', target: 'relu', args: ['add'] },
      { op: 'output', target: 'output', args: ['relu'] },
    ],
    graphBreaks: [],
  },
  {
    label: { zh: '带 if/else 控制流', en: 'With if/else Control Flow' },
    pythonCode: `def fn(x, flag):\n    y = x * 2\n    if flag:\n        y = y + 1\n    else:\n        y = y - 1\n    return y`,
    bytecodeOps: ['LOAD_FAST x', 'LOAD_CONST 2', 'BINARY_MUL', 'LOAD_FAST flag', 'POP_JUMP_IF_FALSE', '\u2192 GRAPH BREAK', 'LOAD_CONST 1', 'BINARY_ADD/SUB', 'RETURN_VALUE'],
    fxNodes: [
      { op: 'placeholder', target: 'x', args: [] },
      { op: 'call_function', target: 'torch.mul', args: ['x', '2'] },
      { op: 'output', target: 'output', args: ['mul'] },
    ],
    graphBreaks: [5],
    breakReason: { zh: 'data-dependent 控制流无法在编译时确定', en: 'Data-dependent control flow cannot be resolved at compile time' },
  },
  {
    label: { zh: 'Data-Dependent 控制流', en: 'Data-Dependent Control Flow' },
    pythonCode: `def fn(x):\n    if x.sum() > 0:\n        return x * 2\n    return x * 3`,
    bytecodeOps: ['LOAD_FAST x', 'CALL_METHOD sum', 'LOAD_CONST 0', 'COMPARE_OP >', '\u2192 GRAPH BREAK', 'LOAD_FAST x', 'BINARY_MUL'],
    fxNodes: [
      { op: 'placeholder', target: 'x', args: [] },
      { op: 'call_method', target: 'sum', args: ['x'] },
      { op: 'output', target: 'output', args: ['sum'] },
    ],
    graphBreaks: [4],
    breakReason: { zh: 'x.sum() > 0 取决于运行时的 tensor 值', en: 'x.sum() > 0 depends on runtime tensor values' },
  },
];

/* ─── Color helpers ─── */

const OP_COLORS: Record<string, string> = {
  placeholder: COLORS.primary,
  call_function: COLORS.green,
  call_method: '#00838f',
  output: COLORS.orange,
};

/* ─── Props ─── */

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Component ─── */

export default function DynamoTracingFlow({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'TorchDynamo 追踪流程',
      pythonCode: 'Python 源码',
      bytecode: '字节码分析',
      fxGraph: 'FX Graph',
      graphBreak: 'Graph Break',
      play: '播放',
      pause: '暂停',
      reset: '重置',
      step: '步骤',
    },
    en: {
      title: 'TorchDynamo Tracing Flow',
      pythonCode: 'Python Source',
      bytecode: 'Bytecode Analysis',
      fxGraph: 'FX Graph',
      graphBreak: 'Graph Break',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      step: 'Step',
    },
  }[locale]!;

  const [exampleIdx, setExampleIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const example = EXAMPLES[exampleIdx];
  const totalSteps = example.bytecodeOps.length;

  // Determine which FX nodes are visible at the current step
  const visibleFxNodes = (() => {
    if (currentStep < 0) return 0;
    // Map bytecode steps to FX nodes progressively
    const ratio = (currentStep + 1) / totalSteps;
    return Math.min(Math.ceil(ratio * example.fxNodes.length), example.fxNodes.length);
  })();

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const advanceStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev >= totalSteps - 1) {
        stopPlayback();
        return prev;
      }
      return prev + 1;
    });
  }, [totalSteps, stopPlayback]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(advanceStep, 700);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, advanceStep]);

  const handlePlay = () => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(-1);
    }
    setIsPlaying(true);
    setCurrentStep(prev => prev + 1);
  };

  const handleReset = () => {
    stopPlayback();
    setCurrentStep(-1);
  };

  const handleExampleChange = (idx: number) => {
    stopPlayback();
    setExampleIdx(idx);
    setCurrentStep(-1);
  };

  // Layout constants
  const W = 900, H = 500;
  const COL1_X = 10, COL1_W = 260;
  const COL2_X = 285, COL2_W = 260;
  const COL3_X = 560, COL3_W = 330;
  const HEADER_Y = 60;
  const CONTENT_Y = 85;

  const codeLines = example.pythonCode.split('\n');

  return (
    <div className="my-6">
      {/* Example selector tabs */}
      <div className="flex flex-wrap gap-2 mb-3">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => handleExampleChange(i)}
            className="px-3 py-1 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: i === exampleIdx ? COLORS.primary : COLORS.bgAlt,
              color: i === exampleIdx ? '#fff' : COLORS.dark,
              border: `1px solid ${i === exampleIdx ? COLORS.primary : COLORS.light}`,
            }}
          >
            {ex.label[locale]}
          </button>
        ))}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2 mb-3">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="px-3 py-1 text-sm rounded-md text-white"
            style={{ backgroundColor: COLORS.green }}
          >
            {t.play}
          </button>
        ) : (
          <button
            onClick={stopPlayback}
            className="px-3 py-1 text-sm rounded-md text-white"
            style={{ backgroundColor: COLORS.orange }}
          >
            {t.pause}
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-3 py-1 text-sm rounded-md"
          style={{ backgroundColor: COLORS.bgAlt, border: `1px solid ${COLORS.light}` }}
        >
          {t.reset}
        </button>
        <span className="text-sm" style={{ color: COLORS.mid }}>
          {t.step}: {currentStep + 1} / {totalSteps}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Column headers */}
        <text x={COL1_X + COL1_W / 2} y={HEADER_Y - 18} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.dark}>
          {t.pythonCode}
        </text>
        <text x={COL2_X + COL2_W / 2} y={HEADER_Y - 18} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.dark}>
          {t.bytecode}
        </text>
        <text x={COL3_X + COL3_W / 2} y={HEADER_Y - 18} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.dark}>
          {t.fxGraph}
        </text>

        {/* Separator lines */}
        <line x1={COL2_X - 7} y1={HEADER_Y - 30} x2={COL2_X - 7} y2={H - 10} stroke={COLORS.light} strokeWidth="1" />
        <line x1={COL3_X - 7} y1={HEADER_Y - 30} x2={COL3_X - 7} y2={H - 10} stroke={COLORS.light} strokeWidth="1" />

        {/* Column 1: Python code */}
        <rect x={COL1_X} y={HEADER_Y} width={COL1_W} height={codeLines.length * 22 + 16} rx="6" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
        {codeLines.map((line, i) => (
          <text
            key={i}
            x={COL1_X + 12}
            y={HEADER_Y + 20 + i * 22}
            fontSize="11"
            fontFamily={FONTS.mono}
            fill={COLORS.dark}
          >
            {line}
          </text>
        ))}

        {/* Column 2: Bytecode ops */}
        {example.bytecodeOps.map((op, i) => {
          const y = CONTENT_Y + i * 42;
          const isCurrentOp = i === currentStep;
          const isPast = i < currentStep;
          const isGraphBreak = example.graphBreaks.includes(i);

          return (
            <g key={i}>
              {/* Background rect */}
              <motion.rect
                x={COL2_X}
                y={y}
                width={COL2_W}
                height={32}
                rx="4"
                fill={isGraphBreak ? COLORS.waste : (isCurrentOp ? COLORS.highlight : (isPast ? COLORS.valid : COLORS.bgAlt))}
                stroke={isGraphBreak ? COLORS.red : (isCurrentOp ? COLORS.orange : COLORS.light)}
                strokeWidth={isCurrentOp ? 2 : 1}
                animate={isCurrentOp ? { strokeOpacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              />

              {/* Op text */}
              <text
                x={COL2_X + 10}
                y={y + 20}
                fontSize="10.5"
                fontFamily={FONTS.mono}
                fill={isGraphBreak ? COLORS.red : COLORS.dark}
                fontWeight={isCurrentOp ? '700' : '400'}
              >
                {op}
              </text>

              {/* Graph break marker */}
              {isGraphBreak && (
                <g>
                  <line x1={COL2_X} y1={y - 2} x2={COL2_X + COL2_W} y2={y - 2} stroke={COLORS.red} strokeWidth="2" strokeDasharray="6,3" />
                  <text x={COL2_X + COL2_W + 4} y={y + 6} fontSize="8" fill={COLORS.red} fontWeight="600">
                    {t.graphBreak}
                  </text>
                </g>
              )}

              {/* Arrow connecting to next */}
              {i < example.bytecodeOps.length - 1 && !isGraphBreak && (
                <line
                  x1={COL2_X + COL2_W / 2}
                  y1={y + 32}
                  x2={COL2_X + COL2_W / 2}
                  y2={y + 42}
                  stroke={COLORS.light}
                  strokeWidth="1"
                  markerEnd="url(#arrowDown)"
                />
              )}
            </g>
          );
        })}

        {/* Column 3: FX Graph nodes */}
        <AnimatePresence>
          {example.fxNodes.slice(0, visibleFxNodes).map((node, i) => {
            const y = CONTENT_Y + i * 58;
            const color = OP_COLORS[node.op] || COLORS.mid;

            return (
              <motion.g
                key={`${exampleIdx}-${node.target}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Node box */}
                <rect
                  x={COL3_X}
                  y={y}
                  width={COL3_W - 10}
                  height={44}
                  rx="6"
                  fill={color}
                  fillOpacity={0.08}
                  stroke={color}
                  strokeWidth="1.5"
                />

                {/* Op type badge */}
                <rect x={COL3_X + 6} y={y + 4} width={90} height={16} rx="8" fill={color} fillOpacity={0.2} />
                <text x={COL3_X + 51} y={y + 15} textAnchor="middle" fontSize="8.5" fontWeight="600" fill={color}>
                  {node.op}
                </text>

                {/* Target */}
                <text x={COL3_X + 104} y={y + 15} fontSize="10" fontFamily={FONTS.mono} fill={COLORS.dark} fontWeight="600">
                  {node.target}
                </text>

                {/* Args */}
                {node.args.length > 0 && (
                  <text x={COL3_X + 12} y={y + 36} fontSize="9" fontFamily={FONTS.mono} fill={COLORS.mid}>
                    args: ({node.args.join(', ')})
                  </text>
                )}

                {/* Connecting arrow */}
                {i > 0 && (
                  <line
                    x1={COL3_X + (COL3_W - 10) / 2}
                    y1={y - 14}
                    x2={COL3_X + (COL3_W - 10) / 2}
                    y2={y}
                    stroke={COLORS.mid}
                    strokeWidth="1"
                    markerEnd="url(#arrowFx)"
                  />
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Graph break reason tooltip */}
        {example.breakReason && currentStep >= 0 && example.graphBreaks.some(b => currentStep >= b) && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <rect
              x={COL3_X}
              y={H - 70}
              width={COL3_W - 10}
              height={50}
              rx="6"
              fill={COLORS.waste}
              stroke={COLORS.red}
              strokeWidth="1"
            />
            <text x={COL3_X + 10} y={H - 50} fontSize="9" fontWeight="600" fill={COLORS.red}>
              {t.graphBreak}:
            </text>
            <text x={COL3_X + 10} y={H - 34} fontSize="9" fill={COLORS.dark}>
              {example.breakReason[locale]}
            </text>
          </motion.g>
        )}

        {/* Arrow markers */}
        <defs>
          <marker id="arrowDown" viewBox="0 0 10 10" refX="5" refY="10" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L5,10 L10,0" fill="none" stroke={COLORS.light} strokeWidth="1.5" />
          </marker>
          <marker id="arrowFx" viewBox="0 0 10 10" refX="5" refY="10" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L5,10 L10,0" fill="none" stroke={COLORS.mid} strokeWidth="1.5" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
