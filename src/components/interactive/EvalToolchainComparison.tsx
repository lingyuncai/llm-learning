// src/components/interactive/EvalToolchainComparison.tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Dimension {
  zh: string;
  en: string;
}

interface Toolchain {
  name: string;
  icon: string;
  color: string;
  dimensions: {
    scenario: Dimension;
    formats: Dimension;
    metrics: Dimension;
    coverage: Dimension;
    hardware: Dimension;
  };
}

const DIMENSION_LABELS: Record<string, { zh: string; en: string }> = {
  scenario: { zh: '适用场景', en: 'Use Case' },
  formats:  { zh: '支持格式', en: 'Supported Formats' },
  metrics:  { zh: '评估指标', en: 'Metrics' },
  coverage: { zh: 'Benchmark 覆盖', en: 'Benchmark Coverage' },
  hardware: { zh: '硬件平台', en: 'Hardware' },
};

const TOOLCHAINS: Toolchain[] = [
  {
    name: 'lm-evaluation-harness',
    icon: '\ud83d\udcca',
    color: COLORS.primary,
    dimensions: {
      scenario:  { zh: '通用模型评估，量化前后对比', en: 'General model evaluation, pre/post quantization comparison' },
      formats:   { zh: 'HuggingFace, vLLM, SGLang, GGUF (有限支持)', en: 'HuggingFace, vLLM, SGLang, GGUF (limited support)' },
      metrics:   { zh: '所有 benchmark 分数 (accuracy, F1, pass@k 等)', en: 'All benchmark scores (accuracy, F1, pass@k, etc.)' },
      coverage:  { zh: '最广：60+ 主流 benchmark，数百子任务', en: 'Broadest: 60+ mainstream benchmarks, hundreds of subtasks' },
      hardware:  { zh: '主要 GPU (NVIDIA)，CPU 可用但慢', en: 'Primarily GPU (NVIDIA), CPU usable but slow' },
    },
  },
  {
    name: 'OpenVINO (Optimum Intel + NNCF)',
    icon: '\ud83d\udd27',
    color: '#0071c5',
    dimensions: {
      scenario:  { zh: 'Intel 硬件部署评估，accuracy-aware 量化', en: 'Intel hardware deployment evaluation, accuracy-aware quantization' },
      formats:   { zh: 'OpenVINO IR (从 HuggingFace 转换)', en: 'OpenVINO IR (converted from HuggingFace)' },
      metrics:   { zh: 'benchmark 分数 + 吞吐/延迟 (benchmark_app)', en: 'Benchmark scores + throughput/latency (benchmark_app)' },
      coverage:  { zh: '通过 lm-eval-harness 集成覆盖主流 benchmark', en: 'Covers mainstream benchmarks via lm-eval-harness integration' },
      hardware:  { zh: 'Intel CPU / iGPU / Arc GPU（核心优势）', en: 'Intel CPU / iGPU / Arc GPU (core advantage)' },
    },
  },
  {
    name: 'llama.cpp perplexity',
    icon: '\ud83e\udd99',
    color: COLORS.green,
    dimensions: {
      scenario:  { zh: 'GGUF 量化质量快速检查', en: 'GGUF quantization quality quick check' },
      formats:   { zh: '仅 GGUF', en: 'GGUF only' },
      metrics:   { zh: 'Perplexity (WikiText-2 等)', en: 'Perplexity (WikiText-2, etc.)' },
      coverage:  { zh: '仅 perplexity \u2014 不含 task-specific benchmark', en: 'Perplexity only \u2014 no task-specific benchmarks' },
      hardware:  { zh: 'CPU / GPU / Apple Silicon（跨平台）', en: 'CPU / GPU / Apple Silicon (cross-platform)' },
    },
  },
];

const DECISION_GUIDE: { condition: { zh: string; en: string }; tool: string; color: string }[] = [
  { condition: { zh: '需要全面评估多个 benchmark', en: 'Need comprehensive multi-benchmark evaluation' }, tool: 'lm-evaluation-harness', color: COLORS.primary },
  { condition: { zh: '在 Intel 平台部署，需要精度+性能联合评估', en: 'Deploying on Intel, need accuracy + performance evaluation' }, tool: 'OpenVINO', color: '#0071c5' },
  { condition: { zh: '快速验证 GGUF 量化质量', en: 'Quick GGUF quantization quality check' }, tool: 'llama.cpp perplexity', color: COLORS.green },
];

export default function EvalToolchainComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <h3 className="text-base font-bold text-center mb-1" style={{ color: COLORS.dark }}>
        {t('精度评估工具链对比', 'Accuracy Evaluation Toolchain Comparison')}
      </h3>
      <p className="text-xs text-center mb-4" style={{ color: COLORS.mid }}>
        {t('三种主流工具链的定位与适用场景', 'Positioning and use cases for three mainstream toolchains')}
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {TOOLCHAINS.map((tc, i) => (
          <div
            key={tc.name}
            className="rounded-lg p-3 transition-all duration-200"
            style={{
              borderTop: `3px solid ${tc.color}`,
              border: `1px solid ${hovered === i ? tc.color : COLORS.light}`,
              borderTopWidth: '3px',
              borderTopColor: tc.color,
              background: hovered === i ? `${tc.color}08` : COLORS.bg,
              boxShadow: hovered === i ? `0 2px 8px ${tc.color}20` : 'none',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="text-center mb-2">
              <span className="text-xl">{tc.icon}</span>
              <h4 className="text-xs font-bold mt-1" style={{ color: tc.color }}>
                {tc.name}
              </h4>
            </div>

            <div className="space-y-2">
              {(Object.keys(DIMENSION_LABELS) as (keyof typeof DIMENSION_LABELS)[]).map(dim => (
                <div key={dim}>
                  <div className="text-[10px] font-semibold mb-0.5" style={{ color: COLORS.mid }}>
                    {DIMENSION_LABELS[dim][locale]}
                  </div>
                  <div className="text-[11px] leading-tight" style={{ color: COLORS.dark }}>
                    {tc.dimensions[dim as keyof Toolchain['dimensions']][locale]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Decision guide */}
      <div className="p-3 rounded-lg" style={{ background: COLORS.bgAlt, border: `1px solid ${COLORS.light}` }}>
        <p className="text-xs font-bold mb-2" style={{ color: COLORS.dark }}>
          {t('决策指南', 'Decision Guide')}
        </p>
        <div className="space-y-1.5">
          {DECISION_GUIDE.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span style={{ color: item.color, fontWeight: 700 }}>{'\u2192'}</span>
              <span style={{ color: COLORS.dark }}>
                {item.condition[locale]}
                <span className="font-semibold ml-1" style={{ color: item.color }}>
                  {'\u2192'} {item.tool}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
