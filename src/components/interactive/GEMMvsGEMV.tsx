// src/components/interactive/GEMMvsGEMV.tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

const d = 6; // simplified dimension
const n = 4; // batch/seq length for Prefill

function MatrixViz({ rows, cols, activeRow, activeCol, color, label }: {
  rows: number; cols: number; activeRow?: number; activeCol?: number;
  color: string; label: string;
}) {
  const cs = 20;
  return (
    <div className="flex flex-col items-center">
      <div className="text-[9px] text-gray-500 mb-0.5">{label}</div>
      <svg viewBox={`0 0 ${cols * cs} ${rows * cs}`} width={cols * cs} height={rows * cs}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const isActive = (activeRow !== undefined && r === activeRow) ||
              (activeCol !== undefined && c === activeCol);
            return (
              <rect key={`${r}-${c}`} x={c * cs} y={r * cs}
                width={cs - 1} height={cs - 1} rx={2}
                fill={isActive ? color : '#f3f4f6'}
                stroke="#d1d5db" strokeWidth={0.3} />
            );
          })
        )}
      </svg>
    </div>
  );
}

function GPUGrid({ active, total, label }: { active: number; total: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[9px] text-gray-500 mb-0.5">{label}</div>
      <div className="grid grid-cols-4 gap-0.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: i < active ? COLORS.green : '#e5e7eb' }} />
        ))}
      </div>
      <div className="text-[8px] text-gray-400 mt-0.5">{((active / total) * 100).toFixed(0)}% 利用率</div>
    </div>
  );
}

export default function GEMMvsGEMV() {
  const steps = [
    {
      title: 'GEMM (Prefill) vs GEMV (Decode)',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Prefill 做矩阵×矩阵 (GEMM)，Decode 做向量×矩阵 (GEMV)。
            关键差异在于<strong>数据复用率</strong>。
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-sm font-semibold mb-2" style={{ color: COLORS.green }}>Prefill (GEMM)</div>
              <div className="text-xs text-gray-500 mb-2">({n}×{d}) × ({d}×{d})</div>
              <div className="flex items-center justify-center gap-2">
                <MatrixViz rows={n} cols={d} color={COLORS.valid} label={`输入 (${n}×${d})`} />
                <span className="text-gray-400">×</span>
                <MatrixViz rows={d} cols={d} activeCol={0} color={COLORS.highlight} label={`权重 (${d}×${d})`} />
              </div>
              <p className="text-xs text-gray-500 mt-2">权重的每列被 {n} 行复用 → 数据复用率高</p>
              <GPUGrid active={14} total={16} label="GPU 核心" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold mb-2" style={{ color: COLORS.red }}>Decode (GEMV)</div>
              <div className="text-xs text-gray-500 mb-2">(1×{d}) × ({d}×{d})</div>
              <div className="flex items-center justify-center gap-2">
                <MatrixViz rows={1} cols={d} color={COLORS.valid} label={`输入 (1×${d})`} />
                <span className="text-gray-400">×</span>
                <MatrixViz rows={d} cols={d} activeCol={0} color={COLORS.highlight} label={`权重 (${d}×${d})`} />
              </div>
              <p className="text-xs text-gray-500 mt-2">权重的每列只被 1 行用一次 → 加载即丢弃</p>
              <GPUGrid active={4} total={16} label="GPU 核心" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
