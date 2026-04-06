import { useState } from 'react';
import { COLORS } from './shared/colors';

type Mode = 'simple' | 'full';

interface Stage {
  label: string;
  simpleShape: string;
  fullShape: string;
  desc: string;
}

export default function TensorShapeTracker({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [mode, setMode] = useState<Mode>('simple');

  const t = {
    zh: {
      simpleMode: '简化模式 (单头)',
      fullMode: '完整模式 (多头+batch)',
      simplifiedNote: '简化模式省略了 batch (B) 和 多头 (h) 维度',
      stages: [
        { label: 'Input X', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '输入序列的隐藏表示' },
        { label: 'Q = X·Wq', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '线性投影得到所有头的 Q' },
        { label: 'K = X·Wk', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '线性投影得到所有头的 K' },
        { label: 'V = X·Wv', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '线性投影得到所有头的 V' },
        { label: 'reshape', simpleShape: '(S, d_k)', fullShape: '(B, h, S, d_k)', desc: 'reshape + transpose 拆分多头' },
        { label: 'Q·Kᵀ', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: '计算注意力分数矩阵' },
        { label: '÷ √d_k', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: '缩放防止梯度消失' },
        { label: '+ mask', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: '因果遮罩 (可选)' },
        { label: 'softmax', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: '归一化为注意力权重' },
        { label: '× V', simpleShape: '(S, d_k)', fullShape: '(B, h, S, d_k)', desc: '加权求和 Value' },
        { label: 'concat', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: 'transpose + reshape 拼接多头' },
        { label: '× Wo', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: '输出投影' },
      ],
    },
    en: {
      simpleMode: 'Simple Mode (single head)',
      fullMode: 'Full Mode (multi-head+batch)',
      simplifiedNote: 'Simple mode omits batch (B) and multi-head (h) dimensions',
      stages: [
        { label: 'Input X', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: 'Hidden representation of input sequence' },
        { label: 'Q = X·Wq', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: 'Linear projection for all heads Q' },
        { label: 'K = X·Wk', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: 'Linear projection for all heads K' },
        { label: 'V = X·Wv', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: 'Linear projection for all heads V' },
        { label: 'reshape', simpleShape: '(S, d_k)', fullShape: '(B, h, S, d_k)', desc: 'reshape + transpose to split multi-heads' },
        { label: 'Q·Kᵀ', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: 'Compute attention score matrix' },
        { label: '÷ √d_k', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: 'Scale to prevent gradient vanishing' },
        { label: '+ mask', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: 'Causal mask (optional)' },
        { label: 'softmax', simpleShape: '(S, S)', fullShape: '(B, h, S, S)', desc: 'Normalize to attention weights' },
        { label: '× V', simpleShape: '(S, d_k)', fullShape: '(B, h, S, d_k)', desc: 'Weighted sum of Values' },
        { label: 'concat', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: 'transpose + reshape to concatenate heads' },
        { label: '× Wo', simpleShape: '(S, H)', fullShape: '(B, S, H)', desc: 'Output projection' },
      ],
    },
  }[locale];

  const STAGES = t.stages;
  const svgH = STAGES.length * 38 + 10;

  function StageBox({ stage, index, isActive, mode, onClick }: {
    stage: Stage; index: number; isActive: boolean; mode: Mode;
    onClick: () => void;
  }) {
    const shape = mode === 'simple' ? stage.simpleShape : stage.fullShape;
    return (
      <g onClick={onClick} style={{ cursor: 'pointer' }}>
        <rect x={0} y={index * 38} width={280} height={32} rx={6}
          fill={isActive ? COLORS.highlight : COLORS.bgAlt}
          stroke={isActive ? COLORS.primary : COLORS.light}
          strokeWidth={isActive ? 2 : 1} />
        <text x={10} y={index * 38 + 20} fontSize="11" fill={COLORS.dark}
          fontFamily="system-ui" fontWeight={isActive ? '700' : '400'}>
          {stage.label}
        </text>
        <text x={270} y={index * 38 + 20} textAnchor="end" fontSize="10"
          fill={COLORS.primary} fontFamily="monospace" fontWeight="600">
          {shape}
        </text>
      </g>
    );
  }

  return (
    <div className="my-6">
      {/* Mode toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setMode('simple')}
          className={`px-3 py-1 text-sm rounded border ${mode === 'simple'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
        >
          {t.simpleMode}
        </button>
        <button
          onClick={() => setMode('full')}
          className={`px-3 py-1 text-sm rounded border ${mode === 'full'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
        >
          {t.fullMode}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start justify-center">
        {/* Pipeline */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 290 ${svgH}`} className="w-full max-w-xs">
            {STAGES.map((stage, i) => (
              <g key={i}>
                <StageBox stage={stage} index={i} isActive={i === activeIdx}
                  mode={mode} onClick={() => setActiveIdx(i)} />
                {i < STAGES.length - 1 && (
                  <line x1={140} y1={i * 38 + 32} x2={140} y2={(i + 1) * 38}
                    stroke={COLORS.light} strokeWidth={1} />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-sm">
          <div className="text-sm font-semibold text-gray-700 mb-1">
            {STAGES[activeIdx].label}
          </div>
          <div className="text-lg font-mono text-blue-700 mb-2">
            {mode === 'simple' ? STAGES[activeIdx].simpleShape : STAGES[activeIdx].fullShape}
          </div>
          <p className="text-sm text-gray-600">
            {STAGES[activeIdx].desc}
          </p>
          {mode === 'simple' && (
            <p className="text-xs text-gray-400 mt-2">
              {t.simplifiedNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
