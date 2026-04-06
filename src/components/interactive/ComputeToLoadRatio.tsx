// src/components/interactive/ComputeToLoadRatio.tsx
// Interactive: TM/TN → compute-to-load ratio calculator
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 240;

export default function ComputeToLoadRatio({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      tmLabel: 'TM (rows per thread)',
      tnLabel: 'TN (cols per thread)',
      threadTile: 'Thread Tile',
      outputElements: '个输出元素',
      perLoopStep: '每次内循环 k 步:',
      sharedMemReads: '从 shared mem 读',
      fmaCompute: 'FMA 计算',
      times: '次',
      computeToLoad: 'Compute:Load',
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '低效',
      registerUsage: '寄存器使用',
      accumulator: 'C 累加器',
      fragA: 'A 片段',
      fragB: 'B 片段',
      registers: '个寄存器',
      tradeoff: '寄存器越多 → thread tile 越大 → 比率越高，但 occupancy 可能下降 (trade-off)',
    },
    en: {
      tmLabel: 'TM (rows per thread)',
      tnLabel: 'TN (cols per thread)',
      threadTile: 'Thread Tile',
      outputElements: 'output elements',
      perLoopStep: 'Per inner loop k step:',
      sharedMemReads: 'Reads from shared mem',
      fmaCompute: 'FMA compute',
      times: 'times',
      computeToLoad: 'Compute:Load',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      registerUsage: 'Register usage',
      accumulator: 'C accumulator',
      fragA: 'A fragment',
      fragB: 'B fragment',
      registers: 'registers',
      tradeoff: 'More registers → larger thread tile → higher ratio, but occupancy may drop (trade-off)',
    },
  }[locale];

  const [TM, setTM] = useState(4);
  const [TN, setTN] = useState(4);

  const ratio = (TM * TN) / (TM + TN);
  const fmas = TM * TN;
  const loads = TM + TN;
  const regsNeeded = TM * TN + TM + TN; // C accumulator + A frag + B frag

  // Ratio quality
  const qualityColor = ratio >= 4 ? COLORS.green : ratio >= 2 ? '#ca8a04' : ratio >= 1 ? COLORS.orange : COLORS.red;
  const qualityLabel = ratio >= 4 ? t.excellent : ratio >= 2 ? t.good : ratio >= 1 ? t.fair : t.poor;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">{t.tmLabel}</span>
          <input type="range" min={1} max={8} step={1} value={TM}
            onChange={e => setTM(+e.target.value)} className="w-full" />
          <span className="font-mono text-primary-600 font-bold">{TM}</span>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">{t.tnLabel}</span>
          <input type="range" min={1} max={8} step={1} value={TN}
            onChange={e => setTN(+e.target.value)} className="w-full" />
          <span className="font-mono text-primary-600 font-bold">{TN}</span>
        </label>
      </div>

      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
          {/* Formula */}
          <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.threadTile} = {TM} x {TN} = {fmas} {t.outputElements}
          </text>

          {/* Visual: TM x TN grid */}
          {(() => {
            const cellSize = Math.min(20, 120 / Math.max(TM, TN));
            const gridW = TN * cellSize;
            const gridH = TM * cellSize;
            const startX = 50;
            const startY = 40;
            return (
              <g>
                {/* A fragment column */}
                <rect x={startX - cellSize - 4} y={startY}
                  width={cellSize} height={gridH} rx={2}
                  fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
                <text x={startX - cellSize / 2 - 4} y={startY + gridH + 14}
                  textAnchor="middle" fontSize="7" fill={COLORS.primary} fontFamily={FONTS.mono}>
                  A[{TM}]
                </text>

                {/* B fragment row */}
                <rect x={startX} y={startY - cellSize - 4}
                  width={gridW} height={cellSize} rx={2}
                  fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
                <text x={startX + gridW + 14} y={startY - cellSize / 2}
                  fontSize="7" fill={COLORS.green} fontFamily={FONTS.mono}>
                  B[{TN}]
                </text>

                {/* C output grid */}
                {Array.from({ length: TM }).map((_, r) =>
                  Array.from({ length: TN }).map((_, c) => (
                    <rect key={`${r}-${c}`}
                      x={startX + c * cellSize} y={startY + r * cellSize}
                      width={cellSize - 1} height={cellSize - 1} rx={1}
                      fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.5} />
                  ))
                )}
                <text x={startX + gridW / 2} y={startY + gridH + 14}
                  textAnchor="middle" fontSize="7" fill={COLORS.orange} fontFamily={FONTS.mono}>
                  C[{TM}x{TN}]
                </text>
              </g>
            );
          })()}

          {/* Calculation */}
          <text x={300} y={50} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.perLoopStep}
          </text>
          <text x={310} y={68} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
            {t.sharedMemReads}: TM + TN = {loads} {t.times}
          </text>
          <text x={310} y={86} fontSize="8" fill={COLORS.orange} fontFamily={FONTS.mono}>
            {t.fmaCompute}: TM x TN = {fmas} {t.times}
          </text>

          <line x1={310} y1={94} x2={530} y2={94} stroke="#e2e8f0" strokeWidth={0.5} />

          <text x={310} y={112} fontSize="10" fontWeight="700" fill={qualityColor}
            fontFamily={FONTS.mono}>
            {t.computeToLoad} = {TM}x{TN} / ({TM}+{TN}) = {ratio.toFixed(2)}
          </text>
          <text x={310} y={130} fontSize="9" fontWeight="600" fill={qualityColor}
            fontFamily={FONTS.sans}>
            {qualityLabel}
          </text>

          {/* Ratio bar */}
          <rect x={300} y={140} width={240} height={16} rx={3}
            fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
          <rect x={300} y={140}
            width={Math.min(240, (ratio / 8) * 240)} height={16} rx={3}
            fill={qualityColor} opacity={0.6} />

          {/* Register usage */}
          <rect x={40} y={SVG_H - 70} width={500} height={55} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={SVG_H - 48} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.registerUsage}: {t.accumulator} ({TM}x{TN}={TM * TN}) + {t.fragA} ({TM}) + {t.fragB} ({TN}) = {regsNeeded} {t.registers}
          </text>
          <text x={W / 2} y={SVG_H - 30} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.tradeoff}
          </text>
        </svg>
      </div>
    </div>
  );
}
