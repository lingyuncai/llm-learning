// src/components/interactive/LlamaCppArchitectureComparison.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';

interface ArchitectureComparisonProps {
  locale?: 'zh' | 'en';
}

const t = {
  zh: {
    title: '架构对比：Llama vs GPT-2',
    llama: 'Llama',
    gpt2: 'GPT-2',
    step: '步骤',
    same: '相同',
    different: '不同',
    layerLoop: 'Layer 循环 (x N)',
    inputPhase: '输入阶段',
    layerPhase: '层循环',
    outputPhase: '输出阶段',
    diffTableTitle: '关键差异对比',
    feature: '特性',
    norm: '归一化',
    posEnc: '位置编码',
    qkvProj: 'QKV 投影',
    ffnAct: 'FFN 激活',
    bias: '偏置',
    llamaNorm: 'RMSNorm',
    gpt2Norm: '标准 LayerNorm',
    llamaPos: 'RoPE（旋转位置编码）',
    gpt2Pos: '可学习位置 embedding',
    llamaQkv: '分别投影 Q、K、V',
    gpt2Qkv: '合并 QKV 一次投影',
    llamaFfn: 'SiLU + 并行 gate',
    gpt2Ffn: 'GELU + 顺序',
    llamaBias: '通常无偏置',
    gpt2Bias: '有偏置',
    sameFramework: '尽管积木选择不同，两者共享相同的宏观框架：输入 → 层循环（norm → attn → residual → norm → ffn → residual）→ 输出。',
  },
  en: {
    title: 'Architecture Comparison: Llama vs GPT-2',
    llama: 'Llama',
    gpt2: 'GPT-2',
    step: 'Step',
    same: 'Same',
    different: 'Different',
    layerLoop: 'Layer Loop (x N)',
    inputPhase: 'Input',
    layerPhase: 'Layer Loop',
    outputPhase: 'Output',
    diffTableTitle: 'Key Differences',
    feature: 'Feature',
    norm: 'Normalization',
    posEnc: 'Position Encoding',
    qkvProj: 'QKV Projection',
    ffnAct: 'FFN Activation',
    bias: 'Bias',
    llamaNorm: 'RMSNorm',
    gpt2Norm: 'Standard LayerNorm',
    llamaPos: 'RoPE (Rotary Position Embedding)',
    gpt2Pos: 'Learnable position embedding',
    llamaQkv: 'Separate Q, K, V projections',
    gpt2Qkv: 'Merged QKV single projection',
    llamaFfn: 'SiLU + parallel gate',
    gpt2Ffn: 'GELU + sequential',
    llamaBias: 'Typically no bias',
    gpt2Bias: 'Has bias',
    sameFramework: 'Despite different building blocks, both share the same macro framework: input → layer loop (norm → attn → residual → norm → ffn → residual) → output.',
  },
};

interface BuildStep {
  id: string;
  label: string;
  sublabel: string;
  phase: 'input' | 'layer' | 'output';
  /** Whether this step is the same in both architectures */
  same: boolean;
}

function getSteps(locale: 'zh' | 'en'): { llama: BuildStep[]; gpt2: BuildStep[] } {
  if (locale === 'zh') {
    return {
      llama: [
        { id: 'embd', label: 'build_inp_embd', sublabel: 'token → embedding', phase: 'input', same: true },
        { id: 'pos', label: 'build_inp_pos', sublabel: 'RoPE 位置输入', phase: 'input', same: false },
        { id: 'norm1', label: 'build_norm (RMSNorm)', sublabel: '注意力前归一化', phase: 'layer', same: false },
        { id: 'qkv', label: '分别 Q/K/V 投影', sublabel: 'build_lora_mm × 3', phase: 'layer', same: false },
        { id: 'rope', label: 'RoPE 旋转编码', sublabel: 'ggml_rope_ext(Q, K)', phase: 'layer', same: false },
        { id: 'attn', label: 'build_attn', sublabel: '注意力计算 + 输出投影', phase: 'layer', same: true },
        { id: 'res1', label: '残差连接', sublabel: 'cur + inpL', phase: 'layer', same: true },
        { id: 'norm2', label: 'build_norm (RMSNorm)', sublabel: 'FFN 前归一化', phase: 'layer', same: false },
        { id: 'ffn', label: 'SiLU FFN (并行 gate)', sublabel: 'build_ffn / build_moe_ffn', phase: 'layer', same: false },
        { id: 'res2', label: '残差连接', sublabel: 'cur + ffn_inp', phase: 'layer', same: true },
        { id: 'outnorm', label: 'build_norm (RMSNorm)', sublabel: '最终归一化', phase: 'output', same: false },
        { id: 'logits', label: 'build_lora_mm → logits', sublabel: '输出投影', phase: 'output', same: true },
      ],
      gpt2: [
        { id: 'embd', label: 'build_inp_embd', sublabel: 'token → embedding', phase: 'input', same: true },
        { id: 'pos', label: 'build_inp_pos + 加法', sublabel: '可学习位置 embedding 叠加', phase: 'input', same: false },
        { id: 'norm1', label: 'build_norm (LayerNorm)', sublabel: '注意力前归一化', phase: 'layer', same: false },
        { id: 'qkv', label: '合并 QKV 一次投影', sublabel: 'build_lora_mm + view 拆分', phase: 'layer', same: false },
        { id: 'rope', label: '(无 RoPE)', sublabel: '位置已在 embedding 中编码', phase: 'layer', same: false },
        { id: 'attn', label: 'build_attn', sublabel: '注意力计算 + 输出投影', phase: 'layer', same: true },
        { id: 'res1', label: '残差连接', sublabel: 'cur + inpL', phase: 'layer', same: true },
        { id: 'norm2', label: 'build_norm (LayerNorm)', sublabel: 'FFN 前归一化', phase: 'layer', same: false },
        { id: 'ffn', label: 'GELU FFN (顺序)', sublabel: 'build_ffn (LLM_FFN_SEQ)', phase: 'layer', same: false },
        { id: 'res2', label: '残差连接', sublabel: 'cur + ffn_inp', phase: 'layer', same: true },
        { id: 'outnorm', label: 'build_norm (LayerNorm)', sublabel: '最终归一化', phase: 'output', same: false },
        { id: 'logits', label: 'build_lora_mm → logits', sublabel: '输出投影', phase: 'output', same: true },
      ],
    };
  }
  return {
    llama: [
      { id: 'embd', label: 'build_inp_embd', sublabel: 'token → embedding', phase: 'input', same: true },
      { id: 'pos', label: 'build_inp_pos', sublabel: 'RoPE position input', phase: 'input', same: false },
      { id: 'norm1', label: 'build_norm (RMSNorm)', sublabel: 'Pre-attention norm', phase: 'layer', same: false },
      { id: 'qkv', label: 'Separate Q/K/V projections', sublabel: 'build_lora_mm × 3', phase: 'layer', same: false },
      { id: 'rope', label: 'RoPE rotation', sublabel: 'ggml_rope_ext(Q, K)', phase: 'layer', same: false },
      { id: 'attn', label: 'build_attn', sublabel: 'Attention + output proj', phase: 'layer', same: true },
      { id: 'res1', label: 'Residual connection', sublabel: 'cur + inpL', phase: 'layer', same: true },
      { id: 'norm2', label: 'build_norm (RMSNorm)', sublabel: 'Pre-FFN norm', phase: 'layer', same: false },
      { id: 'ffn', label: 'SiLU FFN (parallel gate)', sublabel: 'build_ffn / build_moe_ffn', phase: 'layer', same: false },
      { id: 'res2', label: 'Residual connection', sublabel: 'cur + ffn_inp', phase: 'layer', same: true },
      { id: 'outnorm', label: 'build_norm (RMSNorm)', sublabel: 'Final norm', phase: 'output', same: false },
      { id: 'logits', label: 'build_lora_mm → logits', sublabel: 'Output projection', phase: 'output', same: true },
    ],
    gpt2: [
      { id: 'embd', label: 'build_inp_embd', sublabel: 'token → embedding', phase: 'input', same: true },
      { id: 'pos', label: 'build_inp_pos + add', sublabel: 'Learnable pos embedding added', phase: 'input', same: false },
      { id: 'norm1', label: 'build_norm (LayerNorm)', sublabel: 'Pre-attention norm', phase: 'layer', same: false },
      { id: 'qkv', label: 'Merged QKV projection', sublabel: 'build_lora_mm + view split', phase: 'layer', same: false },
      { id: 'rope', label: '(No RoPE)', sublabel: 'Position encoded in embedding', phase: 'layer', same: false },
      { id: 'attn', label: 'build_attn', sublabel: 'Attention + output proj', phase: 'layer', same: true },
      { id: 'res1', label: 'Residual connection', sublabel: 'cur + inpL', phase: 'layer', same: true },
      { id: 'norm2', label: 'build_norm (LayerNorm)', sublabel: 'Pre-FFN norm', phase: 'layer', same: false },
      { id: 'ffn', label: 'GELU FFN (sequential)', sublabel: 'build_ffn (LLM_FFN_SEQ)', phase: 'layer', same: false },
      { id: 'res2', label: 'Residual connection', sublabel: 'cur + ffn_inp', phase: 'layer', same: true },
      { id: 'outnorm', label: 'build_norm (LayerNorm)', sublabel: 'Final norm', phase: 'output', same: false },
      { id: 'logits', label: 'build_lora_mm → logits', sublabel: 'Output projection', phase: 'output', same: true },
    ],
  };
}

const PHASE_COLORS = {
  input: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  layer: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  output: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
};

const DIFF_HIGHLIGHT = {
  bg: 'bg-amber-50',
  border: 'border-amber-400',
  text: 'text-amber-900',
  ring: 'ring-2 ring-amber-300',
};

const SAME_STYLE = {
  bg: 'bg-gray-50',
  border: 'border-gray-200',
  text: 'text-gray-600',
};

function StepCard({ step, highlighted }: { step: BuildStep; highlighted: boolean }) {
  const style = highlighted ? DIFF_HIGHLIGHT : SAME_STYLE;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-lg border px-3 py-2 text-center transition-all
        ${style.bg} ${style.border} ${style.text}
        ${highlighted ? DIFF_HIGHLIGHT.ring : ''}
      `}
    >
      <div className="font-mono text-xs font-semibold leading-tight">{step.label}</div>
      <div className="text-[10px] opacity-70 mt-0.5 leading-tight">{step.sublabel}</div>
    </motion.div>
  );
}

function ArchColumn({
  archName,
  steps,
  highlightDiffs,
  locale,
  color,
}: {
  archName: string;
  steps: BuildStep[];
  highlightDiffs: boolean;
  locale: 'zh' | 'en';
  color: string;
}) {
  const l = t[locale];

  const inputSteps = steps.filter((s) => s.phase === 'input');
  const layerSteps = steps.filter((s) => s.phase === 'layer');
  const outputSteps = steps.filter((s) => s.phase === 'output');

  const phaseLabel = (phase: 'input' | 'layer' | 'output') => {
    switch (phase) {
      case 'input': return l.inputPhase;
      case 'layer': return l.layerPhase;
      case 'output': return l.outputPhase;
    }
  };

  const renderPhase = (phase: 'input' | 'layer' | 'output', phaseSteps: BuildStep[]) => {
    const pc = PHASE_COLORS[phase];
    return (
      <div className={`rounded-lg border ${pc.border} ${pc.bg} p-2 space-y-1.5`}>
        <div className={`text-[10px] font-semibold uppercase tracking-wide ${pc.text} mb-1`}>
          {phaseLabel(phase)}
          {phase === 'layer' && <span className="ml-1 opacity-60">(x N)</span>}
        </div>
        {phaseSteps.map((step, i) => (
          <StepCard key={`${step.id}-${i}`} step={step} highlighted={highlightDiffs && !step.same} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0">
      <div
        className="text-center text-sm font-bold mb-3 pb-1 border-b-2"
        style={{ borderColor: color, color }}
      >
        {archName}
      </div>
      <div className="space-y-2">
        {renderPhase('input', inputSteps)}
        {renderPhase('layer', layerSteps)}
        {renderPhase('output', outputSteps)}
      </div>
    </div>
  );
}

function DiffTable({ locale }: { locale: 'zh' | 'en' }) {
  const l = t[locale];
  const rows = [
    { feature: l.norm, llama: l.llamaNorm, gpt2: l.gpt2Norm },
    { feature: l.posEnc, llama: l.llamaPos, gpt2: l.gpt2Pos },
    { feature: l.qkvProj, llama: l.llamaQkv, gpt2: l.gpt2Qkv },
    { feature: l.ffnAct, llama: l.llamaFfn, gpt2: l.gpt2Ffn },
    { feature: l.bias, llama: l.llamaBias, gpt2: l.gpt2Bias },
  ];

  return (
    <div className="mt-4">
      <div className="text-xs font-semibold text-gray-600 mb-2">{l.diffTableTitle}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-1.5 border border-gray-200 font-semibold">{l.feature}</th>
              <th className="text-left px-3 py-1.5 border border-gray-200 font-semibold text-indigo-700">{l.llama}</th>
              <th className="text-left px-3 py-1.5 border border-gray-200 font-semibold text-teal-700">{l.gpt2}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-1.5 border border-gray-200 font-medium text-gray-700">{row.feature}</td>
                <td className="px-3 py-1.5 border border-gray-200 text-indigo-600">{row.llama}</td>
                <td className="px-3 py-1.5 border border-gray-200 text-teal-600">{row.gpt2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LlamaCppArchitectureComparison({ locale = 'zh' }: ArchitectureComparisonProps) {
  const l = t[locale];
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const steps = useMemo(() => getSteps(locale), [locale]);

  return (
    <div className="my-6 p-4 rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700">{l.title}</h4>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={highlightDiffs}
            onChange={(e) => setHighlightDiffs(e.target.checked)}
            className="accent-amber-500 w-3.5 h-3.5"
          />
          {l.different}
        </label>
      </div>

      {/* Side-by-side architecture columns */}
      <div className="flex gap-4">
        <ArchColumn
          archName={l.llama}
          steps={steps.llama}
          highlightDiffs={highlightDiffs}
          locale={locale}
          color="#4f46e5"
        />
        <ArchColumn
          archName={l.gpt2}
          steps={steps.gpt2}
          highlightDiffs={highlightDiffs}
          locale={locale}
          color="#0d9488"
        />
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-[10px] text-gray-500 justify-center">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded border border-gray-200 bg-gray-50" />
          {l.same}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded border border-amber-400 bg-amber-50 ring-1 ring-amber-300" />
          {l.different}
        </span>
      </div>

      {/* Diff table */}
      <DiffTable locale={locale} />

      {/* Summary */}
      <div className="mt-3 text-xs text-gray-500 italic text-center">
        {l.sameFramework}
      </div>
    </div>
  );
}
