import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const N = 5;
const TOKENS = ['Hello', 'world', 'how', 'are', 'you'];

function AttentionGrid({ step, t }: { step: number; t: any }) {
  const totalRows = step + 1;
  const cellSize = 36;
  const labelW = 48;
  const labelH = 24;
  const svgW = labelW + (totalRows + 1) * cellSize;
  const svgH = labelH + (totalRows + 1) * cellSize;

  let wastedCells = 0;
  let totalCells = 0;

  return (
    <svg viewBox={`0 0 ${svgW + 10} ${svgH + 30}`} className="w-full max-w-sm mx-auto">
      {TOKENS.slice(0, totalRows + 1).map((tk, j) => (
        <text key={`c-${j}`} x={labelW + j * cellSize + cellSize / 2} y={labelH - 4}
          textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">{tk}</text>
      ))}
      {Array.from({ length: totalRows }, (_, i) => {
        const isRecomputed = i < step;
        const cols = i + 2;
        return TOKENS.slice(0, cols).map((_, j) => {
          const fill = isRecomputed ? COLORS.waste : COLORS.valid;
          if (isRecomputed) wastedCells++;
          totalCells++;
          return (
            <g key={`${i}-${j}`}>
              <rect x={labelW + j * cellSize} y={labelH + i * cellSize}
                width={cellSize - 1} height={cellSize - 1} rx={3}
                fill={fill} stroke="#d1d5db" strokeWidth={0.5} />
              {isRecomputed && (
                <line x1={labelW + j * cellSize + 3} y1={labelH + i * cellSize + 3}
                  x2={labelW + j * cellSize + cellSize - 4} y2={labelH + i * cellSize + cellSize - 4}
                  stroke={COLORS.red} strokeWidth={1.5} opacity={0.5} />
              )}
            </g>
          );
        });
      })}
      {Array.from({ length: totalRows }, (_, i) => (
        <text key={`r-${i}`} x={labelW - 4} y={labelH + i * cellSize + cellSize / 2 + 3}
          textAnchor="end" fontSize="8" fill={i < step ? COLORS.red : COLORS.primary}
          fontFamily="system-ui" fontWeight={i === step ? '700' : '400'}>
          gen {TOKENS[i + 1]}
        </text>
      ))}
      {(() => { wastedCells = 0; totalCells = 0;
        for (let i = 0; i < totalRows; i++) {
          for (let j = 0; j < i + 2; j++) {
            if (i < step) wastedCells++;
            totalCells++;
          }
        }
        return (
          <text x={svgW / 2} y={svgH + 20} textAnchor="middle" fontSize="10" fill={COLORS.dark} fontFamily="system-ui">
            {t.totalCompute}: {totalCells} · {t.waste}: {wastedCells} ({totalCells > 0 ? ((wastedCells / totalCells) * 100).toFixed(0) : 0}%)
          </text>
        );
      })()}
    </svg>
  );
}

export default function RedundantComputationViz({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      genStep: (token: string, step: number) => `生成 "${token}" (第 ${step} 步)`,
      firstStep: '第一步没有重复计算。',
      prevRows: (n: number) => `前 ${n} 行（浅红 + 划线）是重复计算 — 这些 attention 分数之前已经算过了！`,
      newCompute: '新计算',
      redundantCompute: '重复计算',
      totalCompute: '总计算',
      waste: '浪费',
    },
    en: {
      genStep: (token: string, step: number) => `Generate "${token}" (Step ${step})`,
      firstStep: 'First step has no redundant computation.',
      prevRows: (n: number) => `Previous ${n} rows (light red + strikethrough) are redundant — these attention scores were already computed!`,
      newCompute: 'New',
      redundantCompute: 'Redundant',
      totalCompute: 'Total',
      waste: 'Waste',
    },
  }[locale];

  const steps = Array.from({ length: N - 1 }, (_, step) => ({
    title: t.genStep(TOKENS[step + 1], step + 1),
    content: (
      <div>
        <p className="text-sm text-gray-600 mb-3">
          {step === 0 ? t.firstStep : t.prevRows(step)}
        </p>
        <AttentionGrid step={step} t={t} />
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.valid }} /> {t.newCompute}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.waste }} /> {t.redundantCompute}
          </span>
        </div>
      </div>
    ),
  }));

  return <StepNavigator steps={steps} />;
}
